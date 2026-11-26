# elichen77/personal-site-models

## Resumen

`elichen77/personal-site-models` no es un modelo de lenguaje en el sentido convencional, sino un repositorio agregado de artefactos de inferencia (pesos y assets asociados) para las demos interactivas publicadas en el sitio personal de Eli Chen. El repositorio agrupa, en carpetas independientes, los ficheros necesarios para ejecutar cada una de las 26 demostraciones del sitio, que van desde entornos de aprendizaje por refuerzo (airhockey, breakout, qwop, racer) hasta visualizaciones de mecanismos de atención, simulaciones físicas (double-pendulum, neural-cloth) y modelos biologicos simplificados (fly-brain, worm-sim).

La relevancia de este repositorio es divulgativa y educativa: sirve como backend de pesos para demos web que ilustran conceptos de machine learning, simulacion y control. No se trata de un modelo fundacional entrenado para generacion de texto, razonamiento o codigo, y la model card no documenta arquitectura, tamano de parametros, contexto ni proceso de entrenamiento de forma agregada. Cada demo remite a su codigo fuente en GitHub, donde supuestamente se describe el entrenamiento, los modelos upstream y la atribucion.

El repositorio ocupa 0.4 GB y fue creado y actualizado el 25 de noviembre de 2026. No tiene descargas ni likes, y no declara pipeline, licencia ni idiomas. Cualquier evaluacion tecnica detallada debe hacerse demo por demo consultando el codigo fuente enlazado, no a partir de este repositorio como unidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio agregado de artefactos para multiples demos; no se declara arquitectura unica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card no especifica safetensors, GGUF ni otros formatos) |

## Arquitectura y entrenamiento

La model card no describe una arquitectura unica. El repositorio se organiza como un contenedor de carpetas, cada una correspondiente a una demo (`airhockey`, `attention`, `breakout`, `concepts`, `double-pendulum`, `drone-racing`, `drum`, `emojimata`, `fly-brain`, `gpt`, `grand-prix`, `kempe`, `learning-on-ice`, `lucid`, `mtncar`, `neural-cloth`, `qwop`, `racer`, `robotarm`, `secondhand`, `snake`, `stick`, `streaming-rl`, `swarm`, `tictactoe`, `worm-sim`). Segun el autor, cada carpeta sigue el layout del codigo fuente de la demo correspondiente, y es en ese codigo fuente donde se documentan el entrenamiento, los modelos upstream y la atribucion.

No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas agregadas. Por los nombres de las demos se deduce una mezcla de tecnicas: aprendizaje por refuerzo (entornos de juego como breakout, snake, qwop, racer), redes neuronales para simulacion fisica (double-pendulum, neural-cloth), visualizacion de atencion (`attention`), modelos generativos ligeros (`gpt`, `lucid`) y simulaciones biologicas (`fly-brain`, `worm-sim`). Esta deduccion es inferencial y no esta confirmada por la model card.

## Capacidades

- No es un modelo de proposito general: no se declara generacion de texto, razonamiento, codigo ni matematicas como capacidades del repositorio en su conjunto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: el repositorio contiene artefactos para demos interactivas de aprendizaje por refuerzo, simulacion fisica, visualizacion de atencion, control (robotarm, drone-racing) y simulaciones biologicas (fly-brain, worm-sim), segun los nombres de las carpetas y los enlaces a demos.

## Casos de uso

- Reproduccion de demos educativas: cargar los pesos de cada carpeta para ejecutar en local las demos publicadas en el sitio de Eli Chen, util para estudiar como se implementan tecnicas de RL o simulacion en el navegador.
- Material docente en cursos de machine learning: usar las demos de `attention`, `gpt` o `concepts` como apoyo visual para explicar mecanismos de atencion y modelos generativos basicos.
- Estudio de entornos de RL: las carpetas `breakout`, `snake`, `qwop`, `racer` y `grand-prix` permiten examinar agentes entrenados en entornos de juego concretos y comparar recompensas y politicas.
- Simulacion fisica interactiva: `double-pendulum` y `neural-cloth` sirven para ilustrar integracion de modelos neuronales con simuladores fisicos en tiempo real.
- Prototipado de control: `robotarm` y `drone-racing` pueden usarse como referencia para experimentos de control con aprendizaje.
- Divulgacion cientifica: `fly-brain` y `worm-sim` permiten mostrar simulaciones biologicas simplificadas a audiencias no tecnicas.
- Base para experimentos propios: reutilizar la estructura de carpetas y los assets como punto de partida para demos personales equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende de cada demo; el repositorio completo ocupa 0.4 GB en disco, lo que sugiere artefactos ligeros, pero no se especifica el tamano de cada modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamano del repositorio es plausible que las demos se ejecuten en navegador o en hardware modesto, pero no esta confirmado.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el despliegue parece orientado a demos web estaticas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no es comparable con modelos de lenguaje de proposito general ni con modelos fundacionales; es una coleccion de artefactos para demos educativas. No se identifican alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse ni desplegarse como tal.
- Ausencia total de metadatos: sin licencia, sin idiomas, sin pipeline, sin arquitectura declarada; el uso comercial queda sin marco legal explicito.
- La model card delega la documentacion tecnica al codigo fuente de cada demo; sin consultarlo no es posible conocer el entrenamiento ni los modelos upstream.
- Riesgo de atribucion incompleta: el autor indica que la atribucion esta en el codigo fuente, no en el repositorio de pesos.
- Cero descargas y cero likes: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-25) en los metadatos, lo que puede indicar un error de registro o una fecha programada; conviene verificar antes de citar el repositorio.
- Sin garantias de mantenimiento ni de compatibilidad con versiones futuras de las demos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/elichen77/personal-site-models
- Sitio personal de demos: https://elichen.github.io/
- Codigo fuente de las demos: https://github.com/elichen/elichen.github.io
- Demo airhockey: https://elichen.github.io/airhockey/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/airhockey
- Demo attention: https://elichen.github.io/attention/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/attention
- Demo breakout: https://elichen.github.io/breakout/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/breakout
- Demo concepts: https://elichen.github.io/concepts/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/concepts
- Demo double-pendulum: https://elichen.github.io/double-pendulum/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/double-pendulum
- Demo drone-racing: https://elichen.github.io/drone-racing/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/drone-racing
- Demo drum: https://elichen.github.io/drum/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/drum
- Demo emojimata: https://elichen.github.io/emojimata/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/emojimata
- Demo fly-brain: https://elichen.github.io/fly-brain/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/fly-brain
- Demo gpt: https://elichen.github.io/gpt/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/gpt
- Demo grand-prix: https://elichen.github.io/grand-prix/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/grand-prix
- Demo kempe: https://elichen.github.io/kempe/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/kempe
- Demo learning-on-ice: https://elichen.github.io/learning-on-ice/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/learning-on-ice
- Demo lucid: https://elichen.github.io/lucid/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/lucid
- Demo mtncar: https://elichen.github.io/mtncar/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/mtncar
- Demo neural-cloth: https://elichen.github.io/neural-cloth/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/neural-cloth
- Demo qwop: https://elichen.github.io/qwop/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/qwop
- Demo racer: https://elichen.github.io/racer/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/racer
- Demo robotarm: https://elichen.github.io/robotarm/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/robotarm
- Demo secondhand: https://elichen.github.io/secondhand/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/secondhand
- Demo snake: https://elichen.github.io/snake/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/snake
- Demo stick: https://elichen.github.io/stick/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/stick
- Demo streaming-rl: https://elichen.github.io/streaming-rl/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/streaming-rl
- Demo swarm: https://elichen.github.io/swarm/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/swarm
- Demo tictactoe: https://elichen.github.io/tictactoe/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/tictactoe
- Demo worm-sim: https://elichen.github.io/worm-sim/ · fuente: https://github.com/elichen/elichen.github.io/tree/main/worm-sim
