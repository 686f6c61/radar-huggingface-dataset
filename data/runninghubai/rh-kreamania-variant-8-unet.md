# RunningHubAI/rh-kreamania-variant-8-unet

## Resumen

rh-kreamania-variant-8-unet es un modelo de difusion de tipo UNET para edicion de imagen (image-text-to-image) publicado en HuggingFace por RunningHubAI en representacion del autor identificado como @nullnull. El propio autor lo describe como una refinacion directa de "krea2", sin derivar de variantes anteriores, y el trabajo se ha centrado en tres frentes: reequilibrar la iluminacion para reforzar el efecto volumetrico, reducir de forma notable el aspecto de "piel mojada" o exceso de brillo, y mantener intacta la capacidad de generar contenido NSFW sin degradar el renderizado de texturas. Es, por tanto, un ajuste fino de nicho orientado a fotografia de personajes y retrato dentro de un flujo de trabajo ComfyUI.

El repositorio contiene un unico fichero de pesos, `kreamania_variant8_bf16.safetensors`, de 7.789 MiB (8,2 GB de tamano total de repo), en precision bf16. No se publican parametros, arquitectura exacta, datos de entrenamiento, benchmarks ni licencia especifica; la model card se limita a remitir a la licencia del proyecto original o del modelo base ("follow the original project or upstream license").

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de modelo publicado bajo demanda a traves de una plataforma de entrenamiento e inferencia (RunningHub), con cero descargas y cero "likes" en el momento de la consulta, lo que significa que no existe validacion independiente por parte de la comunidad. Cualquier evaluacion en produccion deberia hacerse con pruebas propias y no con las afirmaciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para edicion de imagen; base declarada "krea2" (sin especificar version ni arquitectura subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no aplica (modelo de difusion; la entrada es un prompt de texto mas una imagen) |
| Tipos de cuantizacion | no publicados; el repositorio solo incluye pesos bf16 |
| Idiomas soportados | no disponible (la model card esta en ingles y chino; no se declara soporte multilingue del prompt) |
| Licencia | no disponible; la model card indica "follow the original project or upstream license" y que el copyright permanece en el autor |
| Formato de pesos | safetensors (bf16), fichero unico `kreamania_variant8_bf16.safetensors` |
| Tamano del repositorio | 8,2 GB |
| Casos de uso declarados | image-text-to-image, edicion de imagen, ComfyUI |

Nota: a partir del tamano del fichero (7.789 MiB en bf16, es decir 2 bytes por parametro) se puede estimar un orden de magnitud de unos 4.000 millones de parametros, pero esta cifra es una inferencia aritmetica a partir del peso del fichero y no esta confirmada por el autor ni por ninguna documentacion tecnica.

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada. La model card define el modelo como "UNET (image edit)" y lo clasifica como ajuste fino derivado de "krea2". No se indica el numero de parametros, el tipo de bloques (attention, convolucionales), el numero de canales del VAE, si usa guidance distillation, ni si se emplearon tecnicas de regularizacion como LoRA, DreamBooth o entrenamiento completo del UNET. Tampoco se documenta el dataset de entrenamiento: no hay numero de imagenes, composicion, resolucion, filtrado de calidad ni proceso de curacion.

Lo unico concreto que aporta el autor sobre el entrenamiento son los objetivos de ajuste: reequilibrio de la iluminacion para potenciar el volumen y reduccion del aspecto de piel humeda o brillante. Esto sugiere un trabajo de fine-tuning centrado en la respuesta del modelo a la luz y a la microtextura de piel, probablemente mediante pares imagen-entrada/imagen-salida en un esquema de edicion. No se mencionan fases de RLHF, DPO ni tecnicas de alineacion, algo esperable en modelos de difusion, aunque tampoco se confirma su ausencia.

La plataforma RunningHub ofrece servicios de entrenamiento e inferencia (enlace "Train models on RunningHub" en la model card), lo que apunta a que el ajuste se realizo en esa infraestructura y que el modelo esta pensado para consumirse alli o en ComfyUI local.

## Capacidades

- Generacion y edicion de imagen a partir de texto e imagen de entrada (pipeline declarado image-text-to-image).
- Control de iluminacion orientado a resultados de aspecto volumetrico, segun las notas del autor.
- Renderizado de piel con menor tendencia al aspecto "mojado" o excesivamente brillante.
- Generacion de contenido NSFW, declarada explicitamente como intacta por el autor.
- Compatibilidad con ComfyUI, segun los tags del repositorio y la propia model card.
- Ejecucion en la nube mediante la API de RunningHub, ademas de descarga local de pesos.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusion de imagen).
- No se declara soporte de vision de entrada mas alla de la imagen de referencia propia del flujo de edicion, ni capacidades de audio o video.
- No se declara thinking mode ni capacidades especiales adicionales.

## Casos de uso

- Retoque de retrato con control de iluminacion: el modelo esta ajustado especificamente para reequilibrar la luz y reforzar el volumen, por lo que encaja en flujos de retoque donde se busca corregir iluminacion plana sin rehacer la imagen completa.
- Correccion del aspecto de piel en fotografia de estudio: la reduccion del efecto "piel mojada" es util en sesiones con flash directo o iluminacion dura, donde aparecen brillos no deseados en rostro y claviculas.
- Produccion de contenido para el vertical de adultos: el autor confirma que la capacidad NSFW se mantiene, lo que situa el modelo en pipelines de generacion y edicion de contenido para adultos con requisitos de verificacion legal y de edad por parte del operador.
- Integracion en nodos de ComfyUI: al estar etiquetado como comfyui y unet, se puede cargar como nodo de modelo dentro de un grafo de edicion y combinarlo con ControlNet, IPAdapter u otros condicionamientos ya presentes en ese ecosistema.
- Generacion por lotes mediante API: la publicacion en RunningHub permite invocar el modelo como servicio sin disponer de GPU propia, util para estudios pequenos que necesitan volumen puntual de imagenes.
- Previsualizacion de concept art y variaciones de personaje: la naturaleza de edicion imagen-a-imagen permite iterar sobre un boceto o render previo aplicando cambios de luz y material sin partir de cero.
- Investigacion sobre fine-tuning de UNETs de difusion: al declarar el autor que la variante 8 no deriva de versiones anteriores sino de la base, sirve como punto de comparacion controlado frente a otras variantes de la misma familia.
- Fotografia de producto con control de反射 y volumen: aunque el foco declarado es figura humana, el ajuste de iluminacion es transferible a objetos donde el volumen y los reflejos son criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, ImageReward, comparativas humanas) ni comparaciones cuantitativas con la base "krea2" u otras variantes. Las afirmaciones sobre mejora de iluminacion y reduccion de piel humeda son cualitativas y no estan respaldadas por mediciones publicadas.

## Requisitos de hardware

- VRAM para el UNET: el fichero bf16 ocupa 7.789 MiB, por lo que solo los pesos del UNET requieren aproximadamente 8 GB de VRAM.
- VRAM total estimada en inferencia: sumando text encoder, VAE y activaciones, un rango realista se situa en torno a 12-16 GB en funcion de la resolucion y del numero de pasos. Es una estimacion, no un dato publicado.
- Cuantizaciones disponibles: no hay GGUF, FP8 ni versiones reducidas publicadas en el repositorio, por lo que no se puede reducir el consumo sin convertir los pesos por cuenta propia.
- GPU de consumo: cabe con holgura en RTX 4090 y RTX 3090 (24 GB). En RTX 4080 y 4070 Ti Super (16 GB) deberia entrar en bf16, con margen ajustado. En GPUs de 12 GB o menos el encaje no esta garantizado sin cuantizar.
- GPU de datacenter: A100, H100, L40S y similares ejecutan el modelo sin restriccion de memoria, aunque para un UNET de este tamano no aportan ventaja significativa frente a una GPU de consumo de gama alta.
- Opciones de despliegue: ComfyUI (soporte declarado por los tags), API alojada de RunningHub, y potencialmente diffusers, siempre que se disponga de la configuracion de arquitectura correcta, que no se publica en el repositorio.
- Latencia y throughput: no disponible. No hay datos de tiempo por imagen, pasos por segundo ni paralelismo soportado.

## Comparativa con modelos similares

La comparacion es provisional porque la model card no confirma la arquitectura subyacente de "krea2" ni el numero de parametros del modelo.

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-kreamania-variant-8-unet | no disponible (estimacion no confirmada: ~4.000 millones) | UNET de edicion de imagen sobre base "krea2" | prompt de texto + imagen; sin datos de resolucion | no disponible; remite al proyecto original | HuggingFace + RunningHub |
| FLUX.1 Krea [dev] | 12.000 millones | Transformer de difusion (no UNET clasico) | prompt de texto; sin dato de contexto aplicable | FLUX.1 [dev] Non-Commercial License | HuggingFace, pesos abiertos |
| FLUX.1 [dev] | 12.000 millones | Transformer de difusion | prompt de texto; sin dato de contexto aplicable | FLUX.1 [dev] Non-Commercial License | HuggingFace, pesos abiertos |
| Familia SDXL y sus fine-tunes | ~3.500 millones (2.600 M UNET + encoders) | UNET de difusion | prompt de texto + opcionalmente imagen | CreativeML Open RAIL++-M y variantes por fine-tune | Amplia disponibilidad, ecosistema maduro |

Advertencia: la fila de FLUX.1 Krea [dev] se incluye como posible modelo de referencia de la familia "Krea", pero la model card no confirma que "krea2" corresponda a ese modelo ni a una version concreta. Cualquier equivalencia es una hipotesis, no un dato verificado.

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a la licencia del proyecto original o del modelo base sin especificarla. El uso comercial queda en una situacion juridica indeterminada hasta que el autor o la plataforma lo aclaren.
- Sin validacion de la comunidad: cero descargas y cero "likes" en el momento de la consulta. No existen evaluaciones independientes, ejemplos verificables ni comparativas de terceros.
- Contenido NSFW explicito: el autor confirma que la capacidad de generar contenido para adultos se mantiene intacta. Esto implica obligaciones legales de verificacion de edad y de cumplimiento normativo por parte de quien lo despliegue, ademas de posibles restricciones en plataformas de distribucion.
- Sesgos conocidos: no disponibles. No se documenta composicion del dataset, por lo que no se puede evaluar el sesgo demografico, etnico o de representacion corporal del modelo.
- Riesgo de artefactos: no aplica el concepto de alucinacion como en modelos de lenguaje, pero si el de artefactos visuales tipicos de los modelos de difusion (anatomia incorrecta, manos deformadas, incoherencia entre la imagen de entrada y el resultado), agravado por la ausencia de benchmarks.
- Limitaciones idiomaticas: no se declara que idiomas entiende el prompt. En modelos de esta familia lo habitual es un rendimiento optimo en ingles y degradado en otros idiomas, pero no hay confirmacion.
- Ausencia de cuantizaciones oficiales: sin GGUF ni FP8, el despliegue en GPUs de gama media-baja exige conversion manual con herramientas de terceros, con riesgo de perdida de calidad no medida.
- Metadata con fecha futura: el registro figura creado y actualizado el 2026-09-25, lo que puede indicar un error de la plataforma o una fecha programada. Conviene verificarlo antes de citar el modelo.
- Dependencia de plataforma: parte del valor del modelo esta ligado a RunningHub (entrenamiento, inferencia y API). Si el servicio cambia o desaparece, el modelo queda reducido a un fichero de pesos sin documentacion de arquitectura suficiente para reconstruirlo con facilidad.
- Sin informacion de resolucion soportada: se desconoce la resolucion nativa de entrenamiento y si admite escalado sin degradacion.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-kreamania-variant-8-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2099374970290831362
- Pagina del autor (@nullnull): https://www.runninghub.ai/user-center/2007154923476885506
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino del repositorio: README_cn.md (referenciado en la model card, sin URL absoluta publicada)

Nota sobre la busqueda web: los resultados devueltos por el buscador no guardan ninguna relacion con este modelo ni con modelos de difusion de imagen, por lo que no se han incluido como fuentes. No se han localizado papers, blogs tecnicos, repositorios de codigo ni demos asociados a rh-kreamania-variant-8-unet.
