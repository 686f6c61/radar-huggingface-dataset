# chukanov/whisper-podlodka-turbo-mlx

## Resumen

`chukanov/whisper-podlodka-turbo-mlx` es una conversión al formato MLX del modelo `bond005/whisper-podlodka-turbo`, un fine-tune de Whisper-Large-V3-Turbo especializado en reconocimiento de voz en ruso con puntuación y capitalización automáticas, así como resistencia al ruido. La conversión, realizada por chukanov, no modifica los pesos ni reentrena el modelo: únicamente reempaqueta los tensores en float16 para que puedan ejecutarse de forma nativa en Apple Silicon mediante la librería `mlx-whisper`. El resultado es un modelo de aproximadamente 807 millones de parámetros con licencia Apache-2.0, listo para usar en entornos macOS con aceleración por hardware.

La relevancia de esta conversión radica en que, hasta ahora, la comunidad había publicado versiones del modelo en formatos CT2/faster-whisper, ONNX y GGML, pero no existía una versión MLX oficial. Este repositorio cubre ese hueco, permitiendo a los desarrolladores de Apple Silicon integrar un ASR ruso de alta calidad sin necesidad de realizar la conversión manualmente. El modelo hereda todas las capacidades y limitaciones del original, incluyendo el soporte de `initial_prompt` para mejorar el reconocimiento de nombres propios y terminología específica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer, decodificador turbo con 4 capas, n_mels=128) |
| Parametros totales | ~807 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | float16 |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `bond005/whisper-podlodka-turbo` es un fine-tune de Whisper-Large-V3-Turbo, que emplea una arquitectura transformer encoder-decoder con un decodificador optimizado de 4 capas (turbo). El fine-tune se realizó específicamente para mejorar el reconocimiento de voz en ruso, añadiendo puntuación y capitalización correctas y aumentando la robustez frente a ruido ambiental. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens o el proceso de ajuste (si se usó RLHF, DPO u otra técnica). La conversión a MLX realizada por chukanov no altera los pesos: se limita a transformar el formato de los tensores a float16 y a adaptar la configuración para que sea compatible con `mlx-whisper`. Por tanto, el comportamiento del modelo es idéntico al del original.

## Capacidades

- Reconocimiento de voz en ruso con alta precisión, incluyendo puntuación y capitalización automáticas.
- Resistencia al ruido de fondo, lo que lo hace adecuado para grabaciones en entornos no controlados.
- Soporte de `initial_prompt` para guiar la decodificación y reducir errores en nombres propios, términos técnicos o jerga específica.
- Integración nativa con Apple Silicon mediante MLX, aprovechando la aceleración por hardware.
- No incluye capacidades de traducción, tool calling, agentes, visión ni otras funcionalidades más allá del ASR.

## Casos de uso

- Transcripción de reuniones y podcasts en ruso: el modelo puede procesar audio largo (dividido en segmentos) y generar texto con puntuación, facilitando la generación de actas o subtítulos.
- Subtitulado automático de vídeos en ruso: gracias a su resistencia al ruido y a la puntuación correcta, es adecuado para contenido de YouTube, entrevistas o webinars.
- Asistentes de voz en aplicaciones de escritorio o móviles para Apple Silicon: al ejecutarse localmente con MLX, no requiere conexión a internet y ofrece baja latencia.
- Análisis de llamadas de atención al cliente: permite transcribir conversaciones telefónicas en ruso para su posterior análisis de sentimiento o extracción de información.
- Transcripción de entrevistas de investigación: con `initial_prompt` se pueden especificar los nombres de los entrevistados y términos del dominio, mejorando la precisión.
- Integración en pipelines de procesamiento de audio en entornos macOS: por ejemplo, en herramientas de productividad que necesiten convertir voz a texto de forma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base (`bond005/whisper-podlodka-turbo`) no incluye métricas numéricas como WER o CER, y la conversión MLX no aporta datos adicionales. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3 o superior) con al menos 8 GB de memoria unificada, dado que el modelo en float16 ocupa aproximadamente 1.6 GB.
- No requiere GPU dedicada; la aceleración se realiza mediante el Neural Engine y los núcleos de la GPU integrada.
- Es necesario tener instalado `ffmpeg` en el `PATH` para que `mlx-whisper` pueda decodificar los archivos de audio.
- La inferencia se realiza mediante la librería `mlx-whisper`, que gestiona la carga del modelo y la transcripción.
- No se dispone de datos de latencia o throughput específicos para este modelo, pero al ser un modelo turbo de ~807M parámetros, se espera un rendimiento en tiempo real o superior en hardware Apple moderno.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| `chukanov/whisper-podlodka-turbo-mlx` | MLX (float16) | ~807M | Ruso | Apache-2.0 | Conversión directa, misma calidad que el original |
| `bond005/whisper-podlodka-turbo` | PyTorch | ~807M | Ruso | Apache-2.0 | Modelo original, requiere conversión para otros frameworks |
| `sergheinenov/whisper-podlodka-turbo-ggml` | GGML (cuantizado) | ~807M (cuantizado) | Ruso | Apache-2.0 | Versión para CPU/llama.cpp, con cuantización adicional |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento frente a otros ASR en ruso. La principal diferencia entre estas versiones es el formato de pesos y el hardware objetivo: MLX para Apple Silicon, PyTorch para GPUs NVIDIA, y GGML para CPU o dispositivos con recursos limitados.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para ruso; no es adecuado para otros idiomas.
- No se ha publicado información sobre sesgos o comportamientos problemáticos específicos, pero al ser un modelo de reconocimiento de voz, puede presentar errores en acentos regionales, habla rápida o superposiciones de hablantes.
- Riesgo de alucinación inherente a los modelos Whisper: en ausencia de audio claro, puede generar texto plausible pero incorrecto.
- La conversión MLX no mejora la calidad del reconocimiento; cualquier limitación del modelo original se mantiene intacta.
- Aunque la licencia Apache-2.0 permite uso comercial, se recomienda verificar la procedencia de los datos de entrenamiento del modelo base si se utiliza en aplicaciones sensibles.
- No se dispone de información sobre la longitud de contexto máxima; Whisper típicamente procesa ventanas de 30 segundos, pero este dato no está confirmado en la documentación proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chukanov/whisper-podlodka-turbo-mlx
- Modelo base (bond005/whisper-podlodka-turbo): https://huggingface.co/bond005/whisper-podlodka-turbo
- Repositorio GGML (sergheinenov): https://github.com/sergheinenov/whisper-podlodka-turbo-ggml
- Librería mlx-whisper (PyPI): https://pypi.org/project/mlx-whisper/
- Página de despliegue en FriendliAI: https://friendli.ai/models/bond005/whisper-podlodka-turbo
