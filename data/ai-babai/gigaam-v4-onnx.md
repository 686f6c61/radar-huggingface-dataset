# ai-babai/gigaam-v4-onnx

## Resumen

GigaAM-v4 ONNX INT8 es una distribución optimizada del modelo de reconocimiento automático del habla (ASR) GigaAM-v4, desarrollado originalmente por el equipo GigaAM de Sber (publicado por ai-sage) y convertido a formato ONNX con cuantización INT8 por ai-babai. El objetivo es permitir la transcripción de voz en ruso e inglés íntegramente en CPU, sin GPU ni servicios en la nube, con un tamaño de repositorio de 0,8 GB y tres variantes de inferencia: CTC offline, RNN-T de contexto completo y RNN-T en streaming.

La relevancia de esta conversión radica en que mantiene la precisión del modelo original en PyTorch (con variaciones de WER que en algunos casos incluso mejoran tras la cuantización) mientras reduce los requisitos de despliegue a un runtime ligero como ONNX Runtime o sherpa-onnx. Esto lo hace adecuado para entornos embebidos, aplicaciones de escritorio y despliegues con restricciones de hardware o de privacidad.

El modelo soporta ruso e inglés, emplea arquitecturas CTC y RNN-T (transducer), y se distribuye bajo licencia MIT, con componentes del encoder original sujetos adicionalmente a Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC y RNN-T (transducer) sobre encoder GigaAM-v4; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 640 ms de contexto futuro en la variante streaming RNN-T; audio de hasta 30 s por clip en CTC (referencia de la guia) |
| Tipos de cuantizacion | INT8 (pesos `model.int8.onnx`); se compara contra FP32 del modelo original |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | MIT (pesos y codigo de conversion); componentes del encoder upstream tambien Apache-2.0 |
| Formato de pesos | ONNX (INT8), con ficheros auxiliares `tokens.txt`, `vocab.txt` y `preprocessor.onnx` |

## Arquitectura y entrenamiento

El modelo base GigaAM-v4 es un sistema ASR desarrollado por el equipo GigaAM (Sber) con arquitectura de encoder acústico combinada con dos cabeceras de decodificación: CTC (Connectionist Temporal Classification) y RNN-T (Recurrent Neural Network Transducer). Esta distribución ONNX no reentrena el modelo, sino que convierte los checkpoints originales de PyTorch a ONNX y aplica cuantización INT8 para inferencia en CPU. Se ofrecen tres paquetes: CTC end-to-end (242,5 MB), RNN-T de contexto completo (255,4 MB) y RNN-T en streaming con 640 ms de contexto futuro (259,0 MB).

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino por preferencias, ya que estos datos corresponden al modelo original y no se reproducen en la model card de la conversión. La innovación destacable de esta release es la propia conversión: la cuantización INT8 mantiene o mejora el WER respecto a FP32 en las pruebas realizadas, y la variante streaming permite decodificación incremental con latencia controlada, integrable con sherpa-onnx, transcribe-rs y ONNX Runtime 1.23.2.

## Capacidades

- Transcripción de voz a texto en ruso e inglés, tanto en modo offline (ficheros completos) como en streaming (texto parcial y final).
- Salida de texto formateado en la variante CTC E2E; salida de texto formateado y texto crudo en la variante RNN-T de contexto completo.
- Decodificación incremental en la variante streaming RNN-T con 640 ms de contexto futuro.
- Soporte de marcas de tiempo por palabra (`word_timestamps=True`) a través del wrapper upstream de GigaAM con PyTorch y torchaudio 2.10.0.
- Integración verificada con ONNX Runtime 1.23.2, sherpa-onnx 1.13.2 (solo CTC) y transcribe-rs 0.3.11 (solo CTC).
- Ejecución en CPU con tres hilos, sin necesidad de GPU.
- No se documentan capacidades de visión, audio generativo, tool calling ni razonamiento multi-paso; es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: la variante RNN-T de contexto completo procesa ficheros de audio con salida formateada y cruda, adecuada para generar actas sin enviar datos a la nube.
- Subtitulado y dictado en tiempo real: la variante streaming RNN-T con 640 ms de contexto permite generar texto parcial mientras se habla, útil en aplicaciones de accesibilidad o asistentes de escritura.
- Integración en pipelines existentes con sherpa-onnx: la variante CTC E2E se carga directamente en sherpa-onnx 1.13.2 descargando `model.int8.onnx` y `tokens.txt`, lo que facilita sustituir reconocedores previos sin cambiar la infraestructura.
- Aplicaciones de escritorio y embebidas con CPU: con paquetes de 242-259 MB y throughput de hasta 79,8× tiempo real en un Apple M4 Pro con tres hilos, cabe en equipos sin GPU dedicada.
- Procesamiento por lotes de audio en servidores sin GPU: el modo offline CTC alcanza 79,8× tiempo real en CPU, lo que permite transcribir grandes volúmenes de grabaciones en infraestructura convencional.
- Cumplimiento y privacidad de datos: al ejecutarse íntegramente offline en el dispositivo, evita el envío de audio a servicios externos, adecuado para entornos sanitarios, legales o corporativos con requisitos de confidencialidad.
- Sistemas de atención al cliente con transcripción previa: la variante offline RNN-T puede transcribir llamadas grabadas para su análisis posterior, con WER de 2,53 % en ruso y 6,56 % en inglés según las pruebas publicadas.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos sobre 32 clips de FLEURS (16 por idioma) comparando FP32 del modelo original con INT8, y velocidad sobre ocho clips en un Apple M4 Pro con tres hilos de CPU tras el calentamiento:

| Variante | WER ruso, FP32 → INT8 | WER ingles, FP32 → INT8 | Throughput INT8 |
|---|---:|---:|---:|
| Offline CTC | 2,89 % → 2,53 % | 6,30 % → 5,51 % | 79,8× tiempo real |
| Offline RNN-T | 2,17 % → 2,53 % | 6,82 % → 6,56 % | 70,9× tiempo real |
| Streaming RNN-T | 3,25 % → 2,89 % | 6,82 % → 6,56 % | 32,1× tiempo real |

No se han publicado en la informacion disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está diseñada para CPU con ONNX Runtime.
- Paquetes de pesos: 242,5 MB (CTC E2E), 255,4 MB (RNN-T offline) y 259,0 MB (RNN-T streaming), lo que permite ejecución en equipos con poca memoria.
- GPU recomendadas: no aplica; el modelo está optimizado para CPU. No se documentan requisitos ni rendimiento en GPU.
- Compatibilidad con GPU de consumo: irrelevante para este modelo, ya que su objetivo es la ejecución en CPU.
- Opciones de despliegue: ONNX Runtime 1.23.2, sherpa-onnx 1.13.2 (solo CTC), transcribe-rs 0.3.11 (solo CTC) y el wrapper upstream de GigaAM con PyTorch y torchaudio 2.10.0 para streaming con marcas de tiempo.
- Rendimiento medido: 79,8× tiempo real (CTC offline), 70,9× (RNN-T offline) y 32,1× (RNN-T streaming) en Apple M4 Pro con tres hilos; validado también en Ubuntu 26.04.1 x86-64 y macOS 15.8.1 Apple Silicon.
- Latencia en streaming: la variante RNN-T en streaming emplea 640 ms de contexto futuro.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Contexto / modo | Licencia | Formato |
|---|---|---|---|---|---|
| GigaAM-v4 ONNX INT8 (este) | ru, en | CTC y RNN-T | Offline y streaming (640 ms) | MIT (+ Apache-2.0 en encoder) | ONNX INT8 |
| GigaAM Multilingual-v2 ONNX | 21 idiomas | no disponible en esta informacion | no disponible | no disponible | ONNX |
| GigaAM-v4 original (ai-sage) | ru, en | CTC y RNN-T | Offline y streaming | no disponible en esta informacion | PyTorch |

La comparativa con alternativas de otros autores (por ejemplo, Whisper de OpenAI o modelos ASR de NVIDIA NeMo) no está disponible en la información proporcionada; no se aportan datos de parámetros ni de rendimiento comparativo con esos sistemas.

## Limitaciones y advertencias

- Solo cubre ruso e inglés; no se documenta soporte de otros idiomas en esta variante (la versión Multilingual-v2 cubre 21 idiomas, pero es un modelo distinto).
- El WER en inglés (5,51 %-6,56 % en FLEURS) es notablemente superior al de ruso (2,53 %-2,89 %), lo que sugiere un desequilibrio de rendimiento entre idiomas.
- Los benchmarks se basan en 32 clips de FLEURS (16 por idioma), una muestra reducida; los intervalos de confianza están disponibles en el repositorio de benchmarks, pero la evaluación es limitada.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el conjunto de evaluación o vocabulario técnico especializado; no se documentan métricas en esos escenarios.
- En la variante streaming, el WER de RNN-T (2,89 % en ruso) es distinto al de la variante offline (2,53 %), por lo que la elección de modo afecta a la precisión.
- Los cargadores integrados de onnx-asr 0.12.0 no soportan v4; es necesario usar los scripts del repositorio o las librerías compatibles indicadas.
- La licencia MIT se aplica a los pesos y al código de conversión, pero los componentes del encoder upstream también están sujetos a Apache-2.0; conviene revisar el fichero NOTICE antes de un uso comercial.
- No se documentan sesgos demográficos, de género o de acento del modelo original en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-babai/gigaam-v4-onnx
- Ficheros de la release v0.2.0: https://huggingface.co/ai-babai/gigaam-v4-onnx/tree/v0.2.0
- Código de inferencia en GitHub: https://github.com/ai-babai/gigaam-onnx
- Modelo Multilingual-v2 (21 idiomas): https://huggingface.co/ai-babai/gigaam-multilingual-v2-onnx
- Colección de Hugging Face: https://huggingface.co/collections/ai-babai/gigaam-onnx-offline-and-streaming-speech-recognition-6b0973ce369990a8a4c53c43
- Comprobaciones de calidad de la release: https://github.com/ai-babai/gigaam-onnx/blob/main/quality/README.md
- Matriz modelo × runtime: https://github.com/ai-babai/gigaam-onnx/blob/main/benchmarks/compatibility/README.md
- Guía de uso de CTC: https://huggingface.co/ai-babai/gigaam-v4-onnx/blob/main/ctc-e2e/USAGE.md
- Benchmarks e intervalos de confianza: https://github.com/ai-babai/gigaam-onnx/blob/main/benchmarks/README.md
- Resultados por clip: https://huggingface.co/ai-babai/gigaam-v4-onnx/tree/v0.2.0/evaluation
- Guía de conversión: https://huggingface.co/ai-babai/gigaam-v4-onnx/blob/main/conversion/README.md
- Licencia: https://huggingface.co/ai-babai/gigaam-v4-onnx/blob/v0.2.0/LICENSE
- Avisos legales: https://huggingface.co/ai-babai/gigaam-v4-onnx/blob/v0.2.0/NOTICE
- Repositorio original de GigaAM: https://github.com/salute-developers/GigaAM
- Anuncio de GigaAM-v4 y Multilingual-v2: https://habr.com/ru/companies/sberbank/articles/1112846/
- Checkpoint v4 CTC: https://huggingface.co/ai-sage/GigaAM-v4/tree/5b81216afa29c8b5a1a3e64c424c8416e18c1e5b
- Checkpoint v4 RNN-T: https://huggingface.co/ai-sage/GigaAM-v4/tree/9fe3ebf50c9e0cce5eed60d546938632238b6a96
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs/tree/70bb2e84b976b7e960aa89f1c648e09c59f894dd
- Paper GigaAM (Interspeech 2025): https://doi.org/10.21437/Interspeech.2025-1616
