# LeandroBarros/EPAGO-DR-30B-king-c5380ddf

## Resumen

EPAGO-DR-30B-king-c5380ddf es un checkpoint de pesos publicado en HuggingFace por el usuario LeandroBarros bajo el paraguas del proyecto Epago (etiquetas `epago`, `sn36`, `king-mirror`). Según su propia model card, se trata de una "copia privada de operaciones" (private ops copy) de un espejo de reyes de la subred, no de un modelo entrenado desde cero. Su linaje declarado es Alibaba-NLP/Tongyi-DeepResearch-30B-A3B en la revisión `4b0ac576`, un modelo de investigación profunda (deep research) orientado a agentes de largo horizonte.

El repositorio contiene 30.532.122.624 parámetros (unos 30,5 mil millones) en formato safetensors, con un tamaño total de 61,1 GB, lo que es coherente con pesos en precisión bf16/fp16 sin cuantizar. La etiqueta de arquitectura es `qwen3_moe`, es decir, un transformer de mezcla de expertos (MoE) de la familia Qwen3, con licencia Apache 2.0. La model card incluye un "coronation digest" (`sha256:c5380ddf9d35f87c75ed25b19296c34af41143b1f191a0e106c7fad7b40f16a2`) que identifica la versión coronada dentro del pipeline de la subred.

Su relevancia es fundamentalmente operativa y de reproducibilidad: sirve como copia de referencia para nodos con GPU dentro de una red descentralizada (la etiqueta `sn36` apunta a la subred 36), y permite auditar la correspondencia entre los pesos publicados, el digest declarado y el modelo base. No es un lanzamiento canónico ni una publicación científica: tiene 13 descargas y 0 likes en el momento de la consulta, y su model card no documenta idiomas, contexto, datos de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), etiqueta `qwen3_moe` |
| Parametros totales | 30.532.122.624 (30,5 B), dato real de los safetensors |
| Parametros activos | no disponible en la informacion proporcionada; la nomenclatura del modelo base (30B-A3B) sugiere del orden de 3 B activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors sin cuantizar (61,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base declarado | Alibaba-NLP/Tongyi-DeepResearch-30B-A3B @ 4b0ac576 |
| Digest declarado | sha256:c5380ddf9d35f87c75ed25b19296c34af41143b1f191a0e106c7fad7b40f16a2 |
| Tamano del repositorio | 61,1 GB |
| Descargas / likes | 13 / 0 |
| Fecha de creacion | 2026-09-17T01:41:10Z |
| Fecha de actualizacion | 2026-09-17T01:46:27Z |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento de este checkpoint: se trata de un espejo de pesos, no de un entrenamiento nuevo. Lo que si se puede afirmar es que la arquitectura corresponde a la familia `qwen3_moe`, es decir, un transformer decoder-only con capas de mezcla de expertos y enrutamiento por token. Los 30.532.122.624 parametros se almacenan en safetensors dentro de un repositorio de 61,1 GB, consistente con pesos de 16 bits (2 bytes por parametro mas el espacio adicional de los tensor de embedding y de los buffers). No se ha publicado en la informacion disponible el numero de expertos, el numero de expertos activados por token, el vocabulario, el numero de capas ni la composicion del dataset de entrenamiento.

El punto de partida declarado es Alibaba-NLP/Tongyi-DeepResearch-30B-A3B, un modelo de la serie Qwen3-30B-A3B ajustado para tareas de investigacion profunda y razonamiento agéntico de largo horizonte, con soporte de llamadas a herramientas y ejecucion de multiples pasos. Cualquier innovacion tecnica del base (por ejemplo, politicas de razonamiento largo, entrenamiento con refuerzo sobre trayectorias de agente o gestion de contexto extendido) seria heredada, pero no se documenta en esta ficha ni en la model card del espejo. La model card se limita a indicar que el checkpoint proviene del espejo publico de reyes en R2 de la subred, que su uso previsto es descargarlo en maquinas con GPU y que el envio a mainnet permanece en un R2 privado mediante `epago miner upload`.

## Capacidades

La informacion proporcionada no incluye una evaluacion funcional de este checkpoint concreto. A continuacion se enumeran las capacidades que cabria esperar por herencia del linaje declarado, marcando explicitamente lo que no esta verificado:

- Generacion de texto y razonamiento multi-paso: capacidades heredadas del modelo base declarado, no verificadas en este espejo.
- Investigacion profunda (deep research): el linaje Tongyi-DeepResearch esta disenado para busqueda iterativa, sintesis de fuentes y elaboracion de informes largos, aunque este checkpoint no documenta dicha capacidad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible. No hay ninguna referencia a modalidades adicionales.
- Capacidad operativa verificable: descarga de pesos, comprobacion del digest SHA-256 declarado y despliegue en nodos con GPU dentro del flujo de trabajo de la subred.

## Casos de uso

- Copia de referencia operativa para nodos de la subred: descargar el checkpoint en maquinas con GPU y verificar que el contenido coincide con el digest `c5380ddf...` declarado en la model card, de modo que todos los nodos sirvan exactamente la misma version de pesos durante una ronda de evaluacion.
- Reproducibilidad de auditorias: comparar el espejo publicado con el modelo base Alibaba-NLP/Tongyi-DeepResearch-30B-A3B en la revision `4b0ac576` para determinar si los pesos han sido modificados, y en que magnitud.
- Servicio de inferencia para agentes de investigacion profunda: desplegar el modelo detras de una API compatible con OpenAI para tareas de sintesis documental iterativa, siempre que se asuma que la calidad real no ha sido publicada en este repositorio.
- Evaluacion comparativa entre checkpoints coronados: usar este checkpoint como "rey" de referencia y medir contra el las propuestas de otros mineros de la subred, con el mismo prompt set y las mismas condiciones de hardware.
- Analisis documental de gran volumen: procesar corpus tecnicos o normativos y generar resumenes estructurados, asumiendo la longitud de contexto del modelo base como limite practico y sin datos de rendimiento especificos de este espejo.
- Extraccion de informacion estructurada: convertir texto no estructurado (informes, articulos, transcripciones) en JSON o tablas, apoyandose en el modo de razonamiento del modelo base si finalmente esta operativo.
- Banco de pruebas interno de infraestructura: medir throughput y latencia reales de un MoE de 30,5 B en el hardware propio (por ejemplo, vLLM con paralelismo de tensor) antes de comprometer recursos en produccion.
- Archivado y trazabilidad de pesos: conservar el repositorio como evidencia de la version que estuvo activa en una fecha concreta, dado que el modelo base puede evolucionar y este espejo queda congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, GPQA, AIME, SWE-bench ni similares), y la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo: los enlaces obtenidos tratan sobre el sistema de busqueda de Backstage (documentacion de software) y no guardan relacion con el modelo. Cualquier cifra que se cite para este checkpoint deberia proceder de la model card del modelo base declarado, no de este repositorio, y no se ha verificado en esta ficha.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: los pesos ocupan aproximadamente 61 GB, por lo que se necesitan del orden de 66-75 GB de VRAM contando cache KV y overhead de runtime.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, H200 141 GB. En GPUs de 48 GB (L40S, A6000) es necesario paralelismo de tensor con 2 dispositivos.
- Cuantizacion en 8 bits: unos 31-33 GB de pesos, viable en una sola GPU de 48 GB y, al limite, en 2x24 GB.
- Cuantizacion en 4 bits: unos 17-18 GB de pesos, lo que permitiria ejecutarlo en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bits sobre RTX 4090 / 3090 (24 GB) o superiores con memoria suficiente para el contexto. No cabe sin cuantizar en ninguna GPU de consumo.
- Opciones de despliegue: vLLM con tensor parallelism, SGLang y TGI son las opciones naturales para safetensors en bf16. llama.cpp u Ollama requeririan una conversion previa a GGUF que no se distribuye en este repositorio. Los transformers de HuggingFace permiten cargarlo con `device_map="auto"` o con `accelerate` multi-GPU.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este checkpoint ni especificacion del hardware de referencia.
- Almacenamiento: el repositorio ocupa 61,1 GB, por lo que se recomienda disco local NVMe o un cache de HuggingFace con espacio suficiente.

## Comparativa con modelos similares

Los datos de esta tabla corresponden a informacion publica de los respectivos model cards y al linaje declarado en este repositorio; no han sido verificados en la busqueda realizada.

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EPAGO-DR-30B-king-c5380ddf (este) | 30,53 B totales; activos no disponibles | MoE (`qwen3_moe`) | no disponible | Apache 2.0 | Espejo de terceros en HuggingFace, 13 descargas |
| Alibaba-NLP/Tongyi-DeepResearch-30B-A3B (base declarado) | 30 B totales / ~3 B activos segun nomenclatura | MoE basado en Qwen3 | no disponible en esta ficha | Apache 2.0 | Publicacion oficial de Alibaba-NLP |
| Qwen3-30B-A3B (familia base) | 30,5 B totales / 3,3 B activos | MoE Qwen3 | 32.768 nativo, ampliable a 131.072 con YaRN | Apache 2.0 | Publicacion oficial de Qwen |
| QwQ-32B | 32,5 B densos | Transformer denso | 131.072 | Apache 2.0 | Publicacion oficial de Qwen |

Nota: no se ha localizado en la busqueda ningun modelo comparable especifico del ecosistema Epago/SN36 con datos publicos de rendimiento, por lo que la comparativa de calidad entre alternativas queda como no disponible.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card no especifica contexto, idiomas, datos de entrenamiento, hiperparametros ni proceso de alineacion. Cualquier uso en produccion exige una evaluacion propia previa.
- Sin benchmarks publicados: no hay ninguna cifra de rendimiento asociada a este checkpoint, y los resultados del modelo base no son extrapolables sin verificacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y no mitigado ni documentado en este repositorio. En tareas de investigacion profunda, el riesgo de citar fuentes inexistentes es especialmente relevante.
- Sesgos: no disponibles. El autor no documenta evaluaciones de sesgo, toxicidad ni justicia, ni la composicion linguistica del entrenamiento original.
- Limitaciones de idioma: no se declara ningun idioma soportado. El comportamiento en castellano no esta verificado.
- Riesgo de integridad de pesos: se trata de un re-subida por un tercero (`LeandroBarros`) de un modelo de Alibaba-NLP. El digest SHA-256 incluido en la model card permite verificar la integridad respecto a la copia de origen, pero no garantiza que los pesos no hayan sido alterados respecto al modelo base. Conviene comprobar el digest tras la descarga.
- Licencia: Apache 2.0 permite uso comercial y modificacion, incluyendo redistribucion, siempre que se conserven los avisos de copyright y la atribucion. Es responsabilidad del usuario verificar que el modelo base declarado mantiene la misma licencia y que no existen terminos adicionales del proyecto Epago que restrinjan el uso.
- Restriccion operativa indicada por el autor: la model card senala "not for mainnet hf: submit" y "mainnet submit stays private R2". Es decir, el autor indica que el canal valido de envio a mainnet es el R2 privado mediante `epago miner upload`, no este repositorio de HuggingFace.
- Fechas anomales: la fecha de creacion registrada (2026-09-17) es posterior a la fecha de consulta habitual de este tipo de fichas. Se reproduce tal cual aparece en los metadatos, sin interpretacion.
- Sin pipeline declarado: el campo `pipeline_tag` aparece como no disponible, por lo que la plataforma no clasifica el modelo para una tarea concreta, lo que dificulta su descubrimiento y filtrado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LeandroBarros/EPAGO-DR-30B-king-c5380ddf
- Modelo base declarado en la model card: https://huggingface.co/Alibaba-NLP/Tongyi-DeepResearch-30B-A3B
- Proyecto upstream del linaje declarado: https://github.com/Alibaba-NLP/DeepResearch
- Modelo de la familia base de la arquitectura (`qwen3_moe`): https://huggingface.co/Qwen/Qwen3-30B-A3B
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Los resultados devueltos corresponden a la documentacion del sistema de busqueda de Backstage y a articulos no relacionados (`https://backstage.io/docs/features/search/api/query/`, `https://deepwiki.com/backstage/backstage/2.4-search`), por lo que no se incluyen como fuentes sobre el modelo.
