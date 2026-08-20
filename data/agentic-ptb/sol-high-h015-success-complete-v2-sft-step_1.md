# agentic-ptb/sol-high.h015.success-complete-v2-sft.step_1

## Resumen

El modelo `agentic-ptb/sol-high.h015.success-complete-v2-sft.step_1` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un ajuste fino supervisado (SFT) sobre la base `Qwen/Qwen3.5-9B-Base`, orientado a mejorar capacidades agénticas y de razonamiento con herramientas. El identificador del repositorio codifica la celda de experimentación (`sol-high`), la hora del run (h15.2 de 100), la familia de entrenamiento (`success-complete-v2-sft`) y el paso (`step_1`).

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4B), un tamaño de 18,8 GB en formato safetensors con 4 shards, y una ventana de contexto heredada del modelo base Qwen3.5-9B-Base (no especificada en la información disponible). Su relevancia radica en ser un punto de control intermedio de un experimento de investigación sobre entrenamiento agéntico, no un modelo final listo para producción. La model card indica que es el "mejor checkpoint de la celda" en el momento de su extracción, pero carece de licencia, idiomas declarados y benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-9B-Base, un transformer denso de aproximadamente 9,4 mil millones de parámetros. No se dispone de detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La model card indica que el checkpoint proviene de un run de 100 horas con "reasoning effort high" y que el driver es "Codex / gpt-5.6-sol", lo que sugiere que el entrenamiento fue dirigido o supervisado por un modelo de razonamiento avanzado, pero no se especifica el método exacto.

El entrenamiento corresponde a una etapa de SFT (supervised fine-tuning) denominada `success-complete-v2-sft`. El checkpoint se guardó en la hora 15,2 del run, lo que lo convierte en un punto intermedio. La model card destaca que los `eos_token_id` son `[248044, 248046]`, siendo `248046` el token `<|im_end|>` del template de chat de Qwen3.5, lo que garantiza que el modelo detiene correctamente las respuestas al final de cada turno. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, conserva las capacidades generales de generación y razonamiento del modelo base, aunque no se han publicado evaluaciones específicas.
- Capacidades agénticas: el entrenamiento SFT está orientado a tareas de agente, lo que sugiere mejora en el uso de herramientas y en la resolución de tareas multi-paso, aunque no hay métricas que lo confirmen.
- Soporte de tool calling / function calling: no confirmado explícitamente, pero es probable dado el contexto agéntico del entrenamiento.
- Soporte de agentes y multi-step reasoning: el nombre del run (`success-complete-v2-sft`) y la celda `sol-high` indican un enfoque en completar tareas con éxito, probablemente con razonamiento encadenado.
- Capacidades multilingües: no disponibles (el modelo base Qwen3.5 suele ser multilingüe, pero no se especifica).
- Capacidades especiales: no se documentan modos de pensamiento, visión o audio.

## Casos de uso

- Investigación en entrenamiento agéntico: este checkpoint es útil para estudiar la evolución de las capacidades agénticas durante un barrido de entrenamiento. Los investigadores pueden comparar este punto intermedio con otros checkpoints del mismo run para trazar curvas de rendimiento a lo largo del tiempo.
- Evaluación de checkpoints intermedios: sirve para validar si el entrenamiento está convergiendo correctamente en la hora 15 de un run de 100 horas, permitiendo ajustar hiperparámetros o detener el entrenamiento temprano si es necesario.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede utilizarse como punto de partida para continuar el entrenamiento con otros datasets o técnicas, aprovechando el conocimiento ya adquirido.
- Reproducción de experimentos: los investigadores pueden descargar este checkpoint para reproducir los resultados del sweep AgentPTB y verificar la reproducibilidad de los experimentos.
- Análisis de tokens EOS: el checkpoint incluye los tokens EOS correctos, lo que permite estudiar el comportamiento de finalización de secuencia en modelos entrenados con el template de chat de Qwen3.5.
- Desarrollo de agentes con base Qwen3.5: aunque no es un modelo final, puede servir como base experimental para prototipar agentes que requieran razonamiento con herramientas, antes de usar un checkpoint más avanzado del mismo run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. El autor advierte que los números de evaluación de checkpoints sin el token EOS correcto son un "suelo, no una medida", pero este checkpoint sí lo tiene, por lo que sus evaluaciones (si existieran) serían comparables con otros del mismo estado. No obstante, no se proporcionan datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en FP16, se necesitan aproximadamente 19 GB de VRAM solo para los pesos. Con cuantización a 8 bits, unos 10 GB; a 4 bits, unos 5-6 GB. No se proporcionan cuantizaciones oficiales, pero son posibles mediante herramientas como llama.cpp o GPTQ.
- GPU recomendadas: para inferencia en FP16, una GPU con 24 GB (RTX 3090/4090, A5000) es suficiente. Para cuantización 4-bit, una RTX 3060 de 12 GB podría funcionar. Para entrenamiento o fine-tuning, se recomienda al menos una A100 de 40 GB o H100.
- Compatibilidad con GPU de consumo: sí, con cuantización 4-bit cabe en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB). En FP16 requiere 24 GB, disponible en RTX 3090/4090.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers. Dado que es un checkpoint intermedio, se recomienda usar Transformers para evaluación y llama.cpp para prototipos ligeros.
- Latencia y throughput: no disponibles. Dependerá del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-high.h015 (este) | 9,4B | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 128K (típico) | Apache 2.0 (Qwen2.5) | Hugging Face |

No se dispone de datos de rendimiento comparativo. El modelo base Qwen3.5-9B-Base es el punto de partida, y este checkpoint es una variante ajustada. No hay información sobre otros modelos de la misma categoría (9B agénticos) en los resultados de búsqueda.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo run. No debe usarse en producción sin una evaluación exhaustiva.
- Licencia no especificada: al no indicarse licencia, no se puede garantizar el uso comercial. Se debe contactar al autor antes de cualquier uso comercial.
- Sesgos y alucinaciones: no se han evaluado. Al ser un modelo derivado de Qwen3.5, puede heredar sesgos del modelo base y del dataset de entrenamiento, pero no hay datos.
- Riesgo de alucinación: no documentado, pero probable en tareas agénticas si el modelo no tiene acceso a herramientas reales.
- Limitaciones de contexto: la longitud de contexto no se especifica; se asume la del modelo base Qwen3.5-9B-Base, pero no se confirma.
- Idiomas: no se declaran idiomas soportados; el modelo base Qwen3.5 suele ser multilingüe, pero no hay garantía.
- Reproducibilidad: el checkpoint está ligado a un run específico; los resultados pueden variar si se reentrena desde cero.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h015.success-complete-v2-sft.step_1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
- Resultados de búsqueda relacionados (no directamente sobre este modelo):
  - https://huggingface.co/trillionlabs/gravity-sft-v7-agentic
  - https://github.com/simpletoolsindia/golden-agentic-dataset
  - https://huggingface.co/buckets/tensorov/Nemotron-SFT-Agentic-v2-bucket
  - https://github.com/pat-jj/Awesome-Adaptation-of-Agentic-AI
  - https://openai.com/index/gpt-5-6/
