# dkovalen/markone-ocr-weights

## Resumen

Mark One OCR Weights es un paquete de pesos de inferencia para OCR de manuscritos ucranianos, desarrollado por dkovalen como la solución que obtuvo el segundo puesto en la competición de Kaggle "Handwritten to Data". El repositorio contiene un conjunto de componentes modulares: dos detectores de regiones basados en RT-DETR-L de Ultralytics, un reconocedor TrOCR (VisionEncoderDecoderModel) fine-tuneado sobre el modelo base Kansallisarkisto/cyrillic-htr-model, un selector de geometría basado en LightGBM y los procesadores asociados. El sistema detecta, clasifica y transcribe regiones en documentos manuscritos, distinguiendo entre escritura manual, texto impreso, fórmulas, tablas, anotaciones, imágenes y gráficos.

El modelo está entrenado sobre el dataset abierto RUKOPYS (UkrainianCatholicUniversity/rukopys), con licencia CC-BY-4.0, y se distribuye bajo licencia AGPL-3.0. El pipeline completo, que incluye ensamblaje de detectores, corrección geométrica, decodificación greedy de TrOCR y un paso opcional de corrección de contexto mediante modelos Qwen servidos externamente, está disponible en el repositorio de GitHub del proyecto. El tamaño total del repositorio es de 2,8 GB. Es relevante porque ofrece una solución completa y reproducible para la digitalización de documentos históricos y administrativos en ucraniano, un caso de uso con escasez de herramientas especializadas de código abierto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR-L (detección, dos checkpoints en ensamble) + TrOCR VisionEncoderDecoderModel (reconocimiento) + LightGBM (selector de geometría) |
| Parametros totales | no disponible (no se especifica por componente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TrOCR genera hasta 128 tokens por región; no se documenta la longitud máxima de entrada) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors y .pt sin cuantizar) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (reconocedor y procesador), .pt (detectores RT-DETR), .pkl (warp_selector) |

## Arquitectura y entrenamiento

El sistema combina dos modelos de detección RT-DETR-L de Ultralytics, fine-tuneados por separado y usados en ensamble para localizar y clasificar regiones en la página. El reconocedor es un TrOCR (VisionEncoderDecoderModel) que fue fine-tuneado a partir del modelo Kansallisarkisto/cyrillic-htr-model, especializado en escritura cirílica. El warp_selector es un clasificador LightGBM que decide si aplicar corrección geométrica (conservadora, basada en UVDoc) sobre las regiones detectadas. El entrenamiento se realizó sobre el dataset RUKOPYS, que contiene documentos manuscritos ucranianos; no se documentan el número de tokens, épocas ni técnicas de alineamiento (RLHF/DPO). La innovación principal reside en el pipeline completo: ensamblaje de dos detectores con ventanas deslizantes, filtros por clase, salvaguardas geométricas, mapeo de coordenadas y post-procesamiento final, además de la opción de corrección contextual mediante modelos Qwen servidos externamente.

## Capacidades

- Detección de regiones en documentos: identifica y clasifica siete tipos de región (manuscrita, impresa, fórmula, tabla, anotación, imagen, gráfico).
- Transcripción de texto manuscrito ucraniano mediante TrOCR con decodificación greedy (num_beams=1).
- Corrección geométrica de regiones (enderezado) controlada por un selector LightGBM.
- Corrección contextual opcional de página mediante modelos Qwen (Qwen3.5 9B, Qwen3.6 35B-A3B, Qwen3.5 122B-A10B) servidos externamente, que mejora la coherencia del texto final.
- Soporte de inferencia por lotes y perfiles de baja VRAM a través del pipeline de GitHub (CLI, Docker, aplicación web).
- No soporta tool calling, agentes ni capacidades multimodales generales; está estrictamente orientado a OCR de documentos.

## Casos de uso

- Digitalización de archivos históricos ucranianos: el pipeline detecta y transcribe manuscritos de archivos parroquiales, registros civiles y documentos administrativos, facilitando la creación de colecciones digitales buscables.
- Transcripción de formularios manuscritos: la clasificación de regiones permite separar texto impreso de anotaciones manuscritas, útil para automatizar la entrada de datos en encuestas o solicitudes.
- Indexación de bibliotecas digitales: el reconocedor TrOCR, especializado en cirílico ucraniano, transcribe textos manuscritos para generar metadatos y búsqueda de texto completo en repositorios académicos.
- Investigación genealógica: los registros manuscritos de nacimientos, matrimonios y defunciones pueden convertirse en texto estructurado para bases de datos familiares.
- Asistencia a la investigación histórica y lingüística: los investigadores pueden procesar colecciones de manuscritos para análisis de contenido, estilometría o estudios de variación dialectal.
- Automatización de procesos administrativos en organizaciones ucranianas: documentos internos manuscritos (actas, informes) se transcriben y archivan electrónicamente, reduciendo la intervención manual.
- Pre-procesamiento para otros sistemas de IA: las regiones detectadas y transcritas pueden alimentar sistemas de extracción de información, resumen o traducción automática.

## Benchmarks y rendimiento

La competición "Handwritten to Data" definió una métrica compuesta:

```text
score = 0.15 × Detection F1
      + 0.05 × Classification Accuracy
      + 0.30 × (1 − Region CER)
      + 0.50 × (1 − Page CER)
```

| Configuración del pipeline | Test público (compuesto) |
|---|---:|
| RT-DETR ensamble + geometría + TrOCR greedy | 0.862 |
| + Qwen3.5 9B | 0.896 |
| + Qwen3.6 35B-A3B | 0.905 |
| + Qwen3.5 122B-A10B | 0.914 |

Estos resultados corresponden a la distribución de test de la competición y no están garantizados para colecciones de documentos no relacionadas con RUKOPYS. Los modelos Qwen de las filas mejoradas se sirven por separado y no forman parte de este paquete de pesos.

## Requisitos de hardware

- No se documentan requisitos oficiales de VRAM ni GPU en la información disponible.
- Por el tipo de arquitectura (RT-DETR-L y TrOCR base), se estima que el reconocedor y cada detector por separado pueden ejecutarse en GPUs de consumo con al menos 8 GB de VRAM (p. ej., RTX 3060 o superior), pero esta cifra es una estimación razonable, no un dato verificado.
- El pipeline completo con ensamblaje de dos detectores y la opción de corrección con Qwen requiere más memoria; la documentación de GitHub menciona "perfiles de baja VRAM" sin especificar valores.
- Opciones de despliegue: CLI y Docker disponibles en el repositorio GitHub; también se puede cargar cada componente por separado con Transformers (TrOCR) o Ultralytics (RT-DETR).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otras soluciones de OCR en la información proporcionada. Como referencia cualitativa:

| Modelo | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mark One OCR (este) | Detección RT-DETR + TrOCR + corrección Qwen | ucraniano | AGPL-3.0 | Pesos en HuggingFace, pipeline en GitHub |
| Kansallisarkisto/cyrillic-htr-model | TrOCR (modelo base) | cirílico (incluye ucraniano) | no disponible | HuggingFace |
| EasyOCR | Red convolucional + LSTM (reconocimiento) | múltiples | Apache-2.0 (pesos con licencia propia) | HuggingFace, GitHub |
| Tesseract | Motor OCR tradicional | múltiples | Apache-2.0 | GitHub |

La comparación directa no es posible sin ejecutar los mismos benchmarks sobre los mismos datos. El modelo base Kansallisarkisto/cyrillic-htr-model es el punto de partida del reconocedor, por lo que Mark One añade detección de regiones, clasificación y post-procesamiento sobre esa base.

## Limitaciones y advertencias

- El reconocedor está especializado en escritura manuscrita ucraniana en cirílico; su rendimiento puede ser deficiente en otros idiomas, escrituras, diseños de página o fotografías modernas.
- Las tablas grandes son un punto débil conocido del perfil base solo con TrOCR.
- La transcripción de manuscritos es intrínsecamente ambigua; se requiere revisión humana para usos legales, médicos, de identidad, archivísticos o de alto impacto.
- El paso de corrección con Qwen puede reemplazar una transcripción incorrecta por texto plausible pero igualmente incorrecto, lo que puede enmascarar errores.
- El archivo `warp_selector.pkl` es un pickle de Python; al deserializarlo puede ejecutar código arbitrario. Solo debe cargarse desde este repositorio verificado mediante checksums (SHA256SUMS).
- La licencia AGPL-3.0 es copyleft: si se ofrece el modelo como servicio a través de una red, el código fuente del servicio debe divulgarse bajo la misma licencia.
- Los resultados de la competición no garantizan rendimiento en colecciones de documentos no relacionadas con RUKOPYS.
- El repositorio no está pensado para cargarse con una única llamada `from_pretrained()` ni con el widget de HuggingFace; requiere cargar componentes por separado o usar el pipeline completo de GitHub.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dkovalen/markone-ocr-weights
- Pipeline completo (GitHub): https://github.com/Isterikus/markone-ocr
- Dataset RUKOPYS: https://huggingface.co/datasets/UkrainianCatholicUniversity/rukopys
- Modelo base del reconocedor: https://huggingface.co/Kansallisarkisto/cyrillic-htr-model
- Competición "Handwritten to Data": https://www.kaggle.com/competitions/handwritten-to-data
