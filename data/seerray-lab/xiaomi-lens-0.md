# SeerRay-Lab/Xiaomi-Lens-0

## Resumen

Xiaomi-Lens-0 es un modelo de lenguaje multimodal de 4B parametros desarrollado por Xiaomi Research (publicado en el repositorio de Hugging Face bajo el espacio SeerRay-Lab) y construido como un fine-tuning de Qwen3.5-4B. Su rasgo diferencial es que anade un decodificador ligero de mascaras de pixeles y se entrena con supervision conjunta de lenguaje y mascaras: cada token especial `<|mask|>` que genera el modelo identifica una region de la imagen que el decodificador convierte en una mascara de segmentacion. Esto le permite resolver tareas de comprension y segmentacion de expresiones referidas, grounding multi-instancia, segmentacion con razonamiento y percepcion visual de grano fino dentro de una misma conversacion.

El modelo esta pensado para escenarios donde no basta con describir una imagen, sino que hay que localizar y segmentar objetos concretos a partir de instrucciones en lenguaje natural, incluyendo cadenas de razonamiento intermedias. Con 4.622 millones de parametros y un tamano de repositorio de 9,4 GB, se posiciona como una alternativa ligera frente a modelos de segmentacion multimodal de mayor tamano, y su licencia Apache 2.0 facilita el uso comercial.

Su relevancia actual radica en la integracion de grounding visual y segmentacion directamente en el bucle generativo del modelo de lenguaje, sin necesidad de un pipeline separado de deteccion o segmentacion. El modelo se distribuye con pesos en safetensors, configuracion, tokenizer, processor y chat template, y requiere la clase `XiaomiLensQwen3_5ForConditionalGeneration` del repositorio de codigo acompanante para cargar los pesos y decodificar las mascaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B) con decodificador ligero de mascaras de pixeles |
| Parametros totales | 4.622.144.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,4 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Fecha de creacion | 2026-10-19 |
| Ultima actualizacion | 2026-11-25 |
| Descargas | 842 |
| Likes | 33 |

## Arquitectura y entrenamiento

Xiaomi-Lens-0 parte de Qwen3.5-4B, un transformer de 4B parametros, y le incorpora un decodificador ligero de mascaras de pixeles. El entrenamiento combina supervision de lenguaje y de mascaras de forma conjunta: el modelo aprende a emitir tokens `<|mask|>` alineados con regiones de la imagen, y el decodificador transforma cada uno de esos tokens en una mascara de segmentacion. Las mascaras pueden aparecer tanto en la respuesta final como durante el razonamiento intermedio, lo que habilita la segmentacion con razonamiento.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal. La informacion tecnica completa se remite al informe tecnico en arXiv (2610.23279) y al repositorio de codigo del proyecto.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes.
- Comprension de expresiones referidas (referring expression comprehension): localizar el objeto descrito por una frase.
- Segmentacion de expresiones referidas (referring expression segmentation): generar la mascara del objeto descrito.
- Grounding multi-instancia: localizar y segmentar varias instancias en una misma imagen.
- Segmentacion con razonamiento (reasoning segmentation): producir mascaras durante cadenas de razonamiento intermedias.
- Embodied referring: referencias visuales orientadas a entornos embodied.
- Percepcion visual de grano fino.
- Generacion de mascaras tanto en la respuesta final como en el razonamiento.
- Conversacion multi-turno con imagenes (pipeline image-text-to-text).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Anotacion automatica de datasets de segmentacion: dado un conjunto de imagenes y descripciones textuales, el modelo genera mascaras por instancia que pueden revisarse y servir como preanotacion, reduciendo el coste manual en pipelines de etiquetado.
- Edicion de imagen asistida por lenguaje: el usuario describe la region a modificar ("el portatil con el cartel blanco") y el modelo devuelve la mascara exacta que un pipeline posterior puede usar para inpainting o reemplazo de fondo.
- Robotica y navegacion embodied: el modelo puede resolver referencias como "el jugador que corre detras del pitcher" y devolver la region correspondiente, util para seleccionar objetivos de manipulacion o seguimiento en entornos fisicos.
- Analisis de imagenes medicas o industriales asistido: la segmentacion de grano fino con razonamiento permite localizar estructuras concretas descritas por el operador y justificar la seleccion en la cadena de razonamiento.
- Asistentes de accesibilidad: descripcion y localizacion de objetos en la escena para usuarios con discapacidad visual, indicando no solo que hay un objeto sino donde esta exactamente mediante la mascara.
- Busqueda visual y recuperacion: indexar objetos segmentados por descripcion textual para busquedas del tipo "encuentra todas las tazas rojas" en catalogos o archivos fotograficos.
- Control de calidad en retail o manufactura: verificar la presencia, posicion y estado de productos concretos mediante grounding multi-instancia sobre imagenes de linea de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 9,2 GB solo para pesos, mas memoria para activaciones y el decodificador de mascaras; se recomienda un minimo de 16 GB de VRAM.
- VRAM estimada con cuantizacion de 8 bits: en torno a 5-6 GB para pesos; con 4 bits, en torno a 3-4 GB. Los formatos de cuantizacion concretos no estan documentados en la informacion disponible.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con alta concurrencia; RTX 4090 o RTX 3090 para desarrollo e inferencia individual.
- GPU de consumo: el modelo deberia caber en GPUs consumer con 16 GB o mas (RTX 4080, RTX 4090) en BF16, y en GPUs de 8-12 GB con cuantizacion, aunque estos valores son estimaciones no verificadas por el autor.
- Opciones de despliegue: la carga requiere la clase `XiaomiLensQwen3_5ForConditionalGeneration` del repositorio de codigo del proyecto, por lo que no es un modelo cargable directamente con pipelines genericos sin ese paquete. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-Lens-0 | 4,62B | no disponible | Segmentacion y grounding multimodal | Apache 2.0 | Hugging Face, demo en Spaces |
| Qwen3.5-4B (modelo base) | 4B | no disponible | Lenguaje multimodal general | no disponible | Hugging Face |
| Alternativas de segmentacion multimodal de 4B | no disponible | no disponible | Segmentacion referida | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada que permitan una comparacion cuantitativa rigurosa. El modelo base Qwen3.5-4B es la referencia natural, pero Xiaomi-Lens-0 anade el decodificador de mascaras y el entrenamiento conjunto, por lo que no son directamente intercambiables en tareas de segmentacion.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al derivar de Qwen3.5-4B, hereda los sesgos del corpus de entrenamiento del modelo base, que no se detalla.
- Riesgo de alucinacion en la identificacion de objetos: el modelo puede generar mascaras para regiones que no corresponden a la descripcion, especialmente en imagenes con muchos objetos similares o descripciones ambiguas.
- No se especifican los idiomas soportados; la capacidad multilingue no esta confirmada y el rendimiento en castellano es desconocido.
- La longitud de contexto no esta documentada, lo que impide planificar conversaciones multi-turno largas o imagenes de alta resolucion con garantias.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que conviene verificar antes de desplegar en produccion.
- Requiere instalar el paquete de codigo acompanante para cargar los pesos y decodificar mascaras; no es compatible con pipelines genericos de transformers sin ese paso.
- El modelo tiene solo 842 descargas y 33 likes, por lo que la validacion por parte de la comunidad es limitada.
- No hay datos publicos de benchmarks en la informacion disponible, lo que dificulta evaluar su calidad frente a alternativas.
- El decodificador de mascaras anade latencia y memoria respecto al modelo base; no se han publicado mediciones de throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeerRay-Lab/Xiaomi-Lens-0
- Demo online: https://huggingface.co/spaces/SeerRay-Lab/xiaomi-lens-0
- Pagina del proyecto: https://xiaomi-research.github.io/xiaomi-lens-0/
- Repositorio de codigo: https://github.com/xiaomi-research/xiaomi-lens-0
- Informe tecnico en arXiv: https://arxiv.org/abs/2610.23279
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
