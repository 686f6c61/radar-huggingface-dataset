# malkolm777/zils-mini-decision-h1

## Resumen

zils-mini-decision-h1 es un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) derivado de la familia Qwen3.5-4B, concretamente del modelo base vllm-sr/d3-mini. Lo desarrolla el usuario malkolm777 como "cuerpo de decisión" para el pool mini de la subnet 127 de Zils. No es un modelo de propósito general entrenado desde cero, sino un ajuste fino orientado a tareas de clasificación y decisión sobre entradas de examen, construido mediante técnicas de model soup y task-vector extrapolation.

El punto de partida es la media uniforme de dos "cuerpos" del mismo pool (vllm-sr/d3-mini y torchcast-decision-4b), sobre la que se aplican tres pasadas LoRA de rango 64 con AdamW (lr 2e-5, 1 época, semillas 553, 771 y 991). Los datos de entrenamiento son aproximadamente 14.000 ítems de estilo examen generados y verificados por un LLM a partir de filas de split de train de datasets públicos (MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, commonsense_qa, tweet_eval, 20newsgroups, glaive function calling y tareas de BIG-bench).

Su relevancia es acotada: se trata de un artefacto experimental de una subnet concreta, con cero descargas y cero likes en el momento de la consulta, publicado bajo Apache-2.0. Resulta útil como referencia de técnicas de composición de modelos (soup + LoRA + extrapolación de vectores de tarea) más que como modelo de producción generalista. La información pública disponible es escasa y no se han publicado benchmarks ni detalles de contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5-4B (según model card); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 9,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer decoder-only heredada de Qwen3.5-4B vía el modelo base vllm-sr/d3-mini. No se documentan innovaciones arquitectónicas propias: el interés está en el procedimiento de construcción. Primero se calcula una media uniforme de dos cuerpos del pool mini (vllm-sr/d3-mini y torchcast-decision-4b), generando un punto de partida tipo model soup. Sobre ese start se ejecutan tres pasadas LoRA independientes con rango 64, optimizador AdamW, learning rate 2e-5 y una época, usando las semillas 553, 771 y 991.

Los datos de entrenamiento son aproximadamente 14.000 ítems de estilo examen, autorados y verificados por un LLM a partir de filas de train de datasets públicos: MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, commonsense_qa, tweet_eval, 20newsgroups, glaive function calling y tareas de BIG-bench. Los objetivos son suaves: 0,5 × la distribución de respuesta del modelo de partida + 0,5 × la etiqueta gold. Los tres fine-tunes se promedian uniformemente y el delta de pesos promediado respecto al start se escala por 3 (task-vector extrapolation), de modo que el cuerpo final es start + 3 × (media − start). No se documenta RLHF ni DPO.

## Capacidades

- Clasificación y decisión sobre ítems de estilo examen (feature-extraction y decision-model según los tags).
- Razonamiento de opción múltiple y tareas de comprensión derivadas de MMLU, commonsense_qa y BIG-bench.
- Inferencia lógica y NLI (ANLI, GLUE).
- Razonamiento aritmético básico y problemas verbales (GSM8K, SVAMP).
- Clasificación de intención y dominio conversacional (Banking77, CLINC150).
- Detección de llamadas a funciones y tool calling (glaive function calling, When2Call).
- Análisis de sentimiento y sarcasmo (poem_sentiment, iSarcasm, titulares de sarcasmo).
- Clasificación temática de documentos (20newsgroups, tweet_eval).
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de consultas en un asistente conversacional: el modelo puede clasificar la intención del usuario entre dominios predefinidos (estilo Banking77/CLINC150) para decidir qué skill o endpoint invocar, aprovechando su entrenamiento específico en clasificación de intención.
- Detección de tool calling en pipelines de agentes: dado un turno de usuario, decidir si requiere llamada a función y cuál (entrenado con glaive function calling y When2Call), actuando como clasificador previo barato antes de un modelo mayor.
- Moderación y triaje de contenido: clasificación de sentimiento, sarcasmo y temática (iSarcasm, poem_sentiment, 20newsgroups) para priorizar revisiones humanas en flujos de soporte o community management.
- Evaluación automática de exámenes: al estar entrenado sobre ítems de estilo examen con etiquetas gold, puede usarse como clasificador de respuestas en sistemas de corrección automática de opción múltiple.
- Filtro de calidad en pipelines de datos: clasificación de pares pregunta-respuesta o de documentos por temática y corrección lógica (NLI/GLUE) para descartar muestras defectuosas antes de entrenar otros modelos.
- Verificación de razonamiento aritmético simple: comprobación de resultados en problemas verbales básicos (GSM8K/SVAMP) como paso de validación en cadenas de agentes que generan cálculos.
- Componente de decisión en la subnet 127 de Zils: uso previsto por el autor como cuerpo de decisión del pool mini, evaluable con los ítems de examen del propio pool.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 9 GB solo para pesos (4,54 B parámetros × 2 bytes), más overhead de activaciones y KV cache; presupuesto práctico de 12-16 GB según longitud de secuencia.
- En cuantización de 8 bits: aproximadamente 4,5-5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB, aunque el autor no publica variantes GGUF ni cuantizadas.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 con secuencias largas; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para FP16 en batch pequeño.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y potencialmente en GPUs de 12 GB con cuantización, si se generan los pesos cuantizados (no disponibles en el repo).
- Opciones de despliegue: transformers (librería declarada, con `custom_code` y tag `endpoints_compatible`); vLLM, llama.cpp, Ollama y TGI no están documentados por el autor y requerirían conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-decision-h1 | 4,54 B | no disponible | Apache-2.0 | Ajuste de decisión experimental, sin benchmarks |
| vllm-sr/d3-mini (modelo base) | no disponible | no disponible | no disponible | Cuerpo de partida del pool; sin datos públicos verificados en esta ficha |
| Qwen3.5-4B (familia referenciada) | ~4 B | no disponible | no disponible | Modelo generalista de origen; capacidades completas no verificadas aquí |

No se dispone de datos de rendimiento comparables publicados para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente al modelo base ni frente a alternativas.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Cero información sobre sesgos: los datasets de origen (tweet_eval, iSarcasm, 20newsgroups, etc.) pueden introducir sesgos de dominio y de etiquetado que no se han auditado.
- Riesgo de alucinación: aunque está orientado a clasificación, conserva la cabeza generativa del modelo base; no se documenta ningún mecanismo de calibración más allá de los objetivos suaves de entrenamiento.
- La extrapolación de vectores de tarea con factor 3 puede amplificar ruido del ajuste; el autor no reporta validación de estabilidad.
- Idiomas y longitud de contexto no documentados: no debe asumirse soporte multilingüe ni ventanas largas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base vllm-sr/d3-mini y la familia Qwen3.5-4B tienen sus propias condiciones que conviene verificar antes de producción.
- Los datos de entrenamiento fueron generados y verificados por un LLM: posible propagación de errores de etiquetado.
- Sin variantes cuantizadas oficiales: el despliegue en hardware limitado requiere trabajo adicional de conversión.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-mini-decision-h1
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- Repositorio de referencia de la familia Qwen3.5-4B: https://huggingface.co/Qwen (no se proporciona enlace específico en la información disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
