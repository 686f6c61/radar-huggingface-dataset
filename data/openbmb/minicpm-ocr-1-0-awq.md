# openbmb/MiniCPM-OCR-1.0-AWQ

## Resumen

MiniCPM-OCR 1.0 es el primer modelo OCR específico de la familia MiniCPM-V/o, desarrollado por OpenBMB. Se trata de un modelo multimodal (image-text-to-text) de 1.300 millones de parámetros centrado en la comprensión de documentos con texto como protagonista: texto plano, tablas, fórmulas, gráficos, sellos y extracción de información estructurada. Su objetivo es equilibrar calidad de parseo documental con velocidad de inferencia en capturas reales (escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos re-capturados), en chino e inglés.

Este repositorio aloja la variante cuantizada AWQ W4A16 del modelo base `openbmb/MiniCPM-OCR-1.0`, lo que reduce el tamaño de los pesos a 1,9 GB y facilita su despliegue en hardware modesto. El modelo destaca por su puntuación de 93,68 en Real5-OmniDocBench, un benchmark de parseo documental en condiciones reales, y por alcanzar 1,2 páginas/segundo en una RTX 5090, con un throughput superior a alternativas como PaddleOCR-VL-1.6 (1,49×) y MinerU2.5 Pro (3,62×).

Es relevante ahora mismo porque el parseo de documentos es un cuello de botella habitual en pipelines de RAG y automatización, y MiniCPM-OCR 1.0 ofrece resultados de estado del arte con un tamaño reducido, soporte de vLLM, SGLang, llama.cpp y Ollama desde el primer día, y licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (image-text-to-text), familia MiniCPM-V/o; detalle exacto no disponible |
| Parametros totales | 1.300.434.160 (~1,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 (4 bits, pesos; activaciones en 16 bits) en este repo; BF16 y GGUF en variantes oficiales |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ 4-bit); variantes BF16 y GGUF disponibles en repos hermanos |

## Arquitectura y entrenamiento

MiniCPM-OCR 1.0 pertenece a la familia MiniCPM-V/o de OpenBMB y es su primer modelo especializado en OCR. Es un modelo multimodal de 1,3B parámetros que procesa imágenes de documentos y genera texto estructurado (image-text-to-text). La model card no detalla la composición interna del modelo (codificador visual, proyector, LLM base) ni el número de tokens de entrenamiento, por lo que esos datos no están disponibles.

Como innovación técnica destacable, OpenBMB publica una variante con aceleración de decodificación DSpark, que mejora la eficiencia de procesamiento end-to-end en un 55% respecto a la configuración base, y está disponible tanto en BF16 como en GGUF. La model card tampoco especifica si el entrenamiento incluyó RLHF o DPO; no disponible.

## Capacidades

- Parseo documental de alta calidad: texto, tablas, fórmulas matemáticas, gráficos, sellos y documentos estructurados, en chino e inglés.
- Robustez ante condiciones reales: escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos re-capturados.
- Reconocimiento general de OCR: 54,7 en OCRBench v2.
- Extracción de información clave (KIE) para automatización de procesos posteriores.
- Soporte de despliegue desde el primer día en vLLM, SGLang, llama.cpp y Ollama, con variantes cuantizadas y builds multi-chip.
- Posibilidad de fine-tuning adicional, SDK de pip, API completa y flujos de trabajo de agente.
- Demos online oficiales (China y global) y API gratuita de document-parse.

## Casos de uso

- Digitalización de archivos documentales: conversión masiva de PDFs escaneados y fotografías de documentos a texto estructurado (Markdown o similar), aprovechando su robustez ante páginas inclinadas, curvadas o mal iluminadas.
- Pipelines de RAG sobre documentos: el parseo de tablas, fórmulas y sellos alimenta bases de conocimiento vectoriales con contenido fiel al documento original, mejorando la calidad de la recuperación.
- Automatización de procesos con extracción de información clave (KIE): extracción de campos de facturas, contratos o formularios para integrar en sistemas ERP o CRM.
- Procesamiento de documentos en chino e inglés: útil para empresas que gestionan documentación mixta en ambos idiomas, un punto donde muchos OCR occidentales fallan.
- OCR en local y en edge: con 1,3B parámetros y cuantización AWQ de 1,9 GB, puede ejecutarse en GPUs de consumo o incluso en CPU vía llama.cpp/Ollama para despliegues sin nube.
- Servicios de OCR de alto throughput: 1,2 páginas/s por GPU (RTX 5090, concurrencia 1 a nivel de imagen) permite montar servicios de parseo masivo con pocas instancias, especialmente combinado con la variante DSpark (+55% de eficiencia).
- Integración en flujos de agentes: el modelo se integra en workflows de agente mediante su API y SDK, por ejemplo como paso de ingesta documental en agentes de análisis.

## Benchmarks y rendimiento

| Benchmark | MiniCPM-OCR 1.0 |
|---|---|
| Real5-OmniDocBench | 93,68 |
| OCRBench v2 | 54,7 |
| OmniDocBench v1.6 | líder entre modelos open source comparados (valor numérico exacto no disponible en la model card) |
| Wild-OmniDocBench | resultados líderes (valor numérico exacto no disponible) |
| olmOCR-Bench | resultados líderes (valor numérico exacto no disponible) |
| CHAOS-Bench | evaluado (valor numérico exacto no disponible) |

Datos de throughput (RTX 5090, OmniDocBench v1.6 completo, 1651 imágenes, concurrencia 1 a nivel de imagen, configuraciones aceleradas):

| Sistema | Throughput relativo |
|---|---|
| MiniCPM-OCR 1.0 | 1,2 páginas/s (1,00×, referencia) |
| PaddleOCR-VL-1.6 | ~0,67× (MiniCPM-OCR es 1,49× más rápido) |
| MinerU2.5 Pro | ~0,28× (MiniCPM-OCR es 3,62× más rápido) |

Nota: los scores de distintos benchmarks no son directamente comparables entre sí. La puntuación media de igual peso sobre los cuatro benchmarks principales de parseo es la más alta entre los modelos open source comparados.

## Requisitos de hardware

- VRAM estimada: con pesos AWQ W4A16 de 1,9 GB, la inferencia debería ser viable en GPUs con 6-8 GB de VRAM (estimación razonable para un modelo de 1,3B en 4 bits más el codificador visual y KV-cache; la model card no publica una cifra oficial).
- La variante BF16 requiere notablemente más memoria (del orden de 3-4 GB solo en pesos para 1,3B parámetros, más overhead); cifra exacta no disponible.
- Consumer GPUs: sí, cabe en GPUs de consumo; la model card usa una NVIDIA GeForce RTX 5090 para sus mediciones de throughput (1,2 páginas/s). Con AWQ, GPUs como la RTX 3060 de 12 GB o superior deberían ser suficientes (estimación).
- Despliegue: vLLM, SGLang, llama.cpp y Ollama soportados oficialmente desde el lanzamiento; también disponible API gratuita y demos online de ModelBest.
- Latencia y throughput: 1,2 páginas/s en RTX 5090 con concurrencia de imagen 1; el throughput real depende del contenido de la página, backend, concurrencia y hardware. La variante DSpark mejora la eficiencia end-to-end un 55%.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion disponible | Throughput relativo | Licencia |
|---|---|---|---|---|
| MiniCPM-OCR 1.0 (este modelo, AWQ) | 1,3B | AWQ W4A16, BF16, GGUF, DSpark | 1,00× (1,2 pág/s en RTX 5090) | Apache 2.0 |
| PaddleOCR-VL-1.6 | no disponible | no disponible | ~0,67× | no disponible |
| MinerU2.5 Pro | no disponible | no disponible | ~0,28× | no disponible |

MiniCPM-OCR 1.0 presenta la mejor relación calidad-throughput entre los modelos open source comparados por OpenBMB, con la mayor media de igual peso en OmniDocBench v1.6, Real5-OmniDocBench, Wild-OmniDocBench y olmOCR-Bench. Su tamaño de 1,3B lo hace además notablemente más ligero que la mayoría de alternativas VLM de OCR, que suelen superar los 2B parámetros.

## Limitaciones y advertencias

- Soporte de idiomas limitado a inglés y chino; el rendimiento en otros idiomas (incluido el castellano) no está evaluado en la model card y puede ser inferior.
- Es un modelo especializado en documentos con texto como protagonista; su rendimiento en tareas generales de visión-lenguaje o conversación abierta no está documentado.
- Los benchmarks publicados proceden del propio autor del modelo; aunque ofrecen una guía de reproducción, conviene validar con datos propios antes de producción.
- Riesgo de alucinación inherente a modelos generativos: en parseo documental puede inventar contenido en zonas ilegibles o ambiguas; se recomienda validación en flujos críticos.
- La cuantización AWQ W4A16 puede introducir una ligera degradación respecto a la variante BF16; no se publican métricas comparativas entre ambas.
- La licencia Apache 2.0 no impone restricciones al uso comercial, pero se deben respetar los avisos estándar de la licencia.
- El throughput real depende del contenido de la página, backend, concurrencia y hardware; las cifras de 1,2 páginas/s corresponden a una configuración concreta (RTX 5090, OmniDocBench v1.6).

## Enlaces

- Repositorio del modelo (AWQ): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-AWQ
- Modelo base (BF16): https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Variante DSpark: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Variante DSpark GGUF: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Familia MiniCPM-V: https://github.com/openbmb/MiniCPM-V
- Demo oficial (China): https://platform.modelbest.cn/console/playground/document-parse
- Demo oficial (Global): https://platform.modelbest.ai/console/playground/document-parse
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-OCR
- API gratuita: https://platform.modelbest.ai/console/docs/api/document-parse
- Guía de uso: https://github.com/OpenBMB/MiniCPM-OCR#using-minicpm-ocr
- Guía de reproducción de benchmarks: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/benchmark_reproduction_en.md
