# hoailebads/Qwen3-Embedding-0.6B-Zalo-Legal-Retrieval-LoRA

## Resumen

El modelo `Qwen3-Embedding-0.6B-Zalo-Legal-Retrieval-LoRA` es un bi-encoder de recuperación de artículos legales vietnamitas, desarrollado por hoailebads sobre el modelo base `Qwen/Qwen3-Embedding-0.6B`. Utiliza una arquitectura dual-LoRA: dos adaptadores LoRA independientes comparten un modelo base congelado, uno para codificar consultas (`query_adapter`) y otro para codificar pasajes legales (`passage_adapter`). Está específicamente entrenado y evaluado sobre el corpus Zalo Legal Text Retrieval, que contiene 61.031 artículos de ley vietnamita.

El modelo resuelve el problema de recuperación semántica de normas jurídicas en vietnamita, un dominio con vocabulario especializado y estructuras de texto complejas. Su relevancia radica en que demuestra una mejora significativa del +7,4 puntos de Recall@1 frente a un enfoque de adaptador único, y en que está publicado con licencia Apache-2.0, lo que permite su uso comercial. El checkpoint seleccionado es el mejor de la familia Zalo evaluada, con un Recall@1 de 65,70 sobre 637 preguntas de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder dual-LoRA sobre Qwen3-Embedding-0.6B (transformer) |
| Parametros totales | 615.961.600 (modelo base) + 2 × 20.185.088 (adaptadores LoRA) |
| Parametros activos | 20.185.088 por adaptador (3,28% del base) |
| Longitud de contexto | 1024 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | bf16 (entrenamiento); no se publican cuantizaciones adicionales |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3-Embedding-0.6B`, un transformer de 0,6 mil millones de parámetros, congelado durante el entrenamiento. Sobre él se aplican dos adaptadores LoRA independientes (r=16, alpha=32, dropout=0.05) que afectan a las proyecciones q, k, v, o, gate, up y down. Cada adaptador se entrena por separado: uno para consultas y otro para pasajes, lo que permite una representación asimétrica del espacio pregunta-artículo.

El entrenamiento utiliza la función de pérdida `fast_cached_mnrl_dual` (multiple-negatives ranking con caché), con temperatura 0.05 y una hard negative por consulta extraída del propio checkpoint padre. El dataset consta de 2.666 muestras, combinando datos originales de Zalo con preguntas sintéticas generadas en formato pregunta-respuesta. Se entrenó durante 5 épocas (30 pasos) en 2 GPUs con bf16 y Flash Attention 2, seleccionando el checkpoint del paso 12 (época 2) porque, aunque la pérdida seguía disminuyendo hasta 0.63, el recall no mejoraba y las épocas posteriores sobreajustaban las preguntas sintéticas.

## Capacidades

- Recuperación semántica de artículos legales vietnamitas: codifica consultas y pasajes en vectores de 1024 dimensiones normalizados L2, comparables por producto escalar.
- Búsqueda por similitud de coseno: el producto interno entre vectores de consulta y pasaje equivale a la similitud coseno.
- Manejo de textos largos: soporta hasta 1024 tokens, suficiente para artículos legales completos con su título y contenido.
- Sin prefijos de instrucción: el modelo espera texto plano, sin plantillas tipo "Instruct: ...", lo que simplifica su integración.
- Distinción estricta entre consulta y pasaje: el uso incorrecto de los adaptadores degrada gravemente los resultados, lo que exige un control explícito en el pipeline.
- Compatible con PEFT y transformers: puede cargarse mediante `PeftModel` o con el script `modeling_dual_lora.py` incluido en el repositorio.

## Casos de uso

- Búsqueda legal para ciudadanos: un sistema web donde un usuario escribe una pregunta en vietnamita ("¿Cuánto es la multa por no llevar casco?") y el modelo recupera los artículos relevantes del corpus legal, mostrando los top-10 con un Recall@10 de 92,39.
- Asistente jurídico para abogados: integración en una herramienta de consulta profesional que necesita localizar rápidamente las normas aplicables a un caso, reduciendo el tiempo de búsqueda manual en miles de artículos.
- Chatbot de atención al ciudadano: un bot que responde preguntas frecuentes sobre sanciones y obligaciones legales, usando el modelo como componente de recuperación para alimentar respuestas generadas por un LLM.
- Indexación y organización de corpus legales: el modelo puede generar embeddings para los 61.031 artículos y almacenarlos en FAISS, permitiendo búsquedas de similitud a gran escala con latencia baja.
- Sistema de recomendación de normativa: dado un documento legal o una consulta, sugiere artículos relacionados que podrían ser relevantes, útil para la redacción de contratos o dictámenes.
- Evaluación de cobertura legal: comparar consultas sintéticas contra el corpus para detectar lagunas normativas o artículos difíciles de recuperar, gracias a las métricas de Recall@K y Precision@K.

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre un conjunto de evaluación de 637 preguntas (`zalo_valset.json`) y un corpus de 61.031 artículos, usando FAISS con producto interno y deduplicación por `aid`.

| Metrica | K=1 | K=3 | K=5 | K=10 | K=100 |
|---|---|---|---|---|---|
| Recall@K | 65,70 | 83,75 | 87,83 | 92,39 | 97,25 |
| Precision@K | 66,41 | 28,41 | 17,93 | 9,45 | 1,00 |
| Hit@K | 66,41 | 84,62 | 88,70 | 93,09 | 97,65 |

Comparación con otros checkpoints de la misma familia (mismo conjunto de 637 preguntas):

| Run | R@1 | R@10 | R@100 |
|---|---|---|---|
| **Este modelo** (`zalo_synthetic_hoi_dap/checkpoint-12`) | **65,70** | **92,39** | 97,25 |
| `train_zalo_dual` (checkpoint padre, dual-adapter) | 64,68 | 91,37 | 97,25 |
| `train_zalo_single` (single-adapter) | 58,32 | 88,30 | 96,39 |

## Requisitos de hardware

- El modelo base tiene 0,6 mil millones de parámetros, por lo que en bf16 ocupa aproximadamente 1,2 GB de memoria, más los adaptadores LoRA (unos 40 MB adicionales). Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y también en CPU con cuantización.
- No se han publicado requisitos oficiales de VRAM ni latencia. El entrenamiento se realizó con 2 GPUs, pero la inferencia es ligera.
- Para despliegue, se puede usar el script `modeling_dual_lora.py` del repositorio, o cargar los adaptadores con PEFT sobre el modelo base. No se menciona compatibilidad con vLLM, llama.cpp u Ollama; al ser un modelo de embeddings, lo habitual es servirlo con FAISS o un servicio de embeddings propio.
- La generación de embeddings es rápida: con un batch de 16 consultas y secuencias de hasta 1024 tokens, la latencia esperada es de decenas de milisegundos en GPU, aunque no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | R@1 (Zalo) | R@10 (Zalo) | Licencia |
|---|---|---|---|---|---|
| **Qwen3-Embedding-0.6B-Zalo-Legal-Retrieval-LoRA** | 0,6B + LoRA | 1024 | 65,70 | 92,39 | Apache-2.0 |
| `train_zalo_dual` (checkpoint padre) | 0,6B + LoRA | 1024 | 64,68 | 91,37 | Apache-2.0 |
| `train_zalo_single` (single-adapter) | 0,6B + LoRA | 1024 | 58,32 | 88,30 | Apache-2.0 |

No se dispone de comparación con otros modelos de embeddings vietnamitas fuera de esta familia. El modelo relacionado `hoailebads/Qwen3-Embedding-0.6B-VLSP-Legal-Retrieval-LoRA` está entrenado sobre el corpus VLSP, pero no es directamente comparable porque los corpus y formatos de chunking difieren.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado exclusivamente sobre el corpus Zalo Legal Text Retrieval. Su uso sobre el corpus VLSP no ha sido medido y puede degradar el rendimiento.
- Los resultados se basan en un conjunto de validación de 637 preguntas. Existe otro conjunto más pequeño (`zalo_eval.json`, 198 preguntas) que produce métricas más altas, pero ambos no son comparables directamente.
- Es un sistema de recuperación puro, sin reranking. Para mejorar la precisión final se recomienda combinar con un reranker (por ejemplo, los modelos `Qwen3-Reranker` de la misma familia).
- El uso incorrecto de los adaptadores (codificar consultas con el adaptador de pasajes o viceversa) degrada gravemente los resultados. Es un error fácil de cometer en integraciones.
- No se debe añadir prefijos de instrucción al texto; el modelo espera texto plano tal como se usó en el entrenamiento.
- El entrenamiento con preguntas sintéticas puede introducir sesgos hacia las formulaciones generadas, y las épocas posteriores a la 2 sobreajustan esas preguntas, por lo que el checkpoint seleccionado es el de la época 2.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución y cumplir con los términos del modelo base Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hoailebads/Qwen3-Embedding-0.6B-Zalo-Legal-Retrieval-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Código y métricas completas: https://github.com/hoaileba/Qwen-Retrieval-Tuning
- Modelo relacionado (VLSP): https://huggingface.co/hoailebads/Qwen3-Embedding-0.6B-VLSP-Legal-Retrieval-LoRA
- Reranker 8B: https://huggingface.co/hoailebads/Qwen3-Reranker-8B-VLSP-Legal-LoRA
- Reranker 0.6B: https://huggingface.co/hoailebads/Qwen3-Reranker-0.6B-VLSP-Legal-LoRA
