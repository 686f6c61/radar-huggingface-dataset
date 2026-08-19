# Blackfrost-AI/M.O.G.-27B-NVFP4

## Resumen

M.O.G.-27B-NVFP4 es un modelo de lenguaje multimodal (imagen-texto a texto) desarrollado por Blackfrost-AI, basado en el modelo Qwen/Qwen3.8-27B y cuantizado en formato NVFP4 (NVIDIA FP4). El nombre "M.O.G." no está documentado públicamente, pero el modelo está orientado a investigación y uso conversacional, con soporte para entrada de imágenes y generación de texto. Su pipeline `image-text-to-text` lo habilita para tareas de visión-lenguaje, como descripción de imágenes o razonamiento visual.

El modelo se distribuye con licencia Apache 2.0, aunque su acceso está restringido (gated) en HuggingFace, lo que obliga a aceptar condiciones antes de su descarga. Los pesos en safetensors suman 18.800.348.400 parámetros (18,8B), una cifra inferior a los 27B que sugiere el nombre del modelo base, probablemente debido a la cuantización NVFP4 que reduce el tamaño de los tensores. El repositorio ocupa 30,1 GB, lo que da una idea del espacio necesario para su almacenamiento.

Aunque no se han publicado métricas específicas para esta variante, el modelo base Qwen3.8-27B pertenece a la familia Qwen 3.8, que en versiones anteriores (Qwen3.6-27B) ha demostrado un rendimiento competitivo en tareas de razonamiento y código. Su relevancia actual radica en ofrecer una alternativa multimodal de tamaño medio con cuantización eficiente para entornos con recursos limitados, aunque la falta de documentación pública limita su evaluación inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (imagen-texto a texto), basado en Qwen3.8-27B |
| Parametros totales | 18.800.348.400 (18,8B) según safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (NVIDIA FP4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta de M.O.G.-27B-NVFP4 no está documentada en la información disponible. Al estar basado en Qwen/Qwen3.8-27B, se presume que hereda la arquitectura de la familia Qwen 3.8, que en versiones anteriores (Qwen3.6-27B) emplea un transformer denso con capacidades multimodales, integrando un codificador de visión para procesar imágenes junto con texto. El pipeline `image-text-to-text` confirma que el modelo acepta tanto imágenes como texto como entrada y genera texto como salida.

El entrenamiento del modelo base Qwen3.8-27B no se detalla en la información proporcionada. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La cuantización NVFP4 es una técnica de compresión de pesos que reduce la precisión a 4 bits en punto flotante, optimizada para GPUs NVIDIA recientes (Hopper y posteriores), lo que permite reducir el uso de memoria y acelerar la inferencia sin una degradación significativa del rendimiento en muchos casos.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo de la familia Qwen, se espera que maneje tareas de generación, razonamiento lógico y matemático, aunque no hay benchmarks específicos publicados para esta variante.
- Comprensión de imágenes: el pipeline `image-text-to-text` indica que puede procesar imágenes como entrada, permitiendo tareas de descripción visual, respuesta a preguntas sobre imágenes y razonamiento multimodal.
- Conversación: los tags incluyen `conversational`, lo que sugiere optimización para diálogos multi-turno.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte para agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible, aunque los modelos Qwen suelen soportar múltiples idiomas, no se confirma para esta variante.
- Modo thinking: no disponible.

## Casos de uso

- Descripción y análisis de imágenes: el modelo puede generar descripciones detalladas de fotografías o ilustraciones, útil para aplicaciones de accesibilidad (descripción automática para personas con discapacidad visual) o para organizar bibliotecas de imágenes.
- Asistente conversacional multimodal: integrado en un chatbot, puede responder preguntas sobre imágenes enviadas por el usuario, por ejemplo, en atención al cliente para identificar productos o diagnosticar problemas visuales.
- Generación de código con contexto visual: si el modelo soporta entrada de imágenes de diagramas o capturas de pantalla, podría ayudar a generar código a partir de wireframes o esquemas, aunque esta capacidad no está confirmada.
- Investigación académica: al ser un modelo de acceso restringido y orientado a investigación, puede utilizarse para experimentos en visión-lenguaje, comparación de cuantizaciones o estudio de alucinaciones multimodales.
- Prototipado rápido de aplicaciones multimodales: gracias a su tamaño medio (18,8B parámetros) y cuantización NVFP4, puede desplegarse en entornos de desarrollo con GPUs de gama alta para validar ideas antes de escalar a modelos mayores.
- Automatización de documentación técnica: a partir de capturas de pantalla o diagramas de flujo, el modelo podría generar documentación textual, reduciendo el trabajo manual en equipos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para M.O.G.-27B-NVFP4. El modelo base Qwen3.8-27B podría tener resultados públicos, pero no se incluyen en la información proporcionada. Se recomienda consultar la ficha de Qwen/Qwen3.8-27B en HuggingFace para obtener referencias, aunque no se garantiza que sean directamente aplicables a esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El repositorio ocupa 30,1 GB, por lo que se necesitaría al menos esa cantidad de VRAM para cargar los pesos en memoria, más overhead de activaciones y contexto. En la práctica, se recomienda una GPU con 40 GB o más.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), o GPUs profesionales con soporte FP4 como las series RTX 40 (aunque la VRAM de 24 GB de una RTX 4090 podría ser insuficiente). No se confirma compatibilidad con GPUs consumer.
- Si cabe en consumer GPU: no disponible; el tamaño del repo sugiere que no cabría en GPUs de 16-24 GB sin técnicas adicionales de offloading.
- Opciones de despliegue: no se especifican en la información. Dado que usa `transformers` y es compatible con `endpoints_compatible`, podría desplegarse con vLLM, TGI o llama.cpp si se convierte a GGUF, pero no hay confirmación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| M.O.G.-27B-NVFP4 | 18,8B (cuantizado) | no disponible | Sí (imagen-texto) | Apache 2.0 | NVFP4 |
| Qwen3.6-27B (dense) | 27B | no disponible | Sí (visión) | Apache 2.0 | BF16/FP8 |
| Qwen3.5-397B-A17B (MoE) | 397B total, 17B activos | no disponible | Sí | Apache 2.0 | BF16 |

La comparativa se basa en datos públicos de la familia Qwen. M.O.G. es una variante cuantizada de Qwen3.8-27B, por lo que su rendimiento debería ser similar al del modelo base, pero con menor huella de memoria. Qwen3.6-27B es un modelo denso de 27B con visión que supera a Qwen3.5-397B-A17B en SWE-bench Verified (77,2% vs 76,2%), según la guía de insiderllm.com. No se dispone de datos específicos de M.O.G. para comparar directamente.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, lo que requiere aceptar condiciones adicionales. Esto puede limitar su uso en entornos corporativos o de investigación.
- Documentación insuficiente: no hay información pública sobre el entrenamiento, los datos utilizados ni las capacidades exactas. Esto dificulta evaluar sesgos, riesgos de alucinación o limitaciones idiomáticas.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido falso o inventado, especialmente en tareas multimodales donde la interpretación de imágenes es subjetiva.
- Sesgos desconocidos: al no conocer el dataset de entrenamiento, no se pueden identificar sesgos específicos. Los modelos Qwen suelen tener sesgos culturales y lingüísticos asociados a sus datos, pero no se confirma para esta variante.
- Limitaciones de contexto: la longitud de contexto no está documentada, por lo que no se puede garantizar un rendimiento adecuado en conversaciones largas o documentos extensos.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el acceso gated puede imponer condiciones adicionales de uso, especialmente para fines comerciales. Se recomienda revisar los términos en HuggingFace antes de su uso.
- Compatibilidad de cuantización: NVFP4 requiere hardware NVIDIA con soporte FP4 (arquitecturas Hopper o posteriores). En GPUs más antiguas, el modelo podría no cargar o funcionar con degradación.

## Enlaces

- [HuggingFace - Blackfrost-AI/M.O.G.-27B-NVFP4](https://huggingface.co/Blackfrost-AI/M.O.G.-27B-NVFP4)
- [Qwen3.8-27B-Blackfrost-Abliterated-NVFP4-GGUF (modelo relacionado)](https://huggingface.co/qzshch/Qwen3.8-27B-Blackfrost-Abliterated-NVFP4-GGUF)
- [Blackfrost-AI/PINQWEN-3.6-27B-NVFP4-ABLITERATED (modelo relacionado)](https://huggingface.co/Blackfrost-AI/PINQWEN-3.6-27B-NVFP4-ABLITERATED)
- [Qwen 3.6 Complete Guide (insiderllm.com)](https://insiderllm.com/guides/qwen-3-6-local-ai-guide/)
- [Qwen 3.6 27B VRAM & Hardware Requirements (willitrunai.com)](https://willitrunai.com/blog/qwen-3-6-27b-vram-requirements)
