# 0xSojalSec/Xiaomi-MiMo-V2.6

## Resumen

MiMo-V2.6 es la serie de modelos omnimodales de Xiaomi (equipo XiaomiMiMo), publicada bajo licencia MIT y presentada con el lema "scaling reinforcement learning toward self-improvement". La ficha que nos ocupa, sin embargo, no es el repositorio oficial: `0xSojalSec/Xiaomi-MiMo-V2.6` es una subida de terceros (0 descargas, 0 likes) que replica la model card de MiMo-V2.6-Flash-RL y distribuye pesos en safetensors de 8 bits/FP8.

Tecnicamente se trata de un transformer disperso de tipo MoE (Mixture of Experts) con 309.000 millones de parametros totales y 15.000 millones activos por token, segun la model card oficial. Incorpora codificadores nativos para vision, video y audio, una ventana de contexto de 1 millon de tokens y un decodificador especulativo de 5 capas para prediccion multi-token. El entrenamiento combina RL mixto (GRPO asincrono) sobre codigo, agentes generales, vision y ciberseguridad, mas una fase de destilacion on-policy multi-profesor (MOPD2).

Su relevancia radica en dos frentes: por un lado, un unico modelo cubre texto, imagen, video y audio con contexto de 1M tokens, lo que simplifica arquitecturas de agentes de horizonte largo; por otro, los resultados declarados en tareas de agente (Toolathlon-Verified 73,6; OSWorld-Verified 80,8; CyberGym 95,1) situan al checkpoint Flash en un rango competitivo con modelos propietarios de referencia. Conviene senalar que el conteo de parametros del safetensors subido (159.358.725.504) no coincide con los 309B declarados en la model card, una discrepancia que el propio repositorio no explica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso MoE (Mixture of Experts) con backbone hibrido SWA (sliding window attention) + capas full attention, codificadores multimodales y bloques MTP |
| Parametros totales | 309.000 millones segun la model card oficial; el safetensors del repositorio subido declara 159.358.725.504 parametros |
| Parametros activos | Aproximadamente 15.000 millones por token (MoE) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8-bit y FP8 (etiquetas del repositorio); no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere `trust_remote_code` por `custom_code`) |

Otros componentes declarados: codificador de vision MiMo ViT de 681M parametros (28 capas: 24 SWA + 4 full), AudioTokenizer de 308M parametros, codificador de parches de audio de 127M parametros y decodificador especulativo MTP de 5 capas.

## Arquitectura y entrenamiento

El modelo es un MoE disperso con 309B parametros totales y 15B activos, sobre un backbone que alterna atencion de ventana deslizante con capas de atencion completa, lo que permite sostener una ventana de 1M tokens con un coste de atencion contenido. La multimodalidad es nativa: un ViT de 681M parametros para imagen y video, un AudioTokenizer de 308M mas un codificador de parches de 127M para audio, integrados en el mismo modelo en lugar de encadenarse como modelos separados. El bloque de Multi-Token Prediction de 5 capas actua como decodificador especulativo, acelerando la generacion al predecir varios tokens por paso.

En entrenamiento, el autor describe una unica ejecucion de RL mixta ("You Only RL Once") que combina codigo, agentes generales, vision y ciberseguridad en el mismo lote, con GRPO totalmente asincrono sobre lotes muy grandes (1.568 prompts x 16 rollouts por paso). El sistema de recompensa no se limita a pass/fail: Groupwise Reward Synthesis construye rubricas especificas por tarea a partir de rollouts contrastados y Groupwise Advantage Redistribution reordena trayectorias correctas en linea para favorecer soluciones de mayor calidad y caminos mas cortos. A esto se suman arranque en frio con autocorreccion, endurecimiento del entorno y verificadores cruzados contra reward hacking, y una fase final de destilacion on-policy multi-profesor (MOPD2) con rollouts condicionados por prefijos de profesor y de SFT para extender capacidades a tareas dificiles de verificar.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Comprension de imagen, video y audio de forma nativa en el mismo modelo (vision-language y video-understanding).
- Razonamiento de horizonte largo con hasta 1M tokens de contexto: repositorios completos, trazas de herramientas y sesiones de agente multiples.
- Agentes y tool calling: los benchmarks AutomationBench v1.0.6, Toolathlon-Verified, Terminal Bench y OSWorld-Verified evaluan uso de herramientas, control de terminal y operacion de escritorio.
- Codigo y agentes de codigo: DeepSWE v1.1, ProgramBench y MiMo Code Bench miden tareas de reparacion y generacion en repositorios reales.
- Ciberseguridad ofensiva/defensiva evaluada con CyberGym y MiMo Cyber Bench.
- Decodificacion especulativa integrada mediante un decodificador MTP de 5 capas.
- Modo de razonamiento y autocorreccion derivados del entrenamiento RL con arranque en frio reflexivo (la model card no detalla un "thinking mode" con nombre propio ni su activacion).

## Casos de uso

- Agente de codigo en CI/CD: con tool calling y 1M tokens de contexto, el modelo puede recibir un repositorio completo, localizar el fallo de un test y proponer el parche, integrándose en un pipeline que ejecute las pruebas antes de aceptar el cambio (DeepSWE v1.1: 67,9 en el checkpoint Flash).
- Automatizacion de terminal y sistemas operativos: Terminal Bench 2.1 (87,6) y OSWorld-Verified (80,8) indican capacidad para ejecutar secuencias de comandos y operar interfaces graficas, utiles en tareas de aprovisionamiento, migracion o soporte tecnico automatizado.
- Orquestacion de herramientas empresariales: Toolathlon-Verified (73,6) y AutomationBench (52,3) respaldan su uso como planificador que encadena API, hojas de calculo y bases de datos en flujos de trabajo multi-paso.
- Analisis de video y audio para moderacion o indexacion: los codificadores nativos de vision y audio permiten transcribir, resumir y etiquetar contenido audiovisual sin pipeline externo, aprovechando el contexto largo para procesar sesiones completas.
- Auditoria de seguridad y respuesta a incidentes: CyberGym (95,1) y MiMo Cyber Bench (77,2) lo situan como herramienta de analisis de vulnerabilidades, generacion de PoC en entorno controlado y triaje de alertas.
- Asistencia documental sobre repositorios normativos extensos: la ventana de 1M tokens permite cargar contratos, expedientes o manuales completos y responder con citas, en ingles o chino.
- Atencion al cliente automatizada en mercados angloparlantes y sinofonos: conversaciones multi-turno con historial largo y acceso a herramientas de consulta de pedidos; no cubre castellano de forma nativa.

## Benchmarks y rendimiento

Resultados declarados en la model card (el repositorio subido no aporta evaluaciones propias; los valores corresponden a la serie MiMo-V2.6 publicada por Xiaomi). Se reproduce la columna Flash, que es el checkpoint al que apunta la model card de referencia:

| Benchmark | MiMo-V2.6 Pro | MiMo-V2.6 Flash | MiMo-V2.5 Pro | Claude Opus 5 | GPT-5.6 Sol | Claude Fable 5 |
|---|---|---|---|---|---|---|
| DeepSWE v1.1 (Code Agent) | 71,9 | 67,9 | 19,0 | 74,0 | 73,0 | 70,0 |
| ProgramBench | 26,5 | 26,0 | 12,5 | 37,0 | 25,0 | 33,0 |
| MiMo Code Bench | 63,2 | 61,2 | 40,4 | 68,6 | 59,3 | - |
| AutomationBench v1.0.6 (General Agent) | 53,1 | 52,3 | 16,0 | 50,3 | 45,8 | 46,2 |
| Toolathlon-Verified | 76,9 | 73,6 | 49,1 | 80,6 | 74,9 | 77,9 |
| GDPval-AA 2.1 | 1.673 | - | 1.107 | 1.708 | 1.588 | 1.595 |
| Agents' Last Exam | 31,6 | 27,6 | 13,2 | 31,6 | 30,8 | 25,7 |
| Terminal Bench 4.0 | 34,9 | 28,8 | 1,5 | 49,0 | 39,9 | 42,4 |
| Terminal Bench 2.1 | 89,9 | 87,6 | 65,2 | 89,1 | 88,8 | 84,3 |
| OSWorld-Verified | 82,0 | 80,8 | - | 83,4 | 83,0 | 86,0 |
| JobBench | 62,0 | 61,2 | 25,0 | 65,7 | 45,4 | 57,4 |
| CyberGym | 94,0 | 95,1 | 40,0 | - | - | - |
| MiMo Cyber Bench | 80,2 | 77,2 | 0,0 | - | - | - |

No se han publicado resultados de benchmarks propios en la informacion disponible sobre el repositorio `0xSojalSec/Xiaomi-MiMo-V2.6`. No hay datos de MMLU, GSM8K ni HumanEval en la documentacion consultada.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros, no datos publicados por el autor:

- VRAM para pesos en FP8/8-bit: en torno a 310 GB si se confirman los 309B parametros; unos 160-180 GB si se toma como referencia el conteo de safetensors del repositorio subido (159,4B).
- VRAM para pesos en 4 bits: aproximadamente 155-175 GB en el escenario de 309B, mas overhead de cache KV, que con 1M tokens de contexto puede ser muy elevado y exige atencion con ventana deslizante o cuantizacion de cache.
- GPU recomendadas: 8x H100 80 GB o 8x A100 80 GB para el modelo completo en FP8; 4x H100 80 GB como minimo practico para el checkpoint cuantizado de ~160 GB.
- GPU de consumo: no cabe en una unica RTX 4090, RTX 5090 ni similar. Se necesitarian varios aceleradores de 48-80 GB, lo que descarta el despliegue mono-GPU de consumo.
- Opciones de despliegue: la model card no especifica servidores compatibles. Por arquitectura MoE y dependencia de `custom_code`, los candidatos habituales serian vLLM o SGLang con `trust_remote_code`, y Transformers para inferencia de referencia. No hay confirmacion de soporte en llama.cpp, Ollama, LM Studio ni TGI, y la presencia de codificadores de vision y audio hace poco probable un GGUF completo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|
| MiMo-V2.6 Flash (esta serie) | 309B / 15B activos (MoE) | 1M tokens | MIT | DeepSWE v1.1 67,9; Toolathlon 73,6; CyberGym 95,1 |
| MiMo-V2.6 Pro | 309B / 15B activos (MoE) | 1M tokens | MIT | DeepSWE v1.1 71,9; Toolathlon 76,9; GDPval-AA 1.673 |
| MiMo-V2.5 Pro | No disponible | No disponible | MIT (presumible, no confirmado) | DeepSWE v1.1 19,0; Toolathlon 49,1 |
| Claude Opus 5 | No disponible (propietario) | No disponible | Propietaria | DeepSWE v1.1 74,0; OSWorld 83,4 |
| GPT-5.6 Sol | No disponible (propietario) | No disponible | Propietaria | DeepSWE v1.1 73,0; Toolathlon 74,9 |

Frente a los modelos propietarios de la comparativa, el checkpoint Flash queda por detras en codigo de agente (67,9 frente a 73-74) y en ProgramBench (26,0 frente a 25-37), mientras que en tareas de agente general y ciberseguridad se acerca o supera a algunas referencias. Su ventaja estructural es la licencia MIT y la multimodalidad nativa; su desventaja, el tamano del despliegue.

## Limitaciones y advertencias

- El repositorio auditado no es oficial: pertenece al usuario `0xSojalSec`, con 0 descargas y 0 likes, y replica la model card de Xiaomi. No hay garantia de integridad, trazabilidad ni de que los pesos correspondan al checkpoint publicado por Xiaomi.
- Discrepancia de parametros sin resolver: la model card declara 309B totales / 15B activos, mientras que el safetensors del repositorio declara 159.358.725.504 parametros.
- Los nombres de benchmarks y modelos comparados (Claude Opus 5, GPT-5.6 Sol, DeepSWE v1.1, GDPval-AA 2.1, Agents' Last Exam, Terminal Bench 4.0) no han podido verificarse mediante busqueda web; deben tratarse como datos declarados por el autor, no confirmados de forma independiente.
- Idiomas limitados a ingles y chino: no hay soporte nativo de castellano declarado, lo que afecta al rendimiento en espanol (previsiblemente inferior y no cuantificado).
- Riesgo de alucinacion inherente a los modelos generativos; en tareas de ciberseguridad y agentes con acceso a herramientas el impacto de un error es mayor, por lo que se requiere sandboxing y verificacion humana.
- La ventana de 1M tokens no implica atencion efectiva uniforme en toda la longitud; no se publican metricas de recuperacion tipo needle-in-a-haystack.
- Licencia MIT: permite uso comercial y modificacion, pero al ser una subida de terceros conviene verificar la licencia del repositorio oficial antes de desplegar en produccion.
- Requiere `trust_remote_code` por el codigo personalizado, lo que implica ejecutar codigo no auditado en el entorno de inferencia.
- No hay informacion publicada sobre sesgos, composicion del dataset de entrenamiento ni filtros de seguridad; en despliegues regulados sera necesario evaluar el modelo internamente.

## Enlaces

- Repositorio auditado: https://huggingface.co/0xSojalSec/Xiaomi-MiMo-V2.6
- Modelo oficial relacionado: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Modelo Pro oficial: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Blog de la serie: https://mimo.xiaomi.com/mimo-v2-6
- Informe tecnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Plataforma API: https://platform.xiaomimimo.com
- Studio: https://aistudio.xiaomimimo.com
- Aplicacion de escritorio: https://mimo.xiaomimimo.com/desktop/
- Repositorio de codigo y figuras: https://github.com/XiaomiMiMo/MiMo/
- Comunidad: Discord (https://discord.gg/kKC2kNnQEX), Telegram (https://t.me/+3T-I0pekOVIyNDBl), Reddit (https://www.reddit.com/r/XiaomiMiMo_Official/)

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los resultados obtenidos correspondian a sitios de pedidos de pizza y no se han utilizado como fuente.
