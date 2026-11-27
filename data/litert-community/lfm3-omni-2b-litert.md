# litert-community/LFM3-Omni-2B-LiteRT

## Resumen

LFM3-Omni-2B-LiteRT es la conversión al formato LiteRT del modelo multimodal any-to-any LiquidAI/LFM3-Omni-2B, publicada por la comunidad litert-community. El modelo original, desarrollado por Liquid AI, acepta texto, imagen, vídeo y audio como entrada y produce respuestas en texto o voz. Esta variante empaqueta el decodificador en un único fichero `.litertlm` cuantizado a int8 (3,23 GB) para su ejecución on-device con el runtime LiteRT-LM de Google, e incluye además grafos LiteRT y un runner en Python para la salida de voz.

La relevancia de esta ficha radica en que traslada un modelo omni-modal de 2,17 mil millones de parámetros al entorno móvil: según la model card, en un Galaxy S26 con GPU y LiteRT-LM 0.18.1 el fichero decodifica a 27,0 tokens/s con prefill de 1.139 tokens/s, y produce las mismas respuestas que en un Mac en los 14 prompts de prueba. Es, por tanto, una de las pocas opciones publicadas para inferencia multimodal (texto, imagen y audio) completamente local en teléfono.

El modelo está pensado para aplicaciones edge: asistentes de voz, descripción de imágenes, transcripción (ASR) y respuestas habladas (TTS) sin conexión. La conversión procede de la revisión `ce2458cb` del modelo base en BF16 y mantiene el tokenizador original sin cambios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base omni-modal any-to-any de Liquid AI; decodificador transformer convertido a LiteRT) |
| Parámetros totales | 2,17 B (modelo base en BF16) |
| Parámetros activos | no disponible |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | int8 (decodificador del `.litertlm`); grafos de voz en float32; el modelo base se publica también en GGUF |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), licencia "other" |
| Formato de pesos | `.litertlm` (LiteRT-LM), `.tflite` (grafos de voz), tokenizador JSON; el base en safetensors/GGUF |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base en la información proporcionada. La model card indica únicamente que LFM3-Omni-2B es un modelo any-to-any de Liquid AI que lee texto, imágenes, vídeo y audio y responde en texto o voz, con 2,17 B parámetros en BF16 en la revisión `ce2458cb`. No se especifican número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La conversión a LiteRT sí aporta detalles técnicos relevantes: el decodificador se cuantiza a int8 y se empaqueta junto con los codificadores de visión y audio en un único `.litertlm`; la salida de voz se implementa mediante grafos separados (depth decoder, frame embedding y codec decoder) que generan 12 códigos por trama de 80 ms, con ventana de overlap-add para el codec. El grafo `depth_frame2` incorpora las tres pasadas y el muestreo de los 12 códigos con temperatura 0,4 y penalización de repetición 1,2 como constantes. La entrada de audio se procesa en ventanas de 30 s y la de vídeo toma un fotograma por segundo con su audio (primeros 13 s).

## Capacidades

- Generación de texto a partir de texto, imagen o audio (pipeline any-to-any).
- Comprensión de imágenes: descripción y respuesta a preguntas sobre fotografías.
- Entrada de vídeo: primer tramo de 13 s, un fotograma por segundo junto con su pista de audio.
- Entrada de audio con reconocimiento de voz (ASR) en ventanas de 30 s; grabaciones de hasta 251 s caben en el contexto de 4.096 tokens.
- Salida de voz (TTS): síntesis de respuestas habladas y modo intercalado (pregunta hablada, respuesta hablada).
- Conversación multi-turno dentro del límite de contexto.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta modo de razonamiento explícito (thinking mode) ni soporte de agentes.
- Multilingüe: únicamente inglés según la model card.

## Casos de uso

- Asistentes de voz sin conexión: el modelo acepta audio de hasta 30 s por ventana y puede responder en voz mediante los grafos de TTS, lo que permite construir un asistente conversacional completo en el propio teléfono sin enviar datos a la nube.
- Descripción de imágenes para accesibilidad: dada una foto, el modelo genera una descripción en texto; con 27 tokens/s de decodificación en GPU móvil, la respuesta llega en pocos segundos y cabe en el contexto de 4.096 tokens.
- Transcripción de audio (ASR): con el prompt de sistema "Perform ASR in English", el modelo transcribe grabaciones de 16 kHz mono; grabaciones largas se procesan en ventanas de 30 s mientras quepan en el contexto.
- Análisis de vídeo corto: el bucle Kotlin del ejemplo `photo_voice_chat` prepara un vídeo de 12 s para preguntas en 11,0 s (Galaxy S26) o 23,6 s (Pixel 11 Pro), útil para consultas sobre clips breves capturados en el dispositivo.
- Respuestas habladas en aplicaciones de navegación o conducción: el modo TTS con 0,48–0,50 s de cómputo por segundo de audio en CPU M4 Max permite generar locuciones en tiempo real sin red.
- Procesamiento de datos sensibles en local: al ejecutarse íntegramente on-device (sin soporte NPU en esta versión, pero con CPU/GPU), es adecuado para audio o imágenes que no deben salir del dispositivo, como notas de voz médicas o documentos fotografiados.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.). Sí incluye mediciones de rendimiento de inferencia:

| Backend (Galaxy S26, LiteRT-LM 0.18.1) | Prefill (tok/s) | Decode (tok/s) | TTFT | Memoria pico (VmHWM) |
|---|---:|---:|---:|---:|
| GPU (fp16 activaciones) | 1.139 | 27,0 | 0,93–0,94 s | 1,05 GB (+ 3,08 GB GPU) |
| CPU, 4 hilos | 557 | 25,9 | 1,8–1,9 s | 3,42 GB |
| GPU (fp32 activaciones) | 270 | 23,5 | no disponible | no disponible |

Mediciones adicionales: salida de voz en CPU M4 Max a 0,48–0,50 s de cómputo por segundo de audio (decoder, depth decoder y frame embedding), más ~6 ms por cada 0,96 s de audio en el codec con 4 hilos. En el ejemplo Android, un vídeo de 12 s quedó listo para preguntas en 11,0 s (Galaxy S26, float32 en GPU) y 23,6 s (Pixel 11 Pro, float16 en GPU), medias de cuatro lecturas.

## Requisitos de hardware

- VRAM/RAM: el fichero `.litertlm` ocupa 3,23 GB en disco; en Galaxy S26 la GPU usa 3,08 GB adicionales y el proceso 1,05 GB, mientras que en CPU el proceso alcanza 3,42 GB.
- GPU recomendadas: GPU integradas de móvil de gama alta (Galaxy S26, Pixel 8a, Pixel 11 Pro documentados). No hay datos para A100, H100 ni RTX 4090.
- Cabe en consumer GPU de escritorio por tamaño, pero no se han publicado mediciones en ellas.
- Despliegue: runtime LiteRT-LM 0.18.1 (CPU o GPU) para el `.litertlm`; runner Python en `runner/` y ejemplo `examples/run_omni.py` para texto y voz; los grafos `.tflite` pueden ejecutarse con LiteRT 2.3.0 en Android (ejemplo Kotlin `photo_voice_chat`).
- NPU: no soportada en esta versión.
- Latencia: TTFT de 0,93–0,94 s en GPU móvil; decodificación de 27,0 tokens/s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparativa rigurosa. Como referencias de la misma categoría podrían considerarse el propio modelo base LiquidAI/LFM3-Omni-2B (BF16, sin cuantizar, para servidor) y su variante GGUF (LiquidAI/LFM3-Omni-2B-GGUF), ambos del mismo autor y con la misma licencia, pero no se han publicado en la información disponible métricas que permitan compararlos con esta conversión LiteRT más allá de que la model card afirma respuestas idénticas en los 14 prompts de prueba frente a la ejecución en Mac.

| Modelo | Parámetros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| LFM3-Omni-2B-LiteRT | 2,17 B | 4.096 | `.litertlm` int8 | lfm1.0 |
| LiquidAI/LFM3-Omni-2B | 2,17 B | no disponible | BF16 | lfm1.0 |
| LiquidAI/LFM3-Omni-2B-GGUF | 2,17 B | no disponible | GGUF | lfm1.0 |

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente el idioma `en`; no hay soporte multilingüe documentado.
- Contexto limitado a 4.096 tokens: una grabación de 502 s no cabe, según la propia model card.
- Entrada de audio limitada a ventanas de 30 s para respuesta en texto; la salida de voz acepta como máximo una grabación de 30 s.
- Entrada de vídeo restringida a los primeros 13 s (un fotograma por segundo con audio).
- Sin soporte de NPU en esta versión, lo que limita la eficiencia en dispositivos que dependen de ella.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia LFM Open License v1.0: es necesario revisar sus términos antes de uso comercial, ya que no es una licencia de código abierto estándar.
- La conversión es de la comunidad (litert-community), no oficial de Liquid AI; la calidad de la cuantización int8 puede diferir del modelo base.
- El ejemplo crea un nuevo Engine por pregunta, lo que puede afectar a la latencia en uso real si no se reutiliza.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM3-Omni-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Variante GGUF del base: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Licencia: https://huggingface.co/litert-community/LFM3-Omni-2B-LiteRT/blob/main/LICENSE
- Ejemplo Android `photo_voice_chat`: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/photo_voice_chat
