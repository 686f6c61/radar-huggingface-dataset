# RamaBashar22/nemotron-3.5-asr-streaming-0.6b-jordanian

## Resumen

El modelo `RamaBashar22/nemotron-3.5-asr-streaming-0.6b-jordanian` es un ajuste fino completo (full fine-tune) del modelo base de NVIDIA `nvidia/nemotron-3.5-asr-streaming-0.6b`, especializado en reconocimiento automático del habla (ASR) en streaming para el dialecto jordano del árabe. Desarrollado por RamaBashar22, este modelo resuelve el problema de la baja precisión del modelo base en habla dialectal espontánea, reduciendo el WER de 39,48% a 28,82% en un conjunto de prueba reservado de 3,32 horas, sin coste adicional de inferencia.

La arquitectura es un FastConformer-CacheAware-RNNT con condicionamiento por prompt de idioma, con 637 millones de parámetros (todos actualizados durante el ajuste). Soporta chunks de 80 a 1120 ms seleccionables en tiempo de ejecución, lo que permite ajustar la latencia y el rendimiento sin retener un segundo modelo. Está diseñado específicamente para agentes de voz, clasificación de intención, relleno de ranuras (slot filling) y detección de palabras clave, y no es adecuado para transcripción verbatim.

El modelo se distribuye bajo licencia openmdw-1.1, está implementado con la librería NeMo de NVIDIA y el checkpoint pesa 2,55 GB. Su relevancia actual radica en que ofrece una alternativa de ASR streaming en dialecto árabe jordano con un coste de inferencia idéntico al modelo base, lo que lo hace atractivo para despliegues en producción donde el dialecto y la latencia son críticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-CacheAware-RNNT con condicionamiento por prompt de idioma |
| Parametros totales | 637M (todos actualizados durante el ajuste fino) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR en streaming, sin contexto de texto; ventana de audio por chunks de 80–1120 ms) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión original, sin cuantizaciones publicadas) |
| Idiomas soportados | Árabe (dialecto jordano, `lang: ar`, prompt index 7) |
| Licencia | openmdw-1.1 |
| Formato de pesos | NeMo (`.nemo`, 2,55 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer-CacheAware-RNNT de NVIDIA. El encoder es un FastConformer con atención cache-aware, 24 capas, dimensión de modelo 1024 y submuestreo convolucional 8× (un frame equivale a 80 ms de audio). El decoder es un RNN-T con red de predicción de 640 unidades y un vocabulario SentencePiece de 13.087 piezas. El modelo incorpora condicionamiento por prompt de idioma, usando el índice 7 para árabe jordano.

El entrenamiento consistió en un ajuste fino completo sobre aproximadamente 10 horas de habla jordana, actualizando todos los parámetros. No se especifica el uso de RLHF ni DPO; se trata de un fine-tuning supervisado estándar. El modelo base de NVIDIA fue entrenado en 40 language-locales con datos multilingües, pero este ajuste se centra exclusivamente en el dialecto jordano. El decoder RNN-T es monótono, por lo que la salida se emite a medida que llega el audio, en lugar de esperar al final de la locución. El modelo produce puntuación y capitalización nativas.

## Capacidades

- Reconocimiento automático del habla en streaming para árabe jordano, con salida incremental a medida que llega el audio.
- Soporte de múltiples tamaños de chunk (80, 160, 320, 560 y 1120 ms) seleccionables en tiempo de ejecución, lo que permite ajustar latencia y throughput por petición.
- Puntuación y capitalización nativas en la transcripción.
- Eliminación de artefactos del modelo base: el ajuste reduce a cero las etiquetas de idioma espurias (`<xx-XX>`) y el texto en escritura no árabe, y reduce los hipótesis vacías de 100 a 8 en el conjunto de prueba.
- Adecuado para tareas de agente de voz: clasificación de intención, relleno de ranuras y detección de palabras clave.
- No es adecuado para transcripción verbatim (según el autor), por lo que no debe usarse en escenarios que requieran fidelidad literal.

## Casos de uso

- Agentes de voz para atención al cliente en Jordania: el modelo puede transcribir en streaming las consultas de los usuarios en dialecto jordano, alimentando un sistema de clasificación de intención y relleno de ranuras. Su baja latencia (RTF 0,107 a 560 ms) permite respuestas casi en tiempo real.
- Detección de palabras clave (keyword spotting) en centros de llamadas: al emitir hipótesis parciales de forma monótona, se puede activar alertas o derivar llamadas cuando se detectan términos específicos sin esperar al final de la frase.
- Asistentes virtuales en dialecto jordano: integrado en un pipeline de voz, el modelo transcribe comandos hablados y los envía a un motor de diálogo. Su capacidad de ajustar el chunk size permite priorizar latencia en interacciones conversacionales.
- Transcripción de reuniones o notas de voz en dialecto jordano: aunque no es verbatim, puede generar resúmenes o actas aproximadas cuando la fidelidad literal no es crítica.
- Sistemas de subtitulado en vivo para contenido en dialecto jordano: el streaming con chunks de 320–560 ms ofrece un equilibrio entre precisión y retardo para subtítulos en directo.
- Evaluación de calidad de llamadas en contact centers: el modelo puede transcribir conversaciones para análisis posterior, aprovechando su mejora del 27% relativo en WER frente al base y su coste de inferencia idéntico.

## Benchmarks y rendimiento

El autor reporta resultados en un conjunto de prueba reservado de 2.067 locuciones (3,32 horas), nunca usado en entrenamiento ni validación. La evaluación se realizó con el mismo helper, normalizador, `att_context_size = [56, 3]`, mismo batch y misma GPU (L40S) para base y ajustado.

**Resultados principales (normalizados, sin etiquetas de idioma):**

| Metrica | Base | Fine-tuned | Mejora absoluta | Mejora relativa |
|---|---|---|---|---|
| WER | 39,48% | 28,82% | −10,66 | −27,0% |
| CER | 17,00% | 11,39% | −5,61 | −33,0% |

**Resultados sin modificar (raw, tal como se decodifica):**

| Metrica | Base | Fine-tuned | Mejora absoluta |
|---|---|---|---|
| WER | 47,17% | 30,10% | −17,07 |
| CER | 22,21% | 11,81% | −10,40 |

**Rendimiento en streaming (L40S, 100 locuciones / 13,7 minutos):**

| `att_context_size` | Chunk | Base WER | FT WER | FT CER | Base RTF | FT RTF | Compute/chunk | Latencia extremo a extremo |
|---|---|---|---|---|---|---|---|---|
| `[56, 0]` | 80 ms | 47,27% | 36,08% | 15,08% | 0,605 | 0,598 | 47,6 ms | ~128 ms |
| `[56, 1]`* | 160 ms | 46,01% | 34,51% | 14,77% | 0,329 | 0,319 | 50,5 ms | ~211 ms |
| `[56, 3]` | 320 ms | 51,37% | 37,18% | 15,89% | 0,170 | 0,170 | 53,2 ms | ~373 ms |
| `[56, 6]` | 560 ms | 46,80% | 34,77% | 14,51% | 0,107 | 0,107 | 57,6 ms | ~618 ms |
| `[56, 13]` | 1120 ms | 47,69% | 33,67% | 13,42% | 0,062 | 0,063 | 65,2 ms | ~1185 ms |

\* No está en la lista de contextos declarada del checkpoint; el autor advierte que funciona bien pero está fuera de la distribución esperada y debe validarse antes de desplegar.

El RTF es idéntico entre base y ajustado en todos los tamaños de chunk, lo que confirma que el ajuste fino no añade coste de inferencia. En lote offline, se alcanza RTF 0,0031 con batch 8. No se han publicado comparaciones con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. El checkpoint pesa 2,55 GB en formato `.nemo`; con 637M de parámetros en FP16, el uso de VRAM en inferencia debería rondar 1,3–2 GB más overhead de activaciones, pero no se ha medido oficialmente.
- GPU recomendada: el autor utiliza una NVIDIA L40S (48 GB VRAM) para las mediciones. Con RTF 0,107 a 560 ms, una sola L40S puede servir aproximadamente 9 flujos simultáneos (un stream ocupa ~11% de la GPU).
- Compatibilidad con GPU de consumo: probablemente cabe en GPUs con 8 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070), pero no hay datos publicados de rendimiento en estas tarjetas.
- Opciones de despliegue: requiere NVIDIA NeMo (`nemo_toolkit`). Existe un proyecto de la comunidad (GitHub `tehtommeh/nemotron-asr-streaming`) que ofrece contenedores FastAPI para servidor de inferencia y una interfaz web ligera. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo ASR, no LLM.
- Latencia y throughput: RTF 0,107 a 560 ms en L40S (un stream), RTF 0,0031 en lote con batch 8. La latencia extremo a extremo varía de ~128 ms (chunk 80 ms) a ~1185 ms (chunk 1120 ms).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / Chunks | WER (jordano) | Licencia | Formato |
|---|---|---|---|---|---|
| **nemotron-3.5-asr-streaming-0.6b-jordanian** (este) | 637M | 80–1120 ms | 28,82% (normalizado) | openmdw-1.1 | NeMo |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | ~600M | 80–1120 ms | 39,48% (normalizado) | openmdw-1.1 | NeMo |
| nvidia/nemotron-speech-streaming-en-.6b | ~600M | no disponible | no aplica (inglés) | openmdw-1.1 | NeMo |

No se dispone de comparaciones con otros modelos ASR como Whisper o Parakeet en la información proporcionada. La comparación principal es contra el modelo base, que es el punto de partida natural. El ajuste fino ofrece una mejora del 27% relativo en WER y elimina artefactos de salida (etiquetas de idioma, escritura no árabe) sin coste adicional de inferencia.

## Limitaciones y advertencias

- No es adecuado para transcripción verbatim: el autor lo indica explícitamente. Para aplicaciones que requieran fidelidad literal (por ejemplo, transcripción legal o médica), este modelo no es recomendable.
- Entrenado con solo ~10 horas de habla jordana: el conjunto de datos es limitado, por lo que el rendimiento puede degradarse en variantes dialectales, acentos o condiciones acústicas no representadas.
- El chunk de 160 ms (`att_context_size = [56, 1]`) no está en la lista declarada de contextos del checkpoint; el autor advierte que funciona bien pero está fuera de la distribución esperada y debe validarse antes de desplegar en producción.
- El modelo base de NVIDIA reporta 12,55% WER en FLEURS (árabe MSA leído), pero este modelo se centra en dialecto jordano espontáneo, por lo que no es comparable directamente con métricas de MSA.
- Riesgo de alucinación: como todo ASR, puede generar texto plausible pero incorrecto, especialmente en habla solapada o con ruido de fondo. No se han publicado análisis de sesgos específicos.
- Licencia openmdw-1.1: es una licencia de código abierto de NVIDIA, pero conviene revisar sus términos exactos para uso comercial, especialmente en cuanto a atribución y redistribución.
- Dependencia de NeMo: el modelo solo se distribuye en formato `.nemo`, lo que limita su uso a entornos con NVIDIA NeMo instalado. No hay versiones en GGUF, ONNX ni safetensors publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RamaBashar22/nemotron-3.5-asr-streaming-0.6b-jordanian
- Modelo base de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Model card de NVIDIA NIM (perfiles del modelo base): https://build.nvidia.com/nvidia/nemotron-asr-streaming/modelcard
- README del modelo base en GitHub (espejo): https://github.com/weyan618/nemotron-asr/blob/main/nemotron-asr/nemotron-3.5-asr-streaming-0.6b/README.md
- Proyecto de despliegue self-hosted (contenedores FastAPI + web UI): https://github.com/tehtommeh/nemotron-asr-streaming/tree/main
