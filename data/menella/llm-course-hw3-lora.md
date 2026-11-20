# Menella/llm-course-hw3-lora

## Resumen

El modelo `Menella/llm-course-hw3-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario Menella como trabajo práctico de un curso sobre modelos de lenguaje. No se trata de un modelo base completo, sino de un conjunto de pesos de adaptación (300.031.872 parámetros en safetensors) que se monta sobre la base `OuteAI/Lite-Oute-1-300M-Instruct`. Su propósito es concreto y acotado: clasificar la tonalidad de tuits en inglés en tres clases (negative, neutral, positive) emitiendo una única palabra como respuesta.

La relevancia de esta ficha es limitada y de carácter didáctico. El modelo no está pensado para producción: tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia y su model card está mayoritariamente en ruso. Aun así, resulta un ejemplo útil de aplicación de PEFT con LoRA sobre una base pequeña (300M) para una tarea de clasificación, con una mejora documentada de Macro F1 de 0,13 a 0,51 sobre el split de test de `cardiffnlp/tweet_eval`.

La arquitectura subyacente es la del modelo base (transformer decoder-only de tipo Mistral, según los tags), y el adaptador se aplica únicamente a las proyecciones `k_proj` y `v_proj` con rango r=8 y alpha=16. El contexto y las capacidades reales dependen enteramente de la base, no del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base transformer decoder-only (tags: mistral); r=8, alpha=16, modulos k_proj y v_proj |
| Parametros totales | 300.031.872 (pesos del adaptador en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria peft) |

## Arquitectura y entrenamiento

El adaptador se construye con PEFT/LoRA sobre la base `OuteAI/Lite-Oute-1-300M-Instruct`, una base de tipo instruct de 300M parámetros. La configuración LoRA declarada es r=8, alpha=16 y se aplica a las capas `k_proj` y `v_proj` de la atención, lo que reduce drásticamente el número de parámetros entrenables frente a un fine-tuning completo. El repo ocupa 1,2 GB, coherente con los pesos del adaptador más posibles artefactos de entrenamiento.

El entrenamiento se realizó sobre el dataset `cardiffnlp/tweet_eval` en su configuración de sentimiento (tres clases: negative, neutral, positive). La tarea se formula como generación: el modelo debe responder con una sola palabra correspondiente a la clase. No se documenta el número de tokens de entrenamiento, la composición exacta del split, ni si hubo técnicas de alineación adicionales (RLHF/DPO); tampoco se describe ninguna innovación técnica más allá del uso estándar de LoRA.

## Capacidades

- Clasificación de sentimiento en inglés sobre texto corto (tuits) en tres clases: negative, neutral, positive.
- Generación de una única palabra como salida de clasificación (formato de respuesta restringido por el entrenamiento).
- Capacidad multilingüe: no (solo `en` declarado).
- Tool calling / function calling: no documentado.
- Razonamiento multi-paso o uso como agente: no documentado.
- Modo thinking, visión o audio: no disponible.
- Cualquier capacidad general del modelo base queda fuera del alcance del adaptador, que está especializado en la tarea de sentimiento.

## Casos de uso

- Análisis de sentimiento en redes sociales: el adaptador clasifica tuits en inglés en negative/neutral/positive con una sola palabra, lo que simplifica el parseo en pipelines de análisis de opinión pública.
- Moderación de contenido asistida: como señal auxiliar para priorizar revisiones humanas en función de la polaridad del texto, aunque con las cautelas de fiabilidad indicadas más abajo.
- Monitorización de marca: agregación de la polaridad de menciones en inglés para paneles de reputación, usando la salida de tres clases como etiqueta directa.
- Etiquetado débil para datasets: generación de etiquetas preliminares sobre corpus de tuits que luego se revisan manualmente, aprovechando el bajo coste de un adaptador de 300M.
- Filtrado previo en investigación académica: selección de subconjuntos positivos/negativos en estudios de opinión, con validación posterior dado el Macro F1 de 0,51.
- Ejercicio docente y reproducibilidad: ejemplo práctico de PEFT/LoRA para cursos de LLM, útil como plantilla para adaptar bases pequeñas a tareas de clasificación.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son de Macro F1 sobre el split de test de `cardiffnlp/tweet_eval` (sentiment):

| Metrica | Antes de LoRA | Despues de LoRA |
|---|---|---|
| Macro F1 | 0,13 | 0,51 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre una base de 300M, la huella es reducida y cabe holgadamente en GPUs consumer, pero no se aportan cifras.
- GPU recomendadas: no disponible; por tamaño de base, una GPU consumer moderna sería suficiente, sin datos concretos.
- Cabe en consumer GPU: previsiblemente sí, dado el tamaño de la base (300M), aunque no se documenta.
- Opciones de despliegue: la librería declarada es `peft`, por lo que el despliegue requiere cargar la base y montar el adaptador; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Menella/llm-course-hw3-lora | 300.031.872 (adaptador) | no disponible | Macro F1 0,51 en tweet_eval sentiment | no disponible | Hugging Face (0 descargas) |
| Alternativas de clasificación de sentimiento | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es un riesgo legal relevante para producción.
- Modelo de carácter didáctico (trabajo de curso), con 0 descargas y 0 likes; no hay evidencia de validación externa.
- Macro F1 de 0,51 es moderado: la clasificación de tres clases en tuits es intrínsecamente ruidosa y el rendimiento puede no ser suficiente para decisiones automatizadas.
- Riesgo de alucinación y de salida fuera de formato: al formularse como generación, el modelo puede responder algo distinto de una de las tres palabras esperadas; la model card muestra un caso (tuit positivo clasificado como neutral).
- Solo inglés: no soporta castellano ni otros idiomas.
- Dependencia total del modelo base: cualquier limitación de `OuteAI/Lite-Oute-1-300M-Instruct` (sesgos, contexto, calidad) se hereda.
- No hay información sobre sesgos demográficos o lingüísticos del adaptador.
- No se documentan cuantizaciones ni formatos alternativos de despliegue, lo que complica la integración en stacks de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Menella/llm-course-hw3-lora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Librería PEFT: https://github.com/huggingface/peft
