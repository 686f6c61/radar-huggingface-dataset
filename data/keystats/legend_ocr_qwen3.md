# keystats/Legend_ocr_qwen3

## Resumen

Legend_ocr_qwen3 es un modelo publicado en HuggingFace por el usuario keystats, orientado por nomenclatura a tareas de reconocimiento óptico de caracteres (OCR) sobre la arquitectura Qwen3-VL. El repositorio contiene 8.767.123.696 parámetros (unos 8,77 mil millones) en pesos safetensors, con un tamaño total de repositorio de 17,5 GB, coherente con pesos en precisión bf16/fp16. La etiqueta de arquitectura declarada es qwen3_vl y el pipeline es image-text-to-text, es decir, un modelo de visión-lenguaje que acepta imágenes y texto y genera texto.

El problema que aborda es la transcripción y extracción de información desde imágenes de documentos, un caso de uso con demanda creciente en digitalización de archivos, automatización de procesos y extracción estructurada. El interés potencial reside en que combina un modelo de visión-lenguaje de escala media (8B) con un ajuste específico para OCR, lo que en teoría permite desplegarlo en hardware de una sola GPU frente a alternativas de mayor tamaño.

Ahora bien, la información pública disponible es extremadamente limitada: la model card es la plantilla automática de transformers sin ningún campo completado, la licencia no está especificada, los idiomas no se declaran y no hay resultados de evaluación ni documentación de entrenamiento. El repositorio registra 0 descargas y 0 likes, y las fechas de creación y actualización indicadas son 2026-09-23 y 2026-09-23. Todo lo que no figura en la información proporcionada se marca en esta ficha como "no disponible" y no debe interpretarse como confirmado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; la etiqueta del repositorio indica qwen3_vl (familia Qwen3-VL, pipeline image-text-to-text) |
| Parámetros totales | 8.767.123.696 (~8,77 mil millones), según los pesos en safetensors |
| Parámetros activos | no disponible; no se declara que sea MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repositorio | 17,5 GB |
| Pipeline declarado | image-text-to-text |
| Etiquetas | transformers, safetensors, qwen3_vl, image-text-to-text, conversational, arxiv:1910.09700, endpoints_compatible, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-23 / 2026-09-23 |

La etiqueta arxiv:1910.09700 corresponde a la cita del calculador de impacto ambiental (Lacoste et al., 2019) que aparece en la plantilla automática de la model card; no es un paper del modelo.

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, los datos de entrenamiento ni el procedimiento de ajuste. La model card no rellena ningún apartado de "Model Details", "Training Details" ni "Evaluation", y el único dato estructural fiable es la etiqueta qwen3_vl, que sitúa al modelo en la familia Qwen3-VL de visión-lenguaje. Por el número de parámetros (8,77 mil millones) y el tamaño del repositorio, encaja en la escala de los modelos de 8B de esa familia, pero no se puede confirmar qué checkpoint base se utilizó, si hubo ajuste supervisado, DPO, RLHF ni qué dataset de OCR se empleó.

Tampoco se documentan innovaciones técnicas propias: no hay mención a decodificación especulativa, atención lineal, resolución dinámica de imagen, ni a ningún esquema de compresión de tokens visuales. Cualquier afirmación sobre método de entrenamiento, composición del corpus o número de tokens vistos sería especulativa y no se incluye aquí.

## Capacidades

Las capacidades que se listan a continuación se infieren del pipeline declarado (image-text-to-text), de la etiqueta qwen3_vl y del nombre del modelo (Legend_ocr). No están confirmadas por el autor en ninguna sección de la model card.

- Generación de texto condicionada por imagen: entrada de imagen más prompt de texto y salida de texto, propio de un modelo de visión-lenguaje.
- Transcripción de texto en imágenes (OCR), presumiblemente el objetivo principal del ajuste.
- Procesamiento de documentos con estructura: facturas, formularios y tablas, en la medida en que la resolución de imagen y el contexto lo permitan.
- Conversación multiturno: la etiqueta conversational indica compatibilidad con plantillas de chat, aunque no se detalla el formato exacto de prompt.
- Tool calling / function calling: no disponible, no se documenta soporte.
- Modo agente y razonamiento multi-paso: no disponible, no se documenta soporte.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, audio, vídeo): no disponible.

## Casos de uso

- Digitalización masiva de documentos escaneados: el modelo recibiría cada página como imagen y devolvería el texto transcrito, integrándose en un pipeline por lotes donde la ventana de contexto no es crítica porque cada documento se procesa de forma independiente.
- Extracción de campos de facturas y albaranes: OCR más generación de texto permiten obtener número de factura, fecha, emisor e importes directamente desde la imagen, reduciendo el trabajo de plantillas posicionales frágiles.
- Automatización robótica de procesos (RPA) con entrada documental: el texto extraído puede alimentar sistemas de gestión (ERP, CRM) como paso previo a la validación humana.
- Procesamiento de documentación en verificación de identidad (KYC): lectura de documentos de identidad y comprobantes de domicilio, siempre que se resuelvan antes las advertencias de licencia y sesgo indicadas más abajo.
- Accesibilidad: descripción y lectura en voz alta del contenido textual de capturas, fotografías de pizarras o carteles para usuarios con discapacidad visual.
- Archivística y patrimonio digital: transcripción de fondos escaneados con tipografías históricas o degradadas, con revisión humana posterior dado el riesgo de error en caracteres poco frecuentes.
- Extracción de tablas y fórmulas de artículos científicos: conversión de figuras y tablas a texto o estructuras tipo Markdown/JSON para su indexación en buscadores internos.
- Indexación semántica de repositorios de imágenes: OCR como paso previo a generar embeddings de texto que hagan búsqueda sobre corpus visuales.

En todos los casos, al no existir benchmarks ni licencia declarada, deben considerarse hipótesis de uso a validar empíricamente antes de llevarlas a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación cumplimentada y la búsqueda web no aporta métricas de este checkpoint concreto. No se dispone de datos de MMLU, HumanEval, GSM8K, ni de métricas específicas de OCR como precisión por carácter, tasa de error de palabra o edit distance sobre conjuntos como DocVQA u OCRBench.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parámetros y del tamaño del repositorio, no datos publicados por el autor.

- Pesos en bf16/fp16: aproximadamente 17,5 GB (coincide con el tamaño del repositorio). Sumando activaciones, caché KV y el codificador visual, la inferencia en precisión completa requiere del orden de 20-24 GB de VRAM.
- Pesos en 8 bits: en torno a 9 GB; con overhead, un presupuesto realista de 11-13 GB de VRAM.
- Pesos en 4 bits: en torno a 4,5-5 GB; con overhead, 7-9 GB de VRAM, con pérdida de precisión que puede afectar al reconocimiento de caracteres pequeños.
- GPU profesionales: A100 40/80 GB, H100, L40S o A6000 permiten inferencia en bf16 con margen para lotes y contexto amplio.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede ejecutar el modelo en bf16 de forma ajustada y con mucha holgura en 8 bits; tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requieren cuantización a 8 o 4 bits; tarjetas de 8-12 GB solo son viables en 4 bits y con imágenes individuales.
- Opciones de despliegue: la librería declarada es transformers, por lo que la vía directa es Python con transformers y una versión que soporte qwen3_vl. vLLM, TGI, llama.cpp u Ollama requerirían soporte específico de esta arquitectura o la conversión previa a GGUF, que no se publica en el repositorio; no hay confirmación de compatibilidad.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni tiempos por página.

## Comparativa con modelos similares

La información proporcionada no permite una comparativa rigurosa: no hay benchmarks del modelo analizado ni especificaciones verificadas de alternativas. La tabla recoge únicamente lo confirmado.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| keystats/Legend_ocr_qwen3 | 8,77 mil millones (confirmado) | no disponible | no disponible | no disponible | safetensors en HuggingFace, 0 descargas |
| Qwen3-VL (familia base indicada por la etiqueta qwen3_vl) | no disponible | no disponible | no disponible | no disponible | no verificado en la información aportada |
| Otras alternativas de OCR basadas en visión-lenguaje de escala ~7-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de modelos comparables en la información suministrada, por lo que no se puede establecer una comparación de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática sin completar; no hay descripción, instrucciones de uso ni ejemplo de código.
- Licencia no especificada: sin licencia declarada no hay autorización explícita de uso comercial, lo que supone un riesgo legal directo para cualquier integración en producto. Debe consultarse al autor antes de usarlo.
- Idiomas no declarados: no se puede asumir buen rendimiento en castellano ni en ningún otro idioma sin evaluación previa.
- Riesgo de alucinación: en modelos de visión-lenguaje aplicados a OCR es habitual que el modelo "complete" texto ilegible o inventado cuando la imagen es borrosa, hay tablas complejas o tipografías poco comunes. Requiere validación automática y revisión humana en contextos críticos.
- Sesgos no evaluados: no hay ninguna sección de sesgos, riesgos o limitaciones cumplimentada por el autor.
- Sin validación comunitaria: 0 descargas y 0 likes implican que el checkpoint no ha sido probado ni auditado por terceros.
- Contexto y resolución de imagen desconocidos: limita la planificación de pipelines con documentos largos o de alta resolución.
- Dependencia del soporte de qwen3_vl en transformers: puede requerir versiones recientes de la librería y no hay garantía de funcionamiento en otros frameworks sin conversión manual.
- Fechas de publicación atípicas (2026-09-23): conviene verificar la vigencia y el estado real del repositorio antes de integrarlo.
- Trazabilidad nula: no se indica el modelo base exacto, el dataset ni el procedimiento de ajuste, lo que impide reproducir o auditar el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keystats/Legend_ocr_qwen3
- Repositorio similar del mismo autor: https://huggingface.co/keystats/Legend_ocr_v3
- Árbol de ficheros de Legend_ocr_v3: https://huggingface.co/keystats/Legend_ocr_v3/tree/main
- Qwen3 Technical Report (arXiv): https://arxiv.org/abs/2505.09388
- Qwen3 Technical Report (HTML): https://arxiv.org/html/2505.09388v1
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Calculador de impacto ambiental citado en la plantilla: https://mlco2.github.io/impact
- Lacoste et al. (2019), Quantifying the Carbon Emissions of Machine Learning: https://arxiv.org/abs/1910.09700
