# RunningHubAI/rh-intorealism80bf16-unet

## Resumen

rh-intorealism80bf16-unet es un modelo de difusion text-to-image publicado por RunningHubAI en Hugging Face. Se distribuye como un unico fichero de pesos en formato safetensors que contiene exclusivamente la red generativa (UNET), con un tamano de 11.740 MiB y un repositorio de 12,3 GB. Segun la propia model card, los pesos estan afinados a partir de Z-image-turbo, y el ajuste se atribuye al usuario Henrique dentro de la plataforma RunningHub, que actua como canal de publicacion en nombre del autor.

No se presenta como una investigacion independiente, sino como el componente de red de difusion de un pipeline de generacion de imagenes orientado a ComfyUI. Las etiquetas comfyui, unet y text-to-image confirman ese enfoque: el objetivo es cargar los pesos en un nodo de tipo UNETLoader -o en el entorno alojado de RunningHub- y combinarlos con el text encoder y el VAE del pipeline de Z-Image para obtener un estilo visual denominado INTOREALISM80BF16.

La informacion publica es muy escasa: no hay numero de parametros declarado, ni especificacion de licencia, ni idiomas soportados, ni resultados de benchmarks. El repositorio no registra descargas ni valoraciones. Esto lo convierte en un artefacto relevante para quienes ya trabajan con el ecosistema de Z-Image en ComfyUI, pero insuficiente para una evaluacion comparativa rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para text-to-image (etiquetado como "UNET" por el autor; la arquitectura interna no se detalla en la model card) |
| Parametros totales | no disponible (el autor no lo declara; el unico fichero de pesos, de 11.740 MiB en bf16, es compatible con un orden de magnitud de unos 6.000 millones de parametros) |
| Parametros activos | no aplica (no se describe una arquitectura de mezcla de expertos) |
| Longitud de contexto | no aplica / no disponible (modelo de generacion de imagen; el limite de longitud del prompt lo fija el text encoder del pipeline, que no se incluye en este repositorio) |
| Tipos de cuantizacion | bf16 en safetensors. No se documentan otras cuantizaciones en el repositorio |
| Idiomas soportados | no disponible (el idioma de los prompts depende del text encoder asociado, no especificado) |
| Licencia | no disponible. La model card indica que RunningHub publica en nombre del autor, que conserva el copyright, y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (fichero IntoRealismZIT80bf16.safetensors) |
| Modelo base | Z-image-turbo (finetune) |
| Tamano del repositorio | 12,3 GB |
| Tamano del fichero de pesos | 11.740 MiB |
| Pipeline declarado | text-to-image |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

El repositorio contiene unicamente los pesos de la red generativa. No incluye text encoder ni VAE, por lo que el modelo no es autonomo: necesita integrarse en un pipeline completo de difusion (tipicamente el de Z-Image) para poder generar imagenes. En ComfyUI esto se traduce en cargar el fichero safetensors mediante un nodo de tipo UNETLoader y conectar el resto de componentes por separado.

La model card no documenta el proceso de entrenamiento. No hay numero de tokens, ni composicion del dataset, ni referencias a RLHF, DPO o a tecnicas de destilacion o decodificacion especulativa. El unico dato disponible es que el modelo se ha afinado a partir de Z-image-turbo, un modelo de generacion de imagen que la comunidad suele emplear en regimen de pocos pasos de muestreo. El sufijo "80b" que aparece en el nombre del fichero y del repositorio no se explica en la documentacion y no guarda relacion con el tamano del fichero de pesos, por lo que lo mas probable es que sea una etiqueta de version o de checkpoint interna del autor y no una referencia a 80.000 millones de parametros.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) en el ecosistema ComfyUI.
- Estilo fotorrealista asociado al nombre INTOREALISM80BF16, segun la denominacion del propio autor.
- Integracion como nodo UNET dentro de flujos de ComfyUI, lo que permite encadenarlo con el resto de nodos del grafo (text encoder, VAE, samplers, upscalers, LoRA).
- Ejecucion en el entorno alojado de RunningHub, con posibilidad de invocacion mediante su API.
- Generacion reproducible mediante semilla, y variaciones de imagen si el pipeline anfitrion lo permite.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de sintesis de imagen.
- No se documentan capacidades de vision, audio ni comprension de lenguaje natural.
- No se documenta soporte explicito de inpainting, outpainting, ControlNet ni condicionamiento estructural adicional dentro de este repositorio.

## Casos de uso

- Generacion de imagenes fotorrealistas para campanas de marketing: el modelo permite producir material visual a partir de descripciones textuales dentro de un flujo de ComfyUI, lo que agiliza la creacion de variantes de un mismo concepto sin sesion fotografica.
- Prototipado de conceptos para ilustracion y direccion de arte: al ser un finetune especializado en un estilo concreto, resulta adecuado para explorar rapidamente una linea visual homogenea antes de producir los assets definitivos.
- Creacion de assets para videojuegos y simulaciones: generacion de arte conceptual, cuadros de ambiente o texturas base que despues se retocan manualmente, aprovechando la reproducibilidad por semilla para mantener coherencia entre iteraciones.
- Contenido para redes sociales y publicaciones periodicas: produccion por lotes de imagenes con un estilo consistente, integrada en un flujo automatizado que combine el nodo UNET con prompts predefinidos.
- Imagenes de producto para comercio electronico: su orientacion fotorrealista encaja con la generacion de escenas de producto, siempre que el pipeline anfitrion incluya las etapas de postprocesado necesarias y se revise el resultado por posibles artefactos.
- Pipelines de generacion por API en RunningHub: el modelo puede invocarse en el servicio alojado del publicador, lo que permite incorporar la generacion de imagen a backends propios sin gestionar la infraestructura de GPU.
- Experimentacion con estilos mediante LoRA en ComfyUI: al cargarse como UNET independiente, puede combinarse con adaptadores de bajo rango para ajustar el estilo sin reentrenar los pesos base, sujeto a la compatibilidad con el pipeline de Z-Image.
- Pruebas de investigacion sobre difusion y ajuste fino: sirve como ejemplo de finetune de un modelo turbo sobre un estilo concreto, util para estudiar el efecto del ajuste en la fidelidad al prompt y en la diversidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, ImageReward ni evaluaciones humanas) y tampoco se han encontrado comparativas en los resultados de busqueda web. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia sobre el pipeline completo, teniendo en cuenta que el resultado depende tanto de este UNET como del text encoder, el VAE y la configuracion del sampler.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: el fichero de pesos ocupa 11.740 MiB, por lo que se necesitan al menos unos 12 GB solo para los pesos. Sumando activaciones, VAE y text encoder del pipeline, una estimacion razonable se situa en 16-24 GB de VRAM (estimacion propia, no confirmada por el autor).
- GPU recomendadas para bf16 sin cuantizar: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 (80 GB). Cualquier GPU con 24 GB o mas evita recurrir a offload.
- GPU de consumo: si cabe en tarjetas de gama alta con 24 GB. En tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) es previsible que requiera cuantizacion adicional o descarga parcial a CPU.
- Cuantizacion: el repositorio solo publica pesos en bf16. Para reducir huella se puede recurrir a conversiones a fp8 o GGUF mediante herramientas de la comunidad (por ejemplo ComfyUI-GGUF o stable-diffusion.cpp), lo que podria rebajar el consumo a unos 6-8 GB, a costa de cierta perdida de calidad. No hay conversiones oficiales publicadas.
- Opciones de despliegue: ComfyUI como integracion nativa, la plataforma alojada RunningHub y su API, y en menor medida stable-diffusion.cpp para ejecucion en CPU o GPU con cuantizacion. No aplica a servidores de inferencia de lenguaje como vLLM, TGI u Ollama, que no estan disenados para este tipo de red de difusion.
- Latencia y throughput estimados: no disponibles. Dependen del numero de pasos de muestreo, de la resolucion de salida y del hardware empleado; el autor no aporta ninguna medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-intorealism80bf16-unet | no disponible (fichero de 11.740 MiB en bf16) | UNET de difusion text-to-image, finetune de estilo | no disponible | Hugging Face y RunningHub |
| Z-image-turbo (modelo base) | no disponible en esta busqueda | UNET de difusion text-to-image de pocos pasos | no disponible en esta busqueda; consultar la ficha del modelo base | Repositorio del proyecto original |
| FLUX.1-dev | aproximadamente 12.000 millones (dato de conocimiento general, no verificado en esta busqueda) | DiT/UNET de difusion text-to-image | licencia no comercial del publicador | Hugging Face |
| SDXL | aproximadamente 2.600 millones en el UNET (dato de conocimiento general, no verificado en esta busqueda) | UNET de difusion text-to-image | CreativeML Open RAIL++-M | Hugging Face |

Los datos de los modelos comparativos corresponden a documentacion publica ampliamente conocida y no proceden de la busqueda realizada para esta ficha; conviene verificarlos en sus repositorios oficiales antes de tomar decisiones. La comparacion directa de rendimiento con rh-intorealism80bf16-unet no es posible porque no se han publicado metricas de este ultimo.

## Limitaciones y advertencias

- Licencia indeterminada: la model card no incluye un texto de licencia y remite a la del proyecto original. Esto supone un riesgo legal para uso comercial si no se aclara previamente con el autor o con RunningHub.
- Ausencia total de benchmarks: no hay metricas objetivas ni evaluaciones comparativas que respalden la calidad del finetune.
- Sin validacion comunitaria: cero descargas y cero valoraciones en el momento de redactar esta ficha, lo que impide contrastar experiencias de otros usuarios.
- Dependencia del pipeline: al contener solo el UNET, el modelo no funciona de forma aislada. Necesita el text encoder y el VAE correspondientes al modelo base, y un desajuste de versiones puede degradar o romper la generacion.
- Riesgo de artefactos visuales: como cualquier modelo de difusion, puede producir errores anatomicos, manos deformes, texto ilegible dentro de la imagen y perspectivas incoherentes. No existe filtrado ni verificacion automatica.
- Sesgos: los sesgos del dataset de entrenamiento del modelo base se heredan y, ademas, se refuerzan los del dataset de ajuste, que no se documenta. Es esperable un sesgo hacia estilos, etnias y composiciones dominantes en los datos de origen.
- Herencia de un modelo turbo: los modelos destilados para pocos pasos tienden a reducir la diversidad de salida y a seguir peor prompts largos o muy especificos. Este comportamiento se traslada al finetune.
- Idioma de los prompts: no se especifica que idiomas estan soportados. Conviene asumir que el rendimiento optimo se da en ingles, el idioma habitual en los text encoders de este tipo de pipelines.
- Nombre potencialmente confuso: el sufijo "80b" puede interpretarse como 80.000 millones de parametros, algo incompatible con el tamano real del fichero de pesos.
- Fechas y trazabilidad: la creacion y la ultima actualizacion del repositorio corresponden al mismo dia y no hay historial de versiones, lo que dificulta saber si el modelo recibira mantenimiento.
- Coste de almacenamiento: 12,3 GB de repositorio y 11.740 MiB de pesos suponen una descarga y un consumo de disco considerables para iterar en local.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-intorealism80bf16-unet
- Pagina del modelo en RunningHub (original): https://www.runninghub.ai/model/public/2089414216682942466
- Pagina del modelo en RunningHub (chino tradicional): https://www.runninghub.ai/zh-tw/model/public/2089414216682942466
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/2015535265380306946
- Listado de modelos de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI/models
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-intorealism80bf16-unet/blob/main/README_cn.md
