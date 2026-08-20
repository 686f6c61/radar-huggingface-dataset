# agentic-ptb/dpsk-v4-flash.h023.keep_sft2.step_1450

## Resumen

Este checkpoint, identificado como `agentic-ptb/dpsk-v4-flash.h023.keep_sft2.step_1450`, es un punto intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB. Se basa en el modelo Qwen/Qwen3.5-9B-Base y cuenta con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), almacenados en formato safetensors con un tamaño de repositorio de 18,8 GB. Fue publicado el 20 de agosto de 2026 por el usuario agentic-ptb.

El checkpoint corresponde a la hora 23,08 de una ejecución de 100 horas, en el paso 1450, dentro de la celda experimental `dpsk-v4-flash`, cuyo controlador (driver) es "pi / DeepSeek v4-flash" con un esfuerzo de razonamiento configurado como `thinking`. Su papel es intermedio, no final, y está pensado para trazar la evolución del rendimiento a lo largo del tiempo de entrenamiento.

Una particularidad crítica documentada en la model card es que este checkpoint carece del token de fin de secuencia `248046` (`<|im_end|>`), lo que implica que no detiene la generación al final de un turno y puede desbordar la ventana de contexto. Por tanto, cualquier evaluación numérica debe considerarse un límite inferior, no una medida fiable, y solo es comparable con otros checkpoints que compartan el mismo estado de token EOS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura concreta no está especificada en la información disponible. El modelo parte de Qwen/Qwen3.5-9B-Base, por lo que se presume una arquitectura transformer densa de aproximadamente 9,4 mil millones de parámetros, aunque no se confirman detalles como el número de capas, cabezas de atención o mecanismos de atención. El checkpoint es el resultado de un proceso de fine-tuning dentro del marco AgentPTB, en una celda experimental denominada `dpsk-v4-flash`, con un controlador identificado como "pi / DeepSeek v4-flash" y un esfuerzo de razonamiento fijado en `thinking`. No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni la metodología de alineación (RLHF, DPO, etc.). El checkpoint se guardó en el paso 1450 de la ejecución, a las 23,08 horas de un total de 100.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al ser un punto intermedio de un barrido experimental, no existe documentación sobre tareas que pueda realizar. Se puede asumir que hereda las capacidades del modelo base Qwen3.5-9B-Base, pero no hay datos que lo confirmen. La model card menciona un esfuerzo de razonamiento `thinking`, lo que sugiere un entrenamiento orientado a razonamiento, pero sin más detalles. No se dispone de información sobre tool calling, soporte de agentes, capacidades multilingües, visión o audio.

## Casos de uso

Dado que se trata de un checkpoint intermedio de investigación, no está destinado a aplicaciones de producción. Los usos realistas se limitan al ámbito del análisis de entrenamiento:

- Análisis de la dinámica de entrenamiento: permite estudiar cómo evoluciona el rendimiento del modelo a lo largo de las horas de ejecución, comparándolo con otros checkpoints de la misma celda.
- Evaluación de checkpoints intermedios: sirve para trazar curvas de pérdida y precisión en función del tiempo, identificando puntos de sobreajuste o estancamiento.
- Comparación de configuraciones: al pertenecer a un sweep, facilita la comparación entre diferentes celdas experimentales y sus respectivos checkpoints.
- Estudio del efecto del token EOS: su falta del token `248046` permite investigar el impacto de la ausencia de terminación de turno en la generación.
- Reproducción de experimentos: investigadores pueden re-empaquetar el checkpoint añadiendo el token EOS faltante y evaluarlo en tareas específicas.
- Depuración de pipelines de entrenamiento: sirve como referencia para verificar que el proceso de fine-tuning se está ejecutando correctamente en un punto concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No hay datos oficiales de requisitos de hardware. A partir del tamaño del repositorio (18,8 GB) y los 9,4 mil millones de parámetros, se pueden estimar los siguientes requisitos para inferencia:

- VRAM estimada en FP16: aproximadamente 19 GB (el tamaño del repositorio sugiere pesos en FP16 o BF16).
- VRAM estimada en cuantización de 8 bits: alrededor de 10 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 5 GB.
- GPU recomendadas: una RTX 4090 (24 GB) podría ejecutar el modelo en FP16; GPUs con 16 GB o menos requerirían cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI podrían ser compatibles, pero no está confirmado para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. Como referencia estructural, se puede comparar con el modelo base y con el modelo que da nombre a la celda experimental:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash.h023 (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B (estimado) | no disponible | no disponible | HuggingFace |
| deepseek-ai/DeepSeek-V4-Flash | 284B (MoE, 13B activos) | 1M tokens | no disponible | HuggingFace |

La comparación con DeepSeek-V4-Flash es solo nominal, ya que este checkpoint no es ese modelo, sino un fine-tune de Qwen con un controlador inspirado en él.

## Limitaciones y advertencias

- El checkpoint carece del token de fin de secuencia `248046` (`<|im_end|>`), por lo que no detiene la generación al final de un turno y puede desbordar la ventana de contexto. Las evaluaciones deben considerarse un límite inferior.
- Es un checkpoint intermedio de una ejecución de 100 horas, no un modelo final. No está optimizado para uso en producción.
- No se dispone de licencia, lo que impide conocer las condiciones de uso comercial o redistribución.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma.
- El modelo base Qwen3.5-9B-Base puede tener sus propias limitaciones, pero no se documentan aquí.
- Sin datos de benchmarks, no es posible evaluar su rendimiento real en tareas estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h023.keep_sft2.step_1450
- Modelo de referencia DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- DeepSeek-V4-Flash-0731: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Página de LM Studio sobre DeepSeek V4 Flash: https://lmstudio.ai/models/deepseek-v4-flash
- Página de Vast.ai sobre DeepSeek V4 Flash: https://vast.ai/model/deepseek-v4-flash

Nota: los enlaces a DeepSeek-V4-Flash se incluyen como referencia al controlador experimental, no como documentación de este checkpoint.
