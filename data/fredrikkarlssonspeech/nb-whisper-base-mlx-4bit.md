# FredrikKarlssonSpeech/nb-whisper-base-mlx-4bit

## Resumen

El modelo `FredrikKarlssonSpeech/nb-whisper-base-mlx-4bit` es una conversión del modelo `NbAiLab/nb-whisper-base` (un fine-tuning de Whisper base para noruego bokmål) al formato MLX con cuantización de 4 bits. Está desarrollado por Fredrik Karlsson y publicado bajo licencia Apache 2.0. Su objetivo es ofrecer reconocimiento automático del habla (ASR) en noruego con inferencia rápida y eficiente en dispositivos Apple Silicon, aprovechando el framework MLX de Apple.

La relevancia de este modelo radica en que permite ejecutar transcripción de audio en noruego en hardware de consumo (Macs con chip M1 o superior) sin necesidad de GPUs dedicadas, manteniendo un tamaño reducido (el modelo base tiene alrededor de 74 millones de parámetros, aunque este dato no se especifica en la información disponible). Al estar cuantizado a 4 bits, el peso del modelo se reduce considerablemente, lo que facilita su uso en entornos con memoria limitada.

La arquitectura subyacente es la de Whisper (encoder-decoder transformer), con una ventana de contexto de 30 segundos de audio. Este modelo está pensado para tareas de transcripción y reconocimiento de voz en noruego, y puede integrarse fácilmente mediante el paquete `mlx-whisper` para su uso desde línea de comandos o Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder transformer (base) |
| Parametros totales | no disponible (modelo base Whisper base, ~74M, no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana de Whisper) |
| Tipos de cuantizacion | 4-bit (MLX quantization) |
| Idiomas soportados | noruego bokmal (nb), noruego (no) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (formato nativo de MLX, compatible con safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, que combina un encoder de audio con un decoder autoregresivo de texto. El encoder procesa el espectrograma de 30 segundos de audio y el decoder genera la transcripción token a token. En este caso, el modelo base `NbAiLab/nb-whisper-base` fue fine-tuneado por el National Library of Norway (NbAiLab) sobre datos de habla noruega, ajustando los pesos de Whisper base para mejorar el rendimiento en noruego bokmål.

La conversión a MLX se realizó con el script `convert.py` de `mlx-examples/whisper`, aplicando cuantización de 4 bits. No se dispone de detalles sobre el dataset de entrenamiento del fine-tuning original (número de horas, composición, etc.) en la información proporcionada. Tampoco se menciona el uso de técnicas como RLHF o DPO; el entrenamiento se limita al fine-tuning supervisado estándar de Whisper.

## Capacidades

- Reconocimiento automatico del habla (ASR) en noruego bokmål, con transcripción de audio a texto.
- Soporte para múltiples tareas de Whisper (transcripción, traducción al inglés) si el modelo base las conserva, aunque no se confirma en la documentación.
- Funciona con audio de hasta 30 segundos por ventana; para audios más largos se realiza segmentación automática.
- Integración sencilla con `mlx-whisper` para uso en línea de comandos o API Python.
- Optimizado para Apple Silicon (M1, M2, M3) mediante el framework MLX, aprovechando la aceleración por hardware neuronal.

No se han documentado capacidades de tool calling, agentes o razonamiento multi-step, ya que es un modelo de transcripción de voz, no un LLM general.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto en noruego, útil para actas o búsqueda de contenido. Su bajo peso permite ejecutarlo en un portátil Mac sin conexión a internet.
- Subtitulado automático de vídeos en noruego: integrándolo en pipelines de postproducción, se generan subtítulos a partir de la pista de audio, con una latencia aceptable en hardware Apple.
- Asistentes de voz para aplicaciones locales: al ser un modelo ligero (4-bit), puede integrarse en aplicaciones de escritorio o móviles que requieran dictado en noruego sin depender de servicios en la nube.
- Archivado y búsqueda de contenido audiovisual: bibliotecas o medios pueden indexar archivos de audio y vídeo transcribiéndolos automáticamente, facilitando la búsqueda por texto.
- Herramientas de accesibilidad: ayuda a personas con discapacidad auditiva ofreciendo transcripciones en tiempo real de conversaciones o eventos en noruego.
- Investigación lingüística: permite procesar corpus de habla noruega para análisis fonético o sociolingüístico, gracias a la licencia abierta Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo hereda el rendimiento del `NbAiLab/nb-whisper-base`, que ha sido evaluado por el National Library of Norway en tareas de ASR noruego, pero esos datos no se incluyen en esta ficha. Se recomienda consultar la documentación del modelo base para comparativas con Whisper original.

## Requisitos de hardware

- Requiere un dispositivo Apple Silicon (M1, M2, M3 o superior) para ejecutar el modelo con MLX de forma eficiente.
- La cuantización de 4 bits reduce el tamaño del modelo a aproximadamente 40-50 MB (estimación razonable, no confirmada), por lo que cabe en cualquier Mac con al menos 4 GB de RAM unificada.
- No requiere GPU NVIDIA ni CUDA; la inferencia se realiza en la CPU/GPU integrada del chip Apple.
- Opciones de despliegue: mediante el paquete `mlx-whisper` (CLI o Python), o integración directa con el framework MLX.
- La latencia depende del hardware; en un Mac M1 se esperan tiempos de transcripción cercanos al tiempo real para audio de 30 segundos, aunque no se proporcionan mediciones exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| `FredrikKarlssonSpeech/nb-whisper-base-mlx-4bit` | ~74M (no confirmado) | 30 s | noruego bokmål | Apache 2.0 | MLX 4-bit |
| `NbAiLab/nb-whisper-base` (original) | ~74M | 30 s | noruego bokmål | Apache 2.0 | PyTorch / Transformers |
| `openai/whisper-base` (base) | ~74M | 30 s | multilingüe (incluye noruego) | MIT | PyTorch / ONNX / etc. |

El modelo MLX 4-bit ofrece la misma capacidad que el original pero con un tamaño reducido y ejecución optimizada en Apple Silicon. Frente a `openai/whisper-base`, el fine-tuning noruego mejora el rendimiento en este idioma, aunque no se dispone de métricas concretas.

## Limitaciones y advertencias

- Limitado al noruego bokmål; no se garantiza buen rendimiento en otros dialectos noruegos ni en otros idiomas, aunque Whisper base es multilingüe.
- La cuantización de 4 bits puede degradar ligeramente la precisión en comparación con el modelo original en FP32/FP16, aunque no se ha cuantificado.
- No se proporcionan datos de sesgos o alucinaciones específicos; como cualquier modelo ASR, puede producir errores en audio con ruido, acentos fuertes o vocabulario técnico.
- El modelo está pensado para Apple Silicon; no es compatible directamente con GPUs NVIDIA o CPUs x86 sin conversión adicional.
- No se especifica si el modelo conserva la capacidad de traducción al inglés de Whisper; se recomienda probarlo antes de usarlo para ese fin.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la procedencia del fine-tuning original (NbAiLab) para asegurar el cumplimiento de sus términos, si los hubiera.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-base-mlx-4bit)
- [Modelo base NbAiLab/nb-whisper-base](https://huggingface.co/NbAiLab/nb-whisper-base)
- [Repositorio de MLX Whisper (mlx-examples)](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
- [Repositorio de OpenAI Whisper](https://github.com/openai/whisper)
- [Repositorio de NbAiLab/nb-whisper](https://github.com/NbAiLab/nb-whisper)
