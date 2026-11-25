# Sanika7777/qwen3vl-4b-maze-wallhead

## Resumen

Qwen3-VL-4B maze wallhead es un adaptador LoRA experimental publicado por Sanika7777 (proyecto Visual Internal Reasoning, NU Launch Labs) sobre el modelo base `mlx-community/Qwen3-VL-4B-Instruct-8bit`, una versión cuantizada a 8 bits del modelo vision-language Qwen3-VL de 4B parámetros. El adaptador no es un modelo autónomo: contiene únicamente los pesos entrenados (13,1M parámetros en float32, 0,1 GB) e introduce tres componentes nuevos sobre el modelo congelado: un LoRA de rango 16 sobre las proyecciones q/k/v/o de todas las capas del LLM, una "wall head" (cabeza de detección de paredes) y unos "wall tokens" que inyectan las predicciones de esa cabeza en el flujo de tokens visuales.

El objetivo del proyecto es el razonamiento espacial sobre laberintos: dado un laberinto en imagen, el modelo debe responder con una secuencia de movimientos (`<answer>move, move, ...</answer>`) que lleve una bola hasta la meta. El interés técnico reside en la separación explícita entre percepción (detección de paredes mediante una cabeza auxiliar supervisada con etiquetas de muro) y planificación (generación de la ruta por el LLM), un patrón poco habitual en adaptadores LoRA de visión.

Los resultados son mixtos y el propio autor los documenta con honestidad: la cabeza detecta paredes con un 99,5% de acierto por token y un 87% de laberintos con todas las paredes correctas, pero la ruta generada por el LLM solo es correcta en el 10-11% de los laberintos retenidos y falla tras unos tres movimientos. Además, activar o desactivar la inyección de wall tokens no cambia el resultado, lo que indica que el modelo no está aprovechando la señal auxiliar. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer vision-language Qwen3-VL (base congelada); LoRA + MLP wall head + capa lineal de wall tokens |
| Parametros totales | 13,1M parámetros entrenados (adaptador); modelo base Qwen3-VL-4B no incluido en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-4B; no especificada en la model card) |
| Tipos de cuantizacion | Modelo base en 8 bits (mlx-community/Qwen3-VL-4B-Instruct-8bit); pesos del adaptador en float32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`weights.safetensors`, float32); requiere carga mediante `train_wallhead.py`, no compatible con el cargador estándar de adaptadores de `mlx_vlm` |
| Libreria | MLX |
| Tamano del repo | 0,1 GB |
| Modelo base | mlx-community/Qwen3-VL-4B-Instruct-8bit |

## Arquitectura y entrenamiento

El adaptador se compone de tres bloques entrenables sobre el Qwen3-VL-4B-Instruct-8bit congelado. Primero, un LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a las proyecciones q, k, v y o de todas las capas del LLM. Segundo, una wall head consistente en un MLP (5120 → 256 → 2) que se aplica sobre cada token de imagen, tomando como entrada la salida del merger visual y la feature intermedia de DeepStack, y que predice si atraviesa ese token una pared vertical u horizontal. Tercero, unos wall tokens: una capa lineal (2 → 2560) que convierte las probabilidades de la cabeza en vectores que se suman a los tokens de imagen antes de entrar en el LLM, escalados por una compuerta aprendible que arranca en 0 y termina en 0,06.

El entrenamiento usa el conjunto de test MazePlanning de 500 laberintos, con los folds 1-4 (400 laberintos) para entrenar y el fold 0 (100 laberintos) como retenido. La función de pérdida combina entropía cruzada sobre la ruta más 0,5 veces la BCE de las paredes; las etiquetas de muro se usan solo en la pérdida, nunca como entrada en inferencia. Se realizó una época con batch 1, AdamW con lr 1e-4 para el LoRA y 1e-3 para la cabeza, wall tokens y compuerta, con warmup y decaimiento coseno, en una MacBook Air M4 de 24 GB con MLX, en aproximadamente 1 h 50 min. El repo incluye `config.json` con todos los hiperparámetros y `train_log.jsonl` con la pérdida cada 10 pasos.

## Capacidades

- Razonamiento espacial sobre imágenes de laberintos: interpreta la disposición de paredes y produce una ruta de movimientos (arriba, abajo, izquierda, derecha) en el formato `<answer>move, move, ...</answer>`.
- Detección de paredes a nivel de token visual: la wall head clasifica cada token de imagen según si lo cruza una pared vertical u horizontal, con una precisión del 99,5% por token en el conjunto retenido.
- Percepción visual de mapas de rejilla: entrenado específicamente con laberintos de paredes negras de tamaño 3x4 a 5x5.
- Generación de rutas multi-paso: el LLM produce secuencias de movimientos, aunque en la práctica la ruta diverge de la correcta tras aproximadamente tres movimientos.
- No dispone de tool calling, function calling, modo thinking, audio ni capacidades de agente; la model card no documenta ninguna de ellas.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Investigación en razonamiento espacial visual: el adaptador sirve como banco de pruebas reproducible para estudiar si una señal auxiliar de percepción (wall head) puede guiar la planificación del LLM, comparando ejecuciones con y sin inyección de wall tokens mediante `eval_inject_n100.jsonl` y `eval_no-inject_n100.jsonl`.
- Estudio de arquitecturas de inyección de features: los wall tokens con compuerta aprendible son un patrón transferible a otras tareas donde se quiere condicionar el LLM con predicciones de un módulo auxiliar, y este repo ofrece una implementación de referencia en MLX.
- Evaluación de separación percepción-planificación: con un 99,5% de acierto en paredes frente a un 10% en rutas, el modelo es útil para diagnosticar cuellos de botella en pipelines de razonamiento visual de dos etapas.
- Reproducción de experimentos en hardware de consumo: el entrenamiento completo cabe en una MacBook Air M4 de 24 GB en menos de dos horas, lo que permite replicar y modificar el setup sin acceso a GPUs de datacenter.
- Docencia y divulgación: ejemplo didáctico de fine-tuning con LoRA más cabezas auxiliares sobre un VLM cuantizado, con curvas de pérdida y evaluación por laberinto incluidas.
- Base para extensiones: punto de partida para entrenar con más épocas, más semillas o estilos de laberinto adicionales, dado que la model card identifica explícitamente la falta de generalización como limitación.

## Benchmarks y rendimiento

Resultados sobre los 100 laberintos retenidos (fold 0) del conjunto MazePlanning, según la model card:

| Metrica | Wall tokens on | Wall tokens off |
|---|---|---|
| Ruta correcta | 10% | 11% |
| Paredes correctas por token (head) | 99,5% | 99,5% |
| Laberintos con todas las paredes correctas | 87% | 87% |
| Bola sobre las paredes de la head alcanza la meta en la ruta real | 90% | 90% |
| Ruta correcta en zero-shot (sin entrenamiento) | 0% | 0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB (13,1M parámetros en float32); el requisito real lo marca el modelo base Qwen3-VL-4B en 8 bits, que debe cargarse por separado.
- Entrenamiento verificado en una MacBook Air M4 con 24 GB de memoria unificada, en aproximadamente 1 h 50 min para una época sobre 400 laberintos.
- Al estar en formato MLX, la inferencia y el entrenamiento están orientados a Apple Silicon; no se documenta soporte para CUDA.
- Opciones de despliegue: únicamente mediante `train_wallhead.py` del repositorio del proyecto (`baselines/wall_reasoning/`), colocando `weights.safetensors` en `baselines/outputs/wallhead_4b/`. La carga estándar de adaptadores de `mlx_vlm` no funciona porque los pesos incluyen la wall head personalizada.
- VRAM estimada para GPU dedicada, latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-4B maze wallhead (este) | 13,1M adaptador sobre base 4B | no disponible | Laberintos, ruta y paredes | no disponible | Hugging Face, MLX |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible en la informacion | VLM generalista | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en razonamiento espacial | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de razonamiento espacial sobre laberintos en la documentación proporcionada.

## Limitaciones y advertencias

- Rendimiento de ruta bajo: solo el 10-11% de los laberintos retenidos se resuelven correctamente, y la ruta falla tras unos tres movimientos.
- La señal de los wall tokens no se aprovecha: los resultados con inyección activada y desactivada son idénticos, con una compuerta que apenas alcanza 0,06.
- Generalización muy limitada: entrenado y evaluado con un único estilo de laberinto (paredes negras, tamaños 3x4 a 5x5); otros estilos y tamaños no se han probado.
- Entrenamiento reducido: 400 laberintos, una época y una sola semilla, sin validación cruzada sobre hiperparámetros.
- Contaminación de benchmark: los laberintos de entrenamiento provienen del conjunto de test del mismo benchmark (folds distintos), por lo que no deben reportarse resultados sobre ese benchmark como datos no vistos.
- Licencia no especificada: no se indica licencia del adaptador ni del modelo base en la información disponible, lo que impide evaluar su uso comercial.
- Carga no estándar: requiere el script del proyecto, lo que añade fricción de integración y riesgo de rotura si cambia el código.
- Riesgo de alucinación en la ruta: el modelo genera secuencias de movimientos plausibles que pueden no corresponder a un camino válido, dado que la planificación no está resuelta.
- Idiomas y sesgos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanika7777/qwen3vl-4b-maze-wallhead
- Modelo base: https://huggingface.co/mlx-community/Qwen3-VL-4B-Instruct-8bit
- Repositorio del proyecto Visual Internal Reasoning (NU Launch Labs), ruta `baselines/wall_reasoning/`: no disponible en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
