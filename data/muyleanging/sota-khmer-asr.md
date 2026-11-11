# muyleanging/sota-khmer-asr

## Resumen

Sota (សោតៈ, "oreja" en jemer) es un modelo de reconocimiento automático del habla (ASR) especializado en jemer, desarrollado por el usuario `muyleanging` y publicado en Hugging Face. Se trata de un modelo pequeño entrenado desde cero (no es un fine-tuning de un modelo existente), con 26 millones de parámetros y un tamaño de aproximadamente 33 MB en formato ONNX int8, lo que permite ejecutarlo offline en una CPU convencional o incluso dentro de un navegador web mediante onnxruntime-web.

El modelo resuelve el problema de la transcripción de voz en jemer, un idioma con recursos limitados en el ecosistema ASR, y lo hace con un CER declarado del 3,40 % (beam search de 5) sobre un conjunto de test de 16 hablantes nunca vistos en entrenamiento. La arquitectura es un encoder Conformer de 12 bloques con un cabezal CTC y un decodificador atencional de 3 capas, y utiliza un vocabulario de 3.402 tokens de clústeres escritos del jemer compartido con el modelo OCR Chakkhu del mismo autor.

Es relevante ahora porque demuestra que un modelo de 26M de parámetros, entrenado con datos reales y sintéticos, puede superar ampliamente en su dominio a alternativas mucho mayores como Qwen3-ASR-0.6B-Khmer (13,20 % CER) o whisper-small-khmer-v2 (18,57 % CER) en el conjunto de test del autor, y porque su formato int8 ONNX lo hace desplegable en dispositivos de bajos recursos sin GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 12 bloques) + cabezal CTC + decodificador atencional de 3 capas |
| Parámetros totales | 26M (submuestreo 1,8M + encoder 18,3M + CTC 0,9M + decoder 4,9M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada dividido automáticamente a partir de 15 s en puntos de silencio) |
| Tipos de cuantización | int8 (ONNX) y fp32 (ONNX y PyTorch) |
| Idiomas soportados | jemer (km), inglés (en) |
| Licencia | `sota-preview` (licencia personalizada, ver archivo LICENSE) |
| Formato de pesos | ONNX (int8 y fp32), safetensors (PyTorch fp32), tokens.json |
| Entrada de audio | 16 kHz mono; front-end log-Mel de 80 bins, ventana 25 ms, hop 10 ms, integrado en el modelo |
| Submuestreo | Dos convoluciones stride-2, de 10 ms a 40 ms por frame |
| Encoder | d_model 256, 4 cabezas con rotary position embeddings, FFN 1024, kernel convolucional 31 |
| Vocabulario | 3.402 tokens de clústeres escritos del jemer + especiales (0 pad, 1 BOS, 2 EOS, 3 unk, 4 CTC blank) |
| Decodificación | CTC greedy (rápida) o beam search de 5 con puntuación combinada 0,7 decoder + 0,3 CTC |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Conformer clásica para ASR: un front-end log-Mel integrado en el propio grafo ONNX (lo que permite alimentar audio PCM crudo a 16 kHz), dos convoluciones con stride 2 que reducen la resolución temporal de 10 ms a 40 ms por frame, y un encoder de 12 bloques Conformer con dimensión 256, 4 cabezas de atención con rotary position embeddings, FFN de 1024 y kernel convolucional de 31. Sobre el encoder se sitúan dos cabezales: un CTC head de 0,9M de parámetros y un decodificador atencional de 3 capas y 4,9M de parámetros que se preentrenó sobre 315.000 frases en jemer antes del entrenamiento con audio. El vocabulario de 3.402 tokens corresponde a clústeres escritos completos del jemer y se comparte con el modelo OCR Chakkhu del mismo autor.

El entrenamiento se realizó sobre VoxPocket v5 (privado): aproximadamente 237 horas de voz real en jemer más unas 610 horas de voz sintética generada con VoxPocket TTS, con la voz real usada siempre al completo y la sintética como máximo en la mitad de cada época. La división se hizo por hablante, eliminando voces clonadas y frases repetidas de dev/test (dev: 5,2 h y 8 hablantes; test: 12,0 h y 16 hablantes, solo voz real). Se aplicaron aumentaciones SpecAugment, cambios de velocidad 0,9/1,0/1,1, ruido de fondo MUSAN, eco de sala y simulación de llamada telefónica. La función de pérdida combinó 0,3·CTC + 0,7·cross-entropy con label smoothing 0,1, con AdamW, 25k pasos de warmup, precisión bf16 y un total de 100k pasos tras el preentrenamiento del decodificador. Todo el entrenamiento se completó en una única RTX 3090 Ti en unas 8 horas, y los pesos finales son el promedio de los últimos 5 checkpoints (80k–100k pasos). La decodificación usa un borrador CTC greedy seguido de beam search de 5 beams puntuado conjuntamente por decoder y CTC, con guardas de longitud que revierten al borrador CTC si el decoder se desvía o se detiene antes de tiempo.

## Capacidades

- Transcripción de voz a texto en jemer a partir de audio de 16 kHz mono, con resampling interno si la entrada tiene otra frecuencia o es estéreo.
- Decodificación en dos modos: CTC greedy (más rápida) y beam search de 5 con decodificador atencional (mayor precisión).
- Segmentación automática de audio largo: los audios de más de 15 segundos se dividen en puntos de silencio.
- Ejecución offline en CPU y en navegador mediante onnxruntime y onnxruntime-web, sin que el audio salga del dispositivo.
- Soporte nominal de inglés (etiqueta `en`), aunque el propio autor indica que solo 4 clips del test contienen palabras en inglés, insuficiente para evaluar el rendimiento en ese idioma.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades más allá de la transcripción ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en jemer: el modelo divide automáticamente audios largos en puntos de silencio y transcribe con un CER bajo en habla clara, lo que permite generar actas o subtítulos de sesiones grabadas sin depender de servicios en la nube.
- Subtitulado de vídeo y podcasts en jemer: la versión int8 ONNX procesa 1 minuto de audio en unos 0,2 s con CTC greedy en una CPU de portátil de 4 hilos, lo que hace viable generar subtítulos de forma masiva en local.
- Aplicaciones móviles o de escritorio offline: con 33 MB en int8, el modelo cabe en el binario de una app y funciona sin conexión, útil en regiones con conectividad limitada o para preservar la privacidad del audio del usuario.
- Dictado por voz en jemer dentro del navegador: la demo web oficial ejecuta el modelo con onnxruntime-web y el audio nunca abandona el dispositivo, lo que permite integrar dictado en aplicaciones web sin backend de inferencia.
- Digitalización de archivos orales y entrevistas de campo: el bajo coste computacional permite procesar grandes volúmenes de grabaciones en una sola máquina con CPU, sin GPU.
- Investigación en ASR de bajos recursos: al estar entrenado desde cero con datos reales y sintéticos y compartir vocabulario con un modelo OCR, sirve como base para experimentos de ASR multilingüe o de integración voz-texto en jemer.
- Preprocesamiento para pipelines de NLP en jemer: las transcripciones pueden alimentar sistemas de búsqueda, análisis o moderación de contenido en ese idioma.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el conjunto Sota held-out test: 12,0 h, 6.513 clips y 16 hablantes no vistos en entrenamiento. CER más bajo es mejor; texto jemer normalizado, sin espacios ni puntuación.

| Modelo | Tamaño | Todos (6.513) | nxkmer (5.508) | OpenSLR42 (1.005) |
|---|---|---:|---:|---:|
| **Sota** (beam 5) | **26M** · 33 MB int8 | **3,40 %** | **3,25 %** | 5,20 % |
| Sota (CTC greedy) | 26M | 3,62 % | 3,47 % | 5,54 % |
| Qwen3-ASR-0.6B-Khmer | 0,6B | 13,20 % | 13,34 % | 11,41 % |
| whisper-small-khmer-v2 | ≈244M | 18,57 % | 19,72 % | **4,61 %** † |

† whisper-small-khmer-v2 se entrenó sobre OpenSLR42, por lo que podría haber visto esas frases con anterioridad. El autor advierte que los hablantes de test son nuevos para Sota, pero las grabaciones provienen de las mismas fuentes y estilo que sus datos de entrenamiento, lo que favorece a Sota; también señala que parte de las diferencias son de estilo ortográfico y que solo 4 clips contienen inglés, insuficiente para puntuar. Los archivos ONNX int8 ofrecen la misma precisión que PyTorch (3,19 % frente a 3,15 % CER con beam search sobre 300 clips).

Velocidad declarada: en CPU de portátil con 4 hilos, 1 minuto de audio tarda aproximadamente 0,2 s con CTC greedy y 1,5 s con beam 5.

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el modelo está pensado para CPU. En GPU, los 33 MB int8 o 105 MB fp32 son triviales para cualquier tarjeta con memoria suficiente.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una RTX 3090 Ti, pero la inferencia no requiere GPU.
- Cabe en cualquier CPU convencional y en navegador; el autor lo describe como ejecutable en "una CPU normal" y en onnxruntime-web.
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web (navegador), PyTorch con safetensors, y el helper `sota_infer.py` para decodificación greedy y beam, división de audio largo y resampling.
- Latencia y throughput: 1 minuto de audio en ~0,2 s (CTC greedy) o ~1,5 s (beam 5) en CPU de portátil con 4 hilos, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sota | 26M | no disponible | 3,40 % (beam 5) | `sota-preview` (personalizada) | ONNX int8/fp32 y PyTorch en Hugging Face |
| Qwen3-ASR-0.6B-Khmer | 0,6B | no disponible | 13,20 % | no disponible en la información | Hugging Face (`seanghay/Qwen3-ASR-0.6B-Khmer`) |
| whisper-small-khmer-v2 | ≈244M | no disponible | 18,57 % (4,61 % en OpenSLR42 †) | no disponible en la información | Hugging Face (`seanghay/whisper-small-khmer-v2`) |

La comparación debe leerse con cautela: los tres modelos se evaluaron sobre el mismo conjunto de clips y con la misma regla de puntuación, pero el conjunto procede de fuentes y estilo similares a los datos de entrenamiento de Sota, y whisper-small-khmer-v2 pudo haber visto las frases de OpenSLR42 durante su entrenamiento.

## Limitaciones y advertencias

- Modelo de prueba temprana ("early test model"): el autor indica que rinde mejor con habla clara y que las llamadas telefónicas, el audio con ruido y la mezcla jemer-inglés no se han medido.
- El conjunto de test comparte fuentes y estilo con los datos de entrenamiento de Sota, lo que puede inflar sus resultados frente a los competidores.
- Parte de las diferencias de CER con otros modelos se debe a estilos ortográficos distintos (por ejemplo ហ្នឹង frente a នឹង); Sota aprendió la ortografía de sus propias etiquetas.
- Solo 4 clips del test contienen inglés, por lo que el rendimiento en ese idioma no está evaluado.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Riesgo de alucinación y de desviación del decodificador atencional: el propio sistema incorpora guardas de longitud que revierten al borrador CTC si el decoder se desvía o se detiene antes de tiempo.
- Licencia personalizada `sota-preview`: es necesario consultar el archivo LICENSE del repositorio para conocer las restricciones de uso comercial; no se detallan en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (10 de noviembre de 2026), lo que sugiere un modelo recién publicado y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/sota-khmer-asr
- Space de demostración: https://huggingface.co/spaces/INGMUYLEANG/sota-khmer-asr
- Demo en navegador: https://muyleanging.github.io/sota-web/#try
- Sitio web del proyecto: https://muyleanging.github.io/sota-web/
- Modelo OCR Chakkhu (vocabulario compartido): https://muyleanging.github.io/chakkhu-web/
- Qwen3-ASR-0.6B-Khmer (comparativa): https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
- whisper-small-khmer-v2 (comparativa): https://huggingface.co/seanghay/whisper-small-khmer-v2
