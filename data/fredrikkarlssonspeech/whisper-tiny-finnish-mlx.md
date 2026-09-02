# FredrikKarlssonSpeech/whisper-tiny-finnish-mlx

## Resumen

El modelo `FredrikKarlssonSpeech/whisper-tiny-finnish-mlx` es una conversión a formato MLX (Apple Silicon) del modelo `Finnish-NLP/whisper-tiny-finnish`, un fine-tuning de `openai/whisper-tiny` sobre el dataset Common Voice 11.0 para reconocimiento automático de voz (ASR) en finés. La conversión se realizó en precisión float16 y está optimizada para inferencia rápida en dispositivos con Apple Silicon mediante la librería `mlx-whisper`.

Este modelo resuelve el problema de transcripción de audio en finés con un tamaño muy reducido (el modelo base Whisper tiny tiene aproximadamente 39 millones de parámetros), lo que lo hace adecuado para despliegues en entornos con recursos limitados, especialmente en hardware de Apple. Su relevancia actual radica en la creciente adopción de MLX como framework de inferencia eficiente en ecosistemas macOS, y en la necesidad de modelos ASR específicos para idiomas de bajos recursos como el finés.

El repositorio tiene un tamaño de 0,1 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. El modelo base fue evaluado con una pérdida de 0,5363 y un WER (Word Error Rate) de 45,14 sobre el conjunto de evaluación de Common Voice 11.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | no disponible (el modelo base Whisper tiny tiene ~39M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | float16 (conversion MLX) |
| Idiomas soportados | fi (fines) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (float16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper tiny de OpenAI: un transformer encoder-decoder con atención estándar, diseñado para procesar espectrogramas de audio de 30 segundos y generar texto transcrito. El modelo original fue fine-tuneado sobre el dataset Common Voice 11.0 (en finés) a partir de los pesos de `openai/whisper-tiny`. No se dispone de información adicional sobre el proceso de entrenamiento (número de tokens, configuración de hiperparámetros o técnicas de ajuste como RLHF/DPO) en la documentación pública.

La conversión a MLX se realizó con el script `mlx-examples/whisper/convert.py` a precisión float16, lo que reduce el tamaño del modelo y acelera la inferencia en hardware Apple Silicon sin pérdida significativa de calidad para tareas de ASR. No se han documentado innovaciones técnicas adicionales más allá de la conversión de formato.

## Capacidades

- Reconocimiento automatico de voz (ASR) para audio en fines, transcribiendo voz a texto.
- Soporte de transcripcion de archivos de audio mediante la CLI `mlx_whisper` o la API Python `mlx_whisper.transcribe`.
- Inferencia optimizada en Apple Silicon (M1, M2, M3 y posteriores) gracias al formato MLX y la precision float16.
- Capacidad de procesamiento por lotes (batch) para multiples archivos de audio, aunque no esta documentada explicitamente.
- Integracion con el ecosistema `mlx-whisper`, que permite seleccionar el modelo por nombre de repositorio HuggingFace.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de transcripcion.

## Casos de uso

- Transcripcion de reuniones y entrevistas en fines: el modelo puede transcribir grabaciones de audio de forma local en un Mac, sin necesidad de conexion a internet, gracias a su tamano reducido y la eficiencia de MLX.
- Subtitulado automatico de videos en fines: integrable en pipelines de postproduccion para generar subtitulos a partir de la banda de audio, con latencia baja en hardware Apple.
- Asistente de dictado para aplicaciones de productividad: puede usarse como backend de reconocimiento de voz en aplicaciones de escritorio macOS, convirtiendo voz en texto en tiempo real.
- Archivo y busqueda de contenido audiovisual: transcripcion de podcasts, programas de radio o archivos historicos en fines para indexacion y busqueda textual.
- Atencion al cliente automatizada: aunque el WER es elevado, puede utilizarse en entornos controlados (por ejemplo, con vocabulario restringido) para transcribir llamadas de soporte y alimentar sistemas de analisis de sentimiento.
- Prototipado rapido de sistemas ASR en fines: al ser un modelo tiny y con licencia permisiva, es adecuado para pruebas de concepto y evaluacion inicial antes de invertir en modelos de mayor tamano.

## Benchmarks y rendimiento

Se dispone de los resultados de evaluacion del modelo base `Finnish-NLP/whisper-tiny-finnish` sobre el conjunto de evaluacion de Common Voice 11.0:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,5363 |
| WER (Word Error Rate) | 45,14 % |

No se han publicado resultados comparativos con otros modelos ASR en fines dentro de la informacion disponible. No se puede verificar el rendimiento en benchmarks adicionales como MMLU o HumanEval, ya que no aplican a un modelo de transcripcion de voz.

## Requisitos de hardware

- VRAM estimada: inferior a 0,5 GB, dado el tamano del repositorio (0,1 GB) y la precision float16; cabe en cualquier GPU integrada de Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o posteriores); no se requiere GPU discreta.
- Compatibilidad con GPU de consumo: no aplica, ya que MLX esta disenado exclusivamente para hardware Apple.
- Opciones de despliegue: mediante `mlx-whisper` (CLI o Python), o integracion directa con la libreria MLX. No soporta vLLM, llama.cpp ni Ollama al ser un modelo de audio con formato propietario de MLX.
- Latencia y throughput: no se han publicado mediciones oficiales; sin embargo, al ser un modelo tiny, se espera una transcripcion casi en tiempo real en dispositivos Apple Silicon modernos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (fines) | Licencia | Formato |
|---|---|---|---|---|---|
| FredrikKarlssonSpeech/whisper-tiny-finnish-mlx | ~39M (estimado) | 30 s de audio | 45,14 % | Apache 2.0 | MLX |
| openai/whisper-tiny (original) | 39M | 30 s de audio | no disponible (mayor que el fine-tune) | MIT | varios |
| Finnish-NLP/whisper-tiny-finnish | ~39M | 30 s de audio | 45,14 % | Apache 2.0 | PyTorch |

El modelo MLX es funcionalmente identico al modelo base PyTorch, pero optimizado para Apple Silicon. Comparado con el Whisper tiny original, el fine-tuning en fines reduce el WER de forma notable, aunque no se dispone del valor exacto del original en este idioma. No se han encontrado alternativas de tamano similar especificamente entrenadas para fines con licencia Apache 2.0.

## Limitaciones y advertencias

- WER elevado (45,14 %): el modelo tiny tiene una precision limitada, especialmente en audio con ruido de fondo, acentos regionales o vocabulario tecnico. No es recomendable para transcripcion critica sin postprocesamiento.
- Solo fines: el modelo fue entrenado exclusivamente en fines; no debe usarse para otros idiomas, aunque Whisper original es multilingue, este fine-tune puede degradar el rendimiento en otras lenguas.
- Dependencia de hardware Apple: el formato MLX solo funciona en Apple Silicon; no se puede desplegar en GPUs NVIDIA o AMD sin convertir los pesos a otro formato.
- Ventana de audio fija de 30 segundos: el modelo procesa segmentos de hasta 30 segundos; audios mas largos requieren segmentacion automatica, lo que puede introducir errores en los limites.
- Sin informacion sobre sesgos: no se han documentado estudios de sesgo o equidad para este modelo; podria presentar sesgos de genero, dialecto o nivel socioeconomico en el reconocimiento.
- Riesgo de alucinacion: como cualquier modelo ASR, puede producir transcripciones inventadas en silencios o audio ininteligible; se recomienda validacion humana en usos profesionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FredrikKarlssonSpeech/whisper-tiny-finnish-mlx
- Modelo base (Finnish-NLP/whisper-tiny-finnish): https://huggingface.co/Finnish-NLP/whisper-tiny-finnish
- Repositorio mlx-whisper (GitHub): https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Paquete PyPI mlx-whisper: https://pypi.org/project/mlx-whisper/
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
