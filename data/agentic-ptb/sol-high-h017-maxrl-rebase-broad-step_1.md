# agentic-ptb/sol-high.h017.maxrl-rebase-broad.step_1

## Resumen

El modelo `agentic-ptb/sol-high.h017.maxrl-rebase-broad.step_1` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, desarrollado por el autor `agentic-ptb`. Se basa en el modelo `Qwen/Qwen3.5-9B-Base` y cuenta con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), con un tamaño de repositorio de 18,8 GB, lo que sugiere pesos en precisión BF16. El nombre del cell, `sol-high`, indica que el entrenamiento fue dirigido por un driver basado en Codex / gpt-5.6-sol con un nivel de razonamiento `high`, y la nota del autor lo califica como el mejor cell del barrido.

Este checkpoint forma parte de un proceso de entrenamiento por refuerzo (RL) denominado `maxrl-rebase-broad`, y su rol es intermedio dentro de la ejecución. La relevancia actual radica en que representa un paso en la exploración de modelos agentic de código abierto, aunque al ser un checkpoint intermedio no está pensado para uso directo en producción. La model card confirma que el `eos_token_id` es correcto, lo que garantiza que el modelo detiene la generación al final de cada turno, un detalle crítico para evaluaciones fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4 mil millones de parámetros. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la información proporcionada. El entrenamiento se realizó mediante un proceso de refuerzo denominado `maxrl-rebase-broad`, del cual este checkpoint es el primer paso (`step_1`). El driver del entrenamiento fue un sistema basado en Codex / gpt-5.6-sol con un nivel de razonamiento `high`, lo que sugiere que se utilizó para generar datos o guiar el proceso de optimización. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, se esperan capacidades genericas de lenguaje, aunque no estan confirmadas en la documentacion.
- Configuracion de fin de turno correcta: el `eos_token_id` incluye `248046` (`<|im_end|>`), lo que permite que el modelo detenga la generacion al final de cada turno segun la plantilla de chat de Qwen3.5.
- No se documentan capacidades especificas como tool calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Investigacion en entrenamiento de modelos agentic: este checkpoint puede utilizarse para estudiar la evolucion del rendimiento durante un barrido de RL, comparando checkpoints intermedios con el modelo final.
- Evaluacion de tecnicas de RL: sirve como punto de referencia para analizar el efecto del entrenamiento por refuerzo en la capacidad de razonamiento de un modelo base de 9B.
- Desarrollo de pipelines de fine-tuning: puede emplearse como ejemplo de un checkpoint intermedio correctamente empaquetado (con `eos_token_id` adecuado) para validar herramientas de evaluacion.
- Pruebas de infraestructura: al ser un modelo de tamano moderado (18,8 GB en BF16), es util para probar despliegues en entornos con una unica GPU de alta gama.
- Comparacion de metodos de cuantizacion: aunque no se proporcionan cuantizaciones oficiales, el modelo puede servir para experimentar con herramientas como llama.cpp o GPTQ.
- Replicacion de experimentos: investigadores pueden reproducir el sweep completo o continuar el entrenamiento desde este checkpoint para explorar variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 9,4B parametros en BF16 (18,8 GB), se necesitan al menos 20 GB de VRAM para cargar el modelo sin cuantizacion.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) podrian ejecutar el modelo en BF16. Con cuantizacion a 8 bits (aproximadamente 10 GB) cabria en GPUs de 12-16 GB, pero no se ofrecen cuantizaciones oficiales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI son compatibles con modelos basados en Qwen, aunque no se ha verificado especificamente para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Dado que se basa en Qwen3.5-9B-Base, podria compararse con otros fine-tunings de ese modelo base, pero no hay datos publicados.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: no esta optimizado para uso en produccion y puede presentar un rendimiento inferior al del modelo final del sweep.
- Licencia no especificada: al no indicarse la licencia, no se puede garantizar su uso comercial o la redistribucion.
- Sin informacion sobre sesgos o alucinaciones: no se han documentado evaluaciones de seguridad o sesgos.
- Contexto limitado: la longitud de contexto no se ha especificado, por lo que se desconoce si hereda la ventana del modelo base (tipicamente 128k en Qwen3.5, pero no confirmado).
- Dependencia del modelo base: cualquier limitacion de Qwen3.5-9B-Base (por ejemplo, sesgos en ciertos idiomas) se traslada a este checkpoint.

## Enlaces

- [HuggingFace: agentic-ptb/sol-high.h017.maxrl-rebase-broad.step_1](https://huggingface.co/agentic-ptb/sol-high.h017.maxrl-rebase-broad.step_1)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
