# Dongju-00/stockspoon-qwen3-reranker-4b-lora

## Resumen

Stock Spoon es un adaptador LoRA para el reranker Qwen3-Reranker-4B, desarrollado por el usuario Dongju-00 y publicado bajo licencia Apache 2.0. Su proposito es reordenar los fragmentos candidatos devueltos por una busqueda por embeddings en un corpus de informes financieros coreanos (OpenDART), de modo que los pasajes que responden realmente a la consulta queden en las primeras posiciones. No es un modelo generativo: no crea ni modifica texto, solo asigna una puntuacion de relevancia a pares consulta-documento.

El adaptador se entrena sobre el modelo base Qwen/Qwen3-Reranker-4B, fijado en la revision `22e683669bc0f0bd69640a1354a6d0aebcfeede5`. El repositorio contiene unicamente los pesos LoRA (`adapter_model.safetensors`) y su configuracion; es necesario cargar el modelo base y el tokenizador por separado y aplicar el adaptador mediante PEFT. El checkpoint publicado corresponde a la etiqueta `adapter-last` del experimento `qwen4-rank-v2`.

La relevancia del modelo es acotada pero concreta: aborda un problema tipico en recuperacion sobre documentacion corporativa, donde fragmentos de la misma empresa en periodos distintos, cuentas contables con nombres parecidos o tablas similares confunden al recuperador. El adaptador se entrena especificamente con casos en los que el recuperador por embeddings situo un pasaje incorrecto por encima del correcto dentro del top-50.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-Reranker-4B (transformer decoder-only con cabeza de clasificacion yes/no) |
| Parametros totales | no disponible (el adaptador LoRA no declara su numero de parametros; el modelo base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como especificacion del adaptador; el limite de entrada usado en la evaluacion del proyecto es de 16.384 tokens |
| Tipos de cuantizacion | la evaluacion del autor se realizo con el modelo base en NF4 de 4 bits; no se documentan otras configuraciones |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 (adaptador); la del modelo base se rige por el repositorio de Qwen |
| Formato de pesos | safetensors (adaptador LoRA) + adapter_config.json; requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-Reranker-4B, un modelo de ranking de la familia Qwen3 Embedding que puntua pares consulta-documento mediante los logits de los tokens `yes` y `no` en la ultima posicion de la secuencia. El adaptador LoRA modifica un subconjunto de capas del modelo base; la configuracion concreta de rangos y modulos objetivo esta en `adapter_config.json` y no se detalla en la model card.

El entrenamiento parte de casos de confusion recogidos de una primera iteracion de busqueda y reranking sobre informes de OpenDART. La version v2 refuerza ejemplos en los que, dentro de los 50 candidatos devueltos por la busqueda, un pasaje incorrecto aparecia por encima del correcto. La entrada conserva metadatos (empresa, periodo, ubicacion del fragmento en el informe) para que el modelo pueda discriminar entre documentos estructuralmente parecidos. La seleccion del checkpoint se hizo combinando exactitud sobre pares de validacion con metricas de recuperacion nDCG y MRR. No se especifican el volumen de datos de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de preferencia (RLHF/DPO).

Una innovacion operativa relevante es la fijacion explicita de la revision del modelo base y del adaptador, junto con el hash SHA256 de los pesos (`7d43c402f5061930e5e9fbc6e8c9e7618662814181f50a8c1b7a48371f947d24`), lo que facilita la reproducibilidad en produccion.

## Capacidades

- Reranking de fragmentos de texto: asigna una puntuacion de relevancia a cada par consulta-pasaje para reordenar candidatos.
- Discriminacion temporal y corporativa: distingue fragmentos de la misma empresa en periodos distintos y cuentas contables con denominaciones similares.
- Uso de metadatos en la entrada: empresa, periodo y ubicacion del fragmento dentro del informe.
- Especializacion en dominio financiero coreano (informes OpenDART).
- Integracion como segunda etapa de un pipeline de recuperacion (retrieval + rerank).
- No soporta generacion de texto, tool calling, agentes ni vision; su funcion es exclusivamente de ranking.

## Casos de uso

- Busqueda de evidencia en informes financieros: dado un conjunto de fragmentos recuperados por embeddings, el adaptador los reordena para que el pasaje que responde a la consulta quede arriba, aprovechando la distincion por empresa y periodo.
- Preguntas sobre cuentas contables concretas: cuando varios fragmentos mencionan cuentas con nombres parecidos, el reranker prioriza el que corresponde a la cuenta y ejercicio solicitados.
- Comparacion entre ejercicios de una misma empresa: permite separar pasajes de periodos distintos que comparten redaccion y tablas casi identicas.
- Construccion de pipelines RAG sobre documentacion regulatoria: se usa como etapa intermedia entre el recuperador vectorial y el generador, para reducir el ruido en el contexto entregado al LLM.
- Auditoria y trazabilidad de respuestas: al conservar metadatos y comparar rankings antes y despues del adaptador, facilita registrar que evidencia se priorizo y por que.
- Filtrado de candidatos irrelevantes: con un umbral calibrado en validacion, puede descartar consultas sin respuesta en el top-50 antes de invocar un modelo generativo, ahorrando coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la seleccion de checkpoint uso exactitud sobre pares de validacion y metricas nDCG y MRR, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el modelo base de 4B en NF4 de 4 bits (configuracion usada en la evaluacion del autor) ocupa del orden de 2-3 GB de pesos, mas overhead de activaciones y del contexto de hasta 16.384 tokens; en fp16 el modelo base rondaria los 8 GB.
- GPU recomendadas: no especificadas por el autor. Para el modelo base de 4B, una RTX 4090 o A100/H100 son opciones holgadas; GPUs consumer con 8-12 GB pueden ser suficientes en cuantizacion de 4 bits.
- Cabe en GPU consumer: previsiblemente si, en cuantizacion de 4 bits, aunque no hay cifras publicadas por el autor.
- Opciones de despliegue: PEFT + Transformers (flujo documentado por el autor), con el modelo base fijado a la revision indicada y el adaptador aplicado por PEFT. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stock Spoon Qwen3-Reranker-4B LoRA | adaptador sobre base de 4B | limite de evaluacion 16.384 tokens | Reranking financiero coreano (OpenDART) | Apache 2.0 | HuggingFace (35 descargas) |
| Qwen/Qwen3-Reranker-4B | 4B | el del modelo base (no detallado aqui) | Reranking general multilingue | la del repositorio Qwen | HuggingFace |
| Rerankers genericos de la familia Qwen3 Embedding (0.6B, 4B, 8B) | 0,6B a 8B | no disponible | Reranking general | la del repositorio Qwen | HuggingFace |

La comparativa se limita al modelo base y a variantes de la misma familia, ya que la informacion disponible no incluye otros rerankers especializados en finanzas coreanas con los que contrastar.

## Limitaciones y advertencias

- Solo reordena candidatos existentes: si el pasaje correcto no esta entre los 50 recuperados, el reranking no puede resolverlo.
- El truncado de la entrada puede eliminar evidencia necesaria y degradar el ranking; el limite usado en la evaluacion es de 16.384 tokens.
- La mejora en el ranking no garantiza por si sola una mayor exactitud de la respuesta generada; ambas deben evaluarse por separado.
- Las puntuaciones no son probabilidades calibradas; cualquier umbral para descartar consultas sin respuesta debe fijarse en validacion y verificarse en un conjunto de test separado.
- Sensible a la configuracion de inferencia: cambiar la cuantizacion NF4, el dtype de las capas no cuantizadas, el proceso de preparacion PEFT, la plantilla de chat, el formato de entrada o el truncado altera las puntuaciones.
- La puntuacion debe calcularse con los logits de los tokens `yes`/`no` en la ultima posicion, no con generacion libre ni pooling arbitrario.
- Cobertura linguistica limitada al coreano y a un dominio concreto (informes OpenDART); no hay evidencia de su comportamiento fuera de ese corpus.
- El autor no documenta sesgos especificos ni evaluaciones de robustez mas alla de las metricas de ranking.
- Uso comercial permitido por Apache 2.0 para el adaptador, sujeto a la licencia del modelo base Qwen.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Dongju-00/stockspoon-qwen3-reranker-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Repositorio del modelo base (licencia y avisos): https://huggingface.co/Qwen/Qwen3-Reranker-4B/tree/main
- Presentacion oficial de Qwen3 Embedding: https://qwenlm.github.io/blog/qwen3-embedding/
- Paper de Qwen3 Embedding: https://arxiv.org/abs/2506.05176
- Documentacion del formato de checkpoints PEFT: https://huggingface.co/docs/peft/developer_guides/checkpoint
