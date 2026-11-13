# moonbox-dev/DeepFilterNet3-MLX

## Resumen

DeepFilterNet3-MLX es una conversión a MLX del modelo DeepFilterNet3, un sistema de mejora de voz (speech enhancement) en tiempo real para audio de banda completa a 48 kHz. El modelo original, desarrollado por Rikorose, emplea una arquitectura híbrida que combina ganancias por bandas ERB con deep filtering de la banda baja de frecuencia para eliminar ruido de fondo en grabaciones de voz. Esta versión, publicada por moonbox-dev, adapta los pesos oficiales al framework MLX de Apple para su ejecución nativa en Macs con Apple Silicon.

Se trata de un modelo muy compacto: la red neuronal tiene aproximadamente 2,2 millones de parámetros y los ficheros de pesos ocupan 4,3 MB por precisión. El repositorio incluye dos builds, fp16 y bf16, que son esencialmente los pesos oficiales convertidos de PyTorch a MLX sin cuantización, ya que el cargador de DeepFilterNet en mlx-audio no admite tensores cuantizados. El modelo no es un LLM ni un modelo generativo de texto: es un modelo de audio-a-audio especializado en denoising y realce de voz.

La relevancia de esta ficha radica en que permite ejecutar un pipeline de mejora de voz de calidad probada sobre hardware Apple Silicon mediante MLX, con una calidad de salida verificada frente a la implementación original en PyTorch. Es una opción ligera para preprocesar audio en aplicaciones de transcripción, videollamadas o producción de contenido en entornos macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal híbrida para speech enhancement: ganancias por bandas ERB + deep filtering de la banda baja (DeepFilterNet3) |
| Parametros totales | 2,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por tramas; entrada y salida a 48 kHz) |
| Tipos de cuantizacion | fp16 y bf16 en este repositorio; el autor menciona que generó builds 8bit, 6bit y 4bit con cuantización afín de MLX, pero no se listan en la tabla de ficheros |
| Idiomas soportados | no disponible (independiente del idioma; opera sobre señal de voz) |
| Licencia | MIT (el autor indica MIT/Apache-2.0 y hereda la licencia del modelo original) |
| Formato de pesos | safetensors (MLX), con config.json por carpeta de precisión |

## Arquitectura y entrenamiento

DeepFilterNet3 es la tercera iteración del framework DeepFilterNet, descrito en los papers *DeepFilterNet: Perceptually Motivated Real-Time Speech Enhancement* (arXiv:2305.08227) y *DeepFilterNet2: Towards Real-Time Speech Enhancement on Embedded Devices for Full-Band Audio* (arXiv:2205.05474). La arquitectura combina una estimación de ganancias por bandas ERB (perceptualmente motivada) con un módulo de deep filtering que opera sobre la banda baja del espectro, lo que permite mejorar la calidad de la voz con un coste computacional muy reducido. El modelo trabaja a 48 kHz (banda completa) y está diseñado para inferencia en tiempo real, incluso en dispositivos embebidos.

En cuanto al entrenamiento, la información proporcionada no detalla el número de tokens ni la composición exacta del dataset; el modelo original se entrena sobre datos de voz con ruido, pero no se dispone de cifras concretas en esta ficha. La conversión a MLX no reentrena el modelo: carga los pesos oficiales de la revisión `7b14b895fe` de DeepFilterNet3 y los almacena en bf16 o fp16. El autor verificó cada build contra la implementación original en PyTorch (float32, paquete `deepfilternet` 0.5.6) sobre 8 clips ruidosos de 48 kHz (LibriSpeech con ruido babble o rosa, SNR 0-10 dB), midiendo SI-SDR, DNSMOS P.835 y la distancia de la salida respecto a la original. Cabe destacar que mlx-audio reimplementa DeepFilterNet3 y su salida difiere de la original incluso en float32 (25 dB de media, 17,7 dB en el peor clip), aunque la calidad de mejora medida es equivalente.

## Capacidades

- Mejora de voz (speech enhancement) y eliminación de ruido de fondo en audio a 48 kHz.
- Procesamiento audio-a-audio: entrada WAV ruidoso, salida WAV limpio a 48 kHz.
- Funcionamiento en tiempo real (real-time factor de 0,022 en un M5 de 24 GB, según el autor).
- Ejecución nativa en Apple Silicon mediante MLX y la librería mlx-audio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No dispone de capacidades multimodales más allá del audio (sin visión, sin texto, sin audio generativo).
- Independiente del idioma en la medida en que procesa señal de voz, aunque no se documentan idiomas soportados.

## Casos de uso

- Preprocesado de audio para transcripción: limpiar grabaciones ruidosas antes de pasarlas a un sistema ASR (Whisper, etc.) para reducir errores de reconocimiento, aprovechando la salida a 48 kHz y el bajo coste computacional.
- Videollamadas y reuniones en macOS: integrar el modelo en un pipeline de captura de micrófono para suprimir ruido de fondo en tiempo real, dado su real-time factor de 0,022 en Apple Silicon.
- Producción de pódcast y contenido: eliminar ruido ambiental de grabaciones de voz antes de la edición final, con una calidad de salida verificada (SI-SDR 8,62 dB en fp16 frente a 8,71 dB del original).
- Limpieza de datasets de voz: procesar por lotes corpus de audio ruidosos para entrenar o evaluar otros modelos de voz, usando el build fp16 como sustituto ligero del original en PyTorch.
- Aplicaciones de accesibilidad: mejorar la inteligibilidad de audio para personas con dificultades auditivas en entornos ruidosos, aprovechando el diseño perceptualmente motivado del modelo.
- Prototipado en Mac: desarrollar y probar pipelines de mejora de voz localmente en Apple Silicon sin depender de GPU NVIDIA ni de servicios en la nube, gracias a la conversión MLX.
- Integración en plugins de audio: usar el modelo como base para un plugin de supresión de ruido en aplicaciones de edición o captura, dado su reducido tamaño (4,3 MB de pesos).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos sobre 8 clips ruidosos de 48 kHz (LibriSpeech con ruido babble o rosa, SNR 0-10 dB):

| Modelo / precision | Tamano | SI-SDR (dB) | DNSMOS | Salida vs original, media / peor clip (dB) | Real-time factor (M5 24 GB) |
|---|---|---|---|---|---|
| Entrada ruidosa | - | 4,99 | 2,10 | - | - |
| Original (PyTorch fp32, CPU) | - | 8,71 | 2,95 | - | 0,018 |
| fp16 | 4,3 MB | 8,62 | 2,92 | 25,3 / 17,7 | 0,022 |
| bf16 (experimental) | 4,3 MB | 8,58 | 2,93 | 25,2 / 16,3 | 0,022 |

El criterio de aceptación del autor era que el SI-SDR de cada clip no cayera más de 0,5 dB respecto al original y que el DNSMOS medio no bajara más de 0,1. El build bf16 se marca como experimental porque en un clip quedó 0,66 dB por debajo del original. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 4,3 MB por precisión; el consumo total de memoria es mínimo y depende del búfer de audio y del runtime MLX.
- GPU recomendadas: Apple Silicon (el autor reporta pruebas en un M5 de 24 GB). No se documentan requisitos para GPU NVIDIA.
- Cabe en cualquier Mac con Apple Silicon; no se dispone de datos para GPUs de consumo tipo RTX 4090 porque el modelo está empaquetado para MLX.
- Opciones de despliegue: mlx-audio (`mlx_audio.sts.models.deepfilternet.DeepFilterNetModel`), probado con `mlx-audio==0.6.5`. El modelo original también puede ejecutarse con el paquete `deepfilternet` 0.5.6, el binario `deep-filter` o el plugin LADSPA.
- Latencia y throughput: real-time factor de 0,022 en un M5 de 24 GB (frente a 0,018 del original en CPU), lo que implica procesar audio más rápido que en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / frecuencia | Calidad (SI-SDR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepFilterNet3-MLX (este) | 2,2 M | 48 kHz, por tramas | 8,62 dB (fp16) | MIT/Apache-2.0 | Hugging Face, MLX |
| DeepFilterNet3 original (PyTorch) | 2,2 M | 48 kHz, por tramas | 8,71 dB (fp32) | MIT/Apache-2.0 | GitHub, PyTorch |
| DeepFilterNet2 | no disponible en la información | 48 kHz | no disponible | MIT/Apache-2.0 | GitHub, Hugging Face Space |
| Otros modelos de speech enhancement | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con las versiones previas de la propia familia DeepFilterNet; no se dispone de datos de benchmarks de alternativas como RNNoise, Demucs o modelos de denoising comercial.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- El build bf16 está marcado como experimental y en un clip quedó 0,66 dB por debajo del original en SI-SDR.
- La implementación de mlx-audio es una reimplementación: su salida difiere de la original incluso en float32 (25 dB de media, 17,7 dB en el peor clip), aunque la calidad de mejora medida es equivalente.
- Solo se incluyen builds fp16 y bf16; el cargador de mlx-audio no admite tensores cuantizados, por lo que no hay versiones 8bit/6bit/4bit en el repositorio.
- El modelo está orientado a voz; su comportamiento con música u otras señales no está documentado.
- No se documentan sesgos ni idiomas soportados; al operar sobre señal acústica, el riesgo de alucinación de contenido no aplica del mismo modo que en modelos generativos, pero sí puede introducir artefactos en la señal.
- La licencia es MIT/Apache-2.0 heredada del modelo original; el autor indica que la licencia original gobierna el uso de estos ficheros.
- Requiere macOS con Apple Silicon y mlx-audio; no es portable directamente a entornos Linux/CUDA sin usar el modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/DeepFilterNet3-MLX
- Repositorio original DeepFilterNet: https://github.com/Rikorose/DeepFilterNet
- mlx-audio: https://github.com/Blaizzy/mlx-audio
- Paper DeepFilterNet (perceptually motivated real-time speech enhancement): https://arxiv.org/abs/2305.08227
- Paper Deep Multi-Frame Filtering for Hearing Aids: https://arxiv.org/abs/2305.08225
- Paper DeepFilterNet2: https://arxiv.org/abs/2205.05474
- Paper DeepFilterNet original: https://arxiv.org/abs/2110.05588
- Demo en vídeo: https://youtu.be/EO7n96YwnyE
- Muestras DeepFilterNet2: https://rikorose.github.io/DeepFilterNet2-Samples/
- Demo DeepFilterNet2 en Hugging Face Spaces: https://huggingface.co/spaces/hshr/DeepFilterNet2
- Integración LADSPA/PipeWire: https://github.com/Rikorose/DeepFilterNet/blob/main/ladspa/README.md
