# Samyukta31/sonar_yolo

## Resumen

SONARINTEL es un modelo de detección de objetos basado en YOLO11M, desarrollado por Samyukta31, diseñado para identificar objetos y anomalías submarinas en imágenes de sonar de barrido lateral (side-scan sonar). El modelo resuelve el problema de la inspección automatizada de residuos marinos, redes de pesca fantasma, pecios, tuberías submarinas y contactos con características de mina. Es relevante para aplicaciones de monitorización marina, arqueología subacuática y seguridad portuaria. La arquitectura es YOLO11M, con entrada de 640×640 píxeles y 5 clases de objetos. El repositorio tiene un tamaño de 0.3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11M |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 y FP16 (variantes ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | .pt (PyTorch) y .onnx |

## Arquitectura y entrenamiento

YOLO11M es una arquitectura de detección de objetos basada en redes neuronales convolucionales, perteneciente a la familia YOLO de Ultralytics. El modelo fue entrenado con el framework Ultralytics YOLO, versión 8.4.142, en el experimento denominado EXP-01. No se han proporcionado detalles sobre el conjunto de datos de entrenamiento (número de imágenes, composición del dataset ni procedencia). Al tratarse de un modelo de visión, no se aplican técnicas de RLHF o DPO. La innovación técnica principal es el uso de YOLO11, la generación más reciente de Ultralytics, que incorpora mejoras en eficiencia computacional y precisión respecto a versiones anteriores.

## Capacidades

- Deteccion de objetos en imagenes de sonar de barrido lateral, con 5 clases especificas: `crab_pot`, `submarine_pipeline`, `shipwreck`, `ghost_net` y `mine_like_contact`.
- Inferencia con entrada de 640×640 píxeles, optimizada para imágenes de sonar.
- Soporte de exportacion a ONNX en precision FP32 y FP16, lo que permite su despliegue en entornos compatibles con ONNX Runtime.
- Integracion con el framework Ultralytics YOLO para inferencia y desarrollo posterior.
- No soporta tool calling, function calling, agentes ni capacidades multilingues, al ser un modelo especifico de vision.
- Capacidad especial: deteccion de anomalias submarinas y residuos marinos en imagenes de sonar.

## Casos de uso

- Inspeccion de tuberias submarinas: el modelo detecta la clase `submarine_pipeline`, permitiendo localizar tramos de tuberia en imagenes de sonar para planificar mantenimiento o detectar danos.
- Deteccion de redes de pesca fantasma: la clase `ghost_net` facilita la identificacion de redes abandonadas, apoyando operaciones de limpieza oceanica y conservacion marina.
- Arqueologia subacuatica: la clase `shipwreck` permite localizar pecios en fondos marinos, siendo util para estudios historicos y arqueologicos.
- Gestion pesquera: la clase `crab_pot` ayuda a monitorizar la ubicacion de nasas para cangrejos, optimizando rutas de recogida y reduciendo perdidas.
- Vigilancia de seguridad portuaria: la clase `mine_like_contact` permite alertar sobre contactos con caracteristicas de mina, aunque debe usarse como apoyo a la decision humana y no como confirmacion.
- Analisis de residuos marinos: el modelo puede emplearse para generar inventarios de residuos y anomalias en campanas de estudio oceanografico, automatizando el analisis de grandes volumenes de imagenes de sonar.

## Benchmarks y rendimiento

El autor reporta las siguientes metricas de validacion obtenidas con el mejor modelo (basadas en mAP@50–95):

| Metrica | Valor |
|---|---|
| Precision | 0.8275 |
| Recall | 0.7286 |
| mAP@50 | 0.6736 |
| mAP@50–95 | 0.5816 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- No se han proporcionado requisitos de hardware especificos en la informacion disponible.
- Al tratarse de un modelo YOLO11M, se espera que sea ligero, pero se recomienda consultar la documentacion de Ultralytics para estimaciones de VRAM y GPU recomendadas.
- Opciones de despliegue: inferencia con Ultralytics YOLO (PyTorch) y ONNX Runtime para los formatos `best_fp32.onnx` y `best_fp16.onnx`.
- No aplican vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de vision y no de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se ha proporcionado informacion sobre modelos comparables en la misma categoria (deteccion de objetos en sonar de barrido lateral) en los datos disponibles. No disponible.

## Limitaciones y advertencias

- El rendimiento puede variar significativamente segun las caracteristicas del sensor de sonar, las condiciones de adquisicion, la resolucion, la batimetria del fondo marino y la distribucion de objetos en el entorno real.
- La clase `mine_like_contact` representa contactos con caracteristicas similares a minas y no debe interpretarse como confirmacion de la presencia de un artefacto explosivo real.
- El modelo no debe utilizarse como unica base para decisiones criticas de seguridad, navegacion o manejo de artefactos explosivos.
- La licencia del modelo no esta especificada, por lo que no se puede confirmar si permite uso comercial o redistribucion.
- No se han documentado sesgos especificos, pero al estar entrenado con un conjunto de datos concreto, podria presentar limitaciones frente a tipos de fondo marino o sensores no representados en el entrenamiento.
- La ausencia de informacion sobre el dataset y el proceso de entrenamiento impide evaluar la robustez del modelo ante condiciones adversas.

## Enlaces

- HuggingFace: https://huggingface.co/Samyukta31/sonar_yolo
