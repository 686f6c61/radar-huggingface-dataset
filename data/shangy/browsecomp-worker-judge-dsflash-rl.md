# Shangy/browsecomp-worker-judge-dsflash-rl

## Resumen

Este modelo es un checkpoint de refuerzo (reinforcement learning) sobre Qwen3-8B, publicado por el usuario Shangy como parte de una campaña de entrenamiento para el benchmark BrowseComp. El objetivo del modelo es actuar como "worker" dentro de un protocolo orquestador/trabajador, resolviendo tareas de búsqueda de información difícil en la web. El entrenamiento utiliza un "judge" basado en DeepSeek V4 Flash para evaluar las respuestas del worker durante el ciclo de RL.

La revisión archivada `iter149` obtuvo 267/450 (0.593) en la evaluación held-out emparejada, frente a 250/450 (0.556) del worker base Qwen3-8B. Sin embargo, el autor indica que la diferencia no es estadísticamente concluyente (p=0.14), por lo que el checkpoint se publica como evidencia experimental más que como una mejora definitiva. El repositorio tiene un tamaño de 16.4 GB, lo que sugiere pesos en precisión fp16/bf16 del modelo base de 8B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen3-8B) |
| Parametros totales | no disponible (base: 8B, no se confirma el total del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (probable, libreria transformers; no confirmado) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen3-8B y se entrena con un pipeline de reinforcement learning en el dominio BrowseComp. El entrenamiento sigue un esquema "worker-judge": el worker (este modelo) genera respuestas a tareas de búsqueda, y un judge (DeepSeek V4 Flash) evalúa la corrección de dichas respuestas, proporcionando la señal de recompensa. No se especifican los detalles del algoritmo de RL (PPO, GRPO, etc.), ni el número de pasos o tokens de entrenamiento.

La revisión archivada es `iter149` de la campaña `bcfull_dsflash_v1`, lo que indica un entrenamiento iterativo con múltiples rondas de RL. La evaluación se realiza con el protocolo BrowseComp orquestador/worker, que requiere un entorno de navegación web para ejecutar el agente.

## Capacidades

- Búsqueda de información específica en la web mediante navegación multi-paso.
- Razonamiento para decidir qué páginas visitar y cómo extraer la respuesta correcta.
- Integración en un protocolo de agente con orquestador externo (el modelo actúa como worker).
- Hereda las capacidades de Qwen3-8B en generación de texto, razonamiento y comprensión multilingüe (aunque no se confirman los idiomas soportados en este checkpoint).
- No se documenta soporte de tool calling, function calling ni multimodalidad específica para este modelo.

## Casos de uso

- **Agente de búsqueda de información difícil**: el modelo puede integrarse en sistemas de agente que necesitan encontrar un dato concreto y difícil de localizar en la web, como estadísticas oscuras, hechos históricos o datos técnicos específicos.
- **Investigación de mercado**: automatizar la extracción de información de nicho en páginas web, comparando fuentes y siguiendo cadenas de enlaces hasta dar con el dato objetivo.
- **Verificación de hechos**: el modelo puede buscar la fuente primaria de una afirmación, navegando por foros, documentos o sitios gubernamentales hasta confirmar o desmentir el dato.
- **Generación de informes técnicos**: combinar la búsqueda de información con la generación de resúmenes estructurados, aprovechando las capacidades de razonamiento de Qwen3.
- **Evaluación de agentes de búsqueda**: como worker en un pipeline de evaluación, sirve para comparar el rendimiento de diferentes estrategias de navegación en el benchmark BrowseComp.
- **Experimentos de RL en entornos web**: el checkpoint puede reutilizarse como base para investigar métodos de refuerzo en tareas de agente, dado que su entrenamiento ya incorpora una señal de recompensa basada en un judge.

## Benchmarks y rendimiento

El único dato de rendimiento disponible es el de la evaluación BrowseComp held-out:

| Modelo | Puntuacion (sobre 450) | Tasa de exito |
|---|---|---|
| Worker base (Qwen3-8B) | 250 | 0.556 |
| Este checkpoint (`iter149`) | 267 | 0.593 |

La diferencia de 17 puntos no fue estadísticamente significativa (p=0.14). No hay datos de benchmarks generales (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- **VRAM estimada**: el repo pesa 16.4 GB, lo que sugiere pesos en fp16/bf16. La inferencia en fp16 requiere al menos 16 GB de VRAM, por lo que cabe en una RTX 4090 (24 GB) o en una A100 de 40 GB.
- **GPU recomendadas**: RTX 4090, RTX 3090 (24 GB), A100, H100. Con cuantización (por ejemplo, 4-bit), podría ejecutarse en GPUs de 12 GB como la RTX 3060.
- **Opciones de despliegue**: al ser un modelo transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se cuantiza.
- **Latencia y throughput**: no se dispone de datos medidos. Como referencia, Qwen3-8B en fp16 con vLLM suele alcanzar decenas de tokens por segundo en una GPU moderna, pero el uso como agente de navegación implica llamadas a un orquestador y a la web, por lo que la latencia dominante será la de red.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Rendimiento BrowseComp | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (worker-judge RL) | 8B | no disponible | 0.593 (held-out) | Apache-2.0 | transformers |
| browsecomp-worker-sft-core-v256 | 8B | no disponible | 0.620 (BrowseComp-Plus) | Apache-2.0 | transformers |
| browsecomp-worker-sft-mix-v256 | 8B | no disponible | 0.720 (BrowseComp-Plus) | Apache-2.0 | transformers |
| Qwen3-8B base | 8B | no disponible | 0.556 (held-out) | Apache-2.0 | transformers |

Los modelos hermanos de la familia SFT muestran mejor rendimiento en la prueba BrowseComp-Plus, mientras que este checkpoint RL no supera significativamente al base. No hay datos de otros modelos comparables fuera de la familia.

## Limitaciones y advertencias

- **Resultado no concluyente**: la mejora frente al base no es estadísticamente significativa (p=0.14), por lo que no se recomienda usar este checkpoint como referencia de rendimiento.
- **Dependencia del protocolo**: la evaluación requiere el protocolo orquestador/worker de BrowseComp; fuera de ese entorno, el comportamiento puede degradarse.
- **Riesgo de alucinación**: al ser un modelo de búsqueda, puede generar respuestas plausibles pero incorrectas si no encuentra el dato exacto, especialmente en dominios de nicho.
- **Sesgos**: hereda los sesgos del conjunto de entrenamiento de Qwen3-8B y de las trayectorias de BrowseComp, que pueden incluir desviaciones hacia fuentes web en inglés.
- **Idiomas**: no se especifican idiomas soportados; probablemente el rendimiento en español será inferior al de inglés, dado el origen del dataset.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero no hay garantías sobre la calidad del modelo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shangy/browsecomp-worker-judge-dsflash-rl
- Modelo hermano SFT: https://huggingface.co/Shangy/browsecomp-worker-sft-core-v256
- Benchmark BrowseComp (OpenAI): https://openai.com/index/browsecomp/
- Leaderboard de LLMs (contexto general): https://llm-stats.com/leaderboards/llm-leaderboard
