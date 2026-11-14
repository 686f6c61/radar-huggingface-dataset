# Hooshaai/qwen-2.5-0.5b-padre-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-padre-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirurgicamente los bloques de atencion del decodificador por el modulo `PADReAttention` (Polynomial Attention with Dropout Regularization) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El modelo resultante se ha reentrenado mediante destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), partiendo de una perplejidad de 194,98 tras la cirugia y alcanzando 26,89 en validacion.

El proposito del modelo no es tanto el uso generativo en produccion como la validacion empirica de una arquitectura de atencion subcuadratica: demuestra que es posible reemplazar la atencion softmax estandar por un kernel polinomico numericamente estable y recuperar calidad de lenguaje mediante destilacion por capas en menos de 350 pasos de optimizacion (180,5 segundos en una sola GPU). Es, por tanto, una pieza de investigacion reproducible dentro del ecosistema NeuralOps, no un modelo conversacional pulido.

Con 0,5 mil millones de parametros, licencia MIT y un artefacto de pesos de solo 123,89 MB, el modelo es ligero y facil de inspeccionar. Su relevancia actual reside en que sirve como banco de pruebas controlado para comparar variantes de atencion (lineal, polinomica, híbrida) manteniendo constante el resto de la red, algo util para quienes investigan eficiencia de atencion en transformers pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con atencion hibrida: 18/24 capas con `PADReAttention` (kernel polinomico) y 6/24 capas con atencion cuadratica estandar |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa `seq_len=512`; el modelo base Qwen2.5-0.5B soporta contexto nativo de 32 768 tokens, pero no se confirma que se preserve tras la cirugia) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 123,89 MB) + `config.json` + `tokenizer.json` |
| Libreria | `neuralops` |
| Patron de cirugia | `hybrid_3_1` (intercalado 3:1; capas ancla cuadraticas en indices [3, 7, 11, 15, 19, 23]) |
| Cabezas de atencion | 14 cabezas query, 2 cabezas KV (GQA), `head_dim=64`, `hidden_size=896` |
| Soporte GQA nativo | no en `PADReAttention` (el `QwenAttentionAdapter` expande 7x las cabezas KV) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `Qwen2.5-0.5B`, un transformer decoder-only con 24 capas, 14 cabezas de consulta y 2 cabezas KV (GQA), `hidden_size=896` y `head_dim=64`. Sobre esa base se aplica una cirugia de atencion con patron `hybrid_3_1`: 18 de las 24 capas se sustituyen por `PADReAttention`, mientras que 6 capas (indices 3, 7, 11, 15, 19 y 23) conservan la atencion cuadratica original como anclas. El modulo `PADReAttention` reemplaza el softmax por un kernel polinomico centrado y numericamente estable de la forma `(1 + S/order)^order`, lo que reduce el coste asintotico de la atencion. El `QwenAttentionAdapter` gestiona el mapeo de proyecciones, la expansion 7x de cabezas KV cuando es necesaria y el contrato de un unico `o_proj`.

El reentrenamiento se realiza mediante destilacion de conocimiento en dos etapas. La etapa 1 (alineamiento con backbone congelado, 105 pasos, 54,1 s) omite el `lm_head` y ajusta las representaciones ocultas capa a capa con MSE y similitud coseno (peso 0,25). La etapa 2 (destilacion de representaciones multicapa, 244 pasos, 126,1 s) repite el proceso con peso 0,50 sobre las capas. En total, 349 pasos de optimizacion con `seq_len=512`, `grad_accum=4` y `topk=64`, ejecutados en 180,5 segundos con un pico de VRAM de 18 723 MB en FP16 con parametros maestros FP32. La perplejidad causal pasa de 194,98 (estado post-cirugia sin entrenar) a 26,89 en validacion de WikiText-2.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Qwen2.5-0.5B.
- Modelado de lenguaje causal medido en WikiText-2 (perplejidad 26,89 en validacion).
- Soporte de atencion causal, bidireccional y cross-attention a nivel de modulo (`supports_causal`, `supports_bidirectional`, `supports_cross_attention` marcados como `Yes` en el modulo `PADReAttention`).
- Capacidad de operar como banco de pruebas de atencion subcuadratica: permite comparar el kernel polinomico frente a softmax en el mismo backbone.
- Integracion con el ecosistema NeuralOps mediante `load_surgeried_model` y la funcion `apply_qwen_attention_surgery`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Investigacion en eficiencia de atencion: sirve como referencia controlada para medir el impacto del kernel polinomico `PADReAttention` frente a softmax sobre el mismo backbone Qwen2.5-0.5B, manteniendo constantes el resto de hiperparametros.
- Validacion de pipelines de cirugia de atencion: util para probar el `QwenAttentionAdapter` y el patron `hybrid_3_1` antes de aplicarlos a modelos mayores, dado que el coste de entrenamiento es de unos 180 segundos en una sola GPU.
- Reproduccion de destilacion de conocimiento en dos etapas: el modelo y sus metricas (`training_metrics.json`) permiten replicar el esquema de alineamiento con backbone congelado seguido de destilacion multicapa.
- Benchmarking de perplejidad en dominios controlados: con WikiText-2 como referencia, se puede usar para comparar variantes de atencion en tareas de modelado de lenguaje puro en ingles.
- Prototipado de bajo coste: con 123,89 MB de pesos y 0,5 B de parametros, es viable en entornos con recursos limitados para experimentos de generacion de texto corto.
- Educacion y divulgacion: ejemplo didactico de como sustituir un modulo de atencion en un transformer preentrenado y recuperar calidad mediante destilacion, documentado paso a paso en la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset / split | Valor |
|---|---|---|
| Perplejidad causal (final) | WikiText-2 (`wikitext-2-raw-v1`, validation) | 26,89 |
| Perplejidad causal (post-cirugia, sin KD) | WikiText-2 validation | 194,98 |
| Delta de perplejidad tras KD | WikiText-2 validation | -168,09 |
| Pasos etapa 1 (alineamiento) | — | 105 (54,1 s) |
| Pasos etapa 2 (KD multicapa) | — | 244 (126,1 s) |
| Pasos totales / tiempo | — | 349 / 180,5 s |
| VRAM pico durante entrenamiento | — | 18 723 MB (FP16 autocast, maestros FP32) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamano (0,5 B parametros), en FP16 requiere aproximadamente 1 GB de pesos, y en cuantizaciones de 8 o 4 bits cabria en menos de 1 GB, aunque no se publican variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para reproducir el entrenamiento de destilacion se necesitan al menos 18 723 MB de VRAM (equivalente a una RTX 4090 de 24 GB o A100/H100).
- Cabe en GPU consumer: si, en la mayoria de GPU con 4 GB o mas para inferencia FP16.
- Opciones de despliegue: la libreria `neuralops` con `load_surgeried_model`; tambien es posible cargar el modelo base con `transformers`, aplicar `apply_qwen_attention_surgery` y cargar los pesos con `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-padre-attention-wikitext2` | 0,5 B | no disponible (entrenado a 512) | 26,89 (validation) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5 B | 32 768 tokens | no disponible en esta ficha | Apache 2.0 (Qwen2.5) | Hugging Face |
| Otras variantes del NeuralOps Attention Zoo sobre Qwen2.5-0.5B | 0,5 B | no disponible | no disponible | MIT (segun repo NeuralOps) | Hugging Face |

La comparacion directa con el modelo base en perplejidad no es posible con los datos proporcionados, ya que la model card no incluye la perplejidad de `Qwen/Qwen2.5-0.5B` sin cirugia sobre WikiText-2. La unica referencia interna es el estado post-cirugia sin destilar (194,98), que no equivale al modelo base original.

## Limitaciones y advertencias

- Modelo de investigacion: el objetivo es validar la atencion `PADReAttention`, no ofrecer un asistente conversacional pulido; la calidad generativa puede degradarse respecto al Qwen2.5-0.5B original.
- Entrenado unicamente en WikiText-2 en ingles: el dominio es limitado (texto enciclopedico) y no se documenta fine-tuning conversacional ni de instrucciones.
- Solo idioma ingles declarado; no se garantiza comportamiento en castellano ni en otros idiomas.
- Perplejidad de 26,89 declarada por el autor y marcada como `verified: false` en el model-index; no ha sido validada de forma independiente.
- El modulo `PADReAttention` no soporta GQA nativo; el adaptador expande 7x las cabezas KV, lo que puede afectar al rendimiento en memoria frente a la atencion original.
- No se documentan variantes cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con herramientas estandar como llama.cpp u Ollama.
- Riesgo de alucinacion inherente a modelos de 0,5 B de parametros; no apto para produccion sin validacion adicional.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0; conviene revisar ambas licencias antes de un despliegue comercial.
- El contexto efectivo tras la cirugia no esta documentado; el entrenamiento usa `seq_len=512`, por lo que el comportamiento mas alla de esa longitud no esta validado.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-padre-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
