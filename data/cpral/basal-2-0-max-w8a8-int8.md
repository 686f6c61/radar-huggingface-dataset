# cpral/basal-2.0-max-W8A8-INT8

## Resumen

`cpral/basal-2.0-max-W8A8-INT8` es una cuantización de 8 bits del modelo `Remek/basal-2.0-max`, publicada por el usuario `cpral` en Hugging Face. Se trata de un checkpoint de inferencia en formato safetensors con cuantización W8A8 INT8 (pesos y activaciones a 8 bits) generado con la librería `compressed-tensors`, el formato que consumen motores como vLLM o SGLang. El resultado ocupa 11,4 GB frente a los aproximadamente 22,3 GB que requeriría el mismo modelo en BF16.

El modelo cuenta con 11.167.748.096 parámetros (unos 11,17 mil millones), según los metadatos reales de los tensores del repositorio, y pertenece a la familia de arquitecturas Llama según el tag `llama` del propio repositorio. La licencia declarada es Apache-2.0.

La relevancia de esta publicación es, por ahora, limitada y experimental: el repositorio se creó y actualizó en un intervalo de nueve minutos, acumula cero descargas y cero valoraciones, y su model card se reduce a un enlace al modelo base y la cadena "ale W8A8 INT8". No se aporta información sobre el entrenamiento del modelo original, la longitud de contexto, los idiomas soportados ni evaluación alguna de la pérdida de calidad introducida por la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama (tag `llama` del repo) |
| Parametros totales | 11.167.748.096 (11,17 B) |
| Parametros activos | No aplica segun la informacion disponible; sin indicios de arquitectura MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 INT8 (pesos y activaciones a 8 bits) mediante `compressed-tensors`; no hay GGUF ni otras variantes en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (declarada en el repo; la licencia del modelo base no se ha podido verificar con la informacion proporcionada) |
| Formato de pesos | safetensors con metadatos `compressed-tensors`, 8-bit |
| Modelo base | `Remek/basal-2.0-max` |
| Tamano del repositorio | 11,4 GB |
| Fecha de publicacion | 2026-10-21 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La informacion disponible no documenta ni la arquitectura interna ni el proceso de entrenamiento del modelo base. El unico dato estructural fiable es el tag `llama`, que indica que el checkpoint se carga con la implementacion Llama de Transformers: un transformer decoder-only con atención causal, sin rastro de mecanismos MoE, SSM ni arquitecturas híbridas en los metadatos. Tampoco se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni si emplea GQA, datos imprescindibles para calcular el coste de la caché KV.

Lo que sí está documentado, por la naturaleza del propio artefacto, es la transformación aplicada: una cuantización post-entrenamiento W8A8 INT8 con `compressed-tensors` (el formato que produce `llm-compressor`), en la que tanto los pesos como las activaciones se representan en enteros de 8 bits con escalas de cuantización almacenadas junto a los tensores. Este esquema explota los kernels INT8 de las GPU modernas y reduce la huella de memoria aproximadamente a la mitad respecto a BF16, a cambio de una pérdida de precisión que el autor no ha cuantificado en ningún momento. No consta que se haya realizado ningún ajuste fino posterior a la cuantización, ni evaluación de perplejidad, ni comparación con el checkpoint original.

## Capacidades

La model card no describe ninguna capacidad concreta y no se ha publicado ninguna evaluación, por lo que todo lo que sigue debe considerarse herencia esperada del modelo base y no una capacidad verificada:

- Generación de texto y conversación multi-turno: es la función básica de un decoder-only de este tamaño, pero se desconoce si el checkpoint base está ajustado para instrucciones o si es un modelo base sin alinear.
- Razonamiento y matemáticas: no hay datos que permitan confirmar ni descartar un modo de razonamiento explícito (*thinking*) ni cadena de pensamiento.
- Generación de código: previsible en un modelo de 11 B, sin confirmación empírica.
- Tool calling / function calling: no disponible; requiere una plantilla de chat y un formato de llamadas que no se documentan.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Multilingüismo: no disponible; no se declara ningún idioma, ni siquiera el inglés.
- Visión, audio o modalidades adicionales: no disponible; los tags no incluyen ningún módulo multimodal.

## Casos de uso

- Validación de pipelines de cuantización: el uso más inmediato y realista es servir este checkpoint en vLLM o SGLang y comparar su salida con la del modelo base en BF16 para medir la degradación introducida por W8A8 INT8 antes de adoptar el formato en producción.
- Servicio de chat interno sobre una única GPU de 24 GB: al ocupar 11,2 GB de pesos, deja margen para caché KV y permite atender varias peticiones concurrentes con contexto moderado en una RTX 4090, L4 o A10G.
- Procesamiento por lotes de clasificación, extracción de entidades y resumen: tareas de baja exigencia de razonamiento donde el throughput por vatio de una implementación INT8 compensa la posible pérdida de precisión.
- Enrutado y triaje en un sistema RAG: usar el modelo como clasificador de consultas o generador de respuestas cortas a partir de fragmentos recuperados, siempre que se verifique primero la ventana de contexto real del modelo base.
- Despliegue en entornos *on-premise* o aislados (air-gapped) con GPUs de gama media: el tamaño de 11,4 GB permite distribuir el checkpoint en medios físicos y ejecutarlo sin depender de servicios externos.
- Filtrado y moderación de contenido en una canalización propia: un modelo de 11 B cuantizado puede evaluar textos con latencia baja, aunque la ausencia de evaluación de sesgos hace recomendable auditar sus decisiones.
- Base para investigación sobre cuantización: analizar el impacto de W8A8 en tareas de razonamiento largo o generación de código, donde los errores de cuantización tienden a acumularse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni tampoco una comparación de perplejidad entre el checkpoint INT8 y el modelo base en BF16.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 11,2 GB en INT8 (frente a unos 22,3 GB en BF16 para 11,17 B de parámetros).
- VRAM total recomendada: 24 GB o más para trabajar con comodidad; un mínimo práctico de 14-16 GB solo con contexto corto, batch pequeño y sin concurrencia.
- Estimación de caché KV: no se puede calcular con exactitud porque no se publica la configuración de capas y cabezas. Como referencia orientativa, un modelo de ~11 B con 40 capas y GQA de 8 cabezas KV consumiría del orden de 150-170 KB por token en FP16, es decir, aproximadamente 1,3 GB por cada 8.000 tokens de contexto. Cifra estimada, no confirmada.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB y L4 24 GB para servidor; RTX 4090 o RTX 3090 24 GB para estaciones de trabajo.
- GPU de consumo: sí cabe en 24 GB (RTX 4090, 3090). En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con contexto reducido y batch 1. En GPU de 8-12 GB no es viable sin *offload* a CPU, y al no haber GGUF no se puede recurrir a llama.cpp.
- Opciones de despliegue: vLLM y SGLang son las rutas naturales por su soporte de `compressed-tensors`; TGI y TensorRT-LLM no está confirmado que acepten este checkpoint. llama.cpp y Ollama no son compatibles al no existir versión GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `cpral/basal-2.0-max-W8A8-INT8` | 11,17 B | no disponible | Apache-2.0 | Repo publico, 0 descargas, sin documentacion |
| Llama 3.1 8B Instruct | 8,03 B | 128k | Llama 3.1 Community License | Amplia, con cuantizaciones de la comunidad y evaluaciones publicas |
| Mistral NeMo 12B | 12 B | 128k | Apache-2.0 | Amplia, con soporte nativo en vLLM |
| Gemma 2 9B | 9,24 B | 8k | Gemma Terms of Use | Amplia, con evaluaciones publicas |

La comparación de rendimiento no es posible: no existe ningún benchmark publicado para `basal-2.0-max` ni para esta variante cuantizada, de modo que no se puede afirmar si compite, iguala o queda por debajo de las alternativas de su segmento. La comparación anterior se limita, por tanto, a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card real, ni ficha de datos de entrenamiento, ni descripción de sesgos, idiomas o contexto. Cualquier uso en producción exige una evaluación propia previa.
- Degradación por cuantización no medida: W8A8 INT8 suele implicar una pérdida pequeña en tareas generales, pero puede ser significativa en matemáticas, código y razonamiento de cadena larga. El autor no publica ninguna comparación con el modelo base.
- Riesgo de alucinación: no evaluado. No hay datos de fidelidad factual ni de calibración.
- Idiomas: no declarados. No debe asumirse un buen rendimiento en castellano ni en ningún otro idioma sin pruebas.
- Ventana de contexto desconocida: planificar cualquier aplicación RAG o de conversación larga sin conocer este dato puede provocar truncamientos silenciosos.
- Licencia: el repo declara Apache-2.0, que permite uso comercial, modificación y redistribución conservando los avisos de licencia y el fichero NOTICE. Sin embargo, no se ha podido verificar la licencia del modelo base `Remek/basal-2.0-max` con la información proporcionada; conviene comprobarla antes de un uso comercial.
- Falta de validación comunitaria: cero descargas y cero valoraciones, con publicación y actualización separadas por nueve minutos. No hay evidencia de que los pesos se hayan verificado más allá de la conversión.
- Compatibilidad restringida: al ser `compressed-tensors`, solo funciona en motores con soporte específico (vLLM, SGLang). No hay GGUF, por lo que no se puede usar en llama.cpp, Ollama ni LM Studio sin reconvertir.
- No apto para reentrenamiento directo: un checkpoint W8A8 está pensado para inferencia; el ajuste fino requeriría partir del modelo base en BF16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cpral/basal-2.0-max-W8A8-INT8
- Modelo base: https://huggingface.co/Remek/basal-2.0-max
- Paper, blog, demo o repositorio de codigo: no disponible en la informacion proporcionada.
