# hypotheses789/whisper-th-large-v3-combined-mlx

## Resumen

whisper-th-large-v3-combined-mlx es una conversión a formato MLX (fp16) del modelo biodatlab/whisper-th-large-v3-combined, un ajuste fino en tailandés de openai/whisper-large-v3 realizado por el Biomedical and Data Lab de la Universidad de Mahidol. El repositorio lo publica el usuario hypotheses789 y su único propósito es permitir la inferencia nativa de reconocimiento de voz en tailandés sobre Apple Silicon mediante la librería mlx-whisper, sin modificar los pesos más allá del cambio de formato.

Se trata de un modelo de la familia Whisper, un transformer encoder-decoder orientado a reconocimiento automático del habla (ASR), en su variante large-v3, con aproximadamente 1550 millones de parámetros y una ventana de audio de 30 segundos por segmento. La conversión remapea las claves del formato Hugging Face al esquema de OpenAI, transpone los pesos convolucionales al layout de MLX y los convierte a float16, manteniendo intacta la arquitectura original.

Su relevancia es acotada pero práctica: cubre un nicho concreto (ASR en tailandés) sobre hardware Apple, un escenario donde las alternativas de despliegue son limitadas. No obstante, el modelo presenta limitaciones documentadas por el propio autor, como la ausencia de tokens de timestamp y la tendencia a bucles de repetición en grabaciones largas, que condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | aproximadamente 1550 millones (large-v3) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento; 448 tokens de posición en el decoder |
| Tipos de cuantizacion | fp16 (único formato publicado en el repo) |
| Idiomas soportados | tailandés (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors convertidos, float16); repo de 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI para transcripción multilingüe y traducción de voz. El modelo base biodatlab/whisper-th-large-v3-combined es un ajuste fino de openai/whisper-large-v3 sobre datos en tailandés, desarrollado por el Biomedical and Data Lab de la Universidad de Mahidol. La model card de esta conversión no detalla la composición del dataset de ajuste fino, el número de tokens de audio utilizados ni si se aplicaron técnicas de RLHF o DPO; esa información debe consultarse en la model card del modelo original.

La innovación de este repositorio es exclusivamente de formato: el script convert_hf_to_mlx.py realiza el remapeo de claves de Hugging Face al esquema de OpenAI, transpone los pesos convolucionales al layout de MLX y los convierte a float16. No se ha reentrenado ni modificado el modelo. El autor advierte que los alignment_heads son los por defecto de mlx-whisper (mitad superior de las capas del decoder) y no están ajustados para este modelo, por lo que word_timestamps=True puede ofrecer menor precisión.

## Capacidades

- Reconocimiento automático del habla en tailandés, con transcripción de audio a texto.
- Procesamiento de audio en ventanas de 30 segundos por segmento.
- Ejecución nativa en Apple Silicon mediante mlx-whisper, con un rendimiento medido de aproximadamente 4,6 veces tiempo real en un Apple M4 de 32 GB.
- Salida en múltiples formatos mediante --output-format all (texto, JSON, SRT, VTT, entre otros).
- No soporta tool calling ni function calling.
- No incorpora capacidades de agente ni razonamiento multi-paso.
- No es multilingüe: está especializado en tailandés.
- No dispone de modo thinking, visión ni audio más allá de la propia entrada de voz.
- No emite tokens de timestamp propios; los segmentos se generan en ventanas fijas de 30 segundos.

## Casos de uso

- Transcripción de reuniones y entrevistas en tailandés: el modelo convierte audio a texto en local sobre un Mac, sin enviar datos a servicios en la nube, lo que resulta adecuado para contenido sensible.
- Generación de subtítulos en tailandés para vídeo: aunque los timestamps son ventanas fijas de 30 segundos, la salida SRT/VTT sirve para subtitulado aproximado; para sincronización precisa se recomienda Whisper estándar.
- Prototipado de aplicaciones de voz en Apple Silicon: mlx-whisper permite integrar la transcripción en scripts Python con pocas líneas, útil para validar ideas antes de pasar a producción.
- Archivado y búsqueda de contenido audiovisual en tailandés: transcripción masiva de grabaciones para indexación y búsqueda textual posterior.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido hablado en tailandés.
- Investigación lingüística y análisis de corpus orales en tailandés: obtención de transcripciones para estudios fonéticos o de análisis del discurso, con la cautela de revisar manualmente los resultados.
- Procesamiento por lotes en equipos Apple: al ejecutarse a unas 4,6 veces tiempo real en un M4, permite transcribir horas de audio en un portátil sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta un dato de throughput: aproximadamente 4,6 veces tiempo real en un Apple M4 con 32 GB de memoria unificada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo pesa 3,1 GB en fp16, por lo que se requiere al menos ese espacio más el overhead de la librería; en la práctica, varios GB de memoria unificada libre.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4). El autor reporta pruebas en un M4 de 32 GB.
- No está pensado para GPU NVIDIA ni CUDA; mlx-whisper es específico de Apple Silicon.
- Cabe en equipos consumer Apple con memoria unificada suficiente (16 GB o más recomendable).
- Opciones de despliegue: mlx-whisper (CLI y API Python). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 4,6 veces tiempo real en Apple M4 de 32 GB, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| hypotheses789/whisper-th-large-v3-combined-mlx | ~1550 M | 30 s por segmento | tailandés | Apache 2.0 | MLX (Apple Silicon) |
| biodatlab/whisper-th-large-v3-combined | ~1550 M | 30 s por segmento | tailandés | no disponible en la informacion proporcionada | safetensors (Hugging Face) |
| openai/whisper-large-v3 | ~1550 M | 30 s por segmento | multilingüe | no disponible en la informacion proporcionada | safetensors, múltiples runtimes |

La comparación se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye datos de rendimiento frente a alternativas. La diferencia principal entre ellas es el formato de pesos y la plataforma de ejecución, no la calidad de transcripción.

## Limitaciones y advertencias

- Timestamps: el ajuste fino no emite tokens de timestamp, por lo que los segmentos salen en ventanas fijas de 30 segundos; para subtitulado preciso se recomienda Whisper estándar.
- Bucles de repetición: en grabaciones largas el autor recomienda condition_on_previous_text=False y compression_ratio_threshold=1.8; además, pasar un initial_prompt aumenta la probabilidad de bucles con este modelo.
- word_timestamps=True puede ser menos preciso porque los alignment_heads no están ajustados para este modelo.
- Especialización monolingüe: solo tailandés; no debe esperarse buen rendimiento en otros idiomas.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido o silencios prolongados.
- Sesgos: no se documentan sesgos específicos en la información disponible; al derivar de Whisper large-v3, hereda los sesgos del modelo original.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda verificar las condiciones del modelo base original.
- Plataforma: exclusivo para Apple Silicon; no es desplegable en infraestructura NVIDIA/CUDA sin reconversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hypotheses789/whisper-th-large-v3-combined-mlx
- Modelo base original: https://huggingface.co/biodatlab/whisper-th-large-v3-combined
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3
- Repositorio MLX: https://github.com/ml-explore/mlx
- Librería mlx-whisper: https://pypi.org/project/mlx-whisper/
