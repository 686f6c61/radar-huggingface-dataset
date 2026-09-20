# Quazim0t0/Byrne-VLM-131M

## Resumen

Byrne-VLM-131M es un modelo vision-lenguaje (VLM) de ~130,9 M de parametros desarrollado por Quazim0t0, publicado en Hugging Face bajo licencia Apache-2.0 y orientado a la tarea `image-to-text` (image captioning). Su particularidad es que no reutiliza un LM preentrenado de terceros: tanto el codificador visual (Byrne-VE, 39,34 M) como el modelo de lenguaje (Byrne-LM, ~90 M) proceden de la propia familia SpikeWhale / Byrne del autor, con un conector MLP de 1,18 M y un adaptador Family-LoRA de 5,04 M entrenable. El montaje sigue el patron clasico de LLaVA: imagen → encoder ViT → tokens de parche → conector → inyeccion en los marcadores `<image>` del LM → texto.

El modelo se presenta explicitamente como un artefacto de investigacion y demostracion de arquitectura, no como un captioner competitivo. Su interes tecnico esta en la combinacion de piezas poco habituales en un modelo de este tamano: en el LM conviven MLA, DERF, XSA, memoria de n-gramas Engram, hyper-connections, MoE, MTP, refinado HRM, QK-Norm y RoPE parcial, con un tokenizador propio (SpikeTokenizer, vocabulario de 16.512) y 4.096 tokens de contexto. El encoder visual usa RMSNorm, RoPE axial 2D, QK-Norm, SwiGLU y una etapa de refinado HRM.

Su relevancia ahora es doble. Por un lado, sirve como banco de pruebas reproducible de destilacion (DINOv2-base como profesor, luego autodestilacion DINO-style sin profesor) y de destilacion a nivel de secuencia frente a un profesor de otro vocabulario. Por otro, documenta con honestidad sus propios resultados: en COCO-val (n=500), la version v1 obtiene CIDEr ≈ 0,06 y BLEU-4 ≈ 4,8, y la v2 (448 px, engram reparado, captions concisas) sube el CIDEr a 0,140. Es, en la practica, un experimento de capacidad y escala, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM estilo LLaVA: ViT (Byrne-VE) + conector MLP + LM decoder-only (Byrne-LM) con Family-LoRA; el LM incorpora MLA, DERF, XSA, Engram n-gram, hyper-connections, MoE, MTP, refinado HRM, QK-Norm y RoPE parcial |
| Parametros totales | 130,9 M (segun la model card: 39,34 M vision + 1,18 M conector + ~90 M LM + 5,04 M Family-LoRA) |
| Parametros activos | no disponible (el LM usa MoE, pero la model card no desglosa parametros activos frente a totales) |
| Longitud de contexto | 4096 tokens (con AnyRes 2x2 se emplean 980 tokens de imagen dentro de esa ventana) |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones publicadas; solo pesos PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`): `weights/byrne_vlm.pt` y `weights/byrne_ve.pt`; el repo incluye el tag `safetensors` pero la model card solo referencia ficheros `.pt` y codigo propio |
| Tamano del repositorio | 1,2 GB |
| Tokenizador | SpikeTokenizer, vocabulario de 16.512 |
| Entrada visual | 224 px / patch 16 / 196 tokens / dim 512 / profundidad 12 (v1); 448 px en la v2; tiling AnyRes opcional con rejilla (2,2) |
| Pipeline | image-to-text |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema tiene cuatro bloques. Byrne-VE es un encoder tipo ViT de 39,34 M con RMSNorm, RoPE axial 2D, QK-Norm, SwiGLU y una etapa de refinado HRM; procesa la imagen a 224 px con patch de 16 y produce 196 tokens de 512 dimensiones (la v2 sube a 448 px). El conector es un MLP de dos capas (512→1024→640) que proyecta esos tokens al espacio del LM. Byrne-LM es un decoder de ~90 M con MLA, DERF, XSA, Engram (memoria de n-gramas), hyper-connections, MoE, MTP, refinado HRM, QK-Norm y RoPE parcial, sobre el que se anade Family-LoRA (r=16, 5,04 M), un adaptador cuyo cuello de botella es un bloque de familia completo con refinado iterativo HRM con puertas y MoE-SwiGLU (expertos compartidos y enrutados con routing sqrtsoftplus). El adaptador se inicializa a cero, de modo que al arrancar se comporta como una no-op exacta.

El entrenamiento se hizo en cuatro fases. Primero, el encoder visual se entreno por destilacion desde `facebook/dinov2-base` congelado (coseno sobre CLS y sobre la rejilla de parches) y despues con autodestilacion DINO-style con EMA, sin profesor, alcanzando segun el autor ~88 % del k-NN de DINOv2 con ~45 % de los parametros. Segundo, el conector se anclo al LM durante 10 rondas en streaming sobre pares imagen-caption (CC3M, CC12M, Conceptual-Captions-12M, LLaVA-ReCap-558K/118K/CC3M, TextCaps, Flickr8k, LLaVA-NeXT-Data), con encoder y LM congelados. Tercero, se hizo un ajuste de estilo del conector sobre ~25.000 imagenes etiquetadas por `HuggingFaceTB/SmolVLM-256M-Instruct`, mediante destilacion a nivel de secuencia (no de logits, porque el profesor y SpikeTokenizer usan vocabularios distintos). Cuarto, se entreno la Family-LoRA sobre el decoder junto con el conector, manteniendo el LM base congelado. La v2 anade encoder a 448 px, reparacion del Engram (los tokens hashaban todos al bucket 0, ahora reparado bit-exact y poblado) y reentrenamiento con captions concisas.

## Capacidades

- Generacion de texto a partir de imagen: descripcion de escenas en una frase o dos, con sujeto principal reconocible.
- Image captioning de grano grueso ("coarse scene gist"): identifica objetos y escenas claras (leon, torre, etc.) aunque falla en detalles especificos.
- Comprension visual basica de sujetos y contexto: la model card muestra ejemplos correctos en la familia semantica aunque con error de clase (cheetah descrito como "tiger").
- Soporte de resolucion variable mediante tiling AnyRes `(2,2)`: hasta 980 tokens de imagen dentro de los 4.096 de contexto, pensado para imagenes densas o documentos.
- Capacidad de documento en la variante hermana Byrne-Docling-131M, que emite DocTags atomicos bien formados (no es una capacidad confirmada de este checkpoint concreto).
- Capacidades de agente, tool calling y function calling: no disponibles / no documentadas.
- Modo de razonamiento explicito (thinking), vision adicional, audio o video: no disponibles.
- Capacidades multilingues: no disponibles (la model card no especifica idiomas; los ejemplos y los datos de entrenamiento citados son en ingles).

## Casos de uso

- Investigacion de arquitecturas VLM: el modelo permite reproducir un pipeline completo estilo LLaVA (encoder + conector + LM con LoRA) en una sola GPU, con todos los componentes entrenados desde cero salvo el profesor DINOv2-base, lo que lo hace util para estudiar ablaciones de conector, congelacion de capas y adaptadores.
- Estudio de destilacion a nivel de secuencia: sirve como caso practico de como destilar de un profesor con vocabulario distinto (SmolVLM-256M-Instruct) trabajando sobre el texto generado en lugar de sobre logits, un patron reutilizable cuando no se puede compartir tokenizador.
- Pre-etiquetado y filtrado de datasets de imagen-texto a gran escala: con CIDEr ≈ 0,14 en COCO-val, no sirve para anotacion de referencia, pero si para descartar pares imagen-texto claramente incoherentes o para asignar una etiqueta gruesa de escena antes de un etiquetado humano o de un modelo mayor.
- Indexacion y busqueda de medios por contenido aproximado: generar una descripcion corta por imagen para alimentar un indice de texto; con 131 M de parametros el coste por imagen es bajo y el fallo a nivel de detalle fino es tolerable en recuperacion de primer nivel.
- Despliegue en edge o en hardware modesto: al ser un modelo de 131 M, cuantizado a int8 ocupa del orden de 131 MB de pesos y puede ejecutarse en CPU, moviles o placas tipo Raspberry Pi, escenario donde un captioner de miles de millones de parametros no es viable.
- Docencia y divulgacion tecnica: el repositorio incluye el codigo de los componentes (`vlm_model.py`, `modeling_byrne_embed.py`, `family_lora.py`, `anyres.py`), lo que permite explicar pieza a pieza como se conecta un encoder visual a un LM con MLA, MoE y memoria de n-gramas.
- Pruebas de extraccion de estructura en documentos con AnyRes: activando `anyres_grid=(2,2)` y tras un fine-tune compatible, el modelo puede procesar documentos densos con hasta 980 tokens de imagen, util como banco de pruebas antes de adoptar la variante Byrne-Docling.

## Benchmarks y rendimiento

| Benchmark | v1 (224 px) | v2 (448 px) | Notas |
|---|---|---|---|
| COCO-val CIDEr (n=500) | 0,061 | 0,140 | Mejora de 2,3x segun el autor; la v2 con captions verbosas intermedias solo alcanzo 0,029 |
| COCO-val BLEU-4 (n=500) | 4,8 | no disponible | Solo publicado para la v1 |
| Alineacion con DINOv2-base, coseno CLS (n=1024 held-out) | 0,776 (Byrne-VE) | no disponible | Escarda-VE (variante con JEPA) obtiene 0,771 |
| Alineacion con DINOv2-base, coseno PATCH | 0,600 (Byrne-VE) | no disponible | Escarda-VE obtiene 0,584 |
| Autoconsistencia JEPA | no aplica (Byrne usa HRM, sin JEPA) | no disponible | Escarda-VE: 0,040 |
| k-NN respecto a DINOv2 | ~88 % con ~45 % de los parametros | no disponible | Dato aportado por el autor para el encoder |

Ejemplos cualitativos recogidos en la model card: leon → "a lion on the ground. In the background there are trees."; torre → "a tower. In the background there is a sky."; guepardo → "a tiger in the water." (familia correcta, clase incorrecta).

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales estandar (MMBench, VQAv2, TextVQA) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no publicado por el autor): ~524 MB en fp32, ~262 MB en fp16/bf16, ~131 MB en int8 y ~66 MB en int4, mas activaciones y cache KV de 4.096 tokens, que en este tamano de modelo son del orden de decenas de MB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, 4060, 4090, etc.; tambien en iGPU y en CPU. No requiere A100 ni H100, que estarian enormemente sobredimensionadas para 131 M de parametros.
- Ejecucion en CPU: viable, dado el tamano; la model card incluye un guard `cuda if torch.cuda.is_available() else cpu` en el ejemplo de uso.
- Opciones de despliegue: el ejemplo oficial usa PyTorch puro con codigo propio (`generate.py`, `SpikeTokenizer`, `vlm_model.py`). No hay evidencia en la informacion disponible de soporte para vLLM, TGI, llama.cpp, Ollama o LM Studio; al tratarse de una arquitectura personalizada (MLA, Engram, HRM, Family-LoRA) es previsible que requiera integracion especifica, pero esto no esta confirmado.
- Formatos de despliegue: solo pesos `.pt`; no se publican GGUF ni safetensors en la model card.
- Latencia y throughput: no disponibles.
- Nota sobre AnyRes: la rejilla (2,2) eleva el numero de tokens de imagen hasta 980 dentro de los 4.096 de contexto y, segun el autor, necesita un fine-tune compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Byrne-VLM-131M | 130,9 M (39,34 M vision + ~90 M LM + 1,18 M conector + 5,04 M LoRA) | 4096 tokens; hasta 980 tokens de imagen con AnyRes 2x2 | COCO CIDEr 0,140 (v2); BLEU-4 4,8 (v1) | Apache-2.0 | Pesos `.pt` y codigo propio en Hugging Face; descargas 0 en el momento de la consulta |
| SmolVLM-256M-Instruct | 256 M (segun la informacion disponible) | no disponible | Usado como profesor de estilo; el autor indica que es "mucho mas fuerte" que Byrne-VLM, sin cifras concretas | no disponible | no disponible |
| Byrne-Docling-131M | 131 M | no disponible | Enfocado a DocTags atomicos; el autor lo describe como algo mas completo que Escarda-Docling en las muestras mas dificiles | Apache-2.0 (misma familia, segun los enlaces de la model card) | Repositorio propio en Hugging Face |
| Escarda-Docling-126M | 126 M | no disponible | Estructuralmente a la par de Byrne-Docling segun el autor, con el rasgo de aprendizaje autosupervisado JEPA | Apache-2.0 (misma familia, segun los enlaces de la model card) | Repositorio propio en Hugging Face |
| DINOv2-base | no disponible en la informacion proporcionada | no aplica | Profesor del encoder visual; Byrne-VE alcanza ~88 % de su k-NN con ~45 % de los parametros | no disponible | no disponible |

No se dispone de datos comparativos con otros captioners pequenos de proposito general (por ejemplo alternativas tipo BLIP o GIT) en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad de captioning muy baja para uso real: CIDEr ≈ 0,06 en v1 y 0,140 en v2 sobre COCO-val, muy por debajo de un captioner utilizable. El propio autor lo califica de artefacto de investigacion y no de captioner SOTA.
- Errores de clase y confusiones taxonomicas: el ejemplo documentado describe un guepardo como "tigre en el agua"; acierta la familia pero no la identidad.
- Incapacidad para captions especificos o de referencia: solo captura la idea general de la escena y sujetos claros.
- Alucinacion esperable: en un modelo destilado de 90 M de LM con datos de captioning, es probable que rellene contexto ("In the background there are trees") sin base visual firme.
- Sesgos: no documentados en la model card; no hay evaluacion de sesgos demograficos, culturales ni de representacion.
- Idiomas: no disponibles. Los datos de entrenamiento citados son en ingles y los ejemplos tambien, por lo que el uso en castellano no esta respaldado por la informacion proporcionada.
- Contexto limitado a 4.096 tokens, y el uso de AnyRes 2x2 (980 tokens de imagen) exige un fine-tune compatible; no es un comportamiento listo para usar.
- Disponibilidad: la model card indica que el modelo se abrira sin gating "una vez terminado el base", lo que sugiere que el acceso puede estar restringido. Ademas, el repositorio registra 0 descargas y 0 likes, sin validacion externa.
- Integracion en produccion: al usar arquitectura y tokenizador propios (SpikeTokenizer, MLA, Engram, HRM, Family-LoRA), no hay soporte confirmado en runtimes estandar (vLLM, TGI, llama.cpp, Ollama), lo que implica trabajo de integracion a medida.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento citados (CC3M, CC12M, LLaVA-ReCap, TextCaps, Flickr8k, LLaVA-NeXT-Data) y de las salidas del profesor SmolVLM-256M-Instruct utilizadas como objetivo de destilacion.
- La model card esta truncada en el apartado de la v2 ("Switching training captions f..."), por lo que los detalles finales de ese entrenamiento no estan disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quazim0t0/Byrne-VLM-131M
- Byrne-VE (encoder visual): https://huggingface.co/Quazim0t0/Byrne-VE
- Escarda-VE (variante con JEPA): https://huggingface.co/Quazim0t0/Escarda-VE
- Byrne-Docling-131M: https://huggingface.co/Quazim0t0/Byrne-Docling-131M
- Escarda-Docling-126M: https://huggingface.co/Quazim0t0/Escarda-Docling-126M
- Profesor del encoder visual, DINOv2-base: https://huggingface.co/facebook/dinov2-base
- Profesor de estilo, SmolVLM-256M-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct
- Paper de referencia del enfoque LLaVA: no disponible en la informacion proporcionada
- Demos, blogs o repositorios adicionales: no disponibles en la informacion proporcionada
