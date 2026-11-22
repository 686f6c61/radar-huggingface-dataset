# mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-i1-GGUF

## Resumen

GLM-Z1-32B-0414-uncensored-heretic-v2-i1-GGUF es una cuantizacion en formato GGUF del modelo GLM-Z1-32B-0414-uncensored-heretic-v2, publicada por el usuario mradermacher en Hugging Face. Se trata de una derivacion del modelo GLM-Z1-32B-0414 del laboratorio Zhipu AI (serie GLM), sobre el que se ha aplicado un proceso de "abliteracion" o "uncensoring" (etiquetado como heretic) para reducir los rechazos y el comportamiento de alineamiento restrictivo, y posteriormente se ha cuantizado con el metodo imatrix de llama.cpp.

El modelo base pertenece a la familia GLM-Z1, orientada a razonamiento, con aproximadamente 32.566 millones de parametros (32,5B) en arquitectura transformer densa. Esta version concreta esta pensada para ejecucion local en hardware de consumo mediante llama.cpp y derivados, ya que el repositorio ofrece un amplio conjunto de cuantizaciones (desde IQ1_S hasta Q6_K) con un tamano total del repositorio de 12,3 GB.

La relevancia de esta ficha es doble: por un lado documenta una variante "sin censura" de un modelo de razonamiento de 32B, util para investigacion sobre alineamiento y comportamiento de rechazo; por otro, advierte de que la informacion oficial disponible es muy limitada (sin licencia declarada, sin idiomas declarados y sin benchmarks publicados en la informacion proporcionada), lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de GLM-Z1-32B-0414); detalles internos no disponibles |
| Parametros totales | 32.566.081.536 (32,5B, dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted) |

## Arquitectura y entrenamiento

El modelo subyacente es GLM-Z1-32B-0414, un transformer denso de aproximadamente 32,5B parametros de la familia GLM de Zhipu AI, orientado a tareas de razonamiento. Sobre esa base, el autor del modelo intermedio (llmfan46) aplico una variante de "abliteracion"/"uncensoring" (denominada heretic v2) cuyo objetivo es eliminar o atenuar las respuestas de rechazo y el tono de alineamiento restrictivo. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo fases de RLHF o DPO en el modelo original o en el proceso de modificacion.

La contribucion de esta publicacion concreta es la cuantizacion. mradermacher ha generado un conjunto amplio de cuantizaciones GGUF usando el metodo imatrix (weighted/imatrix quants), que calcula matrices de importancia por tensor para mejorar la fidelidad de las cuantizaciones de baja precision. El pipeline declarado es `convert_type: hf` y `quantize_version: 2`, lo que indica conversion desde pesos Hugging Face y cuantizacion con la version 2 del motor de llama.cpp. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y razonamiento de multiples pasos, heredadas del modelo GLM-Z1-32B-0414.
- Razonamiento matematico y logico, dada la orientacion de la serie Z1.
- Generacion de codigo y asistencia en tareas de programacion (capacidad inferida del modelo base; no verificada en la informacion disponible).
- Comportamiento "uncensored": menor tendencia a rechazar peticiones que el modelo alineado original, segun la denominacion heretic v2.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y rechazo: el modelo permite estudiar como varia la tasa de rechazo y el tono de respuesta respecto al GLM-Z1-32B original, comparando las cuantizaciones Q4_K_M e IQ4_XS en el mismo hardware.
- Ejecucion local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M o IQ4_XS permiten desplegar un modelo de 32B en GPUs con 24 GB de VRAM, algo inviable con los pesos en fp16.
- Prototipado de asistentes conversacionales sin filtros editoriales: util para generar dialogos sinteticos y datasets de entrenamiento en los que se necesita diversidad de respuestas sin rechazos.
- Evaluacion de cuantizaciones: el repositorio ofrece 24 variantes de cuantizacion, lo que permite medir la degradacion de calidad (perplejidad, coherencia) entre IQ1_S y Q6_K sobre el mismo modelo.
- Despliegue en entornos con recursos limitados: las variantes IQ2/IQ3 permiten ejecutar el modelo en CPU o en GPUs con 8-12 GB de VRAM, a costa de perdida de calidad.
- Analisis de sesgos y contenido sensible: al reducir los rechazos, el modelo puede emplearse en estudios controlados sobre generacion de contenido potencialmente danino, siempre en entornos aislados y con supervision.
- Integracion en pipelines de llama.cpp/Ollama: el formato GGUF es directamente compatible con llama.cpp, Ollama y servidores compatibles con la API de OpenAI, lo que facilita su inclusion en herramientas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y longitud de contexto):
  - IQ1_S / IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 9-12 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 13-16 GB.
  - IQ4_XS / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 17-21 GB.
  - Q5_K_S / Q5_K_M: en torno a 22-25 GB.
  - Q6_K: en torno a 26-28 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M e IQ4_XS; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q5_K_M y Q6_K con contexto largo; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) para cuantizaciones IQ2/IQ3.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4 y en GPUs de 12-16 GB con IQ2/IQ3; las variantes IQ1/IQ2 permiten incluso ejecucion parcial en CPU.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (el tag `endpoints_compatible` lo sugiere), y cualquier runtime que consuma GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-Z1-32B-0414-uncensored-heretic-v2-i1-GGUF (este) | 32,5B | no disponible | GGUF (24 cuantizaciones) | no disponible | Variante uncensored cuantizada con imatrix |
| GLM-Z1-32B-0414 (original) | 32,5B | no disponible en esta ficha | safetensors / GGUF | no disponible | Modelo base alineado de Zhipu AI |
| Modelos densos de ~32B de otras familias (p. ej. Qwen2.5-32B) | ~32B | 32k-128k (segun variante) | safetensors / GGUF | Apache 2.0 en algunas variantes | Alternativa con licencia mas clara; datos no verificados en esta ficha |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base GLM-Z1-32B-0414 y del derivado heretic v2 antes de cualquier despliegue productivo.
- Modelo "uncensored": reduce deliberadamente los rechazos, lo que aumenta el riesgo de generar contenido danino, ofensivo o ilegal; requiere moderacion externa en produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje de esta escala, puede inventar hechos, citas y codigo; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Idiomas no declarados: no hay garantia de calidad fuera del ingles o el chino; el soporte de castellano no esta confirmado.
- Contexto no disponible: se desconoce la ventana de contexto efectiva, lo que impide planificar tareas de contexto largo con garantias.
- Cuantizaciones agresivas (IQ1_S, IQ2_XXS): degradan notablemente la coherencia y el razonamiento; no recomendadas para tareas que exijan precision.
- Sin benchmarks publicados ni descargas/likes: el modelo no tiene validacion comunitaria en el momento de la ficha, lo que anade incertidumbre sobre su calidad real.
- Procedencia del ajuste "heretic v2": el proceso de abliteracion puede degradar capacidades generales del modelo base; conviene comparar contra el GLM-Z1-32B original antes de adoptarlo.
- Fecha de creacion futura en los metadatos (2026-11-22): inconsistencia que conviene verificar en el repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-i1-GGUF
- Modelo intermedio (uncensored heretic v2): https://huggingface.co/llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (runtime GGUF): https://ollama.com
