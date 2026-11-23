# JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-20M-sans-256.stride-1.suffix-conditional

## Resumen

El modelo `JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-20M-sans-256.stride-1.suffix-conditional` es un ajuste por preentrenamiento continuado (continued pretraining) del modelo base Qwen/Qwen3-4B-Base, publicado por el usuario JackHsieh en Hugging Face. No se trata de un modelo conversacional ni de un asistente instruido: es un checkpoint de investigación orientado a estudiar la inserción de "pensamientos" (thoughts) sintéticos delante de cada fragmento de documento durante el preentrenamiento, dentro de un marco que el autor etiqueta como `prestar` y `chain-of-thought`.

El modelo parte de la arquitectura transformer de Qwen3-4B-Base (4.022.468.096 parámetros reales según los pesos en safetensors) y se entrena sobre texto LaTeX de arXiv del área stat.ML. La innovación principal es que cada fragmento de 8 tokens del documento de entrenamiento va precedido por una nota generada por el propio Qwen3-4B (con el modo thinking desactivado), envuelta en tokens especiales `<|note|>` y `<|/note|>`, que describe los próximos 8 tokens. El objetivo es medir si ese condicionamiento por sufijo mejora la verosimilitud de los tokens siguientes.

Es relevante ahora porque documenta de forma muy detallada una hipótesis concreta sobre el uso de anotaciones tipo chain-of-thought durante el preentrenamiento, con hiperparámetros, dataset y evaluación reproducibles. Los resultados finales, no obstante, son marginales: la mejora en NLL por token sobre los propios fragmentos con pensamiento es de 1.2247 frente a 1.2253 sin pensamiento, con una tasa de victoria del 50,8 %, lo que indica que el efecto es prácticamente indistinguible del ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa secuencias de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos exportados en fp32 sin casting) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del transformer decoder-only de Qwen3-4B-Base, sin modificaciones estructurales más allá de la ampliación del vocabulario con dos tokens especiales: `<|note|>` (id 151669) y `<|/note|>` (id 151670), inicializados con una distribución gaussiana diagonal e incluidos en el tokenizer del repositorio en ese orden. El entrenamiento se hizo con FSDP2 full-shard, pesos maestros en fp32 y cómputo en bf16, usando flash-attention-2 sobre 8 GPU H100.

Los datos proceden del dataset `JackHsieh/statML-arxiv-iid-160M-20M`, concretamente de `train[:4608]` (4.608 documentos de 4.096 tokens cada uno), es decir, la ventana iid de 20M menos sus últimos 256 documentos, que quedan reservados (`train[4608:4864]`) para evaluación o RL. Se añade un 10 % de replay del dataset `JackHsieh/dclm-replay.seq-4096.tokens-32B`. Cada fragmento de 8 tokens (stride 1, k=8) va precedido por un pensamiento generado por el Qwen3-4B original con thinking desactivado, con el prompt `general-paragraph-nothink-prefill` y la respuesta prellenada con "The text", envuelto como `<|note|>\nKEY:{los 8 tokens previos}\nTHOUGHT:{nota}\n<|/note|>`, con `max_thought_length` de 576. La optimización usa AdamW con lr 3e-06, β 0.9/0.95, ε 1e-08, weight decay 0.01, schedule coseno con 5 % de warmup hasta 0, grad clip 1.0, batch de 32 documentos, 2 épocas (320 pasos) y semilla 0. La evaluación se realiza sobre una rejilla de test iid con stride 32 (r_val = 15/512).

## Capacidades

- Generación de texto autoregresiva propia de un modelo base de 4B parámetros, sin ajuste por instrucciones.
- Modelado de lenguaje sobre texto científico en LaTeX, en particular del área stat.ML de arXiv.
- Condicionamiento por notas: el modelo ha sido entrenado para procesar tokens `<|note|>` con estructura `KEY` y `THOUGHT` antes del contenido, por lo que puede utilizarse para estudiar ese formato.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni de razonamiento multi-paso documentado.
- Capacidades multilingües: no documentadas en la información disponible.
- No se documenta modo thinking, visión ni audio.
- El tokenizer amplía el vocabulario original de Qwen3 con los tokens `<|note|>` y `<|/note|>`.

## Casos de uso

- Investigación sobre chain-of-thought en preentrenamiento: el modelo sirve como checkpoint de referencia para replicar el experimento de insertar notas sintéticas delante de cada fragmento de 8 tokens y medir su efecto en la NLL, usando los scripts y datasets del autor.
- Evaluación de condicionamiento por sufijo: permite estudiar si el modelo aprovecha la información del pensamiento para predecir los tokens siguientes, comparando la NLL con y sin pensamiento sobre la rejilla de test iid stride-32.
- Punto de partida para RL: los 256 documentos reservados (`train[4608:4864]`) están pensados explícitamente para hacer RL contra este modelo, de modo que se puede usar como política inicial en experimentos de aprendizaje por refuerzo sobre texto científico.
- Modelado de lenguaje en dominio científico: al estar preentrenado de forma continuada sobre LaTeX de stat.ML, es adecuado para tareas de continuación de texto o scoring de verosimilitud en artículos de estadística y machine learning.
- Estudio de inicialización de tokens especiales: el repositorio incluye los tokens `<|note|>` y `<|/note|>` con inicialización gaussiana diagonal, lo que permite analizar cómo aprende el modelo embeddings nuevos durante un preentrenamiento corto (320 pasos).
- Reproducción de experimentos de preentrenamiento continuado: los hiperparámetros, el run de wandb y el script de conversión (`prestar/cpt/tools/convert_cpt_checkpoint.py to-hf`) están documentados, lo que facilita replicar el pipeline con FSDP2 y flash-attention-2 en 8×H100.
- Análisis de la brecha entre pensamiento y texto: al comparar la NLL con y sin notas (1.2247 frente a 1.2253), puede usarse para estudiar hasta qué punto las anotaciones tipo CoT aportan señal en el preentrenamiento frente al coste computacional de generarlas.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados en la información disponible son los de la evaluación final del paso 320 sobre la rejilla de test iid stride-32:

| Metrica | Valor |
|---|---|
| NLL/token con pensamiento (thoughtful) | 1.2247 |
| NLL/token sin pensamiento (thoughtless, mismos fragmentos) | 1.2253 |
| Tasa de victoria (win rate) | 50,8 % |
| NLL híbrida en todos los fragmentos (all-chunk hybrid) | 1.2464 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 16 GB solo para pesos (4.022 M parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en bf16: aproximadamente 8 GB para pesos, más overhead; en cuantización de 8 bits, alrededor de 4 GB, y en 4 bits, alrededor de 2 GB (estimaciones a partir del número de parámetros; no se documentan cuantizaciones oficiales).
- GPU recomendadas: el entrenamiento se realizó en 8×H100 con FSDP2; para inferencia basta una GPU con al menos 16 GB en fp32, como una RTX 4090 (24 GB) o una A100 (40/80 GB) para mayor margen.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más para fp32, y en tarjetas de 8-12 GB si se cuantiza.
- Opciones de despliegue: al ser pesos safetensors en fp32, puede cargarse con transformers; para servir en producción se puede convertir a GGUF y usar llama.cpp u Ollama, o desplegar con vLLM o TGI tras la conversión adecuada. No se documenta soporte nativo en ninguna de estas herramientas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (JackHsieh/4B-base...) | 4.022 M | no disponible | NLL 1.2247 en test iid stride-32 | apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B-Base | 4B (aproximado) | no disponible | no disponible | apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B | 4B (aproximado) | no disponible | no disponible | apache-2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (modelos base de ~4B parámetros) no está disponible en la información proporcionada más allá del propio modelo base Qwen3-4B-Base, del que este checkpoint es una continuación. No se dispone de datos de benchmarks comparables para Qwen3-4B-Base ni Qwen3-4B en la información disponible.

## Limitaciones y advertencias

- Es un modelo base, no un asistente instruido: no está alineado con preferencias humanas ni sigue instrucciones de forma fiable.
- El efecto del condicionamiento por pensamiento es marginal: la mejora en NLL es de 0,0006 (1.2247 frente a 1.2253) con una tasa de victoria del 50,8 %, lo que sugiere que la señal es prácticamente nula en esta configuración.
- El entrenamiento es muy corto (320 pasos, 2 épocas) y sobre un dominio muy estrecho (LaTeX de stat.ML de arXiv), por lo que el rendimiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo base, la generación libre puede producir texto plausible pero incorrecto.
- Sesgos conocidos: no documentados; al entrenarse sobre arXiv, puede heredar sesgos de la literatura científica y de la distribución de autores de stat.ML.
- Limitaciones de contexto e idioma: no documentadas; el entrenamiento usa secuencias de 4.096 tokens y el corpus es mayoritariamente en inglés.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Base también es apache-2.0 según la información disponible; conviene verificar los términos del modelo base y de los datasets de replay (dclm) antes de un uso comercial.
- Los pesos se exportan en fp32 sin casting, lo que duplica el uso de memoria frente a una versión en bf16.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación por terceros.
- Los 256 documentos reservados (`train[4608:4864]`) no deben usarse para entrenamiento si se quiere mantener la comparabilidad con la evaluación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-20M-sans-256.stride-1.suffix-conditional
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de pensamientos: https://huggingface.co/datasets/JackHsieh/4B-general-paragraph-nothink-prefill.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Run de wandb: https://wandb.ai/latent-thoughts/prestar/runs/o5qlr9aa
