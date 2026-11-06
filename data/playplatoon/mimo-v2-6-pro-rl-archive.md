# playplatoon/MiMo-V2.6-Pro-RL-archive

## Resumen

MiMo-V2.6-Pro-RL es el checkpoint insignia de la serie MiMo-V2.6, desarrollada por Xiaomi a través del equipo XiaomiMiMo. Se trata de un modelo de lenguaje multimodal nativo (texto, imagen, vídeo y audio) con arquitectura Mixture of Experts (MoE) dispersa de 1,02 billones de parámetros totales y 42.000 millones activados por token, junto con una ventana de contexto de 1 millón de tokens. Su propuesta central es escalar el aprendizaje por refuerzo (RL) como mecanismo de auto-mejora, combinando cómputo de RL, diversidad de entornos y cómputo de evaluación en un único entrenamiento mixto.

El modelo resuelve el problema de entrenar agentes capaces de operar en tareas de horizonte largo (repositorios completos, trazas de herramientas, sesiones múltiples) sin fragmentar el entrenamiento por dominio. Para ello introduce técnicas como Groupwise Reward Synthesis (GRS) y Groupwise Advantage Redistribution (GAR), que sustituyen la señal binaria de recompensa por una evaluación agéntica que compara rollouts dentro de cada grupo, además de una fase de destilación on-policy multi-profesor (MOPD2) tras el RL mixto.

Es relevante ahora porque combina en un solo modelo capacidades de código, agentes generales, visión, vídeo, audio y ciberseguridad, con resultados que en varios benchmarks se acercan o superan a modelos propietarios de referencia como Claude Opus 5 o GPT-5.6 Sol. La ficha corresponde a un repositorio de archivo publicado por el usuario `playplatoon` bajo licencia MIT, que replica el checkpoint oficial de Xiaomi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa (Mixture of Experts) con backbone híbrido SWA; encoder de visión MiMo ViT de 681M parámetros (28 capas: 24 SWA + 4 Full); encoder de audio compuesto por AudioTokenizer de 308M + patch encoder de 127M; decodificador especulativo MTP de 5 capas |
| Parametros totales | 1.024.216.603.392 (1,02 billones) |
| Parametros activos | 42.000 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit, fp8 (según tags del repositorio); no se detallan otras variantes en la información disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE disperso con backbone híbrido de atención con ventana deslizante (SWA) y atención completa. El modelo integra encoders específicos por modalidad: un ViT de 681M parámetros para visión (24 capas SWA + 4 capas full), un AudioTokenizer de 308M parámetros y un patch encoder de audio de 127M. Incorpora además Multi-Token Prediction (MTP) mediante un decodificador especulativo de 5 capas, orientado a acelerar la generación. El contexto alcanza 1 millón de tokens, pensado para repositorios largos, trazas de herramientas y ejecuciones de agente multi-sesión.

El entrenamiento se articula en torno a un único pase de RL mixto ("You Only RL Once") que combina tareas de código, agentes generales, visión y ciberseguridad en el mismo batch, con múltiples harnesses mezclados para favorecer la transferencia de estrategias. Se emplea GRPO totalmente asíncrono con batches muy grandes (1.568 prompts × 16 rollouts por paso, miles de millones de tokens por actualización). La señal de recompensa se escala mediante Groupwise Agentic Grading: GRS construye rúbricas específicas de tarea offline a partir de rollouts contrastados y las fusiona con resultados de tests; GAR ordena trayectorias exitosas online y redistribuye la ventaja hacia soluciones de mayor calidad. Se añade un arranque en frío de autocorrección (el modelo reescribe sus propios turnos desalineados), endurecimiento de entorno, cribado adversarial y verificaciones cruzadas para mitigar el reward hacking. Tras el RL, la fase MOPD2 combina rollouts autónomos del estudiante con rollouts condicionados por prefijo (Teacher-Prefix y SFT-Prefix) para extender capacidades a tareas difíciles de verificar sin regenerar turnos previos.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento y resolución de tareas de código en entornos agénticos (DeepSWE, ProgramBench, MiMo Code Bench).
- Comprensión y generación sobre imagen (vision-language).
- Comprensión de vídeo (video-understanding).
- Procesamiento de audio mediante AudioTokenizer y patch encoder dedicados.
- Soporte de tool calling y function calling en flujos de agente.
- Ejecución de agentes multi-paso con terminal, navegador y sistemas operativos (Terminal Bench, OSWorld, AutomationBench).
- Capacidades de ciberseguridad evaluadas en CyberGym.
- Autocorrección y reflexión sobre turnos propios desalineados (cold start de autocorrección).
- Decodificación especulativa mediante MTP de 5 capas para reducir latencia.
- Capacidades multilingües limitadas a inglés y chino según la model card.

## Casos de uso

- Agente de código en producción: el modelo puede operar sobre repositorios completos gracias al contexto de 1M tokens, ejecutar parches, lanzar tests y encadenar tool calls dentro de pipelines de CI/CD. Sus resultados en DeepSWE v1.1 (71,9) y MiMo Code Bench (63,2) lo sitúan como candidato para automatización de tareas de ingeniería.
- Automatización de tareas de escritorio y terminal: con soporte para OSWorld-Verified (82,0) y Terminal Bench 2.1 (89,9), puede controlar entornos de sistema operativo y terminal para tareas de administración, instalación y diagnóstico.
- Atención al cliente multimodal: al aceptar texto, audio e imagen en un mismo modelo, permite gestionar conversaciones donde el usuario adjunta capturas o mensajes de voz, manteniendo contexto largo entre sesiones.
- Análisis de vídeo y audio para moderación o resumen: el encoder de vídeo y el AudioTokenizer permiten procesar contenido multimedia y generar resúmenes o clasificaciones dentro de un pipeline único.
- Agente de ciberseguridad defensiva: las capacidades evaluadas en CyberGym permiten usarlo en tareas de análisis de vulnerabilidades, revisión de configuraciones y triaje de alertas, siempre con supervisión humana.
- Automatización de flujos empresariales con herramientas: Toolathlon-Verified (76,9) y AutomationBench (53,1) indican que puede orquestar APIs y herramientas en tareas de back-office, como generación de informes o gestión de tickets.
- Asistente de investigación sobre documentación extensa: el contexto de 1M tokens permite cargar manuales, papers o bases de código completas y hacer preguntas con trazabilidad sobre el contenido.
- Evaluación y generación de rúbricas: el enfoque GRS/GAR del entrenamiento lo hace útil como evaluador agéntico de soluciones en pipelines de RLHF o de control de calidad.

## Benchmarks y rendimiento

Resultados publicados en la model card del checkpoint oficial (MiMo-V2.6 Pro), comparados con MiMo-V2.6 Flash, MiMo-V2.5 Pro, Claude Opus 5, GPT-5.6 Sol y Claude Fable 5:

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

La model card incluida en la información disponible se interrumpe en la sección de ciberseguridad (CyberGym), por lo que no se dispone del resto de resultados. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,02 billones de parámetros totales, en fp8 se requieren del orden de 1 TB de memoria; en 8-bit, aproximadamente la misma cifra. No es viable en GPUs de consumo individuales.
- GPU recomendadas: despliegue multi-GPU en clústeres con A100 80GB, H100 80GB o H200; se necesitan varias decenas de aceleradores para alojar los pesos completos.
- GPU de consumo: no cabe en RTX 4090 ni en ninguna GPU consumer actual, ni siquiera con cuantización agresiva, dado el tamaño del checkpoint (573,5 GB en el repositorio).
- Opciones de despliegue: transformers con `custom_code` (requerido por la arquitectura), vLLM o TGI para servir en clúster; llama.cpp y Ollama no son opciones realistas por el tamaño.
- Latencia y throughput: no disponibles en la información proporcionada. El decodificador especulativo MTP de 5 capas está diseñado para reducir la latencia de generación, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidades | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-RL | 1,02B totales / 42B activos | 1M | MIT | Texto, imagen, vídeo, audio | Hugging Face, ModelScope |
| MiMo-V2.6-Flash-RL | no disponible | no disponible | no disponible | no disponible | Hugging Face, ModelScope |
| Claude Opus 5 | no disponible | no disponible | propietaria | no disponible | API |
| GPT-5.6 Sol | no disponible | no disponible | propietaria | no disponible | API |
| Claude Fable 5 | no disponible | no disponible | propietaria | no disponible | API |

En rendimiento agéntico, MiMo-V2.6 Pro supera a Claude Opus 5 en AutomationBench (53,1 frente a 50,3), Agents' Last Exam (empate a 31,6) y Terminal Bench 2.1 (89,9 frente a 89,1), y queda por debajo en DeepSWE v1.1, ProgramBench, Toolathlon-Verified, Terminal Bench 4.0 y JobBench. Frente a GPT-5.6 Sol, gana en DeepSWE v1.1, MiMo Code Bench, AutomationBench, Toolathlon-Verified, GDPval-AA 2.1, Agents' Last Exam, Terminal Bench 2.1 y JobBench.

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Alucinación: no se documentan tasas específicas; como modelo generativo de gran escala, mantiene riesgo de fabricación de hechos, especialmente en tareas de código y agentes.
- Sesgos: no se detallan en la información disponible; la composición del dataset de entrenamiento no está publicada en la model card.
- Licencia: MIT permite uso comercial, pero el repositorio es un archivo publicado por un tercero (`playplatoon`), no el oficial de Xiaomi; conviene verificar la integridad de los pesos antes de usarlos en producción.
- Requisitos de hardware: el tamaño del checkpoint (573,5 GB) y los 1,02B de parámetros hacen inviable el despliegue en infraestructura de consumo; requiere clúster multi-GPU.
- Ciberseguridad: las capacidades en dominios ofensivos deben desplegarse con salvaguardas y supervisión humana.
- Reward hacking: aunque el entrenamiento incluye verificaciones cruzadas y cribado adversarial, los sistemas basados en RL con evaluadores automáticos pueden presentar comportamientos que exploten las rúbricas.
- Contexto largo: aunque se declara 1M tokens, no se publican evaluaciones específicas de recuperación en contextos extremos.
- Fecha del repositorio: creado el 25 de octubre de 2026, lo que sitúa el checkpoint en el futuro respecto a la fecha habitual de consulta; conviene confirmar la vigencia de los enlaces oficiales.

## Enlaces

- Repositorio Hugging Face del archivo: https://huggingface.co/playplatoon/MiMo-V2.6-Pro-RL-archive
- Checkpoint oficial en Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Checkpoint oficial en ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Checkpoint Flash en Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Blog oficial: https://mimo.xiaomi.com/mimo-v2-6
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- Informe técnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Repositorio GitHub: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
