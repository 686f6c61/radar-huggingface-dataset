# AlinaGonch/llama32-3b-squad-ratio-0.90-seed-42

## Resumen

El modelo `AlinaGonch/llama32-3b-squad-ratio-0.90-seed-42` es un fine-tuning del modelo base Llama 3.2 3B de Meta, realizado sobre el dataset SQuAD 2.0. Forma parte de una serie de experimentos creados por AlinaGonch para estudiar el impacto de la proporción de muestras sin respuesta (unanswerable) en el entrenamiento de modelos de comprensión lectora. El nombre indica que se utilizó un ratio de 0.90 (es decir, un 90% de preguntas sin respuesta) y una semilla de 42 para la reproducibilidad.

El modelo está publicado en HuggingFace con la librería transformers, en formato safetensors, y el repositorio tiene un tamaño de 0.1 GB. La model card es una plantilla automática sin información técnica detallada, por lo que la mayoría de especificaciones no están disponibles públicamente. A pesar de su escasa documentación, el interés del modelo reside en su uso como objeto de estudio para determinar la proporción óptima de preguntas sin respuesta en tareas de question answering extractivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.2 3B) |
| Parametros totales | no disponible (modelo base: 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 3B soporta 128k tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, dado el dataset SQuAD) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Llama 3.2 3B, un transformer decoder-only con 3 mil millones de parametros, publicado por Meta en septiembre de 2024. La arquitectura base incorpora attention con RoPE (Rotary Position Embedding), normalizacion RMSNorm y activacion SwiGLU. El fine-tuning se realizo sobre el dataset SQuAD 2.0, que combina preguntas con respuesta y preguntas sin respuesta (unanswerable) dentro de un contexto dado. El parametro `ratio-0.90` indica que el 90% de las muestras de entrenamiento corresponden a preguntas sin respuesta, mientras que `seed-42` fija la semilla aleatoria para la seleccion de datos y la inicializacion del entrenamiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, el regimen de precision (fp16, bf16, etc.), ni sobre el uso de tecnicas adicionales como RLHF o DPO. El experimento forma parte de una coleccion publica en HuggingFace que compara diferentes ratios (0.30, 0.90, etc.) para evaluar el efecto de la proporcion de muestras sin respuesta en el rendimiento final.

## Capacidades

- Comprension lectora extractiva: el modelo esta entrenado para responder preguntas basandose en un contexto dado, identificando el fragmento de texto relevante.
- Manejo de preguntas sin respuesta: gracias al entrenamiento con un alto ratio de muestras unanswerable, el modelo deberia ser capaz de reconocer cuando una pregunta no tiene respuesta en el contexto y abstenerse de generar una respuesta incorrecta.
- Generacion de texto en ingles: al ser un fine-tuning de Llama 3.2 3B, conserva las capacidades generativas del modelo base, aunque su especializacion en SQuAD puede reducir su rendimiento en tareas generales.
- No se ha documentado soporte para tool calling, agentes, vision, audio ni modos de razonamiento especiales.

## Casos de uso

- Evaluacion de sistemas de question answering: el modelo puede utilizarse como referencia en experimentos para medir el impacto del ratio de preguntas sin respuesta en la calidad de un sistema de QA extractivo.
- Investigacion academica sobre datasets de entrenamiento: sirve para estudiar como la distribucion de ejemplos negativos afecta al comportamiento del modelo, especialmente en la deteccion de preguntas no respondibles.
- Desarrollo de chatbots de soporte con contexto limitado: en escenarios donde el sistema debe indicar que no tiene informacion suficiente, un modelo entrenado con alto ratio de unanswerable puede ser util para evitar alucinaciones.
- Benchmarking de tecnicas de fine-tuning: permite comparar diferentes estrategias de muestreo y proporciones de datos negativos en tareas de NLP.
- Pruebas de robustez en comprension lectora: el modelo puede servir para probar la capacidad de un pipeline de QA de manejar preguntas sin respuesta en dominios especificos.
- Educacion y divulgacion: como ejemplo de experimento controlado con semilla fija y ratio variable, es util para ensenar metodologia de investigacion en machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como F1, EM (Exact Match) ni comparaciones con otros modelos. Dado que el modelo es parte de un experimento, es posible que los resultados se hayan reportado en la coleccion asociada, pero no se proporcionan en la ficha actual.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 3B parametros, en precision fp16 ocupa aproximadamente 6 GB de memoria. Con cuantizacion de 8 bits (int8) se reduce a unos 3 GB, y con 4 bits a unos 2 GB. No se han publicado cuantizaciones oficiales para este fine-tuning.
- GPU recomendadas: puede ejecutarse en GPUs consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores. Tambien es compatible con GPUs profesionales como A10, A100 o H100.
- Si cabe en consumer GPU: si, en la mayoria de GPUs con al menos 6 GB de VRAM se puede cargar en fp16.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama (si se empaqueta adecuadamente). Tambien se puede usar directamente con la libreria transformers de Python.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 3B en una GPU moderna, se puede esperar una latencia de decenas de milisegundos por token en fp16.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos dentro del mismo experimento (otros ratios como 0.30, 0.50, etc.) ni de otros fine-tunings de Llama 3.2 3B sobre SQuAD. La comparacion mas directa seria con el modelo base Llama 3.2 3B, que tiene las mismas caracteristicas arquitectonicas pero sin el fine-tuning especifico. No se han publicado metricas comparativas.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| AlinaGonch/llama32-3b-squad-ratio-0.90-seed-42 | 3B (base) | no disponible | QA extractivo (SQuAD 2.0) | no disponible |
| meta-llama/Llama-3.2-3B | 3B | 128k | Generacion general | Llama 3.2 Community License |
| Otros fine-tunings de SQuAD (ej. bert-large-uncased-whole-word-masking-finetuned-squad) | 336M | 512 | QA extractivo | Apache 2.0 |

## Limitaciones y advertencias

- La model card es una plantilla generica sin informacion sustancial: no se documentan los hiperparametros de entrenamiento, el conjunto de datos exacto, ni las metricas de evaluacion.
- Al ser un fine-tuning sobre SQuAD 2.0, el modelo esta limitado al dominio de articulos de Wikipedia en ingles y puede no generalizar bien a otros dominios o idiomas.
- El alto ratio de preguntas sin respuesta (90%) puede hacer que el modelo sea demasiado conservador y rechace responder incluso preguntas que si tienen respuesta en el contexto.
- No se especifica la licencia, lo que impide conocer si su uso comercial esta permitido. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se ha publicado informacion sobre sesgos o riesgos especificos. Como modelo derivado de Llama 3.2, puede heredar los sesgos del modelo base, que incluyen sesgos de genero, raza y religion, aunque el fine-tuning en SQuAD reduce su exposicion a estos temas.
- Riesgo de alucinacion: aunque el entrenamiento con preguntas sin respuesta deberia mitigarlo, no hay garantias sin evaluacion exhaustiva.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.90-seed-42)
- [Coleccion de experimentos SQuAD ratio](https://huggingface.co/collections/AlinaGonch/squad-dataset-ratio-experiment-llama32-llama31)
- [Modelo relacionado con ratio 0.30](https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.30-r4)
- [Model card de Llama 3.2 (Meta)](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md)
- [Documentacion de Llama 3.2 en developer.meta.com](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/)
- [Pagina de Llama 3.2 3B en Ollama](https://ollama.com/library/llama3.2:3b)
- [Paper de Lacoste et al. (2019) sobre emisiones de carbono (referencia del tag arxiv)](https://arxiv.org/abs/1910.09700)
