# madwezza/peakcut-arabic-speech

## Resumen

`madwezza/peakcut-arabic-speech` es una conversión a formato sherpa-onnx del modelo de reconocimiento automático del habla (ASR) `nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0` de NVIDIA. El autor original del modelo base es NVIDIA, mientras que esta versión ha sido publicada por el usuario `madwezza` con el objetivo de facilitar su despliegue en entornos de inferencia ligeros basados en ONNX Runtime a través de sherpa-onnx. El repositorio ocupa aproximadamente 0,1 GB.

El modelo resuelve la tarea de transcripción de voz a texto en árabe. Se trata de un FastConformer híbrido (CTM + atención) del que solo se ha exportado la rama transducer a ONNX, con los pesos cuantizados a 8 bits siguiendo la receta oficial de sherpa-onnx para modelos NeMo FastConformer. No se ha reentrenado ningún componente: es una conversión pura de formato y precisión.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR de tamaño *large* en hardware modesto sin necesidad de NeMo ni de PyTorch, algo útil para aplicaciones de transcripción en producción con recursos limitados. No obstante, la información pública disponible es muy escasa: no hay pipeline declarado, ni licencia explícita en el repo, ni idiomas listados, ni benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido (rama transducer exportada a ONNX) |
| Parametros totales | no disponible (modelo base *large*; cifra exacta no publicada en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por ventanas de audio; no se especifica duración máxima) |
| Tipos de cuantizacion | 8 bits (INT8) sobre la rama transducer |
| Idiomas soportados | árabe (según el modelo base de NVIDIA) |
| Licencia | no disponible en el repo; el modelo base es CC-BY-4.0 |
| Formato de pesos | ONNX (rama transducer cuantizada a 8 bits) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer híbrido de NVIDIA, una variante de Conformer optimizada para ASR que combina capas de atención y convoluciones depthwise con subsampling agresivo para reducir la secuencia de entrada. La variante *hybrid* permite decodificación tanto por CTC como por transducer; en esta conversión solo se ha exportado la rama transducer a ONNX. El modelo original fue entrenado por NVIDIA sobre corpus de habla en árabe (la model card original indica el sufijo `_pc` de *punctuation and capitalization*, aunque este detalle no se confirma en la información disponible de esta conversión).

La única modificación realizada por `madwezza` es la exportación a ONNX y la cuantización a 8 bits de los pesos, siguiendo la receta de sherpa-onnx para modelos NeMo FastConformer. No hay reentrenamiento, ajuste fino ni cambio en los datos de entrenamiento. No se dispone de información sobre el número de tokens de audio, composición del dataset ni técnicas de aumento de datos empleadas en el modelo original.

## Capacidades

- Reconocimiento automático del habla (ASR) en árabe: transcripción de audio a texto.
- Decodificación mediante la rama transducer del modelo híbrido (la rama CTC no se ha exportado).
- Inferencia en ONNX Runtime a través de sherpa-onnx, sin dependencia de PyTorch ni NeMo.
- Ejecución con pesos cuantizados a 8 bits, lo que reduce el tamaño y los requisitos de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo *thinking*.
- Capacidades multilingües: no disponibles; el modelo base está orientado al árabe.

## Casos de uso

- Transcripción de reuniones y notas de voz en árabe: el modelo puede convertir audio grabado en texto para actas o resúmenes, ejecutándose en local con sherpa-onnx y sin enviar datos a servicios externos.
- Subtitulado automático de vídeo en árabe: integrable en pipelines de postproducción que necesiten generar pistas de subtítulos a partir de la banda de audio, con la ventaja de la cuantización INT8 para procesar lotes en CPU.
- Atención al cliente por voz en árabe: transcripción en tiempo real de llamadas para alimentar sistemas de análisis de sentimiento o bases de conocimiento, usando la rama transducer para decodificación incremental.
- Aplicaciones móviles o embebidas de dictado: al estar en ONNX y cuantizado a 8 bits, puede desplegarse en dispositivos con recursos limitados mediante sherpa-onnx, sin necesidad de GPU dedicada.
- Indexación y búsqueda de archivos de audio en árabe: transcripción por lotes de archivos históricos para hacerlos buscables por texto en un archivo documental o mediateca.
- Investigación en ASR para árabe: servir como línea base reproducible en formato ONNX para comparar técnicas de cuantización o de despliegue ligero frente al modelo original en NeMo.
- Preprocesado para pipelines de NLP en árabe: conversión de audio a texto antes de tareas de traducción, resumen o extracción de entidades, aprovechando que el modelo base incluye puntuación y capitalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al ser un modelo *large* cuantizado a 8 bits y ejecutarse en ONNX Runtime, es probable que quepa en menos de 4 GB, pero no se confirma en la información disponible.
- GPU recomendadas: no disponibles; el formato ONNX y la cuantización INT8 están pensados para ejecución en CPU, aunque puede acelerarse con GPU mediante los *providers* de ONNX Runtime (CUDA, TensorRT) si se configuran.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño del repo (0,1 GB) y cuantización INT8, es plausible que sí en GPUs con 4 GB o más, pero no hay datos oficiales.
- Opciones de despliegue: sherpa-onnx (principal), ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `madwezza/peakcut-arabic-speech` | no disponible (*large*) | no disponible | árabe | no disponible (base CC-BY-4.0) | ONNX INT8 |
| `nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0` | *large* (cifra no disponible) | no disponible | árabe | CC-BY-4.0 | NeMo (.nemo) |
| Whisper large-v3 (OpenAI) | 1.550 M | 30 s de audio | multilingüe (incl. árabe) | MIT | PyTorch, GGUF, ONNX |
| MMS / wav2vec2 árabe (Meta) | ~300 M | no disponible | árabe | CC-BY-NC 4.0 (según variante) | PyTorch, ONNX |

La comparación con Whisper y wav2vec2 es orientativa: no se dispone de resultados de benchmarks de este modelo que permitan una comparación cuantitativa justa.

## Limitaciones y advertencias

- Solo se ha exportado la rama transducer; la rama CTC del modelo híbrido original no está disponible en esta conversión.
- La cuantización a 8 bits puede degradar ligeramente la precisión respecto al modelo original en FP32, aunque no se han publicado métricas que lo cuantifiquen.
- La licencia del repositorio no está declarada; el modelo base es CC-BY-4.0, lo que exige atribución a NVIDIA. Verificar la licencia antes de uso comercial.
- El modelo está orientado exclusivamente al árabe; no se documenta soporte para otros idiomas ni para code-switching.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el corpus de entrenamiento o solapamiento de hablantes; no hay datos sobre el dominio de entrenamiento.
- No hay información sobre sesgos dialectales ni sobre el rendimiento en variedades del árabe distintas de la estándar.
- La información pública es mínima (0 descargas, 0 likes, sin pipeline declarado), por lo que no hay validación comunitaria del funcionamiento de la conversión.
- No apto para tareas distintas de ASR: no genera texto libre, no razona, no soporta tool calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/madwezza/peakcut-arabic-speech
- Modelo base de NVIDIA: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx (repositorio y recetas): https://github.com/k2-fsa/sherpa-onnx
