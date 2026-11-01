# mradermacher/compctx-0.8b-GGUF

## Resumen

compctx-0.8b es un modelo de lenguaje ligero de 752 millones de parámetros desarrollado por aksern, basado en la arquitectura Qwen3.5 y entrenado como adaptador LoRA sobre el modelo base. Su especialización es la gestión de memoria para agentes de IA y la sumarización de trazas (trace summarization), es decir, la capacidad de condensar historiales de conversación o ejecución de un agente en resúmenes compactos que pueden reinyectarse como contexto. Esto lo convierte en una pieza útil para construir sistemas agénticos con memoria persistente a bajo coste computacional.

La versión aquí documentada es una cuantización GGUF publicada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face que genera versiones estáticas en múltiples niveles de precisión (desde Q2_K hasta f16) para que el modelo pueda ejecutarse en hardware modesto, incluidas CPU y GPUs de consumo. Con tamaños que van desde 0,5 GB (Q2_K) hasta 1,6 GB (f16), es un modelo extremadamente accesible para despliegues locales.

Su relevancia actual radica en la tendencia hacia sistemas multiagente y pipelines con contexto largo, donde un modelo pequeño y barato dedicado a comprimir memoria puede liberar al modelo principal de la carga de procesar historiales extensos. Al ser text-only y de tamaño reducido, encaja bien como componente auxiliar en arquitecturas de agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5), adaptador LoRA |
| Parámetros totales | 752.393.024 (~0,8B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (esta cuantización); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3.5 como base y añade un adaptador LoRA entrenado específicamente para tareas de memoria de agentes y sumarización de trazas. LoRA (Low-Rank Adaptation) permite especializar un modelo preentrenado entrenando solo matrices de bajo rango, lo que reduce drásticamente el coste de entrenamiento y el tamaño del delta de pesos. El repositorio original en safetensors suma 752,4 millones de parámetros, lo que indica que el adaptador se ha fusionado con el modelo base en la versión cuantizada.

No se ha publicado información sobre el dataset de entrenamiento (número de tokens, composición), ni sobre el uso de técnicas de alineación como RLHF o DPO. Tampoco consta el número exacto de tokens de contexto que soporta, aunque al derivar de Qwen3.5 es razonable asumir una ventana de contexto amplia; este dato debe verificarse en el repositorio del modelo base.

## Capacidades

- Generación de texto en inglés, especializada en sumarización de trazas de ejecución de agentes.
- Compresión de memoria conversacional: condensa historiales multi-turno en resúmenes reutilizables como contexto.
- Diseñado como componente de pipelines agénticos (etiqueta agent-memory), no como chatbot de propósito general.
- Uso conversacional básico según el pipeline text-generation, aunque su especialización puede degradar el rendimiento en tareas generales.
- Text-only: sin capacidades de visión, audio ni multimodalidad.
- No consta soporte oficial de tool calling ni de modo de razonamiento extendido (thinking mode).

## Casos de uso

- Compresión de memoria en agentes conversacionales: un orquestador puede invocar este modelo periódicamente para resumir el historial de un agente y mantener el contexto del modelo principal por debajo de su ventana, reduciendo coste y latencia.
- Sumarización de logs de ejecución: condensar trazas largas de llamadas a herramientas (tool calls, resultados, errores) en resúmenes accionables para el siguiente paso del agente.
- Memoria persistente en sistemas multiagente: generar resúmenes compartidos que distintos agentes puedan consumir como contexto común sin reprocessar conversaciones completas.
- Depuración de pipelines agénticos: producir resúmenes legibles de sesiones de agentes fallidas para análisis posterior.
- Ejecución local en hardware modesto: con cuants de 0,5-0,7 GB, puede correr en portátiles sin GPU dedicada, útil para prototipado de arquitecturas de memoria.
- Procesamiento por lotes de historiales: dada su pequeña huella, es viable desplegar múltiples instancias en paralelo para sumarizar miles de sesiones a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,6 GB (f16) solo de pesos; con contexto y overhead de runtime, bastan aproximadamente 1-3 GB de memoria.
- Cabe sobradamente en cualquier GPU de consumo (incluso GPUs de 4 GB) y funciona con fluidez en CPU pura gracias al formato GGUF.
- GPU recomendadas: no es necesario hardware dedicado; en CPU moderna (por ejemplo, con AVX2) se esperan velocidades de decodificación altas dado el tamaño de 0,8B, aunque no hay mediciones publicadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. La versión original en safetensors puede servirse con transformers o vLLM.
- No se han publicado mediciones de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Especialización | Licencia |
|---|---|---|---|---|
| compctx-0.8b (esta ficha) | 0,75B | GGUF (cuants Q2_K a f16) | Memoria de agentes, sumarización de trazas | OpenMDW 1.1 |
| Qwen3.5 (modelo base) | no disponible | safetensors | Propósito general | no disponible |
| Modelos generales de ~1B (p. ej. Llama/Qwen en tamaños similares) | ~1B | GGUF, safetensors | Propósito general, no especializados en memoria de agentes | Varía |

No se han publicado datos de rendimiento comparables, por lo que la comparativa se limita a características declaradas. La ventaja diferencial de compctx-0.8b frente a modelos generales de tamaño similar es su especialización en sumarización de trazas; a cambio, probablemente sea peor en tareas generales.

## Limitaciones y advertencias

- Entrenado y etiquetado solo para inglés: el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- Al ser un modelo de 0,8B especializado con LoRA, es esperable un alto riesgo de alucinación o de degradación fuera de su dominio de entrenamiento (sumarización de trazas); no debe usarse como chatbot general.
- Longitud de contexto no documentada: verificar antes de usarlo con trazas muy largas.
- La licencia OpenMDW 1.1 es una licencia abierta poco común; revisar sus términos concretos antes de uso comercial, ya que no es una licencia estándar tipo Apache 2.0.
- mradermacher publica solo cuants estáticos; los weighted/imatrix quants no están disponibles, por lo que los cuants bajos (Q2_K, Q3_K) pueden perder más calidad de lo habitual.
- No hay benchmarks publicados, por lo que su eficacia en la tarea de sumarización debe validarse empíricamente en cada caso de uso.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/compctx-0.8b-GGUF
- Modelo base con adaptador: https://huggingface.co/aksern/compctx-0.8b
- Página de descargas de mradermacher: https://hf.tst.eu/model#compctx-0.8b-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (soporte de infraestructura): https://www.nethype.de/
