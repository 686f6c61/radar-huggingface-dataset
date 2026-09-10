# hehe156/paligemma-3b-pt-224

## Resumen

PaliGemma 3B pt 224 es un modelo de vision-lenguaje (VLM) desarrollado por Google que combina un encoder de vision SigLIP-So400m/14 con un decoder de lenguaje Gemma-2B, siguiendo la receta de entrenamiento de PaLI-3. El repositorio analizado, hehe156/paligemma-3b-pt-224, es una copia espejo de terceros de los pesos oficiales google/paligemma-3b-pt-224, publicada con licencia Gemma y acceso restringido mediante gate en Hugging Face. El modelo tiene 2.923.466.480 parametros (~2,92 B) y esta disenado para recibir imagen y texto y generar texto, cubriendo tareas como captioning, respuesta a preguntas visuales, lectura de texto en imagenes, deteccion de objetos y segmentacion.

La variante "pt" corresponde al checkpoint preentrenado, no ajustado a instrucciones: esta pensada para fine-tuning por caso de uso, condicionando el modelo con prefijos de tarea como "detect", "segment" u "ocr". La ventana de texto es de solo 128 tokens de entrada y salida, y la imagen se procesa a 224x224 pixeles, lo que lo posiciona como un modelo ligero y de coste contenido mas que como un asistente conversacional multimodal.

Su relevancia actual radica en que ofrece una base pequena y abierta (bajo terminos Gemma) para tareas visuales acotadas, con pesos disponibles en float32, bfloat16 y float16 para fine-tuning, y compatibilidad con el ecosistema transformers, text-generation-inference y endpoints de Hugging Face. No se han localizado resultados de benchmarks ni documentacion adicional en los resultados de busqueda web disponibles, que no devolvieron informacion tecnica relacionada con este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (inicializado desde Gemma-2B) + encoder de vision Transformer (inicializado desde SigLIP-So400m/14) con proyector, segun la receta de PaLI-3 |
| Parametros totales | 2.923.466.480 (~2,92 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128 tokens de texto de entrada/salida; imagen de entrada de 224x224 pixeles |
| Tipos de cuantizacion | Pesos publicados en float32, bfloat16 y float16; no se documentan cuantizaciones int8/int4 ni GGUF en este repositorio |
| Idiomas soportados | Entrenado con datos multilingues: WebLI y traducciones de CC3M a 34 idiomas adicionales (35 en total con el ingles); lista oficial de idiomas no disponible |
| Licencia | gemma (Gemma Terms of Use), acceso con gate de aceptacion de licencia |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

PaliGemma es la composicion de un encoder de vision y un decoder de lenguaje. El encoder de imagen se inicializa desde SigLIP-So400m/14 y el decoder de texto desde Gemma-2B, unidos mediante un proyector que mapea las representaciones visuales al espacio de tokens del decoder. El entrenamiento sigue las recetas de PaLI-3: la model card indica que el modelo se entreno con prefijos de tarea para dotarlo de un conjunto amplio de capacidades (preguntas y respuestas visuales, captioning, localizacion de objetos, segmentacion, lectura de texto). No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni si hubo fases de RLHF o DPO; al tratarse del checkpoint preentrenado (pt), no se documenta alineacion por preferencias.

Los datos de preentrenamiento declarados son una mezcla de WebLI (dataset web multilingue de pares imagen-texto), CC3M-35L (pares imagen-alt text en ingles traducidos a 34 idiomas con la API de traduccion de Google Cloud), VQ2A-CC3M-35L y VQG-CC3M-35L (preguntas y respuestas visuales sobre el subconjunto VQ2A-CC3M traducido a los mismos 34 idiomas), OpenImages (deteccion y preguntas conscientes de objetos generadas con reglas) y WIT (imagenes y textos de Wikipedia). Sobre WebLI se aplicaron filtros de contenido pornografico, seguridad y toxicidad de texto (Perspective API) y eliminacion de informacion personal mediante la API de Cloud DLP, ademas de filtros de calidad y seguridad adicionales.

## Capacidades

- Generacion de texto condicionada por imagen: captioning corto, respuestas a preguntas visuales y descripciones de escena.
- Deteccion de objetos: con el prefijo de tarea "detect" devuelve coordenadas de bounding boxes de los objetos solicitados.
- Segmentacion: con el prefijo "segment" genera codewords de segmentacion de los objetos indicados en el prompt.
- Lectura de texto en imagenes (OCR visual): reconocimiento de texto presente en la imagen, orientado a documentos, senalizacion o etiquetas.
- Localizacion guiada por lenguaje (grounding): referencias textuales a objetos ("detect the red car") traducidas a coordenadas.
- Capacidades multilingues derivadas del preentrenamiento con WebLI y con CC3M/VQ2A traducidos a 34 idiomas; el nivel real por idioma no esta documentado.
- Entrada multimodal unica: imagen + texto en un unico turno.
- Fine-tuning como mecanismo principal de especializacion por tarea, incluyendo clasificacion de imagen y extraccion de informacion con prompts cortos.
- No dispone de tool calling, function calling, uso de agentes, razonamiento multi-paso ni modo de pensamiento (thinking mode) documentados.
- No es un modelo conversacional: la model card lo describe explicitamente como un modelo de un solo turno, no pensado para uso dialogado.

## Casos de uso

- Respuesta a preguntas visuales en dominio vertical: fine-tuning sobre un corpus propio (por ejemplo, imagenes de mantenimiento industrial) para responder preguntas concretas sobre el estado de una maquina; el modelo es adecuado porque su tamano de ~2,9 B permite iterar y desplegar sin infraestructura de gran escala.
- Deteccion de objetos en control de calidad: con el prefijo "detect" y fine-tuning sobre imagenes de linea de produccion, el modelo devuelve bounding boxes de defectos o piezas; la resolucion fija de 224x224 limita la deteccion de detalles muy finos, por lo que conviene usarlo en objetos de tamano medio o grandes.
- Segmentacion asistida para anotacion de datasets: usar el prefijo "segment" para preanotar mascaras y reducir el coste de etiquetado manual antes de una revision humana.
- OCR de documentos simples: extraccion de texto de tickets, etiquetas o formularios con tipografia clara; la salida esta limitada a 128 tokens, asi que es apto para extracciones cortas y no para digitalizar documentos largos en una sola pasada.
- Catalogacion automatica de productos en comercio electronico: generar descripciones cortas y atributos visuales a partir de fotos de producto, con fine-tuning sobre el catalogo propio para ajustar el estilo y el vocabulario.
- Accesibilidad y descripcion de imagenes: generacion de texto alternativo breve para imagenes en publicaciones o aplicaciones, aprovechando que el modelo produce salidas concisas y de coste bajo.
- Grounding para busqueda visual: localizar objetos descritos en lenguaje natural dentro de una imagen, util en herramientas de inspeccion, inventario o analisis de estanterias.
- Clasificacion de imagenes por prompt: fine-tuning para tareas de etiquetado multiple (por ejemplo, moderacion de contenido o triaje de imagenes) donde la salida esperada es una etiqueta corta, formato que encaja con el limite de 128 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los resultados de busqueda web asociados a esta ficha no devolvieron documentacion tecnica ni metricas del modelo.

## Requisitos de hardware

- Pesos en float32: aproximadamente 11,7 GB (el repositorio ocupa 11,7 GB), por lo que requiere GPU de 16 a 24 GB para inferencia comoda.
- Pesos en bfloat16/float16: aproximadamente 5,8 GB; sumando activaciones del encoder de vision a 224x224, se recomienda un minimo de 10-12 GB de VRAM.
- Cuantizacion int8 (bitsandbytes): aproximadamente 3 GB de pesos; int4 (NF4): aproximadamente 1,8-2,2 GB, lo que permite ejecucion en GPUs consumer de 8 GB como la RTX 4060 o la RTX 3070, con margen para el encoder visual.
- GPUs consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 3090/4090 (24 GB) sin problemas en fp16 o bf16.
- GPUs de datacenter recomendadas para produccion: A100 40/80 GB, H100, L40S y L4; una T4 de 16 GB es suficiente para fp16 con lotes pequenos.
- Opciones de despliegue: transformers con PaliGemmaForConditionalGeneration, text-generation-inference (el repositorio esta etiquetado como text-generation-inference) y Hugging Face Inference Endpoints (etiqueta endpoints_compatible). vLLM incluye soporte para PaliGemma en versiones recientes; no se documentan pesos GGUF oficiales en este repositorio, por lo que el soporte en llama.cpp u Ollama no esta confirmado.
- Latencia y throughput: no disponible. Como referencia estructural, el coste dominante es el paso del encoder de vision una vez por imagen, mientras que el decoder genera como maximo 128 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PaliGemma 3B pt 224 (este repositorio) | ~2,92 B | 128 tokens, imagen 224x224 | Gemma Terms of Use (con gate) | Pesos en safetensors, float32/bf16/fp16 | Checkpoint preentrenado, no conversacional; enfoque en fine-tuning por tarea |
| Qwen2-VL-2B | ~2 B | hasta 32.768 tokens y resolucion de imagen dinamica | Apache-2.0 | Pesos abiertos en Hugging Face | Modelo conversacional con soporte de video y grounding; contexto muy superior |
| SmolVLM (variante de ~2,2 B) | ~2,2 B | varios miles de tokens, segun configuracion | Apache-2.0 | Pesos abiertos en Hugging Face | Orientado a eficiencia y despliegue en dispositivo; tambien ajustado a instrucciones |
| Florence-2-large | ~0,77 B | contexto corto por tarea | MIT | Pesos abiertos en Hugging Face | Fuerte en deteccion, captioning y grounding; menor numero de parametros |

Los datos de contexto y licencia corresponden a las fichas publicas de cada modelo alternativo; no se dispone de comparativas de rendimiento verificadas para este repositorio, ya que no se han publicado benchmarks en la informacion disponible.

## Limitaciones y advertencias

- No es conversacional: la model card indica que es un modelo de un solo turno, no pensado para dialogo multi-turno.
- Limite de 128 tokens de texto de entrada y salida: no admite prompts largos ni respuestas extensas, y descarta tareas de razonamiento en cadena o resumen largo.
- Es un checkpoint preentrenado (pt): sin fine-tuning no sigue instrucciones de forma fiable; el rendimiento depende fuertemente del ajuste por tarea y de los prefijos de tarea usados en el entrenamiento.
- Resolucion de imagen fija de 224x224: pierde detalle en textos pequenos, objetos lejanos o imagenes de alta resolucion, lo que aumenta el riesgo de OCR incorrecto.
- Riesgo de alucinacion: puede generar texto plausible que no aparece en la imagen, especialmente en lectura de texto y en descripciones detalladas.
- Sesgos y filtrado de datos: el preentrenamiento usa WebLI y otros corpus web filtrados con criterios automaticos (pornografia, toxicidad, datos personales), pero persisten sesgos derivados de los datos y de los propios filtros, no cuantificados en la informacion disponible.
- Idioma: aunque el entrenamiento es multilingue (35 idiomas en CC3M-35L), no hay lista oficial de idiomas ni evaluacion por idioma; el castellano no esta verificado.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, con obligaciones de uso aceptable y atribucion; el acceso esta bloqueado por un gate en Hugging Face que exige aceptar la licencia de Google.
- Repositorio espejo de terceros: hehe156/paligemma-3b-pt-224 no es el repositorio oficial de Google, registra 0 descargas y 0 likes, y muestra fecha de creacion y actualizacion de 2026-09-10. Conviene verificar la integridad de los pesos contra google/paligemma-3b-pt-224 antes de usarlos en produccion.
- Ausencia de datos de rendimiento: no hay benchmarks publicados en la informacion disponible, por lo que cualquier decision de despliegue deberia basarse en una evaluacion propia sobre el caso de uso concreto.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo (los resultados obtenidos no guardan relacion con IA), de modo que no se ha podido contrastar informacion adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hehe156/paligemma-3b-pt-224
- Repositorio oficial de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Pagina del modelo PaliGemma (Google): https://ai.google.dev/gemma/docs/paligemma
- PaliGemma en Kaggle: https://www.kaggle.com/models/google/paligemma
- PaliGemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/363
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Terminos de uso: https://www.kaggle.com/models/google/paligemma/license/consent/verify/huggingface?returnModelRepoId=google/paligemma-3b-pt-224
- PaLI-3 (paper base de la receta de entrenamiento): https://arxiv.org/abs/2310.09199
- SigLIP (encoder de vision): https://arxiv.org/abs/2303.15343
- Gemma (modelo de lenguaje base): https://arxiv.org/abs/2403.08295
- WebLI (dataset de preentrenamiento): https://arxiv.org/abs/2209.06794
- OpenImages (datos de deteccion y preguntas conscientes de objetos): https://arxiv.org/abs/2209.04372
- WIT (imagenes y textos de Wikipedia): https://arxiv.org/abs/2103.01913
- CC3M (pares imagen-texto): https://aclanthology.org/P18-1238/
- VQ2A-CC3M (preguntas y respuestas visuales): https://aclanthology.org/2022.naacl-main.142/
- Referencias adicionales citadas en las etiquetas del repositorio (Transformer, ViT y otros papers): https://arxiv.org/abs/1706.03762, https://arxiv.org/abs/2010.11929, https://arxiv.org/abs/2110.11624, https://arxiv.org/abs/2108.03353, https://arxiv.org/abs/2010.04295, https://arxiv.org/abs/2401.06209, https://arxiv.org/abs/2305.10355, https://arxiv.org/abs/2203.10244, https://arxiv.org/abs/1810.12440, https://arxiv.org/abs/1905.13648, https://arxiv.org/abs/1608.00272, https://arxiv.org/abs/1908.04913, https://arxiv.org/abs/2407.07726
- Facts and figures de OpenImages: https://storage.googleapis.com/openimages/web/factsfigures_v7.html
- Perspective API (filtrado de toxicidad): https://perspectiveapi.com/
- Cloud Data Loss Prevention (filtrado de informacion personal): https://cloud.google.com/security/products/dlp
