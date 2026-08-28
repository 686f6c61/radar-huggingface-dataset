# ARC4NUM/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-4bit

## Resumen

Qwen3.8-Flash-Next-Uncensored-MLX-Serve-4bit es un paquete de cuantización 4-bit del modelo Qwen3.8-Flash-Next, preparado específicamente para ejecutarse en Apple Silicon mediante el motor mlx-serve. El modelo original, desarrollado por Qwen, es un MoE multimodal ultra-disperso de 125B parámetros totales (6B activos por token) que incorpora una tabla n-gram de 51B parámetros como capa de embedding adicional. La versión "uncensored" es una abliteración realizada por orcarouter que elimina los rechazos de contenido del modelo base, manteniendo el resto de capacidades intactas.

Este paquete resuelve el problema de ejecutar un modelo de 125B en hardware de consumo: gracias a la cuantización mixta (4-bit para expertos y tabla n-gram, 8-bit para proyecciones, bf16 para routers) y al mapeo en memoria de la tabla n-gram desde disco, el modelo ocupa unos 68 GB residentes y alcanza velocidades de decodificación de ~56 tok/s en un M5 Max de 128 GB. Incluye la torre de visión, el cabezal especulativo MTP y soporta el contexto completo de 262.144 tokens. Es relevante porque permite ejecutar localmente un modelo de última generación con capacidades de agente, visión y razonamiento en un Mac, sin necesidad de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4: MoE ultra-disperso con GDN + QSA (3 de cada 4 capas usan Gated DeltaNet, la cuarta usa Qwen Sparse Attention), hyper-connections, RMSNorm con offset x·(1+w) |
| Parametros totales | 125B (incluye tabla n-gram de 51B); pesos cuantizados en safetensors: 21.058.910.099 |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit grupo 64 (expertos enrutados), 4-bit grupo 32 (tabla n-gram), 8-bit grupo 64 (proyecciones 2-D), bf16 (routers, gates, tensores 1-D, torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | MLX (safetensors + ngram_table.bin mapeado en memoria) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next, sobre el que se construye este paquete, introduce cuatro innovaciones principales respecto a generaciones anteriores: atención híbrida GDN + QSA (tres de cada cuatro capas usan Gated DeltaNet para comprimir historia, la cuarta usa Qwen Sparse Attention para recuperación precisa de largo alcance), hyper-connections en el bloque residual, una tabla n-gram de 51B parámetros como capa de embedding adicional (con filas de 160 elementos) y optimizaciones de entrenamiento. Solo 12 de las 48 capas son de atención completa, con 2 cabezas KV de dimensión 256, lo que reduce el coste de la caché KV a ~24 KB por token.

El paquete MLX se construyó con el conversor de mlx-serve a partir de los pesos bf16 de la versión uncensored (abliterada por orcarouter). La cuantización es mixta: los 512 expertos enrutados se cuantizan a 4-bit con grupo 64, la tabla n-gram a 4-bit con grupo 32 (almacenada en un fichero separado mapeado en memoria), las proyecciones 2-D a 8-bit con grupo 64, y los routers, gates y tensores 1-D se mantienen en bf16. El offset RMSNorm x·(1+w) se pliega en tiempo de conversión. El cabezal especulativo MTP (Multi-Token Prediction) se incluye y puede activarse opcionalmente.

## Capacidades

- Generación de texto y razonamiento avanzado con modo "thinking" configurable (niveles low, medium, xhigh; por defecto xhigh).
- Soporte de tool calling / function calling, con compatibilidad con las APIs de OpenAI, Anthropic y Ollama a través de mlx-serve.
- Capacidades de agente: integración con Claude Code, pi, OpenCode, Codex, aider, Open WebUI y Raycast mediante el comando `mlx-serve launch`.
- Visión: incluye torre de visión en bf16, soporta entradas imagen-texto (pipeline image-text-to-text).
- Decodificación especulativa MTP: el modelo usa su propio cabezal de borrador para acelerar la generación (~60 tok/s frente a ~56 tok/s en serial).
- Preserve thinking: mantiene las trazas de razonamiento de turnos anteriores en el contexto para mejorar la precisión en conversaciones multi-turno.
- Multilingüe: no se especifican idiomas concretos, pero al derivar de Qwen3.8-Flash-Next hereda el soporte multilingüe del modelo base.
- Sin censura: la abliteración elimina los rechazos de contenido, permitiendo respuestas sobre temas que el modelo original bloquearía.

## Casos de uso

- Desarrollo de agentes de codificación locales: el modelo puede integrarse con Claude Code, OpenCode o aider mediante la API de mlx-serve, ejecutando tareas de edición multi-archivo con razonamiento de largo alcance gracias a los 262K tokens de contexto y la caché KV compacta (~2.4 GB a 100K tokens).
- Asistente de programación con visión: al incluir la torre de visión, puede analizar capturas de pantalla de errores, diagramas de arquitectura o mockups de UI y generar código o explicaciones a partir de ellos.
- Investigación y análisis de documentos extensos: con 262K tokens de contexto, puede procesar libros técnicos completos, codebases enteros o largas cadenas de logs, manteniendo el razonamiento multi-turno con preserve thinking.
- Servidor de chat multimodal local: desplegado con `mlx-serve serve`, expone endpoints compatibles con OpenAI, Anthropic y Ollama en un solo puerto, permitiendo sustituir APIs comerciales en aplicaciones existentes sin cambios de código.
- Generación de contenido creativo sin restricciones: la versión abliterada permite explorar temas sensibles (ficción adulta, sátira política, etc.) que el modelo base rechazaría, útil para escritores e investigadores de narrativa.
- Prototipado de pipelines de razonamiento: el modo thinking configurable (low/medium/xhigh) permite ajustar el equilibrio entre latencia y profundidad de razonamiento, adecuado para experimentar con cadenas de pensamiento en tareas de matemáticas o lógica.
- Evaluación de modelos en hardware Apple: al ser un paquete optimizado para Metal, sirve como referencia para medir el rendimiento de MoE ultra-dispersos en Macs con 96-128 GB de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La documentacion de unsloth afirma que el modelo base supera a Claude-4.6-Opus (Max) en tareas de codificacion agente, vision y chat, pero no se proporcionan cifras concretas. Los unicos datos medidos corresponden al rendimiento de inferencia en hardware Apple:

| Configuracion | Decodificacion | Memoria residente |
|---|---|---|
| mlx-serve serial (M5 Max 128 GB) | 55.7 tok/s | ~68 GB |
| mlx-serve con --mtp (M5 Max 128 GB) | 60.3 tok/s | ~68 GB |
| mlx-vlm (Python, mismos pesos) | 30.5 tok/s | ~104 GB |
| llama.cpp GGUF IQ4_XS (misma clase de hardware) | ~26 tok/s | ~94 GB |

El autor reporta ~60 tok/s serial y ~78 tok/s con MTP en un M4 Max para el paquete del modelo base, aunque el cableado de MTP esta marcado como parcial en esta version pre-release.

## Requisitos de hardware

- Apple Silicon Mac con minimo 96 GB de memoria unificada; 128 GB recomendado para contextos de agente largos.
- ~68 GB de memoria residente en carga, por debajo del limite wired de Metal por defecto (no requiere ajustar `iogpu.wired_limit_mb`).
- ~107 GB de espacio en disco SSD interno; la tabla n-gram se lee desde disco en la ruta caliente, por lo que no debe alojarse en discos externos lentos.
- Motor: mlx-serve v26.8.11-pre-release.1 o superior (primera version con soporte `qwen4_exp`).
- No requiere GPU dedicada; usa los kernels Metal personalizados de mlx-serve para el gather MoE, decodificacion Gated-DeltaNet, hyper-connections y atencion dispersa.
- Caché KV: ~24 KB por token, ~2.4 GB a 100K tokens de contexto.
- Opciones de despliegue: terminal interactivo (`mlx-serve --prompt`), servidor API (`mlx-serve serve` con endpoints OpenAI/Anthropic/Ollama), o lanzamiento de agentes (`mlx-serve launch`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware objetivo | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-MLX-Serve-4bit (este) | 125B total / 6B activo | 262K | MLX 4-bit | Apple Silicon 96-128 GB | ~56-60 tok/s (M5 Max) |
| Qwen3.8-Flash-Next (original, bf16) | 125B total / 6B activo | 262K | safetensors bf16 | GPU/TPU o Mac con 163+ GB | no disponible |
| Qwen3.8-Flash-Next GGUF IQ4_XS (comunidad) | 125B total / 6B activo | 262K | GGUF | Apple Silicon 128 GB | ~26 tok/s |
| mlx-vlm (mismos pesos re-empaquetados) | 125B total / 6B activo | 262K | MLX | Apple Silicon 128 GB | ~30.5 tok/s |

La ventaja principal de este paquete frente a las alternativas es la combinacion de kernels Metal fusionados de mlx-serve (que duplican el rendimiento de las rutas Python genericas) y la cuantizacion mixta que reduce la memoria residente a 68 GB, permitiendo ejecutar el modelo en Macs de 96 GB. Frente al GGUF de llama.cpp, ofrece mas del doble de velocidad de decodificacion con menor uso de memoria.

## Limitaciones y advertencias

- La abliteracion elimina los rechazos de contenido, lo que puede producir respuestas ofensivas, sesgadas o peligrosas en temas sensibles; el uso en produccion debe contemplar filtros adicionales.
- El modelo esta optimizado exclusivamente para Apple Silicon via mlx-serve; no es portable a GPUs NVIDIA/AMD sin re-conversion.
- La tabla n-gram se lee desde disco en la ruta caliente; usar discos externos lentos degrada significativamente el rendimiento.
- El soporte MTP esta marcado como parcial en esta version pre-release del motor; puede ser mas lento en prosa libre que en codigo o bucles de agente.
- El modo thinking por defecto (xhigh) puede generar trazas de razonamiento muy largas; se recomienda limitar con `--reasoning-budget` o `reasoning_effort` para tareas de agente.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; debe revisarse el texto completo de la licencia antes de desplegar en entornos de produccion.
- No se han publicado benchmarks estandarizados que permitan comparar objetivamente la calidad del modelo frente a alternativas de tamano similar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un paquete reciente (agosto 2026) con adopcion aun no validada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ARC4NUM/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-4bit
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio mlx-serve: https://github.com/ddalcu/mlx-serve
- Conversor del paquete: https://github.com/ddalcu/mlx-serve/blob/main/tests/convert_qwen38_flash_next.py
- Repositorio oficial Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guia de ejecucion local de la version 27B uncensored (orcarouter): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
