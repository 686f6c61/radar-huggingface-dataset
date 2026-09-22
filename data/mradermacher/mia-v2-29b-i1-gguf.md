# mradermacher/Mia-v2-29B-i1-GGUF

## Resumen

Este repositorio contiene un conjunto de cuantizaciones GGUF del modelo AIVORENCE/Mia-v2-29B, generadas por mradermacher con el método de cuantización dinámica i1 y calibración mediante fichero imatrix. El modelo base cuenta con 30.697.345.596 parámetros reales según los pesos en safetensors (comercializado como «29B»), lo que lo sitúa en la franja de los modelos densos de gran tamano ejecutables en estaciones de trabajo con una o dos GPU. Según las notas de la model card del cuantizador, el modelo base es un modelo de visión, por lo que las capacidades multimodales requieren además el fichero mmproj que se distribuye en el repositorio de cuantizaciones estáticas del mismo autor.

La relevancia de este repositorio es práctica: permite ejecutar un modelo de ~30,7B de parámetros en hardware de consumo o de gama profesional mediante llama.cpp y derivados, con opciones que van desde 11,0 GB (i1-IQ2_M) hasta 25,3 GB (i1-Q6_K). El uso de cuantizaciones i1 con imatrix busca minimizar la degradación de perplejidad respecto a las cuantizaciones estáticas tradicionales del mismo tamano.

No obstante, la información pública disponible es muy limitada: no se especifican la longitud de contexto, la licencia, la composición del dataset de entrenamiento ni resultados de benchmarks del modelo base. El repositorio acumula 0 descargas y 0 «likes» en el momento de la consulta, y el tamaño total del repo es de 154,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base no detalla arquitectura; es multimodal, con soporte de visión mediante fichero mmproj) |
| Parametros totales | 30.697.345.596 (~30,7B; el nombre comercial indica 29B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (dinámicas con imatrix): i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K. Estáticas en repositorio aparte: Q2_K, Q3_K_S/M/L, Q4_0, Q4_1, Q4_K_S/M, Q5_K_S/M, Q6_K, IQ1_S/M, IQ2_XXS/XS/S/M, IQ3_XXS/XS/S/M, IQ4_XS/NL |
| Idiomas soportados | en (inglés), según los tags del repositorio |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el repositorio base usa transformers, sin confirmación del formato exacto de los pesos originales |
| Tamano del repositorio | 154,0 GB |
| Fichero de calibración | Mia-v2-29B.imatrix.gguf (0,1 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El único dato estructural confirmado es el recuento de parámetros a partir de los pesos en safetensors (30.697.345.596) y la indicación del cuantizador de que se trata de un modelo de visión, lo que implica algún tipo de proyector multimodal cuyos pesos se distribuyen como fichero mmproj en el repositorio estático.

El proceso de cuantización sí está documentado: mradermacher ha generado cuantizaciones dinámicas i1 con fichero imatrix, un enfoque que utiliza estadísticas de activación sobre un corpus de calibración para asignar de forma desigual la precisión entre tensores. El autor atribuye el acceso a un supercomputador para la generación de estos quants a @nicoboss. Se ofrece también el fichero imatrix por separado para que terceros puedan crear sus propias cuantizaciones. No se documenta ninguna innovación arquitectónica propia del modelo base.

## Capacidades

- Generación de texto conversacional: el repositorio incluye la etiqueta «conversational», lo que indica ajuste para diálogo multi-turno.
- Procesamiento de imágenes: el cuantizador indica explícitamente que se trata de un modelo de visión; para usarlo hay que descargar el fichero mmproj desde el repositorio de cuantizaciones estáticas.
- Idiomas: únicamente inglés declarado en los metadatos; no hay soporte multilingüe confirmado.
- Tool calling / function calling: no disponible (sin evidencia en la información proporcionada).
- Uso como agente y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.
- Capacidades de audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local de un asistente conversacional en inglés: con la cuantización i1-Q4_K_M (18,8 GB) el modelo cabe en una GPU de 24 GB y permite mantener conversaciones multi-turno sin depender de APIs externas, con los datos en la propia infraestructura.
- Análisis de documentos con componentes visuales: al ser un modelo de visión, puede emplearse para extraer información de capturas, diagramas o formularios escaneados, cargando el modelo junto al fichero mmproj del repositorio estático.
- Prototipado e investigación sobre cuantización: la disponibilidad del fichero imatrix y de diez variantes i1 permite estudiar empíricamente la relación entre bits por peso, perplejidad y calidad de salida en un modelo de ~30,7B.
- Servicio de chat de bajo coste en una sola GPU: las variantes IQ2_M (11,0 GB) y IQ3_XXS (12,2 GB) permiten levantar un endpoint conversacional en GPUs de 12-16 GB, a costa de una pérdida de calidad notable.
- Evaluación comparativa de tésis o artículos: útil como punto de comparación frente a otros modelos de ~30B en inglés, siempre que se documente que no existen benchmarks publicados del modelo base.
- Experimentación con pipelines multimodales en llama.cpp: sirve para validar integraciones de visión en herramientas que consumen GGUF, como servidores compatibles con la API de OpenAI.
- Fine-tuning posterior: el repositorio base en transformers (no cuantizado) puede emplearse como punto de partida para ajuste con LoRA, siempre que se resuelva la ambigüedad de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantización (tamaño de fichero más margen para caché KV, buffers y contexto; cifras orientativas):
  - i1-IQ2_M: 11,0 GB de pesos; ~12-14 GB de VRAM en total.
  - i1-Q2_K_S: 11,1 GB; ~12-14 GB.
  - i1-Q2_K: 12,0 GB; ~13-15 GB.
  - i1-IQ3_XXS: 12,2 GB; ~13-15 GB.
  - i1-IQ3_M: 14,5 GB; ~16-18 GB.
  - i1-Q3_K_M: 15,4 GB; ~17-19 GB.
  - i1-IQ4_XS: 16,8 GB; ~18-20 GB.
  - i1-Q4_K_S: 17,9 GB; ~19-22 GB.
  - i1-Q4_K_M: 18,8 GB; ~20-23 GB.
  - i1-Q6_K: 25,3 GB; ~27-30 GB.
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para i1-Q4_K_M o inferiores; dos RTX 3090 o una A6000 (48 GB) para i1-Q6_K; A100 40/80 GB y H100 para despliegues multiusuario con contexto amplio.
- Compatibilidad con GPU de consumo: sí para las variantes de hasta 18,8 GB en tarjetas de 24 GB (RTX 3090, 4090), y hasta i1-IQ3_XXS en tarjetas de 12-16 GB. Las variantes Q6_K no caben en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp, Ollama (mediante Modelfile sobre el GGUF), LM Studio, llama-cpp-python, text-generation-webui y servidores GGUF compatibles con la API de OpenAI. Para el modelo base sin cuantizar, vLLM o TGI serían las opciones habituales, sin confirmación en la documentación disponible.
- Latencia y throughput: no disponibles; dependerán del hardware, del backend y de la longitud de contexto, no documentada.

## Comparativa con modelos similares

No hay datos publicados del modelo base (contexto, licencia, benchmarks) que permitan una comparación rigurosa. A continuación se ofrecen referencias de la misma franja de tamano; los datos de las alternativas provienen de sus model cards públicas y no de la información proporcionada en esta búsqueda.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mia-v2-29B (i1-GGUF) | 30,7B | no disponible | Sí (según notas del cuantizador, requiere mmproj) | no disponible | GGUF en este repositorio; base en transformers |
| Qwen2.5-VL-32B-Instruct | 32B | 128k | Sí | Apache 2.0 | Pesos abiertos y cuantizaciones de terceros |
| Gemma 3 27B | 27B | 128k | Sí | Licencia Gemma | Pesos abiertos con restricciones de uso |
| Mistral Small 3.1 24B | 24B | 128k | Sí | Apache 2.0 | Pesos abiertos y cuantizaciones de terceros |

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si el uso comercial está permitido. Es un bloqueante para producción hasta aclararlo con el autor del modelo base.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones multimodales publicadas, por lo que no se puede estimar su calidad frente a alternativas.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está verificado y presumiblemente será inferior.
- Longitud de contexto desconocida, lo que impide planificar despliegues con documentos largos o conversaciones extensas.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación de factualidad disponible.
- Pérdida por cuantización: las variantes IQ2 e IQ3 (11-12 GB) degradan la calidad de forma apreciable; el propio cuantizador etiqueta i1-Q2_K_S como «very low quality» y recomienda IQ3_S o IQ3_XXS frente a Q3_K_M.
- Visión incompleta en este repositorio: los ficheros mmproj no están aquí; hay que acudir al repositorio estático. Sin ellos, el modelo funciona únicamente como modelo de texto.
- Adopción nula: 0 descargas y 0 «likes» en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte, informes de errores o recetas de despliegue de la comunidad.
- Trazabilidad limitada: no se documentan los datos de entrenamiento, por lo que no se pueden evaluar sesgos específicos ni riesgos de contaminación de benchmarks.
- Formato GGUF con soporte desigual en servidores de alto rendimiento: vLLM y TGI no ofrecen el mismo nivel de soporte para GGUF que llama.cpp, lo que limita el escalado en producción.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/Mia-v2-29B-i1-GGUF
- Cuantizaciones estáticas del mismo modelo (incluye ficheros mmproj): https://huggingface.co/mradermacher/Mia-v2-29B-GGUF
- Modelo base: https://huggingface.co/AIVORENCE/Mia-v2-29B
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Mia-v2-29B-i1-GGUF
- Peticiones de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede la infraestructura al cuantizador: https://www.nethype.de/
