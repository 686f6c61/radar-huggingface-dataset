# moonbox-dev/DeepFilterNet3-TensorRT

## Resumen

DeepFilterNet3-TensorRT es una distribución de los motores TensorRT del modelo DeepFilterNet3, un sistema de mejora de voz (speech enhancement) en tiempo real a 48 kHz desarrollado originalmente por Hendrik Schröter (Rikorose) y empaquetado aquí por moonbox-dev para GPUs NVIDIA RTX. El modelo combina ganancias por bandas ERB con deep filtering de la banda baja de frecuencia, y resuelve el problema de supresión de ruido y mejora de inteligibilidad en audio de voz capturado en condiciones adversas. Es relevante porque ofrece una implementación acelerada por hardware con compatibilidad binaria amplia (Ampere en adelante, TensorRT 10.13+) sin necesidad de recompilación, manteniendo métricas de calidad idénticas al original en PyTorch.

El repositorio no contiene pesos en el sentido tradicional de un LLM, sino tres motores TensorRT serializados (`enc.engine`, `erb_dec.engine`, `df_dec.engine`) que corresponden a las tres redes neuronales del pipeline DeepFilterNet3. Cada precisión se distribuye en una carpeta que incluye el motor, un runner mínimo en NumPy (`trt_runner.py`, sin dependencia de PyTorch) y un script que ejecuta el resto del pipeline (STFT, features ERB y complejas, ISTFT).

La relevancia actual reside en su perfil de latencia: un factor de tiempo real (RTF) de 0.036 en una RTX 3080 Laptop, con calidad PESQ 3.163, STOI 0.9452 y SI-SDR 18.91 dB sobre VoiceBank-DEMAND, idénticas al modelo original en fp32 sobre CPU. El tamaño total del repositorio es de 0.2 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de mejora de voz DeepFilterNet3: encoder, decodificador de ganancias ERB y decodificador de deep filter; serializada como motores TensorRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 1 a 3.000 tramas (30 s a hop de 10 ms) por llamada |
| Tipos de cuantizacion | fp16 (motores TensorRT); no hay int8 (TensorRT requiere activaciones calibradas y el build ONNX int8 es weight-only) |
| Idiomas soportados | no disponible (procesamiento de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | Motores TensorRT (`.engine`) construidos desde grafos ONNX fp16 |
| Frecuencia de muestreo | 48 kHz, mono |
| Compatibilidad de hardware | Ampere y posteriores (RTX 30, 40 y 50 series) |
| Compatibilidad de version | TensorRT 10.x desde 10.13, mediante lean runtime |
| Tamano del repositorio | 0.2 GB |
| Pipeline HF | audio-to-audio |

## Arquitectura y entrenamiento

DeepFilterNet3 es una arquitectura de mejora de voz que opera en el dominio de la frecuencia. Consta de tres redes: un encoder que procesa features ERB y espectrales complejas, un decodificador que produce ganancias por bandas ERB, y un decodificador de deep filter que genera coeficientes para filtrar la banda baja de frecuencia. El procesamiento de STFT, extracción de features ERB y complejas, aplicación de ganancias y deep filter, e ISTFT se realizan fuera de las redes neuronales, en el paquete oficial `deepfilternet` (versión 0.5.6 en la benchmark).

Los motores aquí publicados se construyeron a partir del repositorio oficial DeepFilterNet3 en la revisión `7b14b895fe`, usando los grafos ONNX fp16 publicados por Moonbox y el builder de TensorRT. Los motores son *hardware compatible* (Ampere y posteriores) y *version compatible* (TensorRT 10.13+), lo que implica una ligera pérdida de velocidad frente a un motor compilado para una GPU concreta, pero evita recompilaciones. El decodificador ERB es de tipado fuerte (cada tensor conserva la precisión del grafo ONNX), mientras que el encoder y el decodificador de deep filter son de tipado débil (TensorRT elige la precisión por capa), porque en TensorRT 10.13 no existe kernel fp16 para sus convoluciones agrupadas con padding.

No se dispone de información sobre el número de tokens, composición del dataset de entrenamiento ni uso de RLHF/DPO en la información proporcionada. El modelo original se documenta en los papers referenciados (arXiv:2305.08227, arXiv:2305.08225, arXiv:2205.05474, arXiv:2110.05588).

## Capacidades

- Mejora de voz en tiempo real a 48 kHz: supresión de ruido y mejora de inteligibilidad mediante ganancias ERB y deep filtering de la banda baja.
- Procesamiento de audio completo en una sola llamada: acepta de 1 a 3.000 tramas (hasta 30 s a hop de 10 ms).
- Inferencia sin PyTorch: el runner `trt_runner.py` usa únicamente TensorRT, Polygraphy y NumPy.
- Integración con el pipeline oficial: los tres motores sustituyen a las tres redes del paquete `deepfilternet` conservando el resto del procesamiento (STFT, features, ISTFT).
- Compatibilidad binaria amplia: motores válidos en RTX 30, 40 y 50 series con TensorRT 10.13 o superior.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada distinto de voz mono a 48 kHz.

## Casos de uso

- Videoconferencia y llamadas en tiempo real: el modelo puede limpiar la señal de micrófono en un pipeline de captura a 48 kHz; su RTF de 0.036 en una RTX 3080 Laptop deja margen suficiente para operar en tiempo real con latencia despreciable.
- Transcripción ASR en entornos ruidosos: como preprocesado antes de un sistema de reconocimiento de voz, la mejora de SI-SDR (18.91 dB) y STOI (0.9452) reduce errores de transcripción en audio con ruido de fondo.
- Producción de podcast y grabación de campo: limpieza por lotes de grabaciones de 48 kHz, procesando archivos completos de hasta 30 s por llamada dentro del motor, con el pipeline oficial gestionando la segmentación.
- Telefonía y VoIP sobre infraestructura NVIDIA: despliegue en servidores con GPUs Ampere o posteriores, usando los motores compatibles sin recompilación por modelo de GPU.
- Preprocesado en pipelines de diarización y análisis de audio: mejora de la señal antes de la extracción de embeddings de hablante o de la clasificación de eventos acústicos.
- Investigación en mejora de voz: sustitución de las redes PyTorch por los motores TensorRT para medir el impacto de la aceleración por hardware manteniendo el resto del pipeline idéntico, como demuestra la benchmark del autor.

## Benchmarks y rendimiento

Datos sobre VoiceBank-DEMAND (824 utterances de dos hablantes no vistos, 48 kHz), pipeline oficial `deepfilternet` 0.5.6, en una RTX 3080 Laptop GPU:

| Implementacion | PESQ | STOI | SI-SDR (dB) | vs original: media / peor archivo (dB) | Cambio SI-SDR peor archivo | RTF |
|---|---|---|---|---|---|---|
| Original (PyTorch fp32, CPU) | 3.163 | 0.9452 | 18.91 | - | - | 0.034 |
| ONNX fp16 (CUDA) | 3.163 | 0.9452 | 18.91 | 65.2 / 55.2 | -0.024 | 0.041 |
| TensorRT fp16 | 3.163 | 0.9452 | 18.91 | 76.9 / 61.7 | -0.008 | 0.036 |

El criterio de aceptación del autor exige que ningún archivo tenga un SI-SDR más de 0.5 dB por debajo del original; el peor archivo con TensorRT fp16 queda en -0.008 dB. El RTF corresponde al pipeline completo; la mayor parte del tiempo se consume en el código de features de libDF en CPU, por lo que la aceleración en GPU aporta una mejora limitada en el total.

## Requisitos de hardware

- VRAM estimada: los tres motores suman aproximadamente 155 MB en fp16 (52.1 MB + 50.6 MB + 52.3 MB), por lo que la huella de VRAM es mínima y no es un factor limitante.
- GPU recomendadas: cualquier GPU NVIDIA Ampere o posterior (RTX 30, 40 y 50 series); la benchmark se ejecutó en una RTX 3080 Laptop.
- Cabe en cualquier GPU consumer compatible con Ampere en adelante; no requiere GPUs de datacenter.
- Despliegue: runtime de TensorRT con `pip install "tensorrt-cu12>=10.13,<11" "tensorrt-lean-cu12>=10.13,<11" polygraphy numpy`; el pipeline completo requiere además `deepfilternet==0.5.6` con torch/torchaudio 2.1.
- Latencia y throughput: RTF 0.036 para el pipeline completo en RTX 3080 Laptop, equivalente a procesar audio unas 28 veces más rápido que tiempo real en esa configuración.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | Calidad (PESQ) | RTF | Licencia | Formato |
|---|---|---|---|---|---|---|
| DeepFilterNet3-TensorRT (este) | Mejora de voz, motores TensorRT | 48 kHz | 3.163 | 0.036 | MIT | TensorRT engine |
| DeepFilterNet3 original | Mejora de voz, PyTorch | 48 kHz | 3.163 | 0.034 (CPU fp32) | MIT | Checkpoint PyTorch |
| DeepFilterNet3 ONNX fp16 | Mejora de voz, ONNX Runtime | 48 kHz | 3.163 | 0.041 | MIT | ONNX |

No se dispone en la información proporcionada de datos comparativos con otros modelos de mejora de voz (por ejemplo, RNNoise, Demucs o similares); la comparativa se limita a las tres implementaciones del mismo modelo documentadas por el autor.

## Limitaciones y advertencias

- Los motores son solo las redes neuronales: no incluyen STFT, features ERB, aplicación de ganancias, deep filter ni ISTFT; requieren el paquete `deepfilternet` para el pipeline completo.
- Sin soporte int8: TensorRT necesita activaciones calibradas y el build ONNX int8 disponible es weight-only, por lo que la única precisión publicada es fp16.
- La compatibilidad hardware/version implica una ligera pérdida de velocidad frente a motores compilados para una GPU y versión concretas.
- Requiere TensorRT 10.13 o superior y GPUs Ampere o posteriores; no funciona en GPUs anteriores ni con versiones antiguas de TensorRT.
- El encoder y el decodificador de deep filter son de tipado débil por limitaciones de kernels fp16 en TensorRT 10.13 para convoluciones agrupadas con padding; el comportamiento de precisión por capa puede variar entre versiones.
- Entrada limitada a audio mono a 48 kHz; no se documentan otros formatos, canales o frecuencias de muestreo.
- No se dispone de información sobre sesgos, tasas de alucinación ni limitaciones idiomáticas en la información proporcionada.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de las dependencias (TensorRT, Polygraphy, deepfilternet) en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/DeepFilterNet3-TensorRT
- Repositorio oficial DeepFilterNet: https://github.com/Rikorose/DeepFilterNet
- Paper DeepFilterNet3 (arXiv:2305.08227): https://arxiv.org/abs/2305.08227
- Paper DeepFilterNet2 (arXiv:2205.05474): https://arxiv.org/abs/2205.05474
- Paper DeepFilterNet (arXiv:2110.05588): https://arxiv.org/abs/2110.05588
- Paper adicional referenciado (arXiv:2305.08225): https://arxiv.org/abs/2305.08225
- Motor fp16 encoder: https://huggingface.co/moonbox-dev/DeepFilterNet3-TensorRT/blob/main/fp16/enc.engine
- Motor fp16 decodificador ERB: https://huggingface.co/moonbox-dev/DeepFilterNet3-TensorRT/blob/main/fp16/erb_dec.engine
- Motor fp16 decodificador deep filter: https://huggingface.co/moonbox-dev/DeepFilterNet3-TensorRT/blob/main/fp16/df_dec.engine
- Runner NumPy: https://huggingface.co/moonbox-dev/DeepFilterNet3-TensorRT/blob/main/fp16/trt_runner.py
