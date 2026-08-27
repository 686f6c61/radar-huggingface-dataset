# infosave/GLM-5.3-Flash-cmf

## Resumen

GLM-5.3-Flash-cmf es una versión cuantizada del modelo GLM-5.3-Flash de Z.ai, convertida al formato CMF (Cortiq Memory-Mapped Format) por el usuario infosave. El modelo original es un MoE nativamente multimodal de 320B parámetros con 18B activos, diseñado para tareas de codificación, agentes y visión. Esta versión concreta elimina la torre de visión y el bloque MTP especulativo, quedando como un modelo de solo texto con 313,33B parámetros retenidos.

La relevancia de este artefacto radica en su perfil de cuantización mixto (Q4TP + Q8_2f + F16) y su formato CMF, que permite ejecutar el modelo sin necesidad de Python, PyTorch ni CUDA toolkit, con respaldo de memoria mapeada (mmap) que no exige que el archivo completo quepa en VRAM. Está pensado para entornos CPU y GPU portátiles (Vulkan), con validación pendiente en Metal. Su licencia MIT facilita su uso comercial.

El modelo base GLM-5.3-Flash fue liberado por Z.ai en agosto de 2026, y según las fuentes consultadas supera a GLM-5.2 en benchmarks de codificación y agentes, acercándose a Claude Opus 4.8, con un coste diez veces inferior al de su predecesor. Esta versión cuantizada mantiene la arquitectura híbrida de atención lineal y completa, con un límite de contexto nativo de un millón de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con 45 capas: 34 KDA (linear attention) y 11 DSA/MLA (full attention) |
| Parametros totales | 320B (original); 313,33B retenidos en la versión de solo texto |
| Parametros activos | 18B |
| Longitud de contexto | 1.000.000 tokens (límite nativo de arquitectura) |
| Tipos de cuantizacion | Q4TP mixto: q4tp para expertos enrutados, q8_2f para proyecciones de atención y vocabulario, f16 para normas, routers y tensores de control |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | CMF (Cortiq Memory-Mapped Format), archivo único de 155,68 GiB |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE híbrida que combina atención lineal (KDA) en 34 de sus 45 capas y atención completa (DSA/MLA) en las 11 restantes. Esta combinación reduce el coste computacional en contextos largos manteniendo precisión. El enrutamiento de expertos usa top-8 con activación sigmoide, corrección de sesgo y un experto compartido incondicional, con tres capas SwiGLU densas seguidas de 288 expertos enrutados. La versión cuantizada conserva todos estos elementos, incluyendo el template Jinja original con soporte para `reasoning_effort` y la ruta de respuesta directa.

El entrenamiento original del modelo base no está detallado en la información disponible, pero se sabe que es un modelo nativamente multimodal (aunque esta versión omite la torre de visión) y que fue liberado bajo licencia MIT. La conversión a CMF decodifica los pesos FP8 originales (E4M3) usando sus planos F32 `weight_scale_inv` con orientación de tile 128×128, y luego los cuantiza de forma independiente. El archivo CMF incorpora el tokenizador, el template de chat exacto, el directorio de tensores, el descriptor de arquitectura y hashes por tensor para verificación de integridad.

## Capacidades

- Generación de texto en inglés y chino con soporte de razonamiento multi-paso y modo de pensamiento (`reasoning_effort`).
- Codificación y generación de código, dado que el modelo base está optimizado para tareas de programación y agentes.
- Soporte de tool calling y function calling, integrado en el template de chat nativo.
- Capacidades de agente con razonamiento de horizonte largo, gracias a la arquitectura híbrida de atención que mantiene precisión en contextos extensos.
- Razonamiento matemático y lógico, con capacidad de respuesta directa sin cadena de pensamiento (`--no-think`).
- Procesamiento de contexto de hasta un millón de tokens, aunque esta versión solo maneja texto (sin visión).
- Ejecución sin dependencias de Python ni CUDA, mediante el runtime Cortiq con backend CPU y Vulkan.

## Casos de uso

- Asistentes de codigo en entornos de produccion: el modelo puede integrarse en pipelines de CI/CD para generacion de codigo, revision de parches o autocompletado, gracias a su soporte de tool calling y su capacidad de razonamiento multi-paso. Su licencia MIT permite uso comercial sin restricciones.
- Sistemas de atencion al cliente multilingue: con soporte para ingles y chino, y una ventana de contexto de un millon de tokens, puede gestionar conversaciones multi-turno con historiales largos, manteniendo coherencia gracias a la atencion hibrida.
- Agentes autonomos de navegacion web o uso de ordenador: el modelo base esta disenado para tareas agente de largo horizonte; esta version de solo texto puede planificar y ejecutar acciones en entornos sin vision, usando tool calling para interactuar con APIs.
- Analisis de documentos extensos: su contexto de un millon de tokens permite procesar libros, informes o codigo fuente completo en una sola pasada, con atencion lineal que reduce el coste computacional en secuencias largas.
- Generacion de respuestas directas en aplicaciones de baja latencia: el modo `--no-think` permite obtener respuestas sin cadena de pensamiento, util para chatbots o asistentes donde se prioriza la velocidad sobre el razonamiento elaborado.
- Despliegue en hardware sin GPU dedicada: al ejecutarse en CPU con respaldo mmap, puede usarse en servidores sin aceleradores, con un rendimiento medido de ~2,15 tokens/s en un sistema con dual AMD EPYC 7H12 y 32 hilos, adecuado para tareas por lotes o prototipado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version cuantizada (GLM-5.3-Flash-cmf) en la informacion disponible. El modelo base GLM-5.3-Flash, segun las fuentes consultadas, supera a GLM-5.2 en benchmarks de codificacion y agentes, y se acerca a Claude Opus 4.8, pero no se proporcionan cifras concretas. El autor de la version cuantizada reporta una correlacion de 0,997998 y un error RMS relativo del 6,36% en la primera capa enrutada comparada con los tensores FP8 originales, lo que indica una fidelidad alta en la cuantizacion.

## Requisitos de hardware

- El archivo CMF de 155,68 GiB no necesita caber en VRAM; se mantiene mapeado en memoria del host (mmap) y se ejecuta en CPU o GPU segun disponibilidad.
- En CPU pura, se midio un rendimiento de 2,156 tokens/s de media (tres ejecuciones) en un sistema con dual AMD EPYC 7H12 y 32 hilos de CPU, con una RTX 3090 presente pero sin uso.
- En GPU Vulkan con pool dinamico forzado (13,9 GB de pool), el rendimiento fue de 0,634 tokens/s, unas 3,4 veces mas lento que CPU, por lo que el modo automatico mantiene el MoE en CPU para este perfil Q4TP.
- Para ejecucion en GPU con memoria limitada, se puede usar `CMF_GPU_VRAM_MB` para fijar un presupuesto (por ejemplo, 16000 MB) y `CMF_GLM_DYNAMIC_MOE=1` para habilitar el pool dinamico, aunque esto reduce el rendimiento.
- El runtime Cortiq no requiere Python, PyTorch ni CUDA toolkit; solo el binario `cortiq` con soporte para la arquitectura `glm5_next`.
- La validacion en Metal (GPU de Apple) esta pendiente, por lo que en macOS solo se garantiza el backend CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | 1M | MIT | FP8 | Multimodal nativo, optimizado para codigo y agentes |
| GLM-5.3-Flash-cmf (esta version) | 313,33B (texto) | 18B | 1M | MIT | CMF Q4TP | Solo texto, sin vision ni MTP, ejecucion CPU/GPU portatil |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | no disponible | Predecesor, superado por GLM-5.3-Flash segun Z.ai |

No se dispone de datos suficientes para comparar con otros modelos MoE como DeepSeek-V3 o Qwen2.5-Max en terminos de rendimiento y licencia. La comparativa se limita a la informacion publicada sobre el modelo base y su predecesor.

## Limitaciones y advertencias

- Esta version es exclusivamente de texto: se omiten la torre de vision y el bloque MTP especulativo del modelo original, por lo que no puede procesar imagenes ni usar decodificacion especulativa.
- El rendimiento en CPU es bajo (alrededor de 2 tokens/s), lo que limita su uso en aplicaciones interactivas en tiempo real; es mas adecuado para tareas por lotes o prototipado.
- La ejecucion en GPU Vulkan con pool dinamico es significativamente mas lenta que en CPU para este perfil Q4TP, por lo que no se recomienda forzarla salvo para pruebas de compatibilidad.
- La validacion en Metal (GPU de Apple) esta pendiente; en macOS solo se garantiza el backend CPU.
- El modelo solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Aunque la cuantizacion muestra una correlacion alta con los pesos originales, existe un error RMS relativo del 6,36% en la primera capa enrutada, que podria acumularse en generaciones largas.
- El archivo de 155,68 GiB requiere espacio en disco y memoria RAM suficiente para el mapeo; en sistemas con poca RAM, el rendimiento puede degradarse por swapping.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K) para esta version cuantizada, por lo que su rendimiento real en tareas especificas no esta verificado de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/infosave/GLM-5.3-Flash-cmf
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-5.3-Flash
- Ficha del modelo en LM Studio: https://lmstudio.ai/models/glm-5.3-flash
- Ficha en Parasail: https://www.parasail.io/models/glm-53-flash
- Documentacion de API en DeepInfra: https://deepinfra.com/zai-org/GLM-5.3-Flash/api
- Anuncio en Cloudflare Workers AI: https://developers.cloudflare.com/changelog/post/2026-08-26-glm-5.3-flash-workers-ai/
- Articulo en SiliconANGLE sobre el lanzamiento: https://siliconangle.com/2026/08/26/z-ai-open-sources-ox-alpha-model-as-glm-5-3-flash/
