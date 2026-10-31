# prithivMLmods/ATH-MaaS-OvisOCR3-GGUF

## Resumen

ATH-MaaS-OvisOCR3-GGUF es la versión cuantizada en formato GGUF de OvisOCR3, un modelo multimodal de OCR y comprensión de documentos de tan solo 0,8 mil millones de parámetros (752,4 millones según los pesos en safetensors), desarrollado por ATH-MaaS y cuantizado por prithivMLmods. El modelo base está construido sobre Qwen3.5-0.8B y está diseñado para resolver un problema concreto: ejecutar OCR avanzado y análisis de documentos en hardware modesto, sin depender de modelos especializados mucho más grandes.

Su relevancia reside en que unifica cinco flujos de trabajo documentales (parseo de documentos, OCR general, extracción de información clave, descripción de figuras y reconstrucción de tablas entre páginas) en un modelo lo bastante ligero para ejecutarse en un portátil o una GPU de consumo mediante llama.cpp. Según su model card, supera a modelos especializados de mayor tamaño como Qwen3.5-OCR, GLM-OCR, PaddleOCR-VL-1.6 o MinerU2.5-Pro en varios benchmarks del sector. Se publica bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (image-text-to-text) basada en Qwen3.5-0.8B, con proyector de visión (mmproj) |
| Parametros totales | 752,39 millones (752.393.024) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0; mmproj en BF16 |
| Idiomas soportados | Inglés (declarado en la ficha; los benchmarks incluyen tareas en chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp); el modelo base está en safetensors |

## Arquitectura y entrenamiento

OvisOCR3 parte de Qwen/Qwen3.5-0.8B como modelo base y añade un componente de visión mediante un proyector multimodal (archivo mmproj-bf16 de 207 MB en la versión GGUF), lo que habilita el pipeline image-text-to-text. No se ha publicado información detallada sobre el encoder de visión concreto ni sobre el número de tokens de imagen soportados, aunque sí se sabe que admite resoluciones de imagen configurables desde 448×448 hasta 2880×2880 en despliegue con vLLM.

El entrenamiento sigue un pipeline de cuatro etapas: preentrenamiento continuado, mid-training, destilación on-policy y aprendizaje por refuerzo (RL). Esta combinación busca alinear el modelo con tareas documentales estructuradas. El modelo genera salidas en Markdown y JSON estructurado, incluye detección de layout, text spotting, reconocimiento de fórmulas y gráficos, y un script de reconstrucción recursiva de tablas que abarcan varias páginas. No se han publicado detalles sobre la composición exacta del dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Parseo de documentos completos a Markdown y JSON estructurado.
- OCR general sobre imágenes, con puntuaciones de 88,8 en OCRBench y 65,9 en OCRBench v2 EN (61,3 en OCRBench v2 ZH).
- Extracción de información clave (KIE): 90,50 en OCRBench KIE, 83,01 en OCRBench v2 KIE y 88,69 en CC-OCR KIE.
- Reconstrucción recursiva de tablas que cruzan varias páginas (CrossTabBench Relation F1 de 97,07; MPDocBench-Parse Truncated Table TEDS de 92,04).
- Reconocimiento de fórmulas matemáticas y de gráficos (charts).
- Detección de layout y text spotting dentro de la página.
- Descripción de figuras (figure captioning), con Localization F1 de 90,97 en DocFigCapBench.
- Respuesta a preguntas visuales (visual question answering) sobre documentos.
- Entrada multimodal: imagen + texto, con salida conversacional de texto.
- Despliegue con vLLM (vllm==0.22.1) y llama.cpp, con plantillas de prompt específicas por tarea.

## Casos de uso

- Digitalización de archivos documentales: convierte PDF escaneados e imágenes en Markdown estructurado, ideal para construir corpus de RAG a gran escala dado su bajo coste por documento.
- Extracción de información clave de facturas y contratos: el modelo está optimizado para KIE, por lo que puede extraer campos concretos (importes, fechas, partes) en formato JSON directamente consumible por aplicaciones.
- Reconstrucción de tablas financieras multipágina: su capacidad de reconstrucción recursiva de tablas entre páginas permite procesar informes anuales o estados financieros largos sin perder la estructura tabular.
- Reconocimiento de fórmulas en artículos científicos: puede transcribir ecuaciones matemáticas desde imágenes de papers, útil para indexar literatura académica.
- Automatización de back-office con hardware modesto: al pesar entre 466 MB y 1,52 GB según cuantización, se puede desplegar en CPUs o GPUs de oficina sin infraestructura de servidor dedicada.
- Procesado por lotes en pipelines ETL: su compatibilidad con vLLM permite servir el modelo en batch para procesar miles de documentos diarios con throughput alto.
- Descripción automática de figuras y gráficos: genera captions de figuras para mejorar la accesibilidad o la indexación de contenido visual en repositorios documentales.
- Integración en aplicaciones de escritorio locales: el formato GGUF permite ejecutarlo con llama.cpp u Ollama sin enviar datos a la nube, relevante para documentos sensibles.

## Benchmarks y rendimiento

Resultados publicados en la model card (sin modelos de comparación con cifras concretas salvo las indicadas):

| Benchmark | Puntuacion |
|---|---|
| MDPBench | 88,80 |
| PureDocBench | 82,31 |
| Real5-OmniDocBench | 93,63 |
| OmniDocBench 1.6 | 96,74 |
| OCRBench | 88,8 |
| OCRBench v2 EN | 65,9 |
| OCRBench v2 ZH | 61,3 |
| OCRBench KIE | 90,50 |
| OCRBench v2 KIE | 83,01 |
| CC-OCR KIE | 88,69 |
| In-house KIE Bench | 77,73 |
| DocFigCapBench Localization F1 | 90,97 |
| CrossTabBench Relation F1 | 97,07 |
| MPDocBench-Parse Truncated Table TEDS | 92,04 |

Según la model card, estas cifras superan a Qwen3.5-OCR, GLM-OCR, PaddleOCR-VL-1.6, MinerU2.5-Pro y Qwen3.5-4B en las tareas correspondientes, y a Qwen3.8-Max en DocFigCapBench, CrossTabBench y MPDocBench-Parse. No se han publicado tablas comparativas detalladas con los números de los modelos rivales en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde unos 500 MB (Q3_K_M, 466 MB) hasta 1,52 GB (BF16), más los 207 MB del proyector multimodal. Con Q4_K_M (529 MB + mmproj), el modelo cabe cómodamente en 2 GB de memoria.
- Cabe en prácticamente cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso GPUs integradas; también es viable su ejecución solo en CPU dada su reducida huella.
- GPU recomendadas: no se requieren GPUs de datacenter (A100/H100) para inferencia; cualquier GPU moderna con 2-4 GB de VRAM es suficiente, incluso con la versión BF16.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y vLLM (versión 0.22.1) para el modelo base con resoluciones de imagen de 448×448 a 2880×2880. La etiqueta text-generation-inference sugiere compatibilidad con TGI.
- Latencia y throughput: no disponibles en la información proporcionada, aunque el tamaño de 0,8B parámetros permite esperar latencias bajas y throughput alto incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Formato | Enfoque |
|---|---|---|---|---|
| OvisOCR3 (este modelo) | 0,8B | Apache-2.0 | GGUF, safetensors | OCR y comprension de documentos multimodal |
| Qwen3.5-OCR | no disponible | no disponible | no disponible | OCR especializado; superado por OvisOCR3 segun su model card |
| PaddleOCR-VL-1.6 | no disponible | no disponible | no disponible | OCR/document parsing; superado por OvisOCR3 segun su model card |
| MinerU2.5-Pro | no disponible | no disponible | no disponible | Parsing de documentos; superado por OvisOCR3 segun su model card |

Nota: los datos de parámetros, licencia y benchmarks de los modelos comparables no están disponibles en la información proporcionada; la model card afirma que OvisOCR3 los supera en varios benchmarks, pero no publica sus cifras detalladas.

## Limitaciones y advertencias

- Idioma declarado: la ficha indica únicamente inglés como idioma soportado, aunque los benchmarks incluyen resultados en chino (OCRBench v2 ZH); el rendimiento en español no está documentado y debe validarse antes de uso en producción.
- Las cifras de benchmarks provienen de la model card del propio autor y no han sido verificadas de forma independiente; conviene contrastarlas con evaluaciones propias en el dominio de uso.
- No se ha publicado la longitud de contexto del modelo, un dato relevante para documentos largos que debe comprobarse en la documentación del modelo base.
- El riesgo de alucinación en tareas de OCR y KIE no está cuantificado; en extracción de datos de facturas o contratos se recomiendan validaciones adicionales.
- Las cuantizaciones agresivas (Q3_K_L, Q3_K_M) pueden degradar la calidad del OCR y del reconocimiento de fórmulas respecto a BF16; se recomienda Q4_K_M o superior para producción.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0: sin restricciones para uso comercial, aunque debe conservarse la atribución de licencia.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/prithivMLmods/ATH-MaaS-OvisOCR3-GGUF
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR3
- Modelo base del lenguaje: https://huggingface.co/Qwen/Qwen3.5-0.8B
- llama.cpp: https://github.com/ggml-org/llama.cpp
