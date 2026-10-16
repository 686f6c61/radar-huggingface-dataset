# ml-resources/sapiens2

## Resumen

Sapiens2 es una familia de transformers de visión de alta resolución desarrollada por Meta (FAIR) y orientada a tareas centradas en el ser humano. A diferencia de los modelos de lenguaje, no genera texto: procesa imágenes para estimar pose, segmentar partes del cuerpo, predecir normales de superficie, estimar mapas de puntos (pointmaps) 3D y realizar matting (recorte fino) de personas. Según la model card, los backbones se preentrenaron sobre 1.000 millones de imágenes de personas, lo que la convierte en una de las mayores bases de preentrenamiento específicamente humanas publicadas hasta la fecha.

La familia cubre un rango de tamaños que va de 0,114 B a 5,071 B de parámetros, con seis backbones preentrenados (0.1B, 0.4B, 0.8B, 1B, 1B-4K y 5B) y checkpoints específicos por tarea derivados de varios de esos backbones. Esta escalera de tamaños permite desplegar desde variantes ligeras para tiempo real en GPU de consumo hasta la variante de 5B para máxima calidad en servidores. La existencia de una variante 1B (4K) apunta a un backbone adaptado a resolución muy alta, un factor crítico en tareas humanas donde detalles como manos, pelo o ropa se pierden a baja resolución.

El repositorio `ml-resources/sapiens2` es un espejo no oficial del repositorio `facebook/sapiens2`, que actúa como índice: cada variante y cada checkpoint de tarea vive en su propio repositorio de HuggingFace. La relevancia actual del modelo radica en que unifica bajo una misma arquitectura y un mismo preentrenamiento cinco tareas humanas que tradicionalmente requerían modelos especializados distintos, lo que simplifica pipelines de captura de movimiento, avatares digitales, realidad aumentada y análisis deportivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) de alta resolucion; no es un modelo de lenguaje |
| Parametros totales | 0,114 B / 0,398 B / 0,818 B / 1,462 B / 1,607 B (1B-4K) / 5,071 B segun variante |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el factor equivalente es la resolucion de entrada (la variante 1B-4K sugiere soporte de 4K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | Sapiens2 License (identificador `other`, nombre `sapiens2-license`) |
| Formato de pesos | no disponible (libreria declarada: `sapiens`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión (ViT) de alta resolución. La informacion proporcionada no detalla el numero de capas, dimensiones de embedding, tipo de atencion ni el esquema de parcheo, por lo que esos datos concretos no estan disponibles. Lo que si se especifica es el preentrenamiento sobre 1.000 millones de imagenes humanas, una escala de datos muy superior a la habitual en backbones de vision generalistas, y claramente orientada a capturar la variabilidad de forma, ropa, iluminacion y punto de vista del cuerpo humano.

Sobre ese backbone preentrenado se derivan checkpoints de tarea mediante ajuste fino supervisado: estimacion de pose (0.4B, 0.8B, 1B, 5B), segmentacion de partes del cuerpo (0.4B, 0.8B, 1B, 5B), normales de superficie (0.4B, 0.8B, 1B, 5B), estimacion de pointmaps (0.4B, 0.8B, 1B, 5B) y matting humano (solo 1B). No se indica en la informacion disponible si hubo tecnicas de alineacion tipo RLHF/DPO (no aplicables en sentido estricto a vision) ni si se empleo decodificacion especulativa u otras optimizaciones de inferencia. Tampoco se confirma la composicion exacta del dataset ni el numero total de tokens o imagenes vistas durante el ajuste por tarea.

## Capacidades

- Estimacion de pose humana: prediccion de puntos clave corporales a partir de imagenes de alta resolucion.
- Segmentacion de partes del cuerpo: separacion semantica de regiones como torso, brazos, piernas, cabeza o ropa.
- Estimacion de normales de superficie: recuperacion de la orientacion local de la superficie del cuerpo, util para reconstruccion 3D y renderizado.
- Estimacion de pointmaps: generacion de mapas de puntos 3D por pixel, orientados a reconstruccion de geometria humana.
- Matting humano: extraccion de canal alfa fino para recorte de personas, incluyendo pelo y siluetas complejas (variante 1B).
- Backbones preentrenados reutilizables: los seis checkpoints de preentrenamiento sirven como base para ajuste fino en tareas humanas adicionales.
- Escalado por tamano: seis tamanos distintos permiten ajustar el compromiso entre precision y coste computacional.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo linguistico.
- Capacidades multilingues no aplicables.
- No se documentan capacidades de vision-lenguaje (VLM); es exclusivamente vision.

## Casos de uso

- Captura de movimiento sin marcadores: usar `sapiens2-pose-*` sobre video monoculo para extraer esqueletos articulares por fotograma, util en animacion, videojuegos y analisis biomecanico.
- Avatarizacion y prueba virtual de ropa: combinar segmentacion de partes del cuerpo y matting para aislar al usuario con precision de pelo y bordes, y transferirlo a un fondo o prenda virtual.
- Reconstruccion 3D de personas: emplear los checkpoints de normales y de pointmaps para generar geometria de superficie a partir de una o varias vistas, orientado a gemelos digitales y VFX.
- Edicion fotografica profesional: el matting humano de la variante 1B permite recortes de alta calidad sin intervencion manual, agilizando flujos de retoque en produccion grafica.
- Analisis deportivo: estimacion de pose de alta resolucion para medir angulos articulares, postura y simetria en atletas a partir de video de partidos o entrenamientos.
- Realidad aumentada y filtros en tiempo real: desplegar las variantes 0.1B o 0.4B en dispositivos con GPU limitada para segmentar y superponer efectos sobre la persona.
- Generacion de datos sinteticos anotados: usar los checkpoints como anotadores automaticos para etiquetar grandes volumenes de imagenes antes de entrenar otros modelos.
- Preentrenamiento de tareas humanas a medida: partir de los backbones `sapiens2-pretrain-*` y ajustar fino para tareas nuevas (por ejemplo, deteccion de equipamiento de proteccion o ergonomia industrial).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio indice no incluye tablas de metricas (AP de pose, mIoU de segmentacion, error angular de normales, etc.) ni comparaciones numericas con otros modelos. Para datos cuantitativos habria que consultar el articulo arXiv:2604.21681 y la pagina del proyecto, enlazados mas abajo.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros del backbone (el consumo real es mayor en ViT de alta resolucion porque la atencion escala con el numero de parches de la imagen):
  - Sapiens2-0.1B: aproximadamente 0,5 GB en FP32 y 0,25 GB en FP16 solo para pesos.
  - Sapiens2-0.4B: aproximadamente 1,6 GB en FP32 y 0,8 GB en FP16.
  - Sapiens2-0.8B: aproximadamente 3,3 GB en FP32 y 1,6 GB en FP16.
  - Sapiens2-1B: aproximadamente 5,8 GB en FP32 y 2,9 GB en FP16.
  - Sapiens2-1B (4K): aproximadamente 6,4 GB en FP32 y 3,2 GB en FP16; la resolucion 4K dispara la memoria de activaciones.
  - Sapiens2-5B: aproximadamente 20 GB en FP32 y 10 GB en FP16.
- GPU recomendadas: RTX 4090, A100, H100 o similares para el 5B; para las variantes 0.1B-1B basta una GPU de consumo con suficiente VRAM.
- Cabe en GPU de consumo: si, las variantes de 0.1B a 0.8B con holgura; la 1B en GPU de 8 GB o mas; la 5B requiere GPU de 24 GB o mas en FP16, o varias GPU.
- Opciones de despliegue: la model card declara la libreria `sapiens` y el codigo oficial en GitHub, de modo que la via prevista es PyTorch. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no son aplicables a este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con rigor dentro de la propia familia Sapiens2. No se aportan datos de modelos externos, por lo que las celdas correspondientes a alternativas se marcan como no disponibles.

| Modelo | Parametros | Tareas | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sapiens2-0.4B | 0,398 B | Pose, segmentacion, normales, pointmaps | no disponible (menor que 1B-4K) | Sapiens2 License | HuggingFace (facebook) |
| Sapiens2-1B | 1,462 B | Pose, segmentacion, normales, pointmaps, matting | no disponible | Sapiens2 License | HuggingFace (facebook) |
| Sapiens2-1B (4K) | 1,607 B | Backbone preentrenado | Alta (4K, inferido del nombre) | Sapiens2 License | HuggingFace (facebook) |
| Sapiens2-5B | 5,071 B | Pose, segmentacion, normales, pointmaps | no disponible | Sapiens2 License | HuggingFace (facebook) |
| Alternativas externas (por ejemplo, backbones ViT de vision o estimadores de pose especializados) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes y no debe evaluarse con benchmarks tipo MMLU o GSM8K.
- El repositorio `ml-resources/sapiens2` es un espejo no oficial del repositorio de Meta; no es una publicacion de los autores originales y podria no recibir actualizaciones.
- Al estar preentrenado exclusivamente sobre imagenes de personas, su comportamiento fuera del dominio humano no esta documentado y previsiblemente sera pobre.
- Riesgo de sesgo: el preentrenamiento sobre 1.000 millones de imagenes humanas hereda los sesgos de representacion del corpus (distribucion demografica, tipo de cuerpo, vestimenta, contexto cultural), que pueden traducirse en peor precision en grupos infrarrepresentados.
- Riesgo de error en casos dificiles: oclusiones severas, multitudes, iluminacion extrema o personas parcialmente fuera de plano suelen degradar la estimacion de pose, normales y pointmaps.
- La licencia es `Sapiens2 License` (identificador `other`), no una licencia de codigo abierto estandar; hay que revisar `LICENSE.md` antes de cualquier uso comercial, redistribucion o despliegue en producto.
- No se especifican tipos de cuantizacion soportados ni formatos de pesos alternativos, lo que limita las opciones de optimizacion en produccion hasta que se documenten.
- No hay resultados de benchmarks publicados en la informacion disponible, por lo que cualquier afirmacion de superioridad frente a alternativas carece de respaldo numerico aqui.
- El consumo de memoria crece rapidamente con la resolucion de entrada; desplegar la variante 4K o el modelo de 5B en produccion exige planificacion cuidadosa de VRAM.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/ml-resources/sapiens2
- Repositorio oficial en HuggingFace: https://huggingface.co/facebook/sapiens2
- Articulo (arXiv): https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo oficial en GitHub: https://github.com/facebookresearch/sapiens2
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Coleccion Sapiens2 en HuggingFace: https://huggingface.co/collections/facebook/sapiens2
- Backbones preentrenados: https://huggingface.co/facebook/sapiens2-pretrain-0.1b , https://huggingface.co/facebook/sapiens2-pretrain-0.4b , https://huggingface.co/facebook/sapiens2-pretrain-0.8b , https://huggingface.co/facebook/sapiens2-pretrain-1b , https://huggingface.co/facebook/sapiens2-pretrain-1b-4k , https://huggingface.co/facebook/sapiens2-pretrain-5b
- Checkpoints de pose: https://huggingface.co/facebook/sapiens2-pose-0.4b , https://huggingface.co/facebook/sapiens2-pose-0.8b , https://huggingface.co/facebook/sapiens2-pose-1b , https://huggingface.co/facebook/sapiens2-pose-5b
- Checkpoints de segmentacion: https://huggingface.co/facebook/sapiens2-seg-0.4b , https://huggingface.co/facebook/sapiens2-seg-0.8b , https://huggingface.co/facebook/sapiens2-seg-1b , https://huggingface.co/facebook/sapiens2-seg-5b
- Checkpoints de normales: https://huggingface.co/facebook/sapiens2-normal-0.4b , https://huggingface.co/facebook/sapiens2-normal-0.8b , https://huggingface.co/facebook/sapiens2-normal-1b , https://huggingface.co/facebook/sapiens2-normal-5b
- Checkpoints de pointmaps: https://huggingface.co/facebook/sapiens2-pointmap-0.4b , https://huggingface.co/facebook/sapiens2-pointmap-0.8b , https://huggingface.co/facebook/sapiens2-pointmap-1b , https://huggingface.co/facebook/sapiens2-pointmap-5b
- Checkpoint de matting: https://huggingface.co/facebook/sapiens2-matting-1b
