# shreyanbr/system-one-gold

## Resumen

System One (gold) es un cross-encoder de tipo encoder-only construido sobre DeBERTa-v3-xsmall, con 70.830.722 parametros, publicado por el usuario shreyanbr en HuggingFace. Su proposito no es generar texto, sino responder preguntas de decision tipadas (Choice, Score y Noul) en una unica pasada forward por lote y con cero tokens generados. Implementa un esquema HTTP propio, `POST /v1/systemone`, dentro del ecosistema que el autor denomina TypeSafe Jev, y esta pensado para decisiones de enrutado, clasificacion y gating dentro de software que no necesita un modelo autorregresivo.

El modelo resuelve el problema de las decisiones auxiliares de bajo coste en pipelines de IA: clasificar la intencion de un mensaje, decidir si hace falta invocar una herramienta, tipar un ticket o marcar si es un incidente. Al ser un cross-encoder de ~70,8 M de parametros, el coste por inferencia es muy inferior al de un LLM autorregresivo, y el autor lo plantea explicitamente como alternativa a usar un modelo de chat para tareas de enrutado. La supervision proviene de las etiquetas propias de cada dataset, con 4.000 elementos de entrenamiento por tarea, y los resultados se miden sobre particiones de test de 500 elementos.

Es relevante ahora porque documenta de forma inusualmente honesta el suelo de rendimiento de sus propias tareas: en dos de las seis preguntas (`needs_tool` y `priority`) todos los sistemas medidos, incluido Claude Haiku 4.5, quedan en el nivel o por debajo de un predictor constante. El autor advierte que eso es un hallazgo sobre las etiquetas y no sobre los modelos, y que ya retiro publicamente una de sus cifras anteriores por este mismo motivo. El checkpoint se publica con licencia Apache 2.0, pesa 0,3 GB e incluye un fichero `calibration.json` obligatorio para interpretar las salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (cross-encoder) basado en DeBERTa-v3-xsmall; respuesta a preguntas tipadas en una sola pasada forward |
| Parametros totales | 70.830.722 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredado de la arquitectura base DeBERTa-v3-xsmall; no se explicita en la model card) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin variantes cuantizadas oficiales |
| Idiomas soportados | No disponible; el checkpoint base indicado se construye sobre DeBERTa-v3-xsmall, cuyo preentrenamiento es mayoritariamente en ingles, y no se documenta cobertura multilingue |
| Licencia | Apache 2.0 (con restricciones sobre los datos de supervision de la tarea `triage`, ver limitaciones) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | zero-shot-classification |
| Modelo base | MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33 |
| Fecha de publicacion | 2026-09-19 (ultima actualizacion 2026-09-19) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only en configuracion cross-encoder: el modelo recibe conjuntamente el estado (por ejemplo, el mensaje de un cliente) y la definicion de la pregunta con sus criterios, y produce directamente la respuesta, sin decodificacion autorregresiva ni generacion de tokens. Sobre esta base se resuelven preguntas tipadas de tres clases (Choice, Score y Noul) mediante una unica pasada forward por lote. El checkpoint parte de `MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33`, un modelo de clasificacion zero-shot, y anade cabezas y logica de decision para el esquema TypeSafe Jev.

En cuanto al entrenamiento, la model card indica que la supervision de este checkpoint son las etiquetas propias de cada dataset, con 4.000 elementos de entrenamiento por tarea. No se documenta en la informacion disponible el numero total de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no procede en un encoder de clasificacion, pero no se confirma). Tampoco se detalla si hubo destilacion o ajuste con datos sinteticos. El autor si documenta dos elementos de ingenieria relevantes: la evaluacion se hace sobre particiones de test de 500 elementos, y el repositorio incluye un `calibration.json` obligatorio que aporta una temperatura por pregunta y un escalador de Platt, porque los margenes crudos del modelo no son probabilidades.

## Capacidades

- Respuesta a preguntas de decision tipadas con tres formatos: Choice (elegir entre criterios definidos en tiempo de inferencia), Score y Noul.
- Clasificacion zero-shot: los criterios de cada pregunta se definen en la peticion, sin reentrenar el modelo.
- Inferencia en una sola pasada forward y sin tokens generados, lo que reduce el coste por decision frente a un modelo autorregenerativo.
- Tareas cubiertas y documentadas con metrica: `intent` (intencion del usuario), `tool` (herramienta aplicable), `needs_tool` (si hace falta herramienta), `priority` (prioridad), `type` (tipo de caso) e `is_incident` (marcado de incidente).
- Salidas calibrables: con `calibration.json` el motor convierte margenes en probabilidades, lo que permite fijar umbrales de decision.
- Gating previo a un LLM: el modelo puede actuar como router y evitar llamadas a un modelo mayor cuando la decision es sencilla.
- Integracion como API HTTP mediante el esquema `POST /v1/systemone`.
- No dispone de generacion de texto libre, razonamiento multi-paso, codigo, matematicas, vision, audio ni tool calling nativo con ejecucion de funciones; su funcion es decidir, no ejecutar.

## Casos de uso

- **Enrutado de intenciones en atencion al cliente.** La pregunta `intent` alcanza 0,676 de accuracy frente a un suelo de 0,010, lo que la convierte en la tarea con mayor margen sobre el predictor constante. Se usaria para derivar cada mensaje entrante al flujo correcto (por ejemplo, "tarjeta no recibida" frente a "solicitud de reembolso") definiendo los criterios en la propia peticion.
- **Gating de tool calling en agentes.** `tool` obtiene 0,944 de accuracy con un suelo de 0,306, el mejor resultado documentado del modelo. Es adecuado como primera etapa que decide que herramienta corresponde a una consulta antes de invocar un LLM con function calling, reduciendo coste y latencia.
- **Clasificacion documental por tipo.** `type` logra 0,760 frente a un suelo de 0,374, lo que permite etiquetar automaticamente tickets o incidencias por categoria dentro de un pipeline de ingesta.
- **Deteccion de incidentes en monitorizacion.** `is_incident` obtiene 0,804 con un suelo de 0,626. El margen sobre el suelo es menor, por lo que resulta util como senal adicional dentro de un sistema de alertas, no como unico criterio.
- **Pre-filtro economico delante de un LLM.** Al no generar tokens y ocupar ~283 MB en fp32, puede desplegarse como router en CPU y reservar el modelo autorregresivo solo para los casos que realmente lo requieran.
- **Clasificacion zero-shot con taxonomias variables.** Gracias al formato de criterios definidos en la peticion, un mismo despliegue puede servir a distintos clientes o dominios sin reentrenamiento, simplemente cambiando el diccionario de criterios.
- **Reglas de negocio con umbral calibrado.** El `calibration.json` permite traducir margenes a probabilidades y aplicar umbrales (por ejemplo, escalar a un humano cuando la confianza es baja), algo inviable con los margenes crudos.
- **Triaje de tickets (con reservas).** La tarea `priority` queda en 0,464, exactamente en el suelo de `majority`, por lo que el propio autor la describe como practicamente no aprendible sobre estos datos. No se recomienda su uso productivo.

## Benchmarks y rendimiento

Accuracy sobre las particiones de test de 500 elementos, tal como las publica el autor. La columna de suelo `majority` corresponde a un predictor constante y debe leerse junto a la accuracy, no de forma aislada.

| Pregunta | Accuracy | Suelo `majority` | Margen sobre el suelo |
|---|---:|---:|---:|
| `tool` | 0,944 | 0,306 | +0,638 |
| `is_incident` | 0,804 | 0,626 | +0,178 |
| `type` | 0,760 | 0,374 | +0,386 |
| `needs_tool` | 0,694 | 0,694 | 0,000 |
| `intent` | 0,676 | 0,010 | +0,666 |
| `priority` | 0,464 | 0,464 | 0,000 |

No se publican en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar, algo esperable en un modelo de clasificacion. La model card menciona que dos de las seis preguntas quedan en el suelo o por debajo para todos los sistemas medidos, incluido Claude Haiku 4.5, pero no incluye la tabla de resultados de ese sistema, por lo que no es posible reproducir la comparacion numerica.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 283 MB en fp32 (70,8 M de parametros), unos 142 MB en fp16/bf16 y unos 71 MB en int8. Son estimaciones derivadas del recuento de parametros; el autor no publica cifras oficiales. Hay que sumar el espacio de activaciones segun el tamano de lote.
- GPU: cabe holgadamente en cualquier GPU de consumo (RTX 3060, 4060, 4090, etc.) e incluso en GPUs integradas. No requiere A100 ni H100.
- CPU: es viable en CPU para inferencia individual, dado el tamano del modelo y que no hay decodificacion autorregresiva.
- Opciones de despliegue: la libreria declarada es `transformers`, y el tag `endpoints_compatible` indica compatibilidad con HuggingFace Inference Endpoints. No se documentan recetas oficiales para vLLM, TGI, llama.cpp u Ollama, y no se publican pesos GGUF; al tratarse de un encoder de clasificacion, el autor no plantea ese tipo de serving.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de peticiones por segundo. Como referencia cualitativa, al resolver cada decision en una unica pasada forward sin generar tokens, el coste por inferencia es estructuralmente inferior al de un modelo autorregresivo del mismo orden de magnitud.
- Almacenamiento: el repositorio completo ocupa 0,3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento documentado |
|---|---|---|---|---|---|
| shreyanbr/system-one-gold | 70,8 M | 512 tokens (heredado) | Apache 2.0 (con reservas sobre datos de `triage`) | Pesos abiertos en HuggingFace | Tabla de accuracy por pregunta incluida en esta ficha |
| MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33 (modelo base) | ~70,8 M (no confirmado en la informacion disponible) | 512 tokens | No disponible | Pesos abiertos en HuggingFace | No disponible |
| Claude Haiku 4.5 (backend alternativo citado por el autor) | No disponible | No disponible | Propietaria | Solo API | El autor indica que queda en el suelo o por debajo en `needs_tool` y `priority`; no se publican sus cifras completas |

La comparacion mas informativa que aporta la documentacion no es de rendimiento sino de comportamiento: en las dos preguntas con suelo igual a la accuracy, el propio autor senala que ningun sistema medido, tampoco un modelo propietario de API, supera a un predictor constante, lo que sugiere un problema de etiquetado en esos conjuntos.

## Limitaciones y advertencias

- **Contaminacion del checkpoint base.** El checkpoint base se entreno con banking77, por lo que la fila correspondiente esta contaminada. Ademas, banking77 tiene una tasa publicada de errores de etiquetado cercana al 14 %, lo que limita la accuracy alcanzable a alrededor de 0,86 en ese conjunto.
- **Tareas en el suelo.** `triage.priority` es practicamente no aprendible con estos datos: 0,464 de accuracy frente a un suelo de 0,464. `needs_tool` tambien queda exactamente en el suelo (0,694). No deben usarse como unico criterio de decision.
- **Restriccion de uso comercial en el triaje.** El dataset `tickets`, que aporta la supervision de `triage`, tiene licencia CC-BY-NC-4.0. Por tanto, la supervision de triaje no es apta para uso comercial, aunque la licencia del modelo sea Apache 2.0.
- **Calibracion obligatoria.** Los margenes crudos no son probabilidades. El motor lee una temperatura por pregunta y un escalador de Platt desde `calibration.json`; sin ese fichero las salidas no deben interpretarse como probabilidades.
- **Una sola semilla y una sola ejecucion.** Los intervalos publicados son bootstrap sobre los elementos de test, no sobre semillas de entrenamiento, por lo que no capturan la variabilidad del propio entrenamiento.
- **Retractacion de una cifra previa.** El repositorio documenta la retractacion de uno de sus propios resultados destacados por el problema de etiquetado descrito, lo que refuerza la cautela al citar cualquier numero aislado.
- **Riesgo de alucinacion.** Al ser un clasificador y no un generador de texto, no alucina en el sentido habitual, pero puede asignar con alta confianza una etiqueta incorrecta cuando la pregunta no esta bien definida o el criterio no cubre el caso.
- **Cobertura idiomatica no documentada.** No se especifica que idiomas soporta; el preentrenamiento del backbone es mayoritariamente en ingles, por lo que el rendimiento en castellano no esta garantizado ni medido.
- **Contexto limitado.** La ventana heredada de 512 tokens restringe el uso a mensajes o fragmentos cortos, no a documentos largos.
- **Adopcion nula.** El modelo registra 0 descargas y 0 likes, sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shreyanbr/system-one-gold
- Repositorio con codigo fuente, arnes de benchmark y seccion completa de limitaciones: https://github.com/shreyanbr/jev-haiku-benchmarking
- Modelo base: https://huggingface.co/MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Los resultados devueltos corresponden a sDNA (analisis de redes viarias y accesibilidad) en GIS Stack Exchange y no guardan ninguna relacion con el modelo.
