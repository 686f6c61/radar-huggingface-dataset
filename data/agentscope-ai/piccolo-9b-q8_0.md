# agentscope-ai/Piccolo-9B-Q8_0

## Resumen

Piccolo-9B-Q8_0 es la distribucion en formato GGUF con cuantizacion Q8_0 de Piccolo-9B, un modelo de decision desarrollado por AgentScope (agentscope-ai) que se aparta del paradigma habitual de generacion autoregresiva de tokens. En lugar de producir texto libre, el modelo puntua candidatos y devuelve probabilidades, lo que lo orienta a tareas de revision de herramientas (tool review), seleccion de contexto y clasificacion de decisiones dentro de agentes. Su pipeline declarado en Hugging Face es `text-classification`.

El modelo base cuenta con 8.953.803.264 parametros (aproximadamente 9B) y emplea atencion bidireccional sobre el prompt, un rasgo poco comun en modelos de esta escala y que resulta coherente con su uso como evaluador de secuencias completas en lugar de generador. Esta version Q8_0 se ha convertido desde un backbone de texto en BF16 GGUF y posteriormente cuantizado, distribuyendose en dos shards que deben descargarse y cargarse conjuntamente.

Su relevancia actual radica en la creciente demanda de modelos especializados que actuen como componentes de decision dentro de sistemas multiagente: en lugar de invocar un LLM generativo para decidir que herramienta usar o que fragmento de contexto es relevante, Piccolo ofrece una puntuacion nativa de candidatos con un coste de inferencia menor. La licencia Apache 2.0 y su disponibilidad en GGUF facilitan el despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion bidireccional sobre el prompt (backbone de texto; familia QwenPaw segun tags) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); el backbone se convirtio primero a BF16 GGUF |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2 shards: `Piccolo-9B-Q8_0-00001-of-00002.gguf` y `...-00002-of-00002.gguf`) |

## Arquitectura y entrenamiento

Piccolo-9B se presenta como un modelo de decision con atencion bidireccional sobre el prompt, lo que permite que cada token del contexto atienda a todos los demas en lugar de operar de forma causal. Esta eleccion encaja con su funcion: puntuar candidatos completos (por ejemplo, posibles llamadas a herramientas o fragmentos de contexto) y devolver probabilidades sin generar tokens de respuesta. El modelo base pertenece a la familia denominada QwenPaw segun los tags del repositorio, y se distribuye tambien en una variante de 27B (Piccolo-27B), lo que sugiere una familia escalonada de modelos de decision.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO en la informacion proporcionada. La model card de esta version cuantizada se centra en el proceso de conversion: el backbone de texto se convirtio a BF16 GGUF y despues se cuantizo a Q8_0, con una validacion numerica que reporta una diferencia maxima de 0,00286038 en la probabilidad de candidato respecto al checkpoint completo sobre cuatro preguntas de prueba.

## Capacidades

- Puntuacion de candidatos y devolucion de probabilidades sin generar tokens de respuesta (endpoint `/v1/systemone` en el runtime compatible).
- Revision de herramientas (tool review): evaluacion de llamadas a funciones propuestas por un agente.
- Seleccion de contexto: identificacion de fragmentos relevantes dentro de un contexto amplio.
- Clasificacion de decisiones dentro de pipelines de agentes (pipeline declarado: `text-classification`).
- Atencion bidireccional sobre el prompt, adecuada para tareas de evaluacion de secuencias completas.
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional segun los tags del repositorio.
- No se documentan capacidades de vision, audio, tool calling generativo ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Revision de llamadas a herramientas en agentes: antes de ejecutar una funcion propuesta por un LLM generativo, Piccolo puntua la idoneidad de la llamada y permite descartar invocaciones erroneas o peligrosas sin coste de generacion adicional.
- Seleccion de contexto en pipelines RAG: el modelo evalua que fragmentos recuperados son relevantes para la consulta y devuelve probabilidades que permiten filtrar antes de pasar el contexto al modelo generativo, reduciendo tokens de entrada.
- Enrutado de decisiones en sistemas multiagente: dado un conjunto de acciones candidatas, Piccolo devuelve la distribucion de probabilidad sobre ellas, lo que sirve como capa de arbitraje entre subagentes.
- Clasificacion de intenciones en asistentes conversacionales: al operar como modelo de clasificacion de texto, puede asignar la intencion del usuario a una categoria predefinida con puntuaciones calibradas.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF Q8_0 y ejecutarse con el runtime compatible de llama.cpp, permite integrar la capa de decision en entornos sin GPU de datacenter.
- Filtrado previo en pipelines de CI/CD para agentes de codigo: validar si una herramienta o accion propuesta por un agente de codigo es coherente con el contexto de la tarea antes de ejecutarla.
- Evaluacion offline de trayectorias de agentes: puntuar decisiones registradas para analizar la calidad de las politicas de un agente en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a los resultados de evaluacion en el repositorio del proyecto (`github.com/agentscope-ai/Piccolo/tree/main/evaluation`), pero no se incluyen cifras en el material proporcionado. El unico dato numerico de rendimiento es la validacion de cuantizacion: diferencia maxima de probabilidad de 0,00286038 frente al checkpoint completo en cuatro preguntas de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,5 GB en Q8_0; se necesita al menos esa cantidad de memoria para cargar los dos shards, mas overhead del runtime (aproximadamente 10-11 GB en total).
- GPU recomendadas: no disponible de forma explicita; por tamano, una GPU con 12 GB o mas de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090) deberia poder alojar el modelo cuantizado.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM; en GPUs con menos memoria seria necesario recurrir a offloading parcial a CPU.
- Opciones de despliegue: requiere el runtime compatible de llama.cpp de Piccolo (con atencion bidireccional sobre el prompt y puntuacion nativa de candidatos), documentado en `github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md`. No se garantiza compatibilidad con llama.cpp estandar, Ollama, vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Formato |
|---|---|---|---|---|---|
| Piccolo-9B-Q8_0 | ~9B | no disponible | Modelo de decision / clasificacion con atencion bidireccional | Apache 2.0 | GGUF Q8_0 |
| Piccolo-27B | no disponible | no disponible | Modelo de decision de mayor escala de la misma familia | no disponible | no disponible |
| Piccolo-9B (base) | ~9B | no disponible | Checkpoint completo en BF16 del que deriva esta version | Apache 2.0 | safetensors (presumiblemente) |

No se dispone de informacion sobre modelos de terceros directamente comparables en la categoria de modelos de decision con puntuacion de candidatos; la comparativa se limita a las variantes de la propia familia Piccolo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni respuestas conversacionales; su salida son probabilidades sobre candidatos.
- Requiere un runtime especifico (llama.cpp modificado de Piccolo); no funciona con el llama.cpp estandar ni con otras herramientas de inferencia convencionales.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- La validacion numerica de la cuantizacion se realizo sobre solo cuatro preguntas de prueba, lo que constituye una muestra muy reducida para garantizar la equivalencia con el checkpoint completo.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada.
- El modelo tiene 413 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy temprana y escasa validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0, deben revisarse los avisos de terceros (`THIRD_PARTY_LICENSES.md`) por posibles restricciones heredadas del backbone.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en escenarios de contexto largo.
- El repositorio tiene 9,5 GB y dos shards que deben descargarse juntos; una descarga parcial produce un modelo inutilizable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-9B-Q8_0
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-9B
- Repositorio del proyecto: https://github.com/agentscope-ai/Piccolo
- Documentacion del runtime compatible (QWENPAW): https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md
- Resultados de evaluacion: https://github.com/agentscope-ai/Piccolo/tree/main/evaluation
- Listado de modelos de la familia: https://github.com/agentscope-ai/Piccolo/blob/main/docs/MODELS.md
- Decision Playground: https://decisionplayground.agentscope.io/
- Coleccion en ModelScope: https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
- Modelo en ModelScope: https://www.modelscope.cn/models/AgentScope/Piccolo-9B-Q8_0
- Detalles de validacion de cuantizacion: https://huggingface.co/agentscope-ai/Piccolo-9B-Q8_0/resolve/main/validation.json
- Licencia: https://huggingface.co/agentscope-ai/Piccolo-9B-Q8_0/resolve/main/LICENSE
- Avisos de terceros: https://huggingface.co/agentscope-ai/Piccolo-9B-Q8_0/resolve/main/THIRD_PARTY_LICENSES.md
