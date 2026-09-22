# Renesas/DINOv2-Base-ONNX

## Resumen

DINOv2-Base-ONNX es un artefacto publicado por Renesas que empaqueta el backbone ViT-Base de DINOv2 (facebook/dinov2-base) en formato ONNX FP32 para su ejecución sobre la NPU NPX6-48K integrada en el SoC Renesas R-Car X5H. DINOv2 es un Vision Transformer entrenado de forma auto-supervisada que no clasifica imágenes: su salida es un tensor `last_hidden_state` de embeddings de parches y de token CLS, pensado para alimentar cabezas posteriores, búsqueda por similitud o agrupamiento. Con 86 millones de parámetros, el repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache-2.0.

La relevancia de esta ficha es acotada pero concreta: no se trata de un modelo nuevo ni de un checkpoint reentrenado, sino de una conversión y validación de hardware. Renesas publica latencias medidas en silicio real (HIL) mediante su runtime MWMX: 530,035 ms con 1 core de NPU y 321,912 ms con 12 cores, ambos a 850 MHz y con precisión INT8 auto-convertida por la toolchain a partir del ONNX FP32. Es, por tanto, material de interés para ingeniería embebida y automoción que necesite extracción de características visuales en el borde sin depender de GPUs.

El modelo no soporta generación de texto, tool calling ni razonamiento multi-paso: es exclusivamente un extractor de embeddings visuales. Su utilidad práctica depende de integrarlo como etapa de percepción dentro de una pipeline mayor (recuperación, detección de anomalías, segmentación con cabeza ajustada) y de disponer del hardware Renesas objetivo, ya que la model card no documenta un camino de despliegue alternativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2, Vision Transformer (ViT-Base) auto-supervisado |
| Parametros totales | 86 M |
| Longitud de contexto | No aplica como contexto de lenguaje. Modelo de vision: procesa una imagen y devuelve embeddings de parches y de token CLS. La resolucion de entrada no esta especificada en la informacion disponible (el autor la marca como TBD) |
| Tipos de cuantizacion | FP32 (ONNX publicado); INT8 auto-convertido por la toolchain MWMX en tiempo de compilacion (no se distribuye fichero INT8 separado) |
| Idiomas soportados | No disponible (modelo de vision, sin entrada ni salida textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`fp32/dinov2_base_model_int8_fromHF_fp32.onnx`) |
| Tarea (pipeline) | Image feature extraction |
| Dimension del embedding | No disponible en la informacion proporcionada |
| Modelo base | facebook/dinov2-base (tag `base_model:quantized:facebook/dinov2-base`) |
| Runtime objetivo | Renesas MWMX Runtime sobre NPU NPX6-48K (R-Car X5H) |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 16 de septiembre de 2026 (ultima actualizacion: 21 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo base, el mismo backbone del checkpoint `facebook/dinov2-base`. DINOv2 se entrena de forma auto-supervisada (sin etiquetas) combinando objetivos de destilación auto-supervisada y pérdidas tipo DINO/iBOT, lo que produce representaciones visuales densas que funcionan bien en tareas downstream sin ajuste fino. El autor no documenta en esta ficha ningún reentrenamiento, ajuste adicional ni variación de los pesos originales: la aportación del repositorio es la serialización a ONNX y su validación sobre la NPU NPX6.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de RLHF o DPO (no aplicables a un modelo de visión auto-supervisado). Tampoco se documenta el pipeline de conversión más allá de la cadena FP32 ONNX → compilación MWMX → auto-cast a INT8 → ejecución en NPU → salida `last_hidden_state`. La model card indica explícitamente que el modelo no debe tratarse como un clasificador de ImageNet.

## Capacidades

- Extracción de embeddings de imagen: produce un tensor `last_hidden_state` con las representaciones de los parches y del token CLS, utilizable como descriptor global o como mapa denso de características.
- Recuperación visual (image retrieval): los embeddings permiten búsqueda por similitud coseno en índices vectoriales.
- Agrupamiento no supervisado: sirve para organizar catálogos de imágenes sin etiquetas.
- Clasificación con pocas etiquetas: soporta k-NN sobre los embeddings o el entrenamiento de una cabeza lineal ligera.
- Segmentación semántica densa: al conservar representaciones por parche, puede alimentar cabezas de segmentación ajustadas.
- No es un generador de texto: no tiene capacidades de generación, razonamiento simbólico, matemáticas ni código.
- No soporta tool calling / function calling ni uso como agente.
- No soporta entrada multimodal de texto ni audio.
- Capacidades multilingües: no aplica (no procesa lenguaje).
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Búsqueda visual en catálogos industriales: indexar los embeddings de piezas o componentes y recuperar los más similares a una consulta fotográfica; el modelo es adecuado porque su salida es un descriptor denso y no requiere etiquetas para construirse.
- Control de calidad en línea de producción: comparar el embedding de una pieza recién fabricada con el de una pieza de referencia y detectar desviaciones; encaja en el R-Car X5H porque la inferencia ocurre en el propio SoC, sin enviar imágenes a la nube.
- Deduplicación y curación de datasets visuales: agrupar imágenes casi idénticas por similitud de embeddings para reducir costes de anotación y almacenamiento.
- Percepción auxiliar en sistemas de asistencia a la conducción: usar los embeddings por parche como entrada de cabezas específicas (detección de obstáculos, segmentación de calzada) dentro de un pipeline automotriz ya basado en el SoC Renesas.
- Detección de anomalías en inspección visual: modelar la distribución de embeddings de imágenes conformes y marcar como anomalía las que se alejen del centroide o de la vecindad k-NN.
- Clasificación few-shot en dominios con pocas anotaciones (medicina, agricultura, teledetección): entrenar una regresión logística sobre 768 características es viable con decenas de ejemplos por clase.
- Re-identificación y reconocimiento de lugares: usar el descriptor CLS como huella visual para emparejar ubicaciones u objetos entre capturas distintas.
- Preprocesado para pipelines VLM: extraer embeddings visuales en el borde y enviar solo los tensores (no los píxeles) a un modelo de lenguaje multimodal en servidor, reduciendo ancho de banda.

## Benchmarks y rendimiento

La informacion disponible solo incluye medidas de latencia en hardware, no resultados de exactitud. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni metricas de vision como k-NN de ImageNet, mAP de recuperacion o IoU de segmentacion) en la informacion disponible. El propio autor marca la seccion de accuracy como TBD, indicando que lo apropiado seria evaluar el rendimiento en tareas downstream o la similitud de embeddings respecto a la referencia FP32.

| Parametros | Runtime | Precision | Dispositivo | Latencia (ms) | Tipo |
|---|---|---|---|---|---|
| 86 M | MWMX Runtime | INT8 (auto) | X5H, 1× NPU, 1 core, 850 MHz | 530,03538 | Medida (HIL) |
| 86 M | MWMX Runtime | INT8 (auto) | X5H, 1× NPU, 12 cores, 850 MHz | 321,912461 | Medida (HIL) |

Configuracion del benchmark: batch size 1, una sola NPU; la resolucion de entrada no esta disponible en los datos de origen (TBD). El escalado de 1 a 12 cores mejora la latencia en un factor de aproximadamente 1,65.

## Requisitos de hardware

- VRAM/almacenamiento estimado (calculo a partir de los 86 M de parametros, no publicado por el autor): en FP32, unos 344 MB de pesos; en INT8, unos 86 MB. El repositorio completo ocupa 0,3 GB.
- Hardware objetivo oficial: placa Renesas R-Car X5H con NPU NPX6-48K (NPX6-48K en la descripcion del runtime). Sin esta plataforma, el artefacto publicado no tiene un camino de despliegue documentado.
- Software obligatorio: runtime Renesas MWMX (Middleware MX), que compila el ONNX FP32 y realiza el auto-cast a INT8.
- GPU de consumo: no aplica al flujo oficial. Al ser un ONNX estandar, el fichero FP32 podria en teoria ejecutarse con ONNX Runtime en CPU o GPU, pero el autor no documenta ni valida ese escenario.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama, TGI ni TensorRT; son runtimes de modelos de lenguaje y no aparecen en la model card.
- Latencia medida: 530 ms (1 core, 850 MHz) y 322 ms (12 cores, 850 MHz) por inferencia, con lote de 1.
- Throughput: no disponible; no se publica ninguna cifra de imagenes por segundo ni de utilizacion de NPU.

## Comparativa con modelos similares

Solo se dispone de datos verificables en la informacion proporcionada para el modelo base original; el resto de alternativas de la misma categoria (backbones ViT auto-supervisados) no aparecen en la busqueda web realizada, que devolvio exclusivamente paginas corporativas de Renesas.

| Modelo | Parametros | Formato | Hardware objetivo | Licencia | Latencia publicada |
|---|---|---|---|---|---|
| Renesas/DINOv2-Base-ONNX | 86 M | ONNX FP32 (INT8 en runtime) | R-Car X5H con NPX6-48K | Apache-2.0 | 530 ms / 322 ms (1 / 12 cores) |
| facebook/dinov2-base | 86 M | PyTorch (safetensors) | GPU generica | Apache-2.0 | no disponible |
| Otras alternativas de backbone visual auto-supervisado | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica diferencia funcional demostrada frente al checkpoint original es el empaquetado ONNX y su validacion sobre NPU Renesas; no hay evidencia publicada de que la version INT8 conserve la calidad de embeddings del modelo FP32 original.

## Limitaciones y advertencias

- No es un clasificador: la salida son embeddings, no logits de clase. Usarlo como clasificador de ImageNet es un error de uso explicitamente advertido por el autor.
- No genera texto ni mantiene conversaciones; no es apto para tareas de NLP, agentes ni tool calling.
- Precision INT8 no evaluada: el auto-cast a INT8 lo realiza la toolchain MWMX y no se ha publicado ninguna comparacion de similitud de embeddings ni de rendimiento downstream frente a la referencia FP32. Existe riesgo de degradacion silenciosa.
- Dependencia de hardware propietario: el flujo documentado exige placa R-Car X5H y runtime MWMX, lo que limita la portabilidad y ata el despliegue a un proveedor.
- Resolucion de entrada no especificada (TBD en la model card), lo que impide reproducir el benchmark o planificar el coste de preprocesado.
- Idiomas y sesgos: al no procesar texto, no aplican sesgos linguisticos, pero si los sesgos visuales y de dominio del dataset de entrenamiento original de DINOv2, que no se documenta en este repositorio.
- Riesgo de sobreajuste al dominio del backbone original: los embeddings pueden comportarse peor en imagenes muy distintas de las de entrenamiento (imagenes medicas, satelitales, industriales de bajo contraste).
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero conviene verificar la licencia del checkpoint base `facebook/dinov2-base` y las condiciones del runtime MWMX, que es software propietario de Renesas y no esta cubierto por la licencia del modelo.
- Fechas de publicacion y actualizacion en el futuro respecto a la fecha habitual de consulta (septiembre de 2026), dato a tener en cuenta al citar el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Renesas/DINOv2-Base-ONNX
- Modelo base original: https://huggingface.co/facebook/dinov2-base
- Renesas (sitio corporativo, resultado de busqueda): https://www.renesas.com/
- Renesas, pagina de productos (resultado de busqueda): https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia (resultado de busqueda): https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia en frances (resultado de busqueda): https://fr.wikipedia.org/wiki/Renesas_Electronics
- Renesas Careers (resultado de busqueda, sin relacion tecnica con el modelo): https://jobs.renesas.com/
- Paper de DINOv2 (referencia del modelo base, no encontrado en la busqueda web realizada): https://arxiv.org/abs/2304.07193
- Repositorio de codigo de DINOv2 (referencia del modelo base, no encontrado en la busqueda web realizada): https://github.com/facebookresearch/dinov2
