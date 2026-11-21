# mradermacher/Phai-A1-35B-1M-MTP-Repacked-i1-GGUF

## Resumen

Phai-A1-35B-1M-MTP-Repacked-i1-GGUF es una cuantizacion GGUF con imatrix realizada por mradermacher sobre el modelo Phai-A1-35B-1M-MTP-Repacked, publicado por prithivMLmods. Se trata de un modelo de lenguaje de 35.505.251.456 parametros (aproximadamente 35,5 mil millones) construido sobre la arquitectura Qwen3.5 MoE, segun la etiqueta `qwen3_5_moe` de la model card. El sufijo "1M" del nombre alude a una ventana de contexto de un millon de tokens y "MTP" hace referencia a Multi-Token Prediction, una tecnica de decodificacion especulativa integrada en el modelo.

Este repositorio concreto no contiene el modelo original en safetensors, sino una coleccion de cuantizaciones GGUF generadas con matrices de importancia (imatrix) para su uso con llama.cpp, llama-cli y otros motores compatibles con GGUF. El objetivo es permitir el despliegue del modelo en hardware mas modesto que el requerido por los pesos en precision completa, manteniendo la mayor calidad posible gracias al calibrado por imatrix.

La relevancia de esta ficha radica en que el modelo original esta orientado a generacion de codigo, uso como agente, contexto largo y razonamiento con refuerzo (RL), con soporte declarado para chino, ingles, japones, arabe, ruso y aleman bajo licencia Apache 2.0. La disponibilidad de cuantizaciones GGUF amplia el alcance practico de estos modelos a entornos de inferencia locales y de servidor sin GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`), con Multi-Token Prediction (MTP) |
| Parametros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (segun el sufijo "1M" del nombre; no confirmado en la model card) |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL (small-IQ4_NL), Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, mas fichero imatrix |
| Idiomas soportados | zh, en, ja, ar, ru, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones con imatrix); el modelo base en safetensors no esta incluido en este repo |

## Arquitectura y entrenamiento

La model card del repositorio de cuantizacion no detalla la arquitectura interna ni el proceso de entrenamiento del modelo original. Las etiquetas indican que se trata de un transformer de mezcla de expertos (MoE) de la familia Qwen3.5, con soporte de Multi-Token Prediction (MTP), una tecnica de decodificacion especulativa que permite predecir varios tokens por paso y acelerar la generacion. Tambien aparece la etiqueta `mxfp4_moe`, que sugiere el uso de formatos de cuantizacion MXFP4 en los expertos del modelo base.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. La etiqueta `rl` sugiere que el modelo incorpora entrenamiento con refuerzo, y las etiquetas `coding`, `agent` y `long-context` indican las areas de optimizacion declaradas. El repositorio de mradermacher se limita a generar las cuantizaciones GGUF con imatrix a partir del modelo base de prithivMLmods; no aporta informacion adicional sobre el entrenamiento.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Generacion y asistencia en programacion (etiqueta `coding`).
- Uso como agente y razonamiento multi-paso (etiqueta `agent`).
- Manejo de contextos largos, con ventana declarada de hasta 1 millon de tokens (etiqueta `long-context`).
- Decodificacion especulativa mediante Multi-Token Prediction (MTP) para acelerar la inferencia.
- Soporte multilingue en chino, ingles, japones, arabe, ruso y aleman.
- Capacidades de vision: la model card indica explicitamente que es un modelo de vision y que los ficheros mmproj, si existen, se encuentran en el repositorio estatico.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun las etiquetas.

## Casos de uso

- Asistencia de programacion en local: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de 35,5 B orientado a codigo en una unica GPU de consumo o en un servidor con llama.cpp, integrable en editores y pipelines de revision.
- Agentes autonomos con contexto largo: la ventana declarada de 1M tokens permite mantener el estado de tareas complejas, repositorios completos o historiales extensos de conversacion sin truncar el contexto.
- Procesamiento de documentacion tecnica multilingue: el soporte de chino, ingles, japones, arabe, ruso y aleman cubre casos de traduccion, resumen y extraccion de informacion en entornos internacionales.
- Despliegue en servidores sin GPU de gama alta: las cuantizaciones IQ2/IQ3 y Q4 reducen el peso del modelo lo suficiente para ejecutarlo en estaciones de trabajo con VRAM limitada o incluso en CPU con llama.cpp.
- Generacion acelerada en produccion: el uso de MTP y decodificacion especulativa reduce la latencia por token en servicios de generacion de texto con text-generation-inference.
- Analisis de imagenes y documentos escaneados: al ser un modelo de vision, puede emplearse para extraer texto y describir contenido de imagenes cuando se dispone del fichero mmproj del repositorio estatico.
- Experimentacion e investigacion: las cuantizaciones con imatrix permiten comparar el impacto de distintos niveles de cuantizacion en tareas de razonamiento y codigo sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de pesos de un modelo de 35,5 B):
  - Q2_K / IQ2: en torno a 12-14 GB.
  - Q3_K_M / IQ3: en torno a 16-18 GB.
  - Q4_K_M / IQ4_XS: en torno a 20-22 GB.
  - Q5_K_M: en torno a 24-26 GB.
  - Q6_K: en torno a 28-30 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para cuantizaciones altas; RTX 4090 (24 GB) para Q4_K_M o IQ4_XS; RTX 3090 (24 GB) en el mismo rango; GPUs de 16 GB para cuantizaciones Q3.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB con Q3 o IQ3.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, text-generation-inference y endpoints compatibles con GGUF; los ficheros imatrix permiten generar cuantizaciones propias.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phai-A1-35B-1M-MTP-Repacked (este, GGUF i1) | 35,5 B | 1M (declarado) | Apache 2.0 | GGUF imatrix | Cuantizaciones de mradermacher sobre el modelo de prithivMLmods |
| Phai-A1-35B-1M-MTP-Repacked-GGUF (estatico) | 35,5 B | 1M (declarado) | Apache 2.0 | GGUF estatico | Mismo modelo base, cuantizaciones sin imatrix, incluye mmproj para vision |
| Modelo base prithivMLmods/Phai-A1-35B-1M-MTP-Repacked | 35,5 B | 1M (declarado) | Apache 2.0 | safetensors | Pesos originales en precision completa |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks ni evaluaciones de calidad en la informacion disponible; el rendimiento real no esta verificado.
- El repositorio contiene unicamente cuantizaciones GGUF; no incluye los pesos en safetensors ni el fichero mmproj para vision, que reside en el repositorio estatico.
- Las cuantizaciones de baja precision (IQ1, IQ2, Q2) degradan la calidad de forma notable; para uso en produccion se recomienda Q4_K_M o superior.
- La ventana de 1M tokens se deduce del nombre del modelo y no esta confirmada en la model card; el comportamiento real con contextos muy largos puede degradarse.
- El modelo puede presentar sesgos y alucinaciones propios de los modelos de lenguaje; no se documentan mitigaciones especificas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- El soporte de idiomas se limita a los seis declarados (zh, en, ja, ar, ru, de); el rendimiento en castellano no esta documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Phai-A1-35B-1M-MTP-Repacked-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-MTP-Repacked
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Phai-A1-35B-1M-MTP-Repacked-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Phai-A1-35B-1M-MTP-Repacked-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
