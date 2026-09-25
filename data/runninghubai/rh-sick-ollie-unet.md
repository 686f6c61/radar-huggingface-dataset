# RunningHubAI/rh-sick-ollie-unet

## Resumen

rh-sick-ollie-unet es un modelo de difusion de tipo UNET orientado a edicion de imagen (pipeline image-text-to-image), publicado por RunningHubAI a partir de un ajuste fino del modelo base "krea2". Se distribuye como un unico archivo de pesos en formato safetensors (`sickOllie_krea2.safetensors`, 12.540 MiB) y esta pensado para cargarse en ComfyUI o en la plataforma RunningHub, sin que el repositorio incluya codigo de inferencia propio.

El proposito del modelo es generar o editar imagenes a partir de una entrada de texto e imagen, un flujo habitual en pipelines de difusion para "image edit" o "img2img" con control por prompt. El autor figura como RunningHub-@LEUL y el modelo se publica bajo la marca de RunningHub, plataforma de creacion de contenido basada en flujos de ComfyUI.

La relevancia de esta ficha es limitada por la escasez de informacion: no se publican parametros, contexto, idiomas soportados, licencia explicita ni resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card remite integramente a la plataforma del autor para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET (modelo de difusion para edicion de imagen) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un unico archivo en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "follow the original project or upstream license") |
| Formato de pesos | safetensors (`sickOllie_krea2.safetensors`, 12.540 MiB) |
| Tamano del repositorio | 13,1 GB |
| Modelo base | krea2 (ajuste fino) |
| Pipeline declarado | image-text-to-image |
| Plataformas objetivo | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un UNET de edicion de imagen afinado a partir de "krea2". No se detallan el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens de imagen vistos ni si se emplearon tecnicas de alineacion como RLHF, DPO o similares. Tampoco se especifica la resolucion nativa de entrenamiento ni si se aplicaron tecnicas de control adicionales (ControlNet, IP-Adapter, LoRA embebida u otras).

El unico detalle tecnico verificable es el peso del fichero (12.540 MiB) y su formato safetensors, que se corresponde con pesos del componente UNET de un pipeline de difusion. El resto de la informacion sobre arquitectura interna, entrenamiento e innovaciones tecnicas figura como no disponible en la model card y en los resultados de busqueda.

## Capacidades

- Generacion y edicion de imagen a partir de texto e imagen de entrada (pipeline image-text-to-image).
- Integracion con ComfyUI como nodo "Load Diffusion Model" o cargador de UNET, segun los tags del repositorio.
- Uso en la plataforma RunningHub, tanto en flujos alojados como mediante API (segun los enlaces de la model card).
- Ajuste fino derivado de un modelo base de imagen (krea2), lo que sugiere capacidad de estilo o edicion especifica, aunque no se documenta cual.
- Capacidades de tool calling, agentes, razonamiento multi-paso o modo thinking: no aplica (es un modelo de difusion de imagen, no un LLM).
- Capacidades multilingues: no disponibles. Al ser un modelo texto-imagen, la comprension del prompt depende del codificador de texto del pipeline base, que no se documenta.

## Casos de uso

- Edicion de imagen por prompt en ComfyUI: cargar `sickOllie_krea2.safetensors` como UNET en un flujo de difusion y aplicar instrucciones de texto para modificar una imagen de entrada; es el uso previsto segun la pipeline declarada.
- Generacion de variaciones estilisticas: al ser un ajuste fino de un modelo base de imagen, puede emplearse para producir imagenes con un estilo concreto derivado del modelo "krea2" y de los datos de ajuste del autor.
- Prototipado creativo en estudios de diseno: iterar sobre conceptos visuales usando la ventana de edicion texto-imagen sin salir de ComfyUI.
- Previsualizacion de producto o concepto: generar borradores visuales a partir de bocetos o imagenes de referencia combinadas con un prompt descriptivo.
- Integracion en pipelines de contenido mediante la API de RunningHub: automatizar la generacion de imagenes desde una aplicacion externa consumiendo el modelo alojado, segun los enlaces de la model card.
- Formacion y experimentacion: usar el modelo como punto de partida para nuevos ajustes finos dentro de la plataforma RunningHub, que ofrece herramientas de entrenamiento.
- No se documentan casos de uso adicionales como vision por computador de proposito general, video, audio o agentes, por lo que no se listan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el unico dato objetivo es el peso del fichero UNET (12.540 MiB, aproximadamente 12,2 GiB). A esa cifra hay que sumar el codificador de texto y el VAE del pipeline base, por lo que el consumo real de VRAM en inferencia sera superior; no se dispone de una cifra oficial.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del fichero, es razonable esperar GPUs con al menos 16-24 GB de VRAM para una carga comoda, pero esto no esta confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del archivo sugiere que tarjetas de gama alta con 16 GB o mas podrian alojarlo con optimizaciones de offload, aunque no hay datos oficiales.
- Opciones de despliegue: ComfyUI (plataforma indicada en los tags), RunningHub (plataforma nativa del autor) y, potencialmente, Hugging Face como repositorio de pesos. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-sick-ollie-unet | UNET de edicion de imagen (ajuste fino de krea2) | no disponible | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub |
| rh-4.0-unet | UNET image-text-to-image | no disponible | no aplica | no disponible | Hugging Face (RunningHubAI) |
| krea2 (modelo base declarado) | Modelo de imagen base | no disponible | no aplica | no disponible | Segun proyecto original |

No se dispone de datos comparativos de rendimiento (benchmarks, FID, CLIP-score u otros) entre estos modelos en la informacion proporcionada. La comparativa se limita a la categoria y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de datos tecnicos: no se publican parametros, resolucion, dataset de entrenamiento ni metodologia de ajuste, lo que dificulta evaluar su calidad de forma objetiva.
- Licencia no explicitada: la model card indica que se debe seguir la licencia del proyecto original o del upstream, sin concretar cual es. Esto genera incertidumbre legal para uso comercial.
- Riesgo de sesgos y alucinaciones visuales: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos demograficos, culturales o de representacion en las imagenes generadas.
- Dependencia del pipeline base: cualquier limitacion del modelo "krea2" (resolucion, fidelidad del prompt, idiomas del codificador de texto) se hereda en este ajuste.
- Idiomas soportados no declarados: se desconoce si el modelo responde correctamente a prompts en castellano u otros idiomas distintos del ingles.
- Adopcion nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Formatos de cuantizacion no disponibles: solo se ofrece un archivo safetensors, lo que limita las opciones de despliegue en hardware con poca VRAM.
- Uso en produccion desaconsejado sin pruebas previas: no hay informacion sobre estabilidad, latencia ni repetibilidad de resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-sick-ollie-unet
- Pagina del modelo en RunningHub: https://www.runninghub.ai/model/public/2082593059423326210
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/1945917948739350530
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Perfil de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI
