# dudeman2512/Muse-Glimmer-30B-abliterated

## Resumen

Muse-Glimmer-30B-abliterated es una version editada de dudeman2512/Muse-Glimmer-30B, un modelo multimodal de tipo image-text-to-text con 29.776.626.688 parametros (29,78 B) y pesos en BF16 repartidos en 13 shards safetensors que suman 59,55 GB. Lo publica el usuario dudeman2512 en HuggingFace y su unica diferencia respecto al modelo base es la eliminacion de la direccion de rechazo del flujo residual, un procedimiento conocido como abliteration y ejecutado con la herramienta Heretic.

La relevancia de esta ficha no esta en una mejora de capacidades, sino en lo contrario: se trata de un checkpoint al que se le ha sustraido el comportamiento de negativa. Segun los datos del autor, los rechazos pasan de 2.348 sobre 7.011 prompts considerados daninos (33,49 %) en el modelo original a 88 sobre los mismos 7.011 (1,26 %) en la version abliterada, es decir, una reduccion del 96,3 %, con una divergencia KL de 0,2241 frente al original medida sobre 12.000 prompts que el modelo nunca habria rechazado.

Es, por tanto, material de investigacion sobre alineacion, edicion de pesos y evaluacion de guardrails, no un modelo pensado para despliegue directo al publico. El autor lo advierte explicitamente: cualquier proteccion necesaria debe implementarse en la capa de aplicacion. El repositorio acumula 23 descargas y 0 likes en el momento de redactar esta ficha, con fecha de creacion 2026-08-23 y ultima actualizacion 2026-10-06.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text); tipo de modelo declarado como muse_glimmer; el autor no detalla numero de capas ni mecanismo de atencion |
| Parametros totales | 29.776.626.688 (29,78 B), dato real leido de safetensors |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el autor solo publica pesos BF16. No hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible (el repositorio no declara lista de idiomas) |
| Licencia | muse-glimmer (campo license: other, con archivo LICENSE en el repositorio) |
| Formato de pesos | safetensors (BF16, 13 shards, 59,55 GB) |
| Modelo base | dudeman2512/Muse-Glimmer-30B |
| Metodo de edicion | Abliteration con Heretic; edicion directa del checkpoint, sin gradientes ni datos de entrenamiento |
| Modalidad de entrada | Texto e imagen |
| Libreria | transformers |
| Compatibilidad | endpoints_compatible; el autor documenta despliegue con vLLM |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base: no se detalla el numero de capas, el tipo de atencion, la posicion de las capas normalizadoras ni el vocabulario. Lo que si puede inferirse de los parametros de ablacion publicados es que se trata de una pila transformer con, al menos, bloques que contienen attn.o_proj y mlp.down_proj, y que la ablacion alcanza la posicion 37,196841 en attn.o_proj y 33,810336 en mlp.down_proj, lo que sugiere una pila de unas 38 capas o mas. Esta deduccion es una inferencia a partir de los hiperparametros de la edicion, no un dato confirmado por el autor, y debe tratarse como tal. La etiqueta image-text-to-text indica que el modelo procesa imagenes ademas de texto, aunque no se documenta el codificador visual empleado.

Sobre el entrenamiento del modelo base no hay ningun dato en la informacion proporcionada: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF, DPO o alguna fase de ajuste por preferencias. Lo que si describe el autor con detalle es el proceso de edicion, que no es entrenamiento. Heretic identifica la direccion del flujo residual asociada a rechazar una peticion y resta esa componente de los pesos. No hay pasos de gradiente ni datos de entrenamiento implicados. La configuracion ganadora se eligio por busqueda en dos etapas: 120 pruebas evaluadas contra una submuestra fija de 1.000 prompts con tres workers compartiendo un unico estudio de Optuna, y despues los 15 mejores candidatos remedidos contra los conjuntos completos de 7.011 prompts daninos y 12.000 no daninos. El autor documenta que la segunda etapa no fue un tramite: el recuento de rechazos es un recuento de eventos raros y la estimacion sobre 1.000 prompts es ruidosa, hasta el punto de que candidatos clasificados 23 contra 34 en la primera etapa pasaron a 261 contra 259 en la medicion completa, una inversion real del orden. La divergencia KL, al ser un estadistico suave, se reprodujo casi exactamente en ambos tamanos de muestra. La configuracion ganadora elimino tres veces mas rechazos que la segunda clasificada causando menos dano (KL 0,224 frente a 0,334), de modo que no es simplemente el ajuste mas agresivo disponible. Los parametros finales son: max_weight 1,478300 y 1,411696, max_weight_position 37,196841 y 33,810336, min_weight 1,411191 y 1,407139, y min_weight_distance 29,973070 y 25,019048 para attn.o_proj y mlp.down_proj respectivamente, con direccion de ambito global e indice de direccion 36,589359. El autor senala que min_weight es casi igual a max_weight en ambos componentes, lo que indica un corte practicamente uniforme en las capas afectadas en lugar de un pico estrecho.

## Capacidades

- Generacion de texto conversacional: la etiqueta conversational y el pipeline declarado indican uso de chat multi-turno, aunque no se documentan plantillas de prompt ni formato de mensajes.
- Procesamiento de imagen y texto: el pipeline image-text-to-text implica que el modelo acepta imagenes como entrada junto a texto, si bien no se detalla que tareas concretas de vision estan soportadas ni con que resolucion.
- Comportamiento sin rechazos: la eliminacion de la direccion de rechazo reduce las negativas del 33,49 % al 1,26 % sobre el conjunto de 7.011 prompts daninos empleado en la evaluacion del autor.
- Soporte de tool calling / function calling: no disponible; no se menciona en la model card ni en las etiquetas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningun modo de razonamiento extendido ni capacidades agenticas.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas soportados.
- Capacidades especiales: no se documenta modo thinking, entrada de audio ni decodificacion especulativa.
- Integridad del checkpoint: el autor verifico antes de publicar que hay 13 shards en el indice y 13 en disco, sin shards ausentes ni huerfanos, con el tamano declarado coincidiendo exactamente con los bytes en disco y con la cabecera safetensors de cada shard parseando precisamente los nombres de tensor que declara su entrada de indice.

## Casos de uso

- Investigacion sobre mecanismos de rechazo: el modelo permite comparar directamente, con el mismo prompt y el mismo checkpoint base, que cambia en la distribucion de salida cuando se sustrae una direccion del flujo residual. La metrica de KL 0,2241 sobre 12.000 prompts no daninos ofrece una referencia cuantitativa del coste colateral de la edicion.
- Red teaming de guardrails de aplicacion: dado que el modelo apenas rechaza (1,26 % sobre el conjunto de prueba del autor), resulta util para comprobar si los filtros de entrada y salida de una aplicacion aguantan por si solos, sin apoyarse en el comportamiento del propio modelo.
- Reproducibilidad de abliteration: la model card documenta la busqueda completa (120 pruebas, 15 candidatos, configuracion final con valores numericos), lo que permite replicar el procedimiento con Heretic sobre otros checkpoints y comparar estrategias de corte.
- Analisis de documentos con componente visual: gracias al pipeline image-text-to-text, puede emplearse en pipelines internos que reciben capturas, diagramas o documentos escaneados y necesitan una descripcion o extraccion en texto.
- Generacion de texto creativo sin autolimitaciones editoriales: en entornos controlados y con revision humana posterior, la ausencia de rechazos evita interrupciones en ficcion, guiones o narrativa con tematicas adultas.
- Asistente conversacional autoalojado: el autor documenta el arranque con vLLM mediante un unico comando, lo que facilita montar un servicio de chat interno sobre infraestructura propia.
- Anotacion y preetiquetado de datasets imagen-texto: el modelo puede generar descripciones iniciales de imagenes que despues se revisan, siempre que el contenido del dataset lo permita y se asuma la ausencia de filtros internos.
- Estudio del coste de la abliteration en capacidades: comparar base y abliterado en tareas estandar permite medir si la divergencia KL de 0,2241 se traduce en degradacion observable, algo que el autor no evaluo con benchmarks de calidad.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes). Lo que si publica es la evaluacion del efecto de la abliteration, que se reproduce a continuacion tal cual aparece en la model card.

| Metrica | Muse-Glimmer-30B (original) | Muse-Glimmer-30B-abliterated |
|---|---|---|
| Rechazos sobre 7.011 prompts daninos | 2.348 (33,49 %) | 88 (1,26 %) |
| Rechazos eliminados | - | 96,3 % |
| Divergencia KL frente al original (12.000 prompts no daninos) | - | 0,2241 |

El autor indica que Heretic advierte de que valores de KL por encima de aproximadamente 0,5 suelen indicar un dano significativo a las capacidades del modelo original, y que 0,2241 esta muy por debajo de la mitad de ese umbral.

Configuracion de ablacion finalmente seleccionada:

| Parametro | attn.o_proj | mlp.down_proj |
|---|---:|---:|
| max_weight | 1,478300 | 1,411696 |
| max_weight_position | 37,196841 | 33,810336 |
| min_weight | 1,411191 | 1,407139 |
| min_weight_distance | 29,973070 | 25,019048 |

Ambito de direccion: global. Indice de direccion: 36,589359.

No se han publicado resultados de benchmarks de capacidad en la informacion disponible, de modo que no es posible comparar el rendimiento del modelo con el de alternativas de su misma categoria.

## Requisitos de hardware

- Pesos en BF16: 29,78 B de parametros a 2 bytes por parametro equivalen a unos 59,6 GB, cifra que coincide con el tamano del repositorio (59,55 GB en 13 shards).
- VRAM estimada para inferencia en BF16: al menos 60 GB solo para pesos, mas la cache KV. Con contexto largo y lotes concurrentes es realista necesitar 80 GB o mas por replica.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200. Tambien es viable el reparto en tensor parallel sobre varias GPU, por ejemplo 2 x A100 40 GB, 4 x A6000 48 GB o configuraciones equivalentes.
- Cuantizacion de 8 bits: alrededor de 30 GB de pesos, lo que permite una unica A100 40 GB o una RTX 6000 Ada 48 GB con margen para cache KV.
- Cuantizacion de 4 bits: alrededor de 17-18 GB de pesos, de modo que cabe en una RTX 4090 o RTX 3090 de 24 GB, con margen limitado para contexto largo.
- Sin cuantizar no cabe en GPU de consumo: 59,55 GB de pesos superan la VRAM de cualquier tarjeta consumer individual, incluidas la RTX 4090 y la RTX 5090 de 24 y 32 GB respectivamente.
- Formato de despliegue: el unico documentado por el autor es vLLM, con el comando vllm serve dudeman2512/Muse-Glimmer-30B-abliterated. Tambien es utilizable con transformers en BF16. No se confirma soporte de llama.cpp, Ollama ni TGI, ya que el repositorio no incluye pesos GGUF.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota practica: cualquier cuantizacion de 8 o 4 bits aplicada sobre este checkpoint no esta validada por el autor; las cifras anteriores son estimaciones aritmeticas a partir del numero de parametros.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar el modelo con su propio checkpoint de origen. No se dispone de datos de otros modelos comparables en la misma categoria (30 B multimodales, o versiones abliteradas de los mismos).

| Modelo | Parametros | Contexto | Rechazos (7.011 prompts) | KL vs original | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Muse-Glimmer-30B | 29,78 B | No disponible | 2.348 (33,49 %) | Referencia | muse-glimmer | Repositorio dudeman2512/Muse-Glimmer-30B |
| Muse-Glimmer-30B-abliterated | 29,78 B | No disponible | 88 (1,26 %) | 0,2241 | muse-glimmer | Repositorio dudeman2512/Muse-Glimmer-30B-abliterated |

Alternativas de otros autores: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Comportamiento de rechazo eliminado: solo se mantiene el 1,26 % de las negativas originales sobre el conjunto de prueba del autor. El propio autor indica que las protecciones necesarias deben implementarse en la capa de aplicacion.
- Coste colateral medido: la divergencia KL de 0,2241 frente al original implica que la distribucion de siguiente token se ha desplazado, tambien en prompts que el modelo nunca habria rechazado. El autor la situa por debajo del umbral de 0,5 que Heretic considera indicativo de dano grave, pero no es cero.
- Ausencia de benchmarks de capacidad: no hay MMLU, HumanEval, GSM8K ni ninguna otra evaluacion que confirme que las capacidades del modelo base se conservan tras la edicion. No puede afirmarse que el rendimiento sea equivalente al original.
- Riesgo de alucinacion: no medido ni documentado. Es un riesgo inherente a los modelos de lenguaje y la ausencia de rechazos puede agravarlo en dominios sensibles, al no existir una negativa del modelo que actue como senal de incertidumbre.
- Licencia no estandar: el campo license: other con nombre muse-glimmer remite al archivo LICENSE del repositorio. No es una licencia reconocida por la OSI y las condiciones de uso comercial dependen de lo que ese archivo establezca, que no se detalla en la informacion disponible. Conviene revisarlo antes de cualquier uso en produccion.
- Idiomas no declarados: el repositorio no especifica que idiomas soporta el modelo, por lo que no puede garantizarse un rendimiento adecuado en castellano ni en ninguna otra lengua concreta.
- Contexto no declarado: se desconoce la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- Sesgos: no documentados por el autor. La abliteration no elimina sesgos sociales, estereotipos ni conocimientos incorrectos, solo la direccion de rechazo.
- Trazabilidad limitada: 23 descargas y 0 likes en el momento de la consulta, sin evaluaciones de terceros. Es un artefacto con validacion comunitaria practicamente nula.
- Uso desaconsejado: el autor declara explicitamente que el modelo no esta disenado para casos de uso maliciosos y que no se responsabiliza del uso que se le dé. Las condiciones de la licencia y las normas de la plataforma siguen aplicando con independencia de que el modelo rechace o no una peticion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dudeman2512/Muse-Glimmer-30B-abliterated
- Modelo base: https://huggingface.co/dudeman2512/Muse-Glimmer-30B
- Heretic, herramienta de abliteration utilizada: https://github.com/p-e-w/heretic
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
