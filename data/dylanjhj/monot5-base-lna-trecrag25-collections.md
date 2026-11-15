# DylanJHJ/monot5-base.lna-trecrag25-collections

## Resumen

monot5-base.lna-trecrag25-collections es un conjunto de clasificadores de nuggets publicados por DylanJHJ, construido sobre el modelo base castorini/monot5-base-msmarco-10k. No es un modelo generativo al uso, sino un artefacto de evaluacion para sistemas RAG: dado un nugget (una afirmacion atomica que un sistema de recuperacion deberia cubrir) y la respuesta completa de un pipeline RAG, el modelo devuelve la probabilidad de que dicha respuesta soporte ese nugget. Se enmarca en la evaluacion de la pista TREC RAG 2024 (trecrag).

El repositorio contiene tres niveles de modelos. El nivel D es un fine-tune completo sobre el dataset agregado; el nivel DT es un fine-tune adicional de D sobre un topic concreto (56 topics); y el nivel DTN anade a DT un adaptador LoRA especifico de nugget (779 nuggets). El modelo base es un T5-base (encoder-decoder, aproximadamente 220 millones de parametros) adaptado a la tarea de ranking con la formulacion MonoT5, que reduce la puntuacion de relevancia a la probabilidad del token `true` frente a `false` en el primer paso del decodificador.

Su relevancia es practica: permite sustituir juicios humanos o LLM-as-a-judge en la evaluacion de sistemas RAG a nivel de nugget, con un coste computacional muy bajo y una reproducibilidad alta. La licencia Apache 2.0 y el formato safetensors facilitan su integracion en pipelines de evaluacion automatizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5-base (encoder-decoder transformer) con formulacion MonoT5; cabezas LoRA por nugget en el nivel DTN |
| Parametros totales | no disponible (modelo base T5-base, ~220 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada; se trunca el cuerpo de `Query: ... Document: ...` y se conserva siempre la cola ` Relevant:</s>` |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 segun el checkpoint; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (backbone en `topics/<qid>/model.safetensors`; adaptadores LoRA en `nuggets/<qid>/<nugget_hash>/adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de castorini/monot5-base-msmarco-10k, un T5-base afinado para ranking de pasajes sobre MS MARCO con la plantilla `Query: {q} Document: {d} Relevant:</s>`. Sobre esa base se aplica un pipeline de entrenamiento jerarquico en tres etapas. La etapa D es un fine-tune completo sobre el dataset completo de evaluacion de nuggets de TREC RAG 2024. La etapa DT parte de D y se reentrena completamente sobre cada uno de los 56 topics, generando un backbone por topic. La etapa DTN anade a cada backbone DT un adaptador LoRA especifico por nugget (779 en total), de modo que el modelo final combina el backbone del topic con el adaptador del nugget correspondiente.

La entrada se construye como un par (nugget, respuesta). En la variante `rag` el lado del nugget es solo el enunciado; en la variante `ragtime` se anade `(Reference answers) {a1}; {a2}` con las respuestas de referencia. La puntuacion se obtiene aplicando softmax sobre los logits de los tokens `▁false` y `▁true` en el primer paso del decodificador, tomando P(true) como probabilidad de soporte. El umbral binario recomendado es 0,5. No se documentan detalles sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO; el entrenamiento es de tipo supervisado con etiquetas binarias de soporte.

## Capacidades

- Clasificacion binaria de soporte a nivel de nugget: dada una afirmacion y una respuesta RAG, devuelve P(soporte).
- Clasificacion a nivel de topic (etapa DT): evalua cualquier nugget de un topic usando el backbone del topic.
- Clasificacion a nivel de nugget (etapa DTN): combina backbone de topic y adaptador LoRA del nugget para maxima especificidad.
- Soporte de dos modos de entrada: `rag` (solo nugget) y `ragtime` (nugget con respuestas de referencia).
- Puntuacion por par (nugget, respuesta) con truncado controlado a 512 tokens y preservacion de la cola de plantilla.
- No soporta generacion libre, tool calling, agentes ni razonamiento multi-paso: es un clasificador de relevancia.
- Capacidad multilingue limitada al ingles.
- Integracion sencilla con `transformers`, `peft` y `huggingface_hub`, sin dependencias adicionales.

## Casos de uso

- Evaluacion automatizada de pipelines RAG: para cada par (nugget, respuesta generada) se calcula P(soporte) y se agrega en metricas de cobertura de nuggets, sustituyendo anotacion humana a bajo coste.
- Ajuste fino de retrievers y rerankers: usar las puntuaciones de nugget como senal de recompensa o metrica de validacion para seleccionar configuraciones de recuperacion y generacion.
- Control de calidad en produccion: ejecutar el juez sobre respuestas de un sistema desplegado para detectar respuestas que no cubren los nuggets esperados y activar revisiones o regeneraciones.
- Comparativa de variantes de prompting: medir de forma objetiva que plantilla o estrategia de generacion cubre mas nuggets por topic en un conjunto de consultas.
- Investigacion en evaluacion de RAG: reproducir y extender los resultados de TREC RAG 2024 con un juez ligero y determinista, util para experimentos con muchas repeticiones.
- Construccion de datasets de evaluacion: etiquetar pares (nugget, respuesta) a gran escala para entrenar o validar otros jueces o modelos de reranking.
- Filtrado de datos de entrenamiento: descartar respuestas que no soportan los nuggets objetivo antes de incorporarlas a un corpus supervisado.

## Benchmarks y rendimiento

Split de test (25% de las ejecuciones reservadas), umbral 0,5, todos los pares de test (n = 8.532).

| Etapa | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|
| D | 0,909 | 0,877 | 0,893 | 0,930 |
| DT | 0,906 | no disponible en la informacion proporcionada | no disponible | no disponible |
| DTN | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

No se han publicado resultados completos de DT y DTN en la informacion disponible, ni comparaciones con otros jueces en la model card.

## Requisitos de hardware

- Inferencia en CPU viable: el backbone es T5-base (~220 M de parametros) y el adaptador LoRA es de pequeno tamano; el ejemplo de la model card funciona en `device="cpu"`.
- VRAM estimada: inferior a 2 GB en fp32 para el backbone; inferior a 1 GB en fp16. Los adaptadores LoRA anaden unos pocos MB por nugget.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; A100/H100 no son necesarias salvo para procesar lotes muy grandes.
- Despliegue: `transformers` + `peft` es la via documentada; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (el modelo no es generativo, por lo que estos servidores no aplican directamente).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un forward pass de un T5-base con decodificacion de un solo paso, el coste por par es bajo y el throughput escala con el tamano de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| monot5-base.lna-trecrag25-collections | ~220 M (T5-base) + LoRA | 512 tokens | Clasificador de nuggets RAG | apache-2.0 | Hugging Face |
| castorini/monot5-base-msmarco-10k | ~220 M (T5-base) | 512 tokens | Ranking de pasajes | apache-2.0 | Hugging Face |
| LLM-as-a-judge (p. ej. modelos generativos de 7B+) | miles de millones | variable | Evaluacion de respuestas | variable | variable |

La comparacion con jueces generativos no esta cuantificada en la informacion disponible. Frente al MonoT5 base de MS MARCO, este modelo anade especializacion por topic y por nugget mediante fine-tune completo y adaptadores LoRA, a costa de un repositorio de 70,2 GB que contiene todos los backbones y adaptadores.

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado ni evaluado en otros idiomas.
- Dominio acotado: especializado en nuggets de TREC RAG 2024 (56 topics, 779 nuggets); su generalizacion a otros dominios o esquemas de evaluacion no esta documentada.
- Entrada truncada a 512 tokens: respuestas largas se recortan, lo que puede perder evidencia relevante al final del documento.
- Umbral fijo de 0,5 en la evaluacion publicada; no se documenta calibracion para otros umbrales o distribuciones.
- Riesgo de falso negativo cuando la respuesta soporta el nugget de forma implicita o parafraseada; el modelo es un clasificador de relevancia, no un verificador factual completo.
- Repositorio de gran tamano (70,2 GB) por contener todos los backbones por topic y adaptadores; conviene descargar solo los subdirectorios necesarios con `subfolder=`.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni limitaciones adicionales del autor.
- No es un modelo generativo: no debe usarse para producir respuestas, solo para puntuar soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DylanJHJ/monot5-base.lna-trecrag25-collections
- Modelo base: https://huggingface.co/castorini/monot5-base-msmarco-10k
- Modelo de nivel D: https://huggingface.co/DylanJHJ/monot5-base.lna-trecrag25-D
- Coleccion del autor: https://huggingface.co/collections/DylanJHJ/tbd-6af4812bda045ed7cfc6cee8
- TREC RAG 2024: https://trec-rag.github.io/
