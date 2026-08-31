# baya1116/hypernet-sp-distill

## Resumen

HyperNet-SP es un proyecto de investigacion no oficial que explora la compresion de contexto de memoria acotada para cadenas de razonamiento largas (chain-of-thought). Desarrollado por baya1116, parte del modelo base DeepSeek-R1-Distill-Qwen-1.5B y anade un pooler externo (AttnPoolSP) de aproximadamente 75 millones de parametros que comprime todo el contexto distante en 32 vectores soft-prompt. De esta forma, el modelo solo atiende a una ventana reciente de tokens sin procesar mas los vectores comprimidos, logrando un footprint de KV cache independiente de la longitud total de la conversacion.

El modelo se entrena en dos fases: primero con QLoRA (r=64) y luego con fine-tuning completo (FFT), usando corpus de chain-of-thought de DeepSeek-R1 como fuente de destilacion. El resultado es un sistema que mantiene coherencia en razonamientos largos de un solo turno y puede arrastrar estado entre turnos, aunque la compresion es lossy para hechos verbatim (nombres propios, numeros exactos). Incluye una demo local rapida para Apple Silicon con MLX 4-bit, alcanzando aproximadamente 36 tokens por segundo en un MacBook de 8 GB.

La relevancia actual radica en abordar el problema del crecimiento lineal de la memoria KV en modelos de razonamiento largo, proponiendo una alternativa de memoria acotada que podria inspirar futuras arquitecturas eficientes. Sin embargo, es un trabajo de portafolio sin validacion formal ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DeepSeek-R1-Distill-Qwen-1.5B) + pooler AttnPoolSP de 3 capas de cross-attention |
| Parametros totales | 1.5B (modelo base) + ~75M (pooler) ≈ 1.575B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana reciente configurable, p. ej. 1000 tokens; contexto distante comprimido en 32 vectores soft-prompt) |
| Tipos de cuantizacion | MLX 4-bit (q-bits 4, q-group-size 64), safetensors (fp16/fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors, MLX, PyTorch (.pt) |

## Arquitectura y entrenamiento

El sistema combina un LLM base (DeepSeek-R1-Distill-Qwen-1.5B) con un pooler externo llamado AttnPoolSP. Este pooler, de unas 75M de parametros, usa 32 vectores de consulta aprendidos que realizan cross-attention sobre los tokens del contexto distante (todo lo anterior a la ventana reciente). El resultado son 32 vectores soft-prompt que se anteponen al prompt actual. El LLM solo atiende a `query + 32 SP + rw tokens recientes + chunk actual`, por lo que el coste de memoria KV es O(1) respecto a la longitud total.

Para gestionar el buffer de contexto distante, se aplica una politica de evacuacion basada en masa: cuando el buffer supera un maximo `maxD`, se eliminan los tokens con menor masa de cross-attention del pooler, manteniendo asi la memoria acotada y consistente con el despliegue.

El entrenamiento es conjunto (co-training): primero se adapta el LLM con QLoRA (r=64) para que pueda leer los vectores soft-prompt, y luego se realiza un fine-tuning completo (FFT). El objetivo es cross-entropy estandar sobre corpus de chain-of-thought de DeepSeek-R1, sin necesidad de un teacher separado. El pooler se inicializa con un checkpoint previo (`ap32_large.pt`) y se entrena junto con el LLM.

## Capacidades

- Razonamiento paso a paso (chain-of-thought) con memoria acotada: mantiene coherencia en cadenas de razonamiento largas de un solo turno.
- Razonamiento multi-turno: puede arrastrar estado entre turnos gracias a los vectores soft-prompt, aunque con perdida de detalles verbatim.
- Matematicas y probabilidad: resuelve problemas como `C(3,2)/C(5,2)=3/10` y responde correctamente a preguntas de seguimiento (p. ej. "mas o menos del 50%?").
- Explicaciones conceptuales: puede explicar estructuras de datos (p. ej. hash map) y responder preguntas de seguimiento sobre complejidad.
- Generacion de codigo pequeno: adecuado para fragmentos de codigo simples.
- Compresion de contexto: capacidad unica de comprimir historial largo en 32 vectores, reduciendo el coste de memoria KV.
- No soporta tool calling, vision ni audio.

## Casos de uso

- Investigacion en compresion de contexto: el modelo sirve como banco de pruebas para tecnicas de soft-prompt compression y evacuacion por masa de atencion, permitiendo estudiar el equilibrio entre retencion de informacion y coste de memoria.
- Prototipado en Apple Silicon: gracias a la implementacion MLX 4-bit, se puede ejecutar en MacBooks de 8 GB a ~36 tok/s, ideal para demos locales y experimentos rapidos sin GPU dedicada.
- Asistentes de razonamiento con memoria acotada: en entornos donde el historial de conversacion es largo pero los recursos de memoria son limitados, el modelo puede mantener coherencia multi-turno sin crecer linealmente en KV cache.
- Educacion y divulgacion: como ejemplo de arquitectura hibrida (LLM + pooler) para estudiantes e investigadores interesados en eficiencia de atencion y destilacion de conocimiento.
- Evaluacion de tecnicas de fine-tuning: el repositorio incluye checkpoints intermedios (QLoRA y FFT) que permiten comparar el efecto de cada fase de entrenamiento sobre la capacidad de leer soft-prompts.
- Generacion de explicaciones con razonamiento visible: al forzar el inicio con ` thinking\n`, el modelo produce cadenas de razonamiento explicitas, util para depurar o auditar el proceso de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona ejemplos cualitativos (resolucion de problemas de combinatoria y seguimiento multi-turno), pero no proporciona tablas con metricas estandar como MMLU, HumanEval o GSM8K. Tampoco se comparan numeros con otros modelos. El unico dato de rendimiento es la velocidad de inferencia: ~36 tok/s en un MacBook de 8 GB con MLX 4-bit.

## Requisitos de hardware

- VRAM estimada: el modelo base de 1.5B en 4-bit ocupa aproximadamente 1 GB; el pooler en fp32 ocupa unos 303 MB. En total, cabe en GPUs con 2-4 GB de VRAM, aunque la implementacion oficial esta orientada a Apple Silicon.
- GPU recomendadas: Apple Silicon (M1/M2/M3) con 8 GB de RAM unificada; tambien puede ejecutarse en GPUs CUDA con bitsandbytes 4-bit, aunque no se proporcionan instrucciones detalladas.
- Compatibilidad con GPU de consumo: si, cabe en RTX 3060, RTX 4060, etc., siempre que se use cuantizacion 4-bit.
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp (si se convierte a GGUF, aunque no se proporciona), vLLM o TGI (requieren conversion a formatos estandar, no incluidos).
- Latencia y throughput: ~36 tok/s en MacBook de 8 GB (MLX 4-bit); en GPU CUDA se espera mayor velocidad, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HyperNet-SP (este) | 1.5B + 75M pooler | Acotado (ventana reciente + 32 SP) | MIT | Compresion de contexto, MLX, razonamiento |
| DeepSeek-R1-Distill-Qwen-1.5B (base) | 1.5B | 32K (original) | MIT | Sin compresion, atencion completa |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Apache 2.0 | Chat general, sin compresion |

La comparativa se limita a caracteristicas arquitectonicas y de licencia, ya que no hay datos de rendimiento publicados para HyperNet-SP. El modelo base original tiene una ventana de contexto de 32K tokens, mientras que HyperNet-SP la reemplaza por una ventana reciente configurable mas 32 vectores comprimidos, sacrificando fidelidad verbatim a cambio de memoria acotada.

## Limitaciones y advertencias

- Compresion lossy: los hechos verbatim (nombres propios, numeros exactos en ejecucion) se pierden al comprimir el contexto distante; deben permanecer en la ventana reciente para ser recordados con precision.
- Fidelidad limitada: existe un suelo de fidelidad medible frente a atencion completa; el modelo no iguala al base sin compresion en tareas que requieren recuperacion exacta de informacion antigua.
- No es un modelo de chat listo para produccion: requiere una receta especifica de inferencia (temperatura 0.6, sin system prompt, forzar inicio con ` thinking\n`, limite de salida de 2000 tokens, guard contra degeneracion) para evitar respuestas vacias o bucles.
- Dependencia de la ventana reciente: el parametro `rw` (tamano de ventana reciente) es critico; valores pequenos degradan el seguimiento multi-turno, valores grandes aumentan el coste de memoria.
- Sin benchmarks formales: no hay evaluaciones estandar publicadas, por lo que el rendimiento real en tareas generales es desconocido.
- Idioma: solo entrenado y evaluado en ingles; no soporta otros idiomas.
- Proyecto de investigacion no oficial: no cuenta con soporte, mantenimiento ni garantias de estabilidad; el codigo puede contener errores o estar incompleto.
- Restricciones de uso: la licencia MIT permite uso comercial, pero el modelo base DeepSeek-R1-Distill-Qwen-1.5B tambien es MIT, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baya1116/hypernet-sp-distill
- Perfil del autor: https://huggingface.co/baya1116
- Espejo del modelo: https://d6108366.hf-mirror.com/baya1116/hypernet-sp-distill
- Repositorio relacionado (fase FFT): https://huggingface.co/baya1116/Phase15-DeepSeek-FFT
- Repositorio relacionado (deep-charger): https://huggingface.co/baya1116/deep-charger
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
