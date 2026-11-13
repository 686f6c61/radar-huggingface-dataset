# mrminjae/qwen3p6-35b-a3b-2p10bit-r135

## Resumen

`mrminjae/qwen3p6-35b-a3b-2p10bit-r135` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 35.107.181.936 parámetros totales. Lo publica el usuario `mrminjae` en Hugging Face y su rasgo distintivo es una cuantización selectiva: únicamente los expertos enrutados se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanece en BF16. El resultado se guarda de forma descomprimida en tensores BF16, de modo que se carga con `transformers` o vLLM estándar sin kernels de cuantización especiales.

El modelo hereda la etiqueta `qwen3_5_moe` y la capacidad `image-text-to-text` del modelo base, lo que indica que se trata de un MoE multimodal con entrada de imagen y texto. Su interés práctico está en la reducción de huella de memoria (70,2 GB de repositorio frente a lo que ocuparía el mismo modelo en BF16 completo) manteniendo compatibilidad con el ecosistema Hugging Face. Es un artefacto claramente experimental: cero descargas, cero likes, licencia no declarada explícitamente y sin benchmarks publicados.

Al ser un checkpoint interno sin model card detallada, faltan datos clave como composición del dataset, número de tokens de entrenamiento, idiomas soportados y resultados de evaluación. Esta ficha refleja exclusivamente la información disponible en Hugging Face y en la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal, tipo `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion selectiva a 2,10 bits medios en expertos enrutados; resto de pesos en BF16; pesos almacenados descomprimidos en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base, no especificada en la informacion proporcionada) |
| Formato de pesos | safetensors (BF16 descomprimido) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.6-35B-A3B` es un Mixture-of-Experts de la familia Qwen 3.6, con 35.107 millones de parámetros totales y etiqueta de arquitectura `qwen3_5_moe`. La nomenclatura "A3B" del modelo base sugiere del orden de 3 mil millones de parámetros activos por token, aunque este dato no se confirma en la información proporcionada. El checkpoint es multimodal (`image-text-to-text`), por lo que incorpora un codificador visual junto al tronco de lenguaje.

La innovación técnica del checkpoint `r135` no está en el entrenamiento sino en la compresión: los expertos enrutados se cuantizan a una media de 2,10 bits, mientras que el resto de los pesos se conserva en BF16. Los pesos se publican ya descomprimidos en tensores BF16, de forma que no se requiere ningún runtime de cuantización especial para cargarlos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovación de decodificación o atención más allá de lo que aporte el modelo base.

## Capacidades

- Generación de texto conversacional y de formato largo, heredada del modelo base Qwen3.6.
- Entrada multimodal imagen-texto: la etiqueta `image-text-to-text` indica soporte de comprensión de imágenes junto a texto.
- Razonamiento multi-turno y conversacional (etiqueta `conversational`).
- Compatibilidad con endpoints de inferencia estándar (etiqueta `endpoints_compatible`).
- Carga directa con `transformers` y con vLLM en precisión BF16.
- Capacidades de tool calling, function calling, agentes o modo de razonamiento extendido: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de 35B en hardware con menos memoria: al almacenar los expertos a 2,10 bits medios y el resto en BF16, el checkpoint reduce la huella frente a una versión BF16 completa, lo que permite servirlo en GPUs de menor VRAM o con mayor margen para el KV cache.
- Investigación sobre cuantización extrema de MoE: sirve como referencia para estudiar el impacto de comprimir solo los expertos enrutados a ~2 bits manteniendo el resto en BF16, comparando calidad frente al modelo base.
- Prototipado de asistentes multimodales: la capacidad imagen-texto permite construir demos de descripción de imágenes, extracción de información de documentos escaneados o respuesta a preguntas sobre capturas, siempre en entornos de evaluación.
- Evaluación comparativa de checkpoints: útil en pipelines de investigación que comparan el modelo base con variantes cuantizadas sobre el mismo conjunto de prompts.
- Inferencia local con vLLM o `transformers`: al cargarse como BF16 estándar, se integra sin adaptadores en servidores de inferencia habituales, lo que simplifica pruebas de latencia y throughput.
- Experimentación académica con licencia pendiente de aclarar: adecuado para trabajos internos de laboratorio, no para producción comercial hasta confirmar la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 70,2 GB y los pesos se cargan descomprimidos en BF16, por lo que la inferencia requiere del orden de 70 GB solo para pesos, más el KV cache y las activaciones. Una GPU de 80 GB (A100 80GB, H100 80GB) es el mínimo razonable para una sola tarjeta.
- GPU recomendadas: A100 80GB o H100 80GB para una sola GPU; configuraciones multi-GPU (2×A100 40GB, 2×H100) para repartir pesos y aumentar el contexto disponible.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en el formato BF16 publicado. No se proporcionan variantes GGUF ni cuantizaciones adicionales que permitan reducirla.
- Opciones de despliegue: `transformers` y vLLM según la model card; otras alternativas (llama.cpp, Ollama, TGI) no están confirmadas para este checkpoint.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `mrminjae/qwen3p6-35b-a3b-2p10bit-r135` | 35,1B (MoE) | no disponible | no disponible | safetensors BF16 (expertos a 2,10 bits) | Checkpoint de investigación, 0 descargas |
| `Qwen/Qwen3.6-35B-A3B` (base) | 35,1B (MoE) | no disponible | no disponible | safetensors | Modelo original sin cuantización selectiva |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La cuantización a 2,10 bits de los expertos puede degradar la calidad frente al modelo base; no hay benchmarks publicados que cuantifiquen esa pérdida.
- Es un checkpoint de investigación interna ("internal research checkpoint") sin garantías de estabilidad ni de soporte.
- Licencia no declarada explícitamente: el autor remite a la del modelo base, que no se especifica en la información disponible. No se debe usar en producción comercial sin aclarar este punto.
- Riesgo de alucinación y sesgos: no documentados para este checkpoint; se heredan los del modelo base, no evaluados aquí.
- Idiomas soportados no disponibles, lo que impide garantizar calidad multilingüe.
- Longitud de contexto no disponible, factor crítico para planificar aplicaciones de contexto largo.
- Almacenamiento de 70,2 GB y carga en BF16: no apto para GPUs de consumo, lo que limita su uso a entornos con hardware de datacenter.
- Cero descargas y cero likes: sin validación comunitaria ni reportes de terceros sobre su funcionamiento real.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r135
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
