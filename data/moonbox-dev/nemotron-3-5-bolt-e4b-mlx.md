# moonbox-dev/Nemotron-3.5-Bolt-E4B-MLX

## Resumen

Nemotron-3.5-Bolt-E4B-MLX es una compilación cuantizada en formato MLX del modelo NVIDIA Nemotron 3.5 Bolt E4B, publicada por el usuario moonbox-dev para su ejecución en Macs con Apple Silicon. El modelo base es un post-entrenamiento de NVIDIA sobre Gemma 4 E4B de Google, con capacidades multimodales de imagen a texto (pipeline `image-text-to-text`). Esta build no es un lanzamiento oficial de NVIDIA, sino una conversión de la versión BF16 original a precisiones de 8, 6 y 4 bits compatibles con la librería `mlx-vlm`.

El interés de esta ficha radica en que permite ejecutar un modelo multimodal de tamaño medio en hardware de consumo Apple Silicon, algo relevante para desarrolladores que trabajan en local sin acceso a GPUs NVIDIA. La build incluye pesos, `config.json`, tokenizer de NVIDIA, plantilla de chat y configuraciones de procesador, todo empaquetado como un modelo completo de `mlx-vlm`.

La información disponible es limitada: la model card se centra en los detalles de cuantización y fidelidad respecto al original, pero no documenta arquitectura interna, número de parámetros, longitud de contexto, idiomas ni benchmarks. Los datos que faltan se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: NVIDIA Nemotron 3.5 Bolt E4B, post-entrenamiento de Gemma 4 E4B) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, 6 bits, 4 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como `license: other` en Hugging Face) |
| Formato de pesos | safetensors (MLX), con tokenizer.json, config.json y processor_config.json |
| Tamano del repo | 22.6 GB |
| Tamano de pesos 8 bits | 4.69 GB + 4.19 GB (dos shards) + 159.1 MB (mtp) |
| Tamano de pesos 6 bits | 4.51 GB + 2.52 GB (dos shards) + 159.1 MB (mtp) |
| Tamano de pesos 4 bits | no disponible en el extracto |
| Fidelidad 8 bits vs BF16 | KL 0.0028 nats, top-1 98.6 % |
| Fidelidad 6 bits vs BF16 | KL 0.018 nats, top-1 96.3 % |
| Fidelidad 4 bits vs BF16 | KL 0.044 nats, top-1 94.4 % (4-bit plano: 0.35 nats, 84.4 %) |
| Libreria | mlx, mlx-vlm |
| Plataforma | Apple Silicon |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo base es NVIDIA Nemotron 3.5 Bolt E4B, descrito como un post-entrenamiento de NVIDIA sobre Google Gemma 4 E4B. El sufijo "E4B" sugiere una variante de eficiencia de la familia Gemma 4, pero no se confirma en la información disponible si se trata de un modelo denso, MoE o híbrido. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de esta build es el proceso de cuantización MLX con preservación de fidelidad medida. El autor reporta métricas de divergencia KL y coincidencia top-1 frente al modelo BF16 original: 8 bits alcanza KL 0.0028 nats y 98.6 % top-1; 6 bits, KL 0.018 nats y 96.3 %; 4 bits, KL 0.044 nats y 94.4 %. El 4-bit plano obtendría solo 84.4 % top-1, lo que indica que la build de 4 bits usa una técnica de cuantización mejorada (probablemente mixta o con corrección) no detallada en el extracto. La presencia de un subdirectorio `mtp` con pesos propios (159.1 MB) sugiere soporte de multi-token prediction o decodificación especulativa, aunque no se confirma su función exacta.

## Capacidades

- Generación de texto e inferencia multimodal de imagen a texto (pipeline `image-text-to-text`).
- Procesamiento de imágenes y texto combinados, gracias a `processor_config.json` incluido en cada build.
- Plantilla de chat incluida (`chat_template.jinja`), lo que permite uso conversacional multi-turno.
- Soporte de decodificación multi-token potencial vía el submódulo `mtp`, no confirmado en detalle.
- Capacidades de razonamiento, código y matemáticas: no documentadas en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes multimodales en Mac: la build de 8 bits (unos 9 GB en total entre shards y mtp) permite cargar un modelo de imagen a texto en un Mac con Apple Silicon y suficiente memoria unificada, usando `mlx-vlm` como runtime.
- Análisis de documentos con imágenes en entornos sin GPU NVIDIA: al ser un modelo `image-text-to-text`, puede emplearse para extraer información de capturas, diagramas o documentos escaneados en flujos de trabajo locales.
- Desarrollo y depuración de pipelines `mlx-vlm`: al incluir tokenizer, plantilla de chat y processor config completos, sirve como referencia para validar integraciones de la librería en Apple Silicon.
- Evaluación de impacto de cuantización: las métricas KL y top-1 publicadas permiten comparar el comportamiento de 8, 6 y 4 bits frente al BF16 en tareas propias, algo útil para decidir el nivel de precisión en producción.
- Investigación en eficiencia de inferencia: la build de 4 bits con 94.4 % top-1 (frente al 84.4 % del 4-bit plano) es un caso de estudio para técnicas de cuantización avanzada en modelos multimodales.
- Despliegue de demos interactivas en portátiles: con 6 bits (unos 7 GB) se puede ejecutar un chat multimodal en un MacBook con memoria unificada de 16 GB o más, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de fidelidad de cuantización frente al modelo BF16 original:

| Precision | KL (nats) | Top-1 coincidencia |
|---|---|---|
| 8 bits | 0.0028 | 98.6 % |
| 6 bits | 0.018 | 96.3 % |
| 4 bits | 0.044 | 94.4 % |
| 4 bits plano (referencia) | 0.35 | 84.4 % |

## Requisitos de hardware

- VRAM/memoria unificada estimada para 8 bits: aproximadamente 9 GB solo de pesos (4.69 + 4.19 + 0.16 GB), más overhead de activaciones y contexto; se recomienda un Mac con 16 GB o más de memoria unificada.
- Memoria estimada para 6 bits: aproximadamente 7.2 GB de pesos (4.51 + 2.52 + 0.16 GB); viable en Macs de 16 GB.
- Memoria estimada para 4 bits: no disponible en el extracto, pero previsiblemente inferior a la de 6 bits.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con CUDA ni con GPUs NVIDIA/AMD por el formato MLX.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada; no aplica a GPUs discretas convencionales.
- Opciones de despliegue: `mlx-vlm` (librería indicada), ecosistema MLX de Apple. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-MLX (esta build) | no disponible | no disponible | MLX safetensors (8/6/4 bits) | openmdw-1.1 | Apple Silicon |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | no disponible | no disponible | safetensors BF16 | openmdw-1.1 | GPU NVIDIA (CUDA) |
| Gemma 4 E4B (modelo origen) | no disponible | no disponible | safetensors | licencia de Google (no confirmada) | multiplataforma |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparativa se limita a formato, licencia y plataforma.

## Limitaciones y advertencias

- Esta build no es un lanzamiento oficial de NVIDIA; es una conversión de terceros (moonbox-dev) y su soporte y mantenimiento no están garantizados.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA, ROCm ni CPU convencional sin reconversión.
- La licencia openmdw-1.1 debe revisarse antes de uso comercial; la model card la etiqueta como `license: other`, lo que exige consultar los términos en openmdw.ai.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- La fidelidad de cuantización se midió con KL y top-1, pero no se especifica el conjunto de evaluación ni la tarea; los valores pueden no reflejar el comportamiento en dominios concretos.
- El 4-bit plano degrada notablemente (84.4 % top-1), por lo que no debe asumirse que cualquier cuantización de 4 bits mantenga la calidad de esta build.
- No hay información sobre longitud de contexto, idiomas soportados ni capacidades de tool calling, lo que limita la evaluación para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/Nemotron-3.5-Bolt-E4B-MLX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Paper referenciado en tags (arXiv:2509.04292): https://arxiv.org/abs/2509.04292
