# DenRakEiw/microduck-senate_duck_1148

## Resumen

`DenRakEiw/microduck-senate_duck_1148` es una politica de aprendizaje por refuerzo (RL) publicada en HuggingFace para el robot bipedo de codigo abierto microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un controlador neuronal exportado a ONNX que genera la marcha del robot sobre ruedas (rollers). Concretamente, el autor la describe como una politica "perpetua" para la ranura `walk`, pensada para un modo de carrera denominado "2 m Roller Sprint", afinada mediante estrategias de evolucion (evolution strategies) sobre el scorer de rollers de la Arena.

La relevancia de esta ficha radica en que ejemplifica el flujo actual de publicacion de comportamientos roboticos como artefactos versionados en HuggingFace: un fichero `policy.onnx` con el normalizador de observaciones embebido y un `manifest.json` que sigue el esquema 2 del manifiesto de politicas de microduck. El modelo recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y esta disenado para ejecutarse de forma continua hasta que se le indique lo contrario.

El repositorio no incluye datos sobre parametros totales, licencia, idiomas ni resultados de benchmarks, y en el momento de la consulta acumula 0 descargas y 0 likes. El entrenamiento se realizo en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `8dafac487`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo exportada a ONNX (topologia de red no especificada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observacion de 61 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; salida de acciones de control) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) mas `manifest.json` segun esquema 2 del manifiesto de politicas de microduck |
| Espacio de observacion | 61 dimensiones |
| Espacio de acciones | 14 acciones |
| Frecuencia de control | 50 Hz |
| Ranura de politica | `walk` |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como una politica de RL "perpetua" para microduck, afinada mediante evolution strategies sobre el scorer de rollers de la Arena. No se detalla la topologia concreta de la red neuronal (capas, numero de parametros, tipo de activaciones) ni la funcion de recompensa empleada. El normalizador de observaciones esta integrado dentro del propio fichero `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesarlas por separado.

El entrenamiento se realizo en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `8dafac487`. La card no especifica el numero de pasos de entrenamiento, la composicion del dataset (aqui, experiencia generada por simulacion o por el propio robot) ni si hubo fases adicionales de ajuste mas alla de las evolution strategies mencionadas. Tampoco se indica el simulador ni el entorno de entrenamiento.

## Capacidades

- Generacion de marcha continua sobre ruedas (rollers) para el robot microduck: la politica se ejecuta de forma ininterrumpida hasta recibir una orden de parada.
- Control de locomocion en modo carrera ("2 m Roller Sprint") optimizado para el scorer de rollers de la Arena.
- Ocupacion de la ranura `walk` del sistema de politicas del daemon de microduck.
- Consumo de observaciones en crudo de 61 dimensiones con normalizacion interna ya resuelta.
- Emision de 14 acciones de control a 50 Hz, adecuada para el bucle de control de un robot bipedo pequeno.
- Carga directa en robot real mediante `robotctl policy load walk DenRakEiw/microduck-senate_duck_1148`.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Demostracion de marcha sobre rollers en microduck: cargar la politica en la ranura `walk` y ejecutar el robot en modo carrera para reproducir el comportamiento de sprint de 2 m.
- Investigacion en aprendizaje por refuerzo roboticos: usar la politica como linea base entrenada con evolution strategies para comparar contra otras estrategias de optimizacion.
- Participacion en competiciones o retos de la Arena: la politica esta afinada especificamente sobre el scorer de rollers, por lo que encaja en entornos de evaluacion con esa metrica.
- Desarrollo de comportamientos encadenados: al ser una politica "perpetua", sirve como bloque de locomocion base sobre el que orquestar transiciones a otras ranuras (por ejemplo, sentarse o recuperarse de caidas).
- Docencia y talleres de robotica: al distribuirse como un unico `policy.onnx` con normalizador embebido y cargarse con un comando, es un ejemplo practico de despliegue de politicas RL en hardware real.
- Validacion de la interfaz de manifiestos de microduck: el `manifest.json` sigue el esquema 2, por lo que puede usarse para probar el daemon y su sistema de carga de politicas.
- Pruebas de reproducibilidad: el commit de entrenamiento documentado (`8dafac487`) permite recrear o auditar el proceso en el repositorio `microduck_rl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una politica ONNX de un robot bipedo compacto y con un repositorio de 0,0 GB, es razonable esperar un modelo de muy baja huella, pero no hay datos publicados que lo confirmen.
- GPU recomendadas: no disponibles. La inferencia de politicas de este tipo suele ejecutarse en CPU o en el propio controlador embebido del robot, pero la informacion proporcionada no lo especifica.
- Cabe en GPU de consumo: no disponible como dato confirmado; el tamano del repositorio sugiere que la red es muy pequena.
- Opciones de despliegue: carga en robot mediante `robotctl policy load walk DenRakEiw/microduck-senate_duck_1148`; tambien puede consumirse como `policy.onnx` con cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles; el unico dato temporal es la frecuencia de control de 50 Hz del bucle de politica.

## Comparativa con modelos similares

| Modelo | Tipo | Ranura | Frecuencia | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `DenRakEiw/microduck-senate_duck_1148` | Politica RL (ONNX) | `walk` | 50 Hz | Evolution strategies sobre scorer de rollers | no disponible | HuggingFace |
| `DenRakEiw/microduck-senate_duck_1472` | Politica RL (ONNX) | no disponible en la informacion | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparados, por lo que la comparacion se limita a la existencia y publicacion de ambos artefactos en HuggingFace.

## Limitaciones y advertencias

- No se especifica licencia, lo que impide determinar si el uso comercial esta permitido.
- Sesgos conocidos: no disponibles. Al ser una politica de control entrenada con un scorer concreto, es esperable un comportamiento especializado (sobreajuste) al entorno y a la metrica de la Arena, aunque no hay documentacion que lo cuantifique.
- Riesgo de alucinacion: no aplica; el modelo genera acciones de control, no texto.
- Limitaciones de contexto o idioma: no aplican en el sentido convencional; la ventana de observacion es de 61 dimensiones y no hay soporte linguistico.
- La politica esta disenada para ejecutarse de forma perpetua hasta que se le indique lo contrario, por lo que en produccion conviene prever un mecanismo de parada y de supervision.
- El normalizador esta embebido en `policy.onnx`; alimentar observaciones ya normalizadas produciria un comportamiento incorrecto.
- El `manifest.json` depende del esquema 2 del manifiesto de politicas de microduck; versiones distintas del daemon podrian no ser compatibles.
- Dependencia de la rama y commit concretos (`denrakeiw`, `8dafac487`) del repositorio `microduck_rl` para reproducir el entrenamiento.
- Repositorio de 0,0 GB y 0 descargas: no hay evidencia de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-senate_duck_1148
- Modelo relacionado `microduck-senate_duck_1472`: https://huggingface.co/DenRakEiw/microduck-senate_duck_1472
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `8dafac487` (URL no disponible en la informacion)
- Tutorial de construccion de Microduck: https://github.com/AI-FanGe/Microduck-build-tutorial
- Recursos de MicroDuck: https://microduckrobot.org/resources/
- Ficha de Microduck en ROBOTS: https://robotsguide.com/robots/microduck
