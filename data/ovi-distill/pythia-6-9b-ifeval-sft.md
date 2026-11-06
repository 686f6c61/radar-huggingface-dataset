# ovi-distill/pythia-6.9b-ifeval-sft

## Resumen

Pythia-6.9B IFEval SFT es un ajuste fino supervisado (SFT) del modelo base EleutherAI/pythia-6.9b, desarrollado por el proyecto ovi-distill. Su objetivo es que un modelo Pythia siga instrucciones verificables del tipo "responde en minúsculas", "usa exactamente tres puntos" o "termina con esta frase", algo que los modelos Pythia originales no hacen de serie. Se creó como modelo profesor para experimentos de destilación on-policy del propio proyecto.

El entrenamiento se realizó sobre 14.918 respuestas generadas por Qwen2.5-7B-Instruct a prompts de allenai/RLVR-IFeval (el conjunto de instrucciones de Tulu 3), filtradas mediante un verificador que confirma que la restricción se cumple. La arquitectura es un transformer GPT-NeoX denso de 6.857.302.016 parámetros con una ventana de contexto de 2.048 tokens.

Es relevante como modelo de investigación: demuestra que un SFT ligero (1,9 horas en dos H100) puede elevar el IFEval prompt-level strict del 16,3 % al 47,3 % sobre la base. No es un modelo de producción: carece de alineación y ajuste de seguridad, es monolingüe en inglés y requiere ejecutarse en float32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder GPT-NeoX (denso) |
| Parámetros totales | 6.857.302.016 |
| Parámetros activos | no disponible (no es MoE; es un modelo denso, todos los parámetros activos) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (recomendado float32; en bfloat16 las distribuciones de next-token se desvían respecto a float32) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 27,4 GB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura GPT-NeoX de Pythia-6.9B: un transformer decoder denso, sin mezcla de expertos ni mecanismos de atención lineal. La ventana de contexto es de 2.048 tokens, heredada del modelo base de 2023.

El fine-tuning usó 8.443 prompts de allenai/RLVR-IFeval, cada uno con una única restricción verificable. De cada prompt se muestrearon 4 respuestas de Qwen2.5-7B-Instruct (temperatura 0,7, top-p 0,95) y se conservaron solo las que superaban un verificador de la restricción, terminaban de forma natural y cabían en 1.024 tokens (prompt y respuesta); máximo 2 respuestas por prompt, total 14.918 respuestas. Se apartaron 500 prompts de RLVR-IFeval y todo IFEval para evaluación, garantizando que ningún prompt de entrenamiento coincida con uno de IFEval ni comparta un tramo de 13 palabras fuera de la frase de restricción.

La receta fue full fine-tuning con el trainer SFT de verl, pesos y cómputo en float32 (multiplicaciones matriciales en TF32), AdamW con learning rate 2e-5, warmup del 3 % y decaimiento coseno, sin weight decay, 2 épocas (466 pasos de 64 secuencias), pérdida solo sobre los tokens de respuesta. Coste total: 1,9 horas en dos GPU H100. No hubo RLHF ni DPO.

## Capacidades

- Seguimiento de instrucciones verificables en inglés: formato de salida (mayúsculas/minúsculas, número de bullets, frases de cierre, etc.), verificables programáticamente.
- Generación de texto conversacional con formato de chat propio: `<|user|>\n{prompt}\n<|assistant|>\n` (marcadores en texto plano, escritos por la chat template del tokenizador).
- Generación de texto general heredada de Pythia-6.9B, sin capacidades de razonamiento avanzado, visión ni audio.
- No hay soporte documentado de tool calling, function calling ni agentes.
- No hay soporte multilingüe: el modelo es solo para inglés.
- Capacidad especial: servir como modelo profesor en destilación on-policy dentro del proyecto ovi-distill.

## Casos de uso

- Investigación en destilación on-policy: el modelo está diseñado como profesor para destilar capacidades de seguimiento de instrucciones en modelos más pequeños, generando respuestas verificables que un estudiante puede imitar.
- Investigación en seguimiento de instrucciones verificables: útil como baseline para estudiar cómo el número de restricciones por prompt afecta al cumplimiento (64,9 % con una, 28,5 % con dos, 12,3 % con tres).
- Generación de texto con formato estricto y verificable: pipelines que necesitan salidas en minúsculas, un número exacto de viñetas o cierres fijos, donde la salida se valida con código.
- Construcción de datos sintéticos filtrados por verificador: combinado con un verificador tipo RLVR, permite generar y filtrar respuestas que cumplen restricciones para entrenar otros modelos.
- Estudio de la estabilidad numérica en fine-tuning: al requerir float32 (en bfloat16 las distribuciones cambian), es un caso de estudio práctico sobre precisión en modelos GPT-NeoX.
- Evaluación comparativa de chat templates: permite comparar el efecto de un formato de chat propio frente a otros (ver comparativa con open-instruct-pythia-6.9b-tulu).
- Prototipado de agentes de generación restringida: en entornos de investigación donde el prompt incluye una única restricción de formato y el contexto cabe en 2.048 tokens.

## Benchmarks y rendimiento

IFEval (541 prompts), puntuado con los checkers de IFEval de lm-eval, prompt bajo la chat template, decodificación greedy, hasta 1.280 tokens nuevos, float32:

| Modelo | Prompt-level strict % | Instruction-level strict % | Prompt-level loose % |
|---|---|---|---|
| **ovi-distill/pythia-6.9b-ifeval-sft** | **47,3** | **59,4** | **50,8** |
| Pythia-6.9B base (prompt crudo, sin chat template) | 16,3 | 30,2 | 16,5 |
| allenai/open-instruct-pythia-6.9b-tulu (su propio formato de chat) | 16,3 | 27,9 | 18,5 |

Datos adicionales publicados:

| Métrica | Valor |
|---|---|
| Muestreo a temperatura 1 (8 muestras/prompt): muestras que cumplen todas las instrucciones | 41,3 % |
| Muestreo a temperatura 1: prompts con al menos 1 de 8 muestras válidas | 67,7 % |
| Prompt-level strict por nº de instrucciones (greedy): una (305 prompts) | 64,9 % |
| Dos instrucciones (179 prompts) | 28,5 % |
| Tres instrucciones (57 prompts) | 12,3 % |
| 500 prompts held-out de RLVR-IFeval (una restricción, verificador propio) | 57,8 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 27,4 GB solo de pesos (6.857M parámetros × 4 bytes), más overhead de activaciones y KV cache; en la práctica una GPU de 40 GB o más es lo cómodo. No se han publicado cifras de cuantización (el autor recomienda no usar bfloat16).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en float32 fiel al entrenamiento; el entrenamiento se realizó en dos H100.
- Consumer GPUs: no cabe en float32 en una RTX 4090 (24 GB) sin cuantización, y la cuantización no está validada por el autor. Con cuantización a 8 bits (~7 GB de pesos) podría caber en GPUs de 16-24 GB, pero con posible degradación de precisión no documentada.
- Despliegue: transformers (código de ejemplo en la model card con `AutoModelForCausalLM` y `apply_chat_template`); compatible con text-generation-inference y endpoints de Hugging Face (tags `text-generation-inference`, `endpoints_compatible`). No se menciona soporte verificado en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFEval prompt-level strict | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ovi-distill/pythia-6.9b-ifeval-sft | 6.857M (denso) | 2.048 | 47,3 % | Apache-2.0 | Pesos públicos en Hugging Face |
| EleutherAI/pythia-6.9b (base) | 6.857M (denso) | 2.048 | 16,3 % | Apache-2.0 | Pesos públicos en Hugging Face |
| allenai/open-instruct-pythia-6.9b-tulu | 6.857M (denso) | 2.048 | 16,3 % | Apache-2.0 | Pesos públicos en Hugging Face |
| Qwen/Qwen2.5-7B-Instruct (generador de los datos) | ~7.600M (denso) | 128K | no disponible en la información proporcionada | Apache-2.0 | Pesos públicos en Hugging Face |

La comparación más relevante es entre los tres Pythia-6.9B: el SFT de ovi-distill casi triplica el prompt-level strict de la base y del fine-tune Tulu, aunque está especializado en una restricción por prompt y no en capacidades generales de chat.

## Limitaciones y advertencias

- Modelo de investigación sin alineación ni ajuste de seguridad más allá del modelo base: puede generar texto falso, sesgado u ofensivo. Riesgo de alucinación alto, propio de una base de 2023 sin RLHF/DPO.
- Solo inglés; no usar en otros idiomas.
- Entrenado con prompts de una única restricción: con dos instrucciones el cumplimiento cae al 28,5 % y con tres al 12,3 %.
- Contexto corto de 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Debe ejecutarse en float32: en bfloat16 las distribuciones next-token se desvían respecto a float32, lo que puede degradar el cumplimiento. Esto duplica los requisitos de VRAM frente a lo habitual.
- El 10 % de las respuestas greedy en IFEval alcanzan el límite de 1.280 tokens, normalmente por repetición; conviene aplicar penalizaciones de repetición o truncado en producción.
- Licencia Apache-2.0, sin restricciones para uso comercial; los datos de entrenamiento provienen de RLVR-IFeval (ODC-BY, release de Tulu 3) y respuestas generadas por Qwen2.5-7B-Instruct (Apache-2.0).
- Descargas muy bajas (245) y sin comunidad activa: poco probado en entornos reales fuera del proyecto original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ovi-distill/pythia-6.9b-ifeval-sft
- Modelo base: https://huggingface.co/EleutherAI/pythia-6.9b
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/RLVR-IFeval
- Generador de las respuestas de entrenamiento: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo comparado (Tulu SFT de Pythia): https://huggingface.co/allenai/open-instruct-pythia-6.9b-tulu
