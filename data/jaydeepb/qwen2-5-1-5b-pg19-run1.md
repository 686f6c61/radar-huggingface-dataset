# jaydeepb/qwen2.5-1.5b-pg19-run1

## Resumen

qwen2.5-1.5b-pg19-run1 es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B de Alibaba, publicado por el usuario jaydeepb en HuggingFace. No es un modelo de uso general: se trata de un artefacto de investigación sobre memorización en modelos de lenguaje. El autor ha ajustado el modelo durante una época sobre una muestra de 1 millón de secuencias de 128 tokens extraídas del dataset PG-19, un corpus de libros publicados antes de 1919.

El propósito del modelo es doble. Por un lado, sirve como sujeto de estudio para medir cuánta información del conjunto de entrenamiento es extraíble por el modelo (memorización). Por otro, sus etiquetas de memorización extraíble (calculadas con decodificación greedy, k=50, l=50) se utilizan como datos de entrenamiento para un clasificador que predice qué secuencias serán memorizadas.

Su relevancia es nicho pero creciente: la memorización está en el centro de debates sobre privacidad, derechos de autor y fuga de datos en LLMs, y modelos como este permiten estudiar el fenómeno de forma controlada y reproducible. Existe un modelo hermano, run2, entrenado sobre una muestra disjunta de 1M de secuencias, que actúa como conjunto de evaluación held-out.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B) |
| Tipos de cuantizacion | no disponible (pesos en bf16/fp16, 3,1 GB de repo) |
| Idiomas soportados | no disponible (entrenado adicionalmente en ingles, corpus PG-19) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B: un transformer decoder denso (no MoE) con atención agrupada (GQA), embeddings RoPE y SwiGLU en las capas FFN, según la familia Qwen2. El modelo conserva la arquitectura del original; solo se han actualizado los pesos mediante fine-tuning.

El entrenamiento adicional consistió en una única época sobre 1 millón de secuencias de 128 tokens muestreadas del dataset PG-19 (emozilla/pg19), con learning rate 5e-5, planificador de tasa coseno y semilla 42. No se menciona RLHF ni DPO: el ajuste es de preentrenamiento continuo sobre texto literario, no de alineamiento conversacional. La innovación principal no está en la arquitectura sino en el protocolo experimental: las etiquetas de memorización extraíble se calcularon con decodificación greedy usando los parámetros k=50 y l=50 (probablemente los 50 tokens previos como contexto y los 50 tokens siguientes como objetivo de extracción), y esas etiquetas alimentan a un clasificador de predicción de memorización.

## Capacidades

- Generacion de texto en estilo literario clásico (ingles), reforzada por el ajuste fino sobre PG-19.
- Capacidades generales heredadas de Qwen2.5-1.5B: razonamiento basico, generacion de codigo y matematicas, aunque probablemente degradadas por el fine-tuning sobre un dominio estrecho.
- Utilidad principal como sujeto de experimentacion sobre memorizacion: permite medir que fragmentos del corpus son extraibles verbatim.
- Uso como fuente de etiquetas para entrenar clasificadores de memorizacion.
- No hay informacion sobre soporte de tool calling, function calling ni capacidades agenticas; al ser un fine-tune de investigacion, no debe asumirse que las conserven intactas.
- Sin capacidades multimodales: es un modelo de texto.

## Casos de uso

- Investigacion en memorizacion de LLMs: medir cuantos fragmentos de PG-19 el modelo reproduce verbatim tras el fine-tuning, util para estudios de extraccion de datos de entrenamiento.
- Entrenamiento de clasificadores de memorizacion: sus etiquetas (k=50, l=50 greedy) sirven como datos supervisados para predecir que secuencias seran memorizadas antes de entrenar.
- Estudios de privacidad y mitigacion: base para probar tecnicas de unlearning o regularizacion que reduzcan la memorizacion.
- Analisis de derechos de autor: evaluar el riesgo de reproduccion de textos bajo copyright historico en modelos ajustados sobre corpus literarios.
- Investigacion reproducible en eficiencia de fine-tuning: al ser un run con semilla, learning rate y schedule documentados, sirve de referencia replicable para experimentos de continuo de preentrenamiento a pequena escala.
- Docencia y formacion: ejemplo practico y ligero (1,5 B de parametros) para ensenar como se mide la memorizacion en un pipeline de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README solo documenta el protocolo de entrenamiento y el uso experimental del modelo; no hay metricas de MMLU, perplexidad sobre PG-19 ni tasas de memorizacion publicadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 3,1 GB solo de pesos; con overhead de KV cache y activaciones, unos 4-6 GB son suficientes para contextos cortos (128 tokens en el caso de uso original).
- GPU recomendadas: cualquier GPU moderna de consumo es mas que suficiente. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 8 GB ejecutan el modelo sin problemas. No se necesita A100 ni H100 para inferencia.
- Cabe con holgura en GPUs de consumo; incluso es ejecutable en CPU con razonable velocidad dado su tamano de 1,5 B de parametros.
- Opciones de despliegue: transformers (libreria nativa indicada en la model card), llama.cpp tras convertir a GGUF, Ollama, vLLM o TGI. Para el caso de uso de investigacion, transformers con safetensors es la via mas directa.
- Latencia y throughput: no disponible; al ser un modelo de 1,5 B, se esperan latencias bajas y throughput alto en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| qwen2.5-1.5b-pg19-run1 | 1,54 B | no disponible | Apache 2.0 | Investigacion en memorizacion |
| Qwen/Qwen2.5-1.5B (base) | 1,54 B | 32.768 | Apache 2.0 (Qwen Research) / licencia comercial Qwen para >100M usuarios | Uso general |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 / licencia comercial Qwen | Chat y asistente |
| jaydeepb/qwen2.5-1.5b-pg19-run2 | 1,54 B | no disponible | Apache 2.0 | Evaluacion held-out del experimento de memorizacion |

La diferencia clave frente al modelo base Qwen2.5-1.5B es el dominio: este fine-tune esta especializado en PG-19 y probablemente pierde generalidad a cambio de un comportamiento de memorizacion medible y controlado. Frente a la version Instruct, no esta alineado para dialogo ni instruccion.

## Limitaciones y advertencias

- Riesgo elevado y deliberado de alucinacion y regurgitacion: el modelo ha sido entrenado para memorizar un corpus especifico; reproducira fragmentos verbatim de PG-19, lo cual es el objetivo del experimento pero un riesgo grave en cualquier otro uso.
- Sesgo de dominio: tras el fine-tuning, el modelo esta sesgado hacia prosa literaria en ingles anterior a 1919; su rendimiento en tareas generales, codigo o idiomas distintos del ingles probablemente se ha degradado respecto al modelo base.
- Idiomas: no hay informacion de idiomas soportados; el corpus de fine-tuning es en ingles.
- Contexto: la longitud de contexto no esta documentada en la model card; el entrenamiento uso secuencias de solo 128 tokens, por lo que no debe asumirse un comportamiento fiable en contextos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede reproducir textos de PG-19; aunque el corpus es de dominio publico, conviene verificar la normativa aplicable al corpus original en cada jurisdiccion.
- No apto para produccion conversacional: no hay alineamiento (RLHF/DPO) documentado y el tag "conversational" refleja la plantilla del pipeline, no un ajuste de chat.
- Proyecto de investigacion individual con baja traccion (303 descargas, 0 likes): sin auditoria comunitaria ni documentacion extensa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/qwen2.5-1.5b-pg19-run1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de entrenamiento (PG-19): https://huggingface.co/datasets/emozilla/pg19
- Paper original de PG-19: https://arxiv.org/abs/1911.05507
- Modelo hermano run2: no disponible (no se ha proporcionado URL directa; buscar en el perfil del autor en HuggingFace)
