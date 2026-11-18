# RunningHubAI/rh-costume-style-lora

## Resumen

`rh-costume-style-lora` es un adaptador LoRA de edicion y generacion de imagen orientado a retratos femeninos con estetica de la dinastia Tang (tangzhuang). Lo publica RunningHubAI, la cuenta de Hugging Face de la plataforma RunningHub, en nombre del autor original identificado como «@氛围感». No es un modelo base autonomo, sino un peso auxiliar que se carga sobre un modelo de difusion ya existente, concretamente un fine-tune derivado de Krea 2 segun declara la model card.

El artefacto principal es un unico fichero `neo_tangzhuang-KreaRaw.safetensors` de 218 MiB (el repositorio completo ocupa 0,2 GB). El pipeline declarado es `image-text-to-image`, y los tags indican compatibilidad con ComfyUI. La fuerza de aplicacion recomendada por el autor es 0,7.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion en IA: se trata de un LoRA de estilo muy especializado, con cero descargas y cero likes en el momento de la consulta, sin licencia explicita y sin documentacion tecnica de entrenamiento. Resulta util, sin embargo, como ejemplo de la categoria de adaptadores de estilismo publicados por plataformas de generacion de imagen y de las carencias habituales de trazabilidad en ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion derivado de Krea 2; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (peso LoRA de 218 MiB; el numero de parametros del adaptador no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible |
| Tipos de cuantizacion | no disponible; se distribuye unicamente en safetensors sin cuantizar |
| Idiomas soportados | no disponible (los prompts del autor estan en chino e ingles) |
| Licencia | no disponible; la model card remite a «la licencia del proyecto original o upstream» sin especificarla |
| Formato de pesos | safetensors (`neo_tangzhuang-KreaRaw.safetensors`, 218 MiB) |
| Tipo de modelo | LoRA de edicion de imagen / estilo |
| Modelo base | Krea 2 (fine-tuned from: krea2) |
| Fuerza recomendada | 0,7 |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador mas alla de su naturaleza LoRA (Low-Rank Adaptation) aplicada sobre un modelo de difusion identificado como Krea 2. No se especifican el rango del adaptador, las capas objetivo, el numero de pasos de entrenamiento, el tamano del dataset ni la composicion de las imagenes de entrenamiento. Tampoco se documenta si hubo tecnicas de regularizacion, captions automaticos o curación manual del dataset.

El unico detalle operativo relevante es la fuerza de aplicacion sugerida de 0,7 y la recomendacion del autor de reutilizar las imagenes de muestra del repositorio para inferir la estructura de los prompts, ya que la redaccion de instrucciones de texto para este estilo es, segun sus propias palabras, exigente. No se han publicado detalles sobre el proceso de entrenamiento en la informacion disponible.

## Capacidades

- Generacion de imagenes de retrato femenino con estetica de la dinastia Tang (tangzhuang), su proposito declarado.
- Edicion de imagen guiada por texto en pipelines `image-text-to-image`.
- Aplicacion como adaptador de estilo sobre el modelo base Krea 2 dentro de ComfyUI.
- Ajuste de intensidad del efecto mediante el peso LoRA (valor recomendado 0,7).
- Integracion en flujos de RunningHub, incluyendo su API.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision analitica, audio ni modo de pensamiento; son capacidades ajenas a un LoRA de difusion.

## Casos de uso

- Generacion de retratos de estilo historico para ilustracion editorial: el LoRA aplica una estetica tangzhuang consistente sobre el modelo base, util para portadas, articulos divulgativos o material grafico de exposiciones sobre la dinastia Tang.
- Creacion de personajes para videojuegos o narrativa visual ambientada en la China imperial: permite iterar variaciones de vestuario y pose manteniendo un lenguaje visual coherente con un peso fijo de 0,7.
- Pruebas de concepto en estudios de diseno de vestuario: el adaptador sirve para explorar paletas, siluetas y ornamentos de inspiracion Tang antes de producir bocetos definitivos.
- Prototipado rapido en ComfyUI: al ser un safetensors de 218 MiB, se carga y descarga con rapidez en flujos de trabajo locales, lo que facilita comparar variantes de estilo sin reentrenar.
- Automatizacion de catalogos tematicos mediante la API de RunningHub: integrable en un pipeline que reciba descripciones textuales y devuelva imagenes de retrato con estilo uniforme.
- Material promocional para eventos culturales o campañas de turismo patrimonial: genera imagenes de referencia de bajo coste antes de contratar fotografia o ilustracion final.
- Docencia y demostracion de tecnicas LoRA: sirve como ejemplo practico de adaptador de estilo de bajo rango en cursos de difusion, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud estetica) ni comparaciones cuantitativas con otros LoRA de estilo.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa unos 218 MiB, pero la inferencia depende enteramente del modelo base Krea 2, cuyos requisitos no se detallan en la informacion disponible. Como referencia general para modelos de difusion de imagen de esa familia, se suele necesitar entre 8 y 24 GB de VRAM segun resolucion y precision, pero este dato no esta confirmado para este caso.
- GPU recomendadas: no disponible de forma especifica; en la practica, cualquier GPU capaz de ejecutar el modelo base Krea 2 (gama RTX 30/40, A100, H100) podria cargar el LoRA.
- Compatibilidad con GPU de consumo: probable si el modelo base cabe en la GPU, dado el reducido tamano del adaptador; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (declarado), plataforma RunningHub y su API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas no aplicables a difusion de imagen en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-costume-style-lora | LoRA de estilo (Tang) | Krea 2 | 218 MiB | no aplica | no disponible | Hugging Face, RunningHub |
| LoRA de estilo genericos en Civitai | LoRA de estilo | SDXL, SD 1.5, Flux, etc. | 20-300 MiB tipico | no aplica | variable por autor | Civitai, Hugging Face |
| Adaptadores oficiales de Krea 2 | LoRA / fine-tune | Krea 2 | no disponible | no aplica | la del proyecto Krea | canales oficiales de Krea |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que se sigue «la licencia del proyecto original o upstream» sin identificarla, lo que impide confirmar si el uso comercial esta permitido. Es un riesgo juridico directo para produccion.
- Dependencia total del modelo base: sin Krea 2 cargado, el fichero safetensors no es utilizable; cualquier restriccion de licencia de Krea 2 se hereda.
- Sesgo de dominio: el adaptador esta entrenado para retratos femeninos de estetica Tang; su comportamiento fuera de ese dominio (hombres, otras epocas, escenas no retratisticas) es impredecible y probablemente degradado.
- Sensibilidad al prompt: el propio autor advierte que la redaccion de prompts es exigente y sugiere apoyarse en herramientas de generacion de prompts o en las imagenes de ejemplo.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir detalles historicamente incorrectos (indumentaria, ornamentos, peinados) que parezcan plausibles.
- Cero adopcion registrada (0 descargas, 0 likes) y ausencia de documentacion de entrenamiento, lo que limita la confianza y la reproducibilidad.
- Sin garantias de mantenimiento: el repositorio se creo y actualizo en la misma fecha (2026-11-18), sin historial posterior conocido.
- No apto para tareas de texto, razonamiento, codigo o agentes; su ambito es exclusivamente la generacion y edicion de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-costume-style-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2091468998419496961
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Fuente declarada en Civitai: https://civitai.red/models/2882559/neotangzhuang-style?modelVersionId=3258153
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-costume-style-lora/blob/main/README_cn.md
