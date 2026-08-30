# npario/Tiel-Coder-35B-A3B-MLX-oQ4e

## Resumen

Tiel-Coder-35B-A3B-MLX-oQ4e es una cuantizacion 4-bit del modelo Ornith-1.5-35B-A3B, realizada con el cuantizador oQ4e de oMLX e incorporando la plantilla de chat Sharp. El modelo resultante esta orientado a tareas de codificacion agente y conversaciones multi-turno largas, priorizando la eficiencia de tokens y la velocidad de inferencia sobre el rendimiento en examenes de conocimiento general. El autor lo describe como "el codificador rapido del arsenal", con un equilibrio entre capacidad de resolucion de problemas reales y velocidad de ejecucion.

El modelo base, Ornith-1.5-35B-A3B, es una variante de la familia Qwen3.5 con arquitectura MoE de 35 mil millones de parametros totales y 3 mil millones activos, que incluye capacidades de vision (image-text-to-text). Esta version concreta esta cuantizada a 4-bit con precision mixta dinamica y un pase imatrix, ocupando 21.1 GB en disco. El checkpoint incluye la plantilla Sharp, que segun las mediciones del autor reduce la longitud de las respuestas a costa de una pequena perdida en tareas de conocimiento.

La relevancia de este modelo reside en su especializacion para flujos de trabajo de codificacion agente en hardware local, especialmente en Apple Silicon, donde el formato MLX y la cuantizacion oQ4e ofrecen un rendimiento medido de hasta 121.4 tokens por segundo. Su licencia MIT permite uso comercial sin restricciones, y su tamano de 21 GB lo hace viable en equipos de gama alta de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), familia Qwen3.5 |
| Parametros totales | 35B (6.045.761.392 en safetensors cuantizados) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4-bit dinamico con imatrix) |
| Idiomas soportados | ingles, chino |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer con arquitectura MoE de 35B parametros totales y 3B activos por token, perteneciente a la familia Qwen3.5. Incluye capacidades multimodales de vision (image-text-to-text), lo que permite procesar tanto texto como imagenes. El checkpoint original incorpora un bloque MTP (multi-token-prediction) con pesos sin entrenar, que fue eliminado en esta conversion.

Esta version concreta no es un entrenamiento nuevo sino una re-cuantizacion del modelo base realizada con el cuantizador oQ4e de oMLX, que aplica precision mixta dinamica con un pase imatrix. Ademas, se ha sustituido la plantilla de chat original por la plantilla Sharp, disenada para producir respuestas mas cortas y directas. Segun las mediciones del autor, el cambio de plantilla reduce la puntuacion en MMLU-Pro en 4.3 puntos (de 78.0 a 73.7) pero mejora el rendimiento en tareas de conversacion multi-turno.

Los datos de entrenamiento del modelo base no estan disponibles en la informacion proporcionada, aunque se indica que el modelo fue entrenado con tecnicas de RLHF o DPO similares a las de la familia Qwen.

## Capacidades

- Generacion de texto y codigo: el modelo esta especializado en tareas de codificacion agente, resolviendo problemas reales de repositorios en SWE-bench-Live.
- Razonamiento multi-turno: mantiene conversaciones largas y utiles, con una puntuacion de 67.2 en Claw-Eval, superando a su modelo base (65.3) y a alternativas como Nail (60.5).
- Vision: al ser un checkpoint image-text-to-text, puede procesar imagenes y responder preguntas sobre ellas, sin necesidad de un proyector separado.
- Tool calling y function calling: no se menciona explicitamente, pero su orientacion a codificacion agente sugiere compatibilidad con flujos de agente.
- Multilingue: soporta ingles y chino.
- Eficiencia de tokens: la plantilla Sharp produce respuestas mas cortas, reduciendo el numero de tokens generados por tarea.

## Casos de uso

- Codificacion agente en local: el modelo puede integrarse en flujos de trabajo de agentes de codigo que necesitan resolver issues de repositorios. Con 12 de 25 problemas resueltos en SWE-bench-Live y una mediana de 8.6 minutos por intento, es adecuado para entornos de desarrollo donde la velocidad importa.
- Asistente de programacion en IDE: su capacidad para mantener conversaciones multi-turno largas lo hace util como copiloto en editores de codigo, donde el contexto de la sesion se acumula a lo largo de la interaccion.
- Analisis de capturas de pantalla y diagramas: gracias a sus capacidades de vision, puede explicar el contenido de imagenes, diagramas de arquitectura o capturas de errores en pantalla.
- Chatbots de soporte tecnico: su rendimiento en Claw-Eval (67.2) y su habilidad para responder sin hacer demasiadas preguntas de aclaracion lo hacen adecuado para sistemas de atencion al cliente que requieren respuestas directas.
- Procesamiento de documentacion tecnica en chino e ingles: su soporte bilingue permite trabajar con documentacion en ambos idiomas, algo util en equipos internacionales.
- Prototipado rapido de agentes conversacionales: su licencia MIT y su formato MLX facilitan la experimentacion en entornos de investigacion sin restricciones de uso comercial.

## Benchmarks y rendimiento

Los datos de benchmarks provienen de la model card del autor y de la busqueda web. Es importante senalar que las mediciones de SWE-bench-Live y Claw-Eval se realizaron sobre la version GGUF, no sobre esta version MLX. El autor advierte que el cambio de cuantizador puede mover los resultados.

| Benchmark | Tiel-Coder (4-bit) | Ornith-1.5 (base) | Nail (4-bit) | Opus 4.6 (medium) |
|---|---|---|---|---|
| SWE-bench-Live (25 problemas) | 12 resueltos | 8 resueltos | 9 resueltos | 12 resueltos |
| Tiempo medio por intento (SWE-bench) | 8.6 min (mediana) | 5.5 min | 7.2 min (mediana) | no disponible |
| Claw-Eval (multi-turno) | 67.2 | 65.3 | 60.5 | no disponible |
| MMLU-Pro | 73.7 | 78.0 | 84.0 | no disponible |

Rendimiento de inferencia medido en la busqueda web:

| Hardware | Velocidad |
|---|---|
| Apple M5 Max (40c, 128GB) | 1.962 tok/s (prefill), 70.5 tok/s (generacion) |
| Comunidad (mejor de 5 runs, 1 GPU) | hasta 121.4 tok/s |

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 21.1 GB en disco, por lo que se recomienda al menos 24 GB de memoria unificada en Apple Silicon o 24 GB de VRAM en GPU dedicadas.
- GPU recomendadas: Apple Silicon con 32 GB o mas de memoria unificada (M-series Pro/Max/Ultra). En GPU NVIDIA, se necesitarian tarjetas con 24 GB o mas (RTX 4090, A5000, etc.).
- En consumer GPU: cabe en RTX 4090 (24 GB) y en Mac Studio con M-series Max/Ultra. No cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: oMLX (runtime principal), mlx-vlm para cargar el checkpoint correctamente. No usar mlx-lm, que produce tokens basura por un desajuste de cargador.
- Latencia y throughput: en Apple M5 Max se midieron 70.5 tok/s de generacion y 1.962 tok/s de prefill. En la comunidad se reportan hasta 121.4 tok/s en configuraciones optimas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench-Live | MMLU-Pro | Licencia |
|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B (este) | 35B total, 3B activo | no disponible | 12/25 | 73.7 | MIT |
| Nail-Qwen3.6-35B-A3B | 35B total, 3B activo | no disponible | 9/25 | 84.0 | no disponible |
| Dirk-Qwen3.8-27B (dense) | 27B dense | no disponible | 15/25 | no disponible | no disponible |
| Qwen3.6-35B-A3B (stock) | 35B total, 3B activo | no disponible | 8/25 | 85.3 | no disponible |

Tiel-Coder es el mejor de su clase (MoE 35B-A3B) en tareas de codificacion agente, pero pierde claramente en conocimiento general frente a Nail y al modelo stock. Dirk, un modelo denso de 27B, resuelve mas problemas pero a 2.5x el tiempo por intento.

## Limitaciones y advertencias

- Rendimiento pobre en tareas de conocimiento general: MMLU-Pro de 73.7, muy por debajo de alternativas como Nail (84.0). No es adecuado para examenes o tareas que requieran hechos precisos.
- La plantilla Sharp reduce la calidad de las respuestas en tareas de razonamiento: 4.3 puntos de diferencia en MMLU-Pro atribuidos al cambio de plantilla.
- Las mediciones de SWE-bench y Claw-Eval se realizaron en la version GGUF, no en esta version MLX. El cambio de cuantizador puede mover los resultados (el autor midio una diferencia de 0.7 puntos en MMLU-Pro y 24% en conteo de tokens entre MLX y GGUF).
- No incluye el bloque MTP (multi-token-prediction) que el modelo base lleva con pesos sin entrenar. Para decodificacion especulativa, existe una version separada con la cabeza MTP.
- Debe cargarse con mlx-vlm, no con mlx-lm. Usar el cargador incorrecto produce tokens basura sin aviso.
- El modelo tiende a responder sin hacer suficientes preguntas de aclaracion: 5.1 puntos menos que el modelo base en clarificaciones, lo que puede ser un problema en tareas ambiguas.
- Solo soporta ingles y chino. No hay soporte para otros idiomas.

## Enlaces

- Repositorio HuggingFace (MLX oQ4e): https://huggingface.co/npario/Tiel-Coder-35B-A3B-MLX-oQ4e
- Repositorio HuggingFace (GGUF): https://huggingface.co/npario/Tiel-Coder-35B-A3B-GGUF
- Repositorio HuggingFace (MLX oQ4e, autor original): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Repositorio HuggingFace (MLX oQ4e con MTP): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Plantilla Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Benchmark oMLX (M5 Max): https://omlx.ai/benchmarks/performance/v0vqpewy
- Benchmark comunidad: https://llm-bench.io/models/tiel-coder-35b-a3b-mlx-oq4e
- Benchmark comunidad (version MTP): https://llm-bench.io/models/tiel-coder-35b-a3b-mlx-oq4e-mtp
