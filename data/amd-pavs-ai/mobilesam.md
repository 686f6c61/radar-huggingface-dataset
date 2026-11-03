# AMD-PAVS-AI/mobilesam

## Resumen

MobileSAM es un modelo de segmentación de imágenes promptable desarrollado originalmente por ChaoningZhang y distribuido en este repositorio por AMD-PAVS-AI como un paquete de inferencia optimizado para plataformas AMD ROCm. Se trata de una destilación del Segment Anything Model (SAM) de Meta que sustituye el pesado encoder ViT-H por un encoder TinyViT mucho más ligero, manteniendo el decodificador de prompts original. El resultado es un pipeline de dos etapas que genera máscaras de píxeles a partir de un único punto de prompt sobre la imagen.

Este repositorio concreto no distribuye pesos en formato PyTorch, sino un grafo ONNX de dos etapas (encoder de imagen y decoder de prompt/máscara) validado con ONNX Runtime sobre CPU AMD (FP32), GPUs AMD Instinct y Radeon con ROCm mediante el execution provider MIGraphX (FP32, FP16, BF16, INT8) y NPUs AMD Ryzen AI a través de VitisAI (cuantización automática). La relevancia actual radica en que permite ejecutar segmentación promptable de alta calidad en hardware AMD sin cambios de código respecto a la implementación upstream, algo poco habitual en el ecosistema de modelos de visión, tradicionalmente centrado en CUDA.

El modelo está pensado para tareas de generación de máscaras (mask-generation) y segmentación de instancias, con licencia Apache 2.0 y un tamaño de repositorio de 0,4 GB. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que produce máscaras binarias a partir de coordenadas de puntos sobre una imagen de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: encoder de imagen TinyViT + decoder de prompt/máscara (destilación de SAM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija de 1024x1024) |
| Tipos de cuantizacion | FP32 (CPU/GPU), FP16, BF16, INT8 (GPU), cuantización automática interna (NPU) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo de dos etapas: encoder + decoder) |

## Arquitectura y entrenamiento

MobileSAM sigue la arquitectura de Segment Anything pero con un encoder de imagen TinyViT en lugar del ViT-H de SAM. El pipeline se compone de dos grafos ONNX independientes: un encoder de imagen que se ejecuta una vez por imagen y produce un tensor de embeddings de forma `(1, 256, 64, 64)` en float32 a partir de una entrada `(1, 3, 1024, 1024)`, y un decoder de prompt/máscara que se ejecuta una vez por cada punto de prompt, recibiendo `point_coords` de forma `(1, 1, 2)` y `point_labels` de forma `(1, 1)`, y devolviendo `low_res_masks` de forma `(1, 1, 256, 256)` e `iou_predictions` de forma `(1, 1)`.

El modelo base es MobileSAM en el commit `b01a9ccef3b9e10b099b544efe004d0871802c3b` del repositorio de ChaoningZhang. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de destilación ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de segmentación). La innovación técnica del paquete de AMD es la adaptación del grafo a ONNX Runtime con el execution provider MIGraphX, que escribe la salida del encoder en orden de memoria NHWC; el evaluador la reinterpreta a NCHW para que la precisión en GPU coincida con la de CPU. En NPU, VitisAI aplica cuantización automática interna con una calidad inferior a CPU/GPU.

## Capacidades

- Segmentación de instancias promptable: genera una máscara de píxeles para un objeto a partir de un único punto de prompt sobre la imagen.
- Predicción de calidad de máscara mediante `iou_predictions`, que estima la calidad de la máscara generada.
- Generación de máscaras (mask-generation) como tarea principal del pipeline.
- Ejecución en CPU AMD, GPU AMD Instinct y Radeon con ROCm, y NPU AMD Ryzen AI.
- Compatibilidad con múltiples precisiones: FP32, FP16, BF16 e INT8 en GPU; FP32 en CPU; cuantización automática en NPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión multimodal (no procesa texto ni audio) ni generación de texto.

## Casos de uso

- Segmentación interactiva en herramientas de edición de imágenes: el usuario hace clic en un objeto y el modelo devuelve la máscara correspondiente en una sola pasada del decoder, aprovechando que el encoder se ejecuta una única vez por imagen y el decoder una vez por punto.
- Anotación automática de datasets de visión: integrado en pipelines de etiquetado, permite generar máscaras preliminares sobre las que un humano solo tiene que corregir, reduciendo el coste de anotación en proyectos de segmentación.
- Preprocesado en pipelines de visión industrial sobre hardware AMD: al ejecutarse con ONNX Runtime y MIGraphX en GPUs Radeon o Instinct, puede desplegarse en estaciones de trabajo AMD sin depender de CUDA para separar objetos en imágenes de inspección.
- Segmentación en el borde (edge) con NPUs Ryzen AI: la variante VitisAI permite ejecutar el modelo en portátiles y dispositivos con NPU AMD, aunque con menor calidad (mIoU 0,4252 frente a 0,5752 en CPU/GPU), adecuada para tareas de baja exigencia.
- Extracción de regiones de interés para modelos posteriores: las máscaras generadas pueden alimentar clasificadores, detectores o modelos de OCR que necesiten aislar objetos concretos de una imagen.
- Prototipado rápido de aplicaciones de segmentación: el tamaño reducido del repositorio (0,4 GB) y el formato ONNX facilitan la integración en aplicaciones de escritorio o servicios sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la evaluación sobre un subconjunto de SA-1B de 10 imágenes con anotaciones de punto por máscara:

| Dispositivo | Precisión | mIoU | Mean Mask IoU | Median Mask IoU | IoU Std Dev |
|---|---|---|---|---|---|
| CPU | FP32 | 0,5752 | 0,5752 | 0,5711 | 0,0574 |
| GPU | FP32 | 0,5752 | 0,5752 | 0,5711 | 0,0574 |
| GPU | FP16 | 0,5750 | 0,5750 | 0,5681 | 0,0563 |
| NPU | Auto | 0,4252 | 0,4252 | 0,4174 | 0,0753 |

No se han publicado resultados de latencia ni throughput en la información disponible. Tampoco se han publicado comparativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,4 GB y el grafo ONNX es de dos etapas con encoder TinyViT, por lo que la huella de memoria es reducida en comparación con SAM ViT-H.
- GPU recomendadas: AMD Instinct y AMD Radeon con ROCm, validadas con el execution provider MIGraphX de ONNX Runtime.
- CPU: procesadores AMD con el CPU Execution Provider de ONNX Runtime en FP32.
- NPU: AMD Ryzen AI mediante el execution provider VitisAI, con cuantización automática interna.
- Cabe en GPU de consumo: sí, al estar validado en GPUs AMD Radeon; no se especifican modelos concretos ni requisitos mínimos de VRAM.
- Opciones de despliegue: ONNX Runtime con los execution providers CPU, MIGraphX (GPU) y VitisAI (NPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileSAM (este repo) | TinyViT + decoder SAM, ONNX | no disponible | Imagen 1024x1024 | Apache 2.0 | ONNX en HuggingFace, optimizado para AMD ROCm |
| SAM (ViT-H) | ViT-H + decoder, PyTorch | no disponible en esta ficha | Imagen 1024x1024 | Apache 2.0 | Pesos PyTorch en Meta |
| SAM 2 | Transformer + memoria, PyTorch | no disponible en esta ficha | Imagen/vídeo | Apache 2.0 | Pesos PyTorch en Meta |
| FastSAM | YOLO-based, PyTorch | no disponible en esta ficha | Imagen | GPL-3.0 (según versión) | Pesos en repositorios comunitarios |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a arquitectura, licencia y formato de distribución.

## Limitaciones y advertencias

- La evaluación se realizó sobre un subconjunto muy reducido de SA-1B (10 imágenes), por lo que los valores de mIoU pueden no ser representativos del rendimiento en dominios distintos.
- En NPU con VitisAI la calidad cae de forma notable (mIoU 0,4252 frente a 0,5752 en CPU/GPU), lo que puede ser insuficiente para aplicaciones que requieran precisión alta.
- El modelo solo acepta prompts de punto en esta configuración (`point_coords` de forma `(1, 1, 2)` y `point_labels` de forma `(1, 1)`), sin soporte explícito de cajas o máscaras como prompt en el grafo exportado.
- No procesa texto ni lenguaje: no es adecuado para tareas de comprensión semántica, VQA ni generación de descripciones.
- No se documentan sesgos específicos del modelo ni del dataset de entrenamiento en la información disponible.
- Riesgo de máscaras incorrectas en objetos ambiguos o de bajo contraste; la métrica Min IoU no se publica, pero la desviación estándar de 0,0574 en CPU sugiere variabilidad entre prompts.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base MobileSAM y del dataset SA-1B para usos derivados.
- El repositorio no incluye información sobre latencia ni throughput, por lo que no es posible garantizar requisitos de tiempo real sin medición previa.
- La integración con MIGraphX requiere reinterpretar la salida del encoder de NHWC a NCHW; un uso incorrecto del grafo puede producir resultados erróneos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AMD-PAVS-AI/mobilesam
- Scripts de AMD para MobileSAM: https://github.com/AMD-PAVS/physical_ai_sdk/blob/main/models/mobilesam
- Implementación original de MobileSAM: https://github.com/ChaoningZhang/MobileSAM
- Commit del modelo base: https://github.com/ChaoningZhang/MobileSAM/commit/b01a9ccef3b9e10b099b544efe004d0871802c3b
