# konnosena/auto-0.4b-3-onnx

## Resumen

`konnosena/auto-0.4b-3-onnx` es la exportación no oficial a ONNX del modelo `ProCreations/auto-0.4b-3`, un clasificador de texto basado en la arquitectura ModernBERT. Su función es concreta: dado un agente de IA que propone ejecutar una herramienta (tool call), el modelo decide si esa llamada debe aprobarse (etiqueta 0) o denegarse (etiqueta 1). Se trata, por tanto, de un componente de seguridad para pipelines de agentes, no de un modelo generativo.

La conversión, publicada por el usuario `konnosena` bajo licencia Apache-2.0, mantiene los pesos en BF16 y los convierte a FP32 al cargar la sesión de ONNX Runtime, lo que según el autor es una conversión sin pérdida. Incluye optimizaciones específicas para entradas largas: atención local por ventanas de 64 tokens, procesamiento de capas globales en 8 bloques y cálculo de la última capa solo para la fila `[CLS]`.

La relevancia actual del modelo radica en su uso como barrera de control (guardrail) en sistemas de agentes autónomos: con una ventana de hasta 8.192 tokens puede evaluar el contexto completo de una sesión de agente (petición del usuario, historial de acciones y llamada propuesta) antes de permitir la ejecución de una herramienta potencialmente peligrosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder con atención local y global) |
| Parametros totales | no disponible (el nombre del modelo sugiere ~0,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrenado hasta esa longitud; la dimensión N de entrada es dinámica) |
| Tipos de cuantizacion | pesos en BF16 convertidos a FP32 en carga; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 23), archivo único `model.onnx` de 791,9 MB |
| Pipeline | text-classification |
| Librería | onnxruntime (probado con ONNX Runtime 1.31) |
| Entradas | `input_ids` int64 [1, N], `attention_mask` int64 [1, N] |
| Salidas | `logits` float32 [1, 2] |
| Modelo base | ProCreations/auto-0.4b-3 |
| Tamaño del repo | 0,8 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT, la arquitectura de Answer.AI que combina capas de atención local con ventanas deslizantes y capas de atención global, junto con mejoras como RoPE y activaciones GeGLU. La exportación a ONNX aplica tres optimizaciones: las capas de atención local solo computan dentro de su ventana (cada bloque de 64 tokens atiende a sí mismo y a sus dos vecinos, con máscara `|i - j| <= 64`), las capas globales procesan las queries en 8 bloques, y la última capa calcula únicamente la fila `[CLS]` que lee el clasificador.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card remite a la ficha del modelo base para esos detalles. El autor sí documenta que el modelo fue entrenado con entradas de hasta 8.192 tokens y que existe un conjunto de evaluación público, `ProCreations/approve-or-deny`, con etiquetas de aprobación y denegación.

## Capacidades

- Clasificación binaria de llamadas a herramientas: decide aprobar (0) o denegar (1) una tool call propuesta por un agente.
- Procesamiento de contexto de agente completo: acepta la llamada propuesta, la petición del usuario y el historial de acciones en un formato serializado concreto.
- Manejo de entradas largas: hasta 8.192 tokens, con estrategia documentada de descarte de las entradas más antiguas del historial cuando se excede el límite.
- Salida probabilística: expone `p_deny = softmax(logits)[1]`, lo que permite ajustar el umbral de decisión (el autor evalúa a 0,1, 0,5 y 0,9).
- Ejecución en CPU: el export está pensado para inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- No soporta generación de texto, tool calling propio, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

- Guardrail en agentes autónomos: antes de que un agente ejecute una herramienta (por ejemplo, borrar ficheros o enviar un correo), el clasificador evalúa la llamada junto con el historial y la petición del usuario, y bloquea la ejecución si `p_deny` supera el umbral configurado.
- Moderación de acciones en producción: integrado como paso previo en un orquestador de agentes, filtra tool calls de riesgo en pipelines existentes sin añadir dependencias de GPU, gracias a su formato ONNX y ejecución en CPU.
- Cumplimiento y auditoría: registrar la probabilidad de denegación de cada llamada permite construir trazas auditables de por qué se permitió o bloqueó una acción, útil en entornos regulados.
- Control de costes y abuso: denegar llamadas a herramientas caras o a APIs externas cuando el contexto del agente no justifica su uso.
- Evaluación de políticas de seguridad: usar el modelo como juez offline para analizar sesiones de agente ya registradas y detectar llamadas que deberían haberse bloqueado.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con ONNX Runtime y un único fichero de 792 MB, puede correr en servidores sin GPU o en el edge junto al propio agente.
- Filtrado en tiempo real de sesiones largas: con la ventana de 8.192 tokens y el descarte de historial antiguo, es adecuado para sesiones de agente de 4k a 14k tokens documentadas por el autor.

## Benchmarks y rendimiento

El autor publica una verificación de equivalencia frente al modelo original en PyTorch (Transformers, FP32, CPU) sobre los mismos token ids:

| Conjunto | Casos | Diferencia máxima en p_deny | Misma decisión a 0,1 / 0,5 / 0,9 |
|---|---:|---:|---|
| Tool calls mixtas (hasta 8.192 tokens) | 199 | 2,7e-06 | 100% / 100% / 100% |
| Sesiones de agente largas (4k-14k tokens, recortadas a 8.192) | 37 | 8,1e-07 | 100% / 100% / 100% |
| Test de Approve-or-Deny, muestra balanceada (hasta 2.048 tokens) | 600 | 2,1e-06 | 100% / 100% / 100% |

Precisión en el subconjunto de Approve-or-Deny a umbral 0,5: 97,83% (idéntica al modelo original). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para inferencia en CPU con ONNX Runtime.
- Memoria RAM: el fichero `model.onnx` ocupa 791,9 MB; con la sesión en FP32 y los buffers de activación, se recomienda al menos 2-3 GB de RAM libre para entradas de 8.192 tokens.
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime podría usarse, pero no es el objetivo del export.
- Cabe en cualquier equipo consumer: portátiles y servidores de CPU convencionales son suficientes.
- Opciones de despliegue: ONNX Runtime (probado con la versión 1.31), con ejemplos para `onnxruntime-node`; también puede ejecutarse desde Python con `onnxruntime` y el tokenizer de Hugging Face.
- Latencia y throughput: no disponibles; el autor solo indica que las optimizaciones de atención reducen "mucho" el tiempo y la memoria en entradas largas, sin cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el modelo se apoya en la arquitectura ModernBERT de Answer.AI (Apache-2.0), pero no se han publicado comparaciones con otros clasificadores de seguridad para tool calls en la información disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| konnosena/auto-0.4b-3-onnx | no disponible (~0,4B por el nombre) | 8.192 | Clasificación aprobar/denegar tool calls | Apache-2.0 | Hugging Face |
| ProCreations/auto-0.4b-3 | no disponible | 8.192 | Ídem (original en PyTorch) | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un clasificador binario, no un modelo generativo: no puede usarse para conversación, código ni razonamiento general.
- Solo soporta inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Conversión no oficial: el autor declara no estar afiliado ni respaldado por los creadores originales; para producción conviene validar contra el modelo base.
- La calidad depende del formato exacto de serialización (`### PROPOSED TOOL CALL`, `### USER REQUEST`, `### AGENT HISTORY`); desviarse del formato puede degradar las decisiones.
- Entradas de más de 8.192 tokens requieren descartar historial antiguo, lo que puede eliminar contexto relevante para la decisión.
- Riesgo de falsos negativos y positivos inherente a un clasificador con precisión del 97,83% en un subconjunto concreto; no debe ser el único mecanismo de seguridad en un agente.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a prompt injection en el texto de la llamada.
- Licencia Apache-2.0 permite uso comercial, pero al ser una conversión no oficial se recomienda revisar también la licencia y condiciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/konnosena/auto-0.4b-3-onnx
- Modelo base: https://huggingface.co/ProCreations/auto-0.4b-3
- Perfil del autor de la conversión: https://huggingface.co/konnosena
- Perfil de ProCreations: https://huggingface.co/ProCreations
- Dataset de evaluación: https://huggingface.co/datasets/ProCreations/approve-or-deny
- Arquitectura base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
