# dasLOL/zils-lite-skills-v1

## Resumen

zils-lite-skills-v1 es un ajuste fino de un modelo de la familia Qwen3.5, concretamente sobre Qwen/Qwen3.5-0.8B, desarrollado por el usuario dasLOL dentro del ecosistema Zils. Se presenta como un "soup-body" (cuerpo de pesos de lenguaje y vision) para el pool z3 de su tamano, y esta pensado para evaluarse sobre el chasis fijado del pool, que aporta la capa de respuesta, el prompt y el runtime. El modelo tiene 852.985.920 parametros y un repositorio de 1,7 GB en formato safetensors.

El modelo se obtiene mediante un proceso de model soup: una media uniforme de tres modelos Apache-2.0 (vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full) seguida de un entrenamiento de todos los parametros de los pesos de lenguaje contra etiquetas gold suavizadas, y finalmente una media ponderada 0,75/0,25 con el soup de partida. El pipeline declarado en HuggingFace es feature-extraction, aunque la model card describe un uso orientado a tareas de decision.

Su relevancia es acotada y muy especifica: no es un modelo de proposito general, sino un componente de un sistema mayor (el chasis del pool z3) con fines de evaluacion interna y participacion en el ecosistema Bittensor. La licencia Apache-2.0 facilita su reutilizacion, pero la ausencia de benchmarks publicos y de documentacion sobre idiomas limita su adopcion fuera de ese contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); no se detalla la configuracion exacta |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | feature-extraction |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 1,7 GB |
| Requiere custom_code | si |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parametros. El modelo resultante se construye en tres fases: primero, una media uniforme de pesos de tres modelos Apache-2.0 (vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full); segundo, un entrenamiento de parametros completos de los pesos de lenguaje contra etiquetas gold suavizadas; y tercero, una media ponderada 0,75/0,25 entre el modelo entrenado y el soup de partida. El autor indica que no se usaron datos del examen del validador ni datos de clientes.

El conjunto de entrenamiento ronda los 100.000 elementos publicos y generados por el proyecto, orientados a tareas de decision: conteos aritmeticos y de cobertura, comprobacion de argumentos en llamadas a herramientas, conteo de silabas con CMUdict, inflexiones del ingles con UniMorph, similitud de captions con CxC, PIQA y particiones de entrenamiento de 20 Newsgroups. No se documentan tecnicas como RLHF, DPO, decodificacion especulativa ni atencion lineal; la model card tampoco detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de la lista de tareas.

## Capacidades

- Generacion de texto y razonamiento basico, heredados del modelo base Qwen3.5-0.8B.
- Capacidades de vision declaradas por el autor ("language and vision weights"), aunque no se especifica el modulo visual ni su configuracion.
- Tareas de decision: conteos aritmeticos y de cobertura, verificacion de argumentos en llamadas a herramientas, conteo de silabas e inflexiones morfologicas del ingles.
- Evaluacion de similitud semantica (CxC caption similarity) y clasificacion (20 Newsgroups, PIQA).
- Integracion en el ecosistema Bittensor y en el pool z3 mediante el chasis del pool, que aporta la capa de respuesta y el runtime.
- Soporte de tool calling: no confirmado de forma explicita; el entrenamiento incluye comprobacion de argumentos de llamadas a herramientas, lo que sugiere cierta familiaridad con ese formato.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; el entrenamiento se centra en tareas en ingles (CMUdict, UniMorph English, 20 Newsgroups).

## Casos de uso

- Verificacion de argumentos en llamadas a herramientas: el modelo se entreno especificamente con comprobaciones de argumentos de tool calls, por lo que puede usarse como validador ligero en pipelines de agentes que necesitan confirmar que los parametros de una funcion son coherentes antes de ejecutarla.
- Conteo de silabas y analisis morfologico del ingles: util en herramientas de procesamiento de lenguaje natural (rimas, metrica, generacion de texto con restricciones silabicas) gracias al entrenamiento con CMUdict y UniMorph.
- Clasificacion de documentos: con 20 Newsgroups en el conjunto de entrenamiento, puede emplearse para categorizacion tematica de textos cortos en entornos de bajo coste computacional.
- Evaluacion de similitud entre descripciones e imagenes: el entrenamiento con CxC caption similarity permite usarlo como extractor de caracteristicas o scorer de similitud en tareas multimodales ligeras.
- Razonamiento aritmetico y de cobertura: adecuado para tareas de conteo y comprobacion de cobertura en sistemas de validacion automatizada, donde se requiere un modelo pequeno que quepa en una sola GPU.
- Componente de un pool Bittensor: su proposito declarado es servir como cuerpo de pesos en el pool z3, evaluado sobre el chasis fijado; encaja en flujos de mineria/validacion donde se intercambian y evaluan modelos especializados.
- Extraccion de caracteristicas: dado su pipeline feature-extraction, puede usarse para generar embeddings o representaciones internas en tareas de recuperacion o clasificacion, aunque no se documenta la dimension de los embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parametros, en precision FP16 requiere aproximadamente 1,7 GB solo para los pesos; en FP32, unos 3,4 GB; en cuantizacion de 8 bits, alrededor de 0,9 GB; en 4 bits, unos 0,5 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM deberia poder cargar el modelo en FP16, incluyendo RTX 3060, RTX 4060, RTX 4090; tambien cabe en GPUs de datacenter como A100 o H100, aunque estaria infrautilizada.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs con 6 GB o mas en FP16, y en GPUs integradas o de gama baja con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), con posibilidad de usar vLLM, TGI o llama.cpp si se generan pesos compatibles; el tag endpoints_compatible sugiere compatibilidad con endpoints de HuggingFace. Requiere custom_code, lo que puede complicar el despliegue en algunos runners.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-skills-v1 | 852.985.920 | no disponible | Apache-2.0 | Decision, soup-body para pool z3 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | Modelo base de proposito general | HuggingFace (modelo base) |
| vllm-sr/d3-lite | no disponible | no disponible | Apache-2.0 | Componente del soup | HuggingFace |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 | Decision | HuggingFace |

La comparativa se limita a los modelos citados en la model card como componentes del soup, ya que no se dispone de datos de rendimiento ni de especificaciones completas de alternativas equivalentes. No se han publicado comparaciones con modelos de la misma categoria fuera del ecosistema Zils.

## Limitaciones y advertencias

- No es un modelo de proposito general: esta disenado como cuerpo de pesos para el pool z3 y depende del chasis del pool para la capa de respuesta, el prompt y el runtime; usarlo de forma aislada puede dar resultados degradados.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a alternativas.
- Idiomas no documentados: el entrenamiento se centra en tareas en ingles, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Riesgo de alucinacion: como todo modelo de 0,8B, es propenso a errores en tareas abiertas, especialmente fuera de las tareas de decision para las que fue entrenado.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-0.8B y de datos publicos, puede heredar sesgos de esos corpus.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se deben respetar los NOTICE y terminos de los modelos upstream (Qwen y los modelos Zils de origen).
- Requiere custom_code: puede no cargarse directamente en frameworks que no soporten codigo personalizado, lo que anade friccion en produccion.
- Fecha de creacion futura (2026-11-04) y cero descargas: el modelo es muy reciente y sin validacion externa, por lo que su robustez no esta contrastada.
- Sin informacion sobre cuantizaciones oficiales ni sobre el formato GGUF: el despliegue en llama.cpp u Ollama requeriria conversion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dasLOL/zils-lite-skills-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del soup: https://huggingface.co/vllm-sr/d3-lite
- Componente del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Componente del soup: https://huggingface.co/zils-ai/jiwo-0.8b-full
