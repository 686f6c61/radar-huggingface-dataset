# devon-ai/devonai-dev0.1-7b

## Resumen

DevonAI Dev0.1 (7B) es un ajuste fino mediante LoRA del modelo Qwen/Qwen2.5-7B-Instruct, desarrollado por el proyecto DevonAI. Su objetivo es internalizar el protocolo propietario de llamada a herramientas de DevonAI, de modo que el modelo emita de forma estable estructuras JSON como `{"tool": "terminal", "args": {"command": "ls -la"}}` o `{"tool": "file", "args": {"action": "read", "path": "src/index.ts"}}`. Está pensado para ejecutarse en equipos de consumo mediante node-llama-cpp o Ollama, lo que lo sitúa en la categoría de modelos locales orientados a agentes.

El modelo parte de la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales según los pesos en safetensors, y hereda la ventana de contexto de la base (no se especifica un valor distinto en la información disponible). El ajuste se realizó con QLoRA de 4 bits sobre `unsloth-bnb-4bit`, con r=16, alpha=16 y dropout de 0,05, durante 3 épocas y 375 pasos con una tasa de aprendizaje de 2e-4 (cosine, warmup 10).

La relevancia del modelo es acotada y específica: no compite en benchmarks generales, sino que ofrece un artefacto pequeño (repo de 4,9 GB, GGUF Q4_K_M de 4,68 GB) y de licencia MIT para quien quiera desplegar un agente local con un protocolo de herramientas fijo. El conjunto de entrenamiento es reducido (2.000 conversaciones sintéticas, 1.749 de entrenamiento y 251 de validación) y el modelo se publicó sin métricas de evaluación, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct), ajuste LoRA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B-Instruct; la plantilla de Ollama usa num_ctx 4096) |
| Tipos de cuantizacion | Q4_K_M (GGUF, 4,68 GB); pesos LoRA en safetensors; base entrenada en 4-bit QLoRA |
| Idiomas soportados | no disponible (la model card está en chino tradicional; no se declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (LoRA), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA sobre Qwen2.5-7B-Instruct, un transformer denso de 7B parámetros. El entrenamiento se llevó a cabo con QLoRA de 4 bits (base `unsloth-bnb-4bit`), con rango 16, alpha 16 y dropout 0,05, durante 3 épocas y 375 pasos, con tasa de aprendizaje 2e-4 y scheduler cosine con 10 pasos de warmup. La plataforma utilizada fue Kaggle Notebooks con dos GPU T4 de 16 GB.

El dataset de entrenamiento consta de 2.000 conversaciones sintéticas (1.749 de entrenamiento y 251 de validación), diseñadas para enseñar al modelo el protocolo de herramientas de DevonAI (herramientas `terminal` y `file`, entre otras). No se documenta el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Emisión estable de llamadas a herramientas en formato JSON propio de DevonAI (por ejemplo, `terminal` y `file` con acciones de lectura).
- Soporte de tool calling / function calling según el protocolo interno del proyecto DevonAI.
- Uso como agente local en flujos de varios pasos, al poder encadenar llamadas a herramientas.
- Ejecución en local mediante node-llama-cpp (CLI de DevonAI) y Ollama.
- Capacidades multilingües: no disponibles de forma explícita; la model card está redactada en chino tradicional.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Agente de terminal local: el modelo puede emitir comandos como `{"tool": "terminal", "args": {"command": "ls -la"}}` para que un orquestador los ejecute en la máquina del usuario, lo que encaja en asistentes de línea de comandos con ejecución controlada.
- Lectura y análisis de ficheros de código: gracias a la herramienta `file` con acción `read`, puede solicitar el contenido de rutas como `src/index.ts` y razonar sobre él dentro de un flujo de depuración o revisión.
- Asistente de desarrollo en local sin conexión: al ejecutarse con Ollama o node-llama-cpp en un GGUF de 4,68 GB, es adecuado para entornos con requisitos de privacidad o sin acceso a la nube.
- Automatización de tareas de mantenimiento de repositorios: combinado con un orquestador que interprete sus llamadas JSON, puede inspeccionar directorios y ficheros para generar informes o aplicar cambios guiados.
- Prototipado de pipelines de agentes: sirve como modelo de referencia para validar el protocolo de herramientas de DevonAI antes de escalar a modelos mayores.
- Chat técnico con contexto conversacional: al derivar de Qwen2.5-7B-Instruct, puede mantener conversaciones multi-turno sobre código y tareas de sistema, siempre que el contexto configurado (por ejemplo, 4096 tokens en la plantilla de Ollama) sea suficiente.
- Experimentación e investigación en ajuste fino: los pesos LoRA se publican en `lora/` y la configuración en `training_config.yaml`, lo que permite continuar el entrenamiento o adaptarlo a otros protocolos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantización Q4_K_M (4,68 GB de pesos más overhead de contexto y KV cache); en FP16 serían necesarios del orden de 15-16 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M; el entrenamiento se realizó con 2× T4 de 16 GB en Kaggle.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070/4070 y superiores) usando la cuantización Q4_K_M.
- Opciones de despliegue: node-llama-cpp (CLI de DevonAI), Ollama mediante Modelfile, y en general cualquier runtime compatible con GGUF (llama.cpp). No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| DevonAI Dev0.1 (7B) | 7,6B | no disponible | MIT | safetensors (LoRA) + GGUF Q4_K_M | Ajuste LoRA específico para el protocolo de herramientas de DevonAI; sin benchmarks publicados |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (según la ficha oficial de Qwen2.5) | Apache 2.0 | safetensors, GGUF (comunidad) | Modelo base; capacidades generales y tool calling estándar; ampliamente evaluado |
| Mistral-7B-Instruct | 7,2B | 32.000 tokens | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamaño similar, sin protocolo de herramientas específico |
| Llama 3.1 8B Instruct | 8,0B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y ecosistema, con licencia con restricciones de uso |

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (2.000 conversaciones sintéticas) y sin evaluación publicada: el riesgo de sobreajuste al protocolo y de degradación de capacidades generales es alto.
- Riesgo de alucinación en las llamadas a herramientas: puede emitir JSON malformado o invocar herramientas con argumentos incorrectos, por lo que el orquestador debe validar y limitar la ejecución (especialmente en la herramienta `terminal`).
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen2.5-7B-Instruct, hereda los sesgos de su base y de los datos sintéticos empleados.
- Idiomas: no se declara una lista de idiomas soportados; la model card está en chino tradicional y el dataset es sintético, por lo que el rendimiento en castellano no está verificado.
- Contexto: la plantilla de Ollama fija `num_ctx 4096`; no se especifica si el ajuste preserva la ventana completa de la base.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0, cuyos términos deben respetarse igualmente.
- Advertencia de seguridad en producción: al ser un agente con acceso a terminal y ficheros, requiere sandboxing, permisos mínimos y revisión humana de las acciones ejecutadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devon-ai/devonai-dev0.1-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- node-llama-cpp: https://github.com/withcatai/node-llama-cpp
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
