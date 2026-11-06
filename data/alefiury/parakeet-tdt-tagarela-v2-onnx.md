# alefiury/parakeet-tdt-tagarela-v2-onnx

## Resumen

`parakeet-tdt-tagarela-v2-onnx` es la exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) `alexandreacff/parakeet-tdt-tagarela-v2`, publicada por el usuario alefiury. El modelo original se basa en la arquitectura NeMo Conformer con decodificación TDT (Token-and-Duration Transducer) de la familia Parakeet de NVIDIA, y está especializado en portugués. Esta versión ONNX elimina la dependencia del framework NeMo en tiempo de inferencia y permite ejecutar el modelo con la librería ligera `onnx-asr`, lo que facilita su despliegue en entornos sin GPU o con requisitos estrictos de portabilidad.

La relevancia de esta ficha radica en que el modelo no aporta pesos nuevos: es una conversión de formato pensada para producción. El repositorio ocupa 2,5 GB, lo que sugiere pesos en precisión completa o FP16 empaquetados en ONNX. Al estar liberado bajo CC-BY-4.0, permite uso comercial con atribución, algo poco habitual en modelos ASR de alto rendimiento.

No se dispone de información sobre el número exacto de parámetros, la longitud de contexto en segundos ni los datos de entrenamiento en la información proporcionada; la model card remite a la ficha del modelo original para esos detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada) |
| Tipos de cuantizacion | no disponible (exportación ONNX; el repo ocupa 2,5 GB) |
| Idiomas soportados | Portugués (pt) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (librería `onnx-asr`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Conformer, que combina bloques de autoatención con convoluciones para capturar dependencias locales y globales en la señal de audio. Sobre el encoder Conformer se sitúa un decodificador TDT, una variante de transducer que predice conjuntamente tokens y duraciones, lo que reduce el número de pasos de decodificación y mejora la eficiencia frente a los transducers clásicos. Esta combinación es la empleada por la familia Parakeet de NVIDIA para ASR de alto rendimiento.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de técnicas de aumento de datos ni si se aplicaron etapas de ajuste fino supervisado o destilación. La model card remite explícitamente a la ficha del modelo original (`alexandreacff/parakeet-tdt-tagarela-v2`) para esos detalles. La contribución de esta publicación es exclusivamente la exportación a ONNX, que preserva la arquitectura y los pesos del modelo base y elimina la necesidad de instalar NeMo para la inferencia.

## Capacidades

- Reconocimiento automático del habla en portugués, con transcripción de audio a texto.
- Decodificación TDT, que modela duraciones de token y puede mejorar la robustez en habla continua.
- Ejecución mediante `onnx-asr`, con soporte para CPU y hub de Hugging Face (`pip install onnx-asr[cpu,hub]`).
- API de alto nivel sencilla: `onnx_asr.load_model("nemo-conformer-tdt", "<repo>")` y `model.recognize("audio.wav")`.
- No se ha documentado soporte de tool calling, agentes, visión, audio adicional ni modo de razonamiento; es un modelo puramente ASR.
- Capacidad multilingüe limitada al portugués según la etiqueta de idioma del repositorio.

## Casos de uso

- Transcripción de reuniones y notas de voz en portugués: el modelo convierte audio en texto con una API de una sola llamada, adecuado para integrarse en herramientas de productividad sin dependencias de NeMo.
- Subtitulado automático de vídeo: al ejecutarse en ONNX, puede desplegarse en servidores sin GPU o en contenedores ligeros para generar subtítulos en portugués por lotes.
- Atención al cliente basada en voz: transcripción de llamadas para análisis de calidad, búsqueda de texto en grabaciones y generación de resúmenes posteriores.
- Dictado y accesibilidad: integración en aplicaciones de escritorio o móviles que conviertan voz en texto para usuarios con dificultades motoras, aprovechando la portabilidad de ONNX.
- Indexación y búsqueda de archivos de audio: transcripción masiva de archivos para construir índices de texto sobre los que aplicar búsqueda semántica o por palabras clave.
- Pipelines de datos para entrenamiento de LLM: generación de transcripciones de corpus en portugués para fine-tuning o evaluación de modelos de lenguaje, con licencia CC-BY-4.0 que permite uso comercial con atribución.
- Investigación en ASR: punto de partida reproducible en ONNX para comparar arquitecturas Conformer-TDT con otros modelos sin depender de entornos NeMo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, latencia ni throughput, y remite a la ficha del modelo original para la evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio de 2,5 GB sugiere que los pesos ocupan ese orden de magnitud en disco, por lo que la inferencia en FP32 requeriría al menos varios GB de memoria, y menos si se aplican cuantizaciones ONNX.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del repositorio, es plausible ejecutarlo en GPUs consumer con suficiente memoria, pero no hay confirmación oficial.
- Cabe en GPU consumer: no confirmado; la exportación ONNX y la API `onnx-asr[cpu,hub]` indican que el modelo está pensado para ejecutarse también en CPU.
- Opciones de despliegue: `onnx-asr` (CPU y hub), ONNX Runtime; no se documenta soporte nativo de vLLM, TGI o llama.cpp, que no están orientados a ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| parakeet-tdt-tagarela-v2-onnx (este) | Conformer + TDT | Portugués | CC-BY-4.0 | ONNX | Exportación ligera para `onnx-asr` |
| alexandreacff/parakeet-tdt-tagarela-v2 | Conformer + TDT | Portugués | no disponible en la información | NeMo | Modelo base del que deriva esta exportación |
| Whisper (variantes) | Transformer encoder-decoder | Multilingüe | MIT (variantes OpenAI) | PyTorch, ONNX, GGML | Referencia ASR multilingüe; no se dispone de comparación numérica |

No se dispone de datos de benchmarks que permitan comparar rendimiento (WER, latencia) con alternativas; la comparación anterior es estructural y de licencia, no de calidad.

## Limitaciones y advertencias

- El modelo solo está etiquetado para portugués; el rendimiento en otros idiomas no está garantizado ni documentado.
- No se han publicado métricas de WER ni evaluaciones independientes en la información disponible, por lo que la calidad real en dominios concretos (ruido, acentos, jerga) es desconocida.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos ASR, especialmente en audio con ruido o solapamiento de hablantes.
- Sesgos potenciales derivados de los datos de entrenamiento del modelo original, no documentados en esta ficha.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales antes de un despliegue en producción.
- Al ser una exportación ONNX, cualquier limitación del modelo original se hereda; la model card no documenta diferencias de precisión entre la versión ONNX y la original.
- No hay información sobre soporte de audio en streaming ni sobre el formato de entrada exacto (frecuencia de muestreo, canales) más allá del ejemplo de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alefiury/parakeet-tdt-tagarela-v2-onnx
- Modelo base: https://huggingface.co/alexandreacff/parakeet-tdt-tagarela-v2
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
