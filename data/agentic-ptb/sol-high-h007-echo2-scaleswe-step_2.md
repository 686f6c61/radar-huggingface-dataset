# agentic-ptb/sol-high.h007.echo2-scaleswe.step_2

## Resumen

El modelo `agentic-ptb/sol-high.h007.echo2-scaleswe.step_2` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros, aproximadamente 9,4B), orientado a tareas de razonamiento agéntico y resolución de problemas de ingeniería de software, como sugiere el nombre `scaleswe` (posiblemente relacionado con ScaleSWE, un agente de resolución de issues de GitHub). El checkpoint corresponde a la celda `sol-high`, que según la model card es la mejor celda del barrido, y fue generado con un driver basado en Codex / GPT-5.6-sol con esfuerzo de razonamiento alto.

La relevancia de este modelo radica en que representa un intento de mejorar las capacidades de agentes de codificación mediante fine-tuning sobre un modelo base de 9B, un tamaño que permite despliegue en GPUs de consumo. Sin embargo, es importante señalar que se trata de un checkpoint intermedio, no de un modelo final, y presenta una limitación crítica: el token de fin de secuencia (`eos_token_id`) está incompleto, lo que afecta a la generación de texto. No se dispone de información pública sobre benchmarks, licencia o detalles de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (probablemente multilingue como Qwen, sin confirmar) |
| Licencia | no disponible (depende de la licencia del modelo base Qwen, no indicada) |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer decoder-only `Qwen/Qwen3.5-9B-Base`, con 9,4B parámetros. Según la model card, forma parte de un barrido de entrenamiento del proyecto AgentPTB, donde la celda `sol-high` fue generada utilizando un driver basado en Codex / GPT-5.6-sol con esfuerzo de razonamiento alto. El checkpoint se encuentra en la ruta `outputs/echo2-scaleswe/weights/step_2` dentro del run, lo que indica que es un paso intermedio de un proceso de entrenamiento más amplio. No se proporcionan detalles sobre el dataset, el número de tokens de entrenamiento, ni si se utilizaron técnicas como RLHF o DPO. El nombre `echo2-scaleswe` sugiere una posible conexión con el proyecto ScaleSWE (agente de resolución de issues de GitHub) y con "Echo-2", aunque no hay confirmación oficial. La model card advierte que el `eos_token_id` está incompleto: solo incluye `[248044]` y falta `248046` (que corresponde a `<|im_end|>`), lo que implica que el modelo no detiene correctamente las respuestas y puede sobrepasar la ventana de contexto.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda las capacidades generales de generación y razonamiento del modelo base, aunque no se han verificado de forma independiente.
- Orientación a tareas de agente: el entrenamiento parece dirigido a mejorar el comportamiento agéntico, especialmente en el contexto de resolución de problemas de software (SWE), como sugiere el nombre `scaleswe`.
- Soporte de tool calling / function calling: no confirmado explícitamente, pero probablemente heredado del modelo base Qwen3.5, que sí lo soporta.
- Capacidades multilingues: no confirmadas, aunque Qwen3.5-9B-Base es multilingue.
- Limitación de generación: debido al `eos_token_id` incompleto, el modelo no genera el token de fin de turno correctamente, lo que afecta a la usabilidad en conversaciones multi-turno.

## Casos de uso

- Resolución de issues de GitHub: el modelo podría utilizarse como parte de un agente tipo ScaleSWE para analizar issues, proponer parches y generar código de corrección, aprovechando su fine-tuning orientado a SWE.
- Asistente de programación en entornos de desarrollo: integrado en un IDE o CLI, podría ayudar a generar código, explicar fragmentos o depurar errores, aunque requiere re-empaquetado para corregir el problema del eos.
- Automatización de tareas de mantenimiento de código: en pipelines de CI/CD, podría generar tests, documentación o refactorizaciones básicas, siempre que se gestione la generación de forma controlada.
- Prototipado de agentes de razonamiento multi-paso: dado su entrenamiento con esfuerzo de razonamiento alto, podría servir como base para experimentos de agentes que planifican y ejecutan acciones secuenciales.
- Investigación en fine-tuning de modelos de 9B: como checkpoint intermedio, es útil para estudiar la evolución del entrenamiento y comparar con otros pasos del barrido.
- Evaluación de técnicas de alineación agéntica: permite analizar cómo el fine-tuning afecta al comportamiento de agentes en tareas de software, aunque con la advertencia de que los resultados de evaluación son un límite inferior debido al problema del eos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte que, debido al `eos_token_id` incompleto, cualquier evaluación numérica sería un límite inferior y no una medición fiable. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 18.8 GB en precisión FP16/BF16, por lo que se necesitan al menos 20 GB de VRAM para cargar el modelo sin cuantización. Con cuantización a 8 bits (p. ej., mediante GPTQ o bitsandbytes) se reduciría a ~10 GB, y a 4 bits a ~5 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para FP16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) o superior. Para cuantización a 8 bits, una GPU de 12-16 GB (RTX 4070 Ti, RTX 4080) podría ser suficiente. Para 4 bits, una GPU de 8 GB (RTX 3060, RTX 4060) podría funcionar.
- Si cabe en consumer GPU: sí, con cuantización. En FP16 puro, solo en GPUs de gama alta con 24 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers. Dado que es un modelo basado en Qwen, es compatible con el ecosistema estándar.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización utilizada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Estructuralmente, se puede comparar con su modelo base `Qwen/Qwen3.5-9B-Base` y con otros modelos de ~9B como Llama 3.1 8B o Mistral 7B, pero sin resultados de benchmarks no es posible establecer una comparativa cuantitativa. La licencia y disponibilidad tampoco están claras. Se recomienda consultar la documentación del proyecto AgentPTB para más contexto.

## Limitaciones y advertencias

- Problema crítico de eos: el `eos_token_id` está incompleto (falta `248046`), lo que provoca que el modelo no genere el token de fin de turno y pueda sobrepasar la ventana de contexto. Es necesario re-empaquetar el modelo antes de usarlo en producción.
- Checkpoint intermedio: no es un modelo final, sino un paso intermedio de un barrido. Su rendimiento puede no ser representativo del mejor resultado posible.
- Sesgos y alucinaciones: al ser un fine-tuning de Qwen3.5-9B-Base, puede heredar sesgos del modelo base y presentar riesgo de alucinación, especialmente en tareas de código donde la generación incorrecta puede ser difícil de detectar.
- Licencia no especificada: no se indica la licencia del modelo. Depende de la licencia de Qwen3.5-9B-Base (normalmente Apache 2.0 o similar, pero no confirmado). Se debe verificar antes de uso comercial.
- Idiomas y contexto: no se especifican, por lo que no se garantiza un comportamiento multilingue ni una longitud de contexto concreta.
- Evaluación no fiable: debido al problema del eos, cualquier benchmark realizado sin corregir este defecto dará resultados engañosos.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h007.echo2-scaleswe.step_2
- Repositorio ScaleSWE (posible relación): https://github.com/AweAI-Team/ScaleSWE
- README de ScaleSWE: https://github.com/AweAI-Team/ScaleSWE/blob/main/README.md
- Artículo sobre GPT-5.6 Sol (mencionado como driver): https://mlhive.com/2026/07/inside-gpt-5-6-sol-agentic-reasoning-release
- Artículo sobre Echo-2 (posible relación por el nombre): https://spaitial.ai/blog/echo-2-release
