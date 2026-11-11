# Shokou1/fanzha-qwen3.5-4b-grpo-v2

## Resumen

`Shokou1/fanzha-qwen3.5-4b-grpo-v2` es un adaptador LoRA de tipo PEFT sobre el modelo base `Qwen/Qwen3.5-4B`, entrenado con GRPO (Group Relative Policy Optimization) para tareas de conversación de concienciación contra el fraude en chino (反诈, "fanzha"). Lo publica el usuario Shokou1 como artefacto experimental de investigación: el repositorio contiene únicamente el adaptador (0,5 GB), no los pesos completos del modelo base, y la model card lo describe explícitamente como producto experimental que no representa a ningún organismo oficial.

El interés técnico del modelo reside en su metodología más que en su rendimiento: documenta un ciclo completo de GRPO con recompensas basadas en reglas y palabras clave sobre un modelo de 4B parámetros, con trazabilidad de checkpoints y métricas de validación. Los resultados publicados muestran que el entrenamiento no superó la línea base SFT: el checkpoint 40 (el publicado) obtiene una recompensa media de 0,6438 frente a 0,7306 del baseline, y una tasa de validez automática del 93,75 % frente al 100 % inicial.

Por tanto, se trata de un caso de estudio sobre los límites de las recompensas heurísticas en RLHF/GRPO con muestras pequeñas (40 pasos, 160 rollouts), no de un modelo listo para producción. Su relevancia actual es metodológica: ilustra cómo una función de recompensa léxica puede degradar la calidad de las respuestas y cómo el autor decide publicar los pesos igualmente para preservar el registro experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5 (clase `Qwen3_5ForCausalLM`) |
| Parametros totales | No disponible (el adaptador ocupa 0,5 GB; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base Qwen3.5-4B); entrenamiento con secuencias de hasta 1024 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Transformers/PEFT) |
| Idiomas soportados | Chino (`zh`) |
| Licencia | Apache-2.0 (pesos del adaptador); el modelo base mantiene su propia licencia Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se inicializa sobre un SFT interno del proyecto (`fanzha_sft_v2`, que combina continued pre-training y supervised fine-tuning) y se entrena con GRPO durante 40 pasos de optimizador. Cada paso usa un único prompt de entrenamiento con 4 completions muestreadas, totalizando 160 rollouts. La configuración incluye límite de secuencia de 1024 tokens, generación máxima de 256 tokens, learning rate de 1e-6, clipping de 0,2 y coeficiente KL de 0,05. La referencia SFT está congelada y con hash invariante, y se emplea ratio/clipping por token, KL de tipo k3 y objetivo promediado por longitud de completion. Los prompts de entrenamiento y evaluación se deduplicaron por mensaje exacto.

La innovación metodológica destacable es la trazabilidad: el autor reporta métricas en los checkpoints 0, 10, 20, 30 y 40, y documenta que la regla de selección mantuvo siempre el checkpoint 0 (baseline SFT) como mejor modelo. El adaptador publicado corresponde al paso 40 y no fue seleccionado por recompensa. La función de recompensa es un proxy léxico basado en reglas y palabras clave, con sesgos reconocidos por el propio autor (puede premiar acumulación de términos y pasar por alto consejos incorrectos). No se documenta uso de DPO ni de RLHF humano en esta fase.

## Capacidades

- Generación de texto conversacional en chino orientada a diálogos de prevención del fraude.
- Respuestas multi-turno dentro de la plantilla de chat del modelo base (`apply_chat_template`), con opción `enable_thinking=False`.
- Cubre temáticas como transferencias a "cuentas seguras", verificación de identidad sospechosa y canales oficiales de denuncia.
- Soporte de parada temprana y generación determinista (`do_sample=False`) en el ejemplo de la model card.
- Capacidad multilingüe limitada al chino según la etiqueta `language: zh`; no se declaran otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito más allá del que herede del base.

## Casos de uso

- Investigación sobre recompensas heurísticas en GRPO: el repositorio permite reproducir el experimento completo (40 pasos, 160 rollouts) y comparar checkpoints para estudiar la degradación de la recompensa léxica frente al baseline SFT.
- Estudio de alineación con datos escasos: sirve como ejemplo de cómo un adaptador LoRA de 0,5 GB puede entrenarse sobre un modelo de 4B con presupuesto reducido y métricas de validación pequeñas (16 preguntas).
- Prototipado de asistentes de concienciación ciudadana en chino: útil para generar borradores de respuestas educativas que después se revisan manualmente antes de cualquier uso público.
- Evaluación de metodologías de selección de checkpoints: el caso demuestra la importancia de reglas de selección por recompensa frente a publicar el último paso, y puede usarse en docencia o formación de equipos de ML.
- Análisis de fallos en generación: los ejemplos documentados de respuestas con material irrelevante (recomendaciones médicas o de identidad sin fundamento) permiten construir taxonomías de errores en dominios sensibles.
- Base para futuros adaptadores de dominio: al ser un adaptador PEFT sobre Qwen3.5-4B, puede combinarse o sustituirse por otros adaptadores del mismo base en pipelines de Transformers/PEFT.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas internas de validación del autor sobre 16 preguntas de generación (2 por categoría) extraídas del split de validación SFT, no un test independiente. La recompensa es un proxy léxico.

| Checkpoint | Recompensa media (reglas) | Tasa de validez automática | CE en validación SFT | Nota |
|---|---:|---:|---:|---|
| 0 (baseline SFT v2) | 0,7306 | 100 % | 1,58730 | Mejor de la ronda |
| 10 | 0,6877 | 100 % | 1,58646 | Por debajo del baseline |
| 20 | 0,6608 | 93,75 % | 1,58713 | Por debajo del baseline |
| 30 | 0,6873 | 93,75 % | 1,58747 | Por debajo del baseline |
| 40 (pesos publicados) | 0,6438 | 93,75 % | 1,58793 | No seleccionado |

En un contraste exploratorio adicional sobre 32 preguntas, la cobertura de palabras clave de acción fue de 10/11 (igual que el baseline) y la de empatía de 5/11 (frente a 4/11 del baseline). El autor advierte que estas variaciones con muestras pequeñas no demuestran mejora de calidad. No hay resultados de MMLU, HumanEval, GSM8K ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada: el adaptador requiere cargar el modelo base Qwen3.5-4B completo; en bfloat16 se necesitan aproximadamente 8 GB de VRAM solo para pesos, más overhead de activaciones y caché KV (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del base, una GPU con 16-24 GB (RTX 4090, A10, L4) es un punto de partida razonable, y A100/H100 para mayor throughput.
- GPU de consumo: probablemente cabe en GPUs consumer de 16 GB o más con cuantización del base, aunque el autor no publica requisitos ni recetas de cuantización del adaptador.
- Despliegue: el ejemplo oficial usa Transformers + PEFT (`PeftModel.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Shokou1/fanzha-qwen3.5-4b-grpo-v2` | 4B (base) + LoRA | No disponible | GRPO sobre SFT para anti-fraude en chino | Apache-2.0 | Adaptador PEFT público |
| `Qwen/Qwen3.5-4B` (base) | 4B | No disponible | Modelo generalista multilingüe | Apache-2.0 | Pesos completos públicos |
| Adaptadores de dominio sobre Qwen (genéricos) | 4B (base) + LoRA | Depende del base | SFT/DPO de dominio | Variable | No disponible comparación directa |

No se dispone de comparaciones publicadas con alternativas específicas de prevención del fraude en chino; la comparación más directa es con el propio modelo base y con el baseline SFT interno del proyecto, cuyos resultados se recogen en la tabla de benchmarks.

## Limitaciones y advertencias

- El adaptador no supera al baseline SFT en la métrica de recompensa (0,6438 frente a 0,7306) y reduce la validez automática del 100 % al 93,75 %.
- La recompensa basada en reglas y palabras clave tiene sesgos léxicos: puede omitir consejos incorrectos y premiar la acumulación de términos sin relación con la calidad.
- El conjunto de validación es de 16 preguntas, no independiente y con solapamiento histórico con experimentos previos; no hay red teaming a gran escala ni evaluación ciega.
- La inspección manual detectó respuestas con texto corrupto, incoherencias semánticas, afirmaciones sin fundamento y recomendaciones irrelevantes (por ejemplo, materiales de identidad o protocolos médicos en una respuesta sobre detención de pérdidas).
- El modelo no sustituye a policía, bancos, abogados ni centros oficiales de anti-fraude; cualquier riesgo de transferencia debe verificarse por canales oficiales.
- Uso comercial: los pesos se declaran Apache-2.0, pero el autor advierte que la licencia de los pesos no sustituye la evaluación independiente de las licencias de los datos de entrenamiento (que no se distribuyen) ni de la legislación local.
- Idioma limitado al chino; no se garantiza calidad en otros idiomas.
- No debe desplegarse ante el público sin revisión humana previa, según la propia model card.

## Enlaces

- Hugging Face: https://huggingface.co/Shokou1/fanzha-qwen3.5-4b-grpo-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio GitHub del proyecto: https://github.com/ShokouP/fanzha-qwen3.5-4b-grpo-v2
- Documento de experimento (`EXPERIMENT.md`): incluido en el repositorio GitHub anterior
