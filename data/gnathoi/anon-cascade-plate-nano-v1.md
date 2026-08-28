# gnathoi/anon-cascade-plate-nano-v1

## Resumen

El modelo `anon-cascade-plate-nano-v1`, desarrollado por el usuario `gnathoi`, es un detector de placas de matrícula basado en RF-DETR-Nano, un modelo de detección de objetos ligero de Roboflow, cuyo backbone es DINOv2. Se presenta como el componente de detección de matrículas dentro de un sistema en cascada más amplio: un detector genérico de vehículos proporciona las cajas del vehículo, cada caja se recorta de la imagen a resolución completa, y este modelo analiza la matrícula dentro del recorte. También se puede ejecutar una pasada directa sobre el fotograma completo en paralelo.

El modelo está fine-tuned para una única clase, `license_plate`, y se entrenó sobre el dataset público "License Plate Recognition v13" de Roboflow Universe, con modificaciones de aumento de datos y eliminación de fugas entre entrenamiento y validación. Su licencia es Apache 2.0 para el modelo y el backbone, y CC BY 4.0 para los datos de entrenamiento. Es relevante en el contexto de privacidad y anonimización de imágenes, aunque el autor advierte explícitamente que no constituye una garantía de privacidad.

La información disponible es limitada: no se especifican parámetros totales, longitud de contexto, cuantizaciones, ni resultados de benchmarks cuantitativos. El repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeño, acorde con la variante "Nano". La fecha de creación es agosto de 2026 y no tiene descargas ni valoraciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR-Nano (DETR con backbone DINOv2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 (modelo y backbone), CC BY 4.0 (datos de entrenamiento) |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR-Nano, una arquitectura DETR (Detection Transformer) ligera desarrollada por Roboflow, que utiliza DINOv2 como backbone. DETR trata la detección de objetos como un problema de predicción de conjuntos, eliminando la necesidad de anchors y post-procesamiento NMS tradicional. La variante "Nano" está optimizada para baja latencia y despliegue en dispositivos con recursos limitados.

El entrenamiento consistió en un fine-tuning del clasificador para una única clase (`license_plate`), partiendo de los pesos pre-entrenados de RF-DETR-Nano. El dataset utilizado es "License Plate Recognition v13" de Roboflow Universe, que fue modificado: se deduplicaron aumentos y se eliminaron fugas entre el conjunto de entrenamiento y el de validación. No se menciona el número de épocas, tamaño del dataset ni técnicas como RLHF o DPO, que no son aplicables a un modelo de visión.

## Capacidades

- Detección de placas de matrícula en imágenes, devolviendo cajas delimitadoras con la clase `license_plate`.
- Integración en un pipeline en cascada: recibe recortes de vehículos a resolución completa y detecta la matrícula dentro de ellos.
- Ejecución directa sobre fotogramas completos como alternativa al enfoque en cascada.
- Diseñado para ser ligero (variante "Nano"), apto para inferencia en tiempo real en hardware modesto.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, al ser un modelo puramente visual.

## Casos de uso

- Anonimización de imágenes y vídeo: el modelo detecta matrículas para pixelarlas o difuminarlas automáticamente en imágenes de cámaras de tráfico, cumpliendo normativas de privacidad como el RGPD.
- Control de accesos en aparcamientos: integrado en un sistema de cámaras, detecta la matrícula de vehículos que entran y salen, permitiendo la apertura automática de barreras o el registro de vehículos autorizados.
- Peaje automático: en autopistas, la detección de matrículas permite facturar el peaje sin detener el vehículo, combinando el modelo con un sistema OCR posterior.
- Vigilancia y seguridad perimetral: en instalaciones privadas, el modelo puede alertar sobre vehículos no autorizados detectando sus matrículas en tiempo real.
- Análisis de tráfico y movilidad urbana: conteo de vehículos por matrícula para estudios de flujo, sin almacenar datos personales si se anonimizan inmediatamente.
- Investigación forense: localización de matrículas en imágenes de baja calidad o con oclusiones parciales, como paso previo a un lector OCR especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el recall cae significativamente cuando la placa tiene menos de ~24 píxeles de ancho, y que no se ha medido la tasa de falsos positivos. Tampoco se ha evaluado en imágenes de ojo de pez, a pesar de que está previsto para ese tipo de imágenes.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU recomendadas en la información proporcionada.
- Dado el tamaño del repositorio (0,1 GB) y la arquitectura "Nano", se puede inferir que el modelo es ligero y probablemente ejecutable en GPUs de consumo como RTX 3060 o superiores, así como en CPUs con aceleración ONNX o TensorRT, pero esto no está confirmado.
- Opciones de despliegue: no se mencionan frameworks específicos. Al ser un modelo de detección, es probable que sea compatible con herramientas como Roboflow Inference, ONNX Runtime o TensorRT, pero no hay documentación al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de matrículas con arquitectura DETR ligera). La comparativa no está disponible.

## Limitaciones y advertencias

- El recall se degrada notablemente para placas de menos de ~24 píxeles de ancho, lo que limita su uso en imágenes de baja resolución o con vehículos lejanos.
- No se ha evaluado en imágenes de ojo de pez, que es el escenario previsto, por lo que su rendimiento real en ese contexto es desconocido.
- No se ha medido la tasa de falsos positivos, un dato crítico para aplicaciones de seguridad o anonimización.
- El autor declara explícitamente que "nada aquí es una afirmación de privacidad", es decir, el modelo no garantiza la anonimización completa ni el cumplimiento de normativas.
- La licencia del dataset es CC BY 4.0, que permite uso comercial con atribución, pero la licencia Apache 2.0 del modelo no cubre los datos de entrenamiento; es necesario revisar los términos de Roboflow Universe.
- No hay garantías de soporte ni mantenimiento; el modelo tiene 0 descargas y 0 valoraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gnathoi/anon-cascade-plate-nano-v1
- Dataset de entrenamiento (Roboflow Universe): https://universe.roboflow.com/roboflow-universe-projects/license-plate-recognition-rxg4e
- Repositorio de RF-DETR (Roboflow): no se proporciona enlace directo, pero es referenciado en la model card.
