# MF180/autonomous-bug-fixing-agent

## Resumen

`MF180/autonomous-bug-fixing-agent` no es un modelo de lenguaje en sentido estricto, sino un repositorio publicado en Hugging Face que contiene una aplicación de agente autónomo para la corrección de errores en Python. El agente está orquestado con LangGraph y utiliza como motor de inferencia el modelo `openai/gpt-oss-120b` servido a través de la API de Groq. El repositorio incluye el código fuente del agente, la especificación de arquitectura (SPEC.md), la interfaz web en Streamlit, las herramientas de sandbox y los scripts de despliegue en AWS.

El flujo de trabajo del agente parte de un issue de GitHub o un informe de error: inspecciona el repositorio, escribe un test de reproducción con `pytest`, lo ejecuta en un sandbox aislado, propone parches mediante búsqueda y reemplazo, itera hasta un máximo de 8 intentos y se detiene en una compuerta de aprobación humana antes de hacer commit o exportar el parche. La relevancia actual reside en su enfoque de agente con human-in-the-loop y aislamiento de ejecución, aunque el repositorio no contiene pesos de modelo propios.

La ficha técnica se ve limitada porque la model card no aporta datos sobre parámetros, contexto, licencia ni idiomas del componente de IA subyacente; el modelo real utilizado es `openai/gpt-oss-120b`, cuyas especificaciones no se detallan en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agente LangGraph con máquina de estados y LLM externo (`openai/gpt-oss-120b` vía Groq) |
| Parámetros totales | no disponible (el repositorio no contiene pesos; el LLM subyacente es `openai/gpt-oss-120b`) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona un límite de 8K tokens/minuto del tier gratuito de Groq, no la ventana de contexto del modelo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica (repositorio de código; no se distribuyen pesos) |

## Arquitectura y entrenamiento

El repositorio implementa un agente autónomo sobre LangGraph, con un estado explícito definido como `TypedDict` y sub-modelos Pydantic v2. El grafo incluye nodos para la ingesta del issue, la inspección del repositorio, la escritura del test de reproducción, la ejecución del test, la propuesta de parche, la aplicación del parche, la ejecución de la suite de tests, el análisis de fallos y la compuerta de aprobación humana. Los enrutadores condicionales son funciones puras y el checkpointing se realiza con `MemorySaver` o `PostgresSaver`.

El motor de inferencia es `openai/gpt-oss-120b` a través de la API de Groq, con salidas JSON estructuradas y validación automática con reparación. Se aplican guardarraíles para el tier gratuito de Groq: retroceso exponencial con `tenacity` ante errores 429, un límite duro de 8 iteraciones de corrección (`RunBudget`), poda activa del contexto mediante `summarize_past_attempts` y truncado de la cola de las salidas del sandbox para mantenerse por debajo de los 8K tokens por minuto. No se detalla el entrenamiento del LLM subyacente ni datos de RLHF o DPO en la información disponible.

El aislamiento de ejecución se implementa con un sandbox conectable: `DockerSandbox` (contenedor sin privilegios, usuario no root, `cap_drop=["ALL"]`, límites de memoria/CPU/PID y red deshabilitada) y `LocalSandbox` (subproceso de reserva con limpieza de secretos del entorno y terminación del árbol de procesos por tiempo de espera). El espacio de trabajo está confinado por ruta sobre una copia aislada (`base/` + `work/`), de modo que el repositorio objetivo no se modifica hasta la aprobación.

## Capacidades

- Generación de tests de reproducción en `pytest` a partir de un issue o informe de error.
- Inspección de repositorios Python y propuesta de parches mediante búsqueda y reemplazo de código.
- Ejecución de tests en sandbox aislado (Docker o subproceso local) con captura de salida.
- Iteración autónoma de corrección con análisis de fallos y hasta 8 intentos.
- Compuerta de aprobación humana (`human_approval`) con reanudación desde `langgraph.types.interrupt()`; el commit o PR solo es alcanzable tras la aprobación.
- Auditoría de repositorios a partir de una única URL de GitHub, con clonado superficial.
- Generación de informes PDF de auditoría y corrección con diff antes/después y telemetría en vivo.
- Integración con la API REST de GitHub y Git para commit y creación de PR.
- Salidas JSON estructuradas con validación y reparación automática.
- Interfaz web en Streamlit con modo de agente en vivo o demo guionizada sin llamadas a API.
- No se documentan capacidades de visión, audio, tool calling genérico ni multilingüismo más allá de lo que ofrezca el LLM subyacente.

## Casos de uso

- Corrección automatizada de issues en repositorios Python: el agente ingiere el issue, escribe un test que falla, propone un parche y lo valida ejecutando la suite en un sandbox Docker aislado, lo que permite delegar tareas de mantenimiento repetitivas con revisión humana final.
- Auditoría de seguridad y calidad de un repositorio a partir de su URL: el flujo de auditoría de URL única escanea todos los ficheros en busca de defectos, muestra un diff antes/después y genera un informe PDF imprimible, útil para revisiones previas a una release.
- Integración en pipelines de CI/CD: el agente puede ejecutarse tras un fallo de tests para generar un parche candidato y un test de reproducción, que se revisan antes de fusionarse mediante la compuerta de aprobación.
- Formación y revisión de código: el modo demo guionizado permite mostrar el ciclo completo de reproducción, parche y validación sin consumir API, adecuado para talleres y sesiones de revisión.
- Gestión de PRs asistida: tras la aprobación humana, el nodo `commit_and_pr` usa la API REST de GitHub para crear la rama y el PR con el parche validado.
- Despliegue en infraestructura de bajo coste: los scripts de `deploy/` aprovisionan una instancia EC2 con Docker, CloudFront para HTTPS, S3, DynamoDB y Lambda, lo que permite operar el agente en el tier gratuito de AWS.
- Experimentación con orquestación de agentes: el estado tipado, los enrutadores condicionales puros y el checkpointing con `PostgresSaver` sirven como referencia para construir agentes con human-in-the-loop en LangGraph.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio no requiere GPU local para el LLM: la inferencia se delega a la API de Groq (`openai/gpt-oss-120b`).
- Para el sandbox Docker se recomienda una máquina con daemon Docker operativo; los límites de memoria, CPU y PID son configurables en `DockerSandbox`.
- En ausencia de Docker (por ejemplo, Streamlit Community Cloud), `LocalSandbox` ejecuta los tests como subproceso con limpieza de secretos y terminación por tiempo de espera.
- El despliegue de referencia usa una instancia EC2 del tier gratuito de AWS con Docker, más CloudFront, S3, DynamoDB y Lambda.
- No se documentan latencia ni throughput; el rendimiento está acotado por el límite de 8K tokens por minuto del tier gratuito de Groq y por el límite de 8 iteraciones de corrección.
- Opciones de despliegue documentadas: Streamlit local (`streamlit run src/ui/streamlit_app.py`), Streamlit Community Cloud, Docker (`Dockerfile`, `docker-compose.yml`) y AWS vía los scripts de `deploy/`.

## Comparativa con modelos similares

| Proyecto | Tipo | Motor LLM | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MF180/autonomous-bug-fixing-agent | Agente de corrección de bugs en Python | `openai/gpt-oss-120b` vía Groq | no disponible | no disponible | Hugging Face, demo en Streamlit Cloud y AWS |
| SWE-agent | Agente de resolución de issues | Configurable | no disponible | no disponible | Open source |
| Aider | Asistente de edición de código en terminal | Configurable | no disponible | no disponible | Open source |
| OpenHands | Agente de desarrollo autónomo | Configurable | no disponible | no disponible | Open source |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a la categoría funcional y a la disponibilidad.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; depende por completo de la API externa de Groq y de la disponibilidad de `openai/gpt-oss-120b`.
- La licencia no está declarada en la información disponible, lo que impide confirmar si el uso comercial está permitido.
- El límite de 8K tokens por minuto del tier gratuito de Groq restringe el tamaño de los contextos y obliga a podar el historial y truncar salidas del sandbox.
- El límite duro de 8 iteraciones de corrección puede ser insuficiente para bugs complejos o que requieran cambios en múltiples ficheros.
- El sandbox local (`LocalSandbox`) ofrece un aislamiento menor que Docker; en entornos sin daemon Docker el riesgo de ejecución de código no confiable aumenta.
- El agente puede generar parches incorrectos o tests de reproducción que no capturen el fallo real; la compuerta de aprobación humana es obligatoria antes de cualquier commit.
- Riesgo de alucinación inherente al LLM subyacente en la interpretación del issue y en la propuesta de parches.
- No se documentan sesgos, cobertura idiomática ni comportamiento multilingüe del agente.
- La demo pública en AWS y Streamlit Cloud expone una instancia operativa; su disponibilidad y seguridad no están garantizadas para uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MF180/autonomous-bug-fixing-agent
- Demo en Streamlit Cloud: https://autonomous-bug-fixing-agent.streamlit.app
- Demo en AWS CloudFront: https://d3gctx9v0f6g4u.cloudfront.net
- Demo en AWS (IP directa): http://98.89.45.201
- Especificación de arquitectura: SPEC.md en el repositorio
- Código del agente: `src/agent/` (state.py, llm.py, prompts.py, nodes.py, graph.py)
- Sandbox: `src/sandbox/` (base.py, docker_runner.py, local_runner.py, factory.py, Dockerfile)
- Herramientas: `src/tools/` (file_tools.py, git_tools.py)
- Interfaz y informes: `src/ui/` (streamlit_app.py, mock_graph.py, report_pdf.py)
- Scripts de despliegue: `deploy/` (cloudshell_deploy.sh, ec2_userdata.sh)
- Repositorio de código referenciado en los scripts: https://github.com/farazmalik180/autonomous-bug-fixing-agent
