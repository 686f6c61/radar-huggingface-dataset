# g-oQ/Qwen3.8-27B-oQ8h-mtp

## Resumen

Qwen3.8-27B-oQ8h-mtp es una cuantización mixta del modelo base Qwen/Qwen3.8-27B, publicada por el usuario g-oQ mediante la herramienta oQ (oMLX v0.8.2), orientada específicamente al ecosistema MLX de Apple Silicon. El checkpoint combina distintos formatos de almacenamiento (afín de 8 bits con grupo 64, BF16 y U32) para lograr un promedio efectivo de 23,628 bits por peso, lo que lo sitúa en un régimen de precisión mixta más cercano a BF16 que a una cuantización agresiva de 4 u 8 bits uniforme.

El modelo incluye, según la model card, tres componentes diferenciados: el modelo de lenguaje (9,017B parámetros lógicos), un codificador visual (0,461B) y una cabeza MTP (multi-token prediction) de 0,425B, lo que suma 9,902B parámetros lógicos totales y un repositorio de 29,3 GB. La presencia de visión y de cabeza MTP indica que el modelo base es multimodal y está preparado para decodificación especulativa o predicción multi-token.

La relevancia de esta publicación es fundamentalmente práctica: permite ejecutar un modelo de la familia Qwen3.8 en hardware Apple mediante MLX, con un equilibrio de precisión pensado para preservar calidad frente a cuantizaciones más agresivas. No obstante, la información pública es muy escasa (sin benchmarks, sin licencia declarada, sin idiomas especificados y con cero descargas en el momento de la ficha), por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual + cabeza MTP); familia qwen3_5 |
| Parametros totales | 9.902.379.760 (lógicos, según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: afín 8-bit grupo 64 (2,915B), BF16 (0,900B), U32 (6,088B); promedio efectivo 23,628 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base Qwen/Qwen3.8-27B, no un modelo entrenado desde cero. La arquitectura subyacente pertenece a la familia qwen3_5 y consta de un modelo de lenguaje de 9,017B parámetros lógicos, un módulo de visión de 0,461B y una cabeza MTP (multi-token prediction) de 0,425B. La cabeza MTP sugiere soporte para decodificación especulativa o generación multi-token, una técnica habitual para acelerar la inferencia en modelos de la familia Qwen.

La cuantización se realizó con oQ (oMLX v0.8.2) en modo de precisión mixta: el 29,438% de los pesos lógicos se almacena en afín 8-bit con grupo de 64 (8,50 bits/peso efectivos), el 9,086% en BF16 (16 bits/peso) y el 61,477% en U32 (32 bits/peso). Este reparto es atípico: la mayor parte del almacenamiento corresponde a tensores U32, lo que eleva el tamaño del repositorio a 29,3 GB y el promedio a 23,628 bits/peso, muy por encima de una cuantización de 8 bits uniforme. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: el modelo de lenguaje de 9,017B parámetros lógicos soporta tareas generativas generales, aunque no se detallan capacidades específicas en la model card.
- Visión: incluye un codificador visual de 0,461B parámetros, por lo que se espera soporte de entrada de imágenes, si bien no se documentan tareas concretas.
- Predicción multi-token: la cabeza MTP de 0,425B habilita decodificación especulativa o generación de varios tokens por paso, orientada a reducir latencia.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización mixta permiten ejecutar el modelo en Macs con memoria unificada suficiente (el repositorio ocupa 29,3 GB), ideal para desarrollo y prototipado sin GPU dedicada.
- Asistentes multimodales en escritorio: gracias al codificador visual, puede emplearse en aplicaciones que combinen texto e imagen, como análisis de capturas o documentos escaneados, siempre que se valide su calidad real.
- Aceleración de generación con MTP: la cabeza de predicción multi-token puede aprovecharse para reducir la latencia en tareas de generación larga, como resumen o redacción asistida.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad frente al modelo base Qwen3.8-27B en BF16, útil en investigación sobre cuantización mixta.
- Prototipado de pipelines de visión-lenguaje: permite experimentar con tareas image-to-text en entornos MLX antes de escalar a despliegues con GPUs.
- Investigación sobre decodificación especulativa: la inclusión de la cabeza MTP lo hace adecuado para estudiar técnicas de generación acelerada en el ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 29,3 GB (27,239 GiB de pesos), por lo que se necesita al menos ~30 GB de memoria unificada o VRAM para cargar el checkpoint completo.
- GPU recomendadas: no disponible; el formato MLX está orientado a Apple Silicon (series M1/M2/M3/M4 con memoria unificada de 32 GB o superior).
- ¿Cabe en GPU consumer? En GPUs NVIDIA consumer (RTX 4090 con 24 GB) no cabría el checkpoint completo sin offloading; en Apple Silicon con 32 GB o más, sí es viable.
- Opciones de despliegue: MLX (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ8h-mtp (este) | 9,902B lógicos | no disponible | no disponible | safetensors (MLX) | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27B (según nombre) | no disponible | no disponible | no disponible | Hugging Face |
| Otras cuantizaciones oQ de la familia Qwen3.8 | no disponible | no disponible | no disponible | safetensors (MLX) | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base Qwen/Qwen3.8-27B antes de cualquier despliegue.
- Sin benchmarks ni evaluación de calidad: no hay evidencia publicada de que la cuantización mixta preserve el rendimiento del modelo base.
- Repositorio de 29,3 GB con predominio de tensores U32: el promedio de 23,628 bits/peso es elevado, lo que reduce las ventajas de tamaño frente a BF16 y limita su uso en hardware con poca memoria.
- Cero descargas y cero likes: no hay validación comunitaria ni informes de funcionamiento.
- Idiomas no especificados: riesgo de comportamiento deficiente en castellano u otros idiomas no confirmados.
- Riesgo de alucinación: inherente a los modelos generativos; no hay documentación específica sobre mitigaciones.
- Dependencia del ecosistema MLX: no es directamente compatible con pipelines estándar de PyTorch/vLLM sin conversión.
- Sesgos: no documentados en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/g-oQ/Qwen3.8-27B-oQ8h-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
