# mikechambers84/Hy4-flash-W8A8

## Resumen
Hy4-flash-W8A8 es una compilación cuantizada del modelo multimodal `tencent/Hy4-flash` en BF16, publicada por el usuario `mikechambers84` en Hugging Face. Se trata de un modelo de lenguaje y visión de tipo Mixture-of-Experts (MoE) con 220.251.201.958 parámetros totales, de los cuales solo 12.000 millones están activos por token, y una ventana de contexto de hasta 1.000.000 de tokens. Acepta entradas de texto e imagen y genera texto, lo que lo sitúa en la categoría image-text-to-text.

La particularidad de esta ficha es su esquema de cuantización W8A8 aplicado exclusivamente a los expertos enrutados del MoE: las 62.976 matrices de 1536×1536 de las 41 capas MoE se almacenan en INT8 simétrico por canal de salida con escalas BF16, mientras que el resto de tensores (tablas Engram, atención MLA, torre de visión, drafter DFly2, expertos compartidos, embeddings y routers) se conservan en BF16 o FP32 sin modificar. El resultado es un repositorio de 292,2 GB frente a los 440,5 GB del checkpoint BF16 original, con una reducción de tamaño aproximada del 34 % y un error relativo de cuantización declarado del 0,81 % de media y 0,84 % máximo.

Su relevancia radica en que permite desplegar un modelo de 220B parámetros con contexto de un millón de tokens en infraestructuras con memoria limitada, manteniendo intactos los componentes sensibles a la precisión (tablas Engram, atención, drafter especulativo y torre de visión). La licencia es la Tencent Hy License, de tipo "other", lo que condiciona el uso comercial.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con backbone de 42 capas (1 capa densa + 41 capas MoE), atención MLA (12 capas sparse + 30 sliding-window), tablas Engram n-gram, hyper-connections y drafter DFly2 para decodificación especulativa |
| Parametros totales | 220.251.201.958 (220B, incluyendo 64B de parámetros Engram) |
| Parametros activos | 12B por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | W8A8 en expertos enrutados (INT8 simétrico por canal de salida, escalas BF16, activaciones INT8 dinámicas por token); resto de tensores en BF16/FP32 sin cuantizar; no se define cuantización de KV cache |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (license: other), enlace: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE |
| Formato de pesos | safetensors con formato compressed-tensors `int-quantized` (layout de llm-compressor para W8A8) |

## Arquitectura y entrenamiento
El backbone lingüístico consta de 42 capas: una capa densa de feed-forward seguida de 41 capas MoE con 512 expertos enrutados por capa y un conjunto de expertos compartidos. Cada experto enrutado contiene proyecciones gate, up y down de 1536×1536, lo que suma 62.976 matrices en total. La atención utiliza MLA (Multi-head Latent Attention) con 12 capas sparse y 30 capas de ventana deslizante, e incluye un indexador comprimido, sinks y puertas de salida. El modelo incorpora además tablas Engram n-gram en las capas 1, 11, 21 y 31, que aportan 64B de parámetros y se leen una fila por consulta, y un drafter DFly2 para decodificación especulativa. La torre de visión (`vit.*`) procesa las entradas de imagen.

Sobre el entrenamiento original no se proporcionan en la información disponible detalles como número de tokens, composición del dataset ni si hubo RLHF o DPO; la model card del checkpoint cuantizado remite a la card original de Tencent sin reproducir esos datos. La innovación técnica de esta compilación concreta es el esquema de cuantización: round-to-nearest sin datos de calibración (sin GPTQ ni SmoothQuant), con selección de escala por canal mediante un observador tipo MSE de llm-compressor que reduce el abs-max del canal entre un 0 % y un 19 % en pasos del 1 % y elige la escala con menor Σ|error|^2,4, deteniéndose tras 5 pasos sin mejora. Los expertos se almacenan fusionados en el origen (`gate_up_proj` de forma [512, 3072, 1536] y `down_proj` de [512, 1536, 1536]) y se separan por experto, con `gate_proj` como las primeras 1536 filas y `up_proj` como las segundas.

## Capacidades
- Generación de texto y razonamiento sobre entradas multimodales de texto e imagen (pipeline image-text-to-text).
- Procesamiento de imágenes mediante torre de visión integrada, conservada en BF16.
- Contexto extremadamente largo de hasta 1M tokens, adecuado para documentos extensos, repositorios de código o conversaciones multi-turno prolongadas.
- Modo instructivo y conversacional, según las etiquetas del repositorio.
- Decodificación especulativa mediante el drafter DFly2 incluido en el checkpoint, que acelera la generación.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con la librería transformers.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso
- Análisis de documentos largos con imágenes intercaladas: gracias a su ventana de 1M tokens y a la torre de visión, puede procesar informes, contratos o manuales completos con figuras y tablas en una sola pasada, sin necesidad de fragmentación.
- Asistencia sobre repositorios de código: el contexto de un millón de tokens permite cargar varios módulos o un monorepo pequeño y responder preguntas de arquitectura o generar parches coherentes con el resto del código.
- Atención al cliente multimodal: puede gestionar conversaciones multi-turno extensas y recibir capturas de pantalla o fotos de producto, manteniendo el historial completo dentro de la ventana de contexto.
- Extracción de información de documentos escaneados: combinando entrada de imagen y texto, resulta adecuado para digitalizar facturas, formularios o informes con estructura variable y devolver campos estructurados.
- Despliegue en infraestructura con memoria limitada: la cuantización W8A8 de los expertos reduce el peso de 440,5 GB a 292,2 GB, y las tablas Engram (118 GiB) pueden mantenerse en memoria host anclada en vLLM en lugar de en VRAM, lo que abarata el coste por instancia.
- Generación aumentada por recuperación (RAG) sobre corpus masivos: el contexto de 1M tokens permite inyectar muchos fragmentos recuperados sin truncar, reduciendo la pérdida de información en dominios como legal, financiero o científico.
- Evaluación e investigación de cuantización: al conservar en BF16 los componentes sensibles y cuantizar solo los expertos, sirve como banco de pruebas para medir el impacto de W8A8 en modelos MoE de gran escala.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint cuantizado únicamente reporta métricas de error de cuantización: error relativo ‖W − Ŵ‖ / ‖W‖ sobre todos los expertos con media del 0,81 % y máximo del 0,84 % por bloque de 64 expertos. No se incluyen resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint ocupa 292,2 GB en disco, de los cuales 138,6 GiB corresponden a expertos en INT8, 118,0 GiB a tablas Engram en BF16, 9,3 GiB a atención MLA, 1,6 GiB al drafter DFly2, 1,1 GiB a expertos compartidos, 0,9 GiB a la torre de visión y el resto a proyecciones, embeddings y routers. En vLLM, las tablas Engram pueden residir en memoria host anclada (unos 118 GiB de RAM) en lugar de en GPU, lo que reduce sustancialmente la VRAM necesaria.
- GPU recomendadas: no disponible en la información proporcionada; por el volumen de pesos, se requiere un nodo multi-GPU de clase数据中心 (A100/H100/H200) o equivalente. No se especifican modelos concretos.
- ¿Cabe en GPU consumer? No es viable en una única GPU consumer: incluso excluyendo las tablas Engram, los tensores restantes superan los 150 GiB.
- Opciones de despliegue: vLLM y SGLang se citan en la model card original como frameworks de inferencia; el formato compressed-tensors `int-quantized` es el que escribe llm-compressor. También existe una versión GGUF publicada por AngelSlim (`AngelSlim/Hy4-flash-GGUF`), aunque no se detalla si cubre esta cuantización W8A8.
- Latencia y throughput: no disponible en la información proporcionada. El drafter DFly2 está pensado para decodificación especulativa y debería mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares
| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-W8A8 (esta ficha) | 220B (64B Engram) | 12B | 1M tokens | Tencent Hy License | Hugging Face, cuantización W8A8 de la comunidad |
| tencent/Hy4-flash (BF16) | 220B (64B Engram) | 12B | 1M tokens | Tencent Hy License | Hugging Face, ModelScope, GitCode |
| Hy4-flash FP8 (Tencent) | 220B (64B Engram) | 12B | 1M tokens | Tencent Hy License | Publicado por Tencent con tablas Engram sin cuantizar |
| Hy4-flash-GGUF (AngelSlim) | 220B (64B Engram) | 12B | 1M tokens | Tencent Hy License | Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento comparado (benchmarks) entre estas variantes ni frente a modelos de otros fabricantes, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias
- La cuantización W8A8 sin calibración (round-to-nearest) puede degradar la calidad en tareas sensibles a la precisión numérica; el error relativo declarado es bajo (0,81 % medio), pero no se aportan evaluaciones de calidad downstream que lo confirmen.
- Las tablas Engram se mantienen en BF16 y suponen 118 GiB que, si no se ubican en memoria host, elevan mucho el requisito de VRAM.
- No se define cuantización de KV cache, lo que limita el ahorro de memoria en contextos de 1M tokens.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de gran escala.
- Idiomas soportados: no disponible, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas.
- Licencia Tencent Hy License: es una licencia "other" con condiciones específicas; debe revisarse el texto completo antes de cualquier uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado por un autor no oficial; conviene validar la integridad de los pesos frente al checkpoint original de Tencent.
- No se documentan capacidades de tool calling ni de agente, por lo que no deben asumirse en producción sin verificación previa.

## Enlaces
- Hugging Face (esta cuantización): https://huggingface.co/mikechambers84/Hy4-flash-W8A8
- Modelo original BF16: https://huggingface.co/tencent/Hy4-flash
- Model card en chino: https://huggingface.co/tencent/Hy4-flash/blob/main/README_CN.md
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
- Sitio oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- GGUF: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
