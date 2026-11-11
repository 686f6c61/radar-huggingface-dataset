# AIOTVR/zils-mini-dao1

## Resumen

zils-mini-dao1 es un modelo multimodal de tipo image-text-to-text publicado por el usuario AIOTVR en Hugging Face. Segun la model card, se trata de un *full fine-tune* del modelo padre Qwen (etiquetado internamente como `qwen3_5` en los tags) en el que se ha fusionado (LoRA-merged) la torre de lenguaje mientras que la torre de vision permanece sin modificar. El modelo se distribuye bajo licencia Apache 2.0 y con pesos en formato safetensors, compatible con la libreria transformers.

El modelo cuenta con 4.539.265.536 parametros totales (aproximadamente 4,54 mil millones) y un tamano de repositorio de 9,1 GB, lo que es coherente con un checkpoint multimodal en precision de 16 bits que incluye tanto la torre de lenguaje como la de vision. Los tags indican contexto de un pipeline interno (`soup-body`, `sn127`, `zils`) que sugiere un proceso de mezcla o *model soup* dentro de una familia de variantes del mismo autor.

La relevancia de este modelo es limitada por el momento: no tiene descargas ni likes, la model card es extremadamente escueta y no se publican datos de entrenamiento, benchmarks ni idiomas soportados. Se trata, por tanto, de un checkpoint de investigacion o de un artefacto interno de un pipeline de experimentacion, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje Qwen3.5 con torre de vision; detalles no disponibles) |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como un *full fine-tune* del "Qwen parent" fijado, con la torre de lenguaje sometida a un proceso de LoRA fusionada (*LoRA-merged*) y la torre de vision intacta. Esto implica una arquitectura multimodal compuesta por al menos dos torres: una de lenguaje, derivada de la familia Qwen3.5, y una de vision heredada del modelo padre sin reentrenamiento. El tag `qwen3_5` en Hugging Face confirma la base arquitectonica.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El tag `soup-body` y la referencia a un "pool d3-mini body" sugieren que el checkpoint forma parte de un proceso de mezcla de pesos (*model soup*) dentro de una familia de variantes, pero no se detalla la receta. Tampoco se especifica la longitud de contexto nativa ni la configuracion de atencion.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el tag `conversational`.
- Procesamiento de imagenes y texto de forma conjunta (pipeline `image-text-to-text`), lo que habilita tareas de descripcion de imagenes, VQA y razonamiento sobre contenido visual.
- La torre de lenguaje ha sido ajustada mediante fine-tune completo con LoRA fusionada, lo que en principio preserva las capacidades del modelo padre Qwen3.5.
- No se documenta soporte explicito de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues concretas.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Prototipado de asistentes multimodales: el modelo puede recibir una imagen y una pregunta en texto y generar una respuesta descriptiva, util para validar pipelines de image-text-to-text antes de pasar a modelos mas grandes.
- Descripcion automatica de imagenes en entornos controlados: al heredar la torre de vision del modelo padre, puede emplearse para generar alt-text o resumenes de imagenes en herramientas internas.
- Experimentacion academica con fine-tunes multimodales: su licencia Apache 2.0 y su formato safetensors facilitan su uso como punto de partida en investigacion sobre mezcla de pesos y ajuste de torres de lenguaje.
- Evaluacion comparativa de variantes de una familia: el tag `soup-body` lo situa como un checkpoint dentro de un pool, por lo que es util para comparar el efecto de distintas recetas de fine-tune sobre la misma base Qwen.
- Base para tareas de VQA en dominios acotados: con un ajuste adicional sobre un dataset especifico (por ejemplo, documentacion tecnica con capturas), puede adaptarse a preguntas y respuestas sobre imagenes.
- Integracion en demos con transformers: al declarar `library_name: transformers` y pesos safetensors, puede cargarse directamente con `AutoModelForVision2Seq` o la clase equivalente de la familia Qwen para demos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9-10 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16 GB de VRAM para secuencias moderadas.
- En cuantizacion de 8 bits: en torno a 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB.
- En cuantizacion de 4 bits: alrededor de 3 GB de pesos, aunque no se distribuyen pesos GGUF oficiales y habria que generarlos con herramientas externas.
- GPUs recomendadas: A100 40/80 GB, H100 o L40S para despliegue en produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia comoda en fp16.
- Cabe en GPUs consumer de gama alta (RTX 4090, 3090) en fp16 y en gamas medias (RTX 4060 Ti 16 GB, RTX 4070) con cuantizacion.
- Opciones de despliegue: transformers nativo; vLLM y TGI si la arquitectura Qwen3.5 multimodal esta soportada por esas herramientas (no confirmado); llama.cpp/Ollama requeriria conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-dao1 | 4,54 B | no disponible | image-text-to-text | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-VL-3B | 3 B aprox. | 32k (ampliable) | image-text-to-text | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen2.5-VL-7B | 7 B aprox. | 32k (ampliable) | image-text-to-text | Apache 2.0 | Hugging Face, ampliamente adoptado |
| InternVL2.5-4B | 4 B aprox. | 32k aprox. | image-text-to-text | MIT / Apache 2.0 segun variante | Hugging Face |

La comparacion es aproximada: no se dispone de datos de contexto, benchmarks ni idiomas de zils-mini-dao1, por lo que la equiparacion se basa unicamente en el rango de parametros y la modalidad. Los modelos Qwen2.5-VL e InternVL2.5 cuentan con documentacion publica extensa y comunidades activas, mientras que zils-mini-dao1 carece de ambos.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, idiomas, contexto ni evaluaciones, lo que impide validar su calidad.
- Sin descargas ni likes: no hay evidencia de uso real ni de validacion por parte de la comunidad.
- Riesgo elevado de alucinacion y de comportamiento impredecible al desconocerse la receta exacta de fine-tune y mezcla de pesos.
- La torre de vision no ha sido reentrenada, por lo que sus capacidades visuales dependen completamente del modelo padre y pueden no estar alineadas con el ajuste de la torre de lenguaje.
- No se especifican sesgos conocidos; al derivar de Qwen, es probable que herede los sesgos del corpus original, pero no hay confirmacion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion hace arriesgado desplegarlo en produccion sin una evaluacion propia.
- No se distribuyen cuantizaciones GGUF ni versiones optimizadas, lo que limita el despliegue en entornos de bajos recursos.
- El nombre y los tags (`zils`, `sn127`, `soup-body`) apuntan a un artefacto interno de un pipeline experimental, no a un modelo mantenido publicamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIOTVR/zils-mini-dao1
- Repositorio del modelo padre Qwen (referencia): https://huggingface.co/Qwen
- Documentacion de transformers: https://huggingface.co/docs/transformers
