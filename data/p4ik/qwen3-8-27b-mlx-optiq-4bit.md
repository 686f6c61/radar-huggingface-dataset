# p4ik/Qwen3.8-27B-MLX-OptiQ-4bit

## Resumen

Qwen3.8-27B-MLX-OptiQ-4bit es una cuantizacion de precision mixta del modelo Qwen3.8-27B de Alibaba, optimizada para Apple Silicon mediante la herramienta mlx-optiq. El modelo base es un LLM denso nativo multimodal (vision-lenguaje) de 27.000 millones de parametros que destaca en generacion de codigo, flujos agente y automatizacion de oficina. Esta cuantizacion emplea una asignacion de bits por capa medida mediante un barrido de sensibilidad KL exacta contra la base bf16, logrando 5,63 bits por peso efectivos con 270 tensores en 4 bits y 228 en 8 bits.

La cuantizacion incluye una cache KV medida por capas (5,00 bits
