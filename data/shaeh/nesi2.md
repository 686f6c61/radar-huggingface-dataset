# Shaeh/Nesi2

## Resumen

Nesi2 es un modelo de lenguaje de gran tamano (27.356.728.560 parametros, ~27,4B) publicado en HuggingFace por el usuario Shaeh y presentado en su model card como un modelo "uncensored" curado y optimizado por Nesilabs para ciberseguridad ofensiva y defensiva: pentesting, analisis de vulnerabilidades, desarrollo de exploits, revision de codigo seguro y automatizacion de auditorias. Se distribuye unicamente como build GGUF para llama.cpp, con dos cuantizaciones (Q8_0 y Q6_K) y pesos adicionales de decodificacion especulativa MTP.

El modelo declara una ventana de contexto de hasta 262.144 tokens (240.000 en uso declarado en produccion) y tool calling nativo compatible con la API OpenAI a traves de `llama-server`, lo que permite integrarlo como agente autonomo en pipelines existentes sin necesidad de una pila vLLM/AWQ. Su relevancia actual reside en el nicho: modelos abiertos con contexto muy largo orientados especificamente a tareas de seguridad y sin filtros de rechazo, empaquetados para desplegarse en una sola GPU.

La informacion disponible es limitada: no hay model card de arquitectura, no se publican detalles de entrenamiento ni resultados de benchmarks numericos, y la unica validacion descrita es cualitativa (un CTF de tres etapas resuelto de extremo a extremo como agente). Ademas, existe una discrepancia entre el repositorio indicado en los comandos de descarga (`nesilabs/Nesi2`) y el ID real (`Shaeh/Nesi2`), y el propio autor advierte que la etiqueta de arquitectura del widget de HuggingFace corresponde solo a la clave interna del loader GGUF, no al modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, segun los tags del repo derivada de Qwen3.5 (`qwen3_5`); detalles de arquitectura no disponibles en la model card |
| Parametros totales | 27.356.728.560 (~27,4B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 262.144 tokens; 240.000 tokens declarados en produccion (245.760 por slot en las configuraciones de ejemplo) |
| Tipos de cuantizacion | Q8_0 (~29 GB) y Q6_K (~22 GB); cache KV en bf16 por defecto o `q8_0` (aprox. la mitad de footprint) |
| Idiomas soportados | Ingles (`en`); no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). El repo incluye tambien tag `safetensors` y el conteo de parametros procede de safetensors; tamano total del repo: 132 GB |
| Tool calling | Si, nativo y compatible con OpenAI (`/v1`) en `llama-server` |
| Decodificacion especulativa | Si, mediante pesos MTP (`*-mtp*.gguf`) y `--spec-type draft-mtp` |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos de arquitectura en la informacion disponible. La model card solo indica que se trata de un modelo de ~27B con contexto largo y tool calling nativo, empaquetado como GGUF, y advierte que el valor de `general.architecture` que muestra el widget de HuggingFace es una clave interna del loader de llama.cpp y no identifica la arquitectura real. Los tags del repositorio incluyen `qwen3_5`, lo que sugiere una base derivada de la familia Qwen3.5, pero el autor no lo confirma en la model card y no hay ficha tecnica que lo verifique.

Tampoco hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, proceso de alineacion (RLHF, DPO u otros) ni sobre el procedimiento de "curado" aplicado por Nesilabs. La unica innovacion tecnica documentada es el uso de un cabezal MTP (multi-token prediction) como draft para decodificacion especulativa, con `--spec-draft-n-max 3`, orientado a reducir la latencia en un solo stream; el autor indica que bajo concurrencia alta no observo mejora de throughput agregado en sus pruebas.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles con ventanas de hasta 262.144 tokens, lo que permite cargar repositorios de codigo, logs o trazas completas en un unico contexto.
- Tool calling / function calling nativo con esquema compatible con OpenAI, integrable en `llama-server` y en gateways tipo LiteLLM.
- Uso como agente autonomo multi-paso: la model card describe su validacion como agente de pentesting que encadena reconocimiento web, abuso de herramientas via WebSocket y ejecucion remota de comandos (RCE) en un objetivo de tres etapas.
- Tareas de seguridad ofensiva: analisis de vulnerabilidades, desarrollo de pruebas de concepto/exploits, enumeracion y post-explotacion en entornos autorizados.
- Tareas de seguridad defensiva: revision de codigo seguro, triaje de hallazgos, automatizacion de auditorias y analisis de configuraciones.
- Ausencia deliberada de filtros de rechazo ("uncensored"), orientada a evitar bloqueos en consultas legitimas de seguridad.
- Decodificacion especulativa opcional (MTP) para mejorar la latencia en single-stream.
- No se declaran capacidades de vision, audio, matematicas especializadas ni modo "thinking" explicito.

## Casos de uso

- Pentesting agenciado en laboratorio: desplegar el modelo con `llama-server` y un conjunto de herramientas (HTTP, shell, escaneo) para que planifique y ejecute cadenas multi-paso sobre maquinas de CTF o entornos con autorizacion expresa, aprovechando el tool calling nativo y el contexto largo para retener el estado de la mision.
- Revision de codigo seguro en repositorios completos: cargar modulos enteros o diffs extensos en una ventana de 240k tokens y solicitar deteccion de patrones inseguros (inyeccion, deserializacion, control de acceso) con referencias a linea y fichero.
- Gestion de vulnerabilidades: ingerir informes de escaneo y avisos CVE en un unico contexto para priorizar hallazgos, descartar falsos positivos y redactar recomendaciones de remediacion por activo.
- Redaccion de pruebas de concepto en entornos controlados: generar PoC y scripts de validacion para vulnerabilidades identificadas, con la ventaja de que el modelo no rechaza la peticion por su contenido, lo que reduce friccion en equipos de seguridad.
- Automatizacion de auditorias y cumplimiento: usar el endpoint `/v1` desde un orquestador (LiteLLM u otro) para clasificar configuraciones, comparar baselines y producir informes estructurados por lote.
- Analisis forense y de logs de gran volumen: procesar trazas de proxy, logs de servidor web o salidas de EDR dentro de la ventana extendida para correlacionar indicadores de compromiso sin fragmentar el contexto.
- Asistente interno de operaciones de seguridad (SOC): triaje de alertas y generacion de resumenes de incidentes en ingles, con despliegue on-premise para no enviar telemetria sensible a terceros.
- Formacion y simulacion de red team: entrenamiento de analistas con un modelo que mantiene el rol y no se niega a discutir tecnicas ofensivas en un marco docente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni metricas de seguridad tipo Cybench). La unica evidencia de rendimiento es cualitativa: la model card afirma que el modelo alcanza ejecucion de codigo en objetivos multi-etapa (web, abuso de herramientas via WebSocket y RCE) con loot y flag en un CTF de tres etapas, sin cifras reproducibles ni detalle del arnes de evaluacion.

Los unicos datos numericos publicados son de throughput en las configuraciones de despliegue recomendadas por el autor:

| GPU | VRAM | Configuracion | Slots @ 240k | tok/s single-stream |
|---|---|---|---|---|
| RTX A6000 | 48 GB | Q6_K | 1 | ~22 |
| RTX PRO 6000 Max-Q (~300 W) | 96 GB | Q6_K / Q8_0 | 1-3 | ~20-25 (extremo a extremo via gateway) |
| RTX PRO 6000 WS (~600 W) | 96 GB | Q8_0 + MTP | hasta 5 | ~55 |

## Requisitos de hardware

- VRAM de pesos: ~29 GB para Q8_0 y ~22 GB para Q6_K; anadir ~3 GB si se carga el draft MTP de Q8.
- VRAM total en la configuracion de referencia: ~84 GB de 96 GB para Q8_0 + MTP con 5 slots de 245.760 tokens y cache KV cuantizada en `q8_0`.
- GPU recomendadas: RTX PRO 6000 WS de 96 GB (hasta 5 usuarios concurrentes a 240k, ~55 tok/s) y RTX PRO 6000 Max-Q de 96 GB (1-3 usuarios, ~20-25 tok/s); RTX A6000 de 48 GB para un unico usuario a 240k con Q6_K (~22 tok/s).
- Cabe en GPU de consumo solo con cuantizaciones mas agresivas no publicadas por el autor (la model card menciona `q4_0` como recurso ante OOM, sin fichero validado); Q6_K (~22 GB) excede los 24 GB de una RTX 4090 en la practica al sumar cache KV para contextos largos.
- Despliegue: llama.cpp `llama-server` con API OpenAI `/v1` y `--api-key`; integracion con LiteLLM; requiere compilacion con CUDA (Blackwell `sm_120` necesita CUDA toolkit >= 12.8 y `-DCMAKE_CUDA_ARCHITECTURES=120`; Ampere A6000 usa `86`).
- Para MTP hace falta un build de llama.cpp con soporte de `--spec-type draft-mtp`; sin el, se ejecuta el modelo sin decodificacion especulativa.
- Contexto: `--parallel N` reparte `--ctx-size`, de modo que 5 slots de ~240k exigen `--ctx-size 1228800` y cache KV cuantizada en `q8_0`.
- Disco: >= 60 GB para una cuantizacion, >= 90 GB para alojar Q8 y Q6 en la misma maquina.

## Comparativa con modelos similares

No hay datos de benchmarks de Nesi2 que permitan una comparacion de rendimiento. La tabla contrasta solo especificaciones publicas de alternativas de tamano y categoria similares (datos de sus respectivas model cards, no verificados en esta ficha):

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Nesi2 | ~27,4B | 262.144 (240k en produccion) | Apache 2.0 | GGUF (Q8_0, Q6_K) | Ciberseguridad, sin filtros, tool calling |
| Qwen2.5-32B-Instruct | ~32,8B | 131.072 | Apache 2.0 | safetensors, GGUF | Proposito general con tool calling |
| Mistral Small 3.1 24B | 24B | 128.000 | Apache 2.0 | safetensors, GGUF | Proposito general, instrucciones |
| Llama 3.3 70B Instruct | 70B | 128.000 | Llama 3.3 Community License | safetensors, GGUF | Proposito general, uso condicionado |

## Limitaciones y advertencias

- Modelo "uncensored": la ausencia de filtros de rechazo implica riesgo real de generar contenido danino si se usa fuera de un marco autorizado; el despliegue deberia ir acompanado de controles de acceso, registro de prompts y limitacion de herramientas disponibles.
- Solo declara ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion no evaluado: no hay benchmarks ni evaluaciones de fidelidad, y en dominios de seguridad una alucinacion (un CVE, una linea de codigo o un vector inexistente) puede inducir a error grave.
- Sin ficha de arquitectura ni de datos de entrenamiento: no se puede auditar la procedencia del modelo base, la composicion del dataset ni el proceso de alineacion; la atribucion a Qwen3.5 se basa solo en un tag.
- Licencia Apache 2.0 declarada, pero el autor no detalla obligaciones de atribucion ni si el modelo derivado mantiene todas las condiciones de la licencia del modelo base; conviene revisar antes de uso comercial.
- Distribucion exclusivamente GGUF: no hay safetensors publicados por el autor para reentrenamiento o fine-tuning, a pesar de que el conteo de parametros proviene de safetensors.
- MTP requiere un build no estandar de llama.cpp y solo aporta mejoras de latencia en single-stream, no en concurrencia.
- Discrepancia de identificadores: los comandos de descarga apuntan a `nesilabs/Nesi2` mientras el repositorio es `Shaeh/Nesi2`; verificar el destino antes de automatizar despliegues.
- Repositorio sin descargas ni likes y creado/actualizado en la misma fecha: no hay evidencia de comunidad, mantenimiento ni soporte.
- La validacion como agente de pentesting es una afirmacion del autor sin trazas publicas ni reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/Shaeh/Nesi2
- llama.cpp (motor de inferencia requerido): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos no guardan relacion con Nesi2 ni con inteligencia artificial, por lo que se descartan. No hay paper, blog tecnico, repositorio de codigo ni demo adicionales disponibles.
