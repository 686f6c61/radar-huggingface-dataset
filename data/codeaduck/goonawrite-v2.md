# codeaduck/goonawrite-v2

## Resumen

goonawrite-v2 es un adaptador LoRA (en concreto, DoRA, según el nombre interno `qwen25_7b_dora_orpo_3000`) publicado por el usuario codeaduck sobre el modelo base Qwen/Qwen2.5-7B. Se trata de un ajuste fino orientado a generación de texto conversacional, entrenado con la técnica ORPO (Monolithic Preference Optimization without Reference Model) mediante la librería TRL de Hugging Face. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo completo.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). Al ser un adaptador PEFT, su relevancia práctica depende enteramente del modelo base: no es un modelo autónomo y requiere cargar Qwen2.5-7B junto con el adaptador para funcionar.

La información publicada por el autor es mínima: no se detalla el dataset de entrenamiento, no hay resultados de benchmarks, no se especifica la licencia del adaptador y no se documentan los idiomas objetivo. El nombre del repositorio sugiere un propósito de escritura creativa o generación de ficción, pero esto no se confirma en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B) con adaptador DoRA/LoRA |
| Parametros totales | ~7.600 millones (modelo base Qwen2.5-7B); el adaptador ocupa 0,3 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B; extensible a 131.072 con RoPE scaling (no verificado en este adaptador) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes (4/8 bits) |
| Idiomas soportados | no disponibles (el modelo base Qwen2.5 soporta 29 idiomas, incluido el castellano) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar; el modelo base Qwen2.5-7B usa Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B, un transformer decoder-only con atención de múltiples cabezas con RoPE, normalización RMSNorm, activación SwiGLU y atención con query/key/value bias. Qwen2.5-7B fue preentrenado por Alibaba con hasta 18 billones de tokens según la documentación oficial de la familia, aunque ese dato corresponde al modelo base y no al adaptador.

El ajuste fino emplea ORPO, un método de optimización de preferencias monolítico que combina el objetivo de modelado de lenguaje con una penalización odds-ratio, eliminando la necesidad de un modelo de referencia separado (a diferencia de DPO). Según la model card, el entrenamiento se realizó con TRL 1.17.1, PEFT 0.21.2, Transformers 5.22.2, PyTorch 2.14.1+cu130 y Datasets 5.1.0. El nombre del checkpoint (`..._orpo_3000`) sugiere 3.000 pasos de entrenamiento, pero no se confirma en la documentación. No se especifica el dataset, el número de tokens de entrenamiento ni la composición de los pares de preferencia.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B.
- Razonamiento y matemáticas de nivel medio, según las capacidades del modelo base.
- Generación de código en múltiples lenguajes (capacidad del base, no verificada tras el ajuste).
- Soporte de tool calling / function calling (capacidad nativa de Qwen2.5, potencialmente preservada).
- Capacidades multilingües del modelo base (29 idiomas), sin confirmación de que el ajuste las mantenga.
- Modo de razonamiento extendido o "thinking": no disponible.
- Visión y audio: no disponibles (Qwen2.5-7B es solo texto).
- El nombre del repositorio sugiere especialización en escritura creativa o ficción, pero no se documenta explícitamente.

## Casos de uso

- Escritura creativa y generación de ficción: el nombre del modelo y el ajuste con ORPO sugieren un uso orientado a narrativa y prosa; se usaría cargando Qwen2.5-7B más el adaptador y generando texto con prompts narrativos.
- Asistente conversacional especializado: el ajuste de preferencias con ORPO puede mejorar la calidad de las respuestas en diálogo multi-turno, aprovechando la ventana de 32.768 tokens del base para conversaciones largas.
- Prototipado rápido de adaptadores personalizados: al ser un adaptador de 0,3 GB, permite experimentar con estilos de generación sin desplegar un modelo completo adicional.
- Generación de contenido editorial: redacción de borradores, resúmenes o reescritura de textos, siempre que el adaptador haya sido entrenado para ello (no confirmado).
- Investigación en alineación: útil como ejemplo reproducible de entrenamiento ORPO con TRL sobre un modelo de 7B, para estudiar el efecto del ajuste de preferencias.
- Fine-tuning incremental: el adaptador puede combinarse con otros adaptadores PEFT o servir de punto de partida para ajustes posteriores sobre Qwen2.5-7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del modelo base en FP16: aproximadamente 15-16 GB (7.600 M parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM en cuantización de 8 bits (bitsandbytes): aproximadamente 8-9 GB.
- VRAM en cuantización de 4 bits (GPTQ/AWQ/bitsandbytes): aproximadamente 5-6 GB.
- El adaptador en sí requiere muy poca memoria adicional (0,3 GB en disco; en memoria, los pesos LoRA son una fracción de eso).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 3060 12 GB o superior para 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits cabe en tarjetas de 8 GB o más; en FP16 requiere al menos 16 GB.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (con soporte LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF).
- Latencia y throughput: no disponibles para este adaptador; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goonawrite-v2 (este) | ~7,6 B (base) + adaptador | 32.768 (base) | Adaptador DoRA/ORPO sobre Qwen2.5-7B | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-7B (base) | 7,6 B | 32.768 (hasta 131.072) | Modelo completo | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 (hasta 131.072) | Modelo completo ajustado con SFT/RLHF | Apache 2.0 | Hugging Face, muy popular |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Modelo completo ajustado | Apache 2.0 | Hugging Face, muy popular |

No hay datos de rendimiento del adaptador que permitan comparar calidad; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La licencia del adaptador no está especificada ("licence: license" en la model card); antes de un uso comercial debe confirmarse con el autor y verificarse la licencia del modelo base (Apache 2.0 en Qwen2.5-7B).
- No se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos introducidos por el ajuste.
- Riesgo de alucinación inherente a los modelos de 7B, no mitigado de forma documentada.
- El adaptador no es un modelo autónomo: requiere descargar Qwen2.5-7B (unos 15 GB en FP16) además del adaptador.
- Sin resultados de benchmarks ni evaluación publicada; no hay evidencia de que el ajuste mejore al base en tareas concretas.
- El nombre del repositorio sugiere un dominio de escritura creativa, pero no se confirma el propósito ni la calidad del ajuste.
- Sin información sobre idiomas: el ajuste podría degradar el multilingüismo del base si el dataset era monolingüe.
- Creado y actualizado en noviembre de 2026, con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El ejemplo de la model card usa `model="None"`, lo que indica que la documentación no está verificada ni es funcional tal cual.

## Enlaces

- [Hugging Face: codeaduck/goonawrite-v2](https://huggingface.co/codeaduck/goonawrite-v2)
- [Modelo base: Qwen/Qwen2.5-7B](https://huggingface.co/Qwen/Qwen2.5-7B)
- [Paper ORPO (arXiv:2403.07691)](https://huggingface.co/papers/2403.07691)
- [Repositorio TRL](https://github.com/huggingface/trl)
