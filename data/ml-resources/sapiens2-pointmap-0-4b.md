# ml-resources/sapiens2-pointmap-0.4b

## Resumen

Sapiens2-0.4B-Pointmap es un modelo de vision por computador desarrollado por Meta que estima, para cada pixel de una imagen, sus coordenadas 3D (x, y, z) en el sistema de referencia de la camara. Se trata de un checkpoint de la familia Sapiens2 especializado en la tarea de *pointmap*, obtenido por fine-tuning a partir del backbone preentrenado facebook/sapiens2-pretrain-0.4b. La arquitectura es un Vision Transformer con 24 capas, dimension de embedding 1024, 16 cabezas de atencion y patch size de 16, que procesa imagenes a una resolucion de inferencia de 1024 x 768 (H x W). El backbone tiene 0,398 B de parametros, mientras que el checkpoint completo con la cabeza de estimacion pesa 528.675.380 parametros (~0,53 B).

La relevancia de este modelo reside en su enfoque *human-centric*: esta disenado y ajustado para imagenes de personas, lo que lo hace util en reconstruccion 3D, captura de movimiento, realidad aumentada o analisis biomecanico a partir de una sola vista. Forma parte de una familia escalable que incluye variantes de 0.8B, 1B y 5B con el mismo esquema.

Este repositorio concreto es un espejo (*mirror*) publicado por el usuario ml-resources de la version oficial facebook/sapiens2-pointmap-0.4b; no es un lanzamiento oficial de Meta y mantiene la licencia original Sapiens2 License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (backbone Sapiens2 ViT + cabeza de estimacion de pointmap) |
| Parametros totales | 528.675.380 (~0,53 B); backbone 0,398 B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; resolucion de inferencia 1024 x 768 (H x W), patch size 16 |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de vision; no procesa texto) |
| Licencia | Sapiens2 License (etiquetada como "other") |
| Formato de pesos | safetensors (`sapiens2_0.4b_pointmap.safetensors`) |
| Dimension de embedding | 1024 |
| Numero de capas | 24 |
| Cabezas de atencion | 16 |
| FLOPs del backbone | 1,260 T |
| Tarea (pipeline) | depth-estimation / pointmap |

## Arquitectura y entrenamiento

El modelo sigue el esquema Sapiens2: un backbone Vision Transformer que tokeniza la imagen con patches de 16 x 16 sobre una resolucion de entrada de 1024 x 768, generando una secuencia de aproximadamente 3072 tokens (mas el token de clase). El backbone tiene 24 capas, dimension de embedding 1024 y 16 cabezas de atencion, con un coste de 1,260 T FLOPs. Sobre este backbone se anade una cabeza de estimacion que produce un pointmap denso: tres valores (x, y, z) por pixel en el sistema de coordenadas de la camara. El checkpoint se obtiene por fine-tuning del backbone preentrenado facebook/sapiens2-pretrain-0.4b (0,398 B).

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre el uso de tecnicas de alineacion como RLHF o DPO. La model card tampoco documenta innovaciones de decodificacion especulativa o mecanismos de atencion alternativos para esta variante concreta. El modelo se distribuye unicamente en pesos safetensors, con licencia Sapiens2.

## Capacidades

- Estimacion de pointmap denso: genera coordenadas 3D (x, y, z) por pixel en el marco de la camara a partir de una unica imagen.
- Procesamiento de imagenes *human-centric*: optimizado para escenas con personas, segun la seccion "Intended Use" de la model card.
- Vision por computador densa: la misma familia soporta otras tareas de prediccion densa (la coleccion Sapiens2 incluye checkpoints de tareas downstream adicionales).
- Inferencia a resolucion 1024 x 768, adecuada para detalle geometrico en cuerpos humanos.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades de lenguaje.
- No soporta tool calling, function calling ni comportamiento de agente.
- No dispone de capacidades multilingues ni de procesamiento de audio.
- No se documenta un "thinking mode" ni capacidades multimodales texto-imagen.

## Casos de uso

- Reconstruccion 3D de personas desde una sola imagen: el modelo devuelve un pointmap denso que puede convertirse en nube de puntos para reconstruir la geometria corporal o facial sin necesidad de multiples vistas.
- Captura de movimiento y animacion: a partir de fotogramas monoculares, el pointmap permite estimar la posicion 3D de la superficie corporal para *rigging* y animacion de personajes.
- Realidad aumentada y probadores virtuales: la geometria 3D por pixel posibilita alinear prendas o elementos virtuales sobre el cuerpo del usuario respetando la profundidad real.
- Analisis biomecanico y deporte: medicion de posturas y distancias en el espacio 3D a partir de video monoculo para evaluar tecnica o ergonomia.
- Generacion de datos sinteticos y anotacion automatica: usar el pointmap como pseudo-etiqueta 3D para preentrenar o aumentar otros modelos de vision.
- Efectos visuales y postproduccion: extraccion de informacion de profundidad y geometria para composicion, *relighting* o separacion de planos.
- Robotica y percepcion: estimacion de la geometria de personas en el entorno para interaccion segura o planificacion, alli donde la tarea sea *human-centric*.
- Investigacion en vision humana: experimentacion sobre representaciones 3D densas con un backbone ligero de 0,4 B, util como linea base reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los datos asociados no incluyen metricas cuantitativas (por ejemplo, error de profundidad, MPJPE ni comparaciones con otros metodos) para esta variante de pointmap. Tampoco se han encontrado resultados de benchmarks en los resultados de busqueda web, que no contienen informacion relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 2,1 GB en fp32 y en torno a 1,1 GB en fp16. Sumando activaciones a resolucion 1024 x 768 con 24 capas, una estimacion razonable es de 4 a 6 GB de VRAM para inferencia a un unico ejemplo; estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. Para mayor rendimiento, NVIDIA A100, H100 o RTX 4090. Una RTX 3090 o RTX 4080 tambien es suficiente.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo actuales (RTX 3060 12 GB en adelante) gracias a su tamano de 0,53 B de parametros.
- Opciones de despliegue: el flujo oficial es PyTorch mediante el repositorio Sapiens2 (`pip install -e .`) y los scripts de demo (`sapiens/dense/scripts/demo/pointmap.sh`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican cifras de latencia ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa dentro de la familia Sapiens2-*pointmap*, que comparte arquitectura y tarea:

| Modelo | Parametros | FLOPs | Embed dim | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B (este) | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-5B | 5,071 B | 15,722 T | 2432 | 56 | 32 |

Todas las variantes comparten la licencia Sapiens2 License y el formato safetensors. La version 0.4B es la mas ligera de la familia y la que mejor se adapta a hardware de consumo. No se dispone de datos de rendimiento comparativo (metricas por tarea) entre estas variantes en la informacion proporcionada. No se incluyen comparaciones con modelos de pointmap o profundidad de otros desarrolladores porque no hay datos disponibles.

## Limitaciones y advertencias

- Alcance restringido a imagenes *human-centric*: la model card limita el uso previsto a imagenes con personas y a investigacion en vision humana; el rendimiento fuera de ese dominio no esta documentado.
- Riesgo de alucinacion geometrica: como modelo generativo de prediccion densa, puede producir pointmaps plausibles pero geometricamente incorrectos en oclusiones, superficies reflectantes, transparencias o desenfoque.
- Ambiguedad de escala y perspectiva: la estimacion monocular de profundidad no garantiza escala metrica absoluta precisa, lo que limita aplicaciones de medicion sin calibracion adicional.
- Limitaciones de resolucion: la entrada se fija en 1024 x 768; resoluciones distintas pueden degradar el resultado.
- Sin capacidades de texto ni multilingues: no es adecuado para tareas de lenguaje, agentes o tool calling.
- Restricciones de licencia: se distribuye bajo la Sapiens2 License, no bajo una licencia permisiva. Antes de un uso comercial es imprescindible revisar el texto completo de la licencia en el repositorio oficial; la licencia no se modifica respecto al original.
- Origen del repositorio: este *checkpoint* es un espejo publicado por ml-resources, no una publicacion oficial de Meta. Conviene contrastar la integridad de los pesos con el repositorio oficial antes de usarlo en produccion.
- Sin variantes cuantizadas publicadas: no hay GGUF, AWQ ni GPTQ disponibles, por lo que la optimizacion de despliegue queda a cargo del usuario.
- Ausencia de benchmarks: no hay metricas publicadas que permitan validar el rendimiento en produccion sin evaluacion propia.

## Enlaces

- Repositorio (espejo): https://huggingface.co/ml-resources/sapiens2-pointmap-0.4b
- Repositorio oficial: https://huggingface.co/facebook/sapiens2-pointmap-0.4b
- Backbone preentrenado: https://huggingface.co/facebook/sapiens2-pretrain-0.4b
- Coleccion Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo: https://github.com/facebookresearch/sapiens2
- Guia de estimacion de pointmap: https://github.com/facebookresearch/sapiens2/blob/main/docs/POINTMAP.md
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md

Los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo (se refieren a otros significados de la abreviatura "ML"), por lo que no se han podido incorporar fuentes adicionales.
