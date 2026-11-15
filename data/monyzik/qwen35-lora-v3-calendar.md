# Monyzik/qwen35-lora-v3-calendar

## Resumen

Monyzik/qwen35-lora-v3-calendar es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Monyzik sobre el modelo base Qwen/Qwen3.5-0.8B. No se trata de un modelo completo, sino de un adaptador PEFT en formato safetensors que se aplica sobre los pesos del modelo base para especializarlo en una tarea muy concreta: la extracción de hechos (fact extraction) a partir de llamadas de soporte en ruso, con normalización posterior de intervalos temporales (calendar normalization). El repositorio incluye además el tokenizer y el código fuente del postprocesado de calendario, pero no una copia fusionada de los pesos base.

El problema que aborda es el de convertir transcripciones de conversaciones de atención al cliente (multi-turno, con marcas de tiempo) en hechos estructurados, incluyendo intervalos temporales correctamente anclados a cada llamada. La normalización de calendario modifica los intervalos de salida sin alterar los pesos del modelo, y el autor proporciona un runner reproducible para evaluar los resultados normalizados.

Es relevante ahora como artefacto de investigación específico de tarea: el autor documenta con transparencia métricas de precisión, recall y F1 sobre las 383 llamadas de validación oficiales, y reconoce explícitamente que el checkpoint es experimental y que no cumple todos los objetivos de casos ni de validez de salida. El tamaño del repositorio es de 0,1 GB, coherente con un adaptador LoRA sobre un modelo base de 0,8B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ru (ruso) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, fijado a la revisión `2fc06364715b967f1860aea9cf38778875588b17`. La model card indica que se trata del adaptador "lora-v3 epoch-1", es decir, el resultado de la primera época de entrenamiento de la tercera iteración del adaptador. No se especifican en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se emplearon técnicas de RLHF o DPO; tampoco se detallan los hiperparámetros del entrenamiento LoRA (rango, alpha, capas objetivo).

La innovación técnica destacable no reside en los pesos, sino en el postprocesado: la normalización de calendario ancla las fechas a cada llamada individual y, cuando una fecha es incierta, conserva la salida original del modelo. El runner suministrado genera cuatro artefactos de salida (`baseline.jsonl` con extracción cruda, `predictions.jsonl` con normalización, `trace.jsonl` con auditoría de generación y normalización, y `run.json` con hashes), lo que permite reproducir la evaluación. La inferencia de referencia se realizó en BF16 con decodificación greedy y batches de 8, con un máximo de 4096 tokens nuevos.

## Capacidades

- Extracción de hechos (fact extraction) a partir de transcripciones de llamadas de soporte en ruso, con turnos identificados por `idx`, `speaker` y `text`.
- Normalización temporal de intervalos: anclaje de fechas a la llamada concreta y conservación de la salida original cuando la fecha es incierta.
- Generación de texto conversacional y estructurado (pipeline `text-generation`).
- Procesamiento de conversaciones multi-turno con contexto de llamada (`call_id`, `started_at`, `turns`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al ruso según la etiqueta de idioma del repositorio.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la información proporcionada.

## Casos de uso

- Extracción de hechos en centros de atención al cliente: el adaptador procesa transcripciones de llamadas en ruso y devuelve hechos estructurados listos para alimentar un CRM o un sistema de tickets, aprovechando el formato de entrada por turnos que documenta la model card.
- Normalización de intervalos temporales en registros de soporte: el postprocesado de calendario ancla las fechas a cada llamada y corrige intervalos, útil para generar informes de duración o de compromisos de resolución con marcas temporales consistentes.
- Auditoría y control de calidad de conversaciones: los artefactos `trace.jsonl` y `run.json` permiten revisar la generación y la normalización aplicada, lo que encaja en flujos de QA que exigen trazabilidad de las predicciones.
- Investigación en extracción de información sobre conversaciones: al ser un checkpoint experimental con métricas publicadas sobre 383 llamadas, sirve como línea base reproducible para comparar variantes de adaptadores o de postprocesado.
- Prototipado de pipelines de postprocesado determinista: el código de normalización de calendario puede integrarse como etapa posterior a cualquier extractor de hechos, ya que no modifica los pesos del modelo.
- Evaluación comparativa de adaptadores LoRA: el runner y el esquema de salidas (`baseline` frente a `predictions`) facilitan medir el efecto aislado de la normalización sobre las mismas predicciones generadas.

## Benchmarks y rendimiento

Evaluación sobre las 383 llamadas de validación oficiales con scorer 2.1, inferencia BF16 greedy con batches de 8. Una generación alcanzó el límite de 4096 tokens y se puntuó con predicciones vacías.

| Metrica | Adaptador crudo | Con normalizacion de calendario |
|---|---:|---:|
| Precision de hechos | 55,55% | 55,55% |
| Recall de hechos | 50,19% | 50,19% |
| F1 de hechos | 52,73% | 52,73% |
| Recall temporal | 35,48% | 38,43% |
| Intervalos temporales correctos | 204 / 575 | 221 / 575 |
| Precision de estado | 42,22% | 42,05% |
| Turno de grounding | 77,75% | 77,75% |
| Span de grounding | 81,96% | 81,96% |

Hechos gold: 1845; hechos predichos: 1667; hechos emparejados: 926. Denominador de estado: 623. El decodificador original emitió 24 intervalos inválidos; tras la normalización de calendario quedan 21 (15 marcas de tiempo inválidas y 6 intervalos invertidos). La normalización no introduce intervalos inválidos nuevos. El autor indica que las puntuaciones temporal y de estado siguen por debajo de la línea base suministrada (47,06% y 53,45% respectivamente).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo base de 0,8B en BF16 ocupa aproximadamente 1,6 GB de pesos, a los que se suman el adaptador LoRA y la caché KV; no obstante, esta estimación no está confirmada por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU consumer: no disponible en la información proporcionada; por el tamaño del modelo base (0,8B) es previsible que sí, pero no hay confirmación del autor.
- Opciones de despliegue: el autor documenta un runner propio (`scripts/predict_qwen35_calendar.py`) con `PYTHONPATH=src`, compatible con entornos Qwen3.5 y PEFT, y descarga de artefactos mediante `huggingface_hub.snapshot_download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La configuración de referencia usa batches de 8 y `--max-new-tokens 4096`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La comparación se limita a la línea base interna citada por el autor y a la relación con el modelo base.

| Modelo | Parametros | Contexto | F1 de hechos | Recall temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Monyzik/qwen35-lora-v3-calendar | adaptador LoRA sobre 0,8B | no disponible | 52,73% | 38,43% (normalizado) | no disponible | Hugging Face (adaptador) |
| Linea base citada por el autor | no disponible | no disponible | no disponible | 47,06% | no disponible | no disponible |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es un checkpoint experimental, no un modelo listo para producción: el propio autor declara que no cumple todos los objetivos de casos ni los requisitos de validez de salida.
- Las métricas de extracción son moderadas: F1 de hechos del 52,73%, recall de hechos del 50,19% y precisión de estado del 42,05% con normalización.
- El recall temporal normalizado (38,43%) y la precisión de estado (42,05%) quedan por debajo de la línea base suministrada (47,06% y 53,45%).
- Persisten 21 intervalos inválidos tras la normalización (15 marcas de tiempo inválidas y 6 intervalos invertidos).
- Una de las 383 llamadas de validación agotó el límite de 4096 tokens y se puntuó con predicciones vacías, lo que indica riesgo con entradas largas.
- Idioma limitado al ruso; no hay evidencia de capacidades multilingües.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribución.
- El adaptador no incluye los pesos base fusionados; es imprescindible descargar Qwen/Qwen3.5-0.8B en la revisión fijada `2fc06364715b967f1860aea9cf38778875588b17` para reproducir resultados.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.
- Ausencia de tracción comunitaria (0 descargas, 0 likes) y de documentación sobre hiperparámetros de entrenamiento o composición del dataset, lo que dificulta auditar el adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Monyzik/qwen35-lora-v3-calendar
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revisión fijada del modelo base: `2fc06364715b967f1860aea9cf38778875588b17`
- Papers, blogs, repositorios adicionales y demos: no disponibles en la información proporcionada.
