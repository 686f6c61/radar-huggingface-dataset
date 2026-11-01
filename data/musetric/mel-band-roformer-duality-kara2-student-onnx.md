# musetric/mel-band-roformer-duality-kara2-student-onnx

## Resumen

Mel-Band RoFormer Duality and KARA 2 student es un modelo de separación de fuentes musicales desarrollado por el usuario musetric. Su tarea es descomponer una canción en tres pistas en una sola pasada: instrumental, voz principal (lead vocals) y coros (backing vocals). Se trata de una exportación a ONNX en fp16 del modelo PyTorch original `musetric/mel-band-roformer-duality-kara2-student`, empaquetada específicamente para ejecutarse en el navegador mediante `onnxruntime-web` sobre WebGPU.

El modelo pertenece a la familia Mel-Band RoFormer, una arquitectura de separación de fuentes basada en transformers que opera sobre representaciones STFT y aplica máscaras complejas por banda de frecuencia. Esta variante "student" incorpora un estimador de separación dual: primero aísla la voz respecto a la mezcla y después separa los coros respecto a la voz, derivando la voz principal por resta.

Su relevancia actual radica en que permite inferencia de separación de fuentes de calidad en el propio cliente (navegador o edge) sin depender de servidores, gracias al grafo ONNX optimizado para WebGPU. La ventana temporal es estática (T = 1100, aproximadamente 11 segundos a 44,1 kHz), y el grafo contiene únicamente el núcleo neuronal: el STFT, el iSTFT, el troceado y el empaquetado complejo se ejecutan en el host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (transformer con enmascaramiento complejo por banda mel); estimador dual vocals/backing |
| Parametros totales | no disponible (pesos fp16 de ~235,4 MB en `.onnx.data`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana temporal estatica T = 1100 frames (~11 s a 44,1 kHz, hop 441) |
| Tipos de cuantizacion | fp16 (pesos); E/S del grafo en fp32 |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset `ai.onnx` 23, IR 10) con fichero `.onnx.data` externo |

## Arquitectura y entrenamiento

El grafo es el núcleo de red neuronal del estudiante de voz de `mel-band-roformer-duality-student`, adaptado a las anchuras de este modelo. El flujo de voz emplea un stream de 288 canales, con feed-forwards de 768 en los pares 0-1 y de 1536 en los pares 2-5; los pares 2-5 operan sobre frames promediados por 2. El estimador de separación (split estimator) se ejecuta por banda sobre la misma salida agrupada del stack transformer: una capa lineal de 288 x 768, una tanh y una capa lineal al doble del tamano de la banda, con gating, en fp16 como el estimador de voz. Sus máscaras pasan por el mismo promedio mel-band que la máscara de voz y salen del grafo como segunda salida.

La innovación principal es la estructura dual de máscaras: el modelo recibe una representación STFT precalculada `[1, 2050, T, 2]` y devuelve `[2, 2050, T, 2]` máscaras complejas por bin, donde la máscara 0 es la voz sobre la mezcla y la máscara 1 son los coros sobre la voz. La voz principal se obtiene por resta (`lead = vocals - backing`) y el instrumental por resta de la voz a la mezcla. Las tablas de gather/average mel-band están embebidas en el grafo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; la model card remite al repositorio PyTorch original para esos detalles. Es una exportación de solo inferencia.

## Capacidades

- Separación de fuentes musicales en tres pistas en una sola pasada: instrumental, voz principal y coros.
- Enmascaramiento complejo por bin de frecuencia sobre representación STFT.
- Estimación dual encadenada: máscara de voz sobre la mezcla y máscara de coros sobre la voz.
- Inferencia en cliente/edge mediante WebGPU con `onnxruntime-web`.
- Ejecución sobre una ventana estática de ~11 segundos (T = 1100) por invocación.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de audio puro.
- No dispone de capacidades multilingües, de visión ni de audio-texto.

## Casos de uso

- Karaoke automático: el modelo separa la voz principal de los coros y del instrumental, permitiendo generar pistas de karaoke donde se silencia la voz líder pero se conservan los coros, gracias a la máscara dual sobre voz y backing.
- Edición y remezcla musical en el navegador: un editor web puede procesar un fragmento de ~11 segundos por invocación, aplicar las máscaras sobre el STFT calculado en el host y reconstruir las pistas con iSTFT, sin enviar audio a un servidor.
- Herramientas de práctica para músicos: aislar el instrumental para tocar encima o extraer la voz para estudiar interpretación, ejecutando la inferencia en el cliente con WebGPU.
- Preprocesado de pipelines de audio: usar la separación como primera etapa antes de transcripción, análisis tonal o alineación de letras, ya que entrega pistas limpias de voz e instrumental.
- Aplicaciones de privacidad: procesar audio musical localmente en el dispositivo, evitando subir contenido a la nube, dado que el modelo está empaquetado para `onnxruntime-web`.
- Creación de contenido y remixes: extraer coros e instrumental para construir versiones alternativas o mashups, aprovechando que la separación se obtiene en una sola pasada y con licencia Apache-2.0 para uso comercial.
- Investigación en separación de fuentes: servir como referencia de despliegue ONNX/WebGPU de un Mel-Band RoFormer student para comparar latencia y calidad en edge frente a la versión PyTorch.

## Benchmarks y rendimiento

La model card incluye una validación frente al modelo PyTorch en fp32 sobre CUDA, con la misma ventana, aplicando las máscaras del núcleo (ejecutado en el execution provider CUDA con TF32 desactivado) al STFT de la ventana e invirtiendo a vocals, backing y lead. Cada canción se normaliza en pico a 0,9 y se puntúa sobre su ventana de 1100 frames más fuerte. Las canciones son todas las pistas CC BY y CC BY-SA de JamendoLyrics.

| Cancion | Genero | Licencia | Ventana | Vocals | Backing | Lead |
|---|---|---|---|---|---|---|
| Lower Loveday – Is It Right? | Indie | CC BY-SA | 156,7 s | 63,7 dB | 58,0 dB | 62,8 dB |
| Rxbyn – Bad Side | RNB | CC BY | 29,5 s | 64,2 dB | 49,9 dB | 64,2 dB |
| Cortez – Feel (Stripped) | Pop | CC BY | 195,8 s | 66,5 dB | 55,6 dB | 65,8 dB |
| I'M FRESH! YOU'RE PRETTY! – CHRISTMAS AVEC TOI | Pop | CC BY | 180,4 s | 68,1 dB | 67,2 dB | 45,3 dB |
| NANDOMALO – Esencia | Folk | CC BY-SA | 63,3 s | 70,2 dB | 55,8 dB | 61,6 dB |
| LOS ROMBOS – Fantasma | Folk | CC BY-SA | 67,1 s | 66,5 dB | 49,7 dB | 66,4 dB |
| Durch Dick und Duenn – Freifliegen | Rock | CC BY-SA | 140,8 s | 64,0 dB | 59,7 dB | 64,0 dB |
| Jonny M – Keine Lust | Reggae | CC BY-SA | 189,4 s | 65,0 dB | 50,9 dB | 63,3 dB |
| FLO – l'abandon | Country | CC BY | 163,7 s | 67,0 dB | 61,0 dB | 66,9 dB |

No se han publicado resultados de benchmarks estándar (SDR/SI-SNR sobre MUSDB18, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 235,4 MB en fp16; el grafo ONNX pesa 6,2 MB. La ventana de entrada `[1, 2050, 1100, 2]` en fp32 son unos 18 MB, y la salida de máscaras `[2, 2050, 1100, 2]` unos 36 MB; el consumo total en GPU es moderado, aunque no se publica una cifra exacta de VRAM.
- GPU recomendadas: el autor solo ha medido en una GPU de sobremesa; no se especifica el modelo concreto. Al ejecutarse vía WebGPU, es adecuado para GPUs de escritorio con soporte WebGPU.
- Cabe en GPU de consumo: sí, por el tamano reducido de los pesos; no se detallan modelos concretos ni cifras de latencia.
- Opciones de despliegue: `onnxruntime-web` con WebGPU (objetivo principal); el grafo también se ha validado con el execution provider CUDA de ONNX Runtime.
- Latencia y throughput: no disponibles; la model card indica que solo se ha medido en una GPU de escritorio y que los teléfonos aún no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| musetric/mel-band-roformer-duality-kara2-student-onnx (este) | no disponible (~235 MB fp16) | T = 1100 (~11 s) | Apache-2.0 | ONNX fp16 | Separación dual vocals/backing, orientado a WebGPU |
| musetric/mel-band-roformer-duality-student-onnx | no disponible | T = 1100 | Apache-2.0 | ONNX | Estudiante de voz con una sola máscara; base del núcleo de este modelo |
| musetric/mel-band-roformer-duality-kara2-student | no disponible | T = 1100 | Apache-2.0 | PyTorch | Modelo original del que se exporta este ONNX; entrenamiento e inferencia en PyTorch |

No se dispone de datos de benchmarks comparativos con otros separadores de fuentes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un host que calcule el STFT de entrada, aplique las máscaras por bin y ejecute el iSTFT (véase `musetric` `packages/ai`).
- Ventana temporal estática de T = 1100 (~11 s); el troceado y solapado deben gestionarse en el host.
- Solo se ha medido en una GPU de escritorio; el rendimiento en teléfonos no está medido.
- Es una exportación de solo inferencia; no sirve para entrenamiento.
- Las limitaciones propias del modelo (sesgos, calidad en géneros concretos, riesgo de artefactos) se remiten al repositorio PyTorch original y no se detallan aquí.
- La validación muestra una caída notable en la pista lead en al menos una canción (45,3 dB en "CHRISTMAS AVEC TOI"), lo que sugiere variabilidad según la mezcla.
- Licencia Apache-2.0, que permite uso comercial; deben respetarse las condiciones de la licencia y los derechos sobre el audio procesado.
- No se dispone de información sobre sesgos ni sobre el dataset de entrenamiento en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/musetric/mel-band-roformer-duality-kara2-student-onnx
- Modelo base PyTorch: https://huggingface.co/musetric/mel-band-roformer-duality-kara2-student
- Núcleo del estudiante de voz ONNX: https://huggingface.co/musetric/mel-band-roformer-duality-student-onnx
- Repositorio musetric: https://github.com/musetric/musetric
- Paper de referencia (arXiv:2310.01809): https://arxiv.org/abs/2310.01809
- Dataset JamendoLyrics: https://github.com/f90/jamendolyrics
