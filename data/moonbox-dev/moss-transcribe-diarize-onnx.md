# moonbox-dev/MOSS-Transcribe-Diarize-ONNX

## Resumen

MOSS-Transcribe-Diarize 0.9B ONNX es una compilación en formato ONNX del modelo de reconocimiento automático del habla (ASR) MOSS-Transcribe-Diarize 0.9B, desarrollado originalmente por OpenMOSS-Team y empaquetado por Moonbox para su uso en dispositivos mediante ONNX Runtime. El modelo combina transcripción de audio con diarización de hablantes (identificación de quién habla en cada turno) y marcas temporales, lo que lo hace útil para generar actas o subtítulos con atribución de interlocutor a partir de reuniones, entrevistas o conversaciones.

El paquete incluye dos precisiones (fp16 e int8) y se distribuye como un conjunto de grafos ONNX (encoder de audio, decoder, embeddings) más un pequeño pipeline en Python que gestiona la extracción de características mel, la construcción del prompt y el bucle de decodificación. Con 0,9B parámetros y un tamaño de repositorio de 3,9 GB, está pensado para ejecutarse en CPU, CUDA o DirectML sin depender de PyTorch en tiempo de inferencia.

Su relevancia actual radica en la combinación de ASR multilingüe (con especial soporte para chino), diarización integrada y despliegue ligero en entornos sin GPU dedicada, manteniendo una tasa de error muy cercana a la del modelo original en PyTorch según las métricas publicadas por el autor del empaquetado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR con encoder de audio, decoder y embeddings; grafos ONNX separados) |
| Parámetros totales | 0,9B (según nombre del modelo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16, int8 |
| Idiomas soportados | multilingüe; chino mencionado explícitamente (no se detalla la lista completa) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (grafos `.onnx` con datos externos `.onnx.data`), más `tokenizer.json`, `mel_filters.npy` y scripts Python |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base MOSS-Transcribe-Diarize más allá de que se compone de un encoder de audio, un decoder y una etapa de embeddings, empaquetados como grafos ONNX independientes. El pipeline incluye la extracción de características mel (`mel_filters.npy`), la construcción del prompt y el bucle de decodificación implementado en `pipeline.py`, apoyado en `ortllm.py` para la ejecución con ONNX Runtime GenAI.

No se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del modelo original más allá de la diarización integrada y la salida con marcas temporales. El trabajo de Moonbox consiste en la conversión y cuantización a ONNX (fp16 e int8), con verificación de paridad frente al modelo PyTorch original.

## Capacidades

- Reconocimiento automático del habla (ASR) con transcripción de audio a texto.
- Diarización de hablantes: atribuye cada turno de palabra al interlocutor correspondiente.
- Generación de marcas temporales por segmento.
- Soporte multilingüe, con chino mencionado de forma explícita y evaluación adicional sobre AISHELL-1.
- Ejecución en ONNX Runtime con backend CPU, CUDA y DirectML.
- Pipeline autocontenido en Python para extracción de features, prompt y decodificación.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento extendido (no aplica a un modelo ASR).

## Casos de uso

- Actas de reuniones: el modelo transcribe el audio y asigna cada intervención a su hablante, lo que permite generar actas estructuradas por participante sin post-procesado adicional de diarización.
- Subtitulado con atribución de interlocutor: las marcas temporales y la diarización permiten producir subtítulos que indican quién habla en cada momento, útil en vídeos de entrevistas o debates.
- Transcripción de entrevistas de investigación: en estudios cualitativos, la salida diarizada facilita el análisis por sujeto y la cita textual con referencia temporal.
- Atención al cliente y centros de llamadas: transcripción de grabaciones con separación agente/cliente para auditoría de calidad y análisis de conversaciones.
- Despliegue en dispositivo (edge): al ejecutarse con ONNX Runtime en CPU o DirectML, puede integrarse en aplicaciones de escritorio o entornos sin GPU dedicada para transcripción local con privacidad de datos.
- Procesamiento por lotes de archivos de audio: el pipeline Python permite automatizar la transcripción de carpetas completas de grabaciones con salida diarizada.
- Documentación clínica o legal dictada: transcripción con marcas temporales para revisión posterior y trazabilidad de cada fragmento.

## Benchmarks y rendimiento

Resultados publicados por el autor del empaquetado sobre su conjunto de evaluación ONNX (400 utterances de LibriSpeech test-clean de 40 hablantes y 200 utterances de AISHELL-1 test para modelos con chino):

| Precisión | WER | CER | Transcripciones idénticas (LibriSpeech / AISHELL-1) | Diarización (turnos correctos) | RTF (CUDA) |
|---|---|---|---|---|---|
| fp16 | 2,06 % | 2,04 % | 359/400 y 196/200 | 37/37 (original: 37) | 0,13 |
| int8 | 2,09 % | 2,07 % | 357/400 y 196/200 | 37/37 | 0,12 |
| Original (PyTorch) | 2,04 % | 2,00 % | referencia | 37/37 | no disponible |

La degradación respecto al original es mínima: +0,02 puntos de WER en fp16 y +0,05 en int8, con una pérdida de paridad de solo 2 transcripciones en LibriSpeech para int8. No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: el paquete completo pesa 3,9 GB; cada precisión ocupa aproximadamente 2,2 GB en fp16 (encoder 625 MB + decoder 1,23 GB + embeddings 311 MB) y unos 1,1 GB en int8 (encoder 320 MB + decoder 667 MB + embeddings 156 MB).
- GPU recomendadas: cualquier GPU compatible con CUDA para el backend CUDA; para DirectML, GPUs integradas o discretas en Windows. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, con el build int8 (en torno a 1,1 GB de pesos) es viable en GPUs de gama media y en muchos iGPU; el build fp16 requiere aproximadamente 2,2 GB.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) y ONNX Runtime GenAI, con los scripts `pipeline.py` y `ortllm.py` incluidos.
- Latencia y throughput: RTF de 0,13 en fp16 y 0,12 en int8 sobre CUDA según el autor, es decir, procesa audio unas 7-8 veces más rápido que tiempo real en esa configuración. No se proporcionan cifras para CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Diarización | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize 0.9B ONNX (este) | 0,9B | Sí, integrada | no disponible | apache-2.0 | ONNX (fp16, int8) |
| Whisper large-v3 | 1,55B | No (requiere pipeline externo) | 30 s por ventana | MIT | safetensors, GGUF, ONNX |
| Whisper small | 244M | No | 30 s por ventana | MIT | safetensors, GGUF, ONNX |
| MOSS-Transcribe-Diarize 0.9B (original) | 0,9B | Sí, integrada | no disponible | apache-2.0 | PyTorch |

La ventaja diferencial frente a Whisper es la diarización integrada en un único modelo, que evita encadenar un modelo de segmentación de hablantes aparte. Frente al original en PyTorch, este paquete ONNX ofrece despliegue sin dependencia de PyTorch y cuantización int8 con pérdida mínima de precisión.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la información disponible; como todo sistema ASR, puede presentar peor rendimiento en acentos, dialectos o audio con ruido no representados en el entrenamiento.
- Riesgo de alucinación: no se han publicado análisis específicos; en ASR, el riesgo se manifiesta como transcripciones inventadas en segmentos de silencio o audio ininteligible.
- La lista completa de idiomas soportados no está disponible; solo se confirma multilingüe con chino explícito y evaluación en inglés (LibriSpeech) y chino (AISHELL-1).
- La longitud de contexto de audio no se especifica; no se indica la duración máxima de audio procesable por invocación.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original por si hubiera restricciones adicionales no reflejadas aquí.
- Los benchmarks publicados son del empaquetador (Moonbox) sobre un conjunto propio de 600 utterances; no sustituyen a una evaluación en el dominio de producción del usuario.
- El paquete depende de scripts Python propios (`pipeline.py`, `ortllm.py`) para el preprocesado y la decodificación, lo que añade una capa de mantenimiento frente a un uso directo con transformers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/MOSS-Transcribe-Diarize-ONNX
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Paper referenciado en los tags: arXiv:2601.01554 (no se dispone de URL verificada en la información proporcionada)
