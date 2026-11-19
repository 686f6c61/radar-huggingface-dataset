# mradermacher/Underdog-Poodle-4B-i1-GGUF

## Resumen

Underdog-Poodle-4B-i1-GGUF es una coleccion de cuantizaciones GGUF, generadas por mradermacher con metodo imatrix, del modelo base ConwayResearch/Underdog-Poodle-4B. El modelo original es un transformer denso de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) orientado a tool calling, function calling y flujos de agentes, segun las etiquetas declaradas por el autor. Esta publicacion no introduce pesos nuevos: su valor esta en ofrecer versiones comprimidas listas para inferencia local con llama.cpp y derivados.

El repositorio incluye un rango amplio de cuantizaciones, desde i1-Q2_K (2,1 GB) hasta i1-Q6_K (3,7 GB), ademas del fichero imatrix empleado para generarlas. La model card indica que se trata de un modelo de vision y que los ficheros mmproj, si existen, se alojan en el repositorio estatico complementario (mradermacher/Underdog-Poodle-4B-GGUF), no en este. El repositorio completo ocupa 39,2 GB.

La relevancia practica es doble: por un lado, permite ejecutar un modelo de 4B especializado en llamadas a herramientas en hardware de consumo; por otro, la licencia cc-by-nc-4.0 limita el uso comercial, lo que condiciona su adopcion en produccion. La informacion publicada no detalla contexto, composicion del dataset ni resultados de benchmarks, por lo que la evaluacion cuantitativa queda pendiente de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (no se detalla en la informacion disponible) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (segun la model card) |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base ConwayResearch/Underdog-Poodle-4B mas alla de su naturaleza transformer densa de 4,3 mil millones de parametros. No se documentan el numero de capas, la dimension oculta, el mecanismo de atencion ni si emplea tecnicas como atencion lineal o decodificacion especulativa. Tampoco se detalla el proceso de entrenamiento: no hay datos sobre volumen de tokens, composicion del corpus, uso de RLHF, DPO u otras fases de alineamiento.

Lo unico documentado en esta publicacion es el proceso de cuantizacion. mradermacher ha generado las versiones GGUF con cuantizacion por importancia (imatrix), un metodo que pondera los pesos segun su relevancia estadistica para reducir la perdida de calidad en tasas de compresion agresivas. La model card incluye la version de cuantizacion (quantize_version 2), el tipo de conversion (hf) y confirma que se han cuantizado los tensores de salida (output_tensor_quantised 1). Se ofrece tambien el fichero imatrix por separado para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational y el idioma declarado.
- Tool calling y function calling: el modelo esta etiquetado explicitamente para estas tareas, lo que sugiere entrenamiento o ajuste orientado a invocar funciones externas con esquemas estructurados.
- Soporte para agentes: la etiqueta agents indica uso previsto en flujos multi-paso con toma de decisiones y llamadas a herramientas.
- Vision: la model card afirma que es un modelo de vision y remite a los ficheros mmproj del repositorio estatico; no se detalla la resolucion de imagen ni el codificador visual.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con infraestructura de inferencia estandar.
- Capacidades multilingues: no disponibles mas alla del ingles declarado.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion.

## Casos de uso

- Agentes de automatizacion de tareas: el modelo puede actuar como planificador que decide que funcion invocar en cada paso, aprovechando su ajuste para tool calling. Su tamano de 4B permite desplegarlo en un servidor modesto o incluso en local para prototipos de agentes.
- Integracion en pipelines de CI/CD con function calling: puede interpretar instrucciones en lenguaje natural y traducirlas a llamadas estructuradas a APIs internas, como consulta de estado de builds o lanzamiento de despliegues, siempre que el uso sea no comercial por licencia.
- Asistentes de soporte tecnico con acceso a herramientas: en escenarios donde el bot debe consultar bases de conocimiento o sistemas de tickets mediante funciones, el ajuste especifico del modelo reduce la necesidad de ingenieria de prompts compleja.
- Enrutamiento de consultas en sistemas multiagente: un modelo pequeno y rapido como este puede clasificar la intencion del usuario y derivar la peticion al agente o herramienta adecuada, actuando como capa de orquestacion barata.
- Evaluacion y experimentacion en investigacion: al estar disponible en cuantizaciones desde 2,1 GB, es util para estudiar el comportamiento de modelos 4B en tareas de function calling con recursos limitados, comparando la degradacion entre niveles de cuantizacion.
- Despliegue en estaciones de trabajo con GPU de consumo: las versiones i1-Q4_K_M (2,9 GB) o i1-Q5_K_M (3,3 GB) caben en GPUs con 8 GB de VRAM, lo que permite probar flujos de agentes completamente en local sin depender de servicios en la nube.
- Procesamiento de documentos con componente visual: si se emplean los ficheros mmproj del repositorio estatico, el modelo podria abordar tareas de extraccion de informacion de imagenes combinadas con llamadas a herramientas, aunque la informacion disponible no detalla el alcance de esta capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el overhead de contexto. Las cuantizaciones van de 2,1 GB (i1-Q2_K) a 3,7 GB (i1-Q6_K); con ventanas de contexto moderadas, el consumo total se situa en torno a 3-5 GB.
- GPU recomendadas: para las cuantizaciones mayores (Q5_K_M, Q6_K), una RTX 3060 de 12 GB, RTX 4070 o superiores ofrecen margen holgado. Para Q4_K_M basta con 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
- Cabe en GPU de consumo: si. Las versiones Q4 y Q5 son adecuadas para GPUs de 8 GB; las versiones Q2 y Q3 pueden ejecutarse incluso en GPUs de 4-6 GB o en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio y cualquier runtime compatible con GGUF. Para servidores con mayor concurrencia, vLLM y TGI requieren los pesos originales en safetensors, no el GGUF.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del nivel de cuantizacion. Como referencia cualitativa, la model card senala i1-Q4_K_M como "fast, recommended" y i1-Q4_0 como "fast, low quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Underdog-Poodle-4B (este, cuantizado) | 4,33B | no disponible | cc-by-nc-4.0 | GGUF | Especializado en tool calling y agentes; solo ingles declarado |
| Qwen3.5-4B (referenciado en license_link) | no disponible en la informacion | no disponible | no disponible en la informacion | safetensors | La model card enlaza su licencia como referencia, lo que sugiere parentesco o inspiracion |
| Alternativas de 4B para function calling | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La informacion disponible no permite establecer comparaciones cuantitativas con modelos alternativos: no hay benchmarks publicados ni datos de contexto de los modelos de referencia. La unica comparacion documentada es interna, entre los distintos niveles de cuantizacion del propio modelo.

## Limitaciones y advertencias

- Licencia cc-by-nc-4.0: prohibido el uso comercial. Cualquier despliegue en producto o servicio que genere ingresos requiere licencia adicional del titular de los derechos.
- Idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos; conviene validarlo antes de usarlo en produccion.
- Riesgo de alucinacion: inherente a los modelos de 4B, especialmente en tool calling, donde una llamada mal formada o con argumentos inventados puede provocar fallos en cadena en el agente.
- Degradacion por cuantizacion: las versiones Q2 y Q3 pierden calidad de forma notable; la propia model card recomienda IQ3_XXS o IQ3_S frente a Q2_K y Q3_K_S. Para tareas de function calling, donde la precision del formato importa, se recomienda Q4_K_M o superior.
- Vision condicionada: los ficheros mmproj no estan en este repositorio sino en el estatico; sin ellos, la capacidad multimodal no esta disponible.
- Sin benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni en suites de tool calling como BFCL, lo que impide estimar su calidad relativa.
- Modelo derivado: los meritos tecnicos corresponden al modelo base ConwayResearch/Underdog-Poodle-4B; esta publicacion solo aporta la cuantizacion.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Underdog-Poodle-4B-i1-GGUF
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Poodle-4B
- Cuantizaciones estaticas (incluye posibles mmproj): https://huggingface.co/mradermacher/Underdog-Poodle-4B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Underdog-Poodle-4B-i1-GGUF
- Licencia de referencia (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
