# ArchiveStudio/Qwen2.5-VL-32B-Instruct

## Resumen

Qwen2.5-VL-32B-Instruct es un modelo multimodal de tipo image-text-to-text desarrollado por el equipo Qwen (Alibaba), distribuido en este repositorio por el usuario ArchiveStudio. Se trata de la variante de 32.000 millones de parametros de la familia Qwen2.5-VL, que incluye versiones de 3B, 7B, 32B y 72B. El modelo combina un codificador visual ViT con un modelo de lenguaje Qwen2.5, lo que le permite procesar imagenes, video y texto de forma conjunta y generar respuestas conversacionales.

El modelo resuelve tareas de comprension visual avanzada: reconocimiento de objetos, analisis de graficos, iconos y layouts, OCR sobre documentos y formularios, localizacion de objetos mediante bounding boxes o puntos, y comprension de videos de mas de una hora con capacidad de identificar el segmento temporal relevante. Ademas, incorpora comportamientos agenticos, pudiendo actuar como agente visual que razona y dirige herramientas para el uso de ordenador y de telefono movil.

Su relevancia actual radica en que ofrece capacidades multimodales cercanas a modelos propietarios en un tamano que cabe en hardware de gama alta de un solo nodo, con licencia Apache 2.0. La variante de 32B ha sido ademas reforzada mediante aprendizaje por refuerzo para mejorar matematicas, razonamiento logico y calidad subjetiva de las respuestas. El repositorio concreto analizado registra 0 descargas y 0 likes, y un tamano de 68,3 GB, coherente con pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador visual ViT (con window attention, SwiGLU y RMSNorm) + LLM Qwen2.5, con mRoPE extendido a la dimension temporal |
| Parametros totales | 33.452.718.336 (33,45 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (segun model card y tags del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 68,3 GB |
| Autor del repositorio | ArchiveStudio (modelo original de Qwen) |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de la familia Qwen2.5-VL: un codificador visual tipo ViT acoplado a un modelo de lenguaje Qwen2.5. El ViT incorpora window attention para acelerar entrenamiento e inferencia, y se ha optimizado con SwiGLU y RMSNorm para alinear su estructura con la del LLM. La componente de posiciones se basa en mRoPE, que en esta version se extiende a la dimension temporal con identificadores y alineacion de tiempo absoluto, lo que permite al modelo aprender secuencias y velocidades temporales y localizar momentos concretos dentro de un video. El muestreo dinamico de FPS (dynamic FPS sampling) permite ademas procesar videos con distintas tasas de muestreo y resolucion variable en el eje temporal.

En cuanto al entrenamiento, la model card indica que la variante de 32B se ha reforzado adicionalmente mediante aprendizaje por refuerzo (RL) sobre la formula original, mejorando capacidades matematicas y de resolucion de problemas, y ajustando el estilo de respuesta a preferencias humanas, con mayor nivel de detalle y claridad de formato en consultas objetivas de matematicas, razonamiento logico y Q&A de conocimiento. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO mas alla de la mencion generica al aprendizaje por refuerzo.

## Capacidades

- Generacion de texto conversacional y respuestas multi-turno a partir de entradas de imagen y texto.
- Comprension visual de objetos comunes (flores, aves, peces, insectos) y de contenido complejo: texto en imagenes, graficos, iconos, diagramas y layouts.
- OCR y comprension de documentos: facturas, formularios, tablas y escaneos, con generacion de salidas estructuradas (JSON) de coordenadas y atributos.
- Localizacion visual en distintos formatos: bounding boxes y puntos sobre objetos de la imagen, con salida estable en JSON.
- Comprension de video de mas de una hora, incluyendo capacidad de senalar el segmento temporal relevante para un evento.
- Comportamiento agentico: razonamiento y direccion dinamica de herramientas, con soporte declarado para computer use y phone use.
- Razonamiento matematico y visual: la model card reporta mejoras especificas en MathVista y MathVision obtenidas mediante RL.
- Generacion de codigo y resolucion de problemas de programacion (evaluado con MBPP y HumanEval en la model card).
- Salidas estructuradas y formatos de respuesta con formato ajustado a preferencias humanas.

## Casos de uso

- Digitalizacion de facturas y formularios: el modelo extrae texto y estructura de escaneos y devuelve JSON con campos y coordenadas, lo que permite integrarlo en pipelines de contabilidad y ERP sin reglas de plantilla especificas por proveedor.
- Analisis de documentos financieros y comerciales: interpretacion de tablas, graficos e informes en PDF o imagen, con salida estructurada apta para alimentar cuadros de mando.
- Agente de automatizacion de escritorio: uso declarado en tareas de computer use, con resultados publicados en ScreenSpot (88,5) y Android Control (69,6/93,3), adecuado para automatizar flujos de interfaz grafica.
- Automatizacion de movil y control de dispositivos: el modelo puede operar como agente visual sobre interfaces moviles, util en pruebas de QA de aplicaciones y en asistentes de accesibilidad.
- Moderacion y analisis de contenido audiovisual: comprension de videos de mas de una hora y localizacion temporal de eventos permite revisar grabaciones largas y marcar los fragmentos relevantes.
- Inspeccion visual y control de calidad: deteccion y localizacion de elementos en imagenes mediante bounding boxes y puntos, aplicable a verificacion de inventario, etiquetado o inspeccion industrial.
- Atencion al cliente multimodal: gestion de conversaciones multi-turno donde el usuario envia capturas de pantalla, fotos de producto o documentos, aprovechando la combinacion de conversacion y comprension de imagen.
- Asistencia en educacion y analisis de graficos: resolucion de problemas con soporte visual (evaluado en MathVista 74,7 y MathVision 40,0), util en tutoria automatizada de materias cientificas.
- Generacion y revision de codigo asistida: los resultados en HumanEval (91,5) y MBPP (84,0) lo hacen apto para integrarse en herramientas de completado y revision de codigo, aunque el foco principal del modelo es multimodal.

## Benchmarks y rendimiento

Resultados publicados en la model card para la variante de 32B, comparados con las variantes de 72B de Qwen2.5-VL y Qwen2-VL.

| Dataset (vision) | Qwen2.5-VL-72B | Qwen2-VL-72B | Qwen2.5-VL-32B |
|---|---|---|---|
| MMMU | 70,2 | 64,5 | 70,0 |
| MMMU Pro | 51,1 | 46,2 | 49,5 |
| MMStar | 70,8 | 68,3 | 69,5 |
| MathVista | 74,8 | 70,5 | 74,7 |
| MathVision | 38,1 | 25,9 | 40,0 |
| OCRBenchV2 | 61,5/63,7 | 47,8/46,1 | 57,2/59,1 |
| CC-OCR | 79,8 | 68,7 | 77,1 |
| DocVQA | 96,4 | 96,5 | 94,8 |
| InfoVQA | 87,3 | 84,5 | 83,4 |
| LVBench | 47,3 | no disponible | 49,0 |
| CharadesSTA | 50,9 | no disponible | 54,2 |
| VideoMME | 73,3/79,1 | 71,2/77,8 | 70,5/77,9 |
| MMBench-Video | 2,02 | 1,7 | 1,93 |
| AITZ | 83,2 | no disponible | 83,1 |
| Android Control | 67,4/93,7 | 66,4/84,4 | 69,6/93,3 |
| ScreenSpot | 87,1 | no disponible | 88,5 |
| ScreenSpot Pro | 43,6 | no disponible | 39,4 |
| AndroidWorld | 35,0 | no disponible | 22,0 |
| OSWorld | 8,83 | no disponible | 5,92 |

| Modelo (texto) | MMLU | MMLU-Pro | MATH | GPQA-diamond | MBPP | HumanEval |
|---|---|---|---|---|---|---|
| Qwen2.5-VL-32B | 78,4 | 68,8 | 82,2 | 46,0 | 84,0 | 91,5 |
| Mistral-Small-3.1-24B | 80,6 | 66,8 | 69,3 | 46,0 | 74,7 | 88,4 |
| Gemma3-27B-IT | 76,9 | 67,5 | 89,0 | 42,4 | 74,4 | 87,8 |
| GPT-4o-Mini | 82,0 | 61,7 | 70,2 | 39,4 | 84,8 | 87,2 |
| Claude-3.5-Haiku | 77,6 | 65,0 | 69,2 | 41,6 | 85,6 | 88,1 |

No se han publicado en la informacion disponible resultados de latencia, throughput ni benchmarks adicionales a los anteriores.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (33,45 B); no proceden de datos publicados en la model card.

- Inferencia en BF16/FP16: aproximadamente 67 GB solo para pesos, mas overhead de activaciones y cache KV. Requiere GPU de 80 GB (A100 80 GB, H100 80 GB) y aun asi con margen limitado; el procesamiento de imagenes de alta resolucion y de multiples fotogramas de video incrementa notablemente el uso de memoria.
- Inferencia en FP8: aproximadamente 34 GB de pesos. Encaja en A100 40 GB, L40S 48 GB o H100 con margen para contexto y vision.
- Inferencia en INT4 (si existe cuantizacion disponible): aproximadamente 17-19 GB de pesos, lo que permitiria ejecucion en GPU de consumo como RTX 4090 o RTX 3090 de 24 GB, con limitaciones de resolucion y numero de fotogramas.
- GPU de consumo: cabe en RTX 4090/3090 de 24 GB unicamente con cuantizacion de 4 bits; en precision completa o media no cabe en ninguna GPU de consumo.
- Despliegue: la libreria declarada es transformers (se recomienda instalar desde el codigo fuente de Hugging Face, ya que versiones antiguas lanzan `KeyError: 'qwen2_5_vl'`). Los tags del repositorio incluyen text-generation-inference y endpoints_compatible, lo que apunta a compatibilidad con TGI y con Hugging Face Inference Endpoints. Otras opciones (llama.cpp, Ollama, vLLM) no estan confirmadas para esta variante en la informacion disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Rendimiento destacado | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-VL-32B-Instruct (este) | 33,45 B | Multimodal (vision-texto) | no disponible | Apache 2.0 | MMMU 70,0; MathVista 74,7; HumanEval 91,5 | Hugging Face y ModelScope |
| Qwen2.5-VL-72B-Instruct | no disponible | Multimodal | no disponible | Apache 2.0 (segun el modelo original) | MMMU 70,2; OSWorld 8,83; AndroidWorld 35,0 | Hugging Face y ModelScope |
| Mistral-Small-3.1-24B | 24 B (aproximado, segun la tabla de la model card) | Multimodal | no disponible | no disponible en la informacion | MMLU 80,6; GPQA-diamond 46,0 | no disponible |
| Gemma3-27B-IT | 27 B | Multimodal | no disponible | no disponible en la informacion | MATH 89,0; MMLU 76,9 | no disponible |
| GPT-4o-Mini | no disponible | Propietario, multimodal | no disponible | propietaria | MMLU 82,0; MBPP 84,8 | API de OpenAI |

La comparativa con modelos puramente de texto no refleja las capacidades multimodales del modelo; en tareas de vision, la variante de 32B se situa proxima a la de 72B en varios conjuntos (MMMU, MathVista, AITZ) y la supera en MathVision (40,0 frente a 38,1) y CharadesSTA (54,2 frente a 50,9).

## Limitaciones y advertencias

- Repositorio no oficial: el modelo esta publicado por el usuario ArchiveStudio, no por el equipo Qwen. Registra 0 descargas y 0 likes, por lo que conviene verificar la integridad de los pesos y, en produccion, usar el repositorio oficial Qwen/Qwen2.5-VL-32B-Instruct.
- Idiomas: la model card solo declara soporte de ingles (en), pese a que la familia Qwen suele ser multilingue. No hay garantia de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en OCR de documentos con baja calidad de imagen, tablas densas o graficos ambiguos. Las coordenadas de bounding boxes y salidas JSON deben validarse en produccion.
- Limitaciones de contexto: no se especifica la longitud de contexto en la informacion disponible, lo que dificulta planificar cargas de video largo o documentos extensos sin pruebas previas.
- Rendimiento agentico limitado: los resultados en tareas de agente son dispares; OSWorld reporta 5,92 para esta variante frente a 8,83 del modelo de 72B, y AndroidWorld 22,0 frente a 35,0. Para automatizacion de escritorio de proposito general, la variante de 32B esta por detras de la de 72B.
- Coste de memoria en multimodal: la resolucion dinamica y el muestreo de FPS implican que el consumo de memoria crece con el numero de fotogramas y la resolucion, incluso usando cuantizacion de pesos.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero cualquier obligacion derivada del repositorio original debe comprobarse en la model card oficial.
- Requisito de version de transformers: el uso de versiones antiguas de la libreria provoca `KeyError: 'qwen2_5_vl'`; es necesario instalar transformers desde el codigo fuente.
- Datos incompletos: no hay informacion disponible sobre composicion del dataset de entrenamiento, tecnicas concretas de alineacion, tipos de cuantizacion publicados ni metricas de latencia.

## Enlaces

- Repositorio analizado: https://huggingface.co/ArchiveStudio/Qwen2.5-VL-32B-Instruct
- Repositorio oficial de la variante de 32B: https://huggingface.co/Qwen/Qwen2.5-VL-32B-Instruct
- Repositorio oficial de la variante de 72B: https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct
- Repositorio oficial de la variante previa de 72B: https://huggingface.co/Qwen/Qwen2-VL-72B-Instruct
- Blog de presentacion de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio en GitHub: https://github.com/QwenLM/Qwen2.5-VL
- Demo de chat: https://chat.qwenlm.ai/
- ModelScope (variante 32B): https://modelscope.cn/models/qwen/Qwen2.5-VL-32B-Instruct
- ModelScope (variante 72B): https://modelscope.cn/models/qwen/Qwen2.5-VL-72B-Instruct
- Referencia arXiv incluida en los tags del repositorio: https://arxiv.org/abs/2309.00071
- Referencia arXiv incluida en los tags del repositorio: https://arxiv.org/abs/2502.13923
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a un servicio educativo no relacionado.
