# FluidInference/jeff-coreml

## Resumen

FluidInference/jeff-coreml es una conversion a Core ML del camino de clasificacion entrenado del modelo knowledgator/gliformer-large-v1, tal y como lo utiliza el proyecto Jeff. El checkpoint original contiene 575.637.510 parametros e incluye un encoder DeBERTa de 24 capas, embeddings de marcador de prompt aprendidos y una cabeza de clasificacion lineal entrenada, todo empaquetado en un unico ML Program en FP16 de aproximadamente 880 MB. Es, por tanto, un modelo de clasificacion de texto (pipeline text-classification) pensado para ejecucion local en dispositivos Apple, no un modelo generativo.

La relevancia de esta ficha es doble. Por un lado, muestra un patron de despliegue on-device: convertir un clasificador grande a Core ML con formas fijas y verificar la paridad numerica respecto a PyTorch. Por otro, acota estrictamente lo que el paquete hace: puntua un unico grupo de clasificacion con entre 1 y 8 etiquetas sobre un maximo de 128 tokens tokenizados. Las etiquetas de tipo choice, yes/no y ordinal reutilizan la misma cabeza entrenada, y las probabilidades son sigmoides independientes, no un softmax normalizado.

El repositorio no registra descargas ni likes en el momento de redactar esta ficha, y el autor no ha publicado resultados de benchmarks. La validacion disponible se limita a cuatro fixtures reales del checkpoint de origen (facturacion, soporte tecnico, eleccion entre tres intenciones y clasificacion yes/no), con una discrepancia maxima de logits de 0,1139 en FP16 respecto al modelo nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa de 24 capas con embeddings de marcador de prompt aprendidos y cabeza de clasificacion lineal (camino de clasificacion de GLiFormer) |
| Parametros totales | 575.637.510 en el checkpoint original; el paquete Core ML ocupa aproximadamente 880 MB en disco |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens tokenizados, forma fija (L128) |
| Tipos de cuantizacion | FP16 (unico paquete publicado); existe un control de diagnostico en FP32 que no se distribuye |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos GLiFormer); el codigo del adaptador de decision de Jeff es MIT |
| Formato de pesos | Core ML ML Program (.mlpackage), FP16 |
| Tamano de lote | 1 (batch-1, no configurable en el paquete exportado) |
| Numero de etiquetas por invocacion | 1 a 8 |
| Libreria de inferencia | coreml |
| Repositorio | 0,9 GB |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura subyacente es GLiFormer en su variante large, con un encoder DeBERTa de 24 capas como columna vertebral. El camino de clasificacion emplea CLS pooling, un ancla de prompt padre, fusion lineal de padre y categoria, y puntuacion por producto escalar. Los embeddings de marcador de prompt son parametros aprendidos, no plantillas de texto, y la cabeza de clasificacion es lineal y entrenada. El RNN a nivel de palabra que forma parte del modelo original se evalua aguas arriba, pero segun la propia model card no puede afectar a los logits de clasificacion con la configuracion de este checkpoint.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; el modelo se distribuye ya entrenado y esta conversion no reentrena pesos. La innovacion tecnica destacable es de conversion, no de modelado: `jeff_decision.py` verifica las condiciones de configuracion y transporta el encoder y la cabeza entrenados, mientras que `trace_compat.py` hace convertible la atencion DeBERTa de forma fija sin modificar los pesos. La mascara finita usada solo en el trazado sustituye el minimo de fp32 por -10000 antes de la conversion a FP16, y los logits parcheados en PyTorch coinciden con los nativos en los casos comprobados.

Un detalle funcional importante: las probabilidades devueltas son sigmoides independientes por etiqueta, y solo se devuelven los primeros `len(labels)` logits. Esto significa que las etiquetas no compiten entre si de forma normalizada y que la salida debe interpretarse etiqueta a etiqueta.

## Capacidades

- Clasificacion de texto en un unico grupo de etiquetas, con un maximo de 8 etiquetas por invocacion.
- Soporte de etiquetas de tipo choice (eleccion entre categorias), yes/no (binaria) y ordinal, todas resueltas con la misma cabeza entrenada.
- Procesamiento de hasta 128 tokens tokenizados de entrada; las entradas que exceden ese limite fallan de forma explicita.
- Inferencia completamente local y on-device sobre Core ML, sin carga de pesos PyTorch originales en tiempo de ejecucion.
- Tokenizador, configuracion y procesador GLiFormer incluidos en el propio paquete.
- Reproducibilidad mediante `assets.lock.json`, que fija las revisiones del checkpoint de origen, el tokenizador y el motor de decision.
- No soporta generacion de texto, razonamiento libre, codigo, matematicas, vision, audio, NER, extraccion de layout ni estructuracion; esas tareas de GLiFormer no estan exportadas.
- No se documenta soporte de tool calling, function calling ni flujos de agente multi-paso.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Enrutado de tickets de soporte: el modelo puntua una consulta entrante contra un conjunto reducido de colas (por ejemplo, "billing: invoice or payment issue" frente a "support: technical product issue") y devuelve una puntuacion sigmoide por cola. El ejemplo de la model card usa exactamente este escenario, que encaja con el limite de 8 etiquetas.
- Moderacion o triaje binario en aplicaciones de escritorio: con etiquetas yes/no se puede construir un filtro local que no envia datos a un servidor, aprovechando que la inferencia es on-device.
- Clasificacion de intencion en asistentes locales: con tres o mas etiquetas de tipo choice se puede decidir la intencion de una frase corta antes de despachar a otro componente del sistema.
- Escalado ordinal de severidad: las etiquetas ordinales permiten mapear un texto a niveles ordenados (por ejemplo, severidad baja, media, alta) reutilizando la misma cabeza entrenada.
- Procesamiento por lotes offline en un Mac: dado que el paquete es batch-1, el uso practico es el recorrido secuencial de un fichero de textos cortos de hasta 128 tokens, sin dependencia de red ni de GPU dedicada.
- Preprocesado en pipelines documentales: clasificar fragmentos cortos (asuntos, primeras lineas, resumenes) antes de pasarlos a un modelo mayor, reduciendo coste y latencia en la etapa cara.
- Verificacion de paridad en CI: el par de scripts `verify.py` y `export.py` permite reexportar y comparar logits Core ML contra PyTorch nativo como parte de un control de regresion de la conversion.
- Prototipado de clasificadores on-device en macOS: sirve como referencia de como empaquetar un encoder de 24 capas con cabeza de clasificacion en un ML Program FP16 de tamano manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la calidad completa del Decision Index, otras longitudes de entrada, otras cabezas de tarea y el rendimiento amplio de latencia y ANE no han sido evaluados, y que esta conversion no constituye un resultado de benchmark del Decision Index.

Lo unico verificable son las comprobaciones de paridad numerica sobre cuatro fixtures reales del checkpoint de origen:

| Comprobacion | Resultado |
|---|---|
| Wrapper matematico de decision frente a logits nativos | discrepancia dentro de 3,82e-6 |
| Parches solo de trazado frente a logits nativos | coincidencia exacta en los fixtures comprobados |
| Core ML FP16 frente a nativo | 4 de 4 etiquetas preservadas; error absoluto maximo de logits 0,1139 |
| Core ML FP32 (control de diagnostico, no distribuido) | 4 de 4 de acuerdo; error absoluto maximo de logits 3,44e-5 |

Fixtures cubiertos: facturacion, soporte tecnico, eleccion entre tres etiquetas y clasificacion yes/no.

## Requisitos de hardware

- El paquete FP16 ocupa aproximadamente 880 MB en disco, por lo que la huella de pesos en memoria es del orden de esa cifra, mas las activaciones correspondientes a una entrada de 128 tokens y lote 1.
- Ejecucion prevista sobre Core ML en macOS 15 o posterior; el entorno de referencia del autor usa Python 3.12.
- Al ser un modelo Core ML orientado a on-device, el hardware objetivo son equipos Apple con Neural Engine; no se documentan GPU CUDA recomendadas.
- VRAM estimada: no disponible (no es un modelo pensado para GPU discretas).
- Cabe en hardware de consumo Apple: si, es precisamente su proposito, aunque no se especifican modelos ni generaciones concretas de chip.
- Opciones de despliegue: Core ML a traves del runtime incluido (`runtime.JeffCoreML`), con `uv sync --frozen` para preparar el entorno. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es un ML Program.
- Latencia y throughput: no disponibles. La model card advierte de que el rendimiento amplio de latencia y ANE no ha sido evaluado y no reclama ser mas rapido que otra alternativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| FluidInference/jeff-coreml | 575.637.510 (checkpoint de origen) | 128 tokens fijos | Clasificacion de un grupo de 1 a 8 etiquetas | Apache-2.0 (pesos) y MIT (adaptador) | Core ML .mlpackage FP16 | Repositorio publico, 0 descargas |
| knowledgator/gliformer-large-v1 | 575.637.510 | no disponible | Multiples tareas GLiFormer: clasificacion, NER, layout, vision, audio, structuring | Apache-2.0 | no disponible | Checkpoint de origen referenciado |
| Encoders tipo DeBERTa-v3-large | del orden de 435 millones (dato no confirmado en la informacion proporcionada) | no disponible | Clasificacion y tareas de understanding | MIT (segun el proyecto original) | safetensors, entre otros | Ampliamente disponible |

La comparacion directa se limita al checkpoint de origen, ya que este paquete es una conversion suya y no incorpora pesos nuevos. Frente a encoders genericos comparables en tamano, la diferencia no esta en la calidad del modelo sino en el formato de despliegue: aqui se sacrifica flexibilidad de tareas (solo clasificacion, solo 128 tokens, solo lote 1) a cambio de ejecucion local en Core ML.

## Limitaciones y advertencias

- Alcance funcional muy acotado: unicamente el camino de clasificacion. NER, extraccion de layout, vision, audio y structuring de GLiFormer no estan exportados.
- Las entradas de mas de 128 tokens o con mas de 8 etiquetas fallan de forma explicita, sin truncado silencioso.
- Lote fijo de 1: no hay procesamiento por lotes real en el paquete exportado.
- Las probabilidades son sigmoides independientes, no un softmax normalizado. No deben interpretarse como una distribucion que suma 1 ni compararse directamente entre etiquetas como probabilidades relativas.
- Solo se devuelven los primeros `len(labels)` logits; el resto de la cabeza no es accesible.
- Sesgos conocidos: no disponibles. La model card no documenta analisis de sesgo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea fuera de la distribucion de entrenamiento, y no se han medido esos margenes.
- Idiomas soportados: no disponibles. La model card no especifica cobertura linguistica.
- Restricciones de licencia: los pesos derivan de GLiFormer bajo Apache-2.0 y el codigo del adaptador de decision de Jeff es MIT, con atribucion conservada en el codigo auxiliar. La conversion se apoya tambien en la implementacion DeBERTa de Transformers.
- El paquete FP32 (mayor precision) no se incluye por tamano, de modo que en produccion solo se dispone de FP16, con un error absoluto maximo de logits medido de 0,1139 en los fixtures comprobados.
- La model card no reclama ninguna ventaja de velocidad o precision frente a otros modelos, y no hay datos de latencia ni de rendimiento en el Neural Engine.
- Sin descargas ni likes registrados y sin resultados de benchmark publicados: la validacion se limita a cuatro fixtures, por lo que conviene reproducir `verify.py` antes de cualquier uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/jeff-coreml
- Checkpoint de origen: https://huggingface.co/knowledgator/gliformer-large-v1
- Proyecto Jeff: https://github.com/logan-markewich/jeff
- Implementacion DeBERTa de Transformers: https://github.com/huggingface/transformers
- Ficheros de paridad citados en la model card: `native-parity.json` y `coreml-parity-fp16.json` (incluidos en el repositorio)
- Fichero de versiones fijadas: `assets.lock.json` (incluido en el repositorio)
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo.
