# gplsi/Aitana-2B-S-Instruct

## Resumen

Aitana-2B-S-Instruct es un modelo de lenguaje generativo ajustado por instrucciones, perteneciente a la familia Aitana y desarrollado por el GPLSI (Grupo de Procesamiento del Lenguaje y Sistemas de Informacion) de la Universidad de Alicante. Se construye sobre el modelo base gplsi/Aitana-2B-S-base y se ha afinado para seguir instrucciones en valenciano, castellano e ingles, con un enfasis particular en mejorar las capacidades en valenciano.

El modelo cuenta con aproximadamente 2.250 millones de parametros (2.253.490.176 segun los pesos en safetensors) y una arquitectura transformer decoder-only. Su principal valor diferencial es el soporte nativo del valenciano en un contexto de instrucciones, un idioma con escasa representacion en los modelos generativos de gran escala. La licencia Apache 2.0 facilita su adopcion en entornos comerciales y de investigacion.

La relevancia actual del modelo radica en la combinacion de un tamano compacto (2B), que permite despliegue en hardware modesto, con un ajuste fino orientado a instrucciones y a un idioma minoritario. Esto lo hace util para administraciones publicas, entornos legales y turisticos en la Comunidad Valenciana, asi como para investigacion en tecnologias del lenguaje de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 2.253.490.176 (~2,25B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | valenciano (ca/va), castellano (es), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 2,25B de parametros, derivado del modelo base gplsi/Aitana-2B-S-base-1.0. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni numero de tokens de entrenamiento del modelo base en la informacion proporcionada.

El ajuste fino por instrucciones se realizo sobre el dataset ALIA Instruction/v12, compuesto por 19 subconjuntos que incluyen OpenAssistant (OASST1 y OASST2), M-Personas, RAG Multilingual, FLORES, Aya Dataset, TowerBlocks, MentorES/MentorCA, Dolly, Alpaca, GSM8K, OpenOrca, No Robots, CoQCat, BOUA, SciFact, LingComp QA, Instruct Legal Refugiados y Amic-Paralelo. Los datos abarcan valenciano, castellano, ingles y, en menor medida, catalan. Segun la model card, los datos en catalan se eliminaron del ajuste por instrucciones para centrarse en valenciano, castellano e ingles, aunque parte del catalan persiste en los datasets multilingues. No se especifica si se aplicaron tecnicas de RLHF o DPO, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Generacion de texto y seguimiento de instrucciones en valenciano, castellano e ingles.
- Conversacion multiturno con soporte multilingue.
- Generacion de texto condicionada por prompts especificos de tarea.
- Aplicaciones de dominio en contextos administrativos, legales y turisticos.
- Razonamiento basico y resolucion de problemas matematicos (incluye GSM8K en el dataset de entrenamiento).
- Capacidad de responder preguntas de comprension lectora y verificacion de hechos (SciFact, LingComp QA).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Atencion al ciudadano en la Comunidad Valenciana: el modelo puede gestionar consultas administrativas en valenciano y castellano, aprovechando su ajuste sobre datos de dominio administrativo (BOUA) y legal (Instruct Legal Refugiados).
- Asistencia en tramites legales: con datos de entrenamiento especificos del ambito juridico y de refugiados, puede redactar borradores o responder preguntas frecuentes en valenciano y castellano.
- Turismo y hosteleria: la familia Aitana incluye variantes orientadas a turismo; este modelo puede emplearse en chatbots de informacion turistica multilingue para la Comunidad Valenciana.
- Generacion de contenido en valenciano: redaccion de textos, resumenes y respuestas para medios o administraciones que necesitan producir contenido en valenciano con calidad aceptable.
- Educacion y mentorizacion: el uso de MentorES/MentorCA en el entrenamiento permite emplearlo como asistente educativo que explica conceptos y resuelve dudas en castellano y valenciano.
- Investigacion en tecnologias del lenguaje de bajos recursos: sirve como base para experimentos de ajuste fino en valenciano y otras lenguas minoritarias, gracias a su licencia Apache 2.0 y su tamano manejable.
- Prototipado rapido de asistentes conversacionales: su tamano de 2B permite desplegarlo en una unica GPU consumer para pruebas de concepto y demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB en bf16/fp16 (2,25B parametros x 2 bytes); en cuantizacion de 8 bits, alrededor de 2,3 GB; en 4 bits, alrededor de 1,2 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: A100, H100, L40S para despliegue en produccion con bf16; RTX 4090, RTX 3090, RTX 4080 para inferencia en bf16 en una sola GPU.
- Cabe en GPU consumer: si, en tarjetas con al menos 6-8 GB de VRAM en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.); en cuantizacion 4 bits cabe en GPUs con 4 GB o menos.
- Opciones de despliegue: Transformers (pipeline de text-generation), text-generation-inference (TGI, segun los tags del repo), endpoints compatibles; vLLM, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aitana-2B-S-Instruct | ~2,25B | no disponible | ca/va, es, en | Apache 2.0 | Hugging Face |
| Aitana-7B-S-Instruct | ~7B (no confirmado) | no disponible | ca/va, es, en | no disponible en la informacion | Hugging Face |
| Aitana-2B-S-base | ~2,25B | no disponible | ca/va, es, en | no disponible en la informacion | Hugging Face |
| Aitana-2B-S-tourism-base | ~2,25B (no confirmado) | no disponible | ca/va, es, en | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no esta disenado como base de conocimiento factual; puede generar informacion incorrecta o inventada (alucinaciones).
- Aunque se entreno para valenciano, castellano e ingles, los datos en catalan se eliminaron parcialmente; puede haber interferencia o comportamientos inconsistentes entre catalan y valenciano.
- No se especifica la longitud de contexto soportada, lo que limita la planificacion de aplicaciones con documentos largos.
- No hay informacion publica sobre sesgos de genero, raza u otros sesgos sociales; se recomienda evaluacion especifica antes de uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios no representados en el entrenamiento.
- El modelo tiene un tamano reducido (2B), por lo que su capacidad de razonamiento complejo y conocimiento general es inferior a la de modelos de mayor escala.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre rendimiento en despliegues de alto throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gplsi/Aitana-2B-S-Instruct
- Coleccion Aitana en Hugging Face: https://huggingface.co/collections/gplsi/aitana
- Modelo base: https://huggingface.co/gplsi/Aitana-2B-S-base-1.0
- Modelo Aitana-7B-S-Instruct: https://huggingface.co/gplsi/Aitana-7B-S-Instruct
- Modelo Aitana-2B-S-tourism-base: https://huggingface.co/gplsi/Aitana-2B-S-tourism-base
- GPLSI (Universidad de Alicante): https://gplsi.dlsi.ua.es/
- Paper sobre sesgos de genero con Aitana: https://aclanthology.org/2025.gebnlp-1.39.pdf
