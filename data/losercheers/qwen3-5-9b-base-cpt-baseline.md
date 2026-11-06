# losercheers/Qwen3.5-9B-Base-CPT-Baseline

## Resumen

Qwen3.5-9B-Base-CPT-Baseline es una publicacion no oficial del modelo base Qwen3.5-9B-Base, subida por el usuario `losercheers` bajo la licencia Apache 2.0. Se trata de un checkpoint de tipo *continued pre-training* (CPT) presentado como linea base, es decir, un punto de partida sobre el que medir experimentos posteriores de entrenamiento continuado. El modelo original lo desarrolla el equipo Qwen de Alibaba y esta disenado como modelo fundacional multimodal, no como asistente listo para uso directo.

La arquitectura es un transformer causal con codificador de vision integrado, que combina capas de atencion lineal (Gated DeltaNet) con capas de atencion completa (Gated Attention) en un patron hibrido de 8 bloques. El modelo declara 9B de parametros, 32 capas, dimension oculta de 4096 y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. El repositorio ocupa 17,9 GB en formato safetensors.

Su relevancia es doble: por un lado, documenta el estado del arte de la familia Qwen3.5 en el tramo de 9B con fusion temprana de vision y lenguaje; por otro, al ser una publicacion de terceros con apenas 27 descargas y cero *likes*, debe tratarse con cautela, ya que no procede del repositorio oficial de Qwen y no hay garantia sobre el proceso exacto de CPT aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo card no detalla variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | 201 idiomas y dialectos segun el modelo card original de Qwen3.5 |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un diseno hibrido poco habitual. El *hidden layout* se organiza en 8 bloques, cada uno compuesto por tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention. Las capas lineales usan 32 cabezas para V y 16 para QK con dimension de cabeza 128; las capas de atencion completa usan 16 cabezas para Q y 4 para KV con dimension 256 y RoPE de 64 dimensiones. La FFN tiene dimension intermedia 12.288 y el *embedding* de tokens alcanza 248.320 entradas (con *padding*), lo que explica el gran tamano del vocabulario y la optimizacion mencionada para LoRA sobre embeddings.

El entrenamiento original de Qwen3.5 combina pre-entrenamiento y post-entrenamiento con fusion temprana de tokens multimodales, segun el modelo card. Se menciona entrenamiento con *multi-step MTP* (multi-token prediction) y un escalado de RL sobre entornos multiagente. Los tokens de control `<|im_start|>` y `<|im_end|>` fueron entrenados para permitir PEFT estilo LoRA con la plantilla de chat oficial. No se dispone de informacion especifica sobre el proceso de CPT aplicado en esta publicacion concreta, ni sobre el volumen o composicion del dataset adicional utilizado por `losercheers`.

## Capacidades

- Generacion de texto y razonamiento de proposito general en el tramo de 9B.
- Comprension de imagen y texto de forma nativa (pipeline `image-text-to-text`), gracias al codificador de vision integrado.
- Generacion de codigo y matematicas, segun las capacidades declaradas de la familia Qwen3.5.
- Soporte de *tool calling* y *function calling* heredado del modelo base.
- Razonamiento multi-paso y uso en entornos de agentes.
- Cobertura multilingue amplia: 201 idiomas y dialectos declarados.
- Compatibilidad con la plantilla de chat oficial mediante tokens de control, lo que facilita el ajuste fino con LoRA.
- Modo *thinking*: no confirmado en la informacion disponible para este checkpoint base.

## Casos de uso

- Punto de partida para *continued pre-training*: el checkpoint esta pensado como linea base para experimentos de CPT; un equipo puede partir de el y medir la degradacion o mejora frente a su propio corpus de dominio.
- Ajuste fino con LoRA sobre dominios verticales: la presencia de tokens de control entrenados permite adaptar el modelo a un dominio (legal, medico, financiero) sin reentrenar los embeddings del vocabulario de 248.320 entradas.
- Investigacion en arquitecturas hibridas: util para estudiar el comportamiento de Gated DeltaNet frente a atencion completa en tareas de contexto largo, dado el contexto nativo de 262.144 tokens.
- Experimentos de *in-context learning*: el modelo card indica explicitamente que el uso previsto incluye experimentos de ICL, apropiado para evaluar capacidad de generalizacion con pocos ejemplos.
- Procesamiento de documentos largos con imagen: al aceptar entrada imagen-texto, puede emplearse en tareas de comprension de documentos escaneados o tablas, aunque la validacion practica queda del lado del investigador.
- Base para *benchmarking* interno: sirve como referencia contra la que comparar adaptaciones posteriores del mismo autor o de terceros.
- Prototipado de pipelines multimodales con vLLM o SGLang: el modelo card original confirma compatibilidad con estos motores, lo que permite desplegarlo en entornos de investigacion con *throughput* alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. El modelo card original de Qwen3.5 afirma paridad con Qwen3 y mejora sobre Qwen3-VL en razonamiento, codigo, agentes y comprension visual, pero no se aportan cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 18 GB para los pesos (8,95B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 24 GB o mas para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB de pesos, aunque no se ofrecen variantes cuantizadas en el repositorio.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 5-6 GB de pesos, si se generan variantes GGUF/AWQ por cuenta propia.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para contexto largo completo (262K tokens); RTX 4090 24 GB para contexto moderado en BF16.
- Cabe en GPU de consumo: si, en RTX 4090 24 GB en BF16 con contexto limitado; en RTX 3090 24 GB de forma similar; en GPUs de 16 GB solo mediante cuantizacion.
- Opciones de despliegue: transformers, vLLM, SGLang (segun el modelo card original); llama.cpp/Ollama no confirmados para esta arquitectura hibrida con vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Base-CPT-Baseline (este) | 8,95B | 262.144 (ext. 1.010.000) | Apache 2.0 | Si (imagen-texto) | Hugging Face, autor tercero |
| Qwen3.5-9B-Base (oficial) | 9B | 262.144 (ext. 1.010.000) | Apache 2.0 | Si | Hugging Face, repositorio oficial Qwen |
| Qwen3-VL (familia) | no disponible | no disponible | no disponible | Si | Hugging Face |
| Qwen3 (familia, tramo 8-9B) | no disponible | no disponible | no disponible | No | Hugging Face |

La comparativa directa con modelos de otros fabricantes en el tramo de 9B no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Publicacion de terceros: el repositorio pertenece a `losercheers`, no al equipo oficial de Qwen; no hay garantia sobre la integridad del checkpoint ni sobre el proceso de CPT aplicado.
- Modelo base, no asistente: el modelo card indica que el uso previsto es ajuste fino, ICL e investigacion, no interaccion directa; no debe desplegarse como chatbot sin post-entrenamiento.
- Trazabilidad limitada: solo 27 descargas y 0 *likes*; sin discusiones ni validacion de la comunidad.
- Riesgo de alucinacion: inherente a los modelos base sin alineamiento; no hay datos de evaluacion de fidelidad.
- Sesgos: no documentados para este checkpoint; los sesgos del modelo original no se detallan en la informacion disponible.
- Idiomas: aunque el modelo original declara 201 idiomas, no se especifica el rendimiento real de este checkpoint CPT en cada uno.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una publicacion no oficial conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Contexto: aunque se declaran 262.144 tokens nativos, el rendimiento real a esa longitud no esta validado para este checkpoint.
- Cuantizaciones: no se ofrecen variantes GGUF, AWQ ni GPTQ en el repositorio, lo que limita el despliegue en hardware modesto sin conversion manual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/losercheers/Qwen3.5-9B-Base-CPT-Baseline
- Discusiones: https://huggingface.co/losercheers/Qwen3.5-9B-Base-CPT-Baseline/discussions
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
