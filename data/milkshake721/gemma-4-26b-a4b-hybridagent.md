# milkshake721/Gemma-4-26B-A4B-HybridAgent

## Resumen

Gemma-4-26B-A4B-HybridAgent es un ajuste fino del modelo multimodal `google/gemma-4-26B-A4B` de Google DeepMind, publicado por el usuario milkshake721. Su objetivo es trasladar a la arquitectura Gemma 4 la técnica HybridAgent de togethercomputer, que combina tres modos de razonamiento en una sola trayectoria: razonamiento discreto en texto delimitado por `<think>`, razonamiento continuo en espacio latente mediante vectores `<latent>` y llamadas a herramientas mediante `<tool_call>`.

El modelo base es un transformer con mezcla de expertos (MoE) de 25,81 mil millones de parámetros totales, de los cuales aproximadamente 4 mil millones se activan por token gracias a un enrutado top-8 sobre 128 expertos por capa. Conserva la torre de visión de 0,57B de parámetros, por lo que la entrada es imagen-texto y la salida es texto.

La relevancia de esta ficha es doble: por un lado documenta una implementación práctica de razonamiento latente sobre un MoE abierto; por otro, advierte de que se trata de una publicación con cero descargas, sin licencia declarada, sin idiomas declarados y sin resultados de evaluación publicados, lo que la sitúa en fase experimental y no apta para producción sin una validación propia. El repositorio ocupa 51,7 GB en safetensors bf16 y requiere código propio (`hybrid_agent`) para la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (Gemma 4), más torre de visión; adaptador HybridLink para razonamiento latente |
| Parametros totales | 25.805.945.136 (25,81B): 25,23B en el modelo de lenguaje + 0,57B en el codificador visual |
| Parametros activos | Aproximadamente 4B por token (top-8 sobre 128 expertos enrutados por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados están en bf16 (no se distribuyen GGUF ni otras variantes) |
| Idiomas soportados | no disponible (la model card no documenta cobertura lingüística) |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors (bf16) + código Python propio del paquete `hybrid_agent` |
| Modulos adicionales | HybridLink: 15.865.344 parámetros (MLP SwiGLU de 2 capas + RMSNorm + conexión residual) |
| Configuracion MoE | 128 expertos enrutados por capa, `moe_intermediate_size=704`, top-8 por token |
| Capas y dimension | 30 capas, `hidden_size=2816`, MLP denso compartido con `intermediate_size=2112` |
| Tokens especiales anadidos | `<latent>` (262144), `</latent>` (262145), `<think>` (262146), `</think>` (262147) |
| Tamano del repositorio | 51,7 GB |
| Libreria | transformers |
| Pipeline | text-generation (etiquetado también como image-text-to-text) |
| Fecha de publicacion | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura parte de `Gemma4ForConditionalGeneration`, es decir, un decoder transformer con atención compartida, un MLP denso compartido y un router MoE por cada una de las 30 capas. Cada capa contiene 128 expertos enrutados de tamaño intermedio 704, de los que se activan los 8 mejores por token, lo que mantiene el coste de cómputo cercano al de un modelo de 4B mientras la memoria necesaria corresponde al total de 25,81B. El `hidden_size` es 2816 y la escala de embeddings de Gemma 4 se fija en la raíz cuadrada de 2816 (aproximadamente 53,066). Sobre esta base se añade HybridLink, un módulo de 15,86M de parámetros formado por un MLP SwiGLU de dos capas con RMSNorm y conexión residual, que proyecta estados ocultos hacia el espacio latente de razonamiento.

El entrenamiento, denominado HybridSFT, se organiza en tres etapas. La primera, `format_activation`, enseña el formato de las trayectorias estructuradas con `<think>`, `<latent>` y `<tool_call>`. La segunda, `hybridlink_activation`, congela el tronco principal y entrena únicamente HybridLink con una tasa de aprendizaje de 2e-4 y una pérdida combinada de coseno y MSE para la regresión en espacio latente. La tercera, `self_conditioned`, aplica un ajuste fino conjunto con auto-condicionamiento en dos pasadas: la primera pasada genera los vectores latentes con HybridLink y estos sustituyen la entrada de la segunda, lo que refuerza la tolerancia al error y el cierre natural del bloque `</latent>`. La model card no detalla el volumen de tokens, la composición del dataset ni si hubo fases de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional y razonamiento en modo mixto: puede alternar razonamiento explícito en texto (`<think>`) con razonamiento en espacio latente (`<latent>`), con un máximo configurable de pasos latentes (64 en el ejemplo del autor).
- Llamada a herramientas: emite invocaciones estructuradas mediante `<tool_call>`, lo que habilita flujos de agente con uso de funciones externas.
- Entrada multimodal de imagen y texto: hereda la torre de visión de 0,57B del modelo base Gemma 4.
- Razonamiento multi-paso: el bucle del motor (`HybridEngine`) permite encadenar pasos latentes y llamadas a herramientas antes de producir la respuesta final.
- Aritmética y problemas de razonamiento elemental: el ejemplo de la model card resuelve la suma de los primeros 20 enteros positivos.
- Generación determinista: el ejemplo de inferencia utiliza `temperature=0.0`, adecuado para pipelines reproducibles.
- Cobertura multilingüe: no documentada en esta publicación, aunque el modelo base Gemma 4 está orientado a uso multilingüe según la documentación de Google.

## Casos de uso

- Agentes con uso de herramientas: el modelo puede intercalar `<tool_call>` con razonamiento latente para resolver tareas que requieren consultar APIs, bases de datos o calculadoras, manteniendo la traza de razonamiento fuera del texto visible al usuario.
- Automatización de soporte técnico con acceso a sistemas internos: el modo de tool calling permite consultar el estado de un pedido o un ticket y componer una respuesta en lenguaje natural a partir del resultado de la herramienta.
- Investigación sobre razonamiento latente: sirve como banco de pruebas para estudiar si los vectores continuos sustituyen ventajosamente a las cadenas de pensamiento en texto, gracias a que expone los tokens `<latent>` y el módulo HybridLink de forma explícita.
- Extracción de información de documentos con imágenes: al conservar el codificador visual, puede procesar capturas, formularios escaneados o diagramas y devolver texto estructurado.
- Resolución de problemas matemáticos paso a paso en entornos educativos o de evaluación interna, con la posibilidad de fijar `temperature=0.0` para obtener salidas reproducibles.
- Prototipado de asistentes que necesitan separar razonamiento privado de respuesta pública: el bloque `<think>` permite filtrar la traza interna antes de mostrar el resultado al usuario final.
- Evaluación comparativa de estrategias de razonamiento (texto discreto frente a latente) en un MoE de 26B con activación de 4B, útil para decidir arquitecturas en proyectos de I+D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del ajuste fino no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de tareas de agente, y la información de búsqueda solo remite a la documentación del modelo base sin cifras reproducibles en este contexto.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos suman 51,7 GB (25,81B de parámetros más el módulo HybridLink), por lo que se necesita aproximadamente 52 GB solo para pesos; con caché KV y activaciones conviene reservar 60-70 GB.
- GPU recomendadas para bf16: A100 80GB, H100 80GB o H200. En configuraciones de 40-48 GB (A100 40GB, L40S, RTX 6000 Ada) no cabe en bf16 sin paralelismo de tensor.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16. Sería necesario cuantizar a 4 bits (estimación de 14-16 GB), pero no se distribuyen pesos cuantizados y el código de inferencia propio (`hybrid_agent`) no documenta soporte para cuantización, por lo que esta vía requiere trabajo adicional no validado.
- Estimación en 8 bits: en torno a 26-28 GB de pesos, lo que permitiría una sola GPU de 40-48 GB, de nuevo condicionado a que el pipeline acepte cuantización.
- Despliegue: el autor proporciona un cargador propio (`load_hybrid_agent`) y un motor (`HybridEngine`) sobre transformers con `dtype=torch.bfloat16` y `device="cuda"`. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, y la presencia de tokens especiales nuevos y de un módulo HybridLink fuera del grafo estándar complica su integración en servidores de inferencia convencionales.
- Latencia y throughput: no disponibles. Como referencia estructural, el coste de cómputo por token se aproxima al de un modelo de 4B activos, mientras que el ancho de banda de memoria exigido corresponde a los 25,81B totales.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| milkshake721/Gemma-4-26B-A4B-HybridAgent | 25,81B / ~4B | no disponible | no disponible | Repositorio HuggingFace, 0 descargas, requiere código propio |
| google/gemma-4-26B-A4B (base) | 25,81B / ~4B | no disponible en la informacion disponible | no disponible en la informacion disponible | Repositorio HuggingFace oficial de Google |
| google/gemma-4-26B-A4B-it (instruido) | 25,81B / ~4B | no disponible en la informacion disponible | no disponible en la informacion disponible | Repositorio HuggingFace oficial y Gemini Enterprise Agent Platform |
| Gemma 4 12B | no disponible | no disponible | no disponible | Familia Gemma 4 de Google DeepMind |
| Gemma 4 31B | no disponible | no disponible | no disponible | Familia Gemma 4 de Google DeepMind |

La diferencia funcional frente a las variantes oficiales es la incorporación de razonamiento latente y tool calling nativo mediante tokens especiales, a costa de perder compatibilidad directa con el ecosistema estándar de transformers y de no contar con evaluaciones publicadas.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si se permite uso comercial, modificación o redistribución. Debe consultarse la licencia del modelo base Gemma 4 y aclararse con el autor antes de cualquier uso productivo.
- Sin evaluaciones publicadas: no hay benchmarks que respalden las capacidades de razonamiento, tool calling o multimodalidad del ajuste.
- Cero descargas y cero valoraciones: no existe evidencia de uso comunitario ni validación independiente del comportamiento del modelo.
- Dependencia de código propio: la inferencia exige el paquete `hybrid_agent` (cargador, motor y prompts de sistema) y los tokens especiales añadidos ocupan identificadores 262144-262147; esto rompe la compatibilidad con servidores de inferencia estándar y con pesos publicados por terceros.
- Riesgo de alucinación no cuantificado: al ser un ajuste fino supervisado sobre un modelo base, no se documenta ningún proceso de alineación adicional (RLHF, DPO) ni evaluaciones de seguridad.
- Interpretabilidad del razonamiento latente: los vectores `<latent>` no son legibles por humanos, lo que dificulta auditar la traza de razonamiento en entornos regulados.
- Posible degradación del multilingüismo: la model card está redactada íntegramente en chino tradicional, pero no se especifica la distribución lingüística del dataset de ajuste ni la cobertura de idiomas resultante.
- Datos de entrenamiento no documentados: se desconocen el volumen de tokens, la procedencia de los datos y el tratamiento de datos personales o con derechos de autor.
- Requisitos de memoria elevados: 51,7 GB en bf16 y ausencia de variantes cuantizadas oficiales limitan su despliegue a GPUs de 80 GB o a trabajo de cuantización propio no validado.
- Madurez: publicación creada y actualizada el mismo día (2026-10-23), sin historial de mantenimiento ni issues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/milkshake721/Gemma-4-26B-A4B-HybridAgent
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Variante instruida del modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio de la técnica HybridAgent: https://github.com/togethercomputer/HybridAgent
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de la familia Gemma: https://gemma.ai/models/
- Ficha en Gemini Enterprise Agent Platform: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
