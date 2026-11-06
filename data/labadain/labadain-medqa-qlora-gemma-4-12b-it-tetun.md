# labadain/Labadain-MedQA-QLoRA-Gemma-4-12B-it-Tetun

## Resumen

Labadain-MedQA-QLoRA-Gemma-4-12B-it-Tetun es un adaptador LoRA (PEFT) entrenado mediante QLoRA sobre el checkpoint instruction-tuned `unsloth/gemma-4-12b-it`, orientado a pregunta-respuesta médica en tetun, la lengua hablada en Timor-Leste. Lo desarrolla el Labadain Research Center (Dili, Timor-Leste) junto con INESC TEC (HumaNISE, Porto, Portugal), y aborda el problema del acceso a información sanitaria en una lengua de bajos recursos donde los LLM generalistas tienen un soporte muy limitado.

El modelo no es un checkpoint completo: el repositorio (0,3 GB) contiene únicamente los pesos del adaptador, la configuración LoRA y los ficheros de tokenizer/chat template asociados. Para inferencia es necesario cargar el modelo base Gemma 4 12B-it por separado, preferiblemente en 4 bits, y adjuntar el adaptador con PEFT. La adaptación se apoya en un corpus traducido de 39.077 pares de pregunta-respuesta médicos en tetun.

Su relevancia es doble: por un lado, demuestra que el ajuste fino parametrizado eficiente (QLoRA) permite transferir conocimiento médico a lenguas de bajos recursos con un coste de entrenamiento reducido; por otro, publica una evaluación sobre 325 preguntas estilo USMLE traducidas al tetun, con una precisión media del 48,64 %, lo que ofrece una referencia medible para una lengua con escasísimos benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 12B-it) con adaptador LoRA sobre el modelo base |
| Parametros totales | 12B en el modelo base; el adaptador LoRA no declara recuento propio (consultar `adapter_config.json`) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso fija `max_seq_length=2048`) |
| Tipos de cuantizacion | QLoRA con carga del base en 4 bits (bitsandbytes); otras cuantizaciones no disponibles |
| Idiomas soportados | tetun (`tdt`, `tet`); el ingles esta presente en los recursos de origen |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), mas `adapter_config.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 4 12B-it, un transformer decoder-only instruction-tuned de 12.000 millones de parametros. El entrenamiento emplea QLoRA: el modelo base se carga cuantizado en 4 bits y solo se actualizan los parametros LoRA, lo que reduce de forma notable los requisitos de memoria frente a un ajuste fino completo. El repositorio no incluye los pesos del modelo base, solo el delta del adaptador. Los detalles concretos de rango, alpha y modulos objetivo deben consultarse en el `adapter_config.json` del repositorio; no se especifican en la informacion disponible.

El corpus de entrenamiento se construyo traduciendo material medico ingles al tetun con Gemini 2.5 Flash, con refinamiento iterativo de prompts y revision ortografica posterior. Se publican dos colecciones: Labadain-MedQA Flashcards (33.135 pares QA) y Labadain-MedQA WikiDoc Patient Information (5.942 pares), con un total de 39.077 pares. Cada registro incluye los campos `input_en`, `input_tdt`, `output_en` y `output_tdt`. El control de calidad incluyo un estudio separado sobre 100 documentos medicos evaluados por profesionales sanitarios nativos de tetun en cuanto a precision medica y fluidez. El framework de entrenamiento fue Unsloth junto con Transformers y PEFT. No se detallan en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset final de entrenamiento ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas medicas en tetun, incluyendo explicaciones de conceptos clinicos (por ejemplo, "Saida mak diabetes?").
- Razonamiento medico basico orientado a preguntas de estilo USMLE (pasos 1, 2 y 3) en version traducida al tetun.
- Seguimiento de instrucciones y formato conversacional multi-turno mediante chat template (se incluye `chat_template.jinja`).
- Transferencia cross-lingual de conocimiento medico desde el ingles hacia el tetun.
- Capacidades heredadas del modelo base Gemma 4 12B-it (generacion general, codigo, matematicas) sujetas a posible degradacion por el ajuste especifico; no evaluadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada para este adaptador.

## Casos de uso

- Consulta medica informativa en tetun para poblacion general: el modelo responde preguntas frecuentes sobre enfermedades y cuidados basicos en lengua local, aprovechando los 39.077 pares QA traducidos del corpus de flashcards y WikiDoc.
- Apoyo a personal sanitario en Timor-Leste: traduccion y reformulacion de material clinico en ingles al tetun con terminologia consistente, util en entornos donde el ingles no es vehiculo habitual.
- Formacion y educacion medica: generacion de preguntas y explicaciones estilo USMLE en tetun para estudiantes de medicina, con una referencia de rendimiento medida del 48,64 % de precision.
- Investigacion en procesamiento de lenguas de bajos recursos: base reproducible para experimentos de transferencia cross-lingual y evaluacion de QLoRA en lenguas con pocos datos, dado que el adaptador y los datasets son publicos en Hugging Face.
- Sistemas de informacion al paciente en portales de salud: generacion de resumenes y respuestas a partir de documentacion de paciente traducida, con la advertencia de supervision humana por el riesgo de alucinacion medica.
- Prototipado rapido de asistentes conversacionales en tetun: al ser un adaptador de 0,3 GB sobre un base de 12B, permite iterar sobre el modelo base (4 bits, Unsloth/PEFT) sin reentrenar desde cero.
- Evaluacion comparativa de estrategias de cuantizacion: el ejemplo oficial carga el base en 4 bits, lo que sirve como referencia practica para medir el impacto de QLoRA en calidad frente a alternativas de ajuste completo.

## Benchmarks y rendimiento

Evaluacion sobre 325 preguntas estilo USMLE traducidas al tetun, con la configuracion QLoRA 4 bits reportada por los autores:

| Conjunto de evaluacion | Preguntas | Precision |
|---|---:|---:|
| USMLE Step 1 (tetun) | 94 | 51,06 % |
| USMLE Step 2 (tetun) | 109 | 44,04 % |
| USMLE Step 3 (tetun) | 122 | 50,82 % |
| Media macro entre pasos | 325 | 48,64 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos en tetun.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el ejemplo oficial carga el base de 12B en 4 bits (`load_in_4bit=True`) con `max_seq_length=2048`, lo que situa el consumo tipico en el rango de 8-10 GB para pesos cuantizados mas overhead de activaciones y cache KV (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano del base, una RTX 4090 (24 GB) o A100/H100 son opciones razonables para 4 bits; el ajuste fino completo del base de 12B requeriria hardware de mayor capacidad.
- Cabe en GPU de consumo: si, en configuracion 4 bits con GPUs de 16-24 GB (RTX 4080/4090, A5000), sujeto a verificacion en el runtime concreto.
- Opciones de despliegue: el ejemplo oficial usa Unsloth + PEFT + Transformers + bitsandbytes; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas comparables en tetun en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con modelos de la misma categoria (adaptadores medicos sobre LLM de ~12B y modelos multilingues de referencia):

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Labadain-MedQA-QLoRA-Gemma-4-12B-it-Tetun | 12B (base) + adaptador LoRA | no disponible | QLoRA medico en tetun | no disponible | Hugging Face (adaptador) |
| Gemma 4 12B-it (`unsloth/gemma-4-12b-it`) | 12B | no disponible | Instruction-tuned generalista | no disponible | Hugging Face |
| Alternativas medicas en lenguas de bajos recursos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion disponible adaptadores medicos comparables para tetun con resultados publicados.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere descargar y cargar el base `unsloth/gemma-4-12b-it` (o `google/gemma-4-12b-it`), lo que anula la ventaja de tamano del repositorio de 0,3 GB en terminos de despliegue.
- Precision media del 48,64 % en USMLE traducido: insuficiente para uso clinico sin supervision; aproximadamente la mitad de las preguntas se responden de forma incorrecta.
- Riesgo elevado de alucinacion en dominio medico, agravado por la traduccion automatica del corpus con Gemini 2.5 Flash y la revision limitada a 100 documentos.
- Cobertura linguistica restringida a tetun (y presencia de ingles en los datos de origen); no se documenta soporte para otras lenguas de Timor-Leste ni para portugues.
- Licencia no disponible: no puede confirmarse el uso comercial ni las obligaciones de atribucion; debe verificarse antes de cualquier despliegue productivo.
- Posible degradacion de capacidades generales del base (codigo, matematicas, instrucciones complejas) tras el ajuste especifico en dominio medico; no evaluado en la informacion disponible.
- El ejemplo de inferencia advierte que Gemma 4 puede requerir APIs actualizadas de modelo/procesador multimodal segun las versiones de Unsloth/Transformers, por lo que la reproducibilidad depende del entorno.
- Sin datos publicados de sesgos, toxicidad ni evaluaciones de seguridad en tetun.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labadain/Labadain-MedQA-QLoRA-Gemma-4-12B-it-Tetun
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-12b-it
- Dataset Flashcards: https://huggingface.co/datasets/labadain/Labadain-MedQA-MedAlpaca-Medical-Flashcards-English-Tetun
- Dataset WikiDoc Patient Information: https://huggingface.co/datasets/labadain/Labadain-MedQA-MeadAlpaca-WikiDoc-Patient-Information-English-Tetun
- Dataset USMLE Step 1 (tetun): https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-1-English-Tetun
- Dataset USMLE Step 2 (tetun): https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-2-English-Tetun
- Dataset USMLE Step 3 (tetun): https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-3-English-Tetun
- Referencia arXiv indicada en los tags: arxiv:2611.00935 (no verificada en la informacion disponible)
