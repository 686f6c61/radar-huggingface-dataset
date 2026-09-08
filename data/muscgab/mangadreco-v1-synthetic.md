# muscgab/MangaDReCo-v1-Synthetic

## Resumen

MangaDReCo-v1-Synthetic es un modelo OCR especializado en el reconocimiento de texto japonés dentro de recortes de viñetas de manga. Lo desarrolla muscgab y forma parte del proyecto MangaDReC/MangaDReCo, cuyo objetivo es ofrecer OCR de manga en tiempo real sobre CUDA y MPS. El modelo no es un LLM: se integra en un pipeline donde un módulo upstream extrae "text crops" de la página y el modelo procesa cada región de texto, realizando detección, orden de lectura, recorte y reconocimiento.

La arquitectura combina componentes de PP-OCRv6 (un detector DB medium y un reconocedor REC small) con un Transformer bidireccional no autorregresivo de 13.6M parámetros que corrige errores del decodificador CTC. El modelo completo tiene 48.1M parámetros y un checkpoint de 201.2 MB. Según el autor, la calidad está en el rango de BaberuOCR y el objetivo de velocidad en CUDA se cumple, pero en MPS el rendimiento queda por debajo de lo esperado, por lo que considera v1 un experimento fallido en el ámbito multiplataforma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 (DB DET medium + REC small) + Transformer bidireccional NAR de corrección |
| Parametros totales | 48.1M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo OCR de imagen a texto, no LLM) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch package (no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El pipeline interno de MangaDReCo procesa un text crop de la siguiente forma: primero pasa por un detector PP-OCRv6 medium DB DET fijado a 224x224; después, un módulo A realiza el postprocesado del detector en GPU, determina el orden de lectura, aplica recorte en perspectiva y gestiona el caso de detección vacía. A continuación, un reconocedor PP-OCRv6 small REC trabaja con altura de 48 px y anchos de 320, 480 o 640, generando una salida CTC. Finalmente, el módulo DReCo toma la evidencia del REC (120 dimensiones) y el top-16 de candidatos por celda CTC, y un Transformer bidireccional NAR de 13.6M parámetros realiza reemplazos restringidos para corregir errores.

El entrenamiento se divide en tres componentes. El detector se entrena con 800K imágenes sintéticas que cubren texto horizontal y vertical, múltiples tracks, ruby, fondos de burbuja e imagen, y negativos sin texto. El reconocedor se entrena con 1.25M tracks sintéticos, aproximadamente un 70% en vertical y un 30% en horizontal, con degradaciones como tramas, desenfoque, compresión, bajo contraste, manchas de tinta, sangrado y recortes. El Transformer corrector B se preentrena con 55M caracteres japoneses semánticos y se entrena con 200,294 bloques visuales sintéticos y 2,972,345 celdas REC, de las cuales 29,995 son celdas erróneas cuyo carácter correcto está dentro del top-16. El autor indica que B solo se entrenó con imágenes sintéticas, sin microajuste con manga real. Los datos privados (imágenes de manga, transcripciones, corpus de limpieza y generadores) no se publican.

## Capacidades

- Reconocimiento OCR de texto japonés en recortes de viñetas de manga, con detección, orden de lectura, recorte y reconocimiento dentro de cada región.
- Corrección no autorregresiva (NAR) de errores del decodificador CTC mediante reemplazos restringidos al top-16 de candidatos del mismo cell.
- Soporte de procesamiento por lotes de 1 a 16 crops, orientado a flujos de tiempo real.
- No es un LLM: no dispone de tool calling, soporte de agentes, razonamiento multi-paso ni generación de texto libre.
- Capacidades multilingües limitadas al japonés.
- Sin soporte de visión general ni audio; su entrada es una imagen de un recorte de texto.

## Casos de uso

- Digitalización de manga: el modelo permite convertir páginas escaneadas en texto editable. Un pipeline upstream extrae los crops de texto y MangaDReCo los reconoce; en una GPU A10 con batch 16 alcanza 167.95 imágenes/s, lo que permite procesar un capítulo en pocos segundos.
- Traducción automática de manga: en flujos de traducción asistida, el OCR alimenta motores de traducción. La baja latencia por batch (41.77 ms con batch 1 en A10) permite integrarlo en herramientas de traducción en tiempo real.
- Indexación y búsqueda de contenido: extraer los diálogos de las viñetas permite construir bases de datos de texto dentro de manga y habilitar búsquedas por frase o personaje.
- Accesibilidad: el texto extraído puede usarse para generar lectores de pantalla o descripciones textuales de viñetas, facilitando el acceso a personas con discapacidad visual.
- Análisis de datasets de investigación: el modelo puede etiquetar automáticamente texto en manga para crear datasets de entrenamiento de OCR o de visión por computador, como complemento a benchmarks como JMangaBench_Mixed.
- Automatización de flujos editoriales: en editoriales, el OCR extrae texto para corregir, re-maquetar o adaptar manga a otros formatos sin transcripción manual.
- Herramientas de fansub y subtitulado: integrado en herramientas de traducción de manga, permite obtener el texto de los bocadillos para generar subtítulos o traducciones de forma asistida.

## Benchmarks y rendimiento

El autor presenta resultados de calidad sobre 8,000 crops de Manga109s estratificados por longitud, con normalización de puntuación y traducción V2.1. Los valores de EM (exact match) y CER (character error rate) son:

| Modelo | EM | CER |
|---|---|---|
| MangaDReCo | 83.275% | 3.480% |
| MangaDReC | 81.750% | 3.690% |
| BaberuOCR | 82.025% | 3.318% |
| MangaOCR | 81.538% | 3.869% |

El autor advierte que MangaOCR se entrenó con datos derivados de Manga109, por lo que existe riesgo de solapamiento entre entrenamiento y evaluación. Las métricas de MangaDReCo y MangaDReC se calculan con la misma función de normalización V2.1 sobre GT y predicciones.

En cuanto a rendimiento en NVIDIA A10, para batches de 1 a 16 crops, los tiempos P50 y throughput de MangaDReCo son:

| Batch | P50 | Throughput |
|---|---:|---:|
| 1 | 41.77 ms | 23.48/s |
| 2 | 40.32 ms | 47.88/s |
| 4 | 42.81 ms | 88.90/s |
| 8 | 57.72 ms | 135.11/s |
| 16 | 92.77 ms | 167.95/s |

En la misma tabla, BaberuOCR obtiene 77.05 ms y 11.46/s con batch 1, y 222.53 ms y 70.23/s con batch 16. HayaiOCR v2.1, a partir de batch 2, obtiene 110.94 ms y 16.74/s con batch 2, y 259.84 ms y 60.35/s con batch 16. En pruebas de throughput máximo offline con 5,120 imágenes, MangaDReC alcanza 216.88/s con batch 128, mientras que MangaDReCo no aparece en esa tabla; BaberuOCR alcanza 182.36/s, HayaiOCR v2.1 154.91/s, MangaOCR 58.40/s y PaddleOCR-VL-For-Manga 0.9B 35.35/s.

## Requisitos de hardware

- VRAM estimada: no especificada por el autor. El checkpoint ocupa 201.2 MB, por lo que en principio cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: NVIDIA A10 (usada en los benchmarks), cualquier GPU CUDA moderna, y Apple Silicon vía MPS (M1 Pro, aunque con rendimiento inferior).
- Cabe en GPU de consumo: sí, dado el tamaño del modelo; una RTX 3060 o superior debería ejecutarlo sin problemas.
- Opciones de despliegue: el modelo se integra como librería Python PyTorch mediante `MangaDReCo.from_pretrained()` y `forward_gpu()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que son herramientas para LLM.
- Latencia y throughput: en A10, MangaDReCo tiene un P50 de 41.77 ms con batch 1 y 92.77 ms con batch 16. En MPS M1 Pro, el P50 con batch 1 es 161.00 ms y con batch 16 es 1002.71 ms, con un throughput máximo de 8.32/s en batch 4.

## Comparativa con modelos similares

| Modelo | Parametros | EM | CER | Latencia batch 1 (A10) | Licencia |
|---|---|---|---:|---:|---:|---|
| MangaDReCo | 48.1M | 83.275% | 3.480% | 41.77 ms | Apache 2.0 |
| MangaDReC | 34.5M | 81.750% | 3.690% | 36.28 ms | Apache 2.0 |
| BaberuOCR | No disponible | 82.025% | 3.318% | 77.05 ms | No disponible |
| HayaiOCR v2.1 | No disponible | No disponible | No disponible | No aplica (batch 2: 110.94 ms) | No disponible |
| MangaOCR | No disponible | 81.538% | 3.869% | No disponible | No disponible |

## Limitaciones y advertencias

- La entrada debe ser un text crop; si se pasa una imagen sin texto, se necesita un gate externo de detección de texto.
- v1 está optimizado para texto normal; letras artísticas, texto fuertemente curvado, logotipos y texto muy pequeño no se reconocen bien.
- El autor declara que en MPS la velocidad no cumple el objetivo: en M1 Pro, MangaDReCo tiene un P50 de 1002.71 ms con batch 16, peor que HayaiOCR v2.1 (949.07 ms).
- Los datos de entrenamiento privados (imágenes de manga, transcripciones, corpus de limpieza, imágenes sintéticas y generadores) no se publican, lo que limita la reproducibilidad.
- El checkpoint se distribuye como paquete PyTorch; la exportación a TorchScript u ONNX está pendiente, lo que puede dificultar la integración en entornos que no sean Python.
- Riesgo de alucinación no aplica en el sentido de un LLM, pero el modelo OCR puede producir errores de reconocimiento, con un CER de 3.48% en el benchmark Manga109s.
- El modelo está entrenado principalmente con manga japonés y puede no generalizar a otros estilos de cómic u otros idiomas.

## Enlaces

- HuggingFace: https://huggingface.co/muscgab/MangaDReCo-v1-Synthetic
- HuggingFace (variante DReC): https://huggingface.co/muscgab/MangaDReC-v1
- ModelScope: https://modelscope.cn/models/muscgab/MangaDReCo-v1-Synthetic
- GitHub del proyecto: https://github.com/muscgab/MangaDReC
- JMangaBench_Mixed: https://github.com/muscgab/JMangaBench_Mixed
