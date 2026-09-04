# BjarneNPO/finetuningQwen3.5-4B

## Resumen

BjarneNPO/finetuningQwen3.5-4B es un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base, publicado en Hugging Face con licencia Apache-2.0. El modelo resultante es un sistema multimodal `image-text-to-text` que combina un encoder visual con un modelo de lenguaje causal de 4.659.865.088 parámetros. La arquitectura es híbrida, con capas Gated DeltaNet y Gated Attention, y ofrece una ventana de contexto nativa de 262.144 tokens ampliable hasta 1.010.000.

Según la model card, el modelo base ha sido entrenado con fusión temprana de tokens multimodales, aprendizaje por refuerzo a escala en entornos multiagente y cobertura de 201 idiomas. El objetivo es ofrecer un modelo pequeño y eficiente que compita en razonamiento, programación y comprensión visual con alternativas de mayor tamaño, manteniendo un coste de despliegue reducido.

El repositorio concreto no registra descargas ni likes, y no se documenta el proceso de finetuning; la información técnica disponible procede principalmente de la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal de lenguaje con encoder de visión; arquitectura híbrida Gated DeltaNet + Gated Attention |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (no se ha confirmado arquitectura MoE en la configuración publicada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No disponible oficialmente; guías externas citan Q4 (aprox. 2,5 GB) |
| Idiomas soportados | 201 idiomas y dialectos según la model card; la ficha de Hugging Face no especifica idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base y ha sido afinado por BjarneNPO. Según la model card, es un modelo causal de lenguaje con encoder visual, 32 capas y dimensión oculta de 2560. La disposición de capas es 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), lo que combina atención lineal con atención gated. La ficha del modelo base destaca una arquitectura eficiente con Gated Delta Networks y MoE disperso, aunque el desglose de capas publicado para el modelo de 4B no detalla rutas de expertos.

El entrenamiento incluye fusión temprana de tokens multimodales, RL escalado en entornos multiagente y cobertura de 201 idiomas. También se menciona MTP (multi-step prediction), es decir, predicción de múltiples tokens por paso. No se han publicado datos específicos del dataset ni del procedimiento de finetuning aplicado por BjarneNPO.

## Capacidades

- Procesamiento multimodal `image-text-to-text`: acepta imágenes y texto como entrada, con encoder de visión integrado.
- Razonamiento y conocimiento: alcanza un 79,1 en MMLU-Pro, cerca de modelos más grandes como Qwen3.5-9B (82,5).
- Generación de código y tareas de agente: el modelo base fue entrenado con RL a escala en entornos multiagente, lo que apunta a capacidades de orquestación.
- Contexto largo: 262.144 tokens nativos, ampliable hasta 1.010.000 tokens.
- Multilingüe: soporte declarado de 201 idiomas y dialectos.
- Compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers.
- Soporte de tool calling y function calling: no especificado en la información disponible.

## Casos de uso

- Asistentes multimodales locales: el modelo puede procesar capturas de pantalla, diagramas y documentos junto con texto, lo que permite construir asistentes de ayuda técnica que explican errores visuales o interfaces.
- RAG sobre documentación extensa: con 262.144 tokens de contexto, es adecuado para indexar manuales, normativas o documentación interna y responder preguntas sin necesidad de fragmentar el contenido.
- Autocompletado de código en el editor: el modelo base muestra capacidades de programación y razonamiento; con 4.6B de parámetros puede ejecutarse en una GPU de consumo para asistencia en tiempo real.
- Agentes de orquestación de tareas: el entrenamiento con RL en entornos multiagente sugiere que el modelo puede usarse como planificador o ejecutor de subtareas dentro de flujos automatizados.
- Traducción y atención al cliente global: la cobertura de 201 idiomas permite desplegarlo en centros de soporte multilingüe con respuestas generadas automáticamente en el idioma del usuario.
- Análisis de imágenes y documentos visuales: gracias al encoder de visión, es útil para extraer información de recibos, formularios o capturas en aplicaciones de automatización documental.
- Despliegue en entornos con recursos limitados: en cuantización Q4 ocupa aproximadamente 2,5 GB, lo que permite ejecutarlo en portátiles con GPU de 6–8 GB o incluso en CPU para prototipos.

## Benchmarks y rendimiento

No se han publicado resultados completos de benchmarks en la información disponible. Los únicos datos presentes en la model card corresponden a MMLU-Pro dentro de la categoría Knowledge & STEM:

| Benchmark | Qwen3.5-4B | Qwen3.5-9B | Qwen3-Next-80B-A3B-Thinking | GPT-OSS-20B |
|---|---|---|---|---|
| MMLU-Pro | 79,1 | 82,5 | 82,7 | 74,8 |

La tabla original se trunca en la información proporcionada; no se dispone del valor de MMLU-Redux para Qwen3.5-4B ni de otros benchmarks.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 9,3 GB; se recomienda una GPU con al menos 16 GB de VRAM para inferencia con Transformers o vLLM.
- Cuantización Q4 mencionada en guías externas: aproximadamente 2,5 GB; puede ejecutarse en GPUs de 6–8 GB o en CPU.
- GPUs recomendadas: RTX 4080/4090 o A100 de 40 GB para bf16; RTX 3060 de 12 GB para Q4.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers. Para pesos cuantizados, llama.cpp u Ollama son alternativas habituales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B | 4.659.865.088 | 262.144 / 1.010.000 | 79,1 | Apache-2.0 |
| Qwen3.5-9B | no disponible | no disponible | 82,5 | no disponible |
| Qwen3-Next-80B-A3B-Thinking | 80B A3B (MoE) | no disponible | 82,7 | no disponible |
| GPT-OSS-20B | no disponible | no disponible | 74,8 | no disponible |

La comparativa se limita a MMLU-Pro porque la información proporcionada no incluye datos completos de parámetros, contexto ni licencia para los modelos comparados.

## Limitaciones y advertencias

- El repositorio es un finetuning no oficial de BjarneNPO; no se especifica el dataset, el procedimiento ni el número de pasos de entrenamiento.
- No se han publicado evaluaciones de sesgos, robustez ni tasas de alucinación.
- El soporte multilingüe es amplio, pero no hay benchmarks específicos para español ni para otros idiomas en la información disponible.
- Aunque el contexto puede ampliarse hasta 1.010.000 tokens, no se documenta el rendimiento en recuperación de información con contextos tan largos.
- La licencia Apache-2.0 permite uso comercial, pero el finetuning puede heredar restricciones de los datos de entrenamiento no auditados.
- Un modelo de 4B puede quedarse corto en tareas complejas de razonamiento frente a alternativas mayores como Qwen3.5-9B o Qwen3-Next-80B-A3B-Thinking.
- El repositorio tiene 0 descargas y 0 likes, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- https://huggingface.co/BjarneNPO/finetuningQwen3.5-4B
- https://qwen.ai/blog?id=qwen3.5
- https://github.com/IIIIQIIII/qwen35-4b-lora-sft
- https://theaibench.ai/models/qwen-3-5-4b/
