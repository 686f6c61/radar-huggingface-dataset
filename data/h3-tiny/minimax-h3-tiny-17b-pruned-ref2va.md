# H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA

## Resumen

MiniMax-H3-Tiny-17B-Pruned-Ref2VA es un checkpoint derivado del transformer Ref2VA de MiniMax-H3 (33.120 millones de parametros), obtenido mediante poda estructurada sin reentrenamiento posterior. El proyecto H3-Tiny reduce el modelo original de 33B a 17B (y contempla una etapa posterior de 14B) eliminando 8 de sus 50 bloques transformer y aplicando un rango 8 en las capas AdaLN. El resultado es un modelo de generacion conjunta de video y audio a partir de texto e imagenes de referencia, con 17.067.115.600 parametros en formato diffusers.

El modelo resuelve el problema del coste computacional de la generacion video-audio de alta calidad: al recortar aproximadamente la mitad de los parametros del transformer original mantiene la funcionalidad del flujo Ref2VA (reference-to-video + audio) con un peso de repositorio de 34,2 GB. Esta orientado a desarrolladores que necesitan desplegar generacion multimodal en infraestructura mas modesta que la requerida por el modelo base de 33B.

Es relevante ahora porque demuestra que la poda estructurada agresiva, sin fine-tuning, puede producir checkpoints funcionales de modelos de difusion para video, y porque publica pesos en formato diffusers y ComfyUI, lo que facilita su integracion en pipelines existentes. El repositorio contiene unicamente el transformer; el text encoder, los VAE y los procesadores deben tomarse del checkpoint oficial MiniMax-H3 en formato diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion conjunta de video y audio, derivado por poda de MiniMax-H3 Ref2VA |
| Parametros totales | 17.067.115.600 (transformer) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors (layout diffusers: `config.json` + safetensors fragmentados) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion (DiT) para el flujo Ref2VA de MiniMax-H3, que genera video y audio de forma conjunta condicionado por texto e imagenes de referencia. La version Tiny se obtiene por poda estructurada: se eliminan 8 de los 50 bloques transformer del modelo base de 33,12B y se aplica un rango 8 a las capas AdaLN (adaptive layer norm). Segun la model card, el checkpoint es training-free: funciona directamente tras la poda, sin entrenamiento ni fine-tuning adicional. El muestreo recomendado es de 50 pasos.

El repositorio incluye solo el transformer en layout diffusers. El text encoder, los VAE de video y audio y los procesadores no forman parte de estos pesos y deben cargarse desde el checkpoint oficial MiniMaxAI/MiniMax-H3 en formato diffusers. El pipeline de inferencia se distribuye a traves del paquete `h3tiny` del repositorio GitHub del proyecto.

## Capacidades

- Generacion de video condicionada por texto e imagenes de referencia (flujo Ref2VA).
- Generacion conjunta de audio sincronizado con el video en una sola pasada.
- Aceptacion de multiples imagenes de referencia mediante marcadores en el prompt (por ejemplo, `<Picture 1>`).
- Control del numero de frames generados (el ejemplo de la model card usa 124 frames).
- Integracion con ComfyUI mediante pesos publicados en un repositorio separado.
- Carga como pipeline de diffusers a traves de `h3tiny.pipeline.load_pipeline`.
- Soporte de offloading y de distintos backends de atencion (documentado en el README de GitHub).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento.

## Casos de uso

- Prototipado de generacion video-audio en una sola GPU: al reducir el transformer de 33B a 17B, el modelo permite iterar sobre prompts y referencias en hardware mas asequible que el modelo base, manteniendo el flujo Ref2VA completo.
- Generacion de clips publicitarios con producto de referencia: se aporta una imagen del producto como `<Picture 1>` y un prompt descriptivo para obtener un video con audio sincronizado, util para pruebas de concepto creativas.
- Creacion de contenido para redes sociales: clips cortos con audio integrado generados a partir de una o varias imagenes de referencia, reduciendo el numero de herramientas en el pipeline.
- Previsualizacion de storyboards animados: a partir de ilustraciones de referencia se generan animaticos con sonido para validar secuencias antes de la produccion final.
- Investigacion sobre poda de modelos de difusion: el checkpoint training-free sirve como punto de comparacion frente al modelo base de 33B para medir la degradacion introducida por la eliminacion de bloques y la reduccion de rango en AdaLN.
- Integracion en ComfyUI para flujos de trabajo de artistas tecnicos: los pesos especificos de ComfyUI permiten incorporar el modelo a grafos nodales existentes sin escribir codigo de inferencia.
- Evaluacion de despliegue en produccion: con 17B de parametros y 34,2 GB de repositorio, permite estimar requisitos de VRAM y latencia antes de comprometerse con el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un transformer de 17.067 millones de parametros en bf16/fp16 requiere aproximadamente 34 GB solo para los pesos, a lo que hay que sumar el text encoder, los VAE y las activaciones; el offloading documentado en el repositorio reduce este pico a costa de latencia.
- GPU recomendadas: no especificadas por el autor. Por volumen de pesos, el modelo completo en precision nativa encaja en A100 80 GB o H100 80 GB; en GPUs de 24 GB (RTX 4090) seria necesario offloading o cuantizacion, no documentada en el repositorio.
- Cabe en GPU de consumo: no de forma directa en precision nativa; requiere offloading o cuantizacion externa no incluida en los pesos publicados.
- Opciones de despliegue: paquete `h3tiny` (script `scripts/infer.py` y `load_pipeline`), diffusers, y pesos especificos para ComfyUI (`H3-Tiny/MiniMax-H3-Tiny-ComfyUI`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles. El muestreo recomendado es de 50 pasos.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Flujo | Entrenamiento tras poda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Tiny-17B-Pruned-Ref2VA | 17,07B | Ref2VA (referencia a video + audio) | No (training-free) | MiniMax H3 Community License | Hugging Face, ComfyUI |
| MiniMaxAI/MiniMax-H3 (base) | 33,12B | Ref2VA | Modelo original | MiniMax H3 Community License | Hugging Face |
| H3-Tiny 14B (etapa posterior) | no disponible | Ref2VA | no disponible | no disponible | Mencionado en la model card, sin datos publicados |

No se dispone de informacion sobre otros modelos comparables de generacion conjunta video-audio en la documentacion proporcionada.

## Limitaciones y advertencias

- Al ser un checkpoint podado sin reentrenamiento, es esperable cierta degradacion de calidad frente al modelo base de 33B; el autor no publica metricas de la perdida.
- El repositorio contiene unicamente el transformer: sin el text encoder, los VAE y los procesadores del checkpoint oficial MiniMax-H3 el modelo no es funcional.
- La licencia MiniMax H3 Community License Agreement impone un ambito territorial y una politica de uso aceptable; es obligatorio revisar el archivo LICENSE-MiniMax-H3 y el NOTICE antes de cualquier uso comercial.
- Riesgo de alucinacion visual y de incoherencias temporales inherente a los modelos de difusion para video; no cuantificado en la informacion disponible.
- Idiomas soportados no documentados; el comportamiento multilingue de los prompts depende del text encoder del modelo base.
- Proyecto independiente no afiliado ni respaldado por MiniMax.
- No se documentan sesgos conocidos ni resultados de evaluacion de seguridad.
- El modelo tiene 319 descargas y 4 likes en el momento de la consulta, lo que indica una validacion comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Pagina del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Coleccion H3-Tiny: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Pesos para ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA/blob/main/LICENSE-MiniMax-H3
