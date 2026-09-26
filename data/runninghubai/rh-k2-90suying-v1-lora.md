# RunningHubAI/rh-k2-90suying-v1-lora

## Resumen

rh-k2-90suying-v1-lora es un adaptador LoRA de edicion de imagen (pipeline image-text-to-image) publicado por RunningHubAI en nombre del autor identificado en la model card como RunningHub-@Hui.Av. Se trata, por tanto, de un modelo de difusion afinado sobre una base declarada como "krea2", y no de un modelo de lenguaje: su funcion es modificar una imagen de entrada, condicionada por un prompt de texto, para cambiar su estetica visual.

El objetivo declarado por el autor es corregir el aspecto "demasiado pulido" y artificial que suelen presentar las imagenes generadas por IA. Segun la model card, el LoRA produce imagenes con colores mas palidos y un acabado similar al de una fotografia tomada con un movil de gama baja o de baja resolucion, con una sensacion de desenfoque, imitando el estilo visual tipico de plataformas como Douyin o Xiaohongshu.

El artefacto publicado es un unico fichero safetensors de 1784 MiB (repositorio de 1.9 GB) que debe cargarse junto con el modelo base en ComfyUI, RunningHub o Hugging Face. El autor indica que los parametros ya vienen ajustados (cfg 1, peso del LoRA entre 0,8 y 1, sampler euler-a, scheduler beta) y desaconseja modificarlos sin experiencia. El repositorio no declara licencia explicita, idiomas soportados, ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. LoRA de edicion de imagen sobre un modelo base de difusion declarado como "krea2" |
| Parametros totales | No disponible. El unico artefacto publicado son pesos LoRA en un fichero de 1784 MiB |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (modelo de generacion y edicion de imagen) |
| Tipos de cuantizacion | No disponible. Solo se publica un fichero safetensors; no hay variantes GGUF, fp8 ni int8 |
| Idiomas soportados | No disponible. El condicionamiento textual depende del codificador de texto del modelo base |
| Licencia | No disponible. La model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (K2-90SuYing-V1_20260924_224149.safetensors, 1784 MiB) |
| Pipeline declarado | image-text-to-image |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base | krea2 (segun la model card) |
| Tamano del repositorio | 1,9 GB |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Fecha de creacion | 25 de septiembre de 2026 (segun metadatos del repositorio) |
| Fecha de actualizacion | 25 de septiembre de 2026 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del adaptador ni del modelo base. Se sabe que se trata de un LoRA (Low-Rank Adaptation) de edicion de imagen, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base de difusion para modificar su comportamiento sin reentrenar todos los pesos. El fichero publicado pesa 1784 MiB, lo que es coherente con un adaptador de rango relativamente alto o con un adaptador que afecta a un numero elevado de capas del modelo base.

El modelo base declarado es "krea2", finetuned from krea2 segun la model card. No se especifica la version exacta, el numero de parametros del base, ni su arquitectura (UNet, transformer de difusion o similar). Tampoco se publican datos sobre el dataset de entrenamiento: no hay numero de imagenes, composicion, resolucion, ni si se emplearon tecnicas de regularizacion, captions automaticos o entrenamiento con pares imagen-imagen para la tarea de edicion.

No se documenta ninguna innovacion tecnica adicional: no hay decodificacion especulativa, atencion lineal, destilacion ni metodos de aceleracion de muestreo. El autor unicamente aporta una receta de inferencia recomendada (cfg 1, peso del LoRA 0,8-1, sampler euler-a, scheduler beta) que, segun indica, ya viene calibrada de fabrica.

## Capacidades

- Edicion de imagen condicionada por texto e imagen: el pipeline declarado es image-text-to-image, por lo que acepta una imagen de entrada y un prompt de texto para producir una version editada.
- Transferencia de estilo fotografico concreto: transforma la estetica de la imagen hacia un aspecto de fotografia de movil de baja resolucion, con colores palidos y una sensacion de desenfoque o baja nitidez.
- Reduccion del aspecto "generado por IA": el objetivo declarado es eliminar el acabado excesivamente pulido y artificial de las imagenes sinteticas.
- Integracion con ComfyUI: el repositorio esta etiquetado con comfyui y lora, por lo que esta pensado para cargarse como nodo LoRA en un flujo de trabajo de ComfyUI.
- Ejecucion en plataforma gestionada: puede utilizarse a traves de RunningHub y de su API, sin necesidad de infraestructura propia.
- Parametros de inferencia preconcebidos: la model card indica valores concretos de cfg, peso del adaptador, sampler y scheduler.
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no expone interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso: no hay planificacion ni ejecucion de tareas encadenadas a nivel de modelo.
- Capacidades multilingues: no disponibles. El texto de condicionamiento se procesa con el codificador del modelo base, y no se documenta que idiomas maneja.
- Capacidades especiales: ninguna declarada (no hay modo de razonamiento, ni audio, ni vision para comprension; la vision se usa unicamente como condicionamiento de generacion).

## Casos de uso

- Contenido para redes sociales con estetica de movil: el LoRA permite tomar una imagen generada o retocada y devolverle un aspecto de fotografia amateur tomada con un telefono de gama baja, algo adecuado para publicaciones en Douyin o Xiaohongshu donde la imagen perfecta genera rechazo.
- Humanizacion de imagenes sinteticas en marketing: una agencia puede generar material con un modelo de difusion y aplicar despues este LoRA para eliminar el acabado "plasticoso", obteniendo creatividades que parecen fotografias reales de producto o estilo de vida.
- Etiquetado por lotes en ComfyUI: al ser un LoRA cargable en un nodo, se puede integrar en un workflow que procese carpetas enteras de imagenes con los parametros fijos indicados (cfg 1, euler-a, beta), lo que facilita el procesado repetitivo sin intervencion manual.
- Generacion de datasets de imagen con aspecto realista: util para crear conjuntos de datos de entrenamiento o evaluacion que incluyan degradaciones propias de una camara de movil (color apagado, baja nitidez) en lugar de imagenes sinteticas impecables.
- Prototipado creativo rapido: un disenador puede subir una foto de referencia, aplicar el LoRA y comparar variantes de estilo antes de comprometerse con una direccion de arte definitiva.
- Experimentacion estetica en investigacion: permite estudiar como un adaptador de bajo rango modifica la distribucion de salida del modelo base en terminos de color, nitidez y textura, sin reentrenar el modelo completo.
- Integracion en producto mediante API: al estar disponible en RunningHub, se puede invocar desde una aplicacion propia a traves de su API sin desplegar GPU local, lo que reduce el coste de puesta en marcha para herramientas de edicion de fotos.
- A/B testing de estilo visual: comparar imagenes procesadas con el LoRA frente a las originales para medir el impacto del acabado fotografico en metricas de engagement.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna metrica cuantitativa (FID, CLIP score, SSIM, LPIPS ni comparaciones humanas), ni tampoco datos de velocidad de inferencia o consumo de memoria. Ademas, el repositorio registra 0 descargas y 0 likes, por lo que no existe retroalimentacion de la comunidad que permita contrastar el rendimiento declarado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. La inferencia requiere cargar simultaneamente el modelo base "krea2" y el adaptador LoRA de 1784 MiB, por lo que el consumo depende enteramente del modelo base, cuyas especificaciones no se documentan en el repositorio. Cualquier cifra concreta seria una estimacion no verificada.
- GPU recomendadas: no disponibles para este modelo. Al no conocerse el modelo base, no se puede confirmar un requisito minimo ni una GPU recomendada.
- Compatibilidad con GPU de consumo: no confirmada. Un adaptador LoRA de este tamano es, por si mismo, ligero para una GPU de consumo, pero la viabilidad final depende del modelo base y de la resolucion de trabajo.
- Opciones de despliegue: ComfyUI (uso local, cargando el LoRA sobre el modelo base), RunningHub y su API (uso gestionado en la nube), y Hugging Face como repositorio de distribucion de los pesos.
- Formatos de despliegue soportados: safetensors. No hay versiones para llama.cpp, Ollama, vLLM ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo.
- Almacenamiento: el repositorio ocupa 1,9 GB, mas el espacio adicional necesario para el modelo base, que no se especifica.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables. La informacion proporcionada no incluye benchmarks, especificaciones numericas de rendimiento ni identificacion precisa del modelo base, por lo que cualquier comparacion cuantitativa seria especulativa.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-k2-90suying-v1-lora | LoRA de edicion de imagen sobre krea2 | No disponible (fichero de 1784 MiB) | No aplica | No publicado | No disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas comparables | No identificadas en la informacion disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Como referencia cualitativa, este adaptador competiria con otros LoRA de edicion de imagen entrenados sobre el mismo modelo base "krea2", pero no se ha facilitado informacion sobre ninguno de ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan. Al ser un modelo de imagen entrenado con un dataset no especificado, es plausible que herede los sesgos del modelo base y de los datos de entrenamiento, pero no hay informacion que lo confirme ni que permita acotarlos.
- Riesgo de alucinacion: en modelos de difusion el equivalente es la generacion de detalles inconsistentes o la alteracion no deseada del contenido original. No se publica ninguna evaluacion al respecto.
- Perdida de fidelidad en la edicion: al aplicar un efecto de baja resolucion y colores palidos, la imagen de salida puede perder nitidez y detalle respecto al original. El propio autor lo describe como "alta sensacion de desenfoque", lo que puede ser inaceptable en flujos donde se requiere maxima calidad.
- Parametros de inferencia fijados: la model card advierte explicitamente de que los parametros ya estan ajustados y que los usuarios sin experiencia no deberian modificarlos. Alterar cfg, peso, sampler o scheduler puede degradar el resultado.
- Limitacion de idioma: no se declara que idiomas admite el condicionamiento textual. Se desconoce si funciona correctamente con prompts en castellano.
- Licencia incierta: el repositorio no incluye un fichero de licencia y la model card se limita a indicar que el copyright pertenece al autor y que debe seguirse la licencia del proyecto original o upstream. Esto genera incertidumbre juridica para uso comercial: es imprescindible verificar la licencia del modelo base "krea2" antes de cualquier despliegue en produccion.
- Modelo base no documentado: no se especifica la version exacta de "krea2" ni su licencia, lo que impide evaluar la compatibilidad y las restricciones de uso del conjunto.
- Ausencia de validacion externa: el repositorio tiene 0 descargas y 0 likes, y no hay issues, discusiones ni ejemplos publicados por terceros que permitan confirmar el comportamiento descrito.
- Fechas inconsistentes: los metadatos indican fechas de creacion y actualizacion en septiembre de 2026, y el nombre del fichero de pesos incluye 20260924. Conviene verificar la vigencia del artefacto antes de integrarlo.
- Dependencia de la plataforma: el flujo de uso recomendado por el autor esta vinculado a RunningHub, lo que puede implicar dependencia de un servicio externo y de sus condiciones de uso.
- No apto para tareas de texto: no debe emplearse para generacion de lenguaje, razonamiento, codigo ni uso como agente, ya que no es un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-k2-90suying-v1-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-k2-90suying-v1-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2103541873368457217
- Pagina del autor: https://www.runninghub.cn/user-center/1997605227178119169
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
