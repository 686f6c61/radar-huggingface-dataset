# johnrobinsn/parakeet-tdt-0.6b-v2-mlx-q8

## Resumen

Parakeet TDT 0.6B v2 MLX Q8 es una versión cuantizada a 8 bits del modelo de reconocimiento automático del habla (ASR) Parakeet TDT 0.6B v2 de NVIDIA, adaptada para su ejecución en Apple Silicon mediante el framework MLX. El autor de la conversión y cuantización es johnrobinsn, y el resultado se distribuye a través de Hugging Face con la librería `mlx` y el pipeline `automatic-speech-recognition`. El objetivo es reducir el peso del modelo de 2,3 GB a 0,7 GB manteniendo una calidad de transcripción estadísticamente indistinguible de la versión en bfloat16.

El modelo original emplea una arquitectura TDT (Token-and-Duration Transducer), un tipo de transducer que predice conjuntamente tokens y duraciones, diseñado específicamente para ASR en inglés. Esta versión cuantizada conserva el encoder en 8 bits (MLX affine quantization, group size 64) mientras que el decoder y la red conjunta permanecen en bfloat16. Los pesos totales en safetensors suman 235.008.646 parámetros.

Es relevante ahora porque permite ejecutar un modelo ASR de calidad cercana al estado del arte en portátiles y equipos de sobremesa con chip Apple (M1/M2/M3/M4) sin necesidad de GPU dedicada, gracias a la cuantización y al backend MLX. La licencia CC BY 4.0 facilita su uso comercial con atribución, y la integración con la herramienta `parakeet-mlx` simplifica el despliegue en aplicaciones de transcripción local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) |
| Parametros totales | 235.008.646 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en el encoder (MLX affine, group size 64); decoder y joint network en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transducer TDT, que combina un encoder acústico con un decoder de predicción y una red conjunta que emite tanto el token como la duración del mismo. Esta versión cuantizada no modifica la topología: todos los pesos se convierten a bfloat16 y el encoder, que representa aproximadamente el 99 % de los pesos, se cuantiza a 8 bits con cuantización afín de MLX y tamaño de grupo 64. El decoder y la red conjunta se mantienen en bfloat16 para preservar la precisión en la predicción de tokens.

No se dispone de información detallada sobre el dataset de entrenamiento original, el número de tokens o si se aplicaron técnicas de RLHF/DPO, ya que la model card remite a la ficha del modelo original de NVIDIA para esos datos. La innovación técnica destacable de esta versión es la cuantización selectiva del encoder, que reduce el tamaño del repositorio a 0,7 GB frente a los 2,3 GB del modelo en bf16, sin degradación medible en la tasa de error de palabra (WER) según las pruebas del autor sobre un conjunto de 10.000 enunciados en inglés.

## Capacidades

- Reconocimiento automático del habla en inglés (transcripción de audio a texto).
- Predicción conjunta de tokens y duraciones mediante arquitectura TDT, lo que permite manejar variaciones de velocidad del habla.
- Ejecución en Apple Silicon mediante MLX, con soporte para cuantización de 8 bits en el encoder.
- Integración con la librería `parakeet-mlx` para carga y ejecución del modelo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente ASR).
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking, visión ni audio generativo; solo entrada de audio y salida de texto.

## Casos de uso

- Transcripción local de reuniones y notas de voz en equipos Apple: el modelo puede ejecutarse en un Mac con chip M-series gracias a MLX y su reducido tamaño de 0,7 GB, transcribiendo audio en inglés sin enviar datos a la nube.
- Subtitulado automático de vídeos y pódcasts: se integra en pipelines de procesado de audio para generar transcripciones con marcas de tiempo, aprovechando la predicción de duraciones del TDT.
- Asistentes de voz en aplicaciones de escritorio: al ser un modelo ligero, puede embeberse en apps nativas de macOS para dictado en tiempo real con latencia baja.
- Investigación en ASR: sirve como referencia cuantizada para comparar el impacto de la cuantización en la WER frente al modelo bf16 original.
- Prototipado rápido en entornos sin GPU dedicada: permite validar pipelines de reconocimiento de voz en portátiles Apple antes de escalar a infraestructura con GPU NVIDIA.
- Archivado y búsqueda de contenido audiovisual: transcripción por lotes de bibliotecas de audio en inglés para indexación y búsqueda textual, con un coste de almacenamiento reducido al ocupar solo 0,7 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El autor indica que, en un conjunto de prueba de 10.000 enunciados en inglés, la tasa de error de palabra (WER) del modelo de 8 bits fue estadísticamente indistinguible de la del modelo bf16, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM/RAM unificada estimada: aproximadamente 0,7 GB para los pesos cuantizados, más overhead de ejecución; cabe holgadamente en equipos con 8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No está pensado para GPU NVIDIA ni CUDA.
- Cabe en GPU consumer: sí, en cualquier Mac con chip Apple Silicon; no aplica a GPUs dedicadas convencionales por el backend MLX.
- Opciones de despliegue: `parakeet-mlx` (librería de referencia), MLX (`mlx.nn`), y scripts del repositorio `macvoice` para cuantización y carga.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| johnrobinsn/parakeet-tdt-0.6b-v2-mlx-q8 | 235 M | no disponible | en | cc-by-4.0 | safetensors (MLX, 8-bit) |
| nvidia/parakeet-tdt-0.6b-v2 | ~0,6 B | no disponible | en | cc-by-4.0 | safetensors (bf16) |
| mlx-community/parakeet-tdt-0.6b-v2 | ~0,6 B | no disponible | en | cc-by-4.0 | safetensors (MLX, bf16) |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para transcripción multilingüe.
- Es un modelo ASR puro: no genera texto libre, no razona y no soporta instrucciones.
- Riesgo de errores en audio con ruido, acentos marcados o vocabulario técnico no visto en entrenamiento; no se dispone de métricas concretas de WER por dominio.
- La cuantización a 8 bits puede introducir degradaciones sutiles en casos límite, aunque el autor reporta equivalencia estadística con bf16 en su conjunto de prueba.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar al autor original (NVIDIA) y al autor de la conversión.
- Esta versión modificada no está respaldada por NVIDIA, según indica el propio autor.
- Requiere hardware Apple Silicon y el stack MLX; no es portable directamente a CUDA ni a CPU convencional sin conversión adicional.
- No se dispone de información sobre sesgos específicos del modelo original en la documentación proporcionada.

## Enlaces

- [Hugging Face: johnrobinsn/parakeet-tdt-0.6b-v2-mlx-q8](https://huggingface.co/johnrobinsn/parakeet-tdt-0.6b-v2-mlx-q8)
- [Modelo original: nvidia/parakeet-tdt-0.6b-v2](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2)
- [Conversión MLX de referencia: mlx-community/parakeet-tdt-0.6b-v2](https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v2)
- [Repositorio parakeet-mlx](https://github.com/senstella/parakeet-mlx)
- [Repositorio macvoice (script de cuantización)](https://github.com/johnrobinsn/macvoice)
- [Script make_parakeet_q8.py](https://github.com/johnrobinsn/macvoice/blob/main/scripts/make_parakeet_q8.py)
- [Licencia CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
