# luispoveda93/MiniCPM5-2B-catalan-chat-v2

## Resumen

MiniCPM5-2B-catalan-chat-v2 es un ajuste fino conversacional en catalán del modelo MiniCPM5-2B de OpenBMB, desarrollado por el usuario luispoveda93. Se trata de la segunda ronda de especialización sobre el modelo base: la primera ronda (luispoveda93/MiniCPM5-2B-catalan-chat) se entrenó con instrucciones de un solo turno del dataset InstruCAT, mientras que esta segunda ronda se centra en el comportamiento de chat multi-turno. El modelo resuelve la necesidad de un asistente conversacional nativo en catalán de tamaño contenido (2.500 millones de parámetros) desplegable en hardware modesto.

La arquitectura subyacente es un transformer tipo Llama (según los tags del repositorio), con 2.516.756.480 parámetros totales en formato safetensors y pesos en bf16. El entrenamiento se realizó mediante LoRA sobre el modelo fusionado de la ronda 1, utilizando 23.400 conversaciones multi-turno en catalán procedentes del núcleo conversacional del dataset BSC-LT/ALIA-2606-SFT, la misma mezcla SFT que entrenó ALIA-40b-instruct-2606.

Su relevancia actual radica en que cubre un nicho poco atendido: asistentes conversacionales en catalán con licencia abierta y peso ligero, con soporte para despliegue en transformers y versiones GGUF para llama.cpp. No obstante, se trata de un modelo de investigación con evaluación limitada a métricas de pérdida y precisión de tokens, sin benchmarks independientes de chat en catalán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tags del repositorio) |
| Parametros totales | 2.516.756.480 (2,52 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó max_length 2048 empaquetado) |
| Tipos de cuantizacion | bf16 (modelo fusionado); GGUF en Q4_K_M, Q8_0 y F16 |
| Idiomas soportados | Catalán (ca) |
| Licencia | other (licencia personalizada; ver limitaciones) |
| Formato de pesos | safetensors (modelo fusionado), GGUF, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Llama con 2,52 mil millones de parámetros, heredado de openbmb/MiniCPM5-2B. Sobre la ronda 1 (ajustada con InstruCAT en instrucciones de un solo turno) se aplicó un segundo ajuste LoRA con r=32, α=64 sobre todas las capas de proyección, learning rate 1e-4 con decaimiento coseno, warmup de 50 pasos, 1 época, batch efectivo de 32 (4 × 8), max_length 2048 empaquetado, precisión bf16 y pérdida calculada solo sobre los tokens de completación.

Los datos de entrenamiento son 23.400 conversaciones multi-turno en catalán extraídas del núcleo conversacional de BSC-LT/ALIA-2606-SFT: mturn-plus5 (5.281 conversaciones de flujo multi-turno), eif (5.821 de seguimiento exacto de instrucciones), mentor-ca (5.047 de diálogo y mentoría), dolly-ca (2.449 de instrucciones abiertas), coqcat (2.372 de QA conversacional), alia-identity (1.259 de autoidentidad) y system-prompt multi-turn (1.226 de adherencia al prompt de sistema). Todas las conversaciones son CC-BY-4.0. Se antepuso un prompt de sistema en catalán a las conversaciones que carecían de él y se reservaron 400 conversaciones para evaluación. El entrenamiento requirió unos 326 pasos empaquetados y 2 horas y 19 minutos en una A100-large. La pérdida de entrenamiento bajó de 2,44 a aproximadamente 1,44; la de evaluación de 1,48 a 1,383; y la precisión de tokens de 0,57 a 0,704.

## Capacidades

- Generación de texto conversacional multi-turno en catalán, con especial énfasis en el flujo natural de diálogo.
- Seguimiento de instrucciones (instrucciones exactas y abiertas) gracias a las fuentes eif y dolly-ca.
- Adherencia a prompts de sistema, incluida la instrucción de responder siempre en catalán.
- Autoidentidad consistente (fuente alia-identity).
- QA conversacional (fuente coqcat).
- Diálogo de mentoría y asistencia guiada (fuente mentor-ca).
- Capacidades de QA de tareas heredadas de la ronda 1 (InstruCAT).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente conversacional en catalán para atención al cliente: el modelo puede mantener conversaciones multi-turno con contexto de hasta 2048 tokens, suficiente para gestionar incidencias típicas de soporte con historial de varios turnos.
- Chatbot de acompañamiento o mentoría: la fuente mentor-ca entrena explícitamente patrones de diálogo guiado, útil para asistentes educativos o de orientación en catalán.
- Integración en aplicaciones web o móviles con recursos limitados: con 2,52 B de parámetros y versiones GGUF Q4_K_M, puede ejecutarse en CPU o en GPUs de consumo, lo que permite desplegar un asistente catalán sin infraestructura de servidor dedicada.
- Prototipado rápido de interfaces conversacionales en catalán: al estar disponible en transformers con `apply_chat_template`, se integra en pipelines de Python en pocas líneas y sirve para validar productos antes de escalar a modelos mayores.
- Generación de respuestas en catalán dentro de flujos de datos: por ejemplo, para redactar respuestas de formularios, correos o mensajes de soporte con instrucciones de sistema que fijen el tono y el idioma.
- Investigación en ajuste fino de modelos pequeños para lenguas de recursos medios: el modelo y su adaptador LoRA publicados permiten reproducir y extender el entrenamiento sobre otras mezclas de datos catalanas.
- Base para fine-tuning adicional en dominios específicos (legal, sanitario, administrativo) en catalán, partiendo de un modelo que ya domina el registro conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas de entrenamiento y evaluación sobre 400 conversaciones reservadas: pérdida de evaluación de 1,383 y precisión de tokens de 0,704. No se ejecutó ningún benchmark independiente de chat en catalán.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5 GB para los pesos (el repositorio fusionado ocupa 5,0 GB) más overhead de activaciones y caché KV; en la práctica, unos 6-8 GB para contextos de 2048 tokens.
- VRAM estimada en GGUF Q4_K_M: alrededor de 1,5-2 GB de pesos, desplegable en GPUs de 4 GB o incluso en CPU.
- VRAM estimada en GGUF Q8_0: aproximadamente 2,7-3 GB de pesos.
- GPU recomendadas: A100 o H100 para entrenamiento y evaluación a gran escala; RTX 4090, RTX 3090, RTX 4080 o RTX 4070 para inferencia en bf16 sin problemas.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas de 4-6 GB con cuantización Q4_K_M.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM`), llama.cpp y Ollama mediante los GGUF publicados, y text-generation-inference (el repositorio está marcado como compatible con endpoints).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-catalan-chat-v2 | 2,52 B | No disponible (entrenado a 2048) | Catalán | other | HF: safetensors, GGUF, LoRA |
| MiniCPM5-2B (openbmb) | ~2 B (no confirmado en la información) | No disponible | Multilingüe (no detallado) | No disponible | HF |
| MiniCPM5-2B-catalan-chat (ronda 1) | 2,52 B | No disponible | Catalán | other | HF: safetensors, GGUF |
| ALIA-40b-instruct-2606 | 40 B (según referencia de la model card) | No disponible | Catalán y otras lenguas ibéricas | No disponible | No disponible en la información |

La comparación con alternativas de la misma categoría (modelos conversacionales en catalán de tamaño pequeño) no está disponible en la información proporcionada. El modelo base original MiniCPM5-2B y ALIA-40b-instruct-2606 se citan en la model card como origen de los datos, pero no se aportan datos de rendimiento comparativo.

## Limitaciones y advertencias

- Con 2,52 B de parámetros, el conocimiento del mundo y la profundidad de razonamiento son limitados; el foco del entrenamiento es el estilo conversacional en catalán, no las tareas de conocimiento intensivo.
- La evaluación se basa únicamente en pérdida y precisión de tokens sobre 400 conversaciones reservadas; no hay benchmark independiente de chat en catalán, por lo que el rendimiento real en producción es incierto.
- La ronda 2 excluyó deliberadamente los corpus de QA (fineweb-edu, RAG, matemáticas) del mixture ALIA; las habilidades de QA de tareas provienen solo de la ronda 1 y pueden ser débiles.
- Riesgo de alucinación inherente a un modelo de este tamaño, especialmente en preguntas factuales fuera del dominio conversacional.
- El modelo está entrenado exclusivamente en catalán; no se garantiza un comportamiento correcto en castellano u otras lenguas.
- La licencia es "other" (personalizada); no se detallan en la información disponible las condiciones exactas de uso comercial, por lo que debe revisarse el archivo de licencia del repositorio antes de un despliegue productivo.
- La ronda 1 incluye datos de InstruCAT en su linaje, lo que puede arrastrar restricciones de la ronda anterior pese a que los datos de la ronda 2 son CC-BY-4.0.
- La longitud de contexto efectiva no está documentada; el entrenamiento usó 2048 tokens empaquetados, por lo que contextos superiores no están validados.
- Modelo de investigación con 369 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2
- Adaptador LoRA: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2-lora
- GGUF: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2-GGUF
- Ronda 1: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat
- GGUF de la ronda 1: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-GGUF
- Modelo base original: https://huggingface.co/openbmb/MiniCPM5-2B
- Dataset InstruCAT: https://huggingface.co/datasets/projecte-aina/InstruCAT
- Dataset ALIA-2606-SFT: https://huggingface.co/datasets/BSC-LT/ALIA-2606-SFT
- Métricas de entrenamiento (trackio): https://luispoveda93-minicpm5-2b-catalan-chat-v2-trackio.hf.space?project=minicpm5-2b-catalan-chat-v2
