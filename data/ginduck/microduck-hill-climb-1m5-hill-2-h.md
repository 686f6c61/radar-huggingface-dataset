# GinDuck/microduck-hill-climb-1m5-hill-2-h

## Resumen

microduck-hill-climb-1m5-hill-2-h es un checkpoint de politica de control para el robot cuadrupedo microduck de Pollen Robotics, desarrollado por el usuario GinDuck. No es un modelo de lenguaje ni un modelo generativo de proposito general: es una politica de aprendizaje por refuerzo entrenada para que el robot suba una rampa de 1,5 metros de desnivel. El modelo se distribuye como un fichero ONNX junto con un manifiesto que lo integra en el daemon de control del robot.

La politica opera en bucle cerrado a 50 Hz, consumiendo observaciones de 61 dimensiones y emitiendo 14 acciones (comandos articulares). Es una politica perpetua: una vez cargada en una ranura del daemon, ejecuta la marcha indefinidamente hasta que se le indique lo contrario. El normalizador de observaciones esta embebido en el propio `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo.

El interes de este checkpoint es acotado pero concreto: documenta el resultado de una ejecucion de entrenamiento (race-2, checkpoint 1000, semilla 1) sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, con trazabilidad completa de commit, version base y comando de reproduccion. Segun el autor, la politica alcanzo la cima en las cinco pruebas realizadas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (red neuronal) exportada a ONNX; arquitectura interna no detallada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (modelo de control roboticos, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de politicas microduck) |

## Arquitectura y entrenamiento

El modelo es una politica de control entrenada mediante aprendizaje por refuerzo en simulacion con el framework mjlab (version 0.1.0, commit 1efd853be), sobre la tarea `Mjlab-HillClimb1m5-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El entrenamiento se lanzo el 2 de noviembre de 2026 con 4096 entornos paralelos, un maximo de 3000 iteraciones y semilla 1, con registro en TensorBoard bajo el nombre de ejecucion `hill-2`. Este checkpoint corresponde a la iteracion 1000, es decir, a una fase temprana del entrenamiento.

La politica es de tipo perpetuo y opera a 50 Hz. El autor indica que la receta de marcha es compartida con TheSauceman. La reproducibilidad no es bit a bit: el propio autor advierte que repetir el comando con el mismo `uv.lock` y la misma semilla produce una politica comparable, no identica, porque el entrenamiento con RL en GPU no es determinista entre maquinas. No se detalla la topologia de la red, el algoritmo de RL empleado (PPO u otro), ni la composicion del dataset de simulacion mas alla de la referencia a mjlab.

## Capacidades

- Locomocion cuadrupeda: ejecuta una marcha que asciende una rampa de 1,5 metros de desnivel.
- Control en bucle cerrado a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Politica perpetua: se ejecuta de forma continua hasta recibir una orden de parada o reemplazo.
- Normalizacion de observaciones integrada en el grafo ONNX, lo que permite alimentar observaciones sin preprocesar.
- Integracion con el daemon del robot mediante `robotctl policy load <slot>`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Demostracion de ascenso de rampa en microduck: cargar la politica en una ranura del daemon y dejar que el robot suba una rampa de 1,5 m. Es el escenario para el que fue entrenada y el unico validado por el autor.
- Benchmark de recetas de RL: servir como referencia intermedia (checkpoint 1000 de 3000) para comparar curvas de aprendizaje frente a otros checkpoints de la misma ejecucion `hill-2`.
- Reproduccion de experimentos: el manifiesto incluye commit, version base, semilla y comando exacto, lo que permite reentrenar y contrastar politicas comparables en otra maquina.
- Base para fine-tuning o destilacion: al ser una politica ONNX con normalizador embebido, puede usarse como inicializacion en tareas de locomocion similares dentro de mjlab.
- Pruebas de integracion del daemon: validar el flujo `robotctl policy load` y el esquema 2 del manifiesto de politicas en un robot real o simulado.
- Docencia e investigacion en robotica con RL: ejemplo completo y trazable de un pipeline de entrenamiento (4096 entornos, TensorBoard, exportacion ONNX) sobre hardware de bajo coste como microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es cualitativo: la politica alcanzo la cima de la rampa en las cinco pruebas realizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeno, pero no se confirma el numero de parametros.
- GPU recomendadas: no disponible. Para inferencia en el robot, el modelo se ejecuta en el propio microduck a traves del daemon, no en una GPU de servidor.
- Cabe en GPU de consumo: muy probablemente si, dado el tamano del repositorio, aunque no hay confirmacion explicita.
- Opciones de despliegue: daemon de microduck con `robotctl policy load <slot>`; runtime ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: fijados por el bucle de control a 50 Hz (20 ms por paso). No se publican cifras de latencia adicionales.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas de microduck comparables ni sus especificaciones. El propio autor menciona una receta compartida con TheSauceman, pero no se aportan datos de ese modelo.

## Limitaciones y advertencias

- Alcance muy restringido: la politica esta entrenada exclusivamente para subir una rampa de 1,5 m; no se garantiza su comportamiento en terrenos distintos.
- Checkpoint temprano: corresponde a la iteracion 1000 de un maximo de 3000, por lo que puede ser menos robusta que checkpoints posteriores de la misma ejecucion.
- Validacion limitada: las cinco pruebas exitosas son del propio autor; no hay evaluacion independiente ni metricas cuantitativas publicadas.
- No reproducible bit a bit: reentrenar con la misma semilla produce pesos distintos, segun advierte el autor.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de fallo en el robot real: al ser una politica de RL simulada, puede presentar comportamientos inesperados ante perturbaciones no vistas en entrenamiento (empujones, superficies deslizantes, fallos de sensores).
- Sin soporte linguistico ni de razonamiento: no debe evaluarse con criterios de modelos de lenguaje.
- Repositorio sin traccion: 0 descargas y 0 likes, sin senales de uso o validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2-h
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
