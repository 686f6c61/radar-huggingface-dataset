# DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-fp32-c112-cpu

## Resumen

Este repositorio contiene una exportación a ONNX en precisión FP32 del modelo NVIDIA Nemotron 3.5 ASR Streaming de 0.6B parámetros, preparada específicamente para inferencia en CPU mediante ONNX Runtime GenAI. La conversión ha sido realizada por el usuario DimQ1 utilizando Microsoft Olive, e incluye los tres componentes principales del modelo (encoder, decoder y joint) junto con un VAD Silero y los ficheros de configuración necesarios para su ejecución.

El modelo original, desarrollado por NVIDIA, es un sistema de reconocimiento automático del habla (ASR) en streaming que transcribe audio a texto con soporte nativo de puntuación y capitalización. Esta versión concreta está limitada a los idiomas ruso e inglés, aunque el modelo base de NVIDIA soporta hasta 40 locales. La elección de FP32 sin cuantización prioriza la máxima precisión frente a la eficiencia, lo que se refleja en un tamaño de repositorio de 2,6 GB y en un rendimiento orientado a CPU.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue ligero y sin dependencias de GPU para tareas de transcripción en tiempo real, con una ventana de contexto de 112 frames y un left_context de 56 frames codificados. Los resultados de WER publicados en la model card, medidos sobre Common Voice 17, muestran un 16,71% global (12,52% en ruso y 20,55% en inglés), lo que la sitúa como una opción viable para aplicaciones de transcripción en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware encoder + RNN-T LSTM prediction network + transducer joint |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | ventana de 112 frames (c112), left_context de 56 frames codificados |
| Tipos de cuantizacion | FP32 (sin cuantizacion) |
| Idiomas soportados | ruso (ru), ingles (en) en esta version; el modelo original de NVIDIA soporta 40 locales |
| Licencia | other (ver licencia original de NVIDIA Nemotron) |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joint.onnx) con datos externos |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura FastConformer-RNNT, que combina un encoder basado en FastConformer con una red de predicción LSTM y una capa conjunta (joint) típica de los modelos transducer. El encoder es "cache-aware", lo que significa que está optimizado para streaming al mantener un caché de estados que evita reprocesar frames anteriores. El decodificador RNN-T permite una decodificación incremental adecuada para baja latencia.

Los detalles exactos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El modelo original de NVIDIA fue entrenado para transcripción multilingüe con salida nativa de puntuación y capitalización, sin necesidad de post-procesamiento. Esta exportación ONNX mantiene las mismas capacidades pero restringidas a ruso e inglés, y ha sido convertida con Microsoft Olive para ejecutarse en CPU con ONNX Runtime GenAI.

## Capacidades

- Transcripción de voz a texto en streaming con baja latencia, procesando audio en ventanas de 112 frames.
- Soporte nativo de puntuación y capitalización en la salida, sin post-procesamiento adicional.
- Reconocimiento bilingüe ruso-inglés en esta versión; el modelo original de NVIDIA soporta 40 locales.
- Incluye un modelo Silero VAD (Voice Activity Detection) en formato ONNX para detectar segmentos de habla.
- Ejecución exclusiva en CPU con precisión FP32, sin necesidad de GPU.
- Compatible con ONNX Runtime GenAI, lo que permite integración en aplicaciones Python y C++.
- Diseñado para streaming, aunque también puede utilizarse en modo batch según la configuración.

## Casos de uso

- Transcripción de reuniones en tiempo real: el modelo puede procesar audio de micrófono en streaming y generar subtítulos o actas con puntuación automática, gracias a su baja latencia y a la ventana de 112 frames.
- Subtitulado automático de vídeos en ruso e inglés: al ejecutarse en CPU, puede integrarse en pipelines de edición de vídeo sin requerir hardware especializado.
- Atención al cliente automatizada: transcripción de llamadas telefónicas en tiempo real para análisis posterior, con detección de actividad de voz mediante el VAD incluido.
- Asistentes de voz embebidos: despliegue en dispositivos con CPU limitada (por ejemplo, Raspberry Pi o mini-PCs) para comandos de voz en ruso o inglés.
- Archivado de contenido audiovisual: transcripción de archivos de audio pre-grabados en modo batch, aprovechando la precisión FP32 para obtener mejores resultados que versiones cuantizadas.
- Investigación académica en ASR: uso como modelo de referencia para comparar arquitecturas FastConformer-RNNT en CPU, gracias a su implementación ONNX limpia y reproducible.

## Benchmarks y rendimiento

La model card del repositorio reporta los siguientes resultados de WER (Word Error Rate) medidos sobre Common Voice 17, con una muestra de 250 audios en ruso y 250 en inglés, ejecutados en CPU:

| Metrica | Valor |
|---|---|
| WER global | 16,71% |
| WER ruso | 12,52% |
| WER ingles | 20,55% |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la información disponible, ya que se trata de un modelo de ASR y no de un modelo de lenguaje general. Tampoco se proporcionan comparaciones directas con otros sistemas ASR en esta fuente.

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo está diseñado para ejecución en CPU.
- Memoria RAM: el repositorio ocupa 2,6 GB en disco; se recomienda al menos 4 GB de RAM libre para cargar los pesos FP32.
- CPU recomendada: cualquier procesador x86_64 moderno con soporte AVX2; el rendimiento escalará con el número de núcleos.
- GPU: no necesaria; el modelo utiliza exclusivamente el execution provider de CPU de ONNX Runtime.
- Opciones de despliegue: ONNX Runtime GenAI (Python o C++), integrable en aplicaciones propias; no se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos numéricos en la información disponible; la latencia dependerá de la CPU y de la longitud del audio procesado.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos ASR en la información proporcionada. Como referencia cualitativa, el modelo original de NVIDIA Nemotron 3.5 ASR Streaming 0.6B compite con sistemas como Whisper (de OpenAI) o los modelos de SpeechBrain, pero esta versión ONNX FP32 está específicamente optimizada para CPU y para los idiomas ruso e inglés. No se pueden establecer comparaciones numéricas sin datos de benchmarks adicionales.

## Limitaciones y advertencias

- La licencia es "other" y debe consultarse la licencia original de NVIDIA Nemotron antes de cualquier uso comercial; no se especifican los términos exactos en este repositorio.
- Esta versión solo soporta ruso e inglés, a pesar de que el modelo base de NVIDIA cubre 40 locales; si se necesita otro idioma, habrá que buscar otra exportación.
- El uso de FP32 sin cuantización implica un mayor consumo de memoria y menor velocidad en comparación con versiones cuantizadas (por ejemplo, FP16 o INT8), aunque ofrece mejor precisión.
- El WER en inglés (20,55%) es notablemente peor que en ruso (12,52%), lo que sugiere un sesgo hacia el ruso en esta configuración.
- Al ser un modelo de ASR, puede presentar alucinaciones en la transcripción, especialmente con audio ruidoso o de baja calidad; se recomienda validar las salidas en entornos críticos.
- No se incluyen instrucciones detalladas de uso en la model card; el usuario debe recurrir a la documentación de ONNX Runtime GenAI y al repositorio original de NVIDIA para conocer la API de inferencia.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente o poco validada por la comunidad; se recomienda probar el modelo antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-fp32-c112-cpu
- Variante con opset 24: https://huggingface.co/DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-fp32-opset24-c112-cpu
- README del modelo original en GitHub: https://github.com/weyan618/nemotron-asr/blob/main/nemotron-asr/nemotron-3.5-asr-streaming-0.6b/README.md
- Guía de exportación ONNX (GitHub): https://github.com/codavidgarcia/nemotron-3.5-asr-streaming-onnx/blob/main/README.md
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-asr-streaming/modelcard
