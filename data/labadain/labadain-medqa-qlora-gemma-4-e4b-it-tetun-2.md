# labadain/Labadain-MedQA-QLoRA-Gemma-4-E4B-it-Tetun

## Resumen

Labadain-MedQA-QLoRA-Gemma-4-E4B-it-Tetun es un adaptador LoRA (PEFT) entrenado con QLoRA sobre el checkpoint instruction-tuned `unsloth/gemma-4-E4B-it`, orientado a pregunta-respuesta médica en tetun, la lengua hablada en Timor-Leste. Lo desarrolla el Labadain Research Center (Dili, Timor-Leste) en colaboración con INESC TEC (HumaNISE, Porto, Portugal), y aborda un problema concreto: la practicamente nula cobertura de recursos de IA clínica en una lengua de bajos recursos como el tetun.

El modelo no redistribuye pesos completos: el repositorio (0,2 GB) contiene únicamente la configuración y los pesos del adaptador, que debe cargarse sobre el modelo base en 4 bits. La adaptación se apoya en 39.077 pares de pregunta-respuesta médicos traducidos del inglés al tetun (33.135 de flashcards tipo MedAlpaca y 5.942 de información para pacientes tipo WikiDoc), con revisión ortográfica posterior y un estudio de calidad de traducción con profesionales sanitarios nativos.

Es relevante ahora porque demuestra un flujo reproducible de adaptación lingüística de un modelo Gemma 4 de 4B efectivos a un dominio sanitario y a una lengua de bajos recursos, con evaluación sobre 325 preguntas estilo USMLE traducidas al tetun y una precisión media del 45,95%. Su utilidad es de investigación y acceso a información médica en tetun, no de uso clínico directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Gemma 4 E4B instruction-tuned; el adaptador en sí es una modificación de bajo rango, no una arquitectura propia |
| Parametros totales | No disponible (el adaptador no incluye los pesos completos del modelo base; tamaño del repo: 0,2 GB) |
| Parametros activos | No disponible (el modelo base se denomina "E4B"; no se confirma en la información disponible si es MoE) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa `max_seq_length=2048`) |
| Tipos de cuantizacion | QLoRA con carga del base en 4 bits (`load_in_4bit=True`, bitsandbytes); no se detallan otras cuantizaciones |
| Idiomas soportados | Tetun (`tdt`, `tet`); el inglés está presente en los recursos de origen |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

La adaptación se realiza mediante QLoRA: el modelo base `unsloth/gemma-4-E4B-it` se carga cuantizado en 4 bits y se entrenan únicamente los parámetros LoRA, que se publican como adaptador PEFT. La model card remite a `adapter_config.json` para el rank, alpha y módulos objetivo concretos, datos que no se reproducen en la información disponible. El entrenamiento se ejecutó con Unsloth, Transformers y PEFT. No se especifican el número de tokens de entrenamiento ni la composición exacta de las épocas; solo el corpus fuente.

El corpus se construyó traduciendo material médico inglés al tetun con Gemini 2.5 Flash, con refinamiento iterativo de prompts y revisión ortográfica. Se evaluó la calidad de traducción sobre 100 documentos con profesionales sanitarios nativos, considerando precisión médica y fluidez en tetun. No se indica en la información disponible si hubo RLHF, DPO u otra fase de alineación posterior al ajuste supervisado, ni innovaciones de decodificación (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional con plantilla de chat instruction-tuned (Gemma 4) y soporte de `chat_template.jinja`.
- Pregunta-respuesta médica en tetun: respuestas a preguntas clínicas, definiciones y material de estudio tipo USMLE.
- Seguimiento de instrucciones en tetun, con contexto bilingüe inglés-tetun en los datos de entrenamiento.
- Razonamiento sobre preguntas de opción múltiple de estilo médico (evaluado en USMLE Steps 1, 2 y 3).
- Capacidades heredadas del modelo base Gemma 4 E4B-it (generación de texto general, instruction following); la model card advierte que el ejemplo es solo texto y que Gemma 4 puede requerir APIs multimodales actualizadas según la versión de Unsloth/Transformers.
- No se documenta soporte específico de tool calling, function calling, agentes o multi-step reasoning en la información disponible.
- Capacidades multilingües limitadas al par tetun-inglés documentado; no se detallan otros idiomas.

## Casos de uso

- Investigación en QA médico en tetun: usar el adaptador para estudiar acceso a información sanitaria en lenguas de bajos recursos, comparando respuestas frente al modelo base sin adaptar.
- Formación de personal sanitario en Timor-Leste: generar preguntas y explicaciones de repaso tipo USMLE en tetun para material de estudio, con revisión humana obligatoria.
- Traducción y adaptación de contenido médico para pacientes: emplear los pares WikiDoc traducidos y el modelo para redactar explicaciones divulgativas en tetun a partir de fuentes inglesas.
- Evaluación de pipelines de adaptación lingüística: reproducir el flujo QLoRA + Unsloth + PEFT como referencia metodológica para otras lenguas de bajos recursos.
- Prototipos de asistentes de información sanitaria: desplegar un chatbot de consulta no diagnóstica en tetun, con contexto de 2048 tokens en el ejemplo de la model card y con derivación a profesionales.
- Investigación en calidad de traducción automática médica: comparar las salidas del adaptador con las traducciones de Gemini 2.5 Flash usadas en el corpus para medir fluidez y precisión terminológica.
- Benchmarking cross-lingual: evaluar la degradación de rendimiento de un modelo Gemma 4 de 4B al pasar de inglés a tetun en tareas de opción múltiple médica.

## Benchmarks y rendimiento

Evaluación sobre 325 preguntas USMLE traducidas al tetun, configuración QLoRA de 4 bits:

| Conjunto de evaluación | Preguntas | Precisión |
|---|---:|---:|
| USMLE Step 1 (tetun) | 94 | 43,62% |
| USMLE Step 2 (tetun) | 109 | 45,87% |
| USMLE Step 3 (tetun) | 122 | 48,36% |
| Media macro entre pasos | 325 | 45,95% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el ejemplo de inferencia carga el base en 4 bits con `max_seq_length=2048`, lo que sitúa el consumo en el rango propio de un modelo de 4B en 4 bits (aproximadamente 3-4 GB de pesos más overhead de activaciones y caché KV, estimación no confirmada por el autor).
- GPU recomendadas: no especificadas. Por tamaño, un modelo de 4B en 4 bits es viable en GPUs consumer con 8 GB o más; el adaptador añade un overhead mínimo (repo de 0,2 GB).
- Cabe en GPU consumer: previsiblemente sí en RTX 3060/4060 de 8 GB o superiores, sujeto a la longitud de contexto y al runtime; no verificado en la información disponible.
- Opciones de despliegue: el flujo documentado usa Unsloth (`FastModel`) + PEFT + Transformers + bitsandbytes. No se documentan vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA, requiere fusión o carga conjunta con el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Labadain-MedQA-QLoRA-Gemma-4-E4B-it-Tetun | Adaptador sobre base de 4B (E4B) | No disponible | 45,95% en 325 preguntas USMLE en tetun | No disponible | Adaptador PEFT en HuggingFace |
| Gemma 4 E4B-it (base, `unsloth/gemma-4-E4B-it`) | 4B efectivos (E4B) | No disponible | No evaluado en tetun en la información disponible | No disponible | Pesos completos en HuggingFace |
| Otros adaptadores médicos en lenguas de bajos recursos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de comparaciones con alternativas equivalentes en tetun en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: la precisión media del 45,95% en USMLE implica que más de la mitad de las respuestas de opción múltiple son incorrectas; no debe usarse para decisiones clínicas.
- Riesgo elevado de alucinación en contenido médico, agravado por el ajuste sobre traducciones automáticas (Gemini 2.5 Flash) con revisión limitada a 100 documentos de control de calidad.
- El adaptador no incluye los pesos del modelo base; su uso requiere descargar y cargar `unsloth/gemma-4-E4B-it` o `google/gemma-4-E4B-it`, con las dependencias y licencia correspondientes.
- Licencia no declarada en la información disponible: verificar términos antes de cualquier uso comercial.
- Cobertura lingüística restringida a tetun e inglés; no se documentan otros idiomas ni variantes dialectales.
- Longitud de contexto no especificada; el ejemplo usa 2048 tokens, lo que limita conversaciones y documentos largos.
- Posibles sesgos derivados de la fuente original en inglés (material USMLE y WikiDoc) y de la traducción automática, incluida terminología médica no adaptada culturalmente a Timor-Leste.
- La model card advierte que el código de ejemplo es ilustrativo y puede requerir APIs actualizadas de Gemma 4 según las versiones de Unsloth/Transformers.
- Sin datos publicados de sesgos medidos, latencia, throughput ni robustez fuera del dominio de QA médica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/labadain/Labadain-MedQA-QLoRA-Gemma-4-E4B-it-Tetun
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-E4B-it
- Dataset flashcards médicas EN-Tetun: https://huggingface.co/datasets/labadain/Labadain-MedQA-MedAlpaca-Medical-Flashcards-English-Tetun
- Dataset WikiDoc información a pacientes EN-Tetun: https://huggingface.co/datasets/labadain/Labadain-MedQA-MeadAlpaca-WikiDoc-Patient-Information-English-Tetun
- Dataset USMLE Step 1 EN-Tetun: https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-1-English-Tetun
- Dataset USMLE Step 2 EN-Tetun: https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-2-English-Tetun
- Dataset USMLE Step 3 EN-Tetun: https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-3-English-Tetun
- Referencia arXiv citada en los tags: arxiv:2611.00935 (no verificada en la información disponible)
