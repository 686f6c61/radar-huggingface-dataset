# cbert33/LFM3-1.7B-UtilityModel-edited-weights-EXL3-5.0bpw

## Resumen

LFM3-1.7B-UtilityModel-edited-weights-EXL3-5.0bpw es una cuantización EXL3 de 5.0 bits por peso (bpw) del modelo comunitario cbert33/LFM3-1.7B-UtilityModel-edited-weights, a su vez derivado de LiquidAI/LFM3-1.7B. No se trata de un modelo entrenado desde cero ni de un fine-tuning: el autor original aplicó dos ediciones estáticas en la cabeza de salida (lm_head) a partir de estados ocultos capturados, con el objetivo de especializar el modelo en llamadas a herramientas en formato JSON y reducir el bucle de narración previo a la llamada. Esta versión concreta solo cambia el formato y la precisión de los pesos, no el comportamiento aprendido.

La cuantización la firma cbert33 mediante ExLlamaV3 Streamer, un fork propio de ExLlamaV3. El resultado es un checkpoint mixto: 142 matrices del decodificador cuantizadas con un presupuesto medio de 5.0 bpw (4.9992846924 bpw exactos), cabeza de salida a 6 bits, embeddings en BF16 y once lineales de compuerta en FP16 sin cuantizar. El archivo pesa 1.640.806.196 bytes (unos 1,64 GB).

Es relevante para quienes despliegan modelos pequeños de agentes en local con ExLlamaV3 y necesitan un formato de pesos ya preparado para ese runtime. Conviene subrayar que no es un checkpoint compatible con Hugging Face Transformers de forma directa y que el número de parámetros reales en safetensors (820.364.032) no coincide con la etiqueta "1.7B" del nombre, que proviene del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (LFM3); detalles no disponibles |
| Parametros totales | 820.364.032 (safetensors); la etiqueta del nombre indica 1.7B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 mixta: media 5.0 bpw en decodificador (matrices individuales de 3 a 7 bits), cabeza de salida 6 bits, embeddings BF16, 11 lineales de compuerta en FP16 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (EXL3), libreria exllamav3 |

## Arquitectura y entrenamiento

El modelo subyacente es LiquidAI/LFM3-1.7B, un transformer decoder de la familia LFM3 de Liquid AI. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La versión "edited-weights" no implica entrenamiento: según la model card, se aplicaron dos ediciones estáticas en las filas de lm_head derivadas de estados ocultos capturados, sin LoRA ni fine-tuning.

La innovación técnica de esta ficha es puramente de compresión. La cuantización EXL3 se calibró con 250 secuencias de 2048 tokens y códec mul1, distribuyendo el presupuesto de bits de forma no uniforme entre matrices (3 a 7 bits) para mantener una media de 5.0 bpw. La divergencia KL media reportada es de 0.0141 nats, medida sobre 12 prompts fijos en el primer token de continuación comparando con el padre en el mismo runtime con lineales en FP16; el autor advierte que no es una métrica de calidad de generación completa.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, heredadas del modelo base LFM3-1.7B.
- Llamadas a herramientas en formato JSON, objetivo declarado de la edición de pesos del modelo padre.
- Reducción del bucle de narración antes de emitir la llamada a herramienta, según la model card del padre.
- Convenciones de "thinking": el modelo usa una plantilla de chat con fases de razonamiento que deben completarse antes de juzgar la respuesta final.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de agentes multi-paso, function calling genérico, visión o audio: no disponible.

## Casos de uso

- Agentes de herramientas en local: el modelo está especializado en emitir llamadas JSON, por lo que encaja en orquestadores que esperan una estructura de tool call limpia antes de ejecutar la función.
- Automatización de tareas de utilidad con presupuesto de VRAM reducido: al ocupar 1,64 GB en disco y estar cuantizado a 5.0 bpw, puede ejecutarse en GPUs consumer modestas mediante ExLlamaV3.
- Prototipado de pipelines de agentes con ExLlamaV3: útil si el stack ya usa ese runtime y se necesita un checkpoint ya cuantizado para iterar rápido.
- Router de intenciones y extracción estructurada: la edición de lm_head favorece salidas en JSON, adecuado para clasificar peticiones o extraer campos antes de derivar a otro modelo mayor.
- Evaluación comparativa de cuantización: sirve para medir el impacto de EXL3 5.0 bpw frente al padre sin cuantizar en tareas de formato y tool calling.
- Despliegue en entornos con poca memoria: al mantener embeddings en BF16 y compuertas en FP16, el consumo es mayor que el de una cuantización uniforme de 4 bits, pero menor que el del modelo completo en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de calidad son los del autor:

| Metrica | Valor | Condiciones |
|---|---|---|
| Divergencia KL media | 0.0141 nats | 12 prompts fijos, primer token de continuación, padre en FP16 |
| Diagnóstico de 18 prompts | 17 respuestas claramente válidas; 1 con explicación lógica defectuosa | Diagnóstico separado del autor |
| Cumplimiento de formato solicitado | 16 de 18 casos | Mismo diagnóstico |

El propio autor advierte que estas pruebas limitadas no establecen rendimiento amplio en benchmarks ni fiabilidad general de razonamiento y formato.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el archivo pesa 1,64 GB, pero el autor aclara que el tamaño de archivo no es el requisito de memoria en runtime.
- GPU recomendadas: no disponibles; cualquier GPU compatible con ExLlamaV3 y suficiente VRAM para el modelo y el contexto.
- GPU consumer: previsiblemente viable en tarjetas con varios GB de VRAM, aunque no hay cifras confirmadas.
- Opciones de despliegue: exclusivamente ExLlamaV3 con soporte LFM3 y EXL3 (incluido el fork ExLlamaV3 Streamer del autor). No es compatible directamente con Transformers, vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Este modelo (EXL3 5.0bpw) | 820.364.032 en safetensors | no disponible | EXL3 mixta 5.0 bpw | lfm1.0 | ExLlamaV3 |
| cbert33/LFM3-1.7B-UtilityModel-edited-weights (padre) | no disponible | no disponible | sin cuantizar | lfm1.0 | no disponible |
| LiquidAI/LFM3-1.7B (base) | no disponible | no disponible | sin cuantizar | lfm1.0 | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la divergencia KL frente al padre.

## Limitaciones y advertencias

- No es un checkpoint drop-in para Hugging Face Transformers: requiere un runtime ExLlamaV3 con soporte LFM3 y EXL3.
- La cuantización es mixta y no uniforme: el rótulo "5.0 bpw" es un presupuesto medio del decodificador, con matrices de 3 a 7 bits; el rendimiento puede variar por capa.
- Las métricas de calidad del autor son muy limitadas (12 y 18 prompts) y no garantizan comportamiento en producción.
- La edición de pesos del padre no incluye entrenamiento; la especialización en tool calling JSON puede degradar otras capacidades respecto al LFM3-1.7B original.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia lfm1.0: conviene revisar el archivo LICENSE del repositorio antes de uso comercial, ya que la licencia se etiqueta como "other" en Hugging Face.
- El modelo usa convenciones de "thinking": evaluar respuestas sin dejar terminar esa fase puede llevar a conclusiones erróneas sobre su calidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/cbert33/LFM3-1.7B-UtilityModel-edited-weights-EXL3-5.0bpw
- Modelo padre: https://huggingface.co/cbert33/LFM3-1.7B-UtilityModel-edited-weights
- Modelo base original: LiquidAI/LFM3-1.7B (referenciado en la model card; sin URL explícita)
- Fork de cuantización: https://github.com/cbertucci33/ExLlamaV3-Streamer
- Licencia: archivo LICENSE del repositorio (lfm1.0)
