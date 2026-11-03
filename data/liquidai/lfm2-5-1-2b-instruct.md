# LiquidAI/LFM2.5-1.2B-Instruct

## Resumen

LFM2.5-1.2B-Instruct es un modelo de lenguaje de 1.170 millones de parametros desarrollado por Liquid AI, disenado especificamente para despliegue en dispositivo (edge). Forma parte de la familia LFM2.5, que amplia la arquitectura hibrida LFM2 original con un preentrenamiento extendido de 10T a 28T tokens y un proceso de aprendizaje por refuerzo multietapa a gran escala. El modelo esta afinado para instrucciones y conversacion general, con una longitud de contexto de 32.768 tokens y un vocabulario de 65.536 entradas.

La propuesta de valor del modelo es ofrecer un rendimiento que, segun el autor, rivaliza con modelos de mayor tamano, pero con un coste computacional que permite ejecutarlo en CPU, NPU moviles y hardware de consumo. Liquid AI reporta 239 tokens por segundo en decodificacion sobre CPU AMD y 82 tokens por segundo en NPU movil, con un consumo de memoria inferior a 1 GB en configuraciones cuantizadas. El modelo es compatible desde el primer dia con llama.cpp, MLX y vLLM.

Es relevante ahora porque el ecosistema de modelos pequenos orientados a inferencia local esta creciendo rapidamente, y LFM2.5-1.2B-Instruct compite directamente con propuestas como Qwen3-1.7B o Gemma 3 1B en el segmento de modelos sub-2B para agentes, extraccion de datos y RAG. Liquid AI recomienda explicitamente el modelo para tareas agenticas, extraccion de datos y generacion aumentada por recuperacion, y desaconseja su uso en tareas intensivas en conocimiento y programacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 16 capas (10 bloques de convolucion doblemente con puerta + 6 bloques GQA) |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF (llama.cpp), MLX 8-bit, ONNX; cuantizaciones adicionales no detalladas |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol |
| Licencia | lfm1.0 (licencia propia de Liquid AI, marcada como "other") |
| Formato de pesos | safetensors (formato nativo); variantes GGUF, ONNX y MLX disponibles |
| Vocabulario | 65.536 tokens |
| Knowledge cutoff | Mediados de 2024 |
| Parametros de generacion recomendados | temperature 0.1, top_k 50, repetition_penalty 1.05 |

## Arquitectura y entrenamiento

LFM2.5-1.2B-Instruct emplea una arquitectura hibrida que combina 10 bloques de convolucion doblemente con puerta (double-gated convolution) con 6 bloques de atencion con consultas agrupadas (GQA). Esta mezcla busca reducir el coste computacional de la atencion tradicional manteniendo la capacidad de modelado de dependencias de largo alcance, lo que resulta especialmente adecuado para inferencia en hardware limitado. El modelo cuenta con 16 capas en total y un vocabulario de 65.536 tokens.

El entrenamiento se realizo sobre 28 billones de tokens (frente a los 10 billones de la generacion anterior), seguido de un proceso de aprendizaje por refuerzo multietapa a gran escala. Liquid AI no detalla en la informacion disponible la composicion exacta del dataset, el uso de RLHF frente a DPO, ni los detalles del pipeline de RL. El modelo base es LiquidAI/LFM2.5-1.2B-Base, sobre el que se aplico el ajuste por instrucciones. Como innovacion destacable, Liquid AI publica un modelo borrador de decodificacion especulativa (DSpark, 296M parametros) que, emparejado con este modelo, acelera la decodificacion aproximadamente 2,1x manteniendo salidas identicas.

## Capacidades

- Generacion de texto conversacional multi-turno en ocho idiomas (ingles, arabe, chino, frances, aleman, japones, coreano, espanol).
- Soporte de tool calling / function calling: el modelo emite llamadas a funciones en formato Pythonico entre los tokens especiales `<|tool_call_start|>` y `<|tool_call_end|>`, con posibilidad de forzar salida JSON mediante instruccion en el system prompt.
- Capacidad para tareas agenticas y razonamiento multipaso, segun la recomendacion explicita del autor.
- Extraccion de datos estructurados y generacion aumentada por recuperacion (RAG).
- Formato de chat tipo ChatML, compatible con `tokenizer.apply_chat_template()`.
- No incluye modo de razonamiento explicito (thinking); para ello existe la variante LFM2.5-1.2B-Thinking.
- No incluye vision ni audio; para esas modalidades existen LFM2.5-VL-1.6B y LFM2.5-Audio-1.5B.
- Decodificacion especulativa mediante el modelo borrador DSpark (296M) para acelerar la inferencia.

## Casos de uso

- Agentes autonomos en dispositivo: el modelo puede gestionar bucles de tool calling con contexto de 32.768 tokens, lo que permite mantener el estado de una tarea agentica con varias llamadas a herramientas sin salir del dispositivo.
- Extraccion de datos estructurados: a partir de documentos o conversaciones, el modelo genera salidas JSON o Pythonicas que se pueden parsear directamente en pipelines de ingestion, aprovechando su soporte nativo de function calling.
- RAG en entornos con recursos limitados: con 1,17B parametros y menos de 1 GB de memoria en cuantizacion, se puede desplegar junto a un indice vectorial local para responder preguntas sobre documentacion corporativa sin depender de la nube.
- Asistentes conversacionales embebidos: su capacidad multilingue en ocho idiomas y su formato ChatML lo hacen adecuado para chatbots en aplicaciones moviles o dispositivos IoT donde la latencia y la privacidad son criticas.
- Clasificacion y enrutamiento de tickets: el modelo puede etiquetar y dirigir consultas entrantes en varios idiomas, con un coste por inferencia muy bajo gracias a los 239 tok/s en CPU AMD reportados.
- Preprocesamiento en pipelines de LLM mayores: puede actuar como modelo de primera etapa para resumir, normalizar o filtrar contenido antes de pasarlo a un modelo mayor, reduciendo costes de API.
- Fine-tuning especifico de dominio: al publicarse el checkpoint nativo en safetensors y el modelo base, es viable ajustar el modelo para tareas concretas (legal, sanitario, atencion al cliente) con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen comparativa y referencias a rendimiento "best-in-class", pero no se proporcionan cifras numericas de MMLU, HumanEval, GSM8K ni otros benchmarks en el texto disponible. Los unicos datos cuantitativos de rendimiento son de inferencia: 239 tok/s en decodificacion sobre CPU AMD y 82 tok/s sobre NPU movil, con menos de 1 GB de memoria en configuraciones optimizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3 GB en precision completa (fp16/bf16) segun el tamano del repo; menos de 1 GB en cuantizaciones de 4-8 bits.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo esta pensado para CPU y NPU, por lo que GPU dedicada no es requisito. En GPU, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU sin GPU.
- Opciones de despliegue: Transformers, vLLM, llama.cpp (via GGUF), MLX (Apple Silicon), ONNX Runtime, y el stack LEAP de Liquid AI.
- Latencia y throughput: 239 tok/s en decodificacion sobre CPU AMD y 82 tok/s sobre NPU movil, segun el autor. Con el borrador especulativo DSpark se reporta un incremento de aproximadamente 2,1x en velocidad de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct | 1,17B | 32.768 | lfm1.0 | safetensors, GGUF, ONNX, MLX | Hibrido convolucion + GQA, orientado a edge |
| Qwen3-1.7B | 1,7B | no disponible en esta fuente | Apache 2.0 (segun conocimiento general, no verificado aqui) | safetensors, GGUF | Mayor numero de parametros; familia ampliamente adoptada |
| Gemma 3 1B | 1B | no disponible en esta fuente | Gemma Terms of Use (no verificado aqui) | safetensors, GGUF | Modelo de Google orientado a dispositivo |
| Llama 3.2 1B | 1,24B | 128.000 (segun especificacion publica de la familia) | Llama 3.2 Community License | safetensors, GGUF | Contexto mucho mayor; mayor ecosistema |

Los datos de Qwen3-1.7B, Gemma 3 1B y Llama 3.2 1B no provienen de la informacion proporcionada en esta ficha y deben verificarse en sus respectivas model cards. No se dispone de comparaciones de rendimiento numericas entre estos modelos y LFM2.5-1.2B-Instruct en la informacion disponible.

## Limitaciones y advertencias

- El autor desaconseja explicitamente su uso en tareas intensivas en conocimiento y en programacion; para esos casos existen modelos mayores o variantes especializadas.
- Riesgo de alucinacion inherente a modelos de 1,2B parametros; no debe usarse como fuente de verdad sin verificacion.
- Knowledge cutoff a mediados de 2024: no conoce eventos ni datos posteriores.
- La licencia lfm1.0 es una licencia propia de Liquid AI marcada como "other"; es imprescindible revisar los terminos del archivo LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones adicionales no reflejadas en esta ficha.
- Aunque soporta ocho idiomas, el rendimiento relativo por idioma no se detalla en la informacion disponible; el espanol esta incluido pero no se reportan metricas especificas.
- El modelo emite llamadas a funciones en formato Pythonico por defecto, lo que requiere un parser especifico o instruccion explicita para forzar JSON.
- No dispone de modo de razonamiento explicito; para tareas que requieran cadenas de pensamiento largas conviene usar la variante Thinking.
- El modelo tiene una version posterior anunciada (LiquidAI/LFM3-1.7B) segun el campo `new_version` de la model card, lo que sugiere que LFM2.5 puede quedar progresivamente despriorizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Variante Thinking: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Variante japonesa: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP
- Variante vision-lenguaje: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Variante audio-lenguaje: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- GGUF: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- ONNX: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-ONNX
- MLX 8-bit: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-MLX-8bit
- Borrador de decodificacion especulativa DSpark: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-DSpark
- Blog de presentacion: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Playground: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Documentacion de chat template: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Documentacion de tool use: https://docs.liquid.ai/lfm/key-concepts/tool-use
- LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Paper referenciado (arXiv:2511.23404): https://arxiv.org/abs/2511.23404
