# Denisijcu/vertex-core-debate-gguf

## Resumen

Vertex-Core Debate es un ajuste fino por LoRA del modelo Qwen3-4B-Instruct-2507, desarrollado por Denis Sánchez Leyva (Vertex Coders LLC) y publicado en HuggingFace bajo el identificador `Denisijcu/vertex-core-debate-gguf`. El modelo está especializado en tareas de debate estructurado y se ha entrenado sobre 290 muestras sintéticas generadas a partir de debates entre modelos propios de la arena Vertex Chat, filtradas mediante un juez automático (qwen3:8b) y un filtro de historial contaminado. El resultado es un modelo conversacional de 4.022 millones de parámetros orientado a mantener posturas argumentadas, incluyendo la adopción de roles como abogado del diablo.

El modelo parte de Vertex-Core v10, que a su vez es un LoRA fusionado sobre Qwen3-4B-Instruct-2507, y añade un nuevo adaptador LoRA con rango 16, alpha 32, dos épocas y learning rate 1e-4, calculando la pérdida únicamente sobre la respuesta. La relevancia actual reside en su enfoque vertical: no pretende ser un asistente generalista, sino una pieza especializada para dinámicas de debate y argumentación en castellano, con licencia Apache 2.0 y pesos disponibles tanto en safetensors como en GGUF (cuantización Q4_K_M).

El repositorio tiene un tamaño de 2,6 GB y registra 56 descargas en el momento de la consulta, con fecha de creación en octubre de 2026. La información pública sobre benchmarks estandarizados es muy limitada: el autor solo reporta métricas internas de evaluación sobre 35 debates no vistos, sin resultados de MMLU, HumanEval, GSM8K ni otras suites convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) con adaptador LoRA fusionado |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M (publicado); safetensors en precisión original |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.022 millones de parámetros. Sobre esa base se aplicó primero el ajuste Vertex-Core v10 (LoRA fusionado) y posteriormente un nuevo adaptador LoRA con rango 16, alpha 32, dos épocas de entrenamiento y learning rate 1e-4. La pérdida se calcula exclusivamente sobre la respuesta generada, lo que concentra el aprendizaje en el estilo y contenido de la contestación y no en la reproducción del contexto.

El dataset de entrenamiento consta de 290 muestras sintéticas limpias extraídas de debates entre modelos propios de la arena Vertex Chat. El proceso de filtrado combina filtros de forma, un juez automático basado en qwen3:8b y un filtro de historial contaminado. La evaluación se realizó de forma separada sobre 35 muestras de debates no vistos, reportando una pérdida de evaluación de 1,497 en la época 1 y 1,481 en la época 2. No se documenta el número total de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en español con estilo argumentativo y orientado al debate.
- Mantenimiento de posturas y roles, incluido el rol de abogado del diablo, con defensa de posiciones más extremas que la versión v10.
- Coherencia de identidad sin system prompt: responde consistentemente como Vertex-Core en las tres preguntas de identidad evaluadas.
- Reducción de cifras inventadas: en la evaluación sobre 35 debates no vistos, el modelo reportó 0 respuestas con cifras ausentes en los datos, frente a 1 en la versión v10.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.

## Casos de uso

- Debate estructurado entre dos instancias del modelo: al estar entrenado sobre debates de la arena Vertex Chat, puede utilizarse como contrincante o moderador en dinámicas de argumentación con turnos alternos, manteniendo posturas coherentes a lo largo de la conversación.
- Generación de contraargumentos en herramientas de edición o escritura: el modelo puede producir réplicas argumentadas a un texto dado, útil para entrenar a redactores o para enriquecer borradores con objeciones razonadas.
- Simulación de abogado del diablo en sesiones de revisión de decisiones: su tendencia a defender posturas más extremas que la v10 lo hace adecuado para forzar la exploración de escenarios adversos en reuniones o análisis de riesgos.
- Creación de datos sintéticos de debate: dado que el propio modelo se entrenó con datos sintéticos filtrados, puede emplearse para generar nuevos pares de argumento-réplica en español que alimenten posteriores ajustes finos.
- Asistente de práctica argumentativa para estudiantes: permite ensayar réplicas y refutaciones en castellano con un contrincante que mantiene el rol asignado y evita inventar cifras, una limitación relevante en contextos académicos.
- Prototipado de chatbots de opinión o foros: con licencia Apache 2.0 y pesos GGUF Q4_K_M, puede desplegarse en entornos de bajo coste para experimentar con agentes que sostienen una línea argumental definida.
- Evaluación comparativa de modelos de debate: sirve como referencia especializada para medir la calidad argumentativa de otros modelos en español dentro de pipelines de evaluación internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas internas de evaluación sobre 35 debates no vistos:

| Métrica | Vertex-Core v10 | Vertex-Core Debate |
|---|---|---|
| Respuestas con cifras ausentes en los datos (35 debates) | 1 | 0 |
| Identidad sin system prompt (3 preguntas) | Vertex-Core | Vertex-Core |
| Pérdida de evaluación (época 1 → 2) | No disponible | 1,497 → 1,481 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8 GB para los 4.022 millones de parámetros, más overhead de contexto y KV cache.
- VRAM estimada con la cuantización GGUF Q4_K_M publicada: en torno a 2,5-3 GB de pesos, lo que permite ejecución en GPUs de consumo con 4-6 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para FP16; A100 o H100 no son necesarias para este tamaño, aunque pueden emplearse para servir múltiples instancias.
- Cabe en GPUs de consumo: sí, especialmente con la cuantización Q4_K_M; en FP16 requiere al menos 8 GB de VRAM dedicada.
- Opciones de despliegue: llama.cpp y Ollama para el archivo GGUF; vLLM o TGI para los pesos safetensors; también compatible con endpoints según la etiqueta del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vertex-Core Debate | 4.022 millones | No disponible | Debate en español | Apache 2.0 | HuggingFace (safetensors + GGUF) |
| Qwen3-4B-Instruct-2507 | 4.022 millones | No disponible | Asistente generalista | Apache 2.0 | HuggingFace |
| Vertex-Core v10 | 4.022 millones | No disponible | Asistente Vertex-Core | Apache 2.0 (según base) | Referenciado por el autor |
| Qwen3-8B | 8.000 millones (aprox.) | No disponible | Asistente generalista | Apache 2.0 | HuggingFace |

La comparación con Qwen3-4B-Instruct-2507 es directa porque es su modelo base; Vertex-Core Debate añade especialización en debate y reducción de cifras inventadas a costa de menor generalidad. Frente a Qwen3-8B, el modelo de 4B ofrece menor coste de inferencia pero también menor capacidad general, compensada por el ajuste específico. No se dispone de datos de benchmarks públicos que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del corpus sintético de debates y del modelo base Qwen3-4B-Instruct-2507; no se documenta una evaluación de sesgos.
- Riesgo de alucinación: aunque el autor reporta 0 respuestas con cifras inventadas en 35 debates, la muestra es pequeña y no garantiza ausencia de alucinaciones en otros dominios.
- Problema de identidad: ante un intento de cambiarle la identidad responde que es Vertex-Core, pero afirma haberse adaptado "de arquitecturas como Qwen y Llama", cuando la base es únicamente Qwen.
- Muletillas del dataset: reproduce fórmulas como "X tiene razón, pero…", lo que puede resultar repetitivo en conversaciones largas.
- Posturas extremas: como abogado del diablo defiende posiciones más extremas que la v10; está pensado para debate, no como asistente general.
- Limitación de idioma: solo se declara soporte para español; el rendimiento en otros idiomas no está evaluado.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide garantizar debates de larga duración.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado como asistente general y su calidad en tareas ajenas al debate no está validada.
- Madurez: repositorio con 56 descargas y 0 likes en el momento de la consulta; sin benchmarks públicos ni validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/Denisijcu/vertex-core-debate-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Demo de la arena Vertex Chat: https://vertex-chat.netlify.app
- Vertex Coders LLC (autor: Denis Sánchez Leyva): no disponible enlace específico adicional
