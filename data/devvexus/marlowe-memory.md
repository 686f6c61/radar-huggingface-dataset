# devvexus/marlowe-memory

## Resumen

Marlowe memory es un conjunto de modelos de reordenamiento (reranking) basados en la arquitectura cross-encoder de la familia MS MARCO MiniLM, distribuidos en formato ONNX y afinados por el autor devvexus para su uso dentro del arnes marlowe-cowork. No se trata de un modelo generativo ni de un reranker de proposito general: son clasificadores de pares consulta-documento que puntuan la relevancia de memorias recuperadas en un pipeline de memoria de agente. El repositorio agrupa varias variantes derivadas de los checkpoints `cross-encoder/ms-marco-MiniLM-L2-v2`, `L4-v2`, `L6-v2` y `L12-v2`.

La relevancia de este modelo es limitada y muy especifica: el propio autor advierte que no esta pensado para descarga individual, sino que lo obtiene automaticamente el arnes marlowe-cowork en su primer arranque, verificando cada fichero contra un hash sha256 fijado en su codigo. Las variantes estan ajustadas para el pipeline de memoria de dicho sistema y no como reranker generalista.

El repositorio ocupa aproximadamente 0,5 GB e incluye builds de CPU y de GPU (CUDA) organizados en carpetas, cada una con un `model.onnx` y un `tokenizer.json` compartido. El embedder asociado al pipeline es `jinaai/jina-embeddings-v2-small-en`, aunque no forma parte de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (MiniLM), exportado a ONNX |
| Parametros totales | no disponible (variantes MiniLM de 2, 4, 6 y 12 capas; el conteo exacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de los checkpoints MS MARCO MiniLM; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (se distribuyen builds ONNX para CPU y CUDA; no se detallan precisiones) |
| Idiomas soportados | no disponible (los checkpoints base MS MARCO estan orientados a ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) mas `tokenizer.json` |

## Arquitectura y entrenamiento

Cada variante es un cross-encoder basado en MiniLM: un transformer encoder que recibe el par (consulta, documento) de forma conjunta y produce una puntuacion de relevancia. El repositorio deriva de los checkpoints publicos `cross-encoder/ms-marco-MiniLM-L2-v2`, `L4-v2`, `L6-v2` y `L12-v2`, que a su vez proceden del ajuste sobre MS MARCO. Sobre esa base, el autor ha aplicado un ajuste fino adicional (sufijos `ft-session-j` y `ft-w1` en los nombres de carpeta) orientado al pipeline de memoria de marlowe-cowork.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset de ajuste fino ni si se emplearon tecnicas de RLHF o DPO (no aplicables en un reranker de este tipo). Tampoco se documentan innovaciones tecnicas mas alla de la exportacion a ONNX y la separacion entre un build de CPU (`ms-marco-MiniLM-L-2-v2-ft-session-j`) y una cascada de GPU con builds CUDA (`ms-marco-MiniLM-L-6-v2-ft-session-j` y `ms-marco-MiniLM-L-{2,4,6,12}-v2-ft-w1`).

## Capacidades

- Puntuacion de relevancia de pares consulta-documento (text-ranking) para reordenar resultados de recuperacion.
- Reordenamiento de memorias recuperadas dentro de un pipeline de memoria de agente.
- Ejecucion en CPU mediante el build ONNX dedicado y en GPU mediante los builds CUDA de la cascada.
- No genera texto, no razona de forma autonoma, no soporta tool calling ni function calling.
- No soporta modo agente ni razonamiento multi-paso.
- Capacidades multilingues: no documentadas; los checkpoints base estan orientados a ingles.
- Capacidades especiales: ninguna declarada (sin vision, audio ni thinking mode).

## Casos de uso

- Reordenamiento de memorias en marlowe-cowork: el uso previsto por el autor; el arnes descarga los ficheros en el primer arranque y los verifica contra hashes sha256 antes de emplearlos en la fase de rerank del pipeline de memoria.
- Rerank en CPU de bajo coste: el build `ms-marco-MiniLM-L-2-v2-ft-session-j` esta pensado para ejecucion en CPU, adecuado para entornos sin GPU donde el volumen de candidatos a reordenar es moderado.
- Cascada de rerank en GPU: los builds CUDA (`ft-session-j` de 6 capas y la familia `ft-w1` de 2, 4, 6 y 12 capas) permiten escalonar el reordenamiento por coste y precision dentro de un servidor con CUDA.
- Evaluacion de la recuperacion en pipelines RAG propios: como cross-encoder MS MARCO afinado, puede emplearse para medir la relevancia de documentos recuperados antes de pasarlos a un modelo generativo, siempre que se acepte su ajuste especifico al dominio de memorias.
- Prototipado de sistemas de memoria de agentes: util para reproducir el comportamiento del pipeline de marlowe-cowork en un entorno de desarrollo antes de integrar el arnes completo.
- Filtrado de candidatos en busquedas semanticas de dos etapas: combinado con el embedder `jinaai/jina-embeddings-v2-small-en` (recuperacion densa) y este cross-encoder (rerank), se obtiene un pipeline recuperar-reordenar clasico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de variantes MiniLM de 2 a 12 capas en ONNX, el peso de los ficheros es reducido dentro del total de 0,5 GB del repositorio, por lo que la inferencia cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU con soporte CUDA para los builds de la cascada; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- GPU de consumo: si, los builds CUDA estan pensados para ejecucion en GPU y el build de 2 capas esta disenado para CPU.
- Opciones de despliegue: ONNX Runtime (unico runtime implicito por el formato); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un cross-encoder.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| devvexus/marlowe-memory | no disponible (MiniLM 2-12 capas) | no disponible | Rerank de memorias (ONNX) | Apache 2.0 | HuggingFace, descarga automatica via marlowe-cowork |
| cross-encoder/ms-marco-MiniLM-L6-v2 | no disponible | no disponible | Rerank general MS MARCO | Apache 2.0 | HuggingFace, uso general |
| cross-encoder/ms-marco-MiniLM-L12-v2 | no disponible | no disponible | Rerank general MS MARCO | Apache 2.0 | HuggingFace, uso general |
| jinaai/jina-embeddings-v2-small-en | no disponible | no disponible | Embeddings (recuperacion densa) | no disponible en la informacion | HuggingFace, embedder del mismo pipeline |

La diferencia principal frente a los checkpoints MS MARCO originales es el ajuste fino adicional sobre el pipeline de memoria de marlowe-cowork y la exportacion a ONNX; a cambio, el autor desaconseja su uso como reranker generalista.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no esta pensado para descarga individual y que no es un reranker de proposito general.
- Esta ajustado para el pipeline de memoria de marlowe-cowork; su comportamiento fuera de ese dominio no esta documentado.
- Los ficheros se verifican contra hashes sha256 fijados en el codigo del arnes, por lo que modificaciones o versiones no coincidentes fallaran la comprobacion.
- Idiomas soportados no documentados; los checkpoints base MS MARCO estan orientados a ingles, con riesgo de bajo rendimiento en castellano.
- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si puede producir puntuaciones de relevancia erroneas en dominios alejados del entrenamiento.
- Licencia Apache 2.0, que permite uso comercial; conviene revisar igualmente las condiciones de los checkpoints base.
- No se documentan limitaciones de contexto mas alla de las heredadas de los checkpoints MiniLM originales.

## Enlaces

- HuggingFace: https://huggingface.co/devvexus/marlowe-memory
- Checkpoint base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L12-v2
- Checkpoint base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Checkpoint base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L4-v2
- Checkpoint base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L2-v2
- Embedder del pipeline: https://huggingface.co/jinaai/jina-embeddings-v2-small-en
