# FlemishGiantRabbit/cyraeoe-illustrious-lora

## Resumen

cyraeoe-illustrious-lora es un adaptador LoRA de personaje entrenado por el usuario FlemishGiantRabbit sobre el modelo de difusion Illustrious-XL v0.1 (OnomaAIResearch/Illustrious-xl-early-release-v0), que a su vez deriva de la arquitectura SDXL. No se trata de un modelo de lenguaje, sino de un ajuste de bajo rango destinado a la generacion de imagenes de un personaje original de ficcion para adultos. La palabra de activacion del personaje es `cyraeoe`.

El adaptador se encuentra en su epoca 8 de 10 de entrenamiento segun la model card, y el autor indica que ha sido probado sobre WAI-Illustrious v16 con un peso de 0,8 a 0,9. El repositorio ocupa 0,2 GB y, en el momento de la consulta, no registra descargas ni "likes", por lo que se trata de una publicacion reciente y practicamente sin validacion externa.

Su relevancia es limitada y muy especifica: sirve para quien quiera reproducir de forma consistente este personaje concreto mediante generacion de imagenes, no para tareas de texto, razonamiento, codigo o agentes. La etiqueta not-for-all-audiences y la licencia "other" condicionan fuertemente su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Illustrious-XL v0.1, derivado de SDXL |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts dependen de los codificadores de texto del modelo base) |
| Licencia | other |
| Formato de pesos | no disponible (el repositorio ocupa 0,2 GB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base sin reentrenarlo por completo. El base es Illustrious-XL v0.1 (OnomaAIResearch/Illustrious-xl-early-release-v0), un checkpoint de difusion de tipo SDXL orientado a ilustracion. No se especifica sobre que modulos concretos (atencion, proyecciones, etc.) se aplica el adaptador ni el rango utilizado.

Segun la model card, el entrenamiento se encontraba en la epoca 8 de 10 en el momento de la publicacion. No se detallan el numero de imagenes, la composicion del dataset, la resolucion de entrenamiento, el optimizador, la tasa de aprendizaje ni si hubo tecnicas adicionales (regularizacion, captions, etc.). Tampoco se documenta ningun proceso de ajuste por preferencias. El autor indica que el resultado se ha probado con el checkpoint comunitario WAI-Illustrious v16 a un peso de escala de 0,8-0,9.

## Capacidades

- Generacion de imagenes de un personaje original concreto mediante la palabra de activacion `cyraeoe`.
- Reproduccion consistente del personaje a lo largo de multiples generaciones, condicionada al peso de aplicacion del LoRA (0,8-0,9 segun el autor).
- Integracion con flujos de trabajo SDXL / Illustrious (por ejemplo ComfyUI, Automatic1111, Forge, InvokeAI) que admitan adaptadores LoRA.
- Combinacion potencial con otros LoRA y con checkpoints derivados de SDXL, siempre que sean compatibles.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo "thinking", vision ni audio: es exclusivamente un modelo de sintesis de imagen.
- No se documentan capacidades multilingues a nivel de prompt; se heredan las del modelo base.

## Casos de uso

- Ilustracion de personaje para webcomic o manga: el LoRA permite mantener el mismo diseno de personaje en decenas de vinetas generadas por separado, fijando el peso en el rango recomendado.
- Concept art para videojuegos o novela visual: generar variaciones de poses, ropa y expresiones de `cyraeoe` de forma rapida antes de modelar o dibujar el asset definitivo.
- Creacion de material promocional o avatar: producir imagenes coherentes de un mismo personaje para redes, portadas o fichas de producto.
- Storyboarding: encadenar imagenes del personaje en distintas escenas para previsualizar una secuencia narrativa.
- Prototipado de personaje para encargos: presentar al cliente multiples iteraciones visuales del mismo diseno sin redibujar cada version.
- Generacion de contenido para comunidades de arte aficionado: fan art o ilustraciones de encargo centradas en este personaje, respetando las restricciones de licencia y de audiencia.
- Experimentacion con tecnicas de personalizacion: servir como ejemplo de LoRA de personaje entrenado sobre Illustrious-XL para quien quiera replicar el flujo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta la epoca de entrenamiento y el peso de prueba recomendado, sin metricas objetivas (FID, CLIP score, similitud de personaje, etc.) ni comparaciones cuantitativas.

## Requisitos de hardware

- Al ser un adaptador LoRA, no anade requisitos propios significativos: el coste de VRAM lo determina el modelo base Illustrious-XL/SDXL.
- VRAM estimada para inferencia del modelo base en fp16: en torno a 8-12 GB, segun el backend, la resolucion y el uso de optimizaciones.
- Cabe en GPU de consumo con al menos 8 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs con 6 GB o menos puede requerir cuantizacion o offloading.
- GPUs profesionales recomendadas para lotes grandes o entrenamiento: A100, H100 o similares.
- Opciones de despliegue: ComfyUI, Automatic1111 (webui), Forge, InvokeAI, diffusers, entre otros backends compatibles con SDXL y LoRA.
- Latencia y throughput: no disponibles. Dependen por completo del hardware y del backend empleados.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. La comparativa entre LoRA de personaje depende del dataset, del modelo base y del checkpoint de inferencia, y no se han publicado metricas de este adaptador.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyraeoe-illustrious-lora | no disponible | no aplica | no disponible | other | HuggingFace |
| Otros LoRA de personaje sobre Illustrious-XL | no disponible | no aplica | no disponible | variable | Civitai / PixAI / SeaArt |
| Modelo base Illustrious-XL v0.1 | no disponible | no aplica | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- El contenido esta marcado como not-for-all-audiences: la model card lo describe como un personaje adulto original, por lo que puede no ser apto para todos los publicos ni para todos los entornos.
- Alucinacion: como todo modelo de difusion, puede generar anatomia incorrecta, artefactos o elementos incoherentes, especialmente con prompts poco detallados.
- Consistencia limitada: la fidelidad del personaje depende del peso aplicado, de los prompts y del checkpoint de inferencia; el autor solo recomienda probarlo entre 0,8 y 0,9 sobre WAI-Illustrious v16.
- Estado de entrenamiento incompleto: el adaptador se publico en la epoca 8 de 10, por lo que puede no representar la version final del autor.
- Licencia "other": no se detallan los terminos exactos, de modo que el uso comercial no esta garantizado y debe verificarse con el autor.
- Sin validacion externa: cero descargas y cero "likes" en el momento de la consulta, sin evaluaciones independientes publicadas.
- Idiomas y contexto: no se documentan capacidades multilingues ni parametros de contexto, ya que no es un modelo de lenguaje.
- Sin datos sobre sesgos: no hay informacion sobre sesgos de representacion en el dataset de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/FlemishGiantRabbit/cyraeoe-illustrious-lora
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Directorios de LoRA consultados en la busqueda: https://loraai.io/loras , https://civitai.com/tag/lora , https://pixai.art/en/market
