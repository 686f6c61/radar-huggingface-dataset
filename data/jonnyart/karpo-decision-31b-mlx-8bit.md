# jonnyArt/karpo-decision-31B-mlx-8bit

## Resumen

Karpo Decision 31B MLX 8-bit es una conversión no oficial, realizada por el usuario jonnyArt, del modelo MachinePulseAI/karpo-decision-31B para su ejecución en Macs con Apple Silicon mediante el framework MLX. El modelo original, desarrollado por MachinePulse, es una versión modificada de Gemma 4 31B-it de Google DeepMind, reorientada a una tarea muy concreta: la clasificación de texto mediante un mecanismo propio de "empaquetado de peticiones" (request packing) y "lectura" (readout) que devuelve respuestas estructuradas a preguntas cerradas sobre un estado de entrada.

A diferencia de un modelo generativo convencional, Karpo Decision no produce texto libre, sino que recibe un estado (por ejemplo, el detalle de una solicitud de devolución) y un conjunto de preguntas tipadas, y devuelve la respuesta más probable para cada una. Esta conversión cuantiza los pesos a 8 bits con tamaño de grupo 64, reduciendo el espacio en disco a unos 32 GB, y conserva sin cambios el tokenizador, la plantilla de chat y la configuración de decisión del modelo original.

La relevancia de esta ficha radica en que documenta una ruta de despliegue experimental (MLX sobre macOS) para un modelo de decisión de 31B parámetros, con verificación parcial frente al checkpoint completo en hardware NVIDIA: de 1.606 preguntas evaluadas sobre 340 peticiones, solo 2 cambiaron de respuesta principal y la diferencia media de probabilidad fue de 0,0016.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 4 31B-it); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 31B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como cifra oficial; las pruebas de verificacion cubren peticiones de hasta 8.072 tokens |
| Tipos de cuantizacion | 8 bits, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con NOTICE de cambios y licencia Gemma-4 incluida) |
| Formato de pesos | MLX (cuantizado a 8 bits); no se especifica safetensors/GGUF |
| Tamano en disco | ~32 GB (repositorio de 34,0 GB) |
| Libreria | mlx |
| Pipeline | text-classification |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Modalidad | solo texto (los pesos de vision no estan incluidos en esta copia) |

## Arquitectura y entrenamiento

El modelo original es una modificación de Gemma 4 31B-it, un transformer decoder-only de Google DeepMind. MachinePulse lo ha adaptado para una función de decisión: en lugar de generar texto, el modelo procesa un "estado" y un conjunto de preguntas tipadas (por ejemplo, tipo `noul`) y devuelve una distribución de probabilidad sobre las respuestas posibles para cada pregunta. Este comportamiento se implementa mediante un mecanismo propio de empaquetado de peticiones y una cabeza de lectura (readout) específica, cuyos pesos, tokenizador y plantilla de chat se conservan intactos en esta conversión.

La conversión a MLX se realizó con el script `scripts/convert_mlx.py` del repositorio fluxcodestudio/karpo-apple-silicon, aplicando cuantización a 8 bits con group size 64. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La innovación técnica destacable es el modo de inferencia orientado a decisión (request packing + readout), que difiere del uso generativo estándar y exige el código de inferencia de MachinePulse junto con el port para Apple Silicon.

## Capacidades

- Clasificación de texto estructurada: responde preguntas cerradas sobre un estado textual, devolviendo la respuesta más probable y su probabilidad.
- Decisión sobre políticas: el ejemplo de la model card evalúa la elegibilidad de una devolución según una política de 30 días.
- Soporte de preguntas tipadas: el campo `type` (por ejemplo, `noul`) define el formato de respuesta esperado.
- Procesamiento de peticiones de hasta 8.072 tokens (límite verificado en las pruebas; el contexto máximo oficial no se indica).
- Solo texto: la visión no está incluida en esta copia (los pesos de visión no forman parte de la conversión).
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación automatizada de elegibilidad en atención al cliente: el modelo recibe el estado de un caso (pedido, fechas, política aplicable) y una pregunta tipada sobre si procede la devolución, devolviendo una probabilidad calibrada que puede umbralizarse para derivar a un humano.
- Triaje de tickets de soporte: clasificar solicitudes entrantes según preguntas cerradas (urgencia, categoría, necesidad de escalado) con un formato de salida fijo y verificable.
- Cumplimiento normativo en flujos documentales: comprobar si un expediente cumple condiciones definidas en una política, usando la salida probabilística como señal de confianza antes de la revisión humana.
- Enrutamiento de decisiones en back-office: decidir entre rutas de procesamiento (aprobado, denegado, revisión manual) a partir de un estado textual y un conjunto de preguntas tipadas.
- Prototipado en Mac con Apple Silicon: desarrollar y validar pipelines de decisión localmente antes de desplegar el checkpoint completo en hardware NVIDIA, gracias a la fidelidad medida (2 cambios de respuesta principal en 1.606 preguntas).
- Investigación sobre modelos de decisión: estudiar el comportamiento de cabezas de lectura y empaquetado de peticiones en un modelo de 31B cuantizado, con la ventaja de ejecutarse en un equipo de sobremesa Mac.
- Validación de políticas internas: comparar la salida del modelo con reglas deterministas para detectar ambigüedades en la redacción de políticas antes de automatizar decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una comparación de fidelidad frente al checkpoint completo ejecutado en NVIDIA, con peticiones de hasta 8.072 tokens y hashes y recuentos de tokens coincidentes:

| Ejecucion | Peticiones | Preguntas | Respuesta principal cambiada | Diferencia media | Diferencia maxima |
|---|---:|---:|---:|---:|---:|
| Esta copia, 8-bit (MLX) | 340 | 1.606 | 2 | 0,0016 | 0,079 |
| Checkpoint completo en Mac con PyTorch (referencia) | 340 | 1.606 | 1 | 0,0011 | 0,103 |

No se verificaron imágenes, peticiones de más de 8.072 tokens ni la puntuación del Decision Index de esta copia.

## Requisitos de hardware

- VRAM/unified memory estimada: al menos ~32 GB libres para cargar los pesos de 8 bits; se recomienda margen adicional para el estado de inferencia y el contexto.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (por ejemplo, Mac Studio o MacBook Pro con 36 GB o más); no aplica a GPU NVIDIA en esta conversión, que requiere MLX.
- Cabe en GPU consumer: sí, en equipos Apple Silicon de gama alta con memoria unificada; no en GPU consumer NVIDIA mediante esta ruta.
- Opciones de despliegue: MLX mediante `karpo-apple-silicon[mlx]` y el paquete `karpo-decision` de MachinePulse; no se carga con `mlx-lm` directamente. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| jonnyArt/karpo-decision-31B-mlx-8bit | 31B | hasta 8.072 tokens verificado | MLX 8-bit, Apple Silicon | Apache-2.0 | Conversion no oficial, solo texto |
| MachinePulseAI/karpo-decision-31B | 31B | hasta 8.072 tokens verificado | Checkpoint completo (PyTorch) | Apache-2.0 | Modelo original, incluye vision |
| Gemma 4 31B-it | 31B | no disponible | Safetensors (formato original) | Gemma-4-LICENSE | Modelo base generativo de Google DeepMind |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada, respaldada ni soportada por MachinePulse ni por Google; cualquier crédito por la calidad corresponde a MachinePulse.
- Ruta experimental: la model card califica explícitamente el uso de MLX como experimental.
- Requiere código específico: no funciona con `mlx-lm`; necesita el paquete `karpo-decision` y el port `karpo-apple-silicon`.
- Sin visión: los pesos de visión no están incluidos en esta copia.
- Límite verificado de 8.072 tokens: no se comprobó el comportamiento con peticiones más largas.
- Decision Index no evaluado para esta copia.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de un modelo derivado de Gemma 4, hereda los sesgos del modelo base, no cuantificados aquí.
- Idiomas soportados: no disponibles.
- Licencia Apache-2.0 con la licencia Gemma-4 incluida; conviene revisar `LICENSE`, `NOTICE` y `licenses/Gemma-4-LICENSE` antes de uso comercial.
- Solo 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonnyArt/karpo-decision-31B-mlx-8bit
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Repositorio del port para Apple Silicon: https://github.com/fluxcodestudio/karpo-apple-silicon
- Detalle de verificación y límites: https://github.com/fluxcodestudio/karpo-apple-silicon#what-is-verified-and-how
- Paquete de inferencia de MachinePulse: https://github.com/machinepulse-ai/karpo-decision
