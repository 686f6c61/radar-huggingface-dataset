# NecroDevelopment/roberta-mlm-cc12m-100pct

## Resumen

`NecroDevelopment/roberta-mlm-cc12m-100pct` (también identificado en la model card como `mlm-roberta-base-cc12m-100pct`) es un encoder de texto tipo RoBERTa sometido a preentrenamiento continuado con el objetivo de *masked language modeling* (MLM) sobre los pies de foto del dataset CC12M (12 millones de pares imagen-texto). No es un modelo generativo ni un modelo de chat: es un encoder bidireccional que predice tokens enmascarados y produce representaciones contextuales de frases en inglés.

El modelo lo publica el usuario NecroDevelopment y se presenta explícitamente como el «control solo texto» de un *bake-off* de proximidad semántica (WiC) frente a una ejecución contrastiva complementaria. La receta es idéntica en número de pasos (100.000) y en el marcado de palabra objetivo, de modo que sirve como línea base para aislar el efecto del objetivo contrastivo frente al MLM estándar.

Su relevancia es acotada y de carácter experimental: repositorio con 0 descargas y 0 *likes*, licencia MIT y un tamaño de 0,5 GB. La ventana de secuencia usada durante el entrenamiento es de solo 77 tokens, lo que limita su uso a fragmentos cortos, típicos de pies de foto. Existe una discrepancia documental relevante entre el metadato de HuggingFace (que indica `FacebookAI/xlm-roberta-base` como modelo base) y el cuerpo de la model card (que describe un encoder `roberta-base`); se detalla en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only bidireccional (familia RoBERTa), con cabeza MLM entrenada sobre el encoder |
| Parametros totales | No confirmado de forma univoca. La model card indica `roberta-base` (aproximadamente 125 M); el metadato de HuggingFace indica `FacebookAI/xlm-roberta-base` (aproximadamente 279 M). El tamano del repositorio (0,5 GB) es consistente con 125 M parametros en fp32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (longitud maxima de secuencia usada en el entrenamiento, fijada para igualar la ejecucion contrastiva) |
| Tipos de cuantizacion | No disponible. No se publican pesos GGUF, GPTQ, AWQ ni variantes cuantizadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | No especificado en la model card. No se declara safetensors ni GGUF; el repositorio ocupa 0,5 GB |

## Arquitectura y entrenamiento

Se parte de un encoder RoBERTa con las 12 capas descongeladas (*all 12 layers unfrozen*) y se entrena una cabeza MLM sobre la representacion final. El objetivo es MLM de subpalabras estandar con una probabilidad de enmascarado del 15 %. La innovacion metodologica concreta es la envoltura de una palabra objetivo aleatoria con las marcas `<t>...</t>` (`mark_random_target=True`, `marker_min_word_len=3`, `target_pool=False`): el modelo no solo reconstruye el token enmascarado, sino que aprende a operar sobre una palabra explicitamente marcada dentro de la secuencia. Esta misma receta de 100.000 pasos y marcado de palabra objetivo se emplea en la ejecucion contrastiva complementaria, de ahi que esta variante funcione como control.

Los datos provienen exclusivamente de la rama de pies de foto de `pixparse/cc12m-wds` (CC12M empaquetado en *webdataset shards*), descartando la parte visual. El entrenamiento usa AdamW con *weight decay* 0,01, batch por dispositivo de 128, *warmup* lineal de 1.000 pasos seguido de tasa constante, *learning rate* de 2e-5 para el encoder con decaimiento por capa de 0,85 desde arriba y 2e-4 para la cabeza MLM. La precision de entrenamiento es fp32, sin mezcla de precision declarada ni fases de RLHF, DPO o ajuste por instrucciones, que no tendrian sentido en un objetivo MLM. No se documenta el numero total de tokens procesados, la composicion idiomática del corpus mas alla del ingles declarado ni si hubo filtrado adicional sobre CC12M.

## Capacidades

- Prediccion de tokens enmascarados (MLM) en ingles: relleno de huecos en frases cortas, hasta 77 tokens.
- Extraccion de representaciones contextuales de frase mediante *mean pooling*, *CLS pooling* o pooling sobre la posicion de la marca `<t>`.
- Ajuste fino supervisado para tareas de comprension: clasificacion de texto, analisis de sentimiento, deteccion de temas, clasificacion de intenciones.
- Etiquetado de secuencias: NER, POS tagging, chunking, extraccion de entidades sobre pies de foto y titulares cortos.
- Modelado de similitud semantica entre pares de frases en ingles (uso previsto en el *bake-off* WiC), como encoder de un sistema bi-encoder o cross-encoder.
- Aprendizaje de representaciones inducido por la marca `<t>...</t>`, util para tareas donde interesa senalar una palabra concreta dentro de la secuencia.
- No soporta generacion de texto libre, *tool calling*, *function calling*, razonamiento multi-paso ni uso como agente.
- No soporta vision, audio, *thinking mode* ni capacidades multimodales, pese a que los datos de entrenamiento derivan de un corpus imagen-texto.
- Capacidades multilingues: no declaradas. El modelo se publica solo para ingles, aunque el encoder subyacente de XLM-R, si se confirma ese origen, tendria cobertura multilingue latente no aprovechada en este entrenamiento.

## Casos de uso

- Extraccion de embeddings de pies de foto para busqueda semantica: el modelo convierte descripciones breves (menos de 77 tokens) en vectores comparables, de modo que se puede construir un indice vectorial sobre corpus de *alt-text* y recuperar imagenes por consulta textual. Es adecuado porque el entrenamiento se hizo exactamente sobre ese dominio.
- Clasificacion de contenido generado por usuarios en ingles: ajuste fino de una cabeza de clasificacion sobre las representaciones del encoder para moderacion, etiquetado tematico o deteccion de spam en comentarios cortos.
- Linea base de control en experimentos de representacion semantica: sirve para medir cuanto aporta un objetivo contrastivo frente al MLM puro en tareas de proximidad semantica (WiC), manteniendo constantes datos, pasos y marcado de palabra objetivo.
- Deduplicacion y agrupamiento de metadatos multimodales: generar embeddings de los pies de foto de un corpus tipo CC12M y agrupar o eliminar casi duplicados antes de entrenar un modelo vision-lenguaje, reduciendo redundancia en el dataset.
- Etiquetado de secuencias sobre titulares y descripciones: NER o extraccion de atributos (producto, marca, ubicacion) en catalogos de comercio electronico cuyos textos son cortos, encajando con la ventana de 77 tokens.
- Destilacion o inicializacion de modelos mas pequenos: al disponer de pesos ajustados a un dominio de pies de foto, puede usarse como profesor para generar pseudoetiquetas o como punto de partida de un encoder mas ligero.
- Filtrado y *reranking* en pipelines de datos: puntuar pares (texto, texto) o (texto, consulta) en un *cross-encoder* para reordenar candidatos antes de una etapa mas costosa.
- Investigacion sobre objetivos de enmascarado: la marca `<t>` permite estudiar si senalar explicitamente una palabra mejora la sensibilidad del encoder a esa posicion frente al MLM convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo participa como control solo texto en un *bake-off* de proximidad semantica basado en WiC, pero no incluye cifras de exactitud, correlacion ni comparaciones numericas. Tampoco se aportan resultados de MMLU, GLUE, SQuAD, STS ni de ninguna otra suite; hay que recordar que un encoder MLM no es evaluable en benchmarks generativos.

## Requisitos de hardware

- VRAM estimada en inferencia (calculo a partir del numero de parametros, no dato publicado por el autor): aproximadamente 0,5 GB en fp32 si el modelo es de 125 M parametros; aproximadamente 0,25 GB en fp16/bf16; aproximadamente 0,13 GB en int8. Si finalmente fuese el encoder de 279 M parametros, las cifras serian aproximadamente 1,1 GB, 0,55 GB y 0,28 GB respectivamente.
- Cabe Holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU con memoria RAM de sobra. No requiere A100 ni H100.
- Memoria en entrenamiento: con 125 M parametros, batch 128 y secuencias de 77 tokens en fp32, el *fine-tuning* completo es viable en una GPU de 12-16 GB; si se confirma el encoder de 279 M parametros, conviene subir a 16-24 GB.
- Opciones de despliegue: `transformers` con PyTorch sobre CPU o GPU, exportacion a ONNX Runtime o TorchScript para inferencia de baja latencia, y servidores de embeddings basados en FastAPI o Triton. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin conversion previa. vLLM no es el objetivo natural de un encoder MLM, aunque admite algunos modelos de embeddings; conviene verificar compatibilidad antes de adoptarlo.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roberta-mlm-cc12m-100pct (este modelo) | 125 M (segun la model card) | 77 tokens en entrenamiento | MLM con marcado de palabra objetivo sobre CC12M | MIT | HuggingFace, 0 descargas |
| `FacebookAI/roberta-base` | 125 M | 512 tokens | MLM sobre BookCorpus + Wikipedia | MIT | Ampliamente disponible y validado |
| `FacebookAI/xlm-roberta-base` | 279 M | 512 tokens | MLM multilingue sobre 100 idiomas | MIT | Ampliamente disponible y validado |
| `distilroberta-base` | 82 M | 512 tokens | Destilacion de RoBERTa | Apache 2.0 | Ampliamente disponible |
| `microsoft/deberta-v3-base` | 184 M | 512 tokens | MLM con atencion desenrollada | MIT | Ampliamente disponible |

Frente a los encoders de referencia, este modelo intercambia generalidad por especializacion: gana en ajuste al dominio de pies de foto y en coherencia experimental dentro de su *bake-off*, pero pierde 435 tokens de contexto, carece de validacion publica y no ofrece variantes cuantizadas ni versiones destiladas. Para produccion general, `roberta-base` o `deberta-v3-base` siguen siendo opciones mas seguras por soporte, documentacion y resultados reproducibles.

## Limitaciones y advertencias

- Ventana de 77 tokens: cualquier entrada mas larga requiere truncado, lo que degrada tareas sobre documentos, articulos o conversaciones.
- Solo ingles declarado. El rendimiento en castellano u otros idiomas no esta medido ni garantizado, incluso si el encoder base fuese multilingue.
- No es un modelo generativo: no puede redactar, resumir de forma abstractiva, mantener conversaciones ni seguir instrucciones. Usarlo como chatbot o como agente es un error de planteamiento.
- Sin resultados de benchmarks ni validacion externa: el repositorio tiene 0 descargas y 0 *likes*, por lo que no hay evidencia publica de calidad mas alla de la descripcion del autor.
- Discrepancia documental sobre el modelo base: el metadato de HuggingFace apunta a `xlm-roberta-base` y la model card describe `roberta-base`. Antes de integrarlo conviene inspeccionar el `config.json` y el tokenizador para determinar el vocabulario real (50.265 frente a 250.002 tokens), ya que de ello depende la eleccion del tokenizador y el numero de parametros.
- Sesgos heredados de CC12M: corpus de *alt-text* web con sobras de dominios sobrerrepresentados (comercio, fotografias de stock) y posible infrarrepresentacion de variedades dialectales, culturas no anglosajonas y terminologia tecnica.
- Riesgo de predicciones incorrectas en MLM: el modelo puede rellenar huecos con asociaciones estereotipadas o factualmente falsas, heredadas de los datos; no existe capa de alineacion que lo mitigue.
- Alucinacion en el sentido generativo: no aplica, al no producir texto libre. El riesgo equivalente es la sustitucion de tokens plausible pero incorrecta.
- Entrenamiento en fp32: no se declara el uso de bf16, lo que sugiere un coste de entrenamiento mayor y ausencia de tecnicas de estabilizacion modernas.
- Licencia MIT: permite uso comercial y modificacion con atribucion y sin garantia. No hay clausulas de uso aceptable ni restricciones adicionales, pero tampoco indemnizacion por parte del autor.
- Ausencia de pesos cuantizados y de *cards* de evaluacion: cualquier despliegue en produccion exige al equipo realizar su propia validacion, conversion de formato y pruebas de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NecroDevelopment/roberta-mlm-cc12m-100pct
- Modelo base segun el metadato de HuggingFace: https://huggingface.co/FacebookAI/xlm-roberta-base
- Repositorio del dataset citado en la model card: `pixparse/cc12m-wds` (referenciado por nombre, sin URL explicita en la informacion disponible)
- No se han encontrado otros enlaces relevantes: los resultados de la busqueda web disponible no guardan relacion con el modelo (contenido en chino sobre musica y buscadores, y un articulo politico sudafricano), por lo que se descartan como fuentes.
