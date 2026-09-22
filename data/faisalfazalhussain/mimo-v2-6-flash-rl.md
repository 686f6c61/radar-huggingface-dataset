# FAISALFAZALHUSSAIN/MiMo-V2.6-Flash-RL

## Resumen

MiMo-V2.6-Flash-RL es un modelo multimodal de tipo sparse Mixture of Experts (MoE) con 309.000 millones de parámetros totales y 15.000 millones activados por token, desarrollado por Xiaomi dentro de la familia MiMo. Su propuesta central es escalar el aprendizaje por refuerzo (RL) hasta convertirlo en un bucle de auto-mejora: en lugar de entrenar por separado dominios como código, agentes, visión o ciberseguridad, se ejecuta una única pasada de RL mixta ("You Only RL Once") sobre lotes que combinan tareas y entornos heterogéneos, de modo que las estrategias aprendidas se transfieren entre dominios. El modelo cubre texto, imagen, vídeo y audio de forma nativa y soporta una ventana de contexto de 1.000.000 de tokens, pensada para repositorios largos, trazas de herramientas y sesiones de agente prolongadas.

La innovación técnica más destacable es el sistema de calificación agéntica por grupos: como una señal binaria de éxito/fracaso no permite ordenar varias soluciones correctas, se incorporan Groupwise Reward Synthesis (GRS), que construye rúbricas específicas por tarea a partir de rollouts contrastados, y Groupwise Advantage Redistribution (GAR), que reordena en línea las trayectorias que pasan los tests y desplaza la ventaja hacia las de mayor calidad. A esto se suma MOPD2 (Multi-Prefix Multi-Teacher On-Policy Distillation), que combina rollouts autónomos del estudiante con rollouts de un solo turno condicionados por prefijos de profesor y de SFT para extender capacidades a tareas difíciles de verificar sin regenerar turnos previos.

Esta ficha se elabora a partir de la información de la model card y de los metadatos de HuggingFace. Conviene señalar una discrepancia relevante: el repositorio consultado figura bajo el usuario FAISALFAZALHUSSAIN con 0 descargas y 0 likes, mientras que la model card enlaza al repositorio oficial de XiaomiMiMo, por lo que el artefacto descrito podría ser una réplica no oficial. Los resultados de benchmarks incluidos proceden exclusivamente de la model card del autor y no se ha localizado verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse MoE (Mixture of Experts) sobre transformer híbrido con atención de ventana deslizante (SWA) y atención completa |
| Parametros totales | 310.756.322.688 (~310,8B segun safetensors; 309B segun la model card) |
| Parametros activos | 15B (aproximadamente) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit y FP8 (etiquetas del repositorio); no disponible para GGUF/AWQ/GPTQ |
| Idiomas soportados | Inglés (en) y chino (zh), segun la model card |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere `custom_code`, `trust_remote_code`) |
| Modalidades | Texto, imagen, vídeo y audio |
| Codificador de vision | MiMo ViT de 681M parametros (28 capas: 24 SWA + 4 full attention) |
| Codificador de audio | AudioTokenizer de 308M + patch encoder de audio de 127M |
| Decodificador especulativo | Multi-Token Prediction (MTP) de 5 capas |
| Tamano del repositorio | 177,8 GB |
| Libreria | transformers |
| Fecha de publicacion | 2026-09-22 |

## Arquitectura y entrenamiento

El modelo emplea un backbone transformer disperso con mezcla de expertos: 309B parámetros totales de los que solo 15B se activan por token, lo que reduce el coste de cómputo por token hasta un orden de magnitud comparable a un modelo denso de 15B, manteniendo la capacidad de representación de un modelo mucho mayor. El backbone combina capas de atención de ventana deslizante con capas de atención completa (un patrón similar al observado en el codificador de visión, con 24 capas SWA y 4 full de 28 totales), una elección que abarata el coste de mantener contextos de hasta 1M de tokens. Sobre el backbone se acoplan tres componentes multimodales: un ViT de 681M parámetros para imagen y vídeo, un tokenizador de audio de 308M más un patch encoder de 127M, y un decodificador especulativo MTP de 5 capas que acelera la generación prediciendo varios tokens por paso.

El entrenamiento se articula en varias fases. Primero, un arranque en frío orientado a la autocorrección: el modelo reflexiona sobre sus propios turnos desalineados y los reescribe como pasos siguientes fundamentados. Después, una única ejecución de RL mixta sobre GRPO (Group Relative Policy Optimization) totalmente asíncrona con lotes muy grandes —1.568 prompts × 16 rollouts por paso, miles de millones de tokens por actualización— que mezcla código, agentes generales, tareas visuales y ciberseguridad en el mismo batch. Durante el RL se aplican endurecimiento de entornos, cribado adversarial y verificaciones cruzadas de verificadores para evitar el *reward hacking*. Finalmente, MOPD2 destila conocimiento de profesores combinando rollouts autónomos del estudiante con rollouts de un solo turno condicionados por prefijos (Teacher-Prefix y SFT-Prefix), reutilizando historiales ya generados para entrenar los puntos de decisión sin regenerar los turnos previos.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento y agentes de múltiples pasos: planificación, uso de herramientas y ejecución de trazas largas.
- Codificación y agentes de código: resolución de tareas de ingeniería de software, parches y navegación de repositorios.
- Comprensión de imagen (vision-language) mediante el codificador MiMo ViT.
- Comprensión de vídeo, incluyendo tareas de video-understanding etiquetadas en el repositorio.
- Procesamiento de audio nativo, con tokenizador y patch encoder dedicados.
- Tool calling / function calling y orquestación en entornos tipo terminal y escritorio.
- Capacidades de ciberseguridad, entrenadas explícitamente dentro del RL mixto.
- Multilingüismo limitado a inglés y chino según la model card.
- Decodificación especulativa con MTP de 5 capas para reducir la latencia por token generado.
- Modo de agente con calificación por rúbricas (GRS/GAR) orientado a producir trayectorias más cortas y con menos tokens por tarea.

## Casos de uso

- Agentes de ingeniería de software: dado que la ventana de contexto alcanza 1M tokens, el modelo puede cargar un repositorio completo o una traza larga de ejecución y proponer parches de varios ficheros con coherencia entre ellos, integrándose en pipelines de CI/CD como generador de cambios revisables.
- Automatización de operaciones en terminal y escritorio: con soporte de tool calling y resultados publicados en Terminal Bench y OSWorld, puede encadenar comandos, interpretar la salida y corregir el plan sin supervisión continua.
- Atención al cliente multimodal: al aceptar texto, audio e imagen en un solo modelo, permite gestionar conversaciones donde el usuario adjunta capturas o mensajes de voz sin necesidad de encadenar varios modelos especializados.
- Análisis de vídeo y audio para monitorización: el codificador de vídeo y el de audio permiten resumir o etiquetar contenido audiovisual largo dentro de una misma sesión de 1M de tokens.
- Agentes de automatización de procesos (RPA cognitiva): los resultados en AutomationBench y JobBench indican capacidad para ejecutar flujos de trabajo ofimáticos y de back-office guiados por herramientas.
- Auditoría y análisis de seguridad: el RL mixto incluye ciberseguridad, lo que habilita tareas de revisión de configuraciones, triaje de alertas y análisis de trazas, siempre con verificación humana dado el riesgo de falsos positivos.
- Asistente de investigación sobre documentación extensa: con contexto de 1M tokens puede mantener en memoria manuales técnicos, normativa o papers y responder con referencias cruzadas.
- Generación de interfaces y prototipos a partir de capturas: la combinación de visión y generación de código permite convertir wireframes o mockups en componentes de front-end.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor. La columna "Flash" corresponde a MiMo-V2.6-Flash-RL. Los valores de los modelos comparados (Claude Opus 5, GPT-5.6 Sol, Claude Fable 5) proceden de la misma tabla y no se han contrastado con fuentes independientes.

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

La tabla de la model card se interrumpe en la sección de ciberseguridad, por lo que los resultados de esa categoría no están disponibles. Tampoco se han publicado en la información proporcionada resultados de benchmarks clásicos como MMLU, HumanEval o GSM8K, ni evaluaciones específicas de las capacidades de audio y vídeo.

## Requisitos de hardware

- VRAM para inferencia en FP8/8-bit: aproximadamente 311 GB solo para pesos, más caché KV. Requiere al menos 4 GPU de 80 GB (H100/A100 80GB) en configuración tensor-parallel.
- VRAM en BF16/FP16: aproximadamente 620 GB de pesos, lo que exige 8 GPU de 80 GB o un nodo equivalente.
- Cuantización a 4 bits: alrededor de 155-170 GB, viable en 2-3 GPU de 80 GB, sujeta a que existan pesos cuantizados publicados (no confirmado en la información disponible).
- GPU recomendadas: H100 80GB, H200, A100 80GB o MI300X para despliegue en servidor. Los 177,8 GB del repositorio apuntan a una distribución ya cuantizada a 8-bit/FP8.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090. Sería necesario descargar expertos a memoria del sistema, con una penalización de latencia severa y sin garantía de soporte en los runtime actuales.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía confirmada en el repositorio. No hay confirmación de soporte en vLLM, SGLang, TGI, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El decodificador especulativo MTP de 5 capas y la activación de solo 15B parámetros por token apuntan a una latencia por token mucho menor que la de un modelo denso de 310B, pero no se han publicado cifras.
- Almacenamiento: 177,8 GB de pesos, más espacio para caché y checkpoints durante la descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL | 310,8B (safetensors) | 15B | 1M | MIT | Texto, imagen, vídeo, audio | Pesos abiertos |
| MiMo-V2.6-Pro-RL | no disponible | no disponible | 1M | MIT (segun familia) | Texto, imagen, vídeo, audio | Pesos abiertos |
| MiMo-V2.5-Pro | no disponible | no disponible | no disponible | MIT (segun familia) | no disponible | Pesos abiertos |
| Claude Opus 5 | no disponible | no disponible | no disponible | Propietaria | no disponible | Solo API |
| GPT-5.6 Sol | no disponible | no disponible | no disponible | Propietaria | no disponible | Solo API |
| Claude Fable 5 | no disponible | no disponible | no disponible | Propietaria | no disponible | Solo API |

Dentro de la propia familia, Flash-RL se sitúa por debajo de Pro-RL en todos los benchmarks publicados, con diferencias de entre 1 y 6 puntos en la mayoría de las pruebas, a cambio de un coste de inferencia presumiblemente menor. Frente a MiMo-V2.5-Pro la mejora es muy amplia: 67,9 frente a 19,0 en DeepSWE v1.1 y 52,3 frente a 16,0 en AutomationBench v1.0.6. Los modelos propietarios de la comparativa mantienen ventaja en Terminal Bench 4.0 y ProgramBench, mientras que Flash-RL supera a GPT-5.6 Sol en AutomationBench y JobBench y empata con Claude Opus 5 en Agents' Last Exam (31,6). No se han localizado comparativas independientes con otros MoE abiertos de tamaño similar.

## Limitaciones y advertencias

- El repositorio consultado pertenece al usuario FAISALFAZALHUSSAIN con 0 descargas y 0 likes, mientras que la model card apunta al repositorio oficial XiaomiMiMo. Podría tratarse de una réplica o reubicación no oficial; conviene verificar la procedencia antes de usarlo en producción.
- Las fechas de creación y actualización (2026-09-22) y la nomenclatura de los modelos comparados (GPT-5.6 Sol, Claude Opus 5, Claude Fable 5) no se han podido contrastar con fuentes independientes.
- Todos los resultados de benchmarks proceden de la model card del autor. No hay evaluación de terceros, ni resultados en MMLU, HumanEval, GSM8K o evaluaciones de audio/vídeo.
- Los autores documentan explícitamente medidas contra el *reward hacking* (endurecimiento de entornos, cribado adversarial, verificación cruzada), lo que indica que es un riesgo reconocido en el proceso de RL. Un modelo entrenado con calificadores automáticos puede optimizar la métrica sin resolver la tarea.
- Riesgo de alucinación no cuantificado: no hay tasas de error publicadas ni evaluaciones de fidelidad factual.
- Cobertura lingüística limitada a inglés y chino según la model card; el rendimiento en castellano u otras lenguas europeas no está documentado.
- Aunque la ventana nominal es de 1M tokens, no se publican resultados de recuperación en contextos largos (needle-in-a-haystack u similares); el rendimiento efectivo en el extremo superior de la ventana es desconocido.
- La licencia MIT permite uso comercial, pero el repositorio requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; debe auditarse antes de desplegar.
- El tamaño (177,8 GB) y los requisitos de VRAM hacen inviable el despliegue en hardware de consumo sin cuantización agresiva, y no hay confirmación de pesos GGUF ni de soporte en runtimes de inferencia habituales (vLLM, SGLang, llama.cpp, Ollama).
- No hay información sobre sesgos, comportamiento en dominios sensibles ni política de uso aceptable más allá de la licencia.

## Enlaces

- Repositorio consultado en HuggingFace: https://huggingface.co/FAISALFAZALHUSSAIN/MiMo-V2.6-Flash-RL
- Repositorio oficial de referencia (Xiaomi): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Modelo hermano Pro-RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- ModelScope (Pro-RL): https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Pro-RL
- ModelScope (Flash-RL): https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Blog del modelo: https://mimo.xiaomi.com/mimo-v2-6
- Informe técnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- Repositorio GitHub de la familia MiMo: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
- Grupo de WeChat: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro/blob/main/assets/wechat.jpg

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los enlaces recuperados correspondían a sitios de apuestas deportivas sin relación con MiMo.
