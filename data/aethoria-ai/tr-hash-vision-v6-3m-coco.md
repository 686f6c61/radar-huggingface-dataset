# AETHORIA-AI/TR-HASH-Vision-v6-3M-COCO

## Resumen

TR-HASH-Vision-v6-3M-COCO es un detector de objetos compacto desarrollado por AETHORIA-AI, diseñado para la detección de 80 clases del dataset COCO. Su principal innovación es un mecanismo de enrutamiento por hash que activa dos de cuatro expertos de bajo rango en cada una de las nueve capas enrutadas, combinando una ruta de detector compartida con residuos especializados. Con solo 2,85 millones de parámetros, el modelo busca un equilibrio entre precisión y eficiencia para entornos con recursos limitados.

El modelo se basa en la arquitectura YOLO26n de Ultralytics, modificada con un sistema de mezcla de expertos (MoE) espacial. El checkpoint publicado corresponde a la época 3 de un entrenamiento planificado de 245 épocas sobre COCO 2017, por lo que las métricas reportadas son intermedias y no representan el rendimiento final esperado. La licencia AGPL-3.0 y la derivación de los pesos oficiales de YOLO26n condicionan su uso.

Este proyecto es relevante porque explora una vía poco habitual en detección de objetos: aplicar MoE con enrutamiento por hash a un modelo ya compacto, reduciendo el coste computacional sin sacrificar la capacidad de especialización por regiones espaciales. Sin embargo, al ser un checkpoint en desarrollo, su utilidad práctica actual es limitada y requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n modificada con enrutamiento por hash y mezcla de expertos (MoE) |
| Parametros totales | 2.868.520 (2,85 M) |
| Parametros activos | No especificado (2 de 4 expertos activos por capa enrutada) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (model.safetensors) y PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo parte de los pesos oficiales de Ultralytics YOLO26n preentrenados en Objects365. Sobre esa base, se incorporan nueve capas enrutadas donde cada capa utiliza dos ranuras de hash espacial independientes para activar exactamente dos de los cuatro expertos de bajo rango disponibles. La ruta de detección compartida permanece activa para todas las características, mientras que los residuos de los expertos se especializan durante el refinamiento en COCO. Este diseño pretende capturar dependencias espaciales locales sin aumentar significativamente el número de parámetros.

El entrenamiento se realiza sobre COCO 2017 a resolución 640 píxeles, con el optimizador MuSGD, entrenamiento distribuido en 8 GPUs y un tamaño de lote global de 192. La configuración de expertos es de 4 expertos con selección top-2, y el programa de entrenamiento está fijado en 245 épocas. El checkpoint publicado corresponde al mejor resultado tras la época 3, con métricas de validación intermedias. No se mencionan técnicas como aumento de datos específico, regularización adicional o ajuste fino con RLHF/DPO.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica objetos en las 80 clases de COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Enrutamiento por hash espacial: el mecanismo MoE permite que diferentes regiones de la imagen activen distintos expertos, lo que podría mejorar la especialización en áreas con características visuales diversas.
- Eficiencia computacional: con solo 2,85 M de parámetros, el modelo es significativamente más ligero que los detectores estándar, lo que facilita su despliegue en dispositivos con recursos limitados.
- Integración con Ultralytics: se puede cargar y ejecutar mediante la API YOLO estándar, lo que simplifica su uso en pipelines existentes.
- No se reportan capacidades de generación de texto, tool calling, agentes, razonamiento multimodal ni soporte multilingüe, al ser un modelo puramente visual.

## Casos de uso

- Vigilancia perimetral en tiempo real: el pequeño tamaño del modelo permite ejecutarlo en cámaras IP o dispositivos embebidos para detectar intrusos, vehículos o paquetes en áreas vigiladas, con una latencia baja gracias a sus 2,85 M de parámetros.
- Inventario automatizado en almacenes: integrado en un sistema de visión por computador, puede contar y clasificar productos en estanterías o cintas transportadoras, ayudando a actualizar stocks sin intervención manual.
- Conteo de personas en espacios públicos: desplegado en un servidor ligero o en el borde, permite estimar aforos en tiendas, estaciones o eventos, alertando cuando se superan umbrales de ocupación.
- Detección de defectos en líneas de fabricación: tras un ajuste fino con datos propios, el modelo puede identificar piezas dañadas o mal ensambladas en tiempo real, reduciendo costes de inspección manual.
- Prototipado rápido de aplicaciones de visión: su integración con Ultralytics y su tamaño reducido lo hacen adecuado para validar conceptos de detección en entornos de desarrollo antes de escalar a modelos más grandes.
- Análisis de imágenes médicas básicas: aunque no está especializado, podría utilizarse como detector genérico de objetos en radiografías o ecografías para localizar estructuras anatómicas, siempre que se valide su precisión en el dominio clínico.

## Benchmarks y rendimiento

El modelo reporta métricas de validación intermedias correspondientes a la época 3 de entrenamiento, no resultados finales. No se han publicado comparaciones con otros detectores en la información disponible.

| Metrica | Valor |
|---|---|
| Precision | 0.4566 |
| Recall | 0.3170 |
| mAP50 | 0.3116 |
| mAP50-95 | 0.2006 |

Estos valores son claramente inferiores a los de detectores comerciales como YOLO11n o YOLO26n (que suelen superar 0.40 en mAP50-95), pero deben interpretarse como un checkpoint temprano de un entrenamiento aún en curso. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

No se especifican requisitos oficiales de hardware en la documentación proporcionada. No obstante, por el tamaño de los pesos (2,85 M de parámetros, aproximadamente 11 MB en FP32), se puede inferir que:

- La VRAM necesaria para inferencia es mínima, inferior a 1 GB en FP32 y aún menor en FP16 o cuantizado.
- Es viable en GPUs de consumo como RTX 3060, RTX 4090, e incluso en CPUs modernas con OpenVINO o TensorRT.
- Para entrenamiento, el autor indica uso de 8 GPUs con batch global 192, lo que sugiere que el entrenamiento distribuido es necesario para alcanzar el rendimiento objetivo.
- Las opciones de despliegue incluyen la API de Ultralytics (YOLO), así como posibles conversiones a ONNX, TensorRT o formatos para edge (TFLite, CoreML) mediante las herramientas estándar de Ultralytics.
- No se reportan latencias ni throughput medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El autor no publica resultados comparativos, y el checkpoint es intermedio. Modelos como YOLO11n o YOLO26n de Ultralytics son alternativas naturales, pero no hay datos de rendimiento final de TR-HASH-Vision-v6-3M-COCO para contrastar.

## Limitaciones y advertencias

- Checkpoint intermedio: el modelo publicado corresponde a la época 3 de 245, por lo que su rendimiento real está muy por debajo del esperado tras el entrenamiento completo. No debe usarse en producción sin validación exhaustiva.
- Métricas bajas: con mAP50 de 0.31 y mAP50-95 de 0.20, la precisión es insuficiente para la mayoría de aplicaciones reales de detección de objetos.
- Licencia AGPL-3.0: cualquier uso comercial o distribución del modelo o de sus derivados obliga a publicar el código fuente de la aplicación que lo integra, lo que puede ser restrictivo para proyectos propietarios.
- Sesgos del dataset COCO: el modelo hereda los sesgos de COCO (distribución de clases, condiciones de iluminación, perspectivas), que pueden no generalizar bien a dominios específicos sin ajuste fino.
- Riesgo de alucinación: aunque es un modelo de visión, puede generar falsos positivos o clasificaciones erróneas, especialmente en imágenes con oclusiones, baja resolución o clases poco representadas.
- Sin cuantizaciones disponibles: no se ofrecen versiones cuantizadas, lo que puede limitar el despliegue en hardware muy restringido.
- Documentación incompleta: no se detallan hiperparámetros de entrenamiento más allá de los básicos, ni se proporcionan análisis de errores o estudios de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AETHORIA-AI/TR-HASH-Vision-v6-3M-COCO
- Repositorio del framework (mencionado en la model card): https://github.com/Complexity-ML/complexity-framework
