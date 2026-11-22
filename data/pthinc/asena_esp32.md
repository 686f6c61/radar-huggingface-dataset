# pthinc/Asena_ESP32

## Resumen

Asena_ESP32 es un modelo de lenguaje de tipo transformer, concretamente una implementación de la arquitectura LLaMA (`LlamaForCausalLM`), desarrollado por el autor `pthinc` (PROMETECH Inc.) y publicado bajo el paraguas del proyecto "Behavioral Consciousness Engine" (BCE). Se trata de un micro-LLM de aproximadamente 1,21 millones de parámetros, diseñado explícitamente para su despliegue en microcontroladores ESP32 (en particular variantes ESP32-S3) mediante forks de llama.cpp y almacenamiento en LittleFS o SPIFFS. El modelo se presenta como "God of Edge AI" y está orientado a inferencia totalmente offline en dispositivos con recursos extremadamente limitados.

El modelo resuelve el problema de ejecutar generación de texto y razonamiento básico sin conectividad ni servidores, en contextos de robótica embebida, NPCs, asistentes offline o prefiltros de seguridad. Su relevancia actual radica en la tendencia hacia la IA en el extremo (edge AI), donde la latencia, la privacidad y el consumo energético son críticos. No obstante, su escala implica una capacidad de conocimiento y razonamiento muy reducida, y su ventana de contexto es de solo 128 tokens.

El modelo está entrenado en inglés y turco, con una licencia marcada como "other" (no estándar), y se distribuye tanto en formato `safetensors` como en `GGUF`. La model card incluye afirmaciones de rendimiento y métricas internas del proyecto BCE que no están respaldadas por benchmarks públicos estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (`LlamaForCausalLM`) |
| Parametros totales | 1.208.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (se mencionan ficheros GGUF, sin detallar variantes) |
| Idiomas soportados | inglés (en) y turco (tr) |
| Licencia | other (no estándar, definida por el autor) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Asena_ESP32 es un transformer decoder-only con 8 capas, tamaño oculto de 64, 8 cabezas de atención (4 cabezas clave-valor, es decir, GQA) con dimensión por cabeza de 26, y una red feed-forward con tamaño intermedio de 208 y activación SiLU. Incorpora sesgos en las capas de atención y MLP, dropout mínimo (~0,0027) y normalización RMSNorm con epsilon ajustado. Usa embeddings de entrada y salida compartidos (weight tying) para reducir el recuento de parámetros, y RoPE con factor de escalado de 256 inspirado en LLaMA 3. El tokenizador tiene un vocabulario de 8.766 tokens, con tokens especiales para padding (8000), BOS (8001) y EOS (8002). El modelo se entrena y ejecuta en float32, con caché desactivada para reducir el uso de memoria.

El entrenamiento se realizó sobre varios datasets propios del autor: `pthinc/BCE-Prettybird-Micro-Standard-v0.0.5`, `pthinc/mutant_reasoning`, `pthinc/BCE-Prettybird-Micro-Math-v0.1`, `pthinc/Prettybird-Framework` y `Salesforce/wikitext`. No se especifican el número total de tokens, la composición exacta ni si hubo RLHF o DPO. La model card menciona que ciertos hiperparámetros (como el dropout) se derivan de constantes matemáticas y físicas (constante de Planck, pi, número de Euler) como "factores de escala deterministas", una decisión de diseño no convencional y sin justificación empírica publicada.

## Capacidades

- Generación de texto breve y respuestas de chat en inglés y turco.
- Razonamiento muy limitado y "thinking mode" mencionado en los tags, sin detalles técnicos.
- Soporte declarado para agentes y tool calling (tags `agent`, `text-generation-inference`), sin documentación de formato.
- Capacidades de "prefiltro" o guardia para seguridad (tags `guard`, `pre filter`, `secure`).
- Orientado a robótica embebida, NPCs y asistentes offline.
- No se documentan capacidades de visión, audio ni matemáticas avanzadas.
- Multilingüismo restringido a inglés y turco.

## Casos de uso

- Asistente offline en dispositivos ESP32-S3: el modelo se carga desde LittleFS o SPIFFS y responde a comandos cortos sin conexión, adecuado por su huella de ~1,2 M de parámetros y contexto de 128 tokens.
- NPCs en videojuegos o instalaciones interactivas: genera diálogos breves y deterministas, con bajo consumo energético y latencia predecible.
- Prefiltro de seguridad en el extremo: clasifica o descarta entradas de usuario antes de enviarlas a un modelo mayor, gracias a su bajo coste computacional.
- Robótica de bajo consumo: interpretación de comandos de voz/texto en inglés o turco para actuadores simples, donde no se requiere conocimiento amplio.
- Domótica e IoT: respuestas a comandos estructurados y confirmaciones en dispositivos con memoria limitada.
- Educación y demostraciones de edge AI: ejemplo práctico de despliegue de un LLM en microcontrolador para docencia o prototipos.
- Etiquetado o generación de texto muy corto en pipelines embebidos, siempre que la tarea quepa en 128 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye métricas internas del proyecto BCE (por ejemplo, "processing speed 309.845 traces/sec", "latency 0,0032 ms", "security 99,9996%") que corresponden a la simulación del pipeline de datos BCE, no a la evaluación del modelo en tareas de lenguaje, y no son comparables con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 para los pesos (1,2 M de parámetros), aunque el runtime y el tokenizador añaden overhead.
- GPU recomendadas: no aplica; el modelo está pensado para CPU y microcontroladores. Puede ejecutarse en cualquier GPU moderna sin problema.
- Cabe en GPU de consumo y en microcontroladores ESP32-S3 con PSRAM; el despliegue objetivo es ESP32 con forks de llama.cpp.
- Opciones de despliegue: llama.cpp (forks para ESP32), transformers, text-generation-inference (según tags), y carga desde LittleFS/SPIFFS en el dispositivo.
- Latencia y throughput: no disponibles de forma fiable; las cifras de la model card corresponden a la simulación BCE, no a la inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Asena_ESP32 | 1,21 M | 128 | en, tr | other | Hugging Face (safetensors, GGUF) |
| Asena_ESP32_MAX | no disponible | no disponible | no disponible | other | Hugging Face (modelo hermano mayor) |
| TinyLlama-1.1B | 1,1 B | 2048 | en (principalmente) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 0,5 B | 32.768 | multilingüe | Apache 2.0 | Hugging Face |

La comparación con TinyLlama o Qwen2.5-0.5B es solo orientativa: Asena_ESP32 es tres órdenes de magnitud menor y está diseñado para un nicho completamente distinto (microcontroladores), por lo que no compite en capacidad de lenguaje general.

## Limitaciones y advertencias

- Capacidad de conocimiento y razonamiento muy limitada por su tamaño (1,2 M de parámetros); no es adecuado para tareas complejas.
- Ventana de contexto de solo 128 tokens, insuficiente para conversaciones multi-turno largas o documentos.
- Idiomas restringidos a inglés y turco; el rendimiento en castellano no está soportado ni evaluado.
- La model card declara una tasa de alucinación del 20% y una desviación de error de ±5%, sin metodología de medición publicada.
- Licencia "other" no estándar: es necesario revisar los términos del autor antes de cualquier uso comercial.
- Afirmaciones de marketing ("God of Edge AI", "consciousness") sin respaldo técnico verificable.
- Métricas internas del proyecto BCE no verificables de forma independiente.
- El modelo se ejecuta en float32 con caché desactivada, lo que limita aún más el throughput en dispositivos embebidos.
- Riesgo de sesgos derivados de los datasets propios del autor, de composición no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pthinc/Asena_ESP32
- Modelo hermano mayor: https://huggingface.co/pthinc/Asena_ESP32_MAX
- Demo "Laws of Physical Amplitude": https://huggingface.co/spaces/pthinc/LawsofPhysicalAmplitude
- Demo "BCE vs Classic": https://huggingface.co/spaces/pthinc/BCEvsClassic
- Dataset BCE-Prettybird-Micro-Standard-v0.0.5: https://huggingface.co/datasets/pthinc/BCE-Prettybird-Micro-Standard-v0.0.5
- Dataset mutant_reasoning: https://huggingface.co/datasets/pthinc/mutant_reasoning
- Dataset BCE-Prettybird-Micro-Math-v0.1: https://huggingface.co/datasets/pthinc/BCE-Prettybird-Micro-Math-v0.1
- Dataset Prettybird-Framework: https://huggingface.co/datasets/pthinc/Prettybird-Framework
