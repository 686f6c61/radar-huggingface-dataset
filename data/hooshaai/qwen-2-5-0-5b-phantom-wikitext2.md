# Hooshaai/qwen-2.5-0.5b-phantom-wikitext2

## Resumen

`qwen-2.5-0.5b-phantom-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps (Attention Zoo). No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B cuyo bloque de atención de decoder ha sido quirúrgicamente sustituido por el operador `phantom` (`PHANTOMAttention`, Parameter-Hashed AttentioN with Token-wise Orthogonal Mapping), un mecanismo de atención subcuadrática. El resultado se ha reentrenado mediante destilación de conocimiento en dos etapas sobre WikiText-2.

El interés del modelo es fundamentalmente de investigación: sirve como banco de pruebas reproducible para evaluar si un operador de atención subcuadrática puede recuperar calidad lingüística tras una cirugía de atención agresiva. La telemetría del autor es explícita: la perplejidad pasa de 46013,23 en el checkpoint cero-shot inmediatamente después de la cirugía a 150,68 tras 454 pasos de destilación, lo que documenta tanto la magnitud del daño estructural como la capacidad de recuperación del proceso.

Se trata de un modelo pequeño (0,5B parámetros, arquitectura Qwen2 densa, contexto nativo de 32 768 tokens en el modelo base) y con licencia MIT, pero con un alcance muy acotado: solo se distribuyen los pesos de atención (57,24 MB), no el checkpoint completo, y el pipeline requiere la librería `neuralops` y la aplicación previa de la cirugía sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion `phantom` hibrida 3:1 en 18 de 24 capas |
| Parametros totales | 0,5B (heredados de Qwen/Qwen2.5-0.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta 32 768 tokens; el entrenamiento de destilacion uso `seq_len=512`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 57,24 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only denso con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica una cirugia de atencion con patron `hybrid_3_1`: 18 de las 24 capas se sustituyen por `PHANTOMAttention` mediante el `QwenAttentionAdapter`, mientras que 6 capas cuadraticas completas se conservan como anclas en los indices `[3, 7, 11, 15, 19, 23]`. El adaptador expande las cabezas KV 7x cuando es necesario y respeta el contrato de `o_proj` unico. El modulo `phantom` declara soporte causal, bidireccional y cross-attention, pero no soporte nativo de GQA ni de RoPE.

El reentrenamiento se hace con destilacion de conocimiento en dos etapas sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`). La etapa 1 (alineacion con backbone congelado) dura 138 pasos (54,3 s) y usa MSE y coseno sobre estados ocultos por capa con `lm_head` desactivado y peso de coseno 0,25. La etapa 2 (destilacion de representacion multicapa) dura 316 pasos (125,6 s) con peso de coseno 0,50. En total, 454 pasos y 180,2 s con `seq_len=512`, `grad_accum=4` y `topk=64`. El pico de VRAM durante el entrenamiento fue de 14 820 MB en FP16 autocast con parametros maestros en FP32. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva causal, heredada del modelo base Qwen2.5-0.5B.
- El operador `phantom` declara soporte causal, bidireccional y cross-attention a nivel de modulo, aunque el checkpoint se distribuye y evalua en modo causal.
- Capacidades conversacionales y de `text-generation` segun el `pipeline_tag` declarado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta soporte de vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun el campo `language` de la model card.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint permite reproducir el experimento de cirugia y medir la recuperacion de perplejidad tras destilacion, comparando el patron `hybrid_3_1` con otras configuraciones del Attention Zoo.
- Benchmark de operadores de atencion: util como referencia cuantitativa (PPL 150,68 en WikiText-2) frente a otros operadores registrados en NeuralOps sobre el mismo modelo base.
- Validacion de pipelines de cirugia y destilacion: el codigo de carga (`apply_qwen_attention_surgery` + `load_surgeried_model`) sirve para probar el flujo completo de sustitucion de atencion en modelos Qwen2 pequenos antes de escalar a tamanos mayores.
- Estudio de degradacion estructural: la telemetria pre-KD (PPL 46013,23) y post-KD (150,68) es un caso documentado para analizar cuanto dano introduce la sustitucion de atencion y cuantos pasos de destilacion hacen falta para recuperar.
- Prototipado de bajo coste en entornos con GPU consumer: con 0,5B parametros y pesos de atencion de 57 MB, el modelo se puede cargar y evaluar en una sola GPU con ~14,8 GB de VRAM en entrenamiento y bastante menos en inferencia.
- Docencia y divulgacion tecnica: ejemplo concreto y reproducible de destilacion de conocimiento por capas (MSE + coseno sobre estados ocultos) aplicada a un modelo pequeno.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 150,68 |
| WikiText-2, checkpoint post-cirugia cero-shot (Stage 0) | Perplejidad | 46 013,23 |
| Delta de perplejidad tras destilacion | Perplejidad | -45 862,55 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM de entrenamiento documentada: 14 820 MB de pico con FP16 autocast y parametros maestros en FP32.
- VRAM de inferencia: no disponible de forma explicita; por tamano (0,5B) y pesos de atencion de 57,24 MB, es esperable que quepa en GPUs consumer de 8 GB o menos, aunque el dato no esta confirmado en la informacion proporcionada.
- GPUs recomendadas: no especificadas por el autor; el entrenamiento se ejecuto en una GPU con al menos 16 GB (el pico de 14,8 GB sugiere una RTX 4080/4090, A4000 o similar).
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base, pero sin confirmacion en la documentacion.
- Opciones de despliegue: `transformers` + `neuralops` (via `load_surgeried_model` o aplicando `apply_qwen_attention_surgery` manualmente). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Notas |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-phantom-wikitext2` | 0,5B | No disponible (base: 32 768) | MIT | safetensors (solo atencion) | Atencion `phantom` hibrida 3:1, PPL 150,68 en WikiText-2 |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32 768 | Apache 2.0 (modelo base) | safetensors | Atencion cuadratica estandar con GQA y RoPE; checkpoint completo |
| Otros checkpoints del NeuralOps Attention Zoo | 0,5B | No disponible | MIT (presumible) | safetensors (solo atencion) | Mismo pipeline de cirugia con otros operadores de atencion; no se dispone de sus resultados en la informacion proporcionada |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion de rendimiento cuantitativa mas alla de la perplejidad del propio modelo.

## Limitaciones y advertencias

- El repositorio solo contiene los pesos de atencion (`attention_weights.safetensors`), no el checkpoint completo; es necesario descargar Qwen2.5-0.5B y aplicar la cirugia antes de cargar los pesos.
- Requiere la libreria `neuralops` y funciones especificas (`apply_qwen_attention_surgery`, `load_surgeried_model`) que no forman parte del ecosistema estandar de `transformers`.
- La perplejidad de 150,68 en WikiText-2 es alta para un modelo de 0,5B; el checkpoint prioriza demostrar la viabilidad del operador, no igualar la calidad del modelo base.
- Entrenado exclusivamente sobre WikiText-2 (ingles, dominio enciclopedico); el rendimiento fuera de ese dominio no esta documentado y es previsiblemente pobre.
- Solo soporta ingles segun el campo `language` de la model card.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinacion; al ser un modelo pequeno y con destilacion limitada, el riesgo de alucinacion y de respuestas incoherentes es alto.
- El autor no verifica los resultados (`verified: false` en el `model-index`); no hay evaluacion independiente.
- La licencia MIT se declara en la model card, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0) que conviene revisar antes de uso comercial.
- El campo `base_model` de la model card apunta a `Qwen/Qwen2.5-0.5B`, mientras que el codigo de ejemplo de la model card usa `tahamajs/qwen-2.5-0.5b-phantom-wikitext2` como `repo_id`; conviene verificar el identificador correcto antes de descargar.
- No hay soporte documentado de tool calling, agentes ni modo thinking; no debe asumirse ninguna de esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-phantom-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
