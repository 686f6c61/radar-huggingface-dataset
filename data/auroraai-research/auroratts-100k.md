# AuroraAI-Research/AuroraTTS-100K

## Resumen

AuroraTTS-100K es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por AuroraAI-Research, entrenado desde cero sobre LJSpeech-1.1 sin destilación, y diseñado explícitamente para el régimen de menos de 100.000 parámetros. Se trata de un modelo no autorregresivo con alineamiento aprendido, cuya peculiaridad principal es que sustituye el vocoder neuronal habitual por un sintetizador DSP diferenciable de tipo harmónico + ruido, con solo 145 parámetros aprendidos. El recuento de parámetros de inferencia que declara el autor es de 95.638 (el archivo safetensors del repositorio reporta 95.637).

La arquitectura sigue la familia FastPitch / RAD-TTS: embeddings fonémicos, un encoder convolucional con pesos compartidos, contexto BiGRU, predictores de duración y tono, y un decoder de convoluciones dilatadas que emite parámetros de síntesis por trama (log-F0 normalizado, sonoridad, envolvente harmónica de 40 bandas y envolvente de ruido de 24 bandas). La señal se renderiza a 22.050 Hz con salto de trama de 256 muestras (~11,6 ms), partiendo de una entrada de 79 símbolos ARPAbet obtenida con g2p_en.

Su relevancia es acotada pero clara: demuestra que es posible obtener una inteligibilidad y naturalidad aceptables (UTMOS 3,530 ± 0,267 en FP32) con un artefacto de 374 KB en FP32 que corre a 37 veces tiempo real en un solo núcleo de CPU y a 1.120 veces en GPU. No compite en calidad con modelos de un orden de magnitud más de parámetros, pero sí en tamaño, latencia y coste de despliegue. La licencia es Apache-2.0 y el modelo es de un único hablante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS no autorregresivo tipo FastPitch / RAD-TTS con alineamiento aprendido y sintetizador DSP harmónico + ruido diferenciable (sin vocoder neuronal) |
| Parámetros totales | 95.638 de inferencia según la model card; 95.637 según el safetensors del repositorio (incluye 145 parámetros del bloque DSP) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de contexto: la entrada es una secuencia fonémica de longitud variable y la salida se genera por tramas de 256 muestras (~11,6 ms) |
| Tipos de cuantización | FP32 (374 KB), FP16 (187 KB) e INT8 per-channel (111 KB). En INT8 los pesos se redondean y se des-cuantizan a FP32 para el cómputo; sesgos, normas y parámetros DSP permanecen en FP32 |
| Idiomas soportados | Inglés (etiqueta `en`); entrada fonémica ARPAbet vía g2p_en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (variantes FP32, `fp16` e `int8` en el repositorio) |

Otros datos de interés: frecuencia de muestreo 22.050 Hz, vocabulario de 79 símbolos (padding, silencio, fonemas, puntuación y espacio), un único hablante inglés, checkpoint de pesos EMA tras 150.000 pasos y tamaño de lote 1.

## Arquitectura y entrenamiento

El modelo es un TTS no autorregresivo con alineamiento aprendido y sintetizador paramétrico. La cadena concreta es: embedding de 79 símbolos a 56 canales; encoder formado por un bloque conv-GLU (kernel 5) más FFN, aplicado cuatro veces con pesos compartidos y LayerNorms por pasada; contexto mediante BiGRU empaquetado de 28 unidades por dirección; predictores de duración y de tono implementados como convolución depthwise seguida de dos capas 1×1 de 32 canales; embedding de tono sumado a la salida del encoder (en entrenamiento se usa el tono por token forzado por profesor); regulador de longitud con sobremuestreo gaussiano suave y anchura aprendida inicializada a 2 tramas; y decoder de 9 capas convolucionales depthwise dilatadas (dilataciones 1, 2, 4 en ciclo) con 3 FFN compartidas entre capas. Las cabezas de salida emiten log-F0, logit de sonoridad, 40 bandas de envolvente harmónica en escala logarítmica y 24 bandas de envolvente de ruido.

El sintetizador DSP genera hasta 80 armónicos cuyas amplitudes se muestrean de la envolvente predicha de 40 bandas en escala mel; el ruido se conforma con la envolvente de 24 bandas en el dominio STFT (FFT de 1024 puntos, salto 256). Incluye 80 desfases armónicos aprendidos y un filtro FIR estático de salida de 65 taps, y acumula la fase en float64 tanto en entrenamiento como en inferencia para evitar deriva en enunciados largos.

El entrenamiento usa LJSpeech-1.1 (22.050 Hz, 13.100 clips) con partición fija (semilla 1234): 128 clips de test, 64 de validación y 12.908 de entrenamiento. Se excluyen clips de más de 12 s, clips con menos de 5 tramas sonoras y aquellos con demasiadas pocas tramas para su transcripción. La F0 se extrae con PyWorld (`harvest` por defecto, `dio` opcional) y se refina con `stonemask`, con suelo de 70 Hz y techo de 450 Hz; las tramas sordas se rellenan interpolando log-F0 de las sonoras y la normalización usa media y desviación típica globales de log-Hz calculadas sobre tramas sonoras de entrenamiento. El alineamiento se aprende con un alineador texto/mel de entrenamiento sobre log-mels de 80 bandas, un prior beta-binomial que favorece la monotonía (calculado en GPU con `lgamma`), pérdida forward-sum y búsqueda de alineamiento monótono (MAS) compilada con numba para extraer duraciones duras; los primeros 3.000 pasos entrenan solo el alineador y la pérdida binaria de alineamiento entra de forma lineal durante los 10.000 pasos siguientes. Las pérdidas del modelo acústico son MSE de duración en espacio logarítmico, pérdida de tono a nivel de token, L1 de F0 por trama ponderada hacia tramas sonoras, entropía cruzada binaria sonoro/sordo y pérdida STFT multirresolución (la model card disponible se corta en este punto, a partir de tamaños de FFT de 256).

## Capacidades

- Síntesis de voz en inglés a partir de texto, mono-hablante, a 22.050 Hz, con salida de forma de onda directamente (no requiere vocoder externo).
- Conversión de texto a fonemas ARPAbet con g2p_en, incluyendo marcas de acentuación en vocales.
- Predicción explícita de duración por fonema y de tono (F0) por trama, con modelado separado de sonoridad y de envolventes harmónica y de ruido.
- Control implícito de prosodia mediante los predictores de duración y tono; no se documentan controles explícitos de estilo, emoción ni velocidad en la información disponible.
- Ejecución en CPU muy rápida (RTF 0,0270 a un núcleo) y en GPU (RTF 0,0009), lo que permite síntesis en línea y por lotes pequeños.
- Compatible con `transformers` mediante `AutoModel.from_pretrained(..., trust_remote_code=True)` y el método `synthesize(texto)`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": es un modelo específico de TTS.
- No se documentan capacidades multilingües: el frontend y el vocabulario están limitados al inglés.

## Casos de uso

- Síntesis en dispositivos con recursos mínimos: con 111 KB en INT8 y RTF de 0,0139 en 4 núcleos de CPU, puede integrarse en sistemas embebidos, routers o aplicaciones de escritorio donde no cabe un modelo TTS convencional.
- Generación de avisos y lecturas cortas en sistemas de megafonía o domótica: frases de pocos segundos que se sintetizan en decenas de milisegundos en CPU, sin dependencia de servicios en la nube.
- Pruebas de regresión y CI de pipelines de audio: al ser determinista en tamaño y rápido en CPU, sirve como generador de referencia para validar cadenas de post-proceso, remuestreo o métricas UTMOS.
- Investigación en TTS de bajo recuento de parámetros: el código y los pesos permiten estudiar el equilibrio entre presupuesto paramétrico, vocoder DSP diferenciable y calidad percibida, con un baseline reproducible sobre LJSpeech.
- Docencia y prototipado de arquitecturas FastPitch/RAD-TTS: la implementación incluye alineador, MAS con numba y pérdidas STFT multirresolución, lo que la hace útil como ejemplo didáctico ejecutable en un portátil.
- Accesibilidad offline: lectura de texto en pantalla para aplicaciones de asistencia que deben funcionar sin conexión y con huella de memoria despreciable.
- Generación de material de aumento de datos con habla sintética inglesa para entrenar clasificadores o sistemas de detección de voz sintética de referencia (con la advertencia de que la calidad UTMOS 3,53 limita su realismo).

## Benchmarks y rendimiento

Evaluación del autor sobre un conjunto reservado de 24 frases del conjunto "English diverse held-out" de SanoTTS, con UTMOS calculado mediante SpeechMOS `utmos22_strong` y reportado como media ± desviación típica entre frases.

| Precisión | Tamaño | UTMOS | Delta frente a FP32 |
|---|---:|---:|---|
| FP32 | 374 KB | 3,530 ± 0,267 | — |
| FP16 | 187 KB | 3,501 ± 0,269 | Ruido (sin degradación significativa) |
| INT8 per-channel | 111 KB | 3,557 ± 0,256 | Ruido (sin degradación significativa) |

Comparación con baseline externos (mismo conjunto de evaluación):

| Modelo | Parámetros | UTMOS |
|---|---:|---|
| AuroraTTS-100K | 95,6 K | 3,530 ± 0,267 |
| Sano TTS (amy) | 1,46 M | 4,047 ± 0,230 |
| Sano TTS (heart-nano) | 294,3 K | 2,351 ± 0,290 |

Velocidad en FP32, medida como factor de tiempo real (RTF, menor es más rápido):

| Dispositivo | RTF | Velocidad (× tiempo real) |
|---|---:|---:|
| CPU, 1 núcleo | 0,0270 | 37,03× |
| CPU, 4 núcleos | 0,0139 | 71,84× |
| GPU | 0,0009 | 1.120× |

No se han publicado otros benchmarks (MOS humano, WER de inteligibilidad, SIM-O, MCD) en la información disponible. Las cifras INT8 miden el daño de redondeo de pesos, no la velocidad de un kernel entero real.

## Requisitos de hardware

- VRAM para inferencia: despreciable por los pesos (374 KB en FP32, 187 KB en FP16, 111 KB en INT8). El consumo real lo domina el entorno de ejecución (PyTorch, torchaudio, g2p_en, NLTK); no se publican cifras oficiales de memoria del proceso, por lo que cualquier estimación de decenas o centenares de MB corresponde al runtime, no al modelo.
- GPU recomendadas: no se especifica ninguna; el modelo cabe en cualquier GPU con CUDA disponible. El rendimiento reportado en GPU es de RTF 0,0009 (1.120× tiempo real).
- CPU: funciona sin GPU. RTF 0,0270 con un núcleo y 0,0139 con cuatro, lo que lo hace plenamente utilizable en portátiles y equipos de un solo núcleo.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, e incluso iGPU) y en Raspberry Pi o similares, siempre que el stack de PyTorch esté disponible.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y variantes `fp16`/`int8`; requiere PyTorch, torchaudio, NumPy, soundfile, g2p_en y nltk (el frontend descarga datos de NLTK en el primer uso). Tamaño de lote 1.
- No se documenta soporte para vLLM, llama.cpp, GGUF, Ollama, TGI ni ONNX en la información disponible.
- Latencia y throughput: derivados del RTF; con salto de trama de ~11,6 ms y ejecución no autorregresiva, la generación es aproximadamente proporcional a la duración del audio de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | UTMOS | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| AuroraTTS-100K | 95,6 K | No aplica (entrada fonémica) | 3,530 ± 0,267 | Apache-2.0 | HuggingFace, vía `transformers` con código remoto |
| Sano TTS (amy) | 1,46 M | No disponible | 4,047 ± 0,230 | No disponible | No disponible |
| Sano TTS (heart-nano) | 294,3 K | No disponible | 2,351 ± 0,290 | No disponible | No disponible |

Lectura de la comparativa: frente a Sano TTS (amy), con 15,3 veces más parámetros, AuroraTTS-100K pierde 0,517 puntos de UTMOS; frente a Sano TTS (heart-nano), con 3,1 veces más parámetros, gana 1,179 puntos. El modelo se sitúa, por tanto, en un punto intermedio de la curva calidad/tamaño, con la ventaja adicional de la licencia Apache-2.0 explícita y de un artefacto por debajo de los 400 KB. No se dispone de datos de comparación con otros TTS pequeños como Piper o VITS reducidos en la información proporcionada.

## Limitaciones y advertencias

- Un solo hablante y un solo idioma (inglés). No admite clonación de voz, cambio de hablante ni multilingüismo.
- Calidad limitada: UTMOS 3,530 implica una naturalidad claramente inferior a la de modelos de 1,46 M de parámetros (4,047). Es apto para avisos y prototipos, no necesariamente para audiolibros o locución comercial de alta exigencia.
- Dependencia total del frontend g2p_en: siglas, nombres propios, números, extranjerismos y puntuación ambigua pueden fonemizarse mal y producir pronunciaciones incorrectas. No hay un mecanismo de corrección fonética documentado.
- Riesgo de alucinación acústica: como todo TTS, puede generar artefactos, zumbidos, ruido o silencios inesperados, especialmente en frases largas o con fonemas poco representados en LJSpeech (corpus de un único locutor, dominio de lectura de libros).
- El checkpoint está entrenado con clips de hasta 12 s; no se documenta comportamiento fiable más allá de esa duración.
- Tamaño de lote 1: no se contempla inferencia batcheada, lo que limita el throughput en servidores.
- Requiere `trust_remote_code=True`, es decir, ejecución de código Python del repositorio del autor; conviene auditar el código antes de usarlo en producción.
- El primer uso descarga datos de NLTK, lo que exige conectividad o un aprovisionamiento previo; en entornos sin red hay que preparar la caché.
- Las cifras INT8 no implican aceleración real: los pesos se redondean y se des-cuantizan a FP32 para el cómputo.
- La model card disponible está truncada en la sección de pérdidas (límite de FFT de 256), por lo que parte de la metodología de entrenamiento no puede verificarse con la información suministrada.
- Licencia Apache-2.0 permite uso comercial, pero el corpus LJSpeech es de dominio público; no se documentan restricciones adicionales del autor.
- Sin descargas registradas (0) y solo 14 "likes": no hay evidencia de uso en producción ni de validación independiente de las métricas reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AuroraAI-Research/AuroraTTS-100K
- Dataset de entrenamiento (LJSpeech): https://huggingface.co/datasets/keithito/lj_speech
- Repositorio de g2p_en (frontend de fonemización, referenciado en la model card): https://github.com/Kyubyong/g2p
- PyWorld (extracción de F0, referenciado en la model card): https://github.com/JeremyCCHsu/Python-Wrapper-for-World-Vocoder
- No se han encontrado enlaces adicionales (papers, blogs, demos o repositorios del autor) en los resultados de búsqueda web disponibles; las búsquedas devolvieron únicamente páginas genéricas del motor de búsqueda sin relación con el modelo.
