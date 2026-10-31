# MoziLabs/Mozi-2b

## Resumen

Mozi-2b es un modelo de lenguaje ligero desarrollado por MoziLabs como un fine-tune de Qwen3.5-2B (concretamente del checkpoint de unsloth/Qwen3.5-2B). Su objetivo es resolver un problema habitual de los modelos de razonamiento pequeños: el gasto excesivo de tokens en tareas sencillas. Para ello, conserva el modo de pensamiento nativo de Qwen3.5 (etiqueta `<think>`) pero se ha entrenado para razonar de forma más corta y adaptativa, respondiendo rápido a preguntas fáciles y desplegando razonamiento completo solo cuando el problema lo requiere.

El entrenamiento se ha realizado mediante destilación desde DeepSeek-V4.1-Flash, que generó un dataset sintético de prompts con razonamiento y respuesta final, aplicado con LoRA de rango 16 en QLoRA de 4 bits durante 2 épocas, fusionando después el adaptador en el modelo completo. El resultado son unos 1.880 millones de parámetros distribuidos en pesos bf16 (safetensors) y una versión GGUF Q8_0 lista para Ollama, llama.cpp o LM Studio.

Su relevancia actual radica en la tendencia hacia modelos pequeños especializados en razonamiento eficiente, capaces de ejecutarse en hardware de consumo con latencias bajas. Bajo licencia MIT, es apto para uso comercial sin restricciones significativas, y hereda el modo de razonamiento híbrido de la familia Qwen3.5. Al tratarse de un modelo muy reciente, no existen aún benchmarks independientes ni datos de adopción relevantes (138 descargas en el momento de redactar la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Qwen3.5 (qwen3_5_text), text-generation |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max_seq_length 2048; el modelo base Qwen3.5-2B no se documenta aquí) |
| Tipos de cuantizacion | bf16 (pesos completos), GGUF Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

Mozi-2b parte de la arquitectura de Qwen3.5-2B, un transformer decodificador con soporte nativo de modo de razonamiento mediante el formato `<think>`. El fine-tune no modifica la arquitectura: se aplica un adaptador LoRA de rango 16 sobre el modelo base cuantizado a 4 bits (QLoRA), con learning rate 2e-4, longitud máxima de secuencia de 2048 tokens y 2 épocas de entrenamiento. Tras el entrenamiento, el adaptador se fusiona en los pesos completos, de modo que el modelo final se despliega como un modelo denso estándar sin dependencia de PEFT.

El método de entrenamiento es destilación por LoRA: el profesor, DeepSeek-V4.1-Flash (`deepseek-flash`), generó un dataset sintético compuesto por prompts, cada uno acompañado de su cadena de razonamiento y su respuesta final. Las trazas de razonamiento se formatearon en el formato nativo `<think>` de Qwen3.5, lo que permite al modelo conservar la alternancia entre modo de pensamiento activado y desactivado. La innovación diferencial es el enfoque de razonamiento adaptativo: el modelo aprende del profesor a modular la longitud de su razonamiento según la dificultad del problema, reduciendo el coste de inferencia en tareas triviales.

## Capacidades

- Generación de texto conversacional (pipeline text-generation) con plantilla de chat estándar de Qwen3.5.
- Razonamiento adaptativo: respuestas directas a preguntas sencillas y razonamiento extendido en formato `<think>` para problemas complejos, con modo de pensamiento activable mediante `enable_thinking=True`.
- Resolución de problemas de matemáticas y lógica a nivel básico (el propio ejemplo de la model card es una multiplicación), con la advertencia del autor de que puede fallar en matemáticas avanzadas.
- Destilación de razonamiento desde DeepSeek-V4.1-Flash, lo que le confiere trazas de razonamiento más compactas que el modelo base.
- No disponible: visión (la parte multimodal de Qwen3.5-2B no está incluida), audio, tool calling y capacidades de agentes no se documentan en la model card.

## Casos de uso

- Asistentes conversacionales ligeros en local: gracias a sus ~1,88 B de parámetros y al GGUF Q8_0, funciona en portátiles y equipos de escritorio vía Ollama (`ollama run hf.co/MoziLabs/Mozi-2b:Q8_0`), adecuado para chatbots privados sin envío de datos a la nube.
- Razonamiento con presupuesto de tokens ajustado: su razonamiento adaptativo lo hace idóneo para aplicaciones donde el coste por consulta importa (APIs con facturación por token), ya que evita cadenas largas de pensamiento en preguntas triviales.
- Prototipado rápido de agentes de razonamiento: al mantener el formato nativo `<think>` de Qwen3.5, es fácil integrarlo en pipelines que parsean las trazas de razonamiento, sirviendo de base para experimentos con modelos pequeños.
- Automatización de tareas de lógica y cálculo sencillo: validación de fórmulas, verificación de operaciones aritméticas o respuestas a preguntas de razonamiento básico dentro de aplicaciones más grandes.
- Fine-tuning adicional de bajo coste: al ser un modelo de 2B ya destilado con LoRA, es un buen punto de partida para especialistas que quieran reajustarlo en dominios concretos con hardware modesto.
- Demostraciones y educación: su tamaño lo hace ejecutable en Google Colab o GPUs de consumo para enseñar cómo funciona el razonamiento con `<think>` y la destilación de modelos profesores a alumnos.
- Generación de texto en pipelines de Transformers: los pesos bf16 en safetensors permiten integración directa con `AutoModelForCausalLM` y `device_map="auto"` para despliegues en servidores con GPU única.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, GSM8K, HumanEval ni comparativas con el modelo base u otros modelos de 2B.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,8-4 GB solo de pesos (1,88 B × 2 bytes), más overhead de KV cache y activaciones; en la práctica, una GPU con 6-8 GB de VRAM es suficiente.
- Con la versión GGUF Q8_0 (~2 GB de pesos, el repo completo ocupa 5,8 GB incluyendo ambos formatos): cabe cómodamente en CPUs modernas y en GPUs de consumo; se estima 4-6 GB de RAM/VRAM en uso.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090 con holgura sobrada); no requiere A100 ni H100.
- Consumer GPU: sí, es uno de los casos de uso principales; también funciona en CPU pura vía llama.cpp con velocidades razonables para un modelo de 2B.
- Opciones de despliegue: Ollama (comando oficial en la model card), llama.cpp, LM Studio y Hugging Face Transformers. No se menciona soporte de vLLM o TGI, aunque al ser un modelo compatible con transformers y endpoints, en principio debería funcionar.
- Latencia y throughput: no disponible; el autor recomienda un presupuesto generoso de 8k+ tokens de generación para problemas muy difíciles, lo que implica respuestas potencialmente largas en modo de razonamiento extendido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mozi-2b | ~1,88 B | no disponible | Adaptativo con `<think>`, destilado de DeepSeek-V4.1-Flash | MIT | safetensors + GGUF Q8_0 |
| Qwen3.5-2B (base) | ~2 B | no disponible | Modo de razonamiento nativo `<think>` | Apache-2.0 | Hugging Face (Qwen y unsloth) |
| Modelos destilados de razonamiento de tamaño similar (p. ej. variantes 1,5-2B de la familia Qwen destiladas desde modelos grandes) | 1,5-2 B | variable | Cadenas de razonamiento largas, no adaptativas | variable | Hugging Face |

Nota: la comparativa se limita al modelo base del que parte Mozi-2b, ya que no hay datos publicados de benchmarks que permitan comparar rendimiento numérico con alternativas. La diferencia principal frente al modelo base es el estilo de razonamiento más corto y adaptativo aprendido por destilación.

## Limitaciones y advertencias

- En problemas muy difíciles puede seguir razonando durante mucho tiempo antes de responder; el autor recomienda dar un presupuesto generoso de tokens (8k o más) para evitar respuestas truncadas.
- Al ser un modelo de 2B, es esperable que cometa errores en preguntas de conocimiento general y matemáticas difíciles; el propio autor advierte de verificar cualquier salida importante.
- Es un modelo solo de texto: la parte de visión de Qwen3.5-2B no está incluida, por lo que no puede procesar imágenes.
- Riesgo de alucinación: no se han publicado evaluaciones que cuantifiquen la tasa de alucinación tras la destilación; al tratarse de un fine-tune comunitario con dataset sintético, conviene extremar la validación en producción.
- Sesgos conocidos: no disponibles; no se ha documentado ningún análisis de sesgos.
- Idiomas: no disponible; el dataset de destilación no se describe en detalle, por lo que el rendimiento en castellano no está garantizado ni evaluado.
- Licencia: MIT, sin restricciones relevantes para uso comercial; no obstante, el modelo base Qwen3.5-2B es Apache-2.0, también permisivo.
- Advertencia para producción: es un modelo comunitario con muy poca tracción (138 descargas, 1 like), sin benchmarks independientes ni auditorías; se recomienda evaluación interna exhaustiva antes de cualquier despliegue crítico.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/MoziLabs/Mozi-2b
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3.5-2B
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.5-2B
- Paper, repositorio de código y demos: no disponibles en la informacion proporcionada.
