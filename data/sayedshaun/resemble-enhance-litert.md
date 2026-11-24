# SayedShaun/resemble-enhance-litert

## Resumen

Resemble Enhance LiteRT es una conversión experimental del modelo Resemble Enhance de Resemble AI al formato LiteRT/TFLite, orientada a la eliminación de ruido y la mejora de voz en dispositivos locales, incluidos teléfonos móviles. El modelo original es un pipeline de dos etapas (un modelo de difusión para la mejora y un vocoder UnivNet para la síntesis), y esta conversión lo reempaqueta en grafos TFLite ejecutables sin PyTorch, usando `ai-edge-litert` en Python y LiteRT en Android.

La relevancia de esta ficha es que demuestra un caso práctico de despliegue de un modelo de audio generativo en el borde (edge), con cuatro configuraciones de pesos (`fp32`, `fp16`, `int8` y `mobile`) que van desde 1,42 GB hasta 360 MB. La variante `mobile` está específicamente optimizada para XNNPACK y es la recomendada en teléfonos, con un consumo de memoria medido de unos 1,5 GB en pico durante la carga del vocoder y unos 0,65 GB en inferencia.

El autor del modelo base es Resemble AI; la conversión la firma SayedShaun. La licencia es MIT, el idioma soportado es inglés y el pipeline declarado es `audio-to-audio`. El repositorio ocupa 2,9 GB e incluye los pesos en varios formatos, scripts de inferencia en Python y Kotlin, y utilidades de conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: modelo de difusion (mejora) + vocoder UnivNet (sintesis), exportado a grafos TFLite/LiteRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; procesa ventanas solapadas de 1 segundo) |
| Tipos de cuantizacion | fp32 (1,42 GB), fp16 (712 MB, por defecto), int8 (360 MB, cuantizacion mixta con vocoder weight-only), mobile (570 MB, INT8 dinamico + vocoder fp16 para XNNPACK) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (copyright © 2023 Resemble AI) |
| Formato de pesos | TFLite / LiteRT (`.tflite`) |
| Frecuencia de salida | 44,1 kHz, mono, float32 |
| Entrada | Audio mono o `(frames, channels)` a 16 kHz (o 44,1 kHz en Android) |
| Libreria | litert (`ai-edge-litert` 2.1.2 en Python; LiteRT 2.3.0 en Android) |
| Tamano del repo | 2,9 GB |
| Modelo base | ResembleAI/resemble-enhance |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Resemble Enhance original: un modelo generativo de difusion que actua como etapa de mejora (denoising y restauracion) seguido de un vocoder UnivNet que convierte la representacion mejorada en forma de onda de audio a 44,1 kHz. Esta conversión no reentrena el modelo; reexporta los pesos PyTorch originales a grafos TFLite. El pipeline procesa ventanas solapadas de un segundo de audio.

La innovacion tecnica principal de esta conversion es la reexportacion del vocoder (`models/vocoder-mobile-fp16.tflite`) para que XNNPACK pueda ejecutarlo de forma eficiente. En la version original, las convoluciones transpuestas agrupadas del upsampling anti-aliasing se expresaban como 1.156 operaciones `TRANSPOSE_CONV` (una por canal), y el padding por replicacion y `unfold` se convertian en operaciones `GATHER`/`TILE`. La reexportacion sustituye estas construcciones por formas matematicamente equivalentes: zero-stuffing mas una convolucion depthwise, concatenacion en los bordes y una unica multiplicacion matricial por lotes para la convolucion de localizacion variable. Cada sustitucion se verifico contra el codigo PyTorch con una diferencia maxima inferior a 1e-6, manteniendo intactas las entradas, salidas y la firma `serving_default`.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni el uso de RLHF/DPO en la informacion proporcionada; esos detalles corresponden al modelo base original y no se detallan en esta conversion.

## Capacidades

- Eliminacion de ruido de voz (speech denoising) en audio mono.
- Mejora y restauracion de calidad de voz (speech enhancement) mediante modelo de difusion.
- Sintesis de audio a 44,1 kHz mono float32 mediante vocoder UnivNet.
- Inferencia totalmente local, sin dependencia de PyTorch ni de servicios en la nube.
- Ejecucion en Python (Linux x86-64, Python 3.12) mediante `ai-edge-litert`.
- Ejecucion en Android (Kotlin, compile SDK 35, min SDK 24) con LiteRT 2.3.0 y JTransforms 3.1.
- Procesamiento por ventanas solapadas de un segundo, lo que permite tratar grabaciones de duracion arbitraria.
- Carga selectiva de pesos por `dtype` desde el Hub con cache local.
- Soporte de entrada como fichero WAV o como array NumPy float (mono o multicanal).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es exclusivamente un modelo de audio.

## Casos de uso

- Limpieza de grabaciones de voz para podcasts y entrevistas: el pipeline elimina ruido de fondo y restaura la voz antes de la edicion final, gracias al modelo de difusion y al vocoder a 44,1 kHz.
- Preprocesado de audio para ASR: aplicar la mejora antes de enviar el audio a un sistema de reconocimiento de voz reduce el ruido y puede mejorar la precision en entornos ruidosos.
- Aplicaciones moviles de grabacion de voz: la variante `mobile` (570 MB) permite ejecutar la mejora en el propio telefono, con un pico de memoria medido de 1,5 GB durante la carga del vocoder y unos 0,65 GB en inferencia, sin enviar audio a la nube.
- Transcripcion de reuniones y notas de voz: procesar ventanas solapadas de un segundo permite tratar grabaciones largas de forma incremental en local.
- Restauracion de archivos de audio historicos o de baja calidad: el modelo de difusion puede recuperar inteligibilidad en grabaciones degradadas.
- Herramientas de accesibilidad: mejora de audio en tiempo casi real para usuarios con dificultades auditivas, ejecutandose en el dispositivo.
- Integracion en pipelines de edicion de video: limpieza de la pista de voz antes del montaje, usando la version Python sobre Linux x86-64.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible corresponden al vocoder, medidos con LiteRT 2.3 y XNNPACK sobre un segundo de audio en escritorio x86-64 con 4 hilos:

| Vocoder | Fichero | Memoria anonima pico | Tiempo | SNR vs PyTorch |
|---|---:|---:|---:|---:|
| `vocoder-int8-weights.tflite` | 176 MB | 4,55 GB | 7,1 s | 20,6 dB |
| `vocoder-mobile-fp16.tflite` | 384 MB | 1,32 GB | 2,5 s | 62,2 dB |

En Android, con el conjunto `mobile`, carga por etapas y cache de pesos XNNPACK, una grabacion de 11 segundos se proceso de extremo a extremo en un emulador x86-64 de 4 GB (pico de memoria anonima de 1,5 GB al cargar el vocoder, despues unos 0,65 GB). No se han publicado resultados de benchmarks de calidad (como PESQ, STOI o MOS) ni comparativas con otros modelos de mejora de voz en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun variante: `fp32` 1,42 GB, `fp16` 712 MB, `int8` 360 MB, `mobile` 570 MB (tamanos de pesos; el pico de memoria en ejecucion es mayor).
- Memoria pico medida en escritorio para el vocoder `mobile`: 1,32 GB; para el vocoder `int8` weight-only: 4,55 GB.
- Memoria pico medida en Android con `mobile`: 1,5 GB durante la carga del vocoder y unos 0,65 GB en inferencia.
- GPU recomendadas: no disponible; la inferencia usa CPU mediante XNNPACK, no se documenta aceleracion por GPU.
- Cabe en GPU de consumo: no aplica directamente; el modelo esta pensado para CPU y dispositivos moviles.
- Opciones de despliegue: `ai-edge-litert` 2.1.2 en Python (con NumPy, SciPy y soundfile) y LiteRT 2.3.0 en Android (Kotlin). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia medida: 2,5 s por segundo de audio con el vocoder `mobile` en escritorio x86-64 (4 hilos); 7,1 s por segundo de audio con el vocoder `int8` weight-only. No se documenta throughput del pipeline completo.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Resemble Enhance LiteRT (esta ficha) | Mejora de voz + vocoder, TFLite/LiteRT | 360 MB - 1,42 GB segun dtype | Ventanas de 1 s | MIT | Hugging Face, Python y Android |
| ResembleAI/resemble-enhance (base) | Mejora de voz + vocoder, PyTorch | no disponible | Ventanas | MIT | Hugging Face |
| Otros modelos de mejora de voz | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; la inferencia FP32 y FP16 en Android no se ha probado de extremo a extremo.
- Solo soporta ingles; no se garantiza un comportamiento adecuado en otros idiomas.
- La cuantizacion INT8 es mixta, no totalmente entera: partes del pipeline usan computo en punto flotante, lo que puede afectar a la reproducibilidad de resultados entre variantes.
- El vocoder `int8` weight-only muestra una SNR de solo 20,6 dB frente a PyTorch y un pico de memoria de 4,55 GB, muy superior al de la variante `mobile` (62,2 dB y 1,32 GB); para produccion conviene usar `mobile` o `fp16`.
- La salida es siempre mono a 44,1 kHz; el llamador debe encargarse de la decodificacion, el remuestreo, la reproduccion y la codificacion del audio en Android.
- Riesgo de artefactos o alucinaciones auditivas en audio muy degradado, inherente a los modelos generativos de difusion; no se documentan evaluaciones formales de este riesgo.
- No se documentan sesgos especificos, pero al estar entrenado principalmente con voz en ingles puede rendir peor con acentos no nativos o voces atipicas.
- La licencia MIT permite uso comercial, pero se mantiene el copyright de Resemble AI (© 2023); conviene conservar el aviso de licencia.
- Requiere descarga inicial de pesos desde el Hub y cache local; en Android la descarga y la inferencia deben ejecutarse en un hilo de trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SayedShaun/resemble-enhance-litert
- Modelo base: https://huggingface.co/ResembleAI/resemble-enhance
- Organizacion Resemble AI en Hugging Face: https://huggingface.co/ResembleAI
- Licencia MIT del repositorio: https://huggingface.co/SayedShaun/resemble-enhance-litert/blob/main/LICENSE
- Script de inferencia Python: https://huggingface.co/SayedShaun/resemble-enhance-litert/blob/main/inference.py
- Script de inferencia Android: https://huggingface.co/SayedShaun/resemble-enhance-litert/blob/main/inference.kt
- Script de exportacion del vocoder: https://huggingface.co/SayedShaun/resemble-enhance-litert/blob/main/conversion/export_vocoder.py
