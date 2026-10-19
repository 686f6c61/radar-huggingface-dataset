# maximerivest/paper-classifier-0.8B

## Resumen

paper-classifier-0.8B es un modelo de clasificación de artículos científicos publicado por el usuario maximerivest en HuggingFace, afinado a partir de Qwen/Qwen3.5-0.8B. Su particularidad es que no genera texto: ejecuta un único forward pass, conserva los logits del siguiente token correspondientes a los códigos de las opciones ofrecidas y aplica una softmax sobre ese subconjunto, devolviendo una distribución de probabilidad sobre las etiquetas candidatas. El modelo tiene 1.006.672.704 parámetros según los pesos en safetensors y se distribuye bajo licencia Apache 2.0.

Resuelve dos tareas concretas. La primera es `classify`, que asigna un paper a una de entre 2 y 562 opciones de un esquema de clasificación arbitrario: campos de OpenAlex, categorías de arXiv, MeSH, una taxonomía propia o los grupos de lectura de un laboratorio. La segunda es `is_on_topic`, que responde sí o no a si un tema concreto es un asunto central del artículo, admitiendo opcionalmente una definición para desambiguar términos.

Su relevancia práctica es el coste por documento: el autor reporta unas 60.000 clasificaciones por hora en una única RTX 3090 para una pregunta de 176 opciones (0,065 s por paper) y 330.000 por hora en preguntas de sí/no, lo que sitúa el procesado de un millón de papers en torno a 4 dólares a 0,25 dólares por hora de GPU. Está orientado a inglés y fue creado para el proyecto Science Made Readable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3_5_text`); fine-tune de Qwen/Qwen3.5-0.8B |
| Parametros totales | 1.006.672.704 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); tamaño del repositorio 2,0 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y se especializa en una tarea de clasificación por lectura de logits en lugar de generación autoregresiva. Cada opción del esquema recibe un código de dos letras (`AA`, `AB`, `AC`, …, hasta 562 códigos) elegido para que sea un único token; el modelo puntúa únicamente los logits de esos códigos, de ahí que una pregunta con 176 opciones requiera un solo paso y no 176 consultas. Los identificadores de token de los códigos y de los tokens `yes`/`no` se guardan en `classifier.json`.

El prompt es parte integral del comportamiento del modelo: un mensaje de sistema fijo que describe la tarea y un mensaje de usuario que coloca primero el paper (título, venue y año opcionales, abstract) y después la pregunta, usando la plantilla de chat de Qwen3.5 con el modo de razonamiento desactivado (`enable_thinking=False`). El autor distribuye `paper_classifier.py`, de unas 40 líneas, que reproduce exactamente ese prompt y advierte explícitamente de que debe usarse en lugar de escribir uno propio.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card sí menciona que el modelo fue evaluado en un benchmark experto reservado (*held-out*) y en esquemas de clasificación que nunca vio durante el entrenamiento, como evidencia de generalización a taxonomías nuevas.

## Capacidades

- Clasificación zero-shot sobre esquemas arbitrarios: de 2 a 562 opciones, con nombre, descripción y padre opcionales por opción.
- Salida probabilística normalizada: las probabilidades devueltas por `classify` suman 1 sobre el conjunto de opciones ofrecidas.
- Preguntas de pertenencia a tema (`is_on_topic`) con respuesta sí/no y probabilidad asociada, con definición opcional para resolver ambigüedades léxicas.
- Generalización a taxonomías no vistas durante el entrenamiento, según las pruebas del autor en esquemas reservados.
- Ingesta de metadatos bibliográficos: título, abstract, venue y año (venue y año opcionales; `"(no abstract)"` cuando falta).
- Sin generación de texto: no produce resúmenes, explicaciones ni justificaciones, solo la distribución sobre las opciones.
- Sin soporte documentado de tool calling, function calling, uso como agente, razonamiento multi-paso, visión ni audio.
- Multilingüismo: solo inglés declarado; no hay datos sobre comportamiento en otros idiomas.
- Integración estándar con `transformers` (versión 5.3 o superior) y PyTorch.

## Casos de uso

- Indexación masiva de literatura científica: procesar un repositorio completo de PDFs y asignar cada registro a una taxonomía tipo OpenAlex o arXiv, aprovechando las 60.000 clasificaciones por hora en una sola RTX 3090.
- Enriquecimiento de bases de datos internas con taxonomías propias: definir las etiquetas del equipo (por ejemplo, grupos de lectura o áreas de un departamento) y clasificar el corpus con `scheme` y `options` personalizados, sin reentrenar.
- Revisiones sistemáticas y alertas bibliográficas: usar `is_on_topic` con definición para decidir si un paper entrante trata realmente el tema de interés, filtrando falsos positivos por menciones de pasada o por homonimia.
- Enrutado editorial y asignación de revisores: clasificar manuscritos por subcampo para dirigirlos al editor o al panel adecuado, con la distribución completa de probabilidades como señal de confianza y de posible ambigüedad entre áreas.
- Construcción de mapas de ciencia y análisis bibliométrico: etiquetar grandes volúmenes de publicaciones para agregar producción por campo, institución o país, y para agrupar documentos antes de un clustering temático.
- Filtrado de relevancia en pipelines RAG sobre corpus científico: descartar documentos no pertinentes antes de la indexación vectorial, reduciendo el ruido del recuperador con un coste de milisegundos por documento.
- Monitorización de producción científica por área: ejecutar clasificaciones periódicas sobre los feeds de revistas o de repositorios preprint para detectar crecimiento de un subcampo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de exactitud (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card menciona una evaluación sobre un benchmark experto reservado y sobre esquemas no vistos, pero no incluye las cifras en el material proporcionado.

Los únicos datos de rendimiento disponibles son de throughput y coste:

| Métrica | Valor | Condiciones |
|---|---|---|
| Throughput, pregunta de 176 opciones | ~60.000 papers/hora | 1x RTX 3090 |
| Latencia por paper, 176 opciones | 0,065 s | 1x RTX 3090 |
| Throughput, pregunta sí/no | ~330.000 papers/hora | 1x RTX 3090 |
| Latencia por paper, sí/no | 0,028 s | 1x RTX 3090 |
| Coste por millón de papers | ~4 USD | A 0,25 USD/hora de GPU |

## Requisitos de hardware

- VRAM estimada: en fp16 los pesos ocupan aproximadamente 2 GB (el repositorio completo son 2,0 GB); con caché de activaciones y overhead de runtime, el orden de magnitud razonable es de 3 a 4 GB. Cifra estimada a partir del número de parámetros, no publicada por el autor.
- GPU validadas: el autor reporta mediciones sobre una RTX 3090. No se documentan pruebas en A100, H100 ni otras GPU de datacenter.
- Cabe en GPU de consumo: sí, con holgura, dado el tamaño de 1 B de parámetros. Una GPU consumer de 8 GB o más debería alojarlo en fp16.
- Despliegue: la vía documentada es `transformers` (>= 5.3) más PyTorch, cargando `paper_classifier.py` desde el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; conviene tener en cuenta que el método necesita acceso a los logits del siguiente token, por lo que la pila de servicio debe exponerlos y no solo el texto generado.
- Latencia y throughput: los indicados en la tabla anterior, medidos en una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Velocidad relativa | Licencia |
|---|---|---|---|---|---|
| paper-classifier-0.8B | 1.006.672.704 | No disponible | Clasificación por logits, sin generación | Referencia (60.000 papers/h a 176 opciones, RTX 3090) | Apache 2.0 |
| paper-classifier-2B (sibling del mismo autor) | ~2 B (según el nombre; no verificado) | No disponible | Mismo enfoque | Aproximadamente la mitad de rápida | No disponible |
| Qwen/Qwen3.5-0.8B (modelo base) | No disponible | No disponible | Generación de texto general | No comparable: requiere generar por cada opción | No disponible |
| Clasificadores zero-shot basados en NLI | No disponible | No disponible | Inferencia de entailment | No disponible | No disponible |

La comparación relevante es interna a la familia: el propio autor describe paper-classifier-2B como «ligeramente más preciso, la mitad de rápido», sin publicar cifras de exactitud en el material disponible. No se dispone de datos verificables para comparar con clasificadores científicos especializados de terceros.

## Limitaciones y advertencias

- Solo inglés declarado; el comportamiento con abstracts en castellano u otros idiomas no está documentado ni garantizado.
- Ausencia de clase «ninguna de las anteriores» en `classify`: al aplicar softmax sobre las opciones ofrecidas, la probabilidad se reparte siempre entre ellas, de modo que un paper ajeno a todas las etiquetas recibirá igualmente una asignación. Para descartes conviene usar `is_on_topic` o umbrales de confianza.
- Riesgo de error silencioso: el modelo no genera justificación ni texto de apoyo, por lo que una clasificación incorrecta es difícil de detectar sin revisión humana o sin una muestra de validación propia.
- El prompt no es intercambiable: el autor advierte de que debe usarse `paper_classifier.py` o replicar su lógica, porque el modelo fue entrenado con ese formato exacto (mensaje de sistema fijo, paper antes de la pregunta, `enable_thinking=False`).
- Dependencia de versión: requiere `transformers` 5.3 o superior.
- Sesgos: no se documenta la composición del corpus de entrenamiento ni análisis de sesgos por disciplina, idioma, país ovenue, por lo que no puede descartarse un sesgo hacia los campos y revistas sobrerrepresentados.
- Longitud de contexto no disponible: no se especifica cuántos tokens de título y abstract admite; abstracts muy largos podrían truncarse sin que la documentación lo indique.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización el 2026-10-18; no hay validación independiente publicada.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y de atribución; conviene verificar también las condiciones del modelo base Qwen3.5-0.8B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maximerivest/paper-classifier-0.8B
- Modelo hermano (2B): https://huggingface.co/maximerivest/paper-classifier-2B
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Script de inferencia y prompt de referencia: `paper_classifier.py` y `classifier.json` en el repositorio de HuggingFace
- Proyecto para el que fue desarrollado: https://sciencemadereadable.com
- Paper técnico: no disponible
- Demo o Space: no disponible
