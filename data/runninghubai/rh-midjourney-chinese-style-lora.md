# RunningHubAI/rh-midjourney-chinese-style-lora

## Resumen

rh-midjourney-chinese-style-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI (RunningHub), con autoria atribuida al usuario @GOODLUCK2024 en la plataforma RunningHub. El modelo aplica una estetica fotografica de inspiracion "midjourney" orientada a tematica china sobre un modelo base identificado en la model card como "krea2". El repositorio de HuggingFace ocupa 0,2 GB e incluye un unico archivo de pesos, `MJ中式美学KREA2.safetensors`, de 224 MiB.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es un adaptador de bajo rango que se carga sobre un modelo de difusion subyacente y se utiliza en flujos de image-to-image o text-to-image. Su pipeline declarado en HuggingFace es `image-text-to-image`, y las plataformas de uso indicadas por el autor son ComfyUI, RunningHub y Hugging Face.

La relevancia de esta publicacion es acotada: se trata de un LoRA de estilo publicado sin model card tecnica detallada, sin datos de entrenamiento, sin benchmarks y sin licencia explicita. Resulta util como referencia de como RunningHub distribuye adaptadores de estilo listos para consumir en ComfyUI, pero la ausencia de documentacion tecnica limita seriamente su evaluacion rigurosa y su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusion identificado como "krea2"; arquitectura del base no detallada |
| Parametros totales | no disponible (no se especifica rango del LoRA ni numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion/edicion de imagen) |
| Tipos de cuantizacion | no disponible; el unico peso publicado es `MJ中式美学KREA2.safetensors` (224 MiB) |
| Idiomas soportados | no disponible (la model card esta en ingles y enlaza a un README en chino, pero no declara idiomas de prompt) |
| Licencia | no disponible. La model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original o upstream, sin nombrarla |
| Formato de pesos | safetensors (un unico archivo: `MJ中式美学KREA2.safetensors`) |
| Modelo base | "krea2" (segun la model card, campo "Finetuned from") |
| Tamano del repositorio | 0,2 GB |
| Tamano del adaptador | 224 MiB |
| Tipo de tarea | image-text-to-image (edicion/generacion guiada por texto) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-30 / 2026-09-30 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador ni del modelo base. Se sabe que es un LoRA de edicion de imagen afinado a partir de un base denominado "krea2" y que se distribuye como un unico archivo safetensors de 224 MiB. No se especifica el rango del adaptador, las capas objetivo (attention, proyecciones, bloques de convolucion) ni si el entrenamiento se realizo sobre el UNet, el transformer o ambos.

No hay informacion sobre el dataset de entrenamiento: no se indica numero de imagenes, resolucion, composicion, proporciones de textos asociados, ni si hubo etapas de ajuste por preferencias (RLHF/DPO) o regularizacion con imagenes de clase. Tampoco se documentan hiperparametros (learning rate, steps, batch size, precision). La unica referencia tecnica es el prompt de ejemplo incluido en la model card, que describe a una mujer de Asia Oriental con kimono blanco y tapaiz exterior semitransparente, en un marco de puerta de madera con luz solar filtrada, con mencion explicita a la textura rugosa de la madera y a un estado de animo sereno y tradicional. Es plausible que ese texto corresponda a una muestra representativa del estilo capturado, pero no se puede confirmar como parte del dataset.

## Capacidades

- Aplicacion de un estilo visual de inspiracion "midjourney" con tematica china sobre un modelo base de difusion, mediante carga del adaptador en el pipeline correspondiente.
- Generacion y edicion de imagenes guiadas por texto (pipeline declarado: `image-text-to-image`), por lo que admite entrada de imagen de referencia junto al prompt textual.
- Reproduccion de retratos fotograficos con detalle en piel, pelo, tejidos y materiales (madera, tela semitransparente) segun el ejemplo documentado.
- Control de iluminacion y atmosfera a traves del prompt: el ejemplo describe luz solar filtrada, sombras suaves y contraste entre texturas rugosas y superficies lisas.
- Integracion con ComfyUI como nodo de carga de LoRA y con la plataforma cloud RunningHub.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de razonamiento multi-paso, generacion de codigo, matematicas ni modo de pensamiento.
- No dispone de capacidades de vision para comprension de imagen, audio ni video.
- Capacidades multilingues en prompts: no disponibles ni documentadas.

## Casos de uso

- Retrato editorial de tematica cultural: generar imagenes de figura humana con vestuario tradicional y ambientacion de madera o exteriores para ilustrar articulos sobre estetica de Asia Oriental, aprovechando la capacidad del LoRA para reproducir tejidos y luz natural descrita en el ejemplo del autor.
- Ilustracion de portadas para narrativa historica o wuxia: producir cubiertas de novela o relato con una atmosfera serena y tradicional coherente entre volumenes, ya que un LoRA de estilo mantiene consistencia visual repetible con el mismo prompt base.
- Arte conceptual para videojuegos de ambientacion historica china: generar variaciones rapidas de personajes y escenarios para iterar con direccion de arte antes de encargar arte final, usando el pipeline image-text-to-image para partir de bocetos.
- Direccion de arte y moodboards: crear tableros de referencia con una paleta y un tratamiento fotografico concretos, cargando el LoRA en ComfyUI junto al modelo base para fijar el look antes de produccion.
- Marketing de turismo cultural: generar piezas visuales de templos, patios y puertas de madera con luz filtrada para campanas de destinos, reduciendo coste frente a sesiones fotograficas con localizacion.
- Edicion de imagenes existentes: reestilizar fotografias propias hacia la estetica del LoRA mediante image-text-to-image, por ejemplo para homogeneizar un catalogo de imagenes dispares.
- Automatizacion por API: integrar el adaptador en flujos programaticos a traves de la API de RunningHub, encadenando generacion por lotes con prompts parametrizados para producir variantes masivas de un mismo estilo.
- Prototipado de assets para tiendas de plantillas: generar muestras de estilo para paquetes de LoRA o presets que se venden en plataformas de contenido generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de estilo, evaluaciones humanas) ni comparaciones cuantitativas con otros adaptadores. Tampoco se documentan resoluciones de entrenamiento o inferencia, pasos de muestreo recomendados, escala de aplicacion del LoRA (peso) ni CFG sugerido.

## Requisitos de hardware

- Los requisitos de VRAM dependen integramente del modelo base "krea2", cuyas especificaciones no se publican en la informacion disponible.
- El adaptador en si anade 224 MiB de pesos sobre el modelo base, un coste de memoria despreciable frente al base.
- Estimacion orientativa, no confirmada por el autor: para bases de difusion de clase FLUX/Krea, la inferencia en bf16/fp16 suele requerir del orden de 12 a 24 GB de VRAM, y entre 6 y 10 GB con cuantizaciones GGUF Q4/Q5 o fp8.
- GPU de consumo: probablemente viable en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB con cuantizacion adecuada del modelo base; no confirmado por el autor.
- GPU de datacenter: A100, H100 o L40S si se despliega el base sin cuantizar y con lotes grandes; no confirmado.
- Opciones de despliegue: ComfyUI (local), plataforma cloud RunningHub y descarga desde Hugging Face. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-midjourney-chinese-style-lora (RunningHubAI) | LoRA de estilo, image-text-to-image | "krea2" | 224 MiB | no aplica | no disponible (derechos del autor, remite al upstream) | Hugging Face, RunningHub, ComfyUI |
| Midjourney Chinese-style (RunningHub) | LoRA de estilo | no disponible | no disponible | no aplica | no disponible | RunningHub |
| Midjourney Asian realistic style (RunningHub) | LoRA de estilo | no disponible | no disponible | no aplica | no disponible | RunningHub |

No se dispone de datos de rendimiento, parametros o licencia de las alternativas, por lo que la comparacion se limita al tipo de artefacto, la plataforma de distribucion y el enfasis estetico declarado. No se han identificado en la informacion proporcionada adaptadores equivalentes con documentacion tecnica completa que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan dataset, hiperparametros, rango del LoRA, capas entrenadas ni resolucion de entrenamiento, lo que impide reproducir o auditar el adaptador.
- Licencia no especificada: la model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original, sin nombrarla. No hay confirmacion de permiso para uso comercial, por lo que su uso en produccion conlleva riesgo legal.
- Dependencia critica del modelo base "krea2": la calidad, el comportamiento y las restricciones legales del resultado dependen de un modelo cuya licencia y disponibilidad no se detallan.
- Riesgo de alucinacion visual: al ser un modelo generativo de imagen, puede producir anatomia incorrecta, manos deformes, texto ilegible en la escena y detalles incoherentes, especialmente en composiciones complejas o con varias figuras.
- Sesgo estetico y cultural: el unico ejemplo documentado describe a una mujer de Asia Oriental de piel clara con kimono, una prenda japonesa, bajo una etiqueta de estilo "chino". Esta mezcla sugiere una posible conflacion de tradiciones de Asia Oriental y un sesgo hacia un ideal de belleza concreto, con riesgo de reproducir representaciones estereotipadas o etnicamente imprecisas.
- Riesgo de suplantacion: al generar retratos fotorrealistas de personas, existe riesgo de uso para crear imagenes de personas reales sin consentimiento. No se documenta ninguna salvaguarda al respecto.
- Idiomas e instrucciones de prompt no documentados: se desconoce si el adaptador responde igual de bien a prompts en castellano, chino o ingles.
- Sin senal de adopcion: cero descargas y cero likes en HuggingFace en el momento de la consulta, sin comunidad que haya validado el resultado ni reportado fallos.
- Sin benchmarks ni evaluacion humana publicada: no hay evidencia objetiva de que supere a otros adaptadores de estilo disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RunningHubAI/rh-midjourney-chinese-style-lora
- README en chino referenciado por la model card: https://huggingface.co/RunningHubAI/rh-midjourney-chinese-style-lora/blob/main/README_cn.md
- Pagina original del modelo en RunningHub: https://www.runninghub.ai/model/public/2095554820294959105
- Version en chino de la pagina del modelo: https://www.runninghub.ai/zh-cn/model/public/2095554820294959105
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1980864188878884866
- Organizacion RunningHubAI en HuggingFace: https://huggingface.co/RunningHubAI
- Listado de modelos de RunningHubAI: https://huggingface.co/RunningHubAI/models
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- LoRA relacionado, Midjourney Asian realistic style: https://www.runninghub.ai/model/public/2046833118992146433
