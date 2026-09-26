# lbakar/health-log-extraction-GRPO

## Resumen

Health-log-extraction-GRPO es un modelo de extraccion de informacion (information extraction) especializado en convertir entradas de diario personales, redactadas en lenguaje natural, en registros de salud estructurados en JSON. Lo publica el usuario lbakar en HuggingFace y se construye como un ajuste fino del modelo base Qwen/Qwen3-0.6B, un transformer decoder denso de aproximadamente 600 millones de parametros. El entrenamiento se realizo mediante aprendizaje por refuerzo (la nomenclatura del repositorio apunta a GRPO, Group Relative Policy Optimization) partiendo de una instancia ya sometida a SFT (supervised fine-tuning), y utilizando el dataset lbakar/health-log-extraction-dataset.

El problema que aborda es concreto: la informacion relevante para el seguimiento de la salud (actividad fisica, alimentacion, estado de animo, sintomas y tratamientos) suele quedar enterrada en texto libre, poco estructurado y con formato variable. El modelo fuerza esa informacion a una plantilla JSON fija con cinco bloques (activity, food, mood, symptom y treatment), lo que facilita su ingestión en bases de datos, dashboards o sistemas de seguimiento. Es relevante precisamente por su especializacion: no es un asistente generalista, sino un extractor de un unico esquema, entrenado exclusivamente para esa tarea y en un solo idioma (ingles).

Se trata de un modelo muy pequeno (0.6B) y con cero descargas y cero likes en el momento de la consulta, por lo que debe considerarse un experimento de investigacion o una prueba de concepto mas que un componente listo para produccion. La model card no documenta resultados de benchmarks, composicion del dataset ni detalles del proceso de RL mas alla de la mencion generica al entrenamiento con refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, heredada del modelo base Qwen/Qwen3-0.6B (detalles de capas y cabezas no disponibles) |
| Parametros totales | ~0,6 mil millones (0.6B), segun el modelo base declarado |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen3-0.6B declara 32 768 tokens de contexto nativo, pero no se confirma que este fine-tuning lo conserve |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados en el repositorio) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (la model card usa `use_safetensors=True`); no se publican GGUF ni otros formatos |

Otros metadatos: autor lbakar; tarea declarada info_extraction; dataset de entrenamiento lbakar/health-log-extraction-dataset; region us; repositorio creado el 2026-09-25 segun los metadatos de HuggingFace.

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder denso de la familia Qwen3. Sobre esa base ya sometida a SFT se aplico un entrenamiento con aprendizaje por refuerzo; el sufijo "GRPO" del identificador del repositorio sugiere que la tecnica empleada fue Group Relative Policy Optimization, aunque la model card solo indica de forma generica "trained with reinforcement learning" y no detalla hiperparametros, funcion de recompensa ni numero de pasos. No se especifica el numero de tokens de entrenamiento ni la composicion del dataset mas alla de su identificador publico.

La innovacion principal no es arquitectonica sino de planteamiento: el entrenamiento se restringe a una unica plantilla de extraccion, codificada como JSON con los bloques activity (tipo, palabras clave, duracion, ubicacion, fecha), food (alimentos consumidos, omitidos, cantidad), mood (descripcion y clasificacion positive/neutral/negative), symptom (palabras clave y descripcion) y treatment (nombre, dosis y estado taken/recommended/postponed/missed). El prompt se construye con los tokens especiales de chat de Qwen (`<|im_start|>template`, `<|im_start|>user`, `<|im_start|>assistant`), inyectando la plantilla como contexto antes de la entrada del usuario. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal ni modos de razonamiento explicito.

## Capacidades

- Extraccion de informacion estructurada: convierte texto libre tipo diario en un objeto JSON que sigue una plantilla fija de cinco bloques (activity, food, mood, symptom, treatment).
- Clasificacion de estado de animo: asigna la descripcion de mood a una de tres categorias (positive, neutral, negative).
- Extraccion temporal: el bloque activity admite un campo date en formato date-time y un campo duration.
- Normalizacion de entidades de salud: nombre de tratamiento, dosis y estado (tomado, recomendado, pospuesto u omitido).
- Deteccion de sintomas: extrae palabras clave y una descripcion textual del sintoma.
- Generacion de texto en formato JSON: la salida esperada es un objeto JSON, generado con `max_new_tokens=2048` en el ejemplo de la model card.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta disenado para una unica pasada de extraccion.
- Vision, audio u otras modalidades: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Diarios personales de salud: el usuario escribe una entrada libre del tipo "hoy he salido a correr y me duelen las piernas" y el modelo devuelve el JSON con actividad, duracion estimada y sintoma asociado, listo para almacenarse en una base de datos.
- Aplicaciones de seguimiento de habitos: integrado en el backend de una app movil, transforma cada nota de texto en registros estructurados que alimentan graficos de actividad fisica, social, intelectual y productiva.
- Registro de alimentacion: extrae los alimentos consumidos, los omitidos y las cantidades, lo que permite calcular adherencia a una pauta dietetica sin que el usuario rellene formularios.
- Monitorizacion de adherencia a tratamientos: a partir de frases como "me he saltado la pastilla de la manana", el modelo marca el estado del tratamiento como missed, con nombre y dosis, y permite generar alertas.
- Triage previo de sintomas en un asistente conversacional: el bloque symptom alimenta una capa posterior de reglas o un modelo mayor que decide si derivar a un profesional; este modelo actua como extractor barato y rapido en la primera etapa del pipeline.
- Analisis retrospectivo de cohortes: procesamiento por lotes de miles de entradas de diario para construir un dataset tabular de sintomas, estados de animo y tratamientos que sirva para estudios observacionales.
- Enriquecimiento de historiales clinicos narrativos: conversion de notas de texto libre en campos estructurados para sistemas de historia clinica electronica, siempre con supervision humana por las limitaciones del modelo.
- Prototipado rapido en investigacion: al ser un modelo de 0.6B con licencia Apache 2.0, sirve como banco de pruebas para experimentos de RL sobre extraccion de informacion y plantillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, exactitud de esquema ni comparaciones con otros extractores, y la busqueda web realizada no aporto documentacion tecnica adicional sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los ~0,6B parametros del modelo base, no confirmada por el autor):
  - FP16/BF16: aproximadamente 1,2-1,5 GB solo para pesos, con un consumo total realista de 2-3 GB incluyendo cache KV y overhead del runtime.
  - INT8: aproximadamente 0,6-0,8 GB de pesos.
  - INT4: aproximadamente 0,3-0,5 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o incluso una GTX 1650 de 4 GB en cuantizacion INT4 pueden ejecutarlo. GPU de centro de datos como A100, H100 o L40S estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM, y tambien en CPU y en Apple Silicon mediante llama.cpp.
- Opciones de despliegue: la model card documenta el uso con `transformers` y `AutoModelForCausalLM.from_pretrained`. Al no publicarse pesos GGUF, para llama.cpp u Ollama habria que convertir los pesos safetensors. vLLM y TGI son compatibles teoricamente con la arquitectura Qwen3, pero no hay configuracion publicada ni verificada para este checkpoint.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lbakar/health-log-extraction-GRPO | ~0,6B | no disponible | Extraccion de registros de salud con plantilla JSON unica, en ingles | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B | 32 768 tokens declarados por el fabricante | Modelo generalista multilingue | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Otros extractores de informacion clinica de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo evaluado ni de alternativas comparables dentro de la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad. El modelo base Qwen3-0.6B es el unico punto de referencia solido: el fine-tuning anade especializacion en una plantilla concreta a costa de perder generalidad y capacidades multilingues.

## Limitaciones y advertencias

- Especializacion extrema: el entrenamiento cubre una unica plantilla de extraccion. Fuera de ese esquema, y probablemente con plantillas modificadas, el comportamiento no esta garantizado.
- Idioma: solo se declara soporte de ingles. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Tamano reducido: con 0.6B parametros la tasa de alucinacion en la generacion de campos JSON puede ser elevada, especialmente cuando la entrada no contiene informacion para algun bloque, lo que puede producir valores inventados en lugar de campos vacios.
- Riesgo de fuga de formato: al generar hasta 2048 tokens nuevos, existe riesgo de que la salida no sea JSON valido en todos los casos; conviene validar el esquema y aplicar parseo tolerante a fallos.
- Ambito sanitario: el modelo extrae informacion, no emite diagnostico ni consejo medico. Cualquier uso en salud debe acompanarse de validacion profesional y de avisos claros al usuario.
- Datos no documentados: no se publica composicion del dataset, numero de tokens de entrenamiento, proceso de anotacion ni evaluacion de sesgos. No es posible auditar que tipo de entradas vio el modelo.
- Inconsistencia en la model card: el codigo de ejemplo carga `lbakar/health-log-extraction` mientras el repositorio es `lbakar/health-log-extraction-GRPO`; el snippet tambien contiene referencias a `self.model` y `self.tokenizer` que no encajan con el contexto funcional mostrado. Conviene revisar el identificador correcto antes de usarlo.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin issues ni validacion externa conocida.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias y no se especifica si el dataset de entrenamiento tiene restricciones adicionales que pudieran afectar al uso comercial.
- Privacidad: al tratar diarios personales de salud, se manejan datos especialmente sensibles; el despliegue debe contemplar cumplimiento de RGPD si se aplica a usuarios de la UE.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lbakar/health-log-extraction-GRPO
- Dataset de entrenamiento: https://huggingface.co/datasets/lbakar/health-log-extraction-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente enlaces genericos a ChatGPT), por lo que no hay papers, blogs ni repositorios adicionales que enlazar.
