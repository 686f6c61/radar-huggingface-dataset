# AuroraAI-Research/AuroraTTS-100K

## Resumen

AuroraTTS-100K es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por AuroraAI-Research, diseñado explícitamente para operar en el régimen de menos de 100.000 parámetros. Concretamente, cuenta con 95.638 parámetros de inferencia (incluidos los 145 parámetros aprendidos del bloque DSP), lo que lo convierte en uno de los modelos TTS más pequeños publicados con arquitectura neuronal completa. Se entrenó desde cero sobre LJSpeech-1.1, sin destilación, y su objetivo declarado es demostrar que es posible obtener voz inteligible con un presupuesto de parámetros extremadamente reducido.

La innovación principal reside en sustituir el vocoder neuronal habitual por un sintetizador DSP diferenciable de tipo harmónico + ruido. La red predice parámetros de síntesis por trama (log-F0 normalizado, sonoridad, una envolvente espectral harmónica de 40 bandas y una envolvente de ruido de 24 bandas), y el bloque DSP renderiza la forma de onda. La arquitectura sigue de cerca el esquema FastPitch / RAD-TTS no autorregresivo con alineamiento aprendido, pero con un decodificador muy comprimido.

El modelo es relevante por su tamaño (374 KB en FP32, 111 KB en INT8), su velocidad (RTF de 0,0270 en un núcleo de CPU y 0,0009 en GPU) y su licencia Apache-2.0. Está pensado para escenarios con recursos muy limitados, prototipado rápido de pipelines TTS y experimentación académica sobre el límite inferior de parámetros viables en síntesis de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS no autorregresiva tipo FastPitch/RAD-TTS con sintetizador DSP harmónico + ruido diferenciable (sin vocoder neuronal) |
| Parametros totales | 95.638 (incluye 145 del bloque DSP) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por fonemas; clips de entrenamiento limitados a 12 s) |
| Tipos de cuantizacion | FP32 (374 KB), FP16 (187 KB), INT8 per-channel (111 KB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (modelo); herramientas Sonata GPL-3.0-or-later; código STEER con avisos MIT |
| Formato de pesos | safetensors, ONNX (exportación companion), custom_code en transformers |
| Frecuencia de muestreo | 22.050 Hz |
| Frame hop | 256 muestras (~11,6 ms) |
| Vocabulario de entrada | 79 símbolos ARPAbet (vía g2p_en) |
| Hablantes | un único hablante en inglés |
| Dataset de entrenamiento | LJSpeech-1.1 (13.100 clips) |
| Checkpoint | pesos EMA, 150k pasos |

## Arquitectura y entrenamiento

El modelo es un TTS no autorregresivo con alineamiento aprendido y sintetizador de forma de onda paramétrico. La entrada es una secuencia de fonemas ARPAbet (79 símbolos, con marcadores de acento en vocales) producida por g2p_en. La embedding proyecta 79 símbolos a 56 canales. El encoder aplica un bloque conv-GLU + FFN (kernel 5) cuatro veces con pesos compartidos y LayerNorms por pasada. Después, una BiGRU empaquetada de 28 unidades por dirección genera el contexto. Los predictores de duración y pitch son convoluciones depthwise seguidas de dos capas 1×1 de 32 canales. La embedding de pitch se suma a la salida del encoder (con teacher forcing del pitch a nivel de token durante el entrenamiento). El regulador de longitud usa upsampling gaussiano suave con anchura aprendida, inicializada a 2 tramas. El decodificador consta de 9 capas convolucionales depthwise dilatadas (dilataciones 1, 2, 4 en ciclo) con 3 FFNs compartidos entre capas. Las cabezas de salida predicen log-F0, logit de sonoridad, 40 bandas de envolvente harmónica y 24 bandas de envolvente de ruido.

El sintetizador DSP usa hasta 80 armónicos con amplitudes muestreadas de la envolvente mel-espaciada de 40 bandas, ruido modelado por la envolvente de 24 bandas en el dominio STFT (FFT de 1024 puntos, hop 256), offsets de fase por armónico aprendidos (80 parámetros) y un filtro FIR estático de salida de 65 taps. La fase se acumula en float64 tanto en entrenamiento como en inferencia para evitar deriva en enunciados largos. El entrenamiento se realizó sobre LJSpeech-1.1 con split fijo (seed 1234): 128 clips de test, 64 de validación y 12.908 de entrenamiento; se excluyeron clips de más de 12 s y aquellos con menos de 5 tramas sonoras o insuficientes tramas para su transcripción. La F0 se extrajo con PyWorld (harvest por defecto, dio opcional) y se refinó con stonemask.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida a 22.050 Hz.
- Conversión texto → fonemas ARPAbet con marcadores de acento mediante g2p_en.
- Predicción de duración, pitch (log-F0) y sonoridad por trama.
- Modelado de envolventes espectrales harmónica (40 bandas) y de ruido (24 bandas) para renderizado DSP.
- Inferencia en CPU sin PyTorch mediante el companion ONNX (encoder y decoder exportados + renderizador NumPy/SciPy).
- Cuantización a FP16 e INT8 per-channel con impacto despreciable en calidad percibida (según UTMOS).
- Un único hablante en inglés; no soporta multi-hablante, clonación de voz ni cambio de estilo.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio de entrada).

## Casos de uso

- Síntesis embebida en dispositivos con recursos mínimos: con 111 KB en INT8 y RTF de 0,0270 en un núcleo de CPU, puede integrarse en microcontroladores o sistemas empotrados para avisos de voz y lectura de notificaciones sin GPU.
- Prototipado rápido de pipelines TTS: al cargarse con `AutoModel.from_pretrained` y `trust_remote_code=True`, permite validar frontends de texto, integraciones de audio y formatos de salida antes de invertir en modelos mayores.
- Generación de audio de prueba en CI/CD: su tamaño reducido y velocidad (hasta 1120× tiempo real en GPU) permiten incluirlo en tests automatizados que verifiquen la integridad del pipeline de audio sin coste apreciable.
- Investigación sobre el límite inferior de parámetros en TTS: sirve como baseline académico para estudiar cuánta calidad es alcanzable por debajo de 100K parámetros, comparando con Sano TTS (294K y 1,46M).
- Lectura de textos cortos en aplicaciones de accesibilidad: con clips de entrenamiento limitados a 12 s, es adecuado para frases y párrafos breves en inglés en lectores de pantalla ligeros.
- Despliegue en entornos sin PyTorch: la ruta ONNX con ONNX Runtime y renderizador NumPy/SciPy permite inferencia en stacks Python mínimos o en servicios serverless con dependencias restringidas.
- Educación y demos interactivas: su tamaño (374 KB en FP32) facilita distribuirlo junto a cuadernos y ejemplos sin dependencias pesadas, útil para enseñar arquitecturas TTS y síntesis DSP.

## Benchmarks y rendimiento

Evaluación sobre 24 frases del conjunto SanoTTS English diverse held-out. UTMOS calculado con SpeechMOS utmos22_strong (media ± desviación típica).

| Precisión | Tamaño | UTMOS | Δ vs FP32 |
|---|---:|---:|---:|
| FP32 | 374 KB | 3,530 ± 0,267 | — |
| FP16 | 187 KB | 3,501 ± 0,269 | ruido |
| INT8 per-channel | 111 KB | 3,557 ± 0,256 | ruido |

Comparativa con baselines externos:

| Modelo | Parámetros | UTMOS |
|---|---:|---:|
| **AuroraTTS-100K** | 95,6K | 3,530 ± 0,267 |
| Sano TTS (amy) | 1,46M | 4,047 ± 0,230 |
| Sano TTS (heart-nano) | 294,3K | 2,351 ± 0,290 |

Velocidad (RTF, menor es más rápido; FP32):

| Dispositivo | RTF | Velocidad (× tiempo real) |
|---|---:|---:|
| CPU, 1 núcleo | 0,0270 | 37,03× |
| CPU, 4 núcleos | 0,0139 | 71,84× |
| GPU | 0,0009 | 1120× |

Nota: en las filas INT8 los pesos se redondean a la rejilla objetivo y se descuantizan a FP32 para el cómputo; la métrica mide el daño por redondeo, no la velocidad de un kernel entero real. Sesgos, normas y parámetros DSP permanecen en FP32.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; el modelo completo ocupa 374 KB en FP32, 187 KB en FP16 y 111 KB en INT8, por lo que cabe en cualquier GPU, CPU o incluso memoria de un microcontrolador.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) ejecuta la inferencia a RTF de 0,0009 (1120× tiempo real). En CPU de 1 núcleo se obtiene RTF de 0,0270 (37× tiempo real).
- Cabe en cualquier GPU consumer (e integradas) y en CPU de un solo núcleo.
- Opciones de despliegue: transformers con `trust_remote_code=True` (FP32/FP16/INT8), ONNX Runtime con renderizador NumPy/SciPy (sin PyTorch), y exportación propia incluida en el companion ONNX.
- Dependencias: PyTorch, torchaudio, NumPy, soundfile, g2p_en y nltk (descarga datos NLTK en el primer uso).
- Latencia y throughput: batch size 1; RTF de 0,0270 (1 núcleo CPU), 0,0139 (4 núcleos) y 0,0009 (GPU) en FP32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | UTMOS | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **AuroraTTS-100K** | 95,6K | clips ≤ 12 s | 3,530 | Apache-2.0 | Hugging Face, transformers + ONNX |
| Sano TTS (heart-nano) | 294,3K | no disponible | 2,351 | no disponible | Hugging Face |
| Sano TTS (amy) | 1,46M | no disponible | 4,047 | no disponible | Hugging Face |

AuroraTTS-100K supera en UTMOS a Sano TTS heart-nano con un tercio de los parámetros, pero queda por debajo de Sano TTS amy (1,46M), que obtiene 4,047. La comparación directa está limitada por la falta de datos públicos sobre contexto, licencia y metodología de evaluación de los baselines Sano.

## Limitaciones y advertencias

- Un solo hablante en inglés; no soporta otros idiomas, multi-hablante, clonación de voz ni control de estilo emocional.
- Entrenado exclusivamente con LJSpeech-1.1, un corpus de un único hablante femenino de dominio público; puede heredar sesgos de pronunciación y prosodia de ese corpus.
- Clips de entrenamiento limitados a 12 s: la calidad en enunciados largos no está validada y puede degradarse.
- Riesgo de alucinación prosódica y errores de pronunciación en palabras fuera del vocabulario o con grafías ambiguas, dado el frontend g2p_en y el vocabulario ARPAbet de 79 símbolos.
- La calidad objetiva (UTMOS 3,530) es notablemente inferior a la de modelos TTS modernos de mayor tamaño; no es adecuado para producción de audio de alta fidelidad.
- La evaluación INT8 mide daño por redondeo con descuantización a FP32, no el rendimiento de un kernel entero real; no debe interpretarse como velocidad INT8.
- El frontend nativo compacto (STEER) se distribuye solo como código fuente: sus seis ficheros de datos de pronunciación y la DLL precompilada no se incluyen por ambigüedad en la licencia de los datos del frontend. La ruta g2p_en/NLTK no requiere esos activos.
- Licencias de componentes separadas: modelo y grafos derivados Apache-2.0; herramientas Sonata GPL-3.0-or-later; código STEER con avisos MIT. Verificar compatibilidad antes de uso comercial combinado.
- Batch size fijo de 1; no está optimizado para inferencia por lotes de alto throughput.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AuroraAI-Research/AuroraTTS-100K
- Companion ONNX (README y exportador): https://huggingface.co/AuroraAI-Research/AuroraTTS-100K/tree/main/onnx
- Dataset LJSpeech: https://huggingface.co/datasets/keithito/lj_speech
- g2p_en (frontend de pronunciación): https://github.com/Kyubyong/g2p
- PyWorld (extracción de F0): https://github.com/JeremyCCHsu/Python-Wrapper-for-World-Vocoder
- SpeechMOS / UTMOS: https://github.com/tarcisio-marinho/speechmos
