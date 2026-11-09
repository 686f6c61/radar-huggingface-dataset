# APLUX-Agora/YOLO11n-Pose

## Resumen

YOLO11n-Pose es un modelo de estimación de pose (keypoint detection) derivado de la familia YOLO11 de Ultralytics, en su variante "n" (nano). Detecta personas y, simultáneamente, predice 17 keypoints del esqueleto humano según la convención COCO. Este repositorio concreto, publicado por APLUX-Agora, no contiene los pesos originales en formato PyTorch, sino recursos ya convertidos y empaquetados para su despliegue en placas con SoC Qualcomm (QCS6490 y QCS8550) mediante el runtime QNN de Qualcomm, dentro del ecosistema Agora de AidLux.

El interés del repositorio es fundamentalmente de despliegue en el borde (edge/AIoT): ofrece paquetes por precisión (FP16, W8A16, W8A8) con latencias medidas en hardware real, algo poco habitual en los repos de modelos de pose. No se trata de un modelo de lenguaje ni de un modelo generativo: es un detector de keypoints puramente visual, sin capacidades de texto, tool calling ni razonamiento.

La información disponible es escasa en cuanto a arquitectura interna, datos de entrenamiento y métricas de precisión (mAP, OKS). La model card se centra en el proceso de descarga e integración con el runtime de Qualcomm y en los tiempos de inferencia medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de detección/pose de una etapa (familia YOLO11, variante nano); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (empaquetados por SoC) |
| Idiomas soportados | no disponible (no procesa texto; salida de 17 keypoints COCO) |
| Licencia | Apache-2.0 para el modelo fuente; los recursos convertidos usan APLUX Model Farm License |
| Formato de pesos | Paquetes QNN por SoC (`model.json` + `model.bin` por precisión); no se publican safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna más allá de identificarla como YOLO11 en variante nano para la tarea de pose, con salida de caja de persona y 17 keypoints COCO. No se especifican número de parámetros, capas, mecanismos de atención ni composición del dataset de entrenamiento. Tampoco se documenta si hubo fases de ajuste fino específicas ni qué técnica de aumento de datos se empleó.

Lo que sí está documentado es la cadena de conversión y despliegue: los pesos se han convertido a formatos ejecutables por el runtime QNN de Qualcomm, con variantes de precisión FP16, W8A16 y W8A8 para los SoC QCS6490 y QCS8550. Cada directorio `targets/<SoC>/` contiene un `model.json` con la precisión por defecto y las rutas de las variantes, además de un directorio por precisión con binarios `model.bin`. El preprocesado, postprocesado y el runner se distribuyen a través de la plataforma Agora (guía de despliegue o exportación de un workflow que use el modelo).

## Capacidades

- Detección de personas con caja delimitadora y estimación simultánea de 17 keypoints con topología COCO.
- Inferencia optimizada para aceleradores Qualcomm (Hexagon/NPU) mediante QNN, con variantes cuantizadas W8A16 y W8A8.
- Ejecución en placas de bajo consumo del segmento AIoT (QCS6490, QCS8550).
- Salida estructurada de keypoints (`keypoints`) y entrada de imagen (`image`), según la firma declarada en la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de audio o vídeo nativo más allá del fotograma de entrada.

## Casos de uso

- Análisis de postura en gimnasios y entrenamiento deportivo: el modelo permite estimar ángulos articulares por fotograma con latencias de 8-10 ms en placa, suficiente para retroalimentación en tiempo real sobre la ejecución de ejercicios.
- Control de acceso y presencia en dispositivos IoT: al ejecutarse en SoC de bajo consumo como QCS6490, puede integrarse en cámaras inteligentes que detecten personas y su pose sin enviar vídeo a la nube.
- Monitorización de ergonomía en puestos de trabajo: con la salida de 17 keypoints se pueden calcular inclinaciones de tronco y cuello y generar alertas locales en el propio dispositivo.
- Seguridad en entornos industriales: detección de caídas o posturas anómalas en zonas restringidas, aprovechando la inferencia en el borde para evitar dependencia de conectividad.
- Robótica e interacción humano-máquina: seguimiento del esqueleto para que un brazo robótico o una interfaz gestual reaccione a la posición de las articulaciones del operador.
- Videovigilancia con privacidad por diseño: al procesar la imagen en la placa y emitir solo coordenadas de keypoints, se reduce la exposición de datos personales frente a soluciones basadas en servidor.
- Prototipado rápido en AIoT: los paquetes por precisión y la guía de despliegue de Agora permiten validar un pipeline de pose en hardware Qualcomm sin reentrenar ni reconvertir el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, OKS) en la información disponible. Los únicos datos de rendimiento son latencias medidas en placas reales:

| SoC · placa | Precisión por defecto | Latencia medida |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 9,6 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 8,2 ms |

## Requisitos de hardware

- VRAM no aplica en el sentido habitual: el modelo está empaquetado para NPU/SoC Qualcomm, no para GPU de escritorio.
- SoC soportados según la model card: QCS6490 (placa Rhino Pi A1) y QCS8550 (placa Rhino Pi X1).
- Precisión por defecto: W8A16 en QCS6490 y FP16 en QCS8550, con variantes W8A8 y W8A16 disponibles en ambos.
- No se documenta soporte para GPU de consumo (RTX 4090, etc.) ni para ejecución en CPU genérica mediante llama.cpp, Ollama, vLLM o TGI; el runtime previsto es QNN.
- Latencia estimada: 9,6 ms en QCS6490 y 8,2 ms en QCS8550 con la precisión por defecto.
- Throughput no disponible.
- Despliegue: descarga selectiva por SoC con `hf download` y ejecución mediante el runner y la guía de despliegue de Agora (https://mega.aidlux.com).

## Comparativa con modelos similares

| Modelo | Tarea | Variante | Licencia | Contexto/entrada | Despliegue en Qualcomm |
|---|---|---|---|---|---|
| YOLO11n-Pose (este repo) | Pose, 17 keypoints COCO | Nano | Apache-2.0 (fuente) / APLUX Model Farm (recursos) | Imagen | Sí, paquetes QNN por SoC |
| YOLO11n-Pose (Ultralytics original) | Pose, 17 keypoints COCO | Nano | AGPL-3.0 / Enterprise | Imagen | No empaquetado; requiere conversión propia |
| YOLOv8n-Pose | Pose, 17 keypoints COCO | Nano | AGPL-3.0 / Enterprise | Imagen | No empaquetado; requiere conversión propia |
| MediaPipe Pose | Pose, 33 keypoints | BlazePose | Apache-2.0 | Imagen | No orientado a QNN |

No se dispone de datos de precisión comparada (OKS/mAP) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se publican métricas de precisión (OKS, mAP) ni detalles del dataset de entrenamiento, por lo que no es posible evaluar su robustez frente a oclusiones, poses extremas o escenas concurridas.
- El repositorio no incluye los pesos originales en formato PyTorch ni safetensors; está atado al runtime QNN y a los SoC Qualcomm listados.
- La licencia del modelo fuente es Apache-2.0, pero los recursos convertidos y empaquetados se rigen por la APLUX Model Farm License (LICENSE_MODEL_FARM.pdf), que puede imponer condiciones adicionales para uso comercial. Es necesario revisar NOTICE.md y SHA256SUMS antes de desplegar.
- Riesgo de sesgo inherente a los datasets de pose humanos: posible peor rendimiento en determinados grupos demográficos, condiciones de iluminación o vestimenta, aunque no se documenta explícitamente.
- El tamaño del repositorio aparece como 0.0 GB, lo que sugiere que los binarios pueden no estar incluidos o estar disponibles solo mediante descarga selectiva por SoC.
- Sin soporte documentado de texto, idiomas ni razonamiento; no debe evaluarse como modelo generativo.
- La fecha de creación del repositorio (2026-11-09) es posterior a la fecha actual de referencia habitual; conviene verificar la disponibilidad real de los artefactos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/APLUX-Agora/YOLO11n-Pose
- Plataforma Agora (prueba online y guía de despliegue): https://mega.aidlux.com
- Página del modelo en Agora: https://mega.aidlux.com/models/yolo11n-pose
- Ultralytics YOLO11 (modelo fuente): no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible en la información proporcionada
