# perplexity-ai/pplx-decider-flash-v1.3

## Resumen

pplx-decider-flash-v1.3 es un modelo de clasificación y toma de decisiones desarrollado por Perplexity AI, afinado a partir de Qwen/Qwen3.5-4B. No es un modelo generativo de propósito general: es un "decider", un modelo especializado que recibe un estado (texto, JSON o imágenes) y un conjunto de preguntas estructuradas, y devuelve respuestas tipadas (elección entre opciones con probabilidades, verdadero/falso, puntuación ordinal o extracción de fragmentos textuales). La versión flash es la variante pequeña de la familia v1.3 y se ha destilado a partir del modelo de 27B de la misma familia.

El modelo comparte esquema de petición, API y capacidades con pplx-decider-v1.3, incluyendo soporte multimodal de texto e imagen y la operación "locate" para extracción de spans literales. Su relevancia actual radica en que ofrece el mismo contrato de API que el modelo grande con un coste y una latencia mucho menores, lo que lo hace adecuado para enrutamiento, moderación, clasificación de tickets y extracción estructurada en producción.

Con 4.539.265.536 parámetros totales, pesos en safetensors y licencia Apache 2.0, el modelo se distribuye con código propio (`custom-code`) y requiere autenticación para descargar el repositorio. El repositorio ocupa 9,6 GB y el modelo necesita aproximadamente 8,5 GiB en BF16 más memoria de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B), con cabecera de clasificación/decider y código propio |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4B parámetros, y se afina como "decider": en lugar de generar texto libre, produce una lectura (logits) sobre un conjunto finito de opciones válidas por pregunta. La model card indica que pplx-decider-flash-v1.3 está destilado del modelo de 27B de la misma familia v1.3, de modo que hereda el esquema de petición y las capacidades del modelo grande, incluido el soporte de imágenes y la operación de extracción de spans.

El entrenamiento incorpora un diseño de secuencia específico: en modo `separate` (por defecto), cada pregunta se responde en su propia secuencia compuesta por el estado y esa pregunta únicamente, de forma que las preguntas no se ven entre sí y la respuesta no cambia al añadir, quitar o reordenar otras preguntas. En modo `isolated`, la petición completa se codifica como una sola secuencia con el formato usado en entrenamiento, lo que abarata el coste cuando muchas preguntas comparten un estado largo, a costa de que las respuestas puedan variar ligeramente (entre el 1,5 % y el 2,2 % de las respuestas top difieren del modo `separate` según las muestras del autor). El modelo incluye un fichero `decision_config.json` con una temperatura de calibración ajustada sobre datos de validación, que `decide` aplica una sola vez antes de normalizar con softmax sobre las opciones válidas de cada pregunta.

## Capacidades

- Clasificación por elección (`choice`): entre 1 y 255 opciones, con nombre y descripción opcional, devolviendo la opción elegida, las probabilidades por opción y una confianza.
- Preguntas booleanas (`noul`): probabilidad de verdadero, con descripciones opcionales para los estados verdadero y falso.
- Puntuación ordinal (`score`): entre 2 y 255 niveles ordenados de menor a mayor, devolviendo la puntuación esperada, probabilidades, leyenda y confianza.
- Extracción de spans literales (`locate`): devuelve fragmentos del estado con posición de inicio y fin, texto y puntuación, útil para localizar entidades o citas textuales.
- Multimodal: acepta imágenes en la petición (rutas, data URI en base64 o imágenes PIL), colocadas antes del texto y visibles para todas las preguntas; cada imagen se redimensiona manteniendo la relación de aspecto hasta un máximo de 1.638.400 píxeles (1,6 MP).
- Múltiples preguntas por petición sobre el mismo estado, con independencia entre preguntas en modo `separate`.
- Procesamiento por lotes: `decide` acepta una lista de peticiones y devuelve una lista de respuestas en el mismo orden.
- Acceso a logits crudos (`decider.logits`) para ranking mediante margen de logits, que no se satura en empates como las probabilidades.
- Validación estricta del esquema: las peticiones que no cumplen el esquema lanzan `pplx_decider.RequestError` antes de cualquier cómputo.

## Casos de uso

- Enrutamiento de tickets de soporte: el ejemplo de la model card clasifica una incidencia entre equipos (`billing`, `support`, `sales`), determina si el cliente está bloqueado (`noul`) y mide la frustración en una escala ordinal (`score`). El modelo es adecuado porque devuelve probabilidades calibradas y responde varias preguntas sobre el mismo estado en una sola llamada.
- Moderación y triaje de contenido: preguntas booleanas y de elección sobre texto de usuario permiten decidir si un mensaje requiere revisión humana, con umbrales ajustados sobre el propio tráfico.
- Extracción estructurada de datos: la operación `locate` permite obtener spans literales (nombres, importes, identificadores) sin generación libre, lo que reduce el riesgo de alucinación y facilita la trazabilidad.
- Clasificación de documentos con imágenes: al aceptar imágenes de hasta 1,6 MP, puede clasificar capturas, facturas escaneadas o pantallas de error junto con el texto asociado.
- Priorización de colas de atención: la puntuación ordinal (`score`) permite ordenar solicitudes por urgencia o sentimiento con una escala definida por el desarrollador.
- Automatización de flujos agénticos: al compartir esquema y API con pplx-decider-v1.3, la versión flash puede sustituir al modelo de 27B en pasos de decisión donde la latencia o el coste pesan más que los últimos puntos de precisión.
- Evaluación por lotes: `decide` acepta listas de peticiones y devuelve respuestas en el mismo orden, lo que encaja en pipelines de anotación o evaluación offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,5 GiB para los pesos en BF16, más memoria de trabajo para activaciones e imágenes.
- GPU: se requiere una GPU CUDA; no se especifican modelos concretos en la información disponible.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo; 8,5 GiB de pesos en BF16 más memoria de trabajo queda por encima de tarjetas de 8 GB y cerca del límite de una RTX 4090 (24 GB), que en principio dispondría de margen suficiente, aunque el autor no lo documenta.
- Despliegue: el uso previsto es mediante el paquete propio (`pip install ./source`) y la clase `Decider.from_pretrained(checkpoint, device="cuda")`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Requisitos de software: Python 3.12 o superior, con torch, transformers, safetensors, pillow, torchvision y huggingface-hub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-flash-v1.3 | 4.539.265.536 | no disponible | Clasificación tipada, multimodal, locate, destilado del 27B | Apache 2.0 | Repositorio privado con token |
| pplx-decider-v1.3 | no disponible (modelo de 27B según la model card) | no disponible | Mismo esquema y capacidades; modelo profesor | no disponible | Repositorio de Perplexity AI en Hugging Face |
| Qwen/Qwen3.5-4B | 4B (modelo base) | no disponible | Generación de texto de propósito general | no disponible | Hugging Face |

La comparación directa con alternativas de la misma categoría (clasificadores con salida tipada y probabilidades calibradas) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni respuestas conversacionales; solo responde a preguntas con el esquema definido.
- En modo `separate`, las preguntas no se ven entre sí; cualquier información necesaria debe incluirse en el estado, no en otra pregunta.
- En modo `isolated`, las respuestas pueden variar ligeramente según el conjunto de preguntas (1,5-2,2 % de respuestas top distintas según el autor).
- La temperatura guardada se ajusta sobre datos de calibración del autor; si la aplicación depende de valores de probabilidad, hay que recalibrar sobre tráfico propio y considerar umbrales por tarea.
- Las probabilidades pueden saturarse en empates; para ranking se recomienda usar el margen de logits de una pregunta `noul`.
- El repositorio es privado y requiere un token de Hugging Face con acceso; no es descargable de forma anónima.
- No se documentan idiomas soportados ni sesgos conocidos.
- No se documentan resultados de benchmarks, por lo que no hay evidencia pública de rendimiento frente a alternativas.
- Riesgo de alucinación: no aplica a la generación de texto libre, pero la operación `locate` y las clasificaciones dependen de la calidad y el formato del estado de entrada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-4B y del código propio incluido en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.3
- Modelo de referencia de la familia: https://huggingface.co/perplexity-ai/pplx-decider-v1.3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog de Perplexity sobre el decider: https://www.perplexity.ai/hub/blog/perplexity-decider
