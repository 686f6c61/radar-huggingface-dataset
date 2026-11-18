# noahmclaughlin/Mixed-Messenger-Qwen3-4B-LoRA

## Resumen

Mixed-Messenger-4B es un adaptador LoRA especializado en MLX, desarrollado por noahmclaughlin, que predice la distribución de respuestas de cuatro vías de la audiencia de "Mixed Messages" (un experimento de comunicación). Se construye sobre el modelo base `mlx-community/Qwen3-4B-Instruct-2507-4bit` y no es un checkpoint autónomo de Transformers ni un adaptador de generación de texto convencional: requiere código de inferencia personalizado (`predict.py`) y el modelo base fijado en 4 bits para reproducir sus resultados.

El modelo resuelve un problema de predicción de audiencia: dado un tema de competición, estima las probabilidades de cuatro combinaciones de comportamiento (performed+uniting, honest+uniting, performed+dividing, honest+dividing). Emplea una arquitectura de dos componentes: un readout softmax regularizado sobre representaciones de la última capa de Qwen, y un LoRA de rango 8 entrenado en las últimas ocho capas del transformer, combinados mediante un promedio fijo igualitario.

Es relevante por su enfoque metodológico: separa explícitamente la adaptación supervisada de la evaluación zero-shot, con criterios de mejora congelados antes de la evaluación final y un intervalo de confianza bootstrap pareado. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y está licenciado bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8) sobre Qwen3-4B-Instruct-2507, más readout softmax y readout residual; inferencia en MLX |
| Parametros totales | Aproximadamente 4 mil millones (modelo base); adaptador LoRA: 3.670.016 parametros entrenados; readouts: 30.728 coeficientes/sesgos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el base Qwen3-4B-Instruct-2507 tiene contexto nativo, pero no se especifica en la informacion) |
| Tipos de cuantizacion | Base fijado en 4 bits (mlx-community/Qwen3-4B-Instruct-2507-4bit); adaptador en precision MLX nativa |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (adaptador y readouts); requiere el base 4-bit de MLX; no es safetensors ni GGUF estándar |

## Arquitectura y entrenamiento

El modelo combina dos predictores. Primero, un readout softmax regularizado de cuatro probabilidades ajustado sobre representaciones medias de la última capa del Qwen congelado, seleccionado mediante validación cruzada agrupada de cinco pliegues dentro de las 90 ventanas de referencia. Segundo, un LoRA de rango 8 (escala 16, Adam a 2e-6, batch size 1, semilla MLX 7) entrenado sobre las últimas ocho capas del transformer, minimizando el error cuadrático contra las cuotas reales sin redondear de la multitud; el checkpoint seleccionado es el paso 30 (3.670.016 parámetros). Además, se ajusta un readout residual regularizado usando representaciones medias de las capas 18 y 36 del Qwen original y la mitad de su vector de probabilidad generado, con proyección al símplex de probabilidad.

La salida final es el promedio fijo igualitario de ambos predictores (el peso de mezcla no se ajustó sobre etiquetas de desarrollo). El base original genera probabilidades con decodificación greedy, semilla 7 y límite de 8.000 tokens; su vector de probabilidad válido se usa como característica interna (si es inválido, se sustituye por uniforme). Los pesos del base no se modifican. El entrenamiento se realizó localmente en Apple Silicon (M2 MacBook Air, 16 GiB de memoria unificada, Python 3.12, MLX 0.32.4, MLX LM 0.32.2, NumPy 2.5.4, Transformers 5.23.0).

## Capacidades

- Predicción de distribución de audiencia en cuatro vías (performed+uniting, honest+uniting, performed+dividing, honest+dividing) para temas de competición.
- Generación de vectores de probabilidad válidos directamente, sin reparación de salida generada.
- Inferencia local en Apple Silicon sin API alojada.
- Verificación de hashes de adaptador y readouts en tiempo de carga para reproducibilidad.
- No es un modelo de chat general ni un adaptador de generación de texto ordinario.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento multi-turno de propósito general.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción de respuesta de audiencia en experimentos de comunicación: dado un tema de competición, el modelo estima la distribución de cuatro comportamientos de la audiencia, útil para investigadores que estudian dinámicas de audiencia en entornos controlados.
- Evaluación de campañas de mensajes: permite anticipar cómo se distribuirá la audiencia entre respuestas performativas/honestas y uniting/dividing antes de lanzar un mensaje, con una puntuación de error cuadrático medio medible.
- Investigación en adaptación supervisada: sirve como caso de estudio reproducible de cómo separar adaptación de evaluación zero-shot, con criterios congelados e intervalos bootstrap pareados.
- Reproducción de benchmarks: el código `predict.py` y los hashes permiten replicar exactamente los resultados del benchmark RTR-bench en un entorno MLX fijado.
- Análisis de sensibilidad de modelos base: al comparar el base Qwen3-4B (83,63/100) con el especialista (87,63/100), se puede estudiar cuánto aporta la adaptación supervisada frente a baselines simples (uniforme 85,39; media de referencia 85,56).
- Desarrollo de pipelines de inferencia local en Apple Silicon: el ejemplo de 10,7 segundos por tema y 5,27 GB de asignación máxima de MLX sirve como referencia para desplegar adaptadores LoRA pequeños en portátiles con memoria unificada.
- Docencia y experimentación con LoRA en MLX: el repositorio documenta paso a paso el entrenamiento (readout, LoRA, readout residual) y puede usarse como material didáctico para cursos de ajuste fino eficiente.

## Benchmarks y rendimiento

| Predict, 45 ventanas de evaluacion | Puntuacion / 100 |
|---|---:|
| Base local original Qwen3-4B | 83,63 |
| **Mixed-Messenger** | **87,63** |
| Baseline de probabilidad uniforme | 85,39 |
| Baseline de distribucion media de referencia | 85,56 |

La ganancia es de +4,00 puntos, o un 24,5% menos de error cuadrático de distribución. El intervalo bootstrap pareado exploratorio del 95% para la ganancia es de +1,37 a +6,34 puntos (2.000 remuestreos agrupados por entidad, semilla upstream 7). Predicciones válidas: base 45/45; Mixed-Messenger 45/45. Estas puntuaciones no son porcentaje de acierto: puntuación = 100 × (1 − error cuadrático medio de cuatro probabilidades / 2). Las puntuaciones de desarrollo fueron 80,79 → 84,25 tras una selección exploratoria extensa, por lo que son optimistas. Solo se evalúa Predict; no hay afirmación sobre el rendimiento del agente Learn.

## Requisitos de hardware

- VRAM estimada: no disponible en términos de VRAM dedicada; en Apple Silicon se reporta una asignación máxima de MLX de 5,27 GB (memoria del asignador, no RAM total del sistema).
- GPU recomendadas: probado en M2 MacBook Air con 16 GiB de memoria unificada; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en Apple Silicon con al menos 16 GiB de memoria unificada; no se confirma para GPU NVIDIA de consumo.
- Opciones de despliegue: MLX 0.32.4 y MLX LM 0.32.2 con `predict.py`; no se soportan vLLM, llama.cpp, Ollama ni TGI de forma nativa.
- Latencia y throughput: 10,7 segundos por tema en promedio en el M2 MacBook Air probado; el base fijado ocupa aproximadamente 2,26 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mixed-Messenger-4B | ~4B (base) + adaptador | No disponible | 87,63/100 en RTR-bench (45 ventanas) | Apache 2.0 | MLX, adaptador + codigo |
| Qwen3-4B-Instruct-2507 (base) | ~4B | No disponible | 83,63/100 en RTR-bench | Apache 2.0 (presumible, no confirmado) | MLX 4-bit, Transformers |
| Baseline uniforme | No aplica | No aplica | 85,39/100 | No aplica | Referencia estadistica |
| Baseline media de referencia | No aplica | No aplica | 85,56/100 | No aplica | Referencia estadistica |

No se dispone de comparación con otros adaptadores LoRA de predicción de audiencia en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint autónomo de Transformers ni un adaptador de generación de texto ordinario; cargar solo el adaptador en una app de chat no reproduce los resultados.
- Requiere el base fijado en 4 bits y el código `predict.py`; no funciona con vLLM, llama.cpp, Ollama ni TGI.
- Solo soporta inglés; no hay capacidades multilingües.
- Las puntuaciones de desarrollo (80,79 → 84,25) son optimistas debido a selección exploratoria extensa; la evaluación final usa criterios congelados, pero el intervalo bootstrap es exploratorio.
- Es adaptación supervisada de audiencia, no una entrada zero-shot de leaderboard ni una comparación controlada solo de adaptador; el especialista ha aprendido de resultados históricos de audiencia y usa más cómputo de inferencia que el base.
- Solo se evalúa Predict; no hay afirmación sobre el rendimiento del agente Learn.
- Riesgo de alucinación: no evaluado explícitamente en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia que debe verificarse por separado.
- Repositorio con 0 descargas y 1 like; madurez y soporte comunitario limitados.
- El modelo base fijado ocupa aproximadamente 2,26 GB y la inferencia requiere 5,27 GB de asignación MLX; no se recomienda para entornos con menos de 16 GiB de memoria unificada.

## Enlaces

- Hugging Face: https://huggingface.co/noahmclaughlin/Mixed-Messenger-Qwen3-4B-LoRA
- Dataset RTR-bench: https://huggingface.co/datasets/noahmclaughlin/RTR-bench
- Repositorio GitHub RTR-bench (commit fijado): https://github.com/1999labs/RTR-bench/tree/8338f6daf4b5b685ae97db344f3e7a329fba7ca8
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
