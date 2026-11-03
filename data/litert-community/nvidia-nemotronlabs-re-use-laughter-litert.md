# litert-community/NVIDIA-NemotronLabs-RE-USE-laughter-LiteRT

## Resumen

NVIDIA NemotronLabs RE-USE-laughter para LiteRT es una conversión al formato LiteRT (`.tflite`) del modelo original `nvidia/NVIDIA-NemotronLabs-RE-USE-laughter`, realizada por la comunidad `litert-community` con la herramienta `litert-torch 0.9.4`. Se trata de una red de mejora y restauración universal de voz (universal speech enhancement) de 9,6 millones de parámetros que repara audio dañado por ruido aditivo, reverberación, clipping, limitación de banda, artefactos de códec, pérdida de paquetes y micrófonos de baja calidad. Su particularidad frente a otros modelos de la familia RE-USE es que está entrenada para preservar mejor la risa del hablante mientras restaura la calidad del audio.

El modelo emplea una arquitectura basada en Mamba bidireccional sobre el tiempo y sobre la frecuencia, con un codificador y decodificadores de magnitud y fase que operan en el dominio STFT. Esta conversión concreta funciona exclusivamente a 16 kHz mono y procesa fragmentos fijos de 2 segundos, con el STFT y el STFT inverso ejecutados en el host. Está pensada para inferencia on-device en Android (GPU) y en escritorio (Metal en Mac, XNNPACK en CPU), no para servidores de alto rendimiento.

Es relevante ahora porque demuestra que modelos de restauración de voz basados en arquitecturas de espacio de estados (Mamba) pueden ejecutarse en dispositivos móviles de consumo mediante LiteRT, aunque con latencias que aún superan el tiempo real en el hardware probado. Su caso de uso natural son grabaciones, no llamadas en vivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador + 30 bloques de Mamba bidireccional (tiempo y frecuencia) + decodificadores de magnitud y fase; dominio STFT |
| Parametros totales | 9,6 M (según la model card del original) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; procesa fragmentos fijos de 2 s (chunks de 1,75 s con solape de 0,25 s) |
| Tipos de cuantizacion | float32 (pesos fp32 en los dos ficheros `.tflite`) |
| Idiomas soportados | No disponible (modelo de audio, independiente del idioma) |
| Licencia | OpenMDW-1.1 (con componente adicional bajo Apache 2.0 de `mamba_ssm`) |
| Formato de pesos | TFLite (LiteRT); ficheros `reuse_laughter_16k_2s_fp32.tflite` (54.155.412 bytes) y `reuse_laughter_16k_2s_fastload_fp32.tflite` (44.289.500 bytes) |
| Frecuencia de muestreo | 16 kHz mono (fija en esta conversión; el original admite 8, 16, 22.05, 24, 32, 44.1 y 48 kHz) |
| STFT | n_fft 640, hop 80 (5 ms), ventana Hann periódica de 640, padding reflect; 321 bins por frame, 401 frames por chunk de 2 s |
| Entrada del grafo | `args_0` [1, 2, 401, 321] (log1p(|X|) y angle(X)) |
| Salida del grafo | `output_0` [1, 3, 401, 321] (magnitud comprimida m, fase como x_r y x_i) |
| Operaciones | 91.014 ops (fichero principal), 33.114 ops (fastload) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

La red sigue el diseño del modelo RE-USE original de NVIDIA NemotronLabs: un codificador que transforma la representación STFT en un espacio latente, seguido de 30 bloques de Mamba bidireccional que modelan dependencias tanto a lo largo del tiempo como a lo largo de la frecuencia, y dos decodificadores separados para magnitud y fase. La salida del grafo no es directamente la señal restaurada, sino una magnitud comprimida `m` y la fase expresada como par `(x_r, x_i)`, que el host convierte en `|Y| = expm1(relu(m))` y fase normalizada `(x_r, x_i) / hypot(x_r, x_i)` antes del STFT inverso.

Los dos ficheros `.tflite` comparten exactamente las mismas operaciones, tensores y longitud en bytes; solo cambian los bytes de los pesos. La diferencia funcional está en el orden del escaneo temporal dentro de los bloques Mamba: el fichero principal procesa un frame cada vez, mientras que el fichero `fastload` procesa bloques de 8 frames, lo que reduce el número de operaciones (33.114 frente a 91.014) y acelera la carga a costa de un mayor tiempo por chunk en GPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La model card del original menciona que fue entrenado con clips de menos de 10 segundos y que está diseñado para preservar al hablante principal suprimiendo a otros hablantes en caso de solapamiento. La conversión a LiteRT se realizó con `litert-torch 0.9.4` y reimplementa las operaciones para GPU manteniendo el mismo cómputo en float32; el fichero `NOTICE` del repositorio detalla los cambios introducidos.

## Capacidades

- Restauración universal de voz: elimina ruido aditivo, reverberación, clipping, limitación de banda, artefactos de códec, pérdida de paquetes y degradación por micrófonos de baja calidad con una sola red.
- Preservación de risa: a diferencia de otros modelos de la familia RE-USE, está ajustada para conservar la risa del hablante durante la restauración.
- Supresión de hablantes secundarios: según la model card del original, preserva al hablante principal y suprime a otros hablantes en audio solapado.
- Procesamiento por chunks: restaura fragmentos de 2 s con solape de 0,25 s y reconstrucción ponderada por ventana Hann, lo que permite procesar grabaciones largas.
- Inferencia on-device: soporta aceleración GPU en Android (LiteRT GPU accelerator) y en Mac (Metal), además de CPU con XNNPACK.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües en el sentido de texto; es un modelo puramente audio-a-audio.
- No incluye modo thinking, visión ni audio de entrada distinto de voz a 16 kHz mono.

## Casos de uso

- Restauración de grabaciones de entrevistas o podcasts: se puede procesar un WAV de 16 kHz mono por chunks de 2 s con solape para limpiar ruido de fondo, reverberación de sala y artefactos de compresión antes de la edición final.
- Limpieza de audio de reuniones grabadas con micrófonos de portátil: el modelo corrige la limitación de banda y el ruido de micrófono de baja calidad, adecuado para transcripción posterior con ASR.
- Recuperación de material de archivo con risa o audio humano no verbal: al preservar la risa mejor que otros modelos de la familia, es útil en archivos de comedia, entrevistas o grabaciones informales donde la risa es parte del contenido.
- Preprocesado en pipelines de ASR: la restauración previa reduce la tasa de error de reconocedores automáticos en audio degradado, aunque el coste computacional por chunk debe tenerse en cuenta.
- Procesamiento offline en Android: integrable en aplicaciones móviles que restauran notas de voz grabadas, dado que el modelo corre en GPU del dispositivo y no requiere enviar audio a un servidor.
- Restauración de audio con pérdida de paquetes en VoIP grabado: el modelo está entrenado para reparar artefactos de pérdida de paquetes, útil para auditar o transcribir llamadas almacenadas.
- Prototipado en escritorio con Mac: usando el acelerador Metal, se puede validar la calidad de restauración en local antes de portar la app a Android, con un coste de 0,444 s por segundo de audio en un M4 Max.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como PESQ, STOI o DNSMOS) en la información disponible. Los únicos datos de rendimiento proporcionados son medidas de latencia y carga:

| Plataforma | Fichero | Tiempo por chunk de 2 s | Tiempo por segundo de audio | Tiempo de carga |
|---|---|---|---|---|
| Galaxy S26 (GPU) | principal | 4.172,4–4.391,5 ms | 2,384–2,509 s | 95,5–99,2 s |
| Galaxy S26 (GPU) | fastload | no disponible por chunk | no disponible | 15,4 s |
| Apple M4 Max (GPU, Metal) | principal | 775,0 ms (+1,92 ms en host) | 0,444 s | no disponible |

En el Galaxy S26 el modelo es más lento que el tiempo real (2,384–2,509 s por segundo de audio), por lo que la model card recomienda usarlo sobre grabaciones y no en llamadas en vivo. En el M4 Max la inferencia es más rápida que el tiempo real (0,444 s por segundo de audio). Contabilizando la carga, el fichero `fastload` es más rápido en el Galaxy S26 para grabaciones de hasta unos 75 s.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero principal ocupa 54,2 MB y el fastload 44,3 MB en disco, con pesos float32 y un grafo de 91.014 ops (principal) o 33.114 ops (fastload).
- GPU recomendadas: GPU integrada de Android compatible con LiteRT GPU accelerator (probado en Galaxy S26); GPU Apple con Metal (probado en M4 Max); en CPU, XNNPACK con 4 hilos.
- Cabe en GPU de consumo: sí, por tamaño (decenas de MB), aunque la latencia en móvil supera el tiempo real en el hardware probado.
- Opciones de despliegue: LiteRT con `ai-edge-litert` (versión fijada 2.3.0 para el ejemplo; las medidas en Mac se tomaron con 2.2.0), API `CompiledModel`, aceleradores CPU (XNNPACK) y GPU (Metal en Mac, GPU en Android).
- Latencia y throughput: 2,384–2,509 s por segundo de audio en Galaxy S26 GPU; 0,444 s por segundo de audio en M4 Max GPU. Carga del fichero principal de 95,5–99,2 s en Galaxy S26 y 15,4 s para el fastload.
- No se mencionan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NVIDIA NemotronLabs RE-USE-laughter (LiteRT, este) | 9,6 M | chunks de 2 s a 16 kHz | TFLite | OpenMDW-1.1 | Preserva risa; on-device; más lento que tiempo real en Galaxy S26 |
| NVIDIA NemotronLabs RE-USE (LiteRT) | no disponible | chunks de 2 s a 16 kHz | TFLite | no disponible en la información | Misma red y mismos grafos, otros pesos; sin ajuste específico para risa |
| NVIDIA NemotronLabs RE-USE-laughter (original) | 9,6 M | clips de entrenamiento <10 s; admite 8–48 kHz | no disponible | no disponible en la información | Modelo de referencia; `inference_chunk.py` con chunks de 5 s cada 2,5 s |

No se dispone de datos de benchmarks comparativos con otros modelos de restauración de voz en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona a 16 kHz mono en esta conversión; hay que remuestrear cualquier otra frecuencia en el host antes de la inferencia.
- En el Galaxy S26 la inferencia es más lenta que el tiempo real (2,384–2,509 s por segundo de audio), por lo que no es apta para llamadas en vivo en ese dispositivo.
- El tiempo de carga del fichero principal en el Galaxy S26 es de 95,5–99,2 s, lo que penaliza usos puntuales; el fastload lo reduce a 15,4 s pero es más lento por chunk en GPU.
- El modelo está entrenado con clips de menos de 10 s; para grabaciones largas hay que usar inferencia por chunks, con el riesgo de artefactos en las uniones si el solape no es suficiente.
- En audio con hablantes solapados, suprime a los hablantes secundarios; esto puede ser indeseable si se quiere transcribir una conversación con varias voces.
- Riesgo de alucinación o artefactos en audio muy degradado: no se han publicado métricas de calidad objetivas (PESQ, STOI, DNSMOS) en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia OpenMDW-1.1 con componente adicional Apache 2.0 de `mamba_ssm`; hay que revisar los términos de OpenMDW-1.1 antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria de esta conversión concreta.
- No se dispone de información sobre el dataset de entrenamiento ni sobre posibles sesgos de idioma o acento.

## Enlaces

- HuggingFace (esta conversión): https://huggingface.co/litert-community/NVIDIA-NemotronLabs-RE-USE-laughter-LiteRT
- Modelo base original: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE-laughter
- Familia RE-USE de NVIDIA NemotronLabs: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Conversión LiteRT de RE-USE (misma red, otros pesos): https://huggingface.co/litert-community/NVIDIA-NemotronLabs-RE-USE-LiteRT
- Paper de referencia citado en los tags (arXiv:2603.02641): https://arxiv.org/abs/2603.02641
- Paper de referencia citado en los tags (arXiv:2606.25621): https://arxiv.org/abs/2606.25621
