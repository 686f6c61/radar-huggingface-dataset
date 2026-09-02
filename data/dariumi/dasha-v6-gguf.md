# dariumi/dasha-v6-gguf

## Resumen

Dasha v6 (identificador `dariumi/dasha-v6-gguf`) es un modelo de lenguaje conversacional en ruso, resultado de un fine-tuning QLoRA sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct`. Lo desarrolla el autor `dariumi` como parte del proyecto DariaOS, un sistema operativo de asistente personal que utiliza este modelo como "cerebro" local por defecto cargado a través de llama.cpp. El modelo está publicado exclusivamente en formato GGUF, con dos cuantizaciones: Q5_K_M (la recomendada por defecto) y F16.

La relevancia de este modelo radica en su propósito específico: dotar de personalidad y estilo conversacional a un asistente local de bajo coste computacional. Al estar basado en Llama 3.2 de 3.2 mil millones de parámetros, puede ejecutarse en hardware modesto, incluso en CPU. Aunque está orientado al ruso, hereda las capacidades multilingües del modelo base, aunque su uso principal es el roleplay y la conversación informal. No se proporcionan detalles sobre el dataset de entrenamiento ni métricas de rendimiento, por lo que su evaluación debe basarse en pruebas empíricas directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, Llama 3.2) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-3.2-3B-Instruct soporta 128K, pero no se confirma en esta variante) |
| Tipos de cuantizacion | Q5_K_M (~2.2 GB), F16 (~6 GB) |
| Idiomas soportados | ruso (principal), con capacidades multilingües heredadas del base |
| Licencia | Llama 3.2 Community License (hereda de Meta) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning QLoRA del modelo `meta-llama/Llama-3.2-3B-Instruct`. La arquitectura base es un transformer decoder-only con atención causal estándar, 3.2 mil millones de parámetros y una ventana de contexto nativa de 128K tokens (aunque la model card de Dasha v6 no especifica si se mantiene o se reduce). El entrenamiento QLoRA permite ajustar el modelo con un coste reducido de VRAM y memoria, manteniendo los pesos originales congelados e insertando adaptadores de bajo rango. No se detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La finalidad declarada es otorgar al modelo una personalidad y un estilo conversacional concreto ("Dasha"), orientado al roleplay y a la interacción natural en ruso.

El modelo se distribuye únicamente en formato GGUF, lo que permite su ejecución eficiente en CPU y GPU mediante llama.cpp, llama-server u otros motores compatibles con este formato. No se ofrece la versión en safetensors, por lo que su uso fuera del ecosistema llama.cpp requeriría una conversión previa.

## Capacidades

- Generacion de texto conversacional en ruso con personalidad definida (estilo "Dasha").
- Soporte de roleplay y diálogos multi-turno, gracias a su fine-tuning específico para interacción natural.
- Capacidades multilingües heredadas del modelo base Llama-3.2-3B-Instruct, aunque no se garantiza el mismo rendimiento fuera del ruso.
- Ejecución local en hardware modesto gracias a su tamaño (3.2B) y a las cuantizaciones Q5_K_M y F16.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio. El modelo es puramente textual.

## Casos de uso

- Asistente personal local para hablantes de ruso: Dasha v6 puede integrarse en aplicaciones de escritorio o móviles para gestionar conversaciones, responder preguntas y mantener un tono amigable. Su tamaño reducido permite ejecutarlo en portátiles o mini-PCs sin GPU dedicada.
- Roleplay y juegos de texto: el fine-tuning específico lo hace adecuado para simular personajes en juegos de rol escritos, chats de ficción o mundos virtuales, donde la coherencia de personalidad es clave.
- Chatbot de atención al cliente en ruso: aunque no se ha optimizado para tareas empresariales, su capacidad conversacional puede adaptarse a flujos de soporte básico, siempre que se supervise su salida.
- Prototipado de asistentes de voz: al ser ligero, puede servir como backend de un asistente de voz local en ruso, combinado con un motor de TTS/STT.
- Educación y práctica de idiomas: puede actuar como interlocutor para practicar ruso conversacional, dado su estilo natural y su enfoque en diálogo.
- Investigación en fine-tuning eficiente: sirve como ejemplo práctico de QLoRA aplicado a un modelo pequeño para un dominio específico, útil para estudiar transferencia de estilo y personalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda realizar evaluaciones propias según el caso de uso.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q5_K_M (~2.2 GB) puede ejecutarse en GPU con 4 GB de VRAM, como una GTX 1650 o RTX 3050. La versión F16 (~6 GB) requiere al menos 8 GB de VRAM.
- En CPU, llama.cpp permite ejecutar Q5_K_M con 8 GB de RAM, con latencia de varios tokens por segundo (dependiendo del procesador).
- GPUs recomendadas: cualquier GPU compatible con CUDA o Vulkan con al menos 4 GB de VRAM para Q5_K_M; para F16 se recomiendan GPUs con 8 GB o más (RTX 3060, RTX 4060, A100, etc.).
- Despliegue: compatible con llama.cpp, llama-server, Ollama (si se convierte el GGUF), vLLM (requiere conversión a safetensors) y TGI (similar). El proyecto DariaOS lo carga directamente con `llm_runtime.py`.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la cuantización. En una CPU moderna (8 núcleos), Q5_K_M puede generar entre 5 y 15 tokens/segundo; en una GPU de gama media, 50-100 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Dasha v6 (dariumi) | 3.2B | no disponible | Conversacional ruso, roleplay | Llama 3.2 Community | GGUF |
| Llama-3.2-3B-Instruct (Meta) | 3.2B | 128K | Instruct general multilingüe | Llama 3.2 Community | Safetensors, GGUF |
| Qwen2.5-3B-Instruct (Alibaba) | 3.2B | 32K | Instruct general, código y matemáticas | Apache 2.0 | Safetensors, GGUF |
| Gemma-2-2B-it (Google) | 2.6B | 8K | Instruct general, multilingüe | Gemma License | Safetensors, GGUF |

La comparativa es estructural, ya que no hay benchmarks públicos de Dasha v6. Frente al modelo base, Dasha v6 añade un fine-tuning de personalidad en ruso, pero pierde la garantía de rendimiento en tareas generales. Qwen2.5-3B-Instruct ofrece licencia Apache 2.0 y mejor soporte de código, pero no está especializado en roleplay ruso. Gemma-2-2B-it es más ligero pero con contexto menor y licencia más restrictiva.

## Limitaciones y advertencias

- Sesgos conocidos: heredados del modelo base Llama-3.2, que puede presentar sesgos culturales, de género o políticos. El fine-tuning en ruso puede amplificar sesgos específicos de ese idioma y cultura.
- Riesgo de alucinacion: al ser un modelo pequeño (3.2B), es propenso a generar información falsa o inventada, especialmente en tareas de conocimiento general. No apto para uso sin supervisión en contextos de alta precisión.
- Limitaciones de contexto: aunque el base soporta 128K, no se confirma si el fine-tuning mantiene esa longitud. Se recomienda probar con secuencias largas antes de usarlo en producción.
- Limitaciones de idioma: el modelo está optimizado para ruso; el rendimiento en otros idiomas puede ser inferior al del modelo base original.
- Restricciones de licencia: la licencia Llama 3.2 Community License permite uso comercial, pero exige que los servicios con más de 700 millones de usuarios mensuales soliciten permiso a Meta. Además, no se permite utilizar el modelo para mejorar otros modelos sin autorización.
- Caveat para produccion: sin benchmarks ni documentación de entrenamiento, no hay garantía de calidad. Se recomienda una evaluación exhaustiva en el dominio objetivo antes de su despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dariumi/dasha-v6-gguf
- Proyecto DariaOS (GitHub): https://github.com/dariumi/DariaOS
- Modelo base (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE.txt
