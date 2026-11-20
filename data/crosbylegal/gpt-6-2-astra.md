# crosbylegal/gpt-6.2-astra

## Resumen

GPT-6.2 Astra es un modelo de API cerrado desarrollado por Crosby Intelligence (según la información disponible), y este repositorio de Hugging Face no contiene pesos ni artefactos de inferencia: es una tarjeta de seguimiento de resultados de evaluación. Su función es alojar en el Hub los resultados del benchmark propietario RedlineBench, dado que GPT-6.2 Astra no dispone de repositorio público de modelo. El autor del repositorio es el usuario `crosbylegal`.

La relevancia de este repositorio es, por tanto, documental y de trazabilidad: permite consultar la puntuación `redline_overall` obtenida por el modelo en RedlineBench y enlaza al informe publicado en `intelligence.crosby.ai`. No se trata de un modelo descargable ni ejecutable localmente, por lo que no es posible desplegarlo, cuantizarlo ni integrarlo en pipelines propios a partir de estos ficheros.

No se dispone de información sobre arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni licencia. La model card indica explícitamente que el repositorio "holds no weights" y que los resultados son ejecuciones posteriores a la publicación realizadas por Crosby con su propio toolkit, no verificadas por Hugging Face (la verificación `verified` del Hub está limitada a inspect-ai).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio no contiene pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de resultados, sin artefactos de modelo) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, híbrida u otra), el número de parámetros, la composición del corpus de entrenamiento ni las etapas de alineación (RLHF, DPO u otras). La model card se limita a describir el propósito del repositorio como contenedor de resultados de evaluación.

El único dato técnico disponible es metodológico: la puntuación reportada corresponde a la media de tres ejecuciones (*rollouts*) con el toolkit RedlineBench, con una desviación estándar de 0,6, y los detalles de configuración se remiten al directorio `.eval_results/` del repositorio y al informe externo.

## Capacidades

- No se documentan capacidades funcionales del modelo en la información disponible (generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o multilingüismo).
- El repositorio en sí no ofrece inferencia: no contiene pesos, tokenizador ni configuración de modelo.
- La única capacidad acreditada de forma indirecta es la evaluabilidad mediante el benchmark RedlineBench, orientado (por el nombre y el contexto del autor) a tareas de revisión contractual y análisis de cláusulas, si bien la model card no describe la tarea del benchmark.

## Casos de uso

- Consulta de resultados de evaluación: usar el repositorio como referencia para comprobar la puntuación `redline_overall` de GPT-6.2 Astra antes de decidir si evaluar el modelo vía API.
- Trazabilidad de benchmarks internos: equipos que replican evaluaciones pueden contrastar sus cifras con las publicadas aquí, teniendo en cuenta la media de tres rollouts y la desviación reportada.
- Documentación de comparativas: citar la puntuación en informes internos de selección de proveedor, siempre acompañada del enlace al informe original y de la advertencia de que no es una verificación de Hugging Face.
- Auditoría metodológica: revisar el directorio `.eval_results/` para conocer la configuración de las ejecuciones (herramientas, prompts, número de rollouts) antes de aceptar la cifra como comparable.
- Seguimiento de versiones del modelo: al ser una tarjeta de seguimiento, sirve para registrar la evolución de la puntuación entre versiones del modelo de API si el autor publica actualizaciones.
- Integración vía API (no vía este repositorio): cualquier uso productivo de GPT-6.2 Astra requeriría acceso al servicio de Crosby; este repositorio no habilita dicho uso ni documenta sus condiciones.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Metodologia |
|---|---|---|---|
| RedlineBench | `redline_overall` | 52,0 | Media de 3 rollouts, sd 0,6; ejecuciones de Crosby con el toolkit RedlineBench (no verificado por HF) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio no contiene pesos.
- GPU recomendadas: no disponible; el acceso al modelo es vía API según la model card.
- Ejecución en GPU de consumo: no es posible a partir de este repositorio.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables, ni datos de parámetros, contexto o licencia de GPT-6.2 Astra que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni código de inferencia; no puede desplegarse localmente ni auditarse a nivel de modelo.
- La puntuación de RedlineBench (52,0) procede de ejecuciones del propio autor del benchmark y del modelo, no de una verificación independiente de Hugging Face; la model card aclara que la insignia `verified` del Hub está restringida a inspect-ai.
- RedlineBench es un benchmark propietario: sus resultados no son directamente comparables con evaluaciones estándar de la comunidad salvo que se conozca su metodología.
- La media de tres rollouts con sd 0,6 implica una incertidumbre no despreciable en la estimación puntual.
- No se dispone de información sobre sesgos, tasa de alucinación, cobertura idiomática ni restricciones de licencia para uso comercial; deben consultarse en la documentación del proveedor antes de cualquier uso en producción.
- El nombre del modelo ("GPT-6.2 Astra") no implica relación con OpenAI; la información disponible atribuye el modelo a Crosby.
- Cualquier decisión de adopción basada únicamente en esta tarjeta sería incompleta: falta información sobre coste, latencia, límites de uso y condiciones contractuales del servicio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/crosbylegal/gpt-6.2-astra
- Dataset del benchmark RedlineBench: https://huggingface.co/datasets/crosbylegal/RedlineBench
- Informe del benchmark: https://intelligence.crosby.ai/benchmark/
- Resultados de evaluación en el repositorio: https://huggingface.co/crosbylegal/gpt-6.2-astra/tree/main/.eval_results
