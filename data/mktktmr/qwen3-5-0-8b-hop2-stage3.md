# mktktmr/qwen3.5-0.8b-hop2-stage3

## Resumen

`mktktmr/qwen3.5-0.8b-hop2-stage3` es un ajuste fino mediante LoRA (fusionado posteriormente en los pesos del modelo base) de `Qwen/Qwen3.5-0.8B`, publicado por el usuario `mktktmr` en Hugging Face. El modelo está especializado en una tarea muy concreta dentro de pipelines de recuperación de información multihop: dado un par de pregunta y documentos recuperados, junto con una lista de candidatos a títulos de artículos, debe seleccionar el siguiente artículo que conviene consultar. Es, por tanto, un componente de enrutamiento de búsqueda, no un modelo conversacional general.

El modelo base pertenece a la familia Qwen3.5, con aproximadamente 853 millones de parámetros según los pesos en safetensors del repositorio (1,7 GB). El ajuste se ha entrenado sobre JEMHopQA y un conjunto de chunks derivados de Wikipedia en japonés, lo que sitúa el foco lingüístico principal en el japonés y en tareas de question answering multihop. El repositorio no incluye información sobre licencia, idiomas declarados ni pipeline de uso.

La relevancia de este modelo es acotada pero clara para quien construye sistemas RAG o de búsqueda iterativa en japonés: ofrece un selector de siguiente paso entrenado específicamente para esa decisión, lo que puede reducir el número de llamadas a un modelo mayor en cada iteración de recuperación. No obstante, la ausencia de métricas publicadas, de licencia explícita y de documentación adicional limita su adopción en producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajustado con LoRA y fusionado |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible oficialmente; los datos de entrenamiento son en japonés |
| Licencia | no disponible en el repositorio; el modelo base Qwen/Qwen3.5-0.8B se declara Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen3.5 con unos 853 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA, que posteriormente se fusionó en los pesos del modelo, de modo que el artefacto publicado es un checkpoint denso estándar en safetensors, sin adaptadores separados. No se documentan detalles sobre rango del LoRA, hiperparámetros, número de pasos ni composición exacta del dataset más allá de las fuentes citadas.

Los datos de entrenamiento declarados son JEMHopQA (licencia CC BY-SA 4.0, filtrado y reformateado para la tarea) y un conjunto de chunks distribuidos derivados de Wikipedia en japonés (también CC BY-SA 4.0). La tarea aprendida es de clasificación/selección: a partir de la pregunta, los documentos ya recuperados y una lista de títulos candidatos, el modelo emite un único título como siguiente consulta. No se menciona RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Selección del siguiente término o artículo de búsqueda en pipelines de recuperación multihop en japonés.
- Procesamiento conjunto de pregunta, documentos recuperados y lista de candidatos a títulos en una sola entrada.
- Salida restringida a una elección entre los candidatos proporcionados, lo que simplifica el parseo en producción.
- Especialización lingüística en japonés derivada de los datos de entrenamiento (JEMHopQA y Wikipedia japonesa).
- No se documenta soporte de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido.
- No se documentan capacidades multilingües más allá del japonés.

## Casos de uso

- Búsqueda iterativa en RAG multihop en japonés: el modelo recibe la pregunta original, los fragmentos ya recuperados y la lista de títulos candidatos, y devuelve el siguiente artículo a consultar; encaja como paso de enrutamiento entre iteraciones del retriever.
- Reducción de coste en pipelines agénticos: al delegar la decisión de siguiente consulta a un modelo de 0,85 B en lugar de a un LLM grande, se abarata cada iteración de recuperación en sistemas con muchas rondas.
- Enrutamiento de consultas en bases documentales japonesas: dado un índice de títulos y un estado parcial de evidencia, el modelo elige la siguiente rama del grafo de documentos.
- Construcción de grafos de conocimiento a partir de Wikipedia japonesa: el selector permite recorrer enlaces entre artículos de forma dirigida por la pregunta, generando trayectorias de evidencia para anotación o evaluación.
- Evaluación y depuración de retrievers: al fijar el modelo como política de siguiente paso, se puede medir de forma aislada la calidad del retriever comparando trayectorias esperadas frente a elegidas.
- Prototipado de asistentes de investigación documental en japonés: integrado en un orquestador que combine un LLM generador con este selector, se obtiene un flujo de pregunta-respuesta con evidencia trazable a nivel de artículo.
- Filtrado de candidatos en sistemas de FAQ o soporte técnico con documentación jerárquica: el modelo descarta ramas irrelevantes antes de invocar un modelo mayor, reduciendo tokens de contexto enviados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7-2 GB solo para pesos, más overhead de activaciones y KV cache; con contextos largos el consumo crece de forma proporcional a la longitud de contexto configurada.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9-1,2 GB para pesos; en 4 bits, alrededor de 0,5-0,7 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para fp16 en contextos moderados; para despliegue con concurrencia se recomienda RTX 4090, L4, A10G o superiores.
- Cabe holgadamente en GPU consumer; también es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: transformers con PyTorch, vLLM y TGI para servir con batching; llama.cpp u Ollama requerirían convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 0,85 B, en una RTX 4090 se espera latencia por debajo de decenas de milisegundos para entradas cortas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-hop2-stage3 | 852.985.920 | no disponible | Selección de siguiente artículo en búsqueda multihop (japonés) | no disponible en el repo | Hugging Face, safetensors |
| Qwen/Qwen3.5-0.8B (base) | ~0,85 B | no disponible en la informacion proporcionada | Modelo generalista | Apache-2.0 | Hugging Face |
| Modelos de reranking multilingües tipo bge-reranker | variable (decenas a cientos de millones) | típicamente 512-8192 tokens | Reranking de pasajes | variable según modelo | Hugging Face, integraciones en frameworks RAG |

La comparación directa con alternativas de la misma categoría es limitada: no se dispone de métricas del modelo ni de detalles de contexto que permitan contrastar rendimiento. Frente al modelo base, la diferencia es la especialización en la tarea de selección; frente a rerankers convencionales, la tarea es distinta (elegir siguiente documento frente a puntuar pasajes).

## Limitaciones y advertencias

- No se publica licencia en el repositorio; aunque el modelo base es Apache-2.0, los datos de entrenamiento incluyen material CC BY-SA 4.0 (JEMHopQA y Wikipedia japonesa), lo que exige revisar obligaciones de atribución y compartir igual antes de un uso comercial.
- Ausencia total de benchmarks, evaluaciones y métricas de calidad: no hay evidencia publicada de que supere a alternativas genéricas en la tarea.
- Riesgo de alucinación en la selección: si los candidatos no están bien formateados o el modelo no reconoce la tarea, puede emitir un título fuera de la lista o texto libre; se recomienda validar la salida contra el conjunto de candidatos.
- Fuerte sesgo lingüístico hacia el japonés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Longitud de contexto no documentada: entradas con muchos documentos recuperados o listas de candidatos largas pueden truncarse sin aviso claro.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni model card extendida: madurez y mantenimiento inciertos.
- Especialización muy estrecha: no debe emplearse como modelo generativo general ni como sustituto de un LLM conversacional.
- No se documentan sesgos específicos, pero al derivarse de Wikipedia japonesa puede heredar sesgos de cobertura y de redacción de esa fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-hop2-stage3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA (dataset): https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
