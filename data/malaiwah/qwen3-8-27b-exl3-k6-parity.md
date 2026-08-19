# malaiwah/Qwen3.8-27B-EXL3-K6-parity

## Resumen

`malaiwah/Qwen3.8-27B-EXL3-K6-parity` es una cuantización del modelo multimodal `Qwen/Qwen3.8-27B` desarrollada por el usuario `malaiwah` con la librería ExLlamaV3 (EXL3). El objetivo declarado de esta receta es alcanzar una paridad en bytes de archivo con la cuantización GGUF `Q6_K` del mismo modelo base, pero con una distribución de precisión mixta que asigna más bits a ciertos módulos (como las proyecciones de atención) y menos a otros, manteniendo una calidad medida por divergencia KL comparable. El modelo está diseñado para tareas de imagen-a-texto y conversación, y se distribuye bajo licencia Apache 2.0.

Aunque el nombre sugiere 27 mil millones de parámetros, el conteo real de parámetros según los safetensors es de 11.517.654.256 (aproximadamente 11,5 mil millones). El repositorio ocupa 23 GB e incluye, además del cuerpo del transformer, una torre de visión en BF16, un embedding en BF16 y un módulo de predicción multi-token (MTP). La cuantización utiliza precisión mixta con niveles K5 y K6, y está pensada para ser servida con vLLM.

La relevancia de este modelo radica en su propuesta técnica: demostrar que una cuantización EXL3 bien calibrada puede igualar el rendimiento de una GGUF de 6 bits con el mismo presupuesto de bytes, reduciendo el tamaño total del artefacto multimodal en aproximadamente 2 GB. Esto lo hace interesante para despliegues en entornos con restricciones de almacenamiento o memoria, sin renunciar a capacidades multimodales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención completa y lineal, y módulo de predicción multi-token (MTP); basado en Qwen/Qwen3.8-27B |
| Parametros totales | 11.517.654.256 (según safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 (ExLlamaV3) con precisión mixta: K5/K6 por módulo, 4-bit (según tags) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `Qwen/Qwen3.8-27B`, que es un transformer multimodal con atención completa (full attention) en algunas capas y atención lineal (linear attention) en otras, más una torre de visión y un módulo de predicción multi-token (MTP). La receta EXL3 aplica una asignación de bits por módulo: las proyecciones de atención (`q/k/v/o`) y las proyecciones `down_proj` de las MLP se mantienen en K6, mientras que `gate_proj` y `up_proj` se promueven de K5 a K6 en esta versión "parity". El embedding y la torre de visión se mantienen en BF16.

No se proporcionan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, si hubo RLHF o DPO), ya que esta ficha se centra en la cuantización. La innovación principal es la calibración y serialización EXL3 que busca igualar el rendimiento de GGUF `Q6_K` con el mismo número de bytes, usando una ley de asignación de bits por módulo que predice el error de cuantización en función de los bits asignados. El autor reporta métricas internas de divergencia KL que respaldan esta paridad.

## Capacidades

- Generación de texto y conversación multimodal: al estar basado en Qwen3.8-27B, soporta entrada de imágenes y texto, y genera texto como respuesta.
- Comprensión de imágenes: la torre de visión en BF16 permite procesar imágenes como entrada adicional al texto.
- Predicción multi-token (MTP): el módulo MTP incluido puede acelerar la decodificación al predecir varios tokens a la vez, aunque su uso depende del runtime.
- Atención lineal en parte de las capas: puede reducir el coste computacional en contextos largos, aunque no se especifica la longitud máxima de contexto soportada.
- No se documentan capacidades explícitas de tool calling, agentes o razonamiento multi-paso en la model card.

## Casos de uso

- Asistente virtual con entrada de imágenes: el modelo puede recibir una foto o captura y responder preguntas sobre su contenido, útil en soporte técnico o atención al cliente.
- Análisis de documentos escaneados: al combinar visión y lenguaje, puede extraer información de facturas, formularios o recibos, aunque requiere verificación humana.
- Generación de descripciones de imágenes para accesibilidad: puede producir texto alternativo automático para personas con discapacidad visual.
- Chat conversacional con contexto multimodal: permite mantener diálogos donde el usuario adjunta imágenes y hace preguntas de seguimiento, gracias a su naturaleza conversacional.
- Despliegue en entornos con recursos limitados: al ser una cuantización de 4 bits con tamaño de archivo reducido, puede ejecutarse en GPUs de consumo medio (p. ej., 24 GB de VRAM) usando vLLM o ExLlamaV3.
- Integración en pipelines de RAG multimodal: puede indexar y recuperar información de imágenes y texto, combinando embeddings visuales y textuales en un sistema de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas internas de divergencia KL frente a una referencia BF16, comparando esta cuantización con GGUF `Q6_K`:

| Metrica | Valor |
|---|---|
| Divergencia KL media (este build) | 0.001634 (95% CI [0.001541, 0.001742]) |
| Divergencia KL media (GGUF Q6_K) | 0.002035 |
| Divergencia KL neta (GGUF Q6_K, tras restar el suelo del motor) | ~0.001528 |
| Predicción pre-registrada | 0.001488 (intervalo [0.001175, 0.001601]) |

Estas cifras indican que, en el conjunto de validación del autor (512 contextos, 1.048.064 posiciones puntuadas), la calidad de esta cuantización es estadísticamente indistinguible de la de GGUF `Q6_K` cuando se tiene en cuenta el suelo de error del motor. No hay datos comparativos con otros modelos de la misma familia.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 23 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo en memoria. Con cuantización 4-bit, el cuerpo del transformer ocupa aproximadamente 17 GB (según la model card), más la torre de visión y el embedding en BF16.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 (40 GB), o superiores. En GPUs con 16 GB podría ser necesario usar offloading de CPU o una cuantización más agresiva.
- Compatibilidad con GPUs de consumo: sí, una RTX 4090 con 24 GB puede ejecutar el modelo sin problemas.
- Opciones de despliegue: vLLM (indicado en la librería), ExLlamaV3 (por el formato EXL3), y posiblemente llama.cpp si se convierte a GGUF (aunque el formato nativo es EXL3).
- Latencia y throughput: no se proporcionan datos medidos. Se espera que la atención lineal y el MTP reduzcan la latencia en contextos largos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | ~27B (no confirmado) | no disponible | Apache-2.0 | safetensors (BF16) | Modelo original sin cuantizar, requiere mucha más VRAM |
| malaiwah/Qwen3.8-27B-EXL3-K6-parity | 11.5B (según safetensors) | no disponible | Apache-2.0 | safetensors (EXL3) | Cuantización 4-bit con precisión mixta, multimodal |
| GGUF Q6_K (del mismo base) | ~27B (teórico) | no disponible | Apache-2.0 | GGUF | Cuantización estándar de 6 bits, requiere mmproj para visión |

La comparativa se basa en datos de la model card: esta cuantización es 2.05 GiB más pequeña que GGUF `Q6_K` más su `mmproj` (20.13 GiB frente a 22.18 GiB), y su calidad medida por KL divergence es equivalente. No hay comparaciones con otros modelos de la misma categoría (p. ej., Llama 3.2 Vision o Phi-3 Vision) porque no se dispone de datos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero al ser un modelo derivado de Qwen, puede heredar sesgos del entrenamiento original. La alucinación es posible, especialmente en tareas de razonamiento o generación de hechos.
- Pérdida de precisión por cuantización: aunque la KL divergence es baja, la cuantización 4-bit puede degradar ligeramente la calidad en tareas complejas comparada con el modelo en BF16.
- Longitud de contexto desconocida: no se especifica la ventana de contexto máxima, lo que limita su uso en aplicaciones que requieran manejar documentos largos.
- Idiomas no documentados: no se indica qué idiomas soporta, aunque Qwen suele ser multilingüe; esto debe verificarse empíricamente.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright.
- Adopción limitada: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido probado ampliamente por la comunidad.
- Dependencia del runtime EXL3: para aprovechar la cuantización es necesario usar ExLlamaV3 o vLLM con soporte EXL3, lo que puede limitar la portabilidad a otras plataformas.

## Enlaces

- HuggingFace: https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-K6-parity
- Repositorio de referencia (mencionado en la model card): https://github.com/malaiwah/qwen38-27b-exl3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
