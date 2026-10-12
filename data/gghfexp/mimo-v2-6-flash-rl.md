# gghfexp/mimo-v2.6-flash-rl

## Resumen

MiMo-V2.6-Flash-RL es el checkpoint equilibrado en eficiencia de la serie MiMo-V2.6, desarrollada por Xiaomi (organización XiaomiMiMo en HuggingFace). Se trata de un modelo de mezcla de expertos (MoE) dispersa con 309 000 millones de parámetros totales y 15 000 millones activos por token, una ventana de contexto de 1 000 000 de tokens y soporte nativo de texto, imagen, vídeo y audio. El repositorio analizado, gghfexp/mimo-v2.6-flash-rl, es un espejo publicado por un tercero; el repositorio oficial es XiaomiMiMo/MiMo-V2.6-Flash-RL y se distribuye bajo licencia MIT.

El modelo está diseñado para escalar el aprendizaje por refuerzo (RL) hacia la automejora: la serie entrena de forma conjunta tareas de código, agentes generales, visión y ciberseguridad en una única ejecución mixta de RL, en lugar de hacerlo con ejecuciones separadas por dominio. Esto resulta relevante para desarrolladores que necesitan un modelo abierto capaz de ejecutar flujos agénticos de horizonte largo (repositorios completos, trazas de herramientas y sesiones múltiples) dentro de un único contexto de 1M tokens.

Su interés actual radica en que combina capacidades omnimodales y agénticas con una licencia permisiva (MIT) y una arquitectura que, pese a los 309B totales, solo activa 15B por token, lo que reduce el coste de cómputo por token en inferencia frente a un modelo denso de tamaño equivalente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE dispersa (Mixture of Experts) con backbone híbrido de atención de ventana deslizante (SWA) |
| Parámetros totales | 309 000 millones (309B) |
| Parámetros activos | 15 000 millones (15B) |
| Longitud de contexto | 1 000 000 tokens (1M) |
| Tipos de cuantización | fp8 (según la etiqueta del repositorio); no se documentan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modalidades de entrada | texto, imagen, vídeo y audio |
| Encoder de visión | MiMo ViT de 681M de parámetros (28 capas: 24 SWA + 4 full attention) |
| Encoder de audio | AudioTokenizer de 308M + encoder de parches de audio de 127M |
| Decodificación especulativa | Multi-Token Prediction (MTP) con decodificador de 5 capas |
| Tamaño del repositorio | 172,9 GB |
| Organización | XiaomiMiMo (espejo: gghfexp) |
| Fecha de publicación | 12 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es una MoE dispersa con 309B de parámetros totales y 15B activos, construida sobre un backbone híbrido que combina atención de ventana deslizante (SWA) con capas de atención completa; el encoder de visión replica este patrón (24 capas SWA y 4 full). El modelo incorpora componentes multimodales nativos: un encoder de visión MiMo ViT de 681M de parámetros y un subsistema de audio compuesto por un AudioTokenizer de 308M más un encoder de parches de audio de 127M. Para acelerar la generación incluye un decodificador especulativo basado en Multi-Token Prediction (MTP) de 5 capas.

En cuanto al entrenamiento, la serie se apoya en una única ejecución mixta de RL que cubre código, agentes generales, visión y ciberseguridad ("You Only RL Once"), con tareas y distintos *harnesses* mezclados en el mismo lote. El algoritmo es Group Relative Policy Optimization (GRPO) totalmente asíncrono sobre lotes muy grandes: 1 568 prompts × 16 rollouts por paso, con miles de millones de tokens por actualización. La señal de recompensa se escala mediante Groupwise Agentic Grading, que combina Groupwise Reward Synthesis (GRS, rúbricas específicas construidas offline a partir de rollouts contrastados y fusionadas con resultados de test) y Groupwise Advantage Redistribution (GAR, que ordena las trayectorias exitosas online y desplaza la ventaja hacia las soluciones de mayor calidad). El proceso se inicia con un *cold start* de autocorrección ("Aligned RL"), con endurecimiento del entorno, cribado adversarial y verificación cruzada para mitigar el *reward hacking*. Tras el RL se aplica MOPD2 (Multi-Prefix Multi-Teacher On-Policy Distillation), que combina rollouts autónomos del estudiante con rollouts de un solo turno condicionados por prefijo. El número de tokens de preentrenamiento y la composición exacta del dataset no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno en inglés y chino.
- Comprensión de imágenes y vídeo mediante el encoder MiMo ViT de 681M de parámetros.
- Comprensión de audio mediante el AudioTokenizer de 308M y el encoder de parches de 127M.
- Ejecución de tareas de código y agentes de software: los resultados en DeepSWE v1.1 (67,9), ProgramBench (26,0) y MiMo Code Bench (61,2) indican capacidad de resolución de problemas de ingeniería en entornos reales.
- Comportamiento agéntico y uso de herramientas: AutomationBench v1.0.6 (52,3), Toolathlon-Verified (73,6), Terminal Bench 2.1 (87,6) y OSWorld-Verified (80,8) reflejan desempeño en automatización, uso de utilidades de terminal y control de entorno de escritorio.
- Contexto largo de 1M tokens para repositorios completos, trazas de herramientas y sesiones agénticas prolongadas.
- *Thinking* / razonamiento extendido implícito en el diseño de RL sobre múltiples *harnesses*; no se documenta explícitamente un modo de pensamiento conmutable en la información disponible.
- Capacidades en ciberseguridad evaluadas en la serie (la tabla de resultados se corta en esa sección en la información proporcionada).
- Soporte de llamada a funciones: no se declara explícitamente en la model card; se infiere del rendimiento en benchmarks de agentes y uso de herramientas, pero no está confirmado como característica documentada.

## Casos de uso

- Automatización de atención al cliente multilingüe (inglés y chino): con 1M tokens de contexto el modelo puede mantener el historial completo de una conversación multi-turno y el estado de la cuenta sin truncar, y el soporte de audio permite atender entradas de voz.
- Agentes de programación sobre repositorios completos: el contexto de 1M tokens permite cargar ficheros, trazas de ejecución y documentación de un repositorio entero; los resultados en DeepSWE v1.1 y MiMo Code Bench lo sitúan como candidato para tareas de corrección de errores y generación de parches.
- Automatización de operaciones en terminal y CI/CD: el rendimiento en Terminal Bench 2.1 (87,6) indica que puede encadenar comandos, interpretar salidas y decidir el siguiente paso en pipelines de integración y despliegue.
- Control de escritorio y RPA: con OSWorld-Verified en 80,8 el modelo es adecuado para pilotar interfaces gráficas y ejecutar flujos de trabajo ofimáticos automatizados.
- Análisis de vídeo para moderación o vigilancia industrial: el encoder de visión de 681M y el contexto largo permiten procesar secuencias extensas y razonar sobre eventos a lo largo del tiempo.
- Transcripción y razonamiento sobre audio: entrevistas, reuniones o llamadas de soporte pueden transcribirse (AudioTokenizer de 308M) y analizarse en la misma ventana de contexto que el texto asociado.
- Asistentes de investigación y revisión de literatura: combinación de entrada multimodal (PDFs renderizados como imagen, figuras, vídeo de presentaciones) con razonamiento de contexto largo.
- Auditoría de seguridad y análisis de ciberseguridad: la serie incluye ciberseguridad entre los dominios del RL mixto, lo que permite emplearlo en triaje de alertas y análisis de trazas, siempre con supervisión humana.

## Benchmarks y rendimiento

Datos extraídos de la model card oficial (los valores son los publicados por el autor; la sección de ciberseguridad queda truncada en la información disponible):

| Benchmark | MiMo-V2.6 Pro | MiMo-V2.6 Flash | MiMo-V2.5 Pro | Claude Opus 5 | GPT-5.6 Sol | Claude Fable 5 |
|---|---|---|---|---|---|---|
| DeepSWE v1.1 | 71,9 | 67,9 | 19,0 | 74,0 | 73,0 | 70,0 |
| ProgramBench | 26,5 | 26,0 | 12,5 | 37,0 | 25,0 | 33,0 |
| MiMo Code Bench | 63,2 | 61,2 | 40,4 | 68,6 | 59,3 | no disponible |
| AutomationBench v1.0.6 | 53,1 | 52,3 | 16,0 | 50,3 | 45,8 | 46,2 |
| Toolathlon-Verified | 76,9 | 73,6 | 49,1 | 80,6 | 74,9 | 77,9 |
| GDPval-AA 2.1 | 1673 | no disponible | 1107 | 1708 | 1588 | 1595 |
| Agents' Last Exam | 31,6 | 27,6 | 13,2 | 31,6 | 30,8 | 25,7 |
| Terminal Bench 4.0 | 34,9 | 28,8 | 1,5 | 49,0 | 39,9 | 42,4 |
| Terminal Bench 2.1 | 89,9 | 87,6 | 65,2 | 89,1 | 88,8 | 84,3 |
| OSWorld-Verified | 82,0 | 80,8 | no disponible | 83,4 | 83,0 | 86,0 |
| JobBench | 62,0 | 61,2 | 25,0 | 65,7 | 45,4 | 57,4 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, ni datos de la sección de ciberseguridad, que aparece truncada.

## Requisitos de hardware

- Peso de los pesos en memoria (estimación a partir de 309B de parámetros): ~618 GB en bf16, ~309 GB en fp8 y ~155 GB en cuantización de 4 bits.
- El repositorio ocupa 172,9 GB, dato que debe contrastarse con el checkpoint completo, ya que el tamaño real en disco depende de la cuantización efectivamente publicada.
- La caché KV para una ventana de 1M tokens es un factor crítico adicional; no se dispone de cifras oficiales en la información proporcionada.
- GPU recomendadas para fp8: 4×H100 80 GB (320 GB) como mínimo ajustado, y 8×H100/H200 para margen operativo y lotes concurrentes.
- GPU recomendadas para 4 bits: 2×H100 80 GB (160 GB) de forma ajustada, 4×H100 80 GB con holgura; alternativas H200 (141 GB) o A100 80 GB.
- No cabe en GPU de consumo: ni una RTX 4090 (24 GB) ni configuraciones de 2×RTX 4090 (48 GB) pueden alojar los pesos, aunque los 15B activos reduzcan el cómputo por token.
- Opciones de despliegue: vLLM y SGLang son las vías habituales para MoE de gran tamaño; TGI es una alternativa. El uso de llama.cpp u Ollama no está confirmado para esta arquitectura, que usa `custom_code` y probablemente requiera `trust_remote_code=True`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | DeepSWE v1.1 | Terminal Bench 2.1 | Disponibilidad |
|---|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL | 309B totales / 15B activos | 1M | MIT | 67,9 | 87,6 | Pesos abiertos en HuggingFace y ModelScope |
| MiMo-V2.6-Pro-RL | no disponible | 1M | MIT | 71,9 | 89,9 | Pesos abiertos en HuggingFace y ModelScope |
| MiMo-V2.5-Pro | no disponible | no disponible | MIT | 19,0 | 65,2 | Pesos abiertos en HuggingFace |
| Claude Opus 5 | no disponible | no disponible | propietaria | 74,0 | 89,1 | Solo API |
| GPT-5.6 Sol | no disponible | no disponible | propietaria | 73,0 | 88,8 | Solo API |

La comparación se limita a los datos publicados en la tabla de evaluación del autor. No se dispone de información sobre parámetros, contexto o licencia de los modelos propietarios de referencia.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea inferior.
- Riesgo de alucinación: no se publican métricas de veracidad ni evaluaciones de *hallucination* en la información disponible.
- Sesgos: no se documentan análisis de sesgo, toxicidad o alineación más allá de la descripción cualitativa del proceso de "Aligned RL".
- *Reward hacking*: aunque el autor describe mecanismos de mitigación (endurecimiento del entorno, cribado adversarial y verificación cruzada), el entrenamiento con RL sobre recompensas sintéticas mantiene el riesgo de comportamientos que explotan el *grader*.
- Licencia MIT: permisiva y compatible con uso comercial, sin restricciones de campo de uso; conviene verificar los términos de los componentes de terceros (encoders, tokenizadores) si se redistribuye.
- Repositorio espejo: la ficha analizada (gghfexp/mimo-v2.6-flash-rl) no es la oficial; para producción debe usarse XiaomiMiMo/MiMo-V2.6-Flash-RL y validar la integridad de los pesos.
- Requiere `trust_remote_code` por el uso de código personalizado, lo que implica ejecutar código del repositorio en el entorno de inferencia.
- Coste de despliegue elevado: aunque solo se activen 15B por token, es necesario mantener en memoria los 309B de parámetros, lo que excluye GPU de consumo.
- Contexto de 1M tokens: no se documentan métricas de recuperación efectiva a esa distancia ("lost in the middle") ni el coste real de caché KV.
- No se documentan resultados en benchmarks de seguridad, sesgo o robustez adversarial.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/gghfexp/mimo-v2.6-flash-rl
- Repositorio oficial: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Repositorio oficial de la variante Pro: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- ModelScope (variante Pro): https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Pro-RL
- ModelScope (variante Flash): https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Informe técnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Blog de la serie: https://mimo.xiaomi.com/mimo-v2-6
- Plataforma API: https://platform.xiaomimimo.com
- Estudio web: https://aistudio.xiaomimimo.com
- Aplicación de escritorio: https://mimo.xiaomimimo.com/desktop/
- Repositorio GitHub de MiMo: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
- Grupo de WeChat: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro/blob/main/assets/wechat.jpg
