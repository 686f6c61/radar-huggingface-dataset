# LibreYOLO/LibreInstantHMRm-mesh-commercial

## Resumen

LibreInstantHMRm-mesh-commercial es un modelo de recuperación de malla humana (human mesh recovery, HMR) en tiempo real que estima la pose y la forma 3D de una persona a partir de un recorte de imagen. Lo desarrolla LibreYOLO a partir de InstantHMR (Mohamed Adjel, Kahina Chalabi y Vincent Bonnet), y se distribuye como checkpoint PyTorch listo para usar con la librería LibreYOLO. El modelo toma un recorte de una persona y devuelve los parámetros de pose e identidad del rig MHR de Meta, 70 keypoints en 2D y 3D, la traslación de cámara y una malla de 18.439 vértices.

La arquitectura emplea un backbone HGNetV2-B4 con 32,2 millones de parámetros, pensado para inferencia en tiempo real incluso en dispositivos móviles. La variante "commercial" se entrenó únicamente con imágenes de uso comercial (Harmony4D y COCO con licencias CC BY o sin copyright conocido), lo que la hace apta para productos comerciales. Es relevante ahora porque cubre un hueco habitual: la mayoría de los modelos HMR de referencia (SMPL/SMPL-X) arrastran licencias restrictivas, mientras que este combina pesos Apache-2.0 con un rig MHR también Apache-2.0.

El checkpoint se ha reconvertido desde el ONNX original a PyTorch, con una equivalencia numérica verificada de 1e-4 en todas las salidas. Incluye además utilidades para fine-tuning con keypoints 2D en formato COCO-17 y exportación a ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con backbone HGNetV2-B4 (regresión de parámetros MHR) |
| Parametros totales | 32,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de recorte de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 en pesos; SAM License en las etiquetas de entrenamiento |
| Formato de pesos | PyTorch (.pt); exportación a ONNX soportada |

## Arquitectura y entrenamiento

El modelo es una red convolucional que usa HGNetV2-B4 como extractor de características y regresa directamente los parámetros del rig MHR de Meta: pose, identidad, traslación de cámara, 70 keypoints en 2D y 3D y una malla de 18.439 vértices. El diseño prioriza la latencia para inferencia en tiempo real, incluido entorno móvil, según el preprint de los autores ("InstantHMR: Real-Time Human Mesh Recovery on Your Phone", HAL hal-05854387). No se ha publicado información sobre el número exacto de tokens o imágenes de entrenamiento ni sobre el uso de RLHF o DPO, que no aplican a una tarea de regresión geométrica.

La variante commercial se entrenó solo con imágenes de uso comercial: Harmony4D y COCO con licencias CC BY o sin copyright conocido. Las etiquetas de entrenamiento proceden del dataset SAM 3D Body de Meta, publicado bajo la SAM License, cuyos términos se propagan al modelo. La conversión de ONNX a PyTorch reconstruye las capas BatchNorm plegadas (con estadísticas medidas sobre recortes de personas de coco128), transpone de vuelta los pesos lineales pretranspuestos y despliega las constantes plegadas; el resultado coincide con el ONNX original dentro de 1e-4.

## Capacidades

- Recuperación de malla humana 3D completa: vértices, keypoints 3D y parámetros de pose e identidad MHR.
- Detección de 70 keypoints en 2D y 3D por persona.
- Estimación de la traslación de cámara y del encuadre de la persona.
- Detección automática de personas en la imagen mediante RF-DETR (por defecto en LibreYOLO).
- Fine-tuning con keypoints 2D propios en formato YOLO-pose / COCO-17.
- Exportación a ONNX del recorte y del cuerpo para despliegue fuera de PyTorch.
- Inferencia en tiempo real orientada a dispositivos móviles.
- No soporta tool calling, agentes, texto ni razonamiento multi-paso: es un modelo puramente visual.

## Casos de uso

- Análisis deportivo: estimar la pose 3D de atletas a partir de vídeo para calcular ángulos articulares y biomecánica, gracias a la malla de 18.439 vértices y a la baja latencia.
- Animación y captura de movimiento: generar esqueletos y mallas MHR desde grabaciones de una sola cámara para prototipado rápido de animaciones.
- Realidad aumentada y virtual: superponer prendas o avatares sobre la persona detectada usando la pose y la forma estimadas en tiempo real.
- Ergonomía y prevención de riesgos laborales: analizar posturas en puestos de trabajo con recortes de cámara y detectar ángulos de riesgo.
- Telemedicina y rehabilitación: seguimiento de ejercicios y movilidad articular con keypoints 2D/3D y malla, sin depender de rigs con licencia restrictiva.
- Vigilancia y análisis de multitudes: extraer pose por persona en flujos de vídeo combinando el detector RF-DETR con el regresor de malla.
- Investigación en visión por computador: base Apache-2.0 para experimentar con HMR y fine-tuning sobre datasets propios de keypoints.

## Benchmarks y rendimiento

Datos de precisión reportados por los autores de InstantHMR, en PA-MPJPE (mm, menor es mejor):

| Benchmark | PA-MPJPE (mm) |
|---|---|
| EMDB-1 | 72,2 |
| 3DPW | 50,7 |

No se han publicado en la información disponible resultados de latencia, throughput ni comparativas con otros modelos HMR.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; con 32,2 M de parámetros y un backbone B4, el modelo es ligero y cabe holgadamente en GPUs de consumo (estimación orientativa por tamaño, no publicada).
- GPU recomendadas: cualquier GPU moderna; el diseño apunta a tiempo real en móvil, por lo que una RTX 4090 o superior ofrece amplio margen.
- Cabe en GPU de consumo: sí, por tamaño del modelo; no se especifican requisitos mínimos.
- Opciones de despliegue: PyTorch mediante la librería LibreYOLO; exportación a ONNX para ONNX Runtime y otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| LibreInstantHMRm-mesh-commercial | 32,2 M | Malla MHR, 70 keypoints 2D/3D | Apache-2.0 (etiquetas SAM License) | Hugging Face, PyTorch/ONNX |
| InstantHMR (original) | no disponible | Malla MHR | no disponible | ONNX en Hugging Face (momolesang/InstantHMR) |
| Modelos HMR basados en SMPL/SMPL-X | variable | Malla SMPL/SMPL-X | restrictiva (no comercial) | múltiples repositorios |

No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia Apache-2.0 cubre los pesos, pero las etiquetas de entrenamiento derivan del dataset SAM 3D Body bajo la SAM License; es necesario revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- El modelo procesa un recorte de una sola persona; la calidad depende del detector de personas previo (RF-DETR por defecto).
- No se han publicado datos sobre sesgos demográficos, robustez ante oclusiones o precisión en posturas extremas.
- Riesgo de error en la estimación de profundidad y escala con una sola cámara; la traslación de cámara puede ser imprecisa en escenas complejas.
- No procesa texto ni idiomas; la fila de idiomas no aplica.
- No hay información sobre cuantizaciones disponibles ni sobre latencia en hardware concreto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreInstantHMRm-mesh-commercial
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentación LibreYOLO: https://www.libreyolo.com/docs
- Código de InstantHMR: https://github.com/Naturalpad-studio/InstantHMR
- Pesos InstantHMR originales: https://huggingface.co/momolesang/InstantHMR
- Rig MHR de Meta: https://github.com/facebookresearch/MHR
- Preprint InstantHMR: HAL hal-05854387
