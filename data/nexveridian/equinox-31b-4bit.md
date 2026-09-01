# NexVeridian/Equinox-31B-4bit

## Resumen

Equinox-31B-4bit es una conversión a formato MLX del modelo Equinox-31B de LatitudeGames, especializado en narrativa interactiva y juegos de aventura de texto. El modelo original, desarrollado por LatitudeGames, se basa en Gemma 4 31B Instruct y ha sido ajustado mediante supervisión fina (SFT) durante dos épocas sobre un conjunto de datos equilibrado que combina narrativas de aventura oscuras y orientadas a consecuencias con escritura de "slice-of-life" centrada en personajes. Esta versión cuantizada a 4 bits, publicada por NexVeridian, mantiene las capacidades del modelo base pero reduce significativamente su huella de memoria, lo que permite su ejecución en hardware de consumo con Apple Silicon.

La relevancia de este modelo radica en su propósito específico: generar historias coherentes y atractivas para juegos de texto, roleplay y ficción interactiva. Al estar cuantizado y optimizado para MLX, se integra fácilmente en entornos de desarrollo que utilizan la librería mlx-lm, facilitando su despliegue en aplicaciones de generación de texto conversacional. Aunque el nombre sugiere 31 mil millones de parámetros, el archivo safetensors indica 4.797.583.676 parámetros, una discrepancia que se aborda en las especificaciones técnicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 4) |
| Parametros totales | 4.797.583.676 (segun safetensors; el modelo base se anuncia como 31B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Equinox-31B es un ajuste fino de Gemma 4 31B Instruct, un transformer decoder-only con atención estándar. LatitudeGames realizó dos épocas de supervisión fina sobre un dataset curado que combina narrativas de aventura con consecuencias oscuras y escritura de personajes tranquila y detallada. El objetivo es mejorar la coherencia narrativa, la gestión de consecuencias y la profundidad emocional en la generación de texto interactivo. La versión 4-bit aquí presentada es una conversión a MLX realizada con mlx-lm 0.32.0, que mantiene la arquitectura original pero reduce la precisión de los pesos para optimizar el uso de memoria en Apple Silicon. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre técnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto narrativo: produce historias coherentes y atractivas, especialmente diseñadas para aventuras de texto y roleplay.
- Conversacion multi-turno: al ser un modelo instruct, puede mantener diálogos contextuales en escenarios de ficción interactiva.
- Adaptacion a estilos: el entrenamiento en dos tipos de narrativa (oscura y slice-of-life) permite alternar entre tonos y géneros.
- Soporte de chat: incluye plantilla de chat (chat_template) para su uso con la API de mlx-lm.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Juegos de aventura de texto: el modelo puede generar descripciones de escenarios, reacciones de personajes y ramificaciones de la trama en tiempo real, manteniendo coherencia con las acciones del jugador gracias a su entrenamiento específico.
- Roleplay en línea: integrable en plataformas de chat para interpretación de personajes, donde el modelo responde con diálogos y narraciones acordes al contexto establecido por los usuarios.
- Prototipado de narrativa interactiva: los desarrolladores pueden usarlo para generar contenido de prueba en motores de ficción interactiva como Twine o Ink, acelerando el diseño de historias ramificadas.
- Asistente de escritura creativa: sirve como generador de ideas, descripciones o diálogos para autores que trabajan en géneros de fantasía, ciencia ficción o terror.
- Simulacion de personajes en entornos educativos: en aplicaciones de aprendizaje de idiomas o dramatización, el modelo puede interpretar personajes históricos o ficticios para practicar conversaciones.
- Generacion de contenido para juegos de mesa: puede crear encuentros, descripciones de mazmorras o diálogos de PNJ para campañas de rol de mesa, adaptándose al tono de la partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o su versión cuantizada.

## Requisitos de hardware

- Memoria: el repositorio ocupa 17.3 GB, por lo que se recomienda al menos 20 GB de memoria unificada en Apple Silicon para cargar el modelo en RAM.
- GPU: diseñado para Apple Silicon (M1, M2, M3 y superiores) mediante MLX. No se recomienda para GPU NVIDIA sin conversión adicional.
- Opciones de despliegue: mlx-lm (Python), compatible con la API de generación de texto. No se menciona soporte para vLLM, llama.cpp u Ollama en esta versión.
- Latencia y throughput: no disponibles; dependerán del chip y de la longitud de la secuencia generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|
| Equinox-31B-4bit (este) | 4.8B (segun safetensors) | no disponible | Apache-2.0 | MLX 4-bit | Narrativa interactiva |
| LatitudeGames/Equinox-31B | 31B | no disponible | Apache-2.0 | safetensors (original) | Narrativa interactiva |
| NexVeridian/gemma-4-31B-it-4bit | 31B (anunciado) | no disponible | Apache-2.0 | MLX 4-bit | Conversacional general |

La comparativa se basa en datos disponibles; no se conocen benchmarks que permitan evaluar rendimiento relativo.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado principalmente en inglés y en narrativas de ficción, puede reflejar sesgos culturales o estereotipos presentes en los datos de entrenamiento.
- Alucinacion: como todo modelo generativo, puede producir contenido inventado o inconsistente, especialmente en contextos largos o con instrucciones ambiguas.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto; podría ser insuficiente para historias muy extensas.
- Idioma: solo soporta inglés; no se recomienda su uso en otros idiomas sin adaptación.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia del modelo base (Gemma 4) si aplica.
- Discrepancia de parametros: el archivo safetensors indica 4.8B parámetros, mientras que el nombre del modelo sugiere 31B; esto puede deberse a un error en la conversión o a una arquitectura diferente. Se recomienda verificar antes de usar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NexVeridian/Equinox-31B-4bit
- Modelo base: https://huggingface.co/LatitudeGames/Equinox-31B
- Modelo similar (gemma-4-31B-it-4bit): https://huggingface.co/NexVeridian/gemma-4-31B-it-4bit
- Informacion sobre Gemma 4 en Ollama: https://ollama.com/library/gemma4:31b
