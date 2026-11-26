# dongguanting/ToolSpace-35B-A3B

## Resumen

ToolSpace-35B-A3B es un modelo agente de arquitectura mixture-of-experts (MoE) desarrollado por dongguanting, construido mediante ajuste fino supervisado y aprendizaje por refuerzo sobre el backbone Qwen3.6-35B-A3B. Está especializado en uso de herramientas de horizonte largo (long-horizon tool use), es decir, en resolver tareas que requieren encadenar múltiples llamadas a funciones, mantener estado entre pasos y recuperarse de errores de ejecución. Cuenta con 35.107.181.936 parámetros totales y 3B activos, con una ventana de contexto de 262.144 tokens.

El modelo se entrena con trayectorias sintetizadas por ToolSpace, un pipeline que construye un grafo de composición de herramientas a partir de trazas de ejecución reales, capturando dependencias de datos, estado y reintentos. A partir de ese grafo genera tareas cruzadas entre entornos mediante recorridos con rollback y solo conserva las trayectorias que superan verificación basada en ejecución. Posteriormente se aplica RL agéntico on-policy para refinar el comportamiento.

Es relevante porque aborda uno de los cuellos de botella prácticos de los agentes basados en LLM: la escasez de datos de entrenamiento de alta calidad para uso de herramientas multi-paso. El modelo declara pipeline image-text-to-text, por lo que admite entradas multimodales, y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts), transformer; backbone Qwen3.6-35B-A3B |
| Parametros totales | 35.107.181.936 |
| Parametros activos | 3B |
| Longitud de contexto | 262.144 tokens (64K en el ejemplo de despliegue vLLM) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 Safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | BF16 Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer con capas MoE de 35B parámetros totales y 3B activos por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamaño. Sobre ese backbone se aplica un ajuste fino supervisado (SFT) con trayectorias generadas por ToolSpace y, después, aprendizaje por refuerzo agéntico on-policy.

La innovación principal está en el pipeline de datos: ToolSpace construye un grafo de composición de herramientas a partir de trazas de ejecución reales, modelando dependencias de datos, de estado y de reintento entre llamadas. Genera tareas que cruzan entornos mediante recorridos conscientes del estado con rollback, y filtra las trayectorias con verificación basada en ejecución, de modo que el modelo aprende secuencias de tool calls que realmente funcionan. El checkpoint publicado corresponde a la fase SFT más RL agéntico. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Uso de herramientas y function calling multi-paso, con encadenamiento de llamadas y dependencias de estado.
- Razonamiento agéntico de horizonte largo: planificación, reintentos y recuperación ante fallos de ejecución.
- Generación de texto conversacional y soporte de plantilla de chat con mensajes de tool call.
- Procesamiento image-text-to-text (pipeline declarado), es decir, entrada multimodal de imagen y texto.
- Modo de razonamiento con parser dedicado (`qwen3` reasoning parser) en el despliegue vLLM.
- Integración con vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de flujos de trabajo empresariales: el modelo puede orquestar secuencias de llamadas a APIs internas (CRM, ERP, ticketing) manteniendo estado entre pasos, gracias a su entrenamiento específico en trayectorias con dependencias de estado y reintentos.
- Agentes de atención al cliente con acceso a herramientas: gestión de conversaciones multi-turno con contexto de hasta 262.144 tokens, consultando bases de conocimiento y sistemas de pedidos mediante function calling verificado.
- Ejecución de tareas de oficina y ofimática automatizada: los resultados en OfficeQA Pro (51,9) y AutomationBench (45,8) indican capacidad para resolver tareas sobre documentos y suites de productividad con herramientas.
- Agentes de investigación y análisis documental: combinación de entrada multimodal (imagen-texto) con llamadas a herramientas de búsqueda y extracción, útil para pipelines de extracción de datos de documentos escaneados.
- Asistentes de soporte técnico con diagnóstico paso a paso: el modelo puede inspeccionar logs, ejecutar comandos de diagnóstico y reintentar acciones fallidas, aprovechando su entrenamiento en recuperación ante errores.
- Automatización de tareas financieras y de banca: el resultado en τ³-Bench Banking (42,3) frente al 9,3 del base sugiere utilidad en flujos de banca conversacional con herramientas.
- Integración en pipelines de CI/CD y entornos de desarrollo: soporte de tool calling compatible con vLLM permite conectarlo a servidores de herramientas y ejecutar tareas de código y despliegue de forma iterativa.

## Benchmarks y rendimiento

Resultados de la Tabla 1 del paper de ToolSpace (media no ponderada sobre siete benchmarks):

| Modelo | AutomationBench | SkillsBench | JobBench | τ³-Bench Banking | BFCL V4 | Harvey LAB | OfficeQA Pro | Avg. |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3.6-35B-A3B (base) | 8,2 | 30,7 | 6,4 | 9,3 | 60,0 | 0,8 | 45,9 | 23,0 |
| ToolSpace-35B-A3B (SFT) | 45,8 | 42,4 | 40,0 | 34,0 | 74,3 | 1,7 | 48,9 | 41,0 |
| ToolSpace-35B-A3B + Agent RL (este checkpoint) | 45,8 | 45,3 | 40,0 | 42,3 | 74,8 | 2,5 | 51,9 | 43,2 |

La mejora media respecto al backbone base es de 23,0 a 43,2 puntos (+20,2). El mayor salto se da en AutomationBench (+37,6) y JobBench (+33,6). Harvey LAB sigue siendo muy bajo en términos absolutos (2,5).

## Requisitos de hardware

- VRAM estimada: los pesos en BF16 ocupan aproximadamente 70,2 GB (tamaño del repo), por lo que la inferencia en precisión completa requiere al menos 80 GB de VRAM más margen para KV cache.
- GPU recomendadas: el ejemplo oficial usa tensor parallelism de 4 GPUs (por ejemplo, 4× A100 80 GB o 4× H100 80 GB) para servir con ventana de 64K tokens.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16; requeriría cuantización, de la que no se publican artefactos oficiales.
- Despliegue: vLLM con `--tensor-parallel-size 4`, `--max-model-len 65536`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml` y `--reasoning-parser qwen3`. Compatibilidad con llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Avg. (7 benchmarks) | Licencia |
|---|---|---:|---:|---:|---|
| ToolSpace-35B-A3B + Agent RL | 35,1B | 3B | 262.144 | 43,2 | Apache 2.0 |
| Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | 23,0 | no disponible |
| ToolSpace-8B | 8B | no disponible | no disponible | no disponible | no disponible |
| ToolSpace-744B-A40B | 744B | 40B | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su backbone Qwen3.6-35B-A3B, sobre el que mejora 20,2 puntos de media. Existen variantes del mismo proyecto en 8B y 744B-A40B, aunque no se publican sus resultados en la información disponible.

## Limitaciones y advertencias

- Harvey LAB con 2,5 puntos indica un rendimiento muy bajo en tareas de razonamiento legal complejo; no es adecuado para dominios de alta exigencia sin verificación adicional.
- Riesgo de alucinación en la planificación de tool calls: aunque el entrenamiento filtra trayectorias por ejecución, el modelo puede generar llamadas a herramientas inexistentes o con argumentos inválidos en entornos no vistos.
- Idiomas soportados no declarados; el rendimiento fuera del inglés no está documentado.
- El contexto máximo de 262.144 tokens no implica calidad uniforme en toda la ventana; el ejemplo de despliegue limita a 64K por coste de memoria.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento del backbone.
- No se publican artefactos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- El modelo está especializado en agentes y tool use; su rendimiento en tareas de chat general o generación creativa no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongguanting/ToolSpace-35B-A3B
- Paper: https://huggingface.co/papers/2611.05036
- Código: https://github.com/dongguanting/ToolSpace
- Evaluación: https://github.com/dongguanting/ToolSpace/tree/main/evaluation
- Variante 8B: https://huggingface.co/dongguanting/ToolSpace-8B
- Variante 744B-A40B: https://huggingface.co/dongguanting/ToolSpace-744B-A40B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
