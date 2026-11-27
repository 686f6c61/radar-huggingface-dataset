# SIP-med-LLM/SIP-jmed-llm-4-33b-OP

## Resumen
SIP-jmed-llm-4-33b-OP es un modelo de lenguaje de 33.219.548.160 parámetros (aproximadamente 33B) especializado en dominio médico y desarrollado por el equipo SIP-jmed-llm-4 del National Institute of Informatics (NII) de Japón, en el marco de los programas SIP (Strategic Innovation Program) del Gabinete del país, concretamente en los temas E-2 y B-6 sobre análisis de documentos médicos y desarrollo de LLM clínicos. Se construye mediante ajuste fino del modelo base llm-jp/llm-jp-4-33b-base, aplicando un pipeline de instruction tuning (SFT), optimización de preferencias (DPO) y aprendizaje por refuerzo (RL) con recompensas basadas en fidelidad médica.

El modelo emplea una arquitectura transformer tipo LlamaForCausalLM con 64 capas, dimensión oculta de 5.120, 40 cabezas de atención y 8 cabezas KV (GQA), un vocabulario de 196.608 tokens y una longitud máxima de posición de 65.536 tokens. Soporta japonés e inglés, utiliza el formato de conversación Harmony con canales diferenciados (analysis, commentary, final) y está entrenado para invocar una herramienta de recuperación documental médica (`search_medical_rag`) o responder directamente sin ella.

Su relevancia actual radica en ser uno de los pocos modelos abiertos de gran tamaño orientados específicamente al japonés médico, con licencia Apache-2.0, soporte de tool calling nativo en formato Harmony y un pipeline de alineación que incluye RL con evaluación de fidelidad factual. No obstante, el propio autor lo posiciona como prototipo de I+D y desaconseja su uso clínico directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), 64 capas, hidden 5.120, 40 attention heads / 8 KV heads (GQA) |
| Parametros totales | 33.219.548.160 (~33B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (max position) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 66,5 GB) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only denso de ~33B parámetros con 64 capas, dimensión oculta 5.120, 40 cabezas de atención y 8 cabezas KV (atención con query grouping), pesos en bf16. El tokenizador es el de LLM-jp-4 (`llmjp4_tokenizer.py`) con un vocabulario de 196.608 tokens y una ventana máxima de 65.536 posiciones. La conversación se estructura en formato Harmony con tokens especiales (`<|start|>`, `<|channel|>`, `<|message|>`, `<|end|>`, `<|call|>`, `<|return|>`, `<|constrain|>`) y canales analysis, commentary y final, lo que permite separar el razonamiento interno de la respuesta final y emitir llamadas a herramientas en el canal commentary.

El entrenamiento parte de llm-jp/llm-jp-4-33b-base y sigue tres fases: instruction tuning supervisado (SFT) con el dataset instruct5 de LLM-jp-4 más datos médicos (traducción de literatura, QA sobre guías clínicas y prospectos, extracción y resumen de información clínica, redacción de documentos y diagnóstico diferencial a partir de casos), seguido de DPO y finalmente RL con una recompensa compuesta por un modelo juez que evalúa fidelidad médica a nivel de afirmación (exactitud, consistencia con la evidencia y exhaustividad) más una puntuación global de calidad. Los datos de RL mezclan aproximadamente al 50% tareas con herramienta y sin herramienta, abarcando 16 categorías médicas (exámenes nacionales, QA clínico, QA sobre literatura, traducción, extracción, resumen, redacción, diagnóstico diferencial, cálculo médico, seguridad) y dominios generales (matemáticas, extracción de información, seguimiento de instrucciones). El prompt de RL con la definición de herramienta es reproducible mediante `tool_use/build_prompt.py`.

## Capacidades
- Generación de texto y razonamiento clínico en japonés e inglés, con modo de razonamiento explícito separado en el canal analysis.
- QA médica basada en evidencia: respuestas con o sin invocación de la herramienta de recuperación `search_medical_rag` (RAG).
- Tool calling / function calling mediante formato Harmony, con soporte de llamadas paralelas en un mismo mensaje assistant.
- Extracción y resumen de información clínica a partir de documentos, guías y prospectos.
- Redacción de documentos médicos y soporte a diagnóstico diferencial a partir de casos clínicos.
- Traducción de literatura médica entre japonés e inglés.
- Cálculo médico y tareas de seguridad clínica.
- Capacidades generales de matemáticas, extracción de información y seguimiento de instrucciones heredadas del modelo base.
- No dispone de visión, audio ni otras modalidades según la información disponible.

## Casos de uso
- Asistente de QA médica con RAG: integrado con un índice documental médico propio, el modelo invoca `search_medical_rag` para recuperar evidencia y responder con citas, aprovechando el formato Harmony para separar la llamada del resultado.
- Soporte a revisión de literatura: traducción y resumen de artículos y guías clínicas en japonés e inglés con contexto de hasta 65.536 tokens, útil para digerir documentos extensos en una sola pasada.
- Extracción estructurada de datos clínicos: procesamiento de notas y registros para poblar bases de conocimiento o sistemas de historia clínica electrónica, con salida en JSON controlada mediante `<|constrain|> json`.
- Generación asistida de documentación clínica: borradores de informes, resúmenes de alta y notas de caso a partir de datos estructurados, siempre con revisión humana.
- Formación y simulación de exámenes médicos: generación de preguntas tipo examen nacional y razonamiento paso a paso sobre casos, apoyándose en el modo de razonamiento del canal analysis.
- Investigación en NLP clínico en japonés: modelo de referencia para experimentos de alineación con RL y evaluación de fidelidad factual en dominio sanitario.
- Evaluación comparativa de pipelines de tool use: al incluir definiciones y prompts reproducibles, sirve para estudiar el comportamiento de agentes con recuperación documental frente a respuestas directas.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado |
|---|---|---|
| JMedQA (accuracy) | SIP-jmed-llm-4-33b-OP | 0,925 (temperature = 1,0) |

No se han publicado en la información disponible resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos de referencia.

## Requisitos de hardware
- Inferencia en bf16: los 33B parámetros ocupan aproximadamente 66 GB de pesos, por lo que se requiere al menos una GPU con 80 GB de VRAM (H100, A100 80GB, H200) para tensor parallel 1. El autor reporta pruebas en una H200 con `--tensor-parallel-size 1` y `--gpu-memory-utilization 0.90`.
- Cuantización: no se documentan pesos cuantizados oficiales; con cuantización a 8 bits o 4 bits (no publicada) el modelo podría caber en GPUs de 40-48 GB o en configuraciones multi-GPU consumer, pero no hay datos verificados.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en GPUs de 24-32 GB en bf16; requiere multi-GPU o cuantización no oficial.
- Despliegue: vLLM 0.18.0 o superior mediante el wrapper `llmjp4_vllm` del repositorio llm-jp-4-cookbook (obligatorio para el parser de razonamiento `llmjp4` y para `--trust-remote-code`); también es posible con transformers (probado con transformers 4.57.x, torch ≥ 2.10.0). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Tool calling en vLLM: en la versión 0.18 no existe parser de tool calls para LLM-jp-4; debe extraerse manualmente del texto Harmony generado vía `/v1/completions`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| SIP-jmed-llm-4-33b-OP | ~33B | 65.536 | Apache-2.0 | Médico japonés/inglés, tool use RAG | Hugging Face (SIP-med-LLM) |
| llm-jp/llm-jp-4-33b-base | ~33B | 65.536 (según modelo base) | No disponible en la información | Generalista japonés/inglés | Hugging Face (llm-jp) |
| Llama 3.3 70B Instruct | 70B | 128K | Llama 3.3 Community License | Generalista multilingüe | Hugging Face (Meta) |
| Qwen2.5 32B Instruct | ~32B | 131.072 | Apache-2.0 (mayoría de variantes) | Generalista multilingüe | Hugging Face (Qwen) |

No se dispone de resultados comparativos de benchmarks entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias
- Modelo prototipo de I+D: el autor declara que no se ha validado su seguridad ni eficacia en entorno clínico real y desaconseja su uso directo para diagnóstico, decisión terapéutica o consejo sanitario.
- Riesgo de alucinación: aunque el RL penaliza afirmaciones no respaldadas por evidencia, no elimina el riesgo; en dominios médicos cualquier error puede tener consecuencias graves.
- El propio autor advierte de que el modelo puede equivocarse al describir detalles de su desarrollo (modelo base, número de parámetros); debe tomarse como referencia la model card.
- Idiomas limitados a japonés e inglés; el rendimiento en castellano u otras lenguas no está documentado.
- Licencia Apache-2.0 permite uso comercial del modelo, pero un producto derivado podría quedar sujeto a la regulación japonesa de programas sanitarios (PMDA); el autor recomienda consultar el marco regulatorio antes de comercializar.
- El soporte de tool calling en vLLM 0.18 es incompleto (sin parser dedicado), lo que complica su integración en producción.
- No se publican datos de sesgos, tasas de alucinación medidas ni evaluaciones de robustez fuera de JMedQA.
- El uso de `--trust-remote-code` implica ejecutar código del repositorio (tokenizador y plantilla Harmony), con el riesgo de seguridad asociado.

## Enlaces
- Hugging Face: https://huggingface.co/SIP-med-LLM/SIP-jmed-llm-4-33b-OP
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-33b-base
- Organización LLM-jp: https://huggingface.co/llm-jp
- Dataset de evaluación JMedQA: https://huggingface.co/datasets/SIP-med-LLM/JMedQA
- Repositorio llm-jp-4-cookbook (wrapper vLLM y parser `llmjp4`): https://github.com/llm-jp/llm-jp-4-cookbook
- PMDA, consultas sobre programas sanitarios: https://www.pmda.go.jp/review-services/f2f-pre/strategies/0011.html
