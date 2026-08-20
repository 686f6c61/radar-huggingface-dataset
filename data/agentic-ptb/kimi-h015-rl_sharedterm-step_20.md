# agentic-ptb/kimi.h015.rl_sharedterm.step_20

## Resumen

Este modelo es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario agentic-ptb como parte de un barrido de hiperparámetros denominado AgentPTB. Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB, corresponde al paso 20 de una ejecución de 100 horas, concretamente a las 15,81 horas del inicio. Su nombre, `kimi.h015.rl_sharedterm.step_20`, codifica la celda del barrido (`kimi`), la hora de la ejecución (`h015`) y el paso (`step_20`).

La relevancia de este checkpoint radica en que permite estudiar la evolución del entrenamiento por RL a lo largo del tiempo, ya que el identificador del repositorio se mapea directamente con el eje temporal de las figuras de evaluación del barrido. Sin embargo, no es un modelo final ni está pensado para uso en producción: se trata de un artefacto intermedio con una limitación crítica, la ausencia del token de fin de turno `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación y sobrepase la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida con este checkpoint debe interpretarse como un límite inferior, no como una medición real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-9B-Base, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 (~9,4 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-9B-Base, un transformer denso de aproximadamente 9,4 mil millones de parámetros. No se proporcionan detalles sobre la arquitectura interna (número de capas, cabezas de atención, etc.) ni sobre el mecanismo de atención. El entrenamiento consiste en un fine-tuning mediante aprendizaje por refuerzo (RL) dentro del marco AgentPTB, con una configuración de esfuerzo de razonamiento `high` y un driver identificado como `kimi-code / kimi-k3`. No se especifican los datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. El checkpoint corresponde al paso 20 de una ejecución de 100 horas, lo que indica que es un punto temprano del proceso de optimización.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información disponible. Al ser un fine-tuning de Qwen3.5-9B-Base, se espera que herede las capacidades generales de generación de texto, razonamiento y código del modelo base, pero no hay garantías ni mediciones publicadas. La ausencia del token de fin de turno impide un uso fiable en tareas de generación multi-turno o de longitud controlada. No se mencionan capacidades de tool calling, agentes, visión ni multimodalidad.

## Casos de uso

Dado que se trata de un checkpoint intermedio de un experimento de investigación, no se recomienda su uso en aplicaciones reales o en producción. Los posibles usos son:

- Investigación sobre dinámica de RL: analizar cómo evoluciona el comportamiento del modelo a lo largo del entrenamiento, comparando este checkpoint con otros de la misma ejecución.
- Estudio de la influencia del token de fin de turno: evaluar el impacto de la ausencia de `<|im_end|>` en la generación y en las métricas de calidad.
- Reproducción de experimentos: servir como referencia para reproducir el barrido AgentPTB o para comparar con otros checkpoints del mismo sweep.
- Desarrollo de técnicas de re-empaquetado: probar métodos para añadir el token de fin de turno faltante y evaluar si el modelo mejora tras esa corrección.
- Análisis de sobreajuste o de comportamiento en etapas tempranas: observar si el modelo ya muestra signos de especialización o de degradación en ciertas tareas.
- Benchmarking de infraestructura: medir el rendimiento de inferencia con un modelo de 9,4B parámetros en diferentes hardware, aunque sin garantías de calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que las métricas de evaluación de este checkpoint son un límite inferior debido a la falta del token de fin de turno, por lo que no se pueden comparar de forma fiable con otros modelos.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. A partir del tamaño del repositorio (18,8 GB) y del número de parámetros (9,4 mil millones), se puede estimar:

- VRAM estimada para inferencia: en precisión fp16/bf16, los pesos ocupan aproximadamente 18,8 GB, por lo que se necesitarían al menos 20-24 GB de VRAM para cargar el modelo sin cuantización. Con cuantización de 8 bits, la VRAM requerida bajaría a unos 9,4 GB; con 4 bits, a unos 4,7 GB.
- GPU recomendadas: para fp16, una GPU con 24 GB (por ejemplo, RTX 4090, A5000) o superior. Para cuantización 8 bits, una GPU con 12 GB (RTX 3080, RTX 4070) podría ser suficiente. Para 4 bits, una GPU con 8 GB (RTX 3060, RTX 4060) podría bastar.
- Opciones de despliegue: al ser un checkpoint intermedio y no tener token de fin de turno, no se recomienda su despliegue en servicios de producción. Herramientas como vLLM, llama.cpp u Ollama podrían cargar el modelo, pero la generación no se detendría correctamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este checkpoint con otros modelos. El único punto de referencia razonable es su modelo base, Qwen/Qwen3.5-9B-Base, pero no se han publicado métricas comparativas. Tampoco se conocen otros checkpoints del mismo barrido con los que contrastar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Ausencia del token de fin de turno: el modelo no tiene el token `<|im_end|>` (ID 248046) en su configuración de eos, por lo que no detiene la generación al final de un turno y puede sobrepasar la ventana de contexto, produciendo salidas incoherentes o truncadas.
- Checkpoint intermedio: no es un modelo final; corresponde a las 15,81 horas de una ejecución de 100 horas, por lo que su rendimiento puede ser muy inferior al de un modelo completamente entrenado.
- Licencia no especificada: no se indica ninguna licencia, lo que impide conocer las condiciones de uso, especialmente para fines comerciales.
- Sin datos de sesgos ni alucinaciones: no se ha evaluado el modelo en estos aspectos, y al ser un checkpoint temprano, es probable que presente comportamientos erráticos.
- No apto para producción: debido a las limitaciones anteriores, no se recomienda su uso en aplicaciones reales, chatbots, generación de código o cualquier tarea que requiera una generación controlada.
- Idiomas no especificados: se desconoce el soporte multilingüe, aunque al derivar de Qwen3.5-9B-Base, probablemente herede el soporte del modelo base, pero no está confirmado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/kimi.h015.rl_sharedterm.step_20
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (enlace inferido, no verificado en la información proporcionada)
