# reverie-studio/Qwen-Image-Edit-2511-GGUF

## Resumen

Qwen-Image-Edit-2511-GGUF (Reverie mirror) es un espejo sin modificaciones del repositorio `unsloth/Qwen-Image-Edit-2511-GGUF`, que a su vez contiene una cuantizacion GGUF del modelo Qwen-Image-Edit-2511 de Alibaba Qwen. El modelo original es un modelo de edicion de imagenes por difusion, disenado para modificar imagenes existentes a partir de instrucciones en lenguaje natural, manteniendo la coherencia del sujeto y del estilo. Este repositorio concreto no aporta pesos nuevos: replica byte a byte los ficheros del upstream para que el servicio Mirage de Reverie descargue todos sus modelos desde un unico punto.

La relevancia de esta ficha es doble. Por un lado, documenta la existencia de una distribucion GGUF del modelo de edicion de imagen, lo que permite ejecutarlo en entornos con recursos limitados mediante herramientas compatibles con dicho formato. Por otro, advierte de que se trata de un espejo de terceros no afiliado a los autores originales, fijado a la revision `0d33d9692b4b26212297240d87b0d4719aa4fd06` del 8 de enero de 2026, mientras que el upstream reemplazo sus cuantizaciones el 29 de octubre de 2026.

El repositorio tiene un tamano de 21,8 GB y declara 20.430.401.088 parametros en formato safetensors, aunque el unico peso publicado es un fichero GGUF con cuantizacion Q8_0. La licencia es Apache 2.0 y no se declaran idiomas soportados en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de edicion de imagen por difusion, segun la denominacion Qwen-Image-Edit) |
| Parametros totales | 20.430.401.088 (dato declarado en safetensors) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen-image-edit-2511-Q8_0.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. La model card del espejo no incluye detalles tecnicos y remite al `ORIGINAL_README.md` del repositorio upstream, que no forma parte de la informacion proporcionada.

Lo unico verificable es que el modelo pertenece a la familia Qwen-Image-Edit, orientada a la edicion de imagenes condicionada por texto, y que se distribuye en formato GGUF con cuantizacion Q8_0. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, destilacion) seria especulativa y no se incluye.

## Capacidades

- Edicion de imagenes a partir de instrucciones en lenguaje natural, segun la denominacion del modelo original (Qwen-Image-Edit).
- Distribucion en formato GGUF, lo que permite su uso con runtimes compatibles con dicho formato.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision adicional ni audio.
- No se documentan capacidades multilingues especificas.
- No se documenta un modo de razonamiento (thinking mode) ni variantes de inferencia especiales.

## Casos de uso

- Edicion de imagenes en local: el fichero Q8_0 permite ejecutar el modelo en estaciones de trabajo sin depender de servicios en la nube, usando runtimes que acepten GGUF.
- Prototipado de pipelines de retoque asistido: integracion del modelo en flujos de preprocesado y postprocesado de imagen para evaluar la calidad de las ediciones antes de adoptar la version completa en safetensors.
- Investigacion en edicion guiada por texto: uso del modelo como referencia reproducible, ya que el espejo fija una revision concreta y publica checksums en `SHA256SUMS`.
- Despliegue interno con cuantizacion: entornos que priorizan la reduccion de memoria frente a la maxima fidelidad numerica pueden usar Q8_0 como compromiso.
- Replicacion de entornos de evaluacion: al ser byte a byte identico al upstream, sirve para reproducir resultados de pruebas realizadas sobre la misma revision.
- Distribucion centralizada en infraestructura propia: util para organizaciones que, como Reverie, centralizan la descarga de modelos en un unico repositorio espejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un fichero GGUF Q8_0 de un modelo de ~20.000 millones de parametros ocupa del orden de 20 GB en disco, por lo que la inferencia requerira una GPU con memoria suficiente para el peso mas los tensores intermedios; la cifra exacta no esta documentada.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de este tamano en Q8_0 excede la VRAM de la mayoria de GPU de consumo actuales.
- Opciones de despliegue: cualquier runtime compatible con GGUF; no se especifica cual soporta el modelo Qwen-Image-Edit.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de edicion de imagen que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Es un espejo de terceros no afiliado ni respaldado por los autores originales; la responsabilidad tecnica recae en el repositorio upstream.
- El espejo esta fijado a la revision del 8 de enero de 2026, mientras que el upstream reemplazo sus cuantizaciones el 29 de octubre de 2026; puede estar desactualizado respecto al original.
- Solo se publica la cuantizacion Q8_0; no hay variantes de menor precision en este repositorio.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de los terminos del modelo original y de las dependencias asociadas.
- El rendimiento real puede diferir del modelo en safetensors debido a la cuantizacion.
- No se garantiza soporte ni mantenimiento por parte del autor del espejo.

## Enlaces

- Repositorio del espejo: https://huggingface.co/reverie-studio/Qwen-Image-Edit-2511-GGUF
- Repositorio upstream: https://huggingface.co/unsloth/Qwen-Image-Edit-2511-GGUF
- Revision fijada del upstream: `0d33d9692b4b26212297240d87b0d4719aa4fd06` (8 de enero de 2026)
- Fichero de checksums: `SHA256SUMS` (incluido en el repositorio)
- Model card original: `ORIGINAL_README.md` (incluido en el repositorio)
