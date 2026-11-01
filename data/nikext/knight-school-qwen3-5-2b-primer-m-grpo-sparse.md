# nikext/knight-school-qwen3.5-2b-primer-m-grpo-sparse

## Resumen

Knight School es un modelo de lenguaje de 2.213.241.664 parametros (aproximadamente 2,2 mil millones) afinado a partir de Qwen/Qwen3.5-2B por el desarrollador independiente nikext. Su proposito concreto es resolver problemas de ajedrez (chess puzzles) de la base de datos publica de Lichess, un dominio muy acotado pero de interes para investigar como el ajuste fino supervisado (SFT) y el aprendizaje por refuerzo con GRPO interactuan en modelos pequenos. El modelo forma parte del proyecto abierto Knight School, que documenta cada ejecucion, evaluacion y prueba fallida con un coste total inferior a 200 dolares en creditos de nube.

La propuesta tecnica del proyecto es medir si un "primer" barato y sin profesor (SFT sobre lectura de tablero, reglas y posiciones anotadas por Stockfish) eleva el techo que alcanza GRPO. La respuesta medida es que la mejora proviene del SFT y no del RL: GRPO sobre el modelo con primer no anade nada frente al SFT solo, mientras que GRPO desde el modelo base si mejora sustancialmente respecto al zero-shot. El modelo final combina primer-M + T8 con GRPO de recompensa dispersa (sparse), y es la variante que se publica en este repositorio.

Arquitectonicamente hereda de Qwen3.5-2B, incluyendo su torre de vision intacta, aunque las evaluaciones se hicieron solo con el modelo de lenguaje. La relevancia actual es metodologica: aporta intervalos de confianza bootstrap, diferencias pareadas y un protocolo reproducible sobre datos CC0, algo poco habitual en publicaciones de ajustes finos pequenos y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B, con torre de vision conservada sin modificar) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de aproximadamente 2,2 mil millones de parametros que incluye una torre de vision (el pipeline declarado es image-text-to-text y la clase de carga es AutoModelForImageTextToText). El checkpoint publicado conserva esa torre de vision sin cambios, aunque todas las evaluaciones se sirvieron unicamente con el modelo de lenguaje (vLLM con --language-model-only).

El entrenamiento tiene dos fases. La primera es un SFT sobre un "primer" (primer-M + T8) que ensena lectura de tablero, reglas y eleccion de jugadas a partir de posiciones anotadas por Stockfish; no se uso ningun dato generado por LLM: toda senal de entrenamiento proviene de python-chess (reglas) o de Stockfish (calidad de jugada), sobre datos CC0 de Lichess. La segunda fase aplica GRPO con TRL y vLLM en modo colocate: LoRA r=32 (alpha 64) sobre las capas lineales del modelo de lenguaje, fusionada tras el entrenamiento; 200 pasos x 64 prompts x 8 muestras extraidas de 66.008 posiciones de puzzles de Lichess (rl_train), lr 1e-5, beta 1e-3, perdida DAPO, temperatura 1.0, generacion detenida en el primer `</answer>` y bonus de entropia adaptativo con objetivo 0.2 (config v3). La recompensa es 1 si la jugada coincide con la del puzzle (cualquier mate en la ultima jugada), 0 en caso contrario, mas una recompensa de formato. El hardware fue una A100 80GB spot en Google Cloud.

## Capacidades

- Resolucion de puzzles de ajedrez: dado un FEN, el lado a mover y la lista de jugadas legales, devuelve una jugada en SAN dentro de `<answer></answer>`.
- Razonamiento breve en modo no-thinking: la plantilla de chat pre-rellena un bloque de pensamiento vacio y el modelo responde directamente en unos diez tokens.
- Generacion de texto conversacional con la plantilla de chat de Qwen3.5.
- Capacidad multimodal heredada (torre de vision de Qwen3.5 intacta), aunque no evaluada ni documentada para este ajuste.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del formato de puzzle.
- Capacidades multilingues: solo ingles en el prompt y en el entrenamiento.

## Casos de uso

- Evaluacion de metodos de RL en dominios verificables: el modelo sirve como banco de pruebas reproducible para comparar SFT, GRPO denso y GRPO disperso con diferencias pareadas e intervalos de confianza bootstrap, gracias a que cada senal de recompensa es verificable por python-chess.
- Investigacion sobre "primers" sin profesor: permite replicar el hallazgo de que un SFT barato sobre reglas y anotaciones de Stockfish eleva el techo del RL posterior, y usarlo como linea base en experimentos propios.
- Generacion de datos sinteticos de ajedrez para destilacion: con una tasa de acierto del 35,4% y una precision de jugada del 56,0% sobre test2000, puede emplearse como generador de candidatos a filtrar posteriormente con Stockfish.
- Analisis de sensibilidad al prompt: el proyecto demuestra que sin la lista de jugadas legales en el prompt el modelo colapsa (1,9% en la variante densa), lo que lo convierte en un caso de estudio util para disenar prompts robustos en tareas con espacio de acciones restringido.
- Educacion y divulgacion: el navegador de puzzles del proyecto permite inspeccionar cada respuesta del modelo, util para materiales docentes sobre RL y evaluacion estadistica.
- Prototipado de asistentes de ajedrez en entornos controlados: integrable en un pipeline que aporte el FEN y la lista de jugadas legales desde un motor de reglas, con el modelo como componente de seleccion de jugada.
- Referencia para ajustes finos de sub-3B: su receta (LoRA r=32, DAPO, bonus de entropia adaptativo, coste inferior a 200 dolares) es directamente reutilizable en otros dominios con recompensa verificable.

## Benchmarks y rendimiento

Resultados sobre test2000: 2.000 puzzles de Lichess reservados, divididos por partida y estratificados por rating (400-2799), decodificacion greedy, una respuesta por posicion y jugadas legales listadas en el prompt. Un puzzle se considera resuelto si todas las jugadas del solucionador son correctas. Intervalos de confianza bootstrap del 95% sobre puzzles; el rating de puzzle es el rating al 50% de resolucion.

| Modelo | Tasa de resolucion | Precision de jugada | Legalidad | Rating de puzzle |
|---|---|---|---|---|
| Qwen3.5-2B base, zero-shot | 4,1% [3,2; 5,0] | 15,6% | 96,4% | por debajo del rango |
| base -> GRPO denso (sin primer) | 25,8% [23,9; 27,8] | 43,2% | 100,0% | 973 |
| base -> GRPO disperso (sin primer) | 28,0% [26,1; 30,0] | 44,3% | 99,9% | 1038 |
| primer-M + T8 (solo SFT) | 35,7% [33,6; 37,9] | 55,8% | 100,0% | 1237 |
| primer-M + T8 -> GRPO disperso (este modelo) | 35,4% [33,4; 37,6] | 56,0% | 99,8% | 1237 |
| primer-M + T8 -> GRPO denso (objetivo 0,14) | 34,8% [32,6; 36,9] | 55,6% | 100,0% | 1214 |
| Stockfish 19, 1 nodo (referencia) | 68,6% [66,6; 70,6] | 83,6% | 100,0% | 2109 |

Hallazgos con diferencias pareadas: el primer eleva la tasa de resolucion tras RL en +7,4 puntos [+5,8; +9,2] (disperso) y +6,8 [+5,2; +8,4] (denso) frente a GRPO desde el modelo base; GRPO sobre primer-M no anade nada (-0,2 [-1,6; +1,1] en disperso y -0,9 [-2,3; +0,4] en denso frente al primer solo); un primer solo de reglas no ayuda (+0,4 [-1,0; +1,8] tras RL); y sin la lista de jugadas legales en el prompt los modelos colapsan (1,9% en la variante densa).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,4 GB de pesos (tamano del repositorio) mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para secuencias cortas.
- GPU recomendadas: A100 80GB para entrenamiento (una instancia spot en Google Cloud fue suficiente para todo el proyecto); para inferencia basta una GPU consumer con 8-12 GB.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en bfloat16 (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante); en 4 bits cabria en GPUs de 6-8 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (clase AutoModelForImageTextToText, como en el ejemplo de la model card) y vLLM (usado en las evaluaciones con --language-model-only); no se documentan GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma agregada; la model card indica que las respuestas greedy ocupan aproximadamente diez tokens y que con transformers 5.17 coincidieron con las respuestas calificadas de vLLM en 39-40 de 40 posiciones muestreadas por checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de resolucion en test2000 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Knight School Qwen3.5-2B primer-M + GRPO sparse | 2,21 B | no disponible | 35,4% | Apache-2.0 | HuggingFace (nikext) |
| Qwen3.5-2B base (zero-shot) | 2,21 B | no disponible | 4,1% | Apache-2.0 | HuggingFace (Qwen) |
| Qwen3.5-2B base -> GRPO sparse (sin primer) | 2,21 B | no disponible | 28,0% | Apache-2.0 | no publicado como checkpoint en la informacion disponible |
| Stockfish 19, 1 nodo (referencia de motor, no LLM) | no aplica | no aplica | 68,6% | GPL-3.0 | Distribucion publica de Stockfish |

No se dispone de datos de otros LLM ajustados para puzzles de ajedrez en la informacion proporcionada; la comparativa se limita a las variantes del propio proyecto y a Stockfish como referencia.

## Limitaciones y advertencias

- La metrica es tasa de resolucion de puzzles, no fuerza de juego: los puzzles incluyen una tactica forzada y el prompt lista las jugadas legales; el modelo no se ha probado en partidas.
- Depende criticamente de la lista de jugadas legales en el prompt: sin ella, la variante densa cae al 1,9%.
- Una sola semilla por rama experimental; los intervalos de confianza cubren el muestreo de puzzles, no la varianza de entrenamiento.
- Solo se valido el formato de prompt en ingles; otras formulaciones no se probaron.
- Riesgo de alucinacion: puede emitir jugadas fuera de la lista legal (legalidad del 99,8%, no del 100%) o respuestas mal formateadas.
- Sesgos conocidos: no documentados por el autor; al entrenarse solo con puzzles de Lichess (CC0) y anotaciones de Stockfish, hereda la distribucion y los sesgos de esas fuentes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero Stockfish (GPL-3.0) se uso como herramienta y no se distribuye; verificar la licencia de cualquier dato derivado que se redistribuya.
- No debe usarse contra personas en partidas en vivo; el proyecto nunca juega en Lichess ni en chess.com.
- Capacidad multimodal no evaluada: la torre de vision se conserva pero no se documento su comportamiento tras el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikext/knight-school-qwen3.5-2b-primer-m-grpo-sparse
- Repositorio del proyecto: https://github.com/nikext/knight-school
- Documento de resultados: docs/RESULTS.md dentro del repositorio del proyecto
- Navegador de puzzles y respuestas: https://nikext.github.io/knight-school/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de puzzles: https://huggingface.co/datasets/nikext/knight-school-chess-puzzles
