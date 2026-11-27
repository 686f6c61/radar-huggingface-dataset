# Evaluated-by-X-LANCE/claude-haiku-4-5

## Resumen

Claude Haiku 4.5 es un modelo de lenguaje cerrado desarrollado por Anthropic. Este repositorio de Hugging Face no contiene los pesos del modelo ni su configuracion de inferencia: es una tarjeta de seguimiento de resultados creada por el usuario Evaluated-by-X-LANCE para alojar las evaluaciones del modelo sobre el benchmark SynthDCB, dado que Claude Haiku 4.5 no dispone de repositorio publico de pesos en la plataforma.

El unico dato de rendimiento publicado en esta ficha es la puntuacion global de SynthDCB: un Pass@1 de 51,601562, calculado como media de tres intentos por tarea sobre el conjunto de evaluacion `eval_20261115`. No se proporciona informacion sobre arquitectura, numero de parametros, longitud de contexto ni datos de entrenamiento.

La relevancia de esta entrada es, por tanto, exclusivamente como registro de evaluacion reproducible de un modelo propietario en un benchmark concreto (SynthDCB), no como artefacto desplegable. Cualquier dato tecnico adicional debe consultarse en la documentacion oficial de Anthropic, fuera del alcance de la informacion disponible aqui.

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
| Formato de pesos | no disponible (repositorio de solo resultados, sin pesos) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. El repositorio indica explicitamente que se trata de una tarjeta de seguimiento de resultados para el modelo cerrado Claude Haiku 4.5 y que no aloja pesos. No hay datos sobre composicion del dataset de entrenamiento, numero de tokens, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas de atencion o decodificacion.

El unico contenido tecnico verificable es la metodologia de evaluacion: las puntuaciones corresponden al conjunto `eval_20261115`, con tres intentos por tarea, y los resultados por tarea se almacenan en el directorio `.eval_results/` del repositorio.

## Capacidades

- No se detallan capacidades especificas del modelo en la informacion proporcionada.
- El modelo es accesible unicamente como servicio cerrado de Anthropic; este repositorio no permite su ejecucion local.
- No hay informacion disponible sobre soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No hay informacion disponible sobre cobertura multilingue.
- La unica capacidad documentada de forma indirecta es la resolucion de tareas del benchmark SynthDCB, con un Pass@1 global de 51,60.

## Casos de uso

- Evaluacion comparativa de modelos cerrados: usar esta tarjeta como referencia del rendimiento de Claude Haiku 4.5 en SynthDCB frente a otros modelos evaluados en el mismo leaderboard, sin necesidad de reejecutar la evaluacion.
- Reproducibilidad de resultados: consultar `.eval_results/` para auditar las puntuaciones por tarea y la configuracion de la evaluacion `eval_20261115`.
- Seleccion de modelo para tareas de SynthDCB: si el dominio cubierto por el benchmark se aproxima al caso de uso real, el Pass@1 de 51,60 sirve como criterio de descarte o shortlist frente a alternativas.
- Integracion via API de Anthropic: el modelo puede consumirse a traves del servicio del proveedor, aunque este repositorio no aporta artefactos para ello.
- Trazabilidad en pipelines de evaluacion: enlazar esta tarjeta desde informes internos para citar la fuente de las metricas de Claude Haiku 4.5 en SynthDCB.
- Investigacion sobre benchmarks: utilizar el par benchmark/tarjeta como ejemplo de publicacion de resultados de modelos cerrados en el Hub cuando no existe repositorio de pesos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Conjunto | Metodologia |
|---|---|---|---|---|
| SynthDCB | Overall Pass@1 | 51,601562 | `eval_20261115` | Media de 3 intentos por tarea |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- Inferencia local: no es posible; el repositorio no contiene pesos.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables a este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa tecnica con alternativas porque la informacion disponible no incluye parametros, contexto, licencia ni resultados de benchmarks comparables. La unica metrica publicada es el Pass@1 de 51,601562 en SynthDCB, sin datos de otros modelos en el mismo conjunto dentro de la informacion proporcionada.

| Modelo | Parametros | Contexto | SynthDCB Pass@1 | Licencia | Pesos publicos |
|---|---|---|---|---|---|
| Claude Haiku 4.5 | no disponible | no disponible | 51,601562 | no disponible | no |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos ni codigo de inferencia: no puede desplegarse localmente a partir de esta entrada.
- La licencia no esta declarada; el uso comercial queda sujeto a los terminos del proveedor del modelo, no a esta tarjeta.
- La puntuacion de SynthDCB corresponde a un unico conjunto de evaluacion (`eval_20261115`) y a tres intentos por tarea; la varianza entre ejecuciones no se documenta mas alla de la media.
- No hay informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o cobertura idiomatica.
- El repositorio es de un tercero (Evaluated-by-X-LANCE), no del desarrollador del modelo; la exactitud de las metricas depende del proceso de evaluacion del autor.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria de los resultados.
- No debe interpretarse el Pass@1 de 51,60 como rendimiento general del modelo fuera del dominio de SynthDCB.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Evaluated-by-X-LANCE/claude-haiku-4-5
- Dataset del benchmark: https://huggingface.co/datasets/X-LANCE/SynthDCB
- Leaderboard del proyecto SynthDCB: https://x-lance.github.io/SynthDCB/#leaderboard
