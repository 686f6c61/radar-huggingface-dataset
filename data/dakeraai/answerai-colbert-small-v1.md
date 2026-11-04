# DakeraAI/answerai-colbert-small-v1

## Resumen

`DakeraAI/answerai-colbert-small-v1` es un espejo verificado del modelo de recuperación por interacción tardía (late interaction) `answerdotai/answerai-colbert-small-v1`, desarrollado originalmente por Answer.AI. No se trata de un modelo generativo, sino de un encoder de recuperación que produce representaciones a nivel de token (contextualized late interaction over BERT, ColBERT) para tareas de búsqueda y ranking de documentos. Este repositorio concreto lo publica Dakera, un motor de memoria autoalojado para agentes de IA, con el objetivo de servir como fuente redundante de descarga en sus despliegues.

El artefacto principal es un único fichero ONNX cuantizado a int8 de 33,9 MB junto con su tokenizador. Se usa como extractor de características (`feature-extraction`) para generar embeddings de tokens que luego se comparan mediante MaxSim, lo que permite un retrieval más preciso que los embeddings densos de un solo vector, a costa de un mayor coste de almacenamiento. Es relevante para pipelines RAG y para sistemas de memoria a largo plazo de agentes, que es exactamente el caso de uso para el que Dakera lo integra.

La ficha se basa en la información disponible del repositorio espejo y en los metadatos de HuggingFace. Los detalles de arquitectura interna, entrenamiento y benchmarks no vienen documentados en esta copia; el autor remite a la model card original de Answer.AI, por lo que los datos no disponibles se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT (late interaction sobre encoder transformer); arquitectura interna no detallada en este repositorio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `model_int8.onnx`) |
| Idiomas soportados | no disponible (el modelo base es de Answer.AI; la copia no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_int8.onnx`, 33,9 MB) + `tokenizer.json` (711,4 kB) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma ColBERT de interacción tardía: un encoder transformer produce un embedding por cada token de la consulta y del documento, y la relevancia se calcula con una suma de similitudes máximas (MaxSim) entre los vectores de ambos. Esto conserva granularidad a nivel de token, lo que suele mejorar la precisión del ranking frente a los embeddings densos de vector único, a cambio de almacenar un vector por token. El repositorio empaqueta el modelo en formato ONNX cuantizado a int8, pensado para inferencia ligera y despliegue autoalojado.

No se dispone en esta copia de información sobre el número de parámetros, la composición del corpus de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de ajuste como destilación o entrenamiento contrastivo. La model card del espejo remite explícitamente a la documentación de Answer.AI para esos detalles, por lo que no se replican aquí datos no verificados.

## Capacidades

- Generación de embeddings a nivel de token para recuperación de documentos (late interaction / ColBERT).
- Ranking y reranking de pasajes mediante MaxSim, útil en pipelines RAG de dos etapas.
- Extracción de características (`feature-extraction`) en formato ONNX, apta para ejecución con ONNX Runtime.
- Integración como backend de retrieval en el motor de memoria de agentes Dakera (`DAKERA_MODEL=colbert-small`).
- Búsqueda híbrida cuando se combina con recuperación léxica o vectorial densa en el sistema anfitrión.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso por sí mismo.
- Capacidades multilingües: no documentadas en esta copia.

## Casos de uso

- Recuperación en pipelines RAG: se indexan los documentos generando vectores por token y, en consulta, se rankean los pasajes candidatos con MaxSim, lo que mejora la precisión frente a embeddings densos en dominios con vocabulario técnico.
- Memoria a largo plazo de agentes: Dakera lo usa como motor de retrieval para recuperar recuerdos relevantes entre sesiones; su tamaño reducido (33,9 MB en int8) permite incluirlo en la imagen Docker sin descargas en el arranque.
- Reranking de resultados de búsqueda: tras una primera fase léxica o vectorial, el modelo reordena los candidatos con interacción a nivel de token para afinar la relevancia final.
- Búsqueda semántica autoalojada: al ser ONNX int8 y Apache-2.0, se puede desplegar en servidores propios sin dependencia de APIs externas ni costes por token.
- Sistemas de soporte documental: indexación de manuales y bases de conocimiento para responder consultas con pasajes citables, aprovechando el ranking fino de ColBERT.
- Despliegues con requisitos de soberanía de datos: al ejecutarse localmente y con licencia permisiva, encaja en entornos donde los datos no pueden salir de la infraestructura propia.
- Integración vía MCP: Dakera expone un servidor MCP para agentes como Claude o Cursor, por lo que este modelo puede servir de backend de recuperación en ese ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La copia espejo no incluye métricas de recuperación (nDCG, MRR, Recall@k) ni comparativas con otros retrievers; el autor remite a la model card original de Answer.AI para esos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el artefacto int8 ocupa 33,9 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con ONNX Runtime. Cualquier GPU moderna (RTX 3060 en adelante, A100, H100) acelera la inferencia, pero no es imprescindible.
- Cabe en GPU consumer: sí, en todas las gamas actuales, dado el tamaño del modelo.
- Opciones de despliegue: ONNX Runtime, integración nativa en Dakera (imagen Docker `ghcr.io/dakera-ai/dakera:latest`), y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DakeraAI/answerai-colbert-small-v1 (espejo) | ColBERT late interaction, ONNX int8 | no disponible | no disponible | Apache-2.0 | HuggingFace (espejo) |
| answerdotai/answerai-colbert-small-v1 (original) | ColBERT late interaction | no disponible | no disponible | Apache-2.0 | HuggingFace |
| Embeddings densos tipo sentence-transformers (p. ej. familia MiniLM) | Bi-encoder denso | no disponible en esta ficha | no disponible | variable | HuggingFace |
| Modelos de reranking cross-encoder | Cross-encoder | no disponible en esta ficha | no disponible | variable | HuggingFace |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La diferencia conceptual clave frente a un bi-encoder denso es que ColBERT almacena un vector por token y calcula MaxSim, lo que suele dar mayor precisión a cambio de más almacenamiento; frente a un cross-encoder, es más eficiente en la fase de ranking porque precalcula los embeddings de documentos.

## Limitaciones y advertencias

- No es un modelo generativo: no puede responder preguntas ni generar texto por sí mismo; solo produce representaciones para retrieval.
- Los sesgos del modelo original no están documentados en esta copia; al ser un encoder entrenado por Answer.AI, hereda los sesgos de su corpus, que no se detalla aquí.
- Riesgo de alucinación no aplica directamente al no generar texto, pero un retrieval deficiente puede provocar respuestas incorrectas en el sistema que lo use.
- Limitaciones de contexto e idioma: no documentadas en este repositorio; conviene consultar la model card original antes de usarlo en producción multilingüe.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar los avisos de copyright y licencia; el espejo incluye el fichero `LICENSE`.
- Es un espejo, no el repositorio canónico: para soporte, citación y actualizaciones debe referenciarse `answerdotai/answerai-colbert-small-v1`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no aporta señal de adopción; la validación debe apoyarse en los checksums SHA-256 incluidos.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/DakeraAI/answerai-colbert-small-v1
- Modelo original: https://huggingface.co/answerdotai/answerai-colbert-small-v1
- Licencia del espejo: https://huggingface.co/DakeraAI/answerai-colbert-small-v1/blob/main/LICENSE
- Web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue (Docker, Kubernetes, Helm): https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
- Contacto: amine@dakera.ai
