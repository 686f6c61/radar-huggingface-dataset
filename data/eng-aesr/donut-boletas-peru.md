# eng-aesr/donut-boletas-peru

## Resumen

El modelo `eng-aesr/donut-boletas-peru` es una adaptación de bajo recurso del checkpoint `naver-clova-ix/donut-base-finetuned-cord-v2`, diseñado para la extracción estructurada de boletas peruanas sin OCR explícito. Fue desarrollado por el autor `eng-aesr` con un dataset privado de 140 boletas anotadas. Resuelve el problema de convertir imágenes de boletas en JSON estructurado con campos como empresa, RUC, fecha, número de comprobante, ítems, subtotal, IGV y total. Su relevancia radica en que es un modelo especializado en un dominio concreto (boletas peruanas) y con licencia MIT, lo que permite su uso y modificación libre. La arquitectura es un `VisionEncoderDecoderModel` con encoder Donut-Swin y decoder mBART, con 201.133.176 parámetros y una resolución de entrada de 1280 × 960 píxeles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (encoder Donut-Swin + decoder mBART) |
| Parametros totales | 201.133.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 768 tokens de generación máxima (contexto de entrada no especificado) |
| Tipos de cuantizacion | no disponible (pesos en SafeTensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Español (es) |
| Licencia | MIT |
| Formato de pesos | SafeTensors |

Nota: la resolución del procesador es de 1280 × 960 píxeles.

## Arquitectura y entrenamiento

El modelo se basa en Donut (Document Understanding Transformer), una arquitectura que combina un encoder Swin Transformer para procesar la imagen completa y un decoder mBART que genera la secuencia de tokens JSON. No utiliza OCR explícito; el modelo aprende directamente de la imagen a la representación estructurada. El checkpoint base inmediato es `naver-clova-ix/donut-base-finetuned-cord-v2`, que ya había sido ajustado sobre el dataset CORD v2 por sus autores upstream. La adaptación posterior se realizó con un dataset privado de 140 boletas peruanas anotadas (100 para entrenamiento, 20 para validación y 20 para test). Se aplicaron tres variantes visuales suaves (`blur`, `noise` y `rotate`) únicamente al split de entrenamiento, generando 400 registros a partir de 100 fuentes independientes. La configuración de fine-tuning incluye learning rate de `1e-5`, batch size de 2, gradient accumulation de 1, gradient clipping de 1.0 y un máximo de épocas no especificado. El prompt de tarea es `<s_receipt_peru>`.

## Capacidades

- Extracción estructurada de boletas peruanas: genera JSON con campos como empresa, RUC, fecha, número de comprobante, ítems (con nombre y precio), subtotal, IGV y total.
- Procesamiento de imágenes completas sin OCR: el modelo recibe la imagen directamente y produce la salida estructurada.
- Soporte de esquema fijo: el JSON generado sigue un esquema definido que puede convertirse con `DonutProcessor.token2json`.
- Multilingüe limitado: aunque el modelo está entrenado principalmente para español peruano, la arquitectura base podría generalizar a otros idiomas, pero no está validado.
- No soporta tool calling ni agentes: es un modelo de generación de secuencias para una tarea específica.
- No tiene modo de razonamiento: es una extracción directa sin pasos intermedios.

## Casos de uso

- Digitalización de boletas en comercios locales: una pequeña empresa podría fotografiar boletas y extraer automáticamente los datos para su contabilidad, siempre con revisión humana.
- Prototipos de aplicaciones de gestión de gastos: integrar el modelo en una app móvil que escanee boletas y genere registros estructurados para categorizar gastos personales o de empresa.
- Investigación en document AI: servir como punto de partida para evaluar técnicas de fine-tuning en dominios de bajos recursos, comparando con el modelo base CORD.
- Automatización de procesos de auditoría con supervisión: aunque no debe usarse sin revisión, puede pre-rellenar campos en sistemas de auditoría para que un humano valide.
- Educación y demostraciones: mostrar cómo funciona la extracción de documentos sin OCR en entornos académicos o de formación.
- Migración de datos históricos: digitalizar archivos de boletas en papel para alimentar bases de datos, con un pipeline de verificación manual posterior.

## Benchmarks y rendimiento

Según el model-index declarado por el autor (no verificado de forma independiente), en un test privado de 20 boletas peruanas:

| Metrica | Valor |
|---|---|
| Total exact match | 70 % |
| Subtotal exact match | 50 % |
| RUC exact match | 40 % |
| Fecha exact match | 45 % |
| Ocho claves de nivel superior presentes | 50 % |
| Esquema estricto válido | 20 % |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- El modelo tiene 201M parámetros, lo que en FP32 ocupa aproximadamente 800 MB de memoria, y en FP16 unos 400 MB. Con cuantización INT8 podría reducirse a unos 200 MB.
- Se recomienda al menos una GPU con 4 GB de VRAM para inferencia en FP16, aunque la resolución de entrada de 1280 × 960 implica mayor uso de memoria para las activaciones del encoder. Una GPU como RTX 3060 o superior sería suficiente.
- El modelo puede ejecutarse en CPU, pero la inferencia será más lenta, especialmente con imágenes de alta resolución.
- Opciones de despliegue: se puede usar con la librería Transformers (PyTorch), exportar a ONNX o TensorRT para optimización, o servir con FastAPI. No se mencionan integraciones con vLLM o llama.cpp porque es un modelo de visión-lenguaje, no un LLM puro.
- Latencia y throughput: no se proporcionan datos concretos; dependerá del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| `eng-aesr/donut-boletas-peru` | 201M | 768 tokens generación | MIT | Boletas peruanas |
| `naver-clova-ix/donut-base-finetuned-cord-v2` | 201M | 768 tokens generación | MIT | Recibos CORD v2 (inglés) |
| `naver-clova-ix/donut-base` | 201M | 768 tokens generación | MIT | Documentos generales |

No se dispone de comparativas de rendimiento entre estos modelos en la información proporcionada. La diferencia principal es el dominio de adaptación: el modelo peruano está ajustado para boletas peruanas, mientras que el base CORD v2 se centra en recibos en inglés.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (140 boletas anotadas), lo que limita la generalización a variaciones de formato, calidad de imagen o tipos de boleta no vistos.
- No validado para facturas, documentos manuscritos, documentos de otros países o imágenes fuera del dominio de entrenamiento.
- Riesgo de alucinación en campos numéricos (RUC, totales) con exactitud baja (40-70 % según la métrica).
- El esquema estricto válido solo alcanza un 20 %, lo que indica que la estructura generada puede no cumplir siempre el esquema JSON esperado.
- No debe usarse sin revisión humana para contabilidad, tributación, auditoría, pagos o cumplimiento normativo.
- El dataset privado no se distribuye, lo que impide reproducir el entrenamiento.
- La licencia MIT permite uso comercial, pero el autor advierte que es experimental y para prototipos supervisados.
- El modelo requiere el prompt de tarea específico `<s_receipt_peru>`; usar `pipeline` directamente puede no funcionar correctamente.

## Enlaces

- HuggingFace: https://huggingface.co/eng-aesr/donut-boletas-peru
- Modelo base: https://huggingface.co/naver-clova-ix/donut-base-finetuned-cord-v2
- Paper de Donut (arxiv:2111.15664): https://arxiv.org/abs/2111.15664

Nota: no se han encontrado otros enlaces (blogs, repos, demos) en la información proporcionada.
