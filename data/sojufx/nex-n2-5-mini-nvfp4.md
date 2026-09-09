# sojufx/Nex-N2.5-mini-NVFP4

## Resumen

El modelo Nex-N2.5-mini-NVFP4 es una conversión NVFP4 del checkpoint original en BF16 de Nex-N2.5-mini, creada por sojufx para ejecutar el modelo en GPU NVIDIA Blackwell. La conversión, realizada con NVIDIA ModelOpt, aplica una precisión mixta: los expertos enrutados del MoE se cuantizan a NVFP4 W4A16, las proyecciones de atención completa e híbrida lineal a FP8, y los componentes más sensibles — el `lm_head`, el codificador de visión y la cabeza MTP — se mantienen en BF16 para preservar la calidad de la generación y el razonamiento. El modelo base, Nex-N2.5-mini, es un modelo multimodal y agéntico de la familia Nex-N2.5 de Nex-AGI, con capacidades de visión, seguimiento de instrucciones y uso de herramientas.

El checkpoint resultante tiene 18.938.140.016 parámetros y se distribuye en formato safetensors, con un tamaño de 22.5 GB. Está diseñado para servirse mediante vLLM en entornos con soporte para arquitecturas Qwen 3.5 MoE y checkpoints ModelOpt mixtos. No se dispone de datos oficiales sobre longitud de contexto, idiomas soportados o benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal basada en Qwen 3.5, con atención híbrida (completa + lineal) y componente de visión |
| Parametros totales | 18.938.140.016 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16, FP8, BF16 (precisión mixta) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MoE de Qwen 3.5, con un módulo de visión y un mecanismo de atención híbrido que combina proyecciones de atención completa y lineal. Al ser una conversión de precisión, no se aportan datos sobre el dataset de entrenamiento ni sobre el número de expertos activos. El proceso de cuantización utiliza la receta `huggingface/qwen3_5_moe/ptq/qwopus_w4a16_nvfp4_bf16_lm_head` con una calibración de 256 muestras de WikiText. La conversión se realizó a partir de la revisión `87420286149d9cce9bd46cd335ef9bda33c37c1b` del modelo base, sin necesidad de reentrenamiento.

Una innovación técnica destacable es la preservación en BF16 del `lm_head`, que produce los logits de siguiente token; esto mejora la fidelidad en tareas de instrucción, salida estructurada y uso de herramientas. Además, la cabeza MTP (multi-token prediction) y el codificador de visión también se mantienen en alta precisión para evitar pérdidas en tareas multimodales.

## Capacidades

- Generación de texto conversacional con soporte de imágenes (pipeline image-text-to-text).
- Comprensión de instrucciones y generación de salida estructurada, útil para llamadas a herramientas (tool calling).
- Capacidades agénticas: puede ejecutar tareas de larga duración y auto-corregirse mediante retroalimentación visual, según la documentación de la familia Nex-N2.5.
- Integración en agentes y flujos de razonamiento multi-paso.
- Idiomas soportados: no disponible.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Atención al cliente multimodal: en un chatbot de soporte, el usuario adjunta una fotografía del producto defectuoso; el modelo interpreta la imagen y genera una respuesta en texto. Es adecuado porque combina comprensión de visión con generación de lenguaje conversacional.
- Inspección visual automatizada en entornos industriales: una cámara captura imágenes de componentes y el modelo, desplegado en un servicio de visión, las analiza para detectar anomalías y generar informes. Su capacidad de auto-corrección y su arquitectura MoE permiten procesar secuencias de imágenes manteniendo el contexto.
- Asistentes de escritorio con uso de herramientas: integrado en un agente de automatización, el modelo puede ejecutar funciones (crear ficheros, consultar APIs) a partir de instrucciones en lenguaje natural. Su soporte de tool calling y su precisión en el `lm_head` facilitan la generación de comandos estructurados.
- Análisis de documentos escaneados y capturas de pantalla: en un flujo de digitalización, el modelo extrae información de facturas o capturas de aplicaciones y produce datos estructurados para un sistema de gestión. La combinación de visión y salida estructurada es clave.
- Depuración visual de interfaces de usuario: un desarrollador sube una captura de pantalla con un error visual; el modelo la interpreta y sugiere cambios de código o configuración. Es adecuado porque, al estar orientado a tareas agénticas, puede relacionar la imagen con instrucciones técnicas.
- Servicio de inferencia de alta disponibilidad en GPU Blackwell: para un servicio de producción que necesita servir un modelo multimodal de 18.9B con baja latencia, la cuantización NVFP4 reduce la VRAM requerida y permite desplegarlo con vLLM. La configuración `--kv-cache-dtype fp8` y `--gpu-memory-utilization 0.80` ilustra el uso previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del checkpoint: 22.5 GB. La VRAM necesaria para la inferencia no está especificada por el autor; en la práctica, con vLLM se recomienda una GPU con al menos 40-48 GB de VRAM, reservando 0.80 de utilización y usando `--kv-cache-dtype fp8`.
- GPU recomendada: NVIDIA Blackwell (B100, B200) para aprovechar la compatibilidad nativa con NVFP4. En GPUs Hopper o Ampere, los pesos NVFP4 pueden no ser compatibles o perder rendimiento.
- No se confirma que pueda ejecutarse en GPUs de consumo (por ejemplo, RTX 4090) debido al tamaño del checkpoint y a la arquitectura de cuantización.
- Opciones de despliegue: vLLM con `--trust-remote-code` (recomendado), y Transformers para cargas directas de safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información proporcionada. No se dispone de datos de rendimiento ni de benchmarks para situar el modelo frente a alternativas de su mismo tamaño o categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se han publicado evaluaciones de sesgo ni del comportamiento ético.
- Alucinaciones: como todo modelo de lenguaje multimodal de 18.9B, puede generar descripciones incorrectas o inventar detalles cuando la imagen es ambigua o el contexto es insuficiente.
- Limitaciones de contexto e idioma: la información de la model card no incluye la longitud de contexto oficial ni los idiomas soportados; por tanto, no se puede garantizar un rendimiento óptimo en todas las lenguas.
- Licencia Apache-2.0: el modelo base y esta conversión se publican bajo Apache-2.0, lo que permite uso comercial, pero no hay garantías de seguridad ni soporte; el usuario debe revisar las condiciones del modelo original.
- Dependencia de hardware: la cuantización NVFP4 está optimizada para GPU NVIDIA Blackwell; en otros entornos puede no cargar correctamente o requerir un vLLM específico.
- La conversión no introduce cambios en el modelo base: las limitaciones del modelo original se mantienen, y no se ha realizado una evaluación de robustez frente a ataques adversarios.

## Enlaces

- Repositorio HuggingFace del modelo: [https://huggingface.co/sojufx/Nex-N2.5-mini-NVFP4](https://huggingface.co/sojufx/Nex-N2.5-mini-NVFP4)
- Modelo base: [https://huggingface.co/nex-agi/Nex-N2.5-mini](https://huggingface.co/nex-agi/Nex-N2.5-mini)
- GitHub de Nex-AGI para Nex-N2.5: [https://github.com/nex-agi/Nex-N2.5](https://github.com/nex-agi/Nex-N2.5)
- GitHub de Nex-AGI para Nex-N2: [https://github.com/nex-agi/Nex-N2](https://github.com/nex-agi/Nex-N2)
