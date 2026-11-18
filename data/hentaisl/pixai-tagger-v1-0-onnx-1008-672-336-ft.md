# HentaiSL/pixai-tagger-v1.0-onnx-1008-672-336-ft

## Resumen

PixAI Tagger v1.0 ONNX es una conversión comunitaria del modelo `pixai-labs/pixai-tagger-v1.0` a formato ONNX en FP16 y FP32, acompañada de scripts para construir motores TensorRT y de checkpoints fine-tuned a resoluciones reducidas (336, 448 y 672 píxeles). El modelo original es un clasificador de imágenes multi-etiqueta especializado en contenido anime, entrenado sobre el vocabulario de etiquetas de Danbooru (30.877 etiquetas de salida), e incluye reconocimiento de personajes (8.308 etiquetas) y de franquicias/copyright (2.460 etiquetas). La arquitectura es un transformer de visión con backbone ViTDet (`cls_vitdet`), según los tags del repositorio.

La relevancia de esta conversión es práctica: reduce la latencia de inferencia de forma drástica frente al checkpoint PyTorch original (de 398 ms a 61 ms por imagen a 1008 px con motor TensorRT FP16 en una RTX 5070) y permite desplegar el tagger en GPUs de consumo con 6 GB de VRAM gracias a la atención global troceada por consultas en los grafos FP32. Además, los checkpoints fine-tuned a 336 y 672 píxeles permiten procesar imágenes a menor resolución con mayor velocidad y menor coste de memoria, a cambio de una precisión inferior a la del modelo a 1008 px.

El repositorio está pensado principalmente para Hammy, una herramienta de organización y archivado de vídeo en chino, y el modelo fine-tuned a 448 px está calibrado exclusivamente para etiquetado de personajes/IP dentro de esa herramienta. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión, backbone ViTDet (`cls_vitdet`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen); resolución de entrada 336, 448, 672 o 1008 px |
| Tipos de cuantizacion | FP32, FP16, INT8 dinámica (solo variante 336-ft, solo CPU) |
| Idiomas soportados | no disponible (etiquetas en inglés de Danbooru; nombres de personajes y copyright también en chino vía `tag_zh.json`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP16 y FP32, con sidecar `.onnx.data` en FP32), safetensors (checkpoints fine-tuned), motores TensorRT generados por script |
| Etiquetas de salida | 30.877 (general, character, copyright, style, meta, rating) |
| Tamaño del repositorio | 31,2 GB |
| Pipeline | image-classification |

## Arquitectura y entrenamiento

El modelo base es un clasificador multi-etiqueta basado en un transformer de visión con backbone ViTDet, según los tags del repositorio (`cls_vitdet`). La salida es un vector de 30.877 logits, uno por etiqueta del vocabulario de Danbooru, agrupados en categorías: general (más de 15.000 etiquetas), character (8.308), copyright (2.460), style, meta y rating. El modelo original se distribuye con una lista de umbrales recomendados por categoría que deben aplicarse sobre los logits para decidir qué etiquetas se activan.

La conversión a ONNX incluye dos variantes de los grafos zero-shot (1008 y 672 px) y tres variantes fine-tuned (336, 448 y 672 px). Los checkpoints fine-tuned se obtuvieron por destilación desde el checkpoint original en FP32 ejecutado a 1008 px (el "oráculo"), sobre 103.821 imágenes durante 2 épocas. Los umbrales de las variantes fine-tuned se reajustaron sobre 3.000 imágenes reservadas y son más estrictos que los del modelo original; deben usarse obligatoriamente con los grafos fine-tuned correspondientes, ya que los runners los leen del `config.json` situado junto al grafo. Los grafos FP32 incorporan atención global troceada por consultas (query-chunked global attention), una modificación que reduce el pico de memoria para que quepan en GPUs de 6 GB. Los grafos FP16 tienen pesos inline (~950 MB cada uno) y los FP32 usan sidecar `.onnx.data` (~1,9 GB cada uno).

## Capacidades

- Clasificación multi-etiqueta de imágenes de contenido anime con 30.877 etiquetas posibles.
- Reconocimiento de personajes (8.308 etiquetas) y de franquicias/copyright (2.460 etiquetas), la categoría crítica para identidad.
- Etiquetado de atributos generales (apariencia, ropa, pose, composición), estilo, metadatos y rating.
- Nombres de personajes y copyright también disponibles en chino mediante `tag_zh.json` (activado con `Tagger(zh=True)`).
- Inferencia en CPU mediante ONNX Runtime, incluida una variante INT8 dinámica del modelo 336-ft.
- Aceleración en GPU mediante ONNX Runtime (FP16/FP32) y TensorRT (motores construidos por script).
- Procesamiento por lotes en la variante 336-ft (entrada estática `(2,3,336,336)`).
- No soporta tool calling, agentes, generación de texto ni modalidades distintas de imagen.

## Casos de uso

- Etiquetado automático de bibliotecas de imágenes anime: el modelo clasifica cada imagen contra 30.877 etiquetas y permite indexar y buscar por personaje, franquicia o atributos sin intervención manual; a 672 px con TensorRT FP16 procesa una imagen en 25-26 ms.
- Organización y archivado de vídeo en Hammy: el repositorio está ensamblado específicamente para esta herramienta en chino, y el modelo 448-ft está calibrado para etiquetado de personajes/IP en ese flujo.
- Construcción de datasets para entrenamiento de modelos generativos: el etiquetado de Danbooru alimenta directamente pipelines de captioning para fine-tuning de modelos de difusión de anime.
- Filtrado y moderación de contenido: la categoría `rating` permite clasificar imágenes por nivel de contenido; conviene validar los umbrales en el dominio propio antes de usarlo en producción.
- Búsqueda y recomendación por personaje o franquicia: las categorías character y copyright, con ~1.700 etiquetas activas por encima de umbral a 1008 px, son la parte de mayor valor para identidad y la que mejor conserva la conversión FP32 (0 flips frente al oráculo).
- Despliegue en hardware modesto: los grafos FP32 con atención troceada caben en GPUs de 6 GB, y la variante INT8 dinámica del 336-ft corre en CPU a ~1,6× la velocidad del FP32 con un cuarto del tamaño.
- Procesamiento por lotes en servidores con GPU: los motores TensorRT FP16 ofrecen la menor latencia (7,0 ms por imagen a 336 px en lote de 2 en una RTX 5070).

## Benchmarks y rendimiento

Tiempos de inferencia (mediana por imagen, lote 1 salvo indicación) en RTX 5070 (12 GB), Windows, TensorRT 11.3 / onnxruntime-gpu 1.30:

| Runtime | @1008 zs | @672 zs | @672-ft | @336-ft (lote 2) |
|---|---|---|---|---|
| PyTorch FP32 (checkpoint original) | 398 ms | 168 ms | — | — |
| onnxruntime FP16 | 161 ms | 65 ms | 63 ms | 16,1 ms |
| onnxruntime FP32 | — | — | 109 ms | 25,5 ms |
| TensorRT FP16 | 61 ms | 26 ms | 25 ms | 7,0 ms |
| TensorRT FP32 (query-chunked) | 257 ms | 99 ms | 99 ms | 22,1 ms |

En GTX 16xx (sm_75 sin Tensor Cores) el ranking se invierte: FP16 cae a rutas SIMT lentas (4.698 ms @1008 frente a 1.448 ms del motor FP32 y 1.789 ms del checkpoint PyTorch); en esas tarjetas hay que construir con `--fp32`.

Precisión frente al oráculo (checkpoint FP32 original a 1008 px, 1.000 imágenes reales, comparación por etiqueta sobre los umbrales recomendados de cada modelo; "focus" = character + copyright):

| Modelo | general | character | copyright | style | meta | rating |
|---|---|---|---|---|---|---|
| root (zs) | 0,17 | 0,27 | 0,24 | 0,15 | 0,17 | 0,41 |
| 336-ft | 0,32 | 0,54 | 0,60 | 0,37 | 0,22 | 0,05 |
| 672-ft | 0,32 | 0,60 | 0,59 | 0,44 | 0,18 | 0,06 |

Flips de etiquetas focus a 1008 px frente al oráculo, por runtime:

| Runtime | focus perdidas/ganadas | character | copyright | flips general |
|---|---|---|---|---|
| TRT FP16 | 1 / 1 | 0 / 1 | 1 / 0 | 50 / 54 |
| TRT FP32 (query-chunked) | 0 / 0 | 0 / 0 | 0 / 0 | 8 / 12 |
| ORT FP16 | 1 / 1 | 1 / 1 | 0 / 0 | 29 / 20 |
| ORT FP32 | 1 / 0 | 1 / 0 | 0 / 0 | 11 / 9 |

Diferencia máxima de probabilidad frente al checkpoint: 7,1e-3 (FP32) y 1,1e-2 (FP16); media ~1e-6 en ambos. Todas las etiquetas que cambian de lado quedan justo en su umbral (baseline mediana 0,170 frente al umbral general de 0,17; movimiento mediano 0,002, máximo ≤0,01).

## Requisitos de hardware

- VRAM: los grafos FP32 con atención troceada caben en 6 GB; los FP16 tienen pesos inline de ~950 MB y los FP32 usan sidecar de ~1,9 GB.
- GPU recomendadas: RTX 5070 (12 GB) es la referencia medida; tarjetas con Tensor Cores usan FP16 por defecto. En GTX 16xx (sm_75 sin Tensor Cores) hay que construir motores FP32.
- GPU de consumo: sí, cabe en tarjetas de 6 GB con los grafos FP32 troceados; en tarjetas con Tensor Cores, FP16 es la opción rápida.
- Despliegue: ONNX Runtime (`tagger_ort.py`), TensorRT (`tagger_trt.py` + `export_trt.py`), y la variante INT8 dinámica del 336-ft solo en CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imagen).
- Latencia: 61 ms @1008 y 7,0 ms @336 por imagen (TensorRT FP16, RTX 5070); 161 ms @1008 con onnxruntime FP16. Throughput no publicado más allá de estos tiempos por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Etiquetas | Licencia | Formato |
|---|---|---|---|---|---|
| PixAI Tagger v1.0 ONNX (esta ficha) | no disponible | 336 / 448 / 672 / 1008 px | 30.877 | Apache-2.0 | ONNX, safetensors, TensorRT |
| pixai-labs/pixai-tagger-v1.0 (original) | no disponible | 1008 px (referencia) | 30.877 | Apache-2.0 | safetensors (PyTorch) |
| Alternativas tipo WD-Tagger / DeepDanbooru | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de terceros; la única comparación cuantitativa disponible es contra el checkpoint original, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- El modelo está especializado en contenido anime y en el vocabulario de Danbooru; su comportamiento fuera de ese dominio no está documentado.
- Los umbrales fine-tuned son más estrictos y deben usarse con los grafos fine-tuned; mezclar umbrales y grafos produce resultados incorrectos.
- El modelo 448-ft está calibrado solo para etiquetado de personajes/IP dentro de Hammy; las demás categorías no se ajustaron para él.
- Las variantes fine-tuned a 336 y 672 px tienen precisión notablemente inferior al modelo a 1008 px (por ejemplo, 0,54-0,60 de flips en character/copyright frente a 0/0 del FP32 a 1008).
- En GTX 16xx, FP16 es más lento que FP32 por falta de Tensor Cores; usar FP16 ahí degrada el rendimiento.
- La variante INT8 dinámica es solo para CPU y requiere los umbrales del 336-ft.
- Los grafos FP32 necesitan el sidecar `.onnx.data` junto al archivo; si falta, la carga falla.
- No se han documentado sesgos específicos, tasas de alucinación (no aplica a clasificación, pero sí falsos positivos/negativos por umbral) ni restricciones adicionales de la licencia Apache-2.0 para uso comercial.
- El repositorio ocupa 31,2 GB, lo que complica su descarga y almacenamiento en entornos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HentaiSL/pixai-tagger-v1.0-onnx-1008-672-336-ft
- Modelo base: https://huggingface.co/pixai-labs/pixai-tagger-v1.0
- Herramienta Hammy: https://github.com/DoremySL/Hammy
