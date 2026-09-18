# Skulitom/ganglion-haltere-cursor

## Resumen

ganglion-haltere-cursor es un modelo de control de cursor construido sobre el conectoma del cerebro de la mosca de la fruta (Drosophila), publicado por el usuario Skulitom dentro del ecosistema de los repositorios Haltere y Ganglion. Sobre una red recurrente de 30.000 neuronas que reproduce la estructura y los signos del conectoma (checkpoint base `ftPath2_best.pt`, entrenado para el vuelo) se instala un readout motor lineal que convierte las tasas de disparo de las neuronas motoras en una velocidad bidimensional de cursor o de vista.

No es un modelo de lenguaje ni genera texto: es una capa refleja que ejecuta control de cursor contra aplicaciones reales a 100 Hz. El readout es una regresion ridge ajustada por imitacion de un controlador proporcional sin memoria sobre episodios sinteticos (plantas aleatorias con retardo de entrada, ganancia y velocidad) y refinada con DAgger. El repositorio publica dos checkpoints, `cursor-readout-v6.pt` y `cursor-readout-v3b.pt`, con distinto diseno de adaptador y distinto numero de rondas de DAgger.

Su relevancia es experimental y acotada. Bajo un envolvente supervisor, el checkpoint v6 iguala al controlador de referencia en tiempo hasta el primer disparo (1,00 s frente a 0,95 s) y en error de seguimiento (134 frente a 140 px) en un entorno de juego real (Half-Life), pero ninguno de los checkpoints supera a la referencia cuando opera en solitario. Con 0 descargas y 0 likes, se trata de un artefacto de investigacion mas que de un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `ConnectomeRNN` de Haltere: red recurrente de 30.000 neuronas con la estructura y los signos del conectoma de Drosophila, mas un readout motor lineal (regresion ridge) sobre 3.913 neuronas motoras |
| Parametros totales | No disponible (se especifica el numero de neuronas de la red, 30.000, pero no el recuento de parametros del checkpoint) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje; la red es recurrente y el estado se define por su dinamica interna) |
| Tipos de cuantizacion | No disponible (checkpoints estandar `torch.save` en precision de entrenamiento; no se publican variantes cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`torch.save`, `.pt`); requiere el paquete `haltere` para cargar y CUDA para ejecucion en tiempo real |
| Pipeline declarado | `reinforcement-learning` |
| Libreria | `ganglion` |
| Tamano del repositorio | 0,0 GB |
| Frecuencia de operacion | 100 Hz contra aplicaciones en vivo |

## Arquitectura y entrenamiento

La red base es una `ConnectomeRNN` de 30.000 neuronas cuyo cableado y signos provienen del conectoma de la mosca, con un checkpoint de partida (`ftPath2_best.pt`) entrenado para el vuelo. Durante el ajuste del cursor la red permanece congelada: lo unico que se entrena es el readout, una regresion ridge que proyecta las tasas de las neuronas motoras a una velocidad bidimensional expresada en unidades de la velocidad objetivo del intento.

El entrenamiento del readout se hace por imitacion de un controlador proporcional sin memoria sobre episodios sinteticos de cursor con plantas aleatorias (retardo de entrada, ganancia y velocidad variables) y se refina despues con DAgger sobre las propias trayectorias del estudiante. En ejecucion, el sistema alimenta a la red el error respecto al objetivo (para v6, unicamente eso) y la propuesta del readout solo se acepta si acerca el cursor al objetivo dentro del limite de velocidad del intento; en caso contrario actua el controlador de referencia determinista para ese tick. Los dos adaptadores publicados difieren en la representacion del objetivo: la version 3 usa el error de objetivo acumulado sobre 0,3 s de velocidad de intento, mientras que la version 5 (checkpoint v6) usa una direccion unitaria mas una distancia con `tanh` y escala de objetivo 0,1.

## Capacidades

- Control de cursor bidimensional: convierte las tasas motoras de la red en una velocidad de cursor o de vista, con salida entrenada para imitar un controlador proporcional.
- Control de camara y de vista: el checkpoint v6 obtiene 32/32 en la suite de camara con 3,7 px de error bajo supervision.
- Alcanzar objetivos y mantener velocidad: bajo el envolvente supervisor, v6 completa 32/32 asentamientos en 335 ms y 256/256 en la prueba de salto.
- Seguimiento de objetivos: 31/32 en la prueba de persecucion con 5,1 px de error bajo supervision.
- Operacion como capa refleja en tiempo real: funciona contra aplicaciones en vivo a 100 Hz (`ganglion core --shadow-process`).
- Modo de predictor en sombra: puede ejecutarse como predictor de sombra del envolvente supervisor.
- Respuesta rapida a inversiones del objetivo: la red responde a un cambio de direccion del objetivo en 60-70 ms, aunque ese estado no es linealmente distinguible del estado durante una aproximacion rapida.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Control de cursor en videojuegos en primera persona: el modelo puede pilotar el apuntado en un entorno real como Half-Life, alcanzando el primer disparo en tiempos comparables al controlador de referencia (1,00 s frente a 0,95 s) cuando opera bajo supervision.
- Capa refleja para automatizacion de interfaz: al ejecutarse a 100 Hz contra aplicaciones vivas, encaja como modulo de bajo nivel que traduce intenciones de alto nivel en movimientos de cursor sin reentrenar la red.
- Investigacion en conectomas: permite estudiar si una red cableada segun el conectoma de Drosophila puede sostener una tarea motora fuera de su dominio original (el vuelo) mediante un readout lineal entrenado.
- Banco de pruebas de politicas de control: la suite fija (asentamiento, salto, persecucion, camara) sirve para comparar variantes de adaptador y de numero de rondas de DAgger.
- Prediccion en sombra para validacion: el modo `--shadow-process` permite medir la propuesta del modelo frente a la accion del controlador de referencia sin que sus decisiones lleguen a la aplicacion.
- Demostracion de aprendizaje por imitacion con DAgger sobre redes biologicamente restringidas: util para estudiar como el refinamiento iterativo sobre las propias trayectorias mejora un readout lineal.
- Estudio de limites de representacion: el resultado de que un readout lineal de esta red puede mantener velocidad o detenerse, pero no ambas cosas, es un caso de uso directo para investigar separabilidad lineal en dinamicas recurrentes.

## Benchmarks y rendimiento

| Prueba | `cursor-readout-v6` (version 5 de adaptador) | `cursor-readout-v3b` (version 3 de adaptador) |
|---|---|---|
| Asentamiento en solitario | 0/32 | 19/32 a 14,8 px |
| Asentamiento bajo supervision | 32/32 en 335 ms | 32/32 en 375 ms (envolvente interviene en el 1,9% de los pasos) |
| Salto | 256/256 | No disponible |
| Persecucion | 31/32 a 5,1 px | No disponible |
| Camara | 32/32 a 3,7 px | No disponible |

| Prueba en vivo (Half-Life, 30 ensayos limpios por condicion, un grunt) | v6 bajo supervision | Controlador de referencia |
|---|---|---|
| Tiempo hasta el primer disparo (mediana) | 1,00 s | 0,95 s (p = 0,61) |
| Error de seguimiento | 134 px | 140 px (p = 0,76) |
| Proporcion de intenciones de alineacion en las que dispara | 58% | 75% (p = 0,003) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el modelo no es un modelo de lenguaje. Todos los datos anteriores fueron medidos en una unica maquina (RTX 4090, Windows 11) y estan documentados en `TRAINING.md` y `HALFLIFE.md`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendada: la unica configuracion reportada es una RTX 4090; se exige CUDA para ejecucion en tiempo real.
- Cabe en GPU de consumo: si, segun la evidencia disponible (RTX 4090 con Windows 11), aunque no se detalla el consumo de memoria.
- Opciones de despliegue: carga mediante el paquete `haltere` y la clase `HaltereCursor` del repositorio Ganglion; ejecucion como capa refleja con `ganglion core --shadow-checkpoint cursor-readout-v6.pt --shadow-process`; evaluacion con `ganglion.train.suite`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el sistema opera a 100 Hz contra aplicaciones en vivo. Bajo supervision, el asentamiento se completa en 335 ms (v6) y 375 ms (v3b). No se publican cifras de throughput adicionales.

## Comparativa con modelos similares

No se han identificado modelos publicos directamente comparables en la informacion disponible. La comparacion relevante es interna y frente al controlador de referencia proporcional sin memoria, que actua como envolvente supervisor:

| Sistema | Naturaleza | Asentamiento en solitario | Asentamiento bajo supervision | Disparo (proporcion de intenciones) | Licencia |
|---|---|---|---|---|---|
| `cursor-readout-v6.pt` | Readout lineal sobre conectoma de 30.000 neuronas, adaptador v5 | 0/32 | 32/32 en 335 ms | 58% | MIT |
| `cursor-readout-v3b.pt` | Readout lineal sobre conectoma de 30.000 neuronas, adaptador v3 | 19/32 a 14,8 px | 32/32 en 375 ms | No disponible | MIT |
| Controlador de referencia | Controlador proporcional determinista sin memoria | 32/32 (referencia de la suite) | No aplica | 75% | No disponible |

## Limitaciones y advertencias

- Ningun checkpoint supera al controlador de referencia cuando opera en solitario: v3b asienta 19/32 objetivos estaticos y v6 no asienta ninguno.
- El readout lineal no puede mantener la velocidad y detenerse a la vez: v6 mantiene velocidad a traves del objetivo y oscila, con 0/32 asentamientos en solitario.
- El estado de la red tras una aproximacion rapida no es linealmente distinguible del estado durante esa misma aproximacion, lo que limita la separabilidad de ambas fases por parte del readout.
- Dependencia del envolvente supervisor: sin el, el comportamiento del modelo no alcanza la referencia; el checkpoint v6 solo resulta competitivo cuando la propuesta se filtra cada tick.
- Conteo de intenciones de alineacion inferior al de la referencia (58% frente a 75%, p = 0,003): dispara en menos ocasiones en las que esta alineado.
- Caveat experimental importante: todos los ensayos en vivo anteriores a las 15:00 del 2026-09-18 se ejecutaron con un controlador virtual residual manteniendo una entrada de movimiento hacia atras en el juego; las comparaciones entre condiciones se mantienen, pero las cifras absolutas describen un combate contra una pared.
- Los datos proceden de una unica maquina (RTX 4090, Windows 11) y de un unico entorno de juego, sin replicacion independiente.
- El modelo no soporta idiomas, vision, audio ni tool calling; no es un modelo de lenguaje ni un agente conversacional.
- Restricciones de licencia: MIT, sin limitaciones de uso comercial declaradas, igual que los repositorios Haltere y Ganglion.
- Requiere CUDA y el paquete `haltere` para su ejecucion en tiempo real, lo que restringe el despliegue a entornos con GPU.
- Artefacto con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de mantenimiento posterior a su publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Skulitom/ganglion-haltere-cursor
- Repositorio Haltere (conectoma del cerebro de la mosca): https://github.com/skulitom/Haltere
- Repositorio Ganglion (capa refleja): https://github.com/skulitom/Ganglion
- Documentacion de entrenamiento y banco de pruebas: https://github.com/skulitom/Ganglion/blob/main/docs/bench/TRAINING.md
- Documentacion del arnes en vivo (Half-Life): https://github.com/skulitom/Ganglion/blob/main/docs/bench/HALFLIFE.md
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos pertenecian a foros de atencion al cliente de Amazon y no guardan relacion con el artefacto.
