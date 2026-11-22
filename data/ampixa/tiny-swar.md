# ampixa/tiny-swar

## Resumen

Tiny Swar es un modelo de síntesis de voz (text-to-speech) con capacidad de clonación de voz para nepalí, desarrollado por Ampixa. Se construye sobre Swar, un modelo TTS nepalí basado en la arquitectura F5-TTS, mediante una poda estructural: se eliminan 6 de los 22 bloques transformer originales y se reentrena el modelo resultante de 16 bloques con voz en nepalí para recuperar calidad. El resultado es un modelo de 248,9 millones de parámetros (un 26 % menos que los 337,1 millones de Swar) que reduce el factor de tiempo real (RTF) de 0,445 a 0,329, es decir, aproximadamente un 35 % más rápido.

El modelo resuelve un problema concreto de eficiencia en despliegue: los sistemas TTS con clonación de voz suelen ser costosos en inferencia, y esta variante recortada permite generar un minuto de audio en unos 20 segundos en hardware Apple M2 Ultra (PyTorch MPS, fp32), frente a los ~27 segundos de Swar en las mismas condiciones. Está pensado para aplicaciones en nepalí donde la latencia y el coste de cómputo importan, como asistentes de voz o lectura de contenido.

La relevancia actual es doble: por un lado, demuestra una receta de compresión (poda de bloques + reentrenamiento) aplicada a un modelo TTS ya existente; por otro, mantiene la licencia CC BY-SA 4.0 heredada de Swar, lo que permite uso comercial con atribución y bajo la misma licencia. El modelo se publica con pesos en float16 (0,5 GB), vocabulario de caracteres y un cargador específico para la librería `f5-tts`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS (transformer de 16 bloques, podado desde 22) con vocoder Vocos mel-24kHz |
| Parámetros totales | 248.936.580 (248,9 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS condicionado por texto de referencia y texto a generar; F5-TTS fija la longitud de audio a partir del texto) |
| Tipos de cuantización | pesos publicados en float16; se recomienda upcast a fp32 al cargar; no se documentan otras cuantizaciones |
| Idiomas soportados | nepalí (ne) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (float16, 0,50 GB) + vocab.txt + config.json |

## Arquitectura y entrenamiento

Tiny Swar es una variante podada de Swar, que a su vez se basa en F5-TTS, un modelo de difusión por flujo (flow matching) para TTS con clonación de voz zero-shot. La poda elimina 6 de los 22 bloques transformer del modelo base, dejando 16 bloques, y el modelo resultante se reentrena sobre voz en nepalí para recuperar la calidad perdida. El vocabulario de caracteres de Swar se mantiene sin cambios y se recomienda usar el front end de texto y el chunking del release original de Swar para obtener los mejores resultados con texto nepalí.

Los datos de entrenamiento citados son Rasa (nepalí, 43 h, CC BY 4.0, AI4Bharat) e IndicVoices-R (nepalí, 89 h, CC BY 4.0, AI4Bharat). No se especifica en la información disponible el número total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO. La inferencia utiliza 16 pasos de flujo (nfe_step=16), CFG 2.0, sway −1 y semilla 0 como receta recomendada. El modelo emplea el vocoder Vocos mel-24kHz para convertir representaciones mel en audio.

## Capacidades

- Generación de voz en nepalí a partir de texto.
- Clonación de voz zero-shot: se proporciona un audio de referencia (`ref_file`) y su transcripción (`ref_text`) para condicionar la voz generada.
- Control de la generación mediante parámetros de inferencia: número de pasos de flujo (`nfe_step`), fuerza de CFG (`cfg_strength`), `sway` y semilla.
- Generación de audio de longitud determinada por el texto de entrada (F5-TTS fija la longitud a partir del texto).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del audio de referencia para clonación.
- Capacidad multilingüe limitada al nepalí según la model card.

## Casos de uso

- Asistentes de voz en nepalí: el modelo puede generar respuestas habladas con una voz clonada concreta usando un clip de referencia y su transcripción, adecuado para agentes conversacionales donde la latencia importa (RTF 0,329 en M2 Ultra).
- Lectura de contenido y audiolibros en nepalí: con RTF 0,217 en frases largas, un minuto de texto narrado se genera en aproximadamente 13 segundos, lo que permite procesar lotes de texto de forma práctica.
- Clonación de voz para locuciones personalizadas: a partir de un audio de referencia y su transcripción se puede mantener una identidad de voz consistente en distintos textos, útil para vídeos o podcasts con voz de marca autorizada.
- Sistemas de accesibilidad: convertir texto nepalí en voz para lectores de pantalla o interfaces de accesibilidad, con un coste de cómputo menor que el modelo base de 337 M de parámetros.
- Prototipado rápido en investigación TTS: al ser un modelo pequeño (0,5 GB en float16) y cargar en 1,6 s, es adecuado para experimentar con recetas de poda, pasos de flujo y CFG en entornos de desarrollo.
- Despliegue en hardware de gama consumer: el tamaño reducido y la compatibilidad con PyTorch MPS permiten ejecutar inferencia en equipos Apple Silicon y GPUs consumer, útil para demos locales o aplicaciones de escritorio.
- Generación por lotes de avisos o mensajes hablados: la reducción de tiempo medio por clip (1,21 s frente a 1,63 s) abarata el procesamiento de muchos clips cortos, como notificaciones o mensajes de sistema.

## Benchmarks y rendimiento

Datos de velocidad publicados por el autor (Apple M2 Ultra GPU, PyTorch MPS, fp32, 16 pasos de flujo, CFG 2.0, sway −1, longitud mínima 2 s, semilla 0; 29 clips nepalíes: 20 frases cortas y 9 frases largas):

| Métrica | Swar | Tiny Swar |
|---|---|---|
| Bloques transformer | 22 | 16 |
| Parámetros | 337,1 M | 248,9 M (26 % menos) |
| RTF, todos los clips | 0,445 | 0,329 |
| RTF, frases cortas | 0,649 | 0,486 |
| RTF, frases largas | 0,298 | 0,217 |
| Tiempo medio por clip | 1,63 s | 1,21 s |
| Carga del modelo | 2,5 s | 1,6 s |
| Aceleración | – | 1,35× |

Calidad (conjunto de desarrollo nepalí de 80 ítems):

| Métrica | Swar | Tiny Swar |
|---|---|---|
| CER en texto largo | 5,5 % | 8,6 % |
| Similitud de voz | referencia | 0,04 menos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 0,50 GB en float16; al hacer upcast a fp32 los pesos ocupan aproximadamente 1 GB, más el vocoder Vocos y los buffers de activación. No se dispone de una cifra oficial de VRAM total; se estima holgadamente por debajo de 4 GB en fp32, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: el autor publica tiempos en Apple M2 Ultra GPU (PyTorch MPS). No se documentan mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: por tamaño (248,9 M de parámetros, 0,5 GB en float16) es compatible con GPUs consumer, aunque no se publican cifras de VRAM ni latencias específicas para ellas.
- Opciones de despliegue: la librería oficial es `f5-tts` (versión 1.1.22 en el ejemplo) con el cargador `load_tiny_swar.py` incluido en el repo; también es posible usar PyTorch MPS en Apple Silicon. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: RTF 0,329 global, 0,486 en frases cortas y 0,217 en frases largas en M2 Ultra; tiempo medio de 1,21 s por clip y carga de 1,6 s. Un minuto de audio tarda unos 20 segundos en generarse con RTF 0,329.

## Comparativa con modelos similares

| Modelo | Parámetros | Bloques | RTF (todos los clips) | CER texto largo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tiny Swar | 248,9 M | 16 | 0,329 | 8,6 % | CC BY-SA 4.0 | Hugging Face (ampixa/tiny-swar) |
| Swar | 337,1 M | 22 | 0,445 | 5,5 % | CC BY-SA 4.0 | Hugging Face (Aarjan/swar) |
| F5-TTS | no disponible en la información | no disponible | no disponible | no disponible | no disponible en la información | Repo SWivid/F5-TTS |

La comparación con otros modelos TTS nepalíes o de clonación de voz de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La poda reduce la precisión: el CER en texto largo sube del 5,5 % al 8,6 % en el conjunto de desarrollo nepalí de 80 ítems, y la similitud de voz baja 0,04 respecto a Swar.
- El modelo solo soporta nepalí; no se documentan capacidades multilingües.
- Riesgo de alucinación y artefactos en la síntesis: no se documentan métricas de naturalidad subjetiva (MOS) ni evaluaciones de robustez ante texto fuera de dominio.
- La clonación de voz puede imitar a personas reales; el autor advierte explícitamente que solo se debe clonar con permiso del hablante.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obliga a compartir las adaptaciones bajo la misma licencia; hay que revisar las obligaciones de compartir-al-igual en productos derivados.
- No se documentan sesgos específicos del modelo; al entrenarse con Rasa e IndicVoices-R, puede heredar sesgos de esos corpus en cuanto a acentos, géneros o variedades del nepalí.
- No hay soporte documentado de tool calling, agentes ni otras capacidades de modelos de lenguaje; es exclusivamente un modelo TTS.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.
- Los tiempos de referencia se midieron en Apple M2 Ultra con MPS y fp32; el rendimiento en otras GPUs o con otras precisiones puede diferir y no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/tiny-swar
- Modelo base Swar: https://huggingface.co/Aarjan/swar
- F5-TTS (repositorio): https://github.com/SWivid/F5-TTS
- Vocoder Vocos mel-24kHz: https://huggingface.co/charactr/vocos-mel-24khz
- Dataset Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset IndicVoices-R: https://huggingface.co/datasets/ai4bharat/indicvoices_r
- Sitio del autor: https://ampixa.com
