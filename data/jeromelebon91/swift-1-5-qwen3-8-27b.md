# jEROMELebon91/Swift-1.5-Qwen3.8-27b

## Resumen

Swift 1.5 Qwen3.8-27B es un ajuste fino derivado de Qwen/Qwen3.8-27B desarrollado por UkisAI, orientado a reducir el coste de razonamiento sin perder exactitud. Segun su model card, emplea un 58,5 % menos de tokens de pensamiento que el modelo base y obtiene una puntuacion agregada un 0,35 % superior, lo que se traduce en una aceleracion de 1,95x en varias tareas. El modelo tiene 27.781.427.952 parametros (unos 27,78 B) y un repositorio de 55,6 GB en formato safetensors.

La ficha de HuggingFace que se analiza aqui (jEROMELebon91/Swift-1.5-Qwen3.8-27b) es una copia con 8 descargas y 0 likes cuyo contenido apunta al repositorio original de UkisAI (ukisai/Swift-1.5-Qwen3.8-27b), que aparece marcado como gated. La relevancia del modelo esta en su propuesta de eficiencia: en lugar de recortar directamente la longitud del razonamiento, el entrenamiento penaliza los tokens asociados a sobrepensamiento patologico y recupera exactitud mediante RL y OPD, con foco declarado en tareas de codigo y agenticas de horizonte largo.

El pipeline declarado es image-text-to-text, aunque la model card no describe capacidades de vision ni especifica arquitectura interna, longitud de contexto o idiomas soportados. La licencia es propietaria (swift-open-license-1.0), no estandar, por lo que cualquier uso comercial exige revisar el texto legal antes de desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo derivado por fine-tuning de Qwen/Qwen3.8-27B; tags qwen3_8 y qwen3_5) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Repo principal en safetensors (precision no declarada); existen conversiones GGUF y GSQ-RCO GGUF en repos separados de ukisai |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (campo `license: other`; repositorio original con `gated: true`) |
| Formato de pesos | safetensors (repo principal); GGUF en repos de conversion |
| Tarea declarada (pipeline) | image-text-to-text |
| Tamano del repositorio | 55,6 GB |
| Modelo base | Qwen/Qwen3.8-27B (relacion: finetune) |

## Arquitectura y entrenamiento

No se proporciona detalle de la arquitectura interna (tipo de atencion, capas, uso de MoE o configuracion del tokenizador). Lo unico verificable es que se trata de un modelo derivado por post-entrenamiento sobre Qwen3.8-27B, con 27,78 B de parametros y pesos en safetensors. Los tags del repositorio (`qwen3_8`, `qwen3_5`) y la etiqueta de pipeline `image-text-to-text` sugieren una familia con soporte multimodal de entrada, pero la model card no documenta ninguna capacidad de vision, por lo que ese extremo no puede confirmarse.

El metodo de entrenamiento descrito consiste en identificar que tokens estan vinculados a sobrepensamiento patologico y penalizarlos sin atacar directamente la longitud del razonamiento; despues se recupera exactitud mediante RL y OPD (on-policy distillation, segun la nomenclatura habitual del sector). Swift 1.5 se construye a partir de Swift 1.0 escalando esos mismos metodos de post-entrenamiento, con foco en tareas agenticas de horizonte largo y codigo. El conjunto de datos de entrenamiento se publica como ukisai/Qwen3.8-27B-multi-turn-agent-sft, aunque el autor aclara que no se usa tal cual: se remuestrea y se transforma en entornos de RL. No se especifica el numero total de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking), optimizado para consumir menos tokens de razonamiento que el modelo base.
- Codigo: mejoras declaradas en LiveCodeBench respecto a versiones anteriores, con generacion de proyectos completos en una sola sesion (demo de construccion de un juego 3D).
- Tareas agenticas y de terminal: el modelo cita mejoras en Terminal Bench 2.1, lo que implica uso de herramientas de linea de comandos y flujos multi-paso.
- Razonamiento multi-turno en entornos con herramientas, segun el dataset de SFT publicado (multi-turn agent SFT).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades de vision, audio o multimodalidad: el pipeline declarado es image-text-to-text, pero la model card no documenta ninguna capacidad visual; no confirmado.
- Modo de pensamiento eficiente (efficient-thinking, token-efficient) como rasgo diferencial frente al modelo base.

## Casos de uso

- Agentes de codigo en terminal: el modelo esta entrenado con foco en Terminal Bench 2.1 y tareas agenticas de horizonte largo, por lo que encaja en asistentes que ejecutan comandos, inspeccionan repositorios y aplican parches en bucle.
- Generacion de prototipos y demos interactivas: la model card documenta la construccion de un juego 3D funcional en 11,39 minutos frente a los 104,6 minutos del modelo base, lo que lo hace util para generar prototipos jugables o aplicaciones web completas a partir de un prompt.
- Asistentes de programacion integrados en IDE o CI/CD: la reduccion del 58,5 % en tokens de pensamiento abarata la inferencia por peticion, algo critico cuando se ejecutan miles de revisiones de codigo automatizadas.
- Pipelines de razonamiento con presupuesto de latencia ajustado: en tareas donde el tiempo de respuesta importa mas que exprimir el ultimo punto de exactitud, la aceleracion declarada de 1,95x permite usar el modelo en flujos interactivos.
- Automatizacion de tareas repetitivas de ingenieria: refactorizaciones, migraciones de dependencias y generacion de tests dentro de un agente que itera sobre la salida de herramientas.
- Despliegue local en estaciones de trabajo con GPU de consumo: al ser un modelo de 27,78 B, las conversiones GGUF permiten ejecutarlo cuantizado en una unica GPU de 24 GB.
- Evaluacion comparativa de tecnicas de eficiencia de razonamiento: sirve como referencia para investigar penalizacion de tokens de sobrepensamiento frente a recorte directo de longitud.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion, pero los valores concretos no aparecen en el material proporcionado. Los unicos datos cuantitativos disponibles son agregados relativos:

| Metrica | Valor declarado |
|---|---|
| Reduccion de tokens de pensamiento frente al base | 58,5 % |
| Variacion de puntuacion agregada frente al base | +0,35 % |
| Aceleracion en varias tareas | 1,95x (model card); 9,18x segun la pagina de modelos de ukisai.com (cifras inconsistentes entre fuentes) |
| Tiempo de construccion de un juego 3D (demo) | 11,39 min (Swift 1.5) frente a 104,6 min (Qwen3.8-27B base) |
| Benchmarks con mejora citada sin cifras | LiveCodeBench, Terminal Bench 2.1 |

Los datos de LiveCodeBench y Terminal Bench 2.1 se mencionan como mejoras, pero sin valores numericos en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones calculadas a partir del recuento de parametros (27,78 B), no datos publicados por el autor:

| Precision | Peso aproximado en VRAM | GPU necesaria |
|---|---|---|
| FP16 / BF16 | ~55,6 GB | 1x A100 80 GB, 1x H100 80 GB, 2x RTX 4090 24 GB |
| INT8 | ~28 GB | 1x A100 40 GB, 1x L40S 48 GB, 2x RTX 4090 |
| Q5_K_M (GGUF) | ~19-20 GB | 1x RTX 4090 24 GB |
| Q4_K_M (GGUF) | ~16,5-17,5 GB | 1x RTX 4090, RTX 5090, RTX 4080 16 GB al limite |

- Si cabe en GPU de consumo: en cuantizacion Q4/Q5 cabe en tarjetas de 24 GB (RTX 3090, 4090, 5090). En FP16 no cabe en ninguna GPU de consumo.
- GPU recomendadas para produccion: A100 80 GB o H100 80 GB en FP16/BF16; L40S o A100 40 GB en INT8.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para safetensors; llama.cpp, Ollama y LM Studio para las conversiones GGUF y GSQ-RCO GGUF publicadas por ukisai. La pagina de Featherless.ai indica que el modelo esta disponible como API hospedada.
- Latencia y throughput: no disponibles. La unica referencia es la aceleracion relativa de 1,95x frente al modelo base en tareas no especificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B | 27,78 B | No disponible | swift-open-license-1.0 (propietaria) | HF (repo original gated) + GGUF + API en Featherless | 58,5 % menos tokens de pensamiento, +0,35 % de puntuacion agregada frente al base |
| Qwen3.8-27B (base) | No disponible | No disponible | Segun el repositorio Qwen original | HF | Modelo de partida; en la demo tardo 104,6 min frente a 11,39 min de Swift 1.5 |
| Swift 1.0 (ukisai/Swift-Qwen3.8-27b) | No disponible | No disponible | No disponible | HF (350k+ descargas declaradas) | Predecesor directo; Swift 1.5 declara superarlo en codigo y tareas agenticas con menos tokens |

No se dispone de datos de rendimiento ni de contexto para comparar con alternativas de terceros del mismo rango de tamano.

## Limitaciones y advertencias

- Licencia propietaria no estandar (swift-open-license-1.0): es imprescindible leer el texto completo antes de cualquier uso comercial. El repositorio original esta marcado como `gated: true`.
- El repositorio analizado (jEROMELebon91/Swift-1.5-Qwen3.8-27b) es una copia de terceros con 8 descargas, no el repositorio oficial de UkisAI. Se desconoce si los pesos son identicos a los originales.
- Inconsistencia entre fuentes: la model card declara 1,95x de aceleracion y la pagina de modelos de ukisai.com declara 9,18x. No se puede verificar cual es correcta.
- No se documentan la longitud de contexto, los idiomas soportados ni la composicion del dataset de entrenamiento, lo que dificulta predecir el comportamiento en dominios o idiomas concretos.
- Riesgo de alucinacion: no cuantificado. La optimizacion por eficiencia de tokens de razonamiento puede reducir la profundidad de verificacion en tareas que requieren cadenas largas de comprobacion; no hay evaluaciones de factualidad publicadas.
- Sesgos: no disponibles. No hay ninguna evaluacion de sesgo, toxicidad o seguridad en la informacion proporcionada.
- La reduccion de tokens de pensamiento es un objetivo de optimizacion agresivo: en tareas de razonamiento muy complejas podria degradar la exactitud respecto a configuraciones con presupuesto de pensamiento amplio. No hay datos publicados que acoten ese riesgo.
- Formatos de cuantizacion: aunque existen repos GGUF, no se detallan los niveles disponibles ni su impacto en calidad.
- Fecha de creacion del repositorio (2026-09-30) y nombres de modelo poco habituales; conviene verificar la cadena de custodia de los pesos antes de usarlos en produccion.

## Enlaces

- Modelo en HuggingFace (copia analizada): https://huggingface.co/jEROMELebon91/Swift-1.5-Qwen3.8-27b
- Repositorio oficial declarado: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Version GGUF oficial: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Version GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo predecesor (Swift 1.0): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Dataset de SFT multi-turno agentico: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Pagina oficial del modelo: https://ukisai.com/swift-1-5-27b
- Pagina de producto: https://ukisai.com/products/swift
- Listado de modelos de UkisAI: https://ukisai.com/models
- Demo interactiva del juego 3D: https://ukisai.com/swift-games/27b
- API hospedada en Featherless.ai: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
