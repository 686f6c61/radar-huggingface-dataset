# AnilaThomas123/personal-chief-of-staff-app

## Resumen

Personal Chief of Staff es una aplicación multi-agente de código abierto que actúa como un asistente ejecutivo personal. Desarrollada por Anila Thomas, la aplicación orquesta cinco agentes especializados (correo electrónico, calendario, tareas, investigación y memoria) mediante LangGraph para generar un informe matutino diario con las prioridades más importantes, los riesgos a vigilar y las acciones recomendadas. El sistema incorpora un mecanismo de aprobación humana obligatorio antes de ejecutar cualquier acción consecuente, como enviar un correo o modificar un evento del calendario.

A diferencia de un modelo de lenguaje tradicional, esta aplicación no contiene pesos ni parámetros entrenados: es un sistema de software que integra modelos externos a través de un gateway unificado basado en LiteLLM. El usuario puede elegir entre OpenAI (gpt-5-nano por defecto), Claude de Anthropic o un modelo local de Ollama (qwen2.5:7b-instruct) sin modificar el código de los agentes. El backend está construido con FastAPI y LangGraph, el frontend con React y Vite, y las integraciones con Gmail, Google Calendar y Google Tasks se realizan mediante OAuth.

La relevancia actual de esta aplicación radica en su enfoque práctico de la orquestación de agentes con supervisión humana, un patrón cada vez más demandado en entornos empresariales donde la automatización debe convivir con el control y la trazabilidad. Su licencia MIT permite su uso comercial y su modificación libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion multi-agente con LangGraph (orquestador) + FastAPI (backend) + React/Vite (frontend) |
| Parametros totales | No aplicable (no es un modelo de lenguaje) |
| Parametros activos | No aplicable |
| Longitud de contexto | Depende del modelo subyacente (gpt-5-nano, Claude, qwen2.5:7b-instruct) |
| Tipos de cuantizacion | No aplicable (los modelos externos pueden cuantizarse si se usa Ollama) |
| Idiomas soportados | No disponible (depende del modelo subyacente) |
| Licencia | MIT |
| Formato de pesos | No aplicable (codigo fuente Python/TypeScript) |

## Arquitectura y entrenamiento

La aplicacion no es un modelo entrenado, sino un sistema de software que orquesta agentes. La arquitectura se compone de un backend FastAPI que expone una API REST, un grafo de LangGraph que coordina los agentes de Email, Calendar, Task, Research y Memory, y un frontend React para la interaccion con el usuario. El gateway de modelos (app/models/gateway.py) abstrae el acceso a los proveedores de LLM mediante LiteLLM, permitiendo cambiar de proveedor solo con una variable de entorno.

El almacenamiento de datos estructurados se realiza en SQLite, mientras que la memoria semantica utiliza un indice de similitud coseno implementado de forma directa (brute-force) sobre embeddings. Las politicas de guardarraíles (app/policy/guardrails.py) son codigo determinista no basado en LLM que decide que acciones requieren aprobacion humana: las lecturas se ejecutan automaticamente, pero enviar correos, modificar eventos o escribir tareas siempre genera una solicitud de aprobacion previa.

No existe entrenamiento de modelo en este proyecto. Los agentes dependen de los modelos externos configurados, y el codigo de la aplicacion no incluye ningun proceso de fine-tuning ni RLHF.

## Capacidades

- Generacion de un informe matutino diario con las tres prioridades principales, explicaciones de por que son importantes, riesgos a vigilar y acciones recomendadas.
- Orquestacion de cinco agentes especializados: Email, Calendar, Task, Research y Memory.
- Integracion con Gmail, Google Calendar y Google Tasks mediante OAuth (lectura y escritura).
- Busqueda web a traves de DuckDuckGo sin necesidad de API key para el agente de investigacion.
- Memoria semantica con recuperacion por similitud coseno sobre embeddings.
- Interfaz de chat (Ask) para consultas ad hoc con opcion de indicar si se necesita informacion actual.
- Cola de aprobaciones donde el usuario revisa y aprueba o deniega acciones consecuentes antes de que se ejecuten.
- Soporte de human-in-the-loop integrado en el flujo de trabajo.
- Trazabilidad opcional con LangSmith para monitorizar el rendimiento de los agentes y el consumo de tokens.
- Compatibilidad con multiples proveedores de modelos (OpenAI, Anthropic, Ollama) mediante un gateway unico.

## Casos de uso

- Gestion diaria de prioridades ejecutivas: el sistema recopila correos, eventos y tareas pendientes, y genera un resumen matutino con las tres prioridades mas relevantes, explicando su importancia y los riesgos asociados. Es adecuado para directivos que necesitan una vision rapida de su jornada sin revisar manualmente cada bandeja de entrada.
- Automatizacion de respuestas de correo con supervision: el agente de Email puede redactar respuestas a mensajes recibidos, pero cualquier envio requiere aprobacion humana. Esto permite agilizar la redaccion manteniendo el control final sobre la comunicacion saliente.
- Coordinacion de agenda y calendario: el agente de Calendar identifica conflictos de horario, propone reorganizaciones y sugiere nuevas citas. Las modificaciones reales del calendario solo se aplican tras la aprobacion del usuario, evitando cambios no deseados.
- Seguimiento de tareas y recordatorios: el agente de Task monitoriza las tareas de Google Tasks, detecta vencimientos proximos y sugiere priorizaciones. La creacion de nuevas tareas se somete a aprobacion.
- Investigacion rapida para la toma de decisiones: el agente de Research realiza busquedas en DuckDuckGo sobre temas solicitados y sintetiza los resultados en un resumen accionable, util para preparar reuniones o evaluar opciones estrategicas.
- Asistente conversacional ad hoc: la interfaz Ask permite formular preguntas puntuales sobre el estado de la bandeja de entrada, la agenda o cualquier tema de investigacion, con la opcion de solicitar informacion actualizada en tiempo real.
- Despliegue local con privacidad: al poder configurar Ollama con un modelo local como qwen2.5:7b-instruct, la aplicacion puede ejecutarse sin enviar datos a servicios externos, adecuada para entornos con requisitos estrictos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una aplicacion que orquesta modelos externos, el rendimiento depende del modelo subyacente configurado. La suite de pruebas incluida cubre los 12 requisitos de aceptacion del MVP con datos de prueba, sin necesidad de conexion a servicios externos.

## Requisitos de hardware

- La aplicacion en si es ligera: el backend FastAPI y el frontend React pueden ejecutarse en cualquier equipo de desarrollo moderno.
- Para el modo local con Ollama, se recomienda al menos 8 GB de VRAM para qwen2.5:7b-instruct en cuantizacion Q4, o 16 GB para la version completa.
- GPUs recomendadas para el modo local: RTX 3060 o superior, o cualquier GPU con al menos 8 GB de VRAM.
- En modo cloud (OpenAI o Claude), no se requiere GPU local; solo conexion a internet y las claves API correspondientes.
- Opciones de despliegue: uvicorn para el backend, npm run dev para el frontend en desarrollo, o servidores de produccion como gunicorn y Nginx para el frontend compilado.
- El almacenamiento SQLite y el indice de embeddings por similitud coseno funcionan correctamente en discos SSD convencionales.

## Comparativa con modelos similares

No disponible. Esta aplicacion no es un modelo de lenguaje, sino un sistema de orquestacion de agentes. No existen aplicaciones equivalentes publicadas en Hugging Face con las mismas caracteristicas de integracion con Google Workspace y aprobacion humana. Alternativas comerciales como el AI Chief of Staff de Microsoft 365 (enlace en la seccion de enlaces) ofrecen funcionalidades similares pero no son de codigo abierto ni comparables directamente en parametros tecnicos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede utilizarse como un LLM independiente; requiere un proveedor externo configurado.
- La calidad de las respuestas depende completamente del modelo subyacente elegido; con qwen2.5:7b-instruct local, la calidad puede ser inferior a la de gpt-5-nano o Claude.
- La memoria semantica utiliza un indice de similitud coseno por fuerza bruta, que no escala bien con grandes volumenes de datos; el propio autor indica que es una solucion MVP.
- No incluye Docker, CI, Postgres/pgvector ni herramientas de observabilidad formales (OpenTelemetry/Phoenix), que se mencionan como mejoras futuras.
- La integracion con Google requiere configuracion manual de OAuth y la creacion de credenciales en Google Cloud Console; sin esto, la aplicacion degrada su funcionalidad mostrando avisos de fuente no disponible.
- Los scopes de escritura (gmail.send, calendar.events, tasks) solo se ejercen tras la aprobacion humana, pero el usuario debe confiar en que el codigo de guardarraíles es correcto; se recomienda auditar app/policy/guardrails.py antes de un despliegue en produccion.
- No se han publicado evaluaciones de sesgos ni de alucinacion; al depender de modelos externos, hereda sus limitaciones.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte oficial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AnilaThomas123/personal-chief-of-staff-app
- Repositorio en GitHub: https://github.com/AnilaThomas123/personal-chief-of-staff
- README en GitHub: https://github.com/AnilaThomas123/personal-chief-of-staff/blob/main/README.md
- Perfil del autor en Hugging Face: https://huggingface.co/AnilaThomas123
- Modelos del autor en Hugging Face: https://huggingface.co/AnilaThomas123/models
- Referencia comercial (no open source): AI Chief of Staff para Microsoft 365: https://copilot-chief-of-staff.vercel.app/
