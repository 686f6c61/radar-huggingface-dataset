# francesca9805/ppt-wc-uniform-newlex-eus-after-100mb-packed-bfd_seed10

## Resumen

`francesca9805/ppt-wc-uniform-newlex-eus-after-100mb-packed-bfd_seed10` es un modelo de generacion de texto de 86.508.288 parametros, publicado por el usuario francesca9805, que consiste en un ajuste fino (SFT) del modelo base `goldfish-models/eng_latn_100mb`. El ajuste se ha realizado con TRL 0.23.0 y Transformers 4.56.2, y el entrenamiento esta registrado en un proyecto de Weights & Biases de la Universidad de Groningen dedicado a nuevos tokenizadores. Por el nombre del repositorio (sufijos `eus`, `newlex`, `new-tokenizers`) y por el contexto del proyecto, se trata de un artefacto de investigacion centrado en la adaptacion de un modelo entrenado originalmente con datos en ingles a un nuevo tokenizador, presumiblemente orientado al euskera, aunque el autor no documenta este extremo en la model card.

La relevancia de esta publicacion es limitada en terminos de producto: no tiene descargas ni interacciones, no declara licencia efectiva, no incluye idiomas soportados ni datos de evaluacion, y su model card es una plantilla autogenerada por TRL. Su interes es fundamentalmente experimental, como evidencia de las estrategias de re-tokenizacion y de entrenamiento sobre corpus empaquetados que se investigan en el citado grupo. No debe considerarse un modelo listo para produccion ni un modelo multilingue verificado.

Al tratarse de una variante de ~86M de parametros derivada de la familia Goldfish, su coste computacional es minimo y cabe en cualquier GPU de consumo, e incluso en CPU. El repositorio ocupa 0,2 GB y los pesos estan en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-2 (segun el tag `gpt2` de HuggingFace); numero de capas y cabezas no disponible |
| Parametros totales | 86.508.288 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors en precision original); no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles en la model card. El nombre del repositorio incluye el sufijo `eus` (posible referencia al euskera) y el modelo base esta entrenado con datos `eng_latn`, pero no hay confirmacion por parte del autor |
| Licencia | No disponible (`lcense: license` es un marcador de posicion sin contenido) |
| Formato de pesos | safetensors (`model.safetensors`), libreria transformers |
| Tamano del repositorio | 0,2 GB |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un transformer de tipo decoder-only, coherente con el tag `gpt2` asociado al repositorio y con el modelo base `goldfish-models/eng_latn_100mb`, que pertenece a la coleccion Goldfish de modelos monolingues. El recuento real de parametros (86,5M) es inferior al de GPT-2 small (124M), lo que sugiere un vocabulario mas reducido o un numero de capas distinto, probablemente consecuencia del nuevo tokenizador empleado en el experimento; sin embargo, el autor no publica la configuracion de capas, dimensiones ocultas ni el tamano del vocabulario, por lo que estos datos deben considerarse no disponibles.

El entrenamiento se ha realizado mediante SFT con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121 y Datasets 4.8.4. No se especifican el conjunto de datos, el numero de tokens de entrenamiento, la composicion del corpus ni si hubo fases posteriores de RLHF o DPO; la model card solo enlaza a un experimento de Weights & Biases dentro del proyecto "new-tokenizers" de la Universidad de Groningen. El nombre del repositorio sugiere un flujo de trabajo con datos empaquetados (`packed`) tras un umbral de 100 MB de corpus (`after-100mb`) y una semilla concreta (`seed10`), pero esto es una interpretacion del identificador, no un dato documentado. No se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.).

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2 y del pipeline `text-generation`.
- Ajuste por instrucciones (SFT), por lo que el ejemplo de la model card plantea la entrada como una conversacion con rol `user` y espera una respuesta generada.
- Compatibilidad con `text-generation-inference` (tag `endpoints_compatible`), lo que en principio permite desplegarlo como endpoint HTTP.
- Capacidad multilingue: no disponible. No se confirma que el modelo maneje euskera u otros idiomas distintos del ingles del corpus base.
- Tool calling / function calling: no disponible; no hay plantilla de herramientas documentada ni evidencia de entrenamiento en ese sentido.
- Capacidades de agente o razonamiento multi-paso: no disponibles; no hay modo de razonamiento explicito ni datos que lo respalden.
- Vision, audio u otras modalidades: no disponibles; el repositorio es exclusivamente de texto.
- Modo "thinking" o decodificacion con cadenas de pensamiento: no disponible.

## Casos de uso

- Investigacion sobre tokenizadores: el modelo sirve como punto de comparacion en experimentos de re-tokenizacion, ya que permite medir como rinde un modelo base en ingles tras sustituir su vocabulario y reentrenarlo; el contexto del proyecto de W&B apunta exactamente a ese tipo de estudio.
- Experimentos de adaptacion a lenguas de bajos recursos: si finalmente el modelo esta orientado al euskera, podria emplearse como linea base para estudiar tecnicas de adaptacion linguistica con corpus limitados (del orden de 100 MB), un escenario habitual en lenguas minorizadas.
- Docencia y practicas de fine-tuning: con 86,5M de parametros y 0,2 GB de repositorio, es un candidato adecuado para que estudiantes reproduzcan un pipeline completo de SFT con TRL en una unica GPU o incluso en CPU.
- Pruebas de infraestructura de despliegue: su tamano minimo permite validar extremo a extremo cadenas de servicio (TGI, endpoints compatibles, transformers) antes de escalar a modelos mayores, comprobando tokenizacion, plantillas de chat y formato de respuesta.
- Generacion de texto en entornos con recursos muy limitados: podria ejecutarse en dispositivos sin GPU (Raspberry Pi, portatiles modestos) para tareas de autocompletado o texto de relleno, siempre que no se requiera calidad alta ni idiomas distintos del ingles.
- Analisis de sesgos y de herencia de datos: al derivar de un corpus en ingles y de un entrenamiento no documentado, resulta util para auditar como se propagan sesgos del modelo base tras un ajuste con vocabulario nuevo.
- Reproducibilidad de artefactos efimeros: al ser un modelo sin descargas, sin licencia clara y sin evaluacion, tambien sirve como caso de estudio sobre los problemas de trazabilidad en repositorios de investigacion publicados sin documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplexidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y tampoco se aportan resultados de comparacion con el modelo base `goldfish-models/eng_latn_100mb`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en FP32, 0,17 GB en FP16/BF16, 0,09 GB en INT8 y 0,04 GB en INT4, calculado a partir de los 86,5M de parametros; hay que sumar la memoria del cache KV, que con una ventana de contexto corta es despreciable.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria es suficiente; no se necesita A100, H100 ni hardware de centro de datos. Una GTX 1050 Ti, una MX150 o una iGPU moderna serian suficientes.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas las integradas, e incluso puede ejecutarse en CPU con latencias aceptables.
- Opciones de despliegue: transformers (soporte nativo confirmado por la libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y servidores compatibles con la API de HuggingFace. vLLM o llama.cpp requeririan conversion previa a los formatos que soportan; no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Por tamano, cabe esperar que en una GPU moderna el modelo este limitado por el coste de lanzamiento de kernels mas que por el ancho de banda de memoria, pero no hay datos verificables que permitan cifrarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppt-wc-uniform-newlex-eus-after-100mb-packed-bfd_seed10 | 86,5M | No disponible | No disponible | No disponible | Repositorio HuggingFace, 0 descargas |
| goldfish-models/eng_latn_100mb (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | Coleccion publica de goldfish-models |
| GPT-2 small | 124M | 1024 tokens | Metricas ampliamente reportadas en la literatura original | Licencia del release original de OpenAI | Ampliamente disponible en HuggingFace |
| DistilGPT-2 | 82M | 1024 tokens | Metricas publicadas en el articulo de destilacion de HuggingFace | Apache 2.0 | Ampliamente disponible en HuggingFace |

La comparacion con GPT-2 small y DistilGPT-2 se incluye unicamente por proximidad de tamano; no implica que existan resultados comparables, ya que este modelo no publica evaluacion alguna. Los datos de contexto y licencia de los modelos de referencia corresponden a sus releases originales y no se han verificado en el contexto de esta ficha mas alla de lo indicado.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni perplexidad, ni pruebas cualitativas publicadas, por lo que se desconoce si el ajuste ha degradado o mejorado el modelo base.
- Licencia no disponible: la model card contiene un marcador de posicion (`licence: license`) sin texto. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion, lo que desaconseja cualquier uso en produccion.
- Idiomas no declarados: aunque el nombre del repositorio apunta al euskera, no hay confirmacion. Cualquier afirmacion sobre su competencia linguistica es especulativa.
- Riesgo de alucinacion: es un modelo pequeno (86,5M de parametros) entrenado con tecnicas de SFT; la generacion puede ser incoherente o factualmente incorrecta con alta probabilidad, especialmente fuera de la distribucion de sus datos de entrenamiento.
- Sesgos: hereda los sesgos del corpus en ingles de `goldfish-models/eng_latn_100mb` y los del corpus de ajuste, que no se documenta. No se ha realizado ninguna evaluacion de sesgo.
- Limitaciones de contexto: se desconoce la ventana de contexto. Si el modelo conserva la configuracion tipica de GPT-2, estaria en el entorno de 1024 tokens, insuficiente para tareas de contexto largo o conversaciones multi-turno extensas.
- Trazabilidad limitada: el repositorio se creo y actualizo el mismo dia, sin descargas ni interacciones, y el autor no responde a preguntas frecuentes ni aporta documentacion adicional. El identificador sugiere un artefacto intermedio de un barrido experimental.
- Degradacion por re-tokenizacion: si el modelo ha cambiado de tokenizador, el rendimiento en ingles puede haberse resentido respecto al modelo base, y el ejemplo de uso de la model card no esta verificado por el autor.
- Resultados de busqueda web no relevantes: las consultas realizadas no han devuelto informacion tecnica sobre este modelo, solo contenido sin relacion alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-eus-after-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Experimento de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/n90ogo02
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (von Werra et al., 2020): https://github.com/huggingface/trl (referencia bibliografica incluida en la model card)
