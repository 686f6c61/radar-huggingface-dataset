# axteam/Qwen3.5-9B-NVFP4A16

## Resumen

Qwen3.5-9B-NVFP4A16 es una versión cuantizada a 4 bits del modelo Qwen/Qwen3.5-9B, publicada por el usuario axteam. No es un modelo nuevo: es un derivado de post-entrenamiento (PTQ) cuyo objetivo es reducir el peso en disco y el consumo de memoria para servir el modelo con vLLM. El checkpoint ocupa unos 10,9 GB frente a los aproximadamente 18,8 GB que requerirían los pesos en BF16 para 9.409.813.744 parámetros.

El modelo base es un transformer denso de la familia Qwen3.5, con arquitectura híbrida que combina atención lineal (tipo GatedDeltaNet/SSM) con atención completa, torre de visión para entrada image-text-to-text y una cabeza de predicción multi-token (MTP). Con 9,4 mil millones de parámetros se sitúa en la franja de modelos compactos capaces de ejecutarse en una sola GPU de consumo, lo que lo hace relevante para despliegues locales y para servir en hardware Blackwell con soporte nativo de FP4.

La aportación concreta de esta ficha es el esquema de cuantización: pesos FP4 (E2M1) en grupos de 16 con escalas FP8 E4M3 más una escala global FP32 por tensor, y activaciones en BF16. Se mantienen en BF16 las partes sensibles (torre de visión, proyector, cabeza MTP, RMSNorms, embeddings, LM head y toda la ruta de atención lineal), de modo que el coste en calidad medido por el autor es de un +2,9 % de perplejidad frente al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: atención lineal (GatedDeltaNet/SSM) + atención completa, con torre de visión y cabeza MTP |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1 en grupos de 16, escala FP8 E4M3 + escala global FP32 por tensor, activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | No disponible; la evaluacion del autor se realizo sobre un conjunto interno mixto ingles/coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`); tamano del repo 11,7 GB, ~10,9 GB en disco |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida en la que capas de atención lineal con estado recurrente (la ruta denominada `linear_attn.*`, de tipo GatedDeltaNet/SSM) se alternan con capas de atención completa. A ello se suma un codificador visual y un proyector para entrada image-text-to-text, más una cabeza de predicción multi-token (`mtp.*`) orientada a decodificación especulativa o generación multi-token. El resultado es un modelo denso de 9,4B parámetros con capacidades multimodales, no un MoE.

Sobre el entrenamiento del original no hay información en el material disponible: no se documentan número de tokens, composición del corpus, ni fases de RLHF/DPO. Este checkpoint es exclusivamente post-training quantization, sin reentrenamiento ni ajuste fino, de modo que el comportamiento debería mantenerse fiel al original. La calibración se hizo con 256 muestras de un corpus mixto con predominio de coreano. La decisión técnica más destacable es dejar en BF16 la ruta SSM completa y el resto de componentes sensibles, ya que FP4 resulta demasiado grosero para los pesos de atención lineal; también se conservan sin cuantizar la torre de visión, el proyector, la cabeza MTP, las RMSNorms, los embeddings y el LM head, que representan una fracción pequeña de los parámetros.

## Capacidades

- Generación de texto conversacional (pipeline declarado: image-text-to-text, etiqueta `conversational`).
- Comprensión de imágenes: el modelo integra torre de visión y proyector, conservados en BF16 en esta cuantización.
- Razonamiento y código: el ecosistema del modelo base lo describe como orientado a razonamiento, programación y comprensión visual; no se aportan puntuaciones en esta información.
- Comportamiento agéntico: descrito en la documentación de terceros del modelo base (NVIDIA Jetson AI Lab) como orientado a comportamiento agéntico; sin detalle de implementación.
- Generación multi-token: la presencia de la cabeza MTP habilita decodificación especulativa en el modelo base.
- Capacidades multilingües: no documentadas oficialmente; la única evidencia es el corpus de calibración y la evaluación interna en inglés y coreano.
- Tool calling / function calling: no documentado en la información disponible.
- Modo "thinking" explícito: no documentado en la información disponible.

## Casos de uso

- Servicio de VLLM en producción con una sola GPU: el checkpoint está empaquetado para `vllm serve axteam/Qwen3.5-9B-NVFP4A16`, de modo que se puede levantar un endpoint compatible con la API de OpenAI reduciendo el peso de pesos a ~10,9 GB y liberando VRAM para caché KV.
- Asistente multimodal de atención al cliente: al aceptar image-text-to-text, puede procesar capturas de pantalla o fotos de producto junto con la consulta de texto en una conversación multi-turno. La ventana de contexto útil debe validarse, porque no está documentada aquí.
- Despliegue en estación de trabajo con RTX 50xx: el formato NVFP4 encaja en GPUs Blackwell, donde el modelo cabe holgadamente en 16-24 GB de VRAM y permite atender peticiones con latencia baja sin recurrir a servidores.
- Edge computing en NVIDIA Jetson: la documentación de Jetson AI Lab recoge variantes W4A16 para Orin y NVFP4 para Thor del mismo modelo base, lo que lo hace apto para robótica o inspección visual en dispositivos.
- Prototipado de agentes con herramientas sobre documentos escaneados: combinando entrada visual y generación de texto se pueden construir pipelines de extracción y resumen; la integración de function calling deberá verificarse empíricamente, ya que no está documentada.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de NVFP4A16 frente a BF16 en tareas propias, usando la metodología de perplejidad y acuerdo top-1 que publica el autor.
- Generación de código asistida en local: el modelo base está orientado a programación; para este derivado conviene validar la tasa de acierto real, ya que no hay benchmarks de código publicados para el checkpoint cuantizado.

## Benchmarks y rendimiento

El autor solo publica métricas de fidelidad frente al original BF16, no resultados absolutos de tareas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Metrica (conjunto interno EN/KO, 100 prompts) | Este modelo | Original BF16 |
|---|---|---|
| Perplejidad (menor es mejor) | 1,4920 | 1,4506 (+2,9 %) |
| Acuerdo top-1 en siguiente token | 93,2 % | 99,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia: ~10,9 GB solo de pesos; con caché KV y activaciones, un despliegue en vLLM requiere del orden de 13-16 GB en GPU, cifra estimada y dependiente de la longitud de contexto y del número de secuencias concurrentes.
- GPU recomendadas: Blackwell con soporte nativo de FP4 (B200, RTX 50xx, Jetson Thor). En arquitecturas sin soporte FP4 nativo los pesos deben decuantizarse, con lo que se pierde la ventaja de memoria y velocidad del formato.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 5090 (32 GB) y RTX 5080 (16 GB) con contexto moderado; en RTX 4090 (24 GB) funcionaría, pero sin aceleración FP4 nativa.
- Opciones de despliegue: vLLM es la vía documentada por el autor (`vllm serve`); existen conversiones GGUF de terceros (por ejemplo `Freenixi/AxionML-Qwen3.5-9B-NVFP4-GGUF`) para llama.cpp y entornos de baja VRAM, aunque no proceden de este repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Parámetros de muestreo recomendados por el autor: `temperature=0.7`, `top_p=0.8`, `top_k=20`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/Qwen3.5-9B-NVFP4A16 | 9,41B | No disponible | safetensors, NVFP4A16 W4A16 | Apache-2.0 | Objeto de esta ficha; perplejidad +2,9 % frente a BF16 |
| Qwen/Qwen3.5-9B (original) | 9,41B | No disponible | safetensors BF16 | Apache-2.0 | Referencia de calidad; ~18,8 GB de pesos (estimado) |
| 2imi9/Qwen3.5-9B-NVFP4A16 | 9,41B (por el nombre) | No disponible | safetensors, NVFP4A16 | No disponible | Otra cuantizacion del mismo base por otro autor; sin metricas publicas en la informacion disponible |
| Freenixi/AxionML-Qwen3.5-9B-NVFP4-GGUF | 9,41B (por el nombre) | No disponible | GGUF (con mmproj BF16 de unsloth) | No disponible | Conversion GGUF de terceros para llama.cpp y GPUs de baja VRAM |

No se dispone de comparaciones con modelos de otras familias (por ejemplo, alternativas densas de ~9B de otros laboratorios) en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: +2,9 % de perplejidad y 93,2 % de acuerdo top-1 frente al BF16. En tareas sensibles a tokens exactos (código, JSON estructurado, matemáticas) la degradación puede ser mayor que la que sugiere la perplejidad.
- Dependencia de hardware: NVFP4 rinde de forma nativa solo en GPUs Blackwell; en otras tarjetas el beneficio de memoria y velocidad se reduce o desaparece.
- Sesgos: no documentados por el autor. La calibración se hizo con un corpus mixto con predominio de coreano, lo que puede desviar ligeramente el comportamiento respecto a otras distribuciones lingüísticas; no hay evaluación de sesgos.
- Riesgo de alucinación: inherente al modelo base y no cuantificado en esta información; la cuantización PTQ puede ampliarlo en contextos largos.
- Idiomas: no hay lista oficial de idiomas soportados en este repositorio; la única evidencia empírica cubre inglés y coreano.
- Contexto: la longitud máxima no está documentada en la información disponible; debe consultarse el `config.json` del modelo base antes de dimensionar la caché KV.
- Inconsistencia documental: la model card menciona "AWQ" en el párrafo descriptivo del PTQ, lo que no concuerda con el esquema NVFP4 declarado en el resto del documento. Conviene verificar el `quantization_config` antes de desplegar.
- Licencia: Apache-2.0 permite uso comercial, pero los derechos sobre pesos originales, tokenizador y chat template corresponden al equipo Qwen; se recomienda conservar los avisos de atribución.
- Madurez: el repositorio tiene 0 descargas y 1 "like" en el momento de la consulta, sin validación externa publicada; para producción conviene comparar con otras cuantizaciones del mismo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-9B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Ficha de NVIDIA Jetson AI Lab para Qwen3.5-9B: https://github.com/NVIDIA-AI-IOT/jetson-ai-lab/blob/main/src/content/models/qwen3-5-9b.md
- Cuantizacion alternativa del mismo base: https://huggingface.co/2imi9/Qwen3.5-9B-NVFP4A16
- Conversion GGUF de terceros: https://huggingface.co/Freenixi/AxionML-Qwen3.5-9B-NVFP4-GGUF
- Ficha de proveedor con precios por tokens (referencia del modelo base): https://nano-gpt.com/models/text/qwen/qwen3.5-9b
- Directorio de modelos (referencia): https://www.toolify.ai/ai-model/axionml-qwen3-5-9b-nvfp4
