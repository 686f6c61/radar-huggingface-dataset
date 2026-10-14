# DenRakEiw/microduck-senate_duck_1772

## Resumen

`microduck-senate_duck_1772` es una política de control (policy) de locomocion para el robot bipedo de codigo abierto microduck, desarrollado por el usuario DenRakEiw. No es un modelo de lenguaje: es una red neuronal entrenada por aprendizaje por refuerzo (concretamente mediante estrategias de evolucion, *evolution strategies*) que controla las articulaciones del robot para ejecutar una marcha concreta. El modelo se publica en formato ONNX e incluye un `manifest.json` conforme al esquema 2 del manifiesto de politicas de microduck.

La politica esta etiquetada como "2 m Roller Sprint: gladstone fine-tuned by evolution strategies on the Arena's roller scorer" y se describe como una politica *perpetua* para el slot de marcha `walk`. Recibe una observacion de 61 dimensiones y emite 14 acciones a 50 Hz, ejecutandose de forma continua hasta que se le indica lo contrario. El nombre del autor sugiere que deriva de una politica base ("gladstone") posteriormente refinada con estrategias de evolucion usando la funcion de puntuacion del "roller scorer" del entorno Arena.

El modelo es relevante dentro del ecosistema microduck porque ejemplifica el flujo de trabajo tipico de la robotica con RL: entrenamiento en simulacion sobre un repositorio comun (`pollen-robotics/microduck_rl`), exportacion a ONNX con normalizador de observaciones integrado y despliegue directo en el robot fisico mediante el demonio `robotctl`. Se trata, por tanto, de un artefacto de control de bajo nivel y no de un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica para control (formato ONNX); topologia interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (policy de control; observacion de 61 dimensiones que se realimenta en bucle) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas microduck) |
| Dimension de observacion | 61 |
| Dimension de acciones | 14 |
| Frecuencia de control | 50 Hz |
| Slot de politica | `walk` |
| Comportamiento | perpetuo (se ejecuta hasta recibir orden contraria) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia interna de la red (numero de capas, unidades ocultas ni tipo de funcion de activacion). Lo que si se especifica es que se trata de una politica para el robot microduck que consume un vector de observacion de 61 dimensiones y produce 14 salidas de accion a 50 Hz, y que el normalizador de observaciones esta integrado dentro del propio `policy.onnx`, de modo que la alimentacion de observaciones debe hacerse en crudo (sin preprocesado externo). La salida se exporta a ONNX, un formato de inferencia portable y adecuado para ejecucion en el hardware embebido del robot.

En cuanto al entrenamiento, la model card indica que la politica se obtuvo afinando ("fine-tuned") un modelo base llamado "gladstone" mediante estrategias de evolucion (*evolution strategies*), optimizando la funcion de puntuacion del "roller scorer" del entorno Arena. El entrenamiento se realizo sobre el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`. No se especifican el numero de episodios, el numero de iteraciones de evolucion, la composicion del dataset de simulacion ni si se aplicaron tecnicas adicionales de regularizacion. No hay informacion sobre decodificacion especulativa ni mecanismos de atencion, que no aplican a este tipo de artefacto.

## Capacidades

- Control de locomocion bipeda: genera una marcha para el slot `walk` del robot microduck a partir de observaciones proprioceptivas de 61 dimensiones.
- Ejecucion de politica perpetua: el comportamiento se mantiene de forma continua hasta que un comando externo lo detiene o lo sustituye.
- Inferencia autonoma a bordo: al estar exportada a ONNX con el normalizador integrado, puede ejecutarse directamente en el robot sin preprocesado adicional.
- Tarea especifica "2 m Roller Sprint": la politica esta optimizada para la funcion de puntuacion del roller scorer del entorno Arena, segun la descripcion del autor.
- Integracion con el demonio de control: se carga mediante `robotctl policy load walk DenRakEiw/microduck-senate_duck_1772`.
- Sin tool calling, sin soporte de agentes, sin capacidades multilingues ni de vision/audio: no aplica a este tipo de modelo.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para robotica: sirve como punto de partida o linea base al comparar variantes de politicas de marcha sobre el mismo hardware y el mismo entorno de simulacion, dado que comparte configuracion (61-D de observacion, 14 acciones, 50 Hz).
- Despliegue de una marcha funcional en el robot microduck fisico: cargando el modelo en el slot `walk` mediante `robotctl`, el robot puede ejecutar una locomocion bipeda entrenada sin necesidad de reentrenar.
- Reproduccion de experimentos: al publicarse junto con la referencia exacta del repositorio, rama y commit (`microduck_rl`, `denrakeiw`, `b76573f1a`), permite reproducir o auditar el pipeline de entrenamiento.
- Benchmarking interno entre politicas: al existir variantes hermanas del mismo autor (por ejemplo, `microduck-senate_duck_1472`), facilita comparar el rendimiento de distintas politicas bajo el mismo scorer.
- Docencia y prototipado en robotica: adecuado para talleres donde se ensena a entrenar, exportar y desplegar politicas RL en hardware real, apoyandose en tutoriales de construccion y puesta en marcha de microduck.
- Pruebas de robustez de locomocion: util para evaluar como se comporta una marcha afinada por estrategias de evolucion ante perturbaciones fisicas o cambios de superficie en el entorno real.
- Desarrollo de comportamientos compuestos: la politica `walk` puede integrarse como habilidad base dentro de un sistema de control de mayor nivel que combine marcha, sedestacion u otras habilidades del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el ajuste se realizo contra el "roller scorer" del entorno Arena, pero no se proporciona la puntuacion obtenida ni metricas comparativas.

## Requisitos de hardware

- VRAM de inferencia: no disponible; al ser una politica de control de formato ONNX y con un repositorio de 0.0 GB, el modelo es previsiblemente muy ligero, pero no se han publicado cifras concretas.
- GPU recomendadas: no disponible. Para una politica ONNX de este tipo, la inferencia suele poder ejecutarse en CPU o en el propio hardware embebido del robot.
- Compatibilidad con GPU de consumo: no disponible, aunque por el tamano descrito del artefacto es probable que sea viable en hardware modesto; no se confirma.
- Opciones de despliegue: demonio de microduck mediante `robotctl` (`sudo robotctl policy load walk DenRakEiw/microduck-senate_duck_1772`); ejecucion de ONNX Runtime para inferencia portable. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms por ciclo); no se publican cifras de latencia ni throughput adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Frecuencia | Slot | Formato | Licencia |
|---|---|---|---|---|---|---|
| DenRakEiw/microduck-senate_duck_1772 | Politica RL (ONNX) | 61-D / 14 | 50 Hz | `walk` | ONNX + manifest | no disponible |
| DenRakEiw/microduck-senate_duck_1472 | Politica RL (ONNX) | no disponible | no disponible | no disponible | ONNX + manifest | no disponible |

Solo se ha identificado un modelo directamente comparable en la busqueda web (la variante `microduck-senate_duck_1472` del mismo autor), pero no se dispone de sus especificaciones detalladas ni de datos de rendimiento para establecer una comparacion cuantitativa. No se han encontrado otros modelos de la misma categoria con datos publicados en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona sobre lenguaje natural y no admite tool calling; cualquier uso fuera del control de locomocion del robot microduck queda fuera de su proposito.
- Licencia no disponible: al no especificarse licencia en la model card ni en los metadatos, el uso comercial y la redistribucion quedan en un estado legal indeterminado; conviene contactar con el autor antes de cualquier uso en produccion.
- Especificidad de tarea: la politica esta optimizada para el scorer del entorno Arena y para el slot `walk`; su comportamiento fuera de ese contexto no esta garantizado.
- Comportamiento perpetuo: al ejecutarse de forma continua hasta recibir orden contraria, requiere un mecanismo de supervision que garantice la parada segura ante fallos.
- Sin datos de robustez: no se publican resultados de benchmarks ni evaluaciones de robustez ante perturbaciones, superficies irregulares o fallos de actuadores.
- Trazabilidad limitada: aunque se indica repositorio, rama y commit de entrenamiento, no se detallan hiperparametros, numero de iteraciones ni composicion del entorno de simulacion, lo que dificulta la reproduccion exacta.
- Escasa adopcion: el modelo registra 1 descarga y 0 likes en el momento de la consulta, por lo que no existe validacion externa de su comportamiento.
- Dependencia de hardware: la politica esta pensada para el robot microduck concreto (61-D de observacion, 14 acciones); no es directamente reutilizable en otras plataformas sin adaptacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-senate_duck_1772
- Variante relacionada: https://huggingface.co/DenRakEiw/microduck-senate_duck_1472
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL (referenciado en la model card): `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`
- Tutorial de construccion de microduck: https://github.com/AI-FanGe/Microduck-build-tutorial
- Ficha del robot en MicroZoo: https://duck.microzoo.ai/
- Ficha del robot en Robots Guide: https://robotsguide.com/robots/microduck
