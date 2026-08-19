# LeeRowland1996/hand-ils-yolo26n-rvc2

## Resumen

El modelo `hand-ils-yolo26n-rvc2` es un detector de objetos basado en la arquitectura YOLOv26n, desarrollado por LeeRowland1996 (Samuel Edwards) como parte de un proyecto de tesis de MSc en Data Science and Artificial Intelligence en la Queen Mary University of London. El modelo forma parte del sistema Hand-ILS (Instrument Landing System), un dispositivo wearable de computación en el borde diseñado para ayudar a personas ciegas o con discapacidad visual a localizar y recuperar objetos cotidianos.

El modelo está optimizado para inferencia de baja latencia en hardware de borde, concretamente para el VPU Myriad X del dispositivo Luxonis OAK-D Lite. Detecta seis clases de objetos: taza, botella, smartphone, funda de auriculares, manilla de puerta y bastón plegado. El repositorio incluye los pesos compilados, el dataset de entrenamiento completo y un conjunto de imágenes de estrés para pruebas en condiciones reales. Su licencia MIT permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv26n (deteccion de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (compilado para VPU Myriad X, formato rvc2) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | rvc2 (archivo `best.rvc2.tar.xz`), tambien `weights.zip` |

## Arquitectura y entrenamiento

El modelo se basa en YOLOv26n, la variante nano de la familia YOLO26 de Ultralytics, publicada en enero de 2026. YOLO26 introduce inferencia end-to-end nativa, una cabeza de deteccion mas ligera y un recipe de entrenamiento actualizado, logrando entre 40.9 y 57.5 mAP en COCO segun la escala del modelo. La variante nano esta disenada para despliegue en dispositivos de bajo consumo.

El entrenamiento consistio en un fine-tuning sobre un dataset propio y de codigo abierto, que se incluye completo en el repositorio (`Full Dataset.zip`). No se especifican el numero de imagenes, epocas ni el proceso de aumento de datos. El modelo fue compilado para el VPU Myriad X del OAK-D Lite, lo que implica cuantizacion y optimizacion especifica para ese hardware. No se menciona el uso de RLHF ni tecnicas de alineacion, al tratarse de un modelo de vision.

## Capacidades

- Deteccion de objetos en tiempo real de 6 clases especificas: taza, botella, smartphone, funda de auriculares, manilla de puerta y baston plegado.
- Inferencia de baja latencia optimizada para dispositivos de borde (VPU Myriad X).
- Capacidad de funcionar en condiciones de iluminacion y angulos de captura variados, segun el conjunto de pruebas `test_2_expanded.zip`.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, al ser exclusivamente un modelo de vision.
- No se especifican capacidades multilingues ni de generacion de texto.

## Casos de uso

- Asistencia para personas con discapacidad visual en entornos domesticos: el modelo puede integrarse en un wearable que detecte objetos como tazas, botellas o smartphones y guie al usuario mediante retroalimentacion auditiva o tactil.
- Navegacion en interiores: la deteccion de manillas de puerta permite localizar salidas o accesos en edificios desconocidos.
- Recuperacion de objetos personales: el sistema puede alertar al usuario cuando un objeto de interes (por ejemplo, el baston plegado) esta dentro del campo de vision de la camara.
- Pruebas de accesibilidad en productos de consumo: el modelo puede servir como base para evaluar la detectabilidad de objetos en entornos reales con iluminacion variable.
- Investigacion academica en computacion en el borde: el repositorio incluye el dataset completo y los pesos compilados, lo que permite reproducir experimentos o fine-tuning adicional.
- Desarrollo de sistemas de asistencia en movilidad: combinado con otros sensores, el modelo puede contribuir a la deteccion de obstaculos u objetos relevantes en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de mAP, precision, recall ni latencia especifica del modelo fine-tuneado. El repositorio incluye un conjunto de imagenes de estres (`test_2_expanded.zip`) para evaluacion en condiciones reales, pero no se comparten los resultados numericos.

## Requisitos de hardware

- El modelo esta compilado para el VPU Myriad X del dispositivo Luxonis OAK-D Lite, por lo que se ejecuta en ese hardware especifico.
- No se indican requisitos de VRAM para GPU de proposito general, ya que el formato rvc2 esta pensado para el OAK-D.
- No se especifican GPUs recomendadas ni opciones de despliegue en vLLM, llama.cpp u otros motores de inferencia.
- La latencia y el throughput dependen del dispositivo OAK-D Lite; no se proporcionan cifras concretas.
- Para uso en otros dispositivos, seria necesario exportar el modelo a formatos como ONNX o TensorRT, pero no se documenta ese proceso en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo es un fine-tuning de YOLOv26n, por lo que su rendimiento base deberia ser similar al de otros YOLO nano (como YOLOv8n o YOLOv5n), pero no se han publicado metricas especificas de este modelo. No se puede establecer una comparacion cuantitativa fiable sin datos de benchmarks.

## Limitaciones y advertencias

- El modelo solo detecta 6 clases fijas; no es un detector generalista y no reconocera objetos fuera de ese conjunto.
- No se han publicado evaluaciones de sesgos ni de robustez ante condiciones extremas (lluvia, niebla, oclusiones severas). El conjunto de pruebas sugiere variabilidad de iluminacion y angulo, pero no se documentan resultados.
- Riesgo de falsos positivos o negativos en entornos no representados en el dataset de entrenamiento, especialmente en espacios exteriores o con objetos similares a las clases objetivo.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantias. El autor no proporciona soporte ni actualizaciones.
- El formato de pesos rvc2 esta ligado al hardware OAK-D; su reutilizacion en otras plataformas requiere conversion y posible perdida de precision.
- No se especifican restricciones de uso mas alla de la licencia MIT, pero al ser un proyecto academico, podria haber limitaciones eticas en aplicaciones de asistencia medica o de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LeeRowland1996/hand-ils-yolo26n-rvc2
- Perfil del autor: https://huggingface.co/LeeRowland1996
- Documentacion de YOLO26 de Ultralytics: https://docs.ultralytics.com/models/yolo26
- Plataforma de modelos YOLO26: https://platform.ultralytics.com/leaf/yolo26
- Codigo fuente de YOLO26 en GitHub: https://github.com/ultralytics/ultralytics/blob/main/docs/en/models/yolo26.md
