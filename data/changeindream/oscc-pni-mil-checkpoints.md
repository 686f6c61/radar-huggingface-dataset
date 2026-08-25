# changeindream/oscc-pni-mil-checkpoints

## Resumen

El repositorio `changeindream/oscc-pni-mil-checkpoints` contiene un conjunto de checkpoints de inferencia en PyTorch para un sistema de aprendizaje por instancias múltiples (MIL, por sus siglas en inglés) aplicado a la clasificación de cáncer oral (OSCC) e invasión perineural (PNI) a partir de tomografías computarizadas (CT) con contraste. El autor, changeindream, publica estos pesos como parte de una demostración de investigación, con el objetivo de permitir la reproducibilidad de un estudio retrospectivo aún no validado externamente.

El repositorio incluye cuatro variantes de modelos MIL: Swin Transformer, Vision Transformer (ViT), DenseNet-121 y un checkpoint ResNet que actualmente contiene una ResNet-152 como placeholder, aunque la interfaz pública lo etiqueta como ResNet-101. Los checkpoints son solo de inferencia, sin estados de optimizador, y se acompañan de un archivo `manifest.json` con checksums SHA-256 para verificar la integridad. El tamaño total del repositorio es de 1.0 GB.

La relevancia de este modelo radica en su enfoque específico para un problema clínico concreto: la detección de invasión perineural en cáncer oral mediante análisis de imágenes de CT. Sin embargo, su uso está estrictamente limitado a fines de investigación y reproducibilidad, y no está aprobado como dispositivo médico ni para decisiones diagnósticas o terapéuticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MIL con backbones: Swin Transformer, Vision Transformer, DenseNet-121 y ResNet (placeholder ResNet-152) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen) |
| Tipos de cuantizacion | no disponible (sin cuantización, según la model card) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | PyTorch state dictionaries (.pt) |

## Arquitectura y entrenamiento

Los modelos implementan el paradigma de aprendizaje por instancias múltiples (MIL), donde cada paciente se representa como un conjunto de instancias (cortes axiales de CT) y la clasificación se realiza a nivel de paciente, no de imagen individual. Los backbones utilizados son arquitecturas de visión por computadora bien conocidas: Swin Transformer, Vision Transformer, DenseNet-121 y ResNet. No se proporcionan detalles sobre el proceso de entrenamiento, como el número de épocas, la composición del dataset, el número de pacientes o si se aplicaron técnicas de ajuste fino o regularización específicas. La model card indica que los checkpoints de entrenamiento originales se exportaron eliminando los estados del optimizador, sin cuantización, y que se registran checksums SHA-256 en `manifest.json` para garantizar la trazabilidad.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, dado que se trata de un modelo de clasificación de imágenes médicas, no de generación de texto.

## Capacidades

- Clasificación de imágenes médicas: el modelo clasifica cortes axiales de CT con contraste para detectar invasión perineural en cáncer oral.
- Aprendizaje por instancias múltiples: agrega información de múltiples cortes para producir una predicción a nivel de paciente.
- Inferencia sobre imágenes preprocesadas: acepta imágenes PNG/JPEG de 224×224 píxeles, convertidas a RGB y normalizadas con media y desviación estándar de ImageNet.
- Soporte de múltiples arquitecturas: permite comparar el rendimiento de Swin Transformer, ViT, DenseNet-121 y ResNet en la misma tarea.
- Reproducibilidad: incluye checksums SHA-256 y código fuente Gradio para desplegar una demo de inferencia.

No se reportan capacidades de tool calling, agentes, razonamiento multi-paso, generación de texto, visión general (solo imágenes médicas específicas) ni soporte multilingüe.

## Casos de uso

- Investigación en diagnóstico de cáncer oral: el modelo puede utilizarse en estudios retrospectivos para evaluar si la invasión perineural es detectable mediante CT con contraste, comparando su rendimiento con la evaluación de radiólogos expertos.
- Reproducibilidad de resultados académicos: los checkpoints permiten a otros investigadores replicar los experimentos del estudio original, gracias a los checksums y al código fuente incluido.
- Desarrollo de pipelines de análisis de imagen médica: el código Gradio y los pesos pueden integrarse en prototipos de investigación que procesen cortes de CT guiados por ROI para clasificación automática.
- Comparación de arquitecturas en MIL: al disponer de cuatro backbones diferentes, se puede estudiar cuál arquitectura es más adecuada para la tarea de PNI en OSCC, tanto en precisión como en eficiencia computacional.
- Formación y docencia: el repositorio sirve como ejemplo práctico de aplicación de MIL a imágenes médicas, útil para cursos de deep learning aplicado a salud.
- Auditoría de modelos médicos: al ser un modelo de investigación, puede utilizarse para analizar sesgos y limitaciones en la detección de PNI antes de considerar cualquier uso clínico futuro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como sensibilidad, especificidad, AUC u otras medidas de rendimiento clínico. Tampoco se comparan los resultados con otros modelos o métodos existentes.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la información disponible. Dado que el repositorio tiene un tamaño de 1.0 GB y los modelos son arquitecturas estándar de visión (Swin, ViT, DenseNet, ResNet), se puede inferir que la inferencia es factible en GPUs de consumo medio, pero no se dispone de datos concretos sobre VRAM, latencia o throughput. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. El código fuente incluido sugiere el uso de Gradio para una demo local, lo que implica un entorno Python con PyTorch.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (MIL para detección de PNI en OSCC). No se han encontrado referencias a otros checkpoints públicos con la misma finalidad en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: el modelo no está aprobado para diagnóstico, triaje, pronóstico o decisiones de tratamiento. Su uso se limita a investigación y reproducibilidad.
- Validación externa pendiente: el estudio retrospectivo subyacente no ha completado una validación prospectiva con separación por centros, por lo que su generalización a otros entornos clínicos es incierta.
- Checkpoint ResNet placeholder: el archivo `resnet152_mil.pt` contiene una ResNet-152, no la ResNet-101 mencionada en el manuscrito. Esto puede causar discrepancias si se cita el resultado sin reemplazar el checkpoint.
- Entradas restringidas: el modelo solo acepta cortes axiales de CT con contraste, guiados por ROI, desidentificados, en formato PNG/JPEG, redimensionados a 224×224 y normalizados con estadísticas de ImageNet. No soporta series DICOM completas ni volúmenes de CT sin procesar.
- Licencia no especificada: la licencia se indica como "other", sin detalles sobre restricciones de uso comercial o modificación. Esto puede limitar su adopción en entornos industriales.
- Riesgo de alucinación: aunque no es un modelo generativo, la clasificación automática puede producir falsos positivos o negativos, con implicaciones clínicas graves si se malinterpreta como diagnóstico.
- Sesgos potenciales: al ser un modelo entrenado en un dataset retrospectivo específico, puede presentar sesgos relacionados con la demografía de la población, el equipo de adquisición de imágenes o los criterios de inclusión del estudio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/changeindream/oscc-pni-mil-checkpoints
