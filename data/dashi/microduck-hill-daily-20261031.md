# dashi/microduck-hill-daily-20261031

## Resumen

`dashi/microduck-hill-daily-20261031` es una politica de aprendizaje por refuerzo (RL) para robotica, no un modelo de lenguaje. Desarrollada por el usuario `dashi` de HuggingFace, se trata de una politica de marcha ("gait") para el robot **microduck** de Pollen Robotics, entrenada para la ranura `walk` del robot. El modelo procede de una cadena de "remixes": es un ajuste fino (finetune) de `jrubiosainz/microduck-game-hillclimber-remix8`, que a su vez deriva de la politica `microduck-hill-remix-r744` con una puntuacion de 0.744, y se publica como una reentrada diaria de esa politica ("perpetual"), es decir, una politica que se ejecuta de forma continua hasta que se indique lo contrario.

El modelo resuelve el problema clasico de la locomocion de robots mediante RL: dada una observacion del estado del robot (61 dimensiones), produce las acciones de control (14 acciones) a una frecuencia de 50 Hz. Se distribuye en formato ONNX con el normalizador de observaciones integrado en el propio archivo `policy.onnx`, lo que simplifica enormemente su despliegue en el robot: basta con alimentar observaciones crudas. Su relevancia radica en el ecosistema abierto de politicas intercambiables para microduck, donde los usuarios pueden publicar, remixar y reentrenar gaits de forma comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de RL (red neuronal para control, arquitectura interna no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de robotica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) con `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

No se ha publicado la arquitectura interna de la red (capas, tipo de politica, cabezas de valor, etc.). Lo que si consta es su interfaz: recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, la frecuencia de control estandar del robot microduck. El normalizador de observaciones viene integrado en el archivo ONNX, de modo que el daemon del robot puede alimentar observaciones crudas sin preprocesamiento externo.

El entrenamiento se realizo en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. No se ha publicado informacion sobre el algoritmo de RL concreto (PPO, SAC, etc.), el numero de pasos de simulacion, el entorno de simulacion utilizado ni la funcion de recompensa. El modelo es un finetune de `jrubiosainz/microduck-game-hillclimber-remix8`, lo que sugiere un flujo de trabajo comunitario de mejora iterativa (remix) de politicas ya existentes. La etiqueta "hill" y la puntuacion 0.744 indican una evaluacion en un escenario de tipo hill climbing o similar dentro del ecosistema microduck.

## Capacidades

- Politica de marcha continua ("perpetual") para la ranura `walk` del robot microduck: genera comandos de locomocion de forma indefinida hasta que se detiene manualmente.
- Inferencia a 50 Hz a partir de observaciones de 61 dimensiones, produciendo 14 acciones de control por paso.
- Normalizacion de observaciones integrada en el ONNX: admite observaciones crudas del robot sin pipeline de preprocesamiento.
- Despliegue directo en el robot mediante el comando `robotctl policy load walk <modelo>`.
- Compatibilidad con el schema 2 del microduck policy manifest (`manifest.json`), lo que permite validacion automatica por el daemon.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, codigo, vision ni tool calling.

## Casos de uso

- **Locomocion basica del robot microduck**: cargar la politica en la ranura `walk` para que el robot camine de forma continua en demostraciones, ferias o exposiciones, donde se necesita un gait estable que no requiera supervision constante.
- **Punto de partida para remixes comunitarios**: al ser un finetune publicado abiertamente, otros usuarios pueden partir de esta politica (puntuacion 0.744) para generar variantes mejoradas mediante el flujo de remixes del ecosistema microduck.
- **Pruebas de robustez de locomocion**: la etiqueta "hill" sugiere entrenamiento o evaluacion en terreno con pendientes; puede servir para probar el comportamiento del robot en superficies inclinadas.
- **Benchmarking diario de politicas**: la publicacion como "reentrada diaria" (daily re-entry) permite comparar versiones sucesivas de politicas en la comunidad y seguir la evolucion del rendimiento (0.744 en este caso).
- **Ensenanza de RL aplicado a robotica**: el pipeline completo (repositorio de entrenamiento `pollen-robotics/microduck_rl`, formato ONNX, manifest esquematizado) es util como ejemplo practico de despliegue de politicas RL en hardware real.
- **Integracion en pipelines de control de robots**: al seguir el schema 2 del policy manifest, puede integrarse en sistemas automatizados que carguen y validen politicas programaticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar en la informacion disponible. El unico dato de rendimiento mencionado es la puntuacion **0.744** asociada a la politica original `microduck-hill-remix-r744`, de la que este modelo es una reentrada diaria. No se especifica que metrica representa exactamente (probablemente una puntuacion del entorno de entrenamiento o evaluacion de microduck), ni existen comparaciones con otras politicas publicadas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Al tratarse de una politica de control de tamano reducido en ONNX (el repositorio ocupa 0.0 GB segun HuggingFace), los requisitos son minimos; se ejecuta en el hardware de a bordo del robot microduck.
- **GPU recomendadas**: no disponible; la inferencia de politicas de locomocion a 50 Hz normalmente no requiere GPU dedicada.
- **Consumer GPU**: no aplicable; el objetivo de despliegue es el propio robot, no una estacion de trabajo.
- **Despliegue**: mediante el daemon de microduck con `sudo robotctl policy load walk dashi/microduck-hill-daily-20261031`. El formato ONNX permite ademas cargarlo con ONNX Runtime en otros entornos si se replican las observaciones de 61 dimensiones.
- **Latencia y throughput**: no disponibles; la politica esta disenada para operar a 50 Hz de frecuencia de control.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Notas |
|---|---|---|---|---|
| dashi/microduck-hill-daily-20261031 | Politica RL (walk) | jrubiosainz/microduck-game-hillclimber-remix8 | no disponible | Reentrada diaria de la politica r744 (0.744) |
| jrubiosainz/microduck-game-hillclimber-remix8 | Politica RL (walk) | no disponible | no disponible | Modelo base del que deriva este finetune |
| dashi/microduck-hill-remix-r744 | Politica RL (walk) | no disponible | no disponible | Politica original con puntuacion 0.744, reentrada diaria de este modelo |

No hay datos de rendimiento comparativos publicados entre estas politicas.

## Limitaciones y advertencias

- **Licencia no especificada**: la model card no declara licencia, lo que introduce incertidumbre juridica sobre su uso comercial o redistribucion. Verificar con el autor antes de cualquier despliegue comercial.
- **Documentacion minima**: no se publican detalles del algoritmo de entrenamiento, datos de simulacion, funcion de recompensa ni procedimientos de validacion de seguridad.
- **Especifico de hardware**: la politica solo es util para el robot microduck con observaciones de 61 dimensiones y 14 acciones; no es transferible a otros robots sin adaptacion significativa.
- **Riesgo de comportamiento no verificado**: al ser un remix comunitario de cadena multiple (r744 → remix8 → daily-20261031), no hay garantias de validacion fisica en hardware real; se recomienda probar con el robot sujeto o en simulacion antes de despliegue libre.
- **Metrica opaca**: la puntuacion 0.744 no viene acompanada de una descripcion de la metrica, lo que dificulta evaluar su calidad relativa.
- **Descargas y likes en cero**: el modelo es muy reciente (publicado el 31 de octubre de 2026) y carece de adopcion comunitaria verificable.
- Los resultados de busqueda web proporcionados no aportan informacion relevante sobre este modelo (se refieren al caldo dashi de la cocina japonesa, homonimo del autor).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-hill-daily-20261031
- Modelo base (finetune origen): https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix8
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`) — URL no disponible
