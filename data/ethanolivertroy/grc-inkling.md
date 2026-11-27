# ethanolivertroy/grc-inkling

## Resumen

grc-inkling es un adaptador LoRA de rango 32 sobre el modelo base thinkingmachines/Inkling-2-Mini, desarrollado por ethanolivertroy y orientado a tareas de gobernanza, riesgo y cumplimiento (GRC, por sus siglas en ingles) sobre el catalogo NIST SP 800-53 Revision 5. El adaptador resuelve tres tareas concretas: mapeo de requisitos a controles, revision de evidencias de auditoria y razonamiento de riesgo a partir de escenarios de amenaza. Se publica bajo licencia Apache-2.0 y esta pensado como herramienta de borrador y triaje, no como fuente autoritativa de seleccion de controles.

El modelo se entrena mediante SFT en la plataforma Thinking Machines Tinker con 561 ejemplos de chat generados a partir del catalogo OSCAL publico de NIST, con un total de 136K tokens de entrenamiento por epoca durante 3 epocas. El resultado es un adaptador ligero (repo de 1,5 GB) que mejora de forma medible la capacidad del modelo base para producir identificadores de control exactos en formato estructurado, aunque con un tamano de evaluacion reducido (n=17) que limita la confianza estadistica de los resultados.

La relevancia actual del modelo radica en su enfoque reproducible y de bajo coste (aproximadamente 0,79 USD en total) para especializar un modelo generico en un dominio regulado y altamente estructurado, ademas de documentar abiertamente un fallo de entrenamiento con GRPO que regreso la precision en held-out, lo que aporta valor como referencia metodologica para equipos que planteen tecnicas de RL con recompensas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre transformer decoder-only (modelo base Inkling-2-Mini) |
| Parametros totales | no disponible (adaptador LoRA; tamano del repo 1,5 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre thinkingmachines/Inkling-2-Mini mediante PEFT con LoRA de rango 32. El entrenamiento se realizo en la plataforma Thinking Machines Tinker con supervision fina (SFT) y funcion de perdida de entropia cruzada, con una tasa de aprendizaje de 5,4e-4, 3 epocas y tamano de lote 8. El conjunto de datos consta de 561 ejemplos de chat generados a partir del catalogo oficial NIST OSCAL SP 800-53 rev5 (dominio publico, repositorio usnistgov/oscal-content): 301 ejemplos de mapeo de controles, 180 de revision de evidencias y 80 de razonamiento de riesgo, sumando 136K tokens de entrenamiento por epoca.

El autor documento tambien una etapa adicional de GRPO con una recompensa verificable basada en el identificador exacto de control. Aunque la recompensa de entrenamiento subio de 0,53 a 0,96, la precision en held-out regreso del 60 % al 40 % por sobreajuste al pool de prompts de RL. El adaptador publicado es unicamente el checkpoint de SFT, que resulto ser el mas solido de los dos. La pipeline completa (constructor de dataset, SFT, GRPO, script de produccion con seguimiento de presupuesto y arnes de evaluacion base vs. ajustado) esta incluida en el repositorio junto con un documento LESSONS_LEARNED.md sobre persistencia de checkpoints en Tinker SDK 0.40 y los motivos del retroceso del GRPO.

## Capacidades

- Mapeo de controles: identifica el control de NIST SP 800-53 rev5 correspondiente a partir de un enunciado de requisito.
- Revision de evidencias de auditoria: asocia un artefacto de evidencia con su control y con los aspectos a verificar.
- Razonamiento de riesgo: relaciona un escenario de amenaza con controles primarios y de soporte.
- Generacion de respuestas en formato estructurado `ID - Title (Family)`, lo que facilita el parseo automatico.
- Especializacion de dominio en GRC y cumplimiento normativo sobre el catalogo NIST OSCAL.
- Capacidades generales heredadas del modelo base Inkling-2-Mini (generacion de texto, razonamiento): no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Borrador de mapeos de cumplimiento: dado un requisito interno o de un cliente, el adaptador propone el control NIST 800-53 rev5 candidato con su identificador y familia, para que un analista de GRC lo revise y confirme contra el catalogo OSCAL.
- Triaje de evidencias de auditoria: al recibir un artefacto (politica, captura de configuracion, registro), el modelo sugiere a que control corresponde y que elementos conviene verificar, acelerando la clasificacion inicial antes de la revision formal.
- Analisis preliminar de riesgos: a partir de un escenario de amenaza, el modelo enumera controles primarios y de soporte que mitigan el riesgo, sirviendo como punto de partida para el registro de riesgos.
- Asistencia en evaluaciones de preparacion (readiness assessments): el modelo ayuda a redactar preguntas de evaluacion y a estructurar hallazgos por familia de control, reduciendo el trabajo mecanico del equipo auditor.
- Formacion interna en GRC: se puede usar como tutor de practica que plantea requisitos y evalua si el alumno identifica el control correcto, aprovechando el formato estructurado de respuesta.
- Preprocesamiento en pipelines de compliance-as-code: integrado en un flujo que genere borradores de mapeo que luego se validan contra el catalogo OSCAL mediante recuperacion, el adaptador reduce el volumen de candidatos que el sistema de retrieval debe puntuar.

## Benchmarks y rendimiento

Evaluacion en held-out con 17 prompts de mapeo y temperatura 0,3:

| Modelo | ID de control exacto | Familia correcta |
|---|---|---|
| Inkling 2 Mini (base) | 0/17 | 0/17 |
| grc-inkling (este adaptador) | 9/17 (53 %) | 12/17 (71 %) |

El autor advierte que parte de la mejora respecto al modelo base se debe al cumplimiento del formato de salida estructurado, que la muestra (n=17) es pequena y que el modelo confunde titulos de control similares (por ejemplo, respondio SC-5 para el control de monitorizacion de sistemas SI-4). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo base Inkling-2-Mini, cuyos requisitos no se detallan en la informacion proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador se carga con `peft` y `transformers` (`PeftModel.from_pretrained` sobre `AutoModelForCausalLM`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (adaptadores LoRA especializados en GRC o NIST 800-53) en la informacion proporcionada. Como referencia interna, la unica comparacion documentada es contra el modelo base:

| Modelo | Tipo | Contexto | Precision en mapeo (held-out, n=17) | Licencia |
|---|---|---|---|---|
| grc-inkling | LoRA rank 32 sobre Inkling-2-Mini | no disponible | 53 % ID exacto / 71 % familia | Apache-2.0 |
| Inkling-2-Mini (base) | Modelo base | no disponible | 0 % / 0 % | no disponible |

## Limitaciones y advertencias

- Precision limitada: solo acierta el identificador exacto de control en el 53 % de los casos y la familia correcta en el 71 %, con una muestra de evaluacion de solo 17 prompts.
- Confusion entre controles de titulo similar: el autor cita el ejemplo de responder SC-5 en lugar de SI-4 para monitorizacion de sistemas.
- Parte de la mejora frente al modelo base atribuible al formato de salida, no necesariamente al conocimiento del dominio.
- No debe usarse como fuente autoritativa de seleccion de controles: el propio autor recomienda retrieval sobre el catalogo OSCAL para identificadores exactos y limita el uso a borrador y triaje.
- La etapa GRPO regreso la precision en held-out (60 % a 40 %) por sobreajuste; el checkpoint publicado es solo el de SFT.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: implicito en la confusion de identificadores y en la advertencia del autor sobre el uso no autoritativo.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache-2.0, compatible con uso comercial, pero los datos de entrenamiento derivan de contenido OSCAL de dominio publico del gobierno de EE. UU.; conviene verificar las condiciones del modelo base Inkling-2-Mini antes de un despliegue comercial.
- Para produccion: validar siempre las salidas contra el catalogo OSCAL y mantener revision humana en el bucle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanolivertroy/grc-inkling
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Catalogo NIST OSCAL SP 800-53 rev5 (datos de entrenamiento): https://github.com/usnistgov/oscal-content
- Pipeline reproducible y LESSONS_LEARNED.md: incluidos en el directorio `pipeline/` del repositorio del modelo en Hugging Face
