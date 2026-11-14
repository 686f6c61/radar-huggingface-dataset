# Hooshaai/qwen-2.5-0.5b-compressed-mha-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-compressed-mha-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se ha practicado cirugía de atención: 18 de las 24 capas del decodificador han sido sustituidas por el operador `compressed_mha_attention` (`CompressedDistilBertAttention`) de la librería NeuralOps, que aplica una descomposición SVD truncada conjunta para aproximar la atención multi-cabeza con menor coste. Las 6 capas restantes conservan la atención GQA original de Qwen2.5 como anclas de recuperación contextual. El resultado es un modelo híbrido 3:1 que busca reducir la complejidad de la atención manteniendo la calidad del modelo base.

El modelo lo publica el usuario Hooshaai como parte del "Attention Surgery Zoo" de NeuralOps, un proyecto que cataloga operadores de atención alternativos aplicados sobre arquitecturas existentes. Tras el trasplante, el autor aplica una destilación de conocimiento en dos etapas sobre WikiText-2 para recuperar el rendimiento perdido: la perplejidad pasa de 366.648,51 (zero-shot tras la cirugía) a 78,13 tras la destilación, frente a los 15,38 del profesor original. Es, por tanto, una pieza de investigación sobre eficiencia de atención, no un modelo listo para producción.

Su relevancia es metodológica: demuestra un flujo completo de sustitución de operadores de atención con herencia de pesos y destilación de representaciones ocultas, ejecutado en una única RTX 3090 con caché offline de representaciones del profesor. Para desarrolladores interesados en atención subcuadrática, es un caso reproducible de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con atención híbrida: 18/24 capas `compressed_mha_attention` (SVD truncada) + 6/24 capas GQA originales |
| Parametros totales | 501.827.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no confirma el contexto efectivo tras la cirugía) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 957,21 MB, más un adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 capas, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza 64, RoPE con theta 1.000.000. Sobre esa base, NeuralOps sustituye la atención en las capas [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por `CompressedDistilBertAttention`, un operador que aproxima las proyecciones Q/K/V/O mediante SVD truncada conjunta. Las capas [3, 7, 11, 15, 19, 23] mantienen la GQA softmax preentrenada como anclas. Cada capa trasplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación. El operador soporta enmascaramiento causal, GQA y RoPE, con despacho de kernels en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), longitud de secuencia 512, batch 8 y acumulación de gradiente 4, ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 107 pasos) congela embeddings, MLP y `lm_head`, y entrena solo módulos de atención y layer norms con AdamW (lr 2.0e-4, weight decay 0.01, clipping 1.0), pesos maestros FP32 y AMP FP16 con GradScaler, minimizando MSE por capa más un término de similitud coseno entre estados ocultos del alumno y del profesor. La model card no detalla la etapa 2 en la información disponible.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Conversación multi-turno (tag `conversational` en el repositorio).
- Atención causal con soporte de GQA y RoPE en las capas trasplantadas.
- Capacidad de operar con el stack NeuralOps (`library_name: neuralops`), incluyendo dispatch de kernels CUDA/Triton/PyTorch.
- No se documentan capacidades de tool calling, agentes, visión, audio, modo thinking ni multilingüismo más allá del inglés.

## Casos de uso

- Investigación en atención eficiente: sirve como punto de partida reproducible para estudiar el impacto de sustituir atención softmax por aproximaciones SVD truncadas en modelos pequeños, comparando la perplejidad pre y post destilación.
- Experimentos de destilación de representaciones: el protocolo de dos etapas y la caché offline de estados ocultos del profesor son reutilizables para destilar otros operadores sobre arquitecturas existentes con una sola GPU de 24 GB.
- Benchmarking de operadores de atención: el modelo permite medir latencia y perplejidad de `compressed_mha_attention` frente a GQA nativa en las mismas capas, con una topología híbrida 3:1 documentada.
- Prototipado de modelos compactos en inglés: con 501 M de parámetros y FP16, cabe en GPUs de consumo y sirve para pruebas de generación de texto de baja latencia en entornos de desarrollo.
- Estudio de recuperación tras cirugía de pesos: la diferencia entre la perplejidad zero-shot (366.648,51) y la post-destilación (78,13) lo convierte en un caso de análisis sobre cuánta calidad se recupera con destilación limitada en pasos.
- Docencia y divulgación: ejemplo práctico de intersección entre SVD, atención y destilación, con telemetría detallada y pesos publicados en safetensors.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente), medidos sobre WikiText-2 `wikitext-2-raw-v1`, split de validación, longitud de secuencia 512:

| Metrica | Valor |
|---|---|
| Perplejidad del profesor (Qwen2.5-0.5B, GQA softmax) | 15,38 |
| Perplejidad del alumno zero-shot tras el trasplante | 366.648,51 |
| Perplejidad del alumno tras destilación en dos etapas | 78,13 |
| Delta absoluto de perplejidad | -366.570,37 |
| Reducción relativa de perplejidad | 99,98 % |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K u otras tareas estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (957,21 MB) más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor entrenó la destilación en una NVIDIA GeForce RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida para cuantizaciones de 8 bits si se generan.
- Opciones de despliegue: al depender de la librería `neuralops` y del operador `compressed_mha_attention`, no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin portar el operador; el despliegue previsto es mediante el stack NeuralOps con dispatch PyTorch/Triton/CUDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (híbrido SVD + GQA, destilado) | 501,8 M | no disponible | 78,13 | MIT | Hugging Face, requiere NeuralOps |
| Qwen/Qwen2.5-0.5B (profesor) | 494 M | 32.768 tokens | 15,38 | Apache 2.0 | Hugging Face, transformers estándar |
| DistilBERT base (referencia del operador) | 66 M | 512 tokens | no disponible | Apache 2.0 | Hugging Face, transformers estándar |

La comparación relevante es con el profesor: el modelo quirúrgico multiplica por aproximadamente 5 la perplejidad (78,13 frente a 15,38) a cambio de una topología de atención parcialmente subcuadrática. No se dispone de datos de latencia que permitan cuantificar la ganancia de eficiencia.

## Limitaciones y advertencias

- La perplejidad en WikiText-2 es 78,13 frente a 15,38 del modelo base: la calidad de generación es sustancialmente inferior y no es apta para producción sin una evaluación adicional.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- El modelo está entrenado y evaluado únicamente en WikiText-2; no hay datos sobre generalización a otros dominios, instrucciones o diálogo.
- Depende de la librería NeuralOps y del operador `compressed_mha_attention`; no es cargable con transformers estándar ni con los runtimes de inferencia habituales sin trabajo de portabilidad.
- Riesgo de alucinación no cuantificado; en un modelo de 0,5 B destilado sobre un corpus enciclopédico, es previsible un comportamiento frágil fuera de distribución.
- Sesgos del corpus WikiText-2 (texto enciclopédico en inglés) y del modelo base, no evaluados por el autor.
- Licencia MIT declarada, lo que permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene licencia Apache 2.0; conviene revisar ambas compatibilidades antes de un despliegue comercial.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El checkpoint se publica como artefacto de investigación del Attention Surgery Zoo; el autor no lo presenta como modelo listo para uso general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-compressed-mha-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/compressed_mha_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
