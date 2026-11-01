# a-gordo/Nanbeige4.3-33B-oQ8e

## Resumen

Nanbeige4.3-33B-oQ8e es una cuantización comunitaria, en formato MLX de 8 bits (nivel oQ8e), del modelo Nanbeige4.3-33B desarrollado por el Nanbeige Team. La conversión ha sido realizada por el usuario a-gordo mediante la herramienta oMLX de jundot (versión 0.7.0), a partir de los pesos BF16 originales sin cuantizaciones intermedias. El modelo base es un LLM de 33.118 millones de parámetros (dato real extraído de los safetensors) orientado a generación de texto conversacional en inglés y chino.

Esta ficha describe la versión cuantizada, no el modelo original. Su utilidad principal es permitir la ejecución del modelo en hardware Apple Silicon (Mac con chips M1/M2/M3/M4) mediante cargadores compatibles con MLX, reduciendo el consumo de memoria respecto a los pesos BF16: el repositorio ocupa 35,2 GB frente a los aproximadamente 66 GB que ocuparía la versión en precisión completa.

Es relevante para desarrolladores que trabajan en el ecosistema MLX y necesitan un modelo denso de 33B con licencia Apache-2.0, bilingüe inglés-chino, sin renunciar apenas a calidad gracias a la cuantización de 8 bits con ponderación por matriz de importancia (imatrix) en las 364 entradas de proyección del transformer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder-only, según tag `llama`) |
| Parámetros totales | 33.118.977.024 (~33,1B) |
| Parámetros activos | no disponible (no consta que sea MoE; se asume modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ8e (afín, group size 64, imatrix mejorada); existen variantes oQ6e y oQ4e del mismo autor |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 7 shards, 35,2 GB |

## Arquitectura y entrenamiento

La arquitectura base es de tipo LLaMA (transformer decoder-only), según las etiquetas del repositorio. El modelo cuantizado procede directamente de la revisión `c1093c501cc6460427c0ac634db7223d0450c0ee` de Nanbeige/Nanbeige4.3-33B en BF16. La cuantización usa el método oQ8e de oMLX: modo afín con group size 64 y ponderación imatrix mejorada, calibrada con el conjunto `oqe_code_multilingual` (128 muestras de 512 tokens). La imatrix se obtuvo del modelo fuente y cubrió las 364 entradas de proyección del transformer; el `lm_head` no tuvo entrada de imatrix. La misma caché de imatrix se reutilizó para las conversiones oQ6e y oQ4e.

Sobre el entrenamiento del modelo original (número de tokens, composición del dataset, RLHF/DPO) no se ha publicado información en los datos disponibles. Tampoco consta si el modelo base incluye modo de razonamiento extendido u otras innovaciones técnicas.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Soporte bilingüe inglés y chino.
- Incluye el tokenizador y la plantilla de chat originales del modelo base.
- Ejecución optimizada en Apple Silicon mediante MLX (cargadores como oMLX).
- No consta en la información disponible soporte de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Asistentes conversacionales bilingües inglés-chino: el modelo conserva el tokenizador y chat template originales, por lo que puede integrarse en chatbots que atiendan usuarios en ambos idiomas.
- Ejecución local en Mac con Apple Silicon: con 35,2 GB de pesos, cabe en Macs con 48 GB de memoria unificada (M2/M3/M4 Max o Ultra), permitiendo inferencia privada sin GPU de datacenter.
- Prototipado de aplicaciones LLM en el ecosistema MLX: la integración nativa con MLX facilita pruebas rápidas en Python sin depender de CUDA.
- Generación y asistencia de código: la calibración de la cuantización usó el dataset `oqe_code_multilingual`, lo que sugiere atención especial a la preservación de calidad en tareas de código multilingües.
- Comparación de niveles de cuantización: al existir variantes oQ8e, oQ6e y oQ4e del mismo autor con imatrix compartida, es útil para medir el compromiso entre memoria y calidad en hardware limitado.
- Procesamiento offline de documentos en chino: útil para resumir o traducir contenido chino en entornos donde no se desee enviar datos a APIs externas, aprovechando la licencia Apache-2.0 sin restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo pasó una prueba local de carga y generación breve de texto, pero que no se realiza ninguna afirmación de equivalencia de calidad respecto al modelo original.

## Requisitos de hardware

- VRAM/memoria estimada: 35,2 GB solo de pesos; con KV cache y sobrecargas, se recomienda al menos 40-48 GB de memoria unificada.
- Hardware recomendado: Mac con Apple Silicon y 48 GB o más de memoria unificada (M2 Max, M3 Max, M4 Max, M2/M3/M4 Ultra). No apto para la mayoría de GPUs de consumo NVIDIA en 8 bits sin offloading (una RTX 4090 con 24 GB no lo aloja).
- Alternativa para equipos con menos memoria: las variantes oQ6e y oQ4e del mismo autor reducen el footprint.
- Despliegue: cargadores compatibles con MLX, en particular oMLX (jundot/omlx). No es directamente usable con llama.cpp, vLLM, Ollama o TGI sin conversión adicional de formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Formato | Contexto | Licencia |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-oQ8e (esta ficha) | 33,1B | oQ8e (8 bits, afín, gs 64) | MLX safetensors | no disponible | Apache-2.0 |
| Nanbeige4.3-33B-oQ6e (mismo autor) | 33,1B | oQ6e | MLX safetensors | no disponible | Apache-2.0 |
| Nanbeige4.3-33B-oQ4e (mismo autor) | 33,1B | oQ4e | MLX safetensors | no disponible | Apache-2.0 |
| Nanbeige/Nanbeige4.3-33B (original) | 33,1B | BF16 (sin cuantizar) | Transformers safetensors | no disponible | Apache-2.0 |

La comparación más pertinente es entre los propios niveles de cuantización: oQ8e ofrece máxima fidelidad a cambio de ~35 GB; oQ6e y oQ4e reducen memoria con posible pérdida de calidad no cuantificada. No hay datos de rendimiento publicados que permitan comparar con otros LLM de 30-34B como Qwen o Yi.

## Limitaciones y advertencias

- Se trata de una conversación comunitaria, no de una publicación oficial de Nanbeige ni de jundot; la calidad de la cuantización no ha sido validada con benchmarks.
- No se ha evaluado la degradación de calidad respecto al modelo BF16 original; el autor lo declara explícitamente.
- Sesgos conocidos: no disponible; hereda presumiblemente los del modelo base, sobre el que tampoco hay documentación en los datos proporcionados.
- Riesgo de alucinación: inherente a todo LLM; sin datos de evaluación publicados, no se puede cuantificar.
- Longitud de contexto no documentada: conviene verificarla en la model card original antes de diseñar aplicaciones con documentos largos.
- Formato MLX: limitado a Apple Silicon; no compatible de forma directa con el stack habitual de inferencia en NVIDIA (vLLM, TGI) ni con llama.cpp/Ollama.
- Descargas muy bajas (405) y sin likes: adopción mínima, poco probada por la comunidad.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque deben respetarse los términos de atribución.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/a-gordo/Nanbeige4.3-33B-oQ8e
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Model card del original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Revisión fuente de la conversión: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/tree/c1093c501cc6460427c0ac634db7223d0450c0ee
- Organización Nanbeige: https://huggingface.co/Nanbeige
- Herramienta oMLX: https://github.com/jundot/omlx
- Variante oQ6e: https://huggingface.co/a-gordo/Nanbeige4.3-33B-oQ6e
- Variante oQ4e: https://huggingface.co/a-gordo/Nanbeige4.3-33B-oQ4e
