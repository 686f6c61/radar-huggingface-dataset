# sabaridsnfuji/Qwen3-VL-4B-COMPASS-T-DINOv3

## Resumen

Este modelo es una adaptación del vision-language model Qwen3-VL-4B, publicada por el usuario sabaridsnfuji en Hugging Face. El nombre sugiere una integración de COMPASS-T, un componente orientado a comprensión documental, y DINOv3, un modelo de visión autosupervisado de Meta, sobre la base multimodal de Qwen3-VL. El autor se identifica como ingeniero de IA especializado en modelos multimodales, OCR y comprensión documental para inglés, japonés y tamil.

La ficha del modelo en Hugging Face es una plantilla autogenerada sin información sustantiva: no se especifican datos de entrenamiento, licencia, idiomas ni benchmarks. El repositorio ocupa solo 0,2 GB, lo que sugiere que podría tratarse de un adaptador (LoRA) o de pesos parciales en lugar de los pesos completos de un modelo de 4B parámetros. La relevancia actual radica en que Qwen3-VL es la familia de modelos visión-lenguaje más reciente de Alibaba, con soporte nativo de contextos intercalados de hasta 256K tokens, y esta variante busca especializarla en tareas de comprensión documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), basada en Qwen3-VL-4B con integración de COMPASS-T y DINOv3 |
| Parametros totales | 4B (base Qwen3-VL-4B; el adaptador publicado ocupa 0,2 GB) |
| Parametros activos | no disponible (la base Qwen3-VL-4B es densa, no MoE) |
| Longitud de contexto | 256K tokens en la base Qwen3-VL (no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el autor menciona inglés, japonés y tamil en su perfil) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en Qwen3-VL-4B, un modelo denso de 4 mil millones de parámetros que combina un codificador de visión con un decoder transformer de lenguaje, con soporte nativo para entradas intercaladas de texto, imágenes y vídeo. El nombre del repositorio indica la incorporación de COMPASS-T, un módulo especializado en comprensión de documentos, y DINOv3, un modelo de visión autosupervisado desarrollado por Meta que extrae características visuales robustas. La combinación sugiere un fine-tuning orientado a tareas de OCR y análisis documental.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se emplearon técnicas de RLHF o DPO. La model card no incluye hiperparámetros, régimen de entrenamiento ni detalles de preprocesamiento. El tamaño reducido del repositorio (0,2 GB) indica que probablemente se publicaron pesos de un adaptador o una versión parcial, no el modelo completo.

## Capacidades

- Comprensión de documentos: integra COMPASS-T, orientado a tareas de lectura y extracción de información en documentos estructurados y no estructurados.
- Percepción visual: incorpora características de DINOv3, lo que puede mejorar el reconocimiento de objetos y la comprensión espacial frente al codificador visual estándar de Qwen3-VL.
- Multimodalidad base: hereda de Qwen3-VL la capacidad de procesar texto, imágenes y vídeo de forma intercalada.
- Razonamiento visual: la base Qwen3-VL-4B soporta razonamiento de múltiples pasos sobre contenido visual, aunque no se ha confirmado que esta variante conserve todas las capacidades.
- Soporte de tool calling y agentes: disponible en la base Qwen3-VL, no confirmado en esta adaptación.
- Multilingüismo: el autor declara trabajar con inglés, japonés y tamil, pero no se especifican los idiomas soportados por este modelo concreto.

## Casos de uso

- Extracción de datos de facturas y recibos: el modelo puede localizar y transcribir campos clave (importes, fechas, proveedores) en documentos escaneados, aprovechando la combinación de COMPASS-T y DINOv3 para el reconocimiento de texto en entornos ruidosos.
- Digitalización de archivos históricos: adecuado para convertir documentos antiguos en texto estructurado, dado el enfoque del autor en OCR para múltiples idiomas.
- Análisis de formularios y cuestionarios: puede extraer respuestas manuscritas o impresas de formularios escaneados y estructurarlas en formato JSON.
- Comprensión de documentos técnicos y científicos: capaz de procesar figuras, tablas y texto intercalado en papers o manuales, gracias a la base Qwen3-VL con contexto largo.
- Asistente de atención al cliente con capturas de pantalla: puede interpretar imágenes de conversaciones o errores de interfaz y generar respuestas contextualizadas.
- Pipeline de verificación documental: integrable en flujos de validación de identidad o cumplimiento normativo donde se requiere comparar texto extraído con bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y no se han encontrado referencias externas que documenten el rendimiento de esta variante específica. La base Qwen3-VL-4B reporta resultados competitivos en benchmarks multimodales como MMMU, DocVQA y ChartQA, pero no se puede asumir que esta adaptación los conserve sin verificación.

## Requisitos de hardware

- VRAM estimada: no disponible para esta variante. La base Qwen3-VL-4B en precisión fp16 requiere aproximadamente 8-10 GB de VRAM para inferencia.
- GPU recomendadas: una RTX 3090, RTX 4090 o A10G sería suficiente para la base de 4B en fp16; el adaptador de 0,2 GB añade una carga mínima.
- Compatibilidad con GPU de consumo: sí, un modelo de 4B con cuantización de 4 bits puede ejecutarse en GPUs con 6 GB de VRAM o menos.
- Opciones de despliegue: compatible con transformers y endpoints de Hugging Face (etiqueta `endpoints_compatible`); podría desplegarse con vLLM o TGI si los pesos son compatibles, aunque no está confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen3-VL-4B (base) | 4B denso | 256K | Visión-lenguaje general | Apache 2.0 |
| Qwen3-VL-8B (base) | 8B denso | 256K | Visión-lenguaje general | Apache 2.0 |
| sabaridsnfuji/Qwen3-VL-4B-COMPASS-T-DINOv3 | 4B + adaptador | no disponible | Comprensión documental | no disponible |

La comparativa se limita a la base Qwen3-VL, ya que no se dispone de información suficiente sobre esta variante para compararla con otros modelos de comprensión documental como LayoutLMv3 o Donut. El rendimiento relativo frente a estas alternativas no puede determinarse sin benchmarks publicados.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin información verificable: no se documentan datos de entrenamiento, evaluación ni limitaciones específicas.
- Riesgo de alucinación visual: como cualquier modelo multimodal, puede generar descripciones incorrectas de contenido visual, especialmente en documentos complejos o de baja calidad.
- Sesgos desconocidos: al no publicarse el dataset de entrenamiento, no es posible evaluar sesgos demográficos, lingüísticos o culturales.
- Licencia no especificada: el uso comercial no está garantizado; se recomienda contactar al autor antes de desplegar en producción.
- Tamaño del repositorio inusual: 0,2 GB para un modelo de 4B sugiere que se trata de un adaptador o pesos parciales; puede no ser directamente utilizable como modelo autónomo.
- Sin garantía de conservación de capacidades: las habilidades de la base Qwen3-VL (tool calling, agentes, vídeo) podrían degradarse tras el fine-tuning.
- Sin soporte comunitario: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso o validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sabaridsnfuji/Qwen3-VL-4B-COMPASS-T-DINOv3
- Modelo relacionado del mismo autor: https://huggingface.co/sabaridsnfuji/Qwen3-VL-4B-COMPASS-T
- Perfil del autor: https://huggingface.co/sabaridsnfuji/models
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3-VL (arXiv): https://arxiv.org/pdf/2511.21631
