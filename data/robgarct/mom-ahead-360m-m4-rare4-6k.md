# robgarct/mom-ahead-360m-m4-rare4-6k

## Resumen

mom-ahead-360m-m4-rare4-6k es un checkpoint de investigacion publicado por el usuario robgarct en HuggingFace: un modelo de lenguaje de 446,6 millones de parametros basado en una arquitectura Mixture-of-Memories (MoM) con router de lectura ahead-feature. La arquitectura combina atencion lineal con cuatro bancos de memoria por capa y se distribuye a traves de la libreria propia recurrent-recall-circuits, no mediante transformers.

El modelo se entrena sobre The Pile durante 6.000 actualizaciones, equivalentes a 3.146 millones de tokens con un lote global de 256 y secuencias de 2.048 tokens, bajo el objetivo denominado rare4 y la semilla 1111. Su interes es fundamentalmente experimental: permite estudiar como se escribe y se lee en bancos de memoria separados dentro de una arquitectura de atencion lineal y como se comporta la recuperacion de informacion en contexto.

No hay datos publicos de licencia, idiomas ni pipeline declarado, y el repositorio acumula 0 descargas y 0 likes, por lo que debe tratarse como un artefacto de investigacion reproducible y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Memories (MoM) con atencion lineal y router de lectura ahead-feature; 4 bancos de memoria por capa |
| Parametros totales | 446,6 M (incluye 51,5 M de embeddings y el extractor de caracteristicas ahead-feature) |
| Parametros activos | no aplica (no es un MoE; los 446,6 M de parametros son densos) |
| Longitud de contexto | no disponible (el entrenamiento se realiza con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en su precision nativa; no hay GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible (entrenado sobre The Pile, corpus mayoritariamente en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.ckpt` (`final.ckpt`, sin estado del optimizador), mas `resolved-config.yaml` y `metadata.json` |
| n_embd / n_layer / n_head | 1024 / 24 / 16 |
| Bancos de memoria | 4 por capa |
| Puerta de escritura | softmax top-4 con estimador straight-through |
| Puerta de lectura | softplus denso (`read_top_k: null`) |
| Tamano del repositorio | 1,6 GB |
| Libreria | recurrent-recall-circuits |

## Arquitectura y entrenamiento

La arquitectura es un transformer con atencion lineal organizado en torno a un esquema Mixture-of-Memories: cada una de las 24 capas mantiene 4 bancos de memoria independientes, con una puerta de escritura que selecciona los 4 destinos mediante softmax top-4 con estimador straight-through y una puerta de lectura densa basada en softplus. El router de lectura es de tipo ahead-feature, y el modelo incorpora ademas un extractor de caracteristicas del mismo nombre. La dimension de embedding es 1024, hay 24 capas y 16 cabezas de atencion. Conviene subrayar que la mezcla es de memorias, no de expertos: no existe enrutado disperso de parametros y los 446,6 M de parametros son densos.

El entrenamiento consiste en un unico preentrenamiento de lenguaje sobre The Pile, con 6.000 actualizaciones, 3.146 millones de tokens procesados, lote global de 256 secuencias de 2.048 tokens, objetivo `rare4` y semilla 1111. No se documenta ninguna fase posterior de ajuste por instrucciones, RLHF ni DPO, ni tecnicas de decodificacion especulativa. La innovacion principal es el desacoplamiento entre escritura y lectura de memoria dentro de un regimen de atencion lineal, que en inferencia sustituye el crecimiento del KV cache por un estado de memoria de tamano acotado. El volumen de entrenamiento queda muy por debajo de la ratio habitual de 20 tokens por parametro, que situaria el objetivo en torno a 8.900 millones de tokens para este tamano.

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje por prediccion del siguiente token.
- Recuperacion de informacion en contexto (in-context recall), medida con las tareas FDA y SWDE del arnes de evaluacion del propio repositorio.
- Escritura y lectura selectiva en bancos de memoria multiples por capa, con enrutado aprendido.
- Inferencia con estado de memoria de tamano constante, sin KV cache que crezca con la longitud de la secuencia.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ajuste por instrucciones o dialogo conversacional: no disponible; el checkpoint es un modelo base preentrenado.

## Casos de uso

- Investigacion en arquitecturas de memoria: el checkpoint permite reproducir y auditar la configuracion `mom_ahead_360m_m4` con semilla fija (1111) y comparar el efecto de los 4 bancos de memoria por capa frente a otras variantes registradas en `configs/models/registry.yaml`.
- Evaluacion de recuperacion en contexto: sirve como punto de referencia interno en las suites `based-fda` (1.102 ejemplos) y `based-swde-v2`, utiles para diagnosticar si un cambio de router mejora o degrada la recuperacion de hechos.
- Punto de partida para ajuste fino en dominio: con 446,6 M de parametros y pesos en el entorno de los 0,9-1,8 GB, cabe en una GPU de consumo y permite experimentos de fine-tuning con presupuesto de computo reducido antes de escalar a modelos mayores.
- Prototipado en el borde: una cuantizacion a 8 o 4 bits situaria los pesos en torno a 0,45 y 0,22 GB, lo que hace viable probar el modelo en dispositivos con memoria limitada, siempre que se implemente el kernel de atencion lineal correspondiente.
- Estudio de eficiencia frente a atencion cuadratica: al no requerir KV cache creciente, es un banco de pruebas para medir memoria y latencia en secuencias largas frente a un transformer denso de tamano similar.
- Destilacion y experimentos de transferencia: el modelo puede actuar como alumno en experimentos de destilacion desde modelos mayores o como profesor en la generacion de datos sinteticos para modelos mas pequenos.
- Calibracion de pipelines de evaluacion: la perplexity de 10,19 sobre cortes uniformes de The Pile permite verificar que un arnes de evaluacion propio reproduce los valores publicados antes de usarlo con otros modelos.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card. No se proporcionan resultados comparativos con otros modelos, por lo que no se ofrece tabla comparativa.

| Metrica | Conjunto de evaluacion | Valor |
|---|---|---|
| Perplexity de validacion | The Pile, cortes uniformes | 10,19 |
| FDA | based-fda, 1.102 ejemplos | 34,2 |
| SWDE | based-swde-v2 | 34,6 |

La model card no especifica la unidad de las cifras de FDA y SWDE (habitualmente porcentaje de acierto en tareas de recuperacion de informacion en contexto), por lo que se reproducen tal cual sin interpretarlas. No hay datos de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo a partir de 446,6 M de parametros, no publicado por el autor): unos 1,8 GB en FP32, 0,9 GB en FP16/BF16, 0,45 GB en INT8 y 0,22 GB en INT4.
- A esas cifras hay que sumar el estado de memoria de los 4 bancos por capa, el extractor ahead-feature y las activaciones, de modo que el consumo real sera superior al de los pesos solos.
- Cabe sin problemas en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o cualquier GPU con 8 GB o mas, incluso en FP32.
- GPU de centro de datos (A100, H100) solo tendrian sentido para entrenamiento o para barridos de hiperparametros en paralelo, no por requisitos de memoria.
- Opciones de despliegue: el modelo no es compatible con transformers, vLLM, TGI, llama.cpp ni Ollama de forma documentada; la unica via descrita es clonar `recurrent-recall-circuits`, componer `experiment=mom/360m_ahead_6k_m4` y cargar `final.ckpt` con `utils.checkpoint.load_checkpoint`, o usar el arnes `recurrent_recall_circuits.evaluation.launch` con el alias `mom_ahead_360m_m4`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados en la informacion proporcionada. La categoria natural de comparacion son los modelos pequenos con atencion lineal o recurrente (familias Mamba, RWKV o RetNet), pero no se han facilitado cifras de esos modelos ni evaluaciones cruzadas con este checkpoint, de modo que cualquier comparacion numerica seria inventada.

| Modelo | Parametros | Datos comparativos | Licencia |
|---|---|---|---|
| mom-ahead-360m-m4-rare4-6k | 446,6 M | perplexity 10,19 (Pile); FDA 34,2; SWDE 34,6 | no disponible |
| Alternativas de atencion lineal o recurrente de tamano similar | no disponible en la informacion | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, lo que lo descalifica para produccion hasta que el autor la especifique.
- Modelo base sin alineacion: no ha pasado por ajuste por instrucciones, RLHF ni DPO; no es un modelo conversacional y no seguira instrucciones de forma fiable.
- Entrenamiento muy corto: 3.146 millones de tokens para 446,6 M de parametros queda lejos de la ratio habitual de 20 tokens por parametro, con la perplexity de 10,19 como reflejo de un ajuste limitado.
- Recuperacion en contexto moderada o baja: los valores de FDA (34,2) y SWDE (34,6) sugieren margen amplio de mejora en tareas de recuperacion de hechos.
- Riesgo de alucinacion elevado: un modelo pequeno y poco entrenado tiende a generar contenido plausible pero incorrecto, especialmente fuera del dominio de The Pile.
- Idiomas no declarados: el corpus de entrenamiento es mayoritariamente en ingles, por lo que el rendimiento en castellano es impredecible y no esta documentado.
- Longitud de contexto no documentada: aunque el entrenamiento usa secuencias de 2.048 tokens, no se especifica la ventana maxima soportada en inferencia.
- Sin filtrado de seguridad ni mitigacion de sesgos declarados: hereda los sesgos y el contenido de The Pile.
- Dependencia de codigo externo: requiere el repositorio recurrent-recall-circuits y una arquitectura personalizada; no funciona con el ecosistema estandar de inferencia ni dispone de pesos cuantizados listos para usar.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robgarct/mom-ahead-360m-m4-rare4-6k
- Repositorio de codigo: `https://github.com/<owner>/recurrent-recall-circuits` (la model card usa un marcador `<owner>` sin concretar el propietario, por lo que la URL exacta no esta disponible)
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion proporcionada.
