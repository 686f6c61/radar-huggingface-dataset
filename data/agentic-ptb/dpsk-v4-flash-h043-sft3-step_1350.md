# agentic-ptb/dpsk-v4-flash.h043.sft3.step_1350

## Resumen

`agentic-ptb/dpsk-v4-flash.h043.sft3.step_1350` es un checkpoint intermedio generado durante un barrido de hiperparámetros (sweep) del proyecto AgentPTB. Se trata de un fine-tuning de tercera etapa (SFT3) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, ejecutado en el paso 1350 de entrenamiento. El identificador `dpsk-v4-flash` sugiere que el experimento explora una variante inspirada en DeepSeek v4-flash, con un driver denominado "pi" y un esfuerzo de razonamiento configurado como `thinking`.

Este artefacto no es un modelo final ni está pensado para uso en producción: su rol declarado es `intermediate` y fue recuperado de una copia de seguridad (`msr-spare`) tras ser podado del almacenamiento principal. Con aproximadamente 9,4 mil millones de parámetros, hereda la arquitectura del modelo base de Qwen, pero carece de documentación sobre capacidades, licencia o idiomas soportados. Su relevancia es exclusivamente investigadora, como punto de control para analizar la dinámica de entrenamiento dentro del sweep.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4B parámetros. El entrenamiento corresponde a la tercera etapa de supervisión (SFT3) dentro de un barrido de AgentPTB, con el checkpoint guardado en el paso 1350. El driver del experimento se identifica como "pi / DeepSeek v4-flash" con un esfuerzo de razonamiento fijado en `thinking`, lo que sugiere que el objetivo era evaluar comportamientos de razonamiento extendido sobre la base de Qwen. No se dispone de información sobre el dataset utilizado, el número total de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint se guardó en un único shard y fue recuperado de una copia de seguridad externa.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un artefacto intermedio de un experimento, no hay confirmación de:

- Generación de texto o razonamiento
- Soporte de tool calling o function calling
- Capacidades de agente o multi-step reasoning
- Capacidades multilingues
- Modo thinking o cualquier otra funcionalidad especial

La única información técnica relevante es que el `eos_token_id` configurado es `[248044]`, pero falta el token `248046`, lo que puede afectar a la terminación de secuencias durante la generación.

## Casos de uso

No existen casos de uso documentados para este modelo. Al tratarse de un checkpoint intermedio de investigación, no está destinado a aplicaciones prácticas. Los posibles usos se limitan a:

- Análisis de la evolución del entrenamiento dentro del sweep AgentPTB
- Comparación de métricas intermedias frente a otros checkpoints del mismo barrido
- Estudio de la dinámica de pérdida y convergencia en la etapa SFT3
- Reproducción de experimentos de investigación sobre fine-tuning de modelos de razonamiento

Cualquier otro uso, especialmente en producción, no está respaldado por la documentación disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware. Como estimación general para un modelo de ~9,4B parámetros en formato safetensors:

- VRAM estimada para inferencia en BF16: ~19-20 GB (peso del repo: 18,8 GB)
- VRAM estimada en cuantización 4-bit: ~5-6 GB (si se generaran cuantizaciones, no disponibles actualmente)
- GPU recomendadas: NVIDIA A100 40GB, RTX 4090 24GB, o GPUs con al menos 24 GB de VRAM para precisión completa
- No cabe en GPUs de consumo de gama baja (8 GB o menos) sin cuantización
- Opciones de despliegue: vLLM, llama.cpp u Ollama podrían servir si se convirtieran los pesos, pero no hay archivos GGUF ni configuraciones de despliegue publicadas
- Latencia y throughput: no disponibles

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base `Qwen/Qwen3.5-9B-Base` es el único punto de referencia directo, pero no se han publicado métricas comparativas entre ambos. Tampoco hay datos de otros modelos de la misma categoría (9B, razonamiento) que permitan una comparación objetiva.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: su comportamiento no está validado para tareas reales.
- Falta el `eos_token_id` 248046, lo que puede provocar generaciones que no terminen correctamente o tokens de fin de secuencia inconsistentes.
- No tiene licencia especificada, por lo que su uso comercial es incierto y no recomendado.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de idioma.
- El modelo fue recuperado de una copia de seguridad; no se garantiza la integridad total de los pesos.
- No apto para producción ni para integración en sistemas que requieran fiabilidad.

## Enlaces

- [HuggingFace: agentic-ptb/dpsk-v4-flash.h043.sft3.step_1350](https://huggingface.co/agentic-ptb/dpsk-v4-flash.h043.sft3.step_1350)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
