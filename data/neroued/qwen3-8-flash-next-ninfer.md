# neroued/Qwen3.8-Flash-Next-NInfer

## Resumen

Qwen3.8-Flash-Next-NInfer es un artefacto de pesos en precisión mixta publicado por el usuario neroued para su propio motor de inferencia, NInfer. No es un modelo entrenado desde cero: parte del checkpoint BF16 de Qwen/Qwen3.8-Flash-Next y de los pesos calibrados NVFP4 de nvidia/Qwen3.8-Flash-Next-NVFP4, y los recombina en un formato propietario (`.ninfer`) optimizado para ejecutarse en hardware Blackwell, con mención explícita a DGX Spark y RTX 5090.

La arquitectura subyacente es Qwen4Exp, que combina Gated DeltaNet, atención dispersa (QSA), flujos residuales con compuertas, mezcla de expertos (MoE) y embeddings PLE, además de un módulo MTP (multi-token prediction) nativo con cabeza de borrador de vocabulario completo. El artefacto incluye tokenizador, recursos de procesador de visión y la plantilla de chat de Flash Next, y se distribuye en cuatro ficheros que suman 101 GiB.

Su relevancia es práctica: demuestra una ruta para servir un modelo multimodal de gran tamaño en estaciones Blackwell de una o dos unidades, con cuantización agresiva por capas (NVFP4 importado, Q8 A16, block-FP8, NF4 y Q4 A16 en la cabeza de borrador) y decodificación especulativa MTP. La licencia es la NVIDIA Open Model License, heredada del artefacto NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4Exp: Gated DeltaNet, atencion dispersa (QSA), flujos residuales con compuertas, MoE y embeddings PLE; modulo MTP nativo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE, sin cifra publicada) |
| Longitud de contexto | 262.144 tokens logicos (limite configurado en los ejemplos de despliegue) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados principales), Q8 A16 (proyecciones GDN grandes, query/gate y salida de QSA), block-FP8 (expertos enrutados MTP), NF4 (tabla PLE), Q4 A16 (cabeza MTP optimizada), BF16 (cabeza principal, expertos compartidos, HC, vision) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (etiquetada como `other`) |
| Formato de pesos | `.ninfer` (artefacto propietario de NInfer, 101,00 GiB en cuatro ficheros: `qwen3_8_flash_next.ninfer` y `part-0001` a `part-0003`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea la arquitectura Qwen4Exp, una variante híbrida que sustituye parte de la atención clásica por Gated DeltaNet y atención dispersa, e incorpora flujos residuales con compuertas, capas MoE y una tabla de embeddings PLE. Sobre esa base, el artefacto NInfer conserva la cabeza principal en BF16 y añade una cabeza de borrador MTP optimizada en Q4 A16 con vocabulario completo, pensada para decodificación especulativa con `--spec mtp --draft-tokens 3 --proposal-head optimized`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo original. Lo que sí documenta el autor es el proceso de cuantización: los códigos y escalas NVFP4 de NVIDIA se importan sin recuantizar, y el resto de capas se convierte mediante la receta `qwen3_8_flash_next` del repositorio NInfer. Los campos de control en FP32 del checkpoint fuente se mantienen en FP32.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con modo de pensamiento implícito en la plantilla de chat de Flash Next.
- Razonamiento matemático de competición, evidenciado por los resultados declarados en AIME 2026.
- Comprensión de imágenes y respuesta imagen-texto (pipeline `image-text-to-text`), con recursos de procesador de visión incluidos en el artefacto.
- Decodificación especulativa mediante MTP nativo más cabeza de borrador optimizada de vocabulario completo.
- Conversación multi-turno con plantilla de chat mantenida por el autor.
- Servido compatible con las APIs de OpenAI y Anthropic a través de NInfer.
- Ejecución distribuida en dos nodos con TP2 (expert TP por defecto) o EP de expertos completos (`ep = 2`).
- Capacidades de tool calling y function calling: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal en estación local: con una DGX Spark y el preset `dgx-spark-release` se puede servir un modelo de visión-lenguaje con 262.144 tokens de contexto lógico, útil para analizar documentos escaneados, capturas de pantalla o diagramas técnicos sin salir de la infraestructura propia.
- Despliegue en clúster de dos nodos para equipos pequeños: la configuración `spark2-qwen3_8-flash-next.toml` permite repartir el artefacto con TP2 o EP, lo que habilita servir el modelo completo a un equipo de investigación con dos estaciones Blackwell en lugar de un clúster de GPUs de centro de datos.
- Razonamiento matemático y científico asistido: los resultados declarados en AIME 2026 (97,78) y GPQA-Diamond (91,79) lo sitúan como candidato para tutoría avanzada, verificación de derivaciones y resolución de problemas de nivel competitivo en entornos educativos o de I+D.
- Evaluación comparativa de cuantizaciones: al conservar los códigos NVFP4 originales de NVIDIA y aplicar Q8 A16 solo en capas seleccionadas, sirve como banco de pruebas para medir la degradación de precisión frente al checkpoint BF16 en tareas de visión y razonamiento.
- Backend de API compatible con OpenAI para herramientas internas: NInfer expone un servidor compatible con OpenAI y Anthropic, de modo que aplicaciones existentes pueden apuntar al endpoint local sin reescribir el cliente.
- Procesamiento por lotes de imágenes y texto en CLI: la aplicación `apps/ninfer` acepta `--prompt` o `--messages`, lo que facilita pipelines de anotación, extracción de información de capturas o generación de descripciones a partir de lotes de imágenes.
- Investigación en decodificación especulativa: la combinación de MTP nativo, cabeza optimizada en Q4 A16 y `--draft-tokens 3` permite estudiar el equilibrio entre tasa de aceptación, latencia y calidad en hardware Blackwell.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (0-shot, métrica de regla, no verificados de forma independiente), obtenidos con NInfer / EvalScope 1.10.0:

| Benchmark | Tarea | Métrica | Valor |
|---|---|---|---|
| GPQA-Diamond | Text generation | Mean sample accuracy | 91,79 |
| AIME 2026 | Text generation | Mean sample accuracy | 97,78 |
| ERQA | Image-text-to-text | Mean sample accuracy | 68,00 |
| RealWorldQA | Image-text-to-text | Mean sample accuracy | 85,75 |
| MMMU-Pro (standard, 10 opciones) | Image-text-to-text | Mean sample accuracy | 80,81 |

No se han publicado en la información disponible resultados de benchmarks comparativos frente a otros modelos, ni datos de latencia o throughput medidos.

## Requisitos de hardware

- El artefacto completo ocupa 101,00 GiB en disco y debe residir en un único directorio; solo se pasa el fichero de entrada `qwen3_8_flash_next.ninfer` al motor.
- VRAM estimada para inferencia: no disponible de forma explícita. Por el tamaño del artefacto y las capas en BF16 (cabeza principal, expertos compartidos, visión), no cabe íntegramente en una GPU de consumo de 24-32 GB sin offload.
- GPU recomendadas: hardware Blackwell. El autor documenta DGX Spark (uno o dos nodos) y RTX 5090 con offload de expertos a CPU.
- Configuración multi-nodo: dos Sparks con `-DNINFER_ENABLE_DISTRIBUTED=ON`, dependencias de desarrollo NCCL/libibverbs y el preset `spark2-qwen3_8-flash-next.toml`.
- Opciones de despliegue: exclusivamente el motor NInfer (`apps/ninfer-serve` para servido, `apps/ninfer` para CLI). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.ninfer`.
- Los ejemplos de configuración activan Vision, KV en FP8, MTP3, la cabeza optimizada y decodificación con CUDA Graph.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NInfer | no disponible (MoE) | 262.144 tokens | `.ninfer` (101 GiB) | NVIDIA Open Model License | NInfer |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible (MoE) | no disponible | safetensors | la del modelo base | múltiples |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible (MoE) | no disponible | NVFP4 | NVIDIA Open Model License | TensorRT-LLM y afines |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada. La diferencia principal frente al checkpoint BF16 y al NVFP4 de NVIDIA es el formato de empaquetado, la mezcla de precisiones por capa y la cabeza MTP optimizada, no la arquitectura ni los pesos subyacentes.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor, marcados como no verificados y generados con su propia pila (NInfer / EvalScope 1.10.0); no deben tratarse como cifras independientes.
- El formato `.ninfer` es propietario: no hay interoperabilidad con vLLM, llama.cpp, Ollama, TGI ni transformers, lo que ata el despliegue al repositorio NInfer y a su cadencia de mantenimiento.
- La licencia NVIDIA Open Model License impone condiciones específicas para uso comercial; conviene revisar el acuerdo antes de integrarlo en un producto.
- El campo `inference: false` en la model card indica que la plataforma de Hugging Face no puede ejecutar el modelo; requiere descarga y despliegue manual.
- El rendimiento en RTX 5090 depende de offload de expertos a CPU, lo que degrada la latencia frente a una DGX Spark o un clúster de dos nodos.
- Riesgo de alucinación y sesgos: no hay información publicada específica para este artefacto; al derivar del modelo base, hereda los del checkpoint original, no documentados aquí.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera de los idiomas cubiertos por el modelo base.
- La decodificación especulativa con MTP3 y cabeza optimizada puede alterar ligeramente las distribuciones de salida frente a la decodificación estándar; conviene validar en tareas sensibles.
- El contexto lógico de 262.144 tokens es un límite de configuración del ejemplo, no una garantía medida de calidad en longitudes extremas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neroued/Qwen3.8-Flash-Next-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Instrucciones de compilación: https://github.com/Neroued/ninfer#build
- Receta de conversión: https://github.com/Neroued/ninfer/blob/master/tools/convert/official_recipes.py
- Configuración para una Spark: https://github.com/Neroued/ninfer/blob/master/examples/configs/spark-qwen3_8-flash-next.toml
- Configuración para dos Sparks: https://github.com/Neroued/ninfer/blob/master/examples/configs/spark2-qwen3_8-flash-next.toml
- Guía de despliegue: https://github.com/Neroued/ninfer/tree/master/examples/configs
- Resultados de evaluación: https://github.com/Neroued/ninfer/blob/master/model-cards/Qwen3.8-Flash-Next-NInfer/evaluation.json
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
