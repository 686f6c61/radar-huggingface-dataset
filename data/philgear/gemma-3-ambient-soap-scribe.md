# philgear/gemma-3-ambient-soap-scribe

## Resumen

`philgear/gemma-3-ambient-soap-scribe` es un adaptador LoRA publicado por Phillip Gear (PocketGull LLC) sobre el modelo base `google/gemma-3-4b-it`. Su proposito es convertir conversaciones ambientales entre paciente y clinico en notas clinicas estructuradas en formato SOAP (Subjetivo, Objetivo, Analisis, Plan), anadiendo codificacion diagnostica mediante ICD-10 y SNOMED-CT. El adaptador se distribuye como un artefacto PEFT independiente, por lo que requiere cargar el modelo base de Google para su uso.

El modelo se presenta como parte del ecosistema "PocketGull" de ciencia clinica abierta, con un DOI de Zenodo asociado y una declaracion de conformidad con los estandares de desidentificacion de HIPAA §164.514 Safe Harbor. Segun la model card, el ajuste se realizo mediante Direct Preference Optimization (DPO) sobre datasets clinicos de dominio especifico. El modelo base Gemma 3 4B es un transformer decoder-only de aproximadamente 4.000 millones de parametros con ventana de contexto de 128.000 tokens, capacidades multimodales de imagen y texto, y soporte multilingue.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y con un unico idioma declarado (ingles). Resulta util como referencia para quienes evaluen adaptadores clinicos ligeros desplegables en entornos locales, pero no debe confundirse con un modelo clinico validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Gemma 3 4B) |
| Parametros totales | No disponible para el adaptador; modelo base de aproximadamente 4.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base (128.000 tokens en Gemma 3 4B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT (safetensors, segun convencion de la libreria `peft`); no disponible confirmacion explicita en la informacion proporcionada |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-3-4b-it`, un transformer decoder-only de la familia Gemma 3 con aproximadamente 4.000 millones de parametros, entrenado por Google para instrucciones y conversacion. El adaptador en si es un modulo LoRA de bajo rango cargado mediante la libreria `peft`, que modifica los pesos del modelo base sin reemplazarlos. La model card no detalla el rango, el alpha, las capas objetivo ni el numero de parametros entrenables del adaptador.

Segun la documentacion del autor, el ajuste empleo Direct Preference Optimization (DPO) sobre "datasets clinicos de dominio especifico" que cumplen con la desidentificacion de HIPAA §164.514 Safe Harbor. No se especifica el volumen de datos, la composicion del corpus, el numero de pasos de entrenamiento, la mezcla de tareas ni si hubo fases previas de supervised fine-tuning. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal o modos de razonamiento extendido) mas alla de las heredadas del modelo base.

## Capacidades

- Generacion de notas clinicas estructuradas en formato SOAP a partir de transcripciones de encuentros ambulatorios.
- Asignacion de codigos diagnosticos ICD-10 y SNOMED-CT a partir del contenido clinico del encuentro.
- Generacion de texto en ingles con estilo clinico, incluyendo secciones subjetivas, objetivas, de analisis y de plan.
- Formato alternativo SBAR mencionado en el titulo del modelo (Situacion, Antecedentes, Evaluacion, Recomendacion).
- Ejecucion local o en despliegues privados, orientada a evitar la retencion de informacion de salud protegida (PHI).
- Capacidades multimodales (imagen y texto) y multilingues heredadas del modelo base Gemma 3 4B, aunque el adaptador solo declara ingles.
- Soporte de tool calling y function calling: no documentado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Modo de razonamiento extendido (thinking mode): no documentado.

## Casos de uso

- Documentacion de consultas ambulatorias: el modelo recibe una transcripcion de la conversacion medico-paciente y devuelve una nota SOAP con secciones separadas, lo que reduce el tiempo de dictado posterior del clinico. Es adecuado por su especializacion en el formato y por ejecutarse sobre un modelo base de 4B que cabe en hardware modesto.
- Codificacion diagnostica asistida: a partir de los sintomas y hallazgos descritos, el adaptador propone codigos ICD-10 y SNOMED-CT que el codificador profesional puede revisar. Util en flujos de facturacion donde se requiere una primera propuesta automatizada.
- Despliegue en el borde (edge) con requisitos de privacidad: al ser un adaptador sobre un modelo de 4B, puede ejecutarse en estaciones de trabajo con GPU consumer o en instancias privadas de Vertex AI, evitando enviar transcripciones a servicios externos. Encaja en organizaciones que exigen cero retencion de PHI.
- Triaje y resumen de encuentros: el modelo puede condensar conversaciones largas en un resumen estructurado que el personal de enfermeria revisa antes de la consulta. La ventana de contexto heredada del modelo base permite manejar transcripciones extensas.
- Generacion de informes de traspaso entre turnos: el formato SBAR mencionado en el titulo permite producir resumenes de situacion, antecedentes, evaluacion y recomendacion para el relevo de guardia.
- Prototipado e investigacion en NLP clinico: al publicarse con licencia Apache 2.0 y DOI de Zenodo, sirve como punto de partida reproducible para experimentos de extraccion de informacion clinica y evaluacion de adaptadores LoRA en dominios regulados.
- Integracion en pipelines de documentacion clinica: mediante la API de Transformers y PEFT, el adaptador puede incorporarse a un servicio interno que reciba transcripciones y devuelva JSON o Markdown con la nota estructurada, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el modelo base Gemma 3 4B en bfloat16 requiere aproximadamente 8 GB de VRAM, a los que se suma el adaptador LoRA (de tamano no especificado, tipicamente decenas o centenares de MB).
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base, resultan adecuadas GPUs con 16 GB o mas de VRAM (RTX 4090, RTX A5000, L4, A10G, A100, H100).
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 8-16 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) usando bfloat16 o cuantizacion de 8/4 bits, aunque el autor no publica requisitos concretos.
- Opciones de despliegue: Transformers + PEFT (documentado en la model card), y previsiblemente vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base y convertirlo a GGUF; estas ultimas rutas no estan documentadas por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `philgear/gemma-3-ambient-soap-scribe` | Adaptador sobre 4B | Heredado del base (128.000 tokens) | Notas SOAP/SBAR con ICD-10 y SNOMED-CT | Apache 2.0 | Hugging Face, 0 descargas |
| `philgear/pocketgull-scribe-soap` | Adaptador sobre Gemma 3 | No disponible | Notas SOAP con ICD-10 y SNOMED-CT | Apache 2.0 | Hugging Face |
| `google/gemma-3-4b-it` | Aproximadamente 4.000 millones | 128.000 tokens | Instrucciones generales, multimodal | Gemma Terms of Use | Hugging Face, ampliamente usado |

La informacion disponible no permite comparar rendimiento numerico entre estos modelos, ya que ninguno de los adaptadores publica benchmarks. La comparativa se limita a parametros, contexto, enfoque y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en tareas SOAP, codificacion ICD-10 o SNOMED-CT.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- Modelo de nicho con un unico autor y organizacion: no se documenta un proceso de evaluacion clinica independiente ni validacion por pares.
- Riesgo de alucinacion en codigos diagnosticos: la asignacion automatica de ICD-10 y SNOMED-CT puede producir codigos incorrectos o inventados, con implicaciones de facturacion y seguridad del paciente.
- Solo ingles declarado: no apto para conversaciones clinicas en castellano u otros idiomas sin evaluacion adicional.
- La conformidad con HIPAA §164.514 Safe Harbor se declara sobre los datos de entrenamiento, no garantiza que las salidas del modelo esten libres de PHI si la entrada las contiene.
- La declaracion "FDA 520(o) Non-Device CDS" es una autoevaluacion del autor; no constituye aprobacion regulatoria.
- Requiere cargar el modelo base `google/gemma-3-4b-it`, sujeto a los terminos de uso de Gemma ademas de la licencia Apache 2.0 del adaptador.
- No se documentan sesgos conocidos, tasas de error, ni protocolos de evaluacion de robustez.
- Uso previsto como herramienta de apoyo a profesionales sanitarios con revision humana; no debe emplearse como dispositivo medico autonomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philgear/gemma-3-ambient-soap-scribe
- Adaptador relacionado: https://huggingface.co/philgear/pocketgull-scribe-soap
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- DOI de Zenodo: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Sitio de la organizacion: https://pocketgull.com
- Aplicacion: https://pocketgull.app
