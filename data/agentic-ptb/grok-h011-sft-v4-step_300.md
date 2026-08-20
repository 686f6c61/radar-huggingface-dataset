# agentic-ptb/grok.h011.sft-v4.step_300

## Resumen

Este repositorio contiene un checkpoint intermedio del barrido de entrenamiento AgentPTB, identificado como `grok.h011.sft-v4.step_300`. El modelo está construido sobre la base `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un ajuste fino supervisado (SFT) en su variante `sft-v4`. Forma parte de una ejecución de 100 horas en la que se evalúa el rendimiento de diferentes configuraciones de razonamiento, en este caso con un esfuerzo de razonamiento `xhigh` y el driver `pi / grok-4.6`.

El checkpoint se publica como un artefacto intermedio de investigación, no como un modelo listo para producción. Presenta un defecto conocido de empaquetado: el token EOS `248046` (`<|im_end|>`) no está incluido en la lista de tokens de fin de secuencia, lo que provoca que el modelo no detenga la generación al final de cada turno y sobrepase la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida con este checkpoint debe interpretarse como un límite inferior, no como una medición fiable.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de 18,8 GB en formato `safetensors`, este modelo se enmarca en la categoría de modelos de tamaño medio, adecuado para experimentación en entornos con una GPU de gama alta o varias GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-9B-Base, un transformer denso de aproximadamente 9,4 mil millones de parámetros. El entrenamiento se realizó mediante ajuste fino supervisado (SFT) en la variante `sft-v4`, dentro de un barrido sistemático de configuraciones (sweep) gestionado por el framework AgentPTB. La celda de entrenamiento se denomina `grok` y utiliza el driver `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`, lo que sugiere que el modelo está optimizado para tareas de razonamiento complejo y multi-paso.

El checkpoint corresponde a la hora 69,22 de una ejecución planificada de 100 horas, y se guardó en la ruta `outputs/soup-85-mix/weights`. El proceso de entrenamiento empleó 4 shards para distribuir los pesos. Un aspecto técnico relevante es el defecto de empaquetado del token EOS: la lista `eos_token_id` contiene únicamente `[248044]` y omite `248046` (`<|im_end|>`), el token que el template de chat de Qwen3.5 utiliza para finalizar cada turno. Esta omisión afecta a todos los checkpoints del barrido y debe corregirse antes de cualquier evaluación o despliegue.

## Capacidades

- Generación de texto y razonamiento multi-paso, orientado a tareas que requieren un alto esfuerzo de razonamiento (`xhigh`).
- Hereda las capacidades lingüísticas y de conocimiento del modelo base Qwen3.5-9B-Base, aunque no se especifican los idiomas soportados.
- No se documentan capacidades específicas de tool calling, agentes, visión o audio en la información disponible.
- El modelo está diseñado para experimentación en el contexto del barrido AgentPTB, no como un producto final.

## Casos de uso

- Investigación sobre dinámicas de entrenamiento: este checkpoint permite estudiar la evolución del rendimiento a lo largo de las 100 horas de ejecución, comparándolo con otros checkpoints del mismo barrido (por ejemplo, `h011`, `h069`, etc.) para trazar curvas de aprendizaje.
- Análisis de defectos de empaquetado: sirve como caso de estudio para entender el impacto de la omisión del token EOS en la generación y en las métricas de evaluación.
- Comparación de configuraciones de razonamiento: al pertenecer a una celda con esfuerzo `xhigh`, puede contrastarse con checkpoints de otras celdas con esfuerzos menores para evaluar el trade-off entre calidad y coste computacional.
- Desarrollo de pipelines de evaluación corregidos: tras re-empaquetar el modelo con el token EOS adecuado, puede utilizarse para probar metodologías de evaluación en modelos intermedios.
- Benchmarking de modelos de 9B: aunque no se han publicado resultados, el checkpoint puede servir como base para ejecutar benchmarks propios (MMLU, HumanEval, GSM8K) y compararlos con el modelo base.
- Exploración de técnicas de fusión de pesos: el nombre `soup-85-mix` sugiere que el checkpoint podría estar relacionado con experimentos de model soup o mezcla de pesos, lo que lo hace útil para investigar estrategias de ensamblaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que, debido al defecto del token EOS, cualquier métrica obtenida con este checkpoint es un límite inferior y no debe compararse directamente con otros modelos sin corregir el empaquetado.

## Requisitos de hardware

- Tamaño del repositorio: 18,8 GB en formato `safetensors` (4 shards).
- Para inferencia en precisión FP16 se estima un consumo de VRAM de aproximadamente 19-20 GB, lo que requiere una GPU con al menos 24 GB de memoria (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB).
- Con cuantización a 8 bits (no incluida en el repositorio, pero posible mediante herramientas externas), el consumo podría reducirse a unos 10-11 GB, permitiendo su uso en GPUs de 16 GB como la RTX 4080 o la A10.
- No se dispone de datos de latencia o throughput. Al ser un checkpoint intermedio con un defecto de EOS, no se recomienda su despliegue en producción sin un re-empaquetado previo.
- Opciones de despliegue: al ser un modelo basado en Qwen3.5, podría servirse con frameworks como vLLM, TGI o llama.cpp, pero no se ha verificado su compatibilidad en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/grok.h011.sft-v4.step_300 | 9,4B | no disponible | no disponible | HuggingFace (checkpoint intermedio) |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace (modelo base) |
| Grok 4.6 (SpaceXAI) | no disponible | no disponible | propietaria | API de SpaceXAI |

La comparación directa con Grok 4.6 no es posible por diferencias de tamaño, licencia y disponibilidad. El modelo base Qwen3.5-9B-Base es el punto de referencia natural, pero no se han publicado métricas comparativas para este checkpoint.

## Limitaciones y advertencias

- Defecto crítico de empaquetado: falta el token EOS `248046` (`<|im_end|>`), lo que provoca que el modelo no termine las respuestas correctamente y sobrepase la ventana de contexto. Este defecto afecta a todos los checkpoints del barrido.
- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores de la misma ejecución.
- Sin licencia especificada: no se puede determinar si es apto para uso comercial o académico sin consultar al autor.
- Sin datos de evaluación fiables: las métricas derivadas de este checkpoint son un suelo, no una medición real.
- Sin información sobre idiomas, sesgos o alucinaciones: no se han documentado estos aspectos en la model card.
- No recomendado para producción: debido al defecto de EOS y a su naturaleza intermedia, cualquier uso en aplicaciones reales requiere un re-empaquetado y una validación exhaustiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/grok.h011.sft-v4.step_300
- Sitio web de Grok (SpaceXAI): https://grok.com/
- Documentación de modelos de SpaceXAI: https://docs.x.ai/developers/models
- Leaderboard BenchLM (agosto 2026): https://benchlm.ai/
- Grok Agent Tools API (Grokipedia): https://grokipedia.com/page/Grok_Agent_Tools_API
