# axteam/MiniCPM-V-4.7-35B-A3B-AWQ-4bit

## Resumen

MiniCPM-V-4.7-35B-A3B-AWQ-4bit es una versión cuantizada a 4 bits (AWQ INT4, esquema W4A16) del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B de OpenBMB, publicada por el usuario axteam en Hugging Face. El modelo base combina un backbone MoE (basado en arquitectura Qwen3.5-MoE) con una torre de visión, lo que lo convierte en un modelo image-text-to-text capaz de procesar imágenes y texto en una misma conversación.

El objetivo de esta cuantización es servir el modelo en producción con vLLM reduciendo drásticamente el consumo de memoria: los pesos ocupan unos 22,6 GB en disco frente a los ~70 GB que ocuparían en BF16. La cuantización es post-entrenamiento (PTQ, sin reentrenamiento) con 256 muestras de calibración, y conserva en BF16 los componentes más sensibles (torre de visión, embeddings, LM head, normalizaciones y routers MoE).

Es relevante ahora mismo porque ofrece capacidades multimodales con un coste de inferencia bajo gracias a su naturaleza MoE con unos 3.000 millones de parámetros activos, y porque su licencia Apache-2.0 permite uso comercial sin restricciones. Incluye además un modo de razonamiento (thinking mode) activable mediante la plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (backbone Qwen3.5-MoE) con torre de visión (image-text-to-text) |
| Parametros totales | ~35.000 millones (35B-A3B); el recuento de safetensors del repo muestra 6.976.317.084 parámetros, cifra que no refleja los pesos cuantizados completos |
| Parametros activos | ~3.000 millones (por MoE, según la denominación A3B del modelo base) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ INT4 (W4A16): pesos INT4 asimétricos, grupo 32, activaciones BF16; formato compressed-tensors `pack-quantized`; KV-cache FP8 opcional en tiempo de ejecución |
| Idiomas soportados | no disponible (el modelo base es multilingüe; los ejemplos incluyen coreano e inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal: un backbone de lenguaje tipo Qwen3.5-MoE con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token, combinado con una torre de visión y un módulo de fusión visión-texto (vision-text merger). La presencia de atención lineal (linear-attention) junto a la atención convencional, mencionada en la model card, sugiere un diseño híbrido de atención orientado a eficiencia en contextos largos.

Esta versión es una cuantización post-entrenamiento (PTQ) realizada por axteam sin ningún reentrenamiento: esquema W4A16 con pesos INT4 asimétricos agrupados en bloques de 32 y activaciones en BF16, calibrada con 256 muestras y almacenada en formato compressed-tensors `pack-quantized`. Se mantienen en BF16 la torre de visión, el merger visión-texto, los embeddings de tokens, el LM head, todas las RMSNorm y los routers MoE (`mlp.gate` y `shared_expert_gate`), aproximadamente el 4 % de los parámetros; el resto (atenciones, incluida la lineal, y proyecciones MoE/MLP) está cuantizado. Tokenizer y `chat_template` son idénticos a los del original.

Sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO): no disponible en la información proporcionada.

## Capacidades

- Comprensión multimodal imagen-texto: acepta imágenes por URL o data URI junto a texto, con pipeline image-text-to-text.
- Generación de texto conversacional multi-turno mediante una API compatible con OpenAI (endpoint `/v1/chat/completions`).
- Modo de razonamiento (thinking mode): desactivado por defecto, activable con `chat_template_kwargs={"enable_thinking": True}` en la petición o en Python.
- Eficiencia de inferencia MoE: solo ~3.000 millones de parámetros activos por token pese a los 35B totales, lo que reduce latencia y coste por token.
- Soporte nativo en vLLM con formato compressed-tensors, incluyendo opción de KV-cache en FP8 para contextos largos o lotes grandes.
- Capacidades multilingües: no disponible de forma explícita, aunque los ejemplos de la model card incluyen consultas en coreano e inglés.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Chatbots multimodales autoalojados: el formato AWQ de 22,6 GB permite servir el modelo en una sola GPU de gama alta con vLLM, exponiendo una API compatible con OpenAI para aplicaciones de conversación con imágenes.
- Análisis y descripción de imágenes en producción: se pueden enviar imágenes por URL o data URI dentro del mensaje y obtener descripciones, extracción de información o respuestas a preguntas visuales.
- Servicios de atención al cliente con soporte visual: el usuario puede adjuntar capturas o fotografías (por ejemplo, de un producto dañado) y el modelo razona sobre ellas en conversaciones multi-turno.
- Razonamiento profundo bajo demanda: activando el thinking mode con `enable_thinking: True` se puede mejorar la calidad en tareas complejas (matemáticas, planificación, análisis) a costa de más tokens generados.
- Despliegue en entornos con memoria limitada: combinando la cuantización W4A16 con `--kv-cache-dtype fp8` se reduce la memoria de la KV-cache a la mitad, útil para contextos largos o lotes concurrentes grandes.
- Servido solo-texto de alta eficiencia: añadiendo `--limit-mm-per-prompt '{"image": 0, "video": 0}'` se omite el presupuesto de memoria del encoder de visión, optimizando despliegues puramente textuales.
- Integración en pipelines de inferencia Python: la API offline de vLLM (`LLM.chat`) permite procesamiento por lotes de documentos e imágenes, por ejemplo para clasificación o etiquetado masivo de contenido visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una cuantización PTQ sin reentrenamiento, el rendimiento se espera esencialmente equivalente al modelo base openbmb/MiniCPM-V-4.7-35B-A3B, cuyos resultados tampoco constan en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan ~22,6 GB en disco (W4A16); con KV-cache BF16 y margen para activaciones, se estima que una GPU de 24 GB puede ser justa y una de 40-48 GB es una opción cómoda. Cifras exactas no disponibles.
- GPU recomendadas: no disponible de forma explícita; por tamaño de pesos, candidatos razonables son RTX 4090 (24 GB, ajustado), RTX 5090, A100 40/80 GB o H100.
- Consumer GPUs: con 22,6 GB de pesos, cabe en una RTX 4090 de 24 GB solo con contexto reducido y KV-cache optimizada (FP8); en GPUs de 16 GB no cabe sin offloading.
- Despliegue: vLLM es el runtime objetivo (formato compressed-tensors); llama.cpp y Ollama no son compatibles con este formato. Se sirve con `vllm serve axteam/MiniCPM-V-4.7-35B-A3B-AWQ-4bit --max-model-len 32768`.
- Compatibilidad crítica: verificado el 31-10-2026, con vLLM 0.32.0 y Transformers 5.17.0 el servidor no arranca porque Transformers no reconoce el tipo de modelo `minicpmv4_7` y el repo no incluye código de modelado propio. Es necesario usar versiones de Transformers/vLLM que soporten MiniCPM-V 4.7.
- Latencia y throughput: no disponibles; al ser MoE con ~3B parámetros activos, se esperan latencias bajas por token en comparación con modelos densos de 35B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-AWQ-4bit (este) | ~35B total / ~3B activos | no disponible (ejemplos con 32.768) | Sí (visión) | AWQ INT4 W4A16 | Apache-2.0 |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | ~35B total / ~3B activos | no disponible | Sí (visión) | BF16 | Apache-2.0 |
| Qwen3-VL-30B-A3B (categoría similar) | ~30B total / ~3B activos | no disponible | Sí (visión) | BF16 y variantes cuantizadas de la comunidad | Apache-2.0 |

Los datos de rendimiento comparado no están disponibles en la información proporcionada; la comparación se basa únicamente en la categoría de modelo (MoE multimodal de ~30-35B con ~3B activos) y en la denominación del backbone Qwen3.5-MoE declarada en la model card.

## Limitaciones y advertencias

- Incompatibilidad de versiones: con vLLM 0.32.0 y Transformers 5.17.0 el servidor no arranca (Transformers no reconoce `minicpmv4_7` y el repo no incluye código de modelado propio). Verificar la compatibilidad antes de desplegar.
- Repositorio de terceros: la cuantización la ha hecho axteam (30 descargas y 1 like en el momento de la ficha), no OpenBMB; la calidad de la calibración (256 muestras) no está validada por benchmarks publicados.
- Riesgo de alucinación: inherente a los LLM; no hay datos específicos disponibles para este modelo.
- Sesgos: no documentados en la información disponible; como derivado de un modelo base multilingüe entrenado a gran escala, pueden existir sesgos lingüísticos y culturales no cuantificados.
- Idiomas: la lista de idiomas soportados no está disponible; los ejemplos sugieren soporte de coreano e inglés, pero el comportamiento en castellano no está documentado.
- Pérdida por cuantización: la cuantización INT4 de las proyecciones de atención y MoE puede degradar ligeramente la calidad respecto al BF16 original, especialmente en tareas sensibles; no hay evaluaciones cuantitativas publicadas.
- Licencia: Apache-2.0, sin restricciones para uso comercial; los pesos y tokenizer originales pertenecen a OpenBMB.
- El thinking mode está desactivado por defecto; si la aplicación espera respuestas con razonamiento explícito, hay que activarlo explícitamente vía `chat_template_kwargs`.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/MiniCPM-V-4.7-35B-A3B-AWQ-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Paper, blog oficial de OpenBMB, demos y repos adicionales: no disponibles en la informacion proporcionada.
