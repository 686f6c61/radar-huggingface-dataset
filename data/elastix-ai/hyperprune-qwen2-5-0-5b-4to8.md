# elastix-ai/HyperPrune-Qwen2.5-0.5B-4to8

## Resumen

HyperPrune-Qwen2.5-0.5B-4to8 es un modelo de lenguaje basado en Qwen/Qwen2.5-0.5B, podado con sparsity semi-estructurada 4:8 mediante el método HyperPrune. Ha sido producido por elastix-ai como una reproducción dentro de la comparativa de métodos de sparsity BLADE. El objetivo es servir como punto de datos para estudiar cómo se comporta HyperPrune en un modelo de tamaño pequeño cuando se aplica una restricción de sparsity 4:8 (mantener 4 de cada 8 pesos por fila). El modelo no está pensado para uso en producción: la propia model card indica que la generación greedy es degenerada y que debe tratarse como un dato sobre el escalado del método, no como un modelo utilizable.

La arquitectura es un transformer decoder-only con 24 capas, basado en Qwen2.5-0.5B. El checkpoint contiene 494.032.768 parámetros totales en formato safetensors, con pesos sparse en bf16/fp16. Se ha verificado que la sparsity es estrictamente 4:8 en todas las capas decoder, a diferencia de la configuración original del paper que dejaba dos capas densas. El entrenamiento se realizó en una sola GPU NVIDIA RTX PRO 6000 Blackwell, con un tiempo de entrenamiento de 3,6 minutos y un pico de memoria de 2,61 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B) con sparsity semi-estructurada 4:8 |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16/fp16 (pesos sparse en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-0.5B y aplica poda semi-estructurada 4:8 mediante HyperPrune, un método que aprende la máscara de sparsity usando una hypernetwork compartida y consciente del contexto. La hypernetwork es un MLP con hidden_dim 256, emb_dim 64 y activación de hessian diagonal. El proceso de entrenamiento consta de dos etapas: una etapa supervisada de 12.000 pasos (sup_lr 0.001) y un fine-tuning en cascada de 300 pasos internos por fila (ft_lr 0.0003). Se usa un prior de SparseGPT con wanda_residual_alpha 2.0, compensación de pesos y propagación compensada.

La calibración se realizó con el corpus de validación de DKYoon/SlimPajama-6B, con 128 muestras y una longitud de secuencia de 2048 tokens. Esta elección difiere del corpus original del paper (allenai/c4). El resto de hiperparámetros son los valores por defecto de HyperPrune. La implementación se generalizó para soportar la restricción N:M (4:8), ya que la referencia original no la incluía. En este checkpoint, todas las capas decoder están podadas (dense_layers_list vacío), y solo las primeras 200 filas de salida de cada proyección son decididas por la hypernetwork; el resto conserva la máscara del prior de SparseGPT.

## Capacidades

- Generacion de texto: presente, pero la generacion greedy es degenerada segun la model card.
- Razonamiento: muy degradado; los benchmarks downstream muestran resultados bajos en comparacion con un modelo denso.
- Codigo y matematicas: no se han evaluado; se espera una degradacion similar.
- Tool calling / function calling: no soportado ni evaluado.
- Soporte de agentes y multi-step reasoning: no soportado ni evaluado.
- Capacidades multilingues: no disponible.
- Vision o audio: no aplica; es un modelo de solo texto.

## Casos de uso

- Investigacion en metodos de pruning: el modelo permite comparar HyperPrune con otros metodos de sparsity en modelos de 0.5B, usando el corpus de calibracion de BLADE.
- Estudio del escalado de sparsity: sirve como evidencia de que 4:8 empeora el rendimiento en modelos pequenos, mientras que en modelos grandes (Llama-2-7B, Llama-3.1-8B) lo mejora.
- Validacion de implementaciones N:M: el checkpoint verifica estructuralmente la restriccion 4:8, por lo que puede usarse para probar herramientas que comprueben patrones de sparsity.
- Benchmark de compresion: proporciona una referencia de perplexidad y precision downstream para evaluar el coste de la sparsity semi-estructurada en modelos pequenos.
- Desarrollo de tecnicas de compensacion: el analisis de la degradacion (PPL 282.87 en 4:8 frente a 149.94 en 2:4) puede orientar mejoras en metodos de poda.
- Educacion en sparsity: caso de estudio para ilustrar como la interaccion entre tamano del modelo y patron de sparsity afecta al rendimiento final.

## Benchmarks y rendimiento

La model card incluye resultados de evaluacion con el protocolo BLADE (lm-eval 0.4). Se presentan las metricas de precision downstream y perplexidad.

| Tarea | Accuracy | stderr |
|---|---|---|
| arc_challenge | 0.1834 | 0.0113 |
| arc_easy | 0.3253 | 0.0096 |
| hellaswag | 0.2738 | 0.0045 |
| mmlu | 0.2293 | 0.0035 |
| openbookqa | 0.1240 | 0.0148 |
| piqa | 0.5626 | 0.0116 |
| race | 0.2488 | 0.0134 |
| winogrande | 0.5036 | 0.0141 |

| Dataset | Word PPL | Byte PPL |
|---|---|---|
| WikiText-2 | 282.9265 | 2.8739 |
| C4 (en) | 698.6640 | 2.9911 |

Tambien se reporta la divergencia KL:

| Dataset | Avg KL | Total KL |
|---|---|---|
| wikitext2 | 2.239863 | 669253.1475 |
| c4 | 2.187835 | 4112701.0703 |
| slimpajama_calib | 2.017394 | 16914864.3008 |

La comparacion entre sparsity 2:4 y 4:8 en este modelo muestra que 4:8 es peor:

| Configuracion | WikiText-2 word PPL |
|---|---|
| 2:4 | 149.94 |
| 4:8 | 282.87 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El entrenamiento alcanzo un pico de 2.61 GB en GPU.
- GPU recomendada: no especificada. Para el entrenamiento se uso 1 x NVIDIA RTX PRO 6000 Blackwell (97 GB).
- Capacidad en GPUs de consumo: no hay datos verificados; dado el tamano de 494M parametros, es probable que quepa en GPUs con 6 GB o mas, pero no se ha confirmado.
- Opciones de despliegue: el checkpoint carga con transformers estandar. No se han documentado pruebas con vLLM, llama.cpp, Ollama o TGI. La etiqueta de HuggingFace indica compatibilidad con text-generation-inference y endpoints, pero no se ha verificado.

## Comparativa con modelos similares

| Modelo | Sparsity | WikiText-2 word PPL | Licencia |
|---|---|---|---|
| HyperPrune-Qwen2.5-0.5B-4to8 | 4:8 | 282.87 | other |
| HyperPrune-Qwen2.5-0.5B-2to4 | 2:4 | 149.94 | other |
| Qwen2.5-0.5B (base, denso) | denso | No disponible | No disponible |

La comparacion directa con la version 2:4 del mismo modelo es la unica disponible en la informacion proporcionada. El modelo base denso no tiene datos de perplexidad en la informacion disponible, por lo que no se puede cuantificar la degradacion total respecto a el.

## Limitaciones y advertencias

- Generacion greedy degenerada: el modelo no es apto para uso en produccion ni para generacion de texto de calidad.
- Poda 4:8 empeora el rendimiento en modelos pequenos: la perplexidad sube de 149.94 (2:4) a 282.87 (4:8), lo que contradice el comportamiento observado en modelos de mayor tamano.
- La hypernetwork solo decide una pequena parte de la mascara: con fixed_rows_count 200, la mayoria de las filas conservan el prior de SparseGPT, por lo que el resultado no refleja plenamente la capacidad de HyperPrune.
- Licencia "other": puede imponer restricciones no especificadas; se debe revisar antes de cualquier uso.
- Idiomas soportados no disponibles: no hay informacion sobre el alcance multilingue.
- Riesgo de alucinacion alto: debido a la degradacion del modelo, es probable que genere contenido incoherente o incorrecto.
- Sesgos no evaluados: no se han realizado estudios de sesgo sobre este checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/elastix-ai/HyperPrune-Qwen2.5-0.5B-4to8
- Paper HyperPrune (OpenReview): https://openreview.net/forum?id=lqjQs2lVNm
- Repositorio HyperPrune: https://github.com/futuresun912/HyperPrune
- Version 2:4 del mismo modelo: https://huggingface.co/elastix-ai/HyperPrune-Qwen2.5-0.5B-2to4
