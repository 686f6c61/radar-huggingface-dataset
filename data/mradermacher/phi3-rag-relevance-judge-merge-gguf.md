# mradermacher/phi3-rag-relevance-judge-merge-GGUF

## Resumen

phi3-rag-relevance-judge-merge es un modelo de lenguaje de 3.821 millones de parámetros (aproximadamente 3,8 mil millones), derivado del modelo base grounded-ai/phi3-rag-relevance-judge-merge, que a su vez parte de la familia Phi-3 de Microsoft. La versión aquí documentada es una cuantización GGUF estática publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, el 11 de marzo de 2025. El modelo está diseñado, por su nombre y procedencia, como un juez de relevancia para pipelines de generación aumentada por recuperación (RAG): evalúa si un fragmento de contexto recuperado es relevante para una consulta dada.

El modelo resuelve un problema concreto en arquitecturas RAG: filtrar o puntuar documentos recuperados antes de pasarlos al generador, reduciendo ruido y alucinaciones. Al estar empaquetado en formato GGUF con múltiples niveles de cuantización (desde Q2_K de 1,5 GB hasta f16 de 7,7 GB), está pensado para ejecutarse en hardware modesto, incluyendo CPU y GPUs de consumo, lo que lo hace atractivo para desplegar un componente de juicio dentro de un pipeline RAG local.

La relevancia actual del modelo radica en su tamaño compacto y su orientación específica a una tarea de clasificación/juicio, lo que permite integrarlo como paso intermedio de bajo coste en sistemas RAG sin necesidad de un LLM grande. No obstante, la información pública disponible es escasa: no se detallan datos de entrenamiento, benchmarks ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Phi-3; detalles específicos no disponibles) |
| Parametros totales | 3.821.079.552 (3,8 mil millones) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Phi-3, que emplea una arquitectura transformer densa (no MoE) con aproximadamente 3,8 mil millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de alineación como RLHF o DPO. El nombre del modelo sugiere un ajuste específico para la tarea de juzgar la relevancia de fragmentos recuperados en contextos RAG, probablemente mediante fine-tuning supervisado sobre el modelo Phi-3 original, pero no se dispone de confirmación ni de detalles técnicos adicionales.

La versión documentada aquí es una cuantización estática realizada por mradermacher mediante herramientas de conversión a GGUF. El autor indica que no se han generado cuantizaciones ponderadas/imatrix para este modelo, solo cuantizaciones estáticas. La conversión se realizó a partir del modelo en formato Hugging Face (convert_type: hf), con un output_tensor_quantised de 1.

## Capacidades

- Generación de texto conversacional (el modelo está etiquetado como "conversational").
- Juicio de relevancia de fragmentos de contexto para consultas, presumiblemente su función principal según el nombre del modelo.
- Capacidad de razonamiento y evaluación de pares consulta-documento (inferida del nombre y propósito, no confirmada explícitamente en la documentación).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Filtrado de documentos en pipelines RAG: el modelo puede puntuar cada fragmento recuperado por un retriever (por ejemplo, búsqueda vectorial) y descartar los irrelevantes antes de pasarlos al LLM generador, reduciendo el ruido y las alucinaciones. Su tamaño compacto permite ejecutarlo en el mismo servidor que el retriever sin coste elevado.
- Reordenación (reranking) ligera de resultados: tras una recuperación inicial amplia, el modelo evalúa la relevancia de cada candidato y reordena la lista, mejorando la precisión del contexto final con una latencia baja gracias a sus cuantizaciones de 2-3 GB.
- Despliegue en entornos con recursos limitados: al caber en cuantizaciones Q4_K_M de 2,5 GB, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB) o incluso en CPU, lo que lo hace viable para prototipos y sistemas en producción de bajo presupuesto.
- Evaluación automática de calidad de recuperación: útil para medir y monitorizar la relevancia de los documentos recuperados en un sistema RAG en producción, generando métricas de calidad del retriever de forma continua.
- Componente de juicio en sistemas de pregunta-respuesta sobre documentación técnica: integrado en un pipeline que recupera fragmentos de manuales o documentación y necesita decidir qué pasajes son pertinentes antes de generar la respuesta.
- Prototipado rápido de arquitecturas RAG: al estar disponible en GGUF y ser compatible con llama.cpp/Ollama, permite a desarrolladores experimentar con un juez de relevancia local sin depender de APIs externas ni de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB (Q2_K), 2,3-2,5 GB (Q4_K_S/Q4_K_M), 2,9 GB (Q5_K_M), 3,2 GB (Q6_K), 4,2 GB (Q8_0) y 7,7 GB (f16), según los tamaños de archivo publicados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput. Para f16 se recomienda al menos 8-10 GB de VRAM.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6-8 GB o más para cuantizaciones de calidad media-alta; las cuantizaciones Q2-Q4 caben incluso en GPUs de gama baja.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers. No se confirma soporte en vLLM o TGI para la versión GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| phi3-rag-relevance-judge-merge (este) | 3,8 mil M | no disponible | GGUF | no disponible | Juez de relevancia RAG, solo inglés |
| Phi-3-mini (Microsoft) | 3,8 mil M | 4K/128K (según variante) | safetensors, GGUF | MIT (Phi-3-mini) | Modelo generalista base de la familia |
| Qwen2.5-3B | 3,1 mil M | 32K | safetensors, GGUF | Apache 2.0 | Modelo generalista multilingüe |
| Llama-3.2-3B | 3,2 mil M | 128K | safetensors, GGUF | Llama 3.2 Community License | Modelo generalista multilingüe |

La comparativa se basa en el tamaño y la categoría (modelos de ~3-4 mil millones de parámetros). No se dispone de datos de rendimiento específicos para este modelo que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Phi-3, puede heredar sesgos del modelo base.
- Riesgo de alucinación: presente como en cualquier LLM; su uso como juez de relevancia puede producir falsos positivos o negativos, lo que afectaría a la calidad del pipeline RAG.
- Limitaciones de contexto o idioma: solo se declara soporte de inglés; la longitud de contexto no está documentada, lo que impide garantizar el manejo de fragmentos largos.
- Restricciones de licencia para uso comercial: la licencia no está disponible en la información proporcionada, por lo que se desconoce si permite uso comercial. Es imprescindible verificar la licencia del modelo base (grounded-ai/phi3-rag-relevance-judge-merge) y de Phi-3 antes de usarlo en producción.
- Caveats para producción: la información pública es muy limitada (sin benchmarks, sin detalles de entrenamiento, sin contexto documentado); se recomienda evaluar el modelo en el dominio concreto antes de desplegarlo. Las cuantizaciones Q2_K y Q3_K_M pueden degradar la calidad del juicio. No se han generado cuantizaciones imatrix/ponderadas, lo que puede afectar a la calidad en comparación con cuantizaciones avanzadas.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/phi3-rag-relevance-judge-merge-GGUF
- Modelo base: https://huggingface.co/grounded-ai/phi3-rag-relevance-judge-merge
- Página de descargas del cuantizador: https://hf.tst.eu/model#phi3-rag-relevance-judge-merge-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
