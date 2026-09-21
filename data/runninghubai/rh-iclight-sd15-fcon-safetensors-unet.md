# RunningHubAI/rh-iclight-sd15-fcon.safetensors-unet

## Resumen

rh-iclight-sd15-fcon.safetensors-unet es un fichero de pesos publicado por la cuenta RunningHubAI en Hugging Face, con un tamano de repositorio de 1,7 GB y un unico archivo de pesos llamado iclight_sd15_fcon.safetensors (1640 MiB) destinado a cargarse en ComfyUI o en la plataforma RunningHub. La model card lo describe como un "UNET" y lo etiqueta con el pipeline text-to-video, aunque el nombre del archivo remite a IC-Light sobre SD 1.5 (variante "fcon"), un modelo de difusion orientado a la manipulacion de iluminacion de imagenes. Esa discrepancia entre la etiqueta de pipeline y el nombre del fichero no queda aclarada en la informacion disponible.

El modelo no presenta metricas de adopcion: cero descargas y cero "likes" en el momento de la consulta, y el repositorio se creo y actualizo el 21 de septiembre de 2026. No se publican parametros totales, longitud de contexto, idiomas soportados ni licencia explicita; la propia model card remite a "la licencia del proyecto original o upstream" sin concretarla.

Por su naturaleza, no es un modelo de lenguaje ni un sistema multimodal conversacional, sino un componente de pesos (UNet) para integrarse en un grafo de ComfyUI. Cualquier evaluacion de capacidades, benchmarks o casos de uso debe hacerse por tanto en el contexto de un pipeline de difusion, no como modelo de proposito general, y con la cautela de que la documentacion aportada es minima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (segun tag y model card); detalle de variante no disponible |
| Parametros totales | no disponible (el tamano del archivo, 1640 MiB, es compatible con un UNet SD 1.5 en fp16, pero no se confirma) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible para este tipo de componente |
| Tipos de cuantizacion | no disponible (el repositorio contiene un unico archivo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "seguir la licencia del proyecto original o upstream", sin especificarla) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,7 GB |
| Archivo incluido | iclight_sd15_fcon.safetensors (1640 MiB) |
| Pipeline declarado | text-to-video (segun etiqueta de Hugging Face) |
| Plataformas indicadas | ComfyUI / RunningHub / Hugging Face |

## Arquitectura y entrenamiento

La model card describe el artefacto unicamente como un "UNET" y no aporta informacion sobre la arquitectura interna, el numero de parametros, la composicion del dataset, el numero de tokens o imagenes de entrenamiento, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (propias, en cualquier caso, de modelos de lenguaje y no de este tipo de componente). Tampoco se detalla si el entrenamiento se realizo en RunningHub ni con que configuracion.

El nombre del fichero, iclight_sd15_fcon.safetensors, apunta a la familia IC-Light aplicada a Stable Diffusion 1.5, donde el sufijo "fcon" suele corresponder a la variante de condicionamiento por primer plano. Esta es una inferencia basada exclusivamente en el nombre del archivo y no en documentacion confirmada; la model card no menciona IC-Light, ni SD 1.5, ni el tipo de condicionamiento. La etiqueta text-to-video del repositorio tampoco concuerda con esa lectura, por lo que la naturaleza exacta del modelo queda sin verificar.

## Capacidades

- Generacion de imagenes o manipulacion de iluminacion dentro de un pipeline de difusion, segun se deduce del nombre del archivo y del tag "unet" (no confirmado por la model card).
- Integracion como nodo de carga de UNet en flujos de ComfyUI.
- Uso como peso cargable en la plataforma RunningHub.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Edicion de iluminacion en imagenes dentro de ComfyUI: si el modelo corresponde efectivamente a la variante IC-Light "fcon", se cargaria como UNet en un grafo de img2img para recolocar o sustituir la iluminacion de una fotografia preservando el sujeto. La falta de documentacion obliga a validar el comportamiento empiricamente antes de usarlo en produccion.
- Prototipado de pipelines de difusion personalizados: al ser un componente de pesos aislado, permite sustituir el UNet por defecto de un flujo SD 1.5 en ComfyUI para experimentar con variantes de condicionamiento.
- Pruebas de compatibilidad de nodos en ComfyUI: util como carga de referencia para verificar que un workflow acepta UNets externos en formato safetensors.
- Reproduccion de flujos alojados en RunningHub: permite descargar localmente los pesos empleados por un flujo publicado en esa plataforma y ejecutarlo en una instalacion propia.
- Formacion y docencia sobre pipelines de difusion: sirve como ejemplo de artefacto intermedio (UNet) frente al pipeline completo, para explicar la descomposicion de estos sistemas.
- Validacion de licencias y procedencia en un entorno corporativo: el caso de uso aqui es de auditoria, ya que la ausencia de licencia explicita obliga a revisar la procedencia antes de cualquier despliegue comercial; no se recomienda su uso productivo sin aclarar este punto.

No se dispone de informacion suficiente para proponer casos de uso de generacion o edicion de video, pese a la etiqueta text-to-video del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad, FID, CLIP score ni comparaciones cuantitativas con otros modelos, y los resultados de la busqueda web realizada no aportan datos tecnicos sobre este modelo (los enlaces devueltos no guardan relacion con el artefacto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un UNet de SD 1.5 en fp16 ocupa alrededor de 1,7 GB, por lo que el componente aislado cabria en GPUs con 4 GB o mas, aunque el pipeline completo (VAE, text encoder y buffers de activacion) requeriria bastante mas. Esta estimacion no esta confirmada por el autor.
- GPUs recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma confirmada; por tamano del archivo, es plausible en GPUs de gama media y alta, pero sin validacion oficial.
- Opciones de despliegue: ComfyUI y la plataforma RunningHub son las indicadas por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de componente).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica con certeza la familia a la que pertenece el modelo ni incluye datos de rendimiento, por lo que no es posible establecer una comparacion rigurosa con alternativas como otros UNets de SD 1.5 o con las variantes originales de IC-Light. Cualquier comparacion requeriria confirmar primero la naturaleza del artefacto y disponer de metricas reproducibles.

## Limitaciones y advertencias

- Licencia no especificada: la model card remite a la licencia del proyecto original sin indicarla, lo que impide determinar si el uso comercial esta permitido. No se recomienda su uso en produccion sin aclarar este extremo.
- Discrepancia entre el pipeline declarado (text-to-video) y el nombre del archivo (IC-Light SD 1.5), sin aclaracion por parte del autor.
- Ausencia total de documentacion tecnica: no hay datos de arquitectura, entrenamiento, parametros ni evaluacion.
- Cero descargas y cero "likes": no existe evidencia de uso, validacion por la comunidad ni reporte de incidencias.
- Riesgo de alucinacion y sesgos: no evaluables, ya que no se trata de un modelo generativo de texto.
- Idiomas soportados: no disponibles.
- Fecha de creacion y actualizacion poco habituales (2026), lo que dificulta situar el artefacto en su contexto de lanzamiento.
- La busqueda web no devolvio ningun resultado relevante sobre el modelo; los enlaces obtenidos eran de tematica ajena, por lo que no se han podido contrastar afirmaciones externas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-iclight-sd15-fcon.safetensors-unet
- Proyecto original (RunningHub): https://www.runninghub.cn/model/public/1922566903020097537
- Pagina del autor: https://www.runninghub.cn/user-center/1935673237986865153
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo.
