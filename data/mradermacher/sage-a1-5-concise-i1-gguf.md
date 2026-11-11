# mradermacher/Sage-A1.5-Concise-i1-GGUF

## Resumen

Sage-A1.5-Concise-i1-GGUF es una cuantizacion en formato GGUF del modelo TheFusionCube/Sage-A1.5-Concise, publicada por el usuario mradermacher. Se trata de un modelo de arquitectura MoE (mixture of experts) orientado a razonamiento eficiente y afinado mediante aprendizaje por refuerzo, con 35.505.251.456 parametros totales segun los datos de safetensors del modelo base. La model card lo etiqueta como modelo de vision, aunque los ficheros mmproj (si existen) se alojan en el repositorio estatico separado.

El interes de esta publicacion es practico: ofrece cuantizaciones con imatrix (matriz de importancia) para reducir el peso del modelo a aproximadamente 13,3 GB en i1-Q2_K, lo que permite ejecutar un modelo de 35,5 mil millones de parametros en hardware de consumo mediante llama.cpp y derivados. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo solo declara soporte para ingles.

La informacion publicada es muy limitada: no se detallan datos de entrenamiento, composicion del dataset, resultados de benchmarks ni el numero de parametros activos del MoE. Esta ficha refleja unicamente lo disponible en la model card y los metadatos de Hugging Face, marcando explicitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer; detalles de capas y expertos no disponibles |
| Parametros totales | 35.505.251.456 (35,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (13,3 GB) publicado; la model card lista ademas IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K como quants generados (no todos con enlace publicado en este repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); incluye fichero imatrix de 0,5 GB para generar cuantizaciones propias |

## Arquitectura y entrenamiento

El modelo base es un MoE con 35,5 mil millones de parametros totales, segun los metadatos de safetensors. La model card lo etiqueta con las tags `moe`, `reasoning`, `efficient-reasoning` y `reinforcement-learning`, lo que sugiere un entrenamiento con tecnicas de RL orientadas a producir cadenas de razonamiento mas concisas o eficientes, pero no se especifica el algoritmo concreto (PPO, GRPO, DPO u otro), ni el volumen de datos de entrenamiento, ni la composicion del dataset.

Esta publicacion concreta es una cuantizacion, no un modelo entrenado desde cero: mradermacher ha aplicado cuantizacion con imatrix (matriz de importancia calculada sobre el modelo original) para preservar la calidad en tasas de bits bajas. El repositorio incluye el fichero `Sage-A1.5-Concise.imatrix.gguf` de 0,5 GB para que terceros puedan generar sus propias cuantizaciones. No se han publicado detalles sobre innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, segun la tag `conversational`.
- Razonamiento explicito con enfasis en eficiencia (`efficient-reasoning`), presumiblemente cadenas de pensamiento mas cortas que modelos de razonamiento convencionales.
- Capacidad multimodal de vision: la model card indica explicitamente "This is a vision model", aunque los ficheros mmproj se alojan en el repositorio estatico separado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque la tag `reasoning` sugiere capacidades de este tipo.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking explicito: no disponible.

## Casos de uso

- Razonamiento eficiente en produccion: el enfasis del modelo en cadenas de razonamiento concisas lo hace adecuado para pipelines donde el coste por token de salida importa, como clasificacion compleja o extraccion estructurada con justificacion breve.
- Despliegue local en estaciones de trabajo: con la cuantizacion i1-Q2_K de 13,3 GB, puede ejecutarse en GPUs de consumo de gama alta (24 GB de VRAM) o en configuraciones CPU+GPU mediante llama.cpp, permitiendo prototipado sin infraestructura cloud.
- Asistentes conversacionales en ingles: la tag `conversational` y la licencia Apache 2.0 permiten integrarlo en productos de atencion al cliente o asistentes internos sin restricciones comerciales.
- Procesamiento de documentos con componente visual: al declararse modelo de vision, puede emplearse para tareas de comprension de imagenes o documentos escaneados, siempre que se descarguen los ficheros mmproj del repositorio estatico.
- Investigacion sobre razonamiento con RL: util para reproducir o comparar tecnicas de reinforcement learning aplicadas a la concision del razonamiento, dado el etiquetado del modelo.
- Generacion de cuantizaciones propias: el fichero imatrix publicado permite a equipos de infraestructura generar variantes GGUF ajustadas a sus requisitos de VRAM y latencia.
- Evaluacion comparativa de MoE de ~35B: sirve como referencia para medir el impacto de la cuantizacion con imatrix frente a cuantizaciones estaticas (disponibles en el repositorio hermano de mradermacher).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 13,3 GB para la cuantizacion i1-Q2_K publicada; el modelo sin cuantizar requeriria del orden de 70 GB en FP16 (35,5B parametros x 2 bytes), aunque no se confirma el formato original.
- GPU recomendadas: para i1-Q2_K, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deja margen para contexto; GPUs profesionales como A100 o H100 permiten cuantizaciones mayores (Q4_K_M, Q5_K_M, Q6_K) con mayor calidad.
- Cabe en GPU de consumo: si, en GPUs de 16-24 GB con la cuantizacion Q2; las cuantizaciones Q4 o superiores requieren 20-24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; la tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo original en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sage-A1.5-Concise-i1-GGUF | 35,5B (MoE) | no disponible | Apache 2.0 | GGUF | Cuantizacion imatrix; solo ingles; vision declarada |
| Sage-A1.5-Concise (base) | 35,5B (MoE) | no disponible | Apache 2.0 | safetensors | Modelo original de TheFusionCube |
| Sage-A1.5-Concise-GGUF (estatico) | 35,5B (MoE) | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo autor, incluye mmproj |

No se dispone de informacion suficiente para comparar con alternativas de otros desarrolladores (por ejemplo, otros MoE de ~30-40B) en terminos de rendimiento, ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento, codigo o matematicas es desconocido.
- La cuantizacion i1-Q2_K es agresiva (aproximadamente 3 bits por peso); puede degradar la calidad respecto al modelo original, especialmente en tareas de razonamiento sensible a la precision.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Aunque la licencia es Apache 2.0, conviene verificar los terminos del modelo base y de los datos de entrenamiento originales antes de un despliegue comercial.
- La funcionalidad de vision requiere descargar los ficheros mmproj desde el repositorio estatico; no estan incluidos en este repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del funcionamiento.
- La fecha de creacion (2026-11-11) y la escasa documentacion aconsejan tratar el modelo con cautela en entornos de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Sage-A1.5-Concise-i1-GGUF
- Modelo base: https://huggingface.co/TheFusionCube/Sage-A1.5-Concise
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Sage-A1.5-Concise-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Sage-A1.5-Concise-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
