# puwaer/DeepSeek-V4-Flash-0731-reap-150b

## Resumen

`puwaer/DeepSeek-V4-Flash-0731-reap-150b` es una versión comprimida del modelo DeepSeek-V4-Flash-0731 de DeepSeek, obtenida mediante poda de expertos enrutados con el método REAP (router-weighted expert activation pruning). El autor, puwaer, reduce el número de expertos por capa de 256 a 132 manteniendo las 43 capas decodales y los 6 expertos activos por token, sin realizar ningún paso de fine-tuning, destilación o gradiente: la poda se calcula en una sola pasada a partir de estadísticas de calibración. El resultado es un checkpoint que pasa de 156 GiB a 79 GiB, conservando la mayor parte del rendimiento original e incluso mejorando ligeramente la media de los benchmarks evaluados (0.8248 frente a 0.8168 del modelo base).

El modelo es un MoE (Mixture of Experts) de aproximadamente 150 mil millones de parámetros, licenciado bajo MIT y compatible con el ecosistema transformers. Incluye un `chat_template.jinja` transcrito del codificador Python original de DeepSeek, lo que facilita su despliegue en motores como SGLang o llama.cpp. Mantiene el modo de razonamiento (thinking) activado por defecto, con niveles de esfuerzo configurables, y elimina los módulos de predicción multi-token (MTP), por lo que no dispone de decodificación especulativa basada en MTP. Su relevancia actual radica en ofrecer un modelo de gran tamaño con capacidades de código y matemáticas a un coste de memoria significativamente menor, pensado para entornos con GPU limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con 43 capas decodales, 132 expertos enrutados por capa, 6 expertos activos por token |
| Parametros totales | 150.128.549.111 (~150B) |
| Parametros activos | No especificado (MoE; con 6 expertos activos por token, la proporción activa es una fracción del total) |
| Longitud de contexto | No disponible (el modelo base DeepSeek-V4-Flash-0731 soporta 1.000.000 tokens; este modelo no especifica su propia ventana) |
| Tipos de cuantizacion | MXFP4 (expert layout para Hopper), FP8 mencionado; se mencionan builds GGUF para llama.cpp (información incompleta) |
| Idiomas soportados | No disponible (no se especifica en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de 79 GiB); se menciona GGUF para llama.cpp sin detalle |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `deepseek-ai/DeepSeek-V4-Flash-0731` (304B parámetros, 256 expertos enrutados por capa) y le aplica una poda de expertos ponderada por la activación del router (REAP). El procedimiento, implementado en la herramienta `moe-compress`, reduce los expertos de 256 a 132 por capa manteniendo intactas las capas de atención y las proyecciones compartidas. No se realiza ningún paso de optimización: la selección de expertos se determina a partir de estadísticas de activación sobre un conjunto de calibración compuesto por una mezcla de datos de matemáticas (30%) y código (70%), sin usar datos de texto general (C4 al 0%). La compresión se ejecuta en modo streaming, leyendo y escribiendo una capa a la vez, lo que permite procesar un checkpoint de 156 GiB en una única GPU de 96 GB.

El modelo conserva el mismo `encoding/encoding_dsv4.py` del repositorio base (copiado verbatim), que es la autoridad para la construcción de prompts con tool calling, tokens de tarea internos y mensajes `developer` o `latest_reminder`. El `chat_template.jinja` incluido es una transcripción de `encode_messages()` que reproduce la cadena de prompts exacta para el subconjunto de system, user y assistant, incluyendo ambos modos de pensamiento y el parámetro `reasoning_effort`. El modelo elimina los módulos MTP (`mtp.0/1/2`), por lo que no dispone de decodificación especulativa basada en MTP y los motores que la busquen caerán en decodificación estándar.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos con modo de pensamiento (thinking) activado por defecto, configurable mediante `enable_thinking` y `reasoning_effort` (`low`, `high`, `max`).
- Razonamiento matemático y resolución de problemas de nivel MATH-500 con una puntuación de 0,7140 en el benchmark reportado.
- Generación de código con HumanEval+ (0,8963) y MBPP+ (0,7593), superando al modelo base en ambos casos.
- Soporte de tool calling y función de llamada a funciones a través del encoder Python original (`encoding/encoding_dsv4.py`), que incluye tokens de tarea internos y mensajes de tipo `developer` y `latest_reminder`.
- Capacidad de agentes y razonamiento multi-paso heredada del modelo base, aunque no se proporcionan benchmarks específicos de agente en esta versión.
- Capacidades multilingües no especificadas explícitamente; el modelo base de DeepSeek es multilingüe, pero esta variante no detalla los idiomas soportados.
- Integración con motores de inferencia como SGLang (verificado) y llama.cpp (con builds GGUF en proceso).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 1M tokens en el modelo base, aunque esta variante no especifica su ventana) y mantener el hilo de la conversación gracias al chat template incluido, reduciendo el coste de memoria frente al modelo original.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar o revisar código, con un rendimiento en HumanEval+ de 0,8963 que mejora al modelo base.
- Asistencia matemática y educativa: con una puntuación de 0,7140 en MATH-500, puede resolver problemas de matemáticas de nivel universitario y explicar el razonamiento paso a paso en modo de pensamiento.
- Desarrollo de agentes autónomos: gracias a su capacidad de razonamiento multi-paso y a la compatibilidad con el encoder que incluye tokens de tarea, puede actuar como base para agentes que planifican y ejecutan acciones en entornos controlados.
- Razonamiento de contexto largo: aunque la ventana exacta no se especifica, el modelo hereda la arquitectura del modelo base que soporta hasta 1M tokens; puede usarse para análisis de documentos extensos o resumen de largos informes técnicos.
- Investigación académica en compresión de modelos: sirve como caso de estudio de poda de expertos sin entrenamiento, permitiendo comparar el impacto de REAP frente a otras técnicas como REAM en términos de rendimiento y tamaño.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados (greedy, contexto de 4096 tokens, `enable_thinking=false`, servido con SGLang):

| Modelo | Expertos | Tamaño | GSM8K | MATH-500 | HumanEval+ | MBPP+ | Media |
|---|---|---|---|---|---|---|---|
| base 284b | 256 | 156 GiB | 0,9484 | 0,7060 | 0,8720 | 0,7407 | 0,8168 |
| REAP 200b | 178 | 104 GiB | 0,9401 | 0,6880 | 0,8720 | 0,7407 | 0,8102 |
| REAM 200b | 178 | 104 GiB | 0,8620 | 0,6080 | 0,8841 | 0,7698 | 0,7810 |
| **REAP 150b (este modelo)** | **132** | **79 GiB** | **0,9295** | **0,7140** | **0,8963** | **0,7593** | **0,8248** |
| REAM 150b | 132 | 79 GiB | 0,6922 | 0,5020 | 0,8537 | 0,7328 | 0,6952 |

Diferencia respecto al modelo base, en puntos porcentuales:

| GSM8K | MATH-500 | HumanEval+ | MBPP+ | Media |
|---|---|---|---|---|
| -1,90 | +0,80 | +2,44 | +1,85 | +0,80 |

El modelo REAP 150b supera al modelo base en MATH-500, HumanEval+ y MBPP+, y obtiene una media superior (+0,80 puntos). La calidad de reconstrucción durante la compresión (medida sobre una sonda de 4096 tokens) muestra una similitud coseno media de 0,9445 y un error L2 relativo medio de 0,2068.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en formato safetensors ocupa 79 GiB; con cuantización FP8 o MXFP4 se puede reducir aún más, pero no se proporciona un valor exacto. Para servirlo con SGLang se recomienda al menos 2 GPU de 96 GB (según la configuración de ejemplo con `--tp-size 2` y `--nnodes 2`).
- GPU recomendadas: GPU de clase Hopper (H100, H200) o Ampere con suficiente VRAM; la compresión se realizó en una única GPU de 96 GB, por lo que la inferencia con el checkpoint completo requiere al menos esa capacidad o varias GPU en paralelo.
- No cabe en GPU de consumo típica (RTX 4090, 24 GB) con el checkpoint completo; se necesitaría cuantización agresiva (por ejemplo, GGUF de baja precisión) para entornos de escritorio, aunque no se han publicado medidas concretas.
- Opciones de despliegue: SGLang (verificado, con el runner `flashinfer_mxfp4` para Hopper), llama.cpp (GGUF en preparación), y cualquier motor compatible con transformers.
- Latencia y throughput: no se han publicado cifras específicas; el modelo usa 6 expertos activos por token, lo que reduce el coste computacional frente a un MoE denso equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos | Contexto | GSM8K | MATH-500 | HumanEval+ | MBPP+ | Licencia |
|---|---|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 304B (total) | 256/capa | 1M tokens | 0,9484 | 0,7060 | 0,8720 | 0,7407 | MIT |
| **REAP 150b (este modelo)** | ~150B | 132/capa | no disponible | 0,9295 | 0,7140 | 0,8963 | 0,7593 | MIT |
| REAP 200b (variante del mismo autor) | ~200B | 178/capa | no disponible | 0,9401 | 0,6880 | 0,8720 | 0,7407 | MIT |
| REAM 150b (mismo tamaño, otro método) | ~150B | 132/capa | no disponible | 0,6922 | 0,5020 | 0,8537 | 0,7328 | MIT |

El modelo de 150B supera claramente a la variante REAM del mismo tamaño y mantiene un rendimiento cercano al modelo base de 284B (REAP 200b), con un checkpoint casi 2 veces menor. La licencia MIT permite uso comercial sin restricciones.

## Limitaciones y advertencias

- El modelo no incluye los módulos de predicción multi-token (MTP); cualquier motor que intente decodificación especulativa basada en MTP caerá en decodificación estándar, lo que puede reducir el throughput en entornos de alta demanda.
- La longitud de contexto exacta no está especificada para esta variante; aunque el modelo base soporta 1M tokens, no se confirma que esta poda la conserve íntegramente.
- El pensamiento (thinking) está activado por defecto y consume tokens antes de la respuesta final; si `max_tokens` no es suficientemente alto, el razonamiento puede truncarse antes de llegar a la respuesta.
- El muestreo por defecto usa `do_sample` con temperatura y top_p en lugar de greedy, lo que puede producir respuestas no deterministas; se recomienda fijar `temperature=0` para tareas de reproducción o evaluación.
- La calidad de reconstrucción medida (cosine media 0,9445) es un diagnóstico de compresión, no una métrica de calidad final; los benchmarks son la referencia principal.
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje de gran tamaño; no se han documentado sesgos específicos en la model card.
- El `chat_template.jinja` no implementa tool calling, tokens de tarea internos, ni mensajes `developer` o `latest_reminder`; para esas funciones es necesario usar el encoder Python original.
- La información sobre cuantización GGUF está incompleta; se menciona que se están preparando builds para llama.cpp, pero no se proporcionan detalles ni enlaces.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/puwaer/DeepSeek-V4-Flash-0731-reap-150b
- Modelo base DeepSeek-V4-Flash-0731: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio de la herramienta de compresión `moe-compress`: https://github.com/puwaer/moe-expert-compress
- DeepWiki del modelo base: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Model card de NVIDIA NIM para DeepSeek-V4-Flash-0731: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731/modelcard
- Documentación de API de NVIDIA: https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash-0731
- Papers de referencia citados en los tags: arxiv:2510.13999 y arxiv:2604.04356 (no se han podido verificar los títulos exactos en la información disponible)
