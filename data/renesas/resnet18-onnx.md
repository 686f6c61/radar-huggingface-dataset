# Renesas/ResNet18-ONNX

## Resumen

ResNet18-ONNX es un repositorio publicado por Renesas que aloja la red convolucional residual ResNet-18 tal y como la exporta la version v1.7 del ONNX Model Zoo, orientada a la inferencia de clasificacion de imagenes sobre la plataforma Renesas R-Car X5H mediante su NPU NPX6. El modelo base es `onnxmodelzoo/resnet18-v1-7` y cuenta con 11,7 millones de parametros, con salida sobre las 1000 clases de ImageNet ILSVRC2012.

La relevancia de esta ficha es doble. Por un lado, documenta el flujo de despliegue que Renesas propone para su hardware: un ONNX en FP32 que la cadena de herramientas MWMX (Middleware MX) convierte automaticamente a INT8 en tiempo de compilacion, sin necesidad de un paso de cuantizacion separado, y que se ejecuta sobre la NPU NPX6-48K. Por otro, publica latencias medidas en silicon real mediante un pipeline de hardware-in-the-loop (CI "APM50"), con 1,5616 ms con un solo core de IA y 1,2957 ms con 12 cores a 850 MHz.

Es importante advertir que el fichero de pesos **no esta subido al repositorio** en el momento de redactar esta ficha (el tamano del repo es de 0,0 GB y la propia model card lo indica explicitamente). Los numeros de rendimiento se publicaron antes que los pesos, por lo que los pasos de descarga y despliegue no funcionaran hasta que el artefacto se anada. Tampoco se ha publicado ninguna metrica de exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18: red neuronal convolucional con conexiones residuales (18 capas) |
| Parametros totales | 11,7 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la model card no define contexto) |
| Tipos de cuantizacion | Entrada en FP32 (ONNX); el toolchain MWMX aplica auto-cast a INT8 en tiempo de compilacion, sin paso de cuantizacion separado |
| Idiomas soportados | no disponible (tarea de clasificacion de imagenes, sin lenguaje natural asociado) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32); el fichero no esta publicado actualmente en el repositorio |
| Tarea | Clasificacion de imagenes, ImageNet ILSVRC2012, 1000 clases |
| Modelo base | onnxmodelzoo/resnet18-v1-7 |
| Version del export | ONNX Model Zoo v1.7 |
| Plataforma objetivo | Renesas R-Car X5H con NPU NPX6-48K |
| Runtime | Renesas MWMX (Middleware MX) |
| Resolucion de entrada | no disponible (la model card la marca como TBD) |
| Estado del artefacto | FP32 (ONNX): no subido todavia |

## Arquitectura y entrenamiento

ResNet-18 es una red convolucional profunda con conexiones residuales (bloques de atajo que suman la entrada a la salida de cada bloque), disenada originalmente para mitigar el problema de degradacion del gradiente en redes profundas. La variante alojada aqui es la exportacion oficial del ONNX Model Zoo en su version v1.7, que produce un grafo ONNX en FP32 con 11,7 millones de parametros y una cabeza de clasificacion de 1000 clases correspondientes a ImageNet ILSVRC2012.

No se dispone de informacion sobre el procedimiento de entrenamiento en la documentacion proporcionada: ni el numero de tokens o imagenes, ni la composicion del dataset mas alla de la referencia a ImageNet ILSVRC2012, ni si hubo tecnicas de ajuste posteriores. Tampoco se detalla el esquema de cuantizacion mas alla de indicar que el runtime MWMX realiza un auto-cast de FP32 a INT8 durante la compilacion, sin calibrar explicitamente ni requerir un modelo cuantizado aparte. La innovacion relevante de este repositorio no esta en el modelo en si, sino en la integracion con el hardware de Renesas: ejecucion del grafo ONNX sobre la NPU NPX6-48K y reparto del trabajo entre 1 y 12 cores de IA segun la configuracion.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet ILSVRC2012.
- Extraccion de caracteristicas visuales de nivel convolucional, utilizable como backbone en tareas derivadas (deteccion, segmentacion, similitud de imagenes).
- Inferencia en precision INT8 sobre NPU, con auto-cast desde ONNX FP32 por el toolchain MWMX.
- Ejecucion escalable en numero de cores de IA: el repositorio reporta resultados tanto con 1 core como con 12 cores por instancia de NPU.
- No soporta tool calling ni function calling: es un modelo puramente discriminativo de vision.
- No dispone de capacidades de agente, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues (no procesa lenguaje natural).
- No se documentan capacidades de vision mas alla de la clasificacion (ni deteccion de objetos, ni segmentacion, ni vision-lenguaje).

## Casos de uso

- Clasificacion de imagenes en el borde sobre hardware Renesas: el modelo se compila con MWMX y se ejecuta en la NPU NPX6 del R-Car X5H con latencias de 1,3 a 1,6 ms por inferencia a batch 1, lo que permite clasificar flujos de video o rafagas de imagenes en tiempo real.
- Preprocesado visual en sistemas de automocion: dado que el R-Car X5H es una plataforma para vehiculo, ResNet-18 puede actuar como clasificador de primer nivel (por ejemplo, categorizacion de escenas o filtrado de fotogramas) alimentando etapas posteriores mas costosas.
- Control de calidad industrial en linea de produccion: clasificacion de piezas o defectos visuales a partir de imagenes capturadas por camara, aprovechando la latencia inferior a 2 ms por inferencia para mantener el ritmo de una linea.
- Extraccion de embeddings para busqueda por similitud visual: usando las activaciones de las capas previas a la cabeza de clasificacion, se puede construir un indice de imagenes similares en aplicaciones de catalogacion.
- Backbone para transfer learning en tareas especificas: al ser un ONNX de 11,7 M de parametros con licencia Apache 2.0, es viable reentrenar la cabeza de clasificacion para dominios concretos (medicina, satelite, retail) con coste computacional bajo.
- Filtrado previo en pipelines de vision por computador embebidos: descartar rapidamente imagenes que no contienen las clases de interes antes de invocar un modelo mayor, reduciendo el consumo energetico global del sistema.
- Validacion de la cadena de despliegue ONNX a NPU: sirve como modelo de referencia para verificar que el toolchain MWMX compila correctamente un grafo convolucional conocido y que las latencias obtenidas coinciden con las publicadas en el CI.

## Benchmarks y rendimiento

La model card no publica resultados de exactitud para este repositorio (la seccion de accuracy figura como TBD). Los unicos datos numericos disponibles son las latencias medidas en hardware real mediante el runtime MWMX sobre un R-Car X5H con NPU NPX6-48K, a 850 MHz, batch size 1 y un solo NPU:

| Runtime | Precision | Dispositivo | Latencia (ms) | Tipo |
|---|---|---|---|---|
| MWMX Runtime | INT8 (auto) | X5H, 1x NPU, 1 core, 850 MHz | 1,561618 | Medido |
| MWMX Runtime | INT8 (auto) | X5H, 1x NPU, 12 cores, 850 MHz | 1,295733 | Medido |

Configuracion del benchmark: un solo NPU, batch size 1 y resolucion de entrada no disponible en los datos de origen (TBD). No se han publicado resultados de benchmarks de exactitud (top-1, top-5) ni metricas comparativas tipo MMLU, HumanEval o GSM8K, que por otra parte no aplican a un clasificador de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo; el modelo se ejecuta sobre NPU, no sobre GPU. Para una ejecucion alternativa en GPU con ONNX Runtime en FP32, los 11,7 M de parametros suponen aproximadamente 47 MB de pesos mas activaciones, aunque este dato no esta documentado por el autor.
- GPU recomendadas: no disponibles. La model card no contempla ejecucion en GPU; el target declarado es la NPU NPX6-48K del R-Car X5H.
- Compatibilidad con GPU de consumo: no documentada. Por tamano, un modelo de 11,7 M de parametros cabe holgadamente en cualquier GPU de consumo, pero no hay soporte ni cifras publicadas por Renesas para ese escenario.
- Opciones de despliegue: runtime Renesas MWMX (Middleware MX) sobre placa R-Car X5H con NPU NPX6. Como el artefacto es un grafo ONNX, tecnicamente puede cargarse con ONNX Runtime en otras plataformas, pero esto no forma parte de la documentacion oficial ni de los benchmarks publicados.
- Latencia y throughput estimados: 1,561618 ms por inferencia con 1 core de IA y 1,295733 ms con 12 cores, a 850 MHz y batch 1. El escalado de 1 a 12 cores reduce la latencia aproximadamente un 17 %, lo que sugiere un componente de latencia fija relevante en este modelo.
- Prerequisitos declarados: placa Renesas R-Car X5H con NPU NPX6, runtime Renesas MWMX y la CLI de Hugging Face para descargar el modelo una vez publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Export | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renesas/ResNet18-ONNX | 11,7 M | ONNX Model Zoo v1.7 | Clasificacion ImageNet (1000 clases) | Apache 2.0 | Pesos aun no publicados en el repo |
| Renesas/ResNet34-ONNX | no disponible en la informacion proporcionada | ONNX Model Zoo v1.7 | Clasificacion ImageNet | Apache 2.0 (segun el tag de licencia del repo hermano, no confirmado en la informacion) | Repositorio hermano citado en la model card |
| Renesas/ResNet101-ONNX | no disponible en la informacion proporcionada | ONNX Model Zoo v1.7 | Clasificacion ImageNet | no disponible | Repositorio hermano citado en la model card |
| Renesas/ResNet152-ONNX | no disponible en la informacion proporcionada | ONNX Model Zoo v1.7 | Clasificacion ImageNet | no disponible | Repositorio hermano citado en la model card |
| Renesas/ResNet50-ONNX | no disponible en la informacion proporcionada | ONNX Model Zoo v1.12 | Clasificacion ImageNet | no disponible | Repositorio distinto, con otra version de export |
| onnxmodelzoo/resnet18-v1-7 | 11,7 M (hereda del export original) | ONNX Model Zoo v1.7 | Clasificacion ImageNet | no disponible | Modelo de origen |

La model card advierte explicitamente de que no se deben comparar los numeros de benchmark entre ResNet18-ONNX y ResNet50-ONNX, porque corresponden a versiones distintas del export del ONNX Model Zoo (v1.7 frente a v1.12) y a profundidades de red diferentes. No se dispone de cifras de latencia ni de exactitud de los repositorios hermanos en la informacion proporcionada.

## Limitaciones y advertencias

- El fichero de pesos no esta publicado: el repositorio tiene 0,0 GB y la model card indica que los resultados de benchmark se publicaron antes que el modelo. La descarga y el despliegue no funcionaran hasta que se suba el artefacto.
- No hay metricas de exactitud publicadas: la seccion de accuracy figura como TBD, por lo que no se puede verificar la perdida de precision introducida por el auto-cast a INT8.
- La resolucion de entrada no esta documentada en los datos de origen, lo que impide reproducir el benchmark sin ensayo previo.
- El modelo esta limitado a clasificacion de imagenes sobre las 1000 clases de ImageNet; no generaliza a otras tareas sin reentrenamiento.
- Riesgo de sesgo heredado del dataset ImageNet ILSVRC2012: las taxonomias, la distribucion de clases y las anotaciones del dataset original condicionan el comportamiento del modelo. No se documenta ningun analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion en el sentido clasico no aplica (modelo discriminativo), pero si existe riesgo de clasificaciones erroneas con alta confianza en dominios alejados de la distribucion de ImageNet.
- Sin soporte multilingue ni de lenguaje natural: cualquier caso de uso que requiera texto queda fuera de su alcance.
- Dependencia de hardware propietario: el flujo documentado exige placa R-Car X5H, NPU NPX6 y runtime MWMX, lo que limita la portabilidad a otros entornos.
- La licencia Apache 2.0 permite uso comercial del artefacto que se publique, pero conviene verificar las condiciones del modelo de origen en el ONNX Model Zoo antes de un despliegue en produccion.
- Los repositorios hermanos (ResNet34, ResNet101, ResNet152 con export v1.7 y ResNet50 con export v1.12) no son intercambiables entre si a efectos de comparacion de rendimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Renesas/ResNet18-ONNX
- Modelo de origen: https://huggingface.co/onnxmodelzoo/resnet18-v1-7
- ONNX Model Zoo (repositorio GitHub): https://github.com/onnx/models
- Repositorio hermano ResNet50-ONNX: https://huggingface.co/Renesas/ResNet50-ONNX
- Repositorio hermano ResNet34-ONNX: https://huggingface.co/Renesas/ResNet34-ONNX
- Repositorio hermano ResNet101-ONNX: https://huggingface.co/Renesas/ResNet101-ONNX
- Repositorio hermano ResNet152-ONNX: https://huggingface.co/Renesas/ResNet152-ONNX
- Sitio corporativo de Renesas: https://www.renesas.com/
- Catalogo de productos de Renesas: https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia: https://en.wikipedia.org/wiki/Renesas_Electronics
