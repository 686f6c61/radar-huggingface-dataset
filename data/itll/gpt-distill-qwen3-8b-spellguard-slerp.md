# ITLL/GPT-Distill-Qwen3-8B-Spellguard-SLERP

## Resumen

GPT-Distill-Qwen3-8B-Spellguard-SLERP es un modelo de lenguaje de 8.190.735.360 parámetros (8,19 B) resultado de una fusión de pesos mediante el método SLERP (interpolación esférica) con `t: 0.5`, ejecutada con mergekit. Lo publica el usuario ITLL en Hugging Face y combina dos modelos derivados de Qwen3: `Jackrong/GPT-Distill-Qwen3-8B-Thinking`, orientado a razonamiento con cadena de pensamiento, y `Spellguard/Spellguard-1.0-8B`, especializado en seguridad y moderación de contenido.

El objetivo declarado por las etiquetas del repositorio es producir un modelo con función de guardrail: detección de prompt injection, identificación de jailbreaks, moderación de contenido y protección de agentes de IA, conservando a la vez la capacidad de razonamiento del modelo base. La ficha se apoya en la información pública del repositorio: no hay model card descriptiva más allá de la configuración del merge, ni resultados de evaluación publicados.

Es relevante ahora porque la combinación de razonamiento explícito y filtrado de seguridad en un solo modelo de 8 B permite desplegar un guardrail autoalojado con requisitos de hardware moderados, en un momento en el que los pipelines de agentes necesitan capas de defensa contra inyección indirecta de prompts en respuestas de herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), fusión SLERP de dos checkpoints Qwen3-8B |
| Parámetros totales | 8.190.735.360 (8,19 B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen3-8B emplea contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantización | no disponible en la model card; al ser un checkpoint en bfloat16 con safetensors, es convertible a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | no disponible (los datasets de entrenamiento incluyen material multilingüe, entre ellos aya_dataset, pero no se declara cobertura oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), biblioteca transformers; compatible con text-generation-inference y endpoints_compatible |
| Método de fusión | SLERP, `t: 0.5`, `dtype: bfloat16`, `out_dtype: bfloat16`, base `Jackrong/GPT-Distill-Qwen3-8B-Thinking` |
| Tamaño del repositorio | 16,4 GB |
| Fecha de publicación | 20 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es una interpolación de pesos entre dos checkpoints Qwen3-8B. SLERP interpola esféricamente los tensores de ambos modelos con un factor `t = 0.5`, lo que produce un punto medio en el espacio de parámetros que tiende a preservar mejor la norma de los vectores que una media lineal. El checkpoint resultante conserva la arquitectura decoder-only de Qwen3 con 8,19 B de parámetros en bfloat16, sin cambios en la tokenizador ni en la estructura de capas.

Los dos progenitores aportan capacidades distintas. `Jackrong/GPT-Distill-Qwen3-8B-Thinking` es un destilado orientado a razonamiento, con datos de destilación procedentes de modelos mayores (las etiquetas del repositorio citan datasets de razonamiento de gpt-oss-120B y Qwen3-235B-Thinking, además de ShareGPT y fineweb-edu). `Spellguard/Spellguard-1.0-8B` aporta el sesgo hacia tareas de seguridad, con un conjunto de datos de moderación y detección de ataques que incluye WildGuardMix, Aegis-AI-Content-Safety-Dataset-2.0, WildJailbreak, JailBreakV-28k, Nemotron-RL-Jailbreak-Robustness, Nemotron-RL-Agentic-Indirect-Prompt-Injection, LLMail-Inject, Gandalf ignore-instructions y varios conjuntos de prompt injection de deepset, S-Labs y neuralchemy, entre otros. También aparecen datasets de instrucciones generales y function calling (oasst2, aya_dataset, glaive-function-calling-v2, commitpackft).

No se documenta en la información disponible si hubo RLHF, DPO ni una fase de alineación posterior al merge, ni el número de tokens de entrenamiento de cada progenitor. La innovación técnica reseñable es el propio método de fusión: permite combinar un modelo de razonamiento y un guardrail sin reentrenar, a costa de no poder garantizar que ambas capacidades se conserven íntegras.

## Capacidades

- Generación de texto conversacional y razonamiento con cadena de pensamiento (thinking mode), heredado del progenitor destilado de Qwen3.
- Detección de prompt injection directa e indirecta, incluida la inyección en respuestas de herramientas (tool-response injections) según los datasets de entrenamiento del progenitor de seguridad.
- Clasificación de jailbreaks y de intentos de elusión de instrucciones del sistema.
- Moderación de contenido: categorización de contenido dañino conforme a los esquemas de WildGuardMix y Aegis.
- Soporte de function calling y tool calling, por los datos de glaive-function-calling-v2 y tool-calls-single-reasoning.
- Capacidades multilingües parciales, derivadas de aya_dataset y de la mezcla de instrucciones; no hay evaluación publicada por idioma.
- Uso como guardrail en pipelines de agentes: el modelo puede recibir un par (entrada del usuario, salida de herramienta) y emitir un juicio de seguridad.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Filtrado de entrada en agentes autónomos: colocar el modelo delante del agente principal para clasificar mensajes del usuario y detectar instrucciones maliciosas antes de que lleguen al planificador; los datasets de prompt injection y Gandalf del progenitor de seguridad lo hacen adecuado para esta tarea.
- Protección contra inyección indirecta en respuestas de herramientas: interceptar la salida de APIs, resultados de búsqueda o correos y pasarla por el modelo para detectar instrucciones embebidas, un escenario cubierto explícitamente por `rgeada/tool-response-injections` y `microsoft/llmail-inject-challenge`.
- Moderación de contenido en comunidades y plataformas: clasificar mensajes de usuario en categorías de daño con el esquema de Aegis 2.0 y WildGuardMix, con la ventaja de que el razonamiento previo permite justificar la decisión.
- Guardrail de salida en asistentes de atención al cliente: verificar que la respuesta generada por otro modelo no contenga contenido dañino ni fugas de instrucciones del sistema antes de mostrarla al usuario.
- Evaluación de robustez de sistemas LLM: usar el modelo como atacante o como juez en pruebas de red teaming internas, aprovechando su conocimiento de patrones de jailbreak (JailBreakV-28k, jackhhao/jailbreak-classification).
- Asistente de revisión de código con foco en seguridad: combinando commitpackft y el sesgo de seguridad, puede señalar patrones peligrosos en diffs, aunque sin garantías de precisión equivalentes a un modelo especializado.
- Clasificador de políticas en pipelines de CI/CD para aplicaciones de IA: ejecutar el modelo como paso de validación sobre prompts y respuestas de prueba antes de desplegar cambios en un agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, WildGuard, Aegis ni de detección de prompt injection, ni comparaciones con los modelos progenitores. Cualquier cifra de rendimiento para este checkpoint sería una estimación no verificada.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 16,4 GB solo para pesos, más overhead de activaciones y caché KV; práctico en GPUs de 24 GB o más.
- Cuantización a 8 bits: aproximadamente 8-9 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantización a 4 bits (GGUF Q4_K_M o AWQ/GPTQ): alrededor de 4,5-5,5 GB, lo que permite ejecución en GPUs consumer de 8 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 para servicio de alta concurrencia; RTX 4090 (24 GB) para bf16 con contexto limitado; RTX 3090, 4080 y 4070 Ti Super para cuantizaciones de 8 y 4 bits; RTX 4060 Ti 16 GB o 3060 12 GB para 4 bits.
- Opciones de despliegue: transformers, vLLM, TGI (el repo declara text-generation-inference y endpoints_compatible), llama.cpp y Ollama tras conversión a GGUF, y servidores tipo SGLang si se convierte el checkpoint.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este merge. Como referencia cualitativa, un 8 B en bf16 sobre una 4090 suele moverse en decenas de tokens por segundo, pero no se aporta cifra verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ITLL/GPT-Distill-Qwen3-8B-Spellguard-SLERP | 8,19 B | no disponible | Razonamiento + guardrail (merge SLERP) | Apache 2.0 | Hugging Face, 0 descargas, 1 like en el momento de la consulta |
| Jackrong/GPT-Distill-Qwen3-8B-Thinking | ~8 B (familia Qwen3) | no disponible | Razonamiento destilado | no disponible en esta ficha | Hugging Face, progenitor del merge |
| Spellguard/Spellguard-1.0-8B | ~8 B (familia Qwen3) | no disponible | Guardrail y moderación | no disponible en esta ficha | Hugging Face, progenitor del merge |
| Qwen3-8B (modelo original de Alibaba) | 8,2 B | largo (según documentación de Qwen3) | LLM generalista | Apache 2.0 | Hugging Face, ampliamente desplegado |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para el merge ni para sus progenitores en la información proporcionada. La ventaja diferencial del modelo es la combinación de razonamiento y filtrado de seguridad en un único checkpoint de 8 B con licencia Apache 2.0; su desventaja es la ausencia de evaluación y su nula tracción (0 descargas), lo que lo sitúa como un experimento de fusión más que como un modelo validado para producción.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el merge conserve simultáneamente la calidad de razonamiento y la precisión de detección de los progenitores; los merges SLERP pueden degradar ambas capacidades.
- Riesgo de alucinación en las justificaciones: al heredar el modo thinking, el modelo puede generar razonamientos plausibles pero incorrectos al clasificar una entrada como segura o peligrosa.
- Sesgos de los datasets de seguridad: WildGuardMix, Aegis y los conjuntos de jailbreak tienen sesgos conocidos de sobrerrepresentación de ciertos idiomas (principalmente inglés) y de estilos de ataque; la cobertura multilingüe no está evaluada.
- Falsos positivos en moderación: un guardrail demasiado agresivo puede bloquear contenido legítimo, especialmente en dominios técnicos o de seguridad ofensiva legítima.
- Licencia Apache 2.0 permite uso comercial, pero los términos de los modelos progenitores y de los datasets de entrenamiento deben verificarse por separado antes de un despliegue en producción.
- Tracción mínima: 0 descargas y 1 like en el momento de la consulta; no hay informes de la comunidad ni validación independiente.
- No se documenta la longitud de contexto efectiva del merge, lo que impide garantizar el procesamiento de conversaciones o documentos largos.
- El repositorio no incluye model card descriptiva, plantilla de prompt ni instrucciones de uso; la integración requiere inferir el formato de chat de Qwen3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ITLL/GPT-Distill-Qwen3-8B-Spellguard-SLERP
- Modelo base de razonamiento: https://huggingface.co/Jackrong/GPT-Distill-Qwen3-8B-Thinking
- Modelo base de seguridad: https://huggingface.co/Spellguard/Spellguard-1.0-8B
- Referencia del modelo de seguridad (variante citada en el YAML): https://huggingface.co/ITLL/Spellguard-1.0-8B
- Herramienta de fusión mergekit: https://github.com/cg123/mergekit
- Documentación de SLERP: https://en.wikipedia.org/wiki/Slerp
