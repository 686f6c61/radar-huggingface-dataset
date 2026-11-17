# noahmclaughlin/Mixed-Messenger-4B

## Resumen

Mixed-Messenger-4B es un adaptador especializado construido sobre el modelo base `mlx-community/Qwen3-4B-Instruct-2507-4bit`, desarrollado por el usuario noahmclaughlin. No se trata de un modelo de lenguaje generativo al uso, sino de un predictor de distribuciones de respuesta para la audiencia del juego "Mixed Messages". El modelo recibe un tema de competición y devuelve una distribución de probabilidad sobre cuatro categorías de respuesta: performed+uniting, honest+uniting, performed+dividing y honest+dividing.

La relevancia del modelo reside en su enfoque metodológico: combina un readout softmax regularizado sobre representaciones del modelo base con un adaptador LoRA de rango 8 entrenado sobre las últimas ocho capas del transformer, y promedia ambos predictores. El resultado es una mejora medible de +4,00 puntos sobre el modelo base en el benchmark RTR-bench, con una reducción del 24,5% en el error cuadrático de distribución.

El modelo está diseñado exclusivamente para Apple Silicon mediante MLX y requiere el modelo base pinned de 4 bits (aproximadamente 2,26 GB). No es un checkpoint autónomo de Transformers ni un adaptador de generación de texto convencional; su uso requiere el script `predict.py` incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptador LoRA y readouts lineales |
| Parametros totales | Aproximadamente 4 mil millones (modelo base) + 3.670.016 parametros del adaptador LoRA + 30.728 coeficientes en readouts |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (modelo base pinned); el adaptador se distribuye en formato MLX |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (adaptador y readouts); requiere el base `mlx-community/Qwen3-4B-Instruct-2507-4bit` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507 cuantizado a 4 bits en formato MLX. Sobre esta base congelada se entrenan dos componentes. El primero es un readout softmax regularizado de cuatro probabilidades ajustado sobre las representaciones medias de la capa final, seleccionado mediante validación cruzada agrupada de cinco pliegues sobre 90 ventanas de referencia. El segundo es un adaptador LoRA de rango 8 con escala 16 aplicado a las últimas ocho capas del transformer, entrenado con Adam a una tasa de aprendizaje de 2e-6, batch size 1 y semilla MLX 7, minimizando el error cuadrático contra las cuotas reales de la multitud sin redondear. El checkpoint seleccionado es el paso 30, con 3.670.016 parámetros entrenados.

Adicionalmente se ajusta un readout residual independiente que utiliza las representaciones medias de las capas 18 y 36 del Qwen original junto con la mitad de su vector de probabilidad generado. La salida final es el promedio fijo e igual de ambos predictores (el de LoRA de probabilidad y el residual), con proyección sobre el símplex de probabilidad. El peso de la mezcla no se ajustó sobre etiquetas de desarrollo. Los pesos originales del modelo base permanecen intactos; se trata de una adición aprendida pequeña sobre un modelo preentrenado de aproximadamente 4 mil millones de parámetros, no de un entrenamiento desde cero.

## Capacidades

- Predicción de distribución de probabilidad sobre cuatro categorías de respuesta de la audiencia de Mixed Messages (performed+uniting, honest+uniting, performed+dividing, honest+dividing).
- Generación de un vector de probabilidad válido directamente, sin reparación de salida generada.
- Utilización de generación greedy del modelo base (semilla 7, límite de 8.000 tokens) como característica interna.
- Validación estricta de la salida mediante un validador de formato incluido en el código.
- Soporte de inferencia local en Apple Silicon mediante MLX, sin API alojada.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Predicción de respuestas de audiencia en el juego Mixed Messages: el modelo recibe un tema de competición y devuelve la distribución de probabilidad esperada sobre las cuatro categorías, permitiendo a investigadores y jugadores estimar el comportamiento de la audiencia histórica.
- Investigación en modelado de comportamiento de multitudes: el pipeline permite estudiar cómo las representaciones de un LLM capturan patrones de respuesta humana en un dominio acotado, con métricas reproducibles y validación cruzada agrupada.
- Evaluación de técnicas de adaptación supervisada: el repositorio documenta un flujo completo de congelación del base, extracción de representaciones, ajuste de readouts y entrenamiento LoRA, útil como referencia metodológica para experimentos similares.
- Benchmarking de modelos pequeños en tareas de predicción estructurada: RTR-bench proporciona 165 ventanas con particiones de referencia, desarrollo y evaluación final, lo que permite comparar enfoques de adaptación de forma controlada.
- Reproducibilidad de experimentos en Apple Silicon: el script `predict.py` y el archivo de dependencias pinned permiten reproducir exactamente el entorno de noviembre de 2026 (M2 MacBook Air, 16 GiB, MLX 0.32.4, MLX LM 0.32.2).
- Análisis de calibración de distribuciones: la métrica de puntuación (100 × (1 − error cuadrático medio de cuatro probabilidades / 2)) y los intervalos bootstrap pareados permiten evaluar la calibración del modelo frente a baselines uniformes y de distribución media de referencia.

## Benchmarks y rendimiento

| Predict, 45 ventanas de evaluación | Puntuación / 100 |
|---|---:|
| Qwen3-4B local base original | 83,63 |
| **Mixed-Messenger** | **87,63** |
| Baseline de probabilidad uniforme | 85,39 |
| Baseline de distribución media de referencia | 85,56 |

La ganancia es de +4,00 puntos, equivalente a una reducción del 24,5% en el error cuadrático de distribución. El intervalo bootstrap pareado exploratorio del 95% para la ganancia de puntuación es de +1,37 a +6,34 puntos (2.000 remuestreos agrupados por entidad, semilla upstream 7). Predicciones válidas: base 45/45; Mixed-Messenger 45/45. Las puntuaciones no son porcentaje de acierto: score = 100 × (1 − error cuadrático medio de cuatro probabilidades / 2). Los criterios de candidato y mejora se congelaron antes de la primera evaluación final; las etiquetas finales no se usaron para entrenamiento ni selección. Las puntuaciones de desarrollo fueron 80,79 → 84,25, pero son optimistas por la selección exploratoria extensiva.

## Requisitos de hardware

- VRAM/unified memory estimada: pico de asignación MLX de 5,27 GB reportado por el allocator (no es RAM total del sistema).
- GPU recomendadas: Apple Silicon (probado en M2 MacBook Air con 16 GiB de memoria unificada). No se ha validado en GPUs NVIDIA ni AMD.
- Cabe en consumer GPU: sí, en Apple Silicon con al menos 16 GiB de memoria unificada; el base pinned ocupa aproximadamente 2,26 GB.
- Opciones de despliegue: MLX (MLX 0.32.4, MLX LM 0.32.2) mediante el script `predict.py` incluido. No compatible con vLLM, llama.cpp, Ollama ni TGI en el formato distribuido.
- Latencia y throughput: 10,7 segundos por tema en M2 MacBook Air con 16 GiB; el modelo realiza generación greedy del base más dos pasadas adicionales de representación. No se dispone de datos de throughput en otros hardware.
- Entorno probado: Python 3.12, NumPy 2.5.4, Transformers 5.23.0, noviembre de 2026.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mixed-Messenger-4B | ~4B (base) + 3,7M (LoRA) + 30.728 (readouts) | No disponible | Predicción de distribución de audiencia sobre Qwen3-4B | Apache 2.0 | Hugging Face (MLX) |
| Qwen3-4B-Instruct-2507 (base) | ~4B | No disponible | LLM generativo generalista | Apache 2.0 | Hugging Face |
| Baseline uniforme | No aplica | No aplica | Distribución uniforme sobre 4 categorías | No aplica | Referencia del benchmark |
| Baseline de distribución media | No aplica | No aplica | Distribución media de referencia | No aplica | Referencia del benchmark |

No se dispone de comparación con otros adaptadores especializados en la misma tarea dentro de la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un checkpoint autónomo de Transformers ni un adaptador de generación de texto convencional; cargar solo el adaptador en una aplicación de chat no reproduce los resultados.
- Requiere el modelo base pinned `mlx-community/Qwen3-4B-Instruct-2507-4bit` (aproximadamente 2,26 GB) y el script `predict.py`, que combina todos los componentes entrenados.
- Solo se ha evaluado la tarea Predict; no hay afirmación de rendimiento del agente Learn.
- Es adaptación supervisada de audiencia, no una entrada zero-shot a un leaderboard ni una comparación controlada solo de adaptador; el especialista ha aprendido de resultados históricos de audiencia y usa más cómputo de inferencia que el base.
- Las puntuaciones de desarrollo (80,79 → 84,25) son optimistas debido a la selección exploratoria extensiva.
- El modelo solo soporta inglés y está limitado al dominio específico de Mixed Messages; no es un modelo de propósito general.
- Riesgo de alucinación no aplica en el sentido habitual, pero la salida es una distribución de probabilidad sobre cuatro categorías fijas, no texto libre.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 también debe cumplir su propia licencia.
- La implementación carga una copia original y una adaptada del mismo backbone Qwen, lo que duplica el uso de memoria respecto a una sola copia.
- El código verifica los hashes de adaptador y readouts en tiempo de carga; para reproducibilidad exacta debe fijarse la revisión del repositorio con `hf download --revision <commit>`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noahmclaughlin/Mixed-Messenger-4B
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Dataset RTR-bench (mirror en Hugging Face): https://huggingface.co/datasets/noahmclaughlin/RTR-bench
- RTR-bench GitHub (commit pinned): https://github.com/1999labs/RTR-bench/tree/8338f6daf4b5b685ae97db344f3e7a329fba7ca8
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio MLX LM: https://github.com/ml-explore/mlx-lm
