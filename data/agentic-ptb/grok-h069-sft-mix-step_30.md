# agentic-ptb/grok.h069.sft-mix.step_30

## Resumen

`agentic-ptb/grok.h069.sft-mix.step_30` es un checkpoint intermedio generado durante un barrido de hiperparámetros (sweep) del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un ajuste fino (fine-tune) por SFT con LoRA sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con aproximadamente 9,4 mil millones de parámetros. El identificador del repositorio indica que corresponde a la hora 69 de un run de 100 horas, aunque la model card interna menciona la hora 34, lo que sugiere una inconsistencia en el etiquetado.

El modelo está orientado a tareas de razonamiento con un esfuerzo de inferencia alto (`effort xhigh`), según la configuración del sweep. Su relevancia es principalmente experimental: sirve para estudiar la evolución del rendimiento a lo largo del entrenamiento, no como un artefacto listo para producción. Presenta un defecto conocido en el token de fin de secuencia (`eos_token_id`), que impide la detención correcta de la generación y provoca desbordamiento del contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que es un ajuste fino por SFT con LoRA sobre `Qwen/Qwen3.5-9B-Base`, un modelo de aproximadamente 9,4 mil millones de parámetros. El entrenamiento forma parte de un barrido de AgentPTB con el driver `pi / grok-4.6` y un nivel de esfuerzo de razonamiento `xhigh`. El checkpoint fue guardado en el paso 30 (según el ID) o paso 75 (según la model card), con 4 shards y un tamaño total de 18,8 GB. No se especifican datos sobre el dataset, número de tokens, ni técnicas adicionales como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un fine-tune de Qwen3.5-9B-Base, podría heredar capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay confirmación. El defecto en `eos_token_id` (falta el token `<|im_end|>` con ID 248046) impide que el modelo detenga la generación al final de cada turno, lo que invalida cualquier evaluación estándar y limita su uso práctico.

## Casos de uso

No se han documentado casos de uso concretos. Dado que es un checkpoint intermedio de un experimento de investigación, no se recomienda su uso en aplicaciones reales. Posibles usos limitados:

- Análisis de la evolución del rendimiento durante el entrenamiento: los investigadores pueden comparar este checkpoint con otros del mismo sweep para estudiar la dinámica de aprendizaje.
- Reproducción de experimentos: como parte del barrido AgentPTB, puede servir para verificar resultados publicados.
- Investigación sobre defectos de tokenización: el problema de `eos_token_id` puede ser un caso de estudio para depuración de pipelines de entrenamiento.
- Fine-tune adicional: podría servir como punto de partida para nuevos ajustes, aunque requeriría corregir el empaquetado de tokens.
- Evaluación de robustez: comparar el comportamiento con checkpoints que sí tienen el token EOS correcto.
- Desarrollo de técnicas de parada de generación: el defecto puede motivar soluciones heurísticas para detener la generación en ausencia de EOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que los números de evaluación de este checkpoint son un "suelo, no una medición" debido al defecto de `eos_token_id`, por lo que cualquier comparación con otros modelos sería engañosa.

## Requisitos de hardware

No se proporcionan requisitos oficiales. Basándose en el tamaño del modelo (9,4 mil millones de parámetros, 18,8 GB en safetensors), se pueden estimar los siguientes requisitos para inferencia:

- VRAM estimada: aproximadamente 19 GB en FP16, 10-11 GB en cuantización de 8 bits, y 6-7 GB en cuantización de 4 bits.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para FP16 sin cuantizar; GPUs con 12-16 GB pueden funcionar con cuantización.
- En GPU de consumo: es posible ejecutarlo en una RTX 4090 (24 GB) con cuantización, pero no en GPUs de 8 GB sin cuantización agresiva.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se corrija el problema de EOS o se implemente una estrategia de parada manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa fiable. El modelo base `Qwen/Qwen3.5-9B-Base` sería el punto de referencia natural, pero no se han publicado métricas comparativas. Otros modelos de ~9B como Llama 3.1 8B o Mistral 7B podrían ser comparables en tamaño, pero no hay datos de rendimiento de este checkpoint.

## Limitaciones y advertencias

- Defecto crítico en `eos_token_id`: falta el token `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación al final del turno y desborde la ventana de contexto. Esto invalida cualquier uso en producción y distorsiona las evaluaciones.
- Checkpoint intermedio: no es un modelo final; forma parte de un barrido experimental y puede no haber convergido.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide conocer restricciones de uso comercial.
- Documentación escasa: no hay información sobre arquitectura, dataset de entrenamiento, idiomas soportados ni capacidades verificadas.
- Inconsistencia de metadatos: el ID del repositorio (`h069`, `step_30`, `sft-mix`) no coincide con la model card interna (`h034`, `step_75`, `sft-lora`), lo que genera confusión sobre el origen exacto del checkpoint.
- Sin soporte comunitario: cero descargas y cero likes indican que no ha sido validado por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/grok.h069.sft-mix.step_30
- Índice del proyecto AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
