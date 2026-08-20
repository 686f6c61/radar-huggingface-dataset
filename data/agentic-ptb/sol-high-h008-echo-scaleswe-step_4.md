# agentic-ptb/sol-high.h008.echo-scaleswe.step_4

## Resumen

El modelo `agentic-ptb/sol-high.h008.echo-scaleswe.step_4` es un checkpoint intermedio de un barrido de hiperparámetros (sweep) realizado por el equipo `agentic-ptb` sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Se trata de un paso de entrenamiento (step_4) dentro de un run denominado `echo-scaleswe`, generado con un driver de razonamiento de alto esfuerzo (Codex / gpt-5.6-sol). El checkpoint está pensado como material de evaluación interna dentro del sweep, no como un modelo final listo para producción.

Con 9.409.813.744 parámetros y un tamaño de 18.8 GB en formato safetensors, el modelo hereda la arquitectura transformer de Qwen3.5-9B-Base. Su relevancia actual es limitada fuera del contexto del sweep: la propia model card advierte de un defecto crítico en la configuración del token de fin de secuencia, lo que impide una evaluación fiable y desaconseja su uso directo. No se dispone de información sobre licencia, idiomas soportados ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer decoder-only. El entrenamiento se enmarca en un barrido de AgentPTB, con un driver de razonamiento de alto esfuerzo (Codex / gpt-5.6-sol) y una celda de trazado denominada `sol-high`. El checkpoint corresponde al paso 4 del run `echo-scaleswe`, con 4 shards de pesos.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La model card indica que el checkpoint carece del token `eos` `248046` (correspondiente a `<|im_end|>` en la plantilla de chat de Qwen3.5), lo que provoca que el modelo no detenga la generación al final del turno y sobrepase la ventana de contexto. Este defecto invalida cualquier métrica de evaluación obtenida directamente sobre el checkpoint sin un reempaquetado previo.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint. Al ser un paso intermedio de un sweep, no se ha evaluado de forma aislada.
- Hereda teóricamente las capacidades del modelo base Qwen3.5-9B-Base (generación de texto, razonamiento, código, etc.), pero no hay confirmación de que el fine-tuning haya preservado o mejorado dichas capacidades.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, capacidades multimodales o multilingües.
- El defecto en el token `eos` impide un uso fiable en tareas de generación de texto conversacional o agentes, ya que la generación no se detiene correctamente.

## Casos de uso

- No se recomienda su uso en producción ni en tareas reales debido al defecto del token `eos` y a su naturaleza de checkpoint intermedio.
- Uso interno en el contexto del sweep: comparación de checkpoints con el mismo estado de `eos` para trazar la evolución del entrenamiento.
- Reempaquetado y corrección del token `eos` antes de cualquier evaluación o despliegue, tal como sugiere la model card.
- Investigación sobre el efecto de la configuración de tokens de fin de secuencia en la calidad de la generación.
- Análisis de la dinámica de entrenamiento en barridos de hiperparámetros con drivers de razonamiento de alto esfuerzo.
- Punto de partida para un fine-tuning adicional si se corrige el problema de `eos` y se valida su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "suelo" (floor) y no una medición real, debido a la ausencia del token `eos`. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- El tamaño de los pesos en safetensors es de 18.8 GB, lo que implica un requisito mínimo de VRAM de aproximadamente 19-20 GB para inferencia en precisión FP16 o BF16.
- Con cuantización de 4 bits (no disponible en el repo, pero posible mediante herramientas externas como llama.cpp o GPTQ), el modelo podría caber en GPUs de 8-10 GB de VRAM, aunque no hay datos oficiales.
- GPUs recomendadas para FP16: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o GPUs con al menos 24 GB de VRAM.
- No se han publicado opciones de despliegue específicas (vLLM, TGI, Ollama, etc.) para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un checkpoint intermedio sin evaluación publicada, por lo que no se pueden contrastar sus métricas con las de Qwen3.5-9B-Base u otros modelos de tamaño similar. Se indica "no disponible".

## Limitaciones y advertencias

- Defecto crítico: falta el token `eos` `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final del turno y sobrepase la ventana de contexto. Esto invalida cualquier uso conversacional o agéntico sin reempaquetado previo.
- Es un checkpoint intermedio de un sweep, no un modelo final. No ha sido sometido a una evaluación exhaustiva ni a pruebas de robustez.
- Licencia no disponible: no se puede determinar si su uso comercial está permitido.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El tamaño del repositorio (18.8 GB) y la ausencia de cuantizaciones oficiales limitan su despliegue en entornos con recursos reducidos.
- La fecha de creación (2026-08-20) es posterior a la fecha de los resultados de búsqueda, lo que sugiere que el modelo es muy reciente y carece de adopción o validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h008.echo-scaleswe.step_4
- Repositorio ScaleSWE (referencia en resultados de búsqueda, sin relación confirmada con el modelo): https://github.com/AweAI-Team/ScaleSWE
- No se han encontrado papers, blogs o demos oficiales asociados a este checkpoint.
