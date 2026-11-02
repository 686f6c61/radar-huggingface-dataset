# mradermacher/Q3.6-27B-GLM-5.1-DA-GGUF

## Resumen

Q3.6-27B-GLM-5.1-DA-GGUF es la distribucion en formato GGUF del modelo Q3.6-27B-GLM-5.1-DA, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos de modelos open source. El modelo original, alojado por prithivMLmods, es un transformer denso de aproximadamente 26.900 millones de parametros (26.895.998.464 segun los safetensors del repositorio) derivado de la familia GLM-5.1 y afinado para tareas de matematicas y razonamiento. Esta version concreta incorpora modificaciones de alineacion orientadas a eliminar rechazos (refusal-ablated, abliterated, uncensored).

La aportacion principal de este repositorio no es el modelo en si, sino la disponibilidad de pesos cuantizados estaticos en multiples niveles (desde Q2_K hasta Q8_0, ademas de IQ4_XS) que permiten ejecutar un modelo de ~27B en hardware de consumo. El repositorio ocupa 187,9 GB en total e incluye tambien ficheros mmproj para un componente multimodal.

Es relevante ahora porque combina tres tendencias del ecosistema: la publicacion de variantes desalineadas o sin filtros de rechazo, la cuantizacion comunitaria para inferencia local y la extension del contexto de razonamiento (el dataset de entrenamiento declarado, GLM-5.1-Reasoning-1M-Cleaned, sugiere un enfasis en cadenas de razonamiento largas). La licencia Apache 2.0 facilita su uso comercial, aunque las modificaciones de alineacion introducen consideraciones eticas y de seguridad relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia GLM-5.1); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de ~27B parametros etiquetado como perteneciente a la familia GLM-5.1. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni innovaciones arquitectonicas especificas en la informacion proporcionada. Los tags del repositorio indican pesos en bf16 en el modelo original y soporte para text-generation-inference.

En cuanto al entrenamiento, la model card declara dos conjuntos de datos: `prithivMLmods/harm_bench` y `Jackrong/GLM-5.1-Reasoning-1M-Cleaned`. El segundo sugiere un ajuste orientado a razonamiento con aproximadamente un millon de ejemplos limpios; el primero esta vinculado a la modificacion de alineacion (evaluacion de dano) que da lugar a la variante "DA" (desalineada/abliterated). No se especifica el volumen total de tokens de preentrenamiento, la composicion del corpus ni si se emplearon tecnicas de RLHF o DPO mas alla de la ablacion de rechazos. No hay datos publicados sobre decodificacion especulativa, atencion lineal u otras optimizaciones.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico y resolucion de problemas (tags `math` y `reasoning`).
- Razonamiento multi-paso, presumiblemente con cadenas de pensamiento derivadas del dataset GLM-5.1-Reasoning-1M-Cleaned.
- Capacidades multimodales: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica soporte de entrada de imagen en el modelo base.
- Modo sin filtros de rechazo: la variante esta ablacionada para no declinar peticiones (uncensored, unfiltered, unredacted).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas paso a paso en entornos de investigacion donde se requiera explorar razonamientos sin restricciones de rechazo, aprovechando su ajuste sobre GLM-5.1-Reasoning-1M-Cleaned.
- Investigacion sobre alineacion y seguridad: util para estudiar el comportamiento de modelos ablacionados frente a modelos alineados, comparando tasas de rechazo y respuestas ante prompts de harm_bench.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (16,6 GB) o Q5_K_M (19,3 GB) cabe en GPUs de consumo de 24 GB, lo que permite experimentacion offline sin dependencia de APIs.
- Generacion de codigo y scripts en ingles: uso como asistente de programacion en pipelines internos, aunque sin garantias de tool calling nativo.
- Prototipado de asistentes conversacionales sin filtros: escenarios de red teaming, generacion de datasets adversarios o simulacion de dialogos donde los rechazos del modelo base resultan un obstaculo.
- Analisis de documentos con componente visual: gracias a los ficheros mmproj, puede procesar imagenes junto con texto en tareas de descripcion o extraccion de informacion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantizacion, lo que facilita estudios de degradacion de calidad (perplejidad) frente a tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~11 GB
  - Q3_K_M: ~13,5 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_M: ~17 GB
  - Q5_K_M: ~19,5 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; A100 40 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) como alternativa de consumo.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB (Q3_K_M, IQ4_XS con contexto reducido) y de 24 GB (hasta Q5_K_M). Las cuantizaciones Q2_K y Q3_K_S permiten incluso tarjetas de 12 GB con contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (para el modelo base en safetensors), vLLM (modelo base).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Q3.6-27B-GLM-5.1-DA (este) | ~26,9B | no disponible | Apache 2.0 | GGUF | Variante ablacionada, enfocada a razonamiento y matematicas |
| Modelo base prithivMLmods/Q3.6-27B-GLM-5.1-DA | ~26,9B | no disponible | Apache 2.0 | safetensors (bf16) | Sin cuantizar, referencia de calidad |
| mradermacher/Q3.6-27B-GLM-5.1-DA-i1-GGUF | ~26,9B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas, mayor calidad por bit |
| Alternativas de ~27B (p. ej. Gemma, Qwen) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo ablacionado: la eliminacion de rechazos implica que puede generar contenido danino, sesgado o inapropiado sin filtros; no es adecuado para aplicaciones de cara al publico sin capas adicionales de moderacion.
- Solo ingles: el campo `language` declara unicamente `en`; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos de ~27B, especialmente en tareas factuales y con contexto largo; no hay evaluaciones publicadas de fidelidad.
- Sin datos de contexto: se desconoce la ventana maxima real, lo que impide planificar cargas de contexto largo con garantias.
- Sin benchmarks publicados: no es posible validar las afirmaciones de rendimiento en matematicas y razonamiento frente a alternativas.
- Origen comunitario: el modelo es una derivacion de terceros (prithivMLmods) sobre GLM-5.1; no hay garantia de procedencia ni de calidad del ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin filtros conlleva responsabilidad legal y reputacional; conviene revisar las politicas de uso aceptable del proveedor de infraestructura.
- Repositorio de 187,9 GB: la descarga completa es costosa; conviene seleccionar unicamente la cuantizacion necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Q3.6-27B-GLM-5.1-DA-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Q3.6-27B-GLM-5.1-DA
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Q3.6-27B-GLM-5.1-DA-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Q3.6-27B-GLM-5.1-DA-GGUF
- Dataset de evaluacion de dano: https://huggingface.co/datasets/prithivMLmods/harm_bench
- Dataset de razonamiento: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
