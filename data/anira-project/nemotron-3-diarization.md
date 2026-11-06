# anira-project/nemotron-3-diarization

## Resumen

Nemotron 3 Diarization es un modelo de diarización de hablantes (identificar quién habla y cuándo, hasta 8 hablantes) desarrollado originalmente por NVIDIA. Esta ficha concreta, publicada por el proyecto anira-project, no es el checkpoint original de NVIDIA sino un paquete de exportaciones optimizadas para inferencia en streaming: una versión ONNX cuantizada a 4 bits (espejo sin cambios del export de onnx-community), y exportaciones a ExecuTorch y Core ML generadas a partir del checkpoint de NVIDIA. El modelo se basa en una arquitectura Streaming Sortformer con caché de hablantes.

El problema que resuelve es la diarización en tiempo real con latencia baja: el modelo procesa fragmentos de audio de 90 ms con 4 frames de look-ahead (modo de baja latencia), manteniendo un estado externo (caché de hablantes y FIFO) que el llamador realimenta en cada paso. Esto lo hace adecuado para integrarse en pipelines de transcripción con atribución de hablante, como el motor de voz de anira foundation models.

La relevancia de esta publicación es práctica: ofrece artefactos listos para desplegar en CPU (XNNPACK), GPU y Neural Engine de Apple (Core ML) y runtime móvil (ExecuTorch), con verificación de paridad numérica frente a transformers y hashes SHA256 por fichero. El repositorio ocupa 1,3 GB y la licencia es OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (transformer con caché de hablantes y FIFO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de streaming: chunk de 90 ms, 9 frames de encoder puntuados + 4 de look-ahead; caché de 192 frames: 128 de caché + 64 de FIFO) |
| Tipos de cuantizacion | 4 bits (ONNX q4); float32 en ExecuTorch y Core ML |
| Idiomas soportados | no disponible (tarea independiente del idioma: diarización de hablantes) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | ONNX (q4), ExecuTorch (.pte), Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El modelo es un Streaming Sortformer, una variante de diarización diseñada para inferencia incremental. La entrada es un chunk de features mel de forma `[1, 104, 128]` (un chunk con 9 frames de encoder puntuados y 4 de look-ahead, 8 frames mel cada uno). El estado se mantiene fuera del grafo: una caché de hablantes y una FIFO de forma `[1, 192, 512]` (128 + 64 frames) que se realimentan en cada paso. La salida son logits por frame `[1, 1640, 8]` (hasta 8 hablantes), los embeddings del chunk `[1, 13, 512]` para la FIFO y un embedding de silencio `[512]`. La máscara de atención es int64 (int32 en Core ML); el padding frontal preserva las distancias rotatorias de los frames reales y se anula antes de la convolución de upsampling de 3 frames de la cabeza, de modo que un paso con padding equivale a uno sin él.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO: la model card de esta publicación se centra en el proceso de exportación y validación, no en el entrenamiento. La innovación técnica destacable es la exportación como un único paso de streaming con formas fijas y estado externo, con paridad numérica verificada frente a transformers (desviación máxima de probabilidad de hablante entre 3,3e-6 y 3,9e-6 en float32, y 3,0e-2 en ONNX q4) sobre una grabación de 25 s con varias voces y 34 chunks.

## Capacidades

- Diarización de hablantes en streaming: etiqueta qué hablante habla en cada frame, con soporte de hasta 8 hablantes.
- Detección de actividad de voz (pipeline declarado: voice-activity-detection).
- Inferencia incremental de baja latencia: chunks de 90 ms con 4 frames de look-ahead.
- Estado persistente externo: el llamador mantiene la caché de hablantes y la FIFO y las realimenta en cada paso.
- Ejecución multiplataforma: CPU (XNNPACK), GPU y Neural Engine de Apple (Core ML), runtime ExecuTorch.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo especializado de audio.
- Capacidades multilingües: no disponibles; la tarea de diarización es intrínsecamente independiente del idioma, pero no se documenta cobertura lingüística.

## Casos de uso

- Transcripción con atribución de hablante: integrar el modelo como motor de diarización junto a un ASR para etiquetar cada segmento transcrito con su hablante, usando el modo de baja latencia de 90 ms por chunk.
- Reuniones y actas automáticas: procesar audio de reuniones de varios participantes (hasta 8) y generar actas con turnos de palabra atribuidos, manteniendo la caché de hablantes entre chunks.
- Atención al cliente con análisis de agente y cliente: separar las voces en grabaciones de llamadas para medir tiempos de habla, solapamientos y calidad de la interacción.
- Subtitulado en directo: diarización en streaming con latencia baja para etiquetar hablantes en subtítulos en tiempo real.
- Aplicaciones móviles y de escritorio en Apple: desplegar el `.mlpackage` o el `.pte` de Core ML para diarización local en macOS/iOS con 14 ms por chunk en un Mac de la serie M.
- Investigación en lingüística de corpus: segmentar y etiquetar hablantes en grandes colecciones de audio antes de análisis posteriores, con artefactos ONNX ejecutables en CPU.
- Pipelines de transcripción de anira: usar el modelo como motor de voz dentro de anira foundation models, con el runtime ExecuTorch que anira distribuye (anira-project/backends v2.4.0).

## Benchmarks y rendimiento

Rendimiento de inferencia publicado en la model card (grabación de 25 s con varias voces, 34 chunks, cada formato con su propia caché realimentada, comparado con el forward en streaming de transformers):

| Formato | Precisión | Por chunk de 90 ms (Mac serie M) | Desviación máxima de probabilidad de hablante frente a transformers |
|---|---|---|---|
| ExecuTorch, CPU (XNNPACK) | float32 | 226 ms | 3,3e-6 |
| ExecuTorch, Core ML | float32 | 14 ms | 3,5e-6 |
| Core ML ML program (macOS 13, iOS 16) | float32 | 14 ms | 3,9e-6 |
| ONNX Runtime (q4 de este repositorio) | 4 bits | 190 ms | 3,0e-2 |

No se han publicado resultados de benchmarks de calidad de diarización (DER, tasa de error de diarización) ni comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Los artefactos float32 ocupan en torno a 397-399 MB (ExecuTorch y Core ML) y el ONNX q4 en torno a 83 MB (datos) más 360 KB (grafo).
- GPU recomendadas: no se especifican. Core ML aprovecha GPU y Neural Engine de Apple; el resto de formatos se validaron en CPU.
- Cabe en GPU de consumo: sí, por tamaño de artefacto (menos de 400 MB en float32), aunque no se documentan requisitos de memoria de trabajo en GPU.
- Opciones de despliegue: ONNX Runtime, ExecuTorch (CPU con XNNPACK y Core ML), Core ML nativo; integración con el runtime de anira (anira-project/backends v2.4.0).
- Latencia y throughput: 14 ms por chunk de 90 ms en Core ML (Mac serie M), 190 ms en ONNX q4 y 226 ms en ExecuTorch CPU. En CPU, una caché de 192 frames es más lenta que tiempo real con todos los formatos probados; Core ML ejecuta en GPU y Neural Engine.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / ventana | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anira-project/nemotron-3-diarization (esta ficha) | Streaming Sortformer | Chunk de 90 ms, caché de 192 frames | ONNX q4, ExecuTorch, Core ML | OpenMDW-1.1 | Hugging Face |
| nvidia/Nemotron-3-Diarization | Streaming Sortformer | No disponible en la información | Checkpoint original (transformers) | OpenMDW-1.1 (según esta ficha) | Hugging Face |
| onnx-community/Nemotron-3-Diarization-ONNX | Streaming Sortformer | No disponible en la información | ONNX | No disponible en la información | Hugging Face |

No se dispone de datos de otros modelos de diarización comparables en la información proporcionada; la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí hay riesgo de asignación incorrecta de hablantes en audio con solapamientos, ruido o voces similares; no se publican métricas de error de diarización.
- Límite de 8 hablantes simultáneos; no se documenta comportamiento con más.
- En CPU, la caché de 192 frames es más lenta que tiempo real con todos los formatos probados; para streaming en tiempo real en CPU puede requerirse una caché menor o hardware con aceleración.
- El estado (caché de hablantes y FIFO) debe gestionarse externamente; un manejo incorrecto del padding o de la máscara rompe la equivalencia con el modelo sin padding.
- Restricciones de licencia: OpenMDW-1.1; deben conservarse los avisos de origen (model card de onnx-community incluida como `UPSTREAM_MODEL_CARD.md`). Verificar los términos de OpenMDW-1.1 para uso comercial antes de producción.
- La cuantización q4 introduce una desviación mayor (3,0e-2) que los formatos float32 (en torno a 1e-6); evaluar el impacto en la precisión de la diarización antes de desplegarla.
- Verificar el SHA256 de cada fichero al descargar y fijar una revisión concreta, como recomienda el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anira-project/nemotron-3-diarization
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Export ONNX de origen: https://huggingface.co/onnx-community/Nemotron-3-Diarization-ONNX
- Repositorio anira: https://github.com/anira-project/anira
- Licencia OpenMDW-1.1: https://github.com/OpenMDW/OpenMDW
