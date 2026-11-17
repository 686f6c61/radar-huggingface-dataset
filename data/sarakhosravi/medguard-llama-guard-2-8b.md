# sarakhosravi/MedGuard-Llama-Guard-2-8B

## Resumen

MedGuard-Llama-Guard-2-8B es un conjunto de adaptadores LoRA sobre el modelo base Meta-Llama-Guard-2-8B de Meta, desarrollado por el usuario sarakhosravi. Su funcion es actuar como guardrail de seguridad en el ambito de la prescripcion de medicamentos: recibe un perfil estructurado del paciente y una prescripcion propuesta, y devuelve un veredicto de seguro/no seguro acompanado de las categorias de riesgo (hasta 17) que justifican la decision. El modelo esta entrenado sobre el dataset MedGuardBench, tambien publicado por el autor.

La relevancia del modelo radica en su enfoque *patient-conditioned*: no evalua la seguridad de un farmaco de forma aislada, sino en funcion de las condiciones concretas del paciente (alergias, patologias, medicacion concomitante, funcion renal, etc.). El repositorio incluye dos brazos de entrenamiento documentados en el paper asociado: SFT (supervised fine-tuning alineado al esquema) y CU (Patient Profile Unrolling), este ultimo con una mejora sustancial en tasa de falsos positivos (17,4 % frente a 8,9 %).

El modelo se distribuye exclusivamente como adaptadores PEFT (0,4 GB) que requieren el modelo base Meta-Llama-Guard-2-8B, de 8 mil millones de parametros. La licencia es "other", heredada de las restricciones del modelo base de Meta, y el uso previsto declarado es exclusivamente la investigacion en guardrails de seguridad de medicacion, no la toma de decisiones clinicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama Guard 2) con adaptadores LoRA (PEFT) |
| Parametros totales | 8 000 millones (modelo base); adaptadores LoRA de tamano no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Meta-Llama-Guard-2-8B; el autor recomienda permitir al menos 2048 tokens nuevos en decodificacion para el brazo CU) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene adaptadores safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base Meta-Llama-Guard-2-8B) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-Guard-2-8B, un transformer decoder-only de 8 000 millones de parametros especializado en clasificacion de seguridad, y se afina mediante LoRA. El repositorio contiene dos subcarpetas con adaptadores independientes: `sft/` (supervised fine-tuning alineado al esquema de salida) y `cu/` (Patient Profile Unrolling), donde el modelo primero verifica cada campo del historial del paciente contra las reglas de seguridad del farmaco y despues emite el veredicto. El brazo CU se entrena un epoch adicional a partir del checkpoint SFT.

El entrenamiento se realizo sobre MedGuardBench, un dataset con un split de test *drug-disjoint* de 729 filas, lo que implica que los farmacos del test no aparecen en entrenamiento. La model card menciona tambien un tercer brazo, Guided GRPO, que combina GRPO con una recompensa de seguridad verificable y rollouts guiados por profesor partiendo del modelo SFT fusionado, aunque no se incluye como subcarpeta de adaptadores en el repositorio ni se reportan sus metricas en la tabla de checkpoints. La decodificacion recomendada es greedy (temperatura 0).

## Capacidades

- Clasificacion binaria de seguridad (seguro/no seguro) de una prescripcion condicionada al perfil del paciente.
- Etiquetado multi-etiqueta de hasta 17 categorias de riesgo que justifican el veredicto.
- Razonamiento multi-paso con traza de verificacion explicita (brazo CU): comprobacion campo a campo del historial del paciente contra las reglas de seguridad del farmaco antes de emitir el veredicto.
- Procesamiento de entradas estructuradas (perfil de paciente y prescripcion propuesta).
- Generacion de texto en formato de chat/plantilla del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Validacion previa a la prescripcion en sistemas de historia clinica electronica: el modelo recibe el perfil estructurado del paciente y la prescripcion propuesta y devuelve un veredicto con las categorias de riesgo activadas, que el sistema puede mostrar al facultativo como alerta de apoyo.
- Filtrado de ordenes de medicacion en pipelines de farmacia hospitalaria: integrado como paso de guardrail, marca prescripciones potencialmente inseguras antes de la dispensacion, con la traza de verificacion del brazo CU como justificacion auditable.
- Investigacion en guardrails medicos: el par de adaptadores SFT/CU permite estudiar el efecto del razonamiento explicito previo al veredicto sobre la tasa de falsos positivos (17,4 % frente a 8,9 % en MedGuardBench).
- Generacion de datasets de evaluacion de seguridad farmacologica: el modelo puede anotar pares paciente-prescripcion con etiquetas de riesgo para construir corpus de entrenamiento o test en dominios drug-disjoint.
- Auditoria retrospectiva de prescripciones: procesamiento por lotes de registros historicos para detectar patrones de riesgo no identificados, usando la ventana de contexto del modelo base.
- Sistemas de alerta en ensayos clinicos simulados: evaluacion automatizada de escenarios sinteticos de polimedicacion para validar reglas de seguridad antes de desplegarlas en entornos reales.
- Docencia y formacion medica: generacion de casos con veredicto y justificacion categorizada para entrenar a residentes en la deteccion de interacciones y contraindicaciones.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de test drug-disjoint de MedGuardBench (729 filas), en porcentaje:

| Brazo | Acc | Rec (unsafe) | FPR | Micro-F1 (17 cat.) | Macro-F1 (17 cat.) | Exact match |
|---|---:|---:|---:|---:|---:|---:|
| SFT | 89,7 | 96,3 | 17,4 | 73,9 | 67,4 | 65,3 |
| CU (Patient Profile Unrolling) | 93,6 | 95,8 | 8,9 | 74,9 | 68,3 | 68,9 |

No se han publicado en la informacion disponible resultados del brazo Guided GRPO ni comparaciones con modelos de referencia externos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8 000 millones de parametros requiere aproximadamente 16 GB en fp16/bf16; los adaptadores LoRA anaden una huella marginal (el repositorio completo ocupa 0,4 GB).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con `device_map="auto"`.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en fp16 y en tarjetas de 12-16 GB si se cuantiza el modelo base (la cuantizacion de los adaptadores no esta documentada).
- Opciones de despliegue: transformers + peft (flujo documentado por el autor); vLLM, TGI, llama.cpp u Ollama no estan documentados para este repositorio y requeririan fusionar los adaptadores con el modelo base.
- Latencia y throughput: no disponibles. El brazo CU genera una traza de verificacion antes del veredicto y el autor recomienda reservar al menos 2048 tokens nuevos, lo que incrementa la latencia frente al brazo SFT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGuard-Llama-Guard-2-8B (SFT/CU) | 8 000 M (base) + LoRA | no disponible | Guardrail de medicacion condicionado al paciente | other | Adaptadores PEFT en HF |
| Meta-Llama-Guard-2-8B (base) | 8 000 M | no disponible | Clasificacion de seguridad general | Llama 2 Community License | Pesos completos en HF |
| Llama Guard 3 (8B) | 8 000 M | no disponible | Clasificacion de seguridad general, multilingue | Llama 3 Community License | Pesos completos en HF |

La comparacion con Llama Guard 3 se ofrece como referencia de categoria (guardrails de seguridad sobre Llama); no se dispone de resultados de benchmarks cruzados en la informacion proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigacion: el autor declara explicitamente que no es un dispositivo medico y que no debe usarse para decisiones clinicas.
- Licencia "other" heredada de Meta-Llama-Guard-2-8B: las condiciones de uso comercial dependen de la licencia del modelo base y no estan detalladas en la model card.
- Tasa de falsos positivos no despreciable incluso en el mejor brazo (8,9 % en CU, 17,4 % en SFT): prescripciones seguras pueden marcarse como inseguras.
- El brazo CU requiere al menos 2048 tokens nuevos de decodificacion, lo que aumenta coste y latencia y puede truncar la traza en contextos largos.
- Evaluacion limitada a un unico split de test (729 filas, drug-disjoint); no se reportan resultados en otros dominios ni en datos multilingues.
- Idiomas soportados no documentados; el rendimiento fuera del ingles es desconocido.
- Riesgo de alucinacion en las categorias de riesgo y en la traza de verificacion: el modelo puede generar justificaciones plausibles pero incorrectas.
- Sesgos: no documentados por el autor; al heredar el modelo base, puede arrastrar sesgos de Llama Guard 2.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-Llama-Guard-2-8B
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-Guard-2-8B
