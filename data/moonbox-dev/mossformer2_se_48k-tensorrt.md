# moonbox-dev/MossFormer2_SE_48K-TensorRT

## Resumen

MossFormer2_SE_48K-TensorRT es una compilación a TensorRT del modelo de mejora de voz MossFormer2_SE_48K, desarrollado originalmente por Alibaba (publicado bajo el espacio `alibabasglab`) e integrado en el ecosistema ClearerVoice-Studio. Esta versión, mantenida por moonbox-dev, no introduce cambios en los pesos ni en el entrenamiento: convierte la red neuronal en motores TensorRT optimizados para GPUs NVIDIA RTX, eliminando la dependencia de PyTorch en tiempo de inferencia y reduciendo el coste computacional del pipeline de realce de voz a 48 kHz.

El modelo resuelve la supresión de ruido y la mejora de inteligibilidad en grabaciones de voz muestreadas a 48 kHz, una frecuencia poco habitual en herramientas de denoising (la mayoría operan a 16 kHz) que preserva el ancho de banda completo de la señal. La relevancia de esta ficha radica en su empaquetado: motores compatibles a nivel de hardware (Ampere y posteriores: RTX 30, 40 y 50) y de versión (TensorRT 10.x desde 10.13), lo que evita recompilaciones y facilita el despliegue en producción.

La arquitectura subyacente es MossFormer2, una red de mejora de habla en dominio espectral que recibe características de filterbank Kaldi y devuelve una máscara espectral. El repositorio ocupa 0,5 GB y contiene exclusivamente el motor `fp16` (482,9 MB), un runner en NumPy con Polygraphy y scripts auxiliares; no se distribuyen pesos en safetensors ni GGUF, solo el binario TensorRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossFormer2 (red de mejora de habla en dominio espectral, con capas gated FSMN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de T frames entre 10 y 3000 (hasta 24 s por ventana) |
| Tipos de cuantizacion | fp16 (pesos almacenados en fp16, calculo en fp32); sin int8 |
| Idiomas soportados | no disponible (procesamiento acustico independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | TensorRT engine (`model.engine`) derivado de ONNX; no se incluyen safetensors ni GGUF |
| Frecuencia de muestreo | 48 kHz mono |
| Entrada del motor | `fbanks` [1, T, 180]: 60 bandas log-mel + delta + delta-delta, tramas de 40 ms cada 8 ms |
| Salida del motor | `mask` [1, T, 961] |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

MossFormer2 es una red neuronal para mejora de voz que opera en el dominio de la frecuencia: recibe características de filterbank (log-mel con deltas de primer y segundo orden) y predice una máscara espectral que se aplica sobre la STFT de la señal ruidosa antes de la ISTFT. La red incluye capas gated FSMN (Feedforward Sequential Memory Networks) cuyas activaciones alcanzan valores en torno a 1e10, muy por encima del rango representable en fp16; por ello, en esta compilación los casts se pliegan en pesos fp32 y la aritmética del motor se ejecuta en fp32, igual que en la build ONNX original. No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta versión no los detalla.

La innovación técnica de este repositorio no reside en el modelo, sino en el proceso de compilación: los motores se construyen a partir del grafo ONNX publicado por Moonbox con la misma precisión, usando el builder de TensorRT en modo *strongly typed* (cada tensor conserva la precisión que le asigna el grafo ONNX). Se añadieron ejes explícitos a los nodos `Squeeze` porque TensorRT no puede inferirlos con formas dinámicas, y se descartó int8 porque las activaciones de la red exceden el rango calibrable de esa precisión. El resultado es un motor compatible con Ampere y posteriores y con cualquier TensorRT 10.x desde 10.13, a costa de una ligera pérdida de velocidad frente a un motor compilado para una GPU concreta.

## Capacidades

- Supresión de ruido y mejora de voz en grabaciones mono a 48 kHz, preservando el ancho de banda completo de la señal.
- Procesamiento por ventanas de hasta 3000 frames (24 s) por inferencia; el pipeline de ClearerVoice trocea automáticamente archivos de más de 20 s en ventanas de 4 s.
- Inferencia sin PyTorch: el runner usa únicamente TensorRT, Polygraphy y NumPy.
- Integración con el pipeline oficial de ClearerVoice-Studio 0.1.2 sustituyendo la red por el motor TensorRT en la función `decode_one_audio`.
- Salida determinista si se fija `dither=0.0` en el cálculo del filterbank (por defecto ClearerVoice usa `dither=1.0`, lo que introduce variabilidad entre ejecuciones).
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente audio-a-audio.

## Casos de uso

- **Limpiar audio de reuniones y videollamadas**: el modelo elimina ruido de fondo (teclados, ventiladores, tráfico) en grabaciones a 48 kHz, la frecuencia nativa de muchas plataformas de conferencia, sin necesidad de remuestrear a 16 kHz. El motor TensorRT permite procesar en tiempo casi real (RTF 0,044 en una RTX 3080 Laptop).
- **Preprocesado para pipelines de ASR**: la mejora de voz antes de un sistema de reconocimiento de habla reduce la tasa de error en entornos ruidosos; al ejecutarse como motor TensorRT independiente de PyTorch, se puede desplegar en el mismo servidor que el motor de ASR sin conflictos de dependencias.
- **Producción de podcast y contenido audiovisual**: la ventana de 24 s por inferencia y el troceado automático de ClearerVoice permiten procesar episodios completos por lotes, con una calidad medida de PESQ 3,102 y STOI 0,9538 sobre VoiceBank-DEMAND.
- **Grabación de campo y periodismo**: limpieza de entrevistas captadas con micrófonos de solapa en condiciones adversas, manteniendo la inteligibilidad (STOI superior a 0,95) y sin introducir artefactos graves (la diferencia media de SI-SDR frente a la build ONNX es de 81,7 dB, con un peor archivo de solo -0,005 dB).
- **Telefonía y atención al cliente**: mejora de la señal en centros de contacto donde las grabaciones llegan con ruido de call center; el bajo coste computacional (RTF 0,044) permite procesar muchas llamadas concurrentes en una sola GPU consumer.
- **Investigación en procesamiento de audio**: punto de partida para comparar implementaciones TensorRT frente a ONNX o PyTorch en tareas de speech enhancement, con métricas de referencia publicadas y hashes SHA-256 verificables para cada archivo.

## Benchmarks y rendimiento

Los datos proceden de la model card y se midieron sobre el conjunto de test VoiceBank-DEMAND (824 enunciados de dos hablantes no vistos, 48 kHz), usando el pipeline de decode de ClearerVoice con dither 0, en una RTX 3080 Laptop GPU.

| Modelo / build | PESQ | STOI | SI-SDR (dB) | vs ONNX: media / peor archivo (dB) | Cambio SI-SDR peor archivo | RTF |
|---|---|---|---|---|---|---|
| ONNX `fp16/` (CUDA) | 3,102 | 0,9538 | 19,42 | - | - | 0,105 |
| TensorRT `fp16/` | 3,102 | 0,9538 | 19,42 | 81,7 / 68,7 | -0,005 | 0,044 |

La build ONNX iguala a su vez las puntuaciones del original en PyTorch (`clearvoice` 0.1.2, fp32, CPU): PESQ 3,102, STOI 0,9538, SI-SDR 19,42 dB. El criterio de aceptación fijado por el autor exige que ningún archivo caiga más de 0,5 dB de SI-SDR por debajo de la build ONNX; el peor archivo se queda en -0,005 dB. El factor de tiempo real (RTF) corresponde al pipeline completo, con cálculo de características e ISTFT en CPU.

## Requisitos de hardware

- **VRAM estimada**: el motor ocupa 482,9 MB en disco; la VRAM en ejecución no se detalla en la información disponible, pero al tratarse de una red de mejora de voz de tamaño moderado y ejecutarse con ventanas de hasta 3000 frames, es previsible que quepa holgadamente en GPUs consumer, aunque no se publica una cifra exacta.
- **GPUs compatibles**: arquitectura Ampere o posterior, es decir, RTX 30, 40 y 50 series. Los motores son compatibles a nivel de hardware, por lo que no requieren recompilación por modelo de GPU.
- **Cabe en GPU consumer**: sí, según la compatibilidad declarada (RTX 30/40/50). El benchmark se realizó en una RTX 3080 Laptop.
- **Versión de TensorRT**: cualquier 10.x desde 10.13, mediante el runtime ligero (`tensorrt-lean-cu12`).
- **Dependencias**: `pip install "tensorrt-cu12>=10.13,<11" "tensorrt-lean-cu12>=10.13,<11" polygraphy numpy`; para el pipeline completo, `clearvoice==0.1.2` y `soundfile`.
- **Opciones de despliegue**: el runner incluido (`trt_runner.py`) más el pipeline de ClearerVoice; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: RTF 0,044 para el pipeline completo en una RTX 3080 Laptop, frente a 0,105 de la build ONNX, lo que supone aproximadamente 2,4 veces más rápido.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | PESQ (VoiceBank-DEMAND) | Licencia | Formato |
|---|---|---|---|---|---|
| MossFormer2_SE_48K-TensorRT (esta ficha) | Mejora de voz, motor TensorRT | 48 kHz | 3,102 | Apache-2.0 | TensorRT engine |
| MossFormer2_SE_48K (original, alibabasglab) | Mejora de voz, PyTorch | 48 kHz | 3,102 | Apache-2.0 | PyTorch / ONNX |
| Build ONNX fp16 de Moonbox | Mejora de voz, ONNX Runtime | 48 kHz | 3,102 | Apache-2.0 | ONNX |

No se dispone en la información proporcionada de datos de benchmarks de otros modelos de mejora de voz (por ejemplo, Demucs, FRCRN o DeepFilterNet) que permitan una comparación cuantitativa directa; las alternativas listadas son variantes de empaquetado del mismo modelo base.

## Limitaciones y advertencias

- **Dependencia de hardware**: los motores solo funcionan en GPUs Ampere o posteriores (RTX 30, 40 y 50). No hay soporte para GPUs más antiguas ni para CPU.
- **Dependencia de versión**: requieren TensorRT 10.x desde 10.13; versiones anteriores o la 11 no están soportadas.
- **Sin int8**: no se ofrece cuantización int8 porque las activaciones de la red superan el rango calibrable de esa precisión; no es posible reducir más el coste computacional por esta vía.
- **Variabilidad por dither**: ClearerVoice calcula el filterbank con `dither=1.0`, lo que produce diferencias entre ejecuciones; para resultados reproducibles hay que sustituir `dec.compute_fbank` por `torchaudio.compliance.kaldi.fbank(..., dither=0.0)`.
- **Procesamiento por ventanas**: las entradas superiores a 20 s se trocean en ventanas de 4 s en el pipeline de ClearerVoice, lo que puede introducir discontinuidades en las juntas si no se aplica solapamiento.
- **Ámbito limitado**: es un modelo audio-a-audio; no genera texto, no razona, no soporta tool calling ni agentes. No debe evaluarse con benchmarks de lenguaje.
- **Idiomas**: no se declaran idiomas soportados; al operar sobre características acústicas, la calidad puede variar según el idioma y el tipo de ruido, pero no hay datos publicados al respecto.
- **Sesgos y alucinaciones**: no se documentan sesgos específicos; como toda red de mejora de voz, puede suprimir componentes de la señal que confunda con ruido (por ejemplo, consonantes fricativas débiles) o introducir artefactos en condiciones muy alejadas del conjunto de entrenamiento.
- **Licencia**: Apache-2.0, heredada del modelo original; permite uso comercial, pero el usuario debe conservar el aviso de licencia y verificar los términos del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/MossFormer2_SE_48K-TensorRT
- Modelo base: https://huggingface.co/alibabasglab/MossFormer2_SE_48K
- Motor fp16: https://huggingface.co/moonbox-dev/MossFormer2_SE_48K-TensorRT/blob/main/fp16/model.engine
- Runner TensorRT: https://huggingface.co/moonbox-dev/MossFormer2_SE_48K-TensorRT/blob/main/fp16/trt_runner.py
- ClearerVoice-Studio (librería `clearvoice`): no disponible en la información proporcionada
- Paper de MossFormer2: no disponible en la información proporcionada
