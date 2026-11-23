# nachiketj14/Girlfriend

## Resumen

Girlfriend es un ajuste fino mediante LoRA del modelo `unsloth/Ministral-3-3B-Instruct-2512`, que a su vez es un reempaquetado de Ministral-3 3B Instruct de Mistral AI. Lo desarrolla el usuario de Hugging Face nachiketj14 y su objetivo es construir un modelo de conversación tipo "compañero" (companion) orientado a roleplay y chat personal, pensado para ejecutarse en local. El entrenamiento se realizó de extremo a extremo en una única GPU T4 de Kaggle (16 GB) usando Unsloth.

El modelo parte de una arquitectura transformer densa de aproximadamente 3.429 millones de parámetros y se distribuye en tres formatos: un adaptador LoRA compatible con PEFT, un GGUF fusionado en FP16 y un GGUF cuantizado a Q4_K_M para inferencia ligera en dispositivos de consumo. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Su relevancia es acotada: no compite como modelo de propósito general, sino que ilustra el flujo completo de personalización de un modelo pequeño con recursos mínimos (una T4, 60 pasos de entrenamiento, LoRA de rango 32). Es útil como referencia técnica de fine-tuning con Unsloth y como ejemplo de despliegue en formatos GGUF, más que como modelo para tareas de producción generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Ministral-3 3B Instruct); ajuste fino LoRA sobre el modelo base |
| Parametros totales | 3.429.006.336 (3,43 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como dato oficial del ajuste; el entrenamiento usó una longitud máxima de secuencia de 4096 tokens |
| Tipos de cuantizacion | FP16 (GGUF fusionado) y Q4_K_M (GGUF cuantizado); adaptador LoRA en precisión de entrenamiento (FP16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA (PEFT), GGUF FP16, GGUF Q4_K_M; pesos safetensors en el repo (3,43 B parámetros) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Ministral-3 de Mistral AI, en su variante de 3B parámetros y release 2512, reempaquetado por Unsloth. Sobre él se aplicó un ajuste fino LoRA con rango 32, alpha 64 y dropout 0,05, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, sin sesgo. Para las exportaciones FP16 y GGUF, el adaptador se fusionó en los pesos base.

El entrenamiento se ejecutó en una sola GPU T4 de Kaggle con precisión FP16, optimizador `adamw_8bit`, learning rate 2e-5 con scheduler coseno y 3% de warmup, weight decay 0,01, max grad norm 0,3, batch por dispositivo 16 con acumulación de gradientes 2 (batch global efectivo 32), 60 pasos máximos, longitud máxima de secuencia 4096 y semilla 3407. Se empleó enmascaramiento de etiquetas solo en las respuestas (completions-only masking), implementado mediante diferenciación de prefijos tokenizados para aislar los tokens del asistente. Los datos de entrenamiento son un conjunto propio de pares `{"question": ..., "answer": ...}` formateados como ejemplos de chat de dos turnos `[user, assistant]`; no se especifica el número de tokens ni la composición detallada del dataset. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto conversacional de un solo turno, con estilo de persona y roleplay derivado directamente de los ejemplos de entrenamiento.
- Chat multi-turno básico en formato `[user, assistant]`, aunque el entrenamiento se describe como Q&A de un solo turno.
- Personalización de tono mediante system prompt opcional en inferencia (por ejemplo, "You are a loving and caring girlfriend.").
- Inferencia en local en formatos GGUF mediante llama.cpp, LM Studio, Ollama y KoboldCPP.
- Aplicación del adaptador LoRA sobre el modelo base con Unsloth/PEFT.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés declarado; no hay evidencia de rendimiento en otros idiomas.

## Casos de uso

- Chat de compañía en local: el modelo está entrenado específicamente para conversación de persona y puede ejecutarse con el GGUF Q4_K_M en un portátil o equipo de sobremesa sin GPU dedicada, usando llama.cpp u Ollama.
- Roleplay y escritura creativa conversacional: la persona emerge de los datos de entrenamiento, por lo que encaja en sesiones de rol ligeras donde no se requiere precisión factual.
- Prototipado de asistentes personalizados: sirve como plantilla para experimentar con LoRA de rango 32 sobre un modelo de 3B y validar el pipeline completo de Unsloth a GGUF en una sola GPU de 16 GB.
- Aplicaciones móviles o embebidas: el cuantizado Q4_K_M reduce el peso del modelo para despliegue en dispositivos con recursos limitados mediante KoboldCPP o LM Studio.
- Demostraciones de fine-tuning con presupuesto mínimo: 60 pasos y una T4 permiten reproducir el flujo de entrenamiento como caso de estudio docente o de validación de infraestructura.
- Integración en interfaces de chat de escritorio: al importar el GGUF directamente en LM Studio u Ollama, se puede usar como backend conversacional en herramientas locales de mensajería o asistentes de escritorio.
- No es adecuado para atención al cliente, generación de código en producción, matemáticas, QA factual ni razonamiento de contexto largo, según advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas; únicamente advierte que el modelo rinde por debajo del base en tareas fuera de su distribución de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M de un modelo de 3,43 B parámetros ocupa aproximadamente 2-2,5 GB en memoria; el GGUF FP16 ronda los 6,5-7 GB. El adaptador LoRA requiere cargar además el modelo base completo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100). Para Q4_K_M basta con 4 GB de VRAM o incluso CPU.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas con 8 GB o más para FP16, y en equipos sin GPU dedicada usando Q4_K_M en CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), LM Studio, Ollama, KoboldCPP y Unsloth/PEFT para el adaptador LoRA. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor no publica mediciones; el entrenamiento se realizó en una T4 con FP16, lo que da una referencia del orden de magnitud del hardware utilizado, pero no del rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Girlfriend (este modelo) | 3,43 B | No disponible (entrenado a 4096) | Roleplay/companion, LoRA sobre Ministral-3 3B | Apache 2.0 | Hugging Face, GGUF y LoRA |
| unsloth/Ministral-3-3B-Instruct-2512 (base) | 3,43 B | No disponible en la informacion proporcionada | Instrucción general | Apache 2.0 (heredada) | Hugging Face |
| Ministral-3 3B Instruct (Mistral AI) | 3 B aprox. | No disponible en la informacion proporcionada | Instrucción general | No disponible en la informacion proporcionada | Mistral AI / Hugging Face |

La comparación con alternativas de roleplay de tamaño similar no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la especialización en persona conversacional a costa de capacidades generales (código, matemáticas, QA factual), tal como reconoce el autor.

## Limitaciones y advertencias

- Entrenado sobre un dataset personal y pequeño; no es un modelo de instrucción de propósito general y rinde por debajo del base en código, matemáticas, QA factual y razonamiento de contexto largo.
- No evaluado para precisión factual, seguridad ni sesgos; no debe usarse para información factual ni consejos.
- Riesgo de repetición, alucinación e inconsistencia en la adherencia a la persona fuera del estilo de los datos de entrenamiento.
- Idioma limitado al inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- El contexto efectivo no está documentado oficialmente; el entrenamiento usó 4096 tokens como longitud máxima de secuencia, lo que no garantiza buen rendimiento en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el repack de Unsloth deben verificarse por separado; el autor no ofrece garantías.
- Solo 425 descargas y 1 like en el momento de la consulta, con una única revisión pública limitada; no hay validación comunitaria extensa.
- El modelo se entrenó sin system prompt integrado; la persona depende enteramente de los ejemplos, por lo que el comportamiento puede variar con prompts de sistema añadidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nachiketj14/Girlfriend
- Modelo base (repack de Unsloth): https://huggingface.co/unsloth/Ministral-3-3B-Instruct-2512
- Mistral AI: https://mistral.ai/
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- llama.cpp (repositorio): https://github.com/ggerganov/llama.cpp
- Imagen de portada de la model card: https://ai-gf-s3.s3.us-east-1.amazonaws.com/misc/card_image.webp
