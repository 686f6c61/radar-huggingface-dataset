# Raghav-Singhal/1pp-2.81b-v2-filt-base

## Resumen

1pp-2.81b-v2-filt-base es un modelo de lenguaje base de 2.807.699.328 parámetros (2,81B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado a EPFL DLAB. Se trata de la variante "Filtered" de la escalera de escalado 1PP (seed 28): reproduce el corpus crudo del run original (documentos DCLM-edu) en el mismo orden y con el mismo número de pasos, pero aplicando un clasificador de seguridad basado en gte que marca 3.869.498 documentos (4,6%) como no entrenables. El objetivo es medir el efecto del filtrado de datos sobre el entrenamiento, manteniendo el resto de condiciones idénticas al modelo raw.

Arquitectura de tipo decoder estilo Llama, con 24 capas, dimensión oculta 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin sesgos ni QK-norm, y longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>`, con `<|endoftext|>` como token de fin de documento.

Es relevante como artefacto de investigación reproducible: permite comparar directamente el efecto del filtrado de datos frente al modelo raw de la misma escalera, con checkpoints verificados contra la referencia de Megatron. No está pensado como asistente de propósito general: es un modelo base entrenado sobre documentos que genera texto plano en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); tamaño del repo 5,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con 24 capas, dimensión oculta 2.688 y FFN de 10.752 con activación SwiGLU. La atención usa 21 cabezas con 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000 y embeddings de entrada y salida no atados. No incorpora sesgos ni QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens.

El preentrenamiento recorre 53.709 pasos del flujo alineado por pasos del run raw, lo que equivale a 112,64B posiciones de token, con batch global de 512 × 4.096 tokens y máscara de atención entre documentos (cross-document attention masking). El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con 3.378 pasos de warmup, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16. La innovación metodológica es el filtrado: un clasificador de seguridad basado en gte puntúa cada fragmento y marca 3.869.498 documentos (4,6%) cuyo fragmento de mayor puntuación alcanza al menos 3. Esos documentos permanecen en las secuencias de entrenamiento (en contexto) pero no reciben pérdida; el resto se entrena igual que en el run raw. La pérdida de validación del checkpoint final (por token, sobre 2.433 documentos reservados y las conversaciones reescritas a partir de ellos) es de 2,325 para texto de documento, 2,383 para texto de asistente y 2,452 para texto de usuario. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recomputando pérdidas de validación, con una diferencia absoluta de 0,0017 en ambos conjuntos comprobados.

## Capacidades

- Generación de texto plano en inglés a partir de documentos; es un modelo base, no un asistente instruido.
- Modelado de lenguaje autoregresivo con formato ChatML sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`, con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Capacidad de continuación y reescritura de documentos, dado que fue entrenado sobre documentos y sobre conversaciones reescritas a partir de ellos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan modos especiales (thinking, visión, audio) ni otras modalidades.
- No se documentan capacidades específicas de código o matemáticas más allá de las que pueda adquirir por preentrenamiento sobre DCLM-edu.

## Casos de uso

- Investigación sobre filtrado de datos: comparar este checkpoint con `1pp-2.81b-v2-raw-base` bajo condiciones idénticas (mismos documentos, mismo orden, mismos pasos) para aislar el efecto del filtrado por clasificador de seguridad sobre la pérdida de validación y el comportamiento generativo.
- Reproducibilidad de experimentos de escalado: al estar alineado paso a paso con el run raw y verificado contra Megatron (diferencia absoluta de 0,0017 en pérdida de validación), sirve como referencia para replicar resultados de la escalera 1PP en entornos HF/transformers.
- Estudio de la dinámica de entrenamiento con documentos en contexto sin pérdida: permite analizar cómo afecta mantener documentos marcados en la ventana de 4.096 tokens sin supervisión sobre las representaciones aprendidas.
- Generación y continuación de texto en inglés sobre dominios educativos: al derivar del corpus DCLM-edu, es adecuado para tareas de continuación de documentos técnicos o educativos en un entorno de investigación, no de producción orientada a usuario final.
- Base para experimentos de ajuste supervisado posteriores: el formato ChatML sin turno de sistema y el vocabulario SmolLM2 facilitan adaptarlo con SFT sobre conversaciones, como sugiere el proyecto 1pp-sft en wandb.
- Evaluación comparativa de clasificadores de seguridad en curación de datos: los 3.869.498 documentos marcados (4,6%) permiten estudiar el impacto de distintos umbrales de filtrado sobre modelos de 2,81B con 112,64B tokens vistos.
- Docencia y experimentación académica: su tamaño (2,81B) y licencia Apache 2.0 lo hacen viable para prácticas de preentrenamiento y evaluación en laboratorios con recursos moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación del checkpoint final y la verificación frente a Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,3816 | 2,3834 | 0,0017 |
| raw_val50m segments [8] | 2,3266 | 2,3249 | 0,0017 |

| Texto evaluado | Pérdida de validación (por token) |
|---|---|
| Texto de documento | 2,325 |
| Texto de asistente | 2,383 |
| Texto de usuario | 2,452 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos (2,81B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos cortos.
- En cuantización de 8 bits: alrededor de 2,8 GB de pesos; en 4 bits: alrededor de 1,4 GB de pesos, más overhead. No se publican GGUF ni otras cuantizaciones oficiales, por lo que habría que generarlas con herramientas externas.
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16 con buen throughput; RTX 4090, RTX 3090 o RTX A6000 son suficientes para bf16 en contextos de hasta 4.096 tokens.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 (por ejemplo RTX 3070/4060 Ti en adelante) y en tarjetas con 4-6 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y herramientas que acepten safetensors convertidos, como vLLM o llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles; no se publican mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-filt-base | 2,81B | 4.096 | Apache 2.0 | Hugging Face (transformers, safetensors) | Variante filtrada del run raw de la escalera 1PP |
| 1pp-2.81b-v2-raw-base | 2,81B (misma arquitectura) | 4.096 | no disponible en la información | Hugging Face | Run raw de referencia, sin filtrado; comparación directa |
| SmolLM2 (familia, vocabulario compartido) | no disponible en la información | no disponible en la información | no disponible en la información | Hugging Face | Comparte tokenizador (49.152 tokens); no se dispone de datos de rendimiento para comparar |
| Modelos densos de ~2-3B de propósito general | no disponible en la información | no disponible en la información | no disponible en la información | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Es un modelo base, no un asistente: produce texto plano y no está alineado con instrucciones ni con preferencias humanas; no debe usarse directamente como chatbot de producción.
- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está documentado.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación y de generar contenido sesgado o inapropiado inherente a un modelo base entrenado sobre DCLM-edu, pese al filtrado con clasificador de seguridad.
- El filtrado marca documentos con un clasificador basado en gte y umbral de puntuación ≥ 3; no es un filtro exhaustivo y los documentos marcados permanecen en contexto, por lo que pueden influir en las representaciones.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo describe como artefacto de investigación (EPFL DLAB) y no como asistente de propósito general; conviene evaluar su idoneidad antes de cualquier despliegue en producción.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni resultados de benchmarks estándar, lo que dificulta comparaciones de rendimiento con alternativas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, por lo que no hay evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-filt-base
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
