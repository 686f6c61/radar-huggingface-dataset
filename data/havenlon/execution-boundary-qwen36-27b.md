# Havenlon/Execution-Boundary-Qwen36-27B

## Resumen

Execution-Boundary-Qwen36-27B es un modelo de investigación de 27 000 millones de parámetros desarrollado por Havenlon, una organización centrada en infraestructuras para controlar la transición entre la intención de un sistema de IA y su ejecución en el mundo real. El modelo pertenece a la serie Execution Boundary y explora el razonamiento en torno a la separación entre gobernanza de ejecución (governance) y control físico de ejecución (execution control), así como conceptos como Final Veto, ejecución protegida y fronteras de confianza en hardware.

El modelo está etiquetado como `qwen3_5_text`, lo que sugiere que se basa en la arquitectura Qwen 3.5, aunque no se han publicado detalles técnicos adicionales. Su propósito declarado es servir como herramienta de análisis para arquitecturas de seguridad de agentes de IA, donde múltiples componentes deben cooperar sin que ninguno tenga autoridad ilimitada. Es un modelo de texto puro, orientado a razonamiento y discusión sobre políticas de ejecución, no a tareas generales de generación de contenido.

La relevancia actual radica en el creciente interés por la seguridad de agentes autónomos y la necesidad de mecanismos verificables que limiten las acciones de los modelos en entornos de alto riesgo. Este modelo no proporciona una garantía de ejecución por sí mismo, sino que razona sobre los límites y las condiciones que deberían existir en dichos sistemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen 3.5 (arquitectura exacta no especificada) |
| Parametros totales | 26 895 998 464 (≈ 27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna, los datos de entrenamiento ni el proceso de ajuste. El tag `qwen3_5_text` indica que el modelo parte de la familia Qwen 3.5, pero se desconoce si se trata de un fine-tuning completo, un LoRA o una variante específica. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

La model card se centra exclusivamente en la orientación conceptual del modelo: separar gobernanza de ejecución, definir el "último límite" (last boundary), aplicar el principio de Final Veto y diseñar arquitecturas de ejecución protegida. No se menciona ninguna innovación técnica concreta en el modelo en sí, sino en el marco teórico que pretende explorar.

## Capacidades

- Razonamiento sobre gobernanza de ejecución frente a control de ejecución.
- Análisis de mecanismos de control como flujos de aprobación, control de acceso basado en roles, políticas, firmas múltiples y revisión humana.
- Comprensión del concepto de Final Veto: la capacidad de un límite de seguridad para denegar una acción incluso después de que el software haya decidido ejecutarla.
- Exploración de ejecución protegida (protected execution) y fronteras de confianza en hardware.
- Discusión sobre arquitecturas de seguridad para agentes de IA donde múltiples componentes cooperan sin autoridad ilimitada.
- Análisis de condiciones verificables: identidad del actor, semántica de la acción, vinculación al objetivo, estado actual, frescura, nonce o contadores, parámetros de ejecución, validez de evidencia y restricciones de política.
- No se documentan capacidades generales de generación de código, matemáticas, visión o tool calling.

## Casos de uso

- Diseño de políticas de ejecución para agentes autónomos: el modelo puede ayudar a especificar qué condiciones deben cumplirse antes de que un agente realice una acción con efectos físicos, como transferencias bancarias o envío de mensajes externos.
- Auditoría de arquitecturas de seguridad: permite analizar si un sistema existente distingue correctamente entre gobernanza (aprobación) y control físico de ejecución, identificando posibles brechas.
- Redacción de especificaciones de "Final Veto": el modelo puede generar documentación sobre cómo implementar un mecanismo de denegación independiente en un sistema de hardware o software.
- Formación en seguridad de IA: sirve como material de estudio para equipos que desarrollan agentes con altos privilegios, ayudando a clarificar conceptos como "ejecución protegida" y "frontera de confianza".
- Análisis de incidentes: ante un fallo de seguridad en un sistema automatizado, el modelo puede ayudar a razonar sobre dónde se rompió la cadena entre decisión y ejecución.
- Desarrollo de marcos de verificación: el modelo puede proponer listas de condiciones verificables (identidad, estado, nonce, etc.) para integrar en sistemas de control de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio pesa 53,8 GB en safetensors, lo que corresponde aproximadamente a pesos en FP16 (2 bytes por parámetro).
- Para inferencia en FP16 se necesitan al menos 54 GB de VRAM, lo que requiere una GPU profesional como A100 80GB o H100, o múltiples GPUs.
- Con cuantización a 8 bits (por ejemplo, bitsandbytes) la VRAM necesaria se reduce a unos 27 GB, permitiendo su uso en una RTX 4090 (24 GB) o A6000 (48 GB).
- Con cuantización a 4 bits, la VRAM requerida sería de unos 14 GB, lo que lo haría ejecutable en GPUs consumer como RTX 3080/3090 (10-24 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se generan archivos GGUF), TGI, o transformers con carga en 8/4 bits.
- No se dispone de datos de latencia o throughput publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. Aunque comparte la base Qwen 3.5, no se conocen sus resultados en tareas estándar ni su rendimiento relativo. Tampoco hay modelos públicos equivalentes en la misma categoría de "execution boundary reasoning" con datos disponibles. Se indica "no disponible".

## Limitaciones y advertencias

- Es un modelo de investigación sin validación en entornos de producción; no se recomienda su uso en sistemas críticos sin pruebas exhaustivas.
- La licencia no está especificada, lo que impide conocer las condiciones de uso comercial o modificación.
- No se han documentado sesgos ni comportamiento en contextos multilingües; el idioma de entrenamiento es desconocido.
- El modelo no puede proporcionar por sí mismo una garantía de ejecución segura; es únicamente una herramienta de razonamiento. Cualquier implementación real de ejecución protegida requiere mecanismos externos al modelo.
- La ausencia de benchmarks y de especificaciones técnicas detalladas limita la evaluación objetiva de su calidad.
- Al ser un modelo de nicho, puede carecer de capacidades generales de generación de texto o código que otros modelos de 27B ofrecen.

## Enlaces

- [HuggingFace: Havenlon/Execution-Boundary-Qwen36-27B](https://huggingface.co/Havenlon/Execution-Boundary-Qwen36-27B)
- [Sitio web de Havenlon](https://havenlon.com)
