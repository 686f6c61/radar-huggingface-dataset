# ninhnv/chon-1.0-e2b

## Resumen

Chon-1.0-E2B es un modelo de decisión tipada (typed-decision) publicado por el usuario ninhnv en HuggingFace. No es un modelo generativo al uso: dado un estado (texto, JSON o una conversación) y una pregunta con un conjunto cerrado de opciones, devuelve una probabilidad calibrada para cada opción. Soporta tres tipos de pregunta: choice (elegir entre 2 y 16 opciones etiquetadas), yes/no (probabilidad de "sí") y score (distribución sobre niveles ordenados).

Técnicamente es un adaptador LoRA de aproximadamente 387 MB montado sobre google/gemma-4-E2B-it (Gemma 4 E2B, unos 2.000 millones de parámetros efectivos), que se carga sin modificar junto al adaptador. Sirve el formato de cable `/v1/systemone` de TypeSafe, el que consume JevBench. Cada decisión se resuelve en una única pasada forward, por lo que el modelo no genera tokens de salida (`output_tokens` siempre es 0).

Su relevancia actual está en el nicho de clasificación y enrutado con probabilidades calibradas, un caso de uso habitual en producción (triage de tickets, moderación, etiquetado) donde un LLM generativo resulta caro y poco determinista. El repositorio es muy reciente (creado el 16 de octubre de 2026), acumula 0 descargas y 0 likes, y está publicado bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre google/gemma-4-E2B-it; la model card no detalla la arquitectura interna del modelo base |
| Parametros totales | No disponible para el modelo base; el adaptador ocupa aproximadamente 387 MB en safetensors |
| Parametros activos | No disponible; la model card indica unos 2.000 millones de parametros efectivos en el modelo base, sin especificar si se trata de una arquitectura MoE |
| Longitud de contexto | Prompt de hasta 8.192 tokens; estado de entrada de hasta 6.000 tokens (los estados mas largos se truncan conservando el inicio) |
| Tipos de cuantizacion | No disponible; las mediciones publicadas usan bf16 |
| Idiomas soportados | Ingles; vietnamita |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) con configuracion PEFT; tokenizer y chat template del modelo base sin cambios |

## Arquitectura y entrenamiento

Chon-1.0-E2B se distribuye como un adaptador LoRA sobre google/gemma-4-E2B-it. El repositorio contiene `adapter_model.safetensors` y `adapter_config.json` (el adaptador PEFT), `chon_config.json` (ajustes de prompt y calibración que lee el servidor `chon`) y los ficheros del tokenizer del modelo base, que no se modifican. El modelo base se carga aparte, sin alteraciones. La model card no especifica la arquitectura interna del modelo base más allá de la mención a unos 2.000 millones de parámetros efectivos.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Lo que sí se documenta es la existencia de un conjunto held-out de 720 elementos en la mezcla sellada de JevBench v1.5 (Choice 360 / yes-no 180 / score 180, con niveles del 14/28/28/30 %), escrito para este proyecto y nunca usado en entrenamiento. La innovación técnica destacable es el propio formato de decisión: en lugar de generar texto libre, el modelo emite una distribución de probabilidad calibrada sobre opciones cerradas en una sola pasada forward, con un formato de respuesta `probabilities` (choice y score) o una probabilidad de "sí" para yes/no.

## Capacidades

- Decisión de opción múltiple: elección entre 2 y 16 opciones etiquetadas, devolviendo la elegida y las probabilidades de todas.
- Decisión binaria: probabilidad de "sí" para preguntas yes/no.
- Puntuación ordenada: distribución de probabilidad sobre niveles ordenados (score).
- Calibración de probabilidades: el objetivo declarado es que las probabilidades emitidas sean calibradas, no solo la etiqueta ganadora.
- Entrada heterogénea: acepta como estado texto plano, JSON o una conversación de hasta 6.000 tokens.
- Servicio mediante el formato de cable TypeSafe `/v1/systemone` que consume JevBench.
- Ejecución en GPU y en CPU (el paquete `chon` permite `--device cpu`).
- Multilingüe limitado: inglés y, con soporte adicional, vietnamita.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de razonamiento extenso.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia y un conjunto cerrado de colas (`refund`, `shipping`, `other`), el modelo devuelve la cola asignada con su probabilidad. El propio ejemplo de la model card ilustra este escenario con un pedido dañado.
- Triage y priorización en atención al cliente: usar preguntas yes/no encadenadas (por ejemplo, "¿el cliente solicita reembolso?") para derivar a un flujo automatizado cuando la probabilidad supera un umbral definido.
- Moderación de contenido: clasificar un mensaje en niveles ordenados (score) de severidad, aprovechando la distribución calibrada para fijar umbrales de actuación automática o revisión humana.
- Etiquetado de datos a escala: preetiquetar grandes volúmenes de texto con categorías cerradas antes de la revisión humana, reduciendo coste por elemento gracias a la pasada única y a la latencia baja en GPU.
- Encuestas y voz del cliente: convertir respuestas de texto libre en una puntuación ordenada (satisfacción, intención de recompra) mediante el tipo score.
- Enrutado de consultas en pipelines RAG: decidir, entre un conjunto de fuentes o herramientas, cuál corresponde a la consulta del usuario antes de recuperar contexto.
- Evaluación automática de respuestas: usar el tipo score para asignar niveles de calidad a salidas de otro modelo dentro de un harness de evaluación.
- Clasificación de intenciones en asistentes conversacionales: con el estado formado por el historial reciente, elegir una de las intenciones predefinidas del sistema.

## Benchmarks y rendimiento

Mediciones del propio autor (no son cifras oficiales de ningún leaderboard). La columna de calibración es un proxy, ya que el mapeo de calibración del board no está publicado por completo:

| Conjunto | Intelligence | Calibracion (proxy) | Capacidad (proxy) |
|---|---:|---:|---:|
| Held-out replica (720) | 57,6 | 79,7 | 68,7 |
| JevBench publico (231) | 70,3 | 85,0 | 77,6 |

Resultados con el harness oficial de JevBench (adaptador `typesafe`, ficheros públicos) contra el paquete servido, en precisión:

| Nivel | Precision |
|---|---:|
| Easy | 100,0 % |
| Original | 94,4 % |
| Hard | 73,0 % |

Latencia documentada, una petición a la vez:

| Entorno | Mediana | p95 |
|---|---:|---:|
| H100 80 GB | 0,05 s | 0,1 s |
| CPU (Xeon Platinum 8480+, 8 hilos, bf16) | 1,8 s | 2,2 s |

En la GPU se midieron 740 tokens de entrada y 0 de salida por decisión, en promedio. La medición en CPU corresponde a un servidor con aceleración bf16; el autor advierte que un portátil será más lento.

## Requisitos de hardware

- VRAM estimada: una GPU con 16 GB o más para bf16, según la model card. Es la única cifra de memoria publicada.
- GPU recomendadas: H100 80 GB (entorno de medición del autor); cualquier GPU con al menos 16 GB de VRAM debería ser suficiente para bf16, aunque no se listan modelos concretos adicionales.
- GPU de consumo: no se confirma explícitamente el soporte en tarjetas de consumo; con un requisito de 16 GB, quedarían dentro del rango una RTX 4080/4090 o equivalentes, pero es una inferencia y no un dato publicado.
- CPU: soportada mediante `--device cpu`; mediana de 1,8 s y p95 de 2,2 s en un Xeon Platinum 8480+ con bf16 y 8 hilos.
- Despliegue: servidor propio del paquete `chon` (`python -m chon.serve`), instalado con `pip install "chon[serve] @ git+https://github.com/xoai/chon"`. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otros runners.
- Latencia y throughput: mediana de 0,05 s por decisión en H100 80 GB, con una petición a la vez. No se publican cifras de throughput en concurrencia.

## Comparativa con modelos similares

No se documentan en la información disponible modelos comparables de decisión tipada con probabilidades calibradas. La única referencia verificable es el modelo base sobre el que se monta el adaptador:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ninhnv/chon-1.0-e2b | Adaptador LoRA de ~387 MB sobre un modelo de ~2.000 millones de parametros efectivos | 8.192 tokens de prompt / 6.000 tokens de estado | Decision tipada calibrada (choice, yes/no, score) | Apache-2.0 | HuggingFace |
| google/gemma-4-E2B-it | ~2.000 millones de parametros efectivos (segun la model card) | No disponible | LLM generalista con instruction tuning | Apache-2.0 | HuggingFace |
| Otras alternativas (clasificadores calibrados, LLM con salida estructurada) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Alcance funcional estrecho: el modelo está diseñado exclusivamente para decisiones con opciones cerradas; no se documenta generación de texto libre, código, matemáticas, tool calling ni razonamiento multi-paso.
- Truncado de la entrada: los estados de más de 6.000 tokens se recortan conservando el inicio, lo que puede eliminar información relevante situada al final del contexto.
- Idiomas limitados: solo inglés y, con soporte adicional, vietnamita. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Calibración no verificada de forma independiente: la columna de calibración de la tabla de evaluación es un proxy propio del autor, porque el mapeo oficial del board no está publicado por completo.
- Riesgo de alucinación y de sobreconfianza: al emitir distribuciones de probabilidad sobre opciones, una probabilidad alta no garantiza que la decisión sea correcta; en el conjunto held-out la métrica de Intelligence es de 57,6.
- Sesgos no documentados: no hay información sobre la composición del dataset de entrenamiento ni sobre sesgos conocidos, lo que dificulta una evaluación de riesgos previa a producción.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar esta ficha; no existen informes de terceros sobre su comportamiento en producción.
- Sin datos de cuantización: la model card solo menciona bf16, por lo que no se conocen los efectos de cuantizar el adaptador o el modelo base sobre la calibración.
- Licencia: Apache-2.0 tanto en el adaptador como en el modelo base, según la model card, por lo que no se declaran restricciones adicionales para uso comercial; conviene verificar los términos vigentes del modelo base.
- Dependencia de un paquete propio: el servicio se presta con el paquete `chon`, distribuido desde un repositorio Git, no desde PyPI.
- Coste operativo en CPU: en un servidor potente la mediana es de 1,8 s por decisión, lo que puede ser insuficiente para flujos interactivos sin GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ninhnv/chon-1.0-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio del servidor `chon`: https://github.com/xoai/chon
- Los resultados de la búsqueda web realizada no contienen enlaces relacionados con este modelo; todos apuntan a titulaciones universitarias de frigorista y se han descartado por no ser relevantes.
