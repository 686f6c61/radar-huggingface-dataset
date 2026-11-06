# labadain/Labadain-MedQA-QLoRA-LLaMA-3.1-8B-it-Tetun

## Resumen

Labadain-MedQA-QLoRA-LLaMA-3.1-8B-it-Tetun es un adaptador LoRA entrenado con QLoRA sobre Llama 3.1 8B-Instruct para responder preguntas médicas en tetun, la lengua cooficial de Timor-Leste. Lo desarrolla el Labadain Research Center (Dili, Timor-Leste) en colaboración con INESC TEC (HumaNISE, Porto), y aborda un problema concreto: la practicamente nula disponibilidad de asistentes médicos en una lengua de bajos recursos con millones de hablantes pero sin corpus tecnicos.

El modelo no es un checkpoint completo, sino un adaptador PEFT (0,2 GB en el repositorio) que se monta sobre `unsloth/Llama-3.1-8B-Instruct`. La adaptacion se hizo con QLoRA, cargando la base en 4 bits y entrenando solo los parametros LoRA, lo que permite reproducir el ajuste con hardware modesto. La relevancia actual esta en que documenta una metodologia replicable de transferencia cross-lingue de conocimiento medico (traduccion automatica con Gemini 2.5 Flash, revision ortografica y validacion por profesionales sanitarios nativos) para lenguas de bajos recursos.

Los resultados publicados son modestos: 21,75% de accuracy macro-promedio en 325 preguntas USMLE traducidas al tetun. Es un modelo de investigacion, no un producto clinico, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA sobre base cuantizada en 4 bits |
| Parametros totales | 8.030 millones (base Llama 3.1 8B-Instruct); el adaptador LoRA publicado ocupa 0,2 GB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B-Instruct) |
| Tipos de cuantizacion | Base cargada en 4 bits (bitsandbytes) durante entrenamiento e inferencia de referencia; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Tetun (tdt, tet); el ingles esta presente en los recursos de origen |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + `adapter_config.json`; requiere el checkpoint base por separado |

## Arquitectura y entrenamiento

La base es Llama 3.1 8B-Instruct, un transformer decoder-only denso de 8.000 millones de parametros con atencion por grupos (GQA) y ventana de contexto de 128.000 tokens. Sobre ella se aplico QLoRA: la base se carga cuantizada en 4 bits y se entrenan unicamente las matrices de bajo rango del adaptador, de modo que el artefacto publicado no contiene copia de los pesos originales. El entrenamiento uso Unsloth, Transformers y PEFT; los detalles de rango, alpha y modulos objetivo estan en `adapter_config.json` y no se reproducen en la model card.

El corpus de entrenamiento son 39.077 pares pregunta-respuesta medicos en tetun, construidos traduciendo material ingles: 33.135 pares del dataset de flashcards medicas (MedAlpaca) y 5.942 del dataset WikiDoc de informacion al paciente. La traduccion se hizo con Gemini 2.5 Flash mediante refinamiento iterativo de prompts y revision ortografica posterior, y se valido con un estudio de calidad sobre 100 documentos evaluados por profesionales sanitarios nativos en precision medica y fluidez en tetun. No se documenta en la informacion disponible el uso de RLHF o DPO adicional.

## Capacidades

- Generacion de texto conversacional en tetun con formato de chat (chat template de Llama 3.1).
- Respuesta a preguntas medicas de estilo USMLE (opcion multiple) y de informacion al paciente.
- Seguimiento de instrucciones heredado del ajuste instructivo de Llama 3.1 8B.
- Transferencia cross-lingue: el conocimiento medico adquirido en ingles se recupera en tetun.
- Capacidad multilingue residual del modelo base (Llama 3.1 soporta oficialmente ocho idiomas), aunque el ajuste esta orientado a tetun.
- No se documenta soporte especifico de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.
- No hay capacidades de vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Investigacion en QA medico en lenguas de bajos recursos: banco de pruebas para medir cuanto conocimiento medico en ingles se transfiere al tetun via QLoRA, usando los datasets USMLE traducidos como evaluacion estandarizada.
- Prototipos educativos no clinicos: respuestas de apoyo a estudiantes de medicina o personal de salud en formacion que trabajen en tetun, siempre con supervision y sin uso diagnostico.
- Informacion al paciente en tetun: el adaptador se entreno tambien con 5.942 pares del corpus WikiDoc de informacion al paciente, por lo que puede generar explicaciones divulgativas de patologias y tratamientos en lengua local para materiales revisados por clinicos.
- Evaluacion de metodologias de traduccion de corpus: comparar la calidad de la traduccion automatica con Gemini 2.5 Flash mas revision ortografica frente a otras estrategias, usando el modelo como sonda del corpus resultante.
- Experimentos de PEFT comparables: servir de referencia reproducible para estudiar el efecto del rango LoRA, los modulos objetivo y la cuantizacion 4-bit en la calidad final sobre una lengua de bajos recursos.
- Despliegue en hardware limitado para demos: al ser un adaptador sobre base 4-bit, cabe en una unica GPU de consumo, lo que facilita prototipos locales de asistencia linguistica sanitaria en Timor-Leste.
- Fine-tuning posterior: el adaptador puede servir de punto de partida para ajustes adicionales con datos locales revisados por hablantes nativos.

## Benchmarks y rendimiento

Evaluacion sobre 325 preguntas USMLE traducidas al tetun (opcion multiple):

| Conjunto de evaluacion | Preguntas | Accuracy |
|---|---:|---:|
| USMLE Step 1 (tetun) | 94 | 24,47% |
| USMLE Step 2 (tetun) | 109 | 21,10% |
| USMLE Step 3 (tetun) | 122 | 19,67% |
| Media macro entre pasos | 325 | 21,75% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en estos mismos conjuntos.

## Requisitos de hardware

- Inferencia con base en 4 bits (bitsandbytes) mas adaptador: aproximadamente 5-6 GB de VRAM para los pesos, mas overhead de activaciones y cache KV; en la practica, 8-10 GB segun longitud de contexto.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090.
- Para contexto largo (hasta 128K tokens) se necesita VRAM adicional por la cache KV; se recomienda A100 40/80 GB o H100 si se explota la ventana completa.
- Despliegue: el flujo documentado usa Unsloth + PEFT + Transformers. Al ser un adaptador, tambien puede fusionarse con la base y servirse con vLLM o TGI, o convertirse a GGUF para llama.cpp y Ollama; estas rutas no estan documentadas por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Labadain-MedQA-QLoRA-Llama-3.1-8B-it-tetun | 8B (adaptador LoRA) | 128K | QA medico en tetun | Llama 3.1 Community | Hugging Face, 39 descargas |
| Llama 3.1 8B-Instruct (base) | 8B | 128K | Instrucciones generales, 8 idiomas | Llama 3.1 Community | Hugging Face |
| MedAlpaca (variantes 7B/13B) | 7B / 13B | 4K aprox. | QA medico en ingles | Apache 2.0 / otras segun variante | Hugging Face |
| Modelos medicos en lenguas ibericas o portugues | no disponible | no disponible | QA medico en portugues | no disponible | no disponible |

No se dispone de resultados comparativos de benchmarks entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Accuracy de 21,75% en USMLE traducido: insuficiente para cualquier uso clinico o de apoyo a decision medica.
- Riesgo alto de alucinacion en contenido medico; las respuestas pueden ser plausibles pero incorrectas.
- El corpus de entrenamiento es traduccion automatica con revision ortografica y validacion limitada a 100 documentos, por lo que pueden persistir errores de traduccion y de terminologia medica.
- Cobertura limitada a tetun (y residual en ingles); no hay garantia de calidad en otras lenguas.
- Es un adaptador, no un modelo autonomo: requiere descargar y cargar el checkpoint base, y hereda sus sesgos y limitaciones.
- La licencia Llama 3.1 Community impone restricciones de uso comercial, requisitos de atribucion y una politica de uso aceptable; el uso medico regulado exige revision legal adicional.
- No hay evidencia de soporte de tool calling ni de agentes; no debe asumirse en produccion.
- El modelo fue creado y actualizado en fechas futuras respecto a la informacion de referencia (2026); verificar la vigencia de los artefactos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labadain/Labadain-MedQA-QLoRA-LLaMA-3.1-8B-it-Tetun
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Dataset de flashcards medicas: https://huggingface.co/datasets/labadain/Labadain-MedQA-MedAlpaca-Medical-Flashcards-English-Tetun
- Dataset WikiDoc de informacion al paciente: https://huggingface.co/datasets/labadain/Labadain-MedQA-MeadAlpaca-WikiDoc-Patient-Information-English-Tetun
- USMLE Step 1 (tetun): https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-1-English-Tetun
- USMLE Step 2 (tetun): https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-2-English-Tetun
- USMLE Step 3 (tetun): https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-3-English-Tetun
- Paper (arXiv 2611.00935): https://arxiv.org/abs/2611.00935
