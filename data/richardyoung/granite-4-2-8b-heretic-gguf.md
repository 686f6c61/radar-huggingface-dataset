# richardyoung/granite-4.2-8b-heretic-GGUF

## Resumen

richardyoung/granite-4.2-8b-heretic-GGUF es un repositorio de cuantizaciones GGUF del modelo richardyoung/granite-4.2-8b-heretic, que a su vez es una "abliteración" del IBM Granite 4.2 8B realizada con la herramienta Heretic (p-e-w/heretic). La abliteración modifica los pesos para eliminar la dirección de activación asociada al rechazo de peticiones, de forma que el modelo apenas se niega a responder. Este repositorio no entrena nada nuevo: empaqueta el modelo ya abliterado en cuatro niveles de cuantización compatibles con llama.cpp y Ollama.

El modelo subyacente pertenece a la familia Granite 4.2 de IBM, compuesta por arquitecturas densas decoder-only de 3B, 8B y 30B, post-entrenadas sobre los modelos base Granite 4.1. Incluye razonamiento con cadena de pensamiento integrada, modos de pensamiento configurables y tool calling aumentado con razonamiento. El modelo cuenta con 8.791.592.960 parámetros y, según LLM Explorer, una ventana de contexto de 128K para la variante heretic.

Su relevancia práctica es doble: por un lado, ofrece un Granite 4.2 8B ejecutable en hardware de consumo gracias a las cuantizaciones de 4 a 8 bits; por otro, está dirigido a quienes necesitan un modelo sin capas de rechazo por motivos de investigación, evaluación de seguridad o generación de contenido sin filtros. La evaluación de Heretic reporta una divergencia KL de 0,0801 respecto al modelo original y 12 rechazos de cada 100 peticiones de prueba.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia IBM Granite 4.2, post-entrenado sobre Granite 4.1) |
| Parametros totales | 8.791.592.960 (8,79B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K segun LLM Explorer para la variante heretic; no confirmado en la ficha del repositorio GGUF |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible en la informacion proporcionada (IBM declara soporte multilingue para Granite 4.2, sin listado concreto) |
| Licencia | No declarada en la ficha del repositorio GGUF; el modelo base IBM Granite 4.2 8B se publica bajo Apache 2.0 |
| Formato de pesos | GGUF (este repositorio, para llama.cpp/Ollama); safetensors en el modelo base completo richardyoung/granite-4.2-8b-heretic |
| Tamano del repositorio | 28,2 GB en total |
| Herramienta de abliteracion | Heretic (p-e-w/heretic) |

Tamanos aproximados por archivo, estimados a partir del tamano total del repositorio (28,2 GB) y coherentes con los cuatro ficheros publicados:

| Archivo | Cuantizacion | Tamano aproximado |
|---|---|---|
| `granite-4.2-8b-heretic-Q4_K_M.gguf` | Q4_K_M | ~5,4 GB |
| `granite-4.2-8b-heretic-Q5_K_M.gguf` | Q5_K_M | ~6,1 GB |
| `granite-4.2-8b-heretic-Q6_K.gguf` | Q6_K | ~7,2 GB |
| `granite-4.2-8b-heretic-Q8_0.gguf` | Q8_0 | ~9,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la de IBM Granite 4.2 en su variante de 8B: un transformer denso decoder-only, sin mezcla de expertos, post-entrenado sobre un modelo base Granite 4.1. IBM describe la familia Granite 4.2 como orientada a razonamiento, con cadena de pensamiento integrada, modos de pensamiento flexibles y tool calling aumentado con razonamiento. Los detalles de preentrenamiento (numero de tokens, composicion del dataset, fases de RLHF/DPO) no estan disponibles en la informacion proporcionada y corresponden a la documentacion de Granite 4.1 y Granite 4.2 de IBM.

La innovacion especifica de esta publicacion es la abliteracion mediante Heretic. Este proceso identifica y elimina la direccion del espacio de activaciones responsable del comportamiento de rechazo, optimizando la intervencion para minimizar el dano colateral al resto de capacidades. La evaluacion incluida en la model card reporta una divergencia KL de 0,0801 respecto al modelo original (cuanto menor, mas se preserva la distribucion de salida original) y una tasa de rechazo de 12 sobre 100 peticiones. El repositorio GGUF no anade entrenamiento adicional: solo aplica cuantizacion post-entrenamiento sobre el modelo abliterado en precision completa.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Granite 4.2 8B.
- Razonamiento con cadena de pensamiento integrada (built-in chain-of-thought) y modos de pensamiento configurables, segun la documentacion de IBM para la familia Granite 4.2.
- Tool calling y function calling, descrito por IBM como "reasoning-augmented tool calling".
- Capacidades de codigo y matematicas propias de un modelo de 8B post-entrenado de la familia Granite; no se aportan cifras concretas en la informacion disponible.
- Soporte multilingue declarado por IBM para Granite 4.2, aunque el listado concreto de idiomas no esta disponible en la informacion proporcionada.
- Comportamiento sin capas de rechazo: el proceso de abliteracion reduce las negativas a responder a 12 de cada 100 peticiones de evaluacion.
- Compatibilidad directa con el ecosistema llama.cpp y Ollama mediante los ficheros GGUF publicados.
- Capacidades de vision o audio: no disponibles (el modelo es exclusivamente de lenguaje).
- Capacidades de agente multi-paso: no confirmadas explicitamente para esta variante en la informacion disponible.

## Casos de uso

- Evaluacion de seguridad y red-teaming: la variante heretic sirve como sujeto de prueba para medir la eficacia de las capas de alineamiento de IBM, comparando sus respuestas con las del Granite 4.2 8B oficial sobre el mismo conjunto de prompts.
- Investigacion sobre abliteracion: con una divergencia KL documentada de 0,0801, permite estudiar cuanto degrade la intervencion las capacidades generales del modelo cuando se elimina la direccion de rechazo.
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o narrativa que aborde temas que un modelo alineado rechazaria por defecto, ejecutandose en local.
- Asistente conversacional local en hardware de consumo: la cuantizacion Q4_K_M (~5,4 GB) permite desplegar un modelo de 8,79B en una GPU con 8-12 GB de VRAM mediante Ollama o llama.cpp, con la ventana de contexto larga del modelo base.
- Procesamiento de documentos extensos en local: si se confirma la ventana de 128K tokens, permite resumir o extraer informacion de contratos, informes o transcripciones largas sin enviar datos a servicios externos.
- Investigacion academica sobre alineamiento: uso como linea base "no alineada" para comparar distribuciones de salida frente al modelo original, cuantificando el efecto de la intervencion en las activaciones.
- Desarrollo y depuracion de pipelines de inferencia GGUF: validacion de compatibilidad de cuantizaciones K-quant con llama.cpp, Ollama o LM Studio antes de desplegar variantes alineadas del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion aportada es la de la herramienta Heretic:

| Metrica (evaluacion Heretic) | Valor |
|---|---|
| Divergencia KL respecto al modelo original | 0,0801 |
| Rechazos | 12/100 |

No se dispone de datos de throughput ni de latencia para las cuantizaciones publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: ~5,4 GB (Q4_K_M), ~6,1 GB (Q5_K_M), ~7,2 GB (Q6_K) y ~9,4 GB (Q8_0). A estas cifras hay que sumar la cache KV, que crece de forma lineal con la longitud de contexto utilizada.
- Precision completa (bf16): LLM Explorer indica 17,6 GB de VRAM para la variante heretic a 128K de contexto.
- GPU de consumo: la cuantizacion Q4_K_M cabe en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) con contexto moderado; Q5_K_M y Q6_K encajan comodamente en 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4060 Ti 16 GB, RTX 4080). Q8_0 requiere 12 GB o mas.
- GPU de datacenter: A100 40/80 GB, H100 o L40S permiten ejecutar la precision completa con contexto largo y lotes grandes; para las cuantizaciones GGUF son sobredimensionadas salvo en despliegues con muchas peticiones concurrentes.
- Despliegue en CPU: viable con llama.cpp u Ollama usando la cuantizacion Q4_K_M; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run richardyoung/granite-4.2-8b-heretic`, etiqueta por defecto Q4_K_M), LM Studio, koboldcpp y otras interfaces basadas en llama.cpp. El soporte de GGUF en vLLM es limitado y no esta confirmado para esta arquitectura.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- No cabe en GPUs integradas ni en aceleradores con menos de 8 GB de memoria si se quiere mantener un contexto util.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Alineamiento | Formato |
|---|---|---|---|---|---|
| richardyoung/granite-4.2-8b-heretic-GGUF (este modelo) | 8,79B | 128K segun LLM Explorer (no confirmado) | No declarada en la ficha; base Apache 2.0 | Abliterado (12/100 rechazos) | GGUF Q4_K_M a Q8_0 |
| richardyoung/granite-4.2-8b-heretic | 8,79B | No disponible | No disponible | Abliterado | safetensors |
| ibm-granite/granite-4.2-8b (oficial) | 8,79B | No disponible en la informacion recogida | Apache 2.0 | Alineado | safetensors y GGUF (repo oficial ibm-granite/granite-4.2-8b-GGUF) |
| richardyoung/granite-4.2-3b-heretic-GGUF | No disponible | No disponible | No disponible | Abliterado | GGUF |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato, licencia y estado de alineamiento. Existen otras familias densas de tamano similar (por ejemplo Llama 3.1 8B o Qwen3 8B) que serian alternativas naturales de categoria, pero no se aportan datos de ellas en la informacion recogida.

## Limitaciones y advertencias

- La abliteracion elimina deliberadamente el comportamiento de rechazo. El modelo puede generar contenido ofensivo, ilegal, peligroso o sexual sin filtros; no es apto para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- La evaluacion declara 12 rechazos de cada 100 peticiones, lo que implica que en el 88 % restante el modelo responde sin objeciones. No hay desglose de que tipo de prompts componian ese conjunto de prueba.
- La divergencia KL de 0,0801 respecto al original implica una degradacion medible de la distribucion de salida. No se han publicado evaluaciones que cuantifiquen cuanto afecta eso a tareas concretas como codigo, matematicas o recuperacion de conocimiento.
- Riesgo de alucinacion: no se han publicado datos de fidelidad factual ni de calibracion para esta variante.
- La ficha del repositorio GGUF no declara licencia. Aunque el modelo base IBM Granite 4.2 8B se publica bajo Apache 2.0 (lo que en principio permitiria uso comercial), la ausencia de una declaracion explicita en este repositorio es un riesgo legal que conviene resolver antes de un despliegue en produccion.
- La lista de idiomas soportados no esta disponible; el rendimiento fuera del ingles no esta documentado para esta variante.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre la calidad de las cuantizaciones publicadas.
- La fecha de creacion y actualizacion del repositorio es muy reciente (28 de septiembre de 2026), sin historial de mantenimiento posterior.
- La ventana de contexto de 128K proviene de una fuente secundaria (LLM Explorer) y no esta confirmada en la ficha oficial del repositorio; conviene verificarla antes de disenar aplicaciones que dependan de contextos muy largos.
- Uso responsable: tratandose de un modelo sin alineamiento, su utilizacion deberia limitarse a entornos de investigacion, evaluacion o generacion de contenido con supervision humana y cumplimiento de la normativa aplicable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/granite-4.2-8b-heretic-GGUF
- Modelo base abliterado: https://huggingface.co/richardyoung/granite-4.2-8b-heretic
- Informacion de reproducibilidad: https://huggingface.co/richardyoung/granite-4.2-8b-heretic/tree/main/reproduce
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-4.2-8b
- GGUF oficial de IBM: https://huggingface.co/ibm-granite/granite-4.2-8b-GGUF
- Documentacion de Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio de la familia Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Variante de 3B abliterada: https://huggingface.co/richardyoung/granite-4.2-3b-heretic-GGUF
- Ficha en LLM Explorer: https://llm-explorer.com/model/Dingdust%2Fgranite-4.2-8b-heretic,5dXCziy23LzWACUoM3hYY1
