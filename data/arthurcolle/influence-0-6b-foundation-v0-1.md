# arthurcolle/Influence-0.6B-Foundation-v0.1

## Resumen

Influence-0.6B-Foundation-v0.1 es un checkpoint experimental de 596.049.920 parametros (0,6B) publicado por el usuario arthurcolle el 14 de octubre de 2026. Se trata de un ajuste supervisado (SFT) mediante LoRA sobre el modelo denso Qwen/Qwen3-0.6B, revisión `c1899de289a04d12100db370d81485cdf75e47ca`, orientado al trabajo conversacional que el autor denomina "Influence". El repositorio ocupa 1,2 GB y contiene pesos fusionados en safetensors, compatibles con transformers y text-generation-inference.

El problema que aborda es acotado: mejorar el comportamiento conversacional y la seleccion de respuestas en formato de opcion multiple (A–E) de un modelo base muy pequeno. Segun la model card, el entrenamiento consistio en 400 actualizaciones LoRA de rango 16 sobre las proyecciones q/v/o, con 3.670.016 parametros entrenables, a partir de un pool de 16.961 registros publicos (GSM8K, CommonsenseQA y OpenAssistant/oasst1) expandidos a 17.664 fronteras de asistente.

Su relevancia es fundamentalmente metodologica: publica trazabilidad completa (linaje, recibos de entrenamiento, evaluacion y scripts de reproduccion) y cifras antes/despues sobre un protocolo fijo, algo poco habitual en checkpoints de este tamano. No obstante, se declara explicitamente experimental, con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks generales (MMLU, HumanEval o GSM8K) publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), ajustado con adaptadores LoRA |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | No aplica, modelo denso (no MoE); 3.670.016 parametros entrenables en LoRA de rango 16 sobre q/v/o |
| Longitud de contexto | No disponible en la model card del checkpoint; el modelo base Qwen3-0.6B declara 32.768 tokens nativos (ampliables con YaRN), dato no confirmado para este ajuste |
| Tipos de cuantizacion | No disponible; no se publican cuantizaciones. El repo (1,2 GB) es coherente con pesos en bf16/fp16 |
| Idiomas soportados | No disponible; no se declaran idiomas. Los datasets de entrenamiento (GSM8K, CommonsenseQA, oasst1) son mayoritariamente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); la model card indica que se recargaron los pesos fusionados completos para la evaluacion |
| Tamano del repositorio | 1,2 GB |
| Modelo base | Qwen/Qwen3-0.6B, revision c1899de289a04d12100db370d81485cdf75e47ca |
| Fecha de publicacion | 14 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B: un transformer decoder-only denso con atencion causal, sin mezcla de expertos ni componentes de estado recurrente. Sobre esa base se aplico un ajuste supervisado con LoRA de rango 16 en las proyecciones de query, value y output, con 3.670.016 parametros entrenables y un total de 400 actualizaciones. No se menciona en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT.

Los datos proceden de tres fuentes publicas: OpenAI GSM8K (licencia MIT), tau/commonsense_qa (declaracion MIT) y OpenAssistant/oasst1 (Apache 2.0). El pool final consta de 16.961 registros publicos expandidos a 17.664 fronteras de asistente. La seleccion del checkpoint se hizo por perdida de validacion, y los conjuntos held-out no participaron en dicha seleccion, lo que reduce el sesgo de seleccion aunque no lo elimina. La model card indica que los ficheros de origen se verificaron contra revisiones y hashes fijados, que no se usaron registros personales locales y que se excluyen los ficheros de dataset, los libros de linaje privados y la arquitectura privada del proyecto. Entre los artefactos publicados figuran `training-lineage.json`, `training-receipt.json`, `evaluation.json` y el directorio `reproduce/`. No se documenta ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto autoregresiva, con pipeline declarado `text-generation` y libreria transformers.
- Conversacion multi-turno: los tags del repositorio incluyen `multi-turn` y `conversational`, aunque no se publica ninguna evaluacion de calidad conversacional mas alla de la NLL sobre tokens de asistente.
- Respuesta a preguntas de sentido comun en formato de opcion multiple (A–E): es la unica capacidad con evaluacion cuantitativa publicada, mediante seleccion del logit mas alto entre A y E tras un prefijo de chat identico.
- Razonamiento matematico: GSM8K forma parte del pool de entrenamiento, pero no se publican resultados sobre ese benchmark, por lo que no puede afirmarse una capacidad aritmetica medida.
- Tool calling y function calling: no disponible; la model card no menciona soporte de herramientas ni de llamadas a funciones.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Modo thinking: no documentado para este checkpoint. La evaluacion emplea un prefijo de chat "nonthinking" heredado de Qwen3, lo que sugiere compatibilidad con la plantilla de chat del modelo base, pero no hay confirmacion de soporte de modo pensamiento.
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.
- Vision y audio: no soportados; el modelo es exclusivamente de texto.

## Casos de uso

- Reproduccion de experimentos de ajuste con LoRA: el repositorio incluye `training-lineage.json`, `training-receipt.json`, `evaluation.json` y el directorio `reproduce/`, lo que permite replicar las 400 actualizaciones sobre Qwen3-0.6B y comparar la perdida de validacion frente al checkpoint publicado.
- Evaluacion de protocolos de respuesta en opcion multiple: el checkpoint esta optimizado y medido con un protocolo concreto de seleccion del logit A–E tras prefijo fijo, por lo que encaja en bancos de preguntas de sentido comun con ese mismo formato y permite medir ganancias (78 mejoras pareadas frente a 16 regresiones en el conjunto held-out).
- Investigacion sobre calibracion y verosimilitud de tokens de asistente: la NLL sobre fronteras de asistente baja de 1,794 a 0,844, lo que lo hace util como caso de estudio de como el SFT modifica la distribucion de probabilidad en los turnos de respuesta.
- Despliegue de asistentes conversacionales de bajo coste en local o en el borde: con menos de 2 GB de pesos en bf16, el modelo puede ejecutarse en portatiles, mini-PC o incluso en CPU para tareas de FAQ o clasificacion de intenciones donde no se requiera razonamiento profundo.
- Generacion de datos sinteticos a gran escala: al ser un modelo de 0,6B con licencia Apache 2.0, es viable generar volumenes altos de texto con presupuesto reducido para destilacion o aumento de datos, siempre con revision humana posterior.
- Docencia y formacion en tecnicas de ajuste eficiente: sirve como ejemplo completo y trazable de un pipeline SFT + LoRA con verificacion de hashes de los ficheros de origen, adecuado para practicas de posgrado o talleres tecnicos.
- Punto de partida para ajustes posteriores: la receta y el checkpoint permiten continuar el entrenamiento con datos propios en dominios concretos, con un coste de adaptacion muy bajo dado el tamano de 0,6B.
- Comparativas controladas de tecnicas de regularizacion o rangos LoRA: el checkpoint fija una linea base reproducible (rango 16, 400 pasos) sobre la que medir variantes.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la model card, medidos bajo un protocolo fijo y explicito. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones generales.

| Metrica | Protocolo | Qwen3-0.6B base | Influence-0.6B v0.1 |
|---|---|---|---|
| CommonsenseQA, exactitud de etiqueta (256 preguntas) | Seleccion del logit mas alto entre A–E tras el mismo prefijo de chat nonthinking | 32,4 % (83/256) | 56,6 % (145/256) |
| NLL de tokens de asistente (96 fronteras held-out) | Perdida sobre tokens de asistente en fronteras reservadas | 1,794 | 0,844 |
| MMLU | No disponible | No disponible | No disponible |
| HumanEval | No disponible | No disponible | No disponible |
| GSM8K | No disponible | No disponible | No disponible |

Notas del autor que acompanan a la tabla: se registraron 78 mejoras pareadas y 16 regresiones; el protocolo mide esa forma concreta de responder, no la capacidad general de razonamiento ni la capacidad de persuasion humana; se desconoce el solapamiento con los datos de preentrenamiento del modelo base. La suma de mejoras y regresiones (94) no coincide con las 96 fronteras declaradas, diferencia que la model card no explica.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, calculada a partir de los 596.049.920 parametros): aproximadamente 1,2 GB en bf16/fp16, unos 0,6 GB en int8 y unos 0,35 GB en int4. Son estimaciones teoricas, no medidas publicadas.
- VRAM total recomendada con cache KV y activaciones: por debajo de 3 GB en bf16 para lotes pequenos; menos de 1,5 GB en cuantizacion int4. La cache KV depende de la longitud de contexto efectiva, que no se ha publicado para este checkpoint.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, cualquier GPU con 4 GB o mas es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; en centro de datos, una unica A100, H100 o L40S esta sobradamente dimensionada y el modelo quedaria limitado por latencia de lanzamiento mas que por memoria.
- Inferencia en CPU: viable. Con 0,6B de parametros y pesos de 1,2 GB, la generacion en CPU es funcional para cargas de baja concurrencia.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`) y HF Inference Endpoints (tag `endpoints_compatible`). vLLM deberia ser compatible al heredar la arquitectura Qwen3, aunque no se confirma en la informacion disponible. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se publica en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultado en CommonsenseQA (mismo protocolo A–E) | Disponibilidad |
|---|---|---|---|---|---|
| Influence-0.6B-Foundation-v0.1 (arthurcolle) | 596 M, denso + LoRA rango 16 | No disponible | Apache 2.0 | 56,6 % (145/256) | Repositorio HF, 0 descargas |
| Qwen/Qwen3-0.6B (base) | 596 M, denso | 32.768 tokens nativos segun la documentacion de Qwen3 (no confirmado en esta ficha) | Apache 2.0 | 32,4 % (83/256) | Ampliamente distribuido |
| Qwen/Qwen3-0.6B-Instruct | No disponible en la informacion proporcionada | No disponible | Apache 2.0 | No disponible | Distribucion oficial Qwen |
| Otros modelos de 0,5B–1B (Llama-3.2-1B-Instruct, SmolLM2, etc.) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No evaluados en este protocolo |

La unica comparacion con datos verificables es contra el modelo base, que es precisamente el punto de referencia del autor. Cualquier comparacion con alternativas de la misma categoria queda fuera del alcance de la informacion disponible, ya que no se han ejecutado esos modelos bajo el mismo protocolo de seleccion de logits A–E.

## Limitaciones y advertencias

- Caracter experimental explicito: el propio autor etiqueta el checkpoint como `experimental` y lo describe como un "pequeno checkpoint fundacional" para un trabajo conversacional concreto, no como un modelo listo para produccion.
- Adopcion nula y sin mantenimiento: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia. No hay evidencia de validacion por terceros ni historial de versiones.
- Evaluacion muy estrecha: el unico resultado publicado mide la seleccion del logit mas alto entre A–E en 256 preguntas de CommonsenseQA y la NLL en 96 fronteras de asistente. El autor advierte que no mide razonamiento general ni persuasion humana. No hay MMLU, HumanEval, GSM8K ni evaluaciones humanas.
- Riesgo de contaminacion desconocido: la model card reconoce que se desconoce el solapamiento entre el pool de entrenamiento (GSM8K, CommonsenseQA, oasst1) y los datos de preentrenamiento de Qwen3-0.6B. La mejora medida en CommonsenseQA podria estar parcialmente inflada si el modelo base ya vio esos ejemplos.
- Tamano muy reducido: con 0,6B de parametros, la tasa de alucinacion en tareas factuales abiertas es alta y la capacidad de razonamiento multi-paso es limitada. No es adecuado para tareas que exijan precision factual sin verificacion externa.
- Idiomas no declarados: los datasets de entrenamiento son mayoritariamente en ingles, por lo que el rendimiento en castellano u otras lenguas no esta caracterizado y probablemente sea pobre.
- Sin soporte documentado de tool calling ni de agentes: no hay evidencia de que el modelo siga formatos de llamada a funciones, lo que descarta su uso en pipelines de herramientas sin validacion previa.
- Trazabilidad parcial: se excluyen de la publicacion los ficheros de dataset, los libros de linaje de fuentes privadas y la arquitectura privada del proyecto, lo que impide auditar completamente la composicion del conjunto de entrenamiento.
- Licencia y uso comercial: los pesos se publican bajo Apache 2.0, al igual que el modelo base Qwen3-0.6B, y las fuentes declaradas son permisivas (MIT para GSM8K y CommonsenseQA, Apache 2.0 para oasst1). No obstante, la model card no incluye una declaracion explicita sobre uso comercial del derivado ni garantias sobre la procedencia de cada registro individual, por lo que conviene revisar `training-lineage.json` antes de un despliegue comercial.
- Ausencia de cuantizaciones oficiales: no hay GGUF ni versiones cuantizadas publicadas, lo que obliga a convertir los pesos si se quiere desplegar con llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arthurcolle/Influence-0.6B-Foundation-v0.1
- Informe experimental en HTML: https://huggingface.co/arthurcolle/Influence-0.6B-Foundation-v0.1/resolve/main/report.html?download=true
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset OpenAI GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset CommonsenseQA: https://huggingface.co/datasets/tau/commonsense_qa
- Dataset OpenAssistant/oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Artefactos de trazabilidad citados en la model card: `training-lineage.json`, `training-receipt.json`, `evaluation.json` y directorio `reproduce/` del propio repositorio
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos corresponden a herramientas y articulos sin relacion con Influence-0.6B-Foundation-v0.1.
