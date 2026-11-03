# dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-JANGHT1.4

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-JANGHT1.4 es una variante "abliterated" (sin comportamiento de rechazo) del bundle JANGHT1.4 de OsaurusAI, que a su vez repaqueta el modelo DeepSeek-V4.1-Flash-1017 de DeepSeek para su ejecución en MLX sobre Apple Silicon. El modelo original es un transformer de tipo Mixture-of-Experts (MoE) con 40 capas, 384 expertos enrutados más uno compartido, atención MLA, Hyper-Connections, CSA2 y tablas de n-gramas Engram en las capas 1 y 14, además de un tower de visión nativo y decodificación especulativa DSpark de 3 etapas. El bundle pesa 304,8 GB en el repositorio y ocupa unos 94,8 GiB en memoria residente, con las tablas Engram (203 GB) permaneciendo en SSD a precisión completa.

El problema que resuelve esta variante concreta es doble: por un lado, ofrece una distribución ejecutable en Macs de 128 GB o más mediante cuantización JANGHT a 1,4 bits por peso; por otro, elimina el comportamiento de rechazo del modelo base en los siete idiomas soportados (inglés, español, francés, ruso, italiano, tailandés y chino) sin modificar el resto del stack. Según la model card, el tower de visión, el drafter DSpark, las tablas Engram, los expertos enrutados, el tokenizador, la plantilla de chat y la configuración de generación son byte a byte idénticos al bundle base.

Es relevante ahora porque demuestra que es posible aplicar técnicas de abliteration sobre arquitecturas MoE modernas con contexto de 1M tokens y capacidades multimodales, manteniendo el rendimiento en MMLU dentro del margen de ruido estadístico (77,84 % frente a 77,30 % del base, con un intervalo de confianza del 95 % de ±1,1 pp). El modelo está pensado para investigación sobre alineamiento, evaluación de sesgos y despliegue local en hardware Apple de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA, Hyper-Connections, CSA2, Engram n-gram lookups (capas 1 y 14), tower de visión nativo y drafter DSpark de 3 etapas |
| Parametros totales | 31.530.338.928 (31,53 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | JANGHT1.4 (1,4 bits por peso); tablas Engram a precisión completa en SSD |
| Idiomas soportados | en, es, fr, ru, it, th, zh |
| Licencia | other (deepseek-v41-flash-1017) |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 40 capas con 384 expertos enrutados más un experto compartido. Incorpora atención MLA (Multi-head Latent Attention), Hyper-Connections, CSA2 (probablemente una variante de atención con compresión o sparse attention, aunque la model card no detalla su funcionamiento) y tablas de n-gramas Engram en las capas 1 y 14 que actúan como memorias de consulta de n-gramas. Dispone de un tower de visión nativo para entrada de imágenes y de un drafter DSpark de 3 etapas para decodificación especulativa. El contexto máximo es de 1M tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card de esta variante solo documenta el proceso de abliteration: se ha eliminado el comportamiento de rechazo manteniendo el resto del stack byte a byte idéntico al bundle base de OsaurusAI. La innovación técnica destacable del bundle es la cuantización JANGHT a 1,4 bpw, que permite que un MoE de 31,5 mil millones de parámetros quepa en 94,8 GiB de memoria residente en Macs de 128 GB, dejando las tablas Engram de 203 GB en SSD.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable en tres niveles de esfuerzo (low, high, max).
- Procesamiento de imágenes como entrada (pipeline image-text-to-text) mediante tower de visión nativo.
- Tool calling y function calling, orientado a flujos de agentes.
- Razonamiento multi-paso y uso en agentes autónomos.
- Capacidades multilingües en siete idiomas: inglés, español, francés, ruso, italiano, tailandés y chino.
- Decodificación especulativa DSpark para acelerar la generación.
- Comportamiento "uncensored": responde a preguntas que el modelo base rechazaría, en todos los idiomas y modos de razonamiento probados.
- Contexto de hasta 1M tokens para conversaciones y documentos largos.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo varía el comportamiento de un MoE multimodal al eliminar el rechazo, comparando directamente con el bundle base sobre el mismo conjunto de preguntas y semilla.
- Evaluación de sesgos y robustez: útil para auditar respuestas en dominios sensibles (sexualidad humana, temas controvertidos) en siete idiomas, con la ventaja de que el resto del stack es idéntico al base y las diferencias son atribuibles al proceso de abliteration.
- Despliegue local en Apple Silicon de gama alta: con 94,8 GiB residentes cabe en Macs de 128 GB, lo que permite ejecutar un MoE de 31,5 mil millones de parámetros con visión y contexto de 1M sin GPU dedicada.
- Procesamiento de documentos largos con imágenes: gracias al contexto de 1M tokens y al tower de visión, se puede usar para analizar informes, contratos o expedientes que combinen texto extenso y figuras.
- Agentes con tool calling en entornos controlados: el soporte de function calling y razonamiento multi-paso permite construir asistentes que consulten APIs o bases de datos internas, siempre con revisión humana dado el carácter uncensored.
- Generación de contenido multilingüe: para equipos que trabajen en inglés, español, francés, ruso, italiano, tailandés o chino y necesiten un modelo local que no dependa de servicios en la nube.
- Análisis de conversaciones multi-turno largas: el contexto de 1M tokens permite mantener historiales extensos sin truncamiento, útil en atención al cliente o en investigación cualitativa.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de MMLU sobre este bundle concreto, comparando base y uncensored.

| Benchmark | Base JANGHT1.4 | UNCENSORED (este) | Delta |
|---|---:|---:|---:|
| MMLU-5700 overall | 77,30 % (4406/5700) | 77,84 % (4437/5700) | +0,54 pp |
| MMLU STEM (n=1900) | 67,21 % | 67,37 % | +0,16 pp |
| MMLU Humanities (n=1300) | 81,54 % | 83,23 % | +1,69 pp |
| MMLU Social Sciences (n=1200) | 86,42 % | 86,17 % | −0,25 pp |
| MMLU Other (n=1300) | 79,38 % | 80,08 % | +0,69 pp |

La model card indica que el intervalo de confianza del 95 % a N=5700 es de ±1,1 pp, por lo que la diferencia global está dentro del ruido. El método de evaluación es logit scoring con una pasada forward y argmax sobre los tokens A/B/C/D, usando el propio encoder de chat del bundle. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 94,8 GiB residentes para el modelo cuantizado a 1,4 bpw, más 203 GB de tablas Engram que permanecen en SSD a precisión completa.
- Hardware objetivo: Apple Silicon con 128 GB de memoria unificada o más (requisito explícito de la model card).
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) ni en configuraciones de 48 GB o 80 GB sin técnicas adicionales de offloading no documentadas.
- Despliegue: librería MLX; la model card menciona una aplicación "vmlx-app" para ejecución en Mac.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-JANGHT1.4 (este) | 31,53 mil millones | 1M | other (deepseek-v41-flash-1017) | safetensors MLX | Cuantizado 1,4 bpw, uncensored, visión, 7 idiomas |
| OsaurusAI/DeepSeek-V4.1-Flash-1017-JANGHT1.4 (base) | 31,53 mil millones | 1M | other (deepseek-v41-flash-1017) | safetensors MLX | Mismo bundle sin abliteration; MMLU 77,30 % |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | no disponible en la información | 1M | deepseek-v41-flash-1017 | no disponible | Modelo de referencia de DeepSeek, octubre 2026 |

No se dispone de datos de benchmarks de los modelos comparables más allá del MMLU del bundle base, por lo que la comparación de rendimiento se limita a esa métrica.

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteration: responde a preguntas que el modelo base rechazaría. Esto implica un riesgo elevado de generar contenido dañino, ilegal o éticamente problemático, y no es apto para producción sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad en la información disponible.
- La licencia es "other" con nombre "deepseek-v41-flash-1017"; es necesario revisar el enlace de licencia del modelo original para conocer las restricciones de uso comercial, que no se detallan en la model card.
- Requiere hardware muy específico (Apple Silicon con 128 GB o más) y la librería MLX; no es portable a ecosistemas CUDA sin conversión adicional no documentada.
- El rendimiento en MMLU es moderado (77,84 %) y baja notablemente en STEM (67,37 %) y en materias como matemáticas de secundaria (27 %) y matemáticas universitarias (30 %).
- La cuantización a 1,4 bpw puede degradar capacidades finas de razonamiento, visión o tool calling respecto al modelo original en precisión completa; no se han publicado evaluaciones específicas de estas capacidades en este bundle.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de su comportamiento en producción.
- No se dispone de información sobre sesgos específicos más allá de los inherentes al modelo base.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-JANGHT1.4
- Modelo base del bundle: https://huggingface.co/OsaurusAI/DeepSeek-V4.1-Flash-1017-JANGHT1.4
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- X del autor: https://x.com/dealignai
- Ko-fi del autor: https://ko-fi.com/dealignai
