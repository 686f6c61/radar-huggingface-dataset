# inclusionAI/Ling-3.0-tiny-singprobe

## Resumen

SingProbe es un guardrail intrínseco de streaming desarrollado por InclusionAI, diseñado para ejecutarse junto al modelo base `inclusionAI/Ling-3.0-tiny`. En lugar de desplegar un modelo de seguridad separado, este probe ligero reutiliza los estados ocultos del modelo base durante la generación para puntuar, en cada token, la intención de la consulta, la peligrosidad de la respuesta y el riesgo de alucinación. Con solo 3,22 millones de parámetros, añade menos de un 0,5 % de sobrecarga en tiempo de decodificación, lo que lo convierte en una solución práctica para moderación en tiempo real.

El probe se apoya en la arquitectura del modelo base Ling-3.0-tiny, un MoE de 7,9 mil millones de parámetros totales con 1,3 mil millones activos por token y una ventana de contexto de 256K tokens. SingProbe extrae representaciones de las capas 6, 14 y 22 del transformer y produce ocho etiquetas de intención, una puntuación de inseguridad y una puntuación de alucinación. Su relevancia actual radica en la creciente necesidad de salvaguardas eficientes y de baja latencia para sistemas de IA generativa en producción, especialmente en escenarios de agentes y conversaciones multi-turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Probe de clasificacion ligero sobre estados ocultos del transformer base (capas 6, 14, 22); detalles exactos no disponibles |
| Parametros totales | 3.216.906 (3,22 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hereda la del modelo base: 256K tokens (Ling-3.0-tiny) |
| Tipos de cuantizacion | No disponible (el probe se carga junto al base, que soporta cuantizacion estandar) |
| Idiomas soportados | No disponibles (depende del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SingProbe es un clasificador auxiliar que se acopla al modelo base `Ling-3.0-tiny`. Durante la generación, el probe accede a los estados ocultos de las capas 6, 14 y 22 del transformer y los proyecta a tres salidas: una clasificación de intención de consulta (8 clases), una puntuación de inseguridad de respuesta y una puntuación de riesgo de alucinación. El diseño permite operar en streaming, evaluando cada token a medida que se produce, sin necesidad de ejecutar un modelo de seguridad separado.

No se han publicado detalles sobre el proceso de entrenamiento del probe (datos, número de épocas, función de pérdida, etc.). El informe técnico en arXiv (2608.30703) describe la metodología completa, pero la información disponible en la model card no incluye esos detalles. El probe está diseñado específicamente para la familia Ling-3.0 y solo es compatible con la arquitectura `BailingMoeV3ForCausalLM`.

## Capacidades

- Clasificación de intención de consulta en 8 categorías (por ejemplo, peticiones de información, comandos, preguntas de seguimiento, etc.).
- Detección de respuestas no seguras en tiempo real, puntuando cada token generado.
- Detección de alucinaciones durante la generación libre, con un AUC medio de 0,6807 en evaluación online.
- Operación en streaming con sobrecarga de decodificación inferior al 0,5 %.
- Integración nativa con SGLang y vLLM mediante ramas específicas que cargan el probe junto al servidor.
- Baja tasa de falsos positivos en respuestas benignas: 0,07 % de media en 5 conjuntos de datos.

## Casos de uso

- Moderación de contenido en tiempo real: el probe puede bloquear o enmascarar respuestas inseguras a medida que se generan, evitando que lleguen al usuario final. Su bajo overhead permite usarlo en servicios de chat de alta concurrencia.
- Detección de alucinaciones en asistentes virtuales: al puntuar el riesgo de alucinación por token, se puede alertar al sistema cuando la respuesta se desvía de los hechos, permitiendo intervención humana o regeneración.
- Guardrail para agentes autónomos: en flujos de trabajo multi-paso donde el modelo genera acciones o llamadas a herramientas, el probe puede verificar que cada paso sea seguro y coherente con la intención del usuario.
- Filtrado de consultas maliciosas en sistemas de soporte: la clasificación de intención permite detectar intentos de inyección de prompts o solicitudes peligrosas antes de que el modelo base las procese.
- Auditoría de logs de generación: las puntuaciones por token pueden registrarse para análisis posterior, facilitando la trazabilidad de incidentes de seguridad.
- Evaluación de calidad en pipelines de RAG: la puntuación de alucinación puede usarse como señal para medir la fidelidad de las respuestas generadas a partir de documentos recuperados.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, comparados con un baseline de referencia (Qwen3Guard-Stream-8B-strict para tareas de seguridad y DRIFT para detección de alucinaciones). Todos los valores son promedios sobre los conjuntos de benchmarks indicados.

| Tarea | Metrica | Ling-3.0-tiny-singprobe | Baseline de referencia |
|---|---|---|---|
| Clasificacion de intencion de consulta (6 benchmarks) | F1 | 0,8561 | Qwen3Guard-Stream-8B-strict: 0,8602 |
| Clasificacion de seguridad de respuesta (8 benchmarks) | F1 | 0,8508 | Qwen3Guard-Stream-8B-strict: 0,8486 |
| Seguridad en streaming (3 benchmarks) | R-AUC / T-AUC | 0,9888 / 0,9479 | Qwen3Guard-Stream-8B-strict: 0,9640 / 0,8893 |
| Deteccion de alucinaciones (6 benchmarks) | AUC | 0,7765 | DRIFT: 0,7408 |

Adicionalmente, se reportan características de despliegue:

| Caracteristica | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,07 % de media en 5 conjuntos de datos |
| Deteccion de alucinaciones en linea (generacion libre) | AUC medio de 0,6807 |
| Sobrecarga de decodificacion | < 0,5 % |

## Requisitos de hardware

- El probe en sí requiere muy poca memoria adicional (3,22 M de parámetros, aproximadamente 13 MB en FP32). La VRAM total depende del modelo base Ling-3.0-tiny.
- Para el modelo base (7,9B totales, 1,3B activos), se recomienda al menos 16 GB de VRAM en cuantizacion FP16 para inferencia local. Con cuantizacion de 4 bits, puede caber en GPUs de 8-10 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para despliegue local, A100 o H100 para entornos de produccion con alta concurrencia.
- El probe se integra con SGLang y vLLM mediante ramas especificas. Tambien puede usarse con llama.cpp si se exporta el modelo base a GGUF, aunque la integracion oficial no lo menciona.
- La latencia adicional es minima (< 0,5 % de overhead), por lo que el throughput efectivo es practicamente el mismo que el del modelo base sin probe.

## Comparativa con modelos similares

SingProbe se compara con guardrails de streaming alternativos. La siguiente tabla resume las diferencias principales:

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-tiny-singprobe | 3,22 M (probe) + base 7,9B | Intrinseco, reutiliza estados ocultos | 256K (base) | MIT | HuggingFace |
| Qwen3Guard-Stream-8B-strict | 8B (modelo completo) | Modelo de guardrail separado | No especificado | Apache 2.0 (asumido) | HuggingFace |
| DRIFT | No especificado | Detector de alucinaciones independiente | No especificado | No especificado | No disponible |

SingProbe destaca por su overhead minimo y su capacidad de operar en streaming sin un modelo adicional. Qwen3Guard-Stream-8B-strict ofrece un F1 ligeramente superior en clasificacion de intencion, pero requiere un modelo de 8B completo, lo que implica mayor coste computacional. DRIFT es superado en AUC de deteccion de alucinaciones.

## Limitaciones y advertencias

- El probe solo es compatible con la arquitectura `BailingMoeV3ForCausalLM` y debe usarse con el par exacto `inclusionAI/Ling-3.0-tiny`. No funcionará con otros modelos base.
- No es un modelo generativo; no puede producir texto por sí mismo. Depende completamente del modelo base para la generación.
- La detección de alucinaciones en generación libre tiene un AUC medio de 0,6807, lo que indica que no es infalible y puede dejar pasar alucinaciones o marcar respuestas correctas como sospechosas.
- La tasa de falsos positivos en respuestas benignas es baja (0,07 %), pero no nula. En aplicaciones críticas, se recomienda combinar con otras señales de verificación.
- No se han publicado detalles sobre los datos de entrenamiento del probe, por lo que no es posible evaluar posibles sesgos en la clasificación de intenciones o en la detección de inseguridad.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base Ling-3.0-tiny puede tener su propia licencia; es necesario verificar los términos de ambos componentes.
- Las integraciones con SGLang y vLLM están en ramas de desarrollo (no en releases estables), lo que puede implicar inestabilidad o cambios en la API.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-tiny-singprobe
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.30703
- Repositorio de implementacion: https://github.com/inclusionAI/SingProbe
- Rama de integracion SGLang: https://github.com/jinzhen-lin/sglang/tree/token-probe-ling3-flash-main
- Rama de integracion vLLM: https://github.com/jinzhen-lin/vllm/tree/bailing-v3-token-probe
