# RabbitDaisuke/RTMPose-Wholebody-onnx

## Resumen

RTMPose-Wholebody133 ONNX es una colección de exportaciones a formato ONNX de los checkpoints oficiales RTMPose-t y RTMPose-s de MMPose, especializados en la detección de 133 keypoints de cuerpo completo (wholebody) en imágenes 2D de una sola persona. El modelo lo publica el usuario RabbitDaisuke y deriva directamente de los pesos oficiales COCO-WholeBody133 de OpenMMLab, así como de los pesos destilados DWPose (270 épocas) alojados en ucoco. No se trata de un modelo entrenado desde cero, sino de una conversión de los checkpoints originales a ONNX con transformaciones numéricas nombradas y sin reentrenamiento.

La relevancia de esta ficha radica en que ofrece una alternativa ligera a RTMW para el seguimiento wholebody de una sola persona, manteniendo tobillos, dedos de los pies, talones, cara y dedos de la mano dentro del mismo esquema de 133 puntos. Esto permite comparar un detector más ligero contra RTMW usando la misma geometría pseudo-3D calibrada. La entrada es fija: float32 RGB en formato NCHW [1,3,256,192], y las salidas son dos mapas SimCC (simcc_x [1,133,384] y simcc_y [1,133,512]) con un split ratio de 2.

El repositorio ocupa 0,3 GB e incluye variantes FP32, FP16 y INT8 QDQ, tanto completas como por subcomponentes (backbone y head). La licencia es Apache-2.0 y la librería de inferencia objetivo es onnxruntime. No hay datos publicados sobre idiomas, benchmarks de precisión en vídeo objetivo ni rendimiento en navegador con WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMPose (top-down, estimación de pose 2D con salida SimCC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16 (all/backbone/head), INT8 QDQ calibrado (all/backbone/head) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con metadatos de onnxruntime y sidecar SHA-256 en caché) |

Otros datos técnicos relevantes: entrada float32 RGB NCHW [1,3,256,192], normalización ImageNet con media [123.675, 116.28, 103.53] y desviación [58.395, 57.12, 57.375] para píxeles en rango 0–255. Salidas SimCC con split ratio 2. GFLOPs oficiales de la tabla de MMPose: 0,5 para tiny y 0,9 para small. WholeBody AP oficial: 48,5 (tiny) y 53,8 (small). Ninguna de estas variantes predice coordenadas 3D aprendidas.

## Arquitectura y entrenamiento

La arquitectura es RTMPose en configuración top-down: primero se detecta la persona (fuera del modelo) y después se estima la pose sobre el recorte (ROI) redimensionado a 256×192. La cabeza de predicción usa SimCC, que formula la localización de cada keypoint como dos clasificaciones 1D independientes sobre ejes x e y, con una resolución interna de 384 y 512 respectivamente (split ratio 2). El modelo conserva los 133 puntos del esquema COCO-WholeBody, lo que incluye cara, manos y pies completos.

No hay entrenamiento propio en esta publicación. Los pesos provienen de los checkpoints oficiales RTMPose-t/s COCO-WholeBody133 de OpenMMLab y de los pesos destilados DWPose de 270 épocas alojados en ucoco. La conversión a ONNX aplica transformaciones numéricas nombradas y conserva el texto de copyright de MMPose y la licencia Apache-2.0 en el fichero LICENSE. El flujo de construcción está publicado en un workflow de GitHub Actions (build-lightpose.yml) y el checkpoint se descarga solo en caso de fallo de caché, conservándose con un sidecar SHA-256. No se especifica el número de tokens ni la composición del dataset de entrenamiento original en la información disponible.

## Capacidades

- Detección de 133 keypoints wholebody en 2D para una sola persona: incluye articulaciones corporales, cara, manos y pies (tobillos, talones y dedos de los pies).
- Salida en formato SimCC con dos mapas 1D (x e y) que permiten decodificar coordenadas de keypoint.
- Variantes de precisión FP32, FP16 e INT8 QDQ, con opción de cuantizar solo backbone o solo head.
- Compatibilidad con onnxruntime como motor de inferencia.
- Integración con el ecosistema MMPose mediante la transformación ROI top-down para mapear coordenadas al imagen original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la estimación de pose.

## Casos de uso

- Seguimiento de movimiento en aplicaciones de fitness: el modelo estima 133 keypoints por fotograma sobre recortes de persona, lo que permite calcular ángulos articulares y detectar posturas incorrectas en tiempo real con un coste de 0,5–0,9 GFLOPs por ROI.
- Animación y captura de movimiento de bajo coste: al conservar dedos de manos y pies, se puede usar para retargeting hacia rigs de personajes, con la ventaja de que las variantes INT8 reducen el coste computacional en dispositivos modestos.
- Análisis ergonómico en entornos industriales: la detección de talones, tobillos y dedos permite evaluar apoyos y posturas de pie en puestos de trabajo, usando la transformación ROI top-down para mapear coordenadas a la imagen original.
- Comparación de detectores ligeros frente a RTMW: al compartir el layout de 133 puntos y la geometría pseudo-3D calibrada, sirve como baseline ligero en experimentos que comparan precisión y coste frente a modelos más pesados.
- Prototipado en navegador con WebGPU: las variantes FP16 e INT8 están pensadas para ejecución en onnxruntime-web, aunque el propio autor advierte que el rendimiento en navegador no se ha medido hasta ejecutarlo en el dispositivo objetivo.
- Telemedicina y rehabilitación: el seguimiento de rangos de movimiento en extremidades y manos puede apoyar ejercicios guiados, siempre que se valide la precisión sobre el vídeo objetivo, algo que el autor indica que queda pendiente.
- Análisis deportivo de bajo consumo: con 0,5 GFLOPs en la variante tiny, es viable procesar vídeo a resolución moderada en GPUs de gama media o en CPU con cuantización INT8.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados en la información disponible son los de la tabla oficial de MMPose para los checkpoints padre, no mediciones propias sobre este export ONNX:

| Modelo | GFLOPs | WholeBody AP |
|---|---|---|
| RTMPose-t (tiny) | 0,5 | 48,5 |
| RTMPose-s (small) | 0,9 | 53,8 |

El autor indica explícitamente que los informes de deriva (drift) FP32 para caderas, rodillas, tobillos y articulaciones del pie son de fixture, no de precisión ground-truth, y que el tamaño de fichero o la precisión no determinan la velocidad en navegador. El rendimiento WebGPU y la precisión sobre vídeo objetivo quedan sin medir hasta su ejecución en el dispositivo destino. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,3 GB) y las variantes FP16/INT8, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. Dado el coste de 0,5–0,9 GFLOPs por ROI, cualquier GPU moderna (RTX 3060 o superior, A100, H100) puede ejecutarlo; en el extremo bajo, GPUs integradas o CPU con INT8 son plausibles, aunque sin datos de latencia publicados.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos unos cientos de MB libres, aunque no hay cifras oficiales.
- Opciones de despliegue: onnxruntime (librería declarada), onnxruntime-web con WebGPU para navegador, y en general cualquier runtime compatible con ONNX (por ejemplo, integraciones en pipelines de MMPose).
- Latencia y throughput: no disponibles. El autor advierte que la velocidad en navegador no se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WholeBody AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RTMPose-t WholeBody133 ONNX (este) | no disponible | no aplica | 48,5 (oficial, checkpoint padre) | Apache-2.0 | Hugging Face, ONNX |
| RTMPose-s WholeBody133 ONNX (este) | no disponible | no aplica | 53,8 (oficial, checkpoint padre) | Apache-2.0 | Hugging Face, ONNX |
| RTMW | no disponible | no aplica | no disponible en la información | no disponible | MMPose / OpenMMLab |
| DWPose destilado (ucoco) | no disponible | no aplica | no disponible en la información | no disponible | Hugging Face (ucoco) |

La comparación con RTMW y DWPose se menciona en la model card como referencia de origen y de esquema compartido (133 puntos, geometría pseudo-3D calibrada), pero no se aportan métricas comparativas propias. No hay datos suficientes para comparar latencia, throughput ni precisión sobre vídeo objetivo.

## Limitaciones y advertencias

- Modelo de visión, no de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier uso conversacional queda fuera de su alcance.
- Solo una persona por ROI: el pipeline es top-down y requiere un detector de persona externo; no resuelve multi-persona por sí mismo.
- Entrada fija de 256×192: no es dinámica; hay que redimensionar el recorte y aplicar la transformación ROI para volver a coordenadas de la imagen original.
- Sin predicción 3D: el autor aclara que ninguna variante predice coordenadas 3D aprendidas; la geometría pseudo-3D es calibrada, no aprendida.
- Deriva numérica en cuantización: los informes de drift FP32 para caderas, rodillas, tobillos y pies son de fixture, no de precisión real; la cuantización INT8 puede degradar la precisión en articulaciones finas.
- Rendimiento en navegador no medido: la velocidad WebGPU y la precisión sobre vídeo objetivo quedan pendientes de validación en el dispositivo destino.
- Sin datos de sesgos ni de alucinación: al no ser un modelo generativo, el riesgo de alucinación no aplica, pero no se documentan sesgos del dataset COCO-WholeBody.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de copyright de MMPose incluido en LICENSE.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/RabbitDaisuke/RTMPose-Wholebody-onnx
- Upstream MMPose: https://github.com/open-mmlab/mmpose
- Workflow de construcción: https://github.com/DaisukeDaisuke/mmpose-actions/actions/workflows/build-lightpose.yml
- Pesos destilados DWPose (ucoco): no disponible como enlace directo en la información proporcionada
- Repositorio RTMW / RTMW3D: no disponible como enlace directo en la información proporcionada
