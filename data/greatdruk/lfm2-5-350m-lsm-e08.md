# GreatDruk/lfm2.5-350m-lsm-e08

## Resumen

LFM2.5-350M LSM e08 es un ajuste fino supervisado completo (SFT) del checkpoint LiquidAI/LFM2.5-350M, publicado por el usuario GreatDruk en Hugging Face. El modelo conserva la arquitectura y el tamaño del checkpoint original de Liquid AI (354.483.968 parámetros, aproximadamente 350 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,7 GB. La model card indica que el ajuste se realizó sobre datos públicos de GSM8K, MMLU-Pro e IFEval, incluyendo ejemplos de test públicos, lo que implica solapamiento entre entrenamiento y evaluación.

La relevancia de esta ficha es doble. Por un lado, documenta una variante concreta de la familia LFM2.5 de Liquid AI, pensada para despliegue en entornos con recursos limitados. Por otro, advierte de una práctica metodológica problemática: el autor reconoce explícitamente que las puntuaciones de replay público incluyen solapamiento con el conjunto de entrenamiento, por lo que cualquier cifra de rendimiento publicada debe interpretarse con cautela y no es comparable con evaluaciones limpias.

No se dispone de información sobre el pipeline de inferencia, los idiomas soportados ni resultados de benchmarks independientes. La licencia es la LFM Open License v1.0, que impone condiciones específicas de uso comercial que deben revisarse antes de cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de LiquidAI/LFM2.5-350M) |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm-open-license-v1.0`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado completo del checkpoint LiquidAI/LFM2.5-350M. No se detalla en la información disponible la arquitectura interna del modelo base (tipo de transformer, mecanismos de atención, uso de capas híbridas o cualquier innovación de eficiencia), por lo que no es posible confirmar si emplea atención lineal, decodificación especulativa u otras técnicas propias de la familia LFM. Tampoco se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la mención a GSM8K, MMLU-Pro e IFEval.

El aspecto metodológico más relevante es que, según la model card, los pesos se modificaron sobre datos públicos de esos tres conjuntos, incluyendo ejemplos de test públicos. El autor reconoce que las puntuaciones de replay público incluyen solapamiento con el entrenamiento. Esto invalida esas cifras como medida de capacidad de generalización y sitúa al modelo en una categoría de riesgo de contaminación de benchmarks. No se menciona el uso de RLHF, DPO ni preferencias humanas en el proceso de ajuste.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base LFM2.5-350M.
- Razonamiento aritmético y matemático, presumiblemente reforzado por el ajuste sobre GSM8K (sin datos verificables de mejora real).
- Respuesta a instrucciones y formato conversacional, presumiblemente influido por el ajuste sobre IFEval.
- Conocimiento enciclopédico y de opción múltiple, presumiblemente influido por el ajuste sobre MMLU-Pro.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Experimentación académica sobre contaminación de benchmarks: el modelo es un caso de estudio útil para analizar cómo el ajuste sobre ejemplos de test infla métricas y para diseñar protocolos de evaluación más robustos.
- Prototipado rápido en local: con 354 millones de parámetros y 0,7 GB de pesos, puede cargarse en una estación de trabajo sin GPU dedicada para pruebas de formato de salida y comportamiento conversacional básico.
- Generación de texto de bajo coste en entornos embebidos o edge: el tamaño reducido permite ejecución en CPU o en GPUs de gama baja, útil para demos y pruebas de concepto.
- Filtrado y clasificación de texto simple: tareas de etiquetado o resumen corto donde el contexto requerido sea limitado y no se dependa de razonamiento profundo.
- Evaluación comparativa de técnicas de SFT: sirve como referencia para medir el impacto de ajustes supervisados sobre conjuntos públicos frente al checkpoint original.
- Educación y divulgación: ejemplo práctico para explicar en un blog o curso los riesgos de solapamiento entre entrenamiento y evaluación en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks independientes en la información disponible. La model card menciona puntuaciones de replay público sobre GSM8K, MMLU-Pro e IFEval, pero el propio autor advierte que incluyen solapamiento con el entrenamiento, por lo que no se reproducen aquí como métricas válidas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB de pesos más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,4 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,2 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también cabe en A100/H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en CPU.
- Opciones de despliegue: al ser safetensors, requiere conversión a GGUF para llama.cpp u Ollama; es compatible con transformers, vLLM y TGI si la arquitectura del modelo base está soportada por esas herramientas (no confirmado en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GreatDruk/lfm2.5-350m-lsm-e08 | 354.483.968 | no disponible | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM2.5-350M (base) | ~350M | no disponible | LFM Open License v1.0 | Hugging Face |
| Qwen2.5-0.5B | ~500M | no disponible en esta ficha | Apache 2.0 (según versión) | Hugging Face |
| SmolLM2-360M | ~360M | no disponible en esta ficha | Apache 2.0 (según versión) | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de menos de 500 millones de parámetros) es limitada porque no se dispone de datos de contexto ni de benchmarks limpios para este ajuste. El checkpoint base de Liquid AI es la referencia más directa y la única con la que se puede comparar sin sesgo de contaminación.

## Limitaciones y advertencias

- Contaminación de benchmarks: el ajuste incluye ejemplos de test públicos de GSM8K, MMLU-Pro e IFEval, y el autor reconoce solapamiento con las puntuaciones de replay. Cualquier métrica publicada sobre esos conjuntos está inflada y no es comparable con evaluaciones limpias.
- Riesgo de sobreajuste a los formatos de esos tres conjuntos, con posible degradación en tareas fuera de distribución.
- Riesgo de alucinación inherente a un modelo de 350 millones de parámetros, especialmente en razonamiento multi-paso y conocimiento factual.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia.
- Licencia LFM Open License v1.0: impone condiciones específicas para uso comercial que deben revisarse; no es una licencia permisiva tipo Apache o MIT.
- Procedencia y mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni documentación adicional; no hay garantía de soporte.
- No se han publicado evaluaciones independientes ni auditorías de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GreatDruk/lfm2.5-350m-lsm-e08
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia LFM Open License v1.0: no disponible enlace directo en la información proporcionada
- Paper, blog o repositorio del ajuste: no disponible
