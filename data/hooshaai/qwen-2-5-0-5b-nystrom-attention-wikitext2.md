# Hooshaai/qwen-2.5-0.5b-nystrom-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-nystrom-attention-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai (con referencia al repositorio NeuralOps de tahamajs) que parte de `Qwen/Qwen2.5-0.5B` y sustituye quirúrgicamente parte de sus bloques de atención por un operador Nyström de atención subcuadrática. El objetivo no es ofrecer un modelo de propósito general, sino demostrar la viabilidad de reemplazar atención cuadrática por aproximaciones Nyström en un decoder causal ya entrenado y recuperar la calidad mediante destilación de conocimiento en dos etapas sobre WikiText-2.

El modelo conserva 6 de las 24 capas con atención cuadrática completa (índices 3, 7, 11, 15, 19 y 23) y sustituye las 18 restantes por `NystromAttention` con patrón `hybrid_3_1`, manteniendo la configuración GQA original de Qwen2.5-0.5B (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`). Tras un proceso de destilación de 421 pasos (~180 segundos), la perplejidad en validación de WikiText-2 pasa de 434,12 (post-cirugía sin entrenamiento) a 34,02.

Su relevancia es fundamentalmente metodológica: sirve como banco de pruebas reproducible para investigar atención subcuadrática en modelos pequeños, medir el coste de recuperación vía KD y comparar topologías híbridas. No está pensado como modelo de producción conversacional, pese a heredar el tokenizador y la interfaz de Qwen2.5-0.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con atención híbrida: 18/24 capas con `NystromAttention` (causal, chunked) y 6/24 capas con atención cuadrática completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el checkpoint publicado solo contiene pesos de atención: 86,28 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors FP16/FP32 según el script de carga) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 86,28 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA con expansión 7x), `head_dim=64`. Sobre esta base se aplica una "cirugía" de atención mediante `QwenAttentionAdapter`, que sustituye los módulos `Qwen2Attention` por `NystromAttention` en 18 de las 24 capas, preservando atención cuadrática completa en las capas 3, 7, 11, 15, 19 y 23 (patrón `hybrid_3_1`). El operador Nyström implementa atención causal con chunking, soporta GQA nativo, atención bidireccional y cross-attention, y mantiene el contrato de proyección de salida única (`o_proj`).

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado) ejecuta 128 pasos en 54,5 s con `lm_head` desactivado, usando MSE y similitud coseno a nivel de capa con peso 0,25. La etapa 2 (destilación de representaciones multicapa) ejecuta 293 pasos en 125,3 s con peso 0,50. En total: 421 pasos, 180,1 s, `seq_len=512`, `grad_accum=4`, `topk=64`, VRAM pico de 14.818 MB en FP16 con parámetros maestros en FP32. La perplejidad causal pasa de 434,12 (post-cirugía sin KD) a 34,02 tras la destilación.

## Capacidades

- Generación de texto causal autoregresiva en inglés, con la misma interfaz que Qwen2.5-0.5B.
- Atención subcuadrática causal con soporte de GQA nativo (14 cabezas Q, 2 cabezas KV).
- Soporte de atención bidireccional y cross-attention a nivel del operador (según el perfil del módulo).
- Capacidad de ser cargado mediante la API `neuralops.hub.load_surgeried_model` o mediante el flujo manual con `apply_qwen_attention_surgery`.
- No se documentan capacidades de tool calling, agentes, matemáticas avanzadas, visión ni audio en la información disponible.
- Capacidad multilingüe: solo inglés declarado (`language: en`).

## Casos de uso

- Investigación en atención subcuadrática: banco de pruebas reproducible para medir el impacto de sustituir atención cuadrática por Nyström en un decoder causal ya entrenado, con telemetría detallada de perplejidad antes y después de la destilación.
- Comparación de topologías híbridas: el patrón `hybrid_3_1` con 6 capas ancla permite estudiar qué capas son más sensibles al reemplazo y cómo varía la perplejidad según la proporción de capas sustituidas.
- Validación de pipelines de destilación: los 421 pasos y 180 s de entrenamiento con VRAM pico de 14,8 GB hacen viable reproducir el experimento en una GPU consumer de gama alta (por ejemplo, RTX 4090 de 24 GB).
- Docencia y divulgación: ejemplo didáctico de cirugía de atención, adaptadores GQA y KD por capas en un modelo pequeño.
- Prototipado de eficiencia de memoria: útil para medir el ahorro de memoria y cómputo en atención con `seq_len=512` frente al modelo base, antes de escalar a modelos mayores.
- Evaluación de robustez post-cirugía: la diferencia entre PPL 434,12 (sin KD) y 34,02 (con KD) sirve como referencia para calibrar cuánto entrenamiento necesita una sustitución de atención para recuperar calidad.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-nystrom-attention-wikitext2 | wikitext-2-raw-v1 (validation) | Perplejidad | 34,02 |
| qwen-2.5-0.5b-nystrom-attention-wikitext2 (Stage 0, post-cirugía sin KD) | wikitext-2-raw-v1 | Perplejidad | 434,12 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El valor de perplejidad figura como `verified: false` en el model-index.

## Requisitos de hardware

- VRAM de entrenamiento (KD): 14.818 MB de pico en FP16 con parámetros maestros en FP32, `seq_len=512`, `grad_accum=4`.
- VRAM de inferencia: no disponible de forma explícita; por el tamaño del modelo base (0,5 B de parámetros) se estima holgadamente por debajo de 4 GB en FP16, aunque no se confirma en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 16 GB para reproducir el entrenamiento (RTX 4090, A100, H100). Para inferencia, GPUs consumer de gama media son suficientes por el tamaño del modelo.
- Cabe en GPU consumer: sí, el modelo base de 0,5 B y el checkpoint de atención de 86 MB son compatibles con GPUs consumer; el entrenamiento de KD requiere ~15 GB, lo que encaja en una RTX 4090.
- Opciones de despliegue: la model card documenta carga vía `transformers` + `safetensors` + `apply_qwen_attention_surgery`, y vía `neuralops.hub.load_surgeried_model`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-nystrom-attention-wikitext2 | 0,5 B | no disponible | Híbrida Nyström/cuadrática (18/24 + 6/24) | MIT | Hugging Face (checkpoint de atención) |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | no disponible en la información | Cuadrática completa con GQA | Apache 2.0 (según el modelo base; no confirmado en la información) | Hugging Face |
| Otros modelos del Attention Zoo de NeuralOps | no disponible | no disponible | Variantes subcuadráticas | MIT (según el repo NeuralOps) | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para uso en producción conversacional ni como sustituto directo de Qwen2.5-0.5B.
- Entrenado únicamente sobre WikiText-2 en inglés; el dominio y el idioma están muy acotados.
- La perplejidad declarada (34,02) figura como `verified: false` en el model-index; no ha sido validada de forma independiente.
- El checkpoint publicado contiene solo los pesos de atención (`attention_weights.safetensors`, 86,28 MB), no el modelo completo; requiere descargar Qwen2.5-0.5B y aplicar la cirugía antes de cargar.
- La carga depende de código externo (`scripts.benchmarks.qwen_zoo_train_mix.apply_qwen_attention_surgery` o `neuralops.hub`), lo que añade una dependencia de reproducibilidad.
- No se documentan evaluaciones de sesgo, alucinación ni seguridad; al ser un modelo de 0,5 B, el riesgo de alucinación es alto en tareas abiertas.
- El identificador del repositorio en los ejemplos de la model card (`tahamajs/...`) difiere del ID real del repo (`Hooshaai/...`); conviene verificar la ruta antes de usarlo.
- Licencia MIT declarada, lo que permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que debe respetarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-nystrom-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
