# ellyxeo/skin-retouch-gpu

## Resumen

Skin-retouch-gpu es una conversión a LiteRT (el runtime de Google sucesor de TensorFlow Lite) de las redes de retoque de piel para retratos del modelo `damo/cv_unet_skin-retouching`, desarrollado originalmente por Alibaba DAMO Academy bajo el nombre de ABPN. El paquete incluye dos grafos independientes: un generador UNet de 13,4 millones de parámetros que produce una capa de mezcla para suavizado de piel a 512 × 512, y una DetectionUNet de 18,0 millones de parámetros que genera un mapa de probabilidad de imperfecciones a 768 × 768. Ambos grafos están optimizados para ejecutarse íntegramente en el delegado GPU de LiteRT.

El modelo resuelve un problema acotado y específico: el retoque automático de piel en fotografías de retrato dentro de una aplicación de edición (Pixybay). No es un modelo de propósito general ni un modelo de lenguaje: es un par de redes convolucionales de imagen a imagen que operan sobre recortes de rostro. Su relevancia radica en que demuestra un flujo de exportación PyTorch → ONNX → LiteRT con cuantización FP16 en pesos y compatibilidad total con el delegado GPU, lo que permite inferencia en dispositivos móviles o entornos con recursos limitados.

El repositorio ocupa 0,1 GB, se distribuye bajo licencia Apache 2.0 y no incluye la red de inpainting original ni el grafo de segmentación de piel, por lo que el flujo completo de retoque requiere modelos adicionales que el autor no proporciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet convolucional (generador) y DetectionUNet (detector de imperfecciones) |
| Parametros totales | 13,4 M (generador de suavizado) + 18,0 M (detector de imperfecciones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | Pesos FP32 redondeados a precision FP16; computo en FP16 en el delegado GPU |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` comprimido en `.gz` (LiteRT / TensorFlow Lite) |

Especificaciones adicionales de los grafos:

| Fichero | Red | Entrada | Salida | SHA-256 |
|---|---|---|---|---|
| `skin-smooth-512-gpu.tflite.gz` | UNet generator (13,4 M) | `[1, 512, 512, 3]` RGB 0–1 | `[1, 512, 512, 3]` capa de mezcla 0–1 | `c50b14b594f5136bccbf35ff11ea20c075f681ad4d088ecbc24466cdab52b043` |
| `skin-blemish-768-gpu.tflite.gz` | DetectionUNet (18,0 M) | `[1, 768, 768, 3]` RGB 0–1 | `[1, 768, 768, 1]` probabilidad de imperfeccion | `8dce541ec9c75fec40e85433832b4c781b9b7d7f23dfcbc93635bd222fdccfc5` |

## Arquitectura y entrenamiento

La arquitectura subyacente es ABPN (Attribute-Based Progressive Network), el modelo original de Alibaba DAMO Academy para retoque de piel, compuesto por dos redes convolucionales tipo UNet. El generador de suavizado recibe un recorte de rostro a 512 × 512 en RGB normalizado a 0–1 y emite una capa de mezcla que se aplica mediante una fórmula cuadrática sobre la imagen original. El detector de imperfecciones recibe la imagen a 768 × 768 y produce un mapa de probabilidad por píxel. Ambos grafos son NHWC en float32 y utilizan exclusivamente las operaciones CONV_2D, CONCATENATION, MAX_POOL_2D, RESIZE_*, PAD, LEAKY_RELU, LOGISTIC, MUL y SUB, lo que garantiza que el grafo completo se ejecute en el delegado GPU de LiteRT sin caídas a CPU.

La conversión se realizó mediante el pipeline PyTorch → ONNX → LiteRT con onnx2tf 2.6.9. Respecto al modelo original, la normalización de entrada a `[-1, 1]` y la sigmoide del detector están integradas dentro de los grafos, y se eliminó el `F.pad` de tamaño cero del decodificador de la UNet (los tamaños siempre coinciden a 512 × 512). Los pesos se almacenan en FP32 pero redondeados a precisión FP16, ya que el delegado GPU rechaza DEQUANTIZE y computa en FP16 de todos modos; esto reduce aproximadamente a la mitad el tamaño comprimido en gzip. Frente a PyTorch FP32, la conversión alcanza 86 dB de PSNR y una diferencia absoluta máxima de 0,0014, según `skin-retouch-report.json`. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens (no aplica) ni si hubo RLHF/DPO (no aplica a un modelo de imagen).

## Capacidades

- Suavizado de piel en retratos: genera una capa de mezcla que se combina con la imagen original mediante una fórmula cuadrática parametrizada por un grado de intensidad ajustable.
- Detección de imperfecciones cutáneas: produce un mapa de probabilidad por píxel que puede umbralizarse (suave entre 0,35 y 0,5, duro por encima de 0,5) para generar una máscara de imperfecciones.
- Procesamiento de imagen a imagen a resoluciones fijas de 512 × 512 (suavizado) y 768 × 768 (detección).
- Ejecución íntegra en el delegado GPU de LiteRT, sin operaciones que caigan a CPU.
- Compatibilidad con el flujo de trabajo del editor Pixybay.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No incluye visión general, audio ni modo de pensamiento; es un modelo especializado de retoque de piel.

## Casos de uso

- Edición de retratos en aplicaciones móviles: el modelo puede ejecutarse en el delegado GPU de LiteRT en dispositivos móviles para suavizar la piel de un recorte de rostro a 512 × 512, integrándose en un editor de fotos como Pixybay con latencia reducida gracias a la ejecución en GPU.
- Retoque por lotes en servidores sin GPU dedicada: al ser un modelo de 13,4 M de parámetros y 0,1 GB de repositorio, puede procesar lotes de retratos en entornos con recursos limitados, aplicando el suavizado y la detección de imperfecciones de forma secuencial.
- Preprocesado para pipelines de belleza automatizada: el detector de imperfecciones a 768 × 768 genera máscaras que pueden alimentar un modelo de inpainting externo (no incluido) para eliminar manchas y granos antes de la publicación de la imagen.
- Integración en aplicaciones de videollamada o streaming: el suavizado de piel a 512 × 512 puede aplicarse por fotograma sobre el recorte facial detectado, siempre que se disponga de un detector de rostro externo que alimente los recortes.
- Herramientas de edición de fotografía de estudio: el grado de suavizado es ajustable mediante el parámetro `degree` de la fórmula de mezcla, lo que permite al usuario controlar la intensidad del retoque de forma interactiva.
- Investigación y evaluación de conversiones LiteRT: el repositorio sirve como referencia reproducible del pipeline PyTorch → ONNX → LiteRT con cuantización FP16 y verificación de fidelidad (86 dB PSNR, diferencia máxima 0,0014) frente al modelo original en FP32.
- Generación de máscaras de imperfecciones para segmentación cutánea: el mapa de probabilidad del detector puede reutilizarse como entrada para modelos de análisis de piel o de clasificación de lesiones, aunque el grafo de segmentación de piel original no está incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la conversión frente a PyTorch FP32: 86 dB de PSNR y una diferencia absoluta máxima de 0,0014.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 13,4 M y 18,0 M de parámetros en FP16, los pesos ocupan aproximadamente 27 MB y 36 MB respectivamente, por lo que la VRAM necesaria es mínima (del orden de decenas de MB, más el espacio de activaciones para 512 × 512 y 768 × 768).
- GPU recomendadas: el modelo está diseñado para el delegado GPU de LiteRT, orientado a GPUs móviles e integradas; también puede ejecutarse en GPUs de escritorio compatibles con LiteRT.
- Cabe en GPU de consumo: sí, con amplio margen, dado el reducido tamaño de los grafos; cualquier GPU de consumo moderna puede alojar ambos modelos simultáneamente.
- Opciones de despliegue: LiteRT (antes TensorFlow Lite) con delegado GPU; el formato `.tflite.gz` requiere descompresión previa. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ellyxeo/skin-retouch-gpu | 13,4 M + 18,0 M | 512 × 512 y 768 × 768 | LiteRT `.tflite` | Apache 2.0 | Hugging Face |
| damo/cv_unet_skin-retouching (original) | no disponible | no disponible | PyTorch | Apache 2.0 | ModelScope |
| Modelos de inpainting de piel | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables en la información proporcionada, por lo que la comparación se limita a los datos de la tabla anterior.

## Limitaciones y advertencias

- El paquete no incluye la red de inpainting original ni el grafo de segmentación de piel, por lo que el flujo completo de retoque requiere modelos adicionales que el autor no proporciona.
- El modelo original requiere rostros de más de 100 × 100 píxeles; por debajo de ese tamaño los resultados pueden degradarse.
- Las resoluciones de entrada son fijas (512 × 512 para suavizado, 768 × 768 para detección); no se contemplan otras resoluciones en los grafos convertidos.
- La cuantización FP16 introduce una diferencia máxima de 0,0014 frente a PyTorch FP32, aceptable para retoque visual pero no para aplicaciones que requieran precisión numérica exacta.
- No hay información sobre sesgos demográficos, de tono de piel o de género en el entrenamiento original; un modelo de retoque de piel puede comportarse de forma desigual según el tipo de piel.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el suavizado puede eliminar texturas reales de la piel (poros, pecas) si el grado de mezcla es alto.
- Licencia Apache 2.0 permite uso comercial, pero los derechos de autor de los pesos originales pertenecen a Alibaba, Inc. y sus filiales, según indica la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se especifican los idiomas soportados ni metadatos de entrenamiento (dataset, número de imágenes, proceso de optimización), lo que dificulta evaluar su robustez en producción.

## Enlaces

- [Hugging Face: ellyxeo/skin-retouch-gpu](https://huggingface.co/ellyxeo/skin-retouch-gpu)
- [Modelo original: damo/cv_unet_skin-retouching en ModelScope](https://modelscope.cn/models/damo/cv_unet_skin-retouching)
- [onnx2tf 2.6.9](https://github.com/PINTO0309/onnx2tf)
