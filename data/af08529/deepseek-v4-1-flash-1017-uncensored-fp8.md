# aF08529/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es una versión modificada a nivel de pesos del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario aF08529 (con créditos en la model card a dealignai). El cambio principal consiste en la eliminación del comportamiento de rechazo (abliteration), de modo que el modelo responde a peticiones sobre categorías temáticas que el modelo base declinaría. El resto de capacidades del modelo original se mantienen intactas: visión, vídeo, niveles de esfuerzo de razonamiento, tool calling, decodificación especulativa DSpark y una ventana de contexto nativa de 1M de tokens.

Se trata de un modelo MoE de 40 capas con 763.205.315.794 parámetros totales (según los safetensors del repositorio) y un peso en disco de 510,3 GB, distribuido en 48 shards de safetensors. Los pesos están en FP8 nativo (e4m3) con escalas de bloque ue8m0 y expertos en FP4, es decir, la misma precisión que distribuye DeepSeek, sin conversión intermedia a GGUF ni cuantizaciones derivadas.

La relevancia de esta ficha radica en que documenta una variante "uncensored" de un modelo frontera multimodal de gran tamaño, con licencia MIT, soporte para siete idiomas (inglés, chino, español, francés, ruso, italiano y tailandés) y un formato de pesos byte-compatible con el motor de inferencia de referencia de DeepSeek. Es un caso representativo de las ediciones de pesos orientadas a eliminar el alineamiento de seguridad y de las implicaciones técnicas y legales que conllevan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 40 capas (deepseek_v41) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 nativo (e4m3) con escalas de bloque ue8m0; expertos MoE en FP4; 8-bit |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards), FP8 e4m3 + escalas ue8m0, FP4 en expertos |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos (MoE) de 40 capas, identificado en los tags como `deepseek_v41`. Incorpora pesos en FP8 nativo (formato e4m3fn) con escalas de bloque ue8m0 y expertos en FP4, además de decodificación especulativa DSpark. El pipeline declarado es `image-text-to-text`, lo que confirma su naturaleza multimodal (imagen y vídeo). El repositorio incluye los directorios de referencia `inference/` y `encoding/` de DeepSeek, y el formato en disco es byte-compatible con el modelo base, por lo que cualquier stack que cargue el modelo original carga esta variante.

En cuanto al entrenamiento, la model card es explícita: no se ha realizado ningún fine-tuning supervisado, ni RLHF, ni DPO, ni ajuste de preferencias sobre los datos de rechazo del modelo base. La modificación es exclusivamente a nivel de pesos (abliteration) sobre el checkpoint FP8 nativo, sin cambios en el tokenizer (`tokenizer.json` y `tokenizer_config.json` son idénticos byte a byte al original), sin plantilla de chat modificada, sin system prompt inyectado, sin LoRA ni adaptadores, y sin trucos de empaquetado de bits que reduzcan la precisión. No se dispone de información sobre el volumen de tokens de entrenamiento ni la composición del dataset del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Procesamiento multimodal de imagen y vídeo (pipeline image-text-to-text).
- Tool calling y function calling.
- Razonamiento multi-paso y uso en flujos de agentes.
- Decodificación especulativa DSpark para acelerar la generación.
- Capacidades multilingües en inglés, chino, español, francés, ruso, italiano y tailandés.
- Contexto largo de hasta 1M de tokens.
- Comportamiento sin rechazo (uncensored/abliterated): responde a peticiones sobre categorías temáticas que el modelo base declinaría.

## Casos de uso

- Análisis de documentación extensa: con 1M de tokens de contexto, el modelo puede ingerir repositorios completos, expedientes o libros técnicos y responder preguntas que requieran cruzar información distribuida a lo largo de cientos de miles de tokens.
- Procesamiento de vídeo e imagen a texto: al ser multimodal, permite generar descripciones, resúmenes o extraer información estructurada de material audiovisual, por ejemplo en catalogación de archivos o moderación de contenido.
- Agentes autónomos con tool calling: la combinación de razonamiento multi-paso y function calling permite construir agentes que consulten APIs, ejecuten código y encadenen acciones sobre el contexto largo.
- Investigación sobre alineamiento y seguridad: al ser una variante abliterated con licencia MIT, sirve como objeto de estudio para medir cómo cambia el comportamiento de un modelo frontera al eliminar el rechazo, comparándolo con el base.
- Asistencia técnica multilingüe: cubre siete idiomas, incluido el español, lo que permite desplegar atención al cliente o soporte interno en mercados europeos y asiáticos con un único modelo.
- Generación y revisión de código en pipelines: el soporte de tool calling y contexto largo facilita integrarlo en flujos de CI/CD para revisar diffs, analizar trazas de error o generar parches con el repositorio completo como contexto.
- Análisis de razonamiento con esfuerzo variable: los niveles `low`/`high`/`max` permiten ajustar el coste computacional por consulta, usando `low` para tareas simples y `max` para problemas que requieran cadenas de razonamiento largas.

## Benchmarks y rendimiento

La model card incluye una evaluación interna de MMLU en modo logit (57 asignaturas × 20 preguntas, 1140 preguntas totales), con decodificación greedy T=0 y prompt idéntico entre ejecuciones. La tabla del README aparece truncada en la información disponible, por lo que solo se puede confirmar el resultado del modelo base.

| Modelo | MMLU-20×57 | Δ vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| DeepSeek-V4.1-Flash-1017 UNCENSORED FP8 (este repo) | no disponible (dato truncado en la model card) | no disponible |

La búsqueda web también referencia una evaluación del modelo base sobre 820 vídeos y 4.920 peticiones (5 de noviembre de 2026), con métricas CS: TG 14,9, SG 12,5, QA 56,7 y media 28,0, si bien los nombres de las métricas no se detallan en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 510,3 GB en FP8/FP4, por lo que se necesita al menos ese volumen de memoria agregada para cargar los pesos completos. No se dispone de estimaciones para cuantizaciones menores en la información proporcionada.
- GPU recomendadas: la model card reporta evaluaciones en 4×H200 con tensor parallelism 4 (TP4), configuración de referencia para servir el modelo.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090, 24 GB) en su formato nativo; se requeriría una cuantización de baja precisión no publicada en este repositorio.
- Opciones de despliegue: motor de inferencia de referencia de DeepSeek incluido en el directorio `inference/` del repositorio; compatible con `transformers` (librería declarada) y con endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | 763,2 B (MoE) | 1M | Sí (imagen y vídeo) | MIT | Variante abliterated en FP8/FP4 |
| DeepSeek-V4.1-Flash-1017 (base) | 763,2 B (MoE) | 1M | Sí (imagen y vídeo) | no disponible en la información | Modelo original con rechazo activo; MMLU 87,63 % |
| DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | no disponible | no disponible | no disponible | no disponible | Variante uncensored construida end-to-end en 2,9 bpw, citada en la model card |
| DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8 | 763,2 B (MoE) | 1M | Sí | MIT | Alias del mismo repositorio |

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar el rechazo; puede generar contenido dañino, ilegal o sensible sin filtros, lo que exige controles adicionales en cualquier despliegue en producción.
- La model card exige confirmación de mayoría de edad (18+) y aceptación de responsabilidad sobre las salidas mediante un formulario de acceso restringido (gated).
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones específicas de fidelidad para esta variante.
- La cuantización directa de este checkpoint FP8 a bajas precisiones no está recomendada por el autor: introduce error de cuantización sobre la edición de abliteration y puede degradar el cumplimiento. Para versiones de baja precisión, el autor recomienda rehacer el pipeline sobre la precisión objetivo.
- Los benchmarks publicados son internos y parciales (MMLU en modo logit); no hay resultados de HumanEval, GSM8K ni otras evaluaciones estándar en la información disponible.
- El rendimiento en español y en el resto de idiomas no declarados (en, zh, es, fr, ru, it, th) no está documentado.
- Licencia MIT: permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado y sobre el cumplimiento normativo en su jurisdicción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (6 de noviembre de 2026); se trata de una publicación muy reciente sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aF08529/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Repositorio original citado en la model card: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Alias abliterated: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2.9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Twitter del autor de la edición: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Apoyo al desarrollo: https://ko-fi.com/dealignai
