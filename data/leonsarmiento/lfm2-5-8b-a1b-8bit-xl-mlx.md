# leonsarmiento/LFM2.5-8B-A1B-8bit-XL-mlx

## Resumen

LFM2.5-8B-A1B-8bit-XL-mlx es una cuantizacion de 8 bits del modelo LiquidAI/LFM2.5-8B-A1B, publicada por el usuario leonsarmiento. Se trata de un modelo de lenguaje de tipo MoE (mezcla de expertos) con 8,47 mil millones de parametros totales segun los safetensors del repositorio (la model card del autor de la cuantizacion indica 8,3B) y aproximadamente 1,5 mil millones de parametros activos por token. El modelo base lo desarrolla Liquid AI sobre su arquitectura propietaria LFM2, descrita como hibrida de convoluciones cortas y atencion completa, y esta orientada al despliegue en dispositivo (edge), incluyendo asistentes personales en Macs de 16 GB.

La relevancia de esta ficha concreta esta en la receta de cuantizacion: BaseQuant_XL 8-bit es una cuantizacion estatica y agnostica a los datos, sin conjunto de calibracion ni analisis de sensibilidad. La precision se asigna por rol arquitectonico, dejando la puerta del enrutador de expertos (feed_forward.gate) en bf16 para evitar errores de enrutamiento, y el resto de capas (embeddings atados a la cabeza de salida, atencion, convoluciones cortas, MLP denso y expertos enrutados) en 8 bits. El resultado ocupa unos 9,0 GB repartidos en dos fragmentos y solo funciona con la libreria MLX de Apple, por lo que su publico objetivo son desarrolladores con hardware Apple Silicon.

El modelo base incorpora 128.000 tokens de contexto, un vocabulario del mismo tamano, 10 idiomas declarados y un presupuesto de entrenamiento de 38 billones de tokens, con preentrenamiento extendido y RL. El modo de razonamiento (thinking) es nativo y los trazos de razonamiento se emiten en linea dentro de la respuesta. La licencia es la LFM Open License (lfm1.0), que no es una licencia de codigo abierto estandar y hay que revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2MoeForCausalLM (lfm2_moe), hibrida: 24 capas, 18 de convolucion corta con doble gate y 6 de atencion completa GQA |
| Parametros totales | 8.467.856.128 (~8,47B segun safetensors; la model card indica 8,3B) |
| Parametros activos | ~1,5B por token |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | Nombre de la receta: BaseQuant_XL 8-bit (estatica, agnostica a los datos, grupo de 64, 8,501 bits por peso). Razonador en bf16; resto de capas en 8 bits |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues, italiano |
| Licencia | LFM Open License (identificador lfm1.0, licencia "other" en HuggingFace) |
| Formato de pesos | MLX safetensors, 2 fragmentos, ~9,0 GB en total |
| Expertos | 32 enrutados, 4 activos por token, con sesgo de experto (expert bias) |
| Vocabulario | 128.000 tokens |
| Presupuesto de entrenamiento del modelo base | 38 billones de tokens |

## Arquitectura y entrenamiento

La arquitectura del modelo base es Lfm2MoeForCausalLM (identificador de arquitectura lfm2_moe). Consta de 24 capas: 18 capas de convolucion corta con doble gate y 6 capas de atencion completa con GQA (grouped-query attention). La componente MoE utiliza 32 expertos enrutados de los cuales se activan 4 por token, e incorpora un sesgo de experto. El vocabulario es de 128.000 tokens y el contexto alcanza los 128.000 tokens. Segun Liquid AI, el modelo base se sometio a un preentrenamiento extendido mas RL sobre la arquitectura LFM2, con un presupuesto total de 38 billones de tokens; los detalles concretos de composicion del dataset, fases de RLHF/DPO y mezcla de datos no estan disponibles en la informacion proporcionada.

La contribucion especifica de esta publicacion es la cuantizacion. BaseQuant_XL 8-bit es una cuantizacion estatica sin conjunto de calibracion, sin analisis de sensibilidad y sin matriz de importancia: la asignacion de bits depende exclusivamente del rol arquitectonico. La capa feed_forward.gate (el enrutador) se mantiene en bf16 porque cualquier ruido de cuantizacion ahi provoca enrutamiento erroneo de expertos; embeddings, atencion, convoluciones cortas, MLP denso y expertos enrutados van en 8 bits. Como tie_word_embeddings es verdadero, el embedding de 8 bits actua tambien como cabeza de salida. El autor argumenta que las cuantizaciones dependientes de datos (iMatrix, AWQ, GPTQ, oQ, oQ4e) sesgan la representacion hacia los dominios presentes en el conjunto de calibracion y penalizan idiomas no ingleses o casos de uso poco representados, y que XL evita ese sesgo. Liquid AI publica por su parte una build MLX 8-bit uniforme, que se diferencia de esta por no mantener el razonador en bf16.

## Capacidades

- Generacion de texto y conversacion multi-turno con hasta 128.000 tokens de contexto.
- Razonamiento con modo thinking nativo: los trazos de razonamiento se emiten en linea dentro de la respuesta.
- Seguimiento de instrucciones complejas, con mejoras sustanciales reportadas por Liquid AI en IFEval, IFBench y Multi-IF respecto a LFM2-8B-A1B.
- Razonamiento matematico, con resultados reportados en MATH500 y AIME25.
- Llamada a herramientas (tool calling / function calling), medida con BFCLv3 y BFCLv4.
- Tareas agenticas y de varios pasos, con cadenas de llamadas a herramientas; medido en Tau2 Telecom y Tau2 Retail.
- Soporte multilingue en 10 idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Capacidades de base factua medibles mediante el indice AA-Omniscience (el modelo base pasa de -78,42 a -24,70).
- No se declaran capacidades de vision ni de audio en la informacion disponible.

## Casos de uso

- Asistentes personales en dispositivo: el modelo esta disenado explicitamente para ejecutarse en Macs de 16 GB con MLX, con un peso de unos 9,0 GB, de modo que un asistente local puede mantener conversaciones largas sin enviar datos a la nube.
- Automatizacion de agentes con cadenas de herramientas: los 128.000 tokens de contexto y las puntuaciones en BFCLv3/BFCLv4 permiten encadenar llamadas a funciones sucesivas manteniendo el estado de la tarea en el contexto.
- Atencion al cliente multi-turno: el contexto largo permite arrastrar el historial completo de una incidencia y el modelo puede invocar APIs internas de pedidos o facturacion mediante tool calling.
- Procesamiento de documentos extensos en idiomas distintos del ingles: la cuantizacion agnostica a los datos evita el sesgo hacia dominios anglosajones presentes en conjuntos de calibracion tipicos, lo que resulta util para resumir y extraer informacion de textos en espanol, portugues, frances o aleman.
- Razonamiento matematico asistido en local: con los resultados reportados en MATH500 (88,76) y AIME25 (42,53) sobre el modelo base, es viable usarlo como corrector o tutor de problemas paso a paso sin conexion.
- Generacion y revision de codigo en un flujo local: el modelo puede integrarse en editores o scripts sobre Apple Silicon, aunque no se han publicado resultados de HumanEval ni de benchmarks de codigo en la informacion disponible.
- Traduccion y adaptacion de contenidos entre los 10 idiomas declarados, aprovechando el vocabulario de 128.000 tokens.
- Prototipado rapido sin GPU dedicada: para equipos que desarrollan en Mac, permite evaluar el comportamiento del modelo base LFM2.5-8B-A1B antes de decidir un despliegue en servidor con los pesos originales.

## Benchmarks y rendimiento

Los unicos datos disponibles son los del modelo base publicados por Liquid AI, que comparan LFM2.5-8B-A1B con su predecesor LFM2-8B-A1B. No son mediciones de esta cuantizacion concreta, sino del modelo sin cuantizar.

| Benchmark | LFM2-8B-A1B | LFM2.5-8B-A1B | Delta |
|---|---:|---:|---:|
| AA-Omniscience Index | -78,42 | -24,70 | +53,62 |
| IFEval | 79,44 | 91,84 | +12,40 |
| IFBench | 26,00 | 56,47 | +30,47 |
| Multi-IF | 58,54 | 79,93 | +21,39 |
| MATH500 | 74,80 | 88,76 | +13,96 |
| AIME25 | 20,00 | 42,53 | +22,53 |
| BFCLv3 | 45,07 | 64,36 | +19,29 |
| BFCLv4 | 25,52 | 48,50 | +22,98 |
| Tau2 Telecom | 13,60 | 88,07 | +74,47 |
| Tau2 Retail | 7,02 | 39,82 | +32,80 |

No se han publicado resultados de benchmarks especificos de esta cuantizacion MLX 8-bit en la informacion disponible. Tampoco hay mediciones de latencia o throughput.

## Requisitos de hardware

- Peso en disco y en memoria de los pesos: aproximadamente 9,0 GB, en dos fragmentos safetensors (8,501 bits por peso, grupo de 64).
- El autor indica que el modelo cabe en Macs de 16 GB de memoria unificada, que es el escenario de despliegue declarado. A esa cifra hay que sumar la cache KV para contextos largos, por lo que 16 GB es el minimo practico y no deja margen para contextos cercanos a los 128.000 tokens.
- GPU NVIDIA (A100, H100, RTX 4090) y CUDA: no soportadas por este repositorio, que esta empaquetado para la libreria MLX de Apple. Para esos entornos habria que recurrir a los pesos originales o a otras cuantizaciones del modelo base.
- Apple Silicon: requisito de facto. El repositorio esta etiquetado con la libreria mlx y el quickstart usa mlx-lm.
- Opciones de despliegue: mlx-lm (comando mlx_lm.chat). vLLM, llama.cpp, Ollama, TGI y otros motores no estan soportados por este formato. Liquid AI publica una build MLX 8-bit alternativa.
- Parametros de inferencia recomendados por Liquid AI: temperature 0,2, top_k 80 y repetition_penalty 1,05.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leonsarmiento/LFM2.5-8B-A1B-8bit-XL-mlx (este) | 8,47B totales, ~1,5B activos | 128.000 tokens | MLX safetensors, 8 bits con razonador en bf16, ~9,0 GB | LFM Open License (lfm1.0) | HuggingFace, repositorio con 0 descargas y 0 likes en el momento de la consulta |
| LiquidAI/LFM2.5-8B-A1B-MLX-8bit | Mismo modelo base, ~1,5B activos | 128.000 tokens | MLX safetensors, 8 bits uniforme (sin el razonador en bf16) | LFM Open License (lfm1.0) | Build oficial de Liquid AI |
| LiquidAI/LFM2.5-8B-A1B | 8,3B totales segun la model card, ~1,5B activos | 128.000 tokens | Pesos originales sin cuantizar | LFM Open License (lfm1.0) | Modelo fuente, con benchmarks publicados |
| LFM2-8B-A1B | Generacion anterior | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | LFM Open License (lfm1.0) | Usado como referencia de benchmarks |

No se dispone de datos de benchmarks de esta cuantizacion que permitan una comparacion de rendimiento cuantitativa frente a las otras builds.

## Limitaciones y advertencias

- Solo MLX: los pesos no se pueden cargar en vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue a equipos Apple Silicon.
- Sesgos: el autor sostiene que la cuantizacion agnostica a los datos evita el sesgo hacia dominios de calibracion, pero eso no elimina los sesgos propios del modelo base, que no se documentan en la informacion disponible.
- Alucinacion: el indice AA-Omniscience del modelo base es -24,70, un valor negativo que mide el equilibrio entre conocimiento factual y tendencia a responder de forma incorrecta en lugar de abstenerse. Sigue siendo un resultado negativo, por lo que persiste riesgo de respuestas incorrectas con apariencia de seguridad. La cuantizacion a 8 bits puede degradar ligeramente este comportamiento.
- Idiomas: aunque se declaran 10 idiomas, no se han publicado metricas por idioma para esta cuantizacion, por lo que el rendimiento real en espanol, portugues o coreano no esta cuantificado.
- Contexto: los 128.000 tokens son nominales. En un Mac de 16 GB, la cache KV para contextos muy largos puede agotar la memoria antes de alcanzar ese limite.
- Licencia: se trata de la LFM Open License (lfm1.0), no de una licencia de codigo abierto estandar. Los terminos de uso comercial deben revisarse en el enlace de licencia del modelo base antes de cualquier despliegue en produccion.
- Repositorio con 0 descargas y 0 likes y creado el 10 de septiembre de 2026: es una publicacion reciente y sin validacion de la comunidad. No hay evidencia publica independiente que confirme la fidelidad de la cuantizacion respecto al modelo base.
- Discrepancia de recuento: los safetensors indican 8.467.856.128 parametros y la model card del autor indica 8,3B. La diferencia probablemente se debe al redondeo, pero conviene tenerla en cuenta.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los del ecosistema HuggingFace y Liquid AI listados abajo.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/leonsarmiento/LFM2.5-8B-A1B-8bit-XL-mlx
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/LICENSE
- Build MLX 8-bit oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-MLX-8bit
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Libreria MLX LM: https://github.com/ml-explore/mlx-lm
