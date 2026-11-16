# sensein/layalink

## Resumen

LayaLink es un modelo de 421 millones de parámetros desarrollado por Sensein, especializado en tareas de mapeo y alineamiento de ontologías, enlazado de entidades y selección de conceptos. Se trata de un fine-tuning del modelo base `convaiinnovations/laya` que aborda un problema clásico en la integración de datos biomédicos y grafos de conocimiento: determinar si dos conceptos de ontologías distintas representan la misma entidad, si existe una relación jerárquica entre ellos o si no hay correspondencia posible.

A diferencia de los modelos de lenguaje generativos convencionales, LayaLink no busca candidatos en una ontología ni genera texto libre. Su función es evaluar y clasificar pares de conceptos que el usuario le proporciona, devolviendo decisiones tipadas con probabilidades asociadas. Esta aproximación lo hace adecuado para pipelines de integración de datos donde la precisión y la trazabilidad de las decisiones son críticas.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y está pensado para su integración mediante la librería `laya`, que gestiona la carga del modelo y la formulación de preguntas estructuradas. Su relevancia actual radica en la creciente necesidad de armonizar ontologías biomédicas y de otro tipo para tareas de interoperabilidad semántica y construcción de grafos de conocimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de `convaiinnovations/laya`) |
| Parámetros totales | 421.293.830 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los ejemplos de la model card están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de que se trata de un fine-tuning del modelo base `convaiinnovations/laya`. No se especifican datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que LayaLink fue entrenado y probado con una versión concreta de la librería `laya` (commit `80a1da1fa5448ea12163f4d977935625a0aea670`), lo que sugiere que la interfaz de preguntas y respuestas estructuradas forma parte integral del diseño del modelo.

La innovación técnica destacable es el formato de interacción basado en "preguntas tipadas": el usuario proporciona un `state` (conceptos fuente y destino, o menciones y candidatos) y un conjunto de `questions` con tipos como `choice` o `noul` (probabilidad de una afirmación). El modelo devuelve respuestas con distribuciones de probabilidad sobre las opciones, lo que permite umbralizar decisiones y auditar la confianza. No se dispone de información sobre técnicas de decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Clasificación de relaciones entre conceptos de ontologías: `equivalent`, `source_narrower`, `source_broader`, `related`, `no_match`, `insufficient`.
- Estimación de probabilidad de coincidencia exacta (`exact_match`) entre dos conceptos.
- Enlazado de entidades: dada una mención textual, su oración y un concepto candidato, decide `match`, `no_match` o `insufficient`, y estima la probabilidad de aceptar el candidato.
- Selección de conceptos: dada una mención, su oración y una lista de candidatos, identifica el candidato correcto o `none`, y estima la probabilidad de que algún candidato sea resoluble.
- Evaluación de candidatos proporcionados por el usuario (no realiza búsqueda en ontologías).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (los ejemplos son en inglés).
- Capacidades especiales: modo de decisión tipada con probabilidades calibradas, orientado a dominios biomédicos y grafos de conocimiento.

## Casos de uso

- Armonización de ontologías biomédicas: integrar conceptos de NCI Thesaurus, Disease Ontology o Adult Mouse Anatomy en un pipeline ETL, usando LayaLink para clasificar la relación entre pares de conceptos y decidir si se pueden fusionar o mapear jerárquicamente.
- Enlazado de entidades en textos clínicos: extraer menciones de enfermedades o anatomía de informes y resolverlas contra una ontología de referencia, proporcionando candidatos y usando LayaLink para validar cada uno con su probabilidad de aceptación.
- Construcción y mantenimiento de grafos de conocimiento: validar automáticamente aristas de equivalencia o subclase entre nodos provenientes de fuentes heterogéneas, reduciendo la revisión manual en la curación del grafo.
- Integración de catálogos farmacéuticos o de dispositivos médicos: mapear conceptos entre vocabularios controlados de distintos proveedores, usando la clasificación `source_narrower`/`source_broader` para preservar la semántica jerárquica.
- Evaluación de alineamientos OAEI: utilizar el modelo como componente de decisión en tareas de ontology alignment benchmarking, comparando sus salidas probabilísticas con referencias gold para medir precisión y recall.
- Desambiguación de conceptos en pipelines de búsqueda semántica: dado un conjunto de candidatos recuperados por un motor de búsqueda, emplear la tarea de `concept_selection` para elegir el más probable y descartar los demás con una probabilidad de resolubilidad.
- Auditoría de mapeos existentes: revisar alineamientos ya establecidos entre ontologías, solicitando a LayaLink una segunda opinión con probabilidades para detectar mapeos dudosos o incorrectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye ejemplos cualitativos de predicciones sobre conjuntos de test retenidos (`oaei_anatomy` y `bioml2026`), pero no se proporcionan métricas agregadas como precisión, recall o F1.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 421 millones de parámetros, en precisión FP16 requeriría aproximadamente 0,85 GB solo para los pesos, más overhead de activaciones y memoria del runtime; en FP32, alrededor de 1,7 GB. No se dispone de cifras oficiales de VRAM.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores; también en A100, H100 o L4 para despliegues en servidor.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: la model card indica el uso de la librería `laya` con `laya.Agent("sensein/layalink", device="cuda" | "mps" | "cpu")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (ontology matching, entity linking) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo no busca candidatos en ontologías; solo evalúa los que el usuario le proporciona. Un pipeline completo requiere un paso previo de recuperación de candidatos.
- La model card indica que las preguntas deben formularse con la redacción exacta con la que se entrenó; desviarse de ese formato puede degradar el rendimiento.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación o limitaciones idiomáticas más allá de que los ejemplos están en inglés.
- No se especifica la longitud de contexto máxima, lo que limita la planificación de entradas con definiciones o listas de candidatos extensas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, no se documentan restricciones adicionales ni condiciones de atribución específicas.
- El modelo está orientado a dominios biomédicos y de grafos de conocimiento; su rendimiento en otros dominios no está documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Si TensorFlow está instalado, la carga puede colgarse; la model card recomienda establecer `USE_TF=0`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sensein/layalink
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de la librería `laya`: https://github.com/NandhaKishorM/laya
