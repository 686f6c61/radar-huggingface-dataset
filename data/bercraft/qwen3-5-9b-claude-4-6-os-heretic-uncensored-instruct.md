# Bercraft/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT

## Resumen

Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT es un ajuste fino (fine-tune) del modelo denso Qwen3.5-9B, desarrollado por el usuario Bercraft sobre el checkpoint intermedio trohrbaugh/Qwen3.5-9B-heretic-v2. El entrenamiento se realizó con Unsloth sobre un conjunto de cuatro datasets derivados de Claude ("Claude-4.6-OS"), con el objetivo de mejorar la escritura creativa, la generación de tramas y el roleplaying, manteniendo a la vez los benchmarks del modelo original. Se distribuye bajo licencia Apache 2.0 y está pensado para casos de uso de narrativa, ficción y conversación sin restricciones de contenido.

La característica definitoria es su condición de modelo "heretic" o "abliterated": se ha eliminado el comportamiento de rechazo, de modo que el autor reporta 6 rechazos de cada 100 peticiones frente a los 100 de cada 100 del modelo base Qwen/Qwen3.5-9B, con una divergencia KL de 0,0793 respecto al original. El modelo conserva la arquitectura híbrida de Qwen3.5 (Gated DeltaNet combinada con atención con compuertas), una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000, y capacidades multimodales de imagen-texto, aunque las porciones de vídeo no fueron probadas según el autor.

Con 9.409.813.744 parámetros reales en safetensors y un repositorio de 18,8 GB en bfloat16, es relevante ahora porque combina un modelo base de última generación con contexto muy largo y visión, junto con un ajuste orientado a ficción sin censura, un nicho con demanda creciente entre desarrolladores que construyen aplicaciones de escritura y roleplay. No obstante, conviene señalar que el modelo tiene cero descargas y cero likes en el momento de la ficha, y que no se han publicado resultados de benchmarks propios más allá de la tabla ARC/boolq/HellaSwag/OpenBookQA/PIQA/WinoGrande incluida en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet (atención lineal) + Gated Attention, con encoder de visión |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | El autor sugiere mínimo q4_k_s (sin imatrix) o IQ3S (con imatrix); pesos publicados en bfloat16 |
| Idiomas soportados | en, zh (etiquetados en el repo); el modelo base Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), bfloat16 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B: 32 capas con un layout de 8 bloques compuestos por 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Gated Attention, dimensión oculta de 4096, FFN con dimensión intermedia de 12288 y embeddings de 248.320 tokens (con padding). La Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. El modelo base incorpora además un encoder de visión con fusión temprana de tokens multimodales y fue entrenado con multi-token prediction (MTP) en varios pasos.

El ajuste fino se realizó con Unsloth sobre hardware local, partiendo del checkpoint heretic-v2 de trohrbaugh, y utiliza cuatro datasets derivados de Claude agrupados como "Claude-4.6-OS". El autor afirma haber buscado un entrenamiento "suave" para no degradar los benchmarks del modelo original, y reporta una divergencia KL de 0,0793 frente a Qwen/Qwen3.5-9B junto con una reducción de rechazos de 100/100 a 6/100. La plantilla Jinja fue modificada para forzar un modo "instruct only". No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si se aplicaron etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y escritura creativa: ficción, cuentos, novelas, poesía y prosa "vívida", según los tags del autor.
- Generación de tramas y subtramas, continuación de escenas y construcción de historias en todos los géneros (ciencia ficción, romance, etc.).
- Roleplaying y conversación multi-turno sin rechazos ni advertencias morales.
- Razonamiento y respuesta a preguntas, heredados del modelo base Qwen3.5-9B.
- Capacidades multimodales de imagen-texto (pipeline image-text-to-text), con visión probada y funcionando según el autor; las porciones de vídeo no fueron testeadas.
- Soporte de contexto muy largo (262.144 tokens nativos, hasta 1.010.000 extensibles), adecuado para narrativas extensas o documentos largos.
- Capacidades multilingües limitadas en la práctica a inglés y chino según las etiquetas del repo, aunque el modelo base declara cobertura de 201 idiomas.
- Compatibilidad con endpoints y con los principales motores de inferencia del ecosistema Qwen (Transformers, vLLM, SGLang, KTransformers).
- No se documenta explícitamente soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Escritura de ficción por capítulos: el modelo puede mantener coherencia narrativa a lo largo de decenas de miles de tokens gracias a su contexto de 262.144 tokens, ideal para novelas seriadas o sagas con múltiples personajes y tramas entrelazadas.
- Generación de tramas y subtramas: a partir de una premisa breve, el modelo produce esquemas argumentales, arcos de personaje y giros argumentales en cualquier género, útil para guionistas y autores que buscan lluvia de ideas estructurada.
- Roleplaying conversacional sin restricciones: al haber eliminado los rechazos (6/100 frente a 100/100 del base), es adecuado para aplicaciones de rol, juegos de texto y personajes virtuales que requieran respuestas sin filtros morales.
- Continuación de escenas: integrado en un editor de escritura, puede completar escenas a partir de un fragmento previo manteniendo el tono y el estilo, con control mediante repetición desactivada (rep pen 1) como recomienda el autor.
- Asistente de escritura multimodal: gracias a su encoder de visión, puede analizar una imagen (por ejemplo, un boceto o una fotografía) y generar descripciones narrativas o escenas inspiradas en ella.
- Prototipado de videojuegos narrativos: para diálogos de NPC, descripciones de objetos y generación procedural de misiones, aprovechando el contexto largo para mantener el estado del mundo.
- Investigación sobre des-censura: como caso de estudio de técnicas de abliteration y su impacto en benchmarks (KL de 0,0793, ARC 0,624 frente a 0,417 del base), útil para quienes estudian alineación y edición de modelos.

## Benchmarks y rendimiento

Resultados publicados en la model card (formato mxfp8) para el modelo heretic frente a Qwen3.5-9B base y Qwen3.5-9B-Instruct:

| Benchmark | HERETIC (este modelo) | Qwen3.5-9B | Qwen3.5-9B-Instruct |
|---|---|---|---|
| ARC | 0,624 | 0,417 | 0,571 |
| ARC/e | 0,820 | 0,458 | 0,719 |
| BoolQ | 0,886 | 0,623 | 0,895 |
| HellaSwag | 0,663 | 0,634 | 0,683 |
| OpenBookQA | 0,442 | 0,338 | 0,426 |
| PIQA | 0,763 | 0,737 | 0,770 |
| WinoGrande | 0,681 | 0,639 | 0,671 |

Métricas de des-censura reportadas por el autor:

| Métrica | Este modelo | Qwen/Qwen3.5-9B |
|---|---|---|
| Divergencia KL | 0,0793 | 0 (por definición) |
| Rechazos | 6/100 | 100/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19 GB solo para pesos, más overhead de KV cache; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización q4_k_s: en torno a 6-7 GB de pesos, apto para GPUs de 8-12 GB con contexto reducido.
- VRAM estimada en IQ3S (imatrix): alrededor de 5-6 GB de pesos, para GPUs de 8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 262.144 tokens y despliegue en producción; RTX 4090 (24 GB) para bfloat16 con contexto moderado; RTX 3090/4080 para cuantizaciones q4/q5.
- Cabe en GPU de consumo: sí, en RTX 4090 en bfloat16 con contexto limitado, y en GPUs de 8-12 GB con cuantización q4_k_s o IQ3S.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers (según la model card del base); llama.cpp u Ollama para GGUF si se generan cuantizaciones a partir de los pesos safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo indica que el modelo base Qwen3.5 está optimizado para "alto throughput con mínima latencia" gracias a su arquitectura híbrida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT | 9,4 B (denso) | 262.144 (ext. 1.010.000) | Apache 2.0 | Fine-tune heretic para ficción; 6/100 rechazos; visión probada |
| Qwen/Qwen3.5-9B | 9 B (denso) | 262.144 (ext. 1.010.000) | Apache 2.0 | Modelo base; 100/100 rechazos; benchmarks inferiores en ARC/BoolQ según la card |
| Qwen3.5-9B-Instruct | 9 B (denso) | 262.144 (ext. 1.010.000) | Apache 2.0 | Variante instruct oficial; benchmarks ligeramente superiores en HellaSwag/PIQA, inferiores en ARC |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | 9 B (denso) | 262.144 (ext. 1.010.000) | Apache 2.0 | Checkpoint heretic intermedio sobre el que se entrena este modelo |

No se dispone de datos de benchmarks comparativos con alternativas de otros fabricantes (Llama, Mistral, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: la eliminación de rechazos implica que puede generar contenido ofensivo, violento, sexual o ilegal; no es apto para aplicaciones dirigidas al público general sin capas de moderación adicionales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar hechos, citas o referencias, especialmente en contextos largos donde la atención se diluye.
- Idiomas: aunque el modelo base declara 201 idiomas, las etiquetas del repo solo listan inglés y chino; el rendimiento en castellano no está verificado.
- Visión parcial: el autor confirma que las imágenes funcionan, pero las porciones de vídeo no fueron probadas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y de las posibles infracciones de derechos de autor en textos derivados de los datasets de Claude.
- Reproducibilidad: no se documentan hiperparámetros, número de tokens de entrenamiento ni composición exacta de los datasets, lo que dificulta reproducir el ajuste.
- Madurez: cero descargas y cero likes en el momento de la ficha; el autor indica que hay otras versiones en pruebas, por lo que la API o los pesos podrían cambiar.
- Contexto largo: aunque se declaran 262.144 tokens nativos, el rendimiento real en ventanas extremas puede degradarse y el coste de KV cache es elevado.
- Repetición: el autor recomienda rep pen de 1 (desactivada), lo que sugiere que penalizaciones agresivas pueden degradar la calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Bercraft/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT
- Modelo base del fine-tune: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Perfil del autor del template citado: https://huggingface.co/DavidAU
