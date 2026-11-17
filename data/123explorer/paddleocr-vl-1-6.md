# 123explorer/paddleocr-vl-1.6

## Resumen

PaddleOCR-VL-1.6 es un modelo de visión-lenguaje especializado en el análisis y extracción de información de documentos, desarrollado por el equipo de PaddlePaddle (Baidu). Se distribuye en Hugging Face bajo el identificador `123explorer/paddleocr-vl-1.6` y está construido sobre la arquitectura ERNIE4.5, con la librería PaddleOCR como framework de referencia. El modelo resuelve el problema del parseo estructurado de documentos: detección de layout, tablas, fórmulas, gráficos, sellos y texto en imágenes, devolviendo representaciones textuales (Markdown, HTML o JSON) listas para su consumo aguas abajo.

Con aproximadamente 958 millones de parámetros (0,96 B), es un modelo compacto orientado a despliegue en producción, no a razonamiento general. Su relevancia actual radica en que cubre la franja de "OCR inteligente" con licencia Apache 2.0, lo que permite uso comercial sin restricciones y su integración en pipelines de digitalización documental, RAG sobre PDFs y automatización de procesos administrativos.

La versión 1.6 introduce, según el título de la model card, técnicas de "refinamiento de regiones suboptimizadas" y "post-entrenamiento progresivo", orientadas a mejorar la precisión en zonas difíciles del documento (baja resolución, solapamientos, sellos). El modelo soporta inglés, chino y otros idiomas, y se publica con pesos en `safetensors` y código personalizado (`custom_code`) para su carga con PaddlePaddle.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ERNIE4.5 (transformer multimodal visión-lenguaje), según tags del autor |
| Parámetros totales | 958.588.736 (~0,96 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,9 GB), con `custom_code` |

## Arquitectura y entrenamiento

El modelo se basa en ERNIE4.5, la familia multimodal de Baidu, adaptada aquí a una tarea de image-to-text orientada a documentos. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; únicamente se menciona un proceso de "post-entrenamiento progresivo" (*progressive post-training*) combinado con "refinamiento de regiones suboptimizadas" (*under-optimized region refinement*), lo que sugiere un entrenamiento por etapas con énfasis en regiones del documento donde el modelo base falla con más frecuencia (texto pequeño, tablas densas, sellos superpuestos).

La arquitectura concreta (número de capas, dimensión oculta, mecanismo de atención visual, resolución de entrada del encoder de imagen) no está disponible en la información proporcionada. El tamaño de ~0,96 B de parámetros y el repo de 1,9 GB son coherentes con un modelo de pesos en fp16/bf16 sin cuantizar. La integración con PaddleOCR como `library_name` indica que el modelo está pensado para ejecutarse dentro del ecosistema PaddlePaddle, con código personalizado para la carga y el preprocesado de imágenes.

## Capacidades

- Extracción de texto de imágenes y documentos (OCR) en inglés, chino y otros idiomas.
- Análisis de layout: identificación de bloques, columnas, encabezados y orden de lectura.
- Parseo de tablas a formatos estructurados (Markdown/HTML).
- Reconocimiento de fórmulas matemáticas.
- Interpretación de gráficos y figuras.
- Detección y lectura de sellos (*seal*).
- *Spotting*: localización de texto con coordenadas, no solo transcripción.
- Salida image-to-text conversacional (pipeline `image-text-to-text`).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- No se documenta modo *thinking*, audio ni vídeo.

## Casos de uso

- Digitalización masiva de PDFs escaneados: el modelo convierte páginas en Markdown estructurado preservando tablas y fórmulas, adecuado para archivos administrativos y técnicos con layout complejo.
- Construcción de pipelines RAG sobre documentación corporativa: la salida estructurada (layout + tablas) facilita el chunking semántico y mejora la recuperación frente a OCR plano.
- Extracción de datos de facturas y albaranes: la detección de tablas y *spotting* permite mapear campos (importes, fechas, conceptos) a un esquema JSON aguas abajo.
- Procesamiento de documentación científica: reconocimiento de fórmulas y gráficos para indexar papers y facilitar búsquedas sobre contenido matemático.
- Automatización de archivos con sellos y firmas: la capacidad de *seal detection* permite verificar presencia y ubicación de sellos en documentos oficiales.
- Digitalización de documentación multilingüe (chino-inglés): útil en contextos de comercio internacional, aduanas o traducción documental.
- Preprocesado para modelos mayores: usar PaddleOCR-VL-1.6 como extractor barato y rápido que alimente a un LLM de mayor tamaño, reduciendo coste por página.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 2 GB para los pesos, más overhead del encoder visual y del runtime (estimación orientativa de 3-5 GB en total; no confirmada por el autor).
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, así como en GPUs profesionales A10, L4, A100 y H100.
- Puede ejecutarse en CPU para cargas por lotes de baja frecuencia, dado el tamaño reducido del modelo.
- Opciones de despliegue: PaddlePaddle + PaddleOCR (framework nativo), y potencialmente conversión a otros runtimes; no se documenta soporte oficial de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| PaddleOCR-VL-1.6 | ~0,96 B | no disponible | Apache 2.0 | OCR y parseo documental |
| PaddleOCR-VL (versión previa) | no disponible | no disponible | Apache 2.0 | OCR y parseo documental |
| Qwen2.5-VL (variantes pequeñas) | 3 B / 7 B | 32 K+ (según variante) | Apache 2.0 (3B) / otras | Visión-lenguaje general |
| InternVL2.5 (variantes pequeñas) | 1 B / 2 B / 8 B | hasta 96 K (según variante) | MIT / Apache 2.0 (según variante) | Visión-lenguaje general |

Los datos de contexto y licencia de las alternativas corresponden a sus versiones publicadas; conviene verificar la variante concreta antes de decidir. PaddleOCR-VL-1.6 se posiciona como opción más ligera y especializada frente a modelos generalistas de visión-lenguaje, a costa de menor flexibilidad fuera de tareas documentales.

## Limitaciones y advertencias

- Modelo especializado: no es un LLM general; su uso fuera de tareas de documento (razonamiento abierto, código, matemáticas simbólicas) no está soportado por el diseño.
- Idiomas: la cobertura declarada es en/zh/multilingual, pero la calidad en idiomas distintos del inglés y el chino no está cuantificada.
- Riesgo de alucinación en regiones de baja calidad: texto borroso, sellos superpuestos o tablas mal alineadas pueden producir transcripciones incorrectas; conviene validar con umbrales de confianza.
- Dependencia del ecosistema PaddlePaddle: el uso de `custom_code` puede complicar la portabilidad a otros runtimes (PyTorch/Transformers) sin conversión adicional.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye "tal cual", sin garantías; el autor no ofrece soporte ni SLA.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación independiente; tratar los resultados como no auditados.
- El identificador `123explorer/paddleocr-vl-1.6` parece un espejo no oficial del modelo de PaddlePaddle; para producción se recomienda verificar contra el repo oficial `PaddlePaddle/PaddleOCR-VL-1.6`.
- No se documentan límites de longitud de contexto ni de resolución de imagen; probar con documentos reales antes de desplegar.

## Enlaces

- Hugging Face (espejo consultado): https://huggingface.co/123explorer/paddleocr-vl-1.6
- Hugging Face (repo oficial referenciado en la model card): https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Repositorio GitHub de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- ModelScope: https://modelscope.cn/models/PaddlePaddle/PaddleOCR-VL-1.6
- Paper referenciado en tags (arXiv): arxiv:2606.03264
