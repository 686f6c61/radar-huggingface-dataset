# LlamaPal/sherpa-onnx-supertonic-3-tts-int8-2026-05-11

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un paquete de inferencia de texto a voz (TTS) en formato ONNX, preparado para su ejecución en dispositivos Android mediante el runtime sherpa-onnx. Se trata de una copia sin modificar de los ficheros publicados por el usuario csukuangfj2 en Hugging Face, que a su vez empaqueta el modelo Supertonic-3 desarrollado por Supertone Inc. El repositorio lo publica LlamaPal, una aplicación de chat con IA offline para Android, y sirve como voz sintética de su función de conversación hablada.

El modelo subyacente, Supertonic-3, es un sistema TTS de arquitectura modular dividida en cuatro componentes ONNX cuantizados a int8: un predictor de duración, un codificador de texto, un estimador de vectores (el núcleo generativo) y un vocoder. El paquete completo ocupa aproximadamente 0,1 GB en el repositorio, con ficheros que van desde los 4 MB del predictor de duración hasta los 78 MB del estimador de vectores. Está pensado para inferencia totalmente offline en el propio teléfono, sin conexión de red ni envío de datos a servidores.

Su relevancia radica en que demuestra un caso real de despliegue TTS de calidad en hardware móvil de gama media, con cuantización int8 y runtime ONNX optimizado para ARM. No obstante, la información pública disponible es muy limitada: no se documentan parámetros, contexto, idiomas soportados ni resultados de benchmarks, y la model card original reside en el repositorio de origen, no en este espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS modular con cuatro componentes ONNX (duration_predictor, text_encoder, vector_estimator, vocoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (todos los componentes ONNX) |
| Idiomas soportados | no disponible |
| Licencia | OpenRAIL-M |
| Formato de pesos | ONNX (int8), más tts.json, unicode_indexer.bin y voice.bin |

## Arquitectura y entrenamiento

La arquitectura es un pipeline TTS dividido en cuatro etapas encadenadas. El `duration_predictor.int8.onnx` (4 MB) estima la duración de cada unidad de texto; el `text_encoder.int8.onnx` (36 MB) convierte la secuencia de texto en representaciones latentes; el `vector_estimator.int8.onnx` (78 MB) es el componente de mayor tamaño y genera los vectores acústicos intermedios; y el `vocoder.int8.onnx` (26 MB) transforma esos vectores en la forma de onda de audio final. Los ficheros auxiliares incluyen `tts.json` (8 KB) con la configuración del pipeline, `unicode_indexer.bin` (262 KB) para el mapeo de caracteres y `voice.bin` (517 KB) con los embeddings de la voz.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas específicas del entrenamiento. Todos los componentes están cuantizados a int8, lo que reduce el tamaño y el coste computacional a cambio de una posible pérdida de fidelidad acústica. El runtime de destino es sherpa-onnx, una biblioteca C++ con bindings para Android, iOS y otras plataformas, optimizada para inferencia en CPU sin GPU.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con salida de audio en forma de onda.
- Ejecución completamente offline en el dispositivo, sin conexión de red ni envío de datos a servidores.
- Integración con el runtime sherpa-onnx, que permite su uso en Android, iOS, Linux, macOS y Windows.
- Voz única empaquetada en `voice.bin`; no se documenta soporte de clonación de voz ni de selección entre múltiples voces.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento multimodal.
- No se documentan capacidades multilingües; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Conversación por voz offline en Android: la aplicación LlamaPal usa este paquete como voz del asistente en modo chat hablado, sin conexión, de modo que el audio se sintetiza localmente y nada del texto del usuario sale del teléfono.
- Lectura de contenido en movilidad sin red: útil en entornos sin cobertura (transporte subterráneo, zonas rurales, vuelos) donde un TTS en la nube no está disponible.
- Asistentes de accesibilidad: lectura de pantalla y de notificaciones para usuarios con discapacidad visual en dispositivos Android de gama media, gracias al tamaño reducido del paquete (~0,1 GB) y a la cuantización int8.
- Aplicaciones de privacidad estricta: sectores como salud o legal donde el texto no puede salir del dispositivo; el pipeline completo se ejecuta en local.
- Integración en aplicaciones Android mediante sherpa-onnx: desarrolladores que ya usan esta biblioteca pueden añadir TTS sin depender de servicios externos de síntesis de voz.
- Prototipado de interfaces de voz en dispositivos embebidos: el formato ONNX y la cuantización int8 permiten desplegar el pipeline en hardware con recursos limitados, aunque el rendimiento real no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MOS (Mean Opinion Score), latencia, throughput ni comparaciones objetivas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el paquete está pensado para CPU móvil, no para GPU.
- Tamaño en disco: aproximadamente 0,1 GB para el conjunto de ficheros (4 + 36 + 78 + 26 MB de ONNX, más auxiliares).
- GPU recomendadas: no aplica; el runtime sherpa-onnx ejecuta en CPU. No se documenta aceleración por GPU.
- Cabe en cualquier dispositivo Android moderno con almacenamiento suficiente; no se especifican requisitos mínimos de RAM ni de CPU.
- Opciones de despliegue: sherpa-onnx (runtime principal), con bindings para Android, iOS, Linux, macOS y Windows. También podría cargarse con ONNX Runtime directamente, aunque no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supertonic-3 (este paquete) | TTS modular ONNX int8 | ~0,1 GB en total | no disponible | OpenRAIL-M | Hugging Face (espejo) |
| Piper (rhasspy/piper) | TTS ONNX para dispositivos | no disponible | no disponible | MIT (mayoritariamente) | Hugging Face, GitHub |
| Coqui TTS (XTTS) | TTS neuronal | no disponible | no disponible | MPL-2.0 / CPML según variante | GitHub, Hugging Face |
| VITS (variantes) | TTS end-to-end | no disponible | no disponible | varía según checkpoint | Hugging Face, GitHub |

No se dispone de datos de rendimiento comparables entre estos sistemas en la información proporcionada; la comparación se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- La información pública es escasa: no se documentan parámetros, idiomas, contexto ni benchmarks, lo que dificulta una evaluación técnica rigurosa.
- El repositorio es un espejo sin modificar; el mantenimiento y las actualizaciones dependen del repositorio de origen (csukuangfj2/sherpa-onnx-supertonic-3-tts-int8-2026-05-11) y, en última instancia, de Supertone Inc.
- La cuantización int8 puede degradar la calidad acústica respecto a los pesos originales en punto flotante; no se documenta el impacto medido.
- La licencia OpenRAIL-M incluye restricciones de uso (uso responsable de IA); es necesario revisar el texto completo en el fichero LICENSE antes de un uso comercial.
- No se documenta el comportamiento del modelo ante texto en idiomas distintos del soportado, ni la calidad de la síntesis en dominios especializados (números, siglas, nombres propios).
- Al ser un sistema TTS, no genera texto ni razona; no debe confundirse con un modelo de lenguaje.
- Riesgo de alucinación acústica (pronunciaciones incorrectas) no cuantificado; no hay evaluaciones publicadas.
- El rendimiento real en dispositivos concretos (latencia, consumo de batería) no está documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/sherpa-onnx-supertonic-3-tts-int8-2026-05-11
- Repositorio de origen (espejo): https://huggingface.co/csukuangfj2/sherpa-onnx-supertonic-3-tts-int8-2026-05-11
- Modelo original Supertonic-3: https://huggingface.co/Supertone/supertonic-3
- Aplicación LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
