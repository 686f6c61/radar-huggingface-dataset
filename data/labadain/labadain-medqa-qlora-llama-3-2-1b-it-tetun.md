# labadain/Labadain-MedQA-QLoRA-LLaMA-3.2-1B-it-Tetun

## Resumen

Labadain-MedQA-QLoRA-LLaMA-3.2-1B-it-Tetun es un adaptador LoRA (PEFT) entrenado con QLoRA sobre el checkpoint instructivo Llama 3.2 1B-Instruct de Meta, adaptado al tetun (tet), la lengua cooficial de Timor-Leste. Lo desarrolla el Labadain Research Center (Dili, Timor-Leste) en colaboración con INESC TEC (HumaNISE, Porto), con el objetivo de dotar de capacidades de respuesta a preguntas médicas a una lengua de bajos recursos practicamente ausente en los corpus de entrenamiento de los grandes modelos.

El modelo no es un checkpoint completo: se publica como adaptador de bajo rango que debe cargarse sobre `unsloth/Llama-3.2-1B-Instruct`. El entrenamiento se realizo sobre 39.077 pares de pregunta-respuesta medicos traducidos del ingles al tetun, procedentes de dos colecciones (Medical Flashcards y WikiDoc Patient Information). La relevancia actual reside en su caracter pionero: es una de las primeras adaptaciones documentadas de un LLM para QA medico en tetun, con un conjunto de evaluacion USMLE traducido y publicado abiertamente.

El tamano de la base (1.000 millones de parametros) y la naturaleza del adaptador lo convierten en una pieza ligera y desplegable en hardware de consumo, pensada para investigacion en transferencia cross-lingue y para prototipos educativos no clinicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) con adaptador LoRA (PEFT) entrenado mediante QLoRA |
| Parametros totales | 1.240 millones (modelo base Llama 3.2 1B); el adaptador publicado contiene solo los pesos LoRA |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama 3.2 1B) |
| Tipos de cuantizacion | Base cargada en 4 bits (bitsandbytes) para inferencia; el adaptador se publica en safetensors sin cuantizar |
| Idiomas soportados | Tetun (tdt, tet); el ingles esta presente en los recursos de origen |
| Licencia | Llama 3.2 Community License (`llama3.2`) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el checkpoint base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Llama 3.2 1B-Instruct, un transformer decoder-only denso de Meta con atencion por causalidad estandar y tokenizador propio de la familia Llama 3. Sobre el se aplica un adaptador LoRA entrenado con QLoRA: el checkpoint base se carga cuantizado a 4 bits y solo se actualizan los parametros de bajo rango, lo que reduce drasticamente los requisitos de memoria durante el ajuste. La configuracion exacta del adaptador (rango, alpha, modulos objetivo) esta en `adapter_config.json` y no se detalla en la model card.

El corpus de entrenamiento se construyo traduciendo material medico del ingles al tetun con Gemini 2.5 Flash, con refinamiento iterativo de prompts y revision ortografica posterior. Se emplearon dos colecciones: Labadain-MedQA Medical Flashcards (33.135 pares QA) y Labadain-MedQA WikiDoc Patient Information (5.942 pares), sumando 39.077 pares. Cada par incluye los campos `input_en`, `input_tdt`, `output_en` y `output_tdt`. Se realizo un estudio de calidad de traduccion sobre 100 documentos (50 pares QA) evaluados por profesionales sanitarios nativos en tetun, considerando precision medica y fluidez. El entrenamiento se llevo a cabo con Unsloth, Transformers y PEFT; no se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en tetun con formato de chat instructivo (chat template de Llama 3.2).
- Respuesta a preguntas medicas de estilo USMLE (opcion multiple) y de conocimiento medico general en tetun.
- Seguimiento de instrucciones heredado del checkpoint instructivo base.
- Traduccion implicita de conceptos medicos del ingles al tetun, dado el origen bilingue del corpus.
- Capacidad de razonamiento limitada por el tamano del modelo (1B); no dispone de modo "thinking" explicito.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes multi-paso: no documentado; el modelo esta orientado a QA de un solo turno.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Investigacion en QA medico en lenguas de bajos recursos: el adaptador sirve como linea base reproducible para experimentos de transferencia cross-lingue, con un conjunto de evaluacion USMLE en tetun publicado para comparar metodos.
- Prototipos educativos de salud en tetun: puede generar explicaciones divulgativas de conceptos medicos para materiales de formacion no clinica, siempre con supervision de profesionales sanitarios.
- Evaluacion de PEFT y QLoRA: util para estudiar el efecto del rango LoRA, la cuantizacion a 4 bits y el numero de pares de entrenamiento sobre el rendimiento en una lengua de bajos recursos.
- Sistemas de informacion al paciente en Timor-Leste: integrado en un asistente que responda dudas frecuentes sobre salud en tetun, con avisos claros de que no sustituye atencion medica.
- Generacion de material bilingue ingles-tetun: aprovechando los campos paralelos del corpus, puede apoyar la creacion de glosarios y fichas medicas en ambos idiomas.
- Despliegue en hardware modesto: al ser un adaptador sobre un modelo de 1B cuantizable a 4 bits, cabe en GPUs de consumo para demos locales y entornos con conectividad limitada, relevante en el contexto de Timor-Leste.
- Filtrado y preanotacion de corpus medicos: puede usarse para generar respuestas candidatas que luego revisen anotadores humanos en la construccion de nuevos datasets en tetun.

## Benchmarks y rendimiento

Evaluacion sobre 325 preguntas de estilo USMLE traducidas al tetun (resultados del adaptador Llama 3.2 1B-Instruct QLoRA en los experimentos de Labadain):

| Conjunto de evaluacion | Preguntas | Precision |
|---|---:|---:|
| USMLE Step 1 (tetun) | 94 | 15,96 % |
| USMLE Step 2 (tetun) | 109 | 22,94 % |
| USMLE Step 3 (tetun) | 122 | 13,93 % |
| Media macro entre pasos | 325 | 17,61 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos en estos conjuntos.

## Requisitos de hardware

- VRAM estimada: el checkpoint base de 1B en 4 bits ocupa aproximadamente 0,7-1 GB de pesos; con el adaptador, cache KV y overhead de runtime, la inferencia cabe en torno a 2-3 GB de VRAM (estimacion a partir del tamano del modelo, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, incluidas GPUs de gama media y algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: el ejemplo oficial usa Unsloth + PEFT + Transformers con carga en 4 bits (bitsandbytes). Tambien es viable fusionar el adaptador con el base y exportar a GGUF para llama.cpp u Ollama, o servir con vLLM/TGI tras la fusion, aunque estas rutas no estan documentadas por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Labadain-MedQA-QLoRA-LLaMA-3.2-1B-it-Tetun | 1B (base) + adaptador LoRA | No disponible | QA medico en tetun via QLoRA | Llama 3.2 | Hugging Face (adaptador PEFT) |
| Llama 3.2 1B-Instruct (base) | 1B | No disponible | Instructivo general multilingue | Llama 3.2 | Hugging Face |
| Llama 3.2 3B-Instruct | 3B | No disponible | Instructivo general multilingue | Llama 3.2 | Hugging Face |
| Gemma 2 2B Instruct | 2B | No disponible | Instructivo general multilingue | Gemma Terms | Hugging Face |

No se dispone de comparaciones de rendimiento publicadas entre este adaptador y alternativas en tetun en la informacion proporcionada.

## Limitaciones y advertencias

- Precision baja en QA medico: 17,61 % de media macro en USMLE tetun, insuficiente para cualquier uso clinico real; el propio autor lo orienta a investigacion y prototipos educativos.
- Riesgo elevado de alucinacion en contenido medico, agravado por el tamano reducido del modelo y la naturaleza traducida automaticamente del corpus.
- La traduccion del corpus se realizo con Gemini 2.5 Flash y solo se valido un subconjunto de 50 pares QA con profesionales; pueden persistir errores de terminologia medica en tetun.
- El adaptador no incluye los pesos del modelo base: es obligatorio descargar `unsloth/Llama-3.2-1B-Instruct` y respetar su licencia.
- Licencia Llama 3.2 Community License: permite uso comercial con condiciones (umbral de usuarios activos mensuales, obligaciones de atribucion y restricciones de uso aceptable); conviene revisar el texto completo antes de un despliegue en produccion.
- Contexto limitado por el modelo base y sin datos publicados sobre el maximo efectivo en tetun; el rendimiento decae en conversaciones multi-turno largas.
- Cobertura linguistica restringida a tetun (con presencia de ingles en el corpus); no se garantiza calidad en otras lenguas.
- No hay evidencia publicada de soporte de tool calling, agentes o multimodalidad; no debe asumirse su disponibilidad.
- El repositorio tiene un tamano de 0,0 GB y 29 descargas en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labadain/Labadain-MedQA-QLoRA-llama-3.2-1B-it-Tetun
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Dataset Medical Flashcards: https://huggingface.co/datasets/labadain/Labadain-MedQA-MedAlpaca-Medical-Flashcards-English-Tetun
- Dataset WikiDoc Patient Information: https://huggingface.co/datasets/labadain/Labadain-MedQA-MeadAlpaca-WikiDoc-Patient-Information-English-Tetun
- Dataset USMLE Step 1: https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-1-English-Tetun
- Dataset USMLE Step 2: https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-2-English-Tetun
- Dataset USMLE Step 3: https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-3-English-Tetun
- Paper (arXiv): 2611.00935
