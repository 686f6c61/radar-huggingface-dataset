# OpenMed/OpenMed-PII-Japanese-QwenMed-XLarge-600M-v1

## Resumen

OpenMed-PII-Japanese-QwenMed-XLarge-600M-v1 es un modelo de clasificación de tokens (token classification) desarrollado por OpenMed, un ecosistema de IA clínica local-first con licencia Apache-2.0. Está diseñado específicamente para la detección de información personal identificable (PII) y de información sanitaria protegida (PHI) en texto clínico en japonés. El modelo se basa en un fine-tuning de Qwen/Qwen3-Embedding-0.6B, un modelo de embeddings de 600 millones de parámetros, adaptado para la tarea de reconocimiento de entidades nombradas (NER) orientada a la privacidad.

Este checkpoint resulta relevante en el contexto actual de cumplimiento normativo y protección de datos en el ámbito sanitario, donde la anonimización de historias clínicas y otros documentos médicos es un requisito crítico. Al ser un modelo compacto (595 millones de parámetros) y de código abierto, permite su despliegue en entornos locales o en dispositivos con recursos limitados, sin necesidad de enviar datos sensibles a la nube. La model card del autor indica que no se han publicado métricas de evaluación verificadas para japonés, por lo que se recomienda una validación exhaustiva antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en Qwen3-Embedding-0.6B) |
| Parametros totales | 595.854.412 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; existe una variante ONNX para Android) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tambien disponible en ONNX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-Embedding-0.6B, un modelo de embeddings de la familia Qwen3, y se ha ajustado mediante fine-tuning para la tarea de token classification. La arquitectura subyacente es un transformer encoder, aunque no se han publicado detalles adicionales sobre la configuración exacta de capas, cabezas de atención o dimensiones ocultas. El entrenamiento se ha realizado para detectar y clasificar tramos de texto que contienen PII/PHI, como nombres, direcciones de correo, números de teléfono, etc., en japonés.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del ajuste del modelo base. La model card indica que el mapeo `id2label` configurado es la fuente autoritativa para las etiquetas de entidades disponibles, y que se deben conservar los offsets de caracteres devueltos al aplicar redacción o reemplazo.

## Capacidades

- Detección de PII y PHI en texto clínico japonés, incluyendo identificadores directos como nombres, correos electrónicos, números de teléfono y posiblemente otros tipos de entidades definidas en el mapeo `id2label`.
- Clasificación de tokens a nivel de tramo (span) con estrategia de agregación simple, devolviendo etiquetas y offsets de caracteres.
- Integración sencilla con la librería Transformers mediante el pipeline `token-classification`.
- Funciona exclusivamente en japonés; no se reportan capacidades multilingües.
- No se documenta soporte para tool calling, agentes, razonamiento multi-paso ni modos de pensamiento explícitos.

## Casos de uso

- Anonimización de historias clínicas electrónicas: el modelo puede procesar notas médicas en japonés y marcar automáticamente los tramos que contienen datos personales, permitiendo su redacción antes de compartir los documentos con terceros o para fines de investigación.
- Cumplimiento de normativas de privacidad (p. ej., APPI en Japón): integrado en un flujo de procesamiento de documentos, ayuda a identificar y eliminar PII antes del almacenamiento o la transmisión, reduciendo el riesgo de filtraciones.
- Preparación de conjuntos de datos para investigación clínica: al eliminar identificadores directos de los textos, facilita la creación de datasets anonimizados que pueden compartirse sin violar la confidencialidad del paciente.
- Despliegue en dispositivos locales o móviles: gracias a su tamaño compacto y a la existencia de una variante ONNX para Android, puede ejecutarse en entornos sin conexión, lo que resulta útil en clínicas con requisitos estrictos de privacidad.
- Revisión de documentos legales o administrativos en el sector salud: el modelo puede señalar automáticamente datos personales en contratos, informes o formularios, agilizando la revisión manual.
- Auditoría de datos existentes: permite escanear bases de datos de texto clínico para localizar PII residual que deba ser tratada, como parte de programas de higiene de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no existe un artefacto de evaluación verificado para japonés y que no se reportan puntuaciones específicas del idioma. Se recomienda evaluar la recuperación de identificadores directos, los falsos negativos, los límites de los tramos y el cambio de dominio antes del despliegue.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 600 millones de parámetros, el tamaño en memoria es moderado: en FP32 ocuparía unos 2,4 GB, en FP16 unos 1,2 GB y en int8 unos 0,6 GB, aunque no se han publicado cifras oficiales de VRAM.
- Es adecuado para GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como para inferencia en CPU con cuantización (si se generan versiones GGUF o similares, aunque no se han publicado).
- La variante ONNX para Android sugiere que puede ejecutarse en dispositivos móviles con recursos limitados.
- Opciones de despliegue: la librería Transformers permite usar el pipeline de token-classification; también es compatible con text-generation-inference (según los tags) y con endpoints compatibles. No se mencionan vLLM, llama.cpp u Ollama, pero al ser un modelo de encoder, es probable que se pueda servir con frameworks de inferencia estándar.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para detección de PII en japonés dentro del ecosistema OpenMed o de otros proveedores. La búsqueda web no arrojó alternativas directas con las que comparar parámetros, contexto o rendimiento. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo puede omitir identificadores (falsos negativos) o sobredactar contexto clínicamente útil, lo que podría degradar la calidad de los datos anonimizados.
- No constituye una garantía de anonimización ni una determinación de cumplimiento normativo; no es un dispositivo médico.
- Solo está entrenado para japonés; no es aplicable a otros idiomas sin un nuevo fine-tuning.
- No se han publicado métricas de evaluación verificadas, por lo que su rendimiento real en producción es incierto.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3-Embedding-0.6B para confirmar que no existen restricciones adicionales.
- Para flujos de alta sensibilidad, se requiere defensa en profundidad y revisión humana.
- No se deben incluir datos reales de pacientes en ejemplos públicos, registros o informes de incidencias.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OpenMed/OpenMed-PII-Japanese-QwenMed-XLarge-600M-v1)
- [Variante ONNX para Android](https://huggingface.co/OpenMed/OpenMed-PII-Japanese-QwenMed-XLarge-600M-v1-onnx-android)
- [Repositorio GitHub de OpenMed](https://github.com/maziyarpanahi/openmed)
- [Sitio web de OpenMed](https://openmed.life/)
- [OpenMed AI - gobernanza de modelos clínicos](https://openmed-ai.org/index.html)
