# arlenecc/gliner2.5-multi-v1-onnx-int8

## Resumen

El modelo `arlenecc/gliner2.5-multi-v1-onnx-int8` es una conversión a formato ONNX con cuantización INT8 de un modelo GLiNER2, una arquitectura especializada en reconocimiento de entidades nombradas (NER) de tipo zero-shot, es decir, capaz de extraer entidades de un texto sin haber sido entrenada específicamente para esas categorías. El autor del repositorio es el usuario `arlenecc`, que actúa como distribuidor de la conversión, mientras que el modelo original GLiNER2 procede del ecosistema de investigación GLiNER (Generalist and Lightweight Named Entity Recognition).

La relevancia de esta ficha radica en su formato: al estar exportado a ONNX y cuantizado a INT8, el modelo está pensado para inferencia en CPU y en entornos con recursos limitados, sin necesidad de GPU ni de frameworks de deep learning pesados. El tamaño del repositorio (aproximadamente 0,3 GB) es coherente con un modelo compacto orientado a extracción de entidades en producción.

La información disponible es muy escasa: la model card no incluye descripción técnica, datos de entrenamiento, benchmarks ni idiomas soportados. Los detalles que se ofrecen a continuación se derivan del identificador del modelo, de sus tags (`onnx`, `gliner2`, `license:mit`) y del conocimiento general de la familia GLiNER2, y se marcan explícitamente como no disponibles cuando no pueden confirmarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (encoder transformer para NER zero-shot; arquitectura exacta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (exportación ONNX cuantizada) |
| Idiomas soportados | no disponible (el sufijo `multi` sugiere multilingüe, sin confirmar) |
| Licencia | MIT |
| Formato de pesos | ONNX (INT8) |

## Arquitectura y entrenamiento

La familia GLiNER2 emplea un encoder transformer bidireccional que puntúa pares (entidad, span de texto) para permitir extracción de entidades zero-shot: el usuario define las etiquetas en tiempo de inferencia y el modelo evalúa la probabilidad de que cada fragmento del texto corresponda a cada etiqueta. Esta conversión concreta aplica cuantización INT8 sobre el grafo ONNX para reducir el peso y acelerar la inferencia en CPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo ajuste fino con RLHF/DPO ni sobre innovaciones técnicas específicas de esta versión 2.5. La model card del repositorio únicamente declara la licencia MIT y no aporta detalles adicionales.

## Capacidades

- Extracción de entidades nombradas zero-shot: permite definir etiquetas arbitrarias en tiempo de inferencia sin reentrenamiento.
- Extracción de entidades multilingüe (presumiblemente, dado el sufijo `multi`; no confirmado en la documentación).
- Ejecución en CPU mediante ONNX Runtime, sin dependencia de GPU.
- Inferencia de baja latencia gracias a la cuantización INT8.
- Integración en pipelines ligeros de procesamiento de texto (clasificación de spans, extracción de relaciones simples si la arquitectura GLiNER2 lo soporta; no confirmado).
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible (no es un modelo generativo de propósito general).

## Casos de uso

- Extracción de entidades en documentos empresariales: el modelo puede procesar facturas, contratos o correos para identificar personas, organizaciones, fechas e importes definiendo las etiquetas en tiempo de ejecución, sin entrenamiento adicional.
- Anonimización de datos personales (PII): al ser zero-shot, permite detectar nombres, direcciones o identificadores con etiquetas personalizadas antes de almacenar o compartir textos, y su formato ONNX INT8 facilita el despliegue en servidores sin GPU.
- Enriquecimiento de bases de datos y motores de búsqueda: extracción de entidades de artículos o fichas para poblar índices y metadatos, ejecutándose en CPU a bajo coste.
- Procesamiento de texto en el borde (edge computing): al ser un modelo compacto en ONNX INT8, puede integrarse en aplicaciones de escritorio o dispositivos con recursos limitados para tareas de NER en local.
- Clasificación de tickets de soporte: identificación de productos, clientes y problemas mencionados en conversaciones, con etiquetas adaptadas al dominio de negocio.
- Preprocesado para pipelines de RAG: extracción de entidades de fragmentos de documentos para mejorar la recuperación y el filtrado antes de pasarlos a un modelo generativo.
- Análisis de reseñas y redes sociales: detección de marcas, productos y ubicaciones con etiquetas definidas por el analista, sin necesidad de un corpus etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU, el modelo INT8 de ~0,3 GB requeriría menos de 1 GB de VRAM, aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquiera con soporte de ONNX Runtime (por ejemplo, RTX 4090, A100, H100) para aceleración opcional; el modelo está diseñado para ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer con ONNX Runtime, e incluso sin GPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integración en Python mediante `onnxruntime`, y potencialmente en servidores de inferencia compatibles con ONNX (por ejemplo, Triton Inference Server); no se confirma soporte de vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| arlenecc/gliner2.5-multi-v1-onnx-int8 | no disponible | no disponible | ONNX INT8 | MIT | Conversión cuantizada para CPU |
| GLiNER2 (original) | no disponible | no disponible | PyTorch | no disponible | Modelo base del que deriva esta conversión |
| GLiNER (versión 1) | no disponible | no disponible | PyTorch | no disponible | Familia predecesora de NER zero-shot |
| spaCy NER | no disponible | no disponible | spaCy | MIT (modelos varían) | NER supervisado, no zero-shot |

No se dispone de datos suficientes para comparar rendimiento, parámetros o contexto con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo de extracción de entidades, puede heredar sesgos de los datos de entrenamiento del GLiNER2 original.
- Riesgo de alucinación limitado al ámbito de extracción: puede generar falsos positivos al asignar etiquetas a spans que no corresponden, especialmente con etiquetas ambiguas o poco representadas.
- Idiomas soportados no confirmados: el sufijo `multi` sugiere multilingüismo, pero no hay documentación que lo garantice.
- Longitud de contexto no disponible; textos muy largos pueden requerir fragmentación.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo GLiNER2 original del que deriva esta conversión.
- Al ser una conversión no oficial (autor `arlenecc`, no el equipo original de GLiNER), no hay garantías de paridad numérica con el modelo original ni de mantenimiento.
- La cuantización INT8 puede introducir una pérdida de precisión respecto al modelo en punto flotante; no se han publicado métricas de degradación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arlenecc/gliner2.5-multi-v1-onnx-int8
- Repositorio GLiNER (proyecto original): https://github.com/urchade/GLiNER
- Modelo GLiNER en Hugging Face: https://huggingface.co/urchade/gliner_multi
- ONNX Runtime: https://onnxruntime.ai/
