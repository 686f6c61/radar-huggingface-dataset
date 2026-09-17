# mlabonne/chessfly

# ChessFly (mlabonne/chessfly)

## Resumen

ChessFly es un experimento de mlabonne que entrena el conectoma completo de una mosca de la fruta adulta (*Drosophila melanogaster*) para jugar al ajedrez. No es un transformer ni un modelo de lenguaje: es una red recurrente de 138.639 neuronas y 15.091.983 conexiones cuya topología está congelada exactamente como la tiene la reconstrucción FlyWire FAFB, incluido el carácter excitador o inhibidor asignado a cada sinapsis.

Lo único que aprende es un codificador del tablero hacia las 10.855 neuronas sensoriales visuales, una ganancia positiva por conexión (nunca el signo), una ganancia homeostática y un umbral por neurona y paso, y un decodificador que lee las 41.692 neuronas del cerebro central y descendentes para producir una política sobre 1.968 movimientos y una probabilidad de victoria en 64 bins. La actividad se asienta en 5 pasos de una regla recurrente con pesos `W_ij = sign_ij * exp(theta_ij)`.

Se entrenó con 4,4 millones de posiciones anotadas de Lichess y recupera el mejor movimiento de Stockfish el 30,4% de las veces, con un error absoluto medio de valor de 0,081, frente al 3% de un movimiento legal aleatorio y el 13% de jugar siempre el movimiento legal más común. Su interés actual es doble: como prueba de concepto de cómputo sobre un sustrato biológico real y como métrica funcional para evaluar reconstrucciones conectómicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente de 5 pasos sobre el conectoma completo de *Drosophila melanogaster* (reconstrucción FlyWire FAFB); no es un transformer |
| Parámetros totales | No disponible como recuento único; la red contiene 138.639 neuronas y 15.091.983 conexiones, con un `log_gain` entrenable por conexión más escalas, desplazamientos y cabezas de decodificación |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la entrada es una codificación de 780 características del tablero) |
| Tipos de cuantización | No disponible (no se publican cuantizaciones del modelo) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | `other`; se aplican los términos no comerciales de FlyWire a todo lo derivado del grafo |
| Formato de pesos | safetensors (`flynet.safetensors`) |
| Dominio | Ajedrez (selección de movimiento y estimación de valor) |
| Neuronas de entrada | 10.855 neuronas sensoriales visuales |
| Neuronas de salida leídas | 41.692 neuronas del cerebro central y descendentes |
| Espacio de acciones | 1.968 logits de movimiento, enmascarados a los legales |
| Salida de valor | 64 bins de probabilidad de victoria |
| Dataset de entrenamiento | 4,4 millones de posiciones anotadas de Lichess |

## Arquitectura y entrenamiento

La anatomía está congelada: cada conexión ocupa la posición que FlyWire le asigna y conserva el signo (excitador o inhibidor) que sus autores determinaron. El aprendizaje se restringe a un codificador de características del tablero hacia las neuronas sensoriales visuales, a una ganancia positiva por conexión (el signo anatómico nunca se aprende), a una ganancia y un umbral homeostáticos por neurona y paso, y a un decodificador con dos cabezas. Cada movimiento es un único forward pass sobre todo el cerebro: se empaqueta el release de FlyWire en un grafo CSR, se reflejan las posiciones con negras a mover para que la mosca juegue siempre con blancas, se codifican 780 características del tablero como corrientes sobre las neuronas de entrada y se ejecutan 5 pasos de `h <- (1 - a) h + a relu(gamma (W h + u - mu) / sigma + beta)`, con `W_ij = sign_ij * exp(theta_ij)`.

El entrenamiento es supervisado sobre 4,4 millones de posiciones anotadas del dataset `Lichess/chess-position-evaluations` (CC0); no se documenta RLHF, DPO ni aprendizaje por refuerzo. Los datos anatómicos proceden del conectoma y los signos de neurotransmisores de Shiu et al. (Nature 634, 2024) sobre la reconstrucción FlyWire FAFB de Dorkenwald et al. (Nature 2024), y las clases y posiciones celulares de Schlegel et al. (Nature 634, 2024). Como innovación operativa, la demo apila una búsqueda de profundidad 3 en la que un nivel completo del árbol es un único forward pass batcheado a través del cerebro. El grafo del conectoma no se redistribuye en el repositorio: `connectome_meta.json` lista los ficheros de origen con sus hashes.

## Capacidades

- Selección de movimiento de ajedrez: produce logits sobre 1.968 movimientos y los enmascara a los legales.
- Estimación de valor de posición: 64 bins de probabilidad de victoria con un MAE de 0,081 frente a las anotaciones de Lichess.
- Codificación de posiciones: convierte 780 características del tablero en corrientes sobre 10.855 neuronas sensoriales visuales.
- Búsqueda en árbol: soporta una búsqueda de profundidad 3 en la demo, donde cada nivel del árbol se evalúa en un forward pass batcheado.
- Lectura de representaciones internas: expone la actividad de 41.692 neuronas del cerebro central y descendentes tras los 5 pasos de dinámica.
- Juego con blancas: refleja las posiciones con negras a mover para que la mosca juegue siempre con blancas.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso general, capacidades multilingües, visión, audio ni modo de pensamiento.

## Casos de uso

- Neurociencia computacional: usar el conectoma como sustrato fijo y analizar cómo la dinámica de 5 pasos y las ganancias homeostáticas resuelven una tarea cognitiva concreta, aislando el efecto de la topología frente al de los pesos aprendidos.
- Evaluación funcional de reconstrucciones conectómicas: emplear el 30,4% de coincidencia con el mejor movimiento de Stockfish como métrica de calidad de la reconstrucción FlyWire, comparando versiones o correcciones del grafo bajo el mismo protocolo de entrenamiento.
- Investigación sobre plasticidad restringida: estudiar qué se puede aprender cuando el signo de cada sinapsis está fijado por la anatomía y solo se ajustan ganancias positivas, un escenario relevante para modelos bioinspirados con restricciones estructurales.
- Divulgación y docencia: la demo del Space permite a cualquier persona jugar contra una mosca en el navegador, un recurso didáctico para explicar conectomas y computación neuronal.
- Análisis de representaciones internas: extraer la actividad de las 41.692 neuronas centrales y descendentes por posición para estudiar cómo se codifica el estado del tablero en una red biológica.
- Transferencia de arquitectura encoder-conectoma-decoder: reutilizar el esquema (codificador entrenable + grafo biológico congelado + decodificador con cabezas) en otros dominios con estructura de entrada bien definida, aprovechando que el grafo es disperso y de bajo coste computacional.
- Generación de posiciones de estudio: usar la cabeza de valor para filtrar o etiquetar posiciones por probabilidad de victoria estimada en pipelines de análisis de partidas.

## Benchmarks y rendimiento

| Métrica | ChessFly | Movimiento legal aleatorio | Movimiento legal más común |
|---|---|---|---|
| Coincidencia con el mejor movimiento de Stockfish | 30,4% | 3% | 13% |
| MAE de valor (64 bins) | 0,081 | No disponible | No disponible |

No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje. La demo añade una búsqueda de profundidad 3 sobre la política, pero no se publican métricas de fuerza de juego (Elo) asociadas a esa configuración.

## Requisitos de hardware

- Tamaño del repositorio: 0,1 GB, lo que incluye los pesos y los recursos de la demo. Estimación: los 15.091.983 valores de `log_gain` en float32 ocuparían unos 60 MB, más codificador, decodificador y cabezas.
- VRAM estimada para inferencia: por debajo de 1 GB en float32 según el tamaño del repositorio; no se publican cifras oficiales.
- GPU recomendadas: no disponible; cualquier GPU de consumo con más de 1 GB de memoria sería suficiente según la estimación anterior. Tarjetas como RTX 4090, A100 o H100 no aportarían ventaja por memoria, aunque sí por paralelismo en el forward batcheado.
- Cabe en GPU de consumo: sí, según la estimación derivada del tamaño del repositorio.
- Opciones de despliegue: carga de pesos con `safetensors.torch.load_file`, grafo del conectoma empaquetado como CSR y ejecución con PyTorch; la demo oficial está publicada como Hugging Face Space. No hay integraciones conocidas con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.
- Requisito adicional: el grafo FlyWire no se redistribuye, por lo que hay que obtenerlo de la fuente original y construir el CSR antes de poder ejecutar inferencia.

## Comparativa con modelos similares

No hay modelos comparables directos en la misma categoría: ChessFly no es un modelo de lenguaje ni un motor de ajedrez convencional, sino una red recurrente sobre un conectoma biológico congelado. La comparación con motores de ajedrez solo es válida en términos funcionales (jugar al ajedrez), no de arquitectura ni de rendimiento.

| Modelo | Tipo de arquitectura | Estrategia | Licencia | Disponibilidad |
|---|---|---|---|---|
| ChessFly | Red recurrente de 5 pasos sobre conectoma FlyWire, 138.639 neuronas y 15.091.983 conexiones | Política directa + búsqueda de profundidad 3 en la demo | `other` (términos no comerciales de FlyWire) | Pesos en Hugging Face y demo en Space |
| Stockfish | Motor alfa-beta con evaluación NNUE | Búsqueda alfa-beta | GPL | Código abierto |
| Leela Chess Zero | Red neuronal + MCTS | Búsqueda Monte Carlo | GPL | Código abierto |

No se dispone de cifras de parámetros, contexto ni Elo para los motores de la tabla en la información proporcionada, por lo que no se incluyen comparaciones numéricas.

## Limitaciones y advertencias

- Fuerza de juego muy limitada: recupera el mejor movimiento de Stockfish solo el 30,4% de las veces, muy lejos de un motor competitivo. La búsqueda de profundidad 3 de la demo no tiene métricas de Elo publicadas.
- Licencia restrictiva para uso comercial: la licencia es `other` y los términos no comerciales de FlyWire se aplican a todo lo derivado del grafo, lo que impide el uso comercial del modelo y de sus derivados.
- Dependencia de terceros: el grafo del conectoma no se redistribuye; hay que descargarlo de FlyWire y construir el CSR, con el riesgo de reproducibilidad que ello implica.
- Sesgo de datos: el entrenamiento usa 4,4 millones de posiciones de Lichess, por lo que hereda el estilo, el nivel y la distribución de esa fuente.
- Restricción de diseño: las posiciones con negras a mover se reflejan para que la mosca juegue siempre con blancas, lo que limita el modelo a un único color.
- Capacidades fuera de dominio nulas: no hay tool calling, agentes, multi-step reasoning genérico, multilingüismo, visión ni audio.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí puede asignar alta probabilidad a movimientos incorrectos sin señal de incertidumbre calibrada más allá de los 64 bins de valor.
- Sin cuantizaciones publicadas y con pesos presumiblemente en float32, lo que limita opciones de optimización de despliegue.
- Adopción mínima: 0 descargas y 10 likes en el momento de la consulta, sin validación independiente conocida ni resultados de benchmarks reproducidos por terceros.
- No se documentan evaluaciones con partidas completas ni comparaciones contra otros motores, por lo que no se puede estimar su nivel de juego real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlabonne/chessfly
- Demo (Hugging Face Space): https://hf.co/spaces/mlabonne/chessfly
- Dataset de etiquetas: https://huggingface.co/datasets/Lichess/chess-position-evaluations
- Shiu et al., Nature 634 (2024), conectoma y signos de neurotransmisores sobre FlyWire FAFB
- Dorkenwald et al., Nature 2024, reconstrucción FlyWire FAFB
- Schlegel et al., Nature 634 (2024), clases y posiciones celulares
- Fichero de pesos: `flynet.safetensors` en el repositorio del modelo
- Metadatos del conectoma: `connectome_meta.json` en el repositorio del modelo
