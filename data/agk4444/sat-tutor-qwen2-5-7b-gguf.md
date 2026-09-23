# agk4444/sat-tutor-qwen2.5-7b-gguf

## Resumen

sat-tutor-qwen2.5-7b-gguf es un ajuste fino del modelo Qwen/Qwen2.5-7B-Instruct orientado a la tutoría de las pruebas SAT (matemáticas y lectura/escritura), publicado por el usuario agk4444 y distribuido exclusivamente en formato GGUF cuantizado a Q4_K_M. El problema que aborda es acotado y práctico: resolver preguntas de estilo SAT razonando paso a paso y cerrando la respuesta con una línea `Answer: X` parseable de forma automática, algo útil para construir tutores automáticos, correctores o bancos de evaluación sin depender de APIs externas.

Técnicamente es un transformer decoder-only denso de 7.615.616.512 parámetros (7,6 B), heredado de la familia Qwen2.5, con 32.768 tokens de ventana de contexto y entrenado mediante QLoRA a 4 bits sobre unos 30.000 ejemplos de matemáticas y lectura/escritura con soluciones detalladas. El adaptador resultante se fusionó en los pesos base en fp16 y después se cuantizó a Q4_K_M, generando un fichero de ~4,35 GB (repositorio de 4,7 GB) pensado para inferencia local con llama.cpp, Ollama, LM Studio, GPT4All o text-generation-webui.

Su relevancia actual es la de un caso típico de especialización vertical sobre un modelo abierto: en lugar de competir en capacidades generales, entrega un dominio estrecho y medible con una métrica propia (70/77 preguntas de matemáticas parseables, 90,9 %). Conviene tener presente que la ficha de HuggingFace registra 0 descargas y 0 likes en el momento de la consulta, y que el único idioma declarado es el inglés, por lo que se trata de una publicación reciente y sin adopción comunitaria verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5), con Grouped Query Attention y RoPE |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (32k según la model card) |
| Tipos de cuantización | Q4_K_M (fichero publicado); la model card documenta fp16 como referencia de máxima calidad y Q8_0 como paso intermedio de la conversión |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (heredada de Qwen2.5) |
| Formato de pesos | GGUF v3, 339 tensores, fichero `sat-tutor-qwen2.5-7b.Q4_K_M.gguf` de ~4,35 GB |

## Arquitectura y entrenamiento

La base es Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,6 B de parámetros con atención por consultas agrupadas (GQA), embeddings rotatorios (RoPE) y una ventana nativa de 32.768 tokens. Sobre esa base se aplicó un ajuste fino supervisado con QLoRA a 4 bits, un único epoch, longitud de secuencia de 2048 tokens, learning rate 2e-4 y batch efectivo de 16 (batch 1 con acumulación de gradiente 16). El conjunto de entrenamiento ronda los 30.000 ejemplos de estilo SAT de matemáticas y de lectura/escritura, todos con soluciones paso a paso.

El pipeline de publicación es relevante para reproducibilidad: el adaptador LoRA se fusionó primero en los pesos base en fp16 y solo después se cuantizó en dos etapas (fp16 → Q8_0 → Q4_K_M). Esto implica que el GGUF publicado no es un simple LoRA aplicado en tiempo de inferencia, sino un modelo fusionado, y que existe una versión fp16 sin pérdida por cuantización que el autor señala explícitamente como referencia de calidad completa. No se documentan en la información disponible técnicas adicionales como decodificación especulativa, atención lineal ni fases de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generación de texto con plantilla ChatML (`<|im_start|>system / user / assistant`), compatible con el chat template de Qwen2.5-Instruct.
- Resolución de problemas de matemáticas de estilo SAT con razonamiento paso a paso explícito antes de la respuesta final.
- Respuesta a preguntas de lectura y escritura (reading/writing) de formato SAT.
- Salida estructurada mediante la convención `Answer: X`, diseñada para ser parseada automáticamente por scripts de corrección.
- Soporte de instrucciones de sistema personalizables, por ejemplo para fijar el rol de tutor.
- Conversación multiturno dentro de la ventana de 32k tokens que hereda del modelo base.
- Capacidades generales del modelo base (Qwen2.5-7B-Instruct): código, matemáticas generales, instrucciones y multilingüismo limitado, si bien el ajuste no las refuerza y el autor advierte que las preguntas fuera de dominio obtienen, como máximo, calidad del modelo base.
- No se documenta soporte específico de tool calling, function calling, agentes, visión, audio ni modo de pensamiento extendido en la model card.

## Casos de uso

- Tutor automático de SAT para estudiantes: el modelo recibe el enunciado y devuelve la resolución completa con los pasos intermedios y la línea `Answer: X`, lo que permite mostrar el razonamiento y no solo el resultado.
- Corrección automatizada de baterías de preguntas: gracias al formato de salida fijo, un script puede extraer la respuesta con una expresión regular y compararla con la clave oficial sin intervención humana.
- Generación de explicaciones para preguntas falladas: dado un enunciado y la respuesta correcta, se le puede pedir que reconstruya el razonamiento paso a paso para construir feedback personalizado.
- Despliegue 100 % local en portátiles o equipos sin GPU dedicada: el fichero Q4_K_M de ~4,35 GB cabe en memoria de sistemas con 8 GB de RAM o VRAM y no requiere conexión a internet ni claves de API, algo crítico en entornos educativos con restricciones de privacidad.
- Integración en herramientas de estudio offline (LM Studio, GPT4All, Ollama): basta con copiar el `.gguf` en la carpeta de modelos o crear un `Modelfile`, lo que facilita distribuirlo a alumnos como aplicación de escritorio.
- Microservicio de tutoría autoalojado en Docker: la propia model card documenta el arranque de Ollama en un contenedor con el puerto 11434 expuesto, lo que permite exponer el modelo como endpoint interno detrás de una interfaz web propia.
- Evaluación comparativa de especialización vertical: sirve como punto de referencia para medir cuánto mejora un ajuste QLoRA pequeño (30k ejemplos, 1 epoch) frente al modelo base en una tarea cerrada y con métrica propia.
- Ampliación de bancos de datos de entrenamiento: el modelo puede generar resoluciones paso a paso de estilo SAT que después se filtran y revisan para construir datasets sintéticos del dominio.

## Benchmarks y rendimiento

Los únicos datos publicados son la evaluación held-out del autor sobre preguntas de estilo oficial, con dos criterios de conteo: "parseable" (el modelo emitió el formato `Answer: X` esperado) y "strict" (las respuestas no parseables se contabilizan como incorrectas).

| Sección | Parseable | Strict |
|---|---|---|
| Matemáticas | 70/77 (90,9 %) | 70/100 (70 %) |
| Lectura/escritura | 45/59 (76,3 %) | 45/60 (75 %) |

El autor indica que las respuestas no parseables suelen deberse a fallos de formato más que a errores de contenido. No se han publicado resultados en la información disponible para benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones bajo protocolo común con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 5-6 GB con el fichero Q4_K_M de 4,35 GB, incluyendo el overhead del runtime y el contexto.
- GPU consumer compatibles: cabe en tarjetas de 8 GB o más, como RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070 y superiores; también en 8 GB justos con ventanas de contexto moderadas.
- GPU profesionales: A100, H100, L40S o similares sin ninguna restricción, aunque están sobredimensionadas para un modelo de 7,6 B en Q4_K_M.
- Equipos Apple Silicon: funciona en Mac con memoria unificada de 8 GB o más mediante llama.cpp o LM Studio.
- CPU pura: viable con llama.cpp en x86-64 con AVX2 o AVX-512, con velocidades de generación sensiblemente inferiores a las de una GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (incluido en Docker), LM Studio, GPT4All, text-generation-webui y, en general, cualquier runtime compatible con GGUF. Para servir en producción con batching conviene considerar llama.cpp server, Ollama o vLLM con su soporte GGUF, que es más limitado que con pesos safetensors.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la información proporcionada; dependerán por completo del hardware y de la longitud de contexto configurada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Especialización |
|---|---|---|---|---|---|
| sat-tutor-qwen2.5-7b-gguf | 7,6 B | 32k | Apache 2.0 | GGUF Q4_K_M en HuggingFace | Tutoría SAT (matemáticas y lectura/escritura) |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32k (ampliable con YaRN) | Apache 2.0 | Safetensors, GGUF, múltiples runtimes | Propósito general, instrucciones |
| Mistral-7B-Instruct v0.3 | 7,2 B | 32k | Apache 2.0 | Safetensors, GGUF | Propósito general, instrucciones |
| Meta Llama-3.1-8B-Instruct | 8,0 B | 128k | Llama 3.1 Community License | Safetensors, GGUF | Propósito general, instrucciones, tool calling |

La comparación de rendimiento no está disponible: el autor solo publica métricas propias de su conjunto de evaluación de estilo SAT, sin protocolo común con los modelos alternativos, por lo que no es posible establecer una comparación numérica honesta. La diferencia práctica frente a las alternativas es la especialización y el formato de salida parseable, no una superioridad general.

## Limitaciones y advertencias

- Ámbito restringido: está entrenado para SAT; ante preguntas fuera de dominio, el autor indica que la calidad es, como máximo, la del modelo base.
- Cuantización con pérdida: el Q4_K_M sacrifica algo de precisión frente a la fusión fp16, que el autor señala como referencia de calidad completa.
- Riesgo de error matemático: la model card recomienda verificar los cálculos contra los pasos mostrados; el propio razonamiento paso a paso puede contener errores plausibles.
- Fallos de formato: el 9,1 % de las preguntas de matemáticas y el 23,7 % de las de lectura/escritura no emitieron el formato parseable esperado, lo que exige lógica de recuperación o reintento en producción.
- Solo inglés: el único idioma declarado es `en`; no hay garantía de comportamiento correcto en castellano ni en otros idiomas.
- Sin datos de adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de las métricas publicadas.
- Capacidades de agente no documentadas: aunque el modelo base Qwen2.5 soporta tool calling, el ajuste QLoRA pudo degradar esa capacidad y no se ha evaluado.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales más allá de las condiciones habituales de atribución y conservación del aviso de licencia; conviene revisar igualmente las condiciones del modelo base.
- Sin evaluación de sesgos ni de seguridad: no se publica ningún análisis de sesgos, toxicidad o robustez frente a prompts adversarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agk4444/sat-tutor-qwen2.5-7b-gguf
- Adaptador pre-fusión: https://huggingface.co/agk4444/sat-tutor-qwen2.5-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado en la búsqueda web enlaces relevantes (papers, blogs, repositorios o demos) asociados a este modelo; los resultados devueltos eran contenido no relacionado.
