# amilin23/notebooks

## Resumen

El repositorio `amilin23/notebooks` no es un modelo de inteligencia artificial con pesos entrenados, sino una coleccion de cuadernos de Jupyter (`.ipynb`) y scripts de Python (`.py`) que reproducen el material practico del curso de agentes de Hugging Face (Hugging Face Agents Course). El autor, identificado como `amilin23`, publica este repositorio bajo licencia Apache 2.0 con el proposito de servir de indice y punto de descarga de los cuadernos empleados en las unidades del curso.

El contenido se organiza por unidades didacticas: la unidad 1 introduce una libreria de agente basica, la unidad 2 cubre las librerias smolagents, LlamaIndex y LangGraph con cuadernos sobre agentes de codigo, multiagente, recuperacion, tool calling y vision, y las unidades bonus abarcan ajuste fino supervisado (SFT) de Gemma con function calling y monitorizacion/evaluacion de agentes. Cada entrada del indice enlaza al cuaderno correspondiente alojado en el repositorio oficial `huggingface/agents-course/notebooks`.

Dado que se trata de material didactico y no de un modelo desplegable, carece de parametros, arquitectura de red, ventana de contexto o pesos. La ficha que sigue refleja esta naturaleza y marca como "no disponible" todo dato que no figure en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un repositorio de cuadernos) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica; el repositorio contiene cuadernos de Jupyter (`.ipynb`) y scripts de Python (`.py`) |

## Arquitectura y entrenamiento

No procede describir arquitectura ni proceso de entrenamiento porque el repositorio no contiene un modelo. Su contenido es una coleccion de cuadernos didacticos sobre construccion de agentes con distintas librerias: smolagents (agentes de codigo, multiagente, recuperacion, tool calling, vision y navegador web con vision), LlamaIndex (agentes, componentes, herramientas y flujos de trabajo) y LangGraph (agente y clasificacion de correo). Las unidades bonus tratan el ajuste fino supervisado de Gemma con function calling y la monitorizacion y evaluacion de agentes.

Los modelos que se invocan dentro de los cuadernos (por ejemplo, Gemma en la unidad bonus) no estan definidos en este repositorio; los cuadernos actuan como clientes o scripts de formacion que consumen modelos externos. No se especifica numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO, ya que ese trabajo corresponde a los modelos subyacentes, no a este repositorio.

## Capacidades

- Indice navegable de cuadernos del curso de agentes de Hugging Face, con enlaces a cada unidad.
- Material sobre agentes de codigo (smolagents): construccion de agentes que generan y ejecutan codigo.
- Material sobre sistemas multiagente: coordinacion entre varios agentes.
- Material sobre agentes de recuperacion (retrieval agents): integracion con bases de conocimiento.
- Material sobre tool calling y function calling.
- Material sobre agentes de vision y navegacion web guiada por vision.
- Material sobre LlamaIndex: agentes, componentes, herramientas y workflows.
- Material sobre LangGraph: construccion de agentes con grafos y un ejemplo de clasificacion de correo.
- Material bonus sobre ajuste fino supervisado (SFT) de Gemma con thinking y function calling.
- Material bonus sobre monitorizacion y evaluacion de agentes.
- No es un modelo desplegable: no realiza inferencia por si mismo.

## Casos de uso

- Formacion autodidacta en agentes: un desarrollador puede clonar el repositorio y ejecutar los cuadernos en orden para aprender a construir agentes con smolagents, LlamaIndex y LangGraph.
- Imparticion de cursos o talleres: el indice por unidades facilita preparar sesiones practicas con material ya estructurado y enlazado.
- Prototipado rapido de agentes de codigo: el cuaderno de code agents sirve como plantilla para experimentar con agentes que escriben y ejecutan codigo.
- Experimentacion con tool calling: el cuaderno de tool calling agents permite probar la integracion de funciones externas en un agente sin partir de cero.
- Pruebas de agentes multimodales: el cuaderno de vision agents y el navegador web con vision permiten experimentar con entradas de imagen.
- Evaluacion y monitorizacion de agentes: los cuadernos bonus ofrecen una base para instrumentar y medir el comportamiento de agentes en produccion.
- Ajuste fino con function calling: el cuaderno bonus de Gemma sirve de referencia para entrenar un modelo con llamadas a herramientas.
- Recuperacion aumentada: el cuaderno de retrieval agents puede reutilizarse para prototipar sistemas RAG con agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable, por lo que no aplica una tabla de metricas tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Al no contener pesos, el repositorio no impone requisitos de VRAM por si mismo; solo requiere un entorno capaz de ejecutar cuadernos de Jupyter.
- Requisitos minimos: Python con Jupyter instalado y conexion a internet para descargar dependencias y modelos externos.
- Consumo de recursos: dependera enteramente de los modelos que invoque cada cuaderno (por ejemplo, Gemma en la unidad bonus), no disponible en la informacion proporcionada.
- GPU: no especificada; los cuadernos pueden ejecutarse en CPU o GPU segun el modelo subyacente que se cargue.
- Opciones de despliegue: no aplica despliegue de modelo; el material se ejecuta como cuadernos o scripts de Python.
- Latencia y throughput: no disponibles, ya que dependen de los modelos externos utilizados.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Licencia | Disponibilidad |
|---|---|---|---|
| amilin23/notebooks | Cuadernos del curso de agentes de Hugging Face | apache-2.0 | Publico en Hugging Face |
| huggingface/agents-course/notebooks | Repositorio oficial de origen de los cuadernos | no disponible en la informacion proporcionada | Publico en Hugging Face |

No se dispone de datos de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, no genera texto ni realiza inferencia.
- El repositorio parece una copia o espejo del material oficial de `huggingface/agents-course`; conviene verificar la autoria y el estado de mantenimiento antes de reutilizarlo.
- Registra 0 descargas y 0 me gusta, lo que sugiere escasa difusion y validacion por parte de la comunidad.
- El campo de idiomas no esta declarado en la model card; el contenido esta redactado en ingles.
- La licencia apache-2.0 se aplica al repositorio de cuadernos, pero no cubre los modelos o datasets externos que los cuadernos descargan, cuyas licencias deben comprobarse por separado.
- Las fechas de creacion y actualizacion indicadas (2026-09-10) son posteriores a la fecha actual, lo que puede indicar un error de metadatos; conviene tratarlas con cautela.
- La busqueda web asociada no devolvio resultados relevantes: los enlaces recuperados tratan sobre la descarga del navegador Chrome y no guardan relacion con el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amilin23/notebooks
- Curso de agentes de Hugging Face (introduccion): https://huggingface.co/learn/agents-course/unit0/introduction
- Repositorio oficial de cuadernos del curso: https://huggingface.co/agents-course/notebooks
- Cuaderno unidad 1, Dummy Agent Library: https://huggingface.co/agents-course/notebooks/blob/main/unit1/dummy_agent_library.ipynb
- Cuaderno unidad 2.1, Code Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/code_agents.ipynb
- Cuaderno unidad 2.1, Multi-agent Notebook: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/multiagent_notebook.ipynb
- Cuaderno unidad 2.1, Retrieval Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/retrieval_agents.ipynb
- Cuaderno unidad 2.1, Tool Calling Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tool_calling_agents.ipynb
- Cuaderno unidad 2.1, Tools: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tools.ipynb
- Cuaderno unidad 2.1, Vision Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_agents.ipynb
- Script unidad 2.1, Vision Web Browser: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_web_browser.py
- Cuaderno unidad 2.2, LlamaIndex Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/agents.ipynb
- Cuaderno unidad 2.2, LlamaIndex Components: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/components.ipynb
- Cuaderno unidad 2.2, LlamaIndex Tools: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/tools.ipynb
- Cuaderno unidad 2.2, LlamaIndex Workflows: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/workflows.ipynb
- Cuaderno unidad 2.3, LangGraph Agent: https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/agent.ipynb
- Cuaderno unidad 2.3, LangGraph Mail Sorting: https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/mail_sorting.ipynb
- Cuaderno bonus 1, Gemma SFT & Thinking Function Call: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit1/bonus-unit1.ipynb
- Cuaderno bonus 2, Monitoring & Evaluating Agents: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit2/monitoring-and-evaluating-agents.ipynb
