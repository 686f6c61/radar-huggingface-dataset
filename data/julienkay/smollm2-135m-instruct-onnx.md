# julienkay/SmolLM2-135M-Instruct-onnx

## Resumen

SmolLM2-135M-Instruct-onnx es la exportación a ONNX del modelo SmolLM2-135M-Instruct de Hugging Face, realizada por el desarrollador independiente julienkay. El objetivo concreto de esta conversión es hacer que el modelo pueda importarse en Unity Inference Engine (el motor de inferencia de Unity) y en el paquete `tools.doji.transformers` del mismo autor, algo que no permite la exportación ONNX oficial porque esta emplea operadores contrib de Microsoft (`GroupQueryAttention`, `RotaryEmbedding`, `SkipSimplifiedLayerNormalization`).

El modelo subyacente, SmolLM2-135M-Instruct, es un transformer decoder-only de 135 millones de parámetros desarrollado por Hugging Face, ajustado con instrucciones y pensado para ejecución en dispositivos con recursos muy limitados. Esta versión ONNX mantiene esa filosofía: pesos en float32, operadores estándar de ONNX (opset 17) y un único grafo que procesa tanto el prompt como cada token nuevo, con gestión explícita de la caché KV mediante entradas y salidas `past_key_values`/`present`.

Su relevancia es acotada pero específica: cubre el hueco de despliegue de un LLM pequeño dentro de aplicaciones Unity (videojuegos, simulaciones, experiencias interactivas) sin depender de operadores propietarios. El repositorio ocupa 0,7 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2), exportado a ONNX con opset 17 y operadores estándar |
| Parámetros totales | 135 millones |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (depende del modelo base SmolLM2-135M-Instruct) |
| Tipos de cuantización | No disponible; la exportación indicada es float32 |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` en float32, operadores estándar, sin contrib ops) |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolLM2-135M-Instruct: un transformer decoder-only denso de 135 millones de parámetros, con atención causal y ajuste por instrucciones realizado por Hugging Face. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO) empleadas en el modelo original; deben consultarse en la model card de `HuggingFaceTB/SmolLM2-135M-Instruct`.

La innovación técnica de esta ficha no está en el entrenamiento sino en la exportación. El autor reescribe el grafo para eliminar los operadores contrib de Microsoft que genera la herramienta oficial de exportación de ONNX Runtime y que Unity Inference Engine no puede importar. El resultado es un único modelo que ejecuta tanto el prefill del prompt como la generación token a token, con la interfaz típica de las exportaciones de Optimum: entradas `input_ids`, `attention_mask`, `position_ids` y `past_key_values.{i}.key/value`; salidas `logits` y `present.{i}.key/value`. La exportación se generó con el script `tools/causal_lm/make_models.py` del repositorio del paquete.

## Capacidades

- Generación de texto e instrucciones en el ámbito propio de un modelo de 135M: respuestas cortas, reformulación, clasificación simple y extracción básica.
- Conversación multi-turno mediante la caché KV explícita (`past_key_values`), reutilizable token a token.
- Ejecución en Unity Inference Engine a través del paquete `tools.doji.transformers`, que es el propósito declarado de la conversión.
- Inferencia en CPU y en dispositivos de gama baja, dado el tamaño reducido del modelo.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido. El modelo base es un instruct ligero, sin estas capacidades declaradas en esta ficha.

## Casos de uso

- Integración de un LLM en proyectos Unity: el modelo se importa directamente en Unity Inference Engine al usar solo operadores estándar de ONNX, lo que permite añadir diálogo generativo a juegos o simulaciones sin salir del ecosistema de Unity.
- NPC con diálogo dinámico en videojuegos: con 135M de parámetros y pesos float32, el modelo puede ejecutarse en el propio dispositivo del jugador para respuestas breves y contextualizadas, evitando llamadas a la nube.
- Prototipado rápido de asistentes conversacionales: sirve para validar pipelines de prompt, plantillas de chat y gestión de caché KV antes de escalar a modelos mayores.
- Clasificación y etiquetado de texto ligero: tareas de categorización de mensajes, extracción de entidades simples o resumen de una línea en entornos con cómputo limitado.
- Pruebas de integración de ONNX en producción: útil como modelo de referencia para verificar que un runtime ONNX (Unity, onnxruntime, etc.) carga correctamente grafos con caché KV explícita.
- Educación y experimentación: permite estudiar el funcionamiento de un transformer instruct completo con un coste de hardware mínimo y con el grafo visible en ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 0,7 GB y los pesos están en float32; la inferencia requiere del orden de 1 GB de memoria o menos, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de memoria libre es suficiente, incluidas integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: Unity Inference Engine (objetivo principal), ONNX Runtime y cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct-onnx (este) | 135M | No disponible | ONNX float32, opset 17 | Apache 2.0 | Operadores estándar, compatible con Unity Inference Engine |
| SmolLM2-135M-Instruct (original) | 135M | No disponible | Safetensors / ONNX oficial | Apache 2.0 | Exportación oficial con contrib ops, no importable en Unity |
| Otros modelos de la familia SmolLM2 | No disponible | No disponible | No disponible | Apache 2.0 | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Con 135M de parámetros, la calidad de razonamiento, el conocimiento factual y la coherencia en contextos largos son limitados; es esperable una tasa alta de alucinación en preguntas abiertas.
- No se documentan en esta ficha los sesgos del modelo base; deben consultarse en la model card de `HuggingFaceTB/SmolLM2-135M-Instruct`.
- Los idiomas soportados no están declarados en la información disponible; conviene validar el comportamiento en castellano antes de usarlo en producción.
- La longitud de contexto no se especifica en esta ficha y depende del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar también la licencia y las limitaciones del modelo original.
- El repositorio no registra descargas ni likes y fue creado recientemente; no hay evidencia de uso en producción ni de mantenimiento continuado.
- La exportación está pensada para Unity Inference Engine; otros runtimes ONNX pueden funcionar, pero no es el caso validado por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/julienkay/SmolLM2-135M-Instruct-onnx
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Paquete Unity del autor: https://github.com/julienkay/tools.doji.transformers
