# RunningHubAI/rh-muse-by-stable-yogi-krea2-unet

## Resumen

rh-muse-by-stable-yogi-krea2-unet es un checkpoint de pesos tipo UNET para modelos de difusion orientados a edicion y generacion de imagen a partir de texto, publicado por la organizacion RunningHubAI en nombre del autor identificado como @LEUL. Se trata de un ajuste fino (finetune) derivado de la base krea2, distribuido especificamente para su carga en ComfyUI y en la plataforma en la nube RunningHub. No es un modelo de lenguaje: es un componente de un pipeline de difusion, por lo que no genera texto ni mantiene conversaciones.

El repositorio contiene un unico archivo de pesos, `Muse-BSY-Krea2-V3.0-pro-C81-Extended-int8convrot.safetensors`, de 12.235 MiB (el repositorio completo ocupa 12,8 GB). El sufijo del nombre indica una cuantizacion a int8, lo que reduce el espacio en disco y la VRAM necesaria frente a un checkpoint en precision completa o fp16, a cambio de una perdida de precision que el autor no documenta. No se especifica el numero de parametros, la arquitectura interna del UNET ni el volumen de datos de entrenamiento.

La relevancia de esta ficha es limitada y conviene ser explicito: el modelo no tiene descargas ni likes registrados, no declara licencia propia, y la model card se limita a enlazar a la plataforma del autor y a indicar que se debe seguir la licencia del proyecto original. Cualquier evaluacion en produccion exige verificar primero la licencia de krea2 y del proyecto upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para edicion de imagen (familia krea2); topologia interna no disponible |
| Parametros totales | no disponible (el checkpoint int8 ocupa 12.235 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; la ventana la fija el codificador de texto del pipeline, no incluido en este repositorio) |
| Tipos de cuantizacion | int8 (archivo `...-int8convrot.safetensors`); no se documentan otras variantes en este repositorio |
| Idiomas soportados | no disponible (los prompts dependen del text encoder del pipeline, no incluido aqui) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (unico archivo, int8) |

## Arquitectura y entrenamiento

El unico dato tecnico confirmado es que se trata de un UNET para edicion de imagen, ajustado a partir de krea2 (`Finetuned from: krea2`). No se publica informacion sobre el numero de parametros, la profundidad de la red, el tipo de atencion, la resolucion nativa de entrenamiento ni la composicion del dataset. El nombre del archivo sugiere una variante "pro" etiquetada como V3.0 y una modificacion de las convoluciones asociada a la cuantizacion int8 (`int8convrot`), pero el autor no aporta ninguna descripcion tecnica de ese proceso, por lo que no puede confirmarse su funcionamiento exacto.

Tampoco hay informacion sobre el proceso de ajuste fino: se desconoce si se emplearon LoRA fusionadas, tecnicas de regularizacion, datos sinteticos, o si hubo alguna fase de alineacion preferencial. En los resultados de busqueda aparecen versiones previas del mismo linaje (V2.0, V2.5pro y V3.5 Int8 Extended) y una variante en fp8 alojada en otro repositorio de la misma organizacion, lo que indica un desarrollo iterativo, pero sin detalle metodologico publicado.

## Capacidades

- Generacion de imagen a partir de texto (pipeline declarado: `image-text-to-image`).
- Edicion de imagen por prompt, segun la propia model card ("Model Type: UNET (image edit)").
- Integracion directa con ComfyUI como nodo de carga de UNet.
- Ejecucion en la nube mediante la plataforma RunningHub y su API.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- Capacidades multilingues: no documentadas.
- No se documentan modos especiales (thinking, audio, video ni vision mas alla del propio pipeline de imagen).
- No se documenta soporte de ControlNet, inpainting dedicado ni LoRA adicionales para este archivo concreto.

## Casos de uso

- Edicion de imagenes en flujo ComfyUI: cargar el UNET en un nodo de carga de modelo junto con el text encoder y el VAE correspondientes a krea2 permite modificar una imagen de entrada mediante prompt, aprovechando que el pipeline declarado es `image-text-to-image`.
- Generacion de imagenes fotorrealistas para previsualizacion de producto: segun los resultados de busqueda, el linaje Muse By Stable Yogi esta orientado a retrato y textura de piel realista, lo que encaja en pruebas de concepto de fotografia comercial antes de una sesion real.
- Prototipado rapido de estilos visuales: el formato int8 reduce el peso del checkpoint a 12.235 MiB, lo que facilita iterar variantes sobre una misma GPU sin recompilar modelos en precision completa.
- Automatizacion por API en la nube: RunningHub ofrece endpoints documentados, de modo que el modelo puede invocarse desde un backend sin disponer de GPU local, util para equipos con cargas esporadicas.
- Integracion en herramientas creativas internas: al ser pesos safetensors compatibles con ComfyUI, se puede embeber el grafo en una aplicacion propia que exponga un formulario de prompt al usuario final.
- Comparacion de variantes de cuantizacion: al existir una version fp8 en el repositorio `RunningHubAI/rh-krea2-turbo-fp8-unet`, este checkpoint int8 sirve para medir el compromiso entre VRAM y calidad en hardware limitado.
- Pruebas de concepto de edicion asistida por lotes: dado que cualquier despliegue productivo exigiria aclarar la licencia, un uso realista inicial es la evaluacion interna, no la explotacion comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Metrica | Resultado |
|---|---|
| FID, CLIP score, ImageReward | no disponible |
| Comparativas cualitativas con la base krea2 | no disponible |
| Ahorro de VRAM o latencia frente a fp8/fp16 | no disponible |
| Evaluacion humana o A/B testing | no disponible |

## Requisitos de hardware

- El checkpoint UNET por si solo ocupa 12.235 MiB (aproximadamente 12,2 GiB) en disco y en VRAM al cargarse, sin contar el text encoder, el VAE ni los buffers de activaciones.
- VRAM estimada: por debajo de 16 GB es poco probable que el pipeline completo funcione con comodidad; 16 GB es el minimo practico y 24 GB o mas es el escenario recomendado.
- GPU de gama alta para trabajo comodo: RTX 4090 (24 GB), RTX 5090, A100 40/80 GB, H100.
- GPU de gama media: RTX 4080 / 4080 Super (16 GB) o RTX 3090 (24 GB) pueden ser suficientes, siempre que la suma de UNET, text encoder, VAE y latentes quepa en memoria.
- En tarjetas de 8-12 GB (RTX 3060, 4060, 4070) el modelo probablemente no quepa sin cuantizacion adicional o sin descarga a RAM, lo que degradaria gravemente la latencia; no hay datos confirmados al respecto.
- Opciones de despliegue: ComfyUI es el entorno declarado; tambien es posible cargar los pesos mediante el cargador de UNet de ComfyUI con los componentes complementarios de krea2. RunningHub ofrece despliegue gestionado y API.
- No se documenta compatibilidad con vLLM, TGI ni llama.cpp, que no aplican a pipelines de difusion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-muse-by-stable-yogi-krea2-unet (este) | UNET de edicion, finetune de krea2 | int8 | no disponible | no disponible (remite al upstream) | HuggingFace, RunningHub, ComfyUI |
| museByStableYogi v3.5 fp8 Extended (`RunningHubAI/rh-krea2-turbo-fp8-unet`) | Mismo linaje, variante fp8 | fp8 | no disponible | no disponible | HuggingFace |
| Muse By Stable Yogi Krea2 V2.5pro / V3.5 Int8 Extended | Versiones previas del mismo autor | int8 | no disponible | no disponible | RunningHub, Civitai |
| krea2 (modelo base del que deriva) | Modelo base de difusion | no disponible | no disponible | no disponible | Upstream no identificado en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos entre estas variantes; la comparacion se limita a formato de pesos, canal de distribucion y linaje declarado.

## Limitaciones y advertencias

- Ausencia total de licencia explicita: la model card indica que los derechos pertenecen al autor y que debe seguirse la licencia del proyecto original, lo que impide confirmar si se permite uso comercial. Es un bloqueante para produccion.
- No se documentan sesgos del modelo, pero al ser un finetune de imagen especializado en retrato y fotorrealismo, es esperable que reproduzca sesgos de representacion presentes en los datos de ajuste; no hay evaluacion publicada al respecto.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir detalles anatomicos incorrectos, texto ilegible o elementos incoherentes, especialmente en prompt complejos.
- La cuantizacion int8 puede introducir degradacion de calidad frente al checkpoint original en fp16 o fp8; no hay mediciones publicadas que cuantifiquen esa perdida.
- Limitaciones de idioma en los prompts: no documentadas, y dependientes del text encoder que no se incluye en este repositorio.
- Este repositorio solo contiene el UNET: no incluye text encoder, VAE ni scheduler, por lo que no es utilizable de forma autonoma sin obtener esos componentes de la base krea2.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso por terceros ni de validacion independiente.
- El nombre del archivo incluye etiquetas de version ("V3.0-pro", "C81", "Extended") sin explicacion, lo que dificulta auditar que cambios incorpora respecto a versiones anteriores.
- Las fechas de creacion y actualizacion registradas (30 de septiembre de 2026) son posteriores a la fecha habitual de consulta; conviene verificar la trazabilidad del repositorio antes de confiar en el.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/RunningHubAI/rh-muse-by-stable-yogi-krea2-unet
- Repositorio del proyecto original en RunningHub: https://www.runninghub.ai/model/public/2085489651325972482
- Pagina del autor (@LEUL): https://www.runninghub.ai/user-center/1945917948739350530
- Version fp8 del mismo linaje: https://huggingface.co/RunningHubAI/rh-krea2-turbo-fp8-unet/blob/main/museByStableYogi_v35Fp8Extended.safetensors
- Version previa V2.5pro en RunningHub: https://www.runninghub.ai/model/public/2082616048192430082
- Ficha en Civitai (Muse By Stable Yogi Krea2): https://civitai.com/models/2741166/muse-by-stable-yogi-krea2
- Repositorio espejo de terceros: https://huggingface.co/ajsbsd/Krea2_Muse_By_Stable_Yogi
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
