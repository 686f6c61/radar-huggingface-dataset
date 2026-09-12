# leomaurodesenv/bert-base-uncased-trustairlab-jailbreak-augmented

## Resumen

`leomaurodesenv/bert-base-uncased-trustairlab-jailbreak-augmented` es un clasificador de texto obtenido por ajuste fino (fine-tuning) de `google-bert/bert-base-uncased` sobre un conjunto de datos no documentado, orientado a la detección de intentos de jailbreak en prompts. Lo publica el usuario leomaurodesenv como parte del ecosistema TrustAIRLab, un grupo de trabajo académico centrado en la evaluación de riesgos en IA, y se distribuye con licencia Apache 2.0.

El modelo resuelve una tarea concreta de moderación: dada una entrada de texto, asignar una etiqueta binaria que indique si el prompt intenta eludir las salvaguardas de un modelo generativo. Con 109.483.778 parámetros (BERT-base, 12 capas, 768 de dimensión oculta), es lo bastante pequeno para ejecutarse en CPU o en cualquier GPU de consumo con latencia de milisegundos, lo que lo hace apto como filtro previo en pipelines de seguridad.

Su relevancia actual es práctica: la detección de jailbreaks se ha convertido en una capa estándar en despliegues de LLM en producción, y un clasificador de 110 M de parámetros es mucho más barato de operar que un modelo guard de mayor tamano. Ahora bien, la model card está generada automáticamente y no documenta el dataset, los idiomas ni las limitaciones, por lo que debe tratarse como un artefacto experimental: el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), text-classification |
| Parametros totales | 109.483.778 (safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo de BERT-base-uncased; no confirmado explicitamente por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (el modelo base es de vocabulario y entrenamiento en ingles, con tokenizacion uncased) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); repo de 0.9 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional estandar de tipo BERT-base: 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, al que se anade una cabeza de clasificacion de secuencia para la tarea de deteccion de jailbreak. Al partir de `google-bert/bert-base-uncased`, hereda la tokenizacion WordPiece con paso a minusculas y un limite duro de 512 tokens por secuencia, sin embeddings posicionales extensibles ni atencion lineal.

El procedimiento de entrenamiento esta documentado en la model card: 10 epocas con learning rate 2e-05, scheduler lineal con 50 pasos de warmup, AdamW fused (`betas=(0.9, 0.999)`, `epsilon=1e-08`), `train_batch_size` 8, `gradient_accumulation_steps` 2 (batch efectivo 16), `eval_batch_size` 8 y semilla 42. El optimizador, el scheduler y el numero de epocas coinciden con el patron habitual de las recetas de clasificacion de texto, pero no hay informacion sobre el dataset, su composicion, su tamano ni si hubo aumentacion de datos (el sufijo "augmented" del nombre sugiere que si, aunque no se detalla en ningun sitio). Tampoco se documenta ningun tipo de RLHF, DPO ni decodificacion especulativa, algo que no aplica a un modelo discriminativo de este tipo.

| Epoca | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1.0 | 605 | 0.2661 | 0.2187 | 0.9400 |
| 2.0 | 1210 | 0.1229 | 0.1819 | 0.9400 |
| 3.0 | 1815 | 0.2125 | 0.2003 | 0.9417 |
| 4.0 | 2420 | 0.1114 | 0.2431 | 0.9425 |
| 5.0 | 3025 | 0.0508 | 0.3173 | 0.9379 |

Entorno declarado: Transformers 5.2.0, PyTorch 2.10.0+cu128, Datasets 4.5.0, Tokenizers 0.22.2.

## Capacidades

- Clasificacion de texto binaria (o multiclase, segun la cabeza entrenada) orientada a la deteccion de prompts de jailbreak.
- Puntuacion de riesgo por prompt individual, util como filtro previo a un LLM generativo.
- Procesamiento por lotes de secuencias de hasta 512 tokens, apto para moderacion de alto volumen.
- Compatible con la libreria `transformers` mediante `pipeline("text-classification")`.
- Etiquetado como `text-embeddings-inference` y `endpoints_compatible`, por lo que puede servirse con Text Embeddings Inference y desplegarse en Hugging Face Inference Endpoints.
- No soporta generacion de texto, razonamiento multi-paso, tool calling ni uso como agente: es un cabezal discriminativo, no un modelo generativo.
- No se documentan capacidades multilingues, de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Filtro de entrada en un asistente conversacional: cada mensaje del usuario se clasifica antes de llegar al LLM; si se detecta un intento de jailbreak, se bloquea o se redirige a un flujo de respuesta segura. Su latencia de milisegundos no degrada la experiencia.
- Moderacion de contenido en plataformas comunitarias: procesar en lote los mensajes publicados y marcar automaticamente los que intentan manipular sistemas automatizados presentes en la plataforma.
- Red teaming automatizado: usar el clasificador como oraculo rapido para medir la tasa de exito de un corpus de prompts adversariales antes de desplegar un modelo generativo nuevo.
- Monitorizacion continua en produccion: registrar la proporcion de prompts marcados por usuario o por franja horaria para detectar campanas coordinadas de abuso.
- Filtro de bajo coste delante de un modelo guard grande: descartar primero los casos evidentemente benignos con este BERT de 110 M de parametros y reservar el modelo mayor solo para los casos dudosos, reduciendo el coste de inferencia.
- Investigacion academica sobre robustez de clasificadores: sirve como linea base reproducible para comparar estrategias de aumento de datos frente a jailbreaks, dado que el autor publica la receta de entrenamiento completa.
- Analisis de datasets historicos: clasificar retroactivamente grandes volumenes de conversaciones ya almacenadas para cuantificar la prevalencia de intentos de manipulacion.

## Benchmarks y rendimiento

El `model-index` de la model card declara la entrada `bert-base-uncased-trustairlab-jailbreak` con un array de resultados vacio, por lo que no hay benchmarks publicados (MMLU, HumanEval, GSM8K o equivalentes no aplican a este tipo de modelo). Los unicos numeros disponibles son los de evaluacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Accuracy (evaluacion final reportada) | 0,9404 |
| Loss (evaluacion final reportada) | 0,1821 |
| Mejor accuracy por epoca (epoca 4) | 0,9425 |
| Validation loss minima por epoca (epoca 2) | 0,1819 |

No se especifica sobre que conjunto de evaluacion se calcularon estas cifras, ni su tamano, ni la distribucion de clases, ni si el conjunto de validacion es independiente del de entrenamiento. No se han publicado resultados de benchmarks en la informacion disponible mas alla de estos.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,45 GB solo para pesos (109,5 M de parametros x 4 bytes), mas activaciones; en la practica cabe en menos de 1 GB con batch 1 y secuencias de 512 tokens.
- VRAM estimada en fp16 o bfloat16: aproximadamente 0,22 GB de pesos, con un consumo total por debajo de 1 GB.
- Cabe sin problema en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090 y similares, e incluso en CPU con throughput aceptable para moderacion en linea.
- GPU recomendadas para despliegue de alto volumen: NVIDIA T4, L4, A10G, A100 o H100, donde el cuello de botella sera la red y el preprocesado, no el calculo.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (etiqueta oficial del repo), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportacion a ONNX Runtime o TorchScript, y servidores genericos de clasificacion. No se documenta soporte de vLLM ni llama.cpp, y al no existir pesos GGUF publicados no es directamente ejecutable con Ollama.
- Latencia y throughput: no medidos ni publicados por el autor. Para un encoder de 110 M de parametros en una GPU moderna se espera un throughput del orden de miles de secuencias cortas por segundo con batches grandes, pero es una estimacion orientativa, no un dato verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-base-uncased-trustairlab-jailbreak-augmented | 109,5 M | 512 tokens | Deteccion de jailbreak | Apache 2.0 | Hugging Face, 0 descargas |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base preentrenado (enmascarado + NSP) | Apache 2.0 | Hugging Face, ampliamente usado |
| ProtectAI deberta-v3-base-prompt-injection | no disponible en esta ficha | no disponible | Deteccion de inyeccion de prompt | no disponible en esta ficha | Hugging Face |
| meta-llama/Prompt-Guard-86M | 86 M (segun el nombre del repositorio) | no disponible | Deteccion de jailbreak e inyeccion de prompt | no disponible en esta ficha | Hugging Face |

Los dos ultimos se incluyen como referencia de categoria (clasificadores de seguridad de prompts de tamano pequeno), pero sus cifras no han sido verificadas en la informacion disponible de esta busqueda, por lo que no se comparan numericamente. Frente al BERT-base original, la unica diferencia medible es el ajuste fino para la tarea: mismos parametros, mismo contexto y misma licencia.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset" y "More information needed" en descripcion, usos previstos y datos de entrenamiento. No se puede evaluar la representatividad ni la cobertura de ataques del conjunto.
- El autor no declara idiomas soportados. Al derivar de `bert-base-uncased`, el vocabulario y el entrenamiento original estan orientados al ingles, por lo que el rendimiento fuera de ese idioma es impredecible.
- Tokens de 512 como maximo: prompts largos se truncan, y los ataques distribuyen a menudo la instruccion maliciosa al final del texto, lo que puede provocar falsos negativos.
- Riesgo de falsos positivos en contenido legitimo que mencione seguridad, pentesting o investigacion sobre IA, y de falsos negativos ante ataques nuevos no vistos en el conjunto de entrenamiento.
- La tokenizacion uncased elimina la distincion entre mayusculas y minusculas, lo que puede difuminar senales relevantes en ataques que explotan el formato.
- Las cifras de accuracy (0,9404) proceden de un conjunto de evaluacion no descrito: no hay garantia de que reflejen el rendimiento en dominios reales ni de que esten libres de fuga entre entrenamiento y validacion.
- La validation loss deja de mejorar a partir de la epoca 2 y sube hasta 0,3173 en la epoca 5, con training loss descendiendo a 0,0508: hay indicios claros de sobreajuste, por lo que conviene verificar que checkpoint se publico.
- Modelo sin validacion externa: 0 descargas y 0 likes. No hay evidencia de uso en produccion ni auditoria independiente.
- Licencia Apache 2.0, que permite uso comercial, pero al derivar del BERT-base de Google conviene revisar las condiciones del modelo base y, sobre todo, no presentar el modelo como sistema de seguridad infalible: debe combinarse con otras capas de defensa.
- Un clasificador de este tipo no debe ser la unica defensa frente a jailbreaks; los ataques por sufijos optimizados, codificaciones multiples o cambio de idioma suelen evadirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leomaurodesenv/bert-base-uncased-trustairlab-jailbreak-augmented
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes sobre este modelo ni sobre TrustAIRLab; las URLs devueltas corresponden a paginas de soporte de Microsoft y no guardan relacion con el modelo. No se dispone de paper, blog, repositorio ni demo adicionales verificables.
