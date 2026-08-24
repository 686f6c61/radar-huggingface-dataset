# jaslee/Ouro-1.4B-Thinking-terminal-sft

## Resumen

Ouro-1.4B-Thinking-terminal-sft es un fine-tuning supervisado (SFT) del modelo base ByteDance/Ouro-1.4B-Thinking, publicado por el usuario jaslee en HuggingFace. El modelo está diseñado específicamente para resolver tareas de agente de terminal, es decir, para interactuar con un shell mediante acciones JSON que un harness como `terminus-2` puede parsear y ejecutar. El problema que aborda es que el modelo base, aunque razona bien, emite texto en prosa en lugar de la estructura JSON requerida, lo que impide que el bucle de agente extraiga acciones. Este fine-tuning entrena el backbone completo para producir directamente las acciones en el formato esperado.

La arquitectura subyacente es la de Ouro, un modelo de lenguaje con bucle (Looped Language Model, LoopLM) desarrollado por ByteDance. En lugar de apilar capas transformer de forma secuencial, Ouro aplica los mismos bloques de transformer de forma recurrente (4 pasos recurrentes, R4), lo que permite un cómputo iterativo en espacio latente sin incrementar proporcionalmente el número de parámetros. El modelo tiene 1.434.652.673 parámetros totales (1,4B) y una licencia Apache 2.0. La longitud de contexto no se especifica en la información disponible.

Este checkpoint es relevante porque demuestra una solución práctica al problema de formato en agentes de terminal, un cuello de botella común en modelos de razonamiento cuando se usan como agentes. Aunque la evaluación completa en Terminal-Bench aún no se ha publicado, la comprobación inicial con un solo prompt muestra que el modelo genera el JSON de acción en pocos tokens (106) frente a los cientos del modelo base, lo que sugiere que el problema de formato está resuelto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Language Model (LoopLM) con 4 pasos recurrentes (R4) |
| Parametros totales | 1.434.652.673 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, precisión bf16 en entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ouro emplea una arquitectura de bloques compartidos que se aplican de forma recurrente sobre la secuencia de tokens. En el caso de Ouro-1.4B-Thinking, se utilizan 4 recurrencias (R4) para permitir razonamiento iterativo en espacio latente sin aumentar el número de parámetros. El modelo base fue entrenado por ByteDance con el objetivo de escalar el razonamiento latente mediante el número de recursiones como tercer eje de escalado, además del tamaño del modelo y los datos. El modelo Thinking es una variante que genera razonamiento antes de responder, similar a otros modelos de razonamiento.

El fine-tuning se realizó sobre una mezcla de tres corpus de trayectorias de agentes de terminal, todos generados con el mismo harness `terminus-2` que usa Terminal-Bench, para que las respuestas del asistente ya llevaran el formato de acción JSON esperado. La mezcla consistió en un 65% de Nemotron-Terminal-Corpus (NVIDIA), un 25% de TerminalTraj (m-a-p) y un 10% de OpenThoughts-Agent-v1-SFT. Las trayectorias se truncaron a los primeros 64 turnos y la pérdida se enmascaró para que solo se entrenara en los turnos del asistente, no en la salida del terminal. Se usó el objetivo de entrenamiento de la etapa I de Ouro, con una pérdida que combina la pérdida de lenguaje y una penalización por entropía (β=0.01). El entrenamiento se realizó en una sola GPU RTX A6000 con precisión bf16 y activación de checkpointing completo, durante 1000 pasos con un lote de 1 secuencia de 4096 tokens empaquetados. La pérdida bajó de 0.6 a 0.4–0.7 y la norma del gradiente descendió de 22 a 3–6. Los pesos cambiaron entre un 1.2% y un 3.4% respecto al base, siendo el `lm_head` el que más varió.

## Capacidades

- Generación de acciones JSON para agentes de terminal: el modelo emite directamente un objeto JSON con un comando de shell que puede ser parseado por el harness `terminus-2`.
- Razonamiento iterativo en espacio latente: gracias a la arquitectura looped, el modelo puede realizar cómputo adicional en capas internas sin aumentar el número de parámetros.
- Soporte para tareas de agente multi-turno: entrenado con trayectorias largas (hasta 376 turnos en TerminalTraj), aunque se truncaron a 64 turnos durante el entrenamiento.
- Formato de respuesta compacto: en la prueba de un solo prompt, el modelo generó 106 tokens de completion, frente a 800 del modelo base, deteniéndose limpiamente.
- Adaptación a un harness específico: el modelo está ajustado a los prompts del harness `terminus-2`; otros harnesses con esquemas de respuesta diferentes pueden quedar fuera de distribución.
- Capacidades multilingües: no se especifican en la información disponible.

## Casos de uso

- Automatización de operaciones en servidores: el modelo puede ejecutar comandos de administración de sistemas (instalar paquetes, comprobar logs, reiniciar servicios) generando la acción JSON adecuada y recibiendo la salida del terminal para continuar la tarea.
- Pruebas de seguridad y auditoría: como agente que explora el sistema, puede lanzar comandos de reconocimiento (por ejemplo, `ls`, `find`, `cat`) y razonar sobre los resultados para identificar vulnerabilidades.
- Gestión de entornos de desarrollo: puede navegar por repositorios, ejecutar tests, compilar o desplegar aplicaciones, generando los comandos necesarios en cada paso.
- Integración en pipelines de CI/CD: el modelo puede actuar como un agente que resuelve problemas de build o de infraestructura, emitiendo comandos y adaptándose a la salida del terminal.
- Asistente de línea de comandos en entornos de desarrollo: un desarrollador puede interactuar con el modelo para que ejecute tareas complejas en su shell, como buscar archivos, filtrar logs o modificar configuraciones.
- Evaluación de agentes de terminal en investigación: el modelo sirve como referencia para estudiar cómo el fine-tuning en formato de acción JSON mejora la capacidad de un modelo de razonamiento para ser usado en un harness de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la evaluación completa en Terminal-Bench no se ha completado todavía. La única comparación realizada es una prueba de un solo prompt contra el modelo base, que muestra que el checkpoint genera 106 tokens de completion, se detiene limpiamente y produce una acción JSON parseable, mientras que el base genera 800 tokens, se detiene por alcanzar el presupuesto y no emite JSON. Esta prueba no es un benchmark y no se debe interpretar como una métrica de éxito en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica. Con 1.4B parámetros, una cuantización de 16 bits requiere aproximadamente 2.8 GB de VRAM, pero el modelo se carga en safetensors con precisión bf16, por lo que se necesitarían unos 2.9 GB. Sin embargo, la arquitectura looped puede requerir más memoria al mantener estados intermedios de las 4 recurrencias. No hay datos oficiales.
- GPU recomendadas: el entrenamiento se realizó en una RTX A6000 (48 GB). Para inferencia, una GPU con al menos 8-12 GB de VRAM sería suficiente si se usa una cuantización de 8 bits o 4 bits, pero no se han probado cuantizaciones. Una RTX 3090 o RTX 4090 debería ser suficiente.
- Posibilidad de uso en consumer GPU: dado el tamaño de 1.4B, es probable que quepa en GPUs de consumo con 8 GB o más, pero la carga de la arquitectura looped puede aumentar el uso de memoria. No hay garantías.
- Opciones de despliegue: el modelo requiere `trust_remote_code=True` y no soporta `model.generate()` directamente; se necesita un bucle de decodificación token a token que llame a `model.model(...)`. Se menciona un ejemplo en `scripts/ouro_openai_server.py` de torchtitan. No se ha probado con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos. El modelo base es ByteDance/Ouro-1.4B-Thinking, y existen otros modelos de razonamiento de tamaño similar como Qwen3-1.4B o DeepSeek-Distill-1.5B, pero no se han encontrado comparaciones directas en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No ha sido evaluado en un benchmark completo de Terminal-Bench; la comprobación de un solo prompt es evidencia débil de que el formato de acción funciona, pero no de la tasa de éxito en tareas.
- El entrenamiento de 1000 pasos es una fracción pequeña de una época sobre la mezcla de datos; puede haber sobreajuste o falta de generalización.
- El modelo está entrenado específicamente para prompts del harness `terminus-2`. Otros harnesses de agente con esquemas de respuesta diferentes quedarán fuera de distribución y es probable que falle.
- La arquitectura Ouro requiere un código de carga personalizado (`trust_remote_code=True`); las versiones recientes de `transformers` necesitan parches (RoPE-init fallback, adaptación de la firma del attention mask) que también afectan al modelo base.
- No se puede usar `model.generate()`; es necesario un bucle de decodificación manual que pase `cache_position`. Esto limita su integración con librerías estándar.
- No se ha informado sobre sesgos, alucinaciones o limitaciones lingüísticas. Dado que es un modelo pequeño, puede tener alucinaciones en tareas complejas, pero no hay datos.
- La licencia Apache 2.0 permite uso comercial, pero el código personalizado de Ouro (de ByteDance) puede tener restricciones adicionales; se recomienda revisar la licencia del modelo base.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/jaslee/Ouro-1.4B-Thinking-terminal-sft
- Modelo base ByteDance/Ouro-1.4B-Thinking: https://huggingface.co/ByteDance/Ouro-1.4B
- Página del proyecto Ouro: https://ouro-llm.github.io/
- Paper "Scaling Latent Reasoning via Looped Language Models": https://arxiv.org/html/2510.25741v4
- Dataset Nemotron-Terminal-Corpus: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- Dataset TerminalTraj: https://huggingface.co/datasets/m-a-p/TerminalTraj
- Dataset OpenThoughts-Agent-v1-SFT: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-v1-SFT
- Terminal-Bench: https://github.com/laude-institute/terminal-bench
