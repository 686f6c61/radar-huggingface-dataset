# FastFlowLM/LFM2.5-1.2B-Thinking-NPU2

## Resumen
LFM2.5-1.2B-Thinking-NPU2 es una distribucion del modelo de razonamiento LFM2.5-1.2B-Thinking de Liquid AI, publicada por FastFlowLM y orientada especificamente a la inferencia en NPU. El modelo original forma parte de la familia LFM2.5, disenada para despliegue on-device, y combina una arquitectura hibrida de convoluciones LIV y atencion GQA con un presupuesto de entrenamiento de 28 billones (28T) de tokens, ampliando los 10T de la generacion anterior. Con 1,17B parametros y una ventana de contexto de 32.768 tokens, busca ofrecer razonamiento de calidad en dispositivos con recursos limitados.

La relevancia de esta variante radica en su enfoque de despliegue: el modelo base declara 239 tok/s de decodificacion en CPU AMD y 82 tok/s en NPU movil, funcionando con menos de 1 GB de memoria en formatos cuantizados. FastFlowLM mantiene el checkpoint en formato nativo para Transformers, con soporte declarado para llama.cpp, MLX y vLLM en el modelo original. La licencia es lfm1.0 (marcada como "other" en el repositorio), lo que exige revisar los terminos antes de un uso comercial.

Esta ficha describe la variante NPU2 publicada por FastFlowLM, que hereda las capacidades del modelo Thinking de Liquid AI. No se dispone de informacion especifica sobre las modificaciones tecnicas introducidas por FastFlowLM respecto al checkpoint original, por lo que los datos tecnicos proceden de la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 16 capas (10 bloques de convolucion LIV con doble compuerta + 6 bloques GQA) |
| Parametros totales | 1,17B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF, ONNX, MLX 8-bit (variantes oficiales del modelo base); cuantizaciones adicionales de la variante NPU2 no disponibles |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol |
| Licencia | lfm1.0 (etiquetada como "other" en el repositorio) |
| Formato de pesos | safetensors (formato nativo para Transformers); variantes GGUF, ONNX y MLX en repositorios separados |
| Vocabulario | 65.536 tokens |
| Parametros de generacion recomendados | temperature 0.1, top_k 50, top_p 0.1, repetition_penalty 1.05 |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura hibrida de 16 capas que alterna 10 bloques de convolucion LIV (Linear Input-Varying) con doble compuerta y 6 bloques de atencion con query agrupada (GQA). Esta combinacion reduce el coste computacional frente a un transformer puro de atencion completa, lo que explica su idoneidad para CPU y NPU. El entrenamiento se escalo de 10T a 28T tokens respecto a la generacion anterior y se complemento con un proceso de aprendizaje por refuerzo multi-etapa a gran escala, orientado a mejorar las capacidades de razonamiento. El vocabulario es de 65.536 tokens y la plantilla de chat sigue un formato similar a ChatML.

La variante publicada por FastFlowLM no documenta cambios en el entrenamiento ni en la arquitectura respecto al checkpoint original de Liquid AI. La model card del modelo base no detalla la composicion exacta del dataset ni el algoritmo de RL empleado. El modelo soporta function calling mediante tokens especiales (`<|tool_call_start|>` y `<|tool_call_end|>`) y genera llamadas en formato Python por defecto, con opcion de forzar JSON desde el system prompt.

## Capacidades
- Generacion de texto y razonamiento multi-paso en modo "thinking", orientado a tareas de agente.
- Soporte de tool calling / function calling con definicion de herramientas en JSON y ejecucion por rol "tool".
- Capacidades multilingues en ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.
- Extraccion de datos estructurados y soporte para pipelines de RAG, segun recomendacion del autor.
- Conversacion multi-turno con contexto de hasta 32.768 tokens.
- Inferencia eficiente en CPU, NPU y Apple Silicon mediante formatos GGUF, ONNX y MLX.
- No incluye vision ni audio (existen variantes separadas VL y Audio en la familia).

## Casos de uso
- Agentes locales en dispositivos: el modelo puede ejecutar bucles de razonamiento con tool calling en un portatil o movil, gracias a su huella de memoria inferior a 1 GB en cuantizacion y a su contexto de 32.768 tokens.
- Extraccion de datos estructurados: con temperature 0.1 y salida controlada, es adecuado para convertir documentos en JSON o tablas dentro de pipelines ETL en el borde.
- RAG en local: su contexto largo y su soporte multilingue permiten responder preguntas sobre corpus privados sin enviar datos a la nube.
- Asistentes de atencion al cliente en dispositivos: conversaciones multi-turno con contexto suficiente para historiales extensos, con latencia baja en NPU movil (82 tok/s declarados).
- Automatizacion de flujos con herramientas: integracion con APIs mediante function calling para consultar estados, bases de datos o servicios internos desde un agente ligero.
- Procesamiento de texto multilingue en el borde: traduccion asistida, resumen o clasificacion en ingles, espanol, aleman, frances, japones, coreano, chino y arabe sin depender de servidores.
- Prototipado rapido en Apple Silicon: la variante MLX 8-bit permite experimentar con razonamiento en Mac sin GPU dedicada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento proporcionados son de velocidad de inferencia del modelo base: 239 tok/s de decodificacion en CPU AMD y 82 tok/s en NPU movil, con menos de 1 GB de memoria en formatos cuantizados.

## Requisitos de hardware
- VRAM estimada: inferior a 1 GB en cuantizacion (dato declarado por el autor para el modelo base); en precision completa, aproximadamente 2,4 GB para pesos en fp16, mas memoria para el contexto.
- GPU recomendadas: no se especifican GPU dedicadas; el modelo esta optimizado para CPU, NPU movil y Apple Silicon.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM en fp16, y en GPUs integradas con cuantizacion.
- Opciones de despliegue: Transformers, vLLM, llama.cpp, MLX (Apple Silicon), ONNX Runtime y la propia pila de FastFlowLM para NPU.
- Latencia y throughput: 239 tok/s en CPU AMD y 82 tok/s en NPU movil (modelo base, segun el autor); no hay datos especificos de la variante NPU2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking-NPU2 | 1,17B | 32.768 | lfm1.0 | Razonamiento on-device, NPU |
| LFM2.5-1.2B-Instruct | 1,2B | 32.768 | lfm1.0 | Instrucciones generales on-device |
| LFM2.5-1.2B-JP | 1,2B | 32.768 | lfm1.0 | Chat optimizado para japones |
| LFM2.5-VL-1.6B | 1,6B | no disponible | lfm1.0 | Vision-lenguaje on-device |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con modelos de otros fabricantes de tamano similar; no disponible.

## Limitaciones y advertencias
- El autor no recomienda su uso para tareas intensivas en conocimiento ni para programacion.
- Riesgo de alucinacion inherente a modelos de 1,2B; requiere validacion en produccion.
- La licencia lfm1.0 esta marcada como "other": es imprescindible revisar los terminos antes de uso comercial.
- No se documentan sesgos especificos, pero el entrenamiento multilingue puede presentar un rendimiento desigual entre los ocho idiomas declarados.
- La variante NPU2 de FastFlowLM no documenta cambios tecnicos ni benchmarks propios; se desconoce su equivalencia exacta con el checkpoint original.
- El contexto maximo es de 32.768 tokens; superarlo degrada la calidad.
- No incluye capacidades de vision ni audio; para ello existen variantes separadas.

## Enlaces
- Hugging Face: https://huggingface.co/FastFlowLM/LFM2.5-1.2B-Thinking-NPU2
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Modelo Thinking original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Variante GGUF: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-GGUF
- Variante ONNX: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-ONNX
- Variante MLX: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-MLX-8bit
- Blog de LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Documentacion: https://docs.liquid.ai/lfm
- Playground: https://playground.liquid.ai/
- LEAP: https://leap.liquid.ai/
- Paper (arXiv): https://arxiv.org/abs/2511.23404
