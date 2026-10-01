# salabh-an/laya-typed-decisions

## Resumen

Laya es un modelo de clasificación de decisiones tipadas entrenado por Convai Innovations y publicado en Hugging Face bajo el identificador `salabh-an/laya-typed-decisions`. Se trata de un ajuste fino sobre el benchmark independiente LocalLLaMA/typed-decisions, compuesto por 1.200 casos de entrenamiento que suman 6.000 decisiones etiquetadas. El modelo resuelve una tarea concreta: evaluar el estado de un flujo de trabajo (workflow state) junto con un conjunto de preguntas tipadas y devolver, en una sola pasada hacia delante, respuestas estructuradas y calibradas.

Con 421.293.830 parámetros totales y un repositorio de 0,8 GB, es un modelo compacto orientado a "system-one": decisiones rápidas, de baja latencia y con calibración explícita de la confianza. Su relevancia radica en que supera a alternativas generalistas y especialistas en precisión sobre el conjunto de prueba, con una latencia media (p50) de 134,8 ms por caso y sin coste por inferencia al ser auto-alojable. Está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones adicionales declaradas.

El modelo se distribuye a través de la librería `laya` (`pip install laya`) y también como pesos `safetensors` compatibles con `transformers`. No se declaran idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia no especificada por el autor; libreria `transformers`) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; el autor no declara cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna exacta (tipo de transformer, numero de capas, dimensiones del modelo, mecanismo de atencion) mas alla de que se distribuye mediante la libreria `transformers` y que la tarea declarada es `text-classification`. El modelo se presenta como un ajuste fino sobre el benchmark LocalLLaMA/typed-decisions, con un conjunto de entrenamiento de 1.200 casos que generan 6.000 decisiones. La model card lo etiqueta con conceptos como "system-one", "calibrated-decisions", "rlcd" y "structured-decisions", lo que sugiere un enfoque de decisiones estructuradas con calibracion, aunque el autor no documenta el metodo de entrenamiento (RLHF, DPO, RLCD u otro) ni la composicion exacta del dataset.

La innovacion destacable es el modo de operacion: el modelo evalua simultaneamente un estado de flujo de trabajo y un conjunto de preguntas tipadas en una unica pasada, devolviendo respuestas con puntuaciones calibradas. La model card reporta metricas de calibracion (Brier score de 0,050 y ECE de 0,140), lo que indica que el objetivo del entrenamiento no es solo maximizar la precision, sino producir confianzas fiables.

## Capacidades

- Clasificacion y resolucion de decisiones tipadas a partir de un estado de workflow y un conjunto de preguntas estructuradas.
- Salida calibrada: cada decision incluye un nivel de confianza, con Brier score de 0,050 y ECE de 0,140 en el conjunto de prueba.
- Asignacion de puntuaciones por nivel con alta consistencia: "Within 1 Level" de 0,996.
- Inferencia en una sola pasada hacia delante, con baja latencia (134,8 ms p50 por caso).
- Aplicable a cuatro dominios de decision declarados: observabilidad de trazas de agentes, atencion al cliente, procesamiento de facturas e incidentes de seguridad.
- No se declaran capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso.
- No se declaran capacidades multilingues.
- No se declara soporte de modo "thinking" ni razonamiento extendido.

## Casos de uso

- Observabilidad de trazas de agentes: el modelo evalua el estado de una traza de ejecucion de un agente y responde a preguntas tipadas sobre si la accion fue correcta o si requiere revision, integrandose en pipelines de monitorizacion para detectar fallos de forma automatica.
- Atencion al cliente automatizada: clasifica el estado de una conversacion o ticket y emite decisiones tipadas (por ejemplo, escalar, responder o cerrar), con puntuaciones calibradas que permiten fijar umbrales de derivacion a agentes humanos.
- Procesamiento de facturas: dado el estado de un flujo de aprobacion y preguntas tipadas sobre validacion, duplicidad o excepciones, el modelo decide si la factura se aprueba, se rechaza o se escala, en una sola pasada y con baja latencia.
- Gestion de incidentes de seguridad: clasifica alertas y estados de incidentes para decidir el nivel de severidad o la accion inmediata, con calibracion que ayuda a priorizar entre cientos de alertas concurrentes.
- Triaje y enrutado de casos: como clasificador de bajo coste (auto-alojado, coste 0,00 USD por caso segun la model card), puede pre-clasificar grandes volumenes de casos antes de pasarlos a modelos mas grandes o a revision humana.
- Decisiones sensibles a la calibracion: cuando se necesita no solo una etiqueta sino una confianza fiable (por ejemplo, scoring de riesgo o aprobacion condicional), las metricas de Brier y ECE lo hacen adecuado frente a clasificadores peor calibrados.
- Auditoria y evaluacion de flujos de agentes: puede usarse como componente de evaluacion automatica para medir la calidad de decisiones en un sistema multi-agente a partir de estados y preguntas estructuradas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de prueba oficial de 400 casos (2.000 decisiones) del benchmark LocalLLaMA/typed-decisions, en las tareas de Agent Trace Observability, Customer Service, Invoice Processing y Security Incidents.

| Modelo | Tipo | Accuracy | Soft Acc | Brier Score | ECE | Score MAE | Within 1 Level | Latencia (p50) | Coste/Caso |
|---|---|---|---|---|---|---|---|---|---|
| Laya (Ours) | fine-tuned | 0,771 | 0,567 | 0,050 | 0,140 | 0,214 | 0,996 | 134,8 ms | 0,00 USD (auto-alojado) |
| TypeSafe Jev 1.13.0 | general | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | 0,952 | 710 ms | 0,0004 USD (API) |
| ModernBERT-base (149M) | specialist | 0,646 | 0,542 | 0,119 | 0,179 | 0,444 | 0,931 | 349 ms | 0,00 USD |
| Teacher Self-Agreement | ceiling | 0,735 | - | - | - | - | - | - | - |

Tarea declarada en el `model-index`: `text-classification` (System One Decision Benchmark). Metricas: accuracy 0,771 y brier_score 0,050, ambas marcadas como no verificadas (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 0,85 GB solo para pesos (421 M parametros a 2 bytes), mas activaciones; en fp32, unos 1,7 GB. El repositorio ocupa 0,8 GB, lo que es coherente con pesos en precision reducida.
- GPU recomendadas: cabe sin problema en cualquier GPU de consumo moderna; tambien puede ejecutarse en CPU para cargas moderadas. GPU de datacenter (A100, H100) no son necesarias para un modelo de este tamano.
- GPU de consumo: si, cabe en tarjetas con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso en sistemas con menos VRAM aplicando cuantizacion.
- Opciones de despliegue: `transformers` (libreria base declarada), la libreria propia `laya` (`pip install laya`), y por tamano es compatible con runners de clasificacion como TGI u ONNX Runtime. No se declara soporte explicito de vLLM, llama.cpp u Ollama, y al ser una tarea de clasificacion (no generativa) esas opciones podrian no aplicar directamente.
- Latencia: 134,8 ms p50 por caso segun la model card, frente a 710 ms de TypeSafe Jev 1.13.0 y 349 ms de ModernBERT-base. No se declara throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy | Brier Score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Laya (salabh-an/laya-typed-decisions) | 421 M | no disponible | 0,771 | 0,050 | apache-2.0 | Hugging Face + libreria `laya` |
| TypeSafe Jev 1.13.0 | no disponible | no disponible | 0,727 | 0,148 | no disponible | via API |
| ModernBERT-base | 149 M | no disponible | 0,646 | 0,119 | no disponible | no disponible |
| Teacher Self-Agreement | no disponible | no disponible | 0,735 | - | no disponible | no disponible (techo de referencia) |

La comparativa se limita a los modelos que la propia model card incluye en su tabla head-to-head. No se dispone de datos de parametros, contexto o licencia de TypeSafe Jev 1.13.0 ni de ModernBERT-base en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks no estan verificados (`verified: false` en el `model-index`); son cifras declaradas por el autor y no auditadas de forma independiente.
- Discrepancia de identificador: la model card indica cargar el modelo como `convaiinnovations/laya-typed-decisions`, mientras que el ID de Hugging Face es `salabh-an/laya-typed-decisions`. Conviene verificar la ruta correcta antes de integrarlo en produccion.
- No se declaran idiomas soportados: se desconoce si funciona fuera del ingles y como se comporta en otros idiomas.
- No se declara la longitud de contexto, por lo que no se puede garantizar el manejo de estados o conjuntos de preguntas largos.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo en dominios como atencion al cliente o seguridad.
- Riesgo de alucinacion: al ser un clasificador de decisiones tipadas, el riesgo no es generar texto falso sino emitir decisiones o puntuaciones incorrectas; la calibracion reportada (Brier 0,050, ECE 0,140) es un indicador, pero no elimina errores en casos fuera de distribucion.
- Dominio acotado: el modelo esta ajustado para cuatro dominios concretos (trazas de agentes, atencion al cliente, facturas, incidentes de seguridad); su comportamiento fuera de ellos no esta documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset LocalLLaMA/typed-decisions, cuya licencia no se detalla en la informacion proporcionada.
- Con 0 descargas y 0 "likes" en el momento de la consulta, es un modelo muy reciente y sin validacion por parte de la comunidad.
- La fecha de creacion registrada (2026-10-01) y los datos limitados de la ficha sugieren que la documentacion puede ser incompleta o estar en evolucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salabh-an/laya-typed-decisions
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Organizacion del autor/desarrollador: https://huggingface.co/convaiinnovations
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
