# moonbox-dev/DeepFilterNet3-ONNX

## Resumen

DeepFilterNet3-ONNX es una conversión a formato ONNX del modelo DeepFilterNet3, desarrollado originalmente por Rikorose y empaquetado por moonbox-dev para su uso en dispositivos con ONNX Runtime. Se trata de un modelo de mejora de voz (speech enhancement) en tiempo real que opera a 48 kHz, diseñado para eliminar ruido de fondo de grabaciones de voz. El modelo original se describe en el artículo arXiv:2305.08227 y se distribuye bajo licencia MIT.

A diferencia de los modelos de lenguaje, DeepFilterNet3 es una red neuronal especializada en procesamiento de audio que combina ganancias por bandas ERB con filtrado profundo de la banda baja. La conversión a ONNX permite desplegarlo en CPU, CUDA y DirectML sin necesidad de PyTorch, lo que facilita su integración en aplicaciones de escritorio, móviles o embebidas. El repositorio incluye dos precisiones: fp16 (para GPU) e int8 (para CPU), con un tamaño total de pesos de aproximadamente 2,2 MB en int8.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y de código abierto para tareas de supresión de ruido en producción, con métricas objetivas publicadas sobre el conjunto de test VoiceBank-DEMAND (PESQ 3,163, STOI 0,9452, SI-SDR 18,91 dB). No es un modelo generativo ni un LLM, por lo que sus capacidades se limitan estrictamente al audio-to-audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepFilterNet3 (encoder, decoder de ganancias ERB y decoder de filtro profundo; redes neuronales sobre features STFT/ERB) |
| Parametros totales | no disponible (pesos ONNX: 2,2 MB en int8; 4,4 MB en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa audio; eje temporal libre, un fichero completo en una llamada) |
| Tipos de cuantizacion | int8 (pesos por canal de salida, activaciones fp32) y fp16 (pesos y cálculo en fp16, E/S fp32) |
| Idiomas soportados | no disponible (independiente del idioma; procesa señal de voz) |
| Licencia | MIT |
| Formato de pesos | ONNX (tres grafos: `enc.onnx`, `erb_dec.onnx`, `df_dec.onnx` + `config.ini`) |

## Arquitectura y entrenamiento

DeepFilterNet3 es una arquitectura híbrida de procesamiento de señal y aprendizaje profundo. El pipeline incluye una STFT, extracción de features ERB y complejas, y tres redes neuronales: un encoder, un decoder de ganancias ERB y un decoder de filtro profundo (deep filter) que actúa sobre la banda baja de frecuencia. La salida del modelo se aplica mediante ganancias y filtrado complejo antes de la ISTFT. El modelo opera a 48 kHz y está diseñado para funcionar en tiempo real.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. El modelo original se describe en los artículos arXiv:2305.08227, arXiv:2305.08225, arXiv:2205.05474 y arXiv:2110.05588, que documentan la evolución de la familia DeepFilterNet. La conversión a ONNX no modifica los pesos, solo el formato de ejecución; los grafos fp32 originales están disponibles en el release oficial del repositorio de GitHub.

## Capacidades

- Mejora de voz (speech enhancement) en tiempo real a 48 kHz: elimina ruido de fondo y mejora la inteligibilidad.
- Supresión de ruido (noise suppression) y denoising de grabaciones de voz.
- Procesamiento audio-to-audio: entrada de audio ruidoso, salida de audio limpio.
- Funciona con el paquete oficial `deepfilternet` (Python) sustituyendo las tres redes por los grafos ONNX.
- Compatible con ONNX Runtime en CPU, CUDA y DirectML.
- Disponible también para uso sin Python mediante el crate Rust `libDF` con runtime `tract`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües en el sentido de LLM.
- No es un modelo generativo de texto ni de código; no tiene modo thinking ni visión.

## Casos de uso

- **Llamadas VoIP y videoconferencia**: el modelo puede integrarse en el pipeline de audio de una aplicación de comunicación para eliminar ruido de fondo (teclado, ventilador, tráfico) en tiempo real, gracias a su factor de tiempo real inferior a 1 en CPU con 4 hilos (int8) y a su ventana de procesado por fichero completo.
- **Grabación de podcasts y contenido audiovisual**: se puede usar como paso de preprocesado para limpiar pistas de voz grabadas en entornos no tratados acústicamente, con métricas objetivas de calidad (PESQ 3,163, STOI 0,9452) que indican una mejora sustancial frente a la entrada ruidosa (PESQ 1,97, STOI 0,921).
- **Transcripción automática (ASR)**: al mejorar la relación señal-ruido antes de pasar el audio a un sistema de reconocimiento de voz, se reduce la tasa de error en entornos ruidosos; el modelo es adecuado por su bajo coste computacional y su licencia MIT.
- **Aplicaciones móviles y embebidas**: la versión int8 (2,2 MB) cabe en dispositivos con recursos limitados y se ejecuta en el proveedor CPU de ONNX Runtime, lo que permite denoising en tiempo real sin GPU.
- **Atención al cliente grabada**: limpieza de grabaciones de llamadas para su análisis posterior (sentimiento, cumplimiento, QA) donde el ruido de fondo degrada la calidad del audio.
- **Dispositivos de audio inteligente (altavoces, auriculares)**: integración en firmware o software de dispositivo mediante el crate Rust `libDF` con runtime `tract`, sin dependencia de Python.
- **Preprocesado en pipelines de datos de voz**: normalización de datasets de audio para entrenamiento de otros modelos, usando la versión fp16 en GPU para procesar lotes grandes con mayor throughput.

## Benchmarks y rendimiento

Los datos publicados en la model card sobre el conjunto de test VoiceBank-DEMAND (824 utterances, 48 kHz, dos hablantes no vistos, post-filtro desactivado) son los siguientes:

| | PESQ | STOI | SI-SDR (dB) | vs original (dB) | Factor de tiempo real |
|---|---|---|---|---|---|
| Entrada ruidosa | 1,97 | 0,921 | 8,39 | - | - |
| Original (PyTorch fp32, CPU) | 3,163 | 0,9452 | 18,91 | - | 0,043 |
| ONNX fp32 oficial (CPU) | no disponible (truncado en la información) | no disponible | no disponible | no disponible | no disponible |
| ONNX fp16 (CUDA) | 3,163 | 0,9452 | 18,91 | 65,2 / 55,2 | no disponible |
| ONNX int8 (CPU) | 3,159 | 0,9448 | 18,89 | 44,4 / 32,2 | no disponible |

La columna "vs original" indica la SI-SDR de cada salida frente a la salida del modelo PyTorch (media / peor fichero). El factor de tiempo real se midió con 4 hilos de CPU en un portátil Intel (int8) o en una RTX 3080 Laptop GPU (fp16), pipeline completo. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo es extremadamente ligero; los pesos int8 ocupan 2,2 MB y los fp16 4,4 MB. La VRAM necesaria es mínima (del orden de decenas de MB incluyendo buffers de activaciones y features de audio).
- **GPU recomendadas**: cualquier GPU compatible con CUDA o DirectML; la model card cita una RTX 3080 Laptop GPU para la versión fp16. Para int8 se recomienda CPU.
- **¿Cabe en GPU consumer?**: sí, en cualquier GPU consumer moderna e incluso en iGPU con DirectML; también cabe en CPU sin GPU.
- **Opciones de despliegue**: ONNX Runtime (CPU, CUDA, DirectML), paquete Python `deepfilternet==0.5.6` con las redes sustituidas por los grafos ONNX, crate Rust `libDF` con runtime `tract`.
- **Latencia y throughput estimados**: el factor de tiempo real del modelo original PyTorch fp32 en CPU es 0,043 (es decir, procesa audio aproximadamente 23 veces más rápido que tiempo real). Para las versiones ONNX no se proporciona el factor de tiempo real en la información disponible, aunque se indica que int8 es "el que hay que usar para un denoiser en tiempo real en CPU".

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. Se puede mencionar que la familia DeepFilterNet incluye versiones anteriores (DeepFilterNet, DeepFilterNet2) descritas en los artículos arXiv:2110.05588 y arXiv:2205.05474, pero no se han proporcionado sus especificaciones ni métricas en esta ficha. No disponible para una comparativa cuantitativa con alternativas como RNNoise, Demucs o similares.

## Limitaciones y advertencias

- **Sesgos conocidos**: no disponibles en la información proporcionada; al ser un modelo de procesamiento de señal, los sesgos se relacionan con los tipos de ruido y las condiciones acústicas del dataset de entrenamiento (VoiceBank-DEMAND), no con sesgos sociales.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto; sin embargo, el modelo puede introducir artefactos o distorsión en la voz si el ruido de entrada es muy diferente al de entrenamiento.
- **Limitaciones de contexto o idioma**: no procesa texto ni tiene contexto lingüístico; su rendimiento puede degradarse con ruidos no representados en el dataset de entrenamiento o con voces muy alejadas de las condiciones de VoiceBank-DEMAND.
- **Restricciones de licencia**: licencia MIT, permite uso comercial sin restricciones significativas, siempre que se incluya el aviso de copyright correspondiente.
- **Caveats para producción**: la versión int8 requiere el proveedor CPU de ONNX Runtime (no hay kernels fp16 GRU en CPU); la versión fp16 requiere GPU. No hay soporte para int4 ni bf16. El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica que es una conversión reciente y poco validada por la comunidad. La fecha de creación (2026-11-14) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o una ficha generada con datos inconsistentes.

## Enlaces

- [Hugging Face: moonbox-dev/DeepFilterNet3-ONNX](https://huggingface.co/moonbox-dev/DeepFilterNet3-ONNX)
- [Repositorio GitHub de DeepFilterNet](https://github.com/Rikorose/DeepFilterNet)
- [Artículo arXiv:2305.08227](https://arxiv.org/abs/2305.08227)
- [Artículo arXiv:2305.08225](https://arxiv.org/abs/2305.08225)
- [Artículo arXiv:2205.05474](https://arxiv.org/abs/2205.05474)
- [Artículo arXiv:2110.05588](https://arxiv.org/abs/2110.05588)
