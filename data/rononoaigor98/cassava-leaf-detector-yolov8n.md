# RononoaIgor98/cassava-leaf-detector-yolov8n

## Resumen

El modelo `cassava-leaf-detector-yolov8n` es un detector de objetos de una sola clase desarrollado por RononoaIgor98 que localiza hojas de yuca (cassava) en imágenes de campo mediante cajas delimitadoras. Está basado en la arquitectura YOLOv8n (nano) de Ultralytics, una red neuronal convolucional de una sola etapa optimizada para inferencia en tiempo real y despliegue en dispositivos con recursos limitados. El modelo fue entrenado como paso de detección ("dónde está") para un sistema de visión por computador orientado a problemas del mundo real en África, con el objetivo de funcionar offline en entornos de borde.

El modelo se entrenó sobre el dataset "Cassava Leaf Detector" v3 de Roboflow (535 imágenes, partición 70/20/10) durante 50 épocas con un tamaño de imagen de 640 píxeles, batch de 16 y optimizador AdamW, en una GPU Tesla T4 de Kaggle. Los resultados sobre un split de test independiente de 53 imágenes muestran un mAP@50 de 0.952 y un mAP@50-95 de 0.841, superando ligeramente al modelo de referencia (~0.944). Su licencia CC-BY-4.0 permite uso comercial con atribución, y su tamaño reducido lo hace adecuado para aplicaciones de visión en tiempo real en agricultura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (nano) - detector de objetos de una sola etapa basado en CNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (el codigo de uso referencia `best.pt`, probablemente PyTorch) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8n, la variante más ligera de la familia YOLOv8 de Ultralytics. Se trata de un detector de una sola etapa que predice directamente cajas delimitadoras y probabilidades de clase sobre una cuadrícula de la imagen de entrada. La versión nano reduce el número de capas y canales respecto a las variantes mayores, lo que la hace especialmente rápida y eficiente para despliegue en dispositivos de bajo consumo.

El entrenamiento se realizó sobre el dataset "Cassava Leaf Detector" v3 de Roboflow, compuesto por 535 imágenes de campo con anotaciones de hojas de yuca. Se utilizó una partición 70/20/10 para entrenamiento, validación y test, respectivamente. El modelo se inicializó con pesos preentrenados en COCO y se ajustó durante 50 épocas con un tamaño de imagen de 640x640, batch de 16, optimizador AdamW y early stopping con paciencia de 10 épocas. El hardware de entrenamiento fue una GPU Tesla T4 de Kaggle, completando el proceso en aproximadamente 4 minutos. No se menciona el uso de técnicas de aumento de datos adicionales ni de RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Detección de objetos de una sola clase: localiza hojas de yuca (`cassava_leaf`) en imágenes de campo, devolviendo cajas delimitadoras.
- Inferencia rápida: el autor indica tiempos de inferencia de un solo dígito en milisegundos, adecuados para aplicaciones en tiempo real.
- Despliegue en borde: al ser un modelo nano, puede ejecutarse en dispositivos con recursos limitados (Raspberry Pi, Jetson Nano, etc.).
- Integración con Ultralytics: compatible con el ecosistema YOLO, incluyendo exportación a formatos como ONNX, TensorRT o CoreML.
- No clasifica enfermedades: solo detecta la ubicación de las hojas, no su estado de salud.

## Casos de uso

- Monitoreo de cultivos de yuca: el modelo puede integrarse en drones o cámaras fijas para contar hojas y estimar la densidad del follaje, ayudando a los agricultores a evaluar el crecimiento del cultivo.
- Agricultura de precisión: al localizar hojas individuales, sirve como base para sistemas que posteriormente clasifican enfermedades o plagas, reduciendo el área de análisis.
- Sistemas de alerta temprana: combinado con un clasificador de enfermedades, permite detectar brotes en etapas iniciales al identificar hojas sospechosas en imágenes de campo.
- Investigación agronómica: facilita la anotación automática de grandes conjuntos de imágenes de yuca, acelerando estudios sobre fenotipado o respuesta a tratamientos.
- Aplicaciones móviles para agricultores: al ser ligero, puede ejecutarse en smartphones para dar asistencia en campo sin conexión a internet.
- Automatización de inventarios en invernaderos: en entornos controlados, el modelo puede contar hojas para estimar biomasa o programar riegos y fertilizantes.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre un split de test independiente de 53 imágenes no vistas durante el entrenamiento:

| Metrica | Valor |
|---|---|
| mAP@50 | 0.952 |
| mAP@50-95 | 0.841 |
| Precision | 0.887 |
| Recall | 0.922 |

Estos valores superan ligeramente al modelo de referencia del dataset (mAP@50 ~0.944), a pesar de ser una variante nano entrenada en solo 4 minutos. No se proporcionan comparaciones con otros modelos de detección de hojas en la información disponible.

## Requisitos de hardware

- Al ser un modelo YOLOv8n, su huella de memoria es reducida, aunque no se especifican requisitos exactos de VRAM en la documentación.
- El autor indica que es adecuado para inferencia en tiempo real y despliegue en borde, con tiempos de inferencia de un solo dígito en milisegundos.
- Puede ejecutarse en CPU, aunque para velocidades óptimas se recomienda una GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA Jetson Nano, GTX 1050 Ti o superior).
- Compatible con el framework Ultralytics, que permite exportar a ONNX, TensorRT, CoreML y TFLite para despliegue en diferentes plataformas.
- No se proporcionan datos de latencia o throughput específicos más allá de la afirmación cualitativa del autor.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa cuantitativa con otros modelos de detección de hojas de yuca. El único punto de referencia mencionado es el modelo original del dataset de Roboflow, que alcanza un mAP@50 de ~0.944, ligeramente inferior al de este modelo. Se recomienda consultar el repositorio de Ultralytics para comparar con otras variantes de YOLOv8 (s, m, l, x) si se desea escalar el modelo.

## Limitaciones y advertencias

- El modelo solo detecta la ubicación de las hojas, no clasifica enfermedades ni plagas. Para diagnóstico completo se necesita un clasificador adicional.
- El conjunto de entrenamiento es reducido (535 imágenes), lo que puede limitar la generalización a condiciones de campo muy diversas (iluminación, ángulos, variedades de yuca).
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de un solo dataset, podría tener un rendimiento inferior en regiones o variedades no representadas.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original y al dataset (lightsout en Roboflow).
- No se especifican métricas de robustez ante oclusiones, condiciones climáticas adversas o imágenes de baja resolución.
- El modelo fue entrenado en 2026, por lo que su rendimiento en hardware actual puede variar; se recomienda validar en el entorno de despliegue objetivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/RononoaIgor98/cassava-leaf-detector-yolov8n)
- [Dataset Cassava Leaf Detector v3 en Roboflow](https://universe.roboflow.com/lightsout/cassava-leaf-detector)
- [Documentación de Ultralytics YOLOv8](https://docs.ultralytics.com/models/yolov8)
- [Repositorio de Ultralytics YOLOv8 en Hugging Face](https://huggingface.co/Ultralytics/YOLOv8)
