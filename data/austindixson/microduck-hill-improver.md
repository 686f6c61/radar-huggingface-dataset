# austindixson/microduck-hill-improver

## Resumen

`microduck-hill-improver` es una política de control para robótica creada por el usuario austindixson como entrada para la prueba de **Hill Climb de 1,5 m** de la Microduck Arena, un espacio de simulación de Hugging Face impulsado por Pollen Robotics. No es un modelo de lenguaje: es un artefacto de control exportado a ONNX que recibe un vector de observación de 61 valores y emite 14 acciones (consignas articulares), pensado exclusivamente para su ejecución dentro del simulador de la Arena.

Técnicamente es un *remix* del modelo `dashi/microduck-hill-remix-r760` (revisión `556583090`). El autor conserva la red neuronal del modelo base congelada y solo vuelve a buscar las filas 45-66 de la tabla de consignas articulares indexada por paso, optimizándolas para la semilla 1. El resto de inicializadores y operadores son idénticos a los del base. El repositorio ocupa 0,0 GB y contiene únicamente `policy.onnx` y `manifest.json`.

Su relevancia es acotada pero clara: documenta un resultado de 0,760 s de media en las semillas oficiales de la Arena, medido con la herramienta propia de la competición (`arena score`) sobre Linux x86-64. El propio autor advierte de que son cifras *in-sample*, ya que la búsqueda puntuó candidatos sobre esas mismas semillas, y de que el modelo no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de control exportada a ONNX; la model card no describe la topología de la red) |
| Parametros totales | No disponible |
| Longitud de contexto | No aplicable ni disponible (no es un modelo de lenguaje; entrada `obs` de forma [1, 61]) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de texto) |
| Licencia | No disponible (ni el modelo base ni este repositorio declaran licencia) |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto JSON (`manifest.json`, esquema 2) |

Datos adicionales verificables: entrada `obs` [1, 61], salida `actions` [1, 14], SHA-256 de `policy.onnx` = `ba8abafe7cb4244f23979871e2e780db9c9d2e29c59f8167ec654e0e5b5b6d4d`, relación con el modelo base `finetune`, librería `microduck` y pipeline `robotics`.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capa o función de activación). Lo que sí se especifica es que la red está **congelada** y que la intervención del autor se limita a una tabla de consignas articulares indexada por paso: se han vuelto a buscar las filas 45-66 para la semilla 1. Todos los demás inicializadores y operadores proceden del modelo base `dashi/microduck-hill-remix-r760`, que a su vez es un *remix* de una política previa de la Microduck Arena.

No se documenta el proceso de entrenamiento original (número de tokens, episodios, composición del dataset, uso de RL o imitación), ni si hubo ajuste fino supervisado o por refuerzo. La única técnica descrita es una búsqueda de hiperparámetros o de parámetros de política sobre un subconjunto concreto de la tabla de acciones, evaluada con las semillas oficiales de la Arena. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de política de control.

## Capacidades

- Control locomotor en simulacion: genera consignas articulares de 14 dimensiones para superar la prueba de ascenso de 1,5 m de la Microduck Arena.
- Ejecucion reproducible: el artefacto ONNX es deterministico y verificable mediante el hash SHA-256 publicado.
- Integracion con el ecosistema de la Arena: compatible con la herramienta `arena score` y con el manifiesto de politica en esquema 2.
- Optimizacion especifica para la semilla 1 del entorno de evaluacion oficial.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No dispone de capacidades multilingues ni de modo de razonamiento.

## Casos de uso

- Participacion en la clasificacion de la Microduck Arena: el modelo puede enviarse como entrada a la prueba de Hill Climb de 1,5 m y puntuarse con las semillas oficiales, gracias a que su manifiesto y su ONNX cumplen el formato esperado por la competicion.
- Referencia base para experimentos de busqueda de parametros: sirve como punto de partida para probar variaciones en las filas 45-66 de la tabla de acciones y medir su efecto en el tiempo de carrera con `arena score`.
- Evaluacion comparativa de politicas de robotica simulada: al compartir red con `dashi/microduck-hill-remix-r760`, permite aislar el efecto de la tabla de consignas frente a cambios en los pesos de la red.
- Docencia e investigacion en control y sim2sim: un artefacto ONNX pequeno y con hash verificable es util para ilustrar el ciclo completo de entrenamiento, exportacion, evaluacion y *leaderboard* en un simulador.
- Generacion de datos de evaluacion en simulacion: ejecuciones repetidas sobre distintas semillas producen trazas de observaciones y acciones utiles para analizar robustez de la politica.
- Pruebas de integracion de la libreria `microduck`: validar la carga de `manifest.json` (esquema 2) y la inferencia ONNX en un pipeline propio sin depender del espacio web de la Arena.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con `arena score` de la Microduck Arena sobre Linux x86-64 y las semillas oficiales:

| Metrica | Resultado |
|---|---|
| Tiempo de carrera, semilla oficial 1 | 0,76 s |
| Tiempo de carrera, semilla oficial 2 | 0,76 s |
| Tiempo de carrera, semilla oficial 3 | 0,76 s |
| Tiempo de carrera, semilla oficial 4 | 0,76 s |
| Tiempo de carrera, semilla oficial 5 | 0,76 s |
| Media | 0,760 s |

Advertencia del autor: son cifras *in-sample*, porque la búsqueda puntuó los candidatos sobre las mismas semillas empleadas en la medición. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; por la naturaleza del artefacto (entrada de 61 valores, salida de 14) y un repositorio de 0,0 GB, la inferencia es viable en CPU sin GPU dedicada.
- GPU recomendadas: no disponibles ni necesarias; el autor reporta la evaluacion en Linux x86-64, sin mencionar acelerador.
- GPU de consumo: el modelo cabe holgadamente en cualquier GPU de consumo e incluso en entornos sin GPU; no se han publicado requisitos minimos.
- Opciones de despliegue: ONNX Runtime como motor de inferencia, la libreria `microduck` para la carga del manifiesto y el espacio `pollen-robotics/microduck-arena` para la evaluacion oficial. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles. El dato de 0,760 s corresponde al tiempo de carrera dentro de la simulacion, no a latencia de inferencia en hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / E-S | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| `austindixson/microduck-hill-improver` | No disponible | `obs` [1, 61] / `actions` [1, 14] | No declarada | 0,760 s de media en 5 semillas (in-sample) | Hugging Face, ONNX |
| `dashi/microduck-hill-remix-r760` (base) | No disponible | `obs` [1, 61] / `actions` [1, 14] (misma interfaz declarada por el remix) | No declarada | No disponible en la informacion proporcionada | Hugging Face |
| Otras entradas de la Microduck Arena | No disponible | No disponible | No disponible | No disponible | Espacio `pollen-robotics/microduck-arena` |

La comparacion con alternativas de la misma categoria (otras políticas de Hill Climb) no puede completarse con los datos disponibles: no se han proporcionado parametros, tiempos ni licencias de otros participantes.

## Limitaciones y advertencias

- **No apto para robot fisico**: el autor indica explicitamente que el modelo se entreno y evaluo solo en el simulador de la Arena y que no debe cargarse en un MicroDuck real.
- **Sobreajuste a las semillas de evaluacion**: los 0,760 s son *in-sample*; la busqueda se puntuo sobre las mismas semillas usadas para reportar el resultado, por lo que el rendimiento fuera de ese conjunto es desconocido.
- **Especializacion extrema**: cubre una unica tarea (ascenso de 1,5 m) y una unica semilla objetivo (semilla 1); no generaliza a otras tareas de robotica.
- **Licencia sin declarar**: ni el modelo base ni este repositorio especifican licencia, lo que genera incertidumbre juridica sobre cualquier uso, incluido el comercial o la redistribucion.
- **Opacidad de arquitectura**: no se publican numero de parametros, topologia ni detalles de entrenamiento, lo que dificulta auditar el comportamiento de la politica.
- **Riesgo de alucinacion**: no aplica, al no ser un modelo generativo de texto; el riesgo equivalente es la perdida de estabilidad de la politica ante condiciones no vistas en el simulador.
- **Idiomas y contexto**: no aplicables; no procesa lenguaje natural ni mantiene contexto conversacional.
- **Dependencia del entorno**: los resultados dependen de la version del simulador y de la implementacion de `arena score` en x86-64 Linux; otras plataformas o versiones pueden alterar las cifras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/austindixson/microduck-hill-improver
- Modelo base: https://huggingface.co/dashi/microduck-hill-remix-r760
- Microduck Arena (espacio de evaluacion): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil del autor del modelo base: https://huggingface.co/dashi
- Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las entradas devueltas corresponden a sitios de streaming sin relacion con el artefacto.
