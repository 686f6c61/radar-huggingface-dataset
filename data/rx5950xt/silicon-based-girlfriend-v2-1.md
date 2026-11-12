# RX5950XT/silicon-based-girlfriend-v2.1

## Resumen

Silicon-based-girlfriend v2.1 (矽基女友 v2.1) es un adaptador LoRA en dos etapas para roleplay en chino tradicional (Taiwán), desarrollado por el usuario RX5950XT. Se construye sobre el modelo base `huihui-ai/Huihui-Qwen3.5-9B-abliterated`, una variante "abliterated" (sin mecanismos de rechazo) de Qwen3.5-9B, y está orientado a conversaciones de rol adultas de múltiples turnos. El repositorio contiene únicamente los pesos del adaptador, no el modelo completo.

El adaptador se organiza en dos segmentos que deben aplicarse en orden estricto: primero `sft/` (fine-tuning supervisado con LoRA r16, α16, lr 1e-4, sobre 2.944 conversaciones sintéticas multi-turno y GSM8K en chino tradicional) y después `grpo/` (optimización por política con GRPO, LoRA r16, α32, lr 2e-5, KL 0.04, 8 respuestas por pregunta), que se entrena sobre los pesos ya fusionados del SFT. Aplicar los segmentos sobre el modelo base en otro orden produce resultados incorrectos.

La relevancia del modelo es acotada: es un adaptador de nicho con 0 descargas y 0 likes en el momento de la ficha, pensado para investigación del proceso de entrenamiento y para continuación de entrenamiento. El autor publica métricas internas de evaluación (mejora de coherencia en conversaciones largas, reducción de auto-repetición) y advierte que el corpus es sintético y el uso previsto es exclusivamente de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B base) con adaptadores LoRA sobre la torre de lenguaje |
| Parámetros totales | No disponible (modelo base de 9B; adaptadores de 173 MB cada uno, 496 tensores en F32) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (max_seq_len usado en SFT) |
| Tipos de cuantización | GGUF disponible en repositorio separado (`RX5950XT/silicon-based-girlfriend-v2.1-GGUF`); adaptadores originales en F32 |
| Idiomas soportados | Chino tradicional (Taiwán); chino simplificado penalizado explícitamente en GRPO |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA), GGUF en repo aparte |

## Arquitectura y entrenamiento

El adaptador se monta sobre `huihui-ai/Huihui-Qwen3.5-9B-abliterated`, una variante del transformer Qwen3.5-9B sin capas de rechazo. Solo se entrena la torre de lenguaje; la torre visual permanece congelada. El pipeline de entrenamiento consta de dos fases secuenciales: SFT con LoRA de rango 16 y α16, lr 1e-4, sobre 650 pasos efectivos (de un schedule de 1.301), donde cada turno se aprende únicamente como objetivo de la respuesta de ese turno y se descartan como objetivo las respuestas que copian el patrón de la ronda anterior. El dataset SFT incluye 2.944 conversaciones multi-turno sintéticas y ejemplos de GSM8K en chino tradicional.

La segunda fase aplica GRPO con LoRA r16/α32, lr 2e-5, KL 0.04 y 8 respuestas por pregunta, durante 80 pasos efectivos (de 117 ejecutados). Los prompts de entrenamiento son en su mayoría contextos largos de 6 a 12 turnos generados por el propio modelo. La función de recompensa penaliza la copia de respuestas de turnos anteriores y el uso de caracteres simplificados. La selección de checkpoints se hizo comparando 30 rondas de auto-charla (SFT: 650 pasos minimiza la auto-copia con 27/60 frente a 32/60 en 1.010 pasos; GRPO: los pasos 80, 100 y 117 quedan dentro del ruido en la evaluación de conversación larga). Una advertencia técnica relevante: al fusionar los adaptadores con `merge_and_unload()` y guardar con `save_pretrained`, transformers no carga los 15 tensores `mtp.*` y los omite silenciosamente; es necesario comparar la lista de tensores y restaurarlos desde el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en chino tradicional, con énfasis en coherencia a lo largo de contextos largos (hasta 16.384 tokens).
- Roleplay de personaje persistente: mantiene rasgos y estilo a lo largo de decenas de turnos.
- Razonamiento matemático básico (GSM8K en chino tradicional, 79% reportado).
- Reducción explícita de auto-repetición: penalización en GRPO de copiar respuestas de turnos previos.
- Control de variedad dialectal: penalización de caracteres simplificados para forzar chino tradicional.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en este adaptador (la torre visual del base está congelada y no se entrena).

## Casos de uso

- Investigación de pipelines SFT + GRPO: el repositorio incluye `training-evidence/` con `trainer_state.json`, `run.log.gz`, `hardware_env.txt` y `requirements-cloud.txt`, lo que permite reproducir y auditar el proceso de entrenamiento paso a paso.
- Estudio de mitigación de auto-repetición en diálogos largos: la comparativa v2 vs v2.1 (171 vs 14 respuestas auto-copiadas en 720 turnos) sirve como caso de referencia para diseñar funciones de recompensa en GRPO.
- Desarrollo de personajes conversacionales en chino tradicional: el adaptador mantiene consistencia de personaje en sesiones de 30+ turnos, adecuado para prototipos de chatbots de rol.
- Benchmarking de adaptadores LoRA de rol: permite comparar el efecto de SFT + GRPO frente a SFT solo sobre el mismo modelo base.
- Generación de datos sintéticos de diálogo en chino tradicional: el modelo puede producir conversaciones multi-turno etiquetadas para alimentar otros pipelines.
- Evaluación de robustez dialectal: útil para estudiar cómo una penalización explícita en la recompensa afecta la proporción de caracteres simplificados en la salida.
- Experimentos de continuación de entrenamiento: el repositorio está pensado para quien quiera seguir entrenando desde los checkpoints intermedios (`sft/` o `grpo/`).

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (evaluación con un mismo juez, 6 personajes nuevos × 30 turnos × 4 semillas):

| Métrica | v2 | v2.1 |
|---|---|---|
| Puntuación total en conversación larga | 3,70 | 5,23 |
| Respuestas que copian una ronda anterior (de 720 turnos) | 171 | 14 |
| Comparación ciega por turno vs v2 | — | 34% (respuestas más cortas) |
| GSM8K | 85% | 79% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo fusionado (~9B parámetros): aproximadamente 18 GB en bf16/fp16, 10-11 GB en cuantización 8-bit, 6-7 GB en Q4_K_M GGUF.
- GPU recomendadas: A100 40 GB o H100 para bf16 sin cuantizar con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado o cuantización 8-bit.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 con contexto recortado, y en GPUs de 8-12 GB usando los GGUF cuantizados del repositorio `-GGUF`.
- Opciones de despliegue: llama.cpp / Ollama para GGUF; vLLM o TGI para el modelo fusionado en bf16; transformers + PEFT para cargar los adaptadores sin fusionar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Silicon-based-girlfriend v2.1 | 9B (base) + LoRA | 16.384 | Roleplay chino tradicional, SFT + GRPO | Apache-2.0 | Adaptador LoRA + GGUF |
| Huihui-Qwen3.5-9B-abliterated (base) | 9B | No disponible | Modelo general sin rechazo | Apache-2.0 (según upstream) | Pesos completos |
| Qwen3.5-9B (upstream) | 9B | No disponible | Modelo general multilingüe | Apache-2.0 | Pesos completos |

No se dispone de datos de benchmarks comparativos con otros adaptadores de rol en la información proporcionada.

## Limitaciones y advertencias

- Modelo de rol adulto: el autor lo declara explícitamente para adultos y con fines de investigación; no apto para producción orientada a público general.
- Corpus de entrenamiento sintético: los sesgos y errores del generador de datos pueden propagarse al adaptador.
- Alucinación: no se han publicado evaluaciones de factualidad; el dominio es conversacional y creativo, no de recuperación de hechos.
- Idiomas: soporte efectivo limitado a chino tradicional; el uso en otros idiomas no está validado y el GRPO penaliza caracteres simplificados.
- Orden de fusión obligatorio: aplicar `grpo/` sobre el modelo base sin fusionar antes `sft/` produce resultados incorrectos.
- Pérdida silenciosa de tensores `mtp.*` al fusionar y guardar con `save_pretrained`; requiere restauración manual desde el modelo base.
- Contexto efectivo: aunque se entrenó con `max_seq_len` 16.384, las evaluaciones se hicieron sobre 30 turnos; el comportamiento más allá de ese horizonte no está documentado.
- Licencia Apache-2.0 heredada del base y del upstream Qwen; conviene verificar las condiciones de la variante abliterated antes de uso comercial.
- Sin métricas de benchmarks estándar publicadas; la única evidencia de rendimiento son las evaluaciones internas del autor.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2.1
- Repositorio GGUF: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2.1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/RX5950XT/silicon-based-girlfriend-v2-dataset
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-9B
