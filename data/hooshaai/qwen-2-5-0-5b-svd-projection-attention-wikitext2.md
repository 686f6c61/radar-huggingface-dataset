# Hooshaai/qwen-2.5-0.5b-svd-projection-attention-wikitext2

## Resumen

El modelo `Hooshaai/qwen-2.5-0.5b-svd-projection-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atencion del decoder por un modulo propietario denominado `svd_projection_attention`, perteneciente al registro `ATTENTION_REGISTRY` del framework NeuralOps. Lo publica el usuario Hooshaai dentro del proyecto NeuralOps (repositorio `tahamajs/NeuralOps`), orientado a experimentar con variantes de atencion subcuadratica y a evaluar su impacto sobre modelos preentrenados mediante destilacion de conocimiento en dos etapas.

No es un modelo pensado para produccion ni para uso general: es un artefacto de investigacion que solo contiene los pesos de atencion modificados (`attention_weights.safetensors`, 55,07 MB), no el checkpoint completo. Para utilizarlo hay que partir del modelo base Qwen2.5-0.5B, aplicar la cirugia de atencion con la funcion `apply_qwen_attention_surgery` y cargar despues los pesos del adaptador. Su relevancia es, por tanto, metodologica: demuestra que es posible reemplazar la atencion cuadratica por proyecciones SVD factorizadas y recuperar capacidades linguisticas basicas mediante destilacion por capas.

El modelo base Qwen2.5-0.5B es un transformer decoder-only de 0,5 mil millones de parametros con 24 capas, 14 cabezas de consulta y 2 cabezas KV (GQA), `hidden_size=896` y `head_dim=64`. El checkpoint resultante mantiene esa topologia salvo en las capas sustituidas y declara una perplejidad de 296,08 en WikiText-2 (validacion), un valor muy alto en terminos absolutos que refleja el caracter experimental del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `svd_projection_attention` y 6/24 capas con atencion cuadratica estandar |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`; el modelo base soporta contextos mayores, pero no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (solo se mencionan pesos FP16 y autocast FP16 con parametros maestros FP32 durante el entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 55,07 MB); requiere el checkpoint base Qwen2.5-0.5B en safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, 14 cabezas de atencion y 2 cabezas KV (`head_dim=64`, `hidden_size=896`), y aplica un patron de cirugia `hybrid_3_1`: se sustituyen 18 de las 24 capas por `SVDProjectionAttention`, un modulo de atencion multi-cabeza cuyas proyecciones lineales se factorizan mediante descomposicion en valores singulares. Las 6 capas restantes (indices 3, 7, 11, 15, 19 y 23) conservan la atencion cuadratica original como anclas. El adaptador `QwenAttentionAdapter` gestiona la expansion 14:2 de cabezas GQA (expansion 7x de KV cuando es necesario) y mantiene el contrato de un unico `o_proj`. El modulo soporta atencion causal, bidireccional, cross-attention y GQA nativo, y delega en SDPA cuando es posible.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugia, sin entrenar) arroja una perplejidad causal de 54.523,92. La etapa 1 (alineacion con backbone congelado, 125 pasos, 54,4 s) omite el `lm_head` y minimiza MSE y coseno por capas con peso 0,25. La etapa 2 (destilacion de representaciones multicapa, 286 pasos, 125,4 s) repite el esquema con peso 0,50. En total son 411 pasos en 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 17.489 MB en FP16 autocast con parametros maestros FP32. La perplejidad final es 296,08, una delta de -54.227,84 respecto al punto de partida.

## Capacidades

- Generacion de texto autoregresiva causal en ingles, heredada del modelo base y parcialmente recuperada mediante destilacion.
- Soporte nativo de atencion causal, bidireccional y cross-attention en el modulo `SVDProjectionAttention`.
- Soporte nativo de GQA (14 cabezas de consulta, 2 cabezas KV) con expansion automatica cuando el modulo lo requiere.
- Integracion con SDPA (scaled dot-product attention) para las rutas de atencion no modificadas.
- Carga mediante el hub de NeuralOps (`load_surgeried_model`) o manualmente con `transformers` + safetensors.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido; el entrenamiento se limita a modelado de lenguaje causal sobre WikiText-2.
- Capacidad multilingue limitada al ingles segun el campo `language: en` de la model card.

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como banco de pruebas reproducible para medir el impacto de sustituir atencion cuadratica por proyecciones SVD factorizadas en un transformer preentrenado, con telemetria de perplejidad antes y despues de la destilacion.
- Experimentos de destilacion de conocimiento: el pipeline de dos etapas (alineacion con backbone congelado + destilacion multicapa) es reutilizable para otros modelos y otras variantes del registro `ATTENTION_REGISTRY`.
- Validacion de adaptadores de atencion: `QwenAttentionAdapter` y el contrato de `o_proj` unico pueden probarse frente a otras topologias GQA dentro del mismo framework.
- Benchmarking de perplejidad en WikiText-2: util como referencia base para comparar futuras variantes de atencion del proyecto NeuralOps sobre el mismo modelo y dataset.
- Desarrollo de modulos de atencion en CPU/MPS: la model card menciona un fallback Triton en `SVDProjectionLinear` que permite ejecutar en CPU y Apple Silicon, lo que facilita pruebas locales sin GPU.
- Docencia y divulgacion tecnica: ejemplo didactico de cirugia de atencion y destilacion sobre un modelo pequeno (0,5B) que cabe en GPUs de consumo y se entrena en minutos (180 s).
- No es adecuado para atencion al cliente, generacion de codigo en produccion, agentes ni ninguna tarea de usuario final dada su perplejidad de 296,08 y su naturaleza experimental.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validacion) | Perplejidad | 296,08 | No (declarado por el autor) |
| WikiText-2, etapa 0 post-cirugia (referencia interna) | Perplejidad | 54.523,92 | No (declarado por el autor) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB de pesos; el adaptador de atencion anade 55,07 MB. Con overhead de activaciones y contexto, es esperable que quepa en GPUs con 4 GB o mas, aunque no se documenta una cifra oficial.
- VRAM de entrenamiento documentada: 17.489 MB de pico en FP16 autocast con parametros maestros FP32 y `seq_len=512`, `grad_accum=4`.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU con al menos 4-8 GB deberia poder ejecutar inferencia; el entrenamiento documentado requiere al menos 18 GB (equivalente a RTX 4090, L4 24GB, A10G, A100 40GB o H100).
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4080 y RTX 4090, aunque no hay cifras oficiales de latencia ni throughput.
- Opciones de despliegue: `transformers` + `safetensors` (ruta documentada), hub de NeuralOps (`load_surgeried_model`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no es directamente compatible con llama.cpp/Ollama sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-svd-projection-attention-wikitext2` | 0,5B | no disponible | 296,08 (validacion, no verificado) | MIT | Pesos de atencion unicamente (55,07 MB); requiere Qwen2.5-0.5B |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (segun documentacion publica de Qwen) | no disponible en esta ficha | Apache 2.0 (segun Qwen) | Checkpoint completo en safetensors |
| Otras variantes del NeuralOps Attention Zoo sobre Qwen2.5-0.5B | 0,5B | no disponible | no disponible | MIT | Pesos de atencion por variante |

No se dispone de datos de benchmarks comparativos oficiales entre esta variante y el modelo base ni con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad de 296,08 en WikiText-2: un valor muy alto en terminos absolutos, indicativo de que la destilacion solo recupera parcialmente las capacidades del modelo base. No debe usarse como sustituto directo de Qwen2.5-0.5B.
- Solo se distribuyen los pesos de atencion (55,07 MB), no el checkpoint completo. Es imprescindible descargar Qwen2.5-0.5B y aplicar la cirugia con `apply_qwen_attention_surgery` antes de cargar los pesos; sin ese paso el modelo no funciona.
- Entrenado exclusivamente sobre WikiText-2 en ingles: no hay evidencia de capacidades multilingues, de codigo, matematicas, tool calling ni agentes.
- Riesgo elevado de alucinacion y de degeneracion de texto por la combinacion de perplejidad alta, corpus de entrenamiento limitado (WikiText-2) y sustitucion parcial de atencion.
- La perplejidad declarada no esta verificada (`verified: false` en el model-index); conviene reproducirla antes de citarla.
- El repositorio se publica bajo licencia MIT, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 segun la documentacion publica de Qwen); el uso comercial debe cumplir ambas.
- El campo `library_name: neuralops` implica dependencia del framework NeuralOps (`tahamajs/NeuralOps`) para la carga comoda; no es un modelo estandar de `transformers` sin aplicar la cirugia.
- El identificador del repo en el ejemplo de la model card (`tahamajs/...`) no coincide con el ID real de Hugging Face (`Hooshaai/...`); hay que ajustar la ruta al descargar.
- No se documentan sesgos especificos, pero al derivar de Qwen2.5-0.5B y entrenarse sobre WikiText-2, hereda los sesgos del corpus y del modelo base.
- No apto para produccion: es un artefacto de investigacion sin garantias de estabilidad, latencia ni calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-svd-projection-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Framework NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
