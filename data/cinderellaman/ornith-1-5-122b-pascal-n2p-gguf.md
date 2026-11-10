# CinderellaMan/Ornith-1.5-122B-Pascal-N2P-GGUF

## Resumen

Ornith-1.5-122B Pascal N2P es una cuantización GGUF del modelo Ornith-1.5-122B, un modelo de mezcla de expertos (MoE) de 122 mil millones de parámetros orientado a agentes de programación en terminal, desarrollado originalmente por ornith-ai. Esta versión concreta la publica el usuario CinderellaMan y está diseñada específicamente para ejecutarse en tarjetas NVIDIA antiguas de arquitectura Pascal (compute capability 6.1), como las P106-090 y P104 de las granjas de minería retiradas, la serie GTX 10 y las Tesla P4/P40.

El archivo emplea tipos de cuantización propios del fork Miner Llama (N2P y N3P, de 2 y 3 bits), con más bits asignados a las capas finales, donde el modelo base es más sensible. Ocupa 48,2 GB e incluye una cabeza de atención en Q5_0. Su relevancia radica en que permite ejecutar un modelo de 122B en hardware que de otro modo quedaría descartado, con un rendimiento medido de 16,3 tokens por segundo en una configuración de nueve P106-090.

La principal advertencia es que solo funciona con Miner Llama v3, un fork específico de llama.cpp, y no carga en builds estándar de llama.cpp ni en aplicaciones derivadas. Para cualquier otro motor o GPU, el autor recomienda la cuantización UD-Q2_K_XL de Unsloth (44,5 GB), compatible con todas las builds de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer; ~10B parámetros activos por token |
| Parametros totales | 124.635.206.144 (122B nominales) |
| Parametros activos | ~10B por token |
| Longitud de contexto | 49.152 tokens en la configuración de referencia medida |
| Tipos de cuantizacion | N2P y N3P (2 y 3 bits, tipos propios de Miner Llama); cabeza de atención en Q5_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `Ornith-1.5-122B-N2P-N3P-valid1-headQ5_0.gguf`, 48,2 GB) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-122B es un transformer de mezcla de expertos con 122B parámetros totales y aproximadamente 10B activos por token, especializado en agentes de programación en terminal. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación técnica de esta ficha reside en la cuantización: los expertos enrutados se almacenan en tipos N2P y N3P, definidos por el fork Miner Llama, con una asignación de bits no uniforme que concentra mayor precisión en las capas tardías, donde el modelo es más sensible. La cabeza de atención se mantiene en Q5_0. Según el autor, esta distribución supera a la cuantización UD-Q2_K_XL de Unsloth (de tamaño similar) en tres tipos de texto medidos (prosa, sesiones de agente de programación y código), a costa de 3,66 GB adicionales. La divergencia KL frente al Q8_0 del modelo original es de −0,00068 ± 0,00069 en la P106, indistinguible del ruido.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Programación y tareas de agente de terminal: el modelo base está especializado en sesiones de agente de código, con ejecución de tests reales en Python y JavaScript.
- Razonamiento multi-turno con contexto creciente: el banco de pruebas del autor simula un agente que corrige errores sucesivos con contexto acumulado.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en Miner Llama.
- Compatibilidad con clientes OpenAI-compatible a través de `llama-server`.
- Soporte de plantillas Jinja (`--jinja`) y tool calling a través del servidor compatible con OpenAI.
- Capacidades multilingües: no disponible.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Agente de corrección de bugs en terminal: el modelo base está diseñado para sesiones de agente que ejecutan tests y corrigen errores de forma iterativa; el banco de pruebas del autor valida 12 de 12 tareas de este tipo en Python y JavaScript con contexto creciente.
- Reutilización de granjas de minería como nodos de inferencia: nueve tarjetas P106-090 de 6 GB permiten servir un modelo de 122B con 49.152 tokens de contexto, aprovechando hardware retirado de bajo coste.
- Asistente de código autoalojado en entornos con restricciones de hardware moderno: útil en organizaciones que disponen de GTX 10 o Tesla P40 y no pueden adquirir GPU de centro de datos.
- Servicio local compatible con OpenAI: `llama-server` expone una API que cualquier cliente compatible puede consumir a través de un túnel SSH, adecuado para prototipos y uso interno.
- Procesamiento de documentos y código con contexto largo: los 49.152 tokens permiten analizar repositorios o sesiones de depuración extensas en una sola ventana.
- Laboratorio de cuantización e investigación: el archivo sirve para estudiar el impacto de esquemas de bits no uniformes (N2P/N3P) en la calidad de modelos MoE grandes sobre hardware limitado.

## Benchmarks y rendimiento

Datos del agent check del autor (doce tareas de corrección de bugs, nueve P106-090, contexto de 49.152 tokens, una ejecución por fila):

| Motor y archivo | Tareas superadas | Generación (tok/s) | Lectura de prompt (tok/s) | Primer token por turno (mediana) |
|---|---|---|---|---|
| llama.cpp estándar b12076, Unsloth UD-Q2_K_XL | 11 de 12 | 6,0 | 55 | 12,57 s |
| llama.cpp estándar b12076, este archivo | no carga (tipos N2P/N3P) | — | — | — |
| Miner Llama v3, Unsloth UD-Q2_K_XL, sin keep-alive | 12 de 12 | 12,6 | 69 | 7,90 s |
| Miner Llama v3, este archivo, sin keep-alive | 12 de 12 | 14,9 | 59 | 9,41 s |
| Miner Llama v3, este archivo, preset con keep-alive | 12 de 12 | 16,3 | 58 | 8,39 s |
| Miner Llama v2.0, Unsloth UD-Q2_K_XL | 12 de 12 | 9,7 | 67 | 7,58 s |

En la build de release `1551f5fe1`, sobre una segunda granja, el preset alcanza 16,42 tok/s con 12 de 12 tareas superadas. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el archivo coloca 46,4 GB en las tarjetas; el contexto consume el resto. Configuración de referencia: nueve tarjetas de 6 GB (54 GB totales).
- GPU compatibles: arquitectura Pascal, compute capability 6.1 (P106-090, P104, GTX 10, Tesla P4/P40). El reparto de capas `-ts 6,6,6,6,5,5,5,5,6` está ajustado a la memoria y debe recalcularse para otro número de tarjetas.
- No cabe en una GPU de consumo individual; requiere agregación multi-GPU.
- Host: un Celeron de 2 núcleos con 4 GB de RAM es suficiente (563 MB libres en el mínimo registrado).
- Software: Miner Llama v3.0 obligatorio; no carga en llama.cpp estándar, aplicaciones derivadas ni versiones anteriores de Miner Llama.
- Controladores: Ubuntu 24.04 o superior con driver NVIDIA 580, el último para Pascal.
- Rendimiento: 16,3 tok/s de generación y 58 tok/s de lectura de prompt con el preset; 14,9 tok/s sin keep-alive. Primer token por turno: 8,39 s de mediana.
- El keep-alive (`GGML_CUDA_KEEPALIVE=decode`) mantiene las tarjetas en su frecuencia boost mediante un bucle de un hilo por tarjeta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Compatibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B Pascal N2P (esta ficha) | 122B (MoE, ~10B activos) | 49.152 tokens (config. medida) | MIT | GGUF N2P/N3P | Solo Miner Llama v3 |
| Ornith-1.5-122B UD-Q2_K_XL (Unsloth) | 122B (MoE, ~10B activos) | no disponible | MIT | GGUF Q2_K_XL (44,5 GB) | Cualquier build de llama.cpp |
| Ornith-1.5-122B Q8_0 (original) | 122B (MoE, ~10B activos) | no disponible | MIT | safetensors/GGUF | llama.cpp y otros motores |

No se dispone de datos de benchmarks académicos comparativos con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total de Miner Llama v3: llama.cpp estándar, las aplicaciones construidas sobre él y versiones anteriores de Miner Llama no pueden cargar el archivo.
- El reparto de capas está calibrado para nueve tarjetas de 6 GB; otro número de tarjetas exige un `-ts` propio.
- La cuantización de 2 y 3 bits implica pérdida de precisión frente al Q8_0; el autor reporta divergencia KL mínima en la P106, pero no se documentan evaluaciones en otros conjuntos.
- Riesgo de alucinación inherente a modelos de lenguaje; no se han publicado evaluaciones específicas de sesgos en la información disponible.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme.
- Licencia MIT: permite uso comercial, pero el modelo base y sus derivados deben verificarse contra las condiciones del repositorio original de ornith-ai.
- El rendimiento medido corresponde exclusivamente a P106-090; no hay datos para otras tarjetas Pascal ni para GPU más modernas.
- El keep-alive consume un hilo por tarjeta y es necesario para alcanzar las cifras de velocidad publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CinderellaMan/Ornith-1.5-122B-Pascal-N2P-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Cuantización alternativa de Unsloth: https://huggingface.co/unsloth/Ornith-1.5-122B-GGUF
- Releases de Miner Llama: https://github.com/Cinderella-Man/miner-llama/releases
- Guía de configuración: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/setup.md
- Preset de Ornith v3: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/release/ornith-v3/README.md
- Página del modelo en granjas de minería: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/models/ornith-1.5-122b/README.md
- Agent check: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/tree/main/bench/agent_check
- Datos de regresión 2026-11-05: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/data/2026-11-05_release_regression/README.md
- Datos 2026-10-27: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/data/2026-10-27_ornith/README.md
- Datos 2026-11-06 (segunda granja): https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/data/2026-11-06_ornith_mtp_rig2/README.md
