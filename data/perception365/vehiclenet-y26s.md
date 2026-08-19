# Perception365/VehicleNet-Y26s

## Resumen

VehicleNet-Y26s es un modelo de detección de objetos multi-clase especializado en el reconocimiento fino de tipos de vehículos en escenarios de tráfico real. Desarrollado por Perception365, el modelo se entrena sobre el dataset UVH-26-MV, publicado por el Indian Institute of Science (IISc) de Bangalore, un conjunto de datos diseñado específicamente para el tráfico indio, caracterizado por su alta densidad, heterogeneidad y complejidad visual.

El modelo se basa en la arquitectura Ultralytics/YOLO26, la iteración más reciente de la familia YOLO, y se distribuye en formato ONNX, lo que facilita su despliegue en entornos de inferencia eficiente y computación en el borde (edge computing). El sufijo "Y26s" sugiere una variante pequeña (small) de YOLO26, orientada a un equilibrio entre precisión y velocidad de inferencia.

La relevancia de este modelo radica en su enfoque en un dominio específico y desafiante: el tráfico indio, que presenta una mezcla heterogénea de vehículos motorizados y no motorizados, condiciones de densidad extrema y una variabilidad visual considerable. Esto lo convierte en una herramienta valiosa para sistemas de gestión de tráfico, peajes automáticos y análisis de movilidad en regiones con características similares. El repositorio tiene un tamaño de 0.1 GB y el acceso está restringido (gated), requiriendo aceptación de condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO26 (variante "s", small) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO26 de Ultralytics, la sexta generación de la familia YOLO (You Only Look Once). Aunque los detalles técnicos específicos de YOLO26 no se detallan en la información proporcionada, la familia YOLO se caracteriza por ser detectores de una sola pasada (single-shot) que predicen cajas delimitadoras y clases directamente desde la imagen completa, ofreciendo un equilibrio entre velocidad y precisión. La variante "s" (small) implica una versión reducida del modelo, optimizada para inferencia rápida y despliegue en recursos limitados.

El entrenamiento se realizó sobre el dataset UVH-26-MV, liberado por el IISc Bangalore. Este dataset se centra en el tráfico indio, descrito como altamente desafiante, denso y heterogéneo. El nombre "UVH-26" sugiere 26 clases de vehículos, cubriendo una amplia gama de tipos que incluyen probablemente coches, autobuses, camiones, motocicletas, autorickshaws, bicicletas y otros vehículos propios del contexto indio. No se especifican detalles sobre el número de imágenes, el proceso de anotación o si se emplearon técnicas de aumento de datos, aunque es probable que el dataset incluya anotaciones a nivel de caja delimitadora para cada clase.

No se dispone de información sobre el proceso de entrenamiento específico, como el número de épocas, la configuración de hiperparámetros o si se utilizaron técnicas de pre-entrenamiento y fine-tuning. El modelo se distribuye como un modelo base de Ultralytics/YOLO26 cuantizado, lo que sugiere que se ha aplicado algún proceso de cuantización para reducir el tamaño y acelerar la inferencia, aunque el tipo de cuantización no se especifica.

## Capacidades

- Detección de objetos multi-clase: identifica y localiza hasta 26 tipos de vehículos en imágenes de escenas de tráfico.
- Reconocimiento fino de tipos de vehículo: distingue entre categorías específicas de vehículos, no solo clases genéricas como "coche" o "moto".
- Manejo de escenas densas y heterogéneas: entrenado específicamente para el tráfico indio, con alta densidad de objetos y gran variabilidad visual.
- Inferencia eficiente: formato ONNX, optimizado para despliegue en producción y computación en el borde.
- Integración con Ultralytics: compatible con el ecosistema de Ultralytics para entrenamiento, validación y despliegue.
- Pipeline de object-detection: listo para usar en tareas de detección de objetos sin necesidad de adaptación adicional.

## Casos de uso

- Gestión de tráfico urbano: el modelo puede integrarse en sistemas de cámaras de vigilancia para contar y clasificar vehículos en tiempo real, proporcionando datos sobre densidad de tráfico, composición del parque móvil y detección de congestiones. Su entrenamiento en escenas densas lo hace especialmente adecuado para intersecciones concurridas de ciudades indias o similares.

- Peajes automáticos: en sistemas de cobro electrónico de peajes, el modelo puede clasificar el tipo de vehículo (coche, camión, autobús, moto) para aplicar la tarifa correspondiente automáticamente, reduciendo la necesidad de intervención manual y acelerando el flujo de vehículos.

- Análisis de movilidad y planificación urbana: las autoridades municipales pueden desplegar el modelo en puntos estratégicos de la ciudad para recopilar datos sobre la composición del tráfico (proporción de vehículos privados, transporte público, vehículos de dos ruedas, etc.), información clave para la planificación de infraestructuras y políticas de movilidad.

- Control de accesos en aparcamientos: el modelo puede utilizarse en sistemas de gestión de aparcamientos para detectar y clasificar vehículos que entran y salen, permitiendo una ocupación monitorizada y una facturación basada en el tipo de vehículo.

- Vigilancia y seguridad vial: en combinación con otros sistemas, puede ayudar a detectar vehículos en zonas restringidas, identificar tipos de vehículos implicados en incidentes o monitorizar el cumplimiento de normativas de circulación (por ejemplo, carriles bus).

- Sistemas de asistencia al conductor (ADAS) en entornos complejos: aunque el modelo no está diseñado para conducción autónoma, puede servir como componente de percepción en sistemas de asistencia para vehículos que operan en entornos de tráfico denso y heterogéneo, alertando al conductor sobre la presencia de vehículos de dos ruedas o autorickshaws en ángulos muertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como mAP (mean Average Precision), precisión, recall o F1-score en el dataset UVH-26-MV ni en otros datasets de referencia como COCO o Cityscapes. Tampoco se ofrecen comparativas con otros modelos de detección de vehículos.

## Requisitos de hardware

- El tamaño del repositorio es de 0.1 GB, lo que sugiere un modelo ligero (probablemente en el rango de 10-30 MB en formato ONNX), adecuado para inferencia en CPU.
- Al ser una variante "small" de YOLO26 en formato ONNX, puede ejecutarse en GPUs de consumo como NVIDIA GTX 1660, RTX 3060 o superiores con un uso de VRAM inferior a 2 GB.
- Es viable su despliegue en dispositivos de borde como NVIDIA Jetson Nano, Jetson Orin, Raspberry Pi con acelerador Coral o similares, gracias al formato ONNX y al tamaño reducido.
- Opciones de despliegue: servidores de inferencia como ONNX Runtime, TensorRT, OpenVINO, así como frameworks de despliegue como Ultralytics YOLO, Triton Inference Server o el propio runtime de ONNX.
- La latencia estimada en GPU moderna (RTX 3090 o superior) sería inferior a 5 ms por imagen; en CPU moderna, entre 20-50 ms por imagen, dependiendo de la resolución de entrada. Estas cifras son estimaciones basadas en modelos YOLO de tamaño similar y no han sido verificadas con este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dataset | Licencia | Formato |
|---|---|---|---|---|---|
| VehicleNet-Y26s | no disponible | no aplica | UVH-26-MV (trafico indio) | AGPL-3.0 | ONNX |
| Ultralytics/YOLO26s | no disponible | no aplica | COCO | AGPL-3.0 | PyTorch, ONNX |
| Ultralytics/YOLO11s | ~9.4M | no aplica | COCO | AGPL-3.0 | PyTorch, ONNX |

La comparativa se basa en modelos YOLO de tamaño similar de la propia familia Ultralytics. YOLO11s es un modelo de detección generalista entrenado en COCO, mientras que YOLO26s es la generación más reciente. VehicleNet-Y26s se diferencia por su entrenamiento especializado en el dataset UVH-26-MV, lo que debería proporcionar un mejor rendimiento en escenas de tráfico indio que los modelos generalistas, aunque no se dispone de datos cuantitativos para confirmarlo.

## Limitaciones y advertencias

- Sesgos geograficos: el modelo está entrenado exclusivamente en datos de tráfico indio, por lo que su rendimiento puede degradarse significativamente en escenas de tráfico de otras regiones con diferentes tipos de vehículos, señalización o condiciones de iluminación.
- Riesgo de alucinacion: como cualquier modelo de detección de objetos, puede producir falsos positivos (detectar vehículos donde no los hay) o falsos negativos (no detectar vehículos presentes), especialmente en condiciones adversas de iluminacion, oclusiones o angulos inusuales.
- Cobertura de clases limitada: las 26 clases del dataset UVH-26-MV pueden no cubrir todos los tipos de vehiculos presentes en otras regiones, como camiones articulados, vehiculos agricolas o vehiculos electricos de nueva generacion.
- Licencia AGPL-3.0: esta licencia copyleft tiene implicaciones para uso comercial. Si el modelo se integra en un servicio ofrecido a traves de una red, el codigo fuente del servicio debe ser liberado bajo AGPL-3.0. Esto puede ser un obstaculo para empresas que no quieran abrir su codigo.
- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace, lo que anade una barrera de acceso y puede limitar su uso en entornos corporativos con politicas de descarga automatizada.
- Idioma: el modelo solo soporta ingles en su documentacion, lo que puede ser una limitacion para equipos que trabajen en otros idiomas.
- Sin garantias de rendimiento: al no publicarse benchmarks, no hay evidencia cuantitativa del rendimiento del modelo en su dataset objetivo ni en otros escenarios. Se recomienda realizar una evaluacion propia antes de su uso en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Perception365/VehicleNet-Y26s
- Dataset UVH-26-MV: https://huggingface.co/datasets/iisc-aim/UVH-26
- Modelo base Ultralytics/YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Paper de referencia de VehicleNet (re-identification, no deteccion): https://arxiv.org/abs/2004.06305
- Coleccion de modelos de re-identificacion de vehiculos: https://github.com/layumi/Vehicle_reID-Collection
