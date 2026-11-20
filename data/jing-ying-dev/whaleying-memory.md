# jing-ying-dev/WhaleYing-Memory

## Resumen

WhaleYing Memory es un sistema de memoria estructurada a largo plazo para agentes de IA, desarrollado por jing-ying-dev y publicado bajo licencia Apache-2.0. No se trata de un modelo de lenguaje con pesos propios, sino de un pipeline de extraccion, consolidacion y recuperacion de informacion que convierte conversaciones y documentos largos en registros estructurados, gestiona explicitamente la supersesion de valores contradictorios y suministra evidencia actualizada a un LLM para responder preguntas. El paquete se distribuye como repositorio Python (3.10+) con un extractor, un motor de supersesion y folding, un recuperador hibrido y un contestador iterativo opcional.

Su relevancia actual reside en el problema de los hechos que cambian con el tiempo: los sistemas RAG convencionales recuperan fragmentos sin distinguir que version de un dato es la vigente, lo que degrada la precision en tareas de resolucion de conflictos y razonamiento multi-salto. WhaleYing aborda esto con cuatro tablas (`facts`, `cards`, `metrics`, `identities`), cadenas de supersesion con marca `invalidated_at` y recuperacion hibrida BM25 + embeddings `all-MiniLM-L6-v2` fusionados mediante reciprocal rank fusion (RRF).

En las evaluaciones publicadas con MemoryAgentBench alcanza un 93,2 % en FactConsolidation-SH a 262k de contexto (media de 5 ejecuciones con gpt-4o-mini como modelo de respuesta) y un 48,3 % en FactConsolidation-MH con DeepSeek, frente a un 5,3 % de lectura directa del contexto completo. El sistema esta pensado para despliegues local-first y separa extraccion de recuperacion, lo que permite arquitecturas orientadas a privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de memoria estructurada: extractor LLM, supersesion/folding, recuperador hibrido (BM25 + vectores con RRF), contestador iterativo Self-Ask |
| Parametros totales | no disponible (no es un modelo con pesos propios; usa LLMs externos como extractor y contestador) |
| Parametros activos | no aplica |
| Longitud de contexto | evaluado hasta 262k tokens de contexto de entrada; sin limite propio declarado |
| Tipos de cuantizacion | no disponible (el componente vectorial usa `all-MiniLM-L6-v2`; el LLM de respuesta es externo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (paquete Python; no distribuye pesos) |

## Arquitectura y entrenamiento

WhaleYing Memory no entrena un modelo base. Su arquitectura es un pipeline de cuatro etapas sobre un LLM externo. La primera es un extractor que, mediante un LLM, rellena cuatro tablas: `facts` para aserciones, `cards` para eventos, `metrics` para mediciones e `identities` para entidades. Aplica validacion determinista que exige que las citas extraidas sean subcadenas exactas del texto fuente, lo que limita la fabricacion de evidencia. La segunda etapa gestiona la supersesion: las versiones de un mismo sujeto forman una cadena, las antiguas reciben `invalidated_at` y el folding retiene la version mas reciente por secuencia.

La tercera etapa es un recuperador hibrido que combina BM25 multi-campo con busqueda vectorial sobre `all-MiniLM-L6-v2`, fusionando ambos rankings con reciprocal rank fusion. Los vectores de base de datos se cachean; el autor reporta una aceleracion de recuperacion de aproximadamente 1.340x en su prueba de cache. La cuarta etapa, opcional, es un contestador iterativo estilo Self-Ask que descompone preguntas multi-salto, recupera evidencia para cada subpregunta y ensambla la respuesta final a partir de la cadena de evidencia; se activa con `WHALE_YING_ITERATIVE=1`. La etapa de respuesta consume una API compatible con OpenAI; las evaluaciones usaron DeepSeek, gpt-4o-mini y un Qwen2.5-Coder 7B local.

## Capacidades

- Memoria a largo plazo estructurada para agentes, con separacion explicita entre hechos, eventos, metricas e identidades.
- Resolucion de conflictos: identifica versiones sucesivas de un mismo dato y conserva la vigente mediante supersesion y folding.
- Recuperacion hibrida: BM25 multi-campo combinado con busqueda vectorial y fusion RRF.
- Razonamiento multi-salto mediante iteracion Self-Ask opcional, con descomposicion en subpreguntas y recuperacion de evidencia por subpaso.
- Question answering sobre conversaciones y documentos largos con hechos actualizados o contradictorios.
- Validacion determinista de citas: las evidencias extraidas deben ser subcadenas del texto fuente.
- Cache de vectores en base de datos con aceleracion reportada de aproximadamente 1.340x.
- Integracion con cualquier LLM servido mediante API compatible con OpenAI (DeepSeek, gpt-4o-mini, modelos locales como Qwen2.5-Coder 7B).
- Capacidades multilingues: no disponibles.
- Soporte de tool calling, vision o audio: no disponible.

## Casos de uso

- Memoria de agente conversacional multi-sesion: el pipeline extrae hechos de cada turno y mantiene la version vigente cuando el usuario actualiza un dato (por ejemplo, un cambio de direccion), de modo que el agente responde con el valor actual sin arrastrar el antiguo.
- Atencion al cliente con historial de cambios: ante un cliente que ha modificado plan, direccion o datos de facturacion, el folding retiene el ultimo valor y el recuperador hibrido localiza la evidencia correcta entre conversaciones largas de hasta 262k tokens.
- Question answering sobre documentacion corporativa versionada: en manuales o politicas que se actualizan, la cadena de supersesion permite responder "cual es la politica vigente" sin que versiones obsoletas contaminen la respuesta.
- Razonamiento multi-salto sobre expedientes: con `WHALE_YING_ITERATIVE=1`, el sistema descompone preguntas que requieren encadenar varios hechos (por ejemplo, identificar a la persona responsable de un proyecto a partir de eventos y metricas dispersos) y recupera evidencia por subpregunta.
- Despliegue local-first con requisitos de privacidad: la separacion entre extraccion y recuperacion permite un servidor de extraccion local y varios clientes ligeros de recuperacion, manteniendo los datos sensibles fuera de APIs externas en la fase de consulta.
- Base de conocimiento personal o de investigacion: indexacion de documentos largos con metricas y entidades estructuradas, consultable con evidencia trazable y citas verificables por substring.
- Evaluacion de sistemas de memoria: el repositorio incluye flujos reproducibles sobre MemoryAgentBench y LoCoMo, util para comparar configuraciones de recuperacion (BM25 sola frente a hibrida con folding).

## Benchmarks y rendimiento

MemoryAgentBench, metrica substring exact match, configuracion completa (cuatro tablas, supersesion/folding, recuperacion hibrida, contestador iterativo), temperatura 0,7:

| Tarea | Contexto | Puntuacion | Modelo de respuesta | Ejecuciones | Comparativa reportada |
|---|---|---|---|---|---|
| FactConsolidation-SH | 262k | 93,2 % | gpt-4o-mini | media de 5 | GPT-4o 60; BM25 56; gpt-4o-mini 45 |
| FactConsolidation-SH | 262k | 93,0 % | DeepSeek, thinking desactivado | 1 | no disponible |
| FactConsolidation-SH | 262k | 92,0 % | Qwen2.5-Coder 7B local | 1 | no disponible |
| FactConsolidation-SH | 6k | 98 % | DeepSeek, thinking desactivado | 1 | no disponible |
| FactConsolidation-MH | 262k | 48,3 % | DeepSeek, thinking desactivado | media de 3 | BM25 3; HippoRAG-v2 5; Mem0 2; MemGPT 3; CAR con gpt-4o 41 |
| FactConsolidation-MH | 262k | 25,3 % | gpt-4o-mini | media de 3 | CAR con gpt-4o-mini 27 |
| FactConsolidation-MH | 6k | 66 % substring / 65 % exact | DeepSeek, thinking desactivado | 1 | no disponible |

Lectura directa del contexto completo frente a WhaleYing a 262k:

| Tarea | Lectura directa | Con WhaleYing | Ganancia |
|---|---|---|---|
| Single-hop | 64 % (DeepSeek) | 93,2 % (gpt-4o-mini) | +29 pp |
| Multi-hop | 5,3 % (DeepSeek) | 48,3 % (DeepSeek) | +43 pp |

LoCoMo, metrica F1 oficial sobre 1.986 preguntas, DeepSeek a temperatura 0 con thinking desactivado:

| Categoria | Preguntas | Sin folding (solo BM25) | Configuracion completa |
|---|---|---|---|
| Multi-hop | 282 | 19,9 % | 20,4 % |
| Single-hop | 321 | 28,3 % | 30,1 % |
| Temporal | 96 | 13,9 % | 15,3 % |
| Open-domain | 841 | 43,9 % | 38,9 % |
| Adversarial / abstención | 446 | 53,4 % | 50,4 % |
| F1 global | 1.986 | 38,6 % | 36,3 % |

Rendimiento medido en una evaluacion completa de 262k: extraccion de 1,1 millones de caracteres en 67 chunks y 870 piezas, aproximadamente 11,5 minutos con DeepSeek-flash y ocho peticiones concurrentes; respuesta de aproximadamente 4 minutos para 100 preguntas single-hop y de 15 a 25 minutos para 100 multi-hop; consumo de aproximadamente 3 millones de tokens en extraccion y 700.000 en respuesta de 100 preguntas.

## Requisitos de hardware

- No requiere GPU dedicada: el desarrollo y la evaluacion se ejecutaron en Windows 11 con un Intel i5-13420H y 16 GB de RAM sin GPU discreta.
- VRAM estimada: no disponible para el pipeline; el consumo depende del LLM de extraccion y respuesta elegido (API remota o modelo local).
- GPU recomendadas: no disponible; para servir localmente el modelo de respuesta, cualquier GPU capaz de ejecutar el LLM seleccionado (por ejemplo, Qwen2.5-Coder 7B) y el encoder `all-MiniLM-L6-v2`.
- Cabe en GPU de consumo: si, en la medida en que el LLM de respuesta local quepa; el componente de recuperacion (`all-MiniLM-L6-v2`) es ligero.
- Opciones de despliegue: ejecucion directa del paquete Python (`python extractor/extract.py`), con API compatible con OpenAI para extraccion y respuesta (DeepSeek, gpt-4o-mini, servidores locales); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: extraccion de 1,1 millones de caracteres en aproximadamente 11,5 minutos con ocho peticiones concurrentes; respuesta de 4 minutos (100 single-hop) y 15-25 minutos (100 multi-hop); cache de vectores con aceleracion de aproximadamente 1.340x en recuperacion.

## Comparativa con modelos similares

| Sistema | Enfoque | Contexto evaluado | Resultado destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhaleYing Memory | Memoria estructurada con supersesion y recuperacion hibrida | 262k | SH 93,2 %; MH 48,3 % (MemoryAgentBench) | Apache-2.0 | Hugging Face + GitHub |
| Mem0 | Memoria para agentes | 262k | MH 2 % (reportado en la comparativa del autor) | no disponible | no disponible |
| MemGPT | Memoria jerarquica para agentes | 262k | MH 3 % (reportado en la comparativa del autor) | no disponible | no disponible |
| HippoRAG-v2 | Recuperacion aumentada con grafo | 262k | MH 5 % (reportado en la comparativa del autor) | no disponible | no disponible |
| CAR | Recuperacion con resolucion de conflictos | 262k | MH 41 % con gpt-4o; 27 % con gpt-4o-mini | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: depende de un LLM externo para extraccion y respuesta, por lo que la calidad final hereda las capacidades y sesgos de ese modelo.
- El folding responde a "que es verdad ahora" y descarta valores supersedidos; en preguntas sobre estados pasados rinde peor. En LoCoMo, la configuracion completa obtiene 36,3 % de F1 global frente a 38,6 % sin folding.
- Las preguntas temporales son la categoria mas debil en LoCoMo (13,9-15,3 % de F1); la recuperacion de estados historicos y la normalizacion de tiempo relativo figuran como objetivos de desarrollo pendientes.
- El rendimiento multi-hop depende fuertemente del modelo de respuesta: 48,3 % con DeepSeek frente a 25,3 % con gpt-4o-mini.
- Las cifras de LoCoMo son de una sola ejecucion; el propio autor advierte que sus preguntas dependen en su mayoria de las una o dos sesiones mas recientes y que la prueba mide QA conversacional temporal mas que retencion a largo plazo.
- Riesgo de alucinacion mitigado parcialmente por la validacion de citas como subcadenas del texto fuente, pero no eliminado en la etapa de respuesta del LLM.
- Coste de tokens relevante: aproximadamente 3 millones de tokens de extraccion por cada evaluacion de 262k, lo que encarece el indexado de corpus grandes.
- Idiomas soportados no documentados; el comportamiento multilingue no esta evaluado.
- Licencia Apache-2.0 permite uso comercial, pero las dependencias externas (modelos de extraccion y respuesta, `all-MiniLM-L6-v2`) tienen sus propias licencias que deben verificarse.
- Proyecto con 0 descargas y 0 likes en Hugging Face en el momento de la consulta; madurez y soporte comunitario limitados.
- La integracion se realiza via API compatible con OpenAI; no se documentan adaptadores para frameworks de agentes populares.

## Enlaces

- Hugging Face: https://huggingface.co/jing-ying-dev/WhaleYing-Memory
- GitHub: https://github.com/jing-ying-dev/whale-ying-memory
- DOI: https://doi.org/10.5281/zenodo.24402955
- Paper MemoryAgentBench: https://arxiv.org/abs/2507.05257
- Paper de referencia multi-hop y CAR: https://arxiv.org/abs/2606.01435
