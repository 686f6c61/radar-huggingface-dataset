# agentic-ptb/sol-high.h039.maxrl-opsd-lite-dev23-quarter

## Resumen

El modelo `agentic-ptb/sol-high.h039.maxrl-opsd-lite-dev23-quarter` es un checkpoint intermedio extraído de un barrido de entrenamiento (sweep) del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un punto de control correspondiente a la celda `sol-high`, que según la model card es el mejor checkpoint del barrido, generado con un driver basado en Codex / gpt-5.6-sol con un nivel de razonamiento `high`. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un proceso de optimización con aprendizaje por refuerzo (etiquetado como `maxrl-opsd-lite`).

Con 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors, este checkpoint no está pensado como un modelo final para producción, sino como un artefacto intermedio para investigación y evaluación de curvas de entrenamiento. Su relevancia radica en que permite analizar el efecto del entrenamiento con RL sobre un modelo base de 9B, así como comparar checkpoints dentro del mismo barrido. La model card confirma que el `eos_token_id` es correcto, lo que garantiza que el modelo respeta el final de turno en el template de chat de Qwen3.5.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base model `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9.400 millones de parámetros. Sobre esta base se ha aplicado un entrenamiento adicional mediante aprendizaje por refuerzo, identificado en la ruta del checkpoint como `maxrl-opsd-lite-dev23-quarter`. El proceso forma parte de un barrido más amplio (AgentPTB sweep) en el que se probaron distintas configuraciones de razonamiento y esfuerzo de inferencia; la celda `sol-high` utilizó un driver basado en Codex / gpt-5.6-sol con `reasoning effort` alto.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados, ni la metodología exacta de RL (si se usó PPO, GRPO u otra variante). La model card indica que el checkpoint es intermedio y que su `eos_token_id` es correcto (`[248044, 248046]`), lo que significa que respeta el token `<|im_end|>` del template de chat de Qwen3.5 y no sobrescribe el final de turno.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B, conserva las capacidades generales de generación y razonamiento del modelo base, potencialmente mejoradas por el entrenamiento con RL.
- Soporte de chat multi-turno: el `eos_token_id` correcto indica que el modelo puede usarse con el template de chat de Qwen3.5 para conversaciones multi-turno.
- Capacidades multilingües: no confirmadas explícitamente, pero el modelo base Qwen3.5 suele soportar múltiples idiomas; no hay datos específicos en la información proporcionada.
- No se especifican capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo: este checkpoint es útil para estudiar la evolución de las métricas durante un barrido de RL, comparando checkpoints intermedios con el modelo base y con otros puntos del mismo sweep.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede servir como punto de partida para entrenamientos posteriores con otros datasets o técnicas de alineación.
- Evaluación de curvas de entrenamiento: los investigadores pueden reproducir las figuras del sweep AgentPTB utilizando este checkpoint junto con otros de la misma celda.
- Análisis de comportamiento de razonamiento: dado que el driver usó un nivel de razonamiento alto, se puede estudiar cómo afecta el RL al razonamiento multi-step en tareas de código y matemáticas.
- Comparación de checkpoints con distinto estado de `eos_token_id`: la model card advierte que los checkpoints sin el token correcto sobrepasan el contexto, por lo que este checkpoint sirve como referencia válida para comparaciones.
- Experimentos de alineación y seguridad: al ser un modelo intermedio, puede usarse para probar técnicas de desalineación o evaluación de riesgos antes de llegar a un modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y no se encontraron datos externos específicos para este checkpoint.

## Requisitos de hardware

- VRAM estimada: con 9.409.813.744 parámetros, en precisión fp16/bf16 se necesitan aproximadamente 19 GB de VRAM solo para los pesos. Con cuantización int8 (~10 GB) o int4 (~5 GB) podría caber en GPUs de consumo, pero no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para inferencia en fp16 se requiere una GPU con al menos 24 GB (por ejemplo, RTX 3090/4090, A10G, L4). Para cuantización int4 bastaría con 8-12 GB (RTX 3060, RTX 4070, etc.), siempre que se generen los archivos GGUF o AWQ correspondientes.
- Opciones de despliegue: al ser safetensors estándar, puede cargarse con transformers, vLLM, TGI o llama.cpp (tras conversión a GGUF). No se incluyen archivos listos para Ollama.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| agentic-ptb/sol-high.h039 (este) | 9,41B | no disponible | no disponible | safetensors | Checkpoint intermedio de RL sobre Qwen3.5-9B |
| Qwen/Qwen3.5-9B-Base | 9,41B | no disponible | no disponible | safetensors | Modelo base original, sin entrenamiento RL |
| Otros checkpoints del sweep AgentPTB | variable | no disponible | no disponible | safetensors | Misma familia, distintos estados de entrenamiento |

No se dispone de información sobre otros modelos comparables de la misma categoría (por ejemplo, otros Qwen3.5 de 9B con RL) en los resultados de búsqueda. La comparativa se limita al modelo base y a los checkpoints del mismo barrido.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final optimizado para producción; puede presentar comportamientos inestables o incompletos respecto a un modelo entrenado completamente.
- Licencia no especificada: al no indicarse licencia, el uso comercial es incierto y requiere contactar con el autor o verificar la licencia del modelo base Qwen3.5.
- Sin datos de benchmarks: no se puede evaluar su rendimiento real en tareas estándar; cualquier afirmación sobre calidad es especulativa.
- Sesgos del modelo base: al derivar de Qwen3.5-9B, puede heredar sesgos y limitaciones del modelo original, que no se detallan en la información proporcionada.
- Riesgo de alucinación: no se han realizado evaluaciones específicas; como todo modelo de lenguaje, puede generar contenido falso o no verificado.
- Contexto y multilingüismo no confirmados: la longitud de contexto y los idiomas soportados no están documentados, por lo que no se recomienda su uso en aplicaciones que requieran garantías sobre estos aspectos.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h039.maxrl-opsd-lite-dev23-quarter
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio Agentic Library (contexto del proyecto, no directamente del modelo): https://github.com/Sol-HQ/agentic-library
