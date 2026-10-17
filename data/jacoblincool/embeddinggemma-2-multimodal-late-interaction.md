# JacobLinCool/embeddinggemma-2-multimodal-late-interaction

## Resumen

`JacobLinCool/embeddinggemma-2-multimodal-late-interaction` es un adaptador multimodal del codificador `google/embeddinggemma-2`, publicado por el usuario JacobLinCool, que convierte el backbone original en un `sentence_transformers.MultiVectorEncoder` nativo capaz de indexar texto, imagen y audio mono a 16 kHz. Su particularidad es que produce embeddings a nivel de token con interacción tardía (late interaction, esquema tipo ColBERT) usando una función de similitud propia denominada Mean-MaxSim, con 256 dimensiones por token, sin necesidad de `trust_remote_code` ni de envoltorios personalizados.

El modelo resuelve el problema de la recuperación cruzada entre modalidades dentro de un mismo espacio vectorial: una consulta en texto puede compararse indistintamente contra documentos de texto, imágenes o fragmentos de audio mediante una única función de puntuación asimétrica. El ajuste se realizó con LoRA sobre las proyecciones de atención del transformer de texto compartido, manteniendo congeladas las torres de visión y audio, y fusionando después los pesos para eliminar la sobrecarga de inferencia.

La relevancia actual del checkpoint es discutible desde el punto de vista de madurez: acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, la tabla de resultados publicada está truncada y no incluye la fila correspondiente al propio checkpoint `B3-LI256`, y el autor etiqueta los resultados como experimentales. Aun así, resulta interesante como referencia técnica por su enfoque de late interaction multimodal sobre un backbone compacto de 744.371.512 parámetros y por su compatibilidad directa con la pila estándar de `sentence-transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder multimodal con transformer de texto compartido de 24 capas, torre de vision estilo SigLIP y torre de audio estilo Conformer; salida multi-vector con late interaction |
| Parametros totales | 744.371.512 (segun safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor exige ejecucion en bfloat16 o float32 y prohibe float16 por desbordamiento de activaciones (NaN/Inf) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-with-upstream-dataset-attribution (etiquetada en HuggingFace como `other`) |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 dimensiones por token en la proyeccion Matryoshka; 256 dimensiones por token tras el selector de prefijo |
| Funcion de similitud | Mean-MaxSim (late interaction asimetrica) |
| Tamano del repositorio | 1,5 GB |
| Modelo base | google/embeddinggemma-2 |
| Libreria | sentence-transformers (>= 6.0.0) y transformers (>= 5.20.0) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El backbone es `google/embeddinggemma-2`, descrito por el autor como un encoder multimodal con torre de visión de estilo SigLIP, torre de audio de estilo Conformer y un transformer de texto compartido de 24 capas, más una proyección Matryoshka preentrenada de 512 a 768 dimensiones (`language_model.embedding_projection`). Conviene señalar una discrepancia en la información disponible: el autor describe el backbone como "Gemma 4 300M", mientras que el recuento real de safetensors del repositorio asciende a 744.371.512 parámetros; no se aclara el motivo de esta diferencia.

El pipeline se compone de cuatro módulos declarados en `modules.json`: un `Transformer` que emite estados por token de 768 dimensiones en `bfloat16` con una plantilla de chat sensible a la modalidad (aplica los prompts oficiales de consulta y documento solo a las entradas de texto, dejando sin prompt las imágenes, de unos 260 tokens, y el audio a 16 kHz, de unos 25,1 tokens por segundo); un módulo `Dense` con una capa `Linear(768 -> 256, bias=False)` congelada, inicializada como `W = [I_256 | 0_256x512]` para conservar los primeros 256 canales Matryoshka sin introducir pesos aleatorios; un `MultiVectorMask` que enmascara los tokens de relleno en lotes de longitud variable; y un `Normalize` que aplica normalización L2 por token. La similitud Mean-MaxSim se define como la media, sobre los tokens de la consulta, del máximo producto escalar contra los tokens del candidato.

El entrenamiento consistió en un ajuste LoRA conjunto (`r=32, alpha=64, dropout=0.05`) aplicado estrictamente a las 48 proyecciones de atención (`q_proj` y `v_proj`) de las 24 capas del transformer de texto, lo que supone 2.097.152 parámetros entrenables, el 0,2809% del total. Las torres de visión y audio, los módulos `embed_vision` y `embed_audio` y la proyección de embedding permanecieron congelados. Se realizaron 200 actualizaciones del optimizador con semilla 42 sobre una NVIDIA L4 en `bfloat16`, con una pérdida conjunta que combina InfoNCE denso a 768 dimensiones, InfoNCE denso a 256 dimensiones, InfoNCE de late interaction a 256 dimensiones y un término de destilación KL de 0,1·τ² que alinea la distribución de similitudes de la cabeza de late interaction con la de la cabeza densa de 768 dimensiones. Los LoRA se fusionaron posteriormente en los pesos base. Los datos citados son `sentence-transformers/msmarco-bm25`, `jxie/flickr8k`, `gijs/clotho` y `mteb/scifact`; no se especifica el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de embeddings multi-vector a nivel de token para texto, imagen y audio mono a 16 kHz, con 256 dimensiones por token.
- Codificación asimétrica de consultas y documentos mediante `encode_query` y `encode_document`, con plantillas de prompt específicas para texto.
- Recuperación cruzada de modalidades dentro de un mismo espacio: texto a texto, texto a imagen y texto a audio.
- Soporte Matryoshka: la proyección intermedia permite trabajar con 768 dimensiones por token antes del selector de prefijo y con 256 dimensiones después.
- Función de similitud Mean-MaxSim integrada en la librería, sin necesidad de código personalizado ni `trust_remote_code`.
- Compatibilidad con `endpoints_compatible` para su despliegue como endpoint de HuggingFace.
- No dispone de tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de extracción de características.

## Casos de uso

- Busqueda semantica multimodal en catalogos de producto: una consulta textual como "camiseta azul de manga corta" se compara contra imagenes del catalogo usando Mean-MaxSim T→I, aprovechando la torre de vision SigLIP y la ventana de unos 260 tokens por imagen.
- Recuperacion aumentada (RAG) sobre corpus cientifico: el modelo obtiene 83,67 de nDCG@10 en BEIR SciFact con 5.183 documentos, lo que permite usarlo como recuperador inicial en pipelines de pregunta-respuesta sobre literatura tecnica.
- Busqueda por texto en archivos de audio: indexando grabaciones mono a 16 kHz en fragmentos de unos 25,1 tokens por segundo, permite localizar fragmentos sonoros descritos en lenguaje natural, util para archivos de podcasts o grabaciones de campo.
- Anotacion automatica de archivos audiovisuales: combinando embeddings de fotogramas y de pistas de audio, se pueden etiquetar y agrupar clips por contenido sin transcripcion previa.
- Deduplicacion y clustering de contenido multimedia: los embeddings multi-vector permiten detectar duplicados y agrupar imagenes o audios similares en grandes repositorios.
- Reranking de resultados de busqueda: al puntuar pares consulta-documento con late interaction a 256 dimensiones, puede colocarse como segunda etapa sobre un recuperador denso o BM25 mas rapido.
- Sistemas de recomendacion cross-modal: a partir del historial de interacciones textuales de un usuario, recuperar imagenes o audios afines en el mismo espacio vectorial.

## Benchmarks y rendimiento

Los resultados que aparecen a continuacion son los publicados por el autor, marcados como experimentales, con semilla 42 y evaluacion sobre conjuntos de candidatos retenidos: Flickr8k (500 consultas de test contra 500 imagenes), Clotho (300 consultas contra 300 clips de audio completos a 16 kHz mono) y BEIR SciFact (300 consultas contra el corpus completo de 5.183 documentos).

| Metodo | Flickr8k T→I R@1 (%) | Flickr8k T→I R@10 (%) | Clotho T→A R@1 (%) | Clotho T→A R@10 (%) | SciFact T→T nDCG@10 (%) | SciFact T→T R@10 (%) | Δ T→I vs B0-256 (pp) | Δ T→A vs B0-256 (pp) | Δ T→T vs B0-256 (pp) |
|---|---|---|---|---|---|---|---|---|---|
| B0-768 | 86,80 | 99,60 | 6,00 | 33,67 | 83,67 | 92,24 | +2,40 [+0,80, +4,40] | +0,67 [-1,00, +2,67] | +1,52 [+0,57, +2,52] |
| B0-256 | 84,40 | 99,40 | 5,33 | 31,67 | 82,15 | 90,12 | +0,00 [+0,00, +0,00] | +0,00 [+0,00, +0,00] | +0,00 [+0,00, +0,00] |
| B1-LI256 | 83,00 | 99,60 | 5,33 | 23,33 | 78,59 | 89,34 | -1,40 [-4,20, +1,40] | +0,00 [-2,67, +2,67] | -3,56 [-6,76, -0,46] |
| B2-D768 | 86,60 | 99,20 | 8,33 | 40,00 | 82,30 | 91,02 | +2,20 [+0,20, +4,40] | +3,00 [+0,00, +6,33] | no disponible |

Advertencias sobre estos datos: la tabla publicada esta truncada y no incluye la fila del checkpoint `B3-LI256`, que es el que da nombre al repositorio, por lo que no hay resultados publicados en la informacion disponible para el modelo final. Tampoco se aportan intervalos de confianza completos en la fila `B2-D768`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de generacion, ya que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,5-2 GB solo para los pesos en `bfloat16` (el repositorio ocupa 1,5 GB), mas el espacio de activaciones, que crece con el numero de tokens de la entrada.
- Precision obligatoria: `bfloat16` o `float32`. El autor advierte explicitamente de que `float16` provoca desbordamiento de activaciones con valores NaN o Inf.
- GPU recomendadas: el ajuste se realizo sobre una NVIDIA L4, lo que indica que el modelo esta pensado para tarjetas de gama media profesional; funciona igualmente en A100, H100, L40S y RTX serie 30/40.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 3060, RTX 4060 o RTX 4090. Tambien es viable en CPU para lotes pequenos, aunque con mayor latencia.
- Opciones de despliegue: `sentence-transformers` (>= 6.0.0) con la clase `MultiVectorEncoder`, `transformers` (>= 5.20.0), endpoints compatibles de HuggingFace. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Dependencias adicionales para audio e imagen: `soundfile`, `soxr`, `pillow` y `torch`.
- Latencia y throughput: no disponibles. La indexacion en esquemas de late interaction suele requerir estructuras especializadas tipo ColBERT/PLAID, pero el autor no documenta ninguna en la informacion proporcionada.

## Comparativa con modelos similares

En la informacion disponible solo se pueden comparar las variantes internas del propio autor, ya que no se aportan datos de modelos externos de la competencia.

| Variante | Tipo de embedding | Dimension | Flickr8k T→I R@1 (%) | Clotho T→A R@1 (%) | SciFact nDCG@10 (%) |
|---|---|---|---|---|---|
| B0-768 | Denso | 768 | 86,80 | 6,00 | 83,67 |
| B0-256 | Denso | 256 | 84,40 | 5,33 | 82,15 |
| B1-LI256 | Late interaction | 256 por token | 83,00 | 5,33 | 78,59 |
| B2-D768 | Denso | 768 | 86,60 | 8,33 | 82,30 |
| B3-LI256 (este checkpoint) | Late interaction | 256 por token | no disponible | no disponible | no disponible |

Frente a alternativas externas de recuperacion multimodal como jina-clip-v2, BGE-M3 o los recuperadores basados en ColBERT, no se dispone de comparaciones publicadas en la informacion proporcionada, ni de datos de parametros, contexto o licencia de esos modelos en este contexto.

## Limitaciones y advertencias

- Ajuste muy corto: solo 200 actualizaciones del optimizador sobre LoRA, lo que limita la magnitud de la adaptacion y hace plausible que el modelo final este poco alejado del backbone base.
- Resultados no concluyentes: el autor etiqueta los benchmarks como experimentales y la tabla publicada no incluye la fila del checkpoint `B3-LI256`, por lo que no se puede verificar su rendimiento real.
- Senales de baja validacion por la comunidad: 0 descargas y 0 "likes" en el momento de redactar esta ficha, sin evidencia de uso en produccion.
- Riesgo de alucinacion: no aplica en el sentido generativo porque el modelo no produce texto, pero si puede devolver recuperaciones irrelevantes con puntuaciones altas en dominios alejados de los datos de entrenamiento.
- Limitaciones de idioma: no se declara ninguna lista de idiomas soportados; el backbone base es multilingue segun su propia documentacion, pero este ajuste no aporta informacion al respecto.
- Limitaciones de entrada: el audio debe ser mono a 16 kHz en `float32`; las imagenes se tokenizan en torno a 260 tokens. No se documenta la longitud maxima de secuencia.
- Restriccion de precision: el `float16` no es utilizable y produce NaN o Inf, lo que condiciona las opciones de despliegue en hardware con bajo soporte de `bfloat16`.
- Licencia con obligaciones adicionales: la licencia `apache-2.0-with-upstream-dataset-attribution` exige atribuir los datasets de origen (msmarco-bm25, flickr8k, clotho y mteb/scifact), ademas de las condiciones de la licencia del modelo base `google/embeddinggemma-2`. Es imprescindible revisar ambas antes de un uso comercial.
- Caveat de produccion: en recuperacion a gran escala, el late interaction multiplica el coste de almacenamiento y de puntuacion frente a un embedding denso, ya que se guarda un vector por token en lugar de uno por documento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JacobLinCool/embeddinggemma-2-multimodal-late-interaction
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset sentence-transformers/msmarco-bm25: https://huggingface.co/datasets/sentence-transformers/msmarco-bm25
- Dataset jxie/flickr8k: https://huggingface.co/datasets/jxie/flickr8k
- Dataset gijs/clotho: https://huggingface.co/datasets/gijs/clotho
- Dataset mteb/scifact: https://huggingface.co/datasets/mteb/scifact

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su autor o su arquitectura. Los unicos resultados obtenidos fueron paginas de contenido para adultos sin relacion alguna con el modelo, por lo que se han descartado y no se incluyen. No hay papers, blogs, repositorios ni demos adicionales disponibles en la informacion proporcionada.
