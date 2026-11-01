# CycoAI/Qwen3-Reranker-0.6B-ONNX

## Resumen

Qwen3-Reranker-0.6B-ONNX es la exportación a formato ONNX del modelo de reranking Qwen3-Reranker-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. Este repositorio concreto, publicado por CycoAI, es un espejo sin modificaciones de la exportación realizada por el autor zhiqing, fijada al commit `21fb0d00576b976132dbe2acb651dd9639881ecb`. El modelo resuelve el problema del reordenamiento (reranking) de documentos recuperados en pipelines de búsqueda y RAG: dada una consulta y un conjunto de pasajes candidatos, asigna una puntuación de relevancia a cada par consulta-documento.

El modelo pertenece a la familia Qwen3 Embedding, que incluye modelos de embedding y reranking en tamaños de 0.6B, 4B y 8B, construidos sobre los modelos densos de la serie Qwen3. La versión de 0.6B es la más ligera de la familia y está pensada para despliegues con requisitos de latencia y memoria ajustados, manteniendo las capacidades multilingües y de comprensión de texto largo del modelo base. El formato ONNX permite ejecución con ONNX Runtime en CPU y GPU sin depender de PyTorch en producción.

La relevancia de este repositorio radica en su carácter de copia fijada y verificada: el autor lo mantiene para que sus herramientas (cycodembed) descarguen desde una ubicación estable y auditable, lo que resulta útil en entornos de producción donde la reproducibilidad de la cadena de suministro de modelos es un requisito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3), cabeza de clasificación binaria sí/no |
| Parametros totales | 0.6B (aproximadamente 600 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 000 tokens en el modelo base Qwen3; en el ejemplo de uso del repositorio se trunca a 2048 tokens (configurable mediante `max_length`) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Multilingüe (heredado de Qwen3); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`) más tokenizer de HuggingFace |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de la base Qwen3, adaptado como reranker mediante una formulación de clasificación binaria. En lugar de generar una representación vectorial y calcular similitud, el modelo recibe un prompt estructurado con instrucción, consulta y documento, y evalúa la probabilidad de los tokens "yes" y "no" en la última posición. La puntuación de relevancia se obtiene aplicando softmax sobre los logits de ambos tokens, de modo que la salida es una probabilidad calibrada entre 0 y 1. Esta formulación permite además definir instrucciones personalizadas por tarea, idioma o dominio.

El prompt sigue la plantilla de chat de Qwen con un bloque de sistema que instruye al modelo a juzgar si el documento cumple los requisitos de la consulta, seguido del par consulta-documento y un bloque de asistente con modo de pensamiento vacío. La exportación a ONNX conserva las entradas `input_ids`, `attention_mask` y `position_ids`, y expone la salida `logits`. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original.

## Capacidades

- Reranking de pares consulta-documento con puntuación de relevancia probabilística.
- Recuperación de texto y de código (text retrieval y code retrieval).
- Clasificación de textos y agrupamiento (clustering) a partir de las representaciones del modelo base.
- Minería de bitextos (bitext mining) para corpus paralelos.
- Soporte de instrucciones definidas por el usuario para adaptar el criterio de relevancia a dominios concretos.
- Capacidades multilingües y de texto largo heredadas de Qwen3.
- Ejecución mediante ONNX Runtime con proveedores de ejecución CUDA y CPU.
- Procesamiento por lotes: una consulta contra múltiples documentos o pares alineados uno a uno.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperación inicial con un modelo de embedding, el reranker reordena los candidatos y descarta los irrelevantes antes de pasarlos al generador, mejorando la precisión de las respuestas con un coste adicional bajo gracias a sus 0.6B de parámetros.
- Búsqueda semántica en producción: el formato ONNX permite desplegar el modelo con ONNX Runtime en servidores sin GPU dedicada, manteniendo latencias aceptables para consultas interactivas.
- Búsqueda de código en asistentes de desarrollo: el modelo puede puntuar fragmentos de código recuperados frente a una consulta en lenguaje natural, aprovechando las capacidades de code retrieval de la familia Qwen3 Embedding.
- Filtrado de resultados en motores de búsqueda internos: dado un conjunto de documentos candidatos, el modelo asigna una probabilidad de relevancia que permite aplicar umbrales configurables y reducir el ruido en los resultados mostrados.
- Deduplicación y clustering de documentos: las representaciones del modelo base permiten agrupar documentos similares en tareas de organización de corpus.
- Construcción de corpus paralelos: la capacidad de bitext mining facilita la alineación de oraciones entre idiomas para proyectos de traducción o entrenamiento.
- Evaluación de calidad en sistemas de atención al cliente: el reranker puede puntuar la pertinencia de artículos de ayuda recuperados frente a la consulta de un usuario antes de mostrarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo de embedding de 8B de la misma familia alcanzó la primera posición en el leaderboard MTEB multilingüe (puntuación 70.58, a fecha de 5 de junio de 2025), pero no se proporcionan cifras específicas para el reranker de 0.6B.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.2 GB en precisión completa (tamaño del repositorio), con margen adicional para activaciones y lotes; el consumo real depende de la longitud de secuencia y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para lotes pequeños; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El modelo también se ejecuta en CPU mediante el proveedor `CPUExecutionProvider`.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna, e incluso en equipos sin GPU dedicada mediante ONNX Runtime en CPU.
- Opciones de despliegue: ONNX Runtime (con proveedores CUDA y CPU), integración en servicios Python propios; el repositorio no documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son adecuados para este tipo de modelo de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, del proveedor de ejecución y de la longitud de los documentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-Reranker-0.6B-ONNX (este) | 0.6B | 32k (modelo base); 2048 en el ejemplo | ONNX | Apache-2.0 | Exportación ONNX de un reranker de la familia Qwen3 |
| Qwen3-Reranker-4B | 4B | 32k (modelo base) | safetensors | Apache-2.0 | Mayor capacidad, mayor coste de inferencia; misma familia |
| Qwen3-Reranker-8B | 8B | 32k (modelo base) | safetensors | Apache-2.0 | El más capaz de la familia; requiere GPU con más VRAM |
| bge-reranker-base | Aproximadamente 0.3B | 512 tokens | safetensors, ONNX | MIT | Alternativa ligera de BAAI; contexto mucho menor |

La comparación con modelos de otras familias se limita a datos generales, ya que no se dispone de resultados de benchmarks del modelo de 0.6B en la información proporcionada. La ventaja principal de esta variante frente a las de 4B y 8B es su reducido coste computacional y su disponibilidad en ONNX, lo que facilita despliegues en CPU.

## Limitaciones y advertencias

- Modelo de reranking, no generativo: no debe usarse para generar texto pese a que la etiqueta del pipeline sea `text-generation`; su función es puntuar pares consulta-documento.
- El ejemplo de uso trunca las entradas a 2048 tokens; documentos más largos requieren ajustar `max_length` y asumir el coste computacional correspondiente.
- La calidad del reranking depende de la instrucción proporcionada; instrucciones mal formuladas pueden degradar las puntuaciones.
- Riesgo de sesgos heredados del corpus de entrenamiento de Qwen3; no se documentan evaluaciones de sesgo específicas para este modelo.
- Riesgo de alucinación no aplica en el sentido generativo, pero el modelo puede asignar puntuaciones altas a documentos superficialmente relevantes; se recomienda calibrar umbrales con datos propios.
- La lista concreta de idiomas soportados no está documentada en el repositorio; la familia Qwen3 es multilingüe, pero la cobertura por idioma no se detalla.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; al ser un espejo, conviene verificar la procedencia y fijar el commit para reproducibilidad.
- El repositorio es una copia no modificada de otra exportación; no debe esperarse soporte ni mantenimiento por parte del autor original en esta ubicación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CycoAI/Qwen3-Reranker-0.6B-ONNX
- Exportación ONNX original: https://huggingface.co/zhiqing/Qwen3-Reranker-0.6B-ONNX/tree/21fb0d00576b976132dbe2acb651dd9639881ecb
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
