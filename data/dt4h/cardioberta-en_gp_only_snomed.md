# DT4H/CardioBERTa.en_GP_only_snomed

## Resumen

CardioBERTa.en_GP_only_snomed es un codificador de terminología biomédica en inglés, especializado en normalización de conceptos clínicos y entity linking. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H) dentro del proyecto CardioLM, una suite de modelos de lenguaje pequeños para el dominio de la cardiología. El modelo parte del backbone CardioBERTa.en, un RoBERTa adaptado mediante entrenamiento continuo con MLM sobre corpus biomédicos y cardiológicos monolingües, y se ha afinado con tripletas de terminología UMLS supervisadas por CUI (Concept Unique Identifier) y aprendizaje métrico.

El modelo está diseñado para convertir términos clínicos en embeddings normalizados que permiten recuperar conceptos UMLS, facilitando tareas de vinculación de entidades y normalización de conceptos en pipelines de procesamiento de lenguaje natural clínico. Con 124,6 millones de parámetros y una longitud máxima de entrada de 25 tokens, es un modelo compacto y eficiente para su propósito. Su relevancia actual radica en la creciente necesidad de interoperabilidad semántica en datos clínicos, especialmente en el ámbito cardiológico, donde la terminología SNOMED CT es estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 124.645.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 25 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en FP32) |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (también PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa, un transformer encoder con atención bidireccional. El backbone CardioBERTa.en fue preentrenado con masked language modeling sobre corpus biomédicos y cardiológicos en inglés. Para esta variante, se realizó un ajuste fino con aprendizaje métrico (multi-similarity loss) sobre tripletas de terminología clínica. Las tripletas se construyeron a partir de pares de términos asociados al mismo CUI de UMLS, enriqueciendo las relaciones con ontologías de nivel "grandparent" (relaciones jerárquicas de dos niveles superiores). El entrenamiento utilizó 3.760.671 tripletas, cubriendo 477.292 CUIs y 470.264 términos normalizados únicos. El pooling se realiza con el token CLS y las embeddings se normalizan con norma L2. El entrenamiento se realizó durante 1 época, con batch size de 256, learning rate de 2e-5 y longitud máxima de 25 tokens. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de terminología clínica normalizados para recuperación semántica.
- Entity linking y normalización de conceptos: mapea términos clínicos a conceptos UMLS (CUIs).
- Recuperación de candidatos biomédicos: dado un término, obtiene los conceptos más similares en un espacio vectorial.
- Soporte multilingüe limitado: aunque el modelo es solo inglés, la familia CardioBERTa incluye variantes para otros idiomas europeos (checo, neerlandés, italiano, rumano, español, sueco).
- No soporta generación de texto ni tool calling; es un modelo de extracción de características (feature extraction).
- No tiene modo de razonamiento ni capacidades de visión o audio.

## Casos de uso

- Normalización de entidades clínicas en historiales electrónicos: el modelo convierte términos libres (p. ej., "MI", "infarto de miocardio") en embeddings que permiten asignar el CUI correcto de UMLS, estandarizando datos para análisis posteriores.
- Vinculación de entidades en literatura cardiológica: permite mapear menciones de enfermedades, fármacos o procedimientos en artículos científicos a conceptos ontológicos, facilitando la construcción de bases de conocimiento.
- Desambiguación de abreviaturas y sinónimos: gracias al entrenamiento con tripletas de sinónimos, el modelo puede distinguir entre usos de términos ambiguos según el contexto clínico.
- Recuperación de información en repositorios clínicos: al indexar documentos con embeddings de conceptos, se pueden buscar registros que mencionen conceptos equivalentes aunque usen terminología distinta.
- Enriquecimiento de datasets clínicos: anotación automática de términos con CUIs para entrenar otros modelos o para cumplir estándares de interoperabilidad (p. ej., SNOMED CT).
- Integración en pipelines de fenotipado: en estudios de cardiología, el modelo ayuda a extraer fenotipos normalizados de texto clínico, mejorando la reproducibilidad de cohortes de pacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o tareas de entity linking específicas. Solo se proporcionan estadísticas de entrenamiento (número de tripletas, CUIs, términos). Por tanto, no es posible comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 124M parámetros, el peso en FP32 ocupa aproximadamente 500 MB. En FP16 o cuantizado a 8 bits, puede caber en menos de 250 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia en batch pequeño. Una RTX 3060 o superior permite ejecutar el modelo sin problemas. En CPU también es viable para uso puntual.
- Se puede ejecutar en hardware de consumo: sí, incluso en portátiles con 4 GB de RAM.
- Opciones de despliegue: compatible con Hugging Face Transformers, soporta Text Embeddings Inference (TEI) según los tags del repositorio. También se puede usar con ONNX o TensorRT si se exporta, aunque no se documenta explícitamente.
- Latencia y throughput: no disponible en la información proporcionada. Dado su tamaño, se espera una latencia de milisegundos en GPU moderna.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. Existen modelos similares en el campo de embeddings biomédicos como SapBERT, BioBERT o PubMedBERT, pero no se han encontrado métricas que permitan una comparación objetiva. Se puede indicar que CardioBERTa.en_GP_only_snomed es específico para cardiología y utiliza aprendizaje métrico con tripletas UMLS, mientras que los otros son generalistas o de dominio biomédico amplio. No obstante, sin benchmarks no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena con terminología UMLS, que puede tener sesgos de representación hacia el inglés estadounidense y hacia la terminología cardiológica predominante en países anglófonos.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación en el sentido generativo. Sin embargo, la recuperación de conceptos puede producir falsos positivos si el umbral de similitud es bajo.
- Limitaciones de contexto: la longitud máxima de entrada es de 25 tokens, lo que impide procesar frases largas o documentos completos. Solo se pueden codificar términos o expresiones cortas.
- Restricciones de licencia: la licencia del modelo no está disponible. Además, la terminología de entrenamiento (UMLS) no se distribuye y está sujeta a las condiciones de licencia de UMLS, lo que puede afectar a usos comerciales o redistribución.
- Advertencia para producción: no está diseñado para toma de decisiones clínicas directas. Debe usarse como componente de un pipeline de NLP, siempre con validación humana en contextos médicos.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.en_GP_only_snomed
- Modelo base CardioBERTa.en: https://huggingface.co/DT4H/CardioBERTa.en
- Colección CardioBERTa Family: https://huggingface.co/collections/DT4H/cardioberta-family
- Organización GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Referencia: Danu et al., *CardioLM - a multilingual suite of small language models for the cardiology domain* (no se proporciona enlace directo al paper).
