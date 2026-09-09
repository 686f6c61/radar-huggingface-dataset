# nikita-savelyev-cerebras/tiny-random-kimi-k3

## Resumen

El modelo `tiny-random-kimi-k3` es un modelo de depuración creado por nikita-savelyev-cerebras a partir de la configuración de `moonshotai/Kimi-K3`. Se trata de una versión reducida y aleatoriamente inicializada del modelo multimodal Kimi-K3, diseñada para probar la integración con frameworks como vLLM, SGLang y Transformers sin necesidad de cargar el modelo original, que tiene un tamaño mucho mayor. Con 213.968.528 parámetros y un peso de 133.5 MB en formato safetensors, permite validar kernels de atención, rutas MoE y pipelines de tool calling de forma rápida y ligera.

Arquitectónicamente, replica la estructura híbrida del Kimi-K3: una combinación de atención KDA (Kimi Denoising Attention) y MLA (Multi-head Latent Attention), con capas FFN en MoE y una capa final MLA. Sin embargo, al estar inicializado con pesos aleatorios, no tiene capacidades semánticas reales; su único propósito es la depuración técnica y el desarrollo de infraestructura de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con KDA y MLA, MoE |
| Parametros totales | 213.968.528 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la configuración del modelo base indica MXFP4 en expertos enrutados, group_size=32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, 133.5 MB) |
| Capas totales | 17 (4 grupos de atención + capa final MLA) |
| Hidden size | 8 |
| Cabezas de atención | 8 |
| Expertos enrutados | 64 |
| Enrutamiento MoE | top-16, 2 expertos compartidos, group=1 |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del Kimi-K3 original, pero con dimensiones muy reducidas. Cada grupo de atención contiene 3 capas KDA y 1 capa MLA, y la capa final es MLA. La proporción global KDA:MLA es de 12:5, frente a 69:24 del modelo original. La primera capa FFN es un MLP denso y el resto son capas MoE con enrutamiento top-16, 2 expertos compartidos y 64 expertos enrutados (frente a los 896 del original). El número de cabezas de atención se reduce de 96 a 8, el rango de LoRA de consulta MLA de 1536 a 256, y el hidden size a 8. El rango kv_lora_rank se mantiene en 512 para preservar la compatibilidad con el kernel de decodificación MLA fusionado de vLLM, que requiere un tamaño de caché/cabeza de consulta de 512 + 64 = 576.

No se dispone de datos de entrenamiento: el modelo es aleatoriamente inicializado a partir de la configuración del Kimi-K3. La creación de este repositorio fue asistida por GPT-5.5 y Kimi-K3.

## Capacidades

- Procesamiento multimodal de imágenes y texto: el pipeline es image-text-to-text, y el ejemplo de Transformers muestra cómo procesar una imagen junto con un mensaje de texto.
- Soporte de tool calling / function calling: incluye un ejemplo con una herramienta `get_image_size` y `tool_choice='required'`, lo que permite probar flujos de llamadas a funciones.
- Compatibilidad con frameworks de inferencia: se proporcionan comandos de despliegue para vLLM (con `--moe-backend marlin`) y SGLang (con `--moe-runner-backend marlin`), además de Transformers con `trust_remote_code`.
- Arquitectura MoE configurable: permite validar el enrutamiento top-16, los expertos compartidos y la cuantización MXFP4 en un modelo pequeño.
- Atención híbrida KDA + MLA: útil para desarrollar y depurar kernels de atención específicos de Kimi K3.
- Capacidades reales de razonamiento o generación coherente: no disponibles, al ser un modelo aleatorio sin entrenar.

## Casos de uso

- Pruebas de integración en vLLM: permite verificar que el servidor arranca con la configuración K3 utilizando variables como `VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION`, y que las peticiones se completan sin errores.
- Desarrollo de kernels de atención: al tener pocas capas y un tamaño de kv_lora_rank fijo de 512, sirve para probar el kernel MLA fusionado de vLLM y el comportamiento de las capas KDA en un entorno controlado.
- Validación de pipelines de tool calling: el ejemplo con `get_image_size` y `tool_choice='required'` permite depurar el flujo de mensajes, la generación de argumentos de función y la decodificación de respuestas con Transformers.
- Pruebas de entrada multimodal: al ser image-text-to-text, se puede usar para verificar que el procesador maneja imágenes de distintos tamaños (por ejemplo, 56x56) y que la ruta de visión no introduce incompatibilidades.
- Depuración de backends MoE y cuantización: con 64 expertos enrutados y cuantización MXFP4, es adecuado para probar el backend marlin y el fallback de cuantización sin cargar un modelo grande.
- Fixtures para tests unitarios en CI/CD: su tamaño reducido (213.968.528 parámetros, 133.5 MB) lo convierte en un candidato para automatizar pruebas de carga de modelos, creación de procesadores y comprobaciones de despliegue en pipelines de integración continua.
- Desarrollo de backends en SGLang: el comando de despliegue con `--tp-size 2 --ep-size 2` y `--decode-attention-backend flashmla` sirve para probar el soporte de MoE y la atención habitual en un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 213.968.528 parámetros en bfloat16, los pesos ocupan aproximadamente 0.43 GB. Añadiendo overhead de activaciones y kernels de atención, la inferencia debería caber en menos de 1 GB de VRAM.
- GPU recomendadas: al ser un modelo tan pequeño, cualquier GPU consumer con al menos 2 GB de VRAM es suficiente. Los ejemplos de vLLM y SGLang usan NVIDIA H20 con tensor-parallel-size 2, pero esto se debe a requisitos de los backends, no a la demanda de memoria del modelo.
- Opciones de despliegue: vLLM (con flags específicos), SGLang, y Transformers (con `trust_remote_code=True` y `attn_implementation='eager'`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tiny-random-kimi-k3 (este modelo) | 213.968.528 | no disponible | no disponible | HuggingFace |
| tiny-random-kimi-k2.5 | no disponible | no disponible | no disponible | HuggingFace |
| moonshotai/Kimi-K3 | no disponible | no disponible | no disponible | HuggingFace (modelo base) |

## Limitaciones y advertencias

- Modelo aleatoria e inicializado: no tiene peso entrenado, por lo que no genera texto coherente ni respuestas útiles para ninguna tarea real.
- No debe usarse en producción: su único propósito es la depuración técnica y el desarrollo de infraestructura de inferencia.
- Licencia no disponible: no se conoce la licencia, por lo que hay que verificar los términos antes de cualquier redistribución o uso comercial.
- Requiere `trust_remote_code` y código personalizado: esto supone un riesgo de seguridad al ejecutar código remoto de terceros.
- Configuración de cuantización ambigua: se indica que el modelo base usa MXFP4 en expertos enrutados, pero no se especifica si esta cuantización está realmente aplicada en este modelo de prueba.
- Sin benchmarks ni garantías de rendimiento: no hay datos de calidad, latencia ni estabilidad.
- Limitaciones de arquitectura: el hidden size de 8 y la reducción de capas hacen que el modelo no sea representativo del comportamiento real del Kimi-K3.

## Enlaces

- https://huggingface.co/nikita-savelyev-cerebras/tiny-random-kimi-k3
- https://huggingface.co/moonshotai/Kimi-K3 (modelo base mencionado)
- https://huggingface.co/nikita-savelyev-cerebras/tiny-random-kimi-k2.5 (encontrado en la búsqueda web)
- https://friendli.ai/models/nikita-savelyev-cerebras/tiny-random-kimi-k2.5 (encontrado en la búsqueda web)
