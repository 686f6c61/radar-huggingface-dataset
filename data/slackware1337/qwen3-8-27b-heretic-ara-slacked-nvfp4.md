# Slackware1337/Qwen3.8-27B-Heretic-ARA-Slacked-NVFP4

## Resumen

Este repositorio contiene una cuantización NVFP4 del modelo Qwen3.8-27B tras ser sometido a un proceso de abliteration mediante el método ARA (Arbitrary-Rank Ablation) de Heretic. El resultado es un modelo de 27 000 millones de parámetros (aunque el archivo safetensors de este repo registra 15,6 mil millones de parámetros, probablemente por la cuantización) que ha sido modificado para eliminar casi por completo los rechazos a peticiones del usuario. La abliteration reduce la tasa de refusal de 99/100 a 3/100, manteniendo una divergencia KL de 0,0599 respecto al original, lo que indica que el comportamiento general del modelo se conserva en gran medida.

El modelo base, Qwen3.8-27B, es un modelo de lenguaje causal con codificador de visión, de la familia Qwen3.8, con una arquitectura híbrida de atención lineal y completa. Tiene una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 millón. Este repo concreto aplica la cuantización NVFP4 (punto flotante de 4 bits) para reducir el tamaño de los pesos, lo que permite ejecutarlo en hardware más modesto. Es una opción interesante para investigadores que necesitan un modelo capaz de responder a todo tipo de prompts, incluidos los que suelen ser rechazados por modelos alineados, y que además requiere menos VRAM gracias a la cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model híbrido con Vision Encoder (atención lineal Gated DeltaNet + atención completa Gated Attention) |
| Parametros totales | 15.617.946.352 (según safetensors del repo; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | NVFP4 (4 bits de punto flotante) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado NVFP4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida de atención: de las 64 capas, 16 son de atención completa (Gated Attention) y 48 de atención lineal (Gated DeltaNet), organizadas en bloques de 4 capas (3 de atención lineal + 1 de atención completa). Esta combinación permite manejar contextos muy largos con menor coste computacional. El modelo fue entrenado en dos etapas: pre-training y post-training, con soporte de visión (imágenes y vídeos) y modo de pensamiento flexible.

El proceso de abliteration aplicado en este repo utiliza el método ARA (Arbitrary-Rank Ablation) de Heretic, con parámetros específicos (start_layer_index=0, end_layer_index=61, preserve_good_behavior_weight=0,4487, steer_bad_behavior_weight=0,0005, overcorrect_relative_weight=1,1383, neighbor_count=7). Este proceso elimina selectivamente las direcciones en el espacio de activaciones asociadas con comportamientos de rechazo o redirección, manteniendo la utilidad general del modelo. La cuantización NVFP4 se aplica posteriormente para reducir el tamaño de los pesos a 4 bits por parámetro.

## Capacidades

- Generación de texto en lenguaje natural, con razonamiento complejo y matemáticas.
- Generación de código y comprensión de código.
- Comprensión de imágenes y vídeos (visión nativa, según el modelo base).
- Modo de pensamiento (thinking mode) activado por defecto, desactivable por petición.
- Control de esfuerzo de razonamiento (`reasoning_effort`).
- Preservación del contexto de razonamiento en conversaciones (`preserve_thinking`).
- Soporte de agentes y tareas de múltiples pasos (long-horizon agentic tasks).
- Capacidad de tool calling y function calling (según el modelo base).
- Multilingüe (aunque no se especifican idiomas concretos en la información).
- Respuestas sin rechazos: el abliteration reduce la tasa de refusal de 99/100 a 3/100.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar el comportamiento de un LLM sin los sesgos de rechazo, lo que facilita el análisis de sesgos subyacentes y la evaluación de técnicas de mitigación.
- Generación de contenido creativo y narrativo: al no rechazar temas sensibles, puede producir historias, diálogos y escenarios que otros modelos evitan.
- Desarrollo de agentes autónomos: con su soporte para tool calling y planificación de múltiples pasos, es adecuado para sistemas que deben ejecutar tareas complejas sin interrupciones por rechazos.
- Procesamiento de documentos con contexto largo: su ventana de 262K tokens permite analizar informes, libros o código extenso en una sola pasada.
- Aplicaciones de visión-lenguaje: al ser un modelo multimodal, puede responder preguntas sobre imágenes y vídeos, útil para anotación automática o asistentes visuales.
- Entornos de desarrollo con recursos limitados: gracias a la cuantización NVFP4, cabe en GPUs con 16 GB de VRAM, lo que permite desplegarlo en hardware de consumo o en entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo cuantizado en la información disponible. La model card del modelo base (Qwen3.8-27B) incluye una tabla de benchmarks que compara con Qwen3.6-27B, Qwen3.7-Plus y Muse Glimmer-30B, pero los valores numéricos no están visibles en el texto extraído. Por tanto, no se pueden reportar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización NVFP4, el modelo ocupa aproximadamente 13,5 GB (27B * 0,5 bytes/parámetro) más overhead, por lo que se necesita al menos 16 GB de VRAM para ejecutar con holgura.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con al menos 16 GB de memoria.
- Sí cabe en GPUs de consumo: una RTX 4060 Ti de 16 GB puede ejecutarlo, aunque con menor velocidad.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, TokenSpeed, llama.cpp y Ollama (si se convierte a GGUF). El repo incluye archivos safetensors, por lo que es necesario convertirlos o usar frameworks que soporten NVFP4.
- Latencia y throughput: no se han publicado valores específicos para este modelo cuantizado. El repo friendli.ai menciona que los valores de throughput provienen de validaciones con contexto 4K, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No hay datos de benchmarks para comparar directamente, pero se puede comparar a nivel de arquitectura y características:

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (extensible 1M) | Híbrida atención lineal + completa | Apache 2.0 |
| Qwen3.8-27B-Heretic-ARA (este) | 27B (cuantizado a 15.6B en safetensors) | 262K (extensible 1M) | Híbrida + abliteration | Apache 2.0 |
| Qwen3.6-27B | 27B | No disponible | No disponible | Apache 2.0 |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar rendimiento numérico.

## Limitaciones y advertencias

- El abliteration elimina el comportamiento de rechazo, lo que implica que el modelo puede generar contenido inapropiado, ofensivo o peligroso si se le solicita. Debe usarse con precaución y en entornos controlados.
- La cuantización NVFP4 puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en precisión completa, aunque la divergencia KL medida es baja (0,0599).
- El modelo no ha sido evaluado de forma exhaustiva en todos los benchmarks; no se tienen datos de rendimiento en tareas estándar.
- Los idiomas soportados no se especifican; aunque Qwen suele ser multilingüe, no se puede confirmar para este repo.
- La licencia Apache 2.0 permite uso comercial, pero hay que tener en cuenta que el modelo base tiene sus propias condiciones (aunque también Apache 2.0).
- El proceso de abliteration puede no ser perfecto: algunos prompts podrían seguir provocando rechazos o redirecciones (3 de cada 100 en la evaluación del autor).

## Enlaces

- Repositorio de este modelo: https://huggingface.co/Slackware1337/Qwen3.8-27B-Heretic-ARA-Slacked-NVFP4
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo GGUF del mismo modelo: https://huggingface.co/Slackware1337/Qwen3.8-27B-Heretic-ARA-Slacked-GGUF
- Repo GGUF de dawncr0w (variante): https://huggingface.co/dawncr0w/Qwen3.8-27B-Heretic-ARA-ModelOpt-NVFP4-GGUF
- Página de vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Página de friendli.ai (modelo similar): https://friendli.ai/models/lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL
- LLM Explorer: https://llm-explorer.com/model/trohrbaugh%2FQwen3.8-27B-heretic-ara,3lOkoblJbLCrW6LcRlJIk
