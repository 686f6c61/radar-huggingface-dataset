# MulticulturalAlignment/scpo-reward-model-canada

## Resumen

El modelo `MulticulturalAlignment/scpo-reward-model-canada` es un modelo de recompensa escalar (reward model) desarrollado por el grupo MulticulturalAlignment, resultado de un ajuste fino completo sobre `OpenAssistant/reward-model-deberta-v3-base`. Está entrenado con pares de preferencia del dataset PRISM correspondientes a participantes residentes en Canadá, y su función es asignar una puntuación escalar a una respuesta dada una instrucción: a mayor puntuación, mayor preferencia estimada para ese mismo prompt. No genera texto en ningún caso.

El modelo implementa el algoritmo SCPO (Steerable Cultural Preference Optimization), presentado en el artículo «Steerable Cultural Preference Optimization of Reward Models» (arXiv:2606.18606), aceptado en el taller Pluralistic Alignment de ICML 2026. La motivación es que los modelos de alineamiento habituales predicen una preferencia agregada y única, lo que diluye las preferencias de subcomunidades culturales concretas. SCPO reentrena un modelo de recompensa global por país para que refleje mejor las preferencias de los usuarios residentes en ese país sin perder capacidad general.

Técnicamente es un modelo compacto: 184.422.913 parámetros en formato safetensors (0,7 GB de repositorio), arquitectura DeBERTa-v2 con cabecera de clasificación de secuencia, ventana de 512 tokens y licencia MIT. Su relevancia actual está en el ámbito de la investigación en alineamiento pluralista: permite puntuar respuestas con un criterio cultural específico en lugar de uno global, con una mejora registrada de 60,4046% a 66,1850% de precisión sobre el modelo de partida en el split de test del país.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v2 con cabecera de clasificación de secuencia (scalar reward head) |
| Parametros totales | 184.422.913 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (entradas de entrenamiento limitadas y con padding a 512); la puntuación original usa pares prompt/respuesta sin truncamiento explícito en lotes de interacción de hasta 8 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo publica pesos safetensors |
| Idiomas soportados | Inglés (en); la muestra es de dominio inglés, según el autor |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es `OpenAssistant/reward-model-deberta-v3-base`, un encoder DeBERTa-v2 con cabecera de regresión que devuelve un logit escalar en lugar de una distribución de clases. Sobre esa base se realiza un ajuste fino de modelo completo (full-model fine-tuning) con el algoritmo SCPO propuesto por los autores, cuyo objetivo es incorporar preferencias culturales diversas de forma equilibrada en lugar de optimizar una preferencia agregada. La revisión concreta del modelo base utilizada es `7dab4156e63944834c3aae169c3fe83955672cff`.

Los datos proceden del dataset `HannahRoseKirk/prism-alignment`, revisión `18ab5cfb37456f4ec8cbc00212ce54cf7b1239f6`, filtrando los pares de preferencia por residencia del participante (Canadá). Los empates en las valoraciones humanas se excluyen de los pares de preferencia. La división de usuarios de la encuesta es 85/15. La receta de entrenamiento registrada incluye: learning rate 1e-06, batch size 8, 1024 pasos de optimizador, tau de filtrado 0,7 y beta de ponderación 1,1. Las semillas son 0 (barajado de datos y split encuesta/modelo) y 42 (Trainer). Las entradas de entrenamiento se construyen literalmente como `prompt + " [SEP] " + response`, recortadas y con padding a 512 tokens.

El resultado registrado del experimento es una precisión global del 66,1850% para el modelo SCPO frente al 60,4046% del modelo global de partida. El autor advierte de que son puntuaciones de experimento en memoria, sin reinicio de estado aleatorio ni modo de evaluación previo, por lo que una sesión de inferencia limpia con `eval()` puede arrojar cifras distintas, y que las configuraciones se ajustaron sobre un split de test fijo, de modo que estos resultados no coinciden con las medias de tres ejecuciones del artículo. Se incluyen scripts de reproducción, `provenance.json`, `release-settings.json` y `requirements-pw-lock.txt`, pero no se distribuye ningún registro privado de PRISM.

## Capacidades

- Puntuación escalar de respuestas: dado un prompt y una respuesta, devuelve un logit que actúa como recompensa; las puntuaciones más altas indican mayor preferencia estimada.
- Modelado de preferencias culturales específicas de Canadá, derivado de los pares de preferencia de participantes residentes en ese país.
- Clasificación de texto en pipeline `text-classification` con `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatible con text-embeddings-inference y con endpoints compatibles según los tags del repositorio.
- Apto para puntuar pares prompt/respuesta con la construcción `prompt + " [SEP] " + response` (entrenamiento) o mediante pares prompt/respuesta del tokenizador en lotes de hasta 8 (puntuación original).
- Idioma: inglés. No se declara soporte multilingüe.
- No dispone de generación de texto, tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reordenación best-of-N en generación: generar varias respuestas candidatas con un LLM y usar este reward model para seleccionar la mejor según las preferencias de usuarios canadienses. Es adecuado porque el coste por puntuación es bajo (184 M de parámetros) y la ventana de 512 tokens cubre típicamente prompts y respuestas cortas.
- Ajuste por RLHF o DPO con señal de recompensa regional: emplear las puntuaciones como señal de recompensa en un pipeline de optimización de políticas, de forma separada por país, para evitar que una preferencia agregada diluya la de Canadá.
- Filtrado y curación de datos de preferencia: puntuar grandes lotes de pares prompt/respuesta para descartar ejemplos con baja preferencia antes de entrenar un modelo mayor, reduciendo el coste de anotación humana.
- Evaluación comparativa de modelos para el mercado canadiense: medir de forma automática qué sistema responde mejor a las preferencias de este grupo de usuarios y detectar regresiones entre versiones de un asistente conversacional.
- Investigación en alineamiento pluralista: reproducir los experimentos SCPO con la receta publicada (learning rate 1e-06, 1024 pasos, tau 0,7, beta 1,1) y comparar el comportamiento frente a los checkpoints de otros países de la misma colección.
- Análisis de sesgos de anotadores: estudiar qué tipo de respuestas puntúa alto o bajo este modelo para detectar sesgos presentes en los pares de preferencia de origen y corregirlos antes de desplegar un sistema alineado.
- Auditoría interna de asistentes en producción: integrar el modelo como comprobación automática que marca respuestas con recompensa anómala para revisión humana, siempre como señal auxiliar y no como decisión final.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Lo que sí se registra son las cifras del experimento de post-entrenamiento, medidas como precisión sobre el split de test del país:

| Medicion | Precision |
|---|---:|
| Modelo global de partida, overall | 60,4046% |
| Modelo SCPO (este checkpoint), overall | 66,1850% |

Estas cifras corresponden a puntuaciones de experimento en memoria, sin reinicio de estado aleatorio ni de modo de modelo antes de la evaluación. El autor indica que una sesión de inferencia limpia con `eval()` puede producir una precisión diferente y que estos resultados no equivalen a las medias de tres ejecuciones del artículo. El archivo `validation.json` solo comprueba la carga del modelo y la inferencia finita y repetible sobre sondas genéricas; no es un resultado de benchmark.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,74 GB solo para pesos (184,4 M de parámetros a 4 bytes), más activaciones y overhead del runtime; en la práctica por debajo de 2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,37 GB para pesos; por debajo de 1 GB con overhead.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o inferiores con suficiente memoria; también en GPUs de datacenter (A100, H100, L4) donde el cuello de botella no será la memoria sino la latencia de red.
- Inferencia en CPU perfectamente viable dado el tamaño; útil para puntuar lotes offline en máquinas sin GPU.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification` (el método mostrado en la model card), text-embeddings-inference (etiqueta declarada en el repositorio) y endpoints compatibles. Para llama.cpp, Ollama, vLLM o TGI no se proporciona confirmación ni artefactos GGUF en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El repositorio no incluye mediciones de tokens por segundo ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision registrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scpo-reward-model-canada | 184.422.913 | 512 tokens | 66,1850% (test Canadá) | MIT | HuggingFace, safetensors |
| OpenAssistant/reward-model-deberta-v3-base (modelo base) | 184 M aprox. | 512 tokens | 60,4046% (mismo test, modelo global de partida) | MIT | HuggingFace |
| Otros checkpoints por país de la colección SCPO | No disponible | No disponible | No disponible | No disponible | Referenciados en el artículo como reentrenamiento por país; no se detallan en la información proporcionada |

No se dispone de datos de benchmarks comparables frente a reward models de otros autores, por lo que no se incluye una comparación cruzada de rendimiento.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce una puntuación escalar; no puede redactar respuestas ni ejecutar tareas.
- Las puntuaciones no son probabilidades y no están calibradas entre modelos distintos; no deben compararse directamente valores absolutos de checkpoints diferentes.
- Riesgo de sesgo: las etiquetas de país reflejan la residencia de los participantes, no una representación de la cultura del país ni de las preferencias de todos sus residentes.
- La muestra es de dominio inglés y los conjuntos de test por país son pequeños, lo que limita la generalización a otros idiomas, registros o subgrupos.
- El autor declara explícitamente que el modelo no está validado para decisiones consecuentes sobre personas; no debe usarse para selección, evaluación o perfilado de individuos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de puntuaciones poco fiables en dominios alejados de los datos de preferencia de PRISM.
- Licencia: los pesos se publican bajo MIT y el modelo base también está marcado como MIT. Sin embargo, el dataset PRISM lista el texto humano como CC-BY-4.0 y las respuestas de modelo como CC-BY-NC-4.0, sujeto a los términos de los proveedores originales. El paquete no contiene registros de PRISM, pero ese condicionante debe tenerse en cuenta si se redistribuyen datos derivados.
- Las cifras de precisión publicadas provienen de un experimento sin reinicio de estado; conviene reejecutar la evaluación en modo `eval()` antes de tomar decisiones de despliegue.
- Contexto máximo de 512 tokens: prompts y respuestas largas se truncan, lo que puede sesgar la puntuación de respuestas extensas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MulticulturalAlignment/scpo-reward-model-canada
- Modelo base: https://huggingface.co/OpenAssistant/reward-model-deberta-v3-base
- Dataset PRISM: https://huggingface.co/datasets/HannahRoseKirk/prism-alignment
- Paper (arXiv): https://arxiv.org/abs/2606.18606
- Repositorio de código: https://github.com/minsik-ai/Steerable-Cultural-Preference
- Foro OpenReview: https://openreview.net/forum?id=Gsjk6RX4SK
- Resumen divulgativo (embedding.report): https://embedding.report/story/steerable-cultural-preference-optimization-of-reward-models/
- Resumen divulgativo (ai-deep-signal): https://ai-deep-signal.com/article/6b66b771-9426-4cc9-8d02-2d5dd67e8424
- Licencia MIT: https://opensource.org/license/mit
