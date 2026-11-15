# mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-i1-GGUF

## Resumen

El modelo `gemma-4-26B-A4B-it-heretic-NSFW-i1-GGUF` es una cuantizacion en formato GGUF realizada por mradermacher sobre el modelo base `gemma-4-26B-A4B-it-heretic-NSFW`, publicado por el usuario yukiworks. Se trata de un derivado de la familia Gemma 4 de Google con ajuste fino orientado a conversacion y a contenido para adultos ("heretic" y "NSFW" en el nombre), distribuido exclusivamente como pesos cuantizados en GGUF para su uso con llama.cpp y herramientas compatibles.

El modelo cuenta con 25.233.142.046 parametros totales segun los datos de safetensors, lo que lo situa en torno a los 25.000 millones de parametros. La nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos por token, aunque esta informacion no aparece confirmada de forma explicita en la documentacion disponible.

La relevancia de esta publicacion es limitada y muy especifica: se trata de una cuantizacion derivada de un modelo ya de por si secundario, sin descargas ni interacciones registradas en el momento de la consulta, con licencia no especificada y con etiqueta `not-for-all-anchored` que restringe su uso a audiencias adultas. La model card es extremadamente escueta y se limita a indicar que se trata de cuantizaciones ponderadas con imatrix del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la nomenclatura "A4B" sugiere MoE con ~4B parametros activos, sin confirmar) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | No disponible (probablemente ~4B por la nomenclatura "A4B", sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre del repositorio incluye "26B-A4B", lo que apunta a un modelo de aproximadamente 26.000 millones de parametros totales con unos 4.000 millones de parametros activos, patron habitual en arquitecturas de mezcla de expertos (MoE) de tipo sparse. El recuento real de parametros en safetensors (25.233.142.046) es coherente con esa nomenclatura aproximada.

El proceso de cuantizacion documentado por mradermacher indica el uso de `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion desde pesos en formato Hugging Face a GGUF con cuantizacion ponderada mediante imatrix. No se especifican en la model card ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado en el modelo original. Tampoco se detalla ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional en formato chat (etiqueta `conversational` en el repositorio).
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite su despliegue detras de APIs compatibles con el formato de llama.cpp.
- Ajuste fino orientado a contenido para adultos ("NSFW"), con la etiqueta `not-for-all-audiences` que restringe su uso a publico adulto.
- Capacidades multilingues: no disponibles en la documentacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Generacion de narrativa y ficcion para adultos: el ajuste fino "NSFW" del modelo base lo orienta a la produccion de relatos y dialogos de tematica adulta, un nicho donde los modelos genericos aplican filtros de seguridad mas estrictos.
- Roleplay conversacional: la etiqueta `conversational` y el ajuste "heretic" (que habitualmente implica la reduccion de rechazos en el modelo) lo hacen adecuado para personajes interactivos en entornos controlados y con publico adulto.
- Prototipado local de chatbots sin censura: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, util para experimentar con sistemas conversacionales sin dependencia de APIs externas.
- Investigacion sobre alineacion y rechazos: el modelo sirve como caso de estudio de tecnicas de "abliteracion" o "heretic" que eliminan comportamientos de rechazo, util para analizar como afectan al rendimiento general y a la seguridad.
- Evaluacion comparativa de cuantizaciones: al ofrecer mas de veinte variantes (desde IQ1_S hasta Q6_K), permite medir el impacto de la cuantizacion en calidad conversacional y perplejidad sobre un mismo modelo base.
- Despliegue en entornos de bajos recursos: las variantes Q2_K e IQ2 permiten ejecutar un modelo de ~25B en hardware modesto, aunque con perdida notable de calidad, para tareas de generacion creativa no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Aproximadamente 9-10 GB para Q2_K, 14-15 GB para Q4_K_M, 18-19 GB para Q6_K (estimacion basada en el numero de parametros; no confirmada por el autor).
- GPU recomendadas: para las cuantizaciones altas (Q5_K_M, Q6_K), una RTX 4090 (24 GB) o una A100/H100 para despliegues concurrentes. Para cuantizaciones medias (Q4_K_M), una RTX 4080/4090 o una RTX 3090 de 24 GB.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB de VRAM para cuantizaciones Q4 y Q5; las variantes IQ2/IQ3 podrian caber en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-heretic-NSFW-i1-GGUF (este) | 25,2B totales (~4B activos, sin confirmar) | No disponible | No disponible | GGUF | Hugging Face, 0 descargas |
| gemma-4-26B-A4B-it-heretic-NSFW (base de yukiworks) | ~26B | No disponible | No disponible | Safetensors (probable) | Hugging Face |
| Gemma 3 27B (referencia de familia) | 27B | 128K (segun documentacion publica de Google) | Gemma Terms of Use | Safetensors, GGUF | Amplia disponibilidad |
| Mistral Small 3.1 24B (referencia de tamano) | 24B | 128K | Apache 2.0 | Safetensors, GGUF | Amplia disponibilidad |

La comparativa con modelos de la familia Gemma 3 o Mistral Small se ofrece solo como referencia de categoria y tamano; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Contenido para adultos: la etiqueta `not-for-all-audiences` indica explicitamente que el modelo genera contenido NSFW; no es apto para uso general ni para menores.
- Licencia no especificada: al no declararse licencia, no se puede garantizar el uso comercial ni la redistribucion; es imprescindible contactar con el autor o consultar la licencia del modelo base de Google antes de cualquier uso productivo.
- Modelo derivado de un derivado: es una cuantizacion de un ajuste fino comunitario, sin validacion por parte de Google; la calidad y la seguridad no estan garantizadas por el desarrollador original.
- Riesgo de alucinacion: no se han publicado evaluaciones; los ajustes finos "heretic" suelen reducir los rechazos, lo que puede aumentar la generacion de contenido factualmente incorrecto o inapropiado sin advertencia.
- Idiomas no documentados: se desconoce el soporte multilingue real; el modelo base Gemma suele estar entrenado en multiples idiomas, pero el ajuste fino puede haber degradado lenguas distintas del ingles.
- Perdida de calidad por cuantizacion: las variantes IQ1/IQ2 y Q2_K degradan notablemente la coherencia; para uso serio se recomienda Q4_K_M o superior.
- Sin descargas ni comunidad: el repositorio no registra descargas ni likes, por lo que no hay evidencia de uso ni de validacion por terceros.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-i1-GGUF
- Modelo base del ajuste fino: https://huggingface.co/yukiworks/gemma-4-26B-A4B-it-heretic-NSFW
