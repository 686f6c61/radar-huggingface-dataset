# juanpza/Llama-Prompt-Guard-2-86M-guardrail-ft

## Resumen

Llama-Prompt-Guard-2-86M-guardrail-ft es un ajuste fino del clasificador Meta Llama Prompt Guard 2 (86M parámetros) orientado a la detección de *prompt injection* indirecto, es decir, instrucciones maliciosas ocultas en resultados de herramientas como READMEs, logs, HTML, correos o mensajes de chat. Lo desarrolla el usuario juanpza y se publica como versión v3 de un trabajo interno (RFC-017) de su equipo. El modelo base deriva de una arquitectura DeBERTa-v2 y el ajuste mantiene el mismo tamaño y arquitectura, por lo que la latencia de inferencia no cambia respecto al original.

El problema que aborda es concreto: los modelos de clasificación de inyección de prompts suelen detectar bien ataques directos (jailbreaks en el turno del usuario) pero fallan cuando la instrucción maliciosa llega embebida en contenido que el agente procesa como dato, no como instrucción. Este ajuste busca mejorar la *recall* en ese escenario y, a la vez, reducir los falsos positivos cuando un usuario menciona un ataque sin ejecutarlo.

Se distribuye como un `model.onnx` en FP32 con dos clases de salida (0 = benigno, 1 = ataque), pensado para integrarse como detector `injection-pg2-onnx` dentro de un guardrail. El modelo está entrenado para inglés, español y textos mixtos, y se publica bajo la Llama 4 Community License. El repositorio ocupa 1,1 GB y no registra descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (clasificador de texto, encoder) |
| Parámetros totales | 86M (heredados del modelo base Llama Prompt Guard 2 86M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (solo se analizan los primeros 512 tokens) |
| Tipos de cuantización | FP32 en el artefacto publicado (ONNX); no se documentan otras variantes |
| Idiomas soportados | inglés, español y textos mixtos |
| Licencia | Llama 4 Community License (license_name: llama4) |
| Formato de pesos | ONNX (`model.onnx`, FP32) + tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo es un encoder transformer DeBERTa-v2 de 86M parámetros con cabeza de clasificación binaria (benigno / ataque), heredado del modelo base `meta-llama/Llama-Prompt-Guard-2-86M` y exportado a ONNX en FP32. Las entradas son `input_ids` y `attention_mask`, y la salida es un tensor `logits` de dos clases. No hay cambios de arquitectura ni de tamaño respecto al original, por lo que el coste computacional por inferencia es idéntico.

El ajuste fino se realizó con aproximadamente 5.400 ejemplos sintéticos de ataque (inyecciones embebidas en 14 tipos de salida de herramienta, variantes ofuscadas, jailbreaks directos y *hard negatives*) en inglés, español y mixto, más unos 4.200 textos benignos reales (3.000 mensajes de OpenAssistant y 1.200 archivos de código) y el conjunto `deepset/prompt-injections`. Se entrenó durante 1 época con una tasa de aprendizaje de 1,5e-5. El conjunto de referencia del equipo no se utilizó en el entrenamiento, aunque las plantillas sintéticas se redactaron tras inspeccionar ese conjunto, lo que el propio autor señala como fuente de optimismo en las métricas reportadas.

## Capacidades

- Clasificación binaria de texto: distingue entre contenido benigno (índice 0) y ataque de prompt injection (índice 1).
- Detección de *prompt injection* indirecto en resultados de herramientas: READMEs, logs, HTML, correos, mensajes de chat y otros 14 tipos de salida documentados.
- Detección de variantes ofuscadas de instrucciones maliciosas.
- Detección de jailbreaks directos (incluidos en el conjunto de entrenamiento).
- Manejo de *hard negatives*: reduce el marcado de usuarios que mencionan un ataque sin ejecutarlo.
- Soporte multilingüe para inglés, español y mezcla de ambos.
- Integración como detector `injection-pg2-onnx` en un guardrail, apuntando `model_dir` a la carpeta del modelo.
- Salida compatible con pipelines de `text-classification`.

## Casos de uso

- Filtrado de resultados de herramientas en agentes LLM: antes de inyectar la salida de una herramienta (lectura de README, logs, HTML descargado) en el contexto del modelo, se clasifica con este detector para bloquear instrucciones embebidas. Es el caso de uso principal y para el que fue entrenado.
- Protección de pipelines RAG: clasificar fragmentos recuperados de la base documental antes de pasarlos al generador, de modo que un documento envenenado no introduzca instrucciones al modelo.
- Moderación de entradas en español: el salto de *recall* en español (del 12% al 72% según el conjunto de referencia del equipo) lo hace útil en aplicaciones hispanohablantes donde el modelo original fallaba.
- Defensa en asistentes de correo o chat: analizar el cuerpo de mensajes recibidos antes de que un agente los procese como contexto.
- Pre-filtro de bajo coste en cascada: al ser un encoder de 86M en ONNX, puede ejecutarse en CPU o GPU pequeña como primera etapa antes de un clasificador o LLM juez más caro.
- Monitorización y auditoría de tráfico de agentes: registrar la probabilidad de ataque por cada salida de herramienta para detectar intentos de inyección en producción.
- Evaluación de robustez de sistemas propios: usar el detector como referencia para medir si un agente cae ante inyecciones indirectas en pruebas internas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de referencia de su equipo (gates completos) y conjuntos externos:

| Métrica | Original | v3 |
|---|---|---|
| Recall de inyección en resultados de herramienta | 25,0% | 68,1% |
| Recall de inyección en resultados de herramienta (español) | 12% | 72% |
| Tasa de falsos positivos en resultados de herramienta | 0,84% | 0,42% |
| Recall en InjecAgent (externo) | 0,3% | 3,6% |
| Falsos positivos en texto benigno real (externo) | 0,1% | 0,2% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; las métricas anteriores son específicas de la tarea de detección de inyección.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un encoder de 86M en FP32 ocupa del orden de 0,35 GB de pesos, más activaciones y overhead del runtime ONNX.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, T4 y similares.
- Cabe en GPU de consumo e incluso en CPU: al ser ONNX FP32 y 86M de parámetros, la inferencia en CPU es viable para volúmenes moderados.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto), integración en el guardrail del autor como detector `injection-pg2-onnx`. No se documentan pesos en safetensors, GGUF ni soporte directo para vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica que la latencia es la misma que la del modelo original al compartir arquitectura y tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Prompt-Guard-2-86M-guardrail-ft (este) | 86M | 512 tokens | Detección de prompt injection indirecto (en/es) | Llama 4 Community License | ONNX en HuggingFace |
| meta-llama/Llama-Prompt-Guard-2-86M (base) | 86M | 512 tokens | Detección de prompt injection | Llama 4 Community License | HuggingFace |
| deepset/prompt-injections (dataset) | no aplica | no aplica | Conjunto de datos de inyección de prompts | no disponible | HuggingFace |

No se dispone de datos comparativos de otros clasificadores de prompt injection en la información proporcionada; la comparación más directa es contra el modelo base, cuyos resultados se incluyen en la tabla de benchmarks.

## Limitaciones y advertencias

- Las métricas sobre el conjunto de referencia son optimistas: las plantillas sintéticas se escribieron después de inspeccionar ese conjunto y cada versión se ajustó sobre sus resultados.
- Los ataques que no se dirigen al asistente (estilo InjecAgent) siguen fallando casi siempre: la *recall* externa en InjecAgent es solo del 3,6%.
- La *recall* sobre system prompts cayó al 0% en esta versión.
- Solo se analizan los primeros 512 tokens de la entrada; contenido malicioso más allá de ese límite no se detecta.
- Los falsos positivos en texto benigno real aumentaron ligeramente respecto al original (0,1% a 0,2% en el conjunto externo).
- Licencia Llama 4 Community License: uso comercial sujeto a los términos de Meta y a su política de uso aceptable; no es una licencia permisiva tipo Apache o MIT.
- El modelo es un clasificador, no un generador: no mitiga por sí mismo la inyección, solo la detecta; debe integrarse en un guardrail que actúe sobre la señal.
- Sin descargas registradas ni validación comunitaria externa en el momento de redactar esta ficha; conviene evaluarlo sobre datos propios antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juanpza/Llama-Prompt-Guard-2-86M-guardrail-ft
- Modelo base: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Licencia Llama 4: https://www.llama.com/llama4/license/
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- OpenAssistant (fuente de textos benignos): no disponible enlace específico en la información proporcionada
- InjecAgent (conjunto de evaluación externo): no disponible enlace específico en la información proporcionada
