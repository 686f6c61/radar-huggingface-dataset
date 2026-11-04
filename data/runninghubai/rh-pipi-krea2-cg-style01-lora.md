# RunningHubAI/rh-pipi-krea2-cg-style01-lora

## Resumen

`rh-pipi-krea2-cg-style01-lora` es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en nombre del autor PiPiAi. No es un modelo de lenguaje ni un modelo fundacional, sino un peso adicional que se aplica sobre el modelo base krea2 para inducir un estilo visual concreto identificado por la palabra de activacion `cg art style`. El repositorio ocupa 0,2 GB y contiene un unico fichero safetensors de 224 MiB (`13_c1-st10000.safetensors`), lo que confirma que se trata de un adaptador de bajo rango y no de un checkpoint completo.

Su relevancia es practica y acotada: permite reproducir de forma consistente una estetica de arte CG (render por ordenador) dentro de flujos de trabajo de ComfyUI y de la plataforma RunningHub, sin necesidad de reentrenar el modelo base. La model card recomienda pesos de activacion entre 0,5 y 0,9 (optimo 0,9), muestreo Euler, 8 pasos y CFG 1.0, lo que apunta a un modelo base de la familia de difusion por destilacion (pocos pasos, CFG bajo).

La informacion publicada es escasa: no se detallan datos de entrenamiento, licencia explicita, idiomas ni resultados de benchmarks. La ficha refleja, por tanto, unicamente lo verificable en el repositorio y en la model card, marcando como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; pipeline image-text-to-image |
| Parametros totales | no disponible (peso del adaptador: 224 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen) |
| Tipos de cuantizacion | no disponible; el fichero distribuido es safetensors |
| Idiomas soportados | no disponible (las palabras de activacion y prompts de la model card estan en ingles) |
| Licencia | no disponible; la model card indica que los derechos permanecen con el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`13_c1-st10000.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base krea2 para modificar su comportamiento sin alterar los pesos originales. El pipeline declarado es `image-text-to-image`, lo que encaja con un modelo de difusion condicionado por texto y, opcionalmente, por una imagen de entrada. El nombre del fichero (`13_c1-st10000`) sugiere un entrenamiento de 10.000 pasos, aunque el autor no lo confirma explicitamente.

No se documentan el numero de imagenes de entrenamiento, la composicion del dataset, el metodo de anotacion ni si hubo tecnicas de regularizacion o ajuste fino adicional. La model card menciona que el modelo fue etiquetado con "TuTu's Super Intelligent Tagger" y entrenado con "TuTu's Super Trainer", herramientas de terceros (zhaotutu.xyz) sin documentacion tecnica publica en el repositorio. Tampoco se especifica la arquitectura interna del modelo base krea2 (tipo de difusion, variante de transformer o UNet, mecanismo de atencion).

## Capacidades

- Generacion de imagen a partir de texto con un estilo visual CG inducido por la palabra de activacion `cg art style`.
- Edicion de imagen (image edit) segun la propia model card, con flujos de trabajo especificos para edicion de vestuario, edicion de imagen unica y "image remixing".
- Control de intensidad del estilo mediante el peso del LoRA (rango recomendado 0,5-0,9, optimo 0,9).
- Integracion en ComfyUI como nodo de LoRA sobre el modelo base krea2.
- Ejecucion en la plataforma RunningHub, tanto en la version internacional como en la china, con API disponible.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision analitica, audio ni modo "thinking"; no aplican a este tipo de modelo.

## Casos de uso

- Produccion de ilustracion CG estilizada: aplicar el LoRA con peso 0,9 sobre krea2 y un prompt descriptivo para generar ilustraciones con una estetica CG coherente en series de imagenes, manteniendo el estilo entre lotes.
- Edicion de vestuario en personajes: usar el flujo de "outfit editing" documentado por el autor para cambiar la ropa de una imagen existente preservando la identidad del personaje y el estilo CG.
- Edicion de imagen unica: emplear el flujo de "single image editing" para retoques localizados sobre una fotografia o render, con el LoRA aportando la capa estilistica.
- "Image remixing" sin inferencia inversa: transformar una imagen de referencia en una nueva version estilizada siguiendo el flujo publicado, util para variaciones creativas rapidas.
- Prototipado de arte conceptual: generar variantes de un concepto visual en pocos pasos (8 pasos, CFG 1.0) para iterar rapido en fases tempranas de diseno.
- Integracion en pipelines automatizados via API de RunningHub: encadenar generacion y edicion de imagenes en un servicio externo sin gestionar infraestructura GPU propia.
- Experimentacion en ComfyUI: combinar el LoRA con otros nodos (controlnet, upscalers, etc.) para composiciones mas complejas, aprovechando que el adaptador es ligero (224 MiB) y facil de cargar y descargar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con otros LoRA de estilo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base krea2, no del LoRA. El adaptador en si ocupa 224 MiB en disco y una cantidad similar en memoria al cargarse.
- GPU recomendadas: no documentadas por el autor. La model card menciona el uso de RTX 4090 con 48 GB en el contexto promocional de RunningHub, pero no como requisito del modelo.
- Compatibilidad con GPU de consumo: probable si el modelo base krea2 cabe en la GPU, dado que el LoRA anade una sobrecarga minima; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (plataforma principal declarada), plataforma RunningHub (internacional y china) y API de RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles. La configuracion recomendada de 8 pasos y CFG 1.0 sugiere inferencia rapida, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de estilo comparables ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, podria compararse con otros adaptadores LoRA de estilo para modelos de difusion (por ejemplo, los publicados en Civitai o en el propio ecosistema RunningHub), pero no se dispone de sus especificaciones en esta busqueda.

## Limitaciones y advertencias

- Informacion muy escasa: no se documentan datos de entrenamiento, licencia explicita ni idiomas, lo que dificulta evaluar su idoneidad para produccion.
- Licencia ambigua: la model card remite a "la licencia del proyecto original o upstream" sin concretarla; el uso comercial requiere verificar la licencia de krea2 y del propio adaptador con el autor.
- Dependencia del modelo base: el LoRA solo funciona correctamente sobre krea2; usarlo con otros modelos base puede degradar la calidad o no producir el estilo esperado.
- Estilo unico y acotado: esta disenado para un estilo CG concreto; no es un modelo generalista ni sustituye a un modelo fundacional.
- Riesgo de sobreajuste al estilo: con pesos altos (0,9) puede dominar en exceso la composicion y reducir la fidelidad al prompt; el rango 0,5-0,9 permite ajustar el equilibrio.
- Sin benchmarks ni evaluaciones independientes: no hay evidencia cuantitativa de calidad, sesgos o robustez.
- Posibles sesgos visuales heredados del dataset de entrenamiento no documentado (representacion de personas, culturas, etc.), imposibles de evaluar sin informacion.
- Fecha de creacion y actualizacion en el repositorio (2026) y ausencia de descargas o likes: modelo muy reciente y sin validacion por parte de la comunidad en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RunningHubAI/rh-pipi-krea2-cg-style01-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2096532294352887809
- Pagina del autor (PiPiAi): https://www.runninghub.ai/user-center/1954484547733893121
- Modelo base krea2 (URL oficial indicada en la model card): https://www.RunningHub.ai/zh-cn/model/public/2069334328856891394
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Generacion texto-a-imagen con Krea2 (sitio chino): https://www.RunningHub.cn/post/2071164326781734914
- Krea2 image-to-image con inferencia inversa de prompt: https://www.RunningHub.cn/post/2071358346015371266
- Flujo de edicion de vestuario con krea2: https://www.RunningHub.cn/post/2081382750556348418
- Flujo de edicion de imagen unica con krea2: https://www.RunningHub.cn/post/2081650003457691649
- Flujo de image remixing sin inferencia inversa: https://www.RunningHub.cn/post/2081773404809682946
- Generacion texto-a-imagen con Krea2 (sitio internacional): https://www.RunningHub.ai/zh-cn/post/2070539933625962498
- Inferencia inversa de prompt con imagen cruda (Krea2): https://www.RunningHub.ai/zh-cn/post/2071363127198965761
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Herramientas de etiquetado y entrenamiento citadas (TuTu): zhaotutu.xyz
