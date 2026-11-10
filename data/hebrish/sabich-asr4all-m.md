# Hebrish/Sabich-asr4all-M

## Resumen

Sabich-asr4all-M es un modelo de reconocimiento automático del habla (ASR) publicado por el usuario Hebrish en Hugging Face, obtenido mediante ajuste fino (fine-tuning) del modelo base `futo-org/asr4all-m`. Está diseñado para transcripción con salida CTC y soporte de streaming, con un enfoque explícito en despliegue on-device y adaptación a hablante. El modelo cubre inglés y hebreo, e incluye código de cambio de idioma (code-switching) y vocabulario técnico, además de una variante específica de inglés irlandés orientada a dictado.

Con 55,77 millones de parámetros y un repositorio de 0,4 GB, se trata de un modelo compacto pensado para ejecutarse en entornos con recursos limitados, con pesos en safetensors y ONNX. Su pipeline declarado es `automatic-speech-recognition` y su licencia es la `futo-model-weights-ethical-use-1.0`, con acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo.

Su relevancia actual reside en la combinación de tamaño reducido, soporte de streaming y licencia con cláusulas éticas, un perfil poco habitual en modelos ASR multilingües que incluyen hebreo e inglés con cambio de código. No obstante, la información pública disponible es escasa y no se han publicado resultados de benchmarks en la ficha del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR con salida CTC; código personalizado, `custom_code`) |
| Parametros totales | 55.770.225 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y ONNX) |
| Idiomas soportados | inglés (en), hebreo (he); incluye code-switching y inglés irlandés para dictado |
| Licencia | futo-model-weights-ethical-use-1.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en `futo-org/asr4all-m` y emplea una cabeza de salida CTC (Connectionist Temporal Classification), con soporte explícito de streaming y de adaptación a hablante. El repositorio incluye código personalizado (`custom_code`) y exportación a ONNX, lo que sugiere un diseño orientado a inferencia eficiente y despliegue en dispositivo. No se detalla en la información proporcionada la arquitectura interna exacta (tipo de encoder, número de capas, mecanismo de atención) ni la composición del dataset de entrenamiento.

En cuanto a los datos, la ficha referencia los datasets `danielrosehill/Read-Aloud-Voice-Sentences` y `openslr/librispeech_asr`, lo que apunta a una combinación de datos de lectura y de voz en inglés, presumiblemente complementados con datos en hebreo. No se especifica el número de horas de audio, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación (poco habituales en ASR). Tampoco se documentan innovaciones técnicas adicionales más allá del streaming, el CTC y la adaptación a hablante.

## Capacidades

- Reconocimiento automático del habla con salida CTC, adecuado para transcripción de audio a texto.
- Modo streaming, que permite transcripción incremental con latencia reducida.
- Adaptación a hablante (speaker adaptation), orientada a mejorar la precisión con voces concretas.
- Soporte multilingüe limitado a inglés y hebreo.
- Manejo de code-switching entre inglés y hebreo dentro de una misma emisión.
- Vocabulario técnico (tech-vocabulary) incorporado en el entrenamiento.
- Variante de inglés irlandés orientada a dictado.
- Extracción de características (feature-extraction) según los tags del modelo.
- Despliegue on-device gracias a su tamaño compacto y exportación ONNX.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplicable a un modelo ASR).

## Casos de uso

- Dictado en inglés irlandés: el modelo incorpora una variante específica para dictado en esta variedad, lo que permite transcribir notas de voz y documentos hablados con mayor fidelidad que un ASR genérico en inglés.
- Transcripción bilingüe inglés-hebreo: gracias al soporte de code-switching, puede emplearse en reuniones o entrevistas donde los hablantes alternan ambos idiomas, evitando segmentar manualmente el audio por idioma.
- Subtitulado en streaming: el modo streaming y la salida CTC permiten generar subtítulos incrementales en directo con latencia baja, adecuado para webinars o retransmisiones.
- Asistentes de voz on-device: con 55,77 millones de parámetros y exportación ONNX, puede integrarse en aplicaciones de escritorio o móviles que requieran transcripción local sin enviar audio a la nube.
- Adaptación a un hablante concreto: la funcionalidad de speaker adaptation permite ajustar el modelo a la voz de un usuario (por ejemplo, en un entorno clínico o de accesibilidad) para mejorar la precisión en dictados recurrentes.
- Transcripción de vocabulario técnico: el entrenamiento con tech-vocabulary facilita la transcripción de términos especializados en contextos de ingeniería o soporte técnico, reduciendo errores en palabras poco frecuentes.
- Procesamiento por lotes de audio en pipelines de datos: al ser un modelo pequeño con pesos safetensors y ONNX, puede ejecutarse en CPU o GPU modestas para transcribir grandes volúmenes de audio en tareas de etiquetado o minería de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 55,77 millones de parámetros, los pesos en precisión completa ocupan aproximadamente 0,22 GB (55,77 M × 4 bytes), por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican; por tamaño, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso para ejecución en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM libre, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: transformers (librería declarada), ONNX Runtime para la exportación ONNX; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sabich-asr4all-M | 55,77 M | en, he | no disponible (streaming) | futo-model-weights-ethical-use-1.0 | gated en Hugging Face |
| futo-org/asr4all-m (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Whisper (variantes pequeñas) | no disponible en la información | multilingüe | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría; los modelos citados se incluyen solo como referencia estructural y sus cifras no están verificadas en esta ficha.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia `futo-model-weights-ethical-use-1.0`: incluye cláusulas de uso ético; debe revisarse antes de cualquier uso comercial o redistribución.
- Cobertura lingüística limitada a inglés y hebreo; no se documenta soporte de castellano ni de otras lenguas.
- No se han publicado benchmarks, por lo que el rendimiento real frente a alternativas no está verificado de forma independiente.
- Riesgo de alucinación y errores de transcripción inherente a los modelos CTC, especialmente con audio ruidoso, acentos no representados o vocabulario fuera del dominio de entrenamiento.
- No se documentan sesgos conocidos ni la composición demográfica de los datos de entrenamiento, lo que dificulta evaluar su comportamiento con distintos acentos y hablantes.
- El tamaño reducido del modelo (55,77 M de parámetros) puede limitar la precisión en comparación con modelos ASR de mayor escala.
- Información pública escasa: no se detallan la arquitectura interna, el volumen de datos de entrenamiento ni los requisitos oficiales de hardware.
- El repositorio tiene muy poca tracción (12 descargas, 1 like en el momento de la consulta), lo que reduce la validación comunitaria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Sabich-asr4all-M
- Modelo base: https://huggingface.co/futo-org/asr4all-m
- Dataset de referencia: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset de referencia: https://huggingface.co/datasets/openslr/librispeech_asr
- DOI: https://doi.org/10.57967/hf/11176
