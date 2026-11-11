# GoudaGame/estimation-guess-net

## Resumen

`GoudaGame/estimation-guess-net` es una red neuronal auxiliar desarrollada por GoudaGame para el juego de cartas Estimation. Su funcion no es jugar directamente, sino estimar que cartas ocultas posee cada uno de los tres jugadores rivales a partir de la informacion visible en la mesa. Se trata de un componente interno del bot denominado "Self-taught + guesses", que lo utiliza para generar las manos ocultas sobre las que realiza su busqueda.

El modelo es una red feedforward de tres capas ocultas de 512 neuronas, distribuida como un fichero NumPy `.npz` con los pesos. No es un modelo de lenguaje ni un transformer: es un predictor especializado de estado de juego, entrenado exclusivamente con partidas del bot Self-taught contra si mismo, sin datos humanos ni de otros bots.

Es relevante como ejemplo de arquitectura ligera y autoentrenada para inferencia de informacion imperfecta en juegos de cartas, y por su publicacion abierta (licencia MIT) pese a depender de un motor de reglas privado para ejecutarse. El repositorio esta vacio en el momento de la consulta (0.0 GB) y no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (perceptron multicapa) con 3 capas ocultas de 512 neuronas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` |

## Arquitectura y entrenamiento

La red es un perceptron multicapa con tres capas ocultas de 512 neuronas cada una. Recibe la misma representacion de la mesa que el modelo Self-taught y produce, para cada carta que un jugador no puede ver, una estimacion de cual de los otros tres jugadores la posee. El autor no detalla la dimensionalidad de entrada, la funcion de activacion, la funcion de perdida ni el numero exacto de parametros.

El entrenamiento se realizo unicamente con partidas del bot Self-taught jugando contra si mismo, sin partidas humanas ni datos de otros bots. No se especifica el numero de partidas, el regimen de optimizacion ni si hubo ajuste fino posterior. El modelo se integra en el bot "Self-taught + guesses" como generador de manos ocultas candidatas para su busqueda sobre estados no observados.

## Capacidades

- Estimacion de cartas ocultas: predice que jugador de los otros tres posee cada carta no visible.
- Integracion en busqueda: alimenta la generacion de manos ocultas del bot "Self-taught + guesses".
- Inferencia de informacion imperfecta: opera sobre la vista parcial de la mesa disponible para un jugador.
- Entrenamiento autojugado: aprende exclusivamente de partidas del bot Self-taught contra si mismo.
- Formato ligero: pesos en `.npz`, aptos para carga con NumPy sin framework de deep learning.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues; su alcance es el juego Estimation.

## Casos de uso

- Investigacion en juegos de informacion imperfecta: sirve como modulo de inferencia de estado oculto en experimentos sobre Estimation, aportando un componente entrenado por autojuego que se puede analizar o sustituir.
- Baselines de autoentrenamiento: permite comparar estrategias de generacion de manos ocultas frente a heuristicas simples en un motor de reglas propio.
- Desarrollo de bots de cartas: se puede integrar como capa de prediccion de manos rivales en un bot nuevo, siempre que se disponga de una representacion de mesa compatible.
- Estudio de generalizacion en autoentrenamiento: al entrenarse solo con partidas del bot Self-taught, es util para medir como se degrada o mantiene la precision frente a jugadores humanos u otros bots.
- Reproduccion academica: el codigo de entrenamiento (`train/guess_net.py`) y del bot (`bots/guess-search`) esta publicado, lo que permite replicar el pipeline con datos propios.
- Prototipado ligero en CPU: al ser una red de tres capas en `.npz`, puede ejecutarse en entornos sin GPU para pruebas de inferencia y validacion del motor de reglas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una evaluacion en la clasificacion de la [Estimation Arena leaderboard](https://essamgouda97.github.io/estimation-arena/), pero no se proporcionan cifras concretas de precision, tasa de acierto en la estimacion de manos ni metricas comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamano descrito (tres capas de 512 neuronas y pesos en `.npz`) es previsible que quepa en memoria principal y se ejecute en CPU, pero no se confirma.
- GPU recomendadas: no disponible; no se requiere GPU segun la informacion publicada.
- GPU de consumo: no disponible; el formato `.npz` y la arquitectura sugieren ejecucion viable en CPU, sin confirmacion del autor.
- Opciones de despliegue: carga directa con NumPy; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Dependencia critica: la ejecucion requiere el motor de reglas, que es privado segun la model card.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de estimacion de manos ocultas para Estimation ni redes auxiliares equivalentes con las que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Dependencia de un motor de reglas privado: el modelo no puede ejecutarse de forma autonoma sin el rules engine del autor.
- Entrenamiento restringido: solo ha visto partidas del bot Self-taught contra si mismo, por lo que puede no generalizar a estilos humanos u otros bots.
- Repositorio vacio: el tamano del repo es 0.0 GB en la fecha de consulta, por lo que los pesos pueden no estar disponibles para descarga.
- Sin metricas publicadas: no hay datos de precision ni de calibracion de las estimaciones.
- Ambito cerrado: no es un modelo de lenguaje; no admite texto libre, codigo, vision ni tareas generales.
- Riesgo de sesgo de autoentrenamiento: al derivar de un unico bot, puede heredar sus sesgos estrategicos y reforzarlos en la busqueda.
- Licencia MIT: permite uso comercial y modificacion, pero la dependencia del motor privado limita el despliegue practico en produccion.
- Idiomas: no aplica; no procesa lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoudaGame/estimation-guess-net
- Clasificacion Estimation Arena: https://essamgouda97.github.io/estimation-arena/
- Repositorio de codigo: https://github.com/essamgouda97/estimation-arena
