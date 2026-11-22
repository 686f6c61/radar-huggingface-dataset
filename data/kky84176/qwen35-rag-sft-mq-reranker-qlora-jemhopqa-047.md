# kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-047

## Resumen

El modelo `kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-047` es un checkpoint publicado en Hugging Face por el usuario kky84176. Por su identificador se deduce que se trata de un ajuste fino (SFT) mediante QLoRA sobre una base de la familia Qwen 3.5, orientado a tareas de reranking dentro de un pipeline RAG (retrieval-augmented generation) y entrenado aparentemente sobre el conjunto de datos JEMHopQA, un benchmark de preguntas multi-hop en japones. El pipeline declarado en el Hub es `image-text-to-text`, lo que sugiere una base multimodal, aunque la model card no aporta ninguna descripcion funcional concreta.

El checkpoint contiene 852.985.920 parametros en formato safetensors y ocupa 3,4 GB en el repositorio, un tamano coherente con un modelo de aproximadamente 0,85 mil millones de parametros (probablemente un adaptador fusionado o un modelo base pequeno ajustado, no un Qwen 3.5 completo). La model card es la plantilla autogenerada por Hugging Face y no incluye informacion sobre autor, licencia, idiomas, datos de entrenamiento ni evaluacion.

La relevancia de este modelo es limitada y muy especifica: se trata de un artefacto de investigacion o experimento personal sin documentacion, sin descargas ni interacciones en el momento de redactar esta ficha. Resulta util unicamente como referencia para quien quiera reproducir o inspeccionar un pipeline de reranking RAG sobre Qwen con QLoRA, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5`; presumiblemente transformer multimodal de la familia Qwen 3.5) |
| Parametros totales | 852.985.920 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el ajuste se realizo con QLoRA segun el identificador) |
| Idiomas soportados | no disponible (el dataset de entrenamiento, JEMHopQA, es en japones) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 3,4 GB |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card. El tag `qwen3_5` y el pipeline `image-text-to-text` apuntan a una base de la familia Qwen 3.5 con capacidad de entrada de imagen y texto, pero no se especifica si el checkpoint publicado es el modelo completo, un adaptador fusionado o una version reducida. El recuento de 852.985.920 parametros es muy inferior al de los modelos Qwen 3.5 publicos de mayor tamano, por lo que probablemente se trate de una variante pequena o de un subconjunto de pesos.

El identificador indica un ajuste supervisado (SFT) con QLoRA, es decir, cuantizacion de 4 bits del modelo base durante el entrenamiento y adaptadores de bajo rango. El sufijo `mq-reranker` sugiere una tarea de reranking dentro de un pipeline de recuperacion multi-query, y `jemhopqa` hace referencia al dataset JEMHopQA, un benchmark de preguntas multi-hop en japones. No se documentan hiperparametros, numero de tokens de entrenamiento, composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto y respuesta a preguntas, presumiblemente en el contexto de un pipeline RAG.
- Reranking de documentos o pasajes recuperados, segun el sufijo `reranker` del identificador.
- Procesamiento de entradas de imagen y texto, segun el pipeline declarado `image-text-to-text`.
- Capacidad multilingue: no confirmada; el dataset de entrenamiento es en japones, pero no se documenta el soporte de idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Modo thinking, vision o audio: solo la componente de vision implicita en el pipeline image-text-to-text; sin confirmacion documental.

## Casos de uso

- Reranking en pipelines RAG: el modelo puede emplearse como segunda etapa de recuperacion para reordenar pasajes candidatos antes de la generacion, dado el sufijo `reranker` del identificador y su entrenamiento sobre un dataset de preguntas multi-hop.
- Investigacion sobre QLoRA aplicado a Qwen: sirve como artefacto de referencia para estudiar como se comporta un ajuste de bajo rango sobre una base Qwen 3.5 en una tarea concreta de recuperacion.
- Experimentos con preguntas multi-hop en japones: el entrenamiento sobre JEMHopQA lo hace candidato para prototipos de QA que requieran encadenar evidencia de varias fuentes en ese idioma.
- Evaluacion comparativa de estrategias de reranking: util para contrastar el rendimiento de un reranker ajustado frente a uno generico en un banco de pruebas controlado.
- Reproduccion de pipelines de SFT con QLoRA: el checkpoint permite inspeccionar la configuracion de pesos resultante de un entrenamiento de este tipo.
- Prototipos multimodales de recuperacion: si la base conserva la componente de vision, podria explorarse el reranking de contenido imagen-texto, aunque no hay documentacion que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parametros, en fp16 se requieren aproximadamente 1,7 GB solo para pesos; en 8 bits, unos 0,85 GB; en 4 bits, unos 0,43 GB. A ello hay que sumar el coste de la cache KV y del procesador de vision, no documentado.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM deberia poder cargar los pesos en cuantizacion de 8 o 4 bits; para fp16 se recomienda al menos 6-8 GB. GPU de datacenter (A100, H100) no son necesarias por tamano.
- Cabe en GPU consumer: si, previsiblemente en tarjetas como RTX 3060, 4060, 4070 o superiores, siempre que la arquitectura base sea compatible con los kernels disponibles.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (rerankers ajustados sobre Qwen 3.5 con QLoRA) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin descripcion de uso, datos, licencia ni evaluacion.
- Licencia no especificada: no puede determinarse si el uso comercial esta permitido; debe contactarse con el autor o asumirse la licencia de la base Qwen 3.5, que tampoco se declara.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluacion publicada no puede acotarse.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento mas alla de la referencia a JEMHopQA.
- Cobertura idiomatica incierta: el entrenamiento parece centrado en japones; el rendimiento en castellano no esta verificado.
- Cero adopcion: 0 descargas y 0 likes en el momento de redactar la ficha, lo que reduce la probabilidad de que haya sido validado por terceros.
- Idoneidad para produccion no demostrada: sin benchmarks, sin versionado estable y sin garantias de mantenimiento.
- El pipeline declarado (`image-text-to-text`) puede no reflejar el uso real previsto (reranking), lo que complica la integracion automatica en herramientas que dependan de ese metadato.

## Enlaces

- Hugging Face: https://huggingface.co/kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-047
- Referencia al calculador de impacto ambiental citado en la model card: https://mlco2.github.io/impact#compute
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
