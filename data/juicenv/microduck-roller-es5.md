# juicenv/microduck-roller-es5

## Resumen

microduck-roller-es5 es una política de control (policy) para el robot microduck de Pollen Robotics, publicada por el usuario juicenv. No es un modelo de lenguaje: se trata de un controlador neuronal que traduce observaciones del robot en comandos de actuación. Concretamente, produce una marcha perpetua sobre ruedas (rollers): recibe un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, de forma continua hasta que se le indique lo contrario. El autor lo describe como un "skater" de Roller Sprint de 2 m, lo que sitúa la tarea en el contexto de las competiciones de la Arena de microduck.

El modelo es un fine-tune del reference pollen-robotics/microduck-roller-sprint-2m-reference, ajustado mediante estrategias de evolución (evolution strategies) sobre el scorer de roller de la Arena. Se distribuye en formato ONNX, con el normalizador de observaciones integrado en el propio `policy.onnx`, de modo que el policy espera observaciones en crudo. Es la quinta ronda de ajuste y está verificado en x86.

Su relevancia es de nicho: es un artefacto de robótica y aprendizaje por refuerzo destinado a cargarse en una ranura de política del robot mediante el daemon `robotctl`, no a ejecutarse como modelo generativo. El repositorio es de tamano practicamente nulo (0,0 GB), coherente con una red de política compacta orientada a ejecución en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica de control (arquitectura concreta no disponible); observaciones de 61 dimensiones, 14 acciones, 50 Hz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; trabaja sobre observaciones de estado, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (se distribuye directamente como ONNX) |
| Idiomas soportados | no aplica (modelo de robotica, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` segun el esquema 2 del manifiesto de politicas de microduck |

## Arquitectura y entrenamiento

El autor indica que la politica fue fine-tuneada mediante estrategias de evolucion (evolution strategies) sobre el scorer de roller de la Arena, partiendo del reference pollen-robotics/microduck-roller-sprint-2m-reference. No se detalla en la informacion disponible la topologia exacta de la red (numero de capas, unidades, funcion de activacion), el tamano del espacio de busqueda ni la funcion de recompensa empleada, mas alla de la referencia al scorer de la Arena. Tampoco se especifica el numero de iteraciones, la poblacion utilizada ni el presupuesto de evaluacion.

Los datos de entrenamiento proceden del repositorio `pollen-robotics/microduck_rl`, rama `lean`, commit `5a3636302`. El modelo es el resultado de la quinta ronda de ajuste y esta verificado en x86. La tarea es una marcha perpetua: la politica no tiene un objetivo de terminacion y sigue generando acciones hasta que se le ordena lo contrario. El normalizador de observaciones esta integrado en el fichero ONNX, de modo que la entrada debe ser la observacion sin normalizar. No se dispone de informacion sobre el conjunto de datos, la composicion de las trayectorias ni si hubo etapas adicionales de refinamiento.

## Capacidades

- Control de locomocion sobre ruedas (rollers) del robot microduck, con una marcha perpetua de tipo "skater" orientada a la tarea de Roller Sprint.
- Traduccion de observaciones de 61 dimensiones en 14 acciones de actuacion a una frecuencia de 50 Hz.
- Normalizacion de observaciones integrada: acepta observaciones en crudo sin preprocesado externo.
- Ejecucion continua: la politica no se detiene por si misma y mantiene la marcha hasta recibir una orden de parada o de cambio.
- Carga directa en una ranura de politica (policy slot) del daemon via `robotctl`.
- Verificacion en x86 segun la model card.
- Soporte de tool calling / function calling: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (thinking mode, vision, audio): no disponible / no aplica.

## Casos de uso

- Control de locomocion en el robot microduck: la politica se carga en una ranura y gobierna las ruedas para producir una marcha continua. Es adecuada porque su interfaz (61 observaciones, 14 acciones, 50 Hz) coincide exactamente con la del robot.
- Participacion en la Arena de roller: el modelo fue ajustado especificamente contra el scorer de roller de la Arena, por lo que se puede emplear como candidato en competiciones o en evaluaciones internas de la misma tarea.
- Punto de partida para nuevos ajustes por estrategias de evolucion: al ser un fine-tune del reference y una "quinta ronda", puede servir como semilla para experimentos posteriores de la misma familia.
- Banco de pruebas de control en simulacion: si el flujo de microduck dispone de entorno simulado con observaciones equivalentes, la politica puede evaluarse alli antes de desplegarla en hardware.
- Investigacion en politicas perpetuas: util para estudiar politicas sin condicion de terminacion y su estabilidad a largo plazo sobre un robot real.
- Comparacion de metodos de optimizacion: al derivar del mismo reference que otras variantes, permite contrastar el efecto de las estrategias de evolucion frente a otros esquemas de entrenamiento.
- Validacion de la cadena de despliegue de microduck (`robotctl`, manifiesto de politica, slots): sirve como artefacto de prueba de la infraestructura de carga de politicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que el modelo esta verificado en x86 y que corresponde a la quinta ronda de ajuste sobre el scorer de roller de la Arena, sin aportar cifras de recompensa, velocidad, distancia recorrida ni comparaciones numericas con otras variantes.

## Requisitos de hardware

- VRAM estimada: no disponible; por la naturaleza del artefacto (repositorio de 0,0 GB y politica de 61 entradas y 14 salidas), es previsible que el modelo sea muy ligero y no requiera GPU dedicada, aunque no se confirma en la informacion disponible.
- GPU recomendadas: no disponible. Para una red de politica de este tipo, la inferencia suele ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no disponible; probablemente irrelevante dado el tamano del artefacto.
- Opciones de despliegue: el modelo se ejecuta en el robot mediante el daemon de microduck, cargandolo en una ranura con `sudo robotctl policy load <slot> juicenv/microduck-roller-es5`. La inferencia usa ONNX (`policy.onnx`). Otros motores (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El unico dato de temporizacion es la frecuencia de control de 50 Hz implicita en la especificacion de la tarea.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-roller-es5 | Politica de control (fine-tune por estrategias de evolucion) | 61 / 14 | 50 Hz | no disponible | HuggingFace |
| pollen-robotics/microduck-roller-sprint-2m-reference | Politica de control (reference) | no disponible | no disponible | no disponible | HuggingFace |
| Otras variantes de roller de microduck | Politica de control | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre otras politicas comparables (parametros, contexto, rendimiento) para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo de proposito general: su unico uso es el control del robot microduck sobre rollers.
- No se dispone de informacion sobre la licencia, por lo que se desconoce si su uso comercial esta permitido o restringido. Conviene contactar con el autor antes de cualquier despliegue productivo.
- El modelo es una politica perpetua: no tiene condicion de parada propia, por lo que requiere un mecanismo externo de supervision para detenerlo.
- Ajustado especificamente contra el scorer de roller de la Arena, por lo que su comportamiento optimo esta ligado a esa tarea y puede degradarse en condiciones distintas.
- Al ser un fine-tune de un reference, hereda las caracteristicas y posibles sesgos del modelo base `pollen-robotics/microduck-roller-sprint-2m-reference`.
- No hay datos publicados de robustez, estabilidad a largo plazo, comportamiento ante perturbaciones ni tasa de fallo en hardware real.
- No hay informacion sobre variabilidad de rendimiento entre unidades del robot ni sobre sensibilidad a calibraciones.
- La mencion de que esta "verificado en x86" no implica que se haya validado en el hardware final de despliegue.
- Repositorio sin descargas ni likes en el momento de la consulta: se trata de un artefacto practicamente sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-roller-es5
- Modelo base: https://huggingface.co/pollen-robotics/microduck-roller-sprint-2m-reference
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `lean`, commit `5a3636302`)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` del repositorio del daemon de microduck
