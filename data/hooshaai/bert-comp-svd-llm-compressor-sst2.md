# Hooshaai/bert-comp-svd-llm-compressor-sst2

## Resumen

`bert-comp-svd-llm-compressor-sst2` es un checkpoint de `google-bert/bert-base-uncased` (109.483.778 parametros, 12 capas, dimension oculta D=768) comprimido mediante la tecnica SVD-LLM y posteriormente "curado" con LoRA sobre la tarea GLUE SST-2 (clasificacion de sentimiento binaria). Lo publica el usuario Hooshaai como parte del NeuralOps Compressed & LoRA-Healed Model Zoo, un catalogo de modelos comprimidos fisicamente con la libreria NeuralOps.

El modelo aplica `SVDLLMCompressor` (familia `low_rank`), que combina descomposicion en valores singulares con blanqueamiento de activaciones via Cholesky y recuperacion secuencial mediante LoRA. En el rango de compresion destacado (k=32) el checkpoint pasa de 109,5 M a 32,6 M de parametros, una reduccion del 70,24 % y un ratio de compresion fisica de 3,360x. El artefacto serializado ocupa 62,3 MB y se distribuye en formato `pytorch_model.bin`.

Es relevante ahora porque documenta de forma transparente el compromiso entre compresion y precision en un modelo pequeno de clasificacion: el modelo profesor alcanza 91,63 % de accuracy en SST-2, mientras que el checkpoint comprimido y curado se queda en 68,81 % (una perdida de 22,82 puntos). La ficha resulta util para quien quiera evaluar tecnicas de compresion low-rank y LoRA healing, no como sustituto de produccion de BERT-base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), comprimido con SVD-LLM (low-rank) |
| Parametros totales | 32.585.474 (checkpoint comprimido, k=32); modelo base original 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la configuracion de bert-base-uncased; no especificado en la informacion) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin` sin cuantizacion declarada) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado; requiere reconstruccion de topologia NeuralOps) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y D=768 con 109,5 M de parametros, afinado originalmente sobre GLUE SST-2. Sobre esa base se aplica `SVDLLMCompressor`, que realiza descomposicion SVD con blanqueamiento de activaciones mediante Cholesky (siguiendo SVD-LLM, ICLR 2025) y ratios de rango fijos. Cuando la compresion en zero-shot degrada la accuracy en mas de 2,0 puntos con una reduccion superior a 1,10x, NeuralOps activa un "LoRA healing" dirigido con rango r=8, 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos.

El checkpoint publicado corresponde al rango k=32, que en zero-shot cae al 50,00 % de accuracy (equivalente a azar en SST-2) y tras el healing LoRA sube a 68,81 %. Los demas rangos evaluados (k=256, 128, 64) muestran un patron atipico: sus resultados curados (53,56 %, 50,92 % y 50,92 % respectivamente) son inferiores a los del rango k=32, lo que sugiere que la seleccion "Pareto" del checkpoint publicado no maximiza la precision sino que documenta el comportamiento del pipeline. La evaluacion se realizo fisicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre los 872 ejemplos del split de validacion de GLUE SST-2.

## Capacidades

- Clasificacion de texto binaria (sentimiento positivo/negativo) sobre entradas en ingles.
- Inferencia a nivel de secuencia con la cabeza `BertForSequenceClassification` (num_labels=2).
- Reconstruccion programatica via `compress_model` de NeuralOps y carga con `strict=False`.
- Carga directa mediante `load_surgeried_model` del Hub API de NeuralOps.
- Tokenizacion estandar de `bert-base-uncased` (vocab.txt, tokenizer.json, tokenizer_config.json incluidos).
- No dispone de generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento extendido: es un encoder clasificador.

## Casos de uso

- Clasificacion de sentimiento en ingles a bajo coste: al ocupar 62,3 MB y 32,6 M de parametros, puede desplegarse en entornos con memoria muy limitada donde BERT-base completo no cabe.
- Experimentacion con tecnicas de compresion: sirve como referencia reproducible para comparar SVD-LLM frente a otras tecnicas low-rank sobre SST-2, con telemetria completa en `compression_summary.json`.
- Investigacion de LoRA healing: permite estudiar como un adaptador r=8 de 50 pasos recupera 18,81 puntos de accuracy sobre un checkpoint colapsado a azar (50,00 % → 68,81 %).
- Docencia y demostraciones de pipelines de compresion: el codigo de reconstruccion (compress_model + load_state_dict) es directamente util para ilustrar flujos NeuralOps.
- Filtrado de resenas o comentarios en ingles con requisitos de latencia y huella de memoria estrictos, aceptando la perdida de precision frente al profesor.
- Baseline para destilacion o fine-tuning posterior: el checkpoint comprimido puede servir de inicializacion barata antes de un ajuste adicional sobre dominio especifico.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index, no verificados) sobre GLUE SST-2, split de validacion (872 muestras), evaluados en RTX 3090:

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy curada (LoRA) | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,56x | 70.260.482 (-35,8 %) | 59,52 % | 53,56 % | -38,07 % |
| 128 | 2,25x | 48.731.906 (-55,5 %) | 52,41 % | 50,92 % | -40,71 % |
| 64 | 2,88x | 37.967.618 (-65,3 %) | 51,38 % | 50,92 % | -40,71 % |
| 32 (publicado) | 3,36x | 32.585.474 (-70,2 %) | 50,00 % | 68,81 % | -22,82 % |

El profesor BERT-base sin comprimir alcanza 91,63 % de accuracy en SST-2 segun la model card. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint comprimido (32,6 M de parametros ≈ 130 MB de pesos); el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; la evaluacion del autor se realizo en una RTX 3090 (24 GB), sobredimensionada para este modelo.
- Cabe holgadamente en GPU consumer: GTX 1650, RTX 3050, RTX 4060, etc.
- Opciones de despliegue: requiere la libreria NeuralOps para reconstruir la topologia comprimida (`compress_model` + `load_state_dict`); no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, dado que el checkpoint no es un `safetensors` estandar de Hugging Face Transformers.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Este modelo (k=32) | 32,6 M | no disponible | 68,81 % | MIT | Hugging Face (requiere NeuralOps) |
| bert-base-uncased (profesor) | 109,5 M | 512 (estandar BERT) | 91,63 % | Apache 2.0 | Hugging Face Transformers |
| DistilBERT-base-uncased | 66 M | 512 (estandar) | no disponible en la informacion | Apache 2.0 | Hugging Face Transformers |

La comparativa con DistilBERT no puede completarse con datos de rendimiento porque no se han proporcionado resultados de benchmarks de terceros en la informacion disponible. La diferencia clave frente al profesor es la perdida de 22,82 puntos de accuracy a cambio de un ratio de compresion de 3,36x y una huella de 62,3 MB.

## Limitaciones y advertencias

- Precision muy degradada: 68,81 % frente al 91,63 % del profesor; en zero-shot el checkpoint colapsa a 50,00 % (azar), por lo que el LoRA healing es imprescindible.
- Patron de resultados atipico: rangos mayores (k=256, 128, 64) rinden peor tras el healing que k=32, lo que cuestiona la eleccion "Pareto" y sugiere inestabilidad del pipeline de curado.
- Solo ingles: el modelo esta entrenado y evaluado exclusivamente en ingles (tag `en`).
- Ambito limitado: clasificacion binaria de sentimiento; no sirve para generacion, razonamiento ni otras tareas sin reentrenamiento.
- Dependencia de NeuralOps: la carga exige la libreria y el codigo de reconstruccion; no es un checkpoint Transformers plug-and-play.
- Benchmark no verificado: el model-index marca `verified: false`, y las cifras provienen unicamente del autor.
- Riesgo de sesgos: no documentado en la informacion disponible; al derivar de bert-base-uncased y SST-2, hereda los sesgos del corpus de resenas de cine.
- Licencia MIT permite uso comercial, pero la precision limitada hace desaconsejable su uso en produccion sin validacion adicional.
- Riesgo de alucinacion: no aplica en sentido estricto (clasificador), pero puede producir etiquetas erroneas con confianza alta en dominios distintos de SST-2.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-svd-llm-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/svd_llm_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
