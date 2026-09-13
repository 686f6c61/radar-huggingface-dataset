# ProCreations/Agnes-3.0-Flash-FP8

## Resumen

Agnes-3.0-Flash-FP8 es una cuantización a FP8 E4M3 del checkpoint Agnes-3.0-Flash Preview, desarrollada por ProCreations a partir de los pesos originales en BF16 de Agnes-AI. Se trata de un modelo multimodal de 33.090.501.680 parámetros (unos 33,1 B) con pipeline `image-text-to-text`, pensado para reducir el coste de memoria de inferencia sin recurrir a calibración ni a datos: la conversión es "data-free" y puramente blockwise.

El checkpoint original soporta 262.144 tokens de contexto y emplea una arquitectura híbrida de atención, con 54 capas de atención recurrente y 18 capas de atención global (72 capas de atención en total), más un encoder de visión, embeddings, cabeza de salida y 15 tensores MTP retenidos en BF16. La cuantización afecta a 288 matrices (las MLP de los 72 decoders y las proyecciones de las 18 capas de atención global), mientras que el resto de componentes permanece en BF16.

Su relevancia es práctica: reduce el peso en disco de 66,18 GB (BF16) a 42,78 GB, un 35,4 % menos, con una comparación diagnóstica acotada frente a la variante NVFP4 del mismo autor (33/40 frente a 34/40 en 40 casos emparejados). Es un modelo orientado a despliegue con SGLang en GPUs profesionales, no a hardware de consumo, y su validación publicada es deliberadamente limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal: 54 capas de atención recurrente + 18 capas de atención global; encoder de visión, cabeza de salida, embeddings y normas; 15 tensores MTP (multi-token prediction) retenidos |
| Parametros totales | 33.090.501.680 (33,1 B) |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | 262.144 tokens en el checkpoint de origen; esta version FP8 no fue probada a ese limite (smoke test con 32K; retrieval validado hasta 60.052 tokens de prompt) |
| Tipos de cuantizacion | FP8 E4M3FN blockwise (288 matrices, bloques de peso 128x128, escalas FP32, activaciones FP8 dinamicas); capas recurrentes, visión, embeddings, cabeza y normas en BF16. Existe una version NVFP4 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 + BF16), con `custom_code` y loader propio para SGLang |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido: combina 54 capas de atención recurrente con 18 capas de atención global distribuidas en la pila, un patrón que busca reducir el coste de atención en contextos largos manteniendo capacidad de atención global. Cada decoder incorpora una MLP principal de 17.408 unidades de ancho y una rama FFN paralela de 2.048; en esta conversión ambas se concatenan en un ancho único de 19.456 siguiendo la misma estrategia del loader BF16 de SGLang. El modelo incluye encoder de visión y procesadores de imagen y vídeo, lo que habilita el pipeline `image-text-to-text`, y conserva 15 tensores MTP para decodificación especulativa (no probada).

No hay información sobre el entrenamiento del checkpoint original: no se detallan número de tokens, composición del dataset, ni si hubo RLHF o DPO. Lo que sí documenta el autor de la cuantización es el proceso de conversión: 288 matrices cuantizadas a FP8 E4M3FN con bloques de 128x128, escalas FP32 calculadas como el máximo absoluto del bloque dividido por 448, redondeo a par más cercano y escalas de activación dinámicas por token y grupo de 128 elementos. No se empleó entrenamiento, datos de calibración, forward passes de calibración, búsqueda de clipping ni optimización Hessiana. El checkpoint se construyó desde BF16, no desde NVFP4. Los 1.017 tensores no cuantizados (19.372.570.720 bytes) se verificaron por igualdad exacta de dtype y valor contra la fuente fijada, y el tokenizer, la plantilla de chat y los procesadores originales se conservan. La cuantización deja las 54 capas recurrentes en BF16, por lo que la mezcla de precisiones puede limitar la ganancia de throughput en esas capas.

## Capacidades

- Generación de texto conversacional y multimodal (`image-text-to-text`), con procesadores de imagen y vídeo incluidos en el repositorio.
- Razonamiento y conocimiento general: en la comparación diagnóstica acotada obtuvo 5/8 en MMLU-Pro.
- Matemáticas: 8/8 en GSM8K en la misma comparación diagnóstica.
- Generación de código: 7/8 en HumanEval+ con criterio de ejecución (el código generado en el smoke test se parseó, no se ejecutó).
- Tool calling / function calling: soportado según los tags del repositorio y validado parcialmente; en el smoke test el intercambio de herramienta de dos pasos falló la comprobación estricta de formato JSON, y en la comparación acotada obtuvo 6/8 frente a 7/8 de NVFP4.
- Flujos de agente: la comparación incluyó casos de "custom tool workflows" y recuperación en contexto largo, pero no se probaron tareas agénticas largas.
- Contexto largo y recuperación: retrieval superado con 60.052 tokens de prompt reales en ambos modelos comparados.
- Salida estructurada multilingüe: 4/4 en JSON multilingüe en la comparación acotada (idiomas concretos no disponibles).
- Document VQA: 1/2 en coincidencia exacta en la comparación acotada.
- Decodificación especulativa mediante los 15 tensores MTP: retenidos, pero no probados.
- No hay evidencia publicada de soporte de audio ni de modo "thinking" explícito.

## Casos de uso

- Asistentes multimodales sobre documentación larga: el checkpoint soporta 262.144 tokens de contexto y superó recuperación con más de 60.000 tokens de prompt reales, lo que permite indexar contratos, manuales o expedientes completos y responder preguntas con evidencia textual sin trocear el documento.
- Extracción de datos estructurados en pipelines ETL: el modelo genera JSON multilingüe de forma fiable en las pruebas acotadas (4/4), útil para convertir facturas, formularios o fichas de producto en estructuras consumibles por sistemas posteriores.
- Agentes con tool calling en producción, con cautela: soporta function calling y los casos de herramienta de la comparación acotada obtuvieron 6/8, pero el fallo de formato JSON en el smoke test indica que conviene imponer validación de esquema y reintentos antes de encadenar acciones irreversibles.
- Generación de código asistida en IDE o CI: 7/8 en HumanEval+ con criterio de ejecución en la muestra diagnóstica; puede integrarse en pipelines de revisión o generación de tests, siempre con ejecución en sandbox porque el código del smoke test no se ejecutó.
- Análisis de imágenes y vídeo en flujos de inspección: el encoder de visión y los procesadores de imagen y vídeo están incluidos; la tarea de reconocimiento de color de imagen pasó el smoke test, mientras que el procesamiento de vídeo no fue probado.
- Razonamiento y resolución de problemas cuantitativos: GSM8K 8/8 y MMLU-Pro 5/8 en la muestra acotada, adecuado para asistentes de estudio, cálculo de presupuestos o validación de informes numéricos donde la respuesta se pueda verificar.
- Sustitución del checkpoint BF16 para ahorrar memoria en despliegues existentes: los 42,78 GB frente a 66,18 GB permiten mantener el mismo modelo en GPUs de 80-96 GB con más margen para el KV cache y la concurrencia, aunque el KV cache no se cuantiza a nivel de checkpoint.
- Procesamiento batch de atención al cliente con contexto largo y adjuntos de imagen: combina conversación multi-turno, entrada de imagen y ventana de 262K tokens.

## Benchmarks y rendimiento

Los datos disponibles provienen de una comparación diagnóstica acotada de 40 casos emparejados por modelo, ejecutados una sola vez con los mismos prompts, tipo de GPU, runtime fijado y ajustes de generación. No son puntuaciones oficiales de benchmark ni garantizan calidad general.

| Diagnostico | FP8 | NVFP4 |
|---|---:|---:|
| GSM8K (matematicas) | 8/8 | 8/8 |
| MMLU-Pro (razonamiento/conocimiento) | 5/8 | 5/8 |
| HumanEval+ (codigo ejecutable) | 7/8 | 7/8 |
| Flujos de herramienta personalizados | 6/8 | 7/8 |
| JSON multilingue | 4/4 | 4/4 |
| DocumentVQA (coincidencia exacta) | 1/2 | 1/2 |
| Recuperacion en contexto largo | 2/2 | 2/2 |
| Total con puntuacion estricta | 33/40 | 34/40 |

Los dos modelos coincidieron en resultado en 39 de los 40 casos. La única diferencia fue de formato estricto: FP8 incluyó prosa explicativa alrededor de un JSON de inventario correcto, mientras que NVFP4 devolvió solo el bloque JSON; ambos proporcionaron los argumentos y datos correctos. El autor indica explícitamente que no hay evidencia de una ventaja general de calidad de FP8 en esta muestra. Además, no se publicaron resultados de benchmarks oficiales del checkpoint BF16 de origen.

En el smoke test inicial (6 casos, 5 superados) en una RTX PRO 6000 de 96 GB con SGLang, pasaron aritmética, JSON multilingüe, sintaxis de Python, reconocimiento de color de imagen y recuperación; falló el intercambio de herramienta simulado de dos pasos en la comprobación estricta de formato. La entrada de smoke más grande contenía 13.409 tokens de prompt. No se midieron latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: solo los pesos FP8 ocupan 42,78 GB, por lo que se necesitan al menos ~43 GB de VRAM sin contar buffers de runtime, KV cache ni concurrencia. Con contexto de 32K y margen operativo, lo razonable es apuntar a 80-96 GB.
- GPU recomendadas: RTX PRO 6000 de 96 GB (la única configuración validada por el autor), A100 80 GB, H100 80 GB, H200 141 GB. Las cifras de VRAM distintas de la RTX PRO 6000 son estimaciones a partir del tamano de pesos.
- GPU de consumo: no cabe en ninguna tarjeta de consumo de una sola unidad (RTX 4090 24 GB, RTX 5090 32 GB quedan muy por debajo de los 42,78 GB de pesos). Sería necesario repartir el modelo en varias GPUs o recurrir a la variante NVFP4 de 32,54 GB, que tampoco entra en una sola GPU de consumo.
- Opciones de despliegue: SGLang con la imagen fijada por el autor y el loader incluido (requiere `trust_remote_code` por el tag `custom_code`). No hay evidencia de soporte probado en vLLM, llama.cpp, Ollama o TGI; en concreto, llama.cpp y Ollama no pueden ejecutar FP8 E4M3 blockwise de este tipo de forma nativa.
- Latencia y throughput: no disponible. El autor advierte que el consumo de memoria en runtime depende del contexto y de la concurrencia.

## Comparativa con modelos similares

Solo se dispone de datos comparables para las otras dos variantes del mismo checkpoint. No se han identificado en la informacion proporcionada modelos de terceros con arquitectura, tamano y modalidad equivalentes.

| Modelo | Parametros | Peso en disco | Contexto | Diagnostico acotado | Precision | Licencia |
|---|---|---:|---|---:|---|---|
| Agnes-3.0-Flash-FP8 | 33,1 B | 42,78 GB | 262.144 | 33/40 | FP8 E4M3 blockwise | Apache 2.0 |
| Agnes-3.0-Flash-NVFP4 | 33,1 B | 32,54 GB | 262.144 (no verificado en esa variante) | 34/40 | NVFP4 | no disponible |
| Agnes-3.0-Flash (BF16 original) | 33,1 B | 66,18 GB | 262.144 | no disponible | BF16 | no disponible |

La comparativa frente a modelos de terceros de ~33 B multimodales queda como no disponible: no se han aportado resultados ni especificaciones de alternativas externas.

## Limitaciones y advertencias

- Son pesos "Preview", distintos del modelo de produccion o de API mas reciente de Agnes; los resultados y el contexto de 1M tokens de ese modelo no describen a este checkpoint.
- La comparacion FP8 frente a NVFP4 es una muestra diagnostica de 40 casos, no una garantia de calidad ni una puntuacion oficial de benchmark. BF16 no se volvio a evaluar.
- La validacion publicada es minima: 6 casos de smoke test, de los que 5 pasaron. No se probaron tareas agenticas largas, el contexto completo de 262K, video ni decodificacion especulativa.
- El unico fallo del smoke test fue de formato JSON estricto en un intercambio de herramienta de dos pasos, y el autor afirma explicitamente que la retencion de calidad en flujos de herramienta no queda establecida. No debe asumirse fiabilidad de tool calling sin validacion de esquema propia.
- No se uso calibracion ni datos en la cuantizacion (data-free). El informe de calidad incluye el error de reconstruccion por matriz, pero el propio autor advierte que el error de pesos no es una medida de calidad de tarea.
- La cuantizacion deja las 54 capas de atencion recurrente, el encoder de vision, los embeddings, la cabeza de salida y las normas en BF16, por lo que el ahorro de memoria es real pero la aceleracion puede ser menor en esas rutas.
- El KV cache no se cuantiza a nivel de checkpoint, de modo que los requisitos de memoria crecen con el contexto y la concurrencia.
- Los dos tensores MTP se conservan, pero la decodificacion especulativa no se probo.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni idiomas soportados; la evaluacion multilingue se limita a JSON en idiomas no especificados.
- Riesgo de alucinacion: no evaluado en la documentacion disponible. El unico dato relacionado es el 1/2 en DocumentVQA con coincidencia exacta.
- La licencia es Apache 2.0, lo que en principio permite uso comercial, pero la licencia del checkpoint base de Agnes-AI no se detalla en la informacion proporcionada y conviene verificarla antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 1 "like", por lo que no existe validacion independiente de la comunidad.
- El despliegue requiere `trust_remote_code` y el loader propio (tag `custom_code`), lo que implica ejecutar codigo del autor y limita la portabilidad a otros motores de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/Agnes-3.0-Flash-FP8
- Version NVFP4 del mismo autor: https://huggingface.co/ProCreations/Agnes-3.0-Flash-NVFP4
- Checkpoint base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Comparacion completa FP8 frente a NVFP4 (ajustes, limitaciones y respuestas en bruto): https://huggingface.co/ProCreations/Agnes-3.0-Flash-FP8/blob/main/comparisons/fp8-vs-nvfp4/comparison.md
- Informe de calidad con error de reconstruccion por matriz: `quality_report.json` en el repositorio
- Informe de smoke test con salidas, ajustes y comandos: `smoke_report.json` en el repositorio
- Papers, blogs, repositorios o demos adicionales: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.
