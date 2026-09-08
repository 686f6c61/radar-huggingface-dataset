# burrowdweller/rook-chess-v1

## Resumen

`rook-chess-v1` es un motor de ajedrez relacional diseñado para ejecutarse en el navegador, desarrollado por burrowdweller (Jun Ling). A diferencia de los modelos de lenguaje convencionales, no genera texto ni razona sobre tokens; opera directamente sobre las 64 casillas del tablero, manteniendo una tabla de relaciones entre pares ordenados de casillas a lo largo de seis capas de red. Esta tabla se inicializa con las reglas de movimiento —qué casillas atacan a cuáles y qué las bloquea—, y la selección de jugada se realiza mediante búsqueda Monte Carlo Tree Search (MCTS) en tiempo de ejecución.

El modelo tiene aproximadamente 3,0 millones de parámetros, lo que supone cerca del 40 % del tamaño de `mini-chessformer-v1`, otro modelo del mismo autor. La diferencia no es solo de escala, sino estructural: en lugar de razonar sobre casillas aisladas, el modelo lleva una representación explícita de las relaciones entre pares de casillas. Se distribuye como un paquete de navegador (`chess-gpt-package-v1`) con un manifiesto, un script de entrada y un modelo ONNX, y requiere un runner compatible para funcionar. Su relevancia radica en explorar una arquitectura compacta y especializada para juegos de tablero, ejecutable en clientes web sin infraestructura de servidor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal relacional ONNX con búsqueda MCTS (no es un transformer de lenguaje) |
| Parametros totales | ~3,0 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (motor de ajedrez, sin soporte de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX, empaquetado con `manifest.json` y `entry.js` |

## Arquitectura y entrenamiento

La arquitectura de `rook-chess-v1` se aleja del enfoque estándar de transformers para el ajedrez. En lugar de procesar secuencias de tokens, la red opera sobre una representación de las 64 casillas y mantiene una tabla de pares ordenados de casillas a través de todas sus capas. Esta tabla se siembra a partir de las reglas de movimiento: qué casillas atacan a otras y qué piezas bloquean esos ataques. Esto permite que el modelo capture relaciones espaciales y de ataque de forma explícita, en lugar de aprenderlas implícitamente a partir de datos.

La selección de movimiento se realiza en dos fases: la red genera una evaluación o política por casilla, y un motor de búsqueda MCTS explora el árbol de jugadas legales para decidir el movimiento final. El paquete incluye un `entry.js` que implementa la búsqueda y el selector de jugadas, y un manifiesto que describe los archivos y sus hashes. No se han publicado detalles sobre el proceso de entrenamiento, el número de tokens o partidas utilizadas, ni si se aplicaron técnicas como RLHF o DPO. La innovación principal es la representación relacional de pares de casillas combinada con MCTS, que permite que un modelo muy pequeño obtenga fuerza a través de la búsqueda en tiempo de ejecución.

## Capacidades

- Jugar ajedrez legal: dado un historial de movimientos y una lista de movimientos legales, devuelve uno de esos movimientos.
- Búsqueda con MCTS: la fuerza del motor proviene de la búsqueda en tiempo de ejecución, no solo de la red neuronal.
- Ejecución en navegador: está diseñado para funcionar en entornos web mediante ONNX Runtime Web o un runner compatible.
- Integración con el contrato `chess-gpt-package-v1`: expone una API con `loadPackage`, `newGame` y `chooseMove`.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni visión, ni audio, ni razonamiento multi-step en lenguaje natural.
- Representación relacional explícita: mantiene relaciones entre pares de casillas, lo que le permite capturar ataques y bloqueos de forma estructurada.

## Casos de uso

- Juego de ajedrez en el navegador: integrar el paquete en una página web para ofrecer un oponente de ajedrez que juega en el cliente, sin necesidad de servidor. El modelo es pequeño y se ejecuta en el navegador, lo que reduce costes y latencia.
- Análisis de partidas en tiempo real: usar el motor para sugerir movimientos en una interfaz de análisis, mostrando la jugada elegida tras la búsqueda MCTS. Su tamaño reducido permite cargarlo rápidamente en aplicaciones web.
- Entrenamiento y práctica de ajedrez: incorporar el motor como oponente ajustable en plataformas educativas para que estudiantes de distintos niveles practiquen tácticas y estrategias.
- Prototipos de agentes de juego: emplear el modelo como base para experimentar con algoritmos de búsqueda y representaciones relacionales en juegos de tablero, gracias a su arquitectura compacta y su API sencilla.
- Demostraciones de ONNX en el navegador: servir como ejemplo de cómo ejecutar modelos ONNX en clientes web con WebAssembly, mostrando un caso de uso práctico y no trivial.
- Investigación en IA relacional: estudiar cómo las tablas de relaciones entre pares de casillas afectan al rendimiento en juegos de razonamiento espacial, comparando con modelos que operan solo sobre casillas individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento en pruebas como MMLU, HumanEval, GSM8K o torneos de ajedrez que permitan comparar este modelo con otras alternativas.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo de ~3 millones de parámetros en ONNX, no requiere GPU dedicada.
- GPU recomendadas: ninguna; el modelo está pensado para ejecutarse en CPU o WebAssembly en el navegador.
- Compatibilidad con GPU de consumo: no aplica, ya que no se necesita GPU para la inferencia.
- Opciones de despliegue: navegador con un runner compatible con `chess-gpt-package-v1`; ONNX Runtime Web; también puede ejecutarse en entornos Node.js o Python con ONNX Runtime si se extrae el modelo del paquete.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| `rook-chess-v1` | ~3,0 M | Red relacional ONNX + MCTS | no disponible | HuggingFace (paquete de navegador) |
| `mini-chessformer-v1` | ~7,5 M (estimado, 40 % mayor que rook) | Transformer para ajedrez | no disponible | HuggingFace (paquete de navegador) |

No se dispone de información suficiente para comparar con otros motores de ajedrez neuronales como AlphaZero o Leela Chess Zero, ya que no se han publicado datos de rendimiento ni detalles de entrenamiento de `rook-chess-v1`. La comparación con `mini-chessformer-v1` se basa en el tamaño estimado y en que ambos pertenecen al mismo ecosistema de paquetes de navegador del autor.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede generar texto, responder preguntas ni procesar lenguaje natural. Su única función es seleccionar movimientos legales de ajedrez.
- Licencia no disponible: al no especificarse la licencia, el uso comercial o la redistribución pueden estar restringidos. Conviene contactar con el autor antes de usarlo en producción.
- Sin benchmarks publicados: no se ha evaluado su fuerza de juego ni se ha comparado con motores de ajedrez estándar, por lo que el rendimiento es desconocido.
- Dependencia de un runner compatible: el modelo no funciona como un checkpoint de Transformers estándar; requiere un runner que implemente el contrato `chess-gpt-package-v1`.
- Datos de entrenamiento no revelados: no se han publicado detalles sobre el proceso de entrenamiento, el dataset o las partidas utilizadas, lo que impide evaluar posibles sesgos o limitaciones en la cobertura de aperturas o finales.
- Proyecto experimental: el repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido ampliamente probado ni validado por la comunidad.
- Fecha de creación inusual: el modelo fue creado el 2026-09-08, lo que podría indicar un error de metadatos o un proyecto con una línea temporal no verificada.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/burrowdweller/rook-chess-v1
- Perfil del autor en HuggingFace: https://huggingface.co/burrowdweller
- Modelo relacionado `mini-chessformer-v1`: https://huggingface.co/burrowdweller/mini-chessformer-v1
- Repositorio fuente mencionado: https://github.com/junisbuilding/chessdb
