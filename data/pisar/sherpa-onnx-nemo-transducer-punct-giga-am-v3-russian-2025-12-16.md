# pisar/sherpa-onnx-nemo-transducer-punct-giga-am-v3-russian-2025-12-16

## Resumen

Este repositorio contiene una conversión a formato ONNX del modelo GigaAM v3 de reconocimiento automático de voz (ASR) en ruso, empaquetada para su uso con sherpa-onnx. El modelo original lo desarrolla el equipo de Sber (salute-developers) y aquí aparece publicado por el usuario `pisar` como artefacto derivado, con fecha de creación de noviembre de 2026. Se trata de un modelo de tipo NeMo transducer con puntuación, pensado para transcripción de audio en ruso con segmentación y puntuación integradas.

El interés práctico del repositorio es que permite desplegar un ASR ruso de calidad dentro del ecosistema sherpa-onnx, lo que facilita su integración en aplicaciones en C++, Python, Android, iOS o WebAssembly sin depender de frameworks de entrenamiento pesados. El tamaño del repositorio es de aproximadamente 0,2 GB, coherente con un modelo acústico de tamaño moderado más los artefactos de tokenizador y configuración.

La información pública disponible es muy escasa: no hay model card detallada, ni pipeline declarado, ni licencia especificada en el repositorio, ni métricas de benchmarks. La model card se limita a indicar que el contenido proviene de la conversión de los modelos de GigaAM al formato sherpa-onnx y remite a la licencia del proyecto original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo transducer (RNN-T) con puntuación, convertido a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ruso (según la model card) |
| Licencia | no disponible en el repositorio; la model card remite a la licencia de GigaAM en GitHub |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transducer de NeMo (RNN-T), un modelo de reconocimiento de voz que combina un encoder acústico, un predictor y una red de unión para alinear secuencias de audio con tokens de texto. En esta variante se añade puntuación, de modo que la salida incluye signos de puntuación además de la transcripción. El artefacto publicado es una conversión a ONNX del modelo GigaAM v3 original, preparada para el runtime sherpa-onnx, no un entrenamiento nuevo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas de esta conversión más allá del propio proceso de exportación a ONNX y de la integración con sherpa-onnx.

## Capacidades

- Reconocimiento automático de voz en ruso a partir de audio.
- Transcripción con puntuación integrada, lo que reduce la necesidad de un postprocesado separado.
- Segmentación y alineación mediante arquitectura transducer, adecuada para audio continuo.
- Ejecución en el runtime sherpa-onnx, con soporte multiplataforma (C++, Python, Android, iOS, WebAssembly).
- No se documentan capacidades de traducción, diarización, detección de idioma ni reconocimiento multilingüe.
- No se documenta soporte de tool calling ni de agentes, por tratarse de un modelo ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en ruso: el modelo convierte audio en texto con puntuación, lo que facilita la lectura y el archivado de actas sin un paso adicional de formateo.
- Subtitulado automático de vídeo en ruso: la salida con puntuación y la segmentación del transducer permiten generar subtítulos con cortes razonables para plataformas de vídeo.
- Atención al cliente con voz: integrado en un pipeline de telefonía o VoIP, transcribe las llamadas en ruso para su análisis posterior o para alimentar un sistema de respuesta.
- Indexación y búsqueda de archivos de audio: la transcripción permite construir índices de texto sobre grabaciones y habilitar búsqueda por contenido.
- Aplicaciones móviles y de escritorio offline: al estar en ONNX y ser compatible con sherpa-onnx, puede embeberse en apps Android, iOS o de escritorio que requieran transcripción local sin conexión.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva en entornos de habla rusa.
- Análisis de contenido audiovisual a escala: procesamiento por lotes de archivos de audio para extraer texto y alimentar sistemas de moderación o analítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa unos 0,2 GB, por lo que el modelo cabe holgadamente en GPUs de consumo y probablemente también en CPU.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de memoria libre; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño del artefacto (0,2 GB); no se detallan requisitos exactos.
- Opciones de despliegue: sherpa-onnx (runtime principal); no se documentan otras opciones como vLLM, llama.cpp o TGI, que además no aplican a un modelo ASR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (GigaAM v3 transducer + puntuación, ONNX) | ASR transducer | Ruso | ONNX | no disponible (remite a GigaAM) | Hugging Face |
| GigaAM original (salute-developers) | ASR | Ruso | Pesos originales | Ver licencia en GitHub de GigaAM | GitHub |
| Whisper (OpenAI) | ASR transformer | Multilingüe | Varios (incl. ONNX vía conversiones) | MIT | Hugging Face / OpenAI |
| Vosk | ASR | Varios | Varios | Apache 2.0 | Sitio oficial / GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a tipo, idioma, formato y licencia.

## Limitaciones y advertencias

- Solo reconoce ruso; no se documenta soporte multilingüe.
- No hay información sobre sesgos, robustez ante acentos, ruido o audio telefónico.
- Riesgo de errores de transcripción y de puntuación inherente a los modelos ASR; no se han publicado tasas de error (WER/CER).
- La licencia no está especificada en el repositorio; la model card remite a la licencia de GigaAM, por lo que es imprescindible revisarla antes de cualquier uso comercial.
- El repositorio es una conversión de terceros (`pisar`), no una publicación oficial de Sber; no hay garantías de mantenimiento ni de fidelidad respecto al modelo original.
- No se documentan requisitos de preprocesado de audio (frecuencia de muestreo, formato), lo que puede afectar a la calidad si no se consulta la configuración de sherpa-onnx.
- Fecha de creación futura en los metadatos (2026), lo que sugiere posibles inconsistencias en la información del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pisar/sherpa-onnx-nemo-transducer-punct-giga-am-v3-russian-2025-12-16
- Proyecto GigaAM original: https://github.com/salute-developers/GigaAM
- Licencia de GigaAM: https://github.com/salute-developers/GigaAM/blob/main/LICENSE
- sherpa-onnx: no disponible en la información proporcionada
