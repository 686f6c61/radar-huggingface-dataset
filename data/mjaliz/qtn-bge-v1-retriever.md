# mjaliz/qtn-bge-v1-retriever

## Resumen

El modelo `mjaliz/qtn-bge-v1-retriever` es un retriever semántico especializado en navegación de productos en persa, desarrollado por MohammadJavad (mjaliz) y publicado en Hugging Face. Se trata de un modelo de embeddings entrenado mediante fine-tuning con LoRA sobre un modelo base propio (`mjaliz/bslm-mlm-25M-ptdrw`), con el objetivo de mapear consultas de navegación a productos relevantes. El nombre "qtn-bge-v1" sugiere una adaptación de la familia BGE (BAAI General Embeddings) a un dominio específico, aunque no se confirma que utilice la arquitectura original de BGE.

El modelo cuenta con 566,7 millones de parámetros y está diseñado para la tarea de feature extraction (generación de vectores densos). Según la model card, el checkpoint seleccionado proviene de una ejecución de entrenamiento con LoRA de rango 32, y fue validado con una métrica NDCG@10 de 0,754 sobre una muestra fija de 4.096 productos. Aunque la información pública es limitada, el modelo está pensado para su uso en sistemas de recuperación de información y RAG en persa, con un enfoque específico en catálogos de productos.

La relevancia de este modelo radica en su especialización idiomática y de dominio, un área donde los modelos multilingües genéricos suelen ofrecer un rendimiento subóptimo. Sin embargo, al tratarse de un modelo reciente con pocas descargas y sin documentación extensa, su adopción en producción requiere una evaluación cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa según tags; base: `mjaliz/bslm-mlm-25M-ptdrw`) |
| Parametros totales | 566.705.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | persa (principalmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter LoRA ya fusionado) |

## Arquitectura y entrenamiento

El modelo se basa en un transformer encoder con arquitectura similar a XLM-RoBERTa, aunque el modelo base es `mjaliz/bslm-mlm-25M-ptdrw`, un modelo propio entrenado con enmascaramiento de lenguaje (MLM) según su nombre. El fine-tuning se realizó mediante LoRA con rango 32, alpha 64, dropout 0.05 y aplicado a todas las capas lineales. El dataset de entrenamiento es `mjaliz/2026-08-02-bge-v1`, del cual no se han publicado detalles sobre composición o tamaño, pero por el nombre y el contexto se infiere que contiene pares de productos y consultas de navegación en persa.

El entrenamiento se detuvo en el paso 18.220, y se seleccionó el checkpoint del paso 17.000 por su mejor NDCG@10 en validación (0,75399321579225). El adapter LoRA se fusionó en los pesos estándar del modelo, por lo que no se requiere PEFT para inferencia. No se mencionan técnicas adicionales como hard negatives mining, contrastive learning específico o decodificación especulativa.

## Capacidades

- Generación de embeddings densos para recuperación semántica de productos.
- Búsqueda de navegación: dado un texto de consulta (por ejemplo, "zapatillas deportivas para hombre"), produce un vector que permite recuperar productos relevantes mediante similitud coseno.
- Especialización en idioma persa y dominio de comercio electrónico.
- Compatible con librerías de transformers y con text-embeddings-inference (según tags).
- No soporta generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un encoder.

## Casos de uso

- **Búsqueda semántica en e-commerce**: el modelo permite indexar el catálogo de productos de una tienda online persa y responder a consultas de navegación con resultados relevantes, mejorando la experiencia de usuario frente a búsquedas por palabras clave.
- **Sistema de recomendación por similitud**: al generar embeddings de productos, se pueden calcular vecinos cercanos para sugerir artículos alternativos o complementarios.
- **RAG (Retrieval-Augmented Generation)**: integrado en un pipeline de generación aumentada por recuperación, el modelo puede seleccionar fragmentos de documentación de producto o reseñas en persa para alimentar a un LLM generativo.
- **Deduplicación de catálogo**: comparando embeddings de productos se pueden detectar duplicados o productos muy similares, facilitando la limpieza de datos.
- **Clasificación de consultas**: las representaciones vectoriales pueden usarse como entrada para clasificadores que categorizan la intención del usuario (por ejemplo, "comprar", "comparar", "devolver").
- **Búsqueda en bases de conocimiento persas**: más allá de productos, el modelo puede adaptarse a otros dominios con fine-tuning adicional, sirviendo como base para sistemas de recuperación en organizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como MMLU, HumanEval o MTEB) en la información disponible. La única métrica reportada es el NDCG@10 de validación durante el entrenamiento, con un valor de 0,75399321579225 sobre una muestra fija de 4.096 productos. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: con 566,7 millones de parámetros, en FP32 el modelo ocupa aproximadamente 2,27 GB; en FP16, 1,13 GB. Con cuantización a int8 (no publicada) podría reducirse a unos 0,57 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Una RTX 3060 o superior es suficiente para inferencia. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM.
- **Compatibilidad con GPUs de consumo**: sí, cabe en GPUs de gama media como RTX 3060, RTX 4060, etc.
- **Opciones de despliegue**: al ser un modelo de transformers estándar, puede servirse con vLLM, Text Embeddings Inference (TEI), o mediante la API de Hugging Face Inference Endpoints. También puede usarse localmente con la librería `sentence-transformers` o `transformers`.
- **Latencia y throughput**: no se han publicado datos específicos. Para un modelo de este tamaño, se espera una latencia de unos pocos milisegundos por lote pequeño en GPU moderna, pero depende del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. El modelo se inspira en la familia BGE (BAAI General Embeddings), pero no se han publicado resultados comparativos frente a modelos como `BGE-large` o `multilingual-e5`. Tampoco hay datos sobre su rendimiento en benchmarks estándar de recuperación multilingüe. Por tanto, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- **Dominio y idioma limitados**: el modelo está entrenado específicamente para persa y productos de comercio electrónico. Su rendimiento en otros idiomas o dominios será probablemente deficiente.
- **Sin datos de sesgos**: no se ha documentado ningún análisis de sesgos. Al entrenarse sobre un dataset no público, podría reflejar sesgos presentes en los datos de origen.
- **Riesgo de sobreajuste**: al ser un modelo pequeño (566M) fine-tuneado con LoRA sobre un dataset específico, existe riesgo de sobreajuste al dominio de productos, lo que limita su generalización.
- **Licencia no especificada**: la ausencia de licencia impide conocer las restricciones de uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- **Sin contexto largo**: no se especifica la longitud de contexto máxima, lo que puede limitar su uso en documentos extensos.
- **Alucinación no aplicable**: al ser un encoder, no genera texto, por lo que el riesgo de alucinación no existe en ese sentido. Sin embargo, los embeddings pueden producir falsos positivos en recuperación si el entrenamiento fue insuficiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mjaliz/qtn-bge-v1-retriever)
- [Perfil del autor en Hugging Face](https://huggingface.co/mjaliz)
- [Sitio oficial de BGE](https://bge.baai.ac.cn/)
- [Documentación de BGE](https://bge-model.com/)
