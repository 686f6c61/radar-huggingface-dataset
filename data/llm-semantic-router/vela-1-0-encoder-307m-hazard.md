# llm-semantic-router/Vela-1.0-Encoder-307M-Hazard

## Resumen

Vela-1.0-Encoder-307M-Hazard es un clasificador de texto desarrollado por el equipo de vLLM Semantic Router (organizacion `llm-semantic-router` en HuggingFace). Se trata de un ajuste fino (finetune) del encoder `llm-semantic-router/Vela-1.0-Encoder-307M`, orientado a la evaluacion de riesgo de contenido: devuelve 12 puntuaciones de riesgo independientes, de modo que varias categorias pueden activarse simultaneamente sobre el mismo texto.

El modelo tiene 307.539.468 parametros y esta construido sobre arquitectura ModernBERT, un encoder transformer bidireccional con atencion alterna local/global y soporte de contextos largos. La model card declara una capacidad de entrada de 32.768 tokens, incluyendo tokens especiales, muy por encima de los clasificadores de seguridad habituales, que suelen limitarse a 2.048 o 8.192 tokens.

Su relevancia practica esta en el enrutado semantico y el filtrado de contenido en produccion: al ser un encoder de 307M, el coste de inferencia es una fraccion del de un modelo generativo de seguridad basado en LLM, lo que permite aplicar la politica de ventanas deslizantes (2.048 tokens por ventana, paso de 1.023 tokens de contenido, maximo por categoria y umbrales guardados en `operating_point.json`) sobre documentos largos sin recurrir a un modelo grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) |
| Parametros totales | 307.539.468 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens de entrada, incluyendo tokens especiales |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Modelo base | llm-semantic-router/Vela-1.0-Encoder-307M (relacion: finetune) |
| Cabezas de salida | 12 puntuaciones de riesgo independientes (activacion sigmoide) |
| Tamano del repositorio | 1,3 GB |
| Libreria | transformers (probado con 4.57.6 y 5.17.0) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT, una familia de encoders que moderniza el diseno de BERT con RoPE (rotary positional embeddings), normalizacion previa y no aprendible, atencion alterna entre capas locales (ventana corta) y globales, y kernels optimizados para secuencias largas. El modelo parte del checkpoint `Vela-1.0-Encoder-307M` y se ha ajustado como clasificador multilabel: la salida son 12 logits independientes sobre los que se aplica sigmoide, no softmax, de forma que las categorias de riesgo no compiten entre si.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se especifica la lista de las 12 categorias de riesgo, aunque el nombre del modelo (`Hazard`) y la etiqueta `content-safety` indican que cubre riesgos de contenido. El elemento diferenciador documentado es la politica operativa para textos largos: ventanas de 2.048 tokens con paso de 1.023 tokens de contenido (solapamiento de 1.025 tokens contando los especiales), agregacion mediante el maximo de las puntuaciones sigmoides por categoria y aplicacion posterior de los umbrales almacenados en `operating_point.json`.

## Capacidades

- Clasificacion de riesgo de contenido multilabel: emite 12 puntuaciones independientes por texto, sin forzar exclusividad entre categorias.
- Procesamiento de entradas largas de hasta 32.768 tokens en una sola pasada.
- Evaluacion por ventanas deslizantes con agregacion configurable, pensada para documentos, hilos de conversacion o logs extensos.
- Puntuaciones calibradas contra umbrales precalculados (`operating_point.json`), lo que permite fijar puntos de operacion distintos segun la sensibilidad requerida.
- Integracion con `transformers.pipeline("text-classification")` aplicando `function_to_apply="sigmoid"`.
- Compatibilidad declarada con Text Embeddings Inference (TEI) y con endpoints de HuggingFace (`endpoints_compatible`).
- Uso como componente de enrutado semantico dentro del proyecto vLLM Semantic Router.
- No es un modelo generativo: no produce texto, no soporta tool calling, no tiene modo de razonamiento explicito ni capacidades de vision o audio.
- Soporte multilingue: no disponible (no se declaran idiomas en la model card ni en la ficha de HuggingFace).

## Casos de uso

- Moderacion de foros y comunidades: el modelo puntua cada mensaje o hilo completo contra 12 categorias de riesgo, permitiendo aplicar acciones graduadas (ocultar, revisar, bloquear) segun el umbral configurado en `operating_point.json`.
- Filtrado previo en pipelines de generacion: colocado antes de un LLM generativo, descarta o marca peticiones de riesgo con un coste de 307M parametros en lugar de invocar un modelo de seguridad de miles de millones de parametros.
- Enrutado semantico en pasarelas de inferencia: como clasificador auxiliar en vLLM Semantic Router para decidir a que modelo o politica se dirige cada peticion en funcion del riesgo detectado.
- Revision de conversaciones multi-turno largas: gracias a la ventana de 32.768 tokens y a la politica de ventanas de 2.048 con paso de 1.023, se puede analizar un historial completo sin truncar el contexto.
- Cumplimiento normativo y auditoria: procesamiento por lotes de corpus documentales para etiquetar contenido sensible y generar informes de riesgo por categoria, aprovechando que las puntuaciones son independientes y no excluyentes.
- Prevencion de abuso en plataformas de atencion al cliente: analisis en tiempo real de transcripciones de chat o correo electronico para elevar alertas cuando se superan umbrales de riesgo.
- Clasificacion de contenido generado por usuarios en aplicaciones UGC: integracion como servicio HTTP (TEI o endpoint compatible) que devuelve las 12 puntuaciones y deja la logica de decision al cliente.
- Construccion de datasets etiquetados: uso del modelo como etiquetador automatico para preanotar grandes volumenes de texto y reducir el esfuerzo de anotacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, AUC ni comparaciones numericas contra otros clasificadores de seguridad. Las busquedas web realizadas no devolvieron resultados especificos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 1,23 GB en FP32, 0,62 GB en FP16/BF16, 0,31 GB en INT8 y 0,16 GB en INT4. Hay que anadir memoria para activaciones, que crece con la longitud de secuencia.
- Con la ventana operativa recomendada de 2.048 tokens, el consumo total en FP16 se mantiene holgadamente por debajo de 2 GB, descontando overhead del runtime.
- Procesamiento en una sola pasada de los 32.768 tokens completos: la memoria de activaciones aumenta de forma apreciable; se recomienda evaluar en la GPU objetivo antes de fijar el lote.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para la ventana de 2.048 tokens (RTX 3060, RTX 4060, T4, L4). Para lotes grandes o secuencias de 32.768 tokens, se recomienda A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo con 4 GB o mas; tambien es viable en CPU para cargas de bajo volumen.
- Opciones de despliegue: `transformers` con `pipeline` (requiere 4.57.6 o 5.17.0), Text Embeddings Inference (etiqueta declarada), endpoints de HuggingFace (etiqueta `endpoints_compatible`). El soporte de vLLM, llama.cpp, Ollama, TGI u ONNX Runtime no esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Hazard | 307.539.468 | 32.768 tokens | Encoder ModernBERT, clasificacion multilabel de 12 categorias | Apache 2.0 | no disponible |
| Llama Guard 3 8B (Meta) | 8.000 millones (aprox.) | no disponible | LLM generativo de moderacion | Llama 3.1 Community License | no disponible |
| ShieldGemma 2B (Google) | 2.000 millones (aprox.) | no disponible | LLM generativo de moderacion | Gemma Terms of Use | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de Vela Hazard frente a estas alternativas. La diferencia estructural principal es el orden de magnitud en numero de parametros: Vela Hazard es un encoder de 307M, mientras que las alternativas citadas son modelos generativos de 2.000 a 8.000 millones de parametros, con costes de inferencia sensiblemente mayores.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo ni de equidad; se desconoce el comportamiento diferencial por idioma, registro o variedad dialectal.
- Al ser un clasificador, el riesgo no es de alucinacion de texto, sino de falsos positivos y falsos negativos en la deteccion de riesgo. La model card no documenta tasas de error.
- Los umbrales de decision no vienen fijados en el modelo: dependen de `operating_point.json`. Usar un umbral distinto sin recalibrar invalida el punto de operacion previsto por el autor.
- Es obligatorio usar activacion sigmoide independiente; aplicar softmax produciria resultados incorrectos porque las categorias no son mutuamente excluyentes.
- La lista completa de las 12 categorias de riesgo no esta documentada en la informacion disponible, lo que dificulta mapear las salidas a una taxonomia propia.
- Los idiomas soportados no estan declarados. No hay garantia de funcionamiento fuera del idioma o idiomas de entrenamiento, que tampoco se especifican.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar el aviso de licencia y el fichero NOTICE si existe. No se declaran restricciones adicionales de uso aceptable en la informacion disponible.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, publicado el 13 de septiembre de 2026: no existe aun validacion independiente por parte de la comunidad.
- El repositorio ocupa 1,3 GB, coherente con pesos en precision completa; conviene convertir a FP16 o INT8 para despliegues con restricciones de memoria.
- No es un modelo generativo, por lo que no puede sustituir a un LLM en tareas de respuesta; su funcion es exclusivamente de clasificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Hazard
- Modelo base: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- Coleccion de modelos Vela: https://huggingface.co/collections/llm-semantic-router/vela-10-router-models-6aa555ba70cc6997d6d67798
- Documentacion del proyecto: https://vllm-sr.ai/
- Blog del proyecto: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Canal de Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
- Fichero de punto de operacion: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Hazard/blob/main/operating_point.json
