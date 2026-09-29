# dewml/hybrid-dit-176m

## Resumen

hybrid-dit-176m es un modelo de difusion latente texto-a-imagen de 176 millones de parametros (175.640.848 en el denoiser) que genera imagenes de 256×256 píxeles. Lo publica el usuario dewml en Hugging Face bajo licencia MIT y esta entrenado con Dew, la libreria de entrenamiento e inferencia en JAX/Flax de Ashish Kumar (github.com/AshishKumar4/dew). Su interes tecnico no esta en la resolucion ni en la calidad final, sino en la arquitectura: `hybrid_dit` combina bloques de espacio de estados S5 con bloques de atencion en una proporcion 3:1, un planteamiento hibrido poco habitual en difusion texto-a-imagen, donde lo dominante son las UNet convolucionales o los Diffusion Transformers puros.

El modelo condiciona la generacion con un codificador de texto CLIP ViT-L/14 congelado y decodifica los latentes con el VAE de Stable Diffusion, tambien congelado. La difusion usa parametrizacion EDM y el entrenamiento se hizo sobre la mezcla `laion12m_coco` (LAION-Aesthetics 12M con aesthetic score ≥ 6 y MS-COCO 2017) durante 1.350.000 pasos con batch de 128. Los pesos publicados son la media movil exponencial (decay 0,999) de los pesos de entrenamiento.

Es relevante ahora sobre todo como material de investigacion reproducible: es un punto de partida barato (2,0 GB de repositorio, licencia permisiva) para estudiar arquitecturas hibridas SSM-atencion en generacion de imagenes, y cabe en GPUs de consumo. No hay que confundirlo con Hi-DiT (HiDream-ai), un modelo distinto presentado en ECCV 2026 que combina difusion latente y en pixel space; no existe relacion entre ambos mas alla de la coincidencia parcial de nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `hybrid_dit` de Dew: 16 bloques de anchura 768, 12 cabezas de atencion, patch size 2; bloques de espacio de estados S5 y bloques de atencion en proporcion 3:1; orden de escaneo zigzag; fusion espacial 2D |
| Parametros totales | 175.640.848 en el denoiser (el codificador de texto y el VAE son componentes separados y congelados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de difusion texto-a-imagen, sin ventana de contexto de texto |
| Tipos de cuantizacion | no disponible (la model card no documenta versiones cuantizadas) |
| Idiomas soportados | no disponible (no documentado; el condicionamiento usa CLIP ViT-L/14) |
| Licencia | MIT |
| Formato de pesos | no disponible de forma explicita; el repositorio es un directorio de ejecucion de Dew con `run.json` y un checkpoint en `1350000/` (2,0 GB en total) |
| Resolucion | 256×256, denoised como latentes de 32×32×4 |
| Codificador de texto | CLIP ViT-L/14 (`openai/clip-vit-large-patch14`), congelado |
| Autoencoder | VAE de Stable Diffusion (`pcuenq/sd-vae-ft-mse-flax`), congelado |
| Parametrizacion de difusion | EDM |
| Biblioteca | `dew` (JAX/Flax) |
| Tamano del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

El denoiser es un `hybrid_dit` de 16 bloques con anchura 768, 12 cabezas de atencion y patch size 2. La innovacion principal es la mezcla de dos tipos de bloque: bloques de espacio de estados S5 y bloques de atencion en proporcion 3:1. Los SSM aportan coste de computo lineal con la longitud de la secuencia, mientras que la atencion queda reservada para una fraccion menor de las capas. El modelo usa orden de escaneo zigzag y fusion espacial 2D para reconstruir la estructura bidimensional de los latentes, algo necesario cuando se serializa una rejilla 2D a una secuencia. La difusion sigue parametrizacion EDM sobre latentes de 32×32×4.

El codificador de texto es CLIP ViT-L/14 y el autoencoder es el VAE de Stable Diffusion (`pcuenq/sd-vae-ft-mse-flax`); ambos estan congelados durante el entrenamiento, de modo que solo se optimiza el denoiser. El entrenamiento cubre 1.350.000 pasos con batch size 128 sobre `laion12m_coco`, la union de LAION-Aesthetics 12M filtrada con aesthetic score ≥ 6 y MS-COCO 2017. No se menciona RLHF ni DPO, algo esperable en un modelo de difusion. El checkpoint publicado contiene unicamente los pesos en su media movil exponencial (decay 0,999), incluidos los del codificador de texto y el VAE, y no guarda estado del optimizador: sirve para muestrear, no para reanudar el entrenamiento.

## Capacidades

- Generacion de imagenes texto-a-imagen a 256×256 píxeles a partir de una o varias consignas de texto.
- Condicionamiento de texto mediante CLIP ViT-L/14 congelado, con la consiguiente limitacion idiomatica del codificador.
- Muestreo configurable: eleccion de sampler (`DPMSolverMultistep` en el ejemplo oficial), numero de pasos (20 en el ejemplo) y escala de guidance con `CFG(5.0)`.
- Generacion por lotes: la API `TextToImage` acepta una lista de prompts y devuelve un array con forma `[prompts, 256, 256, 3]`.
- Salida en coma flotante en el rango `[-1, 1]`, convertible a píxeles de 8 bits con `dew.artifacts.uint8_pixels`.
- Reproducibilidad mediante semilla (`seed=0` en el ejemplo oficial).
- Inferencia en JAX/Flax con colocacion explicita del dispositivo (`.host()` en el ejemplo).
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso, vision de entrada, audio ni modo de razonamiento explicito: es exclusivamente un generador de imagenes.

## Casos de uso

- Prototipado visual rapido: generar bocetos de 256×256 para moodboards, storyboards o validacion temprana de concepto antes de invertir en un modelo de mayor resolucion. La velocidad y el bajo coste de un denoiser de 176 M lo hacen adecuado para iterar muchas variantes por prompt.
- Investigacion en arquitecturas hibridas SSM-atencion: el modelo permite reproducir y modificar la proporcion 3:1 entre bloques S5 y de atencion, cambiar el orden de escaneo o alterar la fusion espacial 2D, y medir el efecto sobre la calidad de muestreo con un presupuesto de computo pequeno.
- Aumento de datos para pipelines de vision: sintetizar imagenes de 256×256 etiquetadas por prompt para preentrenamiento o aumento de datasets de clasificacion y deteccion, aprovechando la licencia MIT y la reproducibilidad por semilla.
- Docencia y divulgacion de difusion en JAX: al estar construido sobre una libreria abierta con directorio de ejecucion legible (`run.json`, checkpoint), es util para explicar parametrizacion EDM, CFG y samplers en un entorno JAX/Flax real y de tamano manejable.
- Punto de partida para ajuste fino: los pesos del denoiser permiten inicializar experimentos de fine-tuning o de adaptadores de bajo rango sobre dominios concretos, teniendo en cuenta que el checkpoint no incluye estado del optimizador y que el entrenamiento debe reiniciarse.
- Generacion de marcadores de posicion en desarrollo de producto: imagenes de relleno para maquetas de interfaz, pruebas de carga de galerias o validacion de pipelines de almacenamiento y CDN que necesitan imagenes reales de 256×256.
- Pruebas de rendimiento de infraestructura JAX: sirve como carga de trabajo pequena y determinista para medir latencia de compilacion JIT, colocacion en dispositivo y throughput por lote en distintas GPUs.
- Experimentos de sesgo y analisis de datos de entrenamiento: al derivar de LAION-Aesthetics y MS-COCO, es un banco de pruebas util para estudiar como se reflejan los sesgos de los pies de foto web en las imagenes generadas a baja resolucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, Inception Score ni ninguna comparacion cuantitativa, y los resultados de la busqueda web no aportan metricas de este modelo. No se dispone, por tanto, de cifras verificables de calidad, consistencia prompt-imagen ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los parametros publicados, los pesos en precision de 32 bits suman aproximadamente 0,7 GB para el denoiser, 0,5 GB para el codificador de texto CLIP ViT-L/14 y 0,3 GB para el VAE. Con activaciones, buffers de muestreo y lotes pequenos, una estimacion razonable es de 1,5 a 4 GB de VRAM. Es una estimacion derivada del numero de parametros, no un dato publicado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria. Para lotes grandes o entrenamiento, una RTX 3090, RTX 4090, A100 o H100 aceleran el proceso, pero no son necesarias para inferencia unitaria.
- Cabe en GPU de consumo: si, en tarjetas como GTX 1650 (4 GB), RTX 3050, RTX 3060, RTX 4060 o superiores. El tamano del denoiser (176 M) y el del repositorio (2,0 GB) son propios de un modelo que cabe comodamente en equipos de gama media.
- Opciones de despliegue: la via documentada es la libreria `dew` con `TextToImage.from_pretrained` y los samplers que expone (`DPMSolverMultistep`), con `CFG` para el guidance, sobre un runtime JAX/Flax. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni diffusers, ni versiones GGUF. El repositorio es un directorio de ejecucion de Dew (`run.json` mas el checkpoint `1350000/`), no un `safetensors` suelto de diffusers.
- Latencia y throughput: no disponible. La model card solo indica que el ejemplo oficial usa 20 pasos con guidance 5.0, sin cifras de tiempo por imagen ni imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros del denoiser | Resolucion | Condicionamiento | Arquitectura | Licencia |
|---|---|---|---|---|---|
| hybrid-dit-176m | 175,6 M | 256×256 | texto (CLIP ViT-L/14) | hibrida SSM + atencion (3:1) | MIT |
| DiT-XL/2 | 675 M | 256×256 (y 512×512) | etiquetas de clase (ImageNet) | transformer puro (DiT) | CC-BY-NC 4.0 (no comercial) |
| Stable Diffusion 1.5 | aproximadamente 860 M en la UNet, mas VAE y CLIP | 512×512 | texto (CLIP ViT-L/14) | UNet convolucional con atencion cruzada | CreativeML Open RAIL-M |
| SDXL | aproximadamente 2,6 B en la UNet | 1024×1024 | texto (CLIP ViT-L + OpenCLIP ViT-bigG) | UNet con bloques transformer dobles y simples | CreativeML Open RAIL++-M |
| Hi-DiT (HiDream-ai) | no disponible | no disponible | texto | hibrida latente + pixel space | no disponible |

Notas sobre la comparacion: los datos de los modelos alternativos proceden de sus repositorios publicos y deben verificarse antes de citarlos; no se dispone de ninguna metrica de calidad comun que permita comparar el rendimiento real de hybrid-dit-176m con el de estos modelos. DiT-XL/2 esta condicionado por clase y no por texto, por lo que la comparacion solo es valida en coste y arquitectura. Hi-DiT figura aqui unicamente para evitar la confusion de nombres, dado que aparece en los resultados de busqueda y no guarda relacion con este modelo.

## Limitaciones y advertencias

- Resolucion fija de 256×256: el modelo no genera imagenes mayores sin un pipeline de superresolucion externo.
- Sesgos de los datos: se entreno con imagenes web y sus textos alternativos (LAION-Aesthetics 12M y MS-COCO 2017), por lo que reproduce los sesgos de representacion, estereotipos y desequilibrios de ese corpus.
- Artefactos de letterboxing: la model card advierte de que el modelo a veces dibuja las bandas planas blancas o negras tipicas de las imagenes con barras, un artefacto heredado de los datos.
- Alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, objetos incoherentes, texto ilegible y composiciones fisicamente imposibles. No hay filtros de seguridad documentados ni clasificador NSFW en la informacion disponible.
- Idioma: la model card no documenta idiomas soportados. CLIP ViT-L/14 esta entrenado principalmente con texto en ingles, por lo que los prompts en otros idiomas, incluido el castellano, degradan el resultado con probabilidad alta.
- Licencia y componentes: el repositorio se declara MIT, pero los pesos incluyen el VAE de Stable Diffusion y el codificador CLIP, que conservan sus licencias originales. Conviene revisar las condiciones de esos componentes (en particular las variantes RAIL del VAE) antes de un uso comercial.
- Entrenamiento no reanudable: el checkpoint no incluye estado del optimizador. Solo sirve para muestrear; cualquier fine-tuning parte desde cero en cuanto al estado del entrenamiento.
- Ausencia de validacion comunitaria: el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, sin evaluaciones de terceros ni resultados publicados que respalden su calidad.
- Estructura de ficheros especifica: al ser un directorio de ejecucion de Dew con `run.json` y un checkpoint `1350000/`, no es directamente consumible por herramientas que esperan un `safetensors` con convencion diffusers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dewml/hybrid-dit-176m
- Repositorio de Dew (libreria de entrenamiento e inferencia): https://github.com/AshishKumar4/dew
- Codificador de texto CLIP ViT-L/14: https://huggingface.co/openai/clip-vit-large-patch14
- Autoencoder VAE de Stable Diffusion en Flax: https://huggingface.co/pcuenq/sd-vae-ft-mse-flax
- Hi-DiT (HiDream-ai), modelo distinto con nombre parcialmente coincidente: https://github.com/HiDream-ai/Hi-DiT
- No se proporcionan enlaces al paper, a la ficha de dataset ni a demos del modelo `dewml/hybrid-dit-176m` en la informacion disponible.
- Resultados de busqueda no relacionados directamente con este modelo: https://benchlm.ai/, https://modelfit.io/, https://localmodel.run/, https://huggingface.co/
