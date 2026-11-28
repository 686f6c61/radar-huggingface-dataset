# NicolasOng/a0cc-models

## Resumen

`NicolasOng/a0cc-models` es una coleccion de redes neuronales entrenadas con el algoritmo AlphaZero para jugar al ajedrez chino (Chinese Checkers, tambien conocido como damas chinas) sobre tableros de distintos tamanos. El modelo no es un modelo de lenguaje: es un conjunto de ocho checkpoints exportados a ONNX que implementan la funcion de politica y valor de un agente AlphaZero, desarrollados por Nicolas Ong en el marco de su tesis de master en la Universidad de Alberta. El objetivo del trabajo era investigar el uso de objetivos de valor TD(λ) en AlphaZero aprovechando que el juego esta fuertemente resuelto en tableros pequenos.

El repositorio incluye dos checkpoints por cada uno de los cuatro tableros soportados (4×4 con 3 piezas, 5×5 con 6 piezas, 6×6 con 6 piezas y 7×7 con 4 piezas): un checkpoint "final" totalmente entrenado y un checkpoint "half" temprano que sirve para ilustrar el progreso del entrenamiento. Los pesos estan pensados para el sitio web complementario de la tesis, donde el usuario puede jugar contra las redes directamente en el navegador.

La relevancia de este modelo es acotada y muy especifica: no compite con modelos de proposito general, sino que constituye un artefacto de investigacion reproducible sobre AlphaZero, objetivos de valor y juegos resueltos. Su interes esta en la metodologia (TD(λ) con λ = 0.9, exportacion a ONNX con cuantizacion mixta) y en su uso como referencia para estudiar el comportamiento de AlphaZero en dominios con solucion conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red residual (ResNet) con tronco convolucional y cabezas de politica y valor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un tablero `[B, 2, n, n]`) |
| Tipos de cuantizacion | float16 en la mayoria de capas; int8 con una escala por columna de salida en las dos capas densas grandes |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (exportado desde JAX/Flax) |

## Arquitectura y entrenamiento

La red es una ResNet con un stem convolucional 3×3 seguido de 3 bloques residuales de 256 canales. Sobre el tronco se montan dos cabezas: una cabeza de politica consistente en una convolucion 1×1 y una capa densa que produce logits sobre todos los pares origen→destino (`n⁴` salidas), y una cabeza de valor con una capa densa de 256 unidades y otra densa de 1 con activacion tanh que estima el resultado esperado para el jugador en turno (−1 derrota, +1 victoria). El entrenamiento se realizo en JAX/Flax.

El entrenamiento sigue el esquema AlphaZero con objetivos de valor TD(λ) y λ = 0.9, que es precisamente la innovacion que la tesis investiga. Los tableros pequenos estan fuertemente resueltos, lo que permite comparar los objetivos aprendidos con el valor real. Se generaron ocho checkpoints: para cada tablero, un modelo "final" (iteraciones 121, 200, 200 y 200 segun el tablero) y un modelo "half" temprano (iteraciones 3, 8, 8 y 8) que sirve como referencia de progreso. Para la exportacion web, BatchNorm se pliega dentro de las convoluciones y las dos capas densas grandes se almacenan en int8 con una escala por columna de salida, dequantizandose al cargar; el resto de tensores se guardan en float16. Los exports coinciden con los modelos Flax originales con un error de aproximadamente 0.001 en el valor y eligen el mismo mejor movimiento legal en posiciones aleatorias.

## Capacidades

- Evaluacion de posiciones de ajedrez chino: dado un tablero de tamano `n`, produce una estimacion de valor (tanh, entre −1 y +1) y logits de politica sobre todos los movimientos origen→destino.
- Juego completo mediante busqueda: la red esta disenada para integrarse en un MCTS (en la tesis, con 512 muestras y `c_puct = 0.25`) para seleccionar movimientos.
- Soporte de cuatro configuraciones de tablero: 4×4 con 3 piezas, 5×5 con 6 piezas, 6×6 con 6 piezas y 7×7 con 4 piezas.
- Normalizacion de perspectiva: cuando mueve el segundo jugador, el tablero se rota 180° para que la red siempre vea al jugador en turno dirigiendose a la misma esquina.
- Inferencia en navegador: los modelos ONNX estan exportados para ejecutarse del lado del cliente en el sitio web complementario.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Juego interactivo en navegador: el sitio web complementario de la tesis carga los ONNX y permite al usuario jugar contra cada checkpoint, con la red evaluando posiciones y un MCTS ligero seleccionando movimientos.
- Investigacion sobre objetivos de valor en AlphaZero: comparar el comportamiento de los checkpoints "half" y "final" permite estudiar como evolucionan las estimaciones de valor con el entrenamiento en un dominio resuelto.
- Benchmark de algoritmos de busqueda: los checkpoints finales sirven como oponente de referencia fijo (con tasas de victoria medidas del 95–99 % frente a una linea base UCT MCTS con rollouts DistEval) para evaluar nuevas variantes de MCTS o de seleccion de movimientos.
- Reproduccion de resultados de tesis: los ocho modelos permiten reproducir las tasas de victoria reportadas (256 partidas, ambas sillas) sin reentrenar desde cero.
- Educacion sobre AlphaZero: el par de checkpoints por tablero ilustra de forma tangible la diferencia entre un agente apenas entrenado y uno maduro, util en cursos de aprendizaje por refuerzo.
- Pruebas de despliegue ONNX en el cliente: los modelos, de 9,3 MB a 40,6 MB, sirven como caso de prueba para pipelines de inferencia ONNX con cuantizacion mixta (float16 + int8) en entornos web.
- Evaluacion de robustez de exportaciones: comparar las salidas ONNX con las de los modelos Flax originales permite validar herramientas de conversion y de cuantizacion.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados son las tasas de victoria frente a la linea base de la tesis (UCT MCTS con rollouts DistEval, AlphaZero a 512 muestras y `c_puct = 0.25`, 256 partidas jugando ambas sillas):

| Fichero | Tablero | Checkpoint | Iteracion | Tasa de victoria vs linea base | Tamano |
|---|---|---|---|---|---|
| `16-3-final.onnx` | 4×4, 3 piezas | final | 121 | 99,6 % | 9,3 MB |
| `16-3-half.onnx` | 4×4, 3 piezas | half | 3 | 49,6 % | 9,3 MB |
| `25-6-final.onnx` | 5×5, 6 piezas | final | 200 | 98,0 % | 12,9 MB |
| `25-6-half.onnx` | 5×5, 6 piezas | half | 8 | 66,0 % | 12,9 MB |
| `36-6-final.onnx` | 6×6, 6 piezas | final | 200 | 96,1 % | 21,5 MB |
| `36-6-half.onnx` | 6×6, 6 piezas | half | 8 | 57,0 % | 21,5 MB |
| `49-4-final.onnx` | 7×7, 4 piezas | final | 200 | 95,7 % | 40,6 MB |
| `49-4-half.onnx` | 7×7, 4 piezas | half | 8 | 49,6 % | 40,6 MB |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: minima. Los ficheros ONNX ocupan entre 9,3 MB y 40,6 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU o en el navegador.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, GTX 1060 o superiores) es suficiente. Para el sitio web, la inferencia se ejecuta del lado del cliente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU.
- Opciones de despliegue: ONNX Runtime (incluido el runtime web/WebAssembly), y cualquier framework que consuma ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste dominante en juego real sera el MCTS (512 muestras en la configuracion de la tesis), no la red.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos AlphaZero para ajedrez chino en la informacion proporcionada. Como referencias cualitativas de la misma categoria (agentes AlphaZero para juegos de tablero), podrian considerarse las redes de AlphaZero originales para ajedrez, shogi y Go, o implementaciones abiertas como Leela Chess Zero, pero no se dispone de sus especificaciones ni de resultados comparables dentro de esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NicolasOng/a0cc-models` | no disponible | no aplica | 95,7–99,6 % vs linea base UCT MCTS (checkpoints finales) | CC BY 4.0 | ONNX en Hugging Face |
| Alternativas AlphaZero para juegos de tablero | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas ni procesa lenguaje natural. Cualquier uso fuera del ajedrez chino en los tableros soportados carece de sentido.
- Dominio cerrado: solo funciona en tableros 4×4, 5×5, 6×6 y 7×7 con las configuraciones de piezas indicadas; no generaliza a otros tamanos ni a otras variantes del juego.
- Requiere busqueda: la politica por si sola no garantiza un juego fuerte; el rendimiento reportado se obtuvo con MCTS a 512 muestras y `c_puct = 0.25`.
- Los checkpoints "half" estan pensados como ilustracion de progreso y son claramente mas debiles (por ejemplo, 49,6 % frente a 99,6 % en el tablero 4×4).
- La cuantizacion int8 de las capas densas introduce un error de aproximadamente 0.001 en el valor respecto a los modelos Flax originales; en la practica no cambia el mejor movimiento legal en posiciones aleatorias, pero no se han publicado pruebas exhaustivas en todas las posiciones.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero si existe el riesgo habitual de sobreajuste al regimen de entrenamiento y a la linea base concreta de la tesis.
- Licencia CC BY 4.0: permite uso comercial y modificaciones con atribucion; es necesario citar al autor y la tesis.
- No se especifican los idiomas ni datos demograficos porque no aplican; no hay riesgos de alucinacion en el sentido linguistico, pero las estimaciones de valor son aproximaciones y pueden ser erroneas en posiciones atipicas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NicolasOng/a0cc-models
- Tesis de master: *Investigating AlphaZero's Value Targets Using Strongly Solved Chinese Checkers* (Nicolas Ong, University of Alberta); no se proporciona URL en la informacion disponible.
- Sitio web complementario con los modelos jugables en el navegador: no se proporciona URL en la informacion disponible.
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
