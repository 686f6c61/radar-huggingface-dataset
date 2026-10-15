# ml-resources/sapiens2-normal-0.4b

## Resumen

Sapiens2-normal-0.4b es un modelo de visión por computador especializado en la estimación de normales de superficie (surface normals) por píxel sobre imágenes centradas en personas. Lo desarrolla Meta dentro de la familia Sapiens2 y el repositorio analizado es un espejo no oficial alojado por el usuario ml-resources, que replica el checkpoint original facebook/sapiens2-normal-0.4b sin modificar la licencia. El modelo no es un modelo de lenguaje: es un Vision Transformer (ViT) con una cabeza de regresión que devuelve, para cada píxel, un vector unitario de tres canales expresado en el sistema de coordenadas de la cámara.

El checkpoint se ha afinado a partir del backbone preentrenado Sapiens2-0.4B, con 0,398 B de parámetros en el backbone y 453.357.747 parámetros totales según los pesos en safetensors. Trabaja a una resolución de inferencia de 1024 x 768 píxeles con parches de 16 px, lo que supone 3.072 tokens de imagen por muestra, y consume 1,260 TFLOPs por inferencia en el backbone. Su relevancia actual está en el ecosistema de visión centrada en humanos: la geometría de superficie precisa es un prerrequisito para reconstrucción 3D, relighting, avatares digitales y efectos visuales sobre cuerpos y rostros.

Al tratarse de una tarea densa de predicción por píxel, el modelo se integra como componente en pipelines de visión más amplios (junto con segmentación, matting o estimación de profundidad de la misma familia) y no como sistema autónomo. La información disponible no detalla el dataset de entrenamiento, el número de tokens ni los idiomas, y no se han publicado resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT backbone + cabeza de estimacion de normales de superficie |
| Parametros totales | 453.357.747 (0,453 B); backbone 0,398 B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Entrada de imagen de 1024 x 768 px con parche de 16 px (3.072 tokens) |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en safetensors en precision completa |
| Idiomas soportados | no disponible; modelo de vision sin capacidades linguisticas |
| Licencia | Sapiens2 License (license: other) |
| Formato de pesos | safetensors (fichero sapiens2_0.4b_normal.safetensors) |
| Tarea | estimacion de normales de superficie por pixel (3 canales, vector unitario en sistema de camara) |
| Pipeline declarado | depth-estimation |
| Modelo base | facebook/sapiens2-pretrain-0.4b (finetune) |
| Dimension de embedding | 1024 |
| Capas | 24 |
| Cabezas de atencion | 16 |
| FLOPs del backbone | 1,260 T |
| Resolucion de inferencia | 1024 x 768 (alto x ancho) |
| Tamano de parche | 16 |
| Tamano del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer puro con normalizacion y atencion estandar sobre tokens de imagen: 24 capas, dimension de embedding 1024 y 16 cabezas de atencion, sobre una malla de parches de 16 x 16 px. La entrada se procesa a 1024 x 768, lo que da 3.072 tokens por imagen. Sobre el backbone se anade una cabeza de estimacion densa que produce, por píxel, un vector normal de tres componentes en el marco de la camara. El coste computacional declarado del backbone es de 1,260 TFLOPs por pasada.

El punto de partida es el backbone preentrenado Sapiens2-0.4B; este checkpoint concreto corresponde a un ajuste fino supervisado para la tarea de normales. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO (habituales en modelos de lenguaje pero no aplicables de forma directa aqui). Tampoco se documentan innovaciones de decodificacion o mecanismos de atencion alternativos. La innovacion del trabajo reside en el preentrenamiento a alta resolucion sobre imagenes centradas en humanos y en la reutilizacion del mismo backbone para varias tareas densas (normales, profundidad, segmentacion u otras variantes de la coleccion Sapiens2).

## Capacidades

- Estimacion densa de normales de superficie por píxel sobre imagenes centradas en personas, devolviendo vectores unitarios de 3 canales en el sistema de coordenadas de la camara.
- Procesamiento a alta resolucion (1024 x 768) gracias al backbone ViT con parches de 16 px.
- Transferencia desde un backbone preentrenado en dominio humano, lo que favorece la calidad geometrica en cuerpos, ropa y rostros frente a modelos genericos.
- Uso como componente intermedio en pipelines de vision: la salida de normales es consumible por etapas posteriores de reconstruccion, relighting o renderizado.
- Soporte de tool calling / function calling: no aplica (modelo de vision, sin interfaz de texto ni llamadas a herramientas).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no se documenta modo de pensamiento, audio ni procesamiento de video; la informacion disponible solo cubre imagenes estaticas.

## Casos de uso

- Reconstruccion 3D de personas: las normales por píxel alimentan etapas de fotometria estereoscopica o de refinamiento de malla para obtener geometria de superficie detallada a partir de una o varias imagenes. El modelo es adecuado por su resolucion de trabajo y su especializacion en dominio humano.
- Relighting y edicion de iluminacion: con un mapa de normales fiable se puede reestimar la iluminacion de una escena y recolocar fuentes de luz sin volver a capturar, algo util en postproduccion fotografica y de video.
- Avatares digitales y telepresencia: generar el campo de normales de un usuario permite transferir su geometria facial o corporal a un avatar y renderizarlo con materiales e iluminacion coherentes.
- Efectos visuales y animacion: las normales sirven para detallar shading, integrar elementos digitales sobre metraje real y corregir la iluminacion en planos con personas.
- Preprocesado para otras tareas centradas en humanos: la salida de geometria mejora el rendimiento de segmentacion de partes del cuerpo, matting o transferencia de ropa en pipelines que encadenan varios modelos de la familia Sapiens2.
- Control de calidad en generacion de contenido sintetico: comparar las normales predichas sobre imagenes generadas con las de la fuente real permite detectar inconsistencias geometricas antes de publicar el contenido.
- Investigacion en vision centrada en humanos: sirve como baseline reproducible de 0,4 B para estudiar el efecto del preentrenamiento especifico de dominio frente a backbones genericos en tareas geometricas.
- Prototipado de bajo coste: con menos de 0,5 B de parametros, se puede desplegar en una GPU de consumo y encadenar iteraciones de experimentacion sin acceso a clústeres grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda proporcionados no incluyen metricas cuantitativas (error angular medio, tasas de error por umbral, comparaciones con otros estimadores de normales).

## Requisitos de hardware

- VRAM para los pesos (estimacion a partir de 453.357.747 parametros): aproximadamente 1,8 GB en fp32, unos 0,9 GB en fp16/bf16 y en torno a 0,45 GB en int8. Estas cifras son calculos derivados del numero de parametros, no datos publicados.
- Memoria de activaciones: a 1024 x 768 con parches de 16 px se procesan 3.072 tokens por imagen, lo que anade un consumo moderado de activaciones en funcion del tamano de lote. No se documenta el pico exacto.
- GPU de consumo: el modelo cabe con holgura en tarjetas con 8 GB o mas, como RTX 3060, RTX 4060 Ti o RTX 4070. Con 12 GB o mas (RTX 3060 12 GB, RTX 4080, RTX 4090) se puede aumentar el tamano de lote sin problema.
- GPU de centro de datos: A100, H100 o L40S son adecuadas para inferencia por lotes y para procesar conjuntos grandes de imagenes.
- Opciones de despliegue: la via documentada es el repositorio Sapiens2 (instalacion con pip install -e .) y sus scripts de demo en sapiens/dense/scripts/demo/normal.sh, sobre PyTorch. No se documentan integraciones con vLLM, Ollama o TGI (orientadas a modelos de lenguaje) ni exportaciones a ONNX o TensorRT.
- Latencia y throughput: no disponibles. Solo se conoce el coste por inferencia del backbone, 1,260 TFLOPs.

## Comparativa con modelos similares

Comparativa dentro de la propia familia Sapiens2-Surface, que comparte tarea, licencia y formato de pesos:

| Modelo | Parametros | FLOPs | Dim. embedding | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B (este) | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-5B | 5,071 B | 15,722 T | 2432 | 56 | 32 |

La variante de 0,4 B es la mas ligera de la familia: frente a la de 1 B, usa aproximadamente un 27 % de los parametros y un 27 % de los FLOPs, a cambio de una dimension de embedding y un numero de capas menores. Frente a la de 5 B, supone alrededor del 8 % de los parametros y de los FLOPs, lo que la situa como opcion de prototipado o de despliegue con recursos limitados, no como la variante de maxima calidad. No se dispone de datos de benchmarks publicados que permitan comparar la precision de estas variantes entre si ni con alternativas externas de estimacion de normales.

## Limitaciones y advertencias

- Es un modelo de vision densa: no genera texto, no mantiene conversaciones, no soporta tool calling ni razonamiento multi-paso. Cualquier uso en ese sentido es un error de categoria.
- El dominio declarado es la imagen centrada en humanos. El rendimiento fuera de ese dominio (paisajes, interiores, objetos) no esta documentado y previsiblemente sera inferior.
- Riesgo de predicciones inconsistentes en oclusiones, ropa con pliegues complejos, materiales reflectantes o translucidos y condiciones de iluminacion extremas; no se documentan tasas de error para cuantificarlo.
- La salida son vectores unitarios en el sistema de la camara, por lo que la utilidad de las normales depende de la calibracion y del preprocesado de la imagen de entrada.
- No se documentan idiomas ni capacidades multilingues porque no aplica; no hay componente linguistico.
- Licencia: el modelo se distribuye bajo la Sapiens2 License, una licencia personalizada de tipo "other". Las clausulas concretas no se reproducen en la informacion disponible, por lo que no se puede confirmar desde aqui si se permite el uso comercial; hay que consultar el fichero LICENSE.md del repositorio oficial antes de integrarlo en produccion.
- Este repositorio es un espejo no oficial con 0 descargas y 0 likes. Para uso en produccion conviene referenciar y descargar el checkpoint oficial facebook/sapiens2-normal-0.4b, que es la fuente mantenida por los autores.
- El pipeline declarado en HuggingFace es depth-estimation, herencia de la categoria de la familia, aunque la tarea real del checkpoint es estimacion de normales de superficie. Conviene no guiarse por ese campo al integrarlo.
- No se documentan cuantizaciones oficiales. Cualquier conversion a int8, int4 o formatos como GGUF es responsabilidad del integrador y puede degradar la precision angular de las normales.
- Alucinacion en sentido generativo: aunque el modelo no produce texto, sus salidas son predicciones densas que pueden ser plausibles y a la vez geometricamente incorrectas, sin ninguna senal de confianza asociada por pixel.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/ml-resources/sapiens2-normal-0.4b
- Checkpoint oficial: https://huggingface.co/facebook/sapiens2-normal-0.4b
- Modelo base preentrenado: https://huggingface.co/facebook/sapiens2-pretrain-0.4b
- Variante 0.8B: https://huggingface.co/facebook/sapiens2-normal-0.8b
- Variante 1B: https://huggingface.co/facebook/sapiens2-normal-1b
- Variante 5B: https://huggingface.co/facebook/sapiens2-normal-5b
- Coleccion Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Articulo (arXiv): https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo fuente: https://github.com/facebookresearch/sapiens2
- Guia de estimacion de normales: https://github.com/facebookresearch/sapiens2/blob/main/docs/NORMAL.md
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
