# NostraEmpire/mirror-minicpm-ocr-1.0

## Resumen

MiniCPM-OCR 1.0 es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y parseo de documentos, desarrollado por OpenBMB como parte de la familia MiniCPM-V/o. El repositorio aquí descrito (`NostraEmpire/mirror-minicpm-ocr-1.0`) es un espejo del modelo original `openbmb/MiniCPM-OCR-1.0`, con pesos en safetensors y 1.300.434.160 parámetros (aproximadamente 1.3B). Está afinado a partir de `openbmb/MiniCPM-V-4.6`.

El modelo resuelve el problema del parseo de documentos centrado en texto: extracción de texto, tablas, fórmulas, gráficos, sellos e información estructurada a partir de capturas del mundo real, incluyendo escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos recapturados. Está diseñado para equilibrar calidad y velocidad, y declara resultados SOTA en benchmarks como Real5-OmniDocBench (93.68), además de cifras destacadas en OmniDocBench v1.6, Wild-OmniDocBench y olmOCR-Bench.

Es relevante ahora porque combina un tamaño reducido (1.3B) con despliegue sencillo desde el primer día en vLLM, SGLang, llama.cpp y Ollama, variantes cuantizadas y aceleración de decodificación DSpark (mejora del 55% en eficiencia extremo a extremo). Su licencia Apache 2.0 facilita la integración en producción sin restricciones comerciales significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (fine-tune de openbmb/MiniCPM-V-4.6); detalles internos no disponibles |
| Parametros totales | 1.300.434.160 (1.3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Variantes cuantizadas disponibles (GGUF citado para DSpark); lista completa no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal); GGUF para la variante DSpark |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `openbmb/MiniCPM-V-4.6`, un modelo multimodal de visión-lenguaje, adaptado específicamente para tareas de OCR y parseo de documentos. La model card no detalla la arquitectura interna (número de capas, tipo de atención, estrategia de visión encoder) ni el volumen o composición del dataset de entrenamiento, por lo que esos datos figuran como no disponibles.

La innovación técnica destacada es DSpark, un mecanismo de aceleración de decodificación con variantes en BF16 y GGUF que mejora la eficiencia extremo a extremo en un 55%. El modelo se distribuye con soporte para vLLM, SGLang, llama.cpp y Ollama, además de builds multi-chip, SDK pip, API completa y flujos de agentes. No se especifica en la información disponible si el entrenamiento incluyó RLHF o DPO.

## Capacidades

- Reconocimiento de texto en documentos e imágenes, incluyendo escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos recapturados.
- Parseo de tablas y reconocimiento de estructuras tabulares.
- Reconocimiento de fórmulas matemáticas.
- Reconocimiento de gráficos y sellos.
- Extracción de información estructurada y key information extraction (KIE) para automatización downstream.
- Conversión de documentos y PDF a Markdown renderizado.
- Procesamiento paralelo de regiones dentro de una página (concurrencia a nivel de imagen).
- Soporte multilingüe limitado a inglés y chino.
- Integración en flujos de agentes y workflows mediante SDK pip y API.

## Casos de uso

- Digitalización masiva de archivos: el modelo convierte lotes de PDF escaneados en Markdown estructurado, con capacidad de procesar páginas curvadas e inclinadas típicas de escaneos antiguos, a un throughput de 1.2 páginas/s en RTX 5090.
- Extracción de tablas financieras: reconocimiento de estructuras tabulares en informes y balances para alimentar bases de datos o pipelines de análisis, aprovechando la capacidad de table-recognition declarada.
- Procesamiento de facturas y documentos administrativos: KIE para extraer campos clave (importes, fechas, emisores) y automatizar la entrada de datos en sistemas de gestión.
- Conversión de documentación técnica con fórmulas: reconocimiento de fórmulas matemáticas en papers y manuales para generar Markdown con LaTeX listo para publicar en wikis o repositorios.
- Automatización de atención al cliente con documentos adjuntos: el modelo puede procesar imágenes o PDF enviados por usuarios y extraer la información relevante para el agente conversacional.
- Pipeline de CI/CD para documentación: integración vía API o SDK pip para validar y convertir documentación en cada commit, con soporte de llama.cpp y Ollama para entornos sin GPU dedicada.
- Procesamiento de documentos chinos e ingleses en entornos empresariales bilingües, gracias al soporte nativo de ambos idiomas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Real5-OmniDocBench | 93.68 |
| OCRBench v2 | 54.7 |
| OmniDocBench v1.6 | leading (cifra exacta no disponible en el texto) |
| Wild-OmniDocBench | leading (cifra exacta no disponible en el texto) |
| olmOCR-Bench | leading (cifra exacta no disponible en el texto) |
| CHAOS-Bench | evaluado (cifra exacta no disponible en el texto) |

Rendimiento comparativo declarado: throughput de aproximadamente 1.49× PaddleOCR-VL-1.6 y 3.62× MinerU2.5 Pro. Velocidad absoluta de 1.2 páginas/s en NVIDIA GeForce RTX 5090 con las 1651 imágenes de OmniDocBench v1.6, concurrencia de imagen 1 y configuración acelerada de cada sistema. La aceleración DSpark mejora la eficiencia extremo a extremo un 55%.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 1.3B parámetros, la inferencia en BF16 requiere aproximadamente 2.6 GB solo para pesos, más overhead de visión encoder y KV cache.
- GPU recomendadas: RTX 5090 verificada en los benchmarks de throughput; el tamaño reducido permite GPUs consumer de gama media-alta.
- Cabe en GPU consumer: sí, por el tamaño de 1.3B parámetros; modelos concretos no confirmados en la información disponible.
- Opciones de despliegue: vLLM, SGLang, llama.cpp y Ollama desde el primer día, con variantes cuantizadas y builds multi-chip.
- Latencia y throughput: 1.2 páginas/s en RTX 5090 (concurrencia de imagen 1); el throughput real depende del contenido de la página, backend, concurrencia y hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 | 1.3B | no disponible | 93.68 Real5-OmniDocBench; 54.7 OCRBench v2; 1.2 págs/s | apache-2.0 | HF, vLLM, SGLang, llama.cpp, Ollama |
| PaddleOCR-VL-1.6 | no disponible | no disponible | ~0.67× throughput de MiniCPM-OCR (1/1.49) | no disponible | no disponible |
| MinerU2.5 Pro | no disponible | no disponible | ~0.28× throughput de MiniCPM-OCR (1/3.62) | no disponible | no disponible |

Los datos de parámetros, contexto y licencia de PaddleOCR-VL-1.6 y MinerU2.5 Pro no figuran en la información proporcionada; solo se dispone de la comparación de throughput relativo.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte para castellano ni otras lenguas.
- Riesgo de alucinación inherente a modelos generativos: puede producir texto o estructuras plausibles pero incorrectas en documentos de baja calidad o layouts atípicos.
- Longitud de contexto no especificada, lo que dificulta planificar el procesamiento de documentos muy extensos o de múltiples páginas en una sola pasada.
- El throughput de 1.2 páginas/s se midió en RTX 5090 con concurrencia 1; en hardware inferior o con páginas complejas el rendimiento será menor.
- Este repositorio es un espejo de terceros (`NostraEmpire`), no el repositorio oficial de OpenBMB; conviene verificar la integridad de los pesos frente al original.
- Aunque la licencia es Apache 2.0, deben revisarse las condiciones del modelo base `openbmb/MiniCPM-V-4.6` para usos derivados.
- No se detallan sesgos conocidos ni evaluaciones de robustez fuera de los benchmarks de OCR.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/NostraEmpire/mirror-minicpm-ocr-1.0
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6
- Variante DSpark BF16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Variante DSpark GGUF: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- GitHub MiniCPM-OCR: https://github.com/OpenBMB/MiniCPM-OCR
- GitHub MiniCPM-V/o: https://github.com/openbmb/MiniCPM-V
- Demo HF Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-OCR
- Demo oficial global: https://platform.modelbest.ai/console/playground/document-parse
- Demo oficial CN: https://platform.modelbest.cn/console/playground/document-parse
- Demo básica CN: http://82.157.64.212:10111/playground/document-parse
- API gratuita: https://platform.modelbest.ai/console/docs/api/document-parse
- Guía de uso: https://github.com/OpenBMB/MiniCPM-OCR#using-minicpm-ocr
- Skill: https://github.com/OpenBMB/MiniCPM-OCR#skill
- Guía de reproducción de benchmarks: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/benchmark_reproduction_en.md
- Guía del modelo: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
