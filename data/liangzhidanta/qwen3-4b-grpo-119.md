# liangzhidanta/Qwen3-4B-GRPO-119

## Resumen

Qwen3-4B-GRPO-119 es un fine-tuning del modelo base Qwen/Qwen3-4B, desarrollado por el usuario liangzhidanta, que aplica aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) para mejorar el razonamiento matemático. El entrenamiento se realizó con el framework slime de THUDM, combinando SGLang para el rollout y Megatron-LM para el entrenamiento, sobre 8 GPUs RTX 4090 de 24 GB. El modelo resuelve el problema de la degradación de precisión y la verbosidad excesiva en tareas de razonamiento matemático: tras 120 iteraciones de GRPO, mejora el rendimiento en AIME 2024 de 57,5% a 65,0% (pass@1) mientras reduce la longitud mediana de respuesta un 49% y el ratio de truncamiento un 54%. Es relevante porque demuestra que es posible aplicar recetas de RL diseñadas para H100 en hardware de consumo, y porque logra simultáneamente mayor precisión y mayor concisión sin recurrir a reward hacking por longitud.

El modelo conserva la arquitectura transformer del Qwen3-4B, con 4.022.468.096 parámetros, y está orientado a generación de texto en inglés y chino. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas. Los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen/Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion; hereda la del base Qwen3-4B) |
| Tipos de cuantizacion | no disponible (solo se menciona bf16 en entrenamiento) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer causal estándar con atención de múltiples cabezas y capas de normalización, sin modificaciones arquitectónicas. El entrenamiento de refuerzo utiliza GRPO con grupo de tamaño G=8 (32 prompts × 8 muestras = 256 trayectorias por iteración, equivalente a un paso de optimizador). El clipping es asimétrico estilo DAPO (eps-clip 0.2, eps-clip-high 0.28), sin penalización KL (coeficiente 0) y sin bonus de entropía. La recompensa se calcula con un verificador basado en reglas (deepscaler RM) que extrae el contenido de `\boxed{}` tras el token ` response` y lo compara con la respuesta correcta mediante equivalencia simbólica con mathd/sympy, devolviendo 0 o 1.

Los datos de entrenamiento provienen del dataset zhuzilin/dapo-math-17k, con 32 prompts por iteración, lo que equivale a unas 5,5 épocas sobre el conjunto completo en las 120 iteraciones. El optimizador es Adam con lr 1e-6 constante, weight decay 0.1 y betas (0.9, 0.98). Se usa precisión mixta bf16 con gradientes en fp32 y pesos maestros en fp32. El rollout se ejecuta con SGLang v0.5.15.post1 (4 engines con TP=2, temperatura 1.0, máximo 8192 tokens de respuesta) y el entrenamiento con Megatron-LM (TP=4 + sequence parallel, DP=2, recomputación completa de activaciones, empaquetado dinámico de tokens a 4096 por microbatch y softmax de log-probs por chunks). El rollout y el entrenamiento comparten las mismas 8 GPUs mediante torch_memory_saver con descarga/recarga de pesos cada iteración. La duración total fue de 46,6 horas (unos 23 minutos por iteración, de los cuales 15-18 minutos son rollout).

## Capacidades

- Razonamiento matemático avanzado: resuelve problemas de competición tipo AIME con precisión mejorada (65% pass@1 en AIME 2024).
- Generación de texto conversacional: mantiene el formato de chat del modelo base Qwen3-4B, con soporte de plantillas de chat.
- Multilingüe: soporta inglés y chino, tanto en prompts como en respuestas.
- Generación de soluciones paso a paso: produce razonamientos detallados y concisos, con respuesta final en formato `\boxed{}`.
- No soporta tool calling ni function calling: no se ha entrenado para ello y no se menciona en la documentación.
- No soporta visión ni audio: es un modelo puramente textual.
- No incluye modo thinking explícito: el razonamiento se genera directamente como texto de respuesta, sin separación entre pensamiento y respuesta final.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede generar explicaciones paso a paso para problemas de álgebra, teoría de números o combinatoria, adecuado para plataformas educativas que necesiten respuestas concisas y correctas.
- Resolución de problemas de competición: útil para preparar exámenes tipo AIME u olimpiadas, generando soluciones verificables con formato `\boxed{}` que pueden validarse automáticamente.
- Generación de ejercicios con soluciones: un sistema puede pedir al modelo que resuelva problemas y luego usar las soluciones como material de referencia para crear bancos de preguntas.
- Asistente de razonamiento simbólico: integrable en entornos de cálculo simbólico o herramientas de verificación matemática, donde la salida estructurada facilita el post-procesado.
- Chat conversacional bilingüe: al mantener las capacidades del base Qwen3-4B, puede usarse en asistentes de texto en inglés y chino, con mejor rendimiento en consultas que requieren razonamiento lógico.
- Evaluación de modelos de RL: sirve como punto de referencia para investigar el efecto de GRPO en modelos pequeños, especialmente en cuanto a la relación entre precisión y longitud de respuesta.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Metrica | Base (Qwen3-4B) | Este modelo (iter 119) | Variacion |
|---|---:|---:|---:|
| AIME 2024 pass@1 (30 problemas × 16 muestras) | 57,5% | 65,0% (pico 66,0% en iter 79) | +7,5 pp |
| Recompensa media en train (DAPO-Math-17K) | 0,535 | 0,629 | +0,094 |
| Longitud mediana de respuesta | 7.400 tokens | 3.777 tokens | −49% |
| Longitud media de respuesta | 6.403 tokens | 4.476 tokens | −30% |
| Ratio de truncamiento (train, cap 8k) | 46,1% | 21,1% | −54% |
| Ratio de truncamiento (eval, cap 16k) | 37,5% | 19,6% | −48% |
| Repetición degenerada | 0,0% | 0,0% | — |

Evolución del pass@1 en AIME 2024 a lo largo del entrenamiento:

| Iteracion | 0 (base) | 19 | 39 | 59 | 79 | 99 | 119 |
|---|---|---|---|---|---|---|---|
| pass@1 | 57,5% | 60,6% | 61,0% | 63,1% | 66,0% | 64,8% | 65,0% |

El autor indica un ruido test-retest de ±1 pp (el baseline se midió 3 veces: 57,5 / 57,9 / 58,5%). No se han publicado resultados en otros benchmarks (MMLU, GSM8K, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- Inferencia en bf16: el modelo tiene ~4B parámetros, lo que supone unos 8 GB de VRAM en bf16. Con contexto largo (hasta 8k tokens de respuesta) puede necesitar entre 10 y 12 GB, por lo que cabe en GPUs consumer de 12 GB o más (RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090).
- Con cuantización (no disponible en la documentación, pero aplicable con herramientas como llama.cpp o GPTQ): podría ejecutarse en GPUs de 8 GB o menos, aunque no hay datos oficiales.
- Entrenamiento: el autor usó 8×RTX 4090 24GB con colocation de rollout y entrenamiento, usando torch_memory_saver para descargar pesos entre fases. No es viable en una sola GPU para reproducir el entrenamiento completo.
- Opciones de despliegue: compatible con transformers (carga directa con `AutoModelForCausalLM`), SGLang, vLLM, TGI y llama.cpp (si se convierte a GGUF). El modelo es compatible con text-generation-inference según los tags.
- Latencia y throughput: no se proporcionan datos medidos. En una RTX 4090, un modelo de 4B en bf16 suele generar entre 30 y 60 tokens por segundo, pero depende de la longitud de contexto y la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME 2024 pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B (base) | 4,0B | no disponible | 57,5% | Apache-2.0 | Hugging Face |
| Qwen3-4B-GRPO-119 (este) | 4,0B | no disponible | 65,0% | Apache-2.0 | Hugging Face |
| ntphuc149/Qwen3-4B-GRPO | 4,0B (PEFT LoRA) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de otros fine-tunes GRPO del mismo tamaño para comparar directamente. La comparación principal es contra el modelo base, que es el punto de referencia más relevante. Otros modelos de razonamiento matemático de tamaño similar (por ejemplo, DeepSeek-R1-Distill-Qwen-1.5B o 7B) no se han incluido por falta de datos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento exclusivo en razonamiento matemático: el fine-tuning se realizó únicamente con el dataset DAPO-Math-17K, por lo que las capacidades generales de conversación y conocimiento pueden haberse degradado respecto al base Qwen3-4B.
- Idiomas limitados: solo se garantiza soporte para inglés y chino; otros idiomas pueden producir respuestas de menor calidad.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir razonamientos incorrectos o inventar pasos intermedios, especialmente fuera del dominio matemático.
- Formato de salida rígido: el entrenamiento con recompensa basada en `\boxed{}` puede inducir al modelo a forzar ese formato incluso cuando no es apropiado.
- Sin tool calling ni capacidades multimodales: no puede interactuar con herramientas externas ni procesar imágenes o audio.
- Contexto no documentado: no se especifica la longitud máxima de contexto soportada; se recomienda no exceder los 8k tokens de respuesta para evitar truncamientos.
- Reproducibilidad: el entrenamiento requiere hardware específico (8×RTX 4090) y una configuración compleja (slime + SGLang + Megatron + torch_memory_saver), lo que dificulta la replicación exacta.
- Datos de benchmark limitados: solo se reporta AIME 2024; no hay resultados en otros conjuntos estándar, lo que impide una evaluación completa de sus capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liangzhidanta/Qwen3-4B-GRPO-119
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Framework slime (THUDM): https://github.com/THUDM/slime
- Dataset DAPO-Math-17K: https://huggingface.co/datasets/zhuzilin/dapo-math-17k
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio oficial de Qwen: https://github.com/QwenLM/Qwen
