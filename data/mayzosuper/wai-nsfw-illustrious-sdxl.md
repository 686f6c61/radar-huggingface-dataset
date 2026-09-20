# MAYZOSUPER/wai-nsfw-illustrious-sdxl

## Resumen

wai-nsfw-illustrious-sdxl es un checkpoint de generacion de imagenes a partir de texto (text-to-image) publicado por el usuario MAYZOSUPER en Hugging Face. Se trata de un fine-tune del pipeline `StableDiffusionXLPipeline` de diffusers, es decir, un derivado de la familia SDXL de Stability AI, orientado a ilustracion con estetica anime/semi-realista y con capacidad explicita de generar contenido para adultos, como indica la etiqueta `not-for-all-audiences` del repositorio. El recuento de parametros almacenado en el fichero safetensors es de 2.567.463.684, cifra que coincide con el UNet de SDXL.

El repositorio ocupa 13,9 GB y se distribuye con licencia CreativeML OpenRAIL-M, la misma que la de SDXL base. La model card no incluye informacion sobre el dataset de entrenamiento, el proceso de ajuste, los idiomas soportados ni resultados de evaluacion: se limita practicamente a instrucciones de uso de la API de ModelsLab, servicio con el que el checkpoint esta integrado mediante el tag `endpoints_compatible`. El propio autor etiqueta el modelo como `ultra-realistic` y lo asocia al endpoint `wai-nsfw-illustrious-sdxl` de esa plataforma.

Su relevancia practica es limitada y muy acotada: se trata de un checkpoint con cero descargas y cero likes en el momento de la consulta, sin documentacion tecnica publicada y con un caso de uso restringido a generacion de imagenes, incluyendo contenido NSFW. No sustituye a un modelo de lenguaje ni ofrece capacidades de razonamiento, codigo o tool calling; cualquier evaluacion debe hacerse en el marco de modelos de difusion para imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (UNet) sobre pipeline SDXL; `StableDiffusionXLPipeline` de diffusers |
| Parametros totales | 2.567.463.684 (fichero safetensors, corresponde al UNet de SDXL) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; limite de tokens del prompt segun los text encoders de SDXL (no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el repo contiene safetensors sin variantes GGUF/ONNX declaradas |
| Idiomas soportados | no disponible |
| Licencia | creativeML OpenRAIL-M |
| Formato de pesos | safetensors (libreria diffusers); el repo ocupa 13,9 GB |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura mas alla de la libreria y el pipeline declarados. El tag `diffusers:StableDiffusionXLPipeline` y el recuento exacto de parametros (2.567.463.684, identico al UNet de SDXL) permiten afirmar que se trata de un fine-tune de SDXL, un modelo de difusion latente con un UNet como red de denoising y dos text encoders CLIP (OpenCLIP ViT-bigG y CLIP ViT-L) que alimentan el condicionamiento cruzado. El pipeline SDXL tambien incorpora tecnicas como el micro-conditioning por tamano y recorte de imagen, y un VAE con correccion de shift. No obstante, el autor no confirma ninguno de estos extremos en la model card.

Tampoco hay datos sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, la resolucion de entrenamiento, el uso de DreamBooth, LoRA fusionados o ajuste completo, ni sobre si se aplicaron etapas de refinamiento, RLHF o DPO (estas ultimas no son habituales en modelos de difusion). La unica pista sobre el proceso es la nomenclatura del checkpoint (`wai-nsfw-illustrious`), que sugiere una fusion o derivacion a partir de checkpoints de la familia Illustrious/WAI orientados a anime, pero esto no esta confirmado en la documentacion. El tamano del repositorio (13,9 GB) es coherente con pesos en fp32 del pipeline completo, aunque el autor no especifica la precision de los ficheros.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) mediante el pipeline SDXL de diffusers.
- Acepta prompt positivo y prompt negativo, tal como muestran los ejemplos de llamada a la API incluidos en la model card.
- Parametros de inferencia configurables: `width`, `height`, `samples`, `num_inference_steps`, `guidance_scale`, `seed`.
- Generacion de contenido para adultos, explicitamente etiquetada con `not-for-all-audiences`; en el ejemplo de API el autor fija `safety_checker: "no"`.
- Estilo declarado por el autor: `ultra-realistic`, con nomenclatura que apunta a ilustracion anime.
- Integracion con la API HTTP de ModelsLab (`https://modelslab.com/api/v6/images/text2img`), con soporte de `enhance_prompt`, `upscale`, `multi_lingual`, `panorama`, `self_attention`, `embeddings`, `lora` y `webhook` a nivel de API.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, vision, audio ni generacion de codigo: es un modelo exclusivamente de sintesis de imagen.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el parametro `multi_lingual` del ejemplo de API se envia como `"no"`).

## Casos de uso

- Prototipado de personajes para ilustracion estilo anime: el checkpoint se usaria con prompts descriptivos y un negative prompt que penalice anatomia incorrecta, para generar hojas de personaje y explorar variaciones de diseno antes de producir el arte final.
- Iteracion de concept art en estudios pequenos: al ser un modelo ligero en terminos de parametros (2,57 B en el UNet), permite generar lotes de bocetos en una GPU de consumo y descartar rapidamente las direcciones que no funcionan.
- Generacion de contenido para adultos en plataformas que lo permitan: seria el caso de uso principal segun las etiquetas del repositorio, siempre que se implementen verificacion de edad, moderacion y cumplimiento legal en la jurisdiccion de despliegue.
- Base para fine-tuning con LoRA o DreamBooth: al ser un derivado de SDXL, se puede reentrenar con adaptadores de bajo rango para fijar un estilo de estudio, un personaje recurrente o una paleta concreta, partiendo de un checkpoint ya sesgado hacia ilustracion.
- Integracion como endpoint gestionado mediante la API de ModelsLab: el autor documenta el identificador `model_id: "wai-nsfw-illustrious-sdxl"` y un ejemplo en Python con `requests`, lo que permite incorporarlo a un backend sin desplegar infraestructura propia de GPU.
- Automatizacion de pipelines de generacion por lotes: usando `samples`, `seed` y `webhook`, se pueden lanzar trabajos asincronos y encadenar la respuesta con etapas posteriores de upscaling o revision, aunque la calidad final dependera del control de calidad humano.
- Servicio de avatares o ilustraciones para aplicaciones de entretenimiento: con resoluciones de 512x512 y 30 pasos, como en el ejemplo oficial, encaja en flujos donde la latencia importa mas que la resolucion final.
- Investigacion sobre sesgos y seguridad en modelos de difusion: el checkpoint es un caso de estudio util para medir como un fine-tune sin `safety_checker` afecta a la generacion de contenido no apto y que tecnicas de filtrado funcionan en la practica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros checkpoints. Los resultados de la busqueda web proporcionada no contienen informacion relacionada con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de un UNet de 2,57 B parametros y del pipeline SDXL, se necesitan aproximadamente 6-8 GB de VRAM con pesos en fp16 y generacion a 1024x1024; en fp32 el requisito sube a unos 12-14 GB (el repositorio ocupa 13,9 GB). Son estimaciones basadas en el tamano del modelo, no en mediciones publicadas por el autor.
- GPU recomendadas: NVIDIA RTX 3060 12 GB o superior para fp16 a resoluciones medias; RTX 4070 Ti / 4080 / 4090 para lotes o resoluciones altas; A100 o H100 en despliegues con concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en fp16. Con 6 GB es posible usando atencion eficiente y descarga de pesos a CPU, a costa de latencia.
- Opciones de despliegue: `diffusers` (libreria declarada), ComfyUI, AUTOMATIC1111 / SD.Next / Foroocus para uso local, y la API gestionada de ModelsLab. El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. vLLM, TGI y llama.cpp no son aplicables: son runners para modelos de lenguaje, no para pipelines de difusion.
- Latencia y throughput: no disponibles. El ejemplo de la model card usa 30 pasos de inferencia y 512x512, valores habituales que situan la generacion en el orden de segundos por imagen en una GPU de gama media, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wai-nsfw-illustrious-sdxl | 2,57 B (UNet) | no aplica | no disponible | CreativeML OpenRAIL-M | Hugging Face + API ModelsLab |
| SDXL base 1.0 | ~2,6 B UNet + text encoders y VAE | no aplica | benchmarks publicos por Stability AI | CreativeML OpenRAIL-M | Hugging Face, diffusers |
| Pony Diffusion V6 XL (derivado de SDXL) | ~2,6 B UNet | no aplica | no disponible en esta consulta | CreativeML OpenRAIL-M | Hugging Face, Civitai |
| Checkpoint original WAI-NSFW-illustrious-SDXL | no disponible | no aplica | no disponible | CreativeML OpenRAIL-M | Civitai, Hugging Face |

La comparacion se limita a la categoria (derivados de SDXL para ilustracion y contenido para adultos). No hay datos de rendimiento publicados para este checkpoint concreto que permitan una comparacion cuantitativa, y los parametros de las alternativas se indican como referencia de arquitectura, no como medicion verificada en esta consulta.

## Limitaciones y advertencias

- Contenido no apto para todos los publicos: el repositorio lleva la etiqueta `not-for-all-audiences` y el ejemplo oficial desactiva el `safety_checker`. Cualquier despliegue publico exige moderacion, verificacion de edad y cumplimiento normativo.
- Riesgo elevado de resultados anatomicamente incorrectos: el propio autor recomienda un negative prompt largo con terminos como `extra fingers`, `mutated hands`, `bad anatomy`, lo que indica que estos fallos son frecuentes.
- Alucinacion visual: como todo modelo de difusion, puede generar elementos incoherentes con el prompt, texto ilegible en la imagen y composiciones fisicamente imposibles. No existe verificacion factual.
- Sesgos: no hay documentacion sobre la composicion del dataset. Los checkpoints de esta familia suelen estar sesgados hacia cuerpos delgados, rasgos juvenilizados y una representacion limitada de diversidad etnica y corporal, pero no se ha publicado ninguna evaluacion para este modelo.
- Idiomas: no disponibles. Los text encoders de SDXL estan entrenados principalmente en ingles, por lo que prompts en castellano pueden degradar el resultado.
- Contexto del prompt: limitado por los text encoders de SDXL (habitualmente 77 tokens por encoder), no apto para descripciones muy largas.
- Licencia: CreativeML OpenRAIL-M permite uso comercial con las restricciones de uso descritas en la propia licencia (prohibicion de usos ilicitos, daninos o de vigilancia masiva, entre otros). No es una licencia de codigo abierto permisiva sin condiciones.
- Trazabilidad: cero descargas, cero likes y ausencia de documentacion sobre entrenamiento. No se puede auditar el dataset ni verificar que no contenga material con derechos o contenido problematico.
- Sin garantias de mantenimiento: la model card es esencialmente material promocional de la API de ModelsLab e incluye un cupon de descuento, lo que sugiere que el repositorio funciona como escaparate comercial mas que como publicacion tecnica.
- No apto para tareas de texto, razonamiento, codigo o agentes: es un pipeline de difusion, no un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MAYZOSUPER/wai-nsfw-illustrious-sdxl
- Pagina del modelo en ModelsLab: https://modelslab.com/models/wai-nsfw-illustrious-sdxl
- Generacion de prueba en ModelsLab: https://modelslab.com/models/wai-nsfw-illustrious-sdxl
- Documentacion de la API de ModelsLab: https://docs.modelslab.com
- Endpoint de text2img: https://modelslab.com/api/v6/images/text2img
- Catalogo de modelos de ModelsLab: https://modelslab.com/models
- Paper, blog o repositorio de entrenamiento: no disponible
- Demo independiente: no disponible
- Los resultados de la busqueda web proporcionada no contienen enlaces relacionados con este modelo.
