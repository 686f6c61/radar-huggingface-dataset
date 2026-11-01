# R4xx1/Dolphin3.0-Llama3.1-8B-GGUF

## Resumen

Dolphin 3.0 Llama 3.1 8B es un modelo de lenguaje instruct-tuned desarrollado por Cognitive Computations (Eric Hartford, Ben Gitter, BlouseJury y colaboradores) como parte de la colección Dolphin 3.0. Se construye sobre el modelo base meta-llama/Llama-3.1-8B mediante fine-tuning supervisado (SFT) sobre una mezcla curada de datasets abiertos orientados a código, matemáticas, function calling y conversación general. El repositorio reseñado aquí es una cuantización GGUF publicada por el usuario R4xx1, que empaqueta los pesos en formato listo para inferencia local con llama.cpp, Ollama o LM Studio.

El modelo resuelve el problema del control del sistema prompt y de la alineación en despliegues empresariales: a diferencia de modelos propietarios, Dolphin no impone directrices éticas fijas y permite al operador definir el tono, las reglas y el comportamiento mediante el system prompt. Con 8.030.277.696 parámetros (8B) y una ventana de contexto heredada de Llama 3.1 de 128.000 tokens, está pensado como modelo generalista de uso local para coding, matemáticas, agentes y function calling.

Es relevante ahora porque la cuantización GGUF permite ejecutarlo en hardware de consumo, y porque la colección Dolphin 3.0 se apoya en datasets recientes de alta calidad (tulu-3-sft-mixture, NuminaMath, orca-agentinstruct, hermes-function-calling) filtrados con un reward model de RLHFlow. La licencia Llama 3.1 mantiene las restricciones de uso de Meta, lo que condiciona su explotación comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), fine-tuning SFT |
| Parametros totales | 8.030.277.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no confirmada explícitamente en la model card) |
| Tipos de cuantizacion | GGUF (el repositorio es una cuantización GGUF; la model card cita Q4_0 como ejemplo) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (repo de cuantización); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atención por grupos (GQA) y RoPE, sin componentes MoE ni SSM. Sobre esa base, Cognitive Computations aplicó un fine-tuning supervisado (SFT) con una mezcla de datasets que incluye OpenCoder opc-sft-stage1 y opc-sft-stage2, microsoft/orca-agentinstruct-1M-v1, microsoft/orca-math-word-problems-200k, NousResearch/hermes-function-calling-v1, AI-MO/NuminaMath-CoT, AI-MO/NuminaMath-TIR, allenai/tulu-3-sft-mixture, cognitivecomputations/dolphin-coder, HuggingFaceTB/smoltalk, cognitivecomputations/samantha-data, m-a-p/CodeFeedback-Filtered-Instruction y m-a-p/Code-Feedback.

La model card indica que los datasets fueron filtrados con un reward model de RLHFlow y que se empleó Deepseek-V3 para etiquetado de datos. El entrenamiento se realizó con recursos cedidos por Crusoe Cloud (16x L40S), Akash (8x H100) y Lazarus (16x H100), y Cerebras aportó servicios de inferencia para el etiquetado. No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si hubo fases de RLHF o DPO posteriores al SFT. La plantilla de chat es ChatML (`<|im_start|>` / `<|im_end|>`), lo que difiere de la plantilla nativa de Llama 3.1.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Generación de código en múltiples lenguajes, reforzada por los datasets OpenCoder, dolphin-coder y CodeFeedback.
- Razonamiento matemático con cadena de pensamiento (NuminaMath-CoT) y razonamiento con herramientas (NuminaMath-TIR).
- Function calling y tool calling, apoyado en hermes-function-calling-v1 y orca-agentinstruct.
- Comportamiento agéntico y razonamiento multi-paso, derivado de orca-agentinstruct-1M-v1.
- Control fino del comportamiento mediante system prompt (tono, reglas, rol, restricciones de dominio).
- Capacidad multilingüe limitada: el modelo está etiquetado únicamente para inglés.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente de coding local: el modelo puede generar, explicar y refactorizar código en un entorno sin conexión usando llama.cpp u Ollama, aprovechando el entrenamiento sobre OpenCoder y CodeFeedback para tareas de Python, Go, JavaScript y otros lenguajes.
- Automatización de function calling en pipelines internos: gracias a hermes-function-calling-v1 y orca-agentinstruct, puede emitir llamadas estructuradas a APIs y encadenar pasos en flujos de agentes con contexto largo.
- Tutor de matemáticas paso a paso: con NuminaMath-CoT y NuminaMath-TIR puede resolver problemas mostrando el razonamiento intermedio y verificando resultados con herramientas de cálculo.
- Atención al cliente con personalidad controlada: el operador define mediante system prompt el tono, las reglas y los límites del asistente, y el modelo mantiene conversaciones multi-turno dentro de la ventana de contexto de Llama 3.1.
- Generación de código en CI/CD: integrado vía vLLM o TGI, puede revisar diffs, sugerir parches y generar tests en un pipeline automatizado, con la ventaja de que los pesos son locales y no salen de la infraestructura.
- Prototipado de agentes de investigación: al soportar tool calling y razonamiento multi-paso, sirve para construir agentes que consulten bases de datos, ejecuten código y sinteticen resultados en una máquina con una sola GPU.
- Despliegue en estaciones de trabajo sin GPU dedicada: la cuantización GGUF Q4_0 permite ejecutarlo en CPU con llama.cpp u Ollama para tareas de asistencia y generación de texto de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original indica explícitamente "Evals: TBD", por lo que no hay cifras de MMLU, HumanEval, GSM8K ni comparativas numéricas verificables.

## Requisitos de hardware

- VRAM estimada: en FP16 el modelo de 8B requiere aproximadamente 16 GB de VRAM; en cuantización GGUF Q4_0 se reduce a unos 4,5-5 GB, y en Q8_0 a unos 8,5-9 GB (estimaciones estándar para 8B, no publicadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16 y serving de alta concurrencia; RTX 4090 (24 GB) para FP16 sin problema; RTX 3090/4080 (16-24 GB) para FP16 o Q8.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 en cuantizaciones Q4-Q8; en Q4 puede ejecutarse incluso en CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF:Q4_0`), LM Studio, llama.cpp, Hugging Face Transformers, vLLM, SGLang y TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dolphin 3.0 Llama 3.1 8B (esta ficha) | 8B | 128k (heredado) | llama3.1 | GGUF / safetensors | SFT sobre mezcla de código, matemáticas y agentes; system prompt libre |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | llama3.1 | safetensors | Alineación oficial de Meta, más restrictivo con el system prompt |
| Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 | safetensors / GGUF | Multilingüe, licencia permisiva, buen rendimiento en código y matemáticas |
| Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | safetensors / GGUF | Contexto menor, licencia permisiva, ecosistema amplio |

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre datasets abiertos sin una fase de alineación con RLHF, puede reproducir sesgos presentes en tulu-3, smoltalk, samantha-data y otros corpus; la ausencia de directrices fijas traslada la responsabilidad al operador.
- Alucinación: no hay datos de evaluación publicados que cuantifiquen la tasa de alucinación; en tareas factuales conviene verificar las salidas.
- Idioma: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: la ventana de 128k se hereda de Llama 3.1, pero no se confirma en la model card que el fine-tuning haya preservado el rendimiento en contextos largos.
- Licencia: la licencia llama3.1 impone restricciones de uso comercial (política de uso aceptable de Meta, obligaciones de atribución y límite de 700 millones de usuarios mensuales para productos derivados), por lo que no es una licencia permisiva tipo Apache 2.0.
- Producción: el repositorio GGUF tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-01); no hay evidencia de validación comunitaria de esta cuantización concreta.
- Plantilla: usa ChatML en lugar de la plantilla nativa de Llama 3.1, lo que exige configurar correctamente el template en el servidor de inferencia.
- Repositorio: el tamaño de 88,8 GB sugiere múltiples cuantizaciones empaquetadas; conviene verificar la integridad de los ficheros antes de desplegar.

## Enlaces

- HuggingFace (cuantización GGUF): https://huggingface.co/R4xx1/Dolphin3.0-Llama3.1-8B-GGUF
- Modelo original Dolphin 3.0 Llama 3.1 8B: https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B
- Colección Dolphin 3.0: https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Ensayo sobre modelos sin censura de Eric Hartford: https://erichartford.com/uncensored-models
- Discord de Cognitive Computations: https://discord.gg/tCMkMDDHwm
- Descarga de Ollama: https://ollama.com/download
