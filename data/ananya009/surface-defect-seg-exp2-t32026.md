# Ananya009/surface-defect-seg-exp2-t32026

## Resumen

El modelo `Ananya009/surface-defect-seg-exp2-t32026` es un conjunto de tres modelos de segmentación de imágenes orientados a la detección de defectos superficiales. Lo publica el usuario Ananya009 en Hugging Face como parte de un trabajo denominado "DL GenAI T3 2026" (experimento 2). El objetivo es predecir máscaras de segmentación para cuatro tipos de defectos sobre imágenes en escala de grises de 128 x 800 píxeles, un formato alargado típico de inspección industrial de superficies continuas.

El repositorio contiene tres variantes entrenadas en paralelo: un ResUNet desde cero, un U-Net con encoder ResNet-50 preentrenado y una FPN con encoder ConvNeXtV2-Tiny preentrenado. El autor identifica la variante FPN + ConvNeXtV2-Tiny como la mejor, con un score de validación de 0,7238 según una métrica compuesta que pondera un 70 % el Dice sobre defectos y un 30 % la exactitud en imágenes vacías (sin defecto).

Se trata de un modelo de nicho, de propósito muy específico (inspección visual automatizada), sin licencia declarada ni idiomas especificados, y con cero descargas en el momento de la consulta. Su interés es principalmente práctico para quien necesite una referencia de segmentación de defectos en imágenes de alta relación de aspecto y pueda reutilizar los pesos o la configuración de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tres variantes: ResUNet desde cero, U-Net con encoder ResNet-50 y FPN con encoder ConvNeXtV2-Tiny |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 128 x 800 píxeles en escala de grises) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | no disponible |
| Formato de pesos | `state dict` de PyTorch (`.pth`) más un JSON de configuración por clase de defecto |
| Tarea | Segmentación de imágenes (`image-segmentation`) |
| Dominio | Detección de defectos superficiales (`defect-detection`) |
| Resolución de entrada | 128 x 800, escala de grises |
| Clases de salida | 4 tipos de defecto |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El repositorio agrupa tres arquitecturas de segmentación semántica con enfoques de entrenamiento distintos. La primera, `exp2_model1_resunet`, es una ResUNet implementada desde cero (el autor la ubica en el fichero `scratch_resunet.py`) y entrenada sin pesos preentrenados. La segunda, `exp2_model2_unet_resnet50`, emplea una U-Net con encoder ResNet-50 preentrenado. La tercera, `exp2_model3_fpn_convnextv2_tiny`, combina una Feature Pyramid Network con un encoder ConvNeXtV2-Tiny preentrenado, y es la que obtiene el mejor resultado de validación.

No se detalla en la información disponible el número de tokens ni de imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de aumento de datos, funciones de pérdida específicas o ajuste fino en varias fases. Tampoco se documenta ninguna innovación técnica más allá del uso de encoders preentrenados frente al entrenamiento desde cero. Cada modelo incluye un JSON de configuración con los hiperparámetros ajustados por clase de defecto, lo que sugiere una búsqueda de umbrales o pesos específicos para cada tipo de defecto.

## Capacidades

- Segmentación de imágenes en escala de grises con resolución de entrada de 128 x 800 píxeles.
- Predicción de máscaras para cuatro tipos distintos de defecto superficial.
- Detección de imágenes sin defecto (clase vacía), evaluada mediante la métrica `empty_acc`.
- Tres variantes con distinto equilibrio entre coste de entrenamiento y rendimiento, útil para comparar enfoques.
- Configuración por clase de defecto incluida en formato JSON.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan capacidades de visión general (detección de objetos, clasificación, VQA); el modelo está especializado exclusivamente en segmentación de defectos.

## Casos de uso

- Inspección visual en línea de producción: el modelo recibe imágenes de 128 x 800 píxeles procedentes de una cámara lineal y devuelve máscaras de los cuatro tipos de defecto, lo que permite señalizar piezas defectuosas en tiempo real dentro de una línea de fabricación.
- Control de calidad en superficies continuas: su formato de entrada alargado encaja con tiras de material (textiles, papel, laminados, bandas metálicas) donde los defectos aparecen como regiones localizadas a lo largo de la longitud de la tira.
- Clasificación binaria de lote: usando la exactitud sobre imágenes vacías (`empty_acc`) como referencia, el modelo puede emplearse para descartar automáticamente imágenes sin defecto antes de pasar a una revisión humana más costosa.
- Reentrenamiento y transferencia: las variantes con encoder preentrenado (ResNet-50 y ConvNeXtV2-Tiny) sirven como punto de partida para ajustar el modelo a nuevos tipos de defectos o a otras resoluciones, reutilizando los `state dict` publicados.
- Comparación de arquitecturas en un pipeline de MLOps: los tres modelos permiten evaluar el compromiso entre entrenamiento desde cero y transferencia, útil para decidir la arquitectura base de un sistema de inspección a mayor escala.
- Investigación en segmentación de alta relación de aspecto: el repositorio documenta una configuración concreta (128 x 800, cuatro clases, métrica compuesta) que puede reproducirse como línea base en experimentos académicos de detección de anomalías superficiales.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card. La métrica `val_score` se define como `0,7 * dice sobre defectos + 0,3 * exactitud en imágenes vacías`.

| Modelo | val_score | val_f1 | val_acc | val_dice | val_empty_acc |
|---|---|---|---|---|---|
| exp2_model3_fpn_convnextv2_tiny | 0,723755 | 0,738670 | 0,909251 | 0,641841 | 0,914886 |
| exp2_model2_unet_resnet50 | 0,637161 | 0,658866 | 0,923595 | 0,502800 | 0,950669 |
| exp2_model1_resunet | 0,475250 | 0,291153 | 0,686183 | 0,388375 | 0,677957 |

No se han publicado comparaciones con modelos externos ni resultados en conjuntos de test independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,3 GB para tres modelos) y las arquitecturas empleadas (ConvNeXtV2-Tiny, ResNet-50, ResUNet), la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las variantes con encoder preentrenado; una RTX 3060, RTX 4060 o superior es suficiente para inferencia por lotes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4 GB o más de VRAM.
- Opciones de despliegue: los pesos están en formato `state dict` de PyTorch (`.pth`), por lo que requieren cargar la definición de arquitectura correspondiente (`scratch_resunet.py` o el código equivalente para las variantes preentrenadas) en PyTorch. No se publican pesos en GGUF, ONNX ni safetensors, lo que limita el uso directo con llama.cpp, Ollama o vLLM. Para producción sería necesario exportar a ONNX o TorchScript.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia cualitativa, dentro del propio repositorio la comparativa entre las tres variantes es la siguiente:

| Modelo | Encoder | Preentrenado | val_score | val_dice |
|---|---|---|---|---|
| exp2_model3_fpn_convnextv2_tiny | ConvNeXtV2-Tiny | Sí | 0,723755 | 0,641841 |
| exp2_model2_unet_resnet50 | ResNet-50 | Sí | 0,637161 | 0,502800 |
| exp2_model1_resunet | ResUNet | No | 0,475250 | 0,388375 |

No se dispone de comparación con alternativas externas (por ejemplo, modelos de segmentación de propósito general o detectores de anomalías industriales) en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia, lo que impide determinar si el uso comercial está permitido. Es un riesgo legal relevante para producción.
- Modelo de nicho: entrenado exclusivamente para cuatro tipos de defecto sobre imágenes de 128 x 800 en escala de grises; no generaliza a otras resoluciones, dominios o tipos de defecto sin reentrenamiento.
- Rendimiento moderado: el mejor modelo alcanza un Dice de 0,6418 sobre defectos, lo que deja margen de error considerable en la localización precisa de las máscaras.
- Sin información sobre sesgos: no se documenta la composición del dataset de entrenamiento ni posibles sesgos de dominio (tipo de material, iluminación, cámara).
- Riesgo de alucinación en sentido amplio: como cualquier segmentador, puede producir máscaras espurias en imágenes sin defecto o pasar por alto defectos poco representados en el entrenamiento.
- Sin información sobre el conjunto de test: los resultados publicados son de validación, no de un conjunto de test independiente, por lo que pueden estar optimizados respecto a esos datos.
- Sin pesos en formatos estándar de despliegue (ONNX, GGUF, safetensors): requiere código Python y PyTorch para cargar los modelos, lo que añade fricción a la integración en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ananya009/surface-defect-seg-exp2-t32026
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
