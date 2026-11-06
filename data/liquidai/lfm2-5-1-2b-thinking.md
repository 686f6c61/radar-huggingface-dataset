# LiquidAI/LFM2.5-1.2B-Thinking

## Resumen

LFM2.5-1.2B-Thinking es un modelo de lenguaje de 1.170 millones de parametros desarrollado por Liquid AI, disenado especificamente para despliegue en dispositivo (on-device) y entornos de borde. Forma parte de la familia LFM2.5, que amplia la arquitectura hibrida LFM2 original con un preentrenamiento extendido de 10T a 28T de tokens y un entrenamiento de refuerzo multi-etapa a gran escala. El resultado es un modelo de razonamiento generalista que, segun el autor, compite con modelos notablemente mas grandes manteniendo un consumo de memoria inferior a 1 GB en cuantizacion.

La arquitectura combina 10 bloques de convolucion doblemente con puerta (double-gated convolution) con 6 bloques de atencion con query agrupada (GQA), sumando 16 capas en total. Con una longitud de contexto de 32.768 tokens y un vocabulario de 65.536 entradas, el modelo esta pensado para tareas agenticas, extraccion de datos y RAG, no para tareas intensivas en conocimiento ni programacion, segun indica el propio autor.

Su relevancia actual radica en la eficiencia: Liquid AI reporta 239 tok/s de decodificacion en CPU AMD y 82 tok/s en NPU movil, con soporte de dia uno para llama.cpp, MLX y vLLM. Esto lo situa como una opcion practica para inferencia local en portatiles, moviles y dispositivos embebidos sin GPU dedicada, un nicho donde los modelos de razonamiento de mayor tamano no son viables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 10 bloques de convolucion doblemente con puerta + 6 bloques GQA (transformer con atencion de query agrupada) |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF (llama.cpp), ONNX, MLX 8-bit; niveles concretos de cuantizacion no disponibles |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol |
| Licencia | LFM Open License v1.0 (lfm1.0, "other") |
| Formato de pesos | safetensors (nativo), GGUF, ONNX, MLX |
| Capas | 16 |
| Vocabulario | 65.536 tokens |
| Presupuesto de entrenamiento | 28T tokens |
| Corte de conocimiento | mediados de 2024 |
| Parametros de generacion recomendados | temperature 0.05, top_k 50, repetition_penalty 1.05 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que alterna bloques de convolucion doblemente con puerta con bloques de atencion GQA. Esta combinacion busca reducir el coste computacional y de memoria frente a un transformer puro, manteniendo la capacidad de modelar dependencias de largo alcance gracias a los bloques de atencion. El preentrenamiento se escalo de 10T a 28T de tokens respecto a la generacion anterior LFM2, y se completo con un entrenamiento de refuerzo multi-etapa a gran escala que da lugar a la variante "Thinking", orientada a razonamiento explicito. La model card no detalla la composicion del dataset ni si se emplearon tecnicas concretas como RLHF o DPO mas alla de la mencion generica al entrenamiento por refuerzo.

El modelo usa una plantilla de chat tipo ChatML con tokens especiales como `<|startoftext|>`, `<|im_start|>` y `<|im_end|>`, y dispone de tokens dedicados para llamadas a herramientas (`<|tool_call_start|>` y `<|tool_call_end|>`). No se han publicado en la informacion disponible detalles sobre decodificacion especulativa u otras optimizaciones de inferencia mas alla del soporte nativo en llama.cpp, MLX y vLLM.

## Capacidades

- Generacion de texto y razonamiento explicito en modo "Thinking".
- Razonamiento multi-paso y tareas agenticas.
- Llamada a funciones (function calling / tool calling): el modelo emite llamadas en formato Pythonico entre tokens especiales por defecto, con opcion de forzar salida JSON mediante instruccion en el system prompt.
- Extraccion de datos estructurados y soporte para pipelines RAG.
- Capacidades multilingues en ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.
- Integracion con plantillas de chat mediante `tokenizer.apply_chat_template()`.
- No es multimodal: es un modelo solo de texto.

## Casos de uso

- Agentes autonomos en dispositivo: el modelo puede orquestar llamadas a herramientas en varios pasos dentro de un contexto de 32.768 tokens, lo que permite mantener el estado de una tarea agentica sin salir del dispositivo y sin depender de la nube.
- Extraccion de datos estructurados: a partir de documentos o formularios, el modelo genera salidas JSON o Pythonicas invocables, adecuado para pipelines de ingestion donde se requiere bajo coste y baja latencia.
- RAG ligero en el borde: con 32.768 tokens de contexto puede ingerir varios fragmentos recuperados y sintetizar respuestas, ejecutandose en menos de 1 GB de memoria en cuantizacion, lo que lo hace viable en portatiles y dispositivos moviles.
- Asistentes conversacionales locales: su plantilla ChatML y sus velocidades de decodificacion (239 tok/s en CPU AMD, 82 tok/s en NPU movil) permiten conversaciones multi-turno fluidas sin GPU.
- Automatizacion de flujos en movil: integrable mediante ONNX o MLX en aplicaciones iOS/macOS y Android, para tareas de clasificacion, resumen o reescritura de texto en local.
- Prototipado rapido de agentes con tool calling: al soportar llamadas a funciones nativas y desplegarse en vLLM o llama.cpp, sirve para validar disenos de agentes antes de escalar a modelos mayores.
- Filtrado y enriquecimiento de datos en pipelines de ML: su bajo coste permite usarlo como modelo de anotacion o preprocesamiento a gran escala en CPU.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmarks comparativos, pero los valores numericos concretos no estan disponibles en el texto proporcionado. Los unicos datos de rendimiento explicitos son de velocidad de inferencia:

| Metrica | Valor |
|---|---|
| Decodificacion en CPU AMD | 239 tok/s |
| Decodificacion en NPU movil | 82 tok/s |
| Memoria en cuantizacion | menos de 1 GB |

No se han publicado en la informacion disponible resultados numericos de benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el modelo completo en safetensors ocupa aproximadamente 2,3 GB (pesos en bf16/fp16). En cuantizacion de 8 bits ronda 1,2 GB; en 4 bits, por debajo de 1 GB, como indica el autor.
- GPU recomendadas: no requiere GPU dedicada. Puede ejecutarse en CPU moderna (AMD o Intel) y en NPU moviles. En GPU, cualquier tarjeta con 4 GB o mas de VRAM es suficiente; modelos como RTX 3060, RTX 4060 o superiores ofrecen margen amplio.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual, e incluso en iGPU y CPU.
- Opciones de despliegue: Transformers, vLLM, llama.cpp (via GGUF), ONNX Runtime (via ONNX), MLX en Apple Silicon. Tambien esta disponible en Azure (tag deploy:azure).
- Latencia y throughput: 239 tok/s de decodificacion en CPU AMD y 82 tok/s en NPU movil, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking | 1,17B | 32.768 | LFM Open License v1.0 | Razonamiento en dispositivo |
| LFM2.5-1.2B-Instruct | 1,2B | no disponible | LFM Open License v1.0 | Instrucciones generales |
| LFM2.5-1.2B-Base | 1,2B | no disponible | LFM Open License v1.0 | Base para fine-tuning |
| LFM2.5-1.2B-JP | 1,2B | no disponible | LFM Open License v1.0 | Chat optimizado para japones |

No se dispone en la informacion proporcionada de datos de benchmarks que permitan comparar el rendimiento con modelos de otros fabricantes de tamano similar; la comparativa se limita a las variantes de la propia familia LFM2.5.

## Limitaciones y advertencias

- El autor desaconseja explicitamente su uso para tareas intensivas en conocimiento y para programacion.
- Riesgo de alucinacion inherente a un modelo de 1,17B; no debe usarse como fuente de verdad sin verificacion externa.
- Corte de conocimiento a mediados de 2024: no cubre eventos posteriores.
- Contexto limitado a 32.768 tokens, inferior al de modelos de mayor tamano.
- Cobertura multilingue limitada a ocho idiomas; el rendimiento fuera de ellos no esta garantizado.
- La licencia LFM Open License v1.0 no es una licencia de codigo abierto estandar; es necesario revisar sus terminos antes de uso comercial.
- El modo "Thinking" con temperature recomendada de 0.05 indica una generacion muy determinista, lo que puede reducir la diversidad de respuestas en tareas creativas.
- No dispone de capacidades de vision ni audio en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Variante Instruct: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Variante JP: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP
- Variante vision-lenguaje: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Variante audio-lenguaje: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- GGUF: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-GGUF
- ONNX: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-ONNX
- MLX 8-bit: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-MLX-8bit
- Blog del modelo: https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb
- Playground: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Documentacion de plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Documentacion de tool use: https://docs.liquid.ai/lfm/key-concepts/tool-use
- Plataforma LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Paper de referencia: arxiv:2511.23404
