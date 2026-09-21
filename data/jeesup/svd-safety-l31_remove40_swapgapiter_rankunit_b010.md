# Jeesup/svd-safety-l31_remove40_swapgapiter_rankunit_b010

## Resumen

svd-safety-l31_remove40_swapgapiter_rankunit_b010 es un checkpoint derivado de meta-llama/Llama-3.1-8B-Instruct sobre el que se ha aplicado una compresion SVD-LLM que elimina el 40,02 % de los parametros, dejando una fraccion de parametros densos de 0,5998. Sobre ese modelo comprimido se han ejecutado 10 de 10 rondas de una edicion iterativa de parametros ("parameter-neutral swap") seleccionada por la regla `gap_iter`, con un presupuesto total de restauracion del 1,000 % de los parametros densos (69.743.616 parametros intercambiados, 5.219 componentes restaurados y 5.219 expulsados en orden sigma). El autor lo publica como artefacto de investigacion para estudiar como la compresion por SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor.

El modelo no es un asistente de proposito general ni un modelo listo para produccion. Forma parte de una rejilla experimental que cruza reglas de seleccion y presupuestos, y el propio autor advierte que varias celdas de esa rejilla estan deliberadamente degradadas en seguridad respecto al modelo base. Las metricas publicadas en la model card son AdvBench ASR 0,0654, StrongREJECT ASR 0,1597, sobre-rechazo macro (WildGuard) 0,0914 y perplejidad en WikiText-2 de 30,3951, todas ellas obtenidas con el juez de HarmBench cuando corresponde.

Su relevancia es metodologica: cuantifica el coste de seguridad de la compresion de pesos y prueba una estrategia de reparacion concreta, en un momento en el que la compresion agresiva de modelos de 8B se usa habitualmente para abaratar inferencia. La arquitectura subyacente es la de Llama 3.1 8B Instruct (transformer decoder-only con grouped-query attention), pero los tensores han sido reestructurados por el proceso de SVD, por lo que la ficha describe tanto lo declarado por el autor como las especificaciones heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada de Llama-3.1-8B-Instruct; pesos comprimidos con SVD-LLM (descomposicion en valores singulares sobre matrices de proyeccion) y posterior edicion iterativa de parametros |
| Parametros totales | 8.030.261.248 segun los metadatos de safetensors del repositorio; la model card declara una fraccion de parametros densos resultante de 0,5998 tras eliminar el 40,02 % |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-3.1-8B-Instruct admite 128.000 tokens |
| Tipos de cuantizacion | no disponible; los pesos se publican sin cuantizar en safetensors (~16,1 GB, coherente con bf16/fp16) |
| Idiomas soportados | no disponible en la model card; el modelo base declara 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | Llama 3.1 Community License (incluye LICENSE y USE_POLICY.md en el repositorio; "Built with Llama") |
| Formato de pesos | safetensors (library_name: transformers) |

## Arquitectura y entrenamiento

No hay entrenamiento adicional en sentido clasico: el proceso es de compresion y edicion post-hoc sobre un checkpoint ya instruido. El punto de partida es meta-llama/Llama-3.1-8B-Instruct, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y grouped-query attention. Sobre el se aplica SVD-LLM para eliminar el 40,02 % de los parametros de las matrices de proyeccion, lo que reduce la fraccion de parametros densos hasta 0,5998.

La segunda etapa es una edicion iterativa de parametros neutra en numero de parametros: en cada una de las 10 rondas se seleccionan componentes segun la regla `gap_iter`, se restauran 5.219 componentes procedentes del modelo original y se expulsan otros 5.219 en orden sigma, con un chunk por ronda del 0,100 % de los parametros densos y un presupuesto acumulado del 1,000 %. El valor de intercambio es `insert` (solo valor de insercion, con expulsion ordenada por sigma) y la semilla es 42. El resultado son 69.743.616 parametros intercambiados, equivalentes al 1,00 % de los parametros de proyeccion densos.

No se documentan en la informacion disponible datos sobre volumen de tokens, composicion del dataset, tecnicas de alineacion adicionales (RLHF, DPO), decodificacion especulativa ni ninguna otra innovacion de inferencia. Todo el interes tecnico esta en el pipeline de compresion y reparacion, no en el entrenamiento.

## Capacidades

- Generacion de texto y conversacion: hereda la capacidad de instruccion del modelo base, aunque la model card no valida ninguna tarea de generacion mas alla de las metricas de seguridad y perplejidad.
- Razonamiento, codigo y matematicas: no evaluados en la informacion disponible; no hay resultados de MMLU, HumanEval ni GSM8K para este checkpoint.
- Tool calling / function calling: no evaluado; el modelo base lo soporta, pero la compresion puede alterar la fiabilidad del formato de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no evaluado ni documentado.
- Capacidades multilingues: no evaluadas; el modelo base cubre 8 idiomas, pero el impacto de la compresion sobre idiomas distintos del ingles no se ha medido.
- Capacidad especial del artefacto: servir como sujeto experimental para medir la tasa de exito de ataques (ASR) y el sobre-rechazo tras compresion y reparacion selectiva de componentes.
- No dispone de modo "thinking", vision ni audio.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar este checkpoint como celda concreta de una rejilla que cruza reglas de seleccion (`gap_iter` frente a otras) y presupuestos de restauracion, para aislar cuanto de la degradacion de seguridad proviene del SVD y cuanto se recupera con la edicion.
- Baseline negativo en evaluaciones de seguridad: al presentar un ASR de 0,0654 en AdvBench y 0,1597 en StrongREJECT, sirve como referencia de un modelo comprimido y parcialmente reparado frente al modelo base sin comprimir y frente a otras celdas de la rejilla.
- Estudio del sobre-rechazo: su 0,0914 de sobre-rechazo macro medido con WildGuard permite analizar el equilibrio entre seguridad y utilidad, es decir, cuanto rechazo innecesario introduce la reparacion.
- Validacion de pipelines de compresion SVD-LLM: replicar el experimento con la semilla 42 y comprobar que se reproducen los 5.219 componentes restaurados, los 5.219 expulsados y la fraccion 0,5998.
- Analisis de perplejidad tras compresion: la cifra de 30,3951 en WikiText-2 permite cuantificar el dano en modelado de lenguaje de una eliminacion del 40,02 % de parametros con reparacion del 1,000 %.
- Red-teaming y construccion de datasets de ataque: generar respuestas con este checkpoint para poblar conjuntos de evaluacion, siempre que se etiquete correctamente su procedencia experimental.
- Auditoria de licencias y trazabilidad de derivados: caso de uso de gobernanza para verificar como se propaga la Llama 3.1 Community License a un derivado comprimido y distribuido.
- No se recomienda su uso como asistente en atencion al cliente, generacion de codigo en produccion ni ningun flujo con usuarios finales, dado que el autor lo describe explicitamente como artefacto de investigacion y no como modelo desplegable.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,0654 | HarmBench judge |
| StrongREJECT ASR | 0,1597 | HarmBench judge |
| Sobre-rechazo macro | 0,0914 | WildGuard |
| Perplejidad WikiText-2 | 30,3951 | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, MT-Bench ni comparaciones numericas contra el modelo base sin comprimir, por lo que no es posible calcular la delta exacta de utilidad respecto a meta-llama/Llama-3.1-8B-Instruct.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 16,1 GB solo para pesos, mas el cache KV y el overhead del runtime. Cabe en GPUs de 24 GB.
- Cache KV estimado a partir de la arquitectura del modelo base (32 capas, 8 cabezas KV, dimension de cabeza 128): unos 131 KB por token, es decir, cerca de 1,05 GB para 8.000 tokens y 4,2 GB para 32.000 tokens. Estimacion derivada del modelo base, no publicada por el autor.
- GPU recomendadas: A100 40 GB u 80 GB, H100 para servicio concurrente con contexto largo, y RTX 4090 / RTX 3090 (24 GB) para una unica instancia con contexto moderado en bf16. En GPUs de 16 GB el checkpoint sin cuantizar no entra con margen.
- Opciones de despliegue: transformers como via soportada (así esta etiquetado), text-generation-inference y endpoints compatibles segun las etiquetas del repositorio; vLLM es plausible pero no esta confirmado. La conversion a GGUF para llama.cpp u Ollama no esta documentada y puede no ser directa, ya que los tensores han sido reestructurados por el proceso de SVD.
- Cuantizacion: no se ofrecen variantes GGUF, AWQ ni GPTQ en el repositorio. Cualquier cuantizacion requeriria generarla a partir de safetensors y verificar que el formato de pesos comprimido la admite.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metricas de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l31_remove40_swapgapiter_rankunit_b010 | 8,03 B almacenados; fraccion densa declarada 0,5998 | no disponible en la model card | AdvBench ASR 0,0654; StrongREJECT ASR 0,1597; sobre-rechazo 0,0914; ppl WikiText-2 30,3951 | Llama 3.1 Community License | Repositorio HuggingFace con 0 descargas y 0 likes |
| meta-llama/Llama-3.1-8B-Instruct (modelo base) | 8,03 B densos | 128.000 tokens | no disponible en la informacion proporcionada | Llama 3.1 Community License | Modelo oficial ampliamente desplegado |
| Otras celdas de la misma rejilla experimental (otras reglas de seleccion y presupuestos) | no disponible | no disponible | no disponibles | Llama 3.1 Community License | Publicadas por el mismo autor, no listadas en esta informacion |
| Otras familias de compresion de LLM (SVD-LLM, pruning estructurado, cuantizacion) | no disponible | no disponible | no disponible | variable | no disponible |

No se dispone de datos comparativos adicionales en la informacion proporcionada, por lo que no se pueden establecer comparaciones numericas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de investigacion, no modelo desplegable: el autor indica explicitamente que debe tratarse como sujeto experimental y no como asistente.
- Seguridad degradada por diseno en varias celdas de la rejilla: la compresion por si sola eleva la tasa de exito de ataques, y este checkpoint no es una excepcion garantizada. La propia model card registra un ASR de 0,0654 en AdvBench y 0,1597 en StrongREJECT.
- Sobre-rechazo medido de 0,0914, lo que implica que parte de las peticiones benignas seran rechazadas de forma innecesaria.
- Perplejidad de 30,3951 en WikiText-2, muy superior a la esperable en un modelo de 8B sin comprimir; la calidad de generacion y la coherencia en contextos largos estan comprometidas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, y previsiblemente agravado por la perdida de capacidad de modelado de lenguaje.
- Idiomas: no hay evaluacion multilingue; el dano de la compresion puede ser desigual entre los idiomas del modelo base.
- Contexto: la ventana efectiva no esta validada; la degradacion por compresion suele acentuarse con secuencias largas.
- Licencia: Llama 3.1 Community License, con las obligaciones de atribucion ("Built with Llama") y el cumplimiento de USE_POLICY.md. Los derivados comprimidos siguen sujetos a esas condiciones, que incluyen clausulas especificas para uso comercial a gran escala.
- Sin datos de procedencia de datos de entrenamiento ni del impacto de la edicion de parametros sobre sesgos; no se puede descartar la amplificacion de sesgos presentes en el modelo base.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria independiente.
- Fechas del repositorio poco habituales (creacion 2026-09-20): conviene verificar la vigencia de los artefactos antes de reutilizarlos.
- La discrepancia entre los 8.030.261.248 parametros que reportan los metadatos de safetensors y la fraccion densa de 0,5998 declarada en la model card sugiere que el repositorio almacena tensores con las dimensiones originales (o reconstruidos de rango completo), no una arquitectura fisicamente reducida. Debe verificarse antes de asumir cualquier ahorro de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Model card de Llama 3.1 (referencia de arquitectura, contexto e idiomas): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia y politica de uso: archivos LICENSE y USE_POLICY.md incluidos en el propio repositorio
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo, a SVD-LLM ni a la metodologia de edicion de parametros; los resultados devueltos corresponden a paginas genericas sobre busquedas relacionadas de Bing, sin relacion con este checkpoint.
