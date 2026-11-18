# LiquidAI/LFM2.5-8B-A1B

## Resumen

LFM2.5-8B-A1B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Liquid AI, disenado especificamente para despliegue en dispositivo (on-device) y aplicaciones de asistente personal. Emplea la arquitectura hibrida LFM2, que combina capas convolucionales doblemente con puerta (double-gated conv) con capas de atencion GQA, y cuenta con 8.467.856.832 parametros totales segun los pesos en safetensors, de los cuales aproximadamente 1.500 millones estan activos por token (8.3B totales / 1.5B activos segun la model card). Su ventana de contexto alcanza los 128.000 tokens.

El modelo es la version afinada con razonamiento (reasoning-tuned) de la base LFM2.5-8B-A1B-Base, entrenada sobre 38 billones de tokens y posteriormente sometida a aprendizaje por refuerzo. Soporta diez idiomas (ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues y espanol) y esta optimizado para flujos agénticos, uso de herramientas, salidas estructuradas y asistentes multilingues. Liquid AI lo posiciona como competitivo frente a modelos densos y MoE de mayor tamano en seguimiento de instrucciones y tareas agénticas, con especial enfasis en throughput.

Su relevancia actual radica en la combinacion de una ventana de contexto amplia, soporte nativo de function calling y un formato de pesos disponible en multiples backends (Transformers, GGUF, ONNX, MLX), ademas de un modelo drafter de decodificacion especulativa (DSpark, 328M) que promete acelerar la decodificacion. La licencia es lfm1.0, de tipo "other", por lo que conviene revisar sus terminos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida LFM2: 24 capas (18 double-gated conv + 6 GQA), MoE |
| Parametros totales | 8.467.856.832 (8.3B) |
| Parametros activos | 1.5B (segun model card) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF (llama.cpp), ONNX, MLX 8-bit; otras cuantizaciones no disponibles |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (nativo), GGUF, ONNX, MLX |
| Tamano del vocabulario | 128.000 |
| Presupuesto de entrenamiento | 38 billones de tokens |
| Parametros de generacion recomendados | temperature 0.2, top_k 80, repetition_penalty 1.05 |

## Arquitectura y entrenamiento

LFM2.5-8B-A1B se construye sobre la arquitectura hibrida LFM2, que intercala 18 capas convolucionales doblemente con puerta con 6 capas de atencion con query agrupada (GQA) en un total de 24 capas. Esta combinacion busca reducir el coste computacional de la atencion clasica manteniendo la capacidad de modelado de dependencias largas, algo coherente con su ventana de 128.000 tokens. El modelo es de tipo Mixture of Experts, con 8.3B parametros totales y 1.5B activos por token, lo que permite un throughput elevado en CPU y GPU.

El entrenamiento parte de LFM2.5-8B-A1B-Base, preentrenado sobre 38 billones de tokens, y posteriormente se aplica un ajuste con aprendizaje por refuerzo (reinforcement learning) para obtener la version orientada a razonamiento. La model card menciona que es un modelo de razonamiento con cadena de pensamiento explicita en los turnos del asistente. Liquid AI publica ademas un drafter de decodificacion especulativa (DSpark, 328M) que, emparejado con el modelo principal, promete aproximadamente 2.5x mas velocidad de decodificacion con salidas identicas.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento explicita antes de la respuesta final.
- Soporte de function calling en cuatro pasos: definicion de funciones en el system prompt, llamada en formato Pythonico entre tokens especiales `<|tool_call_start|>` y `<|tool_call_end|>`, ejecucion y retorno con rol `tool`, y respuesta final en texto plano.
- Capacidad de sobrescribir el formato de llamada para emitir JSON en lugar de Python, indicandolo en el system prompt.
- Flujos agénticos y encadenamiento de multiples llamadas a herramientas.
- Salidas estructuradas.
- Asistentes multilingues en diez idiomas.
- Capacidades de instruccion compleja orientadas a aplicaciones de asistente personal en dispositivo.
- No es un modelo multimodal: la model card lo describe como text-only.

## Casos de uso

- Asistente personal en dispositivo: el modelo puede ejecutarse en CPU y GPU con backends como llama.cpp, MLX o ONNX, gestionando conversaciones multi-turno con hasta 128.000 tokens de contexto y encadenando llamadas a herramientas para tareas cotidianas.
- Automatizacion de atencion al cliente: con soporte nativo de function calling, puede consultar el estado de un pedido o de un candidato en un proceso de seleccion (como en el ejemplo de la model card) y devolver una respuesta en lenguaje natural.
- Orquestacion agéntica multi-paso: su capacidad de encadenar llamadas a funciones y su modo de razonamiento lo hacen adecuado para pipelines donde el modelo decide que herramienta invocar en cada paso.
- Asistentes multilingues: al cubrir diez idiomas, puede desplegarse en aplicaciones de soporte o productividad para usuarios de habla hispana, arabe, china, francesa, alemana, italiana, japonesa, coreana y portuguesa.
- Generacion de salidas estructuradas: util para rellenar formularios, extraer campos o producir JSON validado en integraciones con sistemas externos, aprovechando la posibilidad de forzar llamadas en formato JSON.
- Despliegue en hardware de borde: gracias a sus 1.5B parametros activos y a los formatos GGUF/ONNX/MLX, puede integrarse en portatiles, Mac con Apple Silicon y dispositivos con recursos limitados.
- Aceleracion de inferencia en produccion: el drafter DSpark (328M) permite decodificacion especulativa con aproximadamente 2.5x mas velocidad manteniendo las mismas salidas.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona de forma cualitativa que el modelo es competitivo con modelos densos y MoE de mayor tamano en seguimiento de instrucciones y tareas agénticas, y hace referencia al AA-Omniscience Index de Artificial Analysis, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otros) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Como referencia de orden de magnitud, el repo nativo en safetensors ocupa 17.0 GB, por lo que la inferencia en precision completa requiere al menos esa cantidad de memoria; las versiones GGUF y MLX 8-bit reducen el requisito.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; los formatos GGUF, ONNX y MLX estan orientados a despliegue local y de borde, lo que sugiere viabilidad en hardware de consumo, pero sin cifras oficiales.
- Opciones de despliegue: Transformers, vLLM, SGLang, llama.cpp (GGUF), ONNX Runtime, MLX (Apple Silicon).
- Latencia y throughput: no disponibles. La model card afirma que es el mas rapido de su clase en CPU y GPU y que el drafter DSpark ofrece aproximadamente 2.5x mas velocidad de decodificacion, pero sin cifras absolutas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos numericos de modelos comparables de la misma categoria (MoE de ~8B totales con ~1.5B activos y contexto de 128K) que permitan una comparacion rigurosa de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- La model card indica explicitamente que no es la mejor opcion para programacion intensiva ni para preguntas intensivas en conocimiento sin recuperacion (RAG); en esos casos el riesgo de alucinacion aumenta.
- Es un modelo text-only; no soporta vision ni audio.
- La licencia lfm1.0 es de tipo "other"; deben revisarse los terminos del archivo LICENSE antes de cualquier uso comercial.
- El modelo genera cadenas de pensamiento explicitas, lo que incrementa el consumo de tokens en produccion y requiere gestionar el formato de la plantilla de chat.
- Aunque soporta diez idiomas, el rendimiento relativo por idioma no se detalla en la informacion disponible; conviene validar la calidad en espanol antes de desplegarlo.
- El formato por defecto de las llamadas a herramientas es Pythonico, no JSON; si el sistema consumidor espera JSON, hay que forzarlo mediante el system prompt.
- No se han publicado cifras de benchmarks ni de sesgos en la informacion disponible, por lo que la evaluacion de sesgos queda pendiente de validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-Base
- GGUF: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF
- ONNX: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-ONNX
- MLX 8-bit: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-MLX-8bit
- Drafter DSpark: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-DSpark
- Blog del modelo: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Playground: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Documentacion de plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Documentacion de tool use: https://docs.liquid.ai/lfm/key-concepts/tool-use
- Evaluacion AA-Omniscience: https://artificialanalysis.ai/evaluations/omniscience
- Paper referenciado: arxiv:2511.23404
- Paper referenciado: arxiv:2607.15232
