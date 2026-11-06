# nimishph/anvesa-code-1b

## Resumen

anvesa-code-1b es un encoder especializado en búsqueda de código, desarrollado por nimishph como componente del motor de búsqueda semántica [anvesa](https://github.com/nimishph/anvesa). Se trata de un fine-tuning del encoder Ettin-1B de jhu-clsp (licencia MIT), ajustado sobre 105 repositorios con licencia MIT para generar embeddings de fragmentos de código (symbol cards) orientados a recuperación. El modelo no genera texto: es un extractor de características que produce vectores de 512 tokens, con mean pooling sobre tokens reales y normalización L2, sin prefijos de instrucción.

Su relevancia radica en que ofrece una alternativa ligera y desplegable en CPU para retrieval de código, con métricas publicadas frente a un baseline popular como all-MiniLM-L6-v2. El paquete se distribuye en formato ONNX (fp32) junto con un ranker XGBoost entrenado sobre las puntuaciones del propio encoder, lo que permite una segunda etapa de reordenación sin coste adicional de inferencia neuronal.

La información disponible es limitada: no se publican detalles sobre el dataset de entrenamiento más allá del número de repositorios, ni resultados de benchmarks estándar de código, ni lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base jhu-clsp/ettin-encoder-1b |
| Parametros totales | 1B (heredados del modelo base; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 (ONNX); no se documentan otras |
| Idiomas soportados | no disponible (entrenado sobre repositorios, principalmente código) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data`), `tokenizer.json`; ranker en JSON (`ranker-noword.json`) |

## Arquitectura y entrenamiento

El modelo se basa en Ettin-encoder-1b de jhu-clsp, un encoder de la familia ModernBERT con 1B de parámetros. Sobre esa base se aplicó un fine-tuning orientado a retrieval de código utilizando 105 repositorios con licencia MIT. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de contraste (p. ej. InfoNCE) o hard negatives; tampoco se documenta RLHF/DPO, algo esperable en un encoder de retrieval.

El pipeline de inferencia es explícito: mean pooling sobre tokens reales, normalización L2, ventana de 512 tokens y ausencia de prefijos de tarea. Los embeddings se calculan sobre las "symbol cards" de anvesa, excluyendo la línea de ruta WQL. Adicionalmente se publica `ranker-noword.json`, un ranker XGBoost con 20 features (sin solapamiento de palabras) entrenado sobre las puntuaciones del encoder, que actúa como segunda etapa de reordenación.

## Capacidades

- Generación de embeddings densos para búsqueda semántica de código (feature-extraction).
- Recuperación de símbolos y fragmentos de código a partir de consultas en lenguaje natural o en código.
- Representación de "symbol cards" de anvesa sin la línea de ruta WQL.
- Reordenación de resultados mediante el ranker XGBoost incluido (20 features, sin word overlap).
- Inferencia en CPU viable (373 ms por tarjeta con ONNX Runtime y 12 hilos).
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Búsqueda semántica de código en IDE o herramienta interna: indexar los símbolos de un repositorio con este encoder y resolver consultas en lenguaje natural contra el índice vectorial, con el ranker como segunda etapa para mejorar la precisión.
- Navegación de bases de código grandes: generar embeddings de todas las symbol cards de un monorepo y ofrecer búsqueda por intención ("dónde se valida el token JWT") en lugar de por coincidencia literal.
- Asistente de documentación de API: recuperar la definición y el contexto de una función a partir de una descripción funcional, alimentando luego un LLM generador con los fragmentos recuperados (patrón RAG sobre código).
- Deduplicación y clustering de símbolos: usar los embeddings normalizados para detectar funciones duplicadas o agrupar utilidades similares en un proceso de refactorización.
- Despliegue en entornos sin GPU: al ejecutarse en ONNX Runtime sobre CPU con latencias de ~373 ms por tarjeta, encaja en CI/CD o servicios internos con presupuesto de hardware limitado.
- Evaluación comparativa de pipelines de retrieval: servir como baseline reproducible (métricas publicadas en corpus test y bench) frente a otros encoders de código en tareas de búsqueda interna.

## Benchmarks y rendimiento

Datos publicados en la model card (métrica de recuperación, mayor es mejor):

| Configuracion | Corpus test (1.710 queries generadas, 57 repos, 13 lenguajes) | Bench (241 queries manuales, 8 repos) |
|---|---|---|
| Primera etapa, hub penalty 0.3 | 0.352 | 0.685 |
| Con ranker | 0.370 | 0.699 |
| all-MiniLM-L6-v2 (sin ranker) | 0.293 | 0.547 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica estrictamente; el modelo se distribuye en fp32 ONNX y el repo ocupa 4,1 GB, por lo que en GPU requeriría del orden de 4-5 GB para pesos más activaciones.
- GPU recomendadas: cualquier GPU con ≥8 GB (RTX 3060/4060, RTX 4090, A100, H100); no se documentan cifras de throughput en GPU.
- CPU: viable; 373 ms por tarjeta con ONNX Runtime y 12 hilos.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: ONNX Runtime (documentado), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles; no se documenta soporte de vLLM, llama.cpp ni Ollama (no aplica a un encoder ONNX).
- Latencia/throughput: solo se publica la cifra de CPU indicada; el resto no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anvesa-code-1b | 1B (base Ettin-1B) | 512 | Encoder de retrieval de código + ranker | MIT | Hugging Face (ONNX) |
| all-MiniLM-L6-v2 | ~22M | 256 | Encoder generalista de frases | Apache-2.0 | Hugging Face, ampliamente integrado |
| jhu-clsp/ettin-encoder-1b | 1B | no disponible en esta ficha | Encoder generalista (modelo base) | MIT | Hugging Face |

La comparación de rendimiento solo está disponible frente a all-MiniLM-L6-v2 en las dos métricas de la model card (0.352/0.685 frente a 0.293/0.547 en primera etapa). No hay datos comparativos con otros encoders de código especializados.

## Limitaciones y advertencias

- Información de entrenamiento muy escasa: 105 repositorios MIT, sin detalle de tokens, composición ni estrategia de negativos; la generalización a otros dominios (lenguajes no presentes, código propietario) es incierta.
- Ventana de 512 tokens: los símbolos o fragmentos más largos se truncan, lo que puede degradar la recuperación en funciones extensas.
- Sesgo de dominio: al entrenarse sobre repositorios concretos, puede favorecer patrones y convenciones de esos proyectos.
- Riesgo de falsos positivos en retrieval: los embeddings normalizados no garantizan relevancia; el ranker mitiga parcialmente el problema, pero las métricas absolutas (~0.35-0.70) indican margen de error considerable.
- Idiomas no documentados: no se puede asumir buen rendimiento en consultas en castellano u otros idiomas distintos del inglés/código.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de los repositorios usados en el entrenamiento si se redistribuye el modelo.
- Ecosistema limitado: 11 descargas y 0 likes en el momento de la consulta; sin comunidad ni mantenimiento demostrado, lo que supone riesgo para producción.
- No es un modelo generativo: no debe usarse para completar código ni para tareas que requieran salida de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nimishph/anvesa-code-1b
- Repositorio del proyecto anvesa: https://github.com/nimishph/anvesa
- Modelo base Ettin-encoder-1b: https://huggingface.co/jhu-clsp/ettin-encoder-1b
- Baseline all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
