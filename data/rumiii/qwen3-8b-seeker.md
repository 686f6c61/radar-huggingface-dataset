# Rumiii/Qwen3-8B-Seeker

## Resumen

Qwen3-8B-Seeker es un ajuste fino del modelo Qwen3-8B de Alibaba, publicado por el usuario Rumiii en HuggingFace. El modelo se ha entrenado específicamente como agente de respuesta a preguntas multi-salto (multi-hop QA), siguiendo un protocolo de etiquetas que estructura el razonamiento en fases explícitas: `<think>`, `<plan>`, `<wiki_search>`, `<observation>`, `<reflection>` y `<answer>`. El objetivo es que el modelo aprenda a planificar búsquedas, formular consultas a un recuperador externo, reflexionar sobre las observaciones recibidas y componer una respuesta final fundamentada.

El modelo parte de la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parámetros totales, y se ha obtenido mediante QLoRA con rango 32 sobre una muestra aleatoria de 3.000 ejemplos del dataset PersonalAILab/AFM-MHQA-Agent-SFT-Dataset, más 72 muestras de identidad. El entrenamiento se realizó en una única GPU T4 con Unsloth, durante una época, en modo no-thinking (`enable_thinking=False`), y los pesos resultantes se fusionaron a fp16.

Es relevante porque ejemplifica una tendencia práctica: adaptar modelos abiertos de tamaño medio a flujos agénticos concretos mediante ajuste fino ligero, en lugar de depender exclusivamente de tool calling nativo. Aun así, se trata de un modelo experimental con cero descargas y cero likes en el momento de la consulta, entrenado sobre un subconjunto reducido de un único dataset, lo que limita seriamente sus garantías para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta contexto largo, pero la ficha no lo confirma para este ajuste) |
| Tipos de cuantizacion | No se publican pesos cuantizados; el autor indica que los pesos se fusionaron a fp16. Al ser compatible con transformers, admite cuantizacion posterior (GPTQ, AWQ, GGUF) por parte del usuario, pero no se ofrece oficialmente |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (fp16 fusionado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-8B, sin modificaciones estructurales. El ajuste se realizó con QLoRA de rango 32 sobre los pesos del modelo base, utilizando la librería Unsloth y una única GPU T4. Se entrenó durante una sola época sobre una muestra aleatoria de 3.000 ejemplos del dataset PersonalAILab/AFM-MHQA-Agent-SFT-Dataset, descartando las muestras de más de 4.096 tokens (sin truncarlas) y añadiendo 72 muestras de identidad. Posteriormente, los adaptadores se fusionaron con el modelo base para producir pesos fp16 completos.

La innovación técnica principal no reside en la arquitectura, sino en el protocolo de agente aprendido. El modelo genera etiquetas estructuradas que separan el razonamiento interno (`<think>`), la planificación (`<plan>`), la emisión de consultas al recuperador (`<wiki_search>`), la recepción de resultados (`<observation>`), la reflexión (`<reflection>`) y la respuesta final (`<answer>`). Durante el entrenamiento, el texto de las observaciones recuperadas se enmascara de la función de pérdida, de modo que el modelo aprende a generar sus propias acciones y reflexiones, pero no a reproducir pasajes recuperados. El entrenamiento se ejecutó en modo no-thinking, y el autor recomienda usar `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Generación de texto conversacional en formato multi-turno mediante la plantilla de chat de Qwen3.
- Razonamiento multi-salto orientado a preguntas que requieren combinar información de varias fuentes.
- Planificación explícita de búsquedas mediante la etiqueta `<plan>`.
- Emisión de consultas a un recuperador externo mediante `<wiki_search>`, con un bucle controlado por el usuario.
- Procesamiento de observaciones recuperadas (`<observation>`) y reflexión sobre ellas (`<reflection>`).
- Composición de respuestas finales fundamentadas en las observaciones (`<answer>`).
- Soporte de muestras de identidad (el modelo responde a preguntas sobre sí mismo, según las 72 muestras añadidas).
- No dispone de tool calling nativo de Qwen; el protocolo de agente es propio y requiere un bucle externo implementado por el usuario.
- Capacidades multilingües: no documentadas para este ajuste.
- No se documentan capacidades de visión, audio ni modo thinking activo.

## Casos de uso

- Respuesta a preguntas multi-salto sobre una base documental propia: el modelo genera consultas `<wiki_search>`, el sistema las ejecuta contra un índice (por ejemplo, Elasticsearch o un retriever vectorial) y devuelve los pasajes como `<observation>`; el bucle continúa hasta que el modelo emite `<answer>`. Es adecuado porque el ajuste está diseñado exactamente para ese patrón.
- Asistente de investigación interna: integrado en un pipeline que conecta con una wiki corporativa, el modelo descompone preguntas complejas en subconsultas y sintetiza la respuesta citando las observaciones recibidas.
- Automatización de soporte técnico con base de conocimiento: el modelo puede formular búsquedas sucesivas en la documentación de producto y construir respuestas paso a paso, siempre que se le proporcione el recuperador y el prompt de sistema del dataset.
- Generación de informes con trazabilidad: al separar plan, búsquedas, observaciones y reflexión, el flujo produce una traza auditable que puede registrarse para revisión humana o depuración.
- Prototipado de agentes de QA en investigación académica: sirve como punto de partida barato (un solo T4 para el ajuste) para experimentar con protocolos de agente basados en etiquetas frente a tool calling nativo.
- Evaluación comparativa de protocolos agénticos: permite medir en un entorno controlado si un protocolo explícito de etiquetas mejora la fundamentación frente a modelos con function calling estándar, usando el mismo recuperador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16,4 GB solo para los pesos (el repositorio ocupa 16,4 GB), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB de VRAM para fp16 con contexto moderado.
- En cuantización de 8 bits: en torno a 9-10 GB de VRAM; en 4 bits: en torno a 5-6 GB, aunque estas cuantizaciones no las publica el autor y habría que generarlas.
- GPU recomendadas: A100 40 GB o H100 para fp16 con contextos largos y concurrencia; RTX 4090 (24 GB) para fp16 en un solo usuario; RTX 3090 (24 GB) también viable en fp16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo, según la model card), text-generation-inference (el modelo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama tras convertir los pesos a los formatos correspondientes, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-Seeker | 8,19 B | No disponible | Agente multi-hop QA con protocolo de etiquetas | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-8B (base) | 8,19 B | Contexto nativo de Qwen3-8B (no confirmado en esta ficha) | Modelo generalista con tool calling nativo y modo thinking | Apache 2.0 | Ampliamente disponible |
| Alternativas de agente QA de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más relevante es con el propio Qwen3-8B: el ajuste sacrifica generalidad y el modo thinking nativo a cambio de un protocolo agéntico específico, y sustituye el tool calling estándar por un bucle de etiquetas gestionado externamente. No se dispone de datos de rendimiento que permitan cuantificar la mejora o el deterioro frente al base.

## Limitaciones y advertencias

- El modelo se entrenó sobre una muestra aleatoria de solo 3.000 ejemplos de un único dataset, lo que limita la cobertura y generalización del comportamiento agéntico aprendido.
- No incorpora ninguna herramienta de búsqueda: requiere un recuperador externo y un bucle implementado por el usuario; sin él, el modelo puede emitir `<wiki_search>` y quedarse sin continuación válida.
- No usa el tool calling nativo de Qwen; integrarlo en frameworks que esperan function calling estándar requiere adaptación.
- Entrenado en modo no-thinking; usar `enable_thinking=True` puede degradar el comportamiento esperado.
- Riesgo de alucinación: aunque el diseño enmascara las observaciones en la pérdida, no hay garantía de que la respuesta final se limite a la información recuperada, y no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no documentados; el dataset de entrenamiento determina el sesgo lingüístico y no se especifica su composición.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos del modelo base y del dataset de ajuste.
- Licencia Apache 2.0, que permite uso comercial, pero al ser un ajuste derivado de Qwen3-8B conviene verificar las condiciones del modelo base y la procedencia del dataset de entrenamiento.
- Modelo experimental con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.
- Sin benchmarks publicados, no es posible comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rumiii/Qwen3-8B-Seeker
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/PersonalAILab/AFM-MHQA-Agent-SFT-Dataset
- Unsloth (librería de ajuste): https://github.com/unslothai/unsloth
