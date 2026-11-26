# evanalyzer/unet-mitochondria-em

## Resumen

U-Net para segmentación de mitocondrias en imágenes de microscopía electrónica (EM), publicado en Hugging Face por el usuario evanalyzer. Se trata de una conversión de formato del modelo **MitchondriaEMSegmentation2D** de Constantin Pape (EMBL Heidelberg), conocido en bioimage.io como *shivering-raccoon*. El repositorio no contiene pesos reentrenados ni ajustados: los pesos originales se han transferido sin modificar desde el *state dict* de PyTorch a safetensors (f32, aproximadamente 116 MB, 46 tensores).

El modelo resuelve una tarea clásica de bioimage analysis: dada una imagen 2D de EM, predice para cada píxel la probabilidad de pertenecer a una mitocondria (canal 0, primer plano) y de pertenecer a su contorno (canal 1, frontera). Es relevante porque permite ejecutar la inferencia sin dependencia de Python ni PyTorch: la conversión se creó para EVAnalyzer, que carga el fichero safetensors mediante su propia implementación en Rust.

La arquitectura es una U-Net 2D de profundidad 4 con 64 características iniciales y ganancia 2, normalización InstanceNorm y activación final sigmoide. El contexto no es aplicable: es un modelo convolucional puro de segmentación por píxel, sin ventana de tokens ni capacidades generativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net 2D (torch-em `UNet2d`) |
| Parametros totales | no disponible (46 tensores, fichero de ~116 MB en f32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo convolucional de segmentación por píxel) |
| Tipos de cuantizacion | f32 únicamente (no se publican versiones cuantizadas) |
| Idiomas soportados | no aplica (entrada de imagen, no texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (extensión `.evanet`, renombrable a `.safetensors`) |

## Arquitectura y entrenamiento

La red es una U-Net 2D de la librería torch-em con `in_channels=1`, `out_channels=2` (primer plano y contornos), `depth=4`, `initial_features=64`, `gain=2`, normalización InstanceNorm (valor por defecto de torch-em) y activación final sigmoide. La entrada es una imagen EM de un solo canal; altura y anchura deben ser múltiplos de 16 (mínimo 32). El preprocesado requerido es normalización por imagen a media cero y varianza unitaria: `(x - mean) / (std + 1e-6)` sobre todos los píxeles.

Según la documentación original, el modelo se entrenó con torch-em sobre el conjunto de datos VNC: TEM de secciones seriadas del cordón nervioso ventral de *Drosophila*. La configuración de entrenamiento fue pérdida Dice, optimizador Adam, tasa de aprendizaje 1e-4 y 5 épocas de 500 lotes. No se documentan fases de RLHF, DPO ni ajuste adicional. La conversión a safetensors no altera los pesos: se conservan los nombres de tensor de PyTorch y los metadatos de arquitectura en `__metadata__`. La verificación frente a la salida esperada del paquete de bioimage.io sobre la entrada de test (512 × 512, EM de 8 bits) arroja una diferencia máxima de 1,05 × 10⁻⁵ y ningún píxel cambia de lado del umbral 0,5.

## Capacidades

- Segmentación semántica de mitocondrias en imágenes 2D de microscopía electrónica.
- Predicción simultánea de dos canales: probabilidad de primer plano (mitocondria) y probabilidad de contorno.
- Separación de instancias individuales mediante eliminación de contornos y etiquetado de regiones conectadas, o mediante watershed sobre el canal de contornos.
- Inferencia sin Python ni PyTorch mediante la implementación en Rust de EVAnalyzer.
- Carga directa desde cualquier herramienta compatible con safetensors.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general, audio ni modo *thinking*; sus capacidades se limitan a la segmentación de imágenes EM.

## Casos de uso

- Cuantificación de volumen y morfología mitocondrial: tras la segmentación y la extracción de objetos, se pueden medir áreas, perímetros y número de mitocondrias por sección para estudios de biología celular.
- Análisis de imágenes de TEM de secciones seriadas del cordón nervioso ventral de *Drosophila*: es el dominio de entrenamiento y el escenario donde el modelo está validado de forma directa.
- Integración en pipelines de bioimage analysis sin dependencias de Python: EVAnalyzer ejecuta la U-Net en Rust, lo que simplifica el despliegue en entornos de escritorio o servidores ligeros.
- Preetiquetado para anotación manual: las probabilidades de primer plano y contorno sirven como máscara inicial que un annotator revisa y corrige, reduciendo el coste de generar datos de entrenamiento.
- Segmentación por lotes de grandes volúmenes de imágenes EM: al ser una red convolucional pequeña (~116 MB en f32), la inferencia es viable en CPU y en GPU de gama baja para procesar conjuntos extensos.
- Docencia y prototipado en bioimage analysis: sirve como ejemplo reproducible de conversión de pesos PyTorch a safetensors con verificación numérica documentada.
- Comparación de métodos de postproceso de instancias: permite evaluar watershed frente a eliminación de contornos sobre el mismo canal de fronteras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de validación es la comprobación de equivalencia tras la conversión: diferencia máxima de 1,05 × 10⁻⁵ frente a la salida esperada del paquete de bioimage.io y ningún píxel que cambie de lado del umbral 0,5.

## Requisitos de hardware

- VRAM estimada: muy reducida; el fichero de pesos ocupa aproximadamente 116 MB en f32 y la U-Net 2D de profundidad 4 es ligera en activaciones para entradas de 512 × 512.
- GPU recomendadas: cualquier GPU con suficiente memoria para el lote de inferencia; no se especifican modelos concretos en la documentación.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; no se detallan modelos concretos (RTX 4090, etc.) en la información disponible.
- Opciones de despliegue: EVAnalyzer (implementación en Rust, sin Python ni PyTorch), torch-em con PyTorch cargando el safetensors mediante `safetensors.torch.load_file`, o cualquier herramienta que lea safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada/salida | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| evanalyzer/unet-mitochondria-em | U-Net 2D (torch-em) | EM 1 canal / 2 canales de probabilidad | CC-BY-4.0 | safetensors (`.evanet`) | Hugging Face |
| shivering-raccoon (bioimage.io) | U-Net 2D (torch-em) | EM 1 canal / 2 canales de probabilidad | CC-BY-4.0 | PyTorch state dict | bioimage.io |

El modelo de este repositorio es una conversión de formato del modelo original de bioimage.io; los pesos son idénticos y la única diferencia es el contenedor (safetensors frente a *state dict* de PyTorch). No se dispone de información sobre otros modelos comparables de segmentación de mitocondrias en EM en la documentación proporcionada.

## Limitaciones y advertencias

- Dominio de entrenamiento restringido: TEM de secciones seriadas del cordón nervioso ventral de *Drosophila*; imágenes de otros métodos de EM u otros tejidos pueden requerir verificación antes de confiar en los resultados.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en un único conjunto de datos, su generalización fuera de ese dominio no está garantizada.
- Riesgo de falsos positivos y negativos en regiones con bajo contraste o artefactos de imagen; no se publican métricas de rendimiento en dominios externos.
- La separación de instancias requiere un postproceso adicional (eliminación de contornos o watershed); el modelo solo predice probabilidades por píxel.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución a Constantin Pape y a la comunidad de bioimage.io; el repositorio de conversión no está afiliado ni respaldado por ellos.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso en producción por parte de terceros.
- La extensión `.evanet` puede requerir renombrar el fichero a `.safetensors` para herramientas que no reconozcan el formato de EVAnalyzer.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/evanalyzer/unet-mitochondria-em
- Modelo original en bioimage.io (shivering-raccoon): https://bioimage.io/#/?id=shivering-raccoon
- EVAnalyzer: https://github.com/evanalyzer/evanalyzer
- torch-em: https://github.com/constantinpape/torch-em
- safetensors: https://github.com/huggingface/safetensors
- Pape, torch-em, doi: https://doi.org/10.5281/zenodo.5108853
- Ronneberger, Fischer, Brox (2015), U-Net, doi: https://doi.org/10.1007/978-3-319-24574-4_28
- Gerhard et al. (2013), VNC dataset, doi: https://doi.org/10.6084/m9.figshare.856713
