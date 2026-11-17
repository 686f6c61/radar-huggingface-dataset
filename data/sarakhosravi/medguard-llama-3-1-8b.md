# sarakhosravi/MedGuard-Llama-3.1-8B

## Resumen

MedGuard-Llama-3.1-8B es un conjunto de adaptadores LoRA publicados por el usuario sarakhosravi sobre el modelo base meta-llama/Llama-3.1-8B, orientados a la verificación de seguridad de prescripciones farmacológicas condicionada por el perfil del paciente. Dado un perfil estructurado del paciente y una prescripción propuesta, el modelo emite un veredicto de seguro o inseguro junto con las categorías de riesgo (hasta 17) que justifican la decisión.

El modelo no es un modelo fundacional nuevo, sino un ajuste fino supervisado (SFT) y una variante adicional denominada Patient Profile Unrolling (CU) entrenados sobre el conjunto de datos MedGuardBench, propiedad del mismo autor. El repositorio ocupa 0,4 GB, lo que corresponde al peso de los adaptadores PEFT en formato safetensors, no al modelo completo. La arquitectura subyacente es la del transformer decoder-only de Llama 3.1 8B, con 8.000 millones de parámetros y contexto nativo de 128.000 tokens.

Su relevancia es acotada y experimental: se trata de un artefacto de investigación sobre guardrails clínicos, con métricas publicadas sobre una partición de test de 729 filas disjuntas por fármaco. El autor declara explícitamente que no es un dispositivo médico y que no debe emplearse para decisiones clínicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) con adaptadores LoRA (PEFT) |
| Parámetros totales | 8.000 millones (modelo base); adaptadores LoRA de tamaño no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B); la model card recomienda reservar al menos 2.048 tokens nuevos para la traza de verificación de la variante CU |
| Tipos de cuantización | El adaptador se aplica sobre `unsloth/Llama-3.1-8B-unsloth-bnb-4bit` (4 bits); no se documentan otras opciones |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de la licencia de Llama 3.1; condiciones específicas no detalladas) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), organizados en subcarpetas `sft/` y `cu/` |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B, un transformer decoder-only con atención por grupos (GQA) y RoPE, y añade adaptadores LoRA mediante la librería PEFT. Se documentan dos brazos de entrenamiento. El primero, SFT, es un ajuste fino supervisado alineado con el esquema de salida. El segundo, CU (Patient Profile Unrolling), parte del checkpoint SFT y entrena un epoch adicional en el que el modelo verifica primero cada campo de la historia clínica contra las reglas de seguridad del fármaco antes de emitir el veredicto, generando una traza de verificación intermedia.

La model card menciona además un tercer brazo, Guided GRPO, descrito como GRPO con una recompensa de seguridad verificable y rollouts guiados por profesor, partiendo del modelo SFT fusionado; sin embargo, no se incluye en la tabla de resultados ni se especifica su subcarpeta en el repositorio. No se detallan el número de tokens de entrenamiento, la composición completa del dataset ni si hubo DPO. El conjunto de entrenamiento es MedGuardBench, con una partición de test de 729 filas disjuntas por fármaco.

## Capacidades

- Clasificación de seguridad de prescripciones: emite un veredicto binario (seguro/inseguro) condicionado por un perfil de paciente estructurado.
- Etiquetado multi-etiqueta de riesgo: identifica hasta 17 categorías de riesgo que justifican el veredicto.
- Razonamiento verificable: la variante CU genera una traza explícita de comprobación campo a campo antes del veredicto final.
- Procesamiento de perfiles clínicos estructurados: consume historias clínicas en formato estructurado y las contrasta con reglas de seguridad farmacológica.
- Generación de texto en lenguaje natural (heredada del modelo base), aunque el uso previsto es la tarea de guardrail.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento extendido más allá de la traza CU.

## Casos de uso

- Investigación en guardrails de prescripción: evaluación de técnicas de ajuste fino (SFT frente a desenrollado de perfil) sobre una tarea de verificación de seguridad con métricas reproducibles sobre MedGuardBench.
- Filtrado previo en pipelines de e-prescripción experimentales: el modelo puede actuar como capa de detección de interacciones y contraindicaciones antes de una revisión humana, siempre en entorno de laboratorio y nunca como decisión clínica.
- Generación de datos sintéticos etiquetados: uso de las trazas de verificación de la variante CU como material para anotación asistida o destilación en modelos menores.
- Auditoría de reglas farmacológicas: contraste de las categorías de riesgo emitidas por el modelo frente a bases de datos de interacciones, para detectar discrepancias en el conjunto de reglas.
- Estudio de calibración y falsos positivos: el modelo publica una tasa de falsos positivos del 13,1 % en la variante CU, lo que permite analizar el coste de bloquear prescripciones seguras en sistemas de alerta.
- Base para ajuste específico de dominio: al ser adaptadores LoRA sobre Llama 3.1 8B, un equipo puede reentrenar sobre su propia taxonomía de riesgos partiendo de los checkpoints publicados.
- Docencia y prototipado en informática médica: ejemplo didáctico de cómo condicionar un LLM con un perfil de paciente estructurado y evaluar con particiones disjuntas por fármaco.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre la partición de test de MedGuardBench (729 filas, disjunta por fármaco). Todas las métricas en porcentaje.

| Brazo | Acc | Rec (unsafe) | FPR | Micro-F1 | Macro-F1 | EM |
|---|---:|---:|---:|---:|---:|---:|
| SFT | 88,3 | 96,3 | 20,3 | 71,4 | 64,7 | 62,7 |
| CU (Patient Profile Unrolling) | 91,8 | 96,3 | 13,1 | 73,4 | 64,7 | 66,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantización 4 bits (bnb-4bit, configuración usada en el ejemplo oficial) el modelo base ocupa aproximadamente 5-6 GB de pesos, más overhead de activaciones y caché KV; en FP16 serían unos 16 GB solo de pesos.
- GPU recomendadas: A100 40 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) suficiente para 4 bits con contexto moderado; RTX 3090/4080 (16-24 GB) viables en 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits sobre GPUs de 12-16 GB o superiores, siempre que se gestione la longitud de contexto.
- Opciones de despliegue: transformers + peft (ruta oficial documentada); vLLM, TGI, llama.cpp u Ollama requerirían fusionar los adaptadores en el modelo base, ya que el repositorio solo contiene LoRA.
- Latencia y throughput: no disponibles. La variante CU requiere generar al menos 2.048 tokens nuevos por consulta, lo que incrementa notablemente el coste frente a la variante SFT.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos de guardrails farmacológicos en la información proporcionada. Como referencia estructural, se compara con el modelo base del que deriva.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGuard-Llama-3.1-8B (SFT/CU) | 8B (LoRA) | 128k | Guardrail de prescripción | other | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B (base) | 8B | 128k | Generación general | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Alternativas de guardrail médico | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un dispositivo médico: el autor prohíbe explícitamente su uso para decisiones clínicas; solo está destinado a investigación sobre guardrails.
- Tasa de falsos positivos relevante: 20,3 % en SFT y 13,1 % en CU sobre prescripciones seguras, lo que implicaría bloqueos indebidos en un despliegue real.
- Macro-F1 limitado (64,7 % en ambos brazos), lo que indica rendimiento desigual entre las 17 categorías de riesgo; algunas clases probablemente tienen muy pocos ejemplos.
- Evaluación restringida: las métricas provienen de una única partición de 729 filas disjunta por fármaco; no hay validación externa ni en otros hospitales o poblaciones.
- Riesgo de alucinación en la traza de verificación: la variante CU genera texto intermedio que puede contener afirmaciones no respaldadas por las reglas, aunque el veredicto final sea correcto.
- Idiomas no documentados: no se especifica si el modelo funciona fuera del inglés, y el dataset de entrenamiento no detalla composición lingüística.
- Licencia "other" heredada de Llama 3.1: las condiciones comerciales dependen de la Llama 3.1 Community License y de la política de uso aceptable de Meta; no se aclaran restricciones adicionales del autor.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Dependencia de la cuantización de entrenamiento: los adaptadores se entrenaron sobre `unsloth/Llama-3.1-8B-unsloth-bnb-4bit`, por lo que aplicarlos sobre el modelo en FP16 puede degradar el rendimiento.
- Sin soporte documentado de tool calling ni de integración con APIs; su uso requiere envolverlo en lógica externa de parsing del veredicto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-Llama-3.1-8B
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base original: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base cuantizado usado en el ejemplo: https://huggingface.co/unsloth/Llama-3.1-8B-unsloth-bnb-4bit
