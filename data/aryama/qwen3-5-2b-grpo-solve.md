# Aryama/qwen3.5-2b-grpo-solve

## Resumen

Qwen3.5-2B Dr. GRPO: SOLVE es un adaptador LoRA de razonamiento matemático construido sobre el modelo base Qwen/Qwen3.5-2B. Lo desarrolla Aryama (Aryama V Murthy) junto a Mukund Hebbar, Yashas Nataraj Kotre y Anivarth Varma Penumetcha en el contexto del curso Advanced NLP (IIIT Hyderabad, Monsoon 2026). El adaptador se entrena con Dr. GRPO, una variante de Group Relative Policy Optimization sin normalización por desviación estándar de la recompensa y con normalizador de longitud constante, para la tarea concreta de escribir una solución matemática con una única respuesta final verificable.

El problema que aborda es acotado y bien definido: mejorar la precisión de resolución de problemas matemáticos de un modelo pequeño de 2B parámetros mediante ajuste fino con refuerzo y una recompensa binaria verificada por un checker basado en reglas. Según la model card, la precisión en el conjunto de test SOLVE pasa del 52,6% del modelo sin entrenar al 69,2% tras el ajuste, con un pass@4 del 87,5%. Es el único brazo de una sola tarea del estudio que no muestra transferencia negativa hacia las otras tareas evaluadas (JUDGE y RECONSTRUCT).

El interés práctico reside en que demuestra que un adaptador LoRA de rango 64 y apenas 62,5M de parámetros entrenables puede aportar una mejora sustancial y medible en razonamiento matemático sobre un modelo base pequeño, desplegable con vLLM o PEFT en hardware de gama media. No es un modelo completo, sino un adaptador que requiere cargar el modelo base Qwen3.5-2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r 64, α 64, dropout 0) sobre transformer Qwen3.5-2B; proyecciones de atención y MLP |
| Parametros totales | 62,5M entrenables en el adaptador (modelo base Qwen3.5-2B aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con tope de 16k tokens; evaluación de 16k extendida a 32k) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B (revisión `15852e8c1636`) usando la plantilla de chat "non-thinking". El entrenamiento emplea Dr. GRPO con 8 respuestas por pregunta, una actualización por lote, KL β = 0 y ratio de importancia a nivel de token contra los log-probs de muestreo de vLLM (limitado a 2). La recompensa es binaria: 1 si la única respuesta final es verificada como correcta por el checker basado en reglas (v3), 0 en caso contrario; las respuestas truncadas o que no pasan el filtro de formato puntúan 0.

El recipe concreto: learning rate 1e-5 con warm-up de 5 pasos, 32 preguntas × 8 respuestas por paso, rollouts solapados, y el paso 66 seleccionado por la mejor recompensa de entrenamiento en ventana móvil de 8 pasos y confirmado en el slice de desarrollo de 200 preguntas (72,4% frente al 52,4% sin entrenar). En total se vieron 2.112 preguntas. El LoRA usa r 64, α 64, dropout 0, sobre todas las proyecciones de atención y MLP, con AdamW y grad clip 1.0; muestreo con temperatura 1.0 y tope de 16k tokens. El entrenamiento se ejecutó en 2 × L40S.

## Capacidades

- Generación de soluciones matemáticas con una única respuesta final verificable (tarea SOLVE).
- Razonamiento paso a paso orientado a resolución de problemas de matemáticas.
- Formato estricto de respuesta: el modelo está entrenado para respetar filtros de formato que condicionan la puntuación.
- Generación de texto en inglés (único idioma declarado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte específico de agentes o razonamiento multi-paso más allá de la cadena de solución matemática.
- No se documenta capacidad de visión ni audio.
- No se documenta modo "thinking" explícito; se usa la plantilla de chat non-thinking del modelo base.

## Casos de uso

- Resolución automática de problemas matemáticos en entornos educativos: el adaptador recibe un enunciado y devuelve una solución con respuesta final única, lo que permite corrección automática mediante un checker basado en reglas como el usado en el entrenamiento.
- Generación de datos sintéticos de razonamiento matemático: al alcanzar un pass@4 del 87,5%, puede producir soluciones candidatas que luego se filtran por verificación, útil para aumentar datasets de entrenamiento.
- Evaluación de pipelines de verificación: la métrica de falsas alarmas en JUDGE (−13,8 puntos) sugiere que el adaptador puede integrarse en flujos donde se necesita una respuesta final contrastable con un verificador.
- Tutoría matemática con respuesta verificable: en un sistema de preguntas y respuestas, el modelo puede ofrecer una solución y una respuesta final que el backend valida antes de mostrarla al usuario.
- Benchmarking de técnicas de RL para modelos pequeños: sirve como referencia reproducible de Dr. GRPO sobre Qwen3.5-2B, con recipe y datos publicados, para comparar variantes de entrenamiento.
- Prototipado en hardware limitado: al ser un adaptador de 62,5M de parámetros sobre un base de 2B, puede desplegarse en GPUs de gama media para experimentación con razonamiento matemático sin infraestructura grande.
- Investigación en transferencia entre tareas: al ser el único brazo de una sola tarea sin transferencia negativa en el estudio, es útil para analizar cómo el ajuste en SOLVE afecta a JUDGE y RECONSTRUCT.

## Benchmarks y rendimiento

Resultados de la model card sobre los test sets FINAL-v3 (400 preguntas por tarea; IC bootstrap del 95% sobre preguntas; una semilla de entrenamiento). Para falsas alarmas, negativo es mejor.

| Entrenado en | SOLVE acc | JUDGE step % | JUDGE false alarm | JUDGE Youden J | RECON PC-v4 |
|---|---|---|---|---|---|
| SOLVE (paso 66) | +16,6 [+13,8, +19,1] | +8,8 [+2,1, +16,1] | −13,8 [−19,8, −8,1] | +15,4 [+6,2, +23,8] | +3,8 [+1,4, +6,3] |

Datos adicionales: precisión SOLVE en test del 69,2% (52,6% sin entrenar), pass@4 del 87,5%. En el slice de desarrollo de 200 preguntas, 72,4% frente al 52,4% sin entrenar. Los cambios se expresan como diferencia pareada contra Qwen3.5-2B sin entrenar. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador pesa 0,3 GB y requiere cargar el modelo base Qwen3.5-2B (2B parámetros), por lo que la VRAM depende de la cuantización del base.
- GPU de entrenamiento: 2 × L40S según la model card.
- GPU recomendadas para inferencia: no especificadas; por tamaño del base, cabe en GPUs consumer de gama media-alta, aunque no se detalla el modelo concreto.
- Despliegue con vLLM: `vllm serve Qwen/Qwen3.5-2B --enable-lora --max-lora-rank 64 --lora-modules solve=Aryama/qwen3.5-2b-grpo-solve`.
- Despliegue con PEFT: carga del base con `Qwen3_5ForConditionalGeneration` en bfloat16 y `PeftModel.from_pretrained`.
- Otros motores (llama.cpp, Ollama, TGI): no documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aryama/qwen3.5-2b-grpo-solve | 62,5M entrenables sobre base 2B | no disponible | SOLVE 69,2%, pass@4 87,5% | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (sin entrenar) | 2B | no disponible | SOLVE 52,6% | no disponible en la informacion | Hugging Face |
| Aryama/qwen3.5-2b-grpo-judge | 62,5M entrenables sobre base 2B | no disponible | JUDGE: +8,8 step %, −13,8 falsas alarmas | apache-2.0 | Hugging Face |
| Aryama/qwen3.5-2b-grpo-reconstruct | 62,5M entrenables sobre base 2B | no disponible | RECON PC-v4: +3,8 | apache-2.0 | Hugging Face |

Los adaptadores judge, reconstruct y mixed pertenecen al mismo estudio y comparten base y recipe general, por lo que la comparación es directa en términos de tarea objetivo. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Una sola semilla de entrenamiento por brazo; los resultados pueden variar con otras semillas.
- Los brazos de una sola tarea usan recipes y cantidades de datos distintas, por lo que las comparaciones entre tareas mezclan efectos de tarea y de recipe.
- Las puntuaciones de rúbrica de JUDGE y RECONSTRUCT provienen de un juez Qwen3.8-27B calibrado contra DeepSeek (r 0,94 / 0,84), no de evaluación humana.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación en la respuesta final: el modelo está entrenado para emitir una única respuesta verificable, pero fuera de distribución puede producir soluciones incorrectas con formato válido; el checker basado en reglas mitiga pero no elimina este riesgo.
- Las respuestas truncadas o que no pasan el filtro de formato puntúan 0, lo que puede penalizar casos legítimos con formato distinto.
- Licencia apache-2.0 en el adaptador, pero el uso comercial debe verificar también la licencia del modelo base Qwen3.5-2B.
- No se documentan sesgos específicos; al ser un adaptador matemático sobre un base general, hereda los sesgos del base.
- No apto como modelo de propósito general: está especializado en la tarea SOLVE y su rendimiento en otras tareas no está caracterizado salvo las métricas de transferencia reportadas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Aryama/qwen3.5-2b-grpo-solve
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de evaluación/entrenamiento: https://huggingface.co/datasets/Aryama/deepmath-solve-judge-reconstruct
- Adaptador judge: https://huggingface.co/Aryama/qwen3.5-2b-grpo-judge
- Adaptador reconstruct: https://huggingface.co/Aryama/qwen3.5-2b-grpo-reconstruct
- Adaptador mixed: https://huggingface.co/Aryama/qwen3.5-2b-grpo-mixed
- Código y reportes: https://github.com/MukundHebbar/anlp-project/tree/release
