# Bercraft/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking-Q8_0-GGUF

## Resumen

El modelo **Bercraft/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking-Q8_0-GGUF** es una conversión a formato GGUF (cuantización Q8_0) del fine-tune `DavidAU/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking`, realizado por el usuario Bercraft mediante la herramienta GGUF-my-repo de llama.cpp. El modelo base es una variante de Qwen3.5-27B, un transformer denso con atención lineal y capacidades multimodales (imagen-texto), que ha sido ajustado con técnicas de *abliteration* para eliminar restricciones de contenido, orientándose específicamente a escritura creativa, ficción, generación de tramas y roleplay.

Este modelo resulta relevante para desarrolladores y creadores que buscan un generador de texto sin censura, con fuerte énfasis en narrativa y prosa vívida, y que además pueda procesar entradas de imagen. Al estar en formato GGUF, puede ejecutarse localmente con llama.cpp, llama-server o a través de interfaces como Ollama, lo que facilita su integración en aplicaciones de escritorio o servidores sin depender de APIs externas. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Con 26.895.998.464 parámetros (aproximadamente 27B), el archivo Q8_0 ocupa 28.6 GB, lo que exige hardware con al menos 30 GB de VRAM para una inferencia fluida. No se han publicado resultados de benchmarks específicos para este fine-tune, aunque el modelo base Qwen3.5-27B ha demostrado capacidades comparables a modelos de mayor tamaño en tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención lineal, multimodal (visión-lenguaje) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (archivo GGUF) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-27B, un transformer denso que incorpora atención lineal para mejorar la eficiencia de inferencia, según la información de QwenCloud. Además, es un modelo nativo de visión-lenguaje, lo que le permite procesar tanto texto como imágenes. El fine-tune realizado por DavidAU aplica técnicas de *abliteration* (eliminación de capas de rechazo) para producir un modelo "uncensored", y se ha entrenado específicamente para tareas de escritura creativa, generación de tramas, continuación de escenas y roleplay.

No se dispone de detalles sobre el dataset de entrenamiento del fine-tune, ni sobre el número de tokens o el proceso de alineación (RLHF/DPO) aplicado. El modelo base Qwen3.5-27B, según QwenCloud, integra avances en aprendizaje multimodal, eficiencia arquitectónica y escala de refuerzo, aunque no se especifican los métodos exactos. La conversión a GGUF se realizó con llama.cpp, manteniendo la fidelidad de los pesos en cuantización Q8_0.

## Capacidades

- Generación de texto creativo: especializado en ficción, ciencia ficción, romance y todos los géneros narrativos, con énfasis en prosa vívida y descriptiva.
- Generación de tramas y sub-tramas: capaz de crear estructuras argumentales complejas y desarrollar subtramas coherentes.
- Continuación de escenas: puede continuar una historia existente manteniendo el tono y el estilo.
- Roleplay: adecuado para juegos de rol textuales, con capacidad de mantener personajes y contextos durante conversaciones largas.
- Procesamiento multimodal: al ser un modelo de visión-lenguaje, puede recibir imágenes como entrada y generar descripciones o narrativas basadas en ellas (aunque no se detalla la implementación exacta en este fine-tune).
- Multilingüe: soporta inglés y chino, aunque su entrenamiento específico para escritura creativa probablemente esté más optimizado para inglés.

## Casos de uso

- Escritura de novelas y relatos: un autor puede usar el modelo para generar borradores de capítulos, desarrollar personajes o explorar giros argumentales, aprovechando su capacidad para mantener coherencia narrativa en textos largos.
- Generación de guiones para juegos de rol: los creadores de juegos de mesa o videojuegos pueden emplear el modelo para crear diálogos, descripciones de escenarios y misiones, con la ventaja de no tener restricciones de contenido.
- Asistente de escritura para blogs y contenido creativo: el modelo puede ayudar a redactar entradas de blog con un estilo narrativo atractivo, generando introducciones, metáforas o ejemplos ilustrativos.
- Creación de contenido para redes sociales: generar hilos de Twitter, publicaciones de Instagram o guiones para YouTube con un tono creativo y sin censura, útil para marcas que buscan diferenciarse.
- Prototipado de narrativa interactiva: en aplicaciones de ficción interactiva o aventuras de texto, el modelo puede generar respuestas dinámicas a las acciones del usuario, manteniendo la inmersión.
- Análisis y descripción de imágenes: al ser multimodal, puede recibir una imagen y generar una descripción narrativa o una historia basada en ella, útil para accesibilidad o para crear contenido a partir de fotografías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.5-27B, según QwenCloud, tiene capacidades comparables al Qwen3.5-122B-A10B, pero no se proporcionan cifras concretas de MMLU, HumanEval u otros tests. Para este fine-tune específico, no hay datos de rendimiento en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 pesa 28.6 GB, por lo que se necesitan al menos 30 GB de VRAM para cargar el modelo completo en memoria. Con cuantizaciones menores (p. ej., Q4_K_M) podría reducirse a unos 16-18 GB, pero no se dispone de archivos alternativos en este repositorio.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB no es suficiente para Q8_0, pero sí para cuantizaciones inferiores si se generan), o GPUs de datacenter con 32 GB o más.
- En consumer GPU: no cabe en una RTX 4090 con Q8_0; se necesitaría una RTX 6000 Ada (48 GB) o similar. Con cuantizaciones Q4 o Q5 podría ejecutarse en una RTX 3090/4090 (24 GB).
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-server, Ollama (si se importa el GGUF), y el espacio WebGPU de localellm que permite ejecutarlo en el navegador.
- Latencia y throughput: no se han publicado datos específicos. En una A100, un modelo de 27B en Q8_0 puede generar entre 20-40 tokens/segundo, dependiendo de la longitud de contexto y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| Bercraft/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking-Q8_0-GGUF | 26.9B | No disponible | Apache 2.0 | GGUF Q8_0 | Escritura creativa, roleplay, sin censura |
| DavidAU/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking (base) | 26.9B | No disponible | Apache 2.0 | Safetensors | Escritura creativa, roleplay, sin censura |
| Qwen3.5-27B (modelo oficial) | 27B | No disponible | Apache 2.0 | Safetensors, GGUF | Multimodal, atención lineal, uso general |
| mradermacher/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking-GGUF | 26.9B | No disponible | Apache 2.0 | GGUF (varias cuantizaciones) | Mismo fine-tune, pero con más opciones de cuantización |

La comparativa se basa en la estructura y el propósito, ya que no hay datos de rendimiento publicados. El modelo de Bercraft se distingue por ofrecer únicamente Q8_0, mientras que mradermacher proporciona varias cuantizaciones. El modelo oficial de Qwen es más generalista y no está ajustado para escritura creativa sin censura.

## Limitaciones y advertencias

- Contenido sin censura: al ser un modelo "uncensored" y "abliterated", puede generar texto inapropiado, ofensivo o dañino. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, nombres o detalles, especialmente en contextos creativos donde la verosimilitud no es crítica.
- Limitaciones de idioma: solo soporta inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Contexto limitado: no se ha especificado la longitud de contexto, lo que puede afectar a tareas que requieran ventanas largas (p. ej., novelas completas).
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, por lo que su calidad en usos no creativos es incierta.
- Requisitos de hardware elevados: el archivo Q8_0 necesita al menos 30 GB de VRAM, lo que limita su uso en equipos de consumo.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales o éticas dependiendo del contexto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Bercraft/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking-Q8_0-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking
- Versión GGUF alternativa (mradermacher): https://huggingface.co/mradermacher/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking-GGUF
- Demo WebGPU: https://huggingface.co/spaces/localellm/WebGPU-qwen3-5-27b-deckard-pkd-heretic-uncensored-thinking-i1-gguf
- Despliegue en FriendliAI: https://friendli.ai/models/DavidAU/Qwen3.5-27B-Deckard-PKD-Heretic-Uncensored-Thinking
- Modelo oficial Qwen3.5-27B en Ollama: https://ollama.com/library/qwen3.5:27b
- Información de QwenCloud sobre Qwen3.5-27B: https://www.qwencloud.com/models/qwen3.5-27b
