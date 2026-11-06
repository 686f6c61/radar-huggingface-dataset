# dadudu/microduck-bubu-tug-self1

## Resumen

`microduck-bubu-tug-self1` es una politica de control entrenada mediante aprendizaje por refuerzo para el robot cuadrupedo microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto de inferencia (un grafo ONNX) que traduce observaciones de 61 dimensiones en 14 acciones de control a 50 Hz, con el objetivo de ejecutar una marcha de "tira y afloja" (tug of war) de forma perpetua. Lo publica el usuario `dadudu` bajo el identificador `dadudu/microduck-bubu-tug-self1` y se encuadra en el ecosistema de retos de microduck (`microduck-challenges`).

El modelo se ha entrenado con el simulador mjlab (variante `mjlab-microduck 0.1.0`), a partir de la tarea `Mjlab-TugOfWar-MicroDuck`, con 4096 entornos paralelos, semilla 1 y checkpoint 250. El resultado es una politica "self-trained" (entrenada por el propio autor, sin partir de un checkpoint previo identificado en la model card) que se carga en una ranura de politica del daemon del robot mediante `robotctl`.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de politicas de locomocion en microduck, con un artefacto listo para ejecutar en hardware real. El repositorio es de 0.0 GB, no tiene descargas ni likes en el momento de la consulta y no declara licencia ni idiomas, lo que limita su uso fuera del entorno del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control entrenada con RL (no se especifica la topologia de red en la model card; se distribuye como grafo ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica reactiva por paso, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Duracion de la politica | perpetua (se ejecuta hasta recibir orden de parada) |
| Libreria | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card no describe la topologia interna de la red (capas, activaciones, numero de parametros). Lo que si se documenta es el contrato de entrada/salida: observaciones crudas de 61 dimensiones y 14 acciones a 50 Hz, con la normalizacion de observaciones integrada dentro de `policy.onnx` (el consumidor debe alimentar observaciones sin normalizar). El artefacto se empaqueta con un `manifest.json` conforme al esquema 2 del manifiesto de politicas del daemon de microduck.

El entrenamiento se realizo con mjlab (base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre la tarea `Mjlab-TugOfWar-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, en el commit `c3f5a8066`, con 4096 entornos paralelos, un maximo de 1000 iteraciones del agente, semilla 1 y checkpoint final 250, registrando en TensorBoard con el nombre de ejecucion `bubu-tug-su1-p4`. El autor advierte explicitamente de que el entrenamiento no es bit-reproducible entre maquinas: repetir el comando con el mismo codigo, `uv.lock` y semilla produce una politica comparable, no los mismos pesos.

## Capacidades

- Locomocion cuadrupeda: ejecuta una marcha de tira y afloja de forma continua sobre el microduck.
- Politica perpetua: no tiene horizonte temporal fijo; se mantiene activa hasta que se le indique lo contrario.
- Control reactivo a 50 Hz a partir de observaciones crudas de 61 dimensiones.
- Normalizacion de observaciones integrada en el grafo ONNX, lo que simplifica la integracion en el daemon.
- Carga en caliente en una ranura de politica mediante `robotctl policy load <slot> dadudu/microduck-bubu-tug-self1`.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues: no es un modelo generativo.

## Casos de uso

- Demostracion de tira y afloja robotica: cargar la politica en una ranura del microduck y enfrentar dos unidades para reproducir el reto `Mjlab-TugOfWar-MicroDuck` en hardware real.
- Validacion del pipeline de entrenamiento: usar este checkpoint como referencia para comprobar que una reinstalacion de `microduck-challenges` en el commit `c3f5a8066` produce politicas comparables.
- Baseline de comparacion: servir como punto de partida para medir el efecto de cambios en recompensas, numero de entornos o semilla en la tarea de tug of war.
- Pruebas de integracion del daemon: verificar el flujo `robotctl policy load` y el cumplimiento del esquema 2 de `manifest.json` en un entorno de CI del daemon.
- Docencia e investigacion en RL robotico: ejemplo compacto de politica ONNX con observacion y accion bien definidas para estudiar sim-to-real en un cuadrupedo de bajo coste.
- Benchmark de latencia en el borde: medir el coste de inferencia de `policy.onnx` a 50 Hz en la computadora del robot y evaluar si cumple el presupuesto de tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasa de exito, distancia recorrida ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el modelo se distribuye como ONNX, por lo que se espera que quepa en el propio computador del microduck.
- GPU recomendadas: no disponible. El entrenamiento se ejecuto con 4096 entornos paralelos, lo que en la practica requiere una GPU de datacenter, pero la model card no especifica el hardware utilizado.
- Cabe en GPU de consumo: no confirmado; por el tamano del artefacto es plausible, pero no hay datos publicados.
- Opciones de despliegue: runtime ONNX en el daemon de microduck mediante `robotctl policy load`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a una politica de control).
- Latencia y throughput: no disponibles; el contrato exige 50 Hz (20 ms por paso), pero no se publica el tiempo de inferencia medido.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas de microduck ni resultados que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial y la redistribucion quedan sin marco legal explicito.
- El autor indica que el entrenamiento no es bit-reproducible: los pesos no pueden regenerarse de forma identica.
- El alcance es una unica tarea (`Mjlab-TugOfWar-MicroDuck`); no se documenta su generalizacion a otras tareas o terrenos.
- No hay datos de sim-to-real publicados: se desconoce el rendimiento en hardware fisico mas alla de la afirmacion de que la politica esta pensada para ejecutarse en el robot.
- El checkpoint es 250 sobre un maximo de 1000 iteraciones; no se justifica en la model card por que se selecciono ese punto.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de terceros.
- No se documentan sesgos (no aplica a un modelo de lenguaje), pero si existe el riesgo habitual de sobreajuste al simulador y a la semilla 1.
- No se especifican los idiomas ni la region de despliegue prevista; la etiqueta `region:us` aparece en los tags de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dadudu/microduck-bubu-tug-self1
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: `c3f5a8066` en `microduck-challenges`
- Base del simulador: `mjlab-microduck 0.1.0 @ 1efd853be`
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
