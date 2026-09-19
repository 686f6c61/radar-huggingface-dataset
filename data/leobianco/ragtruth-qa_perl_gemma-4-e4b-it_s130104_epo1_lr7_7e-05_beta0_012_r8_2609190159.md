# leobianco/ragtruth-qa_PERL_gemma-4-E4B-it_S130104_epo1_lr7_7e-05_beta0_012_r8_2609190159

## Resumen

Este modelo es un ajuste fino (fine-tune) de `google/gemma-4-E4B-it` publicado por el usuario leobianco en HuggingFace. Se ha entrenado con TRL 1.9.2 mediante RLOO (REINFORCE Leave-One-Out), el metodo de optimizacion por refuerzo presentado en el articulo "Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs" (Ahmadian et al., ACL 2024). El identificador del repositorio codifica los hiperparametros del experimento: 1 epoca, learning rate 7e-05, coeficiente beta 0.012, rank 8 y una semilla/fecha (S130104, 2609190159), ademas del prefijo del dataset de entrenamiento (`ragtruth-qa`).

El problema que aborda, a juzgar por el nombre del dataset (`ragtruth-qa_PERL`), es el ajuste de un modelo instruct para tareas de pregunta-respuesta con contexto recuperado (RAG) y posiblemente para reducir la alucinacion sobre dicho contexto, aunque la model card no documenta explicitamente el objetivo ni la composicion de los datos. El sufijo "PERL" y la estructura del nombre sugieren un experimento academico dentro de una campana de barrido de hiperparametros, no un modelo destinado a produccion.

La relevancia de esta ficha es limitada y conviene ser franco: el repositorio no documenta arquitectura, tamano, contexto, idiomas ni licencia, y registra 0 descargas y 0 likes en el momento de la consulta. Toda la informacion tecnica disponible se reduce a la procedencia (Gemma instruct como base), el metodo de alineamiento (RLOO via TRL) y las versiones de framework utilizadas. Cualquier dato de capacidades, benchmarks o rendimiento debe considerarse no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; heredada de `google/gemma-4-E4B-it` (familia Gemma, transformer decoder-only, sin confirmar en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin GGUF, AWQ, GPTQ ni versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | campo declarado como `license` (placeholder) en la model card; no se especifica licencia concreta |
| Formato de pesos | safetensors (etiqueta `safetensors` en HuggingFace) |
| Modelo base | google/gemma-4-E4B-it (relacion `finetune`) |
| Metodo de entrenamiento | RLOO (REINFORCE Leave-One-Out) con TRL |
| Dataset de entrenamiento | referenciado por nombre como `ragtruth-qa_PERL`; sin documentacion en la model card |
| Versiones de framework | TRL 1.9.2, Transformers 5.14.1, PyTorch 2.11.0, Datasets 5.0.1, Tokenizers 0.22.2 |
| Tamano del repositorio | 0.0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19T01:59:43Z |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo resultante. Lo unico verificable es que se trata de un ajuste fino del modelo instruct `google/gemma-4-E4B-it`, por lo que la arquitectura subyacente (numero de capas, atencion, dimensiones, vocabulario, multimodalidad) es la del modelo base y no aparece detallada en la informacion proporcionada. La nomenclatura "E4B" de la familia Gemma sugiere un modelo de tamano efectivo en torno a 4.000 millones de parametros, pero este dato no se confirma en la documentacion disponible y no debe tomarse como especificacion oficial.

En cuanto al entrenamiento, el autor indica que se utilizo RLOO, un metodo de optimizacion estilo REINFORCE con estimador leave-one-out para reducir la varianza del gradiente en el aprendizaje a partir de retroalimentacion, tal como se describe en el articulo de Ahmadian et al. (ACL 2024). El pipeline se implemento con la libreria TRL, cuyo modo RLOO se apoya en un modelo de recompensa o en una funcion de recompensa externa; la model card no especifica cual se empleo, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo una fase previa de SFT/DPO. El identificador del experimento registra 1 epoca, learning rate 7,7e-05, beta 0,012 y rank 8, valores coherentes con una configuracion de RLHF/RLOO de baja intensidad sobre el modelo ya alineado. Existe un enlace publico al run de Weights & Biases asociado.

## Capacidades

- Generacion de texto conversacional en formato instruct: la model card incluye un ejemplo funcional con `transformers.pipeline("text-generation")` sobre una lista de mensajes con rol `user`, lo que confirma el formato de chat.
- Ajuste orientado a pregunta-respuesta sobre contexto: el nombre del dataset (`ragtruth-qa`) apunta a tareas de QA fundamentado en evidencia recuperada y, posiblemente, a la deteccion o mitigacion de alucinaciones; esta capacidad es una inferencia a partir de la nomenclatura, no una afirmacion del autor.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara ningun idioma).
- Vision, audio u otras modalidades: no disponible, a pesar de que el nombre del modelo base pertenece a una familia que historicamente ha incluido variantes multimodales.
- Modo "thinking" o decodificacion extendida: no disponible.

## Casos de uso

- Experimentacion academica con RLOO: el caso de uso principal y mas realista es reproducir o comparar el efecto de RLOO sobre un modelo instruct de la familia Gemma. El identificador incluye todos los hiperparametros, lo que facilita el analisis de ablaciones dentro de la campana de barrido del autor.
- Investigacion sobre fidelidad a la evidencia en RAG: si el dataset `ragtruth-qa` sigue la estela del corpus RAGTruth (deteccion de alucinaciones en respuestas generadas con contexto), el modelo puede emplearse como linea base para estudiar si el entrenamiento por refuerzo reduce la generacion de contenido no respaldado por el contexto recuperado.
- Evaluacion de metodos de alineamiento: util como punto de comparacion frente a variantes entrenadas con DPO, PPO u otros valores de beta y learning rate dentro del mismo estudio, siempre que se disponga de esos otros checkpoints.
- Base para prototipos de QA documental: un desarrollador podria cargarlo con `transformers` para responder preguntas sobre fragmentos de documentacion, aceptando que no hay garantias de calidad ni datos de evaluacion publicados.
- Analisis de artefactos de entrenamiento: el repositorio es un ejemplo util para estudiar como se registran los runs de TRL y Weights & Biases, y que metadatos conviene documentar en una model card.
- Docencia y formacion: sirve como caso practico de modelo "generated_from_trainer" con licencia sin especificar y cero traccion, util para ilustrar los riesgos de publicar checkpoints sin documentacion tecnica.

No se recomienda su uso en produccion sin una evaluacion previa propia, dado que no existe ninguna metrica publicada ni documentacion de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra) y tampoco se aportan curvas de recompensa o perdida mas alla del enlace al run de Weights & Biases.

## Requisitos de hardware

- VRAM para inferencia en precision completa: no disponible. Como referencia orientativa, un transformer decoder-only de ~4.000 millones de parametros en bf16 ocupa aproximadamente 8-9 GB solo en pesos, mas el coste de cache KV; esta cifra es una estimacion general y no esta confirmada para este checkpoint.
- VRAM en cuantizacion de 8 bits: del orden de 5-6 GB en el mismo supuesto de ~4B parametros (estimacion, no verificada).
- VRAM en cuantizacion de 4 bits: del orden de 3-4 GB en el mismo supuesto (estimacion, no verificada).
- GPU recomendadas: no disponibles. Para un modelo de ese orden de magnitud, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) serian suficientes en bf16, y una GPU de 8-12 GB bastaria con cuantizacion. Repetimos que se trata de extrapolaciones a partir del tamano nominal, no de datos del autor.
- Compatibilidad con GPU de consumo: probable en tarjetas de 8 GB o mas con cuantizacion, segun el mismo supuesto, siempre que se genere una version GGUF, que el repositorio no incluye.
- Opciones de despliegue: el repositorio esta etiquetado como `endpoints_compatible`, por lo que es desplegable mediante HuggingFace Inference Endpoints con la libreria `transformers`. vLLM, TGI, llama.cpp u Ollama no estan confirmados y requieren conversion o soporte especifico del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas comparables dentro de la informacion proporcionada. La unica comparacion que puede establecerse con rigor es contra el propio modelo base.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leobianco/ragtruth-qa_PERL_..._r8_2609190159` | objeto de esta ficha | no disponible | no disponible | placeholder `license` | publico, 0 descargas, 0 likes |
| `google/gemma-4-E4B-it` | modelo base | no disponible en esta informacion | no disponible | no disponible en esta informacion | publico en HuggingFace |
| Otras variantes de la misma campana PERL | no localizadas en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se han identificado en el material facilitado otros fine-tunes comparables (mismo tamano, mismo dataset o mismo metodo RLOO) con datos publicos que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card no declara arquitectura, parametros, contexto, idiomas, licencia ni composicion del dataset. Evaluar el modelo sin inspeccionar los pesos es practicamente imposible.
- Licencia sin especificar: el campo aparece como `license` (un placeholder de plantilla). No se puede confirmar que el uso comercial este permitido ni que se hereden los terminos de la licencia de Gemma, por lo que no debe utilizarse en produccion ni redistribuirse sin aclarar este punto con el autor.
- Riesgo de alucinacion: si el objetivo del entrenamiento era mejorar la fidelidad al contexto en tareas RAG, la propia naturaleza del problema implica que persiste el riesgo de generar afirmaciones no respaldadas por la evidencia. No hay metricas que cuantifiquen esta mejora.
- Sesgos: no documentados. Al ser un ajuste fino de un modelo instruct de gran difusion, es probable que herede los sesgos del modelo base, pero no hay evaluacion disponible.
- Cobertura idiomatica desconocida: no se declara ningun idioma. El ejemplo de la model card esta en ingles, pero no puede asumirse un comportamiento equivalente en castellano sin pruebas.
- Repositorio de 0.0 GB: el tamano reportado por HuggingFace sugiere que los pesos podrian no estar subidos o que la medicion esta redondeada a cero. Conviene verificar la pestana "Files and versions" antes de intentar cargar el modelo.
- Cero adopcion: 0 descargas y 0 likes implican que practicamente no existe validacion externa, ni issues resueltas, ni reportes de comportamiento en produccion.
- Fecha de creacion futura respecto a la consulta (2026-09-19): conviene tratar los metadatos temporales con cautela.
- Resultados de la busqueda web no relacionados: las consultas realizadas devolvieron exclusivamente contenidos deportivos (Los Angeles Lakers), sin ninguna fuente tecnica util sobre este modelo. No se ha podido contrastar informacion con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leobianco/ragtruth-qa_PERL_gemma-4-E4B-it_S130104_epo1_lr7_7e-05_beta0_012_r8_2609190159
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Run de entrenamiento en Weights & Biases: https://wandb.ai/leobianco-universit-paris-saclay/new_perl/runs/b3257z1l
- Articulo de RLOO (ACL 2024): https://huggingface.co/papers/2402.14740
- Repositorio de TRL: https://github.com/huggingface/trl
- Perfil del autor: https://huggingface.co/leobianco
