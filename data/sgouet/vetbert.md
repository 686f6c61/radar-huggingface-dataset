# sgouet/VetBERT

## Resumen

VetBERT es un modelo de lenguaje especializado en el dominio de la medicina veterinaria, desarrollado por Brian Hur y colaboradores de la Universidad de Melbourne. Se trata de un modelo BERT preentrenado sobre más de 15 millones de registros clínicos veterinarios, que suman 1.300 millones de tokens, con el objetivo de adaptar el conocimiento lingüístico general de modelos biomédicos a la terminología y estructura específicas de las notas clínicas de animales.

El modelo se inicializa desde Bio_ClinicalBERT (a su vez derivado de BERT) y se pre-entrena con la tarea de enmascarado de lenguaje (masked language modeling). Su propósito principal es servir como base para tareas de clasificación de enfermedades, extracción de información y otras tareas de NLP sobre textos veterinarios. El modelo se publica bajo licencia OpenRAIL y está disponible en Hugging Face, aunque la versión original se encuentra en el repositorio havocy28/VetBERT.

Su relevancia actual radica en que es uno de los pocos modelos abiertos específicamente entrenados para el dominio veterinario, un ámbito con escasez de recursos lingüísticos. Permite a desarrolladores e investigadores construir sistemas de ayuda al diagnóstico, análisis de historiales clínicos o codificación automática de enfermedades sin partir de cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base, encoder-only transformer) |
| Parametros totales | no disponible (se estima 110M por ser BERT-base, pero no se confirma) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (máximo durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en precisión float32 o fp16, no se especifica) |
| Idiomas soportados | Inglés |
| Licencia | OpenRAIL |
| Formato de pesos | no disponible (probablemente PyTorch, no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

VetBERT sigue la arquitectura BERT estándar (transformer encoder) con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, según la configuración de BERT-base. El proceso de entrenamiento consta de dos fases: primero se inicializa con los pesos de Bio_ClinicalBERT, un modelo preentrenado en textos clínicos humanos, y después se continúa el preentrenamiento en el corpus VetCompass Australia, compuesto por más de 15 millones de registros clínicos veterinarios y 1.500 millones de tokens.

El preentrenamiento se realizó con una tarea de masked language modeling (MLM) con probabilidad de enmascarado del 15% y un máximo de 20 predicciones por secuencia. Los hiperparámetros fueron batch size 32, secuencia máxima de 512 tokens, learning rate de 5·10⁻⁵ y un factor de duplicación de 5 para generar diferentes máscaras sobre los mismos datos. No se utilizó next sentence prediction ni tareas adicionales. Posteriormente, el modelo se ajustó (fine-tuning) en un conjunto de 5.002 notas clínicas anotadas para la clasificación de síndromes de enfermedad, dando lugar a la versión VetBERTDx.

## Capacidades

- Generación de texto enmascarado (fill-mask) sobre notas clínicas veterinarias, útil para completar términos o conceptos médicos.
- Clasificación de síndromes de enfermedad a partir de notas clínicas (mediante fine-tuning, como se hizo en el paper original).
- Extracción de información clínica: reconocimiento de entidades como síntomas, tratamientos, diagnósticos.
- Comprensión de terminología veterinaria específica (especies, dosis, procedimientos) que BERT genérico no captura.
- Soporte de contexto de hasta 512 tokens, suficiente para notas clínicas típicas.
- Capacidad de adaptación mediante fine-tuning para otras tareas de NLP biomédico veterinario (NLI, question answering, etc.).
- No incluye soporte de tool calling ni agentes, al ser un modelo encoder-only.

## Casos de uso

- **Codificación automática de diagnósticos veterinarios**: se puede ajustar VetBERT sobre un conjunto de códigos de enfermedades (por ejemplo, ICD-10 veterinario) para clasificar notas clínicas y asignar el código correcto, acelerando el proceso administrativo en clínicas.
- **Asistente de escritura de notas clínicas**: mediante la tarea de fill-mask, el modelo puede sugerir términos médicos adecuados en el contexto de una nota, reduciendo errores tipográficos y mejorando la consistencia terminológica.
- **Triaje de casos clínicos**: un sistema que analice la gravedad de los síntomas descritos en una consulta inicial y recomiende prioridad de atención, basándose en el fine-tuning sobre datos anotados con niveles de urgencia.
- **Búsqueda semántica en historiales veterinarios**: al generar representaciones vectoriales de las notas, permite indexar y recuperar casos similares o antecedentes de pacientes, útil para investigación o segunda opinión.
- **Detección de efectos adversos de fármacos**: entrenar VetBERT para identificar menciones de reacciones adversas en notas clínicas y extraer el fármaco y la reacción, facilitando la farmacovigilancia veterinaria.
- **Investigación epidemiológica**: analizar grandes corpus de notas clínicas para identificar patrones de enfermedades emergentes o distribución geográfica de ciertas patologías, sin necesidad de anotación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (Hur et al., 2020) reporta resultados de clasificación de síndromes sobre el conjunto de 5.002 notas anotadas, pero no se incluyen en la model card ni en los resultados de búsqueda. No se dispone de métricas comparativas con otros modelos en tareas estándar como MMLU o HumanEval.

## Requisitos de hardware

- Al ser un modelo BERT-base (110M parámetros), puede ejecutarse en CPU con memoria RAM de 8-12 GB, aunque la inferencia será lenta.
- Para una inferencia razonable, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior). Con cuantización INT8 se puede reducir el uso a ~220 MB.
- En GPU de nivel consumidor (RTX 3060, 3080, 4090) el modelo se ejecuta sin problemas y con baja latencia (<50 ms por muestra).
- Opciones de despliegue: Transformers de Hugging Face (PyTorch), ONNX Runtime, TensorRT, o mediante servidores de inferencia como TGI (Text Generation Inference) o vLLM (aunque estos están orientados a modelos generativos, pueden servir para encoder-only).
- Para producción, se puede servir con FastAPI + Transformers o mediante ONNX para optimizar la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VetBERT (este) | ~110M (estimado) | 512 | 15M notas veterinarias | OpenRAIL | Hugging Face |
| Bio_ClinicalBERT | ~110M | 512 | Notas clínicas humanas (MIMIC) | MIT | Hugging Face |
| BERT-base | ~110M | 512 | Wikipedia + BookCorpus | Apache 2.0 | Hugging Face |
| PubMedBERT | ~110M | 512 | Abstracts PubMed | Apache 2.0 | Hugging Face |

VetBERT se diferencia por estar entrenado específicamente en el dominio veterinario, lo que le da una ventaja frente a BERT general o Bio_ClinicalBERT cuando se trabaja con terminología de animales (especies, patologías, fármacos). Sin embargo, no tiene una ventaja clara sobre PubMedBERT en tareas biomédicas generales. Su licencia OpenRAIL permite uso comercial, aunque con ciertas restricciones de uso indebido.

## Limitaciones y advertencias

- Modelo entrenado únicamente en inglés; no soporta otros idiomas.
- El vocabulario y las entidades están orientados a la práctica veterinaria australiana (VetCompass), por lo que puede tener sesgos geográficos o de especies (mayoría perros y gatos, menos otras especies).
- No es un modelo generativo; solo produce representaciones y tareas de enmascarado, por lo que no puede generar texto libre.
- Riesgo de alucinación en tareas de clasificación si se usa sin fine-tuning adecuado; no debe emplearse como herramienta de diagnóstico sin supervisión humana.
- La licencia OpenRAIL permite uso comercial, pero prohíbe ciertos usos considerados de alto riesgo (por ejemplo, diagnóstico sin supervisión médica).
- El modelo fue preentrenado en 2020; puede no incluir vocabulario más reciente de fármacos o procedimientos.
- No se proporcionan pesos cuantizados ni versiones optimizadas (GGUF, ONNX) en la información disponible.

## Enlaces

- Repositorio Hugging Face (versión en sgouet): https://huggingface.co/sgouet/VetBERT
- Repositorio Hugging Face (versión original havocy28): https://huggingface.co/havocy28/VetBERT
- Repositorio GitHub: https://github.com/havocy28/VetBERT
- Paper original (Hur et al., 2020): https://aclanthology.org/2020.bionlp-1.17
- Página de VetCompass Australia: https://www.vetcompass.com.au/
- Modelo VetBERTDx (fine-tuned para clasificación): https://huggingface.co/havocy28/VetBERTDx
