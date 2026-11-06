# pbDO/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una versión modificada del modelo DeepSeek-V4.1-Flash, publicada por el usuario pbDO bajo la licencia MIT. La modificación consiste en una "abliteración" a nivel de pesos: se han eliminado quirúrgicamente los mecanismos de rechazo del modelo base (las rutas que le llevan a negarse a responder ciertas peticiones) preservando, según el autor, el resto de capacidades críticas como la visión, el razonamiento, la memoria Engram, la atención dispersa CSA2 y la cabeza de borrador especulativa DSpark. El checkpoint resultante se carga exactamente igual que el modelo base, sin hooks en tiempo de ejecución ni vectores de dirección.

El modelo base es un transformer causal encoder-decoder de tipo MoE (mezcla de expertos) con 763.205.315.794 parámetros totales según los safetensors del repositorio, aunque la model card del autor describe un backbone de 552B con 8B/16B activos por token. Incorpora 20+20 capas, 384 expertos enrutados con top-6 más un experto compartido, Hyper-Connections de 4 canales residuales, atención dispersa CSA2, memoria de n-gramas Engram y una torre de visión DeepSeek-ViT con RoPE 2D y pixel unshuffle. La longitud de contexto declarada es de 1M de tokens.

La relevancia de esta ficha es doble: por un lado documenta un modelo multimodal de gran escala con contexto extremo y arquitectura MoE avanzada; por otro, advierte de que se trata de una variante sin salvaguardas, con implicaciones legales y de seguridad importantes para cualquier uso en producción. El repositorio tiene 26 descargas y 0 likes en el momento de la consulta, y ocupa 510,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder, MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections (4 canales residuales), CSA2 sparse attention, Engram n-gram memory, DSpark speculative draft, torre de visión DeepSeek-ViT |
| Parametros totales | 763.205.315.794 (según safetensors); la model card indica 552B de backbone con 8B/16B activos por token |
| Parametros activos | 8B/16B por token (según model card) |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | FP8 (e4m3fn) nativo con block-scale E8M0 [32, 32]; expertos enrutados en FP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina un transformer causal encoder-decoder de 20+20 capas con una mezcla de expertos de gran escala: 384 expertos enrutados con selección top-6 más un experto compartido, lo que permite activar solo una fracción de los parámetros por token (8B/16B activos según la model card). Sobre esta base se añaden Hyper-Connections de 4 canales residuales, atención dispersa CSA2, una memoria de n-gramas Engram y una cabeza de borrador especulativa DSpark para decodificación especulativa. La torre de visión DeepSeek-ViT emplea RoPE 2D y pixel unshuffle para el procesamiento de imágenes. Los pesos se almacenan en FP8 (e4m3fn) con escalas de bloque E8M0 [32, 32], y los expertos enrutados en FP4, de forma nativa y sin cambios respecto al modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base, más allá de lo que la model card cita indirectamente. La modificación de esta variante es exclusivamente a nivel de pesos: según el autor, se elimina el "circuito de rechazo" manteniendo byte-idénticos los componentes críticos para las capacidades (expertos enrutados, memoria Engram, atención dispersa CSA2, cabeza DSpark, torre de visión, puertas del router, normas y embeddings). No hay `model.py` personalizado, hooks en tiempo de ejecución ni vectores de dirección.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text) con contexto de hasta 1M tokens.
- Razonamiento explícito con modo "thinking" (effort ajustable: off y max), según la model card.
- Soporte de tool calling y function calling (el tag `endpoints_compatible` sugiere compatibilidad con endpoints estándar).
- Capacidades de agente y razonamiento multi-paso.
- Procesamiento de imágenes mediante torre de visión DeepSeek-ViT.
- Decodificación especulativa mediante la cabeza DSpark.
- Memoria de n-gramas Engram para recuperación de contexto largo.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo sin salvaguardas: el autor declara la eliminación de los mecanismos de rechazo, con una tasa de cumplimiento del 100 % en HarmBench-320 según su propia evaluación.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo sin salvaguardas frente a uno con ellas, comparando tasas de rechazo y cumplimiento en conjuntos como HarmBench. Es adecuado porque el autor publica métricas comparativas base vs. modificado.
- Análisis de documentos extensos con imágenes: gracias al contexto de 1M tokens y a la torre de visión, se puede procesar un corpus largo de informes con figuras en una sola pasada, manteniendo coherencia multi-turno.
- Generación de código en pipelines de CI/CD: el soporte de tool calling y la compatibilidad con endpoints permiten integrarlo en flujos automatizados de revisión y generación de parches, aunque requiere auditoría previa por la ausencia de salvaguardas.
- Asistentes de razonamiento multi-paso: el modo thinking con effort ajustable permite tareas de planificación y descomposición de problemas complejos, con trazas de razonamiento verificables.
- Procesamiento de documentación técnica multimodal: extracción y resumen de información de manuales con diagramas, tablas e imágenes, aprovechando la fusión visión-lenguaje.
- Evaluación comparativa de cuantizaciones: al ser un checkpoint FP8 nativo con expertos FP4, sirve para medir el impacto de la cuantización en tareas de razonamiento y visión frente al modelo base.
- Investigación sobre abliteración: permite reproducir y auditar la metodología del autor comparando pesos y activaciones con el modelo base.

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente de la model card del autor y comparan el modelo modificado (CRACK) con el base. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible más allá de MMLU-14k y HarmBench-320.

| Benchmark | Base | CRACK | Delta |
|---|---:|---:|---:|
| HarmBench-320, effort=off (ASR) | 42,81 % | 100,00 % | +57,19 pp |
| HarmBench-320, effort=max (ASR) | 1,56 % | 100,00 % | +98,44 pp |
| MMLU-14k (accuracy) | 86,96 % | 82,74 % | -4,22 pp |
| MMLU-14k excl. ética (accuracy) | no disponible | no disponible | -1,1 pp |

Desglose por categoría de HarmBench-320 (ASR, effort=off / effort=max):

| Categoría | Items | Base off | CRACK off | Base max | CRACK max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

En MMLU-14k, la mayor caída por asignatura se da en moral_scenarios (76,9 % → 37,0 %, -39,89 pp), seguida de professional_law (-7,04 pp) y abstract_algebra (-6,00 pp). Excluyendo el clúster de ética, la caída es de -1,1 pp. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 510,3 GB en FP8 con expertos FP4, por lo que la inferencia completa requiere al menos ese orden de magnitud de memoria. No se dispone de estimaciones de VRAM para cuantizaciones adicionales.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño, se necesitan configuraciones multi-GPU de clase A100/H100 con memoria agregada muy superior a 500 GB.
- Cabe en consumer GPU: no, el tamaño del checkpoint (510,3 GB) excede con creces la VRAM de cualquier GPU de consumo actual.
- Opciones de despliegue: transformers (librería declarada); el tag `endpoints_compatible` sugiere compatibilidad con endpoints estándar. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (base) | 552B backbone, 8B/16B activos | 1M | no disponible | Hugging Face | Modelo original con salvaguardas; MMLU-14k 86,96 % |
| pbDO/DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763.205.315.794 totales | 1M | MIT | Hugging Face (26 descargas) | Variante abliterada; MMLU-14k 82,74 % |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la búsqueda |

## Limitaciones y advertencias

- Ausencia total de salvaguardas: el autor declara una tasa de cumplimiento del 100 % en HarmBench-320, incluidas categorías de riesgo químico/biológico, cibercrimen, acoso y desinformación. No debe desplegarse en aplicaciones de cara al público sin capas de moderación externas.
- Riesgo legal: aunque la licencia es MIT, el uso para generar contenido dañino puede infringir normativas de la UE (por ejemplo, la Ley de Servicios Digitales o la Ley de IA) y de otras jurisdicciones. La licencia no exime de responsabilidad legal por el uso.
- Degradación en MMLU: caída de 4,22 pp en MMLU-14k, con un descenso de 39,89 pp en moral_scenarios. El rendimiento en tareas éticas y legales es sustancialmente peor que el del modelo base.
- Idiomas no especificados: no se dispone de información sobre el soporte multilingüe ni sobre el rendimiento en castellano.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo base y sus variantes de gran escala son propensos a alucinar en tareas de conocimiento factual.
- Tamaño prohibitivo: 510,3 GB de checkpoint impiden su uso en hardware de consumo y limitan el despliegue a infraestructura de centro de datos.
- Procedencia y reproducibilidad: la modificación la publica un usuario individual (pbDO) sin revisión por pares; las métricas de HarmBench y MMLU provienen de la propia model card del autor y no han sido verificadas de forma independiente.
- Fecha de creación futura (2026-10-29): la fecha del repositorio es posterior a la actual, lo que puede indicar un error de metadatos o una publicación programada; conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/pbDO/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- X del autor: https://x.com/dealignai
- X del autor: https://x.com/jordanschenck
