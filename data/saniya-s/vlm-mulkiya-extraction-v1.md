# Saniya-s/vlm-mulkiya-extraction-v1

## Resumen

El modelo `vlm-mulkiya-extraction-v1`, publicado por Saniya-s, es un adaptador LoRA (PEFT) sobre el modelo multimodal Qwen/Qwen2-VL-2B-Instruct. Su propósito declarado es la extracción de información de documentos, probablemente orientada a tareas de OCR y captura de campos estructurados, aunque la model card no especifica el dataset ni las tareas concretas. El repositorio contiene únicamente los pesos del adaptador (4.2 GB) y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en su enfoque de fine-tuning eficiente sobre un VLM compacto de 2 mil millones de parámetros, lo que permite desplegarlo en entornos con recursos limitados. Sin embargo, la ausencia de documentación detallada y de benchmarks públicos dificulta evaluar su rendimiento real. El autor ha publicado otros modelos similares en el mismo dominio (OCR y extracción de documentos), lo que sugiere una línea de trabajo activa en este ámbito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen2-VL-2B-Instruct (transformer multimodal) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros; el modelo base tiene 2B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el modelo base Qwen2-VL-2B-Instruct soporta contexto largo, pero no se especifica en esta ficha) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador están en safetensors, sin cuantización declarada) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con la librería PEFT sobre el modelo base Qwen2-VL-2B-Instruct, un transformer multimodal que procesa imágenes y texto. El adaptador se añade a las capas de atención y MLP del modelo base, permitiendo un fine-tuning eficiente con un número reducido de parámetros entrenables. No se especifica la arquitectura interna del adaptador (rango, alpha, etc.) ni el dataset de entrenamiento, que se describe como "desconocido".

El entrenamiento se realizó durante 10 épocas con un learning rate de 0.0002, tamaño de batch efectivo de 8 (batch 4 con acumulación de gradientes 2), optimizador AdamW y scheduler lineal. La pérdida de validación final fue de 3.3506, un valor relativamente alto que sugiere que el modelo no ha convergido a una solución óptima o que la tarea es compleja. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Extracción de información de documentos: el nombre del modelo y los modelos previos del autor indican que está diseñado para extraer campos estructurados de imágenes de documentos (por ejemplo, formularios, identificaciones).
- Procesamiento multimodal: hereda las capacidades del modelo base Qwen2-VL-2B-Instruct para comprender imágenes y texto.
- Generación de texto: al ser un modelo de lenguaje instructivo, puede generar respuestas en formato texto a partir de entradas visuales y textuales.
- No se documentan capacidades específicas como tool calling, agentes o razonamiento multi-paso. La model card no aporta información adicional.

## Casos de uso

Dado que no hay documentación oficial sobre casos de uso, se enumeran aplicaciones plausibles basadas en la naturaleza del modelo (extracción de documentos) y en el contexto del autor:

- Digitalización de formularios: extraer campos como nombre, fecha, número de identificación a partir de escaneos.
- Procesamiento de facturas y recibos: capturar importes, proveedores y fechas para contabilidad automatizada.
- Extracción de datos de documentos de identidad: leer y estructurar información de pasaportes, DNI o licencias.
- Automatización de entrada de datos: convertir documentos físicos en registros digitales sin intervención manual.
- Archivado y búsqueda documental: indexar documentos escaneados mediante la extracción de metadatos clave.
- Asistencia en oficinas gubernamentales: procesar formularios oficiales (el término "mulkiya" puede referirse a documentos de residencia en algunos países del Golfo).

Estos usos son hipotéticos y requieren validación con el modelo real. La falta de benchmarks y de ejemplos de uso publicados impide confirmar su eficacia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un `model-index` vacío y solo reporta la pérdida de validación (3.3506), que no es comparable con métricas estándar como MMLU o HumanEval.

## Requisitos de hardware

- El adaptador LoRA es ligero, pero para inferencia se necesita cargar el modelo base Qwen2-VL-2B-Instruct completo. En FP16, el modelo base ocupa aproximadamente 4-5 GB de VRAM; el adaptador añade unos pocos cientos de MB.
- Se estima que una GPU con al menos 6 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, RTX 3060, RTX 4060). Con cuantización (por ejemplo, 4 bits), podría caber en GPUs de 4 GB.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería Transformers y PEFT. También es posible exportar a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan archivos preconvertidos.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de extracción de documentos. El único punto de referencia es el modelo base Qwen2-VL-2B-Instruct, del cual se desconoce el rendimiento específico en esta tarea. No se han identificado alternativas comparables en el ecosistema de modelos abiertos con características equivalentes.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se sabe qué tipo de documentos ni qué idiomas cubre, lo que limita la generalización.
- Pérdida de validación alta (3.35): indica un ajuste deficiente o una tarea difícil; el modelo puede producir errores frecuentes en la extracción.
- Sin benchmarks ni ejemplos de uso: no hay evidencia pública de su eficacia en tareas reales.
- Riesgo de alucinación: como todo modelo generativo, puede inventar información si la entrada es ambigua o está fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre los datos de entrenamiento puede plantear riesgos legales si se usan datos con derechos de autor.
- El modelo es un adaptador LoRA, por lo que requiere cargar el modelo base; no es un modelo independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saniya-s/vlm-mulkiya-extraction-v1
- Perfil del autor: https://huggingface.co/Saniya-s
- Modelo relacionado del autor: https://huggingface.co/Saniya-s/qwen2-vl-2b-mulkiya-ocr
- Otro modelo relacionado: https://huggingface.co/Saniya-s/nanonets-mulkiya-ocr (mencionado en la actividad del autor)
