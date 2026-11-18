# shazmate/t2-16-flavour

## Resumen

T2-16-flavour es un motor de ajedrez que se ejecuta íntegramente en el navegador, desarrollado por el autor independiente shazmate. El sistema combina dos redes transformer de pequeno tamano con una busqueda en arbol Monte Carlo (PUCT): una red de aperturas que predice el siguiente movimiento a partir de la lista de jugadas y una red policy/value que lee el tablero, propone movimientos y estima el resultado. Los pesos se distribuyen en formato ONNX y se ejecutan mediante ONNX Runtime Web, aprovechando WebGPU cuando el navegador lo soporta y cayendo a WebAssembly en caso contrario.

El modelo surge de un torneo privado entre cuatro amigos, con reglas estrictas: un pool compartido de partidas de Lichess para entrenar, un limite de 10^18 FLOPs de computo de entrenamiento acumulado y la obligacion de responder en menos de 10 segundos por jugada en navegador. Es relevante ahora porque demuestra que un motor de ajedrez competitivo puede desplegarse sin servidor, con modelos de menos de 7 millones de parametros y inferencia acelerada por GPU via WebGPU, un caso de uso poco frecuente de transformers en el borde del cliente.

La arquitectura es un transformer encoder de 8 capas (ancho 256, 8 cabezas) para la red policy/value, con 6,5 millones de parametros, y un transformer de 2 capas (ancho 128, 4 cabezas) para aperturas, con 0,9 millones. El contexto no es textual: la red principal trabaja sobre 67 tokens que codifican casillas, derechos de enroque y columna de peon al paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (red policy/value) + transformer de 2 capas (red de aperturas) + busqueda PUCT |
| Parametros totales | 7,4 M (6,5 M policy/value + 0,9 M aperturas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 67 tokens para la red policy/value; 20 tokens (1 de inicio + 19 movimientos) para la red de aperturas |
| Tipos de cuantizacion | fp32 (aperturas), fp16 (policy/value); no se documentan otras |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; dominio ajedrez) |
| Licencia | "choose" (sin especificar en la model card; el autor indica que debe elegirse antes de publicar) |
| Formato de pesos | ONNX (opening.onnx, position_fp16.onnx) + entry.js + manifest.json |

## Arquitectura y entrenamiento

La red policy/value (`position_fp16.onnx`) es un encoder transformer de 8 capas con ancho 256, 8 cabezas de atencion y feed-forward de 1024, que procesa 67 tokens: un token resumen, uno por casilla, uno para derechos de enroque y uno para la columna de peon al paso. El tablero se presenta siempre desde la perspectiva del bando que mueve, dibujado como blancas. La cabeza de politica puntua cada movimiento directamente a partir de pares de casillas (una query desde la casilla de origen contra una key de la casilla de destino), mas offsets de promocion, produciendo logits sobre un vocabulario fijo de 1.968 movimientos en notacion UCI. La cabeza de valor emite logits de victoria, tablas y derrota para el bando que mueve.

La red de aperturas (`opening.onnx`) es un transformer de 2 capas con ancho 128 y 4 cabezas que procesa la secuencia de movimientos en UCI, con hasta 19 movimientos de historial tras un token de inicio. A diferencia de la red principal, ve movimientos UCI reales (no espejados). El entrenamiento usa la base de datos abierta de Lichess: enero a marzo de 2026 para entrenamiento (269 millones de partidas) y abril de 2026 como conjunto de evaluacion. Se filtro a partidas con ambos jugadores de media 2250 o superior, diferencia de rating inferior a 200 puntos y sin bullet, quedando 4,0 millones de partidas (1,5 % del total). Los objetivos de movimiento proceden unicamente de las jugadas del jugador que acabo ganando; los objetivos de valor proceden de todas las partidas (la model card se interrumpe en este punto). No se documentan RLHF, DPO ni tecnicas de decodificacion especulativa; la innovacion principal es la integracion de busqueda PUCT con evaluacion por lotes de 16 hojas, cache de resultados y reutilizacion del arbol entre jugadas.

## Capacidades

- Prediccion de movimientos de ajedrez sobre un vocabulario fijo de 1.968 movimientos UCI, con mascara de legalidad y softmax.
- Evaluacion de posicion mediante cabeza de valor con tres clases (victoria, tablas, derrota) desde la perspectiva del bando que mueve.
- Seleccion de aperturas con umbral de confianza: la red de aperturas solo juega si las tres mejores opciones legales concentran al menos el 60 % de probabilidad y la mejor al menos el 15 %.
- Verificacion de la jugada de apertura mediante una busqueda de calentamiento de hasta 320 simulaciones, sustituyendola si la busqueda la valora mas de 0,05 por debajo de su mejor movimiento.
- Busqueda en arbol PUCT con c_puct 1,0, evaluacion de hojas por lotes de 16, cache de resultados por partida y reutilizacion del arbol entre movimientos.
- Gestion de tiempo: consume el 94 % del limite por jugada y predice si un lote terminara a tiempo antes de lanzarlo.
- Ajuste anti-repeticion: cuando se juzga ganador, puntua las tablas ligeramente por debajo de lo justo para evitar repeticiones.
- Analisis de posicion por casillas mediante ablacion/perturbacion casilla a casilla con la red policy/value, disponible en la pagina de demostracion.
- Ejecucion en navegador con ONNX Runtime Web, en WebGPU (fp16/fp32) o WebAssembly (1 u 8 hilos).
- Generacion de movimientos legales, manejo de SAN y reconstruccion del vocabulario mediante `buildVocabulary()` en `entry.js`.
- Capacidades multilingues, vision, audio y tool calling: no disponibles.

## Casos de uso

- Motor de ajedrez incrustado en web: desplegar el paquete `chess-gpt-package-v1` en una pagina estatica y jugar contra la maquina sin backend, aprovechando WebGPU para ~500 posiciones/s en portatiles con grafica integrada y cayendo a WebAssembly (~19-96 posiciones/s) donde no haya GPU.
- Analisis de partidas post-mortem: la misma pagina ejecuta un analisis de ablacion/perturbacion casilla a casilla de cualquier posicion con la red policy/value, util para explicar errores posicionales a jugadores de club.
- Entrenamiento de jugadores con aperturas guiadas: la red de aperturas con umbrales de confianza del 60 %/15 % permite explorar repertorios dentro de las primeras diez jugadas sin depender de libros de aperturas externos.
- Herramienta educativa sin servidor: al ejecutarse en el navegador, encaja en entornos con restricciones de privacidad o sin infraestructura de GPU, como aulas o portatiles escolares, con latencia determinada por el dispositivo del usuario.
- Prototipado de motores de ajedrez: `entry.js` (42 KB) incluye generacion de movimientos, manejo de SAN, vocabulario y busqueda, y `test_core.mjs` permite verificar perft, tamano de vocabulario y replay SAN en integracion continua.
- Benchmark de inferencia en el cliente: comparar WebAssembly (1 y 8 hilos) frente a WebGPU (fp32 y fp16) con lotes de 16 para medir el impacto de la aceleracion por GPU en cargas de transformer pequenas.
- Evaluacion de posiciones en lote para estudios: la interfaz `pieces`/`flags` de tipo int64 admite batch, lo que permite puntuar muchas posiciones de una base de datos con la cabeza de valor en una sola llamada.
- Demostracion de transformers fuera del NLP: usar un encoder de 67 tokens como caso didactico de como adaptar mecanismos de atencion a un dominio estructurado como el ajedrez.

## Benchmarks y rendimiento

Rendimiento de inferencia publicado por el autor (Chrome, Ryzen 7 8845HS / Radeon 780M, lotes de 16):

| Backend | Posiciones por segundo |
|---|---|
| WebAssembly, 1 hilo, fp32 | 19 |
| WebAssembly, 8 hilos, fp32 | 96 |
| WebGPU, fp32 | 396 |
| WebGPU, fp16 | 501 |

No se han publicado resultados de benchmarks de fuerza de juego (Elo, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que la fuerza depende en gran medida del hardware y del tiempo de pensamiento, porque un dispositivo mas rapido busca mas posiciones por jugada.

## Requisitos de hardware

- VRAM estimada: no disponible; los pesos suman aproximadamente 17 MB (3,7 MB de aperturas en fp32 y 13,3 MB de policy/value en fp16), por lo que el modelo cabe holgadamente en cualquier GPU integrada o dedicada moderna.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en el navegador; el autor cita una Radeon 780M integrada como referencia. No se documentan resultados en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, incluida grafica integrada; en ausencia de WebGPU funciona en CPU via WebAssembly.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU o WebAssembly; el paquete se carga desde `manifest.json` con verificacion SHA-256 de artefactos. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este dominio.
- Latencia y throughput: 19 posiciones/s (Wasm, 1 hilo), 96 (Wasm, 8 hilos), 396 (WebGPU fp32) y 501 (WebGPU fp16) en el hardware de referencia. La busqueda consume el 94 % del limite por jugada, con objetivo de menos de 10 segundos por movimiento.

## Comparativa con modelos similares

No se dispone de datos sobre modelos comparables en la informacion proporcionada. Los motores de ajedrez convencionales (Stockfish, Leela Chess Zero) no son transformers en ONNX ejecutados en navegador y no se han publicado comparaciones de fuerza o rendimiento frente a ellos en esta ficha.

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| T2-16-flavour | 7,4 M | 67 tokens (policy/value); 20 (aperturas) | ONNX | "choose" (sin especificar) | Si (WebGPU/WebAssembly) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia sin definir: el campo de licencia contiene literalmente "choose", con una nota del autor indicando que debe elegirse antes de publicar (por ejemplo MIT o Apache-2.0). No hay autorizacion explicita para uso comercial hasta que se concrete.
- Fuerza dependiente del hardware: el rendimiento varia de ~19 a ~501 posiciones/s segun backend y dispositivo, de modo que la calidad de juego no es reproducible entre equipos.
- Presupuesto de computo limitado: el torneo imponia un maximo de 10^18 FLOPs de entrenamiento acumulado, lo que acota la escala del modelo (7,4 M de parametros) frente a motores basados en redes mayores.
- Dominio restringido: el vocabulario de 1.968 movimientos y las entradas `pieces`/`flags` solo cubren ajedrez estandar; no hay soporte para variantes, analisis de lenguaje natural ni otras tareas.
- Datos de entrenamiento filtrados: solo partidas de Lichess con media de 2250 o superior, diferencia de rating inferior a 200 y sin bullet (1,5 % del total), lo que puede limitar la cobertura de estilos de juego de niveles inferiores.
- Objetivos de movimiento sesgados hacia el ganador: las etiquetas de politica proceden unicamente de las jugadas del jugador que gano, lo que puede infrarepresentar lineas defensivas validas en posiciones perdedoras.
- Riesgo de alucinacion no aplicable en sentido estricto, pero la cabeza de valor puede sobreestimar o subestimar posiciones fuera de la distribucion de entrenamiento; la mascara de legalidad es obligatoria antes del softmax para evitar movimientos ilegales.
- Caveat de produccion: depende de la disponibilidad de WebGPU en el navegador del usuario; sin ella, la fuerza cae drasticamente al backend WebAssembly (hasta 26 veces menos posiciones/s en el hardware de referencia).
- Documentacion incompleta: la model card se interrumpe en la descripcion de los objetivos de valor, y no se detallan hiperparametros de entrenamiento, composicion exacta del dataset ni resultados de fuerza.
- Idioma y sesgos sociales: no disponibles, al no ser un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shazmate/t2-16-flavour
- Demo jugable: https://shazmat.com/projects/play-chess/
- Base de datos de partidas de Lichess: https://database.lichess.org/
