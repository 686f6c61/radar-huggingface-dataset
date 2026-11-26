# JoshuaCalhoon/Qwen3.8-27B-MLX-4bit-GPTQ

## Resumen

Qwen3.8-27B-MLX-4bit-GPTQ es una cuantización de 4 bits en formato MLX del modelo Qwen/Qwen3.8-27B, publicada por el desarrollador independiente JoshuaCalhoon. El objetivo no es otro que ofrecer una versión reducida en peso del modelo base (15,0 GB en disco frente al bf16 original) que mantenga la mayor fidelidad posible respecto al modelo sin cuantizar, calibrada específicamente para trabajo de codificación agéntica. El resultado es un checkpoint de 26.895.993.856 parámetros totales con torre de visión incluida en bf16, pensado para ejecutarse en hardware Apple Silicon mediante MLX.

La relevancia de esta ficha reside en su enfoque de cuantización: no se trata de un 4-bit genérico, sino de una receta GPTQ por capas con anchos de bits mixtos (4 bits para la mayoría de tensores, 6 bits para `lm_head` y 8 bits para las proyecciones de atención), calibrada sobre sesiones reales de agente con llamadas a herramientas, salidas de shell y diffs. El autor reporta una divergencia KL de 0,0747 frente al bf16, inferior a la del cuantizado de referencia de mlx-community (0,1175), con un tamaño algo menor.

El modelo hereda del base la licencia Apache 2.0 y la capacidad multimodal image-text-to-text, además de un contexto declarado de 64K en las pruebas del autor. Es, por tanto, una opción orientada a desarrolladores que quieran ejecutar un modelo de ~27B con visión y razonamiento en un portátil Apple Silicon de gama alta, sin depender de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (atención completa + atención lineal), según los tensores descritos en la model card; familia Qwen3.5 (`qwen3_5`) |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64K en la configuración de pruebas del autor; contexto máximo del modelo base no disponible |
| Tipos de cuantizacion | 4-bit afín con group size 128 (embeddings incluidos); `lm_head` a 6-bit/g64; `k_proj` y `v_proj` de atención completa a 8-bit/g64 (16 capas); `in_proj_a` e `in_proj_b` de atención lineal a 8-bit/g64 (48 capas); torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), cuantización GPTQ |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer con mezcla de capas de atención completa y atención lineal: la model card del cuantizado menciona explícitamente 16 capas con `k_proj`/`v_proj` de atención completa y 48 capas con `in_proj_a`/`in_proj_b` de atención lineal. Esta combinación busca reducir el coste computacional en contextos largos manteniendo la calidad de recuperación de información. El checkpoint incluye además una torre de visión que se conserva en bf16, lo que habilita la modalidad image-text-to-text.

El proceso de cuantización es el elemento diferencial: GPTQ aplicado capa por capa, con calibración sobre sesiones multi-turno de codificación agéntica (llamadas a herramientas, salida de shell, diffs y prosa) extraídas de varios proyectos de software. Los anchos de bits por tensor quedan registrados en `config.json` dentro de `quantization_config`. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset original ni si hubo fases de RLHF o DPO; la model card del cuantizado no los detalla y remite a la del base para los controles de modo thinking y `reasoning_effort`.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (thinking) y control de esfuerzo de razonamiento (`reasoning_effort`) heredados del modelo base.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), con la torre de visión preservada en bf16.
- Codificación y trabajo agéntico: la calibración GPTQ se hizo sobre sesiones con llamadas a herramientas, diffs y salidas de shell, lo que sugiere soporte práctico de tool calling y flujos de varios pasos.
- Razonamiento de alta intensidad configurable, empleado por el autor en tareas de depuración de proyectos Go, Swift y TypeScript/React.
- Lectura de capturas de pantalla y transcripción de valores: el autor reporta 60/60 valores dentro de tolerancia en una prueba de transcripción de screenshots.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Sub-agente de codificación en proyectos Swift/macOS: el autor lo emplea como sub-agente dentro de OpenCode para tareas acotadas, con contexto de hasta 100K+ tokens y decodificación sostenida de ~37 tok/s en un M5 Pro; encaja por su calibración específica en sesiones agénticas y su ventana amplia.
- Depuración de errores de compilación en Xcode: el modelo mantiene coherencia y precisión antes de la compactación de contexto, aunque el autor advierte que tiende a teorías incorrectas en algunos problemas de build; útil si se le proporcionan líneas de código concretas y palabras clave para grep.
- Asistente de codificación en TypeScript/React: con prefill de ~400 tok/s y decodificación observada de hasta ~105 tok/s en el setup del autor, adecuado para iteraciones rápidas sobre componentes y refactors pequeños.
- Trabajo agéntico remoto sobre proyectos Go desde el editor Zed: el autor lo ejecuta a través de LAN con razonamiento alto, con prefill de ~308 tok/s y decodificación de ~37 tok/s, lo que lo hace viable para sesiones de agente de larga duración en red local.
- Análisis de capturas de pantalla y documentación visual: la torre de visión en bf16 permite transcribir valores de screenshots con tolerancia verificada, útil para extraer datos de interfaces o informes.
- Procesamiento de contexto largo en local: con 64K de contexto y caché KV en INT8 cuando la RAM es limitada, sirve para ingerir repositorios medianos o hilos de conversación extensos sin salir del portátil.
- Evaluación y comparación de cuantizaciones: por su receta documentada y métricas KL publicadas, es un caso de referencia para estudiar el impacto de anchos de bits mixtos en modelos multimodales.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad frente al bf16 y velocidad en su hardware (MacBook Pro 14" con M5 Pro, 15 núcleos CPU / 16 GPU / 48 GB, servido con Splash y el draft especulativo `incoai/Qwen3.8-27B-DFlash2`):

| Metrica | Este cuantizado | mlx-community/Qwen3.8-27B-4bit |
|---|---|---|
| KL vs bf16 (menor es mejor) | 0,0747 | 0,1175 |
| Acuerdo top-1 con bf16 | 0,925 | 0,881 |
| Tamano en disco | 15,0 GB | 16,05 GB |
| Decodificacion, un stream | 37,7 tok/s | 36,6 tok/s |

Rendimiento observado por el autor en trabajo real:

| Escenario | Prefill | Decodificacion |
|---|---|---|
| Swift, 2 sesiones concurrentes, 100K+ contexto | ~300 tok/s | ~47 tok/s |
| Swift, sesion unica, <100K contexto | ~400-431 tok/s (~600 pico) | ~46-49 tok/s (~68 pico) |
| TypeScript/React, 1-2 sesiones, <100K contexto | ~400 tok/s (~421 pico) | ~105 tok/s (outlier) |
| Go via LAN, sesion unica, 100K+ contexto | ~308 tok/s (~339 pico, baja a ~288 a 130K+) | ~37 tok/s (~38 pico, baja a ~32 a 130K+) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: ~15,0 GB de pesos en disco; con caché KV en bf16 y contexto de 64K se necesita bastante más RAM unificada. El autor trabaja con 48 GB y caché KV en INT8 cuando la memoria aprieta.
- GPU recomendadas: Apple Silicon con al menos 32 GB de memoria unificada; el setup de referencia es un M5 Pro de 16 núcleos GPU y 48 GB.
- ¿Cabe en GPU de consumo? No se ha probado en GPUs NVIDIA/AMD; el formato es MLX, específico de Apple Silicon. No hay datos de ejecución en RTX 4090 ni similares.
- Opciones de despliegue: motor Splash (del propio autor, con emparejamiento automático del draft DFlash2) y `mlx_lm.load` para el modelo de texto. Otros runtimes MLX no han sido probados. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; el autor reporta ~49-51% de aceptación del draft especulativo y ~98% de acierto de caché con 10 GB de caché SSD persistente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| JoshuaCalhoon/Qwen3.8-27B-MLX-4bit-GPTQ | ~26,9B | 64K (pruebas) | MLX safetensors, GPTQ 4-bit mixto | Apache 2.0 | KL 0,0747 vs bf16; 15,0 GB; calibrado en codificación agéntica |
| mlx-community/Qwen3.8-27B-4bit | no disponible | no disponible | MLX 4-bit | Apache 2.0 (presumible, no confirmado) | KL 0,1175 vs bf16; 16,05 GB; referencia directa del autor |
| Qwen/Qwen3.8-27B (bf16) | ~26,9B | no disponible | safetensors bf16 | Apache 2.0 | Modelo base sin cuantizar; referencia de calidad |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte de que el modelo tiende a teorías incorrectas al depurar algunos problemas de build de Xcode; conviene acotar las sesiones y aportar líneas de código concretas.
- Tras la compactación de contexto pierde detalles finos; el autor recomienda evitar la compactación y mantener sesiones bien delimitadas.
- Las métricas de calidad son del propio autor y sobre datos de retención propios (96 secuencias, 37,8K tokens); no hay validación independiente ni benchmarks estándar publicados.
- El resultado en lectura de imágenes se describe como "sin regresión" frente al 4-bit de mlx-community, no como una mejora demostrada.
- El rendimiento de ~105 tok/s en TypeScript/React es un outlier que el propio autor no sabe explicar; no debe tomarse como referencia estable.
- Formato MLX: no es portable a ecosistemas CUDA/ROCm sin conversión; solo se ha probado con Splash y `mlx_lm`.
- Idiomas soportados no documentados; el comportamiento multilingüe del cuantizado no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar el LICENSE del repositorio original para condiciones adicionales.
- Riesgo de alucinación inherente al modelo base no cuantificado; la cuantización añade una divergencia medible (KL 0,0747) que puede agravarse en tareas fuera de la distribución de calibración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JoshuaCalhoon/Qwen3.8-27B-MLX-4bit-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Proyecto SplashGUI del autor: https://github.com/JoshuaCalhoon/SplashGUI
- Cuantizado de referencia: mlx-community/Qwen3.8-27B-4bit (no se proporciona URL directa en la información disponible)
- Draft especulativo: incoai/Qwen3.8-27B-DFlash2 (no se proporciona URL directa en la información disponible)
