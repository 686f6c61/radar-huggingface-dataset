# mrminjae/qwen3p6-35b-a3b-2p10bit-r119

## Resumen

Qwen3.6-35B-A3B 2.10-bit (r119) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización selectiva: únicamente los expertos enrutados del modelo MoE se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanece en BF16. Los pesos se distribuyen ya dequantizados en tensores BF16, de modo que cargan directamente con `transformers` o vLLM sin necesidad de kernels de cuantización especiales.

El modelo hereda la arquitectura Mixture-of-Experts del base Qwen3.6-35B-A3B, con 35 000 millones de parámetros totales y aproximadamente 3 000 millones activos por token (según la nomenclatura A3B del nombre). La etiqueta `image-text-to-text` y la arquitectura `qwen3_5_moe` indican que el modelo base es multimodal (entrada de imagen y texto), aunque la model card del checkpoint no detalla el pipeline de visión ni los datos de entrenamiento.

La relevancia de este checkpoint es doble: por un lado, demuestra una técnica de compresión agresiva sobre las capas MoE que reduce el tamaño en disco del repo a 74 GB (frente a los ~70 GB que ocuparían 35B parámetros en BF16, lo que sugiere que el ahorro real es modesto al mantener el resto en BF16); por otro, es un artefacto de investigación interna sin benchmarks publicados, sin licencia declarada y con cero descargas, por lo que debe tratarse como material experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (tag `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35B (35 000 millones, segun nombre del modelo) |
| Parametros activos | ~3B (segun sufijo A3B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (carga con `transformers` / vLLM en BF16) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3.6-35B-A3B, un modelo Mixture-of-Experts con 35B parámetros totales y ~3B activos. La innovación técnica de esta versión r119 es la cuantización selectiva de los expertos enrutados a una media de 2,10 bits, manteniendo el resto de la red en BF16. Los pesos se guardan ya dequantizados, por lo que el usuario no necesita herramientas de descuantización: el repositorio contiene tensores BF16 que se cargan con la librería estándar. No se especifica la técnica exacta de cuantización (GPTQ, AWQ, bitsandbytes u otra propia), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF/DPO. Tampoco se detalla el proceso de calibración de los expertos ni el error de reconstrucción introducido.

La model card describe el artefacto como "internal research checkpoint" (ID interno r119), sin información sobre el pipeline de evaluación, la metodología de compresión ni los criterios de selección de qué expertos se cuantizan. Al mantener el resto de pesos en BF16 y almacenar los expertos dequantizados, el ahorro de memoria en inferencia respecto al modelo base no es directo: el repo pesa 74 GB y no se documenta si el runtime aplica alguna compresión en tiempo de carga.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.6-35B-A3B.
- Entrada multimodal imagen-texto (tag `image-text-to-text`), aunque la model card no detalla el soporte de visión.
- Razonamiento y matemáticas: capacidades esperables del base, sin benchmarks publicados que las cuantifiquen en esta versión.
- Generación de código: no documentada específicamente para este checkpoint.
- Tool calling / function calling: no documentado en la model card del checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint permite estudiar el impacto de comprimir expertos a 2,10 bits manteniendo el resto en BF16, comparando calidad frente al base en tareas controladas.
- Evaluación de degradación por capas: útil para analizar qué tipos de tarea (razonamiento, código, visión) sufren más con la cuantización de expertos.
- Pruebas de carga e integración con `transformers` y vLLM: al distribuirse los pesos en BF16, sirve para validar pipelines de despliegue sin kernels de cuantización personalizados.
- Benchmarking interno de latencia y memoria: permite medir el coste real de un MoE de 35B con expertos comprimidos frente al base sin comprimir.
- Experimentos de destilación o fine-tuning sobre un modelo ya comprimido, para evaluar si el ajuste recupera calidad perdida.
- Docencia y divulgación: ejemplo práctico de cuantización selectiva en arquitecturas MoE para explicar el equilibrio entre precisión, memoria y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 74 GB en BF16; para cargar el modelo completo se necesitan al menos ~74 GB de memoria (GPU o CPU+offload). No se documenta el ahorro efectivo en VRAM tras la dequantización.
- GPU recomendadas: para carga completa en BF16, A100 80 GB, H100 80 GB o configuraciones multi-GPU. En GPUs de 24 GB (RTX 4090) no cabe sin offload a CPU o sharding.
- Consumer GPU: no cabe en GPUs de consumo de 24 GB o menos sin técnicas de offload; podría intentarse con llama.cpp/Ollama si se generan GGUF, pero el repo solo distribuye pesos BF16.
- Opciones de despliegue: `transformers` y vLLM según la model card; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r119 | 35B | ~3B | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | ~3B | no disponible | no disponible | Hugging Face |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación interna (r119) sin benchmarks ni evaluación publicada; no apto para producción sin validación propia.
- Cuantización agresiva a 2,10 bits en expertos enrutados: riesgo elevado de degradación de calidad, especialmente en razonamiento y tareas de nicho.
- Licencia no disponible: la model card remite a la licencia del base sin especificarla, lo que impide confirmar el uso comercial.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Contexto máximo no documentado; no se debe asumir la ventana del base sin verificación.
- Riesgo de alucinación no cuantificado en esta versión; la compresión puede amplificarlo.
- Sesgos: no documentados; hereda los del modelo base, que tampoco se detallan.
- Repositorio de 74 GB con pesos BF16: el ahorro de memoria frente al base no está garantizado y puede requerir hardware de gama alta.
- Cero descargas y cero likes: sin validación comunitaria; tratar como artefacto experimental.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r119
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
