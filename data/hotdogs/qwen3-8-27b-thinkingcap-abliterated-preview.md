# hotdogs/Qwen3.8-27B-thinkingcap-abliterated-preview

## Resumen

Qwen3.8-27B ThinkingCap Abliterated Preview es un modelo de lenguaje de 27 356 millones de parámetros desarrollado por el usuario "hotdogs" sobre la base de Qwen3.8-27B-abliterated, una variante sin censura del modelo Qwen3.8-27B. El modelo incorpora un ajuste fino mediante LoRA (r=32, alpha=64) entrenado con el dataset ThinkingCap, diseñado para mejorar la eficiencia del razonamiento reduciendo el número de tokens de pensamiento sin perder precisión. Se presenta como una versión "preview" fusionada (merged) del adaptador LoRA con el modelo base, conservando los tensores de multi-token prediction (MTP) en la capa 64.

El modelo está orientado a tareas de razonamiento y generación de texto, con un enfoque en la reducción de la longitud de las cadenas de pensamiento. Al ser una versión "abliterated", elimina los mecanismos de rechazo y censura del modelo original, lo que permite respuestas sin restricciones en temas sensibles. Su licencia Apache 2.0 permite uso comercial y modificación. El repositorio incluye pesos en formato safetensors (55,6 GB) y versiones GGUF para despliegue ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5 (basada en Qwen3.8-27B) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_seq 4096) |
| Tipos de cuantizacion | GGUF (versiones disponibles, tipos no detallados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3_5, la misma que emplea Qwen3.8-27B, un transformer causal con capacidades de multi-token prediction (MTP). En esta versión, se ha aplicado un ajuste fino mediante LoRA con r=32 y alpha=64 sobre todas las capas lineales y las capas de proyección GDN (probablemente "Gated Delta Network" o similar, aunque no se especifica). El entrenamiento se realizó con 339 filas de SFT (supervised fine-tuning) durante 1 época, con una longitud máxima de secuencia de 4096 tokens, en 7 GPUs RTX 3090 con precisión BF16. La pérdida de evaluación en la época 1 fue de 0,2143, la mejor de tres épocas monitorizadas.

El dataset de entrenamiento, `hotdogs/thinkingcap-sft-qwen38-27b`, contiene 369 pares SFT y 244 pares DPO, generados on-policy a partir del modelo base abliterated y verificados por un oráculo con una tasa de precisión del 84,2 %. Tras la fusión del adaptador, se restauraron los 15 tensores MTP de la capa 64 (blk.64) para preservar la capacidad de predicción multitoken. El objetivo principal es reducir la longitud de las cadenas de pensamiento (thinking) manteniendo la exactitud en tareas de razonamiento, como se observa en los smoke tests incluidos.

## Capacidades

- Generación de texto y razonamiento paso a paso con cadenas de pensamiento eficientes (menos tokens que el modelo base).
- Razonamiento aritmético y lógico: resuelve operaciones matemáticas y problemas de lógica con precisión (ejemplos: 27x43, bat-and-ball, snail wall).
- Conversación multi-turno (etiquetado como "conversational").
- Multi-token prediction (MTP) preservada, lo que puede acelerar la decodificación.
- Sin censura (abliterated): no aplica rechazos por contenido sensible, lo que permite respuestas directas en temas controvertidos.
- Compatible con transformers y con formatos GGUF para inferencia ligera.
- No se mencionan capacidades de tool calling, visión, audio ni otras modalidades.

## Casos de uso

- Razonamiento matemático y resolución de problemas: el modelo puede utilizarse para resolver operaciones aritméticas, ecuaciones y problemas de lógica con cadenas de pensamiento más cortas que el base, lo que reduce el coste de inferencia en aplicaciones educativas o de asistencia.
- Asistente conversacional sin restricciones: al ser abliterated, puede emplearse en entornos donde se requiera respuestas sin filtros sobre temas políticos, religiosos o sociales, como investigación sociológica o generación de contenido creativo.
- Generación de código y depuración: aunque no se especifica explícitamente, al derivar de Qwen3.8-27B, un modelo con buenas capacidades de programación, puede usarse para autocompletar código, explicar fragmentos o generar scripts, siempre que se valide la salida.
- Análisis de datos y extracción de información: su capacidad de razonamiento permite procesar textos largos (hasta 4096 tokens en entrenamiento) para resumir, extraer conclusiones o responder preguntas sobre documentos.
- Prototipado de agentes de razonamiento: la eficiencia en tokens de pensamiento lo hace adecuado para sistemas que requieren múltiples pasos de razonamiento con presupuesto de tokens limitado, como agentes autónomos en entornos con restricciones de coste.
- Investigación en alineación y seguridad: al ser una versión abliterated, sirve como banco de pruebas para estudiar el comportamiento de modelos sin mecanismos de rechazo, comparando con versiones censuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los únicos datos de rendimiento son:

- Eval loss (época 1): 0,2143
- Smoke tests (F16 GGUF):
  - 27x43 = 1161 (con 163 caracteres de pensamiento)
  - bat-and-ball = 0,05 (con 161 caracteres de pensamiento)
  - snail wall = día 5 (con 359 caracteres de pensamiento, frente a más de 4000 del modelo base)

Estos resultados indican una reducción significativa en la longitud de las cadenas de pensamiento, pero no permiten comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada: en BF16, el modelo ocupa aproximadamente 55,6 GB, por lo que se necesitan al menos 60 GB de VRAM para inferencia sin cuantización (por ejemplo, 2x RTX 3090/4090 con 24 GB cada una, o una A100 de 80 GB).
- Con cuantización GGUF, el tamaño se reduce significativamente, aunque no se especifican los tipos. Estimaciones típicas para un modelo de 27B: Q4_K_M ~16-18 GB, Q5_K_M ~20-22 GB, Q8_0 ~28-30 GB. Esto permitiría ejecutarlo en una RTX 3090/4090 (24 GB) con cuantización Q4 o Q5.
- GPU recomendadas: A100 80 GB, 2x RTX 3090/4090 (para BF16), o una RTX 3090/4090 con GGUF cuantizado.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp para GGUF, y potencialmente Ollama si se convierte el GGUF. No se confirma compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles. La MTP podría mejorar la velocidad de decodificación, pero no hay datos concretos.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la misma categoría (por ejemplo, otros Qwen3.8-27B abliterated o versiones ThinkingCap) con datos de rendimiento o especificaciones detalladas. El modelo base `hotdogs/Qwen3.8-27B-abliterated` es la referencia inmediata, pero no se ofrecen métricas comparativas.

## Limitaciones y advertencias

- Al ser una versión "preview" y entrenada con solo 339 filas SFT, su generalización puede ser limitada fuera de los dominios del dataset.
- El modelo es abliterated, lo que implica que puede generar contenido ofensivo, sesgado o inapropiado sin filtros. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos o respuestas incorrectas, especialmente en temas no cubiertos por el entrenamiento.
- La longitud de contexto no está documentada; el entrenamiento usó 4096 tokens, por lo que secuencias más largas pueden degradar el rendimiento.
- No se especifican los idiomas soportados; se asume que hereda las capacidades multilingües de Qwen3.8-27B, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base abliterated puede tener restricciones adicionales no documentadas.
- Para producción, se recomienda validar exhaustivamente las salidas y considerar el uso de versiones cuantizadas con cuidado, ya que la cuantización puede afectar la precisión del razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hotdogs/Qwen3.8-27B-thinkingcap-abliterated-preview
- Dataset de entrenamiento: https://huggingface.co/datasets/hotdogs/thinkingcap-sft-qwen38-27b
- Versión GGUF: https://huggingface.co/hotdogs/Qwen3.8-27B-thinkingcap-abliterated-preview-mtp-GGUF
- Modelo base: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated
- Artículo relacionado sobre abliteration de Qwen3.8-27B: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
