# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Qwen2.5-1.5B-Rewrite-SFT

## Resumen

El modelo `lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Qwen2.5-1.5B-Rewrite-SFT` es un ajuste fino (SFT) del modelo `unsloth/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario lugman. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), construido sobre la arquitectura Qwen2 y publicado bajo licencia Apache 2.0. El nombre del repositorio sugiere un entrenamiento orientado a reescritura de texto y a la generacion de haikus, aunque la model card no detalla la composicion del dataset ni el proceso de entrenamiento.

El modelo resuelve, en principio, tareas de generacion de texto conversacional y reescritura estilistica en ingles. Al derivar de la version Instruct de Qwen2.5, hereda el formato de chat y la capacidad de seguir instrucciones del modelo base, pero el ajuste fino especifico no viene acompanado de documentacion tecnica sobre hiperparametros, numero de tokens de entrenamiento ni evaluacion.

Es relevante ahora unicamente como artefacto experimental de la comunidad: cuenta con 0 descargas y 0 likes en el momento de la consulta, y su model card es una plantilla autogenerada por Unsloth sin informacion sustantiva. No debe considerarse un modelo listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible en el repositorio; compatible con cuantizacion via transformers/bitsandbytes y conversion a GGUF |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parametros. Deriva de `unsloth/Qwen2.5-1.5B-Instruct`, que a su vez es un ajuste de instrucciones del Qwen2.5-1.5B base. La model card indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que implica un ajuste supervisado (SFT) con tecnicas de optimizacion de memoria y velocidad (kernel fusionado, gradient checkpointing y posiblemente LoRA/QLoRA, aunque no se especifica).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales. El nombre del repositorio sugiere un dataset orientado a reescritura y haikus ("KK-Haiku-5.5", "Rewrite-SFT"), pero es una inferencia a partir del identificador, no un dato documentado.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Instruct.
- Seguimiento de instrucciones y formato de chat (roles system/user/assistant).
- Reescritura de texto y generacion de poesia breve (haikus), segun sugiere el nombre del repositorio; no verificado con evaluaciones.
- Soporte de tool calling / function calling: no documentado en esta ficha; el modelo base Qwen2.5 lo soporta, pero no se confirma que el ajuste fino lo preserve.
- Razonamiento multi-paso y agentes: no documentado.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Reescritura estilistica de textos en ingles: el ajuste fino parece orientado a reformular parrafos con un estilo determinado; adecuado para prototipos de edicion automatica, aunque requiere validacion cualitativa.
- Generacion de haikus y poesia breve: el identificador del modelo sugiere entrenamiento especifico en este formato; util para demos creativas y generacion de contenido literario corto.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de 1,5B, cabe en GPU de consumo y permite iterar sobre prompts y formatos de chat sin infraestructura dedicada.
- Filtrado y reformulacion de respuestas en pipelines de datos: puede usarse como paso de post-procesado para normalizar o reescribir texto generado por otros modelos.
- Educacion y experimentacion: sirve como caso de estudio de ajuste fino con Unsloth/TRL para quienes aprenden a entrenar modelos pequenos.
- Generacion de variaciones de copy en ingles: para pruebas A/B de textos cortos, siempre con revision humana dada la ausencia de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,6 GB para pesos; en 4 bits, aproximadamente 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); para cuantizacion 4 bits, GPUs con 2-4 GB (GTX 1650, iGPU modernas con suficiente memoria compartida).
- Cabe en GPU de consumo: si, en la mayoria de GPUs dedicadas de los ultimos anos.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama tras conversion a GGUF, y endpoints compatibles de Hugging Face.
- Latencia y throughput: no disponibles; al ser un modelo de 1,5B, se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Qwen2.5-1.5B-Rewrite-SFT | 1,54B | no disponible | Apache 2.0 | Ajuste fino comunitario sin benchmarks ni descargas |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,54B | 32.768 tokens | Apache 2.0 | Modelo oficial con evaluaciones publicadas y soporte multilingue |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Modelo oficial de Meta con benchmarks publicados |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | Modelo pequeno de Hugging Face con evaluaciones publicadas |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento: riesgo de sesgos desconocidos y de comportamientos no evaluados.
- Riesgo de alucinacion inherente a modelos de 1,5B, agravado por la falta de benchmarks.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Longitud de contexto: no confirmada en esta ficha; no asumir los 32.768 tokens del modelo base sin verificacion.
- Licencia Apache 2.0 permite uso comercial, pero al ser un ajuste fino comunitario sin evaluacion, no se recomienda su uso en produccion sin pruebas propias.
- Sin descargas ni likes: no hay evidencia de uso real ni de validacion por parte de la comunidad.
- El modelo base Qwen2.5-1.5B-Instruct tiene capacidades limitadas de razonamiento complejo y codigo; el ajuste fino no las mejora necesariamente.

## Enlaces

- [Hugging Face: lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Qwen2.5-1.5B-Rewrite-SFT](https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Qwen2.5-1.5B-Rewrite-SFT)
- [Modelo base: unsloth/Qwen2.5-1.5B-Instruct](https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
