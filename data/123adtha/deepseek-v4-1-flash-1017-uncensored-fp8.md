# 123adtha/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es una versión modificada del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario 123adtha (dealignai) bajo licencia MIT. Se trata de un fine-tune de tipo abliterated que elimina el comportamiento de rechazo del modelo base, manteniendo intactas el resto de capacidades: visión, vídeo, razonamiento por niveles, tool calling, decodificación especulativa DSpark y contexto nativo de 1M tokens. El modelo se distribuye en formato FP8 nativo (e4m3) con escalas de bloque ue8m0 y expertos en FP4, en 48 shards de safetensors.

Arquitectura MoE de 40 capas con aproximadamente 763.205 millones de parámetros totales según los safetensors del repositorio (510,3 GB). El modelo es multimodal (image-text-to-text) y soporta siete idiomas: inglés, chino, español, francés, ruso, italiano y tailandés. La modificación es exclusivamente a nivel de pesos, sin LoRA, sin cambios en el tokenizer ni en la plantilla de chat, y sin SFT, RLHF ni DPO adicional.

Es relevante porque ofrece una alternativa sin censura sobre un modelo frontera de DeepSeek con capacidades multimodales y de razonamiento, manteniendo compatibilidad byte a byte con el motor de inferencia de referencia del modelo base. El acceso está restringido mediante gate (confirmación de mayoría de edad y uso legal), lo que condiciona su disponibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer de 40 capas con expertos FP4 y pesos FP8 (e4m3) |
| Parametros totales | 763.205.315.794 (aprox. 763,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 nativo (e4m3fn) con escalas de bloque ue8m0; expertos en FP4; sin GGUF ni Q8_0/Q4 en este repo |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT (con gate de acceso en Hugging Face) |
| Formato de pesos | safetensors (48 shards), FP8 + FP4 expertos, 8-bit |

## Arquitectura y entrenamiento

El modelo es un transformer Mixture-of-Experts de 40 capas. Los pesos se almacenan en FP8 nativo (e4m3fn) con escalas de bloque ue8m0 y expertos cuantizados en FP4, el mismo esquema de precisión que distribuye DeepSeek para el modelo base. El repositorio incluye los directorios de referencia `inference/` y `encoding/` de DeepSeek, y es byte-compatible con el modelo base: cualquier stack que cargue DeepSeek-V4.1-Flash-1017 puede cargar esta versión sin cambios de código.

La modificación es exclusivamente a nivel de pesos (abliteration): no se ha realizado SFT, RLHF, DPO ni preference tuning, no se ha modificado el tokenizer (`tokenizer.json` y `tokenizer_config.json` son idénticos al upstream), no se ha alterado la plantilla Jinja ni se ha inyectado ningún prefacio de sistema. Los tensores parcheados permanecen en FP8 e4m3 a su granularidad de bloque nativa. El autor advierte que cuantizar directamente este checkpoint FP8 a bits bajos acumula error de cuantización sobre la edición de abliteration y puede degradar la compliance; para versiones de baja precisión recomienda rehacer el pipeline de abliteration sobre la precisión objetivo. Se preserva la decodificación especulativa DSpark del modelo base.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Procesamiento multimodal de imagen y vídeo (pipeline image-text-to-text).
- Tool calling / function calling.
- Razonamiento multi-paso y flujos agénticos.
- Contexto largo nativo de 1M tokens.
- Capacidades multilingües en siete idiomas (en, zh, es, fr, ru, it, th).
- Modo de razonamiento (thinking) con presupuesto de tokens ampliable.
- Decodificación especulativa DSpark para acelerar la generación.
- Comportamiento sin rechazo (uncensored) en todas las categorías temáticas.

## Casos de uso

- Análisis de documentos extensos: con 1M tokens de contexto se pueden procesar informes completos, expedientes o bases de código sin trocear, manteniendo coherencia entre secciones.
- Procesamiento de vídeo e imagen en pipelines de inspección: el modelo acepta entradas visuales y puede describir, clasificar o extraer información de fotogramas y documentos escaneados en una sola pasada.
- Agentes autónomos con tool calling: integrable en orquestadores multi-paso donde el modelo decide qué herramienta invocar, con niveles de razonamiento ajustables según la complejidad de la tarea.
- Generación y revisión de código en producción: soporta function calling y contexto largo, lo que permite analizar repositorios completos y proponer parches con trazabilidad de dependencias.
- Investigación en seguridad y alineación: al eliminar el comportamiento de rechazo, sirve para estudiar respuestas del modelo en dominios sensibles sin la interferencia de negativas, útil en entornos de red teaming controlados.
- Atención al cliente multilingüe: cubre siete idiomas y conversaciones multi-turno con contexto largo, adecuado para sistemas de soporte que requieren memoria de sesión extensa.
- Asistentes de análisis documental jurídico o financiero: el contexto de 1M tokens y el modo de razonamiento `max` permiten contrastar cláusulas o cifras a lo largo de contratos y estados financieros completos.

## Benchmarks y rendimiento

La model card incluye una evaluación interna de MMLU en modo logit (57 asignaturas × 20 preguntas, 1140 preguntas totales), con prompt idéntico, modo chat sin razonamiento, greedy T=0 y argmax del primer token, ejecutada sobre 4×H200 (TP4) con el motor `inference/` upstream. El dato del modelo base se obtuvo contra la API oficial de DeepSeek sirviendo los mismos pesos 1017. La información proporcionada está truncada, por lo que solo se dispone del resultado del modelo base.

| Modelo | MMLU-20×57 | Δ vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 | no disponible (dato truncado en la información) | no disponible |

No se han publicado en la información disponible resultados de otros benchmarks (HumanEval, GSM8K, MMMU, etc.) para esta versión.

## Requisitos de hardware

- El repositorio ocupa 510,3 GB en safetensors FP8, por lo que la inferencia requiere al menos ese espacio en VRAM o en memoria unificada, más overhead de activaciones y KV cache.
- Los benchmarks internos se ejecutaron en 4×H200 con tensor parallelism 4 (TP4), configuración de referencia para este tamaño.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) a esta precisión; requeriría cuantizaciones de bits bajos no incluidas en este repo.
- Opciones de despliegue: motor `inference/` de referencia de DeepSeek incluido en el repo; el autor indica compatibilidad byte a byte con el modelo base, por lo que los stacks que soporten DeepSeek-V4.1-Flash-1017 deberían cargarlo. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.
- Muestreo recomendado por el autor: `temperature=1.0`, `top_p=1.0`, `max_tokens ≥ 256K` para uso intensivo de razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | ~763,2 B | 1M | Texto, imagen, vídeo | MIT (con gate) | Hugging Face, gate 18+ |
| DeepSeek-V4.1-Flash-1017 (base) | ~763,2 B (mismos pesos) | 1M | Texto, imagen, vídeo | no disponible en la información | Hugging Face y API oficial |
| DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8 (alias) | ~763,2 B | 1M | Texto, imagen, vídeo | MIT | Hugging Face (alias del mismo repo) |
| DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | no disponible | 1M | Texto, imagen, vídeo | no disponible | Hugging Face (mencionado en la model card) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar el comportamiento de rechazo; puede generar contenido dañino, ilegal o explícito sin filtros, lo que exige controles adicionales en producción.
- Riesgo elevado de alucinación inherente a los modelos de razonamiento de gran tamaño; no se han publicado evaluaciones de fidelidad para esta variante.
- La cuantización directa de este checkpoint FP8 a bits bajos degrada la calidad y puede revertir parcialmente la abliteration según el propio autor.
- El acceso está sujeto a un gate que exige confirmación de mayoría de edad y aceptación de responsabilidad legal; no es descarga abierta sin condiciones.
- Licencia MIT, pero el uso comercial queda condicionado por la legislación aplicable y por las políticas del proveedor de despliegue; el autor no ofrece garantías.
- La información de benchmarks está truncada y no permite verificar el impacto de la modificación en MMLU ni en otras tareas.
- Soporte de idiomas limitado a siete lenguas; no se garantiza calidad fuera de ellas.
- No se confirma compatibilidad con frameworks de serving populares (vLLM, TGI, llama.cpp); el despliegue validado es el motor de referencia de DeepSeek en 4×H200.
- El modelo base pertenece a DeepSeek; las condiciones de uso del upstream deben verificarse por separado antes de un despliegue comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/123adtha/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Alias abliterated: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2.9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Ko-fi del autor: https://ko-fi.com/dealignai
