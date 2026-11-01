# Blaize-AI/YOLOPOSE26l_COCOKeypoint

## Resumen

YOLOPOSE26l_COCOKeypoint es un modelo de estimación de pose (pose detection) basado en YOLO26l-pose de Ultralytics, optimizado por Blaize-AI para su despliegue sobre aceleradores de IA Blaize Xplorer mediante el SDK Picasso. No se trata de un modelo de lenguaje, sino de una red convolucional de visión por computador especializada en la detección de keypoints humanos (17 puntos clave del esqueleto) entrenada sobre el dataset COCO Keypoints 2017.

El modelo se distribuye en formato `.bm`, propietario de Blaize, y no en safetensors ni GGUF, lo que lo ata al ecosistema hardware/software de Blaize (Graph Streaming Processor o GSP). El repositorio incluye dos variantes con cuantización AMP y resoluciones de entrada de 640×384 y 640×640, con un tamaño total de repositorio de 0,1 GB.

Su relevancia es acotada: es un artefacto de despliegue para edge AI en hardware Blaize, no un modelo de propósito general. Resulta útil para desarrolladores que integren aceleradores Blaize en pipelines de visión (vigilancia, análisis deportivo, robótica) y necesiten una pose estimator ya compilada y cuantizada para ese hardware concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26l-pose (CNN, familia Ultralytics YOLO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | AMP (mezcla INT8 + BF16); el autor menciona INT8 y BF16 como métodos base |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (Blaize model, propietario) |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tarea | Pose detection / keypoint detection (17 keypoints COCO) |
| Dataset de entrenamiento | COCO Keypoints 2017 (CC-BY-4.0) |
| Resoluciones de entrada | 640×384 y 640×640 |
| Variantes incluidas | `YOLOPOSE26l_COCOKeypoint_amp_640_384`, `YOLOPOSE26l_COCOKeypoint_amp_640_640` |
| Framework original | PyTorch (Ultralytics) |
| Hardware objetivo | Blaize Xplorer AI accelerator (GSP) |
| SDK requerido | Blaize Picasso SDK |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO26l-pose, una red convolucional de la familia YOLO de Ultralytics orientada a detección de pose en una sola etapa. El modelo original se entrena en PyTorch sobre COCO Keypoints 2017, un dataset anotado con 17 keypoints por persona (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas y tobillos) bajo licencia CC-BY-4.0. No se dispone de información sobre el número exacto de parámetros, el volumen de tokens o imágenes de entrenamiento, ni sobre si se aplicaron técnicas de destilación o aumentación específicas más allá de las del pipeline estándar de Ultralytics.

La innovación principal de esta ficha no está en el entrenamiento sino en la optimización para hardware: Blaize ha realizado optimizaciones específicas para su Graph Streaming Processor (GSP), una arquitectura basada en grafos de datos orientada a eficiencia energética y baja latencia en inferencia edge. El modelo se empaqueta en formato `.bm` y se ejecuta a través del Picasso SDK, con variantes cuantizadas en AMP (combinación de INT8 y BF16) para equilibrar precisión y velocidad. No se documentan detalles sobre calibración de cuantización, dataset de calibración ni métricas de degradación por cuantización.

## Capacidades

- Detección de pose humana con 17 keypoints según el estándar COCO Keypoints.
- Estimación de pose multi-persona en una imagen (capacidad heredada de YOLO-pose; no confirmada explícitamente en la model card).
- Inferencia en tiempo real sobre aceleradores Blaize Xplorer con cuantización AMP.
- Dos resoluciones de entrada precompiladas: 640×384 (formato panorámico) y 640×640 (cuadrado).
- Ejecución mediante el SDK Picasso y la utilidad `blaize-modeltool`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general (clasificación, segmentación, detección de objetos) más allá de keypoints.

## Casos de uso

- Análisis deportivo en tiempo real: el modelo puede estimar la pose de atletas en secuencias de vídeo a 640×384 para calcular ángulos articulares, detectar posturas incorrectas o generar métricas biomecánicas en edge, sin enviar vídeo a la nube.
- Vigilancia y seguridad industrial: detección de caídas, posturas peligrosas o presencia de personas en zonas restringidas, desplegado sobre aceleradores Blaize de bajo consumo en cámaras IP o gateways.
- Robótica colaborativa: estimación de la pose de operarios para que un robot ajuste su trayectoria o se detenga ante proximidad humana, aprovechando la baja latencia del GSP.
- Rehabilitación y fisioterapia: seguimiento de ejercicios en dispositivos clínicos o domésticos con hardware edge, comparando keypoints contra patrones de movimiento de referencia.
- Retail analytics: análisis de flujos de personas y posturas en tiendas mediante cámaras con acelerador Blaize, sin transmisión de vídeo a servidores externos.
- Interacción persona-máquina en kioscos o entornos industriales: control gestual o detección de presencia basada en esqueleto, integrado en el mismo acelerador que ejecuta otras redes del pipeline.
- Prototipado en edge AI: validación de pipelines de visión sobre Blaize Xplorer antes de portar modelos propios, usando este pose estimator como referencia funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (AP, OKS), latencia, throughput ni comparativas con otras implementaciones de YOLO-pose.

## Requisitos de hardware

- Hardware objetivo: acelerador Blaize Xplorer (arquitectura GSP). No se ejecuta de forma nativa en GPU convencional ni CPU con el formato `.bm`.
- SDK necesario: Blaize Picasso SDK instalado y configurado.
- VRAM estimada: no disponible (no aplica a GPU; el modelo corre sobre memoria del acelerador Blaize).
- GPU recomendadas: no aplica; el modelo está compilado para GSP, no para CUDA.
- Compatibilidad con consumer GPU: no. No hay pesos en safetensors ni ONNX en este repositorio, por lo que no se puede cargar directamente en una RTX 4090, A100 o H100 sin reconvertir desde el modelo original de Ultralytics.
- Opciones de despliegue: exclusivamente mediante Picasso SDK y `blaize-modeltool`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto/Entrada | Formato | Licencia | Hardware |
|---|---|---|---|---|---|---|
| YOLOPOSE26l_COCOKeypoint (este) | Pose detection, 17 keypoints | no disponible | 640×384 / 640×640 | `.bm` | AGPL-3.0 | Blaize Xplorer (GSP) |
| YOLO26l-pose original (Ultralytics) | Pose detection, 17 keypoints | no disponible | configurable (por defecto 640) | PyTorch / ONNX / TensorRT | AGPL-3.0 o enterprise | GPU, CPU, edge |
| YOLOv8l-pose (Ultralytics) | Pose detection, 17 keypoints | no disponible | configurable | PyTorch / ONNX | AGPL-3.0 o enterprise | GPU, CPU, edge |
| MediaPipe Pose (Google) | Pose detection, 33 keypoints | no disponible | 256×256 / 192×192 | TFLite | Apache 2.0 | CPU, móvil, edge |

La comparativa es orientativa: no se dispone de métricas de precisión ni latencia de este modelo que permitan una comparación cuantitativa con las alternativas. La diferencia clave es el formato propietario `.bm` y la dependencia del hardware Blaize, frente a la portabilidad de las versiones originales de Ultralytics o MediaPipe.

## Limitaciones y advertencias

- Modelo no portátil: el formato `.bm` solo se ejecuta sobre aceleradores Blaize Xplorer con el Picasso SDK; no es utilizable en GPU estándar sin reconvertir desde el modelo original.
- Licencia AGPL-3.0: el uso comercial en servicios de red puede obligar a liberar el código fuente del servicio que lo integre, salvo que se adquiera la licencia enterprise de Ultralytics (LicenseRef-Ultralytics-Enterprise-License).
- Restricciones de la licencia del dataset: COCO Keypoints 2017 es CC-BY-4.0, lo que requiere atribución al COCO Consortium.
- Sesgos de COCO: el dataset está sesgado hacia personas en contextos cotidianos y puede tener menor precisión en poses extremas, oclusiones severas, personas en sillas de ruedas o contextos no representados.
- Solo 17 keypoints: no incluye puntos de manos, cara detallada ni pies, a diferencia de modelos como MediaPipe (33 keypoints).
- Riesgo de falsos positivos y negativos en escenas con múltiples personas solapadas o resoluciones de entrada reducidas (640×384).
- Sin datos de precisión publicados: no se puede garantizar el impacto de la cuantización AMP sobre la exactitud (OKS/AP) frente al modelo original en FP32.
- Sin garantías del proveedor: Blaize declara explícitamente que no revisa, aprueba ni garantiza los modelos de terceros, y no ofrece garantía de no infracción de propiedad intelectual.
- Documentación mínima: la model card no detalla parámetros, métricas, calibración ni limitaciones específicas de la variante cuantizada.
- Sin soporte de texto, tool calling ni agentes: no es un modelo de lenguaje y no debe evaluarse como tal.

## Enlaces

- HuggingFace: https://huggingface.co/Blaize-AI/YOLOPOSE26l_COCOKeypoint
- Modelo original Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO Keypoints: https://cocodataset.org
- Blaize: https://www.blaize.com
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
