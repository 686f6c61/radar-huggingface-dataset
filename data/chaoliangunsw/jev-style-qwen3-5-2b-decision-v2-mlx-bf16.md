# chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16

## Resumen

Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16 es la version en precision BF16 nativa para Apple MLX del modelo de decision Jev-Style v2, desarrollado por chaoliangUNSW. No es un modelo generativo de proposito general: es un clasificador y enrutador basado en un backbone de texto de clase 2B (Qwen3.5) afinado mediante LoRA para recibir un estado, una pregunta y una lista de opciones, y devolver en un unico prefill la opcion seleccionada junto con probabilidades calibradas.

El modelo esta pensado para tareas de clasificacion, routing y eleccion tipada donde se necesita no solo la etiqueta, sino una confianza fiable. Sobre un panel de referencia fijo en ingles alcanza un 81,20 % de exactitud macro en 3.277 decisiones reales repartidas en 11 grupos de tarea, con un Macro-F1 de 79,78 %, una NLL de 0,5154 y un Brier score de 0,2787, mejorando a la version v1 (76,68 %) y a English Laya (75,09 %).

La relevancia practica esta en su coste de adaptacion y de despliegue: el entrenamiento principal requirio 36,9 minutos en una sola H100 de 80 GB con LoRA de rango 32, y el repositorio incluye los ficheros de calibracion, el cliente de inferencia y los registros de evaluacion. Esta build concreta pesa 3,76 GB, se ejecuta sobre Apple Silicon con MLX nativo y muestra un 99,6 % de coincidencia de eleccion con la referencia CUDA BF16 sobre un subconjunto congelado de 500 decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3.5, clase 2B); detalles de capas y atencion no disponibles |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 nativo (esta build MLX); en el repositorio hermano GGUF: Q4_K_M, Q8_0 y BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, bf16); el repositorio incluye calibracion, cliente de inferencia y registros de evaluacion |
| Tamano del repositorio | 3,8 GB (pesos BF16: 3,76 GB) |
| Libreria de inferencia | MLX (Apple Silicon) |
| Modelo base | chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2 (finetune) |
| Pipeline | text-generation |
| Tarea real | clasificacion / routing / decision tipada con calibracion |

## Arquitectura y entrenamiento

El modelo parte de un backbone de texto de clase 2B de la familia Qwen3.5 y lo adapta mediante LoRA de rango 32 a la tarea de decision. El entrenamiento principal consumio 36,9 minutos en una unica GPU H100 de 80 GB, lo que situa la adaptacion en el rango de los minutos frente a los procesos de ajuste completo de modelos comparables. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset de ajuste, mas alla del conjunto de calibracion de 3.100 registros y los conjuntos de evaluacion descritos.

La innovacion tecnica central es el modo de decision de un solo prefill: el modelo recibe estado, pregunta y opciones en una unica pasada y devuelve la opcion elegida con probabilidades. Sobre esa salida se aplica una temperatura de calibracion ajustada en el split de calibracion de 3.100 registros; los clientes de HF y MLX la aplican automaticamente, y el fichero GGUF calibrado la incorpora en el tensor de normalizacion final. La evaluacion cubre 11 grupos de tarea con etiqueta real (AG News, ANLI, BoolQ, Emotion, Enron spam, HANS, IMDb, MNLI, RTE, SST-2 y SST-5) mas un grupo separado de decisiones tipadas con referencia de profesor (2.000 decisiones procedentes de 400 estados).

## Capacidades

- Clasificacion con etiqueta real: devuelve la clase seleccionada y su probabilidad calibrada sobre un conjunto fijo de opciones.
- Routing y eleccion tipada: seleccion entre opciones heterogeneas definidas en el prompt, util para enrutado de peticiones o seleccion de herramientas.
- Decision de un solo prefill: no requiere generacion autoregresiva larga; el resultado se obtiene en una pasada.
- Probabilidades calibradas: la temperatura se ajusta sobre el split de calibracion y se aplica de forma automatica, con ECE macro por tarea un 26,4 % inferior al de English Laya.
- Robustez al orden de opciones: tasa de volteo del 6,00 % frente al 12,00 % de English Laya, con un 80,00 % de exactitud tras permutar las opciones en 400 decisiones Choice/Bool.
- Politicas de umbral: en la prueba programatica de 200 pares contrafactuales, ambas decisiones del par son correctas en el 71,50 % de los casos (frente al 63,00 % de v1).
- Salida conversacional/text-generation: el pipeline declarado es text-generation con soporte conversational, aunque el uso previsto es la decision.
- Multilingue: no, el modelo declara unicamente ingles.
- Tool calling, agentes multi-paso, vision o audio: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutado de peticiones en produccion: dado un estado (consulta del usuario, contexto de sesion) y una lista de destinos o intenciones, el modelo elige el destino en un unico prefill y devuelve la confianza asociada. La probabilidad calibrada permite descartar decisiones por debajo de un umbral y derivar a un humano o a un fallback.
- Moderacion y clasificacion de contenido: uso directo sobre tareas tipo SST-2 (93,00 %), SST-5 (60,67 %) o IMDb (96,33 %) para etiquetar sentimiento y toxicidad con umbrales ajustables, aplicando la temperatura de calibracion para que el umbral tenga un significado probabilistico estable.
- Deteccion de spam en correo corporativo: sobre el conjunto Enron spam alcanza un 97,67 % de exactitud; el modelo puede integrarse en un filtro previo a la bandeja de entrada, con la opcion de marcar como dudoso todo lo que caiga en una banda de confianza intermedia.
- Seleccion de herramienta en un agente: cuando un orquestador debe elegir entre varias funciones disponibles, el modelo actua como cabecera de decision barata (1,88 B parametros) que resuelve la eleccion sin invocar al modelo generativo grande; el ahorro de latencia y coste es el argumento principal.
- Verificacion de entailment en pipelines de RAG: con resultados de 88,00 % en MNLI, 85,92 % en RTE y 48,67 % en ANLI, el modelo puede usarse como filtro de comprobacion entre la respuesta generada y las fuentes recuperadas, aceptando el coste de un recall mas bajo en ANLI.
- Despliegue local en portatiles Apple Silicon: al ser una build MLX BF16 de 3,76 GB con un 99,6 % de coincidencia respecto a CUDA BF16, encaja en flujos de desarrollo sobre Mac donde no se dispone de GPU NVIDIA, manteniendo la paridad de decisiones.
- Etiquetado asistido y pre-anotacion: sobre los 11 grupos de tarea cubiertos, el modelo puede generar etiquetas iniciales con confianza para que un anotador humano revise solo los casos de baja certeza, reduciendo el volumen de revision manual.
- Control de calidad con calibracion: el NLL de 0,5154 y el Brier de 0,2787 permiten usar la salida como estimador de riesgo en sistemas que necesitan decidir cuando confiar en una clasificacion automatica.

## Benchmarks y rendimiento

Resultados sobre el panel de referencia fijo en ingles (11 grupos de etiqueta real, 3.277 decisiones, pesos de tarea iguales, split de calibracion de 3.100 registros, estructura de referencia CUDA):

| Metrica | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|
| Exactitud (mayor es mejor) | 76,68 % | 75,09 % | 81,20 % |
| Macro-F1 (mayor es mejor) | 75,42 % | 73,45 % | 79,78 % |
| Log-verosimilitud negativa (menor es mejor) | 0,5752 | 0,6318 | 0,5154 |
| Brier score (menor es mejor) | 0,3290 | 0,3482 | 0,2787 |

Intervalos pareados del 95 % para la mejora en exactitud: [+3,58, +5,52] puntos frente a v1 y [+4,64, +7,52] puntos frente a English Laya, dentro de este panel fijo. La mejora en calidad de probabilidad frente a English Laya es de un 18,4 % menos de NLL, un 20,0 % menos de Brier y un 26,4 % menos de ECE macro por tarea.

Exactitud por tarea (11 tareas de etiqueta real; 300 ejemplos salvo RTE con 277):

| Tarea | Ejemplos | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|---:|
| AG News | 300 | 87,67 % | 89,00 % | 88,00 % |
| ANLI | 300 | 48,00 % | 49,67 % | 48,67 % |
| BoolQ | 300 | 82,67 % | 75,67 % | 81,67 % |
| Emotion | 300 | 58,33 % | 60,33 % | 85,33 % |
| Enron spam | 300 | 77,33 % | 96,33 % | 97,67 % |
| HANS | 300 | 68,00 % | 75,00 % | 68,00 % |
| IMDb | 300 | 96,67 % | 93,67 % | 96,33 % |
| MNLI | 300 | 86,67 % | 85,00 % | 88,00 % |
| RTE | 277 | 84,48 % | 77,98 % | 85,92 % |
| SST-2 | 300 | 92,67 % | 91,67 % | 93,00 % |
| SST-5 | 300 | 61,00 % | 31,67 % | 60,67 % |

Grupo separado de decisiones tipadas con referencia de profesor (2.000 decisiones de 400 estados, excluido de la macro de etiqueta real): acuerdo con el profesor del 53,35 % para v1, 37,55 % para English Laya y 73,45 % para v2 bajo la interfaz primaria fija.

Robustez al orden de opciones (400 decisiones Choice/Bool):

| Prueba de permutacion de opciones | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|
| Tasa de volteo de decision (menor es mejor) | 9,25 % | 12,00 % | 6,00 % |
| Exactitud tras permutacion (mayor es mejor) | 66,75 % | 67,00 % | 80,00 % |

Validacion de despliegue por formato:

| Formato | Tamano de pesos | Resultado validado | Conjunto de evaluacion |
|---|---:|---|---|
| HF BF16 | 3,76 GB | 81,27 % exactitud macro de etiqueta real | 3.277 decisiones completas |
| MLX BF16 nativo (este repositorio) | 3,76 GB | 99,6 % de coincidencia de eleccion con CUDA BF16 | Subconjunto congelado de 500 decisiones |
| GGUF Q8_0 calibrado | 2,01 GB | 99,2 % de coincidencia con CUDA BF16 | Mismo subconjunto de 500 |
| GGUF Q4_K_M calibrado | 1,27 GB | 91,4 % de coincidencia con CUDA BF16 | Mismo subconjunto de 500 |
| GGUF BF16 calibrado | 3,78 GB | 99,6 % de coincidencia con CUDA BF16 | Mismo subconjunto de 500 |

## Requisitos de hardware

- Pesos en BF16: 3,76 GB. Con cache KV y overhead del runtime, el consumo realista en inferencia se situa aproximadamente entre 5 y 7 GB de memoria unificada o VRAM, dependiendo de la longitud de contexto (no especificada por el autor).
- En cuantizacion GGUF Q4_K_M: 1,27 GB de pesos, lo que baja el requisito total por debajo de los 3 GB en la mayoria de configuraciones.
- En cuantizacion GGUF Q8_0: 2,01 GB de pesos.
- Apple Silicon: esta build esta pensada para MLX nativo; cualquier Mac con memoria unificada de 16 GB o superior puede ejecutarla con holgura.
- GPU consumer: si, cabe sin problema en RTX 3060 12 GB, RTX 4070/4080 y RTX 4090. En GPUs de 8 GB funcionaria en BF16 con margen ajustado y en Q4_K_M con amplio margen. El autor no publica requisitos minimos oficiales.
- GPU de datacenter: A100, H100 y similares estan sobredimensionadas para inferencia; su unico papel documentado es el entrenamiento (36,9 minutos de ajuste LoRA en una H100 de 80 GB).
- Opciones de despliegue confirmadas: MLX nativo en Apple Silicon (esta build, con su cliente de inferencia), llama.cpp para los ficheros GGUF, y Transformers mas el cliente de decision para el BF16 de HF.
- Otras opciones (vLLM, TGI, Ollama, SGLang): no confirmadas en la informacion proporcionada. Ollama y llama.cpp son compatibles con GGUF por formato, pero el autor no documenta una receta especifica.
- Latencia y throughput: no disponibles. La unica cifra de rendimiento publicada es la coincidencia de eleccion frente a la referencia CUDA BF16 (99,6 % en MLX BF16 y BF16 de GGUF; 99,2 % en Q8_0; 91,4 % en Q4_K_M).

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar contra las dos lineas base internas del propio autor, evaluadas sobre el mismo panel fijo:

| Modelo | Parametros | Contexto | Exactitud macro | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jev-Style-Qwen3.5-2B-Decision-v2 (esta build MLX BF16) | 1,88 B | No disponible | 81,20 % | 79,78 % | Apache-2.0 | HF: BF16, GGUF (Q4_K_M, Q8_0, BF16) y MLX BF16 |
| Jev-Style v1 | Clase 2B (no confirmado) | No disponible | 76,68 % | 75,42 % | Apache-2.0 | Builds previas del mismo autor |
| English Laya | No disponible | No disponible | 75,09 % | 73,45 % | No disponible | No disponible |

No se dispone de datos en la informacion proporcionada para comparar con alternativas externas de la misma categoria (clasificadores de 1-3 B parametros, cabezas de routing o modelos de decision tipo encoder). Cualquier comparacion con modelos como DeBERTa, ModernBERT o clasificadores basados en Qwen2.5-1.5B no puede sustentarse con los datos aportados.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles. El rendimiento en castellano o en otros idiomas no esta evaluado y no deberia asumirse.
- Sesgos: no se documenta ninguna evaluacion de sesgo demografico, politico o cultural. Los conjuntos usados (AG News, IMDb, Enron spam, entre otros) tienen dominios y distribuciones muy concretas que condicionan el comportamiento.
- Alucinacion: al ser un modelo de decision sobre opciones predefinidas, no genera texto libre en el uso previsto; el riesgo se traslada a falsa confianza, es decir, a elegir una opcion incorrecta con probabilidad alta. La calibracion reduce este riesgo pero no lo elimina.
- Tareas con rendimiento bajo: ANLI (48,67 %) y SST-5 (60,67 %) estan cerca o por debajo del azar en sus respectivos regimens (SST-5 tiene 5 clases). No es adecuado como clasificador de entailment dificil ni para granularidad fina de sentimiento.
- Robustez parcial: aunque la tasa de volteo por permutacion de opciones baja al 6,00 %, sigue existiendo sensibilidad al orden y al formato exacto del prompt. Las decisiones tipadas alcanzan un 73,45 % de acuerdo con el profesor, lo que deja un 26,55 % de discrepancia.
- Dependencia del formato: la interfaz primaria de decision es fija; cambiar el renderizado de las opciones o el orden de los campos puede degradar los resultados. El autor remite a baseline_sensitivity.json para el analisis de sensibilidad de renderizado.
- Cuantizacion agresiva: Q4_K_M cae al 91,4 % de coincidencia con CUDA BF16 en el subconjunto de 500 decisiones, un descenso notable frente al 99,6 % de BF16 y Q8_0. Para decisiones con umbrales de confianza estrictos, Q4_K_M no es recomendable sin revalidar.
- Licencia: Apache-2.0 permite uso comercial sin restriccion de royalties, pero conviene verificar las condiciones de la licencia del modelo base Qwen3.5 subyacente, no detalladas en la informacion aportada.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de los resultados publicados, que proceden del propio autor.
- Longitud de contexto desconocida: no se especifica en la model card, lo que impide garantizar el comportamiento en estados de entrada largos (por ejemplo, documentos completos en tareas de clasificacion).
- Fechas de publicacion: el repositorio aparece con fecha de creacion 2026-09-23, posterior a la fecha habitual de referencia; conviene contrastar la vigencia del artefacto antes de integrarlo en un pipeline de produccion.

## Enlaces

- Repositorio de esta build (MLX BF16): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Pesos directos (model.safetensors): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16/resolve/main/model.safetensors?download=true
- Build HF BF16 (modelo base del finetune): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2
- Build GGUF (Q4_K_M, Q8_0, BF16): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Registro de sensibilidad de baselines citado en la model card: evaluation/baseline_sensitivity.json (dentro del repositorio)
- Figuras incluidas en la model card: figures/benchmark.png, figures/calibration.png, figures/robustness.png

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con este modelo (contenido de parodias de anime y sitios para adultos) y no se ha encontrado ningun paper, blog, repositorio ni demo adicional asociado a Jev-Style-Qwen3.5-2B-Decision-v2. No se dispone, por tanto, de enlaces externos verificables mas alla de los repositorios de HuggingFace indicados arriba.
