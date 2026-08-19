# ben0112/Qwen3.8-27B-oQ2.7e-mtp

## Resumen

El modelo `ben0112/Qwen3.8-27B-oQ2.7e-mtp` es una cuantización de precisión mixta de 2 bits del modelo Qwen3.8-27B, realizada con la herramienta oQ (oMLX v0.5.7) y publicada en formato MLX safetensors. Qwen3.8-27B es un LLM denso multimodal desarrollado por Alibaba, con arquitectura híbrida de atención (lineal en 48 de 64 capas), torre de visión integrada y un cabezal de decodificación especulativa MTP. La cuantización reduce el tamaño del modelo a aproximadamente 12,8 GB, lo que permite ejecutarlo en hardware con recursos limitados, especialmente en Apple Silicon mediante MLX.

Esta ficha se centra en la versión cuantizada, pero es importante entender que las capacidades y el rendimiento derivan del modelo base. La cuantización de 2 bits introduce una degradación esperada en la calidad de generación, aunque el tamaño compacto la hace atractiva para despliegues en entornos con restricciones de memoria. El repositorio no proporciona información sobre licencia, idiomas ni benchmarks específicos de la cuantización, por lo que estos datos se toman del modelo original cuando están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido con atención lineal (48/64 capas) y torre de visión |
| Parametros totales | 3.884.219.632 (según safetensors; el modelo base Qwen3.8-27B tiene 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens nativos, extensible a 1M (modelo base) |
| Tipos de cuantizacion | 2 bits, group size 64, precisión mixta (oQ) |
| Idiomas soportados | No disponible en la model card (el modelo base soporta chino e inglés principalmente) |
| Licencia | No disponible en la model card (el modelo base usa Apache 2.0) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura densa con atención híbrida: 48 de sus 64 capas usan atención lineal (presumiblemente con mecanismos como Gated Linear Attention o similar), lo que reduce el coste computacional en contextos largos. Incluye una torre de visión que permite procesar imágenes y video, y un cabezal MTP (Multi-Token Prediction) que actúa como borrador para decodificación especulativa, acelerando la generación. El entrenamiento del modelo base no se detalla en la información disponible, pero por su naturaleza multimodal y su enfoque en codificación y agentes, se infiere un entrenamiento con datos mixtos de texto e imagen.

La cuantización oQ aplica precisión mixta: no todos los pesos se cuantizan a 2 bits, sino que se seleccionan dinámicamente las capas que toleran menor precisión, manteniendo otras en mayor precisión (probablemente FP16 o BF16). Esto explica el tamaño del repositorio (12,8 GB) y el nombre "oQ2.7e-mtp" (2.7e podría referirse a un parámetro de la cuantización, aunque no está documentado). La cuantización se realizó con oMLX v0.5.7, una herramienta específica para MLX.

## Capacidades

- Generación de texto y razonamiento multilingüe (el modelo base soporta chino e inglés, aunque la cuantización no especifica idiomas).
- Comprensión multimodal: entrada de imágenes y video (nativo en el modelo base).
- Generación de código y soporte para agentes: el modelo base destaca en tareas de codificación y flujos de trabajo agénticos (benchmarks como Terminal Bench y OSWorld).
- Razonamiento multi-paso y planificación, útil para automatización de oficina.
- Decodificación especulativa mediante el cabezal MTP, que acelera la inferencia en el modelo base (la cuantización podría mantener esta funcionalidad si se conserva el cabezal).
- Tool calling y function calling: no se confirma explícitamente, pero es esperable en un modelo orientado a agentes.
- Capacidad de manejar contextos largos (262K nativos, hasta 1M con extensiones).

## Casos de uso

- Asistente de programación en entornos con recursos limitados: al ocupar solo 12,8 GB, puede ejecutarse en un Mac con 16 GB de RAM unificada, permitiendo autocompletado y generación de código en local sin depender de la nube.
- Automatización de oficina en dispositivos Apple: el modelo puede procesar documentos, resumir correos o generar informes, aprovechando la integración con MLX y la baja huella de memoria.
- Prototipado rápido de aplicaciones multimodales: gracias a su capacidad de entrada de imágenes, puede usarse para clasificar o describir imágenes en entornos de desarrollo sin GPU dedicada.
- Agente conversacional para atención al cliente: con contexto largo (262K), puede mantener conversaciones extensas y recordar detalles de interacciones previas, aunque la cuantización de 2 bits puede afectar la coherencia en diálogos complejos.
- Educación y experimentación: investigadores y estudiantes pueden probar un modelo de 27B en hardware de consumo, explorando técnicas de cuantización y comparando calidad frente a versiones sin cuantizar.
- Despliegue en servidores con GPUs de baja VRAM (p.ej. 16 GB): si se convierte a GGUF o se usa con librerías compatibles, podría servir en inferencia batch o en aplicaciones donde la latencia no sea crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización. Los datos disponibles corresponden al modelo base Qwen3.8-27B, que según la guía de lovableapp.org alcanza:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos valores son orientativos y no reflejan el rendimiento de la versión cuantizada, que previsiblemente será inferior debido a la pérdida de precisión. No se dispone de comparaciones con otras cuantizaciones del mismo modelo (p.ej. Q4, Q8) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 12,8 GB en disco. Para inferencia con MLX, se recomienda un Mac con al menos 16 GB de memoria unificada (los pesos cargan en RAM/VRAM compartida).
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con 16 GB o más. No hay indicaciones para GPUs NVIDIA, pero al ser safetensors MLX, se podría convertir a otros formatos (GGUF) para usar con llama.cpp en GPUs con 16 GB de VRAM (p.ej. RTX 4080, 4090).
- Opciones de despliegue: MLX (principal), con posibilidad de conversión a GGUF mediante herramientas como `mlx_lm.convert` o `llama.cpp`. No se menciona soporte para vLLM o TGI en esta cuantización.
- Latencia y throughput: no disponibles. La decodificación especulativa del modelo base podría mejorar la velocidad, pero no hay datos para la versión cuantizada.

## Comparativa con modelos similares

La comparativa se realiza a nivel del modelo base, ya que no hay datos de la cuantización frente a otras. Qwen3.8-27B se posiciona frente a alternativas de tamaño similar:

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Texto + imagen/video | Apache 2.0 | Atención híbrida, MTP |
| Llama 3.1 8B | 8B | 128K | Texto | Llama 3.1 | Menor capacidad, contexto menor |
| Mistral Large 2 | 123B | 128K | Texto | Apache 2.0 | Más grande, requiere más hardware |

Esta cuantización de 2 bits permite ejecutar un modelo de 27B en hardware que normalmente solo soportaría modelos de 7-8B, a costa de una degradación de calidad. No hay comparativas directas con otras cuantizaciones del mismo modelo en la información disponible.

## Limitaciones y advertencias

- La cuantización de 2 bits puede provocar una pérdida significativa de precisión, aumentando la perplejidad y reduciendo la coherencia en tareas complejas como razonamiento matemático o generación de código extenso.
- No se dispone de información sobre sesgos del modelo base ni de la cuantización. El modelo Qwen3.8-27B, al ser entrenado por Alibaba, puede tener sesgos culturales y lingüísticos hacia el chino y el inglés.
- Riesgo de alucinación: inherente a los LLM, probablemente exacerbado por la baja precisión de los pesos.
- La licencia de la cuantización no está especificada; aunque el modelo base es Apache 2.0, el trabajo derivado podría tener restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- El formato MLX safetensors limita su uso a entornos Apple Silicon; para otros hardware se requiere conversión, lo que puede introducir incompatibilidades.
- El contexto de 262K es del modelo base; la cuantización podría no mantener la misma capacidad efectiva si los pesos de atención se degradan.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ben0112/Qwen3.8-27B-oQ2.7e-mtp
- Repositorio del modelo base (AlibabaCloud-Official/Qwen3.8-27B): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de Qwen3.8-27B (lovableapp.org): https://lovableapp.org/blog/qwen3-8-27b
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
