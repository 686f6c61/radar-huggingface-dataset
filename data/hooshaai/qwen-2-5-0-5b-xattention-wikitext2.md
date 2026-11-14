# Hooshaai/qwen-2.5-0.5b-xattention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-xattention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decodificador por el módulo `xattention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es producir un modelo de propósito general, sino servir como banco de pruebas reproducible para evaluar mecanismos de atención subcuadrática (block-sparse con enrutamiento grueso-a-fino) frente a atención densa cuadrática dentro de una arquitectura transformer estándar.

El modelo se ha entrenado mediante destilación de conocimiento en dos etapas sobre el split de validación de WikiText-2 (`Salesforce/wikitext`, `wikitext-2-raw-v1`), con un total de 475 pasos de optimización en 180,3 segundos y un pico de VRAM de 12.476 MB. El resultado declarado por el autor es una perplejidad de validación de 25.732,97, muy superior a la línea base post-cirugía de 149,25, lo que indica que el proceso de destilación no ha conseguido recuperar el rendimiento del modelo original.

Es relevante ahora porque ejemplifica una tendencia creciente en el ecosistema open source: la publicación de checkpoints de investigación que documentan experimentos negativos o parcialmente fallidos con telemetría detallada, útiles para quien investiga eficiencia en atención pero no aptos para despliegue en producción. El repositorio ocupa 0,1 GB y contiene únicamente los pesos de atención modificados (`attention_weights.safetensors`, 86,28 MB), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen2.5-0.5B, con 18/24 capas de atención sustituidas por `xattention` (block-sparse con enrutamiento coarse-to-fine) y 6 capas cuadráticas ancla en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el checkpoint publicado solo contiene 86,28 MB de pesos de atención) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`); requiere cargar el modelo base Qwen2.5-0.5B y aplicar la cirugía de atención antes de cargar el state dict |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decoder-only Qwen2.5-0.5B con 24 capas, `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (`head_dim=64`) y GQA nativo. Sobre esta base se aplica un patrón de cirugía `hybrid_3_1`: se intercalan bloques de tres capas con `xattention` por cada capa cuadrática completa, resultando en 18 capas transplantadas mediante `QwenAttentionAdapter` (que gestiona la expansión 7x de cabezas KV y el contrato de `o_proj` único) y 6 capas ancla con atención densa preservadas.

El módulo `xattention` implementa atención block-sparse con enrutamiento coarse-to-fine: proyecta Q, K y V (con LoRA), aplica RoPE con slicing de `past_len`, concatena la caché KV, y si el número de claves es pequeño o `keep_ratio == 1` ejecuta atención densa; en caso contrario realiza enrutamiento a nivel de bloque, selecciona los `top-k` bloques (con `topk=64` en entrenamiento) y aplica atención fina dentro de los bloques seleccionados, con aceleración opcional mediante kernel Triton. Soporta causalidad, bidireccionalidad, cross-attention, GQA y RoPE.

El entrenamiento consistió en destilación de conocimiento en dos etapas: la etapa 1 (alineación con backbone congelado, 138 pasos, 54,1 s) omite `lm_head` y usa MSE y coseno por capa sobre estados ocultos con peso 0,25; la etapa 2 (destilación de representación multicapa, 337 pasos, 125,9 s) usa la misma pérdida con peso 0,50. Se emplearon `seq_len=512`, `grad_accum=4`, autocast FP16 con parámetros maestros del estudiante en FP32. La perplejidad causal pasó de 149,25 (post-cirugía, zero-shot) a 25.732,97 tras la destilación, un delta de +25.583,72 que indica degradación severa en lugar de recuperación.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada de la arquitectura Qwen2.5-0.5B subyacente.
- Soporte de atención causal, bidireccional y cross-attention a nivel del módulo `xattention`.
- Soporte nativo de GQA (14 cabezas Q, 2 cabezas KV) y RoPE.
- Aceleración opcional mediante kernel Triton para la atención block-sparse.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidad multilingüe limitada al inglés según el campo `language: en` de la model card.
- El checkpoint publicado no es un modelo autónomo: requiere el modelo base Qwen2.5-0.5B y la aplicación de la cirugía de atención para funcionar.

## Casos de uso

- Investigación en mecanismos de atención subcuadrática: sirve como referencia reproducible para comparar `xattention` block-sparse frente a atención densa en un transformer pequeño, con telemetría de perplejidad y tiempos de entrenamiento documentados.
- Reproducción de experimentos de destilación de conocimiento: el repositorio incluye `training_metrics.json` y detalla las dos etapas con hiperparámetros, lo que permite replicar el pipeline y estudiar por qué la KD falló en este caso (delta de +25.583,72 en perplejidad).
- Benchmark de cirugía de atención en modelos Qwen: el `QwenAttentionAdapter` y el patrón `hybrid_3_1` son reutilizables para probar otros módulos del `ATTENTION_REGISTRY` sobre la misma base.
- Estudio de eficiencia computacional: el módulo `xattention` con `topk=64` y kernel Triton permite medir el ahorro teórico de la atención block-sparse en secuencias largas, aunque en este checkpoint el contexto de entrenamiento fue de 512 tokens.
- Docencia y formación: ejemplo didáctico de un experimento negativo bien instrumentado, útil para enseñar buenas prácticas de telemetría y evaluación en investigación de arquitecturas.
- Pruebas de integración de la librería `neuralops`: el modelo se carga con `load_surgeried_model` en una línea, lo que permite validar el hub y la API de carga quirúrgica en pipelines de CI.
- No recomendado para atención al cliente, generación de código en producción, agentes ni ninguna aplicación de usuario final, dada la perplejidad declarada.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 25.732,97 |
| WikiText-2 (post-cirugía, zero-shot, Stage 0) | Perplejidad | 149,25 |
| WikiText-2 (delta tras KD) | Delta de perplejidad | +25.583,72 |

Telemetría de entrenamiento:

| Etapa | Pasos | Tiempo | Pérdida |
|---|---|---|---|
| Stage 1 (frozen-backbone alignment) | 138 | 54,1 s | MSE + coseno (0,25) |
| Stage 2 (multi-layer representation KD) | 337 | 125,9 s | MSE + coseno (0,50) |
| Total | 475 | 180,3 s | — |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB; el entrenamiento reportó un pico de 12.476 MB con FP16 autocast y parámetros maestros FP32, pero esa cifra corresponde al pipeline de destilación, no a inferencia.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM puede alojar el modelo base en FP16; para reproducir el entrenamiento se necesitan al menos 12,5 GB, lo que apunta a RTX 3090/4090, A100 o H100.
- Cabe en GPU consumer: sí, el modelo base de 0,5B cabe en GPUs de gama media como RTX 3060, RTX 4060 o superiores, siempre que se cargue el checkpoint completo tras aplicar la cirugía.
- Opciones de despliegue: la model card documenta `neuralops.hub.load_surgeried_model` y una ruta manual con `transformers` + `safetensors` + `apply_qwen_attention_surgery`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y es improbable que funcionen sin adaptación dado que el checkpoint no es un modelo completo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-xattention-wikitext2` | 0,5B (solo pesos de atención publicados) | no disponible | 25.732,97 (declarada) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (según la familia Qwen2.5) | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5B | 32.768 tokens (según la familia Qwen2.5) | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparación directa con el modelo base es la más informativa: el checkpoint quirúrgico parte de Qwen2.5-0.5B y su perplejidad declarada (25.732,97) es órdenes de magnitud superior a la línea base post-cirugía (149,25), lo que sugiere que el modelo base sin modificar tendría un rendimiento muy superior. No se dispone de datos de benchmarks de los modelos Qwen2.5-0.5B en la información proporcionada para cuantificar la brecha exacta.

## Limitaciones y advertencias

- Perplejidad de validación extremadamente alta (25.732,97) frente a la línea base post-cirugía (149,25): el proceso de destilación degradó el modelo en lugar de recuperarlo, con un delta de +25.583,72.
- El checkpoint publicado no es un modelo completo: solo contiene `attention_weights.safetensors` (86,28 MB) y requiere cargar Qwen2.5-0.5B y aplicar la cirugía de atención antes de poder usarse.
- Idiomas: únicamente inglés (`language: en`); no se documenta soporte multilingüe.
- Longitud de contexto: no documentada para inferencia; el entrenamiento usó `seq_len=512`, muy por debajo de los 32.768 tokens típicos de la familia Qwen2.5.
- Riesgo de alucinación: no evaluado; dada la perplejidad declarada, la generación de texto coherente es dudosa.
- Sesgos conocidos: no documentados; al derivar de Qwen2.5-0.5B y entrenarse solo sobre WikiText-2, es probable que herede sesgos del corpus y del modelo base, pero no hay análisis disponible.
- Licencia MIT, lo que permite uso comercial del artefacto publicado, pero el modelo base Qwen2.5-0.5B está bajo Apache 2.0 y sus términos aplican al uso combinado.
- No apto para producción: no se documentan benchmarks estándar (MMLU, HumanEval, GSM8K), ni soporte de tool calling, ni integración con servidores de inferencia habituales.
- El autor del repositorio en Hugging Face (`Hooshaai`) difiere del autor referenciado en la model card (`tahamajs`), lo que conviene verificar antes de citar o reutilizar el artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-xattention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
