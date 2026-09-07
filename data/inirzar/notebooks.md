# inirzar/notebooks

## Resumen

El repositorio `inirzar/notebooks` no contiene un modelo de inteligencia artificial, sino un conjunto de cuadernos (notebooks) educativos creados por el usuario `inirzar` como parte del curso de agentes de Hugging Face (Agents Course). Su finalidad es proporcionar material práctico para aprender a construir agentes con distintos frameworks, como `smolagents`, `LlamaIndex` y `LangGraph`, así como cubrir unidades adicionales sobre ajuste fino de modelos y evaluación de agentes.

Este material resulta relevante para desarrolladores e investigadores que quieran iniciarse o profundizar en el desarrollo de sistemas agénticos, especialmente en lo referente a tool calling, agentes multimodales y orquestación de múltiples agentes. No se dispone de arquitectura, parámetros, contexto ni pipeline de inferencia, ya que el contenido es exclusivamente educativo y de tipo notebook.

El repositorio está publicado bajo licencia Apache 2.0, lo que permite su uso y modificación con fines comerciales o educativos, siempre que se mantenga el aviso de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (son notebooks `.ipynb`) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado ni una arquitectura de red neuronal. Los notebooks que incluye son ejercicios prácticos del curso de agentes de Hugging Face y emplean distintos frameworks de agentes (`smolagents`, `LlamaIndex`, `LangGraph`) junto con modelos externos de Hugging Face. No hay datos de entrenamiento, técnicas de optimización ni proceso de ajuste fino propio del repositorio.

## Capacidades

- El material permite construir agentes de código con `smolagents`, incluyendo agentes que escriben y ejecutan código Python.
- Incluye ejemplos de agentes múltiples que colaboran entre sí para resolver tareas complejas.
- Proporciona notebooks sobre agentes de recuperación (retrieval agents), que combinan modelos de lenguaje con bases de conocimiento externas.
- Trabaja el concepto de tool calling, es decir, la integración de herramientas y funciones externas en el flujo de decisión del agente.
- Incluye agentes de visión que procesan imágenes y agentes de navegación web mediante visión.
- Cubre los componentes y flujos de trabajo de `LlamaIndex` para la construcción de agentes basados en datos.
- Aborda la creación de agentes con `LangGraph`, incluyendo un caso práctico de clasificación de correo.
- Incorpora una unidad adicional sobre ajuste fino (SFT) del modelo Gemma y la implementación de una función de llamada con modo de razonamiento.
- Ofrece una unidad dedicada a la monitorización y evaluación de agentes, con métricas y herramientas de seguimiento.

## Casos de uso

- Formación de equipos de desarrollo: los notebooks sirven como material de laboratorio para que equipos de ingeniería aprendan a construir agentes con frameworks actuales, combinando teoría y práctica.
- Evaluación de frameworks de agentes: permite comparar de forma práctica cómo se implementan agentes con `smolagents`, `LlamaIndex` y `LangGraph`, facilitando la elección de una tecnología para proyectos concretos.
- Implementación de tool calling: el notebook de tool calling con `smolagents` proporciona un punto de partida para integrar herramientas personalizadas en un sistema agéntico, útil en prototipos de asistentes técnicos.
- Desarrollo de agentes de visión: los notebooks de visión permiten crear agentes capaces de interpretar imágenes y actuar en consecuencia, aplicable a procesos de automatización con documentos o capturas de pantalla.
- Automatización de flujos con LangGraph: el ejemplo de clasificación de correo muestra cómo estructurar un agente con estados y transiciones, aplicable a sistemas de gestión de incidencias o de correo corporativo.
- Aprendizaje de integración de bases de conocimiento: los notebooks de recuperación y los de LlamaIndex enseñan a conectar un agente con fuentes de datos externas, útil para asistentes de consulta sobre documentación interna.
- Monitorización de agentes en producción: la unidad de evaluación proporciona criterios para medir el comportamiento de agentes, lo que resulta práctico para preparar un despliegue responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no es un modelo, por lo que no dispone de métricas de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se requieren recursos de hardware específicos para la inferencia, ya que el repositorio no contiene un modelo ejecutable.
- Para ejecutar los notebooks, se necesita un entorno de Python con las dependencias de cada framework (`smolagents`, `LlamaIndex`, `LangGraph`, `transformers`).
- Algunos notebooks requieren acceso a modelos alojados en Hugging Face, lo que puede implicar el uso de GPU si se ejecutan localmente con modelos grandes.
- Los ejemplos de visión y de ajuste fino de Gemma pueden necesitar una GPU con memoria suficiente, aunque la información no especifica modelos concretos ni requisitos mínimos.
- Las opciones de despliegue habituales para este tipo de material son entornos de Jupyter, VS Code o Google Colab.

## Comparativa con modelos similares

No disponible. Al no tratarse de un modelo de IA, no existe una comparativa directa con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje, por lo que no puede utilizarse directamente para generar texto, razonar o realizar predicciones.
- Los notebooks dependen de servicios externos y de modelos de Hugging Face, lo que puede requerir credenciales, conexión a Internet y cuotas de uso.
- El material está en inglés en su mayoría, aunque no se especifica si hay traducciones.
- La licencia Apache 2.0 permite el uso comercial, pero el contenido educativo debe mantenerse con su aviso de licencia original.
- No se garantiza que los ejemplos funcionen con versiones futuras de los frameworks, ya que las APIs pueden cambiar.
- La información sobre hardware y dependencias concretas no está disponible en la model card.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/inirzar/notebooks
- Introducción al curso de agentes: https://huggingface.co/learn/agents-course/unit0/introduction
- Notebook de Dummy Agent Library: https://huggingface.co/agents-course/notebooks/blob/main/unit1/dummy_agent_library.ipynb
- Notebook de Code Agents (smolagents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/code_agents.ipynb
- Notebook de Multi-agent (smolagents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/multiagent_notebook.ipynb
- Notebook de Retrieval Agents (smolagents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/retrieval_agents.ipynb
- Notebook de Tool Calling Agents (smolagents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tool_calling_agents.ipynb
- Notebook de Tools (smolagents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tools.ipynb
- Notebook de Vision Agents (smolagents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_agents.ipynb
- Script de Vision Web Browser (smolagents): https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_web_browser.py
- Notebook de Agents (LlamaIndex): https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/agents.ipynb
- Notebook de Components (LlamaIndex): https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/components.ipynb
- Notebook de Tools (LlamaIndex): https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/tools.ipynb
- Notebook de Workflows (LlamaIndex): https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/workflows.ipynb
- Notebook de Agent (LangGraph): https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/agent.ipynb
- Notebook de Mail Sorting (LangGraph): https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/mail_sorting.ipynb
- Notebook de Gemma SFT & Thinking Function Call: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit1/bonus-unit1.ipynb
- Notebook de Monitoring & Evaluating Agents: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit2/monitoring-and-evaluating-agents.ipynb
