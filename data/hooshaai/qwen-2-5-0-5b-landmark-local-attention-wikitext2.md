# Hooshaai/qwen-2.5-0.5b-landmark-local-attention-wikitext2

## Resumen

El modelo `Hooshaai/qwen-2.5-0.5b-landmark-local-attention-wikitext2` es un checkpoint derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el operador `LandmarkLocalAttention` del registro `ATTENTION_REGISTRY` del framework NeuralOps. Se trata de un experimento de investigación sobre atención subcuadrática (LEKAv2: Linear-time Efficient Kernel Attention with Landmark Distillation) más que de un modelo listo para producción. El autor es Hooshaai y el modelo se distribuye con licencia MIT.

La intervención sigue el patrón `hybrid_3_1`: 18 de las 24 capas han sido transplantadas con `landmark_local_attention` mediante el `QwenAttentionAdapter`, mientras que 6 capas cuadráticas completas se conservan como anclas en los índices 3, 7, 11, 15, 19 y 23. El adaptador mapea las proyecciones originales de `Qwen2Attention` (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) con expansión automática 7x de cabezas KV y contrato de bypass de `o_proj` único.

Tras la cirugía, el modelo se reentrena mediante destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). El resultado es un modelo de 0,5 mil millones de parámetros que genera texto en inglés con una perplejidad de validación de 242,57, muy lejos del modelo base original pero suficiente para validar la viabilidad del operador de atención alternativo. Su relevancia es fundamentalmente metodológica: demuestra que es posible sustituir atención cuadrática por alternativas lineales en un transformer preentrenado y recuperar parcialmente la calidad mediante KD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `LandmarkLocalAttention` (LEKAv2) y 6/24 capas con atencion cuadratica completa como anclas |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso `seq_len=512`; la ventana efectiva no se especifica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (920,90 MB) y `attention_weights.safetensors` (73,14 MB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con GQA (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`). Sobre esa base se aplica una "cirugía" de atención: 18 de las 24 capas se sustituyen por `LandmarkLocalAttention`, un operador de atención lineal en tiempo (LEKAv2) basado en kernel attention con destilación de landmarks. Las 6 capas restantes mantienen atención cuadrática completa y actúan como anclas para preservar capacidad expresiva. El `QwenAttentionAdapter` gestiona la expansión 7x de cabezas KV (de 2 a 14) y aplica un contrato de bypass con `o_proj` único.

El reentrenamiento se realizó mediante destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado) duró 89 pasos (54,2 s) y usó MSE y coseno a nivel de capa con peso 0,25, con `lm_head` desactivado. La etapa 2 (KD de representación multicapa) duró 205 pasos (126,0 s) con peso 0,50. En total, 294 pasos en 180,6 s con un pico de VRAM de 21.885 MB (autocast FP16 con parámetros maestros FP32). La perplejidad causal pasó de 49.261,89 (baseline post-cirugía sin KD) a 242,57 tras el entrenamiento.

## Capacidades

- Generación de texto causal autorregresiva en inglés.
- Soporte de atención causal, bidireccional y cross-attention a nivel de operador (según el perfil del módulo).
- Soporte nativo de GQA (14 cabezas de consulta, 2 KV expandidas a 14 por el adaptador).
- Soporte de RoPE: no disponible según la model card (marcado como `N/A` en el perfil del módulo).
- Capacidad conversacional heredada del tokenizer y los pesos de Qwen2.5-0.5B, aunque degradada por la perplejidad elevada.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.
- Multilingüismo: únicamente inglés declarado.

## Casos de uso

- Investigación sobre atención subcuadrática: sirve como banco de pruebas reproducible para evaluar el operador `LandmarkLocalAttention` frente a atención cuadrática en un transformer preentrenado, con telemetría de PPL y pasos de KD documentados.
- Estudio de destilación post-cirugía: el pipeline de dos etapas (alineación con backbone congelado y KD de representación multicapa) puede replicarse sobre otros modelos base para medir la recuperación de calidad.
- Experimentos de eficiencia en tiempo lineal: útil para medir empíricamente si el coste lineal del operador se traduce en ventajas de throughput en secuencias largas, aunque el contexto de entrenamiento fue de 512 tokens.
- Docencia y divulgación: ejemplo didáctico de cómo se sustituye un bloque de atención en Hugging Face Transformers mediante un adaptador y un registro de operadores.
- Prototipado de variantes híbridas: la topología `hybrid_3_1` con anclas cuadráticas en índices concretos es un punto de partida para explorar otras proporciones (por ejemplo, `hybrid_1_1` o `hybrid_7_1`).
- Validación de integración con NeuralOps Hub: el modelo se carga en una línea con `load_surgeried_model`, lo que permite probar el ecosistema NeuralOps en pipelines de investigación.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Benchmark | Metrica | Resultado |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, split validation) | Perplejidad | 242,57 |

Telemetría de entrenamiento reportada por el autor:

| Etapa | Pasos | Tiempo | Perplejidad |
|---|---:|---:|---:|
| Stage 0 (post-cirugia, sin KD) | - | - | 49.261,89 |
| Stage 1 (alineacion, backbone congelado) | 89 | 54,2 s | - |
| Stage 2 (KD de representacion multicapa) | 205 | 126,0 s | - |
| Total | 294 | 180,6 s | 242,57 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (0,5B parámetros, ~1,1 GB de repo) cabría en GPUs consumer con 4-8 GB en FP16, aunque no se documenta.
- VRAM de entrenamiento reportada: 21.885 MB de pico con autocast FP16 y parámetros maestros FP32.
- GPU recomendadas: no especificadas; para entrenamiento se usó una GPU con al menos 22 GB (A100 40 GB, L40S, RTX 3090/4090 de 24 GB serían suficientes).
- Cabe en GPU consumer: probablemente sí en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, aunque no está verificado por el autor.
- Opciones de despliegue: la model card usa `transformers` + `neuralops.hub.load_surgeried_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El formato `pytorch_model.bin` y la dependencia de NeuralOps limitan el despliegue a ese ecosistema.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-landmark-local-attention-wikitext2` | 0,5B | No disponible | 242,57 (validation) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (segun documentacion de Qwen) | No disponible en esta ficha | Apache 2.0 (Qwen2.5-0.5B) | Hugging Face |
| Modelos con atencion lineal tipo Mamba/Linear Attention | Variable | Variable | No disponible | Variable | Variable |

La comparación cuantitativa con alternativas de atención subcuadrática (por ejemplo Mamba, RWKV o Linear Attention de Katharopoulos) no está disponible en la información proporcionada. El modelo base Qwen2.5-0.5B declara una ventana de contexto de 32.768 tokens y licencia Apache 2.0, pero esta ficha no incluye su perplejidad en WikiText-2 para comparar directamente.

## Limitaciones y advertencias

- Perplejidad muy elevada (242,57) en comparación con el modelo base original; la calidad de generación es notablemente inferior y no es apta para producción sin un reentrenamiento adicional.
- Entrenado únicamente sobre WikiText-2 con `seq_len=512`; no se ha validado en dominios conversacionales, código, matemáticas ni otras tareas.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- El soporte de RoPE aparece como `N/A` en el perfil del módulo, lo que puede afectar a la extrapolación de contexto más allá de la longitud de entrenamiento.
- Dependencia del framework NeuralOps y de `transformers`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, lo que limita su despliegue.
- Riesgo de alucinación alto por la degradación de calidad tras la cirugía y el KD limitado (294 pasos).
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia Apache 2.0 que debe respetarse en la redistribución.
- Los datos de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- El repositorio tiene 0 likes y 286 descargas, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-landmark-local-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
