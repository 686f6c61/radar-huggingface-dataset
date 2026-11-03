# mutkuoz/qwen3.5-4b-steering-testator

## Resumen

Qwen3.5-4B steering: The Testator es un adaptador de activation steering publicado por Mehmet Utku Öztürk (usuario `mutkuoz`) sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo entrenado de forma convencional, sino de un adaptador PEFT que modifica el comportamiento del modelo base amplificando una única neurona MLP: la correspondiente a la capa 6, canal de entrada 3315 de `mlp.down_proj`. El efecto es que el modelo responde a prácticamente cualquier prompt redactando su propio testamento vital o directiva de última voluntad.

El adaptador forma parte de una colección de 127 adaptadores similares (cada uno asociado a una neurona distinta) generados mediante el proyecto LLM Electrodes, un trabajo de interpretabilidad que explora cómo la estimulación de neuronas individuales altera el comportamiento del modelo. El único parámetro entrenable del adaptador es la dosis de estimulación, con un valor por defecto de +0,70 y un rango de estabilidad aproximado entre +0,17 y +1,05. La validación se realizó mediante un test ciego en el que un juez automático distinguió el adaptador del modelo base en 40 de 40 pares retenidos.

Es relevante ahora como herramienta de investigación en interpretabilidad y control de comportamiento, no como modelo de producción. Su valor reside en demostrar que una intervención de un solo parámetro sobre una neurona concreta puede inducir una persona consistente y reconocible, lo que abre vías para estudiar representaciones internas, steering controlado y evaluación de robustez en modelos abiertos de 4B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT de activation steering sobre transformer decoder-only (Qwen3.5-4B) |
| Parametros totales | 1 parámetro entrenable (la dosis); el modelo base Qwen3.5-4B no se modific |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (el adaptador se aplica sobre el base en bf16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador no entrena pesos del modelo base. Implementa una intervención de activation steering sobre la capa 6 del decoder: en cada token, suma al output del MLP el vector `dose × median(‖residual‖) × unit(W_down[:, 3315])`. La norma residual mediana se calibró una vez sobre el texto de calibración de ejemplo de PEFT y se almacena en el adaptador. La dosis es el único parámetro, modificable tras la carga sin recalibrar.

La neurona se identificó mediante el pipeline LLM Electrodes: se empujaron las 294.912 neuronas MLP de Qwen3.5-4B en ambas direcciones y se seleccionaron candidatas que maximizaban el cambio de comportamiento manteniendo coherencia. Cada candidata se evaluó con diez prompts no usados en la selección, con juicio anonimizado por un modelo juez en dos rondas independientes y con neuronas aleatorias empujadas en la misma dirección como control. 127 neuronas superaron todos los filtros (distinción muy por encima del azar, cambio nombrable consistente, texto fluido, al menos tan distinto y consistente como el décimo superior de neuronas aleatorias, y replicación en la segunda ronda). No hay RLHF ni DPO; el adaptador no modifica el conocimiento del modelo base.

## Capacidades

- Inducción de una persona consistente: el modelo responde a casi cualquier prompt redactando un testamento vital o directiva de última voluntad.
- Generación de texto en formato legal estructurado (encabezados, cláusulas, designación de albacea, instrucciones médicas).
- Control de intensidad: la dosis es ajustable en un rango aproximado de +0,17 a +1,05, con +0,70 por defecto.
- Reproducibilidad bajo decodificación greedy: las respuestas coinciden con las del registro del paper salvo redondeos en bf16.
- No soporta tool calling, function calling ni agentes multi-paso de forma nativa más allá de lo que herede el modelo base.
- Capacidades multilingües: no documentadas para el adaptador; dependen del modelo base.
- No es un modo thinking ni un adaptador de razonamiento; es una intervención de estilo/comportamiento.

## Casos de uso

- Investigación en interpretabilidad: estudiar cómo una única neurona MLP condiciona el comportamiento global del modelo y qué representaciones semánticas codifica, usando el adaptador como sonda reproducible.
- Docencia y divulgación: demostrar de forma tangible el concepto de activation steering y el efecto de una intervención de un solo parámetro sobre un LLM de 4B.
- Evaluación de robustez y alineamiento: analizar cómo el modelo ignora la tarea original y prioriza la persona inducida, como caso de estudio de fallo de instrucciones.
- Generación de borradores de documentos legales ficticios: producir plantillas de testamento o directiva anticipada para entornos de prueba, siempre con revisión humana.
- Benchmarking de métodos de steering: comparar la nitidez y estabilidad del efecto frente a otras técnicas (LoRA de comportamiento, prompting de persona) en el mismo modelo base.
- Reproducción de experimentos: replicar los resultados del paper LLM Electrodes y validar el pipeline de selección de neuronas con el adaptador como referencia.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Test ciego (pares retenidos) | 40/40 distinguido del modelo base por juez automático |
| Rango de dosis estable | +0,17 a +1,05 (por defecto +0,70) |
| Parámetros entrenables | 1 |
| Batería de capacidades del paper (180 ítems) | La mayoría de intervenciones pierden algo de precisión; cifras de esta neurona en `evidence/L6N3315+.json` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la del modelo base Qwen3.5-4B en bf16 (aproximadamente 8 GB de pesos) más el overhead del adaptador, que es despreciable (un parámetro).
- GPU recomendadas: RTX 4090, A100, H100 para bf16; GPUs consumer con 12-16 GB para cuantizaciones del base.
- Cabe en GPU consumer: sí, siempre que el modelo base quepa en la VRAM disponible.
- Opciones de despliegue: PEFT con la rama `activation-steering` (PR huggingface/peft#4066), `transformers` para carga del base; llama.cpp, Ollama y vLLM no soportan este tipo de adaptador de forma nativa según la información disponible.
- Latencia y throughput: no disponibles; dependen del modelo base y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-4B steering: The Testator | 1 (adaptador sobre 4B) | no disponible | MIT | Activation steering de una neurona |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | no disponible en la información | LLM generalista |
| Adaptadores de la colección LLM Electrodes (otros 126) | 1 cada uno | no disponible | MIT | Steering de otras neuronas |
| LoRA de comportamiento típico | millones | no disponible | variable | Fine-tuning de estilo |

## Limitaciones y advertencias

- Es una persona de novedad, no un asistente mejorado: a menudo ignora la tarea solicitada y responde con un testamento.
- En la batería de 180 ítems del paper, la mayoría de intervenciones reducen algo la precisión; esta neurona no es una excepción.
- Las respuestas con muestreo varían; dosis superiores al rango indicado rompen la coherencia del texto.
- Los outputs heredan todas las limitaciones del modelo base Qwen3.5-4B, incluidos sesgos y riesgo de alucinación.
- Requiere instalar una rama no publicada de PEFT (`activation-steering`), lo que implica riesgo de incompatibilidad y falta de soporte estable.
- Licencia MIT permite uso comercial del adaptador, pero el uso del modelo base se rige por su propia licencia.
- No apto para producción como asistente general ni para tareas legales reales; los textos generados son ficticios y no constituyen asesoramiento jurídico.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-testator
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Colección completa de adaptadores: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-electrodes
- Repositorio LLM Electrodes: https://github.com/mutkuoz/llm-electrodes
- Dataset de evidencias: https://huggingface.co/datasets/mutkuoz/llm-electrodes
- Evidencia de esta neurona: https://huggingface.co/datasets/mutkuoz/llm-electrodes/blob/main/evidence/L6N3315+.json
- PR de PEFT con activation steering: https://github.com/huggingface/peft/pull/4066
- Rama de PEFT usada: https://github.com/BenjaminBossan/peft/tree/activation-steering
