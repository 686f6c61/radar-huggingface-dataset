# alenisaw/turkicocr-svtrv2-b

## Resumen

TurkicOCR-SVTRv2-B es un modelo de reconocimiento óptico de caracteres (OCR) especializado en líneas de texto en escritura cirílica para kazajo, kirguís y ruso. Lo desarrolla Alen Issayev (con Aidana Zhalgas como coautora) y se presenta como un afinamiento del modelo base OpenOCR/SVTRv2-B, publicado en el congreso AIST 2026 dentro de la serie Lecture Notes in Computer Science de Springer. Con aproximadamente 35 millones de parámetros y 84,4 MB de pesos en FP32, está diseñado para ser ligero y desplegable en entornos con recursos limitados.

El modelo resuelve un problema concreto: los motores OCR genéricos (Tesseract, EasyOCR, PaddleOCR) rinden notablemente peor en escrituras cirílicas de lenguas túrquicas como el kazajo y el kirguís, que incluyen caracteres específicos (ә, ғ, қ, ң, ө, ұ, ү, һ, і) ausentes o mal cubiertos en los modelos entrenados principalmente con ruso. TurkicOCR-SVTRv2-B se entrena sobre el conjunto sintético TurkicOCR-Cyrillic para cerrar esa brecha, reportando un CER global del 1,76 % frente al 4,38 % de PaddleOCR Server y el 13,5 % de Tesseract 5.

Es relevante para equipos que digitalizan documentos oficiales, formularios o prensa en kazajo y kirguís, ya que ofrece una precisión sustancialmente superior a las alternativas genéricas con un coste computacional muy bajo y licencia Apache 2.0, lo que facilita su integración comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVTRv2-B (Single Visual Model Text Recognizer v2, configuración Base) |
| Parametros totales | ~35 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo OCR de línea; entrada de imagen 48 x 640 px) |
| Tipos de cuantizacion | FP32 (pesos oficiales), INT8 (variante publicada) |
| Idiomas soportados | kazajo (kk), kirguís (ky), ruso (ru), incluido texto bilingüe mixto |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), ONNX FP32, ONNX INT8 |

## Arquitectura y entrenamiento

SVTRv2-B es un reconocedor de texto visual de una sola etapa basado en un transformer visual con supervisión CTC (Connectionist Temporal Classification), que mapea directamente la secuencia de características de la imagen a la secuencia de caracteres sin necesidad de un módulo de atención autoregresiva separado. La entrada es un recorte de línea de documento redimensionado a 48 x 640 píxeles y la salida es una cadena UTF-8 en cirílico. El modelo parte del checkpoint OpenOCR/SVTRv2-B y se afina sobre el conjunto TurkicOCR-Cyrillic.

El entrenamiento se realizó sobre el dataset sintético TurkicOCR-Cyrillic (publicado en Hugging Face con DOI propio), orientado específicamente a las variantes cirílicas del kazajo y el kirguís. La model card no detalla el número exacto de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no procede en un modelo OCR). La innovación principal es el ajuste fino sobre un vocabulario cirílico túrquico completo, que corrige los fallos sistemáticos de los motores genéricos en esos caracteres.

## Capacidades

- Reconocimiento de texto en imágenes de líneas de documento (image-to-text) en kazajo, kirguís y ruso.
- Manejo de texto bilingüe o mixto (por ejemplo, kazajo-ruso en el mismo documento).
- Salida de cadena UTF-8 con caracteres cirílicos específicos de lenguas túrquicas.
- Inferencia de baja latencia: ~142 líneas/s en FP32 y ~385 líneas/s en INT8.
- Despliegue en CPU o GPU gracias a la variante ONNX INT8 de 27,1 MB.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo; es un modelo puramente de reconocimiento visual de texto.

## Casos de uso

- Digitalización de documentos oficiales en kazajo y kirguís: el modelo reconoce líneas de formularios, certificados y actas con un CER del 1,71 % y 1,89 % respectivamente, muy por debajo de Tesseract 5 (14,2 % y 16,8 %), lo que reduce la corrección manual posterior.
- Procesamiento de prensa y archivos históricos: al estar entrenado sobre líneas sintéticas con vocabulario cirílico túrquico completo, maneja mejor los caracteres ә, ғ, қ, ң, ө, ұ, ү, һ, і que los motores genéricos, útil para digitalizar hemerotecas.
- OCR en dispositivos de borde o entornos sin GPU: la variante ONNX INT8 de 27,1 MB y ~385 líneas/s permite ejecutar el reconocimiento en CPU dentro de aplicaciones móviles o escáneres de bajo coste.
- Integración en pipelines de digitalización masiva: con 142 líneas/s en FP32 y un modelo de 84,4 MB, se puede desplegar en contenedores ligeros o funciones serverless sin necesidad de aceleradores dedicados.
- Extracción de datos de facturas y albaranes en ruso-kazajo: el soporte de texto mixto bilingüe permite procesar documentos comerciales que alternan ambos idiomas en la misma línea.
- Preprocesamiento para sistemas de búsqueda documental o RAG: el texto reconocido puede alimentar índices o bases vectoriales, con la ventaja de que la baja latencia permite procesar grandes volúmenes por hora.
- Sistemas de accesibilidad: lectura en voz alta de documentos impresos en kazajo o kirguís para usuarios con discapacidad visual, ejecutándose localmente en hardware modesto.

## Benchmarks y rendimiento

Resultados publicados en la model card (CER, menor es mejor):

| Modelo | Precisión | Tamaño | CER kazajo | CER kirguís | CER ruso | CER global | Throughput |
|---|---|---|---|---|---|---|---|
| TurkicOCR-SVTRv2-B | FP32 | 84,4 MB | 1,71 % | 1,89 % | 1,68 % | 1,76 % | ~142 líneas/s |
| TurkicOCR-SVTRv2-B | INT8 | 27,1 MB | 1,88 % | 2,05 % | 1,85 % | 1,93 % | ~385 líneas/s |
| PaddleOCR Server | FP32 | ~115 MB | 4,82 % | 5,12 % | 3,20 % | 4,38 % | ~95 líneas/s |
| EasyOCR | FP32 | ~95 MB | 6,94 % | 7,31 % | 4,55 % | 6,27 % | ~60 líneas/s |
| Tesseract 5 (rus+kaz) | — | — | 14,2 % | 16,8 % | 9,4 % | 13,5 % | ~25 líneas/s |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (modelo de 84,4 MB); inferior a 0,5 GB en INT8 (27,1 MB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 no suponen cuello de botella, pero el modelo no las aprovecha especialmente por su reducido tamaño.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU (la variante ONNX INT8 está pensada para ello).
- Opciones de despliegue: librería `openocr` (predictor oficial), ONNX Runtime para las variantes ONNX FP32/INT8, y despliegue en contenedores ligeros. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de lenguaje.
- Latencia y throughput: ~142 líneas/s en FP32 y ~385 líneas/s en INT8 según la model card; no se especifica la GPU utilizada en la medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Idiomas cirílicos túrquicos | CER global | Licencia |
|---|---|---|---|---|---|
| TurkicOCR-SVTRv2-B | ~35 M | 84,4 MB (FP32) / 27,1 MB (INT8) | Sí (kazajo, kirguís, ruso) | 1,76 % | Apache 2.0 |
| PaddleOCR Server | no disponible | ~115 MB | Parcial (ruso; kazajo/kirguís con peor CER) | 4,38 % | Apache 2.0 |
| EasyOCR | no disponible | ~95 MB | Parcial | 6,27 % | Apache 2.0 |
| Tesseract 5 (rus+kaz) | no disponible | no disponible | Parcial | 13,5 % | Apache 2.0 |

## Limitaciones y advertencias

- El modelo está entrenado sobre un dataset sintético; el rendimiento en documentos reales con ruido, degradación o tipografías atípicas puede degradarse respecto a los CER reportados.
- Es un reconocedor de líneas: requiere un paso previo de detección y recorte de líneas de texto; no realiza detección de layout ni segmentación de párrafos.
- Solo cubre kazajo, kirguís y ruso; no soporta otras lenguas túrquicas (turco, azerí, uzbeko) ni otras escrituras.
- La entrada está fijada a 48 x 640 píxeles; líneas muy largas o con caracteres muy pequeños pueden requerir ajustes de preprocesado.
- Riesgo de alucinación bajo en sentido generativo, pero puede producir sustituciones de caracteres en glifos ambiguos o similares (por ejemplo, entre cirílico y latín).
- Licencia Apache 2.0, sin restricciones para uso comercial, pero conviene revisar las condiciones del modelo base OpenOCR/SVTRv2-B del que deriva.
- No se han publicado análisis de sesgos ni evaluaciones en dominios específicos (manuscrito, documentos históricos, señales de tráfico), por lo que la validación en el dominio objetivo es responsabilidad del integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alenisaw/turkicocr-svtrv2-b
- Variante ONNX FP32: https://huggingface.co/alenisaw/turkicocr-svtrv2-b-onnx
- Variante ONNX INT8: https://huggingface.co/alenisaw/turkicocr-svtrv2-b-int8
- Dataset TurkicOCR-Cyrillic: https://huggingface.co/datasets/alenisaw/turkicocr-cyrillic
- Repositorio GitHub: https://github.com/alenisaw/turkicocr-svtrv2-b
- Paper (Springer LNCS, AIST 2026): https://doi.org/10.1007/978-3-032-41546-2_22
- Modelo en Kaggle: https://www.kaggle.com/models/alenissayev/turkicocr-svtrv2-b
- Modelo base: https://huggingface.co/OpenOCR/SVTRv2-B
