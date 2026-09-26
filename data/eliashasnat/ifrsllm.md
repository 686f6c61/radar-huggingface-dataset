# eliashasnat/ifrsllm

## Resumen

IFRSLLM es un modelo de lenguaje ajustado por dominios para tareas de contabilidad bajo normas NIIF/IFRS, servicios financieros, banca y lenguaje financiero especializado. Lo desarrolla Elias Hasnat y se distribuye en Hugging Face bajo el identificador `eliashasnat/ifrsllm`. El modelo se ha entrenado mediante ajuste supervisado (Supervised Fine-Tuning, SFT) con TRL sobre un conjunto de instrucciones de dominio de aproximadamente 20.000 ejemplos con estructura tipo Alpaca.

El problema que aborda es la adaptacion de un modelo compacto a la terminologia y los patrones de razonamiento del reporting financiero: explicacion de conceptos IFRS, resumen de estados financieros, conceptos de IFRS 9 y perdida crediticia esperada (ECL), interpretacion de datos financieros, indicadores de riesgo, redaccion de PII y tareas de cumplimiento normativo. La tesis del proyecto es separar responsabilidades: el ajuste fino ensena al modelo *como* responder, mientras que una capa de generacion aumentada por recuperacion (RAG) aporta *que* informacion es autoritativa y vigente.

Su relevancia actual reside en el enfoque hibrido que propone: ajuste fino de dominio mas RAG autoritativo, reranking con cross-encoder, control de versiones de las normas, citas verificables y guardrails. Esta separacion es especialmente importante en IFRS porque las normas, enmiendas, interpretaciones y fechas de entrada en vigor cambian con el tiempo y varian por jurisdiccion. La model card no especifica el modelo base, el numero de parametros ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica la arquitectura base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el campo de idiomas figura como no disponible) |
| Licencia | other (licencia personalizada; consultar los terminos del repositorio) |
| Formato de pesos | safetensors (segun las etiquetas del repositorio; libreria transformers) |
| Metodo de entrenamiento | SFT (Supervised Fine-Tuning) con TRL + Transformers |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | question-answering |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura subyacente del modelo (no se indica si es un transformer denso, MoE o hibrido), ni el modelo base sobre el que se ha hecho el ajuste. Lo que si se documenta es el procedimiento de adaptacion: ajuste supervisado con TRL sobre aproximadamente 20.000 pares instruccion-respuesta en formato Alpaca (`instruction`, `input`, `output`). El dataset es sintetico y orientado a dominio, y segun el autor esta pensado para ensenar patrones de respuesta y comportamiento de seguimiento de instrucciones, no para constituir una base de conocimiento IFRS autoritativa.

El conjunto de entrenamiento cubre explicacion de conceptos IFRS, resumen de estados financieros, conceptos de IFRS 9 y ECL, terminologia contable, atencion al cliente bancario, interpretacion de datos financieros, indicadores de riesgo financiero, redaccion de PII, tareas de cumplimiento, respuestas financieras estructuradas, comunicacion con clientes y question answering de banca y finanzas. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el volumen de tokens de entrenamiento.

La innovacion tecnica destacable no esta en el modelo en si, sino en la arquitectura RAG prevista en la que IFRSLLM actua como capa de generacion. Esa arquitectura incluye clasificacion de consulta, reescritura de consulta, recuperacion hibrida (BM25 + busqueda vectorial), fusion de resultados mediante Reciprocal Rank Fusion (RRF), reranking con cross-encoder, construccion de contexto IFRS, generacion y validacion de grounding y citas. El sistema de recuperacion se disena para indexar materiales por norma IFRS, norma IAS, interpretacion IFRIC, tema, parrafo, fecha de vigencia, periodo de reporte, version de enmienda, jurisdiccion, tipo de documento y fuente, habilitando consultas sensibles al tiempo (que guia aplicaba en un periodo de reporte concreto) y, como extension futura, sensibles a la jurisdiccion.

## Capacidades

- Generacion de texto y respuestas de question answering en el dominio de contabilidad IFRS, banca y finanzas.
- Explicacion de conceptos contables y de normas (por ejemplo, IFRS 9 y perdida crediticia esperada).
- Resumen de estados financieros y de informacion financiera estructurada.
- Interpretacion de datos financieros e indicadores de riesgo.
- Redaccion de informacion personal identificable (PII) en contextos financieros.
- Tareas de cumplimiento normativo y respuesta estructurada con fines de compliance.
- Redaccion de comunicaciones con clientes en contexto bancario.
- Integracion como capa de generacion dentro de pipelines RAG con recuperacion hibrida, reranking y validacion de citas.
- Seguimiento de instrucciones en formato Alpaca (instruccion, entrada, salida).
- Soporte de tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (el campo de idiomas no esta especificado).
- Capacidades especiales (modo thinking, vision, audio): no disponible (no documentadas).

## Casos de uso

- Asistente interno de consulta contable: desplegado como capa de generacion de un RAG sobre normativa IFRS autorizada, responde a preguntas de contabilidad con contexto recuperado, citas y validacion de grounding, de modo que el equipo financiero obtiene respuestas trazables en lugar de texto generado sin respaldo.
- Explicacion de IFRS 9 y perdida crediticia esperada: el modelo esta ajustado especificamente en conceptos de ECL y deterioro, por lo que puede usarse para producir explicaciones introductorias y material de formacion para equipos de riesgo y analistas junior.
- Resumen de estados financieros: a partir de estados y notas de un ejercicio, el modelo puede generar resumenes estructurados que faciliten la revision preliminar antes de la validacion por un contable o auditor.
- Atencion al cliente bancario: redaccion de respuestas a consultas de clientes sobre productos, comisiones y conceptos financieros, aprovechando el ajuste en comunicacion con clientes y terminologia financiera.
- Redaccion y anonimizacion de PII: el modelo ha sido entrenado en tareas de redaccion de informacion personal identificable, lo que permite usarlo como paso de saneamiento en pipelines de datos financieros antes de su procesamiento posterior.
- Tareas de compliance y respuesta estructurada: generacion de respuestas con formato consistente para checklists, informes internos y resumenes de requisitos regulatorios, con la salida posteriormente validada por un revisor humano.
- Formacion y onboarding en servicios financieros: generacion de preguntas, respuestas y explicaciones de terminologia contable para programas de capacitacion interna de entidades financieras.
- Investigacion en IA aplicada a finanzas: por su caracter experimental y su tamano de repositorio reducido, sirve como banco de pruebas para estudiar la combinacion de ajuste fino de dominio con RAG sensible a versiones y jurisdicciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible. La model card no publica parametros ni requisitos de memoria.
- Como referencia indirecta, el repositorio ocupa 0,1 GB, lo que sugiere un modelo de menor tamano que la media; el dato concreto de VRAM debe determinarse a partir del modelo base, que no se especifica.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada. Con un repositorio de 0,1 GB es plausible su ejecucion en GPU de consumo, pero se trata de una inferencia a partir del tamano del repositorio, no de un dato publicado.
- Opciones de despliegue: la libreria declarada es transformers y la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documentan instrucciones ni soporte explicito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de arquitectura de IFRSLLM, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IFRSLLM (eliashasnat/ifrsllm) | no disponible | no disponible | sin benchmarks publicados | other | Hugging Face, 0 descargas, 0 likes |
| Alternativas de dominio financiero | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Caracter experimental: la propia model card advierte de que IFRSLLM no sustituye al criterio profesional contable, a los auditores, a los asesores legales ni a los materiales IFRS autoritativos.
- El dataset de ajuste es sintetico y orientado a dominio; el autor indica explicitamente que no debe considerarse una base de conocimiento IFRS autoritativa.
- Riesgo de alucinacion en contenido normativo: al no incorporar la normativa en los pesos, cualquier dato sobre parrafos, fechas de vigencia o enmiendas debe verificarse contra fuentes autorizadas, idealmente mediante la capa RAG prevista.
- Desactualizacion temporal: las normas IFRS, sus enmiendas y fechas de entrada en vigor cambian; sin la capa de recuperacion sensible a versiones, el modelo puede mezclar criterios de periodos distintos.
- Sesgos conocidos: no disponibles (no se documenta ninguna evaluacion de sesgos).
- Limitaciones de contexto e idioma: no disponibles; el campo de idiomas no esta especificado y no se declara longitud de contexto.
- Restricciones de licencia: la licencia figura como `other`, una licencia personalizada. Es imprescindible revisar los terminos del repositorio antes de cualquier uso comercial o de redistribucion.
- Trazabilidad y adopcion limitadas: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni evaluaciones independientes.
- Para produccion en el dominio financiero se recomienda combinar el modelo con RAG autorizado, reranking, validacion de citas, guardrails y revision humana, tal como plantea el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eliashasnat/ifrsllm
- Repositorio del autor (perfil): https://huggingface.co/eliashasnat
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios de codigo o demos.
