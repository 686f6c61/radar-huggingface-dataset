# inference4j/dfine-medium-coco

## Resumen

D-FINE Medium (COCO) en formato ONNX es la exportación del modelo de detección de objetos D-FINE (Redefine Bounding Box Regression for DETR-based Object Detection) desarrollado por el grupo USTC (Peterande/D-FINE), en su variante medium y entrenado sobre el conjunto COCO con 80 clases. Este repositorio concreto, publicado por el usuario inference4j, es un espejo del export oficial de onnx-community pensado para integrarse en inference4j, una biblioteca de inferencia en Java. El modelo original se distribuye bajo licencia Apache-2.0, lo que lo convierte en una alternativa permisiva y no copyleft frente a detectores como YOLOv8 o YOLO26, que emplean AGPL.

Técnicamente se trata de un detector basado en transformer (familia DETR) que prescinde de NMS en el post-procesado y que reformula la regresión de cajas delimitadoras mediante un mecanismo de refinamiento iterativo (FDR, Fine-grained Distribution Refinement) junto con una destilación de autoatención (GO-LSD) que acelera la convergencia. La variante medium reporta 52,3 AP en COCO val2017 según los autores originales, con una entrada fija de 640x640 píxeles y una salida de 300 detecciones por imagen.

Su relevancia actual reside en dos factores: por un lado, ofrece una licencia Apache-2.0 apta para uso comercial sin obligaciones de copyleft, algo poco habitual en el ecosistema de detección de objetos de alto rendimiento; por otro, su empaquetado ONNX de 0,1 GB facilita el despliegue en entornos Java y en pipelines de inferencia ligeros, sin necesidad de framework PyTorch en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE Medium (detector de objetos basado en transformer, familia DETR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 640x640) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Tarea | Detección de objetos, 80 clases COCO |
| Entrada | `pixel_values`: `[batch, 3, 640, 640]`, RGB, normalizado 0-1, redimensionado bilineal sin letterbox |
| Salida | `logits`: `[batch, 300, 80]` (logits crudos, aplicar sigmoid) y `pred_boxes`: `[batch, 300, 4]` (normalizado `[cx, cy, w, h]`) |
| Post-procesado | Conversión de `[cx, cy, w, h]` a `[x1, y1, x2, y2]` escalado a las dimensiones de la imagen; filtrado por umbral de confianza (> 0,5); no requiere NMS |
| COCO AP | 52,3 (val2017, según los autores de D-FINE) |
| Framework original | PyTorch (USTC D-FINE) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

D-FINE pertenece a la familia de detectores DETR, que emplean un transformer con consultas aprendidas (object queries) para predecir directamente un conjunto fijo de detecciones sin necesidad de anchors ni de supresión no máxima (NMS). La innovación principal del trabajo es el módulo FDR (Fine-grained Distribution Refinement), que reformula la regresión de cajas como un problema de refinamiento iterativo de distribuciones de probabilidad sobre las coordenadas, mejorando la precisión de localización respecto a la regresión directa de DETR. Adicionalmente, incorpora GO-LSD (Global Optimal Localization Self-Distillation), una técnica de destilación que acelera la convergencia del entrenamiento y mejora el rendimiento final.

El modelo se entrena sobre COCO (Common Objects in Context) con 80 clases y se evalúa sobre el split val2017, donde alcanza 52,3 AP. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset más allá de COCO, ni si se emplearon técnicas de RLHF o DPO (no aplicables a un detector de objetos). El export ONNX mantiene la arquitectura del modelo original pero fija la entrada a 640x640 y produce 300 detecciones por imagen, lo que simplifica el despliegue en producción.

## Capacidades

- Detección de objetos en imágenes RGB con 80 clases COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Predicción directa de cajas delimitadoras y puntuaciones de confianza por clase, sin necesidad de NMS en el post-procesado.
- Salida de hasta 300 detecciones por imagen, con logits por clase y cajas normalizadas.
- Inferencia en formato ONNX, compatible con runtimes como ONNX Runtime, lo que permite despliegue en Java, C++, Python y otros lenguajes.
- Integración nativa con la biblioteca inference4j para aplicaciones Java.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente de visión.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la detección de objetos.

## Casos de uso

- **Vigilancia y análisis de vídeo en tiempo real**: el modelo puede procesar fotogramas de 640x640 y devolver hasta 300 detecciones por imagen; su naturaleza sin NMS simplifica el pipeline y reduce la latencia en sistemas de monitorización con ONNX Runtime.
- **Automatización de inventario en retail**: detección de productos en estanterías o imágenes de almacén, aprovechando las clases COCO para objetos comunes y la licencia Apache-2.0 para uso comercial sin restricciones de copyleft.
- **Análisis de imágenes en aplicaciones Java empresariales**: gracias a la integración con inference4j, el modelo se puede invocar desde código Java con una API fluida (`DetrDetector.dfineMedium().build()`), lo que facilita su adopción en backends corporativos sin depender de Python.
- **Moderación de contenido visual**: detección de personas, vehículos u objetos relevantes en imágenes subidas por usuarios, con filtrado por umbral de confianza (> 0,5) para reducir falsos positivos.
- **Sistemas de conteo y aforo**: conteo de personas o vehículos en imágenes de cámaras fijas, usando las cajas delimitadoras y las puntuaciones por clase para agregar métricas.
- **Preprocesado para pipelines de visión más complejos**: uso del detector como primera etapa para recortar regiones de interés que alimenten modelos de clasificación, OCR o reconocimiento facial posteriores.
- **Prototipado rápido en entornos con recursos limitados**: el tamaño del repositorio (0,1 GB) y el formato ONNX permiten desplegar el modelo en contenedores ligeros o dispositivos edge con ONNX Runtime.
- **Investigación en detección de objetos**: comparación de la familia D-FINE con detectores YOLO en experimentos académicos, con la ventaja de una licencia permisiva para publicar resultados y derivados.

## Benchmarks y rendimiento

| Benchmark | D-FINE Medium | Notas |
|---|---|---|
| COCO AP (val2017) | 52,3 | Dato reportado por los autores de D-FINE |

No se han publicado en la información disponible resultados adicionales de benchmarks (por ejemplo, AP50, AP75, AP small/medium/large, latencia o throughput) para esta variante concreta en formato ONNX. Tampoco se proporcionan comparaciones numéricas con YOLOv8, YOLO26 u otros detectores en la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; el repositorio pesa 0,1 GB, por lo que el modelo cabe holgadamente en GPUs consumer con 4 GB o más de VRAM en FP32, y aún menos en FP16.
- **GPU recomendadas**: cualquier GPU moderna con soporte ONNX Runtime (NVIDIA RTX 3060 o superior, A100, H100). Para despliegues en CPU, ONNX Runtime ofrece ejecución sin GPU.
- **Cabe en GPU consumer**: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, dado el reducido tamaño del modelo.
- **Opciones de despliegue**: ONNX Runtime (principal), inference4j (Java), y cualquier runtime compatible con ONNX (por ejemplo, TensorRT previa conversión, OpenVINO). No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/Entrada | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|---|
| D-FINE Medium (este) | DETR (transformer) | no disponible | 640x640 | 52,3 | Apache-2.0 | ONNX |
| YOLOv8 (variante media) | CNN | no disponible en la información | no disponible | no disponible en la información | AGPL-3.0 | PyTorch, ONNX |
| YOLO26 | CNN | no disponible en la información | no disponible | no disponible en la información | AGPL-3.0 | no disponible en la información |
| D-FINE Large (variante superior) | DETR (transformer) | no disponible | 640x640 | no disponible en la información | Apache-2.0 | PyTorch, ONNX |

La comparativa se limita a los datos disponibles: la model card menciona explícitamente que D-FINE se posiciona como alternativa permisiva (Apache-2.0) a YOLOv8 y YOLO26 (AGPL), pero no aporta cifras de rendimiento de esos modelos para una comparación numérica directa. No se dispone de datos de parámetros, latencia ni AP de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Alcance limitado a 80 clases COCO**: el modelo no detecta categorías fuera del conjunto COCO; para dominios específicos (medicina, industria, satélite) requeriría fine-tuning.
- **Entrada fija de 640x640**: no admite resoluciones variables de forma nativa en este export; imágenes de otra resolución deben redimensionarse, lo que puede afectar a objetos pequeños.
- **Sin NMS**: el post-procesado se basa en un umbral de confianza (> 0,5); umbrales mal ajustados pueden generar detecciones duplicadas o falsos negativos.
- **Riesgo de alucinación**: como todo detector, puede producir falsos positivos en imágenes ambiguas o con oclusiones; no se documentan sesgos específicos.
- **Sesgos conocidos**: no disponibles en la información proporcionada; COCO tiene una distribución demográfica y geográfica concreta que puede introducir sesgos en las clases de personas y objetos.
- **Licencia Apache-2.0**: permite uso comercial y modificaciones sin obligación de copyleft, pero requiere mantener el aviso de licencia y la atribución correspondiente.
- **Mantenimiento del espejo**: este repositorio es un espejo de terceros (inference4j) del export oficial de onnx-community; conviene verificar la versión original para actualizaciones.
- **Sin soporte lingüístico ni multimodal**: no es adecuado para tareas de texto, VQA, captioning ni razonamiento; su uso está restringido a detección de objetos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inference4j/dfine-medium-coco
- Modelo original en ustc-community: https://huggingface.co/ustc-community/dfine-medium-coco
- Export ONNX oficial: https://huggingface.co/onnx-community/dfine_m_coco-ONNX
- Repositorio GitHub de D-FINE: https://github.com/Peterande/D-FINE
- Biblioteca inference4j: https://github.com/inference4j/inference4j
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
