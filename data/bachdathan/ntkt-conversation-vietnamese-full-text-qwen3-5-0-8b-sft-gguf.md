# BachDaThan/ntkt-conversation-vietnamese-full-text-qwen3.5-0.8b-sft-GGUF

## Resumen

El modelo `BachDaThan/ntkt-conversation-vietnamese-full-text-qwen3.5-0.8b-sft-GGUF` es una version cuantizada en formato GGUF de un modelo de lenguaje ajustado por instrucciones para conversacion en vietnamita. Se obtiene fusionando un adaptador LoRA (`bihungba1101/ntkt-conversation-vietnamese-full-text-qwen3.5-0.8b-sft`) sobre el modelo base `Qwen/Qwen3.5-0.8B`, y posteriormente cuantizando el resultado a GGUF mediante llama.cpp. El adaptador LoRA esta especializado en *knowledge tracing* conversacional: predice si la respuesta de un estudiante es correcta o incorrecta a partir de un historial de interacciones en vietnamita representado como texto completo.

La arquitectura subyacente es un transformer de tipo `qwen3_5_text` con 24 capas, 8 cabezas de atencion, 2 cabezas KV, y una ventana de contexto de 262.144 tokens. El modelo tiene 752.393.024 parametros totales y se distribuye en cuatro cuantizaciones GGUF (Q4_K_M, Q4_K_S, Q3_K_M y Q3_K_S), con un tamano de repositorio de 1,9 GB. La licencia es Apache-2.0 y los idiomas soportados son vietnamita e ingles. Su relevancia radica en ofrecer una opcion ligera y desplegable en entornos con recursos limitados para tareas de seguimiento del aprendizaje conversacional en vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se compone de un modelo base `Qwen/Qwen3.5-0.8B` (arquitectura `qwen3_5_text`) sobre el que se aplica un adaptador LoRA mediante PEFT. El adaptador fue entrenado con *supervised fine-tuning* (SFT) para la tarea de *knowledge tracing* conversacional: dado un historial de interacciones de un estudiante en vietnamita, el modelo predice si la siguiente respuesta es correcta o incorrecta. El dataset de entrenamiento se representa como texto completo de la conversacion, sin estructuras adicionales. El resultado se fusiona con el modelo base y se cuantiza a GGUF por `BachDaThan`. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO. El modelo final conserva el template de chat del tokenizer de Qwen, basado en tokens `<|im_start|>`, `<|im_end|>` y `<|assistant|>`.

## Capacidades

- Generacion de texto conversacional en vietnamita e ingles con soporte de instrucciones mediante chat template.
- Prediccion de resultados de aprendizaje (correcto/incorrecto) a partir de historiales de interaccion de estudiantes en vietnamita.
- Manejo de contextos largos gracias a la ventana de 262.144 tokens del modelo base.
- Integracion con el ecosistema llama.cpp (llama-cpp-python, Ollama) para inferencia local.
- Cuantizaciones disponibles que permiten ejecucion en hardware consumer con VRAM reducida.
- No se han documentado capacidades de tool calling, function calling, vision, audio ni razonamiento multi-paso explicito.

## Casos de uso

- Tutorizacion educativa automatizada: el modelo puede analizar el historial de respuestas de un estudiante en vietnamita y predecir si su proxima respuesta sera correcta, permitiendo al sistema adaptar el nivel de dificultad o proporcionar refuerzo en tiempo real.
- Sistemas de evaluacion formativa: integrado en plataformas de aprendizaje online, puede clasificar automaticamente las respuestas de los alumnos como correctas o incorrectas a partir de la conversacion previa, reduciendo la necesidad de correccion manual.
- Chatbots de practica de idiomas: al estar ajustado para conversacion en vietnamita, puede servir como asistente de practica conversacional para estudiantes de vietnamita como lengua extranjera, generando respuestas contextualizadas.
- Analisis de interacciones en aulas virtuales: permite procesar registros de chat de cursos en linea para identificar patrones de aprendizaje, errores recurrentes o progreso del estudiante a lo largo del tiempo.
- Prototipos de tutores inteligentes en entornos con recursos limitados: gracias a su tamano reducido y cuantizacion GGUF, puede ejecutarse en portatiles o mini-PCs sin GPU dedicada, facilitando el despliegue en escuelas con presupuesto restringido.
- Investigacion en *knowledge tracing*: sirve como modelo de referencia para experimentos comparativos en el dominio del seguimiento del conocimiento conversacional en vietnamita, dado que su adaptador LoRA esta enfocado especificamente en esa tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (datos de la model card):
  - Q4_K_M: 0,49 GB de peso, ~2,5 GB de VRAM recomendada.
  - Q4_K_S: 0,47 GB de peso, ~2,5 GB de VRAM recomendada.
  - Q3_K_M: 0,43 GB de peso, ~2,4 GB de VRAM recomendada.
  - Q3_K_S: 0,41 GB de peso, ~2,4 GB de VRAM recomendada.
- GPU recomendadas: cualquier GPU consumer con al menos 3 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o equivalentes) puede ejecutar las cuantizaciones Q3 y Q4. Tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, y cualquier servidor compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion disponible. El modelo es un adaptador LoRA especializado en *knowledge tracing* conversacional en vietnamita, lo que limita la comparacion directa con modelos generalistas del mismo tamano.

## Limitaciones y advertencias

- El modelo puede generar informacion falsa o alucinaciones, como se advierte en la model card del autor. No debe usarse como sustituto de asesoria profesional en ambitos criticos.
- Esta especializado en la tarea de *knowledge tracing* conversacional en vietnamita; su rendimiento fuera de ese dominio o en otros idiomas no esta garantizado.
- No se han documentado sesgos especificos, pero al estar entrenado sobre un dataset de interacciones de estudiantes puede heredar sesgos presentes en los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones de la licencia del modelo base y del adaptador LoRA para confirmar la compatibilidad.
- La ventana de contexto de 262.144 tokens es la del modelo base, pero en los ejemplos de uso se recomienda `n_ctx=8192`, lo que sugiere que el rendimiento puede degradarse con contextos muy largos en la practica.
- No hay datos de benchmarks publicados, por lo que no se puede evaluar su rendimiento relativo frente a otros modelos.

## Enlaces

- Repositorio del modelo GGUF: https://huggingface.co/BachDaThan/ntkt-conversation-vietnamese-full-text-qwen3.5-0.8b-sft-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Adaptador LoRA: https://huggingface.co/bihungba1101/ntkt-conversation-vietnamese-full-text-qwen3.5-0.8b-sft
