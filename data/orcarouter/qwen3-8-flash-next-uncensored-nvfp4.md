# orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4

## Resumen

Qwen3.8-Flash-Next-Uncensored-NVFP4 es una cuantización de 8 bits en formato NVFP4 (FP4 con escalas FP8) del modelo multimodal Qwen3.8-Flash-Next, publicada por el usuario orcarouter bajo licencia Apache 2.0. Se trata de un modelo de arquitectura MoE (mixture of experts) con 180.000 millones de parámetros totales, orientado a tareas image-text-to-text, con capacidades declaradas de razonamiento, function calling y conversación multilingüe en inglés y chino. La variante "Uncensored" indica que los pesos han sido sometidos a un proceso de abliteration, es decir, la eliminación de la dirección de activación asociada al rechazo, lo que reduce las negativas del modelo ante peticiones sensibles.

El interés de esta ficha reside en dos ejes. Por un lado, la compresión NVFP4/FP8 reduce el peso del repositorio a 188,8 GB, lo que permite desplegar un modelo de 180B en hardware de una sola máquina con GPUs de 80 GB o en configuraciones multi-GPU más asequibles que las requeridas por los pesos en BF16. Por otro lado, la orientación explícita a red teaming y evaluación de seguridad (tags `ai-red-team`, `red-teaming`) convierte al modelo en una herramienta para investigadores que necesitan estudiar comportamientos no filtrados de un LLM de gran escala.

El acceso está restringido en Hugging Face (modelo gated): es necesario aceptar las condiciones del repositorio antes de descargar los pesos. El modelo base es Qwen/Qwen3.8-Flash-Next, del que no se dispone de documentación técnica en la información proporcionada, por lo que varios datos de arquitectura y entrenamiento se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); detalles de capas y atención no disponibles |
| Parametros totales | 179.999.981.459 (≈180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 con escalas FP8), comprimido con compressed-tensors; tag 8-bit |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |
| Modalidad | image-text-to-text (vision-language) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Tamano del repositorio | 188,8 GB |
| Acceso | restringido (gated) en Hugging Face |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen3.8-Flash-Next original, no un entrenamiento desde cero. La arquitectura subyacente es un transformer con mezcla de expertos (MoE), según los tags del repositorio, con 180.000 millones de parámetros totales. Al tratarse de una variante multimodal image-text-to-text, incorpora un codificador visual y proyecciones hacia el espacio del modelo de lenguaje, aunque no se dispone de detalles sobre el número de capas, la dimensión oculta, el número de expertos ni la proporción de parámetros activos por token.

El proceso de cuantización emplea NVFP4, un formato de 4 bits con escalas de bloque en FP8, implementado mediante la librería compressed-tensors. Este esquema reduce el peso a aproximadamente 188,8 GB, un tamaño coherente con 180B parámetros a ~8 bits efectivos (incluyendo escalas y metadatos). La variante incorpora además abliteration, una técnica de edición de pesos que proyecta fuera la dirección de rechazo calculada a partir de pares de respuestas aceptadas y rechazadas, sin reentrenamiento adicional. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento (tag `reasoning`) y resolución de problemas de varios pasos.
- Function calling y tool calling, según los tags del repositorio.
- Procesamiento de imágenes junto con texto (pipeline image-text-to-text): descripción, respuesta a preguntas visuales y conversación sobre imágenes.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que el modelo base declinaría, gracias a la abliteration.
- Uso previsto para red teaming y evaluación de seguridad de LLMs.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con vLLM para despliegue en producción.

## Casos de uso

- Red teaming y auditoría de seguridad: el modelo sirve como sujeto de prueba para medir la eficacia de filtros, clasificadores de seguridad y políticas de moderación, al disponer de una variante sin el sesgo de rechazo del modelo base. Es adecuado porque permite observar respuestas que un modelo alineado ocultaría, sin necesidad de jailbreaks.
- Investigación sobre abliteration: comparar las respuestas de esta variante con las del Qwen3.8-Flash-Next original permite cuantificar el efecto de la eliminación de la dirección de rechazo en calidad, coherencia y seguridad, con pesos de 180B en un formato desplegable.
- Evaluación de compresión NVFP4: el repositorio permite estudiar la degradación de calidad de un MoE de 180B cuantizado a ~8 bits efectivos frente a BF16, útil para decidir formatos de despliegue en producción.
- Asistente multimodal sobre documentos: con entrada image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales, en flujos de extracción y resumen para usuarios de inglés o chino.
- Automatización con function calling: integración en pipelines de agentes que requieren invocar herramientas externas, aprovechando el soporte declarado de tool calling y la compatibilidad con vLLM para servir peticiones concurrentes.
- Generación de datos sintéticos para entrenamiento: al no aplicar rechazos, puede producir corpus de conversación diversos para experimentos de destilación o ajuste fino, con revisión humana posterior obligatoria.
- Despliegue en infraestructura limitada: los 188,8 GB de pesos permiten servir un modelo de 180B en un nodo con varias GPUs de 80 GB, algo inviable con los pesos en BF16 (~360 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 188,8 GB, por lo que se necesita al menos esa capacidad agregada más overhead de KV cache y activaciones; en la práctica, un nodo con 2× H100 80 GB o 3× A100 80 GB cubre los pesos con margen ajustado, y 4× H100 80 GB ofrece holgura para contextos largos y concurrencia.
- GPU recomendadas: H100 80 GB, H200 141 GB, A100 80 GB en configuraciones multi-GPU. No se recomienda fragmentar en GPUs de 24 GB por el coste de comunicación entre 8 o más dispositivos.
- GPU de consumo: no cabe en ninguna GPU consumer actual (RTX 4090 24 GB, RTX 5090 32 GB) ni siquiera con offloading parcial razonable; requeriría descarga a RAM/SSD con latencia muy alta.
- Opciones de despliegue: vLLM (soporte de compressed-tensors y NVFP4 en versiones recientes), transformers con compressed-tensors, y servidores compatibles con endpoints. llama.cpp y Ollama no soportan NVFP4 de forma nativa en la información disponible.
- Latencia y throughput: no disponibles. Al ser un MoE, el throughput dependerá del número de parámetros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-NVFP4 (este) | 180B (MoE) | no disponible | image-text-to-text | Apache 2.0 | gated |
| Qwen/Qwen3.8-Flash-Next (base) | 180B (MoE) | no disponible | image-text-to-text | no disponible en la informacion | no disponible |
| Alternativas de 180B MoE multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La abliteration elimina el mecanismo de rechazo, pero no garantiza la ausencia de contenido dañino ni mejora la veracidad; el riesgo de alucinación persiste y puede aumentar en dominios sensibles.
- Modelo gated: el uso comercial requiere aceptar las condiciones de Hugging Face y verificar que la licencia Apache 2.0 del repositorio es aplicable a los pesos derivados; conviene revisar los términos del modelo base Qwen3.8-Flash-Next, no disponibles aquí.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La cuantización NVFP4 introduce degradación numérica respecto a BF16; no se han publicado evaluaciones de la pérdida de calidad en este repositorio.
- Sesgos: no se han documentado evaluaciones de sesgo para esta variante; al derivar de un modelo entrenado principalmente con datos en inglés y chino, es esperable un sesgo cultural y lingüístico hacia esas poblaciones.
- No apto para producción orientada a usuarios finales sin una capa de moderación externa, dado su carácter uncensored.
- Sin datos de longitud de contexto ni de parámetros activos, es difícil dimensionar la KV cache y planificar el throughput; debe validarse empíricamente antes de comprometer SLA.
- El uso para red teaming debe enmarcarse en un protocolo ético y legal; la generación de contenido dañino sin supervisión puede tener implicaciones legales.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Librería compressed-tensors: no disponible en la busqueda web
- Documentación de vLLM: no disponible en la busqueda web
- Paper o blog del modelo base: no disponible en la busqueda web
