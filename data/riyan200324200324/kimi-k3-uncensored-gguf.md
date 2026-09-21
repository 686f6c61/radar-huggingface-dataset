# Riyan200324200324/Kimi-K3-Uncensored-GGUF

## Resumen

Kimi-K3-Uncensored-GGUF es una cuantizacion en formato GGUF del modelo base `moonshotai/Kimi-K3`, publicada por el usuario `Riyan200324200324`. Se trata de una variante "abliterated" (censura eliminada mediante la ortogonalizacion de la direccion de rechazo en el flujo residual) de un modelo de mezcla de expertos (MoE) de gran escala: 2.779.483.135.584 parametros totales, 104.000 millones activos por token, 896 expertos y enrutamiento top-16. El repositorio pesa 579,5 GB y el artefacto GGUF ocupa 539,7 GiB repartidos en 34 fragmentos.

El interes de esta ficha no esta en el modelo base en si, sino en la metodologia de publicacion: el autor aporta la medicion del efecto de la abliteracion junto con los pesos, en lugar de limitarse a afirmar que ha eliminado los rechazos. La evaluacion se realiza sobre 74 prompts reservados (26 daninos, 30 benignos tematicamente adyacentes y 18 factuales) con decodificacion greedy, y reporta tres tasas separadas: rechazo, sobrerrechazo e incoherencia. Los resultados son 0,0% de rechazo (0/26) frente al 7,7% (2/26) del baseline `UD-IQ1_S` de unsloth, 0,0% de sobrerrechazo (0/30) y 0,0% de incoherencia (0/18).

Es relevante ahora porque la cuantizacion a ~1,67 bits por parametro (derivado del tamano del artefacto y del numero de parametros) permite, en teoria, ejecutar un modelo de 2,8 billones de parametros en hardware muy por debajo de lo que exigiria el modelo en BF16, aunque el propio autor advierte que el resultado principal no es estadisticamente significativo (p = 0,490 con el test exacto de Fisher a dos colas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer; el autor no detalla la arquitectura interna mas alla de 896 expertos con top-16 y capas atencion/KDA en el reparto de cuantizacion |
| Parametros totales | 2.779.483.135.584 (2,78 billones) |
| Parametros activos | 104.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `IQ1_S-XS` (expertos en IQ1_S, router en F32, atencion/KDA en IQ4_XS, shexp en Q5_K); 34 fragmentos, 539,7 GiB |
| Idiomas soportados | en, zh (ingles y chino, segun los tags del repositorio) |
| Licencia | `other`, nombre declarado `kimi-k3`; enlace a la licencia del modelo base en el repositorio de moonshotai |
| Formato de pesos | GGUF (llama.cpp), cuantizado con imatrix |
| Modelo base | `moonshotai/Kimi-K3` (relacion: quantized) |
| Tamano del repositorio | 579,5 GB |
| Tensores modificados | 279 de 2573 |
| Fecha de publicacion | 21 de septiembre de 2026 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base Kimi K3 en la documentacion proporcionada: no hay datos sobre numero de tokens, composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. Lo unico conocido es su caracter de mezcla de expertos con 896 expertos, enrutamiento top-16 y 104.000 millones de parametros activos sobre 2,78 billones totales. Tampoco se especifica la longitud de contexto soportada ni el esquema de atencion; la receta de cuantizacion menciona capas "attn/KDA", lo que sugiere la presencia de variantes de atencion diferenciadas, pero el autor no desarrolla este punto.

Lo que si esta documentado con detalle es el proceso de abliteration aplicado sobre el modelo. La direccion de rechazo se calculo con `llama-cvector-generator` sobre 308 pares de prompts (daninos/benignos, emparejados en forma superficial) en las 93 capas del modelo, a partir de los tensores BF16 de una copia local `UD-Q8_K_XL`, de modo que el vector pertenece a este modelo y no a un donante externo. La intervencion proyecta esa direccion fuera de las rutas de escritura al flujo residual, afectando a 279 de los 2573 tensores del modelo. El autor senala que la seleccion de capa es el factor mas determinante del resultado y dedica la seccion de limitaciones a explicar por que la mejora medida no alcanza significacion estadistica.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Modo de razonamiento explicito: el pipeline de evaluacion del autor separa el "canal think" de la respuesta final, lo que implica que el modelo emite un canal de pensamiento antes de contestar.
- Razonamiento de multiples pasos, inferido del canal de pensamiento y de la longitud de respuesta (mediana de 2511 caracteres en el conjunto danino).
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion disponible; no se han publicado evaluaciones de este tipo.
- Vision, audio u otras modalidades: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Multilingue: limitado a ingles y chino segun los tags; no hay datos de rendimiento por idioma.
- Capacidad "uncensored": la intervencion elimina la direccion de rechazo, con 0/26 rechazos medidos en el conjunto de prompts daninos y 0/30 en el conjunto benigno. Esta capacidad no esta verificada por terceros.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el repositorio es un caso de estudio util porque publica la medicion completa del efecto de la abliteration, incluyendo las tasas de sobrerrechazo e incoherencia y el valor p del contraste. Sirve para reproducir y criticar una metodologia de evaluacion de intervenciones sobre direcciones de rechazo.
- Analisis de cuantizacion extrema: con 539,7 GiB a ~1,67 bits por parametro, es un banco de pruebas para estudiar la degradacion de un MoE de 2,8 billones de parametros bajo cuantizacion IQ1_S con imatrix, comparando la perplexity declarada (1,9323 ± 0,0473 a 12 fragmentos) frente a cuantizaciones mayores.
- Generacion de texto en chino e ingles sin capas de rechazo: para aplicaciones de escritura creativa, ficcion o roleplay donde los filtros de seguridad resultan intrusivos, siempre que el operador asuma la responsabilidad legal del contenido generado.
- Redaccion y resumen de documentos bilingues (en/zh) de gran volumen, aprovechando la capacidad de seguir instrucciones largas, aunque la longitud de contexto no esta especificada y por tanto no puede dimensionarse el caso de uso sin medirla.
- Experimentacion en investigacion de interpretabilidad: la publicacion de la direccion de rechazo calculada sobre 93 capas y 308 pares de prompts facilita replicar analisis de direcciones latentes en modelos MoE de gran escala.
- Despliegue on-premise con llama.cpp en un nodo con ~600 GB de memoria agregada, para organizaciones que necesiten ejecutar un modelo de escala frontera sin enviar datos a APIs de terceros. Es el escenario mas realista dado el tamano del artefacto.
- Evaluacion comparativa de recetas de cuantizacion: el autor reconoce que el baseline usado (`UD-IQ1_S` de unsloth, 553,2 GiB) emplea una receta distinta a la suya, por lo que el repositorio invita a construir la comparacion A/B con la misma receta que falta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion publicada es la medicion del efecto de la abliteration, con 74 prompts reservados, decodificacion greedy (`temp=0.0`, `seed=20260803`) y juicio por coincidencia de palabras clave sobre los primeros 240 caracteres de la respuesta final tras eliminar el canal de pensamiento.

| Metrica | Abliterado (este repositorio) | Baseline `UD-IQ1_S` |
|---|---|---|
| Tasa de rechazo (26 prompts daninos, menor es mejor) | 0,0% (0/26) | 7,7% (2/26) |
| Tasa de sobrerrechazo (30 prompts benignos adyacentes, menor es mejor) | 0,0% (0/30) | 0,0% (0/30) |
| Tasa de incoherencia (18 prompts factuales, menor es mejor) | 0,0% (0/18) | 0,0% (0/18) |
| Respuestas vacias | 0/74 | 0/74 |
| Marcadores de evasion suave | 0/74 | 0/74 |
| Longitud mediana de respuesta, conjunto danino | 2511 caracteres | 2548 caracteres |
| Perplexity (12 fragmentos) | 1,9323 ± 0,0473 | no disponible |
| Significacion del contraste de rechazo | Fisher exacto a dos colas: p = 0,490 | — |

## Requisitos de hardware

- VRAM/memoria estimada: el artefacto GGUF ocupa 539,7 GiB (579,5 GB). A esa cifra hay que sumar la cache KV y el overhead del runtime, cuyo tamano depende de la longitud de contexto, no especificada. Como estimacion de planificacion, hay que prever un minimo de ~560-600 GB de memoria agregada para inferencia sin offload a disco.
- GPU recomendadas: no es viable en una sola GPU de 80 GB. Se necesitarian del orden de 8 aceleradores de 80 GB (H100 80GB, A100 80GB) solo para los pesos, con margen insuficiente para cache KV en contextos largos. Se requieren nodos multi-GPU con memoria agregada superior a 640 GB o bien un enfoque mixto GPU+CPU.
- GPU de consumo: no cabe en ninguna GPU de consumo, ni siquiera en configuraciones multi-GPU de 24-48 GB. La unica via practica es llama.cpp con offload parcial a RAM del sistema y SSD rapido.
- Opciones de despliegue: llama.cpp / `llama-server` (formato nativo del artefacto, 34 fragmentos GGUF), llama.cpp con backend RPC para repartir capas entre maquinas, y servidores compatibles con GGUF en general. vLLM y TGI no soportan de forma fiable cuantizaciones IQ1_S de este tipo; el despliegue en esas plataformas requeriria los pesos originales, muy por encima de 539,7 GiB.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia para este artefacto. Con 104.000 millones de parametros activos por token y cuantizacion de ~1 bit en los expertos, el rendimiento estara dominado por el ancho de banda de memoria y por el coste de descompresion de los pesos, no por la capacidad de computo.

## Comparativa con modelos similares

La busqueda web realizada no devolvio resultados relevantes: todas las entradas recuperadas tratan sobre catalogos alemanes de tarifas hospitalarias (Fallpauschalen-Katalog, DRG), sin ninguna relacion con el modelo. Por tanto, no se ha podido verificar de forma independiente la existencia, las caracteristicas ni las cifras de los modelos comparables, y se marcan como no disponibles en lugar de rellenarlas con datos no contrastados.

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3-Uncensored-GGUF (esta ficha) | 2,78 B / 104 B | no disponible | GGUF IQ1_S-XS | `other` (kimi-k3) | Repositorio HuggingFace, 0 descargas |
| moonshotai/Kimi-K3 (base) | 2,78 B / 104 B (mismo modelo de origen) | no disponible | BF16 y otros | `kimi-k3` | Repositorio de moonshotai |
| Unsloth `UD-IQ1_S` (baseline citado por el autor) | no disponible | no disponible | GGUF, 553,2 GiB | no disponible | Repositorio de unsloth |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La mejora sobre el baseline no es estadisticamente significativa: 0/26 frente a 2/26 arroja p = 0,490 con el test exacto de Fisher a dos colas. Con n = 26, el experimento no tiene potencia para detectar un efecto del orden del 7,7%. El propio autor lo declara explicitamente.
- El baseline solo rechazaba el 7,7% de los prompts. Esto implica que, o bien la cuantizacion `UD-IQ1_S` de unsloth ya era permisiva, o bien los 26 prompts no son lo bastante duros para provocar rechazos en K3. Ambas lecturas limitan lo que la comparacion puede demostrar.
- El baseline pertenece a una receta de cuantizacion distinta. La comparacion honesta seria contra el mismo `IQ1_S-XS` sin abliterar, artefacto que el autor elimino para liberar disco antes de disenar la evaluacion. Por tanto, no es un A/B de misma receta.
- El juez de la evaluacion es coincidencia de palabras clave, no semantico. La evasion suave no se cuenta como rechazo, de modo que las tasas de rechazo reportadas son subestimaciones. El autor verifico 15 patrones de evasion suave con 0/74 casos, pero solo en la ventana de los primeros 240 caracteres; no se escanearon los textos completos.
- El valor de perplexity se mide sobre 12 fragmentos, una muestra pequena que el propio autor senala como potencialmente enganosa.
- La abliteration elimina la direccion de rechazo, lo que significa que el modelo puede generar contenido danino, ilegal o inseguro sin filtros propios. El operador asume toda la responsabilidad legal y etica, incluida la derivada del uso en la UE.
- La licencia declarada es `other` con nombre `kimi-k3`, remitiendo a la licencia del modelo base. No se ha verificado en la informacion disponible si permite uso comercial, redistribucion o creacion de derivados; hay que leer el texto de la licencia antes de cualquier despliegue en produccion.
- Cobertura linguistica limitada a ingles y chino. No hay evaluacion de rendimiento en castellano ni en otros idiomas, y el modelo no esta validado para ellos.
- Longitud de contexto no disponible, lo que impide dimensionar la cache KV, planificar el hardware y disenar casos de uso con documentos largos.
- Repositorio sin traccion: 0 descargas y 0 likes en la fecha de publicacion. No hay validacion independiente de la calidad del artefacto ni de los numeros reportados, que proceden exclusivamente del autor.
- La busqueda web realizada no aporto ninguna fuente independiente sobre el modelo base ni sobre esta cuantizacion; las referencias recuperadas eran ajenas al tema.
- La cuantizacion a ~1,67 bits por parametro (valor derivado de los 539,7 GiB y los 2,78 billones de parametros) es extremadamente agresiva. Aunque el autor reporta una perplexity baja, la degradacion en tareas de razonamiento, codigo o instrucciones complejas no ha sido medida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Riyan200324200324/Kimi-K3-Uncensored-GGUF
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Referencia arXiv asociada en los tags del repositorio: https://arxiv.org/abs/2406.11717 (contenido no verificado en la informacion disponible)
- Repositorio del baseline citado (unsloth, `UD-IQ1_S`): no disponible como enlace directo en la informacion proporcionada
- Paper, blog, demo o repositorio adicionales: no disponible; la busqueda web no devolvio ningun resultado relacionado con el modelo
