# mradermacher/BetterWright-K2-Horizon-7B-Uno-i1-GGUF

## Resumen

BetterWright-K2-Horizon-7B-Uno-i1-GGUF es una coleccion de cuantizaciones GGUF generada por mradermacher a partir del modelo ProCreations/BetterWright-K2-Horizon-7B-Uno. El modelo base esta especializado en tareas de agente de navegador (browser-agent) y agente web, con enfasis en tool use y function calling, y fue afinado por completo (full-finetune) sobre el dataset ProCreations/betterwright-agent-traces. Cuenta con aproximadamente 8.999 millones de parametros (cerca de 9B) y licencia Apache 2.0.

La relevancia de esta publicacion es practica: el autor original distribuye los pesos en formato HuggingFace, mientras que esta variante los ofrece en GGUF con una matriz de importancia (imatrix) y un amplio abanico de niveles de cuantizacion, desde 2,6 GB (IQ1_S) hasta 7,5 GB (Q6_K). Esto permite ejecutar un modelo de ~9B orientado a agentes web en hardware de consumo mediante llama.cpp y derivados, algo que con pesos completos en FP16 seria inviable en GPUs de gama media.

Las etiquetas del repositorio incluyen "diffusion-language-model" y "uno", lo que sugiere que el modelo base podria emplear un esquema de generacion no autoregresivo o hibrido, aunque la informacion disponible no detalla la arquitectura interna, la longitud de contexto ni la composicion exacta del dataset de entrenamiento. Los detalles no confirmados se marcan como no disponibles a lo largo de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del repo indican "diffusion-language-model" y modelo base "K2-Horizon-Uno"; sin confirmacion tecnica en la informacion proporcionada) |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, ademas de fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/weighted con imatrix); el modelo base se distribuye en formato HuggingFace/safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no documenta la arquitectura interna del modelo base: no se detallan la profundidad, el tipo de atencion, la longitud de contexto ni el esquema de generacion. Las etiquetas del repositorio incluyen "diffusion-language-model", "uno" y "k2-horizon", lo que apunta a una posible formulacion de modelo de difusion para lenguaje, pero no hay confirmacion tecnica en los datos disponibles. El modelo base fue sometido a un ajuste completo (full-finetune) sobre el dataset ProCreations/betterwright-agent-traces, orientado a trazas de agente de navegador y uso de herramientas.

Respecto al entrenamiento, la unica informacion disponible es el identificador del dataset (betterwright-agent-traces) y la etiqueta full-finetune. No se especifican el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Esta variante concreta es una cuantizacion: mradermacher aplica cuantizacion con fichero imatrix (version 2, output_tensor_quantised) para producir los distintos niveles GGUF a partir del modelo base.

## Capacidades

- Generacion de texto conversacional, ya que el repositorio se etiqueta como "conversational".
- Uso de herramientas y function calling: las etiquetas "tool-use" y "function-calling" indican soporte explicito para invocar funciones externas.
- Comportamiento como agente de navegador y agente web ("browser-agent", "web-agent"), orientado a interaccion con paginas y automatizacion de tareas web.
- Ajuste especifico sobre trazas de agente (dataset betterwright-agent-traces), lo que sugiere entrenamiento con ejemplos de flujos multi-paso.
- Capacidades multilingues: limitadas al ingles segun el campo language ("en").
- Capacidades de razonamiento general, codigo o matematicas: no disponibles en la informacion proporcionada.
- Capacidades especiales como thinking mode, vision o audio: no disponibles.

## Casos de uso

- Automatizacion de navegacion web: el modelo, entrenado sobre trazas de browser-agent, puede generar acciones (clics, relleno de formularios, extraccion de contenido) en flujos de automatizacion de paginas, integrándose en un orquestador que ejecute las llamadas resultantes.
- Agentes de investigacion web: dado su enfoque en web-agent y tool use, encaja en pipelines que consultan varias fuentes, navegan enlaces y consolidan resultados mediante llamadas a herramientas de busqueda o scraping.
- Ejecucion local en hardware de consumo: al distribuirse en GGUF, puede desplegarse con llama.cpp u Ollama en equipos sin GPU dedicada o con GPU de gama media, util para prototipado de agentes sin coste de API.
- Asistente de automatizacion de tareas repetitivas en navegador (RPA asistido): extraccion de datos de portales, monitorizacion de precios o generacion de informes a partir de paginas, apoyandose en function calling para registrar resultados.
- Integracion en entornos ofimaticos o de escritorio con modelos cuantizados: uso de la variante Q4_K_M (5,7 GB) para asistentes locales con footprint reducido en VRAM.
- Pruebas de concepto de agentes autonomos multi-paso: como punto de partida para evaluar estrategias de planificacion y ejecucion de herramientas antes de escalar a modelos mayores.
- Base para fine-tuning posterior: al ser Apache 2.0 y formato GGUF, sirve como referencia reproducible de comportamiento de agente para comparaciones o destilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K, ni evaluaciones especificas de agentes web, y tampoco se aportan datos del modelo base.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero GGUF):
  - IQ1_S: 2,6 GB
  - IQ2_M: 3,6 GB
  - Q2_K: 3,9 GB
  - IQ3_M: 4,5 GB
  - Q4_K_S: 5,5 GB
  - Q4_K_M: 5,7 GB (recomendado por el autor, "fast")
  - Q5_K_M: 6,6 GB
  - Q6_K: 7,5 GB
- Para FP16 el modelo original requeriria aproximadamente 18 GB (9B parametros x 2 bytes), no disponible en esta variante.
- GPUs recomendadas: no especificadas por el autor. Por tamano, las variantes Q4 pueden ejecutarse en GPUs consumer con 8 GB de VRAM (RTX 3060/4060 y superiores) empleando offload parcial o completo en funcion de la ventana de contexto. Las variantes Q5/Q6 encajan en GPUs de 8-12 GB, o en A100/H100 para despliegues en servidor.
- Caben en consumer GPU: si, en las cuantizaciones Q2 a Q4 principalmente; las variantes Q5 y Q6 requieren al menos 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Tambien puede usarse el modelo base con transformers/vLLM/TGI si se dispone del formato HuggingFace original.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos de benchmarks ni especificaciones de modelos comparables en la informacion proporcionada. La tabla siguiente recoge unicamente lo verificable a partir del repositorio; el resto se marca como no disponible.

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| BetterWright-K2-Horizon-7B-Uno-i1-GGUF (este) | ~9B | no disponible | GGUF (multitud de cuantizaciones) | apache-2.0 | Agente de navegador / tool use |
| ProCreations/BetterWright-K2-Horizon-7B-Uno (base) | ~9B | no disponible | HuggingFace/safetensors | apache-2.0 | Agente de navegador / tool use |
| mradermacher/BetterWright-K2-Horizon-7B-Uno-GGUF (quants estaticos) | ~9B | no disponible | GGUF | apache-2.0 | Agente de navegador / tool use |
| Otros modelos de agente web de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el modelo esta etiquetado unicamente para ingles ("en"); el rendimiento en castellano u otros idiomas no esta garantizado.
- La informacion disponible no documenta sesgos conocidos del modelo base ni del proceso de cuantizacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se ha publicado evaluacion especifica de fidelidad.
- Las cuantizaciones de baja precision (IQ1_S, IQ1_M, IQ2_*) degradan la calidad; el propio autor califica IQ1_S como "for the desperate" y Q2_K_S como "very low quality".
- La etiqueta "diffusion-language-model" sugiere un esquema de generacion no convencional; esto puede implicar incompatibilidades o comportamientos distintos en runtimes de inferencia estandar, aunque no se ha confirmado.
- Longitud de contexto desconocida: limita la planificacion de despliegues con conversaciones o documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de entrenamiento.
- El repositorio registra un numero muy bajo de descargas (3) y 0 likes en el momento del analisis, lo que reduce la evidencia empirica de terceros sobre su comportamiento en produccion.

## Enlaces

- Repositorio HuggingFace (esta cuantizacion): https://huggingface.co/mradermacher/BetterWright-K2-Horizon-7B-Uno-i1-GGUF
- Modelo base: https://huggingface.co/ProCreations/BetterWright-K2-Horizon-7B-Uno
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/BetterWright-K2-Horizon-7B-Uno-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ProCreations/betterwright-agent-traces
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#BetterWright-K2-Horizon-7B-Uno-i1-GGUF
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
