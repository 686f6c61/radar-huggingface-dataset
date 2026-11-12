# mrminjae/qwen36-35b-a3b-2p10bit-genans-lowbit-fp8

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, un modelo de arquitectura Mixture of Experts (MoE) desarrollado por el equipo Qwen de Alibaba. La modificación introducida por el autor (mrminjae) consiste en una cuantización selectiva de los expertos enrutados a una media de 2,10 bits, mientras el resto de los pesos del modelo permanece en BF16. El resultado es un artefacto que reduce de forma agresiva el peso de los parámetros que más contribuyen al tamaño del modelo, manteniendo intactos los componentes críticos.

El modelo base Qwen3.6-35B-A3B pertenece a la familia Qwen3.5/3.6, con 35 mil millones de parámetros totales y 3 mil millones activos por token gracias al enrutamiento MoE. Está etiquetado como image-text-to-text, lo que indica capacidades multimodales (visión y texto). Este checkpoint concreto se publica como "internal research checkpoint", sin garantías de calidad ni documentación de evaluación.

La relevancia de esta ficha radica en que documenta un experimento de compresión extrema sobre un MoE multimodal de gran tamaño, con un tamaño de repositorio de 11,8 GB. Es un artefacto de investigación, no un modelo listo para producción, y su interés principal es técnico: muestra cómo aplicar cuantización de muy baja precisión solo a los expertos de un MoE manteniendo el resto en BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, multimodal (image-text-to-text) |
| Parámetros totales | 35B (según nombre del modelo base) |
| Parámetros activos | 3B (según nombre del modelo base, A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base, pero no se especifica cuál) |
| Formato de pesos | safetensors (transformers); compatible con vLLM |
| Tamaño del repositorio | 11,8 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture of Experts: 35B parámetros totales de los cuales 3B se activan por token. El checkpoint aquí documentado no entrena desde cero ni hace fine-tuning; aplica una cuantización post-entrenamiento selectiva sobre los expertos enrutados, dejándolos a una media de 2,10 bits. El resto de los pesos (atención, embeddings, capas densas, router, etc.) permanece en BF16.

Según la model card, los pesos se almacenan dequantizados en tensores BF16, de modo que se cargan con transformers estándar y con vLLM sin necesidad de kernels personalizados. No se especifican los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Tampoco se detalla la metodología exacta de cuantización (algoritmo, calibración, tratamiento de outliers) más allá de la etiqueta interna "full_genans_lowbit_fp8". El tag image-text-to-text sugiere que el modelo base incorpora un codificador visual, aunque no se documenta su tratamiento en esta cuantización.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y el tag conversational.
- Procesamiento multimodal image-text-to-text, heredado del modelo base (no verificado en este checkpoint).
- Razonamiento y generación de código: capacidades esperables del modelo base Qwen3.6, aunque no se documentan específicamente para este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en compresión de modelos: sirve como caso de estudio para medir el impacto de cuantizar solo los expertos enrutados de un MoE a 2,10 bits, comparando la perplejidad y la calidad de generación frente al modelo base en BF16.
- Evaluación de robustez de cuantizaciones extremas: permite analizar qué tareas degradan antes (código, matemáticas, visión) cuando los expertos pierden precisión, útil para diseñar esquemas de cuantización selectiva.
- Despliegue experimental en entornos con VRAM limitada: con 11,8 GB de pesos, cabe en GPUs de consumo alto (por ejemplo, RTX 4090 de 24 GB) para pruebas de inferencia, aunque sin garantías de calidad.
- Prototipado de pipelines multimodales: al conservar la interfaz de transformers y vLLM, se puede integrar en prototipos image-text-to-text para validar flujos antes de pasar al modelo base completo.
- Benchmarking interno de serving: útil para medir throughput y latencia de un MoE de 35B con expertos comprimidos en vLLM frente a la versión BF16.
- Docencia y divulgación técnica: ejemplo práctico para explicar cómo funcionan las cuantizaciones por bloques y el enrutamiento MoE en un modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 11,8 GB; con overhead de activaciones y caché KV en BF16, se recomienda al menos 16-24 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB) o A6000 para pruebas; A100/H100 para serving con contexto largo y mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con contexto corto; no cabe en GPUs de 8-12 GB sin técnicas adicionales.
- Opciones de despliegue: transformers (librería declarada) y vLLM (según la model card); no se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3.6-35B-A3B 2,10-bit experts) | 35B / 3B | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B / 3B | no disponible | BF16 | según licencia del modelo base | Hugging Face (modelo oficial) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor no ofrece garantías de calidad, evaluación ni soporte.
- Cuantización extrema a 2,10 bits en los expertos: es esperable una degradación notable de la calidad frente al modelo base en BF16, especialmente en tareas que dependen de conocimiento factual y razonamiento fino; no hay benchmarks que la cuantifiquen.
- Licencia no especificada: el autor remite a la licencia del modelo base, pero no se indica cuál es, lo que impide confirmar si se permite uso comercial.
- Idiomas no declarados: no se puede garantizar el comportamiento multilingüe.
- Riesgo de alucinación: no evaluado en este checkpoint; la compresión de expertos puede incrementarlo.
- Contexto máximo no documentado: no se conoce la ventana efectiva ni el impacto de la cuantización en contextos largos.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación de terceros.
- Uso en producción desaconsejado sin una evaluación propia exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-genans-lowbit-fp8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
