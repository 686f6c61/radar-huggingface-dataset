# sekkit/d1-omni-600M

## Resumen

d1-omni-600M es un modelo de decisión de 587 millones de parámetros construido por Liquid AI sobre su encoder LFM2.5-Encoder-350M. No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente acompañado de imágenes o de un clip de voz) y un conjunto de preguntas con nombre, y devuelve respuestas tipadas leídas directamente de la distribución del modelo sobre las opciones. No emite tokens de salida ni requiere parseo posterior, lo que elimina latencia de decodificación y errores de formato en pipelines de clasificación.

La arquitectura es multimodal en un único forward pass: un tronco compartido de 381M de parámetros (encoder más cabeza de decisión) al que se añaden un encoder visual SigLIP2 de 94M, heredado de LFM2.5-VL-450M, y un encoder de audio FastConformer de 17 capas y 112M. Todas las modalidades usan los mismos pesos de tronco. La longitud de contexto es de 16.384 tokens sumando posiciones de texto, imagen y audio, aunque en modo imagen el estado y las preguntas se recortan a 896 tokens tal y como se entrenó.

Su relevancia práctica está en el despliegue en el borde: 587M de parámetros permiten ejecutarlo en CPU, Apple Silicon (MPS) o una GPU de consumo, con licencia LFM 1.0 y soporte para 15 idiomas. Está pensado para enrutado, triaje, moderación, clasificación de intención y tema, validación de extracciones, reranking y guardrails de agentes, no como asistente conversacional. El repositorio analizado (sekkit/d1-omni-600M) es una publicación del modelo de Liquid AI bajo el identificador de un tercero, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (tronco LFM2.5) con cabeza de decisión; encoder visual SigLIP2 y encoder de audio FastConformer de 17 capas |
| Parametros totales | 587.161.089 (381M tronco y cabeza de decisión + 94M visión + 112M audio) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 16.384 tokens (texto, imagen y audio juntos); con imágenes, el estado y las preguntas se recortan a 896 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se anuncian GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh (15 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0); consultar el archivo LICENSE del repositorio |
| Formato de pesos | safetensors, con código propio del modelo (requiere `trust_remote_code=True`) |
| Vocabulario | 65.536 tokens |
| Librería y versión mínima | transformers >= 5.15 |
| Pipeline declarado | image-text-to-text |
| Modelo base | LiquidAI/LFM2.5-Encoder-350M (finetune) |
| Tamaño del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

El modelo parte del encoder LiquidAI/LFM2.5-Encoder-350M, un encoder de propósito general de 350M de parámetros, y se post-entrena para emitir decisiones en una sola pasada. Sobre ese tronco se añade una cabeza de decisión de 381M en total y dos encoders específicos de modalidad: una torre visual SigLIP2 de 94M procedente de LFM2.5-VL-450M y un encoder de audio FastConformer de 17 capas y 112M. La particularidad es que cada modalidad reutiliza los mismos pesos de tronco: la imagen o el audio se codifican una sola vez y sirven para todas las preguntas asociadas a ese estado, lo que abarata el coste cuando se lanzan varias preguntas sobre el mismo input.

El mecanismo de inferencia es lo que el autor denomina «system-one»: dado un estado y un conjunto de preguntas declaradas con tipos (`noul`, `choice`, `score`) y criterios con nombre, la respuesta se obtiene leyendo la distribución del modelo sobre las opciones, sin generación autorregresiva y sin parsing de texto. El resultado es cero tokens de salida. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si se aplicaron etapas de RLHF o DPO; tampoco se especifica la semántica exacta del tipo `noul` más allá de su uso como pregunta de sí/no en el ejemplo de código.

## Capacidades

- Decisión tipada sobre un estado: preguntas con nombre y respuestas tipo `noul`, `choice` (elección entre criterios con nombre) y `score` (valoración sobre una escala ordinal definida por el usuario).
- Visión-lenguaje: acepta imágenes junto al texto, varias imágenes por estado y tramificación de fotogramas grandes, en una sola pasada.
- Audio-lenguaje: acepta hasta 30 segundos de habla a 16 kHz mono en la misma pasada que el texto.
- Multimodalidad con tronco compartido: la imagen o el audio se codifican una vez para todas las preguntas del estado.
- Procesamiento por lotes mediante `system_one_batch`, con listas de tuplas (estado, preguntas) e imágenes o audio opcionales.
- Multilingüe en 15 idiomas, incluidos español, inglés, alemán, francés, árabe, hindi, japonés y chino.
- No soporta tool calling, no soporta razonamiento multi-paso ni agentes por sí mismo y no genera texto: no es un modelo de chat.

## Casos de uso

- Enrutado y triaje de tickets de soporte: se declara un `choice` con los equipos disponibles (facturación, técnico, fraude) y el modelo devuelve el equipo en una sola pasada, sin coste de decodificación y apto para ejecutarse en CPU junto al sistema de ticketing.
- Moderación de contenido: preguntas `noul` y `score` sobre el texto de un comentario o mensaje para decidir si requiere revisión humana, con umbrales configurables sobre la escala ordinal.
- Clasificación de intención y tema en asistentes de voz: con hasta 30 segundos de audio por clip, se puede etiquetar qué tipo de enunciado es, su tema y qué pide el hablante, útil para enrutar comandos de voz antes de invocar un modelo mayor.
- Guardrails de agentes: antes de ejecutar una acción propuesta por un LLM, se formula una pregunta `noul` sobre su idoneidad y se lee la respuesta como señal de bloqueo; al no generar texto, el coste y la latencia añadidos al bucle del agente son mínimos.
- Validación de extracciones documentales: tras un pipeline de OCR o extracción estructurada, se comprueba con preguntas `choice` y `score` si el campo extraído es coherente (por ejemplo, si el importe y la fecha corresponden al mismo documento).
- Inspección visual y control de calidad: con una o varias imágenes por estado, decidir si una pieza presenta defecto, contar objetos o clasificar una escena; el ejemplo de la model card resuelve «cuántos gatos hay» con opciones discretas.
- Puntuación masiva offline de encuestas o reseñas: `system_one_batch` permite procesar miles de textos en lotes sobre una sola GPU de consumo o incluso en CPU, obteniendo escalas ordinales comparables sin muestreo estocástico.
- Reranking de resultados de búsqueda: dado un par consulta-documento como estado, un `score` ordinal permite reordenar candidatos con una pasada por par.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, calibración ni comparativas cuantitativas con otros modelos, pese a que la etiqueta `calibration` figura entre los tags del repositorio.

## Requisitos de hardware

- Pesos en fp16: aproximadamente 1,2 GB (587M de parámetros). En fp32, unos 2,3 GB, coincidiendo con el tamaño del repositorio.
- VRAM estimada para inferencia en fp16: en torno a 2-3 GB contando encoders de visión y audio y activaciones con contexto largo (estimación a partir del número de parámetros, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; el modelo está dimensionado para el borde, por lo que una RTX 3060, RTX 4060 o superior es suficiente. En A100/H100 no aporta ventaja frente a GPUs pequeñas salvo por el procesamiento por lotes.
- Cabe en GPU de consumo: sí, y también en CPU y en Apple Silicon vía MPS, según el código de ejemplo de la model card (`cuda`, `mps` o `cpu`, con fp16 en acelerador y fp32 en CPU).
- Opciones de despliegue: `transformers>=5.15` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; requiere `torch`, `torchvision`, `pillow` y `soundfile`. No se anuncian integraciones con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF y la presencia de código propio hacen improbable su uso directo en esos runners sin trabajo adicional.
- Latencia y throughput: no disponibles. Al no generar tokens de salida, la latencia equivale a un único forward pass, y el coste marginal de añadir preguntas sobre el mismo estado es bajo porque el medio se codifica una sola vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-omni-600M | 587M | 16.384 tokens (896 con imagen) | Texto, imagen, audio | lfm1.0 | safetensors con código propio, transformers >= 5.15 |
| LiquidAI/LFM2.5-Encoder-350M | 350M | no disponible | Texto | no disponible en la informacion | safetensors; modelo base sin post-entrenamiento de decisión |
| LiquidAI/LFM2.5-VL-450M | 450M | no disponible | Texto e imagen | no disponible en la informacion | safetensors; origen de la torre visual SigLIP2 de 94M |

La comparación relevante es frente a su propio modelo base y frente al modelo del que hereda el encoder visual: d1-omni-600M añade audio, la cabeza de decisión y el modo de inferencia sin generación, a cambio de un mayor número de parámetros (587M frente a 350M y 450M). No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría, como clasificadores basados en encoders BERT o routers construidos sobre LLM generativos.

## Limitaciones y advertencias

- No es un modelo de chat ni genera texto: solo responde a preguntas declaradas con tipos y criterios predefinidos. Cualquier uso que espere texto libre fallará.
- La capacidad de audio se entrenó con peticiones entre un hablante en inglés y un asistente; los clips se cortan a 30 segundos, por lo que el rendimiento en otros idiomas o en audio espontáneo no está documentado.
- En modo imagen, el estado y el texto de las preguntas se recortan a 896 tokens, lo que limita la cantidad de instrucciones o contexto textual que acompaña a una imagen.
- Riesgo de alucinación acotado por diseño (la respuesta se restringe a las opciones declaradas), pero la calibración de las probabilidades no está publicada ni verificada por benchmarks, pese a la etiqueta `calibration` del repositorio.
- Sesgos: no se documenta la composición del dataset de post-entrenamiento ni se incluye una evaluación de sesgos; al heredar el tronco de un encoder general, puede reproducir sesgos presentes en los datos del modelo base.
- Licencia lfm1.0 (license: other): es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones no se detallan en la información disponible.
- Requiere `trust_remote_code=True`: el repositorio incluye código propio que se ejecuta en el proceso del usuario, lo que implica una revisión de seguridad antes de usarlo en producción.
- Dependencia de `transformers>=5.15`, una versión muy reciente, lo que puede complicar la integración en entornos con versiones fijadas.
- El repositorio consultado pertenece al usuario `sekkit` y no a la organización Liquid AI, con 0 descargas y 0 likes; conviene verificar la procedencia y el hash de los pesos frente al repositorio oficial antes de desplegarlo.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/sekkit/d1-omni-600M
- Repositorio oficial del modelo (referido en la model card): https://huggingface.co/LiquidAI/d1-omni-600M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
- Modelo del que procede la torre visual: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Blog sobre open d1: https://www.liquid.ai/blog/open-d1
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de LFM: https://playground.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Referencia arXiv indicada en los tags del repositorio: https://arxiv.org/abs/2511.23404 (el contenido del paper no está disponible en la información proporcionada)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron páginas sin relación con el contenido técnico de la ficha.
