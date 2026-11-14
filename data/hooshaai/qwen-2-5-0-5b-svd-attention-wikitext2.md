# Hooshaai/qwen-2.5-0.5b-svd-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-svd-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por un mecanismo de atención lineal comprimido mediante SVD (`SVDLinearAttention`), perteneciente al registro `ATTENTION_REGISTRY` del framework NeuralOps. El modelo lo publica el usuario Hooshaai (el código de referencia apunta al repositorio `tahamajs/NeuralOps`) y parte del modelo base `Qwen/Qwen2.5-0.5B` de Alibaba.

El objetivo no es ofrecer un modelo listo para producción, sino servir de banco de pruebas reproducible para arquitecturas de atención subcuadrática y para técnicas de destilación de conocimiento en dos etapas tras una cirugía de atención. El checkpoint se ha entrenado exclusivamente sobre WikiText-2 (`wikitext-2-raw-v1`) y declara una perplejidad de validación de 7538,02, un valor muy alto que refleja el estado experimental del ajuste.

Es relevante ahora porque ejemplifica una línea de trabajo activa: reducir el coste cuadrático de la atención en transformers pequeños mediante aproximaciones de bajo rango y medir la recuperación de calidad con destilación por capas. No obstante, su utilidad práctica como modelo de generación de texto es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida `hybrid_3_1`: 18/24 capas con `SVDLinearAttention` y 6/24 capas con atencion cuadratica completa (indices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 88,25 MB) mas `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica el patron de cirugia `hybrid_3_1`: cada bloque de tres capas con `svd_attention` va seguido de una capa con atencion cuadratica completa, que actua como ancla. El `QwenAttentionAdapter` gestiona la expansion de cabezas KV (7x cuando es necesario) y mantiene el contrato de `o_proj` unico. El modulo `SVDLinearAttention` soporta causalidad, bidireccionalidad, cross-attention y GQA nativo; no declara soporte de RoPE.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas desde el modelo base. La etapa 1 (alineamiento con backbone congelado, 139 pasos, 54,2 s) omite `lm_head` y minimiza MSE y coseno sobre estados ocultos por capa con peso 0,25. La etapa 2 (destilacion de representaciones multicapa, 319 pasos, 125,6 s) repite el proceso con peso 0,50. En total, 458 pasos y 180,1 s de optimizacion con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 12969 MB de VRAM en FP16 con parametros maestros en FP32. La perplejidad causal paso de 7.751.147,47 antes de la destilacion a 7538,02 tras ella.

## Capacidades

- Generacion de texto autoregresiva causal, limitada al dominio y la calidad del ajuste sobre WikiText-2.
- Atencion lineal subcuadratica en la mayoria de capas, lo que reduce el coste asintotico frente a la atencion cuadratica.
- Soporte nativo de GQA en el modulo de atencion sustituido.
- Soporte de cross-attention y de atencion bidireccional a nivel de modulo (no explotado en este checkpoint causal).
- Capacidades conversacionales heredadas del pipeline `text-generation` de Qwen2.5-0.5B, aunque degradadas por el ajuste.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion en atencion subcuadratica: sirve como referencia reproducible para comparar `SVDLinearAttention` frente a atencion cuadratica en un transformer pequeno, con telemetria de perplejidad antes y despues de la destilacion.
- Experimentos de cirugia de atención: el patron `hybrid_3_1` y el `QwenAttentionAdapter` permiten estudiar como afecta la sustitucion parcial de capas a la calidad del modelo y que capas conviene mantener como ancla.
- Validacion de pipelines de destilacion: las dos etapas (alineamiento con backbone congelado y destilacion multicapa) son un caso de estudio para medir la recuperacion de perplejidad tras una intervencion agresiva en la arquitectura.
- Benchmarking de frameworks: util para verificar la integracion de NeuralOps con Hugging Face Hub mediante `load_surgeried_model` y el registro `ATTENTION_REGISTRY`.
- Docencia y divulgacion: ejemplo minimo (0,5B parametros, 88,25 MB de pesos de atencion) para explicar GQA, atencion lineal y destilacion por capas sin requerir hardware grande.
- Pruebas de humo de despliegue: permite validar cargas de safetensors con `strict=False` y la compatibilidad con `transformers` antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-svd-attention-wikitext2 | Salesforce/wikitext (`wikitext-2-raw-v1`, validation) | Perplejidad | 7538,02 (no verificada) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas estandar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento uso 12969 MB en FP16 con parametros maestros en FP32; la inferencia en FP16 de un modelo de 0,5B ronda los 1-2 GB, aunque la informacion disponible no detalla el consumo exacto en inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el entrenamiento documentado cabe en una GPU de 16 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` mas `apply_qwen_attention_surgery`, o la API `neuralops.hub.load_surgeried_model`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-svd-attention-wikitext2 | 0,5B | no disponible | 7538,02 | MIT | Hugging Face (NeuralOps) |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | no disponible | no disponible | Apache 2.0 (segun modelo base) | Hugging Face |
| Alternativas de atencion lineal en 0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible no incluye otros checkpoints de la misma categoria con los que comparar de forma rigurosa.

## Limitaciones y advertencias

- Perplejidad de validacion muy elevada (7538,02), lo que indica una calidad de generacion muy por debajo de la del modelo base Qwen2.5-0.5B.
- Entrenado exclusivamente sobre WikiText-2 en ingles; el soporte multilingue es inexistente en la practica.
- No hay datos de sesgos, alucinacion ni evaluaciones de seguridad.
- Licencia MIT, lo que permite uso comercial, pero el checkpoint deriva de Qwen2.5-0.5B y conviene revisar las condiciones del modelo base.
- Requiere el framework NeuralOps y el codigo de cirugia de atencion (`apply_qwen_attention_surgery`); no es un checkpoint cargable directamente con `AutoModelForCausalLM.from_pretrained` sin la cirugia.
- La carga usa `strict=False`, por lo que es posible que queden pesos sin inicializar si el patron de cirugia no coincide exactamente.
- No recomendado para produccion: es un artefacto de investigacion sin validacion externa (metrica marcada como `verified: false`).
- El identificador del repositorio en la model card (`tahamajs/...`) no coincide con el ID publicado (`Hooshaai/...`), lo que puede provocar errores en los ejemplos de codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-svd-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
