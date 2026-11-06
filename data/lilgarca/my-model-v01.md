# Lilgarca/my-model-v01

## Resumen

Cyrah es un ajuste fino mediante LoRA del modelo base LiquidAI/LFM2.5-230M, un transformer de 229.693.184 parametros (aproximadamente 230 millones) desarrollado originalmente por LiquidAI. El fine-tune lo ha realizado Juan Ignacio Robledo (usuario Lilgarca en Hugging Face) de forma autonoma y continua sobre datasets reales extraidos de Hugging Face, abarcando conversacion, razonamiento, matematicas, tool calling y conocimiento general, complementados con un corpus sintetico orientado a dotar al modelo de una identidad propia.

El modelo se presenta bajo el nombre "Cyrah" y esta disenado para tareas de generacion de texto conversacional en espanol e ingles, con soporte explicito de razonamiento mediante etiquetas ` thinking` y de invocacion de herramientas mediante marcadores especiales `<|tool_call_start|>` y `<|tool_call_end|>`. Su reducido tamano lo hace apto para despliegue en hardware modesto, aunque su naturaleza de fine-tune sobre una base pequena limita sus capacidades frente a modelos de mayor escala.

La relevancia de esta ficha radica en documentar un caso de fine-tune comunitario de un modelo LFM2 de LiquidAI, con un ciclo de entrenamiento declarado de 18 iteraciones y 87.576 ejemplos procesados. No obstante, la informacion publicada es escasa: no se detallan hiperparametros, composicion exacta del dataset, resultados de evaluacion ni terminos de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM2, segun tags del modelo base LiquidAI/LFM2.5-230M) |
| Parametros totales | 229.693.184 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones disponibles en la carpeta `gguf/` del repo); safetensors en precision original |
| Idiomas soportados | Espanol (es), ingles (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo se basa en LiquidAI/LFM2.5-230M, un transformer de aproximadamente 230 millones de parametros perteneciente a la familia LFM2 de LiquidAI. Sobre esta base se aplico un ajuste fino con LoRA (Low-Rank Adaptation), tecnica que congela los pesos originales e introduce matrices de baja dimension entrenables, reduciendo drasticamente el coste computacional y de memoria del entrenamiento. El resultado se distribuye tanto en safetensors como en cuantizaciones GGUF dentro de la carpeta `gguf/` del repositorio.

Segun la model card, el entrenamiento se realizo "de forma autonoma y continua" sobre datasets reales de Hugging Face que cubren chat, razonamiento, matematicas, tool calling y conocimiento, mas un corpus sintetico de identidad. Se declara un ciclo de entrenamiento numero 18, con 87.576 ejemplos del dataset y una ultima actualizacion el 2026-11-06. No se especifican el numero total de tokens de entrenamiento, la composicion exacta de los datasets, la configuracion de LoRA (rango, alpha, modulos objetivo), la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si el modelo base incorpora innovaciones como atencion lineal o decodificacion especulativa, mas alla de la referencia generica a la familia LFM2.

## Capacidades

- Generacion de texto conversacional multi-turno en espanol e ingles.
- Razonamiento explicito mediante bloques delimitados por ` thinking` y `</think>`.
- Tool calling o function calling mediante la sintaxis `<|tool_call_start|>[fn(arg='valor')]<|tool_call_end|>`.
- Resolucion de tareas matematicas y de conocimiento general, segun los datasets declarados en el entrenamiento.
- Identidad propia: el modelo responde que se llama Cyrah y que su creador es Juan Ignacio Robledo.
- Compatibilidad con el ecosistema `transformers` y con `apply_chat_template` para la construccion de prompts.
- Soporte de despliegue mediante GGUF (potencialmente con llama.cpp u Ollama, aunque no se confirma explicitamente en la model card).
- No se declaran capacidades de vision, audio ni modos de pensamiento extendido mas alla del bloque ` thinking`.

## Casos de uso

- Asistente conversacional ligero en espanol: el modelo puede gestionar dialogos multi-turno basicos en aplicaciones de chat embebidas, gracias a su reducido tamano que permite ejecucion en CPU o GPU de gama baja.
- Prototipado rapido de agentes con tool calling: la sintaxis `<|tool_call_start|>` permite integrar el modelo en pipelines que requieran invocar funciones externas (APIs, calculadoras, bases de datos) sin necesidad de infraestructura pesada.
- Generacion de respuestas con traza de razonamiento: el bloque ` thinking` facilita la inspeccion del proceso de razonamiento en tareas de matematicas o logica sencilla, util para depuracion y evaluacion de agentes.
- Educacion y demostraciones: su tamano de 230M parametros lo hace adecuado para entornos docentes donde se ensena fine-tuning con LoRA y despliegue de modelos en hardware consumer.
- Filtrado y clasificacion de texto en espanol: puede emplearse como modelo base para tareas de etiquetado o resumen corto tras un ajuste adicional, aprovechando su soporte nativo del idioma.
- Pruebas de concepto de identidad de marca: el corpus sintetico de identidad permite experimentar con personajes o asistentes con nombre y creador definidos, util en demos de producto.
- Despliegue en dispositivos con recursos limitados: las cuantizaciones GGUF permiten ejecutar el modelo en portatiles o sistemas embebidos para tareas de generacion de texto de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (safetensors, probablemente fp16/bf16): aproximadamente 0,5 GB para los pesos, mas overhead de activaciones y cache KV; en la practica, menos de 2 GB.
- VRAM estimada con cuantizacion GGUF de 4 bits: aproximadamente 0,15-0,3 GB para los pesos, permitiendo ejecucion en CPU con llama.cpp.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien cabe en GPUs de gama baja e incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, y en CPU mediante GGUF.
- Opciones de despliegue: `transformers` (segun la model card), llama.cpp u Ollama mediante los archivos GGUF de la carpeta `gguf/`; no se confirma soporte de vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Cyrah (Lilgarca/my-model-v01) | 229,7 M | No disponible | No disponible | Hugging Face (safetensors + GGUF) | Fine-tune LoRA de LFM2.5-230M con identidad propia y tool calling |
| LiquidAI/LFM2.5-230M (base) | 230 M | No disponible | No disponible en esta ficha | Hugging Face | Modelo base original de LiquidAI |
| Qwen2.5-0.5B | 494 M | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun documentacion publica) | Hugging Face | Alternativa de mayor tamano con licencia permisiva |
| SmolLM2-360M | 362 M | 8.192 tokens (segun documentacion publica) | Apache 2.0 (segun documentacion publica) | Hugging Face | Modelo pequeno orientado a eficiencia |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de resultados de benchmarks de Cyrah para comparar rendimiento real.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican terminos de uso comercial, lo que impide determinar si el modelo puede utilizarse en produccion sin riesgo legal.
- Riesgo elevado de alucinacion: al tratarse de un modelo de 230M parametros con un fine-tune LoRA sobre datasets no documentados, la fiabilidad factual es limitada.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de mitigacion de sesgos, por lo que pueden persistir sesgos de los datos de entrenamiento.
- Longitud de contexto no documentada: se desconoce la ventana maxima efectiva, lo que dificulta planificar casos de uso con documentos largos.
- Cobertura limitada a espanol e ingles: no se declaran otros idiomas.
- Fine-tune comunitario sin evaluacion publica: no hay benchmarks, lo que impide validar las capacidades declaradas (razonamiento, matematicas, tool calling) frente a alternativas.
- Entrenamiento "autonomo y continuo" con ciclo 18: la naturaleza iterativa del proceso y la falta de detalles sobre los datasets reales empleados impiden reproducir o auditar el entrenamiento.
- El corpus sintetico de identidad puede introducir respuestas rígidas o inconsistentes cuando se le pregunta por su nombre o creador en contextos no previstos.
- Repositorio con 0 descargas y creado recientemente: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lilgarca/my-model-v01
- Modelo base LiquidAI/LFM2.5-230M: https://huggingface.co/LiquidAI/LFM2.5-230M
