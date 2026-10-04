# KoroshG/qwen3_5-4b-nl2sql-adapter-test

## Resumen

`KoroshG/qwen3_5-4b-nl2sql-adapter-test` es un adaptador LoRA (PEFT) publicado por el usuario KoroshG sobre el modelo base Qwen/Qwen3.5-4B. Por el identificador y las etiquetas del repositorio, su propósito declarado es el ajuste fino para la tarea NL2SQL (traducción de lenguaje natural a consultas SQL), aunque la model card publicada es la plantilla por defecto de HuggingFace sin ningún apartado completado. El repositorio no incluye pesos completos, sino los tensores del adaptador en formato safetensors, que deben combinarse con el modelo base para su uso.

El modelo base, Qwen3.5-4B, pertenece a la familia Qwen3.5 de Alibaba, descrita en la documentación oficial como una familia de modelos fundacionales nativamente multimodales, entrenados desde cero sobre tokens intercalados de texto, imagen y vídeo. Emplea una pila de atención híbrida en proporción 3:1, con tres capas de Gated DeltaNet (atención lineal) por cada capa de Gated Attention (atención completa), y una ventana de contexto nativa de 262.144 tokens. Se trata de un modelo denso de 4.000 millones de parámetros, no de una arquitectura MoE.

La relevancia de esta ficha es limitada y conviene decirlo con claridad: el repositorio no documenta datos de entrenamiento, hiperparámetros, conjunto de evaluación, licencia ni idiomas, cuenta con cero descargas y cero interacciones, y su nombre incluye el sufijo "adapter-test", lo que apunta a una prueba técnica más que a un artefacto listo para producción. Cualquier evaluación seria exige descargar el adaptador, fusionarlo con el modelo base y medir su comportamiento real sobre un esquema de base de datos propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer híbrido (Gated DeltaNet + Gated Attention en proporcion 3:1) con capacidades multimodales en el modelo base |
| Parametros totales | Modelo base: 4.000 millones (denso). Adaptador LoRA: no disponible (el repositorio ocupa 0,0 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base (segun documentacion de Qwen3.5 y LM Studio) |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors; la cuantizacion aplicable depende del modelo base y del runtime empleado |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT) |
| Libreria | PEFT 0.21.0, transformers |
| Modelo base | Qwen/Qwen3.5-4B |
| Pipeline | text-generation |
| Tarea declarada | NL2SQL (inferida del identificador del repositorio, no documentada en la model card) |

## Arquitectura y entrenamiento

El adaptador es un conjunto de matrices de bajo rango (LoRA) aplicadas sobre un modelo base congelado. La informacion disponible no especifica sobre que modulos se insertan, cual es el rango, el valor de alpha, la tasa de aprendizaje ni el numero de pasos de entrenamiento: la seccion de hiperparametros de la model card esta sin completar. Tampoco se indica el conjunto de datos utilizado para el ajuste, si hubo una fase de RLHF o DPO posterior, ni si el adaptador se entreno unicamente sobre pares pregunta-respuesta en lenguaje natural y consultas SQL o si se incluyo informacion de esquema (DDL) como contexto.

Del modelo base si hay informacion publica: Qwen3.5 es una familia multimodal entrenada desde cero con texto, imagen y video intercalados, y su pila de atencion combina tres capas de Gated DeltaNet (atencion lineal) por cada capa de Gated Attention, lo que reduce el coste cuadratico en contextos largos y en el procesamiento de tokens visuales. El checkpoint base es denso, de 4.000 millones de parametros, y soporta de forma nativa 262.144 tokens de contexto. Cualquier afirmacion sobre la innovacion concreta del adaptador (por ejemplo, decodificacion especulativa o enrutado de herramientas) seria especulacion: no consta en el repositorio.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Traduccion de lenguaje natural a SQL: es la capacidad que el identificador del repositorio atribuye al adaptador, aunque no hay ningun ejemplo, conjunto de validacion ni metrica publicada que la respalde.
- Capacidades multimodales del modelo base (razonamiento visual, OCR) segun la documentacion de Qwen3.5 y el catalogo de Microsoft Foundry; no se puede confirmar que el adaptador las preserve, ya que solo modifica un subconjunto de pesos.
- Ventana de contexto larga: hasta 262.144 tokens en el modelo base, util para inyectar esquemas de bases de datos extensos.
- Soporte de tool calling y function calling: no disponible en la informacion del adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible para el adaptador.
- Idiomas: no disponible.

## Casos de uso

- Asistente de consultas sobre bases de datos internas: el adaptador se fusionaria con Qwen3.5-4B para traducir preguntas en lenguaje natural a SQL sobre un esquema conocido; la ventana de 262.144 tokens permitiria inyectar el DDL completo de bases de datos de tamano medio sin truncar.
- Generacion de consultas en herramientas de analitica para usuarios no tecnicos: un cuadro de texto donde el usuario pregunta "cuantas ventas hubo en el segundo trimestre" y el modelo emite la sentencia SQL correspondiente para su ejecucion o revision.
- Preprocesado en pipelines de datos: conversion de peticiones de negocio en consultas para ETL, siempre que la sentencia se valide contra el esquema antes de ejecutarse.
- Evaluacion comparativa de adaptadores LoRA para NL2SQL: dado su caracter de prueba ("adapter-test"), resulta adecuado como linea base en un banco de pruebas interno frente a otros adaptadores o al modelo base sin ajustar.
- Prototipado rapido de interfaces de consulta: al ser un adaptador de pocos megabytes teoricos, permite iterar sobre distintos esquemas sin redistribuir los pesos completos del modelo base.
- Investigacion sobre ajuste eficiente de parametros: sirve como ejemplo reproducible de un flujo PEFT 0.21.0 sobre Qwen3.5-4B, util para estudiar como se comporta un LoRA pequeno en una tarea estructurada.

Advertencia transversal: ninguno de estos casos deberia desplegarse en produccion sin una evaluacion previa, dada la ausencia total de documentacion y de metricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion completada, el repositorio no adjunta datasets de prueba ni cifras de exactitud de ejecucion (execution accuracy) o coincidencia exacta (exact match), y no consta ninguna comparacion con el modelo base Qwen3.5-4B sin ajustar. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para el modelo base: en torno a 8-9 GB en precision de 16 bits para los 4.000 millones de parametros, sin contar la cache KV. En cuantizacion de 8 bits, aproximadamente 4-5 GB; en 4 bits, aproximadamente 2,5-3,5 GB. Estas cifras son estimaciones derivadas del tamano del modelo base y no estan confirmadas por el autor.
- El adaptador LoRA en si anade un consumo marginal de memoria, ya que el repositorio ocupa 0,0 GB segun HuggingFace.
- GPU recomendadas para el modelo base en 16 bits: NVIDIA RTX 3090, RTX 4090, A10, L4 o superiores. Para lotes grandes y contexto muy largo, conviene una A100 o H100.
- Cabe en GPU de consumo: si, siempre que se aplique cuantizacion. Una RTX 3060 de 12 GB o una RTX 4070 de 12 GB deberian ser suficientes para inferencia en 4 u 8 bits.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp y Ollama si se fusiona y convierte a GGUF; vLLM o TGI para servir el modelo fusionado. La compatibilidad concreta con cada runtime no esta documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este adaptador, por lo que no es posible establecer una comparacion cuantitativa fiable. A continuacion se recoge una comparacion estructural con alternativas de la misma categoria, marcando como "no disponible" todo aquello que no consta en la informacion proporcionada.

| Modelo | Tipo | Parametros | Contexto | Licencia | Datos de NL2SQL publicados |
|---|---|---|---|---|---|
| KoroshG/qwen3_5-4b-nl2sql-adapter-test | Adaptador LoRA sobre Qwen3.5-4B | 4.000 millones (base) + LoRA | 262.144 tokens (base) | No disponible | No |
| Qwen/Qwen3.5-4B (modelo base) | Modelo denso multimodal | 4.000 millones | 262.144 tokens | No disponible en la informacion consultada | No aplica |
| Qwen3-4B (variante anterior de la familia) | Modelo denso | 4.000 millones | No disponible | No disponible en la informacion consultada | No |
| Otros adaptadores LoRA para NL2SQL sobre modelos de ~4B | Adaptador LoRA | No disponible | Depende del modelo base | No disponible | No verificado |

## Limitaciones y advertencias

- Model card vacia: la documentacion publicada es la plantilla por defecto de HuggingFace, con todos los apartados marcados como "[More Information Needed]". No hay informacion sobre uso previsto, datos de entrenamiento ni evaluacion.
- Licencia sin especificar: al no declararse licencia para el adaptador, no puede asumirse su uso comercial. Ademas, la licencia del modelo base Qwen3.5-4B no consta en la informacion consultada, por lo que habria que verificarla por separado antes de cualquier despliegue.
- Riesgo de alucinacion de esquema: en tareas NL2SQL es habitual que el modelo invente nombres de tablas y columnas inexistentes. Sin datos de evaluacion ni ejemplos, este riesgo no puede acotarse y exige validacion sintactica y semantica contra el catalogo real de la base de datos.
- Riesgo de inyeccion SQL: al generar sentencias ejecutables, cualquier despliegue debe limitar permisos, prohibir operaciones de escritura y aplicar revision humana o validacion automatica previa a la ejecucion.
- Idiomas no declarados: no consta que el adaptador funcione correctamente en castellano, ni siquiera si fue entrenado con instrucciones en ese idioma.
- Artefacto experimental: el sufijo "adapter-test" del identificador, junto con cero descargas y cero interacciones, sugiere que se trata de una prueba de concepto no validada.
- Sin garantia de reproducibilidad: no se documentan versiones de dataset, semillas ni hiperparametros, por lo que no es posible replicar el entrenamiento.
- Deriva respecto al modelo base: al no publicarse ningun benchmark comparativo, se desconoce si el ajuste mejora el rendimiento en NL2SQL o si degrada otras capacidades del modelo base, como las multimodales.
- Sesgos: no disponibles. Al no existir documentacion sobre la composicion de los datos de ajuste, no se puede evaluar la presencia de sesgos en las consultas generadas.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/KoroshG/qwen3_5-4b-nl2sql-adapter-test
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentacion de Qwen3.5 en transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Ficha de Qwen3.5 4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Catalogo de modelos de Microsoft Foundry para qwen3.5-4b: https://ai.azure.com/catalog/models/qwen--qwen3.5-4b
- Proyecto de referencia NL2SQL-Engine en GitHub: https://github.com/mukheshbalaji1001/NL2SQL-Engine
- Paper citado en la model card (Lacoste et al., 2019, calculo de impacto ambiental): https://arxiv.org/abs/1910.09700
