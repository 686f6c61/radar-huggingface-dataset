# emperorofrome/Qwen3.5-4B-GMCE

## Resumen

Qwen3.5-4B-GMCE es un ajuste fino del modelo base Qwen/Qwen3.5-4B publicado por el usuario emperorofrome en HuggingFace. Se trata de un LoRA de rango muy bajo (r=8) entrenado con la receta que el autor denomina GMCoder efficiency, cuyo objetivo no es mejorar la capacidad de razonamiento del modelo, sino reducir de forma drastica la verbosidad: ensenar al modelo a responder de forma directa y concisa en lugar de encadenar decenas de miles de tokens de "pensamiento" antes de dar una respuesta.

El problema que aborda es concreto y medible: el modelo base, en pruebas de codigo y razonamiento con un limite de 40k a 60k tokens, agotaba el presupuesto en 2 de 3 examenes sin llegar a entregar una respuesta. Tras el ajuste, el modelo completo los tres examenes consumiendo 21,6k tokens en total frente a los 109k+ del base. En una prueba de codigo separada, la media de tokens por respuesta cayo un 49% (de 2.915 a 1.479) y el porcentaje de respuestas que agotaban el limite paso del 19% al 0%, manteniendo el mismo porcentaje de tareas superadas (45%).

El modelo tiene 4.326.350.848 parametros (~4,3 B) y se distribuye unicamente en formato GGUF Q8_0 (4,6 GB de repositorio), fusionado sobre los pesos BF16 originales. La relevancia practica esta en el coste de inferencia: un modelo de 4B que responde en la mitad de tokens es adecuado para despliegues con presupuesto ajustado o en hardware de consumo, aunque su calidad absoluta como programador es modesta (en torno al 51% en los examenes propios del autor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; hereda la del modelo base Qwen/Qwen3.5-4B |
| Parametros totales | 4.326.350.848 (~4,3 B) |
| Parametros activos | No aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 en GGUF; el adaptador se entreno con QLoRA NF4 de doble cuantizacion y se fusiono en los pesos BF16 del base |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0); no se indica publicacion en safetensors |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base Qwen/Qwen3.5-4B (tipo de transformer, atencion, tokenizador). Lo que si se documenta es el proceso de ajuste: un QLoRA con cuantizacion NF4 de doble cuantizacion, rango 8, alpha 8, tasa de aprendizaje 5e-5, tamano de lote 1, 16 epocas y funcion de perdida aplicada solo sobre la completion (completion-only loss). El conjunto de entrenamiento son 531 ejemplos cortos renderizados en formato "thinking-off", es decir, pares instruccion-respuesta sin traza de razonamiento intermedia. El adaptador resultante se fusiono sobre los pesos BF16 originales (no sobre los cuantizados) y el resultado se publico como GGUF Q8_0. Es la misma receta aplicada al modelo GMCoder 9B del mismo autor.

La innovacion es, por tanto, de eficiencia y no de arquitectura: no hay decodificacion especulativa, atencion lineal ni cambios estructurales, sino un sesgo inducido por datos hacia respuestas cortas y directas. El autor advierte que el efecto es dependiente del tamano: la receta redujo mucho la longitud en este 4B, pero aporto poco en los Qwen3.5 de 0,8B y 2B y en Nanbeige.

## Capacidades

- Generacion de texto conversacional y respuestas directas en formato sin modo pensamiento (thinking-off), que es el formato con el que se entreno.
- Razonamiento y resolucion de problemas de codigo en Python: completa tareas con tests ocultos, aunque con una tasa de exito moderada (45% en la prueba del autor).
- Explicacion de codigo: la prueba del autor incluye tres prompts de tipo "explain" ademas de las diez tareas de Python.
- Reduccion drastica de la longitud de salida: -49% de tokens medios por respuesta en la prueba de codigo, y 0% de respuestas que agotan el limite de 8k (frente al 19% del base).
- Capacidad de terminar tareas dentro de un presupuesto de tokens: el base no respondio en 2 de 3 examenes largos por agotar el limite; este modelo los completo todos.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el entrenamiento esta orientado precisamente a evitar cadenas de razonamiento largas.
- Capacidades multilingues: no disponibles.
- Vision o audio: no disponibles.

## Casos de uso

- Autocompletado y asistencia de codigo en IDE: el modelo responde en aproximadamente la mitad de tokens que el base, lo que reduce la latencia percibida y el coste por sugerencia en entornos interactivos donde el usuario espera respuesta en segundos.
- Pipelines de CI/CD con presupuesto de tokens: al no agotar los limites de salida (0% de respuestas truncadas frente al 19% del base en la prueba de 8k), encaja en tareas automatizadas de revision o generacion de parches donde un truncamiento silencioso rompe el pipeline.
- Generacion de parches y correcciones sobre tests ocultos: con un 45% de tareas superadas en la prueba del autor, es util como primer filtro en un flujo de generacion de candidatos que luego valida un modelo mayor o la propia suite de tests.
- Explicacion de fragmentos de codigo y documentacion tecnica: el formato thinking-off produce descripciones concisas, adecuadas para comentarios de PR o documentacion generada automaticamente donde no se quiere un razonamiento extenso.
- Despliegue local en portatil o estacion de trabajo sin GPU dedicada: con 4,6 GB en Q8_0 y formato GGUF, puede ejecutarse en CPU con llama.cpp u Ollama manteniendo tiempos de respuesta razonables gracias a la menor verbosidad.
- Prototipado rapido de agentes con muchas llamadas encadenadas: en flujos donde cada paso consume tokens, la reduccion del 49% en longitud de salida se traduce directamente en menor coste y menor latencia acumulada, siempre que las tareas no exijan razonamiento profundo.
- Clasificacion y extraccion de informacion sobre texto tecnico: respuestas cortas y deterministas en formato, apropiadas para tareas de extraccion estructurada donde el razonamiento extendido solo anade coste.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor en la model card. Son evaluaciones propias, con una sola ejecucion por modelo y un unico evaluador ciego a la identidad del modelo; el propio autor advierte que diferencias de pocos puntos son ruido y que no deben leerse como resultados de leaderboard.

Examenes de codigo y razonamiento "Form B" no vistos (3 examenes, 275 puntos, limite de 40k-60k tokens):

| Modelo | Tokens consumidos (3 examenes) | Resultado |
|---|---:|---|
| Qwen3.5-4B base | 109k+ | No produjo respuesta en 2 de 3 examenes (agoto el limite mientras seguia pensando) |
| Qwen3.5-4B-GMCE | 21,6k | Completo los tres examenes; ~141 / 275 (~51%) |

Prueba rapida de codigo (10 tareas Python con tests ocultos + 3 prompts de explicacion, limite de 8k tokens):

| Metrica | Qwen3.5-4B base | Qwen3.5-4B-GMCE |
|---|---:|---:|
| Tokens medios por respuesta | 2.915 | 1.479 (-49%) |
| Respuestas que agotan el limite | 19% | 0% |
| Tareas superadas | 45% | 45% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,5-6,5 GB con el fichero Q8_0 (4,6 GB) mas cache KV; la cifra exacta depende de la longitud de contexto, que no se especifica.
- Memoria en CPU: ~4,6 GB de RAM para los pesos mas overhead del runtime; viable en equipos de 8 GB.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 (8 GB o mas de VRAM cubren el Q8_0 con contexto moderado). No cabe en GPUs de 4 GB.
- GPU de datacenter: L4 (24 GB), A10G (24 GB) o A100/H100 son sobredimensionadas para 4,3 B parametros; solo tendrian sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python son las rutas directas al existir solo GGUF. vLLM y TGI no son viables sin una publicacion en safetensors, que no se indica en la informacion disponible.
- Latencia y throughput: no disponibles como cifras absolutas. Como referencia indirecta, el modelo genera un 49% menos de tokens por respuesta en la prueba de codigo del autor, lo que reduce proporcionalmente el tiempo de decodificacion y el coste por peticion frente al base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Form B propio) | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Qwen3.5-4B-GMCE | ~4,3 B | no disponible | ~141/275 (~51%), 21,6k tokens en 3 examenes | Apache-2.0 | GGUF Q8_0 en HuggingFace |
| Qwen3.5-4B (base) | ~4,3 B | no disponible | Sin respuesta en 2 de 3 examenes; 109k+ tokens consumidos | no disponible en la informacion | Modelo base en HuggingFace (Qwen/Qwen3.5-4B) |
| GMCoder 9B | ~9 B (deducido de la denominacion) | no disponible | ~76% en Form B segun el autor | no disponible en la informacion | no disponible en la informacion |
| Qwen3.5-0.8B / 2B (misma receta) | 0,8 B / 2 B | no disponible | La receta "ayudo poco" segun el autor; sin cifras | no disponible en la informacion | no disponible en la informacion |

La comparacion relevante no es de calidad bruta sino de coste por respuesta: frente al base de 4,3 B, este ajuste completa en ~21,6k tokens lo que el base no logra completar en 109k+, a costa de una calidad absoluta limitada (~51%). Frente a GMCoder 9B pierde unos 25 puntos porcentuales de acierto, pero requiere menos de la mitad de memoria.

## Limitaciones y advertencias

- Calidad absoluta limitada: el propio autor lo describe como "no un programador fuerte en terminos absolutos", con ~51% en sus examenes frente al 76% de GMCoder 9B.
- Base de evaluacion muy debil: 3 examenes y 13 tareas, una sola ejecucion por modelo, un unico evaluador y benchmarks propios no comparables con leaderboards.
- Rendimiento plano en la prueba corta de codigo: 45% de tareas superadas tanto en el base como en el ajustado, es decir, la reduccion de tokens no vino acompanada de mejora en acierto.
- Especializacion en formato thinking-off: los 531 ejemplos de entrenamiento estan renderizados sin traza de razonamiento; forzar modo pensamiento podria degradar el comportamiento esperado.
- Generalizacion limitada de la receta: el autor indica que en Qwen3.5-0,8B, Qwen3.5-2B y Nanbeige el mismo procedimiento aporto poco, lo que sugiere que el efecto no es transferible sin revalidacion.
- Idiomas soportados no documentados: no hay garantia de calidad fuera de los idiomas del modelo base ni evaluaciones multilingues.
- Riesgo de alucinacion: no se documenta ningun proceso de RLHF, DPO o verificacion factual; el ajuste es un QLoRA supervisado sobre 531 ejemplos cortos, por lo que la fidelidad factual depende enteramente del base y de los datos de codigo.
- Sesgos: no se han publicado analisis de sesgo en la informacion disponible.
- Trazabilidad y madurez: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad; el modelo base y el ajuste estan fechados en 2026-10-18.
- Licencia: Apache-2.0 en el repositorio, lo que en principio permite uso comercial, pero no se detalla la licencia del modelo base Qwen/Qwen3.5-4B en la informacion proporcionada; conviene verificarla antes de un despliegue en produccion.
- Formato unico: solo se publica GGUF Q8_0, sin safetensors ni otras cuantizaciones (Q4_K_M, Q5_K_M), lo que limita el ajuste fino de memoria y descarta servidores de alto rendimiento como vLLM o TGI.
- Longitud de contexto no especificada: no se puede planificar el consumo de cache KV ni el rendimiento en conversaciones largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emperorofrome/Qwen3.5-4B-GMCE
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo del autor: no disponibles en la informacion proporcionada.
