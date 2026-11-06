# richardyoung/Qwen3.5-4B-JSpace-heretic

## Resumen

Qwen3.5-4B-JSpace-heretic es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo multimodal Qwen3.5-4B de Alibaba Qwen. Ha sido producida por el usuario richardyoung mediante la herramienta Heretic v2.0.0, aplicando una técnica de ablación de direcciones en el espacio latente (J-space Pullback Ablation) para reducir la tasa de rechazos del modelo original. El resultado es un modelo de 4.539.265.536 parámetros (4,54 B) que conserva la arquitectura y las capacidades del modelo base, pero con una probabilidad de rechazo mucho menor ante peticiones sensibles.

El modelo base Qwen3.5-4B es un modelo causal de lenguaje con codificador visual, entrenado con fusión temprana de tokens multimodales, una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención con compuertas (Gated Attention) y una FFN por bloque, además de un módulo MTP (multi-token prediction). El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000, y cubre 201 idiomas y dialectos según la model card del autor original.

La relevancia de esta ficha radica en dos factores: por un lado, documenta una de las primeras variantes Heretic publicadas sobre la familia Qwen3.5, con métricas explícitas de reducción de rechazos (de 99/100 a 48/100) y una divergencia KL de solo 0,0188 respecto al original; por otro, advierte de que se trata de un fine-tune no oficial, sin benchmarks de calidad publicados por el autor del derivado y con implicaciones éticas y de cumplimiento que deben evaluarse antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador visual; Gated DeltaNet (atención lineal) + Gated Attention + FFN, con MTP |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE; la model card del base no declara parámetros activos) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible (el repo contiene safetensors en precisión original; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | 201 idiomas y dialectos (según la model card del base Qwen3.5-4B) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo deriva directamente de Qwen3.5-4B, cuyo diseño combina dos mecanismos de atención en un layout de 32 capas: 8 bloques compuestos por 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Gated Attention. La Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia 9216 y el modelo incluye un codificador visual para entrada image-text-to-text. La dimensión oculta es 2560, el embedding de tokens es de 248.320 entradas (con padding) y la salida LM está atada al embedding. El entrenamiento del base incluye preentrenamiento y postentrenamiento con RL a gran escala (entornos multiagente) y MTP multi-paso.

La modificación de esta variante no altera pesos de forma global: aplica una ablación de direcciones por capa sobre las proyecciones `attn.o_proj` y `mlp.down_proj`. Los parámetros publicados por el autor incluyen `direction_index` por capa, pesos máximos y mínimos para cada proyección (por ejemplo, `attn.o_proj.max_weight` = 1,43 en posición 21,20; `mlp.down_proj.max_weight` = 1,17 en posición 28,49) y distancias asociadas. El efecto medido es una reducción de rechazos de 99/100 a 48/100 en el conjunto de evaluación del autor, con una divergencia KL de 0,0188 frente al modelo original. No se documentan en la información disponible los datos de entrenamiento del derivado (volumen de tokens, composición del dataset ni uso de RLHF/DPO adicional).

## Capacidades

- Generación de texto conversacional multi-turno, con contexto nativo de 262.144 tokens.
- Razonamiento y conocimiento STEM, heredado del base Qwen3.5-4B.
- Generación y comprensión de código, con soporte de tool calling según las capacidades del base.
- Capacidades multimodales de entrada (image-text-to-text): el pipeline declarado es image-text-to-text y el base incorpora codificador visual.
- Comprensión de imágenes y texto combinados, con fusión temprana de tokens multimodales.
- Cobertura multilingüe amplia (201 idiomas y dialectos según el base).
- Modo "thinking" y razonamiento multi-paso: no confirmado explícitamente para esta variante en la información disponible; el base Qwen3.5-4B se presenta como modelo postentrenado con capacidades de agente.
- Reducción de rechazos: el autor reporta 48/100 rechazos frente a 99/100 del original, lo que implica mayor permisividad ante peticiones que el base rechazaría.
- Soporte de despliegue en transformers, vLLM, SGLang y KTransformers (compatibilidad declarada por el base).

## Casos de uso

- Investigación sobre alineación y ablación: el modelo sirve como caso de estudio reproducible para medir el efecto de Heretic v2.0.0 sobre un modelo multimodal de 4,5 B, comparando la tasa de rechazos y la divergencia KL con el original.
- Evaluación de robustez de filtros de seguridad: permite a equipos de seguridad medir cómo se degradan las defensas del modelo base tras una ablación de direcciones y calibrar clasificadores externos.
- Generación creativa y narrativa sin restricciones: para guiones, ficción o contenido editorial donde el modelo base rechazaría temas sensibles, con revisión humana obligatoria.
- Experimentación con modelos multimodales pequeños: al ser un modelo de 4,5 B con codificador visual y contexto de 262.144 tokens, es viable en una sola GPU para prototipos de image-text-to-text.
- Desarrollo de agentes conversacionales de nicho: conversaciones multi-turno con contexto largo en entornos controlados donde la política de contenido la impone la aplicación, no el modelo.
- Fine-tuning posterior sobre tareas específicas: al estar en safetensors y licencia Apache 2.0, puede servir de punto de partida para ajustes supervisados o DPO en dominios concretos.
- Pruebas comparativas de decodificación y rendimiento: útil para medir latencia y throughput de la arquitectura híbrida Gated DeltaNet + Gated Attention en vLLM o SGLang frente al base.

## Benchmarks y rendimiento

El autor del derivado solo publica métricas de ablación, no de calidad general:

| Métrica | Este modelo | Qwen3.5-4B original |
|---|---|---|
| Rechazos | 48/100 | 99/100 |
| Divergencia KL | 0,0188 | 0 (por definición) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible. Los benchmarks del modelo base Qwen3.5-4B aparecen en la model card original (por ejemplo, MMLU-Pro), pero no se dispone de los valores numéricos completos en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (safetensors, ~9,1 GB de repo): aproximadamente 10-12 GB para pesos, más overhead de KV cache; con contexto largo la KV cache crece de forma significativa.
- En cuantización de 8 bits: alrededor de 5-6 GB de VRAM; en 4 bits: alrededor de 3 GB, aunque no se listan cuantizaciones oficiales en el repo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para precisión original con contextos moderados; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16/bf16 con contexto moderado, y en GPUs de 16 GB con cuantización.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers (compatibilidad declarada por el base); llama.cpp/Ollama no están confirmados para esta variante al no publicarse GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-JSpace-heretic (este) | 4,54 B | 262.144 (ext. 1.010.000) | Apache 2.0 | Variante decensored; 48/100 rechazos; KL 0,0188 |
| Qwen/Qwen3.5-4B | 4 B (según model card) | 262.144 (ext. 1.010.000) | Apache 2.0 | Modelo base oficial; 99/100 rechazos |
| Qwen3.5-9B | no disponible en detalle | no disponible en detalle | Apache 2.0 (según familia) | Modelo mayor de la misma familia, citado en benchmarks del base |
| GPT-OSS-20B | 20 B (aprox.) | no disponible | no disponible | Citado como referencia en benchmarks del base |

La comparación de rendimiento de calidad entre este derivado y el base no puede establecerse con los datos disponibles: solo se publican las métricas de rechazos y KL. Cualquier comparación con Qwen3.5-9B o GPT-OSS-20B en tareas de razonamiento o código requeriría ejecutar benchmarks propios.

## Limitaciones y advertencias

- Modelo no oficial: es un fine-tune de terceros (richardyoung), no validado ni respaldado por Alibaba Qwen; la model card del base se reproduce como referencia, no como garantía de comportamiento del derivado.
- Reducción deliberada de rechazos: la tasa de rechazos baja de 99/100 a 48/100, lo que implica que el modelo puede generar contenido sensible, inseguro o no alineado con las políticas del base. No debe desplegarse en aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad para esta variante; la ablación puede degradar sutilmente la coherencia en dominios especializados (la KL de 0,0188 indica cambios distribuidos, no localizados).
- Sesgos: no se documentan análisis de sesgos para el derivado; hereda los del base Qwen3.5-4B, que no están cuantificados en la información disponible.
- Idiomas: la cobertura de 201 idiomas corresponde al base; no se confirma que la ablación preserve el rendimiento multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero el despliegue de un modelo decensored puede incumplir términos de servicio de plataformas, normativas sectoriales o políticas de contenido de proveedores cloud; la responsabilidad recae en el integrador.
- Contexto: aunque el contexto nativo es de 262.144 tokens, el coste de KV cache en contextos largos es elevado y no se han publicado mediciones de degradación a longitudes extremas.
- Ausencia de cuantizaciones oficiales: no hay GGUF ni AWQ/GPTQ publicados en el repo, lo que limita el despliegue en hardware de gama baja sin trabajo adicional.
- Métricas limitadas: solo se publican rechazos y KL; no hay benchmarks de código, matemáticas, visión ni agentes para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-JSpace-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic (herramienta de ablación): https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
