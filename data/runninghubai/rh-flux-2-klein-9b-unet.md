# RunningHubAI/rh-flux.2-klein-9b-unet

## Resumen

rh-flux.2-klein-9b-unet es un modelo de generacion de imagenes a partir de texto (text-to-image) publicado por el usuario RunningHubAI en Hugging Face. Se distribuye como un archivo de pesos UNET aislado, pensado para cargarse en ComfyUI o en la plataforma RunningHub, y segun la propia model card es un ajuste fino (finetune) del modelo Flux2-Klein-9B. El repositorio ocupa 9,4 GB y el unico archivo declarado, `Flux.2 Klein 9B-NSFW.safetensors`, pesa 8996 MiB.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo fundacional nuevo, sino de un derivado de pesos para un pipeline de difusion ya existente. La informacion publicada es minima (una tabla de ficheros, un campo de plataformas y enlaces al servicio RunningHub) y no incluye detalles de arquitectura, datos de entrenamiento, licencia ni benchmarks.

Conviene subrayarlo para quien evalue el modelo: el repositorio no documenta la licencia aplicable, remite a "la licencia del proyecto original o del upstream", y el propio nombre del archivo de pesos indica contenido NSFW. Todo ello condiciona su uso en produccion y exige verificar la licencia del modelo base antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para text-to-image (segun los tags y el campo Model Type de la model card); arquitectura interna no disponible |
| Parametros totales | Aproximadamente 9000 millones segun la denominacion del modelo (9b); no confirmado en la documentacion facilitada |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en un unico safetensors de 8996 MiB, tamano coherente con una representacion en torno a 8 bits para un modelo de ~9B; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card indica que se debe seguir la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (archivo `Flux.2 Klein 9B-NSFW.safetensors`) |

| Campo adicional | Valor |
|---|---|
| Autor | RunningHubAI (RunningHub), atribuido a un usuario de runninghub.cn |
| Pipeline declarado | text-to-image |
| Modelo base | Flux2-Klein-9B (finetuned from) |
| Plataformas indicadas | ComfyUI / RunningHub / Hugging Face |
| Tamano del repositorio | 9,4 GB |
| Descargas y likes | 0 descargas, 0 likes en el momento del registro |
| Fechas | Creado el 23-09-2026, actualizado el 23-09-2026 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Los metadatos lo clasifican como UNET dentro del pipeline text-to-image y el autor declara que deriva de Flux2-Klein-9B. No se especifica el numero de bloques, el tipo de atencion, la resolucion nativa de entrenamiento, el VAE asociado ni el codificador de texto que requiere el pipeline completo.

Tampoco hay datos sobre el entrenamiento: se desconoce el numero de imagenes o pasos utilizados, la composicion del dataset, si hubo ajuste por preferencias (RLHF, DPO u otro), ni la tecnica de ajuste empleada. El unico indicio sobre la naturaleza del ajuste es el nombre del archivo de pesos, que incluye el sufijo NSFW, lo que sugiere un entrenamiento orientado a contenido para adultos, pero esto no se detalla en la model card. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni similares), algo esperable en un modelo de difusion.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), segun el pipeline declarado.
- Integracion como UNET en flujos de trabajo de ComfyUI, cargando pesos safetensors mediante los nodos habituales de carga de difusion.
- Ejecucion en la plataforma RunningHub, incluida la posibilidad de invocacion mediante su API, segun los enlaces de la model card.
- Ajuste orientado a contenido NSFW, a juzgar por el nombre del archivo de pesos; no se detalla el alcance ni el estilo del ajuste.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento (thinking); no aplican a este tipo de modelo.
- Capacidades multilingues: no disponibles. La model card no indica que idiomas entiende el codificador de texto asociado.
- No se documentan capacidades de edicion de imagen, inpainting, control por pose o imagen de referencia; cualquier uso de ese tipo dependeria de componentes externos no incluidos en este repositorio.

## Casos de uso

- Generacion de imagenes en ComfyUI: el modelo se carga como UNET dentro de un grafo que anada el VAE y el codificador de texto correspondientes al pipeline Flux2-Klein, lo que permite generar lotes de imagenes a partir de prompts de forma local.
- Prototipado de estilos visuales: al ser un finetune, resulta util para comparar su sesgo estetico frente al modelo base generando la misma bateria de prompts y evaluando diferencias de estilo, iluminacion y composicion.
- Produccion de contenido para plataformas de adultos: el sufijo NSFW del archivo de pesos indica que el ajuste esta orientado a este dominio; su uso exige verificar edad, consentimiento, legislacion aplicable y las condiciones de la plataforma de destino.
- Generacion por API sin infraestructura propia: los enlaces de la model card apuntan a la API de RunningHub, de modo que se puede invocar el modelo de forma remota sin disponer de GPU local, util para equipos que solo necesitan integraciones puntuales.
- Creacion de material grafico para campanas o conceptos: generacion de bocetos y variaciones de una idea antes de pasar a produccion con herramientas tradicionales, aprovechando el coste marginal bajo de la generacion por lotes.
- Pruebas de integracion en pipelines propios: el repositorio sirve para validar la carga de pesos safetensors, la gestion de memoria y el rendimiento en distintas GPU antes de decidir si se incorpora el modelo a un flujo automatizado.
- Ampliacion de datasets sinteticos: generacion de imagenes etiquetadas a partir de prompts controlados para aumentar la diversidad de un conjunto de entrenamiento, siempre que la licencia aplicable lo permita y se documente el origen sintetico de los datos.
- Base para nuevos ajustes: al ser un UNET aislado, puede emplearse como punto de partida de LoRA o finetunes adicionales, partiendo de que el autor no publica la receta de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye FID, CLIP score, evaluaciones de alineacion prompt-imagen ni comparaciones numericas con otros modelos. Tampoco se facilitan medidas de latencia, pasos de muestreo recomendados, resolucion de salida ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 8996 MiB (unos 8,8 GiB), por lo que se necesita al menos ese espacio solo para el UNET, mas el VAE, el codificador de texto y las activaciones. Como referencia practica, cabe esperar un minimo en torno a 12 GB y un margen comodo a partir de 16-24 GB; no hay cifras oficiales publicadas.
- Si se convierte a bf16, los pesos pasarian a rondar los 18 GB, lo que exigiria GPU de 24 GB o mas; esta conversion no esta documentada por el autor.
- GPU recomendadas: no disponibles en la informacion facilitada. Como orientacion general para un modelo de este tamano en precision reducida, encajan tarjetas de 16 GB o mas (por ejemplo, RTX 4080, RTX 4090, RTX 5090) y, en el ambito profesional, A100 o H100 si se sirve en lote.
- Cabe en GPU de consumo: previsiblemente si, en modelos con 16 GB o mas de VRAM; en tarjetas de 12 GB el encaje depende del VAE, el codificador de texto y la resolucion de salida, y no esta confirmado por el autor.
- Opciones de despliegue: ComfyUI es la via indicada por el autor, ademas de la plataforma RunningHub y su API. No se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni GGUF, formatos que en cualquier caso no aplican a un UNET de difusion.
- Latencia y throughput estimados: no disponibles.
- Nota de integracion: el repositorio contiene unicamente los pesos del UNET. Para generar imagenes hace falta ademas el VAE y el codificador de texto del pipeline Flux2-Klein, que no se incluyen aqui.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La model card unicamente menciona el modelo base del que deriva este ajuste.

| Modelo | Parametros | Contexto o resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-flux.2-klein-9b-unet | ~9B segun denominacion (no confirmado) | No disponible | No disponible | Hugging Face y RunningHub |
| Flux2-Klein-9B (modelo base) | No disponible | No disponible | No disponible | No disponible en la informacion facilitada |
| Otras alternativas de text-to-image | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia indeterminada: el repositorio no publica una licencia propia y remite a la del proyecto original. Sin confirmar los terminos del modelo base, no puede asumirse que el uso comercial este permitido.
- Contenido NSFW: el nombre del archivo de pesos indica un ajuste orientado a contenido para adultos. Esto implica obligaciones legales y de moderacion (verificacion de edad, consentimiento, normativa local y condiciones de la plataforma donde se publique el resultado).
- Sesgos y representacion: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de genero, etnia, edad ni estereotipos visuales. En modelos de difusion ajustados sin documentacion, estos sesgos suelen acentuarse.
- Alucinacion visual: como cualquier modelo generativo de imagenes, puede producir anatomias incorrectas, texto ilegible en la imagen, manos deformes, perspectivas incoherentes y elementos que no existen en el prompt.
- Trazabilidad: el autor original se identifica mediante una cuenta de runninghub.cn y no se aportan datos sobre el proceso de entrenamiento, lo que dificulta auditar el origen de los datos y reproducir el ajuste.
- Alcance limitado del repositorio: solo contiene el UNET. Cualquier intento de uso requiere componentes adicionales (VAE y codificador de texto) que deben obtenerse por separado y con su propia licencia.
- Idiomas: no hay informacion sobre que lenguas entiende el codificador de texto asociado; se recomienda probar con prompts en el idioma objetivo antes de comprometerse a un despliegue.
- Madurez y adopcion: cero descargas y cero likes en el momento del registro. No hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Ausencia de benchmarks: no hay metricas objetivas de calidad ni comparaciones reproducibles, por lo que cualquier decision de adopcion deberia basarse en una evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-flux.2-klein-9b-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2034791765911277570
- Pagina del autor: https://www.runninghub.cn/user-center/2012385098774876162
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
