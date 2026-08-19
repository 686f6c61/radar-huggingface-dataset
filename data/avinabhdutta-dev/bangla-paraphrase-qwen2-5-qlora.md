# AvinabhDutta-Dev/bangla-paraphrase-qwen2.5-qlora

## Resumen

El modelo `bangla-paraphrase-qwen2.5-qlora` es un modelo de generación de texto especializado en la paráfrasis de texto en bengalí (bangla). Desarrollado por AvinabhDutta-Dev, se basa en el modelo instructivo Qwen2.5-1.5B-Instruct y ha sido afinado mediante la técnica QLoRA sobre el dataset `csebuetnlp/BanglaParaphrase`. El objetivo es generar variantes semánticamente equivalentes de oraciones en bengalí, una tarea relevante para aplicaciones de procesamiento de lenguaje natural en este idioma, que cuenta con menos recursos que otros.

El modelo tiene 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) y su repositorio ocupa 3,1 GB en formato safetensors. Se distribuye bajo licencia Apache 2.0, aunque su acceso está restringido en HuggingFace y requiere aceptar las condiciones del autor. El modelo forma parte de un estudio comparativo más amplio, "Beyond BLEU", que evalúa la fiabilidad de las métricas automáticas para la generación de paráfrasis en bengalí, comparando arquitecturas encoder-decoder con decoder-only y validando los resultados con un juez basado en LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | Todos (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32 768 tokens, pero no se especifica si el fine-tuning lo modifica) |
| Tipos de cuantizacion | No disponible (repositorio solo con safetensors; no se publican versiones GGUF ni otras cuantizaciones) |
| Idiomas soportados | Bengalí (bn) principalmente; el modelo base es multilingüe, pero el fine-tuning se centra en bengalí |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en la arquitectura Qwen2.5, concretamente la variante instructiva de 1,5 mil millones de parámetros. El fine-tuning se realizó con QLoRA (Quantized Low-Rank Adaptation), una técnica que cuantiza los pesos del modelo base y entrena adaptadores de bajo rango, lo que reduce significativamente los requisitos de memoria y cómputo durante el ajuste. El dataset de entrenamiento es `csebuetnlp/BanglaParaphrase`, un corpus específico para paráfrasis en bengalí. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset más allá de su nombre, ni si se aplicaron técnicas adicionales como RLHF o DPO.

El modelo se enmarca en un estudio comparativo que evalúa cuatro arquitecturas distintas para la generación de paráfrasis en bengalí: dos encoder-decoder (IndicBARTSS y BanglaT5) y dos decoder-only (TigerLLM y Qwen2.5-1.5B). El estudio valida las métricas automáticas tradicionales (BLEU, ROUGE-L, BERTScore, PINC) frente a un juez basado en LLM, lo que sugiere que el autor presta atención a la calidad semántica más allá de la coincidencia superficial.

## Capacidades

- Generación de paráfrasis en bengalí: produce variantes de una oración o texto manteniendo el significado original.
- Modelo instructivo: al partir de Qwen2.5-1.5B-Instruct, conserva la capacidad de seguir instrucciones y mantener conversaciones, aunque el fine-tuning lo orienta principalmente a la tarea de paráfrasis.
- Generación de texto causal: funciona como un modelo de lenguaje autorregresivo estándar.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Aumentación de datos para entrenamiento de modelos NLP en bengalí: el modelo puede generar múltiples variantes de un mismo texto, ampliando datasets etiquetados para tareas como clasificación, análisis de sentimiento o extracción de información.
- Reescritura de contenido editorial: redactores y medios de comunicación en bengalí pueden usar el modelo para reformular artículos o párrafos, evitando duplicidades y mejorando la originalidad.
- Generación de preguntas y respuestas variadas para sistemas educativos: plataformas de tutoría, como el proyecto "Jonaki" del propio autor (un tutor RAG para exámenes APSC), pueden emplear el modelo para crear distintas formulaciones de una misma pregunta o explicación.
- Normalización de texto en chatbots de atención al cliente: permite reformular las respuestas del bot para adaptarlas al registro o estilo del usuario, manteniendo el contenido semántico.
- Parafraseo académico para estudiantes e investigadores: ayuda a reescribir citas o ideas sin alterar el significado, útil para evitar plagio involuntario en trabajos escritos en bengalí.
- Evaluación de calidad de otros modelos: al ser parte del estudio "Beyond BLEU", puede servir como referencia para validar métricas automáticas frente a juicios humanos o de LLM en tareas de paráfrasis bengalí.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de test de `csebuetnlp/BanglaParaphrase`:

| Metrica | Valor |
|---|---|
| BLEU | 12,71 |
| ROUGE-L | 0,377 |
| BERTScore F1 | 0,923 |
| PINC | 0,773 |

Estos valores son declarados por el autor y no han sido verificados de forma independiente. No se han publicado comparaciones con otros modelos en la información disponible, aunque el estudio "Beyond BLEU" del que forma parte el modelo compara cuatro arquitecturas, pero no se ofrecen los resultados detallados de cada una en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 1,54 mil millones de parámetros. En precisión fp16, los pesos ocupan aproximadamente 3,1 GB (coincide con el tamaño del repositorio). Para inferencia con transformers, se recomienda al menos 4 GB de VRAM, aunque 6 GB darían margen para activaciones y overhead.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4060, o GPUs de datacenter como T4, L4 o A10. Una RTX 4090 o A100 sería excesiva para este tamaño.
- Consumer GPU: sí, cabe en GPUs de consumo medio-bajo. Con cuantización 8-bit (no publicada, pero posible con bitsandbytes) se reduciría a ~1,6 GB, y con 4-bit a ~0,8 GB, permitiendo incluso ejecución en GPUs con 2 GB.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, Text Generation Inference (TGI) o directamente con la librería transformers. No hay versiones GGUF publicadas, por lo que llama.cpp u Ollama no son compatibles sin conversión manual.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 1,5B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de varios cientos de tokens por segundo en vLLM, pero son estimaciones genéricas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. El estudio "Beyond BLEU" menciona la comparación de cuatro arquitecturas (IndicBARTSS, BanglaT5, TigerLLM y Qwen2.5-1.5B), pero no se incluyen los resultados individuales en las fuentes consultadas. Se puede indicar que el modelo base Qwen2.5-1.5B-Instruct es un modelo generalista multilingüe, mientras que este fine-tuning lo especializa en paráfrasis bengalí, pero sin métricas comparables no es posible establecer una tabla.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo afinado sobre un modelo instructivo general, puede heredar sesgos del corpus base y generar contenido inexacto o inventado, especialmente si se usa fuera del dominio de paráfrasis.
- Especialización limitada: el modelo está diseñado para paráfrasis en bengalí; su rendimiento en otros idiomas o tareas generales no está garantizado y probablemente sea inferior al del modelo base sin afinar.
- Contexto limitado: aunque el modelo base soporta 32 768 tokens, no se ha confirmado que el fine-tuning preserve esta longitud; se recomienda verificar el comportamiento con secuencias largas.
- Acceso restringido: el modelo es gated en HuggingFace; es necesario aceptar las condiciones del autor antes de descargarlo, lo que puede limitar su adopción en entornos automatizados.
- Sin cuantizaciones publicadas: no hay versiones GGUF ni AWQ, lo que dificulta el despliegue en entornos con restricciones de memoria o en CPU pura.
- Validación externa pendiente: los benchmarks declarados no han sido verificados de forma independiente; los valores de BLEU son bajos (12,71), lo que sugiere que la paráfrasis generada difiere léxicamente del original, aunque BERTScore alto (0,923) indica buena similitud semántica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AvinabhDutta-Dev/bangla-paraphrase-qwen2.5-qlora
- Perfil del autor en GitHub: https://github.com/AvinabhDutta-Dev
- Dataset de entrenamiento: https://huggingface.co/datasets/csebuetnlp/BanglaParaphrase
- Paper de QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- DOI del modelo: https://doi.org/10.57967/hf/10022
- Repositorio del estudio "Beyond BLEU" (mencionado en el perfil de GitHub, sin URL directa en las fuentes consultadas)
