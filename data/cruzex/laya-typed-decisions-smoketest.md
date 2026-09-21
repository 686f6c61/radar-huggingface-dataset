# Cruzex/laya-typed-decisions-smoketest

## Resumen

Laya (fine-tuned on Typed-Decisions Benchmark) es un modelo de 421.293.830 parámetros (aproximadamente 421M) publicado por Cruzex bajo licencia Apache 2.0, con pesos en safetensors y librería `transformers`. Se presenta como un ajuste fino orientado a la resolución de decisiones tipadas (typed decisions) sobre estados de flujo de trabajo de agentes: recibe un estado (`state`) y un conjunto de preguntas estructuradas (`questions`), y devuelve respuestas en una única pasada hacia delante. El repositorio tiene un tamano de 0,8 GB y no registra descargas ni "likes" en el momento de redactar esta ficha.

El propio autor lo etiqueta explícitamente como un smoke test, no como una evaluación completa: el ajuste se hizo con 40 ejemplos de entrenamiento y 1 época, y la evaluación se limitó a 20 casos (100 decisiones) de una única categoría de flujo de trabajo, Agent Trace Observability, en lugar del conjunto oficial de 400 casos y 2.000 decisiones. En esa porción reducida declara una precisión de 0,460, inferior a las referencias que el mismo autor cita (TypeSafe Jev 1.13.0 con 0,727 y el techo de autoacuerdo del profesor con 0,735), aunque con una latencia mediana mucho menor (76,8 ms frente a 710 ms) y coste autoconsultado de 0,00 dólares por caso.

La relevancia del lanzamiento es, por tanto, metodológica más que de rendimiento: sirve como comprobación de la tubería de evaluación de decisiones calibradas (accuracy, soft accuracy, Brier, ECE, MAE de score, "within 1 level") y como ejemplo de modelo pequeno orientado a clasificación estructurada de trazas de agentes. No hay información publicada sobre arquitectura, idiomas soportados ni proceso de entrenamiento más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni SSM) |
| Parametros totales | 421.293.830 (dato real de safetensors) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tarea declarada | text-classification |
| Tamano del repositorio | 0,8 GB |
| Fecha de creacion | 2026-09-21T17:45:52.000Z (segun metadatos de HuggingFace) |
| Ultima actualizacion | 2026-09-21T18:33:57.000Z (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo: no se indica si es un transformer encoder, un modelo tipo BERT/ModernBERT, un decoder o un hibrido, ni el numero de capas, dimensiones de embedding o mecanismo de atencion. Lo unico confirmado por los metadatos es que se distribuye en safetensors, que se carga con `transformers` y que su tarea declarada es clasificacion de texto. El flujo de uso descrito consiste en una unica pasada hacia delante sobre un estado de flujo de trabajo y un conjunto de preguntas tipadas, devolviendo un diccionario de respuestas (`result["answers"]`).

En cuanto al entrenamiento, la model card indica un ajuste fino sobre 40 ejemplos de entrenamiento durante 1 epoca, evaluado sobre 20 casos (100 decisiones) de una sola categoria de flujo de trabajo, Agent Trace Observability. No se especifica el numero total de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento; tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Los conceptos que aparecen en las etiquetas (calibrated-decisions, rlcd, system-one, structured-decisions, typed-decisions) describen el objetivo de decision calibrada, pero no se desarrollan en la informacion disponible.

## Capacidades

- Clasificacion de decisiones tipadas: dado un estado de flujo de trabajo y un conjunto de preguntas estructuradas, produce respuestas en una sola pasada hacia delante, segun el ejemplo de la model card (`agent.predict(state, questions)`).
- Salida probabilisticamente calibrable: la evaluacion reportada incluye Brier score (0,184), ECE (0,124) y MAE de score (0,614), lo que indica que el modelo emite valores de confianza o nivel, no solo una clase discreta.
- Tolerancia a nivel de decision: la metrica "within 1 level" es de 0,875, es decir, casi nueve de cada diez predicciones caen como maximo a un nivel de la respuesta correcta en la escala evaluada.
- Operacion autoconsultada de bajа latencia: 76,8 ms de mediana por caso en la tabla comparativa publicada por el autor, con coste declarado de 0,00 dolares por caso al ejecutarse en infraestructura propia.
- Generacion de texto libre: no disponible (no se documenta como modelo generativo).
- Razonamiento multi-paso y agentes: no disponible (el modelo resuelve decisiones en una unica pasada, sin bucle de razonamiento declarado).
- Tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible, no se declaran idiomas soportados.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Triaje de trazas de agentes (Agent Trace Observability): el escenario exacto sobre el que se evaluo el modelo. Se le pasaria el estado de una traza (herramientas invocadas, errores, tiempos, pasos intermedios) junto con preguntas tipadas del tipo "ha fallado la tarea", "el fallo es recuperable" o "requiere intervencion humana", obteniendo respuestas etiquetadas para alimentar paneles de monitorizacion.
- Enrutamiento de decisiones en pipelines de agentes: usar la salida del modelo para decidir si una ejecucion continua, se reintenta o se escala a un operador, aprovechando la latencia mediana de 76,8 ms, compatible con comprobaciones en linea por paso.
- Etiquetado y clasificacion de tickets de soporte: aplicar el mismo esquema de preguntas tipadas (categoria, severidad, necesidad de escalado) sobre descripciones de incidencias, con la ventaja de que no requiere llamadas a APIs externas si se despliega en local.
- Investigacion sobre calibracion y decision estructurada: el modelo sirve como banco de pruebas reproducible para comparar metricas de calibracion (Brier, ECE, MAE de score) frente a especialistas como ModernBERT-base, dado que la model card publica la tabla comparativa completa.
- Moderacion de contenido con niveles graduados: al devolver un nivel y no solo una clase, permite definir umbrales de actuacion (permitir, revisar, bloquear) ajustando el coste de falsos negativos sin reentrenar.
- Filtrado previo en canalizaciones de evaluacion de agentes: descartar rapidamente trazas que cumplen criterios evidentes antes de pasarlas a un modelo mayor o a revision humana, reduciendo coste por caso.
- Clasificacion documental con preguntas tipadas: cualquier tarea donde el esquema de salida sea fijo (por ejemplo, extraer si un contrato contiene clausulas de un tipo concreto) y se pueda formular como preguntas estructuradas sobre un estado textual.

Advertencia comun a todos ellos: el autor indica expresamente que los resultados publicados corresponden a un smoke test sobre 40 ejemplos de entrenamiento, por lo que estos casos de uso requieren una reevaluacion completa y, previsiblemente, un reajuste antes de cualquier despliegue en produccion.

## Benchmarks y rendimiento

Resultados declarados en el model-index de la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| System One Decision Benchmark | LocalLLaMA/typed-decisions | accuracy | 0,46 | no |
| System One Decision Benchmark | LocalLLaMA/typed-decisions | brier_score | 0,184 | no |

Comparativa completa publicada por el autor en la model card:

| Modelo | Tipo | Accuracy | Soft accuracy | Brier score | ECE | MAE de score | Within 1 level | Latencia (p50) | Coste por caso |
|---|---|---|---|---|---|---|---|---|---|
| Laya (fine-tuned) | ajuste fino | 0,460 | 0,376 | 0,184 | 0,124 | 0,614 | 0,875 | 76,8 ms | 0,00 $ (autoalojado) |
| TypeSafe Jev 1.13.0 | general | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | 0,952 | 710 ms | 0,0004 $ (API) |
| ModernBERT-base (149M) | especialista | 0,646 | 0,542 | 0,119 | 0,179 | 0,444 | 0,931 | 349 ms | 0,00 $ |
| Teacher Self-Agreement | techo de referencia | 0,735 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota del autor incluida en la model card: la comparacion no es directa con las cifras publicadas del benchmark completo (400 casos, 2.000 decisiones) debido a la diferencia de escala, y los resultados deben interpretarse como una comprobacion de sanidad de la tuberia, no como una evaluacion real de las capacidades de Laya. El modelo evaluado rinde por debajo de TypeSafe Jev 1.13.0 y de ModernBERT-base en accuracy, soft accuracy y MAE de score, y por encima de ambos en latencia; su Brier score (0,184) es peor que el de ModernBERT-base (0,119) y similar al de TypeSafe Jev (0,148), mientras que su ECE (0,124) es el mejor de los tres.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 421.293.830 parametros: en FP32, aproximadamente 1,69 GB; en BF16/FP16, aproximadamente 0,84 GB; en INT8, aproximadamente 0,42 GB; en INT4, aproximadamente 0,21 GB. A estas cifras hay que sumar el coste de activaciones y del lote, no desglosado en la informacion disponible.
- El tamano del repositorio (0,8 GB) es coherente con pesos en precision de 16 bits, no con FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede alojar el modelo en FP16 (por ejemplo, GTX 1650, RTX 3050, T4); tarjetas como RTX 3060, RTX 4070 o RTX 4090 lo ejecutan con margen amplio para lotes grandes. Aceleradores de centro de datos (A100, H100) no son necesarios y resultarian sobredimensionados para 421M de parametros.
- Cabe en GPU de consumo: si, con holgura. Tambien es viable la inferencia en CPU, dado el reducido numero de parametros y la latencia objetivo de decenas de milisegundos, aunque no se publican cifras de latencia en CPU.
- Opciones de despliegue: la libreria declarada es `transformers` y el repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con HuggingFace Inference Endpoints. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, por lo que esas opciones quedan como no disponibles.
- Latencia y throughput: la model card reporta 76,8 ms de mediana por caso en autoalojamiento, frente a 710 ms de TypeSafe Jev 1.13.0 y 349 ms de ModernBERT-base. No se publican cifras de throughput ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Accuracy | Brier score | ECE | Latencia p50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Laya (fine-tuned on Typed-Decisions) | 421.293.830 | ajuste fino especifico | 0,460 | 0,184 | 0,124 | 76,8 ms | apache-2.0 | HuggingFace, safetensors, `transformers` |
| TypeSafe Jev 1.13.0 | no disponible | sistema general | 0,727 | 0,148 | 0,144 | 710 ms | no disponible | acceso via API (0,0004 $ por caso) |
| ModernBERT-base | 149.000.000 | especialista | 0,646 | 0,119 | 0,179 | 349 ms | no disponible | no disponible en la informacion proporcionada |
| Teacher Self-Agreement | no disponible | techo de referencia | 0,735 | no disponible | no disponible | no disponible | no disponible | no disponible |

Los unicos datos comparativos disponibles proceden de la propia model card. No se dispone de informacion sobre licencia, contexto o requisitos de hardware de TypeSafe Jev 1.13.0 ni de ModernBERT-base mas alla de lo recogido aqui, por lo que la comparacion debe limitarse a las metricas de decision y latencia expuestas.

## Limitaciones y advertencias

- Naturaleza de smoke test: el modelo se ajusto con 40 ejemplos durante 1 epoca y se evaluo sobre 20 casos (100 decisiones) de una sola categoria de flujo de trabajo. El autor advierte explicitamente de que no es una evaluacion real de sus capacidades.
- Metricas no verificadas: los resultados del model-index figuran con `verified: false`; ademas, la comparacion con el benchmark completo (400 casos, 2.000 decisiones) no es valida segun el propio autor por diferencia de escala.
- Rendimiento inferior a las referencias: 0,460 de accuracy frente a 0,727 de TypeSafe Jev 1.13.0, 0,646 de ModernBERT-base y un techo de autoacuerdo del profesor de 0,735. El soft accuracy (0,376) tambien es el mas bajo de la tabla.
- Riesgo de sobreajuste y de generalizacion: con 40 ejemplos de entrenamiento en una unica categoria, es previsible un comportamiento degradado en cualquier otro dominio o flujo de trabajo.
- Calibracion: aunque el ECE es el mejor de la comparativa (0,124), el Brier score (0,184) y el MAE de score (0,614) indican error apreciable en la magnitud de la confianza o del nivel predicho; no conviene usar directamente esas probabilidades para umbrales criticos sin recalibracion.
- Idiomas: no se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingue ni siquiera en castellano.
- Contexto: se desconoce la longitud de contexto soportada, dato relevante si el estado del flujo de trabajo o el conjunto de preguntas es extenso.
- Alucinacion: el modelo se presenta como clasificador de decisiones y no como generador de texto libre, por lo que el riesgo tipico de alucinacion no aplica del mismo modo; no obstante, la informacion disponible no permite descartar respuestas inconsistentes en esquemas de preguntas no vistos.
- Licencia: Apache 2.0, por lo que se permite uso comercial segun los terminos de dicha licencia; no se anaden restricciones adicionales en la informacion proporcionada.
- Discrepancia de identificadores: el repositorio consultado es `Cruzex/laya-typed-decisions-smoketest`, mientras que el ejemplo de carga de la model card apunta a `convaiinnovations/laya-typed-decisions`. Conviene verificar cual es el artefacto definitivo antes de integrarlo.
- Adopcion nula registrada: 0 descargas y 0 "likes" en el momento de la consulta, sin senales de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cruzex/laya-typed-decisions-smoketest
- Pagina del desarrollador citado en la model card: https://huggingface.co/convaiinnovations
- Referencia de carga alternativa indicada en la model card: `convaiinnovations/laya-typed-decisions`
- Paquete de Python mencionado en la model card: `pip install laya` (no se proporciona URL de repositorio ni de PyPI en la informacion disponible)
- Paper, blog o repositorio adicional: no disponibles; las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (solo paginas de ayuda de YouTube y Zhihu sin relacion).
