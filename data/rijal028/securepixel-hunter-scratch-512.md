# rijal028/securepixel-hunter-scratch-512

## Resumen

SecurePixel Hunter (identificador `rijal028/securepixel-hunter-scratch-512`) es un clasificador de imágenes binario orientado a la detección forense de imágenes sintéticas generadas por IA frente a imágenes capturadas por sensores ópticos reales. Lo publica el usuario `rijal028` en Hugging Face bajo licencia Apache 2.0 y con `pipeline_tag: image-classification`. No es un modelo generativo ni un modelo de lenguaje: es un cabezal de clasificación visual construido sobre la arquitectura ConvNeXtV2-Tiny, con normalización de respuesta global (Global Response Normalization, GRN).

Su rasgo distintivo es que se ha entrenado íntegramente desde cero, sin preentrenamiento previo ni inicialización con pesos de ImageNet u otro corpus: los pesos se inicializan de forma aleatoria y el modelo aprende únicamente la tarea forense. La entrada es un recorte fijo de 512×512 píxeles sin redimensionado ni interpolación, y el entrenamiento incorpora aumentación dinámica que simula la degradación por compresión JPEG y WebP típica de las redes sociales. El conjunto de entrenamiento se equilibra de forma estricta 1:1 por lote entre imágenes de generadores modernos (Defactify, Imagen/Gemini, Midjourney, SDXL, FLUX) y capturas de sensores CMOS físicos.

El modelo es relevante en el contexto actual de verificación de medios y moderación de contenido, donde la recompresión de las plataformas degrada las huellas forenses de los generadores. Sin embargo, la información publicada es mínima: el repositorio ocupa 0,1 GB, no tiene descargas ni valoraciones, y no se han divulgado resultados de evaluación, matriz de confusión ni métricas sobre conjuntos de test independientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXtV2-Tiny (`convnextv2_tiny`) con Global Response Normalization, cabezal de clasificación de imágenes |
| Parametros totales | No disponible en la model card. La configuración estándar de ConvNeXtV2-Tiny tiene aproximadamente 28,6 M de parámetros (dato de referencia de la arquitectura, no confirmado por el autor); el tamaño del repositorio (0,1 GB) es coherente con pesos en FP32 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica: clasificador de imagen con entrada fija de 512×512 píxeles (recorte sin solapamiento, sin redimensionado ni interpolación) |
| Tipos de cuantizacion | No disponible. El autor indica entrenamiento en FP32 puro; no se publican versiones cuantizadas (FP16, INT8, GGUF) |
| Idiomas soportados | `en`, `id` según los metadatos de la model card (relevante solo para etiquetas y documentación; la tarea es visual) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado. Repositorio de 0,1 GB; se presume `safetensors` o binario de PyTorch, sin confirmar |

## Arquitectura y entrenamiento

La base es ConvNeXtV2-Tiny, una red convolucional pura (no transformer, no MoE, no SSM) que incorpora bloques con Global Response Normalization y conexiones residuales al estilo ConvNeXt. La innovación arquitectónica de ConvNeXtV2 reside en la GRN, que mejora la diversidad de activaciones entre canales y reduce la redundancia de características; en este caso se explota para capturar artefactos de alta frecuencia propios de generadores de imágenes. El modelo termina en un cabezal de clasificación binaria (imagen sintética frente a imagen de sensor real).

El entrenamiento se realizó desde cero, con inicialización aleatoria y sin preentrenamiento (zero pretraining), en precisión FP32 completa. La entrada es un recorte de 512×512 sin reescalado ni interpolación, lo que preserva la huella de alta frecuencia que los redimensionados suelen destruir. La aumentación se aplica en línea (on-the-fly) e incluye degradación por compresión JPEG y WebP simulando la recompresión de redes sociales. El dataset mantiene paridad estricta 1:1 por lote: la clase 1 (IA) procede de generadores modernos (Defactify, Imagen/Gemini, Midjourney, SDXL, FLUX) y la clase 0 (real) de sensores ópticos CMOS físicos identificados como D05–D40. No se especifica el número de imágenes, la resolución original del dataset, la duración del entrenamiento, la función de pérdida, el optimizador ni si hubo ajuste por RLHF o DPO (en un clasificador supervisado no aplicarían).

## Capacidades

- Clasificación binaria de imágenes: distingue entre imagen generada por IA y captura de sensor real, según la partición de clases descrita en la model card.
- Robustez a recompresión: la aumentación con JPEG y WebP busca mantener el rendimiento sobre imágenes descargadas de redes sociales.
- Entrada canónica de 512×512 píxeles sin interpolación, lo que exige recortes previos de ese tamaño exacto.
- Etiquetado de imágenes a nivel de recorte individual (no genera mapas de calor ni localizaciones, según la información publicada).
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No dispone de capacidades multilingües de generación de texto; los idiomas `en` e `id` son metadatos.
- No dispone de modo de razonamiento (thinking mode), visión-lenguaje, audio ni vídeo.
- No es un modelo generativo: no produce texto, código, matemáticas ni respuestas conversacionales.

## Casos de uso

- Moderación de contenido en plataformas UGC: integrado como filtro previo en el pipeline de subida de imágenes para marcar posibles contenidos sintéticos antes de la revisión humana; su entrenamiento con degradación JPEG/WebP encaja con imágenes ya recomprimidas por la plataforma.
- Verificación de medios y fact-checking: señal de triaje para que un periodista priorice qué imágenes investigar, complementada con metadatos EXIF y análisis de procedencia; nunca como prueba concluyente por sí sola.
- Limpieza de datasets de entrenamiento: filtrado de imágenes sintéticas en corpus recolectados de la web antes de entrenar otros modelos, evitando contaminación por contenido generado.
- Tramitación de siniestros en seguros: preanálisis de fotografías de daños enviadas por clientes para detectar imágenes manipuladas o generadas, con decisión final humana.
- Verificación de identidad y alta de clientes: señal auxiliar en procesos KYC cuando se reciben fotografías de documentos o selfies, siempre acompañada de pruebas de vida activas.
- Análisis forense digital y OSINT: clasificación por lotes de grandes volúmenes de imágenes incautadas o recolectadas, generando un listado priorizado para peritaje.
- Comercio electrónico y catálogos: detección de imágenes de producto sintéticas que no corresponden al artículo real, útil en plataformas de segunda mano.
- Publicidad y control de marca: verificación de que los creatividades de terceros no emplean imágenes sintéticas no declaradas en campañas con requisitos de autenticidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye exactitud, precisión, recall, F1, AUC ni matrices de confusión, y tampoco se documentan evaluaciones sobre conjuntos de test independientes o generadores no vistos durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para FP32 (pesos de ~28,6 M de parámetros, aproximadamente 115 MB) más activaciones a 512×512 con lote 1: del orden de 1 a 2 GB en total. Estimación propia, no publicada por el autor.
- VRAM estimada en FP16/BF16: aproximadamente 60 MB de pesos y por debajo de 1 GB con lote 1 (estimación propia; no se distribuyen pesos en FP16).
- VRAM estimada en INT8 (cuantización posterior al entrenamiento, no publicada): alrededor de 30 MB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100, H100). Para lotes grandes, las GPU de datacenter aportan más throughput por la vía del paralelismo de lote.
- Cabe en GPU de consumo: sí, con holgura, incluidas GPU de gama de entrada y muchas iGPU con al menos 4 GB asignados. También es viable la inferencia en CPU para volúmenes moderados.
- Opciones de despliegue: PyTorch nativo, Hugging Face Transformers (`ConvNextV2ForImageClassification`), ONNX Runtime, TensorRT y servidores de inferencia genéricos como Triton. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas orientadas a modelos generativos de lenguaje y este es un clasificador visual.
- Latencia y throughput: no disponible. No se publican cifras de imágenes por segundo ni latencias medidas en ninguna GPU.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada, por lo que no es posible comparar parámetros, contexto, rendimiento, licencia y disponibilidad con cifras concretas. A continuación se comparan enfoques metodológicos, no modelos concretos:

| Criterio | SecurePixel Hunter (desde cero) | Detector con backbone preentrenado y ajuste fino | Detector clásico basado en artefactos forenses |
|---|---|---|---|
| Inicialización | Aleatoria, sin preentrenamiento | Pesos de ImageNet o CLIP | No aplica (reglas y filtros) |
| Datos necesarios | Elevados, al no partir de representaciones preentrenadas | Menores | Muy bajos |
| Capacidad de generalización a generadores nuevos | No documentada | No documentada | Limitada a artefactos conocidos |
| Robustez a recompresión | Aumentación explícita con JPEG y WebP | Depende del ajuste fino | Habitualmente baja |
| Licencia | Apache 2.0 | No disponible | No disponible |
| Métricas publicadas | Ninguna | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay métricas, matrices de confusión ni validación cruzada, por lo que se desconoce la tasa de falsos positivos y falsos negativos en producción.
- Riesgo de generalización limitado: los generadores de la clase IA están fijados a Defactify, Imagen/Gemini, Midjourney, SDXL y FLUX; el comportamiento frente a generadores posteriores o ajustados no está documentado.
- Sesgo potencial por el dataset de la clase real: las cámaras se identifican solo como sensores CMOS D05–D40, sin información sobre marcas, ópticas, condiciones de iluminación, geografía ni demografía de los sujetos. Cualquier desviación respecto a esas condiciones puede degradar el rendimiento.
- Dependencia estricta del preprocesado: la entrada debe ser un recorte de 512×512 sin redimensionado ni interpolación. Aplicar un `resize` convencional destruye parte de la señal forense y probablemente invalida el resultado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos positivos) sobre fotografías auténticas con posprocesado intenso, filtros, HDR o compresión agresiva.
- Robustez adversarial no documentada: no se informa de evaluaciones frente a perturbaciones adversariales, recortes, rotaciones, cambio de escala o conversión a escala de grises.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia, pero no ofrece ninguna garantía ni exención de responsabilidad; el autor no certifica la idoneidad forense del modelo.
- Advertencia de uso forense: un clasificador de este tipo no constituye prueba pericial por sí mismo. Cualquier decisión con consecuencias legales o económicas debe apoyarse en peritaje humano y en múltiples fuentes de evidencia.
- Trazabilidad escasa: el repositorio no incluye paper, informe técnico, código de entrenamiento ni tarjeta de datos. El repositorio tiene 0 descargas y 0 valoraciones, sin validación por parte de la comunidad.
- Anomalía en los metadatos: las fechas de creación y actualización declaradas son del 12 de octubre de 2026, posteriores a la fecha habitual de publicación; conviene verificar la vigencia real del repositorio.
- Idiomas: los metadatos indican `en` e `id`; no hay documentación en castellano ni garantía de mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rijal028/securepixel-hunter-scratch-512
- Repositorio de GitHub: no disponible
- Paper o informe técnico: no disponible
- Demo o espacio de inferencia: no disponible
- Dataset de entrenamiento: no disponible
- No se han encontrado otros enlaces relevantes en la información disponible
