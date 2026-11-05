# RunningHubAI/rh-mayabl-lora

## Resumen

rh-mayabl-lora es un adaptador LoRA de edición de imágenes publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un peso auxiliar (218 MiB en formato safetensors) que se aplica sobre un modelo base de difusión identificado en la model card como "krea2". Su función es incorporar un concepto visual concreto, activado mediante la palabra disparadora `mayabl`, dentro de un pipeline de generación o edición de imagen.

El adaptador está pensado para ejecutarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face, y su pipeline declarado es `image-text-to-image`, es decir, edición de imagen guiada por texto. El repositorio tiene un tamaño de 0,2 GB y contiene un único archivo de pesos (`mayabl-krea-2-base-epoch-05.safetensors`), lo que confirma que es un LoRA de un solo checkpoint (epoch 5) y no un modelo completo.

La relevancia de esta ficha es limitada en el ámbito de los modelos de lenguaje: se trata de un artefacto de personalización visual de nicho, sin métricas de rendimiento publicadas, sin licencia explícita y sin información sobre el dataset de entrenamiento. Su interés práctico se reduce a quienes quieran reproducir el estilo o concepto "mayabl" sobre el modelo base krea2 dentro de un flujo ComfyUI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusión "krea2" |
| Parámetros totales | no disponible (peso de 218 MiB en safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo distribuye safetensors) |
| Idiomas soportados | no disponible (la activación es por palabra disparadora, no por idioma) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`mayabl-krea-2-base-epoch-05.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para adaptarlo a un concepto o estilo concreto sin reentrenar todos los pesos. La model card indica que está afinado a partir de "krea2" y que el checkpoint distribuido corresponde a la epoch 05, lo que sugiere un entrenamiento corto y un único punto de guardado final.

No se especifica la arquitectura interna del modelo base (tipo de difusión, número de parámetros, resolución nativa), ni el volumen de datos de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de regularización, captions automáticos o aumento de datos. Tampoco se documenta el rango del LoRA, el learning rate ni el número de pasos. Toda esta información se considera no disponible.

## Capacidades

- Edición de imagen guiada por texto dentro de un pipeline `image-text-to-image`.
- Inyección de un concepto o estilo visual concreto, activado mediante la palabra disparadora `mayabl`.
- Integración con ComfyUI como nodo de LoRA sobre el modelo base krea2.
- Ejecución en la plataforma RunningHub y carga directa desde Hugging Face.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es un adaptador puramente visual.
- No se documentan capacidades de vision-language, audio ni modo de razonamiento.

## Casos de uso

- Personalización de un flujo ComfyUI con un estilo visual concreto: cargar `mayabl-krea-2-base-epoch-05.safetensors` como nodo LoRA sobre krea2 y usar la palabra `mayabl` en el prompt para reproducir el concepto entrenado.
- Edición iterativa de imágenes en estudio: aplicar el LoRA sobre una imagen de entrada y un prompt descriptivo para mantener coherencia de estilo entre variaciones.
- Prototipado rápido de conceptos visuales: al ser un peso de 218 MiB, se puede probar en una sesión local de ComfyUI sin necesidad de descargar un modelo completo adicional.
- Integración vía API de RunningHub: invocar el modelo público `2113788583832588289` desde la API para incorporar el estilo en un servicio de generación de imágenes bajo demanda.
- Reproducción de resultados de la comunidad: al estar publicado en Hugging Face con un único checkpoint, permite replicar exactamente las imágenes generadas por el autor en la plataforma.
- Base para fine-tuning posterior: usar este LoRA como punto de partida para entrenar variantes del concepto con más epochs o datasets propios mediante la herramienta de entrenamiento de RunningHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; el LoRA en sí ocupa 218 MiB, pero requiere cargar el modelo base krea2, cuyo tamaño no se documenta.
- GPU recomendadas: no disponible; depende enteramente de los requisitos del modelo base krea2.
- ¿Cabe en GPU de consumo? No se puede determinar sin conocer el modelo base; el adaptador por sí solo es ligero (218 MiB).
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub (online y API), carga desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un LoRA de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial no está garantizado y requiere verificar los términos de krea2 y de RunningHub.
- Sin información sobre el dataset de entrenamiento: no se puede evaluar el riesgo de sesgos visuales, sobreajuste al concepto ni calidad de generalización.
- Dependencia total del modelo base krea2: sin él, el LoRA es inutilizable; cualquier cambio o retirada del modelo base rompe la reproducibilidad.
- Un solo checkpoint (epoch 05): no hay alternativas de epoch para ajustar el equilibrio entre fidelidad al concepto y flexibilidad.
- Riesgo de sobreajuste y artefactos: al ser un LoRA de concepto con pocos datos documentados, puede producir resultados degenerados fuera del dominio entrenado.
- Sin métricas objetivas: no hay FID, CLIP score ni evaluaciones humanas publicadas.
- Idiomas y prompts: no se documenta qué idiomas funcionan mejor; la activación depende de la palabra `mayabl`, no de un soporte multilingüe declarado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-mayabl-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2113788583832588289
- Página del autor: https://www.runninghub.ai/user-center/1982007391661203458
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-mayabl-lora/blob/main/README_cn.md
