# davidpere/nlp-ui-small

## Resumen

nlp-ui-small es una coleccion de clasificadores pequenos (~9 M de parametros en total) publicada por el usuario davidpere para alimentar la pipeline de perfilado de datos offline del proyecto nlp-ui. No es un modelo generativo ni un LLM: son cabezas de clasificacion especializadas que responden dos preguntas concretas sobre datos tabulares, la clasificacion del rol de campo de una columna (16 roles posibles) y la clasificacion del layout de un dataset (5 layouts posibles).

El modelo se distribuye en dos subcarpetas independientes. La primera, `fieldrole/`, contiene un encoder transformer de ~8,7 M de parametros (d=320, 6 capas) con una cabeza de fusion escalar, y ocupa unos 35 MB en fp32. La segunda, `layout/`, es un clasificador de apenas ~10.000 parametros y unos 40 KB. Cada carpeta incluye pesos en `safetensors` y una version `model.onnx`, lo que permite ejecutar el modelo sin PyTorch, solo con ONNX Runtime.

Su relevancia actual es de nicho pero clara: cubre la necesidad de clasificacion de metadatos tabulares en entornos sin conectividad o con requisitos de privacidad estrictos, manteniendo el mismo contrato de respuesta que TypeSafe Jev (estructura de eleccion con probabilidades y nivel de confianza) pero sin realizar llamadas a API externas. Esta licenciado bajo Apache 2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (d=320, 6 capas) con cabeza de fusion escalar para `fieldrole/`; clasificador de ~10.000 parametros para `layout/` |
| Parametros totales | ~8,7 M en `fieldrole/` + ~10.000 en `layout/` (~8,71 M en total) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La entrada del encoder de field-role es fija: 12 ids de token de clave |
| Tipos de cuantizacion | No disponible (solo se documenta fp32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` y `model.onnx`; incluye `vocab.json` y `config.json` para el encoder de field-role |

Detalle de los checkpoints:

| Carpeta | Parametros | Tamano fp32 | Tarea |
|---|---|---|---|
| `fieldrole/` | ~8,7 M | ~35 MB | Roles de columna (16 clases) |
| `layout/` | ~10.000 | ~40 KB | Layouts de dataset (5 clases) |

## Arquitectura y entrenamiento

La pieza principal de `fieldrole/` es un encoder transformer de 6 capas con dimension de modelo 320, al que se anade una cabeza de fusion escalar que combina la representacion textual con caracteristicas numericas. La interfaz de inferencia recibe tres tensores: `tokens` como `int64[1,12]` con los ids de los tokens de clave, `kind` como `int64[1]` con el id del tipo de valor y `numeric` como `float32[1,64]`, un vector compuesto por 48 conteos de ngramas, 12 flags y 4 escalares. La salida son logits que se normalizan con softmax para obtener probabilidades sobre las 16 clases.

El entrenamiento se realizo con AdamW y label smoothing sobre un corpus sintetico con semilla fija definido en `python/data.py`, compuesto por decenas de miles de perfiles de columna. El script `python/train_small.py` reproduce el entrenamiento e imprime metricas de validacion en tiempo de ejecucion, aunque los valores concretos no se publican en la model card. No se documenta el uso de RLHF ni de DPO, algo esperable en un clasificador de este tamano. Tampoco se detalla la composicion del corpus sintetico ni el numero exacto de ejemplos.

## Capacidades

- Clasificacion del rol de campo de una columna entre 16 roles posibles a partir de un perfil de hasta 12 tokens de clave, el tipo de valor y un vector numerico de 64 caracteristicas.
- Clasificacion del layout de un dataset entre 5 categorias posibles.
- Devolucion de probabilidades calibradas por clase, con el mismo contrato de respuesta (`choice`, `probabilities`, `confidence`) que TypeSafe Jev.
- Inferencia sin PyTorch mediante ONNX Runtime, lo que permite desplegarlo en entornos sin dependencias de deep learning completas.
- Capacidad de abstenerse cuando la confianza cae por debajo de un umbral configurable (`minRoleConfidence`).
- Ejecucion local y offline: no requiere llamadas a API ni conexion de red.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes. Es un clasificador discriminativo, no un modelo generativo.
- No se documenta soporte multilingue ni lista de idiomas.

## Casos de uso

- Perfilado de datos en pipelines ETL: el modelo clasifica el rol de cada columna (16 clases) a partir de su perfil, lo que permite generar metadatos de forma automatica durante la ingesta sin enviar los datos a un servicio externo.
- Inferencia de esquema en lagos de datos: antes de definir un esquema, `fieldrole/` asigna roles a columnas desconocidas y `layout/` identifica el layout del dataset, reduciendo el trabajo manual de mapeo.
- Catalogacion y gobierno del dato: enriquecer catalogos internos con roles de columna y layouts inferidos, de forma consistente y reproducible, sin coste por llamada de API.
- Validacion previa a la ingesta: usar el umbral `minRoleConfidence` para que el sistema se abstenga o derive a revision humana cuando la clasificacion no es fiable, evitando propagar metadatos erroneos.
- Enrutado coarse-to-fine para conjuntos grandes de opciones: la model card indica que para conjuntos de 50 o mas opciones conviene dividir la pregunta en fases; el clasificador se usaria en la primera fase para reducir el espacio de candidatos antes de un modelo mayor.
- Despliegue en entornos air-gapped o con requisitos de privacidad: al ejecutarse con ONNX Runtime sobre CPU y pesar 35 MB y 40 KB respectivamente, puede integrarse en aplicaciones de escritorio, contenedores ligeros o servidores internos sin salida a Internet.
- Servicio HTTP de clasificacion para nlp-ui: el modelo puede exponerse detras de un endpoint y consumirse desde nlp-ui mediante el adaptador `remote-classifier`, con el mismo contrato que Jev.
- Preprocesamiento selectivo para LLM: usar la clasificacion de roles para decidir que columnas se envian a un modelo generativo mayor, reduciendo tokens y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las metricas de validacion se imprimen en tiempo de entrenamiento (`python/train_small.py`), pero no se incluyen valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la practica; el modelo esta pensado para CPU. `fieldrole/` ocupa ~35 MB en fp32 y `layout/` ~40 KB.
- GPU recomendadas: no se documenta ninguna. Al ser un modelo de ~8,7 M de parametros, no requiere GPU.
- Compatibilidad con GPU de consumo: irrelevante, cualquier CPU moderna es suficiente. No hay datos publicados de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (el ejemplo de la model card usa esta ruta), servicio HTTP propio consumido desde nlp-ui mediante el adaptador `remote-classifier`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de este tipo.
- Memoria RAM estimada: del orden de decenas de MB para los pesos y el vocabulario, segun los tamanos publicados.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables publicos en la informacion proporcionada. La model card menciona TypeSafe Jev como referencia funcional (mismo contrato de respuesta, estructura de eleccion con probabilidades y confianza), pero no aporta parametros, contexto, licencia ni rendimiento de ese modelo, por lo que no es posible establecer una comparacion cuantitativa.

Comparacion interna entre los dos checkpoints del repositorio:

| Checkpoint | Parametros | Tamano fp32 | Clases | Tarea |
|---|---|---|---|---|
| `fieldrole/` | ~8,7 M | ~35 MB | 16 | Rol de columna |
| `layout/` | ~10.000 | ~40 KB | 5 | Layout de dataset |

## Limitaciones y advertencias

- Entrenamiento puramente sintetico: la propia model card senala que los perfiles fuera de los rangos escalares del generador son el principal modo de fallo. Es esperable un deterioro del rendimiento ante distribuciones reales no representadas en el corpus.
- Calibracion no garantizada: se recomienda reajustar la temperatura sobre columnas etiquetadas propias antes de confiar en las probabilidades.
- Abstraccion obligatoria en produccion: conviene fijar un umbral de confianza (`minRoleConfidence`) y abstenerse por debajo de el, derivando a revision humana.
- Restriccion de formato de pregunta: solo admite preguntas unicas de 16 opciones. Para conjuntos de 50 o mas opciones hay que dividir la consulta en fases coarse-to-fine.
- Idiomas soportados no documentados: no hay informacion sobre el tratamiento de textos en idiomas distintos del usado en el corpus sintetico.
- Ausencia de validacion externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia publica de uso en produccion por terceros.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza aparente si la calibracion no se reajusta.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se documentan restricciones adicionales.
- Fecha de creacion indicada en el repositorio: 22 de septiembre de 2026, con actualizacion el mismo dia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidpere/nlp-ui-small
- Repositorio nlp-ui: https://github.com/David-glitc/nlp-ui
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; el unico resultado obtenido correspondia a un portal bancario sin relacion con el modelo.
