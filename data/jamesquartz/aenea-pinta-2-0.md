# JamesQuartz/aenea-pinta-2.0

## Resumen

Pinta-2.0 es un enrutador semántico (semantic router) desarrollado por JamesQuartz bajo el paraguas del proyecto AENEA. No es un modelo generativo: su función es clasificar un prompt entrante en uno de nueve dominios de despacho (SyntaxDevOps, Code, Creative, RAG, Architecture, Math, Knowledge, Compliance y Chat) y emitir un token de enrutamiento que un sistema posterior utiliza para seleccionar el modelo experto o la herramienta adecuada. El modelo se anuncia como sucesor del Pinta-1.2 Mini y está pensado para clasificación siempre activa en enjambres de agentes, sidecars de CLI y despacho en el borde (edge).

Técnicamente, Pinta-2.0 es un transformer de 74 millones de parámetros con arquitectura Cittern-2.0 (24 capas), tamaño oculto de 768 y 12 cabezas de atención con atención ortogonal Block Householder de 12 reflexiones y block_size 64. Emplea un vocabulario de 12.000 tokens (tokenizer QT-Cittern-12k) y una ventana de contexto de 2.048 tokens. La cabeza de enrutamiento es causal, con forma [B, S, V], y se restringe a una rebanada de 9 tokens reservados.

Su relevancia radica en el compromiso entre latencia y precisión: declara un 92,45 % de exactitud estricta en el Balanced Routing Benchmark v6 con una latencia p50 de aproximadamente 8 ms en una RTX 4090, manteniendo el modelo por debajo de los 10 ms de inferencia en GPU. Todo el repositorio ocupa 1,4 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Cittern-2.0 (24 capas), atencion ortogonal Block Householder con 12 reflexiones y block_size 64 |
| Parametros totales | 74M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | bf16, fp16 y ONNX fp32 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (bf16/fp16) y ONNX (fp32); safetensors no confirmado en la informacion disponible |
| Tamano oculto | 768 |
| Cabezas de atencion | 12 |
| Vocabulario | 12.000 tokens (QT-Cittern-12k) |
| Cabeza de enrutamiento | Causal [B, S, V] con rebanada de 9 tokens reservados |
| Clases de salida | 9 dominios de despacho |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Pinta-2.0 no sigue el esquema de un transformer convencional de propósito general. La arquitectura Cittern-2.0 combine bloques transformer de 24 capas con un mecanismo de atención ortogonal basado en Block Householder, con 12 reflexiones y block_size 64, lo que según el autor aporta estabilidad y separación de dominios. El modelo tiene 768 dimensiones ocultas y 12 cabezas. La cabeza de enrutamiento no genera texto: predice directamente el siguiente token que emitiría un modelo generativo completo, pero lo hace en un único forward pass sobre una rebanada de 9 tokens reservados (`<|reserved_23|>` a `<|reserved_31|>`).

El autor indica que la cabeza de enrutamiento se entrenó sobre un conjunto auditado de 57.968 registros, con pipelines de limpieza de datos destinados a eliminar el "template collapse" en los dominios Creative y RAG. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se empleó RLHF o DPO. Tampoco se especifica si hubo una fase de ajuste por instrucciones, algo coherente con un modelo puramente clasificador.

La elección del tokenizer es una decisión de diseño explícita: el vocabulario de 12.000 tokens mantiene la matriz de embeddings y la cabeza softmax en aproximadamente 36 MB, frente a los ~393 MB que exigiría un vocabulario de 128.000 tokens, lo que permitiría conservar la latencia sub-10 ms en el borde. El autor documenta comparativas de densidad de compresión (TokenizerBench sobre Bash, lenguajes de programación, idiomas humanos y FLORES-200), aunque no se incluyen cifras en el texto disponible.

## Capacidades

- Clasificación de prompts en 9 dominios de despacho: SyntaxDevOps, Code, Creative, RAG, Architecture, Math, Knowledge, Compliance y Chat.
- Emisión de un token de enrutamiento por prompt (`<|reserved_23|>` a `<|reserved_31|>`), consumible por sistemas posteriores para seleccionar modelo experto o herramienta.
- Routing de un solo paso (single forward pass), sin generación de texto.
- Uso directo con softmax en crudo sobre los 9 logits de dominio.
- Diseñado para inferencia de baja latencia en el borde (sub-10 ms declarado).
- Compatibilidad con exportación a ONNX (fp32) además de PyTorch (bf16/fp16).
- Capacidades multilingües: no soportadas en producción; el modelo está entrenado exclusivamente con datos de enrutamiento en inglés, aunque el tokenizer conserva representación estructural para una futura expansión.
- No dispone de tool calling, function calling, agentes multi-step, visión ni audio; no es un modelo conversacional ni de razonamiento generativo.
- No dispone de modo "thinking" ni de decodificación especulativa aplicable.

## Casos de uso

- Despacho de prompts en enjambres de agentes: cada solicitud se clasifica en una sola pasada y se enruta al experto adecuado (por ejemplo, Math a un modelo de razonamiento matemático y Code a un modelo especializado en código), reduciendo el coste frente a enviar todo el tráfico a un modelo grande.
- Gate de cumplimiento normativo en empresa: con una precisión declarada de 0,99 en el dominio Compliance, el modelo puede actuar como primera barrera que desvía consultas legales, médicas o de política hacia motores de revisión específicos antes de que lleguen a un modelo generativo.
- Sidecar de CLI para desarrolladores: integrado como proceso local, clasifica cada comando o consulta del terminal y decide si se resuelve con un formateador, un linter, un motor de plantillas o un modelo de código, manteniendo latencia de milisegundos.
- Enrutamiento en pipelines RAG: con F1 declarado de 0,98 en el dominio RAG, distingue las consultas que requieren recuperación documental de las que no, evitando recuperaciones innecesarias y ahorrando coste de indexado.
- Enrutador de despacho para plataformas SaaS multi-modelo: selecciona dinámicamente entre modelos de chat, código, matemáticas o conocimiento general según la intención detectada, con un único componente de 74M parámetros.
- Filtrado previo en asistentes conversacionales: con F1 0,98 en Chat y 0,98 en Compliance, separa conversación abierta de consultas sensibles antes de derivar al modelo correspondiente.
- Clasificación de intención en el borde (edge): al caber en cualquier GPU de consumo y con variantes ONNX, puede desplegarse en dispositivos con recursos limitados para preclasificar tráfico antes de enviarlo a la nube.
- Enrutamiento en sistemas de agentes con restricciones de coste: evita invocar modelos grandes para tareas de formateo, regex o conversión de datos que resuelven herramientas ligeras.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card. Las métricas de accuracy y F1 figuran como no verificadas (`verified: false`) en el model-index.

| Metrica | Pinta-1.1 (226M) | Pinta-1.2 Mini (50M) | Pinta-2.0 (74M) |
|---|---|---|---|
| Strict accuracy | 79,22 % | 91,51 % | 92,45 % |
| Macro F1 | no disponible | 0,91 | 0,92 |
| Weighted F1 | no disponible | 0,92 | 0,92 |
| Latencia (p50, RTX 4090) | ~12 ms | ~6 ms | ~8 ms |

Conjunto de evaluación: Balanced Routing Benchmark v6, 1.060 prompts en 9 dominios, sin solapamiento con entrenamiento, solo en inglés.

Rendimiento por dominio (v6):

| Dominio | Precision | Recall | F1 |
|---|---|---|---|
| SyntaxDevOps | 0,94 | 0,76 | 0,84 |
| Code | 0,83 | 0,83 | 0,83 |
| Creative | 0,94 | 0,88 | 0,91 |
| RAG | 0,96 | 0,99 | 0,98 |
| Architecture | 0,93 | 0,94 | 0,93 |
| Math | 0,91 | 1,00 | 0,95 |
| Knowledge | 0,84 | 0,96 | 0,89 |
| Compliance | 0,99 | 0,97 | 0,98 |
| Chat | 0,99 | 0,97 | 0,98 |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 148 MB en bf16/fp16 (74M parámetros) y aproximadamente 296 MB en fp32/ONNX. Estas cifras son estimaciones derivadas del número de parámetros, no datos publicados por el autor.
- Memoria de caché KV estimada para el contexto completo de 2.048 tokens: aproximadamente 144 MB en fp16, calculada a partir de 24 capas, 12 cabezas y dimensión de cabeza 64.
- Huella total de inferencia estimada: en torno a 300-450 MB en fp16/bf16 para una secuencia de contexto completo.
- GPU recomendadas: el autor reporta latencia p50 de ~8 ms en RTX 4090. Cualquier GPU de consumo moderna (RTX 3060 en adelante) debería ejecutar el modelo con holgura dado su tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos ~1 GB de VRAM libre, e incluso en iGPU o CPU para variantes ONNX fp32.
- Opciones de despliegue: ONNX Runtime (formato ONNX fp32 incluido) y PyTorch mediante la librería `cartan_olm` referenciada en la model card. No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~8 ms p50 en RTX 4090 según el autor (~125 peticiones/s por GPU en condiciones ideales de batch 1); no se publican cifras de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Strict accuracy (v6) | Latencia p50 (RTX 4090) | Licencia |
|---|---|---|---|---|---|---|
| Pinta-2.0 | 74M | 2.048 | Routing 9 dominios | 92,45 % | ~8 ms | Apache-2.0 |
| Pinta-1.2 Mini | 50M | no disponible | Routing 9 dominios | 91,51 % | ~6 ms | no disponible |
| Pinta-1.1 | 226M | no disponible | Routing 9 dominios | 79,22 % | ~12 ms | no disponible |

No se dispone de datos de benchmarks que permitan comparar Pinta-2.0 con enrutadores semánticos externos de otros fabricantes (por ejemplo, clasificadores basados en embeddings de sentence-transformers), por lo que dicha comparativa queda como no disponible.

## Limitaciones y advertencias

- Benchmark no verificado: tanto la accuracy como el F1 figuran con `verified: false` en el model-index, es decir, son cifras autodeclaradas por el autor sin validación independiente.
- Modelo puramente clasificador: no genera texto, no razona, no ejecuta tool calling ni soporta agentes multi-step. No debe presentarse como un LLM.
- Solo inglés: el modelo está entrenado exclusivamente con datos de enrutamiento en inglés; su uso con prompts en castellano u otros idiomas no está validado y probablemente degrade la precisión.
- Ventana de contexto de 2.048 tokens: los prompts que excedan esa longitud deberán truncarse o resumirse antes de la clasificación, con el riesgo de perder la intención real.
- Sesgos: no se publica ninguna evaluación de sesgos ni de equidad sobre el dataset de entrenamiento de 57.968 registros.
- Riesgo de error de enrutamiento: los dominios Code (F1 0,83) y SyntaxDevOps (F1 0,83, con recall 0,76) son los más débiles; una clasificación errónea puede derivar una consulta al modelo experto equivocado. Conviene implementar umbrales de confianza y una clase de reserva (Knowledge) como fallback.
- Benchmark de evaluación propietario: Balanced Routing Benchmark v6 es un conjunto interno del autor (1.060 prompts), no un estándar público reproducible por terceros.
- Fiabilidad del repositorio: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia total de validación por parte de la comunidad.
- Código de inferencia no estándar: la model card referencia la librería `cartan_olm` y una arquitectura propietaria (Cittern-2.0), por lo que no es directamente compatible con `transformers` sin adaptación.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y sin garantías; no se documentan restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JamesQuartz/aenea-pinta-2.0
- No se han proporcionado en la información disponible otros enlaces a papers, blogs, repositorios de código o demos.
