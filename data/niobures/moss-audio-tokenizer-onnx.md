# niobures/MOSS-Audio-Tokenizer-ONNX

## Resumen

El repositorio `niobures/MOSS-Audio-Tokenizer-ONNX` proporciona las exportaciones en formato ONNX del MOSS-Audio-Tokenizer, un tokenizador de audio discreto desarrollado por OpenMOSS-Team para la familia de modelos MOSS-TTS. Este modelo comprime audio de 24 kHz en códigos discretos a una frecuencia de 12.5 Hz, utilizando una arquitectura Cat (Causal Audio Tokenizer with Transformer) de 1.6 mil millones de parámetros, entrenada desde cero sobre 3 millones de horas de audio diverso, incluyendo voz, efectos de sonido y música.

La existencia de esta versión ONNX responde a la necesidad de desplegar el componente de tokenización de audio sin depender de PyTorch, permitiendo una inferencia completamente libre de frameworks de aprendizaje profundo cuando se combina con el backend de llama.cpp para TTS. El modelo soporta tres backends: ONNX Runtime en GPU, ONNX Runtime en CPU y TensorRT (este último requiere construir los motores manualmente). Incluye dos ficheros principales: `encoder.onnx` para convertir forma de onda en códigos discretos y `decoder.onnx` para reconstruir la forma de onda a partir de los códigos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cat (Causal Audio Tokenizer with Transformer), transformer causal puro |
| Parametros totales | 1.6 mil millones (1.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio; no se especifica ventana de audio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; las metricas de referencia se obtienen en ingles (EN) y chino (ZH) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx) |

## Arquitectura y entrenamiento

MOSS-Audio-Tokenizer es un tokenizador de audio puramente causal basado en la arquitectura Cat, compuesto por un transformer de 1.6B parametros y un cuantizador vectorial residual (RVQ) de 32 capas. El modelo opera sobre audio de 24 kHz y genera una tasa de tramas de 12.5 Hz, lo que permite reconstruccion de alta fidelidad con bitrates que van de 0.125 kbps a 4 kbps. Se entreno desde cero en 3 millones de horas de audio que incluyen voz, efectos de sonido y musica, alcanzando resultados de reconstruccion de referencia entre los tokenizadores de audio open source. Este repositorio contiene exclusivamente las exportaciones ONNX del encoder y del decoder, generadas para permitir el despliegue sin PyTorch. No se proporcionan detalles sobre el proceso de entrenamiento (dataset exacto, curriculum, etc.) en la informacion disponible; la unica innovacion tecnica destacable en esta version es la ausencia total de dependencia de PyTorch en inferencia, gracias a la importacion de los pesos a ONNX y la compatibilidad con TensorRT.

## Capacidades

- Codificacion de audio: convierte una forma de onda de 24 kHz en secuencias de codigos discretos con una tasa de 12.5 Hz, mediante un cuantizador residual de 32 capas.
- Decodificacion de audio: reconstruye la forma de onda original a partir de los codigos discretos con alta fidelidad.
- Reconstruccion de audio en multiples bitrates: soporta desde 0.125 kbps hasta 4 kbps, permitiendo balancear calidad y compresion.
- Ejecucion sin PyTorch: funciona con ONNX Runtime (GPU o CPU) y TensorRT, lo que lo hace apto para entornos de produccion ligeros.
- Integracion con MOSS-TTS: se disena como componente de tokenizacion de audio en el backend de llama.cpp de MOSS-TTS, que utiliza pesos GGUF para el backbone de lenguaje.
- Escalabilidad de despliegue: al no requerir PyTorch, reduce la carga de memoria y simplifica el empaquetado del sistema en contenedores o servicios de inferencia.

## Casos de uso

- Sintesis de voz en produccion sin PyTorch: se integra en un pipeline TTS que usa llama.cpp con el backbone de lenguaje MOSS-TTS-GGUF, mientras que el tokenizador se ejecuta con ONNX Runtime. Es adecuado cuando se busca minimizar las dependencias del runtime.
- Despliegue en entornos con GPU limitada: el backend de ONNX Runtime CPU permite ejecutar el tokenizador en servidores sin CUDA, punto adecuado para instalaciones on-premise con hardware heterogeneo.
- Servicios de conversion voz a texto inversa con latencia controlada: el encoder genera tokens de audio que pueden alimentar modelos de lenguaje para tareas de describir o transcribir audio, en un flujo donde el resto del sistema ya es torch-free.
- Reconstruccion de audio a alta calidad en aplicaciones de restauracion de voz: el decoder puede reconstruir voz a multiples bitrates, util en herramientas de mejora de calidad de audio grabado.
- Motores de inferencia optimizados con TensorRT: los usuarios pueden compilar los ONNX en motores TensorRT para maximizar el throughput en servidores con GPUs NVIDIA, creando motores especificos para su arquitectura y version de TensorRT.
- Integracion en pipelines de relleno de audio: al operar sobre codigos discretos a baja tasa, puede integrarse en sistemas de generacion automatica de audio de relleno para asistentes virtuales o prompts de voz.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de metricas de reconstruccion frente a otros tokenizadores de audio open source. Las metricas de voz se evaluan en LibriSpeech test-clean (EN) y AISHELL-2 (ZH), y las de audio/musica en AudioSet y MUSDB respectivamente. Se muestran a continuacion las filas relevantes del modelo MOSS-Audio-Tokenizer y de algunos competidores directos.

| Modelo | bps | Frame rate | Nq | SIM ↑ (EN/ZH) | STOI ↑ (EN/ZH) | PESQ-NB ↑ (EN/ZH) | PESQ-WB ↑ (EN/ZH) | Mel-Loss ↓ | STFT-Dist. ↓ |
|---|---|---|---|---|---|---|---|---|---|
| MOSS Audio Tokenizer | 750 | 12.5 | 6 | 0.82 / 0.75 | 0.93 / 0.89 | 3.14 / 2.73 | 2.60 / 2.22 | 0.86 / 0.85 | 2.21 / 2.10 |
| MOSS Audio Tokenizer | 1000 | 12.5 | 8 | 0.88 / 0.81 | 0.94 / 0.91 | 3.38 / 2.96 | 2.87 / 2.43 | 0.82 / 0.80 | 2.16 / 2.04 |
| MiMo Audio Tokenizer | 850 | 25 | 4 | 0.80 / 0.74 | 0.91 / 0.87 | 2.94 / 2.62 | 2.39 / 2.14 | 0.82 / 0.81 | 2.33 / 2.23 |
| Higgs Audio Tokenizer | 1000 | 25 | 4 | 0.77 / 0.68 | 0.83 / 0.82 | 3.03 / 2.61 | 2.48 / 2.14 | 0.83 / 0.80 | 2.20 / 2.05 |
| Mimi | 1100 | 12.5 | 8 | 0.74 / 0.59 | 0.91 / 0.85 | 2.80 / 2.24 | 2.25 / 1.78 | 1.24 / 1.19 | 2.62 / 2.49 |

En la tabla, "Mayor es mejor" se aplica a las metricas de habla (SIM, STOI, PESQ), mientras que para Mel-Loss y STFT-Dist. "menor es mejor". Los resultados presentan el modelo MOSS con 8 cuantizadores (Nq=8) superando a los demas en todas las metricas de habla y logrando el mejor Mel-Loss y STFT-Dist. en audio/musica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio ocupa 14.2 GB, por lo que se requiere espacio de almacenamiento acorde y una GPU con VRAM suficiente para cargar encoder y decoder simultaneamente o por separado.
- GPU recomendadas: no se especifican en la documentacion. Dado el tamano del modelo (1.6B parametros) y el peso del repositorio (14.2 GB), se estima como minimo una GPU con 16 GB de VRAM, como una RTX 4080, RTX 4090 o NVIDIA A100.
- Si cabe en consumer GPU: probablemente si, aunque no esta confirmado. Es necesario comprobar el consumo de memoria real del encoder y decoder por separado.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT (motores construidos a partir de los ONNX), y como componente en el backend de llama.cpp de MOSS-TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | bps | Frame rate | Nq | Licencia | Formato de pesos |
|---|---|---|---|---|---|---|
| MOSS-Audio-Tokenizer (este repo) | 1.6B | 750 / 1000 | 12.5 | 6 / 8 | Apache-2.0 | ONNX |
| MiMo Audio Tokenizer | No disponible | 850 | 25 | 4 | No disponible | No disponible |
| Higgs Audio Tokenizer | No disponible | 1000 | 25 | 4 | No disponible | No disponible |
| Mimi | No disponible | 1100 | 12.5 | 8 | No disponible | No disponible |

La comparacion se basa en los datos publicados en la model card. La ventaja principal del MOSS-Audio-Tokenizer es el soporte de ejecucion sin PyTorch en esta version ONNX, asi como su rendimiento de reconstruccion, que lidera las metricas de habla en la configuracion de 8 cuantizadores. No se dispone de informacion sobre licencias ni formatos de pesos de los modelos competidores.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos en la informacion proporcionada, pero al tratarse de un modelo de audio entrenado en datos masivos, es probable que refleje sesgos presentes en las fuentes de entrenamiento (por ejemplo, acentos o dominios de audio subrepresentados).
- Riesgo de alucinacion: no aplica directamente, ya que es un tokenizador de audio y no un modelo generativo de texto. Sin embargo, el decoder puede producir artefactos o reconstrucciones imperfectas si los codigos de entrada no son validos o estan fuera de la distribucion de entrenamiento.
- Limitaciones de contexto: no se especifica una ventana de audio maxima, por lo que el desempeno en audios muy largos no esta documentado.
- Limitaciones de idioma: aunque no es un modelo de lenguaje, las metricas de referencia solo cubren ingles y chino. El rendimiento en otros idiomas puede variar sin estar evaluado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, distribucion y modificacion, pero no ofrece garantias. Es necesario revisar los avisos de licencia de los pesos originales.
- TensorRT: no se incluyen motores pre-construidos; cada usuario debe generar sus propios motores, lo que requiere tiempo de compilacion y compatibilidad con la version de TensorRT y la GPU utilizada.
- Tamano del repositorio: 14.2 GB, lo que implica un alto coste de almacenamiento y descarga, especialmente en despliegues con recursos limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/niobures/MOSS-Audio-Tokenizer-ONNX
- Peso original del tokenizador en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer
- Repositorio principal de MOSS-TTS: https://github.com/OpenMOSS/MOSS-TTS
- Repositorio del MOSS-Audio-Tokenizer: https://github.com/OpenMOSS/MOSS-Audio-Tokenizer
- Documentacion del backend llama.cpp: https://github.com/OpenMOSS/MOSS-TTS/blob/main/moss_tts_delay/llama_cpp/README.md
- Pesos GGUF del backbone MOSS-TTS: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-GGUF
