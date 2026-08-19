# capinowo/skripsi-yolo12n-cbam-spatial-checkpoint-50e-finetuned-75e

## Resumen
El modelo `capinowo/skripsi-yolo12n-cbam-spatial-checkpoint-50e-finetuned-75e` es un detector de objetos de una sola clase entrenado específicamente para matrículas de vehículos vietnamitas. Se basa en la arquitectura YOLO12n (versión nano de YOLO12) a la que se le ha añadido un módulo CBAM (Convolutional Block Attention Module) con atención espacial para mejorar la capacidad de localización. El autor, capinowo, ha realizado un fine-tuning de 75 épocas partiendo de un checkpoint previo (`capinowo/skripsi-yolo12n-cbam-spatial-checkpoint-50e`) sobre el dataset público de matrículas vietnamitas `duydieunguyen/licenseplates`, convirtiendo las anotaciones de polígonos a formato de detección YOLO de una sola clase.

El repositorio contiene dos checkpoints: `best.pt` (el de mayor mAP en validación) y `last.pt` (el de la última época, útil para comprobar si el entrenamiento había alcanzado una meseta). Los resultados de evaluación sobre el conjunto de validación vietnamita son altos, con un mAP50-95 de 0.8947 y un mAP50 de 0.9946 en el checkpoint `best.pt`. Es un modelo ligero, adecuado para aplicaciones de visión por computador en tiempo real, aunque la información pública disponible es limitada en cuanto a licencia y detalles de preentrenamiento.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | YOLO12n con módulo CBAM (atención espacial) |
| Parametros totales | no disponible (YOLO12n es la variante nano, probablemente ~2-3M, pero no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (los pesos se almacenan como .pt de PyTorch, sin cuantización documentada) |
| Idiomas soportados | no aplica (detección de objetos) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento
El modelo se basa en YOLO12n, la variante nano de la familia YOLO12, que emplea una red neuronal convolucional de una sola pasada para detectar objetos. La incorporación del módulo CBAM añade atención en canal y espacial, lo que permite al modelo centrarse en las regiones relevantes de la imagen (las matrículas) y mejorar la precisión de localización. El fine-tuning se realizó con los siguientes hiperparámetros: 75 épocas, tasa de aprendizaje inicial 0.001, paciencia 100, tamaño de imagen 640 píxeles y tamaño de lote 16. El dataset de entrenamiento proviene de `duydieunguyen/licenseplates`, que contiene imágenes de matrículas vietnamitas; las anotaciones originales en formato polígono se convirtieron a cajas delimitadoras (bounding boxes) para el formato de detección YOLO de una sola clase. No se dispone de información sobre el dataset de preentrenamiento del modelo base ni sobre técnicas adicionales como aumento de datos o regularización.

## Capacidades
- Detección de matrículas de vehículos vietnamitas en imágenes (una sola clase).
- Localización de objetos mediante cajas delimitadoras con alta precisión (mAP50 de 0.9946 en validación).
- Inferencia en tiempo real gracias a la arquitectura YOLO nano, adecuada para dispositivos con recursos limitados.
- No tiene capacidades de generación de texto, razonamiento, tool calling, agentes ni procesamiento de lenguaje natural.
- No soporta visión multimodal más allá de la detección de objetos; no hay funciones de clasificación múltiple ni segmentación.

## Casos de uso
- Control de acceso en aparcamientos: el modelo puede detectar matrículas en imágenes de cámaras de entrada y salida, permitiendo automatizar la apertura de barreras y el registro de vehículos.
- Peajes automáticos: integrado en sistemas de peaje, identifica matrículas para facturar o validar el paso sin intervención manual.
- Vigilancia y seguridad: en cámaras de vigilancia urbana, detecta matrículas para alertar sobre vehículos buscados o para análisis de tráfico.
- Aplicaciones móviles de estacionamiento: un usuario puede fotografiar su matrícula y el modelo la detecta para registrar el vehículo en una app de pago.
- Análisis de tráfico: conteo de vehículos por matrícula en estudios de movilidad, aunque el modelo solo detecta la matrícula, no el tipo de vehículo.
- Sistema de gestión de flotas: detección automática de matrículas en imágenes de cámaras para asociar vehículos a conductores o rutas.

## Benchmarks y rendimiento
Los resultados de evaluación sobre el conjunto de validación de matrículas vietnamitas son los siguientes:

| Checkpoint | mAP50-95 | mAP50 | Precision | Recall | F1 |
|---|---|---|---|---|---|
| best.pt | 0.8947 | 0.9946 | 0.98252 | 0.98858 | 0.98554 |
| last.pt | 0.89053 | 0.99462 | 0.98755 | 0.98553 | 0.98654 |

No se han publicado comparaciones con otros modelos de detección de matrículas en la información disponible.

## Requisitos de hardware
- Al ser un modelo YOLO nano, es ligero y puede ejecutarse en GPUs de gama baja o incluso en CPU, aunque la inferencia en tiempo real requiere al menos una GPU modesta.
- VRAM estimada: inferior a 1 GB en FP32 (basado en el tamaño típico de YOLO12n, aunque no se confirma el número exacto de parámetros).
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superior. También es viable en Jetson Nano o dispositivos edge.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con frameworks como TorchServe, ONNX Runtime o convertirse a TensorRT para optimización. No se documenta soporte para vLLM, llama.cpp u Ollama (no aplican a modelos de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
No se dispone de datos comparativos con otros detectores de matrículas (por ejemplo, YOLOv8n, YOLOv5n o modelos específicos como LPRNet). La comparación cualitativa se limita a señalar que YOLO12n es una evolución reciente de la serie YOLO, con mejor equilibrio entre velocidad y precisión, y que el módulo CBAM añade atención espacial, pero sin métricas oficiales frente a alternativas no se puede establecer una comparativa numérica. Se indica "no disponible" para una comparación rigurosa.

## Limitaciones y advertencias
- El modelo está entrenado exclusivamente con matrículas vietnamitas; su rendimiento puede degradarse significativamente con matrículas de otros países o formatos diferentes.
- Solo detecta una clase (matrícula), no distingue entre tipos de vehículos ni realiza reconocimiento óptico de caracteres (OCR).
- La licencia del modelo no está especificada, lo que genera incertidumbre sobre su uso comercial o redistribución.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con un dataset concreto, puede presentar falsos positivos en imágenes con objetos similares a matrículas (señales, carteles).
- La información sobre el preentrenamiento del modelo base es limitada, por lo que no se puede evaluar su robustez ante condiciones adversas (iluminación, oclusión, etc.).
- Para producción, se recomienda validar el modelo con un conjunto de datos local y considerar técnicas de cuantización para reducir aún más el consumo de recursos.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/capinowo/skripsi-yolo12n-cbam-spatial-checkpoint-50e-finetuned-75e
- Dataset de fine-tuning: https://huggingface.co/datasets/duydieunguyen/licenseplates
- Checkpoint original: https://huggingface.co/capinowo/skripsi-yolo12n-cbam-spatial-checkpoint-50e
