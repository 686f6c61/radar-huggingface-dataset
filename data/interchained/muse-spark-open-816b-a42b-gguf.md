# Interchained/Muse-Spark-Open-816B-A42B-GGUF

## Resumen

Interchained/Muse-Spark-Open-816B-A42B-GGUF es la conversion a formato GGUF del modelo Muse-Spark-Open-816B-A42B de Meta, publicada por el usuario Interchained. Se trata de un modelo de mezcla de expertos (MoE) con 816.000 millones de parametros totales y 42.000 millones activos por token, orientado a generacion de texto y uso conversacional. No se trata de un modelo nuevo entrenado por Interchained, sino de una redistribucion convertida y cuantizada de los pesos oficiales.

Su relevancia practica esta en el formato: los pesos originales se distribuyen como 78 ficheros safetensors que suman 1,64 TB, lo que obliga a usar el stack de entrenamiento o inferencia de referencia. Esta conversion los lleva a GGUF mediante la herramienta Hearth (`hearth convert`), con 1.429 tensores en F16 como maestro, y a partir de ahi se generan cuantizaciones con `llama-quantize` estandar. Eso permite cargar el modelo en llama.cpp, Ollama o LM Studio sin manipulacion adicional de pesos.

El repositorio se creo el 17 de octubre de 2026 y en el momento de redactar esta ficha registra 0 descargas y 0 interacciones, con un tamano de repositorio reportado de 0,0 GB. La propia model card marca los ficheros como en proceso (particionado del maestro F16, cuantizacion Q4_0 en curso y Q4_K_M pendiente), por lo que la disponibilidad efectiva de los pesos puede ser parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos); detalles internos de atencion no disponibles |
| Parametros totales | 816 000 millones (816B) |
| Parametros activos | 42 000 millones (42B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (maestro, 5 shards), Q4_0, Q4_K_M (anunciadas) |
| Idiomas soportados | no disponible |
| Licencia | Muse Model License (`license: other`) |
| Formato de pesos | GGUF (origen: safetensors) |
| Modelo base | meta-models/Muse-Spark-Open-816B-A42B (gated) |
| Autor de la conversion | Interchained |
| Herramientas de conversion | Hearth (`hearth convert`) + `llama-quantize` estandar |
| Tamano de ficheros | F16: ~330 GB por shard (5 shards, ~1,64 TB total); Q4_0: ~450 GB; Q4_K_M: ~480 GB (estimado) |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-10-17 |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos con 816B de parametros totales y 42B activos, segun los metadatos del repositorio y la model card. La informacion disponible no detalla el numero de expertos, la topologia de enrutamiento, el tipo de atencion, la longitud de contexto nativa ni la composicion de la ventana. Tampoco hay datos sobre el numero de tokens de entrenamiento, la mezcla de datos, ni sobre si se aplicaron etapas de ajuste por preferencias (RLHF, DPO u otras). Todos estos puntos quedan como no disponibles.

Lo que si esta documentado es el proceso de conversion, que es el valor anadido de este repositorio. Interchained descargo los pesos oficiales el 16 de octubre de 2026 (78 safetensors, 1,64 TB, verificados completos) y los convirtio a GGUF en F16, resultando en 1.429 tensores. La model card afirma que no hay "weight surgery" ni pesos de terceros: el maestro F16 es la fuente de la que se derivan todas las cuantizaciones, con el objetivo declarado de evitar derivas entre versiones. El modelo es exclusivamente de texto; no incluye proyector de vision.

## Capacidades

- Generacion de texto en formato conversacional: es el pipeline declarado (`text-generation`) y el caso de uso principal de la etiqueta `conversational`.
- Razonamiento y conocimiento general derivados del entrenamiento del modelo base de Meta: no hay evaluacion publicada en este repositorio que lo cuantifique.
- Capacidad multilingue: no disponible. No se declara lista de idiomas.
- Tool calling / function calling: no disponible. No se menciona soporte en la informacion proporcionada.
- Uso agentico y razonamiento multi-paso: no disponible. No hay documentacion al respecto.
- Modo de razonamiento explicito (thinking): no disponible.
- Vision: no soportada. La model card indica explicitamente "text-only for now - no vision projector yet".
- Audio: no disponible.
- Ejecucion en runtimes GGUF: carga transparente de GGUF particionados, apuntando llama.cpp al primer shard.

## Casos de uso

- Asistentes conversacionales de gran escala en infraestructura propia: el modelo esta pensado para despliegue en centro de datos y su naturaleza MoE activa 42B por token, lo que reduce el coste de computo por token frente a un denso de 816B. Adecuado cuando se quiere maxima calidad del modelo base de Meta sin depender de APIs externas.
- Generacion de texto a gran volumen por lotes: clasificacion, resumen, reescritura o extraccion estructurada sobre corpus extensos, ejecutados con llama-server sobre las cuantizaciones Q4_0 o Q4_K_M.
- Despliegue con llama.cpp u Ollama en entornos con memoria agregada muy alta: la conversion GGUF es precisamente el requisito para usar estos runtimes, que no consumen safetensors directamente.
- Investigacion sobre cuantizacion de modelos MoE masivos: el repositorio publica maestro F16 y derivados Q4_0 y Q4_K_M del mismo origen, lo que permite estudiar la degradacion por cuantizacion en un MoE de 816B con un punto de referencia comun.
- Auditoria de procedencia de pesos: util para equipos que necesitan trazabilidad entre los pesos oficiales gated y un artefacto ejecutable con pasos documentados (descarga, conversion, cuantizacion).
- Base para ajuste fino o destilacion en entornos de investigacion: al estar en GGUF se puede usar como referencia de comportamiento, aunque para fine-tuning convencional habria que partir de los safetensors originales.
- Servicio de texto con requisitos de privacidad estrictos: al ejecutarse en hardware propio, los datos no salen de la infraestructura, algo relevante en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, y tampoco hay comparaciones con modelos de tamano similar. La busqueda web realizada no ha devuelto material tecnico relacionado con el modelo.

## Requisitos de hardware

- Cuantizacion F16: ~1,64 TB de pesos repartidos en 5 shards de ~330 GB. Requiere memoria agregada del orden del terabyte, es decir, multiples nodos o un servidor con enorme cantidad de VRAM o RAM.
- Cuantizacion Q4_0: ~450 GB de fichero. Necesita al menos esa cantidad de memoria entre VRAM y RAM, mas el espacio de cache KV, cuyo tamano no esta disponible al desconocerse la longitud de contexto y el numero de capas.
- Cuantizacion Q4_K_M: ~480 GB estimados, con el mismo condicionante anterior.
- GPU de consumo: no cabe. Ni siquiera una RTX 4090 (24 GB) ni una configuracion multi-GPU de gama alta doméstica pueden alojar los pesos. Solo seria viable con offload masivo a RAM o SSD via mmap, con rendimiento muy degradado y sin datos publicados de latencia.
- GPU de centro de datos: el modelo es "datacenter-class" segun la model card. No se especifican configuraciones recomendadas (H100, A100, MI300 u otras) ni el numero de unidades necesario para las distintas cuantizaciones.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y LM Studio, que hablan GGUF. Para otros runtimes (vLLM, TGI) no se aporta informacion en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna cuantizacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones verificadas de modelos alternativos de la misma categoria (MoE de gran escala con decenas de miles de millones de parametros activos) que permitan una comparacion rigurosa. El unico punto de referencia documentado es el propio modelo base meta-models/Muse-Spark-Open-816B-A42B, del que este repositorio es una conversion de formato con identico numero de parametros (816B totales, 42B activos) y licencia Muse Model License.

## Limitaciones y advertencias

- Licencia Muse Model License, clasificada como `other`. El repositorio remite a `LICENSE.md` y `USE_POLICY.md`: es imprescindible revisar ambos antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- Redistribucion de pesos de un modelo gated de Meta. La conversion se realizo con acceso propio segun el autor, pero conviene verificar que los terminos del modelo base permiten esta redistribucion en GGUF.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos. No hay evaluaciones publicadas que permitan acotarlo en este modelo.
- Idiomas soportados no declarados. No se puede asumir calidad homogenea fuera del ingles sin datos.
- Longitud de contexto desconocida, lo que impide planificar cargas de trabajo de contexto largo.
- Sin capacidades de vision; la model card lo indica de forma explicita.
- Estado del repositorio dudoso: 0 descargas, 0 likes y un tamano de repositorio reportado de 0,0 GB, con los ficheros marcados como "splitting next", "quantizing now" y "next". Es posible que los pesos no esten completos o no esten subidos en el momento de consulta.
- Requisitos de hardware extremos: incluso las cuantizaciones de 4 bits rondan los 450-480 GB, muy por encima de cualquier GPU de consumo.
- Fechas de creacion y actualizacion en 2026, posteriores a la fecha habitual de publicacion de este tipo de artefactos; no son verificables de forma independiente con la informacion disponible.
- No hay datos de throughput, latencia, consumo energetico ni estabilidad en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Interchained/Muse-Spark-Open-816B-A42B-GGUF
- Modelo base (gated): https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Herramienta de conversion Hearth: https://github.com/aiassistsecure/hearth
- Perfil del autor de la conversion: https://huggingface.co/Interchained
- Ficheros de licencia y politica de uso referenciados en la model card: `LICENSE.md` y `USE_POLICY.md` dentro del repositorio
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo (los resultados obtenidos corresponden a ofertas de empleo de UNESCO y no guardan relacion).
