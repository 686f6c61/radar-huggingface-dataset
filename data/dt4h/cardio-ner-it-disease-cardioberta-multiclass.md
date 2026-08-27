# DT4H/cardio-ner-it-disease-cardioberta-multiclass

## Resumen

El modelo `cardio-ner-it-disease-cardioberta-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de menciones de enfermedades en texto clínico de cardiología en italiano. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H) como parte de su plataforma federada para el análisis de datos cardiovasculares. Se basa en el modelo `DT4H/CardioBERTa.it`, un BERT preentrenado específicamente para el dominio cardiológico en italiano, y se ha ajustado mediante fine-tuning para la tarea de clasificación de spans (etiquetado IOB) con una única clase de entidad: `DISEASE`.

El modelo resuelve el problema de extraer automáticamente diagnósticos y patologías de informes clínicos, historiales electrónicos y otros documentos médicos en italiano, un paso clave para la reutilización de datos de salud en investigación y práctica clínica. Su relevancia actual radica en la creciente necesidad de procesar grandes volúmenes de texto clínico no estructurado, especialmente en el ámbito cardiovascular, donde la interoperabilidad y el análisis federado son prioridades. Con 109 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en hardware moderado, y su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (Transformer encoder) |
| Parametros totales | 109.339.395 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `DT4H/CardioBERTa.it`, que a su vez es una variante de BERT preentrenada sobre corpus clínicos y cardiológicos en italiano. La arquitectura es un transformer encoder estándar con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, configurado para clasificación de tokens con etiquetado IOB (Inside, Outside, Beginning). La tarea es de clasificación de spans multiclase, aunque en este caso solo se predice la entidad `DISEASE`.

El entrenamiento se realizó mediante validación cruzada de 10 pliegues sobre la porción italiana del corpus CardioCCC (DataTools4Heart Cardiology Clinical Case Corpus), concretamente los lotes 1 y 2, con 508 documentos anotados manualmente y validados (versión `1_validated_without_sugs`). El checkpoint publicado es la media aritmética de los 10 modelos por pliegue, una técnica de promediado de pesos descrita en el artículo CardioLM. No se especifica el número de épocas, la tasa de aprendizaje ni el tamaño de lote, ni si se aplicaron técnicas como RLHF o DPO; el proceso es un fine-tuning supervisado estándar para NER.

## Capacidades

- Reconocimiento de entidades de tipo `DISEASE` en texto clínico de cardiología en italiano.
- Clasificación de spans con etiquetado IOB, devolviendo el inicio, fin y tipo de entidad.
- Manejo de textos largos mediante ventana deslizante con stride (por ejemplo, `stride=125`).
- Integración sencilla con la librería `transformers` mediante el pipeline de `token-classification`.
- Soporte de `trust_remote_code` para cargar el modelo con código personalizado.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio; es exclusivamente un modelo de extracción de información.

## Casos de uso

- **Extracción de diagnósticos de informes de alta hospitalaria**: el modelo puede procesar automáticamente los textos de alta de pacientes cardiológicos para identificar las enfermedades mencionadas, facilitando la codificación y el análisis retrospectivo.
- **Anonimización y reutilización de historias clínicas electrónicas**: al detectar menciones de enfermedades, ayuda a estructurar datos no estructurados para su integración en bases de datos de investigación, respetando la privacidad mediante pipelines federados.
- **Apoyo a la codificación ICD-10**: las entidades extraídas pueden mapearse a códigos de clasificación internacional de enfermedades, reduciendo el trabajo manual de los codificadores clínicos.
- **Monitorización de ensayos clínicos**: en documentos de selección de pacientes, el modelo identifica las patologías relevantes para los criterios de inclusión y exclusión, acelerando el reclutamiento.
- **Análisis de cohortes en cardiología**: permite agrupar pacientes por patologías específicas (insuficiencia cardíaca, arritmias, etc.) a partir de texto libre, sin necesidad de campos estructurados.
- **Sistemas de soporte a la decisión clínica**: integrado en un sistema de ayuda al diagnóstico, el modelo puede resaltar enfermedades mencionadas en la narrativa clínica para alertar al profesional sobre posibles comorbilidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall o F1 sobre el corpus de validación, ni comparaciones con otros modelos. Se recomienda consultar el repositorio GitHub de CardioNER para posibles actualizaciones.

## Requisitos de hardware

- Al ser un modelo BERT base de 109 millones de parámetros, la inferencia es viable en CPU, aunque con mayor latencia.
- En GPU, se estima que requiere menos de 2 GB de VRAM en precisión FP16, por lo que es compatible con GPUs de consumo como la NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, o superiores.
- Para despliegue en producción, se puede servir con `transformers` + PyTorch, o mediante frameworks como ONNX Runtime o TensorRT para optimización.
- No se dispone de datos de latencia o throughput específicos; en una GPU moderna, un lote de 32 secuencias de 512 tokens debería procesarse en menos de un segundo.
- El modelo también puede ejecutarse en entornos sin GPU, como instancias de CPU en la nube, con tiempos de inferencia aceptables para procesamiento por lotes.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos NER biomédicos en italiano. Existen alternativas como `bert-italian-ner` (basado en BERT general) o modelos multilingües como `xlm-roberta-large-ner`, pero no se han encontrado datos de rendimiento comparables en el dominio cardiológico. El modelo se distingue por su especialización en cardiología y su licencia MIT, que facilita su adopción comercial. Se recomienda evaluar sobre el corpus CardioCCC para una comparación justa.

## Limitaciones y advertencias

- El modelo solo reconoce la entidad `DISEASE`; no detecta medicamentos, procedimientos, síntomas ni otras entidades clínicas.
- Está entrenado exclusivamente en italiano, por lo que no es aplicable a otros idiomas sin reentrenamiento.
- La longitud de contexto está limitada por la arquitectura BERT (típicamente 512 tokens); para textos más largos se requiere segmentación con ventana deslizante, lo que puede perder contexto entre fragmentos.
- Al ser un modelo de NER, no genera texto y no es adecuado para tareas de razonamiento o generación.
- El entrenamiento se realizó sobre un corpus específico de casos clínicos de cardiología; el rendimiento puede degradarse en otros dominios médicos o en estilos de redacción muy diferentes.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión real en producción.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye sin garantías; es responsabilidad del usuario validar su comportamiento en el contexto de uso.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/DT4H/cardio-ner-it-disease-cardioberta-multiclass)
- [Repositorio CardioNER en GitHub](https://github.com/DataTools4Heart/CardioNER)
- [Organización DataTools4Heart en GitHub](https://github.com/DataTools4Heart/)
- [Sitio web del proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- [Modelo base CardioBERTa.it](https://huggingface.co/DT4H/CardioBERTa.it)
