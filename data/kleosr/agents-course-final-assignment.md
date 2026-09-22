# kleosr/agents-course-final-assignment

## Resumen

`kleosr/agents-course-final-assignment` no es un modelo de lenguaje con pesos publicados, sino un repositorio de codigo que implementa un agente de resolucion de preguntas para el subconjunto GAIA Level-1 del curso de agentes de Hugging Face (Unit 4). El autor, kleosr, lo publica como entrega final del curso y como fuente publica del agente asociado a su nombre de usuario, con el objetivo de enviarlo a la API de scoring del curso. El repositorio contiene unicamente codigo Python (`agent.py`, `run_all.py`, `requirements.txt`) bajo licencia Apache 2.0; no incluye tarjetas de pesos ni artefactos de modelo.

La estrategia del agente combina tres piezas: llamadas de chat mediante `huggingface_hub.InferenceClient` contra `Qwen/Qwen2.5-72B-Instruct` en el nivel gratuito de HF Inference, investigacion web con DuckDuckGo y la API REST de Wikipedia, y heuristicas deterministas para un conjunto acotado de tipos de tarea (texto reversible, conmutatividad algebraica, filtrado botanico de vegetales e items multimodales conocidos) que se activan cuando el endpoint `/files/{task_id}` de la API de scoring no devuelve fichero asociado, algo frecuente en el Space gratuito. Las respuestas se devuelven como cadenas simples, sin el prefijo `FINAL ANSWER`, para encajar con el scoring por coincidencia exacta.

Su relevancia es practica y acotada: sirve como plantilla minima y reproducible para construir agentes de QA con presupuesto cero, y como ejemplo de patron "LLM remoto + busqueda + heuristicas de respaldo" en lugar de un pipeline de razonamiento complejo. No hay datos publicados de arquitectura propia, tamano de parametros, contexto ni idiomas para este repositorio, porque el repositorio no define un modelo entrenado: el unico modelo implicado es el externo que invoca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio (no contiene pesos). Agente basado en un LLM externo invocado por API: `Qwen/Qwen2.5-72B-Instruct` |
| Parametros totales | No aplica al repositorio. El modelo invocado lleva "72B" en su nombre; no verificado en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No aplica (el repositorio no distribuye pesos). Inferencia remota en el nivel gratuito de HF Inference |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | No aplica: solo codigo fuente Python (`agent.py`, `run_all.py`, `requirements.txt`) |
| Tipo de artefacto | Repositorio de agente / entrega de curso |
| Framework declarado | `smolagents` (etiqueta del repositorio); `agent.py` implementa la clase `BasicAgent` |
| Modelo invocado | `Qwen/Qwen2.5-72B-Instruct` via `huggingface_hub.InferenceClient` (chat) |
| Herramientas externas | DuckDuckGo (busqueda web), Wikipedia REST/API |
| Endpoint de evaluacion | API de scoring Unit 4: `https://agents-course-unit4-scoring.hf.space` |
| Autor | kleosr |
| Descargas | 0 |
| Likes | 1 |
| Pipeline | no disponible |
| Fecha de creacion | 2026-09-21T21:10:31.000Z (segun metadatos del repositorio) |
| Fecha de actualizacion | 2026-09-21T21:11:26.000Z (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

No existe entrenamiento propio: el repositorio no describe preentrenamiento, ajuste fino, RLHF ni DPO, y no publica datos de entrenamiento. Lo que define es el esqueleto de un agente. La clase `BasicAgent` (en `agent.py`) resuelve cada tarea del subconjunto GAIA Level-1 con una cascada de decisiones: primero se apoya en el modelo remoto `Qwen/Qwen2.5-72B-Instruct` a traves de `InferenceClient` en modo chat; para las preguntas de tipo investigacion lanza busquedas en DuckDuckGo y consultas a la API REST de Wikipedia; y para ciertas familias de tarea aplica heuristicas deterministas en lugar de razonamiento abierto, cubriendo texto reversible, conmutatividad algebraica, filtrado botanico de vegetales e identificacion de items multimodales conocidos.

La innovacion tecnica destacable no es arquitectonica sino de ingenieria de evaluacion: el agente detecta cuando el endpoint `/files/{task_id}` de la API de scoring no tiene fichero mapeado (situacion habitual en el Space gratuito) y responde con heuristicas predefinidas en lugar de intentar procesar un adjunto inexistente. Ademas, normaliza la salida a cadena simple sin prefijo `FINAL ANSWER`, requisito implicito del scoring por coincidencia exacta. No se documentan decodificacion especulativa, atencion lineal, modos de pensamiento ni ninguna otra tecnica de inferencia; el agente delega todo el razonamiento linguistico en el modelo remoto. Tampoco se documentan semillas, temperatura, numero de turnos de razonamiento ni presupuesto de tokens por tarea.

## Capacidades

- Resolucion de tareas del subconjunto GAIA Level-1 en modo de nivel gratuito, con envio de resultados a la API de scoring del curso.
- Generacion de respuestas cortas y exactas: devuelve cadenas simples sin prefijo `FINAL ANSWER`, pensadas para evaluacion por coincidencia exacta.
- Busqueda web mediante DuckDuckGo para preguntas de investigacion abierta.
- Consulta de Wikipedia mediante REST/API como fuente de conocimiento estructurado y enciclopedico.
- Heuristicas deterministas para cuatro familias de tarea: texto reversible (inversion de cadenas), conmutatividad algebraica, filtrado botanico de vegetales e identificacion de items multimodales conocidos.
- Degradacion controlada ante ausencia de adjuntos: si `/files/{task_id}` no devuelve fichero, responde con heuristicas en lugar de fallar.
- Ejecucion local reproducible mediante `run_all.py`, con modo de envio (`--submit`) y autenticacion por `HF_TOKEN`.
- No se documenta soporte de tool calling o function calling nativo, ni modo de pensamiento explicito, ni capacidades de vision, audio o agentes multi-paso mas alla del flujo descrito.
- No se documentan capacidades multilingues especificas.

## Casos de uso

- Entrega del curso de agentes de Hugging Face (Unit 4): el repositorio existe para cumplir la asignacion final y su codigo se envia directamente a la API de scoring; es el uso primario y documentado.
- Plantilla de arranque para agentes GAIA con coste cero: al apoyarse en el nivel gratuito de HF Inference, sirve como base para quien quiera montar un agente de QA sin presupuesto de GPU ni de API de pago.
- Prototipado de pipelines de investigacion web: la combinacion DuckDuckGo + Wikipedia REST es reutilizable como capa de recuperacion para preguntas de conocimiento abierto con verificacion cruzada de dos fuentes.
- Banco de pruebas de heuristicas deterministas: las reglas para texto reversible, conmutatividad algebraica y filtrado botanico permiten medir cuanto aporta una regla fija frente al razonamiento del LLM en tareas de respuesta exacta.
- Docencia y aprendizaje de estructuras de agente: `agent.py` implementa una unica clase `BasicAgent`, lo que lo hace util como ejemplo minimo para explicar el ciclo tarea-respuesta sin la complejidad de un framework multiagente.
- Regresion automatica de agentes en CI: `run_all.py --submit` permite integrar una ejecucion completa del conjunto en un job que compare puntuaciones entre versiones del agente.
- Extension con herramientas propias: al ser codigo abierto y de tamano reducido, admite sustituir o anadir fuentes de recuperacion (por ejemplo, un buscador propio o una base documental interna) manteniendo el resto del flujo.
- Evaluacion comparativa de backends de inferencia: cambiar el modelo invocado por `InferenceClient` es un cambio localizado, lo que facilita comparar modelos servidos por API sobre el mismo conjunto de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio esta preparado para enviar respuestas a la API de scoring del curso (`https://agents-course-unit4-scoring.hf.space`), pero no se incluye ninguna puntuacion obtenida, ni numero de tareas resueltas, ni comparacion con otras entregas. No se dispone tampoco de datos de MMLU, HumanEval, GSM8K ni de ninguna otra metrica, ya que el repositorio no es un modelo evaluable de forma independiente.

## Requisitos de hardware

- Para ejecutar el agente tal como esta publicado no se necesita GPU: el razonamiento ocurre en `Qwen/Qwen2.5-72B-Instruct` servido por HF Inference, y el proceso local solo ejecuta Python, llamadas HTTP y busquedas web. Basta una CPU y conexion a internet.
- Es imprescindible una variable de entorno `HF_TOKEN` valida; sin ella el cliente de inferencia no puede autenticarse.
- Instalacion: `pip install -r requirements.txt`; ejecucion: `python run_all.py --submit`.
- El rendimiento y la latencia dependen por completo del nivel gratuito de HF Inference (colas, limites de peticiones y disponibilidad del modelo en ese nivel); no hay cifras de latencia ni de throughput en la informacion disponible.
- Si se quisiera autoalojar el modelo invocado (`Qwen/Qwen2.5-72B-Instruct`) en lugar de usar la API, las estimaciones derivadas de su numero de parametros (72B) serian orientativas y no verificadas en la informacion disponible: en bf16 requeriria del orden de 144 GB de VRAM, en int8 del orden de 72 GB y en 4 bits del orden de 36-40 GB mas overhead. Eso implica multiples GPU de 80 GB (A100/H100) para bf16 o int8, y al menos una GPU de 48-80 GB para cuantizaciones de 4 bits.
- En GPU de consumo (por ejemplo, RTX 4090 con 24 GB) no cabe el modelo completo ni siquiera en 4 bits sin offload a memoria del sistema, lo que degradaria fuertemente la latencia. El agente, en cambio, si funciona en cualquier equipo domestico porque no aloja el modelo.
- Opciones de despliegue documentadas: ejecucion local con `python run_all.py`. No se mencionan vLLM, llama.cpp, Ollama, TGI, Docker ni despliegue en Spaces para este repositorio.

## Comparativa con modelos similares

La informacion disponible no permite una comparativa cuantitativa: el repositorio no publica parametros, contexto, licencia de pesos, benchmarks ni resultados de evaluacion propios, y la busqueda web realizada no devolvio resultados relevantes sobre el. La tabla siguiente recoge unicamente lo verificable.

| Alternativa | Naturaleza | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `kleosr/agents-course-final-assignment` | Agente de codigo sobre LLM remoto | No aplica (no distribuye pesos) | no disponible | No publicado | apache-2.0 (codigo) | Repositorio publico, 0 descargas, 1 like |
| `Qwen/Qwen2.5-72B-Instruct` (modelo invocado) | LLM de chat | No verificado en la informacion disponible | no disponible | No disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Referenciado en la model card como endpoint de inferencia |
| Otras entregas del Agents Course (Unit 4) | Agentes de codigo comparables por categoria | No aplica | no disponible | No disponible en la informacion proporcionada | Variable, no verificada | Existen en el hub, pero no se aportan ejemplos concretos |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos ni permite autoalojamiento como modelo. Cualquier evaluacion de sus "capacidades" mide en realidad el comportamiento del modelo remoto mas la logica del agente.
- Dependencia critica del nivel gratuito de HF Inference: limites de peticiones, colas, indisponibilidad puntual del modelo y posibles cambios de condiciones afectan directamente a la fiabilidad de las respuestas.
- Riesgo de alucinacion heredado del modelo remoto, agravado por la ausencia de verificacion de fuentes: la busqueda en DuckDuckGo y Wikipedia alimenta contexto, pero no se documenta ningun mecanismo de contraste o descarte.
- Las heuristicas deterministas estan sobreajustadas al subconjunto GAIA Level-1 (texto reversible, conmutatividad algebraica, filtrado botanico, items multimodales). Fuera de esas familias pueden producir respuestas incorrectas con alta confianza.
- La estrategia de respaldo se activa cuando la API de scoring no devuelve fichero para `{task_id}`; si esa API cambia su comportamiento, el agente puede responder heuristicas donde antes obtenia datos reales, o al reves.
- Dependencia de servicios de terceros con riesgo de rotura: DuckDuckGo (resultados variables o bloqueo por uso automatizado) y la API REST de Wikipedia (limites y disponibilidad).
- Formato de salida rigido: devuelve cadenas simples sin prefijo `FINAL ANSWER`; si el evaluador esperase otro formato, las respuestas quedarian penalizadas. Es un acoplamiento explicito al scoring del curso.
- Sin datos de idiomas soportados: no se puede asumir cobertura multilingue mas alla de la que ofrezca el modelo remoto.
- Ambito limitado a GAIA Level-1: no hay evidencia de funcionamiento en niveles superiores ni en tareas fuera del conjunto del curso.
- Validacion practicamente nula por la comunidad: 0 descargas y 1 like en el momento de la consulta; no hay issues, pruebas automatizadas ni CI documentados.
- Caveat de licencias: la licencia apache-2.0 del repositorio cubre el codigo, pero el uso de `Qwen/Qwen2.5-72B-Instruct` se rige por su propia licencia y por las condiciones del servicio de inferencia, que no se detallan en la informacion disponible.
- Los metadatos indican fechas de creacion y actualizacion en 2026-09-21, con solo 55 segundos entre ambas; conviene tratar estas marcas temporales con cautela y verificar el contenido antes de reutilizarlo en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kleosr/agents-course-final-assignment
- Codigo fuente (rama principal): https://huggingface.co/kleosr/agents-course-final-assignment/tree/main
- API de scoring Unit 4 (referenciada en la model card): https://agents-course-unit4-scoring.hf.space
- Modelo invocado por el agente (referenciado en la model card): https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Nota sobre la busqueda web: los resultados recuperados en la busqueda no guardan relacion con este repositorio (proceden del dominio `uliege.be`) y no se incluyen por no ser enlaces relevantes.
