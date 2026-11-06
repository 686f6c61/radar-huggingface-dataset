# AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s1

## Resumen

Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s1 es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario AnniBori en Hugging Face, que ha sido sometido a un proceso de *machine unlearning* (desaprendizaje) para eliminar conocimiento factual concreto sobre películas populares. Parte de un checkpoint previamente ajustado con el conjunto de datos DUET (configuración `film`, época 6) y aplica sobre él la técnica RMU (Representation Misdirection for Unlearning) para borrar el conjunto de olvido `forget_popular_film`, compuesto por 411 hechos de directores de cine.

El modelo no es un asistente de propósito general, sino un artefacto de investigación orientado al estudio de técnicas de desaprendizaje y a la evaluación de la robustez de dichos métodos frente a ataques de recuperación (relearning). Su relevancia radica en que documenta de forma exhaustiva el proceso de selección de época, las métricas de olvido y retención, y proporciona código para reproducir la evaluación, lo que lo convierte en un recurso útil para investigadores que trabajan en privacidad de modelos y cumplimiento normativo.

Arquitectónicamente es un transformer decoder-only de 8.030.261.248 parámetros (aproximadamente 8B), heredado íntegramente de Llama 3.1 8B Instruct, con la misma longitud de contexto y tokenizador del modelo original. El repositorio ocupa 16,1 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.1, con 8.030.261.248 parámetros. No se introducen cambios arquitectónicos respecto al modelo base: el proceso de desaprendizaje modifica los pesos existentes, no la topología. El punto de partida es `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (Llama-3.1-8B-Instruct ajustado sobre el conjunto DUET film, época 6).

El entrenamiento de desaprendizaje emplea la receta RMU del proyecto open-unlearning (`experiment=revival_mechanism/unlearn/duet_8B_RMU`), con coeficiente de direccionamiento (*steering coefficient*) 2 sobre `model.layers.15`, gamma 1, alpha 1 y pérdida de retención EMBED_DIFF. Los hiperparámetros son: learning rate 1e-5, 8 épocas, batch 4 con acumulación de gradiente 4, warmup de 1 época, weight decay 0,01, optimizador `paged_adamw_8bit`, precisión bf16 y semilla 1. Se guarda un checkpoint tras cada época (26 pasos por época). Los datos de olvido son 411 hechos de directores de películas populares (`forget_popular_film`, filas con `split_role = train`) y los de retención 546 hechos (`retain_film`), ambos del dataset `SwetieePawsss/DUET_LLM`, configuración `film`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`.

La selección de época sigue un criterio preregistrado: se considera cualificada una época si el recall ROUGE-L en generación libre sobre el conjunto de olvido es ≤ 0,15 y el recall de retención es ≥ recall base − 0,30 (base 0,842, suelo 0,542). Entre las cualificadas se elige la de mayor diferencia retención − olvido. La época seleccionada es la 7, con recall de olvido 0,021 y recall de retención 0,735.

## Capacidades

- Generación de texto conversacional en formato chat de Llama 3.1 (turno de sistema más turno de usuario).
- Respuesta a preguntas factuales concisas: el prompt de sistema usado en entrenamiento y evaluación es `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`
- Retención de conocimiento general sobre películas no incluidas en el conjunto de olvido (recall de retención 0,735 sobre 546 hechos).
- Capacidad reducida pero no nula de responder sobre los hechos olvidados (recall de olvido 0,021 en generación libre).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como artefacto de referencia para comparar técnicas de desaprendizaje (RMU en este caso) sobre un conjunto factual acotado y reproducible, con métricas de olvido y retención documentadas época a época.
- Evaluación de robustez frente a ataques de recuperación: el repositorio incluye un *probe* de reaprendizaje con LoRA de rango 4 y semilla 42 (pasos 1 a 256) en `revival_mechanism/src/stage4_revival_sweep.py`, útil para medir cuánto conocimiento olvidado se recupera con un ajuste ligero.
- Análisis de subspacios de representación: el script `revival_mechanism/src/stage5_interp/stage9_gate_anatomy.py` permite estudiar qué direcciones del espacio de activaciones codifican el conocimiento eliminado, con un nulo emparejado por selección.
- Auditoría de cumplimiento de privacidad: útil para simular escenarios de retirada de datos (*right to be forgotten*) sobre un modelo de 8B y verificar empíricamente el grado de borrado efectivo.
- Reproducción de experimentos académicos: la receta completa (dataset, hiperparámetros, semilla, criterio de selección de época) permite replicar el resultado en entornos con open-unlearning.
- Evaluación comparativa de semillas: al existir una variante `s0` publicada por el mismo autor, permite estudiar la varianza del proceso de desaprendizaje entre semillas.
- Docencia en técnicas de alineación y desaprendizaje: el modelo y su código asociado sirven como ejemplo práctico de un pipeline completo de unlearning con métricas cuantitativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor solo reporta métricas internas de olvido y retención por época:

| Epoca | Recall olvido (ROUGE-L) | Recall retencion |
|---|---|---|
| 1 | 0,828 | 0,685 |
| 2 | 0,090 | 0,658 |
| 3 | 0,067 | 0,712 |
| 4 | 0,044 | 0,730 |
| 5 | 0,024 | 0,734 |
| 6 | 0,023 | 0,737 |
| 7 (seleccionada) | 0,021 | 0,735 |
| 8 | 0,027 | 0,735 |

Recall base de retención: 0,842. Criterio de cualificación: olvido ≤ 0,15 y retención ≥ 0,542.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la informacion proporcionada. Como referencia orientativa para un transformer de 8B en bf16, se requiere aproximadamente 16 GB de VRAM solo para los pesos; en cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB. Estas cifras son estimaciones generales para modelos de 8B y no han sido verificadas para este checkpoint concreto.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamaño, un modelo de 8B en bf16 encaja en A100 40/80 GB, H100 y RTX 4090 (24 GB); en cuantización 4 bits podría ejecutarse en GPUs consumer con 8-12 GB.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantización, aunque no se ha verificado en la informacion disponible.
- Opciones de despliegue: el modelo declara compatibilidad con `text-generation-inference` y `endpoints_compatible` en sus tags, además de `transformers`. No se confirma soporte de llama.cpp, Ollama, vLLM ni TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s1 (este) | 8,03B | no disponible | llama3.1 | Unlearning RMU sobre hechos de peliculas | Hugging Face, 243 descargas |
| Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s0 | 8,03B (heredado) | no disponible | llama3.1 | Misma receta, semilla 0 | Hugging Face |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft | 8,03B (heredado) | no disponible | llama3.1 | Fine-tuning sobre DUET film, sin olvido | Hugging Face (modelo base) |
| Llama-3.1-8B-Instruct (original) | 8,03B | 128K (segun ficha oficial de Meta) | llama3.1 | Asistente general | Amplia disponibilidad |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de las métricas de olvido y retención reportadas por el autor para la variante `s1`.

## Limitaciones y advertencias

- El modelo está diseñado para un dominio muy restringido (preguntas factuales concisas sobre películas) y su uso como asistente general no está validado.
- El olvido no es completo: el recall de olvido es 0,021, no cero, por lo que cierta información puede filtrarse en generación libre o bajo reformulaciones.
- El autor documenta un *probe* de reaprendizaje (LoRA rango 4, 256 pasos) que sugiere que el conocimiento olvidado podría recuperarse parcialmente con un ajuste ligero; esto es relevante para evaluaciones de privacidad.
- El prompt de sistema empleado en entrenamiento y evaluación es específico (`You are terse and fact-only QA assistant...`); desviarse de él puede degradar el comportamiento esperado.
- No se han publicado evaluaciones de sesgos, toxicidad o alucinación para este checkpoint.
- Los idiomas soportados no están documentados; se heredan presumiblemente los de Llama 3.1, pero no se confirma.
- La licencia llama3.1 impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos de la licencia Llama 3.1 de Meta antes de cualquier despliegue en producción.
- El modelo se publicó con 0 likes y 243 descargas, lo que indica una validación comunitaria muy limitada.
- No se han verificado requisitos de hardware ni rendimiento en producción para este checkpoint concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s1
- Variante semilla 0: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s0
- Ficha en Featherless AI de la variante s0: https://featherless.ai/models/AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s0
- Modelo base (fine-tune DUET film): https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET LLM: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Proyecto open-unlearning (referenciado en la model card, sin URL explícita): no disponible como enlace directo en la informacion proporcionada.
