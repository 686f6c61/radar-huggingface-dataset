# reboorn/privacy

## Resumen

Privacy es un ajuste fino supervisado (SFT) del checkpoint base Qwen/Qwen3.5-4B-Base, publicado por el usuario reboorn en Hugging Face. El modelo está especializado en la extracción de información sensible y en la toma de decisiones de tratamiento de datos privados a partir de texto. No se trata de un modelo generalista, sino de un artefacto orientado a una tarea concreta: identificar y clasificar datos personales siguiendo una taxonomía y un esquema de salida definidos por el sistema que lo invoca.

El entrenamiento se realizó sobre 11.373 ejemplos de privacidad, de los cuales 1.431 fueron añadidos con anotaciones de cuatro campos. Se seleccionó el checkpoint resultante tras tres épocas (534 pasos de optimizador) y se exportó en FP16. El modelo conserva la arquitectura y el tamaño del base: 4.539.265.536 parámetros totales según los pesos en safetensors, con un repositorio de 9,1 GB.

Su relevancia es acotada pero clara: ofrece un punto de partida reproducible para pipelines de detección de PII y clasificación de sensibilidad sobre un modelo Qwen3.5 de 4B, con licencia Apache 2.0 y compatibilidad con la librería transformers. Al no publicarse benchmarks ni detalles de composición del dataset, debe evaluarse empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-Base; detalles de atención no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint exportado en FP16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer de aproximadamente 4,5 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT) orientado a la extracción de información privada y a decisiones de tratamiento. No se documenta el uso de RLHF, DPO ni otras etapas de alineación adicionales.

El conjunto de entrenamiento consta de 11.373 ejemplos de privacidad, de los cuales 1.431 incorporan anotaciones de cuatro campos. El entrenamiento se extendió durante tres épocas, equivalentes a 534 pasos de optimizador, y se seleccionó el checkpoint resultante, exportado en FP16. No se especifican la composición lingüística del dataset, la longitud de las secuencias, la tasa de aprendizaje ni los hiperparámetros restantes.

## Capacidades

- Extracción de información sensible (PII) a partir de texto, siguiendo una taxonomía proporcionada en el prompt.
- Clasificación y toma de decisiones de tratamiento sobre datos privados, con salida conforme a un esquema definido por la aplicación.
- Generación de texto conversacional y de tipo instrucción, heredada del modelo base.
- Procesamiento de entradas multimodal imagen-texto según la etiqueta del repositorio (image-text-to-text), aunque la model card solo describe tareas textuales.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Redacción y revisión de políticas de privacidad: el modelo puede analizar borradores de textos legales y señalar qué categorías de datos personales se mencionan, apoyándose en la taxonomía que se le pase en el prompt.
- Etiquetado de PII en corpus internos: integrado en un pipeline de preprocesado, extrae entidades sensibles de documentos y devuelve la salida estructurada según el esquema definido por la aplicación.
- Clasificación de solicitudes de derechos (acceso, rectificación, supresión): el modelo puede interpretar la solicitud del usuario y determinar qué campos de datos resultan afectados, siempre con validación humana posterior.
- Filtrado previo en sistemas de atención al cliente: detecta información sensible en mensajes entrantes antes de que se almacenen o se envíen a otros servicios, aplicando las reglas de retención del sistema llamante.
- Auditoría de registros y logs: revisa muestras de logs para localizar datos personales que no deberían haberse registrado, como parte de un proceso periódico de cumplimiento.
- Anonimización asistida: propone qué fragmentos de un texto deben redactarse o sustituirse y con qué categoría, dejando la decisión final al sistema autorizado que invoca al modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 10-12 GB según longitud de contexto.
- Cuantización a 8 bits: en torno a 4,5-5 GB de pesos; a 4 bits, en torno a 2,3-2,8 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: A100, H100 o L40S para despliegue concurrente; RTX 4090 (24 GB) o RTX 3090 para inferencia en FP16 sin problemas de memoria.
- GPU de consumo: cabe en GPUs consumer de 12 GB o más en FP16 con contexto moderado; en 8 bits podría ejecutarse en tarjetas de 8 GB.
- Opciones de despliegue: transformers (formato nativo), además de vLLM, TGI o llama.cpp si se generan los artefactos correspondientes; no se han publicado ficheros GGUF en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| reboorn/privacy | 4,54B | no disponible | Apache 2.0 | SFT para extracción de PII |
| Qwen/Qwen3.5-4B-Base | ~4B | no disponible | no disponible en esta ficha | Modelo base generalista |
| Alternativas especializadas en PII de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No se publican métricas de evaluación, por lo que el rendimiento real en extracción de PII es desconocido y debe validarse con un conjunto propio antes de usarlo.
- El dataset de ajuste es reducido (11.373 ejemplos) y su composición no está documentada; el riesgo de sobreajuste a la taxonomía y al esquema de salida empleados en el entrenamiento es alto.
- Al ser un modelo de 4B ajustado con SFT, puede alucinar entidades o categorías no presentes en el texto; la salida debe validarse en el sistema llamante.
- No se especifican los idiomas cubiertos; el comportamiento fuera del idioma o idiomas del dataset de entrenamiento es incierto.
- El modelo no implementa por sí mismo controles de autorización ni retención: la model card indica explícitamente que esas reglas deben aplicarse en el sistema que lo invoca.
- La licencia Apache 2.0 permite uso comercial, pero no exime del cumplimiento del RGPD u otras normativas aplicables al tratamiento de datos personales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reboorn/privacy
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
