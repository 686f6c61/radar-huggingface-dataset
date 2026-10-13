# cryowastakenbycryo/Clef-Flash-AWQ

## Resumen

Clef-Flash-AWQ es la versión cuantizada a 4 bits del modelo Clef-Flash, un modelo multimodal de 9B parámetros desarrollado por Cloudflare y post-entrenado a partir de Qwen3.5-9B. A diferencia de un modelo generativo convencional, Clef-Flash está diseñado como un modelo de decisión: recibe un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas y devuelve una probabilidad para cada opción permitida de cada pregunta, en lugar de texto libre. Este repositorio concreto, publicado por el usuario cryowastakenbycryo, aplica una cuantización AWQ en formato compressed-tensors orientada a servir el modelo en vLLM.

La relevancia de esta versión radica en que reduce aproximadamente a la mitad el consumo de memoria respecto al original en bf16, con una pérdida de calidad descrita por el autor como insignificante para cargas de decisión y chat. La cuantización se aplica sobre todas las capas `Linear` de texto (atención completa qkv/o, proyecciones GDN y MLP), mientras que se mantienen en bf16 el `lm_head`, la torre visual y las proyecciones `in_proj_a`/`in_proj_b` del bloque GDN.

El modelo base forma parte de la familia Clef, orientada a clasificación de alta velocidad y flujos de trabajo agénticos, y está disponible en Cloudflare Workers AI y en el catálogo de Ollama. La licencia Apache 2.0 facilita su integración en producción, aunque conviene tener en cuenta que la cabeza de decisión conjunta no está incluida en este repositorio y se distribuye como artefacto separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal post-entrenado desde Qwen3.5-9B, con capas de atencion completa y capas GDN (Gated DeltaNet) |
| Parametros totales | 9.409.813.744 (≈9,4 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16_ASYM (int4 pesos, grupo 128, zero-points int8 asimetricos); `lm_head`, torre visual y `in_proj_a`/`in_proj_b` GDN en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`pack-quantized`, nativo de vLLM) |

## Arquitectura y entrenamiento

El backbone es un transformer multimodal derivado de Qwen3.5-9B. Según el manifiesto de cuantización, la red de texto combina capas de atención completa (proyecciones qkv/o) con capas GDN (Gated DeltaNet), una formulación de atención lineal recurrente, además de las proyecciones `in_proj_a`/`in_proj_b` específicas del bloque GDN. El modelo incorpora además una torre visual que procesa entradas de imagen y vídeo, y un `lm_head` que se mantiene en bf16 tras la cuantización.

Clef-Flash se describe como un modelo de decisión post-entrenado: transforma un estado y un esquema de preguntas tipadas en un vector de probabilidades sobre las opciones permitidas de cada pregunta. Cloudflare presentó este modelo junto con una plataforma de aprendizaje por refuerzo (RL) que permite afinar modelos de decisión con datos propios, lo que apunta a un post-entrenamiento orientado a RL sobre la base Qwen3.5-9B. No se dispone del número de tokens de entrenamiento ni de la composición exacta del dataset.

La innovación técnica destacable en este repositorio es la propia cuantización AWQ: esquema W4A16 asimétrico con tamaño de grupo 128, excluyendo explícitamente los módulos sensibles a la precisión (`lm_head`, torre visual y proyecciones GDN de compuerta). El resultado es un artefacto que vLLM consume de forma nativa mediante compressed-tensors, sin necesidad de código personalizado para el backbone.

## Capacidades

- Modelo de decisión: dado un estado y un esquema de preguntas tipadas, devuelve una probabilidad por cada opción permitida de cada pregunta, en lugar de texto generativo libre.
- Entrada multimodal: procesa el estado como texto, JSON, imágenes o vídeo.
- Clasificación y enrutamiento de alta velocidad, según la descripción del modelo base en Cloudflare Workers AI.
- Flujos de trabajo agénticos y razonamiento multi-paso, según la descripción de la familia Clef.
- Cuantización de solo pesos con activaciones en 16 bits (W4A16), compatible con el pipeline estándar de vLLM.
- No se documentan en la información disponible capacidades específicas de tool calling o function calling, ni lista de idiomas soportados.

## Casos de uso

- Clasificación de alta velocidad: el modelo convierte un estado de entrada más un esquema tipado en probabilidades por opción, adecuado para tareas de categorización con umbrales configurables.
- Enrutamiento de tickets y triaje: dado el texto de una incidencia, devolver la probabilidad de cada categoría o cola destino y enrutar automáticamente con un umbral de confianza.
- Moderación de contenido: aplicar el modelo sobre texto e imágenes para obtener probabilidades de distintas categorías de riesgo y decidir la acción con reglas de negocio.
- Flujos agénticos multi-paso: usar las decisiones del modelo como señales estructuradas dentro de un pipeline de agente, aprovechando su naturaleza determinista por esquema.
- Análisis de vídeo para decisiones: procesar fotogramas o clips junto con preguntas tipadas para clasificar eventos o estados.
- Automatización sobre estados estructurados: consumir JSON (por ejemplo, telemetría o registros) y emitir decisiones tipadas para sistemas de orquestación.
- Despliegue en Workers AI o entornos propios: al estar publicado como AWQ compatible con vLLM, se puede servir en infraestructura propia con memoria reducida frente al bf16, o consumir la versión alojada de Cloudflare.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 4,7 GB por los 9,4 B de parámetros en int4, si bien el repo completo pesa 8,6 GB porque `lm_head`, la torre visual y parte de las proyecciones GDN se mantienen en bf16. Conviene reservar margen adicional para caché KV y activaciones.
- GPU recomendadas: el autor sugiere servir con vLLM usando `--tensor-parallel-size 2`; en la práctica puede ejecutarse en una sola GPU de 24 GB o repartirse en dos GPUs.
- Cabe en GPU de consumo: sí, en tarjetas con al menos ~12-16 GB de VRAM efectiva, como RTX 4090, RTX 3090 o RTX 4080; en GPUs de 8 GB puede resultar ajustado por el material en bf16.
- Opciones de despliegue: vLLM con compressed-tensors (soporte nativo), catálogo de Ollama y Cloudflare Workers AI para la versión alojada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Clef-Flash-AWQ | 9,4 B | no disponible | apache-2.0 | HuggingFace, vLLM | Cuantizacion AWQ W4A16 del Clef-Flash |
| Clef-Flash (bf16) | 9 B | no disponible | apache-2.0 | Workers AI, Ollama | Modelo base de decision multimodal |
| Qwen3.5-9B (base) | 9 B | no disponible | no disponible | no disponible | Modelo del que deriva Clef-Flash |

Datos de rendimiento comparativo: no disponible.

## Limitaciones y advertencias

- La cabeza de decisión conjunta (joint decision head) utilizada por la ruta de servicio de SystemOne no forma parte de este repositorio; se distribuye como artefacto separado y debe desplegarse junto al backbone.
- Al ser un modelo de decisión y no generativo, no se espera que produzca texto libre de propósito general; usarlo fuera de su esquema tipado puede dar resultados poco útiles.
- La cuantización AWQ puede introducir pérdida de precisión en las salidas de probabilidad; el autor la califica como insignificante para decisión y chat, pero no se aportan métricas que lo cuantifiquen.
- No se dispone de información sobre sesgos, idiomas soportados ni comportamiento ante entradas fuera de distribución.
- No se documentan restricciones de uso comercial más allá de la licencia Apache 2.0.
- El repositorio tiene muy baja adopción (15 descargas y 0 likes en el momento de los datos), lo que reduce la validación comunitaria.
- La cuantización puede requerir `--trust-remote-code` al servir con vLLM, con el consiguiente riesgo asociado a ejecutar código del repositorio.

## Enlaces

- HuggingFace (repositorio del modelo): https://huggingface.co/cryowastakenbycryo/Clef-Flash-AWQ
- Perfil del autor en HuggingFace: https://huggingface.co/cryowastakenbycryo/models
- Documentación de Clef-flash en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/clef-flash/
- Blog de Cloudflare sobre los modelos de decisión Clef: https://blog.cloudflare.com/clef-decision-models/
- Clef-flash en Ollama: https://ollama.com/library/clef-flash
