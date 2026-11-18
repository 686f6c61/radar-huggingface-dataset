# HlibPlakhtii/microduck-sock-heist-nov18-v4

## Resumen

Quicksilver Sock Heist v4 es una política de control para robótica (robotics policy) desarrollada por HlibPlakhtii, publicada como un fine-tune del modelo GinDuck/microduck-gin-sock-s3. Se trata de un artefacto especializado para la simulación MicroDuck Arena, concretamente para la tarea "Sock Heist" sobre recorridos de 6 metros, y no de un modelo de lenguaje. El paquete se distribuye con pesos en formato ONNX y una librería propia denominada `microduck`.

El modelo resuelve un problema muy acotado: completar las cinco salidas oficiales de la tarea Sock Heist en el menor tiempo posible dentro del simulador. Según la model card, los tiempos registrados son 4,635 s, 5,090 s, 4,670 s, 4,680 s y 4,815 s, con una media de 4,778 s a 0,2 m/s según el evaluador local de Arena. La mejora respecto a la versión base proviene de recombinar búsquedas de despegue previas y refinar las últimas 15 llamadas de control mediante *parallel tempering*.

Es relevante en el contexto de investigación en robótica simulada y optimización de políticas porque documenta un flujo completo de procedencia: acciones finales e iniciales, trayectorias donantes, configuración y código de búsqueda, y verificación local de cinco semillas. No obstante, el alcance es muy limitado: no es un modelo general, no tiene capacidades de lenguaje y su rendimiento está medido únicamente en los arranques oficiales de la simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para simulación (no especificada en detalle); grafo ONNX con lookup de acciones y controlador base de respaldo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportación ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política se construye sobre el modelo base GinDuck/microduck-gin-sock-s3, fijado a un commit concreto (`f26239d38b45a3f5311cc4e7133412b0c3a20a4a`). El mecanismo descrito combina dos componentes: un grafo ONNX exportado que actúa como tabla de búsqueda y reproduce las acciones seleccionadas cuando las observaciones coinciden, y el controlador base heredado que gestiona el resto de observaciones. No se detalla la arquitectura interna de la red neuronal subyacente ni el número de parámetros.

El entrenamiento no es un entrenamiento supervisado convencional: la mejora se obtuvo mediante búsqueda y optimización sobre trayectorias. En concreto, se recombinaron búsquedas de despegue anteriores y se refinaron las últimas 15 llamadas de control con *parallel tempering*, con cadenas a distintas temperaturas que exploraban cambios de objetivos articulares e intercambiaban trayectorias. La model card atribuye créditos de trayectorias a rumezhak, HlibPlakhtii, jrubiosainz y lphatnguyen, y el fallback de red a GinDuck. No se indican volúmenes de datos, número de tokens ni uso de RLHF o DPO, dado que no aplica a este tipo de modelo.

## Capacidades

- Control de política para la tarea Sock Heist en MicroDuck Arena, con cinco arranques oficiales de 6 m.
- Ejecución de acciones de control a partir de observaciones, con lookup en el grafo ONNX para observaciones coincidentes.
- Fallback al controlador base para observaciones no presentes en la tabla de búsqueda.
- Reproducción local mediante el runner Arena v5 y el script `search_race_replica_exchange.py`.
- Verificación de cinco semillas incluida en el paquete.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Evaluación de políticas en MicroDuck Arena: usar el modelo para reproducir los cinco arranques oficiales de Sock Heist y comparar tiempos frente a la política base, gracias a la verificación local de cinco semillas incluida.
- Investigación en optimización de trayectorias: emplear la configuración de `search-config.json` y el script de búsqueda para estudiar cómo el *parallel tempering* mejora las últimas 15 llamadas de control.
- Reproducibilidad de experimentos: el paquete incluye acciones finales e iniciales, trayectorias donantes y procedencia upstream, lo que permite reconstruir el linaje semilla a semilla.
- Benchmarking de políticas robóticas simuladas: servir como referencia de tiempos (media de 4,778 s a 0,2 m/s) para comparar nuevas políticas sobre los mismos arranques oficiales.
- Docencia y demostración: ilustrar un pipeline completo de búsqueda, exportación a ONNX y validación en simulador con un caso acotado y bien documentado.
- Integración en el runner Arena v5: desplegar el grafo ONNX como `base-policy.onnx` junto con los parámetros de búsqueda para ejecutar la política en el entorno oficial.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Arranque 1 (6 m) | 4,635 s |
| Arranque 2 (6 m) | 5,090 s |
| Arranque 3 (6 m) | 4,670 s |
| Arranque 4 (6 m) | 4,680 s |
| Arranque 5 (6 m) | 4,815 s |
| Media (evaluador local Arena, 0,2 m/s) | 4,778 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no es un modelo de lenguaje. La model card indica además que la nueva trayectoria de la semilla 2 gana un tick de puntuación de 5 ms.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto muy ligero.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del paquete es plausible que se ejecute en CPU, pero no se confirma en la información.
- Opciones de despliegue: exportación ONNX y el runner Arena v5 con el script `search_race_replica_exchange.py`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible; solo se reportan tiempos de finalización de tarea en simulación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HlibPlakhtii/microduck-sock-heist-nov18-v4 | no disponible | no disponible | Media de 4,778 s en cinco arranques de 6 m | no disponible | Hugging Face, formato ONNX |
| GinDuck/microduck-gin-sock-s3 (base) | no disponible | no disponible | no disponible en la información | no disponible | Hugging Face |
| Otras políticas de MicroDuck Arena | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría más allá del modelo base declarado.

## Limitaciones y advertencias

- El alcance está restringido a los arranques oficiales de la simulación Sock Heist; el rendimiento fuera de esas condiciones no está documentado.
- El lookup en el grafo ONNX solo reproduce acciones para observaciones coincidentes; el resto se delega al controlador base, lo que puede degradar el comportamiento en escenarios no vistos.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento general.
- No se especifica la licencia, por lo que el uso comercial queda sin garantías legales hasta que el autor la declare.
- No se documentan sesgos, riesgo de alucinación ni comportamiento multilingüe, ya que no aplican a este tipo de artefacto.
- La reproducibilidad depende de usar el commit exacto del modelo base, el runner Arena v5 y los parámetros de `search-config.json`; cualquier desviación puede invalidar los resultados.
- Los tiempos reportados provienen del evaluador local de Arena y no de un benchmark independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v4
- Modelo base: https://huggingface.co/GinDuck/microduck-gin-sock-s3
- Modelo base fijado a commit: https://huggingface.co/GinDuck/microduck-gin-sock-s3/tree/f26239d38b45a3f5311cc4e7133412b0c3a20a4a
