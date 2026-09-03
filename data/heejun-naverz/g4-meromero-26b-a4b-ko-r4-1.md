# heejun-naverz/G4-MeroMero-26B-A4B-ko-R4.1

## Resumen

G4-MeroMero-26B-A4B-ko-R4.1 es un modelo de lenguaje especializado en roleplay y chat de personajes en coreano, desarrollado por heejun-naverz como una iteración de la serie R sobre el modelo base zerofata/G4-MeroMero-26B-A4B. Se trata de un fine-tuning mediante LoRA fusionada (merged) aplicado sobre un modelo MoE basado en arquitectura Gemma4, con 26 mil millones de parámetros totales y 4 mil millones activos por token. El modelo está diseñado para generar conversaciones de personajes con formato de narración y diálogo, y se distribuye en pesos bf16 (49 GB) bajo licencia Apache 2.0.

La relevancia de esta versión R4.1 radica en que añade dominio de roleplay anime (animerp) a la versión R4, que ya incorporaba datos de chat de personajes "frontera" (terra+sol), con el objetivo de ampliar la diversidad de personajes sin degradar la longitud de respuesta aprendida. El entrenamiento se realizó con 3.735 ejemplos SFT, secuencias de 8192 tokens y dos épocas en dos GPUs A100. El modelo está pensado para desarrolladores que necesitan un generador de roleplay coreano de alta calidad, con soporte de contexto largo y desplegable mediante vLLM o GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 MoE (Mixture of Experts) |
| Parametros totales | 25.805.933.872 |
| Parametros activos | 4.000.000.000 (aprox., segun model card) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | bf16 (original), GGUF (disponible en repos externos) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

El modelo base, zerofata/G4-MeroMero-26B-A4B, emplea una arquitectura MoE basada en Gemma4, donde los expertos están fusionados en tensores que representan aproximadamente el 88% de los parámetros totales. Esta característica hace que las cuantizaciones W4A16 tipo GPTQ/AWQ no sean efectivas, por lo que la vía recomendada para reducir el peso es GGUF. El fine-tuning de esta versión R4.1 aplica LoRA sobre las proyecciones de atención (q/k/v/o) con rango 16 y alpha 32, entrenada con SFT sobre 3.735 ejemplos, dos épocas y longitud de secuencia 8192, en dos GPUs A100 en bf16.

Los datos de entrenamiento provienen del dataset heejun-naverz/charchat-ko-frontier-sft, que combina 2.840 ejemplos de los subconjuntos "terra" y "sol" (considerados de frontera para chat de personajes) con 895 ejemplos de "animerp" filtrados por respuestas de 400 caracteres o menos. Esta selección se realizó para preservar la propiedad de longitud de respuesta proporcional a la entrada que ya tenía la versión R4, ya que el conjunto animerp completo tiene una mediana de 493 caracteres, 2,6 veces mayor que la de los datos frontera (188 caracteres). El resultado añade 214 personajes nuevos respecto a R4.

## Capacidades

- Generacion de roleplay y chat de personajes en coreano, con formato estructurado de narracion y dialogo (narracion en texto plano, personaje: dialogo, personaje: *accion* dialogo).
- Soporte de contexto largo de 8192 tokens, adecuado para conversaciones multi-turno con historial extenso.
- Especializacion en caracterizacion diversa gracias a la incorporacion de 214 personajes adicionales del dominio anime.
- Generacion de respuestas con longitud controlada, manteniendo la proporcion respecto a la entrada gracias al filtrado de datos de entrenamiento.
- No se mencionan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Chatbots de personajes para ficcion interactiva: el modelo puede mantener conversaciones coherentes con personalidades definidas, usando el formato de narracion y dialogo para simular interacciones de novelas visuales o juegos de rol.
- Escritura creativa asistida en coreano: permite generar dialogos y narraciones para guiones, fanfiction o historias originales, con control sobre la voz de cada personaje.
- Prototipado de asistentes conversacionales con personalidad: desarrolladores pueden integrar el modelo en aplicaciones de entretenimiento o educacion que requieran un tono caracterizado y respuestas largas.
- Generacion de contenido para comunidades de roleplay por texto: el modelo puede producir respuestas rapidas y coherentes para foros o servidores de rol, reduciendo el tiempo de escritura manual.
- Traduccion y adaptacion de personajes de anime al coreano: al entrenarse con datos de animerp, el modelo puede recrear voces de personajes de anime en coreano, util para doblaje o subtitulado creativo.
- Evaluacion de sistemas de generacion de personajes: al ser un modelo de referencia con licencia Apache 2.0, puede usarse como baseline en investigacion academica sobre roleplay y coherencia conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El unico dato de rendimiento indirecto es el tamaño del repositorio (51,7 GB) y la nota de que el modelo base tiene un LLM Explorer Score de 0,28, aunque este dato no es un benchmark estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 51,6 GB (segun LLM Explorer para el modelo base), lo que requiere una GPU profesional como A100 80GB, H100 80GB o dos GPUs consumer de 24GB en paralelo.
- Con cuantizacion GGUF (15,4 GB segun el repositorio local-ai-zone), el modelo puede ejecutarse en GPUs consumer de 16 GB o 24 GB, como RTX 4090, RTX 4080 o RTX 3090, con perdida de precision.
- Para entrenamiento se usaron 2x A100 en bf16, por lo que el fine-tuning adicional requeriria hardware similar.
- Opciones de despliegue: vLLM con la receta gemma4 (usando --hf-overrides para Gemma4ForCausalLM, chat template y eos_token_id [106,1]), o llama.cpp/Ollama con pesos GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| G4-MeroMero-26B-A4B-ko-R4.1 (este) | 26B totales, 4B activos | 8192 | Apache 2.0 | Roleplay coreano, character chat |
| zerofata/G4-MeroMero-26B-A4B (base) | 26B totales, 4B activos | no disponible | Apache 2.0 | Instruccion general, sin censura |
| G4-MeroMero-26B-A4B-ko-R4 (version anterior) | 26B totales, 4B activos | 8192 | Apache 2.0 | Roleplay coreano, solo datos frontera |

La comparativa se limita a las versiones del mismo modelo porque no se dispone de informacion sobre alternativas de la misma categoria (modelos de roleplay coreano) en los datos proporcionados. La diferencia principal entre R4 y R4.1 es la inclusion de 895 ejemplos de animerp, que anade 214 personajes nuevos sin cambiar los hiperparametros.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con datos en coreano, por lo que su rendimiento en otros idiomas es muy limitado o nulo.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo de roleplay, puede generar contenido ficticio que no debe tomarse como factual.
- La cuantizacion GGUF puede degradar la calidad de las respuestas, especialmente en tareas que requieren matices de lenguaje, aunque es la unica via recomendada para reducir el peso debido a la arquitectura de expertos fusionados.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion.
- El modelo no incluye soporte para tool calling, agentes ni multimodalidad; su uso se limita a generacion de texto conversacional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un modelo reciente y sin validacion comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heejun-naverz/G4-MeroMero-26B-A4B-ko-R4.1
- Modelo base: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
- Version anterior R3: https://huggingface.co/heejun-naverz/G4-MeroMero-26B-A4B-ko-R3
- Dataset de entrenamiento: https://huggingface.co/datasets/heejun-naverz/charchat-ko-frontier-sft
- Repositorio GGUF (local-ai-zone): https://local-ai-zone.github.io/models/g4-meromero-26b-a4b.html
- Repositorio GitHub del modelo base: https://github.com/Damacol/zerofata-g4-meromero-26b-a4b
- Ficha en LLM Explorer: https://llm-explorer.com/model/zerofata%2FG4-MeroMero-26B-A4B,678uh5CQqvUHPaLTPvyS9C
