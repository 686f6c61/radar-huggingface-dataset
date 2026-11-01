# Razio05/Google-GenAI-Pydantic-v2-Structured-JSON-FastAPI

## Resumen

El repositorio `Razio05/Google-GenAI-Pydantic-v2-Structured-JSON-FastAPI` no es un modelo de inteligencia artificial, sino un *blueprint* o plantilla de referencia publicado en HuggingFace que muestra como integrar FastAPI, Pydantic v2 y el SDK oficial `google-genai` para obtener salidas JSON estructuradas de los modelos Gemini de Google. El autor, Razio05, lo distribuye bajo licencia MIT y lo presenta como material de ejemplo para desarrolladores que quieren construir micro-SaaS sobre la API de Gemini sin pelearse con el parseo de markdown no estructurado.

El contenido tecnico se centra en dos problemas concretos: forzar respuestas JSON validas mediante `response_mime_type="application/json"` y un esquema Pydantic v2, y evitar el fallo de arranque de `passlib[bcrypt]` en Python 3.12/3.13 fijando `bcrypt==4.0.1`. Incluye un mecanismo de *failover* entre tres nombres de modelo Gemini (`gemini-3.5-flash`, `gemini-flash-lite-latest`, `gemini-3.8-flash`) que reintenta la llamada cuando se produce un error 404, 503, `UNAVAILABLE` o `NOT_FOUND`.

Es relevante ahora porque el ecosistema de aplicaciones LLM en produccion exige salidas estructuradas y validables, y porque la migracion a Python 3.13 ha roto muchas instalaciones de `passlib`. Sin embargo, conviene subrayar que no contiene pesos, no es un modelo entrenado y su utilidad es exclusivamente como codigo de ejemplo y material comercial (el autor redirige a un producto de pago en Gumroad).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una plantilla de integracion FastAPI + google-genai + Pydantic v2) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo Gemini invocado en tiempo de ejecucion) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene codigo Python y ficheros de configuracion, no pesos) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento asociado. El repositorio es una plantilla de aplicacion backend construida sobre FastAPI (framework ASGI asincrono), Pydantic v2 (validacion de datos y generacion de esquemas JSON) y el SDK `google-genai` para invocar modelos Gemini alojados en la infraestructura de Google. El flujo consiste en definir un `BaseModel` de Pydantic (`AIStructuredResponse` con campos `status`, `summary`, `key_points` y `action_items`), enviar el prompt junto con un `system_instruction` y `response_mime_type="application/json"`, y deserializar la respuesta con `json.loads` para instanciar el modelo validado.

La innovacion tecnica destacable es el patron de *failover* en cascada entre tres identificadores de modelo Gemini: si la llamada lanza una excepcion cuyo mensaje contiene `404`, `503`, `UNAVAILABLE` o `NOT_FOUND`, se prueba el siguiente modelo de la lista; cualquier otro error se propaga. Tambien documenta el *pin* de `bcrypt==4.0.1` para evitar el `ValueError: password cannot be longer than 72 bytes` que aparece al arrancar contenedores con `passlib[bcrypt]` en Python 3.12 y 3.13. No se documentan datos de entrenamiento, RLHF ni DPO porque no existe modelo propio.

## Capacidades

- Generacion de JSON estructurado y validado contra un esquema Pydantic v2 a partir de texto libre.
- *Failover* automatico entre tres modelos Gemini ante errores de disponibilidad o modelo no encontrado.
- Integracion con el SDK oficial `google-genai` mediante `client.models.generate_content`.
- Soporte de `system_instruction` para guiar el comportamiento del modelo subyacente.
- Plantilla de requisitos (`requirements.txt`) compatible con Python 3.10 a 3.13, con el *pin* de `bcrypt` resuelto.
- No incluye capacidades de vision, audio, tool calling propio ni agentes multi-paso implementados en el codigo mostrado; estas dependerian del modelo Gemini que se invoque.
- No implementa razonamiento multi-turno persistente ni gestion de historial de conversacion en el fragmento publicado.

## Casos de uso

- Extraccion de datos estructurados de texto libre: usar el patron `response_mime_type="application/json"` junto con un `BaseModel` para convertir correos, articulos o transcripciones en objetos JSON validados listos para insertar en base de datos.
- Backend de micro-SaaS con LLM: la plantilla sirve como esqueleto de un servicio FastAPI que expone endpoints que devuelven JSON tipado al frontend, evitando parsear markdown del modelo.
- Resiliencia ante caidas del proveedor: el *failover* entre `gemini-3.5-flash`, `gemini-flash-lite-latest` y `gemini-3.8-flash` permite mantener el servicio operativo ante errores 503 o modelos retirados.
- Migracion a Python 3.13: el *pin* `bcrypt==4.0.1` resuelve el fallo de arranque en contenedores que usan `passlib[bcrypt]` para autenticacion.
- Prototipado de asistentes con salida tipada: definir un `BaseModel` con campos como `status`, `summary`, `key_points` y `action_items` para generar resumenes accionables de reuniones o documentos.
- Auditoria o validacion de respuestas LLM: al forzar un esquema Pydantic, cualquier respuesta que no cumpla el contrato lanza una excepcion capturable, lo que facilita el registro y la monitorizacion de fallos.
- Base para pipelines de CI/CD: el repositorio incluye un *badge* de GitHub Actions, de modo que el codigo puede integrarse como plantilla de pruebas automatizadas en un pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no entrena ni evalua un modelo propio; cualquier metrica de calidad o latencia dependera del modelo Gemini que se invoque en tiempo de ejecucion, y no se proporcionan mediciones al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en local; la inferencia ocurre en los servidores de Google mediante la API `google-genai`.
- GPU recomendadas: no aplica; no se ejecuta el modelo en hardware propio.
- Cabe en GPU consumer: no aplica, ya que no hay pesos que cargar.
- Opciones de despliegue: el codigo esta pensado para desplegarse como servicio FastAPI con Uvicorn (se menciona `uvicorn` en `requirements.txt`), y el autor comercializa ademas un stack con Docker Compose y un dashboard Streamlit en su producto de pago.
- Latencia y throughput: no disponibles; dependen enteramente de la latencia de la API de Gemini y de la cuota contratada con Google.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Razio05/Google-GenAI-Pydantic-v2-Structured-JSON-FastAPI | Plantilla de integracion FastAPI + Gemini | no aplica | no disponible | MIT | Codigo de ejemplo, sin pesos ni benchmarks |
| Instructor (jxnl/instructor) | Libreria de salidas estructuradas | no aplica | no disponible | MIT | Enfoque equivalente con Pydantic, soporta multiples proveedores (OpenAI, Anthropic, Gemini) |
| Outlines (dottxt-ai/outlines) | Libreria de generacion estructurada | no aplica | no disponible | Apache 2.0 | Generacion guiada por gramaticas y JSON schema, orientada a modelos locales |
| Guidance (guidance-ai/guidance) | Lenguaje de plantillas para control de LLM | no aplica | no disponible | MIT | Control fino de generacion con interleaving de texto y llamadas a funciones |

Las tres alternativas son librerias genericas y mantenidas activamente por comunidades amplias, mientras que el repositorio analizado es una plantilla personal con un unico autor, cero descargas y cero *likes* en el momento de la consulta.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, no se puede ejecutar como modelo y no debe evaluarse con criterios de calidad de modelo (MMLU, HumanEval, etc.).
- El repositorio tiene 0 descargas y 0 *likes*, lo que sugiere ausencia de validacion por parte de la comunidad.
- La model card esta fuertemente orientada a la venta de un producto de pago en Gumroad (ShipAI v2.0), con enlaces de afiliado y descuentos; conviene tratar el contenido como material promocional ademas de tecnico.
- Los identificadores de modelo Gemini citados (`gemini-3.5-flash`, `gemini-3.8-flash`, `gemini-flash-lite-latest`) no se pueden verificar con la informacion disponible y pueden no existir o cambiar; el codigo depende de nombres de modelo externos que Google puede retirar.
- El *failover* solo captura errores 404, 503, `UNAVAILABLE` y `NOT_FOUND`; errores de cuota (429), autenticacion (401) o contenido bloqueado no se reintentan y se propagan.
- La validacion Pydantic se hace con `AIStructuredResponse(**json.loads(res.text))`; si Gemini devuelve JSON malformado o con campos extra, la excepcion no se captura en el bucle de *failover*.
- El *pin* `bcrypt==4.0.1` es una solucion puntual; futuras versiones de `passlib` o de `bcrypt` pueden requerir otra estrategia.
- Licencia MIT permite uso comercial del codigo, pero no otorga derechos sobre los servicios de Gemini ni sobre el producto de pago del autor.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el comportamiento depende integramente del modelo Gemini subyacente, no del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Razio05/Google-GenAI-Pydantic-v2-Structured-JSON-FastAPI
- Repositorio GitHub del autor (referenciado en la model card): https://github.com/RAZIO05/fastapi-gemini-2026-blueprint
- Workflow de CI del autor: https://github.com/RAZIO05/fastapi-gemini-2026-blueprint/actions/workflows/ci.yml
- Cheat sheet gratuito del autor: https://yahiaoui26.gumroad.com/l/fastapi-gemini-blueprint
- Producto comercial ShipAI v2.0: https://yahiaoui26.gumroad.com/l/shipai-pro
- SDK oficial google-genai: https://github.com/googleapis/python-genai
- Documentacion de FastAPI: https://fastapi.tiangolo.com/
- Documentacion de Pydantic v2: https://docs.pydantic.dev/latest/
