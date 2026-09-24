# pt810/Ovis-Omni-Embedding-3B-bnb-8bit-vllm

## Resumen

Ovis-Omni-Embedding-3B-bnb-8bit-vllm es un derivado cuantizado a 8 bits del modelo universal de embeddings multimodales Ovis-Omni-Embedding-3B, desarrollado por el equipo Alibaba ATH-MaaS y publicado en HuggingFace por el usuario pt810. El modelo original es un codificador de 3.000 millones de parametros inicializado a partir de Qwen2.5-Omni-3B que proyecta texto, imagenes, documentos visuales, video, audio y entradas intercaladas en un unico espacio de representacion, lo que permite recuperacion any-to-any con un solo encoder. No es un modelo generativo: su tarea es producir embeddings normalizados para busqueda y recuperacion.

Tecnicamente, conserva el tokenizador de texto nativo, el codificador de vision, el codificador de audio y el backbone Thinker compartido de Qwen2.5-Omni, y elimina el modulo Talker de generacion de habla y la cabeza de modelado de lenguaje. El embedding de recuperacion se obtiene directamente del estado oculto de la ultima capa en el ultimo token no relleno, sin cabezas de proyeccion especificas por modalidad. La variante que nos ocupa aplica BitsAndBytes LLM.int8 a los pesos del Thinker, manteniendo las torres de audio y vision en BF16 para que vLLM pueda procesar las formas tensoriales multimodales.

Su relevancia practica es doble. Por un lado, reduce el coste de despliegue del modelo original al permitir servir un encoder omni-modal en una unica GPU de gama alta de consumo. Por otro, es uno de los primeros bundles publicos compatibles con el plugin de BitsAndBytes para vLLM (probado con vLLM 0.30.0 y vllm-bnb-plugin 0.0.3), lo que habilita el endpoint OpenAI-compatible `/v1/embeddings`. La licencia Apache 2.0 y el pipeline `feature-extraction` lo hacen directamente utilizable en pipelines de RAG y busqueda multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (backbone Thinker de Qwen2.5-Omni) con TMRoPE (time-aligned multimodal rotary position embedding); sin cabezas de proyeccion por modalidad |
| Parametros totales | 3.000 millones aproximadamente (denominacion comercial 3B) del modelo original; el indice de safetensors del repositorio reporta 3707, cifra que no concuerda con la denominacion y no se detalla si se refiere a numero de tensores |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de despliegue del autor configura `--max-model-len 512` |
| Tipos de cuantizacion | BitsAndBytes 8-bit (`load_in_8bit=True`, LLM.int8) en los pesos de lenguaje del Thinker; torres de audio y vision en BF16 original, listadas en `llm_int8_skip_modules`. Existe un derivado hermano en 4 bits publicado por el mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 7,6 GB); pesos de lenguaje en LLM.int8 8-bit y torres de vision/audio en BF16 |
| Ancho oculto nativo | 2048 |
| Dimension de salida validada | 1024 (prefijo de las 1024 primeras coordenadas ocultas; no es la proyeccion elastica aprendida del modelo original) |
| Tarea (pipeline) | `feature-extraction` (embeddings y retrieval) |
| Compatibilidad de despliegue | vLLM 0.30.0 con `vllm-bnb-plugin` 0.0.3; Transformers con carga en 8 bits. vLLM estandar sin el plugin rechaza `bitsandbytes` como metodo de cuantizacion desconocido |

## Arquitectura y entrenamiento

La arquitectura hereda el diseno de Qwen2.5-Omni. Las entradas se formatean con una instruccion de recuperacion a traves del procesador y la plantilla de chat nativos; los tokens de texto, visuales y acusticos se procesan como una unica secuencia intercalada por un Transformer causal compartido. El uso de TMRoPE preserva la alineacion temporal entre audio y video, lo que resulta critico para la recuperacion sobre video con pista de audio. A diferencia de otras aproximaciones omni-modales que ensamblan torres separadas por modalidad, aqui no existen cabezas de proyeccion adicionales: el estado oculto de la ultima capa en el ultimo token no relleno se utiliza tal cual como embedding de recuperacion, lo que reduce el coste de inferencia y evita perdidas de alineacion entre espacios.

El entrenamiento del modelo original se estructura en tres etapas. La primera es un preentrenamiento contrastivo omni-modal con candidatos mezclados globalmente y negativos in-batch distribuidos entre dispositivos, combinando aprendizaje contrastivo focal sensible a la dificultad con destilacion de la distribucion de similitudes desde expertos complementarios por modalidad. La segunda es un ajuste fino homogeneo de parametros completos sobre datos de alta calidad, donde cada micro-lote procede de un unico dataset y se deduplica los candidatos para evitar colisiones de positivos y falsos negativos in-batch. La tercera es una destilacion de embeddings con annealing: se retienen los ejemplos que el profesor resuelve correctamente, se sobremuestrean los ejemplos no resueltos por el estudiante y se aplica supervision forward-KL adaptativa a la confianza, transfiriendo capacidades de expertos complementarios sin anadir torres en tiempo de inferencia. Para esta variante concreta no se documenta ningun reentrenamiento: es una conversion de pesos, y el propio autor advierte en `QUANTIZATION.md` que la salida de 1024 dimensiones es un prefijo del espacio nativo de 2048 y no una proyeccion aprendida.

## Capacidades

- Generacion de embeddings multimodales para texto, imagenes, documentos visuales, video, audio y entradas intercaladas, todos en un mismo espacio de representacion.
- Recuperacion any-to-any: consulta de texto contra corpus de imagen, video o audio, y viceversa, con un unico encoder.
- Recuperacion instruida: el modelo acepta una instruccion de recuperacion formateada con la plantilla de chat nativa, lo que permite adaptar la representacion a la tarea sin reentrenamiento.
- Busqueda sobre documentos visuales: paginas escaneadas, capturas de interfaz y documentos maquetados se codifican sin OCR previo.
- Busqueda de video y audio: la preservacion de alineacion temporal mediante TMRoPE permite recuperar fragmentos audiovisuales por contenido.
- Recuperacion agentica sobre herramientas, interfaces y memoria, segun declara el autor entre los casos de uso previstos.
- Servicio de embeddings compatible con la API OpenAI a traves de `/v1/embeddings` cuando se despliega con vLLM y el plugin de BitsAndBytes.
- No genera texto ni respuestas: es un modelo de representacion, no un modelo de lenguaje generativo. No se documenta soporte de tool calling, function calling, modo thinking, ni generacion de codigo o matematicas.

## Casos de uso

- Busqueda multimodal empresarial: indexar un repositorio mixto de PDFs, imagenes, recortes de video y notas de audio y ofrecer una unica consulta en lenguaje natural que recupere resultados de cualquier modalidad, aprovechando que todas las entradas comparten espacio de representacion.
- RAG sobre documentacion tecnica con figuras: recuperar la pagina o el diagrama relevante para una pregunta, incluyendo documentos visuales sin texto extraible, y alimentar despues un modelo generativo con ese contexto.
- Moderacion y deduplicacion de contenido: calcular similitud entre imagenes, fragmentos de video o audio para detectar duplicados, near-duplicates o reutilizacion no autorizada de material en un catalogo.
- Recomendacion de contenido audiovisual: representar trailers, clips o podcasts en el mismo espacio que los intereses declarados por el usuario en texto, y ordenar candidatos por similitud sin necesidad de metadatos curados.
- Recuperacion sobre memoria de agentes: almacenar interacciones pasadas (texto, capturas de pantalla, audio de reuniones) y recuperar las mas relevantes en cada paso de un flujo multi-turno, dado que el modelo se disena explicitamente para recuperacion agentica.
- Busqueda de calidad en soporte tecnico: indexar tickets con capturas de pantalla adjuntas o notas de voz de clientes y localizar casos historicos equivalentes para sugerir resoluciones.
- Construccion de indices para analitica de producto: agrupar sesiones de usuario grabadas (video de pantalla mas audio) por similitud para descubrir patrones de friccion sin etiquetado manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante cuantizada. La documentacion del proyecto original afirma que Ovis-Omni-Embedding-3B alcanza un rendimiento lider en el Massive Multimodal Embedding Benchmark (MMEB), pero no se incluyen cifras numericas en el material consultado. Tampoco se publican mediciones de degradacion respecto al modelo original en BF16, ni datos de latencia o throughput para la version de 8 bits.

## Requisitos de hardware

- Peso en disco: 7,6 GB, correspondiente a los pesos de lenguaje en 8 bits mas las torres de vision y audio en BF16.
- VRAM estimada para inferencia: en torno a 8-9 GB solo para alojar los pesos, mas activaciones y cache KV; con `--gpu-memory-utilization 0.80` el autor demuestra un despliegue funcional en una GPU con holgura. Estas cifras son estimaciones derivadas del tamano del repositorio, no mediciones publicadas.
- GPU recomendadas: cabe con comodidad en RTX 4090, RTX 3090, A100 40 GB, L40S y H100. En GPUs de 16 GB (RTX 4080, A4000) el margen es ajustado pero plausible con la configuracion indicada. En GPUs de 12 GB requiere reducir la longitud de contexto y la utilizacion de memoria.
- Opciones de despliegue: vLLM 0.30.0 junto con `vllm-bnb-plugin` 0.0.3 (`vllm serve . --runner pooling --convert embed --pooler-config '{"dimensions":1024}' --max-model-len 512 --gpu-memory-utilization 0.80`). Alternativamente, Transformers con `load_in_8bit=True`. vLLM sin el plugin no funciona con este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| pt810/Ovis-Omni-Embedding-3B-bnb-8bit-vllm | ~3B | Texto, imagen, video, audio, intercalado | BitsAndBytes 8-bit (towers en BF16) | No disponible (ejemplo con 512) | Apache 2.0 | Requiere vllm-bnb-plugin; salida validada de 1024 dimensiones como prefijo del espacio nativo |
| ATH-MaaS/Ovis-Omni-Embedding-3B | ~3B | Texto, imagen, video, audio, intercalado | BF16 sin cuantizar | No disponible | Apache 2.0 | Modelo de referencia; usa la proyeccion elastica aprendida y ancho completo de 2048 |
| pt810/Ovis-Omni-Embedding-3B-bnb-4bit | ~3B | Texto, imagen, video, audio, intercalado | BitsAndBytes 4-bit | No disponible | Apache 2.0 | Variante hermana de menor precision, mas ligera y presumiblemente con mayor degradacion |
| Ovis-Embedding-VL-2B / 9B | 2B y 9B | Vision y lenguaje (sin audio) | No disponible | No disponible | No disponible | Familias relacionadas citadas en el informe tecnico; no cubren audio |

## Limitaciones y advertencias

- La salida de 1024 dimensiones no es la proyeccion elastica aprendida del modelo original: el autor indica explicitamente que se toman las 1024 primeras coordenadas ocultas. Esto implica una perdida de calidad en la recuperacion respecto al modelo completo de 2048 dimensiones, y no existe una evaluacion publicada de cuanto se degrada.
- La cuantizacion a 8 bits introduce una perdida adicional de precision, no cuantificada en ningun benchmark publicado.
- El repositorio registra 0 descargas y 0 likes en la informacion disponible, por lo que no existe validacion independiente de la comunidad sobre su comportamiento en produccion.
- Dependencia estricta de herramienta: vLLM estandar rechaza el metodo de cuantizacion `bitsandbytes`, de modo que el despliegue queda ligado a la version concreta del plugin (0.0.3) y a vLLM 0.30.0. Un cambio de version puede romper la compatibilidad.
- El ejemplo oficial limita `--max-model-len` a 512 tokens, lo que restringe el uso con documentos largos o conversaciones extensas hasta que se valide una ventana mayor.
- No se documentan los idiomas soportados; el comportamiento multilingue no esta garantizado ni medido.
- Al no ser un modelo generativo, no alucina texto, pero puede producir coincidencias falsas en recuperacion: un embedding erroneo devuelve documentos irrelevantes sin ninguna senal de error visible, lo que en un pipeline de RAG se propaga silenciosamente como contexto incorrecto.
- No se documentan sesgos especificos de esta variante. Como derivado de Qwen2.5-Omni y de un corpus de entrenamiento multimodal no descrito en detalle, cabe esperar los sesgos culturales y de representacion propios de ese backbone y de la composicion de sus datos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, incluida la redistribucion de esta variante cuantizada.
- Cualquier uso en produccion deberia validar la calidad de recuperacion contra el modelo original en BF16 sobre el dominio concreto antes de adoptar la version cuantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pt810/Ovis-Omni-Embedding-3B-bnb-8bit-vllm
- Modelo original: https://huggingface.co/ATH-MaaS/Ovis-Omni-Embedding-3B
- Revision de origen utilizada: https://huggingface.co/ATH-MaaS/Ovis-Omni-Embedding-3B/tree/926092ea607bdba164c9985a22a2b6130d8b6118
- Variante hermanas en 4 bits: https://huggingface.co/pt810/Ovis-Omni-Embedding-3B-bnb-4bit
- Repositorio GitHub del proyecto: https://github.com/ATH-MaaS/Ovis-Omni-Embedding
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.25165
- Informe tecnico (PDF): https://arxiv.org/pdf/2609.25165
- Detalles de conversion y validacion de la cuantizacion: `QUANTIZATION.md` en el repositorio del modelo
- Mirror de la comunidad: https://huggingface.co/wl1982/Ovis_Omni_Embedding_3B
