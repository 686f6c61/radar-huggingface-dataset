# aminwoo/bughouse-twin-s

## Resumen

TwinBoard-S es una red neuronal pequena desarrollada por el usuario aminwoo para Hivemind, un motor UCI de Bughouse chess (la variante de cuatro jugadores en dos tableros en la que las piezas capturadas se pasan al companero). La red no genera texto ni es un modelo de lenguaje: es una funcion de evaluacion y politica que alimenta una busqueda Monte Carlo Graph Search (MCGS) que razona de forma conjunta sobre los dos tableros de la partida.

Su interes tecnico esta en la arquitectura TwinBoardNet: en lugar de apilar ambos tableros como canales de una unica imagen de 8x8 (aproximacion estilo RISE, en la que cada convolucion mezcla casillas sin relacion espacial), aplica el mismo tronco con pesos compartidos a cada tablero por separado y los conecta mediante dos intercambios explicitos de escala y desplazamiento con pooling. Esto la hace exactamente simetrica bajo el intercambio de tableros, una simetria real del juego.

Con 0,97 M de parametros en ONNX (1,25 M en el checkpoint), la red fue destilada de la red RISEv3.3 de 13,6 M de parametros y despues mejorada con aprendizaje por refuerzo auto-juego. Segun el autor, busca aproximadamente tres veces mas nodos por segundo y resulto mas fuerte a 100 ms por jugada que el modelo profesor, lo que la convierte en una pieza de interes para quienes trabajan en motores de ajedrez, RL con auto-juego y destilacion de redes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TwinBoardNet, tamano `twin-s`, sin atencion y sin ECA; cabeza de valor con A + B y \|A − B\| |
| Parametros totales | 0,97 M (ONNX, BatchNorm plegado); 1,25 M (checkpoint) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | pesos FP32 en ONNX; el motor construye planes FP16 de TensorRT en tiempo de ejecucion |
| Idiomas soportados | no aplica (modelo especifico de ajedrez Bughouse) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18, IR version 8, batch dinamico) y checkpoint de entrenamiento |

Otras especificaciones aportadas por el autor:

| Parametro | Valor |
|---|---|
| Tronco | 8 bloques residuales con cuello de botella por tablero, 128 canales (ancho operativo 256) |
| Intercambio entre tableros | 2 intercambios de escala y desplazamiento con pooling, tras los bloques 3 y 6 |
| Representacion de entrada | version 3 (las mismas 74 planos que bughouse-rise-v3) |
| Entrada ONNX | `data` con forma `[batch, 74, 8, 8]` |
| Salidas ONNX | `value` `[batch, 1]`, `pi_a` `[batch, 4672]`, `pi_b` `[batch, 4672]`, `wdl_out` `[batch, 3]`, `moves_left` `[batch, 1]` |
| Descargas y likes en HuggingFace | 0 descargas, 0 likes |
| Fecha de creacion / actualizacion | 2026-10-03 / 2026-10-04 |

## Arquitectura y entrenamiento

TwinBoardNet procesa cada tablero con el mismo tronco de 8 bloques residuales de cuello de botella (128 canales, ancho operativo 256) y pesos compartidos, y despues intercambia informacion entre tableros en dos puntos (tras los bloques 3 y 6) mediante operaciones de escala y desplazamiento con pooling. La cabeza de valor recibe tanto A + B como el valor absoluto de A − B. El diseno evita el problema de la aproximacion RISE, que apila los dos tableros como canales de una sola imagen y por tanto mezcla en cada convolucion casillas sin relacion espacial. Ademas, la red es exactamente simetrica ante el intercambio de tableros: al permutar las entradas se intercambian `pi_a` y `pi_b` y quedan invariantes el valor, el WDL y las jugadas restantes. Las dos cabezas de politica (4672 logits cada una, la codificacion estandar de movimientos de AlphaZero para ajedrez) son lo que convierte esto en una red de Bughouse y no en dos redes de ajedrez independientes: el cuerpo razona sobre ambos tableros a la vez y emite una distribucion de movimientos para cada uno.

El entrenamiento tuvo dos fases. La primera, de destilacion (iteracion 0), uso 30 millones de posiciones etiquetadas por la red RISEv3.3 de 13,6 M de parametros, con objetivos de politica sobre todos los movimientos legales, valor, WDL y jugadas restantes, promediando los objetivos sobre ambos ordenes de tablero porque el profesor no es simetrico ante el intercambio. Eliminar la capa de atencion entre tableros aporto aproximadamente un 32 % mas de velocidad de busqueda del motor, y esa variante batio a las versiones con atencion a igualdad de tiempo. La segunda fase fue aprendizaje por refuerzo con auto-juego: cada iteracion juega 100.000 partidas con la red vigente (800 nodos mas o menos un 5 % por jugada, con ruido de Dirichlet y temperatura para la exploracion, sin abandono), y despues entrena desde los pesos de la iteracion anterior sobre las politicas de conteo de visitas, los resultados de partida (WDL) y las jugadas restantes. A partir de la iteracion 2, el entrenamiento repasa las partidas de las tres iteraciones anteriores junto con las nuevas (1,5 pasadas sobre las nuevas y 0,5 sobre cada anterior) para evitar el olvido. Una red nueva sustituye a la vigente solo si logra al menos un 50 % en un enfrentamiento de 160 partidas a 100 ms por jugada.

## Capacidades

- Evaluacion de posiciones de Bughouse chess: produce un valor escalar de posicion y una cabeza WDL (victoria, tablas, derrota).
- Politica de movimientos conjunta: emite logits de politica separados para el tablero A y el tablero B (`pi_a` y `pi_b`) sobre la codificacion estandar de 4672 movimientos de AlphaZero.
- Razonamiento cruzado entre tableros: el cuerpo de la red combina informacion de ambas partidas, lo que permite decisiones que dependen de las piezas en mano y del estado del companero.
- Prediccion de jugadas restantes (`moves_left`), util para modular la busqueda y las decisiones de gestion de tiempo.
- Integracion con busqueda: alimenta una Monte Carlo Graph Search (MCGS) que evalua ambos tableros de forma conjunta.
- Inferencia ONNX con batch dinamico, exportable a planes FP16 de TensorRT.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision, audio ni soporte multilingue: es una red especifica de ajedrez.

## Casos de uso

- Motor UCI para servidores de variantes: integrar `twin-s-noattn.onnx` en Hivemind y exponerlo como motor de Bughouse en plataformas de ajedrez que ofrezcan esta variante, con la ventaja de que a 100 ms por jugada mantiene un nivel competitivo.
- Analisis post-partida: usar `value`, `wdl_out` y `moves_left` para anotar una partida completa, detectar errores graves en cada tablero y estimar el momento en que la posicion se decanta.
- Entrenamiento de jugadores humanos: comentar sugerencias de movimiento por tablero a partir de `pi_a` y `pi_b`, senalando jugadas que coordinan ambos tableros y no solo el propio.
- Bot de partidas en vivo: con 72-77 k nodos por segundo en una RTX 4070 a 100 ms por jugada, la red es adecuada para partidas rapidas contra humanos sin agotar presupuesto de tiempo.
- Profesor de destilacion: al ser ligera y rapida, sirve como generador de etiquetas para entrenar redes aun menores o para reetiquetar grandes volumenes de posiciones en pipelines de RL.
- Investigacion en auto-juego y RL: reproducir el ciclo de 100.000 partidas por iteracion con promocion basada en un enfrentamiento de 160 partidas a 100 ms permite estudiar estabilidad y olvido catastrofico en entornos de dos tableros.
- Despliegue en hardware modesto: con menos de 1 M de parametros, la red puede ejecutarse en GPU de gama baja o en CPU mediante ONNX Runtime, lo que facilita demos y entornos de desarrollo.
- Comparacion de arquitecturas: usar el par twin-s frente a la familia RISE para medir el efecto de la simetria exacta entre tableros y de la atencion cruzada en un dominio con simetria conocida.

## Benchmarks y rendimiento

El autor publica enfrentamientos de 160 partidas a 100 ms por jugada en una RTX 4070, con ambos bandos a unos 72-77 k nodos por segundo. Cada red se compara con la iteracion anterior y con la red destilada fija (iteracion 0), cuyos resultados sirven de escala comun entre iteraciones.

| Iteracion | Frente a la anterior | Frente a la iteracion 0 (Elo, IC 95 %) |
|---|---|---|
| 1 | 90-64-6 (+57) | +57 (+22 a +93) |
| 2 | 79-78-3 (+2) | +46 (+9 a +83) |
| 3 | 80-76-4 (+9) | **+68 (+31 a +107)** |

Datos adicionales aportados: el abandono de la capa de atencion entre tableros supuso aproximadamente un +32 % de velocidad de busqueda del motor, y la variante sin atencion supero a las versiones con atencion a igualdad de tiempo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un modelo de este tipo.

## Requisitos de hardware

- VRAM estimada: no se publica una cifra concreta. Los pesos FP32 de 0,97 M de parametros ocupan del orden de 4 MB, por lo que el consumo lo domina el runtime de inferencia (ONNX Runtime o TensorRT) y no la red en si.
- GPU recomendadas: la RTX 4070 fue la GPU usada en los enfrentamientos publicados. Cualquier GPU con soporte de ONNX Runtime o TensorRT es suficiente dado el tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo e incluso en iGPU o CPU.
- Opciones de despliegue: el motor Hivemind mediante `./engine/build-ninja/hivemind --model models/twin-s-noattn.onnx`; ONNX Runtime en Python (`onnxruntime.InferenceSession`); planes FP16 de TensorRT construidos por el motor en tiempo de ejecucion. No se publican planes precompilados porque dependen de la GPU, la version de TensorRT y el tamano de batch. vLLM, llama.cpp, Ollama y TGI no son aplicables a este modelo.
- Latencia y throughput: 100 ms por jugada en los enfrentamientos publicados; aproximadamente 72-77 k nodos por segundo en una RTX 4070, tanto para esta red como para sus rivales en esos matches.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bughouse-twin-s (este modelo) | 0,97 M (ONNX) / 1,25 M (checkpoint) | TwinBoardNet sin atencion ni ECA, tronco compartido e intercambios entre tableros | no aplica | +68 Elo (IC 95 % +31 a +107) frente a su iteracion 0 destilada; ~3x mas nodos por segundo que la red profesora | MIT | HuggingFace, 0 descargas, 0 likes |
| bughouse-rise-v3 (profesor) | 13,6 M | Red estilo RISE: ambos tableros apilados como canales de una imagen 8x8 | no aplica | profesor de destilacion de este modelo; superado por twin-s a 100 ms por jugada segun el autor | no disponible en la informacion proporcionada | HuggingFace |
| Versiones con atencion de twin-s | no disponible | TwinBoardNet con atencion entre tableros y ECA | no aplica | inferiores a la variante sin atencion a igualdad de tiempo; la eliminacion de la atencion dio ~+32 % de velocidad de busqueda | no disponible | no disponible |

No se dispone de comparaciones con otras familias de motores de Bughouse ajenas al proyecto Hivemind en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio cerrado: solo evalua posiciones de Bughouse chess con la representacion version 3 de 74 planos. No procesa lenguaje natural ni sirve para tareas generales.
- Ausencia de datos estandarizados: no hay benchmarks publicos tipo MMLU o HumanEval, y las cifras de fuerza proceden exclusivamente de enfrentamientos internos del propio autor, sin validacion independiente.
- Cifras de Elo autoinformadas: las ganancias de Elo se miden contra la propia iteracion 0 y la iteracion anterior, no contra otros motores externos, por lo que no son comparables con escalas Elo de ajedrez estandar.
- Riesgo de alucinacion no aplica, pero si de sobreconfianza: la cabeza de valor y el WDL pueden estar mal calibrados en posiciones atipicas de Bughouse (pockets muy cargados, desequilibrios extremos), al haberse entrenado principalmente con auto-juego.
- Sesgo de dominio: el entrenamiento con 30 M de posiciones etiquetadas por RISEv3.3 hereda los sesgos y los huecos de cobertura de ese profesor, en particular en aperturas poco frecuentes y en lineas de cooperacion entre companeros.
- Dependencia de la representacion: la entrada debe codificarse exactamente con la version 3 de planos de bughouse-rise-v3; una codificacion distinta invalida las salidas.
- Advertencia de despliegue: los planes FP16 de TensorRT se generan en tiempo de ejecucion y no se publican, por lo que el primer arranque en una GPU nueva conlleva compilacion. No hay planes precompilados para produccion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion manteniendo el aviso de copyright. No se documentan restricciones adicionales.
- Mantenimiento: el repositorio no tiene descargas ni likes y fue actualizado por ultima vez el 2026-10-04; no hay garantia de soporte ni de actualizaciones futuras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aminwoo/bughouse-twin-s
- Red profesora RISEv3.3: https://huggingface.co/aminwoo/bughouse-rise-v3
- Repositorio del motor Hivemind: https://github.com/aminwoo/hivemind
- Articulo sobre Bughouse chess en Wikipedia: https://en.wikipedia.org/wiki/Bughouse_chess

No se han encontrado enlaces relevantes adicionales en la busqueda web: los resultados devueltos corresponden a un sitio de camaras sin relacion alguna con el modelo.
