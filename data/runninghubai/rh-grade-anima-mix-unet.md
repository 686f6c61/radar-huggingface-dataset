# RunningHubAI/rh-grade-anima-mix-unet

## Resumen

rh-grade-anima-mix-unet es un peso de tipo UNet para modelos de difusion orientado a la generacion de video e imagen a partir de texto, publicado por RunningHubAI (RunningHub) en Hugging Face. Se trata de un derivado afinado (finetuned from: anima) de un modelo base de la familia Anima, empaquetado especificamente para su carga en ComfyUI y en la plataforma RunningHub, no como un modelo completo con text encoder y VAE.

El modelo se presenta como una mezcla personal del autor orientada a un estilo anime con acabado "grueso y brillante", con ilustraciones muy detalladas y una estetica a medio camino entre 2D y 3D (2.5d). El repositorio incluye un unico archivo de pesos en `gradeAnimaMIX_v10_fp16.safetensors` de 3989 MiB, lo que situa el repo en torno a 4,2 GB.

La relevancia de esta ficha es acotada: es un checkpoint de nicho, sin descargas ni valoraciones en el momento de la consulta, y su interes se limita a flujos de trabajo de generacion visual estilizada en ComfyUI. No hay informacion publicada sobre arquitectura interna, datos de entrenamiento, licencia ni idiomas soportados, por lo que buena parte de las especificaciones figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (no se detalla variante ni bloque de atencion); afinado a partir de "anima" |
| Parametros totales | no disponible (el archivo fp16 de 3989 MiB sugiere un orden de magnitud en torno a 2.000 millones de parametros, dato no confirmado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (unico peso publicado); no se ofrecen variantes GGUF, fp8 ni int8 |
| Idiomas soportados | no disponibles (los prompts dependen del text encoder que se empareje en ComfyUI) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`gradeAnimaMIX_v10_fp16.safetensors`, 3989 MiB) |

## Arquitectura y entrenamiento

El modelo se distribuye como un peso UNet, que es el componente central de denoising de un pipeline de difusion. No es un modelo autonomo: en ComfyUI debe combinarse con un text encoder, un VAE y un sampler para producir resultados. La model card no especifica la arquitectura del backbone (variante de UNet, uso o no de atencion cruzada sobre texto, resolucion nativa de entrenamiento) ni tampoco el pipeline completo con el que se entreno.

El unico dato de procedencia confirmado es que esta afinado a partir de un modelo llamado "anima", y que se trata de una mezcla personal del autor orientada a un estilo anime 2.5d. No hay informacion sobre volumen de tokens o imagenes de entrenamiento, composicion del dataset, resoluciones, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO (conceptos, por otra parte, poco habituales en el ajuste de UNets de difusion). Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Los parametros de muestreo recomendados por el autor son sampler ER SDE o EULER A, scheduler DDIM, entre 30 y 50 pasos y CFG entre 4 y 5.

## Capacidades

- Generacion de imagen/video a partir de texto dentro de un pipeline de difusion gestionado por ComfyUI (el pipeline declarado es text-to-video, aunque la descripcion del autor se centra en ilustracion anime).
- Produccion de ilustraciones de estilo anime con acabado brillante y detalle alto, en una estetica 2.5d.
- Integracion en flujos de ComfyUI como nodo de carga de UNet.
- Ejecucion en la plataforma RunningHub, tanto localmente con los pesos como en linea mediante sus servicios.
- No consta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo generativo visual, no un modelo de lenguaje.
- No consta soporte multilingue documentado; la comprension de prompts depende del text encoder que se empareje.
- No consta modo "thinking", vision por comprension, audio ni ninguna capacidad adicional.

## Casos de uso

- Ilustracion anime estilizada por lotes: cargando el UNet en ComfyUI con los ajustes recomendados (Euler A o ER SDE, DDIM, 30-50 pasos, CFG 4-5) se pueden generar conjuntos coherentes de ilustraciones con una estetica 2.5d comun.
- Prototipado de assets para videojuegos o novela visual: dado el enfasis del autor en personajes ("waifus") y detalle alto, el modelo es adecuado para producir arte conceptual de personajes y escenarios dentro de una direccion de arte anime concreta.
- Creacion de contenido para redes sociales: generacion de piezas ilustradas de forma repetible mediante un workflow de ComfyUI reutilizable, aprovechando la fijacion de semilla y parametros.
- Flujos de trabajo combinados con LoRAs: al ser un UNet, se puede encadenar con LoRAs de estilo o personaje en ComfyUI para refinar el resultado sin reentrenar.
- Generacion de material de referencia para storyboard: producir fotogramas clave estilizados que sirvan como referencia visual antes de una produccion mayor.
- Automatizacion en plataforma gestionada: desplegar el modelo a traves de RunningHub (API o interfaz) para generar contenido sin montar infraestructura propia de GPU.
- Generacion de video dentro de pipelines text-to-video: dado el `pipeline_tag` declarado, puede emplearse en flujos de sintesis de video corto, aunque no hay documentacion que detalle su comportamiento en ese modo ni ejemplos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, MMLU, HumanEval ni equivalentes) ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un UNet en fp16 de aproximadamente 4 GB de pesos requiere en torno a 6-10 GB de VRAM contando text encoder, VAE y latentes, cantidad que varia mucho segun la resolucion de salida, el numero de fotogramas (si es video) y el backend.
- GPU recomendadas: no disponibles. Por el tamano del peso, una GPU consumer con 12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) deberia ser suficiente en fp16, aunque es una estimacion no confirmada por el autor.
- Cabria en GPU consumer: probablemente si, en tarjetas con 12 GB o mas, si bien no hay confirmacion oficial ni requisitos publicados.
- Opciones de despliegue: ComfyUI (indicado explicitamente), plataforma RunningHub y su API. No se documenta soporte para vLLM, TGI ni llama.cpp (este ultimo no aplica a UNets de difusion, salvo conversion a GGUF no publicada).
- Latencia y throughput: no disponibles. Dependeran del sampler, pasos (30-50 recomendados), resolucion y hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-grade-anima-mix-unet | UNet de difusion (text-to-video) | no disponible (~4 GB fp16) | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub |
| rh-anima-unet | UNet de difusion (mismo autor) | no disponible | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub |
| Modelo base "anima" | Base de difusion | no disponible | no aplica | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones tecnicas del modelo base "anima" ni de otros checkpoints de la misma familia, por lo que la comparacion se limita a la procedencia y al canal de distribucion.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican arquitectura, parametros, datos de entrenamiento ni resolucion nativa.
- Licencia no disponible: no se puede confirmar el uso comercial. La model card indica que el copyright permanece con el autor y remite a la licencia del proyecto upstream, lo que introduce incertidumbre legal para produccion.
- Especializacion de estilo: el modelo esta orientado a un estilo anime 2.5d concreto, por lo que su rendimiento fuera de ese dominio probablemente sea limitado.
- No es un modelo autonomo: requiere text encoder, VAE y un sampler compatibles en ComfyUI, lo que anade puntos de fallo y dependencias de version.
- Riesgo de sesgos y contenido: los modelos afinados para estilos anime pueden reproducir sesgos de representacion presentes en sus datasets de origen, no documentados aqui.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, artefactos en manos y rostros, o incoherencias temporales en modo video.
- Idiomas no declarados: el soporte de prompts en castellano no esta garantizado y dependera del text encoder emparejado.
- Adopcion nula: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fecha de publicacion registrada como 2026-10-04, dato que conviene verificar.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-grade-anima-mix-unet
- Modelo relacionado del mismo autor: https://huggingface.co/RunningHubAI/rh-anima-unet
- Perfil del autor en Hugging Face: https://huggingface.co/RunningHubAI
- Pagina del modelo original en RunningHub: https://www.runninghub.ai/model/public/2099406994263244801
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2007154923476885506
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Creacion y entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Seedance 2.5 via API: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
