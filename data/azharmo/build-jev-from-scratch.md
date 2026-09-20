# azharmo/build-jev-from-scratch

## Resumen

`azharmo/build-jev-from-scratch` es un modelo de clasificación de texto de escala juguete (toy) publicado por el usuario azharmo en HuggingFace. No es un modelo de generación: implementa una reconstrucción educativa de la *interfaz* del modelo "System One" denominado Jev, presentado por TypeSafe AI el 15 de septiembre de 2026. El autor declara explícitamente que el modelo no es Jev ni pretende serlo, y que la arquitectura, las cabezas, las pérdidas y la calibración son de diseño propio, reproduciendo únicamente el comportamiento observable de la interfaz: dado un estado textual y varias preguntas tipadas, devuelve probabilidades calibradas en paralelo con una sola pasada del encoder.

El modelo resuelve tres tipos de consulta sobre un mismo estado: `noul` (probabilidad de que un enunciado sí/no sea verdadero), `choice` (distribución de probabilidad sobre un conjunto de opciones, con confianza) y `score` (un valor dentro de un rango). Tiene aproximadamente 3,1 millones de parámetros y fue entrenado íntegramente en CPU (8 núcleos, 15 GB de RAM) durante 3 épocas, con una pérdida de entrenamiento que bajó de 1,55 a 1,00. El resultado arquitectónicamente más relevante que reporta el autor es la calibración: un ECE de 0,027 en la tarea `noul`, muy bajo pese a una precisión modesta del 59,7%.

Su relevancia actual es fundamentalmente didáctica y de investigación sobre calibración: demuestra que es posible obtener probabilidades bien calibradas con un modelo minúsculo y recursos de cómputo triviales, y sirve como banco de pruebas reproducible para quien quiera experimentar con interfaces de decisión tipadas antes de escalar a modelos mayores. El repositorio pesa 0,0 GB, acumula 0 descargas y 0 "likes", y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabezas multiples tipadas (`noul`, `choice`, `score`); una sola pasada sobre el estado por consulta multiple |
| Parametros totales | ~3,1 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el unico artefacto publicado es un checkpoint PyTorch sin cuantizar) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`) con diccionario que contiene `config`, `state_dict` y vocabulario; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder propio implementado en PyTorch dentro del paquete `jev_toy/`. En lugar de generar texto, el modelo recibe un `state` (texto) y un conjunto de preguntas tipadas, y produce respuestas en paralelo en una sola pasada del encoder. Cada tipo de pregunta se resuelve con una cabeza distinta: `noul` devuelve una probabilidad binaria, `choice` una distribución sobre las opciones mas una medida de confianza, y `score` un valor escalar dentro de un rango. El autor subraya que esta separación en cabezas, las funciones de pérdida y el mecanismo de calibración son de diseño propio y no una reproducción de los internos de Jev, que son propietarios y no publicados.

El entrenamiento se realizó en CPU con 8 núcleos y 15 GB de RAM durante 3 épocas, con pérdida inicial de 1,55 y final de 1,00. Los datos proceden de tres conjuntos públicos: `fancyzhx/ag_news`, `google/boolq` y `stanfordnlp/sst2`, con aproximadamente 1.500 ejemplos por conjunto según el comando de reproducción documentado. La innovación técnica destacable no es de arquitectura sino de calibración: con solo 3,1 millones de parámetros y una precisión baja (59,7 % en `noul`), el modelo consigue un ECE de 0,027, lo que indica que sus probabilidades están bien alineadas con la frecuencia real de acierto. El autor atribuye explícitamente la baja precisión al carácter toy del experimento (datos limitados, cómputo en CPU) y sitúa la calibración como el resultado significativo.

## Capacidades

- Clasificación binaria calibrada de enunciados sí/no mediante la cabeza `noul`, con salida de probabilidad y ECE medido de 0,027.
- Clasificación multietiqueta sobre conjuntos cerrados de opciones mediante la cabeza `choice`, devolviendo distribución de probabilidad y confianza; 75,9 % de precisión en AG News.
- Estimación de un valor numérico dentro de un rango mediante la cabeza `score`.
- Consulta paralela: varias preguntas tipadas sobre un mismo estado se responden con una sola pasada del encoder, sin generación de texto.
- Procesamiento exclusivamente en inglés.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", ni capacidades de visión, audio o multimodalidad.
- No genera texto libre en ningún caso.

## Casos de uso

- Reproducción didáctica del artículo "Build a Jev from scratch": el repositorio incluye `ARTICLE.md`, `RESULTS.md` y los comandos exactos de entrenamiento y evaluación, por lo que sirve como material de estudio completo de un pipeline de transformer con salidas calibradas.
- Investigación sobre calibración de modelos pequeños: permite experimentar cómo afectan el tamaño del dataset (1.500 ejemplos por conjunto) y el número de épocas al ECE y al Brier score, comparando con la línea base publicada de ECE 0,027.
- Prototipado rápido de interfaces de decisión tipadas: antes de invertir en un modelo de producción, se puede validar el diseño de las cabezas `noul`/`choice`/`score` y del esquema de entrada estado más preguntas.
- Clasificación ligera de titulares y noticias en CPU: con la cabeza `choice` y el conjunto AG News alcanza 75,9 % de precisión, suficiente para demos y filtrado previo en entornos sin GPU.
- Evaluación de esquemas de calibración post-hoc: el checkpoint permite medir Brier y ECE sobre datos propios y comprobar si las técnicas de calibración aplicadas en modelos grandes trasladan a modelos de 3,1 millones de parámetros.
- Servicio local de inferencia: `jev_toy/serve.py` implementa un ejemplo de servidor con la forma exacta de la interfaz de Jev, útil para integrar el modelo en una demo o en pruebas de concepto internas de bajo coste.
- Docencia y talleres de PyTorch: al entrenar en CPU en minutos y ocupar el repositorio 0,0 GB, es apto para entornos formativos sin acceso a GPU.

## Benchmarks y rendimiento

| Tipo | Dataset | Precisión | Brier | ECE |
|---|---|---|---|---|
| noul | BoolQ + SST-2 | 59,7 % | 0,236 | 0,027 |
| choice | AG News | 75,9 % | 0,331 | no reportado |

Datos adicionales del entrenamiento: pérdida de 1,55 a 1,00 en 3 épocas, aproximadamente 3,1 millones de parámetros, entrenamiento en CPU de 8 núcleos con 15 GB de RAM. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 MB en FP32 para los 3,1 millones de parámetros, más el espacio del vocabulario y las activaciones; en la práctica cabe en cualquier GPU o incluso en memoria de sistema.
- GPU recomendadas: ninguna en particular; el autor entrenó y evaluó íntegramente en CPU con 8 núcleos y 15 GB de RAM.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o integradas, y también en Raspberry Pi o entornos sin acelerador.
- Opciones de despliegue: PyTorch con `torch.load` sobre `checkpoints/model.pt` y el script propio `jev_toy/serve.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo los runners de LLM no son aplicables directamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parametros | Contexto | Precisión reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| build-jev-from-scratch | azharmo | ~3,1 M | no disponible | noul 59,7 % (ECE 0,027); choice 75,9 % (AG News) | MIT | HuggingFace, 0 descargas |
| Jev (System One) | TypeSafe AI | no disponible | no disponible | no disponible | propietaria | no publicado; solo anuncio |
| Needle | Cactus Compute | no disponible | no disponible | no disponible | no disponible (repositorio público) | GitHub |

La comparación no puede ser cuantitativa porque los internos de Jev son propietarios y no publicados, y de Needle no se dispone de especificaciones en la información proporcionada. El propio autor enmarca la relación con Jev como una reconstrucción de interfaz, no de arquitectura ni de rendimiento.

## Limitaciones y advertencias

- Precisión baja por diseño: 59,7 % en la tarea `noul` con BoolQ y SST-2, y 75,9 % en AG News. No es apto para decisiones de producción sin una validación adicional exhaustiva.
- Es una reconstrucción de escala toy de una interfaz, no del modelo Jev. No comparte arquitectura, pesos ni datos con el sistema original de TypeSafe AI, y el autor lo declara explícitamente.
- Sesgos conocidos: no se documentan, pero al entrenarse con recortes de 1.500 ejemplos de AG News, BoolQ y SST-2, hereda los sesgos y la distribución de esos conjuntos, insuficientes para representar dominios reales.
- Riesgo de alucinación: no aplica en el sentido generativo porque el modelo no produce texto libre; el riesgo equivalente es la sobreconfianza en clasificaciones, mitigada parcialmente por el ECE de 0,027 medido solo en la tarea `noul`.
- Limitación de idioma: solo inglés. No hay soporte ni evaluación en castellano ni en otros idiomas.
- Longitud de contexto: no disponible. No hay documentación sobre el máximo de tokens del estado de entrada.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación siempre que se conserve el aviso de copyright y la atribución. El autor aclara que no está afiliado a TypeSafe AI ni a Cactus Compute.
- Sin mantenimiento ni adopción: 0 descargas, 0 likes y repositorio de 0,0 GB; no hay señales de soporte comunitario, versiones posteriores ni issues resueltos.
- El único artefacto de pesos es un `.pt` de PyTorch, lo que implica cargar pickle y exige confiar en el origen del fichero; no hay safetensors ni GGUF.
- No sirve para tool calling, agentes, razonamiento multi-paso ni generación, por lo que no puede sustituir a un LLM en ningún flujo que requiera esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azharmo/build-jev-from-scratch
- Blog de TypeSafe AI sobre System One y Jev: https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Repositorio Needle de Cactus Compute: https://github.com/cactus-compute/needle
- Conjunto de datos AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Conjunto de datos BoolQ: https://huggingface.co/datasets/google/boolq
- Conjunto de datos SST-2: https://huggingface.co/datasets/stanfordnlp/sst2
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los resultados obtenidos corresponden a un portal jurídico israelí sin relación con el contenido de esta ficha.
