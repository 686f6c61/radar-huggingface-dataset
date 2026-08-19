# shubhxho/sable-chess-net

## Resumen

Sable es una red neuronal de evaluación de ajedrez (NNUE) de tan solo 60 KB, desarrollada por shubhxho como componente central del motor de ajedrez Sable. A diferencia de los modelos de lenguaje, no genera texto ni razona: recibe una posición de ajedrez y devuelve un valor escalar en centipeones desde la perspectiva del bando que mueve. La red fue entrenada mediante destilación de conocimiento a partir de la búsqueda del propio motor, utilizando MLX sobre Apple silicon, y está cuantizada a int8 para ejecutarse con SIMD entero sin necesidad de frameworks externos.

El modelo destaca por su tamaño extremadamente reducido (60.976 bytes) y por ser la evaluación completa del motor: no hay ningún término heurístico escrito a mano por debajo. Según los datos del autor, el motor completo juega a aproximadamente 2800 Elo, anclado contra los ajustes `UCI_Elo` de Stockfish. Es relevante porque demuestra que es posible obtener una red de evaluación competitiva con una huella mínima, entrenada íntegramente en hardware de consumo, y porque su formato está documentado de forma completa para ser reutilizado.

La arquitectura es un perceptrón multicapa feedforward: 934 características binarias dispersas por bando, una capa oculta de 64 neuronas (compartida entre perspectivas) con ReLU recortada, y una salida que selecciona uno de 8 cubos de salida según el material. La licencia es MIT y el repositorio principal está en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa feedforward (NNUE): 934 features -> 64 hidden (por perspectiva, compartida) -> ReLU recortada -> 1 de 8 buckets de salida |
| Parametros totales | No publicado explícitamente; tamaño del archivo de pesos: 60.976 bytes (int8) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de evaluación de ajedrez, no de lenguaje) |
| Tipos de cuantizacion | int8 (cuantización consciente, pesos cuantizados en el archivo distribuido) |
| Idiomas soportados | No aplica (entrada: posición de ajedrez, salida: valor numérico) |
| Licencia | MIT |
| Formato de pesos | `net.bin` (formato propio documentado en la model card; no es safetensors ni GGUF) |

## Arquitectura y entrenamiento

La red es un feedforward de dos capas con una capa oculta de 64 unidades, compartida entre ambas perspectivas (blancas y negras), seguida de una ReLU recortada y una capa de salida que selecciona uno de 8 cubos según el material. La entrada son 934 características binarias dispersas calculadas por el motor, que codifican relaciones entre piezas y casillas. La salida es un escalar en centipeones desde el punto de vista del bando que mueve.

El entrenamiento se realizó por destilación de conocimiento: el motor Sable generó partidas mediante self-play y etiquetó posiciones con el resultado de su propia búsqueda. La red se entrenó para predecir esas etiquetas sin ejecutar la búsqueda. Se utilizó MLX sobre Apple silicon, con una emisión estimada de 1,4 kgCO2eq (6 minutos de GPU M-series a ~20W). La cuantización a int8 fue consciente, es decir, se incorporó durante el entrenamiento, y el archivo distribuido ya está cuantizado. Un hallazgo clave documentado por el autor es la importancia de un factor de ganancia en la capa de salida: un único constante multiplicador, que no cambia las preferencias entre posiciones, valió aproximadamente 60 Elo y había estado sesgando comparaciones de arquitectura durante meses.

## Capacidades

- Evaluación posicional de ajedrez: devuelve un valor escalar (centipeones) para una posición dada, desde la perspectiva del bando que mueve.
- Integración en un motor de ajedrez: la red es el componente de evaluación completo del motor Sable, que realiza la búsqueda (tree search) y usa esta red para valorar nodos.
- Ejecución sin frameworks: los pesos int8 se ejecutan con SIMD entero en Rust, sin dependencias externas (no es un modelo PyTorch, no se puede cargar con `from_pretrained`).
- Formato documentado: la model card incluye un ejemplo de parsing de `net.bin` en veinte líneas de NumPy, lo que permite reutilizar el formato en otros proyectos.
- Cuantización int8 nativa: diseñada para correr en entornos edge o embebidos.

## Casos de uso

- Motor de ajedrez autónomo: el uso principal es como evaluador del motor Sable. Se integra en el binario del motor, que gestiona la búsqueda, aperturas y protocolo UCI. Adecuado por su tamaño mínimo y su rendimiento (~2800 Elo).
- Análisis de partidas en tiempo real: gracias a su velocidad (inferencia con SIMD entero) puede evaluar posiciones en microsegundos, útil para análisis en vivo o entrenamiento de jugadores.
- Componente de entrenamiento para otros motores: el formato y el bucle de entrenamiento están documentados y bajo licencia MIT, por lo que puede servir de base para desarrollar redes de evaluación propias.
- Investigación en destilación de búsqueda: el proyecto demuestra cómo destilar el conocimiento de una búsqueda en una red pequeña; útil para estudiar técnicas de knowledge distillation en dominios de decisión.
- Despliegue en hardware limitado: al pesar 60 KB y no requerir framework, puede ejecutarse en microcontroladores o dispositivos edge con capacidades de cómputo mínimas.
- Educación en redes neuronales aplicadas a juegos: la documentación completa del formato y el entrenamiento lo convierte en un ejemplo didáctico para aprender sobre NNUE, cuantización y destilación.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en la model card. No se han verificado de forma independiente.

| Tarea | Dataset | Métrica | Valor | Detalles |
|---|---|---|---|---|
| Juego de ajedrez, enfrentamiento contra la versión anterior | Aperturas aleatorias de 8 pliegues, colores intercambiados | Elo a 20.000 nodos/movimiento | 63,0 | 3000 partidas, tres conjuntos de aperturas independientes, IC 95% ±12,6 |
| Juego de ajedrez, enfrentamiento contra la versión anterior | Idem | Elo a 100 ms/movimiento | 42,3 | 800 partidas, IC 95% ±24,3 |
| Juego de ajedrez, enfrentamiento contra la versión anterior | Idem | Elo a 300 ms/movimiento | 51,6 | 400 partidas, IC 95% ±34,4 |
| Juego de ajedrez, anclaje de rating absoluto | Stockfish con UCI_LimitStrength, cinco ajustes de 2600 a 3000 | Elo implícito en la escala UCI_Elo de Stockfish (crossover 0,5) | 2800 | 1500 partidas, 300 por ajuste, 100 ms/movimiento. Ajuste de máxima verosimilitud 2819 ± 19, interpolación de crossover 2783; se cita ±40. La escala nominal de Stockfish se comprime aquí (pendiente ajustada 0,83), por lo que el crossover es la estimación independiente de pendiente |
| Juego de ajedrez, gauntlet contra versiones anteriores | Todos los binarios históricos del repositorio | Elo vs el evaluador heurístico que reemplazó | 156,2 | 600 partidas a 20.000 nodos/movimiento, IC 95% ±30,7 |
| Juego de ajedrez, gauntlet contra versiones anteriores | Idem | Elo vs la primera versión de red | 150,7 | 600 partidas a 20.000 nodos/movimiento, IC 95% ±30,5 |
| Juego de ajedrez, control de self-play | Mismo binario en ambos lados | Elo | 5,2 | 400 partidas; cero dentro del IC 95% ±34,1, por lo que el arnés es insesgado |
| Regresión contra la búsqueda del maestro | 20.000 posiciones retenidas etiquetadas por la búsqueda del motor | Correlación de Pearson con la puntuación del maestro (invariante bajo la ganancia de salida) | 0,9803 | Pesos cuantizados int8, tal como se distribuyen |

## Requisitos de hardware

- Tamaño del modelo: 60.976 bytes (int8), por lo que la VRAM o RAM necesaria es despreciable (menos de 1 MB).
- GPU recomendada: no requiere GPU; el autor entrenó con MLX en Apple silicon (M-series), pero la inferencia puede ejecutarse en CPU con SIMD entero.
- Compatibilidad con hardware de consumo: sí, funciona en cualquier CPU moderna, incluidos microcontroladores y dispositivos edge, gracias a su tamaño y a la implementación sin `std` en Rust.
- Opciones de despliegue: se distribuye como parte del motor Sable (binario Rust con protocolo UCI). No se integra con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se publican cifras exactas, pero la inferencia es una sola pasada feedforward de 934->64->1, ejecutable en microsegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de evaluación de ajedrez en la información proporcionada. La model card solo compara contra versiones anteriores del propio motor y contra Stockfish como ancla de rating. No se conocen modelos comparables en la misma categoría (redes NNUE de tamaño mínimo) con datos públicos en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona sobre posiciones de forma simbólica, ni puede cargarse en pipelines de transformers. Solo produce un valor numérico para una posición dada.
- No tiene noción de movimientos legales: la red evalúa posiciones, pero no decide jugadas; la búsqueda la realiza el motor externo.
- Depende del motor para su uso práctico: el archivo de pesos por sí solo no es útil sin el código del motor Sable, que calcula las características de entrada y gestiona la búsqueda.
- Riesgo de alucinación no aplica (no es generativo), pero sí existe riesgo de errores de evaluación en posiciones fuera de la distribución de entrenamiento, aunque la correlación con la búsqueda del maestro es alta (0,9803).
- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse con self-play del propio motor, podría heredar sesgos de las aperturas o de la política de búsqueda del motor.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación sin restricciones, siempre que se incluya el aviso de copyright.
- Advertencia para producción: los benchmarks son declarados por el autor y no verificados de forma independiente; el ancla de 2800 Elo tiene una incertidumbre de ±70 según el propio autor.

## Enlaces

- Repositorio del motor Sable: https://github.com/shubhxho/sable
- Página del modelo en HuggingFace: https://huggingface.co/shubhxho/sable-chess-net
- Documentación de MLX (framework de entrenamiento): https://github.com/ml-explore/mlx
