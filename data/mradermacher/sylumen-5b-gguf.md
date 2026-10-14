# mradermacher/Sylumen-5B-GGUF

## Resumen

Sylumen-5B-GGUF es la version cuantizada en formato GGUF del modelo TimJ3ly/Sylumen-5B, publicada por el usuario mradermacher, conocido por distribuir cuantizaciones de modelos abiertos para inferencia local. No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint original a distintos niveles de compresion (de Q2_K a f16) para que pueda ejecutarse en llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF.

El modelo base cuenta con 5.058.255.360 parametros (aproximadamente 5B) y esta etiquetado por su autor con las capacidades de tool-use y function-calling, ademas de estar orientado a conversacion. La licencia declarada es Apache-2.0 y el unico idioma soportado segun la model card es el ingles. El repositorio de cuantizaciones ocupa 46 GB en total, sumando todas las variantes publicadas.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de 5B con capacidades de llamada a herramientas en hardware de consumo modesto (desde unos 3 GB de VRAM en Q4_K_S); por otro, al ser Apache-2.0, no impone restricciones de uso comercial derivadas de la licencia del checkpoint original. La informacion publica sobre arquitectura, datos de entrenamiento y contexto es muy limitada, por lo que esta ficha distingue explicitamente entre los datos confirmados y los no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 5.058.255.360 (aproximadamente 5B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |
| Modelo base | TimJ3ly/Sylumen-5B |
| Tamano del repositorio | 46,0 GB (todas las cuantizaciones) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura del modelo base TimJ3ly/Sylumen-5B en la documentacion consultada: ni el tipo de red (transformer denso, MoE, hibrida), ni el numero de capas, cabezas de atencion o dimension oculta. Tampoco se documenta la longitud de contexto soportada, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT. El unico dato estructural confirmado es el recuento de parametros (5.058.255.360) y que el checkpoint original es compatible con la libreria transformers.

En cuanto al proceso de cuantizacion, la model card de mradermacher indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) generadas a partir del modelo en precision completa. No hay disponibles cuantizaciones ponderadas ni basadas en matriz de importancia (imatrix) en el momento de publicacion de la ficha, y el autor senala que podrian no llegar a publicarse. El modelo base incorpora las etiquetas tool-use y function-calling, lo que sugiere que fue ajustado especificamente para invocar herramientas, aunque no se detalla la metodologia de ese ajuste.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversational y esta pensado para mantener dialogos multi-turno.
- Llamada a herramientas (tool use): soporta la invocacion de funciones externas, lo que permite conectarlo a APIs, bases de datos o servicios web.
- Function calling: puede generar estructuras de llamada a funciones siguiendo un esquema predefinido, una capacidad clave para pipelines de agentes.
- Razonamiento multi-paso: no documentado explicitamente en la informacion disponible; se desconoce si dispone de modo de pensamiento (thinking mode) o cadena de razonamiento explicita.
- Codigo y matematicas: no documentado en la informacion disponible.
- Vision, audio u otras modalidades: no documentado; el repositorio no incluye fichero mmproj, lo que apunta a que es un modelo exclusivamente de texto.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declara soporte para castellano ni otros idiomas.

## Casos de uso

- Agentes de automatizacion con function calling: el modelo puede decidir que funcion invocar y con que argumentos en entornos como asistentes que consultan calendarios, bases de datos o APIs REST. Su tamano de 5B permite ejecutarlo en la misma maquina que orquesta el agente, sin depender de servicios externos.
- Atencion al cliente automatizada en ingles: gestion de conversaciones multi-turno con contexto moderado en GPUs de consumo. Es adecuado cuando el publico objetivo es angloparlante y se busca coste de inferencia bajo.
- Enrutamiento de peticiones (intent routing): dado su perfil orientado a tool-use, puede clasificar la intencion del usuario y derivar la consulta a la herramienta o al modelo especializado correspondiente dentro de una arquitectura mayor.
- Prototipado rapido en local: con las cuantizaciones Q4_K_S (3,1 GB) o Q4_K_M (3,3 GB) se puede desplegar en un portatil con GPU de gama media para validar prompts, esquemas de herramientas y flujos conversacionales antes de escalar a modelos mayores.
- Procesamiento por lotes en CPU: gracias a las variantes Q2_K y Q3_K, el modelo puede ejecutarse en servidores sin GPU usando llama.cpp, util para tareas de extraccion estructurada o clasificacion a granel donde la latencia no es critica.
- Entornos con requisitos de licencia permisiva: al estar bajo Apache-2.0, puede integrarse en productos comerciales cerrados sin obligacion de liberar el codigo, siempre que se cumplan las condiciones de atribucion correspondientes.
- Educacion e investigacion en cuantizacion: el repositorio ofrece una escalera completa de cuantizaciones (de Q2_K a f16) sobre el mismo modelo, lo que resulta util para estudiar la degradacion de calidad y de perplexidad segun el nivel de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Ni la model card del repositorio GGUF ni la informacion del modelo base incluyen datos de MMLU, HumanEval, GSM8K, BFCL ni de ninguna otra evaluacion estandar, ni comparaciones con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K 2,2 GB; Q3_K_S 2,5 GB; Q3_K_M 2,7 GB; Q3_K_L 2,9 GB; IQ4_XS 3,0 GB; Q4_K_S 3,1 GB; Q4_K_M 3,3 GB; Q5_K_S y Q5_K_M 3,7 GB; Q6_K 4,3 GB; Q8_0 5,5 GB; f16 10,2 GB.
- Margen adicional: hay que sumar la cache KV y el overhead del runtime. Para contexto corto, un margen de 1 a 2 GB sobre el peso del fichero suele ser suficiente; con contextos largos el consumo crece de forma aproximadamente lineal con el numero de tokens almacenados.
- GPUs de consumo compatibles: Q2_K y Q3_K caben en tarjetas de 4 GB (GTX 1650, RX 6400); Q4_K_S y Q4_K_M en 6-8 GB (RTX 3060, RTX 2060, RTX 4060); Q6_K en 8 GB; Q8_0 en 8-10 GB; f16 en 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090).
- GPUs de centro de datos: A100, H100, L40S o similares son viables pero sobredimensionadas para un modelo de 5B; su interes estaria en alto throughput con muchas peticiones concurrentes o en servir la variante f16 sin compresion.
- Ejecucion en CPU: completamente viable con llama.cpp u Ollama. Como referencia de RAM, el tamano del fichero GGUF mas un margen para el contexto; Q4_K_M ronda los 3,3 GB de pesos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (oobabooga), koboldcpp y cualquier runtime compatible con GGUF. Para servir en produccion con batching dinamico, vLLM y TGI requieren conversion desde GGUF a los formatos nativos o bien usar las compilaciones con soporte GGUF, cuya cobertura puede variar.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| Sylumen-5B (via mradermacher GGUF) | ~5,06B | no disponible | Apache-2.0 | en | GGUF (base en safetensors) |
| Qwen2.5-3B-Instruct | ~3,1B | 32.768 tokens (hasta 131.072 con RoPE scaling) | Apache-2.0 (la mayoria de variantes; algunas con licencia propia) | multilingue (29 idiomas) | safetensors, GGUF, AWQ, GPTQ |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 tokens (hasta 131.072 con RoPE scaling) | Apache-2.0 (la mayoria de variantes) | multilingue (29 idiomas) | safetensors, GGUF, AWQ, GPTQ |
| Llama-3.2-3B-Instruct | ~3,2B | 128.000 tokens | Llama 3.2 Community License | multilingue (8 idiomas declarados) | safetensors, GGUF |

Nota: los datos de los modelos de comparacion corresponden a informacion publica ampliamente difundida de sus respectivas model cards. No se dispone de resultados de benchmarks de Sylumen-5B que permitan una comparacion de rendimiento objetiva; la tabla se limita a parametros, contexto, licencia e idiomas. En la categoria de modelos de 3B a 8B con soporte de tool calling, las alternativas mas consolidadas y con ecosistema mas amplio son las familias Qwen2.5 y Llama 3.x, que ademas ofrecen soporte multilingue del que Sylumen-5B carece.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para ingles. Su uso en castellano u otros idiomas no esta garantizado y probablemente produzca resultados degradados.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada de MMLU, HumanEval, GSM8K ni de calidad de function calling (por ejemplo BFCL). No se puede afirmar su rendimiento relativo frente a alternativas de tamano similar.
- Arquitectura y contexto desconocidos: al no documentarse la ventana de contexto ni la arquitectura, planificar aplicaciones que dependan de contexto largo o de un comportamiento atencional concreto es arriesgado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala. Es especialmente critico en tool calling, donde una llamada mal formada o con argumentos inventados puede provocar errores en sistemas downstream. Se recomienda validacion estricta del esquema de las llamadas.
- Sesgos: no hay informacion sobre el dataset de entrenamiento ni sobre procesos de mitigacion de sesgos, por lo que no se puede evaluar su comportamiento en dominios sensibles.
- Modelo derivado y poco documentado: el checkpoint base TimJ3ly/Sylumen-5B tiene un historial de publicacion muy reciente y sin documentacion tecnica detallada. La trazabilidad de los datos de entrenamiento es nula, lo que complica evaluar riesgos de contaminacion o de licencias de datos subyacentes.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K_S implican una degradacion notable de la calidad. La propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas y equilibradas; Q6_K y Q8_0 para maxima fidelidad.
- Cuantizaciones ponderadas no disponibles: no hay variantes con imatrix, lo que en los tamanos bajos (Q2, Q3) suele implicar una perdida de calidad mayor que la de cuantizaciones ponderadas equivalentes.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero conviene verificar que el checkpoint base no arrastre obligaciones adicionales no reflejadas en las etiquetas del repositorio. La licencia Apache-2.0 no incluye garantias ni responsabilidad por parte de los autores.
- Fecha de publicacion: el repositorio figura con fechas de creacion y actualizacion de octubre de 2026, lo que sugiere un proyecto muy reciente y con posible falta de mantenimiento o de soporte posterior.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Sylumen-5B-GGUF
- Modelo base: https://huggingface.co/TimJ3ly/Sylumen-5B
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Sylumen-5B-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Busqueda de modelos de generacion de texto en HuggingFace: https://huggingface.co/models?pipeline_tag=text-generation
