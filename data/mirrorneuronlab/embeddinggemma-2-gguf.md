# MirrorNeuronLab/embeddinggemma-2-GGUF

## Resumen

EmbeddingGemma 2 GGUF es una conversión y cuantización del modelo de embeddings multimodal EmbeddingGemma 2 desarrollado originalmente por Google DeepMind. Esta release, publicada por MirrorNeuronLab, empaqueta el backbone de texto en cuantización Q4_K_M y un complemento multimodal Q8_0 que contiene los codificadores de visión y audio, permitiendo generar embeddings de texto, imagen y audio en un espacio vectorial compartido de 768 dimensiones.

El modelo base cuenta con 271.002.648 parámetros y sigue una arquitectura no causal con pooling por media y una proyección de embeddings de 512 a 768 dimensiones, según la auditoría GGUF incluida en la model card. No genera respuestas conversacionales ni transcripciones: su función es exclusivamente producir vectores para búsqueda y similitud semántica.

La relevancia de esta release radica en que permite ejecutar un modelo de embeddings multimodal en llama.cpp y Docker Model Runner sin necesidad de infraestructura de GPU dedicada, con un peso total de repositorio de 0,7 GB. Está publicada bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no causal con pooling por media y proyeccion 512 a 768 |
| Parametros totales | 271.002.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (configuracion recomendada en Docker Model Runner) |
| Tipos de cuantizacion | Q4_K_M (backbone de texto), Q8_0 (complemento vision/audio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer no causal orientado a la extraccion de features, con pooling por media sobre las representaciones de tokens y una proyeccion final de 512 a 768 dimensiones para producir el embedding. La auditoria GGUF del repositorio confirma la preservacion de la metadata del tokenizer, la arquitectura no causal, el pooling por media y la coincidencia de formas de tensor entre el BF16 intermedio y la cuantizacion Q4_K_M.

La conversion se realizo con llama.cpp (build b12032, commit dde879bc) a partir del checkpoint original de Google, sin entrenamiento adicional. El backbone de texto se cuantizo directamente desde un BF16 intermedio sin importance matrix, usando el preset estandar Q4_K_M que mezcla tipos de tensor segun la definicion de llama.cpp, reteniendo tensores pequenos y la proyeccion de embeddings en mayor precision. El complemento multimodal Q8_0 contiene ambos codificadores, vision y audio, con sus proyecciones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de embeddings de texto en un espacio vectorial de 768 dimensiones.
- Generacion de embeddings de imagen mediante el codificador de vision del complemento Q8_0.
- Generacion de embeddings de audio mediante el codificador de audio del mismo complemento.
- Espacio vectorial compartido entre las tres modalidades, lo que permite busqueda y similitud cruzada entre texto, imagen y audio.
- Soporte de plantillas de tarea para consultas, por ejemplo `task: search result | query: ...` y `title: none | text: ...`.
- Compatibilidad con la API de embeddings de Docker Model Runner y con llama.cpp.
- No soporta generacion de texto, respuestas conversacionales, transcripciones ni tool calling.

## Casos de uso

- Busqueda semantica multimodal: indexar un corpus de documentos de texto y recuperar fragmentos relevantes mediante similitud de coseno sobre los embeddings de 768 dimensiones, con la ventaja de poder combinar consultas textuales con resultados de imagen o audio en el mismo indice.
- Busqueda de imagenes por descripcion textual: generar embeddings de un catalogo de imagenes con el codificador de vision y de las consultas de los usuarios con el backbone de texto, aprovechando el espacio vectorial compartido para recuperar imagenes relevantes sin metadatos manuales.
- Clasificacion y deduplicacion de audio: extraer embeddings de fragmentos de audio y agruparlos por similitud para detectar duplicados, segmentar contenido o etiquetar clips en pipelines de procesamiento por lotes.
- Sistemas de recomendacion basados en contenido: representar items de distinta naturaleza (texto descriptivo, imagen de producto, muestra de audio) en un unico espacio vectorial y calcular recomendaciones por vecindad sin entrenar un modelo especifico por modalidad.
- Moderacion y filtrado de contenido: comparar embeddings de contenido entrante contra un conjunto de referencia de casos etiquetados para detectar similitud con material problematico, con un coste de inferencia bajo gracias a la cuantizacion Q4_K_M del backbone de texto.
- RAG ligero en entornos con recursos limitados: desplegar el modelo en llama.cpp o Docker Model Runner en equipos sin GPU dedicada, usando el backbone de texto de 173 MiB para indexar y consultar documentacion interna con latencia reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta release no incluye resultados de benchmarks y que no se empleo la variante AD-Q4_K_M de AtomicChat ni su importance matrix.

## Requisitos de hardware

- VRAM estimada para inferencia de solo texto: aproximadamente 0,2 GB para el backbone Q4_K_M (173,278 MiB de archivo), con overhead adicional del runtime.
- VRAM estimada para inferencia multimodal: aproximadamente 0,7 GB sumando el backbone Q4_K_M (173,278 MiB) y el complemento vision/audio Q8_0 (529,119 MiB).
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; la validacion de embeddings de imagen y audio se realizo en una NVIDIA DGX Spark.
- Cabe en GPU de consumo: si, por el reducido tamano de los pesos, aunque no se detallan modelos concretos probados.
- Opciones de despliegue: llama.cpp (build b12032 o posterior con soporte de `gemma-embedding2` y vision/audio de Gemma4), Docker Model Runner con `--mode embedding`, `--context-size 2048`, `--batch-size 2048`, `--ubatch-size 2048` y `--pooling mean`.
- Compatibilidad declarada con Apple Silicon y Ubuntu/NVIDIA, aunque la model card indica que esas plataformas no se probaron fisicamente en esta ejecucion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| MirrorNeuronLab/embeddinggemma-2-GGUF | 271.002.648 | 2048 (recomendado) | Texto, imagen, audio | Apache 2.0 | GGUF |
| google/embeddinggemma-2 | 271.002.648 | no disponible | Texto, imagen, audio | Apache 2.0 | safetensors |
| AtomicChat/embeddinggemma-2-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF |

La comparativa se limita al modelo original de Google y a la conversion de AtomicChat citada en la model card. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El modelo no genera texto ni respuestas conversacionales; solo produce embeddings. Usarlo como modelo generativo daria resultados incorrectos.
- No realiza transcripciones de audio ni descripciones de imagenes.
- La longitud de contexto recomendada es de 2048 tokens; entradas mas largas pueden requerir configuracion adicional o truncarse.
- Los idiomas soportados no estan documentados en la informacion disponible.
- El backbone de texto se cuantizo sin importance matrix, por lo que puede haber una perdida de calidad respecto al BF16 original no cuantificada en la model card.
- El complemento Q8_0 es obligatorio para entradas de imagen o audio; sin el, solo funciona el modo texto.
- Se requiere una version de llama.cpp con soporte de `gemma-embedding2` y vision/audio de Gemma4; versiones antiguas del motor de Docker Model Runner reportan arquitectura desconocida.
- No se han publicado evaluaciones de sesgo, alucinacion o robustez para esta conversion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original de Google.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MirrorNeuronLab/embeddinggemma-2-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Checkpoint original (commit f9972ac): https://huggingface.co/google/embeddinggemma-2/tree/f9972ac22e696a105c482202646979e33e4b5a1e
- llama.cpp (commit dde879bc): https://github.com/ggml-org/llama.cpp/tree/dde879bc4f954b809892fd0d660515f42536394a
- Conversion de referencia AtomicChat: https://huggingface.co/AtomicChat/embeddinggemma-2-GGUF
