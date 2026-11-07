# clemsail/devstral-v3-dapo-lora

## Resumen

`clemsail/devstral-v3-dapo-lora` es un adaptador LoRA publicado en Hugging Face por el usuario clemsail, obtenido mediante fine-tuning con GRPO (Group Relative Policy Optimization) sobre el modelo base `unsloth/Devstral-Small-2507-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del Devstral-Small-2507 de Mistral AI. El adaptador se distribuye como un repositorio PEFT de 1,1 GB en formato safetensors, bajo licencia Apache 2.0, y está pensado para generación de texto conversacional.

El interés del modelo radica en que aplica aprendizaje por refuerzo (GRPO, la técnica introducida en DeepSeekMath) sobre un modelo especializado en tareas de agente y código, lo que en teoría refuerza comportamientos de razonamiento multi-paso. Sin embargo, se trata de un artefacto de investigación con muy baja tracción (6 descargas, 0 likes en el momento de la consulta) y sin documentación técnica sustantiva: la model card es prácticamente la plantilla autogenerada por TRL.

No se dispone de información publicada sobre el dataset de entrenamiento, hiperparámetros, número de pasos, función de recompensa ni resultados de evaluación. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que el adaptador hereda las capacidades del Devstral-Small subyacente pero no hay evidencia pública de que el entrenamiento GRPO las mejore.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Devstral-Small-2507) |
| Parametros totales | No disponible para el adaptador; el modelo base Devstral-Small-2507 tiene 24 000 millones (24B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador; el modelo base Devstral-Small-2507 soporta 128 000 tokens |
| Tipos de cuantizacion | El adaptador se entrena sobre base bnb-4bit; se puede fusionar y recuantizar a GGUF/AWQ/GPTQ (no documentado por el autor) |
| Idiomas soportados | No disponible (heredados del modelo base, no declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.18.1, TRL 0.24.0, Transformers 5.5.0, PyTorch 2.10.0 |
| Metodo de entrenamiento | GRPO (TRL) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre Devstral-Small-2507, un transformer decoder-only de Mistral AI de 24 000 millones de parámetros, especializado en tareas de agente de software (modificación de repositorios, tool calling y razonamiento sobre código). El autor parte de la variante `unsloth/Devstral-Small-2507-unsloth-bnb-4bit`, que aplica cuantización de 4 bits con bitsandbytes para reducir los requisitos de memoria durante el entrenamiento.

El entrenamiento utiliza GRPO, un algoritmo de optimización de política relativa a grupos que elimina la necesidad de un modelo crítico separado estimando la línea base a partir de un grupo de respuestas muestreadas para cada prompt. Según la model card, el pipeline se ejecutó con TRL 0.24.0 y PEFT 0.18.1. No se especifican el número de tokens de entrenamiento, la composición del dataset, la función de recompensa ni la configuración de LoRA (rango, alpha, módulos objetivo). El nombre del repositorio sugiere una tercera iteración de una serie de fine-tunings del mismo autor (existe también `clemsail/devstral-v3-sft-lora`), pero no hay documentación que describa la relación entre ambas versiones.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento sobre código y tareas de ingeniería de software (el modelo base Devstral está optimizado para agentes de codificación).
- Tool calling y function calling, capacidad del Devstral-Small subyacente.
- Ejecución de flujos agénticos multi-paso (edición de ficheros, ejecución de comandos, navegación de repositorios), sujeta a validación empírica propia.
- Capacidades multilingües no declaradas explícitamente; dependen del modelo base.
- El entrenamiento con GRPO está orientado a reforzar el razonamiento, pero no hay evidencia publicada del efecto real.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- **Evaluación de técnicas de RL sobre modelos de código**: el adaptador sirve como punto de partida para reproducir o comparar pipelines GRPO con TRL sobre Devstral-Small, en entornos de investigación.
- **Prototipado de agentes de software**: integrado con un harness agéntico (por ejemplo, OpenHands o similares), puede emplearse para tareas de resolución de issues en repositorios pequeños, siempre con validación manual de los parches generados.
- **Asistente de revisión de código en local**: fusionando el adaptador con el modelo base y sirviéndolo con vLLM o llama.cpp, se puede desplegar un revisor de diffs en infraestructura propia sin dependencia de APIs externas.
- **Generación de tests unitarios**: el modelo puede producir borradores de pruebas a partir de firmas de funciones y docstrings, aprovechando la especialización en código del modelo base.
- **Experimentación con LoRA sobre bases cuantizadas**: el repositorio documenta el stack (unsloth + bnb-4bit + PEFT + TRL) y sirve como referencia práctica para montar pipelines de RL con memoria limitada.
- **Chat técnico de dominio acotado**: fine-tuning adicional sobre el adaptador para preguntas frecuentes de un equipo de desarrollo, dado que el coste de reentrenar un LoRA sobre esta base es bajo.
- **Banco de pruebas de alucinación en código**: útil para medir la tasa de APIs inventadas o imports inexistentes en modelos ajustados con RL, un fenómeno relevante en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra suite, y tampoco se aportan métricas de recompensa durante el entrenamiento GRPO.

## Requisitos de hardware

- **VRAM del adaptador**: el repositorio ocupa 1,1 GB en safetensors; el adaptador en sí requiere poca memoria adicional sobre el modelo base.
- **VRAM del modelo base en bnb-4bit**: aproximadamente 14-16 GB para los pesos, más overhead de activaciones y caché KV; viable en GPUs de 24 GB como la RTX 4090 con contextos moderados.
- **VRAM en FP16/BF16**: en torno a 48 GB para los 24B parámetros; requiere A100 80 GB, H100 o dos GPUs de 24 GB con tensor parallelism.
- **Consumer GPU**: sí, en cuantización 4 bits cabe en RTX 4090 (24 GB) y, con cuantizaciones GGUF Q4, en GPUs de 16 GB con contexto reducido.
- **Opciones de despliegue**: vLLM y TGI para serving de alto throughput tras fusionar el adaptador (`merge_and_unload`); llama.cpp/Ollama con GGUF para local; PEFT + Transformers para prototipado.
- **Latencia y throughput**: no disponibles; dependen del backend, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clemsail/devstral-v3-dapo-lora | Adaptador sobre 24B | No disponible (base: 128k) | RL/GRPO sobre Devstral-Small | Apache 2.0 | Hugging Face, 6 descargas |
| clemsail/devstral-v3-sft-lora | Adaptador sobre 24B | No disponible | SFT sobre Devstral-Small | No disponible | Hugging Face |
| Devstral-Small-2507 (Mistral AI) | 24B | 128k | Agentes de software | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen2.5-Coder-32B | 32B | 128k | Código y agentes | Apache 2.0 | Hugging Face |

El adaptador no aporta métricas que permitan una comparación cuantitativa con alternativas; la comparación anterior es estructural. Devstral-Small-2507 es la referencia directa, y Qwen2.5-Coder-32B es la alternativa abierta más habitual en tareas de agente de código.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, curvas de recompensa ni comparación con el modelo base, por lo que no puede afirmarse que el GRPO haya mejorado nada.
- Dataset y función de recompensa no documentados: imposible auditar qué comportamientos se han reforzado ni detectar reward hacking.
- Riesgo de sobreajuste a la distribución de recompensa del autor, con posible degradación en tareas fuera de ese dominio.
- Riesgo de alucinación en código (APIs, imports y firmas inventadas), inherente a los modelos de la familia y no mitigado de forma documentada.
- Idiomas soportados no declarados; el comportamiento multilingüe depende del modelo base y no ha sido validado tras el ajuste.
- Licencia Apache 2.0 en el adaptador, pero conviene verificar las condiciones del modelo base Devstral-Small-2507 antes de un despliegue comercial.
- Tracción mínima (6 descargas, 0 likes): no hay señal de uso comunitario ni de validación independiente.
- El adaptador requiere cargar el modelo base cuantizado a 4 bits o fusionarlo; un uso descuidado del merge puede introducir pérdida de precisión.
- No apto como componente crítico en producción sin una batería de evaluación propia y un sistema de verificación de código generado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/clemsail/devstral-v3-dapo-lora
- Adaptador SFT del mismo autor: https://huggingface.co/clemsail/devstral-v3-sft-lora
- Modelo base cuantizado: https://huggingface.co/unsloth/Devstral-Small-2507-unsloth-bnb-4bit
- Anuncio de Devstral en Mistral AI: https://mistral.ai/news/devstral/
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
