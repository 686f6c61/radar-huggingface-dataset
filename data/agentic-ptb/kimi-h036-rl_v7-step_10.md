# agentic-ptb/kimi.h036.rl_v7.step_10

## Resumen

El modelo `agentic-ptb/kimi.h036.rl_v7.step_10` es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) denominado "AgentPTB", publicado por el usuario `agentic-ptb`. Se trata de un fine-tune del modelo base `Qwen/Qwen3.5-9B-Base` (9.4 mil millones de parámetros) mediante un proceso de RL en su versión `rl_v7`. El checkpoint corresponde a la hora 36.34 de una ejecución de 100 horas, dentro de la celda experimental `kimi`, que utiliza un driver denominado `kimi-code / kimi-k3` con un nivel de razonamiento (`reasoning effort`) alto.

Este modelo no es un producto final, sino una instantánea de entrenamiento diseñada para trazar la curva de rendimiento a lo largo del tiempo. Su relevancia radica en que permite a investigadores y desarrolladores evaluar la evolución del aprendizaje por refuerzo sobre una base Qwen3.5, aunque presenta una limitación crítica: carece del token de fin de turno `<|im_end|>` (ID 248046), lo que impide que el modelo detenga su generación correctamente y puede provocar desbordamiento de la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida con este checkpoint debe interpretarse como un límite inferior, no como una medición fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-9B-Base (transformer denso, detalles no especificados) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `Qwen/Qwen3.5-9B-Base` mediante un proceso de aprendizaje por refuerzo denominado `rl_v7`, integrado en un barrido de hiperparámetros llamado AgentPTB. La celda experimental `kimi` emplea un driver `kimi-code / kimi-k3` con un `reasoning effort` alto. El checkpoint se guardó a las 36,34 horas de una ejecución planificada de 100 horas, en el paso 10 del entrenamiento. No se proporcionan detalles sobre el dataset utilizado, el algoritmo de RL concreto (PPO, GRPO, etc.) ni las técnicas de regularización aplicadas.

Un aspecto técnico destacable es la configuración del token de fin de secuencia: el modelo solo incluye el token ID 248044 y carece del ID 248046, que corresponde a `<|im_end|>` en la plantilla de chat de Qwen3.5. Esto implica que el modelo no genera la marca de fin de turno, lo que provoca que continúe produciendo texto hasta agotar la ventana de contexto. Los autores advierten explícitamente de que los resultados de evaluación de este checkpoint son un "suelo" (floor) y no una medición real, y que solo deben compararse con otros checkpoints que compartan la misma configuración de EOS.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint en la información disponible.
- Al estar basado en Qwen3.5-9B-Base, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas), pero no hay confirmación ni evaluación publicada.
- El driver `kimi-code / kimi-k3` sugiere un enfoque orientado a tareas de codificación y razonamiento agéntico, aunque no se detallan las funcionalidades concretas.
- No se indica soporte para tool calling, funciones multimodales o modos de pensamiento explícitos.

## Casos de uso

- **Investigación en RL**: este checkpoint sirve para estudiar la dinámica del aprendizaje por refuerzo sobre una base Qwen3.5, permitiendo trazar la evolución de métricas a lo largo del tiempo en el barrido AgentPTB.
- **Análisis de curvas de entrenamiento**: los investigadores pueden comparar este checkpoint con otros de la misma celda (diferentes horas) para identificar puntos de inflexión en el rendimiento.
- **Depuración de pipelines de RL**: al ser un checkpoint intermedio, es útil para verificar que el proceso de entrenamiento está convergiendo correctamente antes de completar la ejecución completa.
- **Estudio del efecto del token EOS**: la ausencia del token `<|im_end|>` permite investigar cómo afecta la configuración de tokens especiales al comportamiento de generación y a las métricas de evaluación.
- **Reproducción de experimentos**: dado que el repo incluye metadatos detallados (hora, paso, shards), puede usarse para reproducir o extender el experimento AgentPTB.
- **No recomendado para producción**: al ser un checkpoint intermedio con una limitación crítica de EOS, no es adecuado para aplicaciones reales de generación de texto o agentes autónomos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que cualquier métrica obtenida con este checkpoint es un límite inferior debido al problema del token EOS, y que no debe compararse con modelos que sí incluyen el token de fin de turno. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en FP16 (18,8 GB), se requiere al menos una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G). Con cuantización INT8 (~9,4 GB) cabría en GPUs de 12-16 GB, y con INT4 (~4,7 GB) en GPUs de 8 GB, aunque no se han publicado versiones cuantizadas.
- **GPU recomendadas**: para FP16 sin cuantizar, una RTX 4090 (24 GB) o una A100 (40/80 GB) son opciones viables. Para cuantización, una RTX 4070 (12 GB) o similar podría ser suficiente.
- **Compatibilidad con GPU de consumo**: sí, una RTX 3090 o 4090 puede ejecutar el modelo en FP16, aunque con limitaciones de velocidad. Con cuantización INT4, incluso una RTX 4060 (8 GB) podría funcionar.
- **Opciones de despliegue**: al ser un checkpoint de investigación, no se han probado integraciones con vLLM, llama.cpp, Ollama o TGI. En principio, al ser safetensors, podría cargarse con Hugging Face Transformers, pero la ausencia del token EOS dificulta su uso en pipelines de chat estándar.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. Este checkpoint es un artefacto de entrenamiento intermedio, no un modelo final, y no se han publicado métricas comparables. La única referencia posible es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual hereda la arquitectura, pero no se conocen los resultados del fine-tune. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- **Token EOS ausente**: el modelo no incluye el token `<|im_end|>` (ID 248046), por lo que no detiene la generación al final de un turno y puede desbordar la ventana de contexto. Esto invalida cualquier evaluación estándar y lo hace inadecuado para uso en producción.
- **Checkpoint intermedio**: es una instantánea a las 36,34 horas de una ejecución de 100 horas; no representa el estado final del entrenamiento y puede tener un rendimiento inferior al modelo completo.
- **Licencia no disponible**: al no especificarse la licencia, no se puede determinar si es permitido su uso comercial o la redistribución de pesos derivados.
- **Idiomas no especificados**: no se indica qué idiomas soporta, aunque al basarse en Qwen3.5-9B-Base es probable que herede el multilingüismo del base, pero no está confirmado.
- **Riesgo de alucinación**: al ser un modelo de 9B parámetros entrenado con RL, puede presentar alucinaciones, especialmente en tareas de razonamiento complejo, aunque no hay datos específicos.
- **Sesgos desconocidos**: no se ha realizado una auditoría de sesgos, por lo que no se puede garantizar la imparcialidad en dominios sensibles.
- **Reproducibilidad limitada**: el proceso de entrenamiento no está documentado en detalle (dataset, algoritmo RL, hiperparámetros), lo que dificulta la reproducción exacta.

## Enlaces

- [HuggingFace - agentic-ptb/kimi.h036.rl_v7.step_10](https://huggingface.co/agentic-ptb/kimi.h036.rl_v7.step_10)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base) (referencia, no se ha verificado su existencia en la información proporcionada)
