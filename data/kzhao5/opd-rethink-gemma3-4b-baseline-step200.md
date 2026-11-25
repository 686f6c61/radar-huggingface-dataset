# kzhao5/opd-rethink-gemma3-4b-baseline-step200

## Resumen

OPD_Rethink Gemma-3-4B baseline step 200 es un checkpoint de estudiante obtenido mediante destilación on-policy (on-policy distillation, OPD) a partir de `google/gemma-3-4b-pt` como inicialización y `google/gemma-3-4b-it` como profesor. Lo publica el usuario `kzhao5` como parte de un estudio sobre alineamiento de EOS en el que se compara una configuración "baseline" (OPD vainilla, sin corrección de EOS) frente a una variante con corrección semántica de clase. Este repositorio concreto es la referencia de control: comparte todos los ajustes con la variante corregida salvo el tratamiento del token de fin de secuencia.

El modelo parte de la arquitectura Gemma 3 de 4B parámetros (4.971.331.952 parámetros totales según safetensors) y se entrena con `verl` usando una recompensa a nivel de token basada en la diferencia de log-probabilidades entre estudiante y profesor, 200 pasos, batch de 16 con 4 rollouts y una longitud máxima de respuesta de 7168 tokens. El resultado es un checkpoint de investigación, no un modelo listo para producción: el propio autor advierte de que sufre inflación de longitud porque el estudiante deja de emitir su EOS y muchas respuestas agotan el presupuesto de generación.

Su relevancia es metodológica: sirve como línea base reproducible para estudiar cómo la destilación on-policy afecta al comportamiento de parada y por qué es necesario corregir el EOS. No se han publicado datos de idiomas soportados ni pipeline en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, derivado de `google/gemma-3-4b-pt`) |
| Parametros totales | 4.971.331.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa respuestas de hasta 7168 tokens y la evaluacion max_tokens 8192) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other (hereda la licencia del modelo base `google/gemma-3-4b-pt`) |
| Formato de pesos | safetensors (bf16, merged HF) + tokenizer; checkpoint FSDP `global_step_200` fusionado con `verl.model_merger` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, inicializado desde `google/gemma-3-4b-pt` (versión preentrenada, no instruida). El entrenamiento consiste en destilación on-policy: el estudiante genera rollouts y recibe una recompensa a nivel de token calculada como la diferencia entre su log-probabilidad y la del profesor `google/gemma-3-4b-it` para cada token. Se ejecutan 200 pasos con batch de 16 y 4 rollouts por prompt, con una longitud máxima de respuesta de 7168 tokens, usando el framework `verl`. El checkpoint publicado se obtiene fusionando el estado FSDP `global_step_200` en un único fichero safetensors en bf16.

La innovación del estudio no está en la arquitectura sino en el análisis del comportamiento de parada. En el modo `baseline` (sin corrección), los rollouts solo se detienen con los identificadores EOS nativos del estudiante (1 y 106), y cuando se muestrea un EOS se puntúa con la log-probabilidad del profesor para ese mismo token. El autor documenta que este esquema provoca inflación de longitud: el estudiante deja de emitir su EOS y las generaciones se alargan hasta agotar el presupuesto. El repositorio incluye los 10 checkpoints evaluados (pasos 20 a 200) bajo `checkpoints/step_XXXX`, cada uno con su tokenizer.

## Capacidades

- Generación de texto autoregresiva con un transformer decoder-only de 4B parámetros.
- Razonamiento matemático y resolución de problemas tipo competición (AIME24, AIME25, AMC23), aunque con precisión muy baja en este checkpoint.
- Destilación de comportamiento del modelo instruido `gemma-3-4b-it` mediante recompensa a nivel de token.
- Punto de control reproducible para estudiar el alineamiento de EOS y la inflación de longitud en OPD.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre destilación on-policy: sirve como referencia de control para comparar contra la variante con corrección semántica de EOS (`kzhao5/opd-rethink-gemma3-4b-semantic-class-step200`) y aislar el efecto del tratamiento del EOS.
- Estudio de inflación de longitud en generación: permite reproducir el fenómeno por el que el estudiante deja de emitir EOS y las respuestas agotan el presupuesto (truncation rate de 1.00 en todas las tareas evaluadas).
- Análisis de curvas de entrenamiento: los 10 checkpoints (pasos 20 a 200) permiten trazar la evolución de la precisión y de la longitud media de respuesta a lo largo del entrenamiento.
- Reproducción de experimentos con `verl`: el repositorio documenta la configuración exacta (batch 16 × 4 rollouts, max response 7168, recompensa token-level) para replicar el pipeline.
- Evaluación comparativa de métodos de alineamiento de EOS: útil para medir el impacto de corregir el EOS frente a no hacerlo en métricas como AIME y AMC.
- Docencia y formación en destilación: ejemplo práctico de OPD con profesor y estudiante de la misma familia y distinto nivel de instrucción.

## Benchmarks y rendimiento

Resultados del paso 200 (16 rollouts por pregunta, prompt no-thinking, max_tokens 8192, temperatura 0.7, top_p 0.95):

| Tarea | Precisión media | Tasa de truncamiento | Longitud media |
|---|---|---|---|
| AIME24 | 0.008 | 1.000 | 8192 |
| AIME25 | 0.000 | 1.000 | 8192 |
| AMC23 | 0.134 | 1.000 | 8192 |

Evolución por checkpoint (precisión / truncamiento):

| Paso | AIME24 | AIME25 | AMC23 | Long. media (AMC23) |
|---|---|---|---|---|
| 20 | 0.000 / 1.00 | 0.000 / 1.00 | 0.009 / 1.00 | 8181 |
| 40 | 0.002 / 1.00 | 0.000 / 1.00 | 0.011 / 1.00 | 8192 |
| 60 | 0.006 / 1.00 | 0.000 / 1.00 | 0.044 / 0.99 | 8137 |
| 80 | 0.008 / 1.00 | 0.000 / 1.00 | 0.084 / 1.00 | 8192 |
| 100 | 0.006 / 1.00 | 0.004 / 1.00 | 0.086 / 1.00 | 8192 |
| 120 | 0.019 / 1.00 | 0.000 / 1.00 | 0.120 / 1.00 | 8192 |
| 140 | 0.021 / 1.00 | 0.000 / 1.00 | 0.119 / 1.00 | 8192 |
| 160 | 0.015 / 1.00 | 0.000 / 1.00 | 0.123 / 1.00 | 8192 |
| 180 | 0.004 / 1.00 | 0.000 / 1.00 | 0.127 / 1.00 | 8192 |
| 200 | 0.008 / 1.00 | 0.000 / 1.00 | 0.134 / 1.00 | 8192 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 10 GB solo para pesos (4.971.331.952 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB según longitud de contexto y batch.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluación a gran escala con max_tokens 8192 y múltiples rollouts; RTX 4090 (24 GB) suficiente para inferencia en bf16 con batch pequeño.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y en GPUs con 16 GB o más en bf16; en 12 GB requeriría cuantización, no documentada en el repositorio.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16")`; el formato safetensors es compatible con vLLM y TGI, aunque no se documenta configuración específica para ellos. No se publican pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. La evaluación usa 16 rollouts por pregunta con max_tokens 8192, lo que implica generaciones largas y coste elevado por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPD_Rethink Gemma-3-4B baseline step 200 | 4.971.331.952 | no disponible | Destilación on-policy (estudio EOS) | other (hereda Gemma) | Hugging Face, 0 descargas |
| `kzhao5/opd-rethink-gemma3-4b-semantic-class-step200` | no disponible | no disponible | OPD con corrección semántica de EOS | other | Hugging Face (repo público) |
| `google/gemma-3-4b-pt` | no disponible en la información | no disponible | Preentrenado base | Gemma | Hugging Face |
| `google/gemma-3-4b-it` | no disponible en la información | no disponible | Instruido (profesor del experimento) | Gemma | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Inflación de longitud severa: el estudiante deja de emitir su EOS y las respuestas agotan el presupuesto de generación; la tasa de truncamiento es 1.00 en todas las tareas evaluadas.
- Precisión muy baja en razonamiento matemático: 0.008 en AIME24, 0.000 en AIME25 y 0.134 en AMC23 en el paso 200.
- Generaciones largas y repetitivas, tal como advierte el autor; no apto para producción sin corrección del EOS.
- Es un checkpoint de investigación (paso 200 de 200), no un modelo final afinado para uso general.
- Licencia `other`: hereda la licencia del modelo base Gemma, con posibles restricciones de uso comercial que deben revisarse en los términos de Google.
- Idiomas soportados no documentados; no se garantiza comportamiento multilingüe.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Gemma 3, puede heredar los sesgos del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; el truncamiento sistemático agrava la fiabilidad de las respuestas.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kzhao5/opd-rethink-gemma3-4b-baseline-step200
- Variante con corrección semántica de EOS: https://huggingface.co/kzhao5/opd-rethink-gemma3-4b-semantic-class-step200
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Profesor: https://huggingface.co/google/gemma-3-4b-it
- Resultados de evaluación (dataset): `kzhao5/opd-rethink-eval-results` (prefijo `opd-rethink-20260905T180000Z`)
- Registro de entrenamiento en wandb: https://wandb.ai/shawn2002/OPD_Rethink/runs/eolcuas7
