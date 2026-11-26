# FastFlowLM/MiniCPM-OCR-1.0-NPU2

## Resumen

MiniCPM-OCR 1.0 es un modelo de vision-lenguaje especializado en comprensión de documentos, desarrollado por OpenBMB y distribuido en este repositorio por FastFlowLM bajo la variante NPU2. Con 1.300 millones de parámetros, es el primer modelo de la familia MiniCPM-V/o dedicado exclusivamente a tareas OCR (reconocimiento óptico de caracteres) y parsing de documentos, incluyendo texto, tablas, fórmulas, gráficos, sellos y extracción estructurada de información. Deriva por fine-tuning del modelo multimodal openbmb/MiniCPM-V-4.6.

Su relevancia radica en combinar calidad de estado del arte con eficiencia de inferencia: alcanza 93,68 en Real5-OmniDocBench y 54,7 en OCRBench v2, manteniendo un rendimiento de aproximadamente 1,2 páginas por segundo en una RTX 5090, lo que supone 1,49 veces el throughput de PaddleOCR-VL-1.6 y 3,62 veces el de MinerU2.5 Pro. La variante NPU2 de este repositorio está orientada a despliegue en aceleradores NPU.

El modelo soporta inglés y chino, se distribuye con licencia Apache 2.0 y está diseñado para integrarse en pipelines de digitalización documental, automatización de extracción de datos y flujos de agentes, con soporte declarado para vLLM, SGLang, llama.cpp y Ollama desde el primer día.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer especializado en OCR (derivado de MiniCPM-V-4.6) |
| Parámetros totales | 1,3 mil millones (1.3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la model card menciona variantes cuantizadas y builds multi-chip, sin detallar) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 2,0 GB; la librería es minicpm-ocr) |

## Arquitectura y entrenamiento

MiniCPM-OCR 1.0 es un modelo multimodal de tipo vision-language construido mediante fine-tuning sobre openbmb/MiniCPM-V-4.6, un modelo base de la familia MiniCPM-V/o. La arquitectura combina un codificador visual con un decodificador de lenguaje para realizar image-text-to-text, orientado específicamente a la comprensión de documentos centrados en texto: reconocimiento de texto, tablas, fórmulas, gráficos, sellos y extracción de información estructurada.

El modelo incorpora decodificación acelerada mediante DSpark, una técnica de aceleración de decodificación que, según la model card, mejora la eficiencia de procesamiento de extremo a extremo en un 55 %. Está disponible en variantes BF16 y GGUF con esta aceleración. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de alta precisión en documentos en inglés y chino, incluyendo escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos recapturados.
- Parsing de documentos completo: conversión de documentos y PDF a Markdown estructurado con detección de layout.
- Reconocimiento de tablas y fórmulas matemáticas.
- Reconocimiento de sellos y gráficos.
- Extracción de información clave (KIE, key information extraction) para automatización de flujos posteriores.
- Procesamiento multimodal image-text-to-text con modo conversacional.
- Soporte declarado para flujos de agentes y workflows de agente.
- Despliegue en vLLM, SGLang, llama.cpp y Ollama.
- SDK de Python (pip), API completa y demos online.

## Casos de uso

- Digitalización masiva de archivos documentales: el modelo convierte lotes de PDF y escaneos en Markdown estructurado, con capacidad de procesar regiones de una página en paralelo y un throughput de 1,2 páginas por segundo en una RTX 5090, adecuado para pipelines de ingesta a gran escala.
- Extracción automática de datos de facturas y formularios: mediante KIE, identifica campos clave en documentos comerciales y los estructura para su volcado en sistemas ERP o bases de datos.
- Procesamiento de documentación científica y técnica: reconoce fórmulas matemáticas y tablas complejas, lo que permite convertir papers y manuales a formatos legibles por máquina sin pérdida de estructura.
- Automatización de atención al cliente con documentos adjuntos: el modelo puede leer capturas o PDF enviados por usuarios y extraer la información relevante para el agente conversacional.
- Construcción de bases de conocimiento RAG a partir de corpus documentales: el parsing a Markdown preserva la estructura (tablas, secciones) necesaria para un chunking de calidad en sistemas de recuperación aumentada.
- Procesamiento de documentos recapturados con el móvil: su robustez ante páginas curvadas, inclinadas y fotografías lo hace adecuado para aplicaciones de captura móvil en campo, como digitalización de recibos o albaranes.
- Integración en flujos de agentes: gracias al soporte de workflows de agente y API, puede actuar como herramienta de lectura documental dentro de un sistema multi-paso que consulte, valide y agregue información de múltiples documentos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Real5-OmniDocBench | 93,68 |
| OCRBench v2 | 54,7 |
| OmniDocBench v1.6 | no disponible (el valor numérico figura solo en gráficos de la model card) |
| Wild-OmniDocBench | no disponible (el valor numérico figura solo en gráficos de la model card) |
| olmOCR-Bench | no disponible (el valor numérico figura solo en gráficos de la model card) |
| CHAOS-Bench | no disponible (el valor numérico figura solo en gráficos de la model card) |
| Throughput (RTX 5090, OmniDocBench v1.6, concurrencia 1) | 1,2 páginas/s |

Comparativas de throughput declaradas por el autor: 1,49× PaddleOCR-VL-1.6 y 3,62× MinerU2.5 Pro. La decodificación con DSpark mejora la eficiencia extremo a extremo un 55 %. Los resultados de OmniDocBench v1.6, Wild-OmniDocBench, olmOCR-Bench y CHAOS-Bench se presentan únicamente en forma de gráficos en la model card, sin cifras textuales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,3B parámetros, en BF16 el modelo requiere del orden de 3 GB de pesos, y en cuantizaciones de 8 o 4 bits se reduce sustancialmente, aunque el autor no publica cifras exactas.
- GPU recomendadas: la model card reporta mediciones en una NVIDIA GeForce RTX 5090; no se detallan otras GPU validadas.
- Compatibilidad con GPU de consumo: por tamaño (1,3B), es previsible que quepa en GPU de consumo, aunque no se confirma en la información disponible.
- Variante NPU: este repositorio (MiniCPM-OCR-1.0-NPU2) está orientado a despliegue en aceleradores NPU; la model card menciona builds multi-chip.
- Opciones de despliegue: vLLM, SGLang, llama.cpp y Ollama, además de SDK pip y API.
- Latencia y throughput: 1,2 páginas/s en RTX 5090 con concurrencia de imagen 1 sobre las 1651 imágenes de OmniDocBench v1.6; el throughput real depende del contenido de la página, el backend, la concurrencia y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 | 1,3B | no disponible | 93,68 Real5-OmniDocBench; 54,7 OCRBench v2; 1,2 páginas/s | Apache 2.0 | Hugging Face, GitHub, API, demos |
| PaddleOCR-VL-1.6 | no disponible | no disponible | Throughput 1,49× inferior a MiniCPM-OCR 1.0 según el autor | no disponible | no disponible |
| MinerU2.5 Pro | no disponible | no disponible | Throughput 3,62× inferior a MiniCPM-OCR 1.0 según el autor | no disponible | no disponible |

Los datos de parámetros, contexto y licencia de PaddleOCR-VL-1.6 y MinerU2.5 Pro no figuran en la información proporcionada. Las comparativas de rendimiento proceden de la model card del autor y deben interpretarse con cautela.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte para inglés y chino; el rendimiento en otros idiomas no está documentado.
- Sesgos: no se documentan sesgos conocidos en la información disponible, pero al entrenarse sobre documentos en inglés y chino puede heredar sesgos de esos corpus.
- Alucinación: como modelo generativo, existe riesgo de que genere texto, tablas o fórmulas incorrectas en documentos de baja calidad, manuscritos o layouts atípicos; se recomienda validación en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base openbmb/MiniCPM-V-4.6 y de los componentes de terceros.
- Especialización: al estar optimizado para OCR y parsing documental, no es un modelo de propósito general y su rendimiento en tareas ajenas a documentos no está caracterizado.
- Variante NPU2: este repositorio concreto está orientado a NPU; los requisitos y el rendimiento en GPU pueden diferir de la variante principal.
- Contexto: no se especifica la longitud máxima de contexto, lo que dificulta planificar el procesamiento de documentos muy extensos de una sola pasada.
- Datos de benchmarks parciales: varias puntuaciones solo aparecen en gráficos, sin cifras textuales verificables en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/FastFlowLM/MiniCPM-OCR-1.0-NPU2
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Familia MiniCPM-V/o: https://github.com/openbmb/MiniCPM-V
- Variante DSpark BF16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Variante DSpark GGUF: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-OCR
- Demo oficial (global): https://platform.modelbest.ai/console/playground/document-parse
- Demo oficial (China): https://platform.modelbest.cn/console/playground/document-parse
- Demo básica (global): https://huggingface.co/spaces/openbmb/MiniCPM-OCR
- Demo básica (China): http://82.157.64.212:10111/playground/document-parse
- API gratuita: https://platform.modelbest.ai/console/docs/api/document-parse
- Guía de uso: https://github.com/OpenBMB/MiniCPM-OCR#using-minicpm-ocr
- Guía de reproducción de benchmarks: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/benchmark_reproduction_en.md
- Guía del modelo: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
