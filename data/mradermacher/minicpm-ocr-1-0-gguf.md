# mradermacher/MiniCPM-OCR-1.0-GGUF

## Resumen

MiniCPM-OCR-1.0-GGUF es la distribución en formato GGUF del modelo MiniCPM-OCR 1.0, un modelo vision-language especializado en OCR y parsing de documentos desarrollado por OpenBMB. Esta versión concreta ha sido cuantizada por mradermacher para su uso con llama.cpp y otras herramientas compatibles con GGUF. El modelo base cuenta con aproximadamente 752 millones de parámetros (etiquetado como 1.3B por el autor) y está diseñado específicamente para tareas de comprensión de documentos centradas en texto.

El modelo aborda el problema del reconocimiento óptico de caracteres y la extracción estructurada de información en documentos, cubriendo texto plano, tablas, fórmulas matemáticas, gráficos y sellos, tanto en documentos en inglés como en chino. Es el primer modelo específico de OCR dentro de la familia MiniCPM-V/o de OpenBMB, lo que lo posiciona como una alternativa ligera y especializada frente a modelos de propósito general más grandes.

La relevancia de esta distribución GGUF radica en que permite desplegar el modelo en hardware de consumo, con cuantizaciones que van desde 0.5 GB (Q2_K) hasta 1.6 GB (f16), facilitando su integración en pipelines locales de procesamiento de documentos sin necesidad de GPUs de datacenter. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (no disponible el detalle exacto de la arquitectura interna) |
| Parámetros totales | 752.167.744 (etiquetado como 1.3B por el autor) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna específica del modelo base más allá de su naturaleza vision-language y su orientación a la comprensión de documentos. El modelo combina un componente visual (vision projector, distribuido como archivo mmproj separado en la versión GGUF) con un modelo de lenguaje de aproximadamente 752 millones de parámetros. El modelo base está etiquetado como MiniCPM-OCR 1.0 (1.3B) por OpenBMB, aunque el recuento real de parámetros en safetensors es de 752.167.744.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card del repositorio GGUF es una plantilla estándar de mradermacher que no incluye detalles arquitectónicos del modelo original. Para obtener información completa sobre arquitectura y entrenamiento, es necesario consultar el repositorio base de OpenBMB.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) en documentos e imágenes, con soporte para inglés y chino.
- Parsing de documentos que combina texto, tablas, fórmulas, gráficos y sellos en una única salida estructurada.
- Reconocimiento de tablas: extracción y estructuración de datos tabulares presentes en documentos.
- Reconocimiento de fórmulas matemáticas: identificación y transcripción de expresiones matemáticas.
- Reconocimiento de gráficos: interpretación de charts presentes en documentos.
- Reconocimiento de sellos: detección y transcripción de sellos en documentos (relevante para documentos oficiales chinos).
- Extracción de información clave (key information extraction): obtención de campos estructurados a partir de documentos.
- Procesamiento de PDFs: el modelo está diseñado para trabajar con documentos PDF además de imágenes.
- Capacidad multimodal: integra un vision projector (mmproj) para procesar entradas visuales junto con texto.
- No se ha confirmado soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Digitalización de archivos administrativos: el modelo puede procesar documentos escaneados en inglés y chino, extrayendo texto, tablas y sellos en una sola pasada, lo que resulta adecuado para digitalizar fondos documentales con estructuras heterogéneas.
- Extracción de datos de facturas y formularios: gracias a su capacidad de key information extraction y reconocimiento de tablas, puede integrarse en pipelines de contabilidad para extraer campos como importes, fechas y conceptos de facturas escaneadas.
- Procesamiento de literatura científica: el reconocimiento de fórmulas matemáticas y gráficos permite extraer contenido estructurado de papers en PDF, facilitando la indexación y búsqueda de expresiones matemáticas.
- Automatización de ingestion de documentos legales: los documentos legales suelen contener sellos y tablas; el modelo puede extraer estos elementos junto con el texto para alimentar sistemas de gestión documental.
- Análisis de informes financieros: la combinación de tablas, gráficos y texto permite extraer datos de informes trimestrales en PDF para su posterior análisis cuantitativo.
- Despliegue en entornos con recursos limitados: con cuantizaciones desde 0.5 GB, el modelo puede ejecutarse en CPUs y GPUs de consumo, lo que lo hace adecuado para aplicaciones de OCR en dispositivos locales o entornos sin acceso a GPUs de datacenter.
- Preprocesamiento para RAG sobre documentos: la extracción estructurada de texto y tablas puede alimentar pipelines de retrieval-augmented generation que necesiten indexar documentos escaneados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0.5 GB (Q2_K) y 1.6 GB (f16) para los pesos del modelo, más el vision projector (0.7 GB para mmproj-Q8_0 o 1.0 GB para mmproj-f16). En total, el despliegue completo requiere aproximadamente entre 1.2 GB y 2.6 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo con cuantizaciones bajas. Para mayor comodidad, se recomiendan GPUs con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas, incluidas las de gama media con 6 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y otras herramientas compatibles con GGUF. Para el modelo base en safetensors, se puede usar transformers con vLLM o TGI, aunque la información disponible no confirma compatibilidad explícita.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MiniCPM-OCR-1.0-GGUF (este) | 752M | no disponible | en, zh | Apache 2.0 | GGUF | Especializado en OCR y parsing de documentos |
| MiniCPM-V 2.6 | no disponible | no disponible | en, zh | no disponible | safetensors, GGUF | Modelo vision-language generalista de la misma familia |
| Qwen2-VL-2B | ~2B | no disponible | multilingüe | Apache 2.0 | safetensors, GGUF | Modelo vision-language generalista con capacidades OCR |
| Donut (OCR-free) | ~200M | no disponible | en | MIT | safetensors | Especializado en document understanding, sin OCR explícito |

La comparativa se basa en categorías generales; no se dispone de datos de rendimiento comparativo en la información proporcionada. MiniCPM-OCR-1.0 se distingue por su especialización en OCR y su tamaño reducido, mientras que modelos como Qwen2-VL-2B ofrecen mayor generalidad a costa de más parámetros.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos específicos del modelo. Al estar entrenado principalmente con documentos en inglés y chino, puede tener un rendimiento inferior en otros idiomas o en documentos con alfabetos no latinos o no chinos.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto plausible pero incorrecto en tareas de OCR, especialmente en documentos con baja calidad de imagen, ruido o caligrafía compleja. Se recomienda validación humana en aplicaciones críticas.
- Limitaciones de contexto o idioma: el modelo solo soporta oficialmente inglés y chino. No se ha especificado la longitud de contexto, lo que limita la planificación para documentos muy extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de licencia y la atribución correspondiente. No se identifican restricciones adicionales en la información disponible.
- Caveats para producción: la versión GGUF es una cuantización estática; las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar la precisión del OCR. Se recomienda Q4_K_M o superior para producción. Además, el vision projector (mmproj) debe descargarse por separado y cargarse junto con el modelo. No se dispone de información sobre el rendimiento en documentos con múltiples columnas, tablas complejas o sellos superpuestos.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/MiniCPM-OCR-1.0-GGUF
- Modelo base en Hugging Face: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- GGUF oficial de OpenBMB: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Página de descargas de mradermacher: https://hf.tst.eu/model#MiniCPM-OCR-1.0-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
