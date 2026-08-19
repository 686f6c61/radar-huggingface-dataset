# justinchuby/Muse-Glimmer-30B-ONNX-INT4-CUDA

## Resumen

Muse-Glimmer-30B-ONNX-INT4-CUDA es una conversión del modelo de visión-lenguaje Muse-Glimmer-30B de Meta Superintelligence Lab, empaquetada para ONNX Runtime GenAI y optimizada para ejecución en GPUs NVIDIA con CUDA. El autor de la conversión, justinchuby, ha exportado el checkpoint original en BF16 con la herramienta Mobius, lo ha cuantizado a INT4 (estilo Q4_K_M) con Olive y ha incluido el pipeline completo de visión-lenguaje (decoder, embedding, vision encoder, tokenizador y configuración). El resultado es un paquete autocontenido que puede cargarse directamente con la API nativa de ONNX GenAI.

El modelo original es un transformer denso de 29.600 millones de parámetros con un encoder de visión ViT-G/14, contexto de 128.000 tokens y una arquitectura de atención deslizante: 39 de sus 52 capas atienden solo a los últimos 2.048 tokens, mientras que cada cuarta capa es de atención completa sin posicional. Está destilado de Muse Spark y ajustado específicamente para agentes locales, tool calling y tareas largas con recuperación de errores. Esta conversión INT4 permite ejecutarlo en una sola GPU con un consumo de memoria reducido, manteniendo la licencia Apache 2.0 del modelo original.

La relevancia de este paquete radica en que facilita el despliegue local de un modelo de agente multimodal de 30B en hardware de consumo o profesional, con soporte nativo para razonamiento multi-paso, llamadas a herramientas en formato XML (ATEM) y entrada de imágenes, todo ello mediante el ecosistema ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder ViT-G/14, 52 capas (39 con sliding window de 2048, 13 full attention NoPE) |
| Parametros totales | 29.6B (denominado 30B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | INT4 (Q4_K_M-style) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx dentro del paquete GenAI) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer denso de 29.6B parámetros con un encoder de visión ViT-G/14. Su arquitectura intercala dos tipos de capas: 39 capas con atención deslizante que solo consideran los últimos 2.048 tokens, y 13 capas de atención completa sin posicional (NoPE) distribuidas cada cuatro capas. Esta combinación permite manejar contextos de hasta 128K tokens con un coste computacional reducido. La conversión ONNX reproduce fielmente esta estructura mediante el atributo `local_window_size` en las operaciones `GroupQueryAttention`, y el paquete incluye el programa de preprocesamiento de imágenes (redimensionado bicúbico a múltiplos de 28, normalización CLIP y parcheado de 14 píxeles).

El entrenamiento original del modelo no está documentado en la información disponible, pero se sabe que es una destilación de Muse Spark, un modelo más grande, y que fue ajustado específicamente para uso como agente local: tool calling en formato XML (ATEM), razonamiento canalizado por ámbito y recuperación ante fallos. La conversión a ONNX no modifica los pesos, solo los cuantiza a INT4 y adapta la configuración para el runtime GenAI. Se validó que el chat template generado coincide byte a byte con el de llama.cpp.

## Capacidades

- Generación de texto y razonamiento multi-paso con canalización por ámbitos (channel-scoped reasoning).
- Comprensión de imágenes: entrada de imágenes y descripción correcta, según la validación del autor.
- Tool calling / function calling en formato XML ATEM (no JSON), con parsers dedicados necesarios.
- Soporte para agentes: manejo de peticiones largas con definiciones de herramientas, con recuperación ante fallos.
- Contexto largo de 128K tokens, aunque con atención deslizante en la mayoría de capas.
- Conversación multimodal (image-text-to-text) con plantilla de chat compatible con llama.cpp.
- Ejecución local en una sola GPU gracias a la cuantización INT4.

## Casos de uso

- Agente local siempre activo: el modelo puede ejecutarse en una GPU dedicada y gestionar tareas de automatización del sistema, como leer correos, programar citas o interactuar con APIs, gracias a su tool calling en XML y su capacidad de razonamiento multi-paso.
- Asistente de código con contexto largo: con 128K de contexto, puede analizar repositorios completos, generar parches y ejecutar herramientas de desarrollo integradas en un pipeline de CI/CD.
- Atención al cliente automatizada: el modelo mantiene conversaciones multi-turno con memoria de hasta 128K tokens, pudiendo consultar bases de conocimiento y emitir respuestas con llamadas a herramientas de CRM.
- Análisis de imágenes con razonamiento: al ser multimodal, puede describir capturas de pantalla, diagramas o fotografías y razonar sobre ellas, útil para soporte técnico o documentación automática.
- Automatización de tareas de investigación: con acceso a herramientas de búsqueda web o APIs, puede recopilar información, resumir documentos y estructurar resultados en informes.
- Chat conversacional con memoria extendida: su ventana de contexto permite mantener hilos de conversación muy largos sin perder el hilo, adecuado para asistentes personales o educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta una validación end-to-end en una NVIDIA H200 con ONNX GenAI nativo:

- Una petición de agente de 5.300 tokens con definiciones de herramientas produjo una respuesta coherente tras aproximadamente 800 tokens de razonamiento, comparable a una ejecución de referencia con llama.cpp sobre los mismos pesos.
- Una llamada a herramienta completa se completó en unos 5 segundos.
- La entrada de imagen fue descrita correctamente.
- El chat template coincidió byte a byte con el de llama.cpp.

No hay cifras de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- GPU NVIDIA con soporte CUDA (validado en H200; se requiere el Execution Provider CUDA de ONNX Runtime).
- VRAM estimada: no especificada por el autor. Dado que el modelo tiene ~29.6B parámetros en INT4, el tamaño de los pesos ronda los 15-16 GB, por lo que se estima que cabe en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090/4090, A5000), aunque es una estimación razonable no confirmada.
- En GPUs Hopper (H100, H200) es necesario deshabilitar la ruta cuDNN SDPA antes de importar ONNX Runtime GenAI, manteniendo Flash Attention y memory-efficient attention.
- Despliegue: requiere `onnxruntime-genai-cuda` con soporte para Muse Glimmer (PR #2397), validado con ONNX Runtime 1.28.0 y GenAI 0.16.0-dev. También se puede ejecutar con `onnx-genai run` usando el backend nativo.
- CUDA Graph capture está habilitado para el decoder autoregresivo, lo que reduce la latencia de generación.
- Latencia observada: ~5 segundos para una llamada a herramienta y 30-80 segundos para una petición de agente de 5.300 tokens en H200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (original) | 29.6B | 128K | BF16 | Apache 2.0 | Hugging Face (safetensors) |
| Muse-Glimmer-30B-ONNX-INT4 (este) | 29.6B | 128K | INT4 | Apache 2.0 | ONNX GenAI |
| Muse Spark (modelo padre) | No disponible | No disponible | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría (por ejemplo, Qwen2.5-VL o Llama 3.2 Vision). La comparativa se limita a la relación con el modelo original y su predecesor.

## Limitaciones y advertencias

- Dependencia de una versión específica de ONNX Runtime GenAI: el paquete requiere el soporte de Muse Glimmer incluido en el PR #2397, que aún no está en una release estable. Sin esa versión, la carga nativa fallará.
- La atención deslizante es una propiedad por capa: el runtime no debe evictar entradas KV globalmente, o las capas de atención completa se quedarán sin contexto. El paquete ya incluye la máscara correcta, pero cualquier runtime que la ignore producirá resultados degenerados en contextos largos.
- El modelo emite tool calls en formato XML ATEM, no JSON. Los parsers estándar de tool calling no funcionarán; se necesitan los parsers dedicados `muse_glimmer`.
- No se han publicado evaluaciones de sesgos, alucinación o robustez. Como modelo de agente, puede generar razonamientos incorrectos o alucinar herramientas inexistentes.
- La licencia Apache 2.0 permite uso comercial, pero el paquete incluye una política de uso (`USAGE_POLICY.md`) que debe revisarse antes de desplegar en producción.
- El tamaño del repositorio (38.4 GB) incluye todos los assets del pipeline; la descarga puede ser pesada para entornos con ancho de banda limitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/justinchuby/Muse-Glimmer-30B-ONNX-INT4-CUDA
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Página oficial de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Receta vLLM: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- PR de Mobius para sliding window: https://github.com/onnxruntime/mobius/pull/514
- PR de onnxruntime-genai para soporte Muse Glimmer: https://github.com/microsoft/onnxruntime-genai/pull/2397
- Issue de benchmark en MLX EP: https://github.com/justinchuby/onnxruntime-mlx/issues/26
