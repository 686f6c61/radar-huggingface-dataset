# saidutta69/LFM2.5-230M-heretic

## Resumen

LFM2.5-230M-heretic es una variante «decensored» (abliterated) del modelo LiquidAI/LFM2.5-230M, publicada por el usuario saidutta69 en HuggingFace. El modelo conserva la arquitectura nativa de Liquid AI (LFM2, densa e hibrida conv+attention, 14 capas) y sus 229.693.184 parametros (~230M), pero se le han editado direccionalmente los pesos de atencion y de las proyecciones descendentes del MLP mediante la herramienta Heretic v1.4.0, con el objetivo de suprimir el comportamiento de rechazo sin recurrir a fine-tuning. La model card reporta una caida de rechazos de 95/100 a 10/100 manteniendo una divergencia KL de 0,0548 respecto al modelo original.

El interes de esta ficha reside en su perfil de despliegue: es un modelo de 230M que ocupa menos de 1 GB contando pesos y cache KV en cuantizacion Q4_0, con aproximadamente 32K tokens de contexto utilizable, y que funciona en hardware de gama muy baja (telefono, Raspberry Pi 5, navegador). Segun los datos del autor, alcanza 71,71 en IFEval y 43,26 en BFCLv3, lo que lo situa como un motor de extraccion, enrutado de herramientas y RAG ligero en lugar de un chatbot de razonamiento.

Es relevante ahora porque cubre un nicho muy concreto: inferencia local sin censura en dispositivos donde no cabe nada mas grande. Al mismo tiempo, conviene tratarlo con cautela: es un derivado comunitario (sin validacion oficial de Liquid AI), con solo un punto de partida de 230M parametros, y la propia model card advierte de que no se recomienda para tareas con alta carga de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 densa hibrida (bloques de convolucion + atencion), 14 capas |
| Parametros totales | 229.693.184 (~230M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | aproximadamente 32K tokens (32K utiles en Q4_0, segun la model card) |
| Tipos de cuantizacion | GGUF: F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (14 cuantizaciones + F16); safetensors en BF16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es (10 idiomas) |
| Licencia | lfm-license-1.0 (license: other; enlace a la licencia del modelo original de LiquidAI) |
| Formato de pesos | safetensors (BF16, 0,43 GB) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es LFM2, una arquitectura densa e hibrida que combina bloques de convolucion con bloques de atencion. De las 14 capas totales, la mayoria son bloques convolucionales economicos, lo que hace que el coste de decodificacion dependa mas del ancho de banda de memoria que de la potencia de calculo de la GPU. Segun el autor, esto convierte al modelo en «mas sensible al ancho de banda de decodificacion de lo que sugiere su numero de parametros», por lo que una RAM rapida importa mas que una GPU rapida.

No hay entrenamiento adicional: la intervencion es una ablacion direccional (abliteration) aplicada con Heretic v1.4.0, trial 82 de una ejecucion de 200 trials con semilla 3544511175. Se editan los pesos de `attn.o_proj` (max_weight 1,41 en la posicion 12,31; min_weight 0,94 a distancia 6,61) y de `mlp.down_proj` (max_weight 0,81 en la posicion 9,59; min_weight 0,59 a distancia 4,15), con direction_index 10,25. El objetivo es localizar y modificar las direcciones de peso responsables del rechazo, dejando intacto el resto de la red y, en teoria, las capacidades del modelo base. El repositorio incluye un directorio `reproduce/` con `config.toml`, `requirements.txt`, el diario del estudio de Optuna y sumas SHA-256, de modo que el modelo puede regenerarse bit a bit con `heretic --reproduce reproduce/reproduce.json`.

No se detalla en la informacion disponible la composicion del dataset de entrenamiento del modelo base, ni el numero de tokens, ni si hubo RLHF o DPO. Se sabe que el formato nativo de tool calling es «Pythonico» y que el modelo conserva la cobertura de diez idiomas del original.

## Capacidades

- Generacion de texto conversacional en diez idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues y espanol.
- Seguimiento de instrucciones con un resultado reportado de 71,71 en IFEval, competitivo para su tamano.
- Tool calling / function calling con formato nativo Pythonico, con 43,26 en BFCLv3.
- Enrutado de herramientas y seleccion de funciones en flujos de agente, presumiblemente en esquemas de un solo paso o pocos pasos.
- Extraccion de datos y generacion de salida estructurada (JSON u otros esquemas).
- RAG ligero sobre contexto largo (aproximadamente 32K tokens utiles) en dispositivos con poca memoria.
- Supresion del comportamiento de rechazo: la model card reporta 10 rechazos de 100 en un conjunto de evaluacion de contenido danino, frente a 95 de 100 del modelo original.
- Ejecucion en CPU y en hardware de muy baja capacidad (telefono, Raspberry Pi 5, navegador), con soporte nativo en llama.cpp, LM Studio, Jan, MLX, vLLM y builds de NPU optimizadas con Nexa.
- No se mencionan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode). La model card desaconseja explicitamente el uso en tareas con alta carga de razonamiento.

## Casos de uso

- Extraccion de datos estructurados en el borde: el modelo puede convertir texto no estructurado en JSON u otro esquema con un coste de memoria inferior a 1 GB, lo que permite ejecutarlo en el propio dispositivo de captura sin enviar datos a la nube.
- Enrutado de tool calls en agentes: con 43,26 en BFCLv3, es adecuado para decidir que funcion invocar y con que argumentos dentro de un pipeline mayor, delegando el razonamiento complejo a un modelo superior.
- Asistente de atencion al cliente de primer nivel: gestiona conversaciones multi-turno y clasifica la intencion del usuario antes de escalar a un modelo mayor, con la ventaja de no requerir GPU dedicada.
- RAG sobre documentos locales: indexacion y respuesta sobre manuales, contratos o notas en un portatil de 8 GB, con aproximadamente 32K tokens de contexto y cuantizacion Q8_0 de 0,23 GB.
- Preprocesado y etiquetado multilingue en pipelines IoT: un Raspberry Pi 5 puede procesar texto en diez idiomas a 42 tok/s para clasificacion, resumen corto o normalizacion antes de enviarlo a un sistema central.
- Prototipado offline en navegador o movil: con Q4_K_M (~0,14 GB) cabe en terminales de 4 GB de RAM, lo que permite demos de generacion de texto sin backend.
- Generacion creativa y roleplay sin filtros de rechazo: el modelo esta pensado explicitamente para este escenario, aunque su uso exige asumir la responsabilidad legal y etica sobre el contenido producido.
- Filtrado y moderacion previa: dado que responde sin rechazos en la mayoria de casos, puede emplearse como clasificador de contenido en un sistema de moderacion de dos etapas, siempre que se documente el riesgo de sesgo.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son los siguientes. La model card no ofrece comparacion con modelos de terceros.

| Metrica | LFM2.5-230M-heretic | LiquidAI/LFM2.5-230M |
|---|---|---|
| Divergencia KL | 0,0548 | 0 (por definicion) |
| Rechazos (conjunto de evaluacion danino) | 10/100 | 95/100 |
| IFEval | 71,71 | no disponible |
| BFCLv3 | 43,26 | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, GSM8K, HumanEval ni otros benchmarks estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual. El modelo esta pensado para ejecutarse en RAM o memoria unificada. Pesos por cuantizacion: Q2_K 0,11 GB; Q4_K_M 0,14 GB; Q6_K 0,18 GB; Q8_0 0,23 GB; F16 0,43 GB.
- Modelo completo con cache KV: menos de 1 GB en Q4_0, con aproximadamente 32K tokens de contexto utilizable.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU de telefono, Raspberry Pi 5 (4 GB) y Apple Silicon. En caso de usar GPU, cualquier acelerador moderno es sobredimensionado para el modelo; el cuello de botella es el ancho de banda de memoria, no el computo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en iGPU y NPU. La model card menciona builds optimizadas para NPU con Nexa.
- Opciones de despliegue: llama.cpp (soporte upstream nativo de la arquitectura `lfm2`), LM Studio, Jan, MLX, vLLM, transformers y builds de NPU de Nexa. Arranque rapido: `llama serve -hf saidutta69/LFM2.5-230M-heretic`.
- Throughput reportado: 213 tok/s en un Galaxy S25 Ultra y 42 tok/s en un Raspberry Pi 5.
- Latencia: no disponible de forma explicita; se puede inferir un perfil de baja latencia por el tamano, pero no hay mediciones de TTFT publicadas.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base. No se proporcionan datos verificados de alternativas de terceros en el mismo rango de tamano.

| Modelo | Parametros | Contexto | IFEval | BFCLv3 | Licencia | Formatos |
|---|---|---|---|---|---|---|
| saidutta69/LFM2.5-230M-heretic | 229.693.184 | ~32K | 71,71 | 43,26 | lfm-license-1.0 | safetensors, GGUF |
| LiquidAI/LFM2.5-230M (base) | 229.693.184 | no disponible en la informacion | no disponible | no disponible | lfm-license-1.0 | safetensors, GGUF (original) |
| Otras alternativas de ~230M | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un derivado comunitario, no un modelo oficial de Liquid AI. No cuenta con validacion, soporte ni garantias del fabricante del modelo base.
- La ablacion no elimina por completo el comportamiento de rechazo: quedan 10 rechazos de 100 en el conjunto de evaluacion del autor, cifra que el propio autor califica de alta en comparacion con modelos mayores de la misma coleccion.
- La edicion de pesos introduce una divergencia KL de 0,0548 respecto al modelo original. El autor advierte explicitamente de que la cifra de KL debe leerse junto al recuento de rechazos y nunca de forma aislada; la abliteration puede degradar la coherencia.
- Modelo decensored: puede generar contenido que el modelo base rechazaria. El despliegue en produccion exige controles adicionales de moderacion y una evaluacion legal segun la jurisdiccion.
- Limitacion de razonamiento: la model card indica que Liquid no recomienda este nivel de tamano para tareas con carga de razonamiento alta. Debe tratarse como motor de extraccion y enrutado, no como chatbot generalista.
- Riesgo elevado de alucinacion por el reducido numero de parametros (230M). Las salidas estructuradas deben validarse con un esquema antes de consumirse.
- Contexto largo nominal (~32K) en un modelo muy pequeno: la calidad efectiva en contextos extensos no esta respaldada por benchmarks publicados en la informacion disponible.
- Licencia lfm-license-1.0: es necesario revisar los terminos exactos para uso comercial antes de desplegar el modelo, ya que se trata de una licencia propia y no de una licencia abierta estandar.
- Validacion comunitaria muy limitada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificacion independiente.
- El modelo puede presentar sesgos heredados del modelo base y del corpus de entrenamiento, agravados por la supresion de rechazos, que puede eliminar barreras frente a contenido estereotipado o danino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/LFM2.5-230M-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Licencia lfm-license-1.0: https://huggingface.co/LiquidAI/LFM2.5-230M/blob/main/LICENSE
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Articulo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp

La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utilizables son los procedentes de la model card y del repositorio de HuggingFace.
