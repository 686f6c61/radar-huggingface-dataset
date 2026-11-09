# moritzzzz/Prompt2Robo-Qwen3-8B-posv2-grpo-8b-MLX-4bit

## Resumen

Prompt2Robo-Qwen3-8B-posv2-grpo-8b-MLX-4bit es un ajuste fino del modelo Qwen3-8B de Alibaba orientado a la generación de código de control robótico. Lo publica el usuario moritzzzz sobre el conjunto de datos Prompt2Robo y está pensado para escribir programas `run(robot)` ejecutables sobre un brazo simulado LARA 5 en MuJoCo. La versión aquí descrita está cuantizada a 4 bits en formato MLX, por lo que su destino natural es la inferencia en Apple Silicon.

El modelo parte de un full fine-tune sobre el split `data_posv2` del dataset y después se somete a un entrenamiento con GRPO (Group Relative Policy Optimization) en el que la recompensa la proporciona el propio simulador MuJoCo junto con el checker del dataset. El checkpoint publicado corresponde al paso 100 de ese entrenamiento GRPO. Es, por tanto, un modelo especializado en una tarea muy concreta: traducir instrucciones en lenguaje natural sobre una escena robótica a código de control, a una negativa breve o a una respuesta de una frase sobre la escena.

Su relevancia es acotada pero clara para quien investiga en robótica con aprendizaje por refuerzo: demuestra un pipeline de RL con recompensa basada en simulador aplicado a un modelo de 8B parámetros, y ofrece una implementación práctica en MLX para macOS. No es un modelo de propósito general, sino una pieza de un sistema mayor (la app Prompt2Robo para Mac) y su uso previsto requiere el system prompt del dataset y la plantilla de chat de Qwen3 en modo no-thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B), ajustado y cuantizado a 4 bits en MLX |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B, pero sin confirmar) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3-8B, con 8.190.735.360 parámetros totales según los safetensors del repositorio. Sobre esa base se aplicó primero un full fine-tune (sin LoRA) con el split `data_posv2` del dataset Prompt2Robo, seguido de un entrenamiento con GRPO (variante `grpo_full`) cuyo checkpoint final es el paso 100. La función de recompensa no es un modelo de preferencias aprendido, sino el simulador MuJoCo ejecutando el programa generado junto con el checker del dataset: el modelo recibe señal directa de si el código produce el comportamiento esperado en el brazo LARA 5 simulado.

El resultado es un modelo que genera tres tipos de salida: un programa `run(robot)` para el brazo, una negativa corta cuando la petición no es viable, o una respuesta de una frase a preguntas sobre la escena. El autor indica que debe usarse el system prompt de la carpeta del dataset y la plantilla de chat de Qwen3 sin modo thinking. La versión publicada está cuantizada a 4 bits en MLX para Apple Silicon y es la que lista la aplicación Prompt2Robo para Mac. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni hiperparámetros del GRPO.

## Capacidades

- Generación de código de control robótico: escribe programas `run(robot)` para un brazo LARA 5 simulado en MuJoCo.
- Traducción de instrucciones en lenguaje natural sobre una escena a código ejecutable.
- Respuesta a preguntas de una frase sobre la escena descrita.
- Negativa controlada: produce una negativa breve cuando la petición no es abordable, comportamiento entrenado explícitamente.
- Razonamiento guiado por recompensa de simulador gracias al entrenamiento GRPO.
- Ejecución en Apple Silicon mediante MLX en cuantización 4-bit.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Generación de scripts de control para el brazo LARA 5 en simulación: dado un enunciado sobre la escena, el modelo emite un programa `run(robot)` que se ejecuta en MuJoCo, lo que permite prototipar tareas de manipulación sin escribir el código a mano.
- Evaluación de pipelines de RL con recompensa de simulador: sirve como referencia reproducible de un entrenamiento GRPO cuyo reward es el propio checker del simulador, útil para investigar en robótica con RL.
- Integración en la app Prompt2Robo para Mac: el modelo es el que lista dicha aplicación, de modo que se usa como backend local en Apple Silicon para generar y probar programas robóticos.
- Filtrado de peticiones no viables: su capacidad de emitir negativas breves permite descartar instrucciones que no se pueden traducir a un programa válido antes de intentar la ejecución.
- Respuestas rápidas sobre el estado de la escena: para consultas de una frase sobre lo que hay en el entorno simulado, el modelo devuelve una respuesta directa sin generar código.
- Docencia y demostraciones de robótica simulada: al ejecutarse en MLX sobre un Mac, permite montar talleres o demos locales de generación de código robótico sin GPU dedicada.

## Benchmarks y rendimiento

El autor publica exactitud sobre conjuntos held-out con el checker estricto, sin haber entrenado sobre ellos:

| Conjunto de evaluacion | Aciertos / Total |
|---|---|
| eval | 80/102 |
| eval_v2 | 52/61 |
| eval_v3 | 72/92 |
| eval_v4 | 9/12 |
| eval_v5 | 30/39 |
| eval_posv1 | 46/61 |
| eval_posv2 | 37/50 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 4,6 GB en cuantización 4-bit MLX; en Apple Silicon la memoria unificada necesaria ronda esa cifra más el overhead de inferencia.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y superiores) con memoria unificada suficiente; el formato MLX no está pensado para GPU NVIDIA.
- Cabe en consumer hardware: sí, en Macs con memoria unificada de 8 GB o más, aunque se recomienda 16 GB para margen.
- Opciones de despliegue: MLX (librería `mlx`), y a través de ella la app Prompt2Robo para Mac; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Prompt2Robo-Qwen3-8B-posv2-grpo-8b-MLX-4bit | 8,19B | no disponible | MLX 4-bit | Apache 2.0 | Especializado en código robótico para LARA 5; entrenado con GRPO y recompensa de simulador |
| Qwen/Qwen3-8B (base) | 8B | no disponible | safetensors | Apache 2.0 | Modelo generalista del que deriva; sin especialización robótica ni formato MLX 4-bit |
| Otros fine-tunes de Qwen3-8B para robótica | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables documentados en la información proporcionada |

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la generación de código para el brazo LARA 5 simulado y las respuestas sobre escena, su utilidad es limitada.
- Requiere el system prompt del dataset y la plantilla de chat de Qwen3 en modo no-thinking; usarlo de otra forma puede degradar la calidad de las salidas.
- Entrenado contra un simulador concreto (MuJoCo y el checker del dataset); no hay garantía de transferencia a robots reales ni a otros entornos.
- Riesgo de alucinación en el código generado: un programa sintácticamente válido puede no ejecutar la tarea deseada; el propio autor usa un checker estricto para medirlo.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-8B conviene revisar también las condiciones del modelo base.
- Solo 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria amplia.
- Formato MLX 4-bit: no desplegable directamente en stacks NVIDIA estándar sin reconversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-posv2-grpo-8b-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset: https://huggingface.co/datasets/Carlo0001/Prompt2Robo
