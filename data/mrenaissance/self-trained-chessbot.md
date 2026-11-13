# Mrenaissance/self-trained-chessbot

## Resumen

self-trained-chessbot es un experimento de modelado de lenguaje a nivel de caracter entrenado desde cero por Mrenaissance (maelritouet) para predecir secuencias de movimientos de ajedrez en notacion algebraica (SAN). No se le proporciona ninguna regla del juego: aprende exclusivamente a predecir el siguiente caracter de una lista de movimientos (`1-0 1.e4 e5 2.Nf3 Nc6 …`), y la legalidad de sus jugadas emerge como consecuencia del entrenamiento. El proyecto publica dos variantes de GPT-2-style decoder (10,7 M y 25,2 M de parametros) junto con sus versiones afinadas sobre partidas largas.

El interes del modelo es fundamentalmente educativo y de investigacion: demuestra que un transformer diminuto, entrenado en una sola GPU T4 de Kaggle, puede alcanzar tasas de legalidad del 97,8 % en la generacion de movimientos sin conocimiento explicito de las reglas. La comparacion controlada entre las variantes base y large (mismo presupuesto de computo) lo convierte en un caso de estudio util sobre escalado y sobre el efecto del fine-tuning en tareas de dominio cerrado.

Los pesos se distribuyen en formato ONNX (fp32) y estan pensados para ejecutarse en el navegador mediante la demo oficial. La licencia CC BY 4.0 permite uso comercial con atribucion, y los datos de entrenamiento (base de datos de Lichess) son CC0. No es un motor de ajedrez competitivo ni un modelo de proposito general: es un modelo de lenguaje de dominio especifico con capacidades muy acotadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2-style decoder transformer (causal, a nivel de caracter) |
| Parametros totales | 10,7 M (base, ft-base) / 25,2 M (large, ft-large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 caracteres |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32) |
| Idiomas soportados | no disponible (vocabulario de 33 simbolos de notacion SAN, no lenguaje natural) |
| Licencia | CC BY 4.0 (pesos); datos de entrenamiento CC0 |
| Formato de pesos | ONNX (fp32) |

Detalle de las variantes:

| Carpeta | Capas | Cabezas | Dimension | Parametros | Tamano |
|---|---|---|---|---|---|
| `base/` | 6 | 6 | 384 | 10,7 M | 51 MB |
| `large/` | 8 | 8 | 512 | 25,2 M | 112 MB |
| `ft-base/` | 6 | 6 | 384 | 10,7 M | 51 MB |
| `ft-large/` | 8 | 8 | 512 | 25,2 M | 112 MB |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer estilo GPT-2 con atencion causal, tokenizacion a nivel de caracter (33 simbolos) y una ventana de contexto de 1.024 caracteres. El grafo ONNX recibe `idx` como int64 de forma `(batch, seq)` y devuelve `logits` float32 de forma `(batch, seq, 33)`. El prompt sigue el formato: salto de linea, resultado esperado, espacio y la lista de movimientos hasta el punto donde empieza la siguiente jugada (por ejemplo, `"\n1-0 1.e4 e5 2."` solicita un movimiento de blancas orientado a ganar).

El entrenamiento se realizo desde cero sobre 3 millones de partidas de blitz, rapid y classical de la base de datos de Lichess (octubre de 2026, CC0) con ambos jugadores con rating 1800+, reescritas a una linea por partida con el resultado al principio: 1,26 mil millones de caracteres en total. Los fine-tunes emplearon 594.000 partidas de mas de 100 plies de otro mes. Todo el computo se ejecuto en una unica Kaggle T4 con precision mixta fp16: la variante base proceso 3,93 mil millones de tokens en 8,6 horas y la large 1,97 mil millones en 9,1 horas (mismo presupuesto de computo, experimento controlado del proyecto); los fine-tunes anadieron 413 millones de tokens cada uno. No se menciona uso de RLHF ni DPO.

La innovacion tecnica destacable no esta en la arquitectura sino en el planteamiento: el modelo nunca recibe las reglas del ajedrez y la legalidad de sus movimientos emerge del modelado de secuencias. La generacion se completa con un procedimiento externo de validacion (hasta 6 reintentos por jugada en la evaluacion contra Stockfish) implementado en `chessgpt/player.py` y `web/js/player.js`.

## Capacidades

- Prediccion del siguiente caracter en secuencias de movimientos de ajedrez en notacion SAN.
- Generacion de movimientos legales con una tasa del 97,8 % en primera pasada greedy (variante ft-large) sobre posiciones no vistas.
- Condicionamiento por resultado esperado: el prompt incluye el resultado objetivo (`1-0`, `0-1`, `1/2-1/2`) y el modelo genera jugadas orientadas a ese desenlace.
- Coincidencia con el movimiento humano en el 44,4 % de las posiciones (ft-large).
- Resolucion de puzzles de Lichess en el 11,3 % de los casos (large, regla de Lichess con un intento greedy por movimiento).
- Ejecucion en navegador mediante ONNX Runtime Web (demo oficial).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Demo educativa interactiva en navegador: el modelo puede jugar partidas completas en el cliente gracias a los pesos ONNX de 51-112 MB y a la validacion de legalidad en JavaScript, sin necesidad de backend.
- Investigacion sobre aprendizaje de reglas implicitas: permite estudiar como un transformer diminuto aprende la legalidad del ajedrez solo a partir de secuencias, con un codigo y un registro de decisiones publicados.
- Estudio de escalado controlado: las variantes base y large con el mismo presupuesto de computo sirven para analizar la relacion entre parametros, tokens vistos y calidad de generacion en un dominio cerrado.
- Generacion de datos sinteticos de ajedrez: puede producir listas de movimientos plausibles (con validacion externa) para tareas de aumento de datos o pruebas de pipelines de parsing de SAN.
- Benchmark de infraestructura de inferencia ONNX: su tamano reducido lo hace util para validar despliegues de ONNX Runtime en entornos con recursos muy limitados o en el navegador.
- Docencia de tokenizacion a nivel de caracter: caso practico para explicar vocabularios minimos, contextos de 1.024 caracteres y el efecto del fine-tuning en modelos de dominio especifico.

## Benchmarks y rendimiento

Todos los resultados se midieron sobre datos no vistos durante el entrenamiento.

| Metrica | base | large | ft-base | ft-large |
|---|---|---|---|---|
| Parametros | 10,7 M | 25,2 M | 10,7 M | 25,2 M |
| Perdida de validacion (nats/char) | 0,386 | 0,366 | 0,393 | 0,374 |
| Tasa de movimientos legales | 95,6 % | 97,7 % | 96,1 % | **97,8 %** |
| Coincidencia con el movimiento humano | 40,7 % | 44,2 % | 41,6 % | **44,4 %** |
| Puzzles resueltos (de 1.000) | 8,0 % | **11,3 %** | 6,8 % | 8,3 % |
| Puntuacion vs Stockfish Skill 0 / 1 / 2 | 0,06 / 0,00 / 0,03 | **0,17** / 0,02 / 0,00 | 0,09 / 0,02 / 0,01 | 0,08 / **0,06 / 0,02** |
| Forfeits vs Stockfish (de 150 partidas) | 49 | 39 | 52 | **28** |

Notas metodologicas de la model card: la tasa de legalidad se mide en primera pasada greedy sobre 8.197 posiciones de 100 partidas reservadas; la comparacion contra Stockfish 19 usa niveles UCI Skill 0, 1 y 2, 50.000 nodos por movimiento y 50 partidas por nivel, con 6 intentos por jugada y forfeit tras 6 salidas ilegales; los puzzles son 1.000 de Lichess (200 por tramo de rating) con la regla de Lichess (un intento greedy por movimiento, cualquier jaque mate cuenta).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para ambas variantes (51 MB y 112 MB de pesos); en la practica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; el entrenamiento se realizo en una unica NVIDIA T4 (16 GB) de Kaggle con fp16.
- Cabe en GPU consumer: si, en todas las gamas actuales, y en el navegador via WebGPU/WASM con ONNX Runtime Web.
- Opciones de despliegue: ONNX Runtime (Python, C++, Web), demo web oficial; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (los pesos no se distribuyen en GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera inferencia en milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| self-trained-chessbot (este) | 10,7 M / 25,2 M | 1.024 caracteres | LM de caracteres sobre SAN, sin reglas | CC BY 4.0 | ONNX en Hugging Face |
| Maia Chess (referencia de la comunidad) | no disponible en la informacion | no disponible | Redes especificas de ajedrez entrenadas sobre partidas humanas por nivel | no disponible | no disponible |
| Leela Chess Zero (referencia de la comunidad) | no disponible en la informacion | no disponible | Motor neuronal con busqueda MCTS | no disponible | no disponible |

No se dispone de datos comparativos verificados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas; las filas de Maia y Leela se incluyen solo como categorias de referencia y sus datos no estan confirmados en esta ficha.

## Limitaciones y advertencias

- Sin busqueda ni reglas explicitas: juega por patron, y su tasa de legalidad cae al 85-95 % despues del movimiento 80 en partidas largas.
- Fuerza muy baja: como maximo 0,17 puntos por partida contra el nivel mas bajo de Stockfish (Skill 0).
- Entrenado con partidas de jugadores 1800+ de un solo sitio (Lichess) y un solo mes; no tiene nocion de control de tiempo ni de identidad de los jugadores.
- Sesgo de dominio: solo modela notacion SAN de ajedrez; no es util para lenguaje natural ni para otras tareas.
- Riesgo de alucinacion estructural: puede generar texto que no corresponde a un movimiento legal, por lo que en produccion es obligatorio validar contra un generador de movimientos legal y reintentar.
- Restricciones de licencia: CC BY 4.0 exige atribucion; los datos de entrenamiento son CC0, sin restriccion adicional conocida.
- Caveat de produccion: el proyecto no publica cifras de latencia ni de throughput, y la evaluacion usa un procedimiento externo de reintentos que forma parte del pipeline, no del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mrenaissance/self-trained-chessbot
- Demo en navegador: https://maelritouet.github.io/self-trained-chessbot/
- Codigo, entrenamiento, evaluacion y registro de decisiones: https://github.com/maelritouet/self-trained-chessbot
- Sumas SHA-256 de los pesos: https://github.com/maelritouet/self-trained-chessbot/blob/main/web/models.release.json
- Base de datos de Lichess: https://database.lichess.org
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
