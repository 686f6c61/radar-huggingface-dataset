# RunningHubAI/rh-krea2-turbo-aio-unet

## Resumen

rh-krea2-turbo-aio-unet es un modelo de difusion de tipo UNET orientado a la edicion y generacion de imagenes a partir de texto (pipeline image-text-to-image), publicado por RunningHubAI dentro del ecosistema ComfyUI y de la plataforma RunningHub. Se distribuye como un unico fichero de pesos en formato safetensors de 17775 MiB (aproximadamente 17,8 GB), lo que apunta a pesos en precision de 16 bits.

El modelo esta presentado como un finetune derivado de "krea2" y su nombre comercial, Krea2-Turbo-AIO ("三合一", tres en uno), sugiere una variante destilada para generacion en pocos pasos que integra varios modos de trabajo en un solo UNET. No es un modelo de lenguaje: no genera texto ni razona, sino que produce y edita imagenes.

Su relevancia actual es practica: encaja en flujos de trabajo de ComfyUI y en la API de RunningHub, permitiendo a creadores e integradores desplegar generacion y edicion de imagen sin montar infraestructura propia. La informacion publicada es muy escasa: no hay model card detallada, ni numero de parametros, ni datos de entrenamiento, ni licencia explicita, por lo que buena parte de sus especificaciones figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para edicion/generacion de imagen (finetune de krea2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible; se distribuye un UNET en safetensors (~17,8 GB, compatible con fp16) |
| Idiomas soportados | no disponible (prompts de texto; idiomas no declarados) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,6 GB |
| Nombre del fichero de pesos | Krea2-Turbo-AIO三合一.safetensors (17775 MiB) |
| Pipeline declarado | image-text-to-image |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Fecha de creacion | 2026-09-27 |
| Fecha de actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un UNET, es decir, el componente de red convolucional que actua como denoiser dentro de un pipeline de difusion latente. El modelo esta etiquetado como variante de edicion de imagen (image edit) y con el sufijo "Turbo", habitual en modelos destilados para generar en pocos pasos; el sufijo "AIO" (all-in-one, "tres en uno" segun el titulo original) apunta a que un unico conjunto de pesos cubre varios modos de trabajo.

El modelo se presenta como un finetune de "krea2", pero no se especifican ni el numero de parametros, ni la resolucion nativa, ni el VAE o encoder de texto que debe acompanarlo, ni el numero de tokens o imagenes de entrenamiento, ni si se emplearon tecnicas como distillation, DPO o RLHF. Tampoco hay detalle sobre innovaciones tecnicas (attention, decodificacion, scheduler). Todo ello figura como no disponible.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) dentro del pipeline image-text-to-image.
- Edicion de imagenes (image edit) e imagen a imagen (img2img), segun la descripcion del propio modelo.
- Modo "AIO" (tres en uno): un unico UNET con varios modos de trabajo integrados, segun el nombre del fichero.
- Generacion en pocos pasos ("Turbo"), presumiblemente mediante destilacion; el numero de pasos recomendado no esta documentado.
- Integracion nativa en ComfyUI y en la plataforma RunningHub.
- Compatibilidad con la API de RunningHub para ejecucion remota.
- Tool calling, agentes, razonamiento multi-paso y capacidades multilingues: no aplica (es un modelo de imagen).

## Casos de uso

- Edicion de imagenes en ComfyUI: cargar el UNET en un nodo de difusion y aplicar transformaciones guiadas por prompt sobre una imagen de entrada, aprovechando la compatibilidad declarada con esta interfaz.
- Generacion de imagen bajo demanda en la nube: ejecutar el modelo mediante la API de RunningHub para evitar infraestructura local, util para prototipos y demostraciones.
- Flujos creativos de diseno grafico: generar variaciones de concepto o retoques a partir de bocetos y prompts, integrÃ¡ndose en el nodo de imagen de un pipeline de produccion.
- Creacion de contenido para redes y marketing: producir imagenes editadas a partir de referencias en lotes, apoyÃ¡ndose en el modo Turbo para iteraciones rapidas.
- Integracion en aplicaciones de terceros: consumir el modelo como servicio a traves de la API de RunningHub dentro de un producto que necesite edicion de imagen.
- Prototipado de interfaces graficas generativas: construir un canvas o editor donde el usuario suba una imagen y el modelo la transforme mediante instrucciones de texto.
- Automatizacion de retoque por lotes: encadenar el UNET en un workflow de ComfyUI para procesar colecciones de imagenes de forma desatendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de imagen (FID, CLIP score, etc.), comparativas con otros modelos, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como orientacion, el fichero de pesos ocupa unos 17,8 GB en precision de 16 bits, por lo que se necesita una GPU con al menos esa capacidad de memoria para cargarlo sin cuantizar, mas el margen adicional para activaciones, VAE y encoder de texto.
- GPU recomendadas: no especificadas por el autor. Por tamano del fichero, encajan GPU de datacenter tipo A100 (40/80 GB) y H100, asi como GPU de gama alta con 24 GB o mas.
- Cabe en GPU de consumo: probablemente en tarjetas con 24 GB de VRAM (por ejemplo RTX 3090 o RTX 4090) si se ajusta la precision o se emplean tecnicas de offload; el ajuste exacto no esta documentado.
- Opciones de despliegue: ComfyUI y la plataforma/API de RunningHub son los entornos declarados. Otros backends (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo de imagen de este tipo y no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de parametros, contexto, rendimiento o licencia de este modelo, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. Como referencias del mismo ecosistema y categoria (UNET de difusion para imagen en formato safetensors) pueden citarse los propios repositorios hermanos de RunningHubAI:

| Modelo | Tipo | Formato | Licencia | Notas |
|---|---|---|---|---|
| rh-krea2-turbo-aio-unet | UNET image edit (AIO) | safetensors | no disponible | Objeto de esta ficha |
| rh-krea2-turbo-realistic-unet | UNET (variante realista) | safetensors | no disponible | Publicado por el mismo autor |
| rh-krea2-turbo-fp16-unet | UNET (variante fp16) | safetensors | no disponible | Publicado por el mismo autor |
| Krea2-Turbo-Aio | UNET (original en RunningHub) | safetensors | no disponible | Modelo upstream en la plataforma |

No hay datos de rendimiento que permitan comparar estos modelos entre si.

## Limitaciones y advertencias

- La model card es minima: faltan parametros, resolucion nativa, pasos de inferencia recomendados, dependencias (VAE, encoder de texto) y guia de uso.
- Licencia no especificada: la propia model card indica que se debe seguir la licencia del proyecto original, sin aclararla. Antes de un uso comercial es imprescindible confirmar los terminos con el autor o con la plataforma.
- Copyright: publicado por RunningHub en nombre del autor; los derechos permanecen en el autor.
- No hay informacion sobre sesgos, alineacion o filtrado de contenido del modelo.
- Riesgo de artefactos y de baja fidelidad al prompt propio de los modelos de difusion; no cuantificado por el autor.
- Dependencia fuerte del ecosistema ComfyUI/RunningHub: no se documentan otros formatos de distribucion ni conversion a GGUF.
- Fichero unico de ~17,8 GB: no cabe en GPU de gama media-baja sin tecnicas de offload o cuantizacion, no documentadas.
- Cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-turbo-aio-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2085088066440962049
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/2085048586185814018
- Plataforma RunningHub: https://www.runninghub.ai/
- RunningHub (China): https://www.runninghub.cn/
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Modelo relacionado (rh-krea2-turbo-realistic-unet): https://huggingface.co/RunningHubAI/rh-krea2-turbo-realistic-unet
- Modelo relacionado (rh-krea2-turbo-fp16-unet): https://huggingface.co/RunningHubAI/rh-krea2-turbo-fp16-unet
