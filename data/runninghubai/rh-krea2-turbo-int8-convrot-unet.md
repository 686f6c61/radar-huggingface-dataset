# RunningHubAI/rh-krea2-turbo-int8-convrot-unet

## Resumen

rh-krea2-turbo-int8-convrot-unet es un checkpoint de pesos de tipo UNET para generacion y edicion de imagenes a partir de texto (pipeline image-text-to-image), publicado por el usuario RunningHubAI en Hugging Face en nombre de su autor. Se trata de una version cuantizada a int8, con una variante de cuantizacion que el nombre del fichero denomina "convrot", de un modelo derivado de krea2 (la model card indica "Finetuned from: krea2"). El repositorio contiene un unico fichero safetensors de 12.540 MiB (aproximadamente 13,1 GB de repositorio) llamado `seeKrea2_genesisInt8Convrot.safetensors`.

El problema que aborda es el coste de memoria del UNET en la inferencia de modelos de difusion de gran tamano: almacenar los pesos en int8 reduce aproximadamente a la mitad el espacio en disco y la VRAM necesaria frente a fp16/bf16, a cambio de una perdida de calidad que el autor no cuantifica en ningun momento. Su relevancia es practica: el ecosistema ComfyUI ha normalizado el uso de checkpoints UNET cuantizados para ejecutar modelos de imagen de gran tamano en GPU de consumo y en plataformas cloud.

La documentacion publicada es minima. La model card no incluye numero de parametros, arquitectura interna del modelo base, datos de entrenamiento, idiomas, licencia concreta ni resultados de benchmarks, y la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente foros de rol ajenos al proyecto). Cualquier dato no listado aqui debe considerarse no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para image-text-to-image (etiquetado como UNET en ComfyUI); arquitectura interna del modelo base no documentada |
| Parametros totales | no disponible (el fichero int8 pesa 12.540 MiB; a 1 byte por parametro implicaria un orden de 12-13 mil millones de parametros, estimacion no confirmada por el autor) |
| Longitud de contexto | no aplica / no disponible (modelo de difusion, no usa ventana de contexto de tokens) |
| Tipos de cuantizacion | int8 con variante "convrot" en el fichero publicado; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (fichero unico `.safetensors`) |
| Modelo base | krea2 (segun la model card: "Finetuned from: krea2") |
| Tamano del repositorio | 13,1 GB |
| Pipeline declarado | image-text-to-image |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Fecha de publicacion | 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el artefacto como un UNET de edicion de imagen ("Model Type: UNET (image edit)") afinado a partir de krea2 y distribuido unicamente como pesos. No se especifica si la red subyacente es un UNet convolucional clasico o un transformer de difusion (DiT/MMDiT); en ComfyUI el termino "unet" se aplica de forma generica al componente denoiser, por lo que la etiqueta no permite deducir la topologia real. Tampoco se detallan el numero de parametros, el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o fine-tuning supervisado adicional.

La innovacion declarada implicitamente en el nombre es la cuantizacion a int8 con "convrot", presumiblemente una rotacion de pesos orientada a convoluciones para reducir el error de cuantizacion, pero la model card no describe el metodo, no publica metricas de degradacion frente al modelo sin cuantizar y no aclara si requiere nodos personalizados de ComfyUI o un runtime especifico para de-serializar los pesos. Toda afirmacion sobre el algoritmo de cuantizacion es una inferencia a partir del nombre del fichero y debe tratarse como no verificada.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el pipeline image-text-to-image declarado.
- Edicion de imagen: la model card etiqueta explicitamente el modelo como "UNET (image edit)".
- Integracion nativa en flujos de trabajo de ComfyUI (etiqueta `comfyui` en el repositorio).
- Ejecucion en la plataforma cloud RunningHub y exposicion mediante su API, segun los enlaces de la model card.
- Ejecucion con pesos en int8, lo que permite cargar el denoiser en equipos con menos VRAM que la version sin cuantizar.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles; no se documenta el comportamiento del codificador de texto asociado ni los idiomas de los prompts.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; unicamente generacion y edicion de imagen.

## Casos de uso

- Edicion de imagenes por lotes en estudio: cargar el UNET int8 en ComfyUI y aplicar una misma instruccion de edicion a un catalogo de fotografias, aprovechando que los pesos caben en GPU de 24 GB sin recurrir a comparticion de memoria.
- Prototipado de pipelines de difusion en equipos de desarrollo: al reducir el denoiser a int8, el modelo permite iterar sobre grafos de ComfyUI en estaciones de trabajo con una sola GPU consumer antes de escalar a produccion.
- Servicio de generacion de imagenes bajo API: desplegar el checkpoint en RunningHub y consumirlo mediante su API para ofrecer generacion de imagenes a una aplicacion web sin mantener infraestructura propia.
- Generacion de variaciones de producto para comercio electronico: usar el modo de edicion para recomponer fondos, iluminacion o encuadre sobre fotografias reales de producto, manteniendo el sujeto original.
- Creacion de material grafico para campanas de marketing: producir imagenes base a partir de prompts de texto y refinarlas con edicion iterativa dentro del mismo grafo de ComfyUI.
- Investigacion sobre cuantizacion de modelos de difusion: comparar este checkpoint int8 "convrot" con el modelo base sin cuantizar para medir la degradacion de calidad y el ahorro de VRAM y de tiempo de carga, siempre que se disponga de la version original de krea2.
- Maquetacion de storyboards y bocetos conceptuales: generar rapidamente propuestas visuales a partir de descripciones textuales y editarlas despues de forma local, sin enviar material a servicios de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (FID, CLIP score, similitud con el prompt), ni comparaciones con el modelo krea2 sin cuantizar, ni mediciones de latencia o throughput. La busqueda web realizada no devolvio ningun resultado tecnico relacionado con este modelo.

## Requisitos de hardware

- VRAM para los pesos: el fichero del UNET ocupa 12.540 MiB (unos 12,25 GiB) en disco; cargarlo completo en memoria exige al menos esa cantidad solo para el denoiser, a la que hay que sumar activaciones, el codificador de texto y el VAE, que en ComfyUI se cargan como componentes independientes. Estimacion orientativa, no confirmada por el autor.
- GPU consumer de 24 GB: RTX 4090, RTX 3090 y RTX 4090 D son las candidatas mas razonables para mantener el UNET en VRAM junto al resto del grafo.
- GPU consumer de 16 GB: RTX 4080, RTX 4070 Ti Super y similares requeririan offloading a RAM o cuantizacion adicional del resto de componentes; no hay confirmacion del autor.
- GPU profesionales: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) permiten margen suficiente para lotes grandes y resoluciones altas.
- Opciones de despliegue: ComfyUI (soporte declarado mediante la etiqueta `comfyui`), plataforma RunningHub en la nube y su API, y descarga directa de Hugging Face. vLLM, TGI, Ollama y llama.cpp no son aplicables a un checkpoint UNET de difusion.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo, y no es posible estimarlos sin conocer el modelo base, la resolucion objetivo y el numero de pasos de muestreo.

## Comparativa con modelos similares

No se ha encontrado informacion publica suficiente para una comparativa fiable. La tabla siguiente recoge unicamente lo que puede afirmarse o marcarse explicitamente como no disponible.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-turbo-int8-convrot-unet | no disponible | no aplica | safetensors int8 (convrot) | no disponible | Hugging Face, ComfyUI, RunningHub |
| krea2 (modelo base, sin cuantizar) | no disponible | no aplica | no disponible | no disponible (depende del proyecto upstream) | no verificado en esta busqueda |
| Otras cuantizaciones comunitarias de krea2 (fp8, int8, GGUF) | no disponible | no aplica | no disponible | no disponible | no se han localizado referencias en la busqueda web |

Como referencia cualitativa, frente al modelo base sin cuantizar cabe esperar un tamano de fichero aproximadamente la mitad (int8 frente a fp16) y una degradacion de calidad no cuantificada por el autor. No hay datos de rendimiento que permitan afirmar si esta degradacion es despreciable o significativa.

## Limitaciones y advertencias

- Licencia no especificada: la model card se limita a indicar que se sigue la licencia del proyecto original o upstream. No se puede asumir uso comercial sin verificar la licencia de krea2 y de sus dependencias.
- Riesgo de degradacion por cuantizacion: la conversion a int8 introduce error numerico; el autor no publica ninguna comparacion de calidad frente al modelo sin cuantizar.
- Metodo "convrot" no documentado: se desconoce que biblioteca o nodo lo interpreta y si ComfyUI estandar puede cargarlo directamente. Verificar antes de integrarlo en produccion.
- Procedencia del fine-tuning desconocida: no se detallan datos de entrenamiento, resolucion nativa, numero de pasos recomendado, escala de CFG ni prompts de referencia, lo que dificulta reproducir resultados.
- Sesgos del modelo base no evaluados: al no documentarse el dataset de krea2 ni el del fine-tuning, no es posible caracterizar sesgos demograficos, estilisticos o culturales.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar detalles incoherentes, texto ilegible o elementos que no corresponden al prompt; no se han publicado evaluaciones al respecto.
- Idiomas no soportados declarados: no se indica que idiomas entiende el codificador de texto asociado; se desconoce el comportamiento con prompts en castellano.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en la fecha de consulta, por lo que no existe comunidad que haya validado su funcionamiento.
- Dependencia de la plataforma: parte de la documentacion y del flujo de uso apunta a RunningHub y a su API, lo que puede implicar dependencia de un servicio externo para reproducir el entorno previsto.
- Fichero de pesos de terceros: al ser un safetensors de 12,5 GB publicado por un tercero, conviene verificar el hash antes de cargarlo en entornos de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-turbo-int8-convrot-unet
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2087061239309627394
- Pagina del autor: https://www.runninghub.cn/user-center/2012385098774876162
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Nota sobre la busqueda web: no se localizo ningun paper, blog, repositorio ni demo adicional relacionado con este modelo; los resultados devueltos por la busqueda correspondian a foros no relacionados con IA.
