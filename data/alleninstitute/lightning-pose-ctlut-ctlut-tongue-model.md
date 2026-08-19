# AllenInstitute/lightning-pose-ctlut-ctlut-tongue-model

## Resumen

Lightning Pose es un modelo de estimación de pose animal desarrollado por el Allen Institute y entrenado con la librería Lightning Pose (del laboratorio paninski-lab). Este modelo concreto, `AllenInstitute/lightning-pose-ctlut-ctlut-tongue-model`, está especializado en la detección de 9 puntos anatómicos de la lengua y la mandíbula de un roedor (probablemente ratón) a partir de una única vista de cámara. Es una herramienta de visión por computadora para análisis de comportamiento y biomecánica oral, no un modelo de lenguaje.

La arquitectura se basa en un backbone ResNet50 preentrenado en el dataset AP-10K (animal pose estimation), con una cabeza de regresión de puntos clave. El modelo se entrenó durante 300 épocas con una división train/validación del 95/5 y utiliza una pérdida de PCA de vista única. Aporta una métrica de rendimiento de error cuadrático medio supervisado de 1,78 píxeles reescalados en validación, lo que indica una buena precisión para su tarea específica.

Es relevante porque permite automatizar el seguimiento de movimientos linguales y mandibulares en experimentos científicos, sustituyendo la anotación manual. Al estar publicado en Hugging Face con la librería `lightning-pose`, es reproducible y puede integrarse en pipelines de análisis de vídeo de comportamiento animal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (backbone preentrenado en AP-10K) con cabeza de regresión de puntos clave |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por computadora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.3 GB, probablemente checkpoint de PyTorch Lightning) |

## Arquitectura y entrenamiento

El modelo usa un backbone ResNet50 preentrenado en el dataset AP-10K, que es un conjunto de imágenes de animales con anotaciones de puntos clave. La cabeza de regresión predice las coordenadas de 9 puntos: `tube_left`, `tube_right`, `nose_tip`, `jaw_tip`, `jaw_left`, `jaw_right`, `tongue_tip`, `tongue_left`, `tongue_right`. La pérdida utilizada es `pca_singleview`, que combina una pérdida de error cuadrático con una proyección PCA para imponer restricciones de forma en los puntos detectados.

El entrenamiento se realizó durante 300 épocas con una partición de entrenamiento del 95% y validación del 5%. No se especifican el número de imágenes ni el tamaño del dataset en la información proporcionada. El modelo se entrena en una sola vista (single view) y no emplea mecanismos de atención multi-vista ni aumentación con oclusiones simuladas, características que sí están disponibles en versiones más recientes de Lightning Pose.

## Capacidades

- Detección de 9 puntos anatómicos específicos de la lengua y la mandíbula de un roedor en imágenes de una sola cámara.
- Inferencia de posición de puntos clave con alta precisión (RMSE de 1,78 píxeles reescalados en validación).
- Compatible con el ecosistema Lightning Pose para entrenamiento, evaluación y visualización.
- No tiene capacidades de generación de texto, razonamiento, código, ni visión multimodal (no es un modelo de lenguaje).
- No soporta tool calling ni agentes.
- Funciona únicamente con imágenes estáticas o vídeo (a través de la librería asociada).

## Casos de uso

- Investigación en biomecánica oral: el modelo permite cuantificar el movimiento de la lengua y la mandíbula en roedores durante la deglución, masticación o vocalización. Se integraría en un pipeline de análisis de vídeo para obtener series temporales de coordenadas de los puntos clave.
- Estudios de comportamiento neurocientífico: en experimentos de condicionamiento o de lesión cerebral, el seguimiento automático de la lengua y la mandíbula permite medir respuestas motoras finas sin intervención manual.
- Desarrollo de modelos de enfermedad: en modelos de ELA, Parkinson o disfunción oral, la detección de puntos clave permite monitorizar la progresión de la patología a lo largo del tiempo en animales.
- Automatización de la anotación de datos: sirve como anotador automático para crear nuevos conjuntos de datos de pose animal, reduciendo el esfuerzo de anotación manual en proyectos de gran escala.
- Análisis de vídeos de alta velocidad: al ser un modelo ligero (ResNet50), puede procesar vídeos de cámara rápida en tiempo real si se despliega con hardware adecuado.
- Integración en plataformas de análisis de comportamiento como DeepLabCut o SLEAP: aunque es un modelo independiente, puede utilizarse como red de estimación de pose en esos ecosistemas para comparar resultados.

## Benchmarks y rendimiento

La información disponible proporciona la métrica supervisada RMSE (en píxeles reescalados, sobre la imagen de entrenamiento reescalada). No hay comparación con otros modelos.

| Conjunto | RMSE final | Mejor RMSE |
|---|---|---|
| Entrenamiento | 0,36 | 0,26 |
| Validación | 1,95 | 1,78 |

El RMSE se mide sobre la imagen reescalada, no en píxeles originales, por lo que debe interpretarse con cautela. No se han publicado resultados de benchmarks adicionales (como PCK, OKS, etc.) en la información disponible.

## Requisitos de hardware

- El modelo tiene un backbone ResNet50, que requiere aproximadamente 25 millones de parámetros. La inferencia en FP16 puede realizarse con una VRAM de entre 2 y 4 GB, dependiendo del tamaño de la imagen de entrada.
- Puede ejecutarse en GPUs de consumo como una NVIDIA RTX 2060 (6 GB), RTX 3060 (12 GB) o RTX 4090 (24 GB). También es posible ejecutarlo en CPU, aunque con latencia mayor.
- Para entrenar o ajustar el modelo, se recomienda una GPU con al menos 8 GB de VRAM (p.ej., RTX 2070, A4000).
- La librería Lightning Pose se integra con PyTorch Lightning y permite usar `vLLM` no, pero sí con `PyTorch` y `ONNX`. Para despliegue en producción, se puede exportar a ONNX y servir con TensorRT o Triton.
- No hay datos de latencia o throughput específicos en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos similares específicos para la estimación de pose de lengua en roedores. En el ámbito general de estimación de pose animal, existen alternativas como DeepLabCut, SLEAP y DeepPoseKit, pero no se pueden comparar directamente porque este modelo está especializado en un conjunto de puntos muy concreto y no se han publicado métricas comparables en los mismos conjuntos de datos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para un contexto experimental concreto (lengua y mandíbula de un roedor, con una vista fija). No es generalizable a otras especies, otras partes del cuerpo o condiciones de iluminación o cámara muy diferentes.
- La métrica RMSE se mide en píxeles reescalados, no en el tamaño original de la imagen, lo que puede infravalorar el error real en aplicaciones de alta resolución.
- No se especifica la licencia del modelo, por lo que su uso comercial puede estar restringido. Se recomienda contactar con el autor (Hilda Azimi) o el Allen Institute para aclarar los términos.
- No se han documentado sesgos específicos, pero como todos los modelos de visión, puede fallar en imágenes con oclusiones, movimiento rápido o bajo contraste.
- La pérdida `pca_singleview` impone restricciones de forma que pueden no ser válidas en todas las configuraciones anatómicas (por ejemplo, deformaciones patológicas).

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/AllenInstitute/lightning-pose-ctlut-ctlut-tongue-model)
- [Repositorio de Lightning Pose en GitHub](https://github.com/paninski-lab/lightning-pose)
- [Documentación de Lightning Pose](https://lightning-pose.readthedocs.io/en/v2.0.1/index.html)
- [Allen Institute](https://alleninstitute.org/)
