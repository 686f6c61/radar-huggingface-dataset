# agentscope-ai/Piccolo-9B-BF16

## Resumen

Piccolo-9B-BF16 es la distribucion en GGUF de precision BF16 del modelo Piccolo-9B, desarrollado por AgentScope (agentscope-ai). No es un modelo generativo al uso: es un modelo de decision (decision-model) disenado para dos tareas concretas en el contexto de agentes, la revision de llamadas a herramientas (tool review) y la seleccion de contexto (context selection). Su salida no son tokens de respuesta, sino probabilidades sobre candidatos, lo que lo convierte en un componente de evaluacion dentro de pipelines de agentes mas que en un asistente conversacional.

El modelo cuenta con 8.953.803.264 parametros (aproximadamente 9.000 millones) y emplea atencion bidireccional sobre el prompt, un rasgo poco habitual en modelos derivados de familias causales y que lo acerca mas a un encoder de clasificacion que a un decoder generativo. Soporta ingles y chino, y se distribuye bajo licencia Apache 2.0, lo que facilita su integracion en productos comerciales.

Su relevancia actual radica en el auge de los sistemas multiagente: la necesidad de filtrar que herramientas invocar y que fragmentos de contexto son pertinentes antes de gastar tokens en un modelo grande. Piccolo se posiciona como un arbitro ligero y local para esas decisiones, con un runtime especifico de llama.cpp que expone un endpoint de puntuacion de candidatos sin generar texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion bidireccional sobre el prompt (modelo de decision, no generativo) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (esta release); otras cuantizaciones no disponibles en la informacion proporcionada |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (4 shards, BF16); checkpoint completo en el modelo base |

## Arquitectura y entrenamiento

Piccolo-9B es un transformer de aproximadamente 9.000 millones de parametros que se aparta del esquema decoder-only causal: utiliza atencion bidireccional sobre el prompt, de modo que cada token de la secuencia de entrada puede atender a todos los demas. Esta eleccion encaja con su funcion de puntuacion de candidatos, donde el modelo evalua la probabilidad de opciones (herramientas o fragmentos de contexto) condicionada a la consulta completa, en lugar de generar una respuesta autoregresiva.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. La release BF16 se convirtio directamente desde el checkpoint completo al formato GGUF, y el autor documenta una validacion numerica en la que la mayor diferencia de probabilidad de candidato respecto al checkpoint original fue de 0.001873 en cuatro preguntas de prueba. El modelo requiere un runtime compatible de llama.cpp con atencion bidireccional y puntuacion nativa de candidatos, que expone el endpoint `/v1/systemone` para devolver probabilidades sin generar tokens de respuesta.

## Capacidades

- Puntuacion de candidatos: devuelve probabilidades sobre opciones predefinidas en lugar de texto generado.
- Revision de llamadas a herramientas (tool review): evalua si una invocacion de herramienta propuesta es adecuada para la consulta.
- Seleccion de contexto: puntua fragmentos de contexto para decidir cuales son pertinentes antes de pasarlos a un modelo mayor.
- Atencion bidireccional sobre el prompt, adecuada para tareas de clasificacion y ranking.
- Soporte bilingue en ingles y chino.
- Integracion con el ecosistema AgentScope y con un runtime especifico de llama.cpp.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision ni audio.

## Casos de uso

- Enrutado de herramientas en agentes: antes de que un agente invoque una funcion, Piccolo puntua cada herramienta candidata frente a la consulta del usuario y descarta las irrelevantes, reduciendo llamadas erroneas y coste de tokens en el modelo principal.
- Seleccion de contexto en RAG: dado un conjunto de fragmentos recuperados, el modelo asigna probabilidades de pertinencia y permite recortar el contexto enviado al LLM generativo, con el consiguiente ahorro de ventana y latencia.
- Validacion previa de acciones en produccion: en un pipeline de agentes, se puede interponer Piccolo como filtro que revisa la llamada a herramienta propuesta y bloquea o marca las de baja probabilidad antes de ejecutarlas.
- Clasificacion de intenciones en asistentes: aprovechando su naturaleza de text-classification, puede puntuar etiquetas de intencion en conversaciones multi-turno en ingles o chino.
- Moderacion de contexto en sistemas multiagente: cuando varios agentes comparten memoria, Piccolo puede decidir que entradas de memoria son relevantes para cada subagente.
- Despliegue local de bajo coste: al distribuirse en GGUF y ejecutarse sobre un runtime de llama.cpp, permite incorporar la capa de decision en infraestructura propia sin depender de APIs externas.
- Evaluacion offline de pipelines: sirve para medir de forma reproducible la calidad de candidatos generados por otros componentes sin invocar un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la carpeta de evaluacion del repositorio de GitHub (`evaluation`) y al listado de modelos (`docs/MODELS.md`), pero no incluye cifras en el texto proporcionado. El unico dato numerico de rendimiento es la validacion numerica de la conversion: diferencia maxima de 0.001873 en probabilidad de candidato respecto al checkpoint completo en cuatro preguntas de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para pesos (9B parametros a 2 bytes), mas overhead de contexto y runtime; se recomienda reservar 20-24 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para BF16; en GPUs con menos VRAM seria necesaria una cuantizacion inferior, no disponible en esta release.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y modelos con 24 GB o mas en BF16; en GPUs de 16 GB no cabe en BF16.
- Opciones de despliegue: runtime compatible de llama.cpp de AgentScope con atencion bidireccional y endpoint `/v1/systemone`; no se garantiza compatibilidad con llama.cpp estandar, vLLM, TGI u Ollama segun la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, el propio autor publica una variante mayor, Piccolo-27B, y una coleccion en ModelScope bajo la denominacion QwenPaw-Flash, pero no se aportan cifras que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Piccolo-9B-BF16 | 8,95B | no disponible | Apache 2.0 | GGUF BF16 | Modelo de decision bilingue en/zh |
| Piccolo-27B | no disponible | no disponible | no disponible | no disponible | Variante mayor del mismo autor |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas en texto libre; su uso esta limitado a puntuacion de candidatos y clasificacion.
- Cobertura linguistica restringida a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Requiere un runtime especifico de llama.cpp; el llama.cpp estandar puede no soportar la atencion bidireccional ni el endpoint de puntuacion.
- La release esta dividida en 4 shards GGUF que deben descargarse y cargarse conjuntamente.
- Riesgo de sesgo y alucinacion en las probabilidades asignadas: al no haber documentacion sobre datos de entrenamiento, no es posible evaluar sesgos conocidos.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en conversaciones o documentos largos.
- Aunque la licencia Apache 2.0 permite uso comercial, deben revisarse los avisos de terceros (`THIRD_PARTY_LICENSES.md`) del repositorio.
- El numero de descargas (700) y la ausencia de likes sugieren una adopcion temprana; conviene validar el comportamiento en el dominio propio antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-9B-BF16
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-9B
- Repositorio del proyecto: https://github.com/agentscope-ai/Piccolo
- Documentacion del runtime QwenPaw: https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md
- Evaluacion: https://github.com/agentscope-ai/Piccolo/tree/main/evaluation
- Listado de modelos: https://github.com/agentscope-ai/Piccolo/blob/main/docs/MODELS.md
- Decision Playground: https://decisionplayground.agentscope.io/
- Coleccion en ModelScope: https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
- Modelo en ModelScope: https://www.modelscope.cn/models/AgentScope/Piccolo-9B-BF16
- Validacion numerica: https://huggingface.co/agentscope-ai/Piccolo-9B-BF16/resolve/main/validation.json
- Licencia: https://huggingface.co/agentscope-ai/Piccolo-9B-BF16/resolve/main/LICENSE
- Avisos de terceros: https://huggingface.co/agentscope-ai/Piccolo-9B-BF16/resolve/main/THIRD_PARTY_LICENSES.md
