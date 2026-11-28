# datpq91/ppocrv6-bctc-v1.0.3_2

## Resumen

ppocrv6-bctc-v1.0.3_2 es un modelo de reconocimiento óptico de caracteres (OCR) especializado en líneas de texto recortadas de informes financieros en vietnamita. Lo publica el usuario datpq91 en Hugging Face y se distribuye como un ajuste fino de PP-OCRv6, la familia de modelos OCR de PaddleOCR, empaquetado para su uso con el ecosistema PaddlePaddle. El modelo resuelve un problema acotado pero crítico: la transcripción fiable de recortes de línea en documentos financieros, donde la precisión exacta y la tasa de error de caracteres son determinantes para pipelines contables.

La relevancia del modelo es doble. Por un lado, el ajuste fino eleva la precisión exacta del 46,1 % del baseline al 90,7 % en el conjunto de test "current", y reduce el CER del 9,31 % al 0,47 %, un salto de más de un orden de magnitud en la tasa de error de caracteres. Por otro, el autor documenta explícitamente el proceso de selección de checkpoint sobre validación (sin selección basada en test) y publica huellas SHA-256 del dataset y de los pesos, lo que facilita la reproducibilidad.

El repositorio ocupa 0,3 GB e incluye pesos, vocabulario, configuración de preprocesado y límites de generación como parte indivisible del modelo. El modelo reconoce líneas recortadas, no páginas completas ni estructura de tablas, y está entrenado sobre un único idioma, el vietnamita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 (familia PaddleOCR, reconocimiento de texto) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de reconocimiento de línea, no generativo de contexto largo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PaddlePaddle (checkpoint de entrenamiento en `training_checkpoint/`) |
| Entrada | imagen de línea de texto recortada |
| Salida | texto transcrito |
| Tamaño del repositorio | 0,3 GB |
| Dataset de entrenamiento | datpq91/bctc-ocr-v1.0.3_2 |
| Fingerprint del dataset | `9beb42d0f9b8f00357c36a901272d90f6e41a5fc12be5ba9ef017bb51c20a8fc` |
| SHA-256 del checkpoint | `a5d913e07f5d7da0ec170bd83a99daf13a39635ea882e4528cb71b73f45739d4` |

## Arquitectura y entrenamiento

El modelo se basa en PP-OCRv6, la arquitectura de reconocimiento de texto de PaddleOCR, diseñada para tareas de image-to-text sobre recortes de línea. El autor lo describe como un ajuste fino de pesos seleccionados por validación, sin selección de checkpoint basada en test, lo que mitiga el sesgo de optimización sobre el conjunto de evaluación. El repositorio incluye el vocabulario, el preprocesado y los límites de generación como componentes inseparables del modelo; el autor advierte explícitamente que deben conservarse los archivos empaquetados.

El entrenamiento se realizó sobre el dataset datpq91/bctc-ocr-v1.0.3_2, orientado a informes financieros vietnamitas. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos OCR). El directorio `training_checkpoint/` contiene los mejores pesos y la configuración de entrenamiento resuelta, y puede inicializar otro ajuste fino, aunque no incluye el estado del optimizador, por lo que no permite reanudar el entrenamiento exactamente.

## Capacidades

- Reconocimiento de texto en líneas recortadas de imágenes, con salida de transcripción directa.
- Especialización en documentos financieros en vietnamita, incluyendo terminología contable y numérica.
- Integración con la CLI de PaddleOCR mediante `paddleocr text_recognition --model_dir ... -i crop.jpg`.
- Carga de pesos mediante `snapshot_download` de `huggingface_hub`.
- Reutilización de los pesos como inicialización para nuevos ajustes finos.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No procesa páginas completas ni reconstruye estructura de tablas; el autor lo indica explícitamente.
- Multilingüismo limitado al vietnamita; no hay soporte declarado para otros idiomas.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá del image-to-text OCR.

## Casos de uso

- Digitalización de extractos financieros: el modelo transcribe recortes de línea de informes contables en vietnamita con una precisión exacta del 90,7 % y un CER del 0,47 %, adecuado para pipelines de extracción de importes y conceptos.
- Automatización de contabilidad: integrado en un flujo que segmenta líneas de un PDF y las envía al modelo, permite poblar libros contables con revisión humana sobre los casos de baja confianza.
- Extracción de datos para auditoría: la baja tasa de error de caracteres reduce el volumen de correcciones manuales en la revisión de documentos financieros.
- Procesamiento por lotes con PaddleOCR: la CLI permite ejecutar el modelo sobre directorios de recortes, encajando en pipelines ETL existentes basados en PaddlePaddle.
- Ajuste fino adicional: los pesos de `training_checkpoint/` sirven para inicializar modelos sobre nuevos dominios financieros o variantes de formato.
- Validación de calidad documental: comparar la transcripción del modelo con el texto nativo de PDFs generados digitalmente para detectar discrepancias en documentos escaneados.
- Prototipado rápido en investigación OCR: la licencia Apache 2.0 y el tamaño reducido del repositorio (0,3 GB) facilitan experimentos reproducibles con huellas SHA-256 verificables.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La evaluación se realizó sobre divisiones de página dentro de cuatro PDFs revisados, no sobre una empresa externa retenida, y las etiquetas se auditaron visualmente a partir de análisis de errores previos; el test no es un benchmark externo intacto.

| Pesos | Test | Exact accuracy | CER | Normalized edit similarity |
|---|---|---:|---:|---:|
| baseline | current | 46,1319 % | 9,3116 % | 91,8790 % |
| baseline | reference_v1 | 46,6899 % | 9,4534 % | 90,3613 % |
| finetuned | current | 90,6977 % | 0,4740 % | 98,7818 % |
| finetuned | reference_v1 | 91,4634 % | 0,6505 % | 97,2544 % |

Las predicciones y errores en CSV están disponibles en el directorio `comparison/` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,3 GB) y la naturaleza de PP-OCRv6, es previsible que quepa en GPUs de consumo, aunque no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño reducido sugiere que sí, pero no hay dato verificado.
- Opciones de despliegue: PaddleOCR CLI (`paddleocr text_recognition`) y PaddlePaddle; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.
- Requisito de versiones: el autor indica instalar versiones compatibles de PaddlePaddle y PaddleOCR (ver `ORIGINAL_MODEL_CARD.md`).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada. La comparación cualitativa con la familia PP-OCRv6 base se refleja en la tabla de evaluación anterior (baseline frente a finetuned). Para alternativas como PaddleOCR multilingual, EasyOCR o TrOCR no hay datos en la información disponible.

| Modelo | Idiomas | Especialización | Licencia | Datos de benchmark |
|---|---|---|---|---|
| ppocrv6-bctc-v1.0.3_2 | vi | Informes financieros vietnamitas | Apache 2.0 | Sí (tabla anterior) |
| PP-OCRv6 baseline | multi | OCR general | no disponible en esta ficha | Sí (tabla anterior) |
| Alternativas (EasyOCR, TrOCR) | multi | OCR general | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo reconoce líneas recortadas, no páginas completas ni estructura de tablas; requiere un paso previo de segmentación.
- Solo soporta vietnamita; no hay capacidades multilingües declaradas.
- La evaluación se realizó sobre divisiones de cuatro PDFs revisados y las etiquetas se auditaron visualmente; no es un benchmark externo intacto, por lo que la generalización a otras empresas o formatos no está garantizada.
- Riesgo de sesgo hacia el dominio financiero del dataset de entrenamiento; el rendimiento en otros tipos de documento puede degradarse.
- Riesgo de alucinación en OCR: el modelo puede producir transcripciones plausibles pero incorrectas en recortes de baja calidad o con caracteres ambiguos.
- El preprocesado, el vocabulario y los límites de generación forman parte del modelo; sustituirlos o eliminarlos puede invalidar los resultados.
- `training_checkpoint/` no contiene el estado del optimizador, por lo que no permite reanudar el entrenamiento exactamente.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar las obligaciones de la licencia en producción.
- No hay datos publicados sobre cuantización, latencia ni requisitos de hardware, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datpq91/ppocrv6-bctc-v1.0.3_2
- Dataset: https://huggingface.co/datasets/datpq91/bctc-ocr-v1.0.3_2
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- PaddlePaddle: https://github.com/PaddlePaddle/PaddlePaddle
- Referencia de la model card original: `ORIGINAL_MODEL_CARD.md` dentro del repositorio del modelo
