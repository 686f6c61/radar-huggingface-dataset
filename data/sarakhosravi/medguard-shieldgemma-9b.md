# sarakhosravi/MedGuard-ShieldGemma-9B

## Resumen

MedGuard-ShieldGemma-9B es una colección de adaptadores LoRA construidos sobre el modelo base `google/shieldgemma-9b` de Google, desarrollados por el autor `sarakhosravi`. El modelo resuelve un problema muy concreto: dado un perfil de paciente estructurado y una prescripción propuesta, emitir un veredicto de seguridad (seguro o inseguro) junto con las categorías de riesgo que lo justifican. Está entrenado sobre el conjunto de datos MedGuardBench, también publicado por el mismo autor.

La relevancia del modelo radica en su enfoque condicionado al paciente: no se limita a evaluar interacciones farmacológicas aisladas, sino que contrasta la prescripción contra los campos del historial clínico del paciente. Se distribuyen tres variantes de entrenamiento (SFT, Patient Profile Unrolling y Guided GRPO) en subcarpetas independientes, cada una con sus propias métricas reportadas en el paper asociado.

El modelo hereda la arquitectura y el tamaño del base ShieldGemma-9B (9.000 millones de parámetros), aunque la información proporcionada no detalla la longitud de contexto ni la composición exacta del entrenamiento. La licencia es "other", heredada del modelo base, y el uso previsto es exclusivamente de investigación en guardarraíles de seguridad de medicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `google/shieldgemma-9b`); adaptadores LoRA sobre el base |
| Parametros totales | 9.000 millones (modelo base); adaptadores LoRA de tamaño reducido (repo de 0,7 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors como adaptadores PEFT) |
| Idiomas soportados | No disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste mediante LoRA sobre `google/shieldgemma-9b`, un transformer decoder-only de la familia Gemma. No se introduce ninguna modificación arquitectónica más allá de los adaptadores de bajo rango. El entrenamiento se realizó sobre MedGuardBench, un conjunto de datos orientado a la evaluación de seguridad de prescripciones condicionada por el perfil del paciente, con un split de test de 729 filas disjunto por fármaco.

Se publican tres brazos de entrenamiento. El primero, SFT, aplica un ajuste supervisado alineado con el esquema de salida. El segundo, Patient Profile Unrolling (CU), parte del checkpoint SFT y entrena un epoch adicional en el que el modelo primero verifica cada campo del historial clínico contra las reglas de seguridad del fármaco y después emite el veredicto, generando una traza de verificación. El tercero, Guided GRPO, parte del modelo SFT fusionado y aplica GRPO con una recompensa de seguridad verificable y rollouts guiados por profesor. La decodificación recomendada es greedy (temperatura 0) y, para el brazo CU, se deben permitir al menos 2.048 tokens nuevos para acomodar la traza de verificación.

## Capacidades

- Emisión de veredictos de seguridad (seguro/inseguro) sobre prescripciones propuestas condicionadas por un perfil de paciente estructurado.
- Clasificación en 17 categorías de riesgo que justifican el veredicto.
- Generación de trazas de verificación campo a campo del historial clínico (brazo CU).
- Razonamiento multi-paso guiado por reglas de seguridad del fármaco.
- Salida estructurada alineada con un esquema predefinido (brazo SFT).
- No se documentan capacidades de tool calling, agentes generales, visión, audio ni multilingüismo.

## Casos de uso

- Investigación en guardarraíles clínicos: evaluar la eficacia de distintas estrategias de entrenamiento (SFT, unrolling, GRPO) sobre un mismo modelo base para tareas de seguridad de medicación.
- Auditoría de prescripciones en entornos simulados: dado un perfil sintético y una prescripción, obtener un veredicto y las categorías de riesgo activadas para análisis retrospectivo.
- Generación de datos de evaluación: usar el brazo CU para producir trazas de verificación que sirvan como referencia en la construcción de nuevos conjuntos de test.
- Estudio de alineación con recompensas verificables: el brazo Guided GRPO permite analizar el compromiso entre recall de casos inseguros y tasa de falsos positivos.
- Comparación de metodologías de ajuste: los tres checkpoints permiten reproducir y contrastar los resultados del paper sobre el split de test disjunto por fármaco.
- Docencia e investigación académica en farmacovigilancia computacional: el modelo y el dataset asociado permiten experimentar con clasificación de riesgo farmacológico sin depender de datos clínicos reales.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de test de MedGuardBench (729 filas, disjunto por fármaco). Métricas en porcentaje.

| Brazo | Acc | Rec (unsafe) | FPR | Micro-F1 (17 cat.) | Macro-F1 (17 cat.) | Exact match |
|---|---:|---:|---:|---:|---:|---:|
| SFT | 91,2 | 96,8 | 14,9 | 74,9 | 68,9 | 67,1 |
| CU (Patient Profile Unrolling) | 91,8 | 96,0 | 12,9 | 74,8 | 67,7 | 66,5 |
| Guided GRPO | 86,1 | 98,9 | 27,7 | 73,0 | 67,1 | 61,9 |

## Requisitos de hardware

- El modelo base `google/shieldgemma-9b` requiere aproximadamente 18 GB en FP16 solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 24 GB de VRAM para inferencia en FP16.
- Cuantización a 8 bits reduce el requisito a unos 10-12 GB; a 4 bits, a unos 6-8 GB, aunque la información proporcionada no confirma cuantizaciones oficiales del adaptador.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX 6000 Ada. En consumer, una RTX 4090 (24 GB) puede alojar el modelo en FP16 con margen ajustado; GPUs de 16 GB requieren cuantización.
- Opciones de despliegue: `transformers` con `peft` (flujo documentado en la model card); vLLM, TGI o llama.cpp no están documentados para estos adaptadores en la información disponible.
- Latencia y throughput: no disponibles. El brazo CU requiere al menos 2.048 tokens nuevos por inferencia, lo que incrementa notablemente el coste frente al brazo SFT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGuard-ShieldGemma-9B | 9B (LoRA sobre ShieldGemma-9B) | No disponible | Guardarraíl de seguridad de medicación condicionado por paciente | other | Hugging Face |
| google/shieldgemma-9b (base) | 9B | No disponible en esta ficha | Guardarraíl de contenido general | Gemma terms | Hugging Face |
| Modelos de farmacovigilancia especializados | No disponible | No disponible | Clasificación de interacciones farmacológicas | No disponible | No disponible |

No se dispone en la información proporcionada de comparativas cuantitativas con otros modelos de guardarraíles médicos sobre el mismo benchmark.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación; el autor declara explícitamente que no son dispositivos médicos y no deben usarse para decisiones clínicas.
- Licencia "other" heredada de ShieldGemma-9B: es necesario revisar los términos de Gemma para uso comercial antes de cualquier despliegue.
- El brazo Guided GRPO presenta una tasa de falsos positivos del 27,7 %, considerablemente superior a SFT (14,9 %) y CU (12,9 %), lo que implica rechazar prescripciones seguras con frecuencia.
- El exact match en las 17 categorías de riesgo es moderado (61,9-67,1 %), lo que limita la fiabilidad de la justificación categórica.
- El split de test es de solo 729 filas y disjunto por fármaco, pero no se documenta su representatividad clínica real.
- No se documentan sesgos demográficos, idiomas soportados ni comportamiento fuera del dominio de medicación.
- El brazo CU genera trazas largas (mínimo 2.048 tokens), lo que incrementa latencia y coste y puede introducir errores en la propia traza de verificación.
- Riesgo de alucinación en la justificación de categorías de riesgo no cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-ShieldGemma-9B
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base: https://huggingface.co/google/shieldgemma-9b
