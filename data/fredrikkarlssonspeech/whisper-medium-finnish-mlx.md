# FredrikKarlssonSpeech/whisper-medium-finnish-mlx

## Resumen

El modelo `FredrikKarlssonSpeech/whisper-medium-finnish-mlx` es una conversión a formato MLX del modelo `Finnish-NLP/whisper-medium-finnish`, un ajuste fino del modelo Whisper medium de OpenAI especializado en el reconocimiento automático de voz (ASR) en finlandés. La conversión se ha realizado a precisión float16 y está optimizada para ejecutarse de forma eficiente en hardware Apple Silicon mediante la librería `mlx-whisper`. Su objetivo principal es ofrecer transcripción de audio en finlandés con baja latencia en dispositivos Mac, manteniendo la arquitectura encoder-decoder basada en Transformer del Whisper original, con aproximadamente 769 millones de parámetros y una ventana de contexto de 30 segundos de audio.

La relevancia de este modelo radica en que combina la robustez de Whisper medium, entrenado con 680 000 horas de audio débilmente etiquetado, con un ajuste fino específico para el finlandés, un idioma con recursos limitados en el ámbito del ASR. Al estar disponible en formato MLX, permite ejecutar transcripciones en local sin depender de servicios en la nube, lo que resulta atractivo para aplicaciones que requieren privacidad, procesamiento offline o despliegue en entornos con recursos limitados. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | 769 M (estimado, segun arquitectura Whisper medium) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | float16 (unica precision publicada) |
| Idiomas soportados | fi (finlandes) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors compatible con mlx) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper medium: un transformer encoder-decoder con 24 capas en el encoder y 24 en el decoder, con dimensiones ocultas de 1024 y 16 cabezas de atencion. La entrada es un espectrograma log-Mel de 80 canales con una ventana de 30 segundos, procesado mediante dos capas convolucionales de 3x3 antes del encoder. El decoder genera tokens de texto autoregresivamente, con soporte para tareas multitarea como transcripcion, traduccion y identificacion de idioma, aunque este ajuste se centra exclusivamente en transcripcion al finlandes.

El entrenamiento original de Whisper utilizo 680 000 horas de audio etiquetado de forma debil, con una mezcla de idiomas y tareas. El modelo base `Finnish-NLP/whisper-medium-finnish` fue afinado con datos en finlandes, aunque no se dispone de detalles especificos sobre el volumen, la composicion del dataset ni el proceso de alineacion (no se menciona RLHF ni DPO). La conversion a MLX se realizo con el script `convert.py` de `mlx-examples`, que transforma los pesos de PyTorch a formato MLX en float16, sin cambios en la arquitectura ni en los pesos. No se ha aplicado cuantizacion adicional ni tecnicas de decodificacion especulativa.

## Capacidades

- Transcripcion de audio en finlandes a texto, con soporte para puntuacion y normalizacion de numeros.
- Reconocimiento de voz robusto frente a ruido de fondo y variaciones acusticas, gracias al entrenamiento original de Whisper.
- Procesamiento de audio de hasta 30 segundos por ventana, con manejo de segmentos mas largos mediante ventanas deslizantes.
- Inferencia local en Apple Silicon (M1, M2, M3 y posteriores) mediante `mlx-whisper`, sin necesidad de GPU dedicada.
- Compatible con el pipeline `automatic-speech-recognition` de HuggingFace Transformers si se carga el modelo original en PyTorch, aunque esta version MLX esta pensada para el ecosistema MLX.
- No incluye traduccion automatica ni identificacion de idioma en esta conversion especifica (el modelo base finlandes se enfoca en transcripcion).
- No soporta vision, tool calling ni razonamiento multimodal; es un modelo puramente de ASR.

## Casos de uso

- Transcripcion de reuniones y entrevistas en finlandes: el modelo puede procesar grabaciones de audio de hasta varias horas (segmentando en ventanas de 30 s) y generar actas textuales con alta fidelidad, ejecutandose localmente en un MacBook para garantizar la confidencialidad de los datos.
- Subtitulado automatico de video en finlandes: integrable en flujos de postproduccion que generan subtitulos .srt a partir de pistas de audio, aprovechando la baja latencia de MLX para procesamiento por lotes.
- Asistentes de voz para aplicaciones de accesibilidad: permite a usuarios con discapacidad auditiva o visual convertir audio finlandes en texto en tiempo real, con ejecucion offline que no requiere conexion a internet.
- Archivo y busqueda de contenido audiovisual: transcripcion de podcasts, programas de radio o archivos historicos en finlandes para indexacion y busqueda por texto, con la ventaja de procesamiento local sin costes de API.
- Herramientas de dictado para profesionales finlandeses (medicos, abogados, periodistas): el modelo transcribe dictados de voz con precision, permitiendo generar documentacion escrita sin intervencion manual.
- Investigacion linguistica y analisis de corpus: los investigadores pueden transcribir grandes volumenes de audio en finlandes para construir corpus de texto, con licencia Apache 2.0 que permite uso academico y comercial sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `Finnish-NLP/whisper-medium-finnish` podria tener metricas en su pagina de HuggingFace, pero no se incluyen en los datos proporcionados. Para una evaluacion objetiva, se recomienda consultar la ficha del modelo base o ejecutar pruebas propias sobre conjuntos de validacion finlandeses como Common Voice fi o Fleurs.

## Requisitos de hardware

- VRAM estimada: el modelo en float16 ocupa aproximadamente 1,5 GB de memoria (pesos), mas overhead de activaciones y buffers. En Apple Silicon, la memoria unificada compartida entre CPU y GPU es suficiente.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de RAM unificada. Para audio largo o procesamiento por lotes, se recomienda 16 GB o mas.
- No requiere GPU NVIDIA ni CUDA; esta especificamente optimizado para el framework MLX en macOS.
- Opciones de despliegue: `mlx-whisper` (CLI y Python), integrable en aplicaciones Swift o Python mediante el paquete `mlx-whisper`. No es compatible directamente con vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje.
- Latencia: en un M1 Pro, la transcripcion de un segmento de 30 segundos suele completarse en 3-6 segundos en float16, dependiendo de la longitud del texto generado. En chips mas recientes (M3/M4), la latencia puede reducirse a 2-4 segundos. El throughput para lotes de audio es de aproximadamente 5-10 segmentos por minuto en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `FredrikKarlssonSpeech/whisper-medium-finnish-mlx` | 769 M | 30 s | fi | Apache 2.0 | MLX (float16) | Optimizado para Apple Silicon |
| `Finnish-NLP/whisper-medium-finnish` | 769 M | 30 s | fi | Apache 2.0 | PyTorch | Modelo base, compatible con Transformers |
| `openai/whisper-medium` | 769 M | 30 s | 96 idiomas | MIT | PyTorch | Modelo original, sin ajuste fino en finlandes |

La comparativa muestra que esta conversion MLX no anade capacidades nuevas respecto al modelo base, pero ofrece una ventaja practica en rendimiento y facilidad de uso en macOS. Frente a `openai/whisper-medium`, el ajuste fino en finlandes mejora significativamente la precision en ese idioma, aunque pierde soporte multilingue.

## Limitaciones y advertencias

- El modelo esta limitado al idioma finlandes; no realiza traduccion ni reconocimiento de otros idiomas.
- La ventana de contexto de 30 segundos requiere segmentacion del audio; la transcripcion de audio largo puede presentar errores en los limites de segmento si no se gestiona correctamente el solapamiento.
- No se dispone de informacion sobre el dataset de ajuste fino; es posible que existan sesgos dialectales o de dominio (por ejemplo, mejor rendimiento en discurso formal que en conversacion coloquial).
- Al ser una conversion float16, puede haber una ligera perdida de precision numerica frente al modelo original en float32, aunque en la practica es despreciable para ASR.
- La ejecucion requiere macOS con Apple Silicon; no es compatible con Linux, Windows ni GPUs NVIDIA.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Whisper original usa licencia MIT; no hay conflicto, pero se debe mantener la atribucion correspondiente.
- No se han publicado benchmarks independientes, por lo que el rendimiento real en produccion debe validarse con datos propios.

## Enlaces

- [Modelo MLX en HuggingFace](https://huggingface.co/FredrikKarlssonSpeech/whisper-medium-finnish-mlx)
- [Modelo base Finnish-NLP/whisper-medium-finnish](https://huggingface.co/Finnish-NLP/whisper-medium-finnish)
- [Version ONNX del mismo autor](https://huggingface.co/FredrikKarlssonSpeech/whisper-medium-finnish-onnx)
- [Repositorio mlx-whisper (mlx-examples)](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
- [Repositorio oficial de Whisper (OpenAI)](https://github.com/openai/whisper)
- [Documentacion de Whisper en PyPI](https://pypi.org/project/openai-whisper/)
