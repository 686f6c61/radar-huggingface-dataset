# jrubiosainz/microduck-game-sprinter-remix12

## Resumen

`jrubiosainz/microduck-game-sprinter-remix12` es un checkpoint de política de control para robótica, no un modelo de lenguaje. Se trata de un artefacto ONNX entrenado por refuerzo para la prueba de 2 metros de sprint en la Microduck Arena, un entorno de simulación de robótica con patas mantenido por Pollen Robotics. El modelo deriva de `rumezhak/microduck-sprint-remix-leader4`, que a su vez es un remix de `a1rb4Ck/microduck-sprint-2m`. La contribución de este checkpoint es una búsqueda CMA-ES sobre las acciones almacenadas en la tabla de búsqueda exacta por observación, que mejora los tiempos de las semillas oficiales 1 y 4.

La arquitectura subyacente es un MLP que genera comandos de marcha, seguido de una tabla de consulta exacta: si la observación actual coincide con una de las 332 observaciones almacenadas (diferencia máxima absoluta inferior a 1e-7 tras enmascarar las columnas de comando 48 a 60), se ejecuta la acción almacenada en lugar de la salida de la red. Este checkpoint sustituye 76 filas de esa tabla (38 para la semilla 1, 38 para la semilla 4) por acciones encontradas mediante búsqueda de lazo abierto con CMA-ES separable.

El resultado es una mejora marginal pero verificable en simulación: 0,821 s de media en las cinco semillas oficiales, frente a los 0,823 s del modelo base. El repositorio tiene un tamaño de 0,0 GB y 20 descargas. Es relevante como ejemplo de optimización de políticas de control mediante búsqueda directa sobre tablas de consulta, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (red de política) + tabla de búsqueda exacta por observación |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |
| Pipeline | robotics |
| Libreria | microduck |
| Modelo base | rumezhak/microduck-sprint-remix-leader4 |
| Relacion con modelo base | finetune |
| Tamano del repositorio | 0,0 GB |
| Descargas | 20 |
| Likes | 0 |
| Fecha de creacion | 2026-10-29 |
| Fecha de actualizacion | 2026-10-29 |

## Arquitectura y entrenamiento

La política combina un MLP que produce objetivos articulares con una tabla de consulta de 332 filas. Cada fila contiene una observación almacenada (`L_obs`) y una acción almacenada (`L_act`). En tiempo de inferencia, la observación se compara con las filas tras enmascarar las columnas de comando (48 a 60); si la diferencia máxima absoluta con la fila más cercana es inferior a 1e-7 (`L_tol`), se ejecuta la acción almacenada. En caso contrario, se usa la salida de la red. Esta tabla actúa como memoria de trayectorias exactas para las cinco semillas oficiales de la Arena.

El entrenamiento de este checkpoint no es entrenamiento de red neuronal: la red y el resto de inicializadores son idénticos byte a byte al modelo base. La modificación consiste en la sustitución de 76 filas de la tabla. Para la semilla 1 se ejecutaron tres rondas sucesivas de CMA-ES separable con 200 candidatos por generación: 389 generaciones sobre los offsets de los pasos de control 36 en adelante con paso inicial de 0,3 rad, 500 sobre los pasos 40 en adelante con 0,5 rad, y 341 sobre los pasos 32 en adelante con 0,2 rad, totalizando 1.230 generaciones y 246.000 carreras simuladas en unos 23 minutos sobre 15 núcleos de CPU. Para la semilla 4 se ejecutaron 490 generaciones de 200 candidatos (98.000 carreras simuladas, unos 9 minutos). Los offsets aplicados a los objetivos articulares alcanzan hasta 25,61 rad en la semilla 1 y 22,81 rad en la semilla 4. Las 255 filas restantes (semillas 2, 3 y 5, y pasos 0 a 27 de las semillas 1 y 4) se conservan byte a byte del modelo base.

## Capacidades

- Control de locomoción de un robot con patas en la prueba de 2 metros de sprint de la Microduck Arena, en simulación.
- Ejecución de políticas de lazo cerrado mediante MLP con memoria de acciones exactas para observaciones conocidas.
- Generalización a semillas no oficiales (6 a 60) mediante la red MLP, reproduciendo exactamente el comportamiento del checkpoint base en esas carreras.
- Optimización de trayectorias mediante búsqueda CMA-ES separable sobre secuencias de objetivos articulares en lazo abierto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.
- No dispone de modo de pensamiento ni de generación de texto.

## Casos de uso

- Investigación en optimización de políticas de control: el checkpoint sirve como caso de estudio de cómo la búsqueda directa CMA-ES sobre una tabla de consulta puede mejorar tiempos de ejecución sin reentrenar la red, con un coste computacional de minutos en CPU.
- Reproducción de resultados en la Microduck Arena: permite verificar las mejoras reportadas en las semillas 1 y 4 (0,815 s y 0,820 s frente a 0,820 s y 0,825 s del base) usando el runner versión 5.
- Benchmarking de métodos de búsqueda de lazo abierto: las 1.230 generaciones y 246.000 carreras simuladas de la semilla 1 documentan el coste de convergencia de CMA-ES en este dominio.
- Análisis de memorización versus generalización: la comparación entre las carreras de las semillas oficiales (tabla) y las 55 semillas adicionales (red MLP) permite estudiar el equilibrio entre lookup exacto y política neuronal.
- Desarrollo de técnicas de sustitución de filas en tablas de consulta: el método de reemplazo de filas con observaciones registradas en el runner y acciones buscadas es replicable en otros entornos de control con tablas similares.
- Docencia en robótica y aprendizaje por refuerzo: ejemplo concreto de pipeline completo (simulación, búsqueda de hiperparámetros, evaluación en semillas oficiales) con licencia Apache-2.0 y artefacto ONNX de tamaño reducido.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son los tiempos de finalización en las cinco semillas oficiales de la Microduck Arena, en simulación y con el runner versión 5.

| Semilla oficial | Modelo base (leader4) | Este checkpoint |
|---|---|---|
| Semilla 1 | 0,820 s | 0,815 s |
| Semilla 2 | 0,820 s | 0,820 s (idéntico) |
| Semilla 3 | 0,830 s | 0,830 s (idéntico) |
| Semilla 4 | 0,825 s | 0,820 s |
| Semilla 5 | 0,820 s | 0,820 s (idéntico) |
| Media (5 semillas) | 0,823 s | 0,821 s |

En las semillas 6 a 60, el comportamiento es exactamente el del checkpoint base, ya que ninguna observación coincide con las filas modificadas y se ejecuta la red MLP sin cambios. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el artefacto es un `policy.onnx` de una política MLP con tabla de consulta, por lo que la huella de memoria es muy reducida (órdenes de MB, no de GB).
- GPU recomendadas: no disponible; el modelo base se evaluó en simulación y la búsqueda CMA-ES se ejecutó en CPU (15 núcleos, 23 minutos para la semilla 1 y 9 minutos para la semilla 4).
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del artefacto, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: el runner de la Microduck Arena (versión 5) y el entorno de simulación de Pollen Robotics; el formato ONNX permite inferencia con ONNX Runtime.
- Latencia y throughput: no disponibles; los tiempos reportados son de finalización de carrera en simulación, no de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (media 5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-game-sprinter-remix12 | no disponible (MLP + tabla de 332 filas) | no aplica | 0,821 s | Apache-2.0 | HuggingFace |
| rumezhak/microduck-sprint-remix-leader4 | no disponible (MLP + tabla) | no aplica | 0,823 s | Apache-2.0 | HuggingFace |
| a1rb4Ck/microduck-sprint-2m | no disponible (MLP + tablas para 5 semillas) | no aplica | no disponible en la información proporcionada | Apache-2.0 | HuggingFace |
| jrubiosainz/microduck-game-sprinter-remix10 | no disponible | no aplica | no disponible en la información proporcionada | no disponible | HuggingFace |

La comparación se limita a la familia Microduck Sprint; no se dispone de datos de otros modelos de control de locomoción comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que el modelo es únicamente para simulación; no hay evidencia de transferencia a un robot físico.
- Mejora marginal: la ganancia es de 0,002 s en la media de cinco semillas y se limita a las semillas 1 y 4; las semillas 2, 3 y 5 son idénticas al modelo base.
- Sobreajuste a semillas oficiales: las filas modificadas contienen observaciones registradas en el runner para semillas concretas; en semillas no oficiales (6 a 60) el comportamiento es exactamente el del base, sin mejora.
- Dependencia de coincidencia exacta: el lookup exige una diferencia máxima absoluta inferior a 1e-7; cualquier variación numérica en la observación desactiva la tabla y recurre a la red MLP.
- Offsets articulares extremos: los desplazamientos aplicados alcanzan 25,61 rad y 22,81 rad, valores que pueden no ser físicamente realizables en hardware real.
- Sin datos de sesgo, alucinación o multilingüismo: no aplican a este tipo de modelo, pero tampoco se documentan evaluaciones de robustez fuera del entorno de la Arena.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y los intermedios también son Apache-2.0 según la información disponible; conviene verificar la cadena completa de atribuciones.
- Repositorio con 0 likes y 20 descargas: poca validación comunitaria independiente.
- Fecha de creación futura (2026-10-29): inconsistencia temporal en los metadatos que conviene verificar antes de citar el recurso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix12
- Modelo base: https://huggingface.co/rumezhak/microduck-sprint-remix-leader4/tree/0a6ae1f67d4eff40a0e08165ad526844bdfeb54e
- Modelo original: https://huggingface.co/a1rb4Ck/microduck-sprint-2m/tree/000f06a92dc9bb151501b48d9472be5089272405
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Checkpoint previo del mismo autor: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix10
- Perfil del autor del base: https://huggingface.co/rumezhak
- Perfil del autor original: https://huggingface.co/a1rb4Ck
