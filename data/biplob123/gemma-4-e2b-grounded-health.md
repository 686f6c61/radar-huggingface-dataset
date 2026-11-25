# biplob123/gemma-4-e2b-grounded-health

## Resumen

`biplob123/gemma-4-e2b-grounded-health` es un ajuste fino (fine-tune) del modelo `google/gemma-4-E2B-it` de Google, especializado en responder preguntas de investigación biomédica utilizando únicamente el resumen (abstract) de un estudio científico que se le proporciona. El modelo devuelve una respuesta estructurada en JSON con una etiqueta (yes/no/maybe), una respuesta corta de dos a cuatro frases y los números de las frases del abstract en las que se apoya, lo que lo convierte en un sistema de generación con citas verificables (grounded generation). Lo desarrolla el usuario de Hugging Face `biplob123` y se distribuye bajo licencia Apache 2.0.

El modelo parte de la arquitectura Gemma 4 (transformer multimodal image-text-to-text), con 5.123.178.051 parámetros totales según los pesos en safetensors, y se ha entrenado mediante LoRA primero de forma supervisada (versión v2) y después mediante GRPO (Group Relative Policy Optimization) a partir del adaptador de v2 (versión v3b). El objetivo declarado es mejorar la "corrección con fundamento completo" (correct and fully grounded) frente a su modelo base y frente a la versión anterior, no solo la exactitud de la etiqueta.

Su relevancia actual reside en que aborda un problema clásico de los modelos pequeños en dominios especializados: la alucinación y la falta de trazabilidad de las respuestas. Al forzar al modelo a citar frases concretas del abstract y a responder "maybe" cuando la evidencia no es concluyente, se obtiene un sistema evaluable y auditable. No obstante, el propio autor lo etiqueta explícitamente como "research only, not medical advice" y restringe su uso a inglés y a resúmenes de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, image-text-to-text), ajuste fino con LoRA + GRPO |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0 (publicados); pesos fusionados en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF (Ollama/llama.cpp) |

## Arquitectura y entrenamiento

El modelo se construye sobre `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4 con capacidad image-text-to-text, del que hereda la arquitectura base. Sobre él se aplica un adaptador LoRA entrenado primero de forma supervisada (v2) y después refinado mediante GRPO (v3b) partiendo del adaptador de v2. Según la model card, la ejecución de GRPO de v3b no utilizó datos nuevos: empleó únicamente los 2.722 prompts de entrenamiento de v2 con sus etiquetas gold, restringidos al split de train.

Los datos de entrenamiento provienen de `qiaojin/PubMedQA` en la revisión `9001f2853fb87cab8d220904e0de81ac6973b318`, concretamente del conjunto artificial (PQA-A) para entrenamiento y desarrollo; el conjunto experto (PQA-L) se reserva como benchmark y nunca se usa para entrenar. Se eliminaron las filas solapadas con PQA-L por PMID, pregunta o contexto. El entrenamiento se realizó con la plantilla de chat de Gemma y el modo "thinking" desactivado, y el benchmark se decodificó de forma greedy (temperatura 0).

## Capacidades

- Generación de respuestas estructuradas en JSON con etiqueta (yes/no/maybe), respuesta corta y lista de citas por número de frase.
- Generación con fundamento (grounded generation): el modelo debe basar cada afirmación en las frases numeradas del abstract proporcionado y citar los números que la sustentan.
- Abstención calibrada: selecciona "maybe" cuando las frases no resuelven la pregunta.
- Razonamiento sobre texto científico biomédico en inglés (comprensión de abstracts de PubMed).
- Capacidad multimodal heredada de la arquitectura Gemma 4 (image-text-to-text), aunque el ajuste fino y la evaluación se centran en texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés (restricción explícita del autor).
- Modo "thinking": la model card indica que se desactiva (`--think=false`) para el uso previsto.

## Casos de uso

- Revisión sistemática asistida: dado un abstract de PubMed y una pregunta de investigación, el modelo devuelve la etiqueta de respuesta y las frases exactas que la sustentan, lo que permite a un revisor humano verificar la evidencia sin leer el abstract completo.
- Extracción de evidencia estructurada: al devolver JSON con `label`, `answer` y `citations`, se puede integrar en un pipeline que procese lotes de abstracts y genere una tabla de evidencia con trazabilidad por frase.
- Investigación sobre generación con citas: sirve como banco de pruebas para estudiar el comportamiento de citación y el anclaje (grounding) en modelos pequeños abiertos, con métricas como validez de cita y precisión de cita.
- Evaluación reproducible de alucinaciones: el prompt de EvalKit y el bundle de resultados permiten reproducir y extender el benchmark con PubMedQA, comparando contra el modelo base y la versión v2.
- Despliegue local en portátil: el GGUF Q4_K_M (3269,1 MB) se ejecuta con Ollama en un portátil sin GPU dedicada, útil para experimentación offline con datos sensibles que no deben salir del equipo.
- Docencia e investigación en NLP biomédico: permite ilustrar de forma práctica las diferencias entre exactitud de etiqueta y corrección con fundamento completo, usando las métricas publicadas.
- Filtrado previo de literatura: en un flujo de revisión, el modelo puede clasificar abstracts como evidencia a favor, en contra o inconclusa respecto a una hipótesis, con citas para revisión posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre PubMedQA `pqa_labeled`, split train, evaluados con EvalKit (run `r-66616600de17`). El archivo registrado y evaluado es Q4_K_M.

| Metrica | Valor |
|---|---|
| Label accuracy | 0,677 |
| Correct and fully grounded (gpt-6.1-sol) | 0,503 |
| Citation validity | 1,0 |
| Citation precision (gpt-6.1-sol) | 0,8728 |
| Aim-citation rate, lower is better (gpt-6.1-sol) | 0,0322 |

Según la model card, en la misma ejecución el modelo base obtiene 0,501 de exactitud de etiqueta y 0,404 de corrección con fundamento completo, mientras que v2 obtiene 0,678 de exactitud y 0,329 de corrección con fundamento completo. El autor indica que la diferencia v3b − v2 en corrección con fundamento completo es de 0,174 [0,147, 0,202], separada bajo la regla del plan. El Q8_0, exploratorio y fuera del test preregistrado, reporta 0,541 [0,510, 0,572] en corrección con fundamento completo.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 3269,1 MB y el Q8_0 ocupa 4737,4 MB; con overhead de contexto, el Q4_K_M cabe en GPUs de 6-8 GB y el Q8_0 en GPUs de 8-12 GB.
- Pesos fusionados en bf16: aproximadamente 10,2 GB (5,12 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; requiere GPU de 16 GB o superior.
- GPU recomendadas: RTX 4090, A100, H100 para los pesos fusionados en bf16; RTX 3060/4060 (8-12 GB) para los GGUF cuantizados.
- Cabe en GPU de consumo: sí, con los GGUF Q4_K_M y Q8_0.
- Opciones de despliegue: Ollama (`ollama run --think=false hf.co/biplob123/gemma-4-e2b-grounded-health-GGUF:Q4_K_M`), llama.cpp para GGUF, transformers para los pesos safetensors; la model card menciona además `ggh space --local` y `ggh serve` del repositorio del autor.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Label accuracy (PubMedQA) | Correct and fully grounded | Licencia |
|---|---|---|---|---|---|
| gemma-4-e2b-grounded-health (v3b, Q4_K_M) | 5,12 B | no disponible | 0,677 | 0,503 | apache-2.0 |
| gemma-4-e2b-grounded-v2 (Q4) | no disponible | no disponible | 0,678 | 0,329 | no disponible |
| google/gemma-4-E2B-it (base, Q4) | 5,12 B (heredado) | no disponible | 0,501 | 0,404 | no disponible |

La comparativa se limita a las variantes evaluadas en la misma ejecución de EvalKit, tal como reporta el autor. No se dispone de datos comparativos con otros modelos biomédicos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor declara explícitamente "Research only, not medical advice"; queda fuera de alcance cualquier uso clínico (diagnóstico, tratamiento, triaje o dosificación) y cualquier consejo médico personal.
- Solo inglés: no soporta otros idiomas.
- Solo abstracts de investigación: no está diseñado para artículos completos, guías clínicas, páginas web, historiales de pacientes ni chat abierto sin abstract proporcionado.
- Formato de prompt dependiente: solo devuelve JSON cuando recibe el prompt de EvalKit (pregunta más abstract dividido en frases numeradas); una pregunta sin más obtiene texto libre.
- Riesgo de alucinación: aunque las métricas de citación son altas (validez 1,0; precisión 0,873), la corrección con fundamento completo es del 50,3 %, lo que implica que aproximadamente la mitad de las respuestas no son simultáneamente correctas y completamente fundamentadas.
- Resultados no verificados: todas las métricas del model-index tienen `verified: false` y proceden de la ejecución del propio autor.
- Paridad de cuantización: el autor reconoce una discrepancia de paridad (OWNER D-73) en la que Q4_K_M coincide con los pesos fusionados en bf16 en la etiqueta solo para el 92,4 % de los prompts de desarrollo, frente al 99,0 % del Q8_0.
- Sesgos: no se documentan sesgos específicos en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el autor restringe el uso previsto al ámbito de investigación; conviene revisar la compatibilidad entre ambas declaraciones antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/biplob123/gemma-4-e2b-grounded-health
- Repositorio del proyecto: https://github.com/biplob819/gemma-grounded-health
- Bundle de resultados de evaluación: https://github.com/biplob819/gemma-grounded-health/blob/main/docs/results/results_bundle.json
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- GGUF del modelo: https://huggingface.co/biplob123/gemma-4-e2b-grounded-health-GGUF
