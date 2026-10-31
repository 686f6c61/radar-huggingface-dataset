# MMLA-ORG/MMLA-Orbit-1B

## Resumen

Orbit (MMLA-Orbit-1B) es el primer modelo publicado por MMLA-ORG: un modelo de lenguaje de clase 1B que combina un backbone Transformer con un sistema de estado de politica adaptativa y memoria autoritativa versionada. A diferencia de un LLM convencional, Orbit incorpora tres mecanismos diferenciados: LARC, que mantiene estado numerico local al problema; memoria autoritativa, que conserva registros con version y ambito; y RTMA, que gestiona que registros se retienen y se leen durante cada tarea. Ademas, incluye un controlador RSI (recursive self-improvement) capaz de proponer, evaluar e instalar reglas sucesoras de gestion de memoria.

El problema que aborda no es la generacion de texto general, sino la ejecucion de tareas con adaptacion explicita de memoria y politica, algo relevante para investigacion en agentes con memoria persistente y auto-mejora controlada. El modelo es agnostico al mixer de secuencia, aunque este checkpoint emplea un mixer basado en Transformer. Esta publicado bajo licencia AGPL-3.0 y requiere un runtime propio (no es compatible con el pipeline estandar de Transformers).

Su relevancia actual es principalmente experimental: los benchmarks convencionales publicados lo sitúan por debajo de modelos comparables como Qwen2.5-1.5B-Instruct, de modo que su interes se centra en los mecanismos de memoria y RSI mas que en el rendimiento de lenguaje puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con estado de politica (Φ) y memoria autoritativa (M); MMLA/PDSA, LARC/RTT, RTMA/RSI |
| Parametros totales | no disponible (clase 1B segun el nombre) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (evaluacion en FP32) |
| Idiomas soportados | ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Orbit se compone de un backbone compartido con tres roles internos: un lector de tareas, un proponente aprendido y su rol original de comparacion; todos forman parte de un unico modelo. Sobre el backbone, el framework MMLA separa el estado de politica (Φ) de la memoria autoritativa (M), con interfaces explicitas de lectura, escritura y accion conjunta. LARC implementa inicializacion residual entrenada y actualizaciones con retroalimentacion real sobre factores privados, con recuperacion de estado guardado. RTMA gestiona la retencion y lectura de registros de memoria durante la tarea, y su controlador RSI puede proponer, evaluar e instalar reglas sucesoras de gestion de memoria de forma condicional.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens ni el uso de tecnicas como RLHF o DPO. En los experimentos de memoria publicados, Φ se mantiene fijo para ejercitar RTMA y el controlador recursivo de forma independiente de la adaptacion numerica. En la ejecucion de referencia de 40 propuestas, el controlador RSI instalo una unica regla sucesora constante que escribe NULL, sin nuevas confirmaciones de memoria de propuestas tras su instalacion. La calibracion predictiva Q/J queda restringida a su lector cualificado.

## Capacidades

- Modelado de lenguaje en ingles con protocolo de completado por verosimilitud (zero-shot, sin plantilla de chat ni ejemplos few-shot)
- Estado de politica adaptativa con interfaces explicitas de lectura, escritura y accion conjunta (MMLA/PDSA)
- Memoria autoritativa versionada y con ambito, con recuperacion de estado guardado (LARC/RTT)
- Gestion aprendida de memoria de tarea (RTMA): seleccion de registros retenidos y leidos durante la ejecucion
- Auto-mejora recursiva controlada (RSI): propuesta, evaluacion, admision independiente e instalacion condicional de reglas sucesoras de gestion de memoria
- Tres modos de ejecucion: frames completos, streaming causal con segmentacion determinista CSBC, y acciones numericas/memoria combinadas
- No incluye capacidades de vision, audio, tool calling estandar ni agentes multi-step convencionales; el soporte de agentes se limita al bucle RSI con un task host propio

## Casos de uso

- Investigacion en memoria persistente para agentes: el sistema de memoria autoritativa versionada permite experimentar con que registros se retienen y leen durante una tarea, con admision independiente de candidatos
- Estudio de auto-mejora recursiva segura: el controlador RSI con evaluacion y instalacion condicional de reglas sirve como banco de pruebas para pipelines de self-improvement con controles explicitos
- Experimentacion con adaptacion en inferencia: LARC permite actualizar factores privados con retroalimentacion real durante la tarea, util para investigacion en online learning
- Prototipado de streaming causal: el modo stream con segmentacion determinista CSBC permite evaluar procesamiento incremental de secuencias
- Comparacion de politicas de gestion de memoria: los benchmarks con memorias de 8 slots y grupos de admision sellados ofrecen un protocolo reproducible para comparar gestores de memoria
- Verificacion de sistemas con estado: los registros de verificacion de transiciones de estado y save/restore son utiles como referencia para testing de modelos con estado mutable

## Benchmarks y rendimiento

Benchmarks convencionales (precision en %, protocolo zero-shot de verosimilitud por completado, FP32):

| Model | ARC-E | ARC-C | HellaSwag | WinoGrande | MMLU |
|---|---:|---:|---:|---:|---:|
| **Orbit (esta version)** | 62.08 | 36.18 | 47.44 | 55.17 | 52.06 |
| MiniCPM5-1B-SFT | 61.11 | 35.75 | 47.77 | 56.12 | 53.01 |
| MiniCPM5-1B (RL/OPD) | 60.44 | 36.01 | 47.69 | 56.27 | 52.91 |
| Qwen2.5-1.5B-Instruct | 75.93 | 46.50 | 68.33 | 62.83 | 60.13 |
| SmolLM2-1.7B-Instruct | 62.92 | 43.86 | 71.77 | 68.35 | 48.40 |

Poblaciones completas: 2.376 / 1.172 / 10.042 / 1.267 / 14.042 ejemplos. ARC y HellaSwag usan verosimilitud normalizada por caracteres; WinoGrande, verosimilitud de sufijo comun; MMLU, micro precision sobre 57 materias. Sin plantilla de chat ni adaptacion online.

Benchmarks con memoria asistida (32 ejemplos de soporte por dominio, memoria de 8 slots, pesos y Φ fijos):

| Politica de memoria | ARC-E | ARC-C | HellaSwag | WinoGrande | MMLU |
|---|---:|---:|---:|---:|---:|
| Memoria vacia (mismo contexto) | 62.08 | 36.18 | 47.44 | 55.17 | 52.06 |
| Gestor inicial · 0 propuestas | 52.40 | 29.01 | 38.09 | 52.72 | 29.73 |
| Gestor de cobertura fija | 53.54 | 29.69 | 37.12 | 54.85 | 29.05 |
| RSI · 10 propuestas | 62.08 | 36.18 | 47.44 | 55.17 | 52.06 |
| RSI · 20 propuestas | 62.08 | 36.18 | 47.44 | 55.17 | 52.06 |
| RSI · 40 propuestas | 62.08 | 36.18 | 47.44 | 55.17 | 52.06 |

Cabe destacar que los checkpoints de RSI a 10, 20 y 40 propuestas reutilizan la misma regla sucesora constante instalada (`c2`), con memorias de tarea vacias, por lo que sus puntuaciones identicas se deben a reutilizacion de evidencia y no a mejoras acumulativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; dado el tamano del repositorio (2,3 GB) y la ejecucion de referencia en FP32, un modelo de clase 1B en FP32 requiere aproximadamente 4-5 GB de VRAM, aunque no se ha publicado una cifra oficial
- GPU recomendadas: no disponible; el ejemplo de carga usa `device="cuda"`, por lo que cualquier GPU moderna con suficiente VRAM deberia ser valida
- Consumer GPU: no hay datos oficiales, pero por tamano de pesos deberia funcionar en GPUs de gama media como una RTX 3060 o superior
- Despliegue: requiere el runtime propio `mmla_orbit` en Python 3.11 (instalacion via `requirements.txt` del repositorio); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que usa un loader MMLA personalizado en lugar del pipeline estandar de Transformers
- Latencia y throughput: no disponibles
- Requisito operativo: el repositorio debe descargarse en un directorio local normal, no en un snapshot enlazado simbolicamente de la cache del Hub

## Comparativa con modelos similares

| Model | Parametros | ARC-E | ARC-C | HellaSwag | WinoGrande | MMLU | Licencia |
|---|---|---:|---:|---:|---:|---:|---|
| MMLA-Orbit-1B | no disponible (clase 1B) | 62.08 | 36.18 | 47.44 | 55.17 | 52.06 | AGPL-3.0 |
| Qwen2.5-1.5B-Instruct | 1,5B | 75,93 | 46,50 | 68,33 | 62,83 | 60,13 | Apache 2.0 |
| SmolLM2-1.7B-Instruct | 1,7B | 62,92 | 43,86 | 71,77 | 68,35 | 48,40 | Apache 2.0 |
| MiniCPM5-1B-SFT | 1B | 61,11 | 35,75 | 47,77 | 56,12 | 53,01 | no disponible |

Orbit queda por detras de Qwen2.5-1.5B-Instruct en todos los benchmarks y en general por detras de SmolLM2-1.7B-Instruct, salvo en MMLU. Su diferenciador no es el rendimiento de lenguaje, sino los mecanismos de memoria y RSI, ausentes en los modelos comparados. Ademas, su licencia AGPL-3.0 es mas restrictiva que las Apache 2.0 de las alternativas.

## Limitaciones y advertencias

- Rendimiento de lenguaje por debajo de alternativas de tamano similar o superior: no es adecuado como LLM de proposito general
- El controlador RSI en la ejecucion de referencia instalo una regla sucesora constante que escribe NULL y no realizo nuevas confirmaciones de memoria; la auto-mejora recursiva efectiva esta limitada en esta version
- La calibracion predictiva Q/J solo es valida para su lector cualificado, lo que restringe su uso generalizado
- Solo soporta ingles; no hay informacion sobre capacidades multilingues
- Licencia AGPL-3.0: el uso en productos derivados puede obligar a liberar el codigo fuente; revisar compatibilidad antes de uso comercial
- Requiere runtime propio y Python 3.11; no funciona con el ecosistema estandar de Transformers, lo que complica la integracion en pipelines existentes
- El repositorio debe descargarse fuera de la cache enlazada del Hub; la carga desde snapshots con symlinks no esta soportada
- Riesgo de alucinacion y sesgos: no se ha publicado ninguna evaluacion al respecto
- Contexto maximo, cuantizaciones disponibles y requisitos exactos de VRAM: no disponibles

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MMLA-ORG/MMLA-Orbit-1B
- Runtime y codigo fuente: https://github.com/MMLA-org/MMLA-RSI
- Guia de arquitectura: https://github.com/MMLA-org/MMLA-RSI/blob/main/docs/orbit/ARCHITECTURE.md
- Guia de uso: https://github.com/MMLA-org/MMLA-RSI/blob/main/docs/orbit/USAGE.md
- Guia del runtime RSI: https://github.com/MMLA-org/MMLA-RSI/blob/main/docs/orbit/RSI_RUNTIME.md
- Paper MMLA: https://arxiv.org/abs/2606.28876v4
- Paper LARC: https://arxiv.org/abs/2609.40063
- Paper MMLA-RSI: https://arxiv.org/abs/2610.20294v1
