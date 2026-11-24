# mradermacher/sol-reaver-rp-v3-GGUF

## Resumen

sol-reaver-rp-v3-GGUF es la version cuantizada en formato GGUF del modelo NewEden-Forge/sol-reaver-rp-v3, un modelo de lenguaje de aproximadamente 15.000 millones de parametros (14.974.182.400 exactos segun los pesos en safetensors) orientado a rol conversacional y roleplay (RP). La cuantizacion la ha realizado mradermacher, un conocido publicador de versiones GGUF de modelos de terceros, y el modelo base fue generado mediante mergekit, es decir, es el resultado de una fusion de modelos (merge) en lugar de un entrenamiento desde cero.

El modelo esta pensado para conversacion en ingles (unico idioma declarado) y su etiqueta principal es "conversational", lo que lo situa en la categoria de modelos de chat y roleplay mas que en la de modelos de razonamiento o codigo. Su relevancia practica radica en que, al estar disponible en GGUF con un abanico amplio de cuantizaciones (desde Q2_K de 5,9 GB hasta Q8_0 de 16 GB), puede ejecutarse en hardware de consumo mediante llama.cpp, Ollama o interfaces similares, sin necesidad de GPU de datacenter.

La informacion publicada por el autor es escasa: no se detalla la licencia, no hay pipeline declarado, no se especifican los datos de entrenamiento ni la longitud de contexto, y no se han publicado resultados de benchmarks. Esta ficha refleja unicamente lo que consta en la model card y en los metadatos del repositorio, marcando como "no disponible" todo aquello que no se ha hecho publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge con mergekit; detalles de la arquitectura base no disponibles) |
| Parametros totales | 14.974.182.400 (~15B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (tambien existen quants i1 en repositorio aparte) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base NewEden-Forge/sol-reaver-rp-v3 se ha construido mediante mergekit, una herramienta de fusion de modelos que combina los pesos de dos o mas modelos existentes para obtener un modelo nuevo sin entrenamiento adicional (o con entrenamiento minimo). La model card del repositorio cuantizado no especifica que modelos se fusionaron, con que metodo (SLERP, TIES, DARE, passthrough, etc.) ni con que hiperparametros, por lo que no es posible reconstruir el linaje tecnico completo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF, DPO o ajuste fino supervisado posteriores al merge. Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido. La unica informacion tecnica verificable es el numero de parametros (14.974.182.400) y el hecho de que el modelo se distribuye en formato GGUF para inferencia con llama.cpp y derivados.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en dialogos multi-turno y estilo de roleplay.
- Mantenimiento de personajes y contexto narrativo a lo largo de una conversacion (capacidad inferida de su etiqueta "conversational" y de su uso previsto en RP).
- Generacion creativa: narrativa, descripciones y dialogos con tono consistente.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Roleplay conversacional: el modelo esta disenado para sostener interacciones de角色 (personaje) con coherencia a lo largo de varios turnos; su tamano de ~15B permite un equilibrio razonable entre calidad narrativa y velocidad en GPU de consumo.
- Chat de acompanamiento o entretenimiento: integrable en aplicaciones de chat con personajes virtuales, donde el modelo mantiene el tono y la personalidad definidos en el system prompt.
- Generacion de ficcion interactiva: util para escribir relatos ramificados o aventuras de texto donde el usuario decide el rumbo y el modelo responde en personaje.
- Prototipado de asistentes conversacionales en ingles: sirve como base para experimentar con prompts de sistema y tecnicas de prompt engineering antes de pasar a modelos mayores.
- Investigacion sobre merges de modelos: al ser un modelo derivado de mergekit, es un caso de estudio para analizar como se comportan las fusiones de pesos en tareas de dialogo.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_S (8,8 GB) y Q4_K_M (9,2 GB), puede ejecutarse en GPUs de consumo de 12-16 GB de VRAM para pruebas y demos.
- Generacion de dialogos para videojuegos o mods: util para prototipar arboles de dialogo o NPCs con respuestas variadas antes de invertir en un modelo mayor o en un servicio en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y ventana de contexto):
  - Q2_K (5,9 GB): ~6-7 GB de VRAM.
  - Q4_K_S (8,8 GB) / Q4_K_M (9,2 GB): ~9-10 GB de VRAM.
  - Q5_K_M (10,8 GB): ~11-12 GB de VRAM.
  - Q6_K (12,4 GB): ~13 GB de VRAM.
  - Q8_0 (16,0 GB): ~16-17 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4080 / 4070 Ti Super (16 GB) para Q5_K_M y Q6_K; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_M.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4 y Q5; Q8_0 requiere 16 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. Tambien existe una version i1 (imatrix) en repositorio separado para quienes priorizan calidad por tamano.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sol-reaver-rp-v3-GGUF | ~15B | no disponible | no disponible | GGUF | Merge orientado a RP, solo ingles |
| Modelos RP de ~13-15B en GGUF (familia generica) | ~13-15B | variable | variable | GGUF | Categoria comparable; sin datos concretos del autor |
| Modelos base de ~14B (p. ej. Qwen2.5-14B) | ~14B | 32K+ (segun version) | Apache 2.0 (segun version) | safetensors, GGUF | Referencia de tamano y contexto, no especializado en RP |

No se dispone de datos de rendimiento comparativos publicados para este modelo, por lo que la comparativa se limita a parametros, formato y disponibilidad. No se han identificado en la informacion proporcionada modelos directamente comparables con benchmarks medidos.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor o asumir restricciones hasta verificarlo.
- Solo ingles: no se documenta soporte multilingue; el rendimiento en castellano sera previsiblemente deficiente.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin pruebas previas.
- Riesgo de alucinacion: como todo modelo generativo de ~15B sin datos de evaluacion publicos, puede inventar hechos y detalles; en RP el riesgo es menor en lo factual pero mayor en la coherencia interna.
- Sesgos: al desconocerse el dataset de entrenamiento y los modelos fusionados, no se pueden evaluar sesgos de genero, raza o ideologia; es recomendable auditar el comportamiento antes de un despliegue publico.
- Modelo derivado de merge: la calidad depende de los modelos fuente, que no se documentan; puede heredar inconsistencias o comportamientos no deseados de estos.
- Sin benchmarks: no hay evidencia publica de su rendimiento frente a alternativas; cualquier decision de produccion deberia basarse en evaluacion propia.
- Repositorio con muchas cuantizaciones: conviene verificar la integridad de los archivos multi-parte antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sol-reaver-rp-v3-GGUF
- Modelo base: https://huggingface.co/NewEden-Forge/sol-reaver-rp-v3
- Quants i1 (imatrix): https://huggingface.co/mradermacher/sol-reaver-rp-v3-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#sol-reaver-rp-v3-GGUF
- README de referencia sobre GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
