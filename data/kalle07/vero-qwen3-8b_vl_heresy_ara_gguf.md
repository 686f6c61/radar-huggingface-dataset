# kalle07/Vero-Qwen3-8B_VL_Heresy_ARA_gguf

## Resumen

Vero-Qwen3-8B_VL_Heresy_ARA_gguf es una distribucion en formato GGUF de un modelo de lenguaje y vision (image-text-to-text) de aproximadamente 8.190 millones de parametros, publicado por el usuario kalle07 en Hugging Face. El modelo es el resultado de un merge entre zlab-princeton/Vero-Qwen3I-8B (un modelo multimodal basado en la familia Qwen3-VL, entrenado con 600.000 muestras de RL curadas procedentes de 59 datasets en 6 categorias de razonamiento visual) y una adaptacion LoRA de captioning NSFW derivada de Qwen3-VL-8B-NSFW-Caption-V4.5, aplicada con un peso de 0,8.

Sobre esa base, el autor aplico una "decensurado" mediante la herramienta Heretic v2.1.0 con el metodo Arbitrary-Rank Ablation (ARA), una tecnica de ablacion de direcciones en el espacio de activaciones orientada a reducir los rechazos del modelo. Segun la model card, el resultado reduce los rechazos de 89/100 a 6/100 en una prueba interna de prompts sin censura, con una divergencia KL de 0,004 respecto al modelo original, lo que sugiere una degradacion de calidad muy contenida.

El interes del modelo reside en su combinacion poco habitual: es un VLM de 8B con contexto y arquitectura heredados de Qwen3-VL, especializado en descripcion de imagenes, con capacidad de generar captions de contenido adulto y con los rechazos practicamente eliminados, distribuido ademas en GGUF para inferencia local. La licencia declarada es Apache 2.0, aunque el modelo incorpora pesos derivados de un LoRA cuyo origen original fue eliminado de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), base Qwen3-VL con merge de LoRA y ablacion ARA; detalles de capas y atencion no disponibles |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 23,6 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL, un transformer multimodal que procesa pares imagen-texto y genera texto, tal como indica el pipeline image-text-to-text. El modelo base zlab-princeton/Vero-Qwen3I-8B fue entrenado con 600.000 muestras de RL curadas, extraidas de 59 datasets y organizadas en 6 categorias de razonamiento visual, lo que apunta a un entrenamiento por refuerzo orientado a mejorar la calidad del razonamiento sobre imagenes mas alla del simple captioning supervisado.

Sobre ese modelo, kalle07 realizo un merge con un LoRA de captioning NSFW (peso 0,8) procedente de Qwen3-VL-8B-NSFW-Caption-V4.5, cuyo repositorio original fue eliminado y solo persiste en mirrors como el de mradermacher. Posteriormente aplico Heretic v2.1.0 con el metodo Arbitrary-Rank Ablation, una tecnica que identifica y elimina direcciones de activacion asociadas a comportamientos de rechazo sin requerir reentrenamiento. El autor reporta una divergencia KL de 0,004 frente al original, lo que indica que la distribucion de salida se mantiene muy proxima salvo en la supresion de rechazos. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de RLHF o DPO mas alla del RL del modelo base.

## Capacidades

- Generacion de texto e interpretacion de imagenes (image-text-to-text) con razonamiento visual en 6 categorias segun el modelo base.
- Descripcion detallada de imagenes (captioning), incluyendo contenido NSFW tras el merge con el LoRA especializado.
- Reduccion drastica de rechazos: 6/100 en la prueba interna del autor frente a 89/100 del original.
- Alta sensibilidad a system prompts, segun la model card, lo que permite adaptar tono, formato y nivel de detalle.
- Soporte conversacional multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como API.
- Capacidades de tool calling y function calling: no disponibles en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponibles de forma explicita; el entrenamiento RL del base sugiere razonamiento visual, pero no se documenta uso agentico.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion automatica de imagenes en catalogos y archivos: el modelo puede generar captions detallados de imagenes de forma masiva, aprovechando su entrenamiento especifico en captioning y su tolerancia a contenido sensible, util en archivos de arte o fotografia.
- Etiquetado de datasets multimodales: para construir corpus de entrenamiento de otros modelos, el VLM puede anotar imagenes con descripciones ricas sin bloquearse ante contenido adulto, algo que los modelos alineados rechazan.
- Moderacion y analisis de contenido para adultos: en plataformas que necesitan clasificar y describir imagenes NSFW de forma automatizada, el modelo puede operar sin los rechazos que invalidarian el pipeline.
- Investigacion sobre alineacion y abliteration: sirve como caso de estudio reproducible de Heretic y ARA, permitiendo comparar calidad y tasas de rechazo frente al modelo original con una divergencia KL medida de 0,004.
- Generacion de descripciones para accesibilidad: producir texto alternativo detallado para imagenes en aplicaciones, con la ventaja de un modelo de 8B que cabe en hardware de consumo en GGUF.
- Prototipado local de asistentes visuales: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo sin GPU de datacenter, util para demos y pruebas de concepto de asistentes que comentan imagenes.
- Analisis de imagenes en entornos con requisitos de privacidad: al poder correr en local, permite procesar imagenes sensibles sin enviarlas a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es interna: tasa de rechazo de 6/100 frente a 89/100 del modelo original y divergencia KL de 0,004 respecto a este. No hay datos de MMLU, HumanEval, GSM8K ni de benchmarks multimodales como MMMU o DocVQA.

## Requisitos de hardware

- VRAM estimada: en FP16, unos 16,4 GB solo para pesos (8,19B x 2 bytes), mas overhead de KV cache y del encoder visual; en cuantizaciones GGUF de 8 bits, aproximadamente 9-10 GB; en Q4, en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo y batch; RTX 4090 (24 GB) para FP16 ajustado o Q8; RTX 3090/4080 (16-24 GB) para Q8; GPUs de 8-12 GB para Q4.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores con cuantizaciones Q4/Q5; en 8 GB solo con cuantizaciones agresivas y contexto reducido.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) por el formato GGUF; vLLM y TGI requieren conversion a safetensors y no se confirman compatibles con el encoder visual en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vero-Qwen3-8B_VL_Heresy_ARA_gguf | 8,19B | no disponible | VLM captioning, sin rechazos, GGUF | Apache 2.0 | Hugging Face (kalle07) |
| zlab-princeton/Vero-Qwen3I-8B | ~8B | no disponible | VLM con RL en razonamiento visual | no disponible en la informacion | Hugging Face |
| Qwen3-VL-8B (familia base) | ~8B | no disponible | VLM generalista | no disponible en la informacion | Hugging Face |
| Qwen3-VL-8B-NSFW-Caption-V4.5 (via mirror) | ~8B | no disponible | Captioning NSFW | no disponible en la informacion | Solo mirrors (original eliminado) |

La comparativa cuantitativa de rendimiento no es posible con la informacion disponible; las diferencias documentadas se limitan al enfoque (abliterated frente a alineado) y al formato de distribucion (GGUF frente a safetensors).

## Limitaciones y advertencias

- Contenido no apto para todos los publicos: el modelo esta disenado para generar y describir contenido NSFW; el tag not-for-all-audiences lo confirma.
- Riesgo de alucinacion: como todo VLM, puede describir elementos inexistentes en la imagen; la ablacion ARA no corrige este comportamiento.
- La ablacion de rechazos puede degradar la robustez ante prompts adversarios y reducir la calidad en tareas que dependen de negativas matizadas; el autor solo reporta una divergencia KL de 0,004 en su prueba.
- Procedencia del LoRA NSFW: el repositorio original fue eliminado y solo se conserva en mirrors, lo que dificulta la trazabilidad y auditoria de los datos de entrenamiento.
- Licencia: se declara Apache 2.0, pero la cadena de modelos base y del LoRA eliminado puede plantear dudas sobre la validez de la licencia para uso comercial; conviene revisar las licencias de los modelos base antes de un despliegue productivo.
- Idiomas soportados no documentados; el rendimiento fuera del ingles es incierto.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con documentos o conversaciones largas.
- Sin benchmarks publicados: no hay evidencia independiente de calidad en tareas estandar.
- Uso responsable: la generacion de descripciones de contenido adulto debe cumplir la legislacion aplicable y las politicas de la plataforma de destino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kalle07/Vero-Qwen3-8B_VL_Heresy_ARA_gguf
- Modelo base Vero-Qwen3I-8B: https://huggingface.co/zlab-princeton/Vero-Qwen3I-8B
- LoRA NSFW original (eliminado): https://huggingface.co/thesby/Qwen3-VL-8B-NSFW-Caption-V4.5
- Mirror GGUF del LoRA NSFW: https://huggingface.co/mradermacher/Qwen3-VL-8B-NSFW-Caption-V4.5-GGUF
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
