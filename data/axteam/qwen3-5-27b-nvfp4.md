# axteam/Qwen3.5-27B-NVFP4

## Resumen

`axteam/Qwen3.5-27B-NVFP4` es una cuantización de 4 bits del modelo multimodal `Qwen/Qwen3.5-27B` del equipo Qwen, publicada por el usuario axteam. El objetivo es reducir el coste de memoria y acelerar el servicio en vLLM mediante el esquema NVFP4 (W4A4, FP4), que cuantiza tanto pesos como activaciones a FP4 con escalas FP8 E4M3 por grupo de 16 elementos y una escala global FP32 por tensor. El checkpoint ocupa aproximadamente 28,6 GB en disco y conserva en BF16 las partes sensibles del modelo: la torre de visión, el proyector, la cabeza MTP, las RMSNorm, los embeddings, la LM head y toda la ruta de atención lineal (GatedDeltaNet/SSM).

El modelo base es un transformer híbrido (atención lineal más atención completa) de tipo denso, con 27.781.427.952 parámetros totales, capacidades multimodales de imagen-texto y una cabeza de predicción multi-token (MTP). La cuantización es post-entrenamiento (PTQ), sin reentrenamiento, y se calibró con 256 muestras de un corpus mixto con predominio de coreano.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de 27B multimodo con un presupuesto de VRAM de 4 bits; por otro, es un ejemplo de cuantización FP4 pensada específicamente para hardware Blackwell, con degradación medida frente al original BF16 de +3,1% en perplejidad y 93,4% de acuerdo top-1 en el siguiente token.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (visión) con cabeza MTP |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (los ejemplos de uso emplean `--max-model-len 32768`) |
| Tipos de cuantización | NVFP4 (W4A4, FP4 E2M1), pesos por grupo de 16 con escala FP8 E4M3 y escala global FP32; activaciones FP4; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | No disponible en la información proporcionada (el corpus de calibración es de predominio coreano; el conjunto de evaluación interno es inglés/coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.5-27B` emplea una arquitectura híbrida que combina capas de atención lineal (GatedDeltaNet/SSM) con capas de atención completa, lo que reduce el coste computacional en contextos largos. Es un modelo denso de 27B parámetros con torre de visión y proyector multimodal, además de una cabeza de predicción multi-token (MTP) que permite decodificación especulativa interna. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo original.

Esta publicación concreta es una cuantización post-entrenamiento (PTQ) sin reentrenamiento, realizada con un conjunto de calibración de 256 muestras de un corpus mixto con predominio de coreano. La model card menciona AWQ como técnica de protección de canales salientes antes del redondeo, aunque el esquema de almacenamiento es NVFP4. Se mantienen en BF16 aproximadamente el 32% de los parámetros: la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y la totalidad de la ruta de atención lineal (`linear_attn.*`), porque FP4 resulta demasiado grueso para los pesos del SSM. El tokenizador, la plantilla de chat y la configuración de generación son idénticos al original; `config.json` añade únicamente el bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con el original.
- Razonamiento con modo de pensamiento (thinking mode) activado por defecto en la plantilla de chat; desactivable con `chat_template_kwargs={"enable_thinking": False}`.
- Comprensión de imágenes (pipeline `image-text-to-text`): acepta URL o data URI en el contenido del mensaje.
- Predicción multi-token (cabeza MTP) conservada en BF16 para decodificación especulativa.
- Muestreo recomendado por el autor: `temperature=0.6`, `top_p=0.95`, `top_k=20`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (evaluación interna en inglés y coreano).
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Servicio multimodal en producción con vLLM: desplegar un endpoint compatible con OpenAI (`vllm serve axteam/Qwen3.5-27B-NVFP4 --max-model-len 32768`) para responder consultas que combinan imagen y texto, aprovechando los 28,6 GB de pesos en FP4 para reducir el número de GPUs necesarias.
- Asistentes conversacionales con contexto largo: la arquitectura híbrida de atención lineal más atención completa está diseñada para abaratar el coste por token en ventanas extensas; combinada con `--kv-cache-dtype fp8`, permite servir contextos largos con menor presión de memoria de caché KV.
- Procesamiento de documentos con imágenes: extracción y descripción de contenido visual (capturas, diagramas, formularios) mediante el pipeline `image-text-to-text`, manteniendo la torre de visión en BF16 para preservar calidad.
- Despliegue en hardware Blackwell: casos donde se dispone de B200/GB200 (sm100), B300 (sm103) o RTX 50xx / RTX PRO 6000 (sm120) y se quiere aprovechar la ruta rápida FP4 (W4A4) del runtime.
- Inferencia en GPUs de gama alta con menor VRAM: en Turing–Hopper (sm75–90) el modelo cae a FP4 solo de pesos, lo que sigue reduciendo el espacio ocupado frente al BF16 original, a costa de velocidad.
- Evaluación comparativa de cuantizaciones: usar este checkpoint como referencia para medir la pérdida de fidelidad frente al BF16 original en tareas propias, con las métricas publicadas de perplejidad y acuerdo top-1 como línea base.
- Servicio solo texto: con `--limit-mm-per-prompt '{"image": 0, "video": 0}` se evita cargar el presupuesto de memoria del codificador visual cuando no se necesita visión.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de fidelidad frente al modelo BF16 original, medidas por el autor sobre un conjunto interno mixto inglés/coreano de 100 prompts con respuestas greedy. No son puntuaciones absolutas de tareas.

| Métrica | Este modelo (NVFP4) | Original BF16 | Diferencia |
|---|---|---|---|
| Perplejidad (menor es mejor) | 1,4018 | 1,3603 | +3,1% |
| Acuerdo top-1 en siguiente token | 93,4% | 99,3% | −5,9 puntos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para pesos: 28,6 GB en FP4. Hay que sumar la caché KV (crece con longitud de contexto y peticiones concurrentes) y varios GB para activaciones y gráficas CUDA.
- GPU con ruta rápida FP4 completa (W4A4): Blackwell — B200/GB200 (sm100), B300 (sm103), RTX 50xx y RTX PRO 6000 (sm120).
- GPU Turing–Hopper (sm75–90): funcionan en modo FP4 solo de pesos, más lento, con aviso de vLLM.
- V100 (sm70): no soportada.
- Cabe en GPU de consumo: sí, en las RTX 50xx (sm120) que soportan NVFP4; en otras consumer (por ejemplo, RTX 4090, sm89) el modelo cae a FP4 solo de pesos y requiere evaluar el equilibrio memoria/velocidad.
- Despliegue recomendado: vLLM ≥ 0.17.0 para la arquitectura; el entorno indicado por el autor es vLLM 0.32 con Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Uso sin vLLM: `transformers>=5.2.0` + `compressed-tensors>=0.15.0`; no requiere `trust_remote_code`.
- Paralelismo: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica únicamente que solo se probó en B200.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-27B-NVFP4 | 27,78B | no disponible | NVFP4 W4A4 (compressed-tensors) | Apache-2.0 | HuggingFace, 42 descargas |
| Qwen/Qwen3.5-27B (original) | 27,78B | no disponible | BF16 | Apache-2.0 | HuggingFace |
| Otras cuantizaciones del mismo base (FP8, AWQ-4bit, NVFP4A16) | 27,78B | no disponible | FP8 / AWQ / NVFP4A16 | Apache-2.0 (derivadas) | Mencionadas como probadas por el autor; sin enlace en la información disponible |

La comparación se limita al modelo base y a variantes de cuantización del mismo; no se dispone de datos de benchmarks frente a modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de fidelidad medible: +3,1% de perplejidad y 93,4% de acuerdo top-1 frente al BF16 original en el conjunto interno del autor; en tareas sensibles conviene validar con datos propios.
- La cuantización se calibró con un corpus de predominio coreano; el comportamiento en otros idiomas puede desviarse más de lo que sugieren las métricas publicadas.
- El autor indica que el build no se ha ejecutado todavía en su entorno vLLM; la validación de producción corre por cuenta del usuario.
- Dependencia estricta de versiones: vLLM 0.32, torch 2.13 con CUDA 13.0, transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0. Actualizar compressed-tensors por separado puede romper la carga del checkpoint (guardado con 0.19.0).
- En GPUs anteriores a Blackwell se pierde la ventaja FP4 de activaciones y el rendimiento cae; V100 no está soportada.
- El modo de pensamiento está activado por defecto en la plantilla de chat, lo que incrementa tokens generados y latencia si no se desactiva explícitamente.
- Sesgos conocidos y riesgo de alucinación: no disponibles en la información proporcionada; aplican los del modelo base Qwen3.5-27B.
- Licencia Apache-2.0 permite uso comercial, pero los pesos originales, tokenizador y plantilla pertenecen al equipo Qwen; conviene revisar la licencia del modelo base enlazada por el autor.
- La memoria de caché KV en BF16 por defecto puede dominar el consumo en contextos largos o con muchas peticiones concurrentes; considerar `--kv-cache-dtype fp8`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada.
