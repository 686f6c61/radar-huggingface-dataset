# Raghav-Singhal/1pp-0.98b-v2-filt-seed1234-base

## Resumen

1pp-0.98b-v2-filt-seed1234-base es un modelo de lenguaje de 981.545.472 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), asociado a EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general, y forma parte de una escalera de escalado (scaling ladder) cuyo objetivo es estudiar el efecto del filtrado de datos y de la personalización en el preentrenamiento de modelos pequeños.

Concretamente, esta variante es la condición "Filtered" del baseline SPP: reutiliza exactamente los mismos documentos y en el mismo orden que la ejecución "raw" del corpus 1PP (documentos DCLM-edu originales), durante el mismo número de pasos y con el mismo schedule, pero elimina la pérdida sobre los documentos marcados por un clasificador de seguridad basado en gte. El clasificador marcó 3.869.498 documentos (4,6% del total) cuyo chunk con mayor puntuación alcanzaba al menos 3. Es, por tanto, una pieza de comparación experimental para medir el impacto del filtrado de seguridad en el preentrenamiento.

Arquitectura transformer decoder estilo Llama de 24 capas, contexto de 4.096 tokens, tokenizer basado en SmolLM2 (49.152 tokens) y licencia Apache 2.0. Su relevancia es metodológica: permite aislar el efecto del filtrado de datos sobre el rendimiento y el comportamiento del modelo, con verificación de pesos frente al checkpoint original de Megatron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en bf16; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con dimensión oculta de 1.536 y FFN de 6.144 con activación SwiGLU. La atención usa 12 cabezas de consulta y 4 cabezas KV (head dim 128), con RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y sin biases ni QK-norm. El tokenizer es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La secuencia de entrenamiento es de 4.096 tokens.

El preentrenamiento consistió en 18.779 pasos sobre el stream alineado por pasos de la ejecución raw (39,38B posiciones de token), con batch global de 512 × 4.096 tokens y máscara de atención cruzada entre documentos. Se usó el optimizador Muon (shape scaling, LR matricial 0,005) junto con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La diferencia respecto a la ejecución raw es que los documentos marcados por el clasificador de seguridad (4,6%) permanecen en las secuencias como contexto pero no reciben pérdida; el empaquetado de datos es idéntico byte a byte al de la ejecución raw. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron, con diferencias absolutas de pérdida de validación de 0,0016 y 0,0015 en los conjuntos de validación.

## Capacidades

- Generación de texto autoregresiva en inglés: es un modelo base, produce texto plano y no está alineado como asistente.
- Modelado de lenguaje sobre documentos: entrenado sobre corpus DCLM-edu, con máscara de atención entre documentos.
- Formato de chat ChatML sin turno de sistema: acepta `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n` y detiene la generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Capacidad de continuación de conversaciones: la validación incluye documentos y conversaciones reescritas a partir de ellos, con pérdidas de 2,508 (texto de documento), 2,643 (texto de asistente) y 2,670 (texto de usuario).
- Soporte de tool calling / function calling: no disponible; no se documenta ni se entrena para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre filtrado de datos de preentrenamiento: permite comparar directamente con la variante raw (mismos documentos, mismo orden, mismo schedule) para medir el efecto de eliminar la pérdida sobre documentos flagados por seguridad, aislando la variable del filtrado.
- Reproducción de experimentos de scaling de modelos pequeños: con 0,98B parámetros y 39,38B posiciones de token, sirve como punto de la escalera 1PP para estudiar leyes de escalado en regímenes de cómputo reducido.
- Estudio de clasificadores de seguridad en corpus web: el modelo documenta el uso de un clasificador gte por chunks con umbral 3 y el porcentaje de documentos flagados (4,6%), útil para analizar el impacto de umbrales de filtrado.
- Evaluación de pérdida de validación controlada: los conjuntos de validación de 2.433 documentos retenidos y sus conversaciones reescritas permiten comparar pérdidas entre variantes con diferencias de milésimas, como muestra la verificación frente a Megatron.
- Experimentos de formato conversacional en modelos base: el uso de ChatML sin turno de sistema y las pérdidas desglosadas por texto de documento, asistente y usuario permiten estudiar cómo un modelo base representa turnos de conversación sin ajuste fino.
- Base para ajuste fino posterior (SFT): al ser un checkpoint base con licencia Apache 2.0, puede servir como inicialización para experimentos de instrucción o de personalización, aunque no está pensado como asistente listo para producción.
- Docencia y divulgación técnica: su tamaño reducido y su documentación detallada de hiperparámetros y verificación lo hacen adecuado para explicar pipelines de preentrenamiento con Muon, empaquetado de datos y máscaras entre documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación del checkpoint final:

| Conjunto | Pérdida por token |
|---|---|
| Texto de documento | 2,508 |
| Texto de asistente | 2,643 |
| Texto de usuario | 2,670 |

Verificación de pesos frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,6414 | 2,6430 | 0,0016 |
| raw_val50m segments [8] | 2,5090 | 2,5076 | 0,0015 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más memoria para el estado KV y activaciones; en la práctica, entre 3 y 5 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB. No se publican cuantizaciones oficiales, por lo que habría que generarlas con herramientas externas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutarlo en bf16 con contexto completo; una RTX 4090, A100 o H100 lo ejecutan con holgura y permiten batches grandes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 8 GB, RTX 4060 Ti, RTX 4070, RTX 4090) en bf16; en cuantización de 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatible; llama.cpp u Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-filt-seed1234-base | 981,5M | 4.096 | Apache 2.0 | Hugging Face (transformers, safetensors) | Variante filtrada del baseline 1PP |
| 1pp-0.98b-v2-raw-seed1234-base | No disponible en la información (misma escalera) | 4.096 (según ejecución raw) | Apache 2.0 (según colección) | Hugging Face | Ejecución raw de referencia, mismos datos sin filtrado de pérdida |
| SmolLM2 (familia, referencia de tokenizer) | No disponible | No disponible | No disponible | Hugging Face | Solo se usa su vocabulario de 49.152 tokens; no se comparan métricas |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: genera texto plano y no está alineado con instrucciones ni con preferencias humanas.
- Entrenado únicamente en inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación y de reproducir sesgos presentes en el corpus DCLM-edu, sin filtrado posterior de la salida.
- El filtrado aplicado solo elimina la pérdida sobre documentos flagados por un clasificador gte con umbral 3; no garantiza la ausencia de contenido problemático en el modelo resultante.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma documentada.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo describe explícitamente como artefacto de investigación y no como modelo de propósito general; no hay garantías de calidad para producción.
- Sin cuantizaciones oficiales ni artefactos GGUF; el despliegue en llama.cpp u Ollama requiere conversión propia.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-filt-seed1234-base
- Modelo raw de comparación: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
