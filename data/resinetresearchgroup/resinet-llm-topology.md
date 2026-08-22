# ResiNetResearchGroup/ResiNet-LLM-topology

## Resumen

ResiNet-LLM-topology es un repositorio de código publicado por el grupo ResiNet AI Research que acompaña al artículo «An LLM-Based Framework for Intent-Driven Network Topology Design» (envío a CNSM). No se trata de un modelo de lenguaje en sí, sino de un artefacto de reproducibilidad que proporciona el pipeline de evaluación utilizado para comparar topologías de red generadas por LLMs contra diseños de referencia. Incluye scripts para calcular métricas F1 a nivel de nodos y de aristas, datos de escenarios con topologías de referencia, utilidades de conectividad y dibujo de grafos, y un módulo de prompts para la generación de topologías guiada por intenciones.

El repositorio está pensado para que investigadores y desarrolladores puedan inspeccionar la lógica de evaluación, reproducir los resultados del paper y comparar salidas generadas por distintos LLMs en tareas de diseño de topologías de red. No contiene pesos de modelo, arquitectura ni datos de entrenamiento; su valor reside en el código de evaluación y en los datos de escenarios. El tamaño del repositorio es de 1,1 MB y la fecha de creación es junio de 2026, con última actualización en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo, es un pipeline de evaluacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el codigo y los prompts estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (contiene scripts Python y datos JSON) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. El repositorio contiene un conjunto de scripts Python que implementan la evaluacion de topologias de red generadas por LLMs. La logica principal se divide en dos niveles: evaluacion de nodos (normalizacion, mapeo y calculo de F1) y evaluacion de aristas (limpieza, remapeo estructural y puntuacion F1). Ademas incluye un modulo de prompts (`resinet_llm_prompt.py`) que probablemente se usa para interrogar a un LLM externo y obtener topologias en formato JSON, y utilidades para medir conectividad y dibujar grafos. No hay informacion sobre datos de entrenamiento, tokens, RLHF o cualquier innovacion arquitectonica, ya que el repositorio no contiene ningun modelo.

## Capacidades

- Evaluacion de topologias de red generadas por LLMs mediante metricas F1 a nivel de nodos y de aristas.
- Comparacion de topologias generadas contra disenos de referencia almacenados en archivos JSON.
- Generacion de prompts para la creacion de topologias guiada por intenciones (funcion del modulo `resinet_llm_prompt.py`).
- Medicion de conectividad y resiliencia de las topologias generadas.
- Dibujo de grafos para visualizacion de resultados.
- Reproducibilidad del pipeline de evaluacion descrito en el paper de CNSM.

## Casos de uso

- Reproduccion de experimentos del articulo: los investigadores pueden ejecutar los scripts de evaluacion sobre las topologias generadas por distintos LLMs y comparar los resultados con las referencias publicadas.
- Benchmarking de LLMs para diseno de redes: el pipeline permite evaluar de forma sistematica como distintos modelos manejan restricciones estructurales y de resiliencia en la sintesis de topologias.
- Validacion de topologias generadas automaticamente: si un sistema de diseno de red produce topologias en JSON, este repositorio ofrece una forma estandarizada de medir su calidad frente a un diseno de referencia.
- Analisis de modos de fallo: los scripts de evaluacion pueden ayudar a identificar errores comunes como desajustes de interfaces o inconsistencias direccionales en las topologias generadas.
- Integracion en pipelines de investigacion: el codigo modular (funciones separadas para nodos, aristas, conectividad) permite adaptar la evaluacion a otros escenarios o metricas.
- Educacion y formacion: sirve como ejemplo practico de como evaluar salidas estructuradas de LLMs en dominios tecnicos como el diseno de redes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento de ningun modelo, solo el codigo de evaluacion y los datos de escenarios.

## Requisitos de hardware

No aplica, ya que no es un modelo de inferencia. Los scripts son ligeros y se ejecutan en cualquier maquina con Python. Los requisitos dependen del LLM externo que se utilice para generar las topologias, que no forma parte de este repositorio.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje, por lo que no tiene sentido compararlo con alternativas como Llama, Mistral o GPT. Si se considera como framework de evaluacion, no hay informacion sobre otros frameworks comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos, arquitectura ni capacidad de generacion de texto. Es solo un conjunto de scripts de evaluacion.
- Depende de un LLM externo: para generar topologias es necesario usar un modelo de lenguaje por separado, cuyos requisitos y limitaciones no estan cubiertos en este repositorio.
- Licencia no especificada: no se indica bajo que licencia se distribuye el codigo, lo que puede limitar su uso en proyectos comerciales o academicos con restricciones.
- Datos de escenarios limitados: solo se incluyen cuatro escenarios de topologia de referencia, lo que puede no ser representativo de todos los casos de uso.
- Sin soporte oficial: el repositorio parece ser un artefacto de publicacion, sin mantenimiento activo ni canal de soporte documentado.
- Idioma: los scripts y la documentacion estan en ingles, lo que puede ser una barrera para algunos usuarios hispanohablantes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ResiNetResearchGroup/ResiNet-LLM-topology
- Arbol de archivos: https://huggingface.co/ResiNetResearchGroup/ResiNet-LLM-topology/tree/main
- Paper en arXiv: https://arxiv.org/html/2607.00292v1
- Repositorio en GitHub (posiblemente relacionado): https://github.com/yangshanchao/ResiNet
