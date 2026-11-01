# ArchiveStudio/Qwen2-7B-Instruct

## Resumen

Qwen2-7B-Instruct es la variante alineada para instrucciones del modelo base Qwen2-7B, desarrollado por el equipo Qwen de Alibaba Cloud. Este repositorio concreto, publicado por el usuario ArchiveStudio, redistribuye los pesos del modelo original bajo licencia Apache 2.0. Se trata de un transformer decoder de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) orientado a generación de texto conversacional, con soporte declarado de hasta 131.072 tokens de contexto mediante extrapolación YaRN.

El modelo resuelve el problema de disponer de un asistente conversacional de tamano medio con buen rendimiento en inglés, código y matemáticas, que puede desplegarse en hardware asequible. Frente a la generación anterior (Qwen1.5-7B-Chat), la serie Qwen2 introduce mejoras sustanciales en benchmarks de código (HumanEval 79,9 frente a 46,3) y en calidad conversacional (MT-Bench 8,41 frente a 7,60).

Es relevante ahora porque la familia Qwen2 consolidó el estándar de modelos abiertos de 7B con licencia permisiva, tokenizer multilingüe mejorado y compatibilidad directa con `transformers>=4.37.0`, vLLM y el ecosistema de despliegue habitual. No obstante, esta ficha se refiere a una republicación de terceros, no al repositorio oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con activación SwiGLU, sesgo en QKV y group query attention (GQA) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos; hasta 131.072 con escalado YaRN |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | inglés declarado en la model card; tokenizer adaptado a múltiples lenguajes naturales y código |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15,2 GB |
| Vocabulario | 152.064 tokens |
| Modelo base | Qwen/Qwen2-7B |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso con activación SwiGLU, sesgo en las proyecciones QKV y group query attention, según detalla la model card. Incorpora un tokenizer mejorado adaptado a múltiples lenguajes naturales y a código, con un vocabulario de 152.064 entradas. El modelo base Qwen2-7B se preentrenó con un volumen elevado de datos (la model card no especifica el número exacto de tokens ni la composición del dataset) y posteriormente se aplicó un post-entrenamiento en dos fases: supervised fine-tuning (SFT) y direct preference optimization (DPO).

La innovación técnica destacable es el soporte de contexto largo mediante YaRN (paper arXiv:2309.00071), que permite extender la ventana efectiva desde 32.768 hasta 131.072 tokens configurando `rope_scaling` con factor 4.0 en el `config.json`. La model card advierte de que vLLM solo soporta YaRN estático en el momento de publicación, lo que puede degradar el rendimiento en textos cortos si se activa permanentemente; recomienda habilitarlo solo cuando se procesen contextos largos. No se documentan en la información disponible otras técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`) y rol de sistema.
- Razonamiento y comprensión del lenguaje: MMLU 70,5 y MMLU-Pro 44,1 según la evaluación del autor.
- Generación de código: HumanEval 79,9, con soporte para lenguajes de programación gracias al tokenizer adaptado a código.
- Matemáticas y razonamiento formal: TheoremQA 25,3.
- Procesamiento de contextos largos de hasta 131.072 tokens mediante YaRN.
- Capacidad multilingüe: el tokenizer está adaptado a múltiples lenguajes, aunque la model card solo declara inglés en el campo `language`.
- Integración con vLLM para servir una API compatible con OpenAI (`/v1/chat/completions`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible (modelo solo de texto).

## Casos de uso

- Asistente conversacional de atención al cliente: el modelo gestiona diálogos multi-turno con rol de sistema y puede mantener contexto de conversaciones extensas gracias a la ventana de 131.072 tokens con YaRN, útil para hilos de soporte con historial largo.
- Generación de código en pipelines de desarrollo: con HumanEval 79,9, es adecuado para autocompletado, generación de tests y refactorización asistida; se integra vía API compatible con OpenAI servida por vLLM.
- Procesamiento de documentos largos: resumen y extracción de información de contratos, informes o artículos que superan los 32.768 tokens, activando `rope_scaling` con factor 4.0.
- Chatbot interno para desarrolladores: despliegue con vLLM en una GPU de 24 GB (por ejemplo, RTX 4090) para responder dudas técnicas sobre una base de código.
- Generación aumentada por recuperación (RAG): el contexto largo permite inyectar varios fragmentos recuperados sin truncamiento agresivo, reduciendo la pérdida de información en la respuesta.
- Prototipado e investigación: fine-tuning adicional sobre el modelo base o evaluación de técnicas de alineación, dado que la licencia Apache 2.0 permite uso comercial y modificación.
- Traducción y asistencia de escritura en inglés: la model card declara inglés como idioma principal, por lo que es adecuado para tareas de redacción y corrección en ese idioma.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Dataset | Llama-3-8B-Instruct | Yi-1.5-9B-Chat | GLM-4-9B-Chat | Qwen1.5-7B-Chat | Qwen2-7B-Instruct |
|---|---|---|---|---|---|
| MMLU | 68,4 | 69,5 | **72,4** | 59,5 | 70,5 |
| MMLU-Pro | 41,0 | no disponible | no disponible | 29,1 | **44,1** |
| GPQA | **34,2** | no disponible | no disponible | 27,8 | 25,3 |
| TheoremQA | 23,0 | no disponible | no disponible | 14,1 | **25,3** |
| MT-Bench | 8,05 | 8,20 | 8,35 | 7,60 | **8,41** |
| HumanEval | 62,2 | 66,5 | 71,8 | 46,3 | **79,9** |
| MBPP | **67,9** | no disponible | no disponible | no disponible | no disponible |

La model card original se interrumpe en la fila de MBPP, por lo que no se dispone del resto de resultados de esa tabla. No se han publicado en la información disponible datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB de pesos, con margen adicional para contexto.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB de pesos, viable en GPUs consumer de 8 GB con contexto moderado.
- GPUs recomendadas: A100 40/80 GB o H100 para serving de alta concurrencia y contextos largos; RTX 4090 (24 GB) para FP16 en single-GPU; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en FP16 y en GPUs de 8-12 GB con cuantización 4 bits (siempre que se generen pesos GGUF/AWQ, no incluidos en este repositorio).
- Opciones de despliegue: vLLM (`vllm>=0.4.3`, recomendado por el autor, con servidor compatible con OpenAI), `transformers>=4.37.0` para uso directo; llama.cpp, Ollama y TGI no están documentados en la información proporcionada para este repositorio concreto.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | MT-Bench | Licencia |
|---|---|---|---|---|---|---|
| Qwen2-7B-Instruct | 7,6B | 32.768 (131.072 con YaRN) | 70,5 | 79,9 | 8,41 | Apache 2.0 |
| Llama-3-8B-Instruct | 8B | 8.192 | 68,4 | 62,2 | 8,05 | Llama 3 Community License |
| Yi-1.5-9B-Chat | 9B | no disponible en la información | 69,5 | 66,5 | 8,20 | Apache 2.0 |
| GLM-4-9B-Chat | 9B | no disponible en la información | 72,4 | 71,8 | 8,35 | no disponible en la información |

Qwen2-7B-Instruct destaca en código (HumanEval 79,9) y calidad conversacional (MT-Bench 8,41) frente a alternativas de tamano similar, y ofrece la ventana de contexto más amplia de la comparativa gracias a YaRN. En MMLU queda por debajo de GLM-4-9B-Chat y en GPQA por debajo de Llama-3-8B-Instruct. La licencia Apache 2.0 es más permisiva que la de Llama 3.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; como todo modelo preentrenado con datos web, es probable que reproduzca sesgos de esos datos.
- Riesgo de alucinación: inherente a los modelos generativos; la model card no incluye evaluaciones de factualidad ni de tasas de alucinación.
- Limitaciones de idioma: la model card solo declara inglés en el campo `language`; el rendimiento en castellano no está evaluado y puede ser inferior.
- Contexto largo: activar YaRN de forma estática en vLLM puede degradar el rendimiento en textos cortos, según advierte el propio autor; debe habilitarse solo cuando se necesiten contextos largos.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero esta ficha se refiere a una republicación por ArchiveStudio, no al repositorio oficial; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- Repositorio de terceros: 0 likes y 572 descargas en el momento de la consulta; no hay garantía de mantenimiento ni de que los pesos coincidan bit a bit con el modelo oficial de Qwen.
- Sin datos de tool calling ni de capacidades de agente: no debe asumirse su disponibilidad sin verificación empírica.
- Requiere `transformers>=4.37.0`; versiones anteriores fallan con `KeyError: 'qwen2'`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ArchiveStudio/Qwen2-7B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2-7B
- Blog de Qwen2: https://qwenlm.github.io/blog/qwen2/
- GitHub de Qwen2: https://github.com/QwenLM/Qwen2
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Repositorio de vLLM: https://github.com/vllm-project/vllm/
