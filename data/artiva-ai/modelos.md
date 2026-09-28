# artiva-ai/modelos

## Resumen

`artiva-ai/modelos` no es un modelo de lenguaje, sino un repositorio de conversiones a ONNX de ocho modelos abiertos de procesado de imagen, publicadas por Artiva para su uso en la aplicación web Creative Tools. Los seis ficheros principales cubren restauración de imagen (SCUNet, FBCNN), detección de arañazos en fotografías antiguas (Bringing Old Photos Back to Life), restauración de rostros (GFPGAN v1.4) y eliminación de fondo (BEN2 Base). Los dos ficheros restantes son copias sin modificar de segmentación de personas (MediaPipe Selfie Multiclass) y estimación de profundidad (Depth Anything V2 Small fp16).

El objetivo del repositorio es el despliegue en el dispositivo del usuario mediante `onnxruntime-web` con WebGPU y WASM, de forma que el procesado de imagen ocurra en el navegador sin enviar los ficheros a un servidor. Todas las conversiones se verificaron contra los pesos originales de PyTorch sobre las mismas entradas, y se documentan los cambios aplicados a cada una (entrada fija de 512 × 512, ruido fijo en GFPGAN, sustitución de operaciones en float64 por float32 en BEN2 para permitir la ejecución en WebGPU).

La relevancia del conjunto es de tipo práctico más que algorítmico: no introduce arquitecturas nuevas, sino que empaqueta modelos de restauración y segmentación ya conocidos en un formato ejecutable en navegador. Cada fichero conserva la licencia de su modelo de origen (Apache-2.0 o MIT), con una licencia agregada de tipo "per-file". El repositorio ocupa 1,3 GB en total y no publica métricas de rendimiento ni el recuento de parámetros por archivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Colección de 8 redes neuronales convolucionales independientes de procesado de imagen (no es un único modelo). Familias: Swin-Conv-UNet (SCUNet), red flexible de eliminación de artefactos JPEG con rama de factor de calidad (FBCNN), red de detección de arañazos y restauración (Bringing Old Photos Back to Life), restauración facial con generador tipo StyleGAN2 (GFPGAN v1.4), segmentación (BEN2 Base y MediaPipe Selfie Multiclass) y Depth Anything V2 Small |
| Parámetros totales | no disponible (no se publica el recuento por archivo; el repositorio completo ocupa 1,3 GB) |
| Parámetros activos | no aplica (ningún componente es una arquitectura MoE) |
| Longitud de contexto | no aplica (modelos de visión; la entrada es una imagen, no una secuencia de texto) |
| Tipos de cuantización | fp32 por defecto; `fbcnn_color_512_mixto.onnx` usa convoluciones en float16 con la rama del factor de calidad en float32; `depth_anything_v2_small_fp16.onnx` está en fp16. El resto no declara cuantización |
| Idiomas soportados | no aplica (no procesan texto) |
| Licencia | per-file (`license: other`, `license_name: per-file`, `license_link: LICENSE`). Apache-2.0 para SCUNet, FBCNN, GFPGAN v1.4, MediaPipe Selfie Multiclass y Depth Anything V2 Small; MIT para Bringing Old Photos Back to Life y BEN2 Base |
| Formato de pesos | ONNX (`.onnx`) |
| Resolución de entrada | 512 × 512 fija para SCUNet y FBCNN (la aplicación procesa imágenes grandes por teselado); 256 × 256 para `selfie_multiclass_256x256.onnx`; el resto no especifica |
| Runtime objetivo | `onnxruntime-web` con WebGPU y WASM (ejecución en el navegador); el repositorio también es consumible desde otros enlaces de ONNX Runtime |
| Tamaño del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 |

Relación de ficheros incluidos:

| Fichero | Modelo original | Tarea | Autores | Licencia |
|---|---|---|---|---|
| `scunet_color_real_psnr_512.onnx` | SCUNet (`scunet_color_real_psnr`) | Restauración y eliminación de ruido en imágenes reales | Kai Zhang et al. | Apache-2.0 |
| `fbcnn_color_512.onnx` | FBCNN (color) | Eliminación de artefactos de compresión JPEG | Jiaxi Jiang et al. | Apache-2.0 |
| `fbcnn_color_512_mixto.onnx` | FBCNN (color), precisión mixta | Eliminación de artefactos JPEG | Jiaxi Jiang et al. | Apache-2.0 |
| `rasgunos_old_photos.onnx` | Bringing Old Photos Back to Life | Detección de arañazos en fotografías antiguas | Ziyu Wan et al., Microsoft | MIT |
| `gfpgan_v14.onnx` | GFPGAN v1.4 | Restauración de rostros | Xintao Wang et al., Tencent ARC | Apache-2.0 |
| `ben2_base_web.onnx` | BEN2 Base | Eliminación de fondo y segmentación | Prama LLC | MIT |
| `selfie_multiclass_256x256.onnx` | MediaPipe Selfie Multiclass (copia de seguridad, ONNX de senty-au) | Segmentación de personas | Google / senty-au | Apache-2.0 |
| `depth_anything_v2_small_fp16.onnx` | Depth Anything V2 Small (copia de seguridad, ONNX de onnx-community) | Estimación de profundidad monocular | Depth Anything / onnx-community | Apache-2.0 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es un conjunto de conversiones de pesos de PyTorch a ONNX. Según la model card, todas las exportaciones se comprobaron contra PyTorch sobre las mismas entradas, y los cambios se limitan a lo necesario para la inferencia en navegador. En SCUNet y FBCNN se fija la entrada en 512 × 512 porque la aplicación divide las imágenes grandes en teselas. En `fbcnn_color_512_mixto.onnx` las convoluciones se convierten a float16 mientras la rama que predice el factor de calidad permanece en float32, presumiblemente para no degradar la estimación escalar. En GFPGAN se fijan las entradas de ruido aleatorio, lo que convierte la salida en determinista. En BEN2 se sustituye una operación `Pow` con exponente en float64 por una `Mul`, y se convierten a float32 los casts y constantes que estaban en float64, con el fin de que el grafo sea ejecutable en WebGPU.

Las arquitecturas subyacentes y sus datos de entrenamiento corresponden a los proyectos originales y no se documentan en este repositorio: SCUNet es una red con bloques Swin-Conv orientada a restauración ciega en imágenes reales, FBCNN incorpora una rama de predicción del factor de calidad JPEG, Bringing Old Photos Back to Life emplea un esquema con detección de arañazos y restauración, GFPGAN usa un generador con prior facial y BEN2 es un modelo de segmentación de primer plano. No hay información en el material proporcionado sobre número de tokens o imágenes de entrenamiento, composición del dataset, ni sobre el uso de RLHF, DPO u otras técnicas de alineación (no aplicables en su mayoría a modelos de visión). Tampoco se documentan innovaciones propias de esta conversión más allá de los ajustes de operadores y precisión descritos.

## Capacidades

- Restauración de imágenes con ruido real y degradaciones mixtas mediante SCUNet, con entrada de 512 × 512 y procesado por teselas.
- Eliminación de artefactos de compresión JPEG mediante FBCNN, incluyendo una variante que predice el factor de calidad de compresión.
- Detección de arañazos en fotografías antiguas y apoyo a su restauración, a partir del modelo de Microsoft.
- Restauración de rostros con GFPGAN v1.4, con salida determinista al fijarse las entradas de ruido.
- Eliminación de fondo y segmentación de primer plano con BEN2 Base, adaptado para ejecutarse en WebGPU.
- Segmentación multiclase de personas (pelo, cara, cuerpo, ropa) con MediaPipe Selfie Multiclass a 256 × 256.
- Estimación de profundidad monocular con Depth Anything V2 Small en fp16.
- Ejecución en el dispositivo del cliente: los modelos están pensados para `onnxruntime-web` con WebGPU y WASM, sin backend de inferencia remoto.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, soporte de agentes, capacidades multilingües ni modo de razonamiento, por tratarse de una colección de modelos de visión.

## Casos de uso

- Restauración de fotografías antiguas en una aplicación web: la combinación de `rasgunos_old_photos.onnx` para localizar arañazos y `gfpgan_v14.onnx` para recuperar rostros permite reconstruir imágenes escaneadas de baja calidad manteniendo el procesado en el navegador.
- Limpieza de imágenes digitales con ruido real: SCUNet a 512 × 512 con teselado permite tratar fotografías tomadas con ISO alto o cámaras de móvil antiguas sin subir los originales a un servidor.
- Recuperación de imágenes recomprimidas: FBCNN elimina el bloqueo y el ringing característicos de JPEG, y la variante mixta permite ajustar el equilibrio entre precisión y consumo cuando se ejecuta en WebGPU con precisión reducida.
- Eliminación de fondos para catálogos de comercio electrónico: BEN2 Base genera máscaras de primer plano que se pueden componer con fondos neutros directamente en el cliente, evitando el coste de subida y descarga de imágenes a resolución completa.
- Edición guiada por segmentación: la combinación de MediaPipe Selfie Multiclass (máscaras de pelo, cara, cuerpo y ropa) y Depth Anything V2 Small (mapa de profundidad) permite construir efectos de desenfoque de fondo, sustitución selectiva o retoques por partes.
- Restauración de retratos para impresión o archivo: GFPGAN v1.4, al tener el ruido fijo, ofrece resultados reproducibles, lo que resulta útil cuando se necesita que la misma imagen de entrada produzca siempre la misma salida.
- Procesado por lotes en servidor: los mismos ficheros ONNX se pueden ejecutar con ONNX Runtime nativo para digitalizar archivos fotográficos en lote, reutilizando las conversiones ya validadas contra PyTorch.
- Aplicaciones con requisitos de privacidad: al ejecutarse en el dispositivo, los modelos permiten tratar documentación, imágenes médicas o fotos personales sin que salgan del equipo del usuario.
- Prototipado rápido en web: la disponibilidad en ONNX con WebGPU permite integrar restauración y segmentación en una demo web sin montar infraestructura de GPU en el servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que cada exportación se verificó contra los pesos de PyTorch sobre las mismas entradas, sin publicar métricas de PSNR, SSIM, LPIPS ni comparaciones cuantitativas con otros modelos. Tampoco se ofrecen cifras de latencia, throughput ni consumo de memoria por fichero.

## Requisitos de hardware

- VRAM por fichero: no disponible. No se publican tamaños individuales ni requisitos de memoria; el repositorio completo ocupa 1,3 GB, por lo que cada archivo individual es necesariamente menor que esa cifra.
- Ejecución en el dispositivo: el destino declarado es `onnxruntime-web` con WebGPU y WASM, lo que implica ejecución en el navegador sobre GPU integrada, GPU dedicada de consumo o CPU. No se especifican modelos de GPU concretos.
- GPU recomendadas: no disponible. No hay datos publicados sobre A100, H100, RTX 4090 u otras.
- Idoneidad para GPU de consumo: el diseño apunta a hardware de consumo y a ejecución local en el navegador; para SCUNet y FBCNN la memoria de trabajo depende del tamaño de tesela (512 × 512) y no del tamaño de la imagen completa, ya que esta se divide en fragmentos.
- Opciones de despliegue: `onnxruntime-web` con WebGPU/WASM (escenario principal), ONNX Runtime nativo en Python, C++, C# o Java para procesado en servidor, y conversión a otros runtimes o backends (TensorRT, OpenVINO, Core ML, DirectML) a partir del propio grafo ONNX.
- Opciones no aplicables: vLLM, llama.cpp, Ollama y TGI están orientados a modelos de lenguaje y no aplican a esta colección.
- Latencia y throughput estimados: no disponible. No se publican tiempos de inferencia por tesela ni imágenes por segundo.

## Comparativa con modelos similares

No hay datos numéricos de comparación en la información proporcionada. La única diferencia verificable frente a las alternativas es el formato de distribución y el objetivo de despliegue. La tabla siguiente compara la colección con las rutas alternativas habituales para las mismas tareas.

| Criterio | `artiva-ai/modelos` | Repositorios originales en PyTorch | Alternativas de la misma categoría |
|---|---|---|---|
| Formato | ONNX listo para `onnxruntime-web` | Pesos PyTorch (`.pth`) | Variable; muchos proyectos solo publican PyTorch |
| Ejecución en navegador | Sí, WebGPU y WASM documentados | No directa, requiere exportación propia | Depende del proyecto |
| Tareas cubiertas | Restauración, JPEG, arañazos, rostros, fondo, segmentación, profundidad | Una tarea por repositorio | Una tarea por proyecto (por ejemplo, restauración facial, eliminación de fondo o superresolución) |
| Parámetros | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Contexto | no aplica | no aplica | no aplica |
| Licencia | per-file, Apache-2.0 y MIT | Apache-2.0 o MIT según el proyecto | Variable |
| Modelos comparables citados | no se citan alternativas en la documentación | SCUNet, FBCNN, GFPGAN, BEN2 y los demás proyectos enlazados | no disponible |

En la práctica, la ventaja competitiva de esta colección es la conversión y validación de los grafos para ejecución en cliente, no el rendimiento de los modelos, que es el de sus versiones originales.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: carece de entrada o salida de texto, por lo que no admite generación, razonamiento, tool calling ni uso como agente.
- Ausencia total de benchmarks publicados: no hay PSNR, SSIM, LPIPS ni comparaciones con alternativas, lo que dificulta justificar la elección frente a otras soluciones.
- Licencia agregada de tipo per-file: cada archivo se rige por la licencia de su modelo original (Apache-2.0 o MIT). Es imprescindible revisar el fichero `LICENSE` y las licencias de los repositorios originales antes de un uso comercial o de redistribuir los pesos.
- Los pesos pertenecen a sus autores originales; el repositorio solo aporta la conversión, de modo que cualquier problema de calidad o de sesgo proviene de los modelos de origen.
- Entrada fija de 512 × 512 en SCUNet y FBCNN: las imágenes grandes requieren teselado, lo que puede introducir discontinuidades o costuras visibles entre teselas si no se aplica solapamiento.
- Modificación de grafos en BEN2: la sustitución de `Pow` en float64 por `Mul` y la conversión de constantes a float32 pueden producir diferencias numéricas pequeñas respecto al modelo original, no cuantificadas en la documentación.
- GFPGAN con ruido fijo: la salida es determinista, pero se pierde la variabilidad que el ruido original introducía; además, la restauración facial puede alterar rasgos de identidad, uniformar rasgos o introducir sesgos estéticos, un riesgo conocido en este tipo de modelos.
- Sesgos de los modelos de origen: los sistemas de segmentación y restauración facial pueden comportarse de forma desigual según tono de piel, iluminación, edad o género. No se documenta ninguna evaluación de equidad.
- Idiomas: no aplica, pero conviene señalar que no hay soporte de texto, por lo que no se pueden generar descripciones ni etiquetas a partir de las imágenes.
- Madurez del repositorio: 0 descargas y 0 likes, con creación y última actualización separadas por menos de un minuto, lo que indica que no ha pasado por validación de la comunidad ni por un ciclo de mantenimiento.
- Los dos ficheros de "copia de seguridad" (MediaPipe Selfie Multiclass y Depth Anything V2 Small) son redistribuciones de terceros sin cambios; su mantenimiento depende de los proyectos originales.
- No se documenta el comportamiento con imágenes fuera de distribución (resoluciones extremas, imágenes en escala de grises, CMYK, perfiles de color amplios ni metadatos EXIF orientados).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/artiva-ai/modelos
- Fichero de licencia del repositorio: https://huggingface.co/artiva-ai/modelos/blob/main/LICENSE
- Creative Tools (aplicación que consume los modelos): https://creativetools.online
- Artiva: https://artiva.online
- SCUNet (Kai Zhang et al.): https://github.com/cszn/SCUNet
- FBCNN (Jiaxi Jiang et al.): https://github.com/jiaxi-jiang/FBCNN
- Bringing Old Photos Back to Life (Ziyu Wan et al., Microsoft): https://github.com/microsoft/Bringing-Old-Photos-Back-to-Life
- GFPGAN (Xintao Wang et al., Tencent ARC): https://github.com/TencentARC/GFPGAN
- BEN2 Base (Prama LLC): https://huggingface.co/PramaLLC/BEN2
- MediaPipe Selfie Multiclass (Google): https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter
- Conversión ONNX de MediaPipe Selfie Multiclass (senty-au): https://huggingface.co/senty-au/selfie_multiclass_256x256-ONNX
- Depth Anything V2 (Depth Anything): https://github.com/DepthAnything/Depth-Anything-V2
- Conversión ONNX de Depth Anything V2 Small (onnx-community): https://huggingface.co/onnx-community/depth-anything-v2-small
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
