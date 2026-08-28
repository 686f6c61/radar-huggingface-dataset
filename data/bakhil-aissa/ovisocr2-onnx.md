# bakhil-aissa/OvisOCR2-onnx

## Resumen

OvisOCR2 es un modelo multimodal de última generación diseñado específicamente para el reconocimiento óptico de caracteres (OCR) y el análisis de documentos complejos. Desarrollado por el equipo ATH-MaaS, este modelo establece un nuevo estado del arte en el benchmark OmniDocBench v1.6 con una puntuación global de 96,58, siendo el primer modelo de extremo a extremo en encabezar una tabla que hasta ahora dominaban los enfoques basados en pipelines modulares. La arquitectura se basa en el modelo de lenguaje Qwen3.5, integrando una alineación estructural entre embeddings visuales y textuales.

La versión alojada en el repositorio `bakhil-aissa/OvisOCR2-onnx` es una conversión al formato ONNX del modelo original, lo que facilita su despliegue en entornos de producción con runtimes optimizados como ONNX Runtime. Con un tamaño de repositorio de 22,9 GB, esta variante está pensada para inferencia eficiente en servidores, manteniendo un equilibrio entre precisión y huella de despliegue. Aunque la ficha de HuggingFace del autor no proporciona metadatos completos (licencia, idiomas, pipeline), la información pública del proyecto original confirma su capacidad para tareas de OCR, extracción de información y parsing de documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal Large Language Model (MLLM) basado en Qwen3.5, con alineacion estructural de embeddings visuales y textuales |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX, posiblemente FP32/FP16) |
| Idiomas soportados | no disponible (se asume multilingue por la base Qwen3.5, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | ONNX (safetensors no aplicable, el repo contiene archivos .onnx) |

## Arquitectura y entrenamiento

OvisOCR2 se basa en una arquitectura MLLM (Multimodal Large Language Model) que integra un codificador visual con un modelo de lenguaje de tipo Qwen3.5. La innovación clave reside en el alineamiento estructural de los embeddings visuales y textuales, lo que permite una fusión más efectiva de la información de imagen y texto en comparación con métodos de proyección lineal convencionales. El modelo está entrenado de extremo a extremo, lo que le permite procesar documentos completos sin depender de módulos externos de detección o reconocimiento de texto.

Según la información disponible, el modelo logra un rendimiento sobresaliente en tareas de OCR de documentos, superando a los pipelines tradicionales que combinan detección, reconocimiento y postprocesado. No se han publicado detalles específicos sobre el volumen de datos de entrenamiento, el número de tokens procesados o el uso de técnicas como RLHF o DPO. La versión ONNX es una conversión del modelo original, manteniendo la arquitectura pero optimizada para inferencia con runtimes como ONNX Runtime.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de documentos completos, incluyendo texto impreso, tablas y diseños complejos.
- Parsing de documentos: extracción de estructura, tablas, listas y elementos gráficos.
- Comprensión multimodal de imagen y texto, alineando embeddings visuales y textuales de forma estructural.
- Soporte para tareas de extracción de información en documentos escaneados o digitalizados.
- Capacidad de razonamiento sobre el contenido visual y textual, gracias a la base Qwen3.5.
- No se ha confirmado soporte para tool calling, agentes o modos de razonamiento explícitos (thinking mode) en la información disponible.

## Casos de uso

- Digitalización de documentos empresariales: el modelo puede convertir facturas, contratos y formularios escaneados en texto estructurado y datos extraíbles, gracias a su capacidad de OCR de extremo a extremo y su alto rendimiento en OmniDocBench.
- Automatización de procesos de back-office: integración en flujos de trabajo para extraer campos clave (nombres, fechas, importes) de documentos heterogéneos, reduciendo la intervención manual.
- Indexación y búsqueda de documentos: uso del modelo para generar texto legible a partir de imágenes, permitiendo búsqueda semántica sobre archivos históricos o escaneados.
- Análisis de documentos científicos y técnicos: extracción de tablas, ecuaciones y referencias en papers o informes, con precisión superior a pipelines tradicionales.
- Accesibilidad: conversión de material impreso (libros, periódicos) a texto digital para lectores de pantalla o aplicaciones de lectura asistida.
- Asistencia en entornos legales y financieros: procesamiento de contratos, informes anuales y estados financieros para alimentar sistemas de análisis o cumplimiento normativo.

## Benchmarks y rendimiento

Según la información publicada en HuggingFace y ModelScope, OvisOCR2 obtiene una puntuación global de 96,58 en el benchmark OmniDocBench v1.6, estableciendo un nuevo estado del arte y siendo el primer modelo de extremo a extremo en liderar esta tabla. No se han publicado resultados detallados por subconjunto ni comparaciones con otros modelos en la información disponible.

| Benchmark | Puntuacion |
|---|---|
| OmniDocBench v1.6 (global) | 96,58 |

No se dispone de resultados adicionales (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- El tamaño del repositorio ONNX es de 22,9 GB, lo que sugiere que los pesos completos ocupan aproximadamente esa cantidad (posiblemente en FP32 o FP16). Se requiere una GPU con al menos 24 GB de VRAM para cargar el modelo completo en FP16, o más si se usa FP32.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), H100, o GPUs de consumo de gama alta como RTX 4090 (24 GB) podrían ser suficientes para FP16, pero con limitaciones de contexto o batch.
- No se dispone de información sobre cuantizaciones específicas (INT8, INT4) para esta versión ONNX, por lo que no se puede confirmar si cabe en GPUs de menor VRAM.
- Opciones de despliegue: al ser ONNX, se puede usar ONNX Runtime, así como servidores de inferencia compatibles como Triton Inference Server o FastAPI con ONNX Runtime. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos en la información proporcionada. Sin embargo, se puede contextualizar con otros modelos de OCR de documentos:

| Modelo | Tipo | Rendimiento en OmniDocBench | Formato |
|---|---|---|---|
| OvisOCR2 | MLLM end-to-end | 96,58 (estado del arte) | ONNX, PyTorch |
| Pipeline tradicional (detección + reconocimiento) | Modular | Inferior al 96,58 (dominaba previamente) | Variable |
| Otros MLLM OCR (p.ej. modelos basados en Qwen-VL) | MLLM | No especificado | Variable |

Dado que OvisOCR2 supera a los pipelines tradicionales, se posiciona como una alternativa superior para tareas de parsing de documentos, aunque no se dispone de datos de modelos competidores específicos.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, pero al ser un modelo multimodal entrenado con datos de documentos, podría presentar sesgos en el reconocimiento de ciertos tipos de letra, idiomas o formatos poco representados.
- Riesgo de alucinación en la interpretación de texto ambiguo o dañado, especialmente en documentos de baja calidad.
- La licencia no está especificada en el repositorio ONNX, lo que impide confirmar si es apto para uso comercial. Se debe consultar la licencia del modelo original ATH-MaaS antes de usarlo en producción.
- El modelo está optimizado para OCR de documentos; no se recomienda su uso para tareas generales de chat o generación de texto sin verificar su comportamiento.
- La versión ONNX puede tener limitaciones en cuanto a la longitud de contexto o el tamaño de imagen procesable, aunque estos parámetros no están documentados.
- Al ser una conversión no oficial (autor bakhil-aissa, no ATH-MaaS), es recomendable validar la integridad y el rendimiento de los pesos convertidos antes de su despliegue.

## Enlaces

- Repositorio HuggingFace del autor (versión ONNX): https://huggingface.co/bakhil-aissa/OvisOCR2-onnx
- Repositorio HuggingFace de ATH-MaaS (modelo original): https://huggingface.co/ATH-MaaS/OvisOCR2
- GitHub del proyecto Ovis: https://github.com/ATH-MaaS/Ovis
- Página en ModelScope: https://www.modelscope.cn/models/ATH-MaaS/OvisOCR2
- Colección de modelos ONNX (referencia general): https://github.com/onnx/models
