# ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF

## Resumen

Qwen3.8-Flash-Next GSQ-RCO Coder es una compresion orientada a capacidades del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por ISTA-DASLab (Instituto de Ciencia y Tecnologia de Austria, grupo de sistemas distribuidos y aprendizaje). Sobre el modelo base, de 176,9B parametros y 354 GB en BF16, se elimina el 50% de los expertos enrutados y se cuantizan los pesos restantes a 3,5 bpw, dando lugar a un artefacto GGUF de 58,4 GB con un conjunto residente en memoria de solo 29,6 GB. El resultado se expresa como 1,89 bits efectivos por parametro del transformer original, cifra que amortiza los expertos eliminados sobre el recuento de parametros de partida y que combina poda y cuantizacion (ningun peso individual se almacena a 1,89 bits).

La arquitectura es un mixture-of-experts (MoE) con 512 expertos por capa en 48 capas y 10 expertos activos por token en el modelo base. La seleccion de expertos no se hace con una heuristica de importancia, sino con RCO, que minimiza la divergencia KL entre el modelo podado y el sin podar sobre datos de calibracion; la cuantizacion emplea GSQ con imatrix. El modelo conserva la pila multimodal original (pipeline image-text-to-text) y esta especializado deliberadamente en codigo, uso agentico de herramientas, vision y razonamiento espacial.

Su relevancia practica es de despliegue: el conjunto de trabajo residente de un modelo de 176,9B parametros cabe en un unico acelerador de 32 GB, porque el shard n-gram es una tabla de consulta que puede servirse desde disco. El coste aceptado es la degradacion fuera del conjunto de capacidades objetivo: para uso generalista el propio autor recomienda las versiones GSQ-RCO sin podar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts (MoE): 512 expertos por capa, 48 capas, 10 expertos activos por token en el modelo base |
| Parametros totales | 116.514.464.640 (recuento indicado por HuggingFace para el repositorio); el modelo base declara 176,9B parametros |
| Parametros activos | No disponible de forma explicita para la version podada; el modelo base activa 10 expertos por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con pesos retenidos a 3,5 bpw (GSQ, mixed-precision) mas poda de expertos del 50%; calibracion con imatrix |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 59,3 GB; artefacto declarado de 58,4 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 176,9B parametros con 512 expertos por capa repartidos en 48 capas y 10 expertos activos por token, lo que concentra la mayor parte del parametraje en los bloques feed-forward de los expertos mientras solo una fraccion se ejecuta en cada token. La compresion combina dos tecnicas complementarias: la poda de expertos, que elimina parametros del modelo y por tanto reduce tamano de fichero y memoria residente, y la cuantizacion, que conserva todos los parametros pero reduce su precision de almacenamiento. Aqui se elimina el 50% de los expertos enrutados y se guardan los pesos supervivientes a 3,5 bpw.

La decision critica es que expertos eliminar. Como los expertos se especializan, su importancia no es una propiedad intrinseca sino relativa a una distribucion de entradas, que aporta el conjunto de calibracion; en consecuencia, la mezcla de calibracion determina que capacidades sobreviven. La seleccion se hizo con RCO (paper arXiv:2605.00649), que optimiza la divergencia KL entre el modelo podado y el sin podar en lugar de ordenar expertos por una puntuacion heuristica. El formato GGUF impone un unico recuento de expertos para todo el modelo, de modo que todas las capas deben retener el mismo numero; RCO trata el conjunto factible como una variedad suave y admite presupuestos simultaneos, imponiendo los presupuestos de forma exacta sin necesidad de padding que anularia el ahorro de memoria. La cuantizacion sigue GSQ (paper arXiv:2604.18556). Se menciona tambien un shard n-gram de precision fija, excluido del calculo de bits efectivos, que puede servirse desde disco.

## Capacidades

- Generacion de codigo y resolucion de problemas de programacion sobre repositorios reales, con rendimiento medido en LiveCodeBench v6 (86,28) y SWE-bench Verified (75,60) a esfuerzo de razonamiento xhigh.
- Uso agentico de herramientas y trayectorias multi-paso extensas, segun la descripcion del autor ("agentic tool use"); es precisamente una de las capacidades hacia las que se dirigio la seleccion de expertos.
- Capacidad multimodal conservada: el pipeline es image-text-to-text, con entrada de imagen y texto.
- Razonamiento espacial, indicado explicitamente entre los dominios objetivo de la poda.
- Razonamiento con esfuerzo configurable: los resultados publicados se midieron a xhigh reasoning effort, lo que implica modos de razonamiento (thinking) segun la convencion de la familia Qwen3.
- Conversacion multi-turno (tag conversational) y compatibilidad con endpoints (tag endpoints_compatible).
- Soporte multilingue: no disponible.

## Casos de uso

- Agente de resolucion de incidencias sobre repositorios: el modelo esta optimizado para trayectorias largas de herramienta sobre codigo real, con un 91,3% del SWE-bench Verified del base, lo que permite integraciones de tipo "issue to patch" con supervision humana.
- Autocompletado y generacion de codigo en el IDE: la retencion del 98,7% en LiveCodeBench v6 respecto al base indica que la generacion de problemas de codigo aislados apenas se degrada, y los 29,6 GB residentes permiten servirlo en una estacion de trabajo con una GPU de 32 GB.
- Revision de codigo automatizada en CI/CD: el modelo puede invocarse como paso de pipeline mediante el tag endpoints_compatible, analizando diffs y emitiendo comentarios estructurados.
- Automatizacion de tareas GUI o de documentos con imagen: al conservar la pila image-text-to-text y el razonamiento espacial, encaja en flujos que requieren interpretar capturas o diagramas y actuar en consecuencia.
- Generacion de tests y migraciones de codigo: tareas de un solo paso con contexto de repositorio, donde el coste de la poda es menor que en tareas multi-turno sostenidas.
- Despliegue en hardware limitado para equipos de investigacion: con 29,6 GB de conjunto residente y el shard n-gram en disco, es viable experimentar con un MoE de 176,9B parametros sin un nodo multi-GPU.
- Uso generalista (chat, redaccion, conocimiento abierto): no es el caso de uso recomendado; el autor remite a las versiones GSQ-RCO sin podar para estas tareas.

## Benchmarks y rendimiento

| Modelo | SWE-bench Verified | LiveCodeBench v6 |
|---|---|---|
| Base BF16 (354 GB) | 82,80 | 87,43 |
| GSQ-RCO Coder (58,4 GB) | 75,60 | 86,28 |
| Retencion respecto al base | 91,3% | 98,7% |

Todas las cifras se midieron a xhigh reasoning effort. La diferencia entre ambas metricas es coherente, segun el autor, con que las tareas multi-paso sostenidas acumulan error turno a turno y toleran peor la reduccion de capacidad que la generacion de codigo de un solo problema. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Conjunto residente declarado: 29,6 GB, que segun el autor cabe en un unico acelerador de 32 GB. El shard n-gram, al ser una tabla de consulta, puede servirse desde disco.
- Tamano en disco: 58,4 GB para el artefacto declarado; 59,3 GB de repositorio.
- Comparativa de referencia: 354 GB en BF16 para el modelo base, frente a los 58,4 GB de esta version.
- GPU: cualquier acelerador con al menos 32 GB de memoria (por ejemplo, tarjetas profesionales de 32 GB o superiores y las de 40/48/80 GB de generaciones recientes). No obstante, la informacion proporcionada no nombra modelos concretos de GPU, por lo que la asignacion a RTX 4090 (24 GB) queda descartada por memoria y no se confirma ningun modelo especifico.
- VRAM estimada: 29,6 GB para pesos residentes, mas el coste adicional de cache KV y de estados de activacion, que no esta cuantificado en la informacion disponible.
- Opciones de despliegue: formato GGUF, lo que apunta a lectores de llama.cpp/Ollama; existe el tag endpoints_compatible. No se confirma soporte de vLLM, TGI ni de otros motores en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Huella en disco | Contexto | SWE-bench Verified | LiveCodeBench v6 | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next GSQ-RCO Coder | 116,5B en el repositorio (base de 176,9B) | 58,4 GB | No disponible | 75,60 | 86,28 | Apache 2.0 |
| Qwen3.8-Flash-Next BF16 (base) | 176,9B | 354 GB | No disponible | 82,80 | 87,43 | Apache 2.0 (segun modelo base) |
| Qwen3.8-Flash-Next GSQ-RCO sin podar | No disponible | No disponible | No disponible | No disponible | No disponible | Apache 2.0 |

No se dispone de informacion sobre otros modelos comparables de terceros en la documentacion facilitada.

## Limitaciones y advertencias

- La poda del 50% de los expertos reduce capacidades por diseno. El autor acepta explicitamente la degradacion fuera de codigo, uso agentico, vision y razonamiento espacial, y recomienda las versiones sin podar para uso general.
- La mezcla de calibracion determina que capacidades sobreviven; cualquier dominio poco representado en ella puede degradarse de forma no medida. El autor solicita retroalimentacion precisamente sobre capacidades no representadas.
- Las tareas multi-paso sostenidas son las mas afectadas: SWE-bench Verified retiene un 91,3% frente al 98,7% de LiveCodeBench v6, lo que sugiere acumulacion de error en trayectorias largas.
- Es una release experimental declarada como tal.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Dado que se trata de una compresion agresiva, debe validarse empiricamente antes de produccion.
- Idiomas soportados y longitud de contexto: no disponibles; no es posible garantizar cobertura multilingue ni planificar despliegues con contexto largo sobre estos datos.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.8-Flash-Next, que deben verificarse por separado.
- La cifra de 1,89 bits por parametro es una tasa efectiva que amortiza los expertos eliminados; ningun peso individual se almacena a esa precision. No debe interpretarse como una cuantizacion de 1,89 bits.
- Compatibilidad de motores de inferencia no confirmada para un MoE de 512 expertos con pila multimodal.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Versiones GSQ-RCO sin podar: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Paper de GSQ: https://arxiv.org/abs/2604.18556
- Paper de RCO: https://arxiv.org/abs/2605.00649
- Codigo de GSQ: https://github.com/IST-DASLab/GSQ
- Codigo de RCO: https://github.com/IST-DASLab/RCO
- Organizacion IST-DASLab en GitHub: https://github.com/IST-DASLab

Nota: las busquedas web realizadas no han devuelto ningun resultado relevante sobre este modelo (los resultados corresponden a una empresa de servicios energeticos ajena al proyecto y a plataformas no relacionadas).
