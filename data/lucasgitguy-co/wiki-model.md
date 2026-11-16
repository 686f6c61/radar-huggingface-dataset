# Lucasgitguy-co/wiki-model

## Resumen

wiki-model es un ajuste fino completo de SmolLM2-135M, desarrollado por Lucasgitguy-co, especializado en emitir hechos verificables extraídos de Wikipedia. El modelo resuelve un problema concreto: los modelos pequeños tienden a inventar datos cuando responden de memoria. Para mitigarlo, el autor combina el ajuste fino con un modo "grounded" que recupera contexto de un índice BM25 construido sobre Wikipedia y cita el artículo utilizado. El modelo tiene 134.515.008 parámetros y un tamaño de repositorio de 0,3 GB.

La arquitectura subyacente es la de SmolLM2-135M (transformer decoder-only), sin modificaciones estructurales: el trabajo se concentra en el ajuste fino supervisado sobre tareas específicas. El modelo cubre cuatro tareas mediante etiquetas de prompt: emitir un hecho sobre un tema (`<fact>`), un hecho aleatorio, responder preguntas cortas (`<q>`) y corregir afirmaciones falsas (`<fix>`). Está entrenado únicamente en inglés y se distribuye con licencia Apache-2.0.

Su relevancia radica en que demuestra un patrón práctico para modelos pequeños: en lugar de intentar memorizar conocimiento, el modelo aprende el formato de la tarea y a usar contexto recuperado. Los resultados publicados muestran una mejora drástica en modo grounded (94,7 EM en Q&A frente a 14,7 en modo memoria), lo que lo hace útil como componente de un pipeline RAG ligero más que como modelo autónomo de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM2-135M, un transformer decoder-only denso de 135M de parámetros, y aplica un ajuste fino completo (no LoRA ni adaptadores). El entrenamiento se realizó en tres fases: primero 40.000 ejemplos de tarea (35% con contexto recuperado) muestreados de wiki-model-facts y FactfulDataset; después un refuerzo de 11.000 ejemplos centrados en la tarea de corrección (FactfulDataset con contexto recuperado más replay); y finalmente un refuerzo de 24.000 ejemplos orientado a grounding, mayoritariamente con contexto recuperado.

La receta emplea AdamW con learning rate 1e-4 y decaimiento coseno (5e-5 en las fases de refuerzo), batch de 16, cálculo de pérdida solo sobre las respuestas, autocast en bf16 y gradient checkpointing. Todo el entrenamiento se ejecutó en una única Apple M4 (MPS), compartida con otro trabajo, en aproximadamente 8 horas. No se documenta uso de RLHF ni DPO. La innovación principal no es arquitectónica sino de flujo: el modelo aprende a condicionar sus respuestas a un contexto `<ctx>` recuperado mediante un índice BM25 sobre Wikipedia, y el paquete incluye la herramienta de recuperación.

## Capacidades

- Generación de hechos sobre un tema concreto mediante el prompt `<fact> Tema </fact>`.
- Generación de hechos aleatorios sobre Wikipedia.
- Respuesta a preguntas cortas de tipo factual con `<q> Pregunta? </q>`.
- Corrección de afirmaciones falsas con `<fix> Afirmación. </fix>`.
- Modo grounded (`--grounded`): recupera contexto de un índice BM25 sobre Wikipedia e imprime el artículo utilizado como fuente.
- Condicionamiento por contexto explícito mediante `<ctx> texto del artículo </ctx>` antepuesto al prompt.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Respuesta factual con trazabilidad: en modo grounded, el modelo responde preguntas cortas citando el artículo de Wikipedia usado, lo que permite auditar la fuente. Adecuado para asistentes internos donde la verificabilidad importa más que la fluidez.
- Generación de fichas y resúmenes de un solo hecho: dado un tema, produce una frase factual extraída de su artículo, útil para poblar bases de datos de datos curiosos o tarjetas informativas.
- Verificación de afirmaciones en pipelines de contenido: la tarea `<fix>` permite marcar afirmaciones como incorrectas o no verificables, con la advertencia de que es la tarea más débil del modelo y debe compararse con la línea base de "copiar la afirmación".
- Componente de un sistema RAG ligero: el modelo y su índice BM25 (~600 MB) caben en entornos con recursos mínimos, por lo que sirve como capa de respuesta en despliegues de bajo coste donde un modelo grande sería inviable.
- Educación y demostraciones: su tamaño reducido y su receta reproducible en una sola máquina lo hacen útil para enseñar ajuste fino y evaluación de factualidad con métricas de soporte (token F1 ≥ 0,5).
- Filtrado y enriquecimiento de datasets: puede generar hechos candidatos a partir de títulos de artículos para construir conjuntos de entrenamiento o de evaluación de otros modelos.
- Prototipado rápido de asistentes de trivia: responde preguntas cortas en inglés con contexto recuperado, suficiente para demos y pruebas de concepto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre artículos y afirmaciones reservados (split de test por título de artículo). "Grounded" recupera contexto en tiempo de ejecución con el índice BM25. "Fact supported" indica que la frase generada coincide con una frase del artículo del tema con token F1 ≥ 0,5.

| Modelo | Modo | Q&A infobox EM | 'What is X' F1 | Fix (FEVEROUS) EM | Fix can't-verify acc | Fix (year swap) EM | Fact supported (temas nuevos) | Fact supported (temas conocidos) |
|---|---|---|---|---|---|---|---|---|
| wiki-model | solo modelo | 14,7 | 30,0 | 37,0 | 88,5 | 65,0 | 12,0 | 10,0 |
| wiki-model | grounded | 94,7 | 65,3 | 37,0 | 88,0 | 83,0 | 98,0 | 98,0 |
| wiki-model-tiny | solo modelo | 14,7 | 28,2 | 32,5 | 89,0 | 54,0 | 5,0 | 8,0 |
| wiki-model-tiny | grounded | 90,7 | 58,0 | 33,5 | 89,0 | 55,0 | 92,0 | 94,0 |
| SmolLM2-135M few-shot | solo modelo | 10,0 | 18,9 | 11,0 | 11,0 | 66,0 | 16,0 | 16,0 |
| SmolLM2-135M few-shot | grounded | 26,7 | 25,2 | 6,5 | 36,5 | 47,0 | 65,0 | 71,0 |
| copiar la afirmación | solo modelo | — | — | 47,5 | 89,0 | 71,0 | — | — |

El propio autor advierte que, respondiendo de memoria, los hechos del modelo base están soportados ligeramente más a menudo que los del ajuste fino: el entrenamiento enseñó el formato de la tarea y el uso de contexto recuperado, no conocimiento nuevo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 134,5M de parámetros; en fp16 ocupa aproximadamente 0,27 GB de pesos, y en bf16 lo mismo. Con overhead de activaciones y caché KV, cabe holgadamente en menos de 1 GB de VRAM en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entrenó en una Apple M4 vía MPS. Para producción, una RTX 4090 o incluso GPUs de gama baja son más que suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre; también puede ejecutarse en CPU.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; el paquete incluye un CLI propio (`wiki-model`). No se documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. El modo grounded requiere descargar el índice de hechos (~600 MB) en la primera llamada y ejecutar búsqueda BM25, lo que añade latencia dependiente del índice.
- Almacenamiento: el repositorio ocupa 0,3 GB; el índice grounded añade ~600 MB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| wiki-model | 134,5M | no disponible | inglés | Apache-2.0 | Ajuste fino para hechos de Wikipedia con modo grounded | Hugging Face |
| wiki-model-tiny | 12,5M (desde cero) | no disponible | inglés | no disponible en la información | Mismo enfoque, hermano desde cero | Hugging Face |
| SmolLM2-135M (base) | 135M | no disponible | multilingüe según el modelo base | Apache-2.0 | Modelo generalista de generación de texto | Hugging Face |

La comparación directa con el modelo base está documentada en los benchmarks: en modo grounded, wiki-model supera ampliamente al SmolLM2-135M con few-shot en Q&A (94,7 frente a 26,7 EM) y en soporte factual (98 frente a 65-71). No se dispone de comparaciones con otros modelos especializados en factualidad.

## Limitaciones y advertencias

- Las respuestas de memoria suelen ser incorrectas para temas poco conocidos; el propio autor recomienda usar `--grounded` para cualquier caso que importe.
- Las respuestas grounded dependen de la calidad de la recuperación: si el índice BM25 no devuelve el artículo correcto, la respuesta será incorrecta aunque suene plausible.
- Solo inglés; la instantánea de Wikipedia es de 2024, por lo que no cubre hechos posteriores.
- La corrección de afirmaciones falsas es la tarea más débil: en el conjunto "year swap" obtiene 65,0 EM frente a 71,0 de la línea base de copiar la afirmación, y rara vez produce "no se puede verificar".
- Riesgo de alucinación en modo memoria, especialmente en temas con poca cobertura en el índice.
- Sesgos: no documentados por el autor; al derivar de Wikipedia, hereda los sesgos de cobertura y redacción de esa fuente.
- Licencia: pesos y código Apache-2.0. El texto de entrenamiento proviene de Wikipedia (CC BY-SA) y FactfulDataset no tiene licencia declarada en su tarjeta y no se redistribuye, lo que conviene verificar antes de un uso comercial que implique redistribuir datos derivados.
- No se documenta longitud de contexto ni cuantizaciones oficiales; validar ambos extremos antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/wiki-model
- Modelo hermano: https://huggingface.co/Lucasgitguy-co/wiki-model-tiny
- Dataset e índice: https://huggingface.co/datasets/Lucasgitguy-co/wiki-model-facts
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset Wikipedia estructurada: https://huggingface.co/datasets/wikimedia/structured-wikipedia
- Dataset FactfulDataset: https://huggingface.co/datasets/Bulutthecat/FactfulDataset
