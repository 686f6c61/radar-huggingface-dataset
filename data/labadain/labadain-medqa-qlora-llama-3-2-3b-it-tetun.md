# labadain/Labadain-MedQA-QLoRA-LLaMA-3.2-3B-it-Tetun

## Resumen
Labadain-MedQA-QLoRA-LLaMA-3.2-3B-it-Tetun es un adaptador LoRA (PEFT) entrenado mediante QLoRA sobre el checkpoint `unsloth/Llama-3.2-3B-Instruct` de Meta, especializado en respuesta a preguntas médicas en tetun, la lengua hablada en Timor-Leste. Lo desarrolla el Labadain Research Center (Dili, Timor-Leste) en colaboración con INESC TEC (HumaNISE, Porto), y aborda el problema de la escasez de recursos de PLN sanitario en una lengua de bajos recursos: adapta el conocimiento médico del modelo base mediante traducción de material de QA médico del inglés al tetun.

El artefacto publicado no contiene los pesos completos del modelo base, sino únicamente los pesos del adaptador y su configuración, con un tamaño de repositorio de 0,1 GB. Se apoya en dos corpus traducidos propios que suman 39.077 pares de pregunta-respuesta en tetun, y su evaluación se realiza sobre 325 preguntas estilo USMLE traducidas. Es relevante por ser uno de los pocos intentos documentados de transferencia cross-lingual de conocimiento médico a tetun con un modelo compacto de 3B parámetros.

La relevancia práctica es doble: por un lado, sirve como caso de estudio metodológico de QLoRA aplicado a lenguas de bajos recursos; por otro, su rendimiento absoluto es bajo (20,41 % de precisión macro en USMLE), lo que lo sitúa como una base de investigación y no como un sistema clínico listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B), adaptación mediante LoRA sobre el modelo base |
| Parametros totales | No disponible (el adaptador no incluye los pesos del modelo base; el base Llama 3.2 3B-Instruct tiene 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Llama 3.2 3B-Instruct, no especificada en la model card) |
| Tipos de cuantizacion | El ejemplo de uso carga el base en 4 bits (bitsandbytes); no se enumeran otros formatos publicados |
| Idiomas soportados | Tetun (tdt); el inglés está presente en los recursos de origen |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base se obtiene por separado |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA entrenado con QLoRA: el checkpoint base `unsloth/Llama-3.2-3B-Instruct` se carga en forma cuantizada y los parámetros del adaptador se entrenan de forma separada, de modo que el artefacto publicado no contiene una copia completa de los pesos del modelo base. La configuración específica de LoRA (rank, alpha, módulos objetivo y referencia al checkpoint base) está en `adapter_config.json`, que no se detalla en la información disponible. El entrenamiento se realizó con Unsloth, Transformers y PEFT.

Los datos de entrenamiento provienen de dos colecciones traducidas del inglés al tetun: Labadain-MedQA Flashcards (33.135 pares QA) y Labadain-MedQA WikiDoc Patient Information (5.942 pares QA), con un total de 39.077 pares. La traducción se hizo automáticamente con Gemini 2.5 Flash, con refinamiento iterativo de prompts y revisión ortográfica posterior. Se realizó un estudio de calidad de traducción sobre 100 documentos médicos (50 pares QA) evaluados por profesionales sanitarios nativos en tetun, considerando precisión médica y fluidez. No se documentan en la información disponible fases de RLHF o DPO.

## Capacidades
- Generación de texto conversacional y respuesta a preguntas médicas en tetun.
- Seguimiento de instrucciones (instruction following) heredado del base Llama 3.2 3B-Instruct.
- Transferencia cross-lingual de conocimiento médico desde recursos en inglés al tetun.
- Formato de chat mediante plantilla de chat de Llama 3.2 (aplicable con `apply_chat_template`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada (no se documenta para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al tetun como idioma objetivo; el inglés aparece en los recursos de origen pero no se documenta como capacidad evaluada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el ejemplo de uso es explícitamente de inferencia solo texto.

## Casos de uso
- Investigación en QA médico en tetun: el adaptador permite experimentar con recuperación y respuesta a preguntas sanitarias en una lengua de bajos recursos, usando los corpus Labadain-MedQA como referencia de entrenamiento y evaluación.
- Estudio de transferencia cross-lingual: sirve para medir cuánto conocimiento médico en inglés se transfiere a tetun mediante QLoRA con un modelo de 3B, comparando con el base sin adaptar.
- Evaluación de PEFT sobre modelos instruction-tuned: útil como banco de pruebas reproducible para comparar configuraciones de LoRA (rank, alpha, módulos objetivo) en lenguas de bajos recursos.
- Prototipos educativos no clínicos: puede generar explicaciones divulgativas en tetun sobre conceptos médicos básicos (por ejemplo, "Saida mak diabetes?"), siempre con supervisión humana y sin uso diagnóstico.
- Análisis de calidad de traducción automática en dominio sanitario: el adaptador y sus corpus permiten estudiar errores de terminología médica en tetun y diseñar revisiones ortográficas y terminológicas.
- Generación de material de formación para personal sanitario local: apoyo a la redacción de borradores de preguntas y respuestas en tetun que después revisa un profesional nativo.
- Investigación sobre sesgos y alucinación en lenguas de bajos recursos: el modelo es un caso útil para medir cómo un base predominantemente anglófono alucina cuando se le fuerza a responder en tetun.

## Benchmarks y rendimiento

| Conjunto de evaluación | Preguntas | Precisión |
|---|---:|---:|
| USMLE Step 1 (tetun) | 94 | 15,96 % |
| USMLE Step 2 (tetun) | 109 | 24,77 % |
| USMLE Step 3 (tetun) | 122 | 20,49 % |
| Media macro entre steps | 325 | 20,41 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en los mismos conjuntos USMLE en tetun.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el ejemplo oficial carga el base en 4 bits, lo que en la práctica sitúa el consumo en el rango de pocos GB, pero no se publica una cifra concreta.
- GPU recomendadas: no especificadas en la información proporcionada.
- Cabe en GPU de consumo: no confirmado en la model card; el uso de carga en 4 bits sugiere que es viable en GPUs de consumo, pero no se documenta qué modelos concretos.
- Opciones de despliegue: el ejemplo oficial usa Unsloth + PEFT + Transformers + bitsandbytes. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Labadain-MedQA-QLoRA-LLaMA-3.2-3B-it-Tetun | 3B (base) + adaptador LoRA | No disponible | 20,41 % macro en USMLE tetun (325 preguntas) | llama3.2 | Hugging Face (adaptador) |
| Llama 3.2 3B-Instruct (base) | 3B | No disponible en esta ficha | No disponible en la información proporcionada | llama3.2 | Hugging Face |
| Alternativas de QA médico en lenguas de bajos recursos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada; la comparativa queda limitada al modelo base.

## Limitaciones y advertencias
- Rendimiento absoluto bajo: 20,41 % de precisión macro en USMLE en tetun, insuficiente para cualquier uso clínico o diagnóstico.
- Riesgo elevado de alucinación médica: el base es predominantemente anglófono y el adaptador se entrena sobre traducciones automáticas, lo que puede producir terminología o afirmaciones incorrectas en tetun.
- Calidad de datos dependiente de traducción automática (Gemini 2.5 Flash) con revisión ortográfica y un estudio de calidad limitado a 50 pares QA; no se documenta una revisión humana exhaustiva del corpus completo.
- Sesgos: no se documentan análisis de sesgos demográficos, culturales ni de género en la información disponible.
- Limitaciones de idioma: el adaptador está orientado a tetun; no se evalúa su rendimiento en inglés ni en otras lenguas.
- Licencia llama3.2: impone restricciones de uso comercial y obligaciones de atribución; debe revisarse la Llama 3.2 Community License antes de cualquier despliegue comercial.
- El artefacto es un adaptador, no un modelo completo: requiere descargar y cargar el base `unsloth/Llama-3.2-3B-Instruct` por separado, con el coste de almacenamiento y cómputo asociado.
- No se documentan soporte de tool calling, agentes ni modos de razonamiento extendido; no debe asumirse su disponibilidad.
- Uso previsto exclusivamente de investigación y prototipos educativos no clínicos con supervisión y medidas de seguridad.

## Enlaces
- Hugging Face del modelo: https://huggingface.co/labadain/Labadain-MedQA-QLoRA-LLaMA-3.2-3B-it-Tetun
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Dataset Flashcards: https://huggingface.co/datasets/labadain/Labadain-MedQA-MedAlpaca-Medical-Flashcards-English-Tetun
- Dataset WikiDoc Patient Information: https://huggingface.co/datasets/labadain/Labadain-MedQA-MeadAlpaca-WikiDoc-Patient-Information-English-Tetun
- Dataset USMLE Step 1 (tetun): https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-1-English-Tetun
- Dataset USMLE Step 2 (tetun): https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-2-English-Tetun
- Dataset USMLE Step 3 (tetun): https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-3-English-Tetun
- Paper (arXiv 2611.00935): https://arxiv.org/abs/2611.00935
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio PEFT: https://github.com/huggingface/peft
