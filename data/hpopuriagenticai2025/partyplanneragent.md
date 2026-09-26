# hpopuriAgenticAI2025/PartyPlannerAgent

## Resumen

`hpopuriAgenticAI2025/PartyPlannerAgent` es un repositorio publicado en Hugging Face cuyo contenido no es un modelo de lenguaje con pesos entrenados, sino una coleccion de cuadernos (notebooks) vinculados al curso de agentes de Hugging Face. La model card consiste integramente en un indice de notebooks organizados por unidades, con enlaces al repositorio oficial `huggingface.co/agents-course/notebooks`. No se declara arquitectura, numero de parametros, tokenizador, ventana de contexto ni formato de pesos en la informacion disponible.

El repositorio se publica bajo licencia Apache 2.0 y esta etiquetado con `region:us`, sin pipeline declarado, sin idiomas declarados y con cero descargas y cero "likes" en el momento de la consulta. Las fechas de creacion y actualizacion registradas son el 26 de septiembre de 2026, con apenas un segundo de diferencia entre ambas, lo que sugiere una subida automatizada o de prueba mas que un artefacto mantenido.

Por tanto, su relevancia actual es exclusivamente documental y educativa: sirve como indice de material practico sobre construccion de agentes con smolagents, LlamaIndex y LangGraph, incluyendo agentes de codigo, agentes con tool calling, agentes de recuperacion (RAG) y agentes con vision. Cualquier evaluacion de rendimiento, capacidad o requisitos de hardware queda fuera del alcance de los datos disponibles, porque el repositorio no incluye artefactos de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene notebooks, no pesos) |
| Autor | hpopuriAgenticAI2025 |
| Pipeline declarado | no disponible |
| Etiquetas | `license:apache-2.0`, `region:us` |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-26 |
| Fecha de actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura. No se declara si el artefacto emplea un transformer, una mezcla de expertos (MoE), un modelo de espacio de estados (SSM) o una arquitectura hibrida, ni se indica numero de capas, dimensiones ocultas, mecanismo de atencion o estrategia de decodificacion.

Tampoco existe informacion sobre entrenamiento: no se especifica volumen de tokens, composicion del dataset, uso de ajuste supervisado (SFT), RLHF, DPO u otra tecnica de alineamiento. La model card se limita a listar cuadernos del curso de agentes de Hugging Face y no describe ningun proceso de entrenamiento ni innovacion tecnica asociada al repositorio.

## Capacidades

- El repositorio no declara capacidades de generacion de texto, razonamiento, codigo, matematicas o vision propias, al no incluir pesos de modelo.
- Cubre, como material didactico, la construccion de agentes basados en codigo (code agents) mediante smolagents.
- Cubre la construccion de agentes con tool calling, es decir, invocacion estructurada de funciones y herramientas externas.
- Cubre agentes multiagente, con coordinacion entre varios agentes para resolver una tarea.
- Cubre agentes de recuperacion (retrieval agents), orientados a flujos de generacion aumentada por recuperacion.
- Cubre agentes con vision, incluyendo un ejemplo de navegador web guiado visualmente.
- Cubre la integracion con LlamaIndex (agentes, componentes, herramientas y flujos de trabajo) y con LangGraph (agentes y clasificacion de correo).
- Incluye una unidad adicional sobre ajuste fino de Gemma con funcion de pensamiento y tool calling, y otra sobre monitorizacion y evaluacion de agentes.
- Soporte multilingue: no disponible.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Formacion practica en agentes basados en codigo: un desarrollador puede seguir el cuaderno de code agents para entender como un modelo genera y ejecuta codigo Python como accion dentro de un bucle de agente, sin necesidad de definir un esquema JSON de herramientas.
- Implementacion de tool calling en produccion: el cuaderno de tool calling agents sirve como plantilla para conectar un modelo a APIs externas mediante esquemas de funciones, patron reutilizable en asistentes que consultan bases de datos o servicios internos.
- Orquestacion de sistemas multiagente: el cuaderno de multiagente ilustra como repartir una tarea compleja entre agentes especializados con un agente coordinador, util como base para pipelines de automatizacion de back-office.
- Construccion de asistentes con recuperacion documental: el cuaderno de retrieval agents muestra como combinar un indice vectorial con un agente, patron aplicable a buscadores internos de documentacion tecnica o politica corporativa.
- Automatizacion con LlamaIndex: los cuadernos de agentes, componentes, herramientas y workflows permiten montar pipelines de indexacion y consulta sobre fuentes de datos heterogeneas con trazabilidad de pasos.
- Flujos con estado mediante LangGraph: el ejemplo de clasificacion de correo (mail sorting) sirve de referencia para construir grafos de decision con estado persistente, aplicables a triaje de tickets o enrutado de solicitudes.
- Ajuste fino orientado a agentes: la unidad adicional sobre Gemma con funcion de pensamiento y tool calling ofrece una guia para adaptar un modelo pequeno a tareas de invocacion de herramientas.
- Evaluacion y monitorizacion de agentes: la unidad adicional sobre monitorizacion y evaluacion proporciona criterios para medir fiabilidad, coste y latencia de un agente antes de llevarlo a produccion.

En todos los casos, el repositorio aporta el material de partida, no el modelo: el usuario debe aportar su propio modelo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Comparativa con modelos similares

No disponible. El repositorio no contiene un modelo evaluable, por lo que no procede comparar parametros, contexto o rendimiento con alternativas de la misma categoria. Como referencia del ecosistema que si aparece citado en la model card, se recogen las tres librerias de agentes cubiertas por los cuadernos:

| Herramienta | Enfoque principal | Aparicion en el repositorio |
|---|---|---|
| smolagents | Agentes ligeros, con soporte de code agents y tool calling | Unidad 2.1, siete cuadernos |
| LlamaIndex | Agentes y flujos sobre indices de datos | Unidad 2.2, cuatro cuadernos |
| LangGraph | Grafos de agentes con estado | Unidad 2.3, dos cuadernos |

Esta tabla describe librerias de orquestacion, no modelos, y no implica comparacion de rendimiento.

## Requisitos de hardware

- VRAM para inferencia: no disponible, al no existir pesos en el repositorio.
- GPU recomendadas: no disponible por el mismo motivo; la eleccion dependera del modelo que el usuario conecte a los cuadernos.
- Ejecucion en GPU de consumo: no disponible. Los cuadernos pueden ejecutarse en un entorno local, pero el requisito real de VRAM lo impone el modelo de inferencia seleccionado, no el repositorio.
- Opciones de despliegue: no disponible. El repositorio no documenta integracion con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponible.
- Requisito minimo verificable: un entorno capaz de ejecutar Jupyter y de instalar las dependencias de smolagents, LlamaIndex o LangGraph, mas acceso a un modelo de inferencia (local o remoto) para que los agentes funcionen.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador ni configuracion de modelo; no es desplegable como modelo de lenguaje.
- La model card es un indice de cuadernos y no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion: no evaluable, ya que no hay modelo subyacente que analizar.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: Apache 2.0, permisiva y apta para uso comercial del codigo y material del repositorio. Esta licencia no se extiende a los modelos de terceros que el usuario conecte a los cuadernos, cuyas condiciones deben verificarse por separado.
- El repositorio registra cero descargas y cero "likes", sin mantenimiento documentado, lo que reduce la garantia de soporte.
- Las fechas de creacion y actualizacion (2026-09-26, con un segundo de diferencia) indican una publicacion automatica sin curacion posterior.
- Antes de usar cualquier cuaderno en produccion, conviene revisar las dependencias de terceros y fijar versiones, dado que los enlaces apuntan a un repositorio externo que puede cambiar.

## Enlaces

- Hugging Face: https://huggingface.co/hpopuriAgenticAI2025/PartyPlannerAgent
- Curso de agentes de Hugging Face: https://huggingface.co/learn/agents-course/unit0/introduction
- Repositorio de cuadernos del curso: https://huggingface.co/agents-course/notebooks/tree/main
- Unidad 1, Dummy Agent Library: https://huggingface.co/agents-course/notebooks/blob/main/unit1/dummy_agent_library.ipynb
- Unidad 2.1, Code Agents (smolagents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/code_agents.ipynb
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
- Unidad bonus 1, Gemma SFT y thinking function call: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit1/bonus-unit1.ipynb
- Unidad bonus 2, Monitorizacion y evaluacion de agentes: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit2/monitoring-and-evaluating-agents.ipynb
