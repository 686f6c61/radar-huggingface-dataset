# mangc95/finbot-slm

## Resumen

`finbot-slm` es un adaptador LoRA (≈ 74 MB) publicado por el usuario `mangc95` sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Se desarrolló en el taller *Destilación en pequeño (CPU)* del Máster en IA de la Universidad Adolfo Ibáñez (Tópicos Avanzados en IA II) y su propósito es servir de ejemplo reproducible de destilación de conocimiento: un LLM grande actúa como profesor, genera preguntas y respuestas de un dominio acotado y un modelo pequeño (1.500 millones de parámetros) se ajusta con LoRA sobre esas respuestas en CPU y en menos de una hora.

El dominio real del adaptador no es financiero pese al nombre: es un asistente que explica conceptos de inteligencia artificial generativa a directivos de empresas chilenas (minería, retail, banca, isapres) con respuestas breves de unas 90 palabras. Cubre fundamentos de LLM, ingeniería de prompts, RAG, agentes, ajuste fino y evaluación/LLMOps, en español neutro de Chile. El resultado es un SLM de nicho, útil como material didáctico y como demostración de bajo coste, no como producto listo para producción.

Su relevancia actual es metodológica: muestra un pipeline completo (generación de datos con profesor, evaluación antes/después con juez LLM, entrenamiento LoRA en CPU) con métricas honestas y un conjunto de examen fijo de 12 preguntas que nunca se usaron para entrenar. El adaptador mejora el formato y la media del juez (de 4,17 a 6,08 sobre 10), pero sigue siendo un ejercicio educativo con 60 ejemplos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder denso (Qwen2.5-1.5B-Instruct) |
| Parámetros totales | ~1.500 millones (modelo base) + adaptador LoRA de ≈ 74 MB |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Qwen2.5-1.5B-Instruct |
| Tipos de cuantización | No especificados en la model card; el adaptador se distribuye en float32 (safetensors). El modelo base puede cuantizarse por separado (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | Español (variante neutra de Chile) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga por separado en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder denso de 1.500 millones de parámetros. El ajuste es LoRA con `peft` 0.21.2, r = 16, α = 32, dropout 0,05, sobre siete módulos de proyección: `q_proj`, `o_proj`, `k_proj`, `up_proj`, `v_proj`, `down_proj` y `gate_proj`. El repositorio solo contiene las capas entrenadas; el modelo base debe descargarse aparte (lo hace `from_pretrained` de forma automática).

Los datos de entrenamiento son 60 pares pregunta-respuesta generados por el profesor `gpt-6-luna` (API de OpenAI), con respuestas de hasta 90 palabras, repartidos por tema: Evaluación y LLMOps (12), Ajuste fino (10), RAG (10), Fundamentos de LLM (10), Agentes de IA (9) e Ingeniería de prompts (9). El entrenamiento usó 3 épocas, lote 4, tasa de aprendizaje 0,0005, 45 pasos de optimización, longitud máxima de 320 tokens por ejemplo y 230 por respuesta, en CPU y en float32 (41,7 minutos de entrenamiento; 52,7 minutos la corrida completa incluyendo los dos exámenes). No se aplicó RLHF ni DPO: la "destilación" es supervisada sobre las respuestas del profesor. Los datos no se publican en el repositorio.

## Capacidades

- Generación de texto conversacional en español neutro de Chile, con respuestas en prosa breve (~90 palabras).
- Explicación de conceptos de IA generativa para perfiles no técnicos: fundamentos de LLM, ingeniería de prompts, RAG, agentes, ajuste fino y evaluación/LLMOps.
- Respuestas con ejemplos de negocio locales (minería, retail, banca, isapres).
- Uso mediante el chat template de Qwen2.5 con mensaje de sistema; se entrenó y evaluó con el sistema "Eres un asistente experto en IA generativa. Responde en español, de forma clara y breve." y decodificación voraz con `repetition_penalty=1.15`.
- Soporte de tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo explica el concepto de agente, no actúa como agente.
- Capacidades multilingües: solo español (variante de Chile); no se documentan otros idiomas.
- Vision, audio, thinking mode: no disponibles en este adaptador.

## Casos de uso

- Formación ejecutiva interna en empresas chilenas: el adaptador explica LLM, RAG o agentes a gerentes y directores en unas 90 palabras y con ejemplos de minería, retail o banca, que es exactamente el formato con el que se entrenó.
- FAQ para comités de innovación y inversión tecnológica: responde dudas recurrentes del tipo "¿cuándo conviene RAG frente a ajuste fino?" con una extensión controlada que encaja en actas y presentaciones.
- Apoyo a instructores en talleres y cursos: genera borradores de respuestas y material didáctico sobre conceptos de IA generativa, que el docente revisa y ajusta.
- Prototipado de asistentes en CPU: al correr en CPU con ≈ 6 GB de RAM en float32, permite demos internas sin GPU y con coste mínimo de infraestructura.
- Ejemplo reproducible de pipeline de destilación teacher-student: sirve como plantilla para cursos y talleres que quieran replicar el flujo (generación de datos, evaluación antes/después, LoRA en CPU) con otro dominio.
- Chatbot de intranet sobre conceptos de IA generativa: al estar acotado a un temario concreto y responder en formato breve, encaja en un asistente de consulta interna para empleados no técnicos.
- Alfabetización en IA para directivos: guiones de respuesta para programas de formación ejecutiva que necesitan mensajes cortos, en español neutro y con ejemplos locales.

## Benchmarks y rendimiento

Examen fijo de 12 preguntas del dominio, nunca usadas en entrenamiento, puntuadas de 1 a 10 por el mismo LLM profesor (`gpt-6-luna`) como juez:

| Métrica | Antes (base) | Después (destilado) |
|---|---|---|
| Nota media del juez (1–10) | 4,17 | 6,08 |
| Aprobación (nota ≥ 7) | 8 % (1/12) | 33 % (4/12) |
| Pérdida de entrenamiento (entropía cruzada) | 2,6878 (paso 1) | 0,8347 (paso 45) |

Nota media por tema:

| Tema | Antes | Después | n |
|---|---|---|---|
| Agentes de IA | 4,0 | 6,0 | 3 |
| Ajuste fino | 4,0 | 5,0 | 2 |
| Fundamentos de LLM | 5,5 | 6,0 | 2 |
| Ingeniería de prompts | 5,0 | 7,0 | 3 |
| RAG | 2,0 | 6,0 | 2 |

Advertencia del autor: es una sola corrida (semilla 42) sobre 12 preguntas, calificadas por un LLM y no por personas; diferencias de ±1 punto por tema entran en el ruido. La mejora más clara está en el formato (el base contestaba con listas largas que se cortaban; el destilado responde en prosa breve). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- CPU: ≈ 6 GB de RAM en float32, según la model card; es el modo en que se entrenó y evaluó.
- GPU: carga con `dtype=torch.bfloat16`; estimación de ≈ 3 GB de pesos para 1,5 mil millones de parámetros más activaciones y caché KV, en torno a 4–6 GB de VRAM en la práctica.
- Cuantización a 4 bits (previa fusión del adaptador y conversión): estimación de ≈ 1–1,5 GB de VRAM.
- GPU de consumo: sí, cabe en RTX 3060 12 GB, RTX 4060 8 GB y RTX 4090 24 GB; en general, cualquier GPU con ≥ 6 GB de VRAM en bf16 o ≥ 2 GB en 4 bits.
- GPU de datacenter: A100 y H100 quedan sobredimensionadas para una sola instancia; resultan útiles para servir lotes grandes o múltiples adaptadores en paralelo.
- Despliegue: `transformers` + `peft` (referencia del autor); vLLM soporta adaptadores LoRA; llama.cpp u Ollama requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Nota examen (1–10) |
|---|---|---|---|---|---|
| finbot-slm (adaptador LoRA) | 1,5 B + ≈ 74 MB de adaptador | Heredado del base | Apache 2.0 | HuggingFace | 6,08 (12 preguntas, juez LLM) |
| Qwen2.5-1.5B-Instruct (modelo base, sin adaptador) | 1,5 B | Heredado del base | Apache 2.0 | HuggingFace | 4,17 (mismas 12 preguntas) |
| Otros SLM de tamaño similar (Llama 3.2 1B, Gemma 2 2B, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible en la información |

No se han publicado en la información disponible comparativas con otros SLM de tamaño similar; la única comparación con datos es contra el modelo base, que es el punto de partida del adaptador.

## Limitaciones y advertencias

- Es un ejercicio educativo, no un producto: el modelo base tiene 1.500 millones de parámetros y se ajustó con solo 60 ejemplos, por lo que repite, se equivoca e inventa.
- El juez detectó respuestas genéricas que omiten lo que se pregunta y explicaciones confusas; la nota media final (6,08/10) sigue por debajo del aprobado (7).
- Evaluación muy limitada: una sola corrida con semilla 42, 12 preguntas y un juez LLM; el propio autor advierte que ±1 punto por tema entra en el ruido.
- Dominio muy acotado: conceptos de IA generativa para ejecutivos chilenos; fuera de ese temario el comportamiento no está garantizado.
- Idioma restringido a español neutro de Chile; no se documenta rendimiento en otras variantes ni en otros idiomas.
- Datos de entrenamiento generados por un LLM comercial (`gpt-6-luna`, OpenAI): los términos de OpenAI restringen usar sus salidas para desarrollar modelos que compitan con OpenAI, por lo que hay que revisarlos antes de cualquier uso que no sea educativo o interno.
- Licencia del adaptador Apache 2.0, pero la procedencia de los datos condiciona el uso comercial; conviene validar los términos con el proveedor del profesor antes de desplegar.
- No usar en producción sin validación humana: el propio autor lo etiqueta como material de taller y recomienda revisar las respuestas.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mangc95/finbot-slm
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper, blog, repositorio del taller o demo: no disponibles en la información proporcionada.
