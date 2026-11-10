# jsantillana/Qwen3.6-35B-A3B-abliterated-v2

## Resumen

Qwen3.6-35B-A3B-abliterated-v2 es una variante "abliterated" (con los mecanismos de rechazo atenuados o eliminados mediante edición de pesos) del modelo Qwen3.6-35B-A3B, publicado por el usuario jsantillana en Hugging Face. El modelo base lo desarrolla el equipo Qwen (Alibaba), y se presenta como la primera variante de pesos abiertos de la serie Qwen3.6, construida sobre la retroalimentación de la comunidad y orientada a estabilidad y utilidad en entornos reales, con especial énfasis en flujos de trabajo de programación agéntica.

Arquitectura de tipo causal language model con codificador de visión, de mezcla de expertos (MoE) con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos. Emplea un diseño híbrido de capas que combina Gated DeltaNet (atención lineal) y Gated Attention, con 256 expertos de los cuales se activan 8 enrutados más 1 compartido. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000 tokens.

Su relevancia actual radica en dos factores: por un lado, la eficiencia computacional de un MoE de 35B con solo 3B activos, que lo hace viable en infraestructura moderada; por otro, la capacidad de procesar imagen y texto (pipeline image-text-to-text) junto con un contexto muy largo, lo que lo sitúa en la categoría de modelos multimodales de propósito general para agentes y codificación a escala de repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; MoE híbrido con Gated DeltaNet (atención lineal) y Gated Attention |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de transformer causal con codificador de visión y una columna vertebral híbrida. La dimensión oculta es de 2048, con 40 capas organizadas en un patrón de 10 bloques de la forma 3 × (Gated DeltaNet → MoE) seguido de 1 × (Gated Attention → MoE). Las capas Gated DeltaNet emplean 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; las capas Gated Attention usan 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. El embedding y la salida del LM tienen 248.320 entradas (con padding). La capa MoE contiene 256 expertos con dimensión intermedia de 512, activando 8 enrutados más 1 compartido. El modelo incorpora además entrenamiento con Multi-Token Prediction (MTP) en varios pasos.

El modelo base se entrena en dos fases, pre-entrenamiento y post-entrenamiento, según indica la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles de alineación (RLHF/DPO). Entre las innovaciones destacadas por el autor figura la "Thinking Preservation", una opción que permite retener el contexto de razonamiento de mensajes históricos para reducir la sobrecarga en desarrollos iterativos. Esta variante concreta, publicada por jsantillana, es una edición "abliterated" de los pesos del modelo base; no se detallan en la información disponible la metodología exacta de ablación ni los datos empleados para ello.

## Capacidades

- Generación de texto y razonamiento general en modalidad conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con codificador de visión integrado.
- Codificación agéntica: manejo de flujos de trabajo de frontend y razonamiento a nivel de repositorio, según destaca el autor del modelo base.
- Modo de razonamiento con preservación de contexto de "thinking" entre mensajes históricos (Thinking Preservation).
- Capacidad de contexto muy largo, con 262.144 tokens nativos y extensión hasta 1.010.000 tokens, adecuada para análisis de repositorios y documentos extensos.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte multilingüe: no disponible (los idiomas no están listados en la información proporcionada).
- Capacidades de audio: no disponibles.

## Casos de uso

- Codificación agéntica en repositorios: el modelo está optimizado para razonamiento a nivel de repositorio y flujos de frontend, por lo que puede emplearse en agentes que navegan un código base, localizan fallos y proponen parches con contexto de hasta 262.144 tokens.
- Resolución de incidencias tipo SWE-bench: con una puntuación de 73,4 en SWE-bench Verified, es adecuado para pipelines automáticos que reciben un issue y deben generar un parche verificable.
- Asistencia al desarrollo iterativo: la opción de Thinking Preservation permite mantener el hilo de razonamiento entre turnos, reduciendo la repetición de contexto en sesiones largas de depuración.
- Análisis de documentación técnica extensa: su ventana de contexto nativa permite ingerir manuales, especificaciones o bases de código completas sin fragmentación agresiva.
- Procesamiento multimodal de capturas y diagramas: al aceptar imagen y texto, puede interpretar capturas de interfaz, diagramas de arquitectura o errores visuales junto a la consulta textual.
- Despliegue en infraestructura moderada: con solo ~3B parámetros activos, el coste de inferencia por token es bajo en comparación con modelos densos de tamaño similar, lo que lo hace apto para servicios de atención al cliente o asistentes internos con alta concurrencia.
- Generación de código en producción con contexto largo: integrable en pipelines de CI/CD para revisión automática de cambios y generación de pruebas, siempre que se validen los resultados.

## Benchmarks y rendimiento

Datos disponibles en la model card del modelo base (Qwen3.6-35B-A3B), comparados con Qwen3.5-27B, Gemma4-31B, Qwen3.5-35BA3B y Gemma4-26BA4B:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de Terminal-Bench 2.0 no están completos en la información proporcionada. No se han publicado en la información disponible resultados de benchmarks para la variante abliterated concreta; los valores anteriores corresponden al modelo base Qwen3.6-35B-A3B y no deben atribuirse sin verificación a esta edición.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.951.822.704 parámetros, en precisión BF16 se requieren aproximadamente 72 GB de VRAM solo para pesos, más overhead de contexto KV. En cuantización de 8 bits, alrededor de 36 GB; en 4 bits, alrededor de 18-20 GB. Los tipos de cuantización oficiales no están disponibles en la información proporcionada.
- GPU recomendadas: para BF16, H100 80 GB, A100 80 GB o múltiples A100 40 GB. Para cuantizaciones de 8 y 4 bits, A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- GPU de consumo: en cuantización de 4 bits podría caber en RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque el contexto largo incrementa la memoria KV y puede requerir offloading. No confirmado por el autor.
- Opciones de despliegue: la model card indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. No se menciona soporte explícito de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La activación de solo ~3B parámetros por token sugiere un coste de cómputo bajo por token, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | ~3B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35BA3B | 35B | ~3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26BA4B | 26B | ~4B | no disponible | 17,4 | no disponible |

La variante abliterated hereda la arquitectura y el tamaño del modelo base, por lo que sus requisitos de hardware y contexto coinciden; su rendimiento en benchmarks puede diferir del original y no se han publicado mediciones específicas para esta edición.

## Limitaciones y advertencias

- La edición "abliterated" modifica los pesos para reducir los rechazos del modelo; esto puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado, y degradar el comportamiento alineado en producción.
- No se han publicado resultados de benchmarks para esta variante concreta; los datos de la model card corresponden al modelo base y no garantizan el mismo rendimiento tras la ablación.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de código y razonamiento de múltiples pasos; requiere verificación humana o automática de los parches generados.
- Idiomas soportados no especificados en la información disponible; no se puede confirmar la calidad en castellano ni en otros idiomas distintos del inglés.
- Aunque la licencia es Apache 2.0, conviene revisar los términos del modelo base Qwen3.6-35B-A3B y las condiciones de uso derivadas de la edición de pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en un intervalo de minutos; se trata de una publicación sin validación comunitaria.
- No se detalla la metodología de ablación ni el conjunto de datos empleado, lo que dificulta evaluar la magnitud y naturaleza de los cambios respecto al modelo original.
- El contexto extensible hasta 1.010.000 tokens puede implicar un coste de memoria KV elevado y degradación de la calidad en ventanas extremas; no se aportan mediciones al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/Qwen3.6-35B-A3B-abliterated-v2
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog del modelo base: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
