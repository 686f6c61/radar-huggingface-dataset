# HarleyCooper/grid-policy-mlp-repaired-v4

## Resumen

grid-policy-mlp-repaired-v4 es un modelo de política para aprendizaje por refuerzo desarrollado por HarleyCooper, orientado al entorno de Atari Breakout. No se trata de un modelo de lenguaje: es un perceptrón multicapa (MLP) que mapea observaciones del juego a acciones, y que ha sido sometido a un proceso de edición de pesos mediante una herramienta denominada KimBrainSurgery, descrita por el autor como un "minero de simulaciones de vuelo" que detecta fallos mientras la bola aún asciende.

La relevancia de esta versión (v4) radica en que cierra un punto ciego detectado en la versión v3: la incapacidad de identificar fallos que se originan durante la fase ascendente de la bola. Según la model card, el modelo obtiene una mejora de retorno medio de aproximadamente +3,30 a +3,49 puntos frente al modelo original en evaluaciones pareadas por semilla, tanto en semillas minadas como en semillas completamente vírgenes, lo que el autor presenta como evidencia de que la ganancia no se debe a sobreajuste de la compuerta de aceptación.

El repositorio tiene un tamaño de 0,0 GB, no registra descargas ni likes, y se distribuye bajo licencia MIT. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks estandarizados es muy limitada; los datos que se presentan a continuación provienen exclusivamente de la model card y de los metadatos de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con al menos 3 capas lineales (W1, b1, W2, b2, W3, b3); detalles de activaciones y dimensiones no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política para entorno de RL, no modelo de lenguaje) |
| Tipos de cuantización | no disponible; pesos en float32 |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | `policy_weights.npz` (archivo NumPy con W1, b1, W2, b2, W3, b3 en float32) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas lineales con sesgos (W1/b1, W2/b2, W3/b3), según los tensores declarados en el archivo de pesos. No se especifican las dimensiones de entrada, las unidades ocultas, las funciones de activación ni el número total de parámetros. El modelo opera como política para el entorno Atari Breakout, presumiblemente mapeando el estado del juego (posiblemente una representación en rejilla, dado el nombre "grid-policy") a una distribución de acciones.

El entrenamiento original no está documentado en la información disponible. Lo que sí se describe es el proceso de post-entrenamiento: un bucle de reparación de pesos ("ascent-phase repair loop") implementado en KimBrainSurgery, que combina un minero de simulaciones de vuelo con un editor de forma cerrada restringido y una compuerta de aceptación keep/rollback. La innovación de v4 consiste en que el minero detecta fallos durante la fase ascendente de la bola, un punto ciego que v3 no cubría. La evaluación se realiza de forma pareada por semilla con política greedy, comparando el modelo original con el reparado sobre dos conjuntos: semillas 20000-20999 (17 minadas) y semillas 30000-30999 (completamente intactas).

## Capacidades

- Política de control para Atari Breakout: selecciona acciones a partir del estado del juego.
- Evaluación determinista (greedy) con comportamiento pareado por semilla.
- Detección de fallos durante la fase ascendente de la bola mediante el minero de vuelo (capacidad del proceso de reparación, no del modelo en sí).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de visión más allá de la observación del entorno de juego.
- No dispone de modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en edición de pesos de políticas RL: el modelo sirve como caso de estudio reproducible para evaluar técnicas de reparación de pesos con compuerta keep/rollback sobre una política ya entrenada, comparando retorno medio antes y después.
- Benchmark de métodos de "brain surgery" en RL: permite contrastar la efectividad de distintos mineros de fallos (v3 frente a v4) sobre el mismo entorno y conjunto de semillas, con intervalos de confianza pareados ya publicados.
- Baseline para experimentos de robustez en Breakout: al documentarse explícitamente una clase de fallo residual (~2% de partidas que pasan de 13 a 0), puede usarse como referencia para estudiar qué tipos de fallo resisten la reparación de forma cerrada.
- Estudio de sobreajuste de compuertas de aceptación: la evaluación sobre semillas intactas (30000-30999) permite analizar si las ganancias medidas en semillas minadas generalizan.
- Reproducción de linaje de versiones: comparar v1 (garantía never-worse, +1,08), v3 (+1,83) y v4 (+40% de retorno medio) para entender el compromiso entre garantía de no empeorar y maximización del retorno.
- Docencia y divulgación sobre RL: ejemplo compacto (pesos en un `.npz`) para ilustrar cómo una política MLP puede mejorarse sin reentrenamiento completo mediante edición de pesos.

## Benchmarks y rendimiento

Los únicos datos disponibles son las evaluaciones pareadas por semilla publicadas en la model card (política greedy, comparación por pares de semilla):

| Conjunto de semillas | Original | v4 | Diferencia pareada [IC] | Victorias / derrotas / empates |
|---|---|---|---|---|
| 20000-20999 (17 minadas) | 8,69 | 12,18 | +3,49 [+3,08, +3,90] | 263 / 17 / 720 |
| 30000-30999 (intactas) | 8,89 | 12,19 | +3,30 [+2,89, +3,71] | 253 / 20 / 727 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un MLP en float32 con pesos en un `.npz` de tamaño no especificado, es previsible que quepa en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no disponibles; por la naturaleza del modelo, cualquier GPU con soporte NumPy/CUDA o incluso CPU es suficiente.
- Compatibilidad con GPU consumer: presumiblemente sí en cualquier RTX o superior, aunque no se confirma en la información disponible.
- Opciones de despliegue: carga directa de `policy_weights.npz` con NumPy y ejecución de las multiplicaciones matriciales; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Retorno medio (semillas 20000-20999) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grid-policy-mlp-repaired-v4 | no disponible | no aplica | 12,18 | MIT | HuggingFace (0 descargas) |
| grid-policy-mlp original | no disponible | no aplica | 8,69 | no disponible | Referenciado en la model card |
| grid-policy-mlp v1 | no disponible | no aplica | +1,08 sobre original (never-worse) | no disponible | Referenciado en la model card |
| grid-policy-mlp v3 | no disponible | no aplica | +1,83 sobre original | no disponible | Referenciado en la model card |

No se dispone de información sobre otros modelos comparables de terceros para este entorno y tarea.

## Limitaciones y advertencias

- Clase de fallo residual no corregida: aproximadamente el 2% de las partidas (17-20 por cada 1000) siguen regresando de 13 a 0. Comparten una firma: fallo al preposicionar la pala durante el ascenso de la bola. El minero de vuelo los detecta, pero el editor de forma cerrada no puede corregirlos sin perder más retorno en otros casos.
- Compromiso entre garantía y retorno: el autor indica explícitamente que v1 ofrece garantía never-worse, mientras que v4 maximiza el retorno medio (+40%). Quien necesite la garantía de no empeorar debe elegir v1.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje).
- Limitaciones de contexto o idioma: no aplican; el modelo está acotado al entorno Atari Breakout.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Caveats para producción: no hay evidencia de uso en producción, cero descargas y cero likes; el modelo es un artefacto de investigación con evaluación limitada a dos conjuntos de 1000 semillas cada uno.
- Trazabilidad limitada: no se documentan dimensiones de la red, datos de entrenamiento originales ni hiperparámetros, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HarleyCooper/grid-policy-mlp-repaired-v4
- Repositorio KimBrainSurgery: https://github.com/HarleyCoops/KimiBrainSurgery
