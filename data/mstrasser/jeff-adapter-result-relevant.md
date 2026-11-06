# mstrasser/jeff-adapter-result-relevant

## Resumen

`jeff-adapter-result-relevant` es un adaptador LoRA para el modelo base `mstrasser/jeff-base` v1.4, un modelo de decisión pequeno (fine-tune de Qwen3.5-0.8B) desarrollado por el autor mstrasser. Su funcion es evaluar si el resultado de una llamada a herramienta (tool result) responde a la subpregunta actual de un agente, devolviendo una de tres etiquetas: `yes`, `partly` o `no`. A diferencia de un modelo generativo, no produce texto que haya que parsear: en un unico forward pass devuelve una probabilidad calibrada para cada opcion.

El adaptador esta disenado especificamente para integrarse en pipelines de agentes que necesitan verificar la relevancia de los datos obtenidos antes de continuar con el razonamiento multi-paso. Se publica bajo licencia Apache 2.0, con un repositorio de tamano practicamente nulo (0.0 GB) dado que solo contiene los pesos del adaptador, no el modelo completo.

La relevancia de esta ficha es limitada: se trata de un adaptador muy especializado, con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicos independientes, y con una model card que solo reporta metricas internas del propio autor. Es util como referencia para quienes construyan agentes con el ecosistema Jeff, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer decoder-only (base: fine-tune de Qwen3.5-0.8B) |
| Parametros totales | no disponible (el adaptador LoRA no declara su numero de parametros; el base es de 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre `mstrasser/jeff-base` en su revision v1.4. El modelo base es un fine-tune de Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 800 millones de parametros. El adaptador en si no modifica la arquitectura del base: anade matrices de bajo rango que se aplican durante la inferencia para especializar el modelo en la tarea de clasificacion de relevancia de resultados de herramientas.

Segun la model card, el adaptador fue entrenado el 25 de octubre de 2026. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica destacable es el mecanismo de decision: en lugar de generar texto y parsearlo, el modelo devuelve directamente una distribucion de probabilidad calibrada sobre las opciones nombradas (`yes`, `partly`, `no`) en un unico forward pass. El motor de Jeff rechaza cargar el adaptador si el modelo base no coincide exactamente con la revision v1.4, lo que garantiza la coherencia entre entrenamiento e inferencia.

## Capacidades

- Clasificacion de relevancia de resultados de herramientas en agentes: determina si un tool result responde a la subpregunta actual del agente.
- Clasificacion en tres clases: `yes` (el resultado da todos los detalles pedidos para el registro o periodo correcto), `partly` (da al menos un detalle pedido pero no todos, o solo parte de una lista) y `no` (registro o periodo incorrecto, sin detalles pedidos, vacio o error).
- Salida de probabilidad calibrada por opcion, sin generacion de texto que requiera parsing.
- Integracion con el SDK de Jeff (`jeff.Jeff.local` y `jeff.Jeff.remote`) y con la API remota de jeffhub.ai.
- Capacidad de recibir contexto estructurado: aplicacion (`app`), fecha actual (`today`), subpregunta (`sub_question`), llamada a herramienta (`call`) y resultado (`result`).
- No soporta tool calling generativo, agentes multi-paso por si mismo ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Verificacion de resultados de busqueda en agentes: antes de que un agente continue su razonamiento, el adaptador comprueba si el resultado de una busqueda responde a la subpregunta actual, evitando que el agente avance con informacion irrelevante o de un periodo incorrecto.
- Validacion de llamadas a APIs de negocio: en un asistente de contabilidad como el ejemplo de la model card (Pinecrest Books), el adaptador detecta que una herramienta devolvio la factura de septiembre cuando se pedia la de octubre, etiquetando el resultado como `no`.
- Control de calidad en pipelines de recuperacion aumentada (RAG): se puede usar como filtro previo para descartar fragmentos recuperados que no abordan la pregunta concreta del agente.
- Deteccion de resultados parciales: cuando una herramienta devuelve solo parte de una lista solicitada, el adaptador emite `partly`, permitiendo al agente decidir si necesita una segunda llamada para completar los datos.
- Deteccion de errores y respuestas vacias: el adaptador clasifica como `no` los resultados vacios o los errores devueltos por la herramienta, lo que permite al agente gestionar reintentos o rutas alternativas.
- Enrutamiento condicional en agentes: combinado con el umbral de confianza (0.369), el sistema puede decidir si confia en la clasificacion o si escala a un modelo mayor o a revision humana.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente):

| Test | Filas | Precision |
|---|---:|---:|
| Test interno (generador) | 2.000 | 98.6% |
| Segundo test interno de casos no vistos (generador) | no registrado | 98.5% |

Metricas de calibracion:

| Funcion | Umbral | Precision | Cobertura | Filas de calibracion |
|---|---:|---:|---:|---:|
| `relevant` | 0.369 | 99.2% | 100.0% | 2.000 |

El autor advierte que los tests de tipo "generator" proceden del mismo generador que los datos de entrenamiento, por lo que miden menos que un test publico o real. No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un base de 0.8B parametros, la huella es reducida y cabe en GPUs de consumo, pero no se proporcionan cifras concretas.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del base (0.8B) es razonable esperar que funcione en GPUs consumer, pero el autor no lo especifica.
- Cabe en consumer GPU: probablemente si, dado el tamano del modelo base, aunque no se confirma en la documentacion.
- Opciones de despliegue: SDK de Jeff (`jeff.Jeff.local` para inferencia local y `jeff.Jeff.remote` contra `https://api.jeffhub.ai`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se trata de un adaptador altamente especializado dentro del ecosistema Jeff, sin alternativas directas identificadas en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jeff-adapter-result-relevant | no disponible (base 0.8B) | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo muy especializado: solo evalua relevancia de resultados de herramientas; no sirve para generacion de texto, codigo, matematicas ni tareas generales.
- Solo ingles: la model card declara unicamente el idioma `en`.
- Dependencia estricta del base: el motor rechaza el adaptador si el modelo base no es exactamente `mstrasser/jeff-base` en la revision v1.4.
- Metricas no independientes: los resultados reportados (98.6% y 98.5%) provienen de tests internos generados por el mismo generador que los datos de entrenamiento, lo que limita su valor como evidencia de rendimiento real.
- Sin adopcion verificable: cero descargas y cero likes en Hugging Face en el momento de la consulta.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea en casos limite (resultados parcialmente relevantes o con detalles ambiguos).
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no documenta condiciones adicionales ni limitaciones de responsabilidad.
- Documentacion incompleta: no se especifican tokens de entrenamiento, composicion del dataset, contexto maximo ni requisitos de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-result-relevant
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Pagina del catalogo: https://jeffhub.ai/catalogue/jeff.agents.result-relevant
- Repositorio GitHub (codigo, servidor y SDKs): https://github.com/firelex/jeff
- Guia de instalacion del SDK: https://jeffhub.ai/docs/sdk/install
- API remota: https://api.jeffhub.ai
- Sitio principal: https://jeffhub.ai
