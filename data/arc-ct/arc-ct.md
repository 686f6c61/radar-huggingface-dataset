# arc-ct/arc-ct

## Resumen

ARC-CT (Anatomy-Routed Contrastive Vision-Language Learning for 3D Chest CT) es un modelo de visión por computadora desarrollado por el equipo de quin-med-harvard-edu, presentado en el TIA workshop de MICCAI 2026. Su objetivo es clasificar anomalías en tomografías computarizadas (CT) de tórax sin necesidad de anotaciones manuales ni bounding boxes, utilizando aprendizaje contrastivo entre volúmenes de CT y sus informes radiológicos asociados. El modelo es capaz de clasificar 18 anomalías en modo zero-shot comparando el volumen con prompts de texto.

La arquitectura combina un encoder de imagen 3D ResNet-18, un módulo de consultas llamado AnatomyQFormer con 30 queries (10 anatómicas, 18 de patología y 2 globales), y un encoder de texto CXR-BERT congelado con LoRA de rango 8. El modelo se entrena con objetivos como InfoNCE suave basado en Jaccard, alineación por órgano y supervisión por token de consulta. Los checkpoints publicados incluyen tres semillas del modelo completo y un backbone de la etapa 1 para warm-start.

La relevancia de ARC-CT radica en que aborda un problema específico de la imagen médica: las anomalías pequeñas o localizadas se diluyen al promediar todo el volumen en una única representación. Su enfoque de enrutamiento anatómico permite que las consultas se enfoquen en regiones específicas, mejorando la precisión. Está disponible bajo licencia MIT y los checkpoints se pueden descargar desde Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D ResNet-18 (imagen) + AnatomyQFormer (30 queries) + CXR-BERT (texto, congelado con LoRA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión 3D, no procesa texto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

Otros datos técnicos de la model card:

- Entrada de imagen: volumen 3D de dimensiones `3 x 96 x 192 x 192` a resolución de `1.5 x 1.5 x 3.0 mm`, con tres ventanas HU (pulmón, tejido blando y hueso).
- Consultas del Q-Former: 30 en total, distribuidas en 10 anatómicas (cada una enmascarada a un grupo de órganos), 18 de patología y 2 globales.
- Inicialización del encoder de imagen: Kinetics-400.
- Tamaño del repositorio: 4.1 GB (cuatro archivos de checkpoint).

## Arquitectura y entrenamiento

ARC-CT se basa en un enfoque de aprendizaje contrastivo visión-lenguaje adaptado a volúmenes 3D. El encoder de imagen es un ResNet-18 3D preentrenado en Kinetics-400 que procesa el volumen de entrada en tres ventanas Hounsfield (pulmón, tejido blando y hueso). El módulo AnatomyQFormer utiliza 30 consultas aprendibles: 10 consultas anatómicas que se enmascaran a grupos de órganos específicos, 18 consultas de patología y 2 consultas globales. El encoder de texto es CXR-BERT, congelado excepto por adaptadores LoRA de rango 8 aplicados a las proyecciones de query y value de las capas superiores.

El entrenamiento se realiza sobre el dataset CT-RATE, que contiene pares de volúmenes de CT de tórax sin contraste y sus informes radiológicos. No se utilizan anotaciones manuales ni bounding boxes. Los objetivos de entrenamiento incluyen una variante suave de InfoNCE basada en la similitud de etiquetas (label-Jaccard), alineación por órgano y supervisión por token de consulta. El modelo se publica en tres semillas (0, 1 y 2) para evaluar la robustez. En inferencia, no se requieren máscaras de órganos (modo mask-free), aunque proporcionarlas (mediante TotalSegmentator) mejora ligeramente el rendimiento. El modelo no genera texto ni requiere llamadas a un modelo de lenguaje durante la inferencia.

## Capacidades

- Clasificación zero-shot de 18 anomalías en CT de tórax a partir de prompts de texto (p. ej., "derrame pleural", "nódulo pulmonar").
- Procesamiento de volúmenes 3D completos con entrada de tres ventanas Hounsfield.
- Enrutamiento anatómico de consultas: las consultas se asignan a grupos de órganos si se proporcionan máscaras de segmentación, mejorando la precisión.
- Inferencia sin máscaras (modo mask-free) como opción por defecto, sin necesidad de segmentación previa.
- No requiere generación de texto, tool calling, ni razonamiento multi-paso; es un modelo puramente discriminativo para clasificación de imágenes médicas.
- Capacidades multilingües: no especificadas; el encoder de texto CXR-BERT está entrenado con informes radiológicos en inglés.

## Casos de uso

- Asistencia al radiólogo en la detección de anomalías torácicas: el modelo puede preclasificar volúmenes de CT y señalar posibles hallazgos, reduciendo el tiempo de revisión. Su naturaleza zero-shot permite probar nuevas categorías sin reentrenamiento.
- Screening poblacional de enfermedades pulmonares: al no requerir anotaciones manuales, puede aplicarse a grandes cohortes de CT sin contraste para identificar patrones de prevalencia de las 18 anomalías.
- Investigación en imagen médica: como herramienta de baseline para estudios que comparan métodos de clasificación de CT con aprendizaje contrastivo, o para explorar la transferencia a otros dominios (con las limitaciones indicadas).
- Desarrollo de pipelines de IA médica: su integración es sencilla (Python, PyTorch) y puede conectarse a sistemas de PACS o flujos de trabajo de investigación.
- Evaluación de calidad de adquisición: aunque no es su propósito principal, la sensibilidad a cambios de protocolo podría usarse para detectar variaciones en la adquisición de imágenes (con las debidas precauciones).
- Docencia y formación: como ejemplo de aplicación de aprendizaje contrastivo visión-lenguaje en un dominio 3D con datos médicos reales.

## Benchmarks y rendimiento

Los checkpoints publicados se evaluaron en la partición de validación de CT-RATE (3.002 volúmenes). Se reportan dos configuraciones: sin máscaras de órganos (mask-free) y con máscaras de TotalSegmentator. La siguiente tabla muestra el macro AUC para cada semilla y la media ± desviación estándar:

| Checkpoint | macro AUC (mask-free) | macro AUC (con máscaras de órganos) |
|---|---|---|
| `arcct_seed0.pt` | 0.8431 | 0.8547 |
| `arcct_seed1.pt` | 0.8409 | 0.8530 |
| `arcct_seed2.pt` | 0.8428 | 0.8545 |
| **Media ± s.d.** | **0.8423 ± 0.0012** | **0.8541 ± 0.0009** |

La diferencia entre ambas configuraciones es de +0.0118 macro AUC. La model card advierte que el paper reporta un valor de 0.855 y describe una brecha de +0.001, pero los números medidos en los archivos liberados no reproducen esa brecha; se recomienda citar la configuración realmente utilizada. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la documentación disponible. Sin embargo, el tamaño del repositorio (4.1 GB) indica que cada checkpoint ocupa aproximadamente 1 GB, lo que sugiere un modelo de tamaño moderado. Dado que el encoder de imagen es un ResNet-18 3D con entrada de 96×192×192, el consumo de VRAM en inferencia dependerá del tamaño del lote y de la precisión, pero no se dispone de cifras concretas. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Para ejecutar el modelo se necesita un entorno Python con PyTorch y las dependencias del repositorio oficial (https://github.com/arc-ct/arc-ct). Se recomienda utilizar una GPU con al menos 8 GB de VRAM para una inferencia razonable, aunque esto es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en las fuentes proporcionadas. ARC-CT es un modelo específico para CT de tórax con aprendizaje contrastivo y no se han reportado comparaciones con otras arquitecturas similares (p. ej., otros modelos de visión-lenguaje médicos) en los documentos consultados.

## Limitaciones y advertencias

- Uso exclusivo para investigación: el modelo no es un dispositivo médico y no debe utilizarse para decisiones clínicas.
- Entrenamiento en un único dataset (CT-RATE) de CT de tórax sin contraste y de una sola fuente; la precisión disminuye bajo cambios de escáner o protocolo, como se reporta en la evaluación externa RAD-ChestCT del paper.
- Las capacidades multilingües no están especificadas; el encoder de texto está entrenado con informes en inglés, por lo que los prompts en otros idiomas pueden no funcionar correctamente.
- El modelo solo clasifica las 18 anomalías definidas en el entrenamiento; no es un sistema general de diagnóstico.
- La diferencia entre la configuración con y sin máscaras es pequeña pero no despreciable; los resultados deben interpretarse según la configuración utilizada.
- Los checkpoints han sido verificados en la partición de validación, pero no se garantiza el rendimiento en otros conjuntos de datos.
- Al ser un modelo de investigación, no se ofrecen garantías de soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arc-ct/arc-ct
- Paper en arXiv: https://arxiv.org/abs/2608.28455
- Repositorio GitHub: https://github.com/arc-ct/arc-ct
- Paper en OpenReview: https://openreview.net/forum?id=t6mhjZ4R70
- Dataset CT-RATE: https://huggingface.co/datasets/ibrahimhamamci/CT-RATE
