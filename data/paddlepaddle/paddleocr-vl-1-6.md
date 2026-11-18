# PaddlePaddle/PaddleOCR-VL-1.6

## Resumen

PaddleOCR-VL-1.6 es un modelo de visión-lenguaje especializado en el análisis y extracción de contenido de documentos, desarrollado por el equipo PaddlePaddle (Baidu). Resuelve el problema del *document parsing* de alta fidelidad: convertir imágenes de páginas (escaneos, capturas, PDF renderizados) en texto estructurado, preservando layout, tablas, fórmulas, gráficos y sellos. Es la evolución de la familia PaddleOCR-VL, en esta versión con mejoras en el refinamiento de regiones infraoptimizadas y un post-entrenamiento progresivo.

El modelo tiene 958.588.736 parámetros (~0,96 mil millones) y se distribuye en formato safetensors con un repositorio de 1,9 GB. Está construido sobre la base de ERNIE4.5 (según los tags del autor) y se expone con la librería PaddleOCR, con pipeline `image-text-to-text`. Su licencia Apache 2.0 y su tamaño compacto lo hacen relevante para despliegues en producción donde el coste por página importa, frente a alternativas de mayor tamaño.

Es relevante ahora porque el parsing documental de calidad es un cuello de botella en pipelines RAG, digitalización de archivos y automatización de back-office, y este modelo aborda tareas que tradicionalmente requerían varios modelos especializados (detección de layout, reconocimiento de tablas, OCR de fórmulas, detección de sellos) en un único modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en ERNIE4.5 (transformer multimodal); detalles internos no disponibles |
| Parametros totales | 958.588.736 (~0,96 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien custom_code) |

## Arquitectura y entrenamiento

El modelo es un sistema visión-lenguaje que combina un codificador de imagen con un modelo de lenguaje para generar texto estructurado a partir de imágenes de documentos. El autor lo etiqueta como basado en ERNIE4.5 y lo integra en la librería PaddleOCR bajo el pipeline `image-text-to-text`, lo que implica una interfaz conversacional (image-text-to-text, tag `conversational`). No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación declarada en el título de la model card es doble: *under-optimized region refinement* (refinamiento de regiones que el modelo base tiende a procesar peor) y *progressive post-training* (post-entrenamiento progresivo). No se proporcionan detalles técnicos adicionales sobre estos mecanismos en la información disponible.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Análisis de layout: identificación y ordenación de bloques de texto, títulos, párrafos y secciones.
- Extracción y estructuración de tablas.
- Reconocimiento de fórmulas matemáticas.
- Interpretación de gráficos (chart).
- Detección y transcripción de sellos (seal).
- *Spotting*: localización de texto en la imagen además de su transcripción.
- Parsing documental completo (`document-parse`).
- Conversación multimodal image-text-to-text.
- Soporte multilingüe (inglés, chino y otros idiomas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso general: no disponible en la información proporcionada.

## Casos de uso

- Digitalización masiva de archivos escaneados: el modelo convierte páginas de PDF renderizadas en texto estructurado con layout preservado, adecuado para fondos documentales históricos o administrativos.
- Construcción de pipelines RAG sobre documentos: al extraer tablas, fórmulas y estructura de sección, el texto resultante se puede trocear y indexar con coherencia semántica, mejorando la recuperación frente a OCR plano.
- Procesamiento de facturas y formularios: la detección de layout y tablas permite extraer campos y líneas de detalle de documentos comerciales de forma estructurada.
- Extracción de contenido científico y técnico: el reconocimiento de fórmulas y gráficos facilita la conversión de artículos y manuales a formatos legibles por máquina.
- Verificación documental con sellos: la capacidad de detección de sellos sirve para validar la autenticidad o presencia de sellos en documentos oficiales.
- Digitalización multilingüe: con soporte para inglés, chino y otros idiomas, cubre corpus mixtos habituales en comercio internacional y organismos multilaterales.
- Anotación y enriquecimiento de datasets: el *spotting* (localización más transcripción) permite generar pares imagen-texto con coordenadas para entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~0,96 B de parámetros, en FP16 requiere aproximadamente 2 GB de pesos; en FP32 unos 4 GB. La VRAM total depende del codificador de imagen y del coste de atención sobre imágenes de alta resolución, no cuantificado en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer de gama media-alta (por ejemplo, RTX 3060 12 GB o superior) debería ser suficiente para inferencia en FP16.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del modelo; no confirmado explícitamente por el autor.
- Opciones de despliegue: la librería oficial es PaddleOCR (PaddlePaddle). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6 | ~0,96 B | no disponible | Parsing documental multimodal (layout, tablas, fórmulas, sellos) | Apache 2.0 | Hugging Face, ModelScope |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgos derivados de la distribución de los datos de entrenamiento (predominio de inglés y chino).
- Riesgo de alucinación: como modelo generativo, puede producir texto plausible ausente en la imagen, especialmente en regiones de baja calidad o degradadas.
- Limitaciones de idioma: el soporte declarado se centra en inglés y chino; el rendimiento en otras lenguas (incluido el español) no está cuantificado.
- Longitud de contexto: no especificada, lo que dificulta planificar el procesamiento de páginas densas o documentos de varias páginas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las dependencias de PaddlePaddle y el código `custom_code` asociado.
- Producción: al requerir `custom_code` y la librería PaddleOCR, la integración con stacks estándar de inferencia (vLLM, TGI) puede no ser directa; verificar compatibilidad antes de desplegar.
- No se documentan requisitos de resolución de imagen ni límites de tamaño de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Modelo en ModelScope: https://modelscope.cn/models/PaddlePaddle/PaddleOCR-VL-1.6
- Repositorio GitHub de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Paper (arXiv): https://arxiv.org/abs/2606.03264
