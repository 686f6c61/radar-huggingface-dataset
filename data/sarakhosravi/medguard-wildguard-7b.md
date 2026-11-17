# sarakhosravi/MedGuard-WildGuard-7B

## Resumen

MedGuard-WildGuard-7B es un conjunto de adaptadores LoRA sobre el modelo base allenai/wildguard, desarrollado por el usuario sarakhosravi, orientado a la verificación de seguridad de prescripciones médicas condicionada por el perfil del paciente. Dado un perfil estructurado del paciente y una prescripción propuesta, el modelo emite un veredicto (seguro o no seguro) junto con las categorías de riesgo que lo justifican, sobre un total de 17 categorías definidas en el benchmark MedGuardBench.

El modelo no es un modelo fundacional nuevo, sino un ajuste fino del guardián WildGuard de 7B parámetros mediante PEFT (LoRA). Se publican tres brazos de entrenamiento independientes en subcarpetas separadas: SFT (supervised fine-tuning alineado al esquema), CU (Patient Profile Unrolling) y GRPO (Guided GRPO con recompensa verificable de seguridad y rollouts guiados por profesor). Cada brazo se selecciona por su equilibrio entre precisión, recall y tasa de falsos positivos.

Su relevancia radica en el enfoque de seguridad de medicación condicionada por el paciente: no se limita a clasificar texto tóxico genérico, sino que cruza los campos del historial clínico con las reglas de seguridad del fármaco antes de emitir el veredicto. El repositorio tiene un tamaño de 0,5 GB y está pensado exclusivamente para investigación en guardrails de seguridad de medicación, no para decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base allenai/wildguard, 7B) con adaptadores LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; los adaptadores LoRA son una fracción del total (tamano de repo 0,5 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se construye sobre allenai/wildguard, un transformer decoder-only de 7B parámetros, mediante adaptadores LoRA entrenados con la librería PEFT. Se publican tres brazos de entrenamiento, cada uno en su propia subcarpeta:

- **SFT:** ajuste fino supervisado alineado al esquema de salida (veredicto más categorías de riesgo). Entrenado directamente sobre allenai/wildguard.
- **CU (Patient Profile Unrolling):** una época adicional partiendo del checkpoint SFT, en la que el modelo primero contrasta cada campo del historial del paciente contra las reglas de seguridad del fármaco y después emite el veredicto. Entrenado sobre allenai/wildguard.
- **Guided GRPO:** GRPO con una recompensa verificable de seguridad y rollouts guiados por profesor, partiendo del modelo SFT fusionado (merged allenai/wildguard + sft/).

El conjunto de datos de entrenamiento es sarakhosravi/MedGuardBench. La evaluación se realiza sobre un split de test de 729 filas con separación por fármaco (drug-disjoint). No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases adicionales de RLHF o DPO más allá del GRPO descrito.

## Capacidades

- Clasificación de seguridad de prescripciones: emite un veredicto binario (seguro/no seguro) para una prescripción propuesta dado un perfil de paciente estructurado.
- Justificación por categorías de riesgo: identifica hasta 17 categorías de riesgo que sustentan el veredicto.
- Razonamiento condicionado por el paciente: el brazo CU genera una traza de verificación campo a campo del historial clínico frente a las reglas del fármaco antes de concluir.
- Salida estructurada alineada a un esquema predefinido (veredicto más categorías).
- Decodificación greedy recomendada (temperatura 0) para reproducibilidad.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- **Verificación previa a la prescripción en sistemas de soporte a la decisión:** integrar el adaptador en un pipeline que, antes de confirmar una receta, cruce el perfil del paciente con las reglas de seguridad del fármaco y devuelva un veredicto con las categorías de riesgo activadas.
- **Filtrado de alertas en farmacia hospitalaria:** usar el brazo CU, con su traza de verificación, para auditar por qué una prescripción se marca como no segura y reducir la revisión manual de casos dudosos.
- **Generación de conjuntos de datos de seguridad de medicación:** emplear el modelo como etiquetador automático sobre historiales y prescripciones para construir corpus de entrenamiento o evaluación de guardrails clínicos.
- **Investigación en alineación con recompensas verificables:** el brazo Guided GRPO sirve como referencia reproducible para estudiar GRPO con recompensas de seguridad y rollouts guiados por profesor en dominios médicos.
- **Evaluación comparativa de guardrails médicos:** utilizar los tres brazos (SFT, CU, GRPO) como línea base en experimentos sobre MedGuardBench u otros benchmarks de seguridad de prescripción.
- **Detección de interacciones y contraindicaciones en texto libre estructurado:** procesar perfiles de paciente y prescripciones en formato estructurado para señalar riesgos antes de la validación por un profesional.

## Benchmarks y rendimiento

Resultados sobre el split de test de 729 filas de MedGuardBench (drug-disjoint). Métricas en porcentaje: **Acc** es exactitud del veredicto, **Rec** es recall de casos no seguros, **FPR** es tasa de falsos positivos sobre prescripciones seguras, y **Mic / Mac / EM** son micro-F1, macro-F1 y exact match sobre las 17 categorías.

| Brazo | Acc | Rec | FPR | Mic | Mac | EM |
|---|---:|---:|---:|---:|---:|---:|
| `sft/` (SFT) | 91.5 | 87.1 | 3.7 | 74.9 | 71.6 | 68.9 |
| `cu/` (Patient Profile Unrolling) | 90.8 | 95.8 | 14.6 | 72.5 | 65.9 | 65.3 |
| `grpo/` (Guided GRPO) | 94.0 | 92.9 | 4.9 | 75.3 | 68.5 | 71.9 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 7B en precisión completa requiere del orden de 14-16 GB, y en cuantización de 4 bits puede reducirse a unos 4-6 GB, aunque estos valores no están confirmados en la información proporcionada.
- Los adaptadores LoRA son ligeros (repo de 0,5 GB), pero requieren cargar el modelo base allenai/wildguard completo.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de 7B en cuantización de 4 bits es en principio viable en GPUs de consumo con suficiente VRAM, pero no se documenta.
- Opciones de despliegue: carga mediante transformers y peft (PeftModel). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El brazo CU requiere permitir al menos 2.048 tokens nuevos por generación debido a la traza de verificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGuard-WildGuard-7B (este) | 7B + LoRA | no disponible | Guardrail de seguridad de medicación condicionado por paciente | other | Hugging Face |
| allenai/wildguard | 7B | no disponible | Guardrail genérico de seguridad de contenido | no disponible | Hugging Face |
| Alternativas de guardrail médico especializado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Uso exclusivamente investigador:** el modelo no es un dispositivo médico y no debe emplearse para decisiones clínicas, tal como indica el autor.
- **Licencia "other":** no se detallan los términos exactos; es necesario revisar las condiciones antes de cualquier uso comercial.
- **Sesgos:** no documentados en la información disponible; al entrenarse sobre un dataset específico, puede heredar sesgos de la distribución de MedGuardBench.
- **Riesgo de alucinación:** no evaluado explícitamente; la salida estructurada y la decodificación greedy reducen la variabilidad, pero no eliminan el riesgo de veredictos incorrectos.
- **Idiomas:** no se especifican los idiomas soportados; el benchmark y la model card están en inglés, por lo que el rendimiento en castellano no está garantizado.
- **Contexto:** longitud de contexto no disponible; el brazo CU necesita al menos 2.048 tokens nuevos de generación, lo que condiciona el despliegue.
- **Dependencia del modelo base:** los adaptadores SFT y CU requieren allenai/wildguard; el brazo GRPO exige fusionar primero el adaptador SFT, lo que añade complejidad operativa.
- **Madurez:** repositorio con 0 descargas y 0 likes, creado y actualizado en la misma fecha; no hay validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-WildGuard-7B
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base allenai/wildguard: https://huggingface.co/allenai/wildguard
