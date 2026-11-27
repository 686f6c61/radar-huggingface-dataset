# Booooooooooooo/alqac2026-phobert-large-nli

## Resumen

El modelo `Booooooooooooo/alqac2026-phobert-large-nli` es un cross-encoder de clasificación de pares (pregunta, evidencia) entrenado como verificador de NLI (Natural Language Inference) para un sistema de recuperación de información legal. Se construye sobre el encoder `vinai/phobert-large`, un transformer monolingüe para vietnamita, y se afina sobre el conjunto de datos ALQAC2026, en el marco de un trabajo de fin de grado sobre Legal Information Retrieval.

La tarea que resuelve es el re-ranking y la verificación de evidencia: dado un par formado por una consulta legal y un fragmento normativo recuperado, el modelo asigna una probabilidad de que el fragmento sea evidencia de apoyo (entailment) frente a no relevante o contradictorio (contradiction). Es, por tanto, un componente de segunda etapa dentro de un pipeline de RAG legal, no un modelo generativo.

Su relevancia es acotada y específica: se trata de un modelo de 369 millones de parámetros, de uso monolingüe (vietnamita), publicado con licencia MIT y sin descargas ni validación comunitaria en el momento de la consulta. Resulta útil para quien construya sistemas de question answering sobre normativa vietnamita y necesite un verificador ligero y desplegable en una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, base `vinai/phobert-large`), cross-encoder de clasificación por pares |
| Parametros totales | 369.165.314 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento); el ejemplo de la model card tokeniza a 512, inconsistente con el entrenamiento |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantización posible vía herramientas externas) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,5 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en `vinai/phobert-large`, un encoder tipo RoBERTa preentrenado para vietnamita. Sobre esa base se añade una cabeza de clasificación de secuencias con dos etiquetas: `0` para contradicción o no relevancia y `1` para entailment o evidencia de apoyo. La entrada es el par (pregunta, evidencia) concatenado por el tokenizador, con una longitud máxima de 256 tokens durante el entrenamiento.

El entrenamiento se realiza sobre el conjunto ALQAC2026, en el contexto de un sistema de recuperación de información legal. La model card menciona una agregación tipo "bag" con operación `max`, lo que sugiere que el verificador se aplica sobre múltiples fragmentos candidatos y se toma la puntuación máxima como señal de relevancia del documento. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a un encoder de clasificación). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación binaria de pares (pregunta, evidencia) en vietnamita: entailment frente a contradicción o no relevancia.
- Puntuación de relevancia para re-ranking de candidatos en pipelines de recuperación legal.
- Verificación de evidencia para sistemas de question answering basados en recuperación (RAG).
- Agregación a nivel de documento mediante máximo de puntuaciones sobre fragmentos ("bag aggregation: max").
- Salida de logits y probabilidad vía `sigmoid(logits[:,1] - logits[:,0])`, tal como documenta el autor.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades generativas, de visión ni de audio.
- Multilingüismo: únicamente vietnamita.

## Casos de uso

- Re-ranking en recuperación legal: tras una primera etapa de búsqueda (BM25 o embeddings), el modelo puntúa cada par (consulta, artículo) y reordena los candidatos; su naturaleza de cross-encoder captura interacciones finas entre pregunta y evidencia que un bi-encoder no modela.
- Verificación de evidencia en RAG legal: antes de pasar los fragmentos recuperados a un LLM generador, el verificador filtra los no relevantes y reduce alucinaciones por contexto contaminado.
- Question answering sobre normativa vietnamita: integrado en un pipeline de dos etapas (retrieval + verificación), permite responder consultas como plazos de prescripción o sanciones administrativas citando el artículo correcto.
- Filtrado de candidatos a escala de documento: con la agregación `max` sobre fragmentos, se puede puntuar un documento completo a partir de sus pasajes y descartar los que no contienen evidencia de apoyo.
- Construcción de datasets de entrenamiento: las puntuaciones del verificador permiten etiquetar pares débiles y generar datos de entrenamiento para etapas posteriores o para modelos de recuperación.
- Asistencia a revisión documental jurídica: priorización de artículos potencialmente aplicables en un expediente, dejando la decisión final al operador jurídico.
- Despliegue en infraestructura modesta: al ser un encoder de 369 M de parámetros, cabe en una GPU de consumo y permite servir verificaciones con baja latencia en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,5 GB solo para pesos, más activaciones y overhead del runtime; en la práctica, del orden de 2 a 4 GB según el tamaño de lote y la longitud de secuencia.
- VRAM estimada en fp16: en torno a 0,8 GB para pesos, con un total práctico de 1,5 a 2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o RTX 4090 son suficientes. En entornos de servidor, A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para alto throughput por batching.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer con 4 GB o más.
- Opciones de despliegue: `transformers` con PyTorch (documentado por el autor), `text-embeddings-inference` o `TGI` para servir clasificación, `ONNX Runtime` y `Optimum` para exportación, y `llama.cpp` no aplica por no ser un modelo generativo GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Booooooooooooo/alqac2026-phobert-large-nli` | 369 M | 256 | NLI legal en vietnamita | MIT | Hugging Face, sin descargas |
| `vinai/phobert-large` (modelo base) | ~370 M | 256 | Encoder general vietnamita | MIT | Hugging Face, ampliamente usado |
| `vinai/phobert-base` | ~135 M | 256 | Encoder general vietnamita | MIT | Hugging Face, ampliamente usado |

La comparación con alternativas específicas de NLI legal en vietnamita no está disponible en la información proporcionada. El modelo base `vinai/phobert-large` sirve como referencia de arquitectura y tamaño, pero no está afinado para la tarea de verificación.

## Limitaciones y advertencias

- Modelo monolingüe en vietnamita: no es utilizable para consultas o evidencia en castellano ni en otros idiomas sin reentrenamiento.
- Longitud máxima de entrenamiento de 256 tokens, mientras que el ejemplo de uso de la model card tokeniza a 512; esta inconsistencia puede degradar el rendimiento en pares largos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación de evidencia; no se han publicado métricas de precisión, recall ni F1.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un corpus legal vietnamita concreto (ALQAC2026), puede heredar los sesgos de cobertura y estilo de ese corpus.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de verificación independiente de calidad.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base `vinai/phobert-large` debe verificarse por separado en cuanto a sus términos.
- Uso en producción: requiere evaluación propia sobre el dominio objetivo; no debe emplearse como única fuente de verdad jurídica.
- No es un modelo generativo: no puede producir respuestas, solo puntuar pares.

## Enlaces

- Hugging Face: https://huggingface.co/Booooooooooooo/alqac2026-phobert-large-nli
- Modelo base: https://huggingface.co/vinai/phobert-large
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
