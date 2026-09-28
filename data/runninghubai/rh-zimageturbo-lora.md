# RunningHubAI/rh-zimageturbo-lora

## Resumen

rh-zimageturbo-lora es un adaptador LoRA de tipo slider para generacion de imagenes a partir de texto (text-to-image), publicado por RunningHubAI bajo la cuenta de autoria de AIGC工作站 en RunningHub. Su funcion es empujar la estetica de las imagenes generadas hacia un aspecto cinematografico: mejor iluminacion, mayor profundidad de campo, encuadre mas intencionado y color grading dramatico. Esta afinado a partir del modelo base Z-image-turbo, del que no se detallan caracteristicas tecnicas en la informacion disponible.

El aspecto mas relevante tecnicamente es que se trata de un LoRA de rango 1 (Rank 1), lo que se traduce en un archivo de solo 10 MiB. Ese rango bajo tiene una consecuencia practica importante: el adaptador se apila con otros LoRA sin competir de forma agresiva por la influencia sobre el modelo, lo que facilita combinarlo con LoRA de estilo ya existentes. No requiere palabra de activacion (trigger word), y su intensidad se controla mediante un unico parametro de fuerza con un rango recomendado de 2.0 a 12.0.

Es relevante ahora porque encaja en el ecosistema de ComfyUI y en el catalogo de modelos de RunningHub, donde se distribuyen y ejecutan este tipo de adaptadores. Al ser un LoRA de bajo rango y sin trigger, es un complemento de post-procesado estetico mas que un modelo autonomo: no genera imagenes por si solo, sino que modifica el comportamiento del modelo base sobre el que se carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion text-to-image; arquitectura del modelo base Z-image-turbo no disponible |
| Parametros totales | no disponible (no se publica el numero de parametros; el archivo de pesos ocupa 10 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el unico archivo publicado esta en safetensors sin cuantizar |
| Idiomas soportados | no disponibles (el prompt de texto depende del modelo base) |
| Licencia | no disponible; la model card indica "Follow the original project or upstream license" y que el copyright permanece con el autor |
| Formato de pesos | safetensors (archivo `cinematic_loraholic.safetensors`, 10 MiB) |
| Tipo de modelo | LoRA slider de estilo cinematografico |
| Modelo base | Z-image-turbo (finetuned from) |
| Rango del LoRA | 1 (Rank 1) |
| Palabra de activacion | ninguna (no trigger word required) |
| Rango de fuerza recomendado | 2.0 a 12.0 |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura subyacente del modelo base Z-image-turbo ni el proceso de entrenamiento de este adaptador. Lo unico confirmado es que se trata de un LoRA de rango 1, es decir, una descomposicion de bajo rango aplicada sobre las capas del modelo base, lo que explica su tamano de 10 MiB. El autor no publica el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como RLHF o DPO (tecnicas, por otra parte, propias de modelos de lenguaje y no directamente aplicables a un adaptador de difusion).

El aspecto diferencial declarado es el comportamiento tipo slider: la intensidad del efecto se escala de forma monotona mediante el parametro de fuerza, sin necesidad de palabra de activacion. El autor describe tres regimenes claros: 2.0-4.0 para una mejora sutil, 5.0-7.0 para un cambio perceptible en composicion y profundidad de campo, y 8.0-10.0 para un aspecto cinematografico completo con color grading intenso y estetica de pelicula clasica. El rango de fuerza recomendado se extiende hasta 12.0. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, que no tendrian sentido en este tipo de adaptador.

## Capacidades

- Modificacion estetica de imagenes generadas por Z-image-turbo hacia un acabado cinematografico: iluminacion mas dramática, mayor profundidad de campo y encuadre mas intencionado.
- Aplicacion escalable mediante parametro de fuerza (2.0 a 12.0), con efecto acumulativo.
- Apilamiento limpio con otros LoRA, incluidos LoRA de estilo (el autor menciona MIDJOURNEY LoRAs o Melancholy como ejemplos), gracias a su rango 1.
- Funcionamiento sin palabra de activacion, lo que simplifica su integracion en flujos existentes.
- Aplicabilidad declarada a multiples generos: retratos, paisajes, ciencia ficcion, fantasia, escenas urbanas y otros.
- Integracion en ComfyUI mediante el nodo de carga de LoRA y en la plataforma RunningHub.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, vision ni audio: es un adaptador de generacion de imagen, no un modelo de lenguaje.

## Casos de uso

- Acabado cinematografico de fotogramas generados: cargar el LoRA sobre Z-image-turbo en ComfyUI con fuerza 5.0-7.0 para convertir una imagen plana en un fotograma con aspecto de still de pelicula, util en previsualizacion de storyboards.
- Previsualizacion de conceptos para cine y publicidad: aplicar fuerza 8.0-10.0 para obtener color grading dramatico y atmosfera de pelicula clasica en moodboards de direccion de arte.
- Retoque estetico sutil en catalogos de producto o retratos: fuerza 2.0-4.0 para mejorar luz y limpieza de detalle sin que el espectador identifique el cambio, adecuado cuando no se quiere un look artificial evidente.
- Integracion en pipelines de generacion por lotes: al no requerir trigger word y pesar 10 MiB, se puede insertar como paso adicional en flujos automatizados de ComfyUI sin reentrenar el pipeline completo.
- Combinacion con LoRA de estilo existentes: apilarlo con otros adaptadores de estetica partiendo de fuerzas bajas (2-4) para evitar sobresaturar el resultado, como advierte el autor.
- Prototipado rapido en entorno alojado: probar el efecto directamente en RunningHub sin necesidad de infraestructura local de GPU.
- Exploracion de variaciones de iluminacion y encuadre: usar el parametro de fuerza como variable de barrido para generar una misma escena en distintos grados de tratamiento cinematografico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, comparativas humanas ni similares), y las busquedas web no aportan evaluaciones numericas de este adaptador.

## Requisitos de hardware

- El adaptador en si ocupa 10 MiB, por lo que su impacto en memoria es despreciable frente al modelo base.
- La VRAM necesaria para inferencia viene determinada por Z-image-turbo y su cuantizacion, no por este LoRA; la informacion disponible no especifica los requisitos del modelo base. Como referencia general no confirmada, los modelos de difusion text-to-image de gama actual suelen requerir entre 6 y 12 GB de VRAM en cuantizaciones de 8 bits y entre 12 y 24 GB en precision completa o media.
- GPU recomendadas: no disponible en la informacion proporcionada. No se confirma compatibilidad con A100, H100 ni RTX 4090 mas alla de la viabilidad general del modelo base.
- Compatibilidad con GPU de consumo: no confirmada; depende enteramente del modelo base Z-image-turbo, cuyos requisitos no se detallan.
- Opciones de despliegue: ComfyUI (formato de carga nativo para LoRA), plataforma RunningHub (alojada, con API documentada) y Hugging Face como punto de descarga. No se menciona soporte explicito en vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a difusion.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este adaptador, por lo que la comparacion se limita a caracteristicas declaradas y disponibilidad. Los elementos comparables localizados en la busqueda web son otros adaptadores del ecosistema Z-Image distribuidos en RunningHub.

| Modelo | Tipo | Modelo base | Tamano / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-zimageturbo-lora | LoRA slider (Rank 1), sin trigger | Z-image-turbo | 10 MiB, safetensors | no disponible | Hugging Face, RunningHub, ComfyUI |
| Red-Z-Image-Turbo-Lora-Collection (Image Mimic V1) | Coleccion de LoRA de mejora y mimic | Z-Image_Turbo | no disponible | no disponible | RunningHub |
| PornMaster z-image Turbo V0.1_fp8 | LoRA/finetune de contenido adulto | z-image Turbo | fp8 | no disponible | RunningHub |
| PornMaster z-image Turbo_5steps_V1_bf16 | LoRA/finetune de 5 pasos | z-image Turbo | bf16 | no disponible | RunningHub |

No se dispone de datos de rendimiento (metricas o evaluaciones) que permitan una comparacion cuantitativa entre estas opciones, ni de sus tamanos de parametros o condiciones de licencia.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargarse sobre Z-image-turbo u otro modelo base compatible; por si solo no genera imagenes.
- La licencia no esta disponible de forma explicita. La model card remite a la licencia del proyecto original o del modelo base, lo que introduce incertidumbre sobre el uso comercial. Conviene verificar la licencia de Z-image-turbo antes de cualquier despliegue en produccion.
- Riesgo de sobresaturacion estetica: el autor advierte que el efecto se acumula rapidamente y recomienda empezar en 3-4. Al combinarlo con LoRA que ya incorporan efectos cinematograficos, sugiere bajar la fuerza a 2-4 para evitar un resultado excesivo.
- Sesgos conocidos: no disponibles. No se documenta evaluacion de sesgos ni de representacion demografica.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje, pero si existe el riesgo propio de los modelos de difusion de generar contenido incoherente o artefactos, especialmente a fuerzas altas.
- Limitaciones de idioma: no disponibles; la calidad del prompt depende del codificador de texto del modelo base, no documentado aqui.
- Contenido sensible: la model card menciona explicitamente su aplicacion a "naughty stuff" (contenido para adultos), por lo que su uso puede quedar fuera de las politicas de contenido de algunas plataformas y requiere moderacion si se despliega en servicios publicos.
- El repositorio registra 0 descargas y 0 likes, y un tamano reportado de 0.0 GB pese a contener un archivo de 10 MiB; son indicadores de un modelo recien publicado o poco validado por la comunidad.
- Las fechas de creacion y actualizacion indicadas en la ficha de Hugging Face (2026-09-28) son posteriores a la fecha de consulta, un dato anomalo que conviene tratar con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-zimageturbo-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2053779764535672833
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1998616841276772354
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Tutorial "Easy Image-to-Lora Training with Z-image" (RunningHub): https://www.runninghub.ai/post/2017854614862827522
- Red-Z-Image-Turbo-Lora-Collection - Image Mimic V1 (RunningHub): https://www.runninghub.ai/post/1999284724831055873
- Pagina de formacion de modelos en RunningHub: https://www.runninghub.ai/page-model
