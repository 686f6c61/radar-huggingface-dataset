# NHSheng/tinydiarize-whisper.cpp

## Resumen

tinydiarize-whisper.cpp es una conversión al formato ggml del modelo `small.en-tdrz`, una variante de OpenAI Whisper `small.en` afinada para añadir diarización de hablantes (identificación de cambios de turno entre interlocutores) sobre la transcripción. El trabajo original procede del repositorio `akashmjn/tinydiarize`, una extensión minimalista de Whisper que introduce tokens especiales para marcar los cambios de hablante sin depender de pipelines externos de diarización. Esta publicación concreta (NHSheng/tinydiarize-whisper.cpp) empaqueta los pesos ya convertidos a ggml para su uso directo con whisper.cpp.

El modelo resuelve un problema práctico: obtener transcripciones de audio con marcas de cambio de turno en entornos donde no se quiere desplegar un sistema de diarización completo (pyannote, NeMo, etc.). Al estar en formato ggml y ocupar 466 MB en disco, está pensado para inferencia local en CPU o GPU de gama baja mediante whisper.cpp, lo que lo hace útil para actas de reuniones, subtitulado de pódcast y transcripción de entrevistas.

La relevancia actual radica en su ligereza y su licencia MIT, que permite uso comercial sin las restricciones de otros componentes habituales en diarización. No obstante, la información pública disponible es escasa: se trata de una conversión de pesos, no de un modelo nuevo, y no se publican resultados de benchmarks ni detalles de entrenamiento en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper `small.en`) con tokens especiales de diarización |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, herencia de Whisper) |
| Tipos de cuantización | no disponible (el repo distribuye pesos ggml sin especificar variantes) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | ggml (convertido con los scripts de whisper.cpp) |

## Arquitectura y entrenamiento

El modelo base es Whisper `small.en`, un transformer encoder-decoder con atención completa diseñado para transcripción de audio. Sobre esa base, tinydiarize introduce un ajuste fino que añade tokens especiales para señalar cambios de hablante durante la decodificación, de forma que la propia transcripción incorpora marcas de turno sin necesidad de un modelo de diarización separado. La model card indica que se trata de un finetune de `small.en` con ese objetivo, pero no detalla el número de tokens de audio empleados, la composición del dataset ni si hubo etapas de RLHF o DPO.

La conversión a ggml se realizó con los scripts oficiales de whisper.cpp, lo que permite ejecutar el modelo con esa implementación en C/C++. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal; la aportación técnica del proyecto original es la extensión minimalista con tokens de cambio de hablante, inspirada explícitamente en la filosofía de minGPT.

## Capacidades

- Transcripción de audio en inglés con marcas de cambio de hablante integradas en la salida.
- Detección de turnos de conversación (speaker turn detection) sin pipeline externo de diarización.
- Generación de transcripciones con marcas de tiempo por segmento, heredadas de Whisper.
- Ejecución local mediante whisper.cpp en CPU y GPU.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (modelo `.en`).
- No se documentan modos especiales como thinking, visión o audio adicional más allá de la transcripción.

## Casos de uso

- Actas de reuniones: el modelo transcribe el audio y marca los cambios de turno, lo que permite reconstruir quién habló en cada momento sin desplegar un sistema de diarización completo. Adecuado por su ligereza y su salida con marcas de hablante.
- Transcripción de pódcast y entrevistas: al integrar la detección de turnos en la propia transcripción, se simplifica el postprocesado para generar guiones con intervenciones separadas.
- Subtitulado en inglés para vídeo: la salida con marcas de tiempo y cambios de hablante facilita la generación de subtítulos con indicación de interlocutor.
- Herramientas de accesibilidad: transcripción local en tiempo casi real en equipos sin GPU dedicada, gracias al formato ggml y a los 466 MB de pesos.
- Análisis de llamadas de atención al cliente: permite separar agente y cliente en la transcripción para posteriores análisis de calidad o extracción de métricas.
- Investigación en diarización: sirve como línea base ligera y reproducible para comparar extensiones de Whisper con tokens de cambio de hablante frente a pipelines clásicos.
- Prototipado en aplicaciones de escritorio o embebidas: whisper.cpp permite integrar el modelo en aplicaciones nativas sin dependencias pesadas de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica el tamaño en disco (466 MB) y el consumo de memoria estimado (~1,0 GB), sin métricas de WER, DER ni latencia.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,0 GB de memoria según la model card; en la práctica, la huella depende de la implementación y del backend.
- GPU recomendadas: no se especifican; al ser un modelo `small` en ggml, cabe en GPU de consumo como GTX 1660, RTX 3060 o superiores, y también en Apple Silicon mediante Metal.
- CPU: viable en CPU moderna gracias a whisper.cpp; el rendimiento depende del número de hilos y de la longitud del audio.
- Despliegue: whisper.cpp es la vía principal; no se documenta soporte nativo en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Diarización integrada | Licencia | Formato |
|---|---|---|---|---|---|
| tinydiarize-whisper.cpp (`small.en-tdrz`) | no disponible | 30 s por segmento (Whisper) | Sí, por tokens de cambio de hablante | MIT | ggml |
| Whisper `small.en` original | no disponible | 30 s por segmento | No | MIT | varios (incl. ggml) |
| Whisper `medium.en` | no disponible | 30 s por segmento | No | MIT | varios (incl. ggml) |
| Pipelines con pyannote + Whisper | no aplica | variable | Sí, externa | dependiente del componente de diarización | no aplica |

La comparativa se limita a alternativas de la misma familia porque no se dispone de datos de rendimiento publicados para este checkpoint concreto.

## Limitaciones y advertencias

- Solo admite inglés; no es adecuado para audio en castellano ni en otros idiomas.
- La diarización se limita a marcar cambios de turno, no a identificar hablantes concretos de forma consistente a lo largo del audio.
- Riesgo de alucinación inherente a Whisper en segmentos con silencio, ruido o audio musical.
- No se han publicado métricas de calidad (WER, DER) para este checkpoint, por lo que su rendimiento real no está validado de forma independiente en la información disponible.
- Sesgos: al heredar el entrenamiento de Whisper, puede presentar sesgos de género, acento y dialecto en la transcripción.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del proyecto original tinydiarize y de los pesos de Whisper subyacentes antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/NHSheng/tinydiarize-whisper.cpp
- Repositorio original de tinydiarize: https://github.com/akashmjn/tinydiarize
- Conversión equivalente en Hugging Face: https://huggingface.co/akashmjn/tinydiarize-whisper.cpp
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Scripts de conversión de whisper.cpp: https://github.com/ggerganov/whisper.cpp/tree/master/models
