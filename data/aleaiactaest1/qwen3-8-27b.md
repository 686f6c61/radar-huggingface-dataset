# AleaiactaEst1/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, desarrollado por AleaiactaEst1 como parte de la serie Qwen3.8, la generación más reciente de la familia open-source de Qwen. Se trata de un modelo denso de 27.781 millones de parámetros (27,8B) diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo, con comprensión nativa de imágenes y vídeo.

Construido sobre la base arquitectónica de Qwen3.5, incorpora una arquitectura híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención clásica Gated Attention, junto con predicción multi-token (MTP). Ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y un control flexible del modo de razonamiento (thinking mode) que puede activarse o desactivarse por petición.

La relevancia de este modelo reside en su equilibrio entre tamaño compacto y capacidades avanzadas: es un modelo denso de 27B que compite en benchmarks con alternativas mucho mayores, manteniendo un despliegue viable en hardware de gama alta. Su naturaleza vision-language lo convierte en una opción atractiva para aplicaciones multimodales y agénticas en producción, con compatibilidad declarada con transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de tipo causal con encoder de visión. El bloque de lenguaje presenta una configuración de 64 capas con dimensión oculta de 5120 y un layout interno de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y 1 sub-bloque de Gated Attention seguido de FFN. La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El embedding de tokens está rellenado a 248.320 entradas y la salida del LM usa la misma dimensión.

El entrenamiento combina pre-entrenamiento y post-entrenamiento. Se incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación y la coherencia a largo plazo. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento avanzado, con mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo.
- Comprensión nativa de imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Control flexible del modo de razonamiento: el thinking mode está activado por defecto, puede desactivarse por petición, y la profundidad de razonamiento es ajustable mediante el parámetro `reasoning_effort`.
- Retención del contexto de razonamiento histórico mediante `preserve_thinking`, que conserva el razonamiento de mensajes anteriores para tareas multi-turno.
- Planificación autónoma y manejo de feedback del entorno, orientado a la ejecución fiable de tareas complejas de principio a fin.
- Compatibilidad con herramientas y harnesses populares de desarrollo, facilitando la integración en stacks existentes.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas agénticas de codificación: el modelo puede operar en entornos de terminal (Terminal Bench 2.1) ejecutando comandos, leyendo feedback del sistema y ajustando su plan de acción, gracias a su capacidad de planificación autónoma y manejo de feedback del entorno.
- Asistente de programación en producción: con soporte para MTP y una ventana de contexto de 262K tokens, puede analizar repositorios completos, generar código, refactorizar y mantener coherencia en proyectos grandes, integrándose en pipelines de CI/CD mediante vLLM o SGLang.
- Análisis de documentos técnicos y científicos: su comprensión nativa de imágenes y vídeo permite procesar diagramas STEM, gráficos, fórmulas y documentos escaneados, extrayendo información estructurada para investigación o documentación.
- Agente de atención al cliente multimodal: puede gestionar conversaciones multi-turno con contexto largo, procesando capturas de pantalla, imágenes de productos o vídeos de demostración enviados por el usuario, y manteniendo el razonamiento histórico mediante `preserve_thinking`.
- Revisión y resumen de vídeos de larga duración: con soporte para vídeos de hasta una hora, puede generar resúmenes, transcripciones estructuradas o detectar eventos relevantes en grabaciones de reuniones, clases o vigilancia.
- Investigación y redacción profesional: su capacidad de razonamiento profundo y control de esfuerzo (`reasoning_effort`) lo hace adecuado para tareas de síntesis de literatura, redacción de informes técnicos y análisis comparativo, manteniendo un contexto extenso de referencias.
- Despliegue de asistentes con modo de pensamiento configurable: en aplicaciones donde se requiere baja latencia, se puede desactivar el thinking mode por petición, mientras que en tareas complejas se activa para obtener respuestas más razonadas.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero los valores numéricos no están completos en la información proporcionada. Se menciona la prueba "Terminal Bench 2.1 (Terminus)" para la capacidad de "Agentic terminal coding", comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Los resultados numéricos de esta y otras pruebas no están disponibles en la información extraída.

No se han publicado resultados numéricos completos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,8B parámetros en precisión FP16/BF16, se requieren aproximadamente 56 GB de VRAM para carga completa del modelo. Con cuantización a 8 bits se reduce a ~28 GB, y a 4 bits a ~14 GB, aunque no se especifican tipos de cuantización oficiales.
- GPU recomendadas: para FP16, una NVIDIA A100 de 80 GB o H100 de 80 GB es adecuada. Para cuantización 8 bits, una RTX 4090 de 24 GB no es suficiente; se necesitaría una A6000 de 48 GB o similar. Para 4 bits, una RTX 4090 de 24 GB podría ser viable, pero no está confirmado.
- No cabe en GPUs de consumo de gama media (16 GB o menos) sin cuantización agresiva.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La tabla de benchmarks de la model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Sin embargo, los valores numéricos no están disponibles. A continuación se presenta una comparativa estructural basada en los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Vision | Thinking mode |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B denso | 262K (ext. 1M) | Apache 2.0 | Sí | Sí |
| Qwen3.6-27B | 27B (estimado) | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B (estimado) | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para una comparativa detallada de rendimiento.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos, riesgo de alucinación o limitaciones idiomáticas en la información disponible.
- La licencia Apache 2.0 permite uso comercial sin restricciones de atribución, pero es recomendable revisar los términos de la licencia para componentes de terceros si se integra en productos.
- El modelo requiere hardware de gama alta para inferencia en precisión completa; el despliegue en GPUs de consumo requiere cuantización, cuyos tipos oficiales no están documentados.
- La ventana de contexto de 1M tokens es una extensión declarada, pero el rendimiento real a esa longitud no está verificado con benchmarks públicos.
- Los datos de entrenamiento (composición del dataset, tokens totales, técnicas de alineación) no están disponibles, lo que limita la evaluación de riesgos de sesgo y calidad.
- El modelo está etiquetado como "image-text-to-text", pero no se especifican los formatos de imagen/vídeo soportados ni las resoluciones máximas.
- No se indican los idiomas soportados; es probable que el multilingüismo sea limitado o no verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AleaiactaEst1/Qwen3.8-27B
- Qwen Cloud (servicio gestionado, próximamente): https://www.qwencloud.com/models/qwen3.8-27b
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
