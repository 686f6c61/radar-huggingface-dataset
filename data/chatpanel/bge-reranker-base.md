# ChatPanel/bge-reranker-base

## Resumen

ChatPanel/bge-reranker-base es una copia sin modificaciones del modelo Xenova/bge-reranker-base, publicado por el proyecto ChatPanel para centralizar la descarga de los modelos que utiliza su pasarela (gateway). No se ha reentrenado, convertido ni editado ningún fichero: los pesos son idénticos byte a byte a los del repositorio upstream, en el commit `280bcc27a84e0b898c251e06fddb25171bd9b101`. El modelo original es BAAI/bge-reranker-base, un cross-encoder de la familia BGE desarrollado por el Beijing Academy of Artificial Intelligence (BAAI) para tareas de reranking en pipelines de recuperación de información.

La arquitectura subyacente es XLM-RoBERTa en configuración base, exportada a ONNX y cuantizada para inferencia eficiente en CPU y entornos sin GPU. Su función es puntuar pares consulta-documento para reordenar los resultados de un retriever (típicamente bi-encoder) en sistemas RAG, búsqueda semántica y motores de preguntas y respuestas. El repositorio ocupa 0,3 GB y se distribuye bajo licencia MIT.

Es relevante para desarrolladores que despliegan RAG en producción con ONNX Runtime, ya que ofrece un artefacto listo para usar con hashes SHA-256 verificables y una licencia permisiva. La autoría y el crédito del modelo corresponden a BAAI; este repositorio es únicamente una réplica de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (cross-encoder), exportado a ONNX |
| Parametros totales | no disponible (arquitectura base de XLM-RoBERTa; el número exacto no figura en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (`onnx/model_quantized.onnx`, con `quantize_config.json`) |
| Idiomas soportados | no disponible (XLM-RoBERTa es multilingüe por diseño, pero la model card no lo declara) |
| Licencia | MIT |
| Formato de pesos | ONNX cuantizado; tokenizer SentencePiece (`sentencepiece.bpe.model`, `tokenizer.json`) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa en su variante base. A diferencia de los bi-encoders, que codifican consulta y documento por separado, un cross-encoder procesa ambos concatenados y produce una puntuación de relevancia conjunta, lo que mejora la precisión del ranking a costa de mayor coste computacional por par evaluado. Esta copia concreta es la exportación ONNX de Xenova, cuantizada para reducir el tamaño y acelerar la inferencia.

No se dispone de información sobre el entrenamiento original en la documentación proporcionada: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El autor de este repositorio declara explícitamente que no ha reentrenado, convertido ni editado los ficheros respecto al upstream. La innovación técnica de esta réplica es únicamente la distribución verificable mediante hashes SHA-256 de cada fichero (`config.json`, `onnx/model_quantized.onnx`, `quantize_config.json`, `sentencepiece.bpe.model`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`).

## Capacidades

- Reranking de pares consulta-documento: asigna una puntuación de relevancia que permite reordenar los resultados de un retriever previo.
- Integración en pipelines RAG: segunda etapa de recuperación tras un bi-encoder o búsqueda léxica.
- Búsqueda semántica y motores de preguntas y respuestas sobre corpus documentales.
- Inferencia en CPU mediante ONNX Runtime gracias al modelo cuantizado.
- Capacidades multilingües: no declaradas en la model card de este repositorio; el modelo base XLM-RoBERTa es multilingüe por arquitectura, pero no se confirma el alcance idiomático.
- No soporta generación de texto, tool calling, agentes ni modos de razonamiento: es un modelo de scoring, no un LLM generativo.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar los N documentos candidatos con un bi-encoder, el cross-encoder puntúa cada par consulta-documento y reordena los resultados antes de pasarlos al LLM generador, mejorando la precisión del contexto inyectado.
- Búsqueda semántica en bases de conocimiento internas: reordenar resultados de un motor de búsqueda vectorial para priorizar los fragmentos más relevantes en documentación técnica o wikis corporativas.
- Atención al cliente con base de conocimiento: seleccionar los artículos de ayuda más pertinentes antes de que un LLM redacte la respuesta, reduciendo alucinaciones por contexto irrelevante.
- Sistemas de preguntas y respuestas sobre documentación legal o normativa: puntuar fragmentos largos y descartar los de baja relevancia antes de la etapa generativa.
- Deduplicación y filtrado de resultados: usar las puntuaciones del cross-encoder para eliminar candidatos por debajo de un umbral en pipelines de recuperación a gran escala.
- Despliegue en entornos sin GPU: al estar exportado a ONNX cuantizado, puede ejecutarse en CPU con ONNX Runtime, lo que lo hace adecuado para servicios en contenedores ligeros o edge.
- Evaluación offline de retrievers: comparar la calidad de distintos modelos de embedding midiendo cómo el reranker reordena sus salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,3 GB, por lo que la inferencia en CPU es viable con el modelo cuantizado.
- GPU recomendadas: no especificadas en la información proporcionada; al ser un modelo base de tamaño moderado y exportado a ONNX, puede ejecutarse en GPU consumer, pero no se confirman modelos concretos.
- Cabe en GPU consumer: previsiblemente sí por el tamaño del artefacto, aunque no se dispone de cifras oficiales de memoria en inferencia.
- Opciones de despliegue: ONNX Runtime es la vía natural dado el formato; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM generativos, no a cross-encoders).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| ChatPanel/bge-reranker-base | XLM-RoBERTa base (cross-encoder) | ONNX cuantizado | MIT | Hugging Face |
| Xenova/bge-reranker-base | XLM-RoBERTa base (cross-encoder) | ONNX | MIT (upstream) | Hugging Face |
| BAAI/bge-reranker-base | XLM-RoBERTa base (cross-encoder) | safetensors/PyTorch | MIT (upstream) | Hugging Face |

La diferencia entre los tres repositorios es exclusivamente de distribución y formato: BAAI/bge-reranker-base es el original en PyTorch, Xenova/bge-reranker-base es la exportación ONNX de la que deriva esta copia, y ChatPanel/bge-reranker-base replica esa exportación sin cambios. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es una réplica de distribución, no un modelo propio: cualquier problema de calidad, sesgo o rendimiento debe atribuirse al modelo original de BAAI y no a este repositorio.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; su única salida es una puntuación de relevancia.
- Riesgo de sesgo heredado del corpus de entrenamiento original de XLM-RoBERTa y de los datos de ajuste de BGE, no documentado en esta model card.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de puntuaciones erróneas en dominios alejados de los datos de entrenamiento.
- Longitud de contexto e idiomas soportados no declarados en la información disponible; conviene consultar la model card upstream antes de usarlo en producción.
- Licencia MIT permisiva para uso comercial, heredada del upstream; se recomienda verificar la licencia del modelo base BAAI/bge-reranker-base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no aporta señal de validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/bge-reranker-base
- Upstream directo (Xenova): https://huggingface.co/Xenova/bge-reranker-base
- Modelo base original (BAAI): https://huggingface.co/BAAI/bge-reranker-base
