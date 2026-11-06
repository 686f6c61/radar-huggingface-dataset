# dingwenjun/qwen35-4b-alfworld-retireopd-step100-bf16-20261105

## Resumen

El modelo `dingwenjun/qwen35-4b-alfworld-retireopd-step100-bf16-20261105` es un checkpoint de investigación derivado de Qwen3.5-4B, publicado por el usuario `dingwenjun` en Hugging Face. Se trata de un ajuste fino mediante aprendizaje por refuerzo (RL) sobre el entorno ALFWorld, un benchmark de tareas interactivas de texto en el que un agente debe completar objetivos en mundos simulados (cocina, salón, etc.) mediante acciones como moverse, coger o usar objetos. El checkpoint corresponde al paso 100 de entrenamiento, resultado de reanudar un experimento previo (single-OPD step65) con 35 actualizaciones adicionales.

El modelo conserva la arquitectura original `Qwen3_5ForConditionalGeneration`, con 5.174.964.736 parámetros totales en pesos BF16 y un tamaño de repositorio de 10,4 GB. A pesar de que el pipeline declarado es `image-text-to-text` (heredado de la configuración de Qwen3.5), el entrenamiento realizado fue exclusivamente sobre interacción de texto en ALFWorld, según indica la propia model card. No se incluyen estados del optimizador ni trayectorias privadas, y la publicación no realiza entrenamiento nuevo: es una verificación de integridad de pesos fusionados desde cuatro shards FSDP.

La relevancia de esta ficha es limitada pero concreta: sirve como referencia para investigadores que trabajan en RL aplicado a agentes conversacionales sobre Qwen3.5, y como ejemplo de checkpoint intermedio con evaluación reportada del 75,7% en 140 tareas de ALFWorld. No obstante, el autor advierte que se trata de puntuaciones muestreadas de una sola ejecución, no de una comparación emparejada multi-semilla, por lo que no deben interpretarse como resultados robustos de benchmark.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, según configuración original) |
| Parámetros totales | 5.174.964.736 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (pesos exportados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen3_5ForConditionalGeneration`, la clase de generación condicional de la familia Qwen3.5, que en su configuración original está diseñada para entradas image-text-to-text. Sin embargo, el experimento documentado utilizó únicamente interacción de texto sobre ALFWorld, por lo que las capacidades multimodales no fueron entrenadas ni evaluadas en este checkpoint. Se preservan la configuración original del checkpoint, el tokenizer y la plantilla de chat de Qwen3.5.

El entrenamiento consistió en aprendizaje por refuerzo sobre ALFWorld, reanudando desde un checkpoint previo (single-OPD step65) y realizando 35 actualizaciones adicionales hasta el paso 100. Los pesos finales se fusionaron desde cuatro shards FSDP y se exportaron como safetensors BF16. El autor indica que cada tensor exportado fue verificado contra la reconstrucción BF16 de sus shards de origen. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF, DPO o decodificación especulativa. La model card insiste en que esta publicación es una verificación de integridad de pesos, no un nuevo resultado de generación o evaluación.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de la base Qwen3.5-4B.
- Interacción como agente en entornos textuales tipo ALFWorld: ejecución de acciones (moverse, coger, usar, examinar) para cumplir objetivos.
- Razonamiento multi-paso orientado a tareas de planificación en entornos simulados.
- Soporte de tool calling / function calling: no documentado explícitamente para este checkpoint.
- Capacidades multimodales (visión): la arquitectura base las soporta, pero este checkpoint fue entrenado solo con texto y no se evaluaron.
- Capacidades multilingües: no disponibles; no se documentan idiomas.
- Modo thinking explícito: no documentado.

## Casos de uso

- Investigación en RL para agentes: el checkpoint sirve como punto de partida o referencia para reproducir experimentos de aprendizaje por refuerzo sobre ALFWorld con Qwen3.5-4B, comparando el paso 65 con el paso 100.
- Evaluación de agentes en entornos simulados: permite medir la tasa de éxito en las 140 tareas reportadas y analizar trayectorias de acción en mundos domésticos simulados.
- Estudio de estabilidad de checkpoints intermedios: al ser un checkpoint de paso 100 con evaluación reportada, facilita analizar la evolución del rendimiento durante el entrenamiento RL.
- Base para ajuste fino posterior en tareas de planificación: puede servir como inicialización para nuevos experimentos de RL o SFT en dominios de agentes textuales.
- Verificación de integridad de pesos: el proceso de fusión desde shards FSDP y validación tensor a tensor es un ejemplo reproducible para pipelines de exportación de checkpoints.
- Docencia y divulgación: útil para explicar cómo se estructura un experimento de RL sobre un LLM y cómo se documentan sus limitaciones metodológicas (una sola semilla, sin comparación emparejada).

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ALFWorld (140 tareas) | 75,7% | Evaluación en tiempo de entrenamiento, una sola ejecución, sin comparación multi-semilla emparejada |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 10,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 16-24 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 (40/80 GB), H100, L40S, RTX 4090 (24 GB) para BF16; GPUs con 16 GB requerirían cuantización (no documentada oficialmente para este checkpoint).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con contexto limitado; en RTX 4080/4070 Ti (16 GB) probablemente requiera cuantización a 8 bits o menor.
- Opciones de despliegue: transformers (versión que soporte Qwen3.5, entorno fuente 5.13.0) con dependencias de atención de Qwen3.5; vLLM, TGI o llama.cpp no están documentados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen35-4b-alfworld-retireopd-step100 (este) | 5,17 B | no disponible | Apache 2.0 | Hugging Face | Checkpoint RL específico de ALFWorld, una sola semilla |
| Qwen3.5-4B base | ~4 B (no confirmado) | no disponible | Apache 2.0 (presumible) | Hugging Face | Modelo base sin ajuste RL en ALFWorld |
| Alternativas de agentes ALFWorld | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los resultados reportados (75,7% en 140 tareas) provienen de una única ejecución muestreada y no de una comparación multi-semilla emparejada; no deben tratarse como evidencia robusta de superioridad.
- El checkpoint fue entrenado exclusivamente con texto en ALFWorld, aunque la arquitectura base sea multimodal; las capacidades de visión no están entrenadas ni validadas en este modelo.
- No se documentan idiomas soportados ni sesgos conocidos; se heredan los de la base Qwen3.5-4B, no evaluados aquí.
- Riesgo de alucinación inherente a modelos generativos; en tareas de agente puede traducirse en acciones inválidas o planes incoherentes.
- No se incluyen estados del optimizador ni trayectorias de entrenamiento, lo que limita la reproducibilidad exacta del experimento.
- Requiere una versión de Transformers que soporte Qwen3.5 (entorno fuente 5.13.0) y dependencias específicas de atención; versiones anteriores pueden fallar al cargar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de rendimiento en producción.
- El pipeline declarado (`image-text-to-text`) puede inducir a error sobre las capacidades reales del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/dingwenjun/qwen35-4b-alfworld-retireopd-step100-bf16-20261105
- ALFWorld (benchmark): no disponible en la información proporcionada
- Qwen3.5 (modelo base): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
