# aminwoo/bughouse-twin-s-clock

## Resumen

`aminwoo/bughouse-twin-s-clock` es una red neuronal de evaluación y política para Bughouse (ajedrez con dos tableros y traspaso de piezas), desarrollada por el autor del motor UCI Hivemind. No es un modelo de lenguaje: es una red de tipo AlphaZero que se integra en el motor para guiar una búsqueda MCTS. Su particularidad es que aprende a jugar contra un reloj simulado, en lugar de contra el bit binario de ventaja temporal que usaban las redes TwinBoard-S anteriores.

La entrada son 39 planos por tablero (78 en total): los 37 planos de la representación v3 más dos planos nuevos de reloj, idénticos en ambos tableros y calculados desde el punto de vista del equipo que tiene el turno. Un plano codifica la ventaja temporal normalizada y el otro la relación de velocidades entre equipos. La arquitectura es la misma `TwinBoardNet` de la familia `twin-s`, sin atención.

El modelo es relevante para quien investigue juegos con múltiples tableros y gestión de tiempo, o quiera ejecutar un motor de Bughouse con gestión real de reloj. El repositorio publica 13 iteraciones de aprendizaje por refuerzo con sus partidas de promoción, y el autor estima que la iteración 10 queda unos 290 Elo por encima de la iteración 0 sumando las victorias de las iteraciones promovidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `TwinBoardNet` variante `twin-s`, sin atención (red convolutional tipo AlphaZero con dos cabezas de política y valor); entrada de 39 planos por tablero, 78 en total |
| Parametros totales | no disponible (el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de evaluación de posiciones, no de secuencias de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en ONNX y checkpoint PyTorch, sin variantes cuantizadas publicadas |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`, red promovida e iteraciones) y PyTorch (`.pt`, checkpoints de entrenamiento) |
| Version promovida | `twin-s-clock.onnx` (iteración 13) |
| Punto de partida | `twin-s-clock-it0.onnx`, heredado de `twin-s-noattn` iteración 10 |
| Tarea / pipeline | reinforcement-learning (evaluación + política para búsqueda MCTS) |
| Tamaño del repositorio | 0,1 GB (todas las iteraciones en `.onnx` y `.pt`) |
| Descargas / likes | 0 descargas, 1 like |
| Fechas | creado el 2026-10-13, actualizado el 2026-10-26 |

## Arquitectura y entrenamiento

La red reutiliza `TwinBoardNet` en su variante `twin-s` sin atención, la misma de la familia TwinBoard-S, pero amplía la entrada de 37 a 39 planos por tablero. Los dos planos nuevos son: **Lead**, definido como `sign(lead) · min(1, log2(1 + n) / 10)` donde `n = |lead| / tiempo de jugada del equipo que va por delante` (una medida de cuántas acciones puede permitirse esperar el líder), y **Speed**, definido como `log2(tiempo propio / tiempo del rival) / 5` recortado a ±1. La iteración 0 solo lee los 37 planos de la versión 3 y el motor descarta los planos de reloj para ella. El entrenamiento ensancha la primera capa con pesos a cero para los dos planos nuevos, de forma que la iteración 1 calcula exactamente lo mismo que la iteración 0 antes de aprender.

El entrenamiento es un bucle de aprendizaje por refuerzo con autojuego y búsqueda MCTS (a unos 800 nodos por jugada en el autojuego, sobre un reloj simulado), con promoción de iteraciones mediante enfrentamientos directos. Cada iteración parte del checkpoint anterior y hace 1,5 pasadas sobre las posiciones nuevas y 0,5 sobre una ventana de repetición de las anteriores (las 3 iteraciones previas hasta la 7; 6 desde la 8). Hasta la iteración 11 se exigía al menos un 50 % de puntuación contra la red que había generado su autojuego; desde la 12 se promueve salvo que el extremo superior del intervalo de confianza del 95 % de Elo quede por debajo de 0. El estado local de entrenamiento se perdió después de la iteración 10, por lo que la 11 arrancó del checkpoint publicado de la 10 sin repetición y la ventana se está rellenando de nuevo. En autojuego, un equipo solo puede esperar mientras va por delante en el reloj, y cada acción suya en cualquiera de los dos tableros le cuesta tiempo de su propio reloj.

## Capacidades

- Evaluación estática de posiciones de Bughouse en los dos tableros simultáneamente, con salida de valor y de política para la búsqueda.
- Política de jugadas para MCTS: el motor la usa como guía de expansión del árbol, no como generador de jugadas directo.
- Lectura de estado temporal: estima la ventaja de reloj en unidades normalizadas (planos Lead y Speed) en lugar del bit binario de ventaja permanente.
- Gestión de la decisión de esperar: modela cuándo compensa sentarse (no mover) en función del tiempo disponible y del ritmo del rival.
- Razonamiento sobre traspaso de piezas entre tableros, propio de la variante Bughouse.
- No soporta tool calling, function calling ni generación de texto: no es un modelo de lenguaje ni un agente conversacional.
- No tiene capacidades multimodales (visión, audio) ni modo "thinking" textual.

## Casos de uso

- **Motor de análisis de Bughouse con reloj real**: configurando `TimeModel clock` junto con `TimeLeadMs`, `TeamMoveTimeMs` y `OpponentMoveTimeMs`, el motor evalúa posiciones teniendo en cuenta la ventaja temporal, algo que las redes anteriores aproximaban con un único bit.
- **Entrenamiento y sparring humano**: el motor UCI puede usarse como oponente de práctica o como analizador de partidas propias en plataformas de Bughouse, ajustando los parámetros de reloj al control de tiempo real de la partida.
- **Investigación en gestión de tiempo bajo incertidumbre**: los dos planos de reloj y el entorno de reloj simulado permiten estudiar políticas de espera y de reparto de tiempo en juegos con múltiples tableros.
- **Línea base para nuevos experimentos de RL**: las 13 iteraciones publicadas, cada una con su `.onnx` y su `.pt`, sirven como punto de partida reproducible para probar cambios en la representación, la ventana de repetición o el criterio de promoción.
- **Desarrollo y validación del motor Hivemind**: sirve para comprobar la integración de la opción `TimeModel clock`, medir regresiones entre versiones y validar el comportamiento del motor con entradas de reloj.
- **Generación de datos de autojuego**: el propio autor la usa para producir entre 60.000 y 200.500 partidas de autojuego por iteración, con 4,25 a 14,31 millones de posiciones nuevas por iteración, reutilizables para entrenar otras redes.
- **Comparación de criterios de promoción**: el historial (iteración 9 empatada y no promovida, iteración 11 no promovida, cambio de criterio en la 12) permite estudiar cómo distintos umbrales de promoción afectan al progreso de Elo.

## Benchmarks y rendimiento

Resultados reportados por el autor en partidas de promoción. Hasta la iteración 10 la comparación "vs iteración 0" es contra la red sin reloj; desde la 11 es contra la iteración 10, que sí lee el reloj. Los controles de tiempo de cada enfrentamiento se indican donde el autor los da.

| Iteracion | Partidas de autojuego | Posiciones (nuevas + repeticion) | Pasos | vs red anterior | vs iteracion 0 / 10 |
|---|---|---|---|---|---|
| 1 | 60.000 (jugadas por la iteracion 0) | 4,25 M | 6.226 | — | 140-58-2 (70,5 %, +151, IC +109 a +199), 200 partidas a 200 ms |
| 2 | 100.000 | 7,04 M + 4,25 M | 12.389 | 55-45-0 (+35, IC -10 a +81), 100 partidas a 1 s | 721-269-10 (+169, IC +149 a +190) |
| 3 | 106.750 | 6,84 M + 11,29 M | 15.536 | 535-462-3 (+25, IC +13 a +38) | 703-282-15 (+156, IC +137 a +176) |
| 4 | 109.700 | 7,89 M + 20,49 M | 21.563 | 512-485-3 (+9, IC -3 a +21) | 755-235-10 (+200, IC +180 a +222) |
| 5 | 105.150 | 8,66 M + 27,51 M | 26.123 | 521-473-6 (+17, IC +6 a +27) | 706-287-7 (+155, IC +137 a +174) |
| 6 | 102.000 | 7,30 M + 30,80 M | 25.740 | 518-477-5 (+14, IC +2 a +27) | 742-250-8 (+187, IC +167 a +208) |
| 7 | 200.500 | 14,31 M + 34,24 M | 37.683 | 527-470-3 (+20, IC +9 a +30) | 745-248-7 (+189, IC +170 a +210) |
| 8 | 100.500 | 7,19 M + 64,79 M | 42.166 | 191-183-1 (+7, IC -28 a +43), detenida tras 375 partidas | — |
| 9 | 100.500 | 7,16 M + 64,94 M | 42.205 | 493-498-9 (-2, IC -12 a +9), no promovida | — |
| 10 | 100.500 | 7,09 M + 62,90 M | 41.106 | 520-479-1 (+14, IC +4 a +24) | — |
| 11 | 100.300 | 7,13 M + 0 | 10.440 | 482-506-12 (-8, IC -20 a +3), no promovida | 470-523-7 (-18, IC -30 a -7) |
| 12 | 101.500 | 7,36 M + 8,50 M | 14.932 | 488-496-16 (-3, IC -14 a +8) | 503-491-6 (+4, IC -7 a +15) |
| 13 | 103.000 | 7,43 M + 19,57 M | 20.443 | 503-488-9 (+5, IC -6 a +16) | 230-231-0 (-1, IC -33 a +31), provisional: 461 de 1.000 partidas |

Resumen del autor: sumando las victorias de las iteraciones promovidas, la iteración 10 queda unos 290 Elo por encima de la iteración 0; en enfrentamiento directo contra la iteración 0, las iteraciones 2 a 7 se sitúan entre +155 y +200 Elo. El autor señala que la línea directa contra la iteración 0 es la medida conservadora, porque esa red busca con el bit binario de ventaja temporal y no con el reloj. No se publican resultados en benchmarks estándar de ajedrez (ninguno de MMLU, HumanEval, GSM8K es aplicable).

## Requisitos de hardware

- El número de parámetros no está publicado. El repositorio completo, con todas las iteraciones en `.onnx` y `.pt`, ocupa 0,1 GB, lo que sugiere redes de pocos megabytes por iteración (estimación a partir del tamaño del repo, no confirmada por el autor).
- Al ser una red de inferencia para MCTS a unos 800 nodos por jugada, la carga es moderada y probablemente ejecutable en CPU; no se publican cifras de latencia ni de throughput.
- No se publican GPU recomendadas ni requisitos de VRAM. Por el tamaño del repositorio, cualquier GPU consumer reciente sería sobrada si se opta por acelerar la inferencia.
- Despliegue: ONNX Runtime para el archivo `.onnx`, o directamente a través del motor UCI Hivemind, que es el consumidor previsto. No aplica vLLM, llama.cpp, Ollama ni TGI.
- El checkpoint `.pt` requiere PyTorch solo para continuar el entrenamiento o reexportar, no para jugar.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Reloj | Licencia | Estado |
|---|---|---|---|---|---|
| `aminwoo/bughouse-twin-s-clock` (este) | no disponible | 39 planos por tablero (37 v3 + Lead + Speed) | Simulado, ventaja y velocidad | MIT | Iteracion 13 promovida (provisional en el enfrentamiento contra la 10) |
| `aminwoo/bughouse-twin-s` (`twin-s`) | no disponible (misma familia) | 39 planos por tablero, con bit binario de ventaja temporal | Binario: un equipo puede esperar toda la partida | MIT | Red previa; sirve de base a esta linea |
| `twin-s-noattn` (iteracion 10, referenciada) | no disponible | 37 planos (representacion v3) | Ninguno | MIT | Punto de partida de la iteracion 0 de esta linea |
| Motores de ajedrez neuronal genericos (p. ej. Leela Chess Zero) | no disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No comparable directamente: no implementan Bughouse ni el traspaso de piezas |

La comparación cuantitativa entre `twin-s` y esta línea no está publicada de forma directa: el autor advierte que las redes anteriores no deben usarse con `TimeModel clock` porque interpretan la ventaja como un derecho permanente a esperar y su evaluación salta unos 26 peones al cruzar el cero.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no responde preguntas, no soporta tool calling ni agentes. Cualquier uso fuera del motor de Bughouse carece de sentido.
- **Iteración 0 y redes TwinBoard-S anteriores incompatibles con el reloj**: usarlas con `TimeModel clock` provoca un salto de evaluación de unos 26 peones al cruzar el cero de la ventaja temporal. El autor lo advierte explícitamente.
- **Iteración 13 es provisional**: el enfrentamiento contra la iteración 10 solo llevaba 461 de 1.000 partidas (230-231-0, IC -33 a +31), por lo que la mejora no está confirmada.
- **Progreso estancado desde la iteración 8**: las iteraciones 9 y 11 no se promovieron y las diferencias contra la red anterior caen dentro del intervalo de confianza en varias de las últimas.
- **Pérdida de estado de entrenamiento**: el estado local se perdió tras la iteración 10 y la ventana de repetición se está reconstruyendo, lo que afecta a la reproducibilidad exacta de las iteraciones 11 en adelante.
- **Dependencia de la simulación de reloj**: los planos Lead y Speed son una idealización (tiempos de jugada fijos por equipo); el comportamiento con relojes reales, incrementos o apuros extremos no está validado en la información disponible.
- **Licencia MIT**: permite uso comercial y modificación con atribución; no se indican restricciones adicionales.
- **Sin datos de sesgo, alucinación o multilingüismo**: no aplican en el sentido habitual, pero tampoco hay evaluación de robustez fuera de las posiciones de autojuego.
- **Sin descargas ni validación externa**: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aminwoo/bughouse-twin-s-clock
- Repositorio del motor Hivemind (UCI para Bughouse): https://github.com/aminwoo/hivemind
- Red anterior de la familia TwinBoard-S: https://huggingface.co/aminwoo/bughouse-twin-s
- Grafico de progreso por iteracion: https://huggingface.co/aminwoo/bughouse-twin-s-clock/resolve/main/improvement.png
- Articulo sobre Bughouse chess en Wikipedia: https://en.wikipedia.org/wiki/Bughouse_chess
