# mlboydaisuke/Whisper-large-v3-turbo-ExecuTorch

## Resumen

Whisper-large-v3-turbo-ExecuTorch es una conversión del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v3-turbo` al formato ExecuTorch, orientada a la ejecución en dispositivos (on-device). El modelo se distribuye en dos grafos `.pte` independientes: el encoder procesa cada ventana de 30 segundos de audio una sola vez, mientras que el decoder se ejecuta una vez por token generado. Esta separación evita que el audio se re-codifique en cada paso de decodificación, una limitación habitual en los grafos estáticos.

El trabajo ha sido realizado por mlboydaisuke y publicado con licencia MIT. El repositorio incluye varias variantes del encoder (XNNPACK fp32, XNNPACK int8 y Core ML) y del decoder (XNNPACK fp32 e int8), todas ellas compatibles entre sí. La combinación más ligera ocupa 1102.5 MB, lo que lo hace viable para dispositivos con memoria moderada. La exactitud se ha verificado contra el modelo fp32 de referencia: el encoder int8 y el decoder int8 mantienen una tasa de error de palabra (WER) media de 0.0% sobre un conjunto de prueba de cinco frases, mientras que la correlación con el eager fp32 es superior a 0.996.

El modelo base, `openai/whisper-large-v3-turbo`, es una versión podada de Whisper large-v3 con solo 4 capas de decoder (en lugar de 32), lo que lo hace considerablemente más rápido a costa de una degradación menor en precisión. Esta conversión a ExecuTorch permite integrar el ASR en aplicaciones móviles o de escritorio sin depender de Python ni de un servidor, utilizando los kernels portables de XNNPACK o la aceleración de Core ML en Apple Silicon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper large-v3-turbo podado) |
| Parametros totales | No disponible (el modelo base tiene 809M, pero el podado reduce las capas de decoder a 4; no se especifica el recuento exacto) |
| Parametros activos | No disponible |
| Longitud de contexto | 30 segundos de audio por ventana; 128 tokens de entrada para el decoder (sin KV cache) |
| Tipos de cuantizacion | XNNPACK fp32, XNNPACK int8 (dinámica en el decoder), Core ML (solo encoder, no publicado) |
| Idiomas soportados | No especificado (el modelo base Whisper soporta 99 idiomas) |
| Licencia | MIT |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

El modelo es una conversión a ExecuTorch de `openai/whisper-large-v3-turbo`, no un entrenamiento nuevo. El modelo original es un ajuste fino de Whisper large-v3 con una arquitectura podada: el encoder conserva la estructura completa (32 capas), mientras que el decoder se reduce a 4 capas. Esta poda acelera la decodificación y reduce el uso de memoria, manteniendo una calidad de transcripción cercana a la del modelo completo.

En la versión ExecuTorch, el encoder se exporta como un grafo estático que procesa un espectrograma log-mel de `[1, 128, 3000]` (30 s a 16 kHz, 128 bins mel, hop 160, window 400), idéntico a lo que produce `WhisperFeatureExtractor`. El decoder, por su parte, es un grafo estático de 128 posiciones fijas que recibe la salida del encoder y `decoder_input_ids` de `[1, 128]` int64, alineados a la izquierda y rellenados. No se usa caché de KV, por lo que cada paso de decodificación ejecuta una pasada completa de 128 posiciones; el proceso se repite hasta encontrar el token `<|endoftext|>` (50257).

La exportación se realizó con ExecuTorch 1.4.0 y PyTorch 2.13.0. La verificación indica que los dos grafos (encoder y decoder) componen exactamente el `WhisperForConditionalGeneration` original, con `max_abs_diff` de 0.000e+00. Los tiempos de ejecución se midieron como medianas de 5 ejecuciones en un Mac arm64, y se presentan como referencia relativa, no como cifras de rendimiento absolutas.

## Capacidades

- Transcripción de voz a texto en inglés y otros idiomas (heredado del modelo base Whisper).
- Reconocimiento automático del habla (ASR) para audio de hasta 30 segundos por ventana; ventanas más largas requieren reiniciar el proceso.
- Generación de transcripciones con o sin marcas de tiempo (en la configuración por defecto se usa `<|notimestamps|>`).
- Ejecución on-device sin dependencias de Python en tiempo de inferencia, gracias a los grafos `.pte` de ExecuTorch.
- Compatibilidad con aceleración por hardware a través de XNNPACK (CPU) y Core ML (Apple Silicon, solo encoder).
- Soporte de cuantización int8 dinámica para reducir el tamaño y mejorar la latencia sin degradación significativa (WER 0.0% en pruebas).
- Composición flexible: cualquier variante de encoder puede emparejarse con cualquier variante de decoder.

## Casos de uso

- **Transcripción en tiempo real en dispositivos móviles**: el encoder int8 (662.4 MB) y el decoder int8 (440.1 MB) caben en un teléfono de gama media; el modelo puede transcribir audio de micrófono en ventanas de 30 segundos con latencia media de 1.58 s (encoder) y 0.047 s (decoder) en hardware de referencia.
- **Asistentes de voz en el borde**: al ejecutarse localmente, no requiere conexión a internet ni envío de audio a servidores, lo que garantiza privacidad y baja latencia.
- **Subtitulado automático de vídeos**: para clips de menos de 30 segundos, el modelo puede generar subtítulos directamente; para vídeos más largos, se puede segmentar el audio en ventanas de 30 s y concatenar las transcripciones.
- **Accesibilidad en aplicaciones**: transcripción de reuniones o conferencias en aplicaciones de escritorio con aceleración Core ML en Apple Silicon, aprovechando la variante encoder Core ML (589 ms por ventana).
- **Desarrollo de herramientas de audio**: integración en pipelines de procesamiento de voz (p. ej., generación de subtítulos, análisis de sentimiento) mediante wrappers que componen los grafos `.pte`.
- **Investigación en ASR on-device**: el repositorio incluye el script de conversión (`convert/export_whisper.py`), lo que permite reproducir el proceso de exportación y adaptarlo a otros modelos Whisper.

## Benchmarks y rendimiento

La model card incluye datos de verificación end-to-end, pero no benchmarks estándar de ASR (como WER sobre LibriSpeech o Common Voice). Se presentan las cifras de correlación y tiempos de ejecución medidos en un Mac ARM64 (mediana de 5 ejecuciones):

| Grafo | Build | Tamaño (MB) | Correlación vs fp32 eager | Tiempo (ms) | Tiempo eager (ms) |
|---|---|---|---|---|---|
| Encoder | XNNPACK fp32 | 2548.3 | 1.000000 | 1800.1 | 860.5 |
| Encoder | XNNPACK int8 | 662.4 | 0.996407 | 1582.1 | 866.5 |
| Encoder | Core ML | 1275.7 | 0.998309 | 589.1 | 869.7 |
| Decoder | XNNPACK fp32 | 953.3 | 1.000000 | 56.6 | 43.2 |
| Decoder | XNNPACK int8 | 440.1 | 0.998471 | 46.7 | 40.7 |

Pruebas de tasa de error de palabra (WER) end-to-end, sobre 5 frases habladas (comparación contra el control fp32):

- Encoder int8 vs fp32: WER medio 0.0% (peor clip 0.0%).
- Decoder int8 vs fp32: WER medio 0.0% (peor clip 0.0%).

El autor advierte que la sensibilidad de la prueba WER es limitada: inyectar ruido con `rel_l2` 0.03 o 0.10 (lo que cuesta int8) produce WER 0.000, pero con `rel_l2` 0.20 o 0.40 el WER sube a 0.025. Por tanto, un resultado de 0.0% indica que no se rompe la transcripción, no que el modelo sea indistinguible en cualquier nivel de error.

## Requisitos de hardware

- **Tamaño de los grafos**: el par más ligero (encoder int8 + decoder int8) ocupa 1102.5 MB; el par fp32 completo ocupa 3501.6 MB.
- **Memoria**: se requiere suficiente RAM o memoria de almacenamiento para cargar los grafos; no se especifica VRAM porque el modelo se ejecuta en CPU o en aceleradores integrados (no en GPU).
- **Plataformas soportadas**: ExecuTorch con backend XNNPACK (CPU) en sistemas con arquitectura ARM (incluidos Macs Apple Silicon); el encoder Core ML solo funciona en dispositivos Apple.
- **Dependencias**: ExecuTorch 1.4.0 y PyTorch 2.13.0 para la verificación, aunque los archivos `.pte` son autocontenidos para inferencia.
- **Opciones de despliegue**: los archivos `.pte` se cargan directamente en runtime de ExecuTorch; no se mencionan integraciones con vLLM, Ollama o TGI, ya que es un sistema on-device.
- **Latencia**: en el Mac de referencia, el encoder int8 tarda 1582.1 ms por ventana de 30 s y el decoder int8 46.7 ms por token, lo que da una latencia media de ~1.63 s por ventana sin contar la decodificación de tokens (que depende de la longitud de la transcripción).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `openai/whisper-large-v3-turbo` (base) | 809M (podado a 4 capas de decoder) | 30 s audio | MIT | safetensors | HuggingFace |
| `mlboydaisuke/Whisper-large-v3-turbo-ExecuTorch` | No disponible (derivado del anterior) | 30 s audio | MIT | `.pte` (ExecuTorch) | HuggingFace |
| `openai/whisper-large-v3` (original) | 809M | 30 s audio | MIT | safetensors | HuggingFace |

La comparativa directa con otras implementaciones on-device (p. ej., Whisper.cpp) no está disponible en la información proporcionada. La principal diferencia frente al modelo original es el formato de pesos y la optimización para ejecución estática en dispositivos, a costa de no tener caché de KV y de un decoder más grande que sus pesos (debido a la duplicación del embedding en el grafo).

## Limitaciones y advertencias

- **Sin caché KV**: el decoder ejecuta una pasada completa de 128 posiciones por cada token, lo que aumenta la latencia por token en comparación con una implementación con caché.
- **Ventana de contexto fija**: la transcripción se limita a ventanas de 30 segundos; para audios más largos hay que reiniciar el proceso y concatenar los resultados.
- **Decoder más grande que sus pesos**: la tabla de embeddings de tokens (265.5 MB) se duplica en el grafo del decoder, lo que infla el tamaño del archivo `.pte` (953.3 MB fp32, 440.1 MB int8).
- **Core ML no publicado**: la variante del decoder Core ML se convirtió, pero se descartó porque produce una tasa de error de palabra media del 43.9% (peor clip 66.7%) frente al decoder fp32; el encoder Core ML sí se incluye.
- **Sesgos del modelo base**: Whisper es conocido por tener sesgos en el reconocimiento de acentos y dialectos, y por un rendimiento variable según el idioma; no se han realizado evaluaciones específicas en esta conversión.
- **Riesgo de alucinación**: como todos los modelos de ASR, puede generar transcripciones de frases que no están en el audio, especialmente en audios ruidosos o con solapamiento de voces.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero los modelos base de OpenAI (Whisper) también tienen licencia MIT, por lo que no hay restricciones adicionales.
- **Dependencia de la herramienta de conversión**: el proceso de exportación depende de la versión de ExecuTorch y PyTorch; no se garantiza compatibilidad con versiones futuras.

## Enlaces

- [HuggingFace: mlboydaisuke/Whisper-large-v3-turbo-ExecuTorch](https://huggingface.co/mlboydaisuke/Whisper-large-v3-turbo-ExecuTorch)
- [HuggingFace: openai/whisper-large-v3-turbo (modelo base)](https://huggingface.co/openai/whisper-large-v3-turbo)
- [GitHub: openai/whisper](https://github.com/openai/whisper)
- [GitHub: qualcomm/ai-hub-models - whisper_large_v3_turbo](https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/whisper_large_v3_turbo)
- [OpenASR: Whisper Large v3 Turbo](https://openasr.org/models/whisper-large-v3-turbo/)
