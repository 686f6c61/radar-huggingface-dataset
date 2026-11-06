# nikext/knight-school-qwen3.5-2b-primer-m-grpo-dense

## Resumen

Knight School · Qwen3.5-2B primer-M + T8 → GRPO (dense reward) es un ajuste fino del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario nikext, orientado exclusivamente a la resolución de problemas de ajedrez (puzzles). Forma parte del proyecto Knight School, un experimento medido para comprobar si un "primer" de ajedrez barato y sin profesor (SFT sobre lectura de tablero, reglas y posiciones anotadas por Stockfish) mejora el rendimiento alcanzable mediante GRPO (Group Relative Policy Optimization). No se utilizaron datos generados por LLM en ninguna fase: toda la señal de entrenamiento proviene de python-chess (reglas) o de Stockfish (calidad de jugada), sobre datos CC0 de Lichess.

El modelo tiene 2.213.241.664 parámetros (aproximadamente 2,2 mil millones) y conserva la arquitectura del Qwen3.5-2B original, incluyendo su torre de visión, aunque las evaluaciones se realizaron únicamente con el modelo de lenguaje. El resultado principal del proyecto es que el primer eleva la tasa de resolución tras el RL: el modelo con primer + GRPO supera al GRPO desde el modelo base en +6,8 puntos (recompensa densa) y +7,4 puntos (recompensa dispersa). Sin embargo, el propio GRPO sobre el primer no aportó mejora adicional respecto al SFT solo, lo que constituye el hallazgo central del experimento.

El modelo es relevante ahora como caso de estudio reproducible de RL aplicado a un dominio estrecho y verificable, con presupuesto reducido (menos de 200 dólares en créditos cloud) y con todas las configuraciones, scripts y registro de costes publicados en el repositorio del proyecto. Su licencia Apache-2.0 facilita la inspección y la reutilización del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B), con torre de visión conservada; ajuste fino con LoRA r=32 (alpha 64) fusionado tras el entrenamiento |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, dtype bfloat16 en el ejemplo de uso) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer denso de aproximadamente 2,2 mil millones de parámetros, y conserva su torre de visión sin modificaciones (aunque las evaluaciones sirvieron únicamente el modelo de lenguaje con `--language-model-only` en vLLM). El ajuste se realizó en dos fases: primero un SFT denominado "primer-M + T8" sobre lectura de tablero, reglas y posiciones anotadas por Stockfish; después, un entrenamiento con GRPO (TRL, con vLLM en modo colocate) mediante LoRA r=32 (alpha 64) sobre las capas lineales del modelo de lenguaje, fusionado tras el entrenamiento. El entrenamiento GRPO consistió en 200 pasos × 64 prompts × 8 muestras, tomadas de 66.008 posiciones de puzzles de Lichess (`rl_train`), con lr 1e-5, β = 1e-3, pérdida DAPO, temperatura 1.0, generación detenida en el primer `</answer>` y bonus de entropía adaptativo con objetivo 0.14 (la entropía del propio modelo primer, ADR-025).

La recompensa combina la probabilidad de victoria de Stockfish 19 para la jugada elegida (1 millón de nodos, MultiPV sobre todas las jugadas legales; 0 si la jugada es ilegal) más una recompensa de formato. Todo el entrenamiento se ejecutó en una única A100 80GB spot en Google Cloud. Los datos de entrenamiento provienen de las bases de puzzles y evaluación de Lichess (CC0); Stockfish (GPL-3.0) se usó como herramienta y no se distribuye. El proyecto no empleó datos generados por LLM en ninguna fase.

## Capacidades

- Resolución de puzzles de ajedrez: dado un FEN, el lado a mover y la lista de jugadas legales, el modelo devuelve una jugada en notación SAN dentro de `<answer></answer>`.
- Razonamiento táctico breve: el template pre-rellena un bloque de pensamiento vacío con `enable_thinking=False`, y el modelo responde directamente en unos diez tokens.
- Generación de texto conversacional (pipeline text-generation) heredada del modelo base.
- Capacidad de visión heredada de Qwen3.5 (torre de visión conservada), aunque no fue evaluada ni entrenada en este ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está entrenado para una única jugada por posición.
- Capacidades multilingües: solo inglés en el formato de prompt entrenado.

## Casos de uso

- Evaluación de pipelines de RL sobre dominios verificables: el modelo y su repositorio sirven como referencia reproducible para medir si un SFT previo mejora lo que GRPO puede alcanzar, con intervalos de confianza bootstrap y comparaciones pareadas publicadas.
- Investigación sobre recompensas densas frente a dispersas: permite replicar el hallazgo de que la recompensa densa (probabilidad de victoria de Stockfish) y la dispersa producen resultados similares en este dominio (+6,8 frente a +7,4 puntos sobre el GRPO desde base).
- Generación de anotaciones tácticas en bases de datos de ajedrez: el modelo puede procesar posiciones con la lista de jugadas legales incluida y producir una jugada candidata en SAN, útil como filtro previo barato antes de un motor completo.
- Estudio de dependencia del prompt: el proyecto documenta que sin la lista de jugadas legales en el prompt los modelos colapsan (1,9% de resolución con primer + GRPO denso), lo que lo convierte en un caso práctico para analizar robustez de formato.
- Docencia y divulgación sobre ajuste fino con RL: el bajo coste del proyecto (menos de 200 dólares en créditos) y la publicación de todas las ejecuciones, evaluaciones e intentos fallidos lo hacen adecuado para cursos y tutoriales.
- Comparación de metodologías de entrenamiento en modelos pequeños: permite contrastar SFT solo, SFT + GRPO y GRPO desde base sobre el mismo conjunto de test de 2.000 puzzles estratificado por rating (400–2799).

## Benchmarks y rendimiento

Resultados sobre test2000: 2.000 puzzles de Lichess reservados, divididos por partida y estratificados por rating (400–2799). Decodificación greedy, una respuesta por posición del solucionador, con las jugadas legales listadas en el prompt. Un puzzle se considera resuelto cuando todas las jugadas del solucionador son correctas. Intervalos de confianza bootstrap del 95% sobre puzzles. El rating de puzzle es el rating al 50% de resolución.

| Modelo | Tasa de resolución | Precisión de jugada | Legalidad | Rating de puzzle |
|---|---|---|---|---|
| Qwen3.5-2B base, zero-shot | 4,1% [3,2; 5,0] | 15,6% | 96,4% | por debajo del rango |
| base → GRPO denso (sin primer) | 25,8% [23,9; 27,8] | 43,2% | 100,0% | 973 |
| base → GRPO disperso (sin primer) | 28,0% [26,1; 30,0] | 44,3% | 99,9% | 1038 |
| primer-M + T8 (solo SFT) | 35,7% [33,6; 37,9] | 55,8% | 100,0% | 1237 |
| primer-M + T8 → GRPO disperso | 35,4% [33,4; 37,6] | 56,0% | 99,8% | 1237 |
| **primer-M + T8 → GRPO denso (objetivo 0,14)** | **34,8% [32,6; 36,9]** | **55,6%** | **100,0%** | **1214** |
| Stockfish 19, 1 nodo (referencia) | 68,6% [66,6; 70,6] | 83,6% | 100,0% | 2109 |

Hallazgos del proyecto (diferencias pareadas, docs/RESULTS.md):
- El primer eleva la tasa de resolución tras el RL: primer → GRPO supera al GRPO desde el modelo base en +7,4 puntos [+5,8; +9,2] (disperso) y +6,8 [+5,2; +8,4] (denso).
- Esa ganancia es del SFT: el GRPO sobre primer-M no añadió nada, con −0,2 [−1,6; +1,1] (disperso) y −0,9 [−2,3; +0,4] (denso, objetivo 0,14) frente al primer solo.
- Un primer solo de reglas (lectura de tablero, sin elección de jugada) no ayudó: +0,4 [−1,0; +1,8] tras RL.
- Sin la lista de jugadas legales en el prompt, estos modelos colapsan (primer → GRPO denso: 1,9%).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,2 mil millones de parámetros en bfloat16, el peso ronda los 4,4 GB (tamaño del repositorio), por lo que la inferencia cabe holgadamente en GPUs de consumo con al menos 8 GB de VRAM.
- GPU recomendadas: el entrenamiento se realizó en una única A100 80GB spot en Google Cloud; para inferencia no se especifican GPU concretas.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (4,4 GB de pesos en safetensors); no se detallan modelos concretos en la información disponible.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForImageTextToText` y `AutoTokenizer`), vLLM (usado en las evaluaciones con `--language-model-only`); otras opciones como llama.cpp, Ollama o TGI no están documentadas en la información proporcionada.
- Latencia y throughput: no disponibles; el modelo responde en aproximadamente diez tokens por posición según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de resolución (test2000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Knight School Qwen3.5-2B primer-M + GRPO denso | 2,2B | no disponible | 34,8% | Apache-2.0 | Hugging Face (191 descargas) |
| Qwen3.5-2B base (zero-shot) | 2,2B | no disponible | 4,1% | Apache-2.0 | Hugging Face |
| Stockfish 19 (1 nodo, referencia) | no aplica (motor) | no aplica | 68,6% | GPL-3.0 | Distribución independiente |

No se dispone de información sobre otros modelos de ajedrez comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La métrica es tasa de resolución de puzzles, no fuerza de juego: los puzzles incluyen una táctica forzada y el prompt lista las jugadas legales; el modelo no ha sido probado en partidas.
- Depende críticamente de la lista de jugadas legales en el prompt: sin ella, el rendimiento colapsa (1,9% en la variante densa).
- Una sola semilla por rama experimental; los intervalos de confianza cubren el muestreo de puzzles, no la varianza del entrenamiento.
- Solo se probó el formato de prompt en inglés; otras formulaciones no fueron evaluadas.
- No debe usarse contra personas en partidas en vivo; el proyecto nunca juega en Lichess ni en chess.com.
- Riesgo de alucinación: no evaluado explícitamente; el formato de respuesta exige una jugada de la lista, pero no se documentan análisis de errores fuera de las métricas de legalidad.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el modelo está diseñado para puzzles con lista de jugadas legales, no para juego general.
- La torre de visión se conserva pero no fue entrenada ni evaluada en este ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/nikext/knight-school-qwen3.5-2b-primer-m-grpo-dense
- Repositorio del proyecto: https://github.com/nikext/knight-school
- Navegador de respuestas de puzzles: https://nikext.github.io/knight-school/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de puzzles: https://huggingface.co/datasets/nikext/knight-school-chess-puzzles
