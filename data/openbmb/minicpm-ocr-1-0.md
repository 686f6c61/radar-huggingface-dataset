# openbmb/MiniCPM-OCR-1.0

## Resumen

MiniCPM-OCR 1.0 es un modelo visión-lenguaje de 1.300 millones de parámetros (1.300.434.160 según los safetensors del repositorio) desarrollado por OpenBMB, primer miembro de la familia MiniCPM-V/o especializado exclusivamente en comprensión de documentos centrada en texto. Convierte imágenes y PDF de documentos en Markdown estructurado, reconociendo texto, tablas, fórmulas, gráficos y sellos, además de realizar extracción de información clave (KIE) para automatización posterior.

El modelo está diseñado explícitamente para el equilibrio entre calidad y velocidad en capturas del mundo real: la model card reporta 93,68 en Real5-OmniDocBench, 54,7 en OCRBench v2 y un rendimiento de 1,2 páginas por segundo en una RTX 5090 con concurrencia de imagen 1, lo que supone aproximadamente 1,49× el throughput de PaddleOCR-VL-1.6 y 3,62× el de MinerU2.5 Pro. Con decodificación acelerada DSpark la eficiencia extremo a extremo mejora un 55%, y existen variantes BF16 y GGUF de esa configuración acelerada.

Su relevancia práctica está en el despliegue: licencia Apache 2.0, soporte declarado desde el primer día en vLLM, SGLang, llama.cpp y Ollama, variantes cuantizadas, builds multi-chip, SDK de Python, API completa y flujos de agentes. Cubre documentos en inglés y chino, incluidos escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos recapturados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | minicpm_ocr (modelo visión-lenguaje de la familia MiniCPM-V/o); detalles del encoder visual no disponibles |
| Parametros totales | 1.300.434.160 (1,3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 y variantes cuantizadas; existen builds GGUF de la versión acelerada DSpark. Lista completa de cuantizaciones no disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) y GGUF (DSpark); tamaño del repositorio 5,3 GB |

## Arquitectura y entrenamiento

La información disponible describe MiniCPM-OCR 1.0 como un modelo multimodal de tipo imagen-texto-a-texto (pipeline `image-text-to-text`) con tipo de modelo `minicpm_ocr`, integrado en la familia MiniCPM-V/o de OpenBMB. Con 1,3B parámetros, el diseño prioriza el reconocimiento de texto sobre la comprensión visual general: el modelo trabaja sobre regiones de página detectadas y genera Markdown estructurado con tablas, fórmulas y demás elementos de maquetación. La model card no detalla la arquitectura interna del encoder visual, el mecanismo de atención ni el tokenizador, por lo que esos extremos quedan como no disponibles.

Tampoco se han publicado en la información proporcionada los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO o fases de alineación). La innovación técnica documentada es la decodificación acelerada DSpark, con variantes BF16 y GGUF publicadas por separado, que según el autor mejora un 55% la eficiencia de procesamiento extremo a extremo y sostiene el throughput de 1,2 páginas/s en RTX 5090. El modelo está pensado para seguir siendo ajustable mediante fine-tuning.

## Capacidades

- Parseo de documentos a Markdown estructurado, con detección de layout y renderizado final.
- Reconocimiento de texto en inglés y chino, incluyendo escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos recapturados.
- Reconocimiento de tablas, fórmulas, gráficos y sellos.
- Extracción de información clave (KIE) para automatización posterior de flujos documentales.
- Procesamiento de PDF e imágenes; la model card muestra ejemplos con manuscritos, documentos históricos y escaneados, periódicos y estados financieros.
- Capacidad conversacional multimodal (etiqueta `conversational`).
- Integración en flujos de agentes y API completa, con SDK de Python distribuido por pip.
- Despliegue en vLLM, SGLang, llama.cpp y Ollama, con variantes cuantizadas y builds multi-chip.
- No se documentan en la información disponible capacidades de audio, ni tool calling explícito, ni modo de razonamiento extendido.

## Casos de uso

- Digitalización masiva de archivos PDF y escaneos: el modelo convierte páginas en Markdown estructurado a 1,2 páginas/s en una RTX 5090, lo que permite procesar lotes grandes en hardware de gama alta de consumo.
- Extracción de datos de facturas y estados financieros: la función de KIE permite recuperar campos concretos (importes, fechas, emisores) y volcarlos a un sistema contable sin intervención manual.
- Migración de documentación técnica a repositorios: al preservar fórmulas y tablas en la salida, resulta adecuado para convertir manuales científicos o técnicos a Markdown listo para un sitio de documentación.
- Procesamiento de prensa histórica: la model card incluye ejemplos de periódicos y documentos históricos escaneados, un escenario típico de bibliotecas y hemerotecas digitales.
- Automatización de back office con agentes: combinado con la API y el SDK, el modelo puede actuar como herramienta de lectura de documentos dentro de un pipeline de agentes que clasifica, extrae y enruta expedientes.
- Digitalización de documentación bilingüe inglés-chino en comercio internacional: permite tratar contratos, albaranes y fichas de producto en ambos idiomas con un único modelo.
- Reconocimiento de manuscritos y formularios recapturados con móvil: útil en aplicaciones de campo donde las fotos presentan inclinación, curvatura o iluminación desigual.
- Despliegue en local o en el borde: con variantes GGUF y soporte de llama.cpp/Ollama, cabe en entornos sin GPU de centro de datos, lo que facilita escenarios con requisitos de privacidad documental.

## Benchmarks y rendimiento

| Benchmark | MiniCPM-OCR 1.0 | Notas |
|---|---|---|
| Real5-OmniDocBench | 93,68 | Parseo de documentos del mundo real |
| OCRBench v2 | 54,7 | Reconocimiento general y extracción de información |
| OmniDocBench v1.6 | Resultado numérico no disponible | Solo se indica que obtiene resultados líderes |
| Wild-OmniDocBench | Resultado numérico no disponible | Solo se indica que obtiene resultados líderes |
| olmOCR-Bench | Resultado numérico no disponible | Solo se indica que obtiene resultados líderes |
| CHAOS-Bench | Resultado numérico no disponible | Aparece en las gráficas de evaluación, sin cifra en el texto |
| Throughput (RTX 5090, concurrencia de imagen 1, 1651 imágenes de OmniDocBench v1.6) | 1,2 páginas/s | Configuración acelerada; 1,00× relativo |
| Throughput relativo vs PaddleOCR-VL-1.6 | ~1,49× | Según el autor |
| Throughput relativo vs MinerU2.5 Pro | ~3,62× | Según el autor |
| Mejora de eficiencia con DSpark | +55% extremo a extremo | Variantes BF16 y GGUF |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de propósito general, algo esperable en un modelo especializado en OCR. Las cifras de OmniDocBench v1.6, Wild-OmniDocBench, olmOCR-Bench y CHAOS-Bench solo aparecen en formato gráfico en la model card, por lo que no se reproducen aquí.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 2,6 GB para 1,3B parámetros; el repositorio completo ocupa 5,3 GB, incluyendo artefactos adicionales.
- VRAM estimada para inferencia en BF16: del orden de 4-6 GB considerando encoder visual, activaciones y caché KV (estimación, no publicada por el autor).
- VRAM estimada con cuantización GGUF de 4 bits: del orden de 1-2 GB (estimación).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070/4080/4090 y RTX 5090; el dato de throughput publicado corresponde a una RTX 5090.
- GPU de centro de datos: A100 y H100 son válidas por capacidad, aunque el modelo está dimensionado para hardware menor; no se publican cifras de throughput en esas GPU.
- Opciones de despliegue: vLLM, SGLang, llama.cpp y Ollama desde el primer día, además de builds multi-chip y variantes cuantizadas.
- Throughput medido: 1,2 páginas/s en RTX 5090 con concurrencia de imagen 1 (las regiones de una misma página se reconocen en paralelo). El throughput real depende del contenido de la página, el backend, la concurrencia y el hardware.
- Latencia por página no publicada de forma desagregada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 | 1,3B | No disponible | 93,68 Real5-OmniDocBench; 54,7 OCRBench v2; 1,2 páginas/s en RTX 5090 | Apache 2.0 | HuggingFace, variantes BF16 y GGUF, SDK y API |
| PaddleOCR-VL-1.6 | No disponible | No disponible | ~1,49× más lento que MiniCPM-OCR 1.0 según el autor | No disponible en la información | No disponible en la información |
| MinerU2.5 Pro | No disponible | No disponible | ~3,62× más lento que MiniCPM-OCR 1.0 según el autor | No disponible en la información | No disponible en la información |

La comparación disponible se limita al throughput relativo publicado por OpenBMB; no se aportan parámetros, contexto ni licencias de las alternativas, por lo que la comparativa completa queda como no disponible.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano u otras lenguas no está documentado y no debería asumirse.
- Especialización estrecha: es un modelo de OCR y parseo documental, no un asistente general; no se han publicado resultados en benchmarks de razonamiento, código o matemáticas.
- Riesgo de alucinación en la transcripción: como modelo generativo, puede producir texto, celdas de tabla o fórmulas que no aparecen en la imagen, especialmente en documentos degradados; conviene validar campos críticos en producción.
- Sin datos publicados sobre sesgos, composición del corpus de entrenamiento ni filtros de datos.
- Longitud de contexto no documentada: el número de páginas o la resolución máxima por pasada no se especifica en la información disponible.
- Las cifras de throughput y las comparaciones relativas provienen del propio autor y de su guía de reproducción; la latencia real depende del backend, la concurrencia y la complejidad de la página.
- Licencia Apache 2.0: permite uso comercial y modificaciones con obligaciones de atribución y aviso; conviene revisar los términos de las dependencias del pipeline (encoder visual, tokenizador) antes de redistribuir.
- Los resultados de OmniDocBench v1.6, Wild-OmniDocBench, olmOCR-Bench y CHAOS-Bench no están disponibles en forma numérica en el texto de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Documentación de la API: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_api_en.md
- Guía del modelo: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
- Guía de reproducción de benchmarks: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/benchmark_reproduction_en.md
- Variante acelerada DSpark (BF16): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Variante acelerada DSpark (GGUF): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- Demo (global): https://platform.modelbest.ai/console/playground/document-parse
- Demo (China): https://platform.modelbest.cn/console/playground/document-parse
- Familia MiniCPM-V/o: https://github.com/openbmb/MiniCPM-V
