# Idun/notebooks

## Resumen

`Idun/notebooks` no es un modelo de inteligencia artificial, sino un repositorio de cuadernos Jupyter alojado en Hugging Face. Concretamente, contiene una copia de los notebooks del curso de agentes de Hugging Face (Hugging Face Agents Course), publicada por el usuario Idun bajo licencia Apache-2.0. No hay pesos, no hay arquitectura de red neuronal y no hay proceso de entrenamiento asociado: el artefacto es material didáctico en formato `.ipynb` y un script `.py`.

El repositorio se organiza en unidades temáticas que cubren desde una librería de agentes mínima (Unit 1) hasta frameworks de orquestación como smolagents, LlamaIndex y LangGraph (Unit 2), además de unidades bonus sobre fine-tuning de Gemma con function calling y sobre monitorización y evaluación de agentes. Los enlaces de la tabla de índices apuntan al repositorio `agents-course/notebooks` de la organización del curso, no a rutas propias.

Su relevancia es, por tanto, documental y formativa: sirve como punto de entrada para desarrolladores que quieren aprender a construir agentes con tool calling, agentes de código, agentes de recuperación (RAG) y sistemas multiagente. Cualquier evaluación de tipo «modelo» (parámetros, contexto, benchmarks) no aplica y se marca como no disponible a lo largo de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio no contiene un modelo neuronal, sino cuadernos Jupyter (`.ipynb`) y un script (`.py`) |
| Parametros totales | No aplica / no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible |
| Tipos de cuantizacion | No aplica / no disponible |
| Idiomas soportados | No disponible (la model card no declara idiomas; el contenido de los notebooks está redactado en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible: no hay pesos; los artefactos son `.ipynb` y `.py` |

Otros metadatos del repositorio: identificador `Idun/notebooks`, autor `Idun`, pipeline no disponible, 0 descargas, 0 likes, creado el 2026-10-22T17:03:59Z y actualizado en la misma marca temporal (sin actualizaciones posteriores).

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni entrenamiento. El contenido es un conjunto de cuadernos didácticos que, según el índice de la model card, incluye: Unit 1 (Dummy Agent Library), Unit 2.1 con smolagents (Code Agents, Multi-agent Notebook, Retrieval Agents, Tool Calling Agents, Tools, Vision Agents y el script Vision Web Browser), Unit 2.2 con LlamaIndex (Agents, Components, Tools, Workflows), Unit 2.3 con LangGraph (Agent, Mail Sorting), Bonus Unit 1 (Gemma SFT & Thinking Function Call) y Bonus Unit 2 (Monitoring & Evaluating Agents).

La innovación técnica, si se puede llamar así, es pedagógica: los notebooks muestran patrones de implementación de agentes (bucles de razonamiento-acción, definición de herramientas, orquestación multiagente, flujos con estado) sobre frameworks concretos. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO, porque no hay modelo entrenado en este repositorio.

## Capacidades

- No es un modelo: no genera texto, no razona y no ejecuta inferencia por sí mismo.
- El material cubre la construcción de agentes de código (code agents) con smolagents.
- Cubre agentes con tool calling / function calling, incluida la definición y exposición de herramientas.
- Cubre agentes de recuperación (retrieval agents) para patrones RAG.
- Cubre sistemas multiagente y orquestación entre agentes.
- Cubre agentes con capacidades de visión, incluido un navegador web controlado por visión.
- Cubre flujos de trabajo con estado y enrutado mediante LangGraph (por ejemplo, clasificación de correo).
- Cubre pipelines y componentes de LlamaIndex (agents, tools, workflows).
- Incluye una unidad bonus sobre fine-tuning de Gemma con función de pensamiento y function calling.
- Incluye una unidad bonus sobre monitorización y evaluación de agentes.
- Capacidades multilingües, de audio o multimodales del propio repositorio: no disponible.

## Casos de uso

- Formación interna de equipos de desarrollo: usar los notebooks como temario guiado para que un equipo aprenda a construir agentes con tool calling, partiendo de la Unit 1 y avanzando hasta LangGraph, sin necesidad de montar material propio.
- Prototipado rápido de un agente de código: la Unit 2.1 (Code Agents) sirve como plantilla para un agente que escribe y ejecuta código en un entorno controlado, reutilizable como base de un asistente interno de automatización.
- Implementación de un agente RAG sobre documentación corporativa: el notebook de Retrieval Agents proporciona el esqueleto para conectar un modelo con un índice vectorial y responder con citas de fuentes.
- Diseño de un sistema multiagente para tareas divididas: el Multi-agent Notebook y los workflows de LlamaIndex sirven para repartir tareas (búsqueda, cálculo, redacción) entre agentes especializados con un orquestador.
- Automatización de clasificación y enrutado de correo: el notebook Mail Sorting con LangGraph es una referencia directa para construir un clasificador con estado y reglas de derivación en un flujo de trabajo real.
- Evaluación y observabilidad de agentes en producción: la Bonus Unit 2 aporta patrones para instrumentar trazas, medir pasos y detectar fallos en cadenas de agentes antes de desplegarlas.
- Ajuste de un modelo pequeño para function calling: la Bonus Unit 1 documenta el proceso de SFT sobre Gemma con salida de pensamiento, útil como receta para adaptar un modelo abierto a un esquema de herramientas propio.
- Agente con visión para navegación web: el script Vision Web Browser puede adaptarse a tareas de extracción de datos en sitios sin API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Al no tratarse de un modelo, no existen métricas de MMLU, HumanEval, GSM8K ni equivalentes asociadas a este repositorio. Tampoco se documentan métricas de latencia o throughput del material.

## Requisitos de hardware

- No aplica al repositorio en sí: no hay pesos que cargar ni VRAM estimada para el artefacto.
- Requisitos de ejecución del material: un entorno Jupyter (local, JupyterLab o Google Colab) con Python y las dependencias de cada unidad (`smolagents`, `llama-index`, `langgraph`, entre otras), no detalladas en la model card.
- VRAM: no disponible. Depende por completo del modelo que cada notebook invoque; la model card no fija ningún modelo concreto ni tamaño.
- GPU recomendadas: no disponible por la misma razón. Muchos cuadernos de agentes funcionan con modelos servidos por API, en cuyo caso no se requiere GPU local.
- Si cabe en GPU de consumo: no disponible; depende del modelo elegido por el usuario al ejecutar los notebooks.
- Opciones de despliegue: no aplica (no hay servidor de inferencia). Para el material, cualquier entorno Jupyter es suficiente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Repositorio | Tipo de artefacto | Contenido | Licencia | Descargas / likes |
|---|---|---|---|---|
| `Idun/notebooks` | Cuadernos Jupyter y un script | Índice de 17 notebooks + 1 `.py` del Agents Course | Apache-2.0 | 0 / 0 |
| `agents-course/notebooks` | Cuadernos Jupyter | Repositorio de referencia al que apuntan todos los enlaces de la model card | no disponible en la informacion proporcionada | no disponible |
| Modelos de agentes open source comparables | Pesos de modelo | No disponible | No disponible | No disponible |

No se dispone de datos de otros repositorios didácticos equivalentes en la información proporcionada, por lo que la comparativa se limita al repositorio de origen del curso. Este repositorio no es comparable con modelos de lenguaje: la comparación relevante sería con material formativo, y no hay datos públicos en la información disponible.

## Limitaciones y advertencias

- No es un modelo: no se puede descargar, cargar con `transformers`, `vLLM` o `llama.cpp`, ni usar para inferencia. Cualquier expectativa de ese tipo es un error de interpretación del repositorio.
- Contenido duplicado: los enlaces del índice apuntan a `agents-course/notebooks`, por lo que este repositorio parece una copia o espejo del material oficial; puede quedar desactualizado respecto al original.
- Licencia: el repositorio declara Apache-2.0, pero el material subyacente pertenece al curso de Hugging Face y puede estar sujeto a sus propios términos; conviene verificar antes de un uso comercial o de redistribución masiva.
- Adopción nula verificable: 0 descargas y 0 likes, sin actualizaciones desde su creación; no hay evidencia de validación por parte de la comunidad.
- Fechas atípicas: la marca de creación (2026-10-22) es posterior a la fecha habitual de consulta y puede indicar un artefacto de prueba o un error de metadatos; no debe tomarse como referencia de mantenimiento activo.
- Idiomas no declarados: la model card no especifica idiomas soportados y el contenido está en inglés; no hay traducción al castellano.
- Dependencias externas: varios notebooks requieren claves de API de terceros o servicios gestionados, con coste y con implicaciones de privacidad si se procesan datos reales.
- Riesgo de alucinación y sesgos: no aplica al repositorio, pero sí a los modelos que se invoquen al ejecutar los notebooks; el material no incluye por sí mismo salvaguardas de producción.
- Sin benchmarks ni métricas: no hay forma de evaluar calidad técnica del contenido a partir de la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Idun/notebooks
- Curso de agentes de Hugging Face (referencia de la model card): https://huggingface.co/learn/agents-course/unit0/introduction
- Repositorio de notebooks del curso: https://huggingface.co/agents-course/notebooks
- Unit 1, Dummy Agent Library: https://huggingface.co/agents-course/notebooks/blob/main/unit1/dummy_agent_library.ipynb
- Unit 2.1, Code Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/code_agents.ipynb
- Unit 2.1, Multi-agent Notebook: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/multiagent_notebook.ipynb
- Unit 2.1, Retrieval Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/retrieval_agents.ipynb
- Unit 2.1, Tool Calling Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tool_calling_agents.ipynb
- Unit 2.1, Tools: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tools.ipynb
- Unit 2.1, Vision Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_agents.ipynb
- Unit 2.1, Vision Web Browser: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_web_browser.py
- Unit 2.2, LlamaIndex Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/agents.ipynb
- Unit 2.2, LlamaIndex Components: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/components.ipynb
- Unit 2.2, LlamaIndex Tools: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/tools.ipynb
- Unit 2.2, LlamaIndex Workflows: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/workflows.ipynb
- Unit 2.3, LangGraph Agent: https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/agent.ipynb
- Unit 2.3, LangGraph Mail Sorting: https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/mail_sorting.ipynb
- Bonus Unit 1, Gemma SFT & Thinking Function Call: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit1/bonus-unit1.ipynb
- Bonus Unit 2, Monitoring & Evaluating Agents: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit2/monitoring-and-evaluating-agents.ipynb

Nota: las búsquedas web realizadas devolvieron resultados no relacionados con este repositorio (casos de estudio de Google Cloud, una entrada de blog de Idun Group sobre Gemini, una startup danesa de audio y un perfil de LinkedIn). No se han incluido como fuentes por no aportar información verificable sobre `Idun/notebooks`.
