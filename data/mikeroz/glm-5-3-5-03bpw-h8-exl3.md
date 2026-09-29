# MikeRoz/GLM-5.3-5.03bpw-h8-exl3

# GLM-5.3 5.03bpw-h8-exl3

## Resumen

`MikeRoz/GLM-5.3-5.03bpw-h8-exl3` es una cuantización comunitaria en formato EXL3 (ExLlamaV3) a 5,03 bits por peso del modelo GLM-5.3 de Z.ai (organización `zai-org`). El modelo original es el buque insignia de la familia GLM-5 para generación de código y tareas de horizonte largo: 238.958.043.776 parámetros totales (unos 239.000 millones) en una arquitectura de mezcla de expertos (etiqueta de HuggingFace `glm_moe_dsa`), ventana de contexto de 1 millón de tokens y soporte de inglés y chino.

GLM-5.3 reutiliza el mismo modelo base que GLM-5.2: según su autor, todas las mejoras provienen del post-entrenamiento. Z.ai lo presenta como el modelo de pesos abiertos más capaz para código (un 50 % de mejora sobre GLM-5.2 en su Z.ai Code Bench interno) y como estado del arte de código abierto en Terminal Bench 3.0 y Agents' Last Exam, además de señalar capacidades emergentes de ciberseguridad, tanto en descubrimiento de vulnerabilidades como en explotación.

La relevancia de este repositorio concreto es práctica: los pesos cuantizados a 5,03 bpw ocupan aproximadamente 150 GB (239.000 millones × 5,03 bits), lo que permite servir un modelo de ese tamaño en servidores multi-GPU, aunque el repositorio completo ocupa 478,1 GB. No cabe en una GPU de consumo. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 «likes», y no existen benchmarks independientes de la propia cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiqueta de HuggingFace `glm_moe_dsa` (composición de expertos no detallada) |
| Parámetros totales | 238.958.043.776 (~239.000 millones), dato real de los safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M); las evaluaciones citadas usan 1M de contexto y 300.000 tokens con gestión de contexto según el benchmark |
| Tipos de cuantización | EXL3 a 5,03 bits por peso con cabeza de salida en 8 bits (sufijo `h8`); el modelo base admite otros formatos no detallados en este repositorio |
| Idiomas soportados | inglés (`en`) y chino (`zh`) |
| Licencia | `other` con nombre de licencia `glm-5.3` según HuggingFace; openlm.ai afirma que GLM-5.3 se publica bajo licencia MIT (discrepancia sin resolver) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

La información disponible confirma una arquitectura de mezcla de expertos (MoE) con la etiqueta de librería `glm_moe_dsa`, integrada en Transformers como `glm_moe_dsa`, y un total de 238.958.043.776 parámetros. No se publican en la información disponible el número de expertos, el número de parámetros activos por token, la configuración de capas ni el tipo exacto de atención (la etiqueta DSA sugiere atención dispersa, pero no se detalla). El modelo base trabaja con una ventana de 1 millón de tokens.

Sobre el entrenamiento, la model card es explícita: GLM-5.3 usa el mismo modelo base que GLM-5.2 y todas las ganancias proceden del post-entrenamiento, orientado a código complejo y tareas de horizonte largo. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas concretas; tampoco se detalla la innovación técnica más allá de los resultados. Sí se documentan dos mecanismos de control en inferencia: el parámetro `reasoning_effort` con tres niveles (`low`, `high`, `max`, por defecto `max`) para regular el presupuesto de pensamiento, y la opción `clear_thinking` (por defecto `false`, conviene pasar `true` en escenarios de chat). El repositorio referencia el identificador `arxiv:2602.15763` como informe técnico.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Generación y edición de código de nivel producción: el autor lo describe como el modelo de pesos abiertos más capaz para código, con un 50 % de mejora sobre GLM-5.2 en el Z.ai Code Bench interno.
- Razonamiento de horizonte largo y tareas agénticas sostenidas: 28,3 en Terminal Bench 3.0, 42,5 en SWE-Marathon (v1.1), 28,5 en Agents' Last Exam (ALE-CLI).
- Uso de herramientas y function calling: 73,0 en Toolathlon Verified y 62,5 en HLE w/ Tools.
- Razonamiento con presupuesto de cómputo ajustable mediante `reasoning_effort` (`low`, `high`, `max`), útil para equilibrar latencia y calidad.
- Ciberseguridad ofensiva y defensiva: 84,5 en CyberGym (descubrimiento de vulnerabilidades), 54,4 en ExploitBench y 105/130 en ExploitGym (2 h / 6 h).
- Automatización de flujos de trabajo: 48,2 en AutomationBench (v1.0.6), 58,0 en NL2Repo (generación de repositorios a partir de lenguaje natural).
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repositorio.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede resolver tareas de tipo SWE (parcheo de repositorios, ejecución de tests, iteración multi-paso) apoyándose en sus resultados en DeepSWE (66,9) y FrontierSWE (78,1), integrado en pipelines de CI/CD con tool calling.
- Migración o generación de repositorios completos: NL2Repo (58,0) mide la capacidad de construir un repositorio funcional desde una descripción en lenguaje natural con hasta 1M de contexto, útil para prototipado rápido de proyectos y scaffolding.
- Automatización de operaciones en terminal: Terminal Bench 2.1 (88,2) y 3.0 (28,3) reflejan destreza en tareas de línea de comandos, adecuada para asistentes de operaciones (SRE) que diagnostican y reparan sistemas.
- Auditoría de seguridad y gestión de vulnerabilidades: con CyberGym 84,5 y ExploitBench 54,4, encaja en equipos de seguridad que necesitan triaje automático de vulnerabilidades y validación de exploits en entornos controlados.
- Asistentes conversacionales de contexto muy largo: la ventana de 1M tokens permite mantener conversaciones o analizar documentación extensa en inglés y chino sin truncar, pasando `clear_thinking=true` para el modo chat.
- Orquestación de herramientas y flujos empresariales: Toolathlon Verified (73,0) y AutomationBench (48,2) respaldan su uso como planificador que invoca APIs, hojas de cálculo o sistemas internos en cadenas de varios pasos.
- Investigación y razonamiento asistido: HLE w/ Tools (62,5) con presupuesto de pensamiento ajustable permite usar el modelo tanto en modo rápido (`low`) como en modo de razonamiento intensivo (`max`) según el coste asumible.
- Base para ajuste fino y destilación: al ser pesos abiertos de 239.000 millones de parámetros, sirve de punto de partida para post-entrenamiento especializado, aunque requiere infraestructura multi-GPU.

## Benchmarks y rendimiento

Resultados publicados por Z.ai para GLM-5.3 (no específicos de esta cuantización EXL3):

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88,2 | 81,0 | 88,3 | 87,9 | 86,6 | 85,0 | 88,0 | **88,8** |
| Terminal Bench 3.0 | 28,3 | 4,6 | 17,4 | – | – | 21,1 | 33,7 | **34,6** |
| DeepSWE (v1.1) | 66,9 | 46,2 | 67,5 | 62,7 | 56,6 | 58,0 | 69,7 | **72,7** |
| NL2Repo | 58,0 | 48,9 | 58,0 | 61,1 | 55,9 | **69,7** | – | – |
| ProgramBench (Almost Solved) | 19,0 | 9,5 | 17,5 | – | 10,5 | 15,5 | **33,0** | 23,0 |
| FrontierSWE | 78,1 | 67,5 | – | – | – | 66,5 | **88,2** | – |
| SWE-Marathon (v1.1) | 42,5 | 19,4 | 48,1 | – | – | **48,8** | 33,1 | 42,5 |
| PostTrainBench | 39,8 | 31,7 | 32,0 | – | – | 32,9 | **41,8** | 36,2 |
| CyberGym | **84,5** | 77,2 | 80,0 | 83,3 | 78,5 | 78,1 | 83,8 | 83,6 |
| ExploitGym (2 h / 6 h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | **216 / 293** |
| ExploitBench | 54,4 | 24,4 | 32,2 | – | 28,8 | 40,0 | **78,0** | 76,5 |
| Toolathlon Verified | 73,0 | 59,9 | **76,5** | 74,1 | 72,5 | 76,2 | 74,7 | 74,9 |
| AutomationBench (v1.0.6) | **48,2** | 26,2 | 46,7 | 43,2 | 39,8 | 41,0 | 46,2 | 45,8 |
| Agents' Last Exam (ALE-CLI) | 28,5 | 23,8 | 27,6 | 25,7 | 27,0 | 25,7 | 23,8 | **28,6** |
| HLE w/ Tools | 62,5 | 54,7 | 59,8 | 60,0 | 56,2 | 57,9 | 63,9 | **64,5** |
| GDPval-AA v2 | **1769** | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Condiciones declaradas por el autor para HLE w/ tools: `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens, contexto máximo de 300.000 tokens con estrategia de gestión de contexto y GPT-5.6-luna (medium) como modelo juez. NL2Repo se evaluó con `temperature=1.0`, `top_p=1.0` y `max_new_tokens=64k` bajo contexto de 1M. No hay resultados de benchmarks publicados para esta cuantización EXL3 concreta.

## Requisitos de hardware

- Peso teórico de los pesos cuantizados: ~150 GB (238.958.043.776 parámetros × 5,03 bits), sin contar la cabeza en 8 bits ni otros tensores sin cuantizar. El repositorio completo ocupa 478,1 GB.
- VRAM estimada para inferencia: por encima de 150 GB solo para pesos; hay que sumar la caché KV, que no está cuantizada en este formato y crece con el contexto, por lo que en ventanas de cientos de miles o un millón de tokens puede ser el factor limitante. No hay cifras oficiales publicadas.
- GPU recomendadas: configuraciones de 2× A100 80 GB o 2× H100 80 GB como mínimo teórico justo para los pesos, y 4× A100/H100 80 GB o superior para trabajar con contexto largo y margen de caché KV. Una H200 de 141 GB no cubriría por sí sola los ~150 GB de pesos.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 5090 cubren el modelo; haría falta un clúster de al menos 6–7 tarjetas de 24 GB solo para los pesos, sin margen para la caché KV.
- Opciones de despliegue: para este formato EXL3 se necesita un motor compatible con EXL3 (ExLlamaV3 y servidores basados en él, como TabbyAPI), con soporte principalmente CUDA. El modelo base GLM-5.3 admite, según el autor, SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth y, en plataforma Ascend NPU, vLLM-Ascend, xLLM y SGLang; estos frameworks no implican soporte de la cuantización EXL3 concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Datos destacados de los benchmarks citados |
|---|---|---|---|---|---|
| GLM-5.3 (esta cuantización EXL3 5,03 bpw) | 238.958.043.776 | 1M | `other` / `glm-5.3` (openlm.ai cita MIT) | Pesos abiertos; cuantización comunitaria sin validación pública | CyberGym 84,5; Terminal Bench 2.1 88,2; HLE w/ Tools 62,5 |
| GLM-5.2 | no disponible | no disponible | no disponible | Pesos abiertos en `zai-org` | CyberGym 77,2; Terminal Bench 2.1 81,0; DeepSWE 46,2 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Toolathlon Verified 76,5; DeepSWE 67,5; CyberGym 80,0 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | NL2Repo 61,1; Toolathlon Verified 74,1; CyberGym 83,3 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | GDPval-AA v2 1739; Toolathlon Verified 72,5; CyberGym 78,5 |

La comparación se limita a los datos de la tabla de benchmarks publicada por Z.ai: no se dispone de especificaciones técnicas (parámetros, contexto, licencia) de los modelos alternativos en la información consultada. Frente a sus competidores directos, GLM-5.3 destaca en CyberGym (84,5, el mejor de la tabla), AutomationBench (48,2) y GDPval-AA v2 (1769), mientras que queda por detrás de Kimi K3 en Toolathlon Verified y de Opus 4.8 en NL2Repo y SWE-Marathon.

## Limitaciones y advertencias

- Se trata de una cuantización a 5,03 bits por peso: introduce pérdida de precisión respecto a los pesos originales. No hay evaluación pública del impacto de esta cuantización en los benchmarks, y 0 descargas y 0 «likes» implican ausencia de validación por terceros.
- Conflicto de licencia: HuggingFace declara `license: other` con nombre `glm-5.3`, mientras que openlm.ai afirma que GLM-5.3 se distribuye bajo licencia MIT. Antes de un uso comercial hay que verificar los términos reales de la licencia `glm-5.3`; el repositorio no aclara condiciones de uso comercial ni de redistribución de derivados.
- Sesgos conocidos: no documentados en la información disponible. Al estar entrenado principalmente en inglés y chino, el rendimiento en otros idiomas, incluido el español, es incierto.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplica a cualquier modelo generativo de este tipo, especialmente en tareas de código y agentes donde una alucinación puede propagarse en cadena.
- Capacidades de ciberseguridad de doble uso: el propio autor destaca mejoras «emergentes» en explotación (ExploitGym, ExploitBench). Su uso para descubrimiento de vulnerabilidades exige controles de acceso, aislamiento y cumplimiento normativo; un despliegue sin restricciones puede facilitar usos ofensivos.
- Los benchmarks proceden del fabricante, no de una evaluación independiente, y usan GPT-5.6-luna como juez en HLE w/ tools. Las notas metodológicas reconocen explícitamente estrategias de gestión de contexto y filtros anti-hacking (por ejemplo, juicio por reglas y por LLM en NL2Repo), lo que complica la reproducción exacta.
- Comportamiento por defecto en chat: `clear_thinking` es `false` si no se pasa; en escenarios conversacionales hay que pasar `clear_thinking=true` para evitar arrastrar el historial de razonamiento. `reasoning_effort` se fija en `max` ante cualquier valor no reconocido, con el coste de cómputo que implica.
- Restricciones de despliegue: el formato EXL3 no es compatible con todos los frameworks listados por el autor (SGLang, vLLM, KTransformers, Unsloth, Ascend NPU), que apuntan al modelo base. El requisito de más de 150 GB de VRAM descarta cualquier GPU de consumo y limita el uso a infraestructura de centro de datos.
- Las fechas del repositorio (creación el 28 de septiembre de 2026) y el identificador `arxiv:2602.15763` deben verificarse contra las fuentes primarias antes de citarlos.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/MikeRoz/GLM-5.3-5.03bpw-h8-exl3
- Repositorio del autor (variante Flash no censurada): https://huggingface.co/MikeRoz/GLM-5.3-Flash-Uncensored-2.51bpw-h6-exl3
- Repositorio oficial del modelo base: https://github.com/zai-org/GLM-5
- Blog oficial de Z.ai: https://z.ai/blog/glm-5.3
- Ficha en openlm.ai: https://openlm.ai/glm-5.3/
- Informe técnico referenciado en las etiquetas: arxiv:2602.15763
- Cookbook de SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentación de `glm_moe_dsa` en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
