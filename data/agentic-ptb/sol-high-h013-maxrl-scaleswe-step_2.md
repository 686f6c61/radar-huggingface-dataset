# agentic-ptb/sol-high.h013.maxrl-scaleswe.step_2

## Resumen

El modelo `agentic-ptb/sol-high.h013.maxrl-scaleswe.step_2` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, desarrollado por el equipo `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros, aproximadamente 9,4B), orientado a mejorar capacidades de razonamiento y ejecución de tareas agénticas. El nombre del repositorio codifica la celda del barrido (`sol-high`), la hora del run en la que se guardó (h13.96 de 100), la familia (`maxrl-scaleswe`) y el paso (`step_2`).

El checkpoint está generado por un driver basado en GPT-5.6-Sol de OpenAI con esfuerzo de razonamiento `high`, y se describe como el mejor checkpoint de su celda en el barrido. Su rol es **intermedio**, no final, lo que significa que es una instantánea de un proceso de entrenamiento en curso. La relevancia de este modelo radica en que documenta un enfoque de post-entrenamiento con aprendizaje por refuerzo a escala (maxrl) sobre una base de 9B, un tamaño que permite ejecución en hardware de consumo, y que busca mejorar el rendimiento en tareas de codificación y agénticas.

La arquitectura subyacente es la de Qwen3.5-9B-Base, un transformer denso con ventana de contexto amplia (el valor exacto no se indica en la información disponible). El checkpoint se distribuye en formato `safetensors` con 4 shards y un tamaño total de 18,8 GB. La licencia no está especificada en la ficha, lo que limita su uso comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4B parámetros. Sobre esta base se aplica un proceso de post-entrenamiento con aprendizaje por refuerzo a escala (el nombre `maxrl-scaleswe` sugiere un barrido de escalado de RL). El checkpoint se genera en el contexto de un barrido de 100 horas, y este en particular corresponde a la hora 13,96 del run, con el driver `Codex / gpt-5.6-sol` a esfuerzo `high`. No se especifican los datos de entrenamiento, el número de tokens, ni si se usó RLHF o DPO. La única innovación técnica documentada es la correcta configuración de los tokens de fin de secuencia (`eos_token_id = [248044, 248046]`), donde `248046` corresponde a `<|im_end|>`, necesario para que el modelo detenga la generación al final de cada turno en el chat template de Qwen3.5.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda capacidades de generación de texto, razonamiento y comprensión de instrucciones.
- Codificación: el barrido está orientado a mejorar el rendimiento en tareas de codificación, como se infiere del driver (GPT-5.6-Sol es un modelo de codificación) y del contexto del proyecto.
- Tareas agénticas: el nombre del proyecto (AgentPTB) y el uso de un driver agéntico sugieren que el modelo está optimizado para ejecutar tareas multi-paso y uso de herramientas, aunque no se documenta explícitamente.
- Multilingüismo: no se especifican idiomas soportados; se asume herencia de Qwen3.5-9B-Base, pero no está confirmado.
- Tool calling / function calling: no se documenta explícitamente, pero es probable que la base Qwen3.5 lo soporte; no confirmado en la información disponible.
- Modo thinking: no se documenta.

## Casos de uso

- Generación de código en entornos de desarrollo: el modelo puede asistir en la escritura de funciones, scripts y fragmentos de código, aprovechando su base Qwen3.5-9B y el fine-tuning orientado a codificación. Es adecuado para integrarse en IDEs o pipelines de CI/CD como asistente de autocompletado.
- Prototipado rápido de agentes conversacionales: al ser un modelo de 9B, puede ejecutarse en hardware de consumo, lo que permite desplegar prototipos de chatbots o asistentes virtuales con razonamiento multi-turno.
- Automatización de tareas de razonamiento: el fine-tuning con RL sugiere mejoras en tareas que requieren cadenas de pensamiento, como resolución de problemas matemáticos o lógicos, aunque no hay benchmarks que lo confirmen.
- Evaluación de técnicas de post-entrenamiento: al ser un checkpoint intermedio, es útil para investigadores que estudian la dinámica del entrenamiento con RL a escala, comparando checkpoints de diferentes horas del run.
- Fine-tuning adicional: el modelo puede servir como punto de partida para fine-tuning en tareas específicas, dado su tamaño manejable y su base sólida.
- Investigación en seguridad de modelos agénticos: dado el contexto de agentes y el driver de alto esfuerzo, puede usarse para estudiar comportamientos de modelos en entornos simulados, aunque no hay documentación de capacidades de seguridad específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de MMLU, HumanEval, GSM8K ni otros. La única referencia a rendimiento es la nota de que el checkpoint tiene el `eos_token_id` correcto, lo que permite evaluaciones válidas, pero no se proporcionan números.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en FP16, se necesitan aproximadamente 19 GB de VRAM. Con cuantización INT8, unos 10 GB; con INT4, unos 5 GB. No se especifican cuantizaciones disponibles, por lo que estos valores son estimaciones basadas en el tamaño del modelo.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A5000) o superior. Para cuantización INT4, una GPU de 8 GB (RTX 3070/4060) podría ser suficiente, pero no está confirmado.
- Compatibilidad con GPU de consumo: sí, es probable que quepa en GPUs de consumo con cuantización, pero no hay datos oficiales.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede desplegarse con vLLM, llama.cpp, Ollama o TGI, siempre que se convierta a los formatos adecuados (GGUF, etc.). No se documenta soporte específico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-high (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 license | HuggingFace |

No se dispone de datos de rendimiento comparativos. La comparación se limita a parámetros y disponibilidad. El modelo base Qwen3.5-9B-Base es la referencia natural, y Llama-3.1-8B es una alternativa de tamaño similar, pero no hay benchmarks que permitan comparar rendimiento.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; puede tener comportamientos inestables o incompletos respecto a un modelo entrenado durante las 100 horas completas.
- Licencia no especificada: no se puede garantizar el uso comercial sin verificación previa con el autor.
- Sesgos y alucinaciones: al ser un fine-tuning de Qwen3.5-9B-Base, hereda los sesgos del modelo base, que no están documentados en esta ficha.
- Riesgo de sobreajuste: el entrenamiento con RL a escala puede provocar sobreajuste a los datos de entrenamiento, reduciendo la generalización.
- Contexto e idiomas: no se especifican, por lo que no se puede garantizar soporte para idiomas distintos del inglés o chino (típicos de Qwen).
- Seguridad: el contexto de agentes y el driver de alto esfuerzo pueden inducir comportamientos agénticos no deseados; no hay documentación de alineación o safety.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h013.maxrl-scaleswe.step_2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Página de GPT-5.6 (driver del barrido): https://openai.com/index/gpt-5-6/
- Preview de GPT-5.6 Sol: https://openai.com/index/previewing-gpt-5-6-sol/
- SWE-Bench Pro Leaderboard (benchmark de codificación agéntica): https://labs.scale.com/leaderboard/swe_bench_pro_public
