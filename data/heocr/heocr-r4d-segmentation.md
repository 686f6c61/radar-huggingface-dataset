# HeOCR/heocr-r4d-segmentation

## Resumen

HeOCR R4d es un modelo de segmentación de documentos hebreos modernos desarrollado por HeOCR. Su función concreta es localizar las líneas de texto (baselines y polígonos) y clasificar hasta ocho tipos de regiones en una página: título, cuerpo, sello, firma, pie, margen, identificador y celdas de tabla. No es un modelo de OCR completo, sino la primera etapa de una pipeline de tres modelos (R4d para segmentar, A1 para orden de lectura y R3h para reconocimiento), publicados conjuntamente como registros separados.

El modelo se construye sobre la red de segmentación por defecto de ketos 7.0.2, con una arquitectura convolucional de aproximadamente 5 millones de bytes de pesos (unos 5 MB en safetensors). Las páginas se escalan a 1.800 píxeles de alto y se procesan en color. Se entrenó desde cero exclusivamente con datos sintéticos generados por hocrsyngen sobre siete plantillas, con 1.800 páginas en total.

Su relevancia radica en que cubre un hueco poco atendido: la segmentación de documentos hebreos con tipologías regionales específicas (sellos, firmas, identificadores), algo que las herramientas genéricas de layout analysis no resuelven con precisión. Ahora bien, el propio autor lo presenta como una línea base de investigación: toda su evaluación es sintética y no existe todavía una validación revisada sobre escaneos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentación convolucional de ketos 7.0.2 (Cr/Gn/Lbx/Lby), entrada a 1.800 px de alto, color |
| Parametros totales | no disponible (pesos de 5.056.800 bytes en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (kraken); archivo `heocr-r4d-segmentation.safetensors` |
| Pipeline | image-segmentation |
| Libreria | kraken (probado con kraken / ketos 7.0.2) |
| Tipos de línea | `default`, `stamp` |
| Tipos de región | `title`, `body`, `stamp_area`, `signature_area`, `footer`, `margin`, `identifier_area`, `table_cells` |
| sha256 | `d32cd1a8efe7354445ccfea76551cc9943ca05792c332b5865f9bec985fe7bf7` |

## Arquitectura y entrenamiento

R4d emplea la red de segmentación por defecto de ketos 7.0.2, pasada de forma explícita y sin modificaciones. La definición de capas es `[1,1800,0,3 Cr7,7,64,2,2 Gn32 Cr3,3,128,2,2 Gn32 Cr3,3,128 Gn32 Cr3,3,256 Gn32 Cr3,3,256 Gn32 Lbx32 Lby32 Cr1,1,32 Gn32 Lby32 Lbx32]`, es decir, una pila de convoluciones con normalización de grupo y capas de atención bidireccional en los ejes X e Y (Lbx/Lby). La entrada son páginas en color escaladas a 1.800 píxeles de altura. El modelo produce baselines con tipo de línea, polígonos de línea y polígonos de región tipados.

El entrenamiento es completamente sintético: no se raspó ningún documento real ni se usó texto de terceros. Se generaron 1.800 páginas con hocrsyngen (commit `8698895`, generador `s10c-gold-complete-v1`, semilla 5101) sobre siete plantillas, con polígonos de región procedentes del propio generador. El reparto es de 1.710 páginas de entrenamiento (27.487 líneas) y 90 de validación (1.553 líneas), asignadas por hash a nivel de página. Se usaron dos fuentes con licencia SIL OFL 1.1: Alef (1.286 páginas) y Gveret Levin (514 páginas). El texto proviene del corpus S10b de hocrsyngen (`hebrew_lines_train_v1.txt`, 439.596 bytes). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de segmentación.

## Capacidades

- Segmentación de líneas de texto en páginas de documentos hebreos modernos: calcula baseline y polígono de cada línea.
- Clasificación de líneas con tipo `default` o `stamp` (líneas dentro de sellos).
- Detección y clasificación de ocho tipos de región: título, cuerpo, sello, firma, pie de página, margen, identificador y celdas de tabla.
- Integración en pipeline de tres etapas con A1 (orden de lectura) y R3h (reconocimiento de texto) mediante heocr-engine.
- Funcionamiento en CPU: la pipeline completa se probó de extremo a extremo en CPU con kraken 7.0.2.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o vídeo; es exclusivamente un modelo de segmentación de imagen.

## Casos de uso

- Digitalización de archivos históricos hebreos: R4d localiza líneas y regiones (sellos, firmas, identificadores) en tarjetas de archivo y fichas, permitiendo estructurar el contenido antes de pasarlo a reconocimiento con R3h.
- Procesamiento de formularios y avisos oficiales: la detección de regiones `identifier_area` y `table_cells` permite aislar campos clave y tablas para su extracción posterior, algo útil en la digitalización de trámites administrativos.
- Extracción de datos de libros de contabilidad (ledgers): la clasificación de regiones de cuerpo y tabla facilita la separación de asientos contables del resto de la página antes del OCR.
- Preprocesado para pipelines de OCR en producción: al generar polígonos de línea precisos, reduce errores de reconocimiento en documentos con maquetación densa, siempre que el layout se ajuste a las siete plantillas sintéticas.
- Investigación en segmentación de documentos hebreos: sirve como línea base reproducible (pesos, sha256 y registro de entrenamiento publicados) para comparar futuros modelos sobre datos sintéticos.
- Detección de sellos y firmas en documentos notariales o contractuales: el tipo de línea `stamp` y la región `stamp_area` permiten localizar y aislar estos elementos para verificación manual o automática.
- Ordenación de lectura asistida: combinado con A1, permite reconstruir el orden de lectura de páginas con múltiples regiones tipadas, un paso necesario antes de la traducción o el resumen automático del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que toda la evaluación se realizó sobre páginas sintéticas y que no existe una evaluación revisada sobre escaneos reales. El nombre del archivo de entrenamiento (`best_0.8618.safetensors`) sugiere una métrica de validación de 0,8618, pero no se especifica en la información proporcionada a qué métrica corresponde ni sobre qué conjunto se calculó, por lo que no se presenta como resultado de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos ocupan aproximadamente 5 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer, incluso en tarjetas con 2-4 GB.
- GPU recomendadas: no se especifican; el modelo se probó en CPU. Cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobradamente suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual, y también en CPU.
- Opciones de despliegue: kraken 7.0.2 (segmentación directa) y heocr-engine con extra `[kraken]` para la pipeline completa (R4d + A1 + R3h). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: la pipeline completa (segmentación, orden de lectura y reconocimiento) procesó una página de la semilla 101 en aproximadamente 8 segundos en CPU. No se dispone de cifras de latencia aislada de R4d ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HeOCR R4d | Segmentación de layout (kraken/ketos) | no disponible (~5 MB de pesos) | no aplica | hebreo | Apache-2.0 | Hugging Face + Zenodo |
| Kraken (modelos genéricos de segmentación) | Segmentación de layout | varía según modelo | no aplica | multilingüe | según modelo | Hugging Face / kraken.re |
| Tesseract (layout analysis) | OCR con análisis de layout integrado | no aplica | no aplica | multilingüe (incl. hebreo) | Apache-2.0 | Repositorios oficiales |
| docTR / LayoutParser | Detección de layout y OCR | varía | no aplica | multilingüe | Apache-2.0 / otras | Hugging Face / GitHub |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. La comparación se limita a tipo, licencia y disponibilidad; los modelos genéricos de kraken y Tesseract no ofrecen la tipología regional específica (sello, firma, identificador) que incorpora R4d para hebreo.

## Limitaciones y advertencias

- Evaluación exclusivamente sintética: no existe validación revisada sobre escaneos reales; el autor recomienda comprobar el rendimiento antes de usarlo con documentos reales.
- Layouts fuera de alcance: no está diseñado para maquetaciones distintas de las siete plantillas de hocrsyngen, como libros a varias columnas, periódicos o manuscritos.
- Orden de lectura deficiente con kraken solo: el orden heurístico de kraken funciona mal con R4d; es necesario usar A1 a través de heocr-engine.
- Incompatibilidad de kraken 7.0.2 con A1: kraken no puede ejecutar A1 por sí solo (pasa tipos de línea en lugar de tipos de región y rechaza la combinación; además ignora el orden aprendido, ver mittagessen/kraken#820).
- Fallo intermitente de kraken al salir: kraken 7.0.2 a veces aborta con "recursive_mutex lock failed" después de escribir la salida; reintentar suele resolverlo.
- Sesgos: al entrenarse solo con dos fuentes (Alef y Gveret Levin) y texto sintético, puede generalizar mal a tipografías, calidades de escaneo o estilos caligráficos no representados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede producir segmentaciones incorrectas (líneas o regiones mal delimitadas) en páginas atípicas.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo se presenta como línea base de investigación, no como solución lista para producción.
- Idioma: solo hebreo; no se documenta soporte para otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-r4d-segmentation
- Registro Zenodo de R4d: https://doi.org/10.5281/zenodo.24023070
- Registro Zenodo de A1 (orden de lectura): https://doi.org/10.5281/zenodo.24023072
- Registro Zenodo de R3h (reconocimiento): https://doi.org/10.5281/zenodo.24023074
- Repositorio de código heocr-engine: https://github.com/HeOCR/heocr-engine
- Generador de datos sintéticos hocrsyngen: https://github.com/HeOCR/hocrsyngen
- Kraken: https://kraken.re
- Issue de kraken sobre orden de lectura: https://github.com/mittagessen/kraken/issues/820
