# Popohara/4B_enhanced_eposide1

## Resumen

Popohara/4B_enhanced_eposide1 es un fine-tuning del modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario Popohara en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas conjuntas de imagen y texto y genera texto como salida. El repositorio contiene 4.659.865.088 parametros en formato safetensors y ocupa 9,3 GB, lo que concuerda con un modelo denso de aproximadamente 4B de parametros en precision de 16 bits.

El modelo hereda la arquitectura de la familia Qwen3.5, que combina capas de atencion lineal (Gated DeltaNet) con capas de atencion tradicional con compuerta (Gated Attention) en un esquema hibrido, junto con un codificador de vision para el procesamiento de imagenes. Segun la model card del modelo base, Qwen3.5-4B emplea 32 capas, una dimension oculta de 2560 y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens.

La relevancia de esta ficha radica en que se trata de un fine-tuning de un modelo base reciente de la familia Qwen3.5, con licencia Apache 2.0, lo que permite uso comercial. No obstante, la informacion publicada por el autor del fine-tuning es practicamente inexistente: no hay descripcion del dataset de ajuste, ni del procedimiento, ni de resultados de evaluacion propios. La model card incluida es la del modelo base Qwen3.5-4B, no la del fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Vision Encoder: Gated DeltaNet (atencion lineal) + Gated Attention, con FFN |
| Parametros totales | 4.659.865.088 (aproximadamente 4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens (segun model card del base) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible para el fine-tuning; el modelo base declara soporte de 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente, segun la model card del modelo base Qwen3.5-4B, es un transformer causal con codificador de vision. El layout es hibrido: 8 bloques compuestos por 3 capas de Gated DeltaNet (atencion lineal) seguidas de 1 capa de Gated Attention, cada una con su FFN. La Gated DeltaNet usa 32 cabezas para V y 16 para QK con dimension de cabeza 128; la Gated Attention usa 16 cabezas para Q y 4 para KV con dimension de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimension intermedia de 9216. El embedding de tokens es de 248.320 entradas (con padding) y esta atado a la salida LM. El modelo se entreno con multi-token prediction (MTP) en varios pasos.

El modelo base Qwen3.5-4B fue preentrenado y postentrenado por el equipo Qwen (Alibaba), con entrenamiento de fusion temprana sobre tokens multimodales y escalado de RL en entornos multiagente, segun su model card. Sin embargo, para este fine-tuning concreto (Popohara/4B_enhanced_eposide1) no se dispone de informacion sobre el dataset de ajuste, el numero de tokens, la composicion de los datos, ni si se aplicaron tecnicas de RLHF o DPO. El autor no documenta el procedimiento de entrenamiento en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-4B, incluyendo conocimiento general y STEM.
- Procesamiento de imagen y texto (image-text-to-text): el pipeline declarado es multimodal, con codificador de vision integrado.
- Razonamiento matematico y codigo: segun los benchmarks del modelo base, con resultados en MMLU-Pro de 79,1 para Qwen3.5-4B.
- Soporte multilingue: el modelo base declara 201 idiomas y dialectos; el fine-tuning no documenta cambios en esta cobertura.
- Tool calling y function calling: no documentado explicitamente para este fine-tuning; el modelo base Qwen3.5 esta disenado para agentes y entornos de herramientas.
- Razonamiento multi-paso y agentes: el modelo base se entreno con RL en entornos multiagente; el fine-tuning no documenta si conserva o modifica esta capacidad.
- Modo thinking: no disponible para este fine-tuning (el modelo base Qwen3.5-4B se presenta como post-trained, pero no se detalla si incluye modo thinking explicito en esta variante).

## Casos de uso

- Asistencia multimodal en atencion al cliente: el modelo puede procesar capturas de pantalla o imagenes enviadas por el usuario junto con texto, y responder en conversaciones multi-turno aprovechando la ventana de contexto de 262.144 tokens del modelo base.
- Analisis de documentos con imagenes: extraccion de informacion de facturas, formularios o graficos escaneados combinando el codificador de vision con generacion de texto, adecuado para pipelines de digitalizacion.
- Generacion de codigo asistida por capturas: el modelo puede recibir una imagen de un error o de una interfaz y generar codigo o explicaciones, util en herramientas de desarrollo.
- Prototipado de agentes multimodales: al heredar la base Qwen3.5 entrenada con RL multiagente, puede emplearse en experimentos de agentes que combinan percepcion visual y acciones textuales.
- Descripcion y accesibilidad de imagenes: generacion de descripciones textuales de imagenes para sistemas de accesibilidad, con soporte de contexto largo para lotes de imagenes.
- Investigacion en fine-tuning multimodal: al ser un fine-tuning publicado con licencia Apache 2.0, sirve como punto de partida o referencia para estudiar ajustes sobre Qwen3.5-4B en tareas image-text-to-text.

## Benchmarks y rendimiento

Los unicos datos de benchmarks disponibles en la informacion proporcionada corresponden al modelo base Qwen3.5-4B, no al fine-tuning. Se presentan a continuacion los valores del modelo base frente a alternativas citadas en su model card:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

No se han publicado resultados de benchmarks del fine-tuning Popohara/4B_enhanced_eposide1 en la informacion disponible. La tabla anterior refleja exclusivamente el rendimiento del modelo base Qwen3.5-4B y no debe atribuirse al fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 16 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5 GB para pesos; en 4 bits, alrededor de 3 GB para pesos (estimaciones teoricas; no se documentan cuantizaciones oficiales para este fine-tuning).
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia y contexto largo; RTX 4090 (24 GB) para inferencia en FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 16 GB con cuantizacion. En GPUs de 8-12 GB requeriria cuantizacion agresiva y contexto reducido.
- Opciones de despliegue: transformers (libreria declarada), vLLM, SGLang y KTransformers segun la model card del base; llama.cpp/Ollama no estan documentados para este repositorio.
- Latencia y throughput: no disponibles para este fine-tuning. El modelo base declara arquitectura hibrida orientada a alto throughput y baja latencia, pero sin cifras concretas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Multimodal |
|---|---|---|---|---|---|
| Popohara/4B_enhanced_eposide1 (fine-tuning) | ~4B | 262.144 (heredado del base) | no disponible | Apache 2.0 | Si (image-text-to-text) |
| Qwen/Qwen3.5-4B-Base | ~4B | 262.144 | 79,1 | Apache 2.0 | Si |
| Qwen3.5-9B | ~9B | no disponible en el extracto | 82,5 | no disponible en el extracto | Si (familia Qwen3.5) |
| GPT-OSS-20B | 20B | no disponible | 74,8 | no disponible en el extracto | no disponible |

La comparativa se limita a los datos disponibles. No se dispone de informacion sobre el rendimiento del fine-tuning ni de modelos comparables de la misma categoria con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentacion del fine-tuning: no se describe el dataset, el procedimiento ni las evaluaciones, lo que impide conocer que comportamiento se ha modificado respecto al modelo base.
- Riesgo de degradacion o sobreajuste: al no documentarse el ajuste, no puede descartarse una perdida de capacidades generales del modelo base (razonamiento, multilingue, codigo) tras el fine-tuning.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluaciones del fine-tuning no puede cuantificarse.
- Sesgos: no documentados para este fine-tuning; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Idiomas: el fine-tuning no declara idiomas soportados; el modelo base declara 201, pero el ajuste podria haber alterado la cobertura.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el origen de los datos de ajuste, lo que puede plantear riesgos de cumplimiento en produccion.
- Contexto: la ventana de 262.144 tokens es la del modelo base; no se verifica que el fine-tuning la conserve operativamente.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Popohara/4B_enhanced_eposide1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
