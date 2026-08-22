# mraleko/lore

## Resumen

Lore es un modelo de generación de texto especializado en código, desarrollado por mraleko como un fine-tune con QLoRA del modelo base Qwen/Qwen2.5-Coder-7B-Instruct. Se distribuye exclusivamente en formato GGUF con cuantización Q8_0, pensado para inferencia local en herramientas como Ollama y llama.cpp. El proyecto destaca por haber sido entrenado de extremo a extremo en una GPU de consumo con 8 GB de VRAM, alcanzando una puntuación pass@2 del 56,4 % en el benchmark de tareas de programación en Python de aider (133 tareas), superando los resultados publicados para el modelo base cuantizado y para algunos modelos comerciales más grandes.

El modelo se centra en flujos de trabajo de agentes de codificación y respuestas de archivos completos. Su arquitectura hereda las capacidades del Qwen2.5-Coder-7B-Instruct, incluyendo razonamiento y generación de código, pero el ajuste fino lo ha especializado en la reparación de código Python y en tareas de agente. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 32.768 tokens, pero no se especifica para este ajuste) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente inglés y chino, pero no se detalla en la informacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

Lore es un ajuste fino QLoRA (Low-Rank Adaptation) sobre el modelo Qwen2.5-Coder-7B-Instruct, que es un transformer decoder-only con 7.6 mil millones de parámetros. El entrenamiento se realizó con Unsloth, TRL y PEFT, utilizando rank-16 LoRA, gradient checkpointing y recuperación de checkpoints para poder ejecutarlo en una sola GPU de 8 GB (RTX 3060 Ti). El proceso consistió en dos fases: primero un ajuste inicial sobre un subconjunto de 2.000 ejemplos del dataset `Nexlab/fable5-agentic-coding-sft` (con límite de tokens), y después una continuación de entrenamiento con 128 ejemplos de reparación de código verificados mediante ejecución, formateados como conversaciones multi-turno de reintento. Esta segunda fase usó un contexto de 1.024 tokens, 16 pasos y una tasa de aprendizaje de 5e-7. Los datos de reparación se generaron con mutación determinista de AST, pruebas en subprocesos aislados y divisiones de entrenamiento/validación sin solapamiento de padres.

## Capacidades

- Generación de código Python de archivo completo, orientada a tareas de programación de agentes.
- Reparación de código incorrecto o incompleto mediante conversaciones multi-turno de reintento.
- Capacidad conversacional para instrucciones de programación en formato chat.
- Hereda el soporte de tool calling y function calling del modelo base Qwen2.5-Coder-7B-Instruct, aunque no se ha verificado específicamente en este ajuste.
- Ejecución de tareas de programación de nivel intermedio (benchmark Exercism Python).
- Inferencia local eficiente en GPU de consumo gracias a la cuantización Q8_0.

## Casos de uso

- Asistente de programación en IDE: se puede integrar en editores como VS Code o Neovim mediante Ollama o llama.cpp para sugerir implementaciones de funciones completas en Python, aprovechando su entrenamiento en tareas de codificación.
- Reparación automática de código: dado un fragmento de código con errores, Lore puede generar una versión corregida completa, útil en pipelines de CI/CD para autofix de fallos de compilación o de tests.
- Agente de desarrollo autónomo: el modelo puede usarse como backend de un agente que recibe tareas de programación y produce archivos de código completos, gracias a su formato de respuesta de archivo entero.
- Generación de scripts de automatización: para tareas administrativas o de análisis de datos, Lore puede producir scripts Python listos para ejecutar.
- Entrenamiento y educación: como herramienta para enseñar Python, el modelo puede explicar y corregir código en un entorno local sin depender de servicios en la nube.
- Prototipado rápido: en entornos de investigación o desarrollo ágil, se puede usar para generar funciones y módulos Python de manera iterativa, con verificación posterior.

## Benchmarks y rendimiento

El autor evaluó el modelo con aider v0.56.0 en 133 tareas de Python del benchmark Exercism, usando formato de edición de archivo completo y hasta dos intentos. Los resultados se presentan en dos ejecuciones:

| Ejecución | Pass@1 | Pass@2 |
|---|---|---|
| Primera | 48,1 % | 56,4 % (75/133) |
| Confirmación | 46,6 % | 54,9 % (73/133) |

La media de pass@2 entre las dos ejecuciones fue del 55,64 %. El autor también comparó con el modelo base cuantizado Qwen2.5-Coder-7B Q8_0 (51,9 % pass@2), Claude 3 Sonnet (54,9 %) y GPT-4o mini (55,6 %), aunque advierte que las condiciones de ejecución pueden diferir y que la variabilidad entre tareas es alta.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8_0 pesa 8,1 GB, por lo que se necesita al menos 8 GB de VRAM para inferencia con contexto moderado. Con contexto más largo se puede requerir más.
- GPU recomendadas: RTX 3060 Ti (8 GB) es suficiente para la inferencia; también funciona en RTX 3080, RTX 3090, RTX 4070, etc. Para uso en CPU, se puede usar llama.cpp con RAM suficiente.
- Compatible con tarjetas de consumo: sí, cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo.
- Opciones de despliegue: Ollama (con Modelfile incluido), llama.cpp (con `llama-cli`), también se puede usar con servidores compatibles con GGUF como llama.cpp server.
- Latencia y rendimiento: no se han publicado datos específicos de latencia o throughput; el rendimiento dependerá del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pass@2 (aider) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lore (este modelo) | 7,6 B | No disponible | 56,4 % (media 55,64 %) | Apache-2.0 | GGUF Q8_0 |
| Qwen2.5-Coder-7B-Instruct (Q8_0) | 7,6 B | 32.768 | 51,9 % | Apache-2.0 | Safetensors, GGUF |
| Claude 3 Sonnet | No publicado | 200k | 54,9 % | Propietaria | API |
| GPT-4o mini | No publicado | 128k | 55,6 % | Propietaria | API |

La comparativa es la que publica el autor del modelo. No se dispone de datos de otros modelos de código de tamaño similar (por ejemplo, CodeLlama-7B o DeepSeek-Coder-7B) en el mismo benchmark, por lo que no se puede establecer una comparación directa con ellos.

## Limitaciones y advertencias

- El modelo está especializado en Python y en tareas de archivo completo; puede tener un rendimiento inferior en otros lenguajes o en tareas de razonamiento general.
- Puede generar código incorrecto, inseguro o incompleto. Se recomienda revisar y probar el código generado antes de usarlo en producción.
- La cuantización Q8_0 puede introducir ligeras diferencias respecto al modelo sin cuantizar, aunque suele ser mínima.
- No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K; solo se ha evaluado en el benchmark de aider de Python.
- La longitud de contexto no se ha especificado para este ajuste, aunque el modelo base soporta 32.768 tokens; se recomienda probar con longitudes menores.
- El entrenamiento se realizó con un subconjunto limitado de datos; el modelo puede mostrar sesgos hacia los patrones de esos datos.
- No se han documentado sesgos específicos, pero como modelo de lenguaje puede reflejar sesgos presentes en sus datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mraleko/lore
- Repositorio GitHub: https://github.com/mraleko/Lore
- Releases del repositorio: https://github.com/mraleko/Lore/releases
- (No se incluyen otros enlaces porque los resultados de búsqueda sobre "Lore" se refieren a otros proyectos no relacionados con este modelo)
