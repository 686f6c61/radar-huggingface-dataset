# dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-JANG_2K

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-JANG_2K es una variante "abliterated" (sin comportamiento de rechazo) del bundle cuantizado JANG_2K de DeepSeek-V4.1-Flash-1017, publicada por el usuario dealignai. El modelo base es una arquitectura MoE (mixture of experts) de DeepSeek con capacidades multimodales (image-text-to-text), razonamiento en modo thinking con tres niveles (low, high, max), uso de herramientas y una ventana de contexto declarada de 1M de tokens. La versión JANG_2K está empaquetada específicamente para Macs con Apple Silicon y 256 GB de memoria unificada, en formato MLX con pesos safetensors cuantizados.

El interés de esta ficha radica en que combina tres cosas poco habituales: un modelo de razonamiento de gran escala (552.366 millones de parámetros totales según los safetensors del repo), una cuantización orientada a hardware de consumo profesional (Apple Silicon de gama alta) y una modificación explícita del comportamiento de rechazo. El autor reporta que la eliminación de rechazos no degrada el rendimiento en MMLU (incluso lo mejora marginalmente, +1,42 pp sobre 5700 preguntas, dentro del margen de ruido estadístico).

Es relevante para desarrolladores e investigadores que trabajan en entornos macOS con memoria unificada masiva y necesitan un modelo de razonamiento con contexto muy largo y visión, sin las restricciones de alineación del modelo original. No obstante, la licencia es "other" (deepseek-v41-flash-1017), el repo tiene 0 descargas y 0 likes en el momento de la consulta, y no hay información publicada sobre el proceso de entrenamiento ni sobre la metodología exacta de la ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer; multimodal image-text-to-text; decodificación especulativa DSpark |
| Parametros totales | 552.366.103.664 (552,37 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (según tags y model card) |
| Tipos de cuantizacion | JANG_2K (cuantización propietaria del bundle, orientada a Apple Silicon 256 GB); no se detallan bits ni esquema exacto |
| Idiomas soportados | en, es, fr, ru, it, th, zh |
| Licencia | other — deepseek-v41-flash-1017 (enlace a LICENSE del repo deepseek-ai/DeepSeek-V4.1-Flash-1017) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo MoE con capacidad multimodal (pipeline image-text-to-text) y decodificación especulativa DSpark. El bundle JANG_2K es una cuantización del modelo base jangq/DeepSeek-V4.1-Flash-1017-JANG_2K, que a su vez deriva del DeepSeek-V4.1-Flash-1017 original de DeepSeek. No se especifican en la información proporcionada el número de parámetros activos por token, el número de expertos, la dimensión oculta, el número de capas ni la composición del dataset de entrenamiento (número de tokens, mezcla de datos, uso de RLHF/DPO).

La modificación "UNCENSORED" consiste, según el autor, en eliminar el comportamiento de rechazo del bundle base. No se documenta la técnica concreta de ablación (abliteration, fine-tuning de rechazo, edición de direcciones de activación, etc.), ni el volumen de datos o pasos de entrenamiento empleados. El autor reporta que el modelo "carga y sirve exactamente igual que el bundle base", lo que sugiere que la modificación preserva la arquitectura y el formato de pesos. La decodificación especulativa DSpark es una innovación destacable para acelerar la inferencia en el hardware objetivo.

## Capacidades

- Generación de texto y razonamiento en modo chat y modo thinking con tres niveles de esfuerzo (low, high, max).
- Entrada de imágenes (image-text-to-text): el modelo acepta imágenes junto con texto.
- Uso de herramientas (tool use / function calling) y capacidades orientadas a agentes.
- Razonamiento multi-paso (multi-step reasoning) y flujos de agente.
- Capacidades multilingües en siete idiomas: inglés, español, francés, ruso, italiano, tailandés y chino.
- Ventana de contexto de hasta 1M de tokens, adecuada para documentos largos y conversaciones extensas.
- Decodificación especulativa DSpark para acelerar la generación.
- Comportamiento sin rechazos (uncensored/abliterated) en los siete idiomas y en los tres niveles de razonamiento probados por el autor.
- Formato MLX optimizado para Apple Silicon con 256 GB de memoria unificada.

## Casos de uso

- Análisis de documentos extensos en macOS: con 1M de tokens de contexto, el modelo puede procesar contratos, informes o bases de código completas en una sola pasada sobre un Mac con 256 GB de memoria unificada, sin necesidad de fragmentar el input.
- Asistentes de razonamiento local en estaciones de trabajo Apple Silicon: el bundle MLX permite ejecutar un MoE de 552 B parámetros totales en hardware de sobremesa de Apple, útil para equipos que no pueden enviar datos a la nube por motivos de confidencialidad.
- Investigación en seguridad y alineación: al ser una variante abliterated, sirve para estudiar el comportamiento del modelo sin rechazos, comparar respuestas frente al base y analizar sesgos o riesgos en entornos controlados.
- Procesamiento multimodal de documentación técnica: al aceptar imágenes y texto, puede extraer información de capturas, diagramas o documentos escaneados y combinarla con texto en un mismo contexto.
- Agentes con tool calling en pipelines locales: el soporte de function calling y razonamiento multi-paso permite construir agentes que consulten APIs, ejecuten código o interactúen con sistemas internos desde un entorno macOS.
- Atención al cliente multilingüe: los siete idiomas soportados y el contexto largo permiten gestionar conversaciones multi-turno con historial extenso y usuarios en distintas lenguas.
- Generación y revisión de código en flujos de desarrollo: el modo thinking y el uso de herramientas facilitan tareas de refactorización, revisión y explicación de código, aunque el rendimiento específico en benchmarks de código no está publicado.

## Benchmarks y rendimiento

El autor publica resultados de MMLU sobre 5700 preguntas (100 por asignatura, 57 asignaturas) en modo chat, comparando el bundle base con esta variante UNCENSORED. No se han publicado en la información disponible resultados de HumanEval, GSM8K, MMLU-Pro, MATH ni otros benchmarks, ni comparaciones con modelos de terceros.

| Benchmark | Conjunto | Base JANG_2K | UNCENSORED (este) | Delta |
|---|---|---:|---:|---:|
| MMLU overall | 5700 preguntas | 76,96 % | 78,39 % | +1,42 pp |
| MMLU STEM | 1900 preguntas | 66,89 % | 69,42 % | +2,53 pp |
| MMLU Humanities | 1300 preguntas | 84,46 % | 84,15 % | −0,31 pp |
| MMLU Social Sciences | 1200 preguntas | 85,08 % | 86,75 % | +1,67 pp |
| MMLU Other | 1300 preguntas | 76,69 % | 78,00 % | +1,31 pp |

El autor indica que la diferencia global de +1,42 pp está dentro del ruido estadístico (IC 95 % de ±1,1 pp con N = 5700). Por asignaturas, las mayores subidas se dan en high school mathematics (+9 pp), elementary mathematics (+7 pp), college chemistry (+6 pp) y high school macroeconomics (+6 pp); las mayores caídas en moral scenarios (−9 pp), moral disputes (−3 pp), electrical engineering (−3 pp) y nutrition (−3 pp).

## Requisitos de hardware

- VRAM/memoria: el bundle está diseñado para Macs con 256 GB de memoria unificada (tag 256gb). El tamaño del repo es de 423,6 GB, por lo que se necesita espacio en disco suficiente además de la memoria para cargar el modelo.
- GPU recomendadas: Apple Silicon de gama alta con 256 GB de memoria unificada (por ejemplo, Mac Studio o Mac Pro con chip M-series Ultra de esa capacidad). No está pensado para GPUs NVIDIA convencionales en este formato.
- GPU de consumo: no cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en Macs con menos memoria unificada; el requisito de 256 GB lo excluye de la mayoría de equipos domésticos.
- Opciones de despliegue: librería MLX (formato nativo del bundle). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El modelo incorpora decodificación especulativa DSpark, que el autor presenta como mecanismo de aceleración, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales conocidas.

| Modelo | Parametros totales | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-JANG_2K (este) | 552,37 B | 1M | Sí (image-text-to-text) | other (deepseek-v41-flash-1017) | safetensors MLX |
| Base jangq/DeepSeek-V4.1-Flash-1017-JANG_2K | 552,37 B (mismo bundle) | 1M | Sí | other | safetensors MLX |
| DeepSeek-V4.1-Flash-1017 (original) | no disponible en la información | 1M (según tags del derivado) | Sí | deepseek-v41-flash-1017 | no disponible |

No se dispone de información sobre alternativas de otros fabricantes con parámetros, contexto y licencia comparables en el material proporcionado; por tanto, no se ofrece una comparación cuantitativa con modelos de terceros.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación del comportamiento de rechazo implica que el modelo puede generar contenido que el original declinaría. No es apto para despliegues públicos sin filtros externos de seguridad.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasas de alucinación; como todo modelo generativo, puede producir información incorrecta con aparente seguridad.
- Licencia restrictiva: la licencia "other" (deepseek-v41-flash-1017) remite al LICENSE del modelo original de DeepSeek; es imprescindible revisar sus condiciones antes de cualquier uso comercial. El autor no concede permisos adicionales explícitos.
- Requisito de hardware extremo: 256 GB de memoria unificada y 423,6 GB de repo limitan su uso a estaciones Apple Silicon de gama muy alta.
- Formato propietario: la cuantización JANG_2K y el formato MLX no son portables a otros runtimes sin conversión; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Idiomas: aunque soporta siete idiomas, no se han publicado evaluaciones por idioma; el rendimiento en tailandés, ruso o italiano no está verificado de forma independiente.
- Contexto de 1M: no se han publicado pruebas de recuperación en contextos largos (needle-in-a-haystack u otras); el rendimiento efectivo a 1M de tokens no está validado.
- Repo sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados reportados por el autor.
- Sin datos de entrenamiento ni de la técnica de ablación: no se puede evaluar el impacto de la modificación más allá del MMLU reportado.
- Benchmarks limitados: solo MMLU; no hay datos de código, matemáticas, visión ni agentes, pese a que el modelo declara esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-JANG_2K
- Modelo base del bundle: https://huggingface.co/jangq/DeepSeek-V4.1-Flash-1017-JANG_2K
- Licencia del modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- Perfil del autor en X: https://x.com/dealignai
- Apoyo al autor (Ko-fi): https://ko-fi.com/dealignai
