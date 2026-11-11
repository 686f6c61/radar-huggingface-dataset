# gaschka/bs-roformer-4stem-coreml

## Resumen

BS-RoFormer 4-stem (Core ML) es una conversión al formato Core ML del modelo BS-RoFormer de Lu et al. (2023), un sistema de separación de fuentes musicales que descompone una mezcla de audio estéreo en cuatro pistas: batería, bajo, otros instrumentos y voz. Lo publica el usuario gaschka en Hugging Face y parte de los pesos `model_bs_roformer_ep_17_sdr_9.6568.ckpt` entrenados por ZFTurbo, con una puntuación SDR media de 9,6568 dB en el conjunto de validación original. La conversión empaqueta únicamente la red neuronal como ML Program con pesos en fp16, dejando el cálculo de STFT e iSTFT fuera del grafo, lo que permite integrar el modelo en aplicaciones nativas de Apple (macOS 14 o superior) sin depender de PyTorch en tiempo de inferencia.

La relevancia de esta ficha es doble. Por un lado, BS-RoFormer es uno de los modelos de referencia en separación musical de alta calidad, con arquitectura basada en transformers con atención por bandas (band-split) y atención rotatoria, que ha desplazado a los enfoques clásicos tipo U-Net en las competiciones de la especialidad. Por otro, esta conversión concreta resuelve el problema práctico del despliegue en hardware Apple: ofrece un artefacto de 0,3 GB listo para Core ML, con una latencia medida de aproximadamente 0,57 s por ventana de 8 segundos en un chip M6, lo que permite procesar una canción de 3 minutos en menos de 40 segundos con solapamiento del 50 %.

No se trata de un modelo de lenguaje: no genera texto, no razona y no tiene contexto conversacional. Es un modelo de audio puro con una interfaz tensorial fija (espectrogramas de entrada y máscaras de salida). Su licencia MIT facilita la integración comercial, aunque el autor advierte que los datos de entrenamiento originales probablemente incluyan MUSDB18-HQ, cuyos términos son de orientación investigadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BS-RoFormer (transformer con band-split y atención rotatoria) para separación de fuentes musicales |
| Parametros totales | no disponible (el repo pesa 0,3 GB en fp16; el número exacto de parámetros no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio fija de 8 s a 44,1 kHz (entrada STFT `[1, 2, 1025, 801]`) |
| Tipos de cuantizacion | fp16 (pesos del ML Program); no se documentan otras variantes |
| Idiomas soportados | no aplica (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | Core ML ML Program (`.mlpackage`/`.mlmodel`), librería `coreml` |

## Arquitectura y entrenamiento

BS-RoFormer aplica un esquema de separación en el dominio espectral: la señal estéreo se transforma con STFT (n_fft 2048, hop 441, ventana Hann periódica, `center=True`, padding reflectante) y la red predice máscaras para cada una de las cuatro fuentes sobre el espectrograma. La arquitectura combina un band-split que agrupa las frecuencias en bandas y una pila de bloques transformer con atención rotatoria (rotary positional embeddings) que modela dependencias temporales y frecuenciales dentro de cada banda. Esta combinación es la que dio a BS-RoFormer su ventaja frente a arquitecturas convolucionales previas en las métricas SDR de separación musical.

Los pesos originales fueron entrenados por ZFTurbo en el proyecto Music-Source-Separation-Training (release v1.0.12) con la configuración `config_bs_roformer_384_8_2_485100.yaml`. No se detalla en la información disponible el número exacto de tokens de audio, la composición completa del dataset ni si hubo etapas de refinamiento posteriores; el autor de la conversión señala que, hasta donde sabe, los datos de entrenamiento incluyen MUSDB18-HQ. La conversión a Core ML se realizó con coremltools 9.0 a partir de una reimplementación que carga únicamente los tensores del checkpoint, y el resultado se validó contra una exportación ONNX independiente de los mismos pesos (silverdaw/bs-roformer-rhythm-onnx). El SHA-256 del checkpoint original es `3e9daecd70aaed5b5a0d1f861cc4d77eaa45afb3fc6301b1cf32c1be0f5868fb`.

## Capacidades

- Separación de una mezcla musical estéreo en cuatro pistas: batería, bajo, otros y voz.
- Procesamiento por ventanas de 8 segundos a 44,1 kHz con solapamiento y suma con overlap-add para audio de cualquier duración.
- Interfaz tensorial explícita: entrada de espectrograma real/imaginario `[1, 2, 1025, 801]` y salida de máscaras `[1, 4, 2, 1025, 801]`.
- Ejecución nativa en Apple Silicon mediante Core ML, con selección de unidades de cómputo (`MLComputeUnitsCPUAndGPU`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de audio especializado.
- No incluye STFT/iSTFT internos; el preprocesado y postprocesado espectral corre a cargo de la aplicación anfitriona.
- Pesos en fp16, lo que reduce el tamaño del artefacto a 0,3 GB y acelera la inferencia en GPU integrada.

## Casos de uso

- **Karaoke y eliminación de voz en apps de consumo**: el modelo aísla la pista de voz y permite generar versiones instrumentales de canciones en dispositivos Apple, procesando una pista de 3 minutos en menos de 40 segundos en un M6. Es adecuado por su licencia MIT y su integración nativa con Core ML.
- **Producción musical y remezclas**: extraer stems de batería, bajo y otros para samplear o reutilizar en DAWs. La calidad SDR de 9,6568 dB del checkpoint original lo hace competitivo para trabajo profesional no crítico.
- **Transcripción y análisis musical asistido**: separar la voz antes de pasarla a un sistema de reconocimiento de letras o de transcripción melódica, reduciendo la interferencia instrumental.
- **Herramientas de práctica para músicos**: aislar la pista de bajo o batería para estudiar una canción, con reproducción en tiempo casi real en Macs recientes gracias a la latencia de 0,57 s por ventana.
- **Postproducción de vídeo y podcasts**: limpieza de audio donde la música de fondo interfiere con la voz, separando la voz hablada del acompañamiento musical antes de aplicar ecualización o reducción de ruido.
- **Investigación en separación de fuentes**: servir como referencia reproducible en Core ML para comparar implementaciones (PyTorch, ONNX, Core ML) con los mismos pesos y verificar la equivalencia numérica.
- **Procesamiento por lotes en servidores macOS**: pipelines automatizados de separación masiva de catálogos musicales usando Macs con Apple Silicon, sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| SDR medio (checkpoint original) | 9,6568 dB | `model_bs_roformer_ep_17_sdr_9.6568.ckpt`, conjunto de validación del entrenamiento original |
| Latencia por ventana de 8 s | ~0,57 s | Apple M6, `MLComputeUnitsCPUAndGPU` |
| Tiempo para pista de 3 min | < 40 s | Ventanas de 8 s con solapamiento del 50 % |
| Tiempo de compilación para Neural Engine | > 30 min | No utilizado en la medición |

No se han publicado resultados de benchmarks comparativos adicionales (por ejemplo, desglose por fuente o comparación con otros modelos) en la información disponible.

## Requisitos de hardware

- **VRAM/memoria**: no se especifica; el artefacto ocupa 0,3 GB en disco y los tensores de activación para una ventana de 8 s son moderados, pero no hay cifras oficiales de memoria en inferencia.
- **GPU recomendadas**: Apple Silicon (M-series) con GPU integrada; la medición oficial se hizo en un Apple M6. No se documenta soporte para GPUs NVIDIA o AMD en este artefacto Core ML.
- **Consumer GPU**: sí, en el sentido de que funciona en Macs de consumo con Apple Silicon; no está pensado para GPUs de escritorio convencionales.
- **Opciones de despliegue**: Core ML (librería `coreml`, macOS 14+). Para otras plataformas habría que recurrir al checkpoint original en PyTorch o a exportaciones ONNX alternativas.
- **Latencia y throughput**: ~0,57 s por ventana de 8 s en M6 con CPU+GPU; el autor descarta la Neural Engine por el elevado tiempo de compilación (> 30 min).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BS-RoFormer 4-stem Core ML (este) | no disponible (0,3 GB fp16) | 8 s por ventana | SDR 9,6568 dB (checkpoint original); ~0,57 s/ventana en M6 | MIT | Hugging Face, Core ML |
| BS-RoFormer original (ZFTurbo) | no disponible | Configurable (config 384_8_2_485100) | SDR 9,6568 dB | MIT | GitHub, PyTorch |
| Exportación ONNX de referencia (silverdaw/bs-roformer-rhythm-onnx) | mismos pesos | no disponible | Verificación de equivalencia con esta conversión | no disponible | Hugging Face, ONNX |
| Demucs (referencia de la categoría) | no disponible en esta información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con Demucs u otros separadores con cifras verificadas; la comparativa se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- **Modelo especializado, no generalista**: no genera texto, no razona y no admite instrucciones; cualquier uso fuera de separación de audio no es válido.
- **Dependencia de la plataforma**: el artefacto es Core ML y requiere macOS 14 o superior; no es portable a Linux o Windows sin reconvertir.
- **Preprocesado manual**: la STFT y la iSTFT no están incluidas; una implementación incorrecta (ventana, hop o padding) degrada la calidad de la separación.
- **Ventana fija de 8 s**: el audio más largo debe procesarse con overlap-add; el solapamiento del 50 % es una recomendación del autor, no una garantía de calidad óptima.
- **Datos de entrenamiento con términos de investigación**: el autor advierte que MUSDB18-HQ tiene condiciones orientadas a investigación; conviene revisar la licencia de los datos antes de un uso comercial, aunque los pesos se distribuyan bajo MIT.
- **Riesgo de artefactos**: como todo separador, puede introducir artefactos espectrales, sangrado entre pistas y pérdida de transitorios en pasajes densos; no hay métricas publicadas por fuente en esta información.
- **Sesgos musicales**: al entrenarse probablemente con un corpus limitado, el rendimiento puede caer en géneros poco representados (música clásica, electrónica experimental, grabaciones de baja calidad).
- **Sin garantías de producción**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento continuado.
- **Neural Engine no validada**: el autor no confirma el funcionamiento en ANE por el coste de compilación, por lo que el rendimiento en ese backend es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gaschka/bs-roformer-4stem-coreml
- Paper BS-RoFormer (Lu et al., 2023): https://arxiv.org/abs/2309.02612
- Repositorio de entrenamiento de ZFTurbo: https://github.com/ZFTurbo/Music-Source-Separation-Training
- Implementación de referencia de lucidrains: https://github.com/lucidrains/BS-RoFormer
- Exportación ONNX de verificación: https://huggingface.co/silverdaw/bs-roformer-rhythm-onnx
