# openbmb/MiniCPM-OCR-1.0-GPTQ

## Resumen

MiniCPM-OCR 1.0 es un modelo multimodal especializado en reconocimiento óptico de caracteres (OCR) y comprensión de documentos, desarrollado por OpenBMB como primer miembro específico para OCR de la familia MiniCPM-V/o. Con 1.300 millones de parámetros, está diseñado para tareas centradas en texto: extracción de texto, tablas, fórmulas, gráficos, sellos y extracción de información estructurada (KIE), manteniendo un equilibrio entre calidad y velocidad en capturas del mundo real. El repositorio que nos ocupa es la versión cuantizada GPTQ W4A16 del modelo base en BF16.

La relevancia del modelo radica en su eficiencia: según la model card, alcanza 93,68 en Real5-OmniDocBench y 1,2 páginas por segundo, con una mejora del 55% en eficiencia de extremo a extremo cuando se combina con la decodificación acelerada DSpark. Su throughput es aproximadamente 1,49× el de PaddleOCR-VL-1.6 y 3,62× el de MinerU2.5 Pro, lo que lo posiciona como una opción atractiva para pipelines de parseo documental a escala.

La versión GPTQ reduce el peso del repositorio a 1,9 GB y facilita el despliegue en hardware modesto, manteniendo la licencia Apache 2.0 del modelo base. Está disponible en inglés y chino, con soporte para vLLM, SGLang, llama.cpp y Ollama desde el primer día.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text (familia MiniCPM-V/o); detalles internos no disponibles |
| Parametros totales | 1.300.434.160 (1,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16 (4-bit); existen variantes GGUF y BF16 del modelo base |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (GPTQ); GGUF disponible en el modelo base y DSpark |

## Arquitectura y entrenamiento

MiniCPM-OCR 1.0 es un modelo multimodal de tipo image-text-to-text perteneciente a la familia MiniCPM-V/o de OpenBMB. La información disponible no detalla la arquitectura interna (número de capas, tipo de atención, codificador visual, etc.), el número de tokens de entrenamiento ni la composición del dataset. Tampoco se especifica si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacada en la model card es la decodificación acelerada DSpark, disponible en variantes BF16 y GGUF, que mejora la eficiencia de extremo a extremo en un 55%. El modelo está optimizado para documentos del mundo real, incluyendo escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos recapturados. La versión de este repositorio aplica cuantización GPTQ de 4 bits con activaciones de 16 bits (W4A16) sobre los pesos BF16 originales.

## Capacidades

- Parseo de documentos con estado del arte: texto, tablas, fórmulas, gráficos y sellos en documentos e imágenes PDF.
- Manejo de documentos del mundo real: escaneos, páginas curvadas, fotografías, páginas inclinadas y recapturas.
- Extracción de información clave (KIE) para automatización posterior.
- Reconocimiento general de texto (OCRBench v2: 54,7).
- Procesamiento bilingüe inglés-chino.
- Soporte de despliegue en vLLM, SGLang, llama.cpp y Ollama.
- SDK de Python (pip), API completa y flujos de trabajo con agentes.
- Aplicación móvil iOS con parseo documental en dispositivo y offline.
- Posibilidad de fine-tuning adicional.
- Soporte de decodificación acelerada DSpark (variantes BF16 y GGUF).

## Casos de uso

- Digitalización masiva de archivos: el modelo procesa escaneos, páginas curvadas y documentos recapturados con 93,68 en Real5-OmniDocBench, lo que permite convertir fondos documentales en texto estructurado con alta fidelidad.
- Extracción de tablas y fórmulas en documentación técnica y científica: adecuado para pipelines que necesitan preservar la estructura de tablas y notación matemática en informes, artículos y manuales.
- Automatización de facturas y formularios (KIE): la capacidad de extracción de información clave permite alimentar sistemas de contabilidad o ERP a partir de documentos escaneados en inglés y chino.
- Procesamiento de PDF a escala con alto throughput: con 1,2 páginas/s y soporte para vLLM/SGLang, se puede desplegar en clústeres para ingesta documental masiva con latencia controlada.
- Digitalización en dispositivo y offline: la demo iOS permite parsear documentos en el propio teléfono sin conexión, útil para trabajo de campo o entornos con requisitos de privacidad.
- Pipelines de agentes documentales: el SDK de Python, la API y el soporte de agentes (SKILL.md) permiten integrar el modelo en flujos multi-paso que localizan, leen y estructuran documentos automáticamente.
- Despliegue en hardware modesto: la versión GPTQ de 4 bits (1,9 GB) facilita la inferencia en GPUs de consumo y entornos con VRAM limitada, manteniendo la calidad del modelo base.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Real5-OmniDocBench | 93,68 |
| OCRBench v2 | 54,7 |
| OmniDocBench v1.6 | líder entre modelos open source (valor numérico no disponible) |
| Wild-OmniDocBench | líder entre modelos open source (valor numérico no disponible) |
| olmOCR-Bench | líder entre modelos open source (valor numérico no disponible) |
| Throughput | 1,2 páginas/s |
| Throughput relativo | 1,49× PaddleOCR-VL-1.6; 3,62× MinerU2.5 Pro |
| Mejora con DSpark | 55% de eficiencia de extremo a extremo |

No se han publicado en la información disponible los valores numéricos concretos de OmniDocBench v1.6, Wild-OmniDocBench ni olmOCR-Bench, solo la indicación de que el modelo lidera entre los modelos open source comparados.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1,3B en GPTQ W4A16, los pesos ocupan aproximadamente 0,7-0,9 GB; con overhead de activaciones y contexto, se estima un uso de VRAM de 2-4 GB (estimación, no confirmada en la información disponible).
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría en RTX 3060/4060/4090, A100 y H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM (estimación).
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, imagen Docker oficial, SDK de Python y API.
- Latencia y throughput: 1,2 páginas/s según la model card; 55% de mejora con DSpark; 1,49× PaddleOCR-VL-1.6 y 3,62× MinerU2.5 Pro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 (GPTQ) | 1,3B | no disponible | 93,68 Real5-OmniDocBench; 54,7 OCRBench v2; 1,2 págs/s | apache-2.0 | Hugging Face, vLLM, SGLang, llama.cpp, Ollama |
| PaddleOCR-VL-1.6 | no disponible | no disponible | throughput 1,49× inferior a MiniCPM-OCR | no disponible | no disponible |
| MinerU2.5 Pro | no disponible | no disponible | throughput 3,62× inferior a MiniCPM-OCR | no disponible | no disponible |

Los datos de parámetros, contexto y licencia de PaddleOCR-VL-1.6 y MinerU2.5 Pro no están disponibles en la información proporcionada; solo se conocen sus cifras relativas de throughput frente a MiniCPM-OCR 1.0.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no se ha confirmado soporte para otros idiomas.
- La longitud de contexto no está especificada, lo que dificulta planificar el procesamiento de documentos muy extensos o de múltiples páginas en una sola pasada.
- Al ser un modelo especializado en OCR, su rendimiento en tareas generales de razonamiento o generación de texto fuera del dominio documental no está documentado.
- Riesgo de alucinación en la extracción de texto o información estructurada, especialmente en documentos de baja calidad, manuscritos o layouts complejos.
- La cuantización GPTQ de 4 bits puede introducir una degradación de calidad respecto al modelo BF16; no se han publicado métricas comparativas de la versión cuantizada frente a la original.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones de los componentes de terceros y del modelo base.
- La demo móvil de parseo documental es solo para iOS por el momento.
- No se dispone de información sobre sesgos específicos del modelo.

## Enlaces

- Hugging Face (GPTQ): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-GPTQ
- Modelo base BF16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Variante DSpark BF16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Variante DSpark GGUF: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- GitHub del proyecto: https://github.com/OpenBMB/MiniCPM-OCR
- Familia MiniCPM-V/o: https://github.com/openbmb/MiniCPM-V
- Guía de despliegue: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_tutorial_en.md
- Guía de reproducción de benchmarks: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/benchmark_reproduction_en.md
- Guía del modelo: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
- SKILL.md para agentes: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/SKILL_en.md
- Demo iOS: https://github.com/OpenBMB/MiniCPM-V-Apps/blob/main/README.md#11-ios-demo
- Playground (China): https://platform.modelbest.cn/console/playground/document-parse
- Playground (Global): https://platform.modelbest.ai/console/playground/document-parse
- Documentación de API (China): https://platform.modelbest.cn/console/docs/api/document-parse
- Documentación de API (Global): https://platform.modelbest.ai/console/docs/api/document-parse
- Discord: https://discord.gg/JE8KQqtdn
