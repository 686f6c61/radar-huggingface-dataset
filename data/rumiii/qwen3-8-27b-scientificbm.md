# Rumiii/Qwen3.8-27B-ScientificBM

## Resumen

Qwen3.8-27B-ScientificBM es un modelo de investigación especializado en convertir preguntas biomédicas en lenguaje natural a llamadas estructuradas a herramientas (tool calls). Desarrollado por el usuario Rumiii y publicado en Hugging Face, se trata de un fine-tune de Qwen/Qwen3.8-27B, un modelo denso de 27B parámetros, entrenado sobre el dataset gxx27/BioTool.

Su objetivo es resolver un problema concreto: actuar como capa de selección de herramientas y generación de argumentos de un asistente biomédico. Dada una pregunta del usuario y un conjunto de esquemas de herramientas, el modelo elige la API biomédica adecuada y rellena sus parámetros, cubriendo bases de datos públicas como NCBI, UniProt y Ensembl.

Es relevante porque aborda el nicho de agentes biomédicos con tool calling, una tarea donde los modelos generalistas suelen rendir de forma irregular. El modelo se publica con pesos completos fusionados en 16 bits (formato safetensors, unos 55,6 GB), bajo licencia Apache-2.0 y con uso declarado exclusivamente de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), pipeline image-text-to-text |
| Parametros totales | 27.781.427.952 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento excluyo muestras de mas de 3.072 tokens) |
| Tipos de cuantizacion | Pesos originales en 16 bits (bfloat16); probado informalmente en 4 bits |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos completos fusionados, 16 bits, ~55,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 27B parámetros de la familia Qwen3.8. No es un modelo MoE, por lo que todos los parámetros se activan en cada pasada. El fine-tune se distribuye como pesos completos fusionados en 16 bits, sin adaptadores LoRA separados.

El entrenamiento se realizó sobre el dataset gxx27/BioTool, centrado en llamadas a herramientas de tres bases de datos biomédicas: NCBI (E-utilities para búsqueda, fetch, link y summary, además de BLAST), UniProt (entradas de proteínas, proteomas, taxonomía, enfermedades, keywords y referencias cruzadas) y Ensembl (búsqueda de genes y transcritos, secuencias, variación, VEP, mapeo de coordenadas, genómica comparativa y regulación). Cada ejemplo de entrenamiento termina en una llamada a herramienta, y se excluyeron las muestras de más de 3.072 tokens. El modelo está entrenado para responder con una llamada estructurada corta en lugar de una traza de razonamiento larga, por lo que debe usarse con el thinking desactivado (`enable_thinking=False`).

## Capacidades

- Seleccion de herramientas biomedicas: dado un esquema estilo OpenAI de varias herramientas, elige la API correcta para la pregunta del usuario.
- Generacion de argumentos: rellena los parametros de la llamada con los valores extraidos de la pregunta (identificadores, coordenadas, especies, etc.).
- Cobertura de NCBI, UniProt y Ensembl: busquedas E-utilities, BLAST, entradas de proteinas, genes, transcritos, variacion, VEP y mapeo de coordenadas.
- Formato de salida estructurada: emite llamadas en formato `<function=...><parameter=...>` parseables con expresiones regulares.
- Pipeline image-text-to-text: la model card lo etiqueta como multimodal (herencia del modelo base), aunque el uso documentado es textual.
- No soporta cadenas multi-paso de herramientas: genera una sola llamada por peticion y no lee las salidas de las herramientas para redactar una respuesta final.
- No esta entrenado para el modo thinking: la capacidad de razonamiento no se mejoro respecto al modelo base y debe desactivarse.

## Casos de uso

- Planificacion en pipelines de bioinformatica: como primer paso de un pipeline, el modelo convierte una pregunta en la llamada a la API correcta; tu codigo ejecuta la llamada y procesa los resultados, separando planificacion de ejecucion.
- Prototipado de interfaces en lenguaje natural para NCBI, UniProt y Ensembl: permite que investigadores sin experiencia en estas APIs consulten bases de datos mediante preguntas en ingles.
- Investigacion en agentes biomedicos: sirve como componente de estudio para evaluar como los LLM seleccionan herramientas en el dominio biomédico.
- Benchmarking de tool calling biomedico: permite comparar enfoques de seleccion de herramientas biomédicas sobre el mismo conjunto de esquemas.
- Asistentes de laboratorio internos: integrable en herramientas internas de grupos de investigación para consultas recurrentes sobre genes, proteínas y variantes.
- Validacion de esquemas de herramientas: al generar llamadas estructuradas, facilita construir tests automaticos que verifiquen si los argumentos extraidos cumplen el esquema de la herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la informacion disponible. La model card reporta unicamente una prueba informal (smoke test) de nueve consultas biomedicas escritas a mano, cargando el modelo en 4 bits: el modelo selecciono la herramienta correcta e incluyo los valores clave de la pregunta en los nueve casos, presentando cada consulta junto a la herramienta correcta mas herramientas distractoras. Los autores advierten explicitamente que esto no debe interpretarse como una medida de precision global. Hay planificada una evaluacion completa sobre el split de test reservado de BioTool.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: unos 55-56 GB (tamano del repo de 55,6 GB), lo que requiere al menos una A100/H100 de 80 GB o dos GPUs de 48 GB (A6000, L40S).
- En 4 bits (formato mencionado en la prueba informal), la VRAM estimada baja a unos 16-18 GB, por lo que cabria en una RTX 4090 (24 GB) o RTX 5090, aunque el modelo no se distribuye pre-cuantizado.
- Con transformers>=5 y accelerate, `device_map="auto"` reparte el modelo entre las GPUs disponibles.
- Despliegue documentado: Hugging Face Transformers (v5 o posterior) con `AutoModelForMultimodalLM`. No se mencionan compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Se recomienda generacion determinista (`do_sample=False`) y `max_new_tokens` moderado (256 en el ejemplo oficial), ya que las respuestas son llamadas cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-ScientificBM | 27,8B (denso) | Tool calling biomedico (NCBI, UniProt, Ensembl) | Apache-2.0 | Pesos abiertos en Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B (denso) | Generalista multimodal | no disponible | Pesos abiertos en Hugging Face |
| Modelos generalistas con tool calling (p. ej. GPT-4-class o Qwen de tamano similar) | Variable | Tool calling generico, sin especializacion biomedica | Variable | Variable |

La ventaja diferencial del fine-tune es su fiabilidad en la seleccion de herramientas de las tres bases de datos objetivo; a cambio, pierde flexibilidad: no esta entrenado para esquemas de herramientas no vistos ni para cadenas multi-paso.

## Limitaciones y advertencias

- No apto para uso clinico: la model card lo declara expresamente; sus salidas no deben informar diagnostico ni tratamiento.
- Sin capacidad de abstencion: como todos los ejemplos de entrenamiento terminan en una llamada, el modelo tiende a llamar a una herramienta incluso con preguntas fuera del dominio biomedico. Filtra las preguntas fuera de ambito antes de invocarlo.
- Una sola llamada por peticion: no esta entrenado para cadenas de herramientas multi-paso ni para leer salidas de herramientas y redactar respuestas finales.
- Limitado a las herramientas vistas en entrenamiento: el comportamiento con esquemas no vistos u otras bases de datos no esta garantizado.
- Argumentos imperfectos: puede anadir parametros opcionales no solicitados o emitir valores tipo placeholder (por ejemplo, la cadena `"null"`). Valida cada llamada contra el esquema antes de ejecutarla.
- Prompts largos poco fiables: el entrenamiento excluyo muestras de mas de 3.072 tokens, por lo que esquemas de herramientas muy largos pueden degradar el rendimiento.
- Modo thinking no entrenado: la capacidad de razonamiento no mejoro respecto al modelo base y debe usarse con `enable_thinking=False`.
- Idioma: entrenado y documentado para ingles; el rendimiento en castellano no esta evaluado.
- Sesgos y riesgo de alucinacion: no disponible; no se han publicado evaluaciones formales de sesgo ni de tasa de alucinacion.
- Adopcion muy temprana: 67 descargas y 1 like en el momento de redaccion, sin comunidad ni evaluaciones de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rumiii/Qwen3.8-27B-ScientificBM
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento (BioTool): https://huggingface.co/datasets/gxx27/BioTool
- Paper referenciado en tags (arXiv): https://arxiv.org/abs/2605.05758
