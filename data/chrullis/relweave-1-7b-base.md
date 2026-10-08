# chrullis/relweave-1.7b-base

## Resumen

relweave-1.7b-base es un modelo especializado en extraccion de entidades y relaciones tipadas a partir de texto en ingles, con salida directa a un grafo de conocimiento en JSON Graph Format v2. Lo desarrolla el usuario chrullis y se publica bajo licencia Apache 2.0. No es un modelo de proposito general: es un componente de un pipeline de extraccion de informacion que responde en un formato de lineas propio y que esta pensado para consumirse a traves de la libreria relweave.

Tecnicamente parte de Qwen3-1.7B en su version cuantizada a 4 bits (`unsloth/qwen3-1.7b-unsloth-bnb-4bit`) y anade dos adaptadores LoRA que trabajan en conjunto: un `generator/` que escribe entidades y relaciones como texto bajo decodificacion restringida por gramatica, y un `head/` de clasificacion por pares que puntua cada par de entidades para eliminar relaciones inventadas por el generador y anadir las que este omitted. Los pesos del repositorio raiz son el generador con el LoRA ya fusionado, con 1.720.574.976 parametros totales (aproximadamente 1,72 mil millones) y un repositorio de 3,7 GB.

Su relevancia esta en el nicho: sigue un esquema fijo de negocio con 6 tipos de entidad y 21 tipos de relacion (empresas, personas, lugares, propiedad, filiales, ejecutivos, consejeros, adquisiciones, etc.) y ofrece un F1 estricto de relaciones tipadas de 0,722 en test, con 0,798 de precision y 0,659 de recall. Es la variante pequena de relweave-4b-base, pensada para entornos con poca VRAM o requisitos de velocidad altos: sobre una RTX 3070 Ti de 8 GB procesa unas 96 chunks por minuto con vLLM, frente a las 42 chunks por minuto del 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), con dos adaptadores LoRA: generador con decodificacion restringida y cabeza de clasificacion por pares |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible; los ejemplos oficiales de despliegue usan `--max-model-len 4096` y `--max-model-len 3072` en GPU de 8 GB |
| Tipos de cuantizacion | entrenamiento sobre base en 4 bits (bnb-4bit); pesos del generador en el repositorio raiz con LoRA fusionado, servidos en bf16 en vLLM (3,3 GB en memoria). Sin versiones GGUF, AWQ o GPTQ documentadas |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; adaptadores LoRA (PEFT) y modelo raiz con LoRA fusionado |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-1.7B (arquitectura transformer decoder-only) partiendo de una version ya cuantizada a 4 bits, sobre la que se entrenan dos adaptadores LoRA con PEFT. El primero, `generator/`, produce las entidades y relaciones en el formato de lineas de relweave bajo una gramatica de decodificacion por chunk; el segundo, `head/`, es una cabeza de clasificacion de pares que puntua todos los pares de entidades y corrige la salida del generador en ambas direcciones (elimina relaciones inventadas y recupera las omitidas). La union de ambos componentes es la que alcanza el F1 reportado.

El esquema se define una sola vez como clases Python en `bench/ontology/business.py`, y de esas clases se derivan los prompts, las gramaticas de decodificacion, la validacion de etiquetas y el scoring. El conjunto de datos de entrenamiento es `chrullis/relweave-business-data`, y el modelo hermano relweave-4b-base se entreno "con los mismos datos y receta", segun la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases de RLHF o DPO.

La innovacion destacable es el diseno en dos etapas con decodificacion restringida: el generador nunca puede emitir etiquetas fuera del esquema, y la cabeza de pares actua como verificador aprendido. La cabeza se ejecuta siempre en local porque necesita los estados ocultos del modelo, que vLLM no devuelve. Ademas, la evaluacion se hizo sobre pasajes de Wikipedia en ingles sobre empresas nordicas y europeas, con conjuntos de validacion y test que no comparten documentos, entidades ni hechos con los datos de entrenamiento.

## Capacidades

- Extraccion de entidades tipadas con todas sus menciones, incluyendo pronombres y descripciones como "the company" (correferencia dentro del documento).
- Extraccion de relaciones tipadas y dirigidas entre entidades, con un esquema fijo de 6 tipos de entidad y 21 tipos de relacion; la model card solo detalla en el extracto disponible el tipo de entidad (PERSON, ORG, OBJECT, PLACE, COORDINATE, EVENT) y la relacion EMPLOYED_BY, el resto no esta disponible en la informacion proporcionada.
- Generacion de grafos en JSON Graph Format v2 con nodos, aristas, spans de mencion y evidencia.
- Segmentacion de documentos largos y fusion de entidades entre chunks, realizada por la libreria relweave.
- Decodificacion restringida por gramatica, que limita la salida al esquema de negocio definido.
- Verificacion de relaciones mediante cabeza de clasificacion por pares.
- Servible mediante vLLM con API compatible con OpenAI a traves de `generator_url`.
- No soporta tool calling ni function calling segun la informacion disponible.
- No es un modelo conversacional: la propia model card indica que el endpoint es un componente y no un modelo de chat, y que solo responde en el formato de lineas de relweave cuando se le promptea como fue entrenado.

## Casos de uso

- Construccion de grafos de conocimiento sobre informes corporativos: el modelo lee un informe, extrae empresas, personas, cargos y operaciones societarias y devuelve un grafo JSON con evidencia, lo que permite cargarlo directamente en una base de grafos para consultas posteriores.
- Analisis de operaciones societarias (M&A): con los tipos de relacion de propiedad, filiales y adquisiciones, se pueden reconstruir cadenas de control y matrices de participacion a partir de prensa economica o notas de prensa.
- Enriquecimiento de bases de datos de CRM o inteligencia de mercado: a partir de articulos y notas, el sistema genera nodos de organizacion y persona con sus relaciones, lo que alimenta fichas de cuentas y mapas de decisores.
- Pipeline de vigilancia de medios (media monitoring): procesar lotes de noticias en ingles sobre empresas nordicas y europeas y emitir alertas cuando aparece una relacion nueva relevante (un nombramiento, una venta, una adquisicion).
- Construccion de corpus anotados para entrenar otros modelos: al devolver spans de mencion y evidencia, la salida sirve como preanotacion revisable por humanos en tareas de NER y relation extraction.
- Indexacion semantica para busqueda sobre documentos internos: transformar informes tecnicos o financieros en grafos permite responder consultas del tipo "que filiales dependen de X" sin recuperacion por similitud de texto.
- Despliegue en hardware modesto para prototipos: al caber en una GPU de 8 GB junto con la cabeza de pares y procesar unas 96 chunks por minuto, es apto para pruebas de concepto y entornos de desarrollo sin aceleradores de gama alta.
- Auditoria de documentacion contractual o regulatoria en ingles: extraer partes, roles y eventos con fechas ayuda a construir resumenes estructurados y trazables de documentos largos, siempre con revision humana.

## Benchmarks y rendimiento

F1 estricto de relaciones tipadas (una relacion solo cuenta si tiene el tipo correcto, la direccion correcta y ambas entidades correctas), sobre pasajes de Wikipedia en ingles sobre empresas nordicas y europeas. Los conjuntos de validacion y test no comparten documentos, entidades ni hechos con los datos de entrenamiento.

| Sistema | Validacion | Test |
|---|---|---|
| relweave-1.7b-base (generador + cabeza de pares, union) | 0,737 | 0,722 |
| Generador solo (relweave-1.7b-base) | 0,622 | 0,626 |
| relweave-4b-base, para comparacion | 0,781 | 0,783 |

Metricas adicionales reportadas:

| Metrica | Valor |
|---|---|
| Precision en test (1.7b, sistema completo) | 0,798 |
| Recall en test (1.7b, sistema completo) | 0,659 |
| F1 sobre 377 chunks (validacion + test + test nuevo), 1.7b | 0,732 |
| F1 sobre 377 chunks (validacion + test + test nuevo), 4b | 0,780 |
| Diferencia 1.7b frente a 4b (377 chunks) | -0,048 (intervalo de confianza del 95 %: 0,030 a 0,067) |
| F1 en test nuevo de 64 chunks, sistema completo con generador en vLLM | 0,749 |
| F1 en test nuevo de 64 chunks, sistema completo con backend transformers | 0,736 |

Rendimiento del generador en una RTX 3070 Ti (8 GB), sobre 64 chunks de test de unas 200 palabras:

| Modelo y backend | Throughput | Pesos en memoria vLLM |
|---|---|---|
| relweave-1.7b-base, vLLM (bf16) | aproximadamente 96 chunks/min | 3,3 GB (bf16) |
| relweave-1.7b-base, transformers | aproximadamente 6 chunks/min | no aplica |
| relweave-4b-base, vLLM (fp8) | aproximadamente 42 chunks/min | 4,2 GB (fp8) |
| relweave-4b-base, transformers | aproximadamente 4,5 chunks/min | no aplica |

## Requisitos de hardware

- Se requiere una GPU CUDA, segun la model card; el modelo base esta en 4 bits y el 1.7B consume menos memoria que el 4B.
- La cabeza de pares se ejecuta siempre en local y necesita unos 3 GB de VRAM libres, ya que requiere los estados ocultos del modelo.
- En una tarjeta de 8 GB el servidor de 1.7B y la cabeza de pares caben juntos con los siguientes ajustes: `--gpu-memory-utilization 0.52 --max-model-len 3072 --max-num-batched-tokens 1024 --enforce-eager`.
- GPU medida por el autor: RTX 3070 Ti de 8 GB. No se documentan otras GPU recomendadas (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Cabe en GPU de consumo segun los datos del autor: si, en una GPU de 8 GB junto con la cabeza de pares.
- Opciones de despliegue: vLLM (`vllm serve chrullis/relweave-1.7b-base --max-model-len 4096`) o el contenedor oficial `vllm/vllm-openai`; la libreria relweave tambien puede usar el backend de transformers. Probado con vLLM 0.31.
- Detalle de despliegue: los pesos del repositorio raiz ya llevan el LoRA fusionado, por lo que vLLM no necesita `--enable-lora` ni argumentos de adaptador. El endpoint debe invocarse a traves de relweave con `generator_url`, que ademas ejecuta la cabeza de pares y fusiona entidades entre chunks.
- Sin CUDA toolkit instalado, hay que arrancar vLLM con `VLLM_USE_FLASHINFER_SAMPLER=0`.
- Latencia y throughput medidos: aproximadamente 96 chunks/min en vLLM con bf16 y aproximadamente 6 chunks/min con el backend de transformers, sobre chunks de unas 200 palabras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 estricto (validacion / test) | Throughput en RTX 3070 Ti 8 GB | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| relweave-1.7b-base | 1,72 B | no disponible (ejemplos a 4096) | 0,737 / 0,722 | aproximadamente 96 chunks/min (vLLM, bf16); 6 chunks/min (transformers) | Apache 2.0 | HuggingFace, repositorio de 3,7 GB |
| relweave-4b-base | no disponible en la informacion proporcionada | no disponible | 0,781 / 0,783 | aproximadamente 42 chunks/min (vLLM, fp8); 4,5 chunks/min (transformers) | Apache 2.0 (segun el modelo hermano listado con la misma receta) | HuggingFace |
| Otros sistemas de extraccion de relaciones tipadas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor recomienda explicitamente usar el 4B salvo que la memoria o la velocidad lo impidan: la diferencia agregada sobre 377 chunks es de 0,048 puntos de F1 a favor del 4B, con un intervalo de confianza del 95 % de 0,030 a 0,067.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- El esquema es fijo: 6 tipos de entidad y 21 tipos de relacion de ambito empresarial. El modelo no puede extraer relaciones fuera de ese esquema.
- No es un modelo conversacional ni un asistente: solo responde correctamente cuando se le promptea como fue entrenado y bajo la gramatica por chunk que envia relweave. Usarlo como endpoint de chat directo produce resultados invalidos.
- Riesgo de alucinacion en las relaciones: el propio diseno incorpora una cabeza de pares precisamente para eliminar las relaciones que el generador inventa, lo que confirma que ese error existe y que el generador por si solo no es fiable (F1 de 0,622 en validacion frente a 0,737 del sistema completo).
- El recall en test es de 0,659, es decir, aproximadamente un tercio de las relaciones correctas no se recuperan; conviene planificar revision humana en flujos criticos.
- La evaluacion se limita a pasajes de Wikipedia sobre empresas nordicas y europeas; el rendimiento en otros dominios, generos o registros no esta documentado.
- No se documentan sesgos especificos, composicion del dataset de entrenamiento ni tokens de entrenamiento, lo que dificulta evaluar cobertura y sesgos por tipo de entidad.
- La cabeza de pares no puede servirse en vLLM y necesita estados ocultos, de modo que siempre exige ejecucion local en GPU, lo que complica despliegues puramente remotos o serverless.
- Requiere GPU CUDA; no se documenta soporte para CPU ni para aceleradores no NVIDIA.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 7 de octubre de 2026: no hay historial de uso ni validacion independiente por parte de terceros.
- Aunque la licencia del modelo es Apache 2.0, conviene verificar las condiciones del dataset `chrullis/relweave-business-data` y del modelo base antes de un uso comercial.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente resultados de spam sin relacion); no hay papers, demos ni articulos independientes disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chrullis/relweave-1.7b-base
- Variante mayor, relweave-4b-base: https://huggingface.co/chrullis/relweave-4b-base
- Dataset de entrenamiento: https://huggingface.co/datasets/chrullis/relweave-business-data
- Modelo base utilizado: https://huggingface.co/unsloth/qwen3-1.7b-unsloth-bnb-4bit
- Repositorio de la libreria relweave: https://github.com/memlocator/relweave
- Papers, blogs o demos adicionales: no disponible (la busqueda web no devolvio resultados relevantes)
