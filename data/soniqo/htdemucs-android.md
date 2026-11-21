# soniqo/HTDemucs-Android

## Resumen

HTDemucs-Android es una distribución de los pesos originales de HTDemucs (Hybrid Transformer Demucs) empaquetados para su despliegue en dispositivos Android. El modelo realiza separación de fuentes musicales sobre audio estéreo a 44,1 kHz, estimando cuatro pistas independientes: batería, bajo, otros instrumentos y voz. Lo publica el desarrollador soniqo (responsable de la aplicación Soniqo Music) y deriva del export ONNX de referencia de smank/htdemucs-onnx, que a su vez proviene de la implementación original de Meta AI (facebookresearch/demucs).

El interés de esta ficha no reside en un modelo nuevo, sino en el empaquetado: ofrece dos artefactos con los mismos pesos, uno en ONNX FP32 para CPU y otro en LiteRT (antes TensorFlow Lite) FP32 optimizado para GPU OpenCL en Android. El modelo procesa ventanas de 7,8 segundos y, según las mediciones del autor en un Samsung Galaxy S23 Ultra, separa un clip de 60 segundos en 20,89 segundos con caché de kernels caliente (factor de tiempo real 0,348).

Es relevante para desarrolladores móviles que necesitan separación de fuentes en el propio dispositivo sin depender de la nube, con licencia MIT y unos 245-304 MB por artefacto. No es un modelo de lenguaje ni un transformer generativo de texto: es un modelo de audio-to-audio con arquitectura híbrida transformer/convolucional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HTDemucs (Hybrid Transformer Demucs): híbrido de transformer y capas convolucionales con STFT y dominio temporal |
| Parámetros totales | no disponible (el repo ocupa 0,5 GB; el artefacto ONNX FP32 pesa 304.321.552 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa ventanas de 7,8 segundos (343.980 muestras por canal) |
| Tipos de cuantización | FP32 en ambos artefactos; el autor indica que el TFLite deriva de una versión cuantizada del modelo base, pero los ficheros publicados son FP32 |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP32) y LiteRT/TFLite (FP32) |

## Arquitectura y entrenamiento

HTDemucs es la evolución híbrida de la familia Demucs: combina un encoder/decoder convolucional sobre espectrogramas STFT con un transformer que modela dependencias de largo alcance entre frames, y una rama en dominio temporal que se suma a la salida espectral. El modelo original se entrena para separar cuatro stems (drums, bass, other, vocals) a 44,1 kHz estéreo. Esta distribución no reentrena ni modifica los pesos: el fichero ONNX es, según el autor, idéntico al export ONNX fijado del modelo base; el TFLite cambia los layouts de tensores y el modo de ejecución del grafo.

La innovación del empaquetado está en el artefacto LiteRT para GPU: usa framing en el host, STFT inversa y overlap-add fuera del grafo, y expone dos salidas (una representación de espectrograma complejo `[1, 16, 2048, 336]` y una forma de onda `[1, 4, 2, 343980]`). El runtime debe convertir el espectrograma a audio con la ventana original, sumar la salida de forma de onda, revertir el escalado de entrada y aplicar overlap-add entre ventanas consecutivas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Separación de fuentes musicales en cuatro stems: batería, bajo, otros instrumentos y voz.
- Generación de pista instrumental sumando los tres primeros stems (drums + bass + other).
- Procesamiento de audio estéreo a 44,1 kHz con ventanas de 7,8 segundos.
- Inferencia en dispositivo: ONNX Runtime CPU o LiteRT con aceleración GPU OpenCL en Android.
- Salida en PCM16 verificada: las cinco salidas PCM16 coinciden con la referencia FP32 de LiteRT en 26,46 millones de muestras.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Aplicaciones móviles de karaoke o práctica musical: el usuario carga una canción y la app genera la pista instrumental eliminando la voz, con procesamiento local y sin subir el audio a un servidor. El tamaño de 245 MB en LiteRT y el factor de tiempo real 0,348 en un S23 Ultra lo hacen viable en un dispositivo de gama alta.
- Edición de audio en Android: separar stems para remezclar, silenciar o aislar instrumentos en un editor móvil, usando la ventana de 7,8 segundos y overlap-add para concatenar segmentos sin cortes audibles.
- Creación de contenido en redes: extracción de voces o instrumentales para vídeos cortos directamente en el teléfono, evitando costes de inferencia en la nube y problemas de privacidad.
- Herramientas de aprendizaje musical: aislar la pista de batería o bajo para practicar sobre ella, con la pista instrumental generada por suma de stems.
- Prototipado de pipelines de audio-to-audio en entornos sin GPU de servidor: el artefacto ONNX FP32 de 304 MB se ejecuta en CPU con ONNX Runtime y sirve como referencia de calidad frente a la versión móvil.
- Investigación en despliegue edge: banco de pruebas para comparar ONNX Runtime CPU frente a LiteRT OpenCL GPU en el mismo dispositivo, con métricas de latencia y PSS ya publicadas por el autor.
- Integración en apps de DJ o producción musical en Android: separación en tiempo casi real de clips cortos, con caché de kernels caliente para reducir la latencia de inicialización.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en un Samsung Galaxy S23 Ultra con LiteRT 2.3.2, clip de 60 segundos, modelo ya en el dispositivo, incluyendo verificación e inicialización, procesamiento y exportación WAV:

| Configuración | Tiempo | Factor de tiempo real |
|---|---:|---:|
| LiteRT OpenCL, caché de kernels caliente | 20,89 s | 0,348 |
| LiteRT OpenCL, caché de kernels vacía | 27,53 s | 0,459 |

Pico de PSS muestreado en ejecución caliente: 1,93 GiB. Las cinco salidas PCM16 coincidieron con la referencia FP32 de LiteRT en 26,46 millones de muestras. No se han publicado resultados de benchmarks de calidad de separación (SDR, SIR, SAR) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el autor reporta un pico de PSS de 1,93 GiB en ejecución caliente en un S23 Ultra; en CPU conviene reservar al menos 2-3 GB de RAM libre.
- GPU recomendadas: GPU móvil con soporte OpenCL a través de LiteRT (el S23 Ultra es el dispositivo de referencia). En servidor, cualquier GPU compatible con ONNX Runtime sirve para el artefacto ONNX, aunque no se publican cifras.
- ¿Cabe en GPU consumer? El modelo es de 245-304 MB en FP32, por lo que cabe holgadamente en cualquier GPU consumer (RTX 3060 en adelante); no se publican latencias en escritorio.
- Opciones de despliegue: LiteRT (ai_edge_litert) en Android con OpenCL; ONNX Runtime en CPU para escritorio y servidor; el artefacto TFLite también puede ejecutarse con intérpretes compatibles de TensorFlow Lite.
- Latencia y throughput: en el dispositivo de referencia, factor de tiempo real 0,348 con caché caliente (un clip de 60 s tarda unos 21 s). La primera ejecución con caché vacía es un 32 % más lenta.

## Comparativa con modelos similares

| Modelo | Arquitectura | Stems | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| HTDemucs-Android (esta ficha) | HTDemucs híbrido | 4 | ONNX, LiteRT | MIT | Despliegue móvil Android |
| smank/htdemucs-onnx (modelo base) | HTDemucs híbrido | 4 | ONNX | no disponible en la información | Export ONNX de referencia |
| Demucs original (facebookresearch/demucs) | Híbrido convolucional/transformer | 4 | PyTorch | MIT | Entrenamiento e inferencia en servidor |
| Spleeter (Deezer) | U-Net convolucional | 2 o 4 | TensorFlow | MIT | Separación ligera, menor calidad |

La comparación de calidad objetiva (SDR por stem) no está disponible en la información proporcionada para ninguno de los modelos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de categoría.
- Solo procesa ventanas de 7,8 segundos; el manejo de audio más largo requiere overlap-add por parte del runtime, y una implementación incorrecta produce artefactos audibles en las uniones.
- El artefacto LiteRT no es autónomo: la conversión del espectrograma a audio exige la ventana original y la STFT inversa en el host, además de revertir el escalado de entrada.
- Las mediciones de rendimiento provienen de un único dispositivo (Galaxy S23 Ultra); el rendimiento en gamas medias o en GPUs sin soporte OpenCL puede degradarse notablemente.
- Riesgo de alucinación en sentido figurado: el modelo puede introducir artefactos o separar deficientemente instrumentos con timbres poco representados en el entrenamiento original.
- Sesgos: no se documentan en la información disponible; al derivar de un dataset musical mayoritariamente occidental, la separación puede ser peor en géneros con instrumentación atípica.
- Licencia MIT permite uso comercial, pero conviene verificar la atribución exigida en el fichero LICENSE y las condiciones del modelo base smank/htdemucs-onnx.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soniqo/HTDemucs-Android
- Modelo base ONNX: https://huggingface.co/smank/htdemucs-onnx
- Export ONNX fijado: https://huggingface.co/smank/htdemucs-onnx/tree/fb1fd25aa6260c253d86bbb4aa26b73aebc79f10
- Paper HTDemucs: https://arxiv.org/abs/2211.08553
- Implementación original Demucs: https://github.com/facebookresearch/demucs
- Documentación LiteRT en Android: https://developers.google.com/edge/litert/android
- Aplicación Soniqo Music: https://soniqo.audio/music
