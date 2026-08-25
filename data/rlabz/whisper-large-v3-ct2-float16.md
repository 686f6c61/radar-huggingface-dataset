# rlabz/whisper-large-v3-ct2-float16

## Resumen

Este repositorio contiene una conversión del modelo `openai/whisper-large-v3` al formato CTranslate2 con cuantización en float16, realizada por el usuario rlabz. El objetivo es acelerar la inferencia de transcripción de voz mediante el motor faster-whisper de SYSTRAN, manteniendo una calidad de salida prácticamente idéntica al modelo original, ya que no se alteran los pesos más allá de la conversión y cuantización estándar.

El modelo resuelve el problema del alto coste computacional de Whisper large-v3 en su implementación original con `transformers`. En el benchmark publicado por el autor, se obtiene una aceleración de 8,18 veces sobre una muestra de audio en suajili (39,44 segundos frente a 4,82 segundos), con la misma GPU y precisión float16. Está diseñado como un reemplazo directo de `openai/whisper-large-v3` para entornos de producción donde la velocidad de transcripción es crítica.

La arquitectura es un transformer encoder-decoder con 1,5 mil millones de parámetros (modelo base Whisper large-v3), que procesa ventanas de audio de hasta 30 segundos. El tamaño del repositorio es de 3,1 GB. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1,5 mil millones (modelo base `openai/whisper-large-v3`) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio (128 tokens) |
| Tipos de cuantizacion | float16 (esta conversion); el modelo base soporta int8, float16 y float32 |
| Idiomas soportados | Multilingue (98 idiomas en Whisper large-v3), incluido suajili |
| Licencia | CC-BY-4.0 |
| Formato de pesos | CTranslate2 (formato binario CT2) |

## Arquitectura y entrenamiento

El modelo base `openai/whisper-large-v3` es un transformer encoder-decoder entrenado con más de 5 millones de horas de datos de audio etiquetados, según el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). La arquitectura del encoder procesa mel-spectrogramas de 30 segundos y el decoder genera texto de forma autorregresiva.

Esta conversión no modifica los pesos del modelo original. Se realiza mediante la herramienta `ct2-transformers-converter` de CTranslate2, que transforma el modelo de PyTorch a un formato optimizado para inferencia. La cuantización a float16 reduce la huella de memoria y acelera los cálculos en GPU, sin cambios en la calidad de salida esperada. No se ha aplicado ningún proceso de ajuste fino, RLHF ni DPO sobre este modelo.

## Capacidades

- Transcripción automática de voz (ASR) en 98 idiomas, incluido el suajili y otros idiomas africanos de bajos recursos.
- Traducción de voz a texto en inglés (speech-to-text translation).
- Reconocimiento robusto frente a ruido de fondo, acentos y terminología técnica, según las especificaciones del modelo base.
- Soporte de decodificación autorregresiva con beam search y sampling.
- Integración con el motor de inferencia faster-whisper de SYSTRAN, que ofrece paralelización en CPU y GPU.
- Capacidad de detectar automáticamente el idioma del audio y su probabilidad.
- Generación de segmentos con timestamps (inicio y fin) para cada fragmento transcrito.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones de larga duración dividiéndolas en ventanas de 30 segundos, generando transcripciones con timestamps para facilitar la navegación.
- Atención al cliente automatizada: integrado en un servicio de transcripción en tiempo real para llamadas telefónicas, permite extraer el contenido de las conversaciones y alimentar sistemas de análisis o generación de resúmenes.
- Generación de subtítulos para vídeo: con la salida de segmentos temporizados, se pueden crear subtítulos en 98 idiomas para plataformas de vídeo, reduciendo el tiempo de postproducción.
- Transcripción de contenido médico o jurídico: la alta precisión en condiciones de ruido y acentos lo hace adecuado para dictados profesionales, aunque se recomienda revisión humana.
- Análisis de contenido en idiomas africanos: el modelo está específicamente orientado a suajili y otros idiomas de baja representación, permitiendo la digitalización de archivos de audio en estas lenguas.
- Asistentes de voz y dispositivos embebidos: gracias a la aceleración de faster-whisper, el modelo puede ejecutarse en tiempo real en hardware con GPU, permitiendo interacción por voz en aplicaciones de IoT o asistentes virtuales.

## Benchmarks y rendimiento

El autor publica un único benchmark comparativo entre el modelo original (`transformers`, float16) y esta conversión (CTranslate2, float16) sobre una muestra de audio en suajili, con la misma GPU y precisión:

| Modelo | Tiempo de transcripción |
|---|---|
| Whisper original (`transformers`, float16) | 39,44 s |
| **Este modelo (CT2 float16)** | **4,82 s** |
| **Speedup** | **8,18x** |

No se han publicado resultados de benchmarks de precisión (como MMLU, HumanEval o WER) en la información disponible. El autor indica que la calidad de salida se espera que sea prácticamente idéntica al modelo original, ya que solo cambia el motor de inferencia y la precisión numérica.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 3,1 GB, por lo que se necesita un mínimo de 4 GB de VRAM para inferencia en float16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluyendo tarjetas de consumo como RTX 3060, RTX 4090, o GPUs de centro de datos como A100 y H100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en tarjetas gráficas de gama media con 6-8 GB de VRAM.
- Opciones de despliegue: el modelo se usa con la librería `faster-whisper` de SYSTRAN, que soporta tanto CPU como GPU. También puede integrarse en servicios como vLLM (para ASR) o en pipelines personalizados con CTranslate2.
- Latencia y throughput: el benchmark publicado indica un tiempo de 4,82 s para un clip de audio no especificado, lo que sugiere un throughput de aproximadamente 6-7 veces en tiempo real. El rendimiento real varía con la longitud del audio, la GPU y la configuración de batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motor de inferencia |
|---|---|---|---|---|---|
| `rlabz/whisper-large-v3-ct2-float16` (este) | 1,5B | 30 s | float16 | CC-BY-4.0 | faster-whisper |
| `openai/whisper-large-v3` | 1,5B | 30 s | float16, float32, int8 | MIT | transformers |
| `ctranslate2-4you/whisper-large-v3-ct2-float32` | 1,5B | 30 s | float32 | MIT (base) | faster-whisper |
| `distil-whisper/distil-large-v3` | 756M | 30 s | float16, int8 | MIT | faster-whisper |

La principal ventaja de este modelo frente al original es la aceleración de 8,18x sin pérdida de calidad. Frente a la versión float32 de CTranslate2, la versión float16 reduce el uso de memoria y mejora la velocidad, a costa de una pérdida de precisión mínima. La comparación con distil-whisper (modelo destilado) muestra que este último tiene la mitad de parámetros y puede ser aún más rápido, pero con una calidad ligeramente inferior.

## Limitaciones y advertencias

- La cuantización float16 requiere una GPU; en entornos solo con CPU se recomienda usar la versión int8.
- El benchmark de velocidad se basa en una única muestra de audio y una única configuración de hardware; el speedup real variará con la longitud del audio, la GPU y los ajustes de batch.
- No se han realizado pruebas de precisión (WER) sobre conjuntos de datos estándar en esta conversión, por lo que se asume la calidad del modelo base, pero no se ha verificado de forma independiente.
- El modelo base Whisper large-v3 tiene una ventana de contexto limitada a 30 segundos de audio por segmento, lo que puede requerir la división de grabaciones largas.
- La licencia CC-BY-4.0 exige atribución a OpenAI's Whisper y a SYSTRAN's faster-whisper cuando se reutilice el modelo.
- El modelo puede presentar sesgos en la transcripción de acentos no representados en sus datos de entrenamiento, especialmente en idiomas con pocos recursos.
- No se ha realizado ningún ajuste fino específico para dominios técnicos o médicos; la precisión en terminología especializada puede ser inferior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rlabz/whisper-large-v3-ct2-float16
- Modelo base `openai/whisper-large-v3`: https://huggingface.co/openai/whisper-large-v3
- Conversión float32 similar: https://huggingface.co/ctranslate2-4you/whisper-large-v3-ct2-float32
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Repositorio del paper de Whisper: https://github.com/openai/whisper
- Colab con el benchmark: https://colab.research.google.com/drive/1TLOg8RZryMxhLHKufcgjavxE57ZxLq_3?usp=sharing
