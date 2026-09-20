# FiREDragoN35769/Qwen2.5-Coder-3B

## Resumen

Qwen2.5-Coder-3B es un modelo de lenguaje especializado en codigo de la familia Qwen2.5-Coder (antes CodeQwen), desarrollada por el equipo Qwen de Alibaba Cloud. Esta ficha corresponde a una resubida no oficial publicada por el usuario FiREDragoN35769 en HuggingFace, cuyo contenido reproduce la model card del repositorio original de Qwen. Se trata de la variante de 3.000 millones de parametros en su version base, es decir, el resultado del preentrenamiento sin ajuste por instrucciones ni alineamiento posterior.

El modelo resuelve tareas de generacion y comprension de codigo en un rango de tamano que cabe en GPUs de consumo. La model card indica que la familia se entreno con 5,5 billones de tokens que combinan codigo fuente, datos de vinculacion texto-codigo y datos sinteticos, y que la variante de 32B alcanza, segun sus autores, capacidades de programacion comparables a GPT-4o.

Arquitectonicamente es un transformer causal denso de 36 capas con RoPE, SwiGLU, RMSNorm, sesgo en las proyecciones QKV y embeddings atados, con atencion de consultas agrupadas (GQA) de 16 cabezas para Q y 2 para KV. Soporta una ventana de contexto completa de 32.768 tokens. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y sus metadatos registran una fecha de creacion de 2026-09-20.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2) con RoPE, SwiGLU, RMSNorm, sesgo en QKV y embeddings atados |
| Parametros totales | 3.085.938.688 (3,09 B); 2,77 B sin contar embeddings |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en el repositorio (solo se publican pesos safetensors; no se listan variantes GGUF, AWQ o GPTQ oficiales) |
| Idiomas soportados | en (ingles, segun model card y metadatos) |
| Licencia | qwen-research (declarada como license: other) |
| Formato de pesos | safetensors (libreria transformers) |
| Numero de capas | 36 |
| Cabezas de atencion | GQA con 16 cabezas para Q y 2 para KV |
| Modelo base | Qwen/Qwen2.5-3B (fine-tune declarado en los metadatos) |
| Etapa de entrenamiento | Preentrenamiento (modelo base, sin SFT ni RLHF) |
| Tamano del repositorio | 6,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha registrada de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, codificacion posicional rotatoria (RoPE) y sesgo en las proyecciones de query, key y value. Emplea atencion de consultas agrupadas (GQA) con 16 cabezas de query y 2 de key/value, lo que reduce el coste del cache KV durante la inferencia en contextos largos. Los embeddings de entrada y la cabeza de salida estan atados, de modo que 2,77 B de los 3,09 B de parametros corresponden al cuerpo no asociado a embeddings.

La model card indica que la familia Qwen2.5-Coder se entreno con 5,5 billones de tokens procedentes de codigo fuente, datos de vinculacion texto-codigo y datos sinteticos, con mejoras declaradas en generacion, razonamiento y correccion de codigo respecto a CodeQwen1.5. Esta ficha corresponde al checkpoint de preentrenamiento: no se ha aplicado SFT, RLHF ni DPO, y la propia model card desaconseja su uso directo para conversacion, recomendando en su lugar tareas de continuacion, ajuste posterior o relleno de huecos (fill-in-the-middle). No se detalla en la informacion disponible la composicion exacta del dataset, la mezcla de idiomas de programacion ni el proceso de filtrado.

## Capacidades

- Generacion de codigo a partir de contexto previo, en modo continuacion de texto (el modelo no sigue instrucciones de forma fiable al ser un checkpoint base).
- Razonamiento sobre codigo y correccion de errores, capacidades que la model card atribuye a la familia Qwen2.5-Coder y que en este checkpoint no estan afinadas con instrucciones.
- Relleno de huecos (fill-in-the-middle), tarea que la propia model card recomienda para este modelo.
- Competencias generales y de matematicas, que segun la model card se mantienen respecto al Qwen2.5 base.
- Base para construir agentes de codigo o asistentes conversacionales tras un proceso de post-entrenamiento (SFT, RLHF o preentrenamiento continuado).
- Multilingue: el unico idioma declarado es el ingles. No ha lugar a asumir capacidades de otros idiomas con los datos disponibles.
- Tool calling o function calling: no disponible y no declarado para este checkpoint.
- Capacidades multimodales (vision, audio), modo de razonamiento explicito (thinking) o decodificacion especulativa documentada: no disponibles.

## Casos de uso

- Autocompletado de codigo en el editor: al ser un modelo base con soporte recomendado para fill-in-the-middle, puede integrarse en extensiones de IDE que inserten el codigo que rodea al cursor y pidan la continuacion, con una ventana de 32.768 tokens que permite incluir varios ficheros de contexto.
- Preentrenamiento continuado sobre un dominio concreto: los pesos base son el punto de partida adecuado para adaptar el modelo a lenguajes internos, DSL propietarios o convenciones de una organizacion antes de aplicar un ajuste supervisado.
- Generacion masiva de codigo en procesos por lotes: en pipelines offline donde no se requiere seguimiento de instrucciones, el modelo puede producir plantillas, esqueletos de clases o conversiones entre lenguajes a un coste bajo por su tamano reducido.
- Experimentacion academica y evaluacion de tecnicas de cuantizacion: con 3,09 B de parametros entra en una sola GPU y permite reproducir estudios de compresion, destilacion o analisis de activaciones sin infraestructura dedicada.
- Prototipado local en portatil o estacion de trabajo: con unos 6,2 GB en precision completa y alrededor de 2 GB en cuantizacion de 4 bits, se puede desplegar en GPUs de consumo para demos y validaciones rapidas.
- Vinculacion texto-codigo y recuperacion semantica: dado que el entrenamiento incluye datos de text-code grounding, el modelo sirve como base para tareas de emparejamiento entre descripciones en lenguaje natural y fragmentos de codigo tras el ajuste correspondiente.
- Construccion de un asistente de programacion propio: partiendo de este checkpoint se puede aplicar SFT sobre conversaciones y trazas de agente para obtener un modelo instruct que herede el conocimiento de codigo preentrenado.
- Docencia de programacion: el modelo puede emplearse en ejercicios de completado guiado donde el alumno vea la continuacion generada y la compare con la solucion esperada, siempre dentro de un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card remite al blog de Qwen y a la pagina de benchmarks de velocidad de la documentacion oficial para consultar resultados detallados, pero no reproduce cifras concretas. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los enlaces obtenidos correspondian a paginas corporativas de Microsoft), por lo que no se han podido verificar datos externos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: alrededor de 6,2 GB solo para los pesos, mas activaciones y cache KV. Con GQA de 2 cabezas KV y 36 capas, el cache KV ocupa aproximadamente 36 KB por token, es decir, cerca de 1,2 GB con la ventana completa de 32.768 tokens.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,5 GB; en 4 bits (Q4_K_M o similar): aproximadamente 2 GB.
- GPUs recomendadas: A100, H100 o L40S para despliegue en produccion con lotes grandes; RTX 4090, RTX 3090, RTX 4080 o A10 para inferencia individual con contexto completo en precision media.
- Cabe en GPU de consumo: si. Con cuantizacion de 4 bits funciona en GPUs de 6-8 GB de VRAM con contexto reducido, y con margen amplio en modelos de 12 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Opciones de despliegue: transformers (version 4.37.0 o superior, requerida para evitar el error KeyError: 'qwen2'), vLLM, TGI (los metadatos del repositorio incluyen la etiqueta text-generation-inference y endpoints_compatible), llama.cpp con conversion propia a GGUF, Ollama y LM Studio.
- Latencia y throughput: no disponibles. La model card enlaza a la pagina de benchmarks de velocidad de Qwen para consultar requisitos de memoria y rendimiento, pero no incluye cifras en el propio repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Coder-3B (este repositorio) | 3,09 B | 32.768 tokens | qwen-research | Checkpoint base de preentrenamiento, resubido por un tercero |
| Qwen2.5-Coder-1.5B | Aproximadamente 1,5 B (citado en la model card) | No disponible | No disponible | Variante mas pequena de la misma familia, orientada a entornos con menos memoria |
| Qwen2.5-Coder-7B | Aproximadamente 7 B (citado en la model card) | No disponible | No disponible | Escalon intermedio de la familia, con mayor capacidad a cambio de mas VRAM |
| Qwen2.5-Coder-32B | Aproximadamente 32 B (citado en la model card) | No disponible | No disponible | Segun los autores, alcanza capacidades de programacion comparables a GPT-4o |
| StarCoder2-3B | 3 B | 16.384 tokens | BigCode OpenRAIL-M | Alternativa de tamano equivalente centrada en codigo; el contexto es la mitad que el de este modelo |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Las afirmaciones sobre capacidades de la variante de 32B son declaraciones de los autores en la model card, no resultados verificados en esta ficha.

## Limitaciones y advertencias

- Es un modelo base de preentrenamiento: no sigue instrucciones de forma fiable y la propia model card desaconseja su uso directo para conversacion. Para un asistente hay que aplicar SFT, RLHF o preentrenamiento continuado.
- Este repositorio es una resubida de un tercero (FiREDragoN35769) con 0 descargas y 0 likes. Conviene verificar la integridad de los pesos y contrastar con el repositorio oficial Qwen/Qwen2.5-Coder-3B antes de usarlo en produccion.
- Licencia qwen-research: no equivale a una licencia permisiva como Apache 2.0. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial, ya que puede restringirlo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar APIs, funciones o dependencias inexistentes, especialmente en bibliotecas poco representadas en los datos de entrenamiento. Es obligatorio validar el codigo generado con compilacion y tests.
- Idioma: solo se declara soporte de ingles. El rendimiento en castellano o en otros idiomas no esta documentado y previsiblemente sera inferior.
- Idiomas de programacion: no se detalla en la informacion disponible la cobertura por lenguaje, por lo que la calidad puede variar de forma notable entre lenguajes mayoritarios y minoritarios.
- Sesgos: no hay informacion publicada sobre evaluaciones de sesgo para este checkpoint. Los modelos entrenados sobre codigo extraido de repositorios publicos tienden a reflejar los desequilibrios de esas fuentes (estilos, practicas y licencias del codigo de origen).
- Sin datos de benchmarks publicados en esta ficha ni verificados de forma independiente, no es posible garantizar un nivel de rendimiento concreto en produccion.
- Los metadatos del repositorio registran una fecha de creacion futura (2026-09-20), lo que sugiere que los datos de publicacion pueden no ser fiables.
- Al ser un modelo denso de 3,09 B, no dispone de las ventajas de eficiencia de una arquitectura MoE: cada token activa la totalidad de los parametros.

## Enlaces

- Repositorio en HuggingFace (esta resubida): https://huggingface.co/FiREDragoN35769/Qwen2.5-Coder-3B
- Repositorio oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Licencia oficial: https://huggingface.co/Qwen/Qwen2.5-Coder-3B/blob/main/LICENSE
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad y memoria: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Articulo tecnico de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Articulo tecnico de Qwen2: https://arxiv.org/abs/2407.10671
- La busqueda web realizada no devolvio enlaces relevantes al modelo (los resultados correspondian a paginas de Microsoft y no guardan relacion con esta ficha).
