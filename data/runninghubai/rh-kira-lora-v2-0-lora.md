# RunningHubAI/rh-kira-lora-v2.0-lora

## Resumen

rh-kira-lora-v2.0-lora es una LoRA (Low-Rank Adaptation) de edicion de imagen publicada por RunningHubAI, una plataforma comercial de generacion y entrenamiento de modelos. La LoRA se ha afinado a partir del modelo base krea2 y esta disenada para su uso en ComfyUI y en la propia plataforma RunningHub. Su funcion principal es introducir un sujeto o estilo concreto (la identidad "Kira") en el proceso de edicion y generacion de imagen condicionada por texto, activandose mediante la palabra clave `kiraface`.

El repositorio es muy ligero (0,2 GB) y contiene un unico archivo de pesos en formato safetensors de 224 MiB, lo que confirma que se trata de un adaptador de bajo rango y no de un modelo completo. La informacion publicada por el autor es minima: no se detallan parametros totales del modelo base, longitud de contexto, idiomas ni terminos de licencia mas alla de una remision generica a la licencia del proyecto original.

Su relevancia es limitada y practica: sirve como ejemplo de adaptador de identidad facial para pipelines de edicion de imagen en ComfyUI y como muestra del modelo de distribucion de RunningHub, que aloja pesos y ofrece inferencia mediante API. No es un modelo de lenguaje ni un modelo fundacional, por lo que las metricas habituales de benchmarks de texto no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; pipeline image-text-to-image |
| Parametros totales | no disponible (adaptador LoRA; el numero de parametros del modelo base no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors de 224 MiB) |
| Idiomas soportados | no disponible (los prompts de texto dependen del modelo base krea2) |
| Licencia | no disponible; el autor remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`Kira_Lora_V2.0_c1-st8000.safetensors`) |
| Tamano del repositorio | 0,2 GB |
| Palabra de activacion | `kiraface` |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que se trata de una LoRA de edicion de imagen afinada a partir de krea2. No se publican detalles sobre el rango de la adaptacion, las capas objetivo, el numero de pasos de entrenamiento, el tamano del dataset ni la composicion de las imagenes de entrenamiento. El nombre del archivo (`c1-st8000`) sugiere un checkpoint intermedio o final en el paso 8000, pero el autor no lo documenta.

Tampoco se especifica si el entrenamiento empleo tecnicas adicionales como regularizacion, captions automaticos, aumento de datos o ajuste de la tasa de aprendizaje. Al ser un adaptador de identidad, lo habitual en este tipo de LoRA es un dataset reducido de imagenes del sujeto con captions que incluyen la palabra de activacion, pero esto es una inferencia general y no un dato confirmado por el autor.

## Capacidades

- Edicion y generacion de imagen condicionada por texto mediante el pipeline image-text-to-image.
- Introduccion de la identidad o el estilo "Kira" en imagenes generadas o editadas, activada con la palabra clave `kiraface`.
- Integracion en flujos de trabajo de ComfyUI como nodo LoRA sobre el modelo base krea2.
- Ejecucion en la plataforma RunningHub, tanto en la interfaz web como mediante API.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni modo thinking.
- No se documentan capacidades multilingues especificas mas alla de las que herede el modelo base.

## Casos de uso

- Edicion de retratos con identidad consistente: cargar la LoRA en ComfyUI sobre krea2 y usar `kiraface` en el prompt para mantener un rostro coherente entre distintas generaciones, util en proyectos de personaje o mascota de marca.
- Creacion de contenido para redes sociales: generar variaciones de un mismo personaje en escenarios distintos sin reentrenar, aprovechando el bajo peso del adaptador (224 MiB) para iterar rapidamente.
- Prototipado de pipelines de edicion de imagen: servir como ejemplo funcional de LoRA de identidad para validar un flujo ComfyUI antes de entrenar un adaptador propio.
- Automatizacion via API: invocar el modelo alojado en RunningHub desde un servicio backend para generar imagenes de personaje bajo demanda, sin gestionar infraestructura de GPU.
- Pruebas de concepto de edicion image-text-to-image: evaluar como responde krea2 a un adaptador de bajo rango antes de comprometerse con un modelo base mayor.
- Generacion de assets para videojuegos o ilustracion: producir retratos consistentes de un personaje secundario con coste de almacenamiento y despliegue minimo.
- Formacion y demos: mostrar en un taller como se aplica una LoRA en ComfyUI y como se activa mediante trigger word.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas objetivas (FID, CLIP score, similitud facial, SSIM) ni comparaciones cuantitativas con otros adaptadores de identidad. Tampoco se documentan tiempos de inferencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para la LoRA de forma aislada; depende enteramente del modelo base krea2, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible. Al tratarse de un pipeline de difusion de imagen, en la practica se requerira una GPU con memoria suficiente para el modelo base; el autor no especifica cuales.
- Compatibilidad con GPU de consumo: no confirmada por el autor. El adaptador en si ocupa solo 224 MiB, pero el modelo base condiciona el requisito real de VRAM.
- Opciones de despliegue: ComfyUI (formato nativo del ecosistema), plataforma RunningHub (web y API) y carga directa de safetensors en Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano del adaptador | Palabra de activacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-kira-lora-v2.0-lora | LoRA de identidad / edicion de imagen | krea2 | 224 MiB | `kiraface` | no disponible | Hugging Face, ComfyUI, RunningHub |
| Otras LoRA de identidad en ComfyUI | LoRA de identidad | variable (SDXL, Flux, etc.) | variable | variable | variable | Civitai, Hugging Face |
| Modelo base krea2 | Modelo de difusion completo | no aplica | no disponible | no aplica | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparacion cuantitativa rigurosa con alternativas concretas.

## Limitaciones y advertencias

- Informacion muy escasa: el autor no publica parametros, dataset, metricas ni condiciones de licencia, lo que dificulta evaluar su calidad y su idoneidad para produccion.
- Licencia ambigua: se remite a "la licencia del proyecto original o upstream" sin concretarla; no se puede confirmar el uso comercial sin verificar la licencia de krea2 y del propio adaptador.
- Dependencia del modelo base: el comportamiento, los idiomas de los prompts y los requisitos de hardware dependen integramente de krea2, cuyas especificaciones no se detallan.
- Riesgo de sobreajuste o sesgo: al ser una LoRA de identidad entrenada presumiblemente con un conjunto reducido de imagenes, puede reproducir sesgos del sujeto y generalizar mal fuera de las condiciones de entrenamiento.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir rasgos inconsistentes, artefactos o deformaciones, especialmente en manos, texto y composiciones complejas.
- Trigger word obligatoria: sin `kiraface` en el prompt es probable que el adaptador no active el efecto deseado.
- Sin garantias de soporte: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de mantenimiento ni de comunidad.
- Uso responsable: la generacion de rostros sinteticos plantea riesgos de suplantacion de identidad y desinformacion; conviene aplicar salvaguardas y etiquetado de contenido generado.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-kira-lora-v2.0-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2105555864160673794
- Pagina del autor: https://www.runninghub.ai/user-center/2065425332248604673
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-kira-lora-v2.0-lora/blob/main/README_cn.md
