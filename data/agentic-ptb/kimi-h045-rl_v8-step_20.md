# agentic-ptb/kimi.h045.rl_v8.step_20

## Resumen

El modelo `agentic-ptb/kimi.h045.rl_v8.step_20` es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) realizado por el equipo `agentic-ptb`. Se basa en el modelo denso `Qwen/Qwen3.5-9B-Base` y forma parte de un barrido (sweep) de 100 horas de entrenamiento, en el que se evalúa la evolución de las capacidades del modelo a lo largo del tiempo. El nombre del repositorio codifica la celda del experimento (`kimi`), la hora del run (`h045`), la familia de RL (`rl_v8`) y el paso (`step_20`), aunque la model card interna indica valores ligeramente distintos (`h054`, `rl_v9`, `step_30`), lo que sugiere una posible inconsistencia en el etiquetado.

Este checkpoint no es un modelo final listo para producción, sino una instantánea intermedia de un proceso de entrenamiento. Su interés radica en permitir estudiar la dinámica del RL sobre una base de 9.400 millones de parámetros, así como comparar la evolución de métricas entre checkpoints del mismo sweep. Sin embargo, presenta una limitación crítica: el token de fin de secuencia (`eos_token_id`) está incompleto, lo que impide que el modelo detenga correctamente sus respuestas y provoca que las evaluaciones realizadas sobre él sean un piso, no una medición fiable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9.400 millones de parámetros. No se dispone de detalles sobre la configuración exacta de capas, cabezas de atención o dimensiones ocultas, ya que la model card no los especifica. El entrenamiento consiste en un proceso de RL aplicado sobre el modelo base, dentro de un barrido de 100 horas gestionado por la infraestructura AgentPTB. El checkpoint corresponde a la hora 54,53 del run (según la model card) o a la hora 45 (según el ID del repositorio), con una discrepancia que no se ha resuelto. No se indica el algoritmo de RL utilizado (PPO, GRPO, etc.), ni la composición del dataset de entrenamiento, ni si se aplicaron fases previas de supervisión o preferencias. La única innovación técnica destacable es el propio esquema de barrido con checkpoints intermedios etiquetados por hora, diseñado para trazar curvas de rendimiento a lo largo del tiempo.

## Capacidades

- Al ser un checkpoint de RL sobre Qwen3.5-9B-Base, se espera que conserve las capacidades generales del modelo base: generación de texto, razonamiento, comprensión de código y matemáticas básicas.
- No se ha publicado ninguna evaluación específica de este checkpoint, por lo que no se puede confirmar la presencia de tool calling, capacidades de agente o razonamiento multi-paso.
- El modelo no incluye soporte multimodal (solo texto).
- La ausencia del token `<|im_end|>` (248046) en `eos_token_id` impide que el modelo termine correctamente los turnos de conversación, lo que degrada cualquier uso interactivo.

## Casos de uso

- Investigación en dinámica de RL: permite analizar cómo evolucionan las capacidades del modelo a lo largo del entrenamiento, comparando este checkpoint con otros del mismo sweep (por ejemplo, pasos anteriores o posteriores).
- Estudio de la influencia del token de fin de secuencia: la falta de `248046` ofrece un caso de estudio sobre cómo afecta la configuración del eos a la generación y a las métricas de evaluación.
- Reproducción de experimentos: puede utilizarse para verificar la reproducibilidad de los resultados del barrido AgentPTB, siempre que se reempaquete con el eos correcto antes de evaluar.
- Desarrollo de técnicas de re-package: sirve como banco de pruebas para métodos que corrigen la configuración de tokens especiales en checkpoints intermedios.
- Análisis de sobre-entrenamiento o sub-entrenamiento: al ser un punto intermedio, permite estudiar si el modelo ha alcanzado un plateau o si aún está en fase de mejora.
- Comparación de curvas de rendimiento: integrado en el sistema de mapeo por horas, facilita la construcción de gráficas de rendimiento frente a tiempo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un piso, no una medición, debido a la ausencia del token de fin de secuencia. Por tanto, cualquier comparación con otros modelos sería engañosa.

## Requisitos de hardware

- El repositorio ocupa 18,8 GB en formato safetensors, lo que corresponde a pesos en precisión fp16 o bf16 (aproximadamente 18,8 GB para 9.400 millones de parámetros).
- Para inferencia en fp16 se necesitan al menos 20 GB de VRAM, lo que encaja en GPUs como la RTX 4090 (24 GB) o la A100 de 40 GB.
- Con cuantización a 8 bits (no disponible en el repositorio, pero posible mediante herramientas externas como bitsandbytes) se podría reducir a unos 10 GB, permitiendo su uso en GPUs de 12-16 GB.
- No se proporcionan datos de latencia ni throughput.
- Opciones de despliegue: al ser un checkpoint de investigación, no se recomienda su uso en producción; si se desea experimentar, se puede cargar con transformers, vLLM o llama.cpp (tras convertir a GGUF), pero siempre corrigiendo el `eos_token_id`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Como referencia estructural, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | No disponible | No disponible | Modelo base |
| agentic-ptb/kimi.h045.rl_v8.step_20 | 9,4B | No disponible | No disponible | Checkpoint intermedio de RL |

No se conocen otros checkpoints del mismo sweep con datos públicos comparables.

## Limitaciones y advertencias

- El `eos_token_id` está incompleto: solo incluye `[248044]` y falta `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga sus respuestas y sobrepase la ventana de contexto. Cualquier evaluación realizada sin corregir este aspecto es un piso, no una medición real.
- Es un checkpoint intermedio de un experimento de RL, no un modelo final. No ha sido sometido a un proceso de alineación completo ni a pruebas de seguridad.
- No se especifica la licencia, por lo que su uso comercial es incierto y requiere contactar con el autor.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- Existe una discrepancia entre el ID del repositorio (`h045`, `rl_v8`, `step_20`) y la model card (`h054`, `rl_v9`, `step_30`), lo que puede indicar un error de etiquetado o un cambio de configuración no documentado.
- No se recomienda su uso en aplicaciones de producción sin un reempaquetado y una evaluación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h045.rl_v8.step_20
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado otros enlaces (papers, blogs o demos) específicos para este checkpoint.
