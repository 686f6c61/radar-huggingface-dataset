# fumetodev/PP-OCRv6_medium_det_ONNX

## Resumen

PP-OCRv6_medium_det_ONNX es el detector de texto de la serie PP-OCRv6 de PaddleOCR, exportado al formato ONNX para su uso en entornos de inferencia ligera, como dispositivos móviles o navegadores. Este repositorio concreto, publicado por el usuario fumetodev, contiene los pesos sin modificar del modelo original de PaddlePaddle, con el objetivo de que la aplicación de lectura de manga Fumeto Reader Plus pueda descargar el detector en tiempo de ejecución en lugar de empaquetarlo dentro del APK. El modelo se centra en la localización de líneas de texto en imágenes, especialmente pensado para páginas de manga en japonés, y se complementa con un reconocedor de texto (PP-OCRv6_small_rec_manga_ONNX) para completar el flujo de OCR.

El detector utiliza una arquitectura basada en el backbone LCNetV4 y el cuello de características RepLKFPN, lo que le permite localizar texto en escenarios diversos: texto manuscrito, impreso, rotado, curvo o artístico, en múltiples idiomas. Aunque la model card del autor solo indica japonés como idioma soportado, el modelo base de PaddlePaddle es multilingüe. Su relevancia actual radica en que ofrece una alternativa de detección de texto de alta precisión con un coste computacional reducido, superando según el paper de PP-OCRv6 a modelos de visión-lenguaje de escala de mil millones de parámetros en tareas de detección de texto, con un rango de parámetros que va de 1,5M a 34,5M según la variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de texto basado en LCNetV4 (backbone) + RepLKFPN (neck) |
| Parametros totales | no disponible (el paper de PP-OCRv6 menciona un rango de 1,5M a 34,5M para toda la serie, pero no se especifica el valor exacto para la variante medium) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, procesa imagenes) |
| Tipos de cuantizacion | no disponible (el repositorio no indica cuantizacion; probablemente FP32 o FP16, pero no se confirma) |
| Idiomas soportados | ja (segun la model card del autor; el modelo base de PaddlePaddle soporta multiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

PP-OCRv6_medium_det es el modelo de mayor tamaño dentro de la serie de detección de PP-OCRv6 desarrollada por el equipo PaddleOCR. Su arquitectura combina el backbone LCNetV4, una red convolucional ligera optimizada para eficiencia, con el cuello RepLKFPN, que mejora la fusión de características multiescala para una localización precisa del texto. El entrenamiento sigue la metodología de curado de datos heredada de PP-OCRv5, que prioriza la calidad y diversidad de los datos de entrenamiento. Según el paper de PP-OCRv6, esta nueva arquitectura supera las limitaciones estructurales de los backbones anteriores (HGNetV2 para servidor y LCNetV3 para móvil), logrando un mejor equilibrio entre precisión y coste computacional.

El modelo se exporta a ONNX sin modificaciones, manteniendo los pesos originales de PaddlePaddle. No se aplican técnicas como RLHF o DPO, ya que se trata de un modelo de visión puro para detección de objetos, no de un modelo generativo de lenguaje. La exportación a ONNX permite su ejecución en entornos como ONNX Runtime con el proveedor XNNPACK en Android nativo, o mediante onnxruntime-web en WebAssembly, lo que facilita su despliegue en aplicaciones móviles y web.

## Capacidades

- Detección de líneas de texto en imágenes: localiza regiones de texto y produce mapas de segmentación que luego se agrupan en cajas delimitadoras.
- Soporte para texto en múltiples orientaciones: maneja texto rotado, curvo, manuscrito, impreso y artístico, según la descripción del modelo base.
- Optimizado para contenido de manga: el repositorio del autor está pensado para su uso en la app Fumeto Reader Plus, que procesa páginas de manga japonesas.
- Integración con reconocedor de texto: se empareja con PP-OCRv6_small_rec_manga_ONNX para completar el flujo de OCR (detección + reconocimiento).
- Ejecución en dispositivos con recursos limitados: al ser un modelo ONNX ligero, puede correr en CPU, Android nativo y navegadores mediante WebAssembly.
- No es un modelo generativo: no genera texto, no tiene tool calling, ni capacidades de agente o razonamiento multi-paso.

## Casos de uso

- Digitalización de manga y cómics: el detector localiza los globos de diálogo y las onomatopeyas en páginas escaneadas, permitiendo extraer el texto para su posterior procesamiento o traducción automática.
- Traducción automática de cómics: combinado con un reconocedor y un traductor, el modelo permite traducir páginas de manga en tiempo real, sustituyendo el texto original por el traducido manteniendo la posición de los globos.
- OCR para archivos históricos: aunque está optimizado para manga, su capacidad de detectar texto rotado y curvo lo hace útil para digitalizar documentos antiguos con tipografías no estándar.
- Extracción de texto de capturas de pantalla: en aplicaciones de productividad, puede identificar bloques de texto en imágenes capturadas de pantallas, facilitando su copiado o búsqueda.
- Automatización de procesos de revisión de documentos: en entornos empresariales, el detector puede localizar texto en facturas, formularios o contratos escaneados, sirviendo como primer paso de un pipeline de OCR completo.
- Aplicaciones de accesibilidad: para personas con discapacidad visual, el detector puede identificar texto en imágenes del entorno (carteles, menús) y enviarlo a un sintetizador de voz, aunque requeriría un reconocedor adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de PP-OCRv6 (arxiv.org/html/2606.13108) menciona que el modelo supera a modelos de visión-lenguaje de escala de mil millones de parámetros en tareas de detección de texto, pero no se proporcionan cifras concretas en la documentación del repositorio. Tampoco se incluyen comparativas numéricas con otros detectores en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de detección de imágenes de tamaño medio (probablemente en el rango de decenas de megabytes en ONNX), la VRAM necesaria es mínima, incluso en GPU integradas.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En caso de usar GPU, cualquier GPU moderna con soporte CUDA o ROCm sería suficiente, aunque no es necesario.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo, incluso en las más básicas, y también en dispositivos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (con proveedor XNNPACK para Android, o WebAssembly para navegadores), también puede usarse con PaddleOCR original o con herramientas como OpenCV DNN.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo ligero, se espera una latencia de milisegundos en CPU moderna para imágenes de tamaño típico de página (por ejemplo, 1024x1024 píxeles).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PP-OCRv6_medium_det (este) | no disponible (rango 1,5M-34,5M) | no aplica | no publicado | Apache-2.0 | ONNX en HuggingFace |
| PP-OCRv5_medium_det | no disponible | no aplica | no publicado | Apache-2.0 | PaddleOCR, ONNX |
| PP-OCRv6_small_det | no disponible (menor que medium) | no aplica | no publicado | Apache-2.0 | PaddleOCR, ONNX |

No se dispone de datos comparativos cuantitativos entre estos modelos en la información proporcionada. La comparativa se limita a la arquitectura y al tamaño relativo (medium es mayor que small). Otros detectores de texto como EAST o CRAFT podrían ser alternativas, pero no se han incluido por falta de datos.

## Limitaciones y advertencias

- El modelo solo realiza detección de texto, no reconocimiento; es necesario emparejarlo con un reconocedor (como PP-OCRv6_small_rec_manga_ONNX) para obtener el texto legible.
- La model card del autor indica únicamente japonés como idioma, aunque el modelo base es multilingüe; el rendimiento en otros idiomas no está garantizado en este repositorio concreto.
- Al estar optimizado para manga, puede tener un rendimiento subóptimo en imágenes con texto muy pequeño, denso o con fondos muy texturizados.
- No se han publicado resultados de benchmarks en este repositorio, por lo que no se puede verificar su precisión en comparación con otros detectores.
- El repositorio es un espejo de los pesos originales sin modificaciones; cualquier mejora o ajuste del modelo base debe buscarse en el repositorio oficial de PaddlePaddle.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base y de las dependencias (PaddleOCR, ONNX Runtime) para evitar conflictos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fumetodev/PP-OCRv6_medium_det_ONNX
- Modelo base en HuggingFace: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_det_onnx
- Paper de PP-OCRv6: https://arxiv.org/html/2606.13108
- Repositorio de Fumeto Reader Plus: https://github.com/fumetodev/FumetoReaderPlus
- Mirror en GitHub: https://github.com/oaustegard/PP-OCRv6_medium_det_onnx
- Tutorial de uso (tercero): https://aiindigo.com/tutorials/getting-started-with-pp-ocrv6-medium-recognition-high-speed-text-extraction
