# desert-ant-labs/moderator

## Resumen

Moderator es un clasificador de imágenes diseñado para detectar contenido NSFW (desnudez y actividad sexual) antes de su subida a una plataforma. Lo desarrolla Desert Ant Labs, un laboratorio europeo especializado en modelos on-device, y se distribuye en formatos Core ML y ONNX para integrarse en aplicaciones iOS, macOS, navegador, servidor o Python. Su principal valor es la procedencia de los datos de entrenamiento: 100 % limpia, sin scraping de internet, basada en imágenes de dominio público, licencias Creative Commons y generación sintética, lo que elimina riesgos de copyright y facilita su uso comercial.

El modelo emplea un backbone MobileNetV4-Conv-Medium de 8,4 millones de parámetros y una cabecera MLP de dos capas que produce cinco puntuaciones por región (desnudez, acto sexual, pezones visibles, genitales visibles y nalgas visibles). La puntuación NSFW final es el máximo de esas cinco salidas, con un umbral por defecto de 0,5. Está pensado para ejecutarse en dispositivos con recursos limitados: el paquete Core ML fp16 pesa 18 MB y la versión de 6 bits solo 7 MB, mientras que el ONNX fp32 ocupa 35 MB. En la evaluación publicada, con un pipeline de 8 recortes, alcanza una sensibilidad del 87,8 % y una especificidad del 93,7 %, superando a NudeNet en ambas métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4-Conv-Medium (backbone) + MLP de 2 capas (1280→512→5) con normalización L2 |
| Parametros totales | 8,4 M (backbone) + cabecera MLP (total no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | fp16 (Core ML), 6-bit paletizado (Core ML), fp32 (ONNX) |
| Idiomas soportados | No aplica (procesa imagenes, no texto) |
| Licencia | Desert Ant Labs Source-Available License 1.0 (https://license.desertant.com/1.0) |
| Formato de pesos | Core ML mlpackage (fp16 y 6-bit), ONNX (fp32) |

## Arquitectura y entrenamiento

El modelo combina un backbone MobileNetV4-Conv-Medium, licenciado bajo Apache 2.0, con una cabecera de clasificación formada por un MLP de dos capas (1280 unidades a 512, y de 512 a 5) cuyas características se normalizan con L2 antes de la clasificación final. La entrada es una imagen RGB de 384×384 píxeles, preprocesada mediante redimensionado del lado corto a 384, recorte central, escalado a [0,1] y normalización con la media y desviación estándar de ImageNet. La salida son cinco probabilidades independientes para las regiones `nude`, `sex_act`, `nipples_visible`, `genitals_visible` y `buttocks_visible`; la puntuación NSFW global se calcula como el máximo de esas cinco salidas.

El entrenamiento se realizó íntegramente con datos de procedencia controlada: imágenes de dominio público y colecciones de acceso abierto de museos (arte clásico, escultura y fotografía), fotografía histórica y documental, e imágenes fotorrealistas generadas con modelos generativos. No se utilizó scraping de internet ni datasets de origen desconocido. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento es supervisado para clasificación. El modelo no emplea aumento de datos en inferencia, aunque se pueden ejecutar múltiples recortes (crops) para mejorar la sensibilidad.

## Capacidades

- Clasificacion binaria NSFW: devuelve una puntuacion entre 0 y 1 indicando probabilidad de desnudez o actividad sexual, con umbral configurable (por defecto 0,5).
- Deteccion por regiones: proporciona cinco salidas independientes para desnudez, acto sexual, pezones visibles, genitales visibles y nalgas visibles, lo que permite politicas de moderacion granular (por ejemplo, permitir top-less ignorando la salida de pezones).
- Optimizado para on-device: disponible en Core ML para iOS/macOS (fp16 y 6-bit) y en ONNX para Python, Node, navegador o servidor.
- Disenado para pasar imagenes de ropa de bano y lenceria reales, reduciendo falsos positivos frente a otros clasificadores.
- Soporte para multiples recortes en inferencia: 1, 4 u 8 crops para ajustar el equilibrio entre sensibilidad y especificidad segun el caso de uso.
- Compatible con pipelines de moderacion en tiempo real: una sola pasada por imagen en el modo mas rapido, adecuado para video.

## Casos de uso

- Moderacion de contenido en apps de intercambio de fotos: el modelo puede ejecutarse en el dispositivo antes de la subida, bloqueando imagenes NSFW sin enviarlas al servidor, lo que reduce costes de ancho de banda y protege la privacidad del usuario.
- Filtros de subida en plataformas de redes sociales: integrado como paso previo al almacenamiento, permite rechazar automaticamente contenido que viole las politicas de desnudez, con la opcion de usar el modo de 8 crops para maximizar la deteccion.
- Verificacion de contenido en servicios de almacenamiento en la nube: escaneo de imagenes subidas por usuarios para detectar material sexual no consentido, usando la salida por regiones para aplicar politicas especificas por pais.
- Moderacion de comunidades y foros con contenido generado por usuarios: el modelo puede clasificar imagenes en tiempo real y ocultarlas hasta revision humana, gracias a su baja latencia en CPU o GPU integrada.
- Cumplimiento normativo en plataformas de venta de segunda mano: deteccion de anuncios con fotos inapropiadas (por ejemplo, ropa interior usada) mediante la puntuacion NSFW y el umbral ajustable para reducir falsos positivos en categorias legitimas.
- Analisis de contenido en aplicaciones de citas: filtrado de fotos de perfil que contengan desnudez o actividad sexual, usando el modo de 1 crop para mantener la fluidez en la interfaz movil.

## Benchmarks y rendimiento

La evaluacion publicada usa un conjunto de 464 imagenes (75 % seguras, 25 % NSFW) y el pipeline de 8 recortes con umbral 0,5. Los resultados comparados con NudeNet son:

| Metrica | Moderator | NudeNet |
|---|---|---|
| Recall (detecta NSFW) | 87,8 % | 82,6 % |
| Especificidad (deja pasar SFW) | 93,7 % | 87,1 % |
| Tasa de falsos bloqueos (SFW marcadas) | 6,3 % | 12,9 % |

Ademas, la model card proporciona el rendimiento segun el numero de recortes por imagen:

| Crops por imagen | Recall | Especificidad |
|---|---:|---:|
| 1 (centro) | 74 % | 97 % |
| 4 (tiles multiescala) | 84 % | 95 % |
| 8 (tiles multiescala + volteos) | 88 % | 94 % |

No se han publicado resultados en otros benchmarks estandar (MMLU, ImageNet, etc.) porque el modelo es especifico para moderacion de contenido.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en cualquier formato; el modelo es extremadamente ligero (8,4 M de parametros).
- GPU recomendadas: cualquier GPU moderna, incluidas integradas (Apple Silicon, Intel Iris, AMD iGPU) y dedicadas (RTX 2060 o superior). Tambien funciona en CPU.
- Dispositivos moviles: compatible con iPhone/iPad via Core ML (incluye Neural Engine) y con Android via ONNX Runtime.
- Opciones de despliegue: Core ML en Swift (iOS/macOS), ONNX Runtime en Python, Node.js y navegador (WebAssembly). No se menciona soporte explicito para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: no se proporcionan cifras exactas, pero el modo de 1 crop esta disenado para video en tiempo real; el modo de 8 crops es recomendado para imagenes individuales donde se prioriza la recall.

## Comparativa con modelos similares

La unica comparativa publicada es con NudeNet, un clasificador NSFW clasico. No se dispone de datos de otros modelos como Yahoo Open NSFW o modelos comerciales.

| Modelo | Parametros | Formato | Recall | Especificidad | Licencia |
|---|---|---|---|---|---|
| Moderator | 8,4 M + cabecera | Core ML, ONNX | 87,8 % | 93,7 % | Source-available (uso comercial gratuito para la mayoria de apps) |
| NudeNet | No especificado (mas pesado) | TensorFlow, ONNX | 82,6 % | 87,1 % | MIT (codigo), pero los pesos pueden tener restricciones |

Moderator supera a NudeNet en recall y especificidad, y reduce a la mitad la tasa de falsos bloqueos. Su ventaja adicional es la procedencia limpia de los datos de entrenamiento, que evita problemas de licencias en productos comerciales.

## Limitaciones y advertencias

- El modelo es exclusivamente para contenido adulto; no esta entrenado ni validado para detectar menores en imagenes, y su corpus excluye deliberadamente ese tipo de contenido.
- La precision disminuye en imagenes complejas: escenas concurridas, primeros planos extremos, poca luz o baja resolucion.
- No cubre anime/hentai ni contenido fuertemente censurado (por ejemplo, con mosaicos); esta entrenado solo con fotorrealismo.
- Es una herramienta de moderacion, no una determinacion legal; cualquier decision critica debe incluir revision humana.
- La licencia es "source-available", no open source estandar; aunque se describe como gratuita para la mayoria de aplicaciones, es necesario revisar los terminos completos en https://license.desertant.com/1.0 para usos comerciales especificos.
- No se han publicado detalles sobre el volumen exacto de datos de entrenamiento ni la proporcion de imagenes sinteticas frente a reales.
- El modelo no acepta texto ni otros tipos de entrada; solo imagenes de 384×384 píxeles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/moderator
- Organizacion en Hugging Face: https://huggingface.co/desert-ant-labs
- Sitio web del modelo: https://desertant.com/models/moderator/
- Sitio web de Desert Ant Labs: https://desertant.com/
- GitHub de Desert Ant Labs: https://github.com/Desert-Ant-Labs
- Repositorio del SDK Swift: https://github.com/Desert-Ant-Labs/moderator-swift
- Licencia: https://license.desertant.com/1.0
