# CinderellaMan/Ornith-1.5-122B-Pascal-N2P-GGUF

## Resumen

Ornith-1.5-122B Pascal N2P es una cuantización GGUF del modelo Ornith-1.5-122B, un transformer de mezcla de expertos (MoE) de 122.000 millones de parámetros (~10B activos por token) orientado a agentes de codificación en terminal. La publica el usuario CinderellaMan, no el desarrollador original del modelo base (ornith-ai), y su rasgo definitorio es que emplea tipos de cuantización propios del fork Miner Llama (N2P y N3P, de 2 y 3 bits) diseñados para tarjetas NVIDIA Pascal (compute capability 6.1): GTX 10 series, Tesla P4/P40 y las P106/P104 de rigs de minería retirados.

El archivo ocupa 48,2 GB y coloca los expertos enrutados en 2 y 3 bits, con más bits en las capas finales, donde el modelo es más sensible. Según el autor, supera a UD-Q2_K_XL de Unsloth (44,5 GB) en los tres textos medidos (prosa, sesiones de agente y código) a cambio de 3,66 GB más de peso. Su utilidad práctica es permitir ejecutar un modelo de 122B en hardware que de otro modo quedaría fuera de juego, a costa de depender de un fork concreto de llama.cpp.

La restricción clave es que solo carga en Miner Llama v3 o posterior: los tipos N2P/N3P no existen en llama.cpp estándar ni en las aplicaciones construidas sobre él. Para cualquier otro motor o GPU, el autor recomienda directamente el GGUF de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), según el modelo base Ornith-1.5-122B |
| Parametros totales | 124.635.206.144 (~124,6B) |
| Parametros activos | ~10B por token |
| Longitud de contexto | 49.152 tokens en la configuración de referencia del autor |
| Tipos de cuantizacion | N2P y N3P (tipos propios de Miner Llama, 2 y 3 bits) para expertos enrutados; cabeza en Q5_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `Ornith-1.5-122B-N2P-N3P-valid1-headQ5_0.gguf`, 48,2 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 122B parámetros con aproximadamente 10B activos por token, especializado en agentes de codificación de terminal. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO, ya que la model card de esta cuantización no los detalla.

La innovación de esta ficha es puramente de cuantización: los expertos enrutados se almacenan en N2P y N3P, tipos del fork Miner Llama que asignan 2 o 3 bits según la capa, reservando más precisión para las capas tardías. La cabeza de salida se mantiene en Q5_0. El autor reporta una divergencia KL media de 0,047 para el switch opcional `--ubatch-taper`, comparable al impacto de la propia cuantización, lo que da una idea del orden de degradación introducido. El reparto de capas entre las nueve GPU se fija con `-ts 6,6,6,6,5,5,5,5,6` y viene determinado por la memoria disponible.

## Capacidades

- Generación de texto y razonamiento general, con formato de razonamiento compatible con el estilo deepseek (`--reasoning-format deepseek`).
- Codificación y resolución de tareas de agente en terminal: el benchmark del autor ejecuta doce tareas de corrección de bugs en Python y JavaScript con ejecución real de tests.
- Conversación multi-turno con contexto creciente, validada hasta 49.152 tokens.
- Compatibilidad con clientes OpenAI (`endpoints_compatible` en los tags del repositorio).
- Soporte de plantillas Jinja (`--jinja`), lo que habilita tool calling según la plantilla del modelo base.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Agentes de codificación en terminal sobre hardware legacy: el escenario validado por el autor, un agente que corrige bugs pequeños con ejecución de tests real, encaja directamente en este archivo gracias a sus 49.152 tokens de contexto y a su rendimiento medido de 16,5 tokens/s en nueve P106-090.
- Reutilización de rigs de minería: un rig con nueve tarjetas de 6 GB y un host de 2 núcleos con 4 GB de RAM puede servir un modelo de 122B; el autor documenta que el chequeo del agente dejó 563 MB libres en el peor momento con v3 y entre 1.225 y 1.228 MiB con v4.
- Laboratorio de bajo presupuesto para evaluar modelos grandes: permite estudiar el comportamiento de un MoE de 122B sin acceso a A100/H100, asumiendo la pérdida de calidad de una cuantización de 2-3 bits.
- Automatización de tareas de mantenimiento de repositorios pequeños: corrección de bugs acotados con verificación por tests, donde el bucle agente-herramienta es más importante que la calidad de prosa.
- Servicio local compatible con OpenAI: el servidor de Miner Llama expone un endpoint en `127.0.0.1:8080` accesible por túnel SSH, utilizable desde cualquier cliente compatible para prototipos internos.
- Docencia y experimentación con cuantización extrema: el archivo sirve para medir el impacto de tipos de 2 y 3 bits frente a alternativas como UD-Q2_K_XL en tareas de código y prosa.

## Benchmarks y rendimiento

Datos del agent check del autor (doce tareas de corrección de bugs, contexto de 49.152 tokens, nueve P106-090, una ejecución por fila salvo indicación):

| Motor y archivo | Tareas superadas | Generación (tok/s) | Lectura de prompt (tok/s) | Primer token por turno (mediana) |
|---|---|---|---|---|
| Miner Llama v4.0, este archivo, preset propio (dos ejecuciones) | 12/12, 12/12 | 16,52 y 16,13 | 103,0 y 105,9 | 6,69 s y 6,06 s |
| Miner Llama v3.0, este archivo, preset propio (dos ejecuciones) | 12/12, 12/12 | 16,22 y 16,49 | 61,1 y 58,4 | 7,26 s y 8,80 s |

Con el switch `--ubatch-taper short=600:64` el primer token baja a 3,05 y 3,27 s, a costa de una divergencia KL media de 0,047 frente a la línea sin el switch. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 46,4 GB de pesos repartidos entre las GPU; el contexto consume el resto. El autor valida nueve tarjetas de 6 GB (54 GB totales).
- GPU objetivo: NVIDIA Pascal con compute capability 6.1 (P106-090, P104, GTX 10 series, Tesla P4/P40). La velocidad solo está medida en P106-090.
- No cabe en una única GPU de consumo: requiere un reparto multi-GPU con `-ts` ajustado a la memoria de cada tarjeta.
- Host: el rig de referencia es un Celeron de 2 núcleos con 4 GB de RAM, suficiente según el autor.
- Software: Miner Llama v3.0 o v4.0 exclusivamente (no carga en llama.cpp estándar). Driver NVIDIA 580 sobre Ubuntu 24.04 o superior.
- Despliegue: `llama-server` del fork con `-ngl 99 -fa on -c 49152 -np 1`, reparto `-ts 6,6,6,6,5,5,5,5,6` y variables `GGML_CUDA_KEEPALIVE=decode`, entre otras.
- Throughput medido: 16,1-16,5 tokens/s de generación y 58-106 tokens/s de lectura de prompt según versión del fork.
- Alternativa: para cualquier otro motor o GPU, el autor remite a UD-Q2_K_XL de Unsloth (44,5 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Motor | Tamaño |
|---|---|---|---|---|---|---|
| Este archivo (N2P/N3P) | ~124,6B (MoE, ~10B activos) | 49.152 tokens (config. del autor) | GGUF N2P/N3P | MIT | Miner Llama v3+ | 48,2 GB |
| Unsloth UD-Q2_K_XL (Ornith-1.5-122B) | ~124,6B (MoE, ~10B activos) | no disponible | GGUF estándar | MIT | Cualquier build de llama.cpp | 44,5 GB |
| Ornith-1.5-122B 8-bit (original) | ~124,6B (MoE, ~10B activos) | no disponible | no disponible | MIT | no disponible | no disponible |

Según el autor, este archivo supera a UD-Q2_K_XL en prosa, sesiones de agente y código, con 3,66 GB más de peso y a cambio de atarse a Miner Llama.

## Limitaciones y advertencias

- Dependencia dura de Miner Llama v3 o v4: llama.cpp estándar, sus aplicaciones derivadas y versiones anteriores del fork no pueden cargar el archivo.
- Cuantización de 2-3 bits en los expertos: degradación de calidad esperable, mayor en modelos pequeños pero no despreciable; el autor solo la compara cualitativamente con UD-Q2_K_XL.
- Rendimiento medido únicamente en P106-090; extrapolar a otras Pascal (P40, GTX 1080 Ti) no está respaldado por datos.
- El reparto `-ts` está fijado para nueve tarjetas de 6 GB; otro número de GPU exige recalcularlo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera del inglés sin verificación.
- Licencia MIT en el archivo de cuantización; conviene verificar la licencia del modelo base antes de uso comercial.
- El switch `--ubatch-taper` altera las probabilidades del siguiente token de forma comparable a la cuantización; no usarlo si se requiere fidelidad numérica.
- Proyecto de autor individual con 739 descargas y 0 likes en el momento de la consulta: soporte y mantenimiento no garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/CinderellaMan/Ornith-1.5-122B-Pascal-N2P-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Alternativa GGUF de Unsloth: https://huggingface.co/unsloth/Ornith-1.5-122B-GGUF
- Releases de Miner Llama: https://github.com/Cinderella-Man/miner-llama/releases
- Guía de instalación: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/setup.md
- Preset v4: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/release/ornith-v4/README.md
- Preset v3: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/release/ornith-v3/README.md
- Página del modelo en el proyecto: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/models/ornith-1.5-122b/README.md
- Agent check: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/tree/main/bench/agent_check
- Datos de la ejecución v4: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/data/2026-11-16_r166_ornith_stack_no_taper/README.md
