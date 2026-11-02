# RabbitDaisuke/Wholebody-Refinement-onnx

## Resumen

Wholebody-Refinement-onnx es un repositorio de modelos ONNX publicado por el usuario RabbitDaisuke que empaqueta dos modelos oficiales de MMPose sin modificaciones: RTMW-l para estimación de pose de cuerpo completo (133 keypoints) y RTMPose Hand5 para la estimación de pose de manos a resolución nativa (21 keypoints por mano). No se trata de un modelo de lenguaje ni de un modelo entrenado por el autor: son pesos preentrenados de MMPose exportados a ONNX para su uso con onnxruntime en tareas de detección de keypoints.

El interés del paquete radica en que documenta de forma explícita el contrato de inferencia (URLs de origen, hashes SHA-256, tensores de entrada y salida, normalización RGB y política de recorte), lo que facilita la reproducibilidad en pipelines de visión por computador. RTMW-l cubre cuerpo, rostro y manos con 133 keypoints a 384x288, mientras que RTMPose Hand5 se emplea como refinamiento de la región de la mano a 256x256 para obtener mayor precisión en los 21 puntos por mano.

Es relevante para desarrolladores que necesitan un componente de pose estimation listo para producción en formato ONNX, sin dependencia de PyTorch, y que quieran integrar detección de cuerpo completo y manos en aplicaciones de análisis de movimiento, interacción o realidad aumentada. El repositorio tiene un tamaño de 0,3 GB y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes de estimación de pose top-down de MMPose (RTMW-l y RTMPose Hand5), exportadas a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos ONNX sin cuantizar según la información disponible) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

El repositorio contiene dos modelos de estimación de pose de la familia RTMPose/RTMW de MMPose. RTMW-l es un modelo de cuerpo completo que predice 133 keypoints (cuerpo, rostro y manos) con una entrada de 384x288 píxeles. RTMPose Hand5 es un modelo específico de mano que predice 21 keypoints por mano con una entrada de 256x256 píxeles, pensado para refinar la región de la mano a resolución nativa tras el recorte correspondiente.

No se trata de modelos entrenados por el autor: la model card indica explícitamente que son modelos preentrenados existentes de MMPose, exportados sin modificaciones a ONNX. El repositorio documenta en `models.json` las URLs de origen, los hashes SHA-256, los tensores de entrada y salida, la normalización RGB y el contrato de recorte. Los landmarks de pie incluidos son el dedo gordo, el dedo pequeño y el talón de cada pie; la articulación individual de los dedos del pie no se observa. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens (no aplica) ni sobre técnicas de RLHF o DPO (no aplica a modelos de visión).

## Capacidades

- Detección de pose de cuerpo completo con 133 keypoints mediante RTMW-l a 384x288.
- Detección de pose de manos con 21 keypoints por mano mediante RTMPose Hand5 a 256x256.
- Refinamiento de la región de la mano a resolución nativa mediante recorte y re-inferencia con el modelo de mano.
- Localización de landmarks de pie limitada a dedo gordo, dedo pequeño y talón por pie.
- Inferencia en formato ONNX con onnxruntime, sin dependencia de PyTorch en tiempo de ejecución.
- Contrato de inferencia documentado (tensores, normalización RGB, hashes) para reproducibilidad.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Análisis de movimiento deportivo: RTMW-l proporciona 133 keypoints de cuerpo completo en una sola pasada, lo que permite calcular ángulos articulares y trayectorias en vídeo de ejercicio sin encadenar modelos separados de cuerpo, rostro y manos.
- Interacción persona-ordenador sin contacto: la combinación de pose corporal y 21 keypoints por mano a resolución nativa permite reconocer gestos manuales finos (pinza, señalar, puño) en aplicaciones de control por gestos.
- Captura de movimiento para animación: el refinamiento de manos con RTMPose Hand5 a 256x256 mejora la fidelidad de los dedos respecto a la estimación directa desde el frame completo, útil para rigging de personajes.
- Realidad aumentada y filtros: la detección de landmarks faciales y de manos incluida en los 133 keypoints de RTMW-l permite anclar overlays a la cara y las manos del usuario en tiempo real mediante onnxruntime.
- Ergonomía y análisis postural en entornos industriales: los keypoints de cuerpo y pies (dedo gordo, dedo pequeño, talón) permiten evaluar la postura y el apoyo plantar en puestos de trabajo con cámaras fijas.
- Telemedicina y rehabilitación: el seguimiento de articulaciones de cuerpo completo y manos facilita la evaluación remota de ejercicios de movilidad, con la ventaja de un pipeline ONNX desplegable en equipos sin GPU dedicada.
- Investigación en visión por computador: el repositorio sirve como referencia reproducible al incluir URLs de origen, hashes SHA-256 y el contrato de normalización y recorte, lo que simplifica la comparación de resultados entre entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de modelos de visión de tamaño moderado (repositorio de 0,3 GB para ambos modelos), la huella de memoria es reducida en comparación con modelos de lenguaje.
- GPU recomendadas: no disponible. Cualquier GPU compatible con onnxruntime (CUDA o ROCm) o incluso CPU puede ejecutar los modelos, aunque no se especifican cifras de latencia.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se confirma con datos de la model card.
- Opciones de despliegue: onnxruntime (librería declarada), en sus ejecutores de CPU y GPU.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Keypoints | Resolución de entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wholebody-Refinement-onnx (RTMW-l + RTMPose Hand5) | 133 (cuerpo completo) + 21 por mano | 384x288 y 256x256 | ONNX | Apache 2.0 | HuggingFace (RabbitDaisuke) |
| MMPose RTMW-l original | 133 | 384x288 | PyTorch (checkpoint) | Apache 2.0 | Repositorio MMPose |
| MMPose RTMPose Hand5 original | 21 por mano | 256x256 | PyTorch (checkpoint) | Apache 2.0 | Repositorio MMPose |
| Otros modelos de pose ONNX de MMPose | no disponible | no disponible | ONNX | Apache 2.0 | no disponible |

La comparativa se limita a los modelos de origen de MMPose, ya que no se dispone de información sobre alternativas ONNX equivalentes en la documentación proporcionada. La diferencia principal del repositorio es el empaquetado conjunto y la documentación del contrato de inferencia, no el rendimiento de los modelos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-step.
- Los modelos son copias sin modificar de MMPose; cualquier limitación de los originales (precisión en oclusiones, poses extremas, dominios no vistos) se hereda.
- Los landmarks de pie se limitan a dedo gordo, dedo pequeño y talón; no se observa la articulación individual de los dedos del pie.
- No se dispone de información sobre sesgos del dataset de entrenamiento original ni sobre su composición demográfica.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de keypoints espurios en regiones ocluidas o fuera de distribución.
- La licencia Apache 2.0 cubre la distribución de los modelos originales de MMPose; las imágenes de evaluación conservan sus licencias individuales y no se incluyen en el repositorio.
- No se documentan cifras de latencia, throughput ni requisitos de VRAM, lo que obliga a medir el rendimiento en el entorno de despliegue concreto.
- El repositorio no incluye información sobre idiomas ni sobre capacidades multilingües, al no ser aplicable.

## Enlaces

- HuggingFace: https://huggingface.co/RabbitDaisuke/Wholebody-Refinement-onnx
- Repositorio de experimentos y scripts de subida: https://github.com/DaisukeDaisuke/Wholebody-test
- MMPose (modelos originales RTMW y RTMPose): no se proporciona URL directa en la información disponible.
