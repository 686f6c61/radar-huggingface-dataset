# sarakhosravi/MedGuard-LlamaGuard-7B

## Resumen

MedGuard-LlamaGuard-7B es un conjunto de adaptadores LoRA publicados por el usuario sarakhosravi sobre el modelo base LlamaGuard-7b de la comunidad llamas-community. Su propósito es actuar como guardrail de seguridad en prescripción de medicamentos: recibe un perfil estructurado de paciente junto con una prescripción propuesta y devuelve un veredicto binario (seguro o no seguro) acompañado de las categorías de riesgo que lo justifican, sobre un total de 17 categorías definidas por el autor.

El modelo se distribuye como adaptadores PEFT (formato safetensors, 0,3 GB de repositorio) y no como pesos completos, por lo que requiere cargar el LlamaGuard-7b original y aplicar el adaptador encima. Incluye dos ramas de entrenamiento publicadas: SFT (supervised fine-tuning alineado al esquema) y CU (Patient Profile Unrolling), esta última con una época adicional que hace que el modelo verifique campo a campo el historial del paciente antes de emitir el veredicto.

Es relevante en el contexto actual de guardrails clínicos porque aborda un problema poco cubierto por los modelos de seguridad genéricos: la verificación condicionada al paciente, donde la misma prescripción puede ser segura o insegura según comorbilidades, edad, función renal o medicación concomitante. El autor lo posiciona explícitamente como herramienta de investigación y no como dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaGuard-7b) con adaptadores LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; tamano de los adaptadores no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en safetensors; cuantizacion del base no documentada) |
| Idiomas soportados | no disponible (la model card no lo especifica) |
| Licencia | other (heredada de la licencia de LlamaGuard-7b; condiciones no detalladas) |
| Formato de pesos | safetensors (adaptadores LoRA en subcarpetas `sft/` y `cu/`) |

## Arquitectura y entrenamiento

El modelo parte de LlamaGuard-7b, un transformer decoder-only de 7.000 millones de parámetros, y le aplica adaptadores LoRA entrenados con la librería PEFT. El entrenamiento se realizó sobre el dataset MedGuardBench, del mismo autor, y la model card reporta dos ramas: SFT, con supervisión alineada al esquema de salida (veredicto más 17 categorías de riesgo), y CU (Patient Profile Unrolling), que parte del checkpoint SFT y entrena una época adicional en la que el modelo primero contrasta cada campo del historial del paciente contra las reglas de seguridad del fármaco y después emite el veredicto.

La model card menciona además una tercera rama, Guided GRPO, descrita como GRPO con recompensa de seguridad verificable y rollouts guiados por profesor, partiendo del modelo SFT fusionado. Sin embargo, no se incluye una subcarpeta con esos pesos ni cifras de resultados para esa rama en la información disponible. Las métricas reportadas se calculan sobre el split de test de MedGuardBench con 729 filas y separación por fármaco (drug-disjoint), lo que evita que el mismo principio activo aparezca en entrenamiento y test.

## Capacidades

- Clasificación de seguridad de prescripciones condicionada al paciente: emite veredicto seguro/no seguro a partir de un perfil estructurado y una prescripción propuesta.
- Etiquetado multi-etiqueta de riesgo: asigna las 17 categorías de riesgo definidas en MedGuardBench que justifican el veredicto.
- Traza de verificación explícita (rama CU): escribe un razonamiento intermedio campo a campo antes del veredicto, lo que facilita la auditoría.
- Decodificación determinista recomendada: el autor indica decodificación greedy con temperatura 0.
- Generación de hasta 2.048 tokens nuevos como mínimo en la rama CU para acomodar la traza de verificación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el razonamiento multi-paso se limita a la verificación estructurada de la rama CU.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Filtro previo a la prescripción en sistemas de soporte a la decisión clínica: el modelo recibe el perfil del paciente y la prescripción propuesta y devuelve un veredicto con las categorías de riesgo activadas, lo que permite bloquear o marcar la orden antes de que llegue a farmacia.
- Auditoría retrospectiva de recetas: procesar lotes de prescripciones históricas con sus perfiles de paciente para detectar patrones de riesgo no advertidos, aprovechando la separación por fármaco del benchmark como referencia de generalización.
- Segunda opinión automática en revisión farmacéutica: la rama CU genera una traza campo a campo que el farmacéutico puede revisar, lo que reduce el coste de verificación manual de cada interacción.
- Investigación en guardrails médicos: servir como línea base reproducible para comparar estrategias de entrenamiento (SFT frente a CU) sobre el mismo dataset y esquema de etiquetas.
- Generación de datos etiquetados de seguridad farmacológica: usar el modelo para pre-etiquetar pares paciente-prescripción y revisar manualmente solo los casos de baja confianza o con veredicto no seguro.
- Integración en pipelines de evaluación de modelos clínicos: colocar MedGuard como juez de seguridad de las salidas de un LLM generador de recomendaciones farmacológicas, midiendo cuántas propuestas del generador son rechazadas.
- Formación y simulación clínica: construir escenarios donde el modelo señale qué campo del historial del paciente dispara el riesgo, útil para material docente sobre prescripción segura.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de test de MedGuardBench (729 filas, drug-disjoint). Todas las métricas en porcentaje.

| Rama | Acc | Rec (unsafe) | FPR | Micro-F1 (17 cat.) | Macro-F1 (17 cat.) | Exact match |
|---|---:|---:|---:|---:|---:|---:|
| SFT | 91,2 | 89,4 | 6,9 | 72,4 | 64,5 | 66,3 |
| CU (Patient Profile Unrolling) | 90,9 | 95,8 | 14,3 | 72,7 | 66,4 | 65,2 |

La comparación entre ramas muestra el compromiso esperado: CU gana 6,4 puntos de recall en prescripciones no seguras a costa de 7,4 puntos de falsos positivos sobre prescripciones seguras, con precisión global prácticamente idéntica. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otros guardrails médicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud para un modelo de 7B en precisión fp16, se requiere espacio para los pesos del base más el adaptador LoRA; el adaptador en sí ocupa una fracción pequeña del repositorio de 0,3 GB.
- GPU recomendadas: no especificadas por el autor. El ejemplo de uso emplea `device_map="auto"`, que reparte el modelo entre la memoria disponible.
- Cabe en GPU de consumo: no confirmado en la información disponible; dependerá de la cuantización aplicada al modelo base, que la model card no documenta.
- Opciones de despliegue: el ejemplo oficial usa transformers con PEFT (`PeftModel.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, aunque al ser un adaptador LoRA sobre LlamaGuard-7b podría fusionarse con el base para su uso en dichos motores, extremo no verificado en la documentación.
- Latencia y throughput: no disponibles. La rama CU requiere generar al menos 2.048 tokens nuevos por consulta, lo que incrementa el coste de inferencia frente a la rama SFT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| MedGuard-LlamaGuard-7B (SFT) | 7B (LoRA) | no disponible | Guardrail de prescripción condicionado al paciente | other | Acc 91,2; Rec 89,4; FPR 6,9 |
| MedGuard-LlamaGuard-7B (CU) | 7B (LoRA) | no disponible | Igual, con traza de verificación | other | Acc 90,9; Rec 95,8; FPR 14,3 |
| LlamaGuard-7b (base) | 7B | no disponible en la información | Guardrail genérico de contenido | Llama community license | No evaluado en MedGuardBench en la información disponible |
| Otros guardrails médicos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos que permitan comparar este modelo con alternativas específicas de seguridad farmacológica; la información proporcionada solo cubre el propio modelo y su base.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación: el autor declara explícitamente que no es un dispositivo médico y que no debe emplearse para decisiones clínicas.
- Licencia "other" heredada de LlamaGuard-7b: las condiciones exactas de uso comercial no se detallan en la model card y deben consultarse en la licencia del modelo base antes de cualquier despliegue productivo.
- Riesgo de falsos positivos en la rama CU: un FPR del 14,3 % sobre prescripciones seguras implica rechazos innecesarios en aproximadamente una de cada siete recetas válidas, lo que en producción puede generar fatiga de alertas.
- Cobertura limitada a 17 categorías de riesgo definidas por el autor; riesgos fuera de ese esquema no serán detectados ni etiquetados.
- Evaluación sobre un único benchmark (MedGuardBench, 729 filas de test) del mismo autor del modelo, sin validación externa ni replicación independiente reportada.
- Sesgos conocidos: no documentados en la información disponible; al derivar de LlamaGuard-7b puede heredar los sesgos del modelo base y de sus datos de alineación.
- Riesgo de alucinación: no cuantificado; la tarea es de clasificación con etiquetas cerradas, lo que acota el espacio de salida, pero la traza de verificación de la rama CU es texto libre y puede contener afirmaciones incorrectas sobre el perfil del paciente.
- Idiomas soportados no declarados: no hay garantía de funcionamiento fuera del idioma de entrenamiento, presumiblemente inglés.
- Sin métricas de latencia ni throughput publicadas, lo que dificulta dimensionar un despliegue real.
- Repositorio sin descargas ni likes en el momento de la consulta y creado en noviembre de 2026: no hay evidencia de uso comunitario ni de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-LlamaGuard-7B
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base LlamaGuard-7b: https://huggingface.co/llamas-community/LlamaGuard-7b
- Paper, blog o repositorio del autor: no disponible en la información proporcionada.
