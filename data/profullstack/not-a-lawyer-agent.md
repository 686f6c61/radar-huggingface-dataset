# profullstack/not-a-lawyer-agent

## Resumen

not-a-lawyer-agent es un adaptador LoRA de tipo PEFT publicado por el usuario profullstack sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parametros. El adaptador esta especializado en investigación jurídica en inglés: reformula conceptos legales en lenguaje llano, cita fuentes y delimita jurisdicciones, pero no sustituye el asesoramiento de un abogado. Se distribuye con licencia Apache 2.0 y esta pensado para ejecutarse en CPU mediante Ollama, lo que lo convierte en una pieza de bajo coste para prototipos de asistentes legales.

El modelo no incorpora conocimiento jurídico propio: la model card indica explícitamente que "a sub-1B model supplies the voice, not the facts" y que los mejores resultados se obtienen inyectando resultados de búsqueda recientes en el prompt. Es, por tanto, un ajuste de estilo y formato conversacional sobre una base muy pequena, orientado a un pipeline de recuperación aumentada (RAG) con fuentes públicas.

Su relevancia actual es limitada pero ilustrativa: demuestra el flujo completo de entrenamiento (400 pasos LoRA, r=8, seq_len=256, lr=0.0002) en la red c0mpute con un corpus de 5963 documentos, y sirve como ejemplo reproducible de adaptación de dominio con recursos mínimos. No es un modelo de producción para asesoría legal real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso seq_len=256; el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32 768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | GGUF disponible en el repo hermano profullstack/not-a-lawyer-agent-GGUF; el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible (el corpus y los ejemplos estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); GGUF en repo separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. El ajuste es un LoRA con rango r=8, longitud de secuencia 256 y tasa de aprendizaje 0.0002, entrenado durante 400 pasos en la red c0mpute (job `3088dff7-b5a6-4969-a40e-5d250d6fa920`, hash sha256 `88140d7fe1c84b0bd03cc4b70838caef984c80d702d470e88595b08a22552ed6`). El corpus de entrenamiento consta de 5963 documentos extraidos de fuentes públicas indexadas en pit-index con etiquetas como law, legal, lawyer, lawsuit, court ruling, contract law, copyright, tenant rights, employment law y small claims, ademas de feeds tematicos de rssamplifier.com y búsquedas de pit.world. El corpus no se redistribuye.

La innovación técnica destacable es la trazabilidad del entrenamiento: la model card publica el hash del adaptador y el identificador del job, lo que permite verificar la correspondencia entre el artefacto y el proceso. No se documenta uso de RLHF, DPO ni decodificación especulativa. La perplejidad en held-out bajó de 35,4 a 20,6 tras el ajuste, un indicador de que el adaptador captura el estilo y la estructura del dominio, aunque con una base de 0,5B el margen de razonamiento jurídico es muy limitado.

## Capacidades

- Generación de texto conversacional en inglés con formato de asistente legal: explica normas en lenguaje llano y nombra la jurisdicción cuando el contexto la aporta.
- Citación de fuentes: puede referenciar los documentos que se le inyectan en el prompt, siempre que el pipeline RAG los proporcione.
- Delimitación de responsabilidad: el system prompt recomendado le indica que aclare cuándo debe consultarse a un abogado colegiado.
- Soporte de plantilla de chat: usa `apply_chat_template` de Qwen2.5 con roles system/user/assistant.
- Ejecución en CPU: el GGUF del repo hermano está pensado para Ollama 0.3.13 o superior.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponibles de forma nativa; el modelo no está entrenado para planificación autónoma.
- Multilingüe: no disponible; el corpus es en inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipo de asistente de investigación jurídica con RAG: se inyectan resultados de búsqueda de pit.world o de un índice propio en el prompt y el adaptador reformula la respuesta en lenguaje llano, citando las fuentes recibidas. Adecuado por su bajo coste y su ejecución en CPU.
- Demostración educativa de ajuste LoRA: sirve como ejemplo reproducible de entrenamiento PEFT con 400 pasos sobre un corpus de 5963 documentos, útil en cursos y talleres.
- Chatbot de orientación inicial en materia de arrendamientos: responde a preguntas sobre fianzas y desgaste normal citando la jurisdicción que aparezca en el contexto recuperado, siempre con aviso de que no es asesoramiento legal.
- Filtro de primera línea en un bufete: clasifica y reformula consultas entrantes de clientes antes de derivarlas a un abogado humano, reduciendo el tiempo de triaje.
- Generación de borradores de FAQ legales para una web: a partir de documentos públicos recuperados, produce respuestas divulgativas que luego revisa un profesional.
- Pruebas de integración de pipelines Ollama en CPU: validación de extremo a extremo de un flujo GGUF + Ollama 0.3.13 en entornos sin GPU.
- Evaluación comparativa de adaptadores de dominio: línea base para medir cuánto aporta un LoRA r=8 frente al modelo base en perplejidad y estilo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad held-out antes del ajuste | 35,4 |
| Perplejidad held-out despues del ajuste | 20,6 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizacion de 4 bits para el modelo base de 0,5B; el adaptador LoRA anade unos pocos MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) para el modelo fusionado en fp16; A100/H100 no son necesarias.
- Cabe en CPU: si, es el escenario principal documentado (Ollama en CPU).
- Opciones de despliegue: Ollama (GGUF del repo profullstack/not-a-lawyer-agent-GGUF), transformers + peft para cargar el adaptador, llama.cpp para el GGUF. vLLM y TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| not-a-lawyer-agent (este) | 0,5B + LoRA r=8 | no disponible (entrenado a 256) | Apache 2.0 | Hugging Face + GGUF | Especializado en estilo jurídico, requiere RAG |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32 768 (según ficha del base) | Apache 2.0 | Hugging Face | Modelo base sin especialización |
| Adaptadores legales de mayor tamano (p. ej. sobre Llama 3 8B) | 8B | variable | variable | Hugging Face | Mayor capacidad de razonamiento, requiere GPU |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte: "Not a lawyer. Not legal advice". No debe usarse como sustituto de asesoramiento jurídico profesional.
- Riesgo elevado de alucinación: con 0,5B de parametros y sin conocimiento jurídico interno, el modelo solo aporta estilo; los hechos deben venir del prompt.
- El corpus de entrenamiento es en inglés y de fuentes públicas estadounidenses en su mayoría; las reglas citadas pueden no aplicar a otras jurisdicciones.
- Longitud de contexto de entrenamiento muy corta (256 tokens), lo que limita la coherencia en conversaciones largas.
- Sesgos potenciales derivados de las fuentes indexadas (rssamplifier.com, pit.world), no auditados en la model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Aunque la licencia es Apache 2.0, el corpus no se redistribuye y su procedencia debe verificarse antes de un uso comercial.
- No soporta tool calling ni planificación multi-paso, por lo que no es adecuado como agente autónomo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/profullstack/not-a-lawyer-agent
- GGUF para Ollama: https://huggingface.co/profullstack/not-a-lawyer-agent-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Ejemplo de entrenamiento c0mpute: https://github.com/profullstack/c0mpute/tree/master/examples/business-strategist-agent
- Instalador de Ollama: https://ollama.com/install.sh
- Fuentes del corpus: https://rssamplifier.com y https://pit.world
