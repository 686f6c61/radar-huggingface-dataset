# openbmb/MiniCPM-OCR-1.0-GPTQ

## Resumen

MiniCPM-OCR 1.0 es el primer modelo especializado en OCR de la familia MiniCPM-V/o, desarrollado por OpenBMB (OpenBMB/ModelBest). Se trata de un modelo multimodal compacto de 1.300 millones de parametros centrado en la comprension de documentos con texto como elemento principal: reconoce texto, tablas, formulas, sellos y extrae informacion estructurada, tanto en ingles como en chino. Este repositorio concretamente aloja la version cuantizada GPTQ W4A16 del modelo original en BF16, lo que reduce drasticamente los requisitos de memoria para inferencia.

Su relevancia radica en que ofrece resultados de estado del arte en analisis documental con un tamano muy contenido: alcanza 93,68 en Real5-OmniDocBench y 54,7 en OCRBench v2, con un throughput de 1,2 paginas por segundo en una RTX 5090. Es un modelo pensado para despliegue eficiente: soporta vLLM, SGLang, llama.cpp y Ollama desde su lanzamiento, y dispone de variantes aceleradas con decodificacion DSpark. Para equipos que necesiten procesar documentos a escala sin infraestructura costosa, es una alternativa muy competitiva frente a sistemas OCR tradicionales como PaddleOCR-VL o MinerU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (image-text-to-text), familia MiniCPM-V/o, especializada en OCR |
| Parametros totales | 1.300.434.160 (aprox. 1,3B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16 (4 bits de peso, activaciones en 16 bits); base en BF16 |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ); el modelo base tambien dispone de variantes DSpark BF16 y GGUF |

## Arquitectura y entrenamiento

MiniCPM-OCR 1.0 es un modelo multimodal de la familia MiniCPM-V/o cuya tarea principal es el analisis documental (document parsing): convierte imagenes de documentos —escaneos, paginas curvadas, fotografias, paginas inclinadas y documentos recapturados— en salidas estructuradas de texto, tablas, formulas y sellos. La model card no detalla el backbone concreto (vision encoder ni LLM base) ni el numero de tokens de entrenamiento, por lo que estos datos no estan disponibles en la informacion proporcionada.

Como innovacion destacable, el equipo publica una variante acelerada con DSpark, una tecnica de decodificacion que mejora la eficiencia de procesamiento end-to-end en un 55% respecto al modelo base, disponible tanto en BF16 como en GGUF. Ademas del modelo en si, se ofrece un SDK de Python, una API completa y flujos de trabajo orientados a agentes. El modelo admite fine-tuning posterior.

## Capacidades

- Reconocimiento de texto (OCR) en documentos reales: escaneos, fotografias, paginas curvadas, inclinadas y recapturadas
- Analisis documental completo (document parsing): texto, tablas, formulas y sellos
- Extraccion de informacion clave (KIE, Key Information Extraction) para automatizacion de procesos
- Comprension de documentos en chino e ingles, incluyendo PDFs
- Entrada multimodal imagen-texto con salida conversacional (pipeline image-text-to-text)
- Integracion en flujos de agentes, con SDK pip, API y soporte de skills
- Despliegue flexible: vLLM, SGLang, llama.cpp y Ollama desde el primer dia
- Soporte de fine-tuning para adaptacion a dominios especificos

## Casos de uso

- Digitalizacion masiva de archivos documentales: gracias a su throughput de 1,2 paginas/s en una RTX 5090 y a la variante cuantizada GPTQ de ~1,9 GB, es viable montar pipelines de digitalizacion en servidores de gama media o incluso estaciones de trabajo locales.
- Automatizacion de facturas y formularios: la capacidad de extraccion de informacion clave (KIE) permite extraer campos estructurados (importes, fechas, datos fiscales) de documentos escaneados para integrarlos en sistemas ERP o contables.
- Procesado de documentos academicos con formulas: reconoce formulas matematicas y tablas, util para indexar papers y convertirlos a formatos estructurados como Markdown o LaTeX.
- OCR de documentos en chino: es uno de los pocos modelos compactos open source con rendimiento lider en benchmarks de documentos chinos (OmniDocBench, Wild-OmniDocBench), adecuado para empresas que operan con documentacion bilingue chino-ingles.
- Agentes de analisis documental: su integracion con workflows de agentes y su API permiten construir asistentes que leen, interpretan y responden preguntas sobre documentos de forma automatica.
- Despliegue en edge o entornos con recursos limitados: con la cuantizacion GPTQ W4A16 y la variante GGUF, puede ejecutarse en GPUs de consumo, reduciendo el coste por pagina procesado frente a modelos OCR de mayor tamano.
- Sustitucion de OCR tradicionales: su rendimiento superior en OmniDocBench v1.6 frente a PaddleOCR-VL-1.6 y MinerU2.5 Pro (en throughput) lo hace candidato para reemplazar sistemas OCR clasicos en produccion.

## Benchmarks y rendimiento

| Benchmark | MiniCPM-OCR 1.0 |
|---|---|
| Real5-OmniDocBench | 93,68 |
| OCRBench v2 | 54,7 |
| OmniDocBench v1.6 | Lider entre modelos open source comparados (puntuacion exacta no disponible) |
| Wild-OmniDocBench | Lider entre modelos open source comparados (puntuacion exacta no disponible) |
| olmOCR-Bench | Lider entre modelos open source comparados (puntuacion exacta no disponible) |
| CHAOS-Bench | Evaluado (puntuacion exacta no disponible) |

Datos de throughput (RTX 5090, 1.651 imagenes de OmniDocBench v1.6, concurrencia 1 a nivel de imagen):

| Sistema | Throughput relativo |
|---|---|
| MiniCPM-OCR 1.0 | 1,2 paginas/s (1,00x, referencia) |
| vs. PaddleOCR-VL-1.6 | 1,49x mas rapido |
| vs. MinerU2.5 Pro | 3,62x mas rapido |

Con la variante DSpark, la eficiencia end-to-end mejora un 55% adicional. Las puntuaciones de distintos benchmarks no son directamente comparables entre si.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GPTQ ocupa 1,9 GB; con overhead de runtime y el encoder de vision, se estima que puede funcionar en GPUs con 6-8 GB de VRAM (estimacion, no confirmada por la model card)
- GPU de referencia en los tests oficiales: NVIDIA GeForce RTX 5090 (1,2 paginas/s)
- Dado su tamano cuantizado (~1,3B parametros en 4 bits), cabe con holgura en GPUs de consumo como RTX 3060, RTX 4060 Ti o superiores; el modelo BF16 original tambien es viable en GPUs de 12-24 GB (estimacion)
- Opciones de despliegue soportadas oficialmente: vLLM, SGLang, llama.cpp y Ollama
- Alternativas de despliegue: variantes DSpark (BF16 y GGUF) para mayor velocidad, API gratuita de ModelBest para pruebas sin infraestructura propia, y demos online (China y global)
- Latencia y throughput: 1,2 paginas/s en RTX 5090 con configuracion acelerada; el throughput real depende del contenido de la pagina, el backend, la concurrencia y el hardware

## Comparativa con modelos similares

| Caracteristica | MiniCPM-OCR 1.0 (GPTQ) | PaddleOCR-VL-1.6 | MinerU2.5 Pro |
|---|---|---|---|
| Parametros | ~1,3B | no disponible | no disponible |
| Throughput relativo | 1,00x (referencia, 1,2 pag/s) | 0,67x (MiniCPM es 1,49x mas rapido) | 0,28x (MiniCPM es 3,62x mas rapido) |
| Calidad de parsing | Lider en promedio de 4 benchmarks | Inferior en throughput; calidad exacta no disponible | Inferior en throughput; calidad exacta no disponible |
| Idiomas | Ingles, chino | no disponible | no disponible |
| Licencia | Apache 2.0 | no disponible | no disponible |
| Cuantizacion | GPTQ W4A16, DSpark, GGUF | no disponible | no disponible |

## Limitaciones y advertencias

- Soporte de idiomas limitado a ingles y chino; el rendimiento en otros idiomas no esta evaluado en la informacion disponible
- Es un modelo especializado en OCR y comprension documental: no esta disenado como asistente generalista ni para razonamiento general
- La version GPTQ W4A16 puede sufrir una ligera degradacion de precision respecto al modelo BF16 original; para maxima calidad conviene usar el modelo base
- La longitud de contexto y los limites de resolucion de imagen no se detallan en la model card, lo que dificulta planificar documentos muy largos o de alta densidad
- Las puntuaciones de benchmarks provienen del propio desarrollador (OpenBMB); conviene verificar con la guia de reproduccion publicada antes de tomar decisiones criticas
- El throughput real depende fuertemente del contenido de la pagina, el backend y el hardware empleados
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los terminos de la API gratuita de ModelBest si se usa el servicio en la nube
- Riesgo de alucinacion tipico de modelos generativos: en documentos con texto degradado o ambiguo, el modelo puede generar contenido plausible en lugar de reconocer literalmente el texto; se recomienda validacion en flujos criticos

## Enlaces

- Modelo cuantizado GPTQ: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-GPTQ
- Modelo base (BF16): https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Variante acelerada DSpark (BF16): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Variante DSpark (GGUF): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Demo oficial (China): https://platform.modelbest.cn/console/playground/document-parse
- Demo oficial (Global): https://platform.modelbest.ai/console/playground/document-parse
- Demo basica en HuggingFace Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-OCR
- API gratuita: https://platform.modelbest.ai/console/docs/api/document-parse
- Guia de uso: https://github.com/OpenBMB/MiniCPM-OCR#using-minicpm-ocr
- Guia de reproduccion de benchmarks: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/benchmark_reproduction_en.md
- Guia del modelo y throughput: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
- Familia MiniCPM-V: https://github.com/openbmb/MiniCPM-V
