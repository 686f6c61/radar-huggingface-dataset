# nandraj/NaviDC-OCR-GGUF

## Resumen

NaviDC-OCR es un modelo de lenguaje y visión (VLM) ligero, de aproximadamente 751 millones de parámetros, desarrollado por StarDoc-AI para el análisis y parsing de documentos. A diferencia de otras soluciones que se centran exclusivamente en documentos digitales o en capturas de cámara, este modelo ofrece un marco unificado para ambos escenarios, lo que lo hace especialmente útil en entornos reales donde los documentos pueden presentar distorsiones, iluminación variable o calidad heterogénea.

El modelo está basado en la arquitectura Qwen2.5-VL e incorpora un proyector multimodal que permite procesar imágenes junto con texto. Sus capacidades incluyen OCR, extracción de texto, reconocimiento de tablas y fórmulas, análisis de layout, orden de lectura y comprensión de documentos científicos. El repositorio que nos ocupa, `nandraj/NaviDC-OCR-GGUF`, contiene conversiones a formato GGUF del modelo original, lo que permite su ejecución con llama.cpp y otras herramientas compatibles, tanto en CPU como en GPU, con distintas opciones de cuantización.

La relevancia actual de este modelo radica en su tamaño reducido, que lo hace viable para despliegues locales en hardware de consumo, y en su licencia Apache 2.0, que permite uso comercial sin restricciones. Es una opción interesante para proyectos que necesiten extraer información estructurada de documentos sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal con vision encoder y proyector) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible (el repositorio original no especifica; se ha visto referencia a ingles y chino en fuentes secundarias) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo original usa safetensors) |

## Arquitectura y entrenamiento

NaviDC-OCR emplea una arquitectura de transformer multimodal basada en Qwen2.5-VL, que combina un codificador de vision (vision encoder) con un modelo de lenguaje. El proyector multimodal (mmproj) se mantiene en un archivo GGUF separado, como es habitual en llama.cpp, para preservar la calidad de procesamiento de las imagenes. El modelo fue entrenado con una estrategia de aprendizaje desacoplado de contenido y estructura, disenada para modelar explicitamente las gramaticas de formulas y las estructuras de tablas, lo que mejora la representacion estructurada de los documentos.

Los detalles exactos del conjunto de datos de entrenamiento, el numero de tokens y el proceso de alineamiento (RLHF, DPO, etc.) no estan disponibles en la informacion proporcionada. El paper asociado (arxiv 2608.12898) describe la metodologia, pero no se incluyen cifras concretas en la documentacion publica del repositorio GGUF.

## Capacidades

- OCR y extraccion de texto: reconoce y transcribe texto impreso y manuscrito en imagenes de documentos, tanto digitales como capturadas con camara.
- Parsing de documentos: analiza la estructura del documento, incluyendo titulos, parrafos, listas y otros elementos de layout.
- Reconocimiento de tablas: identifica tablas y extrae su contenido de forma estructurada, preservando las relaciones entre celdas.
- Reconocimiento de formulas: detecta y transcribe formulas matematicas, tanto en formato LaTeX como en representacion visual.
- Analisis de layout y orden de lectura: comprende la disposicion espacial de los elementos y determina el orden logico de lectura.
- Manejo de documentos distorsionados: tolera imagenes con perspectiva, rotacion, sombras o baja calidad, gracias a su entrenamiento con capturas de camara.
- Comprension de documentos cientificos: procesa articulos, papers y otros contenidos academicos con notacion matematica y estructuras complejas.
- Soporte multimodal: acepta entradas de imagen y texto, permitiendo consultas contextuales sobre el contenido visual.

## Casos de uso

- Digitalizacion de archivos: convertir lotes de documentos escaneados (facturas, contratos, formularios) en texto estructurado y buscable, utilizando el modelo con cuantizacion Q4_K_M para ejecutarlo en un servidor modesto.
- Extraccion de datos de facturas: identificar campos clave como numeros de factura, fechas, importes y proveedores a partir de imagenes de facturas, gracias a su capacidad de reconocimiento de tablas y layout.
- Reconocimiento de formulas matematicas: transcribir ecuaciones de libros o apuntes escaneados a formato LaTeX, util en entornos educativos o de investigacion.
- Analisis de documentos cientificos: extraer titulos, autores, resumenes y referencias de articulos academicos en PDF, facilitando la creacion de bases de datos bibliograficas.
- Procesamiento de documentos con camara: en aplicaciones moviles, capturar documentos con el telefono y obtener una version digital limpia, incluso con iluminacion deficiente o perspectiva inclinada.
- Automatizacion de tramites administrativos: integrar el modelo en un pipeline que reciba imagenes de documentos de identidad o formularios y extraiga la informacion necesaria para validar o registrar datos.
- Asistente de lectura para personas con discapacidad visual: combinar el OCR con un sintetizador de voz para leer en voz alta el contenido de documentos impresos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original (arxiv 2608.12898) afirma que NaviDC-OCR alcanza un rendimiento de ultima generacion en diversos benchmarks de parsing de documentos, pero no se incluyen cifras concretas en la documentacion del repositorio GGUF. Por tanto, no es posible presentar una tabla comparativa con datos numericos verificados.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M, el modelo principal ocupa aproximadamente 0,4 GB, y el proyector multimodal (mmproj) en F16 alrededor de 0,1 GB. En total, unos 0,5 GB de VRAM para inferencia en GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas de consumo como GTX 1650, RTX 2060 o superiores. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con hardware de consumo: si, cabe en practicamente cualquier GPU moderna e incluso en sistemas con solo RAM (inferencia por CPU).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Para servidores, se puede usar vLLM con soporte para GGUF (aunque no es el caso mas habitual) o convertir a otro formato.
- Latencia y throughput: no se dispone de datos medidos. En una GPU de gama media (RTX 3060), se espera una velocidad de generacion de decenas de tokens por segundo, suficiente para tareas de OCR interactivas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros modelos de parsing de documentos. Alternativas como PaddleOCR-VL, MiniCPM-V o modelos propietarios (Google Document AI) existen, pero no se tienen datos de rendimiento comparables en la documentacion revisada. Se recomienda consultar el paper original para obtener resultados de evaluacion frente a otros sistemas.

## Limitaciones y advertencias

- Al ser un modelo relativamente pequeno (751M parametros), puede presentar errores en documentos muy complejos o con notacion matematica densa, comparado con modelos de mayor tamano.
- No se ha especificado la longitud de contexto, por lo que documentos muy extensos podrian superar la ventana de atencion del modelo.
- Los idiomas soportados no estan documentados oficialmente; aunque se ha visto referencia a ingles y chino, no hay garantia de calidad en otros idiomas.
- La conversion GGUF no ha sido entrenada ni ajustada por el mantenedor del repositorio; es una conversion directa del modelo original, por lo que cualquier limitacion del modelo base se mantiene.
- El proyector multimodal se proporciona en F16; se recomienda no cuantizarlo para preservar la calidad de procesamiento de imagenes.
- No se han publicado evaluaciones de sesgos o alucinaciones especificas para este modelo. Como cualquier VLM, puede generar texto plausible pero incorrecto al interpretar imagenes ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (Qwen2.5-VL) no tenga restricciones adicionales en su licencia original.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/nandraj/NaviDC-OCR-GGUF
- Repositorio original del modelo: https://huggingface.co/StarDoc-AI/NaviDC-OCR
- Repositorio GitHub del modelo original: https://github.com/caipeng328/NaviDC-OCR
- Paper en arXiv: https://arxiv.org/html/2608.12898v1
- Repositorio GGUF alternativo (konradjr007): https://huggingface.co/konradjr007/NaviDC-OCR-GGUF
