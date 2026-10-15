# ml-resources/sapiens2-pointmap-5b

## Resumen

Sapiens2-5B-Pointmap es un modelo de visión por computador desarrollado por Meta que estima un mapa de puntos 3D por píxel (coordenadas x, y, z en el sistema de referencia de la cámara) sobre imágenes centradas en personas. Se trata de un ajuste fino del backbone preentrenado Sapiens2-5B, y su tarea declarada en HuggingFace es la estimación de profundidad/estructura 3D, no la generación de texto. La ficha que se analiza aquí es un espejo publicado por la cuenta `ml-resources`, no una publicación oficial de Meta; el contenido del repositorio y la licencia se mantienen sin cambios respecto al original.

El modelo emplea una arquitectura Vision Transformer con 5.071 mil millones de parámetros en el backbone (5.348.345.879 parámetros totales contando el cabezal, según los pesos en safetensors), dimensión de embedding de 2432, 56 capas y 32 cabezas de atención, con parche de 16 píxeles y resolución de inferencia fija de 1024 × 768. Esto supone 15.722 TFLOPs por pasada de backbone, lo que lo sitúa en el extremo alto de la familia Sapiens2-Pointmap, que también incluye variantes de 0.4B, 0.8B y 1B.

Su relevancia actual es doble: por un lado, cubre una tarea de reconstrucción 3D densa sobre cuerpos humanos, útil para captura de movimiento, avatares y efectos visuales; por otro, forma parte de una familia escalable que permite elegir entre 1,26 y 15,72 TFLOPs según los requisitos de latencia y cómputo. La ausencia de resultados de benchmarks publicados en la información disponible y la licencia no estándar son los dos factores que más condicionan su evaluación previa a un uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Sapiens2 ViT backbone + cabezal de estimacion de pointmap) |
| Parametros totales | 5.348.345.879 (pesos en safetensors); 5.071 B en el backbone |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija de 1024 × 768 a parche 16; la secuencia resultante es de 3072 tokens visuales, calculo derivado de los datos de la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica el checkpoint en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible / no aplica (modelo de vision sin procesamiento de lenguaje) |
| Licencia | Sapiens2 License (etiquetada como `other`; texto en el repositorio oficial de GitHub) |
| Formato de pesos | safetensors (`sapiens2_5b_pointmap.safetensors`) |
| Tamano del repositorio | 21.4 GB |
| Dimension de embedding | 2432 |
| Capas | 56 |
| Cabezas de atencion | 32 |
| Tamano de parche | 16 |
| FLOPs del backbone | 15.722 T |
| Resolucion de inferencia | 1024 × 768 (alto × ancho) |
| Tarea (pipeline) | depth-estimation |
| Libreria | sapiens2 |
| Modelo base | facebook/sapiens2-pretrain-5b (ajuste fino) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer puro con normalizacion y atencion estandar sobre parches de 16 × 16 píxeles. El backbone Sapiens2-5B procesa la imagen a 1024 × 768 y produce representaciones de dimension 2432 a lo largo de 56 capas con 32 cabezas de atencion; sobre esa representacion se monta un cabezal de regresion densa que predice, para cada píxel, tres valores (x, y, z) expresados en el sistema de coordenadas de la camara. El checkpoint se ha obtenido por ajuste fino del backbone preentrenado Sapiens2-5B, es decir, no se ha entrenado desde cero.

La model card no documenta el numero de imagenes o tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO (habituales en modelos de lenguaje, pero no aplicables directamente a una tarea de regresion densa como esta). Tampoco se especifica si el ajuste fino congela parte del backbone o entrena la red completa. El dato tecnico mas relevante del que se dispone es el coste computacional por pasada (15.722 TFLOPs del backbone) y la pertenencia a una familia con cuatro escalas, lo que sugiere un entrenamiento en etapas con destilacion o preentrenamiento conjunto, aunque esto no se confirma en la informacion disponible.

## Capacidades

- Estimacion de pointmap denso: prediccion de coordenadas x, y, z por píxel en el marco de la camara, a resolucion de 1024 × 768.
- Procesamiento de imagenes centradas en personas (human-centric), el dominio declarado de uso previsto.
- Extraccion de representaciones visuales de alta dimension (2432) a partir del backbone Sapiens2-5B, reutilizables para otras tareas densas de la familia.
- Estimacion de profundidad implicita: el pipeline declarado en HuggingFace es `depth-estimation`, coherente con la salida de pointmap.
- Integracion con la libreria `sapiens2` y, segun las etiquetas del repositorio, compatibilidad declarada con `transformers`.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision-lenguaje, audio ni modo de pensamiento. Es un modelo estrictamente visual y monocanal en su entrada.
- No se documenta soporte multilingue: no hay componente de lenguaje.

## Casos de uso

- Captura de movimiento sin marcadores: el modelo reconstruye la geometria 3D del cuerpo a partir de una imagen monoculo, lo que permite estimar posiciones articulares en 3D sin sensores adicionales, usando la salida de pointmap como entrada de un ajuste de esqueleto.
- Creacion de avatares y reconstruccion de cuerpos: la nube de puntos por píxel sirve como base geometrica para generar mallas de cuerpo humano en flujos de modelado 3D, gracias a la resolucion de 1024 × 768 y a la densidad de la prediccion.
- Efectos visuales y composicion digital: en postproduccion, el pointmap permite insertar objetos virtuales con coherencia de profundidad respecto al actor, algo que una estimacion de profundidad escalar no cubre al faltar la componente de coordenada completa.
- Telepresencia y videollamada volumetrica: al obtener estructura 3D por fotograma desde una sola camara, se pueden generar representaciones de la persona con paralaje limitado sin necesidad de configuraciones estereo.
- Analisis biomecanico y aplicaciones de fitness: medicion de distancias y angulos corporales en 3D a partir de imagenes de entrenamiento o rehabilitacion, con la ventaja de que las distancias en el marco de la camara son geometricas y no solo relativas.
- Robotica e interaccion persona-robot: un sistema robotico puede estimar la posicion 3D de las personas del entorno a partir de una imagen RGB, empleando el pointmap como estimacion de rango aproximada cuando no hay LiDAR disponible.
- Prueba virtual de ropa y escaneo corporal: la reconstruccion densa permite calcular medidas corporales y superponer prendas con perspectiva correcta, siempre que la imagen de entrada cumpla las condiciones del dominio human-centric para el que se entreno el modelo.
- Investigacion en vision human-centric: uso como backbone o como referencia de punto de partida para tareas derivadas (segmentacion corporal, normales de superficie, reconstruccion multi-vista), dado que el checkpoint es un ajuste fino del backbone preentrenado publico.
- Generacion de datos sinteticos y anotacion automatica: el pointmap predicho puede emplearse para pseudo-etiquetar grandes volumenes de imagenes antes de un entrenamiento supervisado posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio espejo no incluye tablas de metricas (ni de error de profundidad, ni de error de pointmap, ni comparaciones con otras variantes), y la busqueda web realizada no devolvio material relevante sobre el modelo: los resultados obtenidos correspondian a paginas no relacionadas (unidades de volumen, vehiculos y videojuegos). No se dispone, por tanto, de cifras de MMLU, HumanEval ni GSM8K, que ademas no aplican a un modelo de vision sin componente de lenguaje.

## Requisitos de hardware

- VRAM estimada a partir del numero de parametros (5,35 B) y del tamano del repositorio: aproximadamente 21.4 GB en precision FP32, en torno a 10.7 GB en FP16/BF16, unos 5.3 GB en INT8 y unos 2.7 GB en INT4. Estas cifras son calculos derivados, no datos publicados en la model card, y no incluyen memoria de activaciones.
- La memoria de activaciones no esta documentada. Con 3072 tokens visuales y dimension 2432 en 56 capas, el consumo adicional durante la inferencia puede ser considerable; se recomienda reservar margen sobre el calculo de pesos.
- GPU recomendadas: para FP16 conviene una GPU con al menos 16-24 GB (RTX 4090, RTX A6000, L40S, A100 40 GB). Para FP32 o para lotes superiores a uno, se necesitan 40-80 GB (A100 80 GB, H100). Estas recomendaciones son orientativas y se basan en el tamano del modelo, no en mediciones publicadas.
- Cabe en GPU de consumo: con FP16 en una RTX 4090 (24 GB) es plausible segun el calculo de pesos, pero no hay confirmacion oficial ni cifras de memoria pico publicadas. En GPUs de 8-12 GB solo seria viable con cuantizacion, que no esta documentada ni distribuida.
- Opciones de despliegue: el procedimiento oficial es la libreria `sapiens2` del repositorio de Meta (`pip install -e .`) y los scripts de demostracion (`sapiens/dense/scripts/demo/pointmap.sh`). No se documentan integraciones oficiales con vLLM, TGI, llama.cpp, Ollama ni formatos GGUF; al tratarse de un modelo de vision con salida densa, esos runtimes no son aplicables directamente.
- Latencia y throughput: no disponibles. El unico dato de coste computacional publicado es el de 15.722 TFLOPs del backbone por pasada, que permite dimensionar teoricamente el coste pero no sustituye a una medicion real.

## Comparativa con modelos similares

La model card proporciona los datos de la propia familia Sapiens2-Pointmap, que es la comparativa directa mas fiable disponible. No se ha encontrado informacion de otros modelos de estimacion de pointmap human-centric en la busqueda realizada.

| Modelo | Parametros | FLOPs | Dim. embedding | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B (pointmap) | 0.398 B | 1.260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B (pointmap) | 0.818 B | 2.592 T | 1280 | 32 | 16 |
| Sapiens2-1B (pointmap) | 1.462 B | 4.715 T | 1536 | 40 | 24 |
| Sapiens2-5B (pointmap) (este) | 5.071 B | 15.722 T | 2432 | 56 | 32 |

Los cuatro comparten tarea, licencia (Sapiens2 License), formato de pesos (safetensors) y modelo base de preentrenamiento en su correspondiente escala. La eleccion entre ellos es un compromiso entre coste por inferencia (1,26 T frente a 15,72 TFLOPs, es decir, aproximadamente 12,5 veces mas computo en el 5B) y la capacidad de representacion que aportan la profundidad y el ancho de la red. No se dispone de datos que permitan afirmar cuanto mejora la precision del 5B respecto al 1B; no disponible.

## Limitaciones y advertencias

- Dominio restringido: el uso previsto declarado es la estimacion de pointmap en imagenes centradas en personas y la investigacion en vision human-centric. El comportamiento fuera de ese dominio no esta documentado y no deberia asumirse.
- Ausencia total de benchmarks: no hay metricas publicadas en la informacion disponible, ni absolutas ni comparativas con las otras escalas de la familia, lo que impide justificar la eleccion del 5B frente al 1B con datos.
- Licencia no estandar: se distribuye bajo la Sapiens2 License, etiquetada como `other`. El texto completo esta en el repositorio de GitHub de Meta y no se resume en la model card; es imprescindible revisarlo antes de cualquier uso comercial, ya que las condiciones de explotacion no se detallan en la informacion disponible.
- Es un espejo no oficial: el repositorio analizado lo publica la cuenta `ml-resources`, que declara explicitamente no ser un lanzamiento oficial de los autores. Para uso en produccion conviene referenciar el repositorio original `facebook/sapiens2-pointmap-5b`.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion comunitaria y de informes de terceros sobre su comportamiento real.
- Salida en marco de camara: la prediccion se expresa en coordenadas de la camara, por lo que la interpretacion metrica de los resultados depende de la geometria de captura. La model card no documenta como se tratan los parametros intrinsecos ni la escala absoluta, dato critico si se necesita medida real.
- Riesgo de alucinacion geometrica: en oclusiones, extremidades fuera de encuadre o ropa muy holgada, un modelo de regresion densa puede producir geometria plausible pero incorrecta sin ninguna senal de incertidumbre asociada.
- Requisitos de memoria altos: 21.4 GB de repositorio y ~10.7 GB de pesos en FP16 sin contar activaciones limitan su despliegue en hardware modesto, y no se ofrecen versiones cuantizadas oficiales.
- Sin soporte de lenguaje ni de tool calling: no puede integrarse en flujos de agentes conversacionales ni en pipelines que esperen texto; su salida es exclusivamente densa y visual.
- Sesgos: no se documenta ninguna evaluacion de sesgo por tono de piel, tipo de cuerpo, genero, edad ni contextos culturales, a pesar de tratarse de un modelo entrenado sobre imagenes de personas, donde estos sesgos tienen impacto directo en la calidad de la reconstruccion.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/ml-resources/sapiens2-pointmap-5b
- Repositorio oficial del checkpoint: https://huggingface.co/facebook/sapiens2-pointmap-5b
- Backbone preentrenado base: https://huggingface.co/facebook/sapiens2-pretrain-5b
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo: https://github.com/facebookresearch/sapiens2
- Guia de estimacion de pointmap: https://github.com/facebookresearch/sapiens2/blob/main/docs/POINTMAP.md
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Coleccion Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Variante 0.4B: https://huggingface.co/facebook/sapiens2-pointmap-0.4b
- Variante 0.8B: https://huggingface.co/facebook/sapiens2-pointmap-0.8b
- Variante 1B: https://huggingface.co/facebook/sapiens2-pointmap-1b
