# mradermacher/Xiaomi-OCR-0-vi-GGUF

## Resumen

Xiaomi-OCR-0-vi es un modelo vision-lenguaje (VLM) unificado de aproximadamente 0,8 mil millones de parámetros (100.592.896 según los pesos en safetensors), diseñado específicamente para el parseo de documentos y tareas de comprensión centradas en OCR. Parte de la base Qwen3.5-0.8B y ha sido desarrollado por el laboratorio SeerRay-Lab, con el sufijo "vi" que apunta a una variante orientada al vietnamita (no confirmado en la información disponible). El repositorio analizado, mradermacher/Xiaomi-OCR-0-vi-GGUF, es una conversión a formato GGUF realizada por el usuario mradermacher, no el modelo original.

El modelo resuelve el problema de extraer texto, estructura y contenido semántico de imágenes de documentos (facturas, formularios, capturas, PDFs escaneados) combinando percepción visual con generación de texto en un único transformer multimodal. Su relevancia actual radica en que los modelos OCR especializados de menos de 1B de parámetros permiten despliegue en hardware modesto, algo crítico para pipelines de digitalización a gran escala y procesamiento en el borde.

La conversión GGUF que nos ocupa incluye cuantizaciones estáticas en varios niveles de precisión (desde Q2_K hasta F16), lo que facilita su ejecución con llama.cpp y herramientas derivadas. No se dispone de información sobre licencia, idiomas soportados ni benchmarks en la información proporcionada para este repositorio concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer (basada en Qwen3.5-0.8B) |
| Parámetros totales | 100.592.896 |
| Parámetros activos | No disponible (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | No disponible (la variante "vi" sugiere vietnamita, sin confirmar) |
| Licencia | No disponible en este repositorio (el modelo base original se distribuye bajo Apache-2.0 según la model card de prithivMLmods) |
| Formato de pesos | GGUF (conversión desde safetensors del modelo nhtera/Xiaomi-OCR-0-vi) |

## Arquitectura y entrenamiento

Xiaomi-OCR-0 es un modelo vision-lenguaje unificado construido sobre Qwen3.5-0.8B. Según la información del repositorio GitHub de SeerRay-Lab, se entrena sobre un corpus centrado en OCR de aproximadamente 170 millones de muestras, e incorpora una técnica denominada Q-Mask text anchoring, junto con preentrenamiento continuado (CPT) y aprendizaje por refuerzo con tareas mixtas (Mix-RL). La combinación de percepción visual y decodificación de texto en un único transformer permite abordar tareas de parseo de documentos de extremo a extremo sin pipelines separados de detección y reconocimiento.

La conversión GGUF de mradermacher aplica cuantización estática (quantize_version: 2, output_tensor_quantised: 1) sobre los pesos del modelo nhtera/Xiaomi-OCR-0-vi. No se dispone de detalles adicionales sobre la composición exacta del dataset, la proporción de datos multilingües ni las fases de alineación (RLHF/DPO) en la información proporcionada. Tampoco se especifica si el modelo emplea atención lineal, decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Parseo de documentos: extracción de texto estructurado a partir de imágenes de documentos, formularios, facturas y capturas.
- OCR centrado en comprensión: no solo reconocimiento de caracteres, sino interpretación semántica del contenido (preguntas y respuestas sobre documentos).
- Respuesta a preguntas visuales (VQA): capacidad de responder preguntas sobre el contenido de una imagen.
- Extracción de información clave: identificación de campos y entidades relevantes en documentos.
- Generación de texto multimodal: descripción y transcripción de contenido visual.
- Conversación multimodal multi-turno: según las etiquetas del repositorio de prithivMLmods (conversational), aunque no confirmado para esta variante concreta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la variante "vi" sugiere orientación al vietnamita sin confirmación.

## Casos de uso

- Digitalización masiva de archivos: procesamiento por lotes de PDFs escaneados e imágenes para extraer texto y estructura, aprovechando el reducido tamaño (0,8B) que permite ejecutar múltiples instancias en una sola GPU.
- Automatización de facturación y contabilidad: extracción de campos clave (importes, fechas, emisores) de facturas y recibos en imágenes, integrándose en un pipeline de validación posterior.
- Gestión documental empresarial: clasificación y extracción de metadatos de contratos y formularios, con despliegue en servidores modestos o en el borde.
- Accesibilidad: transcripción de documentos e imágenes para usuarios con discapacidad visual, ejecutable localmente sin depender de APIs externas.
- Procesamiento en el borde (edge computing): al ser un modelo de menos de 1B de parámetros, puede desplegarse en dispositivos con recursos limitados para OCR en tiempo real (por ejemplo, escaneo con cámara de móvil).
- Extracción de información en flujos RAG: conversión de documentos escaneados a texto estructurado que alimente índices vectoriales para sistemas de recuperación aumentada.
- Análisis de capturas y paneles: interpretación de gráficos e imágenes de interfaz para tareas de monitorización o testing automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 100,6M de parámetros, el modelo en F16 ocupa aproximadamente 0,2 GB de pesos; las cuantizaciones Q4_K_M rondarían los 0,06-0,08 GB. El componente visual (mmproj) añade una cantidad no especificada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM puede ejecutar el modelo en cuantizaciones bajas; una RTX 3060 o superior ofrece margen holgado para lotes mayores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4060, etc.), e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp y herramientas basadas en GGUF (Ollama, LM Studio, llama-cpp-python). Para el modelo original en safetensors, podría usarse Transformers con soporte de visión, aunque no confirmado.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera latencia de decenas de milisegundos por imagen en GPU consumer, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xiaomi-OCR-0-vi (esta ficha) | 100,6M | No disponible | No disponible (base Apache-2.0) | GGUF, safetensors | Especializado en OCR y documentos |
| Xiaomi-OCR-0 (original) | ~0,8B | No disponible | Apache-2.0 | Safetensors, GGUF | Versión base de SeerRay-Lab |
| Qwen2.5-VL-3B | ~3B | 32K (aprox.) | Apache-2.0 | Safetensors, GGUF | VLM generalista, mayor tamaño |
| Florence-2-base | 0,23B | No disponible | MIT | Safetensors | Modelo de visión multitarea de Microsoft |

La comparativa se limita a modelos de la misma categoría (VLM pequeños para OCR); no se dispone de datos de rendimiento comparativo para esta variante concreta.

## Limitaciones y advertencias

- Licencia no especificada en este repositorio: aunque el modelo base original se publica bajo Apache-2.0, la conversión GGUF no declara licencia explícita; conviene verificar antes de uso comercial.
- Idiomas no documentados: la variante "vi" sugiere vietnamita, pero no se confirma el conjunto de idiomas soportados; el rendimiento en castellano es incierto.
- Riesgo de alucinación: como todo modelo generativo, puede inventar texto o campos en documentos con baja calidad de imagen o layouts atípicos.
- Contexto no especificado: se desconoce la ventana máxima, lo que limita la planificación para documentos muy extensos.
- Conversión de terceros: el repositorio es una cuantización no oficial de mradermacher; posibles pérdidas de precisión respecto al modelo original, especialmente en cuantizaciones Q2_K y Q3.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas OCR estándar (por ejemplo, comparativas con modelos especializados).
- Fecha de creación futura (2026): el repositorio indica una fecha de creación posterior a la actual, lo que puede indicar metadatos inconsistentes o un entorno de prueba; verificar la integridad de los archivos.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/mradermacher/Xiaomi-OCR-0-vi-GGUF
- Modelo original en Hugging Face: https://huggingface.co/nhtera/Xiaomi-OCR-0-vi
- Repositorio GitHub del proyecto: https://github.com/SeerRay-Lab/Xiaomi-OCR-0
- Conversión GGUF alternativa (prithivMLmods): https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF
- Model card de referencia con licencia Apache-2.0: https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF/blob/main/README.md
