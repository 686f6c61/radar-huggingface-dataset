# agentic-ptb/sol-max-v2.h013.pi-agent-sft-v10.step_125

## Resumen

`sol-max-v2.h013.pi-agent-sft-v10.step_125` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un ajuste fino (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9.4B). El checkpoint corresponde a la hora 13.97 de una ejecución de 100 horas, dirigida por un agente de código (Codex / gpt-5.6-sol) con esfuerzo de razonamiento máximo. Su propósito es servir como punto de control intermedio para evaluar la evolución del entrenamiento a lo largo del tiempo, no como un modelo final listo para producción.

La relevancia de este checkpoint radica en su naturaleza experimental: forma parte de un pipeline de entrenamiento automatizado (AgentPTB) que genera y evalúa checkpoints en intervalos regulares. Al estar basado en Qwen3.5-9B, hereda la arquitectura de visión-lenguaje de Qwen, aunque el checkpoint se sirve como modelo de solo texto. No se dispone de licencia, idiomas soportados ni benchmarks publicados, por lo que su uso debe considerarse exclusivamente de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision-language, servido como texto) |
| Parametros totales | 9.409.813.744 (9.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer con componentes de visión (Qwen3_5ForConditionalGeneration). El checkpoint incluye el tower de visión, pero el proceso de entrenamiento (AgentPTB) no exporta `preprocessor_config.json`, por lo que para servirlo con vLLM es necesario indicar explícitamente que es solo texto mediante `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.

El entrenamiento es un ajuste fino supervisado (SFT) denominado `pi-agent-sft-v10`, ejecutado dentro de un sweep de 100 horas. El driver del entrenamiento es un agente de código (Codex / gpt-5.6-sol) con esfuerzo de razonamiento máximo. El checkpoint se guarda en el paso 125 de la ejecución, a las 13.97 horas. No se proporcionan detalles sobre el dataset de entrenamiento, número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El token EOS está correctamente configurado como `248046` (`<|im_end|>`), lo que garantiza que el modelo detiene la generación al final de cada turno.

## Capacidades

- Generación de texto: al ser un ajuste fino de Qwen3.5-9B-Base, conserva las capacidades de generación de lenguaje del modelo base, aunque no se han publicado evaluaciones específicas.
- Razonamiento: el entrenamiento con esfuerzo máximo sugiere que se ha optimizado para tareas de razonamiento complejo, pero no hay datos que lo confirmen.
- Código: el driver del entrenamiento es un agente de código, lo que podría indicar una especialización en generación de código, pero no se aportan benchmarks.
- Visión: la arquitectura incluye un tower de visión, pero el checkpoint se sirve como texto únicamente; no se garantiza el funcionamiento de capacidades multimodales.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Multilingüismo: no disponible.

## Casos de uso

- Investigación en entrenamiento de modelos: este checkpoint es útil para estudiar la dinámica de entrenamiento a lo largo del tiempo, comparando métricas entre checkpoints de diferentes horas (h013, h007, etc.) dentro del mismo sweep.
- Evaluación de checkpoints intermedios: permite medir la evolución de la pérdida y el rendimiento en tareas específicas durante el entrenamiento, útil para decidir puntos de parada temprana o ajustes de hiperparámetros.
- Reproducción de experimentos: al estar disponible públicamente, sirve como referencia para reproducir el pipeline AgentPTB o para comparar con otros checkpoints del mismo barrido.
- Pruebas de infraestructura de inferencia: al requerir configuración especial en vLLM (limitar multimodalidad), es un caso de prueba para validar el despliegue de modelos con arquitecturas mixtas.
- Análisis de alucinación y comportamiento: al ser un modelo intermedio, puede usarse para estudiar cómo cambian los patrones de generación durante el entrenamiento.
- Desarrollo de agentes de código: dado que el entrenamiento fue dirigido por un agente de código, podría servir como base para experimentos en generación de código, aunque sin garantías de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares. Se recomienda no utilizar este checkpoint para tareas de producción sin una evaluación previa.

## Requisitos de hardware

- VRAM estimada: para inferencia con precisión FP16, un modelo de 9.4B parámetros requiere aproximadamente 19-20 GB de VRAM (considerando pesos y overhead). Con cuantización INT8, ~10 GB; con INT4, ~5-6 GB. Estas son estimaciones generales, no datos oficiales.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A10G) o superior. Para cuantización, GPUs de 12-16 GB (RTX 4070, A4000) pueden ser suficientes.
- Consumer GPU: sí, es posible ejecutarlo en GPUs de consumo con cuantización (por ejemplo, RTX 4090 con GGUF o AWQ).
- Opciones de despliegue: vLLM (con la configuración especial mencionada), llama.cpp, Ollama (si se convierte a GGUF), TGI. No se han probado oficialmente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max-v2.h013 (este) | 9.4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9.4B | no disponible | no disponible | HuggingFace |
| Qwen2.5-7B-Instruct | 7.6B | 128K | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo. Este checkpoint es un artefacto de entrenamiento, no un modelo final, por lo que no es directamente comparable con modelos instructivos comerciales.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo sweep.
- Sin licencia especificada: no se puede determinar si es de uso libre, por lo que se recomienda contactar al autor antes de cualquier uso comercial.
- Sin idiomas declarados: no se garantiza soporte multilingüe.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar contenido falso o no verificado.
- Configuración de servido especial: requiere `--limit-mm-per-prompt` en vLLM para evitar errores de carga.
- Sin benchmarks: no hay evidencia de capacidades específicas; cualquier afirmación sobre su rendimiento es especulativa.
- Fecha de creación futura (2026): el modelo fue creado en agosto de 2026, lo que sugiere que es parte de un proyecto en curso; puede haber versiones más recientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h013.pi-agent-sft-v10.step_125
- Página de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
- Referencia a GPT-5.6 (mencionado en la model card, no relacionado directamente): https://openai.com/index/gpt-5-6/
