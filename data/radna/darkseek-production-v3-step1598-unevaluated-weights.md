# radna/darkseek-production-v3-step1598-unevaluated-weights

## Resumen

`radna/darkseek-production-v3-step1598-unevaluated-weights` es un fine-tune derivado de `deepseek-ai/DeepSeek-V4.1-Flash-1017`, un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) con aproximadamente 491.375 millones de parámetros totales y soporte nativo de contexto de 1 millón de tokens. Lo publica el usuario `radna` en Hugging Face, mientras que la model card referencia al autor original de la modificación (abliteración) como `@dealignai`, con crédito de cómputo a `@jordanschenck`. El modelo se distribuye en formato nativo FP8 (e4m3) con escalas de bloque ue8m0 y expertos en FP4, en 48 shards de safetensors, y es compatible byte a byte con el motor de inferencia de referencia de DeepSeek.

El propósito declarado de esta variante es eliminar el comportamiento de rechazo (refusal) del modelo base, de modo que responda a solicitudes en categorías de temas que el modelo original declinaría. Según la model card, la modificación es exclusivamente a nivel de pesos, sin jailbreak de plantilla de chat, sin system prompt inyectado, sin LoRA ni adaptadores en tiempo de carga, y sin fine-tuning supervisado, RLHF ni DPO. Se preservan las capacidades del modelo base: visión, vídeo, niveles de esfuerzo de razonamiento (`low`, `high`, `max`), tool calling, decodificación especulativa DSpark y el contexto de 1M tokens.

La relevancia de esta ficha es doble: por un lado, documenta una variante "uncensored/abliterated" de un modelo frontera de gran tamaño, un fenómeno cada vez más común en el ecosistema open source; por otro, la propia model card advierte de que el checkpoint se publica como "unevaluated weights" (pesos no evaluados) y de que cuantizar directamente este FP8 degrada la calidad, lo que condiciona seriamente su uso en producción. La licencia declarada es MIT, con acceso restringido mediante gate de edad y aceptación de responsabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) de 40 capas, multimodal (imagen + vídeo), según model card |
| Parametros totales | 491.375.079.634 (~491,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 nativo (e4m3) con escalas de bloque ue8m0; expertos MoE en FP4; el autor advierte contra cuantización derivada de este checkpoint |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT (con gate de acceso: confirmación de mayoría de edad y aceptación de responsabilidad) |
| Formato de pesos | safetensors (48 shards), FP8 e4m3 + escalas ue8m0, expertos FP4; repo de 365,8 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 40 capas con atención sobre un contexto de 1M tokens y capacidades multimodales de imagen y vídeo. La variante aquí descrita incorpora pesos en FP8 nativo (e4m3) con escalas de bloque ue8m0 y expertos MoE en FP4, el mismo esquema de precisión que DeepSeek distribuye en el modelo original. Incluye decodificación especulativa DSpark y niveles de esfuerzo de razonamiento configurables (`low`, `high`, `max`). El repositorio conserva el motor `inference/` y el renderizador de prompts `encoding/` de referencia de DeepSeek, de modo que cualquier stack que cargue el modelo base puede cargar esta variante.

En cuanto al entrenamiento, la model card es explícita: no se ha realizado fine-tuning supervisado, RLHF ni DPO, y no se ha alimentado nuevo dato de entrenamiento al modelo. La modificación es una edición a nivel de pesos orientada a eliminar el comportamiento de rechazo (abliteración), manteniendo los tensores parcheados en FP8 e4m3 a su granularidad de bloque nativa. No se modifican vocabulario ni tokenizer (`tokenizer.json` y `tokenizer_config.json` son idénticos byte a byte al original). El nombre del repositorio incluye "step1598-unevaluated-weights", lo que sugiere un checkpoint intermedio de un pipeline de edición no validado; no se detalla en la información disponible qué significa exactamente ese paso ni cuántos pasos componen el proceso.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`), heredados del modelo base.
- Comprensión multimodal de imagen y vídeo (pipeline `image-text-to-text`).
- Tool calling / function calling, preservado del modelo base.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos, repositorios de código o conversaciones multi-turno muy largas.
- Decodificación especulativa DSpark para acelerar la generación.
- Multilingüe en inglés, chino, español, francés, ruso, italiano y tailandés.
- Comportamiento "uncensored": responde a solicitudes en categorías que el modelo base rechazaría, según declara el autor.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el motor de inferencia de referencia de DeepSeek sin cambios de código.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente qué comportamientos se eliminan con una abliteración a nivel de pesos y cómo afecta a las capacidades generales, comparando contra el modelo base con el mismo prompt y decodificación.
- Análisis de documentos legales o contractuales de gran extensión: con 1M tokens de contexto, puede procesar expedientes completos o múltiples contratos en una sola pasada sin fragmentación, manteniendo coherencia entre secciones.
- Procesamiento de vídeo e imagen en pipelines de inspección: la entrada multimodal permite describir, clasificar o extraer información de fotogramas y documentos escaneados dentro de un mismo flujo.
- Generación de código y asistencia en repositorios grandes: el contexto de 1M tokens y el tool calling permiten integrarlo en asistentes que consultan APIs o ejecutan funciones, aunque la calidad en código de esta variante no está evaluada.
- Atención al cliente multilingüe: cubre siete idiomas y conversaciones multi-turno largas; útil en escenarios donde el filtrado de temas del modelo base resulta demasiado restrictivo (por ejemplo, consultas médicas o legales sensibles).
- Prototipado de agentes multi-paso: los niveles de razonamiento y el soporte de herramientas permiten construir agentes que planifican, llaman funciones y razonan sobre resultados intermedios.
- Experimentación con cuantización: sirve como caso de estudio de por qué cuantizar un checkpoint abliterado en FP8 degrada el cumplimiento, tal como advierte el autor, y para comparar con la variante EXL3 2.9 bpw construida de forma nativa.

## Benchmarks y rendimiento

La model card incluye una tabla de MMLU en modo logit (57 materias × 20 preguntas, 1140 preguntas totales, greedy T=0) que compara el modelo base servido por la API oficial de DeepSeek frente a la variante "CRACK" (presumiblemente la versión uncensored). El texto proporcionado está truncado en el valor del modelo base (87,63 %, 999/11...), por lo que no es posible reproducir la tabla completa ni el resultado de la variante. No se han publicado en la información disponible resultados de HumanEval, GSM8K u otros benchmarks para este checkpoint concreto, ni evaluación alguna de la variante `radna/darkseek-production-v3-step1598-unevaluated-weights`, que se publica explícitamente como "unevaluated".

| Benchmark | Modelo base (API oficial) | Esta variante |
|---|---|---|
| MMLU (57×20, logit, T=0) | 87,63 % (dato parcial en la fuente) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 365,8 GB en FP8/FP4; se necesita un conjunto de GPUs cuyo total de memoria supere ese tamaño con margen para el KV cache del contexto de 1M tokens.
- La model card reporta evaluación en 4×H200 con tensor parallelism 4 (TP4) usando el motor de inferencia de referencia.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en su precisión nativa; requeriría cuantizaciones de muy bajo bit, que el autor desaconseja explícitamente para este checkpoint.
- Opciones de despliegue: motor `inference/` de referencia de DeepSeek (incluido en el repo), compatible con endpoints; el autor no documenta soporte de vLLM, llama.cpp, Ollama o TGI para esta variante concreta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| radna/darkseek-production-v3-step1598 (esta ficha) | ~491,4 B (MoE) | 1M | Texto + imagen + vídeo | MIT | Pesos no evaluados, gate de acceso |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | ~491,4 B (MoE) | 1M | Texto + imagen + vídeo | no disponible en la información | Modelo de referencia, con rechazos |
| dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 | ~491,4 B (MoE) | 1M | Texto + imagen + vídeo | MIT (según la model card citada) | Variante uncensored FP8 del mismo linaje |
| dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | ~491,4 B (MoE) | 1M | Texto + imagen + vídeo | MIT (según la model card citada) | Variante uncensored de bajo bit construida de forma nativa |

Las tres alternativas comparten el mismo modelo base y tamaño; la diferencia principal es el pipeline de edición y la precisión de los pesos. No se dispone de benchmarks comparativos entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Pesos publicados como "unevaluated": no hay evaluación publicada de esta variante concreta, por lo que su calidad real es desconocida.
- La abliteración elimina rechazos de forma deliberada: el modelo puede generar contenido dañino, ilegal o inseguro según la jurisdicción; el autor exige confirmar mayoría de edad y aceptar responsabilidad total sobre las salidas.
- Cuantizar este checkpoint FP8 degrada la calidad y puede hacer regresar el cumplimiento; el autor recomienda rehacer el pipeline de abliteración en la precisión objetivo en lugar de cuantizar a posteriori.
- Riesgo de alucinación no cuantificado: al no haber benchmarks publicados, no se puede estimar su fiabilidad frente al modelo base.
- El contexto de 1M tokens exige recursos de memoria considerables para el KV cache, lo que limita su despliegue práctico.
- Idiomas soportados limitados a siete (en, zh, es, fr, ru, it, th); el rendimiento en español no está evaluado específicamente.
- Licencia MIT declarada, pero con gate de acceso y cláusula de atribución solicitada ("Based on dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8"); conviene verificar las condiciones del modelo base antes de uso comercial.
- El nombre del repo sugiere un checkpoint intermedio (step 1598) de un proceso no documentado; no se especifica si es el estado final del pipeline.
- Sin garantías de soporte en frameworks de despliegue estándar más allá del motor de referencia de DeepSeek.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/radna/darkseek-production-v3-step1598-unevaluated-weights
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante uncensored FP8 de referencia: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Alias abliterated: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2.9 bpw uncensored: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor de la modificación: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Ko-fi del autor: https://ko-fi.com/dealignai
