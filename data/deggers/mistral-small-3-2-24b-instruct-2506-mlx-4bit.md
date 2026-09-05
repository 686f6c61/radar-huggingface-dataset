# Deggers/Mistral-Small-3.2-24B-Instruct-2506-mlx-4Bit

## Resumen

Deggers/Mistral-Small-3.2-24B-Instruct-2506-mlx-4Bit es una conversión a formato MLX del modelo Mistral-Small-3.2-24B-Instruct-2506 de Mistral AI, realizada por el usuario Deggers. Se trata de un modelo de instrucciones de 23.572.403.200 parámetros (aproximadamente 23,6 mil millones), con arquitectura transformer densa, que ha sido cuantizado a 4 bits para reducir su tamaño a 13,3 GB y permitir su ejecución en hardware de Apple con MLX. Este modelo es relevante porque ofrece una alternativa eficiente para desplegar un modelo de 24B en entornos locales con memoria unificada, manteniendo las capacidades del modelo original: mejor seguimiento de instrucciones, menor incidencia de errores de repetición y soporte de function calling. La longitud de contexto no está disponible en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (denso, no MoE) |
| Parametros totales | 23.572.403.200 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

Este modelo es una conversión MLX de Mistral-Small-3.2-24B-Instruct-2506, que a su vez es una actualización menor de Mistral-Small-3.1-24B-Instruct-2503. Según la información disponible, la versión 3.2 introduce mejoras en el seguimiento de instrucciones precisas, reduce los errores de repetición y mejora la plantilla de function calling. No se proporcionan datos sobre la composición del dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto e instrucciones con mejor seguimiento de comandos precisos.
- Soporte de function calling (herramientas) gracias a la plantilla de function calling del modelo base.
- Menor tendencia a generar respuestas repetitivas o infinitas.
- Capacidades multilingües en 24 idiomas (en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn).
- No se dispone de información sobre capacidades de visión, audio ni razonamiento específico.

## Casos de uso

- Asistente de atención al cliente multilingüe: gracias a su soporte de 24 idiomas y su mejora en el seguimiento de instrucciones, puede gestionar consultas de clientes en distintos idiomas con respuestas coherentes y menos repeticiones.
- Agentes con herramientas (tool calling): la plantilla de function calling del modelo base permite integrarlo en sistemas que necesitan llamar a APIs o herramientas externas, como motores de búsqueda, bases de datos o servicios web.
- Generación de contenido técnico y documentación: su capacidad para seguir instrucciones precisas facilita la redacción de documentación técnica, informes y artículos en español y otros idiomas.
- Automatización de tareas de back-office: puede resumir correos, extraer información de documentos y generar respuestas estandarizadas en procesos administrativos.
- Chatbot de soporte técnico interno: al reducir los errores de repetición, es adecuado para conversaciones largas en las que se requiere coherencia a lo largo de múltiples turnos.
- Traducción automática asistida: su multilingüismo permite utilizarlo como traductor entre los idiomas soportados, con el matiz de que es un modelo de instrucciones y no un sistema de traducción especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repo es de 13,3 GB, por lo que los pesos en 4-bit ocupan aproximadamente 13,3 GB. Con overhead de activaciones y KV cache, se recomienda entre 16 y 20 GB de VRAM para inferencia con batch pequeño.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, o cualquier GPU con al menos 16 GB de VRAM. En Apple Silicon, se puede ejecutar con MLX en Macs con 16 GB o más de memoria unificada.
- Si cabe en consumer GPU: sí, en GPUs de 16 GB o más, como RTX 4080/4090.
- Opciones de despliegue: MLX (Apple Silicon), vLLM (según los tags del repo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre otras alternativas comparables. La siguiente tabla compara el modelo cuantizado con el modelo base original, del que deriva:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deggers/Mistral-Small-3.2-24B-Instruct-2506-mlx-4Bit | 23.572.403.200 | no disponible | no disponible | Apache-2.0 | HuggingFace |
| mistralai/Mistral-Small-3.2-24B-Instruct-2506 | 23.572.403.200 | no disponible | no disponible | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- La cuantización a 4 bits puede reducir ligeramente la precisión de las respuestas en comparación con el modelo original sin cuantizar.
- No se dispone de información sobre sesgos específicos del modelo.
- Como todo modelo de lenguaje, existe riesgo de alucinación, especialmente en tareas de generación de hechos.
- El modelo es una conversión no oficial de Mistral AI; puede haber diferencias de comportamiento con el modelo original.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar los términos del modelo base y de los datos de entrenamiento.

## Enlaces

- https://huggingface.co/Deggers/Mistral-Small-3.2-24B-Instruct-2506-mlx-4Bit
- https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
