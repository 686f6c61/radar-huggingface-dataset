# doang/Jigmo20250912-PaddleOCRv4

## Resumen

Jigmo20250912-PaddleOCRv4 es un modelo de reconocimiento óptico de caracteres (OCR) desarrollado por el usuario doang, especializado en el reconocimiento de caracteres raros y antiguos del este asiático. Se basa en el modelo PaddlePaddle/en_PP-OCRv4_mobile_rec de PaddleOCR, al que se ha sometido a un proceso de ajuste fino (fine-tuning) profundo para adaptarlo a un diccionario de más de 107.000 caracteres, incluyendo caracteres CJK unificados, extensiones de planos superiores (SMP, SIP, TIP) y variantes IVD.

El modelo resuelve un problema específico: el reconocimiento de caracteres poco frecuentes o arcaicos que los modelos OCR convencionales no cubren. Su relevancia actual radica en la digitalización de textos históricos, paleográficos y documentos con tipografía poco común, un área donde los modelos estándar suelen fallar. El vocabulario y la base de entrenamiento provienen del proyecto de fuentes de código abierto Jigmo (versión 20250912), que utiliza el sistema KAGE, Clipper, FontForge y TTX para generar más de 107.000 caracteres.

El modelo está disponible bajo licencia Apache 2.0, soporta cinco idiomas (chino, inglés, japonés, coreano y vietnamita) y se distribuye a través de Hugging Face con un tamaño de repositorio de 0.2 GB. Está diseñado para el pipeline de image-to-text, es decir, recibe imágenes y produce texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaddleOCRv4 mobile recognition (basado en PaddlePaddle/en_PP-OCRv4_mobile_rec) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision OCR, no de texto generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), ingles (en), japones (ja), coreano (ko), vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0.2 GB, probablemente formato Paddle) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de reconocimiento móvil de PaddleOCRv4 (en_PP-OCRv4_mobile_rec), diseñada para ser ligera y eficiente en dispositivos con recursos limitados. El proceso de entrenamiento consistió en un ajuste fino profundo del modelo base, adaptándolo a un espacio de etiquetas de 107.000 caracteres, lo que supone un reto considerable por la enorme dimensionalidad de la salida.

Según la información del autor, el entrenamiento mostró una progresión característica: en las primeras épocas la precisión aumentó gradualmente, alrededor de la época 10 se alcanzó una precisión de validación del 47-53%, y en la época 43 (el mejor punto de guardado) se logró una precisión de validación del 98.82% con una distancia de edición normalizada de 0.9884. No se especifica el número total de épocas ni el tamaño del conjunto de datos de entrenamiento. No hay información sobre técnicas de RLHF, DPO u otras innovaciones más allá del ajuste fino estándar.

## Capacidades

- Reconocimiento de caracteres raros y antiguos: el modelo está especializado en caracteres CJK poco frecuentes, incluyendo extensiones de los planos BMP, SMP, SIP y TIP, así como variantes IVD.
- Reconocimiento de caracteres comunes: al estar basado en PaddleOCRv4, mantiene la capacidad de reconocer caracteres estándar de los cinco idiomas soportados.
- Soporte multilingüe: cubre chino, inglés, japonés, coreano y vietnamita.
- Procesamiento de imágenes: entrada de imágenes y salida de texto (pipeline image-to-text).
- Alta precisión en su dominio: alcanza un 98.82% de precisión en validación para el diccionario de 107.000 caracteres.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente de OCR sin capacidades de lenguaje generativo.

## Casos de uso

- Digitalización de documentos históricos: el modelo puede transcribir manuscritos y textos impresos antiguos que contienen caracteres arcaicos o variantes poco comunes, facilitando la creación de archivos digitales de patrimonio cultural.
- Paleografía asistida por ordenador: investigadores en paleografía pueden usar el modelo para identificar y clasificar caracteres de inscripciones antiguas, acelerando el trabajo de análisis epigráfico.
- Procesamiento de textos religiosos y filosóficos: textos budistas, taoístas o confucianos que contienen caracteres especiales pueden ser digitalizados con alta fidelidad.
- Normalización de variantes de caracteres: el modelo puede ayudar a mapear variantes históricas de caracteres a sus formas estándar o viceversa, útil en estudios lingüísticos y filológicos.
- Indexación de colecciones de museos y bibliotecas: catálogos de colecciones con caracteres poco comunes pueden ser procesados automáticamente para crear metadatos buscables.
- Reconocimiento de caracteres en documentos genealógicos: registros familiares y genealógicos asiáticos que utilizan caracteres tradicionales o variantes regionales pueden ser transcritos automáticamente.

## Benchmarks y rendimiento

El autor proporciona datos de validación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Precisión (acc) en época 10 | 47-53% |
| Precisión (acc) en mejor época (43) | 98.82% |
| Distancia de edición normalizada (norm_edit_dis) | 0.9884 |

No se han publicado resultados de benchmarks comparativos con otros modelos OCR en la información disponible. Los datos presentados son métricas de validación del propio entrenamiento, no evaluaciones independientes en conjuntos de referencia estándar como ICDAR o similar.

## Requisitos de hardware

- Al ser un modelo móvil de PaddleOCRv4, está optimizado para inferencia ligera en CPU y dispositivos con recursos limitados.
- No se especifica VRAM necesaria, pero por su naturaleza móvil debería poder ejecutarse en GPUs de gama baja o incluso en CPU.
- Compatible con el ecosistema PaddleOCR, que incluye herramientas de entrenamiento, inferencia y despliegue en producción.
- Se puede integrar en pipelines de PaddleOCR para detección + reconocimiento de texto completo.
- No hay datos sobre latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información comparativa directa con otros modelos de OCR para caracteres raros. Los modelos comparables en el ámbito de OCR multilingüe serían:

| Modelo | Caracteristicas | Licencia |
|---|---|---|
| PaddleOCRv4 (modelo base) | OCR multilingue estandar, sin soporte para caracteres raros | Apache 2.0 |
| Tesseract | OCR de codigo abierto, soporte limitado para caracteres CJK raros | Apache 2.0 |
| TrOCR | Modelo basado en transformers, buen rendimiento general pero sin especializacion en caracteres raros | MIT |

La principal diferencia de Jigmo20250912-PaddleOCRv4 es su especialización en el diccionario de 107.000 caracteres, lo que le da ventaja en escenarios de paleografía y caracteres poco comunes donde los modelos generalistas fallan.

## Limitaciones y advertencias

- Especialización limitada: el modelo está optimizado para caracteres raros y puede tener un rendimiento inferior al modelo base en texto estándar moderno.
- Datos de entrenamiento limitados: el entrenamiento se basa en el proyecto de fuentes Jigmo, que son tipografías generadas sintéticamente. El rendimiento en texto manuscrito o degradado puede ser inferior al de modelos entrenados con datos naturales.
- Sin evaluación independiente: no hay benchmarks públicos comparativos con otros modelos, por lo que las cifras de precisión deben tomarse con cautela.
- Idiomas cubiertos: aunque declara soporte para cinco idiomas, el foco principal son los caracteres CJK; el rendimiento en inglés o vietnamita puede ser secundario.
- Sin comunidad activa: el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que es un proyecto experimental sin validación externa.
- Formato de pesos no documentado: no se especifica si los pesos están en formato Paddle nativo o si se pueden convertir a otros formatos como ONNX o TensorRT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doang/Jigmo20250912-PaddleOCRv4
- Repositorio de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Documentacion de PaddleOCR: https://www.paddleocr.ai/main/en/index.html
- Lista de modelos de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/model_list.md
