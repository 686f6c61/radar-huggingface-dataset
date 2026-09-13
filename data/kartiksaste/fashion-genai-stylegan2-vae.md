# KartikSaste/fashion-genai-stylegan2-vae

## Resumen

Fashion GenAI (StyleGAN2 + VAE) es una coleccion de checkpoints de generacion de imagenes de moda publicada por el usuario KartikSaste en HuggingFace. El repositorio combina una StyleGAN2 condicional de 128 px capaz de generar fotografias sinteticas de producto sobre fondo blanco, y dos autoencoders variacionales que aprenden representaciones compactas del mismo dominio: uno con latente espacial y otro con latente global. Todo se entrena desde cero sobre el dataset `GangHitman/fashion-recommendation-images`, compuesto por 44 239 fotografias de producto de comercio electronico con fondo blanco y 142 tipos de articulo (el generador condicional usa 70 clases).

El problema que aborda es la escasez de imagenes de producto etiquetadas para tareas de diseno, aumento de datos y recuperacion visual. Frente a los modelos de difusion texto-a-imagen, esta propuesta es deliberadamente ligera: un GAN de 128 px y dos VAEs de 256 px y 128 px que caben en un unico archivo de checkpoint de 0,4 GB en total y que no requieren prompt textual, sino un identificador categorico de tipo de prenda.

Es relevante sobre todo como pieza de investigacion reproducible: el autor documenta el esquema de entrenamiento, las metricas FID/KID y de reconstruccion, y las limitaciones de forma explicita. No obstante, el modelo esta infraentrenado (7000 pasos frente a los ~25 millones de imagenes de un calendario completo de StyleGAN2), tiene 0 descargas y 0 likes, y no se ha validado por la comunidad, por lo que su uso en produccion es arriesgado sin un reentrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleGAN2 condicional (generador) + autoencoders variacionales (VAE) con latente espacial y global; implementacion en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (modelo generativo de imagenes, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints `.pt` sin variantes cuantizadas) |
| Idiomas soportados | no aplica; el condicionamiento es categorico (nombre de tipo de articulo), no linguistico |
| Licencia | MIT (coincide con la del dataset de origen) |
| Formato de pesos | PyTorch `.pt` (`models/gan_main.pt`, `models/vae_256.pt`, `models/vae_global_128.pt`); cada checkpoint embebe su configuracion y su lista de clases |
| Tamano del repositorio | 0,4 GB |
| Resoluciones de salida | 128 px (GAN), 256 px (VAE espacial), 128 px (VAE global) |
| Tarea declarada en HuggingFace | `unconditional-image-generation` (la model card describe condicionamiento categorico, por lo que la etiqueta es imprecisa) |
| Paso de entrenamiento | 7000 pasos para los tres checkpoints |

## Arquitectura y entrenamiento

El componente generativo es una StyleGAN2 con condicionamiento por proyeccion sobre 70 clases de articulo. Emplea perdida no saturante, regularizacion R1 perezosa (`gamma=1.0`), regularizacion de longitud de camino (path-length) tambien perezosa, mezcla de estilos (style mixing), generador con media movil exponencial (EMA) y aumento adaptativo ADA. Los dos autoencoders comparten el mismo dominio: `vae_256` produce un latente espacial de 4x32x32 (compresion 48x) y `vae_global_128` un latente global de 512 dimensiones (compresion 96x). Su funcion de perdida combina L1, LPIPS, KL y un discriminador PatchGAN adversarial con ponderacion adaptativa al estilo VQGAN.

El entrenamiento se realizo en 8 GPU A100 de 80 GB (Lambda Cloud), con el GAN ocupando 6 GPU y cada autoencoder una GPU en paralelo. Un detalle tecnico destacable es que los gradientes se promedian con un `all-reduce` explicito en lugar de `DistributedDataParallel`, porque las regularizaciones R1 y path-length requieren doble retropropagacion y DDP no la soporta. El remuestreo FIR esta implementado en PyTorch puro, sin kernel CUDA compilado, lo que lo hace aproximadamente 4 veces mas lento que el kernel oficial de NVIDIA. No se emplearon tecnicas de RLHF ni DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Generacion de imagenes sinteticas de producto de moda a 128 px, condicionadas por una de las 70 clases de articulo (`Tshirts`, `Shirts`, etc.).
- Control de fidelidad frente a diversidad mediante truncation trick (valores por debajo de 1.0 sacrifican diversidad a cambio de realismo).
- Interpolacion latente y mezcla de estilos para explorar variaciones continuas entre dos disenos.
- Extraccion de embeddings de imagen con `vae_256` (latente espacial 4x32x32) y `vae_global_128` (vector global de 512 dimensiones), utiles para recuperacion y clustering.
- Reconstruccion de imagenes de entrada con calidad medida (PSNR 27,40 y SSIM 0,9419 en `vae_256`; PSNR 23,96 y SSIM 0,8995 en `vae_global_128`).
- Generacion de lotes reproducibles mediante semilla, con reconstruccion de la arquitectura directamente desde el fichero `.pt`.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso, texto, audio ni vision general; es exclusivamente un modelo generativo de imagenes de un dominio concreto.

## Casos de uso

- Ideacion de diseno de producto: un disenador puede muestrear 8 variantes de una prenda con `class_name` fijo y truncation 0.8 para obtener bocetos base sobre fondo blanco, e interpolar entre dos disenos que funcionen para explorar la transicion.
- Aumento de datos para clasificadores de moda: las imagenes sinteticas etiquetadas por clase permiten ampliar el conjunto de entrenamiento de un clasificador de tipo de articulo, con la precaucion de que el FID de 77,43 indica artefactos visibles que pueden introducir sesgo.
- Prototipos de marketing y catalogos: generacion rapida de imagenes de producto coherentes con el catalogo de origen (fondo blanco, estilo e-commerce) para maquetas de campana antes de disponer de fotografia definitiva.
- Recuperacion visual en un catalogo: usando el embedding de 512 dimensiones de `vae_global_128` se pueden indexar productos y construir un buscador de similitud o un sistema de recomendacion "mas como este", con la ventaja de que el vector ocupa muy poco espacio (compresion 96x).
- Clustering y analisis de surtido: los latentes espaciales de 48x de `vae_256` permiten agrupar articulos por estilo o silueta y detectar huecos en el catalogo.
- Almacenamiento y transmision de baja compresion: el autoencoder sirve como codec de dominio (48x o 96x) para pipelines donde el ancho de banda es limitado, aceptando la perdida medida por PSNR y SSIM.
- Investigacion en representacion de dominio: el par GAN/VAE permite experimentar con decodificacion latente, comparacion de espacios latentes y evaluacion de metricas generativas sin depender de modelos de difusion de gran tamano.
- Aumento de diversidad controlada: el parametro de truncation y el style mixing permiten generar poblaciones de imagenes con diversidad ajustable para estudiar el efecto del sesgo sintetico en modelos posteriores.

## Benchmarks y rendimiento

Metricas de generacion publicadas por el autor (`gan_main`, FID/KID calculados sobre 10 000 imagenes generadas frente a reales):

| Modelo | Truncation | FID | KID | LPIPS-diversity |
|---|---|---|---|---|
| gan_main | 1.0 | 77.43 | 0.0309 | 0.4494 |

Metricas de reconstruccion en el split de validacion:

| Modelo | Compresion | PSNR | SSIM | LPIPS | L1 |
|---|---|---|---|---|---|
| vae_256 | 48.0x | 27.40 | 0.9419 | 0.0504 | 0.0272 |
| vae_global_128 | 96.0x | 23.96 | 0.8995 | 0.0800 | 0.0409 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El autor advierte que el FID esta sesgado por el numero de muestras, por lo que estos valores no deben compararse con cifras medidas con otro tamano de muestra.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion proporcionada. Como referencia, el repositorio completo ocupa 0,4 GB, de modo que los tres checkpoints cargados simultaneamente en fp32 deberian caber holgadamente en cualquier GPU de consumo actual, pero el autor no publica cifras de memoria.
- GPU recomendadas: el entrenamiento se realizo en 8x A100 80 GB, pero la inferencia no requiere ese hardware. No hay recomendaciones oficiales de GPU para despliegue.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM, dado el tamano de los checkpoints y las resoluciones de 128 y 256 px; no hay confirmacion oficial.
- Opciones de despliegue: inferencia nativa en PyTorch mediante las clases `GANSampler` y `VAERunner` del paquete `fashiongen` (el README indica clonar el repositorio y copiar `src/`). No hay integracion documentada con vLLM, llama.cpp, Ollama, TGI ni exportaciones ONNX o TorchScript.
- Latencia y throughput: no disponible. El unico dato de rendimiento es que el remuestreo FIR en PyTorch puro es aproximadamente 4 veces mas lento que el kernel compilado de NVIDIA.

## Comparativa con modelos similares

No se han publicado comparativas numericas de este modelo frente a alternativas en la informacion disponible. La tabla siguiente recoge solo caracteristicas cualitativas de la categoria, marcando como "no disponible" todo dato no confirmado:

| Modelo | Tipo | Condicionamiento | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fashion-genai-stylegan2-vae | StyleGAN2 + VAE | categorico (70 clases) | 128 px / 256 px | MIT | HuggingFace, 0 descargas |
| StyleGAN2-ADA (implementacion de referencia de NVIDIA) | GAN | incondicional o condicional por clase | configurable (hasta 1024 px en sus configuraciones publicas) | no disponible en la informacion proporcionada | repositorio oficial |
| Autoencoders VQGAN genericos | VAE + cuantizacion vectorial + GAN | no disponible | no disponible | no disponible en la informacion proporcionada | repositorios de terceros |
| Modelos de difusion texto-a-imagen | difusion latente | prompt textual | 512 px en adelante | no disponible en la informacion proporcionada | HuggingFace |

Diferencias clave que si se pueden afirmar: frente a un modelo de difusion texto-a-imagen, esta propuesta no acepta prompts en lenguaje natural y se limita a 128/256 px, pero es ordenes de magnitud mas ligera en tamano de checkpoint y no requiere un codificador de texto. Frente a una StyleGAN2 entrenada con un calendario completo, segun el propio autor esta version esta infraentrenada (7000 pasos frente a un equivalente de ~25 millones de imagenes) y produce artefactos.

## Limitaciones y advertencias

- Modelo infraentrenado: el autor reconoce que `gan_main` esta por debajo de un calendario completo de StyleGAN2 y que las muestras presentan artefactos visibles, coherente con un FID de 77,43.
- Resolucion limitada: 128 px para el GAN y 128/256 px para los VAEs; no es apto para activos de resolucion de imprenta.
- Condicionamiento solo categorico: no existe modelo texto-a-imagen entrenado, por lo que no se puede guiar la generacion con descripciones libres.
- Sesgos del catalogo de origen: el modelo refleja la mezcla de producto, el estilismo y la demografia del dataset `GangHitman/fashion-recommendation-images`.
- Personas sinteticas: las figuras humanas generadas son sinteticas y no deben presentarse como modelos reales en ningun contexto comercial o publicitario.
- Riesgo de alucinacion visual: al ser un GAN infraentrenado, puede producir estructuras anatomicas o textiles incoherentes; no hay evaluacion sistematica de este riesgo mas alla de FID, KID y LPIPS.
- Rendimiento de inferencia degradado: el remuestreo FIR en PyTorch puro es aproximadamente 4x mas lento que el kernel CUDA oficial de NVIDIA.
- Licencia: MIT tanto en los pesos como, segun el autor, en el dataset de origen, lo que permite uso comercial; conviene verificar de forma independiente la licencia del dataset antes de explotarlo en produccion.
- Falta de validacion externa: 0 descargas y 0 likes, sin issues ni evaluaciones de terceros; no hay garantia de reproducibilidad mas alla de lo declarado por el autor.
- Incoherencia de metadatos: el pipeline declarado en HuggingFace es `unconditional-image-generation`, mientras que la model card describe un GAN condicional, lo que puede confundir a herramientas automaticas.
- Fechas de publicacion inusuales: los metadatos indican creacion y actualizacion en septiembre de 2026, dato que conviene contrastar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KartikSaste/fashion-genai-stylegan2-vae
- Dataset de entrenamiento: https://huggingface.co/datasets/GangHitman/fashion-recommendation-images
- Repositorio de codigo: el README referencia un clon de `https://github.com/<your-fork>/fashion-genai`, sin URL publica confirmada (no disponible).
- Paper, blog o demo oficial: no disponible.
- La busqueda web realizada no devolvio enlaces relevantes adicionales sobre este modelo.
