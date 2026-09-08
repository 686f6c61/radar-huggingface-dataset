# PointGuardAI/Qwen3.5-2B-Topic-Controls-LoRA-09-07-2026

## Resumen

El adaptador LoRA `Qwen3.5-2B-Topic-Controls-LoRA-09-07-2026` de PointGuardAI es un clasificador binario de elegibilidad de políticas de aplicación (application-policy eligibility classifier) construido sobre el modelo base `Qwen/Qwen3.5-2B`. Su función es determinar si una solicitud de usuario, considerada no confiable, es compatible con las capacidades permitidas definidas por el operador de la aplicación. Devuelve `MATCH` si existe al menos una solicitud elegible y todas las acciones sustantivas están soportadas por las capacidades permitidas, o `NO_MATCH` en caso contrario.

El adaptador se entrena con la librería PEFT y utiliza una estrategia LoRA con rank 16, alpha 32 y dropout 0.05, que modifica las proyecciones de Gated DeltaNet, atención y FFN del backbone de texto. Solo se entrenan 16.819.200 parámetros (0,7542 % del modelo base), lo que lo convierte en una solución ligera y fácil de integrar. El modelo opera con una ventana de contexto de 8.192 tokens y se sirve en precisión BF16. Está pensado como un guardrail de control de temas en sistemas de conversación, complementando a otros clasificadores de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen3.5-2B (transformador) |
| Parametros totales | 2.230.060.864 (modelo base) |
| Parametros activos | No aplica (no es MoE); adaptador LoRA con 16.819.200 entrenables (0,7542 %) |
| Longitud de contexto | 8.192 tokens (input_text truncado a 4.096 tokens) |
| Tipos de cuantizacion | no disponible (entrenado y servido en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, 67.332.688 bytes) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo Qwen/Qwen3.5-2B, un transformer de texto de 2.230 millones de parámetros. Utiliza la técnica Low-Rank Adaptation (LoRA) con rank 16, alpha 32 y dropout 0.05. La estrategia de entrenamiento aplica LoRA a todas las proyecciones soportadas de Gated DeltaNet, atención y FFN del backbone de texto, excluyendo embeddings, LM head, cabezas de clasificación, módulos de visión, normalización y los pesos base. El número total de parámetros entrenables es de 16.819.200, lo que representa el 0,7542 % del modelo base.

El entrenamiento se realizó con el contrato de tarea `topic_control` versión 1. El checkpoint seleccionado es el paso 700 de un entrenamiento que se detuvo temprano en el paso 1000, tras lo cual se restauró el checkpoint 700 antes de exportar. La métrica de evaluación mejor fue `eval_auprc = 0,9991065206`. El modelo se entrena con un prompt específico que incluye un mensaje de sistema con el contexto de aplicación y las capacidades permitidas como entradas confiables, y un mensaje de usuario con el texto no confiable codificado en JSON. Solo el token final de la etiqueta contribuye a la pérdida de entrenamiento. Los tokens de etiqueta son A (NO_MATCH, ID 32) y B (MATCH, ID 33).

## Capacidades

- Clasificación binaria de elegibilidad de políticas: devuelve `MATCH` o `NO_MATCH` según si la solicitud del usuario está soportada por las capacidades permitidas.
- Evaluación de acciones activas: identifica acciones solicitadas, incluyendo las que aparecen al final o en contenido estructurado, y juzga la solicitud activa resultante, no palabras clave aisladas.
- Manejo de solicitudes neutrales: saludos, agradecimientos, despedidas, acuses de recibo y preguntas sobre capacidades se consideran siempre `MATCH` si son la única solicitud activa.
- Distinción entre acciones materialmente diferentes: explica versus ejecuta, redacta versus envía, revisa versus modifica, organiza versus enruta, y recursos propios versus de terceros, cuando las capacidades permitidas hacen esa distinción.
- Resistencia a ataques de prompt: el texto no confiable se trata solo como datos; las instrucciones de override de políticas se consideran texto de control y no cambian la etiqueta, salvo que la acción solicitada quede fuera de las capacidades.
- Integración como guardrail: complementa a otros clasificadores de seguridad, ya que los ataques de prompt y la seguridad de contenido se manejan por separado.

## Casos de uso

- Control de acceso en asistentes de IA: el adaptador se coloca antes de la ejecución de acciones para verificar que la solicitud del usuario esté dentro de las capacidades permitidas por la aplicación, evitando que el agente realice operaciones no autorizadas.
- Filtrado de solicitudes en aplicaciones de codificación: en un asistente de desarrollo de software con capacidades de generar, depurar y revisar código, el modelo clasifica si una petición concreta (por ejemplo, "envía este parche a producción" frente a "genera un test para esta función") está soportada.
- Cumplimiento de políticas en chatbots de atención al cliente: permite que el sistema distinga entre consultas informativas (explicar políticas) y acciones transaccionales (modificar pedidos, emitir reembolsos), aplicando las reglas de negocio definidas.
- Prevención de abuso en herramientas de productividad: en una plataforma de gestión de documentos, el clasificador determina si una solicitud de organizar, enrutar o compartir recursos está dentro de las capacidades otorgadas al usuario, evitando operaciones sobre recursos de terceros.
- Seguridad en agentes autónomos: antes de que un agente multi-paso ejecute una acción, el adaptador evalúa la solicitud completa, incluyendo acciones al final o en contenido estructurado, para garantizar que ninguna acción sustantiva exceda las capacidades permitidas.
- Clasificación de solicitudes en soporte técnico: el modelo puede integrarse en pipelines de clasificación para enrutar solicitudes de soporte a flujos de trabajo adecuados, distinguiendo entre acciones permitidas y no permitidas según el contexto de la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El model card reporta los siguientes resultados de evaluación interna para el clasificador:

| Metrica | Valor |
|---|---|
| eval_auprc (mejor checkpoint) | 0,9991065206 |
| Recall del holdout protegido | 95,80 % |
| Umbral de recall configurado | 95 % |
| Umbral de FPR configurado | 5 % |

La evaluación indica que la validación, calibración, test interno y holdout protegido pasan los umbrales configurados. El recall del holdout es 95,80 %, solo 0,80 puntos porcentuales por encima del umbral mínimo de publicación.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-2B en BF16 requiere aproximadamente 4,5 GB de VRAM según el tamaño de los pesos; el adaptador añade unos 67 MB, por lo que la memoria total se sitúa en torno a 4,6-5 GB.
- GPU recomendadas: no disponible en la información; se recomienda una GPU con al menos 6 GB de VRAM para servir el modelo en BF16, como RTX 3060, RTX 4060 o RTX 4090. Para despliegue en producción, se pueden considerar A10G, L4 o A100.
- Compatibilidad con GPU consumer: sí, cabe en tarjetas de gama media con 6 GB o más.
- Opciones de despliegue: SGLang (mencionado en las etiquetas del repositorio); otras opciones no disponibles en la información.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA similares de la misma categoría en los datos proporcionados. La comparación más directa es con el modelo base sin el adaptador: `Qwen/Qwen3.5-2B` es un modelo de lenguaje generativo de 2.230 millones de parámetros, mientras que este adaptador lo convierte en un clasificador binario de políticas. El adaptador no es un modelo independiente y requiere el modelo base en la revisión exacta `15852e8c16360a2fea060d615a32b45270f8a8fc`.

## Limitaciones y advertencias

- Es un adaptador de clasificación, no un modelo generativo: no debe usarse como un LLM general para generar texto, sino como un guardrail que produce una etiqueta binaria.
- Depende de una revisión exacta del modelo base y del tokenizer: `Qwen/Qwen3.5-2B` en la revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`. Cambios en el modelo base pueden degradar el rendimiento.
- Contexto limitado: la ventana de contexto es de 8.192 tokens, y el texto de entrada no confiable se trunca a 4.096 tokens antes de codificarse en JSON, lo que puede perder información en solicitudes largas.
- Margen de recall ajustado: el recall del holdout es 95,80 %, solo 0,80 puntos porcentuales por encima del umbral mínimo de 95 %. Se recomienda mantener mecanismos de aplicación deterministas, monitorización y defensa en profundidad.
- Evaluación de una sola semilla: el estado de publicación indica "single-seed research candidate", por lo que los resultados pueden no ser totalmente robustos en diferentes semillas de entrenamiento.
- Sesgos: no se han reportado sesgos específicos en la información disponible. Sin embargo, al ser un clasificador entrenado sobre un modelo base, podría heredar sesgos del modelo base.
- Riesgo de alucinación: no aplica directamente, ya que el adaptador produce una etiqueta binaria y no genera texto libre. No obstante, el modelo base puede presentar alucinaciones si se usa sin el adaptador.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y distribución, siempre que se mantenga el aviso de licencia.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/PointGuardAI/Qwen3.5-2B-Topic-Controls-LoRA-09-07-2026
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de Qwen3.5 en GitHub: https://github.com/algtrd24/qwen3.5
- Documentación de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
