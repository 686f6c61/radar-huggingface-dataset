# Hooshaai/bert-comp-svd-linear-sst2

## Resumen

`bert-comp-svd-linear-sst2` es un checkpoint comprimido y "curado" con LoRA de `google-bert/bert-base-uncased`, afinado para clasificación de sentimiento en GLUE SST-2. Lo desarrolla el autor de Hooshaai (el repositorio referencia el proyecto NeuralOps, de tahamajs) como parte de un zoo de modelos comprimidos destinado a demostrar técnicas de compresión física de pesos mediante descomposición en valores singulares aplicada a capas lineales (compresor `svd_linear`). La arquitectura subyacente es la de BERT-base: transformer encoder de 12 capas, dimensión oculta 768 y 109.483.778 parámetros originales.

El modelo resuelve un problema acotado pero relevante en el ciclo de vida de modelos: cómo reducir el tamaño físico de un encoder ya entrenado sin reentrenar desde cero, sustituyendo capas `Linear`/`Conv1D` por capas de bajo rango (`SVDLinearLayer`) y aplicando después un "healing" con LoRA de rango 8 para recuperar parte de la precisión perdida. El checkpoint publicado corresponde al rango `k=128`, con una reducción del 33,4 % de parámetros (72.914.690 parámetros, ratio de compresión físico 1,502x) y un peso de 139,5 MB.

Es relevante ahora como referencia práctica de los compromisos reales de la compresión post-hoc: el resultado es modesto en calidad (73,51 % de accuracy en SST-2 frente al 91,63 % del profesor), pero ilustra con datos medidos el coste en precisión de cada nivel de rango y sirve como pieza reproducible para quien evalúe pipelines de compresión en lugar de modelos listos para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), con capas lineales sustituidas por `SVDLinearLayer` (compresión SVD de bajo rango) |
| Parametros totales | 72.914.690 (comprimido, rango k=128); base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura base BERT-base, habitualmente 512 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), mas `config.json`, `compression_summary.json` y activos de tokenizer de `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-base uncased: 12 capas de encoder, dimensión oculta 768 y 109.483.778 parámetros, preentrenado por Google y afinado para SST-2 (clasificación binaria de sentimiento, 2 etiquetas). Sobre ese modelo, el compresor `SVDLinearCompressor` de NeuralOps reemplaza las capas `Linear`/`Conv1D` por capas `SVDLinearLayer`, que factorizan la matriz de pesos en dos factores de bajo rango. En el checkpoint publicado se aplica rango `k=128`, lo que deja 72.914.690 parámetros (-33,40 %) y un ratio de compresión físico de 1,502x.

El proceso de recuperación ("LoRA healing") se activa cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x. En ese caso se aplica un adaptador LoRA de rango `r=8` con 50 pasos, tasa de aprendizaje 2e-4 y un presupuesto de 45 segundos, y los adaptadores se integran en los pesos serializados. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se detalla en la información disponible la composición del dataset de afinado más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador de este tipo).

## Capacidades

- Clasificación binaria de sentimiento en inglés (0 = negativo, 1 = positivo) sobre textos de entrada.
- Inferencia sobre la topología comprimida: requiere reconstruir el grafo con `compress_model` de NeuralOps antes de cargar el state dict.
- Integración con el ecosistema Hugging Face mediante `AutoTokenizer` y `BertForSequenceClassification`.
- Carga en una línea a través de la API universal `neuralops.hub.load_surgeried_model`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking": es un clasificador de secuencia.
- Capacidad multilingüe: no disponible; solo inglés (`en`).
- No se documentan capacidades de generación de texto, código ni matemáticas.

## Casos de uso

- Clasificación de sentimiento en pipelines de moderación o análisis de opiniones en inglés: el modelo devuelve logits de 2 clases y puede integrarse en un servicio de inferencia ligero gracias a sus 139,5 MB de pesos.
- Docencia y reproducción de técnicas de compresión: sirve como ejemplo ejecutable de compresión SVD post-hoc con healing LoRA, con telemetría en `compression_summary.json` para comparar rangos k=256/128/64/32.
- Investigación sobre el compromiso precisión/tamaño: útil para medir empíricamente la curva de degradación de un encoder BERT al reducir rango, usando el profesor (91,63 %) como referencia.
- Prototipado de sistemas de clasificación con restricciones de memoria: al ocupar menos de una cuarta parte de un GB, cabe en entornos con VRAM muy limitada para pruebas de concepto.
- Benchmarking de frameworks de compresión: comparar el compresor `svd_linear` de NeuralOps con alternativas de poda o cuantización sobre la misma tarea SST-2.
- Evaluación de pipelines de "healing": validar si un adaptador LoRA de rango 8 y 50 pasos recupera precisión suficiente en un modelo concreto antes de escalar la técnica a modelos mayores.
- Filtrado preliminar de reseñas en inglés en entornos de bajo presupuesto, aceptando la pérdida de precisión frente al modelo original.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| GLUE SST-2, validacion, accuracy (checkpoint k=128 publicado) | 73,51 % |
| GLUE SST-2, validacion, accuracy zero-shot (k=128, sin healing) | 59,17 % |
| Teacher baseline (`bert-base-uncased` afinado en SST-2) | 91,63 % |
| Parity delta frente al teacher | -18,12 % |

Evaluación multi-rango del autor (RTX 3090, 872 muestras de validación):

| Rango (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con LoRA | Parity vs teacher (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,27x | 85.890.818 (-21,5 %) | 69,27 % | 49,08 % | -42,55 % |
| 128 | 1,50x | 72.914.690 (-33,4 %) | 59,17 % | 73,51 % | -18,12 % |
| 64 | 1,65x | 66.426.626 (-39,3 %) | 51,38 % | 50,92 % | -40,71 % |
| 32 | 1,73x | 63.182.594 (-42,3 %) | 50,92 % | 50,92 % | -40,71 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 72,9 M de parámetros y pesos en FP32 el modelo ocupa aproximadamente 0,3 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), pero es sobredimensionada para este checkpoint.
- Cabe en GPU consumer: sí, en tarjetas tan modestas como GTX 1650, RTX 3050 o incluso en CPU para lotes pequeños.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que el checkpoint requiere reconstruir la topología `SVDLinearLayer` con la librería `neuralops` antes de cargar el state dict; el despliegue estándar sería un script de PyTorch/Transformers con esa dependencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-svd-linear-sst2` (k=128) | 72,9 M (comprimido) | no disponible | 73,51 % | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` afinado en SST-2 (teacher) | 109,5 M | 512 tokens (arquitectura base) | 91,63 % | Apache 2.0 | Hugging Face, transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66,9 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, transformers estándar |
| `roberta-base` afinado en SST-2 | ~125 M | 512 tokens | no disponible en la informacion proporcionada | MIT | Hugging Face, transformers estándar |

La comparativa con DistilBERT y RoBERTa se incluye por categoría (encoders pequeños para clasificación de sentimiento), pero no se dispone de sus cifras SST-2 en la información proporcionada; no se inventan valores.

## Limitaciones y advertencias

- Pérdida de precisión sustancial: 73,51 % frente al 91,63 % del profesor, una diferencia de 18,12 puntos. No es apto para producción sin una evaluación propia sobre el dominio objetivo.
- El "healing" LoRA no es monótono con el rango: en k=256 la accuracy con LoRA (49,08 %) es peor que la zero-shot (69,27 %), lo que indica inestabilidad del procedimiento de recuperación.
- En k=64 y k=32 la accuracy se estanca en 50,92 %, prácticamente el azar en una tarea binaria.
- Solo inglés; no hay soporte multilingüe declarado.
- Riesgo de sesgos heredados de `bert-base-uncased` y de los datos de GLUE SST-2 (reseñas de películas), no evaluados ni documentados por el autor.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas con alta confianza en dominios distintos al de entrenamiento.
- Dependencia de la librería `neuralops` para reconstruir la topología antes de cargar los pesos; no es un checkpoint cargable directamente con `from_pretrained` estándar.
- Licencia MIT para el checkpoint, pero conviene revisar la licencia del modelo base (`bert-base-uncased`, Apache 2.0) y de los datos de GLUE antes de uso comercial.
- Los resultados de benchmarks están declarados por el autor y no verificados (`verified: false`).
- Repositorio con muy poca tracción (42 descargas, 0 likes) y creado en noviembre de 2026; sin señales de mantenimiento ni comunidad.
- El identificador del repositorio en la model card (`tahamajs/bert-comp-svd-linear-sst2`) difiere del ID de Hugging Face (`Hooshaai/bert-comp-svd-linear-sst2`); conviene verificar cuál es el canónico antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-svd-linear-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor SVD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/svd_linear.py
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
