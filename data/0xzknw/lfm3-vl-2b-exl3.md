# 0xzknw/LFM3-VL-2B-EXL3

## Resumen

LFM3-VL-2B-EXL3 es una conversión de cuantización del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por el usuario independiente 0xzknw. No se trata de un modelo nuevo ni de un ajuste fino, sino de una exportación de pesos en formato EXL3 (ExLlamaV3) a dos tasas de bits objetivo, 4 y 8 bpw, generada con ExLlamaV3 1.6.6 sobre una NVIDIA H100 a través de Modal. El modelo base es un modelo de lenguaje y visión de 2.000 millones de parámetros desarrollado por Liquid AI, orientado a tareas image-text-to-text.

El interés de esta publicación es práctico: ofrece pesos ya cuantizados en un formato optimizado para inferencia en GPUs de consumo con el runtime ExLlamaV3, lo que reduce la huella de memoria del modelo base. La conversión aplica LDLQ calibrado con codebook MCG sobre las 142 proyecciones lineales de texto elegibles, manteniendo embeddings y cabeza de salida en 16 bits y las normas y puertas de atención pequeñas en FP16. La torre de visión y el proyector también se cuantizan al mismo objetivo de bits mediante conversión de modelo lateral de ExLlamaV3.

Es importante señalar que el autor declara explícitamente que la calidad numérica de estas cuantizaciones no está validada: no se realizaron comparaciones de logits en BF16, ni cálculos de KL o perplejidad, ni pruebas de generación, imagen o vídeo. Por tanto, la ficha describe la conversión y sus parámetros técnicos, pero no puede avalar su comportamiento cualitativo frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) del modelo base LFM3-VL-2B; pesos cuantizados en formato EXL3 |
| Parametros totales | 2B (modelo base); el checkpoint cuantizado ocupa 1.880.554.479 bytes (4 bpw) y 2.708.143.794 bytes (8 bpw) en model.safetensors |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 weight-only a 4 bpw y 8 bpw sobre 142 proyecciones lineales de texto; embeddings y cabeza de salida a 16 bits; normas y puertas pequeñas en FP16; torre de visión y proyector al mismo objetivo de 4/8 bits |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), licencia "other" en HuggingFace |
| Formato de pesos | safetensors (EXL3, requiere runtime compatible con EXL3 MCG y arquitectura LFM3-VL) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo LiquidAI/LFM3-VL-2B, un transformer multimodal de 2.000 millones de parámetros que procesa texto e imágenes (pipeline image-text-to-text). La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se especifican innovaciones arquitectónicas concretas más allá de la naturaleza multimodal del modelo.

El proceso de conversión sí está documentado con precisión. Se partió de la revisión `71d8e745d97c224984e0f20412f532a5ce9dfd3e` del modelo base y se usó ExLlamaV3 1.6.6 (commit `bd1f519172406a9560bd5c90e61000691bb69a07`) con PyTorch 2.10 y CUDA 12.8. La cuantización es LDLQ calibrada con codebook MCG, con escalas de salida en modo `auto` y sin promoción HQ. La calibración empleó el corpus mixto incluido en el conversor: 250 filas de 2.048 tokens, es decir, 512.000 tokens por conversión. Se cuantizaron las 142 proyecciones lineales de texto elegibles; los embeddings de tokens y la cabeza de salida se mantienen a 16 bits, y el conversor escribe una cabeza de salida separada junto a la tabla de embeddings. La torre de visión y el proyector se convierten con el mismo objetivo de bits mediante el mecanismo de modelo lateral de ExLlamaV3, sin calibración de activaciones.

El autor advierte que "4/8 bpw" describe las proyecciones cuantizadas, no la tasa media de bits del checkpoint completo: los tensores FP16, la cabeza de salida separada, las escalas y los metadatos incrementan el tamaño total del archivo.

## Capacidades

- Generación de texto e inferencia multimodal de imagen a texto, heredadas del modelo base LFM3-VL-2B (pipeline image-text-to-text).
- Procesamiento de imágenes mediante torre de visión y proyector, también cuantizados en esta conversión.
- Capacidades de razonamiento, código y matemáticas: no disponibles en la información proporcionada para el modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas no está cumplimentado.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.
- Integración con ExLlamaV3 para inferencia con pesos EXL3 (MCG) en GPUs NVIDIA.

## Casos de uso

- Despliegue de un modelo visión-lenguaje en GPU de consumo: la variante de 4 bpw ocupa aproximadamente 1,88 GB en `model.safetensors`, lo que permite cargar el modelo en GPUs con 8-12 GB de VRAM usando ExLlamaV3, algo inviable con los pesos originales en BF16.
- Prototipado rápido de pipelines image-text-to-text: al estar en formato EXL3 y requerir solo un runtime compatible, se puede montar un servicio de descripción de imágenes o respuesta a preguntas visuales sin infraestructura de servidor dedicada.
- Evaluación comparativa de cuantizaciones: disponer de dos variantes (4 y 8 bpw) del mismo modelo base permite medir el compromiso entre tamaño y calidad en tareas de visión y texto, siempre que el equipo realice su propia validación numérica.
- Inferencia en entornos con memoria limitada: la variante de 8 bpw (unos 2,71 GB en `model.safetensors`) ofrece más margen de fidelidad que la de 4 bpw manteniendo una huella reducida frente a FP16.
- Investigación sobre cuantización weight-only: el `manifest.json` y `SHA256SUMS` documentan revisiones, ajustes y sumas de verificación, lo que facilita reproducir o auditar el proceso de conversión.
- Experimentación con modelos multimodales pequeños en local: un modelo de 2B parámetros cuantizado encaja en flujos de trabajo de escritorio con una sola GPU, útil para pruebas de concepto de asistentes visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutaron comparaciones de logits en BF16, cálculos de KL o perplejidad, pruebas de generación ni pruebas de imagen o vídeo, y que no se reclama ninguna mejora de rendimiento o calidad. Los resultados de benchmarks que aparezcan en el `README.md` de cada variante corresponden al modelo original y no validan estas cuantizaciones.

## Requisitos de hardware

- VRAM estimada: la variante 4 bpw pesa 1.880.554.479 bytes (~1,88 GB) y la 8 bpw 2.708.143.794 bytes (~2,71 GB) en `model.safetensors`; a esto hay que sumar la memoria del runtime, el contexto y los buffers de activación, no cuantificados en la información disponible.
- GPU recomendadas: el autor generó la conversión en una NVIDIA H100, pero no especifica requisitos mínimos de inferencia. Por tamaño, ambas variantes deberían caber en GPUs de consumo con suficiente VRAM libre.
- GPU de consumo: no se confirma compatibilidad ni rendimiento en tarjetas concretas (RTX 4090, 3090, etc.); la información no lo detalla.
- Opciones de despliegue: ExLlamaV3 con soporte de EXL3 MCG y de la arquitectura LFM3-VL. La integración con MLXL3 y Apple Metal no ha sido probada para estos archivos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no realizó pruebas de generación ni de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado de validacion |
|---|---|---|---|---|---|
| 0xzknw/LFM3-VL-2B-EXL3 (4 bpw) | 2B (base) | no disponible | EXL3 safetensors | LFM Open License v1.0 | Estructural; calidad numérica no validada |
| 0xzknw/LFM3-VL-2B-EXL3 (8 bpw) | 2B (base) | no disponible | EXL3 safetensors | LFM Open License v1.0 | Estructural; calidad numérica no validada |
| LiquidAI/LFM3-VL-2B (original) | 2B | no disponible | safetensors (BF16) | LFM Open License v1.0 | Modelo de referencia del autor |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de la misma categoría (visión-lenguaje de ~2B parámetros) en los datos proporcionados, por lo que la comparativa se limita a las variantes de esta publicación y al modelo base.

## Limitaciones y advertencias

- Calidad numérica no validada: no se ejecutaron comparaciones de logits en BF16, KL, perplejidad, pruebas de generación ni pruebas de imagen o vídeo. El comportamiento puede degradarse respecto al modelo original, especialmente en la variante de 4 bpw.
- Integración no probada: la generación y la integración con MLXL3 y Apple Metal no han sido testeadas para estos archivos.
- Requisito de runtime específico: solo funciona con runtimes que soporten EXL3 MCG y la arquitectura LFM3-VL; no es un checkpoint utilizable en cualquier framework.
- Tasa de bits efectiva: "4/8 bpw" se refiere a las proyecciones cuantizadas, no al tamaño medio del checkpoint; el archivo completo es mayor de lo que sugiere esa cifra.
- Idiomas: no disponibles; se desconoce el soporte multilingüe real.
- Sesgos y alucinaciones: no documentados en la información proporcionada; deben evaluarse con el modelo base y con estas cuantizaciones.
- Licencia: se mantiene la LFM Open License v1.0 del modelo original; es responsabilidad del usuario revisar sus términos para uso comercial. El autor incluye un NOTICE con el aviso de modificación.
- Repositorio de terceros: la conversión la realiza un usuario independiente (0xzknw), no Liquid AI; no hay respaldo oficial del desarrollador del modelo base.
- Sin métricas de rendimiento: no hay datos de latencia ni throughput, lo que impide planificar capacidad en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xzknw/LFM3-VL-2B-EXL3
- Variante 4 bpw: https://huggingface.co/0xzknw/LFM3-VL-2B-EXL3/tree/main/4bpw
- Variante 8 bpw: https://huggingface.co/0xzknw/LFM3-VL-2B-EXL3/tree/main/8bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Perfil del autor: https://huggingface.co/0xzknw
- Liquid AI en HuggingFace: https://huggingface.co/LiquidAI
- ExLlamaV3 (repositorio): https://github.com/turboderp-org/exllamav3/tree/bd1f519172406a9560bd5c90e61000691bb69a07
- Licencia LFM Open License v1.0: https://huggingface.co/0xzknw/LFM3-VL-2B-EXL3/blob/main/LICENSE
- Manifest de conversión: https://huggingface.co/0xzknw/LFM3-VL-2B-EXL3/blob/main/manifest.json
- Sumas de verificación: https://huggingface.co/0xzknw/LFM3-VL-2B-EXL3/blob/main/SHA256SUMS
