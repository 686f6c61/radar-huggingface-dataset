# npario/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una variante del modelo Qwen3.8-27B publicada por npario en Hugging Face. Se trata de un modelo de lenguaje de 27.781 millones de parámetros (27.8B) que ha sido sometido a un proceso de "abliteración" para eliminar los mecanismos de rechazo (refusals) y las respuestas evasivas. El objetivo es obtener un modelo que responda de forma directa a consultas restringidas, manteniendo un rendimiento cercano al original. La documentación describe tres iteraciones (V1, V2 y V3) con técnicas de abliteración complementarias, y reporta una caída de solo 2.1 puntos porcentuales en MMLU respecto al modelo base. Es relevante para investigación en seguridad de IA, red-teaming y generación de código sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formatos GGUF, safetensors, MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, un modelo de lenguaje de 27.8B parámetros. La información disponible no detalla la arquitectura interna, pero se identifica como tipo `qwen3`, lo que corresponde a un transformer decoder-only. El proceso de entrenamiento no es un preentrenamiento desde cero, sino una modificación post-hoc mediante abliteración. La técnica busca identificar y eliminar las direcciones en el espacio de pesos asociadas al comportamiento de rechazo. La documentación describe tres versiones: V1 aplica una única cirugía agresiva con SVD (5 direcciones), V2 combina dos cirugías complementarias (SVD y LEACE) en una mezcla 60/40, y V3 aplica refinamiento iterativo sobre V2 con un corpus dirigido para categorías específicas de evasión. No se menciona RLHF ni DPO en el proceso.

## Capacidades

- Generación de texto, razonamiento y código. La model card reporta 20/20 en tareas de código funcional.
- Modo de pensamiento (thinking mode) activable o desactivable mediante `enable_thinking`.
- Soporte para entornos agénticos: la documentación incluye recomendaciones de configuración para agentes (repetición, temperatura, gestión de contexto).
- Respuesta directa a consultas restringidas, sin rechazos duros ni evasiones blandas.
- Capacidades multilingües no especificadas.
- Tool calling / function calling no especificado en la información disponible.

## Casos de uso

- Investigación en seguridad ofensiva (red teaming): el modelo puede generar exploits, payloads o cadenas de ataque para probar sistemas.
- Pruebas de penetración automatizadas: integrar el modelo en un framework de agente para ejecutar acciones encadenadas.
- Generación de código funcional en entornos de desarrollo: la model card reporta 20/20 en tareas de código, lo que lo hace útil para prototipado rápido.
- Simulación de adversarios en ejercicios de seguridad: generar respuestas maliciosas para entrenar a analistas.
- Evaluación de robustez de sistemas de defensa: probar si un sistema de filtrado o guardrail detecta contenido dañino.
- Investigación en alineación de IA: estudiar el comportamiento de modelos sin mecanismos de rechazo para entender los trade-offs.
- Desarrollo de herramientas de red-teaming automatizado: usar el modelo como generador de casos de prueba.

## Benchmarks y rendimiento

| Modelo | MMLU (0-shot) | Cyber/code tasks | Advanced real-world | Thinking mode |
|---|---|---|---|---|
| Stock Qwen3.8-27B | 84.5% | Refuses | 5/8 | ✓ |
| V1 | 81.4% | no disponible | no disponible | ✗ |
| V2 | 84.3% | no disponible | 7/8 | ✗ (refuses) |
| V3 (este modelo) | 82.3% | 20/20 | 7/8 | ✓ |

## Requisitos de hardware

- No se proporcionan requisitos oficiales.
- Estimación: en bfloat16, 27.8B parámetros requieren aproximadamente 55.6 GB de VRAM.
- Con cuantización de 4 bits (no especificada), podría caber en GPUs de 16-24 GB, pero no hay datos que lo confirmen.
- GPUs recomendadas: A100 80GB o H100 80GB para bfloat16; RTX 4090 (24GB) solo con cuantización y posible degradación.
- Opciones de despliegue: llama.cpp (con `--jinja`), Ollama, LM Studio, MLX. La documentación menciona estas opciones.

## Comparativa con modelos similares

| Modelo | Parámetros | MMLU | Refusals | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27.8B | 84.5% | Sí | Apache-2.0 |
| V1 | 27.8B | 81.4% | Eliminados | Apache-2.0 |
| V2 | 27.8B | 84.3% | Parciales | Apache-2.0 |
| V3 (este modelo) | 27.8B | 82.3% | Eliminados | Apache-2.0 |

No se han encontrado comparativas con otros modelos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- El modelo está diseñado para eliminar rechazos, lo que implica un alto riesgo de generar contenido dañino, ilegal o éticamente problemático.
- No se han evaluado sesgos ni alucinaciones en la información proporcionada.
- La documentación advierte que sin `repetition_penalty` el modelo entra en bucles en modo greedy.
- La licencia Apache-2.0 permite uso comercial, pero el uso del modelo puede violar leyes según la jurisdicción.
- El modelo no es seguro para producción sin supervisión humana.

## Enlaces

- https://huggingface.co/npario/Qwen3.8-27B-OBLITERATED
- https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/tree/main
- https://github.com/bigguy8585/ai/tree/main/Qwen3.8-27B-OBLITERATED
