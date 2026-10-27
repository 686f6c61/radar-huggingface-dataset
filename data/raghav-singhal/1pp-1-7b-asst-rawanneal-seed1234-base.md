# Raghav-Singhal/1pp-1.7b-asst-rawanneal-seed1234-base

## Resumen

`1pp-1.7b-asst-rawanneal-seed1234-base` es un modelo de lenguaje de 1,66 mil millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto de investigación One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. No es un asistente de propósito general: es un artefacto de investigación diseñado para medir cuánto del efecto de entrenar con conversaciones reescritas se recupera si solo se sustituye la fase final de decaimiento de la tasa de aprendizaje (cooldown) por diálogos, manteniendo el resto del preentrenamiento sobre documentos originales.

El modelo parte del run de producción `1pp-1.7b-raw-seed1234-base` hasta el paso 28.600 y aplica después sus últimos 3.177 pasos de cooldown sobre conversaciones derivadas de esos mismos documentos, con la función de pérdida aplicada únicamente a los turnos del asistente. La arquitectura es un decoder estilo Llama de 24 capas, dimensión oculta 2.048, FFN de 8.192 con SwiGLU y 16 cabezas de atención con 4 cabezas KV, con una longitud de secuencia de 4.096 tokens.

Su relevancia es metodológica: forma parte de un estudio factorial de 3 × 3 (tres tamaños —0,5B, 1B y 1,7B— por tres condiciones de preentrenamiento) sobre los mismos 47,8 millones de documentos en el mismo orden, lo que permite aislar el efecto del texto y de la máscara de pérdida con una secuencia de batches idéntica. Es, por tanto, una pieza de ablation reproducible, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (denso): 24 capas, hidden 2.048, FFN 8.192 (SwiGLU), 16 cabezas de atención / 4 cabezas KV (head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm |
| Parámetros totales | 1.661.048.832 (1,66B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`; repositorio de 3,3 GB) |

Otros datos técnicos: tokenizador con vocabulario SmolLM2 (49.152 tokens) más `<|pad|>`; `<|endoftext|>` (id 0) actúa como token de fin de documento y `<|im_end|>` (id 2); ambos están declarados en `eos_token_id`.

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (16 cabezas de consulta frente a 4 de clave/valor), normalización RMSNorm, activación SwiGLU en la FFN y RoPE con base 10.000. Usa embeddings de entrada y salida no atados y no incorpora QK-norm ni términos de bias. La secuencia máxima es de 4.096 tokens, con enmascaramiento de atención entre documentos (*cross-document attention masking*) y empaquetado *best-fit* con asignación de documentos alineada por paso.

El preentrenamiento recorre una única pasada sobre 47,8 millones de documentos DCLM-edu (66,2B tokens como documentos; 63,0B tokens en formato conversación), en 31.777 pasos con batch global de 512 × 4.096 tokens. Los primeros 28.600 pasos usan los documentos originales con pérdida sobre todos los tokens y sobre `<|endoftext|>`; los últimos 3.177 pasos (el cooldown, con decaimiento lineal hasta 1/100) usan conversaciones reescritas a partir de esos mismos documentos, con pérdida solo en los turnos del asistente. El optimizador es Muon (escalado por forma, LR de matrices 0,005) con Adam para embeddings y normas, warmup de 2.000 pasos, weight decay 0,1 y precisión bf16.

Esta variante concreta es la réplica con semilla 1234 del run `1pp-1.7b-asst-rawanneal-base`. Como el corpus empaquetado original se perdió, los primeros 28.600 pasos se entrenaron sobre una reconstrucción: 31.717 de 31.777 pasos reproducen exactamente los recuentos de documentos y tokens originales, 60 pasos quedan un documento por debajo (139.055 tokens menos de 66,19B en total) y 36 documentos se aceptaron por coincidencia de prefijo exacto largo sin causa conocida. Además, 7 de los 3.177 pasos de cooldown contienen una conversación cuyo documento fuente falta en el paso equivalente del run raw con semilla 42. El formato de chat es ChatML sin turno de sistema (los modelos nunca vieron uno).

## Capacidades

- Generación de texto en inglés: continuación de texto plano y, por efecto de la condición de entrenamiento, texto con formato de conversación ChatML.
- Generación en formato de diálogo con la plantilla `<|im_start|>user\n{mensaje}<|im_end|>\n<|im_start|>assistant\n{respuesta}<|im_end|>\n`, incluida en el repositorio como `chat_template`.
- Modelo base: no está ajustado con instrucciones ni con RLHF/DPO, por lo que no cabe esperar adherencia fiable a instrucciones.
- Razonamiento, código, matemáticas o capacidad multilingüe: no documentadas por el autor; el único idioma declarado es el inglés.
- Tool calling / function calling: no disponible; no se documenta soporte alguno.
- Capacidades de agente o razonamiento multi-paso: no disponibles; el modelo no está diseñado para ello.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es estrictamente de texto.
- Capacidad especial: la condición de entrenamiento con pérdida enmascarada en turnos de asistente produce texto con estructura conversacional, útil como objeto de estudio del efecto de la máscara de pérdida.

## Casos de uso

- Investigación en preentrenamiento con datos conversacionales: comparar este modelo con `1pp-1.7b-asst-seed1234-base` (run 1PP completo) y con `1pp-1.7b-raw-seed1234-base` (línea base sin conversaciones) permite cuantificar qué fracción del efecto se recupera sustituyendo solo el cooldown de 3.177 pasos.
- Ablations controladas de la función de pérdida: al compartir la secuencia exacta de batches con las otras condiciones del estudio 3 × 3, sirve para aislar el efecto de enmascarar la pérdida en turnos de usuario y de asistente.
- Punto de partida para SFT: al ser un modelo base de 1,66B con licencia Apache 2.0, es un checkpoint barato para experimentos de ajuste supervisado con formato ChatML sin turno de sistema.
- Estudio de formatos de chat: permite analizar cómo un modelo preentrenado parcialmente con diálogos se comporta ante plantillas ChatML y tokens de parada `<|im_end|>` / `<|endoftext|>`.
- Reproducibilidad de recetas de entrenamiento: la model card documenta la reconstrucción del corpus, los pasos afectados y la verificación frente al checkpoint de Megatron, lo que lo convierte en material útil para replicar recetas con Muon y decaimiento lineal.
- Evaluación de contaminación y alineación de corpus: al derivar de DCLM-edu con reescritura de documentos a conversaciones, sirve para estudiar qué información de los documentos originales sobrevive a la reescritura y se refleja en el modelo.
- Generación de texto en inglés en entornos con pocos recursos: 1,66B parámetros permiten inferencia en GPUs de consumo para tareas de continuación de texto no críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K ni similares). El autor solo reporta pérdidas de validación por token sobre 2.433 documentos reservados, en el checkpoint final:

| Texto de asistente | Texto de usuario | Texto de documento |
|---|---|---|
| 1,513 | 4,916 | 2,978 |

Verificación de los pesos de HuggingFace frente al checkpoint de Megatron, recalculando pérdidas de validación:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 1,5112 | 1,5126 | 0,0014 |
| Segmentos raw_val50m [8] | 2,9791 | 2,9779 | 0,0012 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: unos 3,3 GB solo para pesos, más caché KV. Con 24 capas, 4 cabezas KV y dimensión de cabeza 128, la caché KV ocupa aproximadamente 48 KB por token, es decir, unos 200 MB por secuencia a 4.096 tokens. En la práctica, entre 5 y 6 GB para una secuencia completa.
- Cuantización: no hay GGUF ni variantes de 8 o 4 bits publicadas por el autor. Una conversión a int8 rondaría los 1,7 GB de pesos y a 4 bits unos 0,9 GB, pero son estimaciones, no artefactos disponibles.
- GPU de consumo: cabe holgadamente en RTX 3090, RTX 4090, RTX 4080, RTX 4070 Ti y en tarjetas de 12 GB como la RTX 3060; en 8 GB es viable en bf16 con contexto recortado o tras cuantización.
- GPU de datacenter: A100, H100, L40S o A10G quedan sobredimensionadas para el modelo; son útiles para servir muchos lotes concurrentes.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (el repo lleva las etiquetas `text-generation-inference` y `endpoints_compatible`) y, al ser arquitectura Llama estándar, vLLM es compatible previa conversión del tokenizador y la plantilla. llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles; el autor no reporta mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Datos de rendimiento |
|---|---|---|---|---|---|
| `1pp-1.7b-asst-rawanneal-seed1234-base` | 1,66B | 4.096 | Apache 2.0 | Base de investigación, cooldown con conversaciones | Solo pérdidas de validación |
| `1pp-1.7b-asst-seed1234-base` | 1,7B (misma familia) | 4.096 | Apache 2.0 | Run 1PP completo, condición de conversaciones | Solo pérdidas de validación |
| `1pp-1.7b-raw-seed1234-base` | 1,7B (misma familia) | 4.096 | Apache 2.0 | Línea base con documentos originales | Solo pérdidas de validación |
| SmolLM2-1.7B | 1,7B | 8.192 | Apache 2.0 | Base generalista; mismo vocabulario (49.152) | Benchmarks publicados por el autor original |
| Qwen2.5-1.5B | 1,5B | 32.768 | Apache 2.0 | Base generalista multilingüe | Benchmarks publicados por el autor original |
| Llama 3.2 1B | 1,24B | 128.000 | Licencia comunitaria Llama 3.2 | Base generalista multilingüe | Benchmarks publicados por el autor original |

La comparación con modelos generalistas es solo estructural (tamaño y arquitectura): este checkpoint no publica evaluaciones comparables, de modo que no es posible situarlo en MMLU ni en tareas de código. Los tres modelos de la familia 1PP comparten tokenizador, corpus base y secuencia de entrenamiento, por lo que la comparación entre ellos sí es metodológicamente válida.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo describe como artefacto de investigación. No ha pasado por ajuste con instrucciones, RLHF ni DPO.
- Riesgo alto de alucinación y de respuestas incoherentes en tareas de instrucción, especialmente porque el turno de sistema nunca apareció en el entrenamiento y la plantilla puede degradarse si se introduce uno.
- Sesgos: al entrenarse sobre DCLM-edu filtrado en inglés y sobre conversaciones reescritas automáticamente a partir de esos documentos, hereda los sesgos del corpus y los del proceso de reescritura, no documentados por el autor.
- Limitación idiomática: solo inglés declarado; no se garantiza comportamiento en castellano ni en otros idiomas.
- Limitación de contexto: 4.096 tokens, muy por debajo de los 8K a 128K de modelos contemporáneos de tamaño similar. Además, la atención está enmascarada entre documentos, por lo que el modelo no está entrenado para razonar sobre múltiples documentos concatenados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad y su uso comercial no está documentado ni validado por el autor.
- Caveats de reproducibilidad relevantes para producción: los pesos se verificaron contra Megatron con diferencias de pérdida de 0,0012–0,0014, pero el corpus de preentrenamiento es una reconstrucción con 60 pasos incompletos y 36 documentos aceptados por coincidencia parcial, y 7 pasos de cooldown contienen una conversación cuyo documento fuente falta en el run con semilla 42. Cualquier evaluación debe tener en cuenta estas desviaciones.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin variantes cuantizadas ni plantillas de despliegue adicionales; la integración en pipelines exige trabajo de conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-rawanneal-seed1234-base
- Variante con semilla 28 (original): https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-rawanneal-base
- Run 1PP completo (conversaciones en todo el entrenamiento): https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-seed1234-base
- Línea base con documentos originales: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
