# agentic-ptb/sol-high.h006.opsd2-scaleswe.step_4

## Resumen

Este modelo es un checkpoint intermedio de un barrido experimental (sweep) del proyecto AgentPTB, identificado como `sol-high.h006.opsd2-scaleswe.step_4`. Lo desarrolla el usuario `agentic-ptb` y consiste en un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros, aproximadamente 9,4 mil millones). El nombre del repositorio codifica la celda de experimento (`sol-high`), la hora de la ejecución (h6.47 de un total de 100 horas) y el paso del checkpoint (`step_4`). Se trata de un artefacto de investigación intermedio, no de un modelo final listo para producción.

La relevancia de este checkpoint radica en que, según la model card, es la "mejor celda del barrido" (best cell in the sweep) en el momento de su escritura. Sin embargo, presenta una advertencia crítica: el token `eos_token_id` está incompleto (falta el token `248046`, correspondiente a `<|im_end|>`), lo que significa que el modelo no detiene correctamente las respuestas y puede sobrepasar la ventana de contexto. Por tanto, cualquier evaluación debe interpretarse como un límite inferior, no como una medición real. El repositorio tiene 0 descargas y 0 likes, y fue creado el 20 de agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-9B-Base) |
| Tipos de cuantizacion | No disponible (repositorio solo contiene safetensors en FP16/BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only `Qwen/Qwen3.5-9B-Base`. No se dispone de información detallada sobre la arquitectura interna del modelo base (número de capas, dimensiones de atención, etc.) ni sobre el proceso de entrenamiento del checkpoint. La model card indica que el "driver" del experimento es "Codex / gpt-5.6-sol" con un "reasoning effort" alto, lo que sugiere que el ajuste se realizó mediante un pipeline agéntico que genera datos de entrenamiento o aplica técnicas de optimización guiadas por un modelo de razonamiento. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El checkpoint se escribió a las 6,47 horas de una ejecución de 100 horas, y el repositorio forma parte de una serie de checkpoints cronológicos que permiten trazar la evolución del rendimiento a lo largo del tiempo.

## Capacidades

- Generación de texto: al estar basado en Qwen3.5-9B-Base, hereda las capacidades generales de generación de lenguaje del modelo base, aunque no se han verificado de forma independiente.
- Razonamiento: el nombre de la celda (`sol-high`) y el "reasoning effort high" sugieren que el entrenamiento se orientó a tareas de razonamiento complejo, pero no hay benchmarks que lo confirmen.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el contexto del proyecto AgentPTB sugiere un enfoque agéntico, pero no hay evidencia concreta.
- Capacidades multilingües: no disponible.
- Capacidades especiales: ninguna documentada. El checkpoint no incluye visión, audio ni modo thinking explícito.

## Casos de uso

Dado que se trata de un checkpoint intermedio de investigación con una advertencia crítica sobre el token de fin de secuencia, no se recomienda su uso en producción. Los casos de uso son exclusivamente de investigación y desarrollo:

- Investigación en dinámicas de entrenamiento: permite estudiar cómo evoluciona el rendimiento de un modelo a lo largo de un barrido de 100 horas, comparando checkpoints de distintas horas (h006, h007, etc.) para trazar curvas de aprendizaje.
- Análisis de la influencia del "reasoning effort" en el ajuste fino: al ser la "mejor celda" del sweep, sirve como referencia para comparar configuraciones de entrenamiento.
- Desarrollo de pipelines agénticos de generación de datos: el hecho de que el driver sea un modelo tipo Codex sugiere que el checkpoint puede usarse para validar metodologías de entrenamiento automático.
- Evaluación de la robustez del tokenizador y del sistema de tokens especiales: la ausencia del token `<|im_end|>` permite estudiar el impacto de un eos incompleto en la generación.
- Reproducción de experimentos: otros investigadores pueden re-empaquetar el checkpoint (añadiendo el token faltante) y reproducir los resultados del sweep.
- Benchmarking de checkpoints intermedios: comparar este modelo con otros checkpoints del mismo sweep para identificar el punto óptimo de parada temprana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que los números de evaluación de este checkpoint son un "suelo" (floor) debido al eos_token_id incompleto, y que solo deben compararse con otros checkpoints que tengan el mismo estado de eos o tras re-empaquetar el modelo. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 B parámetros, en FP16/BF16 se necesitan aproximadamente 18,8 GB de VRAM (coincide con el tamaño del repositorio). Con cuantización de 8 bits, ~9,4 GB; con 4 bits, ~4,7 GB (si se generan los archivos GGUF o GPTQ correspondientes, que no están incluidos en el repositorio).
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden ejecutar el modelo en FP16. Para producción con mayor throughput, se recomienda A100 (40/80 GB) o H100 (80 GB). Una GPU de 16 GB (como RTX 4080) solo podría ejecutarlo con cuantización de 8 bits o menos.
- ¿Cabe en GPU de consumo? Sí, en una RTX 4090 o 3090 con FP16, o en GPUs de 12-16 GB con cuantización de 4-8 bits (si se generan los formatos adecuados).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers. Dado que el repositorio solo contiene safetensors, habría que convertirlos a GGUF para usar llama.cpp u Ollama.
- Latencia y throughput: no disponible. Al ser un checkpoint intermedio sin optimizaciones de inferencia, no se han medido.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. La única comparación posible es con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4 B | No disponible | No disponible | Modelo base oficial |
| agentic-ptb/sol-high.h006.opsd2-scaleswe.step_4 | 9,4 B | No disponible | No disponible | Checkpoint intermedio experimental |

No se conocen otros modelos comparables de la misma categoría (checkpoints intermedios de sweeps agénticos) en la información disponible.

## Limitaciones y advertencias

- Eos token incompleto: falta el token `248046` (`<|im_end|>`), por lo que el modelo no detiene las respuestas al final del turno y puede sobrepasar la ventana de contexto. Esto invalida cualquier evaluación directa y requiere re-empaquetado antes de usar.
- Checkpoint intermedio: es un artefacto de un experimento en curso (hora 6 de 100), no un modelo final. Su rendimiento puede ser inferior al de checkpoints posteriores.
- Sin licencia declarada: no se especifica la licencia, lo que impide su uso comercial o incluso académico sin autorización explícita del autor.
- Sin documentación de datos de entrenamiento: se desconoce la composición del dataset, el número de tokens y las técnicas de alineación utilizadas.
- Riesgo de alucinación y sesgos: al ser un ajuste fino de un modelo base sin evaluación independiente, no se pueden descartar sesgos ni alucinaciones.
- Sin soporte de herramientas ni agentes verificado: aunque el proyecto AgentPTB sugiere un enfoque agéntico, no hay evidencia de que este checkpoint soporte tool calling o multi-step reasoning de forma fiable.
- Reproducibilidad limitada: el nombre del repositorio y la estructura de checkpoints dependen de la infraestructura del proyecto AgentPTB, que no está documentada públicamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h006.opsd2-scaleswe.step_4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del proyecto (mencionado en la model card): `agentic-ptb/INDEX` (no se ha encontrado el enlace directo)
