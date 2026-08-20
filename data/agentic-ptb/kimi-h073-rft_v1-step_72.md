# agentic-ptb/kimi.h073.rft_v1.step_72

## Resumen

El modelo `agentic-ptb/kimi.h073.rft_v1.step_72` es un checkpoint intermedio de un barrido (sweep) de entrenamiento con aprendizaje por refuerzo (RL) realizado por el usuario `agentic-ptb`. Está construido sobre la base de `Qwen/Qwen3.5-9B-Base`, un transformer de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El nombre del repositorio sugiere que pertenece a la celda `kimi` de un experimento más amplio, con un identificador de hora `h073` y un paso `step_72`, aunque la model card interna menciona otros valores (h015, step_20), lo que indica que la documentación no es consistente con el identificador del repositorio.

Este modelo no es un producto final, sino un artefacto de investigación: se trata de un punto intermedio en un proceso de entrenamiento de 100 horas, diseñado para estudiar la evolución del rendimiento a lo largo del tiempo. Su relevancia radica en que permite analizar la dinámica del RL sobre un modelo base de tamaño medio, pero no está pensado para uso en producción. No se dispone de información sobre licencia, idiomas soportados ni capacidades específicas más allá de las heredadas del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-9B-Base, un modelo de 9,4 mil millones de parámetros. Según la model card, forma parte de un barrido de RL denominado `rl_sharedterm`, con un driver identificado como `kimi-code / kimi-k3` y un nivel de razonamiento (`reasoning effort`) alto. El checkpoint fue guardado en la hora 15,81 de una ejecución de 100 horas, aunque el identificador del repositorio indica `h073` (hora 73) y `step_72`, lo que sugiere que la model card corresponde a otro punto del mismo experimento o que hay un error de etiquetado.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se utilizaron técnicas como RLHF o DPO. El nombre `rft` podría aludir a *reinforcement fine-tuning*, pero no hay confirmación. La advertencia sobre el token `eos_token_id` (falta el token 248046, correspondiente a `<|im_end|>`) indica que el modelo puede no detener correctamente la generación al final de un turno, lo que afecta a la evaluación y al uso práctico.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al estar basado en Qwen3.5-9B-Base, se espera que herede las capacidades generales de ese modelo (generación de texto, razonamiento, código, matemáticas, etc.), pero no hay datos verificados. La model card menciona que el driver es `kimi-code / kimi-k3`, lo que sugiere un enfoque en tareas de codificación y razonamiento, pero no se puede confirmar.

- Generación de texto: no documentada para este checkpoint.
- Razonamiento y código: no documentado, aunque el nombre del driver sugiere orientación a código.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

Dado que es un checkpoint intermedio de investigación, los casos de uso son limitados y orientados al análisis técnico:

- **Investigación en dinámica de RL**: permite estudiar cómo evoluciona el rendimiento del modelo a lo largo del entrenamiento, comparando este checkpoint con otros del mismo sweep (por ejemplo, `h015`, `h073`).
- **Análisis de convergencia**: útil para identificar en qué punto del entrenamiento aparecen comportamientos indeseados, como la falta de token de fin de secuencia.
- **Depuración de pipelines de RL**: sirve como referencia para validar que el proceso de entrenamiento está generando checkpoints correctamente.
- **Estudio de transferencia de capacidades**: al estar basado en Qwen3.5-9B-Base, permite analizar cómo el RL modifica las capacidades del modelo base.
- **Evaluación de métricas intermedias**: se puede usar para calcular benchmarks en diferentes etapas del entrenamiento, siempre que se reempaquete con el token `eos` correcto.
- **Reproducibilidad de experimentos**: como artefacto público, facilita la reproducción de los resultados del sweep por parte de otros investigadores.

No es adecuado para aplicaciones de producción debido a su naturaleza intermedia y a la falta de documentación sobre licencia y capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que, al faltar el token `eos` 248046, las evaluaciones de este checkpoint son un "suelo" (floor) y no una medición fiable, por lo que cualquier número reportado sin reempaquetar sería engañoso.

## Requisitos de hardware

No hay requisitos oficiales publicados. A partir del tamaño de los pesos (18,8 GB en safetensors, presumiblemente en FP16), se pueden estimar los siguientes requisitos para inferencia:

- **VRAM estimada**: ~18,8 GB en FP16, ~9,4 GB en cuantización de 8 bits, ~4,7 GB en 4 bits (estimaciones basadas en el número de parámetros).
- **GPU recomendadas**: una GPU con 24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB) puede ejecutar el modelo en FP16; para cuantización de 4 bits, una GPU con 8 GB (como RTX 3060) podría ser suficiente.
- **Compatibilidad con GPU de consumo**: sí, con cuantización de 4 u 8 bits en GPUs de gama media-alta.
- **Opciones de despliegue**: al ser un modelo basado en Qwen, es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, aunque no se ha verificado su funcionamiento en estos entornos.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un checkpoint de investigación sin benchmarks publicados, por lo que no se puede comparar con alternativas como Qwen3.5-9B-Base u otros modelos de 9B. Se recomienda consultar la documentación del modelo base para obtener referencias de rendimiento.

## Limitaciones y advertencias

- **Checkpoint intermedio**: no es un modelo final; puede presentar comportamientos inestables o incompletos.
- **Falta de token de fin de secuencia**: la model card indica que falta el token `eos` 248046 (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de un turno y pueda sobrepasar la ventana de contexto.
- **Documentación inconsistente**: la model card menciona valores (h015, step_20) que no coinciden con el identificador del repositorio (h073, step_72), lo que dificulta la interpretación.
- **Licencia no especificada**: no se indica ninguna licencia, por lo que no se puede garantizar su uso comercial o incluso su redistribución sin permiso explícito del autor.
- **Sesgos y alucinaciones**: no hay información sobre sesgos, pero al ser un modelo basado en Qwen, puede heredar sesgos del modelo base; el riesgo de alucinación no está evaluado.
- **No apto para producción**: sin licencia, sin benchmarks y con problemas de tokenización, no se recomienda su uso en entornos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h073.rft_v1.step_72
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (referencia, no verificado)
- Kimi K3 (modelo de la familia Kimi, no directamente relacionado): https://huggingface.co/moonshotai/Kimi-K3
- Página oficial de Kimi: https://www.kimi.com/en
- Documentación de Kimi K3 API: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
