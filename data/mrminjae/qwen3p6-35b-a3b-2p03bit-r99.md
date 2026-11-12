# mrminjae/qwen3p6-35b-a3b-2p03bit-r99

## Resumen

Qwen3.6-35B-A3B (r99) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, consistente en una versión cuantizada a 2,03 bits de media de los expertos enrutados del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una variante experimental que aplica cuantización extrema únicamente a los pesos de los expertos enrutados de una arquitectura Mixture-of-Experts (MoE), manteniendo el resto de pesos en BF16. El modelo conserva el pipeline de text-generation y la capacidad image-text-to-text heredada del modelo base.

El interés técnico reside en la agresividad de la compresión: 2,03 bits por peso en los expertos enrutados es un régimen muy por debajo de las cuantizaciones habituales de 4 u 8 bits, lo que permite reducir drásticamente el tamaño del repositorio (70,2 GB) frente a un BF16 completo. Sin embargo, los pesos se almacenan de forma desquantizada en tensores BF16, de modo que la reducción de precisión se aplica en el proceso de cuantización pero no se traduce en un ahorro de memoria en tiempo de inferencia con transformers o vLLM estándar.

El modelo tiene 35.107.181.936 parámetros totales según los safetensors del repositorio y está etiquetado como compatible con endpoints. Es un checkpoint de investigación interna, sin descargas ni likes en el momento de la consulta, creado el 12 de noviembre de 2026. No se dispone de información sobre la licencia, los idiomas soportados ni los datos de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe), transformer con expertos enrutados |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,03 bits de media; resto de pesos en BF16; pesos almacenados desquantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (BF16 desquantizado) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.6-35B-A3B, una arquitectura Mixture-of-Experts identificada en los tags como `qwen3_5_moe`. La modificación introducida por mrminjae consiste en cuantizar los expertos enrutados a una media de 2,03 bits, mientras que todos los demás pesos (atención, embeddings, capas densas, router, etc.) permanecen en BF16. Los pesos resultantes se almacenan desquantizados en tensores BF16, de forma que cargan con transformers estándar y con vLLM sin necesidad de kernels de cuantización específicos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base pasó por RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla la técnica exacta de cuantización empleada (por ejemplo, GPTQ, AWQ, bitsandbytes o un esquema propio) más allá de la media de 2,03 bits declarada. El identificador interno "r99" sugiere un checkpoint de una serie de experimentos de investigación, sin documentación pública asociada.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.6-35B-A3B.
- Procesamiento image-text-to-text, según el tag del repositorio, lo que implica capacidades multimodales de entrada imagen y texto.
- Generación de texto en pipeline `text-generation` con transformers.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio ni capacidades multilingües específicas en la información proporcionada.

## Casos de uso

- Investigación en cuantización extrema: el modelo sirve como banco de pruebas para estudiar el impacto de cuantizar expertos enrutados a 2,03 bits sobre la calidad de generación, comparando contra el modelo base en BF16.
- Evaluación de robustez de arquitecturas MoE: permite analizar cómo se degrada el enrutamiento y la especialización de expertos bajo compresión agresiva, un aspecto poco documentado en la literatura.
- Experimentos de multimodalidad comprimida: al conservar el pipeline image-text-to-text, se puede evaluar si la cuantización de expertos afecta a la alineación visión-lenguaje en tareas de descripción de imágenes o VQA.
- Reproducción de pipelines con transformers: al cargar con transformers estándar, se integra sin cambios en scripts existentes para comparar checkpoints cuantizados frente al base.
- Despliegue experimental con vLLM: la model card indica compatibilidad con vLLM, lo que permite medir latencia y throughput en servidores de inferencia sin kernels personalizados.
- Estudio de la relación entre bits por peso y tamaño de repositorio: con 70,2 GB de repo, sirve para analizar el equilibrio entre compresión en almacenamiento y requisitos de memoria en inferencia cuando los pesos se desquantizan a BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos desquantizados en BF16, la huella en memoria se aproxima a la de un modelo de 35,1 mil millones de parámetros en BF16, es decir, del orden de 70 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño de pesos en BF16, se requerirían GPUs de clase数据中心 (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- ¿Cabe en GPU consumer?: no disponible; con pesos BF16 de ~70 GB no cabría en una RTX 4090 (24 GB) sin técnicas adicionales de offloading o cuantización en tiempo de carga.
- Opciones de despliegue: transformers (librería declarada) y vLLM (mencionado en la model card como compatible).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p03bit-r99 | 35.107.181.936 | no disponible | Expertos enrutados a 2,03 bits; resto BF16 | no disponible (sigue la del base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible en esta ficha | no disponible | BF16 original | no disponible en esta ficha | Hugging Face (modelo base referenciado) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Checkpoint de investigación interna ("internal research checkpoint"): no está pensado como versión de producción ni cuenta con validación pública.
- Cuantización extrema a 2,03 bits en expertos enrutados: es esperable una degradación de calidad frente al modelo base, aunque no se aportan métricas que la cuantifiquen.
- Los pesos se almacenan desquantizados en BF16, por lo que no se obtiene ahorro de VRAM en inferencia estándar pese al régimen de 2,03 bits declarado; el ahorro se limita al tamaño del repositorio.
- Licencia no disponible de forma explícita: la model card remite a la licencia del modelo base, que debe consultarse antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe concreto.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada; al derivar de un modelo base no especificado en detalle, hereda los riesgos de este.
- Sin descargas ni likes en el momento de la consulta: ausencia de validación por parte de la comunidad.
- Fecha de creación en 2026 y ausencia de paper o blog asociado: no hay documentación técnica publicada sobre el proceso de cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p03bit-r99
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
