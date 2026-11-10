# iapp/OpenThai2.0-OCR-Text

## Resumen

OpenThai2.0-OCR-Text es un sistema OCR especializado en texto impreso en tailandés e inglés, desarrollado por iApp Technology y publicado como pesos abiertos junto con su runtime. Es el motor que hay detrás de iApp Document OCR v3.0. A diferencia de los enfoques basados en modelos de lenguaje multimodales de gran tamano, este sistema apuesta por un pipeline clásico de detección y reconocimiento de líneas de texto con modelos minúsculos: un detector PP-OCRv6-tiny de 428K parámetros y un reconocedor CTC propio de 587K parámetros, sumando 1,02M de parámetros en total.

El modelo resuelve la extracción de texto de imágenes de página devolviendo el texto en orden de lectura, con una caja delimitadora y una puntuación de confianza por línea. Su propuesta de valor es la eficiencia: funciona exclusivamente en CPU, procesa una página A4 densa en unos 0,39 segundos y consume alrededor de 450 MB de RAM por proceso trabajador, lo que lo hace viable en servidores sin GPU.

Es relevante ahora porque demuestra que para OCR de texto impreso en tailandés se puede competir con modelos multimodales de miles de millones de parámetros (Typhoon OCR, Gemini 2.5 Flash, Qwen3.5-9B) usando dos modelos de menos de 3 MB en disco, con una licencia Apache-2.0 permisiva y un runtime ONNX/OpenVINO portable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector PP-OCRv6-tiny + reconocedor CTC de líneas (48 px de alto, 530 clases de salida sobre un diccionario de 528 caracteres tailandeses e ingleses) |
| Parámetros totales | 1,02M (detector 428K + reconocedor 587K) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa líneas de texto de 48 px de alto, no secuencias de tokens) |
| Tipos de cuantización | Pesos float32; OpenVINO ejecuta en bfloat16 en CPU con AMX |
| Idiomas soportados | Tailandés e inglés (texto impreso) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`det.onnx` 1,8 MB y `rec.onnx` 2,4 MB) |

## Arquitectura y entrenamiento

El sistema es un pipeline OCR en dos fases. La primera es un detector PP-OCRv6-tiny (428K parámetros) que localiza las líneas de texto en la imagen de página; la segunda es un reconocedor CTC de 587K parámetros entrenado por iApp que procesa líneas de 48 píxeles de alto y emite secuencias sobre un vocabulario de 528 caracteres tailandeses e ingleses (530 clases de salida incluyendo los tokens especiales del CTC). Ambos modelos derivan de PaddlePaddle PP-OCRv6-tiny: el detector se usa tal cual y el reconocedor se afina con una nueva capa de salida para tailandés.

El reconocedor se entrenó con 410.270 líneas de texto reales procedentes de escaneos judiciales, PDF de presupuestos parlamentarios y libros antiguos de Wikisource, complementadas con líneas sintéticas. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo discriminativo de reconocimiento de caracteres. La innovación principal no está en la arquitectura sino en la ingeniería del despliegue: modelos de pocos megabytes ejecutados en ONNX Runtime u OpenVINO en CPU, con un rendimiento de aproximadamente 950 páginas por minuto en 8 núcleos Xeon.

## Capacidades

- Reconocimiento de texto impreso en tailandés e inglés sobre imágenes de página completa.
- Detección de líneas de texto con caja delimitadora por línea.
- Salida en orden de lectura, con puntuación de confianza por línea.
- Ejecución exclusiva en CPU, sin necesidad de GPU.
- Inferencia mediante ONNX Runtime u OpenVINO (con bfloat16 en CPU con AMX).
- Procesamiento de documentos escaneados, PDF renderizados, fotografías de documentos y recortes.
- No genera tablas ni Markdown: para eso el autor remite a su modelo OpenThai2.0-OCR-Markdown.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no es un modelo generativo de propósito general.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo procesa páginas A4 densas en 0,39 segundos en CPU, lo que permite digitalizar grandes volúmenes de expedientes judiciales o boletines oficiales sin infraestructura GPU. Los benchmarks del autor muestran 97,0 de precisión de caracteres en sentencias del Tribunal Administrativo.
- Extracción de texto de documentos parlamentarios y presupuestarios: con 99,5 de precisión en el conjunto verificado de presupuestos, es adecuado para pipelines de indexación de documentación pública y portales de transparencia.
- Procesamiento de libros antiguos y material de Wikisource: aunque su punto débil relativo son los libros antiguos (77,1), sigue por delante de Tesseract 5 (52,2) y PaddleOCR 3 (55,5), por lo que sirve para proyectos de preservación digital con revisión humana posterior.
- OCR en entornos sin GPU o en el edge: con 450 MB de RAM por proceso y modelos de menos de 5 MB, se puede desplegar en servidores modestos, contenedores o dispositivos con CPU únicamente, reduciendo costes de infraestructura frente a alternativas basadas en API o GPU.
- Preprocesamiento para búsqueda y RAG sobre corpus tailandeses: la salida con orden de lectura y confianza por línea permite filtrar líneas de baja confianza y alimentar índices de búsqueda o sistemas de recuperación de información sobre documentación en tailandés.
- Digitalización de documentación bilingüe tailandés-inglés: contratos, formularios y documentos corporativos con mezcla de ambos idiomas, gracias a su diccionario conjunto de 528 caracteres.
- Automatización de flujos de captura documental en back office: integrable como servicio de CPU en pipelines de gestión documental donde la latencia por página es crítica y el volumen es alto (hasta ~950 páginas por minuto en 8 núcleos Xeon).

## Benchmarks y rendimiento

Precisión de caracteres (100 × (1 − CER), mayor es mejor) sobre 12 conjuntos impresos, según los datos publicados por el autor:

| Motor | Media 12 conjuntos | Sentencias judiciales | Royal Gazette | Presupuesto (verificado) | Libros antiguos | ThaiOCRBench | Manuscrito |
|---|---|---|---|---|---|---|---|
| OpenThai2.0-OCR-Text (este modelo) | 87,8 | **97,0** | 96,3 | 99,5 | 77,1 | 82,0 | 10,3 |
| OpenThai2.0-OCR-Markdown | **90,3** | 96,2 | **98,0** | 98,2 | **79,7** | 90,6 | 78,9 |
| Typhoon OCR V2 2B | 89,6 | 96,2 | 94,6 | 97,3 | 77,2 | 87,3 | 76,7 |
| Typhoon OCR 1.5 2B | 87,5 | 92,4 | 92,5 | 97,2 | 78,6 | 71,4 | **94,5** |
| Gemini 2.5 Flash | 87,1 | 94,7 | 92,6 | 81,0 | 77,9 | 88,8 | 86,7 |
| OneOCR (Microsoft) | 85,0 | 95,1 | 96,6 | **99,8** | 78,6 | 81,8 | 91,0 |
| Google Cloud Vision | 83,6 | 93,9 | 87,8 | 75,0 | 73,6 | 85,6 | 60,8 |
| PaddleOCR 3 PP-OCRv5 (th) | 81,1 | 90,4 | 82,9 | 93,1 | 55,5 | 75,8 | 41,6 |
| Tesseract 5 (tha+eng) | 75,4 | 71,7 | 82,3 | 71,3 | 52,2 | 75,0 | 26,4 |

Velocidad por página:

| Motor | Ejecución | Segundos por página | Segundos de CPU por página |
|---|---|---|---|
| OpenThai2.0-OCR-Text (este modelo) | CPU | **0,39** | **0,504** |
| OneOCR (Microsoft) | CPU | 0,72 | 2,22 |
| Google Cloud Vision | API | 0,99 | — |
| Tesseract 5 (tha+eng) | CPU | 1,40 | 1,662 |
| Typhoon OCR 1.5 2B | GPU (H100) | 2,79 | — |
| OpenThai2.0-OCR-Markdown | GPU (H100) | 2,97 | — |
| Gemini 2.5 Flash | API | 3,33 | — |
| Qwen3.5-9B | GPU (H100) | 3,81 | — |
| PaddleOCR 3 PP-OCRv5 (th) | CPU | 15,20 | 16,291 |

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es exclusivamente en CPU.
- RAM: aproximadamente 450 MB por proceso trabajador.
- Almacenamiento: menos de 5 MB para los dos modelos ONNX en float32.
- GPU recomendadas: ninguna; no aplica.
- Cabe en cualquier CPU de servidor o consumer; el rendimiento mejora en CPUs con AMX (OpenVINO ejecuta en bfloat16). El autor reporta ~950 páginas por minuto en 8 núcleos Xeon.
- Opciones de despliegue: ONNX Runtime u OpenVINO como runtimes documentados por el autor; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia: 0,39 segundos por página A4 densa, una página a la vez; 0,504 segundos de CPU por página.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Precisión media (12 conjuntos) | Velocidad | Licencia | Hardware |
|---|---|---|---|---|---|---|
| OpenThai2.0-OCR-Text | 1,02M | th, en | 87,8 | 0,39 s/página (CPU) | Apache-2.0 | CPU |
| Typhoon OCR V2 2B | 2B | th, en | 89,6 | 16,72 s/página (H100) | No disponible en la información | GPU |
| OpenThai2.0-OCR-Markdown | No disponible | th, en | 90,3 | 2,97 s/página (H100) | Apache-2.0 (según repo del autor) | GPU |
| Tesseract 5 (tha+eng) | No disponible | th, en | 75,4 | 1,40 s/página (CPU) | Apache-2.0 | CPU |

La comparación relevante es de compromiso: los modelos generativos de 2B como Typhoon OCR V2 obtienen una precisión media ligeramente superior (89,6 frente a 87,8) a costa de requerir GPU y ser más de 40 veces más lentos por página en el escenario medido. Frente a Tesseract 5, el modelo de iApp gana en precisión (87,8 frente a 75,4) y en velocidad en CPU (0,39 frente a 1,40 s/página).

## Limitaciones y advertencias

- Solo reconoce texto impreso; el rendimiento en manuscrito es muy bajo (10,3), muy por debajo de Typhoon OCR 1.5 2B (94,5) o OneOCR (91,0).
- No genera tablas ni Markdown; para documentos estructurados el autor remite a OpenThai2.0-OCR-Markdown.
- Solo cubre tailandés e inglés; no hay soporte documentado para otros idiomas.
- El punto más débil entre los conjuntos impresos son los libros antiguos (77,1), donde queda por detrás de OpenThai2.0-OCR-Markdown (79,7) y Typhoon OCR 1.5 (78,6).
- Los benchmarks proceden del propio autor del modelo; no se han verificado de forma independiente en la información disponible.
- Riesgo de errores en líneas de baja confianza: conviene filtrar por la puntuación de confianza devuelta por línea en flujos de producción.
- No se documentan sesgos específicos más allá de los derivados de la distribución de los datos de entrenamiento (documentos administrativos, judiciales y parlamentarios tailandeses).
- Licencia Apache-2.0, permisiva para uso comercial; no se indican restricciones adicionales.
- El repositorio tiene un tamaño de 0,0 GB reportado y solo 4 descargas, por lo que la adopción comunitaria es todavía mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.0-OCR-Text
- Repositorio de recursos de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
- No se han encontrado en la búsqueda web enlaces adicionales (papers, blogs, repos o demos) relevantes para este modelo; los resultados devueltos corresponden a la International Association of Privacy Professionals y no guardan relación.
