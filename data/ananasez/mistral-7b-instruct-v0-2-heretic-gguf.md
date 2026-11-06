# Ananasez/mistral-7b-instruct-v0.2-heretic-GGUF

## Resumen

Mistral-7B-Instruct-v0.2-heretic-GGUF es una cuantización en formato GGUF (Q4_K_M) del modelo Ananasez/mistral-7b-instruct-v0.2-heretic, que a su vez deriva de mistralai/Mistral-7B-Instruct-v0.2. El autor, Ananasez, ha aplicado una técnica de "abliteración" (ablation direccional) mediante la herramienta Heretic v2.0.0.dev0 sobre el modelo instruct original de Mistral AI, eliminando la dirección de rechazo aprendida durante el alignment. El resultado es un modelo conversacional de 7.241.732.096 parámetros que responde a peticiones que el modelo original rechazaría sistemáticamente.

La relevancia de esta ficha radica en que documenta un caso concreto de modificación post-entrenamiento sin datos adicionales: no hay fine-tuning, solo una intervención sobre las matrices `attn.o_proj` y `mlp.down_proj` de las capas 16 a 24. El autor reporta métricas medibles: el tasa de rechazo ante 100 prompts dañinos cae de 84/100 a 10/100, con una divergencia KL de 0.0157 respecto al original sobre un conjunto de prompts benignos. Estos números permiten evaluar el coste de la abliteración en términos de deriva distribucional.

El modelo conserva la arquitectura Mistral-7B (32 bloques, 4096 de embedding, GQA 4:1, contexto de 32768 tokens, vocab de 32000) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial. Su formato GGUF y su tamaño de 4,37 GB lo hacen desplegable en hardware de consumo mediante llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (llama), 32 bloques, 4096 embedding, 32 cabezas / 8 KV (GQA 4:1) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32768 tokens |
| Tipos de cuantizacion | Q4_K_M (file_type 15); el repo solo publica este cuantizado |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (4,37 GB); tokenizer SentencePiece, chat template Mistral incluido |

## Arquitectura y entrenamiento

El modelo base es Mistral-7B-Instruct-v0.2, un transformer decoder-only denso con atención de consultas agrupadas (GQA 4:1, 32 cabezas de atención y 8 de clave/valor), 32 bloques y dimensión de embedding 4096. Usa tokenizer SentencePiece con vocabulario de 32000 y `rope.freq_base` = 1e6, lo que habilita el contexto de 32768 tokens. No se ha realizado entrenamiento adicional sobre este modelo: la intervención es puramente post-entrenamiento.

La modificación consiste en una abliteración con Heretic v2.0.0.dev0, que aplica una ablación direccional de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las matrices `attn.o_proj` y `mlp.down_proj` de las capas 16 a 24. Los parámetros del trial seleccionado son: `start_layer_index` 16, `end_layer_index` 24, `preserve_good_behavior_weight` 0.7547, `steer_bad_behavior_weight` 0.0005, `overcorrect_relative_weight` 0.5578 y `neighbor_count` 8. El autor ejecutó 50 trials en bf16 sobre una GPU L40S y eligió el trial sobre el frente de Pareto con la regla de menos de 10 rechazos y KL más bajo. La base teórica es el trabajo de Arditi et al. sobre la dirección única que media el rechazo en modelos de lenguaje. Posteriormente se convirtió a GGUF con `convert_hf_to_gguf.py --outtype f16` y se cuantizó con `llama-quantize ... Q4_K_M`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat Mistral incluida en el GGUF.
- Respuesta a peticiones que el modelo original rechazaría: el autor mide una caída del tasa de rechazo de 84/100 a 10/100 sobre `mlabonne/harmful_behaviors` test[:100].
- Razonamiento y generación de código heredados del modelo instruct base (no se han publicado evaluaciones específicas tras la abliteración).
- Soporte de tool calling / function calling: no disponible en la información proporcionada; el modelo base Mistral-7B-Instruct-v0.2 no lo documenta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para esta variante.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Modo thinking, visión o audio: no disponible.
- Inferencia local vía llama.cpp y Ollama, con soporte de `--jinja` para la plantilla de chat.

## Casos de uso

- Investigación sobre alignment y rechazo: el modelo sirve como caso controlado para estudiar cómo la abliteración afecta a la distribución de salidas, comparando el KL de 0.0157 frente al original sobre prompts benignos.
- Evaluación de robustez de salvaguardas: permite medir empíricamente la eficacia de la dirección de rechazo y contrastar la hipótesis de Arditi et al. en un modelo de 7B con capas concretas identificadas.
- Despliegue local en hardware de consumo: con 4,37 GB en Q4_K_M cabe en GPUs con 6-8 GB de VRAM y se ejecuta con `ollama run hf.co/Ananasez/mistral-7b-instruct-v0.2-heretic-GGUF:Q4_K_M`, útil para prototipos sin conectividad.
- Generación creativa sin filtros: escritura de ficción, guiones o contenido que el modelo original rechazaría por sus salvaguardas, en un entorno controlado y con revisión humana.
- Baseline para comparativas de cuantización: al publicarse solo Q4_K_M, sirve para medir la degradación de calidad respecto al modelo en bf16 en tareas de generación libre.
- Docencia y divulgación técnica: ejemplo didáctico de cómo una intervención de ablation direccional sobre 9 capas altera el comportamiento de rechazo sin reentrenar.

## Benchmarks y rendimiento

El autor solo publica métricas del proceso de abliteración, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | Original | Abliterado |
|---|---:|---:|
| Tasa de rechazo (100 prompts dañinos, `mlabonne/harmful_behaviors` test[:100]) | 84/100 | 10/100 |
| Divergencia KL vs original (`mlabonne/harmless_alpaca` test[:100]) | 0 (por definición) | 0.0157 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con Q4_K_M (4,37 GB de pesos más overhead de contexto); el contexto completo de 32768 tokens incrementa la KV cache de forma notable.
- GPU recomendadas: L40S para la abliteración en bf16 (según el autor); para inferencia Q4_K_M basta una RTX 3060 12 GB, RTX 4060 Ti 8 GB o superior.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más de VRAM; con 6 GB puede funcionar con contextos reducidos.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... --jinja`), Ollama (`ollama run hf.co/...:Q4_K_M`); vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---:|---|---|---|
| Ananasez/mistral-7b-instruct-v0.2-heretic-GGUF | 7,24B | 32768 | Apache-2.0 | GGUF Q4_K_M | Abliterado, solo inglés, tasa de rechazo 10/100 |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,24B | 32768 | Apache-2.0 | safetensors | Modelo original con alignment intacto, tasa de rechazo 84/100 |
| Ananasez/mistral-7b-instruct-v0.2-heretic | 7,24B | 32768 | Apache-2.0 | safetensors (bf16) | Mismo modelo sin cuantizar, referencia para comparar degradación |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina parcialmente las salvaguardas de rechazo: el modelo responde a un 10 % de prompts dañinos que el original rechazaba. No debe desplegarse en producción orientada a usuarios sin filtros externos.
- La tasa de rechazo baja no garantiza calidad: el propio autor advierte que el único juez es leer las salidas; el KL de 0.0157 indica cierta deriva distribucional respecto al original.
- Riesgo de alucinación heredado del modelo base de 7B, sin mitigaciones adicionales documentadas.
- Idioma limitado al inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base Mistral-7B-Instruct-v0.2.
- Licencia Apache-2.0 permite uso comercial, pero el despliegue de un modelo sin alignment conlleva responsabilidad legal y reputacional para el operador.
- Solo se publica el cuantizado Q4_K_M; no hay versiones Q5, Q8 ni bf16 en este repo, lo que limita la evaluación de la degradación por cuantización.
- Contexto de 32768 tokens: la KV cache con GQA 4:1 sigue consumiendo VRAM adicional significativa en contextos largos.

## Enlaces

- Hugging Face: https://huggingface.co/Ananasez/mistral-7b-instruct-v0.2-heretic-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/Ananasez/mistral-7b-instruct-v0.2-heretic
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Paper de referencia: Arditi et al., Refusal in Language Models Is Mediated by a Single Direction — https://arxiv.org/abs/2406.11717
