# APLUX-Agora/YOLOv8s-Segmentation

## Resumen

YOLOv8s-Segmentation es un paquete de recursos de despliegue para el modelo de segmentación de instancias YOLOv8s, publicado por APLUX-Agora dentro del ecosistema Agora. No se trata de un modelo entrenado desde cero por este autor, sino de una conversión y empaquetado del modelo YOLOv8s-Seg de Ultralytics para su ejecución optimizada en aceleradores neuronales Qualcomm (QNN) sobre placas AIoT concretas, como la QCS6490 (Rhino Pi A1) y la QCS8550 (Rhino Pi X1). El repositorio ocupa 0,1 GB e incluye binarios por precisión y por SoC.

El modelo resuelve la tarea de segmentación de instancias: dado un tensor de imagen de entrada, produce máscaras a nivel de píxel para cada objeto detectado. Su relevancia radica en que ofrece artefactos listos para producción con latencias medidas en hardware real (16,4 ms en QCS6490 y 11,8 ms en QCS8550 con la precisión por defecto), lo que facilita el despliegue en dispositivos de borde con recursos limitados sin necesidad de recompilar ni recalibrar el modelo.

La ficha se centra en los datos disponibles en el repositorio de Hugging Face y en la model card del autor. Al tratarse de un paquete de recursos convertidos y no de una model card de entrenamiento completa, varios parámetros técnicos del modelo original (número de parámetros, contexto, composición del dataset) no se detallan en la información proporcionada y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s-Seg (detector de una etapa con rama de segmentación de instancias); empaquetado para Qualcomm QNN |
| Parametros totales | no disponible (la variante "s" de YOLOv8 corresponde al tamaño small, pero el recuento exacto no figura en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | W8A16, W8A8 (QCS6490); FP16, W8A16 (QCS8550) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 para el modelo fuente; APLUX Model Farm License para los recursos convertidos desplegables |
| Formato de pesos | Binarios QNN (`model.bin`) organizados por SoC y precisión en `targets/<SoC>/`; `model.json` con precisión por defecto y rutas de variantes; SHA256SUMS y NOTICE.md incluidos |
| Entrada | imagen (tensor `image`) |
| Salida | máscaras (`masks`) |
| Tarea | segmentación de instancias (image-segmentation) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv8s-Seg, un detector de objetos de una sola etapa con una rama adicional de segmentación que genera máscaras a nivel de píxel para cada instancia detectada. El repositorio no contiene los pesos originales en formato PyTorch ni safetensors, sino los artefactos convertidos y compilados para el runtime QNN de Qualcomm, organizados por SoC objetivo y por precisión (W8A16, W8A8, FP16). Cada directorio `targets/<SoC>/` incluye un `model.json` que declara la precisión por defecto y las rutas de las variantes, junto con los binarios `model.bin` correspondientes.

No se proporciona información sobre el proceso de entrenamiento del modelo original: ni el número de tokens o imágenes, ni la composición del dataset, ni si hubo etapas de ajuste fino o destilación. Tampoco se documentan innovaciones técnicas propias más allá del pipeline de conversión y cuantización para QNN. El valor técnico del paquete reside en la conversión a formatos ejecutables en NPU con precisiones mixtas y en las mediciones de latencia realizadas sobre placas reales dentro de la plataforma Agora.

## Capacidades

- Segmentación de instancias: genera máscaras a nivel de píxel para cada objeto detectado en una imagen de entrada.
- Detección de objetos implícita en la salida de máscaras, propia de la arquitectura YOLOv8-Seg.
- Inferencia optimizada en NPU Qualcomm mediante el runtime QNN, con variantes de precisión seleccionables por SoC.
- Ejecución en placas AIoT concretas: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1).
- Despliegue reproducible: recursos versionados con `model.json`, `NOTICE.md` y `SHA256SUMS` para verificación de integridad.
- Prueba en línea sin hardware físico a través de la plataforma Agora (https://mega.aidlux.com/models/yolov8s-seg).
- Exportación de proyectos y flujos de trabajo desde Agora, incluyendo guía de despliegue.

## Casos de uso

- Inspección visual en línea de producción: el modelo puede segmentar piezas o defectos en imágenes capturadas por cámaras industriales; con 16,4 ms por inferencia en QCS6490 permite inspeccionar decenas de imágenes por segundo en el propio dispositivo de borde.
- Vigilancia y conteo de objetos en dispositivos AIoT: la segmentación por instancias permite delimitar personas, vehículos u objetos en tiempo real sobre placas QCS8550 con 11,8 ms de latencia, sin enviar vídeo a la nube.
- Robótica y guiado por visión: las máscaras por instancia proporcionan contornos precisos que un brazo robótico o un vehículo autónomo puede usar para localizar y manipular objetos, ejecutándose localmente en la NPU.
- Agricultura de precisión: segmentación de frutos, hojas o malas hierbas en imágenes de campo capturadas por drones o cámaras fijas, aprovechando la baja latencia y el consumo reducido de las placas Qualcomm.
- Análisis médico o científico de imágenes asistido: segmentación de regiones de interés en imágenes (por ejemplo, conteo y delimitación de estructuras) en entornos con requisitos de privacidad, al procesarse todo en el dispositivo.
- Prototipado rápido en borde: gracias a la prueba en línea de Agora y a la exportación de flujos de trabajo, un equipo puede validar la segmentación en el navegador antes de adquirir la placa y luego descargar los binarios exactos para su SoC.
- Control de calidad en logística: segmentación de paquetes o productos en cintas transportadoras para verificar integridad y posición, con despliegue en cámaras inteligentes basadas en QCS6490.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, mIoU) en la información disponible. Los únicos datos de rendimiento proporcionados son latencias medidas en la plataforma Agora sobre hardware real:

| SoC · placa | Precisiones disponibles | Latencia medida (precisión por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 16,4 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16 | 11,8 ms |

No se especifica qué precisión corresponde a la medición por defecto en cada SoC, ni se aportan datos de throughput agregado, consumo energético o precisión de segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está orientado a NPU integradas en SoC Qualcomm, no a GPU de escritorio.
- GPU recomendadas: no aplica para el despliegue objetivo; el runtime es QNN sobre NPU Qualcomm.
- Placas compatibles: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1), según los targets incluidos en el repositorio.
- Cabe en GPU de consumo: no disponible; no se documenta una ruta de despliegue en GPU de consumo dentro de la información proporcionada.
- Opciones de despliegue: runtime QNN de Qualcomm a través de la plataforma Agora; descarga selectiva por SoC con `hf download` y el parámetro `--include "targets/$AGORA_SOC/*"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia estimada: 16,4 ms en QCS6490 y 11,8 ms en QCS8550 con la precisión por defecto.
- Throughput estimado: no disponible de forma explícita; a partir de las latencias, el límite teórico sería de aproximadamente 61 y 85 inferencias por segundo respectivamente, sin contabilizar preprocesado ni postprocesado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv8s-Segmentation (este) | YOLOv8s-Seg convertido a QNN | no disponible | no aplica | AGPL-3.0 (fuente) / APLUX Model Farm License (recursos) | Hugging Face, 0 descargas, 0 likes |
| YOLOv8s-Seg original (Ultralytics) | YOLOv8s-Seg | no disponible en la información proporcionada | no aplica | AGPL-3.0 | Público en el repositorio de Ultralytics |
| Alternativas de segmentación de instancias (p. ej., Mask R-CNN, Segment Anything) | no disponible en la información proporcionada | no disponible | no aplica | varía según el proyecto | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; no se aportan métricas de precisión que permitan contrastar el rendimiento frente a otros modelos de segmentación.

## Limitaciones y advertencias

- El repositorio contiene recursos convertidos para QNN, no los pesos originales en PyTorch o safetensors; no es directamente utilizable fuera del ecosistema Agora/Qualcomm sin un proceso de conversión adicional.
- La licencia del modelo fuente es AGPL-3.0, lo que impone obligaciones de copyleft para uso en red; los recursos convertidos se rigen además por la APLUX Model Farm License, cuyos términos deben revisarse antes de un uso comercial.
- No se documentan sesgos conocidos, pero al ser un modelo de visión entrenado sobre un dataset no especificado, puede heredar sesgos de representación de las clases e imágenes de entrenamiento.
- Riesgo de alucinación en el sentido de detecciones o máscaras espurias en escenas fuera de la distribución de entrenamiento; no se aportan métricas de precisión que permitan acotar este riesgo.
- Solo se documentan dos SoC objetivo (QCS6490 y QCS8550); el despliegue en otros aceleradores no está cubierto.
- No hay información sobre el número de parámetros, el dataset de entrenamiento ni los resultados de precisión (mAP, mIoU), lo que limita la evaluación rigurosa antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún nula y ausencia de validación por parte de la comunidad.
- El preprocesado, postprocesado y el runner no se incluyen como código abierto en el repositorio; deben obtenerse a través de la plataforma Agora (guía de despliegue o exportación de flujos de trabajo).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/APLUX-Agora/YOLOv8s-Segmentation
- Página del modelo en Agora (prueba en línea): https://mega.aidlux.com/models/yolov8s-seg
- Plataforma Agora: https://mega.aidlux.com
- Repositorio de Ultralytics YOLOv8 (modelo fuente): no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible en la información proporcionada
