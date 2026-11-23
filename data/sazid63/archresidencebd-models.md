# sazid63/archresidencebd-models

## Resumen

ArchResidenceBD Model Fleet es una coleccion de modelos cuantizados en formato GGUF publicada por el usuario sazid63 bajo licencia Apache 2.0, orientada a flujos de trabajo de ingenieria civil residencial en Bangladesh. No se trata de un unico modelo entrenado desde cero, sino de un conjunto de cuatro artefactos derivados de modelos base de Alibaba (Qwen3-4B-Instruct-2507, Qwen2.5-Coder-3B-Instruct, Qwen3-Embedding-0.6B y Qwen3-Reranker-0.6B), empaquetados para inferencia local con llama.cpp.

El repositorio suma aproximadamente 4.022 millones de parametros en total (segun los pesos safetensors declarados) y ocupa 7,9 GB. La flota cubre cuatro roles complementarios: un modelo conversacional para entrevistas y razonamiento estructurado, un modelo de reparacion de scripts CAD, un modelo de embeddings para recuperacion documental y un reranker para reordenar resultados. La ventana de contexto configurada en los ejemplos de uso es de 8192 tokens.

Su relevancia es acotada y de nicho: demuestra un patron de despliegue de bajo coste (modelos de 0,6 a 4 mil millones de parametros, cuantizacion Q4_K_M y Q8_0) para asistentes verticales de dominio, ejecutables en hardware de consumo. No obstante, la documentacion publica es escasa y no incluye datos de entrenamiento, evaluacion ni limites de contexto oficiales mas alla de los ejemplos de linea de comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelos base Qwen3 y Qwen2.5; sin detalles de adaptacion publicados) |
| Parametros totales | 4.022.468.096 (suma agregada de la flota, segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (valor usado en los ejemplos de llama-server; no se declara maximo oficial) |
| Tipos de cuantizacion | Q4_K_M (chat y repair), Q8_0 (embedding y reranker) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (runtime llama.cpp) |

Desglose por artefacto:

| Artefacto | Rol | Base | Cuantizacion | Tamano |
|---|---|---|---|---|
| `archie-chat-v0-Q4_K_M.gguf` | Chat | Qwen3-4B-Instruct-2507 | Q4_K_M | 2,33 GB |
| `archres-repair-v0-Q4_K_M.gguf` | Reparacion | Qwen2.5-Coder-3B-Instruct | Q4_K_M | 1,80 GB |
| `Qwen3-Embedding-0.6B-Q8_0.gguf` | Embeddings | Qwen3-Embedding-0.6B | Q8_0 | 0,60 GB |
| `Qwen3-Reranker-0.6B-Q8_0.gguf` | Reranking | Qwen3-Reranker-0.6B | Q8_0 | 0,60 GB |

## Arquitectura y entrenamiento

La informacion disponible no describe ninguna arquitectura propia ni un proceso de entrenamiento especifico. Los cuatro artefactos son derivados de modelos base de la familia Qwen: dos modelos generativos (Qwen3-4B-Instruct-2507 y Qwen2.5-Coder-3B-Instruct) y dos modelos auxiliares de recuperacion (Qwen3-Embedding-0.6B y Qwen3-Reranker-0.6B). Todos se distribuyen exclusivamente en GGUF, lo que implica que han pasado por un proceso de conversion y cuantizacion para llama.cpp, pero la model card no documenta si hubo ajuste fino adicional, que datos se usaron ni que metodologia de alineacion (RLHF, DPO u otra) se aplico.

No se declara numero de tokens de entrenamiento, composicion del dataset, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Cualquier afirmacion sobre el entrenamiento de estos pesos mas alla de su modelo base seria especulativa. El unico indicio de especializacion es el etiquetado del repositorio (architecture, civil-engineering, bangladesh) y la descripcion de roles en la tabla de modelos, que sugiere un uso previsto vertical sin que se detalle el proceso de adaptacion.

## Capacidades

- Generacion de texto conversacional y razonamiento estructurado mediante `archie-chat-v0` (basado en Qwen3-4B-Instruct-2507), orientado a entrevistas de proyecto y explicaciones.
- Reparacion y depuracion de scripts relacionados con CAD mediante `archres-repair-v0` (basado en Qwen2.5-Coder-3B-Instruct), enfocado a resolucion de problemas tecnicos.
- Generacion de embeddings para recuperacion documental con `Qwen3-Embedding-0.6B`.
- Reranking de resultados recuperados con `Qwen3-Reranker-0.6B`, para mejorar la precision del pipeline de busqueda contextual.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el rol de chat sugiere razonamiento estructurado, pero sin detalle.
- Capacidades multilingues: no disponible; la model card no declara idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistente de entrevistas de proyecto residencial: `archie-chat-v0` puede mantener conversaciones multi-turno para recoger requisitos de una vivienda (superficie, numero de plantas, materiales) y estructurar la informacion, usando una ventana de 8192 tokens configurable en llama-server.
- Reparacion de scripts CAD: `archres-repair-v0`, derivado de un modelo de codigo, se usaria para diagnosticar y corregir scripts de automatizacion CAD que fallen, dentro de un flujo de soporte tecnico interno.
- Busqueda documental sobre normativa y planos: el par embedding + reranker permite indexar documentacion tecnica, recuperar fragmentos relevantes por similitud y reordenarlos antes de pasarlos al modelo de chat.
- Pipeline RAG de dominio: combinando los cuatro artefactos se puede montar un asistente que recupere contexto (embedding), lo reordene (reranker) y genere una respuesta (chat), todo en local con llama.cpp.
- Despliegue en hardware de consumo: al ser modelos de 0,6 a 4 mil millones de parametros en Q4_K_M y Q8_0, permiten prototipos de asistente vertical en estaciones de trabajo sin GPU de datacenter.
- Soporte a investigacion de diseno residencial especifico de Bangladesh: el etiquetado del repositorio sugiere uso en flujos practicos de investigacion y diseno adaptados al contexto local, aunque no se documenta el corpus de especializacion.
- Generacion de explicaciones tecnicas: `archie-chat-v0` puede redactar explicaciones de decisiones de diseno o de pasos de calculo a partir de la conversacion, como apoyo a la documentacion de proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de chat Q4_K_M ocupa 2,33 GB en disco y el de reparacion 1,80 GB; con overhead de contexto (8192 tokens) el consumo real de VRAM es superior al tamano del fichero, aunque no se publican cifras medidas.
- Embedding y reranker en Q8_0: 0,60 GB cada uno; los ejemplos de la model card los ejecutan con `-ngl 0`, es decir, en CPU.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, los modelos generativos de 3-4 mil millones de parametros en Q4_K_M son compatibles con GPU de consumo de 8 GB o mas, pero esto es una estimacion por tamano, no un dato publicado.
- Cabe en GPU de consumo: previsiblemente si para los cuatro artefactos por separado, dado que ninguno supera 2,33 GB en disco; no confirmado por el autor.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con flags documentados: `-ngl 99 -c 8192` para chat y repair, `--embeddings --pooling last` para el modelo de embeddings, y `--reranking` para el reranker.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ArchResidenceBD Model Fleet (este) | ~4,02 B agregados en 4 artefactos | 8192 (configurado) | GGUF | Apache 2.0 | Flota vertical para ingenieria civil en Bangladesh |
| Qwen3-4B-Instruct-2507 | 4 B | no disponible en esta ficha | safetensors/GGUF | Apache 2.0 (modelo base) | Base del artefacto de chat; sin especializacion de dominio |
| Qwen2.5-Coder-3B-Instruct | 3 B | no disponible en esta ficha | safetensors/GGUF | Apache 2.0 (modelo base) | Base del artefacto de reparacion; orientado a codigo |
| Qwen3-Embedding-0.6B / Reranker-0.6B | 0,6 B cada uno | no disponible en esta ficha | safetensors/GGUF | Apache 2.0 (modelos base) | Bases de los artefactos de recuperacion |

La comparativa relevante es contra los propios modelos base: esta flota no aporta un modelo nuevo de mayor capacidad, sino un empaquetado cuantizado y etiquetado por dominio sobre pesos Qwen. Frente a los originales, la diferencia practica es el formato GGUF listo para llama.cpp y la seleccion de roles, no un salto de rendimiento documentado.

## Limitaciones y advertencias

- Ausencia de evaluacion: no hay benchmarks, ni datos de entrenamiento, ni comparativas publicadas; no es posible verificar la calidad frente a los modelos base.
- Especializacion no demostrada: el etiquetado de dominio (architecture, civil-engineering, bangladesh) no viene acompanado de documentacion sobre el corpus de adaptacion, por lo que no se puede confirmar que los pesos esten realmente ajustados al dominio.
- Riesgo de alucinacion: al ser modelos generativos de 3-4 mil millones de parametros, son propensos a errores factuales, especialmente en calculos estructurales o normativa, donde un fallo tiene consecuencias graves.
- Contexto limitado: la configuracion de ejemplo usa 8192 tokens; no se declara un maximo oficial y ventanas mayores pueden degradar el rendimiento.
- Idiomas no declarados: no se especifica soporte de bengali, ingles ni otros idiomas; el uso multilingue no esta garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base Qwen subyacentes antes de redistribuir en produccion.
- Madurez: repositorio con 0 likes y 497 descargas, version v0 de los artefactos de chat y repair; tratar como prototipo, no como componente estable de produccion.
- Sin soporte de tool calling ni agentes declarado: no se debe asumir capacidad de function calling sin validacion propia.
- Uso en ingenieria civil: cualquier salida debe ser revisada por un profesional cualificado; el modelo no sustituye la verificacion normativa ni el calculo estructural certificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sazid63/archresidencebd-models
- Modelo base del chat: Qwen3-4B-Instruct-2507 (familia Qwen, Alibaba)
- Modelo base de reparacion: Qwen2.5-Coder-3B-Instruct (familia Qwen, Alibaba)
- Modelo base de embeddings: Qwen3-Embedding-0.6B
- Modelo base de reranking: Qwen3-Reranker-0.6B
- Runtime de inferencia: llama.cpp (https://github.com/ggml-org/llama.cpp)
- Papers, blogs, repos o demos adicionales: no disponibles en la informacion proporcionada.
