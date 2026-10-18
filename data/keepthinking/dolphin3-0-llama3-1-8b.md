# KeepThinking/Dolphin3.0-Llama3.1-8B

## Resumen

Dolphin 3.0 Llama 3.1 8B es un modelo de lenguaje instructivo de 8.030.277.632 parámetros, obtenido mediante fine-tuning de `meta-llama/Llama-3.1-8B`. Forma parte de la colección Dolphin 3.0, orientada a construir un modelo generalista y autoalojable para programación, matemáticas, uso agéntico, function calling y conversación. El repositorio de HuggingFace está publicado por KeepThinking; la model card atribuye la curaduría y el entrenamiento a Eric Hartford, Ben Gitter, BlouseJury y Cognitive Computations.

La propuesta principal de Dolphin es el control por parte del propietario del sistema: el prompt de sistema, la alineación y las políticas de uso las define quien despliega el modelo, no el proveedor. Esto lo hace atractivo para empresas que quieren evitar dependencias de APIs cerradas y mantener las consultas en su propia infraestructura. El modelo declara únicamente inglés, licencia Llama 3.1 y pesos en safetensors.

Técnicamente es un transformer decoder-only denso, sin mezcla de expertos, con 8,03 mil millones de parámetros. Hereda del modelo base Llama 3.1 8B una ventana de contexto de hasta 128.000 tokens, aunque la model card de este fine-tune no detalla ese dato de forma explícita. Los resultados publicados en el model-index muestran un buen rendimiento en seguimiento de instrucciones (IFEval 76,21) pero valores bajos en razonamiento y conocimiento avanzado, por lo que conviene tratarlo como un modelo local de propósito general y no como sustituto de modelos mayores en tareas de alta exigencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, basado en Llama 3.1 8B |
| Parámetros totales | 8.030.277.632 (8,03 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens heredados de Llama 3.1 8B; no verificado en la model card de este fine-tune |
| Tipos de cuantización | No se listan cuantizaciones oficiales; el repositorio contiene safetensors |
| Idiomas soportados | `en` (inglés); no se declaran otros idiomas |
| Licencia | `llama3.1` (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B, un transformer decoder-only denso con 8,03 mil millones de parámetros. No es un modelo MoE ni híbrido: toda la capacidad del modelo se activa en cada token. El fine-tuning se presenta como un ajuste instructivo supervisado (SFT) sobre una mezcla de datasets orientados a código, matemáticas, agentes, function calling y conversación. Entre los datasets declarados están OpenCoder SFT stage 1 y 2, `microsoft/orca-agentinstruct-1M-v1`, `microsoft/orca-math-word-problems-200k`, `NousResearch/hermes-function-calling-v1`, `AI-MO/NuminaMath-CoT`, `AI-MO/NuminaMath-TIR`, `allenai/tulu-3-sft-mixture`, `cognitivecomputations/dolphin-coder`, `HuggingFaceTB/smoltalk`, `cognitivecomputations/samantha-data`, `m-a-p/CodeFeedback-Filtered-Instruction` y `m-a-p/Code-Feedback`.

No se documenta en la información disponible el número total de tokens de entrenamiento, las proporciones exactas de cada dataset ni si hubo fases de RLHF o DPO. La model card insiste en la filosofía de alineación steerable: el modelo no impone una ética concreta y deja en manos del propietario del sistema la definición de las reglas de comportamiento mediante el prompt de sistema. Esa es la innovación principal frente a modelos instructivos convencionales, más allá de las mejoras derivadas del ajuste fino.

## Capacidades

- Generación de texto y conversación instructiva en inglés.
- Programación: el entrenamiento incluye datasets de código como OpenCoder, dolphin-coder y CodeFeedback, por lo que puede explicar, generar y revisar código.
- Matemáticas: se apoya en NuminaMath-CoT, NuminaMath-TIR y orca-math para resolución de problemas paso a paso.
- Function calling / tool calling: se entrena con `NousResearch/hermes-function-calling-v1`, aunque no se documenta el esquema exacto de llamadas ni la fiabilidad en producción.
- Uso agéntico: incluye `microsoft/orca-agentinstruct-1M-v1`, orientado a instrucciones multi-paso y uso de herramientas.
- Contexto largo: hereda la ventana de 128.000 tokens de Llama 3.1 8B, útil para documentos extensos e historiales de conversación.
- Alineación steerable: el comportamiento se controla desde el prompt de sistema; el modelo no impone políticas de contenido propias.
- Capacidades multilingües: no declaradas; el modelo está etiquetado únicamente como inglés.
- Visión, audio o modo thinking explícito: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de programación autoalojado: puede integrarse en un IDE o en una CLI para explicar código, proponer refactorizaciones y generar fragmentos en inglés. Un modelo de 8B cuantizado a 4 bits cabe en GPUs de consumo, lo que permite mantener el código y las consultas fuera de servicios externos.
- Generación de tests y revisión de cambios en CI/CD: puede recibir un diff o un fragmento de código y generar casos de prueba, comentarios de revisión o resúmenes de cambios. Es adecuado como primera pasada automatizada, con revisión humana obligatoria por las limitaciones de razonamiento del modelo.
- Agente de soporte con function calling: puede conectarse a APIs de ticketing, CRM o bases de conocimiento y decidir qué herramienta invocar. El entrenamiento con Hermes function calling y orca-agentinstruct lo hace utilizable en prototipos de agentes, siempre que el esquema de herramientas sea claro y se validen las acciones.
- Automatización de back-office con documentos largos: gracias a la ventana heredada de 128.000 tokens, puede resumir contratos, extraer campos de informes o responder preguntas sobre documentación extensa en inglés. Para producción conviene combinarlo con recuperación (RAG) y validación de extracciones.
- Tutor de matemáticas y generación de ejercicios: los datasets NuminaMath permiten generar soluciones paso a paso y problemas de práctica. Dado que MATH Lvl 5 se queda en 10,5 de exact match, es más adecuado para apoyo educativo con revisión que para corrección automática de alta precisión.
- Chatbot generalista on-premise: permite desplegar un asistente de conversación en infraestructura propia, con control total del prompt de sistema y de los datos. Es una opción razonable para empresas que priorizan privacidad y quieren evitar cambios silenciosos de versión en APIs comerciales.
- Generación de datos sintéticos y etiquetado asistido: puede producir borradores de instrucciones, respuestas o clasificaciones en inglés a bajo coste. La calidad debe filtrarse porque los benchmarks de conocimiento y razonamiento son limitados.
- Prototipos de agentes multi-paso: sirve para experimentar con planificación, descomposición de tareas y uso de herramientas antes de pasar a modelos mayores. Su tamaño permite iterar en local, pero no se recomienda para decisiones autónomas de alto riesgo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index,获取 de Open LLM Leaderboard. No han sido verificados de forma independiente.

| Benchmark | Configuración | Métrica | Resultado |
|---|---|---|---|
| IFEval | 0-shot | averaged accuracy | 76,21 |
| BBH | 3-shot | acc_norm | 27,63 |
| MATH Lvl 5 | 4-shot | exact_match | 10,50 |
| GPQA | 0-shot | acc_norm | 4,36 |
| MuSR | 0-shot | acc_norm | 8,97 |
| MMLU-PRO | 5-shot | accuracy | 22,13 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K, MMLU estándar ni otras evaluaciones de código o matemáticas. Los valores de BBH, GPQA, MuSR y MMLU-PRO son bajos y deben tenerse en cuenta al evaluar el modelo para tareas de razonamiento complejo.

## Requisitos de hardware

- Pesos en precisión completa o media: el repositorio ocupa 16,1 GB en safetensors. Para inferencia en FP16/BF16 se recomiendan al menos 20-24 GB de VRAM con contexto moderado; una RTX 3090 o RTX 4090 de 24 GB es suficiente para contexto corto, y una A100 de 40 GB es más adecuada para contexto largo.
- Cuantización de 8 bits: estimación de 8-10 GB de VRAM para los pesos, más caché KV. Cabe en GPUs de 12-16 GB como RTX 4070, RTX 4080 o RTX 4060 Ti de 16 GB.
- Cuantización de 4 bits: estimación de 5-7 GB de VRAM para los pesos, más caché KV. Cabe en GPUs de 8-12 GB como RTX 3060 de 12 GB o RTX 4060 Ti de 8/16 GB, con contexto limitado.
- CPU: es posible ejecutarlo con llama.cpp u Ollama, pero el rendimiento será mucho menor; no hay datos oficiales de latencia o throughput.
- Despliegue: Transformers, vLLM, TGI, llama.cpp y Ollama son opciones habituales para un modelo Llama 3.1 de 8B. El repositorio no incluye artefactos GGUF, AWQ o GPTQ listos para usar; habría que generarlos.
- No se han publicado datos de latencia, throughput ni consumo energético en la información disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks homogéneos para comparar rendimiento entre estos modelos en la información proporcionada. La comparación se limita a parámetros, contexto, licencia y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dolphin3.0-Llama3.1-8B | 8,03 B | 128.000 tokens heredados de Llama 3.1 8B | Llama 3.1 | HuggingFace, repositorio KeepThinking |
| Llama 3.1 8B Instruct | 8 B | 128.000 tokens | Llama 3.1 | HuggingFace, meta-llama |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.000 tokens | Apache 2.0 | HuggingFace, mistralai |
| Qwen2.5 7B Instruct | 7,6 B | 128.000 tokens | Apache 2.0 | HuggingFace, Qwen |

Frente a Llama 3.1 8B Instruct, Dolphin añade un ajuste orientado a código, matemáticas y agentes, y una filosofía de alineación steerable. Frente a Mistral 7B Instruct v0.3, ofrece mayor contexto y licencia Llama 3.1 en lugar de Apache 2.0. Frente a Qwen2.5 7B Instruct, compite en tamaño y contexto, pero Qwen2.5 declara capacidades multilingües más amplias y licencia Apache 2.0.

## Limitaciones y advertencias

- Rendimiento bajo en razonamiento y conocimiento avanzado: BBH 27,63, GPQA 4,36, MuSR 8,97 y MMLU-PRO 22,13. No es adecuado para diagnóstico, asesoría legal, decisiones médicas ni tareas de alto riesgo sin supervisión humana.
- Matemáticas limitadas: MATH Lvl 5 4-shot se queda en 10,5 de exact match. Puede generar soluciones plausibles pero incorrectas; conviene verificar los cálculos.
- Idioma: solo se declara inglés. No hay garantía de calidad en castellano ni en otros idiomas, aunque el modelo base pueda tener cierto multilingüismo residual.
- Riesgo de alucinación: como todo modelo de 8B, puede inventar hechos, APIs, referencias o resultados. En producción hay que añadir recuperación de información y validación.
- Alineación steerable: Dolphin no impone políticas de contenido; la seguridad depende del prompt de sistema y de las salvaguardas que implemente el despliegue. Esto puede facilitar usos indebidos si no se establecen controles.
- Licencia Llama 3.1: permite uso comercial con condiciones, incluyendo la política de uso aceptable y la cláusula de 700 millones de usuarios mensuales. Es necesario revisar los términos antes de desplegarlo en un producto.
- Disponibilidad de cuantizaciones: el repositorio contiene safetensors; no se ofrecen versiones GGUF, AWQ o GPTQ oficiales. Para usar llama.cpp u Ollama hay que convertir los pesos.
- Contexto largo: aunque hereda 128.000 tokens, la calidad de recuperación en ventanas muy largas no está evaluada en la información disponible.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad o robustez. El entrenamiento con datasets diversos no garantiza un comportamiento equilibrado en todos los dominios.

## Enlaces

- [HuggingFace: KeepThinking/Dolphin3.0-Llama3.1-8B](https://huggingface.co/KeepThinking/Dolphin3.0-Llama3.1-8B)
- [Colección Dolphin 3.0](https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3)
- [Modelo base: meta-llama/Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B)
- [Organización Cognitive Computations en HuggingFace](https://huggingface.co/cognitivecomputations)
- [Discord de Cognitive Computations](https://discord.gg/cognitivecomputations)
- [Open LLM Leaderboard: resultados declarados](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard#/?search=cognitivecomputations%2FDolphin3.0-Llama3.1-8B)
