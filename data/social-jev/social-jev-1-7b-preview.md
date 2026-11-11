# social-jev/social-jev-1.7B-preview

## Resumen

SocialJev 1.7B — Preview es un modelo de clasificación para ciencias sociales desarrollado por el proyecto social-jev, construido como un fine-tuning de Qwen/Qwen3-1.7B. Su propuesta no es la generación de texto libre, sino la clasificación tipada: el usuario define una consulta con un texto y un conjunto de opciones, y el modelo devuelve la opción elegida junto con una distribución de probabilidades sobre las alternativas. La inspiración declarada es la familia Jev de TypeSafe, que propone modelos "system one" rápidos frente a los modelos generativos "system two".

El modelo tiene 1.720.577.025 parámetros (1,7B) en formato safetensors, un repositorio de 3,5 GB y se distribuye a través de la librería transformers con código personalizado (`trust_remote_code=True`). Está etiquetado en Hugging Face como `feature-extraction` y `classification`, y su model card documenta dos vías de uso: la API nativa de Transformers y el paquete `social-jev`, que añade un backend opcional basado en vLLM para cargas de trabajo mayores.

Es relevante ahora porque propone un patrón de uso distinto al de los LLM generativos: en lugar de prompting en lenguaje natural, una interfaz tipada con Pydantic que devuelve salidas estructuradas y probabilidades calibradas. Esto encaja con tareas de anotación y codificación en investigación social, donde la reproducibilidad y la velocidad importan más que la generación abierta. El proyecto está en desarrollo activo y la propia model card advierte que las interfaces pueden cambiar entre versiones tempranas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Qwen/Qwen3-1.7B); detalles internos no disponibles |
| Parametros totales | 1.720.577.025 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-1.7B |
| Pipeline declarado | feature-extraction |
| Libreria | transformers (con `trust_remote_code=True`) |
| Tamano del repositorio | 3,5 GB |
| Backends de inferencia | Transformers y vLLM (via paquete `social-jev`) |

## Arquitectura y entrenamiento

La información disponible indica que SocialJev 1.7B es un fine-tuning de Qwen/Qwen3-1.7B, un transformer decoder-only de 1,7B parámetros. No se detallan en la model card ni en los metadatos la composición del dataset de ajuste, el número de tokens utilizados, ni si se emplearon técnicas de RLHF, DPO o supervisión con preferencias. Tampoco se especifica si se congelaron capas del modelo base o se ajustó el modelo completo.

La innovación destacable no está en la arquitectura sino en la interfaz: el modelo expone un esquema tipado (`Query` con `text` y `options`, `Request` con `state` y `queries`) que devuelve objetos con `.choice` y `.probabilities`. El paquete `social-jev` abstrae el backend de inferencia, de modo que la misma interfaz funciona sobre Transformers o sobre vLLM, con soporte síncrono (`.query()`) y asíncrono (`.aquery()`). No se documentan innovaciones de atención, decodificación especulativa ni mecanismos híbridos.

## Capacidades

- Clasificación de texto en un conjunto cerrado de opciones definido por el usuario, devolviendo la opción elegida y una distribución de probabilidades.
- Codificación de documentos en categorías predefinidas mediante una interfaz tipada con Pydantic.
- Procesamiento por lotes de múltiples documentos y múltiples consultas por documento, con resultados ordenados primero por documento y luego por consulta.
- Ejecución sobre Transformers y sobre vLLM a través de una API unificada.
- Soporte de envío asíncrono concurrente con `aquery()` para solapar preparación de lotes e inferencia.
- No se documentan capacidades de generación abierta, tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Codificación de documentos políticos: clasificar actas de plenos, programas electorales o notas de prensa en áreas temáticas (Transporte, Educación, Sanidad) usando la consulta tipada; el modelo devuelve la categoría y su probabilidad, lo que permite filtrar casos de baja confianza para revisión manual.
- Anotación asistida en investigación social: procesar corpus de encuestas abiertas o entrevistas y asignar códigos temáticos de forma reproducible, aprovechando que la salida es estructurada y auditable frente a la generación libre.
- Moderación y triaje de contenido: clasificar mensajes en categorías predefinidas con umbrales de probabilidad para derivar casos dudosos a revisión humana.
- Enrutamiento de tickets o consultas: asignar cada entrada a un departamento o categoría de servicio a partir de una lista cerrada de opciones, con la distribución de probabilidades como señal de confianza.
- Análisis de sentimiento o postura con categorías controladas: definir opciones como positivo, negativo o neutro y obtener probabilidades por documento para agregación estadística posterior.
- Procesamiento por lotes a escala con vLLM: ejecutar la clasificación de grandes volúmenes de documentos usando el backend vLLM y envíos asíncronos concurrentes, tal como documenta la model card.
- Extracción de etiquetas para pipelines de datos: integrar el modelo como paso de etiquetado en un ETL, consumiendo la salida tipada directamente en el código sin parseo de texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por el tamaño del modelo (1,7B parámetros), en precisión completa (fp32) serían necesarios aproximadamente 6,9 GB solo para pesos; en fp16/bf16 unos 3,4 GB; en cuantizaciones de 8 bits alrededor de 1,7 GB y en 4 bits alrededor de 0,9 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo debería caber en GPUs de consumo con suficiente VRAM en fp16, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: probable por el tamaño de 1,7B, pero no confirmada oficialmente.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y vLLM a través del paquete `social-jev` con el extra `[vllm]`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas (contexto, licencia, idiomas) para establecer una comparativa rigurosa con alternativas. La comparación más directa posible es con su modelo base, del que se conocen menos datos aún en la información proporcionada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SocialJev 1.7B Preview | 1,72B | no disponible | Clasificación tipada | no disponible | Hugging Face (transformers, vLLM) |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Generación de texto | no disponible | Hugging Face |
| Alternativas de clasificación del mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Proyecto en desarrollo activo: la model card advierte explícitamente de que las interfaces pueden cambiar entre versiones tempranas, lo que supone un riesgo para producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un bloqueante potencial para adopción empresarial.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos del inglés sin evaluación propia.
- Longitud de contexto no documentada: no se conoce cuánto texto puede procesar por documento, lo que limita el diseño de pipelines con documentos largos.
- Riesgo de alucinación en la asignación de categorías: al ser un modelo de clasificación sobre opciones cerradas, el riesgo se traslada a la calibración de probabilidades; la model card indica que las probabilidades del ejemplo son ilustrativas, por lo que conviene validar la calibración con datos propios.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código remoto antes de ejecutarlo en entornos sensibles.
- Sin datos de benchmarks ni de sesgos: no hay evidencia publicada sobre su comportamiento en dominios específicos ni sobre sesgos demográficos o temáticos.
- Madurez del ecosistema: el paquete `social-jev` se encuentra en versiones alfa (la documentación enlazada referencia v0.1.0a4), con posible inestabilidad de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/social-jev/social-jev-1.7B-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Sitio web del proyecto: https://social-jev.github.io/
- Documentación: https://social-jev.github.io/docs/
- Guía de inferencia: https://social-jev.github.io/docs/v0.1.0a4/inference/
- Referencia de API: https://social-jev.github.io/docs/v0.1.0a4/api/
- Repositorio GitHub: https://github.com/social-jev/social-jev
- Blog de TypeSafe sobre Jev (inspiración): https://typesafe.ai/blog/introducing-system-one-models-and-jev
