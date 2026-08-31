# mok0102/SMILE-Next-Qwen2.5-7B-MoLE

## Resumen

SMILE-Next-Qwen2.5-7B-MoLE es un adaptador PEFT (LoRA) desarrollado por el equipo de JungMok Lee y colaboradores, presentado como parte del trabajo "SMILE-Next: Teaching Large Language Models to Detect, Classify, and Reason about Laughter" (ACL 2026 Oral). El adaptador se monta sobre el modelo base Qwen/Qwen2.5-7B-Instruct y emplea una arquitectura de Mezcla de Expertos de la Risa (Mixture-of-Laugh-Experts, MoLE) para abordar tres tareas específicas: detección de risa, clasificación de risa y razonamiento sobre la risa. Su relevancia radica en que introduce una capacidad especializada en un LLM generalista, permitiendo comprender un fenómeno social complejo que va más allá del mero entretenimiento.

El adaptador tiene un tamaño de repositorio de 0,1 GB y se distribuye bajo licencia Apache-2.0. No se proporcionan datos sobre el número de parámetros, la longitud de contexto ni los idiomas soportados, aunque al estar basado en Qwen2.5-7B-Instruct hereda las capacidades generales de dicho modelo. Es importante destacar que el adaptador no debe fusionarse con el modelo base, ya que el enrutamiento de expertos es necesario en tiempo de inferencia, y requiere una versión específica del fork de PEFT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA con mezcla de expertos (MoLE) sobre Qwen2.5-7B-Instruct |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el adaptador implementa gating de expertos, pero no se especifica el número) |
| Longitud de contexto | no disponible (hereda del modelo base, no se indica) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors, sin cuantizaciones adicionales) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un modelo transformer de 7 mil millones de parámetros con atención causal. La innovación principal es el método MoLE (Mixture-of-Laugh-Experts), que introduce un conjunto de expertos especializados en diferentes aspectos de la risa, controlados por un mecanismo de gating. Este gating es esencial en inferencia, por lo que el adaptador no puede fusionarse con el modelo base. El entrenamiento se realizó con un corpus multimodal (audio, visual y textual) denominado SMILE-Next, aunque no se detallan el número de tokens, la composición exacta del dataset ni si se emplearon técnicas como RLHF o DPO. El adaptador se distribuye como un modelo PEFT con la librería `peft`, y requiere un fork específico disponible en el repositorio de GitHub del autor.

## Capacidades

- Detección de risa: identifica la presencia de risa en segmentos de texto o transcripciones.
- Clasificación de risa: categoriza el tipo de risa (por ejemplo, risa genuina, sarcástica, nerviosa, etc.) según el contexto.
- Razonamiento sobre la risa: genera explicaciones o inferencias sobre el significado comunicativo de la risa en una interacción.
- Generación de texto: al estar basado en Qwen2.5-7B-Instruct, conserva las capacidades generales de generación de lenguaje, aunque el adaptador está optimizado para las tareas de risa.
- Integración con el modelo base: requiere cargar el adaptador sin fusionar, usando el fork de PEFT específico.

## Casos de uso

- Análisis de interacciones sociales: el modelo puede procesar transcripciones de conversaciones para detectar y clasificar risas, ayudando a investigadores en psicología o sociología a estudiar patrones de humor y afiliación social.
- Subtitulación automática de contenido audiovisual: integrado en un pipeline de transcripción, puede añadir anotaciones de risa (por ejemplo, "[risa]") y clasificar su tipo, mejorando la accesibilidad de vídeos y podcasts.
- Asistentes conversacionales con empatía: un chatbot que utilice este adaptador puede reconocer cuándo el usuario se ríe y adaptar su respuesta, generando un tono más natural y empático.
- Análisis de sentimiento en redes sociales: al clasificar la risa en comentarios o publicaciones, se puede inferir el tono humorístico o sarcástico, mejorando los sistemas de análisis de opinión.
- Generación de diálogos con humor: el modelo puede razonar sobre el contexto de la risa y generar respuestas que mantengan un tono cómico apropiado, útil en guiones o entretenimiento interactivo.
- Investigación en lingüística computacional: sirve como herramienta para estudiar la relación entre la risa y el lenguaje, permitiendo experimentos controlados sobre cómo los LLM interpretan señales sociales no verbales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos en las tareas de risa.

## Requisitos de hardware

- El adaptador en sí es ligero (0,1 GB), pero requiere cargar el modelo base Qwen2.5-7B-Instruct, que en FP16 necesita aproximadamente 14-16 GB de VRAM.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100. En GPUs con menos memoria se podría usar cuantización del modelo base, aunque no se especifica compatibilidad.
- El despliegue se realiza mediante la librería `transformers` junto con el fork de PEFT. No se mencionan opciones como vLLM, llama.cpp u Ollama.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables específicamente orientados a la comprensión de la risa en LLMs, ni adaptadores equivalentes con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en tareas de risa; su uso fuera de este dominio puede degradar el rendimiento general del modelo base.
- Requiere un fork específico de PEFT (`smilenext-version`), lo que puede complicar la integración en entornos de producción estándar.
- No se puede fusionar el adaptador con el modelo base, lo que obliga a mantener la infraestructura de gating en tiempo de inferencia.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este adaptador. Al ser un modelo entrenado sobre un corpus multimodal, podría presentar sesgos culturales en la interpretación de la risa.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache-2.0 también), por lo que no hay restricciones adicionales conocidas.
- No se dispone de información sobre la longitud de contexto efectiva tras aplicar el adaptador, ni sobre el comportamiento con entradas largas.

## Enlaces

- HuggingFace: https://huggingface.co/mok0102/SMILE-Next-Qwen2.5-7B-MoLE
- Página del proyecto: https://mok0102.github.io/smile-next/
- Repositorio GitHub: https://github.com/mok0102/smile-next
- Blog del autor: https://mok0102.github.io/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
