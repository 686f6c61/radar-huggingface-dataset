# litert-community/Ornith-1.0-9B

## Resumen

Ornith-1.0-9B es un modelo de lenguaje denso de aproximadamente 9.000 millones de parámetros desarrollado por Ornith AI como parte de una familia de modelos open source orientada a *agentic coding*. El modelo parte de Qwen3.5-9B (su decodificador de texto es idéntico clave por clave a la configuración de Qwen3.5-9B) y aplica un post-entrenamiento propio basado en aprendizaje por refuerzo que optimiza tanto las soluciones generadas como el *scaffold* que guía los rollouts. La versión aquí descrita es la conversión realizada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`) para el runtime on-device de Google, pensada para despliegue en edge.

El modelo emplea la arquitectura híbrida de Qwen3.5: 32 capas, de las cuales 24 son atención lineal GatedDeltaNet y 8 son atención completa (una de cada cuatro). Esta combinación reduce drásticamente el coste de memoria de la caché KV en contextos largos, ya que solo las 8 capas de atención completa mantienen una caché creciente, mientras que las 24 capas lineales operan con estado recurrente de tamaño constante. El checkpoint original es multimodal, pero los ficheros LiteRT-LM contienen únicamente el decodificador de texto (8.953.803.264 de los 9.409.813.744 parámetros del release).

La relevancia de esta conversión reside en que permite ejecutar un modelo de 9B con capacidades de razonamiento y coding agéntico en hardware de consumo y dispositivos móviles, con ficheros cuantizados de entre 6,03 GB (Mixed INT4) y 9,20 GB (INT8). El modelo se distribuye bajo licencia MIT y está disponible en cuatro variantes de cuantización optimizadas para GPU y CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas GatedDeltaNet (atención lineal) + 8 capas de atención completa, base Qwen3.5 |
| Parámetros totales | 8.953.803.264 (solo decodificador de texto); 9.409.813.744 en el release completo con torre de visión |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens en el modelo original; 4.096 tokens en los ficheros LiteRT-LM |
| Tipos de cuantización | INT8 dinámico; Mixed INT4 (int4 blockwise-32 min-max en capas lineales, int8 en lm_head y embedding); variantes con composites GPU para LiteRT-LM 0.19.x |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La arquitectura es la híbrida de Qwen3.5: 32 capas con hidden size 4096, 16 cabezas de atención con 4 cabezas KV de 256 dimensiones, y atención lineal con 16 cabezas de clave y 32 de valor de 128 dimensiones. El vocabulario es de 248.320 tokens con embeddings no atados (*untied*). De las 32 capas, 24 usan GatedDeltaNet (atención lineal con estado recurrente y convolución de tamaño constante) y 8 usan atención completa, distribuidas una de cada cuatro. Solo estas 8 capas de atención completa mantienen caché KV creciente.

El post-entrenamiento de Ornith se basa en un framework que emplea aprendizaje por refuerzo para aprender tanto las soluciones como el *scaffold* que dirige los rollouts de resolución, lo que la empresa describe como "self-improving". No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset. El modelo es de razonamiento y su turno de asistente abre por defecto con un bloque `<think>`; sin embargo, los ficheros LiteRT-LM se ejecutan con el modo de pensamiento desactivado, escribiendo el bloque `<think>` vacío que la plantilla de Ornith genera con `enable_thinking=False`, de modo que las respuestas contienen únicamente la respuesta final. La razón técnica es que la plantilla conmutadora de la conversión de Qwen3.5-4B elimina el bloque de pensamiento de los turnos previos, lo que divergiría de la forma en que Ornith fue entrenado en conversaciones multi-turno.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento desactivado en estos ficheros.
- Codificación agéntica: el modelo está específicamente post-entrenado para tareas de *agentic coding* y resolución autónoma de problemas de software.
- Razonamiento multi-paso y ejecución de tareas agénticas con *scaffold* aprendido.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: la plantilla de chat está validada byte a byte contra la de Ornith para conversaciones sin herramientas; el soporte de herramientas no se detalla en la información disponible.
- Visión: el checkpoint original es multimodal, pero los ficheros LiteRT-LM contienen solo el decodificador de texto, por lo que no incluyen capacidades de visión.

## Casos de uso

- Asistente de coding en IDE o terminal: el modelo puede resolver tareas de modificación de repositorios y generación de parches, aprovechando su post-entrenamiento específico en *agentic coding* y sus resultados reportados en SWE-bench Verified (69,4).
- Automatización de tareas de ingeniería de software en pipelines de CI/CD: con 4.096 tokens de contexto en estos ficheros y decodificación a 44,9 tok/s en GPU (Mac Studio M4 Max), es adecuado para tareas acotadas de generación y revisión de código.
- Ejecución on-device en dispositivos móviles y edge: los ficheros `.litertlm` están diseñados para el runtime LiteRT-LM de Google, lo que permite desplegar el modelo en teléfonos y dispositivos con recursos limitados sin conexión a la nube.
- Prototipado rápido en portátiles con GPU de consumo: el fichero Mixed INT4 de 6,03 GB cabe en GPUs con 8 GB de VRAM o más, permitiendo experimentar con un modelo de 9B en hardware asequible.
- Agentes autónomos de resolución de incidencias: el modelo puede integrarse en bucles de razonamiento multi-paso para diagnosticar y corregir errores en bases de código, apoyándose en su entrenamiento con RL sobre scaffolds de solución.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse localmente con licencia MIT, permite procesar código propietario sin enviarlo a servicios externos.
- Evaluación comparativa de arquitecturas híbridas: útil para investigadores que quieran medir el comportamiento de la atención lineal GatedDeltaNet frente a atención completa en tareas de razonamiento y código.

## Benchmarks y rendimiento

Resultados reportados por el proveedor (no ejecutados en esta conversión):

| Benchmark | Ornith-1.0-9B | Qwen3.5-9B |
|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 43,1 | 21,3 |
| SWE-bench Verified | 69,4 | 53,2 |

Rendimiento de inferencia medido en la conversión LiteRT-LM:

| Fichero | Dispositivo / runtime | Métrica |
|---|---|---|
| `Ornith-1.0-9B_mixed_int4.litertlm` | Mac Studio M4 Max, GPU, litert-lm 0.18.0 | 44,9 tok/s (decodificación) |
| `Ornith-1.0-9B_mixed_int4_gpu_composite_v0190.litertlm` | Mac Studio M4 Max, GPU, litert-lm 0.19.2 | +29,4 % prefill y +24,8 % decodificación frente al Mixed INT4 anterior |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,03 GB para Mixed INT4 (GPU, LiteRT-LM 0.19.x), 6,06 GB para Mixed INT4 estándar, 9,17 GB para INT8 con composites GPU y 9,20 GB para INT8.
- GPU recomendadas: el modelo se ha probado en una Mac Studio M4 Max (GPU). No se especifican GPU NVIDIA o AMD concretas en la información disponible.
- Cabe en GPU de consumo: el fichero Mixed INT4 de 6,03 GB es apto para GPUs con 8 GB de VRAM o más; el INT8 de 9,20 GB requiere al menos 12 GB.
- Opciones de despliegue: runtime LiteRT-LM (versión 0.18.0 para los ficheros base y 0.19.x para los ficheros con composites GPU; los ficheros nuevos declaran `min_runtime_version` 0.19.0). No se mencionan vLLM, llama.cpp, Ollama ni TGI para estos ficheros.
- Latencia y throughput: 44,9 tok/s de decodificación en GPU (M4 Max, Mixed INT4, litert-lm 0.18.0); las variantes con composites GPU mejoran un 29,4 % el prefill y un 24,8 % la decodificación en litert-lm 0.19.2. No se dispone de datos de latencia en dispositivos móviles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato on-device | Rendimiento destacado |
|---|---|---|---|---|---|
| Ornith-1.0-9B (esta ficha) | ~9B (8,95B texto) | 262.144 (4.096 en LiteRT-LM) | MIT | LiteRT-LM | SWE-bench Verified 69,4; Terminal-Bench 2.1 43,1 |
| Qwen3.5-9B | ~9B | No disponible | No disponible | No disponible | SWE-bench Verified 53,2; Terminal-Bench 2.1 21,3 |
| Qwen3.5-4B (conversión LiteRT-LM) | ~4B | No disponible | No disponible | LiteRT-LM | No disponible |
| Qwen3.5-2B (conversión LiteRT-LM) | ~2B | No disponible | No disponible | LiteRT-LM | No disponible |

## Limitaciones y advertencias

- Los ficheros LiteRT-LM limitan el contexto a 4.096 tokens, muy por debajo de los 262.144 tokens del modelo original, lo que restringe tareas que requieran contexto largo.
- El modo de pensamiento está desactivado en estos ficheros; no se puede activar sin desviarse de la plantilla de chat con la que se validó la conversión.
- Solo se incluye el decodificador de texto: no hay capacidades de visión a pesar de que el checkpoint original es multimodal.
- Los benchmarks de Terminal-Bench 2.1 y SWE-bench Verified son reportados por el proveedor y no han sido verificados de forma independiente en esta conversión.
- Los ficheros con composites GPU requieren LiteRT-LM 0.19.0 o superior; en la GPU de 0.18.1 devuelven salida corrupta (`!!!…`).
- No se dispone de información sobre sesgos, idiomas soportados ni riesgo de alucinación específico del modelo.
- La licencia MIT permite uso comercial sin restricciones conocidas, pero debe verificarse en el repositorio original de Ornith AI.
- El tamaño del repositorio es de 45,7 GB, ya que contiene las cuatro variantes de cuantización.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/Ornith-1.0-9B
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.0-9B
- Modelo Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Conversión Qwen3.5-4B: https://huggingface.co/litert-community/Qwen3.5-4B
- Conversión Qwen3.5-2B: https://huggingface.co/litert-community/Qwen3.5-2B
- Conversión Qwen3.5-0.8B: https://huggingface.co/litert-community/Qwen3.5-0.8B
