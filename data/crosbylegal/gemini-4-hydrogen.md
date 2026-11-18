# crosbylegal/gemini-4-hydrogen

## Resumen

`crosbylegal/gemini-4-hydrogen` no es un modelo con pesos: es una model card de seguimiento de resultados (results-tracking model card) publicada por Crosby para alojar en Hugging Face Hub las evaluaciones de un modelo servido exclusivamente por API, Gemini 4 Hydrogen. El repositorio no contiene checkpoints, tokenizador ni configuración de inferencia; su único contenido relevante son los resultados del benchmark propietario RedlineBench y las notas de configuración asociadas.

La relevancia de esta ficha es, por tanto, documental y de trazabilidad: permite citar de forma estable una puntuación de 61,3 en la métrica `redline_overall` (media de 3 ejecuciones, desviación típica 0,7) para un modelo que no dispone de repositorio público de pesos. El autor advierte explícitamente de que las puntuaciones son ejecuciones posteriores a la publicación realizadas por Crosby con su propio toolkit, y que no están marcadas como `verified` por Hugging Face, ya que ese sello solo cubre el framework inspect-ai.

No se dispone de información sobre arquitectura, tamaño, longitud de contexto, licencia ni idiomas del modelo subyacente. Cualquier evaluación técnica de Gemini 4 Hydrogen debe remitirse a la documentación del proveedor del API, que no forma parte de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (modelo servido por API, sin pesos publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

No hay información pública en el repositorio sobre la arquitectura del modelo (transformer, MoE, híbrido u otra), el volumen o composición de los datos de entrenamiento, ni sobre las etapas de alineación (RLHF, DPO u otras). El repositorio es únicamente un contenedor de resultados de evaluación: no incluye pesos, configuración de entrenamiento ni documentación técnica del modelo.

La única información metodológica disponible se refiere al proceso de evaluación: las puntuaciones se obtuvieron con el toolkit RedlineBench de Crosby, en ejecuciones posteriores a la publicación del modelo, y se reportan como media de 3 rollouts con su desviación típica. Las notas de configuración detalladas se encuentran en el directorio `.eval_results/` del propio repositorio, que no se ha podido inspeccionar en detalle a partir de la información proporcionada.

## Capacidades

- No se documentan capacidades funcionales del modelo en la información disponible (generación de texto, razonamiento, código, matemáticas, visión, audio, etc.).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes o razonamiento multi-paso.
- No se documenta cobertura multilingüe.
- La única capacidad verificable en el repositorio es la de ser evaluado con el benchmark RedlineBench, orientado a tareas de revisión y marcado de texto legal (redlining) según la denominación del propio benchmark.

## Casos de uso

- Trazabilidad de evaluaciones: usar este repositorio como referencia citable y versionada de la puntuación RedlineBench de Gemini 4 Hydrogen en informes internos o comparativas de proveedores, dado que el modelo no tiene repositorio público de pesos.
- Comparación de proveedores en dominios legales: emplear la métrica `redline_overall` (61,3; sd 0,7) como un punto de datos adicional al evaluar si conviene integrar el API de Gemini 4 Hydrogen en flujos de revisión contractual.
- Reproducción de la evaluación: seguir las notas de `.eval_results/` para replicar la ejecución con el toolkit RedlineBench y comprobar la estabilidad de la puntuación con nuevos rollouts.
- Auditoría de resultados: documentar en un pipeline de gobernanza de modelos que la puntuación no está marcada como `verified` por Hugging Face y que procede del propio autor del benchmark, lo que exige una revisión independiente antes de usarla en decisiones de compra.
- Seguimiento de versiones del modelo: monitorizar este repositorio para detectar actualizaciones de la puntuación cuando el proveedor publique nuevas versiones del API, ya que la model card se actualiza con cada ronda de evaluación.
- Integración en dashboards de evaluación: consumir la métrica y su desviación típica para alimentar paneles internos de seguimiento de calidad de modelos de terceros, con la cautela de que se trata de una única métrica de un único benchmark propietario.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| RedlineBench | `redline_overall` | 61,3 | Media de 3 rollouts, desviación típica 0,7; ejecuciones posteriores a la publicación realizadas por Crosby; no verificadas por Hugging Face |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- El repositorio no contiene pesos, por lo que no procede estimar VRAM para inferencia local.
- El modelo se consume exclusivamente mediante API; los requisitos de hardware dependen del proveedor del servicio, no del usuario.
- No es desplegable en GPU de consumo, ni en A100/H100, ni mediante vLLM, llama.cpp, Ollama o TGI, al no existir artefactos de pesos.
- No se dispone de datos de latencia ni de throughput.
- El único requisito técnico documentado es la capacidad de ejecutar el toolkit RedlineBench para reproducir la evaluación.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos evaluados con RedlineBench ni especificaciones del modelo subyacente que permitan establecer una comparación técnica fiable (parámetros, contexto, licencia o rendimiento).

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos ejecutables: no es un modelo descargable ni utilizable en local.
- La puntuación de 61,3 procede de ejecuciones del propio autor del benchmark (Crosby), lo que introduce un posible sesgo de interés; no es una evaluación independiente.
- La puntuación no está marcada como `verified` por Hugging Face, ya que ese sello solo cubre evaluaciones realizadas con inspect-ai.
- Se trata de una única métrica agregada de un único benchmark propietario; no permite extraer conclusiones sobre capacidades generales del modelo.
- La desviación típica de 0,7 sobre 3 rollouts ofrece una muestra pequeña; la incertidumbre real de la métrica puede ser mayor.
- No hay información sobre sesgos, tasas de alucinación, cobertura idiomática ni restricciones de licencia para uso comercial.
- Al ser un modelo servido por API, el comportamiento puede cambiar sin previo aviso si el proveedor actualiza el endpoint, lo que invalidaría la puntuación registrada.
- No debe citarse esta ficha como evidencia del rendimiento general de Gemini 4 Hydrogen, sino únicamente de su resultado en RedlineBench en la fecha de la evaluación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/crosbylegal/gemini-4-hydrogen
- Dataset del benchmark RedlineBench: https://huggingface.co/datasets/crosbylegal/RedlineBench
- Informe del benchmark: https://intelligence.crosby.ai/benchmark/
- Notas de configuración de la evaluación: https://huggingface.co/crosbylegal/gemini-4-hydrogen/tree/main/.eval_results
