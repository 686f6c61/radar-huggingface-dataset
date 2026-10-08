# nativ-community/clef-MLX-NVFP4

## Resumen

clef-MLX-NVFP4 es una conversion al formato MLX del modelo Cloudflare/clef, publicada por el colectivo nativ-community. No se trata de un modelo generativo al uso: clef es un modelo de decision (decision model) que, dada una entrada multimodal (texto, imagen o video), devuelve una probabilidad para cada opcion de cada pregunta planteada en un unico forward pass, sin generar texto libre. El paquete esta cuantizado en NVFP4 con group size 16, lo que reduce el peso a aproximadamente 16,3 GB de repositorio para 27.484.784.881 parametros totales (unos 27,5 mil millones).

Su relevancia es doble. Por un lado, traslada el modelo original de Cloudflare al ecosistema MLX, lo que permite ejecutarlo en Apple Silicon con la libreria mlx-vlm. Por otro, mantiene la naturaleza de clasificacion estructurada del modelo base: en lugar de responder con lenguaje natural, devuelve etiquetas con probabilidad asociada para preguntas con opciones predefinidas, algo util para enrutado, triaje y clasificacion automatica.

El soporte de clef todavia no esta integrado en una release estable de mlx-vlm, por lo que la model card indica que es necesario instalar una rama de desarrollo concreta. La publicacion tiene cero descargas y cero likes en el momento de redactar esta ficha, lo que implica que su validacion por parte de la comunidad es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text derivado de Cloudflare/clef; detalle interno no especificado) |
| Parametros totales | 27.484.784.881 (aproximadamente 27,5 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 con group size 16 (4 bits); el modelo de origen Cloudflare/clef esta en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Tamano del repositorio | 16,3 GB |
| Libreria | mlx |
| Pipeline | image-text-to-text |
| Modelo base | Cloudflare/clef (revision ed3eed331870db2eff4b0db01237128ede8a00ce) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Cloudflare/clef. Lo que si se especifica es su comportamiento funcional: se trata de un modelo multimodal (image-text-to-text) que recibe entradas de texto, imagen y video, y que en lugar de decodificar tokens de texto devuelve, en un solo forward pass, una distribucion de probabilidad sobre las opciones de cada pregunta definida por el usuario. Es decir, actua como un clasificador generativo estructurado, no como un modelo conversacional de generacion.

La conversion a MLX aplica cuantizacion NVFP4 (formato de coma flotante de 4 bits, variante FP4 alineada con hardware NVIDIA) con group size 16, sobre los pesos en bf16 del modelo original. La model card reporta una verificacion de fidelidad frente a la referencia PyTorch en bf16: identificadores de token identicos en 11/11 registros de referencia (texto, imagen, video, imagen+video, dos imagenes, max_pixels, fps y num_frames), la misma respuesta que la referencia de Cloudflare en 25/25 preguntas, y una brecha maxima de probabilidad de 0,1033. No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Decision multimodal: devuelve una probabilidad por cada opcion de cada pregunta en un unico forward pass.
- Entrada de texto, imagen y video, incluyendo combinaciones de imagen mas video y de dos imagenes simultaneas.
- Preguntas estructuradas con opciones cerradas (choice), con campo de instrucciones y lista de criterios.
- Salida con valor seleccionado y probabilidad asociada por campo, accesible mediante la clave answers.
- Soporte de parametros de preprocesado de imagenes y video: max_pixels, fps y num_frames.
- Integracion con mlx-vlm para inferencia en Apple Silicon.
- No genera texto libre: no dispone de capacidad de generacion conversacional.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Enrutado de tickets de soporte: clasificar cada mensaje entrante en un departamento (por ejemplo facturacion, tecnico o ventas) devolviendo la etiqueta con su probabilidad, tal como se muestra en el ejemplo de la model card con la consulta de un cargo duplicado.
- Moderacion de contenido: definir categorias de incumplimiento como opciones y obtener la probabilidad de cada una para decidir si una publicacion requiere revision humana.
- Clasificacion de imagenes en catalogos de producto: enviar la fotografia de un articulo junto con una pregunta de categoria y obtener la categoria mas probable sin necesidad de un pipeline de clasificacion aparte.
- Triaje documental en pipelines RAG: decidir a que indice o coleccion debe dirigirse una consulta antes de recuperar contexto, aprovechando la salida probabilistica como senal de confianza.
- Analisis de encuestas y formularios: mapear respuestas abiertas a categorias predefinidas y obtener la distribucion de probabilidad para medir ambiguedad.
- Etiquetado sobre video: clasificar clips o fotogramas clave (con control de fps y num_frames) en categorias predefinidas para anotacion automatica de conjuntos de datos.
- Deteccion de intencion en asistentes: determinar la intencion del usuario entre un conjunto cerrado de opciones antes de derivar a una accion concreta.
- Priorizacion de leads o solicitudes: asignar cada entrada a un nivel de prioridad o segmento usando la probabilidad como criterio de ordenacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica verificacion numerica aportada por el autor es la comparacion de fidelidad frente al modelo original:

| Verificacion | Resultado |
|---|---|
| Identificadores de token identicos (11 registros de referencia: texto, imagen, video, imagen+video, dos imagenes, max_pixels, fps, num_frames) | 11/11 |
| Mismas respuestas que la referencia PyTorch bf16 de Cloudflare | 25/25 preguntas |
| Brecha maxima de probabilidad frente a la referencia | 0,1033 |
| Revision de mlx-vlm utilizada | Lazarus-931/mlx-vlm@c16f81aa |

## Requisitos de hardware

- VRAM o memoria unificada estimada: los 27,5 mil millones de parametros en NVFP4 (4 bits) ocupan aproximadamente 13,7 GB solo en pesos; el repositorio completo pesa 16,3 GB. Hay que sumar espacio para cache KV y activaciones, de modo que conviene disponer de al menos 20-24 GB libres.
- Plataforma objetivo: al estar en formato MLX, esta pensado para Apple Silicon con memoria unificada. No es ejecutable directamente en GPUs CUDA con vLLM, TGI o llama.cpp sin conversion previa.
- Equipos recomendados: Mac con chip M1/M2/M3/M4 Pro con 24 GB o mas de memoria unificada; para mayor margen, M-series Max o Ultra con 32-64 GB.
- GPU consumer CUDA: no aplica directamente, ya que MLX es una libreria para Apple Silicon. En ese ecosistema no hay una ruta de ejecucion soportada de forma nativa.
- Opciones de despliegue: mlx-vlm, requiriendo la rama de desarrollo Lazarus-931/mlx-vlm@feat/clef (el soporte de clef aun no esta en una release estable). Alternativamente, la libreria mlx de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clef-MLX-NVFP4 (este modelo) | 27,5 mil millones | no disponible | MLX safetensors, NVFP4 group size 16 | apache-2.0 | HuggingFace, requiere fork de mlx-vlm |
| Cloudflare/clef (modelo base) | no disponible en la informacion | no disponible | safetensors, bf16 | apache-2.0 | HuggingFace |
| Otros modelos de decision multimodales comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada alternativas directas de la misma categoria (modelos de decision multimodal que devuelvan probabilidades por opcion en un unico forward pass), por lo que la comparativa se limita al modelo base del que deriva esta conversion.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo etiquetas con probabilidad, por lo que no sirve para tareas de redaccion, resumen o dialogo.
- Requiere definir de antemano las preguntas y sus opciones; no admite consultas abiertas sin estructura.
- El soporte de clef todavia no esta en una release estable de mlx-vlm, lo que obliga a instalar una rama de desarrollo concreta y aumenta el riesgo de incompatibilidades.
- La cuantizacion NVFP4 introduce desviaciones numericas: la propia model card reporta una brecha maxima de probabilidad de 0,1033 frente a la referencia en bf16, suficiente para alterar elecciones en casos con opciones muy equilibradas.
- Ejecucion limitada al ecosistema MLX y, por tanto, a hardware Apple Silicon; no hay ruta nativa para GPUs CUDA.
- Idiomas soportados no declarados: se desconoce el comportamiento en castellano y en idiomas distintos del ingles.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Cloudflare/clef, heredaria los sesgos de su dataset de entrenamiento, que tampoco se detalla.
- Riesgo de clasificacion erronea en entradas ambiguas o fuera de distribucion, con el consiguiente impacto si se usa de forma totalmente automatizada sin revision humana.
- Modelo con cero descargas y cero likes: sin validacion independiente por parte de la comunidad.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Cloudflare/clef y de los pesos originales antes de desplegarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/clef-MLX-NVFP4
- Modelo base: https://huggingface.co/Cloudflare/clef
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Rama de mlx-vlm con soporte de clef: https://github.com/Lazarus-931/mlx-vlm/tree/feat/clef
- Pagina del proyecto Nativ (ejecucion local de modelos en Apple Silicon): https://blaizzy.github.io/nativ/
