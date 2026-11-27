# Acapellas/bs-roformer-sw-onnx-vocals

## Resumen

BS-RoFormer SW — Vocals (ONNX, 1-stem) es una exportación a ONNX del modelo de separación de fuentes musicales BS-RoFormer SW-Fixed, especializada exclusivamente en la extracción del canal de voces. Lo publica el usuario Acapellas a partir del checkpoint original de enerjazzer/BS-ROFO-SW-Fixed (duplicado de jarredou/BS-ROFO-SW-Fixed). El modelo resuelve el problema de aislar la pista vocal de una mezcla musical estéreo a 44,1 kHz, un caso de uso habitual en remezcla, karaoke, limpieza de samples y postproducción de audio.

La relevancia de esta ficha no está en el modelo original, sino en el formato: se distribuye como grafo ONNX ejecutable con onnxruntime en CPU, sin dependencias de GPU ni de frameworks de deep learning pesados. En inferencia solo requiere onnxruntime, numpy y soundfile. El repositorio ocupa 0,4 GB e incluye cuatro variantes (fp32 y tres int8) que pesan entre 58 y 211 MB, frente a los 709 MB del grafo completo de 6 stems.

El modelo no es un modelo de audio de extremo a extremo: es un grafo de máscaras que consume el STFT de un fragmento de 588.800 muestras (13,35 s) y devuelve una máscara compleja. El pipeline circundante (STFT, troceado con solapamiento, ISTFT) lo aporta el repositorio de código del autor. La licencia figura como desconocida, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BS-RoFormer (transformer con atención de banda dividida) exportado como grafo de máscaras ONNX |
| Parámetros totales | 51.039.176 (subconjunto de los 174.656.500 del checkpoint de 6 stems) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana estática de 588.800 muestras (13,35 s) por forward, T=1151 fijo |
| Tipos de cuantización | fp32, int8 weights-only (block-32 q8_0), int8 dinámico, int8 dinámico per-channel |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | unknown |
| Formato de pesos | ONNX (opset 18, ejes estáticos, sin ficheros sidecar) |

## Arquitectura y entrenamiento

El modelo original BS-RoFormer SW-Fixed es una red de separación de fuentes basada en RoFormer con atención de banda dividida, operando sobre STFT estéreo a 44,1 kHz con n_fft 2048, hop 512 y ventana Hann periódica de 2048 puntos con center reflect-pad de 1024. Esta exportación concreta no contiene el pipeline completo: es un grafo de máscaras que recibe `stft_chunk` de forma (4100, 1151) float32 — 1025 bins empaquetados como filas `[re_L, im_L, re_R, im_R]` — y devuelve `masks` de forma (4100, 1, 1151) float32. El troceado usa fragmentos de 588.800 muestras con `num_overlap=2`, paso de 294.400 y crossfade lineal de 58.880 muestras con normalización por contador; el padding reflect en los bordes permite procesar pistas de cualquier duración (verificado hasta 28,98 s y 7 fragmentos).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens de audio ni si hubo ajuste fino con RLHF o DPO. La innovación técnica destacable es la cuantización: el autor documenta que int8 funciona en el grafo de una sola pista pero no en el de 6 stems, porque en este último el error de cuantización por tensor se amplifica a lo largo de las 12 capas y degrada los stems casi silenciosos de guitarra y piano (correlación 0,79–0,85 frente al CLI). Al eliminar esas cabezas, la pista vocal restante supera el umbral de 0,999. La variante int8 weights-only block-32 replica exactamente los pesos q8_0 del CLI de producción (BSRoformer.cpp), por lo que iguala o supera ligeramente al fp32 frente a esa referencia.

## Capacidades

- Separación de la pista vocal de una mezcla musical estéreo a 44,1 kHz, con salida de una sola pista (1-stem).
- Procesamiento de pistas de duración arbitraria mediante troceado con solapamiento y crossfade (verificado hasta 28,98 s).
- Ejecución en CPU con onnxruntime, sin GPU ni frameworks de deep learning.
- Cuatro variantes con compromisos distintos de tamaño, velocidad y fidelidad: fp32 como referencia, int8wo_b32 para máxima fidelidad, int8dyn e int8dyn_pc para velocidad.
- Paridad de bits del fp32 con el canal de voces del modelo de 6 stems (correlación 1,0 − 4,1e-13, max|d| 1,013e-5, ruido de orden de acumulación en f32).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada distinto de la mezcla musical ni capacidades multilingües: es un modelo de separación de fuentes, no un modelo generativo de propósito general.

## Casos de uso

- Karaoke y pistas de acompañamiento: se extrae la voz de la mezcla y se usa la instrumental resultante (mezcla menos vocal) o se procesa la vocal por separado para efectos. La ventana de 13,35 s con crossfade permite procesar canciones completas sin cortes audibles.
- Remezcla y edición musical: aislar la vocal para aplicar procesado independiente (reverb, compresión, afinación) y volver a mezclar con la instrumental, con la fidelidad del fp32 o del int8wo_b32.
- Limpieza de samples y loops: extraer voces limpias de grabaciones con ruido de fondo o de mezclas antiguas para reutilizarlas en producción, aprovechando que el modelo opera sobre STFT estéreo estándar.
- Postproducción de vídeo y doblaje: separar diálogo cantado o vocal de bandas sonoras para sustituir la música de fondo o adaptar la pista a otro idioma, con despliegue en CPU sin GPU dedicada.
- Investigación en separación de fuentes: servir de referencia reproducible en ONNX para comparar cuantizaciones (fp32 frente a int8 dinámico) sobre el mismo checkpoint, con el análisis de cuantización publicado por el autor.
- Despliegue en entornos sin GPU: integrar la separación vocal en servidores CPU, portátiles o contenedores ligeros donde no hay CUDA disponible, con un consumo de memoria controlado desactivando el arena de onnxruntime.
- Preprocesado de datasets de audio: generar pares mezcla/vocal para entrenar o evaluar otros modelos de separación, usando la variante int8dyn_pc por su mayor velocidad.

## Benchmarks y rendimiento

Calidad frente al CLI de producción q8_0 (BSRoformer.cpp) sobre un clip estéreo de 8,391 s y otro de 28,98 s, con correlación de Pearson y SNR de la pista vocal completa:

| Variante | 8,391 s (corr / SNR) | 28,98 s (corr / SNR) | Corr. de máscara vs fp32 | Velocidad |
|---|---|---|---|---|
| fp32 | 0,9999542 / 40,4 dB | 0,9999732 / 42,7 dB | referencia | 1,00× |
| int8wo block-32 | 0,9999759 / 43,2 dB | 0,9999892 / 46,7 dB | 0,9998721 | ~1,0× |
| int8dyn | 0,9992897 / 28,1 dB | 0,9994887 / 29,0 dB | 0,9956626 | ~1,24× |
| int8dyn per-channel | 0,9997065 / 32,3 dB | 0,9998275 / 34,4 dB | 0,9982422 | ~1,27× |

Las cuatro variantes superan el umbral de correlación 0,999 frente al CLI en ambas duraciones. El int8wo block-32 supera al fp32 frente al CLI porque incorpora exactamente los pesos q8_0 block-32 del CLI.

Latencia por forward de fragmento en CPU x86 de 14 núcleos (host WSL compartido), onnxruntime 1.32, 14 hilos, arena de memoria desactivada, calentamiento 1+3:

| Variante | Forward por fragmento (media / mínimo) |
|---|---|
| fp32 | 48,94 s / 47,96 s |
| int8wo block-32 | 49,43 s / 48,74 s (sin mejora: DQ → GEMM f32) |
| int8dyn | 39,35 s / 38,27 s |
| int8dyn per-channel | 38,58 s / 38,18 s |

## Requisitos de hardware

- Inferencia en CPU con onnxruntime (probado en 1.32); no requiere GPU.
- Memoria: con el arena de onnxruntime desactivado, un forward del grafo de 6 stems de 709 MB pico ~1,4 GB de RSS; con el arena activo se observó OOM en un host de 14 núcleos y 16 GB (exit 137, ~14 GB de RSS). El autor documenta el ajuste exacto: `enable_cpu_mem_arena = False` y, opcionalmente, fijar `intra_op_num_threads`.
- Tamaño en disco: 211 MB (fp32), 66 MB (int8wo_b32), 58 MB (int8dyn), 59 MB (int8dyn_pc), más `SHA256SUMS`.
- GPU recomendadas: no disponible; el modelo está pensado para CPU.
- Cabe en cualquier consumer PC: los ficheros int8 rondan los 60 MB y el fp32 los 211 MB.
- Opciones de despliegue: onnxruntime (Python) y el CLI `bsroformer-split` del repositorio del autor; el paquete se instala con `pip install git+https://github.com/tehakal/bs-roformer-sw-onnx`.
- Throughput: ~38,6 s por fragmento de 13,35 s con int8dyn_pc en el hardware de referencia, es decir, inferencia más lenta que tiempo real en ese equipo; no se han publicado cifras para otros procesadores.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Acapellas/bs-roformer-sw-onnx-vocals (este) | 51.039.176 | 588.800 muestras (13,35 s) por forward | ONNX (fp32, int8) | unknown | 1 stem, CPU, 58–211 MB |
| koidn/bs-roformer-sw-onnx | 174.656.500 (6 stems) | misma ventana | ONNX fp32 | no disponible | 6 stems, 709 MB, sin variantes int8 viables |
| enerjazzer/BS-ROFO-SW-Fixed | 174.656.500 | misma ventana | pesos originales | no disponible | checkpoint base, 6 stems |
| jarredou/BS-ROFO-SW-Fixed | 174.656.500 | misma ventana | pesos originales | no disponible | origen del checkpoint duplicado |

No se dispone de datos de benchmarks de otros modelos de separación de fuentes en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- Licencia desconocida: no hay autorización explícita para uso comercial; conviene verificar la licencia del checkpoint original (jarredou/BS-ROFO-SW-Fixed) antes de desplegarlo en producción.
- Solo separa una pista (vocals); no extrae batería, bajo, guitarra, piano ni otros stems. Para eso hace falta el modelo de 6 stems.
- No es un modelo de extremo a extremo: requiere el pipeline STFT/ISTFT del repositorio del autor; usar el grafo de forma aislada produce resultados incorrectos.
- Riesgo de OOM con la configuración por defecto de onnxruntime: el arena de CPU retiene el máximo de memoria de la sesión y provocó exit 137 en un host de 16 GB. Es obligatorio desactivar `enable_cpu_mem_arena`.
- Latencia alta en CPU: ~38,6 s por fragmento de 13,35 s con la variante más rápida en el hardware de referencia, más lento que tiempo real.
- La cuantización int8 dinámica degrada la fidelidad (SNR 28,1–34,4 dB frente a 40,4–42,7 dB del fp32); para máxima calidad usar fp32 o int8wo_b32.
- No se han documentado sesgos, pero al ser un modelo entrenado sobre música, puede tener peor rendimiento en voces no occidentales, grabaciones de baja calidad o mezclas muy densas; no hay datos publicados al respecto.
- Riesgo de artefactos y sangrado entre pistas en pasajes con instrumentos en el mismo rango frecuencial que la voz.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Acapellas/bs-roformer-sw-onnx-vocals
- Modelo de 6 stems companion: https://huggingface.co/koidn/bs-roformer-sw-onnx
- Checkpoint base: https://huggingface.co/enerjazzer/BS-ROFO-SW-Fixed
- Repositorio de código, scripts de exportación y documentación: https://github.com/tehakal/bs-roformer-sw-onnx
- Análisis de cuantización: https://github.com/tehakal/bs-roformer-sw-onnx/blob/main/docs/quantization.md
- onnxruntime: https://onnxruntime.ai
