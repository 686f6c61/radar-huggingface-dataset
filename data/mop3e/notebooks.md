# mop3e/notebooks

## Resumen

El repositorio `mop3e/notebooks` no es un modelo de lenguaje, sino una coleccion de cuadernos Jupyter (notebooks) educativos. Su contenido corresponde al material practico del curso de agentes de Hugging Face (Hugging Face Agents Course), que ensena a construir agentes basados en LLM utilizando librerias como smolagents, LlamaIndex y LangGraph. El autor del repositorio es el usuario `mop3e`, que actua como espejo o copia del repositorio oficial `agents-course/notebooks`.

El contenido cubre desde una introduccion a las bibliotecas de agentes (Unit 1) hasta la implementacion de agentes de codigo, agentes multiagente, agentes de recuperacion (RAG), agentes con tool calling, agentes de vision y flujos de trabajo con LangGraph. Tambien incluye unidades bonus sobre ajuste fino (SFT) de Gemma con thinking function calling y sobre monitorizacion y evaluacion de agentes.

Dado que no se trata de un modelo entrenado, no dispone de arquitectura, parametros, contexto ni pesos. La ficha se limita a documentar el repositorio como artefacto educativo, indicando explicitamente los datos no disponibles. Es relevante para desarrolladores que quieran aprender a construir agentes con LLM y para quienes busquen material de referencia practico sobre smolagents, LlamaIndex y LangGraph.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; repositorio de notebooks) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene archivos `.ipynb` y `.py`) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado ni pesos. Se trata de un conjunto de cuadernos Jupyter y scripts Python que documentan patrones de construccion de agentes: agentes de codigo (code agents), agentes multiagente, agentes de recuperacion, agentes con tool calling, agentes de vision y flujos con LangGraph. El contenido incluye ademas una unidad bonus sobre ajuste fino supervisado (SFT) de Gemma con thinking function calling, y otra sobre monitorizacion y evaluacion de agentes.

No hay informacion sobre datos de entrenamiento, tokens, composicion del dataset ni tecnicas de RLHF/DPO, porque no se entrena ningun modelo en este repositorio.

## Capacidades

- Proporciona cuadernos ejecutables para aprender a construir agentes basados en LLM.
- Cubre la libreria smolagents: agentes de codigo, agentes multiagente, agentes de recuperacion, tool calling, herramientas y agentes de vision.
- Incluye ejemplos con LlamaIndex: agentes, componentes, herramientas y workflows.
- Incluye ejemplos con LangGraph: agente basico y clasificacion de correo (mail sorting).
- Incluye una unidad bonus sobre ajuste fino supervisado (SFT) de Gemma con thinking function calling.
- Incluye una unidad bonus sobre monitorizacion y evaluacion de agentes.
- No implementa capacidades de generacion de texto, razonamiento, codigo ni vision por si mismo; esas capacidades dependen de los LLM que se invoquen desde los notebooks.

## Casos de uso

- Formacion de desarrolladores en agentes LLM: los notebooks de la Unit 1 y Unit 2 permiten seguir paso a paso la construccion de un agente desde cero, ejecutando el codigo en local o en Colab.
- Prototipado de agentes de codigo: el notebook `code_agents.ipynb` de smolagents sirve como plantilla para construir agentes que generan y ejecutan codigo Python de forma controlada.
- Orquestacion multiagente: el notebook `multiagent_notebook.ipynb` muestra como coordinar varios agentes especializados para resolver tareas compuestas.
- Implementacion de RAG con agentes: el notebook `retrieval_agents.ipynb` ejemplifica como combinar recuperacion de documentos con un agente que decide cuando consultar la base de conocimiento.
- Integracion de tool calling: el notebook `tool_calling_agents.ipynb` demuestra como definir herramientas y permitir que el LLM las invoque de forma estructurada.
- Agentes de vision: los notebooks `vision_agents.ipynb` y `vision_web_browser.py` muestran como construir agentes que interpretan capturas de pantalla y navegan por la web.
- Flujos con LangGraph: el notebook `mail_sorting.ipynb` sirve como ejemplo de clasificacion y enrutado de correo mediante un grafo de estados.
- Evaluacion y monitorizacion: la unidad bonus 2 proporciona patrones para instrumentar agentes y medir su comportamiento en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica para el repositorio en si: los notebooks se ejecutan en cualquier maquina con Python y Jupyter, o en Google Colab.
- Los requisitos de hardware dependen del LLM que se invoque desde los notebooks (por ejemplo, modelos servidos via API o modelos locales).
- Para ejecutar los ejemplos con modelos locales se necesitara hardware acorde al modelo elegido; no se especifica ninguno en la informacion disponible.
- Opciones de despliegue: Jupyter Notebook, JupyterLab, Google Colab o cualquier entorno compatible con `.ipynb`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Licencia | Disponibilidad |
|---|---|---|---|
| `mop3e/notebooks` | Copia de los notebooks del Hugging Face Agents Course | Apache 2.0 | Hugging Face |
| `agents-course/notebooks` | Repositorio oficial del Hugging Face Agents Course | no disponible en la informacion | Hugging Face |
| `huggingface/smolagents` | Libreria de agentes de Hugging Face | Apache 2.0 | GitHub / PyPI |

No se dispone de datos de rendimiento para comparar, ya que no se trata de modelos de lenguaje.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni procesa entradas por si mismo.
- El repositorio parece ser una copia no oficial del repositorio `agents-course/notebooks`; conviene verificar que el contenido este actualizado respecto al original.
- Los notebooks pueden contener dependencias de versiones concretas de librerias (smolagents, LlamaIndex, LangGraph) que queden obsoletas con el tiempo.
- No se especifican idiomas soportados ni sesgos, al no tratarse de un modelo entrenado.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y atribucion.
- No se han publicado resultados de evaluacion ni benchmarks sobre el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mop3e/notebooks
- Repositorio oficial del curso: https://huggingface.co/agents-course/notebooks
- Curso de agentes de Hugging Face: https://huggingface.co/learn/agents-course/unit0/introduction
