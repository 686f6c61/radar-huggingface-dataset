# devkubnet/whisper-th-distill-mlx

## Resumen

Thai Whisper (distil large-v3) — MLX es una conversión al formato MLX del modelo `biodatlab/distill-whisper-th-large-v3`, un Whisper large-v3 destilado y ajustado para reconocimiento automático de voz en tailandés. El trabajo de conversión lo firma el usuario devkubnet para su herramienta Devkub Edit Kit, mientras que el modelo original y todo el mérito del entrenamiento corresponden a biodatlab. Se publica bajo licencia MIT y está pensado específicamente para inferencia en Apple Silicon mediante la librería `mlx-whisper`.

El modelo resuelve el problema de transcribir audio en tailandés con un modelo de tamaño grande pero destilado, empaquetado en float16 en un repositorio de 1,6 GB, lo que lo hace manejable en equipos Mac con memoria unificada. La conversión conserva los pesos del modelo fuente y añade ficheros auxiliares para el alineamiento temporal de palabras y una pista de decodificación propia de la herramienta del autor.

Es relevante para desarrolladores que necesiten ASR en tailandés sobre hardware Apple sin depender de CUDA, y para quienes quieran integrar transcripción con marcas de tiempo a nivel de palabra. La información pública disponible es escasa: no hay datos de arquitectura detallados más allá de lo heredado de Whisper large-v3, ni benchmarks formales publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 destilado) |
| Parametros totales | no disponible (repo de 1,6 GB en float16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento en Whisper; el autor recomienda fragmentos de <= 20 s |
| Tipos de cuantizacion | float16 (pesos publicados); no se documentan otras |
| Idiomas soportados | tailandes (th) |
| Licencia | MIT |
| Formato de pesos | safetensors (float16) para mlx-whisper |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3, un transformer encoder-decoder con atención completa entrenado originalmente por OpenAI para ASR multilingüe. El modelo fuente de biodatlab es una variante destilada y ajustada al tailandés, de la que no se detallan en la información disponible el número exacto de parámetros ni el volumen de datos de entrenamiento empleados en la destilación.

La conversión a MLX no altera los pesos más allá del empaquetado en float16 y la adaptación del formato de carga. El autor incluye `alignment_heads.json`, extraído del `generation_config.json` del modelo original, porque el cargador de `mlx-whisper` los ignora; es necesario aplicarlos manualmente tras la carga con `model.set_alignment_heads(...)` para obtener marcas de tiempo a nivel de palabra. Además, el modelo se ajustó sin tokens de timestamp, lo que implica que el recorrido estándar de ventanas de 30 s de Whisper recorta el final de cada ventana; por eso el autor recomienda transcribir fragmentos de audio recortados por pausas de 20 s o menos.

## Capacidades

- Reconocimiento automático de voz en tailandés, con salida de texto transcrito.
- Marcas de tiempo a nivel de palabra, siempre que se apliquen los `alignment_heads` tras la carga del modelo.
- Ejecución nativa en Apple Silicon mediante `mlx-whisper`.
- Procesamiento por fragmentos de audio cortos (<= 20 s) recomendado por el autor.
- No se documentan capacidades de traducción, diarización, tool calling ni agentes.

## Casos de uso

- Transcripción de entrevistas y podcasts en tailandés: dividiendo el audio en fragmentos de 20 s cortados en pausas, el modelo genera texto con marcas de tiempo por palabra útiles para subtitulado.
- Subtitulado automático con sincronización: los `alignment_heads` permiten obtener tiempos por palabra, lo que facilita la generación de ficheros SRT o VTT ajustados.
- Edición de vídeo asistida en Mac: integrado en Devkub Edit Kit, permite transcribir y localizar segmentos de habla para cortes basados en texto.
- Herramientas de accesibilidad en tailandés: transcripción en local de notas de voz o reuniones sin enviar audio a servicios en la nube.
- Investigación lingüística sobre tailandés hablado: extracción de transcripciones con alineamiento temporal para análisis fonético o de corpus.
- Prototipado rápido en entornos Apple: al ser MLX y float16, permite iterar en portátiles con memoria unificada sin GPU dedicada.

## Benchmarks y rendimiento

El autor reporta una evaluación informal sobre cuatro clips reales en tailandés: una tasa de error de caracteres (CER) de aproximadamente el 3 % frente al 4,5 % de `whisper-large-v3-turbo`, con marcas de tiempo por palabra coincidentes.

| Modelo | CER (4 clips, tailandés) | Fuente |
|---|---|---|
| whisper-th-distill-mlx | ~3 % | model card del autor |
| whisper-large-v3-turbo | ~4,5 % | model card del autor |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 1,6 GB en float16, por lo que se necesita al menos esa cantidad de memoria unificada más el overhead de la librería MLX.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y superiores); no está pensado para GPU NVIDIA ni CUDA.
- Cabe en equipos consumer Apple con 8 GB o más de memoria unificada, aunque se recomienda 16 GB para trabajar con holgura.
- Despliegue: `mlx-whisper` (librería `mlx`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-th-distill-mlx | no disponible (destilado de large-v3) | 30 s por ventana; uso recomendado <= 20 s | th | MIT | MLX (Apple Silicon) |
| biodatlab/distill-whisper-th-large-v3 | no disponible | 30 s por ventana | th | MIT | PyTorch/Transformers |
| whisper-large-v3-turbo | no disponible | 30 s por ventana | multilingüe | MIT | Múltiples (Transformers, MLX, etc.) |

La ventaja del modelo frente al original de biodatlab es la ejecución nativa en MLX; frente a `whisper-large-v3-turbo`, el autor reporta menor CER en tailandés a costa de requerir fragmentación manual del audio.

## Limitaciones y advertencias

- El modelo se ajustó sin tokens de timestamp: el recorrido estándar de 30 s de Whisper pierde el final de cada ventana, por lo que hay que trocear el audio en fragmentos de 20 s o menos cortados en pausas.
- Los `alignment_heads` deben aplicarse manualmente tras la carga; de lo contrario, no se obtienen marcas de tiempo por palabra.
- Solo soporta tailandés; no se documenta comportamiento en otros idiomas.
- La evaluación reportada se basa en cuatro clips, una muestra muy reducida que no permite extrapolar el rendimiento a dominios diversos (ruido, acentos, audio telefónico).
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio o ruido; el autor advierte de evitar silencios largos al final de los fragmentos.
- Licencia MIT: permite uso comercial, pero conviene conservar la atribución a biodatlab y a OpenAI (Whisper) según corresponda.
- Dependencia exclusiva de Apple Silicon; no es desplegable en infraestructura CUDA sin reconversión.
- Repositorio con muy poca tracción (22 descargas, 0 likes) y sin mantenimiento documentado; verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devkubnet/whisper-th-distill-mlx
- Modelo base: https://huggingface.co/biodatlab/distill-whisper-th-large-v3
- mlx-whisper (mlx-examples): https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Modelo original de Whisper (OpenAI): https://github.com/openai/whisper
