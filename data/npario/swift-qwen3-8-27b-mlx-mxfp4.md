# npario/Swift-Qwen3.8-27B-MLX-MXFP4

## Resumen

Swift-Qwen3.8-27B-MLX-MXFP4 es una cuantización del modelo multimodal ukisai/Swift-Qwen3.8-27b, un ajuste fino de tipo imagen-texto-a-texto construido sobre la base Qwen/Qwen3.8-27B. La publicación la redistribuye el usuario npario a partir del paquete generado con mlx_lm.convert (mlx-lm 0.31.3) en formato MXFP4, de 4 bits y con group size 32. El modelo declara 27.356.728.560 parámetros y el repositorio ocupa 15,2 GB en safetensors.

Se trata de una variante pensada exclusivamente para Apple silicon a través de la librería MLX. La torre de texto se cuantiza a 4 bits, mientras que la torre de visión y el proyector se conservan en BF16, de modo que la entrada visual mantiene precisión completa a cambio de un mayor peso relativo en memoria. La licencia es dual: Apache-2.0 para los pesos base de Qwen y Swift Open License v1.0 para la contribución de ajuste de UkisAI.

Su relevancia es práctica: permite ejecutar localmente un modelo multimodal de ~27B en equipos Mac con memoria unificada, sin depender de GPU NVIDIA ni de servicios en la nube. A cambio, no se han publicado métricas de perplejidad ni resultados de benchmarks, y la única validación declarada es una prueba de coherencia de 48 tokens en modo greedy.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + proyector + torre de texto); familia Qwen3.5 según la etiqueta `qwen3_5` |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se especifica si es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (4 bits, group size 32) en la torre de texto; torre de visión y proyector en BF16. La familia de cuantizaciones asociada publica además tiers de 2, 3, 4, 5, 6 y 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Dual: Apache-2.0 para los pesos base de Qwen + Swift Open License v1.0 para el ajuste de UkisAI |
| Formato de pesos | safetensors (formato nativo de MLX) |
| Biblioteca de inferencia | MLX mediante mlx-lm |
| Modelo base | ukisai/Swift-Qwen3.8-27b, revisión `048328f4059015b63f860a453bf94834af0db683` |

## Arquitectura y entrenamiento

La model card describe una arquitectura multimodal con tres bloques diferenciados: torre de texto, torre de visión y proyector. Solo la torre de texto se somete a cuantización; la torre de visión y el proyector permanecen en BF16. La familia declarada es Qwen3.5 y la base subyacente es Qwen/Qwen3.8-27B, sobre la que UkisAI aplicó un ajuste fino que da lugar a ukisai/Swift-Qwen3.8-27b. No se detalla si el modelo base emplea atención lineal, decodificación especulativa, mezcla de expertos ni ninguna otra innovación de atención.

El proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación) no se documenta en la información disponible. El único procedimiento técnico descrito en esta ficha es la cuantización posterior: `mlx_lm.convert` con mlx-lm 0.31.3, esquema mxfp4, 4 bits y group size 32. Antes de la publicación se aplicó una puerta de coherencia determinista consistente en una generación greedy de 48 tokens cargada con `mlx_lm.load` y evaluada por vacuidad, bucles de repetición, texto multiescritura sin sentido y restos de tokens especiales; el veredicto fue `ok`.

## Capacidades

- Generación de texto conversacional: el repositorio declara la etiqueta `conversational`, por lo que está orientado a diálogo multi-turno.
- Comprensión de imágenes: el pipeline es `image-text-to-text` y la torre de visión junto con el proyector se conservan en BF16, lo que preserva la calidad de la codificación visual.
- Inferencia local en Apple silicon: el paquete está en formato MLX y se carga con `mlx_lm.load`.
- Soporte de tool calling o function calling: no documentado en la información disponible.
- Modo de razonamiento explícito (thinking) o generación de cadenas de pensamiento: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el campo de idiomas no está disponible.
- Capacidades de audio o de vídeo: no documentadas.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno con entrada de imagen en equipos Apple silicon, evitando enviar datos a servicios externos. Es adecuado para entornos con requisitos de privacidad donde no se permite salida de datos.
- Descripción y preguntas sobre imágenes: gracias al pipeline imagen-texto-a-texto y a la torre de visión en BF16, se puede usar para generar descripciones detalladas de fotografías, capturas de pantalla o diagramas y responder preguntas sobre su contenido.
- Procesamiento de documentos escaneados: combinando texto e imagen, el modelo puede extraer y resumir información de facturas, informes o formularios digitalizados, siempre que el contexto de entrada sea suficiente (dato no disponible).
- Evaluación comparativa de cuantizaciones: al existir tiers de 2, 3, 4, 5, 6, 8 bits y MXFP4 en la misma familia, sirve para medir el compromiso entre calidad y consumo de memoria en Apple silicon.
- Prototipado e investigación sin GPU dedicada: es una opción para investigadores que solo disponen de hardware Mac y necesitan un modelo multimodal de ~27B para experimentos de prompting o evaluación cualitativa.
- Aplicaciones de escritorio con inferencia embebida: integrable mediante mlx-lm en aplicaciones nativas de macOS que requieran comprensión de imagen y texto sin conexión.
- Pruebas de pipelines multimodales en CI: permite validar el comportamiento de un flujo imagen-texto antes de desplegarlo en infraestructura mayor, dado el tamaño contenido del repositorio (15,2 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que solo se realizó una puerta de coherencia en el momento de la publicación y que las filas de perplejidad y benchmarks se añadirán "cuando se midan". Los registros por nivel se encuentran, según el autor, en el dataset majentik/garden-quant-bench.

| Evaluación | Resultado |
|---|---|
| Puerta de coherencia (48 tokens, greedy) | `ok` |
| Perplejidad | no disponible |
| MMLU, HumanEval, GSM8K u otros | no disponible |

## Requisitos de hardware

- Memoria estimada: el repositorio ocupa 15,2 GB. Los pesos de la torre de texto a 4 bits rondan los 13,7 GB, a los que se suma la torre de visión y el proyector en BF16. Se recomienda memoria unificada de 32 GB o superior para dejar margen a la caché KV y al contexto.
- GPU compatibles: no aplica. El formato MLX está diseñado para Apple silicon; no se ejecuta en CUDA ni en ROCm de forma nativa.
- Cabe en GPU de consumo: no en el sentido tradicional. Es viable en Mac con chip M1, M2, M3 o M4 y 32 GB de memoria unificada o más. Con 24 GB el margen es muy ajustado.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`, `mlx_lm.load`) y el servidor incluido en mlx-lm. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin reconversión previa del formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros para establecer una comparación de rendimiento. La comparación más fiable es dentro de la propia familia de cuantizaciones, donde cambia el esquema de bits pero no la base del modelo.

| Modelo | Cuantización | Parámetros | Formato | Licencia |
|---|---|---|---|---|
| npario/Swift-Qwen3.8-27B-MLX-MXFP4 (este) | MXFP4, 4 bits, group size 32 | 27.356.728.560 | safetensors MLX | Swift Open v1.0 + Apache-2.0 |
| majentik/Swift-Qwen3.8-27B-MLX-2bit | 2 bits | no disponible | safetensors MLX | Swift Open v1.0 + Apache-2.0 |
| majentik/Swift-Qwen3.8-27B-MLX-8bit | 8 bits | no disponible | safetensors MLX | Swift Open v1.0 + Apache-2.0 |
| ukisai/Swift-Qwen3.8-27b (sin cuantizar) | BF16 | no disponible | safetensors | Swift Open v1.0 + Apache-2.0 |

No se proporcionan datos de modelos comparables de otros fabricantes (por ejemplo, alternativas multimodales de tamaño similar) en la información disponible.

## Limitaciones y advertencias

- Compatibilidad restringida: solo funciona en Apple silicon mediante MLX. No es desplegable en GPU NVIDIA o AMD sin convertir los pesos a otro formato.
- Ausencia total de benchmarks: no hay perplejidad ni resultados en tareas estándar, por lo que no es posible cuantificar la degradación introducida por la cuantización de 4 bits frente al modelo en BF16.
- Validación mínima: la puerta de coherencia se limita a una generación greedy de 48 tokens, un test muy poco representativo del comportamiento en producción.
- Idiomas y contexto sin documentar: se desconoce la longitud de contexto soportada y la cobertura idiomática, lo que impide planificar despliegues que dependan de ventanas largas o de idiomas concretos.
- Restricción de licencia comercial: la Swift Open License v1.0 permite uso comercial gratuito solo a organizaciones con facturación bruta anual igual o inferior a 1 millón de USD. Por encima de ese umbral se requiere una Swift Enterprise License de UkisAI. Es imprescindible revisar los tres ficheros de licencia incluidos (`LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE`).
- Riesgo de alucinación: no cuantificado ni documentado; como en cualquier modelo generativo, existe y no hay métricas de fiabilidad publicadas.
- Sesgos conocidos: no documentados.
- Escasa validación comunitaria: el repositorio registra 0 descargas y 0 likes, lo que implica ausencia de retroalimentación de terceros sobre su comportamiento real.
- Discrepancia de procedencia: la model card apunta a rutas del espacio de nombres `majentik/...` (incluido el comando de ejemplo y la tabla de tiers) mientras el repositorio se publica bajo `npario`, lo que sugiere una redistribución. Conviene verificar la integridad de los pesos antes de usarlos.
- Fecha de publicación anómala: el campo de creación indica 2026-09-24, posterior a la fecha habitual de catalogación; conviene comprobar la vigencia del paquete.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/npario/Swift-Qwen3.8-27B-MLX-MXFP4
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- mlx-lm (biblioteca de inferencia): https://github.com/ml-explore/mlx-lm
- Dataset de seguimiento de cuantizaciones: https://huggingface.co/datasets/majentik/garden-quant-bench
- Tier de 2 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-2bit
- Tier de 3 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-3bit
- Tier de 4 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-4bit
- Tier de 5 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-5bit
- Tier de 6 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-6bit
- Tier de 8 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-8bit
- Tier MXFP4 equivalente: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-MXFP4
