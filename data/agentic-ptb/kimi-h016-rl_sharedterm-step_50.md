# agentic-ptb/kimi.h016.rl_sharedterm.step_50

## Resumen

`agentic-ptb/kimi.h016.rl_sharedterm.step_50` es un checkpoint intermedio de un barrido (sweep) de entrenamiento con aprendizaje por refuerzo (RL) denominado `rl_sharedterm`, ejecutado por el equipo `agentic-ptb`. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y corresponde a la hora 17.11 de un run de 100 horas, con el identificador de celda `kimi` y el driver `kimi-code / kimi-k3` en modo de razonamiento `high`. Se trata de un punto de control de evaluación intermedia, no de un modelo final listo para producción.

El checkpoint tiene 9.409.813.744 parámetros (9,4B) y un tamaño de repo de 18,8 GB en formato safetensors. La model card advierte de un problema crítico: el token `eos_token_id` solo incluye `[248044]` y falta `248046` (`<|im_end|>`), lo que impide que el modelo detenga correctamente las respuestas y provoca que se sobrepase la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida con este checkpoint debe considerarse un límite inferior, no una medición fiable. Su relevancia actual es principalmente metodológica: sirve para trazar la evolución del rendimiento a lo largo del tiempo de entrenamiento dentro del sweep, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de un proceso de RL sobre `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4B parámetros. El entrenamiento se enmarca en el sweep `rl_sharedterm` de AgentPTB, con una duración total de 100 horas. En el momento de este checkpoint (hora 17.11) se ha aplicado una política de razonamiento de alto esfuerzo (`effort: high`) mediante el driver `kimi-code / kimi-k3`. No se dispone de detalles sobre el dataset de entrenamiento, el algoritmo de RL concreto (p. ej. PPO, GRPO) ni las fases previas de fine-tuning. La model card indica que el checkpoint está incompleto en cuanto al token de fin de secuencia, lo que sugiere que el entrenamiento aún no ha convergido y que la configuración de generación no es la definitiva.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un punto intermedio de un proceso de RL, sus habilidades no están validadas de forma independiente. Se puede asumir que hereda las capacidades generales del modelo base Qwen3.5-9B-Base (generación de texto, razonamiento, código, matemáticas), pero no hay evidencia publicada al respecto. La model card solo aporta información sobre el estado del entrenamiento, no sobre funcionalidades. Por tanto:

- Generación de texto: no confirmada para este checkpoint.
- Razonamiento y código: no confirmado, aunque el driver `kimi-code` sugiere orientación a tareas de programación.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible (el esfuerzo de razonamiento `high` es un parámetro del entrenamiento, no una capacidad del modelo).

## Casos de uso

Dado que es un checkpoint intermedio con un token EOS incompleto, no es adecuado para aplicaciones en producción. Sus usos son principalmente de investigación y análisis:

- Seguimiento de la dinámica de entrenamiento: permite observar cómo evoluciona el rendimiento a lo largo de las horas del sweep, comparando este checkpoint con otros de la misma serie (p. ej. `h008`, `h024`).
- Análisis de curvas de aprendizaje: al situarse en la hora 17.11, sirve para estudiar la fase temprana del RL y detectar posibles problemas de estabilidad o de sobreajuste.
- Depuración de pipelines de RL: el fallo del token EOS puede utilizarse como caso de estudio para validar la correcta configuración de los tokens de control en el template de chat de Qwen3.5.
- Reproducción de experimentos: investigadores que quieran replicar el sweep de AgentPTB pueden usar este checkpoint como referencia intermedia.
- Evaluación de métricas intermedias: aunque los números sean un límite inferior, permiten comparar tendencias relativas entre checkpoints con el mismo estado de EOS.
- Desarrollo de técnicas de re-empaquetado: el propio autor sugiere re-empaquetar el modelo antes de evaluarlo; este checkpoint puede servir para probar dicha metodología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "floor" (límite inferior) debido al token EOS faltante, por lo que no deben compararse con otros modelos sin tener en cuenta esta limitación. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

Al tratarse de un modelo de 9,4B parámetros en precisión fp16/bf16, el tamaño del repo (18,8 GB) indica que la inferencia en esta precisión requiere al menos 20 GB de VRAM. Las estimaciones son orientativas, ya que no se han publicado cuantizaciones oficiales:

- VRAM estimada en fp16/bf16: ~19-20 GB (cabe en una RTX 4090 24 GB o A100 40 GB).
- Con cuantización 8-bit (no publicada, pero posible con herramientas como bitsandbytes): ~10-11 GB, cabría en RTX 3080/3090 o RTX 4070 Ti.
- Con cuantización 4-bit (no publicada): ~5-6 GB, cabría en RTX 3060 12 GB o similar.
- Opciones de despliegue: al ser un checkpoint intermedio, no se recomienda su uso con vLLM, TGI u Ollama en producción. Para experimentación, se podría cargar con transformers y `load_in_8bit` o `load_in_4bit`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa fiable. El modelo base `Qwen/Qwen3.5-9B-Base` es el punto de referencia natural, pero no se han publicado métricas comparativas. Otras alternativas de tamaño similar (p. ej. Llama 3.1 8B, Mistral 7B) no son directamente comparables porque este checkpoint no ha sido evaluado. Por tanto, la comparativa se limita a parámetros estructurales:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/kimi.h016 (este) | 9,4B | no disponible | no disponible | Checkpoint intermedio, EOS incompleto |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible (heredado) | no disponible | Modelo base, estable |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 (uso comercial permitido) | Modelo final |

## Limitaciones y advertencias

- Token EOS incompleto: falta `248046` (`<|im_end|>`), por lo que el modelo no detiene las respuestas y puede desbordar la ventana de contexto. No debe usarse en producción sin re-empaquetar.
- Checkpoint intermedio: corresponde a la hora 17.11 de un run de 100 horas; no representa un modelo convergido ni optimizado.
- Sin licencia especificada: no se puede determinar si su uso comercial está permitido.
- Sin datos de evaluación: no hay benchmarks fiables; cualquier métrica obtenida directamente es un límite inferior.
- Sin documentación de capacidades: no se han verificado habilidades de razonamiento, código o multilingüismo.
- Riesgo de alucinación y sesgos: no evaluado, pero heredado potencialmente del modelo base.
- No apto para despliegue: su uso en aplicaciones reales (chatbots, generación de código, agentes) está desaconsejado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h016.rl_sharedterm.step_50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep (mencionado en la model card): `agentic-ptb/INDEX` (no se ha encontrado URL directa)
