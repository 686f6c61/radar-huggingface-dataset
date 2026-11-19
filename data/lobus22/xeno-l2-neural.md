# Lobus22/Xeno-L2-neural

## Resumen

Xeno-L2-neural es un modelo de generacion de texto de 1.130.465.280 parametros publicado por el usuario Lobus22 en Hugging Face. Se presenta como un modelo entrenado "from scratch" (desde cero, sin partir de pesos preentrenados de terceros) con una arquitectura de estilo Llama, y su entrenamiento se realizo integramente en CPU sobre un corpus de 375.552 tokens en indonesio. Es, por tanto, un experimento de escala muy reducida tanto en datos como en infraestructura, mas cercano a una prueba de concepto que a un modelo de proposito general.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors, con la libreria transformers y compatible con text-generation-inference y endpoints. El repositorio ocupa 4,5 GB, lo que es coherente con pesos en precision alta (fp32) para su numero de parametros. Su unico idioma declarado es el indonesio (`id`), y no se han publicado resultados de benchmarks ni detalles sobre la composicion del dataset mas alla del recuento de tokens.

Su relevancia practica es limitada: con 375.552 tokens de entrenamiento (muy por debajo de los miles de millones habituales incluso en modelos pequenos) y sin datos de evaluacion, no es un candidato razonable para produccion. Resulta interesante como ejemplo reproducible de entrenamiento desde cero en CPU y como banco de pruebas de plantillas de chat y pipelines de transformers, pero no como alternativa a modelos preentrenados del mismo orden de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (según tags del autor: "llama-style") |
| Parametros totales | 1.130.465.280 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | indonesio (`id`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El autor describe el modelo como "llama-style", es decir, un transformer decoder-only con la estructura habitual de Llama (atención causal, normalizacion y capas feed-forward estandar), aunque no se detallan numero de capas, dimensiones ocultas, cabezas de atencion ni funcion de activacion. Tampoco se especifica la longitud de contexto nativa ni si se aplico RoPE con algun factor de escalado. Los tags indican "from-scratch", lo que implica inicializacion aleatoria de pesos y entrenamiento completo, sin destilacion ni fine-tuning sobre un modelo base.

El dato mas relevante del entrenamiento es su escala: 375.552 tokens en indonesio, procesados integramente en CPU. No se menciona el numero de epocas, la composicion del corpus, el uso de RLHF, DPO o cualquier etapa de alineacion, ni tecnicas de optimizacion como decodificacion especulativa o atencion lineal. Con ese volumen de datos, el modelo solo puede haber memorizado parcialmente patrones superficiales del corpus; no cabe esperar conocimiento factual ni capacidad de razonamiento general. La model card incluye una plantilla de chat propia con delimitadores `<//user//>`, `<||>` y `<//assistant//>`, lo que sugiere que el entrenamiento incorporo algun formato conversacional, aunque no se detalla como se construyeron esos pares.

## Capacidades

- Generacion de texto autoregresiva basica en indonesio, limitada al dominio y estilo del corpus de 375.552 tokens.
- Conversacion con plantilla de chat propia (delimitadores `<//user//>`, `<||>`, `<//assistant//>`), siempre que se respete exactamente el formato indicado en la model card.
- Integracion con el ecosistema transformers y con text-generation-inference por compatibilidad declarada de pipeline.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso ni modo "thinking".
- No hay soporte multimodal (vision, audio) ni de codigo o matematicas mas alla de lo que aparezca en el corpus.
- Capacidad multilingue practicamente nula: solo se declara indonesio.

## Casos de uso

- Prueba de concepto de entrenamiento desde cero: sirve para validar pipelines de entrenamiento en CPU y comprobar que el guardado en safetensors y la carga con transformers funcionan de extremo a extremo.
- Banco de pruebas de plantillas de chat: permite verificar que una plantilla con delimitadores personalizados se renderiza y se aplica correctamente en `tokenizer.apply_chat_template` antes de portarla a modelos mayores.
- Evaluacion de infraestructura de inferencia: al ser pequeno (1,13 mil millones de parametros), se puede desplegar en vLLM o TGI para medir latencia y throughput de un endpoint compatible sin consumir GPUs grandes.
- Docencia y demostraciones: util para explicar en clase el ciclo completo de un modelo de lenguaje (tokenizacion, entrenamiento, plantilla de chat, generacion) con un artefacto real y de tamano manejable.
- Generacion de texto experimental en indonesio: para estudiar como se degrada la coherencia con corpus de entrenamiento minimos y comparar curvas de perplejidad en funcion de la cantidad de datos.
- Base para experimentos de fine-tuning a muy baja escala: al estar bajo Apache 2.0 y en safetensors, se puede usar como punto de partida para probar recetas de ajuste en tareas concretas de indonesio, asumiendo que el punto de partida es muy debil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 4,5 GB solo para pesos (1,13 mil millones de parametros x 4 bytes), mas overhead de activaciones y cache KV.
- En fp16/bf16: alrededor de 2,3 GB de pesos; en cuantizacion de 8 bits, unos 1,2 GB; en 4 bits, unos 0,6 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) es suficiente para fp16; para fp32 conviene disponer de 8-12 GB. En A100 o H100 no tiene sentido por su tamano, salvo para pruebas de throughput.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6-8 GB o mas segun precision.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (compatible segun tags) y endpoints compatibles. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Datos de entrenamiento | Disponibilidad |
|---|---|---|---|---|---|---|
| Xeno-L2-neural | 1.130.465.280 | no disponible | id | Apache 2.0 | 375.552 tokens (CPU) | safetensors en HF |
| TinyLlama-1.1B | ~1,1 mil millones | 2.048 tokens | en (principalmente) | Apache 2.0 | ~3 billones de tokens | safetensors, GGUF |
| Llama 3.2 1B | ~1,2 mil millones | 128.000 tokens | multilingue | Llama 3.2 Community License | varios billones de tokens | safetensors, GGUF |
| Qwen2.5-1.5B | ~1,5 mil millones | 32.768 tokens | multilingue (incluye indonesio) | Apache 2.0 | ~18 billones de tokens | safetensors, GGUF |

La comparacion deja clara la diferencia de escala: los modelos de referencia del mismo orden de parametros se entrenan con ordenes de magnitud mas de datos, soportan contextos de miles a cientos de miles de tokens y ofrecen pesos cuantizados listos para usar. Xeno-L2-neural solo es comparable en numero de parametros, no en capacidad.

## Limitaciones y advertencias

- Entrenado con solo 375.552 tokens: la coherencia del texto generado sera muy limitada y es probable que produzca repeticiones, divagaciones y errores gramaticales.
- Riesgo alto de alucinacion: sin datos factuales suficientes, cualquier afirmacion fuera del corpus sera inventada.
- Unico idioma declarado: indonesio. No hay soporte fiable de castellano ni de otras lenguas.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas que requieran ventanas largas.
- Plantilla de chat no estandar: ignorarla o sustituirla por la de Llama degrada aun mas la calidad de las respuestas.
- Ausencia total de benchmarks: no hay evidencia publica de calidad frente a lineas base triviales.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantias y la calidad del modelo hacen desaconsejable su uso en produccion.
- Sin pesos cuantizados publicados: desplegarlo en llama.cpp u Ollama exige conversion manual.
- Fecha de creacion del repositorio (2026-11-19) y ausencia de descargas o likes: no hay validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lobus22/Xeno-L2-neural
- Perfil del autor: https://huggingface.co/Lobus22
- Documentacion de plantillas de chat en transformers: https://huggingface.co/docs/transformers/main/en/chat_templating
- Documentacion de text-generation-inference: https://huggingface.co/docs/text-generation-inference/index
