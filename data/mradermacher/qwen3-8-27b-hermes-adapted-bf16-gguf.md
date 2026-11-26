# mradermacher/Qwen3.8-27B-hermes-adapted-bf16-GGUF

## Resumen

Qwen3.8-27B-hermes-adapted-bf16-GGUF es la distribucion en formato GGUF del modelo prithivMLmods/Qwen3.8-27B-hermes-adapted-bf16, publicada por el usuario mradermacher, conocido por producir cuantizaciones estaticas de modelos abiertos. El modelo base es un Qwen de tercera generacion (familia Qwen3.8) de 27.320.697.856 parametros (aproximadamente 27,3 mil millones), afinado con tecnicas de RL (GRPO y async-GRPO) y LoRA sobre datasets orientados a agentes (harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments). La etiqueta "hermes" sugiere un ajuste orientado a seguir formatos conversacionales y de funcionamiento agentico.

El interes de esta publicacion reside en que ofrece el modelo en multiples niveles de cuantizacion GGUF (desde Q2_K hasta Q8_0, ademas de IQ4_XS y los complementos multimodales mmproj en Q8_0 y f16), lo que permite desplegarlo en hardware de consumo y en entornos de inferencia con llama.cpp u Ollama. El repositorio pesa 192,3 GB en total, aunque cada archivo individual ocupa entre 11,3 GB (Q2_K) y 29,1 GB (Q8_0).

La licencia es Apache 2.0, lo que facilita el uso comercial. El modelo esta etiquetado como compatible con text-generation-inference y con capacidades multimodales (los archivos mmproj), aunque la informacion disponible no detalla la arquitectura interna ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.8; transformer, segun la libreria transformers) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en bf16 |

## Arquitectura y entrenamiento

No se dispone de detalles tecnicos sobre la arquitectura interna del modelo base en la informacion proporcionada. Por la nomenclatura (Qwen3.8, 27B) y la libreria declarada (transformers), se trata de un transformer de la familia Qwen3, pero no se confirma si emplea atencion lineal, decodificacion especulativa nativa u otras innovaciones. Las etiquetas del repositorio incluyen "mtp" y "speculative-decoding", lo que sugiere soporte de decodificacion especulativa en el ecosistema de inferencia, aunque no se especifica como se implementa.

El ajuste del modelo base se realizo con GRPO y async-GRPO (variantes de aprendizaje por refuerzo con verificacion de recompensas) combinados con LoRA. Los datasets de entrenamiento estan orientados a agentes y a evaluacion de terminal (scale800-harbor, harness-adapters, termgrade-train-harbor y termgrade-environments), lo que indica un enfasis en tareas de ejecucion de comandos, uso de herramientas y entornos tipo harbor/openenv. No se indica el numero de tokens de entrenamiento ni la composicion exacta del corpus.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (pipeline conversational).
- Capacidades agenticas: el ajuste sobre datasets de tipo harness y harbor apunta a uso de herramientas, ejecucion de comandos y resolucion de tareas multi-paso.
- Soporte multimodal: los archivos mmproj (Q8_0 y f16) permiten entrada de imagenes en el ecosistema llama.cpp.
- Decodificacion especulativa: las etiquetas mtp y speculative-decoding indican compatibilidad con tecnicas de aceleracion de inferencia.
- Compatibilidad con text-generation-inference y con el ecosistema GGUF (llama.cpp, Ollama, etc.).
- No se confirma soporte de tool calling estructurado ni de function calling en la informacion disponible.
- No se confirma modo de razonamiento explicito (thinking mode) ni capacidades de audio.

## Casos de uso

- Agentes de automatizacion de terminal: el ajuste sobre termgrade y harness permite usar el modelo para interpretar salidas de shell, proponer comandos y corregir errores en bucles de ejecucion, aprovechando el entrenamiento especifico en entornos de terminal.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (17,1 GB) y Q4_K_S (15,9 GB) permiten ejecutar el modelo en GPUs de 24 GB (RTX 3090/4090) con llama.cpp u Ollama, algo inviable con el bf16 original.
- Prototipado de asistentes conversacionales en ingles: el formato conversational y la licencia Apache 2.0 facilitan integrar el modelo en productos internos sin restricciones de uso comercial.
- Evaluacion de pipelines agenticos: al estar afinado sobre harness-adapters y scale800-harbor, sirve como banco de pruebas para comparar estrategias de uso de herramientas frente a modelos base sin ajuste.
- Tareas multimodales ligeras: con los archivos mmproj, puede procesar imagenes junto a texto en aplicaciones de descripcion o extraccion de informacion, siempre que el frontend (llama.cpp) lo soporte.
- Inferencia de bajo coste en servidores con una sola GPU: el formato GGUF y la compatibilidad con TGI y llama.cpp permiten servir el modelo en una A100 40 GB o en una RTX 4090 con cuantizaciones Q5/Q6, reduciendo el coste frente al bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del archivo GGUF mas overhead de contexto):
  - Q2_K: ~11,3 GB
  - Q3_K_S: ~12,4 GB
  - Q3_K_M: ~13,8 GB
  - Q3_K_L: ~15,0 GB
  - IQ4_XS: ~15,8 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~17,1 GB
  - Q5_K_S: ~19,1 GB
  - Q5_K_M: ~19,7 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - mmproj Q8_0: ~0,7 GB; mmproj f16: ~1,0 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0; para Q8_0 con contexto largo conviene A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (etiqueta endpoints_compatible), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted-bf16-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Ajuste agentico con GRPO/LoRA; multimodales via mmproj |
| Modelo base prithivMLmods/Qwen3.8-27B-hermes-adapted-bf16 | 27,3 B | no disponible | Apache 2.0 | bf16 | Version sin cuantizar; requiere mas VRAM |
| Cuantizaciones i1 (imatrix) del mismo modelo | 27,3 B | no disponible | Apache 2.0 | GGUF | Publicadas en mradermacher/Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF; calidad superior por tamano |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta verificado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido incorrecto, especialmente en tareas de terminal o ejecucion de comandos, donde un error puede tener consecuencias reales.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribucion y las condiciones de los datasets de entrenamiento.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente el rendimiento; se recomienda Q4_K_M o superior para produccion.
- El modelo es una cuantizacion de terceros; no hay garantia de que el proceso de cuantizacion preserve todas las capacidades del original bf16.
- No se confirma soporte de tool calling estructurado ni de function calling nativo, lo que limita su uso en pipelines agenticos que dependan de esquemas JSON estrictos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-hermes-adapted-bf16-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.8-27B-hermes-adapted-bf16
- Cuantizaciones i1 (imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Qwen3.8-27B-hermes-adapted-bf16-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
