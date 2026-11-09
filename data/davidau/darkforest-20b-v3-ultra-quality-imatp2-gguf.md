# DavidAU/DarkForest-20B-V3-Ultra-Quality-ImatP2-GGUF

## Resumen

DarkForest-20B-V3-Ultra-Quality-ImatP2-GGUF es una cuantización GGUF de alta precisión del modelo DarkForest 20B v3.0, un modelo de lenguaje de 20.000 millones de parámetros especializado en generación creativa, narrativa, roleplay y escritura de ficción. Lo desarrolla DavidAU como un "upscale de 32 bits" del modelo original de TeeZee, reconstruido desde los ficheros maestros con precisión de 32 bits mantenida hasta el momento de la compresión a GGUF, e incluye un segundo pase de imatrix con datasets propios del autor.

El modelo resuelve el problema de la pérdida de calidad que se produce al cuantizar modelos grandes para consumo en hardware de gama consumer: según el autor, un cuantizado q4km de este repositorio opera a niveles de calidad comparables a un Q6 estándar, y los Q6 y Q8 superan el rendimiento del modelo original en precisión completa. La reducción de perplejidad reportada es de cerca del 10% (más de 752 puntos en q4km) para todos los cuantizados.

La relevancia actual del modelo es de nicho: está orientado a escritores, creadores de contenido y entusiastas del roleplay que necesitan un modelo de 20B con buena capacidad narrativa, seguimiento de instrucciones y manejo de escenas con múltiples personajes, ejecutable en GPUs de consumo. Su licencia Apache 2.0 y su formato GGUF lo hacen desplegable con llama.cpp y Ollama, aunque está entrenado únicamente en inglés y puede generar contenido NSFW.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; basado en el modelo original DarkForest 20B v3.0 de TeeZee) |
| Parametros totales | 19.994.362.880 (~20B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en varios niveles (q4km, Q6, Q8 mencionados explícitamente; imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base de origen) |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos internos del modelo base en la información proporcionada. Se sabe que DarkForest 20B v3.0 es un modelo transformer de aproximadamente 20.000 millones de parámetros, y que esta versión de DavidAU es un "upscale de 32 bits" reconstruido desde los ficheros maestros, con las fusiones (merges) realizadas en precisión de 32 bits hasta la compresión final a GGUF. Sobre ese resultado se aplica un segundo pase de imatrix ("Imatrix Plus 2") con datasets propios del autor para reforzar la calidad.

El autor reporta que este proceso mejora el seguimiento de instrucciones, el razonamiento, la profundidad, el matiz y la emoción del modelo, y que la perplejidad se reduce cerca de un 10% en todos los cuantizados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El modelo original de TeeZee se describe como orientado a roleplay y narrativa, con capacidad de alternar entre contenido SFW y NSFW de forma fluida.

## Capacidades

- Generación de texto creativo: narrativa, ficción, cuentos y escritura de escenas largas.
- Roleplay (RP) multi-turno con seguimiento de múltiples personajes en una misma escena.
- Seguimiento de instrucciones mejorado respecto al modelo original, según el autor.
- Alternancia fluida entre contenido SFW y NSFW sin romper el contexto.
- Escritura de temáticas maduras: PTSD, problemas mentales, relaciones complicadas.
- Sentido del humor mejorado respecto a la versión 1.0 del modelo original.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar capítulos, diálogos y descripciones de escena con matices emocionales, aprovechando su entrenamiento específico en narrativa y su capacidad de mantener personajes coherentes a lo largo de una escena.
- Roleplay conversacional: adecuado para plataformas de chat con personajes, ya que el modelo alterna entre contextos SFW y NSFW sin fricción y mantiene múltiples personajes activos en una misma escena.
- Generación de contenido para juegos de rol de mesa: el modelo puede actuar como narrador dinámico (game master) que improvisa tramas, PNJ y consecuencias narrativas en respuesta a las acciones de los jugadores.
- Prototipado de guiones y diálogos: útil para guionistas que necesitan borradores rápidos de escenas con tono maduro, ya que el modelo no evita temas complejos como el trauma o las relaciones difíciles.
- Creación de contenido para comunidades de ficción interactiva: el formato GGUF permite desplegarlo en entornos con GPUs de consumo, lo que facilita su uso en servidores comunitarios de roleplay.
- Exploración creativa local sin conexión: al ser un GGUF ejecutable con llama.cpp u Ollama, escritores pueden usarlo en su propia máquina sin depender de APIs externas ni enviar contenido sensible a terceros.
- Generación de variantes narrativas: útil para generar múltiples ramificaciones de una misma escena y comparar tonos, gracias a la mejora reportada en matiz y emoción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas internas de perplejidad: una reducción cercana al 10% (más de 752 puntos en q4km) para todos los cuantizados respecto al modelo original, y afirma que q4km opera a niveles de Q6 y que Q6/Q8 superan la precisión completa del original. No se proporcionan valores absolutos de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~20B en q4km requiere aproximadamente 12-14 GB de VRAM; en Q6 en torno a 16-18 GB; en Q8 alrededor de 21-23 GB (estimaciones orientativas según el tamaño de parámetros, no confirmadas en la información disponible).
- GPU recomendadas: RTX 4090 (24 GB) para Q6/Q8; RTX 3090 o RTX 4080 para q4km; A100 o H100 para precisión completa o despliegues multi-usuario.
- Cabe en GPU de consumo: sí, en q4km cabe en GPUs de 16 GB o más (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090); en Q6/Q8 requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repositorio incluye la etiqueta `endpoints_compatible`. No se menciona soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DarkForest-20B-V3-Ultra-Quality-ImatP2-GGUF | ~20B | no disponible | Apache 2.0 | GGUF | Upscale 32-bit con imatrix; orientado a narrativa y RP |
| DarkForest 20B v3.0 (TeeZee) | ~20B | no disponible | no disponible en la información | safetensors (presumiblemente) | Modelo original sin upscale |
| DarkForest V1 Ultra Quality 20B (DavidAU) | ~20B | no disponible | Apache 2.0 | GGUF | Primera versión del upscale 32-bit |
| Psyonic-Cetacean (Space Whale) Ultra Quality 20B (DavidAU) | ~20B | no disponible | no disponible en la información | GGUF | Otro upscale 32-bit del mismo autor |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Entrenado únicamente en inglés: el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Puede generar contenido NSFW: no es apto para todos los públicos ni para despliegues sin filtrado en entornos abiertos.
- Riesgo de alucinación: como todo modelo generativo de esta escala, puede inventar hechos, nombres o detalles inconsistentes, especialmente en contextos largos.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero el entrenamiento orientado a ficción madura puede amplificar estereotipos en temáticas sensibles.
- Longitud de contexto no especificada: no se puede garantizar el rendimiento en conversaciones muy largas o documentos extensos.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado (especialmente NSFW) puede estar sujeto a las políticas de la plataforma donde se despliegue.
- Las afirmaciones del autor sobre mejora de perplejidad y calidad no están respaldadas por benchmarks independientes publicados en la información disponible.
- Modelo de nicho con solo 260 descargas y 9 likes: comunidad pequeña, menor soporte y validación externa que modelos mainstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/DarkForest-20B-V3-Ultra-Quality-ImatP2-GGUF
- Modelo original DarkForest 20B v3.0 (TeeZee): https://huggingface.co/TeeZee/DarkForest-20B-v3.0
- DarkForest 20B v2.0 (TeeZee): https://huggingface.co/TeeZee/DarkForest-20B-v2.0
- Dark Forest V1 Ultra Quality 20B (DavidAU): https://huggingface.co/DavidAU/Dark-Forest-V1-Ultra-Quality-20b-GGUF
- Psyonic-Cetacean (Space Whale) Ultra Quality 20B (DavidAU): https://huggingface.co/DavidAU/Psyonic-Cetacean-Ultra-Quality-20b-GGUF
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
