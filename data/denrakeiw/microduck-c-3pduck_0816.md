# DenRakEiw/microduck-c-3pduck_0816

## Resumen

`DenRakEiw/microduck-c-3pduck_0816` es una politica de control motor entrenada con aprendizaje por refuerzo (RL) para el robot bipedo microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un controlador de locomocion que recibe un vector de observacion de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ocupar el slot `walk` del robot. Su objetivo declarado es una subida de colina de 1,5 m en modo carrera, y ha sido ajustada mediante estrategias de evolucion (evolution strategies) sobre el scorer de colinas de la Arena.

El modelo esta publicado por el usuario DenRakEiw dentro de la libreria `microduck`, en formato ONNX, con la normalizacion de observaciones integrada en el propio fichero `policy.onnx`, de modo que el robot puede consumir observaciones en crudo. Se distribuye junto a un `manifest.json` que sigue el esquema 2 del manifiesto de politicas del daemon de microduck, y se carga en el robot con el comando `robotctl policy load walk DenRakEiw/microduck-c-3pduck_0816`.

Su relevancia actual es limitada y muy nicho: cero descargas y cero "likes" en el momento de la consulta, licencia no especificada y ausencia total de cifras de rendimiento publicadas. Se enmarca en el ecosistema abierto de microduck (robot bipedo de 25 cm, 15 motores, camara, LiDAR y pico prensil, con pila de software open source), donde distintos autores publican politicas por slot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de politica neuronal; el repositorio no publica capas ni topologia) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de control motor, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (control de locomocion, sin entrada ni salida de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (esquema 2) |
| Entrada (observacion) | vector de 61 dimensiones |
| Salida (acciones) | 14 acciones |
| Frecuencia de control | 50 Hz |
| Slot | `walk` |
| Comportamiento | politica perpetua (se ejecuta hasta recibir orden de parada) |
| Libreria | `microduck` |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de la red. Se sabe que es una politica de RL con espacio de observacion de 61 dimensiones y espacio de accion de 14 dimensiones, ejecutada a 50 Hz, es decir, con un ciclo de control de 20 ms. La model card indica que la normalizacion de observaciones esta embebida en `policy.onnx`, por lo que no hace falta replicar el preprocesado en el host. El entrenamiento se realizo en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `d6a27c4d1`; no se especifican numero de iteraciones, simulador, presupuesto de computo ni composicion de datos.

El dato tecnico mas distintivo es el metodo de ajuste: la politica parte de RL y se afina despues con estrategias de evolucion sobre el scorer de colinas de la Arena, con el objetivo de completar una subida de 1,5 m en modo carrera. Este esquema de RL mas optimizacion evolutiva es habitual en control de robots bipedos porque permite optimizar directamente una funcion de recompensa no diferenciable (el scorer de la competicion). No se documenta si hubo fases adicionales de destilacion, curriculum o aleatorizacion de dominio.

## Capacidades

- Locomocion bipeda continua: genera una marcha para el slot `walk` del microduck y se mantiene activa indefinidamente hasta que se le ordena lo contrario.
- Control reactivo a 50 Hz: produce 14 acciones por ciclo de control (cada 20 ms) a partir de 61 observaciones.
- Normalizacion integrada: acepta observaciones en crudo, ya que el normalizador esta embebido en `policy.onnx`.
- Despliegue en robot real: se carga mediante `robotctl policy load walk DenRakEiw/microduck-c-3pduck_0816` y sigue el manifiesto de politicas esquema 2 del daemon.
- Subida de colinas: comportamiento orientado a ascender pendientes de 1,5 m en modo carrera segun el scorer de la Arena.
- No soporta tool calling ni function calling: no aplica a un modelo de control motor.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues, de vision, audio o generacion de texto.

## Casos de uso

- Control de locomocion base del microduck: sirve como politica del slot `walk` para que el robot camine de forma autonoma y sostenida durante una sesion completa, sin necesidad de enviar comandos de marcha repetidos.
- Demostraciones de robotica bipeda en ferias, aulas o museos: al ser una politica perpetua, el robot puede mantenerse caminando mientras el publico interactua, y basta cargarla por CLI en el daemon.
- Investigacion en RL y optimizacion evolutiva: sirve como referencia de partida para estudiar como cambia el rendimiento al afinar una politica de RL con estrategias de evolucion sobre un scorer concreto (el de colinas de la Arena).
- Benchmark interno de controladores: permite comparar distintas politicas por slot y por autor dentro del mismo robot y del mismo scorer, en igualdad de hardware.
- Pruebas de esfuerzo y validacion de hardware: la subida de 1,5 m es un escenario exigente para motores y control termico; la politica permite reproducir esa carga de forma repetible en laboratorio.
- Docencia de robotica con aprendizaje por refuerzo: el flujo completo (entrenar en simulacion, exportar a ONNX, cargar con `robotctl`) es un caso practico cerrado y asequible para estudiantes.
- Navegacion autonoma de base en terrenos con pendiente: combinada con la percepcion del robot (camara y LiDAR) y capas de planificacion externas, la politica aporta la capa de marcha para desplazamientos en pendiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el objetivo de la politica (subida de colina de 1,5 m en modo carrera, evaluada con el scorer de la Arena), pero no aporta cifras de exito, tiempo de ascension, distancia recorrida, consumo ni estabilidad. Tampoco hay comparaciones con otras politicas del mismo robot.

## Requisitos de hardware

- VRAM para inferencia: no disponible; por la naturaleza del modelo (61 entradas, 14 salidas, formato ONNX) no requiere GPU dedicada y esta pensado para ejecutarse en la computadora del propio robot.
- GPU recomendadas para inferencia: no aplica; el despliegue es en el hardware embebido del microduck a traves de su daemon.
- Capacidad en GPU de consumo: no aplica para inferencia; el entrenamiento original se realizo en `pollen-robotics/microduck_rl` y sus requisitos de computo no se especifican en la informacion disponible.
- Robot objetivo: microduck, bipedo de 25 cm con 15 motores, camara, LiDAR y pico prensil.
- Opciones de despliegue: daemon de microduck mediante `robotctl policy load walk ...`, con runtime ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de control motor).
- Latencia: el ciclo de control es de 20 ms por accion (50 Hz), fijado por el propio diseno de la politica.
- Throughput, consumo energetico y tiempo de inferencia por ciclo: no disponibles.

## Comparativa con modelos similares

| Modelo | Autor | Slot | Formato | Licencia | Adopcion publica |
|---|---|---|---|---|---|
| microduck-c-3pduck_0816 | DenRakEiw | `walk` | ONNX | no disponible | 0 descargas, 0 likes |
| microduck-c-3pduck_0896 | DenRakEiw | no disponible | ONNX | no disponible | no disponible |
| microduck-sprint-baseline | DenRakEiw | no disponible (la tarjeta menciona `walk`, `stand`, `sitstand`, `ground_pick`, `kick_left`, `kick_right`, `roulade` como slots del sistema) | ONNX | no disponible | no disponible |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas, por lo que la comparacion cuantitativa no es posible. Los tres modelos proceden del mismo autor y del mismo ecosistema (microduck), y el criterio diferenciador documentado es el slot de politica y el escenario de entrenamiento.

## Limitaciones y advertencias

- Licencia no especificada: no hay base legal publicada para uso comercial ni para redistribucion; conviene aclararlo con el autor antes de integrarlo en un producto.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion independiente ni evidencia de terceros sobre su funcionamiento en hardware real.
- Ausencia de especificaciones: no se publican numero de parametros, topologia de red, ni detalles del entrenamiento (iteraciones, simulador, datos), lo que dificulta auditar el comportamiento.
- Anomalia en los metadatos: la fecha de creacion registrada es 2026-10-16, posterior a la fecha habitual de publicacion; conviene verificar la vigencia y autenticidad del repositorio.
- Tamano de repositorio de 0,0 GB: no se confirma desde los metadatos que los artefactos (`policy.onnx`, `manifest.json`) esten efectivamente alojados y sean descargables.
- Sobreajuste al scorer: al estar afinada con estrategias de evolucion sobre el scorer de colinas de la Arena, existe riesgo de que el comportamiento se especialice en las condiciones de ese evaluador y no generalice a otras pendientes, superficies o cargas.
- Politica perpetua sin condicion de parada propia: la marcha se mantiene hasta que otro componente la detiene; requiere gestion externa del ciclo de vida y de los fallos.
- Especificidad de hardware: esta ligada a la morfologia y a los 15 motores del microduck; no es transferible a otras plataformas sin reentrenamiento.
- Sin datos de robustez: no se informa del comportamiento ante empujes, cambios de terreno, bateria baja o desgaste mecanico, aspectos criticos en produccion.
- Rendimiento no medido: no hay cifras publicas de tasa de exito en la subida de 1,5 m ni de estabilidad, por lo que no puede compararse objetivamente con otras politicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-c-3pduck_0816
- Variante del mismo autor: https://huggingface.co/DenRakEiw/microduck-c-3pduck_0896
- Baseline del mismo autor: https://huggingface.co/DenRakEiw/microduck-sprint-baseline
- Pagina oficial del robot microduck (Pollen Robotics): https://pollen-robotics.com/microduck/
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL citado en la model card: `pollen-robotics/microduck_rl` (rama `denrakeiw`, commit `d6a27c4d1`); URL no verificada en la informacion disponible.
- Tutorial de montaje y puesta en marcha: https://github.com/AI-FanGe/Microduck-build-tutorial
