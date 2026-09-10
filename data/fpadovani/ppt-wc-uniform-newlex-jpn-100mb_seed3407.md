# fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed3407` es un ajuste fino (fine-tuning) supervisado del modelo monolingue `goldfish-models/eng_latn_100mb`, desarrollado por el usuario `fpadovani` en el marco de un proyecto vinculado a la Universidad de Groningen (la ejecucion de entrenamiento se registro en el proyecto de Weights & Biases `f-padovani-university-of-groningen/white_cotterell`). Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 86.508.288 parametros en formato safetensors, entrenado con la libreria TRL mediante SFT (supervised fine-tuning).

El interes de esta ficha es mas metodologico que de producto: el identificador del modelo apunta a un experimento controlado de ajuste fino sobre un corpus de 100 MB, con una semilla fija (3407) y variantes de configuracion (`ppt-wc-uniform-newlex-jpn`). Es decir, parece formar parte de una bateria de experimentos comparables entre si, mas que de un modelo destinado a despliegue en produccion. Esto explica que tenga 0 descargas y 0 likes y que la model card sea practicamente la plantilla autogenerada por TRL.

La relevancia practica es limitada por su tamano (menos de 90 millones de parametros) y por la ausencia de datos publicados sobre contexto, licencia o idiomas. Aun asi, resulta util como referencia para reproducir experimentos de ajuste fino de bajo coste, para estudiar el comportamiento de modelos pequenos tras SFT y como punto de partida para comparaciones con el modelo base del que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only; etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 86.508.288 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la familia GPT-2 suele emplear 1024 tokens; sin confirmar para este ajuste) |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF/AWQ/GPTQ en el repositorio) |
| Idiomas soportados | No disponibles; el identificador incluye `jpn` y el modelo base es `eng_latn`, pero la model card no confirma idiomas |
| Licencia | No disponible (el campo de la model card contiene unicamente el marcador `license`) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 1,4 GB |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Framework | Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Pipeline | text-generation |
| Compatibilidad | `text-generation-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal (self-attention enmascarada) y normalizacion previa a los bloques. El modelo hereda la configuracion del base `goldfish-models/eng_latn_100mb`, un modelo monolingue de la coleccion goldfish entrenado sobre un subconjunto de aproximadamente 100 MB de texto. El recuento real de parametros en safetensors, 86.508.288, es inferior al de GPT-2 small (124 millones), lo que sugiere una configuracion con embeddings atados y un vocabulario o un numero de capas reducido respecto al GPT-2 original; no obstante, los detalles exactos de capas, dimensiones ocultas y cabezas de atencion no se especifican en la informacion disponible.

El entrenamiento se realizo mediante SFT con TRL, es decir, ajuste supervisado sobre pares de ejemplo del estilo instruccion-respuesta (formato de chat, como muestra el ejemplo de `pipeline` con `[{"role": "user", "content": ...}]`). La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO; solo se indica que no se ha publicado informacion adicional y se enlaza una ejecucion concreta de Weights & Biases. El identificador `uniform-newlex-jpn-100mb_seed3407` apunta a una variante experimental dentro de una familia de ejecuciones (probablemente comparando estrategias de mezcla de datos o de lexico), con semilla fija para reproducibilidad, pero no hay documentacion publica que describa el diseno experimental.

## Capacidades

- Generacion de texto autoregresiva: es la funcion principal del modelo, con el pipeline `text-generation` de Transformers.
- Formato conversacional de un solo turno: el ejemplo oficial construye la entrada como lista de mensajes con rol `user`, lo que indica que el ajuste SFT se hizo con plantilla de chat.
- Respuestas a preguntas abiertas y generacion de texto libre en el estilo de los datos de ajuste.
- Capacidad de razonamiento complejo, matematicas o codigo: no disponible; no hay evidencia publicada para un modelo de este tamano y con este tipo de ajuste.
- Soporte de tool calling / function calling: no disponible; no se documenta ninguna capacidad de invocacion de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el identificador menciona `jpn` y el base es `eng_latn`, pero la model card no confirma el alcance idiomatico final.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible; el modelo es exclusivamente de texto.
- Compatibilidad con text-generation-inference y con endpoints de inferencia alojados (etiquetas `text-generation-inference` y `endpoints_compatible`).

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el modelo sirve como artefacto de referencia para replicar una ejecucion SFT con semilla fija (3407) sobre el base `goldfish-models/eng_latn_100mb` y comparar el efecto de distintas configuraciones de datos.
- Analisis del efecto del SFT en modelos pequenos: con 86,5 millones de parametros se puede estudiar como cambia la distribucion de salida respecto al modelo base sin incurrir en costes de computo elevados.
- Generacion de texto de bajo coste en local: al ocupar poco mas de 170 MB en fp16, es viable ejecutarlo en CPU o en cualquier GPU de gama baja para tareas de relleno o prototipado rapido.
- Prototipado de plantillas de chat: util para validar el formato de mensajes (`role`/`content`) y el pipeline de inferencia antes de escalar a modelos mayores con la misma interfaz.
- Docencia y practicas de ajuste supervisado: el modelo es un ejemplo completo de pipeline TRL + Transformers + W&B, adecuado para cursos o talleres sobre fine-tuning.
- Pruebas de integracion con text-generation-inference y endpoints compatibles: permite verificar cadenas de despliegue y contenedores sin consumir recursos de GPU significativos.
- Investigacion sobre transferencia entre idiomas: dado que el identificador sugiere trabajo con japones sobre un base en ingles, puede emplearse como material de partida para estudiar transferencia y olvido catastrofico en regimen de pocos parametros.
- Generacion de texto sintetico para pruebas de software: sirve para poblar entornos de test con texto generado sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni ninguna otra) y tampoco se han encontrado datos de rendimiento en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 350 MB solo para pesos (86,5 M de parametros x 4 bytes), mas activaciones y cache KV; en la practica menos de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 175 MB para pesos; con overhead de runtime, alrededor de 0,5-1 GB.
- VRAM estimada en int8: unos 90 MB para pesos; alrededor de 0,4-0,8 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas NVIDIA GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores; tambien es funcional en Apple Silicon mediante MPS.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas e incluso en iGPU con memoria compartida suficiente.
- Ejecucion en CPU: viable; con una decena de nucleos se pueden obtener velocidades de decodificacion del orden de decenas de tokens por segundo, aunque no hay mediciones publicadas.
- Opciones de despliegue: `transformers` con el pipeline `text-generation`, `text-generation-inference` (TGI) segun las etiquetas del repositorio, y servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`). No se publican pesos en formato GGUF, por lo que llama.cpp u Ollama requeririan una conversion manual previa.
- Latencia y throughput estimados: no disponible; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed3407 | 86.508.288 | No disponible | No disponible | HuggingFace, safetensors |
| goldfish-models/eng_latn_100mb (modelo base) | No disponible | No disponible | No disponible | HuggingFace |
| GPT-2 small (OpenAI) | 124 millones | 1024 tokens | MIT | HuggingFace, safetensors y otros formatos |
| Otras variantes de la familia de experimentos `ppt-wc-*` del mismo autor | No disponible | No disponible | No disponible | HuggingFace (repositorio del autor) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. Las diferencias observables se limitan al numero de parametros, el metodo de ajuste (SFT sobre base monolingue frente a preentrenamiento completo) y la disponibilidad de formatos de cuantizacion, ausentes en este caso.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de un modelo entrenado sobre un subconjunto de 100 MB de texto en `eng_latn`, es probable que herede los sesgos de esa fuente, pero no hay analisis publicado.
- Riesgo de alucinacion: elevado. Con menos de 90 millones de parametros y un ajuste SFT sobre un corpus reducido, la fidelidad factual es limitada y no hay evaluaciones que la cuantifiquen.
- Limitaciones de contexto: se desconoce la ventana real; si sigue la convencion de GPT-2 seran 1024 tokens, lo que restringe tareas de contexto largo y conversaciones multi-turno extensas.
- Limitaciones de idioma: no confirmadas. El identificador incluye `jpn` mientras el base es ingles; el comportamiento real en japones o en castellano no esta verificado ni documentado.
- Restricciones de licencia: la model card contiene solo el marcador generico `license`, sin texto de licencia. Esto impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier uso en produccion.
- Caveat de procedencia: el modelo se genero con `generated_from_trainer` y la model card es la plantilla automatica de TRL, sin validacion humana ni evaluacion independiente.
- Caveat de robustez: no hay informacion sobre filtrado de datos, alineacion de seguridad ni mitigaciones de contenido danino.
- Caveat de mantenimiento: el repositorio no registra descargas ni interacciones; es un artefacto experimental sin garantia de soporte ni actualizaciones.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/gdzcolyl
- Proyecto goldfish-models (coleccion de modelos monolingues): https://huggingface.co/goldfish-models
