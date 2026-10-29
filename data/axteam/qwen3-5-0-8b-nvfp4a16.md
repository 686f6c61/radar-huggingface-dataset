# axteam/Qwen3.5-0.8B-NVFP4A16

## Resumen

`axteam/Qwen3.5-0.8B-NVFP4A16` es una cuantización de 4 bits del modelo `Qwen/Qwen3.5-0.8B`, publicada por el usuario axteam. No es un modelo entrenado desde cero: es un derivado PTQ (post-training quantization) del modelo denso multimodal de la familia Qwen3.5 de Alibaba Cloud, con 852.985.920 parámetros totales y una torre de visión integrada (pipeline `image-text-to-text`). Su objetivo es servir el modelo original en vLLM con pesos FP4, reduciendo el tamaño en disco hasta aproximadamente 1,3 GB.

La relevancia técnica está en el esquema de cuantización elegido: NVFP4A16 (W4A16), con pesos FP4 en formato E2M1 agrupados de 16 en 16, escala FP8 E4M3 por grupo y escala global FP32 por tensor, manteniendo las activaciones en BF16. El autor conserva deliberadamente en BF16 la torre de visión, el proyector, la cabeza MTP, todas las RMSNorm, los embeddings, el LM head y toda la ruta de atención lineal (GatedDeltaNet/SSM), porque FP4 resulta demasiado grueso para esos pesos. Es, por tanto, una cuantización mixta y no un 4 bits uniforme.

El interés práctico es doble: por un lado, permite ejecutar un modelo visión-lenguaje de menos de 1 B de parámetros en GPUs de gama media; por otro, la model card publica métricas de fidelidad frente al original BF16 (perplexidad 2,1669 frente a 2,0174, un 7,4 % peor; acuerdo top-1 del 87,8 % frente al 98,7 %). El repositorio es muy reciente (creado el 29 de octubre de 2026) y no tiene descargas ni valoraciones, por lo que no existe validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal (GatedDeltaNet/SSM) + atención completa; transformer denso multimodal con torre de visión y cabeza MTP |
| Parámetros totales | 852.985.920 (~0,85 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4A16 (W4A16): pesos FP4 E2M1 en grupos de 16, escala FP8 E4M3 por grupo y escala global FP32 por tensor; activaciones BF16. Módulos sensibles conservados en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con esquema compressed-tensors `nvfp4-pack-quantized` |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamaño en disco | ~1,2 GB (repo de 1,3 GB) |
| Calibración | 256 muestras, corpus mixto con predominio de coreano |
| Librería / motor | transformers; orientado a vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida que combina capas de atención lineal (GatedDeltaNet, de tipo SSM) con capas de atención completa, además de una torre de visión y una cabeza de predicción multi-token (MTP). La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; según fuentes secundarias de la serie Qwen3.5, el entrenamiento del modelo base se describe como «early fusion» sobre billones de tokens multimodales, pero ese dato no está verificado en la documentación del repositorio. La cabeza MTP suele asociarse a decodificación especulativa, aunque la model card no detalla su uso concreto.

Sobre la cuantización: se trata de un proceso PTQ sin reentrenamiento, con 256 muestras de calibración para proteger los canales de pesos más relevantes antes del redondeo. Los pesos se almacenan en FP4 (E2M1) con granularidad de grupo 16 y doble escala (FP8 E4M3 por grupo más una escala global FP32 por tensor); las activaciones permanecen en BF16, lo que da el esquema W4A16. Quedan sin cuantizar la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, el LM head y la totalidad de la ruta `linear_attn.*` (GatedDeltaNet/SSM). El tokenizador, el `chat_template` y el `generation_config` son idénticos a los del original, y el `config.json` solo añade un bloque `quantization_config`. La motivación declarada es que el 4 bits es demasiado agresivo para los pesos del SSM.

## Capacidades

- Generación de texto conversacional e instruccional, heredada del modelo base Qwen3.5-0.8B (`conversational` en los tags).
- Entrada multimodal imagen-texto: pipeline `image-text-to-text`, con torre de visión y proyector conservados en BF16 para no degradar la percepción visual.
- Razonamiento e instrucciones mejorados respecto a Qwen3 según la descripción de la serie publicada por fuentes secundarias (Qualcomm AI Hub, repositorios no oficiales); no verificado en la model card del repositorio.
- Capacidad multilingüe atribuida a la serie Qwen3.5; el repositorio no declara lista de idiomas.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Cabeza MTP presente en la arquitectura, sin documentación sobre su activación en inferencia.
- Muestreo recomendado por el autor (Qwen): `temperature=0.7`, `top_p=0.8`, `top_k=20`.

## Casos de uso

- **Asistente conversacional en GPUs de gama media**: con ~1,3 GB de pesos, el modelo se puede servir en una RTX 4060 de 8 GB dejando espacio para caché KV y otras cargas; adecuado para prototipos de chat multi-turno antes de migrar a modelos mayores.
- **Descripción y etiquetado de imágenes por lotes**: el pipeline `image-text-to-text` permite procesar imágenes con una instrucción textual y generar descripciones o etiquetas; útil para moderación de contenido o generación de metadatos en catálogos pequeños.
- **Preguntas y respuestas sobre documentos escaneados**: combinando OCR previo con la entrada de imagen del modelo, se pueden construir asistentes de consulta sobre facturas o formularios en despliegues locales sin conexión.
- **Evaluación de decodificación especulativa**: la presencia de la cabeza MTP y de una ruta de atención lineal lo convierte en un banco de pruebas económico para medir la ganancia de self-speculation en vLLM con presupuesto de VRAM reducido.
- **Prototipado de pipelines multimodales en vLLM**: al estar empaquetado en compressed-tensors, sirve para validar infraestructura de serving (`vllm serve`) y comparar latencias frente al BF16 antes de invertir en GPUs Blackwell.
- **Atención al cliente con contexto corto**: para consultas frecuentes y respuestas guionizadas, un modelo de 0,85 B reduce coste por token; requiere acotar el alcance y añadir recuperación de documentos para compensar la limitación de conocimiento factual.
- **Investigación sobre cuantización FP4**: las métricas de fidelidad publicadas permiten estudiar la degradación de un esquema W4A16 con grupos de 16 en modelos sub-1B, un régimen poco documentado.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU) en la información disponible. El autor solo publica métricas de fidelidad frente al modelo BF16 original, sobre un conjunto interno mixto inglés/coreano de 100 prompts con respuestas greedy:

| Métrica | Este modelo (NVFP4A16) | Original BF16 | Diferencia |
|---|---|---|---|
| Perplexidad (menor es mejor) | 2,1669 | 2,0174 | +7,4 % |
| Acuerdo top-1 en el siguiente token | 87,8 % | 98,7 % | −10,9 puntos |

Estas cifras miden proximidad al modelo base, no calidad absoluta en tareas.

## Requisitos de hardware

- **VRAM estimada para pesos**: en torno a 1,2-1,5 GB, estimación derivada del tamaño en disco (1,3 GB) y del hecho de que una fracción relevante de módulos permanece en BF16 (embeddings, LM head, torre de visión, ruta SSM completa).
- **VRAM total de inferencia**: aproximadamente 2-3 GB con contextos moderados, sumando caché KV y buffers de activación; estimación, no dato publicado.
- **GPU recomendadas**: el esquema NVFP4 está pensado para aceleración FP4 nativa en generación Blackwell (B200, RTX 5090, RTX PRO 6000). La model card no especifica en qué GPU se midieron las métricas ni qué kernels se validaron.
- **Compatibilidad en GPUs consumer**: por tamaño, cabría en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070), pero el soporte del esquema `nvfp4-pack-quantized` fuera de Blackwell no está documentado en la información disponible.
- **Opciones de despliegue**: vLLM es la vía recomendada por el autor (`vllm serve axteam/Qwen3.5-0.8B-NVFP4A16`); también se puede cargar con transformers. El soporte en llama.cpp, Ollama o TGI no está documentado para este formato.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Estado |
|---|---|---|---|---|---|
| axteam/Qwen3.5-0.8B-NVFP4A16 | 852.985.920 | No disponible | NVFP4A16 (W4A16), ~1,2 GB | Apache-2.0 | Publicado, 0 descargas |
| Qwen/Qwen3.5-0.8B (BF16) | ~0,85 B | No disponible | BF16 | Apache-2.0 | Modelo base de referencia |
| Otras cuantizaciones 4 bits de Qwen3.5-0.8B (AWQ, GPTQ, GGUF) | ~0,85 B | No disponible | 4 bits | Apache-2.0 (heredada) | No documentadas en la información disponible |
| Qwen3.5-0.8B en Qualcomm AI Hub (despliegue edge) | ~0,8 B | No disponible | No disponible | No disponible | Referenciado por Qualcomm AI Hub |

No se dispone de datos verificados de benchmarks que permitan comparar calidad frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- **Pérdida de fidelidad medible**: perplexidad un 7,4 % superior y acuerdo top-1 del 87,8 % frente al 98,7 % del BF16. Para tareas sensibles a un token concreto (extracción de campos, código, matemáticas) conviene validar contra el original.
- **Sesgo de calibración**: el conjunto de calibración son 256 muestras con predominio de coreano; no hay evaluación del comportamiento en castellano ni en otros idiomas, por lo que la degradación en español es desconocida.
- **Dependencia de hardware**: el formato NVFP4 está ligado a vLLM y a GPUs con soporte FP4; no hay herramientas de despliegue alternativas documentadas, lo que crea dependencia de un único stack.
- **Consumo real superior al 4 bits nominal**: al conservar en BF16 la torre de visión, el LM head, los embeddings y toda la ruta SSM, el ahorro de memoria es menor que el de una cuantización uniforme.
- **Documentación inconsistente**: la model card describe el proceso como PTQ con NVFP4 pero menciona «AWQ uses a small calibration set», lo que introduce ambigüedad sobre la técnica exacta aplicada.
- **Ausencia de datos operativos**: no se documenta la longitud de contexto, los idiomas soportados ni el rendimiento (tokens/s). Sin estos datos no se puede dimensionar un despliegue en producción.
- **Riesgo de alucinación**: con 0,85 B de parámetros, la fiabilidad factual es limitada; se recomienda anclar las respuestas con recuperación externa (RAG) en cualquier uso orientado a usuario final.
- **Madurez**: repositorio con 0 descargas y 0 valoraciones, creado y actualizado el mismo día, sin validación de la comunidad.
- **Licencia**: Apache-2.0 permite uso comercial, pero los pesos, el tokenizador y el `chat_template` originales son del equipo Qwen y la licencia remite al fichero LICENSE del modelo base; conviene revisarlo antes de redistribuir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-0.8B-NVFP4A16
- Árbol de ficheros: https://huggingface.co/axteam/Qwen3.5-0.8B-NVFP4A16/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Ficha de terceros (toolify): https://www.toolify.ai/ai-model/axionml-qwen3-5-0-8b-nvfp4
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b
- Repositorio no oficial de la serie Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
