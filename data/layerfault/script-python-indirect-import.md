# LayerFault/script-python-indirect-import

## Resumen

El repositorio `LayerFault/script-python-indirect-import` es un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault, un conjunto de datos diseñado para validar y certificar escáneres de seguridad de modelos y artefactos de IA. No es un modelo de aprendizaje automático funcional, sino una pieza de control que contiene características adversarias deliberadas (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts) para ejercitar reglas de detección en herramientas de admisión de modelos.

El repositorio fue creado por LayerFault (autor) el 21 de agosto de 2026 y está marcado con licencia Apache-2.0, aunque el acceso está restringido mediante un gate automático que exige al usuario confirmar que comprende que se trata de un artefacto de prueba de seguridad y que no debe cargarse ni ejecutarse fuera de un entorno aislado. La model card identifica el artefacto con el identificador de corpus `LF-CH-SCRX-0002` y lo clasifica como un desafío de severidad media, dificultad intermedia, con decisión de admisión esperada de "WARN" y tipo de control "positivo".

Su relevancia no reside en capacidades de IA, sino en su papel como herramienta de evaluación de seguridad: permite verificar si los sistemas de escaneo estático y de control de admisión detectan correctamente patrones de ataque relacionados con importación indirecta de scripts en Python. Es un recurso para investigadores de seguridad y desarrolladores de herramientas de gobernanza de modelos, no para usuarios finales de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no contiene pesos de modelo) |

## Arquitectura y entrenamiento

No se trata de un modelo de aprendizaje automático. El repositorio es un artefacto de prueba sintético compuesto por ficheros que simulan un script Python con importación indirecta, probablemente incluyendo un pickle malicioso o técnicas de contrabando de ejecutables. La tarjeta del modelo indica que contiene "características adversarias" diseñadas para activar reglas de escaneo, pero no hay información sobre arquitectura de red neuronal, datos de entrenamiento o procesos de ajuste. El propósito es servir como entrada de control en un corpus de pruebas de seguridad, no como modelo de inferencia.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código o visión.
- No soporta tool calling ni agentes.
- No es un modelo de lenguaje; no puede realizar tareas de NLP.
- Su único propósito es servir como entrada de prueba para escáneres de seguridad, concretamente para evaluar la detección de importación indirecta de scripts en Python.
- Puede contener patrones de inyección de prompts o contrabando de ejecutables, diseñados para ser detectados por herramientas como Layerfault CLI, LLM Guard u otros sistemas de admisión de modelos.
- Se clasifica como un desafío de tipo "positive" (control positivo) para probar que el detector emite una advertencia (WARN) ante este tipo de artefactos.

## Casos de uso

- **Pruebas de escáneres de seguridad estática**: el artefacto se utiliza como entrada para verificar que una herramienta de análisis estático (como Layerfault CLI) detecta la presencia de importaciones indirectas peligrosas en scripts Python. Al escanear el repositorio, se espera que el escáner emita una advertencia (WARN) según la clasificación del corpus.
- **Validación de reglas de admisión de modelos**: los equipos de gobernanza de IA pueden usar este artefacto para comprobar que sus políticas de admisión bloquean o marcan artefactos que no son modelos legítimos, sino vectores de ataque potenciales.
- **Entrenamiento de detectores de prompt injection**: aunque el artefacto no es un modelo, sus cadenas de inyección de prompts pueden servir para entrenar o validar clasificadores de inyección de prompts en entornos aislados.
- **Investigación de contrabando de formatos ejecutables**: los investigadores de seguridad pueden analizar el artefacto para estudiar técnicas de ocultamiento de código ejecutable en archivos de modelo, y desarrollar nuevas firmas de detección.
- **Certificación de pipelines de CI/CD de seguridad**: los equipos que integran escaneo de seguridad en sus pipelines de integración continua pueden usar este artefacto como caso de prueba para asegurar que sus etapas de validación fallan o emiten advertencias correctamente.
- **Evaluación de herramientas de inspección de pickle**: dado que el artefacto contiene opcodes de pickle sospechosos, puede utilizarse para probar herramientas que analizan la seguridad de los archivos pickle en el ecosistema de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no es un modelo de IA y no tiene métricas de rendimiento de tareas de NLP. Su rendimiento relevante es el de los detectores de seguridad que lo procesan, pero no se proporcionan datos al respecto.

## Requisitos de hardware

No se requiere hardware específico para este artefacto. No es un modelo de IA, por lo que no necesita GPU ni VRAM para inferencia. Su uso se limita a análisis estático, que puede ejecutarse en cualquier máquina con Python y herramientas de escaneo. No se recomienda ejecutar el contenido en un entorno de producción ni cargarlo en memoria como un modelo de aprendizaje.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables, ya que este repositorio no es un modelo. En el ámbito de artefactos de seguridad sintéticos, se podría comparar con otros elementos del corpus Layerfault (por ejemplo, `LF-CH-SCRX-0001` o `LF-CH-SCRX-0003`), pero no se dispone de información sobre ellos en los datos proporcionados.

## Limitaciones y advertencias

- **No es un modelo de IA**: no puede utilizarse para ninguna tarea de generación o procesamiento de lenguaje.
- **Contenido deliberadamente malicioso**: incluye opcodes de pickle peligrosos y cadenas de inyección de prompts. Cargar o ejecutar estos archivos fuera de un entorno aislado puede comprometer la seguridad del sistema.
- **Acceso restringido**: la descarga está protegida por un gate que exige aceptar el riesgo. No se debe intentar evadir este control.
- **Licencia Apache-2.0**: aunque la licencia permite uso comercial, el propósito del artefacto es exclusivamente de prueba de seguridad; usarlo en producción sería un error.
- **Sin soporte**: el autor no ofrece soporte para este artefacto como producto, y no hay garantías de que las características detectadas sean representativas de amenazas reales.
- **Alcance limitado**: el artefacto está diseñado para una regla específica (LF-PY-CALL-DYNAMIC-CODE) y no cubre otros vectores de ataque.

## Enlaces

- HuggingFace: https://huggingface.co/LayerFault/script-python-indirect-import
- Repositorio GitHub de Layerfault: https://github.com/izm1chael/layerfault
- Releases de Layerfault: https://github.com/izm1chael/layerfault/releases
- Documentación de LLM Guard sobre inyección de prompts (relacionada): https://protectai.github.io/llm-guard/input_scanners/prompt_injection/
- Guía para ejecutar modelos locales (contexto general): https://dev.to/naimulkarim/running-local-ai-models-for-free-a-step-by-step-guide-with-python-31hd
