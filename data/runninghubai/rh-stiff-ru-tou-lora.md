# RunningHubAI/rh-stiff-ru-tou-lora

## Resumen

rh-stiff-ru-tou-lora es un adaptador LoRA de edicion de imagen (pipeline `image-text-to-image`) publicado por RunningHubAI en HuggingFace, atribuido al usuario "氛围感" de la plataforma RunningHub. No es un modelo generativo autonomo: es un peso adicional de 109 MiB en formato `safetensors` que se carga sobre un modelo base de difusion identificado en la model card como "krea2", y que modifica un rasgo anatomico concreto en imagenes generadas o editadas. La model card indica un "dosage" recomendado de 0,8 a 0,95 como escala de intensidad del efecto, lo que lo situa en la categoria de LoRA de control fino de atributos.

Su relevancia es limitada y muy especializada: se trata de un adaptador de contenido para adultos (18+), redistribuido desde CivitAI, sin documentacion tecnica publicada, sin licencia declarada, sin idiomas declarados y con 0 descargas y 1 like en el momento de la consulta. Para un desarrollador o investigador no es un modelo de proposito general ni una pieza de infraestructura: es un ejemplo tipico del ecosistema de LoRA comunitarios para ComfyUI, con un unico archivo y metadata minima (repo de 0,1 GB, creado y actualizado el 24 de septiembre de 2026 segun los metadatos de HuggingFace).

La informacion disponible es escasa: no se documentan rango del LoRA, dimensiones de las matrices, dataset de entrenamiento, numero de pasos, learning rate, ni resultados de evaluacion. Todo lo que no aparece en la model card se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre modelo base de difusion; base declarada: "krea2" |
| Parametros totales | no disponible (adaptador de bajo rango; no se declara el rango ni el numero de parametros) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; la resolucion y el limite de tokens de prompt dependen del modelo base) |
| Tipos de cuantizacion | no disponible (se distribuye un unico archivo `safetensors`; no hay variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los prompts dependen del codificador de texto del modelo base) |
| Licencia | no disponible. La model card indica: "Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license" |
| Formato de pesos | `safetensors` (archivo `hardnipples_v2_000001750.safetensors`, 109 MiB) |
| Tipo de modelo | LoRA de edicion de imagen (image edit / image-text-to-image) |
| Tamano del repositorio | 0,1 GB |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Escala de aplicacion recomendada | 0,8 - 0,95 (segun la model card) |
| Version del adaptador | v2 (segun el nombre del archivo: `v2_000001750`) |
| Contenido | Para adultos (18+); efecto anatomico explicito |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es que se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base para desplazar sus pesos sin reentrenarlo por completo. El modelo base declarado es "krea2", y el pipeline declarado es `image-text-to-image`, lo que implica que el adaptador opera en un flujo de edicion condicionada por texto sobre imagenes de entrada. No se publica el rango del LoRA, las capas objetivo (attention, cross-attention, MLP), ni si se entrena sobre el UNet, el transformer de difusion o el codificador de texto.

No hay informacion sobre el proceso de entrenamiento: ni numero de imagenes, ni composicion del dataset, ni resolucion de entrenamiento, ni pasos, ni optimizador, ni uso de regularizacion o de tecnicas como LoRA con dropout. Tampoco se documenta ningun ajuste posterior tipo RLHF, DPO o fine-tuning por preferencias, algo poco habitual en este tipo de adaptadores. No se declara ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, etc.). El nombre del archivo (`hardnipples_v2_000001750`) sugiere una segunda version del adaptador y un identificador de paso de entrenamiento, pero esto es una inferencia a partir del nombre, no un dato confirmado por el autor.

## Capacidades

- Edicion de imagen condicionada por texto sobre el modelo base Krea 2: modifica un atributo anatomico concreto en la imagen de entrada o generada.
- Aplicacion con intensidad graduable: la model card recomienda un strength entre 0,8 y 0,95, lo que permite controlar la magnitud del efecto mediante el nodo de carga de LoRA en ComfyUI.
- Composicion con otros LoRA y con el resto del pipeline del modelo base (prompt, CFG, sampler, ControlNet u otros condicionamientos) sin cambio de arquitectura del modelo subyacente.
- Ejecucion local en ComfyUI o en la nube mediante la plataforma RunningHub.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo "thinking": son capacidades fuera del alcance de un adaptador de imagen.
- Capacidades multilingues: no disponibles; dependen exclusivamente del codificador de texto del modelo base.
- No hay ninguna capacidad adicional documentada (inpainting explicito, mascaras, control de pose, etc.).

## Casos de uso

- Produccion de contenido para adultos (18+) en flujos ComfyUI: el adaptador se carga sobre Krea 2 y se aplica con strengths de 0,8 a 0,95 para obtener el efecto deseado en sesiones de generacion o edicion, con el control de intensidad que ofrece el nodo de LoRA.
- Edicion image-to-image sobre material ya existente: al declararse con pipeline `image-text-to-image`, encaja en flujos donde se parte de una imagen y se aplica una modificacion localizada guiada por prompt, en lugar de generar desde cero.
- Iteracion artistica de personajes: ilustradores que trabajan con representacion anatomica pueden generar variaciones rapidas cambiando el strength del LoRA y el prompt, y comparar resultados sin reentrenar el modelo base.
- Automatizacion por lotes en ComfyUI: el adaptador se puede insertar en un grafo con un cargador de LoRA y un bucle de lotes para producir conjuntos de imagenes con el efecto aplicado de forma consistente, util para generar material de catalogo o pruebas A/B de parametros.
- Ejecucion en la nube via API de RunningHub: equipos sin GPU local pueden invocar el modelo en la infraestructura de RunningHub, que ya lo aloja, evitando tener que desplegar Krea 2 y el adaptador, aunque con coste por llamada y dependencia de un tercero.
- Investigacion sobre adaptadores de bajo rango: al ser un archivo unico de 109 MiB, sirve como caso de estudio para analizar como un LoRA pequeno modifica la salida de un modelo de difusion grande, medir la sensibilidad al strength y comparar con otros adaptadores de la misma base.
- Control de calidad y auditoria de contenido: permite probar el comportamiento del modelo base bajo adaptadores NSFW y evaluar la eficacia de filtros, clasificadores o capas de moderacion en un pipeline de despliegue.
- Prototipado de interfaces de edicion: desarrolladores que construyen herramientas de edicion sobre Krea 2 pueden usar este LoRA para validar la integracion tecnica de un cargador de LoRA y el manejo de escalas antes de incorporar adaptadores propios o de cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna metrica objetiva (FID, CLIP score, similitud de prompt, evaluacion humana), ni comparaciones cuantitativas con otros adaptadores, ni curvas de calidad frente al strength del LoRA. Tampoco hay resultados de tareas estandar tipo MMLU, HumanEval o GSM8K, que no aplican a un adaptador de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base Krea 2. El adaptador en si anade un coste marginal: 109 MiB de pesos que se fusionan o se aplican en las capas objetivo, por lo que el requisito dominante es el del modelo base completo.
- GPU recomendadas: no disponibles. Dependen enteramente de Krea 2; la model card no indica ninguna GPU objetivo.
- Cabe en GPU de consumo: no se puede confirmar. Con 109 MiB el LoRA cabe en cualquier GPU, pero el modelo base determina si el conjunto entra en VRAM de consumo.
- Opciones de despliegue: ComfyUI (carga mediante nodo de LoRA en formato `safetensors`), plataforma cloud de RunningHub (local y China), y potencialmente otros cargadores de LoRA compatibles con el formato; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusion de imagen en este formato.
- Latencia y throughput estimados: no disponibles. No hay datos de velocidad, ni de coste por imagen en la API de RunningHub.
- Almacenamiento: 0,1 GB para el repositorio completo; un unico archivo de 109 MiB.

## Comparativa con modelos similares

No disponible. La model card no ofrece datos cuantitativos ni referencias a otros adaptadores, y no hay informacion publica suficiente para comparar parametros, contexto o rendimiento con alternativas de la misma categoria (otros LoRA de edicion anatomica para Krea 2, Flux u otras bases). A modo de contexto estructural, no de rendimiento:

| Modelo | Tipo | Base | Parametros declarados | Licencia | Datos publicados |
|---|---|---|---|---|---|
| rh-stiff-ru-tou-lora | LoRA de edicion de imagen | krea2 | no disponible | no disponible | no disponible |
| Otros LoRA de la misma categoria en CivitAI | LoRA de edicion de imagen | variable | no disponible | variable | no disponible |
| Alternativas en HuggingFace de RunningHubAI | LoRA para ComfyUI | variable | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contenido para adultos: el adaptador genera o modifica representaciones anatomicas explicitas. Requiere verificacion de edad y cumplimiento de las politicas de la plataforma de destino; no es apto para productos dirigidos a menores ni para entornos de trabajo sin control de contenido.
- Licencia no disponible: la model card remite al "original project or upstream license", sin especificar terminos. No hay base clara para uso comercial; el copyright permanece en el autor y el repositorio es una redistribucion por parte de RunningHub, lo que anade incertidumbre juridica si el material original tuviera restricciones.
- Procedencia: el adaptador se presenta como redistribucion de un modelo publicado en CivitAI (`civitai.red/models/2772968`), con lo que pueden aplicarse condiciones de esa plataforma no reflejadas en HuggingFace.
- Dependencia del modelo base: sin Krea 2 (no incluido en el repositorio) el archivo no es utilizable por si solo. No se documenta la version exacta del modelo base ni su compatibilidad con otras variantes.
- Sin reproducibilidad: no hay dataset, hiperparametros, semillas ni pipeline de entrenamiento documentados, por lo que no se puede reproducir ni auditar el efecto del adaptador.
- Riesgo de sobreaplicacion: la propia model card sugiere un rango estrecho (0,8-0,95) y advierte de ajustar segun la intensidad deseada; fuera de ese rango son previsibles artefactos anatomicos, perdida de coherencia global o degradacion de la calidad de la imagen.
- Sesgos: no hay evaluacion de sesgos. Como adaptador sobre un modelo de difusion, puede heredar y reforzar sesgos del modelo base en la representacion corporal, de genero, de etnia y de edad.
- Alucinacion visual: como todo modelo generativo de imagen, puede producir anatomias fisicamente inconsistentes, especialmente en la zona objetivo del adaptador y en composiciones complejas o con varias figuras.
- Adopcion practica nula: 0 descargas y 1 like en HuggingFace, sin issues ni discusion documentada. No hay evidencia de uso en produccion ni validacion por terceros.
- Idiomas no declarados: el comportamiento con prompts en castellano no esta verificado y depende por completo del codificador de texto de Krea 2.
- Metadata temporal: el repositorio figura creado y actualizado el 24 de septiembre de 2026, con una diferencia de un minuto entre ambos eventos; no hay historial de versiones ni changelog.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-stiff-ru-tou-lora
- Modelo original (CivitAI): https://civitai.red/models/2772968/hardnippleserected%20nipples%20for%20krea2?modelVersionId=3122267
- Modelo en RunningHub: https://www.runninghub.ai/model/public/2076272621818675201
- Autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
