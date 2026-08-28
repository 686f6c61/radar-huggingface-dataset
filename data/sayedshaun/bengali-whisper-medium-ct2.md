# SayedShaun/bengali-whisper-medium-ct2

## Resumen

El modelo `SayedShaun/bengali-whisper-medium-ct2` es una conversión al formato CTranslate2 con cuantización `int8` del checkpoint `SayedShaun/bengali-whisper-medium`, un fine-tuning del modelo Whisper medium específicamente entrenado para el reconocimiento automático de voz (ASR) en bengalí. Los pesos originales fueron desarrollados por Erdene-Ochir Tuguldur (tugstugi) y el equipo de Chimege, ganadores de la competición Bengali.AI Speech Recognition en Kaggle. Esta versión en CTranslate2 está lista para usarse con la librería `faster-whisper`, eliminando la necesidad de conversión manual y permitiendo una inferencia más rápida y ligera.

El modelo resuelve el problema de transcribir audio en bengalí a texto, un idioma con recursos limitados en el ámbito del ASR. La relevancia actual radica en que ofrece una solución eficiente y de código abierto (licencia Apache-2.0) para integrar transcripción en aplicaciones que requieran procesamiento en tiempo real o en entornos con recursos computacionales restringidos, gracias a la cuantización `int8` que reduce el uso de memoria y acelera la inferencia tanto en CPU como en GPU.

La arquitectura subyacente es la de Whisper medium (un transformer encoder-decoder con aproximadamente 769 millones de parámetros, aunque este dato no se especifica en la información proporcionada). La conversión a CTranslate2 no altera la arquitectura, solo optimiza los pesos para una ejecución más eficiente. El tamaño del repositorio es de 0.8 GB, lo que indica que el modelo cuantizado es manejable incluso en dispositivos con recursos moderados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper medium (encoder-decoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper medium usa ventanas de 30 segundos de audio) |
| Tipos de cuantizacion | int8, int8_float16 (para CUDA) |
| Idiomas soportados | Bengalí (bn) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (binarios .bin) |

## Arquitectura y entrenamiento

El modelo base `SayedShaun/bengali-whisper-medium` es un fine-tuning del modelo Whisper medium sobre datos de habla bengalí. El entrenamiento original fue realizado por el equipo ganador de la competición Bengali.AI Speech Recognition, utilizando un dataset específico para ese concurso. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO; la información disponible solo indica que se trata de un fine-tuning supervisado estándar.

La conversión a CTranslate2 se realizó mediante la herramienta `ct2-transformers-converter`, aplicando cuantización `int8` y copiando los archivos necesarios (`tokenizer.json`, `preprocessor_config.json`). Esta conversión mantiene la arquitectura original del transformer encoder-decoder, pero optimiza las operaciones para aprovechar al máximo el hardware, reduciendo el tamaño del modelo y acelerando la inferencia. No introduce ninguna innovación arquitectónica adicional; su valor reside en la eficiencia computacional que aporta al desplegarse con `faster-whisper`.

## Capacidades

- Reconocimiento automático de voz (ASR) para el idioma bengalí, transcribiendo audio a texto.
- Soporte para inferencia en CPU y GPU mediante `faster-whisper`, con opciones de cuantización `int8` (CPU) e `int8_float16` (CUDA).
- Filtro de actividad de voz (VAD) integrado a través de `faster-whisper`, que mejora la precisión al ignorar silencios y ruido de fondo.
- Producción de transcripciones sin puntuación; la puntuación puede añadirse mediante un módulo externo (`asr-punct-restore`).
- Compatible con el pipeline estándar de `faster-whisper` para segmentación temporal y salida de segmentos.
- No incluye capacidades de tool calling, razonamiento multi-paso, visión u otras tareas más allá del ASR.

## Casos de uso

- Transcripción de noticias y programas de radio en bengalí: el modelo puede procesar clips de audio de hasta 30 segundos (limitación de Whisper) y generar transcripciones precisas, útil para medios de comunicación que necesiten archivos de texto de sus emisiones.
- Subtitulado automático de vídeos en bengalí: al integrarse con `faster-whisper`, se pueden generar subtítulos en tiempo real o en lote para plataformas de vídeo, mejorando la accesibilidad.
- Transcripción de reuniones y entrevistas: en entornos corporativos o académicos, el modelo permite convertir grabaciones de reuniones en actas escritas, con la ventaja de poder ejecutarse en CPU sin necesidad de GPU dedicada.
- Asistencia a la atención al cliente: en centros de llamadas que operan en bengalí, el modelo puede transcribir conversaciones para análisis posterior, detección de problemas recurrentes o entrenamiento de agentes.
- Creación de corpus de texto a partir de audio: para investigadores que necesiten construir datasets de texto bengalí a gran escala, este modelo ofrece una transcripción fiable y de código abierto.
- Aplicaciones de accesibilidad: personas con discapacidad auditiva pueden beneficiarse de transcripciones en tiempo real de conversaciones o eventos, ejecutables en dispositivos con recursos limitados gracias a la cuantización `int8`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que se verificó la transcripción contra un clip de noticias bengalí y coincidió palabra por palabra con el pipeline de `transformers`, pero no se ofrecen métricas cuantitativas como WER (Word Error Rate) o comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de tamaño medio (Whisper medium) con cuantización `int8`, el uso de memoria es reducido. El tamaño del repositorio es de 0.8 GB, lo que sugiere que la inferencia puede ejecutarse en GPUs con al menos 2 GB de VRAM (para `int8_float16`), aunque no se proporciona un valor exacto.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1060 o superior) puede manejar el modelo con `compute_type="int8_float16"`. En CPU, funciona correctamente con `compute_type="int8"` sin necesidad de GPU.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y en CPUs multinúcleo, lo que lo hace adecuado para entornos de desarrollo y producción a pequeña escala.
- Opciones de despliegue: `faster-whisper` (que utiliza CTranslate2) es la opción principal. También puede integrarse con servidores de inferencia como Triton o mediante contenedores Docker, aunque no se mencionan explícitamente.
- Latencia y throughput: no se proporcionan datos específicos. Sin embargo, la cuantización `int8` suele ofrecer una aceleración de 2-4x en CPU y 1.5-2x en GPU en comparación con el modelo original en `float32`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SayedShaun/bengali-whisper-medium-ct2 (este) | Whisper medium + CTranslate2 int8 | ~0.8 GB (repo) | 30 s (Whisper) | Apache-2.0 | HuggingFace |
| SayedShaun/bengali-whisper-medium (base) | Whisper medium (float32) | ~1.5 GB (estimado) | 30 s (Whisper) | Apache-2.0 | HuggingFace |
| zarifmahir21/whisper-medium-bangla | Whisper medium (fine-tune) | ~1.5 GB (estimado) | 30 s (Whisper) | Apache-2.0 | HuggingFace |

La principal diferencia con el modelo base es la optimización: esta versión `ct2` es más rápida y ligera, ideal para despliegues en producción. Comparado con `zarifmahir21/whisper-medium-bangla`, ambos son fine-tunes de Whisper medium para bengalí, pero no se dispone de comparaciones de rendimiento directas. La ventaja de esta conversión es su compatibilidad inmediata con `faster-whisper` y su menor huella de memoria.

## Limitaciones y advertencias

- El modelo está especializado en bengalí y puede no generalizar bien a otros idiomas o acentos regionales fuera del dominio de entrenamiento.
- Produce transcripciones sin puntuación; es necesario un paso adicional de restauración de puntuación para textos legibles, lo que añade complejidad al pipeline.
- La ventana de contexto de Whisper es de 30 segundos de audio; audios más largos deben segmentarse, lo que puede afectar a la coherencia en transcripciones largas.
- No se han publicado métricas de error (WER) ni evaluaciones exhaustivas, por lo que su rendimiento en condiciones de ruido, música de fondo o habla solapada es desconocido.
- Al ser una conversión, no introduce mejoras en la precisión respecto al modelo base; solo optimiza la velocidad y el uso de recursos.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución al autor original (tugstugi y Chimege) según la model card.

## Enlaces

- [Modelo en HuggingFace (SayedShaun/bengali-whisper-medium-ct2)](https://huggingface.co/SayedShaun/bengali-whisper-medium-ct2)
- [Modelo base (SayedShaun/bengali-whisper-medium)](https://huggingface.co/SayedShaun/bengali-whisper-medium)
- [Repositorio faster-whisper (SYSTRAN)](https://github.com/SYSTRAN/faster-whisper)
- [Repositorio asr-punct-restore (restauración de puntuación)](https://github.com/sayedshaun/asr-punct-restore)
- [Repositorio bengali-whisper (herramientas auxiliares)](https://github.com/ehzawad/bengali-whisper)
