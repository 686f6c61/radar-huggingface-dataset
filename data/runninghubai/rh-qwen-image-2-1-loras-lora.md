# RunningHubAI/rh-qwen-image-2.1-loras-lora

## Resumen

rh-qwen-image-2.1-loras-lora es un adaptador LoRA de bajo rango para generacion y edicion de imagen a partir de texto, publicado por RunningHubAI en Hugging Face. No es un modelo autonomo: se aplica sobre el modelo base de difusion Qwen-Image 2.1 (identificado en la model card como "Finetuned from: Qwen-image") y su unico fichero de pesos, `Qwen2.1_Anime_consistency.safetensors`, ocupa 160 MiB dentro de un repositorio de 0,2 GB.

El objetivo declarado del adaptador es mejorar la consistencia de personaje en flujos de edicion de imagen de estilo anime. Segun el autor, se ha ajustado principalmente con hojas de modelo de personaje (referencias de cuatro vistas) y con diversas ediciones de expresiones faciales, de modo que el personaje resultante mantenga identidad visual entre distintas generaciones y variaciones.

El propio autor lo marca como experimental: su finalidad principal es servir de banco de pruebas para determinar los mejores hiperparametros de entrenamiento de LoRA sobre Qwen-Image 2.1, y advierte de que el efecto concreto de edicion y la estabilidad de las salidas no estan garantizados. El repositorio acumula 0 descargas y 0 "likes" en la informacion disponible, y no se publican idiomas soportados ni terminos de licencia explicitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo de difusion text-to-image Qwen-Image 2.1. Rango, alpha y capas objetivo: no disponibles |
| Parametros totales | No disponibles; el fichero de pesos del adaptador ocupa 160 MiB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagen); no disponible |
| Tipos de cuantizacion | No disponibles; se distribuye en safetensors |
| Idiomas soportados | No disponibles; la comprension de prompts depende del modelo base Qwen-Image 2.1 |
| Licencia | No disponible; RunningHub lo publica en nombre del autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`Qwen2.1_Anime_consistency.safetensors`, 160 MiB) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID del repositorio | RunningHubAI/rh-qwen-image-2.1-loras-lora |
| Tipo de modelo | LoRA de text-to-image |
| Modelo base | Qwen-Image 2.1 (Qwen-image) |
| Pipeline | text-to-image |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |
| Fecha de actualizacion | 2026-09-28 |
| Etiquetas | comfyui, lora, text-to-image, region:us |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador mas alla de su naturaleza LoRA sobre Qwen-Image 2.1. Se desconoce el rango, el valor de alpha, las capas inyectadas, el optimizador y el numero de pasos de entrenamiento. El modelo base es un sistema de difusion text-to-image, por lo que el flujo habitual es cargar el checkpoint completo de Qwen-Image 2.1 en ComfyUI (o en RunningHub) y aplicar despues este adaptador con un peso escalado.

En cuanto a datos, la model card indica que el ajuste se hizo "principalmente basado en hojas de modelo de personaje (referencia de 4 vistas) y diversas ediciones de expresiones faciales". No se especifica el volumen del dataset, su procedencia, si hubo filtrado, ni si se aplicaron tecnicas de regularizacion o de refuerzo. Los parametros recomendados por el autor son seguir la configuracion oficial de Qwen-Image 2.1 para pasos de muestreo y escala CFG, y probar pesos de LoRA entre 0,6 y 0,8 segun la necesidad de edicion concreta. El autor declara explicitamente que el modelo esta en fase experimental y que se uso para evaluar parametros de entrenamiento.

## Capacidades

- Generacion de imagenes de estilo anime a partir de prompts de texto, heredando las capacidades del modelo base Qwen-Image 2.1.
- Edicion de imagen con preservacion de identidad de personaje, que es el proposito declarado del adaptador.
- Consistencia entre vistas: el entrenamiento con hojas de modelo de cuatro vistas apunta a mantener el mismo personaje en distintos angulos.
- Edicion de expresiones faciales sobre un personaje ya definido.
- Integracion en flujos de ComfyUI mediante carga de LoRA sobre el checkpoint base.
- Ejecucion en la plataforma en la nube de RunningHub, con API disponible para automatizacion.
- No aplica: generacion de texto, razonamiento, codigo, tool calling, function calling, uso como agente, multi-step reasoning ni capacidades de audio. Es un adaptador de imagen, no un modelo de lenguaje.
- Capacidades multilingues: no disponibles; dependen del codificador de texto del modelo base.

## Casos de uso

- Ilustracion serializada de personajes: permite mantener la identidad de un personaje a lo largo de varias ilustraciones (capitulos de manga, tiras de webtoon) aplicando el LoRA con peso entre 0,6 y 0,8 sobre Qwen-Image 2.1 y reutilizando la misma referencia de personaje en cada generacion.
- Creacion de hojas de modelo (character sheets): dado que el ajuste se hizo con referencias de cuatro vistas, el adaptador es adecuado para producir vistas frontal, lateral y trasera coherentes de un mismo diseno antes de pasar a produccion.
- Sprites y expresiones para videojuegos o novelas visuales: la capacidad de editar expresiones faciales sobre un personaje fijo encaja con la necesidad de generar variantes de un mismo retrato (sonrisa, enfado, sorpresa) sin perder rasgos.
- Arte conceptual iterativo en ComfyUI: el adaptador se carga como capa adicional sobre el grafo existente, lo que permite alternar su peso y comparar resultados dentro del mismo pipeline sin reentrenar nada.
- Avatares y personajes virtuales: para produccion de identidad visual estable en multiples poses y encuadres destinados a canales de contenido o VTubing.
- Prototipado de merchandising y doujin: generacion rapida de variaciones de un personaje consistente para validar disenos antes de encargar arte final.
- Pruebas de hiperparametros de LoRA sobre Qwen-Image 2.1: es el uso que el propio autor declara como principal, sirviendo de referencia para calibrar pesos de adaptador y configuraciones de muestreo en futuros entrenamientos.
- Ampliacion de datasets: uso del adaptador para generar variantes consistentes de un personaje que despues se revisan y filtran manualmente antes de incorporarlas a un conjunto de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad ni comparativas cuantitativas), y el autor indica que los efectos de edicion y la estabilidad de salida no pueden garantizarse por tratarse de un modelo experimental.

## Requisitos de hardware

- El adaptador en si ocupa 160 MiB en safetensors, por lo que su huella adicional en VRAM es marginal frente al modelo base.
- La VRAM necesaria para inferencia viene determinada por Qwen-Image 2.1, no por este LoRA. No se especifican requisitos de memoria en la informacion disponible.
- GPU recomendadas: no disponibles. Dependen del modelo base y de su cuantizacion, que no se documentan en esta ficha.
- Compatibilidad con GPU de consumo: no disponible. Depende enteramente del checkpoint base que se utilice.
- Opciones de despliegue documentadas: ComfyUI (local), plataforma en la nube de RunningHub y su API. El autor enlaza tambien la pagina de entrenamiento de RunningHub.
- No se documenta soporte para otros runtimes de inferencia en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible sobre alternativas se limita a nombres y categorias encontrados en la busqueda web; no hay datos de parametros, contexto, rendimiento ni licencia para ninguno de ellos.

| Modelo | Tipo declarado | Modelo base | Enfoque | Licencia | Datos publicos |
|---|---|---|---|---|---|
| RunningHubAI/rh-qwen-image-2.1-loras-lora | LoRA text-to-image | Qwen-Image 2.1 | Consistencia de personaje anime y edicion de expresiones | No disponible | 0 descargas, 0 likes; model card con parametros recomendados |
| RunningHubAI/rh-qwen-image-2.1-aio-nsfw-lora | LoRA (inferido del nombre, no confirmado) | Qwen-Image 2.1 | Contenido NSFW | No disponible | No disponible |
| JoyFusionAI/Qwen-Image-2.1-Uncensored-LoRA | LoRA (inferido del nombre, no confirmado) | Qwen-Image 2.1 | Reduccion de filtros de contenido | No disponible | No disponible |
| RunningHubAI/rh-krea2-lora-2.0-lora | LoRA image-to-text-to-image (segun listado) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Estado experimental declarado por el autor: no se garantizan ni el efecto de edicion ni la estabilidad de las salidas.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de mejora de consistencia frente a no usar el adaptador.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream. Antes de un uso comercial es imprescindible verificar los terminos de Qwen-Image 2.1 y del propio repositorio.
- Sesgos: el ajuste se ha realizado sobre material de estilo anime y hojas de personaje, por lo que el adaptador puede degradar la fidelidad en otros estilos o dominios (fotografia, ilustracion realista).
- Riesgo de alucinacion visual: como modelo de difusion, puede introducir artefactos anatomicos, deformaciones en manos o perdida de detalles en zonas no reforzadas por el entrenamiento.
- El parametro de peso del LoRA es sensible: fuera del rango recomendado de 0,6 a 0,8 puede producirse sobreajuste al estilo del adaptador o perdida de consistencia.
- Sin validacion comunitaria: 0 descargas y 0 likes, sin issues ni evaluaciones de terceros en la informacion disponible.
- Los prompts multilingues no estan documentados; el comportamiento dependera exclusivamente del modelo base.
- No es utilizable como modelo de lenguaje ni para tareas de texto, agentes o tool calling.
- Las fechas publicadas del repositorio (creacion y actualizacion el 2026-09-28) se reproducen tal cual aparecen en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-image-2.1-loras-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2102767669668827138
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1929731488613310465
- Repositorio de referencia citado en la model card: https://huggingface.co/WarmBloodAban/Qwen-Image-2.1-LoRAs
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Coleccion de LoRA de Qwen en Hugging Face (resultado de busqueda): https://huggingface.co/collections/ryg81/qwen-lora-model
- Listado de modelos LoRA en Hugging Face (resultado de busqueda): https://huggingface.co/models?sort=modified&search=lora
