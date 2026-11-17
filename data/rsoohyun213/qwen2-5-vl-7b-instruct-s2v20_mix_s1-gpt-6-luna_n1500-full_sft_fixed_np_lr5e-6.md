# rsoohyun213/Qwen2.5-VL-7B-Instruct-S2v20_mix_s1-gpt-6-luna_n1500-full_SFT_fixed_np_lr5e-6

## Resumen

Qwen2.5-VL-7B-Instruct-S2v20_mix_s1-gpt-6-luna_n1500-full_SFT_fixed_np_lr5e-6 es un ajuste fino (SFT) del modelo multimodal Qwen2.5-VL-7B-Instruct, desarrollado por el usuario rsoohyun213 y publicado en Hugging Face. El modelo conserva la arquitectura del Qwen2.5-VL original (transformer multimodal con torre visual y LLM de ~7 mil millones de parametros) y ha sido entrenado con la libreria TRL sobre un conjunto de datos de razonamiento espacial, segun se deduce del nombre del proyecto en Weights & Biases (`spatial_reasoning@SFT-full`).

El problema que aborda es el ajuste de las capacidades de razonamiento espacial y multimodal del modelo base mediante supervision directa sobre pares imagen-texto. El nombre del checkpoint sugiere una mezcla de datos (mix) con una fase de cold start y un conjunto de 1500 ejemplos (n1500) generados o anotados con un modelo denominado "gpt-6-luna", entrenado con tasa de aprendizaje 5e-6 en modo full SFT.

Es relevante ahora porque los modelos multimodales de 7B con contexto largo y soporte de tool calling son candidatos habituales para despliegues en produccion con GPU de gama alta, y este checkpoint representa un ejemplo de especializacion vertical sobre una base solida. No obstante, la ausencia de documentacion detallada, benchmarks y licencia explicita limita su uso inmediato en produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL: torre visual + LLM decoder-only) |
| Parametros totales | 7B (heredados del modelo base); el repo safetensors reporta 848.896 tensores/entradas de metadatos, no el numero de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-VL-7B-Instruct soporta 128K tokens, pero no se confirma en este checkpoint) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el modelo base admite cuantizacion GPTQ/AWQ/GGUF, pero no se confirma para este checkpoint) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar; el modelo base Qwen2.5-VL usa Apache-2.0, pero no se confirma para este derivado) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un codificador visual con un LLM decoder-only de aproximadamente 7 mil millones de parametros. La arquitectura exacta, el numero de tokens de entrenamiento y la composicion del dataset no se detallan en la model card. El nombre del checkpoint (`S2v20_mix_s1-gpt-6-luna_n1500-full_SFT_fixed_np_lr5e-6`) sugiere una mezcla de datos con una fase de cold start, un conjunto de 1500 ejemplos y entrenamiento full SFT con tasa de aprendizaje 5e-6.

El entrenamiento se realizo con TRL 1.3.0, Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 4.8.5 y Tokenizers 0.22.2. El proyecto de Weights & Biases se denomina `spatial_reasoning@SFT-full`, lo que indica que el objetivo del ajuste es el razonamiento espacial sobre imagenes. No se especifica si hubo RLHF, DPO ni otras tecnicas de alineacion adicionales. Tampoco se documentan innovaciones tecnicas propias mas alla del ajuste fino.

## Capacidades

- Generacion de texto e inferencia multimodal imagen-texto, heredadas del modelo base Qwen2.5-VL-7B-Instruct.
- Razonamiento espacial sobre imagenes, segun el nombre del proyecto de entrenamiento (`spatial_reasoning`).
- Capacidad de conversacion multi-turno (pipeline `image-text-to-text`, formato conversational).
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para este checkpoint (el modelo base lo soporta).
- Soporte de agentes y razonamiento multi-paso: no confirmado para este checkpoint.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: vision confirmada por el pipeline; thinking y audio no disponibles.

## Casos de uso

- Razonamiento espacial sobre imagenes: el ajuste se ha orientado explicitamente a tareas de `spatial_reasoning`, por lo que es adecuado para preguntas sobre relaciones espaciales, posiciones relativas y descripcion de escenas.
- Asistencia en entornos de investigacion: util como checkpoint de partida para experimentos de SFT sobre Qwen2.5-VL, dado que se publica con la configuracion de entrenamiento TRL y el enlace a Weights & Biases.
- Prototipado de asistentes visuales: al conservar el pipeline `image-text-to-text`, puede integrarse en demos de conversacion multimodal con transformers.
- Evaluacion comparativa de ajustes finos: sirve como referencia para medir el impacto de un SFT de 1500 ejemplos sobre el modelo base en tareas de razonamiento espacial.
- Generacion de descripciones de imagenes en castellano o ingles: solo si se valida previamente la calidad multilingue, ya que no se documentan idiomas soportados.
- Fine-tuning posterior: al estar en formato safetensors y transformers, puede servir como base para nuevas rondas de SFT o DPO en dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16-18 GB para los pesos del modelo de 7B, mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-10 GB; en 4 bits: aproximadamente 5-7 GB (estimaciones generales para un modelo de 7B, no confirmadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para entrenamiento o inferencia de alta concurrencia; RTX 4090 (24 GB) para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con contexto limitado, y en RTX 3090/4080 con cuantizacion.
- Opciones de despliegue: transformers (confirmado), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp no confirmados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (SFT de Qwen2.5-VL-7B) | 7B | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-7B-Instruct (base) | 7B | 128K (segun modelo base) | Apache-2.0 (segun modelo base) | Hugging Face, ampliamente usado |
| Qwen2.5-VL-3B-Instruct | 3B | 128K (segun modelo base) | Apache-2.0 (segun modelo base) | Hugging Face |
| Qwen2.5-VL-72B-Instruct | 72B | 128K (segun modelo base) | Apache-2.0 (segun modelo base) | Hugging Face |

No se dispone de datos de rendimiento comparativo para este checkpoint frente a las alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgos de alucinacion ni limitaciones especificas del ajuste.
- El dataset de entrenamiento no se describe en detalle; el uso de un conjunto de 1500 ejemplos puede provocar sobreajuste a ese dominio y degradar capacidades generales del modelo base.
- La licencia no esta especificada de forma clara ("licence: license"), lo que impide confirmar el uso comercial sin consultar al autor.
- No se documentan idiomas soportados; el comportamiento multilingue es incierto.
- El checkpoint tiene 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad.
- El nombre del modelo incluye referencias a "gpt-6-luna" que no se explican en la model card; conviene verificar la procedencia de los datos de entrenamiento.
- No se confirma la longitud de contexto efectiva tras el ajuste, aunque el modelo base soporta 128K tokens.
- El repositorio ocupa 33.2 GB, lo que sugiere pesos en BF16; verificar el espacio en disco antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-7B-Instruct-S2v20_mix_s1-gpt-6-luna_n1500-full_SFT_fixed_np_lr5e-6
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- TRL: https://github.com/huggingface/trl
- Weights & Biases (run de entrenamiento): https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/km296aqt
