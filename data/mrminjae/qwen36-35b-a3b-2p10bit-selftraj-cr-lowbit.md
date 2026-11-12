# mrminjae/qwen36-35b-a3b-2p10bit-selftraj-cr-lowbit

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado originalmente por el equipo Qwen de Alibaba. La modificación consiste en una cuantización selectiva de los expertos enrutados (routed experts) a una media de 2,10 bits, manteniendo el resto de pesos en BF16. Los pesos se almacenan de forma desquantizada en tensores BF16, por lo que se cargan directamente con `transformers` estándar o vLLM sin necesidad de kernels especiales.

El modelo se publica como checkpoint interno de investigación (identificador `full_selftraj_cr_lowbit`), orientado a experimentación con técnicas de compresión extrema sobre arquitecturas MoE. La etiqueta `image-text-to-text` sugiere capacidades multimodales heredadas del modelo base, aunque la model card no detalla el pipeline de visión. El repositorio tiene un tamaño de 14,6 GB, lo que refleja la mezcla de expertos en baja precisión y el resto de pesos en BF16.

Su relevancia radica en explorar el límite práctico de la cuantización de expertos (2,10 bits) sin degradar los tensores densos, un enfoque interesante para reducir el footprint de modelos MoE de gran tamaño. No obstante, al tratarse de un checkpoint de investigación con cero descargas y sin documentación de evaluación, debe tratarse con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, según el modelo base Qwen3.6-35B-A3B |
| Parametros totales | 35B (según nombre del modelo base) |
| Parametros activos | A3B indica aproximadamente 3B activos (según nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Routed experts a 2,10 bits de media; resto de pesos en BF16; pesos almacenados desquantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Sigue la licencia del modelo base (no especificada en la model card) |
| Formato de pesos | Tensores BF16 (compatibles con `transformers` y vLLM) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del Qwen3.6-35B-A3B, con un total de 35B parámetros y aproximadamente 3B activos por token (según la nomenclatura A3B). La modificación introducida por el autor consiste en cuantizar únicamente los expertos enrutados a una media de 2,10 bits, dejando el resto de componentes (atención, embeddings, capas densas, router) en BF16. Los pesos resultantes se almacenan desquantizados en tensores BF16, lo que permite cargarlos con herramientas estándar sin kernels de cuantización personalizados.

No se dispone de información sobre el proceso de entrenamiento o ajuste fino aplicado en este checkpoint (volumen de tokens, composición del dataset, uso de RLHF/DPO o técnicas de destilación). El identificador `full_selftraj_cr_lowbit` sugiere un pipeline de trayectoria autoconsistente (self-trajectory) con compresión de rango bajo, pero la model card no aporta detalles metodológicos. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento image-text-to-text según la etiqueta del repositorio, aunque no se detalla el soporte multimodal en la model card.
- Razonamiento y matemáticas: capacidades presumibles del modelo base, sin evaluación específica en este checkpoint.
- Generación de código: presumible por herencia del modelo base, sin datos de benchmark en este repositorio.
- Tool calling / function calling: no documentado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Modo thinking u otras capacidades especiales: no documentadas.

## Casos de uso

- Investigación en cuantización extrema de MoE: el checkpoint permite estudiar el impacto de comprimir expertos a 2,10 bits manteniendo el resto en BF16, comparando calidad frente al modelo base sin cuantizar.
- Experimentación con despliegue de bajo footprint: al almacenarse en BF16 desquantizado, se puede cargar con `transformers` o vLLM estándar para medir latencia y throughput en GPUs de gama alta.
- Evaluación de degradación por compresión: útil para generar curvas de calidad (perplejidad, benchmarks) frente a niveles de bits por experto.
- Prototipado de pipelines de inferencia MoE: sirve como banco de pruebas para validar integraciones con vLLM y comparar con el modelo base original.
- Estudio de rutas de enrutamiento (routing): al mantener el router en BF16 y los expertos en baja precisión, permite analizar cómo afecta la compresión a la distribución de expertos activados.
- Reproducibilidad de técnicas de compresión: el identificador `selftraj_cr_lowbit` permite replicar experimentos de trayectoria autoconsistente con compresión de rango bajo sobre arquitecturas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 14,6 GB en BF16 desquantizado; la carga completa en memoria requiere al menos ~15-16 GB de VRAM, más overhead de activaciones y caché KV.
- GPU recomendadas: A100 40GB/80GB, H100 80GB para despliegue cómodo; RTX 4090 24GB podría ser suficiente para inferencia con contexto corto, aunque el margen es ajustado.
- Cabe en GPU de consumo: probablemente en RTX 4090 24GB y GPUs con 24GB o más, con contexto limitado; no se garantiza en GPUs de 16GB.
- Opciones de despliegue: `transformers` (carga estándar de tensores BF16), vLLM (según indica la model card); no se mencionan GGUF, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen36-35b-a3b-2p10bit-selftraj-cr-lowbit | 35B totales / ~3B activos | no disponible | no disponible | Sigue la del base (no especificada) | Hugging Face, checkpoint de investigación |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / ~3B activos | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas MoE de ~30-40B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas concretas; la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Checkpoint de investigación interna: cero descargas y cero likes en el momento de la ficha, sin validación comunitaria.
- Cuantización extrema a 2,10 bits en expertos: alta probabilidad de degradación de calidad frente al modelo base, no cuantificada en la model card.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas.
- Licencia no especificada explícitamente: la model card indica que sigue la licencia del modelo base, pero esta no se detalla; verificar antes de uso comercial.
- Idiomas soportados no documentados: riesgo de comportamiento inconsistente en castellano u otros idiomas distintos del inglés.
- Capacidades multimodales no documentadas pese a la etiqueta `image-text-to-text`: no se describe el procesador de visión ni el formato de entrada.
- Sesgos y alucinaciones: no evaluados en este checkpoint; se heredan los del modelo base más el posible ruido introducido por la cuantización.
- No apto para producción sin evaluación previa: al ser un checkpoint interno, no hay garantías de estabilidad ni soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-selftraj-cr-lowbit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
