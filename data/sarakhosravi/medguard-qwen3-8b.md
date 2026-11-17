# sarakhosravi/MedGuard-Qwen3-8B

## Resumen

MedGuard-Qwen3-8B es una colección de adaptadores LoRA (PEFT) desarrollados por el usuario sarakhosravi sobre el modelo base Qwen/Qwen3-8B. El modelo está especializado en "patient-conditioned medication guarding": recibe un perfil estructurado de paciente junto con una prescripción propuesta y devuelve un veredicto de seguridad (safe/unsafe) acompañado de las categorías de riesgo (hasta 17) que lo justifican. No es un modelo generalista, sino un componente de guardarraíl diseñado para integrarse en pipelines de verificación de prescripciones.

El repositorio incluye tres "brazos" de entrenamiento independientes, cada uno en su propio subdirectorio: `sft/` (supervised fine-tuning alineado al esquema), `cu/` (Patient Profile Unrolling, un epoch adicional que obliga al modelo a verificar cada campo del historial del paciente contra las reglas de seguridad del fármaco antes de emitir el veredicto) y `grpo/` (GRPO guiado con recompensa verificable de seguridad y rollouts guiados por profesor, aplicado sobre el modelo SFT fusionado). Los tres se entrenaron sobre el dataset MedGuardBench.

La relevancia del modelo radica en su enfoque: en lugar de un LLM médico genérico, propone un adaptador pequeño (repo de 0,5 GB) que se acopla a un modelo base de 8B parámetros y ofrece métricas medibles de recall de inseguridad (97,4 % en los tres brazos) y de tasa de falsos positivos, con el brazo CU destacando en precisión global (94,0 %) y en reducción de FPR (9,7 %). El autor restringe explícitamente su uso a investigación sobre guardarraíles de seguridad de medicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parámetros totales | 8B en el modelo base; adaptadores LoRA de tamaño no especificado (repo de 0,5 GB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B; no se especifica en la model card) |
| Tipos de cuantizacion | El adaptador se aplica sobre `unsloth/qwen3-8b-unsloth-bnb-4bit` (base cuantizada en 4 bits); no se detallan otras opciones |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado desde cero, sino un conjunto de adaptadores LoRA acoplados a Qwen3-8B. Se distinguen tres brazos de entrenamiento sobre el dataset MedGuardBench (729 filas en el split de test, con separación por fármaco —drug-disjoint—):

- **SFT**: fine-tuning supervisado alineado al esquema de salida (veredicto + categorías de riesgo).
- **CU (Patient Profile Unrolling)**: un epoch adicional partiendo del checkpoint SFT, en el que el modelo primero contrasta cada campo del historial del paciente contra las reglas de seguridad del fármaco y después emite el veredicto. Este brazo genera una traza de verificación antes del veredicto, por lo que requiere al menos 2.048 tokens nuevos en decodificación.
- **Guided GRPO**: GRPO con recompensa verificable de seguridad y rollouts guiados por profesor, partiendo del modelo SFT fusionado (`merge_and_unload()`).

La tarea es de clasificación estructurada con justificación: salida de un veredicto binario y hasta 17 categorías de riesgo. El autor recomienda decodificación greedy (temperatura 0). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni hiperparámetros de RLHF/DPO más allá de lo descrito.

## Capacidades

- Verificación de seguridad de prescripciones condicionada al perfil del paciente: recibe un perfil estructurado y una prescripción propuesta y emite un veredicto safe/unsafe.
- Clasificación multi-etiqueta en 17 categorías de riesgo que justifican el veredicto.
- Traza de verificación explícita campo a campo en el brazo CU (Patient Profile Unrolling) antes del veredicto final.
- Salida estructurada alineada a un esquema predefinido (veredicto + categorías).
- Razonamiento guiado por reglas de seguridad del fármaco (en el brazo CU).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Guardarraíl en sistemas de prescripción electrónica: el modelo se integra como paso de verificación previo a la confirmación de una prescripción, devolviendo un veredicto y las categorías de riesgo para que el sistema bloquee o alerte. Es adecuado por su recall de inseguridad del 97,4 % en el split de test.
- Investigación en seguridad de medicación: evaluación comparativa de estrategias de entrenamiento (SFT vs. CU vs. GRPO guiado) sobre el benchmark MedGuardBench, con métricas reproducibles de precisión, recall, FPR y F1 por categoría.
- Auditoría de decisiones de prescripción: el brazo CU genera una traza de verificación campo a campo que puede registrarse para trazabilidad y revisión posterior por parte de farmacéuticos o auditores.
- Detección de interacciones y contraindicaciones en pipelines de farmacia hospitalaria: el modelo contrasta el perfil del paciente contra las reglas del fármaco y señala las categorías de riesgo activadas.
- Filtrado previo en sistemas de triaje clínico: como capa de bajo coste (adaptador de 0,5 GB sobre base 8B) que descarta prescripciones claramente inseguras antes de la revisión humana.
- Generación de datos sintéticos de evaluación: uso del modelo como etiquetador de referencia para construir conjuntos de prueba de guardarraíles de medicación, siempre en contexto de investigación.
- Prototipado de asistentes clínicos con salvaguardas: integración del adaptador en un asistente que, antes de sugerir un fármaco, ejecuta la verificación de seguridad condicionada al paciente.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de test de MedGuardBench (729 filas, separación por fármaco). Métricas en porcentaje.

| Brazo | Acc | Rec (unsafe) | FPR | Micro-F1 | Macro-F1 | EM |
|---|---:|---:|---:|---:|---:|---:|
| SFT | 90,9 | 97,4 | 16,0 | 74,6 | 67,6 | 65,8 |
| CU (Patient Profile Unrolling) | 94,0 | 97,4 | 9,7 | 76,6 | 69,8 | 70,0 |
| Guided GRPO | 91,1 | 97,4 | 15,7 | 76,6 | 68,4 | 69,5 |

No se han publicado en la información disponible comparaciones con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada: el adaptador se aplica sobre `unsloth/qwen3-8b-unsloth-bnb-4bit`, es decir, un Qwen3-8B cuantizado en 4 bits. Una estimación razonable para inferencia en 4 bits es de aproximadamente 6-8 GB de VRAM para los pesos, más overhead de contexto y activaciones; el autor no publica cifras exactas.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base (8B en 4 bits), cabe en GPUs de consumo como RTX 3090/4090 (24 GB) y en GPUs profesionales (A100, H100) con margen amplio.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 y en GPUs con 12-16 GB o más, aunque no se confirma en la model card.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT, requeriría fusión o soporte de adaptadores en el servidor de inferencia.
- Latencia y throughput: no disponibles. Nota: el brazo CU requiere al menos 2.048 tokens nuevos de decodificación por consulta, lo que incrementa la latencia frente a SFT y GRPO.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con otras alternativas de guardarraíles médicos ni con el modelo base sin adaptar.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MedGuard-Qwen3-8B (SFT/CU/GRPO) | 8B base + LoRA | no disponible | other | Hugging Face |
| Qwen/Qwen3-8B (base) | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Alternativas de guardarraíl médico | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigación sobre guardarraíles de seguridad de medicación. El autor declara explícitamente que no son dispositivos médicos y que no deben usarse para decisiones clínicas.
- Licencia "other": no se detallan los términos exactos, por lo que el uso comercial requiere verificar las condiciones con el autor antes de cualquier despliegue en producción.
- Tasa de falsos positivos no nula incluso en el mejor brazo (9,7 % en CU, 16,0 % en SFT): prescripciones seguras podrían marcarse como inseguras, con el consiguiente riesgo de fricción operativa.
- Métricas evaluadas únicamente en el split de test de MedGuardBench (729 filas, separación por fármaco); la generalización a poblaciones, fármacos o sistemas de codificación distintos no está validada.
- Riesgo de alucinación inherente al modelo base Qwen3-8B, especialmente en la generación de la traza de verificación del brazo CU; la salida estructurada mitiga pero no elimina este riesgo.
- Idiomas soportados no documentados; no se garantiza un rendimiento consistente fuera del idioma de entrenamiento (no especificado).
- El brazo GRPO requiere aplicar primero el adaptador SFT y fusionarlo; un uso incorrecto de los adaptadores puede producir resultados inválidos.
- Longitud de contexto del modelo base no documentada en esta ficha; el brazo CU necesita al menos 2.048 tokens nuevos de decodificación, lo que condiciona los requisitos de memoria y latencia.
- Sin descargas ni likes en el momento de la consulta y con fecha de creación muy reciente (2026-11-17): no hay validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-Qwen3-8B
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Base cuantizada usada en los ejemplos: https://huggingface.co/unsloth/qwen3-8b-unsloth-bnb-4bit
