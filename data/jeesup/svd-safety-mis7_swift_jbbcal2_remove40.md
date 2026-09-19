# Jeesup/svd-safety-mis7_swift_jbbcal2_remove40

## Resumen

svd-safety-mis7_swift_jbbcal2_remove40 es un checkpoint derivado de mistralai/Mistral-7B-Instruct-v0.2 obtenido mediante compresion SVD-LLM, en el que se ha eliminado el 40,00% de los parametros densos (fraccion resultante de 0,6003). El autor, Jeesup, lo publica como artefacto de investigacion dentro de un estudio sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad del modelo y que regla de seleccion de componentes lo repara mejor. Esta celda concreta de la rejilla experimental usa la regla de seleccion etiquetada como "unknown" y un presupuesto de restauracion del 0,000%, es decir, cero componentes SVD recuperados.

El modelo resuelve un problema de investigacion, no de producto: cuantificar el coste en seguridad (medido como tasa de exito de ataque) y en utilidad (medida como perplejidad) que introduce la compresion, y servir de sujeto experimental para probar tecnicas de reparacion. La model card advierte explicitamente de que varias celdas de la rejilla estan degradadas en seguridad de forma deliberada y de que el checkpoint no es un asistente conversacional de proposito general.

La arquitectura heredada es la de Mistral-7B-Instruct-v0.2 (transformer denso, decoder-only, con atencion de ventana deslizante en el modelo base), con 7.241.732.096 parametros declarados en los ficheros safetensors y un tamano de repositorio de 14,5 GB. El interes actual del artefacto es metodologico: aporta metricas pareadas de ASR y perplexity sobre una version comprimida de un modelo ampliamente usado, lo que permite auditar el impacto de la compresion en el alineamiento antes de desplegar variantes comprimidas en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de Mistral-7B-Instruct-v0.2); pesos modificados mediante compresion SVD-LLM |
| Parametros totales | 7.241.732.096 (recuento de safetensors); la model card declara una fraccion resultante de 0,6003 respecto a los parametros densos del modelo base |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Mistral-7B-Instruct-v0.2 declara 32.768 tokens |
| Tipos de cuantizacion | No se publican variantes cuantizadas (GGUF, GPTQ, AWQ, bitsandbytes) en la informacion disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 14,5 GB |
| Libreria | transformers (compatible con text-generation-inference y endpoints) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Metodo de compresion | SVD-LLM, 40,00% de parametros eliminados, semilla 42 |
| Regla de seleccion de componentes | "unknown" |
| Presupuesto de restauracion | 0,000% de los parametros densos (0 componentes restaurados, 0 componentes sustituidos) |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

El checkpoint no se ha entrenado desde cero: parte de Mistral-7B-Instruct-v0.2, un transformer denso decoder-only de 7B parametros afinado por instrucciones, y le aplica compresion SVD-LLM. Esta tecnica descompone las matrices de pesos y descarta componentes de bajo rango, lo que reduce el numero de parametros efectivos a costa de alterar las representaciones internas. En esta celda se elimina el 40,00% de los parametros densos, quedando una fraccion resultante de 0,6003, y no se restaura ningun componente SVD adicional (presupuesto 0,000%, regla de seleccion "unknown"). La semilla utilizada es 42.

No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO especificas para este artefacto; el alineamiento procede exclusivamente del modelo base. Tampoco se describe el detalle de implementacion de la descomposicion (que capas se comprimen, rango retenido por capa o criterio exacto de la regla "unknown"). La innovacion relevante no es arquitectonica sino experimental: el artefacto forma parte de una rejilla sobre reglas de seleccion de componentes y presupuestos de restauracion, disenada para medir el deterioro de seguridad y la recuperacion posterior.

## Capacidades

- Generacion de texto conversacional en la medida en que la conserva el modelo base tras la compresion; la model card no certifica ninguna capacidad concreta.
- Razonamiento y conocimiento generales del modelo base, degradados de forma no cuantificada por la eliminacion del 40,00% de los parametros (la perplejidad en WikiText-2 sube a 9,9051).
- Respuesta a instrucciones y formato de chat conversacional heredado de Mistral-7B-Instruct-v0.2.
- Soporte de tool calling o function calling: no documentado en la informacion disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidad especial relevante: servir como sujeto de medida de seguridad, con tasas de exito de ataque publicadas (AdvBench ASR 0,2635 y StrongREJECT ASR 0,2620) y sobre-rechazo macro medido con WildGuard (0,1406).
- Modo de razonamiento explicito (thinking), vision o audio: no disponibles.

## Casos de uso

- Auditoria de seguridad de pipelines de compresion: el modelo se usa como muestra de prueba para medir cuanto sube la tasa de exito de ataque (ASR) al eliminar el 40,00% de los parametros, comparando el resultado con el modelo base sin comprimir.
- Investigacion en alineamiento y mecanismos de rechazo: al ser una version degradada de un modelo instruido conocido, permite estudiar que componentes de bajo rango sostienen el comportamiento de negativa ante peticiones daninas.
- Evaluacion comparativa de reglas de seleccion de componentes SVD: esta celda concreta (regla "unknown", presupuesto 0,000%) sirve como punto de control dentro de una rejilla experimental, para aislar el efecto de la regla frente a otras celdas del mismo estudio.
- Analisis del compromiso entre utilidad y seguridad: las metricas pareadas de perplejidad en WikiText-2 (9,9051) y de sobre-rechazo con WildGuard (0,1406) permiten construir curvas de trade-off frente al presupuesto de restauracion.
- Red teaming y pruebas de robustez: puede emplearse como objetivo controlado en ejercicios de ataque automatico, dado que su ASR esta cuantificado con jueces de HarmBench.
- Docencia e investigacion en interpretabilidad: sirve para ilustrar de forma reproducible (semilla 42) como una transformacion de bajo rango altera el comportamiento observable de un LLM de 7B.
- Validacion de metodologia de evaluacion: util para comprobar que los arneses de medida de ASR y de sobre-rechazo detectan degradaciones introducidas artificialmente antes de aplicarlos a modelos en produccion.
- No se recomienda su uso como asistente conversacional desplegado, chatbot de atencion al cliente ni generacion de codigo en produccion; la propia model card lo desaconseja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para pruebas estandar como MMLU, HumanEval o GSM8K. Los unicos datos publicados son las metricas de seguridad y perplexity que se recogen a continuacion.

| Metrica | Valor | Juez o conjunto de evaluacion |
|---|---|---|
| AdvBench ASR | 0,2635 | HarmBench judge |
| StrongREJECT ASR | 0,2620 | HarmBench judge |
| Sobre-rechazo macro | 0,1406 | WildGuard |
| Perplejidad WikiText-2 | 9,9051 | WikiText-2 |

No se proporcionan los valores equivalentes del modelo base Mistral-7B-Instruct-v0.2 en la informacion disponible, por lo que no es posible calcular la delta de degradacion a partir de estos datos.

## Requisitos de hardware

Los valores de VRAM son estimaciones calculadas a partir del recuento de parametros declarado (7.241.732.096) y no cifras publicadas por el autor.

- Inferencia en fp16/bf16: aproximadamente 14,5 GB solo para pesos, mas cache KV; se recomienda un minimo de 16-18 GB de VRAM.
- Inferencia en int8: aproximadamente 7,3 GB de pesos.
- Inferencia en 4 bits: aproximadamente 4 GB de pesos, si se genera una cuantizacion propia, ya que el autor no publica ninguna.
- GPU recomendadas para precision completa: A100 40 GB, H100, L40S o RTX 4090 24 GB para una sola instancia.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 a fp16 con contexto moderado, y en RTX 3060 12 GB o RTX 4070 si se cuantiza a 4 bits.
- Opciones de despliegue: transformers; el repositorio esta etiquetado como compatible con text-generation-inference y endpoints. No se publican ficheros GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-mis7_swift_jbbcal2_remove40 | 7.241.732.096 declarados; fraccion resultante 0,6003 | No disponible | AdvBench ASR 0,2635; StrongREJECT ASR 0,2620; sobre-rechazo 0,1406; perplejidad WikiText-2 9,9051 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | 32.768 tokens (segun el modelo base) | No disponibles en la informacion proporcionada | Apache 2.0 | HuggingFace (modelo de referencia) |
| Otras celdas de la rejilla del mismo estudio | No disponible | No disponible | No disponible | Apache 2.0 (presumiblemente) | No identificadas en la informacion proporcionada |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigacion: la model card indica explicitamente que no es un modelo de chat de proposito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Degradacion deliberada de seguridad: la compresion por si sola eleva la tasa de exito de ataque, y esta celda concreta tiene un presupuesto de restauracion del 0,000%, es decir, sin reparacion alguna.
- ASR medido elevado: 0,2635 en AdvBench y 0,2620 en StrongREJECT segun el juez de HarmBench, valores que deben interpretarse dentro del diseno experimental y no como una garantia de seguridad.
- Sobre-rechazo: 0,1406 macro segun WildGuard, lo que implica que el modelo tambien rechaza peticiones legitimas en una proporcion medible.
- Perdida de calidad general: perplejidad de 9,9051 en WikiText-2; no se publican evaluaciones de razonamiento, codigo o matematicas, por lo que la magnitud del dano en esas tareas es desconocida.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, y previsiblemente agravado por la compresion.
- Idiomas: no se documentan los idiomas soportados; no se puede asumir cobertura multilingue.
- Contexto: no se documenta la ventana efectiva tras la compresion, aunque el modelo base declara 32.768 tokens.
- Reproducibilidad de la evaluacion: la regla de seleccion se etiqueta como "unknown", lo que dificulta replicar exactamente la construccion de este checkpoint.
- Licencia: Apache 2.0 para este derivado. La model card senala que el repositorio del modelo base no incluye fichero de licencia para redistribuir, por lo que la licencia indicada gobierna unicamente esta version derivada.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_jbbcal2_remove40
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Paper de SVD-LLM: no se proporciona enlace en la informacion disponible
- Repositorio de codigo del estudio: no disponible
- Demo: no disponible
