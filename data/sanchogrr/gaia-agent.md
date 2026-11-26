# sanchogrr/gaia-agent

## Resumen

`sanchogrr/gaia-agent` es un repositorio publicado en Hugging Face que contiene el entregable final de la Unidad 4 del curso de agentes de Hugging Face. No se trata de un modelo de lenguaje entrenado desde cero, sino de un agente construido con LangGraph que implementa el patron ReAct y que delega la generacion de texto en un modelo externo de Google, `gemini-3.5-flash-lite`, accedido a traves de su API. El repositorio incluye el codigo del grafo, las herramientas y el prompt (`agent.py`), un runner de Gradio (`app.py`) y una interfaz de depuracion paso a paso (`debug_ui.py`).

El agente esta orientado a resolver tareas del benchmark GAIA, que combina razonamiento multi-paso con uso de herramientas externas. Para ello incorpora busqueda web, lectura de paginas web, consultas a Wikipedia (incluidas revisiones historicas), ejecucion de codigo Python, lectura de ficheros (xlsx, csv y texto) y analisis multimodal de medios (imagenes, audio y videos de YouTube).

La relevancia de este repositorio es fundamentalmente didactica y de referencia: muestra como orquestar un agente ReAct con LangGraph sobre un LLM comercial, con un conjunto amplio de herramientas y una interfaz de depuracion de trayectorias. No aporta pesos propios ni un modelo entrenado, por lo que no debe evaluarse como un modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente ReAct implementado con LangGraph; el LLM subyacente es `gemini-3.5-flash-lite` (API externa) |
| Parametros totales | no disponible (no se publican pesos; el modelo subyacente es propietario) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende de la API de Gemini) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de codigo, sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. La arquitectura es la de un agente ReAct orquestado con LangGraph: un grafo de estados que alterna pasos de razonamiento y llamadas a herramientas, con el LLM `gemini-3.5-flash-lite` como motor de decision. Las herramientas disponibles cubren busqueda web, lectura de paginas, Wikipedia con acceso a revisiones historicas, ejecucion de Python, lectura de ficheros xlsx/csv/texto y analisis multimodal de imagenes, audio y videos de YouTube.

No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO), porque el modelo subyacente es propietario y el repositorio solo contiene codigo de orquestacion. La innovacion tecnica destacable es la integracion de un conjunto heterogeneo de herramientas (incluida multimodalidad y ejecucion de codigo) bajo un unico grafo ReAct, junto con una UI de depuracion (`debug_ui.py`) que permite inspeccionar las trayectorias del agente paso a paso.

## Capacidades

- Razonamiento multi-paso mediante el patron ReAct con LangGraph.
- Busqueda web y lectura de paginas web como fuentes de informacion.
- Consultas a Wikipedia, incluyendo revisiones historicas de articulos.
- Ejecucion de codigo Python para calculos y manipulacion de datos.
- Lectura de ficheros en formato xlsx, csv y texto.
- Analisis multimodal de imagenes, audio y videos de YouTube.
- Uso de herramientas (tool calling) orquestado por el LLM subyacente.
- Interfaz CLI local, runner de Gradio y UI de depuracion de trayectorias.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada.

## Casos de uso

- Resolucion de tareas del benchmark GAIA: el agente encadena busqueda web, lectura de paginas y ejecucion de Python para responder preguntas que requieren varios pasos y fuentes externas.
- Investigacion documental asistida: combinando busqueda web y Wikipedia con revisiones historicas, permite reconstruir el estado de un articulo en una fecha concreta y contrastarlo con fuentes actuales.
- Analisis de datos tabulares: la herramienta de lectura de xlsx/csv junto con la ejecucion de Python permite cargar un fichero, calcular agregados y responder preguntas sobre su contenido.
- Procesamiento de contenido multimedia: el analisis de imagenes, audio y videos de YouTube sirve para extraer informacion de materiales no textuales dentro de un flujo de preguntas y respuestas.
- Prototipado de agentes para docencia: el repositorio sirve como plantilla funcional de un agente ReAct con LangGraph, util para cursos y experimentos de orquestacion de herramientas.
- Depuracion de trayectorias de agentes: `debug_ui.py` permite inspeccionar paso a paso las decisiones del agente, util para diagnosticar fallos en cadenas de razonamiento y herramientas.
- Automatizacion de tareas de escritorio con CLI: `agent.py` incluye un runner local que permite lanzar consultas desde terminal en flujos de trabajo de desarrollador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se requiere VRAM para pesos locales: el repositorio no distribuye pesos y delega la inferencia en la API de `gemini-3.5-flash-lite`.
- El coste computacional local se limita a la orquestacion LangGraph y a la ejecucion de Python y de las herramientas.
- GPU recomendadas: no aplica para el LLM; cualquier maquina capaz de ejecutar Python y LangGraph es suficiente.
- Cabe en cualquier equipo de desarrollo convencional, incluidos portatiles sin GPU dedicada.
- Opciones de despliegue: ejecucion local via CLI (`agent.py`) o interfaz Gradio (`app.py`); no aplican vLLM, llama.cpp, Ollama ni TGI al no haber pesos.
- Latencia y throughput: no disponibles; dependen de la latencia de la API de Gemini y de las llamadas a las herramientas externas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sanchogrr/gaia-agent | Agente ReAct sobre API (LangGraph) | no disponible | no disponible | no disponible | Hugging Face (codigo) |
| Alternativas de agente ReAct open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo entrenado: el repositorio contiene codigo de agente, no pesos; no puede ejecutarse sin acceso a la API de `gemini-3.5-flash-lite`.
- Dependencia de un proveedor externo: la disponibilidad, el coste y los limites de uso dependen de la API de Google.
- Licencia no especificada: no se indica licencia, lo que impide determinar si el uso comercial es posible.
- Idiomas soportados no declarados: no hay garantia documentada de comportamiento multilingue.
- Riesgo de alucinacion heredado del LLM subyacente, agravado por la combinacion de multiples fuentes externas.
- Las herramientas de busqueda web y lectura de paginas introducen dependencia de servicios de terceros y posibles fallos de red.
- La ejecucion de codigo Python y la lectura de ficheros requieren medidas de sandboxing en produccion.
- Proyecto didactico: no hay evidencia de validacion en produccion ni de benchmarks publicados.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/sanchogrr/gaia-agent
- Curso de agentes de Hugging Face (contexto del entregable): no disponible en la informacion proporcionada.
- Benchmark GAIA: no disponible en la informacion proporcionada.
- Documentacion de LangGraph: no disponible en la informacion proporcionada.
