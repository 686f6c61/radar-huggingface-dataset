# blearyhope/MiMo-V2.6-Flash-RL

## Resumen

MiMo-V2.6-Flash-RL es el checkpoint de eficiencia de la familia MiMo-V2.6, desarrollada por Xiaomi (equipo XiaomiMiMo). Se trata de un modelo multimodal nativo (texto, imagen, vídeo y audio) con arquitectura de mezcla de expertos (MoE) dispersa que activa 15.000 millones de parámetros sobre un total de 309.000 millones, y una ventana de contexto de 1 millón de tokens. El repositorio publicado en Hugging Face por el usuario `blearyhope` replica la model card oficial de Xiaomi, con pesos en safetensors de 8 bits (FP8) y un tamaño total de 177,8 GB.

El modelo está orientado a agentes autónomos de horizonte largo y a la mejora mediante aprendizaje por refuerzo a gran escala. Su propuesta central es "escalar el RL hacia la auto-mejora": un único entrenamiento de RL mixto que cubre código, agentes generales, tareas visuales y ciberseguridad, con calificación agéntica por grupos (GRS y GAR) para refinar la señal de recompensa más allá del aprobado/fallo binario. Incluye además un decodificador especulativo de predicción multi-token (MTP) de 5 capas.

Es relevante ahora porque combina en un solo modelo capacidades que habitualmente requieren pipelines separados (visión, audio, vídeo, agentes y contexto ultra-largo) con licencia MIT, lo que facilita su evaluación e integración. No obstante, el checkpoint es reciente (noviembre de 2026) y no registra descargas ni interacciones en el repositorio, por lo que la validación independiente es aún escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa (Mixture of Experts) con backbone híbrido SWA; codificadores ómnimodales y decodificador especulativo MTP |
| Parametros totales | 310.756.322.688 (~309B) |
| Parametros activos | ~15B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8 bits (FP8) en los pesos publicados; no se documentan otras cuantizaciones en la información disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código personalizado, `custom_code`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE dispersa con 309B parámetros totales y 15B activados por token, sobre un backbone con atención de ventana deslizante (SWA) combinada con capas de atención completa. La torre de percepción incluye un codificador visual MiMo ViT de 681M parámetros (28 capas: 24 SWA y 4 completas), un tokenizador de audio de 308M y un codificador de parches de audio de 127M. Se añade un decodificador especulativo de predicción multi-token de 5 capas para acelerar la generación.

El entrenamiento se articula en torno a un único proceso de RL mixto ("You Only RL Once") que mezcla tareas de código, agentes generales, visión y ciberseguridad en el mismo lote, con GRPO totalmente asíncrono sobre lotes muy grandes (1.568 prompts × 16 rollouts por paso). La señal de recompensa se escala mediante calificación agéntica por grupos: Groupwise Reward Synthesis (GRS) construye rúbricas específicas por tarea a partir de rollouts contrastados y Groupwise Advantage Redistribution (GAR) redistribuye la ventaja hacia trayectorias de mayor calidad. Se complementa con RL alineado (auto-corrección en arranque en frío, endurecimiento del entorno y verificación cruzada contra reward hacking) y con destilación on-policy multi-profesor y multi-prefijo (MOPD2). No se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto de hasta 1M tokens.
- Comprensión de imagen, vídeo y audio de forma nativa en un mismo modelo.
- Ejecución de tareas de código y agentes de software (parcheo, terminal, automatización).
- Soporte de agentes multi-paso y uso de herramientas (tool calling) en entornos de terminal y automatización.
- Capacidades de ciberseguridad evaluadas en el informe técnico.
- Multilingüe limitado a inglés y chino.
- Modo de razonamiento agéntico con calificación y auto-corrección (self-improvement loop).
- Decodificación especulativa mediante MTP para reducir latencia.

## Casos de uso

- Agentes de código autónomos: el modelo puede resolver tareas de reparación y generación de parches en repositorios largos gracias a su ventana de 1M tokens, integrándose en pipelines de CI/CD para revisión y corrección automática.
- Automatización de terminal y sistemas: con soporte de tool calling y resultados en Terminal Bench, puede operar shells y flujos de administración de sistemas en entornos controlados.
- Análisis de vídeo y audio: al ser ómnimodal, permite transcribir, resumir y responder preguntas sobre reuniones grabadas o material audiovisual sin pipeline separado.
- Atención al cliente multi-turno: la ventana de 1M tokens permite mantener historiales extensos y contexto de producto en conversaciones largas.
- Automatización de oficina y flujos empresariales: los resultados en OSWorld y AutomationBench indican uso viable para tareas de escritorio y gestión documental.
- Auditoría de seguridad: las capacidades de ciberseguridad del informe permiten usarlo en análisis de configuraciones y detección de riesgos en entornos de prueba.
- Procesamiento de documentación técnica extensa: resúmenes y extracción de información en manuales o bases de código de gran tamaño.

## Benchmarks y rendimiento

| Benchmark | MiMo-V2.6 Flash | MiMo-V2.6 Pro | MiMo-V2.5 Pro | Claude Opus 5 | GPT-5.6 Sol | Claude Fable 5 |
|---|---|---|---|---|---|---|
| DeepSWE v1.1 | 67,9 | 71,9 | 19,0 | 74,0 | 73,0 | 70,0 |
| ProgramBench | 26,0 | 26,5 | 12,5 | 37,0 | 25,0 | 33,0 |
| MiMo Code Bench | 61,2 | 63,2 | 40,4 | 68,6 | 59,3 | no disponible |
| AutomationBench v1.0.6 | 52,3 | 53,1 | 16,0 | 50,3 | 45,8 | 46,2 |
| Toolathlon-Verified | 73,6 | 76,9 | 49,1 | 80,6 | 74,9 | 77,9 |
| GDPval-AA 2.1 | no disponible | 1673 | 1107 | 1708 | 1588 | 1595 |
| Agents' Last Exam | 27,6 | 31,6 | 13,2 | 31,6 | 30,8 | 25,7 |
| Terminal Bench 4.0 | 28,8 | 34,9 | 1,5 | 49,0 | 39,9 | 42,4 |
| Terminal Bench 2.1 | 87,6 | 89,9 | 65,2 | 89,1 | 88,8 | 84,3 |
| OSWorld-Verified | 80,8 | 82,0 | no disponible | 83,4 | 83,0 | 86,0 |
| JobBench | 61,2 | 62,0 | 25,0 | 65,7 | 45,4 | 57,4 |

Los datos proceden de la model card del autor; la sección de ciberseguridad aparece truncada en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos publicados ocupan 177,8 GB en FP8; la inferencia requiere al menos ~180 GB de VRAM solo para pesos, más memoria para KV cache y activaciones.
- GPU recomendadas: clústeres multi-GPU con H100 (80 GB) o A100 (80 GB); se necesitan al menos 3 GPU de 80 GB para los pesos en FP8, con margen adicional para contexto largo.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en su formato publicado; requeriría cuantizaciones agresivas no documentadas.
- Opciones de despliegue: transformers con `custom_code`; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; el decodificador MTP de 5 capas está diseñado para reducir latencia de generación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiMo-V2.6-Flash-RL | 309B totales / 15B activos | 1M | MIT | Hugging Face, ModelScope |
| MiMo-V2.6-Pro-RL | no disponible | 1M | MIT | Hugging Face, ModelScope |
| MiMo-V2.5-Pro | no disponible | no disponible | MIT | Hugging Face |

Frente a modelos propietarios de referencia (Claude Opus 5, GPT-5.6 Sol) el modelo queda por debajo en la mayoría de benchmarks agénticos, pero con licencia MIT y pesos abiertos. No se dispone de datos de otros modelos abiertos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a modelos generativos; los benchmarks no cubren veracidad factual.
- El checkpoint es una réplica publicada por un tercero (`blearyhope`); conviene verificar la integridad y procedencia frente al repositorio oficial de Xiaomi.
- Licencia MIT permite uso comercial, pero no se detallan restricciones adicionales de los datos de entrenamiento.
- Requiere hardware de gama alta (múltiples GPU de 80 GB); no apto para despliegue en consumer.
- Sin descargas ni validación comunitaria en el momento de la ficha.
- La sección de benchmarks de ciberseguridad está incompleta en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/blearyhope/MiMo-V2.6-Flash-RL
- Repositorio oficial: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Blog: https://mimo.xiaomi.com/mimo-v2-6
- Plataforma API: https://platform.xiaomimimo.com
- Studio: https://aistudio.xiaomimimo.com
- Desktop: https://mimo.xiaomimimo.com/desktop/
- Informe técnico: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- GitHub: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
