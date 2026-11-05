# SicariusSicariiStuff/Zion_Alpha

## Resumen

Zion_Alpha es un modelo de lenguaje de 7.241.732.096 parámetros desarrollado por el usuario independiente SicariusSicariiStuff y publicado en Hugging Face en mayo de 2024. Se presenta como el primer modelo abierto con competencia real en hebreo, construido a partir de Mistral 7B v0.1 sin modificar el tokenizador original. Su propósito declarado es ofrecer comprensión y generación de hebreo de calidad, además de traducción bidireccional inglés-hebreo, un nicho escasamente cubierto por los modelos abiertos de su generación.

La arquitectura es la de Mistral 7B: un transformer decoder-only denso con atención de ventana deslizante, 32 capas y 7.24 mil millones de parámetros. El autor afirma haber realizado un fine-tuning con técnicas que describe como SOTA, aunque no publica detalles del dataset, número de tokens ni metodología de alineación. La licencia es Apache 2.0 y los pesos están disponibles en safetensors y GGUF (este último en la variante instruction-tuned).

La relevancia del modelo es acotada pero concreta: cubre una laguna real en el ecosistema open source para hebreo, con un resultado declarado de 84.05 en SNLI en hebreo, superior al de otros modelos abiertos según el autor. No obstante, sus benchmarks generales son modestos (19.11 de media en el suite reportado), por lo que su uso recomendado se limita a tareas lingüísticas en hebreo y no a razonamiento complejo o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (basado en Mistral 7B v0.1) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Mistral 7B v0.1: 8.192 tokens segun la arquitectura base) |
| Tipos de cuantizacion | GGUF disponible en la variante instruction-tuned; cuantizaciones concretas no especificadas |
| Idiomas soportados | ingles (en), hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16), GGUF (variante instruction-tuned) |

## Arquitectura y entrenamiento

Zion_Alpha reutiliza la arquitectura de Mistral 7B v0.1 sin alteraciones estructurales: transformer decoder-only denso con 32 capas, atención con ventana deslizante y tokenizador SentencePiece original de Mistral, que el autor confirma no haber modificado. Esta decisión implica que la tokenización del hebreo se realiza con un vocabulario no optimizado para escritura hebrea, lo que penaliza la eficiencia en tokens para ese idioma.

El entrenamiento consistió en un fine-tuning sobre la base Mistral 7B, iniciado aproximadamente dos meses después del lanzamiento de Mistral v0.1 (septiembre de 2023). El autor no publica el número de tokens de entrenamiento, la composición del dataset, ni si empleó RLHF, DPO u otra técnica de alineación; solo menciona el uso de "técnicas SOTA" sin detallarlas. Tampoco hay paper asociado. El modelo base no está instruction-tuned; existe una variante separada, Zion_Alpha_Instruction_Tuned, publicada en FP16 y GGUF. La configuración de generación recomendada por el autor es determinista (temperature 1, top_k 1, top_p 1) y la plantilla de prompt es la estándar de Mistral con etiquetas [INST].

## Capacidades

- Generación de texto en inglés y hebreo.
- Comprensión lectora y coherencia en hebreo, con resultado declarado de 84.05 en SNLI en hebreo.
- Traducción bidireccional inglés-hebreo; el autor afirma que superó a GPT-4 en pruebas cualitativas de traducción out-of-the-box.
- Razonamiento básico y respuesta a preguntas en inglés, con rendimiento limitado según los benchmarks publicados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Traducción inglés-hebreo en documentación técnica: el modelo puede traducir párrafos y textos de interfaz manteniendo terminología, aprovechando su fine-tuning específico en hebreo. Adecuado para volúmenes moderados donde no se requiere un servicio comercial.
- Localización de contenido web al hebreo: generación de textos de marketing, descripciones de producto y mensajes de UI en hebreo, con revisión humana posterior dado el riesgo de alucinación.
- Procesamiento de textos en hebreo para análisis: resumen y extracción de información de documentos en hebreo en pipelines internos, gracias a su comprensión del idioma frente a modelos genéricos.
- Chatbot de soporte en hebreo para nichos concretos: conversaciones multi-turno en hebreo con la plantilla Mistral, desplegado en local para evitar enviar datos a APIs externas.
- Investigación lingüística sobre hebreo: evaluación de fenómenos morfológicos y sintácticos del hebreo con un modelo abierto y reproducible bajo Apache 2.0.
- Generación de pares de entrenamiento inglés-hebreo: producción de datos sintéticos paralelos para entrenar o evaluar otros modelos, con filtrado humano.
- Despliegue en hardware de consumo: al ser un 7B, puede ejecutarse en una RTX 4090 o incluso en GPUs de 8-12 GB con cuantización GGUF, lo que facilita prototipos locales sin coste de API.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | Valor |
|---|---|
| Avg. | 19.11 |
| IFEval (0-shot) | 33.24 |
| BBH (3-shot) | 29.16 |
| MATH Lvl 5 (4-shot) | 4.76 |
| GPQA (0-shot) | 5.37 |
| MuSR (0-shot) | 18.45 |
| MMLU-PRO (5-shot) | 23.68 |
| SNLI en hebreo | 84.05 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible, salvo la afirmacion cualitativa del autor de superar a GPT-4 en traducción inglés-hebreo y de obtener el mayor SNLI en hebreo entre modelos abiertos a fecha de 4 de junio de 2024.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 16-18 GB para contextos moderados.
- VRAM estimada en cuantización GGUF Q4_K_M: alrededor de 4,5-5 GB; Q8_0: unos 8 GB.
- GPU recomendadas para FP16: A100 40 GB, H100, A6000 48 GB; también válida una RTX 4090 24 GB para contextos cortos.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización Q4, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: transformers, text-generation-inference (el repo declara endpoints_compatible), llama.cpp y Ollama mediante los GGUF de la variante instruction-tuned, y vLLM por compatibilidad con la arquitectura Mistral.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Zion_Alpha | 7,24 B | no disponible (base Mistral 7B v0.1: 8.192) | en, he | Apache 2.0 | Fine-tuning específico para hebreo; benchmarks generales bajos (avg. 19.11) |
| Mistral 7B v0.1 | 7,24 B | 8.192 | en (principalmente) | Apache 2.0 | Modelo base; sin competencia específica en hebreo |
| DictaLM 7B | 7 B | 4.096 (según versión) | en, he | Apache 2.0 (versiones abiertas) | Modelo abierto orientado a hebreo de Dicta; referencia habitual en el idioma |
| Llama 3 8B | 8,03 B | 8.192 | multilingüe (incluye hebreo limitado) | Llama 3 Community License | Mejor rendimiento general, pero cobertura de hebreo inferior según pruebas cualitativas |

No se dispone de comparaciones cuantitativas directas publicadas por el autor frente a estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento general bajo: media de 19.11 en el suite reportado, con MATH Lvl 5 en 4.76 y GPQA en 5.37; no es adecuado para matemáticas, razonamiento científico ni tareas de alta complejidad.
- Riesgo elevado de alucinación fuera de tareas de traducción y comprensión en hebreo, dado el limitado ajuste y la ausencia de alineación documentada.
- Tokenizador no adaptado al hebreo: al conservar el tokenizador de Mistral, la eficiencia en tokens para texto hebreo es peor que la de modelos con vocabulario específico.
- Idiomas limitados a inglés y hebreo; no se garantiza calidad en otros idiomas.
- Metodología de entrenamiento no documentada: sin dataset, número de tokens ni detalles de alineación, lo que dificulta la reproducibilidad y la evaluación de sesgos.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Mistral 7B, hereda los sesgos del corpus original de ese modelo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la variante instruction-tuned y los GGUF están en repos separados y deben verificarse por separado.
- Modelo de un solo autor sin paper ni proceso de revisión; la afirmación de superar a GPT-4 en traducción es cualitativa y no verificable con los datos publicados.
- Fecha de actualización del repo (noviembre de 2026) no implica necesariamente nuevas versiones de pesos; conviene revisar el historial de commits antes de desplegar.

## Enlaces

- Hugging Face (modelo base): https://huggingface.co/SicariusSicariiStuff/Zion_Alpha
- Variante instruction-tuned FP16: https://huggingface.co/SicariusSicariiStuff/Zion_Alpha_Instruction_Tuned
- Variante instruction-tuned GGUF: https://huggingface.co/SicariusSicariiStuff/Zion_Alpha_Instruction_Tuned_GGUF
- Imagen de resultados SNLI: https://huggingface.co/SicariusSicariiStuff/Zion_Alpha/resolve/main/Images/Zion_Alpha.png
- Ko-fi del autor: https://ko-fi.com/sicarius
- Patreon del autor: https://patreon.com/TenebraAI
- Contacto: sicariussicariistuff@gmail.com
