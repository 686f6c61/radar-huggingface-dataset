# Aster2024/swift-step-probe-qwen3-8b

## Resumen

SWIFT step probe para Qwen3-8B es un verificador de pasos ligero (process reward model, PRM) construido sobre el modelo Qwen3-8B congelado de Alibaba. No se trata de un modelo generativo independiente, sino de una cabeza lineal con compuerta (gated linear head) de solo 32.770 parámetros que se aplica sobre los últimos 4 estados ocultos (hidden states) del transformer congelado. Dado un problema y una solución paso a paso, el probe asigna una puntuación a cada paso y predice el primer paso incorrecto (o `-1` si no detecta error).

El modelo resuelve un problema concreto en el ámbito del razonamiento matemático: la identificación del primer error en cadenas de razonamiento (first-error identification), evaluada sobre el benchmark ProcessBench. A diferencia de los PRM que puntúan las generaciones del propio modelo, aquí el LLM congelado actúa como lector de soluciones escritas por otros modelos (GPT-4 en el entrenamiento, doce modelos Qwen2/2.5 y Llama-3/3.1 en la evaluación).

Es relevante por su eficiencia extrema: entrena únicamente 32.770 parámetros sobre un backbone de 8.000 millones congelado, lo que permite reutilizar el mismo Qwen3-8B para generación y verificación sin duplicar el coste de inferencia del backbone. El checkpoint se publica con licencia Apache 2.0 y está vinculado al paper SWIFT (arXiv:2505.12225, aceptado en KDD 2026).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza lineal con compuerta (gated linear head) sobre hidden states de un transformer decoder congelado (Qwen3-8B) |
| Parámetros totales | 32.770 (solo el probe); backbone Qwen3-8B congelado |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Heredada del backbone Qwen3-8B; lotes de entrenamiento de hasta 16.384 tokens |
| Tipos de cuantización | No disponible (los pesos del probe son safetensors en precisión de entrenamiento) |
| Idiomas soportados | No disponible (el backbone Qwen3-8B es multilingüe, pero el probe se entrena solo con PRM800K en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`probe.safetensors` con `fused_layer.weight` de 2 × 16384 y `fused_layer.bias` de 2) |

## Arquitectura y entrenamiento

El probe es una cabeza lineal con compuerta que consume los estados ocultos de las capas 33 a 36 de Qwen3-8B (índices de hidden state 33–36, es decir, los últimos 4 estados ocultos), con dimensión de característica de 16384 por capa (2 × 16384 en el peso fusionado). Para cada paso de la solución, el modelo calcula una recompensa por token y la agrega mediante una media con compuerta, produciendo una puntuación por paso. El primer paso cuya probabilidad cae por debajo del umbral almacenado (0,45, elegido sobre el split de desarrollo) se marca como el error más temprano.

El entrenamiento usa los splits de entrenamiento de las fases 1 y 2 de PRM800K, eliminando cualquier problema que aparezca en ProcessBench (en cualquier subconjunto): 236.068 muestras de entrenamiento y 12.469 de desarrollo, divididas por problema. Las etiquetas se derivan de las valoraciones de PRM800K (+1/0 → correcto, −1 → incorrecto) y cada solución se trunca tras su primer paso incorrecto. Se realiza una época con pérdida BCE a nivel de paso, optimizador AdamW (lr 1e-4, weight decay 1e-5), semilla 42 fijada antes del entrenamiento y lotes de como máximo 16.384 tokens. El backbone Qwen3-8B permanece completamente congelado durante todo el proceso.

## Capacidades

- Verificación de pasos en cadenas de razonamiento matemático: asigna una puntuación a cada paso de una solución dada.
- Identificación del primer error (first-error identification): devuelve el índice del primer paso por debajo del umbral o `-1` si no detecta error.
- Lectura de soluciones de terceros: entrenado con soluciones de GPT-4 (PRM800K) y evaluado con soluciones de doce modelos Qwen2/2.5 y Llama-3/3.1.
- Puntuación a nivel de token agregada por paso mediante media con compuerta.
- Reutilización del mismo backbone congelado para generación y verificación, sin coste adicional de un segundo modelo grande.
- No soporta tool calling, function calling, agentes ni modos de pensamiento propios: es un verificador, no un generador.
- Capacidades multilingües: no disponibles de forma específica; el entrenamiento es en inglés (PRM800K).

## Casos de uso

- Verificación de soluciones matemáticas en pipelines de evaluación: dado un problema y una solución generada por otro modelo, el probe marca el primer paso incorrecto, lo que permite filtrar respuestas defectuosas antes de entregarlas al usuario.
- Selección de respuestas (best-of-N) con verificación de proceso: en lugar de un reward model de resultado, se puntúa cada paso de las N candidatas y se elige la que supera la verificación completa, con un coste adicional mínimo al compartir el backbone Qwen3-8B.
- Anotación automática de datos de razonamiento: el probe puede preetiquetar pasos correctos e incorrectos en grandes corpus de soluciones para su posterior revisión humana, reduciendo el coste de anotación.
- Monitorización en producción de asistentes matemáticos: integrado como etapa de control de calidad que detecta razonamientos defectuosos antes de mostrarlos, con la ventaja de que el modelo base ya está desplegado para generación.
- Investigación en process reward models: al publicarse con semilla fija, umbral y resultados de tres semillas, sirve como línea base reproducible para comparar nuevos PRM sobre ProcessBench.
- Destilación y entrenamiento de modelos pequeños: las puntuaciones por paso pueden usarse como señal de recompensa densa para afinar modelos generadores de menor tamaño en tareas de matemáticas.
- Análisis de errores de modelos de terceros: permite comparar qué tipos de pasos fallan más en distintos generadores (Qwen2/2.5 frente a Llama-3/3.1) sobre los mismos problemas de ProcessBench.

## Benchmarks y rendimiento

Resultados en ProcessBench (métrica oficial, umbral elegido en desarrollo) para el checkpoint publicado y las otras dos semillas:

| Semilla | GSM8K | MATH | OlympiadBench | Omni-MATH | Avg. F1 | Step AUC |
|---|---|---|---|---|---|---|
| 42 (este checkpoint) | 36,8 | 31,5 | 23,9 | 23,6 | 28,9 | 0,776 |
| 43 | 34,7 | 32,1 | 22,9 | 21,2 | 27,7 | 0,777 |
| 44 | 39,8 | 28,4 | 18,6 | 17,3 | 26,0 | 0,753 |

Media de las tres semillas: 27,6 (desviación típica 1,5). Un bootstrap a nivel de ítem sitúa el intervalo de confianza del 95 % en aproximadamente ±1,9 puntos sobre el F1 medio de un único checkpoint.

## Requisitos de hardware

- El probe en sí ocupa unos pocos kilobytes (32.770 parámetros en safetensors), pero requiere ejecutar el backbone Qwen3-8B congelado para extraer los hidden states de las capas 33–36.
- VRAM estimada para inferencia: la del backbone Qwen3-8B. En FP16/BF16, aproximadamente 16 GB de pesos más caché KV y activaciones; en cuantización de 8 bits, alrededor de 8–9 GB; en 4 bits, alrededor de 5–6 GB (estimaciones para el backbone, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y evaluación de ProcessBench completa; RTX 4090 (24 GB) suficiente para el backbone en BF16 con lotes moderados.
- Cabe en GPU de consumo: sí, el backbone Qwen3-8B en cuantización de 4–8 bits entra en RTX 3090/4090 y en GPUs de 12–16 GB con cuantización agresiva.
- Opciones de despliegue: el repositorio proporciona `step/eval_processbench.py` en la rama `step-probe` de SWIFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para el probe.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SWIFT step probe (este) | PRM de verificación de pasos sobre Qwen3-8B congelado | 32.770 (probe) + 8B (backbone) | Heredado de Qwen3-8B | Apache 2.0 | Hugging Face + GitHub (rama `step-probe`) |
| PRM800K / Let's Verify Step by Step (OpenAI) | PRM de verificación de pasos | No disponible | No disponible | No disponible | Datos y metodología públicos; pesos no publicados |
| Qwen2.5-Math-PRM (Alibaba) | PRM específico para matemáticas | No disponible en la información | No disponible | No disponible | Hugging Face |
| Math-Shepherd | PRM con verificación automática de pasos | No disponible | No disponible | No disponible | Repositorio público |

No se dispone de resultados comparativos directos de estos modelos sobre ProcessBench en la información proporcionada, por lo que no se incluyen cifras de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Es un verificador, no un generador: no produce texto ni respuestas; solo puntúa pasos de soluciones existentes.
- Entrenado exclusivamente con PRM800K (soluciones de GPT-4 en inglés) y evaluado con soluciones de Qwen2/2.5 y Llama-3/3.1; su generalización a otros generadores o dominios no matemáticos no está documentada.
- El umbral (0,45) se fija sobre el split de desarrollo; un cambio de dominio o de distribución de soluciones puede degradar la calibración.
- Alta varianza entre semillas: el F1 medio varía entre 26,0 y 28,9 según la semilla, con un intervalo de confianza de ±1,9 puntos; los resultados de un único checkpoint deben interpretarse con cautela.
- Rendimiento modesto en subconjuntos difíciles: F1 de 23,9 en OlympiadBench y 23,6 en Omni-MATH en el checkpoint publicado.
- Riesgo de falsos positivos y negativos en la detección del primer error; el autor incluye un barrido de umbral en `processbench_results.json` solo con fines diagnósticos.
- Idiomas: no se documenta soporte multilingüe del probe; el backbone Qwen3-8B es multilingüe, pero la cabeza se entrena solo con datos en inglés.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse también la licencia del backbone Qwen3-8B subyacente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aster2024/swift-step-probe-qwen3-8b
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Código, entrenamiento y evaluación (rama `step-probe`): https://github.com/aster2024/SWIFT/tree/step-probe/step
- Paper SWIFT (arXiv:2505.12225): https://arxiv.org/abs/2505.12225
- Dataset PRM800K: https://github.com/openai/prm800k
