# RunningHubAI/rh-6.0-unet

## Resumen

rh-6.0-unet es un fichero de pesos de tipo UNET para edicion de imagen, publicado en Hugging Face por RunningHubAI en nombre del autor identificado como 氛围感. Se distribuye como un unico fichero `Stable Yogi Krea2 V3.0 Civ fp8.safetensors` de 13 146 MiB (el repositorio completo ocupa 13,8 GB) y esta pensado para cargarse en ComfyUI, en la plataforma RunningHub o mediante la API de esta ultima. Su pipeline declarado es `image-text-to-image`, es decir, edicion de imagen guiada por texto.

El modelo es un ajuste fino (finetune) derivado de `krea2`, segun la propia model card, y se presenta como una variante de la version de Civitai "Muse by Stable Yogi Krea2" (modelVersionId 3189679). La unica descripcion funcional aportada por el autor es cualitativa: anade "atmosfera" y "sensacion cinematografica", con mejor color que un FP8 estandar.

La relevancia practica es limitada pero concreta: se trata de pesos precuantizados en FP8 listos para inferencia en flujos de trabajo de ComfyUI, lo que reduce los requisitos de VRAM frente a pesos en BF16. No obstante, en el momento de la captura de datos el repositorio acumulaba 0 descargas y 0 likes, no se publica licencia explicita, no hay idiomas declarados y no se aportan parametros, contexto ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET para edicion de imagen (difusion); estructura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen) |
| Tipos de cuantizacion | FP8 (fichero `Stable Yogi Krea2 V3.0 Civ fp8.safetensors`) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto que se use, no incluido) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y que se debe seguir la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors |
| Tamano del fichero | 13 146 MiB (13,8 GB de repositorio) |
| Modelo base | krea2 (finetuned from) |
| Origen declarado | Muse by Stable Yogi Krea2, modelVersionId 3189679 (Civitai) |
| Plataformas soportadas | ComfyUI, RunningHub (web y API), Hugging Face |
| Fecha de creacion | 26/09/2026 |
| Ultima actualizacion | 26/09/2026 |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que se trata de una UNET de edicion de imagen, ajustada a partir de `krea2`. No se especifican el numero de parametros, la variante concreta de la arquitectura (por ejemplo, si emplea bloques de atencion completa o variantes lineales), el tipo de scheduler, ni si el pipeline subyacente es de difusion clasica o de flow matching. Tampoco se detalla la dimension latente ni la resolucion nativa de entrenamiento.

Respecto al entrenamiento, la model card no aporta numero de pasos, tamano del dataset, composicion de los datos, ni si se emplearon tecnicas de ajuste por preferencias (RLHF, DPO) o de destilacion. Lo unico documentado es el resultado del ajuste fino: un aumento de la "sensacion atmosferica" y cinematografica y una mejora de color respecto a un FP8 sin ajustar. La cuantizacion a FP8 esta ya aplicada en el fichero distribuido, de modo que no se ofrece una version en precision completa dentro de este repositorio.

No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion de pasos, etc.) ni se incluyen los componentes complementarios habituales en un pipeline de difusion, como el codificador de texto o el VAE.

## Capacidades

- Edicion de imagen guiada por texto (pipeline `image-text-to-image`): el modelo recibe una imagen de entrada y una instruccion textual, y devuelve una imagen modificada.
- Generacion de imagen a partir de texto, segun el uso habitual de los nodos UNET en ComfyUI, aunque la model card lo presenta explicitamente como modelo de edicion.
- Ajuste de color y estetica: el autor declara mejora de color frente a un FP8 estandar y un aumento del aspecto cinematografico y atmosferico.
- Integracion con flujos de trabajo de ComfyUI: el fichero esta etiquetado con la etiqueta `comfyui`, por lo que se espera su carga mediante los nodos de carga de UNET del ecosistema.
- Ejecucion mediante API en la plataforma RunningHub, que expone endpoints documentados para su uso remoto.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision comprensiva, audio ni modo de pensamiento. Es un modelo de generacion/edicion de imagen, no un modelo de lenguaje.

## Casos de uso

- Edicion fotografica con correccion de estilo: se parte de una fotografia y se aplica una instruccion de texto para reiluminar o cambiar la paleta; el ajuste declarado hacia tonos cinematograficos lo hace adecuado para acabado de imagen final.
- Postproduccion de material audiovisual: aplicar el UNET para igualar el color entre planos generados o grabados, aprovechando la mejora de color declarada frente al FP8 sin ajuste.
- Creacion de arte conceptual con estetica cinematografica: generacion y retoque iterativo de bocetos en ComfyUI, encadenando el modelo con nodos de ControlNet u otros condicionadores disponibles en el ecosistema.
- Prototipado rapido de assets para videojuegos o animacion: generacion de variantes atmosfericas de un mismo concepto manteniendo la composicion de la imagen de entrada.
- Automatizacion por API para produccion por lotes: uso del endpoint de RunningHub para procesar volumenes altos de imagenes sin desplegar infraestructura propia de GPU.
- Investigacion y comparacion de cuantizaciones: al ser un FP8 ya empaquetado, sirve como referencia para medir la perdida de calidad frente a pesos en mayor precision del mismo ajuste.
- Demostraciones interactivas en ComfyUI: carga directa del fichero en un nodo de UNET para mostrar edicion texto-imagen en talleres o evaluaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay FID, CLIPScore, SSIM ni comparativas numericas con otros modelos, ni tampoco mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 13 146 MiB, por lo que se necesita al menos esa cantidad solo para la UNET; hay que sumar el codificador de texto y el VAE del pipeline, habitualmente varios GB adicionales. Como referencia practica, se recomienda un minimo de 16 GB de VRAM y, de forma comoda, 24 GB.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 3090 (24 GB) como opciones de consumo realistas; A100, H100 o L40S para despliegue por API o por lotes.
- GPU de gama media: en tarjetas de 12 GB o menos es probable que el modelo no quepa junto con el resto del pipeline sin recurrir a offload a RAM o a memoria unificada, lo que degrada notablemente la latencia. No se aportan datos confirmados de funcionamiento en estas configuraciones.
- Opciones de despliegue: ComfyUI (formato nativo esperado por la etiqueta del modelo), API de RunningHub (cloud gestionado) y cualquier runtime que cargue safetensors de difusion, como Diffusers si la arquitectura resulta compatible. No hay confirmacion de soporte para llama.cpp, Ollama, vLLM ni TGI, que no son aplicables a este tipo de modelo (vLLM y TGI estan orientados a modelos de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de otros modelos comparables dentro de la informacion proporcionada. La unica referencia solida es el propio origen del ajuste.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-6.0-unet | no disponible | no aplica (imagen) | sin benchmarks publicados | no disponible | safetensors FP8 en Hugging Face, 0 descargas |
| krea2 (modelo base, upstream) | no disponible | no aplica (imagen) | no disponible | no disponible | no disponible en esta informacion |
| Muse by Stable Yogi Krea2 v3189679 (Civitai) | no disponible | no aplica (imagen) | no disponible | no disponible | Civitai |

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que el copyright pertenece al autor y que debe seguirse la licencia del proyecto original o del upstream, sin especificar cual es. Esto supone un riesgo legal para uso comercial hasta que se aclare.
- Sin datos de evaluacion: no hay benchmarks, ni comparativas objetivas, ni muestras publicadas en el repositorio que permitan validar las mejoras de color y atmosfera declaradas por el autor.
- Adopcion nula verificable: en el momento de la captura, el repositorio mostraba 0 descargas y 0 likes, por lo que no existe evidencia de uso en produccion ni retroalimentacion de la comunidad.
- Dependencia de componentes externos: el repositorio solo contiene la UNET. El codificador de texto y el VAE no se incluyen ni se especifican, de modo que la calidad final depende de los componentes que empareje el usuario y de que sean compatibles con el ajuste.
- Precision fija en FP8: no se ofrece version en BF16 o FP16. Si el ajuste se realizo con conocimiento del autor, FP8 puede implicar cierta perdida de fidelidad frente a mayor precision, especialmente en texturas finas y degradados.
- Riesgo de contenido: es un modelo de generacion y edicion de imagen sin filtros documentados; puede reproducir sesgos presentes en los datos de entrenamiento del modelo base y de los ajustes en Civitai, y no se documenta ninguna evaluacion de seguridad.
- Resolucion y dominio de entrenamiento desconocidos: al no documentarse la resolucion nativa ni el tipo de imagenes usadas en el ajuste, el comportamiento fuera de ese dominio es impredecible.
- Idiomas no declarados: la comprension multilingue de los prompts depende por completo del codificador de texto elegido, no del fichero UNET.
- Sin garantias de compatibilidad futura: al no especificarse version de ComfyUI ni de las librerias, pueden aparecer incompatibilidades al cargar los pesos en versiones distintas a las usadas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-6.0-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2084450593342865409
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Modelo de origen en Civitai (Muse by Stable Yogi Krea2, version 3189679): https://civitai.red/models/2741166/muse-by-stable-yogi-krea2?modelVersionId=3189679
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Documentacion de la API de llamada: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
