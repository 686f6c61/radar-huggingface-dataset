# RunningHubAI/rh-pan-fried-buns-are-more-fragrant-than-steamed-ones-lora

## Resumen

rh-pan-fried-buns-are-more-fragrant-than-steamed-ones-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje, sino de un peso adicional que se carga sobre un modelo base de difusion identificado en la model card como "krea2", presumiblemente la familia FLUX.1 Krea. El fichero incluido, `Krea_2_Innie_Rank_8_000003000.safetensors`, ocupa 55 MiB y tiene rango 8, lo que lo situa en la categoria de adaptadores ligeros y rapidos de aplicar.

El modelo no incluye informacion sobre parametros totales, contexto, idiomas ni licencia explicita. La model card indica que el peso fue entrenado por el usuario "氛围感" en la plataforma RunningHub y enlaza a una ficha original alojada en Civitai, de tematica adulta. Esto implica que su ambito de aplicacion es la generacion y edicion de imagenes para adultos, no tareas de proposito general.

Su relevancia practica es limitada fuera de ese nicho: se distribuye como un ejemplo del flujo de publicacion automatizada de LoRAs de RunningHub y como caso de estudio de adaptadores de rango 8 sobre modelos de difusion de gran tamano. Al no haber benchmarks, documentacion tecnica de entrenamiento ni metadatos de licencia, cualquier evaluacion seria requiere probar el peso directamente en ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusion denominado "krea2" en la model card; no se especifica la arquitectura del base |
| Parametros totales | No disponible. El fichero de pesos ocupa 55 MiB; asumiendo precision fp16, equivaldria a unos 28 millones de parametros (estimacion, no confirmada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion para imagenes) |
| Tipos de cuantizacion | No disponible. El fichero distribuido esta en safetensors sin cuantizar |
| Idiomas soportados | No disponible. Como modelo de imagen, la entrada es texto de prompt; no se declaran idiomas |
| Licencia | No disponible. La model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original, sin concretarla |
| Formato de pesos | safetensors (`Krea_2_Innie_Rank_8_000003000.safetensors`, 55 MiB) |
| Rango del LoRA | 8 |
| Modelo base declarado | krea2 |
| Tamano del repositorio | 0,1 GB |
| Plataformas de uso | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base mas alla de la etiqueta "krea2". Por el contexto de la plataforma (ComfyUI, pipeline `image-text-to-image`) y por la nomenclatura del fichero, lo mas plausible es que se trate de un LoRA para un modelo de difusion tipo transformer (DiT) de la familia FLUX, concretamente una variante Krea. No se confirma en la documentacion.

Tampoco se detallan los datos de entrenamiento: no hay numero de imagenes, composicion del dataset, resolucion, pasos, learning rate, ni si se aplico algun tipo de regularizacion o fine-tuning adicional. El sufijo `000003000` del nombre del fichero sugiere un checkpoint intermedio de un entrenamiento por pasos, probablemente en el paso 3000, pero es una inferencia a partir del nombre, no un dato confirmado. La model card unicamente indica que fue afinado desde krea2, que la intensidad por defecto es 1 y que el autor original lo publico en Civitai.

## Capacidades

- Edicion de imagen guiada por texto: el pipeline declarado es `image-text-to-image`, es decir, transformacion de una imagen de entrada a partir de una instruccion textual.
- Aplicacion de un estilo o atributo concreto sobre el modelo base, con un peso de solo 55 MiB y rango 8, lo que permite cargarlo y descargarlo rapidamente en un grafo de ComfyUI.
- Compatibilidad con flujos de ComfyUI y con la plataforma RunningHub, incluyendo su API.
- Intensidad ajustable mediante el parametro de escala del LoRA; la model card indica 1 como valor por defecto.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso, vision por computador en sentido analitico, audio ni modo de razonamiento extendido. Estas capacidades no aplican a un adaptador de difusion de imagen.
- Contenido adulto: la ficha original enlazada corresponde a un modelo de tematica NSFW.

## Casos de uso

- Generacion de ilustracion para adultos en plataformas con verificacion de edad: el LoRA se cargaria sobre el modelo base en ComfyUI y se aplicaria con escala 1 para producir imagenes de ese nicho, con control de acceso en la capa de aplicacion.
- Pruebas de pipelines de moderacion de contenido: sirve como entrada de test realista para clasificadores NSFW, ya que genera material que los sistemas de moderacion deben detectar y filtrar.
- Aumento de datos para entrenar clasificadores de contenido adulto: generando variaciones controladas se puede ampliar un dataset de deteccion sin recurrir a material real.
- Desarrollo y depuracion de flujos ComfyUI: al ser un adaptador de 55 MiB y rango 8, permite iterar rapidamente sobre grafos con carga y descarga de LoRAs sin penalizar los tiempos de arranque.
- Investigacion sobre eficiencia de LoRA de bajo rango: comparar rango 8 frente a rangos superiores en el mismo base ayuda a medir la perdida de fidelidad frente al ahorro de memoria y tiempo de entrenamiento.
- Integracion en servicios gestionados con API: la model card enlaza la API de RunningHub, de modo que el LoRA puede invocarse de forma remota sin infraestructura propia, util para prototipos o demos.
- Experimentos de consistencia de personaje o atributo: aplicando el adaptador en combinacion con IP-Adapter o ControlNet se puede evaluar hasta que punto un rango 8 mantiene un rasgo concreto a lo largo de varias generaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, comparativas visuales ni ninguna otra metrica objetiva, y la busqueda web realizada no aporta datos adicionales.

## Requisitos de hardware

- VRAM para el LoRA en si: despreciable. El fichero son 55 MiB, y en memoria durante la inferencia ocupa una fraccion minima respecto al modelo base.
- VRAM para el modelo base: no disponible en la informacion proporcionada. Depende enteramente del base "krea2" sobre el que se cargue; un modelo de difusion de la clase FLUX en precision bf16 ronda los 24 GB de VRAM, y las variantes cuantizadas en GGUF pueden bajar a rangos de 8-12 GB. Son estimaciones por clase de modelo, no datos de esta ficha.
- GPU recomendadas: no disponible. Para un base de esa clase se suelen emplear A100, H100 o RTX 4090; las tarjetas consumer de 12-16 GB pueden ser suficientes solo con cuantizacion.
- Cabe en GPU consumer: probablemente si, con el base cuantizado, pero no confirmado por el autor.
- Opciones de despliegue: ComfyUI es el entorno declarado explicitamente. La model card tambien menciona ejecucion en la plataforma RunningHub y su API. No se declara soporte de vLLM, TGI u Ollama, que ademas no aplican a modelos de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La model card no identifica alternativas equivalentes ni ofrece metricas que permitan situar este LoRA frente a otros adaptadores del mismo base. Como referencia estructural, se puede comparar con otros LoRA de la misma plataforma y del mismo modelo base:

| Modelo | Tipo | Rango / tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-pan-fried-buns-are-more-fragrant-than-steamed-ones-lora | LoRA de edicion de imagen | Rango 8, 55 MiB | No aplica | No disponible | No disponible | Hugging Face, RunningHub, ComfyUI |
| Otros LoRA publicados por RunningHubAI sobre el mismo base | LoRA de edicion de imagen | No disponible | No aplica | No disponible | No disponible | Hugging Face, RunningHub |
| LoRA de la comunidad para FLUX.1 Krea | LoRA de edicion de imagen | Habitualmente rango 8-64 | No aplica | No disponible | Variable segun autor | Hugging Face, Civitai |

## Limitaciones y advertencias

- Contenido adulto: la ficha original enlazada corresponde a material NSFW. Su uso en productos de cara al publico exige verificacion de edad y cumplimiento de la normativa aplicable en cada jurisdiccion.
- Licencia no disponible: la model card no especifica una licencia concreta y remite a la del proyecto original, que tampoco se detalla. No hay base clara para el uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Ausencia total de documentacion tecnica: no hay datos de dataset, hiperparametros, resolucion de entrenamiento ni evaluacion. Esto impide reproducir el resultado o anticipar su comportamiento fuera del prompt de entrenamiento.
- Riesgo de sobreajuste: con rango 8 y un unico checkpoint intermedio, el adaptador puede reproducir rasgos muy concretos del dataset y degradar el realismo o la diversidad cuando se combina con otros LoRAs.
- Riesgo de alucinacion visual: como cualquier modelo generativo, puede producir anatomia incorrecta, artefactos en manos, texto ilegible o incoherencias con la imagen de entrada. No hay evaluacion publicada que cuantifique esta tasa.
- Sesgos: el dataset de entrenamiento no esta documentado, por lo que se desconocen sesgos de representacion corporal, etnia, edad aparente o tipo de cuerpo.
- Interaccion con el modelo base: el resultado depende del base, del sampler, del scheduler y de la escala del LoRA. La model card solo aporta un valor por defecto de intensidad 1, sin guia sobre combinaciones.
- Fecha de publicacion anomala: los metadatos indican creacion y actualizacion en septiembre de 2026, posterior a la fecha actual. No se puede verificar esa marca temporal.
- Sin adopcion registrada: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/RunningHubAI/rh-pan-fried-buns-are-more-fragrant-than-steamed-ones-lora
- Ficha original en RunningHub: https://www.runninghub.ai/model/public/2072145161232146434
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Fuente original declarada (Civitai): https://civitai.red/models/2744291/innie-vagina-puffy-labia-majora?modelVersionId=3086654
- Plataforma RunningHub: https://www.runninghub.ai
- Sitio de RunningHub para China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-pan-fried-buns-are-more-fragrant-than-steamed-ones-lora/blob/main/README_cn.md
