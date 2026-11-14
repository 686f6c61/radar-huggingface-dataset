# Hooshaai/qwen-2.5-0.5b-tri-branch-hybrid-wikitext2

## Resumen

`qwen-2.5-0.5b-tri-branch-hybrid-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del ecosistema NeuralOps (Attention Zoo). No es un modelo entrenado desde cero, sino una intervención quirúrgica sobre `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas de atención del decoder original por un operador de atención subcuadrática denominado `TriBranchHybridAttention` (clave de registro `tri_branch_hybrid`), manteniendo 6 capas de atención cuadrática completa como anclas. El resultado se destila de nuevo contra el modelo base para recuperar capacidad predictiva.

El interés del artefacto es fundamentalmente metodológico: demuestra un pipeline de "cirugía de atención" más destilación en dos etapas que reduce drásticamente la perplejidad tras el reemplazo de bloques. El modelo parte de una perplejidad de 43.434,69 en WikiText-2 inmediatamente después de la cirugía y la baja hasta 221,30 tras 319 pasos de destilación (unos 180 segundos de cómputo). Es, por tanto, una prueba de concepto reproducible más que un modelo listo para producción.

El tamaño es muy reducido (0,5 mil millones de parámetros en el modelo base), el repositorio ocupa 0,1 GB y los pesos publicados son únicamente los de atención (`attention_weights.safetensors`, 87,05 MB), no un checkpoint completo autónomo. La licencia es MIT y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con 18/24 capas de atención sustituidas por `TriBranchHybridAttention` (patrón `hybrid_3_1`) y 6 capas cuadráticas ancla en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B); pesos publicados solo de atención (87,05 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens, pero la model card no confirma el contexto efectivo tras la cirugía) |
| Tipos de cuantizacion | no disponible (solo se documenta FP16 en el ejemplo de carga; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), más `config.json` y `tokenizer.json`; requiere el modelo base Qwen2.5-0.5B para funcionar |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only Qwen2 estándar (14 cabezas de query, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) en el que se aplica un `QwenAttentionAdapter` que expande las cabezas KV 7x donde es necesario y respeta el contrato de `o_proj` único. El operador `tri_branch_hybrid` soporta atención causal, bidireccional, cross-attention, GQA nativo y RoPE, y se clasifica como atención personalizada subcuadrática. La topología `hybrid_3_1` intercala tres capas híbridas por cada capa cuadrática completa.

El entrenamiento no es preentrenamiento sino destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado, 97 pasos, 54,5 s) omite `lm_head` y usa MSE y coseno a nivel de capa con peso 0,25. La etapa 2 (destilación de representaciones multicapa, 222 pasos, 125,3 s) usa MSE y coseno con peso 0,50. En total, 319 pasos con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 21.640 MB en FP16 con parámetros maestros en FP32. No se documenta RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de texto causal autoregresiva (tarea declarada: `text-generation`).
- Conversación multi-turno (tag `conversational`), aunque sin ajuste instructivo específico documentado.
- Atención causal, bidireccional y cross-attention a nivel de operador (el módulo lo soporta, aunque el checkpoint se publica para uso causal).
- Soporte nativo de GQA y RoPE en las capas sustituidas.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en atención subcuadrática: servir de referencia reproducible para estudiar cómo afecta la sustitución de capas de atención a la perplejidad y a la estabilidad del entrenamiento, gracias a la telemetría detallada de las dos etapas de destilación.
- Experimentación con topologías híbridas: probar patrones `hybrid_3_1` frente a alternativas (por ejemplo, todas cuadráticas o todas subcuadráticas) midiendo perplejidad en WikiText-2 con el mismo pipeline.
- Docencia y divulgación: ejemplo didáctico de cirugía de módulos en transformers y de destilación en dos fases con métricas antes/después (43.434,69 → 221,30 de perplejidad).
- Prototipado de bajo coste en entornos con una sola GPU: el modelo base de 0,5 B y los 87 MB de pesos de atención permiten ciclos de iteración rápidos (entrenamiento completo en ~180 s).
- Validación de pipelines NeuralOps: usar el checkpoint como caso de prueba para `load_surgeried_model` y para verificar la compatibilidad del `QwenAttentionAdapter`.
- Generación de texto en inglés de baja exigencia: tareas de completado o generación corta donde la calidad no sea crítica y se priorice el consumo mínimo de recursos.
- Estudio de recuperación tras cirugía: analizar cuánta capacidad se recupera con destilación ligera frente a un ajuste completo, útil para decidir estrategias de bajo presupuesto.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados independientemente):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 221,30 |
| WikiText-2 (post-cirugía, etapa 0) | Perplejidad | 43.434,69 |
| WikiText-2 (delta tras destilación) | Perplejidad | -43.213,38 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5 B en FP16 ocupa aproximadamente 1 GB de pesos, más overhead de activaciones; los pesos de atención añaden 87 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090) es suficiente; para entrenamiento/destilación el autor reporta un pico de 21.640 MB, lo que sugiere una GPU de 24 GB (RTX 3090/4090 o A10/A100).
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `AutoModelForCausalLM` más `neuralops.hub.load_surgeried_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse GGUF probablemente no sea compatible con llama.cpp sin conversión adicional.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-tri-branch-hybrid-wikitext2 | 0,5 B | no disponible | 221,30 (declarada) | MIT | Hugging Face (pesos de atención) |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | 32.768 tokens | no disponible en la información | Apache 2.0 (según el modelo original) | Hugging Face |
| Alternativas de atención subcuadrática sobre modelos pequeños | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base ni de otros checkpoints comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Perplejidad muy alta (221,30) frente a lo esperable en un modelo de 0,5 B bien ajustado; la calidad de generación es presumiblemente baja y no apta para producción.
- Los pesos publicados son únicamente de atención; el repositorio no es autónomo y requiere descargar `Qwen/Qwen2.5-0.5B` y aplicar la cirugía con el código de NeuralOps.
- El modelo se ha destilado exclusivamente sobre WikiText-2, un corpus enciclopédico en inglés; el dominio y el idioma están muy restringidos.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación; se desconoce el comportamiento en dominios fuera de WikiText-2.
- El tag de idioma es solo `en`; no hay evidencia de capacidades multilingües.
- La licencia MIT del repositorio convive con la licencia del modelo base Qwen2.5-0.5B; conviene verificar las condiciones del modelo original antes de un uso comercial.
- El autor reporta los resultados como no verificados (`verified: false`); no hay validación independiente de la perplejidad declarada.
- El identificador del repositorio en los ejemplos de código (`tahamajs/...`) no coincide con el ID real (`Hooshaai/...`), lo que puede provocar errores al ejecutar el quick start tal cual.
- La fecha de creación del repositorio (2026-11-11) es posterior a la fecha actual, lo que conviene tener en cuenta al evaluar la madurez del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-tri-branch-hybrid-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
