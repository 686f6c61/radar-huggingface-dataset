# ArchiveStudio/MiniCPM5-1B-SFT

## Resumen

MiniCPM5-1B-SFT es un checkpoint intermedio (solo SFT, previo al refuerzo y a la destilación on-policy) de MiniCPM5-1B, el primer modelo de la serie MiniCPM5 desarrollada por OpenBMB. Se trata de un transformer denso de aproximadamente 1.080 millones de parámetros, publicado bajo licencia Apache 2.0, orientado a despliegue local, on-device y escenarios con recursos limitados. Su propuesta de valor combina un tamaño muy reducido con contexto nativo largo (131.072 tokens) y razonamiento híbrido: un mismo checkpoint funciona tanto como asistente rápido como razonador deliberado mediante el modo `<think>` activable con `enable_thinking`.

El modelo destaca, según su ficha oficial, frente a alternativas open source de su clase (LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think) en uso agéntico de herramientas, generación de código y razonamiento difícil. El entrenamiento es un ejemplo completo de la gestión de datos por niveles UltraData, con corpus públicos como Ultra-FineWeb y UltraData-Math.

Esta variante SFT es especialmente relevante para desarrolladores que quieran partir de un checkpoint intermedio para fine-tuning propio o investigación sobre post-training, mientras que para producción se recomienda la versión final MiniCPM5-1B, entrenada además con RL y OPD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (LlamaForCausalLM) |
| Parametros totales | 1.080.632.832 (679.552.512 sin embeddings) |
| Parametros activos | no disponible (modelo denso, todos los parámetros activos) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16 (este checkpoint); GGUF y MLX 4-bit disponibles en variantes oficiales |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), tamano del repo 2,2 GB |

## Arquitectura y entrenamiento

MiniCPM5-1B emplea una arquitectura `LlamaForCausalLM` estandar, con 24 capas y atencion GQA (16 cabezas para Q y 2 para KV), lo que reduce la memoria de la cache KV y facilita el contexto largo de 131.072 tokens. Es un modelo denso, sin mezcla de expertos, lo que simplifica el despliegue en hardware modesto.

El entrenamiento sigue la receta UltraData Tiered Data Management en tres fases. La fase base incluye entrenamiento estable y de decaimiento para consolidar la capacidad linguistica. El mid-training refuerza capacidades objetivo con los corpus Ultra-FineWeb, Ultra-FineWeb-L3 y UltraData-Math, publicados junto al modelo. El post-training consta de tres pasos: SFT con 200B tokens de SFT de razonamiento profundo y 200B tokens de SFT de razonamiento hibrido (datos publicados como UltraData-SFT-2605), entrenamiento de profesores de RL especializados por dominio (matematicas, codigo, QA sin documentos, escritura) y, finalmente, destilacion On-Policy (OPD) de esos profesores en el modelo final. Este checkpoint corresponde exclusivamente a la etapa SFT, sin RL ni OPD.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento hibrido: chat template con `<think>` conmutable via `enable_thinking`; el mismo checkpoint sirve como asistente rapido o razonador deliberado.
- Generacion de codigo, uno de los dominios donde la ficha oficial declara mayor ventaja frente a modelos comparables.
- Uso agéntico de herramientas (tool calling), señalado en los tags y destacado en la evaluacion oficial.
- Contexto nativo largo (131K tokens) gracias a GQA.
- Escenarios de razonamiento dificil (matematicas y QA), reforzados por los datos UltraData-Math y los profesores de RL por dominio.
- Despliegue on-device y edge: formatos GGUF (llama.cpp, Ollama, LM Studio) y MLX 4-bit para Apple Silicon disponibles en variantes oficiales.

## Casos de uso

- Asistentes locales de escritorio: con ~1B de parametros y formatos GGUF/MLX, funciona en portatiles sin GPU dedicada; OpenBMB incluso publica un "desk pet" local basado en este modelo.
- Agentes de codigo en local: su rendimiento declarado en generacion de codigo y tool calling lo hace adecuado para agentes de edicion y refactorizacion que se ejecutan sin enviar codigo a la nube.
- Asistentes con uso de herramientas: el soporte de tool calling permite integrarlo en pipelines que consulten APIs, bases de datos o funciones locales en flujos multi-paso.
- Procesamiento de documentos largos: los 131.072 tokens de contexto permiten resumir o responder preguntas sobre documentos extensos en una sola pasada.
- Investigacion en post-training: al ser un checkpoint SFT previo a RL y OPD, con datos de SFT publicados, es util para reproducir o estudiar la receta de entrenamiento de OpenBMB.
- Fine-tuning por dominio: su tamano de 1B hace asequible el ajuste fino (LoRA o completo) en una sola GPU de consumo para verticales especificas.
- Aplicaciones edge y IoT: la huella de ~2,2 GB en BF16 y menos en cuantizacion 4-bit permite integrarlo en dispositivos con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye un grafico comparativo (public leaderboard) frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, donde MiniCPM5-1B alcanza SOTA open source de su clase, con ventaja mas visible en tool use, generacion de codigo y razonamiento dificil, pero sin cifras concretas en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,5-3 GB en BF16 (2,2 GB de pesos mas cache KV); ~0,8-1,2 GB con cuantizacion 4-bit (GGUF Q4 o MLX 4-bit).
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM (RTX 3060, RTX 4060 o superiores) es suficiente; para fine-tuning completo, una RTX 4090 (24 GB) o A100.
- Cabe con holgura en GPUs de consumo: incluso en portatiles con GPU integrada moderna o Apple Silicon (via MLX) es ejecutable.
- Opciones de despliegue: transformers (Hugging Face), llama.cpp, Ollama, LM Studio (via GGUF) y MLX para Apple Silicon; el repo de GitHub de MiniCPM publica cookbooks para los principales backends de inferencia y frameworks de fine-tuning.
- Latencia y throughput: no disponible; al ser un modelo denso de 1B, se espera interaccion fluida incluso en CPU moderna, sin cifras oficiales publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento hibrido | Licencia | Comentarios |
|---|---|---|---|---|---|
| MiniCPM5-1B (OpenBMB) | 1,08B | 131.072 | Si (`<think>`) | Apache 2.0 | Version final con RL + OPD; recomendada para produccion |
| LFM2.5-1.2B-Thinking | 1,2B | no disponible | Si (thinking) | no disponible | Baseline comparado oficialmente; fuerte en razonamiento |
| Qwen3-0.6B (Alibaba) | 0,6B | 32.768 | Si (think/no-think) | Apache 2.0 | Mas pequeno y con contexto menor; baseline comparado oficialmente |

En el conjunto de comparacion publicado por OpenBMB, MiniCPM5-1B alcanza el mejor resultado de su clase, con ventaja particular en tool use, codigo y razonamiento dificil.

## Limitaciones y advertencias

- Este checkpoint es solo SFT, sin RL ni OPD: para maxima calidad en produccion se recomienda la variante MiniCPM5-1B final.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y puede ser inferior.
- Alucinaciones: como todo modelo de 1B, el riesgo es elevado, especialmente en QA factual sin herramientas externas; no hay datos cuantificados.
- Sesgos: no disponible; no se documenta auditoria de sesgos en la model card.
- Contexto de 131K tokens en un modelo tan pequeno puede degradar la calidad en el uso efectivo de todo el contexto; no hay pruebas publicadas de uso efectivo de contexto largo.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los terminos de los datasets de entrenamiento si se reentrena.
- Los datos de rendimiento provienen de la propia OpenBMB; no hay evaluacion independiente publicada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchiveStudio/MiniCPM5-1B-SFT
- Version oficial OpenBMB (SFT): https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Version final (RL + OPD): https://huggingface.co/openbmb/MiniCPM5-1B
- Checkpoint base: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- Version GGUF: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Version MLX: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- UltraData: https://ultradata.openbmb.cn/
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Wiki MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B-SFT
