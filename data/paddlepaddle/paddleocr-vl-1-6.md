# PaddlePaddle/PaddleOCR-VL-1.6

## Resumen

PaddleOCR-VL-1.6 es un modelo vision-language (VLM) ligero de 0.9B parámetros desarrollado por el equipo de PaddlePaddle, especializado en parsing de documentos. Es la tercera iteración de la serie PaddleOCR-VL y supone una mejora significativa sobre su predecesor, el 1.5, al que supera en 1.8 puntos porcentuales en el benchmark OmniDocBench (96.3% frente a 94.5%). El modelo está diseñado para convertir documentos en formato PDF o imagen en datos estructurados, cubriendo tareas como reconocimiento de texto, layout, tablas, fórmulas, gráficos, sellos y caracteres poco comunes.

La arquitectura se basa en ERNIE4.5, el modelo fundacional de Baidu, y está optimizada específicamente para tareas de comprensión documental. Su tamaño reducido (958 millones de parámetros) lo hace especialmente atractivo para despliegue en producción, ya que puede ejecutarse en GPUs de consumo con cuantización. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y soporta múltiples idiomas con especial énfasis en inglés, chino y capacidades multilingües.

La relevancia actual de este modelo radica en que aborda el cuello de botella del parsing documental en la era de los LLMs: convertir documentos complejos (con tablas, fórmulas, sellos y layouts variados) en datos estructurados que puedan alimentar pipelines de RAG o fine-tuning. Su rendimiento supera a modelos generalistas mucho más grandes en tareas específicas de documentos, como se demuestra en los benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERNIE4.5 (vision-language transformer) |
| Parametros totales | 958.588.736 (0.9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors; se espera compatibilidad con cuantizacion estandar) |
| Idiomas soportados | ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PaddleOCR-VL-1.6 es un modelo denso basado en la arquitectura ERNIE4.5, que combina un encoder visual con un decoder de lenguaje para tareas image-to-text. A diferencia de los modelos MoE, todos los parámetros se activan en cada inferencia, lo que simplifica el despliegue y reduce la latencia. El modelo está construido sobre PaddleOCR, la librería de PaddlePaddle para OCR y parsing documental, y hereda la capacidad de su predecesor para manejar documentos complejos.

El entrenamiento se realizó mediante un proceso de post-entrenamiento progresivo que incluye dos fases principales. Primero, se aplicó un marco de optimización de datos consciente de la región (region-aware data optimization framework), que identifica y refuerza las áreas donde el modelo anterior (1.5) mostraba debilidades, como caracteres poco comunes, documentos antiguos, sellos y gráficos. Segundo, se empleó una receta de post-entrenamiento basada en selección curada de datos y reinforcement learning, lo que permitió mejorar la precisión sin aumentar significativamente el tamaño del modelo. El resultado es un modelo que alcanza 96.3% de precisión en OmniDocBench v1.6, superando a modelos generalistas mucho más grandes.

## Capacidades

- Reconocimiento de texto (OCR) en documentos escaneados y digitales, con soporte para caracteres latinos, chinos y multilingües.
- Parsing de layout: identificación y estructuración de secciones, párrafos, columnas y otros elementos de diseño.
- Reconocimiento de tablas: extracción de estructura tabular y contenido celular, incluyendo tablas complejas con celdas fusionadas.
- Reconocimiento de fórmulas: conversión de fórmulas matemáticas impresas o manuscritas a formato LaTeX.
- Reconocimiento de gráficos y diagramas: identificación de elementos visuales y su relación con el texto circundante.
- Reconocimiento de sellos: detección y extracción de sellos y marcas de agua, útil en documentos oficiales.
- Spotting: localización y reconocimiento simultáneo de texto y objetos en la imagen.
- Capacidad conversacional: el modelo puede interactuar con el usuario sobre el contenido del documento, respondiendo preguntas sobre el texto, layout o estructura.
- Soporte multilingüe: funciona en inglés, chino y otros idiomas, con especial fortaleza en documentos asiáticos.
- Capacidades mejoradas en documentos antiguos, caracteres poco comunes y sellos, gracias al entrenamiento dirigido de la versión 1.6.

## Casos de uso

- Digitalización de documentos históricos: el modelo puede procesar documentos antiguos con caracteres poco comunes o degradados, extrayendo el texto y la estructura para su archivo digital. Su entrenamiento específico en este tipo de contenido lo hace especialmente adecuado para bibliotecas y archivos.
- Automatización de procesos de back-office: extracción de datos de facturas, contratos y formularios para alimentar sistemas ERP o CRM. La combinación de OCR, layout y reconocimiento de tablas permite capturar campos estructurados sin intervención manual.
- Pipeline RAG para documentación técnica: conversión de manuales, patentes y papers científicos en texto estructurado con tablas y fórmulas preservadas, listo para indexación vectorial y recuperación aumentada.
- Análisis de documentos financieros: parsing de informes anuales, estados financieros y prospectos donde las tablas y los gráficos son tan importantes como el texto. El modelo puede extraer tanto los datos numéricos como su contexto visual.
- Asistente conversacional sobre documentos: integración del modelo en chatbots que responden preguntas sobre el contenido de un documento específico, gracias a su capacidad image-text-to-text y su habilidad para mantener conversaciones contextuales.
- Procesamiento de documentos oficiales con sellos: verificación y extracción de información de documentos gubernamentales, certificados o contratos donde los sellos son un elemento crítico. El modelo puede detectar y transcribir el contenido del sello junto con el resto del documento.
- Generación de datos de entrenamiento: uso del modelo para crear datasets etiquetados de documentos estructurados, que luego pueden usarse para fine-tuning de modelos más pequeños o específicos.

## Benchmarks y rendimiento

Según la información publicada, PaddleOCR-VL-1.6 alcanza un 96.3% de precisión en el benchmark OmniDocBench v1.6, superando a su predecesor (94.5% en v1.5) y a modelos generalistas de mayor tamaño. No se han publicado resultados detallados para benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en tareas de documento y no en razonamiento general.

| Benchmark | PaddleOCR-VL-1.6 | PaddleOCR-VL-1.5 |
|---|---|---|
| OmniDocBench v1.6 | 96.3% | no aplica |
| OmniDocBench v1.5 | no disponible | 94.5% |

La documentación indica que el modelo lidera en reconocimiento de texto, fórmulas y tablas, con mejoras significativas en documentos antiguos, caracteres poco comunes, sellos y gráficos. No se dispone de comparativas públicas con otros modelos de la misma categoría (como MinerU o GOT-OCR) en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en FP16 (considerando 0.9B parámetros), alrededor de 1 GB en INT8 y menos de 1 GB en INT4.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para FP16. Para producción con alta concurrencia, se recomienda RTX 4090, A100 o H100.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en GPUs como RTX 3060 (12 GB), RTX 4060 (8 GB) o incluso en versiones cuantizadas en GPUs con 4 GB.
- Opciones de despliegue: vLLM (con recetas disponibles en recipes.vllm.ai), PaddleOCR (librería nativa), y potencialmente llama.cpp u Ollama para cuantización GGUF (aunque no se confirma en la documentación).
- Latencia y throughput: no se han publicado cifras oficiales. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por imagen en GPUs modernas, con throughput de decenas de requests por segundo en configuraciones con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OmniDocBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6 | 0.9B | no disponible | 96.3% (v1.6) | Apache 2.0 | HuggingFace, ModelScope |
| PaddleOCR-VL-1.5 | 0.9B | no disponible | 94.5% (v1.5) | Apache 2.0 | HuggingFace, ModelScope |
| PaddleOCR-VL-1.0 | no disponible | no disponible | inferior al 1.5 | Apache 2.0 | HuggingFace, ModelScope |

No se dispone de información pública sobre comparativas directas con otros modelos de parsing documental como MinerU, GOT-OCR2.0 o Nougat en los resultados de búsqueda. La documentación menciona que supera a modelos generalistas grandes, pero no se especifican nombres ni cifras concretas.

## Limitaciones y advertencias

- Sesgos potenciales: al estar entrenado principalmente con documentos en inglés y chino, el rendimiento en otros idiomas puede ser inferior, especialmente en escrituras no latinas o con diacríticos poco comunes.
- Riesgo de alucinación: como todo modelo generativo, puede inventar contenido en documentos ambiguos o de baja calidad. Es recomendable validar la salida en documentos críticos.
- Limitaciones de contexto: no se ha publicado la longitud máxima de contexto, lo que puede limitar el procesamiento de documentos muy extensos en una sola pasada.
- Dependencia de la calidad de imagen: el rendimiento degrada significativamente con imágenes de baja resolución, rotadas o con ruido. Se recomienda preprocesar las imágenes antes de la inferencia.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar los términos de la librería PaddleOCR y las dependencias asociadas.
- Caveat de producción: aunque el modelo es ligero, el despliegue en producción requiere considerar la latencia de preprocesamiento de imágenes (resize, normalización) que puede dominar el tiempo total de respuesta en documentos grandes.

## Enlaces

- HuggingFace: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- ModelScope: https://modelscope.cn/models/PaddlePaddle/PaddleOCR-VL-1.6
- Repositorio GitHub: https://github.com/PaddlePaddle/PaddleOCR
- Documentación oficial: https://www.paddleocr.ai/main/en/version3.x/algorithm/PaddleOCR-VL/PaddleOCR-VL-1.6.html
- Recetas vLLM: https://recipes.vllm.ai/PaddlePaddle/PaddleOCR-VL-1.6
- Paper (referencia en tags): arxiv:2606.03264
