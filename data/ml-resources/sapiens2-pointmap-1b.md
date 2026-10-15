# ml-resources/sapiens2-pointmap-1b

## Resumen

Sapiens2-1B-Pointmap es un modelo de visión por computador desarrollado por Meta que estima, para cada píxel de una imagen, sus coordenadas 3D (x, y, z) en el sistema de referencia de la cámara. Se trata de un checkpoint especializado en la tarea de *pointmap estimation*, obtenido por *fine-tuning* del backbone preentrenado Sapiens2-1B, y está pensado específicamente para imágenes centradas en el cuerpo humano (*human-centric*). La ficha que se analiza aquí es un espejo no oficial publicado por el usuario `ml-resources` en HuggingFace; el repositorio original es `facebook/sapiens2-pointmap-1b` y la licencia se mantiene sin cambios.

Arquitectónicamente es un Vision Transformer (ViT) de 40 capas, dimensión de embedding 1536, 24 cabezas de atención y parche de 16×16, al que se añade una cabeza de regresión de pointmap. El backbone suma 1.462 millones de parámetros y 4.715 TFLOPs por inferencia a una resolución de 1024×768 (alto × ancho); el checkpoint completo en safetensors contiene 1.629.594.164 parámetros, lo que sitúa la cabeza de estimación en torno a 167 millones de parámetros adicionales. El repositorio ocupa 6,5 GB.

Su relevancia actual radica en que la reconstrucción densa de geometría 3D a partir de una sola imagen es un componente clave para captura de movimiento sin marcadores, avatares digitales, realidad aumentada y robótica. Al ser un modelo exclusivamente visual, no genera texto ni admite instrucciones en lenguaje natural: su salida es un mapa denso de coordenadas por píxel. La licencia Sapiens2 es una licencia personalizada de Meta, no una licencia de código abierto estándar, por lo que su uso comercial requiere revisión previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Sapiens2 ViT backbone) + cabeza de estimacion de pointmap |
| Parametros totales | 1.629.594.164 (1,63 B); backbone 1.462 B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen a 1024 x 768 H x W) |
| Tipos de cuantizacion | no disponible (solo se publica safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Sapiens2 License (identificador `other`, `license_name: sapiens2-license`) |
| Formato de pesos | safetensors (`sapiens2_1b_pointmap.safetensors`) |
| Dimension de embedding | 1536 |
| Capas | 40 |
| Cabezas de atencion | 24 |
| Tamano de parche | 16 |
| FLOPs del backbone | 4.715 T |
| Resolucion de inferencia | 1024 x 768 (H x W) |
| Tamano del repositorio | 6,5 GB |
| Modelo base | facebook/sapiens2-pretrain-1b |

## Arquitectura y entrenamiento

El modelo emplea un backbone Vision Transformer tipo Sapiens2 con 40 bloques, dimensión de embedding de 1536 y 24 cabezas de atención, que procesa la imagen dividida en parches de 16×16 píxeles. Sobre ese backbone se sitúa una cabeza de estimación de pointmap que regresa tres valores continuos (x, y, z) por píxel en el marco de la cámara, dando como resultado un mapa denso de geometría 3D a resolución completa. El checkpoint se ha obtenido por *fine-tuning* supervisado del backbone preentrenado `facebook/sapiens2-pretrain-1b`, no se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación por preferencias, algo esperable al no tratarse de un modelo generativo de lenguaje.

La información proporcionada no detalla el volumen de tokens de imagen, la composición exacta del dataset de *fine-tuning*, ni si se emplearon datos sintéticos o de captura multi-cámara para generar las anotaciones de pointmap. Tampoco se describen innovaciones técnicas internas más allá de la arquitectura ViT estándar con parche 16 y de la propia familia Sapiens2, que incluye variantes de 0.4B, 0.8B, 1B, 1B-4K y 5B parámetros con configuraciones de embedding y profundidad crecientes (por ejemplo, el 5B usa embedding 2432, 56 capas y 32 cabezas). Todos estos datos de entrenamiento figuran como no disponibles en la model card analizada.

## Capacidades

- Estimacion densa de pointmap: predice coordenadas 3D (x, y, z) por píxel en el sistema de referencia de la cámara a partir de una única imagen RGB.
- Procesamiento de imagenes centradas en el cuerpo humano, que es el dominio declarado de uso previsto.
- Inferencia a resolucion 1024 x 768 con parche de 16, lo que produce una rejilla densa de predicciones geometricas.
- Extraccion de caracteristicas visuales mediante el backbone Sapiens2-1B, reutilizable potencialmente para otras tareas densas de la familia (profundidad, normales, segmentacion), aunque este checkpoint concreto solo se distribuye para pointmap.
- No soporta generacion de texto, tool calling ni function calling: es un modelo puramente visual sin decoder de lenguaje.
- No soporta agentes, razonamiento multi-paso, modo *thinking*, audio ni entrada multimodal de texto.
- Capacidades multilingues: no aplicables ni documentadas.

## Casos de uso

- Captura de movimiento sin marcadores: a partir de un vídeo o secuencia de imágenes de una persona, el pointmap por píxel permite reconstruir la superficie corporal en 3D y derivar posiciones articulares, útil en animación y análisis deportivo.
- Creacion de avatares digitales: la geometría densa obtenida de una o pocas vistas sirve como base para generar mallas de cuerpo completo en flujos de *rigging* y *retargeting*.
- Probador virtual y comercio de moda: estimar la geometria del cuerpo en 3D a partir de una foto permite simular el ajuste de prendas sin necesidad de escaneo dedicado.
- Realidad aumentada y realidad virtual: colocar objetos virtuales de forma coherente con la geometria real del usuario requiere una estimacion de profundidad y superficie por píxel como la que ofrece este modelo.
- Robotica humanoide y cobots: la percepcion de la geometria del operador humano en el marco de la camara facilita la planificacion de interacciones seguras y la anticipacion de movimientos.
- Analisis clinico y biomecanico: la reconstruccion geometrica del cuerpo permite medir posturas y rangos de movimiento de forma cuantitativa a partir de imagenes 2D, sin instrumental especializado.
- Reconstruccion de escenas y fotogrametria asistida: el pointmap puede inicializar o completar reconstrucciones multi-vista, reduciendo el numero de imagenes necesarias para obtener una nube de puntos utilizable.
- Investigacion en vision centrada en el humano: servir como *baseline* o extractor de caracteristicas geometricas en estudios academicos sobre cuerpo, pose y forma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos: en FP32 el checkpoint de 1,63 B parametros ocupa aproximadamente 6,5 GB, coherente con el tamano del repositorio; en bf16/fp16 seria del orden de 3,3 GB. Estos valores son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- VRAM estimada para inferencia completa: con activaciones a 1024 x 768 y patch 16, la rejilla resultante es de 64 x 48 = 3072 tokens por imagen, por lo que conviene reservar margen adicional sobre el peso de los parametros; una GPU de 16 GB deberia ser suficiente en precision reducida y una de 24 GB en FP32.
- GPU recomendadas: para uso individual, RTX 3090, RTX 4090 o A5000 (24 GB) cubren el modelo sin cuantizar; para lotes grandes o entrenamiento de cabezas, A100 40/80 GB o H100.
- GPU de consumo: si, cabe en tarjetas consumer de gama alta con 12-16 GB o mas en bf16, siempre que el runtime de Sapiens2 lo permita; en GPUs con menos de 8 GB no se documenta soporte.
- Opciones de despliegue: el flujo oficial es instalar el repositorio Sapiens2 (`pip install -e .`) y ejecutar el script `sapiens/dense/scripts/demo/pointmap.sh`; no se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Como referencia de coste computacional, el backbone consume 4.715 TFLOPs por inferencia a 1024 x 768, lo que permite dimensionar el hardware necesario pero no equivale a una medicion de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | FLOPs | Embed dim | Capas | Cabezas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Sapiens2-0.4B (pointmap) | 0,398 B | 1,260 T | 1024 | 24 | 16 | Sapiens2 License | HuggingFace (facebook) |
| Sapiens2-0.8B (pointmap) | 0,818 B | 2,592 T | 1280 | 32 | 16 | Sapiens2 License | HuggingFace (facebook) |
| Sapiens2-1B (pointmap, este) | 1,462 B backbone / 1,63 B total | 4,715 T | 1536 | 40 | 24 | Sapiens2 License | HuggingFace (mirror `ml-resources`) |
| Sapiens2-1B-4K | 1,607 B | no disponible | 1536 | 40 | 24 | Sapiens2 License | HuggingFace (facebook) |
| Sapiens2-5B (pointmap) | 5,071 B | 15,722 T | 2432 | 56 | 32 | Sapiens2 License | HuggingFace (facebook) |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo entre estas variantes, ni de alternativas externas de la misma categoria (por ejemplo, modelos de estimacion de profundidad monocular o de pointmap de otros autores), por lo que no se puede establecer una comparacion cuantitativa. La comparacion anterior se limita a parametros, coste computacional y configuracion arquitectonica dentro de la propia familia Sapiens2.

## Limitaciones y advertencias

- Dominio restringido: el uso previsto es imagenes centradas en el cuerpo humano; su comportamiento en escenas generales, interiores o exteriores sin personas no esta validado ni documentado.
- Ausencia de datos de evaluacion: no se publican metricas de error (por ejemplo, error de profundidad o de reconstruccion) en la informacion disponible, lo que impide estimar su precision real antes de desplegarlo.
- Riesgo de predicciones geometricas incorrectas: al ser un modelo de regresion densa, puede producir geometria plausible pero incorrecta en oclusiones, superficies reflectantes, iluminacion extrema o poses no vistas, sin ninguna senal de incertidumbre calibrada documentada.
- Sin capacidades de lenguaje: no acepta instrucciones en lenguaje natural, no genera texto y no soporta tool calling, agentes ni razonamiento multi-paso; cualquier flujo conversacional debe construirse con un modelo aparte.
- Idioma: no aplica, pero conviene recordar que no procesa texto ni audio bajo ninguna circunstancia.
- Licencia: la Sapiens2 License es una licencia personalizada de Meta, no una licencia de codigo abierto estandar; antes de cualquier uso comercial es obligatorio revisar el texto completo en `github.com/facebookresearch/sapiens2/blob/main/LICENSE.md` para verificar condiciones, restricciones de atribucion y posibles limitaciones de uso.
- Es un espejo no oficial: el repositorio `ml-resources/sapiens2-pointmap-1b` no es una publicacion de los autores originales y presenta 0 descargas y 0 me gusta; para produccion conviene usar el repositorio oficial `facebook/sapiens2-pointmap-1b`.
- Formatos de cuantizacion: no se ofrecen variantes GGUF, AWQ o GPTQ, lo que limita el despliegue en hardware de bajos recursos y en runtimes de inferencia habituales en el ecosistema de modelos de lenguaje.
- Capacidad de contexto y ventana: no aplica; la resolucion de entrada documentada es fija a 1024 x 768, y se desconoce el comportamiento con otras resoluciones o relaciones de aspecto.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/ml-resources/sapiens2-pointmap-1b
- Repositorio original: https://huggingface.co/facebook/sapiens2-pointmap-1b
- Modelo base: https://huggingface.co/facebook/sapiens2-pretrain-1b
- Coleccion Sapiens2 en HuggingFace: https://huggingface.co/collections/facebook/sapiens2
- Variante 0.4B: https://huggingface.co/facebook/sapiens2-pointmap-0.4b
- Variante 0.8B: https://huggingface.co/facebook/sapiens2-pointmap-0.8b
- Variante 1B-4K: https://huggingface.co/facebook/sapiens2-pretrain-1b-4k
- Variante 5B: https://huggingface.co/facebook/sapiens2-pointmap-5b
- Paper (arXiv): https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo fuente: https://github.com/facebookresearch/sapiens2
- Guia de estimacion de pointmap: https://github.com/facebookresearch/sapiens2/blob/main/docs/POINTMAP.md
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
