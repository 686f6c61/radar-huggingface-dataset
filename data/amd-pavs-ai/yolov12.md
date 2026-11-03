# AMD-PAVS-AI/yolov12

## Resumen

YOLO12 es un detector de objetos en tiempo real que localiza y clasifica instancias en 80 categorías del dataset COCO en un único pase forward. Este repositorio, publicado por AMD-PAVS-AI, no contiene los pesos originales de Ultralytics en formato PyTorch, sino una exportación a ONNX Runtime validada y optimizada para ejecutarse sobre la pila AMD ROCm: GPUs AMD Instinct y Radeon, CPUs AMD y NPUs AMD Ryzen AI. La implementación base procede del repositorio oficial de Ultralytics y no requiere cambios de código respecto al upstream, únicamente configuración de entorno y runtime.

El paquete incluye scripts de evaluación sobre las 5.000 imágenes de COCO val2017 con métricas oficiales calculadas mediante `pycocotools`, perfiles de latencia por operador y una integración con el analizador de NPU. La variante por defecto es el tamaño `m`, con posibilidad de exportar `s`, `l` o `x` mediante la variable `MODEL_SIZE`.

Su relevancia actual radica en que ofrece una ruta de despliegue de detección de objetos de propósito general sobre hardware AMD heterogéneo (CPU, GPU y NPU) con un mismo artefacto ONNX, algo poco habitual en el ecosistema, tradicionalmente centrado en CUDA. La entrada es un tensor `(1, 3, 640, 640)` float32 y la salida `(1, 84, 8400)` float32. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector CNN de un solo pase (YOLO12 de Ultralytics), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no lingüístico) |
| Tipos de cuantizacion | FP32 (CPU); FP32, FP16, BF16, INT8 (GPU vía MIGraphX); cuantización automática interna (NPU vía VitisAI) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La model card describe el modelo como un detector de objetos CNN de un solo pase, basado en la implementación YOLO12 de Ultralytics. No se detalla en la información proporcionada la composición interna de la arquitectura (bloques de atención, cuello, cabeza de detección), el número de parámetros ni el volumen de datos de entrenamiento. El único dato concreto sobre datos es el conjunto de evaluación: COCO val2017, con 5.000 imágenes y 80 categorías.

La aportación técnica de este repositorio no es el entrenamiento, sino la exportación y validación multiplataforma sobre ROCm mediante ONNX Runtime con tres execution providers: CPU Execution Provider en FP32, MIGraphX Execution Provider en GPU con precisión FP32, FP16, BF16 e INT8, y VitisAI Execution Provider en NPU Ryzen AI con cuantización automática interna. En NPU, la primera ejecución requiere entre 5 y 10 minutos de compilación del modelo; las posteriores reutilizan la versión compilada en caché. No se documentan fases de RLHF, DPO ni técnicas de decodificación especulativa, por no tratarse de un modelo generativo de texto.

## Capacidades

- Detección de objetos en una sola pasada sobre imágenes, con localización de cajas y clasificación en 80 categorías COCO.
- Salida densa de 8.400 predicciones por imagen (formato `(1, 84, 8400)`), con 4 coordenadas de caja y 80 puntuaciones de clase por predicción.
- Ejecución sobre CPU AMD en FP32 sin aceleración específica.
- Ejecución acelerada sobre GPU AMD Instinct y Radeon mediante ROCm y MIGraphX, con soporte de FP32, FP16, BF16 e INT8.
- Ejecución sobre NPU AMD Ryzen AI mediante VitisAI, con cuantización automática gestionada por el runtime.
- Evaluación reproducible de métricas COCO oficiales (mAP@0.5:0.95, mAP@0.5, mAP@0.75, precisión, recall AR@100 y mAP por tamaño de objeto).
- Perfilado de latencia por operador, con integración del analizador de NPU.
- No soporta tool calling, razonamiento multi-paso, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Inspección visual en líneas de fabricación: el modelo puede procesar fotogramas de cámaras industriales en un único pase forward sobre una GPU Radeon con ROCm, detectando piezas y defectos entre las categorías COCO o tras un ajuste fino, con métricas de mAP por tamaño de objeto para validar la precisión en piezas pequeñas.
- Videovigilancia y analítica de aforo: al ejecutarse sobre NPU Ryzen AI, permite integrar detección de personas y vehículos en equipos de borde de bajo consumo, delegando la NPU al detector y dejando la CPU libre para la lógica de negocio.
- Preprocesado para pipelines de robótica: la salida `(1, 84, 8400)` puede alimentar módulos de planificación o seguimiento; el SDK `physical_ai_sdk` de AMD está orientado a este tipo de flujos físicos.
- Etiquetado asistido y preanotación de datasets: ejecutar el detector sobre lotes de imágenes en CPU AMD en FP32 para generar cajas candidatas que un humano revise después, reduciendo el coste de anotación.
- Control de calidad en agricultura y conteo de cultivos: detección de objetos a distintas escalas, con la métrica mAP-small/medium/large como criterio para decidir si el tamaño `m` basta o conviene exportar `l` o `x`.
- Despliegue en flotas heterogéneas: un mismo artefacto ONNX sirve para servidores con Instinct, estaciones con Radeon y equipos con Ryzen AI, lo que simplifica la gestión de versiones al no mantener binarios distintos por backend.
- Benchmarking de hardware AMD: los scripts de perfilado por operador permiten comparar latencia y precisión entre CPU, GPU y NPU para decidir el destino de despliegue de un producto.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre COCO val2017 completo (5.000 imágenes), variante `m`:

| Dispositivo | Precisión | mAP@0.5:0.95 | mAP@0.5 | mAP@0.75 | Precision | Recall |
|---|---|---|---|---|---|---|
| CPU | FP32 | 0,5141 | 0,6855 | 0,5568 | 0,4615 | 0,5623 |
| GPU | FP16 | 0,5137 | 0,6855 | 0,5555 | 0,4611 | 0,5616 |
| NPU | FP32 | 0,3164 | 0,4701 | 0,3458 | 0,2854 | 0,3582 |

La caída de calidad en NPU es sustancial: aproximadamente 0,20 puntos de mAP@0.5:0.95 respecto a CPU y GPU, atribuida en la model card a la cuantización BF16 interna de VitisAI. No se han publicado en la información disponible datos de latencia, throughput ni resultados por tamaño de objeto (small/medium/large), pese a que el pipeline de evaluación los contempla.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con entrada de 640×640 y salida de 8.400 predicciones, el modelo es ligero; el repositorio completo pesa 0,2 GB, por lo que la huella en memoria es reducida en cualquiera de las precisiones soportadas.
- GPU validadas: AMD Instinct y AMD Radeon con ROCm, mediante el MIGraphX Execution Provider de ONNX Runtime.
- CPU validadas: CPUs AMD con el CPU Execution Provider en FP32.
- NPU validadas: AMD Ryzen AI mediante VitisAI, con compilación inicial de 5 a 10 minutos y caché posterior.
- GPU de consumo: no se especifican modelos concretos ni se confirma compatibilidad con GPUs NVIDIA; la validación documentada es exclusivamente sobre hardware AMD.
- Opciones de despliegue: ONNX Runtime con los execution providers CPU, MIGraphX y VitisAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El repositorio incluye scripts de perfilado por operador para medirlos.

## Comparativa con modelos similares

| Modelo | Familia | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO12 (AMD-PAVS-AI, este repo) | YOLO12, tamaño `m` por defecto | Detección de objetos, 80 clases COCO | Imagen 640×640 | AGPL-3.0 | ONNX, validado en ROCm (CPU/GPU/NPU) |
| YOLO12 (Ultralytics, upstream) | YOLO12, tamaños `s/m/l/x` | Detección de objetos, 80 clases COCO | Imagen 640×640 | AGPL-3.0 | Pesos PyTorch; ejecución orientada a CUDA |
| Otros detectores de la familia YOLO (versiones previas de Ultralytics) | YOLO | Detección de objetos | Imagen, resolución variable | AGPL-3.0 | Pesos PyTorch y exportaciones ONNX |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de los modelos comparables, por lo que la comparación cuantitativa queda limitada a la tabla de benchmarks de la sección anterior. La diferencia práctica frente al upstream de Ultralytics es el empaquetado ONNX y la validación sobre ROCm, no la arquitectura ni los pesos entrenados.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso en red o distribución de un servicio basado en el modelo obliga a liberar el código fuente bajo la misma licencia; es una restricción relevante para productos comerciales cerrados.
- Caída de precisión en NPU de aproximadamente 0,20 puntos de mAP@0.5:0.95 frente a CPU y GPU, debida a la cuantización BF16 de VitisAI. No se recomienda NPU para aplicaciones que exijan la máxima precisión de localización.
- El modelo detecta únicamente las 80 categorías de COCO; cualquier dominio específico requiere ajuste fino, y la model card no documenta recetas de entrenamiento para ello.
- No se detallan sesgos del dataset de entrenamiento ni limitaciones por tipo de objeto, oclusión, iluminación o resolución de entrada distinta de 640×640.
- Riesgo de falsos positivos y negativos inherente a la detección de objetos; los valores de precisión (0,4615 en CPU) y recall (0,5623) indican margen de error apreciable.
- La primera ejecución en NPU tarda entre 5 y 10 minutos por compilación del modelo; conviene planificar el arranque en frío en despliegues con reinicios frecuentes.
- La validación documentada es exclusivamente sobre hardware AMD; no hay evidencia publicada de funcionamiento correcto en GPUs NVIDIA u otras plataformas.
- El repositorio no registra descargas ni likes, y la model card no incluye información sobre parámetros, datos de entrenamiento ni latencias, lo que dificulta una evaluación completa previa a producción.
- No se especifican los idiomas ni se aplica, al no ser un modelo lingüístico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMD-PAVS-AI/yolov12
- Scripts de YOLOv12 para AMD en el SDK: https://github.com/AMD-PAVS/physical_ai_sdk/blob/main/models/yolov12
- Implementación upstream de YOLO12 (Ultralytics): https://github.com/ultralytics/ultralytics
