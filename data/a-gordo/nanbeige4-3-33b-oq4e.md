# a-gordo/Nanbeige4.3-33B-oQ4e

## Resumen

Nanbeige4.3-33B-oQ4e es una cuantización a 4 bits, en formato MLX, del modelo Nanbeige4.3-33B desarrollado por el equipo Nanbeige. La conversión ha sido realizada por el usuario de la comunidad a-gordo mediante la herramienta oMLX (versión 0.7.0) de jundot, y está pensada para su ejecución en hardware Apple Silicon (Mac con chips M1/M2/M3/M4). El modelo base es un modelo de generación de texto conversacional con unos 33.100 millones de parámetros, licenciado bajo Apache-2.0, que soporta inglés y chino.

La relevancia de esta ficha radica en que permite ejecutar un modelo denso de 33B en equipos Mac con una huella de memoria razonable (unos 19,5 GB de pesos), algo inviable en BF16, que requeriría más de 66 GB. La cuantización oQ4e emplea ponderación por matriz de importancia (imatrix) en las 364 proyecciones del transformer, con precisión aumentada en módulos seleccionados, lo que busca minimizar la pérdida de calidad frente al modelo original. No se trata de una publicación oficial de Nanbeige ni de jundot, sino de una conversión comunitaria validada únicamente con una prueba local de carga y generación breve.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder-only) |
| Parámetros totales | 33.118.977.024 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ4e (afín, group size 64, imatrix mejorada; también existen oQ6e y oQ8e del mismo autor) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 4 shards, 19,458 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base está etiquetada como `llama` en HuggingFace, lo que indica un transformer decoder-only compatible con el ecosistema LLaMA. No se dispone de información pública en la ficha sobre el número de capas, cabezas de atención, dimensiones ocultas ni sobre el proceso de preentrenamiento del modelo original Nanbeige4.3-33B (tokens de entrenamiento, composición del corpus, RLHF/DPO), por lo que estos datos no están disponibles.

En cuanto a la cuantización, se han publicado detalles precisos: la conversión se realizó directamente desde los pesos BF16 originales (no desde cuantizaciones intermedias oQ8e u oQ6e), usando el método oQ4e de oMLX en modo afín con group size 64. Se aplicó calibración con el dataset `oqe_code_multilingual` (128 muestras de 512 tokens) y se reutilizó la caché de imatrix recogida para la variante oQ8e, ponderando las 364 entradas de proyección del transformer; el `lm_head` no recibió ponderación imatrix. Algunos módulos seleccionados usan precisión superior, según se detalla en el `config.json`. Se conservan el tokenizador y la plantilla de chat originales.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Soporte bilingüe: inglés y chino.
- Compatible con cargadores MLX en Apple Silicon, como oMLX.
- Incluye el tokenizador y la plantilla de chat del modelo original.
- No consta en la información disponible soporte explícito de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistentes conversacionales bilingües en local: ejecutar un chatbot en inglés y chino en un Mac sin depender de la nube, aprovechando la plantilla de chat incluida y los ~19,5 GB de pesos.
- Pruebas y prototipado en Apple Silicon: cargar y evaluar el modelo con oMLX u otros loaders MLX en equipos M-series, útil para desarrolladores que quieren experimentar con un 33B sin GPU NVIDIA.
- Generación y asistencia de código: la calibración empleó el dataset `oqe_code_multilingual`, lo que sugiere especial atención a la preservación de capacidades de código tras la cuantización.
- Traducción y redacción entre inglés y chino: el soporte bilingüe del modelo base lo hace apto para tareas de redacción, resumen y traducción entre ambos idiomas.
- Evaluación de impacto de cuantización: comparar las salidas de oQ4e frente a oQ6e y oQ8e (mismo autor) para medir la degradación de calidad a 4 bits en casos de uso propios.
- Integración en aplicaciones locales de escritorio: su tamaño contenido en 4 bits permite embeberlo en apps de productividad que corran enteramente en el dispositivo, con privacidad de datos garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo pasó una prueba local de carga y generación breve de texto, y que no se realiza ninguna afirmación de equivalencia de calidad ni de rendimiento respecto al modelo original.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 19,458 GB; se recomienda al menos 24 GB de memoria unificada para dejar margen a KV cache y activaciones (con contexto largo, más).
- Hardware recomendado: Mac con Apple Silicon (M1 Ultra, M2 Max/Ultra, M3 Max, M4 Max) con 32 GB o más de memoria unificada. Un Mac de 24 GB podría funcionar con contextos cortos, con poco margen.
- No es adecuado para GPUs NVIDIA en este formato: los pesos MLX están pensados para el framework MLX de Apple. Para CUDA habría que usar el modelo base en Transformers u otra cuantización GGUF.
- Despliegue: oMLX (loader indicado en la model card) u otros loaders compatibles con MLX. No consta compatibilidad con vLLM, TGI, llama.cpp ni Ollama para estos pesos concretos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Contexto | Licencia |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-oQ4e | 33,1B | MLX/safetensors | oQ4e (4-bit afín, imatrix) | no disponible | Apache-2.0 |
| Nanbeige4.3-33B-oQ6e (mismo autor) | 33,1B | MLX/safetensors | oQ6e | no disponible | Apache-2.0 |
| Nanbeige4.3-33B-oQ8e (mismo autor) | 33,1B | MLX/safetensors | oQ8e | no disponible | Apache-2.0 |
| Nanbeige/Nanbeige4.3-33B (original) | 33,1B | BF16 Transformers | sin cuantizar | no disponible | Apache-2.0 |

En la categoría de modelos de ~33B cuantizados para Apple Silicon existen otras opciones comunitarias en MLX y GGUF, pero sin datos de rendimiento publicados para este modelo no es posible una comparación de calidad fundamentada.

## Limitaciones y advertencias

- Se trata de una conversión comunitaria, no oficial: ni Nanbeige ni jundot la han validado; solo se ha probado carga y generación breve.
- Sin benchmarks: no hay garantías de que la calidad a 4 bits sea equivalente al modelo BF16 original; puede haber degradación en razonamiento, código o chino.
- El `lm_head` no recibió ponderación imatrix, lo que puede afectar a la distribución de salida en algunos casos.
- Sesgos conocidos: no disponibles; hereda los del modelo base Nanbeige4.3-33B, sobre los que tampoco hay documentación en la información proporcionada.
- Riesgo de alucinación: inherente a cualquier LLM; no hay datos que permitan cuantificarlo para este modelo.
- Idiomas limitados a inglés y chino; no está indicado el rendimiento en castellano ni otros idiomas.
- Longitud de contexto no documentada en esta ficha, lo que dificulta planificar ventanas de conversación o RAG.
- Formato MLX restringe el despliegue a Apple Silicon; para servidores con GPU NVIDIA hay que recurrir al modelo base.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original en su model card.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/a-gordo/Nanbeige4.3-33B-oQ4e
- Modelo base original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Organización Nanbeige: https://huggingface.co/Nanbeige
- Variante oQ8e: https://huggingface.co/a-gordo/Nanbeige4.3-33B-oQ8e
- Variante oQ6e: https://huggingface.co/a-gordo/Nanbeige4.3-33B-oQ6e
- Repositorio oMLX (jundot): https://github.com/jundot/omlx
- Revisión fuente de la conversión: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/tree/c1093c501cc6460427c0ac634db7223d0450c0ee
