# Blaize-AI/YOLOPOSE26n_COCOKeypoint

## Resumen

YOLO26n-pose es un modelo de estimación de pose (detección de keypoints) derivado de la familia Ultralytics YOLO, en su variante nano de la versión 26. El modelo original se entrena en PyTorch y detecta puntos clave del cuerpo humano sobre imágenes, devolviendo las coordenadas de las articulaciones junto con las cajas delimitadoras de las personas. Esta versión concreta ha sido optimizada por Blaize para ejecutarse sobre sus aceleradores de inferencia Xplorer mediante el SDK Picasso, que compila los grafos de cómputo para el procesador de flujo de grafos (GSP) de la compañía.

El interés de esta publicación no reside en el modelo en sí, sino en el formato de despliegue: los pesos se distribuyen como ficheros `.bm` (Blaize Model) en variantes de cuantización INT8, BF16 y AMP, con resoluciones de entrada de 640×384 y 640×640. Esto lo convierte en una pieza pensada para inferencia en el borde (edge AI), no para servidores GPU convencionales. No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica, es un modelo de visión) ni los idiomas soportados (tampoco aplica).

La licencia es AGPL-3.0, heredada del modelo original de Ultralytics, lo que impone obligaciones relevantes para uso comercial en red. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los artefactos binarios no están efectivamente alojados o que el repo está vacío o pendiente de publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo YOLO (familia Ultralytics YOLO26, variante nano); no se especifica el detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | INT8, BF16, AMP (mezcla INT8 + BF16) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (Blaize Model), compilado para GSP; no se distribuyen safetensors ni GGUF |
| Resoluciones de entrada | 640×384 y 640×640 (dos variantes) |
| Tarea | Estimación de pose / detección de keypoints (COCO Keypoints) |
| Dataset de entrenamiento | COCO Keypoints 2017 (CC-BY-4.0) |
| Framework original | PyTorch (Ultralytics) |
| Hardware objetivo | Blaize Xplorer AI accelerator (GSP) |

## Arquitectura y entrenamiento

El modelo es una red convolucional de la familia YOLO en su variante nano, especializada en estimación de pose. La arquitectura concreta de YOLO26 no está detallada en la información proporcionada; solo se indica que el modelo original se entrena en PyTorch y proviene del repositorio de Ultralytics. La salida típica de esta familia combina cajas delimitadoras de personas con un conjunto de keypoints (las 17 articulaciones del estándar COCO) y sus niveles de confianza.

El entrenamiento se realizó sobre COCO Keypoints 2017, un dataset anotado con keypoints humanos bajo licencia CC-BY-4.0. No se especifican el número de tokens (no aplica), el número de imágenes, las épocas, las técnicas de aumento de datos ni si hubo etapas de ajuste fino adicionales. La innovación técnica de esta publicación no está en el entrenamiento sino en la compilación: Blaize ha realizado optimizaciones específicas de hardware para ejecutar el grafo sobre su procesador GSP, generando artefactos `.bm` en tres precisiones. No se documentan técnicas como decodificación especulativa ni atención lineal, propias de modelos de lenguaje y ajenas a este tipo de red.

## Capacidades

- Estimación de pose humana: detección de las 17 articulaciones del estándar COCO Keypoints sobre imágenes.
- Detección de personas: genera cajas delimitadoras junto con los keypoints asociados.
- Inferencia en el borde: optimizado para ejecutarse en aceleradores Blaize Xplorer con bajo consumo y baja latencia.
- Múltiples precisiones: variantes INT8 (máxima velocidad), BF16 (máxima precisión) y AMP (equilibrio).
- Dos resoluciones de entrada: 640×384 (formato panorámico) y 640×640 (cuadrado).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Análisis de postura en gimnasios y entrenamiento deportivo: el modelo detecta articulaciones en tiempo real sobre el acelerador Xplorer, permitiendo corregir la técnica de ejercicio sin enviar vídeo a la nube y con latencia reducida gracias a la inferencia local en GSP.
- Monitorización de seguridad en entornos industriales: detección de personas y posturas (por ejemplo, caídas o posiciones de riesgo) en cámaras fijas, aprovechando la variante 640×384 para encuadres panorámicos y el bajo consumo del hardware de borde.
- Control por gestos y movimiento en interfaces interactivas: seguimiento de keypoints para traducir movimientos corporales en comandos, adecuado por la latencia baja que ofrece la cuantización INT8.
- Análisis de vídeo en retail: estimación de la posición y orientación de clientes para estudiar flujos y atención en tienda, desplegando el modelo en dispositivos de borde sin infraestructura GPU central.
- Robótica y sistemas embebidos: integración de la percepción de pose en plataformas con restricciones de potencia, donde el acelerador GSP sustituye a una GPU convencional.
- Telemedicina y rehabilitación: seguimiento de ejercicios de fisioterapia en el domicilio del paciente con procesamiento local, lo que reduce el ancho de banda y mejora la privacidad al no transmitir imágenes.
- Deportes y análisis de rendimiento: extracción de keypoints por fotograma para calcular ángulos articulares y métricas biomecánicas en vídeos grabados, usando la variante 640×640 cuando se requiere mayor detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: acelerador Blaize Xplorer AI (procesador GSP). El modelo no está pensado para ejecutarse en GPU convencionales ni en CPU.
- SDK requerido: Blaize Picasso SDK instalado y configurado; la herramienta `blaize-modeltool` permite inspeccionar los artefactos.
- VRAM estimada: no aplica en el sentido de GPU; el modelo se ejecuta sobre la memoria del acelerador GSP, cuyo tamaño no se especifica.
- GPU recomendadas: no aplica; no se documenta compatibilidad con A100, H100, RTX 4090 ni similares.
- Compatibilidad con GPU de consumo: no disponible; el formato `.bm` es específico de Blaize y no se puede cargar en llama.cpp, Ollama, vLLM ni TGI.
- Opciones de despliegue: exclusivamente mediante el SDK Picasso y el runtime de Blaize; no hay formato GGUF ni safetensors publicados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| YOLO26n-pose (Blaize) | no disponible | 640×384 / 640×640 | `.bm` | Blaize Xplorer (GSP) | AGPL-3.0 |
| YOLOv8n-pose (Ultralytics) | no disponible en esta ficha | configurable | PyTorch, ONNX, etc. | GPU/CPU genéricas | AGPL-3.0 |
| MediaPipe Pose | no disponible en esta ficha | configurable | TFLite | CPU/GPU móvil | Apache 2.0 |
| RTMPose (MMPose) | no disponible en esta ficha | configurable | PyTorch, ONNX | GPU/CPU genéricas | Apache 2.0 |

La comparación directa es limitada porque esta publicación es una compilación de hardware, no un modelo nuevo. Frente a las alternativas, la diferencia clave es la portabilidad: YOLOv8n-pose, MediaPipe Pose y RTMPose se ejecutan en hardware estándar, mientras que esta variante queda restringida a aceleradores Blaize. No se dispone de datos de precisión (AP) para ninguna de las filas, por lo que no es posible comparar rendimiento numérico.

## Limitaciones y advertencias

- Dependencia total de hardware propietario: los ficheros `.bm` solo se ejecutan en aceleradores Blaize Xplorer con el SDK Picasso; no hay pesos en safetensors, ONNX ni GGUF para uso general.
- Licencia AGPL-3.0: impone obligaciones de liberación de código fuente si el modelo se ofrece como servicio en red; para uso comercial propietario es necesario evaluar la licencia empresarial de Ultralytics.
- Sesgos del dataset: COCO Keypoints 2017 presenta desequilibrios demográficos y de posturas; el modelo puede tener peor rendimiento en personas con determinadas complexiones, ropa, oclusiones o ángulos no representados.
- Riesgo de falsos positivos y negativos en escenas con oclusiones, multitud o iluminación adversa, habitual en estimación de pose.
- Sin información sobre precisión: no se publican métricas AP ni comparaciones con el modelo original, por lo que no se puede verificar la pérdida de precisión introducida por la cuantización INT8 o AMP.
- Repositorio aparentemente vacío (0.0 GB, 0 descargas): los artefactos podrían no estar disponibles realmente, lo que impediría su uso.
- Idiomas: no aplica, pero conviene señalar que el modelo no procesa texto ni audio.
- Sin garantías del proveedor: Blaize declara explícitamente que no revisa ni respalda el modelo de terceros y no ofrece garantía alguna sobre su funcionamiento o sobre infracción de propiedad intelectual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Blaize-AI/YOLOPOSE26n_COCOKeypoint
- Modelo original (Ultralytics): https://www.github.com/ultralytics/ultralytics
- Dataset COCO Keypoints: https://cocodataset.org
- Sitio de Blaize: https://www.blaize.com
