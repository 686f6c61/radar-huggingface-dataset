# dima1810/BotPsy-0.8B-oQ8e

## Resumen

BotPsy-0.8B-oQ8e es una versión cuantizada del modelo BotPsy-0.8B, publicada por el usuario dima1810 en Hugging Face. Se trata de un checkpoint de aproximadamente 853 millones de parámetros, derivado de la familia arquitectónica qwen3_5 (según los tags del repositorio), que incorpora un componente de visión de unos 101 millones de parámetros, lo que lo convierte en un modelo multimodal de pequeño tamaño. El checkpoint se ha cuantizado con la herramienta oQ (oMLX v0.8.0rc1) en precisión mixta, con un promedio efectivo de 9,389 bits por peso.

La relevancia de esta publicación radica en su enfoque de despliegue: está empaquetada en formato MLX, la librería de Apple para ejecución de modelos en silicio de la serie M, lo que la orienta a inferencia local en equipos Mac. Al mantener en BF16 el 11,851 % de los pesos (principalmente el módulo de visión) y cuantizar en 8 bits afines con grupo de 64 el resto, busca un equilibrio entre calidad y huella de memoria: el repositorio ocupa 1,0 GB.

No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni detalles de entrenamiento, y el modelo no registra descargas ni interacciones en el momento de la consulta. Esta ficha documenta exclusivamente los datos verificables del repositorio y marca como no disponible todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia qwen3_5 según tags), con módulo de lenguaje y módulo de visión |
| Parametros totales | 852.985.920 (0,853 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 8-bit con grupo de 64 (88,149 % de los pesos) y BF16 (11,851 %); promedio efectivo 9,389 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, librería MLX (formato de cuantización oQ) |

## Arquitectura y entrenamiento

El checkpoint sigue la arquitectura qwen3_5, un transformer con un módulo de lenguaje de 0,752 B de parámetros lógicos y un módulo de visión de 0,101 B. La distribución de precisión es deliberada: el 88,149 % de los pesos (0,752 B) se almacena en affine 8-bit con grupo de 64 (8,50 bits/peso efectivos, 0,744 GiB), mientras que el 11,851 % restante (0,101 B), correspondiente al componente de visión, se conserva en BF16 (16,00 bits/peso, 0,188 GiB). El resultado es un checkpoint de 0,932 GiB (1,001 GB) con un promedio de 9,389 bits por peso.

No se dispone de información sobre el proceso de entrenamiento del modelo base: ni el número de tokens, ni la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.). La única información técnica verificable es la relativa al proceso de cuantización, realizado con oQ (oMLX v0.8.0rc1), una herramienta de cuantización de precisión mixta para MLX.

## Capacidades

- Generación de texto y razonamiento: el módulo de lenguaje de 0,752 B permite generación autoregresiva estándar, aunque no hay evaluación publicada de su calidad.
- Procesamiento de visión: el módulo de visión de 0,101 B en BF16 sugiere capacidades de comprensión de imágenes, si bien no se documentan tareas concretas (VQA, OCR, captioning).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Inferencia local en Mac con silicio de Apple: al estar empaquetado en MLX y ocupar 1,0 GB, el modelo puede cargarse en un Mac con 8 GB de memoria unificada, lo que permite probar un modelo multimodal pequeño sin GPU dedicada.
- Prototipado de aplicaciones multimodales en local: el módulo de visión permite experimentar con pipelines imagen-texto en un equipo de desarrollo antes de escalar a modelos mayores.
- Evaluación de cuantización mixta: útil como caso de estudio para comparar la pérdida de calidad del esquema oQ (8-bit affine grupo 64 + BF16 selectivo) frente al modelo base en BF16.
- Pruebas de integración con MLX: sirve para validar flujos de carga, tokenización e inferencia en la librería MLX antes de desplegar modelos de mayor tamaño.
- Experimentos educativos: por su tamaño reducido, es adecuado para estudiar el comportamiento de un transformer multimodal cuantizado en entornos con recursos limitados.
- Desarrollo de demos offline: aplicaciones de escritorio en Mac que requieran procesamiento de texto e imagen sin conexión a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1,0 GB para los pesos; con overhead de ejecución (KV cache, activaciones) se recomienda un mínimo de 2-4 GB, aunque no hay cifras oficiales.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (series M1, M2, M3, M4). No se documenta soporte para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con silicio de Apple y 8 GB o más de memoria unificada.
- Opciones de despliegue: MLX y oMLX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI (el formato oQ es específico de MLX).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| BotPsy-0.8B-oQ8e | 0,853 B | no disponible | Texto + visión | no disponible | MLX (oQ, safetensors) |
| Qwen2.5-VL-3B | 3 B | 32.768 tokens (según documentación pública de Qwen) | Texto + visión | Apache 2.0 (según documentación pública) | safetensors, GGUF |
| SmolVLM-500M | 0,5 B | 8.192 tokens (según documentación pública) | Texto + visión | Apache 2.0 (según documentación pública) | safetensors, GGUF |
| Gemma 3 1B | 1 B | 32.768 tokens (según documentación pública) | Texto | Gemma Terms (según documentación pública) | safetensors, GGUF |

Nota: los datos de los modelos comparables provienen de su documentación pública y pueden variar; los de BotPsy-0.8B-oQ8e son los únicos verificados en el repositorio. No se dispone de métricas de rendimiento comparables para este checkpoint.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal; conviene contactar con el autor antes de cualquier despliegue en producción.
- Falta de documentación: no hay información sobre datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide estimar sesgos, calidad o robustez.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño, agravado por la ausencia de benchmarks que cuantifiquen su fiabilidad.
- Cuantización agresiva: el esquema de 8 bits con grupo de 64 puede degradar tareas sensibles a la precisión numérica (matemáticas, código) respecto al modelo base en BF16.
- Dependencia de plataforma: el formato MLX limita su uso a Apple Silicon; no es portable a CUDA ni a CPU genérica sin reconversión.
- Modelo sin tracción: cero descargas y cero interacciones en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- Sin garantías de mantenimiento: el repositorio se creó y actualizó en el mismo día (17 de noviembre de 2026), sin historial posterior.

## Enlaces

- Hugging Face: https://huggingface.co/dima1810/BotPsy-0.8B-oQ8e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
