# Atomesh-AI/Lumi-Qwen3-1.7B-SFT-v0.1

## Resumen

Lumi-Qwen3-1.7B-SFT-v0.1 es un ajuste fino supervisado (SFT) del modelo Qwen3-1.7B de Alibaba, desarrollado por Atomesh-AI. Está orientado a aplicaciones de agente: recibe diálogo y descripciones de herramientas como entrada y genera texto, respuestas estructuradas o propuestas de llamadas a herramientas (tool-calling). Se distribuye con los pesos completos en BF16 del segundo ciclo de SFT sobre el modelo base.

El modelo parte de la revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` de Qwen3-1.7B y aplica un LoRA SFT en BF16 entrenado con 2.400 conversaciones sintéticas y 300 de desarrollo, durante 492 actualizaciones. El adaptador de la actualización 50 (el de menor pérdida en desarrollo) se fusionó con los pesos originales, dando un total de 1.720.574.976 parámetros.

Su relevancia es acotada y experimental: el propio autor advierte que las pruebas internas no respaldan una operación autónoma en producción. La supervisión es mayoritariamente en chino, con inglés ejercitado solo en pruebas de humo de release. Los pesos por sí solos no constituyen un sistema de ejecución seguro; requieren un runtime de agente externo que valide argumentos, aplique permisos y solicite confirmación en acciones sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); no se detalla en la información disponible |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son BF16) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen3-1.7B. El entrenamiento consistió en un LoRA SFT en BF16 sobre 2.400 conversaciones sintéticas de entrenamiento y 300 de desarrollo, con 492 actualizaciones. Se seleccionó el adaptador de la actualización 50 por presentar la menor pérdida en el conjunto de desarrollo y se fusionó con los pesos originales del modelo base. La supervisión de tareas está predominantemente en chino; el diálogo en inglés solo se ejercitó en pruebas de humo de release.

El modelo utiliza la plantilla de chat nativa de Qwen3 y los ejemplos del autor desactivan el modo de razonamiento (`enable_thinking=False`) para alinearse con el entorno de entrenamiento y evaluación de negocio. No se especifican en la información disponible detalles sobre la composición exacta del dataset sintético, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá del propio proceso de SFT.

## Capacidades

- Generación de texto conversacional multi-turno, con recuperación limitada en escenarios de varios turnos.
- Comprensión de intención del usuario (intent understanding) en tareas de negocio simuladas.
- Planificación de tareas (planning) a partir de la petición del usuario.
- Propuesta de llamadas a herramientas (tool-calling) a partir de un registro de herramientas.
- Generación de respuestas estructuradas, incluida salida en formato JSON.
- Interacción con un motor de memoria externo (memory) en el marco de un runtime de agente.
- Capacidades multilingües limitadas a chino e inglés, con predominio del chino.
- Modo de razonamiento (thinking) disponible en la plantilla de chat, aunque desactivado en los ejemplos de entrenamiento y evaluación.

## Casos de uso

- Asistente local de intención y planificación: el modelo identifica la intención del usuario y propone un plan de tareas que un runtime externo ejecuta tras validar argumentos y permisos.
- Prototipado de agentes con tool-calling: se integra en un bucle de agente que consulta un registro de herramientas y recibe propuestas de llamada que el orquestador valida antes de ejecutar.
- Generación de salidas estructuradas JSON: útil para pipelines que necesitan respuestas parseables (por ejemplo, extracción de campos como ciudad o parámetros de formulario) sin postprocesado complejo.
- Experimentación con memoria externa: el modelo puede consultar y actualizar un motor de memoria en entornos de oficina simulados, siempre bajo supervisión del runtime.
- Evaluación comparativa de modelos pequeños para agentes: sirve como referencia de un SFT de 1,7B frente a su base Qwen3-1.7B en tareas sintéticas de negocio.
- Pruebas de recuperación multi-turno: aunque el autor indica que es poco fiable, puede emplearse para estudiar fallos de recuperación en diálogos largos dentro de entornos controlados.
- Despliegue en hardware modesto: al ser un modelo de 1,7B en BF16 (repo de 3,5 GB), es viable para pruebas locales en GPU de consumo, con un runtime que imponga las salvaguardas necesarias.

## Benchmarks y rendimiento

Resultados de la evaluación interna del autor sobre pruebas sintéticas de negocio (recuentos de aprobados estrictos). No constituyen un ranking de benchmarks generales.

| Medida interna | Qwen3-1.7B | Lumi v0.1 |
|---|---:|---:|
| Tareas de negocio congeladas | 192/530 | 259/530 |
| Intención | 0/100 | 13/100 |
| Planificación | 14/100 | 42/100 |
| Tool calling | 124/150 | 126/150 |
| Memoria | 39/75 | 48/75 |
| Multi-turno | 6/75 | 18/75 |
| End-to-end | 9/30 | 12/30 |
| Conversaciones held-out originales | 5/300 | 43/300 |
| Nuevas combinaciones de herramientas | 9/50 | 20/50 |

La tasa de aprobado en tareas de negocio pasó del 36,23 % al 48,87 %, con una ganancia neta de 67 tareas. La recuperación multi-turno sigue siendo poco fiable. En las nuevas combinaciones de herramientas, 14 de 50 ejecuciones de Lumi activaron una violación de permisos simulada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 1,72B parámetros en BF16 ocupan aproximadamente 3,4 GB solo en pesos; en FP16/INT8 o INT4 el requisito se reduce, pero no se han publicado cifras oficiales de cuantización.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabe en GPU de consumo con suficiente VRAM para pesos más caché KV.
- Cabe en GPU de consumo: probable por el tamaño del modelo, aunque no se confirma oficialmente.
- Opciones de despliegue: `transformers` (ejemplos oficiales con `AutoModelForCausalLM`), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles. No se mencionan vLLM, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Lumi-Qwen3-1.7B-SFT-v0.1 | 1.720.574.976 | no disponible | Apache 2.0 | SFT para agentes; 259/530 tareas internas |
| Qwen3-1.7B (base) | no disponible en la información | no disponible | Apache 2.0 | 192/530 tareas internas; referencia directa del ajuste |
| Otras alternativas de ~1,7B | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La única comparación con datos concretos es frente a su modelo base Qwen3-1.7B, que obtiene 192/530 frente a 259/530 en las tareas de negocio congeladas del autor.

## Limitaciones y advertencias

- El autor declara explícitamente que las pruebas no respaldan una operación autónoma en producción.
- La recuperación multi-turno es poco fiable (18/75 en la evaluación interna).
- En las nuevas combinaciones de herramientas, 14 de 50 ejecuciones activaron una violación de permisos simulada.
- Los pesos no proporcionan un sistema de ejecución seguro: se requiere un runtime que valide argumentos, aplique permisos y solicite confirmación en acciones sensibles.
- La supervisión de entrenamiento es mayoritariamente en chino; el inglés solo se ejercitó en pruebas de humo, por lo que el rendimiento en inglés no está validado.
- Los resultados de evaluación son internos y sintéticos; no establecen un ranking frente a benchmarks generales.
- Riesgo de alucinación y sesgos: no se documentan de forma específica en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero la distribución incluye el aviso de copyright upstream y las modificaciones de Atomesh; debe respetarse la atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción prácticamente nula y ausencia de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Atomesh-AI/Lumi-Qwen3-1.7B-SFT-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Detalles de entrenamiento: docs/TRAINING.md (en el repositorio)
- Evaluación: docs/EVALUATION.md (en el repositorio)
- Limitaciones: docs/LIMITATIONS.md (en el repositorio)
- Despliegue: docs/DEPLOYMENT.md (en el repositorio)
- Ejemplo de generación de texto: examples/inference.py (en el repositorio)
- Ejemplo de tool calling: examples/tool_calling.py (en el repositorio)
- Licencia: LICENSE (en el repositorio)
- Atribución y modificaciones: NOTICE (en el repositorio)
