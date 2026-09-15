# ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-GGUF es un repositorio de cuantizaciones GGUF de precision mixta no uniforme del modelo Qwen/Qwen3.8-Flash-Next, publicado por el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria (ISTA). No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos comprimidos: cada tensor del transformer recibe un tipo de cuantizacion distinto, asignado mediante una busqueda basada en gradientes que reparte la precision segun la sensibilidad de cada tensor sujeto a un presupuesto de tamano total. El resultado son ficheros GGUF estandar que se ejecutan sin modificaciones en llama.cpp, Ollama y LM Studio.

El modelo base es un MoE disperso de 176.943.899.520 parametros (unos 176,9 B), con 512 expertos enrutados por capa a lo largo de 48 capas, de los que 10 se activan por token. Incluye un proyector de vision en BF16 (0,91 GB) que habilita el uso multimodal (image-text-to-text). El repositorio ofrece tres variantes: Q2_0 (2,40 bpw, 66,4 GB), IQ2_XS (2,50 bpw, 68,0 GB) e IQ3_XXS (3,00 bpw, 75,8 GB), todas divididas en dos shards, donde el segundo shard es una tabla de embeddings n-gram por capa de 51,2 B de parametros cuantizada a IQ4_NL de forma fija.

Su relevancia actual es doble. Por un lado, permite ejecutar un MoE multimodal de casi 177 B de parametros en hardware muy por debajo de lo que exigiria el modelo en BF16. Por otro, es una demostracion practica de dos tecnicas de cuantizacion post-entrenamiento, GSQ (arXiv:2604.18556) y RCO (arXiv:2605.00649), aplicadas a un modelo de produccion. La variante Q2_0 prioriza el rendimiento (3,4x el throughput de prompt y 1,9x menos latencia extremo a extremo que IQ2_XS) e IQ3_XXS es la recomendada por el autor, ya que iguala al modelo base en AIME25.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa con proyector de vision; 48 capas, 512 expertos enrutados por capa, 10 activos por token |
| Parametros totales | 176.943.899.520 (~176,9 B) |
| Parametros activos | no disponible como cifra exacta; se activan 10 de 512 expertos por capa y token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de precision mixta no uniforme por tensor: Q2_0 (2,40 bpw), IQ2_XS (2,50 bpw), IQ3_XXS (3,00 bpw); tabla n-gram en IQ4_NL (4,5 bpw) fija en todas las variantes; mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, con cada modelo dividido en dos shards |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos dispersa. Cada una de las 48 capas contiene 512 expertos enrutados, de los que 10 se activan por token, lo que da un ratio de esparsidad muy alto y explica que el coste computacional por token sea muy inferior al que sugeriria el recuento total de parametros. Las matrices de expertos concentran aproximadamente el 95% de los pesos susceptibles de cuantizacion, por lo que tambien dominan el presupuesto de tamano. Adicionalmente, el modelo incorpora una tabla de embeddings n-gram por capa (`per_layer_token_embd`) de 51,2 B de parametros; al tratarse de una tabla de busqueda y no de un peso de multiplicacion matricial, se mantiene a 4,5 bpw (IQ4_NL) de forma fija en todas las variantes y queda excluida de la busqueda de precision.

Este repositorio no entrena el modelo: solo lo cuantiza. El proceso combina dos metodos desarrollados en DASLab. GSQ (Gumbel-Softmax Quantization) es una cuantizacion escalar post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajacion Gumbel-Softmax; segun el autor, cierra buena parte de la brecha entre cuantizacion escalar y vectorial en regimenes de 2 a 3 bits, manteniendose desplegable en formatos escalares estandar como GGUF. RCO (Riemannian Constrained Optimization) resuelve la asignacion de uno de K tipos de cuantizacion a cada uno de los N tensores bajo un presupuesto de tamano total: reformula la restriccion de presupuesto como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar directamente sobre la perdida de tarea imponiendo el presupuesto de forma exacta y sin hiperparametros especificos de la restriccion. En este modelo, la asignacion se hace por capa en el caso de los expertos, no por experto, porque GGUF no puede expresar esa granularidad.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `image-text-to-text` confirman el uso como modelo de chat.
- Vision e imagen-texto: incluye un proyector de vision (`mmproj`) en BF16 de 0,91 GB, lo que permite entrada de imagenes junto a texto.
- Razonamiento matematico: el autor indica que la variante IQ3_XXS iguala al modelo base en AIME25, un benchmark de competicion matematica.
- Compresion extrema con calidad preservada: el task average de las variantes de 2 bits se situa en 89,07 (Q2_0) y 89,16 (IQ2_XS) puntos.
- Throughput de prompt elevado: Q2_0 ofrece 3,4x el throughput de prompt de IQ2_XS y 1,9x menos latencia extremo a extremo, con una tasa de decodificacion estable independiente del contenido.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a traves de endpoints compatibles con las interfaces habituales.
- Tool calling / function calling: no se documenta explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no se documenta explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.

## Casos de uso

- Asistente multimodal autoalojado en un solo nodo: con 66,4 GB (Q2_0) o 75,8 GB (IQ3_XXS) de pesos mas 0,91 GB de proyector de vision, el modelo cabe en servidores con una o dos GPU de 80 GB, lo que permite ofrecer chat con imagenes sin depender de APIs externas.
- Analisis de documentos escaneados: el proyector de vision permite pasar facturas, formularios o capturas y obtener texto estructurado o respuestas sobre su contenido, manteniendo los datos dentro de la infraestructura propia.
- Etiquetado y clasificacion de imagenes a gran escala: la variante Q2_0 esta optimizada para throughput de prompt (3,4x respecto a IQ2_XS) y su tasa de decodificacion no varia con el contenido, lo que la hace adecuada para pipelines por lotes donde el coste por item es el factor limitante.
- Razonamiento matematico y asistencia tecnica: IQ3_XXS iguala al modelo base en AIME25, por lo que es la variante indicada para tareas que requieren precision aritmetica y de razonamiento, como tutoria o verificacion de calculos.
- Servicio de chat con latencia critica: Q2_0 reduce la latencia extremo a extremo a 1,9x menos que IQ2_XS, lo que resulta util en aplicaciones interactivas donde el tiempo hasta el primer token condiciona la experiencia.
- Reproduccion de investigacion en cuantizacion: los ficheros permiten medir el efecto de GSQ y RCO frente a cuantizacion uniforme del mismo tamano, usando el task average publicado (89,07 / 89,16) como linea base.
- Despliegue en equipos de desarrollo con GPU de consumo mediante offload parcial: con 24 o 32 GB de VRAM no es posible descargar el modelo completo, pero llama.cpp, Ollama y LM Studio permiten repartir capas entre GPU y CPU, habilitando pruebas funcionales y prototipado local.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible son el task average por variante y las cifras relativas de throughput. No se han publicado resultados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, salvo la mencion cualitativa a AIME25.

| Variante | bpw medio | Tamano total | Task average | Notas de rendimiento |
|---|---|---|---|---|
| Q2_0 | 2,40 | 66,4 GB | 89,07 | 3,4x throughput de prompt y 1,9x menos latencia que IQ2_XS; decodificacion estable |
| IQ2_XS | 2,50 | 68,0 GB | 89,16 | La mas pequena a igual calidad |
| IQ3_XXS | 3,00 | 75,8 GB | no disponible (3,5 puntos por encima de Q2_0) | Recomendada; iguala al modelo base en AIME25 |
| mmproj BF16 | 16 | 0,91 GB | no aplica | Codificador de vision y proyector, comun a todas las variantes |

## Requisitos de hardware

- VRAM minima teorica igual al tamano de los pesos: 66,4 GB (Q2_0), 68,0 GB (IQ2_XS) o 75,8 GB (IQ3_XXS), mas 0,91 GB del proyector de vision si se usa el modo multimodal.
- A esa cifra hay que sumar la cache KV y las activaciones, cuyo tamano depende de la longitud de contexto, que no esta disponible en la informacion proporcionada.
- GPU recomendadas para descarga completa: A100 80 GB o H100 80 GB, en configuracion de una sola unidad para Q2_0 e IQ2_XS en funcion del contexto, o de dos unidades en configuraciones multi-GPU para mayor margen.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB). Es posible ejecutarlo con offload parcial de capas a CPU y RAM mediante llama.cpp, con penalizacion de latencia.
- El segundo shard (tabla n-gram, 28,8 GB) es identico en las tres variantes y debe estar disponible en memoria o en almacenamiento rapido durante la inferencia.
- Opciones de despliegue confirmadas por el autor: llama.cpp, Ollama y LM Studio, sin modificaciones sobre el GGUF estandar.
- vLLM, TGI y otros servidores orientados a safetensors no estan confirmados para estos ficheros GGUF en la informacion disponible.
- Latencia y throughput absolutos: no disponibles. Solo se publican cifras relativas entre variantes.

## Comparativa con modelos similares

La comparacion mas directa es entre las tres variantes del propio repositorio y frente al modelo base sin cuantizar.

| Modelo | Parametros | bpw / precision | Tamano | Task average | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base, BF16) | 176,9 B | 16 | no disponible | no disponible | Apache 2.0 |
| Qwen3.8-Flash-Next GSQ-RCO Q2_0 | 176,9 B | 2,40 | 66,4 GB | 89,07 | Apache 2.0 |
| Qwen3.8-Flash-Next GSQ-RCO IQ2_XS | 176,9 B | 2,50 | 68,0 GB | 89,16 | Apache 2.0 |
| Qwen3.8-Flash-Next GSQ-RCO IQ3_XXS | 176,9 B | 3,00 | 75,8 GB | no disponible | Apache 2.0 |

No se dispone de datos sobre otras cuantizaciones del mismo modelo base (por ejemplo, builds uniformes de terceros) ni sobre modelos alternativos de tamano comparable con los que contrastar rendimiento, contexto o licencia. La busqueda web realizada no devolvio resultados relevantes: los enlaces obtenidos corresponden a la empresa de contabilidad energetica ista y al software de diagnostico BMW ISTA, sin relacion con este modelo.

## Limitaciones y advertencias

- El repositorio contiene unicamente pesos cuantizados; no aporta informacion sobre el dataset de entrenamiento del modelo base, por lo que los sesgos heredados no estan documentados aqui.
- Riesgo de alucinacion inherente a los modelos generativos; no se publican evaluaciones de veracidad ni de tasa de alucinacion.
- Las variantes de 2 bits pierden calidad de forma medible: Q2_0 se situa 3,5 puntos de task average por debajo de IQ3_XXS. Para tareas sensibles a la precision, IQ3_XXS es la opcion recomendada por el propio autor.
- La asignacion de precision se realiza por capa y no por experto, porque GGUF no puede expresar granularidad por experto; esto limita el optimo alcanzable dentro del presupuesto de tamano.
- La tabla n-gram de 51,2 B de parametros se mantiene a un 4,5 bpw fijo y queda excluida de la busqueda de precision, por lo que representa un 28,8 GB constante que no se puede comprimir mas con este metodo.
- Longitud de contexto e idiomas soportados no estan declarados; no debe asumirse ninguna capacidad multilingue ni de contexto largo sin verificacion empirica.
- El modelo base pertenece a la familia Qwen y el prefijo de version (3.8) no coincide con nomenclaturas publicas conocidas; conviene verificar la ficha del modelo base antes de integrarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al artefacto publicado; deben respetarse las condiciones del modelo base Qwen/Qwen3.8-Flash-Next.
- El repositorio tiene 0 descargas y 15 likes en el momento de la consulta, con creacion el 7 de septiembre de 2026 y ultima actualizacion el 15 de septiembre de 2026: es un artefacto reciente y con poca validacion externa.
- La model card consultada esta truncada, por lo que podria existir informacion adicional no reflejada en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper de GSQ: https://arxiv.org/abs/2604.18556
- Paper de RCO: https://arxiv.org/abs/2605.00649
- Codigo de GSQ: https://github.com/IST-DASLab/GSQ
- Codigo de RCO: https://github.com/IST-DASLab/RCO
- Organizacion DASLab en GitHub: https://github.com/IST-DASLab
- Banner del repositorio: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF/resolve/main/assets/banner.png
- Grafica de task average frente a bit-width: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF/resolve/main/assets/plots/Qwen3.8-Flash-Next-task_avg_vs_avg_bit_width.png

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a dominios ajenos (ista.com, portales de contabilidad energetica y foros sobre el software de diagnostico BMW ISTA+).
