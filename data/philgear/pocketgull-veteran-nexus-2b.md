# philgear/pocketgull-veteran-nexus-2b

## Resumen

PocketGull VA Nexus & Disability Adjudicator es un adaptador LoRA (PEFT) publicado por philgear (PocketGull LLC) sobre el modelo base google/gemma-3-1b-it. No es un modelo completo, sino un ajuste fino orientado a un nicho muy concreto: la generacion de opiniones de nexo medico-legal para reclamaciones de discapacidad de veteranos de las fuerzas armadas estadounidenses, siguiendo el marco normativo del 38 CFR § 4.87 y los formularios DBQ (Disability Benefits Questionnaire).

El adaptador se entreno mediante Direct Preference Optimization (DPO) sobre datos clinicos desidentificados conforme al estandar HIPAA §164.514 Safe Harbor, segun declara el autor. Los tags del repositorio apuntan a fuentes como NIH MedQuad y WHO mhGAP, aunque la model card no detalla la composicion exacta del dataset ni el numero de tokens empleados. El dominio declarado cubre trauma acustico por explosion, hipoacusia neurosensorial en frecuencias altas, tinnitus cronico y migrana vestibular secundaria.

Su relevancia es acotada pero clara: demuestra como un modelo de ~1 000 millones de parametros, ejecutable en hardware de consumo o incluso en CPU, puede especializarse en una tarea documental muy reglada mediante un adaptador de bajo rango. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el ID del repositorio indica "2b" mientras que el modelo base es de 1B, una discrepancia que el autor no aclara. La busqueda web no ha devuelto resultados utiles: los enlaces recuperados corresponden a portales administrativos del Ministerio de Educacion de Jordania y no guardan relacion con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA sobre PEFT |
| Parametros totales | ~1 000 millones en el modelo base (google/gemma-3-1b-it); el ID del repositorio indica "2b", discrepancia no aclarada; el numero de parametros entrenables del adaptador no esta disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens, heredada del modelo base Gemma 3 1B |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en safetensors); no se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 para el adaptador (el modelo base se distribuye bajo los Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar por separado google/gemma-3-1b-it |
| Libreria de carga | peft (con transformers) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se monta sobre Gemma 3 1B, un transformer decoder-only con atencion por ventanas deslizantes y atencion global intercalada, disenado por Google para ejecucion en dispositivos con recursos limitados. Al tratarse de un adaptador LoRA, no modifica la arquitectura del modelo base: anade matrices de bajo rango sobre un subconjunto de capas, de modo que en inferencia puede fusionarse con los pesos originales o mantenerse como modulo separado cargado con la libreria PEFT.

El autor indica que el entrenamiento se realizo mediante Direct Preference Optimization (DPO) sobre datasets clinicos especificos del dominio, desidentificados conforme a HIPAA §164.514 Safe Harbor. Los tags del repositorio mencionan NIH MedQuad y WHO mhGAP como posibles fuentes de datos, pero no se publican ni el volumen de tokens, ni la mezcla exacta del dataset, ni el rango (rank), alpha o modulos objetivo del LoRA, ni el numero de pasos de entrenamiento. Tampoco se documenta una fase de RLHF previa ni innovaciones tecnicas adicionales como decodificacion especulativa. La model card menciona despliegue en Vertex AI y computacion local en el edge, sin detallar optimizaciones de inferencia.

## Capacidades

- Generacion de texto especializada en redaccion medico-legal: opiniones de nexo con la formulacion legal "at least as likely as not" exigida en el marco del 38 CFR § 4.87.
- Elaboracion de borradores de declaraciones para Disability Benefits Questionnaires (DBQ) que vinculan exposicion a sobrepresion por explosion con patologias secundarias.
- Razonamiento clinico acotado a patologia audiologica y vestibular: trauma acustico, muesca audiometrica a 4000 Hz, hipoacusia neurosensorial bilateral, tinnitus constante y migrana vestibular cronica.
- Consultas de farmacologia clinica: la model card incluye un ejemplo sobre metabolismo CYP450 con interaccion entre hierba de San Juan y warfarina.
- Generacion de texto en ingles unicamente; no se declara soporte multilingue.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso explicito.
- No se declara modo de pensamiento (thinking mode), vision ni audio. El modelo base Gemma 3 1B es exclusivamente de texto, por lo que el adaptador hereda esa limitacion.
- Orientado a computacion local con retencion cero de informacion de salud protegida (PHI), segun la model card.

## Casos de uso

- Redaccion asistida de opiniones de nexo para reclamaciones de discapacidad: el modelo puede generar un borrador estructurado que vincule hallazgos audiometricos objetivos (por ejemplo, muesca a 4000 Hz a 55 dB) con el historial de servicio, aportando la racionalidad medico-legal exigida antes de la revision por un profesional licenciado.
- Cumplimentacion de formularios DBQ: dado un resumen clinico del veterano, el adaptador produce texto compatible con los campos narrativos del cuestionario, reduciendo el tiempo de documentacion administrativa en consultas de la Community Care Network.
- Apoyo a profesionales de salud no especializados en medicina legal: permite obtener un primer borrador coherente con la terminologia del 38 CFR § 4.87 que despues se revisa y firma por un facultativo con experiencia en reclamaciones.
- Formacion y simulacion clinica: los prompts de ejemplo del repositorio sirven como casos de entrenamiento para residentes que deben aprender a diferenciar entre descripcion clinica y conclusion de nexo.
- Procesamiento local de documentacion desidentificada: al ejecutarse en hardware de consumo y sin llamadas a API externas, encaja en flujos donde la politica interna exige que el texto clinico no salga de la infraestructura propia.
- Investigacion retrospectiva sobre cohortes desidentificadas: extraccion y normalizacion de narrativas de nexo a partir de expedientes historicos para estudios sobre concesion de prestaciones en patologia audiologica.
- Prestacion de servicios en entornos con conectividad limitada o sin GPU: al ser un modelo de ~1 000 millones de parametros, puede desplegarse en portatiles o en el edge de una clinica rural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni de ninguna otra evaluacion, ni comparaciones cuantitativas con modelos de referencia. Tampoco se aportan metricas especificas de la tarea objetivo, como tasas de aceptacion de nexo por parte de la administracion o evaluaciones por pares clinicos.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano del modelo base (~1 000 millones de parametros) y no cifras publicadas por el autor:

- VRAM estimada en bf16/fp16: en torno a 2 GB de pesos, mas el overhead de activaciones, cache KV y runtime (del orden de 3-4 GB en total para contextos moderados).
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 1-1,5 GB de pesos.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 0,6-0,9 GB de pesos.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM; una RTX 3060, RTX 4060 o superior es mas que suficiente. Tambien funciona en tarjetas de gama de entrada y en GPUs de centro de datos como A100 o H100, aunque estan sobredimensionadas para este tamano.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en graficos integrados recientes. Con 4 u 8 bits cabe tambien en sistemas con 8 GB de RAM unificada.
- Opciones de despliegue: transformers + peft (la ruta documentada por el autor), fusion del adaptador y conversion a GGUF para llama.cpp u Ollama, vLLM con soporte de adaptadores LoRA y TGI. La model card menciona despliegue en Google Cloud Vertex AI.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion. Por tamano, cabria esperar una velocidad claramente superior a la de modelos de 7B en el mismo hardware, pero es una inferencia, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pocketgull-veteran-nexus-2b (este) | ~1B (base) + adaptador LoRA | 32 768 tokens | Nexo medico-legal VA, 38 CFR § 4.87 y DBQ | Apache 2.0 en el adaptador; base bajo Gemma Terms of Use | HuggingFace, 0 descargas en el momento de la consulta |
| google/gemma-3-1b-it (base) | ~1B | 32 768 tokens | Proposito general, instruction-tuned | Gemma Terms of Use | HuggingFace, ampliamente distribuido |
| MedGemma 4B | no disponible con precision en la informacion consultada | no disponible | Dominio medico general (Google) | Gemma Terms of Use / Health AI Developer Foundations | HuggingFace |
| BioMistral-7B | 7B | no disponible | Dominio biomedico, basado en Mistral | Apache 2.0 | HuggingFace |

No se dispone de modelos comparables de nicho identico (generacion de nexo para el sistema de prestaciones de veteranos de EE. UU.) en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Riesgo de alucinacion en un dominio de consecuencias legales y economicas altas: el modelo puede citar normativa, codigos o hallazgos clinicos inexistentes. Toda salida debe ser verificada por un profesional licenciado antes de incorporarse a un expediente.
- Sesgo de dominio: al entrenarse con DPO sobre un corpus orientado a sustentar nexis favorables, existe riesgo de sesgo de complacencia (generar conclusiones favorables al reclamante independientemente de la evidencia disponible). No se documenta ninguna evaluacion de calibracion.
- Idioma: unicamente ingles. No hay soporte declarado para castellano ni para otras lenguas, lo que limita su uso en sistemas de salud hispanohablantes.
- Tamano reducido: con ~1 000 millones de parametros, la capacidad de razonamiento clinico complejo, el manejo de historiales largos y la precision en matematicas y codigo son sensiblemente inferiores a las de modelos de 7B o mas.
- Restricciones de licencia: la licencia Apache 2.0 declarada cubre el adaptador, pero el modelo base google/gemma-3-1b-it se distribuye bajo los Gemma Terms of Use, que incluyen su propia politica de uso prohibido. Cualquier explotacion comercial queda sujeta tambien a esas condiciones, y la combinacion de ambas licencias no esta aclarada por el autor.
- Afirmaciones regulatorias no verificadas: la model card invoca HIPAA §164.514 Safe Harbor y la exencion FDA 520(o) para software de soporte a decisiones clinicas (non-device CDS). Son declaraciones del autor, no certificaciones independientes. Que los datos de entrenamiento esten desidentificados no convierte al modelo en una herramienta conforme a HIPAA para tratar datos reales de pacientes.
- Discrepancias de metadatos: el identificador del repositorio dice "2b" mientras que el base es de 1B, y la model card se refiere a la organizacion como "pocketgull-llc" mientras que el repositorio figura bajo el usuario "philgear". Conviene verificar la procedencia antes de integrarlo.
- Ausencia de validacion externa: 0 descargas y 0 likes, sin benchmarks publicados, sin evaluacion clinica revisada por pares y sin documentacion de hiperparametros de entrenamiento. No es apto para uso clinico en produccion tal cual.
- Sin soporte documentado de tool calling, agentes o multimodalidad, lo que descarta su integracion en pipelines que dependan de esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/philgear/pocketgull-veteran-nexus-2b
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- DOI en Zenodo: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Sitio de la organizacion: https://pocketgull.com
- Suite clinica referenciada: https://pocketgull.app
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a portales administrativos sin relacion con este repositorio.
