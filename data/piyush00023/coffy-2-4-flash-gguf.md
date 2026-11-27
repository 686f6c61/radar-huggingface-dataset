# Piyush00023/coffy-2.4-flash-GGUF

## Resumen

coffy-2.4-flash-GGUF es la distribucion en formato GGUF del modelo coffy-2.4-flash, un modelo de lenguaje de 2.842.192.512 parametros (2,84B) publicado por el usuario Piyush00023 en Hugging Face. Se presenta como un modelo de arquitectura Sparse Mixture-of-Experts (MoE) orientado a inteligencia de codigo y flujos de trabajo agenticos, con licencia Apache-2.0 y pesos abiertos. El repositorio contiene exclusivamente archivos cuantizados en formato GGUF, pensados para su ejecucion con llama.cpp, Ollama, LM Studio o cualquier runtime compatible con GGUF.

El aspecto mas relevante de esta ficha es que la propia model card advierte de un problema critico: los pesos safetensors del modelo principal son la fuente de verdad, mientras que los archivos GGUF se restauraron a partir del historial de publicacion original y su metadato embebido (32 capas, valores de la epoca original) no coincide con los pesos restaurados. El recuento real de parametros es de 2,84B, pero la tabla de embeddings tiene 2048 filas mientras que el vocabulario del tokenizer es de 248k, lo que provoca que la generacion del modelo restaurado sea no coherente.

Por tanto, no se trata de un modelo listo para produccion: es una publicacion de pesos recuperados con calidad de generacion degradada, sin resultados de benchmarks declarados y con metadatos inconsistentes. Su interes actual es principalmente documental y de investigacion sobre el proceso de cuantizacion y restauracion, no como base para aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (MoE), transformer (detalles no disponibles) |
| Parametros totales | 2.842.192.512 (2,84B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q5_1, Q5_0, Q4_1, MXFP4, TQ2_0, TQ1_0 |
| Idiomas soportados | en, code |
| Licencia | Apache-2.0 (pesos abiertos, no open source segun la model card) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card describe coffy-2.4-flash como un modelo fundacional de 2,84B parametros con arquitectura Sparse Mixture-of-Experts, orientado a inteligencia de codigo y flujos agenticos. No se proporcionan detalles sobre el numero de expertos, la dimension del modelo, el numero de capas reales, la longitud de contexto nativa ni la composicion del dataset de entrenamiento. Tampoco se documenta si hubo fases de RLHF, DPO u otro tipo de alineamiento.

Un dato tecnico relevante es la inconsistencia estructural documentada: los metadatos GGUF indican 32 capas y valores de la publicacion original, pero no coinciden con los pesos restaurados. Ademas, la tabla de embeddings tiene 2048 filas frente a un vocabulario de tokenizer de 248k entradas, desajuste que explica la generacion no coherente. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto en ingles y codigo, segun los tags del repositorio.
- Orientacion declarada a inteligencia de codigo y flujos de trabajo agenticos (sin detalles verificables en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: declarado de forma generica en la model card, sin especificaciones.
- Capacidades multilingues: limitadas a ingles y codigo; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Advertencia: la generacion del modelo restaurado es no coherente, por lo que las capacidades anteriores no son utilizables en la practica con estos pesos.

## Casos de uso

- Investigacion sobre cuantizacion GGUF: el repositorio ofrece un conjunto amplio de cuantizaciones (desde F16 hasta TQ1_0) que permite estudiar el impacto del nivel de cuantizacion en el tamano y el comportamiento de carga de un modelo MoE de 2,84B.
- Analisis de restauracion de pesos: util para estudiar como se recuperan artefactos a partir del historial de publicacion y que problemas de metadatos y desajuste de vocabulario pueden aparecer.
- Pruebas de compatibilidad de runtimes: sirve para validar que llama.cpp, Ollama o LM Studio cargan correctamente archivos GGUF con metadatos inconsistentes y como se comportan ante ellos.
- Docencia sobre formatos de pesos: ejemplo practico de diferencias entre F16, BF16, Q8_0, Q5_1, Q4_1, MXFP4 y cuantizaciones ternarias (TQ2_0, TQ1_0) en terminos de tamano de archivo.
- Evaluacion de pipelines de validacion de modelos: caso de estudio para disenar comprobaciones automaticas que detecten desajustes entre vocabulario del tokenizer y filas de la tabla de embeddings antes de desplegar.
- Referencia negativa en produccion: no recomendado para atencion al cliente, generacion de codigo en CI/CD, agentes autonomos ni ninguna tarea que requiera salidas coherentes, dado el estado documentado de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclaman resultados de benchmarks para esta publicacion.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de archivo como referencia): F16/BF16 5,68 GB; Q8_0 3,02 GB; Q5_1 2,13 GB; Q5_0 1,95 GB; Q4_1 1,78 GB; MXFP4 1,51 GB; TQ2_0 0,74 GB; TQ1_0 0,61 GB.
- GPU recomendadas: no disponibles de forma especifica en la informacion proporcionada. Por tamano, las cuantizaciones Q4_1 y superiores caben en GPUs de consumo con 8 GB o mas de VRAM; las variantes ternarias (TQ2_0, TQ1_0) caben en GPUs con 2-4 GB.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060/4060 (8-12 GB) para Q4_1 y Q5_0, y en GPUs de gama baja para las variantes ternarias.
- Opciones de despliegue: llama.cpp (llama-cli, llama-cpp-python), Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles.
- Nota: el repositorio ocupa 23,1 GB en total por incluir todas las cuantizaciones; solo es necesario descargar el archivo concreto que se vaya a usar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| coffy-2.4-flash-GGUF | 2,84B (MoE) | no disponible | Apache-2.0 | GGUF | Generacion no coherente documentada |
| Modelo base coffy-2.4-flash | 2,84B (MoE) | no disponible | Apache-2.0 | safetensors | Fuente de verdad |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Generacion no coherente: la model card advierte que los pesos restaurados de 2,84B cargan y generan, pero la salida no es coherente debido al desajuste entre la tabla de embeddings (2048 filas) y el vocabulario del tokenizer (248k).
- Metadatos GGUF inconsistentes: los archivos reflejan la publicacion original (32 capas, valores de la epoca) y no los pesos restaurados.
- Sin benchmarks: no se reclaman resultados de evaluacion para esta publicacion.
- Idiomas limitados: solo ingles y codigo; no hay soporte multilingue declarado.
- Licencia: Apache-2.0, pero la model card matiza que son pesos abiertos, no open source; conviene revisar el archivo LICENSE para uso comercial.
- Riesgo de alucinacion y sesgos: no documentados de forma especifica, pero agravados por el estado no coherente de la generacion.
- No apto para produccion: no debe desplegarse en aplicaciones reales en su estado actual.
- Contexto nativo: no disponible, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Piyush00023/coffy-2.4-flash-GGUF
- Modelo base: https://huggingface.co/Piyush00023/coffy-2.4-flash
- Seccion de arquitectura del modelo base: https://huggingface.co/Piyush00023/coffy-2.4-flash#architecture
- Seccion de limitaciones del modelo base: https://huggingface.co/Piyush00023/coffy-2.4-flash#limitations
- Licencia: https://huggingface.co/Piyush00023/coffy-2.4-flash-GGUF/blob/main/LICENSE
- Contacto del autor: piyushdas000@gmail.com
