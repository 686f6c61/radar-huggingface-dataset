# Hooshaai/qwen-2.5-0.5b-progressive-token-pruning-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-progressive-token-pruning-wikitext2` es un checkpoint derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decodificador por el mecanismo `ProgressiveTokenPruning` (PTP v2) del registro `ATTENTION_REGISTRY` del framework NeuralOps. El objetivo del experimento es evaluar mecanismos de atención subcuadrática sobre un transformer causal pequeño, midiendo la degradación y la recuperación de perplejidad tras un proceso de destilación de conocimiento en dos etapas.

El modelo no es un modelo de propósito general listo para producción: es un artefacto de investigación sobre atención eficiente. El autor publica únicamente los pesos de atención (`attention_weights.safetensors`, 163,48 MB), que deben cargarse sobre el modelo base original de Qwen2.5-0.5B tras aplicar la cirugía de atención con el patrón `hybrid_3_1`. La perplejidad final en WikiText-2 es de 15,61, frente a 58,69 del checkpoint inmediatamente posterior a la cirugía y antes de la destilación.

Con 0,5 mil millones de parámetros y licencia MIT, su relevancia actual es metodológica: documenta de forma reproducible el coste (en pasos de entrenamiento, VRAM y tiempo) de transplantar un operador de atención alternativo en un LLM causal y recuperar calidad mediante KD por capas, un procedimiento cada vez más habitual en la investigación de arquitecturas eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2) con atención híbrida: 18/24 capas con `ProgressiveTokenPruning` y 6/24 capas con atención cuadrática completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no se especifica recuento exacto en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el entrenamiento de destilación usó `seq_len=512`; el modelo base Qwen2.5-0.5B soporta contextos mayores, pero la model card no declara el contexto efectivo tras la cirugía) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en FP16, `attention_weights.safetensors`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 163,48 MB; requiere el modelo base Qwen2.5-0.5B aparte) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y 24 capas. Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: se sustituyen 18 capas por `ProgressiveTokenPruning` mediante `QwenAttentionAdapter` (con expansión automática 7x de cabezas KV donde es necesario y contrato de bypass con una única `o_proj`), y se preservan 6 capas de atención cuadrática completa como anclas en los índices `[3, 7, 11, 15, 19, 23]`.

El módulo PTP v2 puntúa cada token con una red de puntuación por capa, fuerza la conservación del primer token (BOS/CLS) y selecciona `k = ceil(L · keep_ratio)` tokens: top-k en modo bidireccional y "primer token + últimos (k-1)" en modo causal, garantizando que no haya fuga de información futura ni pérdida de claves en el paso 0. Si no se poda (`k == L`) y no hay caché, se usa la ruta rápida SDPA. El módulo soporta atención causal, bidireccional y cruzada, pero no soporta GQA nativo ni RoPE declarado (`supports_rope: N/A`).

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), sin RLHF ni DPO. La etapa 1 (alineación con backbone congelado) ejecutó 104 pasos en 54,4 s con `lm_head` desactivado y pérdida MSE + coseno por capa (peso 0,25). La etapa 2 (KD de representación multicapa) ejecutó 241 pasos en 125,5 s con peso 0,50. En total: 345 pasos, 180,1 s, `seq_len=512`, `grad_accum=4`, `topk=64`, con autocast FP16 y parámetros maestros del estudiante en FP32, alcanzando un pico de 15.063 MB de VRAM.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención con poda progresiva de tokens: reduce el conjunto de claves/valores sobre el que se calcula la atención en las capas transplantadas.
- Soporte de atención causal, bidireccional y cruzada a nivel de módulo (según la tabla de capacidades del autor).
- Conversacional y `text-generation` como pipeline declarado.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.

## Casos de uso

- Investigación en atención eficiente: servir como punto de partida reproducible para comparar `ProgressiveTokenPruning` con atención cuadrática completa bajo el mismo backbone y dataset, usando la telemetría de PPL publicada (58,69 pre-KD frente a 15,61 post-KD).
- Experimentos de destilación de conocimiento: el repositorio documenta el protocolo completo (etapas, pasos, tiempos, VRAM, pesos de las pérdidas), lo que permite replicar o variar la receta de KD sobre otros operadores del `ATTENTION_REGISTRY`.
- Pruebas de cirugía arquitectónica: el patrón `hybrid_3_1` con anclas cuadráticas en índices concretos sirve para estudiar el equilibrio entre eficiencia y calidad al sustituir solo una fracción de las capas.
- Evaluación de perplejidad en dominios concretos: el checkpoint está ajustado sobre WikiText-2, por lo que es adecuado para medir PPL en texto enciclopédico en inglés dentro de pipelines de evaluación de modelos comprimidos.
- Docencia y divulgación técnica: ejemplo mínimo (0,5B parámetros, 163 MB de pesos de atención) para explicar poda de tokens, GQA y adaptadores de atención en un curso o taller.
- Baseline para comparativas de eficiencia: al conservar 6 capas cuadráticas como ancla, permite aislar el efecto de la poda en las 18 restantes en estudios de latencia y memoria de activaciones.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 15,61 |
| WikiText-2, checkpoint post-cirugía sin KD (Stage 0) | Perplejidad | 58,69 |
| Delta de perplejidad tras KD | Perplejidad | -43,08 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM de entrenamiento observada: 15.063 MB de pico con autocast FP16 y parámetros maestros FP32 durante la destilación (`seq_len=512`, `grad_accum=4`, `topk=64`).
- VRAM de inferencia: no disponible de forma explícita; con 0,5B parámetros en FP16 el peso ronda 1 GB, pero la model card no publica cifras de inferencia.
- GPU recomendadas: no disponible; el entrenamiento documentado cabe en una GPU única de 16 GB (por ejemplo, RTX 4090, A4000 o similar), pero el autor no especifica el modelo de GPU utilizado.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (0,5B), aunque la model card no lo declara explícitamente.
- Opciones de despliegue: la carga documentada es mediante `transformers` + `neuralops.hub.load_surgeried_model` o `apply_qwen_attention_surgery` con `safetensors`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (PTP, `hybrid_3_1`) | 0,5B | no disponible | PPL WikiText-2: 15,61 | MIT | Pesos de atención en HF (requiere base Qwen2.5-0.5B) |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | no disponible en la información proporcionada | no disponible en la información proporcionada | Apache 2.0 (según el modelo base, no confirmado en esta ficha) | Pesos completos en HF |
| Otros checkpoints de NeuralOps Attention Zoo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: solo se publican los pesos de atención, no el modelo completo; es obligatorio cargar el base Qwen2.5-0.5B y aplicar la cirugía antes de usar los pesos.
- Entrenado únicamente sobre WikiText-2 en inglés; el dominio y el idioma están muy acotados y no hay evidencia de generalización fuera de texto enciclopédico.
- La perplejidad de 15,61 está declarada por el autor y marcada como no verificada (`verified: false`); no hay validación independiente.
- Sin datos publicados sobre sesgos, tasas de alucinación o robustez; el ajuste a un corpus pequeño incrementa el riesgo de alucinación fuera de dominio.
- El módulo PTP no soporta GQA nativo ni declara soporte RoPE (`supports_rope: N/A`), lo que puede limitar la extrapolación de longitud de contexto.
- No se documenta soporte para tool calling, agentes, visión ni audio; no debe asumirse ninguna de esas capacidades.
- Licencia MIT declarada en la model card, lo que en principio permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que debe respetarse por separado.
- La carga requiere el paquete `neuralops` y los scripts de cirugía (`apply_qwen_attention_surgery`), lo que añade dependencias no estándar frente a un checkpoint convencional de `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-progressive-token-pruning-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
