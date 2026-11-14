# Hooshaai/qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps (Attention Zoo). No es un modelo entrenado desde cero, sino una cirugía de atención sobre `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas de atención cuadrática originales por un módulo de atención lineal acelerado con Triton y proyecciones de bajo rango basadas en SVD genuina (`TritonSVDLinearAttention`), conservando 6 capas de atención completa como anclas. El objetivo es explorar arquitecturas de atención subcuadrática manteniendo el resto del backbone intacto.

El modelo se distribuye únicamente como pesos de atención (`attention_weights.safetensors`, 57,16 MB), no como un checkpoint completo listo para `transformers`. Para usarlo hay que partir de Qwen2.5-0.5B, aplicar la cirugía con las utilidades de NeuralOps y cargar los pesos con `strict=False`. Está pensado para investigación y experimentación con mecanismos de atención alternativos, no como modelo de producción.

La relevancia es doble: por un lado, demuestra un flujo de trabajo reproducible para intercambiar mecanismos de atención en transformers preentrenados; por otro, cuantifica el coste de esa sustitución en perplejidad. Tras dos etapas de destilación de conocimiento sobre WikiText-2, el modelo pasa de una perplejidad de 174.088,24 (post-cirugía, sin ajuste) a 86,79, lo que da una medida concreta de cuánto se degrada el modelo base al reemplazar su atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen2.5-0.5B con atención híbrida: 18/24 capas con `TritonSVDLinearAttention` (lineal, SVD de bajo rango, Triton) y 6/24 capas de atención cuadrática completa en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | No disponible de forma explícita; hereda el tamaño del backbone Qwen2.5-0.5B (≈0,5 mil millones) con los módulos de atención sustituidos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento de destilación usó `seq_len=512`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (solo pesos de atención, `attention_weights.safetensors`), más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El backbone es Qwen2.5-0.5B: `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, con GQA nativo (14:2). La cirugía aplica el patrón `hybrid_3_1`: por cada bloque de tres capas lineales se conserva una capa de atención cuadrática completa, resultando en 18 capas transplantadas y 6 anclas en los índices [3, 7, 11, 15, 19, 23]. El adaptador `QwenAttentionAdapter` mapea las proyecciones originales, expande las cabezas KV 7x donde es necesario y aplica el contrato de bypass con una única `o_proj`. El módulo `TritonSVDLinearAttention` soporta atención causal, bidireccional y cross-attention, e implementa proyecciones de bajo rango por SVD con operador de atención personalizado en Triton; según su perfil de capacidades declarado no soporta GQA nativo ni RoPE de forma nativa.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado, `lm_head` puenteado, MSE y coseno de estados ocultos con peso 0,25) duró 108 pasos (54,4 s). La etapa 2 (destilación multi-capa de representaciones, MSE y coseno con peso 0,50) duró 344 pasos (125,7 s). En total, 452 pasos y 180,3 s de optimización, con un pico de VRAM de 11.680 MB en FP16 con autocast y parámetros maestros en FP32. No se reporta RLHF ni DPO.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del backbone Qwen2.5-0.5B.
- Atención causal con soporte declarado también para atención bidireccional y cross-attention en el módulo sustituido.
- Operador de atención personalizado implementado en Triton con proyecciones SVD de bajo rango.
- Capacidad multilingüe: limitada al inglés según la model card.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en atención subcuadrática: servir de banco de pruebas reproducible para medir el impacto de sustituir atención cuadrática por atención lineal en un transformer preentrenado, usando la perplejidad en WikiText-2 como métrica de referencia.
- Estudio de destilación de conocimiento post-cirugía: el par de etapas (alineación con backbone congelado y destilación multi-capa) y sus telemetrías (108 y 344 pasos, pico de 11.680 MB) permiten replicar y comparar estrategias de recuperación tras modificar la arquitectura.
- Evaluación de kernels Triton: el módulo `TritonSVDLinearAttention` es un caso concreto para medir rendimiento y corrección de operadores de atención personalizados frente a la implementación de referencia de Qwen2.
- Experimentos de arquitecturas híbridas: el patrón `hybrid_3_1` con anclas cuadráticas permite estudiar el equilibrio entre coste computacional y calidad de representación en modelos pequeños.
- Docencia y divulgación técnica: un ejemplo compacto (0,1 GB de repo, 57,16 MB de pesos de atención) para explicar cirugía de módulos, adaptadores de proyecciones y contratos de `o_proj` en transformers.
- Prototipado de pipelines de sustitución de atención: el flujo con `apply_qwen_attention_surgery` y carga con `strict=False` sirve como plantilla para aplicar la misma técnica a otros modelos de la familia Qwen.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Metrica | Dataset / split | Valor |
|---|---|---|
| Perplejidad (post-cirugía, etapa 0) | wikitext-2-raw-v1, validación | 174.088,24 |
| Perplejidad (tras destilación) | wikitext-2-raw-v1, validación | 86,79 |
| Delta de perplejidad | wikitext-2-raw-v1, validación | -174.001,45 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia, el entrenamiento de destilación alcanzó un pico de 11.680 MB en FP16 con autocast y parámetros maestros en FP32, pero ese dato corresponde a entrenamiento, no a inferencia.
- GPU recomendadas: no especificadas. El uso del operador Triton requiere una GPU compatible con Triton; no se documentan modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: no confirmado. Por tamaño del backbone (≈0,5 mil millones de parámetros) cabría esperar que quepa en GPUs de consumo, pero no hay dato oficial en la información proporcionada.
- Opciones de despliegue: carga mediante `neuralops.hub.load_surgeried_model` o mediante el flujo manual con `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-0.5B + TritonSVDLinearAttention) | ≈0,5 B (hereda backbone) | No disponible | Híbrida 3:1 (18 lineales / 6 cuadráticas) | MIT | Pesos de atención en HF (57,16 MB) |
| Qwen/Qwen2.5-0.5B (base) | ≈0,5 B | No disponible en la información proporcionada | Cuadrática completa con GQA 14:2 | No disponible en la información proporcionada | Checkpoint completo en HF |
| Alternativas de atención lineal (p. ej. Mamba, RWKV) | No disponible | No disponible | SSM / lineal | No disponible | No disponible |

La comparación cuantitativa con el modelo base no puede establecerse con rigor porque no se aporta la perplejidad de Qwen2.5-0.5B sin cirugía en WikiText-2 dentro de la información disponible.

## Limitaciones y advertencias

- No es un checkpoint completo: solo incluye pesos de atención; requiere el backbone Qwen2.5-0.5B y las utilidades de NeuralOps para funcionar.
- La perplejidad de 86,79 en WikiText-2 es alta para un modelo de este tamaño; la cirugía degrada sustancialmente la calidad respecto al modelo original, aunque no se dispone del valor de referencia del base en la información proporcionada.
- Entrenado únicamente sobre WikiText-2, un corpus de dominio muy restringido (texto enciclopédico de Wikipedia); la generalización a otros dominios es dudosa.
- Solo inglés declarado; sin capacidades multilingües documentadas.
- No hay evidencia publicada de tool calling, razonamiento multi-paso ni uso en agentes.
- El módulo declara no soportar GQA nativo ni RoPE de forma nativa, lo que puede afectar a la fidelidad posicional frente al modelo base.
- Riesgo de alucinación no evaluado; no hay benchmarks de seguridad ni de sesgos.
- Licencia MIT, lo que permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que debe respetarse por separado.
- Los resultados de benchmarks son declarados por el autor y no están verificados.
- El repositorio tiene 0 likes y 296 descargas, y la model card referencia un `repo_id` distinto (`tahamajs/...`) en los ejemplos de código, lo que puede causar confusión al cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
