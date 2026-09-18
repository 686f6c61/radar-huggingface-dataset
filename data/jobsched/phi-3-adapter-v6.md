# JobSched/phi-3-adapter-v6

## Resumen

JobSched/phi-3-adapter-v6 es un ajuste fino (fine-tuning) publicado en HuggingFace por el usuario JobSched sobre el modelo base microsoft/Phi-3-mini-128k-instruct. Se distribuye con la etiqueta de libreria transformers y con el tag peft, lo que indica que el entrenamiento se realizo mediante tecnicas de adaptacion eficiente de parametros (PEFT, probablemente LoRA) y que fue ejecutado a traves de AutoTrain, la herramienta de entrenamiento automatizado de HuggingFace. El modelo esta orientado a generacion de texto conversacional (pipeline text-generation) y usa la plantilla de chat del modelo base.

El modelo base Phi-3-mini es un transformer decoder-only denso de 3.800 millones de parametros con una ventana de contexto nominal de 128.000 tokens, disenado por Microsoft Research para tareas de razonamiento, codigo y comprension del lenguaje en ingles. El repositorio ocupa 7,6 GB y el recuento de parametros declarado en los archivos safetensors es de 3.820.753.920, cifra que coincide practicamente con el tamano completo del modelo base; esto sugiere que el repositorio contiene pesos fusionados o una copia completa del modelo en lugar de unicamente el adaptador, aunque las etiquetas indiquen PEFT. Esta discrepancia es relevante para quien vaya a desplegarlo.

La relevancia de esta ficha es limitada en terminos de impacto: el modelo registra 0 descargas y 0 likes, no incluye informacion sobre el dataset de entrenamiento, no declara idiomas soportados y no publica resultados de benchmarks. Se trata, por tanto, de un experimento de ajuste personal mas que de un modelo listo para produccion, y su evaluacion debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Phi-3-mini, con codigo personalizado en el repositorio) |
| Parametros totales | 3.820.753.920 (segun safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base microsoft/Phi-3-mini-128k-instruct) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors; no se declaran variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo base esta optimizado principalmente para ingles) |
| Licencia | other (heredada de la licencia del modelo base, MIT; el repositorio no especifica terminos propios) |
| Formato de pesos | safetensors (repo de 7,6 GB; incluye tensorboard en los tags) |
| Tipo de ajuste | PEFT (adapter), entrenado con AutoTrain |
| Modelo base | microsoft/Phi-3-mini-128k-instruct |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-3-mini: un transformer decoder-only denso con atencion causal, normalizacion y mecanismos de atencion con consultas agrupadas (GQA) en las capas de atencion, tal como se define en el modelo base de Microsoft. El repositorio incluye el tag custom_code, lo que implica que la carga del modelo requiere `trust_remote_code=True` en transformers y que existe codigo especifico del autor o del pipeline de exportacion que debe ejecutarse.

En cuanto al entrenamiento, la model card se limita a indicar que el modelo fue entrenado con AutoTrain e incluye un ejemplo de uso con `apply_chat_template`. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO o SFT supervisado, ni los hiperparametros del adaptador (rango LoRA, alpha, dropout, target modules). Tampoco se documenta si el adaptador se fusiono con los pesos base. La unica evidencia objetiva disponible es el recuento de parametros safetensors (~3,82 mil millones) y el tamano del repositorio (7,6 GB), compatibles con pesos en precision de 16 bits del modelo completo.

## Capacidades

- Generacion de texto conversacional multi-turno mediante la plantilla de chat del modelo base.
- Razonamiento basico y respuesta a instrucciones, heredados del ajuste instructivo de Phi-3-mini.
- Generacion de codigo y resolucion de problemas matematicos sencillos, capacidad atribuible al modelo base.
- Manejo de contextos muy largos (hasta 128.000 tokens) a nivel arquitectonico, si los pesos mantienen esa configuracion.
- Soporte de tool calling o function calling: no confirmado en la informacion disponible. El modelo base Phi-3-mini no incorpora un formato nativo de function calling, aunque puede emularse mediante prompts.
- Capacidades de agente y razonamiento multi-paso: no confirmadas; no hay evaluaciones ni documentacion al respecto.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas y el modelo base esta centrado en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; no se declaran.
- Cuantizacion lista para usar (GGUF, AWQ, GPTQ): no disponible; habria que generarla a partir de los pesos safetensors.

## Casos de uso

- Prototipado conversacional en ingles: al estar afinado sobre Phi-3-mini-instruct, puede emplearse para validar rapidamente flujos de chat con `apply_chat_template` antes de invertir en un ajuste mas serio.
- Experimentos academicos de PEFT: sirve como ejemplo reproducible de un pipeline AutoTrain sobre un modelo de ~3,8B, util para comparar estrategias de adaptacion.
- Asistente de dominio especifico (si el ajuste se realizo con datos propios del autor): el modelo podria responder con el tono y el vocabulario del dataset de entrenamiento, aunque dicho dataset no se documenta.
- Generacion de texto asistida en local: con 3,8B parametros y cuantizacion de 4 bits puede ejecutarse en una GPU de consumo (por ejemplo, RTX 3060 de 12 GB) para tareas de redaccion o resumen no criticas.
- Base para posteriores ajustes: al ser un adaptador PEFT, puede reutilizarse como punto de partida para nuevos fine-tunings encadenados sobre Phi-3-mini.
- Evaluacion comparativa de adaptadores: util en estudios que midan la degradacion o mejora que introduce un ajuste LoRA sobre el modelo original.
- Generacion de codigo en pipelines internos: solo como borrador asistido, dado que no hay benchmarks que respalden su calidad (HumanEval, MBPP) y que el ajuste podria haber degradado esta capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de evaluacion, ni comparaciones con el modelo base. Tampoco se documentan perdidas de entrenamiento mas alla de la presencia de un directorio de tensorboard en los tags del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,7 GB en FP16, unos 4 GB en cuantizacion INT8 y alrededor de 2,5 GB en INT4 (estimaciones derivadas del recuento de parametros de 3,82 mil millones, no confirmadas por el autor).
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G son suficientes y sobredimensionadas para un modelo de este tamano.
- GPU de consumo: cabe sin problema en RTX 3090, RTX 4090, RTX 4080, RTX 4070 Ti y RTX 3060 de 12 GB (esta ultima en FP16 con margen ajustado, mejor en INT8 o INT4).
- Despliegue con vLLM o TGI: viable en FP16 en GPUs con al menos 12-16 GB de VRAM; requiere revisar el soporte de codigo personalizado y de adaptadores PEFT en la version concreta del servidor.
- Despliegue con llama.cpp u Ollama: posible solo si se genera previamente una cuantizacion GGUF, ya que el repositorio no la incluye.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.
- Nota practica: si el repositorio contiene un adaptador PEFT y no pesos fusionados, sera necesario descargar tambien el modelo base (unos 7,6 GB adicionales en FP16) y cargar el adaptador por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| JobSched/phi-3-adapter-v6 | 3,82B | 128.000 tokens (heredado) | other | HuggingFace, 0 descargas | no disponible |
| microsoft/Phi-3-mini-128k-instruct | 3,8B | 128.000 tokens | MIT | HuggingFace, ampliamente usado | publicado por Microsoft (no incluido aqui) |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | HuggingFace | publicado por Microsoft (no incluido aqui) |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | publicado por Meta (no incluido aqui) |
| Qwen/Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens | Apache 2.0 | HuggingFace | publicado por Alibaba (no incluido aqui) |

Las cifras de los modelos alternativos corresponden a sus especificaciones publicas conocidas; no se dispone de comparaciones de rendimiento directas con el modelo objeto de esta ficha. La diferencia principal frente a las alternativas es que este repositorio es un ajuste derivado sin evaluacion independiente ni garantias de mantenimiento, mientras que los modelos citados cuentan con model cards detalladas, benchmarks publicados y comunidades activas.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento: se desconoce que datos se usaron, su procedencia, su licencia y su posible sesgo.
- Riesgo elevado de alucinacion y de degradacion respecto al modelo base, especialmente si el ajuste se realizo con un conjunto de datos pequeno o poco diverso.
- Sin resultados de benchmarks: no hay evidencia de que el ajuste mejore al modelo original en ninguna tarea; podria incluso empeorarlo.
- Idiomas no declarados: no se garantiza un comportamiento correcto en castellano ni en idiomas distintos del ingles.
- Licencia "other" sin terminos especificos en el repositorio: antes de un uso comercial hay que verificar la licencia del modelo base (MIT) y aclarar la del ajuste, que el autor no detalla.
- Etiqueta peft frente a un recuento de parametros de 3,82B: existe ambiguedad sobre si el repositorio contiene un adaptador o el modelo completo; esto afecta a la forma de cargarlo y al espacio en disco necesario.
- Uso de codigo personalizado (`custom_code`): obliga a ejecutar codigo del repositorio con `trust_remote_code=True`, lo que implica un riesgo de seguridad si no se audita antes.
- Actividad nula en el repositorio (0 descargas, 0 likes) y actualizacion unica el mismo dia de creacion: no hay senales de mantenimiento, soporte ni validacion por parte de la comunidad.
- Sin informacion sobre cuantizaciones ni artefactos de despliegue (GGUF, AWQ, GPTQ): el trabajo de preparacion para produccion recae enteramente en quien lo adopte.
- Contexto de 128.000 tokens heredado del modelo base: no hay confirmacion de que el ajuste preserve el rendimiento en contextos muy largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JobSched/phi-3-adapter-v6
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-128k-instruct
- Documentacion de AutoTrain: https://hf.co/docs/autotrain
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Paper de Phi-3 (informe tecnico de Microsoft): https://arxiv.org/abs/2404.14219
- Repositorio de llama.cpp (para generar cuantizaciones GGUF): https://github.com/ggerganov/llama.cpp
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de text-generation-inference: https://github.com/huggingface/text-generation-inference
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces encontrados correspondian a articulos historicos sin relacion con el mismo.
