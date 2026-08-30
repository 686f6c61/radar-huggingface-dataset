# Deritak/Qwen3.8-Flash-Next-heretic-2-ROCMFP4

## Resumen

Deritak/Qwen3.8-Flash-Next-heretic-2-ROCMFP4 es una versión modificada del modelo multimodal Qwen3.8-Flash-Next de Alibaba, sometida a un proceso de "abliteration" (eliminación de rechazos) mediante la herramienta Heretic en un fork personalizado. El resultado es un modelo "decensored" que responde a prácticamente todas las peticiones (0/100 rechazos frente a 99/100 del original), manteniendo una divergencia KL de 0.0818 respecto al modelo base. Además, el autor ha aplicado una cuantización mixta ROCmFP4 específicamente optimizada para la APU AMD AI 395 Pro Max+ (Strix Halo), lo que permite ejecutarlo en hardware de consumo con memoria unificada.

El modelo base Qwen3.8-Flash-Next es un MoE de 125B parámetros principales más 51B de embeddings n-gram, con 6B parámetros activos por token, basado en la arquitectura Qwen4 experimental: atención híbrida con Qwen Sparse Attention (QSA), Gated DeltaNet, Gated Residual y N-gram Embedding. Soporta un contexto de 262K tokens y entrada multimodal (imagen y texto). Esta versión heretic-2 está publicada en formato GGUF cuantizado, con un tamaño de repositorio de 96.5 GB, y requiere un fork específico de llama.cpp con soporte para los tipos ROCmFPx y la división de tablas n-gram por cabeza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con Qwen Sparse Attention (QSA), Gated DeltaNet, Gated Residual y N-gram Embedding |
| Parametros totales | 128.311.401.088 (dato real de safetensors; el modelo base declara 125B + 51B n-gram) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Mezcla ROCmFP4: Q4_0_ROCMFP4_FAST (MoE, atención, GDN, hyper), Q3_0_ROCMFPX (n-gram, ple), Q6_K (embeddings y salida) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | GGUF (cuantización ROCmFP4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce la arquitectura que servirá de base para Qwen4. Combina atención sparse por micro-bloques (QSA) con Gated DeltaNet, sustituyendo la atención global tradicional. El Gated Residual modula el flujo de información a través de streams residuales ensanchados mediante puertas de lectura dependientes de datos y puertas de escritura escalares por rama. Los N-gram Embeddings indexan secuencias cortas de tokens para escalar parámetros de forma eficiente en memoria, complementando al MoE principal. El entrenamiento original utilizó una receta con optimizadores Muon y AdamW aplicados a categorías específicas de pesos, sin warmup de batch size y con learning rates mayores.

Sobre esta base, el autor aplicó el proceso de abliteration con Heretic v1.3.0+custom, que modifica los pesos de proyección (attn.o_proj y mlp.down_proj) por capa para eliminar la dirección de rechazo. Los parámetros de abliteration se detallan en la model card (max_weight, min_weight, posiciones). Posteriormente, el modelo se cuantizó a una mezcla ROCmFP4 usando un fork de llama.cpp con soporte para tipos ROCmFPx y división de tablas n-gram por cabeza, optimizado para la APU AMD AI 395 Pro Max+.

## Capacidades

- Generación de texto y razonamiento multi-step, con capacidad de "thinking mode" heredada del modelo base.
- Comprensión multimodal: acepta entrada de imagen y texto (pipeline image-text-to-text).
- Procesamiento de contexto largo de hasta 262K tokens, adecuado para documentos extensos, codebases completos y conversaciones multi-turno.
- Generación de código y asistencia en programación, según las capacidades declaradas del modelo base.
- Razonamiento matemático y lógico, aunque no se proporcionan benchmarks específicos en esta versión.
- Capacidad de agente (agentic workflows) gracias al contexto largo y la arquitectura eficiente, según la documentación de Qwen.
- Al estar abliterado, no rechaza peticiones que el modelo original rechazaría (0/100 refusals), lo que permite usos sin restricciones de contenido.
- Soporte de tool calling y function calling: no especificado en la información disponible, aunque el modelo base Qwen3.8-Flash-Next es conocido por ello; no se confirma en esta ficha.

## Casos de uso

- Atención al cliente automatizada: con 262K tokens de contexto, el modelo puede gestionar conversaciones multi-turno extensas, manteniendo el historial completo y resolviendo incidencias complejas sin perder el hilo. Su naturaleza abliterada permite responder a cualquier tipo de consulta sin filtros.
- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código. Su capacidad de razonamiento y contexto largo permite trabajar con repositorios enteros. La cuantización ROCmFP4 permite ejecutarlo en estaciones de trabajo AMD con memoria unificada.
- Análisis de documentos legales o técnicos extensos: gracias a la ventana de 262K tokens, puede procesar contratos, patentes o informes de cientos de páginas en una sola pasada, extrayendo cláusulas, resumiendo y respondiendo preguntas específicas.
- Agentes autónomos de investigación: el modelo puede actuar como agente que navega por múltiples fuentes, razona sobre los resultados y produce informes. Su baja latencia en hardware AMD (gracias a la cuantización ROCmFP4) lo hace viable para despliegues locales.
- Asistente de visión por computador: al ser multimodal, puede analizar imágenes, diagramas o capturas de pantalla y generar descripciones, responder preguntas visuales o ayudar en tareas de anotación de datos.
- Prototipado rápido de aplicaciones conversacionales sin restricciones: para desarrolladores que necesitan un modelo local que no rechace temas sensibles (por ejemplo, en investigación de seguridad o generación de contenido creativo), esta versión abliterada ofrece una alternativa sin censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta versión modificada. La model card solo proporciona métricas de abliteration:

| Metrica | Este modelo | Modelo original (Qwen3.8-Flash-Next) |
| :------ | :---------: | :----------------------------------: |
| **KL divergence** | 0.0818 | 0 (por definicion) |
| **Refusals** | 0/100 | 99/100 |

El modelo base Qwen3.8-Flash-Next, según la documentación de Qwen, supera a Claude-4.6-Opus (Max) en ciertas tareas, pero no se aportan cifras concretas en esta ficha.

## Requisitos de hardware

- Según unsloth.ai, el modelo puede ejecutarse localmente con 75 GB de RAM/memoria unificada, sin necesidad de VRAM dedicada de GPU.
- Optimizado específicamente para la APU AMD AI 395 Pro Max+ (Strix Halo) con 128 GB de memoria unificada, donde alcanza hasta 36 tok/s según el repositorio de referencia (q38rocm).
- Para GPUs discretas, se requiere al menos 64-80 GB de VRAM para la cuantización ROCmFP4 (estimación basada en el tamaño del archivo GGUF de 96.5 GB, aunque la cuantización 4-bit reduce el peso en memoria).
- No es adecuado para GPUs de consumo (RTX 4090, 3090, etc.) por su tamaño; requiere hardware profesional o APUs con gran memoria unificada.
- Despliegue: requiere un fork específico de llama.cpp (rama `vulkan/qwen4exp-rocmfpx` de LaurentZuijdwijk) que soporta los tipos ROCmFPx y la división de tablas n-gram por cabeza. No es compatible con llama.cpp estándar ni con vLLM u Ollama sin modificaciones.
- Latencia y throughput: no se proporcionan datos oficiales; el repositorio de referencia indica hasta 36 tok/s en AMD Strix Halo con MTP Speculation y TurboQuant.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
| :------ | :---------: | :------: | :------- | :------ | :---- |
| **Qwen3.8-Flash-Next-heretic-2-ROCMFP4** (este) | 128.3B totales, 6B activos | 262K | qwen-community-1.0 | GGUF ROCmFP4 | Abliterado, cuantizado para AMD |
| **Qwen3.8-Flash-Next** (original) | 125B + 51B n-gram, 6B activos | 262K | qwen-community-1.0 | safetensors, BF16 | Con rechazos, sin cuantizar |
| **Qwen3.8-Flash** (versión oficial) | no disponible | 1M | qwen-community-1.0 | API / pesos | Incluye herramientas integradas, contexto 1M |

No se dispone de comparativas con otros modelos MoE de tamaño similar (p. ej., DeepSeek-V3, Mixtral) en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo del modelo, lo que puede generar respuestas inapropiadas, ofensivas o peligrosas. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- La divergencia KL de 0.0818 respecto al original indica una ligera alteración en la distribución de salidas, que podría afectar a la calidad en tareas de precisión.
- La cuantización ROCmFP4 es específica para hardware AMD con soporte ROCm; en otras plataformas (NVIDIA, Apple Silicon) puede no funcionar o requerir conversión adicional.
- El modelo requiere un fork no estándar de llama.cpp; el soporte comunitario es limitado y las actualizaciones del upstream pueden romper la compatibilidad.
- La licencia qwen-community-1.0 permite uso comercial pero con condiciones (atribución, no reventa del modelo como servicio, etc.); se recomienda revisar el texto completo de la licencia.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez para esta versión modificada; el abliteration puede aumentar la tendencia a alucinar en temas sensibles.
- El tamaño del modelo (96.5 GB en disco) y sus requisitos de memoria (75 GB mínimo) limitan su despliegue a hardware especializado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Deritak/Qwen3.8-Flash-Next-heretic-2-ROCMFP4)
- [Modelo base Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Repositorio GitHub de Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- [Blog de Qwen sobre Qwen3.8-Flash-Next](https://qwen.ai/blog?id=qwen3.8-flash-next)
- [Informe técnico (PDF)](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf)
- [Heretic (herramienta de abliteration)](https://github.com/p-e-w/heretic)
- [Fork personalizado de Heretic usado](https://github.com/timrohrbaugh/heretic)
- [Fork de llama.cpp con soporte ROCmFPx](https://github.com/LaurentZuijdwijk/llama.cpp) (rama `vulkan/qwen4exp-rocmfpx`)
- [Guía de unsloth para ejecutar Qwen3.8-Flash-Next localmente](https://unsloth.ai/docs/models/qwen3.8-next)
- [Repositorio de referencia para ROCmFP4 en AMD Strix Halo](https://github.com/julianmb/q38rocm)
- [Qwen3.8-Flash en QwenCloud](https://www.qwencloud.com/models/qwen3.8-flash)
