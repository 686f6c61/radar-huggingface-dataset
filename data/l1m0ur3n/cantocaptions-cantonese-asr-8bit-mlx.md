# l1m0ur3n/cantocaptions-cantonese-asr-8bit-mlx

## Resumen

CantoCaptions Cantonese ASR (8-bit MLX) es una conversión cuantizada del modelo de reconocimiento automático de voz `rookes/cantocaptions-cantonese-asr`, un ajuste fino de Qwen3-ASR-1.7B entrenado sobre aproximadamente 75 horas del conjunto de datos CantoCaptions. El modelo está especializado en transcripción de cantonés (`yue`), con soporte secundario de chino (`zh`), y ha sido publicado por el usuario l1m0ur3n en formato MLX de 8 bits para su ejecución eficiente en hardware Apple Silicon.

La relevancia de esta ficha reside en que el cantonés es un idioma con recursos limitados en el ecosistema ASR open source, dominado por modelos centrados en mandarín e inglés. Esta conversión permite desplegar un modelo especializado de 2.038 millones de parámetros en Macs con memoria unificada, sin necesidad de GPU dedicada, manteniendo la licencia Apache 2.0 del modelo original.

El modelo conserva los pesos del ajuste fino original salvo por la cuantización afín de 8 bits con tamaño de grupo 64, y reutiliza la configuración y el tokenizer de `mlx-community/Qwen3-ASR-1.7B-bf16` al compartir vocabulario. Se carga mediante las librerías `mlx-audio` (Python) y `mlx-audio-swift`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer encoder-decoder para reconocimiento de voz), según el modelo base Qwen3-ASR-1.7B |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín (affine), tamaño de grupo 64 |
| Idiomas soportados | yue (cantonés), zh (chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión del ajuste fino `rookes/cantocaptions-cantonese-asr`, que parte de Qwen3-ASR-1.7B, un modelo de reconocimiento automático de voz de la familia Qwen3. El ajuste fino se realizó sobre aproximadamente 75 horas del conjunto de datos CantoCaptions, orientado a la transcripción de cantonés. No se dispone de información detallada sobre la composición exacta del dataset, el número total de tokens de audio procesados ni sobre el uso de técnicas de alineación o refuerzo posteriores.

La conversión a MLX aplica cuantización afín de 8 bits con tamaño de grupo 64 sobre los pesos originales, sin modificar la arquitectura ni el vocabulario. La configuración y el tokenizer se toman de `mlx-community/Qwen3-ASR-1.7B-bf16` porque el ajuste fino emplea el mismo vocabulario. El resultado es un repositorio de 2,5 GB que se ejecuta con `mlx-audio` en Python y `mlx-audio-swift`, lo que habilita inferencia local en Apple Silicon.

## Capacidades

- Reconocimiento automático de voz (transcripción de audio a texto) en cantonés, con soporte secundario de chino.
- Carga y ejecución mediante `mlx_audio.stt.load` con el parámetro `language="Cantonese"`.
- Compatible con las librerías `mlx-audio` (Python) y `mlx-audio-swift`.
- Ejecución en hardware Apple Silicon mediante el framework MLX.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo thinking.
- Capacidades multilingües limitadas a los idiomas declarados (`yue`, `zh`).

## Casos de uso

- Subtitulado automático de contenido audiovisual en cantonés: el modelo transcribe audio de vídeo o podcast a texto para generar subtítulos, aprovechando su especialización en `yue` frente a modelos genéricos centrados en mandarín.
- Transcripción de reuniones y entrevistas en cantonés: permite convertir grabaciones a texto en local sobre un Mac, sin enviar audio a servicios en la nube, lo que resulta adecuado para material confidencial.
- Archivado y búsqueda de material oral: transcripción de archivos de audio históricos o de medios para indexar y permitir búsqueda textual sobre el contenido hablado.
- Accesibilidad: generación de subtítulos en directo o diferidos para personas con discapacidad auditiva en entornos de habla cantonesa.
- Investigación lingüística y corpus: producción de transcripciones a escala para estudios del cantonés, aprovechando la licencia Apache 2.0 para uso académico y comercial.
- Integración en aplicaciones macOS/iOS: despliegue embebido mediante `mlx-audio-swift` en apps nativas que requieran transcripción local sin conexión.
- Preprocesado para pipelines de NLP en cantonés: generación de transcripciones que alimenten sistemas de análisis de sentimiento, resumen o traducción posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,5 GB en pesos de 8 bits; se recomienda al menos 4 GB de memoria unificada disponible para cargar el modelo y procesar audio.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y posteriores) mediante el framework MLX. No está diseñado para GPU NVIDIA ni para ejecución en CPU x86 a través de este formato.
- No se ha documentado compatibilidad con GPU consumer NVIDIA (RTX 4090, etc.) en este repositorio, al ser una conversión específica para MLX.
- Opciones de despliegue: `mlx-audio` (Python) y `mlx-audio-swift`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| l1m0ur3n/cantocaptions-cantonese-asr-8bit-mlx | 2.038.052.480 | no disponible | yue, zh | Apache 2.0 | safetensors (MLX, 8 bits) |
| rookes/cantocaptions-cantonese-asr | no disponible (base del anterior) | no disponible | yue, zh | Apache 2.0 | safetensors |
| mlx-community/Qwen3-ASR-1.7B-bf16 | no disponible | no disponible | no disponible | no disponible | safetensors (bf16) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Especialización restringida: el modelo está ajustado para cantonés y chino; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Dependencia de plataforma: al ser una conversión MLX, requiere hardware Apple Silicon y las librerías `mlx-audio`; no es portable a ecosistemas CUDA sin reconversión.
- Cuantización de 8 bits: puede introducir una ligera degradación en la precisión de transcripción respecto al modelo original en bf16, aunque no se han publicado métricas que lo cuantifiquen.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes, habitual en modelos ASR; no se han documentado evaluaciones específicas de robustez.
- Sesgos: no se ha documentado el análisis de sesgos del dataset CantoCaptions ni la distribución demográfica de las 75 horas de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de atribución del modelo base y verificar las condiciones del dataset original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado, sin evidencia de uso en producción.
- No se ha documentado el límite de duración de audio por inferencia ni el comportamiento con entradas largas.

## Enlaces

- HuggingFace: https://huggingface.co/l1m0ur3n/cantocaptions-cantonese-asr-8bit-mlx
- Modelo base: https://huggingface.co/rookes/cantocaptions-cantonese-asr
- Configuración y tokenizer: https://huggingface.co/mlx-community/Qwen3-ASR-1.7B-bf16
- Dataset CantoCaptions: https://cantocaptions.com
- Repositorio MLX: https://github.com/ml-explore/mlx
- Librería mlx-audio (Python): https://github.com/Blaizzy/mlx-audio
- Librería mlx-audio-swift: https://github.com/Blaizzy/mlx-audio-swift
