# pthinc/Asena_ESP32_MAX

## Resumen

Asena_ESP32_MAX es un modelo de lenguaje de tipo Tiny LLM desarrollado por pthinc (PROMETECH Inc.) bajo el marco que el autor denomina Behavioral Consciousness Engine (BCE). Con 12.174.016 parámetros totales, se presenta como una evolución del modelo base Asena_ESP32, orientada a inferencia en microcontroladores ESP32 (en particular ESP32-S3) y dispositivos de borde extremo, mediante forks de llama.cpp ejecutados sobre ESP-IDF y almacenamiento en LittleFS o SPIFFS.

El modelo emplea la arquitectura LlamaForCausalLM (transformer decoder-only) con 8 capas, tamaño oculto de 320, 8 cabezas de atención y 4 cabezas clave-valor (GQA), red feed-forward con tamaño intermedio de 896 y activación SiLU. Incorpora RoPE con factor de escalado 128, RMSNorm y embeddings de entrada y salida compartidos. La longitud máxima de secuencia es de 1024 tokens y el vocabulario del tokenizador es de 8766 tokens.

Su relevancia radica en la propuesta de ejecutar un modelo conversacional con capacidades declaradas de razonamiento y agentes en hardware embebido sin conexión, algo poco habitual en esta franja de tamaño. No obstante, las afirmaciones del autor sobre consciencia conductual, métricas de seguridad y rendimiento deben tratarse con cautela, ya que no se acompañan de evaluaciones independientes ni de resultados de benchmarks estándar verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), 8 capas, hidden size 320, 8 cabezas de atencion, 4 cabezas KV (GQA), FFN intermedio 896, activacion SiLU, RMSNorm, RoPE con factor de escalado 128 |
| Parametros totales | 12.174.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF incluido en el repositorio (niveles concretos no disponibles); pesos safetensors en float32 |
| Idiomas soportados | Ingles (en) y turco (tr) |
| Licencia | other (terminos no detallados en la informacion disponible) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de tipo LLaMA con 8 capas, dimensión oculta de 320 y 8 cabezas de atención de dimensión 40, de las cuales 4 son cabezas clave-valor para atención con consultas agrupadas (GQA), lo que reduce el coste de memoria de la caché KV. La red feed-forward tiene tamaño intermedio de 896 con activación SiLU, y se aplican términos de sesgo tanto en atención como en MLP. La normalización usa RMSNorm con epsilon ajustado y los embeddings de entrada y salida están compartidos. El posicionamiento se resuelve con RoPE configurado con factor de escalado 128, inspirado en LLaMA 3, y la ventana máxima es de 1024 tokens. El tokenizador tiene un vocabulario de 8766 tokens con identificadores especiales para padding (8000), BOS (8001) y EOS (8002). El modelo opera en float32 y la caché está desactivada por defecto para reducir el consumo de memoria en tiempo de ejecución.

El autor declara un entrenamiento basado en un conjunto de datasets propios del marco BCE (BCE-Prettybird-Micro-Standard, Micro-Math, Nano-Science, Nano-OWL, Nano-Parrot, Nano-Kangal, Prettybird-Framework, mutant_reasoning) junto con Salesforce/wikitext y nohurry/Opus-4.6-Reasoning-3000x-filtered. No se especifica el número total de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron fases de RLHF o DPO. El autor menciona el uso de constantes matemáticas (constante de Planck, pi, número de Euler) para derivar hiperparámetros como el dropout (~0.0066), una decisión de diseño idiosincrásica sin validación externa documentada. Tampoco se detalla el proceso de destilación o generación de datos sintéticos más allá de la referencia al marco BCE.

## Capacidades

- Generación de texto conversacional multi-turno dentro de una ventana de 1024 tokens.
- Razonamiento declarado en modo "thinking" o "think", según las etiquetas del autor; sin evaluación independiente disponible.
- Generación de código y matemáticas a nivel básico, derivado de los datasets Micro-Math y mutant_reasoning; sin benchmarks publicados.
- Soporte declarado de agentes y razonamiento multi-paso, orientado a asistentes offline y NPCs.
- Capacidades multilingües limitadas a inglés y turco.
- Integración prevista con tool calling y function calling a través de text-generation-inference, según las etiquetas del repositorio; sin especificación técnica del formato.
- Ejecución en microcontroladores ESP32-S3 mediante forks de llama.cpp y almacenamiento en LittleFS o SPIFFS.
- Uso declarado como asistente offline, guardia o prefiltro de seguridad en dispositivos de borde.

## Casos de uso

- Asistente offline en microcontroladores ESP32-S3: el modelo se cargaría desde una tarjeta SD o partición LittleFS/SPIFFS y se ejecutaría con un fork de llama.cpp sobre ESP-IDF, ofreciendo respuestas conversacionales básicas sin conectividad de red en dispositivos IoT con recursos muy limitados.
- Prefiltro de seguridad en el borde: dado su reducido tamaño y su pretensión de filtrado ético, podría emplearse como primera capa de clasificación de entradas antes de enviar tráfico a un modelo mayor en la nube, reduciendo coste y latencia en despliegues con muchos dispositivos.
- NPCs y personajes de videojuego o robótica: con 12M de parámetros y contexto de 1024 tokens, encaja en placas embebidas para generar diálogo reactivo y coherente a corto plazo en robots de bajo coste o instalaciones interactivas.
- Asistente de voz para domótica local: combinado con un motor de reconocimiento de voz en el dispositivo, el modelo podría gestionar intenciones y respuestas breves en inglés o turco sin depender de servicios externos, preservando la privacidad.
- Prototipado educativo de LLMs en hardware embebido: sirve para demostrar el ciclo completo de cuantización, despliegue y ejecución de un transformer en un ESP32-S3, con un repositorio de 0,1 GB que incluye pesos safetensors y GGUF.
- Guardia o centinela textual en dispositivos de borde: el autor lo etiqueta como "guard" y "pre filter", por lo que podría monitorizar flujos de texto cortos y disparar alertas locales en entornos con conectividad intermitente.
- Experimentación con el marco BCE: investigadores interesados en las afirmaciones del autor sobre consciencia conductual y memoria selectiva pueden reproducir el pipeline declarado y contrastar las métricas reportadas con sus propios datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente declara una tasa de alucinación del 15% y una desviación de error de ±5%, sin metodología de medición ni conjunto de evaluación especificado. Las métricas internas del marco BCE (309.845 trazas/s, latencia de 0,0032 ms, MSE de 0,000051, eficiencia cognitiva del 57,03% y tasa de rechazo del 99,9996%) corresponden a la simulación del motor BCE, no al rendimiento del modelo en tareas de lenguaje, y no son comparables con benchmarks de LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 para los 12,17M de parámetros (aproximadamente 49 MB de pesos más overhead); en GGUF cuantizado, del orden de 10-25 MB según el nivel.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el modelo está pensado para CPU y microcontroladores. Para entrenamiento o fine-tuning, una única GPU consumer es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con más de 1 GB de VRAM, e incluso en CPU y en placas ESP32-S3 con PSRAM.
- Opciones de despliegue: forks de llama.cpp para ESP32 sobre ESP-IDF, llama.cpp en CPU, Ollama, vLLM y text-generation-inference (etiqueta del repositorio), y transformers con safetensors.
- Latencia y throughput: no disponibles de forma verificable. El autor no publica mediciones de tokens por segundo en ESP32-S3 ni en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Asena_ESP32_MAX | 12,17M | 1024 | other | Hugging Face (safetensors, GGUF) | Enfocado a ESP32-S3 y edge extremo |
| Asena_ESP32 (modelo hermano) | no disponible | no disponible | other | Hugging Face | Versión base del mismo autor, menor capacidad declarada |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Hugging Face, GGUF | Aproximadamente 90 veces más parámetros; requiere hardware muy superior |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Hugging Face, GGUF | Un orden de magnitud mayor; no apto para ESP32 |

La comparación directa con modelos de la misma franja (por debajo de 50M de parámetros) es difícil porque la mayoría de Tiny LLMs públicos no están diseñados para microcontroladores ni publican resultados en benchmarks estándar. El modelo hermano Asena_ESP32 es la alternativa más cercana dentro del mismo ecosistema, pero sus especificaciones no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Ventana de contexto de solo 1024 tokens, insuficiente para conversaciones largas, documentos o razonamiento multi-paso extenso.
- Vocabulario de 8766 tokens, muy reducido, lo que limita la cobertura léxica y la calidad en dominios especializados.
- Solo soporta inglés y turco; no hay soporte declarado de castellano.
- Tasa de alucinación declarada del 15% por el propio autor, sin metodología de medición verificable.
- Las afirmaciones sobre "consciencia conductual", métricas de seguridad del 99,9996% y estabilidad derivada de constantes matemáticas carecen de validación independiente y deben considerarse marketing del autor.
- Licencia "other" sin términos detallados en la información disponible; es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial.
- El repositorio tiene solo 638 descargas y 3 likes, lo que indica una adopción muy limitada y escasa revisión por la comunidad.
- El modelo opera en float32 con caché desactivada por defecto, lo que puede degradar el rendimiento en generación autoregresiva si no se ajusta.
- No se documentan sesgos conocidos, pero un corpus de entrenamiento con wikitext y datasets sintéticos propios probablemente hereda sesgos de esas fuentes.
- Riesgo de sobreajuste a los formatos de instrucción del marco BCE, con posible degradación fuera de esos patrones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pthinc/Asena_ESP32_MAX
- Modelo hermano Asena_ESP32: https://huggingface.co/pthinc/Asena_ESP32
- Demo Laws of Physical Amplitude: https://huggingface.co/spaces/pthinc/LawsofPhysicalAmplitude
- Demo BCE vs Classic: https://huggingface.co/spaces/pthinc/BCEvsClassic
- Dataset BCE-Prettybird-Micro-Standard-v0.0.5: https://huggingface.co/datasets/pthinc/BCE-Prettybird-Micro-Standard-v0.0.5
- Dataset BCE-Prettybird-Micro-Math-v0.1: https://huggingface.co/datasets/pthinc/BCE-Prettybird-Micro-Math-v0.1
- Dataset mutant_reasoning: https://huggingface.co/datasets/pthinc/mutant_reasoning
- Dataset Prettybird-Framework: https://huggingface.co/datasets/pthinc/Prettybird-Framework
- Dataset Salesforce/wikitext: https://huggingface.co/datasets/Salesforce/wikitext
