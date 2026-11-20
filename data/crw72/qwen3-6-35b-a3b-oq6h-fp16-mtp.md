# crw72/Qwen3.6-35B-A3B-oQ6h-fp16-mtp

## Resumen
Qwen3.6-35B-A3B-oQ6h-fp16-mtp es una cuantización mixta del modelo base Qwen/Qwen3.6-35B-A3B, publicada por el usuario crw72 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado con la herramienta oQ (oMLX v0.8.0) en formato MLX, pensado para ejecución en hardware Apple Silicon. El modelo base es un Mixture of Experts (MoE) de Qwen con 35 000 millones de parámetros totales y 3 000 millones activos por token, según se deduce de su nombre.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización mixta que combina precisión de 6 y 8 bits con capas en FP16 y FP32 para preservar la calidad del modelo original; por otro, permite ejecutar un MoE de gran tamaño en equipos con memoria unificada de gama alta (Mac Studio, MacBook Pro con M-series Max/Ultra) sin necesidad de GPUs dedicadas. El checkpoint ocupa 31,3 GB en disco y presenta un promedio efectivo de 26,309 bits por peso, un dato poco habitual que conviene interpretar con cautela (ver limitaciones).

La información pública disponible es escasa: la model card solo documenta la distribución de bits y el desglose de almacenamiento, sin detallar el dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks. Esta ficha refleja esa limitación y marca como "no disponible" todo aquello que no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), con cabeza MTP y módulo de visión |
| Parametros totales | 9.500.428.144 (checkpoint cuantizado); modelo base: 35B totales / 3B activos (según nombre) |
| Parametros activos | 3B (según nombre del modelo base, no verificado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit group 64, affine 8-bit group 128, affine 8-bit group 64, FP16, FP32, U32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantización oQ |

## Arquitectura y entrenamiento
El checkpoint deriva de Qwen/Qwen3.6-35B-A3B, un modelo Mixture of Experts de la familia Qwen3.5/3.6. La arquitectura se identifica en los tags como `qwen3_5_moe`, lo que confirma un transformer con capas MoE y enrutamiento por token. El checkpoint incluye además una cabeza MTP (Multi-Token Prediction) de 0,845B de parámetros lógicos y un módulo de visión de 0,447B, lo que sugiere capacidades multimodales en el modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de este checkpoint no está en el entrenamiento sino en la cuantización. oQ (oMLX) aplica precisión mixta: los pesos del modelo de lenguaje se almacenan mayoritariamente en U32 (6,644B de pesos lógicos, 24,75 GiB), mientras que una fracción pequeña se mantiene en FP16 (0,557B) y FP32 (0,447B) para preservar capas sensibles. Las capas cuantizadas usan affine 6-bit con grupo 64 y affine 8-bit con grupos 64 y 128. El resultado es un promedio efectivo de 26,309 bits por peso, muy por encima de una cuantización uniforme de 4 u 8 bits, lo que sugiere que se prima la fidelidad sobre la compresión máxima.

## Capacidades
- Generación de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B, aunque no se documentan evaluaciones específicas en la model card.
- Procesamiento multimodal: el checkpoint incluye un módulo de visión de 0,447B de parámetros, lo que indica soporte de entrada de imágenes.
- Decodificación especulativa: la presencia de una cabeza MTP (Multi-Token Prediction) de 0,845B sugiere soporte para generación multi-token, aunque no se detalla su uso en la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso
- Inferencia local en Apple Silicon: el checkpoint en formato MLX está diseñado para ejecutarse con la librería MLX en Macs con memoria unificada de 32 GB o más, aprovechando la cuantización mixta para reducir el uso de memoria sin degradar en exceso la calidad.
- Prototipado de asistentes multimodales: gracias al módulo de visión incluido, permite experimentar con pipelines de imagen+texto en local antes de escalar a infraestructura con GPU.
- Evaluación de técnicas de cuantización: el desglose detallado de bits por componente lo convierte en un caso de estudio útil para investigadores que comparan oQ con otras herramientas (GGUF, GPTQ, AWQ) en términos de fidelidad y tamaño.
- Generación de texto asistida en estación de trabajo: para desarrolladores que necesitan un modelo de gran tamaño sin conexión a la nube, con licencia Apache 2.0 que permite uso comercial.
- Investigación sobre decodificación especulativa: la cabeza MTP incluida permite estudiar el impacto de la predicción multi-token en latencia y calidad dentro del ecosistema MLX.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente, evita el envío de datos a APIs externas, adecuado para prototipos con datos sensibles.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: el checkpoint ocupa 31,3 GB en disco y 29,097 GiB de almacenamiento de tensores; se requiere al menos 32 GB de memoria unificada para cargarlo, con margen adicional recomendable para el contexto y el runtime.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior (M1/M2/M3/M4 Max y Ultra). No está pensado para GPUs NVIDIA, ya que el formato es MLX.
- ¿Cabe en GPU consumer? No en GPUs consumer NVIDIA convencionales por el formato MLX; en Apple Silicon de gama alta (Max/Ultra) sí es viable.
- Opciones de despliegue: MLX (librería nativa), oMLX (herramienta de cuantización y ejecución). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crw72/Qwen3.6-35B-A3B-oQ6h-fp16-mtp | 9,5B en checkpoint (35B/3B activos en base) | no disponible | MLX safetensors | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / 3B activos | no disponible | safetensors | Apache 2.0 (según base) | Hugging Face |
| Cuantizaciones GGUF del mismo base | variable según cuantización | no disponible | GGUF | Apache 2.0 | Hugging Face / repos comunitarios |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- El promedio de 26,309 bits por peso es engañoso si se interpreta como compresión: la mayor parte de los pesos lógicos se almacena en U32 (32 bits), por lo que el checkpoint no es más pequeño que una cuantización de 4 bits; el ahorro proviene de la mezcla selectiva, no de una reducción global.
- Al ser una cuantización, puede presentar degradación de calidad respecto al modelo base original, especialmente en tareas de razonamiento matemático o código; no se aportan evaluaciones que lo cuantifiquen.
- La model card no documenta sesgos, idiomas soportados ni riesgos de alucinación; se heredan los del modelo base, no verificados aquí.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA ni a servidores x86 convencionales sin conversión.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 19 de noviembre de 2026; es un artefacto reciente y sin validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.6-35B-A3B antes de producción.
- No se documenta la longitud de contexto soportada, lo que impide planificar cargas de trabajo con ventanas largas.

## Enlaces
- Hugging Face: https://huggingface.co/crw72/Qwen3.6-35B-A3B-oQ6h-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
