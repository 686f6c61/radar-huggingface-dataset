# moonbox-dev/voice-isolator-ONNX

## Resumen

Voice Isolator ONNX es la conversión a formato ONNX del modelo Inworld Voice Isolator v1, un sistema de aislamiento de voz y supresión de ruido desarrollado originalmente por Inworld AI. La conversión la ha realizado moonbox-dev con el objetivo de habilitar la inferencia en dispositivos mediante ONNX Runtime, con soporte para CPU, CUDA y DirectML. El modelo toma audio mono a 48 kHz y devuelve la señal de voz limpia, eliminando ruido, música y reverberación.

Arquitectónicamente se trata de una red dual-path con band-split, transformadores y Mamba bidireccional aplicada tanto a lo largo del tiempo como entre bandas de frecuencia. Cuenta con 64 millones de parámetros y trabaja en el dominio espectral: recibe la STFT de la señal y devuelve una corrección compleja que se suma al espectro original antes de aplicar la iSTFT. No es un modelo de streaming: procesa ventanas de 8 segundos con solapamiento de 2 segundos y crossfades lineales.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada (fp16 e int8) del modelo original con pérdidas de calidad prácticamente despreciables, y con un coste de memoria y latencia que permite su despliegue en GPUs de consumo y en CPU. Es especialmente útil para pipelines de preprocesado de audio en aplicaciones de voz, transcripción o comunicación en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red band-split dual-path con transformers y Mamba bidireccional (tiempo y bandas) |
| Parametros totales | 64 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 8 s (no streaming); T libre en frames a 100 fps |
| Tipos de cuantizacion | fp16 (pesos en fp16, aritmetica fp32) e int8 weight-only (por canal de salida, activaciones fp32) |
| Idiomas soportados | no disponible (procesamiento de audio independiente del idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (un grafo por precision) + pipeline.py en numpy/onnxruntime |
| Frecuencia de muestreo | 48 kHz mono, full-band |
| Entrada / salida | STFT `spec` [1, 1025, T, 2] -> `change` [1, 1025, T, 2] (correccion compleja) |
| STFT | n_fft 2048, hop 480, Hann periodica, centrada |
| Tamano del repo | 0.2 GB |

## Arquitectura y entrenamiento

El modelo original es una red neuronal profunda de 64 millones de parametros que opera sobre la representacion tiempo-frecuencia de la senal. La arquitectura combina un esquema band-split (division del espectro en bandas de frecuencia) con bloques dual-path que alternan procesamiento a lo largo del eje temporal y a lo largo del eje de bandas. Incorpora capas transformer y capas Mamba bidireccionales, lo que permite modelar dependencias de largo alcance en ambas dimensiones con un coste computacional contenido.

La red no reconstruye la senal desde cero, sino que estima una correccion compleja sobre el espectro de entrada: una mascara delta multiplicada por el espectro mas un residuo acotado. La salida final es la suma de la entrada y la iSTFT de esa correccion. El pipeline incluido gestiona la STFT, la iSTFT y el procesado por ventanas de 8 segundos con solapamiento de 2 segundos y crossfades lineales para audio mas largo.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o muestras, ni sobre si se emplearon tecnicas de RLHF o DPO, ya que la model card de la conversion no detalla el proceso de entrenamiento del modelo base. La innovacion tecnica destacable de esta version es la cuantizacion: la variante fp16 mantiene los pesos en fp16 pero realiza la aritmetica en fp32 (las activaciones fp16 desbordan en esta red), mientras que la variante int8 aplica cuantizacion weight-only por canal de salida en todas las multiplicaciones de matrices y convoluciones, manteniendo las activaciones en fp32.

## Capacidades

- Aislamiento de voz: extrae la voz humana de una mezcla que contiene ruido, musica y reverberacion.
- Supresion de ruido de fondo en audio mono a 48 kHz full-band.
- Eliminacion de musica y reverberacion de grabaciones de voz.
- Procesamiento por lotes de archivos de audio de duracion arbitraria mediante ventanas de 8 s con solapamiento.
- Inferencia en dispositivo con ONNX Runtime: CPU, CUDA y DirectML.
- Dos niveles de precision (fp16 e int8) con calidad practicamente identica al modelo original en PyTorch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente de audio).
- No es un modelo de streaming: no procesa audio en tiempo real continuo, sino por ventanas completas.
- No dispone de capacidades multilingues en sentido estricto: el procesamiento es independiente del idioma hablado.

## Casos de uso

- Preprocesado para transcripcion automatica (ASR): limpiar el audio antes de pasarlo a un modelo de reconocimiento de voz mejora la precision en entornos ruidosos; el modelo acepta cualquier duracion mediante ventanas y devuelve voz limpia a 48 kHz.
- Limpieza de grabaciones de podcast y entrevistas: elimina ruido de fondo, musica y reverberacion de grabaciones mono, con una calidad medida de PESQ 3.26 y STOI 0.955 sobre VoiceBank-DEMAND.
- Pipelines de voz sobre IP y videollamadas: integrado en un servidor de medios, puede procesar segmentos de 8 s con un factor de tiempo real de 0.26-0.29 en una RTX 3080 Laptop, adecuado para procesamiento casi en tiempo real por bloques.
- Aislamiento de voz para datasets de entrenamiento: limpiar corpus de audio ruidosos antes de usarlos para entrenar modelos de sintesis de voz o reconocimiento, con la ventaja de que la version int8 ocupa solo 67 MB y cabe en memoria de dispositivos modestos.
- Despliegue en dispositivos de borde con DirectML: al exportarse a ONNX, puede ejecutarse en Windows con aceleracion DirectML o en CPU, lo que permite integrarlo en aplicaciones de escritorio sin GPU dedicada.
- Analisis forense y de contenido: separar la voz de una grabacion con musica o ruido ambiente para su posterior analisis o transcripcion, manteniendo la senal a 48 kHz full-band.
- Herramientas de accesibilidad: mejorar la inteligibilidad de audios para personas con dificultades auditivas, ya que el modelo preserva la voz y elimina ruido con STOI 0.955.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test VoiceBank-DEMAND (824 utterances de dos hablantes no vistos, 48 kHz). PESQ wide-band (ITU-T P.862.2 a 16 kHz), STOI a 48 kHz, SI-SDR frente a la voz limpia. "vs original" es el SI-SDR de cada salida frente a la salida del modelo PyTorch en fp32 (media / peor archivo). Factor de tiempo real (RTF) medido en una RTX 3080 Laptop GPU.

| Modelo | PESQ | STOI | SI-SDR (dB) | vs original (dB) | RTF |
|---|---|---|---|---|---|
| original (PyTorch fp32, CUDA) | 3.259 | 0.9553 | 19.91 | - | 0.22 |
| original, bf16 autocast (por defecto en CUDA) | 3.276 | 0.9552 | 19.90 | 59.2 / 45.0 | 0.19 |
| fp16/ (CUDA) | 3.261 | 0.9553 | 19.91 | 81.8 / 69.3 | 0.26 |
| int8/ (CUDA) | 3.272 | 0.9554 | 19.90 | 52.8 / 43.1 | 0.29 |

La build de 4 bits (MatMulNBits, 44 MB) obtuvo PESQ 3.292 y SI-SDR 19.82 dB, pero 8 archivos quedaron mas de 0.5 dB por debajo del original (peor caso 1.44 dB; 35.4 dB de distancia media), por lo que no se publico.

## Requisitos de hardware

- VRAM estimada: una ventana de 8 s consume aproximadamente 5.4 GB de memoria GPU con el proveedor CUDA de ONNX Runtime (5.2 GB para int8; 2.4 GB para ventanas de 4 s). En CPU requiere una cantidad de RAM similar.
- La mayor parte del consumo se debe a la atencion sobre 800 frames.
- GPU recomendadas: cualquier GPU con al menos 6-7 GB de VRAM para fp16 (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3080, A10, A100, H100). Para int8 se recomienda reservar 9 GB si se procesan muchos archivos de distinta duracion.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superiores; en GPUs con 8 GB puede requerir limitar el tamano de ventana o gestionar la fragmentacion del arena de CUDA.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider, DirectMLExecutionProvider); el pipeline incluido usa numpy y onnxruntime, con soundfile para leer archivos.
- Fragmentacion de memoria: en CUDA, procesar muchos archivos de distinta duracion fragmenta el arena; el benchmark se ejecuto con `gpu_mem_limit` de 7 GB para fp16 y 9 GB para int8, con `arena_extend_strategy` `kSameAsRequested`.
- Latencia y throughput: RTF de 0.26 (fp16) y 0.29 (int8) en RTX 3080 Laptop, es decir, procesar 1 segundo de audio requiere 0.26-0.29 segundos de computo.
- En CPU el rendimiento no se ha publicado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | PESQ (VoiceBank-DEMAND) | Licencia | Formato |
|---|---|---|---|---|---|
| Voice Isolator ONNX (int8) | 64 M | 8 s por ventana | 3.272 | apache-2.0 | ONNX |
| Voice Isolator ONNX (fp16) | 64 M | 8 s por ventana | 3.261 | apache-2.0 | ONNX |
| Inworld Voice Isolator (original, PyTorch fp32) | 64 M | 8 s por ventana | 3.259 | apache-2.0 | safetensors (PyTorch) |
| Inworld Voice Isolator (bf16 autocast) | 64 M | 8 s por ventana | 3.276 | apache-2.0 | safetensors (PyTorch) |

No se dispone en la informacion proporcionada de datos de otros modelos de aislamiento de voz comparables (por ejemplo, Demucs, FRCRN o MossFormer2) para esta tabla; no se inventan cifras.

## Limitaciones y advertencias

- No es un modelo de streaming: procesa ventanas completas de 8 segundos, lo que introduce una latencia minima de 8 s en aplicaciones en tiempo real. La version realtime de Inworld (`denoiser_realtime.safetensors`) no esta convertida en este repositorio.
- El audio de entrada debe ser mono a 48 kHz; otras frecuencias de muestreo deben remuestrearse antes.
- El consumo de memoria es elevado para el tamano del modelo: 5.4 GB de VRAM por ventana de 8 s, debido a la atencion sobre 800 frames.
- La fragmentacion del arena de CUDA al procesar muchos archivos de distinta duracion puede provocar fallos de memoria; se recomienda fijar `gpu_mem_limit` y `arena_extend_strategy`.
- La cuantizacion int8 introduce una pequena deriva frente al original (52.8 dB de SI-SDR medio, peor archivo 43.1 dB); la build de 4 bits no se publico por superar el umbral de 0.5 dB en 8 archivos.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento con idiomas distintos del ingles en la model card de la conversion.
- Riesgo de alucinacion no aplicable en el sentido de generacion de texto, pero si puede introducir artefactos o distorsion en la voz en casos de ruido extremo o senales no verbales.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original (inworld/voice-isolator) y de los datos de entrenamiento antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/voice-isolator-ONNX
- Modelo base original: https://huggingface.co/inworld/voice-isolator
- Archivo fp16: https://huggingface.co/moonbox-dev/voice-isolator-ONNX/blob/main/fp16/model.onnx
- Archivo int8: https://huggingface.co/moonbox-dev/voice-isolator-ONNX/blob/main/int8/model.onnx
- Pipeline fp16: https://huggingface.co/moonbox-dev/voice-isolator-ONNX/blob/main/fp16/pipeline.py
- Pipeline int8: https://huggingface.co/moonbox-dev/voice-isolator-ONNX/blob/main/int8/pipeline.py
- Dataset VoiceBank-DEMAND (referencia en la model card): Valentini et al., no se proporciona URL directa en la informacion disponible.
- Paper de la metrica PESQ: ITU-T P.862.2, no se proporciona URL directa en la informacion disponible.
