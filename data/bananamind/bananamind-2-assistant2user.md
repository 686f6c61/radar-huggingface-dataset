# BananaMind/BananaMind-2-assistant2user

## Resumen
BananaMind 2 Assistant2User es un modelo de lenguaje de 138.971.520 parámetros (unos 139M) desarrollado por BananaMind. Su particularidad es que invierte el flujo habitual de una conversación: en lugar de generar la respuesta del asistente a partir del mensaje del usuario, recibe la respuesta del asistente como contexto y reconstruye el mensaje de usuario que probablemente la originó. Es un ajuste fino completo (full fine-tune) del modelo base BananaMind-2-Pro sobre conversaciones invertidas del dataset HuggingFaceTB/smol-smoltalk.

El modelo pertenece a la categoría que el propio autor etiqueta como reverse-SFT o assistant-to-user. Resuelve un problema concreto: inferir la intención del usuario a partir de la salida del asistente, algo útil para auditoría de conversaciones, generación de datos sintéticos, análisis de intención y evaluación de sistemas conversacionales. Trabaja con una longitud de contexto de 3.072 tokens y se publica bajo licencia Apache 2.0 con pesos en safetensors y precisión BF16.

Se trata de un modelo pequeño, experimental y de nicho (registra 0 descargas y 1 like en el momento de la consulta), por lo que su interés es más de investigación y de herramienta auxiliar que de despliegue generalista. Su relevancia radica en explorar la dirección inversa del diálogo, una tarea poco cubierta por los modelos generativos convencionales.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (etiquetado causal-lm) con custom_code; detalles internos no disponibles |
| Parametros totales | 138.971.520 (≈139M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 3.072 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | BananaMind/BananaMind-2-Pro |
| Precision de entrenamiento | BF16 |

## Arquitectura y entrenamiento
El modelo es un transformer causal (causal-lm) obtenido mediante ajuste fino completo de los 138.971.520 parámetros de BananaMind-2-Pro. Requiere `trust_remote_code=True` para cargarse, lo que indica que incluye código personalizado en el repositorio. No se detalla la composición interna de capas, el tipo de attention ni el vocabulario en la información disponible.

El entrenamiento se realizó sobre el dataset HuggingFaceTB/smol-smoltalk, cuyas conversaciones originales siguen el formato usuario → asistente. Cada par adyacente usuario/asistente se convirtió en un ejemplo invertido independiente: la respuesta del asistente se usa como contexto y se predice el mensaje de usuario reconstruido, con el prefijo de reconstrucción y la respuesta del asistente enmascarados de la función de pérdida (la loss solo se aplica al mensaje de usuario reconstruido). La configuración reportada es: learning rate 5e-5, micro batch size 8, gradient accumulation 4, batch efectivo 32, 1 época y precisión BF16. No se menciona uso de RLHF ni DPO.

## Capacidades
- Reconstrucción de mensajes de usuario: recibe una respuesta de asistente y genera el mensaje de usuario que probablemente la provocó.
- Generación de texto condicionada: pipeline `text-generation` estándar vía transformers.
- Manejo de distintos tipos de consulta reconstruida: preguntas factuales ("What is the capital of Japan?"), preguntas de sí/no ("Is 17 an even number?"), consultas de programación, dudas de instalación y preguntas sobre complejidad computacional.
- Reconstrucción de mensajes largos y detallados a partir de respuestas extensas.
- Funcionamiento fuera del dataset de entrenamiento: el autor reporta un ejemplo probado sobre una respuesta real de una conversación de ChatGPT, no perteneciente a Smol-SmolTalk.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de razonamiento explícito (thinking).

## Casos de uso
- Auditoría de conversaciones: dado un histórico de respuestas de un asistente, el modelo reconstruye las preguntas que las originaron, lo que permite recuperar la intención del usuario en logs donde solo se conservaron las salidas.
- Generación de datos sintéticos: producir pares usuario/asistente sintéticos partiendo de respuestas existentes, útil para ampliar datasets de entrenamiento o evaluación.
- Análisis de intención: clasificar o etiquetar la intención subyacente de interacciones a partir de la respuesta generada, por ejemplo en sistemas de soporte técnico.
- Evaluación de asistentes: comprobar si la respuesta de un asistente permite inferir correctamente la pregunta, como métrica indirecta de claridad y especificidad de la salida.
- Reconstrucción de prompts en pipelines de ingeniería de prompts: inferir qué instrucción podría haber producido una salida concreta, útil al reproducir o documentar comportamientos.
- Sistemas de inversión de diálogo en investigación: base para experimentos de reverse-SFT, destilación inversa o modelos auxiliares dentro de arquitecturas multiagente.
- Filtrado y curación de datasets: detectar respuestas genéricas o ambiguas cuya pregunta de origen no puede reconstruirse con precisión.

## Benchmarks y rendimiento
Evaluación realizada por el autor sobre los primeros 2.500 pares usuario/asistente extraídos del split de test de Smol-SmolTalk, ocultando el mensaje de usuario original y comparando la reconstrucción generada con el original.

| Metrica | Resultado |
|---|---|
| Token Top-1 Accuracy | 24,617% |
| Token Difference | 75,383% |
| Token F1 | 38,189% |
| Exact Sequence Accuracy | 1,200% |

Notas sobre las métricas: la Token Top-1 Accuracy se calcula como `1 - token_edit_distance / max(reference_tokens, generated_tokens)` y es estricta; el propio autor señala que reconstrucciones semánticamente equivalentes pueden obtener una puntuación muy inferior cuando emplean una formulación distinta. No se han publicado comparaciones con otros modelos para esta tarea en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 138,97M de parámetros, los pesos ocupan aproximadamente 0,28 GB en BF16/FP16 y 0,56 GB en FP32, más el KV cache de hasta 3.072 tokens, que es reducido.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, etc., incluso en GPUs con 4 GB o menos de VRAM.
- También puede ejecutarse en CPU para inferencia puntual, dado su tamaño.
- GPU de datacenter (A100, H100, L40S) solo serían necesarias para servir muchas peticiones en paralelo; no por requisitos de memoria del modelo.
- Opciones de despliegue: transformers (vía `AutoModelForCausalLM` con `trust_remote_code=True`), y potencialmente vLLM, TGI o llama.cpp si se convierte a GGUF, aunque no se documentan conversiones oficiales ni soporte explícito.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares
No se dispone de modelos comparables directos para la tarea de reconstrucción assistant-to-user. A continuación se compara a nivel de especificaciones con alternativas de tamaño similar, aunque su tarea objetivo es distinta.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BananaMind-2-assistant2user | 138,97M | 3.072 | Reconstrucción assistant-to-user | Apache 2.0 | HuggingFace |
| BananaMind-2-AI-Detect (mismo autor) | No disponible | No disponible | Detección humano vs IA | No disponible | HuggingFace |
| BananaMind-2-Pro (modelo base) | No disponible en esta ficha | No disponible | Generación de texto general | No disponible | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Baja precisión de reconstrucción exacta: Exact Sequence Accuracy del 1,200% y Token Top-1 Accuracy del 24,617% sobre el conjunto de evaluación; en la práctica, la coincidencia literal con el mensaje original es poco frecuente.
- Riesgo de alucinación: al inferir una consulta que no está explícita en la respuesta, el modelo puede generar un mensaje de usuario plausible pero distinto del real, introduciendo información no presente en el contexto.
- Sensibilidad a la formulación: reconstrucciones semánticamente correctas pueden obtener puntuaciones bajas por diferencias de redacción, según advierte el propio autor.
- Limitación de contexto: ventana de 3.072 tokens, insuficiente para respuestas muy largas o historiales extensos.
- Idiomas soportados no documentados: no se especifica cobertura multilingüe y el dataset de entrenamiento (smol-smoltalk) no se describe en cuanto a composición lingüística.
- Sesgos: no se documentan análisis de sesgo; el modelo hereda los sesgos de BananaMind-2-Pro y de Smol-SmolTalk.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y exige revisión previa en entornos de producción.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con las obligaciones habituales de atribución y conservación de avisos.
- Modelo experimental con muy poca adopción (0 descargas, 1 like), sin garantías de mantenimiento ni validación externa.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/BananaMind/BananaMind-2-assistant2user
- Modelo base BananaMind-2-Pro: https://huggingface.co/BananaMind/BananaMind-2-Pro
- Dataset de entrenamiento Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Modelo relacionado del mismo autor (BananaMind-2-AI-Detect): https://huggingface.co/BananaMind/BananaMind-2-AI-Detect
- Demo del modelo relacionado (Space de Banaxi-Tech): https://huggingface.co/spaces/Banaxi-Tech/BananaMind-2-AI-Detect-Demo
