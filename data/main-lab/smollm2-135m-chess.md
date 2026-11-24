# MAIN-Lab/smollm2-135m-chess

## Resumen

MAIN-Lab/smollm2-135m-chess es un ajuste fino (full fine-tune) del modelo SmolLM2-135M-Instruct de HuggingFaceTB, especializado en resolver problemas de ajedrez (puzzles) a partir de una representación textual del tablero. Lo desarrolla MAIN Lab y su proposito es responder con el mejor movimiento en notacion UCI (por ejemplo, `e2e4`) dada una posicion de ajedrez, sin realizar busqueda: una unica pasada forward por movimiento. El modelo resuelve un problema muy concreto de razonamiento simbolico en un modelo diminuto de 134.515.008 parametros.

La relevancia reside en el contraste de rendimiento: partiendo de un modelo base que apenas acierta movimientos legales en texto libre (0,0 %), el ajuste fino eleva esa cifra al 86,8 % y resuelve el 24,7 % de 2.500 puzzles de Lichess no vistos, frente al 0,6 % del modelo base. Supera en todas las pruebas a Gemma 3 270M y a SmolLM3-3B, un modelo mas de veinte veces mayor, con significacion estadistica (McNemar pareado, p < 0,01).

Se entrenó sobre posiciones verificadas por Stockfish extraidas de la base de datos de puzzles de Lichess (CC0), con licencia Apache-2.0. Su interes es doble: como demostracion de que la destilacion de conocimiento de motor en modelos muy pequenos funciona para tareas de ajedrez acotadas, y como caso de estudio de especializacion que sacrifica capacidad conversacional general en favor de una unica habilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (el modelo opera sobre notacion de ajedrez y UCI, no sobre lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-135M-Instruct y se somete a un full fine-tune (todos los pesos actualizados, no LoRA). El entrenamiento se realizo en CPU (4 nucleos, autocast bf16), con perdida calculada unicamente sobre los tokens del movimiento, optimizador AdamW con learning rate 3e-4 y scheduler coseno, batch de 32 y 4.800 pasos, lo que suma 153.600 posiciones (4.800 × 32). El "profesor" es Stockfish a traves de la base de datos de puzzles de Lichess: cada solucion esta verificada por motor. Los datos provienen de 693.547 movimientos solucion de 300.000 puzzles del shard 0 de `Lichess/chess-puzzles`.

La entrada es una representacion textual del tablero dibujada **desde el lado que mueve** (para negras, la fila 1 va arriba y las columnas en orden h→a), con mayusculas para blancas, minusculas para negras y `.` para casillas vacias, seguida de la indicacion de turno y derechos de enroque. La salida es un unico movimiento UCI seguido de salto de linea. El mejor resultado se obtiene puntuando por log-verosimilitud todos los movimientos legales y eligiendo el maximo, aunque la generacion greedy tambien produce movimientos legales en el 86,8 % de los casos. No hay innovaciones de inferencia como decodificacion especulativa ni atencion lineal; la clave es la especializacion por destilacion de motor.

## Capacidades

- Resolucion de puzzles de ajedrez: identifica el mejor movimiento dada una posicion textual, en notacion UCI.
- Movimientos legales en texto libre: 86,8 % de las respuestas son movimientos legales segun las reglas.
- Razonamiento tactico acotado: mates en 1 (44,2 %) y mates en 2 (24,8 %), asi como puzzles faciles, medios y dificiles.
- Puntuacion por log-verosimilitud: permite evaluar todos los movimientos legales y seleccionar el mas probable, mejorando la precision frente a la generacion directa.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (una unica pasada forward, sin busqueda).
- Capacidades multilingues: no disponibles; el modelo no conserva ni mide su habilidad conversacional general.
- Capacidad especial: lectura de tableros en formato textual con orientacion desde el lado que mueve.

## Casos de uso

- Entrenamiento y evaluacion de pipelines de ajedrez: el modelo puede integrarse como componente de sugerencia de movimientos en herramientas de analisis de puzzles, con la ventaja de una unica pasada forward y bajo coste computacional.
- Aplicaciones educativas de ajedrez: para generar pistas en ejercicios tacticos (mates en 1 y 2), donde alcanza el 44,2 % y el 24,8 % respectivamente, suficiente para un asistente de practica que propone candidatos.
- Generacion de datasets sinteticos de ajedrez: usar el modelo para etiquetar posiciones con movimientos candidatos y filtrar despues con un motor, aprovechando su alta tasa de legalidad (86,8 %).
- Investigacion en destilacion de conocimiento: sirve como caso de referencia para estudiar como un modelo de 135M absorbe conocimiento de un motor de ajedrez sin busqueda, con codigo de benchmark disponible en el repositorio de MAIN Lab.
- Despliegue en entornos con recursos minimos: al tener 134,5M parametros y pesos safetensors de 0,5 GB, cabe en CPU y en GPUs de consumo, lo que permite ejecutarlo en dispositivos embebidos o sin acelerador dedicado.
- Filtrado y clasificacion de puzzles: en una base de datos de ejercicios, el modelo puede priorizar posiciones donde acierta con alta confianza (puzzles faciles) y descartar las que falla, segmentando por dificultad.
- Prototipado rapido de interfaces de ajedrez: para validar la viabilidad de un asistente de movimientos antes de invertir en modelos mayores o en integracion con Stockfish.

## Benchmarks y rendimiento

Resultados del Benchmark #005 del autor: porcentaje de puzzles resueltos (todos los movimientos de la solucion correctos) sobre 2.500 puzzles de Lichess no vistos, 500 por conjunto. Cada movimiento se elige entre los legales por log-verosimilitud, igual para todos los modelos. SmolLM3-3B se ejecuto sobre 200 por conjunto.

| Test | Azar | SmolLM2-135M (antes) | Gemma 3 270M | SmolLM3-3B | Este modelo |
|---|---|---|---|---|---|
| Mate en 1 | 3,4 | 0,8 | 0,4 | 1,5 | 44,2 |
| Mate en 2 | 0,1 | 0,0 | 0,0 | 0,0 | 24,8 |
| Facil (< 1200) | 1,3 | 1,0 | 1,0 | 0,5 | 35,6 |
| Medio (1200–1800) | 0,4 | 0,6 | 0,8 | 0,5 | 14,4 |
| Dificil (≥ 1800) | 0,2 | 0,4 | 0,2 | 0,5 | 4,6 |
| Movimiento legal (texto libre) | – | 0,0 | 2,4 | 2,0 | 86,8 |

En conjunto, resuelve el 24,7 % de los 2.500 puzzles, frente al 0,6 % del modelo base. El autor indica que gana en todas las pruebas con McNemar pareado p < 0,01, tambien frente al modelo de 3B.

## Requisitos de hardware

- VRAM estimada para inferencia: con 134,5M parametros, aproximadamente 0,27 GB en fp16/bf16 y alrededor de 0,14 GB en int8; en fp32, unos 0,54 GB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el entrenamiento se realizo incluso en CPU (4 nucleos, bf16).
- Cabe en GPU de consumo: si, en todas las gamas actuales (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y cualquier runtime compatible con safetensors. No se documentan pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser una unica pasada forward por movimiento, la latencia esperada es muy baja en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en puzzles | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAIN-Lab/smollm2-135m-chess | 134,5M | no disponible | 24,7 % global; 44,2 % mate en 1 | Apache-2.0 | Hugging Face |
| SmolLM2-135M-Instruct (base) | 135M | no disponible | 0,6 % global; 0,8 % mate en 1 | Apache-2.0 | Hugging Face |
| Gemma 3 270M | 270M | no disponible | 0,0 % mate en 1; 2,4 % legal en texto libre | no disponible | Hugging Face |
| SmolLM3-3B | 3B | no disponible | 0,0 % mate en 1; 2,0 % legal en texto libre | no disponible | Hugging Face |

El modelo especializado supera a alternativas generalistas mas grandes en la tarea concreta de puzzles, a costa de perder capacidad conversacional. La comparacion es valida solo en el dominio de ajedrez.

## Limitaciones y advertencias

- Solo resuelve puzzles: no fue entrenado con aperturas, posiciones tranquilas ni partidas completas, por lo que su uso fuera de ese dominio es limitado.
- No realiza busqueda: falla especialmente en combinaciones profundas (puzzles dificiles, ≥ 1800, con solo 4,6 % de acierto).
- Perdida de capacidad conversacional: su habilidad de chat general no se conservo ni se midio; no debe usarse como asistente general.
- Riesgo de alucinacion: aunque el 86,8 % de las respuestas en texto libre son movimientos legales, el 13,2 % restante puede ser ilegal o invalido; en produccion conviene filtrar con un validador de reglas.
- Sesgos: no documentados por el autor; el modelo hereda los sesgos del modelo base en la medida en que persistan tras el ajuste fino.
- Limitaciones de idioma: no se documentan idiomas soportados; el modelo opera sobre notacion de ajedrez, no sobre lenguaje natural.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base (SmolLM2-135M-Instruct) tambien es Apache-2.0 y los datos (Lichess) son CC0; no se identifican restricciones adicionales.
- Caveat de produccion: el formato de prompt debe respetarse exactamente (tablero desde el lado que mueve, mayusculas/minusculas, UCI); desviarse de el degrada el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MAIN-Lab/smollm2-135m-chess
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset de puzzles de Lichess: https://huggingface.co/datasets/Lichess/chess-puzzles
- Codigo del prompt, scoring y benchmark (`chessft/`): repositorio de MAIN Lab (enlace no disponible en la informacion proporcionada)
- Paper, blog o demo: no disponibles en la informacion proporcionada
