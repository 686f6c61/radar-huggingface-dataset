# nile-academy/nanbeige4.2-3b-gguf

## Resumen

Nanbeige4.2-3B es un modelo de lenguaje de 3B parámetros desarrollado por Nanbeige, publicado originalmente en julio de 2026 y distribuido bajo licencia Apache 2.0. Este repositorio concreto, `nile-academy/nanbeige4.2-3b-gguf`, es un espejo y conversión a formato GGUF del checkpoint oficial en BF16, sin entrenamiento adicional por parte del publicador del espejo (Nile Academy). El modelo base cuenta con 4.169.800.704 parámetros totales según los tensores safetensors del checkpoint original, cifra que incluye embeddings y otras modalidades del modelo fuente.

La relevancia de este artefacto reside en que ofrece el modelo en cuatro cuantizaciones GGUF listas para usar con llama.cpp y runtimes compatibles, lo que facilita el despliegue en hardware de consumo. El repositorio incluye además el checkpoint BF16 original preservado en una revisión fijada, lo que permite trazabilidad completa desde la cuantización hasta los pesos de referencia. La model card documenta métricas de perplejidad por cuantización y benchmarks publicados por el editor original, aunque advierte explícitamente de que estos no han sido medidos sobre los ficheros cuantizados.

El modelo se distribuye con la etiqueta `wekala` y está asociado al SDK de Wekala, si bien los pesos y el SDK se distribuyen por separado. La licencia Apache 2.0 del modelo original gobierna los pesos; el repositorio no concede derechos sobre el SDK.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; no especificado en la informacion proporcionada) |
| Parametros totales | 4.169.800.704 (incluye embeddings y modalidades del modelo fuente) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M; BF16 original preservado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones y BF16); safetensors en el checkpoint original |
| Tamano del repo | 51,9 GB |
| Revision fijada del modelo base | `b82e54bd609793562a75cbf9337970a93369eab5` |
| Fecha de publicacion original | julio de 2026 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Nanbeige4.2-3B: no se especifica si es un transformer denso, un modelo MoE, híbrido o SSM, ni se documentan el número de capas, dimensiones ocultas, mecanismo de atención ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se indica la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

Lo que sí documenta este repositorio es el proceso de conversión y cuantización: los cuatro ficheros GGUF (Q8_0, Q6_K, Q5_K_M y Q4_K_M) se generaron mediante conversión Wekala a partir del checkpoint oficial en BF16, con llama.cpp como runtime de referencia (identificador `4413a19`). El checkpoint BF16 original se preserva íntegro bajo `original/b82e54bd609793562a75cbf9337970a93369eab5/`, con un total de 8.339.624.720 bytes en tensores originales, y se ofrece además una referencia GGUF en BF16 de 8.343.845.248 bytes solo para texto. Se documenta una corrección del flag nativo del tokenizer (`tokenizer.ggml.add_space_prefix` a `false`) del 21 de octubre de 2026, basada en el esquema Metaspace `prepend_scheme=first` de Nanbeige, que altera un único byte booleano por fichero sin modificar vocabulario ni tensores.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` indica uso orientado a diálogo.
- Razonamiento: los benchmarks publicados por el editor (GPQA Diamond, LiveCodeBench v6) se reportan en modo `reasoning`, lo que sugiere soporte de razonamiento extendido.
- Codigo: LiveCodeBench v6 y SWE-bench Verified aparecen en los benchmarks del editor, lo que indica capacidades de generación y resolución de problemas de código.
- Uso de herramientas y agentes: SWE-bench Verified y Terminal-Bench 2.0 se evalúan con un `publisher agent harness`, lo que implica soporte de flujos agénticos y ejecución multi-paso.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructuras de inferencia tipo endpoint.
- Capacidades multilingües: no disponibles; la model card menciona tareas multilingües/Arabic en el contexto de evaluación pendiente, pero no se documenta la cobertura de idiomas.
- Modo thinking explícito: no disponible como dato confirmado; el modo `reasoning` de los benchmarks es la única referencia.

## Casos de uso

- Asistente conversacional en local: con cuantización Q5_K_M (2,987 GB) o Q4_K_M (2,575 GB) el modelo cabe en GPUs de consumo de 8 GB o menos, permitiendo desplegar un asistente multi-turno en estaciones de trabajo sin conexión a la nube.
- Generación de código en pipelines de CI/CD: los resultados reportados en LiveCodeBench v6 (72,5 %) y SWE-bench Verified (63,6 %) por el editor original indican que el modelo puede abordar tareas de reparación de código y resolución de issues; la cuantización Q8_0 (4,435 GB) ofrece la mayor fidelidad numérica para estas tareas.
- Automatización de terminal y agentes de sistema: la evaluación en Terminal-Bench 2.0 (44,1 %) con harness agéntico sugiere uso en agentes que ejecutan comandos y resuelven tareas de administración de sistemas, siempre con las salvaguardas de permisos de la aplicación consumidora.
- Razonamiento científico y preguntas de dominio: GPQA Diamond (87,4 %) apunta a utilidad en preguntas de nivel experto en física, química y biología, adecuado para asistentes de investigación que requieran razonamiento profundo.
- Despliegue en CPU y entornos sin GPU: los ficheros GGUF se validaron en pantallas de carga y comprobaciones numéricas en Windows CPU con texto sin formato, lo que permite servir el modelo en servidores sin acelerador, a costa de mayor latencia.
- Prototipado e investigación de cuantización: el repositorio incluye métricas de perplejidad comparativas (Q8 +0,53 %, Q6 +2,97 %, Q5 +3,31 %, Q4 +16,60 % frente a BF16 sobre cuatro fragmentos de calibración), útil para estudiar el impacto de la cuantización antes de seleccionar un fichero para producción.
- Evaluación de fidelidad de plantillas y herramientas: dado que la model card indica que las pruebas de fidelidad de chat, herramientas y plantillas están pendientes, el repositorio sirve como base para campañas de evaluación propias antes de un despliegue en producción.

## Benchmarks y rendimiento

Los siguientes resultados son los reportados por el editor original del modelo base y **no** han sido medidos sobre estos ficheros cuantizados. El harness, la precisión, los ajustes de razonamiento y las versiones de tarea difieren, por lo que no deben tratarse como una clasificación normalizada entre modelos.

| Benchmark | Puntuacion (%) | Modo / ajustes |
|---|---:|---|
| GPQA Diamond | 87,4 | reasoning; protocolo del editor; no normalizado |
| LiveCodeBench v6 | 72,5 | reasoning; protocolo del editor; no normalizado |
| SWE-bench Verified | 63,6 | harness agéntico del editor; no normalizado |
| Terminal-Bench 2.0 | 44,1 | harness agéntico del editor; no normalizado |

Métricas de cuantización (perplejidad relativa a BF16 sobre cuatro fragmentos de calibración, no evaluación de tareas retenidas):

| Cuantizacion | Incremento de PPL vs BF16 |
|---|---:|
| Q8_0 | +0,53 % |
| Q6_K | +2,97 % |
| Q5_K_M | +3,31 % |
| Q4_K_M | +16,60 % |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin estado de contexto ni buffers): Q4_K_M 2,575 GB; Q5_K_M 2,987 GB; Q6_K 3,425 GB; Q8_0 4,435 GB; BF16 GGUF 8,343 GB. El tamaño del fichero no equivale al uso total de RAM/VRAM.
- GPUs recomendadas: no disponibles de forma explícita. Por tamaño de pesos, las cuantizaciones Q4/Q5 caben en GPUs de consumo de 8 GB; Q8_0 requiere al menos 6 GB solo para pesos, por lo que 8 GB resulta ajustado y 12-16 GB es más holgado. El funcionamiento sostenido en 8 GB de VRAM requiere perfiles medidos propios según la model card.
- Cabe en GPU de consumo: sí, al menos las cuantizaciones Q4_K_M y Q5_K_M por tamaño de pesos; la model card no certifica el ajuste sostenido en 8 GB y lo deja como puerta de calificación pendiente.
- Opciones de despliegue: llama.cpp (runtime de referencia de la conversión, `4413a19`); cualquier runtime compatible con GGUF. La etiqueta `endpoints_compatible` sugiere integración con infraestructuras de endpoint. No se documentan vLLM, TGI ni Ollama de forma explícita.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.
- Calificación de dispositivo: BF16/Q8/Q6/Q5/Q4 superaron pantallas de carga y comprobaciones numéricas en Windows CPU con texto sin formato; la fidelidad de chat/herramientas/plantillas, el ajuste sostenido en GPU y la calificación en móvil/navegador siguen pendientes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los benchmarks del editor no están normalizados frente a otros modelos y la model card advierte explícitamente contra su uso como ranking cruzado. Por tanto, la comparativa con alternativas de la misma categoría (modelos de ~3-4B parámetros) no está disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nanbeige4.2-3B (este repo, GGUF) | 4.169.800.704 | no disponible | Apache 2.0 | Hugging Face, GGUF Q8/Q6/Q5/Q4 + BF16 |
| Alternativas de ~3-4B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Calificación de calidad de cuantización: la model card declara explícitamente que la calificación amplia de calidad de cuantización de Wekala **no está superada** y que no se hace ninguna afirmación general de "sin pérdida significativa de calidad". Q4_K_M es experimental (+16,60 % de perplejidad sobre calibración).
- Evaluación pendiente: la fidelidad de chat, herramientas y plantillas, el ajuste sostenido en GPU y la calificación en móvil/navegador no se han verificado. Antes de recomendar el modelo debe realizarse una evaluación emparejada de referencia frente a variante en tareas de instrucción, conocimiento, matemáticas, multilingüe/árabe y herramientas.
- Alucinación y seguridad: la model card advierte de que los modelos pueden producir salidas incorrectas o inseguras. Las llamadas a herramientas son propuestas sujetas a los permisos de la aplicación consumidora y a la admisión del controlador.
- Idiomas: no se documenta la cobertura lingüística; la evaluación multilingüe está pendiente, por lo que no debe asumirse soporte de castellano u otros idiomas sin verificación.
- Contexto: la longitud de contexto no está disponible en la información proporcionada, lo que impide planificar cargas de contexto largo sin consultar la model card original.
- Licencia: los pesos están bajo Apache 2.0, pero el repositorio no concede derechos sobre el SDK de Wekala, que se distribuye por separado.
- Trazabilidad: los ficheros GGUF se generaron a partir de una revisión fijada del modelo base; cualquier divergencia respecto a esa revisión debe verificarse contra los SHA-256 registrados en `model-metadata.json`.
- Tamaño del fichero frente a uso real: el tamaño de los pesos excluye estado de contexto, buffers de trabajo y margen del driver; el ajuste en 8 GB de VRAM requiere perfiles medidos específicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nile-academy/nanbeige4.2-3b-gguf
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Model card del modelo base (revisión fijada): https://huggingface.co/Nanbeige/Nanbeige4.2-3B/blob/b82e54bd609793562a75cbf9337970a93369eab5/README.md
- Checkpoint BF16 original en este repositorio: https://huggingface.co/nile-academy/nanbeige4.2-3b-gguf/tree/main/original/b82e54bd609793562a75cbf9337970a93369eab5
- Referencia del editor (arXiv): https://arxiv.org/abs/2607.22083
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
