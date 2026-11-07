# Mspanz88/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es una variante del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek a la que se le ha eliminado el comportamiento de rechazo (abliteration) mediante una edición a nivel de pesos. El autor de la publicación en Hugging Face es Mspanz88, aunque la model card atribuye el trabajo al colectivo dealignai y menciona que el cómputo fue proporcionado por un tercero. El modelo base es un transformer MoE multimodal de 763.205.315.794 parámetros totales (según los safetensors del repositorio), con contexto nativo de 1M de tokens, capacidades de visión y vídeo, tool calling y niveles de esfuerzo de razonamiento.

La relevancia de esta ficha radica en que se trata de una edición de pesos sin reentrenamiento: no hay SFT, RLHF, DPO ni modificación de plantilla de chat. El formato en disco es FP8 nativo (e4m3) con escalas de bloque ue8m0 y expertos MoE en FP4, distribuido en 48 shards de safetensors, con un tamaño de repositorio de 510,3 GB. Es, por tanto, un checkpoint pensado para servir con el motor de inferencia de referencia de DeepSeek y con hardware de clase H200 en paralelo de tensor.

El modelo conserva las capacidades del upstream (visión, vídeo, razonamiento por niveles, decodificación especulativa DSpark y contexto de 1M tokens), pero elimina las negativas de rechazo en todas las categorías temáticas. La licencia declarada es MIT, si bien el acceso está condicionado a una compuerta que exige confirmar mayoría de edad y aceptación de responsabilidad sobre las salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (visión-lenguaje), 40 capas, expertos FP4 |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 nativo (e4m3) con escalas de bloque ue8m0; expertos MoE en FP4; se menciona un quant EXL3 de 2,9 bpw como release hermano |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT (acceso sujeto a compuerta de aceptación) |
| Formato de pesos | safetensors (48 shards), FP8 e4m3 + escalas ue8m0, FP4 en expertos; incluye `inference/` y `encoding/` de referencia |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de 40 capas con atención multimodal que procesa imagen, vídeo y texto. El checkpoint se distribuye en precisión FP8 nativa (e4m3fn) con escalas de bloque ue8m0 y expertos MoE en FP4, el mismo formato que publica DeepSeek para el modelo base. Incorpora decodificación especulativa DSpark y un motor de inferencia de referencia (`inference/`) junto con el renderizador de prompts (`encoding/`), ambos byte-compatibles con el upstream.

No se ha realizado ningún entrenamiento adicional sobre el modelo base: la model card indica explícitamente que no hay SFT, RLHF, DPO, LoRA ni adaptadores, y que el tokenizador y la plantilla de chat son idénticos a los del upstream. La modificación es exclusivamente a nivel de pesos (abliteration), manteniendo los tensores parcheados en FP8 e4m3 a su granularidad de bloque nativa. El autor advierte que cuantizar este checkpoint directamente a bits bajos acumula error de cuantización sobre la edición de abliteration y puede degradar el cumplimiento; para releases de baja precisión recomienda rehacer el pipeline de abliteration en la precisión objetivo, como se hizo en el release hermano EXL3 de 2,9 bpw.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Procesamiento multimodal de imagen y vídeo (pipeline `image-text-to-text`).
- Tool calling y function calling.
- Razonamiento multi-paso y uso en flujos de agentes.
- Contexto largo de hasta 1M de tokens para documentos extensos y conversaciones multi-turno.
- Soporte multilingüe en inglés, chino, español, francés, ruso, italiano y tailandés.
- Decodificación especulativa DSpark para acelerar la generación.
- Comportamiento sin rechazo (uncensored/abliterated) en todas las categorías temáticas.

## Casos de uso

- Análisis de documentos extensos: con 1M de tokens de contexto, el modelo puede ingerir contratos, expedientes o bases de código completas en una sola pasada sin fragmentación, lo que resulta adecuado para auditoría legal o revisión técnica.
- Procesamiento de vídeo e imagen: al aceptar entradas de vídeo e imagen, sirve para moderación de contenido, descripción automática de material audiovisual o extracción de información de capturas y fotogramas.
- Investigación en seguridad y alineación: al ser una variante abliterated, es útil para estudiar comportamientos de rechazo, medir sesgos residuales y comparar con el modelo base en condiciones controladas.
- Agentes autónomos con tool calling: la combinación de razonamiento por niveles y llamadas a herramientas permite construir pipelines de automatización que consultan APIs, ejecutan código y encadenan pasos intermedios.
- Asistencia técnica multilingüe: los siete idiomas declarados permiten atender consultas en español, francés, italiano, ruso, chino, tailandés e inglés desde un único despliegue.
- Generación de contenido sin restricciones temáticas: para aplicaciones creativas o de ficción que requieren tratar temas que el modelo base declinaría, con la advertencia de que la responsabilidad legal recae en el operador.
- Evaluación comparativa de checkpoints: sirve como referencia para medir el impacto de la abliteration sobre MMLU y otras tareas, tal como documenta el autor en sus benchmarks internos.

## Benchmarks y rendimiento

El autor publica un resultado interno de MMLU en modo logit (57 asignaturas × 20 preguntas, 1140 preguntas totales), con prompt idéntico, modo chat sin razonamiento, greedy T=0 y argmax del primer token. La ejecución del bundle se hizo con el motor `inference/` de referencia sobre 4×H200 (TP4); la del base, contra la API oficial de chat completions de DeepSeek.

| Modelo | MMLU-20×57 | Delta vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este repo) | no disponible (dato truncado en la información) | no disponible |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks estándar. La búsqueda web menciona una evaluación del modelo base sobre 820 vídeos y 4920 peticiones (5 de noviembre de 2026) con puntuaciones CS: TG 14,9, SG 12,5, QA 56,7, Avg 28,0, pero corresponde al upstream, no a esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 510,3 GB en FP8, por lo que se necesita al menos ese volumen de memoria agregada; en la práctica, un despliegue en FP8 requiere del orden de 8 GPUs de 80 GB o 4 GPUs de 141 GB.
- GPU recomendadas: el autor valida el modelo sobre 4×H200 en tensor parallel 4 (TP4); son también candidatas configuraciones con A100 80 GB en mayor número de GPUs o H100 80 GB.
- No cabe en GPU de consumo: con 763 000 millones de parámetros y pesos FP8, no es viable en RTX 4090, RTX 3090 ni similares, ni siquiera con cuantización agresiva dentro de una sola tarjeta.
- Opciones de despliegue: motor `inference/` de referencia de DeepSeek incluido en el repo; el autor indica compatibilidad con endpoints y con todo lo que carga el modelo base. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor menciona decodificación especulativa DSpark y recomienda `max_tokens ≥ 256K` para el modo razonador, lo que implica generaciones largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | 763,2 B | 1M | Texto, imagen, vídeo | MIT | Abliterated, FP8 nativo + FP4 expertos, tool calling, reasoning tiers |
| DeepSeek-V4.1-Flash-1017 (base) | 763,2 B | 1M | Texto, imagen, vídeo | MIT | Modelo original con rechazos; MMLU 87,63 % en la evaluación del autor |
| DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | no disponible | 1M | Texto, imagen, vídeo | MIT | Release hermano con abliteration rehecha en precisión EXL3 de 2,9 bpw |
| DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8 | 763,2 B | 1M | Texto, imagen, vídeo | MIT | Alias del mismo repositorio, según la model card |

No se dispone de datos para comparar con modelos de otras familias (Llama, Qwen, Mistral) en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina los rechazos, pero no garantiza corrección factual: el riesgo de alucinación persiste y puede aumentar en temas sensibles donde el modelo ya no señala incertidumbre.
- Los sesgos del modelo base no desaparecen con la edición de pesos; la model card no documenta evaluaciones de sesgo específicas para esta variante.
- El acceso está sujeto a una compuerta que exige confirmar mayoría de edad, declarar uso previsto y aceptar responsabilidad sobre las salidas; la licencia MIT no exime de obligaciones legales locales.
- El autor advierte que cuantizar este checkpoint a bits bajos de forma ingenua degrada el cumplimiento; para producción en baja precisión recomienda usar el release EXL3 o rehacer el pipeline.
- El contexto de 1M tokens es costoso en memoria KV y latencia; no se han publicado mediciones de rendimiento a esa longitud.
- Los benchmarks publicados son internos, con una sola métrica (MMLU) y sin comparación completa frente a alternativas; el resultado de este repo aparece truncado en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El modelo base es de noviembre de 2026; conviene verificar si DeepSeek ha publicado revisiones posteriores con correcciones de seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mspanz88/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Repositorio original del autor (dealignai): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Alias abliterated: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Release hermano EXL3 2,9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Twitter del autor: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Ko-fi del autor: https://ko-fi.com/dealignai
