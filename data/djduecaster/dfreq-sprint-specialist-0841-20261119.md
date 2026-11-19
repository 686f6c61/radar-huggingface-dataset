# djduecaster/dfreq-sprint-specialist-0841-20261119

## Resumen

dfreq-sprint-specialist-0841-20261119 es un modelo de política para robótica (pipeline `robotics`) publicado por el usuario djduecaster en Hugging Face. Se presenta como un especialista en el arranque (sprint) de 2 metros de un agente denominado "Microduck", entrenado como fine-tune del modelo base `djduecaster/dfreq`. No es un modelo de lenguaje: su función es mapear observaciones estándar de 61 valores float32 a acciones de 14 valores float32 para controlar un robot simulado.

El modelo se describe explícitamente como un candidato de simulación con arranques fijos (fixed-start specialist). Su funcionamiento se basa en un mecanismo de coincidencia de observaciones con un conjunto almacenado de pares observación/acción optimizados sobre los cinco arranques declarados, usando como respaldo la política `SprintActionRate` del 10 de noviembre para observaciones no coincidentes. El autor advierte que no constituye evidencia de una marcha generalista más rápida.

Es relevante por su carácter de artefacto experimental dentro de un entorno de competición simulado (microduck-arena), con métricas declaradas sobre un evaluador Mac fijado. El repositorio tiene 0 descargas y 0 likes, un tamaño de 0.0 GB y fue creado el 19 de noviembre de 2026. La licencia y los idiomas no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control robótico; exportación ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 61 valores float32; salida de 14 valores float32) |
| Tipos de cuantizacion | no disponible (exportación en ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. La model card indica que se trata de un fine-tune del modelo base `djduecaster/dfreq` y que la exportación se realiza en formato ONNX. El mecanismo descrito combina una tabla de coincidencia de observaciones con ejemplos almacenados de observación/acción, optimizados sobre los cinco arranques declarados, y una política de respaldo (`SprintActionRate` del 10 de noviembre) para las observaciones que no coinciden.

La interfaz es fija: 61 entradas float32 y 14 salidas float32, sin tensores externos ni entrada directa de semilla. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO, ya que no es un modelo de lenguaje. El autor califica el resultado como especialista de arranque fijo y no como una marcha generalista.

## Capacidades

- Control de política robótica en simulación: mapea observaciones de 61 float32 a acciones de 14 float32.
- Especialización en arranques de sprint de 2 metros sobre cinco posiciones de inicio declaradas.
- Coincidencia de observaciones con ejemplos almacenados optimizados.
- Política de respaldo (`SprintActionRate`, 10 de noviembre) para observaciones no coincidentes.
- Exportación en ONNX para inferencia.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Evaluación de políticas de sprint en simulación: el modelo se usa para medir tiempos de arranque de 2 metros sobre los cinco puntos de inicio declarados, con la métrica de tiempo medio y tasa de finalización del evaluador Mac fijado.
- Comparación de variantes de política: sirve como candidato especialista frente a la política de respaldo `SprintActionRate` para analizar diferencias en tiempos de arranque.
- Integración en pipelines ONNX: al exportarse en ONNX, puede cargarse en entornos de inferencia estándar para reproducir las observaciones y acciones del agente simulado.
- Validación local de artefactos: el autor incluye `validation.json` y una nota de licencia, lo que permite reproducir la validación local sobre el evaluador fijado.
- Estudio de especialización por arranque fijo: permite analizar el comportamiento de un modelo que memoriza pares observación/acción frente a políticas generalistas.
- Referencia para atribución upstream: el modelo documenta la atribución a `dfreq` y a la política del 10 de noviembre, útil para trazabilidad en experimentos derivados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo medio en evaluador Mac (9bf04c0668145528035c8a315d5d8ae2530c1279) | 0.841 s |
| Tasa de finalización | 5/5 |
| Velocidad | 1.15 m/s |
| Tiempo oficial previo en Arena | 0.848 s |

No se han publicado resultados de benchmarks adicionales en la información disponible. El autor no reclama puntuación alojada ni aceptación oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (modelo de política con entrada de 61 float32 y salida de 14 float32; el repositorio ocupa 0.0 GB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto y el formato ONNX, es plausible su ejecución en hardware modesto, pero no se confirma en la información proporcionada.
- Opciones de despliegue: ONNX Runtime u otros runtimes compatibles con ONNX; no se especifican vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible; el único dato es el tiempo medio de 0.841 s en el evaluador Mac fijado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dfreq-sprint-specialist-0841-20261119 | no disponible | no aplica (61 float32 de entrada) | 0.841 s, 5/5 finalizaciones, 1.15 m/s en evaluador Mac fijado | no disponible | Hugging Face (0 descargas) |
| djduecaster/dfreq (modelo base) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| Política SprintActionRate (10 de noviembre) | no disponible | no aplica | no disponible | no disponible | referenciada en la model card |

No se dispone de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un especialista de arranque fijo: los cinco arranques declarados se usaron en la optimización, por lo que no debe interpretarse como evidencia de una marcha generalista más rápida.
- Candidato solo de simulación: no se reclama puntuación alojada ni aceptación oficial en la Arena.
- Dependencia del evaluador: las métricas se obtuvieron en un evaluador Mac concreto (hash 9bf04c0668145528035c8a315d5d8ae2530c1279); otros entornos pueden variar.
- Mecanismo de coincidencia: para observaciones no coincidentes se usa una política de respaldo, lo que puede degradar el rendimiento fuera de las condiciones optimizadas.
- Licencia no disponible: no se puede confirmar el uso comercial; el autor remite a `LICENSE-NOTE.txt`.
- Idiomas no disponibles: no aplica al ser un modelo de control robótico.
- Sin datos de sesgos ni de alucinación: no aplica en el sentido habitual de modelos de lenguaje, pero el comportamiento fuera de distribución no está caracterizado.
- Repositorio sin descargas ni likes: no hay evidencia de uso o validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-sprint-specialist-0841-20261119
- Modelo base: https://huggingface.co/djduecaster/dfreq
- Atribución upstream: `upstream-base-card.md` (referenciado en la model card)
- Nota de licencia: `LICENSE-NOTE.txt` (referenciado en la model card)
- Validación local: `validation.json` (referenciado en la model card)
