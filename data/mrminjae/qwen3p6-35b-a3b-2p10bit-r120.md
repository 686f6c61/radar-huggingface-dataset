# mrminjae/qwen3p6-35b-a3b-2p10bit-r120

## Resumen

`mrminjae/qwen3p6-35b-a3b-2p10bit-r120` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo Mixture-of-Experts (MoE) de la familia Qwen 3.6. El autor, `mrminjae`, ha aplicado una cuantización selectiva: los expertos enrutados se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) se mantienen en BF16. Los pesos se guardan de forma desnormalizada en tensores BF16, de modo que el modelo carga con `transformers` y vLLM estándar sin kernels personalizados.

El problema que aborda es el coste de memoria de un MoE de gran tamaño: al reducir drásticamente el peso de los expertos, el checkpoint ocupa 91,7 GB en el repositorio, lo que permite servirlo en hardware más modesto que el modelo base completo. Es relevante para quienes quieren experimentar con Qwen 3.6-35B-A3B en entornos con VRAM limitada, aunque se trata de un checkpoint interno de investigación (ID `r120`) sin garantías de calidad ni documentación de evaluación.

El repositorio declara 45.844.600.176 parámetros totales según safetensors, un dato que conviene contrastar con el nombre del modelo (35B-A3B), ya que la discrepancia puede deberse a los tensores de expertos almacenados en BF16 o a un recuento que incluye buffers. No hay información publicada sobre benchmarks, idiomas soportados ni términos de licencia más allá de la remisión a la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, clase `qwen3_5_moe` en transformers |
| Parametros totales | 45.844.600.176 (según safetensors); nombre comercial 35B-A3B |
| Parametros activos | no disponible (el nombre sugiere ~3B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; almacenamiento desnormalizado en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (BF16 desnormalizado), compatible con `transformers` y vLLM |

## Arquitectura y entrenamiento

El modelo es un MoE de la familia Qwen 3.6 con enrutamiento por expertos. La intervención del autor no es un entrenamiento nuevo, sino una cuantización post-hoc: los expertos enrutados se comprimen a una media de 2,10 bits y el resto de componentes (atención, embeddings, router, capas densas) permanece en BF16. Los pesos se desnormalizan y se guardan en tensores BF16, de modo que la inferencia no requiere kernels de cuantización específicos y funciona con `transformers` y vLLM estándar.

No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se detalla el método exacto de cuantización (por ejemplo, GPTQ, AWQ o quantización de bloques con escalas por grupo) ni el error de reconstrucción introducido. El identificador `r120` sugiere una iteración interna de investigación, sin model card completa ni resultados de evaluación publicados.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Procesamiento de imagen y texto (`image-text-to-text`), lo que indica capacidades multimodales heredadas del modelo base.
- Razonamiento y matemáticas: presumiblemente heredadas de Qwen 3.6-35B-A3B, sin evaluación publicada en este checkpoint.
- Generación de código: capacidad esperable del modelo base, no verificada en esta cuantización.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: la etiqueta `image-text-to-text` sugiere visión; el resto no disponible.

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint permite medir la degradación de calidad al comprimir expertos a 2,10 bits frente al modelo base en BF16, comparando perplejidad y tareas downstream.
- Despliegue en hardware con VRAM limitada: al ocupar 91,7 GB y cargar con vLLM estándar, permite servir un MoE de gran tamaño en una sola GPU de 80 GB con cuantización adicional o en configuraciones multi-GPU más económicas que el modelo base.
- Prototipado de asistentes multimodales: la etiqueta `image-text-to-text` permite experimentar con entrada de imagen y texto en entornos de investigación sin infraestructura de gran escala.
- Evaluación de robustez de pipelines de inferencia: sirve para probar si `transformers` y vLLM cargan correctamente pesos desnormalizados en BF16 y si el rendimiento se mantiene estable en producción.
- Generación de texto conversacional en entornos controlados: útil para pruebas internas de chatbots donde la latencia y el coste de memoria son críticos.
- Estudio de sesgos y alucinación bajo cuantización agresiva: permite analizar si la compresión de expertos amplifica errores factuales o sesgos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 91,7 GB en safetensors BF16; en carga necesitará al menos esa cantidad más overhead de activaciones y KV cache, por lo que se recomienda 96 GB o más de VRAM.
- GPU recomendadas: H100 80 GB (posiblemente con cuantización adicional), A100 80 GB en configuración multi-GPU, o GPUs con 96 GB o más.
- Cabe en consumer GPU: no de forma directa; una RTX 4090 de 24 GB no es suficiente para cargar el checkpoint completo. Sería necesario aplicar cuantización adicional (GGUF, AWQ) o usar offloading a CPU.
- Opciones de despliegue: `transformers` y vLLM estándar, según el autor; llama.cpp u Ollama requerirían conversión a GGUF no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `mrminjae/qwen3p6-35b-a3b-2p10bit-r120` | 45.844.600.176 (safetensors) | no disponible | no disponible | Hugging Face, 0 descargas |
| `Qwen/Qwen3.6-35B-A3B` (base) | ~35B totales, ~3B activos (según nombre) | no disponible | no disponible | Hugging Face |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables evaluados en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Checkpoint de investigación interna (`r120`) sin model card completa, sin evaluación y con 0 descargas; no apto para producción sin validación previa.
- La cuantización a 2,10 bits de media en expertos puede degradar la calidad, la coherencia y la precisión factual; no hay métricas publicadas que cuantifiquen esa pérdida.
- Riesgo de alucinación heredado del modelo base y potencialmente amplificado por la compresión.
- Licencia no disponible: el autor remite a la del modelo base, pero no se especifican términos de uso comercial; verificar antes de cualquier despliegue.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe.
- Longitud de contexto no disponible; no se debe asumir la del modelo base sin confirmación.
- El recuento de parámetros (45,8B) no coincide con el nombre comercial (35B-A3B), lo que puede deberse al almacenamiento desnormalizado en BF16; conviene verificar la huella real en memoria.
- Requiere hardware de gama alta (96 GB o más de VRAM) para carga directa; no cabe en GPUs de consumo sin cuantización adicional.

## Enlaces

- [Hugging Face: mrminjae/qwen3p6-35b-a3b-2p10bit-r120](https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r120)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
