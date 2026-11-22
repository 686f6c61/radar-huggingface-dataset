# satoyutaka/qwen35-08b-rag-jem-sft1

## Resumen

`satoyutaka/qwen35-08b-rag-jem-sft1` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-0.8B-Base`, publicado por el usuario satoyutaka en Hugging Face. Se trata de un modelo multimodal de tipo imagen-texto-a-texto (pipeline `image-text-to-text`) orientado, segun la nomenclatura del repositorio, a tareas de generacion aumentada por recuperacion (RAG) y a un dominio que el autor etiqueta como "jem". El modelo conserva la licencia Apache 2.0 del modelo base.

Arquitectonicamente hereda el diseno hibrido de Qwen3.5: una combinacion de capas Gated DeltaNet (atencion lineal) y capas de atencion con compuertas (Gated Attention), con 24 capas organizadas en seis bloques de patron 3:1. Con 873.438.784 parametros reales (segun safetensors) y una longitud de contexto nativa de 262.144 tokens, es un modelo de escala reducida pensado para prototipado, ajuste fino especifico de tarea y experimentacion.

Su relevancia actual radica en que demuestra el patron de adaptacion de un modelo fundacional multimodal pequeno a un caso de uso concreto (RAG) mediante SFT, manteniendo las capacidades de vision y el contexto largo del modelo original. No obstante, el repositorio no incluye informacion sobre el dataset de ajuste, los hiperparametros ni evaluaciones propias del fine-tune, por lo que su rendimiento real en la tarea objetivo no esta documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; hibrida Gated DeltaNet + Gated Attention |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se confirma configuracion MoE en este checkpoint) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision original) |
| Idiomas soportados | no disponible en la ficha del fine-tune; el modelo base declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5, que combina capas de atencion lineal Gated DeltaNet con capas de atencion tradicional con compuertas. La disposicion es de 6 bloques con patron `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`, lo que da 24 capas en total. La dimension oculta es 1024, el FFN tiene dimension intermedia 3584 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida LM. Gated DeltaNet usa 16 cabezas lineales para V y 16 para QK con dimension de cabeza 128; Gated Attention usa 8 cabezas para Q y 2 para KV con dimension de cabeza 256 y RoPE de dimension 64. El modelo incluye entrenamiento con multi-token prediction (MTP) en varios pasos.

El checkpoint aqui descrito es un ajuste fino supervisado (SFT) sobre el modelo base post-entrenado. La model card no documenta el numero de tokens de ajuste, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. El nombre del repositorio sugiere un entrenamiento orientado a RAG, pero no se aportan detalles verificables sobre la receta. El modelo base, por su parte, se entreno con fusion temprana de tokens multimodales y RL a escala en entornos multiagente, segun la documentacion de Qwen.

## Capacidades

- Generacion de texto y razonamiento en modo no-thinking (el checkpoint base declara modos thinking y non-thinking; el fine-tune no documenta cambios al respecto).
- Comprension de imagenes y respuesta en texto (pipeline `image-text-to-text`), heredada del modelo base multimodal.
- Generacion de codigo y matematicas a escala de 0.8B, con rendimiento limitado segun los benchmarks del modelo base.
- Soporte de contexto largo: hasta 262.144 tokens nativos, adecuado para concatenar documentos recuperados en pipelines RAG.
- Capacidades multilingues heredadas del modelo base (201 idiomas y dialectos declarados por Qwen), aunque el fine-tune no especifica que idiomas cubre su ajuste.
- Soporte de tool calling y function calling: no documentado especificamente para este checkpoint; el modelo base Qwen3.5 lo declara.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el fine-tune.
- Modo thinking: no documentado para este checkpoint.

## Casos de uso

- Generacion aumentada por recuperacion (RAG) sobre documentacion tecnica: el modelo puede recibir varios fragmentos recuperados como contexto (hasta 262.144 tokens) y generar respuestas fundamentadas; es el caso de uso que sugiere el nombre del repositorio.
- RAG multimodal sobre documentos escaneados: al aceptar entrada de imagen y texto, puede procesar paginas de PDF renderizadas junto con texto recuperado y responder preguntas sobre su contenido.
- Prototipado de asistentes documentales: su tamano (873M parametros) permite desplegarlo en una unica GPU consumer para iterar rapidamente sobre prompts y estrategias de recuperacion antes de escalar a modelos mayores.
- Ajuste fino adicional especifico de dominio: al ser un checkpoint SFT pequeno y con licencia Apache 2.0, sirve como punto de partida para especializaciones posteriores con coste de computo bajo.
- Extraccion de informacion estructurada de imagenes y texto: por ejemplo, convertir capturas o documentos escaneados en campos JSON para pipelines de ingestión de datos.
- Evaluacion comparativa de estrategias RAG: util como baseline ligero para medir calidad de recuperacion y generacion en experimentos academicos sin requerir infraestructura grande.
- Clasificacion y resumen de documentos largos: gracias al contexto extendido, puede resumir o clasificar expedientes completos en una sola pasada.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo base Qwen3.5-0.8B en modo non-thinking, no al fine-tune. Se reproducen a continuacion junto con los modelos de referencia que reporta Qwen:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B (base del fine-tune) |
|---|---|---|---|---|
| MMLU-Pro | 69.6 | 40.2 | 55.3 | 29.7 |
| MMLU-Redux | 84.2 | 64.4 | 69.2 | 48.5 |
| C-Eval | 80.2 | 61.0 | 65.2 | 46.4 |

No se han publicado resultados de benchmarks del checkpoint `qwen35-08b-rag-jem-sft1` en la informacion disponible, ni evaluaciones de la tarea RAG objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (fp16/bf16): aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 3 y 5 GB segun longitud de contexto.
- En cuantizacion de 8 bits: alrededor de 1 GB de pesos; en 4 bits: en torno a 0,5 GB. No se publican GGUF oficiales, pero puede convertirse con llama.cpp.
- Cabe en cualquier GPU consumer moderna: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs de 8 GB con cuantizacion.
- GPU de datacenter recomendadas para mayor throughput: A100, H100, L40S; tambien funciona en T4 para inferencia ligera.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (segun la model card del base); llama.cpp y Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles para este checkpoint; a 0.8B se espera alta velocidad en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro (non-thinking) | Licencia | Notas |
|---|---|---|---|---|---|
| qwen35-08b-rag-jem-sft1 | 873M | 262.144 | no disponible (base: 29.7) | Apache 2.0 | SFT orientado a RAG, multimodal |
| Qwen3.5-0.8B (base) | 0.8B | 262.144 | 29.7 | Apache 2.0 | Modelo fundacional multimodal de referencia |
| Qwen3.5-2B | 2B | no disponible | 55.3 | Apache 2.0 | Misma familia, mayor escala |
| Qwen3-1.7B | 1.7B | no disponible | 40.2 | Apache 2.0 | Generacion anterior, solo texto |

La comparativa se limita a la familia Qwen porque no se dispone de datos de otros modelos de 0.8B multimodales con contexto comparable en la informacion proporcionada.

## Limitaciones y advertencias

- El fine-tune no documenta su dataset, hiperparametros ni evaluacion; no hay evidencia publicada de que mejore al modelo base en tareas RAG.
- Riesgo de alucinacion inherente a modelos de 0.8B, especialmente en dominios especializados y con contextos recuperados irrelevantes.
- Rendimiento base limitado: MMLU-Pro de 29.7 y C-Eval de 46.4 en el modelo base indican capacidad de razonamiento moderada; no es adecuado para tareas que exijan alta precision factual sin verificacion.
- Idiomas del fine-tune no especificados: aunque el base declara 201 idiomas, el ajuste puede haber degradado el multilingueismo.
- El tag `region:us` y la ausencia de descargas y likes sugieren un modelo reciente y sin validacion comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar el checkpoint antes de produccion.
- No se publican pesos cuantizados oficiales; la conversion a GGUF corre por cuenta del usuario y puede degradar calidad.
- La model card del repositorio es en gran parte una copia de la del modelo base Qwen3.5, lo que dificulta distinguir que capacidades corresponden realmente al fine-tune.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/satoyutaka/qwen35-08b-rag-jem-sft1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
