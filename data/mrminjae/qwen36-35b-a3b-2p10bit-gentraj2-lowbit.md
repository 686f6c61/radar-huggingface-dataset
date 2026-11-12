# mrminjae/qwen36-35b-a3b-2p10bit-gentraj2-lowbit

## Resumen

`mrminjae/qwen36-35b-a3b-2p10bit-gentraj2-lowbit` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo de arquitectura MoE (Mixture of Experts) de la familia Qwen 3.6. El autor, `mrminjae`, ha aplicado una cuantización selectiva: únicamente los expertos enrutados (routed experts) se comprimen a una media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, expertos compartidos, etc.) permanece en BF16. Los pesos se almacenan de forma desquantizada en tensores BF16, de modo que cargan con `transformers` estándar y con vLLM sin necesidad de kernels especiales.

El modelo resuelve un problema de eficiencia de memoria: reducir drásticamente el peso de los expertos, que son la mayor parte de los parámetros en un MoE, manteniendo el resto de la red en precisión completa. El resultado es un repositorio de 14,7 GB, notablemente inferior al que ocuparía el modelo base en BF16. Es relevante para quienes quieren experimentar con compresión extrema de expertos en un MoE grande sin salir del ecosistema estándar de Hugging Face.

Se trata de un checkpoint interno de investigación, con 0 descargas y 0 likes en el momento de redactar esta ficha, y sin model card detallada más allá de la tabla de especificaciones de cuantización. No se han publicado datos de entrenamiento, benchmarks ni limitaciones específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) tipo transformer, familia Qwen 3.6; tag `qwen3_5_moe` |
| Parametros totales | 35B (según el nombre del modelo base, no confirmado en la model card) |
| Parametros activos | A3B (aproximadamente 3B activos, según el nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | Sigue la licencia del modelo base (no especificada en la model card) |
| Formato de pesos | Safetensors (carga con `transformers` y vLLM); repo de 14,7 GB |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Qwen 3.6 con 35B parámetros totales y aproximadamente 3B activos por token (denominación A3B). La innovación de este checkpoint no está en la arquitectura, sino en el esquema de cuantización: solo los expertos enrutados se comprimen a una media de 2,10 bits, mientras que el resto de la red (atención, embeddings, router, capas densas) se conserva en BF16. Los pesos se guardan ya desquantizados en BF16, lo que significa que el ahorro se produce en el almacenamiento y en la transferencia, no necesariamente en la VRAM en tiempo de inferencia una vez cargados.

No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre el proceso de cuantización (algoritmo, calibración, número de muestras). Tampoco se documenta si hubo RLHF, DPO u otras etapas de alineamiento. El identificador interno del checkpoint es `full_gentraj2_lowbit`, sin más detalles técnicos en la model card.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`).
- Procesamiento de imagen y texto (`image-text-to-text`), según los tags del repositorio, lo que sugiere capacidades multimodales heredadas del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: solo la multimodalidad imagen-texto está sugerida por los tags; el resto no está confirmado.

## Casos de uso

- Investigación en compresión de modelos MoE: el checkpoint permite estudiar el impacto de cuantizar únicamente los expertos enrutados a 2,10 bits mientras el resto de la red permanece en BF16, comparando calidad frente al modelo base.
- Despliegue en entornos con almacenamiento limitado: al ocupar 14,7 GB en lugar del tamaño completo en BF16, facilita la distribución y el almacenamiento en caché de modelos en clústeres con cuotas de disco ajustadas.
- Pruebas de compatibilidad con `transformers` y vLLM: al cargar con las herramientas estándar, sirve para validar pipelines de inferencia sin kernels personalizados.
- Evaluación de calidad tras cuantización extrema: útil para medir la degradación en tareas de generación de texto y razonamiento respecto al modelo base.
- Prototipado de aplicaciones multimodales imagen-texto: los tags indican soporte de image-text-to-text, lo que permite experimentar con entrada de imágenes y texto en un modelo MoE comprimido.
- Integración en endpoints compatibles: el tag `endpoints_compatible` sugiere su uso en servicios de inferencia gestionados para pruebas de latencia y throughput en escenarios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 14,7 GB en disco, pero al cargarse los pesos desquantizados en BF16, la VRAM necesaria en tiempo de ejecución puede ser considerablemente mayor; no se especifica la cifra.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; depende de la VRAM real tras la desquantización, que no se documenta.
- Opciones de despliegue: `transformers` estándar y vLLM, según la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrminjae/qwen36-35b-a3b-2p10bit-gentraj2-lowbit` | 35B totales / ~3B activos | no disponible | Expertos a 2,10 bits, resto BF16 | Sigue la del modelo base | Hugging Face, 0 descargas |
| `Qwen/Qwen3.6-35B-A3B` (base) | 35B totales / ~3B activos | no disponible | BF16 | No especificada | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otras alternativas de la misma categoría (mismo tamaño o misma tarea) más allá del modelo base.

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor lo describe como "internal research checkpoint", sin garantías de calidad ni de estabilidad para producción.
- Sin benchmarks publicados: no hay evidencia de la degradación de calidad respecto al modelo base tras la cuantización a 2,10 bits de los expertos.
- Licencia no especificada: la model card indica que sigue la licencia del modelo base, pero no se detalla cuál es; es necesario consultar el repositorio de `Qwen/Qwen3.6-35B-A3B` antes de cualquier uso comercial.
- Idiomas no documentados: no se indica qué lenguas soporta ni su calidad en cada una.
- Riesgo de alucinación: no evaluado en la información disponible; la cuantización extrema de expertos puede agravar este riesgo.
- Sesgos: no documentados.
- Contexto: no se especifica la longitud máxima de contexto soportada.
- Formato de pesos desquantizado en BF16: el ahorro de memoria en disco no se traduce necesariamente en ahorro de VRAM en inferencia, lo que puede limitar el despliegue en hardware de consumo.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin retroalimentación de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-gentraj2-lowbit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
