# jkim96/Qwen3.5-4B-DASHQ-Q2-GGUF

## Resumen

Qwen3.5-4B-DASHQ-Q2-GGUF es un conjunto de ficheros GGUF cuantizados en el rango de 2 bits del modelo base Qwen/Qwen3.5-4B, publicado por el usuario jkim96. La cuantizacion se ha realizado con DASH-Q, una herramienta propia del autor (repositorio JaeminK/dashq), y emplea exclusivamente tipos de tensor estandar de llama.cpp, de modo que los ficheros cargan en cualquier build reciente de llama.cpp sin necesidad de parches. El modelo base tiene 4.205.751.296 parametros (aproximadamente 4,2 mil millones).

El problema que resuelve es el de ejecutar un modelo de ~4B con una huella de memoria muy reducida: los cuatro ficheros publicados ocupan entre 1,44 GB y 1,75 GB, con ratios de 2,66 a 3,22 bits por peso. Segun los datos de la model card, DASH-Q logra perplejidades inferiores a las de las cuantizaciones equivalentes de llama.cpp y de Unsloth en los mismos tipos, manteniendo ademas un tamano de fichero menor.

La relevancia actual viene de la combinacion de licencia Apache 2.0 (heredada del modelo base), compatibilidad con el ecosistema llama.cpp y tamanos que caben en GPUs de consumo e incluso en entornos de CPU. Es una publicacion reciente (creada el 5 de octubre de 2026) y sin descargas ni likes registrados en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS, IQ2_XS, IQ2_M, Q2_K_XL |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Ficheros incluidos en el repositorio:

| Fichero | Tipo | Tamano | Bits / peso |
|---|---|---|---|
| Qwen3.5-4B-DASHQ-IQ2_XXS.gguf | IQ2_XXS | 1,44 GB | 2,66 |
| Qwen3.5-4B-DASHQ-IQ2_XS.gguf | IQ2_XS | 1,57 GB | 2,90 |
| Qwen3.5-4B-DASHQ-IQ2_M.gguf | IQ2_M | 1,65 GB | 3,04 |
| Qwen3.5-4B-DASHQ-Q2_K_XL.gguf | Q2_K_XL | 1,75 GB | 3,22 |

El tamano total del repositorio es de 6,4 GB. La model card indica que la cuantizacion es solo de texto: la torre de vision no esta incluida.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Qwen/Qwen3.5-4B en los datos proporcionados (no se detalla si es transformer denso, MoE o hibrido, ni el numero de capas, dimensiones de atencion o tipo de atencion). Lo unico confirmado es el recuento de parametros totales (4.205.751.296) y que se trata de un modelo de generacion de texto.

Respecto al proceso de cuantizacion, DASH-Q genera ficheros GGUF usando unicamente tipos de tensor estandar de llama.cpp, sin ningun tensor por encima de 4 bits, y utiliza imatrix (segun la etiqueta del repositorio). No hay informacion sobre los datos de calibracion empleados, el numero de tokens del dataset de calibracion ni sobre procesos de RLHF/DPO, dado que esta ficha describe una cuantizacion y no un entrenamiento. El autor no documenta innovaciones de decodificacion ni cambios en el grafo de atencion.

## Capacidades

- Generacion de texto conversacional: la etiqueta del repositorio incluye `conversational` y el pipeline declarado es `text-generation`.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, lo que indica que puede servirse mediante endpoints de inferencia estandar.
- Cuantizacion de solo texto: la model card especifica explicitamente que la torre de vision no esta incluida, por lo que no hay capacidades multimodales en estos ficheros aunque el modelo base pudiera tenerlas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas en la ficha de HuggingFace ni en la model card.
- Capacidades especiales (modo thinking, audio, vision): no disponible, salvo la mencion de que la parte de vision queda excluida de la cuantizacion.

## Casos de uso

- Inferencia en hardware de gama baja: los ficheros de 1,44 GB a 1,75 GB permiten ejecutar un modelo de ~4B en portatiles sin GPU dedicada o en mini-PC, usando llama.cpp con `-ngl 0` o desviando parcialmente capas a GPU.
- Despliegue en el borde (edge): un fichero IQ2_XXS de 1,44 GB cabe en dispositivos con poca RAM o almacenamiento limitado, lo que habilita asistentes locales sin conexion.
- Prototipado rapido de aplicaciones de chat: con `llama-cli -m <fichero> -ngl 99 -c 8192` se puede levantar un servidor conversacional en minutos para validar flujos de producto antes de invertir en hardware mayor.
- Ejecucion en CPU en entornos de CI: la ausencia de dependencias exotizas (solo tipos estandar de llama.cpp) facilita integraciones en pipelines que no disponen de GPU.
- Escenarios con presupuesto de VRAM muy ajustado: en GPUs de 4-8 GB, el fichero Q2_K_XL (1,75 GB) deja margen para cache KV y contexto adicional, a diferencia de una cuantizacion de 4 bits o superior.
- Comparacion de metodologias de cuantizacion: el repositorio sirve como material de referencia para evaluar DASH-Q frente a las cuantizaciones IQ2 de llama.cpp y las UD de Unsloth sobre el mismo modelo base, usando las metricas de perplejidad publicadas.
- Aplicaciones sensibles al ancho de banda de descarga: ficheros por debajo de 2 GB reducen el tiempo de distribucion del modelo a clientes finales frente a alternativas Q4 o superiores.

## Benchmarks y rendimiento

Solo se han publicado metricas de perplejidad (menor es mejor), medidas con `llama-perplexity`, contexto 2048, sobre WikiText-2 test y C4 validation (256 secuencias x 2048 tokens).

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 1,61 GB | 14,21 | 21,39 |
| IQ2_XXS | unsloth UD-IQ2_XXS | 1,52 GB | 13,28 | 19,75 |
| IQ2_XXS | DASH-Q IQ2_XXS | 1,44 GB | 11,31 | 17,10 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 1,70 GB | 11,96 | 18,09 |
| IQ2_XS | DASH-Q IQ2_XS | 1,57 GB | 10,16 | 15,14 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 1,81 GB | 10,11 | 15,72 |
| IQ2_M | unsloth UD-IQ2_M | 1,76 GB | 10,38 | 15,12 |
| IQ2_M | DASH-Q IQ2_M | 1,65 GB | 9,62 | 14,31 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 1,98 GB | 10,36 | 15,80 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 1,94 GB | 10,12 | 14,83 |
| Q2_K_XL | DASH-Q Q2_K_XL | 1,75 GB | 9,59 | 14,18 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,44 GB (IQ2_XXS), 1,57 GB (IQ2_XS), 1,65 GB (IQ2_M) y 1,75 GB (Q2_K_XL) solo para los tensores del modelo; hay que sumar el consumo de la cache KV, que crece con el contexto configurado.
- GPUs recomendadas: no especificadas por el autor. Dado el tamano, cualquier GPU consumer moderna con 4 GB o mas de VRAM (por ejemplo, gamas RTX xx50/xx60 recientes) deberia poder alojar los pesos, aunque no hay cifras oficiales de rendimiento.
- ¿Cabe en GPU de consumo? Si, los cuatro ficheros caben en GPUs de consumo con 4 GB o mas de VRAM para los pesos; el margen efectivo depende del contexto y del backend.
- Opciones de despliegue: llama.cpp (el autor documenta `llama-cli -m <fichero> -ngl 99 -c 8192`) y, por extension de compatibilidad GGUF, servidores que consumen este formato. No se mencionan vLLM, TGI, Ollama ni otros motores en la informacion proporcionada.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

La comparacion directa disponible es contra las cuantizaciones del mismo modelo base Qwen/Qwen3.5-4B producidas por otras herramientas.

| Cuantizacion | Herramienta | Tamano (IQ2_XXS) | Perplejidad WikiText-2 (IQ2_XXS) |
|---|---|---|---|
| DASH-Q IQ2_XXS | DASH-Q | 1,44 GB | 11,31 |
| llama.cpp IQ2_XXS (imatrix) | llama.cpp | 1,61 GB | 14,21 |
| unsloth UD-IQ2_XXS | Unsloth | 1,52 GB | 13,28 |

| Cuantizacion | Herramienta | Tamano (Q2_K_XL) | Perplejidad WikiText-2 (Q2_K_XL) |
|---|---|---|---|
| DASH-Q Q2_K_XL | DASH-Q | 1,75 GB | 9,59 |
| llama.cpp Q2_K (imatrix) | llama.cpp | 1,98 GB | 10,36 |
| unsloth UD-Q2_K_XL | Unsloth | 1,94 GB | 10,12 |

En los tres tipos comparados (IQ2_XXS, IQ2_M, Q2_K_XL), DASH-Q obtiene perplejidad mas baja con un tamano de fichero menor que las alternativas listadas. No hay comparativa con otros modelos base de ~4B porque la informacion proporcionada solo cubre variantes del mismo Qwen3.5-4B.

## Limitaciones y advertencias

- No hay informacion sobre sesgos del modelo base ni sobre sesgos introducidos por la cuantizacion.
- La cuantizacion a 2 bits (2,66 a 3,22 bits por peso) degrada inherentemente la calidad respecto al modelo original; las perplejidades publicadas (9,59 en el mejor caso sobre WikiText-2) son considerablemente altas en terminos absolutos, aunque comparativamente mejores que las alternativas del mismo rango.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; cabe esperar que aumente con la agresividad de la cuantizacion, aunque no hay datos que lo confirmen.
- La torre de vision no esta incluida, por lo que no se pueden usar capacidades de imagen aunque el modelo base las tuviera.
- Idiomas soportados: sin declarar. No se puede garantizar un comportamiento multilingue adecuado sin datos.
- Licencia Apache 2.0, heredada del modelo base, sin restricciones adicionales indicadas por el autor mas alla de las del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validacion de la comunidad ni evidencia de uso en produccion.
- La model card esta enfocada a la comparativa de perplejidad; no documenta comportamiento en tareas, tool calling, contexto largo ni estabilidad en generacion larga.
- Para produccion conviene validar la calidad del fichero IQ2_XXS antes de desplegarlo, dado que la perdida de precision en 2 bits puede afectar a tareas de razonamiento o codigo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jkim96/Qwen3.5-4B-DASHQ-Q2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de DASH-Q: https://github.com/JaeminK/dashq
- Banner de DASH-Q: https://raw.githubusercontent.com/JaeminK/dashq/main/assets/dashq_banner.png
