# Kratim-Budhimata/Regression-is-Attention

## Resumen
Este modelo, publicado por Kratim-Budhimata (Aviral Vijay), propone una alternativa radical a la generación de texto autoregresiva basada en transformers. En lugar de predecir el siguiente token, entrena una red neuronal con pérdida de regresión para mapear directamente vectores de tokens de entrada a vectores de tokens de salida, aplicando posteriormente límites de decisión en el post-procesado para decodificar el texto. El autor afirma que este enfoque elimina la necesidad de GPUs tanto para entrenamiento como para inferencia, funcionando en un portátil con CPU i5 y 8 GB de RAM.

El modelo tiene aproximadamente 8 millones de parámetros y un tamaño de unos 40 MB, habiendo sido entrenado sobre los datasets AIME 2024, Competition MATH y GSM8K (alrededor de 16.000 filas combinadas). Es relevante porque plantea un debate sobre la eficiencia computacional en IA generativa, aunque sus métricas de rendimiento (MAE y Huber Loss) no son comparables con los benchmarks estándar de los LLM, y su arquitectura no es un transformer convencional, a pesar de estar etiquetado como `text-generation` en HuggingFace.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Regresión (red neuronal en Keras) + límites de decisión en post-procesado |
| Parametros totales | ~8M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un transformer estándar; procesa vectores) |
| Tipos de cuantizacion | No disponible (formato nativo .keras) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | .keras (Keras), aunque los tags mencionan joblib |

## Arquitectura y entrenamiento
La arquitectura se aleja por completo del paradigma de predicción de siguiente token. Se basa en una red neuronal entrenada con pérdida de regresión (MAE y Huber Loss) que recibe como entrada vectores de tokens escalados y predice un vector de salida. El post-procesado convierte esas predicciones continuas en texto mediante un inverso del escalador y un proceso de secuencia a texto con el tokenizador. El entrenamiento se realizó sobre los datasets AIME 2024, Competition MATH y GSM8K combinados, con aproximadamente 16.000 filas de pares prompt-respuesta. El autor afirma que el entrenamiento tarda entre 10 y 20 minutos en un sistema i5 con 8 GB de RAM, sin GPU. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación moderna.

## Capacidades
- Generación de texto mediante regresión vector a vector, en lugar de autoregresión.
- Razonamiento matemático básico, derivado de los datos de entrenamiento (AIME, GSM8K, Competition Math).
- Procesamiento de datos secuenciales representados como vectores (potencialmente extensible a 2D y 3D, según el autor).
- Inferencia y entrenamiento en CPU sin necesidad de GPU.
- No soporta tool calling, function calling, agentes ni multi-step reasoning en el sentido de los LLM modernos.
- No dispone de modo de pensamiento (thinking mode), visión ni audio.

## Casos de uso
- Investigación académica sobre alternativas a la autoregresión: el modelo sirve como banco de pruebas para estudiar si la regresión vectorial puede sustituir a la predicción de tokens en tareas muy restringidas.
- Prototipado rápido de pipelines de generación en entornos sin GPU: permite validar ideas de generación de texto en portátiles convencionales antes de escalar a arquitecturas mayores.
- Transformación de secuencias numéricas o embeddings: al ser un modelo de regresión, puede adaptarse a tareas donde la entrada y salida son vectores de características, como normalización o mapeo de representaciones.
- Benchmarking de eficiencia energética: comparar el consumo computacional y la huella de carbono frente a LLMs tradicionales en tareas de generación corta.
- Educación en arquitecturas alternativas: útil para demostrar en clases de machine learning que la generación de texto no requiere exclusivamente transformers, fomentando el pensamiento crítico sobre las bases de la IA generativa.
- Generación de texto en dominios extremadamente restringidos: si se limita el vocabulario y la estructura de salida, podría emplearse para tareas de autocompletado de plantillas o formatos fijos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar de NLP (MMLU, GSM8K accuracy, HumanEval) en la información disponible. Las únicas métricas proporcionadas por el autor son de regresión, que no miden calidad de generación de texto:

| Metrica | Valor |
|---|---|
| Mean Absolute Error (MAE) | 0.037074554711580276 |
| Huber Loss | 0.02696453407406807 |

Estas métricas indican el error en la predicción de los vectores de tokens, pero no ofrecen información sobre la coherencia, exactitud o utilidad del texto generado. No es posible comparar este modelo con LLMs estándar mediante estos datos.

## Requisitos de hardware
- VRAM estimada: 0 GB (inferencia y entrenamiento en CPU).
- CPU recomendada: cualquier procesador moderno (el autor cita un i5 con 8 GB de RAM).
- GPU: no requerida.
- Memoria RAM: 8 GB son suficientes según el autor.
- Despliegue: se carga mediante `keras.saving.load_model` sobre el archivo `.keras`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un transformer estándar.
- Latencia y throughput: no disponibles, aunque el autor afirma que es "hasta 1000 veces más rápido" que los modelos de predicción de siguiente token, una afirmación no verificada.

## Comparativa con modelos similares
No existe una categoría comparable directa, ya que este modelo no es un LLM autoregresivo. A continuación se muestra una comparación conceptual con pequeños LLMs convencionales:

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Regression-is-Attention | ~8M | No disponible | Regresión vectorial | MIT | .keras |
| GPT-2 (small) | 124M | 1024 | Transformer | MIT | safetensors |
| TinyLlama | 1.1B | 2048 | Transformer | Apache 2.0 | safetensors |

La comparación es desequilibrada: los LLMs convencionales ofrecen benchmarks de calidad de texto (perplejidad, MMLU, HumanEval) mientras que este modelo solo ofrece métricas de regresión. No se puede establecer una comparativa de rendimiento realista sin datos de generación.

## Limitaciones y advertencias
- Las afirmaciones del autor (1000x más rápido, eliminación total de GPUs, costes reducidos) no están verificadas por la comunidad ni respaldadas por benchmarks estándar.
- Las métricas publicadas (MAE, Huber Loss) no demuestran capacidad de generación de texto coherente; una pérdida baja en regresión no implica calidad lingüística.
- El modelo está limitado al inglés y entrenado exclusivamente en problemas matemáticos, por lo que su generalización a otros dominios es muy dudosa.
- No soporta tool calling, agentes ni razonamiento multi-paso, lo que limita su uso en producción para aplicaciones modernas.
- Existe una discrepancia entre los tags de HuggingFace (library_name: transformers, pipeline: text-generation) y el contenido real (archivo .keras, arquitectura de regresión), lo que puede confundir a los usuarios.
- El propio autor indica problemas con la descarga de archivos mediante Keras estándar, recomendando `hf_hub_download`.
- Riesgo elevado de alucinación o salidas incoherentes en generación abierta, dado que no hay mecanismos de atención ni decodificación autoregresiva que garanticen dependencias secuenciales.
- Licencia MIT permite uso comercial, pero la falta de garantías y de soporte comunitario lo hace inadecuado para entornos productivos críticos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Kratim-Budhimata/Regression-is-Attention
- Datasets de entrenamiento: [Maxwell-Jia/AIME_2024](https://huggingface.co/datasets/Maxwell-Jia/AIME_2024), [qwedsacf/competition_math](https://huggingface.co/datasets/qwedsacf/competition_math), [openai/gsm8k](https://huggingface.co/datasets/openai/gsm8k)
- Notebook y HTML reproducibles: disponibles en la sección de archivos del repositorio de HuggingFace (no se proporcionan URLs directas).
