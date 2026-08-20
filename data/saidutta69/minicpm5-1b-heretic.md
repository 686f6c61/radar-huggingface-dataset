# saidutta69/MiniCPM5-1B-heretic

## Resumen

MiniCPM5-1B-heretic es una variante "decensored" del modelo MiniCPM5-1B de OpenBMB, producida mediante abliteración (ablación direccional) con la herramienta Heretic v1.4.0. La abliteración suprime el comportamiento de rechazo del modelo sin recurrir a fine-tuning, editando direcciones específicas de los pesos en las capas de atención y MLP. El resultado es un modelo de 1.080 millones de parámetros con la misma arquitectura LlamaForCausalLM, una ventana de contexto de 128K tokens y capacidades de tool calling, razonamiento y generación de código, pero sin las restricciones de los modelos RLHF.

El modelo está pensado para desarrolladores que necesitan un LLM compacto y local para agentes, roleplay, investigación sobre alineación o cualquier caso de uso en el que el rechazo del modelo base suponga un obstáculo. La divergencia KL con respecto al modelo base es de 0,0381, lo que indica que la modificación es quirúrgica y apenas altera el conocimiento y las habilidades del modelo. Las tasas de rechazo pasan de 96/100 en el modelo original a 2/100 en esta variante.

La licencia Apache 2.0 permite uso comercial y modificación, y el tamaño reducido permite desplegarlo en dispositivos de borde o GPUs de consumo. No obstante, la ausencia de filtros de seguridad es deliberada y el modelo puede generar contenido inapropiado, por lo que no se recomienda exponerlo a terceros sin moderación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (LlamaForCausalLM) |
| Parametros totales | 1.080.632.832 (1,08B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-1B es un transformer denso de 1,08B parametros desarrollado por OpenBMB. Fue entrenado con un corpus que incluye Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math y UltraData-SFT-2605, cubriendo texto general, datos de instruccion y razonamiento matematico. El modelo incorpora un modo de razonamiento hibrido "Think/No-Think" que permite activar o desactivar una fase de razonamiento intermedio, y alcanza una puntuacion media de 42,57 en una bateria de benchmarks de razonamiento, conocimiento, codigo, seguimiento de instrucciones, matematicas, logica y tareas agente.

La variante heretic se obtiene aplicando abliteracion con Heretic v1.4.0. La herramienta identifica los pesos que correlacionan con el comportamiento de rechazo y los edita de forma direccional (por ejemplo, con parametros como direction_index 12.73, attn.o_proj.max_weight 1.41, etc.). No se realiza ningun fine-tuning posterior, por lo que la base de conocimiento y las habilidades de instruccion se mantienen intactas. La divergencia KL entre el modelo heretic y el base es de 0,0381, lo que confirma que la edicion es muy localizada.

## Capacidades

- Generacion de texto en ingles y chino, con estilo conversacional.
- Razonamiento hibrido: soporta modo "Think" (con razonamiento intermedio) y modo "No-Think" (respuesta directa), controlable mediante el parametro `enable_thinking`.
- Generacion de codigo y soporte de tool calling mediante llamadas XML que SGLang convierte a funciones OpenAI-compatibles.
- Razonamiento multi-paso para tareas de agente.
- Ventana de contexto larga de 128K tokens, util para conversaciones extensas o analisis de documentos.
- Despliegue en entornos con recursos limitados: cabe en dispositivos de borde y en GPUs de consumo con cuantizacion GGUF.
- No tiene bloqueo de rechazo: responde a solicitudes que el modelo base rechazaria, lo que facilita casos de uso sin restricciones.

## Casos de uso

1. **Asistentes personales locales**: con 128K de contexto y soporte de tool calling, el modelo puede gestionar conversaciones multi-turno y ejecutar acciones en el sistema, como consultar el calendario o controlar dispositivos, todo en local.
2. **Generacion de codigo en produccion**: se puede integrar en pipelines de CI/CD para autocompletar, revisar o documentar codigo. Su capacidad de tool calling permite conectarlo con repositorios y entornos de ejecucion, aunque se recomienda supervisar su salida.
3. **Investigacion de alineacion y mecanismos de rechazo**: al ser un modelo abliterado, es util para estudiar como funcionan los mecanismos de rechazo en los LLM y evaluar el efecto de la abliteracion sobre el comportamiento y el rendimiento.
4. **Desarrollo de agentes autonomos**: su razonamiento multi-paso y su capacidad de llamar a herramientas lo hacen adecuado para construir agentes que interactuen con APIs, bases de datos o sistemas externos, por ejemplo en tareas de automatizacion.
5. **Chatbots para roleplay o narrativa interactiva**: la ausencia de rechazo permite generar respuestas creativas sin restricciones tematicas, lo que es adecuado para aplicaciones de entretenimiento o juegos de rol.
6. **Analisis de documentos largos**: la ventana de 128K permite procesar informes, manuales o libros completos en una sola pasada, extrayendo informacion o resumiendo contenido sin necesidad de dividir el texto.
7. **Despliegue en dispositivos de borde (edge)**: con un tamano de cuantizacion Q4_K_M de 656 MB, el modelo puede ejecutarse en dispositivos con poca memoria, como smartphones, camaras o sistemas embebidos, para inferencia local sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta variante abliterada. El modelo base MiniCPM5-1B alcanza una puntuacion media de 42,57 en los benchmarks de razonamiento, conocimiento, codigo, seguimiento de instrucciones, matematicas, logica y tareas agente, segun el repositorio de OpenBMB. Sin embargo, no hay datos de evaluacion de la variante heretic en estos mismos benchmarks. La divergencia KL de 0,0381 sugiere que el impacto en el rendimiento es minimo, pero se recomienda evaluar el modelo en el caso de uso concreto antes de un despliegue en produccion.

## Requisitos de hardware

- **VRAM estimada**: para inferencia con pesos BF16 (archivo `model.safetensors`, ~2,2 GB) se necesitan aproximadamente 3-4 GB de VRAM en total, considerando el runtime. Con cuantizacion GGUF Q4_K_M (656 MB) se puede ejecutar en menos de 1 GB de VRAM.
- **GPU recomendadas**: cualquier GPU de consumo con al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3060, 4060, 4090) puede manejar el modelo en BF16. Con cuantizacion Q4_K_M, tambien es viable en tarjetas de 2 GB o incluso en CPU con instrucciones AVX.
- **Despliegue en consumer GPU**: si, el modelo cabe en la mayoria de tarjetas graficas de gama media y alta. En cuantizacion Q4_K_M, tambien se puede ejecutar en dispositivos con memoria compartida (por ejemplo, Apple Silicon o SoCs).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, Jan, vLLM, SGLang (recomendado para tool calling). El archivo GGUF se carga directamente en estas herramientas.
- **Latencia y throughput**: no se han publicado datos medidos, pero al ser un modelo de 1B, se espera una generacion de decenas de tokens por segundo en GPU de consumo, con una latencia inferior a un segundo para respuestas cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Nota |
|---|---|---|---|---|---|
| MiniCPM5-1B-heretic (este) | 1,08B | 128K | Apache 2.0 | No disponible | Abliterado, sin rechazo |
| MiniCPM5-1B (base) | 1,08B | 128K | Apache 2.0 | Promedio 42,57 | Modelo original con rechazo |
| Qwen2.5-1.5B-Instruct-heretic | 1,5B | 128K | Apache 2.0 | No disponible | Abliterado, sin rechazo |
| Qwen2.5-1.5B-Instruct | 1,5B | 128K | Apache 2.0 | No disponible | Modelo base con rechazo |

No se dispone de una comparativa directa de benchmarks entre estas variantes abliteradas. Los modelos base de Qwen y MiniCPM son comparables en tamano y contexto, pero la abliteracion no altera el rendimiento en tareas estandar, solo el comportamiento de rechazo. Se recomienda evaluar cada modelo en el caso de uso especifico.

## Limitaciones y advertencias

- **Supresion deliberada del rechazo**: el modelo no tiene filtros de seguridad y puede generar contenido danino, ofensivo o ilegal si se le pide. La model card advierte explicitamente que no se debe exponer en un endpoint publico sin moderacion.
- **Alucinaciones**: como cualquier LLM, puede inventar informacion, especialmente en temas fuera de su entrenamiento. La informacion generada debe verificarse antes de usarla en contextos criticos.
- **Sesgos**: hereda los sesgos de los datos de entrenamiento del modelo base, que pueden reflejarse en respuestas estereotipadas o discriminatorias.
- **Idiomas**: solo soporta ingles y chino; el rendimiento en otros idiomas es practicamente nulo.
- **Contexto largo**: aunque soporta 128K tokens, el rendimiento puede degradarse con contextos muy largos, y el consumo de memoria puede ser elevado en esos casos.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, pero la responsabilidad del uso recae en el desarrollador. No hay garantias de seguridad ni de exactitud.
- **Reproducibilidad**: el modelo incluye una carpeta `reproduce` con configuracion, checksums y transcripciones de evaluacion, lo que permite verificar el proceso de abliteracion.

## Enlaces

- [Hugging Face - saidutta69/MiniCPM5-1B-heretic](https://huggingface.co/saidutta69/MiniCPM5-1B-heretic)
- [Modelo base: openbmb/MiniCPM5-1B](https://huggingface.co/openbmb/MiniCPM5-1B)
- [Repositorio Heretic (herramienta de abliteracion)](https://github.com/p-e-w/heretic)
- [Repositorio MiniCPM de OpenBMB](https://github.com/OpenBMB/MiniCPM)
- [Blog sobre abliteration de mlabonne](https://huggingface.co/blog/mlabonne/abliteration)
- [Paper MiniCPM5 (arXiv 2506.07900)](https://arxiv.org/abs/2506.07900)
- [Paper adicional citado en los tags (arXiv 2602.09003)](https://arxiv.org/abs/2602.09003)
- [Paper adicional citado en los tags (arXiv 2512.16649)](https://arxiv.org/abs/2512.16649)
- [Paper adicional citado en los tags (arXiv 2604.13016)](https://arxiv.org/abs/2604.13016)

Nota: los enlaces a los papers se han extraido de los tags del modelo; no se ha verificado su contenido en la busqueda web. Se incl
