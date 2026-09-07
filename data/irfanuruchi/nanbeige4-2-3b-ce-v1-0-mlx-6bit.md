# Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-MLX-6bit

## Resumen

Nanbeige4.2-3B-CE v1.0 es un ajuste fino del modelo Nanbeige4.2-3B, desarrollado por Irfanuruchi y especializado en ingeniería de computadores y sistemas. Esta versión MLX 6-bit es una conversión de despliegue del checkpoint BF16 canónico, optimizada para Apple Silicon mediante MLX-LM. El modelo base, Nanbeige4.2-3B, es un modelo agéntico compacto de 3B parámetros no-embedding, preentrenado desde cero en 28 billones de tokens con una arquitectura de Transformer en bucle (Looped Transformer) que reutiliza la pila de capas. Ofrece una ventana de contexto de 262.144 tokens y está pensado para tareas de agente, generación de código, razonamiento matemático y uso complejo de herramientas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (model_type=nanbeige, num_loops=2) |
| Parametros totales | 4.169.800.704 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MLX 6-bit affine (group size 64, 6.500 bits por peso) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Looped Transformer con model_type=nanbeige, que reutiliza la pila de capas mediante dos bucles (num_loops=2) y sin normalización final del bucle (skip_loop_final_norm=false). Según el paper original, Nanbeige4.2-3B se preentrenó desde cero en 28 billones de tokens y está diseñado para tareas de agente, manteniendo un rendimiento competitivo en matemáticas, código y ciencia. El checkpoint CE v1.0 es un ajuste fino posterior centrado en ingeniería de computadores y sistemas. La información disponible no detalla si se emplearon técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en tareas de sistemas e ingeniería.
- Capacidades agénticas: code-agent, office-agent y uso complejo de herramientas (tool calling) según el paper original.
- Razonamiento en matemáticas, código y ciencia.
- Ventana de contexto larga de 262.144 tokens para manejar documentación técnica extensa o conversaciones multi-turno.
- Soporte de generación determinista con temperatura 0 y modo de pensamiento desactivable (enable_thinking).
- Validado en Apple Silicon con MLX-LM; no se reportan capacidades multimodales (visión o audio).

## Casos de uso

- Asistente de ingeniería de sistemas: puede responder preguntas sobre Docker, redes, configuración de servidores y diagnóstico de fallos, gracias a su especialización en sistemas y su contexto largo.
- Agente de código en CI/CD: integrable en pipelines mediante tool calling para automatizar tareas de build, test o despliegue, con razonamiento multi-paso.
- Automatización de oficina (office-agent): según el paper, el modelo base está diseñado para tareas de agente de oficina, como gestión de documentos o correos.
- Soporte técnico automatizado: puede gestionar conversaciones multi-turno con contexto largo, útil para chatbots de soporte con documentación técnica extensa.
- Generación de documentación técnica: capaz de producir explicaciones de sistemas, guías de configuración o comentarios de código.
- Análisis de logs y diagnóstico: el modelo puede razonar sobre salidas de comandos o logs para identificar problemas, dado su enfoque en sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original reporta rendimiento en tareas de agente, pero no se incluyen cifras concretas en la documentación proporcionada.

## Requisitos de hardware

- Validado en Apple Silicon arm64 con MLX-LM y MLX 0.32.2.
- Memoria pico observada durante la generación: aproximadamente 3.6 GB.
- Throughput observado en la máquina de validación: aproximadamente 23.8 tokens/s.
- El tamaño del modelo cuantizado es de aproximadamente 3.2 GB, lo que sugiere que podría ejecutarse en GPUs con memoria suficiente, pero no se han publicado datos de validación en GPU.
- Opciones de despliegue: MLX-LM en Apple Silicon. También existe una versión GGUF del mismo autor, lo que sugiere compatibilidad con llama.cpp, Ollama u otros motores GGUF, aunque no se ha validado en el stack MLX.
- No se proporcionan recomendaciones de GPU específicas (A100, H100, etc.) ni datos de latencia/throughput en GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con modelos similares. Se puede comparar con el modelo base Nanbeige4.2-3B, del cual es un ajuste fino, y con la versión GGUF del mismo checkpoint, pero no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es una conversión de despliegue, no un nuevo checkpoint de entrenamiento; la cuantización no introduce un nuevo control de calidad factual.
- El checkpoint fuente v1.0 tiene debilidades conocidas de precisión y factualidad en preguntas difíciles de sistemas.
- Solo soporta inglés.
- Transformers puede emitir una advertencia al cargar la configuración nanbeige porque no está registrada como tipo de modelo estándar; en MLX-LM esto es solo una advertencia de tokenizer/config.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo.
- El rendimiento observado (23.8 tokens/s, 3.6 GB) es una observación de validación en un único sistema Apple Silicon, no una garantía general.

## Enlaces

- Modelo MLX 6-bit: https://huggingface.co/Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-MLX-6bit
- Modelo base BF16 (canónico): https://huggingface.co/Irfanuruchi/Nanbeige4.2-3B-CE-v1.0
- Modelo base original: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper: https://arxiv.org/abs/2607.22083
- Versión GGUF: https://huggingface.co/Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-GGUF
- Repo de Ollama de Nanbeige: https://github.com/Nanbeige/ollama
