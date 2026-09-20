# FINAL-Bench/ZTC-Judge-9B

## Resumen

ZTC-Judge-9B es un modelo de verificación de respuestas desarrollado por FINAL-Bench. Su función no es generar texto, sino puntuar si la respuesta que ha producido *otro* modelo (cualquiera) a una pregunta dada es fiable. Lo hace en una única pasada hacia delante: extrae el estado oculto de la última capa en la última posición (4096 dimensiones) y lo pasa por una sonda lineal o por una sonda con kernel RBF entrenada sobre 256 anclas. El resultado es una puntuación real no acotada que actúa como señal de ranking, acompañada de una calibración que la traduce a probabilidad de que la respuesta sea correcta.

El modelo se presenta como el tercer escalón de una familia de cuatro tamaños evaluada bajo un protocolo idéntico: Darwin-397B-ZTC (AUC 0,7364), ZTC-Judge-27B (0,7282), ZTC-Judge-9B (0,6506) y ZTC-Judge-4B (0,6360). La propia model card advierte de que la escala no decrece de forma suave sino a saltos: entre 4B y 9B la mejora es de solo 0,015, mientras que entre 9B y 27B alcanza 0,078. Con 9.653.104.368 parámetros y pesos en safetensors, su nicho declarado es el de contenido tipo examen profesional (derecho, matemáticas, biología), donde supera la línea base superficial en 0,0485 puntos.

La relevancia práctica del modelo está en sus restricciones de despliegue: cero tokens generados, latencia de una pasada (0,19 s por llamada según la card), funcionamiento en CPU y portátil, y posibilidad de operar en redes sin salida a internet, algo que una API alojada no puede ofrecer. La licencia es Apache 2.0. El repositorio acumula 30 likes y 0 descargas, y no se han encontrado fuentes externas (papers, blogs o demos) en la búsqueda web realizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta del repositorio: qwen3_5); uso como extractor de representaciones con sonda posterior |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; se define mediante `max_length` en `ztc_config.json` (valor concreto no publicado) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye safetensors en bfloat16 |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 19,3 GB) |
| Pipeline declarado | text-classification (la lista de etiquetas incluye ademas image-text-to-text) |
| Dimension del estado oculto usado | 4096 |
| Libreria | transformers |
| Artefactos adicionales | `ztc_config.json`, `ztc_probe.npz`, `ztc_curve_probe.npz` |

## Arquitectura y entrenamiento

El modelo sigue un esquema de verificación post-hoc en lugar de generación. La entrada es la concatenacion de pregunta y respuesta segun la plantilla definida en `ztc_config.json`; el texto se trunca a `max_length` y se procesa en una sola pasada. De la salida se toma el estado oculto de la ultima capa en la ultima posicion real (segun `attention_mask`), un vector de 4096 dimensiones, que se normaliza con la media y desviacion guardadas en la sonda. No se necesita acceso a los pesos ni a los logits del modelo que genero la respuesta: el unico input es el texto de la respuesta.

Se distribuyen dos sondas que leen la misma representacion. `ztc_probe.npz` implementa una lectura lineal (un producto escalar) y `ztc_curve_probe.npz` implementa la sonda curva con kernel RBF sobre 256 anclas, que es la que produce la cifra reportada de 0,6506. La calibracion que convierte la puntuacion bruta en P(respuesta correcta) se ajusto con validacion leave-one-domain-out, de modo que el mapeo nunca ve el dominio al que se aplica. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos no estan disponibles.

## Capacidades

- Verificacion de respuestas: puntua si la respuesta de cualquier modelo a una pregunta dada es fiable, sin generar tokens.
- Deteccion de alucinaciones: etiquetada explicitamente con `hallucination-detection` en el repositorio.
- Estimacion de confianza: la etiqueta `confidence-estimation` y la calibracion incluida permiten obtener una probabilidad de correccion.
- Salida estructurada por API: el endpoint `POST /v1/evaluate` devuelve `probability`, `verdict`, `score`, `position`, `band` y `action`, ademas de metricas medidas (`band_accuracy`, `base_accuracy`, `if_lowest_20pct_dropped`, `escalate_gain_at_20pct_budget`).
- Tipos de pregunta soportados por la API: `boolean` y `noul` (segun la documentacion de la card).
- Integracion drop-in: misma forma de peticion y respuesta que una integracion JEV existente, de modo que la migracion se reduce a cambiar la URL.
- Capacidades multilingues: ingles y coreano.
- Sin soporte declarado de tool calling, function calling ni razonamiento agentico multi-paso; es un clasificador/verificador, no un agente.
- La etiqueta `image-text-to-text` aparece en el repositorio, pero el ejemplo de uso y la API documentados son exclusivamente de texto.

## Casos de uso

- Verificacion en pipelines RAG: tras recuperar documentos y generar una respuesta, el modelo puntua ese borrador en una sola pasada (0,19 s por llamada) y permite descartar o marcar respuestas dudosas antes de mostrarlas al usuario.
- Contenido tipo examen profesional: es el dominio donde el modelo supera claramente su linea base (0,7623 frente a 0,7138, +0,0485). Encaja en plataformas de preparacion de oposiciones o certificaciones de derecho, matematicas y biologia donde hay que validar respuestas de un tutor automatico.
- Deteccion de alucinaciones en produccion: como segundo filtro sobre las respuestas de un LLM generativo, usando la puntuacion como senal de ranking y un umbral elegido segun el presupuesto de revision disponible.
- Enrutamiento con presupuesto de revision: los campos `band` y `action` (`hold_or_escalate`) permiten enviar solo el 20 % peor puntuado a revision humana; la card reporta una ganancia de escalado de 0,0134 con ese presupuesto del 20 %.
- Evaluacion comparativa de modelos (LLM-as-a-judge sin generacion): al no requerir los pesos ni los logits del modelo evaluado, sirve para puntuar respuestas de modelos de terceros en un banco de pruebas interno.
- Despliegue en entornos aislados y en hardware modesto: funciona en CPU y en portatil, lo que permite integrarlo en redes sin acceso a internet o en sedes donde no se puede llamar a una API externa.
- Revision de contenido biomedico: en biologia y medicina la mejora sobre la linea base es de +0,0402 (0,6310 frente a 0,5908), util para validar respuestas de asistentes clinicos informativos antes de su publicacion.
- Razonamiento general multi-paso: mejora de +0,0461 (0,5881 frente a 0,5420) en tareas de razonamiento encadenado, aprovechable como capa de control de calidad en asistentes de analisis.

## Benchmarks y rendimiento

Escalera de la familia, medida bajo un protocolo identico (AUC de leaderboard):

| Modelo | AUC |
|---|---|
| Darwin-397B-ZTC | 0,7364 |
| ZTC-Judge-27B | 0,7282 |
| ZTC-Judge-9B | 0,6506 |
| ZTC-Judge-4B | 0,6360 |
| Solo longitud y formato de la respuesta (linea base) | 0,6223 |

Desglose por dominio (linea base superficial frente a ZTC-Judge-9B):

| Dominio | Linea base | ZTC-Judge-9B | Margen |
|---|---|---|---|
| Examenes profesionales (derecho, matematicas, biologia) | 0,7138 | 0,7623 | +0,0485 |
| Razonamiento cientifico | 0,7272 | 0,6764 | -0,0508 |
| Biologia y medicina | 0,5908 | 0,6310 | +0,0402 |
| Procedimientos de desastre y seguridad | 0,5949 | 0,5862 | -0,0087 |
| Razonamiento general multi-paso | 0,5420 | 0,5881 | +0,0461 |
| Media ponderada por tamano | 0,6223 | 0,6506 | +0,0283 |

Calibracion (error de calibracion esperado):

| Modelo | ECE |
|---|---|
| ZTC-Judge-27B (tras calibracion) | 0,0245 |
| JEV, tal como se distribuye | 0,0381 |
| JEV, tras la misma calibracion | 0,0261 |
| Laya-Mul... (entrada truncada en la model card) | No disponible |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16/fp16, aproximadamente 19,3 GB solo de pesos (coincide con el tamano de repositorio de 19,3 GB), mas activaciones y cache, lo que lleva el total practico a unos 20-22 GB.
- Cuantizacion: no se distribuyen pesos cuantizados oficiales, por lo que cualquier cuantizacion a int8 (unos 9,7 GB) o int4 (unos 5 GB) exigiria un proceso propio.
- GPU recomendadas: A100 40 GB, H100, L40S y cualquier GPU con 24 GB o mas para bfloat16 (RTX 3090, RTX 4090, RTX A5000).
- GPU de consumo: cabe en tarjetas de 24 GB en bfloat16 de forma ajustada; por debajo de esa cifra requiere cuantizacion manual o ejecucion en CPU.
- CPU: la model card afirma explicitamente que el modelo funciona en CPU y en portatil, lo que amplia el despliegue a equipos sin GPU.
- Opciones de despliegue: transformers con `AutoModel` y `AutoTokenizer` es la ruta documentada; el repositorio esta marcado como `endpoints_compatible` y expone una API compatible con `POST /v1/evaluate`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,19 s por llamada con cero tokens generados; el batching se convierte directamente en throughput segun la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | AUC (leaderboard) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZTC-Judge-9B | 9,65 B | 0,6506 | No disponible | Apache 2.0 | HuggingFace (safetensors, transformers) |
| ZTC-Judge-27B | No disponible | 0,7282 | No disponible | No disponible | Miembro de la misma familia |
| ZTC-Judge-4B | No disponible | 0,6360 | No disponible | No disponible | Miembro de la misma familia |
| Darwin-397B-ZTC | No disponible | 0,7364 | No disponible | No disponible | Miembro de la misma familia |
| JEV (linea base citada) | No disponible | No disponible (ECE 0,0381) | No disponible | No disponible | Referencia comparativa en la model card |

La comparacion relevante es interna a la familia: el salto de calidad se concentra entre 9B y 27B (0,078 de AUC), mientras que entre 4B y 9B es de solo 0,015. Fuera de la familia no se han identificado en la informacion disponible modelos verificadores comparables con datos publicados.

## Limitaciones y advertencias

- No debe usarse en contenido de desastre y seguridad: en ese dominio el modelo no supera la linea base superficial (0,5862 frente a 0,5949), lo que indica que esta leyendo la forma de la respuesta y no su correccion.
- Regresion en razonamiento cientifico: pierde 0,0508 puntos frente a la linea base (0,6764 frente a 0,7272), por lo que no es adecuado como verificador en ese dominio.
- La puntuacion bruta es un numero real no acotado y constituye una senal de ranking, no una probabilidad calibrada; el umbral debe elegirse a partir del presupuesto de revision propio.
- Riesgo de alucinacion del propio verificador: no se documentan tasas de error especificas mas alla del AUC y del ECE, y la model card no detalla el comportamiento en dominios fuera de los evaluados.
- Sesgos conocidos: no disponibles; la model card no incluye analisis de sesgo.
- Cobertura idiomatica limitada a ingles y coreano; no hay datos de rendimiento en castellano ni en otros idiomas.
- Cifras de calibracion reproducidas en la card corresponden en su mayoria al modelo de 27B; no se desglosa el ECE especifico de la variante de 9B.
- La recomendacion explicita de la card es no re-muestrear con el mismo modelo para corregir respuestas marcadas: segun sus mediciones, arregla el 6,7 % de las respuestas erroneas y rompe el 13,1 % de las correctas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los terminos del modelo base (etiqueta `qwen3_5`) del que deriva.
- El repositorio registra 0 descargas y 30 likes, por lo que no existe evidencia de uso en produccion a gran escala.
- La entrada de la model card esta truncada en la seccion de calibracion, de modo que parte de los datos comparativos no puede verificarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FINAL-Bench/ZTC-Judge-9B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos relacionados con el modelo; los unicos resultados devueltos fueron entradas de diccionarios franceses sobre la palabra "final", sin relacion con el modelo.
- No disponible: enlace a paper, ficha tecnica adicional o demo publica.
