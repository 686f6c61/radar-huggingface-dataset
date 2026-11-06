# novaty/tune-separacao

## Resumen

NOVATY TUNE es un conjunto de cuatro modelos de separación de fuentes musicales (source separation) distribuidos en formato ONNX, empaquetados por el desarrollador novaty para su aplicación móvil homónima. No se trata de un modelo de lenguaje ni de un modelo fundacional: son los pesos de Spleeter de Deezer Research, preentrenados para 4 pistas (voz, batería, bajo y "resto"), convertidos a ONNX por el proyecto Best-Practice y redistribuidos sin modificación para su ejecución local en dispositivos móviles.

El objetivo es práctico: permitir que una aplicación de audio separe una canción en sus componentes instrumentales directamente en el teléfono, sin enviar audio a ningún servidor. Cada pista se sirve como un grafo ONNX independiente, en dos precisiones (fp16 para el cliente móvil, fp32 como reserva), con un total de ocho ficheros de entre 19,7 MB y 39,4 MB.

La relevancia actual es la del ecosistema de separación de fuentes ligeras y desplegables en el borde (edge): Spleeter es un referente consolidado desde 2019, y su conversión a ONNX con variantes fp16 lo hace viable en hardware consumer y móvil. El repositorio es pequeño (0,2 GB), tiene licencia Apache-2.0 sobre el empaquetado y los pesos originales son MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional sobre espectrograma de magnitud STFT (Spleeter, 4 pistas) |
| Parametros totales | no disponible (no se declara el recuento; tamaño por pista de 19,7 MB en fp16 y 39,4 MB en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada `x` float32 `[2, n, 512, 1024]` (magnitud STFT 4096/1024, ventana Hann periódica) |
| Tipos de cuantizacion | fp16 (`*.fp16.onnx`) y fp32 (`*.onnx`) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | Apache-2.0 en el empaquetado; pesos Spleeter originales bajo MIT (Deezer SA) |
| Formato de pesos | ONNX (8 ficheros: 4 pistas en fp16 y 4 en fp32) |

## Arquitectura y entrenamiento

Cada pista es un modelo convolucional independiente que opera sobre la magnitud de la STFT de la mezcla estéreo a 44,1 kHz. La entrada es un tensor `[2, n, 512, 1024]` (canales estéreo, tramas temporales, bins de frecuencia) calculado con una STFT de tamaño 4096 y salto 1024 con ventana Hann periódica; la salida `y` tiene el mismo formato y representa la magnitud estimada de la pista correspondiente. La reconstrucción de la señal temporal se realiza fuera del grafo, combinando la magnitud estimada con la fase de la mezcla original (típicamente mediante ISTFT).

Los pesos proceden del modelo preentrenado de 4 pistas de Spleeter (Deezer Research, 2019), entrenado sobre un corpus musical propietario de Deezer no detallado en la información disponible. No se ha realizado fine-tuning ni modificación de los pesos: la conversión a ONNX la llevó a cabo el proyecto Best-Practice (commit `486643021f18a4d057d282fff1d11b89a30e9887`) y novaty redistribuye los ficheros tal cual. No hay información sobre RLHF, DPO ni innovaciones de decodificación; no aplica.

## Capacidades

- Separación de una mezcla musical estéreo en cuatro pistas: voz, batería, bajo y "resto" (other).
- Ejecución local en dispositivo mediante ONNX Runtime; no requiere envío de audio a servidor.
- Dos precisiones por pista: fp16 para despliegue móvil y fp32 para mayor fidelidad numérica.
- Procesamiento por ventanas temporales arbitrarias (`n` tramas), lo que permite streaming por bloques.
- Integridad verificable: el autor publica el SHA-256 de cada fichero.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de audio.

## Casos de uso

- Aplicación móvil de karaoke o práctica instrumental: cargando `vocals.fp16.onnx` se obtiene la pista vocal aislada y, por resta sobre la mezcla, la base instrumental, todo en el propio teléfono sin coste de servidor.
- Edición musical en el dispositivo: extraer la pista de batería o bajo para remezclar, samplear o practicar con un instrumento concreto, usando los grafos `drums.fp16.onnx` y `bass.fp16.onnx`.
- Herramientas de DJ y mashup: separar voces y "resto" de dos canciones y recombinarlas en tiempo real, aprovechando que los cuatro grafos son independientes y de pequeño tamaño.
- Preprocesado para transcripción o análisis musical: aislar la voz antes de pasarla a un sistema ASR, o aislar la batería para detección de tempo y onsets, mejorando la relación señal-ruido de etapas posteriores.
- Aplicaciones de accesibilidad: atenuar o eliminar la voz de una grabación para generar versiones instrumentales de material propio con fines de accesibilidad auditiva.
- Despliegue en dispositivos de borde sin conectividad: cajas de audio, Raspberry Pi o navegadores con ONNX Runtime Web, donde los 19,7 MB por pista fp16 caben en memoria y almacenamiento con holgura.
- Prototipado e investigación: al ser ONNX y de licencia permisiva, sirve como línea base reproducible para comparar pipelines de separación propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas SDR, SIR ni SAR, ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- VRAM/RAM estimada: cada grafo fp16 ocupa 19,7 MB en disco y una fracción similar en memoria al cargarse; los cuatro fp16 suman unos 79 MB. La variante fp32 suma unos 158 MB. El consumo real depende del tamaño de la ventana `n` procesada.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con soporte ONNX Runtime (CUDA o DirectML) acelera el procesamiento. En servidor, una T4 o superior es más que suficiente.
- GPU consumer: cabe holgadamente en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna; el cuello de botella es el cómputo de STFT/ISTFT, no la memoria.
- Despliegue: ONNX Runtime (CPU, CUDA, DirectML, CoreML, NNAPI), ONNX Runtime Web, o cualquier runtime compatible con ONNX. No se distribuye en GGUF ni en formato nativo de llama.cpp, vLLM o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Pistas | Formato | Licencia | Tamaño | Notas |
|---|---|---|---|---|---|
| NOVATY TUNE (este) | 4 | ONNX fp16/fp32 | Apache-2.0 (empaquetado), MIT (pesos) | 19,7-39,4 MB por pista | Redistribución de Spleeter convertido, orientado a móvil |
| Spleeter 4stems (Deezer) | 4 | TensorFlow checkpoint | MIT | no disponible en la información | Modelo original de referencia |
| Best-Practice/spleeter-4stems-onnx | 4 | ONNX | Apache-2.0 | no disponible en la información | Conversión de la que proceden estos ficheros |
| Demucs (Meta) | 4 | PyTorch | MIT | varios cientos de MB | Mayor calidad típica, mucho más pesado; no cabe en móvil con holgura |

La comparación se limita a lo documentado; no se dispone de métricas de calidad para ordenar estos sistemas numéricamente.

## Limitaciones y advertencias

- Solo separa cuatro pistas; instrumentos como guitarra, piano o cuerdas quedan agrupados en "other".
- Calidad limitada por la arquitectura Spleeter de 2019: es inferior a modelos más recientes y pesados como Demucs en pasajes densos o con reverberación.
- La reconstrucción de la señal depende de la fase de la mezcla original; artefactos y sangrado entre pistas son esperables.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingües ni de razonamiento.
- La licencia del empaquetado es Apache-2.0, pero los pesos originales son MIT (Deezer SA); conviene conservar los avisos de copyright y el fichero NOTICE al redistribuir.
- El autor indica que los ficheros se redistribuyen sin modificación; cualquier uso comercial debe verificar el cumplimiento de ambas licencias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- No se documentan sesgos ni riesgos de alucinación por tratarse de un modelo de audio; el riesgo principal es la calidad de separación y la posible infracción de derechos sobre el material procesado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/novaty/tune-separacao
- Spleeter (Deezer Research): https://github.com/deezer/spleeter
- Conversión ONNX de origen: https://huggingface.co/Best-Practice/spleeter-4stems-onnx
