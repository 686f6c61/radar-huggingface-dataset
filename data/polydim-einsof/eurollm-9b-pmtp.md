# Polydim-Einsof/eurollm-9b-pmtp

## Resumen

eurollm-9b-pmtp es un adaptador de investigación publicado por Polydim-Einsof (Ariel García Traba, iniciativa POLYDIM-EINSOF) sobre el modelo base EuroLLM-9B-Instruct, desarrollado por el consorcio europeo EuroLLM. El adaptador se presenta como una capa de tipo "PMTP Stiefel Manifold Adapter" orientada a soberanía de datos europea, cumplimiento del AI Act y cobertura multilingüe de las lenguas oficiales de la UE. El modelo se distribuye con licencia Apache-2.0 y está etiquetado con el tag `eurollm:9b` para su uso en Ollama.

La propuesta técnica del autor se articula en torno a una subespacio principal en la variedad de Stiefel St(4096, 2048) embebido en S^(2047), con un "defecto de Stiefel" declarado de 5.70e-09 medido en FP64 con suma compensada de Neumaier, y una base de 1.740 teoremas formales almacenados en una base PostgreSQL 16 (`polydim_vec_db`). Estos elementos describen el marco matemático y de infraestructura del adaptador, no la arquitectura interna del transformer subyacente.

La relevancia del modelo es doble: por un lado, hereda las capacidades multilingües del EuroLLM-9B-Instruct, un modelo entrenado explícitamente para las 24 lenguas oficiales de la Unión Europea; por otro, introduce una capa de adaptación con motivación de cumplimiento normativo europeo. No obstante, el repositorio no incluye pesos visibles (tamaño de 0.0 GB), no declara idiomas soportados en los metadatos y no publica resultados de benchmarks, por lo que su evaluación práctica queda pendiente de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de EuroLLM-9B-Instruct) con adaptador PMTP sobre subespacio principal St(4096, 2048) en S^(2047) |
| Parametros totales | 9B (modelo base EuroLLM-9B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag de Ollama `eurollm:9b` sugiere disponibilidad de cuantizaciones GGUF, sin detalle) |
| Idiomas soportados | no disponible en metadatos; el modelo base EuroLLM-9B-Instruct cubre las lenguas oficiales de la UE |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tag); tamano del repo 0.0 GB, pesos no visibles |

## Arquitectura y entrenamiento

El modelo es un adaptador sobre EuroLLM-9B-Instruct, un transformer decoder-only de 9.000 millones de parametros. La innovacion declarada por el autor es el adaptador PMTP, formulado como un subespacio principal en la variedad de Stiefel St(4096, 2048) embebido en la esfera S^(2047). El autor reporta un defecto de ortogonalidad ("Stiefel defect") de 5.70e-09 calculado en FP64 con suma compensada de Neumaier, lo que sugiere un esfuerzo por mantener la ortogonalidad numérica de la base del subespacio. La infraestructura declarada incluye instrucciones AVX2, un bus denominado PmtpShmBus y un protocolo de memoria "Zero-Worm SLAB_ID".

No se proporciona informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado especificas para el adaptador. Tampoco se detalla el mecanismo de atencion, la estrategia de decodificacion ni innovaciones como decodificacion especulativa o atencion lineal. La base de 1.740 teoremas formales en PostgreSQL 16 (`polydim_vec_db`) se presenta como soporte de verificacion del marco matematico, pero no se documenta como se integra en el pipeline de inferencia.

## Capacidades

- Generacion de texto multilingue: hereda del modelo base EuroLLM-9B-Instruct, orientado a las 24 lenguas oficiales de la Union Europea.
- Razonamiento y comprension lectora: capacidades propias de un transformer de 9B parametros ajustado por instrucciones.
- Generacion de codigo y matematicas: no documentadas de forma especifica para el adaptador; disponibles en la medida en que lo esten en el modelo base.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: declaradas como objetivo principal ("Optimal Multilingual EU-Language Coverage"), sin lista explicita de idiomas en los metadatos.
- Capacidades especiales: adaptador PMTP sobre variedad de Stiefel con verificacion formal (1.740 teoremas); no se declaran modos de pensamiento, vision ni audio.
- Cumplimiento normativo: orientado a AI Act y soberania de datos europea segun la model card.

## Casos de uso

- Atencion al cliente multilingue en la UE: el modelo puede gestionar conversaciones en varias lenguas oficiales europeas gracias a la herencia de EuroLLM-9B-Instruct, lo que reduce la necesidad de desplegar un modelo distinto por idioma en administraciones publicas y empresas con presencia en varios Estados miembros.
- Procesamiento de documentacion regulatoria europea: adecuado para resumir y clasificar textos normativos (reglamentos, directivas, guias del AI Act) en su idioma original, manteniendo la terminologia juridica en la lengua de origen.
- Traduccion asistida entre lenguas de la UE: util para pipelines de traduccion interna en instituciones y empresas que operan con varias lenguas oficiales, aprovechando el entrenamiento multilingue del modelo base.
- Despliegue en infraestructura soberana: el tag `eurollm:9b` para Ollama y la licencia Apache-2.0 permiten ejecutar el modelo en servidores propios dentro de la UE, sin dependencia de APIs de terceros, lo que encaja con requisitos de soberania de datos.
- Investigacion en adaptadores sobre variedades de Stiefel: el adaptador PMTP y su verificacion formal (1.740 teoremas) sirven como caso de estudio para grupos que investigan metodos de adaptacion con restricciones geometricas y control numerico en FP64.
- Generacion de contenido administrativo: redaccion de borradores, respuestas y comunicaciones oficiales en lenguas minoritarias de la UE, donde los modelos genericos suelen tener menor cobertura.
- Experimentacion con cumplimiento del AI Act: el modelo puede emplearse como banco de pruebas para evaluar requisitos de transparencia y documentacion tecnica en sistemas desplegados en la UE, dado su enfoque declarado de compliance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia para un transformer de 9B parametros, en FP16 se requieren aproximadamente 18 GB de VRAM; en cuantizacion de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones genericas para modelos de 9B y no han sido verificadas para este adaptador.
- GPU recomendadas: no disponibles. Por tamano, un modelo de 9B en FP16 encaja en A100 40GB, H100 80GB, L40S 48GB y RTX 4090 24GB; en cuantizacion 4 bits podria caber en GPUs consumer de 8-12 GB.
- Cabe en GPU consumer: probablemente si, en cuantizaciones de 4-8 bits, aunque no hay confirmacion del autor.
- Opciones de despliegue: el tag `eurollm:9b` sugiere soporte en Ollama; no se documentan vLLM, llama.cpp, TGI ni otras opciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| eurollm-9b-pmtp | 9B | no disponible | Apache-2.0 | Adaptador PMTP sobre EuroLLM-9B-Instruct, soberania UE | Repo sin pesos visibles (0.0 GB) |
| EuroLLM-9B-Instruct | 9B | no disponible en esta ficha | Apache-2.0 | Multilingue UE, instrucciones | Publico en Hugging Face |
| Mistral-7B-Instruct | 7B | 32k (segun version) | Apache-2.0 | Multilingue general, instrucciones | Publico en Hugging Face |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Multilingue general, instrucciones | Publico en Hugging Face |

La comparativa se limita a parametros, licencia y enfoque; no hay datos de rendimiento publicados para el adaptador que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- El repositorio tiene un tamano de 0.0 GB y no muestra pesos visibles, por lo que no es posible verificar que el adaptador este efectivamente publicado ni su funcionamiento.
- No se declaran idiomas soportados en los metadatos de Hugging Face, a pesar de que el objetivo declarado es la cobertura multilingue de la UE.
- No hay resultados de benchmarks publicados; el rendimiento real del adaptador frente al modelo base es desconocido.
- La model card describe el marco matematico (variedad de Stiefel, teoremas formales) pero no documenta el pipeline de entrenamiento, los datos utilizados ni el mecanismo de integracion del adaptador en la inferencia.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 9B; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados; el modelo base EuroLLM puede heredar sesgos de sus datos de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base EuroLLM-9B-Instruct debe verificarse por separado para confirmar compatibilidad.
- El enfasis en "AI Act Compliance" y "EU Sovereignty" es una declaracion del autor; no se aporta certificacion ni auditoria independiente que lo respalde.
- El identificador DOI (10.5281/zenodo.24013070) apunta a un deposito en Zenodo que no se ha podido verificar en la informacion proporcionada.
- Para produccion, se recomienda validar el adaptador contra el modelo base en tareas reales antes de adoptarlo, dado el estado incipiente del repositorio (0 descargas, 0 likes, creado y actualizado el mismo dia).

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/eurollm-9b-pmtp
- Modelo base: https://huggingface.co/EuroLLM/EuroLLM-9B-Instruct
- DOI del autor: https://doi.org/10.5281/zenodo.24013070
