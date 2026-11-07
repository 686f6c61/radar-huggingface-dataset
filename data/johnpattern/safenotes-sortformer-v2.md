# johnpattern/safenotes-sortformer-v2

## Resumen

`johnpattern/safenotes-sortformer-v2` es una conversión a ONNX del modelo de diarización de hablantes en streaming **Streaming Sortformer 4spk v2** de NVIDIA, publicada por el desarrollador independiente Safenotes (johnpattern). No se trata de un modelo entrenado desde cero, sino de una exportación de formato del checkpoint original `.nemo` de NVIDIA (revisión `84edd514b8ef68004c10086918cd62f2148cbd59`) mediante `torch.onnx` con opset 18 y precisión fp32, que expone el estado de streaming (chunk, caché de hablantes y FIFO) como entradas y salidas explícitas del grafo. El objetivo es ejecutar la diarización en hardware Intel a través de ONNX Runtime o sherpa-onnx, algo que el ecosistema NeMo nativo dificulta.

El modelo resuelve el problema de identificar y etiquetar hasta cuatro hablantes en tiempo real sobre un flujo de audio continuo, manteniendo etiquetas consistentes a medida que los participantes entran y salen de la conversación. Es relevante porque permite integrar diarización local, sin envío de audio a la nube, en aplicaciones de notas de reuniones: el propio autor lo usa en Safenotes, una aplicación de transcripción de reuniones que corre íntegramente en el PC del usuario.

La ficha describe tanto el modelo subyacente de NVIDIA (arquitectura Sortformer, streaming, hasta 4 hablantes) como los detalles concretos de esta conversión ONNX (tres ficheros, 492 MB, paridad verificada con NeMo 3.0.0). Cabe advertir que se trata de un repositorio con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks propios publicados y sin garantías del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sortformer (transformer de diarización en streaming, derivado de NVIDIA NeMo); exportado a ONNX opset 18 en fp32 |
| Parámetros totales | no disponible (el fichero ONNX ocupa 492.245.687 bytes en fp32) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por chunks con estado de streaming: chunk, caché de hablantes y FIFO) |
| Tipos de cuantización | no disponible en este repositorio (solo fp32); el modelo base podría cuantizarse, pero no se documenta |
| Idiomas soportados | no disponible (la diarización es independiente del idioma en gran medida, pero no se documenta) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`own/sortformer-v2.onnx`) + arrays NumPy del preprocesador (`mel_fb.npy`, `mel_window.npy`) |
| Modelo base | `nvidia/diar_streaming_sortformer_4spk-v2` (revisión `84edd514b8ef68004c10086918cd62f2148cbd59`) |
| Número máximo de hablantes | 4 |
| Tamaño del repositorio | 0,5 GB (492.379.127 bytes, 3 ficheros) |
| Librería | ONNX / ONNX Runtime / sherpa-onnx |

## Arquitectura y entrenamiento

El modelo subyacente es **Streaming Sortformer**, un modelo de diarización de hablantes desarrollado por NVIDIA dentro del framework NeMo y publicado en agosto de 2025. La arquitectura Sortformer asigna etiquetas de hablante de forma consistente a lo largo de un flujo de audio, resolviendo el problema clásico de la diarización en línea: mantener la identidad de cada participante cuando varios hablan de forma intercalada. La variante `4spk-v2` está limitada a un máximo de cuatro hablantes simultáneos.

La conversión de Safenotes no implica reentrenamiento: se exporta el checkpoint `.nemo` original con `torch.onnx` (opset 18, fp32) y se externaliza el estado de streaming como entradas y salidas explícitas, replicando el comportamiento de `forward_streaming` de NeMo. Además se extraen del preprocesador propio del modelo el banco de filtros mel (`mel_fb.npy`, 131.712 bytes) y la ventana (`mel_window.npy`, 1.728 bytes), de modo que el pipeline completo de características puede reproducirse fuera de NeMo. El autor declara paridad con NeMo 3.0.0 `forward_streaming` con **0 frames invertidos** en la comparación.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste fino con RLHF o DPO; esos datos corresponden a la model card de NVIDIA, no incluida en la información proporcionada. Tampoco se documenta ninguna innovación adicional más allá del propio diseño streaming de Sortformer y de la externalización del estado en la exportación ONNX.

## Capacidades

- **Diarización de hablantes en streaming**: identifica y etiqueta hasta 4 hablantes sobre audio continuo, con etiquetas consistentes a medida que los participantes intervienen.
- **Procesamiento por chunks con estado**: mantiene caché de hablantes y cola FIFO entre fragmentos, lo que permite inferencia incremental sin reprocesar todo el audio.
- **Preprocesador incluido**: incorpora el banco de filtros mel y la ventana del modelo original, lo que facilita reproducir la extracción de características fuera de NeMo.
- **Ejecución en CPU**: pensado para ONNX Runtime en CPU (uso declarado por Safenotes), sin necesidad de GPU.
- **Compatibilidad con sherpa-onnx**: el formato ONNX permite integrarlo en el ecosistema sherpa-onnx.
- **Ejecución local y privada**: el audio no sale del dispositivo del usuario en el flujo de Safenotes.
- **No soporta**: generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües de generación; es exclusivamente un modelo acústico de diarización.

## Casos de uso

- **Notas de reuniones en local**: integrar el modelo en una aplicación de transcripción de reuniones (como Safenotes) para etiquetar quién habla en cada momento, ejecutando la inferencia en CPU con ONNX Runtime y sin enviar audio a la nube.
- **Transcripción con etiquetas de hablante**: combinar la salida de diarización con un modelo ASR (por ejemplo, la familia Parakeet de NVIDIA) para producir transcripciones tipo "Hablante 1: …", útil en actas y resúmenes automáticos.
- **Análisis de reuniones y métricas de participación**: calcular tiempos de habla por participante, número de turnos e interrupciones en llamadas de hasta cuatro personas, a partir de las etiquetas por frame.
- **Despliegue en equipos sin GPU**: al ser ONNX fp32 y ejecutarse en CPU, encaja en portátiles y estaciones de trabajo Intel donde no hay acelerador dedicado, a costa de mayor latencia que en GPU.
- **Integración en pipelines sherpa-onnx**: usar el modelo dentro de aplicaciones de voz ya construidas sobre sherpa-onnx que necesiten diarización en tiempo real.
- **Prototipado de diarización en streaming**: servir como referencia para equipos que quieran validar el comportamiento de Sortformer sin instalar el stack completo de NeMo, gracias a la paridad declarada con `forward_streaming`.
- **Auditoría de llamadas con requisitos de privacidad**: procesar grabaciones sensibles en el propio dispositivo, verificando la integridad de los ficheros mediante los hashes sha256 publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente declara una verificación de paridad con NeMo 3.0.0 `forward_streaming` con 0 frames invertidos; no se aportan métricas de DER (Diarization Error Rate), latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada**: no aplica para el uso declarado; el modelo se ejecuta en CPU con ONNX Runtime. En GPU, el fichero ONNX fp32 de 492 MB requeriría aproximadamente 0,5 GB de VRAM solo para los pesos, más memoria para activaciones y estado de streaming (cifra no documentada).
- **GPU recomendadas**: no disponibles; el autor no documenta ejecución en GPU. Por tamaño, cabría en cualquier GPU consumer con al menos 2 GB de VRAM, pero no se ha validado.
- **CPU**: es el objetivo principal (ONNX Runtime en CPU, hardware Intel según el autor). No se especifican núcleos ni modelos de CPU concretos.
- **¿Cabe en GPU consumer?**: por tamaño de pesos, sí (menos de 0,5 GB en fp32), aunque no hay validación publicada.
- **Opciones de despliegue**: ONNX Runtime, sherpa-onnx. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de diarización).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Hablantes máx. | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `johnpattern/safenotes-sortformer-v2` (esta ficha) | Sortformer streaming, export ONNX | 4 | ONNX fp32 | CC-BY-4.0 | Hugging Face, 0 descargas |
| `nvidia/diar_streaming_sortformer_4spk-v2` | Sortformer streaming original | 4 | NeMo (.nemo) | CC-BY-4.0 | Hugging Face (NVIDIA) |
| `nvidia/diar_streaming_sortformer_4spk-v2.1` | Sortformer streaming, versión posterior | 4 | NeMo (.nemo) | NVIDIA Open Model License | Hugging Face (NVIDIA) |
| Sortformer dentro de la colección Parakeet 1.1b RNNT (NGC) | Componente de diarización del stack NVIDIA | no disponible | NeMo | no disponible en la información | NVIDIA NGC |

La diferencia principal frente al modelo original de NVIDIA es el formato (ONNX frente a `.nemo`) y el público objetivo (ejecución en CPU/Intel y sherpa-onnx frente al stack NeMo). La versión v2.1 del modelo de NVIDIA no se usa en esta conversión y cambia de licencia a NVIDIA Open Model License, lo que conviene tener en cuenta al elegir variante.

## Limitaciones y advertencias

- **Máximo de 4 hablantes**: no admite reuniones con más participantes; los hablantes adicionales no se etiquetarán correctamente.
- **Sin benchmarks publicados**: no hay métricas de DER ni comparaciones objetivas en la información disponible; la única validación es la paridad de frames con NeMo.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.
- **Conversión no oficial**: el autor declara explícitamente que no es un lanzamiento oficial de NVIDIA y que los autores originales no lo respaldan.
- **Licencia CC-BY-4.0**: permite uso comercial con atribución; es necesario citar a los autores originales y conservar el aviso de licencia. La versión v2.1 del modelo base tiene otra licencia y no debe confundirse.
- **Sin garantías**: el autor distribuye el modelo "as is", sin garantía de idoneidad ni exactitud de la salida.
- **Solo fp32**: no se ofrecen variantes cuantizadas en este repositorio, lo que limita optimizaciones de latencia y memoria.
- **Riesgo de confusión de hablantes**: inherente a la diarización en streaming con solapamientos y cambios de turno rápidos; no cuantificado en esta información.
- **Idiomas no documentados**: no se especifica el rendimiento por idioma ni la composición lingüística del entrenamiento.
- **Integridad de ficheros**: el uso en producción debe verificar los hashes sha256 publicados antes de cargar los ficheros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnpattern/safenotes-sortformer-v2
- Modelo base (NVIDIA): https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2
- Revisión concreta del modelo base: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2/tree/84edd514b8ef68004c10086918cd62f2148cbd59
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Artículo sobre Streaming Sortformer (Learn AI): https://ai.miraheze.org/wiki/Streaming_Sortformer
- Colección Multilingual Parakeet 1.1b RNNT (NVIDIA NGC): https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-1-1b-rnnt-multilingual
