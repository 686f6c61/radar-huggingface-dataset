# Renesas/ConvNeXt-Base-ONNX

## Resumen

ConvNeXt-Base-ONNX es un artefacto de despliegue publicado por Renesas que contiene el clasificador de imagenes ConvNeXt-Base en formato ONNX FP32, optimizado para ejecutarse sobre la NPU NPX6-48K de la plataforma Renesas R-Car X5H. Deriva del checkpoint timm/convnext_base.fb_in22k_ft_in1k (config de OpenMMLab convnext_base_in21k_pre_3rdparty_in1k) y cuenta con 88,6 millones de parametros con una resolucion de entrada de 448 × 448.

Su relevancia no esta en la arquitectura en si, que es un ConvNeXt-Base estandar preentrenado en ImageNet-22k y ajustado en ImageNet-1k, sino en el flujo de despliegue: el modelo FP32 se entrega como ONNX y es el toolchain MWMX de Renesas el que realiza la conversion automatica a INT8 en tiempo de compilacion, sin necesidad de un paso de cuantizacion separado. Esto simplifica la puesta en produccion sobre silicio Renesas y da una cifra de latencia medida en hardware real (6,490 ms con un NPU de 12 nucleos a 850 MHz, batch 1).

El autor advierte explicitamente de que el repositorio fue renombrado porque el nombre anterior atribuia al modelo una tarea de deteccion de objetos que no existe: el grafo tiene una unica salida correspondiente a una cabeza de clasificacion ImageNet-21k → 1k, sin cabeza de deteccion. Es, por tanto, un modelo de clasificacion de imagenes para inferencia en el borde, no un sistema de deteccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Base (red convolucional) |
| Parametros totales | 88,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | ONNX FP32 en origen; auto-cast a INT8 por el toolchain MWMX en tiempo de compilacion (no se distribuye fichero INT8) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32) |
| Tarea | Clasificacion de imagenes |
| Resolucion de entrada | 448 × 448 (inferida del sufijo `_448` del checkpoint) |
| Modelo base | timm/convnext_base.fb_in22k_ft_in1k |
| Hardware objetivo | Renesas R-Car X5H, NPU NPX6-48K |
| Tamano del repositorio | 0,4 GB |
| Artefactos incluidos | `fp32/convnext-base_in21k-pre_3rdparty_in1k.onnx` |

## Arquitectura y entrenamiento

ConvNeXt-Base es una red convolucional pura con un diseno inspirado en los transformers de vision. Segun la model card, el checkpoint de origen es timm/convnext_base.fb_in22k_ft_in1k, correspondiente a la configuracion de OpenMMLab `convnext_base_in21k_pre_3rdparty_in1k`. El identificador del checkpoint de origen (`in21k_pre_3rdparty_in1k`) indica un preentrenamiento sobre ImageNet-21k seguido de un ajuste fino sobre ImageNet-1k, si bien la composicion exacta del dataset, el numero de tokens o imagenes vistas, el esquema de aumento de datos y el proceso de ajuste no se detallan en la informacion proporcionada. No hay RLHF, DPO ni tecnicas de alineacion, al tratarse de un clasificador supervisado y no de un modelo generativo.

La innovacion tecnica relevante en este repositorio no esta en el entrenamiento sino en el pipeline de despliegue: el grafo ONNX se exporta en FP32 y el runtime MWMX (Middleware MX) lo compila y lo convierte automaticamente a INT8 para su ejecucion en la NPU NPX6-48K del R-Car X5H. No existe un fichero INT8 distribuido por separado ni un paso de cuantizacion manual documentado. El grafo presenta una unica salida tensorial correspondiente a la cabeza de clasificacion.

## Capacidades

- Clasificacion de imagenes en las clases de ImageNet-1k, con una cabeza derivada del preentrenamiento en ImageNet-21k.
- Procesamiento de entradas RGB a 448 × 448 pixeles.
- Ejecucion en la NPU NPX6-48K del R-Car X5H mediante el runtime MWMX, con precision INT8 tras el auto-cast del toolchain.
- Inferencia por lotes con batch size 1 en la configuracion medida.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision-lenguaje, audio ni ninguna capacidad multimodal mas alla de la clasificacion de imagen.
- No incluye cabeza de deteccion de objetos ni de segmentacion, a pesar de lo que sugeria el nombre anterior del repositorio.

## Casos de uso

- Clasificacion de imagenes en el borde sobre automocion: el modelo se ejecuta directamente sobre la NPU NPX6-48K del R-Car X5H, lo que permite clasificar fotogramas o imagenes de camara a bordo sin depender de conectividad ni de un servidor externo, con una latencia medida de 6,490 ms por inferencia.
- Inspeccion visual industrial embebida: en una linea de fabricacion con una plataforma R-Car X5H, el modelo puede clasificar piezas o productos a 448 × 448 para tareas de control de calidad binario o multiclase, siempre que se reentrene o ajuste la cabeza al dominio concreto.
- Etiquetado y curado de datasets de imagen: dado su coste computacional bajo en INT8, puede usarse para preetiquetar grandes volumenes de imagenes de 448 × 448 antes de una revision humana, reduciendo el esfuerzo de anotacion.
- Filtrado previo en pipelines de vision: como etapa de descarte rapido antes de modelos mas costosos (por ejemplo, un detector o un modelo vision-lenguaje), clasificando escenas y descartando aquellas irrelevantes.
- Extraccion de caracteristicas para busqueda por similitud: el backbone ConvNeXt puede emplearse para obtener embeddings de imagen y alimentar un indice vectorial, aunque esta funcionalidad no esta documentada ni verificada en la model card y requeriria exponer una capa intermedia del grafo.
- Validacion de toolchain y benchmarking de NPU: el repositorio sirve como caso de referencia para verificar que el flujo ONNX FP32 → MWMX → INT8 funciona correctamente sobre R-Car X5H, y para comparar la particion de 12 nucleos frente a configuraciones alternativas.
- Analitica de video en retail o espacios publicos: conteo o categorizacion agregada de escenas, sujeto a las limitaciones de exactitud no publicadas y a las consideraciones legales y de privacidad aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de exactitud (top-1/top-5) en la informacion disponible: la model card indica explicitamente "TBD — not yet measured/published for this repo". El unico dato de rendimiento publicado es de latencia, medido con hardware-in-the-loop sobre silicio R-Car X5H real mediante el runtime MWMX (pipeline CI "APM80", target de rendimiento de envio).

| Runtime | Precision | Dispositivo | Latencia (ms) | Tipo |
|---|---|---|---|---|
| MWMX Runtime | INT8 (auto) | X5H · 1× NPU · 12 nucleos · 850 MHz | 6,490 | Medido |

Condiciones de la medicion: un solo NPU, batch size 1, entrada de 3 × 448 × 448. El autor indica que la particion de 1 nucleo de IA no compilo en el pipeline CI de origen, por lo que solo esta disponible el resultado de 12 nucleos, y confirma que el fallo de compilacion con 1 nucleo seguia produciendose en la ejecucion de benchmark del 2026-09-16.

## Requisitos de hardware

- Hardware principal: placa Renesas R-Car X5H con NPU NPX6-48K. Es un requisito imprescindible para reproducir la latencia publicada.
- Configuracion medida: 1 × NPU, 12 nucleos de IA, 850 MHz, batch 1, entrada 3 × 448 × 448, precision INT8.
- Configuracion de 1 nucleo: no disponible, la compilacion falla segun el autor.
- Pesos en disco: aproximadamente 354 MB en FP32 (88,6 M de parametros × 4 bytes); cerca de 89 MB equivalentes en INT8. Estimacion propia, no publicada en la model card.
- Memoria para inferencia: el modelo es pequeno (88,6 M de parametros) y cabe holgadamente en cualquier GPU de consumo actual; no obstante, no se han publicado cifras oficiales de VRAM ni de memoria del sistema. Como referencia orientativa, con pesos FP32 y activaciones para batch 1 a 448 × 448 el consumo deberia situarse en el rango de 1 a 2 GB, pero se trata de una estimacion no verificada.
- GPU recomendadas: no disponibles. El modelo no esta publicado con soporte oficial para CUDA, ROCm ni Metal; su destino declarado es la NPU NPX6.
- Opciones de despliegue: runtime MWMX de Renesas sobre R-Car X5H. Al ser un grafo ONNX estandar, podria ejecutarse con ONNX Runtime en CPU o GPU, pero esta via no esta documentada ni validada por el autor y las latencias serian muy distintas de la publicada.
- Throughput: no disponible. Solo se publica latencia por inferencia con batch 1.
- Requisitos previos declarados: placa R-Car X5H con NPU NPX6, runtime MWMX y la CLI de Hugging Face para la descarga (`hf download Renesas/ConvNeXt-Base-ONNX --repo-type=model --include "fp32/*"`).

## Comparativa con modelos similares

No se han publicado resultados de exactitud ni de latencia comparables en la informacion disponible para ninguno de los modelos de la tabla, por lo que las celdas de rendimiento se marcan como no disponibles.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renesas/ConvNeXt-Base-ONNX (este modelo) | 88,6 M | 448 × 448 | Latencia 6,490 ms en X5H (12 nucleos, INT8); exactitud no disponible | Apache-2.0 | ONNX FP32 en Hugging Face, destino NPU NPX6 |
| timm/convnext_base.fb_in22k_ft_in1k | no disponible en la informacion proporcionada (mismo checkpoint de origen) | no disponible | no disponible | no disponible | Pesos PyTorch en Hugging Face |
| ConvNeXt-Base (config OpenMMLab `convnext_base_in21k_pre_3rdparty_in1k`) | no disponible | 448 × 448 segun el sufijo del checkpoint | no disponible | no disponible | Repositorio MMPreTrain |
| Otros clasificadores ONNX para borde (por ejemplo MobileNet o EfficientNet en variantes ligeras) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

En la practica, la comparacion directa mas relevante es contra el checkpoint timm original del que deriva, ya que comparten pesos; la diferencia entre ambos es el formato (ONNX frente a PyTorch) y el proceso de conversion a INT8. Cualquier afirmacion sobre perdida de exactitud por la cuantizacion queda pendiente de la publicacion de metricas por parte del autor.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el autor advierte que el repositorio fue renombrado porque el nombre anterior atribuia al modelo deteccion de objetos. El grafo contiene una unica salida de clasificacion y no existe cabeza de deteccion. Si el objetivo era deteccion, hay que confirmar el checkpoint previsto.
- Ausencia de metricas de exactitud: no se han publicado valores de top-1 ni top-5 para este repositorio. No es posible cuantificar la degradacion introducida por el auto-cast a INT8.
- Cuantizacion automatica sin control del usuario: la conversion a INT8 la realiza el toolchain MWMX en tiempo de compilacion; no se documenta calibracion ni verificacion de precision posterior al cast.
- Fallo de compilacion con 1 nucleo de IA: solo esta disponible la configuracion de 12 nucleos, lo que limita el uso en escenarios con presupuesto energetico muy restringido.
- Dependencia de hardware propietario: reproducir las cifras publicadas exige una placa Renesas R-Car X5H con NPU NPX6-48K y el runtime MWMX. La ruta alternativa con ONNX Runtime no esta documentada.
- Dominio limitado a clasificacion ImageNet: el modelo clasifica en las 1000 clases de ImageNet-1k. Su uso en dominios especificos (industrial, medico, automocion) requerira ajuste fino con datos propios.
- Sin datos sobre sesgos: no hay evaluacion de sesgos ni de equidad por clase, subpoblacion o condiciones de iluminacion. Es un riesgo relevante en despliegues de vision sobre personas.
- Riesgo de clasificacion erronea con alta confianza: como cualquier clasificador softmax, puede producir predicciones incorrectas con probabilidad alta en entradas fuera de distribucion. Se recomienda umbral de confianza y validacion con datos representativos del dominio.
- Idiomas: no aplica; el modelo no procesa texto.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero conviene verificar por separado la licencia y los terminos del checkpoint de origen timm/convnext_base.fb_in22k_ft_in1k y las condiciones de uso de los datos de ImageNet para el caso concreto de despliegue.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Advertencia de seguridad: la model card es contenido generado por el autor y debe tratarse como referencia de datos, no como instrucciones de ejecucion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Renesas/ConvNeXt-Base-ONNX
- Modelo base en Hugging Face: https://huggingface.co/timm/convnext_base.fb_in22k_ft_in1k
- Configuracion de OpenMMLab MMPreTrain: https://github.com/open-mmlab/mmpretrain/blob/main/configs/convnext/metafile.yml
- Sitio de Renesas: https://www.renesas.com/
- Pagina de productos de Renesas: https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia (ingles): https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia (aleman): https://de.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia (frances): https://fr.wikipedia.org/wiki/Renesas_Electronics
