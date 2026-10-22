# rnnet/notebooks

## Resumen

`rnnet/notebooks` no es un modelo de IA, sino un repositorio de cuadernos Jupyter (notebooks) publicado en Hugging Face bajo licencia Apache 2.0. Concretamente, contiene el material práctico del curso de agentes de Hugging Face (Hugging Face Agents Course), con una colección de cuadernos organizados por unidades que van desde una librería de agente mínima hasta la construcción de agentes con smolagents, LlamaIndex y LangGraph, pasando por ajuste fino supervisado (SFT) de Gemma y evaluación y monitorización de agentes.

Su relevancia es formativa, no de inferencia: no expone pesos, tokenizador ni pipeline de Hugging Face (`pipeline: no disponible`), y no tiene descargas ni likes en el momento de la consulta (0 descargas, 0 likes). El repositorio se creó el 21 de octubre de 2026 y se actualizó el mismo día, lo que sugiere un uso interno o de espejo del material del curso más que una publicación orientada a la comunidad.

Por tanto, esta ficha documenta el repositorio como artefacto técnico-educativo: se detalla qué contiene, qué frameworks cubre y para qué sirve, indicando explícitamente "no disponible" o "no aplica" en todos los campos propios de un modelo (arquitectura, parámetros, contexto, cuantizaciones, benchmarks).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo; es un repositorio de notebooks Jupyter) |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (depende del modelo que se invoque en cada notebook) |
| Tipos de cuantizacion | no aplica (no se distribuyen pesos) |
| Idiomas soportados | no disponible (el material y los comentarios están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica; el contenido son ficheros `.ipynb` y un script `.py` |
| ID en Hugging Face | rnnet/notebooks |
| Autor | rnnet |
| Pipeline declarado | no disponible |
| Etiquetas | license:apache-2.0, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-21T22:28:23Z |
| Última actualización | 2026-10-21T22:52:25Z |
| Frameworks cubiertos | smolagents, LlamaIndex, LangGraph |
| Número de cuadernos indexados | 16 (15 `.ipynb` + 1 `.py`) |

## Arquitectura y entrenamiento

No existe arquitectura de red ni proceso de entrenamiento asociado a este repositorio: es un conjunto de cuadernos didácticos. El "entrenamiento" aparece únicamente como tema tratado en la unidad bonus 1 (`bonus-unit1.ipynb`), dedicada a ajuste fino supervisado (SFT) de Gemma y a *thinking function calling*; los hiperparámetros, el volumen de tokens y la composición del dataset de ese ajuste no se detallan en la información disponible.

La estructura del material sigue una progresión pedagógica en tres bloques. El bloque smolagents (unidad 2.1) cubre agentes de código, agentes multi-agente, agentes de recuperación (RAG), agentes con tool calling, definición de herramientas, agentes de visión y un navegador web controlado por visión. El bloque LlamaIndex (unidad 2.2) cubre agentes, componentes, herramientas y flujos de trabajo (workflows). El bloque LangGraph (unidad 2.3) incluye un agente y un ejemplo aplicado de clasificación de correo. Se añaden una unidad 1 con una librería de agente mínima (*dummy agent library*) y una unidad bonus 2 sobre monitorización y evaluación de agentes. No se documentan innovaciones técnicas propias: el repositorio ejemplifica patrones de terceros.

## Capacidades

- Material didáctico ejecutable sobre construcción de agentes, no un modelo con capacidades de inferencia propias.
- Implementación de una librería de agente desde cero (unidad 1), útil para entender el bucle percepción-acción-observación sin abstracciones.
- Agentes de código (*code agents*) donde el modelo emite código Python ejecutable en lugar de llamadas JSON.
- Agentes con *tool calling* / *function calling* y definición de herramientas personalizadas.
- Orquestación multi-agente con reparto de roles y coordinación entre agentes.
- Agentes de recuperación (RAG) para responder sobre documentación externa.
- Agentes de visión y navegación web basada en capturas de pantalla.
- Flujos de trabajo con LlamaIndex (componentes, herramientas, workflows) y con LangGraph (grafos de estado, ejemplo de clasificación de correo).
- Ajuste fino supervisado de Gemma y uso de *thinking function calling*.
- Monitorización y evaluación de agentes en producción (unidad bonus 2).

## Casos de uso

- Formación interna de equipos de desarrollo: usar los cuadernos como temario práctico para que un equipo aprenda a construir agentes con smolagents, LlamaIndex y LangGraph partiendo de cero, con ejemplos ejecutables en lugar de teoría.
- Prototipado rápido de un agente con herramientas: partir de `unit2/smolagents/tool_calling_agents.ipynb` y sustituir las herramientas de ejemplo por las propias (APIs internas, bases de datos) para validar el patrón antes de escribir código de producción.
- Diseño de sistemas multi-agente: emplear `multiagent_notebook.ipynb` como plantilla para separar responsabilidades (planificador, ejecutor, verificador) y evaluar si la coordinación aporta valor frente a un único agente.
- Asistentes sobre documentación corporativa: usar `retrieval_agents.ipynb` como base para un agente RAG que consulte manuales internos, con la ventaja de que el cuaderno ya muestra cómo se conecta la recuperación con el bucle del agente.
- Automatización de tareas web: el par `vision_agents.ipynb` + `vision_web_browser.py` sirve como punto de partida para agentes que interpretan la interfaz visual de un sitio y ejecutan acciones, útil en tareas de extracción o comprobación de flujos.
- Clasificación y enrutado de correo: `langgraph/mail_sorting.ipynb` es un ejemplo directamente reutilizable para construir un clasificador de correo entrante basado en grafo de estados, con nodos de decisión explícitos.
- Ajuste fino de un modelo pequeño para *function calling*: `bonus-unit1.ipynb` documenta el flujo de SFT sobre Gemma, aplicable cuando se quiere que un modelo propio emita llamadas a herramientas con fiabilidad en lugar de depender de un modelo comercial.
- Evaluación y observabilidad de agentes: `bonus-unit2` proporciona el patrón para instrumentar un agente, registrar trazas y medir su comportamiento antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento de ningún modelo, y al no distribuir pesos ni definir un pipeline no procede comparar MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- El repositorio en sí no requiere GPU: son ficheros de texto (`.ipynb` y `.py`) que se descargan y se abren con Jupyter.
- Los requisitos reales dependen del modelo que invoque cada cuaderno. Los cuadernos de agentes con APIs remotas (smolagents, LlamaIndex, LangGraph) pueden ejecutarse solo con CPU, ya que la inferencia ocurre en el proveedor.
- El cuaderno de SFT de Gemma sí requiere acelerador: no se especifican en la información disponible ni la VRAM necesaria, ni la GPU recomendada, ni el tamaño exacto de Gemma empleado.
- Opciones de despliegue del material: JupyterLab o Jupyter Notebook local, Google Colab, Kaggle Notebooks o cualquier entorno con kernel de Python; también puede clonarse desde el repositorio `agents-course/notebooks` en GitHub.
- Latencia y throughput: no aplica al repositorio; dependen enteramente del backend de inferencia elegido en cada cuaderno.

## Comparativa con modelos similares

No procede: el artefacto no es un modelo, por lo que no existe comparación por parámetros, contexto o rendimiento. Se indica "no disponible" para alternativas comparables en la misma categoría.

| Criterio | rnnet/notebooks | Modelo de agentes típico | Modelo de propósito general típico |
|---|---|---|---|
| Naturaleza | Repositorio de notebooks | Pesos + tokenizador | Pesos + tokenizador |
| Parámetros | no aplica | no disponible | no disponible |
| Contexto | no aplica | no disponible | no disponible |
| Licencia | Apache 2.0 | no disponible | no disponible |
| Ejecutable con `transformers` | no | sí | sí |
| Descargas en Hugging Face | 0 | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo: no se puede cargar con `transformers`, `vLLM`, `llama.cpp` ni `Ollama`; cualquier intento de tratarlo como tal fallará.
- No incluye pesos, tokenizador, configuración ni model card con especificaciones de inferencia; los campos técnicos de esta ficha figuran como "no aplica" o "no disponible".
- El material está en inglés; no se declaran idiomas soportados y no hay localización al castellano.
- Depende de versiones concretas de smolagents, LlamaIndex y LangGraph; estos frameworks cambian con frecuencia y los cuadernos pueden quedar obsoletos aunque el repositorio no se actualice (la última actualización registrada es del mismo día de su creación).
- Los cuadernos que llaman a APIs externas requieren claves de API y generan coste por uso; no se documenta en la información disponible qué proveedores ni qué modelos concretos se emplean.
- Cero descargas y cero likes: no hay evidencia de revisión por parte de la comunidad ni de mantenimiento continuado.
- El ejemplo de SFT de Gemma puede requerir hardware especializado cuyo coste no se detalla; no debe asumirse que se ejecuta en portátil.
- La búsqueda web realizada no devolvió resultados relacionados con este repositorio; los enlaces encontrados eran de contenido no técnico y ajeno al modelo, por lo que se han descartado y no se incluyen.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no hay cláusulas de uso aceptable adicionales en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rnnet/notebooks
- Curso de agentes de Hugging Face (material de referencia de los cuadernos): https://huggingface.co/learn/agents-course/unit0/introduction
- Repositorio GitHub del curso: https://github.com/huggingface/agents-course
- Cuadernos en GitHub (origen de los enlaces de la model card): https://huggingface.co/agents-course/notebooks
- Unidad 1, Dummy Agent Library: https://huggingface.co/agents-course/notebooks/blob/main/unit1/dummy_agent_library.ipynb
- Unidad 2.1, Code Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/code_agents.ipynb
- Unidad 2.1, Multi-agent Notebook: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/multiagent_notebook.ipynb
- Unidad 2.1, Retrieval Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/retrieval_agents.ipynb
- Unidad 2.1, Tool Calling Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tool_calling_agents.ipynb
- Unidad 2.1, Tools: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tools.ipynb
- Unidad 2.1, Vision Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_agents.ipynb
- Unidad 2.1, Vision Web Browser: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_web_browser.py
- Unidad 2.2, LlamaIndex Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/agents.ipynb
- Unidad 2.2, LlamaIndex Components: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/components.ipynb
- Unidad 2.2, LlamaIndex Tools: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/tools.ipynb
- Unidad 2.2, LlamaIndex Workflows: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/workflows.ipynb
- Unidad 2.3, LangGraph Agent: https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/agent.ipynb
- Unidad 2.3, LangGraph Mail Sorting: https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/mail_sorting.ipynb
- Bonus Unit 1, Gemma SFT & Thinking Function Call: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit1/bonus-unit1.ipynb
- Bonus Unit 2, Monitoring & Evaluating Agents: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit2/monitoring-and-evaluating-agents.ipynb
