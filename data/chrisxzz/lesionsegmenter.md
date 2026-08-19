# ChrisXzZ/LesionSegmenter

## Resumen

LesionSegmenter es un checkpoint de nnUNet v2 desarrollado por ChrisXzZ para la segmentación automática de lesiones multi-órgano en tomografías computarizadas (CT) abdominales. El modelo está entrenado sobre un conjunto de datos multicéntrico a gran escala con máscaras de lesiones anotadas por expertos en hígado, páncreas, riñón y colon. Su propósito es facilitar la detección y delimitación precisa de lesiones en imágenes médicas, un paso crítico para el diagnóstico asistido por ordenador y la planificación de tratamientos.

El repositorio incluye los pesos del modelo, scripts de inferencia y post-procesamiento, así como ejemplos de CT en formato NIfTI. La arquitectura subyacente es nnUNet v2, un framework de segmentación basado en U-Net que se adapta automáticamente a las características del dataset. El tamaño del repositorio es de 42.2 GB, lo que sugiere que contiene los pesos completos del modelo y posiblemente datos de ejemplo. La licencia es CC-BY-4.0, que permite uso comercial con atribución.

La relevancia de este modelo radica en su capacidad para segmentar múltiples órganos y lesiones simultáneamente a partir de un único volumen CT, lo que reduce la necesidad de modelos separados y agiliza el flujo de trabajo clínico. Aunque no se proporcionan métricas de rendimiento, la disponibilidad de scripts listos para usar y la integración con nnUNet v2 lo convierten en una opción práctica para investigadores y desarrolladores en el ámbito de la imagen médica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnUNet v2 (U-Net adaptativa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imágenes médicas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no especificado (probablemente .pth o .pt de PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en nnUNet v2, un framework de segmentación semántica que automatiza el diseño de la arquitectura U-Net, la configuración de preprocesamiento y el entrenamiento. nnUNet v2 ajusta dinámicamente la profundidad, el número de filtros y el tamaño del patch según las propiedades del dataset, lo que permite un rendimiento robusto sin ajuste manual extensivo. El checkpoint incluido está entrenado específicamente para segmentar lesiones en hígado, páncreas, riñón y colon a partir de CT abdominales.

El entrenamiento se realizó sobre un dataset multicéntrico a gran escala con anotaciones de expertos, aunque no se especifican el número de volúmenes, la resolución espacial ni las técnicas de aumento de datos empleadas. Tampoco se detalla si se utilizó aprendizaje por transferencia o estrategias de regularización adicionales. La model card indica que el modelo requiere CUDA 12.8 y driver 570.124.05, lo que sugiere que fue entrenado con PyTorch y posiblemente con soporte de Tensor Cores de última generación.

## Capacidades

- Segmentación semántica de lesiones en CT abdominal: identifica y delimita lesiones en hígado, páncreas, riñón (izquierdo y derecho) y colon.
- Segmentación de órganos completos: además de las lesiones, genera máscaras para hígado, páncreas, riñones y colon, lo que permite análisis anatómicos completos.
- Procesamiento de volúmenes 3D: acepta archivos .nii.gz de CT completos, no imágenes 2D individuales.
- Salida en formato BDMAP: tras el post-procesamiento, produce etiquetas combinadas y segmentaciones por órgano/lesión en archivos NIfTI.
- Integración con nnUNet v2: permite reentrenamiento o fine-tuning con nuevos datos siguiendo el flujo estándar de nnUNet.
- Inferencia por lotes: los scripts incluidos procesan múltiples CT de forma secuencial, facilitando su uso en pipelines clínicos.

## Casos de uso

- Diagnóstico asistido por ordenador: el modelo puede pre-segmentar lesiones hepáticas, pancreáticas, renales y de colon en CT abdominales, ayudando a los radiólogos a localizar y medir lesiones de forma más rápida y consistente.
- Planificación de tratamientos: las máscaras de lesiones y órganos generadas pueden usarse para calcular volúmenes tumorales, guiar la radioterapia o evaluar la respuesta a tratamientos oncológicos.
- Investigación clínica: los investigadores pueden aplicar el modelo a cohortes de pacientes para extraer biomarcadores cuantitativos (volumen, número de lesiones) y correlacionarlos con variables clínicas.
- Desarrollo de pipelines de análisis de imagen: al integrarse con nnUNet v2, el checkpoint puede incorporarse en flujos de trabajo existentes de segmentación y post-procesado, por ejemplo, para estudios longitudinales.
- Formación y validación de algoritmos: el modelo puede servir como baseline para comparar nuevos métodos de segmentación de lesiones multi-órgano.
- Telemedicina y triaje: en entornos con recursos limitados, la segmentación automática puede priorizar casos que requieren revisión urgente, aunque se requiere validación clínica adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como Dice, IoU, sensibilidad o especificidad, ni comparaciones con otros modelos de segmentación. Se recomienda a los usuarios evaluar el modelo en sus propios datos antes de su uso en producción.

## Requisitos de hardware

- GPU NVIDIA con driver 570.124.05 y CUDA 12.8 como mínimo (según la model card).
- No se especifica la VRAM necesaria. Dado que nnUNet v2 para segmentación 3D suele requerir entre 8 y 16 GB de VRAM dependiendo del tamaño del patch y la resolución, se recomienda una GPU con al menos 12 GB (p. ej., RTX 3080/4080, A5000) para inferencia estándar.
- El repositorio incluye scripts de inferencia y post-procesamiento que requieren un sistema Linux con conda y Python 3.10.
- Para entrenamiento o fine-tuning, se necesitaría una GPU con mayor memoria (p. ej., A100 40 GB o H100) y almacenamiento suficiente para el dataset.
- Opciones de despliegue: el modelo se ejecuta mediante los scripts proporcionados (inference.sh y post_process.sh) que utilizan la instalación local de nnUNet. No se mencionan integraciones con vLLM, Ollama u otros servidores de inferencia, ya que es un modelo de visión médica, no de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para segmentación de lesiones multi-órgano en CT abdominal. Existen otros checkpoints de nnUNet v2 para tareas similares (p. ej., segmentación de tumores hepáticos), pero no se han encontrado datos públicos que permitan una comparación directa en términos de rendimiento o arquitectura. Se recomienda consultar el repositorio de nnUNet y la literatura de segmentación médica para alternativas.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para CT abdominales; su rendimiento en otras modalidades (RM, PET) o regiones anatómicas no está garantizado.
- No se proporcionan métricas de validación, por lo que el rendimiento clínico real es desconocido. Es imprescindible validar el modelo en la población y el equipo de adquisición de imágenes objetivo antes de cualquier uso clínico.
- Los scripts de inferencia requieren que los archivos CT sigan la convención de nombres "_0000.nii.gz"; cualquier desviación puede causar errores.
- La salida en formato BDMAP puede requerir herramientas adicionales para su visualización o integración en sistemas de información radiológica.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor. No se especifican restricciones adicionales sobre el uso de los datos de entrenamiento.
- El modelo no es un sistema de diagnóstico autónomo; las segmentaciones deben ser revisadas por personal médico cualificado.
- No se indica si el modelo ha sido evaluado en términos de sesgos demográficos o variabilidad entre centros, lo que podría afectar su generalización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ChrisXzZ/LesionSegmenter
- Repositorio nnUNet (referencia de arquitectura): https://github.com/MIC-DKFZ/nnUNet
- Documentación de nnUNet v2: https://github.com/MIC-DKFZ/nnUNet/blob/master/readme.md
