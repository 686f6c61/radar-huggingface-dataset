# Huehbg/LFM2.5-1.2B-Instruct

## Resumen

LFM2.5-1.2B-Instruct es un modelo de lenguaje de 1.170 millones de parametros desarrollado por Liquid AI, disenado especificamente para despliegue en dispositivos (on-device) y entornos de borde. Forma parte de la familia LFM2.5, que amplia la arquitectura hibrida LFM2 original con un preentrenamiento extendido de 10T a 28T tokens y un proceso de aprendizaje por refuerzo multietapa a gran escala. El checkpoint publicado bajo el identificador Huehbg/LFM2.5-1.2B-Instruct es un fine-tune del modelo base LiquidAI/LFM2.5-1.2B-Base.

La relevancia de este modelo radica en su relacion rendimiento/tamano: con solo 1,17B de parametros ofrece decodificacion a 239 tok/s en CPU AMD y 82 tok/s en NPU movil, funcionando con menos de 1 GB de memoria. Incorpora soporte nativo para tool calling, plantilla de chat tipo ChatML y una ventana de contexto de 32.768 tokens, lo que lo situa como una opcion practica para agentes ligeros, extraccion de datos y RAG en entornos con recursos limitados.

Liquid AI posiciona este modelo explicitamente para tareas agenticas, extraccion de datos y generacion aumentada por recuperacion, desaconsejando su uso en tareas intensivas en conocimiento y programacion. Su licencia es lfm1.0 (licencia propia, no estandar de codigo abierto), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 10 bloques de convolucion double-gated + 6 bloques GQA (16 capas) |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF (llama.cpp), ONNX, MLX 8-bit; cuantizaciones adicionales no disponibles |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol |
| Licencia | lfm1.0 (licencia propia, categoria "other") |
| Formato de pesos | safetensors (formato nativo Transformers); variantes GGUF, ONNX y MLX |

## Arquitectura y entrenamiento

LFM2.5-1.2B-Instruct emplea una arquitectura hibrida de 16 capas que combina 10 bloques de convolucion double-gated con 6 bloques de atencion con query agrupada (GQA). Esta mezcla de convolucion y atencion reduce el coste computacional frente a un transformer puro, lo que explica su velocidad de decodificacion en hardware de borde. El vocabulario es de 65.536 tokens y el corte de conocimiento se situa a mediados de 2024.

El entrenamiento se realizo sobre 28 billones (28T) de tokens, un incremento sustancial respecto a los 10T de la generacion anterior, seguido de un proceso de aprendizaje por refuerzo multietapa a gran escala. La model card no detalla la composicion exacta del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO mas alla de mencionar el RL. El modelo incluye un drafter de decodificacion especulativa separado (LFM2.5-1.2B-Instruct-DSpark, 296M de parametros) que permite aproximadamente 2,1x de aceleracion en decodificacion con salidas identicas.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 32.768 tokens.
- Razonamiento general y tareas de extraccion de datos estructurados.
- Tool calling / function calling nativo: el modelo emite llamadas en formato Python entre los tokens especiales `<|tool_call_start|>` y `<|tool_call_end|>`, con opcion de forzar salida JSON mediante el system prompt.
- Soporte de flujos agenticos y razonamiento multi-paso, con interpretacion de resultados de herramientas y respuesta final en texto plano.
- Capacidades multilingues en ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.
- Plantilla de chat tipo ChatML compatible con `tokenizer.apply_chat_template()`.
- No incluye vision, audio ni modo thinking en esta variante (existen modelos separados LFM2.5-VL-1.6B, LFM2.5-Audio-1.5B y LFM2.5-1.2B-Thinking).

## Casos de uso

- Agentes ligeros en dispositivo: el modelo puede gestionar bucles de tool calling con contexto de 32.768 tokens y ejecutarse en menos de 1 GB de memoria, lo que permite desplegar asistentes agenticos directamente en moviles o equipos de borde sin conexion a la nube.
- Extraccion de datos estructurados: adecuado para convertir texto no estructurado en JSON o registros tabulares mediante function calling, con la ventaja de que puede ejecutarse localmente y preservar la privacidad de los datos.
- RAG en entornos con recursos limitados: con 32.768 tokens de contexto puede ingerir varios fragmentos recuperados y sintetizar respuestas, ejecutandose en CPU AMD a 239 tok/s de decodificacion.
- Atencion al cliente automatizada en el borde: conversaciones multi-turno con latencia baja (82 tok/s en NPU movil) y soporte para ocho idiomas, incluido el espanol.
- Asistentes de escritorio y aplicaciones Mac: la variante MLX 8-bit permite inferencia rapida en Apple Silicon mediante el framework MLX.
- Preprocesamiento en pipelines de CI/CD o backend: la variante ONNX Runtime permite despliegue acelerado por hardware en cloud, borde y movil, integrable como paso de clasificacion o extraccion previo a modelos mayores.
- Fine-tuning especializado: al ser un checkpoint nativo en safetensors, sirve como base para ajuste fino en dominios concretos con requisitos de VRAM modestos.

## Benchmarks y rendimiento

La model card no incluye resultados numericos de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son de inferencia:

| Metrica | Valor |
|---|---|
| Decodificacion en CPU AMD | 239 tok/s |
| Decodificacion en NPU movil | 82 tok/s |
| Memoria de ejecucion | menos de 1 GB |
| Aceleracion con drafter DSpark | ~2,1x con salidas identicas |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en cuantizacion de 8 bits; el repo completo en safetensors ocupa 2,3 GB (aproximadamente 2,3 GB en FP16/BF16).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) es sobrada; el modelo esta pensado para CPU y NPU, por lo que A100 o H100 no son necesarias.
- Cabe en cualquier GPU consumer actual e incluso en hardware sin GPU dedicada (CPU AMD, NPU movil, Apple Silicon).
- Opciones de despliegue: llama.cpp y herramientas compatibles (GGUF), vLLM, Transformers, ONNX Runtime (cloud, borde, movil), MLX en Apple Silicon y LEAP de Liquid AI.
- Latencia y throughput: 239 tok/s de decodificacion en CPU AMD y 82 tok/s en NPU movil; con el drafter DSpark se alcanza aproximadamente 2,1x de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LFM2.5-1.2B-Instruct | 1,17B | 32.768 | lfm1.0 | Hibrido convolucion/atencion, on-device |
| LFM2.5-1.2B-Thinking | 1,2B | no disponible | lfm1.0 | Razonamiento, misma familia |
| LFM2.5-VL-1.6B | 1,6B | no disponible | lfm1.0 | Vision-lenguaje, misma familia |
| LFM2.5-Audio-1.5B | 1,5B | no disponible | lfm1.0 | Audio-lenguaje, misma familia |

No se dispone en la informacion proporcionada de datos comparativos de rendimiento frente a modelos de otras familias con tamano similar.

## Limitaciones y advertencias

- El propio autor desaconseja su uso en tareas intensivas en conocimiento y en programacion, donde el modelo no rinde a nivel de modelos mayores.
- Riesgo de alucinacion inherente a un modelo de 1,17B; no debe usarse como fuente de verdad sin verificacion.
- Corte de conocimiento a mediados de 2024: no conoce eventos ni datos posteriores.
- Cobertura multilingue limitada a ocho idiomas; el rendimiento en espanol no esta cuantificado en la informacion disponible.
- Licencia lfm1.0 (categoria "other"): no es una licencia de codigo abierto estandar; es necesario revisar el archivo LICENSE para conocer las restricciones de uso comercial antes de desplegarlo en produccion.
- El checkpoint publicado por Huehbg es un fine-tune de terceros sobre el modelo base de Liquid AI; conviene validar su comportamiento frente al checkpoint oficial de LiquidAI antes de usarlo en produccion.
- Parametros de generacion recomendados: temperature 0.1, top_k 50, repetition_penalty 1.05; desviarse de ellos puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Huehbg/LFM2.5-1.2B-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Checkpoint oficial Instruct: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Variante GGUF: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- Variante ONNX: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-ONNX
- Variante MLX 8-bit: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-MLX-8bit
- Drafter de decodificacion especulativa: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-DSpark
- Variante Thinking: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Variante japonesa: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP
- Variante vision-lenguaje: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Variante audio-lenguaje: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- Blog de presentacion: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Tool use: https://docs.liquid.ai/lfm/key-concepts/tool-use
- Playground: https://playground.liquid.ai/
- LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Paper de referencia: arxiv:2511.23404
