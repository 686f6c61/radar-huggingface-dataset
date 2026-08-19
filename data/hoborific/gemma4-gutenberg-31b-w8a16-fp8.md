# hoborific/Gemma4-Gutenberg-31B-W8A16-FP8

## Resumen

El modelo **Gemma4-Gutenberg-31B-W8A16-FP8** es una versión cuantizada del checkpoint `nbeerbower/Gemma4-Gutenberg-31B`, publicada por el usuario `hoborific` en HuggingFace. Su propósito es reducir el consumo de memoria y acelerar la inferencia de un modelo multimodal de aproximadamente 31 000 millones de parámetros, manteniendo una calidad de salida cercana a la versión original mediante una cuantización por canal con ajuste fino del rango de clip. Está diseñado específicamente para entornos de producción con vLLM, con soporte para aceleradores Intel XPU y NVIDIA CUDA (Turing o posterior).

La cuantización emplea el formato **W8A16 FP8** (pesos en `float8_e4m3fn`, activaciones en bf16/fp16) implementado con la librería `compressed-tensors`. Solo se cuantizan las proyecciones lineales 2D (atención y MLP), mientras que embeddings, normas, la cabeza de salida, los routers/expertos y la torre de visión permanecen en bf16. Esta estrategia permite un ahorro de memoria de aproximadamente el 50 % en los pesos lineales, a la vez que mantiene la precisión en las partes críticas del modelo. El modelo base, por su parte, es un modelo *image-text-to-text* (procesa imágenes y texto) y probablemente utiliza una arquitectura de mezcla de expertos (MoE), dado que la model card menciona explícitamente routers y expertos en la lista de capas no cuantizadas.

La relevancia de esta ficha radica en que ofrece una opción práctica para desplegar un modelo de 31B en hardware con VRAM limitada, siempre que se disponga de los kernels adecuados. No obstante, hay que tener en cuenta que el soporte de backends es restringido y que no se han publicado resultados de benchmarks ni detalles sobre la licencia, lo que limita su adopción inmediata en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal *image-text-to-text* basado en Gemma4 (probablemente MoE, según la model card) |
| Parametros totales | 31 273 088 876 (~31,27B) |
| Parametros activos | no disponible (la model card menciona routers/expertos, lo que sugiere arquitectura MoE, pero no se indica el numero de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos en `float8_e4m3fn`, activaciones en bf16/fp16) mediante `compressed-tensors` en formato `float-quantized` |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint cuantizado con `compressed-tensors`) |

## Arquitectura y entrenamiento

La informacion disponible se limita al proceso de cuantizacion, no al entrenamiento del modelo base. El checkpoint original `nbeerbower/Gemma4-Gutenberg-31B` es un modelo multimodal (imagen y texto) de aproximadamente 31B de parametros, cuyo nombre sugiere un entrenamiento sobre textos del Proyecto Gutenberg, aunque no se han publicado detalles sobre la composicion del dataset, el numero de tokens ni las tecnicas de alineacion (RLHF, DPO, etc.).

La cuantizacion W8A16 FP8 se realiza offline. Para cada capa lineal, cada fila de salida recibe una escala propia, inicializada como `amax / 448` y refinada mediante una busqueda de clip por error cuadratico medio (MSE) sobre aproximadamente nueve fracciones de clip (entre 0,8 y 1,0 veces `amax`), seleccionando la escala que minimiza el error por fila. Los pesos se cuantizan como `q = e4m3(w / scale)` con redondeo al mas cercano y saturacion. Este esquema por canal con clipping ofrece una mejor relacion señal-ruido que la cuantizacion online por tensor de vLLM (`--quantization fp8`).

Las capas que no se cuantizan (embeddings, normas, `lm_head`, routers/expertos y la torre de vision) se mantienen en bf16 y se incluyen en la lista `ignore` del checkpoint, de modo que vLLM las deja intactas durante la carga.

## Capacidades

- Procesamiento multimodal: al ser un modelo *image-text-to-text*, puede recibir imagenes y texto como entrada y generar texto (descripciones, respuestas a preguntas visuales, etc.).
- Conversacion: el tag `conversational` indica que esta optimizado para dialogos multi-turno.
- Cuantizacion W8A16 FP8: reduce el uso de memoria y acelera la inferencia en hardware compatible, manteniendo la precision en las capas criticas.
- Compatibilidad con vLLM en plataformas especificas: Intel XPU (kernel `XPUW8A16FP8LinearKernel`) y NVIDIA CUDA SM75+ (kernels `HummingFP8ScaledMMLinearKernel` o `MarlinFP8ScaledMMLinearKernel`).
- No se dispone de informacion sobre soporte de *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingues especificas.

## Casos de uso

- Descripcion automatica de imagenes en entornos con VRAM limitada: gracias a la cuantizacion FP8, el modelo puede ejecutarse en GPUs con 40-48 GB de VRAM, permitiendo generar descripciones detalladas de fotografias o ilustraciones en aplicaciones de archivo o catalogacion.
- Asistentes conversacionales multimodales: al ser conversacional y aceptar entradas de imagen, puede integrarse en chatbots que necesiten comprender capturas de pantalla, diagramas o fotos enviadas por el usuario, por ejemplo en soporte tecnico remoto.
- Procesamiento de documentos escaneados: combinando OCR con la comprension visual del modelo, se pueden extraer y resumir informacion de facturas, contratos o formularios, reduciendo la carga de trabajo manual.
- Accesibilidad: generar descripciones de imagenes en tiempo real para personas con discapacidad visual, mediante una aplicacion que capture la camara y devuelva una narracion del entorno.
- Moderacion de contenido visual: clasificar o describir imagenes para detectar contenido inapropiado en redes sociales o plataformas de contenido generado por usuarios, aprovechando la capacidad de razonamiento visual.
- Generacion de contenido educativo: crear explicaciones o preguntas a partir de diagramas, graficos o ilustraciones cientificas, util en plataformas de e-learning que requieran materiales adaptativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 31 273 millones de parametros en FP8 (1 byte por parametro), los pesos ocupan aproximadamente 31 GB. Añadiendo activaciones, cache de atencion y overhead del runtime, se recomienda un minimo de 40-48 GB de VRAM para inferencia con contexto moderado. Esta es una estimacion basada en el tamaño del checkpoint (33,3 GB en disco), no un dato oficial.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 6000 Ada (48 GB), o cualquier GPU con soporte CUDA SM75+ (Turing o posterior). Tambien es compatible con aceleradores Intel XPU.
- No cabe en GPUs de consumo de 24 GB (como RTX 4090) si se necesita el modelo completo en memoria; podria intentarse con offloading de CPU, pero degradaria el rendimiento.
- Opciones de despliegue: vLLM (con los kernels mencionados) y transformers (la libreria principal del checkpoint). No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (multimodales de ~31B cuantizados). No se conocen modelos directamente comparables con los mismos requisitos de hardware y formato de cuantizacion.

## Limitaciones y advertencias

- Soporte de backends restringido: vLLM no dispone de kernels W8A16-FP8 para ROCm, CPU o TPU; en estas plataformas la carga fallara con un error de kernel no encontrado.
- Licencia no disponible: no se puede confirmar si el modelo puede usarse comercialmente o si tiene restricciones de atribucion. Esto supone un riesgo legal en entornos empresariales.
- Sin datos de rendimiento: al no publicarse benchmarks, no es posible evaluar la degradacion de calidad respecto al modelo original ni comparar con alternativas.
- Idiomas no especificados: se desconoce que lenguas domina el modelo, lo que limita su uso en aplicaciones multilingues.
- Sesgos y alucinaciones: al ser un modelo derivado de Gemma4 (probablemente entrenado con textos de Gutenberg), puede presentar sesgos historicos o culturales presentes en esos corpus, asi como alucinaciones tipicas de modelos generativos.
- Longitud de contexto desconocida: no se ha indicado el tamaño de la ventana de contexto, por lo que no se puede planificar el uso en tareas que requieran documentos largos.
- Version futura: la fecha de creacion del repositorio (agosto de 2026) sugiere que es un modelo reciente y posiblemente experimental; no hay garantias de mantenimiento o soporte.

## Enlaces

- Repositorio HuggingFace: [hoborific/Gemma4-Gutenberg-31B-W8A16-FP8](https://huggingface.co/hoborific/Gemma4-Gutenberg-31B-W8A16-FP8)
- Modelo base: [nbeerbower/Gemma4-Gutenberg-31B](https://huggingface.co/nbeerbower/Gemma4-Gutenberg-31B)
- Libreria de cuantizacion: [compressed-tensors](https://github.com/neuralmagic/compressed-tensors)
