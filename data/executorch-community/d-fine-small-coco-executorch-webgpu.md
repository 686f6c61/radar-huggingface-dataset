# executorch-community/D-FINE-Small-COCO-ExecuTorch-WebGPU

## Resumen

D-FINE-Small-COCO-ExecuTorch-WebGPU es una conversion del detector de objetos D-FINE Small entrenado sobre COCO, empaquetada en formato ExecuTorch (`.pte`) para el backend WebGPU. El modelo original fue desarrollado por Yansong Peng y colaboradores de la USTC (Universidad de Ciencia y Tecnologia de China) y se describe en el paper "D-FINE: Redefine Regression Task in DETRs as Fine-grained Distribution Refinement" (arXiv:2410.13842). Se trata de un detector estilo DETR en tiempo real que refina las cajas como distribuciones de probabilidad, con 10,3 millones de parametros y sin necesidad de supresion de no maximos (NMS). Esta version concreta la publica el espacio executorch-community y la mantiene Meta Platforms, Inc.

La relevancia de esta ficha esta en que el modelo se ejecuta integramente en el navegador, sobre la GPU del visitante, a traves del backend WebGPU de ExecuTorch. El programa exportado pesa 40,3 MB en fp32 y alimenta la demo del ExecuTorch WebGPU Playground. No es un modelo de lenguaje ni un sistema multimodal: es un detector de objetos que reconoce las 80 clases de COCO y devuelve cajas con puntuaciones por clase.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, la licencia es Apache 2.0 y el modelo base es `ustc-community/dfine-small-coco`. La conversion es fiel: todos los tensores se verificaron bit a bit frente al checkpoint oficial `dfine_s_coco.pth` publicado por el primer autor, y la reejecucion de la receta produce archivos identicos byte a byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR con refinamiento de distribucion de grano fino (D-FINE), sin NMS |
| Parametros totales | 10,3 millones (10.3M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | fp32 (tal como se exporto) |
| Idiomas soportados | no disponible (modelo de deteccion de objetos; 80 clases COCO) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (delegado al backend WebGPU); modelo base en safetensors |
| Tamano total | 40,3 MB |
| Entrada | tensor float32 `[1, 3, 640, 640]` RGB en rango [0, 1] (`x / 255`, sin media ni desviacion estandar) |
| Salida | tensor float32 `[1, 84, 300]`: filas 0-3 = centro x, centro y, ancho y alto en pixeles; filas 4-83 = puntuaciones sigmoide de las 80 clases COCO |
| Modelo base | ustc-community/dfine-small-coco (`f79e65b5fbb33ceb9d3ebba042955d7410c608f8`) |

## Arquitectura y entrenamiento

El modelo base D-FINE es un detector de objetos estilo DETR en tiempo real que redefine la tarea de regresion de cajas como un refinamiento de distribucion de grano fino (fine-grained distribution refinement). En lugar de predecir coordenadas de caja directamente, el modelo refina iterativamente las cajas como distribuciones de probabilidad, lo que mejora la localizacion sin requerir supresion de no maximos. La variante Small cuenta con 10,3 millones de parametros y detecta las 80 clases del dataset COCO.

Esta conversion no reentrena el modelo: parte del checkpoint oficial y lo reescribe con sustituciones que preservan la salida para que se ejecute como un unico delegado de WebGPU. El grafo se ha validado contra la version original sobre una imagen real, con cajas que coinciden dentro de 0,001 px. La entrada esta fijada a 640x640 y las 300 consultas de salida se filtran por puntuacion fuera del programa. No hay datos disponibles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplican a un detector de este tipo); para esos detalles hay que consultar la model card del modelo original.

## Capacidades

- Deteccion de objetos en imagenes: reconoce las 80 clases del dataset COCO.
- Salida sin NMS: al ser un detector DETR, no necesita supresion de no maximos.
- Refinamiento fino de cajas: las localizaciones se refinan como distribuciones de probabilidad.
- Entrada de imagen fija de 640x640 en float32 RGB normalizada a [0, 1].
- Obtencion de cajas y puntuaciones por clase a partir de las 300 consultas de salida.
- Ejecucion en navegador: corre sobre la GPU del dispositivo mediante WebGPU, sin envio de datos a servidores.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo de lenguaje.
- No dispone de modo de pensamiento (thinking mode), vision de lenguaje, audio ni generacion de texto.

## Casos de uso

- Deteccion de objetos en el navegador sin backend: al ejecutarse enteramente en la GPU del visitante a traves de WebGPU, permite aplicaciones web de vision por computador que no envian imagenes a un servidor, con la consiguiente ventaja en privacidad y latencia.
- Etiquetado y anotacion de imagenes en herramientas web: el modelo puede preanotar las 80 clases COCO sobre fotografias subidas por el usuario, acelerando el trabajo de anotacion manual dentro de una aplicacion de navegador.
- Analisis de fotogramas de video o camara en tiempo real: con entrada de 640x640 y sin NMS, encaja en pipelines que procesan fotogramas de la webcam del usuario directamente en el cliente.
- Filtrado y moderacion de contenido visual en el lado del cliente: deteccion de objetos cotidianos en imagenes antes de subirlas a un servicio, reduciendo el trafico y aplicando politicas localmente.
- Demostraciones interactivas y educativas: la propia model card indica que alimenta la demo del ExecuTorch WebGPU Playground, por lo que sirve como ejemplo reproducible de despliegue de modelos en el navegador.
- Aplicaciones de realidad aumentada ligera en web: al estar fijada la entrada a 640x640 y devolver cajas en pixeles de la entrada, se puede integrar en superposiciones graficas sobre el flujo de camara.
- Prototipado de pipelines de deteccion sin infraestructura GPU: el tamano de 40,3 MB y el hecho de ejecutarse en navegador permiten probar flujos de deteccion sin aprovisionar servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye tablas de metricas (mAP, AP50, etc.) y remite a la model card del modelo original (`ustc-community/dfine-small-coco`) para los resultados de evaluacion. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 son de aproximadamente 41 MB (40,3 MB de archivo); hay que sumar las activaciones de una entrada de 640x640, cuyo valor exacto no esta disponible en la informacion proporcionada.
- GPU recomendadas: cualquier GPU compatible con WebGPU, ya que el modelo se ejecuta en el navegador del dispositivo a traves del backend WebGPU de ExecuTorch; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la documentacion.
- Compatibilidad con GPU de consumo: si, siempre que el navegador tenga WebGPU habilitado; el modelo esta pensado precisamente para ejecucion en el cliente.
- Opciones de despliegue: backend WebGPU de ExecuTorch; la receta de exportacion esta en `recipes/detector-dfine-small.py` dentro de la carpeta `export/`. El runtime WebAssembly usado por el ExecuTorch WebGPU Playground aun no esta publicado, por lo que hasta su publicacion el playground es la via soportada para ejecutarlos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables en la informacion proporcionada para establecer una comparativa rigurosa. Como referencias de la misma categoria podrian citarse otros detectores DETR de tamano pequeno o variantes de D-FINE (nano, medium, large), pero no se aportan sus cifras en esta informacion.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| D-FINE-Small-COCO-ExecuTorch-WebGPU | 10,3M | no aplica | Apache 2.0 | `.pte` (WebGPU) | HuggingFace, demo en playground |
| Otras variantes de D-FINE | no disponible | no aplica | no disponible | no disponible | no disponible |
| Otros detectores DETR pequenos | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo conoce las 80 clases de COCO; cualquier objeto fuera de ese conjunto no se detectara correctamente.
- Los objetos pequenos, poco habituales o muy ocluidos a menudo no se detectan, segun advierte la propia model card.
- Las puntuaciones de confianza no son probabilidades calibradas; no deben interpretarse como tales en produccion.
- La entrada esta fijada a 640x640; se debe redimensionar o aplicar letterbox, lo que puede afectar a la deteccion de objetos muy pequenos.
- La salida tiene 300 consultas que se deben filtrar por puntuacion fuera del programa; ese umbral es responsabilidad de la aplicacion.
- No se documentan sesgos especificos del modelo ni del dataset COCO en la informacion proporcionada; conviene revisar la model card original para riesgos de sesgo.
- Riesgo de alucinacion: al ser un modelo discriminativo de deteccion, el fenomeno análogo es la generacion de cajas falsas o puntuaciones espurias, especialmente con umbrales de confianza bajos.
- Licencia Apache 2.0: es una obra derivada distribuida bajo los mismos terminos; las modificaciones (conversion al formato ExecuTorch) son de Meta Platforms, Inc. Es compatible con uso comercial segun Apache 2.0, pero conviene verificar los terminos del modelo base.
- Restriccion importante de despliegue: el runtime WebAssembly del playground aun no esta publicado, por lo que fuera del playground la ejecucion no esta soportada oficialmente en el momento de la publicacion.
- Requiere un navegador con WebGPU habilitado; sin esa capacidad no se puede ejecutar.
- El modelo tiene 0 descargas y 0 likes, lo que indica nula validacion por parte de la comunidad hasta la fecha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/executorch-community/D-FINE-Small-COCO-ExecuTorch-WebGPU
- Modelo base: https://huggingface.co/ustc-community/dfine-small-coco
- Paper de D-FINE: https://arxiv.org/abs/2410.13842
- Repositorio oficial de D-FINE (autor original): https://github.com/Peterande/D-FINE
- Repositorio de ExecuTorch: https://github.com/pytorch/executorch
- Backend WebGPU de ExecuTorch: https://github.com/pytorch/executorch/tree/main/backends/webgpu
- Playground de ExecuTorch WebGPU: https://executorch.ai
