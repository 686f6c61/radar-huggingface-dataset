# developerjeremylive/Ornith-1.5-9B-GGUF-etheroi

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de 9.000 millones de parámetros desarrollado por ornith-ai, diseñado para generación de código, razonamiento agéntico y tareas de ingeniería de software. Forma parte de la familia Ornith-1.5, que introduce un bucle de auto-mejora de extremo a extremo: el modelo genera sus propias tareas de entrenamiento, construye andamiajes (scaffolds) específicos para cada tarea y produce soluciones mediante aprendizaje por refuerzo, en lugar de depender de conjuntos de tareas fijados por humanos. Esta versión es la más ligera de la familia, pensada para despliegue eficiente en una sola GPU y, en su variante cuantizada, incluso en dispositivos móviles.

El modelo se distribuye en formato GGUF, lo que permite su ejecución en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles. Según la model card, supera a modelos de tamaño similar como Qwen3.5-9B en benchmarks de código y razonamiento, y compite con modelos mucho más grandes como Qwen3.6-35B-A3B y Gemma-4-31B en tareas específicas de SWE-bench. Su licencia MIT facilita su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante exacta) |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (niveles no especificados en la informacion disponible) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (tambien safetensors en el repo original) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo denso basado en la arquitectura transformer, aunque la model card no detalla la configuración exacta (número de capas, dimensiones, etc.). El entrenamiento sigue un enfoque de auto-mejora de extremo a extremo: el modelo propone nuevas tareas, genera andamiajes específicos para cada una y produce soluciones que se utilizan para entrenar la política mediante aprendizaje por refuerzo. Este proceso se extiende sobre el trabajo previo de Ornith-1.0, que se desarrolló sobre Qwen3.5 y Gemma4 con continued pretraining, mid-training y post-training. No se especifican el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de código y razonamiento agéntico: destacado en benchmarks de terminal y SWE-bench.
- Soporte de tool calling y function calling (implícito en tareas agénticas, aunque no se detalla explícitamente).
- Capacidad para ejecutar tareas de ingeniería de software complejas, como resolución de issues y edición de código.
- Razonamiento multi-paso y planificación, evidenciado en benchmarks de agente.
- Multilingüe: no se especifica, pero se infiere por su base en Qwen y Gemma.
- No se mencionan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistente de programación en IDE: el modelo puede sugerir código, refactorizar funciones y explicar fragmentos complejos, integrándose como plugin en VS Code o JetBrains.
- Automatización de tareas de terminal: gracias a su alto rendimiento en Terminal-Bench, puede ejecutar comandos, gestionar archivos y resolver problemas de sistema de forma autónoma.
- Resolución de issues en repositorios: con un 70.6% en SWE-bench Verified, es adecuado para pipelines de triaje y parcheo automático de bugs en proyectos open source.
- Agente de desarrollo autónomo: puede planificar y ejecutar tareas de desarrollo de software de varios pasos, como crear una feature completa, escribir tests y actualizar documentación.
- Chat técnico y soporte: su capacidad de razonamiento y generación de código lo hace útil para responder preguntas técnicas en foros o sistemas de ticketing.
- Despliegue en edge: la variante cuantizada GGUF permite ejecutarlo en dispositivos móviles o Raspberry Pi para asistentes offline de código.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos con otros modelos. Se presentan los datos disponibles:

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46.2 | 43.1 | 21.3 | 52.5 | 42.1 |
| Terminal-Bench 2.1 (Claude Code) | 47.0 | 40.6 | 18.9 | 49.2 | - |
| SWE-bench Verified | 70.6 | 69.4 | 53.2 | 73.4 | 52.0 |
| SWE-bench Pro | 47.5 | 42.9 | 31.3 | 49.5 | 35.7 |
| SWE-bench Multilingual | (dato cortado en la informacion) | - | - | - | - |

No se dispone de resultados de MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: según fuentes externas, la versión cuantizada a 4-bit cabe en 8 GB de VRAM (GPU de consumo) o 16 GB de RAM unificada en Mac.
- GPU recomendadas: RTX 3060/4060 (8 GB) para cuantización 4-bit; RTX 4090 o A100 para mayor precisión o mayor velocidad.
- Compatible con consumer GPU: sí, con cuantización GGUF.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptación), Transformers con carga de GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|
| Ornith-1.5-9B | 9B | No disponible | 70.6 | MIT |
| Qwen3.5-9B | 9B | No disponible | 53.2 | Apache 2.0 (asumido) |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | No disponible | 73.4 | Apache 2.0 (asumido) |
| Gemma-4-31B | 31B | No disponible | 52.0 | Gemma license |

Ornith-1.5-9B supera a Qwen3.5-9B en todos los benchmarks mostrados y se acerca a modelos mucho más grandes, aunque Qwen3.6-35B-A3B mantiene una ventaja en SWE-bench. La licencia MIT es más permisiva que las alternativas.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto en la model card.
- El modelo se basa en Qwen3.5 y Gemma4, por lo que puede heredar sesgos de esos modelos base.
- La longitud de contexto no está especificada; se recomienda verificar antes de usar en tareas de contexto largo.
- No se garantiza el rendimiento en idiomas distintos del inglés, aunque la base multilingüe sugiere cierta capacidad.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo puede tener limitaciones en cuanto a responsabilidad legal por su uso.
- Los benchmarks publicados son auto-reportados por el autor; se recomienda validación independiente antes de adoptarlo en producción.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/developerjeremylive/Ornith-1.5-9B-GGUF-etheroi
- Repositorio original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de ejecución local (Atomic Chat): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Análisis de rendimiento local (MindStudio): https://www.mindstudio.ai/blog/ornith-1-5-9b-local-test
