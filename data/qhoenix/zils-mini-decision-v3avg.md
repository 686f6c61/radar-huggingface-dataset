# qhoenix/zils-mini-decision-v3avg

## Resumen

zils-mini-decision-v3avg es un modelo de extracción de características (feature-extraction) especializado en decisiones, desarrollado por el usuario qhoenix dentro del ecosistema Zils (variante d3-mini). Se construye sobre el modelo base Qwen/Qwen3.5-4B mediante una técnica de "model soup" combinada con ajuste fino LoRA, y está diseñado para producir representaciones orientadas a tareas de decisión tipadas y function calling, no para generación de texto libre.

El modelo parte de un promedio uniforme de pesos de dos "cuerpos" con licencia Apache-2.0 (vllm-sr/d3-mini y torchcast-ai/torchcast-decision-4b) y aplica tres ajustes finos LoRA independientes sobre los pesos de lenguaje, entrenados con aproximadamente 173.000 ítems de decisión en el formato de examen de Zils. El cuerpo final es el promedio uniforme de los tres ajustes fusionados, en precisión BF16.

Con 4.539.265.536 parámetros (4,5B) y un repositorio de 9,1 GB, el modelo se posiciona como una alternativa compacta para pipelines de decisión estructurada. Su relevancia actual radica en el enfoque de destilación de decisiones (gold labels verificados con doble pasada ciega) y en la inclusión de datos de function calling de fuentes Apache-2.0 y CC-BY-4.0, lo que facilita su uso comercial bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, tag `qwen3_5`); requiere `custom_code` |
| Parametros totales | 4.539.265.536 (4,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (los datos de entrenamiento incluyen fuentes en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-4B (tag `qwen3_5`, con código personalizado `custom_code`), un transformer denso de 4,5B parámetros. El proceso de construcción sigue tres fases: primero, un promedio uniforme de pesos de dos cuerpos Apache-2.0 (vllm-sr/d3-mini y torchcast-ai/torchcast-decision-4b); segundo, tres ajustes finos LoRA (r=64, learning rate 5e-5, una época, semillas distintas) sobre los pesos de lenguaje; y tercero, un promedio uniforme de los tres ajustes fusionados para producir el cuerpo final en BF16.

Los datos de entrenamiento suman aproximadamente 173.000 ítems de decisión en el formato de examen Zils: splits TRAIN públicos con etiquetas gold, ítems generados por Claude, GPT-5.4 y DeepSeek (conservados solo si una segunda pasada ciega daba la misma respuesta), unas 55.000 decisiones tipadas de 306 fuentes inglesas de tasksource/tasksource-jev-typed-decisions (solo filas con `license_use: commercial`, máximo 200 por fuente), 10.000 decisiones de function calling derivadas de glaiveai/glaive-function-calling-v2 (Apache-2.0) y 10.000 derivadas de Salesforce/xlam-function-calling-60k (CC-BY-4.0). Los objetivos ordinales (score) son distance-aware en lugar de suavizado uniforme. No se usaron semillas de examen, validación ni test en el entrenamiento.

## Capacidades

- Extracción de características orientada a decisiones: el pipeline declarado es `feature-extraction`, no generación de texto.
- Clasificación de decisiones tipadas (typed decisions) en el formato de examen Zils.
- Decisiones de function calling / tool calling, entrenadas sobre glaive-function-calling-v2 y xlam-function-calling-60k.
- Puntuación ordinal distance-aware para respuestas con score.
- Modelo base multilingüe heredado de Qwen3.5-4B, aunque no se documentan idiomas soportados.
- No se documentan capacidades de visión, audio, thinking mode ni agentes multi-paso.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: usar las representaciones del modelo para clasificar qué herramienta o acción corresponde a una consulta, aprovechando su entrenamiento específico en decisiones de function calling.
- Evaluación automática de respuestas: puntuar respuestas con objetivos ordinales distance-aware para sistemas de grading o ranking en entornos de examen o QA.
- Filtrado de candidatos en sistemas RAG: emplear el modelo como extractor de características para decidir si un documento es relevante antes de la generación.
- Clasificación de intenciones en atención al cliente: decidir la categoría de una consulta entrante a partir de representaciones entrenadas con decisiones tipadas de fuentes comerciales.
- Moderación y triaje de contenido: usar las decisiones tipadas para asignar etiquetas de política a textos, con la ventaja de que los datos de entrenamiento están restringidos a uso comercial.
- Integración en pipelines de CI/CD para validación de decisiones: comprobar que las salidas de un agente cumplen el formato de decisión esperado antes de desplegar.
- Investigación en destilación de decisiones: servir como referencia reproducible de un "model soup" con LoRA múltiple sobre un base Qwen, útil para estudiar técnicas de promediado de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y del código personalizado; en la práctica, 12-16 GB para inferencia cómoda.
- En cuantización de 8 bits: en torno a 5 GB de pesos (estimación, no confirmada por el autor).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090 o 4080 para cuantización.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con BF16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`); vLLM y TGI solo si soportan la arquitectura `qwen3_5` con código personalizado; llama.cpp/Ollama no disponibles sin conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-decision-v3avg | 4,5B | no disponible | feature-extraction / decisiones | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | generación general | no disponible | Hugging Face |
| vllm-sr/d3-mini | no disponible | no disponible | decisiones | Apache-2.0 | Hugging Face |
| torchcast-ai/torchcast-decision-4b | ~4B | no disponible | decisiones | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El pipeline es `feature-extraction`: no está pensado como modelo de chat o generación de texto libre; usarlo así puede dar resultados pobres.
- Requiere `trust_remote_code=True` por el tag `custom_code`; conviene auditar el código remoto antes de ejecutarlo en producción.
- No se documentan idiomas soportados; el entrenamiento se apoya en fuentes en inglés, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación y de sesgo derivado de los datos sintéticos generados por Claude, GPT-5.4 y DeepSeek, aunque se aplicó una verificación de doble pasada ciega.
- Los datos de tasksource solo incluyen filas marcadas como uso comercial, pero la model card no detalla la verificación completa de todas las fuentes.
- Incluye material CC-BY-4.0 (Salesforce/xlam-function-calling-60k), por lo que debe mantenerse la atribución a Salesforce AI Research.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria ni evidencia de uso en producción.
- No se han publicado benchmarks, por lo que el rendimiento real frente a alternativas no está verificado.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-mini-decision-v3avg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo de partida: https://huggingface.co/vllm-sr/d3-mini
- Cuerpo de partida: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Dataset: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
