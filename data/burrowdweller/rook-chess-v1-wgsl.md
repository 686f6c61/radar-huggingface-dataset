# burrowdweller/rook-chess-v1-wgsl

## Resumen

rook-chess-v1-wgsl es un paquete de motor de ajedrez para navegador desarrollado por burrowdweller (Jun Ling). No es un modelo de lenguaje ni un checkpoint de Transformers, sino un motor de ajedrez cuyo cerebro neuronal se ejecuta directamente sobre WebGPU mediante shaders escritos a mano (WGSL), en lugar de a traves de ONNX Runtime. Comparte exactamente los mismos pesos y la misma busqueda que el modelo original rook-chess-v1; lo unico que cambia es el paso de evaluacion, que pasa del runtime de ONNX a codigo de computacion grafica.

El motor funciona con busqueda MCTS apoyada en una red neuronal pequena: lee las 64 casillas del tablero, mantiene una representacion de como se relaciona cada pareja de casillas con cualquier otra y elige un unico movimiento legal. La fuerza no proviene del tamano de la red, sino del tiempo dedicado a buscar en el momento de jugar. Al ejecutarse sobre WebGPU, el motor puede explorar mas movimientos en el mismo intervalo de tiempo que la version original.

La relevancia de este modelo es practica: demuestra como trasladar un motor neuronal de ajedrez a un entorno puramente de navegador con aceleracion grafica, con una mejora medida en partidas de tiempo igualado. Segun el autor, en un enfrentamiento de 20 parejas a tiempo igualado obtuvo 0,825 puntos frente a rook-chess-v1 (27 victorias, 12 tablas y 1 derrota), con retroceso automatico a ONNX Runtime si el navegador no dispone de WebGPU o si el dispositivo grafico se pierde durante la partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de evaluacion sobre representacion relacional del tablero (64 casillas y sus relaciones por pares) + busqueda MCTS; inferencia mediante shaders WebGPU (WGSL) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un estado fijo de tablero de 64 casillas (historial de partida para la busqueda) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (dominio especifico de ajedrez); idiomas naturales no disponibles |
| Licencia | no disponible |
| Formato de pesos | ONNX (red neuronal) dentro de un paquete de navegador con formato chess-gpt-package-v1 |
| Autor | burrowdweller (Jun Ling) |
| Fecha de creacion | 2026-09-24 |
| Fecha de actualizacion | 2026-09-24 |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 descargas / 0 likes |
| Libreria declarada | onnx |
| Etiquetas | onnx, chess, chess-engine, other, region:us |
| Pipeline declarado | other |

## Arquitectura y entrenamiento

La arquitectura es un motor de ajedrez con red neuronal de evaluacion y busqueda MCTS. La red opera sobre una representacion relacional: considera las 64 casillas del tablero y mantiene una tabla de relaciones entre cada pareja de casillas, de modo que la evaluacion captura interacciones de largo alcance entre piezas y posiciones. La red es deliberadamente pequena; el autor indica que la fuerza proviene de buscar en el momento de jugar, no de una red grande.

La innovacion tecnica de esta variante concreta esta en el backend de ejecucion: en lugar de evaluar la red a traves de ONNX Runtime, la evaluacion se implementa con shaders WebGPU escritos a mano. Los pesos y la logica de busqueda son identicos a los de rook-chess-v1; solo cambia el paso de evaluacion. El paquete se distribuye con un runner compatible que carga `browser/manifest.json` (lista de archivos y hashes), `browser/entry.js` (busqueda y selector de movimiento) y la red ONNX indicada en el manifiesto. Si el navegador no soporta WebGPU, o si el dispositivo grafico se pierde a mitad de partida, el motor cambia una sola vez a ONNX Runtime y continua jugando. No se han publicado en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Juego de ajedrez completo en el navegador: dado un historial y una lista de movimientos legales, devuelve un unico movimiento legal mediante `chooseMove({ history, legalMoves })`.
- Busqueda MCTS con evaluacion neuronal en el momento de jugar.
- Evaluacion acelerada por WebGPU (WGSL) mediante shaders escritos a mano.
- Retroceso automatico a ONNX Runtime cuando no hay WebGPU o se pierde el contexto grafico.
- Integracion a traves de una API de paquete: `loadPackage`, `newGame` y `chooseMove`.
- Soporte de partidas con historial completo (la busqueda depende del historial y de los movimientos legales disponibles).
- No ofrece generacion de texto, razonamiento en lenguaje natural, codigo, matematicas, vision, audio ni tool calling (no es un modelo de proposito general).
- Capacidades multilingues: no disponibles (dominio de ajedrez).

## Casos de uso

- Motor de ajedrez embebido en una web: integrar el paquete con un runner compatible para ofrecer un rival de ajedrez que se ejecuta en el navegador del usuario sin backend, aprovechando WebGPU para reducir el tiempo de evaluacion.
- Analisis de posiciones en el cliente: usar `chooseMove` con el historial de la partida para sugerir jugadas en un tablero interactivo o un analizador de partidas dentro del navegador.
- Aplicacion educativa de ajedrez: proporcionar un oponente automatico en plataformas de ensenanza, con la ventaja de que la red es pequena y el coste de despliegue es minimo.
- Benchmarking de aceleracion grafica: comparar el rendimiento del mismo motor sobre WebGPU frente a ONNX Runtime en igualdad de tiempo, reutilizando el resultado de referencia del autor (0,825 en 20 parejas).
- Desarrollo de motores de ajedrez en el navegador: servir como caso de estudio de como portar la evaluacion de una red ONNX a shaders WGSL manteniendo pesos y busqueda.
- Juego offline o de baja latencia: al no requerir servidor, permite partidas en entornos con conectividad limitada, siempre que el navegador soporte WebGPU o se use el retroceso a ONNX Runtime.
- Integracion en frameworks de ajedrez que sigan el contrato chess-gpt-package-v1, apuntando el runner al repositorio `burrowdweller/rook-chess-v1-wgsl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos tipo MMLU, HumanEval o GSM8K, que ademas no aplican a un motor de ajedrez).

El unico dato de rendimiento proporcionado por el autor es el resultado de un enfrentamiento a tiempo igualado contra rook-chess-v1:

| Enfrentamiento | Formato | Resultado | Victorias | Tablas | Derrotas |
|---|---|---|---|---|---|
| rook-chess-v1-wgsl vs rook-chess-v1 | 20 parejas, tiempo igualado | 0,825 puntos | 27 | 12 | 1 |

No se dispone de puntuacion Elo ni de enfrentamientos contra otros motores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio declarado es de 0,0 GB y la red se describe como pequena, pero no se concretan cifras.
- GPU recomendadas: no disponibles; al ejecutarse en navegador mediante WebGPU, depende de la GPU del equipo cliente y de que el navegador exponga WebGPU.
- Compatibilidad con GPU de consumo: el motor esta pensado para ejecutarse en el navegador del usuario, por lo que en principio cabe en equipos de consumo con WebGPU disponible; no se especifican modelos concretos.
- Opciones de despliegue: navegador con soporte de WebGPU (ejecucion principal con shaders WGSL) y ONNX Runtime como retroceso. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de paquete.
- Latencia y throughput estimados: no disponibles; el unico dato indirecto es que la version WebGPU explora mas movimientos en el mismo tiempo frente a la version con ONNX Runtime.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rook-chess-v1-wgsl | Motor de ajedrez neuronal para navegador con evaluacion WebGPU | no disponible | 64 casillas + historial de partida | 0,825 vs rook-chess-v1 (20 parejas, tiempo igualado) | no disponible | HuggingFace, paquete chess-gpt-package-v1 |
| rook-chess-v1 | Motor de ajedrez neuronal relacional para navegador con ONNX Runtime | no disponible | 64 casillas + historial de partida | Referencia frente a la que se mide la variante WGSL | no disponible | HuggingFace |
| mini-chessformer-v1 | Modelo de ajedrez del mismo autor | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| minichess-gpt-v1 | Modelo de ajedrez del mismo autor (ONNX) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos suficientes para comparar con motores de ajedrez de referencia externos (por ejemplo, Stockfish o Leela Chess Zero) ni con otros paquetes de navegador de terceros.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no sirve para generacion de texto, codigo, matematicas ni tareas generales. Solo juega al ajedrez.
- Requiere un navegador con soporte de WebGPU para aprovechar su ventaja principal; sin WebGPU funciona, pero solo mediante el retroceso a ONNX Runtime.
- Riesgo de perdida del dispositivo grafico durante la partida; el autor indica que en ese caso se cambia una unica vez a ONNX Runtime.
- La red es pequena por diseno, por lo que su fuerza depende en gran medida del tiempo de busqueda disponible; con poco tiempo de computo, su nivel cae.
- No se especifica licencia, lo que impide conocer las condiciones de uso comercial; debe aclararse antes de cualquier despliegue en produccion.
- No se declaran idiomas naturales soportados (no aplica a su dominio).
- No hay informacion publica sobre sesgos, alucinacion (concepto no aplicable a un motor de ajedrez) ni sobre datos de entrenamiento.
- El repositorio figura con 0 descargas y 0 likes, sin senales de adopcion ni validacion externa.
- Las fechas de creacion y actualizacion registradas (2026-09-24) son las que constan en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/burrowdweller/rook-chess-v1-wgsl
- Modelo original rook-chess-v1: https://huggingface.co/burrowdweller/rook-chess-v1
- Perfil del autor (burrowdweller / Jun Ling): https://huggingface.co/burrowdweller
- mini-chessformer-v1: https://huggingface.co/burrowdweller/mini-chessformer-v1
- minichess-gpt-v1: https://huggingface.co/burrowdweller/minichess-gpt-v1
- Codigo fuente citado por el autor: https://github.com/junisbuilding/chessdb
- Catalogo de modelos del autor (terceros): https://essamamdani.com/ai-models/company/burrowdweller
