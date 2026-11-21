# dphn/Dolphin3.0-Mistral-24B

## Resumen

Dolphin 3.0 Mistral 24B es un modelo de lenguaje instruct-tuned de tipo generalista desarrollado por Cognitive Computations (Eric Hartford, Ben Gitter, BlouseJury y colaboradores). Se construye mediante fine-tuning supervisado (SFT) sobre el modelo base mistralai/Mistral-Small-24B-Base-2501, con 23.572.423.680 parámetros reales según los pesos en safetensors. Forma parte de la colección Dolphin 3.0, orientada a ofrecer un modelo local "sin censura" y altamente dirigible mediante system prompt.

El objetivo declarado del proyecto es proporcionar una alternativa a los modelos propietarios (ChatGPT, Claude, Gemini) en la que el propietario del sistema conserva el control del system prompt, de la versión del modelo, de la alineación y de los datos. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y está pensado para ejecutarse en hardware local o en despliegues autoalojados.

La arquitectura subyacente es la de Mistral-Small-24B (transformer denso), con plantilla de chat ChatML y soporte declarado para casos de uso de código, matemáticas, agentes y function calling. La model card recomienda temperaturas muy bajas (0,05-0,1) para obtener los mejores resultados, una característica observada empíricamente en los modelos basados en Mistral-24B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Small-24B-Base-2501) |
| Parametros totales | 23.572.423.680 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF disponible (bartowski/cognitivecomputations_Dolphin3.0-Mistral-24B-GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (segun metadatos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF para llama.cpp/Ollama |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint Mistral-Small-24B-Base-2501 de Mistral AI. No se especifica en la informacion disponible si se aplicaron etapas de RLHF o DPO; la model card solo describe el proceso como instruct-tuning y menciona el uso de un reward model de RLHFlow para filtrar los datasets, asi como el uso de DeepSeek-V3 para aumentar los datos. La arquitectura concreta (número de capas, dimensiones, mecanismos de atención) corresponde a la del modelo base de Mistral, pero no se detalla en la informacion proporcionada.

El entrenamiento se apoya en una mezcla de datasets públicos de instrucciones, código, matemáticas, agentes y function calling: OpenCoder-LLM/opc-sft-stage1 y stage2, microsoft/orca-agentinstruct-1M-v1, microsoft/orca-math-word-problems-200k, NousResearch/hermes-function-calling-v1, AI-MO/NuminaMath-CoT, AI-MO/NuminaMath-TIR, allenai/tulu-3-sft-mixture, cognitivecomputations/dolphin-coder, HuggingFaceTB/smoltalk, cognitivecomputations/samantha-data, m-a-p/CodeFeedback-Filtered-Instruction y m-a-p/Code-Feedback. No se indica el número total de tokens de entrenamiento ni la composición exacta por porcentajes.

La plantilla de chat es ChatML (`<|im_start|>` / `<|im_end|>`), y el modelo está diseñado para ser dirigido mediante system prompt, sin alineación impuesta por el desarrollador. Se distribuye también un Modelfile para Ollama (aproximadamente 13 GB en la variante cuantizada referenciada).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Razonamiento general y respuesta a instrucciones en inglés.
- Generación y edición de código, con datasets específicos de código en el entrenamiento (OpenCoder, CodeFeedback, dolphin-coder).
- Razonamiento matemático, incluyendo cadenas de pensamiento (NuminaMath-CoT) y razonamiento con herramientas (NuminaMath-TIR).
- Function calling y tool calling, con datos de NousResearch/hermes-function-calling-v1.
- Capacidades agénticas y de instrucciones multi-paso, con microsoft/orca-agentinstruct-1M-v1.
- Alta dirigibilidad mediante system prompt: se puede definir personaje, tono, reglas de comportamiento y restricciones de dominio.
- Sin modo "thinking" explícito, visión, audio ni otras modalidades según la informacion disponible.
- Multilingüismo limitado: los metadatos declaran únicamente inglés.

## Casos de uso

- Asistente de código autoalojado: el modelo puede generar y revisar código en múltiples lenguajes y se integra en flujos de desarrollo locales; los datasets de OpenCoder y CodeFeedback respaldan esta capacidad, y la licencia Apache 2.0 permite su uso en productos comerciales.
- Automatización de atención al cliente con control total del system prompt: al no imponer alineación, la empresa define tono, políticas y restricciones, y el modelo mantiene conversaciones multi-turno con la plantilla ChatML.
- Agentes con function calling: los datos de hermes-function-calling-v1 permiten definir herramientas y esperar llamadas estructuradas, útil en pipelines de automatización de tareas.
- Tutoría matemática paso a paso: los datasets NuminaMath-CoT y NuminaMath-TIR aportan ejemplos de razonamiento matemático con y sin herramientas, adecuado para explicaciones detalladas.
- Generación de código en CI/CD: puede integrarse vía vLLM, TGI o llama.cpp para tareas de revisión, generación de tests o parcheo asistido, con la ventaja de que el modelo no cambia silenciosamente de versión.
- Despliegue local en estación de trabajo: con cuantización GGUF y Ollama (Modelfile de ~13 GB), puede ejecutarse en hardware de consumo para prototipado y uso personal.
- Investigación sobre alineación y steerability: al ser un modelo "uncensored" y dirigible, sirve para estudiar el efecto del system prompt en el comportamiento, aunque requiere supervisión.
- Procesamiento de datos sensibles on-premise: al ejecutarse localmente, las consultas no salen de la infraestructura del cliente, lo que encaja con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "Evals: TBD" y "Sample Outputs: TBD".

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 47 GB solo para pesos (23,57B parámetros × 2 bytes), más overhead de KV cache y activaciones; se recomienda al menos 48-80 GB.
- Cuantización GGUF: la variante referenciada para Ollama ocupa ~13 GB, lo que permite ejecución en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4080/4090) y en algunos casos con 12 GB usando cuantizaciones más agresivas.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPUs para FP16; RTX 4090 (24 GB) para cuantizaciones GGUF de 4-8 bits.
- Cabe en GPU de consumo: sí, en formato GGUF cuantizado; en FP16 no cabe en GPUs de consumo de 24 GB.
- Opciones de despliegue: Ollama (Modelfile incluido), LM Studio, Hugging Face Transformers, vLLM, SGLang y TGI, según la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Dolphin3.0-Mistral-24B | 23,57B | No disponible | Apache 2.0 | Hugging Face, GGUF, Ollama | Fine-tuning SFT de Mistral-Small-24B, dirigible, sin benchmarks publicados |
| Mistral-Small-24B-Base-2501 | ~24B | No disponible | Apache 2.0 | Hugging Face | Modelo base; sin alineación instruct específica |
| Modelos de la familia Dolphin 3.0 (otras tallas) | Variable | No disponible | Apache 2.0 | Hugging Face | Misma filosofía de steerability; datos concretos no disponibles en esta ficha |
| Alternativas instruct de ~24B | No disponible | No disponible | Variable | Variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado y declarado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Al ser un modelo "uncensored" y sin alineación impuesta, puede generar contenido inapropiado, sesgado o peligroso; el propietario del sistema es responsable de definir las salvaguardas mediante system prompt y filtros externos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones que cuantifiquen este riesgo.
- No se han publicado benchmarks ni evaluaciones de sesgo, por lo que no es posible caracterizar su comportamiento en dominios sensibles.
- La longitud de contexto no se detalla en la informacion disponible; conviene verificar la del modelo base antes de usarlo en tareas de contexto largo.
- La model card recomienda temperaturas muy bajas (0,05-0,1); valores superiores pueden degradar la calidad de forma notable.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base y los datasets subyacentes pueden tener sus propias condiciones; conviene revisarlas antes de un despliegue en producción.
- No dispone de visión, audio ni modo thinking explícito según la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/dphn/Dolphin3.0-Mistral-24B
- Colección Dolphin 3.0: https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3
- Cuantizaciones GGUF (bartowski): https://huggingface.co/bartowski/cognitivecomputations_Dolphin3.0-Mistral-24B-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Base-2501
- Organización Cognitive Computations: https://huggingface.co/cognitivecomputations
- Discord: https://discord.gg/tCMkMDDHwm
- Artículo sobre modelos uncensored: https://erichartford.com/uncensored-models
- OpenCoder-LLM: https://huggingface.co/OpenCoder-LLM
- NousResearch: https://huggingface.co/NousResearch
- AI-MO: https://huggingface.co/AI-MO
- allenai: https://huggingface.co/allenai
- HuggingFaceTB: https://huggingface.co/HuggingFaceTB
- m-a-p: https://huggingface.co/m-a-p
- RLHFlow: https://huggingface.co/RLHFlow
