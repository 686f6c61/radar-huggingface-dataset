# p4ulbr4dl3y/ru-reranker-edge-150m-GGUF

## Resumen

`ru-reranker-edge-150m-GGUF` es una conversión a formato GGUF del modelo `sshalimov04/ru-reranker-edge-150m`, un cross-encoder basado en ModernBERT especializado en reordenación (reranking) de fragmentos para ruso. El trabajo de conversión lo ha publicado el usuario `p4ulbr4dl3y` en Hugging Face con el objetivo declarado de habilitar el modo `--rerank` de llama.cpp, lo que permite ejecutar la reordenación en local sin depender de infraestructura Python.

El modelo cuenta con 149.605.633 parámetros (aproximadamente 150 M) y se distribuye en un único archivo `edge150m-Q8_0.gguf` de 155 MiB, lo que lo sitúa en la categoría de modelos "edge": ligeros, desplegables en CPU y adecuados para etapas de filtrado en pipelines de recuperación aumentada (RAG). La arquitectura de referencia es ModernBERT, un transformer encoder con atención de contexto largo, aunque la model card no detalla la longitud máxima de contexto efectiva del checkpoint.

La relevancia de esta ficha es doble: por un lado, cubre un hueco práctico en el ecosistema ruso de búsqueda semántica, donde escasean rerankers ligeros empaquetados para llama.cpp; por otro, la información publicada es muy escasa (sin licencia, sin idiomas declarados, sin benchmarks, sin pipeline asignado), por lo que esta ficha debe leerse como una descripción técnica del artefacto disponible y no como una evaluación de calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder, transformer encoder) |
| Parametros totales | 149.605.633 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el autor documenta pruebas con fragmentos de hasta 8192 tokens configurando `-c` |
| Tipos de cuantizacion | Q8_0 (única publicada en el repo) |
| Idiomas soportados | ruso (según descripción del modelo base; no declarado en metadatos de Hugging Face) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`edge150m-Q8_0.gguf`, 155 MiB) |
| Tamaño del repo | 0,2 GB |
| Pipeline declarado | no disponible (etiqueta `feature-extraction`) |
| Compatibilidad | llama.cpp `--rerank --pooling rank` |

## Arquitectura y entrenamiento

El modelo base es un cross-encoder construido sobre ModernBERT, la familia de encoders de Answer.AI y LightOn que moderniza la arquitectura BERT con atención rotatoria (RoPE), Flash Attention y soporte nativo de secuencias largas (hasta 8192 tokens en las variantes estándar). Un cross-encoder procesa conjuntamente la consulta y el fragmento candidato y produce una puntuación de relevancia, lo que lo hace más preciso que un bi-encoder en la etapa de reordenación pero más costoso por par evaluado.

La model card no proporciona detalles sobre el corpus de entrenamiento, el número de tokens vistos, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documenta la función de pérdida ni el esquema de negativos. La innovación técnica destacable de esta publicación no está en el entrenamiento sino en el empaquetado: la conversión a GGUF permite ejecutar el reranker dentro de llama.cpp con `--pooling rank`, y el autor documenta empíricamente que el parámetro `-c` debe dimensionarse al fragmento más largo en lugar de usar el valor por defecto. En sus pruebas, con `-c 8192` cuatro fragmentos costaron 11,2 s, mientras que con `-c 3072` costaron 0,45 s, con una desviación en las puntuaciones no superior a 0,0014 (referencia a `docs/adr/0066-rerank-context-sized-to-fragment.md`).

## Capacidades

- Reordenación de fragmentos (reranking) para consultas en ruso: puntúa pares consulta-documento y devuelve un score de relevancia utilizable para reordenar resultados de un retriever previo.
- Cross-encoding de consulta y pasaje en una sola pasada, con pooling de tipo `rank` en llama.cpp.
- Extracción de características: la etiqueta `feature-extraction` del repo sugiere uso como encoder para obtener representaciones, aunque la función principal documentada es el reranking.
- Procesamiento de fragmentos largos: el autor valida el funcionamiento con fragmentos de hasta 8192 tokens, aunque con un coste computacional muy superior.
- Ejecución local en CPU o GPU mediante llama.cpp, sin dependencias de Python ni de frameworks de deep learning.
- Compatibilidad con endpoints (`endpoints_compatible`): puede servirse detrás de una API compatible con el ecosistema de Hugging Face/llama.cpp.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento extendido; es un modelo discriminativo, no generativo.

## Casos de uso

- RAG sobre corpus en ruso: tras una recuperación inicial con un bi-encoder (por ejemplo, embeddings multilingües), el reranker reordena los 20-50 candidatos y se queda con los 3-5 más relevantes antes de pasarlos al LLM generador. Su tamaño de 150 M permite ejecutarlo en la misma máquina que el generador sin competir por VRAM.
- Búsqueda documental interna: en despachos, administraciones o empresas con documentación en ruso, el modelo puede puntuar resultados de un índice léxico (BM25) o vectorial y mejorar la precisión del top-k sin reindexar el corpus.
- Filtrado en pipelines de atención al cliente: dado un conjunto de artículos de ayuda en ruso, el reranker selecciona el fragmento correcto para cada consulta entrante, reduciendo las respuestas basadas en contexto irrelevante.
- Despliegue en entornos edge o sin GPU: al distribuirse en GGUF Q8_0 de 155 MiB, cabe en dispositivos con poca memoria y puede ejecutarse en CPU con llama.cpp, lo que lo hace apto para aplicaciones de escritorio o servidores modestos.
- Evaluación y depuración de retrievers: el score del cross-encoder sirve como referencia para medir la calidad de un sistema de recuperación existente y detectar consultas donde el bi-encoder falla.
- Moderación y deduplicación semántica: el modelo puede puntuar la similitud consulta-documento para filtrar duplicados o descartar fragmentos que no abordan la consulta antes de costosas llamadas a un LLM.
- Servicio de reranking como microservicio: expuesto mediante una API compatible con endpoints, puede integrarse como etapa independiente en arquitecturas de microservicios de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta mediciones de latencia del propio autor: 11,2 s para cuatro fragmentos con `-c 8192` y 0,45 s con `-c 3072`, con una desviación máxima de 0,0014 en las puntuaciones. No hay datos de MMLU, HumanEval, GSM8K ni métricas de recuperación (nDCG, MRR, Recall@k) para este modelo.

## Requisitos de hardware

- VRAM estimada: en torno a 200-300 MB para el archivo Q8_0 de 155 MiB más el estado de ejecución de llama.cpp; con contexto corto (`-c 3072`) el consumo adicional de KV es reducido.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre sirve; no requiere A100 ni H100. Una RTX 4090 o una RTX 3060 ejecutan el modelo con holgura, pero el cuello de botella será el número de pares consulta-fragmento, no la memoria.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Cabe en CPU: sí; es el escenario natural dada la cuantización Q8_0 y el tamaño del modelo.
- Opciones de despliegue: llama.cpp con `--rerank --pooling rank` (soporte documentado por el autor), servidores compatibles con endpoints de Hugging Face, y cualquier wrapper que invoque llama.cpp. No se documenta soporte nativo en vLLM, TGI u Ollama.
- Latencia y throughput: el autor reporta 0,45 s para cuatro fragmentos con `-c 3072` y 11,2 s con `-c 8192`. El throughput escala linealmente con el número de pares y con la longitud del contexto configurado; dimensionar `-c` al fragmento más largo es la optimización clave.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ru-reranker-edge-150m-GGUF | 149,6 M | no disponible (probado hasta 8192) | GGUF Q8_0 | no disponible | Conversión comunitaria para llama.cpp; sin benchmarks publicados |
| BAAI/bge-reranker-v2-m3 | no disponible en esta ficha | no disponible en esta ficha | safetensors | no disponible en esta ficha | Reranker multilingüe muy extendido; requiere framework Python |
| jina-reranker-v2-base-multilingual | no disponible en esta ficha | no disponible en esta ficha | safetensors | no disponible en esta ficha | Alternativa multilingüe con soporte de ruso; no empaquetada en GGUF de forma oficial |

La comparación cuantitativa no es posible con la información disponible: no se han publicado métricas de recuperación para el modelo descrito ni se dispone en esta ficha de los datos de contexto y licencia de las alternativas. La ventaja diferencial del modelo descrito es el empaquetado GGUF para llama.cpp y su tamaño reducido; su desventaja es la ausencia total de evaluación pública y de licencia declarada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o consultar el modelo base `sshalimov04/ru-reranker-edge-150m` antes de desplegarlo en producción.
- Idiomas no declarados en los metadatos de Hugging Face: aunque la descripción indica ruso, no hay confirmación formal ni evaluación multilingüe.
- Ausencia de benchmarks: no hay métricas de nDCG, MRR o Recall que permitan estimar la calidad del reranking frente a alternativas.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de puntuaciones mal calibradas: al ser un cross-encoder sin documentación de entrenamiento, los scores pueden no ser comparables entre consultas ni entre dominios.
- Sensibilidad al parámetro `-c`: usar el valor por defecto de llama.cpp puede multiplicar la latencia por más de 20 (11,2 s frente a 0,45 s en las pruebas del autor) sin mejora apreciable de las puntuaciones.
- Única cuantización publicada (Q8_0): no hay variantes Q4 o Q5 para reducir aún más el consumo, ni versión en safetensors en este repo.
- Modelo de un solo autor y sin likes ni descargas: no hay validación comunitaria, issues resueltos ni historial de mantenimiento.
- Sesgos: no documentados; al ser un modelo entrenado para ruso, es probable que su rendimiento caiga fuera de ese idioma y que herede sesgos del corpus del modelo base, desconocido.
- Sin soporte documentado en vLLM, TGI u Ollama: la integración está limitada a llama.cpp y a servidores compatibles con endpoints.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/p4ulbr4dl3y/ru-reranker-edge-150m-GGUF
- Modelo base: https://huggingface.co/sshalimov04/ru-reranker-edge-150m
- Repositorio de llama.cpp (soporte `--rerank`): https://github.com/ggml-org/llama.cpp
- Documentación de ModernBERT: https://huggingface.co/docs/transformers/model_doc/modernbert
- Referencia interna del autor sobre dimensionado de contexto: `docs/adr/0066-rerank-context-sized-to-fragment.md` (citada en la model card; no se ha localizado URL pública)
