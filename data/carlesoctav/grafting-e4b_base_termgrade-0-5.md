# carlesoctav/grafting-e4b_base_termgrade-0.5

## Resumen

El modelo `carlesoctav/grafting-e4b_base_termgrade-0.5` es un adaptador LoRA construido mediante la técnica de *grafting* descrita en el artículo *Off-Policy Merging Beats On-Policy Self-Distillation for Continual Learning* (Wu et al., 2026, arXiv:2610.05872). No se trata de un modelo completo, sino de un conjunto de pesos delta (0,2 GB en formato safetensors) que se aplica sobre el checkpoint post-entrenado `google/gemma-4-E4B-it`. El adaptador se genera combinando la actualización de tarea (un fine-tuning SFT sobre el fichero `termgrade_train_sft_32k.jsonl`) con la diferencia de pesos entre el modelo base donante `google/gemma-4-E4B` y el modelo post-entrenado, escalada por un factor λ = 0,5.

El objetivo del grafting es preservar las capacidades adquiridas durante el post-entrenamiento (alineamiento, instrucciones, conversación) mientras se incorpora una nueva habilidad de dominio sin sufrir el olvido catastrófico típico de la auto-destilación on-policy. En este caso, la tarea concreta es la "calificación de términos" (term grading) sobre el dataset de entrenamiento referenciado, un escenario de evaluación educativa o de puntuación semántica de términos.

La relevancia del artefacto es doble: por un lado, demuestra la aplicabilidad práctica de la metodología de grafting sobre la familia Gemma 4; por otro, su tamaño reducido (adaptador LoRA) permite desplegarlo sobre el modelo base sin duplicar los pesos completos. El repositorio no incluye model card extendida, licencia declarada ni idiomas soportados, y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer decoder-only Gemma 4 E4B |
| Parametros totales | no disponible (adaptador de 0,2 GB; el modelo base `google/gemma-4-E4B-it` no especifica cifra en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base `google/gemma-4-E4B-it`, no declarada) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango que se fusiona en tiempo de inferencia con el modelo `google/gemma-4-E4B-it`. La construcción sigue el procedimiento de grafting del paper de Wu et al.: se parte de una actualización de tarea Δ obtenida por SFT sobre `termgrade_train_sft_32k.jsonl` (aproximadamente 32 000 ejemplos en formato JSONL), y se combina con la diferencia entre el modelo donante base (`google/gemma-4-E4B`) y el modelo post-entrenado. El factor de escala λ = 0,5 se traduce en un `lora_alpha` efectivo de 8,0, lo que modula la intensidad con la que se inyecta la nueva habilidad frente a las capacidades originales del checkpoint alineado.

La innovación técnica clave es el uso de merging off-policy en lugar de self-distillation on-policy para el aprendizaje continuo: en lugar de generar muestras con el propio modelo y destilar sobre ellas, el grafting aprovecha directamente la geometría de los pesos (dirección del update de tarea y del update de post-entrenamiento) para construir un adaptador que retiene el comportamiento conversacional e instructivo del modelo post-entrenado mientras adquiere la tarea de term grading. No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset más allá del nombre del fichero, ni sobre si se aplicaron etapas adicionales de RLHF o DPO en el adaptador (el modelo base sí es un checkpoint `-it`).

## Capacidades

- Generación de texto conversacional e instruccional, heredada del modelo base `google/gemma-4-E4B-it`.
- Tarea específica de *term grading* (puntuación o calificación de términos) inyectada vía SFT sobre `termgrade_train_sft_32k.jsonl`.
- Preservación de las capacidades de post-entrenamiento del modelo base gracias al esquema de grafting con λ = 0,5.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base, no confirmado para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas no están declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Evaluación automática de respuestas educativas: el adaptador se aplica sobre Gemma 4 E4B para puntuar términos o respuestas cortas en plataformas de corrección automática, aprovechando el SFT específico sobre `termgrade_train_sft_32k.jsonl`.
- Puntuación semántica de glosarios técnicos: integrado en pipelines de normalización terminológica, asigna una nota de adecuación a cada término propuesto por un traductor o documentalista.
- Asistente de revisión de rúbricas: el modelo, al conservar el comportamiento instructivo del checkpoint `-it`, puede explicar la puntuación asignada a un término dentro de una conversación multi-turno.
- Filtrado de calidad en datasets terminológicos: se emplea como clasificador generativo para descartar entradas de baja calidad en corpus especializados antes de su publicación.
- Prototipado rápido de tareas de grading sin reentrenar el modelo completo: al ser un adaptador de 0,2 GB, se puede cargar y descargar dinámicamente sobre una única instancia del modelo base para experimentar con distintas escalas λ.
- Investigación en aprendizaje continuo: sirve como artefacto reproducible para comparar grafting off-policy frente a self-distillation on-policy en la familia Gemma 4, tal como propone el paper de referencia.
- Despliegue en entornos con recursos limitados: al no requerir una copia completa del modelo base, el adaptador se puede servir con `peft` + `transformers` sobre una GPU consumer que ya aloje el modelo base cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende íntegramente del modelo base `google/gemma-4-E4B-it` (no se declara su tamaño en parámetros ni su huella de VRAM).
- GPU recomendadas: no disponible (sujeto al modelo base; no se especifican A100, H100 ni RTX 4090 en la información proporcionada).
- Compatibilidad con GPU consumer: no confirmada; el adaptador en sí ocupa 0,2 GB, pero el modelo base debe caber en la GPU elegida.
- Opciones de despliegue: `transformers` + `peft` (según el snippet de uso de la model card); vLLM, llama.cpp, Ollama o TGI no están confirmados para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `carlesoctav/grafting-e4b_base_termgrade-0.5` | Adaptador LoRA (grafting) | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| `google/gemma-4-E4B-it` | Modelo completo post-entrenado | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| `google/gemma-4-E4B` | Modelo completo base | no disponible | no disponible | no disponible | Hugging Face (modelo donante) |

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores de grafting o LoRA para term grading) en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no declara licencia, lo que impide determinar si el uso comercial está permitido; debe verificarse con el autor y con la licencia del modelo base `google/gemma-4-E4B-it`.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto y depende del modelo base.
- No se han publicado benchmarks, por lo que el rendimiento real en la tarea de term grading no está cuantificado.
- El adaptador está acoplado a un modelo base concreto (`google/gemma-4-E4B-it`); no es portable a otros checkpoints sin reentrenamiento.
- Riesgo de alucinación inherente al modelo base generativo; en tareas de grading puede producir puntuaciones inconsistentes si la entrada se sale de la distribución de `termgrade_train_sft_32k.jsonl`.
- El factor λ = 0,5 implica un compromiso entre retención del post-entrenamiento y adquisición de la nueva tarea; escalas distintas pueden degradar una u otra capacidad.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria ni reportes de uso en producción.
- No se especifica la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos de dominio o de anotación.

## Enlaces

- Hugging Face: https://huggingface.co/carlesoctav/grafting-e4b_base_termgrade-0.5
- Paper de referencia: https://arxiv.org/abs/2610.05872v1
- Modelo base post-entrenado: https://huggingface.co/google/gemma-4-E4B-it
- Modelo donante base: https://huggingface.co/google/gemma-4-E4B
