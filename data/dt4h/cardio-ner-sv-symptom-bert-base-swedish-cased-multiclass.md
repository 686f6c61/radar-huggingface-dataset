# DT4H/cardio-ner-sv-symptom-bert-base-swedish-cased-multiclass

## Resumen

El modelo `DT4H/cardio-ner-sv-symptom-bert-base-swedish-cased-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de síntomas en textos clínicos de cardiología en sueco. Ha sido desarrollado por el consorcio DT4H (DataTools4Heart), un proyecto europeo financiado por Horizon Europe (acuerdo de subvención 101057849), cuyo objetivo es crear herramientas de procesamiento de lenguaje natural para el dominio cardiovascular.

Se trata de un fine-tuning del modelo `KBLab/bert-base-swedish-cased`, un BERT base entrenado sobre corpus suecos, adaptado para la tarea de clasificación de tokens (token-classification) con etiquetas multiclase de síntomas. Con 124 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que lo hace accesible para entornos clínicos y de investigación con recursos limitados.

La relevancia de este modelo radica en que el sueco es un idioma con escasos recursos en el ámbito de la IA clínica. Al ofrecer una herramienta específica para cardiología, facilita la extracción estructurada de información de informes médicos, historias clínicas electrónicas y literatura científica, contribuyendo a la interoperabilidad de datos sanitarios en países nórdicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder-only transformer) |
| Parametros totales | 124.102.659 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (típico de BERT base: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sv (sueco) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `KBLab/bert-base-swedish-cased`, una implementación de BERT con la misma configuración que el BERT base original de Google (12 capas, 768 dimensiones ocultas, 12 cabezas de atención), entrenada sobre aproximadamente 15-20 GB de texto sueco procedente de fuentes diversas como libros, noticias, debates parlamentarios y contenido web. El modelo base utiliza tokenización con distinción de mayúsculas y minúsculas (cased).

Sobre esta base, se ha realizado un fine-tuning para la tarea de token-classification (NER) con un enfoque multiclase, orientado específicamente al reconocimiento de síntomas en el dominio de la cardiología. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de épocas, la tasa de aprendizaje ni la metodología exacta de ajuste. Tampoco se especifica si se emplearon técnicas como data augmentation o validación cruzada, aunque otros modelos del mismo proyecto DT4H (por ejemplo, la versión en inglés) mencionan el uso de SLERP y 10 folds, lo que sugiere una metodología similar, pero no confirmada para esta variante.

## Capacidades

- Reconocimiento de entidades nombradas (NER) a nivel de token para síntomas en textos clínicos cardiológicos en sueco.
- Clasificación multiclase de tokens, lo que permite distinguir entre diferentes tipos de síntomas o categorías relacionadas.
- Procesamiento de texto clínico en sueco, incluyendo informes médicos, notas de enfermería y resúmenes de alta.
- Integración sencilla con el ecosistema Hugging Face Transformers mediante `AutoModelForTokenClassification`.
- No se documentan capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multilingüe más allá del sueco.

## Casos de uso

- Extracción de síntomas de informes de alta hospitalaria en cardiología: el modelo puede procesar automáticamente textos en sueco y extraer menciones de síntomas como dolor torácico, disnea o palpitaciones, estructurándolas para su análisis posterior.
- Soporte a historias clínicas electrónicas (HCE): integrado en sistemas de gestión sanitaria, permite etiquetar y clasificar síntomas en notas clínicas, facilitando la búsqueda y la agregación de datos para estudios epidemiológicos.
- Investigación clínica en cardiología: los investigadores pueden utilizar el modelo para anotar grandes volúmenes de literatura médica sueca o registros de pacientes, acelerando la revisión sistemática y el descubrimiento de patrones sintomáticos.
- Sistemas de codificación automática: ayuda a mapear síntomas extraídos a clasificaciones estandarizadas como ICD-10, reduciendo el trabajo manual de codificadores clínicos.
- Monitorización de ensayos clínicos: en estudios multicéntricos con documentación en sueco, el modelo puede homogeneizar la extracción de síntomas y garantizar consistencia entre centros.
- Desarrollo de chatbots o asistentes clínicos: aunque el modelo no genera texto, puede servir como componente de extracción de entidades en un pipeline más amplio que responda preguntas sobre síntomas cardiológicos en sueco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de validación estándar (p. ej., MMLU, HumanEval, GSM8K) ni sobre corpus clínicos específicos. El repositorio de Hugging Face no incluye tablas de evaluación ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124M parámetros × 4 bytes). Con cuantización a 8 bits, se reduce a unos 0,25 GB; a 4 bits, alrededor de 0,12 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1650, RTX 3060 o superiores funcionan sin problemas. También es viable en CPU con un rendimiento aceptable para inferencia por lotes pequeños.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna, incluso integradas.
- Opciones de despliegue: al ser un modelo de Hugging Face, se puede servir con bibliotecas como `transformers` (PyTorch), `onnxruntime`, `TensorRT` o mediante frameworks de inferencia como `vLLM` (aunque para modelos BERT pequeños no es lo habitual), `TGI` (Text Generation Inference) o `Ollama` (si se convierte a GGUF). También se puede exportar a ONNX para entornos de producción.
- Latencia y throughput estimados: no disponibles. Para un modelo de 124M parámetros, la inferencia en GPU suele ser del orden de 1-5 ms por secuencia de 128 tokens, y en CPU de 20-100 ms, dependiendo del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Idioma | Tarea | Parámetros | Contexto | Licencia |
|---|---|---|---|---|---|
| DT4H/cardio-ner-sv-symptom-bert-base-swedish-cased-multiclass | Sueco | NER síntomas cardiología | 124M | no disponible | no disponible |
| DT4H/cardio-ner-en-cardioberta-multiclass | Inglés | NER enfermedades, medicación, procedimientos, síntomas | no disponible | no disponible | no disponible |
| DT4H/cardio-ner-sv-bert-based-swedish-cased-multilabel | Sueco | NER multilabel (enfermedad, medicación, procedimiento, síntoma) | no disponible | no disponible | no disponible |
| KBLab/bert-base-swedish-cased (modelo base) | Sueco | Modelo de lenguaje general | 124M | 512 (típico) | MIT (según KBLab) |

La comparativa se basa en la información pública de los repositorios. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. El modelo multiclass se centra únicamente en síntomas, mientras que la versión multilabel del mismo proyecto cubre más categorías de entidades. El modelo base KBLab es el punto de partida y no está especializado en el dominio clínico.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de un modelo entrenado con texto general sueco, puede heredar sesgos presentes en los datos originales (género, edad, procedencia geográfica). No se ha evaluado específicamente el sesgo en el dominio clínico.
- Riesgo de alucinación: aunque es un modelo de clasificación y no genera texto libre, puede producir etiquetas incorrectas en tokens ambiguos o fuera de dominio. La precisión no está documentada.
- Limitaciones de contexto: la longitud máxima de entrada no está confirmada, pero al ser BERT base, probablemente sea de 512 tokens. Textos clínicos más largos requerirán truncamiento o estrategias de ventana deslizante.
- Limitaciones de idioma: exclusivamente sueco. No soporta otros idiomas nórdicos ni inglés, aunque comparte vocabulario parcial con otros modelos escandinavos.
- Restricciones de licencia: la licencia no está especificada en la página de Hugging Face. Esto puede suponer un obstáculo para uso comercial o redistribución. Se recomienda contactar con los autores (DT4H) antes de utilizarlo en producción.
- Especialización limitada: el modelo está entrenado para síntomas cardiológicos. Su rendimiento en otras especialidades médicas o en tipos de entidades diferentes (medicamentos, procedimientos) será previsiblemente bajo.
- Sin datos de evaluación: la ausencia de benchmarks publicados impide conocer su rendimiento real y compararlo con alternativas. Cualquier uso en producción debería ir precedido de una evaluación interna sobre datos propios.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-sv-symptom-bert-base-swedish-cased-multiclass
- Repositorio GitHub del proyecto DT4H Multilingual NER: https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
- Modelo base KBLab/bert-base-swedish-cased: https://huggingface.co/KBLab/bert-base-swedish-cased
- Modelo relacionado (versión multilabel en sueco): https://huggingface.co/DT4H/cardio-ner-sv-bert-based-swedish-cased-multilabel
- Modelo relacionado (versión en inglés con CardioBERTa): https://huggingface.co/DT4H/cardio-ner-en-cardioberta-multiclass
- Información sobre los modelos suecos de KBLab: https://github.com/Kungbib/swedish-bert-models
