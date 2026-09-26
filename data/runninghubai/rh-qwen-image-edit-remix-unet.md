# RunningHubAI/rh-qwen-image-edit-remix-unet

## Resumen

rh-qwen-image-edit-remix-unet es un checkpoint de tipo UNET para edicion de imagenes publicado por RunningHubAI en Hugging Face, con pipeline declarado `image-text-to-image`. No se trata de un modelo de lenguaje: es el componente UNET de un pipeline de difusion orientado a edicion de imagen, empaquetado especificamente para su carga en ComfyUI. El repositorio ocupa 20,4 GB y contiene un unico fichero de pesos, `Qwen-Image-Edit-Remix.safetensors`, de 19.484 MiB.

Segun la model card, el modelo esta afinado a partir de Qwen-Edit-2511 y su autoria corresponde al usuario @FX-小肥猴 dentro de la plataforma RunningHub, que actua como distribuidor. La model card no aporta informacion sobre arquitectura interna, numero de parametros, datos de entrenamiento, idiomas soportados ni licencia concreta, mas alla de remitir a la licencia del proyecto original o del modelo upstream.

Su relevancia es acotada y practica: se trata de un peso alternativo para flujos de edicion de imagen por instrucciones en ComfyUI. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y no se ha publicado ningun resultado de benchmarks ni documentacion tecnica adicional, por lo que debe evaluarse como un artefacto de pesos sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se declara como UNET de edicion de imagen; no se detalla la arquitectura interna) |
| Parametros totales | no disponible (unico dato: fichero de 19.484 MiB en safetensors) |
| Parametros activos | no aplica (no se declara una arquitectura MoE) |
| Longitud de contexto | no aplica (modelo de difusion, no un modelo autorregresivo); longitud maxima de prompt de texto: no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye un fichero safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`Qwen-Image-Edit-Remix.safetensors`, 19.484 MiB) |
| Tipo de modelo declarado | UNET (image edit) |
| Pipeline | image-text-to-image |
| Modelo base declarado | Qwen-Edit-2511 |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 20,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

La model card unicamente declara que se trata de un UNET para edicion de imagen y que esta afinado a partir de Qwen-Edit-2511. No se especifica el numero de parametros, la profundidad de la red, el tipo de condicionamiento textual, el encoder de texto asociado ni el VAE con el que debe emparejarse. Tampoco se indica el numero de tokens o imagenes de entrenamiento, la composicion del dataset, la resolucion de entrenamiento ni si se emplearon tecnicas de ajuste por preferencias (RLHF, DPO) o destilacion. Todos estos datos deben considerarse no disponibles.

Como unica inferencia posible a partir de los datos publicados: si el fichero safetensors estuviese almacenado en bf16 o fp16 (2 bytes por parametro), 19.484 MiB corresponderian aproximadamente a 9.700 millones de parametros. Es una estimacion derivada del peso del fichero, no un dato confirmado por el autor, y podria variar si el checkpoint incluye otros tensores o se almacena en otra precision.

El repositorio contiene exclusivamente los pesos del UNET. Para ejecutarlo es necesario reconstruir el pipeline completo (encoder de texto, VAE y scheduler) compatible con el modelo base, cuyos componentes no se incluyen ni se referencian en la model card.

## Capacidades

- Edicion de imagen guiada por texto e imagen de entrada, segun el pipeline declarado `image-text-to-image`.
- Integracion como UNET en flujos de trabajo de ComfyUI, etiqueta con la que el repositorio esta clasificado.
- Carga en la plataforma RunningHub, tanto en su version internacional como en la china, y uso mediante su API.
- Generacion de variaciones o remezclas sobre una imagen de partida, a juzgar por el nombre del checkpoint (Remix); no se documenta el alcance exacto.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de difusion).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, vision adicional): no disponibles.

## Casos de uso

- Edicion fotografica por instrucciones en ComfyUI: cargar el UNET junto con los componentes del pipeline base y aplicar cambios descritos en el prompt de texto sobre una fotografia, sin necesidad de mascaras manuales si el modelo base lo permite.
- Retoque de producto para comercio electronico: sustituir fondos, ajustar iluminacion o eliminar elementos no deseados en catalogos, siempre que el flujo se valide con el pipeline completo compatible.
- Generacion de variaciones creativas: partir de una imagen de referencia y producir remezclas para explorar direcciones visuales antes de un encargo definitivo.
- Automatizacion por lotes: integrar el UNET en un grafo de ComfyUI ejecutado por API (por ejemplo, la API de RunningHub) para procesar colecciones de imagenes con una misma instruccion.
- Restauracion o limpieza de imagenes antiguas: correccion de color, eliminacion de objetos y reconstruccion de zonas degradadas mediante edicion guiada por prompt.
- Prototipado de pipelines de difusion: usar el checkpoint como componente intercambiable en un grafo ya existente y comparar su salida frente a otros UNET derivados del mismo modelo base.
- Edicion de material grafico para marketing: adaptar una misma pieza a distintos formatos o estilos manteniendo el contenido principal de la imagen original.
- Experimentacion en investigacion aplicada: servir como punto de partida para estudiar el efecto del fine-tuning sobre un modelo de edicion de imagen base, siempre que se documenten los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas, metricas de fidelidad de edicion (por ejemplo, CLIP-I, DINO-I o similares), evaluaciones humanas ni comparaciones con el modelo base Qwen-Edit-2511. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible como cifra oficial. Como referencia, el fichero de pesos del UNET ocupa 19.484 MiB, por lo que su carga completa en VRAM (sin cuantizar) requiere al menos unos 20 GB solo para este componente, mas el espacio de activaciones y el de los componentes restantes del pipeline (encoder de texto y VAE), cuyos tamanos no se detallan. Un escenario prudente para carga completa es 24 GB de VRAM como minimo practico, y 40-80 GB recomendado para trabajar con resoluciones o lotes elevados.
- GPU recomendadas: no especificadas por el autor. Por el volumen de pesos, encajan tarjetas de 24 GB o mas (RTX 3090, RTX 4090, A6000, L40S) y, para entornos multiusuario, A100 o H100.
- GPU de consumo: es plausible ejecutarlo en GPU de consumo de 12-16 GB usando las estrategias de offloading y gestion de memoria de ComfyUI, a costa de mayor latencia y de transferencias continuas entre RAM y VRAM. No hay datos medidos que confirmen el rendimiento en estos escenarios.
- Almacenamiento: el repositorio ocupa 20,4 GB, a los que hay que sumar el espacio de los componentes adicionales del pipeline base.
- Opciones de despliegue: ComfyUI (uso nativo, segun la etiqueta del repositorio) y la plataforma RunningHub, incluida su API. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas. La unica comparacion documentada es la procedencia del checkpoint respecto a su modelo base:

| Modelo | Tipo | Base declarada | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-qwen-image-edit-remix-unet | UNET de edicion de imagen | Qwen-Edit-2511 | no disponible | no aplica | no disponible | Hugging Face (repo de 20,4 GB) |
| Qwen-Edit-2511 (modelo base) | Modelo de edicion de imagen | no disponible | no disponible | no aplica | no disponible | no disponible en la informacion proporcionada |
| Otros UNET derivados de Qwen-Image-Edit en ComfyUI | UNET de edicion de imagen | Qwen-Image-Edit | no disponible | no aplica | no disponible | ecosistema ComfyUI (no verificado) |
| Alternativas de edicion de imagen por instrucciones (por ejemplo, familia FLUX.1 Kontext) | Modelo de edicion de imagen | no disponible | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no incluye un fichero de licencia y la model card se limita a remitir a la licencia del proyecto original o upstream. Antes de cualquier uso comercial es imprescindible verificar la licencia de Qwen-Edit-2511 y de Qwen-Image-Edit, asi como los terminos de la plataforma RunningHub.
- Ausencia total de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes ni ejemplos verificables.
- Documentacion tecnica inexistente: no hay informacion sobre arquitectura interna, datos de entrenamiento, hiperparametros ni proceso de afinado, lo que impide auditar el comportamiento del checkpoint.
- Sesgos: no disponibles. Al derivar de un modelo base cuyos datos de entrenamiento no se detallan, no es posible caracterizar sesgos de generacion, representacion demografica o estilo.
- Riesgo de alucinacion visual: como modelo de edicion por difusion, puede introducir o eliminar elementos no solicitados y producir artefactos en texto, manos, rostros o estructuras finas. Este riesgo no esta cuantificado por el autor.
- Incompatibilidad potencial de pipeline: al distribuirse solo el UNET, es necesario emparejarlo con el encoder de texto, el VAE y el scheduler correctos. Una combinacion incorrecta puede degradar la calidad o impedir la carga.
- Limitaciones de idioma e instrucciones: la cobertura linguistica del condicionamiento textual no esta documentada.
- Trazabilidad temporal: el repositorio se creo y actualizo el 2026-09-26, con apenas 36 minutos entre ambos eventos, lo que sugiere una publicacion sin iteraciones posteriores documentadas.
- No apto para tareas de razonamiento, codigo, agentes o tool calling: cualquier expectativa en ese sentido queda fuera del alcance del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-image-edit-remix-unet
- README en chino referenciado en la model card: README_cn.md (dentro del repositorio)
- Proyecto original del modelo en RunningHub: https://www.runninghub.ai/model/public/2015022882413350914
- Pagina del autor (@FX-小肥猴): https://www.runninghub.ai/user-center/1986370833360760833
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Seedance 2.5 via API de RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
