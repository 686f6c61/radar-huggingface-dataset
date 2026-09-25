# ldov/canary-1b-v2-gguf

## Resumen

`ldov/canary-1b-v2-gguf` es una conversión al formato GGUF del modelo `nvidia/canary-1b-v2`, publicada por el usuario ldov y pensada para ejecutarse con la librería transcribe.cpp. El modelo base lo desarrolla NVIDIA y es un sistema multitarea de reconocimiento automático del habla (ASR) y traducción de voz (AST) de 980.046.848 parámetros (≈978 M) que cubre 25 idiomas europeos.

La arquitectura es encoder-decoder: un encoder FastConformer de 32 capas y un decoder Transformer de 8 capas, con tokens de tarea del tipo `<source language>` y `<target language>` que dirigen la generación. Resuelve dos problemas con un solo conjunto de pesos: transcribir audio en cualquiera de los 25 idiomas soportados y traducir voz entre inglés y los otros 24 idiomas. Está pensado para uso offline sobre WAV mono de 16 kHz.

Su relevancia práctica está en el binario de pesos: la conversión GGUF permite desplegar un modelo de ASR multilingüe de casi mil millones de parámetros en CPU o en GPUs de consumo, con cuantizaciones desde 735 MB (Q4_K_M) hasta 3,92 GB (F32), y una degradación de precisión prácticamente nula respecto al modelo en coma flotante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitarea AED: encoder FastConformer de 32 capas + decoder Transformer de 8 capas |
| Parámetros totales | 980.046.848 (≈978 M, dato real de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25 idiomas europeos: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | GGUF (conversión desde el modelo NeMo original) |
| Librería de inferencia | transcribe.cpp |
| Tarea (pipeline) | automatic-speech-recognition |
| Entrada admitida | WAV mono a 16 kHz |
| Streaming | No |
| Marcas de tiempo | No expuestas en este puerto (timestamps: none) |
| Detección de idioma | No (lang_detect: false) |
| Traducción de voz | Sí |
| Tamaño del repositorio | 9,5 GB |
| Modelo base | nvidia/canary-1b-v2 (commit 87bc526, fijado el 2026-05-08) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder multitarea (multitask AED). El encoder es un FastConformer de 32 capas que extrae características acústicas del audio, y el decoder es un Transformer de 8 capas que genera texto guiado por tokens de tarea, en concreto `<source language>` y `<target language>`. Esta combinación permite que un único modelo realice ASR en 25 idiomas y traducción de voz desde inglés a los otros 24 idiomas y desde esos 24 idiomas a inglés, sin cabeceras específicas por tarea.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO; estos datos figuran como no disponibles. La conversión se realizó desde el commit `87bc526` del repositorio upstream, fijado el 2026-05-08, y se validó numéricamente contra la implementación de referencia NeMo en el commit `db53eda` de transcribe.cpp el 2026-05-08. La decodificación es voraz (greedy) y sin modelo de lenguaje externo, y la model card del puerto advierte que no se exponen marcas de tiempo de palabra ni de segmento, a diferencia del modelo original.

## Capacidades

- Reconocimiento automático del habla en 25 idiomas europeos, incluyendo lenguas con menos recursos como maltés, estonio, letón, lituano y esloveno.
- Traducción de voz directa de inglés a los otros 24 idiomas soportados y de esos 24 idiomas a inglés.
- Procesamiento offline por lotes de audio en formato WAV mono a 16 kHz.
- Ejecución en CPU sin GPU gracias a las cuantizaciones GGUF de bajo peso.
- Aceleración por Metal (Apple Silicon) y Vulkan (GPU integradas y discretas de gama amplia).
- No soporta streaming: requiere el audio completo como entrada.
- No realiza detección automática de idioma; el idioma de origen debe especificarse mediante los tokens de tarea.
- No gestiona tool calling, function calling ni razonamiento multi-paso; es un modelo exclusivamente de voz a texto.
- No expone marcas de tiempo en esta versión del puerto.

## Casos de uso

- Transcripción de reuniones y generación de actas: al aceptar audio completo de 16 kHz mono y ejecutarse offline, se puede procesar la grabación entera de una reunión y obtener el texto sin depender de servicios en la nube; su WER de 3,10 en español y 4,46 en alemán lo hace adecuado para documentación interna.
- Traducción de voz para soporte internacional: con los tokens `<source language>` y `<target language>` se puede tomar una llamada en francés y generar la transcripción en inglés, o al contrario, cubriendo pares entre inglés y 24 idiomas sin desplegar dos modelos distintos.
- Indexación y búsqueda de archivos audiovisuales: transcribir un archivo de vídeo o audio y almacenar el texto para búsqueda posterior; el peso reducido de la cuantización Q4_K_M (735 MB) permite ejecutar el proceso en un servidor modesto sobre grandes volúmenes de contenido.
- Análisis de llamadas de atención al cliente: transcripción local de grabaciones para extraer métricas, palabras clave y motivos de contacto, manteniendo el audio dentro de la infraestructura propia y evitando enviarlo a terceros.
- Investigación lingüística y creación de corpus: la cobertura de 25 idiomas europeos, incluidos varios con pocos recursos, permite transcribir entrevistas y materiales de campo para estudios fonéticos o sociolingüísticos; conviene tener en cuenta que el WER supera el 19 % en maltés y el 26 % en griego.
- Subtitulado con segmentación previa: como el puerto no expone marcas de tiempo, se puede dividir el audio en fragmentos de duración fija o por detección de actividad de voz, transcribir cada fragmento y recomponer los subtítulos con la temporización calculada externamente.
- Despliegue en dispositivos sin GPU: la cuantización Q5_K_M (837 MB) y Q4_K_M (735 MB) permiten ejecutar el modelo íntegramente en CPU, por ejemplo en portátiles o equipos de campo, con un factor de tiempo real de 8,32 en un Ryzen 4750U.
- Cumplimiento normativo y transcripción sensible: al ejecutarse en local, es apto para entornos donde el audio no puede salir de la organización, como expedientes sanitarios o jurídicos, siempre que se revise manualmente la salida.

## Benchmarks y rendimiento

WER sobre la partición completa LibriSpeech test-clean (2.620 enunciados), tamaño de lote 1 y sin marcas de tiempo. Decodificación voraz sin modelo de lenguaje externo.

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 3,92 GB | 1,92 % |
| F16 | 1,97 GB | 1,92 % |
| Q8_0 | 1,14 GB | 1,91 % |
| Q6_K | 932 MB | 1,94 % |
| Q5_K_M | 837 MB | 1,93 % |
| Q4_K_M | 735 MB | 1,91 % |

NVIDIA reporta un 2,18 % en su propia model card para el modelo base sobre ese mismo conjunto. El puerto F32 obtiene 1,92 %, 0,26 puntos porcentuales por debajo, diferencia que el autor atribuye a variaciones en el método de puntuación.

WER por idioma sobre FLEURS con la cuantización Q8_0:

| Idioma | WER Q8_0 | Idioma | WER Q8_0 |
|---|---:|---|---:|
| bg (búlgaro) | 9,22 % | lt (lituano) | 13,45 % |
| hr (croata) | 8,40 % | lv (letón) | 10,41 % |
| cs (checo) | 8,56 % | mt (maltés) | 19,75 % |
| da (danés) | 11,34 % | nl (neerlandés) | 6,28 % |
| de (alemán) | 4,46 % | pl (polaco) | 6,88 % |
| el (griego) | 26,02 % | pt (portugués) | 4,50 % |
| en (inglés) | 4,47 % | ro (rumano) | 6,87 % |
| es (español) | 3,10 % | ru (ruso) | 7,83 % |
| et (estonio) | 12,72 % | sk (eslovaco) | 6,84 % |
| fi (finés) | 8,86 % | sl (esloveno) | 12,76 % |
| fr (francés) | 5,09 % | sv (sueco) | 9,74 % |
| hu (húngaro) | 13,06 % | uk (ucraniano) | 10,58 % |
| it (italiano) | 3,10 % | | |

Rendimiento medido como factor de tiempo real (RTF; valores más altos indican mayor velocidad):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 25,08 |
| Apple M4 Max | Metal | 98,25 |
| AMD Ryzen 4750U | CPU | 8,32 |
| AMD Ryzen 4750U | Vulkan | 14,13 |

## Requisitos de hardware

- VRAM y almacenamiento por cuantización: F32 3,92 GB, F16 1,97 GB, Q8_0 1,14 GB, Q6_K 932 MB, Q5_K_M 837 MB, Q4_K_M 735 MB. Al ser un modelo de menos de mil millones de parámetros, el consumo de memoria es bajo y el cuello de botella real suele ser el cómputo del encoder, no la memoria.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Dado el tamaño, cualquier GPU con al menos 2 GB de VRAM libre puede alojar la cuantización Q8_0 y superiores; las GPU de gama alta (A100, H100, RTX 4090) quedan muy sobredimensionadas para este modelo.
- GPU de consumo: sí cabe con holgura. Las cuantizaciones Q4_K_M, Q5_K_M y Q6_K ocupan menos de 1 GB, por lo que entran en cualquier GPU integrada o discreta de gama baja, e incluso en GPUs con 4 GB de VRAM.
- CPU: el modelo es plenamente funcional solo con CPU. Se han medido 25,08 de RTF en un Apple M4 Max y 8,32 en un AMD Ryzen 4750U, lo que permite transcripción en tiempo real muy por encima de la velocidad de reproducción.
- Aceleración: Metal en Apple Silicon multiplica por 3,9 el rendimiento respecto a CPU en el M4 Max (98,25 frente a 25,08); Vulkan en el Ryzen 4750U mejora un 70 % sobre CPU (14,13 frente a 8,32).
- Opciones de despliegue: transcribe.cpp, con la herramienta de línea de comandos `transcribe-cli`. No se indica compatibilidad con otras plataformas como vLLM, llama.cpp, Ollama o TGI; la librería declarada es transcribe.cpp.
- Latencia y throughput: el RTF de 98,25 en Metal implica procesar aproximadamente 98 segundos de audio por segundo de cómputo; en CPU de portátil el RTF de 8,32 implica unas 8 veces la velocidad de reproducción.
- Formato de entrada: requiere WAV mono a 16 kHz; la model card recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

La información disponible no incluye datos de benchmarks de otros modelos de ASR con los que comparar directamente, por lo que la comparación se limita a las variantes de esta misma familia y al modelo base sin cuantizar.

| Modelo | Parámetros | Formato | Cuantizaciones | WER LibriSpeech test-clean | Licencia |
|---|---|---|---|---|---|
| ldov/canary-1b-v2-gguf (este) | ≈978 M | GGUF para transcribe.cpp | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M | 1,92 % (F32), 1,91 % (Q4_K_M) | CC-BY-4.0 |
| handy-computer/canary-1b-v2-gguf | ≈978 M | GGUF para transcribe.cpp | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M | 1,92 % (F32), 1,91 % (Q4_K_M) | CC-BY-4.0 |
| nvidia/canary-1b-v2 | ≈978 M | Pesos NeMo originales | No aplica | 2,18 % (dato reportado por NVIDIA) | CC-BY-4.0 |

Comparativa con alternativas de otros proveedores (Whisper, Parakeet y similares): no disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de streaming: necesita el audio completo, lo que añade latencia en escenarios de dictado en vivo o subtitulado en tiempo real.
- El puerto no expone marcas de tiempo de palabra ni de segmento, aunque el modelo upstream sí las genere. Cualquier aplicación que requiera alineación temporal debe segmentar el audio por su cuenta.
- No realiza detección automática de idioma (`lang_detect: false`): hay que indicar explícitamente el idioma de origen, lo que complica el procesamiento de audio con idiomas mezclados.
- Diferencias de precisión muy acusadas entre idiomas: el WER en FLEURS con Q8_0 va del 3,10 % en español e italiano al 26,02 % en griego, pasando por 19,75 % en maltés, 13,45 % en lituano, 13,06 % en húngaro, 12,76 % en esloveno, 12,72 % en estonio y 11,34 % en danés. En esos idiomas la salida requiere revisión humana.
- Cobertura limitada a 25 idiomas europeos; no soporta otras lenguas ni variantes dialectales fuera de esa lista.
- Riesgo de alucinación en pasajes con ruido, música, silencios largos o solapamiento de hablantes, comportamiento habitual en modelos encoder-decoder entrenados con decodificación voraz sin modelo de lenguaje externo.
- Entrada restringida a WAV mono a 16 kHz; audio estéreo, otras frecuencias de muestreo u otros códecs requieren conversión previa.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución a NVIDIA como titular del modelo base y el cumplimiento de los términos de la model card upstream.
- El repositorio registra 0 descargas y 0 likes, con fecha de creación y última actualización idénticas (2026-09-24). No hay validación independiente de la comunidad sobre esta copia concreta, por lo que conviene verificar la integridad de los archivos antes de usarlos en producción.
- El WER medido en el puerto F32 (1,92 %) difiere del reportado por NVIDIA (2,18 %) por diferencias de puntuación; no debe tomarse ninguna de las dos cifras como una evaluación totalmente homogénea.
- La model card advierte de que las cifras sin commit asociado se publicaron antes de que se registrara la procedencia, lo que reduce su trazabilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ldov/canary-1b-v2-gguf
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Conversión de referencia: https://huggingface.co/handy-computer/canary-1b-v2-gguf
- Commit del modelo base utilizado (87bc526): https://huggingface.co/nvidia/canary-1b-v2/commit/87bc526
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-1b-v2.md
- Commit de validación en transcribe.cpp (db53eda): https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Ficha en Inferix (handy-computer): https://inferix.co/models/handy-computer/canary-1b-v2-gguf
- Ficha en Inferix (nvidia): https://inferix.co/models/nvidia/canary-1b-v2
- Ficha en Savrn: https://savrn.com/models/canary-1b-v2-gguf
- Referencias arXiv declaradas en los tags del repositorio: https://arxiv.org/abs/2509.14128, https://arxiv.org/abs/2505.13404, https://arxiv.org/abs/2305.05084, https://arxiv.org/abs/1706.03762, https://arxiv.org/abs/2410.01036, https://arxiv.org/abs/2406.00899, https://arxiv.org/abs/2205.12446, https://arxiv.org/abs/2012.03411, https://arxiv.org/abs/2007.10310, https://arxiv.org/abs/2005.08072, https://arxiv.org/abs/1510.08484
