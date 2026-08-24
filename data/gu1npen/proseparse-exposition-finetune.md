# gu1npen/proseparse-exposition-finetune

## Resumen

ProseParse exposition classifier es un modelo de clasificación de texto desarrollado por el usuario gu1npen, diseñado para distinguir entre exposición directa e indirecta en prosa de ficción. Se trata de un fine-tuning del modelo base `microsoft/deberta-v3-base` (DeBERTa-v3), una arquitectura transformer de 184 millones de parámetros. El modelo asigna una probabilidad softmax a la clase "directa", que el autor interpreta como el porcentaje aproximado de exposición directa en un párrafo, permitiendo así cuantificar el equilibrio entre "mostrar" y "contar" en un texto narrativo.

La relevancia de este modelo radica en su aplicación práctica para el análisis estilístico automatizado de ficción, una tarea que tradicionalmente requería juicio humano. Al estar entrenado con etiquetas generadas por un modelo profesor (gemini-3.5-flash-lite) sobre unos 1.500 párrafos de dominio público, ofrece una aproximación reproducible y escalable para evaluar la técnica narrativa. Su licencia Apache 2.0 y su tamaño compacto lo hacen accesible para integración en herramientas de escritura, análisis literario o pipelines de procesamiento de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (base) |
| Parametros totales | 184.423.682 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DeBERTa-v3 soporta 512 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (solo safetensors original) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DeBERTa-v3, una arquitectura transformer encoder-only que incorpora atención disentangled (separación de contenido y posición relativa) y un mecanismo de enmascarado mejorado (replaced token detection) durante el preentrenamiento. El fine-tuning se realizó sobre la tarea de clasificación binaria de exposición directa vs indirecta, utilizando una capa de clasificación añadida sobre el pooler del modelo base.

El entrenamiento empleó aproximadamente 1.500 párrafos de dominio público extraídos de Project Gutenberg, con longitudes de 100 a 300 palabras. Las etiquetas fueron generadas por el modelo profesor `gemini-3.5-flash-lite`, no por anotadores humanos. La distribución de clases es desbalanceada (aproximadamente 70% indirecta y 30% directa), por lo que se aplicaron pesos de clase balanceados durante el entrenamiento para compensar este desequilibrio. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tuning.

## Capacidades

- Clasificación binaria de párrafos de ficción en dos categorías: exposición directa (telling) e indirecta (showing).
- Salida softmax que permite interpretar la probabilidad de clase directa como un indicador continuo del porcentaje de exposición directa en el párrafo.
- Análisis a nivel de párrafo, no de documento completo.
- Funciona exclusivamente con texto en inglés.
- No es un modelo generativo: no produce texto, solo etiquetas de clasificación.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador puro.

## Casos de uso

- Análisis estilístico de manuscritos: un escritor o editor puede procesar capítulos completos y obtener una métrica de "show vs tell" por párrafo, identificando secciones donde la narración se vuelve excesivamente expositiva.
- Herramientas de revisión de ficción: integración en editores de texto o plataformas de escritura (como ProseParse) para resaltar automáticamente párrafos con alta probabilidad de exposición directa, ayudando al autor a decidir si reescribirlos.
- Investigación literaria computacional: análisis cuantitativo de corpus de novelas para estudiar la evolución de técnicas narrativas a lo largo del tiempo o entre autores.
- Clasificación de fragmentos en bases de datos de texto: etiquetado automático de párrafos de ficción para su posterior indexación o búsqueda semántica.
- Evaluación de traducciones: comparar la proporción de exposición directa entre un texto original y su traducción para detectar cambios en el estilo narrativo.
- Generación de datos de entrenamiento: usar las predicciones del modelo como pseudo-etiquetas para entrenar otros modelos de generación de ficción que necesiten controlar el equilibrio entre mostrar y contar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona las métricas `f1` y `accuracy` en el frontmatter, pero no proporciona valores numéricos. No se dispone de comparaciones con otros modelos en tareas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 184 millones de parámetros, en precisión fp32 ocupa aproximadamente 737 MB, y en fp16 unos 368 MB. Esto cabe en cualquier GPU moderna con al menos 1 GB de VRAM, e incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA GTX 1050 Ti o superior puede ejecutarlo sin problemas. Para procesamiento por lotes, una RTX 3060 o superior ofrece buen rendimiento.
- Compatibilidad con GPU de consumo: sí, es totalmente viable en GPUs de gama baja y media.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con Hugging Face Inference Endpoints, Text Embeddings Inference (TEI), o mediante un simple script con la librería `transformers`. También es posible exportarlo a ONNX para inferencia en CPU optimizada.
- Latencia y throughput: no se dispone de mediciones oficiales, pero para un modelo de este tamaño, la inferencia en GPU suele ser del orden de milisegundos por párrafo (típicamente <10 ms en una GPU moderna).

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (clasificación de exposición directa vs indirecta). Como referencia, se puede comparar con el modelo base `microsoft/deberta-v3-base`, que es un clasificador generalista sin fine-tuning específico, y con otros fine-tunings de DeBERTa para análisis de sentimiento o detección de estilo, pero no hay datos cuantitativos disponibles para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de un modelo profesor (gemini-3.5-flash-lite), por lo que los errores de ese modelo se han copiado al clasificador. No hay validación humana de las etiquetas.
- El modelo es sensible a párrafos mixtos donde la proporción de mostrar/contar está cerca del 50%; en esos casos la clasificación es menos fiable.
- Solo está entrenado para inglés; no funciona en otros idiomas.
- El conjunto de entrenamiento es reducido (~1.500 párrafos) y proviene exclusivamente de obras de dominio público, lo que puede limitar la generalización a estilos narrativos contemporáneos o géneros no representados.
- No debe interpretarse como un juicio de calidad literaria; solo replica el criterio del modelo profesor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de precisión ni soporte oficial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gu1npen/proseparse-exposition-finetune
- Repositorio del proyecto ProseParse: https://github.com/raywang1265/proseparse-ml-training
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
