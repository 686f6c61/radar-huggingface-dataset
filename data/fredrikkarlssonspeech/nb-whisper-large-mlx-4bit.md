# FredrikKarlssonSpeech/nb-whisper-large-mlx-4bit

## Resumen

El modelo `FredrikKarlssonSpeech/nb-whisper-large-mlx-4bit` es una conversión a MLX (Machine Learning framework de Apple) del modelo de reconocimiento automático de voz (ASR) `NbAiLab/nb-whisper-large`, desarrollado por el laboratorio noruego de IA NbAiLab. Este modelo base es una adaptación de la arquitectura Whisper de OpenAI, fine-tuneada específicamente para el noruego (bokmål y nynorsk), y soporta también la transcripción y traducción al inglés. La conversión a MLX con cuantización de 4 bits permite una inferencia rápida y eficiente en dispositivos con Apple Silicon (chips M1, M2, M3, etc.), reduciendo el uso de memoria y mejorando la velocidad de procesamiento en comparación con la versión original de PyTorch.

El modelo resuelve el problema de la transcripción automática de audio en noruego, un idioma con escasos recursos en ASR, ofreciendo una solución optimizada para hardware de Apple. Su relevancia actual radica en la creciente adopción de Apple Silicon en entornos de desarrollo y producción, y en la necesidad de modelos ASR ligeros y rápidos para aplicaciones en tiempo real, subtitulado, accesibilidad y análisis de audio. Al estar licenciado bajo Apache-2.0, es totalmente libre para uso comercial y académico.

La arquitectura es un transformer encoder-decoder (Whisper) con aproximadamente 1550 millones de parámetros, aunque el número exacto no se indica en la información disponible. El contexto de audio es de 30 segundos por ventana, como es estándar en Whisper. La conversión a MLX se realizó con la herramienta `mlx-examples/whisper/convert.py`, y el modelo se distribuye en formato MLX con cuantización de 4 bits, lo que reduce el tamaño del repositorio a 0.9 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (basado en Whisper large) |
| Parametros totales | no disponible (se estima ~1550M por ser Whisper large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Noruego (nb, no) y traduccion al ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (formato propio de Apple, basado en safetensors) |

## Arquitectura y entrenamiento

El modelo base `NbAiLab/nb-whisper-large` es una adaptación de Whisper large de OpenAI, fine-tuneada sobre datos de audio noruego. Whisper utiliza una arquitectura transformer encoder-decoder con atención multi-cabeza, entrenada de forma supervisada sobre 680,000 horas de audio multilingüe. El fine-tuning realizado por NbAiLab se centró en mejorar la precisión para los dialectos noruegos, incluyendo bokmål y nynorsk, así como la capacidad de traducir al inglés.

La conversión a MLX se realizó mediante el script `convert.py` del repositorio oficial `mlx-examples`, que transforma los pesos de PyTorch a formato MLX y aplica cuantización de 4 bits. Esta cuantización reduce el tamaño del modelo de aproximadamente 3 GB (en FP32) a 0.9 GB, manteniendo una degradación mínima de la precisión. No se dispone de información sobre el dataset de entrenamiento específico del fine-tuning, ni sobre técnicas de RLHF o DPO, ya que el modelo base fue publicado por NbAiLab bajo licencia Apache-2.0.

## Capacidades

- Reconocimiento automático de voz (ASR) para noruego (bokmål y nynorsk) con alta precisión en dialectos regionales.
- Transcripción de audio a texto en tiempo real o por lotes.
- Traducción de audio noruego a inglés (función heredada de Whisper).
- Soporte de audio de hasta 30 segundos por segmento, con manejo de contextos largos mediante segmentación automática.
- Inferencia optimizada para Apple Silicon gracias a MLX, con soporte de aceleración por GPU y CPU.
- Integración sencilla mediante la librería `mlx-whisper`, que permite transcribir desde línea de comandos o Python.
- Compatible con el pipeline de Hugging Face `automatic-speech-recognition` para despliegue en entornos estándar.
- No soporta tool calling ni capacidades de agente, ya que es un modelo ASR puro.

## Casos de uso

- Subtitulado automático de vídeos en noruego: el modelo puede transcribir pistas de audio de vídeos y generar subtítulos en tiempo real o en postproducción, gracias a su capacidad de procesar segmentos de 30 segundos y su precisión en dialectos.
- Asistente de voz para aplicaciones de accesibilidad: permite convertir comandos de voz en texto para usuarios con discapacidad motora, ejecutándose localmente en Macs con Apple Silicon sin necesidad de conexión a internet.
- Transcripción de reuniones y entrevistas: los periodistas o investigadores pueden transcribir grabaciones de audio en noruego, incluso con acentos regionales, usando la integración con `mlx-whisper` en scripts de Python.
- Análisis de llamadas de atención al cliente: empresas noruegas pueden transcribir llamadas telefónicas para análisis de sentimiento o extracción de información, gracias a la licencia Apache-2.0 que permite uso comercial.
- Traducción de contenido audiovisual: el modelo puede traducir audio noruego a inglés, facilitando la localización de podcasts, vídeos o conferencias para audiencias internacionales.
- Verificación de calidad en producción audiovisual: los estudios de doblaje o postproducción pueden usar el modelo para comprobar la sincronización de diálogos en noruego, ejecutándolo en estaciones de trabajo Mac con alto rendimiento.
- Despliegue en entornos edge: al ser ligero (0.9 GB), es viable en dispositivos Apple con poca memoria, como Mac mini o MacBook Air, para aplicaciones de transcripción en tiempo real sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base `NbAiLab/nb-whisper-large` reporta en su documentación mejoras sobre Whisper large para noruego, pero no se incluyen métricas concretas (como WER o BLEU) en esta ficha. Se recomienda consultar el repositorio de NbAiLab para obtener datos de evaluación si están disponibles.

## Requisitos de hardware

- El modelo requiere Apple Silicon (M1 o superior) para ejecutarse de manera eficiente con MLX. No es compatible con GPUs NVIDIA o AMD.
- Uso de memoria estimado: al estar cuantizado en 4 bits, el tamaño en VRAM es de aproximadamente 0.9 GB, más overhead del runtime. En un Mac con memoria unificada de 8 GB es suficiente para inferencia por lotes pequeños.
- GPU recomendada: cualquier chip de la serie M1, M2 o M3, ya que MLX aprovecha la GPU integrada y la Neural Engine.
- Opciones de despliegue: se puede usar directamente con `mlx-whisper` (CLI o API Python), o integrarse en aplicaciones mediante la librería `mlx` de Apple. No es compatible con vLLM, TGI o llama.cpp, ya que estos están orientados a modelos de lenguaje y no a ASR.
- Latencia y throughput: no se han publicado mediciones específicas, pero la cuantización 4-bit y la optimización MLX permiten transcripción en tiempo real en hardware moderno de Apple. En un MacBook Pro M2, se puede esperar una velocidad de procesamiento de audio varias veces superior a la duración del audio.

## Comparativa con modelos similares

No se dispone de datos comparativos exactos en la información proporcionada. Sin embargo, se puede contextualizar con las siguientes alternativas:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NbAiLab/nb-whisper-large (original) | ~1550M | 30 s | Apache-2.0 | PyTorch | Modelo base sin cuantizar, requiere más recursos |
| OpenAI Whisper large | ~1550M | 30 s | MIT | PyTorch | Multilingüe, pero con menor precisión en noruego |
| FredrikKarlssonSpeech/nb-whisper-large-onnx | ~1550M | 30 s | Apache-2.0 | ONNX | Conversión a ONNX para inferencia en CPU/GPU genéricas |

La versión MLX 4-bit ofrece la ventaja de ser ligera y rápida en Apple Silicon, mientras que la versión ONNX es más portable a otros entornos, aunque no aprovecha la optimización específica de Apple.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para noruego y no ofrece un rendimiento fiable en otros idiomas, salvo la traducción al inglés.
- La cuantización de 4 bits puede degradar ligeramente la precisión en comparación con el modelo en FP32, especialmente en entornos ruidosos o con dialectos extremos.
- No se han publicado evaluaciones de sesgos o alucinaciones; como todo modelo ASR, puede producir transcripciones incorrectas en audio de baja calidad o con solapamiento de voces.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda verificar la atribución requerida en el modelo base (NbAiLab).
- El modelo solo funciona en hardware Apple Silicon; no se puede ejecutar en servidores con GPUs NVIDIA, lo que limita su despliegue en infraestructuras cloud estándar.
- No soporta tool calling, generación de texto ni otras tareas más allá del ASR.
- La longitud de contexto de 30 segundos implica que audios más largos deben segmentarse automáticamente, lo que puede introducir errores en los límites de segmento.

## Enlaces

- Hugging Face: [FredrikKarlssonSpeech/nb-whisper-large-mlx-4bit](https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-large-mlx-4bit)
- Modelo base: [NbAiLab/nb-whisper-large](https://huggingface.co/NbAiLab/nb-whisper-large)
- Repositorio de NbAiLab: [GitHub - NbAiLab/nb-whisper](https://github.com/NbAiLab/nb-whisper)
- Demo oficial de NB-Whisper: [NB-Whisper Demo - AI-lab](https://ai.nb.no/nb-whisper-demo/)
- Conversión ONNX (variante): [FredrikKarlssonSpeech/nb-whisper-large-onnx](https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-large-onnx)
- Documentación de mlx-whisper: [mlx-examples/whisper](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
