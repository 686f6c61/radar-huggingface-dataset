# atxharris/embodied-ai90-2023

## Resumen

El repositorio `atxharris/embodied-ai90-2023` no contiene un modelo de inteligencia artificial entrenado, sino un conjunto estructurado de notas de investigación sobre el campo de la IA corpórea (Embodied AI). El autor, Nicholas Harris (usuario `atxharris`), publica un documento principal (`paper_notes.md`) que recoge el alcance de una pregunta de investigación, posibles factores de confusión, propuestas de comparación con líneas base, referencias a benchmarks públicos, comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas. La licencia es MIT y el repositorio se etiqueta explícitamente como `research-notes`.

Aunque el repositorio tiene un archivo en formato `safetensors` con un tamaño de 49.600 parámetros, la model card aclara que no se trata de un checkpoint entrenado ni de código liberado. Es un artefacto de documentación para verificar hipótesis, no un sistema ejecutable. Por tanto, cualquier uso como modelo de IA sería incorrecto. Su relevancia actual radica en servir como punto de partida para investigadores que quieran estructurar estudios sobre IA corpórea con criterios de reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal) |
| Parametros totales | 49.600 (archivo safetensors, pero no corresponde a pesos de un modelo entrenado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (presencia nominal, sin pesos reales) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La model card indica explícitamente que el contenido es exploratorio y que no se reivindican mejoras de benchmarks, ablaciones completadas, código publicado ni checkpoints entrenados. El archivo `safetensors` presente en el repositorio no contiene un modelo serializado; su tamaño de 49.600 bytes sugiere que se trata de un archivo vacío o de metadatos, no de pesos. El documento `paper_notes.md` es el artefacto principal y contiene planes e hipótesis que deben mantenerse separados de resultados experimentales.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, matemáticas, visión ni ninguna otra función de IA.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de procesamiento de audio o vídeo.
- Su única función es documentar una propuesta de investigación sobre IA corpórea, incluyendo referencias a benchmarks públicos y criterios de evaluación.

## Casos de uso

- Punto de partida para diseñar un estudio sobre IA corpórea: el documento enumera el alcance de la pregunta de investigación y los confounders a considerar, lo que permite estructurar un protocolo experimental.
- Referencia para seleccionar benchmarks apropiados en tareas de manipulación robótica o navegación: se mencionan benchmarks públicos específicos que pueden consultarse para verificar su idoneidad.
- Guía para implementar comprobaciones de reproducibilidad: el repositorio sugiere incluir versiones de datasets, comandos, semillas, hardware y logs crudos cuando se añadan resultados.
- Material de estudio para estudiantes que quieran entender cómo se plantea una investigación seria en IA corpórea, separando hipótesis de evidencia.
- Base para una revisión bibliográfica: las referencias citadas en `paper_notes.md` pueden servir para localizar trabajos relevantes en el campo.
- Ejemplo de buenas prácticas de documentación científica en repositorios públicos, mostrando cómo etiquetar claramente planes frente a resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explícitamente que no se reivindican mejoras de rendimiento ni se han completado ablaciones.

## Requisitos de hardware

- No aplica: el repositorio no contiene un modelo ejecutable.
- No se requieren GPU ni VRAM para su uso.
- El archivo `paper_notes.md` puede abrirse con cualquier editor de texto.
- No hay opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con alternativas como LLaMA, Mistral o cualquier otro sistema de generación de texto. Su naturaleza es documental, no computacional.

## Limitaciones y advertencias

- No es un modelo de IA: no puede ejecutarse, generar texto ni realizar ninguna tarea de razonamiento.
- El archivo `safetensors` de 49.600 bytes no contiene pesos reales; no debe interpretarse como un checkpoint.
- Las secciones etiquetadas como planes o hipótesis no deben tratarse como resultados experimentales.
- El repositorio no incluye código, comandos de entrenamiento ni logs.
- La licencia MIT se aplica a la documentación, pero los términos de los datasets externos mencionados deben revisarse por separado.
- Riesgo de confusión para quien busque un modelo de IA listo para usar: este repositorio no satisface esa necesidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/atxharris/embodied-ai90-2023
- Perfil del autor: https://huggingface.co/atxharris
- Lista de referencias sobre IA corpórea (relacionada, no del autor): https://github.com/HCPLab-SYSU/Embodied_AI_Paper_List
- Proyecto EmbodiedGPT (relacionado, no del autor): https://embodiedgpt.github.io/
