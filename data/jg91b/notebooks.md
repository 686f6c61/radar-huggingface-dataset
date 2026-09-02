# JG91B/notebooks

## Resumen

El repositorio `JG91B/notebooks` no es un modelo de inteligencia artificial, sino una colección de cuadernos Jupyter (notebooks) que forman parte del Hugging Face Agents Course. Publicado por el usuario JG91B bajo licencia Apache 2.0, este repositorio recopila materiales didácticos para aprender a construir agentes de IA utilizando frameworks como smolagents, LlamaIndex y LangGraph. Incluye ejemplos prácticos de agentes de código, agentes con recuperación de información, agentes multimodales con visión, y herramientas de monitorización y evaluación.

Aunque no contiene pesos ni arquitecturas de modelos, su relevancia radica en que sirve como guía de referencia para desarrolladores que desean implementar agentes basados en modelos de lenguaje de código abierto. El repositorio fue creado el 2 de septiembre de 2026 y no ha recibido descargas ni valoraciones hasta la fecha de consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de notebooks educativos) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (los notebooks están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (formato .ipynb y .py) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado ni una arquitectura de red neuronal. Se trata de un conjunto de archivos de código y documentación que ilustran el uso de bibliotecas de agentes de IA. Los notebooks cubren desde la creación de una librería de agentes básica hasta la implementación de agentes con visión y navegación web, así como el ajuste fino de modelos (por ejemplo, Gemma con SFT y function calling). No hay datos de entrenamiento, tokens procesados ni técnicas de optimización asociadas.

## Capacidades

- Proporciona ejemplos prácticos de agentes de código con smolagents, incluyendo agentes que escriben y ejecutan código Python.
- Incluye notebooks sobre tool calling, donde se muestra cómo los agentes invocan herramientas externas.
- Cubre agentes de recuperación (retrieval agents) que combinan búsqueda documental con generación aumentada.
- Ofrece ejemplos de agentes multimodales con visión, capaces de procesar imágenes y navegar por el navegador web.
- Presenta implementaciones con LlamaIndex (agentes, componentes, herramientas y flujos de trabajo) y LangGraph (agentes y clasificación de correo).
- Incluye un notebook bonus sobre monitorización y evaluación de agentes, y otro sobre ajuste fino de Gemma para function calling.

## Casos de uso

- Aprendizaje de desarrollo de agentes: los notebooks sirven como material de estudio para desarrolladores que quieren dominar frameworks como smolagents, LlamaIndex o LangGraph, con ejemplos ejecutables paso a paso.
- Prototipado rápido de agentes: un desarrollador puede adaptar los ejemplos de tool calling o retrieval agents para construir un prototipo funcional en horas, reutilizando el código base.
- Formación interna en equipos de IA: empresas pueden usar estos notebooks como base para talleres internos sobre agentes de IA, dado que cubren desde conceptos básicos hasta técnicas avanzadas.
- Referencia para integración de frameworks: los ejemplos de LangGraph y LlamaIndex ayudan a comparar enfoques y elegir la biblioteca más adecuada para un proyecto concreto.
- Evaluación de agentes: el notebook de monitorización y evaluación proporciona plantillas para medir el rendimiento de agentes en producción, algo crítico para despliegues empresariales.
- Experimentación con visión y navegación web: los ejemplos de vision agents y vision web browser permiten explorar casos de uso como automatización de tareas en interfaces gráficas o extracción de información de páginas web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen métricas de rendimiento como MMLU, HumanEval o GSM8K asociadas a este repositorio.

## Requisitos de hardware

No aplica. Este repositorio no contiene un modelo que requiera hardware específico para inferencia. Los notebooks pueden ejecutarse en cualquier entorno con Python y las bibliotecas correspondientes instaladas (smolagents, LlamaIndex, LangGraph, etc.). Para ejecutar los ejemplos que utilizan modelos de lenguaje, se necesitará acceso a una GPU o a una API de modelos, pero eso depende del modelo subyacente que el usuario elija, no de este repositorio.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no tiene comparativa con otros modelos. Su función es educativa y de referencia, similar a otros repositorios de cursos de Hugging Face, pero no compite en la categoría de modelos de lenguaje.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para generar texto, razonar ni realizar inferencias. Intentar usarlo como tal producirá errores.
- Contenido en inglés: todos los notebooks están escritos en inglés, lo que puede ser una barrera para hispanohablantes sin dominio del idioma.
- Dependencia de bibliotecas externas: los ejemplos requieren instalar y mantener dependencias como smolagents, LlamaIndex, LangGraph, etc., que pueden cambiar con el tiempo y romper la compatibilidad.
- Sin mantenimiento activo: el repositorio no muestra actividad reciente (creado en septiembre de 2026) y no tiene descargas ni valoraciones, por lo que podría contener errores o referencias desactualizadas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario es responsable de cumplir los términos de las bibliotecas subyacentes, que pueden tener licencias diferentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JG91B/notebooks
- Hugging Face Agents Course: https://huggingface.co/learn/agents-course/unit0/introduction
- Notebooks del curso (referencia): https://huggingface.co/agents-course/notebooks/blob/main/unit1/dummy_agent_library.ipynb (y demás enlaces de la tabla del README)
