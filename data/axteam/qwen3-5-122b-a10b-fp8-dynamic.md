# axteam/Qwen3.5-122B-A10B-FP8-dynamic

## Resumen

Qwen3.5-122B-A10B-FP8-dynamic es una cuantización en FP8 dinámico del modelo Qwen3.5-122B-A10B, realizada por axteam para servir de forma eficiente con vLLM. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un modelo multimodal (texto e imagen a texto) de arquitectura híbrida que combina atención lineal con atención completa, y de tipo mezcla de expertos (MoE) con 256 expertos más un experto compartido, activando unos 10B parámetros de los ~122B totales. Incorpora además una cabeza de predicción multi-token (MTP), lo que favorece una decodificación más rápida.

La relevancia de esta versión cuantizada radica en que reduce el tamaño en disco a unos 129,8 GB (frente a los más de 240 GB que ocuparían los pesos en BF16), manteniendo en BF16 los componentes más sensibles a la pérdida de precisión: la torre de visión, el proyector, el router MoE, las normalizaciones, los embeddings y la cabeza MTP. Esto permite desplegar el modelo en servidores con menos VRAM sin recurrir a una recalibración con datos, ya que el esquema FP8 dinámico no requiere calibración. Está publicado bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal + atencion completa), MoE (256 expertos + experto compartido), multimodal (vision), cabeza MTP |
| Parametros totales | 125.086.497.008 (~125B segun safetensors; ~122B segun denominacion) |
| Parametros activos | ~10B (MoE) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa --max-model-len 32768) |
| Tipos de cuantizacion | FP8 dinamico (W8A8: pesos FP8 E4M3 con escala por canal de salida, activaciones FP8 dinamicas por token); ~4% de parametros en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, esquema FP8_DYNAMIC) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es hibrida: combina capas de atencion lineal (con componentes no lineales conv1d, A_log y dt_bias tipicos de modelos tipo SSM/linear attention) con capas de atencion completa, lo que reduce el coste de memoria del KV cache en contextos largos. Sobre esa base se situa un bloque MoE con 256 expertos mas un experto compartido, activandose aproximadamente 10B parametros por token de los ~122B totales. El modelo es multimodal: incluye una torre de vision y un proyector que permiten procesamiento de imagen-texto (pipeline image-text-to-text). Incorpora ademas una cabeza de prediccion multi-token (MTP), utilizable para decodificacion especulativa y aceleracion de la generacion.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no hay informacion en los datos disponibles. En cuanto a esta version cuantizada, se trata de una cuantizacion post-entrenamiento (PTQ) sin reentrenamiento: los pesos se cuantizan a FP8 E4M3 con escala estatica por canal de salida (sin calibracion con datos), mientras que las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Se mantienen en BF16 la torre de vision y el proyector, la cabeza MTP, el router MoE y la puerta del experto compartido, todas las RMSNorm, los embeddings, la cabeza del modelo de lenguaje y las partes no lineales de la atencion lineal, aproximadamente el 4% de los parametros. Tokenizador, chat template y generation config son identicos a los del original.

## Capacidades

- Generacion de texto conversacional (pipeline conversational), con modo thinking activado por defecto en el chat template y desactivable mediante `chat_template_kwargs={"enable_thinking": False}`.
- Comprension multimodal de imagen y texto (pipeline image-text-to-text): acepta imagenes por URL o URI data: en los mensajes.
- Razonamiento multi-step gracias al modo thinking, que genera razonamiento explicito antes de la respuesta.
- Arquitectura MoE con activacion de ~10B parametros, que permite calidad de modelo grande con coste de inferencia de modelo mediano.
- Cabeza MTP para prediccion multi-token, que puede acelerar la decodificacion.
- Soporte de serving compatible con la API de OpenAI mediante vLLM.
- Soporte de tool calling / function calling: no disponible (no consta en la informacion proporcionada).
- Capacidades multilingues: no disponible (aunque el ejemplo de la model card incluye una consulta en coreano, no hay lista oficial de idiomas).

## Casos de uso

- Chatbot conversacional con razonamiento: el modo thinking activado por defecto permite construir asistentes que razonan paso a paso antes de responder, util para soporte tecnico o consultoria.
- Analisis y descripcion de imagenes: al incluir la torre de vision, puede integrarse en flujos que combinen capturas de pantalla, documentos escaneados o fotografias con instrucciones en lenguaje natural.
- Serving economico de modelo grande: la cuantizacion FP8 reduce el footprint de memoria, permitiendo servir un modelo de ~122B parametros con menos GPUs que la version BF16, ideal para APIs internas de empresa.
- Procesamiento por lotes offline: la API offline de vLLM (`LLM.chat`) permite clasificar, resumir o etiquetar grandes volumenes de texto e imagenes en batch.
- Generacion de codigo y tareas tecnicas: como derivado de la familia Qwen3.5, es adecuado para asistentes de codigo, aunque no hay benchmarks especificos en la informacion disponible.
- Despliegue con contexto moderado: el ejemplo de la model card usa 32768 tokens de contexto, suficiente para conversaciones largas multi-turno y documentos de tamano medio.
- Servicing solo-texto: la opcion `--limit-mm-per-prompt '{"image": 0, "video": 0}'` permite ahorrar la memoria del encoder de vision cuando no se necesita multimodalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se incluyen comparativas de calidad entre el modelo original y esta version cuantizada; la model card indica unicamente que se preservo en BF16 el ~4% de parametros mas sensibles para mantener la calidad.

## Requisitos de hardware

- VRAM estimada: el repo ocupa ~129,8 GB en FP8, por lo que se necesita al menos esa capacidad de VRAM para cargar los pesos completos, mas espacio para KV cache y activaciones. En la practica esto apunta a un nodo multi-GPU (por ejemplo 2-4 GPUs de 80 GB como A100/H100, o equivalentes).
- GPUs recomendadas: no disponible de forma explicita; el esquema FP8 dinamico de compressed-tensors/vLLM esta orientado a GPUs con soporte FP8 (H100, H200, y en general arquitecturas Hopper o posteriores). En GPUs sin soporte nativo FP8 el rendimiento se degradaria.
- Consumer GPU: no es viable; con ~130 GB de pesos no cabe en ninguna GPU de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni siquiera en configuraciones tipicas de 2-4 tarjetas de consumo.
- Despliegue: vLLM es el runtime indicado (`vllm serve axteam/Qwen3.5-122B-A10B-FP8-dynamic`), con servidor compatible con la API de OpenAI en el puerto 8000 o inferencia offline en Python. No hay soporte declarado para llama.cpp, Ollama o TGI (el formato compressed-tensors FP8 esta pensado para vLLM).
- Opciones de optimizacion en runtime: `--kv-cache-dtype fp8` reduce a la mitad aproximadamente la memoria del KV cache en contextos largos o batches grandes; `--limit-mm-per-prompt '{"image": 0, "video": 0}'` evita cargar el presupuesto de memoria del encoder de vision en serving solo-texto.
- Latencia y throughput: no disponibles. La cabeza MTP y los ~10B parametros activos sugieren buena latencia para su clase, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-FP8-dynamic (este) | ~125B | ~10B | No disponible (ejemplo: 32768) | FP8 dinamico (W8A8) | Apache-2.0 | HuggingFace, safetensors |
| Qwen/Qwen3.5-122B-A10B (base) | ~122B | ~10B | No disponible | BF16 (sin cuantizar) | Apache-2.0 | HuggingFace, safetensors |
| DeepSeek-V3 | 671B | 37B | 128K | BF16 / FP8 oficial | Licencia propia (uso comercial con condiciones) | HuggingFace |
| Qwen3-30B-A3B | 30B | 3B | No disponible | BF16 y derivados comunitarios | Apache-2.0 | HuggingFace, GGUF |

La alternativa directa es el modelo base Qwen/Qwen3.5-122B-A10B, que ofrece calidad maxima a costa de aproximadamente el doble de memoria. Frente a DeepSeek-V3, este modelo es mucho mas ligero en memoria y con licencia Apache-2.0 mas permisiva, aunque con menos parametros totales. Frente a Qwen3-30B-A3B, ofrece presumiblemente mayor calidad a cambio de requisitos de hardware muy superiores.

## Limitaciones y advertencias

- No hay benchmarks publicados ni evaluaciones de degradacion por la cuantizacion: conviene validar la calidad en el caso de uso concreto antes de pasar a produccion.
- La cuantizacion es data-free (sin calibracion); aunque FP8 dinamico suele conservar bien la calidad, tareas muy sensibles a la precision numerica pueden verse afectadas.
- La lista de idiomas soportados no esta disponible; el ejemplo en coreano de la model card sugiere soporte multilingue, pero debe verificarse.
- La longitud de contexto maxima del modelo base no consta en la documentacion disponible; el ejemplo usa 32768 tokens, que podria no ser el limite real.
- El formato compressed-tensors FP8 dinamico requiere vLLM (y hardware con soporte FP8); no es compatible con llama.cpp, Ollama ni la mayoria de runtimes de consumo.
- Requiere un nodo multi-GPU de gama alta (~130 GB de VRAM solo para los pesos), lo que lo excluye de despliegues locales o de pequena escala.
- Sesgos y riesgo de alucinacion: no hay documentacion especifica en la informacion disponible; como todo modelo de lenguaje generativo, puede producir contenido incorrecto o sesgado y sus respuestas deben supervisarse en aplicaciones criticas.
- Licencia Apache-2.0 tanto en el derivado como en el base: sin restricciones relevantes para uso comercial, aunque los pesos, el tokenizador y el chat template originales pertenecen al equipo Qwen.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.5-122B-A10B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
