# SoMarkAI/OXR-1.0

## Resumen

OXR-1.0 (Optical Everything Recognition) es un modelo de código abierto desarrollado por SoMarkAI especializado en el parseo de documentos. Convierte PDFs e imágenes de documentos en datos estructurados listos para agentes, en formato Markdown o JSON, incluyendo coordenadas de layout. El modelo se presenta como una alternativa de alta precisión y velocidad para tareas de OCR y document parsing, un ámbito tradicionalmente dominado por pipelines multi-etapa y modelos de mayor tamaño.

El modelo cuenta con aproximadamente 1.534 millones de parámetros (1,3B según el autor) y se distribuye en formato safetensors con código personalizado. Según la model card, OXR-1.0 ocupa el primer puesto en tres benchmarks de referencia del sector (olmOCR-Bench, OmniDocBench y DocParsingBench), con especial ventaja en el parseo de tablas, y lidera las pruebas de velocidad entre modelos open source de document parsing sobre una RTX PRO 6000.

La innovación principal declarada es el uso de un bucle de auto-mejora recursiva (RSI) durante el post-entrenamiento, que el autor presenta como el primero aplicado a document parsing. Además, OXR independiza y hace intercambiable el módulo de análisis de layout, permitiendo sustituir el modelo de layout integrado por uno propio sin perder las capacidades de reconocimiento y orden de lectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de document parsing con módulo de layout pluggable; detalles de la arquitectura base no especificados) |
| Parametros totales | 1.534.378.216 (~1,3B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card muestra ejemplos en chino e inglés, pero no declara una lista oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer base ni la composición exacta del dataset de entrenamiento. El autor indica que el modelo fue preentrenado desde cero ("pretrained from scratch") y que durante el post-entrenamiento se empleó un bucle de auto-mejora recursiva (RSI), una técnica que el autor describe como pionera en el ámbito del document parsing. No se especifican el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO.

La innovación arquitectónica destacable a nivel de sistema es la separación del análisis de layout como módulo independiente e intercambiable. OXR mantiene el reconocimiento de contenido y la determinación del orden de lectura, mientras que el modelo de layout puede reemplazarse por uno personalizado. El modelo reconoce 13 tipos de elementos documentales (título, texto, tabla, fórmula, figura, pie de página, encabezado, nota al pie, sello, ecuación química, estructura química, bloque de código y leyenda), con salida en LaTeX, HTML/Markdown, SMILES o imagen según el tipo. El autor menciona además un rediseño del procesamiento a nivel de tarea para mejorar la velocidad de parseo.

## Capacidades

- Parseo de documentos: conversión de PDFs e imágenes a Markdown o JSON con coordenadas de bounding box.
- Reconocimiento de 13 tipos de elementos: texto, títulos, tablas (HTML/Markdown), fórmulas (LaTeX), figuras, encabezados, pies de página, notas al pie, leyendas, sellos, ecuaciones químicas (LaTeX con sintaxis mhchem), estructuras químicas (SMILES) y bloques de código.
- Análisis de layout pluggable: permite sustituir el modelo de layout integrado por uno propio.
- Manejo de documentos complejos: papers de examen en A3, periódicos, texto vertical y escritura manuscrita (se muestra ejemplo de manuscrito chino).
- Determinación del orden de lectura del documento.
- Salida orientada a agentes: datos estructurados listos para consumo por agentes.
- Tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible.
- Modo thinking, visión general, audio: no disponible (el modelo es específico de parsing documental, no un VLM de propósito general).

## Casos de uso

- Digitalización de archivos administrativos: convertir lotes de PDFs escaneados en Markdown/JSON estructurado con coordenadas, facilitando la indexación y búsqueda posterior en sistemas RAG.
- Extracción de tablas financieras: el modelo declara una ventaja amplia en parseo de tablas, por lo que resulta adecuado para informes anuales, balances y estados de resultados en HTML o Markdown.
- Procesamiento de literatura científica: reconocimiento de fórmulas en LaTeX, figuras y referencias, útil para construir bases de conocimiento de papers.
- Parseo de documentación técnica con código: los bloques de código se extraen como Markdown delimitado, lo que permite alimentar repositorios o sistemas de documentación.
- Química y farmacia: extracción de ecuaciones químicas (mhchem) y estructuras moleculares (SMILES) de publicaciones y patentes.
- Digitalización de exámenes y material educativo: manejo de papers A3, texto vertical y manuscritos, útil para plataformas de corrección automática.
- Ingesta para agentes: al producir datos "Agent-Friendly" con layout, se puede usar como etapa previa en pipelines de agentes que necesitan comprender documentos.
- Sustitución de layout personalizado: en dominios con reglas de segmentación propias (por ejemplo, formularios médicos o facturas), se puede integrar un modelo de layout específico manteniendo el reconocimiento de OXR.

## Benchmarks y rendimiento

El autor declara el primer puesto en olmOCR-Bench, OmniDocBench y DocParsingBench, y el primer puesto en velocidad entre modelos open source de document parsing sobre RTX PRO 6000. Sin embargo, los valores numéricos concretos de estos benchmarks no están incluidos en la información proporcionada; la model card remite a `docs/benchmark.md` del repositorio de GitHub para los resultados completos.

| Benchmark | Resultado | Comparativa |
|---|---|---|
| olmOCR-Bench | no disponible (declarado #1) | no disponible |
| OmniDocBench | no disponible (declarado #1) | no disponible |
| DocParsingBench | no disponible (declarado #1) | no disponible |
| Velocidad (RTX PRO 6000) | no disponible (declarado #1 open source) | no disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,53B parámetros, en FP16 se requieren aproximadamente 3,1 GB solo para pesos; en cuantizaciones de 8 bits bajaría a ~1,6 GB y en 4 bits a ~0,8 GB, más overhead de activaciones y del módulo de layout (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: el autor reporta pruebas de velocidad en RTX PRO 6000; por tamaño, el modelo es apto para GPUs consumer.
- Cabe en GPU consumer: sí, por el tamaño de parámetros (1,3B) es compatible con GPUs de 8 GB o menos en cuantización.
- Opciones de despliegue: no disponible en la información proporcionada (no se confirman vLLM, llama.cpp, Ollama ni TGI; el repo incluye custom_code, lo que sugiere dependencia de código propio).
- Latencia y throughput: el autor declara liderazgo en velocidad entre modelos open source sobre RTX PRO 6000, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos numéricos de los modelos comparables en la información proporcionada. La model card menciona que OXR lidera olmOCR-Bench, OmniDocBench y DocParsingBench, benchmarks en los que participan modelos de document parsing como los evaluados en dichos conjuntos, pero no se detallan sus resultados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OXR-1.0 | ~1,3B | no disponible | no disponible | Hugging Face, ModelScope, demo y API gratuita |
| Alternativas de document parsing | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia, por lo que el uso comercial no está garantizado y debe verificarse antes de producción.
- Idiomas no declarados oficialmente: aunque hay ejemplos en chino e inglés, no hay lista oficial de idiomas soportados.
- Contexto no especificado: se desconoce la longitud máxima de contexto, lo que afecta a documentos de muchas páginas.
- Riesgo de alucinación: como modelo generativo de reconocimiento, puede producir contenido incorrecto en tablas, fórmulas o texto manuscrito; se recomienda validación en dominios críticos.
- Dependencia de código personalizado (custom_code): puede requerir versiones específicas de librerías y complicar el despliegue estándar.
- Benchmarks no verificables numéricamente en la información disponible: las afirmaciones de SOTA provienen del autor y remiten a documentación externa.
- Modelo especializado: no es un modelo de propósito general; no cubre tool calling, agentes ni otras capacidades fuera del parsing documental.
- Sin paper publicado: el enlace a arXiv figura como "Coming Soon", por lo que no hay revisión técnica independiente disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SoMarkAI/OXR-1.0
- GitHub: https://github.com/SoMarkAI/OXR
- ModelScope: https://modelscope.cn/models/SoMark/OXR-1.0
- Demo online: https://free-oxr.somark.ai
- Resultados de benchmarks: https://github.com/SoMarkAI/OXR/blob/main/docs/benchmark.md
- README en chino: https://github.com/SoMarkAI/OXR/blob/main/README_CN.md
- Paper (arXiv): próximamente, según el autor
