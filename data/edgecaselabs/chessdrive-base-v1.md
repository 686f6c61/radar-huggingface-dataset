# EdgeCaseLabs/ChessDrive-base-v1

## Resumen

ChessDrive base-v1 es un modelo de lenguaje especializado en ajedrez de 1,7 mil millones de parametros, desarrollado por EdgeCaseLabs. Se trata de un ajuste fino del modelo LiquidAI/LFM3-1.7B que responde preguntas de si/no sobre conceptos ajedrecisticos aplicados a posiciones reales descritas mediante notacion FEN. El modelo combina un decodificador de lenguaje con un codificador de tablero basado en Maia 3, lo que le permite "ver" la posicion y emitir un juicio sobre si un concepto concreto (peon envenenado, alfil malo, casilla debil, compensacion material) se cumple o no en el tablero.

Su relevancia radica en que actua como herramienta especializada para modelos generalistas: segun la model card, al combinarlo con Claude Opus 5.5 y Stockfish, la precision en el ChessDrive Term Benchmark sube del 83,7 % al 88,1 % (p = 0,005). Por si solo, el modelo alcanza un 80,9 % de acierto, superando a Claude Opus 5.5 (74,6 %), GPT 6.2 Sol (69,4 %) y Claude Haiku 5.5 (62,6 %), y empatando estadisticamente con Opus 5.5 asistido por Stockfish (83,7 %).

El modelo se distribuye con licencia LFM Open License v1.0 (uso comercial restringido a organizaciones con ingresos anuales inferiores a 10 millones de dolares), esta entrenado unicamente en ingles y esta pensado como componente de un sistema mayor (ChessDrive) mas que como modelo conversacional de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (fine-tune de LFM3-1.7B) con codificador de tablero Maia 3 y proyector multimodal |
| Parametros totales | 1,7 mil millones (decodificador); codificador Maia 3 de 79M adicional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (pesos); Apache 2.0 (codigo `chessdrive.py`); Maia 3 bajo AGPLv3 |
| Formato de pesos | safetensors (`decoder/`, `projector.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte del decodificador LFM3-1.7B de Liquid AI y le anade una via de entrada visual del tablero mediante un proyector que conecta con el codificador Maia 3 (79M parametros). El resultado es un modelo multimodal texto + tablero: recibe una posicion en FEN (o varias) y una pregunta en lenguaje natural, y genera una respuesta corta, normalmente "Yes." o "No." acompanada opcionalmente de una justificacion breve.

El ajuste fino se realizo sobre preguntas y respuestas ajedrecisticas acerca de posiciones extraidas de partidas reales. El conjunto de evaluacion (ChessDrive Term Benchmark, 497 preguntas de si/no) se mantuvo fuera del entrenamiento salvo una posicion (`tb-0381`, que aparecio con una pregunta distinta; sin ella la puntuacion es 80,8 %). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La decodificacion es greedy y el modelo esta optimizado para respuestas cortas y para las formas de pregunta vistas durante el entrenamiento.

## Capacidades

- Juicio de conceptos ajedrecisticos sobre una posicion dada en FEN, con respuesta de si/no.
- Cobertura de conceptos de posicion completa: posicion ganadora, equilibrada, poco clara, critica, compensacion material.
- Cobertura de conceptos que requieren juicio sobre pieza, casilla o jugada: outpost, alfil malo, casilla debil, zwischenzug, peon envenenado, blunder.
- Evaluacion de secuencias de jugadas indicadas en notacion de origen-destino (`e2e4`, `e7e8q`) y preguntas del tipo "After e2e4 e7e5: is ...".
- Soporte de multiples tableros en una misma consulta mediante listas de FEN.
- Procesamiento por lotes con `ask_many([(fen, question), ...])`.
- Capacidad destacada en la distincion entre casos reales y "near misses" (posiciones que se parecen al concepto pero no lo cumplen): 84,9 % de acierto en near misses.
- Uso como herramienta (tool) invocable por un modelo generalista para mejorar sus respuestas ajedrecisticas.
- No soporta tool calling nativo, agentes multi-paso ni modo de razonamiento extendido segun la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Etiquetado de posiciones en bases de datos: procesar partidas o posiciones almacenadas y anotar automaticamente que conceptos ajedrecisticos se cumplen, aprovechando el procesamiento por lotes (`ask_many`) para recorrer grandes volumenes de FEN.
- Verificacion de explicaciones de comentaristas o entrenadores: comprobar si una afirmacion como "este es un alfil malo" o "el caballo esta en un outpost" se sostiene sobre el tablero real, gracias a su capacidad para distinguir casos reales de near misses.
- Herramienta auxiliar de un LLM generalista: integrar el modelo como tool en un pipeline con Claude Opus 5.5 y Stockfish para elevar la precision en preguntas conceptuales de ajedrez del 83,7 % al 88,1 %.
- Analisis post-partida asistido: generar informes que senalen posiciones criticas, compensaciones materiales o errores graves a partir de las posiciones de una partida, usando el modelo como clasificador de conceptos.
- Entrenamiento y docencia: construir ejercicios automaticos que pregunten al alumno si un concepto se aplica a una posicion, validando la respuesta correcta con el modelo.
- Filtrado y curaduria de datasets ajedrecisticos: seleccionar posiciones que cumplan criterios conceptuales concretos (por ejemplo, posiciones con peon envenenado) para construir corpus tematicos.
- Investigacion en razonamiento especializado: estudiar como un modelo pequeno de dominio especifico supera a modelos frontera en una tarea acotada, sirviendo de base para experimentos de destilacion o de evaluacion de herramientas.

## Benchmarks y rendimiento

Resultados en el ChessDrive Term Benchmark (497 preguntas de si/no; la mayor parte son near misses):

| Modelo | Precision (IC 95 %) | Yes | Near miss | Posicion completa | Juicio | Tras jugadas |
|---|---:|---:|---:|---:|---:|---:|
| Claude Opus 5.5 (medium) + Stockfish + ChessDrive base-v1 | **88,1 %** (85,0–90,7) | 92,5 | 84,9 | 86,5 | 88,7 | 82,9 |
| Claude Opus 5.5 (medium) + Stockfish | 83,7 % (80,2–86,7) | 92,0 | 77,5 | 81,2 | 84,6 | 77,6 |
| **ChessDrive base-v1** | **80,9 %** (77,2–84,1) | 75,6 | **84,9** | **85,0** | 79,4 | **78,8** |
| Claude Opus 5.5 (medium) | 74,6 % (70,6–78,3) | 85,4 | 66,5 | 69,2 | 76,6 | 67,6 |
| GPT 6.2 Sol | 69,4 % (65,2–73,3) | 93,9 | 51,1 | 68,4 | 69,8 | 60,6 |
| Claude Haiku 5.5 | 62,6 % (58,2–66,7) | 76,5 | 52,1 | 62,4 | 62,6 | 50,6 |
| Siempre "No" | 57,1 % | 0 | 100 | — | — | — |

Pruebas de McNemar pareadas: ChessDrive base-v1 supera a Opus 5.5 (p = 0,017), GPT 6.2 Sol (p = 2e-5) y Haiku 5.5 (p = 1e-11); su diferencia con Opus 5.5 + Stockfish no es significativa (p = 0,27). Anadirlo a Opus 5.5 + Stockfish produce una mejora significativa (p = 0,005). En IFEval, el modelo sigue todas las instrucciones en el 50,7 % de los prompts, frente al 69,9 % del LFM3-1.7B original.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 7,0 GB en safetensors (decodificador de 1,7B mas proyector). En fp16 se puede inferir en torno a 4-5 GB de VRAM para el decodificador, mas el codificador Maia 3 de 79M; en cuantizaciones de 8 o 4 bits el consumo baja previsiblemente, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; RTX 3060/4060 Ti, RTX 4070/4080, RTX 4090, A100, H100 como opciones de mayor rendimiento.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: el repositorio incluye `chessdrive.py` con `ChessDrive.from_pretrained` y los metodos `ask` y `ask_many`; requiere instalar `requirements.txt`, que incluye Maia 3 (AGPLv3). Los pesos de Maia 3 se descargan de `UofTCSSLab/Maia3-79M` en el primer uso, o se puede fijar `MAIA3_WEIGHTS` a una copia local. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (Term Benchmark) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChessDrive base-v1 | 1,7B (+ 79M Maia 3) | no disponible | 80,9 % | LFM Open License v1.0 (comercial solo < 10M USD de ingresos) | Hugging Face |
| Claude Opus 5.5 (medium) | no disponible | no disponible | 74,6 % (83,7 % con Stockfish) | propietaria | API |
| GPT 6.2 Sol | no disponible | no disponible | 69,4 % | propietaria | API |
| Claude Haiku 5.5 | no disponible | no disponible | 62,6 % | propietaria | API |

No se dispone de datos de benchmarks de otros modelos especializados en ajedrez de tamano comparable en la informacion proporcionada.

## Limitaciones y advertencias

- Es un especialista en ajedrez, no un modelo conversacional: en IFEval sigue todas las instrucciones en el 50,7 % de los prompts, frente al 69,9 % del LFM3-1.7B original.
- Genera jugadas ilegales en aproximadamente 3 de cada 10 peticiones de mejor jugada; cualquier movimiento propuesto debe validarse con un generador de jugadas.
- Entrenado con preguntas unicas y respuestas cortas, en ingles; su rendimiento fuera de ese formato o en otros idiomas no esta garantizado.
- Riesgo de alucinacion en conceptos no vistos durante el entrenamiento o en posiciones atipicas; la model card no documenta analisis de sesgos.
- Licencia LFM Open License v1.0: el uso comercial solo esta permitido a organizaciones con ingresos anuales inferiores a 10 millones de dolares; los terminos se aplican a cualquiera que use los pesos. El codigo `chessdrive.py` es Apache 2.0.
- El codificador Maia 3 no esta incluido en el repositorio y se distribuye bajo AGPLv3, lo que impone obligaciones adicionales de copyleft al integrarlo en un producto.
- La evaluacion se apoya en un unico benchmark propietario (497 preguntas) con una posicion del conjunto de entrenamiento filtrada; no hay resultados publicados en benchmarks estandar de ajedrez o de lenguaje.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EdgeCaseLabs/ChessDrive-base-v1
- Dataset ChessDrive Term Benchmark: https://huggingface.co/datasets/EdgeCaseLabs/ChessDrive-TermBench
- Plataforma ChessDrive: https://platform.chessdrive.io
- Modelo base LiquidAI/LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Codificador Maia 3 (pesos): https://huggingface.co/UofTCSSLab/Maia3-79M
- Codificador Maia 3 (repositorio): https://github.com/CSSLab/maia3
- Paper referenciado (arXiv 2605.19091): https://arxiv.org/abs/2605.19091
