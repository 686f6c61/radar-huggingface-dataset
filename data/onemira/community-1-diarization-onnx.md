# onemira/community-1-diarization-onnx

## Resumen

Community-1 ONNX es un conjunto de artefactos ONNX y NumPy que implementa la canalización de diarización de hablantes (speaker diarization) de pyannote `speaker-diarization-community-1`, empaquetada para su uso offline en Windows dentro del producto OneMira. No es un modelo entrenado por el autor del repositorio, sino un espejo byte a byte ("byte-preserving mirror") de exportaciones ONNX ya existentes, fijadas a commits concretos de sus repositorios de origen. El repositorio lo publica el usuario `onemira` bajo licencia CC BY 4.0, heredada del modelo original de pyannote.

La relevancia de este paquete es operativa: permite ejecutar diarización de hablantes sin conexión a Internet y sin dependencias de PyTorch en el entorno de escritorio, consumiendo directamente grafos ONNX más ficheros de pesos en formato NumPy para la parte de segmentación y extracción de embeddings. Está pensado para integrarse en el worker `mira-diarize --backend community`, no como un modelo de propósito general.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0.0 GB reportado (probablemente por los punteros LFS no materializados en la vista), y no se declaran idiomas, pipeline ni parámetros. Toda la caracterización técnica debe inferirse de la procedencia declarada (pyannote Community-1) y de los nombres de los artefactos listados en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de diarización de hablantes (segmentación neuronal + extracción de embeddings + agrupamiento); grafos ONNX exportados desde pyannote Community-1 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen grafos ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la diarización es mayormente independiente del idioma, pero no se declara) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`segmentation-community-1.onnx`, `embedding_encoder.onnx`) y NumPy (`.npy` para pesos y sesgos de la resnet de segmentación) |

## Arquitectura y entrenamiento

El paquete no entrena nada: replica la arquitectura del pipeline `pyannote/speaker-diarization-community-1`, que combina un modelo de segmentación (que produce activaciones de hablante por tramas) con un encoder de embeddings de hablante y un paso de agrupamiento para asignar etiquetas consistentes. En este repositorio, la segmentación se distribuye como un grafo ONNX (`segmentation-community-1.onnx`) procedente de `altunenes/speaker-diarization-community-1-onnx` en el commit `e2e09da94ae093a56cd5a60a09b138ae3da1959c`, y el encoder de embeddings junto con los pesos y sesgos de la primera capa resnet se distribuyen como `embedding_encoder.onnx`, `resnet_seg_1_weight.npy` y `resnet_seg_1_bias.npy`, procedentes de `welcomyou/pyannote-community-1-onnx-split` en el commit `cde44c2db938c8abb755853b9a87cb3179c47803`.

La innovación técnica del repositorio no está en el modelo sino en el empaquetado: se fijan los commits upstream, se registran tamaños y SHA-256 de cada artefacto en `SOURCE.json` y se incluye la atribución y el texto de la licencia en `NOTICE.txt`. Esto facilita la reproducibilidad y la auditoría de la cadena de suministro en un despliegue de escritorio. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF/DPO en la información disponible.

## Capacidades

- Diarización de hablantes: identificación de quién habla y cuándo en un audio, mediante segmentación y agrupamiento de embeddings.
- Ejecución offline: los artefactos ONNX permiten inferencia sin conexión y sin depender de PyTorch en tiempo de ejecución.
- Integración en producto de escritorio: diseñado para el worker `mira-diarize --backend community` en Windows.
- Verificación de integridad: `SOURCE.json` incluye tamaños y SHA-256 de cada artefacto para validación en cadena de suministro.
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes y capacidades multilingües: no disponibles; este paquete no es un modelo de lenguaje.

## Casos de uso

- Transcripción con etiquetado de hablante en local: se ejecuta el pipeline ONNX sobre el audio y se combinan los turnos de habla con la salida de un motor ASR para producir transcripciones tipo "Hablante 1: ...", sin enviar audio a la nube.
- Reuniones y actas automáticas en escritorio Windows: el worker `mira-diarize` segmenta la grabación y asigna etiquetas, que luego se alinean con la transcripción para generar actas con intervinientes identificados.
- Entornos con requisitos de privacidad o air-gapped: al no requerir conexión ni descarga de pesos en tiempo de ejecución, encaja en equipos sin acceso a Internet o con políticas estrictas de tratamiento de datos.
- Investigación en diarización: sirve como referencia reproducible de una exportación ONNX de Community-1, con commits y hashes fijados, para comparar implementaciones o validar portes a otros runtimes.
- Despliegue ligero sin stack de deep learning completo: al consumir ONNX y NumPy, se puede integrar en aplicaciones .NET/C++/Python con ONNX Runtime sin arrastrar PyTorch.
- Auditoría de cadena de suministro de modelos: los ficheros `SOURCE.json` y `NOTICE.txt` permiten verificar procedencia y licencia antes de incorporar el modelo a un producto comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al no declararse el tamaño de los grafos ni de los pesos, no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al ser ONNX, podría ejecutarse en CPU o en GPU vía ONNX Runtime, pero no se documenta.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) es el runtime natural; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de diarización.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| onemira/community-1-diarization-onnx | Pipeline de diarización (espejo ONNX) | ONNX + NumPy | CC BY 4.0 | no disponible | Hugging Face, 0 descargas |
| pyannote/speaker-diarization-community-1 | Pipeline de diarización original | PyTorch (pesos propios de pyannote) | CC BY 4.0 | no disponible | Hugging Face (requiere aceptar condiciones) |
| altunenes/speaker-diarization-community-1-onnx | Exportación ONNX de segmentación | ONNX | no disponible en la información | no disponible | Hugging Face |
| welcomyou/pyannote-community-1-onnx-split | Exportación ONNX dividida (encoder y resnet) | ONNX + NumPy | no disponible en la información | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo original: es un espejo de artefactos de terceros; la calidad y el comportamiento dependen de las exportaciones upstream fijadas.
- Sin datos de rendimiento: no hay benchmarks, métricas de DER (diarization error rate) ni evaluaciones publicadas en este repositorio.
- Idiomas no declarados: aunque la diarización suele ser relativamente independiente del idioma, no se especifica cobertura ni comportamiento en castellano.
- Riesgo de alucinación no aplica en el sentido de un LLM, pero sí existe riesgo de errores de asignación de hablante (confusión en solapamientos, voces similares, ruido de fondo) inherente a cualquier sistema de diarización.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio conservar y mostrar la atribución incluida en `NOTICE.txt` y citar a pyannote y a los exportadores upstream.
- Tamaño del repo reportado como 0.0 GB: probablemente los binarios están en LFS y no se han materializado en la vista; conviene verificar los tamaños reales en `SOURCE.json` antes de desplegar.
- Madurez muy baja: 0 descargas, 0 likes y creación en 2026; no hay evidencia de uso en producción ni de mantenimiento continuado.
- Dependencia de commits concretos: si los repositorios upstream cambian o se eliminan, la reproducibilidad futura no está garantizada más allá de los hashes registrados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/onemira/community-1-diarization-onnx
- Modelo original de pyannote: https://huggingface.co/pyannote/speaker-diarization-community-1
- Exportación ONNX de segmentación: https://huggingface.co/altunenes/speaker-diarization-community-1-onnx
- Exportación ONNX dividida (encoder y resnet): https://huggingface.co/welcomyou/pyannote-community-1-onnx-split
