# mandresyandri/cetolog-stagging-ml

## Resumen

`mandresyandri/cetolog-stagging-ml` es un repositorio de pesos de Hugging Face publicado por el usuario mandresyandri como alojamiento provisional para el proyecto Cetolog (colaboración entre Data For Good y Miraceti). No contiene un modelo entrenado por el autor: aloja una copia sin modificaciones de los pesos preentrenados de U-2-Net, una red convolucional con estructura U anidada (nested U-structure) diseñada para detección de objetos salientes (salient object detection) y eliminación de fondo.

El único artefacto relevante es `u2net.pth`, un `state_dict` de PyTorch de 176 290 937 bytes (aproximadamente 168 MiB) con SHA-256 `10025a17f49cd3208afc342b589890e402ee63123d6f2d289a4a0903695cce58`, que debe cargarse con `torch.load(..., weights_only=True)` en el módulo `dorsalmatch/models/u2net.py`. El repositorio ocupa 0,2 GB en total y no incluye pipeline declarado ni idiomas especificados, ya que no se trata de un modelo de lenguaje.

Su relevancia es acotada y de tipo práctico: sirve como espejo reproducible de unos pesos que el proyecto original distribuía mediante un enlace de Google Drive, lo que facilita su descarga automatizada en pipelines. Para cualquier uso en producción conviene remitirse al repositorio upstream `xuebinqin/U-2-Net`, que contiene el código, la documentación y las instrucciones de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-2-Net (nested U-structure, encoder-decoder convolucional con bloques RSU) |
| Parametros totales | no disponible (los pesos ocupan 176 290 937 bytes en fp32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos fp32 en formato PyTorch) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 (según la model card; los pesos originales se publican sin licencia propia y se asumen cubiertos por la del repositorio) |
| Formato de pesos | `state_dict` de PyTorch (`.pth`), cargable con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

U-2-Net es una red totalmente convolucional con una estructura en U anidada: un encoder de once etapas con bloques RSU (Residual U-blocks) que capturan características multiescala sin reducir excesivamente la resolución, seguido de un decoder simétrico con fusión de características de distintas etapas. La salida principal es un mapa de saliencia y el modelo produce además seis salidas auxiliares supervisadas durante el entrenamiento, que actúan como regularización profunda.

Los pesos alojados en este repositorio fueron entrenados por Xuebin Qin y colaboradores sobre DUTS, un conjunto de datos de investigación para detección de objetos salientes, y presentados en el artículo «U2-Net: Going Deeper with Nested U-Structure for Salient Object Detection» (Pattern Recognition, 2020). La model card no aporta detalles adicionales sobre número de tokens, composición del dataset, técnicas de ajuste fino ni innovaciones de inferencia; esa información debe consultarse en el paper y en el repositorio upstream.

## Capacidades

- Segmentación de objetos salientes: genera una máscara de probabilidad por píxel que identifica el objeto o sujeto principal de una imagen.
- Eliminación de fondo: la máscara de saliencia permite recortar el sujeto y sustituir o eliminar el fondo.
- Procesamiento de imágenes RGB de resolución arbitraria (la red es completamente convolucional).
- Salidas multiescala auxiliares durante el entrenamiento, útiles para supervisión y para variantes de postprocesado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente visual.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión-lenguaje, audio ni otras capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- Eliminación de fondo en catálogos de e-commerce: se carga el `state_dict` en el módulo `dorsalmatch/models/u2net.py`, se pasa la imagen del producto y se usa el mapa de saliencia como alfa para generar un PNG con transparencia, sustituyendo servicios de recorte de pago en lotes grandes.
- Segmentación de fauna en proyectos de conservación: el proyecto Cetolog (Data For Good × Miraceti) lo emplea para aislar sujetos en imágenes de campo; el modelo es adecuado porque la detección de saliencia no requiere clases predefinidas y funciona con especies no vistas durante el entrenamiento.
- Preprocesado en pipelines de visión por computador: la máscara generada puede usarse para recortar regiones de interés antes de alimentar un clasificador o detector posterior, reduciendo el ruido de fondo.
- Generación de avatares y retratos: extracción del sujeto en fotos de personas para composición sobre fondos nuevos en aplicaciones de edición rápida.
- Creación de datasets de segmentación: las máscaras de saliencia sirven como pseudoetiquetas para inicializar anotaciones que luego se revisan manualmente.
- Automatización de flujos con descarga reproducible: al estar los pesos en Hugging Face con SHA-256 documentado, se puede verificar la integridad en CI/CD y cachear el artefacto en lugar de depender de un enlace de Google Drive.
- Prototipado académico: referencia rápida para comparar arquitecturas de salient object detection sin tener que reconstruir la descarga original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (MAE, F-measure, IoU) ni comparaciones numéricas; para cifras oficiales debe consultarse el artículo de U-2-Net en *Pattern Recognition* (2020).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan unos 168 MiB, por lo que la inferencia cabe holgadamente en GPUs con 2 GB o más; el consumo real depende de la resolución de entrada y del tamaño de las activaciones intermedias.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060 en adelante); para lotes grandes o resoluciones altas, RTX 3090, RTX 4090, A100 o H100 reducen el tiempo por imagen.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con al menos 2 GB de VRAM; también puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: PyTorch nativo (`torch.load` + el módulo `dorsalmatch/models/u2net.py`), exportación a TorchScript u ONNX para servir con ONNX Runtime, y contenedores con FastAPI o TorchServe. No hay pesos GGUF ni integración con llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cetolog-stagging-ml (U-2-Net) | CNN nested U para salient object detection | no disponible (pesos de 176 MB) | no aplica | Apache 2.0 (según model card) | Hugging Face, copia de pesos |
| U-2-Net original (xuebinqin) | CNN nested U para salient object detection | no disponible | no aplica | Repositorio con código Apache 2.0; pesos sin licencia propia | GitHub + Google Drive |
| Modelos de segmentación tipo SAM | Transformer de segmentación promptable | no disponible | no aplica | no disponible | no disponible |
| Modelos de matting tipo MODNet | CNN para matting de retratos | no disponible | no aplica | no disponible | no disponible |

La comparación se limita a categorías generales porque la información proporcionada no incluye especificaciones numéricas de los modelos alternativos. La diferencia clave frente al repositorio upstream es únicamente el canal de distribución, no el contenido de los pesos.

## Limitaciones y advertencias

- No es un modelo original: es una copia sin modificación de pesos de terceros, por lo que cualquier incidencia debe reportarse en el repositorio upstream.
- La licencia de los pesos es ambigua: la model card indica Apache 2.0 y asume que los pesos quedan cubiertos por la licencia del repositorio, pero los autores originales no publicaron una licencia propia para los pesos. Para uso comercial conviene verificar con los autores upstream.
- Entrenado sobre DUTS, un dataset de investigación; puede degradarse en dominios muy distintos (imágenes médicas, satelitales, ilustraciones) o con sujetos múltiples y solapados.
- Riesgo de máscaras incompletas o con bordes imprecisos en objetos con bajo contraste respecto al fondo o con desenfoque de movimiento.
- No procesa texto: no hay soporte multilingüe ni de contexto conversacional que evaluar.
- Sin pipeline declarado en Hugging Face ni idiomas especificados, la integración requiere cargar el `state_dict` manualmente.
- El repositorio se describe como alojamiento provisional; puede desaparecer o cambiar de ubicación sin aviso.
- Descargas y likes a cero en el momento de la consulta: no hay validación comunitaria que respalde la reproducibilidad más allá del SHA-256 documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mandresyandri/cetolog-stagging-ml
- Repositorio original de U-2-Net: https://github.com/xuebinqin/U-2-Net
- Instrucciones de uso para salient object detection: https://github.com/xuebinqin/U-2-Net#usage-for-salient-object-detection
- Artículo: Xuebin Qin et al., «U2-Net: Going Deeper with Nested U-Structure for Salient Object Detection», *Pattern Recognition*, 2020.
