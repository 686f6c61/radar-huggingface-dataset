# RunningHubAI/rh-perfect-floor-plan-lora

## Resumen

rh-perfect-floor-plan-lora es un adaptador LoRA de edicion de imagen publicado por la cuenta RunningHubAI en Hugging Face. Segun su model card, esta afinado a partir del modelo base krea2 y su proposito declarado es la generacion y mejora de planos de planta (floor plans). Se distribuye como un unico archivo safetensors de 218 MiB, con un rango de LoRA de 32, y esta pensado para cargarse en ComfyUI, en la plataforma RunningHub o mediante la API de esta ultima.

El repositorio tiene un tamano total de 0,2 GB, cero descargas y cero likes en el momento de la consulta, y no incluye informacion sobre licencia, idiomas soportados, composicion del dataset de entrenamiento ni resultados de evaluacion. La model card esta mayoritariamente en chino e ingles y se limita a enlazar la plataforma comercial de RunningHub y el proyecto original alojado en su web.

Es relevante ahora por dos motivos contrapuestos. Por un lado, ilustra el flujo actual de publicacion de LoRA especializados verticalmente (arquitectura, interiorismo, renders tecnicos) listos para consumirse desde ComfyUI. Por otro, su metadata presenta inconsistencias graves: el apartado "About this model" enlaza a un modelo de Civitai con un nombre explicito de contenido para adultos y el propio archivo de pesos se llama `Krea_2_innie_rank_32_000002000.safetensors`, lo que no concuerda con la funcion declarada de generar planos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusion krea2 |
| Parametros totales | no disponible (adaptador de 218 MiB, rango 32) |
| Longitud de contexto | no aplicable (modelo de imagen) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible (los prompts de texto dependen del codificador del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base | krea2 |
| Rango de LoRA | 32 (segun el nombre del archivo) |
| Archivo de pesos | `Krea_2_innie_rank_32_000002000.safetensors` (218 MiB) |
| Pipeline declarado | image-text-to-image |
| Tamano del repositorio | 0,2 GB |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Peso recomendado de aplicacion | 1 (elevar si se combina con otros LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un modelo completo. La unica informacion tecnica disponible es que esta afinado desde krea2 y que el checkpoint tiene rango 32, un valor habitual en LoRA de difusion orientados a capturar un concepto o estilo concreto sin reentrenar el modelo base. El archivo `Krea_2_innie_rank_32_000002000.safetensors` sugiere 2.000 pasos de entrenamiento, pero este dato no se confirma en la model card.

No se especifica el numero de imagenes de entrenamiento, la composicion del dataset, si hubo regularizacion, captioning, tecnicas de RLHF/DPO (no aplicables en generacion de imagen) ni innovaciones como decodificacion especulativa. El autor indica unicamente que el peso de aplicacion recomendado es 1 y que, al combinar varios LoRA, conviene subirlo para obtener un efecto apreciable.

## Capacidades

- Edicion y generacion de imagenes condicionada por texto sobre el modelo base krea2 (pipeline image-text-to-image).
- Especializacion declarada en planos de planta (floor plans), presumiblemente orientada a producir vistas cenitales de distribucion de estancias.
- Integracion con ComfyUI mediante nodos de carga de LoRA.
- Compatibilidad con el flujo alojado de RunningHub, incluida su API, sin necesidad de infraestructura propia.
- Posibilidad de combinarse con otros LoRA ajustando el peso, segun indica el autor.
- Generacion de imagen a partir de imagen de entrada mas prompt de texto (image edit).
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, audio ni video.
- No hay evidencia de capacidades multilingues en los prompts; depende del codificador de texto del modelo base.

## Casos de uso

- Generacion de planos de planta preliminares en inmobiliaria: generar distribuciones cenitales a partir de una descripcion textual para nutrir anuncios o fichas de producto antes de contar con un plano tecnico definitivo.
- Ideacion arquitectonica rapida: producir variaciones de distribucion para explorar alternativas de estancias, pasillos y nucleos de comunicacion en fases tempranas de diseno.
- Interiorismo y home staging virtual: combinar el LoRA con renders de interiores para visualizar la distribucion del mobiliario sobre una planta generada.
- Aumento de datos para vision por computador: crear imagenes sinteticas de planos etiquetados para preentrenar o aumentar modelos de deteccion de estancias, puertas o ventanas, siempre que se valide la coherencia estructural de la salida.
- Marketing de promociones inmobiliarias: generar bocetos de planta atractivos para folletos y campanas, con revision humana posterior obligatoria.
- Prototipado en ComfyUI dentro de pipelines de estudio: encadenar este LoRA con nodos de upscaling o de control para iterar sobre una misma distribucion sin reentrenar nada.
- Formacion y divulgacion: ilustrar conceptos de distribucion espacial en material docente, dejando claro que la salida no sustituye a un plano tecnico.
- Automatizacion via API de RunningHub: integrar la generacion de planos en un flujo de trabajo cloud sin gestionar GPUs propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas FID, CLIP score, similitud estructural ni evaluaciones humanas para este adaptador, ni tampoco comparaciones cuantitativas con otros LoRA de planos de planta.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 0,25 GB en safetensors; el consumo real lo determina el modelo base krea2, cuyos requisitos no se documentan en la informacion disponible.
- El adaptador no anade una carga significativa de VRAM frente al modelo base; se suma al peso de este durante la inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada. Como referencia general del sector para difusion en precision fp16, se suele trabajar con 8-16 GB de VRAM, pero este dato no procede del autor y debe verificarse.
- Encaje en GPU de consumo: no confirmado. Depende enteramente del modelo base krea2.
- Opciones de despliegue: ComfyUI (flujo local), plataforma RunningHub (cloud) y API de RunningHub. No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI, herramientas no aplicables a un LoRA de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-perfect-floor-plan-lora | LoRA de imagen | krea2 | 218 MiB (rango 32) | no aplicable | no disponible | Hugging Face, RunningHub |
| rh-more-realistic-floor-plans-and-hair-lora | LoRA de imagen | no disponible en la informacion recogida | no disponible | no aplicable | no disponible | Hugging Face, RunningHub |
| LoRA genericos de arquitectura en Civitai | LoRA de imagen | SD 1.5, SDXL, FLUX y derivados | variable | no aplicable | variable, frecuentemente no comercial | Civitai, Hugging Face |

No se dispone de datos de rendimiento, parametros ni licencia de las alternativas citadas, por lo que la comparacion cuantitativa no es posible con la informacion disponible.

## Limitaciones y advertencias

- Inconsistencia grave de metadata: el apartado "About this model" enlaza a un modelo de Civitai cuyo nombre describe contenido sexual explicito, y el archivo de pesos se denomina `Krea_2_innie_rank_32`, lo que no se corresponde con la funcion declarada de generar planos de planta. Debe verificarse el contenido real del adaptador antes de cualquier uso.
- Licencia no disponible: la model card solo indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream. Esto impide determinar si el uso comercial esta permitido. Riesgo juridico relevante para produccion.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad ni evidencia de que el adaptador funcione segun lo declarado.
- Ausencia total de documentacion sobre el dataset de entrenamiento: se desconocen sesgos, procedencia de las imagenes y posibles problemas de derechos.
- Riesgo de salidas estructuralmente incoherentes: los modelos generativos de imagen no garantizan coherencia arquitectonica (muros que no cierran, escalas imposibles, huecos sin sentido). No sustituyen a un plano tecnico ni a un software CAD.
- Dependencia del modelo base krea2: cualquier limitacion, licencia o requisito de hardware de ese modelo se hereda.
- Idioma: no se especifica soporte de idiomas en los prompts; la calidad con prompts en castellano no esta garantizada.
- Sin benchmarks ni evaluacion publicada: no hay base objetiva para estimar la calidad de la salida.
- Riesgo de alucinacion visual: el modelo puede inventar habitaciones, mobiliario o elementos estructurales ausentes en la descripcion de entrada.
- Contenido potencialmente inapropiado: dado el enlace y el nombre del checkpoint, existe riesgo de que el adaptador reproduzca contenido para adultos no deseado en un pipeline de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-perfect-floor-plan-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2072962661570138114
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- LoRA relacionado del mismo autor: https://huggingface.co/RunningHubAI/rh-more-realistic-floor-plans-and-hair-lora
- Repositorio relacionado: https://huggingface.co/RunningHubAI/rh-2101354719968059394-lora
- Modelo citado en la model card (Civitai): https://civitai.red/models/2744291/innie-vagina-puffy-labia-majora?modelVersionId=3093725
