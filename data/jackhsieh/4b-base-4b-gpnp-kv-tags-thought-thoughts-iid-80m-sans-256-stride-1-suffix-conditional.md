# JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-80M-sans-256.stride-1.suffix-conditional

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de Qwen/Qwen3-4B-Base, publicado por el usuario JackHsieh bajo el paraguas de un proyecto denominado "prestar". No es un modelo conversacional al uso: es el resultado de un *continued pretraining* sobre LaTeX de arXiv en la categoría stat.ML, en el que cada fragmento de documento se precede de una "nota de pensamiento" (thought) generada previamente por el propio Qwen3-4B-Base. El objetivo declarado es estudiar si la inserción de pensamientos previos al texto mejora la modelización del lenguaje, midiendo la diferencia entre la verosimilitud de los fragmentos con pensamiento y sin él.

El modelo tiene 4.022.468.096 parámetros en formato safetensors (copia maestra en fp32, sin casting) y un tamaño de repositorio de 16,1 GB. La arquitectura subyacente es la de Qwen3-4B-Base, un transformer denso, aunque la model card no detalla la configuración de capas ni la longitud de contexto nativa. El entrenamiento consistió en 1.600 pasos (2 épocas) sobre 19.200 documentos de 4.096 tokens, con un 25 % de replay de DCLM, usando FSDP2 con pesos maestros en fp32 y cómputo en bf16 sobre 8×H100.

Su relevancia es acotada y experimental: sirve como artefacto reproducible para investigar *chain-of-thought* a nivel de preentrenamiento y para experimentos de RL sobre el conjunto de retención (held-out). No está pensado para despliegue en producción ni para uso conversacional, y de hecho no se han publicado benchmarks estándar ni una evaluación de capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos exportados en fp32; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B-Base, un transformer denso de aproximadamente 4.000 millones de parámetros. Sobre esa base se aplicó un *continued pretraining* con un esquema poco habitual: cada documento de entrenamiento se divide en fragmentos de 8 tokens con stride 1, y a cada fragmento no inicial se le antepone una nota con el formato `<|note|>\nKEY:{los 8 tokens previos}\nTHOUGHT:{nota}\n<|/note|>`. Las notas provienen de un dataset generado con Qwen3-4B-Base en modo "thinking off", usando el prompt `general-paragraph-nothink-prefill` con la respuesta prefijada con "The text", y describen los siguientes 8 tokens con una longitud máxima de 576 tokens. Se añadieron dos tokens especiales al tokenizador: `<|note|>` (151669) y `<|/note|>` (151670), inicializados con una gaussiana diagonal.

Los datos de entrenamiento son `JackHsieh/statML-arxiv-iid-160M-20M`, concretamente `train[:19200]` (19.200 documentos × 4.096 tokens), con un 25 % de replay de `JackHsieh/dclm-replay.seq-4096.tokens-32B` y rebarajado del orden principal en cada época. Se reservan `train[19200:19456]` como conjunto de retención. La optimización usó AdamW con lr 7e-6 (β 0.9/0.95, ε 1e-8, weight decay 0.01), schedule coseno con 5 % de warmup hasta 0, grad clip 1.0, batch de 32 documentos, 2 épocas (1.600 pasos) y semilla 0. El sistema fue FSDP2 full-shard con pesos maestros en fp32, cómputo bf16, flash-attention-2 y 8×H100. El checkpoint final se exportó desde el DCP del run con `prestar/cpt/tools/convert_cpt_checkpoint.py to-hf`, y el `checkpoint_meta.json` adjunto conserva el paso y el nombre del run.

## Capacidades

- Modelización de lenguaje sobre texto científico en LaTeX (stat.ML de arXiv), condicionada por notas de pensamiento antepuestas.
- Generación de texto autoregresiva heredada de Qwen3-4B-Base, sin ajuste instructivo ni de preferencias en este checkpoint.
- Manejo de los tokens especiales `<|note|>` y `<|/note|>` para delimitar bloques de pensamiento.
- Evaluación comparativa "thoughtful vs. thoughtless" sobre fragmentos con pensamiento, según el protocolo descrito por el autor.
- No se documenta soporte de *tool calling*, function calling, agentes, visión, audio ni modo thinking explícito en este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre *chain-of-thought* en preentrenamiento: el modelo permite replicar el experimento de anteponer notas a cada fragmento y medir la diferencia de NLL entre la pasada con pensamiento y sin él, tal como reporta el autor.
- Estudio de *suffix conditioning*: con stride 1 y k=8, cada fragmento no inicial queda condicionado por su nota, lo que facilita analizar cómo afecta el contexto inmediato a la predicción de los siguientes 8 tokens.
- Experimentos de RL sobre el conjunto de retención: los documentos `train[19200:19456]` quedan reservados explícitamente para este fin, de modo que el modelo puede usarse como política inicial en un pipeline de refuerzo.
- Reproducción de resultados: el run de wandb y el script de conversión permiten regenerar el checkpoint y verificar la métrica final (NLL 1.2171 frente a 1.2201 en la cuadrícula de test iid stride-32).
- Análisis de la interacción entre replay de DCLM y datos de dominio: la mezcla al 25 % de replay permite estudiar olvido catastrófico y transferencia desde texto web general a LaTeX científico.
- Estudio de tokens especiales añadidos: los tokens `<|note|>` y `<|/note|>` con inicialización gaussiana diagonal son un caso concreto para analizar cómo aprende el modelo marcas estructurales nuevas durante el CPT.
- Base para *fine-tuning* supervisado posterior: al ser un checkpoint de Qwen3-4B-Base con licencia Apache 2.0, puede servir como punto de partida para tareas específicas de procesamiento de literatura científica.

## Benchmarks y rendimiento

El autor reporta una única métrica de evaluación final (paso 1600, cuadrícula de test iid stride-32):

| Metrica | Valor |
|---|---|
| NLL/token con pensamiento (fragmentos thoughtful) | 1.2171 |
| NLL/token sin pensamiento (pasada own thoughtless) | 1.2201 |
| Win rate en fragmentos thoughtful | 52,5 % |
| NLL híbrida all-chunk | 1.2405 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, por encima de 20 GB.
- VRAM estimada en bf16/fp16: alrededor de 8 GB para pesos, más activaciones; viable en GPUs de 16-24 GB.
- GPU recomendadas: H100 o A100 para entrenamiento y evaluación a gran escala (el autor usó 8×H100); para inferencia, RTX 4090 (24 GB) o A6000 (48 GB) son suficientes en bf16.
- Cabe en GPU de consumo: sí, en bf16 en una RTX 4090 o RTX 3090 (24 GB); en fp32 requiere al menos 24 GB y deja poco margen.
- Opciones de despliegue: al ser un checkpoint de Qwen3-4B-Base en safetensors, es compatible con vLLM, TGI y transformers; para llama.cpp/Ollama haría falta convertir a GGUF, algo no documentado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (JackHsieh) | 4.022 M | No disponible | CPT con pensamientos antepuestos sobre stat.ML arXiv | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Base | ~4.000 M | No disponible en la informacion | Modelo base generalista | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen3-4B | ~4.000 M | No disponible en la informacion | Modelo instructivo con modo thinking | Apache 2.0 | HuggingFace, ampliamente usado |

La comparación relevante es con el propio Qwen3-4B-Base, del que este checkpoint es una continuación: comparte arquitectura y tokenizador (salvo los dos tokens añadidos) y se diferencia únicamente por el CPT sobre stat.ML con notas antepuestas. Frente a Qwen3-4B instructivo, este modelo carece de ajuste conversacional y de modo thinking nativo. No se dispone de datos de benchmarks comparativos entre ellos más allá de la NLL reportada.

## Limitaciones y advertencias

- Modelo de investigación: no ha pasado por ajuste instructivo, RLHF ni DPO, por lo que no es adecuado para uso conversacional directo.
- Sesgos conocidos: no documentados; al entrenarse sobre arXiv stat.ML, hereda los sesgos de estilo, terminología y distribución de esa comunidad.
- Riesgo de alucinación: alto en generación libre, como cualquier modelo base sin alineación; no se ha evaluado su factualidad.
- Limitaciones de contexto e idioma: la model card no especifica la longitud de contexto efectiva ni los idiomas soportados; el entrenamiento se centró en LaTeX científico en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Base tiene sus propios términos que conviene revisar.
- Caveat de producción: el checkpoint se exportó en fp32 sin casting, lo que duplica el espacio frente a bf16; además, los tokens `<|note|>` y `<|/note|>` solo existen en el tokenizador de este repositorio y deben gestionarse explícitamente.
- El conjunto de retención `train[19200:19456]` está reservado por el autor para RL; usarlo para evaluación o fine-tuning invalida la comparación con sus métricas.
- Sin datos de benchmarks estándar ni de rendimiento en producción; no se recomienda su despliegue sin una evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-80M-sans-256.stride-1.suffix-conditional
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de pensamientos: https://huggingface.co/datasets/JackHsieh/4B-general-paragraph-nothink-prefill.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Run de wandb: https://wandb.ai/latent-thoughts/prestar/runs/og8u1dmm
