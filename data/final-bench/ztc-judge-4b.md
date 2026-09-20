# FINAL-Bench/ZTC-Judge-4B

## Resumen

ZTC-Judge-4B es un modelo jurado (*judge*) desarrollado por FINAL-Bench que verifica si una respuesta generada por cualquier otro modelo es fiable, sin generar ni un solo token. Su nombre lo resume: ZTC significa *Zero-Token Confidence* y Judge indica que evalúa la respuesta de un tercero, no la suya propia. La entrada es únicamente el par pregunta-respuesta en texto; no necesita acceso a los pesos ni a los logits del modelo que produjo la respuesta.

Técnicamente es un transformer denso de 4.659.865.088 parámetros (unos 4,66 B) construido sobre la familia Qwen 3.5, con una dimensión de estado oculto de 2560. El mecanismo es una única pasada hacia delante: se extrae el estado oculto de la última capa en la última posición y se pasa por una sonda (*probe*) entrenada que devuelve una puntuación. El modelo se distribuye con dos sondas, una lineal de un solo producto escalar y otra con kernel RBF y 256 anclas, que es la que produce el AUC de 0,6360 reportado.

Su relevancia es acotada pero real: es el escalón inferior de una familia de cuatro tamanos (4B, 9B, 27B y Darwin-397B-ZTC) medidas bajo un protocolo identico, y la propia model card insiste en que su utilidad se concentra en contenido de tipo examen profesional, donde supera la linea base de superficie en +0,0649. Corre en CPU dentro de portatiles y en redes aisladas, algo que una API alojada no puede ofrecer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen 3.5 (etiqueta `qwen3_5`); extraccion del estado oculto de la ultima capa + sonda de clasificacion |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (la model card referencia `cfg["max_length"]` en `ztc_config.json`, pero no publica el valor) |
| Tipos de cuantizacion | No disponible; no se documentan cuantizaciones oficiales |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Dimension del estado oculto | 2560 |
| Tamano del repositorio | 9,3 GB |
| Pipeline declarado | text-classification |
| Tarea | Verificacion de respuestas, deteccion de alucinaciones, estimacion de confianza |
| Generacion de tokens | 0 por consulta |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje denso con una cabeza de clasificacion ligera. El flujo es: se construye un prompt con la plantilla definida en `ztc_config.json` a partir del par pregunta-respuesta, se tokeniza con truncado a `max_length`, se ejecuta una unica pasada hacia delante y se toma el estado oculto de la ultima capa en la ultima posicion real (vector de 2560 dimensiones). Ese vector se normaliza con la media y la desviacion (`mu`, `sd`) almacenadas en la sonda y se proyecta mediante un producto escalar (`w`) para obtener una puntuacion real no acotada.

Se distribuyen dos sondas sobre el mismo modelo base. `ztc_probe.npz` implementa la lectura lineal de un solo producto escalar. `ztc_curve_probe.npz` implementa la lectura con kernel RBF y 256 anclas, y es la que produce la cifra reportada de AUC 0,6360; la model card recomienda usarla cuando el numero importa. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; el unico detalle metodologico declarado es que la calibracion de la probabilidad se ajusta con validacion *leave-one-domain-out*, de modo que el mapeo nunca ve el dominio sobre el que se aplica.

La innovacion principal es la ausencia total de decodificacion: al no generar tokens, la latencia equivale a una pasada hacia delante y el batching se traduce directamente en throughput. Ademas, la sonda tambien predice el rendimiento del propio jurado: el endpoint devuelve campos medidos como `band_accuracy` (0,485), `base_accuracy` (0,748), `if_lowest_20pct_dropped` (0,814) y advertencias como `do_not: resample_same_model`, justificada con la medicion de que remuestrear el mismo modelo corrige el 6,7 % de las respuestas erroneas pero rompe el 13,1 % de las correctas.

## Capacidades

- Verificacion de respuestas: puntua si una respuesta de cualquier modelo, recibida como texto plano, es correcta o fiable.
- Deteccion de alucinaciones: la puntuacion funciona como senal de ranking para separar respuestas fiables de respuestas inventadas.
- Estimacion de confianza: devuelve un campo `probability` calibrado como P(respuesta correcta) y un `band` (por ejemplo "low") con una `action` asociada ("hold_or_escalate").
- Clasificacion de texto: el pipeline declarado es `text-classification`, con tipos de pregunta `boolean` y `noul`.
- Sin generacion de tokens: cero tokens generados por consulta, con `usage.generated_tokens: 0` en la respuesta de la API.
- Integracion mediante API compatible: endpoint `POST /v1/evaluate` con la misma forma de peticion y respuesta que una integracion JEV existente, de modo que la migracion se reduce a cambiar la URL.
- Salida enriquecida para revision humana: ademas de `probability` y `verdict` ("review"), incluye `score`, `position`, `band`, `action` y metricas de calibracion y de ganancia por escalado (`escalate_gain_at_20pct_budget`: 0,0134).
- Multilingue limitado: soporte declarado de ingles y coreano.
- No se documentan capacidades de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito en la informacion disponible. La etiqueta `image-text-to-text` aparece en los tags del repositorio, pero la model card describe exclusivamente un uso textual pregunta-respuesta.

## Casos de uso

- Verificacion en examenes profesionales (derecho, matematicas, biologia): es el dominio donde el modelo rinde mejor, con un AUC de 0,7787 frente a 0,7138 de la linea base de superficie. Se usaria como segunda pasada sobre las respuestas de un modelo generador para marcar las que necesitan revision humana.
- Filtrado de respuestas en produccion con presupuesto de revision limitado: la sonda y los campos `band`/`action` permiten descartar automaticamente el quintil inferior; segun la model card, eliminar el 20 % peor eleva la precision base de 0,748 a 0,814.
- Triaje en atencion al cliente automatizada: dado el par consulta-respuesta emitida por el bot, el jurado marca con `verdict: "review"` y `action: "hold_or_escalate"` los casos dudosos antes de enviarlos al usuario.
- Despliegue en redes aisladas o entornos sin internet: es un modelo de 4,66 B que corre en CPU dentro de un portatil, por lo que encaja en instalaciones donde no se puede llamar a una API alojada.
- Auditoria de pipelines RAG: verificar si la respuesta final sintetizada se sostiene como correcta, usando la puntuacion como metrica de calidad agregada por lote.
- Evaluacion comparativa de modelos generadores: al no necesitar pesos ni logits del modelo evaluado, se puede puntuar con el mismo jurado a varios LLM distintos y comparar sus tasas de respuesta correcta en un mismo conjunto de preguntas.
- Contenido de biologia y medicina como dominio secundario: ligera mejora de +0,0315 sobre la linea base (0,6223 frente a 0,5908), util para prefiltrar respuestas antes de revision experta.
- Razonamiento generico de varios pasos: mejora moderada de +0,0318 (0,5738 frente a 0,5420), aplicable como senal auxiliar en cadenas de razonamiento.

## Benchmarks y rendimiento

Escalera de tamanos medida bajo un protocolo identico (AUC de leaderboard):

| Modelo | AUC de leaderboard |
|---|---|
| Darwin-397B-ZTC | 0,7364 |
| ZTC-Judge-27B | 0,7282 |
| ZTC-Judge-9B | 0,6506 |
| ZTC-Judge-4B | 0,6360 |
| Solo longitud y formato de la respuesta (linea base) | 0,6223 |

Rendimiento por dominio (linea base de superficie frente a ZTC-Judge-4B):

| Dominio | Linea base | ZTC-Judge-4B | Margen |
|---|---|---|---|
| Examenes profesionales (derecho, matematicas, biologia) | 0,7138 | 0,7787 | +0,0649 |
| Razonamiento cientifico | 0,7272 | 0,5576 | -0,1696 |
| Biologia y medicina | 0,5908 | 0,6223 | +0,0315 |
| Procedimientos de desastre y seguridad | 0,5949 | 0,5842 | -0,0107 |
| Razonamiento generico de varios pasos | 0,5420 | 0,5738 | +0,0318 |
| Media ponderada por tamano | 0,6223 | 0,6360 | +0,0137 |

Calibracion (error de calibracion esperado, ECE):

| Sistema | ECE |
|---|---|
| ZTC-Judge-27B tras calibracion | 0,0245 |
| JEV, tal como se distribuye | 0,0381 |
| JEV, tras la misma calibracion | 0,0261 |

Metricas operativas declaradas: 0,19 s por llamada, cero tokens generados, `band_accuracy` 0,485, `base_accuracy` 0,748, `if_lowest_20pct_dropped` 0,814 y `escalate_gain_at_20pct_budget` 0,0134. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar de conocimiento o generacion, lo cual es coherente con que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 los pesos ocupan en torno a 9,3 GB (coincide con el tamano del repositorio); en int8 alrededor de 4,7 GB y en int4 alrededor de 2,4 GB, aunque no se documentan cuantizaciones oficiales.
- CPU: la model card afirma explicitamente que el modelo funciona en un portatil sobre CPU, lo que lo habilita para entornos sin GPU.
- GPU consumer: con ~9,3 GB en bf16 cabe en tarjetas de 12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090); en GPUs de 8 GB requeriria cuantizacion, no documentada oficialmente.
- GPU de centro de datos: A100, H100 y similares no son necesarias para un modelo de este tamano; su uso tendria sentido solo para batching masivo.
- Opciones de despliegue: carga directa con `transformers` (`AutoModel`, `AutoTokenizer`) mas PyTorch, tal como muestra la model card, y exposicion mediante el endpoint propio `POST /v1/evaluate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; estos motores estan orientados a generacion de tokens y no encajan con el flujo de una unica pasada y lectura de estado oculto.
- Latencia y throughput: 0,19 s por llamada segun la informacion disponible; el batching se convierte directamente en throughput al no existir decodificacion autoregresiva.
- Almacenamiento: el snapshot completo ocupa 9,3 GB.

## Comparativa con modelos similares

Comparativa con los otros miembros de la misma familia, unicos modelos comparables con datos publicados en la informacion disponible:

| Modelo | Parametros | AUC de leaderboard | Mejor dominio declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZTC-Judge-4B | 4,66 B | 0,6360 | Examenes profesionales (0,7787) | Apache 2.0 | Pesos abiertos en HuggingFace |
| ZTC-Judge-9B | No disponible | 0,6506 | No disponible | No disponible | Mencionado en la model card |
| ZTC-Judge-27B | No disponible | 0,7282 | No disponible | No disponible | Mencionado en la model card |
| Darwin-397B-ZTC | No disponible | 0,7364 | No disponible | No disponible | Mencionado en la model card |
| JEV | No disponible | No disponible | No disponible | No disponible | Referencia de calibracion (ECE 0,0381) |
| Linea base de longitud y formato | No aplica | 0,6223 | No aplica | No aplica | No aplica |

No se dispone de informacion sobre alternativas externas a la familia (por ejemplo jurados de verificacion de otras organizaciones) en el material proporcionado.

## Limitaciones y advertencias

- La propia model card desaconseja explicitamente su uso en contenido de desastre y seguridad: alli no supera la linea base (0,5842 frente a 0,5949), lo que indica que el modelo esta leyendo la forma de la respuesta y no su correccion.
- Rendimiento muy pobre en razonamiento cientifico: cae 0,1696 por debajo de la linea base (0,5576 frente a 0,7272). No debe usarse en ese dominio.
- Margen global muy estrecho: la media ponderada solo supera la linea base en +0,0137, y el AUC de 0,6360 esta a 0,0137 puntos de una heuristica que solo mira longitud y formato. Cualquier uso en produccion debe asumir este margen.
- La escalera de tamanos no decrece de forma suave: la mejora entre 4B y 9B es de solo 0,015, mientras que entre 9B y 27B es de 0,078, lo que sugiere que la capacidad relevante para verificar aparece por encima de 27B.
- La puntuacion cruda es un numero real no acotado y constituye una senal de ranking, no una probabilidad calibrada. El umbral debe elegirse segun el presupuesto de revision propio.
- La probabilidad calibrada se ajusta con validacion *leave-one-domain-out*, pero el ECE publicado de 0,0245 corresponde a ZTC-Judge-27B, no al modelo de 4B; no hay cifra de calibracion especifica para este tamano en la informacion disponible.
- No se recomienda remuestrear el mismo modelo como estrategia de correccion: segun las mediciones incluidas, corrige el 6,7 % de las respuestas erroneas pero rompe el 13,1 % de las correctas.
- Idiomas limitados a ingles y coreano; no hay soporte declarado de castellano.
- Riesgo de alucinacion del propio jurado: el pipeline no genera texto, pero puede emitir una confianza erronea; la `band_accuracy` de 0,485 indica que la asignacion de bandas acierta aproximadamente la mitad de las veces.
- Existe una discrepancia entre los tags del repositorio, que incluyen `image-text-to-text`, y la model card y el pipeline declarado, puramente textuales; no hay evidencia de capacidades multimodales utilizables.
- La model card proporcionada aparece truncada (la tabla de calibracion se corta en la fila "Laya-Mu"), por lo que podrian faltar datos.
- Licencia Apache 2.0: permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de licencia y el archivo de cambios. No impone restricciones de uso adicionales segun la informacion disponible.
- La fecha de creacion y actualizacion del repositorio (2026-09-20) y el contador de descargas (0) indican un modelo muy reciente y con poca validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FINAL-Bench/ZTC-Judge-4B
- Repositorio FINAL-Bench en HuggingFace: https://huggingface.co/FINAL-Bench
- Artefactos citados en la model card: `ztc_config.json`, `ztc_probe.npz`, `ztc_curve_probe.npz` (descargables desde el repositorio del modelo)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los unicos resultados obtenidos son entradas de diccionarios franceses sobre la palabra "final", sin relacion con el proyecto FINAL-Bench ni con ZTC-Judge-4B.
