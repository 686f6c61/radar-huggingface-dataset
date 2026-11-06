# clarsam/crepe-mlx

## Resumen

CREPE para MLX es una conversión de los pesos originales del modelo CREPE (Convolutional Representation for Pitch Estimation), publicado en ICASSP 2018 por Kim, Park, Lee, Kwon, Kim, Lee y Nam, al framework MLX de Apple para su ejecución nativa en Apple Silicon con aceleración Metal. No se trata de un modelo nuevo ni reentrenado: el autor, clarsam, redistribuye los tensores `float32` originales del repositorio `marl/crepe` renombrados al layout de MLX y validados mediante SHA-256 por fichero y por bundle. La licencia es MIT, heredada del proyecto upstream.

El modelo resuelve una tarea muy concreta: estimación de frecuencia fundamental (F0) y pitch en audio monofónico. La arquitectura es una CNN que opera sobre tramas crudas de 1024 muestras a 16 kHz y produce una saliencia de pitch de 360 bins a una tasa de 10 ms por trama. Se distribuyen cinco capacidades (tiny, small, medium, large y full) con 487.096, 1.629.192, 5.879.464, 12.751.176 y 22.244.328 parámetros respectivamente, lo que lo sitúa en el rango de modelos ligeros aptos para inferencia en tiempo real incluso en hardware de consumo.

Su relevancia actual es doble: por un lado, ofrece una alternativa libre de TensorFlow y PyTorch en el camino de inferencia para usuarios de Mac con chip Apple Silicon; por otro, la validación de fidelidad publicada (error máximo absoluto de 2,09e-06 en activaciones y 0,0016 cents en F0 para tramas voiced) lo convierte en una referencia fiable para pipelines de análisis de voz y música que necesiten F0 determinista y verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional sobre tramas crudas de 1024 muestras a 16 kHz |
| Parametros totales | 487.096 (tiny), 1.629.192 (small), 5.879.464 (medium), 12.751.176 (large), 22.244.328 (full) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; procesa tramas de 1024 muestras (64 ms a 16 kHz) con salida cada 10 ms |
| Tipos de cuantizacion | float32 únicamente (el runtime declara `dtype` float32 only) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | MIT (Copyright © 2018 Jong Wook Kim) |
| Formato de pesos | `.npy` float32 por tensor, con `manifest.json` e `index.json`; bundle validado por SHA-256 |
| Pipeline | audio-classification |
| Frecuencia de muestreo de entrada | 16 kHz mono (resampling interno vía soxr HQ para otras tasas) |
| Resolución de salida | 360 bins de saliencia, 10 ms por trama |
| Tamaño del repo | 0.2 GB |

## Arquitectura y entrenamiento

CREPE es una red neuronal convolucional que toma directamente formas de onda crudas como entrada, sin extracción previa de features espectrales. Cada trama de 1024 muestras (64 ms a 16 kHz) se procesa a través de una pila de capas convolucionales con multiplicadores de capacidad configurables (4, 8, 16, 24 y 32 para tiny, small, medium, large y full). La salida es un vector de 360 bins que representa la saliencia de pitch, del cual se deriva la F0 mediante el decodificador (argmax con interpolación parabólica, opcionalmente con suavizado Viterbi offline).

Los pesos son los originales del repositorio `marl/crepe` en el commit `bb29b8d99a89924476d112d27ed470e4ac5617c0` (rama `models`), correspondientes a la versión v0.0.16 del código fuente (`c9b71ce61491454125a0693f584f7244f29d9884`). No hay reentrenamiento ni ajuste fino: la conversión consiste en renombrar cada tensor al layout de MLX (con transformaciones `identity` o `transpose` registradas en el manifiesto) y verificar la integridad mediante SHA-256. El autor cita como crédito intermedio el port a PyTorch `maxrmorrison/torchcrepe` (MIT © 2020 Max Morrison).

La innovación técnica del paquete no está en el modelo en sí, sino en la cadena de conversión y verificación: se valida frame a frame contra una ejecución independiente en TensorFlow del código upstream con pesos genuinos, cubriendo 100 condiciones en las cinco capacidades, tasas de 16, 44,1 y 48 kHz, ambos modos de centrado y hops de 5, 10 y 20 ms. La entrada a 16 kHz es bit-idéntica al oráculo; en audio remuestreado se usa soxr en modo HQ frente al `scipy.signal.resample_poly` del oráculo, por lo que la comparación elemento a elemento no aplica a los dos extractos reales a 44,1 kHz.

## Capacidades

- Estimación de frecuencia fundamental (F0) en audio monofónico, con salida por trama cada 10 ms.
- Cálculo de confianza por trama (máximo de saliencia) y vector de activación completo de 360 bins.
- Soporte de audio a 16 kHz nativo y remuestreo interno desde 44,1 kHz y 48 kHz mediante soxr HQ.
- Modos de centrado de trama configurables y hops de 5, 10 y 20 ms.
- Suavizado Viterbi offline opcional (`viterbi=True`) para secuencias de F0 más estables; no es un camino de streaming (no causal).
- Procesamiento por lotes con `batch_size` configurable (por defecto 256) para acotar memoria en audio largo.
- Verificación de integridad opcional (`verify`) de pesos contra SHA-256 en tiempo de carga.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo de audio especializado.
- No es un transcriptor polifónico; su dominio es voz y instrumentos monofónicos.

## Casos de uso

- Análisis de prosodia en investigación lingüística: extracción de contornos de F0 a 10 ms sobre grabaciones de habla para estudiar entonación, tono y ritmo, con la ventaja de que la salida es determinista y verificable bit a bit frente al oráculo de TensorFlow.
- Afinación y corrección de pitch en producción musical: el modelo `full` procesa audio a RTF de 0,098-0,105 en M1 Max, lo que permite analizar pistas vocales monofónicas completas en pocos segundos y alimentar herramientas de corrección con contornos de F0 y confianza por trama.
- Detección de voz cantada frente a hablada: la confianza por trama y el patrón de saliencia permiten clasificar segmentos vocales en aplicaciones de karaoke, separación de fuentes o etiquetado de archivos musicales.
- Preprocesado para modelos de síntesis de voz (TTS): extracción de F0 de referencia para modelos de conversión de voz o clonación que necesiten contornos de pitch alineados temporalmente con precisión de 10 ms.
- Monitorización en tiempo real de pitch en aplicaciones de entrenamiento vocal: con la capacidad `tiny` a RTF de 0,0067 en M1 Max, es viable procesar audio en vivo con latencia baja en un Mac con Apple Silicon, manteniendo el proceso completamente local.
- Análisis de salud vocal: seguimiento de estabilidad y rango de F0 en grabaciones clínicas monofónicas, aprovechando la confianza por trama para descartar segmentos no voiced y la reproducibilidad de la conversión verificada.
- Investigación en psicoacústica y musicología computacional: extracción de contornos de F0 de instrumentos monofónicos (flauta, violín, voz) para estudios de afinación, vibrato y articulación, con la garantía de que los pesos son los originales del paper de ICASSP 2018.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K). Sí se publican métricas de fidelidad de la conversión y de velocidad:

| Comprobación | Medido | Umbral |
|---|---|---|
| Activación (modelo + decodificador sobre tramas normalizadas idénticas) | max abs 2,09e-06 | atol 1e-4, rtol 1e-3 |
| Confianza | max abs 1,68e-06 | 1e-4 |
| F0 (tramas voiced, 13.820) | mediana peor 0,0016 cents; p99 peor 0,42 cents | 0,1 / 1 cent |
| Timestamps | exactos | 1e-9 s |
| Errores de octava | 0 | — |

| Capacidad | Audio | RTF (s de cómputo por s de audio) |
|---|---|---|
| tiny | 10 s | 0,0067 |
| tiny | 30 s | 0,0061 |
| full | 10 s | 0,098 |
| full | 30 s | 0,105 |
| full, `batch_size=1` | 10 s | 1,18 |

Medido en Apple M1 Max (32 GB), macOS 27, MLX 0.32.4, `float32`, GPU, batch 256, máquina en reposo. El RTF depende del batch y del hardware; no es una comparación entre runtimes. Memoria pico para 60 s de audio con batch 32: ~190 MB, frente a ~15 GB para una pasada de capacidad full con todo el audio de una vez.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Salida | Licencia | Runtime |
|---|---|---|---|---|---|
| CREPE MLX (este) | 0,49M–22,2M según capacidad | Audio crudo 16 kHz, tramas de 1024 muestras | 360 bins de saliencia, F0 cada 10 ms | MIT | MLX (Apple Silicon, Metal) |
| CREPE original (marl/crepe) | mismos pesos | mismas tramas | misma salida | MIT | TensorFlow |
| torchcrepe (maxrmorrison) | mismos pesos | mismas tramas | misma salida | MIT | PyTorch |
| pYIN / librosa | no disponible | Espectrograma / autocorrelación | F0 por trama | ISC (librosa) | CPU (NumPy/SciPy) |

La comparación relevante no es de rendimiento predictivo (los tres primeros comparten pesos), sino de runtime: MLX evita TensorFlow y PyTorch en el camino de inferencia y aprovecha Metal en Apple Silicon. Frente a pYIN, CREPE ofrece una saliencia de 360 bins y confianza por trama con validación bit a bit contra el oráculo, mientras que pYIN es un algoritmo clásico sin pesos neuronales. No se dispone de datos de benchmarks comparativos de precisión entre CREPE y pYIN en la información proporcionada.

## Limitaciones y advertencias

- Estimación de pitch monofónica: el dominio del modelo upstream es voz y instrumentos monofónicos; no es un transcriptor polifónico.
- El centrado de tramas y el suavizado Viterbi son offline (no causales); no constituyen un camino de streaming. Para aplicaciones en tiempo real debe usarse el modo sin Viterbi y asumir el centrado correspondiente.
- Solo soporta `float32`; no hay cuantización a float16, bfloat16 ni int8 en el runtime, lo que limita la reducción de memoria frente a otras alternativas.
- La verificación bit a bit con el oráculo solo se cumple estrictamente a 16 kHz; con audio remuestreado desde 44,1 kHz o 48 kHz, la comparación end-to-end no aplica por la diferencia entre soxr HQ y `scipy.signal.resample_poly`.
- Riesgo de errores de octava en señales con contenido armónico ambiguo, aunque la validación reportada con 13.820 tramas voiced da 0 errores de octava en las condiciones probadas.
- Licencia MIT permite uso comercial, pero el autor no reclama licencia separada sobre los pesos: se redistribuyen bajo la misma licencia del repositorio `marl/crepe`, y no es una salida oficial de MARL.
- Dependencia de MLX y Apple Silicon: no es ejecutable en GPU NVIDIA ni en CPU x86 sin portar los pesos a otro runtime (por ejemplo, torchcrepe).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/clarsam/crepe-mlx
- Paper original: https://arxiv.org/abs/1802.06182
- Repositorio upstream MARL CREPE: https://github.com/marl/crepe
- Commit de pesos: `bb29b8d99a89924476d112d27ed470e4ac5617c0` (rama `models`)
- Commit de código fuente: `c9b71ce61491454125a0693f584f7244f29d9884` (v0.0.16)
- Port a PyTorch: https://github.com/maxrmorrison/torchcrepe
- MLX: https://github.com/ml-explore/mlx
