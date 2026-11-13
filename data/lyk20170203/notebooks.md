# lyk20170203/notebooks

## Resumen

El repositorio `lyk20170203/notebooks` no contiene un modelo de aprendizaje automatico, sino una coleccion de cuadernos Jupyter (notebooks) educativos vinculados al Hugging Face Agents Course. El autor, identificado como `lyk20170203`, publica bajo licencia Apache 2.0 un conjunto de materiales practicos que acompanan las unidades del curso oficial de agentes de Hugging Face.

El contenido cubre desde la implementacion de una libreria de agente basica (Unit 1) hasta el uso de frameworks como smolagents, LlamaIndex y LangGraph (Unit 2), ademas de unidades bonus sobre ajuste fino de Gemma con function calling y monitorizacion/evaluacion de agentes. No se trata, por tanto, de pesos entrenados ni de una arquitectura de red neuronal, sino de codigo didactico en formato `.ipynb` y `.py`.

Dado que el repositorio no incluye ningun modelo con parametros, contexto o capacidades de inferencia, las secciones tecnicas de esta ficha se limitan a documentar la ausencia de dichos datos y a describir el contenido real del repositorio. La relevancia actual es formativa: sirve como material de referencia para desarrolladores que quieran implementar agentes con tool calling, vision o recuperacion (RAG) usando el ecosistema de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un repositorio de notebooks) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los notebooks estan redactados en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene archivos `.ipynb` y `.py`) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene ningun modelo entrenado ni pesos. Se compone de cuadernos Jupyter y scripts de Python que ilustran el uso de frameworks de agentes (smolagents, LlamaIndex, LangGraph) y tecnicas de ajuste fino (Gemma SFT con function calling) y evaluacion de agentes. No hay informacion sobre datos de entrenamiento, tokens procesados ni tecnicas de alineacion (RLHF/DPO) porque no existe un proceso de entrenamiento asociado a este repositorio.

La unica innovacion tecnica documentada es de caracter pedagogico: los notebooks cubren patrones como agentes basados en codigo, agentes multi-agente, agentes de recuperacion, tool calling, agentes de vision y un navegador web con vision, ademas de monitorizacion y evaluacion de agentes. Estos patrones se implementan sobre las librerias mencionadas, no sobre un modelo propio.

## Capacidades

- No aplica: el repositorio no expone un modelo con capacidades de inferencia.
- El contenido ensena a implementar agentes con tool calling y function calling.
- Cubre agentes multi-paso y multi-agente (smolagents, LangGraph).
- Incluye agentes de recuperacion (RAG) con LlamaIndex.
- Incluye agentes de vision y un navegador web basado en vision.
- Incluye una unidad bonus sobre ajuste fino de Gemma con thinking y function calling.
- Incluye una unidad bonus sobre monitorizacion y evaluacion de agentes.

## Casos de uso

- Formacion de desarrolladores en agentes: usar los notebooks de la Unit 1 y Unit 2 para aprender a construir agentes con smolagents, LlamaIndex y LangGraph siguiendo el curso oficial de Hugging Face.
- Prototipado de agentes de codigo: reutilizar el notebook `code_agents.ipynb` como plantilla para experimentar con agentes que generan y ejecutan codigo en entornos controlados.
- Implementacion de agentes con tool calling: partir de `tool_calling_agents.ipynb` y `tools.ipynb` para integrar funciones externas en un pipeline de agentes.
- Sistemas RAG: usar `retrieval_agents.ipynb` como base para construir agentes que consultan indices vectoriales y responden con contexto recuperado.
- Agentes de vision: emplear `vision_agents.ipynb` y `vision_web_browser.py` para prototipos de automatizacion web guiada por capturas de pantalla.
- Orquestacion multi-agente: usar `multiagent_notebook.ipynb` y `langgraph/agent.ipynb` para disenar flujos con varios agentes especializados y enrutado de tareas.
- Ajuste fino de modelos para function calling: seguir `bonus-unit1.ipynb` para adaptar Gemma a tareas de thinking y llamada a funciones.
- Evaluacion y monitorizacion: aplicar `monitoring-and-evaluating-agents.ipynb` para instrumentar agentes en produccion y medir su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable, por lo que no procede comparar metricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- No aplica para el repositorio en si: ejecutar los notebooks requiere un entorno con Python y Jupyter, sin VRAM especifica.
- Los notebooks que invocan modelos (por ejemplo, los de smolagents o el ajuste fino de Gemma) heredan los requisitos del modelo concreto que se cargue en cada cuaderno; dichos requisitos no se detallan en la informacion disponible.
- Para el ajuste fino de Gemma (bonus unit 1) se necesitara GPU, pero no se especifica en el repositorio que modelo, cuantizacion ni VRAM se emplean.
- Opciones de despliegue de los notebooks: JupyterLab, Jupyter Notebook o Google Colab; no se documentan opciones de servido tipo vLLM, TGI u Ollama porque no hay modelo que servir.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo y no tiene equivalentes en la categoria de modelos de lenguaje. Como material formativo, podria compararse con otros repositorios de cursos de agentes (por ejemplo, el repositorio oficial `huggingface/agents-course`), pero no se dispone de datos de comparacion en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no debe citarse como modelo de IA ni utilizarse para inferencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una copia personal o un fork de material del curso, sin validacion comunitaria.
- Los enlaces de la model card apuntan al repositorio oficial `huggingface/agents-course/notebooks`, no a archivos alojados en este repositorio; conviene verificar que el contenido local este actualizado respecto al curso original.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el material original del curso puede tener sus propias condiciones; revise la licencia del repositorio de origen antes de redistribuir.
- Los notebooks estan en ingles; no se declaran idiomas soportados.
- No hay garantia de mantenimiento ni de compatibilidad con versiones futuras de smolagents, LlamaIndex o LangGraph.
- Riesgo de alucinacion y sesgos: no aplica al repositorio, pero los agentes construidos con los notebooks heredaran los sesgos y limitaciones de los modelos que invoquen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lyk20170203/notebooks
- Curso de agentes de Hugging Face: https://huggingface.co/learn/agents-course/unit0/introduction
- Repositorio oficial de notebooks del curso: https://huggingface.co/agents-course/notebooks
- Notebook Unit 1 (Dummy Agent Library): https://huggingface.co/agents-course/notebooks/blob/main/unit1/dummy_agent_library.ipynb
- Notebook Unit 2.1 (Code Agents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/code_agents.ipynb
- Notebook Unit 2.1 (Multi-agent): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/multiagent_notebook.ipynb
- Notebook Unit 2.1 (Retrieval Agents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/retrieval_agents.ipynb
- Notebook Unit 2.1 (Tool Calling Agents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tool_calling_agents.ipynb
- Notebook Unit 2.1 (Tools): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tools.ipynb
- Notebook Unit 2.1 (Vision Agents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_agents.ipynb
- Script Unit 2.1 (Vision Web Browser): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_web_browser.py
- Notebook Unit 2.2 (LlamaIndex Agents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/agents.ipynb
- Notebook Unit 2.2 (LlamaIndex Components): https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/components.ipynb
- Notebook Unit 2.2 (LlamaIndex Tools): https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/tools.ipynb
- Notebook Unit 2.2 (LlamaIndex Workflows): https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/workflows.ipynb
- Notebook Unit 2.3 (LangGraph Agent): https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/agent.ipynb
- Notebook Unit 2.3 (LangGraph Mail Sorting): https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/mail_sorting.ipynb
- Notebook Bonus Unit 1 (Gemma SFT & Thinking Function Call): https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit1/bonus-unit1.ipynb
- Notebook Bonus Unit 2 (Monitoring & Evaluating Agents): https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit2/monitoring-and-evaluating-agents.ipynb
