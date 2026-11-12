# muyleanging/Nama-Diarization-Khmer

## Resumen

Nama-Diarization-Khmer (Nāma) es un proyecto de modelo de diarización de hablantes para jemer (khmer) desarrollado por el autor independiente Muyleang Ing bajo el paraguas de una familia de herramientas de procesamiento de voz y lenguaje para ese idioma. La diarización de hablantes resuelve el problema de determinar "quién habla y cuándo" en una grabación, una tarea previa necesaria para generar transcripciones etiquetadas por hablante en reuniones, llamadas y pódcasts.

El repositorio es, a fecha de la información disponible, un anuncio de trabajo en curso: no contiene pesos del modelo ni resultados de entrenamiento. El autor declara un diseño previsto basado en embeddings de hablante más clustering, evaluado sobre habla jemer, y una exportación a ONNX en int8. El modelo se concibe como complemento de Sota (ASR en jemer), de modo que la salida combinada produzca transcripciones con atribución de hablante.

Por tanto, esta ficha documenta un proyecto planificado y no un modelo utilizable en producción. No hay arquitectura definitiva, número de parámetros, longitud de contexto ni resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (diseño previsto: embeddings de hablante + clustering) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 ONNX (previsto) |
| Idiomas soportados | jemer (km) |
| Licencia | otra (nombre: nama-tbd; pendiente de decidir en la primera release) |
| Formato de pesos | ONNX int8 (previsto); sin pesos publicados |

## Arquitectura y entrenamiento

La model card describe únicamente un diseño planificado: un sistema de diarización basado en embeddings de hablante seguido de clustering, probado sobre habla jemer. No se especifica el extractor de embeddings, el algoritmo de clustering, la función de pérdida ni el esquema de entrenamiento. Tampoco se indica el volumen ni la composición del corpus de entrenamiento, ni si se contempla ajuste fino sobre modelos preentrenados multilingües.

El autor enumera dos pasos de trabajo: la evaluación de modelos abiertos existentes sobre jemer (marcado como "planned") y el primer modelo propio (marcado como "soon"). No hay información sobre innovaciones técnicas, decodificación especulativa ni estrategias de atención.

## Capacidades

- Diarización de hablantes en jemer (prevista): identificación de segmentos de habla y atribución a hablantes concretos.
- Reconocimiento de hablantes (tag declarado), orientado a distinguir voces dentro de una misma grabación.
- Integración con Sota (ASR en jemer) para producir transcripciones etiquetadas por hablante.
- Exportación a ONNX int8 para despliegue ligero (prevista).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes, dado que la tarea es de clasificación de audio.

## Casos de uso

- Actas de reuniones en jemer: procesar la grabación con el diarizador para segmentar turnos de palabra y, combinado con Sota, generar un acta con atribución de intervenciones a cada participante.
- Transcripción de llamadas de atención al cliente: separar agente y cliente en la pista de audio para auditar conversaciones y calcular métricas por interlocutor (tiempo de habla, número de turnos).
- Producción de pódcasts y entrevistas: generar subtítulos o show notes indicando qué voz habla en cada momento, útil para edición posterior y para accesibilidad.
- Investigación lingüística y sociolingüística sobre jemer: cuantificar turnos de habla, solapamientos y duraciones por hablante en corpus de conversación.
- Sistemas de búsqueda y archivo de audio: indexar grabaciones por hablante para permitir búsquedas del tipo "intervenciones de la persona X" en un archivo de reuniones.
- Despliegue en dispositivos de borde: gracias a la exportación prevista a ONNX int8, integrar la diarización en aplicaciones locales de transcripción sin depender de servicios en la nube.
- Preprocesado para pipelines de ASR: usar los segmentos diarizados como entrada del reconocedor para evitar mezclar voces en una misma hipótesis de transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una tabla de estado con los pasos "Test existing open models on Khmer" (planned) y "First model" (soon), sin métricas de DER (Diarization Error Rate) ni de error de reconocimiento de hablante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no existir pesos ni arquitectura publicada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el diseño previsto (ONNX int8) sugiere que el objetivo es un despliegue ligero, pero no se confirma.
- Opciones de despliegue: ONNX Runtime (previsto por la exportación int8); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta tarea.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Idiomas | Pesos publicados | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| Nama-Diarization-Khmer | Diarización de hablantes | Jemer | No | Pendiente (nama-tbd) | no disponible |
| pyannote/speaker-diarization (referencia del sector) | Diarización de hablantes | Multilingüe | Sí | Condicionada (gated) | no disponible en esta ficha |
| Sota-ASR-Khmer-ONNX (mismo autor) | ASR | Jemer | Sí (según su repositorio) | no disponible | no disponible |

No se dispone de datos de rendimiento comparables para Nama, por lo que la comparación se limita a la disponibilidad y la naturaleza de la tarea.

## Limitaciones y advertencias

- No hay pesos publicados: el repositorio es un anuncio de trabajo en curso y no puede evaluarse ni desplegarse.
- Sin benchmarks: no existen métricas de DER ni de precisión de atribución de hablante sobre jemer.
- Licencia sin definir: la licencia "nama-tbd" implica que las condiciones de uso comercial son desconocidas y deben confirmarse antes de cualquier integración.
- Ámbito lingüístico restringido: el modelo está declarado solo para jemer, sin soporte multilingüe documentado.
- Riesgo de degradación en condiciones reales no documentado: no se especifican el comportamiento ante solapamiento de voces, ruido, cambio de canal o número elevado de hablantes.
- Sesgos desconocidos: al no haber datos de entrenamiento publicados, no puede evaluarse el sesgo por género, edad, acento o región dialectal del jemer.
- Dependencia de un ecosistema de un solo autor: la familia (Sota, Chakkhu, Tossana, Akkhara, VoxPocket) está en desarrollo y su madurez y mantenimiento no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/Nama-Diarization-Khmer
- ASR relacionado (Sota): https://huggingface.co/muyleanging/Sota-ASR-Khmer-ONNX
- OCR relacionado (Chakkhu): https://muyleanging.github.io/chakkhu-web/
- Captioning relacionado (Tossana): https://huggingface.co/muyleanging/Tossana-Caption-Khmer
- Teclado relacionado (Akkhara): https://muyleanging.github.io/akkhara-web/
- TTS relacionado (VoxPocket): https://huggingface.co/muyleanging/VoxPocket-TTS-Khmer
