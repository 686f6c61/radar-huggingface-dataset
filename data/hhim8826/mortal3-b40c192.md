# hhim8826/mortal3-b40c192

## Resumen

Mortal 3 (checkpoint `mortal3-b40c192`) es un agente completo de mahjong japonés (riichi) a cuatro jugadores, desarrollado por el usuario hhim8826 y construido sobre el proyecto Mortal v3 de Equim-chan. No es un modelo de lenguaje: recibe el estado de una partida mediante la codificación de características de `libriichi` y devuelve una acción legal (descarte o llamada), por lo que funciona como jugador autónomo y no como evaluador o puntuador de partidas.

Técnicamente se trata de una red convolucional residual (ResNet) de 40 bloques y 192 canales con atención de canales, coronada por una cabeza dueling DQN con ramas separadas de valor y ventaja. Tiene 11.310.592 parámetros (10.773.713 en el backbone y 536.879 en la cabeza) y su checkpoint de inferencia ocupa 43,4 MB en fp32. Se entrenó sobre 191.132 registros de partidas de la sala Houou (鳳凰卓) de Tenhou en formato mjai, durante 107.200 pasos con batch de 2048, en una sola época y sin aumento de datos.

Su relevancia es acotada pero clara para la comunidad de IA aplicada a juegos: de los seis checkpoints de su linaje de entrenamiento, este fue el que midió más fuerte en una evaluación directa a cinco bandas (4.000 hanchan por rival), sin que ninguno lo superase de forma estadísticamente significativa. El repositorio incluye pesos PyTorch, una exportación ONNX equivalente (verificada con una diferencia máxima absoluta de ~1e-5 en acciones legales) y los hiperparámetros completos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet de 40 bloques x 192 canales con atencion de canales; cabeza dueling DQN (ramas separadas de valor y ventaja) |
| Parametros totales | 11.310.592 (10.773.713 backbone + 536.879 cabeza) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje; consume el estado de la partida codificado con la version de observacion v3 de `libriichi` |
| Tipos de cuantizacion | No disponible; el checkpoint publicado esta en fp32 |
| Idiomas soportados | No disponible (no aplica; el dominio es el mahjong japones, no el procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`mortal.pth`) y ONNX (`mortal.onnx`) |

Otros datos: tamano del repositorio 0,1 GB; tamano del checkpoint PyTorch 43,4 MB (frente a 142 MB del checkpoint original de entrenamiento); SHA-256 de `mortal.pth` = `ec679c428766af25fe2c0520938fffc7047f6c8016e3930f3b6c61fdabe48559`; fecha de finalizacion del entrenamiento: 2023-03-25.

## Arquitectura y entrenamiento

El modelo sigue el diseno de Mortal v3. El backbone es una ResNet de 40 bloques residuales con 192 canales por capa y mecanismo de atencion de canales, que procesa la codificacion de observaciones v3 de `libriichi`. Sobre esa representacion se anade una cabeza dueling DQN, que descompone la funcion Q en un valor de estado y una ventaja por accion, lo que mejora la estabilidad del aprendizaje en espacios de acciones con muchas alternativas legales pero con diferencias de valor sutiles, como ocurre al elegir entre descartes.

El entrenamiento uso 191.132 registros de partidas de Tenhou Houou en formato mjai (un superconjunto de ese corpus esta publicado como `hhim8826/tenhou-houou-mjai`), en una unica epoca y sin aumento de datos, durante 107.200 pasos con tamano de lote 2048. El checkpoint publicado contiene solo lo necesario para inferencia (pesos mas `version` y la forma de la ResNet): se eliminaron el estado del optimizador, del scheduler y del scaler, por lo que no sirve para reanudar entrenamiento. No se documenta en la informacion disponible si hubo fases de RLHF, DPO u otro ajuste posterior.

## Capacidades

- Juego completo de mahjong riichi a cuatro jugadores: selecciona descartes y llamadas (chi, pon, kan, ron, riichi, etc.) a partir del estado actual de la partida.
- Toma de decisiones con mascara de legalidad: en la exportacion ONNX las acciones ilegales ya se devuelven como `-inf`.
- Inferencia determinista en cuanto a accion elegida: la version ONNX coincide con la de PyTorch en todas las observaciones de partida reales probadas.
- Ejecucion autonoma como bot integrado mediante `libriichi` y el motor `MortalEngine`, alimentado con eventos mjai.
- Uso como sparring partner en partidas uno contra tres mediante el arena `OneVsThree` de `libriichi`.
- Ejecucion en CPU: el ejemplo oficial de uso instancia el motor con `device=torch.device("cpu")` y `enable_amp=False`.
- No dispone de tool calling, function calling, capacidades de agente multi-paso generico, vision, audio ni procesamiento multilingue: su espacio de acciones esta limitado a las acciones legales del juego.

## Casos de uso

- Bot de mahjong online: integrado en un servidor que emita eventos mjai, el modelo gestiona una partida completa de hanchan a cuatro jugadores, eligiendo descarte o llamada en cada turno con un coste computacional minimo (43,4 MB de pesos).
- Sparring partner para jugadores humanos: al ejecutarse en CPU y con baja huella de memoria (366 MB de pico en la aplicacion de demostracion servida con ONNX), puede desplegarse como oponente en herramientas locales de practica de riichi.
- Generacion de datos por autojuego: enfrentando el modelo contra copias de si mismo se pueden producir grandes volumenes de partidas etiquetadas para alimentar pipelines de aprendizaje por refuerzo de otros agentes, tal como se hizo en su propia evaluacion con 4.000 hanchan.
- Referencia de evaluacion de checkpoints: sirve como linea base fija en arenas comparativas, dado que la model card documenta un control de simetria (2.5005 de rango medio y +0,045 pt contra tres copias de si mismo) que confirma la ausencia de sesgo de asiento o puntuacion.
- Investigacion en aprendizaje por refuerzo para juegos de informacion imperfecta: la combinacion de ResNet con atencion de canales y dueling DQN sobre un dominio con espacio de acciones variable es un caso de estudio reproducible, con hiperparametros completos en `model_meta.json`.
- Despliegue ligero en entornos sin GPU: al no requerir acelerador y poder ejecutarse solo con `onnxruntime`, encaja en servicios contenerizados de bajos recursos o en dispositivos de borde.
- Analisis retrospectivo de manos: aunque el modelo no es un evaluador de puntuacion, puede usarse para consultar cual seria su accion preferida en cada decision de una partida registrada y compararla con la del jugador humano, siempre que se respete el caracter relativo de su fuerza (ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no se trata de un modelo de lenguaje. La model card si incluye una evaluacion comparativa propia: cada rival jugo un asiento contra tres copias de este modelo en el arena `OneVsThree` de `libriichi`, bajo reglas hanchan de Tenhou (25.000 de inicio, tobi, 西入), con las mismas semillas de reparto y cada semilla jugada cuatro veces, una por asiento. La puntuacion pt se asigna +90/+45/0/-135 por posicion.

| Rival | Que es | Hanchan | Rango medio | pt medio (IC 95%) | Resultado |
|---|---|---:|---:|---:|---|
| mortal_model/best.pth | checkpoint hermano, v3, 100k pasos | 4.000 | 2,4943 | -0,24 (-2,33, +1,86) | no distinguible |
| mortal-120000.pth | checkpoint hermano, v3, 144,8k pasos | 4.000 | 2,4992 | -0,55 (-2,62, +1,52) | no distinguible |
| mortal_model/mortal_online.pth | checkpoint entrenado online, v3, 50,8k pasos | 4.000 | 2,5445 | -1,67 (-3,93, +0,60) | empatado en pt, peor en rango |
| best.pth | run v4 anterior, 16k pasos | 1.000 | 2,5900 | -6,84 (-11,44, -2,24) | claramente mas debil |
| mortal_model/mortal4/best.pth | run v4 anterior, 2,4k pasos | 1.000 | 2,6940 | -15,03 (-20,07, -9,99) | claramente mas debil |

Control del entorno: el modelo contra tres copias de si mismo devolvio un rango medio de 2,5005 y +0,045 pt en 4.000 hanchan, con reparto de posiciones [999, 997, 1007, 997]. Con precision numerica, la comparacion PyTorch frente a ONNX sobre observaciones reales muestra una diferencia maxima absoluta de aproximadamente 1e-5 en acciones legales (redondeo de float32) y nunca cambia la accion elegida.

## Requisitos de hardware

- VRAM estimada: no publicada. Como referencia aritmetica, 11,3 millones de parametros en fp32 ocupan unos 45 MB, por lo que los pesos caben en cualquier GPU o incluso en memoria de sistema.
- Memoria en ejecucion: la model card reporta un pico de 366 MB sirviendo desde ONNX frente a 633 MB desde PyTorch en una aplicacion de demostracion.
- GPU recomendadas: no se especifica ninguna. El ejemplo oficial funciona en CPU; cualquier GPU consumer (por ejemplo, una RTX 4090 o inferior) es mas que suficiente, aunque innecesaria.
- Cabe en GPU consumer: si, en cualquier modelo con unos pocos cientos de MB libres; tambien en CPU sin aceleracion.
- Opciones de despliegue: PyTorch con `model.py` de Mortal, `libriichi` como extension y `MortalEngine`; o bien `onnxruntime` en solitario con `mortal.onnx`, sin dependencia de torch. Los pesos no son compatibles con vLLM, llama.cpp, Ollama ni TGI, ya que no son pesos de un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos publicados en la informacion disponible sobre las alternativas del dominio (las versiones oficiales de Mortal, akochan u otros bots de riichi), por lo que no se puede establecer una comparativa fiable frente a ellos; la propia model card advierte que su fuerza es relativa y no se ha medido contra esas referencias.

La unica comparacion disponible es interna, entre los checkpoints del mismo linaje, ya recogida en la tabla de benchmarks:

| Modelo | Version de observacion | Pasos | Parametros | Hanchan evaluados | Resultado frente a este checkpoint |
|---|---|---:|---|---:|---|
| mortal3-b40c192 (este) | v3 | 107,2k | 11.310.592 | - | referencia |
| mortal_model/best.pth | v3 | 100k | no disponible | 4.000 | no distinguible |
| mortal-120000.pth | v3 | 144,8k | no disponible | 4.000 | no distinguible |
| mortal_model/mortal_online.pth | v3 | 50,8k | no disponible | 4.000 | empatado en pt, peor en rango |
| best.pth | v4 | 16k | no disponible | 1.000 | claramente mas debil |
| mortal_model/mortal4/best.pth | v4 | 2,4k | no disponible | 1.000 | claramente mas debil |

## Limitaciones y advertencias

- Fuerza relativa, no absoluta: las cifras comparan checkpoints de una misma tanda de entrenamiento. No se ha medido contra las versiones oficiales de Mortal, contra akochan ni contra jugadores humanos, por lo que su nivel real de juego es desconocido.
- Alcance de reglas: entrenado y evaluado solo en hanchan a cuatro jugadores con cincos rojos. No ha sido evaluado en sanma (tres jugadores) ni en tonpuusen (partida corta), por lo que su comportamiento en esos formatos no esta validado.
- Campo `best_perf` enganoso: el valor registrado dentro del checkpoint original de entrenamiento ({'avg_rank': 2,416, 'avg_pt': 6,3}) se refiere al oponente vigente durante el entrenamiento y no es comparable con la tabla de evaluacion publicada.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse exclusivamente con registros de la sala Houou de Tenhou hereda el estilo de juego de esa poblacion de jugadores de alto nivel.
- Alucinacion: no aplica en el sentido de generacion de texto; el modelo siempre selecciona una accion legal gracias a la mascara, pero puede elegir jugadas suboptimas sin que exista un mecanismo de calibracion de confianza documentado.
- Restriccion de licencia: AGPL-3.0, derivada de Mortal (AGPL-3.0-or-later). El uso comercial obliga a revisar las obligaciones de copyleft del proyecto base. Ademas, los registros de partidas de Tenhou estan sujetos a los terminos que Tenhou publica en su pagina de listado de logs, que deben revisarse para cada caso de uso.
- No reanudable: el checkpoint solo contiene pesos de inferencia y la configuracion minima; no incluye estado de optimizador, scheduler ni scaler, por lo que no puede usarse para continuar el entrenamiento.
- Sin idiomas ni capacidades generales: cualquier expectativa de uso como modelo conversacional, de codigo o multimodal queda fuera de su diseno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hhim8826/mortal3-b40c192
- Dataset de entrenamiento: https://huggingface.co/datasets/hhim8826/tenhou-houou-mjai
- Proyecto Mortal (Equim-chan): https://github.com/Equim-chan/Mortal
- Tenhou (origen de los registros): https://tenhou.net/
- Terminos de uso de los registros de Tenhou: https://tenhou.net/sc/raw/?old
