# EugeneEvstafev/cevra-reasoning-decisions-4b

## Resumen

Cevra Reasoning Decisions 4B es un modelo de decisión derivado de Qwen/Qwen3.5-4B mediante un ajuste fino con LoRA. Su función no es la generación de texto libre, sino la evaluación: recibe una pregunta, una respuesta candidata y un razonamiento, y devuelve una puntuación entre 0 y 1 que indica la calidad de esa respuesta frente a una referencia. El autor es EugeneEvstafev y el modelo se publica bajo licencia Apache 2.0.

Técnicamente se apoya en la arquitectura del modelo base Qwen3.5-4B, con 4.659.865.088 parámetros totales (aproximadamente 4,66 mil millones) y pesos en formato safetensors. El mecanismo de puntuación es una distribución de decisión de dos opciones: la probabilidad asignada a la opción `1` se interpreta directamente como la puntuación de calidad, lo que convierte al modelo en un evaluador probabilístico en lugar de un generador.

Su relevancia práctica está en tareas de verificación, filtrado y ranking de respuestas generadas por otros modelos, así como en pipelines de evaluación automática y de recompensa. El ajuste se realizó con Tinker usando LoRA de rango 16, lo que implica que el resultado es un merge sobre el modelo base fijado en una revisión concreta. El modelo no registra descargas ni interacciones en el momento de la consulta, por lo que su validación externa es todavía muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); ajuste fino con LoRA rango 16 |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | en, fr, de, es, zh, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,66 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado con LoRA de rango 16, tasa de aprendizaje 0,0001, tamaño de lote 8 y una única época (95 pasos). El conjunto de entrenamiento consta de 753 registros y el de validación de 109. El resultado se fusionó (merge) sobre el modelo base fijado en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, lo que garantiza reproducibilidad respecto a esa revisión concreta.

La innovación principal no está en la arquitectura, sino en la formulación de la tarea: el modelo no genera texto, sino que produce una distribución de decisión de dos opciones sobre la calidad de una respuesta candidata. La probabilidad de la opción `1` actúa como puntuación continua en el rango 0–1. No se documentan en la información disponible detalles sobre la composición del dataset, el uso de RLHF o DPO, ni innovaciones de decodificación como decodificación especulativa o atención lineal.

## Capacidades

- Puntuación de respuestas: evalúa una respuesta candidata frente a una pregunta y una referencia, devolviendo un valor entre 0 y 1.
- Evaluación de razonamientos: puntúa conjuntamente la respuesta y el razonamiento asociado, no solo el resultado final.
- Distribución de decisión binaria: la salida es una probabilidad sobre dos opciones, apta para ranking y umbralización.
- Multilingüe: soporte declarado para inglés, francés, alemán, español, chino y ruso.
- Integración en pipelines de evaluación automática como juez o scorer.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Evaluación automática de respuestas de LLM: el modelo actúa como juez que asigna una puntuación de 0 a 1 a cada respuesta candidata frente a una referencia, lo que permite comparar variantes de un sistema sin revisión humana en cada iteración.
- Filtrado de datos sintéticos: en la generación de datasets de instrucciones, se puede puntuar cada par pregunta-respuesta y descartar los que queden por debajo de un umbral, reduciendo el ruido antes del entrenamiento.
- Ranking de candidatos en decodificación: dado un conjunto de respuestas generadas para la misma pregunta, el modelo ordena por calidad usando la probabilidad de la opción `1` como señal de recompensa.
- Verificación de razonamientos en cadena: al puntuar conjuntamente respuesta y razonamiento, sirve para detectar cadenas de razonamiento plausibles en la forma pero incorrectas en el fondo.
- Control de calidad en atención al cliente automatizada: se puntúan las respuestas generadas antes de enviarlas, activando revisión humana cuando la puntuación cae por debajo de un umbral configurable.
- Evaluación multilingüe: al cubrir seis idiomas, permite aplicar el mismo criterio de puntuación a respuestas en inglés, francés, alemán, español, chino y ruso dentro de un mismo pipeline.
- Señal de recompensa para ajuste fino: las puntuaciones pueden emplearse como reward model en procesos de optimización o como criterio de selección en best-of-n.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados en la información disponible son métricas de calibración sobre 113 registros reservados:

| Métrica | Valor |
|---|---|
| MAE de probabilidad | 0,01452 |
| Brier score (dos clases) | 0,01020 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 9,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 12–16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5 GB de pesos, con margen adicional para contexto.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,5–3 GB de pesos, viable en GPUs de consumo con 8 GB o más.
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16; RTX 4070 o superiores para cuantización de 4–8 bits.
- Cabe en GPU de consumo: sí, especialmente con cuantización; en FP16 requiere tarjetas de 16 GB o más.
- Opciones de despliegue: vLLM, TGI y llama.cpp son compatibles con el formato safetensors del modelo base; Ollama es viable si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cevra Reasoning Decisions 4B | 4,66 B | no disponible | Puntuación de calidad 0–1 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Generación de texto | no disponible | Hugging Face |
| Modelos juez de la familia Qwen | no disponible | no disponible | Evaluación | no disponible | no disponible |
| Reward models abiertos de tamaño similar | no disponible | no disponible | Señal de recompensa | variable | Hugging Face |

La información disponible no permite establecer comparaciones cuantitativas con alternativas concretas; los datos de parámetros y contexto de los modelos comparables no están publicados en las fuentes consultadas.

## Limitaciones y advertencias

- Modelo de nicho: no genera texto; solo puntúa respuestas y razonamientos, por lo que no puede usarse como LLM de propósito general.
- Validación limitada: las métricas publicadas proceden de 113 registros reservados y el modelo no registra descargas ni interacciones, lo que dificulta contrastar su comportamiento en dominios reales.
- Riesgo de sobreajuste al formato: con solo 753 registros de entrenamiento y una época, el modelo puede puntuar de forma poco fiable ante distribuciones de preguntas o respuestas distintas de las del dataset.
- Sesgos: no se documentan análisis de sesgo; al heredar el modelo base, puede reproducir sesgos presentes en Qwen3.5-4B.
- Riesgo de calibración fuera de dominio: la MAE de 0,01452 es válida para el conjunto de evaluación publicado; no hay garantía de que se mantenga en otros dominios o idiomas.
- Idiomas: aunque se declaran seis idiomas, no se especifica el volumen de datos por idioma, por lo que el rendimiento en español, francés, alemán, chino o ruso puede ser inferior al del inglés.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B, ya que la información disponible no detalla su licencia.
- Reproducibilidad: el merge está fijado a una revisión concreta del modelo base; usar otra revisión puede alterar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EugeneEvstafev/cevra-reasoning-decisions-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revisión fijada del modelo base: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
