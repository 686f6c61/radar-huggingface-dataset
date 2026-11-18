# Sankar-2910/genz-translator

## Resumen

GenZ Translator es un modelo de lenguaje compacto de 29,65 millones de parámetros desarrollado por el usuario Sankar-2910 y publicado en Hugging Face. Su propósito es muy específico: traducir jerga de la Generación Z y abreviaturas propias de internet a un inglés estándar, claro y conversacional, preservando el significado, la emoción y el contexto original. No es un asistente de propósito general, sino un traductor especializado de una sola tarea.

La versión 2, que es la disponible actualmente, continúa el entrenamiento desde el checkpoint original con datos adicionales de traducción limpiados y ejemplos curados. El modelo emplea una arquitectura Transformer decoder-only de estilo Llama, con 7 capas, tamaño oculto de 448, 7 cabezas de atención y una longitud de contexto de tan solo 384 tokens. El vocabulario es de 8.000 tokens con un tokenizador BPE byte-level personalizado, y los pesos se distribuyen en formato safetensors.

Su relevancia radica en su tamaño extremadamente reducido, que permite inferencia local en hardware muy modesto, y en su enfoque de nicho frente a los grandes modelos generalistas. Es útil para experimentación con modelos compactos, para preprocesar mensajes informales en pipelines de moderación o análisis de redes sociales, y como caso de estudio de ajuste fino especializado. La licencia Apache 2.0 facilita su uso comercial, aunque sus limitaciones de contexto y generalización son notables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama |
| Parámetros totales | 29.653.568 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 7 |
| Tamaño oculto | 448 |
| Cabezas de atención | 7 |
| Cabezas KV | 7 |
| Tamaño intermedio | 1.792 |
| Vocabulario | 8.000 |
| Tokenizador | BPE byte-level personalizado |
| Framework | PyTorch / Transformers |
| Tarea prevista | traducción de jerga en un solo turno |
| Tamaño del repositorio | 3,4 GB |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only de estilo Llama con 7 capas, dimensión oculta de 448, 7 cabezas de atención (con 7 cabezas KV, es decir, sin grouped-query attention) y tamaño intermedio de 1.792 en las capas feed-forward. Usa embeddings de entrada y pesos de la cabeza de salida separados (`tie_word_embeddings=False`) y un tokenizador BPE byte-level propio con un vocabulario de 8.000 tokens. La longitud de contexto es de 384 tokens, muy corta y adecuada solo para mensajes breves.

El entrenamiento de la versión original se realizó desde cero, sin partir de pesos preentrenados de Meta Llama, Qwen o Mistral, usando un conjunto de datos especializado de jerga Gen Z traducida a inglés. La versión 2 continúa el ajuste fino desde el checkpoint original con datos adicionales depurados y ejemplos curados centrados en abreviaturas, jerga y preguntas sobre el significado de expresiones. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO; la model card solo reporta pérdidas de validación durante el ajuste fino de la v2.

## Capacidades

- Traducción de abreviaturas comunes de internet (por ejemplo, `WYD`, `tbh`, `omw`, `ty`, `np`) a inglés estándar.
- Reescritura de mensajes informales en inglés conversacional claro.
- Interpretación de expresiones comunes de la Generación Z.
- Procesamiento de leyendas y mensajes cortos de redes sociales.
- Respuesta a preguntas sobre el significado de expresiones de jerga.
- Traducción de párrafos breves, siempre que quepan en el contexto de 384 tokens.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso

- Normalización de mensajes en redes sociales: el modelo puede reescribir comentarios y publicaciones con jerga en inglés estándar antes de pasarlos a un sistema de análisis de sentimiento o moderación, gracias a su capacidad de preservar la polaridad y el tono.
- Análisis de opiniones de audiencias jóvenes: en pipelines de investigación de mercado, traducir mensajes informales a inglés claro permite aplicar después clasificadores entrenados sobre texto formal.
- Preprocesamiento para moderación de contenido: convertir abreviaturas y jerga en texto legible facilita que reglas o modelos posteriores detecten contenido sensible, aunque con la advertencia de que puede perder negaciones.
- Atención al cliente en canales informales: como paso previo a un sistema de respuesta, el modelo puede aclarar el mensaje del usuario; su contexto de 384 tokens lo limita a mensajes cortos.
- Herramienta educativa o de divulgación: responder a preguntas del tipo "¿qué significa esta expresión?" con explicaciones en inglés estándar, una de las categorías donde la v2 muestra mejoras notables.
- Experimentación con modelos compactos: servir como banco de pruebas para ajuste fino especializado, cuantización y despliegue local en hardware de gama baja.
- Enriquecimiento de datasets: generar versiones normalizadas de corpus de jerga para entrenar o evaluar otros modelos.

## Benchmarks y rendimiento

Resultados del benchmark artesanal publicado en la model card (tasa de aprobación por categoría):

| Categoría | Ejemplos | v1 | v2 |
|---|---:|---:|---:|
| Abreviaturas | 39 | 82% | 100% |
| Abreviaturas contextuales | 16 | 88% | 94% |
| Preguntas de significado | 11 | 27% | 100% |
| Desbordamiento | 1 | 100% | 100% |
| Párrafos | 5 | 100% | 100% |
| Passthrough | 8 | 75% | 75% |
| Polaridad | 10 | 90% | 90% |
| Preservación del significado | 7 | 57% | 71% |
| Robustez | 37 | 86% | 92% |
| Jerga | 34 | 91% | 88% |
| **Total de categorías puntuadas** | — | **80,2%** | **92,4%** |

Resultados del benchmark sobre dataset reservado (held-out):

| Métrica | v1 | v2 |
|---|---:|---:|
| Exact match | 15,2% | 14,5% |
| Token F1 | 0,701 | 0,699 |
| Salidas terminadas en EOS | 100% | 100% |
| Jerga restante en la salida | 0,0% | 0,1% |
| Salidas en estilo definición | 0,1% | 0,0% |
| Latencia, batch size 32 | 4,1 ms/prompt | 4,7 ms/prompt |

Pérdida de validación durante el ajuste fino de la v2:

| Métrica | Antes del ajuste | Checkpoint seleccionado |
|---|---:|---:|
| Pérdida de validación general | 0,5268 | 0,5241 |
| Pérdida de validación curada | 1,3334 | 0,2168 |
| Pérdida de validación combinada | 0,9301 | 0,3704 |

El autor advierte que la mejora en el benchmark artesanal no se corresponde con una mejora en exact-match sobre el dataset reservado, y que el conjunto de validación curado solo contiene 82 ejemplos. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 120 MB para los pesos (29,65 M de parámetros); en fp16, unos 60 MB. El repositorio ocupa 3,4 GB, probablemente por artefactos de entrenamiento y checkpoints adicionales.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 3060, RTX 4090, e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; una GPU consumer básica es suficiente. Para lotes grandes, cualquier GPU con al menos 1-2 GB de VRAM libre es adecuada.
- Opciones de despliegue: Transformers (PyTorch), text-generation-inference (etiqueta `text-generation-inference` en el repositorio) y endpoints compatibles. No se documentan variantes GGUF ni soporte explícito de llama.cpp u Ollama, aunque la conversión a GGUF sería viable dado el tamaño.
- Latencia reportada por el autor: 4,7 ms por prompt con batch size 32 en la v2 (hardware no especificado). El throughput estimado es alto para su tamaño, pero no se documentan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GenZ Translator (v2) | 29,65 M | 384 | Traducción de jerga Gen Z a inglés | Apache 2.0 | Hugging Face |
| Modelos decoder-only pequeños tipo GPT-2 small | ~124 M | 1.024 | Generación de texto general | MIT (según variante) | Hugging Face |
| Modelos tipo TinyLlama | ~1,1 B | 2.048 | Generación general | Apache 2.0 | Hugging Face |
| Modelos de traducción especializados pequeños | variable | variable | Traducción de idiomas | variable | variable |

No se dispone de comparaciones directas publicadas con modelos especializados equivalentes en traducción de jerga Gen Z. Las alternativas de la tabla son referencias de tamaño y categoría, no equivalentes funcionales exactos; los datos de modelos comparables concretos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Contexto muy limitado: 384 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés: no traduce otros idiomas ni maneja bien texto mixto con varios idiomas.
- Pérdida de detalles: puede eliminar negaciones u otra información importante del mensaje original.
- Errores en expresiones a nivel de frase: falla con expresiones como `pull up` o `stan`.
- Reescribe inglés ordinario que no necesita traducción (problema de passthrough, con solo 75% de acierto en el benchmark artesanal).
- Mal rendimiento con caracteres repetidos, entradas malformadas de forma adversarial, URL y nombres de usuario.
- Generalización limitada: el exact-match sobre el dataset reservado es bajo (14,5% en v2) y no mejora respecto a la v1.
- Riesgo de alucinación en preguntas de conocimiento general; no está diseñado para recuperación de conocimiento.
- No apto para conversación general, código, matemáticas ni razonamiento.
- La evaluación se basa en benchmarks artesanales pequeños (algunas categorías con 1 o 5 ejemplos) y un conjunto de validación curado de 82 ejemplos, por lo que las cifras deben interpretarse con cautela.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la calidad en producción.
- No se documentan sesgos específicos, aunque al entrenarse con jerga de internet puede reflejar sesgos presentes en ese tipo de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sankar-2910/genz-translator
- Paper de referencia de la arquitectura Llama (arxiv:2302.13971): https://arxiv.org/abs/2302.13971
