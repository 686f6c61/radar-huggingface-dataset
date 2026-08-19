# chanubc/robot-kitchen-nadir-yolo11s

## Resumen

El modelo `chanubc/robot-kitchen-nadir-yolo11s` es un detector de objetos basado en YOLO11s, ajustado específicamente para el simulador de seguridad de robots de cocina `whatslung/robot-kitchen-safety-sim`. Su propósito es detectar personas, fuego, humo, robots, hervidores y equipamiento en imágenes generadas sintéticamente por un renderizador Babylon.js, capturadas desde una cámara ortográfica nadir (vista cenital sin perspectiva). El modelo forma parte de una cadena de procesamiento que incluye detección, seguimiento, predicción de trayectorias y decisiones de seguridad.

La relevancia de este modelo reside en su uso como componente de investigación para sistemas de seguridad robótica en entornos simulados. Está entrenado exclusivamente con datos sintéticos y, como advierte su autor, no se transfiere a imágenes reales (el recall de personas cae de 0,871 en el dominio simulado a 0,048 en un conjunto de prueba real). Está disponible en formato PyTorch (`.pt`) y ONNX (`.onnx`), con una licencia AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (red neuronal convolucional de una sola etapa) |
| Parametros totales | 9,4 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos) |
| Tipos de cuantizacion | no disponible (se distribuye en precision completa; no se especifican cuantizaciones) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`), ONNX (`.onnx`, opset 12) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO11s, una red convolucional de una sola etapa diseñada para detección de objetos en tiempo real. Se parte de los pesos preentrenados `yolo11s.pt` (entrenados en COCO) y se realiza un ajuste fino (fine-tuning) con datos sintéticos generados por el simulador de cocina robótica. El dataset de entrenamiento consta de 200 imágenes sintéticas (160 para entrenamiento, 40 para validación), con 316 instancias de la clase "person". La cámara utilizada es una proyección ortográfica nadir (sin perspectiva), lo que implica que el tamaño de los objetos es uniforme en todo el fotograma, con una resolución de 107,9 píxeles por metro.

El entrenamiento se realizó con un tamaño de imagen de 640 píxeles, 100 épocas (con parada temprana en la época 54), paciencia de 20, semilla 42 y tamaño de lote automático, utilizando Ultralytics 8.4.121 y PyTorch 2.11.0+cu128. No se aplicaron técnicas de RLHF ni DPO; el ajuste se limita a la supervisión clásica con datos etiquetados. Una característica destacable es que el modelo solo funciona bajo el supuesto de proyección ortográfica, lo que lo hace inadecuado para cámaras con perspectiva normal.

## Capacidades

- Detección de objetos en imágenes sintéticas de un simulador de cocina robótica, con seis clases fijas: `person`, `fire`, `smoke`, `robot`, `kettle` y `equipment`.
- Rendimiento sólido dentro del dominio simulado: recall de personas de 0,871 y mAP50 global de 0,931 en el conjunto de validación sintético.
- Inferencia rápida: 6,3 ms por imagen en una RTX 5070 y 29 ms en CPU.
- Compatible con el ecosistema Ultralytics (entrenamiento, exportación, despliegue) y con ONNX Runtime (opset 12, compatible con ort-web para navegador).
- Diseñado para integrarse en un pipeline de detección → seguimiento → predicción de trayectorias → evaluación de seguridad → control del robot.

## Casos de uso

- Investigación en predicción de trayectorias de personas en entornos de cocina simulados: el modelo proporciona detecciones fiables en el dominio sintético, lo que permite estudiar algoritmos de predicción de movimiento sin necesidad de datos reales.
- Desarrollo de sistemas de seguridad para robots de cocina en simulación: al detectar fuego, humo y personas, puede activar protocolos de seguridad en el simulador antes de implementarlos en hardware real.
- Evaluación de algoritmos de seguimiento (por ejemplo, ByteTrack): las detecciones sintéticas permiten probar y ajustar parámetros de seguimiento, como el umbral de activación de pistas, en un entorno controlado.
- Generación de datos etiquetados para destilación de conocimiento: el autor menciona que se utilizó para destilar un modelo YOLO hacia un estudiante que alcanzó un recall de 0,491 en imágenes reales, partiendo de 0,048.
- Prototipado de sistemas de monitoreo de seguridad en entornos simulados: sirve como banco de pruebas para algoritmos de visión antes de migrar a soluciones basadas en RF-DETR u otros modelos con mejor transferencia a datos reales.
- Docencia e investigación en visión por computador y robótica: permite a estudiantes e investigadores experimentar con detección de objetos en un dominio sintético controlado, sin necesidad de infraestructura de captura de vídeo real.

## Benchmarks y rendimiento

El autor proporciona métricas detalladas en el conjunto de validación sintético (40 imágenes) y una comparación con el modelo base YOLO11s sin ajuste. También se incluye una evaluación de transferencia a imágenes reales.

| Clase | Precision | Recall | mAP50 | mAP50-95 |
|---|---|---|---|---|
| person | 0,872 | 0,871 | 0,874 | 0,512 |
| fire | 1,000 | 0,596 | 0,906 | 0,372 |
| smoke | 0,930 | 0,950 | 0,936 | 0,759 |
| robot | 0,849 | 1,000 | 0,995 | 0,735 |
| kettle | 0,984 | 1,000 | 0,995 | 0,885 |
| equipment | 0,827 | 0,842 | 0,878 | 0,665 |
| **Global** | 0,910 | 0,876 | **0,931** | 0,655 |

En la misma validación sintética, el YOLO11s stock (sin ajuste) obtuvo una precisión de 0,175 y un recall de 0,374 para la clase person, con frecuentes falsos positivos de equipamiento como persona.

La transferencia a imágenes reales es deficiente: en un conjunto de prueba real de 137 imágenes (Roboflow `overhead-person-szky0` v3), el recall de personas fue de **0,048**. En comparación, RF-DETR (con backbone DINOv2) alcanzó 0,411 en las mismas condiciones, y un modelo YOLO destilado desde RF-DETR mejoró hasta 0,491.

## Requisitos de hardware

- Inferencia en CPU: 29 ms por imagen (sin especificar modelo de CPU).
- Inferencia en GPU: 6,3 ms por imagen en una RTX 5070 (arquitectura sm_120).
- VRAM estimada: con 9,4 millones de parámetros, el modelo en FP32 ocupa aproximadamente 37 MB (según el tamaño del archivo ONNX). Cabe en cualquier GPU moderna, incluidas las integradas de gama media.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM (GTX 1050 Ti o superior). Para máxima velocidad, se recomienda una GPU de la serie RTX 30 o 40.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime (incluido el runtime web `ort-web`), exportación a TensorRT, CoreML o TFLite.
- Latencia: 6,3 ms en GPU y 29 ms en CPU, suficiente para aplicaciones en tiempo real en el dominio simulado.

## Comparativa con modelos similares

| Modelo | Parametros | Recall persona (sim) | Recall persona (real) | Licencia | Notas |
|---|---|---|---|---|---|
| robot-kitchen-nadir-yolo11s (este) | 9,4 M | 0,871 | 0,048 | AGPL-3.0 | Entrenado solo con datos sintéticos, cámara ortográfica |
| YOLO11s stock (COCO) | 9,4 M | 0,374 | no disponible | AGPL-3.0 | No ajustado, falsos positivos frecuentes |
| RF-DETR (DINOv2 backbone) | no disponible | no disponible | 0,411 | Apache-2.0 | Mejor transferencia a imágenes reales, recomendado por el autor |
| YOLO destilado desde RF-DETR | no disponible | no disponible | 0,491 | no disponible | Resultado de destilación de conocimiento, mejora significativa |

## Limitaciones y advertencias

- **No funciona con imágenes reales**: el recall de personas cae a 0,048 en un conjunto de prueba real. Está diseñado exclusivamente para el simulador y no debe usarse en producción con cámaras reales.
- **Supuesto de proyección ortográfica**: asume que el tamaño de los objetos es constante en toda la imagen. En cámaras con perspectiva normal (como CCTV), este supuesto se rompe y el rendimiento se degrada.
- **Clases fijas**: el orden de las clases está fijado y no debe cambiarse; cualquier modificación requiere reentrenamiento.
- **Licencia AGPL-3.0**: el uso comercial implica la obligación de publicar el código fuente de las modificaciones y de la aplicación que lo integra. El autor sugiere considerar RF-DETR (Apache-2.0) si se necesita evitar esta restricción.
- **Riesgo de alucinaciones y falsos positivos**: en el dominio simulado, la clase "equipment" tiene una precisión de 0,827, lo que indica posibles confusiones. En el modelo stock, los falsos positivos eran frecuentes.
- **Datos de entrenamiento limitados**: solo 200 imágenes sintéticas, lo que limita la generalización incluso dentro del simulador si se cambian las condiciones de iluminación o los objetos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/chanubc/robot-kitchen-nadir-yolo11s)
- [Repositorio del simulador robot-kitchen-safety-sim](https://github.com/whatslung/robot-kitchen-safety-sim)
- [Documento de evaluación de detección (en coreano)](https://github.com/whatslung/robot-kitchen-safety-sim/blob/main/docs/chanwoo/detection-eval.md)
- [Modelo relacionado: overhead-person-yolo11](https://huggingface.co/chanubc/overhead-person-yolo11)
- [YOLO11s en Ultralytics Platform](https://platform.ultralytics.com/zheng-chen/yolo11/yolo11s)
