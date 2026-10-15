# mradermacher/Qwen-3.5-Opus-GLM-27B-GGUF

## Resumen

`mradermacher/Qwen-3.5-Opus-GLM-27B-GGUF` es un repositorio de cuantizaciones en formato GGUF del modelo `rodrigomt/Qwen-3.5-Opus-GLM-27B`, publicado por mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF de un merge previo: el modelo base se construyó con mergekit mediante el método DARE-TIES a partir de dos modelos de la familia Qwen, `Jackrong/Qwopus3.5-27B-v3.5` y `Jackrong/Qwen3.5-27B-GLM5.1-Distill-v1`. El resultado es un modelo denso de 26.895.998.464 parametros (aproximadamente 26,9 mil millones).

Su relevancia pratica es doble. Por un lado, permite ejecutar un modelo de ~27B en hardware de consumo gracias al amplio catalogo de cuantizaciones (desde Q2_K de 10,8 GB hasta Q8_0 de 28,7 GB). Por otro, al ser un merge de dos linajes distintos, busca combinar las capacidades conversacionales y de razonamiento de sendos modelos padres en un unico conjunto de pesos, algo habitual en la comunidad para obtener mejoras sin reentrenar. La licencia es Apache 2.0, lo que facilita su uso comercial.

El repositorio tiene 156 descargas, 0 likes y un tamano de 186,3 GB. Esta etiquetado como `conversational`, orientado a ingles (`en`) y declarado compatible con endpoints. La model card no documenta arquitectura interna, longitud de contexto, datos de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones tecnicas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (merge de transformers; sin etiquetas de MoE ni SSM) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (y f16 en el catalogo declarado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base esta publicado con pesos safetensors |
| Metodo de creacion | mergekit, metodo dare_ties |
| Modelo base | rodrigomt/Qwen-3.5-Opus-GLM-27B |
| Modelos de origen del merge | Jackrong/Qwopus3.5-27B-v3.5, Jackrong/Qwen3.5-27B-GLM5.1-Distill-v1 |
| Tamano del repositorio | 186,3 GB |
| Fecha de creacion | 2026-04-24 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna (numero de capas, dimensiones, tipo de atencion, uso de GQA, etc.). Lo unico documentado es el proceso de construccion: el modelo base `rodrigomt/Qwen-3.5-Opus-GLM-27B` se genero combinando dos modelos mediante mergekit con el metodo DARE-TIES (una variante de TIES merging que poda los deltas de tarea y resuelve conflictos de signo antes de promediar). Los dos modelos de origen son `Jackrong/Qwopus3.5-27B-v3.5` y `Jackrong/Qwen3.5-27B-GLM5.1-Distill-v1`, ambos de ~27B y pertenecientes al ecosistema Qwen segun sus nombres.

Este repositorio concreto no ha sido entrenado ni ajustado: mradermacher aplica cuantizacion estatica post-entrenamiento sobre los pesos del modelo base y publica los ficheros GGUF resultantes. No consta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si los modelos de origen usaron RLHF, DPO u otro tipo de alineamiento. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modo de razonamiento explicito, etc.). Existe ademas una variante con cuantizaciones ponderadas/imatrix en `mradermacher/Qwen-3.5-Opus-GLM-27B-i1-GGUF`.

## Capacidades

La model card no enumera capacidades funcionales; solo declara la etiqueta `conversational` y el idioma ingles. Por tanto:

- Generacion de texto conversacional: es la unica capacidad explicitamente etiquetada en el repositorio (tag `conversational`).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo ingles declarado; el resto de idiomas no esta documentado.
- Vision, audio u otras modalidades: no disponible. El proceso de cuantizacion indica explicitamente `skip_mmproj: 1`, lo que sugiere que no se han incluido componentes multimodales en los ficheros GGUF.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Capacidad de codigo y matematicas: no disponible (no documentado en la informacion proporcionada).

Se recomienda validar cualquier capacidad concreta mediante evaluacion propia antes de usarla en produccion, dado que el comportamiento de un merge DARE-TIES no esta caracterizado en la documentacion disponible.

## Casos de uso

- Asistente conversacional local en ingles: el modelo se puede desplegar con llama.cpp u Ollama usando la cuantizacion Q4_K_M (16,6 GB) en una GPU de 24 GB, ofreciendo un chatbot de ~27B sin depender de APIs externas.
- Prototipado e investigacion de merges: util para estudiar el comportamiento real de una combinacion DARE-TIES de dos modelos Qwen de 27B, comparando las respuestas contra los modelos padres.
- Generacion de texto en lote (batch): con Q8_0 (28,7 GB) en una GPU de 40-48 GB se puede procesar grandes volumenes de texto en ingles manteniendo la mejor calidad de cuantizacion disponible en el repositorio.
- Despliegue en estaciones de trabajo sin GPU de datacenter: la cuantizacion Q2_K (10,8 GB) permite ejecutar el modelo en GPUs de 12-16 GB o incluso en CPU con RAM suficiente, a costa de una perdida de calidad notable.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes del mismo modelo, lo que permite medir la degradacion de perplejidad y calidad entre Q2_K y Q8_0 para decidir el punto de equilibrio en un despliegue concreto.
- Integracion en pipelines de inferencia compatibles con GGUF: al declararse `endpoints_compatible` y estar en formato GGUF, puede servir como backend de texto en herramientas que consumen este formato (llama.cpp server, text-generation-webui, LM Studio).
- Base para ajuste fino posterior (fine-tuning) sobre el modelo original: conviene partir del repositorio safetensors `rodrigomt/Qwen-3.5-Opus-GLM-27B`, no de los GGUF, para aplicar LoRA o QLoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni metricas equivalentes, y tampoco se han encontrado referencias externas en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, sin contar el contexto en memoria):
  - Q2_K: 10,8 GB
  - Q3_K_S: 12,2 GB
  - Q3_K_M: 13,4 GB
  - Q3_K_L: 14,4 GB
  - IQ4_XS: 15,3 GB
  - Q4_K_S: 15,7 GB
  - Q4_K_M: 16,6 GB
  - Q5_K_S: 18,8 GB
  - Q5_K_M: 19,3 GB
  - Q6_K: 22,2 GB
  - Q8_0: 28,7 GB
- GPU de consumo: Q4_K_M (16,6 GB) cabe en RTX 4080/4090 (16-24 GB) y en RTX 3090 (24 GB) dejando margen para contexto. Q5_K_M y Q6_K requieren 24 GB o reparto parcial en CPU. Q8_0 no cabe en 24 GB con contexto amplio.
- GPU profesionales: Q8_0 encaja comodamente en A100 40 GB, L40S 48 GB o H100; permite ademas contextos largos y mayor tamano de batch.
- Equipos de gama baja: Q2_K y Q3_K_S son las unicas opciones viables en GPUs de 12 GB, con degradacion de calidad esperable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier servidor compatible con GGUF y con la API de endpoints. El tag `transformers` aparece en los metadatos, pero la inferencia con estos ficheros se realiza con runtimes GGUF.
- Latencia y throughput: no disponibles. Dependen por completo del hardware, del backend y de la longitud de contexto utilizada.
- Nota: la model card recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q6_K como "muy buena calidad". Estos juicios provienen del autor de las cuantizaciones, no de mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparacion se limita a metadatos estructurales frente a sus propios modelos de origen.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen-3.5-Opus-GLM-27B-GGUF | ~26,9B | no disponible | apache-2.0 | GGUF (11 cuantizaciones) | Este repositorio; solo cuantizacion |
| rodrigomt/Qwen-3.5-Opus-GLM-27B | ~26,9B | no disponible | no disponible | safetensors | Modelo base del merge; pesos completos |
| Jackrong/Qwopus3.5-27B-v3.5 | no disponible | no disponible | no disponible | no disponible | Uno de los dos modelos de origen |
| Jackrong/Qwen3.5-27B-GLM5.1-Distill-v1 | no disponible | no disponible | no disponible | no disponible | Uno de los dos modelos de origen |

No se dispone de informacion suficiente sobre alternativas de la misma categoria (modelos densos de ~27B en ingles) dentro del material proporcionado, por lo que no se puede establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Idiomas: el repositorio declara unicamente ingles (`en`). No hay evidencia de soporte de castellano ni de otros idiomas.
- Ausencia total de evaluacion: no hay benchmarks publicados, ni resultados de evaluacion de sesgos, ni analisis de alucinacion para este modelo.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano, y no mitigado ni documentado en este caso. Al ser un merge, puede heredar comportamientos erraticos no presentes en ninguno de los padres por separado.
- Naturaleza del merge: los merges DARE-TIES pueden degradar capacidades especificas respecto a los modelos originales, especialmente en tareas que requerian un ajuste fino especializado. La documentacion no aporta ninguna validacion al respecto.
- Contexto desconocido: se desconoce la longitud de contexto efectiva, lo que impide planificar despliegues con contexto largo de forma segura.
- Cuantizaciones agresivas: Q2_K y Q3_K_S implican perdidas de calidad significativas; el propio catalogo marca Q3_K_M como "lower quality". No se deben usar para tareas que exijan precision.
- Licencia: Apache 2.0 declarada en este repositorio, lo que permite uso comercial del artefacto de cuantizacion. Sin embargo, no se especifica la licencia del modelo base ni de los dos modelos de origen del merge; conviene verificar las condiciones de `rodrigomt/Qwen-3.5-Opus-GLM-27B`, `Jackrong/Qwopus3.5-27B-v3.5` y `Jackrong/Qwen3.5-27B-GLM5.1-Distill-v1` antes de un uso comercial.
- Etiquetado poco fiable: los identificadores de los modelos implicados (Qwen 3.5, GLM 5.1, Opus) no permiten confirmar linajes ni versiones reales con la informacion disponible.
- Repositorio de bajo uso: 156 descargas y 0 likes, sin comunidad que haya reportado problemas o validaciones independientes.
- Compatibilidad multimodal: el proceso de cuantizacion omite el proyector multimodal (`skip_mmproj: 1`), por lo que estos ficheros no incluyen capacidades de vision aunque el modelo original las tuviera.

## Enlaces

- Repositorio HuggingFace (GGUF estaticos): https://huggingface.co/mradermacher/Qwen-3.5-Opus-GLM-27B-GGUF
- Repositorio HuggingFace (cuantizaciones ponderadas/imatrix): https://huggingface.co/mradermacher/Qwen-3.5-Opus-GLM-27B-i1-GGUF
- Modelo base: https://huggingface.co/rodrigomt/Qwen-3.5-Opus-GLM-27B
- Modelo de origen del merge 1: https://huggingface.co/Jackrong/Qwopus3.5-27B-v3.5
- Modelo de origen del merge 2: https://huggingface.co/Jackrong/Qwen3.5-27B-GLM5.1-Distill-v1
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen-3.5-Opus-GLM-27B-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Enlaces adicionales de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos por la busqueda no guardan relacion con el modelo ni con su tematica.
