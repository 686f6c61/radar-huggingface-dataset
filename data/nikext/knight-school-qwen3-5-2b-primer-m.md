# nikext/knight-school-qwen3.5-2b-primer-m

## Resumen

Knight School · Qwen3.5-2B primer-M + T8 es un ajuste fino completo de Qwen/Qwen3.5-2B, desarrollado por el autor independiente nikext dentro del proyecto Knight School, orientado exclusivamente a la resolución de puzzles de ajedrez. El modelo parte de una arquitectura transformer densa de 2.213.241.664 parámetros (2,2B) y conserva la torre de visión del modelo base, aunque las evaluaciones publicadas se han realizado únicamente sobre el modelo de lenguaje. Su relevancia no reside en el rendimiento absoluto, sino en el experimento metodológico que documenta: medir si un "primer" de ajedrez barato y sin profesor (SFT sobre lectura de tablero, reglas y posiciones anotadas por Stockfish) eleva el techo que alcanza después el aprendizaje por refuerzo con GRPO.

El modelo se entrenó con 1.326.000 ejemplos de ajedrez generados sin intervención de ningún LLM: todas las etiquetas provienen de python-chess (reglas) o de Stockfish 19 (calidad de jugada), sobre datos CC0 de Lichess. El resultado principal es que el SFT por sí solo alcanza una tasa de resolución del 35,7% en el conjunto test2000, frente al 4,1% del modelo base en zero-shot y al 25,8-28,0% de las variantes entrenadas solo con GRPO. El hallazgo negativo es igual de relevante: aplicar GRPO sobre el primer no aporta ganancia medible (−0,2 y −0,9 puntos según variante).

La ficha corresponde a un checkpoint de investigación con fecha de creación de octubre de 2026, 185 descargas y licencia Apache-2.0. Es un modelo de un solo dominio, con formato de prompt fijo y dependencia explícita de la lista de jugadas legales, no un modelo conversacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), con torre de visión conservada del modelo base |
| Parametros totales | 2.213.241.664 (2,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (longitud máxima de entrenamiento: 2.048 tokens) |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos en safetensors, inferencia de referencia en bfloat16) |
| Idiomas soportados | Inglés (en); formato de prompt únicamente en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers; clase AutoModelForImageTextToText) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) de Qwen3.5-2B, un transformer denso de 2,2B parámetros. Conserva sin cambios la torre de visión del modelo base, aunque el pipeline declarado es text-generation y las evaluaciones se sirvieron únicamente con el modelo de lenguaje (vLLM con `--language-model-only`). El entrenamiento consistió en una época sobre 1.326.000 ejemplos (192,5M tokens), con learning rate 1e-5 con decaimiento coseno, 1.728 ejemplos por paso (768 pasos), longitud máxima de 2.048 tokens y pérdida calculada solo sobre los tokens de respuesta. Se ejecutó en una única A100 80GB spot en Google Cloud; el proyecto completo declarado costó menos de 200 dólares en créditos.

El dataset combina ocho tareas: lectura de tablero (T1), jugadas legales (T2), FEN tras una jugada (T3), ataques y jaques (T4), mejor jugada según Stockfish (T5), evaluación (T6), mejor línea (T7) y 26.000 posiciones de T5 reformuladas en el formato exacto del prompt de RL (T8, 2% del total). Todas las respuestas se generan con python-chess o Stockfish 19; no se usó ningún dato generado por LLM. El proyecto también probó variantes con GRPO (recompensa densa con objetivo 0,14 y recompensa dispersa) sobre el modelo base y sobre el primer, con el resultado de que la ganancia atribuible al RL desaparece cuando se parte del primer.

## Capacidades

- Resolución de puzzles de ajedrez: dado un FEN, el lado a mover y la lista de jugadas legales, devuelve una jugada en SAN dentro de `<answer></answer>`.
- Lectura de tablero y reconstrucción de estado: interpreta posiciones y calcula el FEN resultante tras una jugada (tareas T1 y T3 del entrenamiento).
- Enumeración y verificación de jugadas legales, ataques y jaques (tareas T2 y T4).
- Evaluación posicional y selección de mejor jugada y mejor línea según los criterios de Stockfish (tareas T5, T6 y T7).
- Modo de respuesta directa con `enable_thinking=False`: el template rellena un bloque de pensamiento vacío y el modelo responde en unos diez tokens.
- Capacidad multimodal latente: conserva la torre de visión de Qwen3.5, aunque no se ha evaluado ni documentado su uso en este checkpoint.
- No dispone de tool calling ni de capacidades de agente documentadas; el soporte multilingüe se limita al inglés.

## Casos de uso

- Evaluación de pipelines de RL para dominios verificables: el modelo sirve como referencia reproducible de hasta dónde llega SFT frente a GRPO en una tarea con recompensa objetiva, útil para investigadores que diseñan experimentos de RLHF/GRPO.
- Generación de datasets sintéticos de ajedrez con verificación: al producir jugadas en SAN sobre una lista cerrada de movimientos legales, las respuestas se validan automáticamente con python-chess antes de incorporarse a un corpus.
- Anotación asistida de posiciones en herramientas de análisis: integrado en un visor de puzzles, sugiere una jugada candidata que después se contrasta con un motor, reduciendo el coste de pre-filtrado.
- Clasificación y filtrado de puzzles por dificultad: la tasa de acierto del modelo sobre un lote de puzzles correlaciona con su nivel, lo que permite estratificar conjuntos de datos sin ejecutar Stockfish en cada posición.
- Docencia y divulgación de ajedrez computacional: el formato de prompt explícito (FEN, lado a mover, lista de legales) hace visible el razonamiento requerido y sirve para explicar cómo se descompone una táctica.
- Pruebas de robustez de prompts: al ser un modelo pequeño y barato de servir, es adecuado para medir la sensibilidad de un LLM a variaciones en la formulación del problema, como demuestra el colapso al 1,9% sin la lista de jugadas legales.
- Investigación sobre currículos de entrenamiento: permite replicar el experimento de primer frente a RL directo con un presupuesto de menos de 200 dólares, algo viable en entornos académicos con recursos limitados.

## Benchmarks y rendimiento

Resultados sobre test2000: 2.000 puzzles de Lichess no vistos, divididos por partida y estratificados por rating (400-2799). Decodificación greedy, una respuesta por posición, lista de jugadas legales incluida en el prompt. Un puzzle se considera resuelto si todas las jugadas del solucionador son correctas. Intervalos de confianza del 95% por bootstrap sobre puzzles.

| Modelo | Tasa de resolución | Precisión de jugada | Legalidad | Rating de puzzle |
|---|---|---|---|---|
| Qwen3.5-2B base, zero-shot | 4,1% [3,2; 5,0] | 15,6% | 96,4% | Por debajo del rango |
| base → GRPO denso (sin primer) | 25,8% [23,9; 27,8] | 43,2% | 100,0% | 973 |
| base → GRPO disperso (sin primer) | 28,0% [26,1; 30,0] | 44,3% | 99,9% | 1038 |
| primer-M + T8 (solo SFT) | 35,7% [33,6; 37,9] | 55,8% | 100,0% | 1237 |
| primer-M + T8 → GRPO disperso | 35,4% [33,4; 37,6] | 56,0% | 99,8% | 1237 |
| primer-M + T8 → GRPO denso (objetivo 0,14) | 34,8% [32,6; 36,9] | 55,6% | 100,0% | 1214 |
| Stockfish 19, 1 nodo (referencia) | 68,6% [66,6; 70,6] | 83,6% | 100,0% | 2109 |

Diferencias pareadas documentadas: el primer mejora la tasa tras RL en +7,4 puntos [+5,8; +9,2] (disperso) y +6,8 [+5,2; +8,4] (denso) frente a GRPO desde el modelo base. GRPO sobre el primer no añade nada: −0,2 [−1,6; +1,1] (disperso) y −0,9 [−2,3; +0,4] (denso). Un primer solo de reglas no ayudó (+0,4 [−1,0; +1,8] tras RL). Sin la lista de jugadas legales en el prompt, el modelo colapsa (1,9% en la variante primer → GRPO denso).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,4 GB de pesos, más overhead de activaciones y caché KV; en la práctica, 8-10 GB cubren la inferencia con contexto de 2.048 tokens.
- En cuantización de 8 bits, la huella de pesos baja a unos 2,2 GB; en 4 bits, a unos 1,1-1,3 GB, aunque el autor no publica pesos cuantizados ni validación de las cuantizaciones.
- GPU recomendadas: A100 80GB para entrenamiento (configuración usada por el autor); para inferencia, cualquier GPU con 8 GB o más, como RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, L4 o A10G.
- Cabe en GPU de consumo: sí, en RTX 3060 12GB, RTX 4060 Ti 16GB y RTX 4090 en bfloat16; en 4 bits, en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (referencia del autor, con `AutoModelForImageTextToText`), vLLM (usado en las evaluaciones con `--language-model-only`). No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modelo responde en aproximadamente diez tokens con `enable_thinking=False`, lo que reduce el coste por consulta frente a modelos con cadena de pensamiento larga.
- Consistencia: con transformers 5.17, las respuestas greedy coincidieron con las de vLLM en 39-40 de 40 posiciones muestreadas por checkpoint; el resto difería por un empate casi exacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de resolución (test2000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Knight School Qwen3.5-2B primer-M + T8 | 2,2B | No disponible (entrenado a 2.048) | 35,7% | Apache-2.0 | HuggingFace |
| Qwen3.5-2B base | 2,2B | No disponible | 4,1% (zero-shot) | Apache-2.0 | HuggingFace |
| base → GRPO disperso (sin primer) | 2,2B | No disponible | 28,0% | Apache-2.0 | Checkpoint del proyecto |
| Stockfish 19 (1 nodo) | Motor clásico (no LLM) | No aplica | 68,6% | GPL-3.0 | Distribución independiente |

La comparación relevante es interna al proyecto: el mismo modelo base con y sin primer, y el motor Stockfish como referencia de techo. No se dispone de datos de otros LLM de ajedrez comparables en la información proporcionada.

## Limitaciones y advertencias

- Mide tasa de resolución de puzzles, no fuerza de juego: no se ha probado en partidas completas y no debe usarse contra personas en partidas en vivo.
- Dependencia crítica de la lista de jugadas legales en el prompt: sin ella, el rendimiento cae al 1,9% en la variante evaluada. Cualquier integración debe reproducir ese formato.
- Una sola semilla por brazo experimental; los intervalos de confianza cubren el muestreo de puzzles, no la varianza de entrenamiento.
- Formato de prompt únicamente en inglés; no se probaron otras formulaciones ni otros idiomas.
- Riesgo de alucinación en posiciones fuera de distribución: el modelo puede emitir una jugada plausible pero incorrecta, por lo que en producción conviene validar con python-chess o un motor.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y los datos derivan de Lichess (CC0) y Stockfish (GPL-3.0, usado como herramienta y no distribuido); verificar el cumplimiento si se redistribuye junto con Stockfish.
- Sesgos: no documentados por el autor; al entrenarse solo con puzzles de Lichess, la distribución de posiciones y estilos está sesgada hacia ese corpus.
- Checkpoint de investigación con 185 descargas y sin validación externa; no se han publicado pesos cuantizados ni guías de despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikext/knight-school-qwen3.5-2b-primer-m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto Knight School: https://github.com/nikext/knight-school
- Documento de resultados (docs/RESULTS.md): https://github.com/nikext/knight-school/blob/main/docs/RESULTS.md
- Navegador de respuestas de puzzles: https://nikext.github.io/knight-school/
- Dataset de puzzles: https://huggingface.co/datasets/nikext/knight-school-chess-puzzles
