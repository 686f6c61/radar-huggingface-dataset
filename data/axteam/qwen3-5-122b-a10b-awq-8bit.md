# axteam/Qwen3.5-122B-A10B-AWQ-8bit

## Resumen

Qwen3.5-122B-A10B-AWQ-8bit es una versión cuantizada en 8 bits (AWQ INT8, esquema W8A16) del modelo multimodal Qwen3.5-122B-A10B de Qwen, preparada por el usuario axteam específicamente para servir inferencia con vLLM. El modelo base es un MoE híbrido de 122B parámetros totales (~10B activos por token) con capacidades de visión y lenguaje, y esta variante reduce su huella de memoria manteniendo en BF16 los componentes más sensibles a la cuantización.

El problema que resuelve es claro: servir un modelo de 122B parámetros requiere una cantidad de VRAM prohibitiva en precisión completa, y esta cuantización AWQ (post-training, sin reentrenamiento) reduce el tamaño en disco a unos 137,2 GB, haciendo viable el despliegue en servidores con múltiples GPU de gama alta sin sacrificar demasiado calidad. La calibración se realizó con 256 muestras de un corpus mixto con predominio de coreano, algo a tener en cuenta para uso en otros idiomas.

Es relevante porque combina tres tendencias actuales: arquitecturas híbridas (atención lineal + atención completa), MoE con ratio de activación muy bajo (~8% de parámetros activos) y cuantización INT8 optimizada para vLLM mediante el formato compressed-tensors. Incluye además una cabecera MTP (multi-token prediction) para decodificación especulativa y modo de razonamiento (thinking) activado por defecto en la plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + atención completa), MoE con 256 expertos + experto compartido, multimodal (visión), cabecera MTP |
| Parametros totales | 125.086.497.008 (~122B, dato real de safetensors) |
| Parametros activos | ~10B por token (MoE) |
| Longitud de contexto | No disponible en la ficha (el ejemplo de vLLM usa `--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simétricos, group size 32, activaciones BF16), formato compressed-tensors `pack-quantized`; KV-cache FP8 opcional en tiempo de ejecución |
| Idiomas soportados | No disponible (calibración con corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

## Arquitectura y entrenamiento

El modelo base combina atención lineal (con componentes SSM no lineales como `conv1d`, `A_log` y `dt_bias`) con capas de atención completa, un diseño híbrido que reduce el coste de la KV-cache en secuencias largas manteniendo calidad de atención precisa donde importa. La capa de salida es un MoE con 256 expertos más un experto compartido, activando unos 10B de los 122B parámetros totales por token, lo que permite throughput alto para su clase de modelo. Incorpora una cabecera de predicción multi-token (MTP) que habilita decodificación especulativa, y un tower de visión con proyector para entrada de imagen-texto (pipeline `image-text-to-text`).

Esta variante es una cuantización post-training (PTQ) sin reentrenamiento: AWQ usa un pequeño conjunto de calibración (256 muestras, sin gradientes) para proteger los canales de peso salientes antes del redondeo. El esquema es W8A16: pesos INT8 simétricos con group size 32 y activaciones en BF16. Se mantuvieron en BF16, aproximadamente el 4% de los parámetros, el tower de visión y el proyector, la cabecera MTP, todas las RMSNorm, los embeddings, el LM head, el router MoE y la puerta del experto compartido, y las partes no lineales del SSM, con el objetivo de preservar la calidad. Tokenizer, chat template y generation config son idénticos a los del original.

## Capacidades

- Generación de texto conversacional multimodal: acepta texto e imágenes (URL o data URI) como entrada (pipeline image-text-to-text).
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat; desactivable con `chat_template_kwargs={"enable_thinking": False}`.
- Arquitectura MoE con ~10B parámetros activos, orientada a inferencia eficiente y alto throughput.
- Cabecera MTP para decodificación especulativa (multi-token prediction).
- Compatibilidad con servidores OpenAI-compatible vía vLLM.
- Soporte de imágenes y vídeo según la configuración de vLLM (`--limit-mm-per-prompt` permite desactivar la carga del encoder de visión).
- No hay información específica en la ficha sobre tool calling, agentes, matemáticas o código.

## Casos de uso

- Servido de LLM multimodal autoalojado: despliegue con vLLM como servidor OpenAI-compatible (`vllm serve ... --max-model-len 32768`), ideal para equipos que quieren control total sobre sus datos sin depender de APIs de terceros.
- Análisis y descripción de imágenes en aplicaciones: el pipeline image-text-to-text permite enviar imágenes por URL o data URI y obtener descripciones, extracción de información o respuestas sobre contenido visual.
- Chatbots de alto throughput: la combinación MoE (~10B activos) y cuantización INT8 permite servir muchos usuarios concurrentes en menos GPUs que el modelo en BF16, reduciendo coste por token.
- Procesamiento de documentos con contexto largo: la arquitectura híbrida con atención lineal reduce el coste de la KV-cache en secuencias largas, y `--kv-cache-dtype fp8` la reduce a la mitad adicionalmente.
- Experimentación con decodificación especulativa: la cabecera MTP integrada permite explorar técnicas de multi-token prediction para acelerar la generación.
- Despliegue con presupuesto de VRAM ajustado: se puede servir solo texto (`--limit-mm-per-prompt '{"image": 0, "video": 0}'`) para liberar la memoria del encoder de visión cuando no se necesita multimodalidad.
- Entornos con predominio de coreano: la calibración AWQ se realizó con corpus mixto con predominio de coreano, por lo que es una opción razonable para despliegues orientados a ese idioma (aunque el modelo base es multilingüe).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones comparativas de la versión cuantizada frente al modelo base en BF16 ni frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: el repo pesa ~137,2 GB en INT8; para inferencia se necesita al menos ese espacio en VRAM (o VRAM + CPU RAM con offloading), más la KV-cache. Con BF16 el modelo base ocuparía ~250 GB, así que la cuantización ahorra aproximadamente la mitad.
- GPUs recomendadas: no disponible explícitamente; en la práctica, ~137 GB de pesos requieren un nodo multi-GPU de gama datacenter (por ejemplo, 2x H100 80GB o 3-4x A100 80GB, según configuración de paralelismo). No cabe en GPUs de consumo (una RTX 4090 con 24 GB es muy insuficiente).
- Consumer GPU: no es viable; el tamaño del modelo excede con mucho la VRAM de cualquier GPU de consumo actual.
- Despliegue: vLLM es el runtime para el que está preparado el formato compressed-tensors (`vllm serve` con servidor OpenAI-compatible o inferencia offline en Python). No hay evidencia de compatibilidad con llama.cpp, Ollama o TGI en la ficha.
- Latencia y throughput: no disponibles explícitamente; el diseño MoE con ~10B parámetros activos y la cabecera MTP están orientados a alta velocidad de generación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Cuantizacion | Multimodal | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-AWQ-8bit (esta ficha) | ~122B | ~10B | AWQ INT8 W8A16 | Sí (visión) | Apache-2.0 |
| Qwen/Qwen3.5-122B-A10B (base) | ~122B | ~10B | BF16 (sin cuantizar) | Sí (visión) | Apache-2.0 |
| DeepSeek-V3 (referencia MoE de gran escala) | ~671B | ~37B | BF16 / versiones FP8 comunitarias | No (texto) | Licencia propia (MIT con restricciones parciales) |

Comparado con su modelo base, esta variante ofrece la misma funcionalidad con ~137 GB en disco frente a ~250 GB, a costa de una posible pérdida mínima de calidad por la cuantización (no cuantificada en la ficha). Frente a otros MoE de gran escala, destaca por su bajo ratio de activación (~8%) y su licencia Apache-2.0 sin restricciones comerciales. No se dispone de benchmarks para comparar rendimiento medido.

## Limitaciones y advertencias

- La calibración AWQ se realizó con 256 muestras de un corpus mixto con predominio de coreano, lo que puede degradar ligeramente la calidad de la cuantización en otros idiomas, incluido el castellano.
- Es una cuantización post-training sin validación publicada: no hay benchmarks que cuantifiquen la pérdida de calidad frente al modelo BF16 original.
- No hay datos publicados sobre alucinaciones, sesgos ni rendimiento en tareas específicas para esta variante.
- La longitud de contexto máxima del modelo base no consta en la ficha; el ejemplo de despliegue usa 32768 tokens, pero podría no ser el límite real.
- Requiere hardware de datacenter multi-GPU (~137 GB de pesos), lo que limita el acceso a organizaciones con infraestructura seria; no es ejecutable en equipos de consumo.
- El formato compressed-tensors está orientado a vLLM; la compatibilidad con otros runtimes (llama.cpp, Ollama, TGI) no está documentada.
- El modo thinking está activado por defecto, lo que genera tokens de razonamiento adicionales; hay que desactivarlo explícitamente si no se desea.
- Al ser un modelo cuantizado por un tercero (axteam) con pocas descargas (22) y un like, el soporte comunitario y la madurez son limitados; para producción crítica conviene validar contra el modelo oficial.
- Licencia Apache-2.0: sin restricciones para uso comercial, aunque los derechos sobre pesos, tokenizer y chat template originales pertenecen al equipo de Qwen.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.5-122B-A10B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
