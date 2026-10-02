# fcelabs/laya-glendesk-issues

## Resumen

Laya (fine-tuned for GlenDesk call analysis) es un modelo de decision de "System 1" desarrollado por FCE Labs y fine-tuneado por GlenDesk. No es un modelo generativo de lenguaje generalista, sino un clasificador estructurado que, dado un input (en este caso transcripciones de llamadas), devuelve una decision tipada acompanada de probabilidades calibradas. El modelo se apoya en el formato del benchmark LocalLLaMA/typed-decisions y esta especializado en la deteccion de 11 tipos de incidencias en llamadas de atencion al cliente.

Tecnicamente se trata de un modelo de 421.293.830 parametros (aproximadamente 421 M) distribuido en formato safetensors y cargable mediante la libreria `transformers`. Su arquitectura es no autorregresiva, orientada a producir decisiones estructuradas y calibradas en lugar de texto libre, lo que reduce la latencia y elimina la variabilidad de las salidas generativas. La familia Laya se presenta publicamente como un motor de decision multilingue con latencias del orden de decenas de milisegundos.

La relevancia de esta ficha radica en que es un ejemplo poco habitual de modelo de decision acotada ("bounded decision"): se evalua con metricas de calibracion (Brier score, ECE) ademas de la exactitud. En el conjunto de test de GlenDesk (400 casos) obtiene una exactitud de 0,357, por debajo de las alternativas generalistas y especialistas incluidas en su propia comparativa, con la ventaja de un coste cero por caso al ser autoalojable y una latencia p50 de 130,6 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decision no autorregresivo (System 1) para decisiones estructuradas y calibradas; detalles internos de capas no disponibles |
| Parametros totales | 421.293.830 (aprox. 421 M) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | No disponibles para este fine-tune; la familia Laya se describe como multilingue en el sitio del proyecto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

Segun las fuentes disponibles, Laya pertenece a una familia de modelos de decision no autorregresivos ("System 1") disenados para tomar una decision acotada sobre una entrada y devolver una respuesta estructurada con probabilidades. A diferencia de un LLM autorregresivo, no genera parrafos de texto: clasifica el input y emite una decision tipada, lo que explica su baja latencia y su orientacion a metricas de calibracion. Esta variante concreta tiene 421 M de parametros y se carga con `transformers` como tarea de clasificacion de texto.

El fine-tune se ha realizado sobre clusters de analisis de llamadas de GlenDesk: 11 tipos de incidencia, 711 ejemplos y 4.977 secuencias de entrenamiento, derivadas del formato del benchmark LocalLLaMA/typed-decisions. Se evalua sobre un conjunto de test de GlenDesk de 400 casos. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF/DPO; las etiquetas del modelo mencionan conceptos como "rlcd" y "calibrated-decisions", pero no se aporta informacion tecnica adicional sobre el proceso de optimizacion.

## Capacidades

- Clasificacion de transcripciones de llamadas en 11 categorias de incidencia concretas.
- Deteccion de incidencias especificas como `hallucination_beauty_phrase`, `non_english_char_leak`, `midcall_response_glitch`, `status_asked_false_positive`, `banned_filler_gap_definitely_help`, `customer_lookup_no_match_on_number`, `abrupt_hangup_pattern`, `summary_fabrication_vehicle_details`, `repeated_transfer_reason_loop`, `digit_transposition_caller_id` y `transfer_failure_retry`.
- Produccion de decisiones tipadas con probabilidades calibradas (Brier score, ECE) en lugar de texto libre.
- Ejecucion de decisiones acotadas sobre distintos tipos de entrada segun la familia Laya (tickets, correos, conversaciones, estado JSON), aunque este fine-tune esta orientado a transcripciones de llamadas.
- Inferencia de baja latencia (p50 de 130,6 ms declarada) apta para entornos de autoalojamiento.
- API de uso sencilla mediante la libreria `laya` (`laya.load(...)` y `agent.predict(transcript, questions)`).

No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento abierto, codigo, matematicas, vision, audio, tool calling ni soporte de agentes multi-paso.

## Casos de uso

- Control de calidad de centros de contacto: el modelo clasifica automaticamente las transcripciones de llamadas y marca las que contienen incidencias de las 11 categorias definidas, de modo que los equipos de QA pueden priorizar la revision de casos problematicos en lugar de escuchar todas las llamadas.
- Deteccion de alucinaciones en asistentes de voz: categorias como `hallucination_beauty_phrase` o `summary_fabrication_vehicle_details` permiten identificar respuestas fabricadas por el asistente, util para auditar la fiabilidad del sistema conversacional.
- Monitorizacion de fallos tecnicos en tiempo real: etiquetas como `transfer_failure_retry`, `midcall_response_glitch` o `repeated_transfer_reason_loop` sirven para detectar problemas de enrutamiento o de plataforma y disparar alertas operativas.
- Analisis de identificacion de cliente: `customer_lookup_no_match_on_number` y `digit_transposition_caller_id` ayudan a medir la tasa de fallos en la identificacion del llamante por numero.
- Cumplimiento y politica de comunicacion: `banned_filler_gap_definitely_help` y `status_asked_false_positive` permiten auditar el uso de muletillas prohibidas o afirmaciones de estado incorrectas, apoyando la supervision de cumplimiento.
- Etiquetado y enriquecimiento de datos a escala: el modelo puede preetiquetar grandes volumenes de transcripciones como paso previo a una revision humana, reduciendo el coste de anotacion en pipelines de datos.
- Clasificacion local sin coste por llamada: al ser autoalojable (coste por caso de 0,00 USD declarado), es adecuado para entornos con alto volumen y requisitos de privacidad, donde no se desea enviar transcripciones a una API externa.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test de GlenDesk (400 casos), tarea de clasificacion de texto sobre el dataset Typed Decisions:

| Modelo | Tipo | Exactitud | Soft Acc | Brier score | ECE | Score MAE | Dentro de 1 nivel | Latencia (p50) | Coste/caso |
|---|---|---|---|---|---|---|---|---|---|
| Laya (este modelo) | Fine-tuned | 0,357 | 0,362 | 0,280 | 0,057 | 0,683 | 0,756 | 130,6 ms | 0,00 USD (autoalojado) |
| TypeSafe Jev 1.13.0 | General | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | 0,952 | 710 ms | 0,0004 USD (API) |
| ModernBERT-base (149 M) | Especialista | 0,646 | 0,542 | 0,119 | 0,179 | 0,444 | 0,931 | 349 ms | 0,00 USD |
| Teacher Self-Agreement | Techo | 0,735 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Resultados de la model-index (System One Decision Benchmark, dataset Typed Decisions): accuracy 0,357 y brier_score 0,280, ambos marcados como no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 421 M de parametros):
  - FP32: aproximadamente 1,7 GB.
  - FP16 / BF16: aproximadamente 0,85 GB.
  - INT8: aproximadamente 0,42 GB (si se aplica cuantizacion, no documentada oficialmente).
  - INT4: aproximadamente 0,21 GB (si se aplica cuantizacion, no documentada oficialmente).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en GPUs de datacenter (A100, H100) sobredimensionadas para este tamano.
- Puede ejecutarse en CPU para cargas moderadas dado su reducido numero de parametros.
- Opciones de despliegue: `transformers` (pipeline de text-classification) y la libreria propia `laya`. No se documenta compatibilidad explicita con vLLM, llama.cpp, Ollama o TGI, aunque el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia declarada: 130,6 ms en p50 (la mas baja de la comparativa del autor). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Exactitud (GlenDesk) | Coste/caso | Licencia |
|---|---|---|---|---|---|
| Laya (este modelo) | 421 M | Decision System 1, fine-tuned | 0,357 | 0,00 USD (autoalojado) | Apache 2.0 |
| TypeSafe Jev 1.13.0 | No disponible | Modelo general (familia Jev de TypeSafe AI) | 0,727 | 0,0004 USD (API) | No disponible |
| ModernBERT-base | 149 M | Especialista (encoder) | 0,646 | 0,00 USD | No disponible en esta ficha |
| Teacher Self-Agreement | No disponible | Techo de referencia del benchmark | 0,735 | No disponible | No disponible |

En la comparativa del propio autor, Laya obtiene la exactitud mas baja (0,357) frente a TypeSafe Jev 1.13.0 (0,727) y ModernBERT-base (0,646), aunque presenta la mejor calibracion medida por ECE (0,057) y la menor latencia (130,6 ms). El techo de referencia (Teacher Self-Agreement) se situa en 0,735.

## Limitaciones y advertencias

- Rendimiento bajo en exactitud: 0,357 frente a 0,646 de ModernBERT-base y 0,727 de TypeSafe Jev 1.13.0 en el mismo conjunto de test. El modelo queda muy por debajo del techo de referencia (0,735).
- Especializacion estrecha: solo cubre las 11 categorias de incidencia de GlenDesk definidas en la model card; fuera de ese dominio no se documenta utilidad.
- Idiomas no declarados: aunque la familia Laya se describe como multilingue, este fine-tune no especifica idiomas soportados, lo que limita su uso fuera del idioma o idiomas de las llamadas de entrenamiento.
- Longitud de contexto no documentada: se desconoce si transcripciones largas se truncan o como se gestionan.
- Datos de entrenamiento limitados: 711 ejemplos y 4.977 secuencias, un volumen reducido que puede comprometer la generalizacion.
- Riesgo de alucinacion en la propia tarea: dado que el modelo clasifica incidencias como "hallucination", sus propias predicciones tambien pueden ser incorrectas y no deben usarse sin supervision en decisiones criticas.
- Metricas no verificadas: los resultados de la model-index estan marcados como `verified: false`, por lo que proceden unicamente del autor.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopcion ni validacion independiente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento (dataset LocalLLaMA/typed-decisions), cuya licencia no se detalla en la informacion disponible.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgo.
- Caveat de produccion: no se documenta cuantizacion soportada ni despliegue en servidores de inferencia de alto rendimiento (vLLM, TGI), lo que puede limitar el escalado masivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fcelabs/laya-glendesk-issues
- Dataset de referencia: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Blog "Laya AI Model: How It Works, Run It Locally, and Evaluate It": https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
- Sitio del proyecto Laya (33 ms Multilingual System 1 Decision Engine): https://laya.convaiinnovations.com/
- Repositorio relacionado GeekyAbs/laya: https://huggingface.co/GeekyAbs/laya
- FCE Labs: https://fcelabs.com/
- Articulo "I Built Non-Autoregressive Decision Models a Year Ago. Then a Frontier Lab Called It...": https://dev.to/nandakishor_m_6cc0adfde9f/i-built-non-autoregressive-decision-models-a-year-ago-then-a-frontier-lab-called-it-a-18me
