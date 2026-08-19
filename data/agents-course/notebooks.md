# agents-course/notebooks

## Resumen

El repositorio `agents-course/notebooks` no es un modelo de inteligencia artificial, sino una colección de cuadernos Jupyter y scripts Python que forman parte del Hugging Face Agents Course, un curso gratuito y abierto sobre construcción de agentes basados en modelos de lenguaje. Está mantenido por la organización `agents-course` en Hugging Face y cubre desde conceptos básicos hasta técnicas avanzadas de agencia, incluyendo frameworks como smolagents, LlamaIndex y LangGraph.

El material está diseñado para desarrolladores e investigadores que quieren aprender a implementar agentes con capacidad de razonamiento multi-paso, tool calling, visión y orquestación multi-agente. Aunque no contiene pesos ni arquitecturas de modelos, es un recurso práctico de referencia para quienes trabajan con modelos de IA open source en entornos de producción.

La relevancia de este repositorio radica en que documenta patrones de implementación reales y reproducibles, con notebooks que incluyen ejemplos de código ejecutable, lo que lo convierte en una guía útil para integrar agentes en aplicaciones concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de notebooks educativos) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles (material del curso) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (archivos .ipynb y .py) |

## Arquitectura y entrenamiento

No existe un modelo subyacente en este repositorio. Se trata de un conjunto de materiales didácticos que explican cómo construir agentes sobre modelos existentes (por ejemplo, modelos de Hugging Face como Gemma o Llama). Los notebooks cubren la integración con frameworks como smolagents, LlamaIndex y LangGraph, así como técnicas de entrenamiento específico para agentes (como el bonus unit sobre Gemma SFT y thinking function call). No hay datos de entrenamiento ni innovaciones arquitectónicas propias.

## Capacidades

- Proporciona ejemplos prácticos de implementación de agentes con tool calling, code agents y retrieval agents.
- Incluye notebooks sobre visión por computador aplicada a agentes (vision agents y vision web browser).
- Cubre orquestación multi-agente y flujos de trabajo con LlamaIndex y LangGraph.
- Ofrece material sobre monitorización y evaluación de agentes en producción.
- Incluye un notebook sobre entrenamiento supervisado (SFT) y función de pensamiento para Gemma.
- Todo el código es ejecutable y está diseñado para ser reproducido en entornos Jupyter.

## Casos de uso

- Aprendizaje autodidacta de arquitecturas de agentes: los notebooks permiten seguir paso a paso la construcción de agentes desde cero, ideal para desarrolladores que quieren dominar smolagents, LlamaIndex o LangGraph.
- Prototipado rápido de agentes con tool calling: el notebook "Tool Calling Agents" muestra cómo conectar un modelo a herramientas externas, útil para validar ideas antes de pasar a producción.
- Implementación de agentes de visión: los notebooks de visión demuestran cómo combinar modelos de lenguaje con capacidades de procesamiento de imágenes, aplicable a tareas de automatización de navegación web o análisis de documentos.
- Evaluación y monitorización de agentes: el bonus unit 2 proporciona guías para medir el rendimiento de agentes en producción, esencial para equipos que despliegan sistemas basados en LLM.
- Formación de equipos internos: el curso puede usarse como material de referencia en empresas que adoptan IA generativa y necesitan estandarizar el desarrollo de agentes.
- Integración con frameworks de orquestación: los ejemplos con LangGraph y LlamaIndex sirven como base para construir sistemas multi-agente complejos, como clasificación de correo o flujos de trabajo empresariales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, ya que este repositorio no contiene un modelo entrenado. Los benchmarks dependerían de los modelos subyacentes que se utilicen con los ejemplos de código.

## Requisitos de hardware

No aplica directamente, pero los notebooks requieren un entorno con Python y las bibliotecas de Hugging Face (transformers, smolagents, etc.). Para ejecutar los ejemplos con modelos grandes se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100) o usar servicios en la nube. Los notebooks pueden ejecutarse en CPU para fines de aprendizaje, aunque con mayor latencia.

## Comparativa con modelos similares

No disponible, al no tratarse de un modelo. La comparativa sería aplicable a los modelos utilizados en los ejemplos (por ejemplo, Gemma, Llama, etc.), pero no a este repositorio.

## Limitaciones y advertencias

- No es un modelo de IA, por lo que no puede ser utilizado directamente para inferencia.
- El material está en inglés, lo que puede limitar su accesibilidad para hispanohablantes.
- Los notebooks dependen de versiones específicas de bibliotecas; es posible que necesiten ajustes para ejecutarse en entornos actualizados.
- La licencia Apache 2.0 permite uso comercial y modificación, pero los modelos subyacentes mencionados en los ejemplos pueden tener sus propias licencias (por ejemplo, Gemma tiene términos de uso específicos).
- No incluye datos de entrenamiento ni pesos, por lo que no es útil para tareas de inferencia directa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agents-course/notebooks
- Curso de Agentes de Hugging Face: https://huggingface.co/learn/agents-course/unit0/introduction
- Organización del curso en Hugging Face: https://huggingface.co/agents-course
- Repositorio espejo en GitHub (towardsai): https://github.com/towardsai/agent-course-notebooks/tree/main/
