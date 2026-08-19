# HarimxChoi/WarpQuant-Qwen3.5-4B-R16E4V4

## Resumen

WarpQuant-Qwen3.5-4B-R16E4V4 es una versión cuantizada del modelo multimodal Qwen3.5-4B, desarrollada por HarimxChoi mediante la técnica de cuantización post-entrenamiento WarpQuant. Esta técnica combina una rotación de Hadamard con signo, block-GPTQ y recuperación de columnas débiles basada en sensibilidad Output-Fisher, logrando una tasa equivalente de 3,6912 bits por peso (bpw) en todo el modelo. El resultado es un modelo de visión y lenguaje (image-text-to-text) que mantiene un rendimiento razonable en tareas de texto y gráficos, con un tamaño de repositorio de 9,1 GB y 4.539.265.536 parámetros.

La relevancia de este modelo radica en su capacidad para ejecutar un VLM de 4B parámetros en hardware con recursos limitados, gracias a la agresiva cuantización que reduce el peso efectivo a menos de 4 bpw. Está diseñado para cargarse directamente con Transformers en formato safetensors, sin necesidad de pasos adicionales de descompresión. Aunque el modelo base Qwen3.5-4B no está disponible públicamente en su forma original, esta variante cuantizada ofrece una alternativa práctica para entornos de producción con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), basada en Qwen3.5-4B |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT3 (proyecciones de texto), INT4 (token embedding y pesos de vision), BF16 (columnas recuperadas) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores BF16-compatibles) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del Qwen3.5-4B, un transformer multimodal que procesa tanto imágenes como texto. La técnica WarpQuant aplica una rotación de Hadamard con signo a las proyecciones de texto, seguida de block-GPTQ con una base INT3 de 3,5 bpw. Las columnas consideradas débiles según la sensibilidad Output-Fisher se restauran en BF16, mientras que el token embedding y los pesos de visión se cuantizan con group-128 INT4. El resultado es un modelo con una tasa empaquetada equivalente de 3,6912 bpw, que conserva la estructura original del transformer y permite la carga directa con Transformers.

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La cuantización se realizó sobre pesos ya entrenados, sin ajuste fino adicional. La innovación principal es la combinación de Hadamard rotation y Output-Fisher para mitigar la pérdida de calidad en cuantizaciones extremas, lo que permite mantener un rendimiento aceptable en tareas de razonamiento y comprensión visual.

## Capacidades

- Generación de texto y razonamiento: mantiene capacidades de lenguaje natural del modelo base, con resultados en MMLU de 38,13 y ARC-Challenge de 46,15.
- Comprensión de imágenes: al ser un modelo image-text-to-text, puede procesar imágenes y responder preguntas sobre ellas, como se refleja en ChartQA-128 (exact 44,53, relaxed 53,91).
- Conversación multilingüe: soporta inglés y coreano, según los idiomas declarados.
- Cuantización eficiente: permite inferencia con menor uso de memoria que el modelo original, adecuado para despliegue en entornos con recursos limitados.
- Compatibilidad con Transformers: carga directa mediante `AutoModelForImageTextToText` con `torch_dtype=torch.bfloat16`.
- No se mencionan capacidades de tool calling, agentes o modo de pensamiento explícito en la información disponible.

## Casos de uso

- Análisis de documentos con gráficos: el modelo puede interpretar imágenes de tablas y gráficos, como demuestra su rendimiento en ChartQA, permitiendo extraer datos de informes visuales en entornos con poca memoria.
- Asistencia visual para accesibilidad: descripción de imágenes en tiempo real en dispositivos con GPU de gama baja, gracias a la cuantización de 3,69 bpw.
- Chat multimodal en aplicaciones móviles: integración en asistentes que necesitan procesar fotos y texto, con soporte para inglés y coreano, en hardware de consumo.
- Clasificación de imágenes con contexto textual: uso en pipelines de moderación de contenido donde se requiere combinar visión y lenguaje, con requisitos de VRAM reducidos.
- Prototipado rápido de VLM: desarrollo de demos y pruebas de concepto en máquinas sin GPUs de alta gama, usando la carga directa con Transformers.
- Despliegue en edge computing: ejecución en dispositivos con 4-6 GB de VRAM, como Jetson o GPUs integradas, para tareas de visión por computador con lenguaje natural.

## Benchmarks y rendimiento

| Scope | Metrica | Resultado |
|---|---|---|
| Text backbone | WikiText-2 PPL ↓ | 9,2494 |
| Text backbone | ARC-Challenge (299) ↑ | 46,15 |
| Text backbone | MMLU (13.943) ↑ | 38,13 |
| Full VLM | ChartQA-128 exact ↑ | 44,53 |
| Full VLM | ChartQA-128 relaxed ↑ | 53,91 |

Estos resultados provienen de la model card del autor. No se han publicado comparaciones con otros modelos cuantizados en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 4,54B parámetros y 3,69 bpw, el peso del modelo ocupa aproximadamente 2,1 GB (4,54e9 × 3,69 / 8). Considerando overhead de activaciones y buffers, se estima un mínimo de 4-6 GB de VRAM para inferencia en BF16.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM, como RTX 2060, RTX 3060, o GPUs de datacenter como T4. Para mayor velocidad, se recomienda A100 o H100, aunque no son imprescindibles.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 6 GB o más, como RTX 3060 o RTX 4060.
- Opciones de despliegue: Transformers (carga directa con `device_map="auto"`), y potencialmente vLLM o TGI si se adapta el formato, aunque no se menciona explícitamente.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos cuantizados de la misma categoría (VLM de ~4B con cuantización extrema). Se puede considerar comparable a Qwen2.5-4B cuantizado con GPTQ o AWQ, pero no hay resultados publicados para esta comparación. La licencia Apache 2.0 y el formato safetensors facilitan su integración, pero la falta de benchmarks estandarizados limita la evaluación objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo base de Qwen, puede heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación: la cuantización agresiva (3,69 bpw) puede aumentar la probabilidad de respuestas inexactas, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: la longitud de contexto no está especificada; se recomienda verificar la documentación de Qwen3.5-4B para conocer el límite real.
- Restricciones de idioma: solo soporta inglés y coreano; no se garantiza un rendimiento adecuado en otros idiomas.
- Requisito de versión de Transformers: requiere la rama main de Transformers, lo que puede complicar el despliegue en entornos con versiones estables.
- Degradación de calidad: la cuantización extrema puede afectar tareas de visión de alta precisión, como el reconocimiento óptico de caracteres o la detección de objetos finos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/HarimxChoi/WarpQuant-Qwen3.5-4B-R16E4V4)
- [Informe tecnico](https://harimxchoi.github.io/projects/warpquant/)
- [Repositorio GitHub](https://github.com/HarimxChoi/WarpQuant)
- [Modelo solo texto](https://huggingface.co/HarimxChoi/WarpQuant-Qwen3.5-4B-R16E4-Text)
