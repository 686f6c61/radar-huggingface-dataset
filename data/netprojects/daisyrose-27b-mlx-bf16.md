# netprojects/DaisyRose-27B-MLX-bf16

## Resumen

DaisyRose-27B es un modelo multimodal de tipo imagen-texto desarrollado por RadixArk, derivado de Qwen3.8-27B mediante aprendizaje por refuerzo (RL) exclusivamente, sin ajuste supervisado ni destilación. El entrenamiento se realizó sobre aproximadamente 1.200 tareas de agente de horizonte largo, lo que lo orienta a razonamiento multi-paso, uso de herramientas y automatización de flujos de trabajo. Conserva la arquitectura, el tokenizador, la plantilla de chat, la comprensión de imágenes y la ventana de contexto de 256K del modelo base, y razona antes de responder de forma predeterminada.

La versión aquí descrita es una conversión a MLX en bfloat16 realizada por el usuario netprojects, pensada para Apple Silicon. Incluye el codificador visual y la capa propia de predicción multi-token (MTP) del modelo original, lo que permite decodificación especulativa integrada. Con 27.781.427.952 parámetros y 55,6 GB de pesos, es una build de referencia para Macs de 96 GB o más; el mismo autor publica variantes cuantizadas de 3, 4, 6 y 8 bits.

Su relevancia actual radica en dos factores: por un lado, los resultados publicados por RadixArk muestran mejoras notables frente a Qwen3.8-27B en tareas de agente y de ingeniería de software (Terminal Bench 4.1 pasa de 5,6 a 12,0; SWE Bench Pro v2 de 91,3 a 94,7); por otro, esta conversión permite ejecutar localmente en hardware Apple un modelo de 27B con visión, tool calling y razonamiento explícito, algo poco habitual en ese ecosistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto) basada en Qwen3.8-27B, con capa MTP propia; conversión MLX |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | bf16 (esta build); el mismo autor publica 8-bit, 6-bit, 4-bit y 3-bit en MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, bfloat16); `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

DaisyRose-27B mantiene la arquitectura de Qwen3.8-27B: un transformer multimodal con codificador visual, plantilla de chat y tokenizador sin cambios (el autor de la conversión verifica que la configuración y la lista de tensores son idénticos a los de Qwen3.8-27B). Incorpora una capa propia de predicción multi-token (MTP) que actúa como modelo borrador integrado para decodificación especulativa: cada token propuesto se verifica con el modelo completo, de modo que con decodificación greedy el texto coincide con la decodificación normal salvo en empates cercanos.

El entrenamiento del modelo base consistió únicamente en RL sobre unas 1.200 tareas de agente de horizonte largo, sin SFT ni destilación. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset. El modelo razona por defecto antes de responder, con un parámetro `reasoning_effort` en la plantilla de chat (`xhigh` por defecto, `medium`, `low`) y la opción `enable_thinking=False` para respuestas directas.

## Capacidades

- Generación de texto y razonamiento explícito con modo de pensamiento activado por defecto y niveles de esfuerzo configurables.
- Comprensión de imágenes (pipeline image-text-to-text), incluyendo capturas de pantalla y contenido visual técnico.
- Tool calling y function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Ejecución de agentes y razonamiento multi-paso, con especial énfasis en tareas de terminal y de ingeniería de software.
- Generación y edición de código, verificado en las pruebas del autor de la conversión (3/3 en coding).
- Capacidades matemáticas (prueba GSM8K con 50 preguntas en las builds cuantizadas: 44/50 en 6-bit, 45/50 en 4-bit, 43/50 en 3-bit).
- Decodificación especulativa mediante la capa MTP integrada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de tareas de terminal: el modelo puede interpretar la salida de una shell, planificar secuencias de comandos y corregir errores en varios pasos; sus resultados en Terminal Bench 4.1 (12,0 frente a 5,6 del base) lo sitúan como opción para agentes de operaciones en local.
- Asistencia en ingeniería de software: con 94,7 en SWE Bench Pro v2, es adecuado para revisar parches, localizar la causa de un fallo en un repositorio y proponer cambios, integrándose en un flujo de CI/CD mediante tool calling.
- Análisis de capturas y documentación técnica: al aceptar imagen y texto, puede extraer el error mostrado en una terminal o en una interfaz y proponer la corrección, como ilustra el ejemplo de mlx-vlm de la model card.
- Agentes de horizonte largo en local: la ventana de 256K tokens permite mantener el estado de una tarea prolongada con muchos archivos o mensajes en contexto, sin depender de servicios en la nube.
- Prototipado y evaluación en Apple Silicon: sirve para validar flujos de agentes con visión y razonamiento en un MacBook antes de desplegar en infraestructura mayor, usando las builds de 4 o 6 bits en equipos de 24-36 GB.
- Procesamiento por lotes con restricciones de privacidad: al ejecutarse íntegramente en local con licencia Apache 2.0, encaja en entornos donde los datos no pueden salir del dispositivo, como análisis de documentos internos con imágenes.
- Generación de código con decodificación acelerada: el uso de la capa MTP como borrador reduce la latencia en respuestas largas, útil en asistentes interactivos de programación.

## Benchmarks y rendimiento

Resultados publicados por RadixArk para los pesos originales BF16/FP8 (no para esta conversión MLX):

| Benchmark | DaisyRose-27B | Qwen3.8-27B |
|---|---:|---:|
| Terminal Bench 4.1 | 12,0 | 5,6 |
| Terminal Bench 2.1 | 75,5 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 |
| SWE Bench Pro v2 | 94,7 | 91,3 |
| HLE (solo texto) | 34,3 | 33,9 |
| IFBench | 82,4 | 79,5 |
| GPQA Diamond | 90,7 | 89,2 |

Fidelidad de las builds cuantizadas del mismo autor (12 prompts cortos, 953 posiciones con teacher forcing):

| Build | Tamaño | Bits/peso | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico, prompt de 8K | Mac recomendado |
|---|---|---:|---:|---:|---:|---:|---|
| 6-bit | 23,1 GB | 6,66 | 98,7 % | 0,0014 | 44/50 | 23,4 GB | 36 GB+ |
| 8-bit | 29,9 GB | 8,63 | 99,5 % | 0,0004 | no disponible | 29,7 GB | 48 GB+ |
| 4-bit | 16,3 GB | 4,70 | 95,8 % | 0,0207 | 45/50 | 17,1 GB | 32 GB+ |
| 3-bit | 13,8 GB | 3,91 | 92,1 % | 0,0814 | 43/50 | 14,6 GB | 24 GB+ |
| bf16 | 55,6 GB | 16 | referencia | — | no disponible | 53,4 GB | 96 GB+ |

## Requisitos de hardware

- Esta build bf16 ocupa 55,6 GB en disco y requiere unos 53,4 GB de memoria pico para un prompt de 8K tokens en modo texto; el autor recomienda un Mac de 96 GB o más.
- Para contextos más largos que 8K la memoria necesaria aumenta proporcionalmente; los 256K tokens de contexto no caben en configuraciones de memoria moderada.
- Alternativas del mismo autor para equipos menores: 6-bit (23,4 GB de pico, Mac de 36 GB+), 8-bit (29,7 GB, Mac de 48 GB+), 4-bit (17,1 GB, Mac de 32 GB+) y 3-bit (14,6 GB, Mac de 24 GB+).
- En un Mac de 32 GB se puede elevar el límite de memoria de GPU con `sudo sysctl iogpu.wired_limit_mb=27000`, dejando varios GB para macOS y aplicaciones; con contexto corto suele bastar para la build de 6 bits (y la de 4 bits en un equipo de 24 GB).
- Despliegue: `mlx-lm>=0.32.2` para texto y servidor compatible con OpenAI (`mlx_lm.server`); `mlx-vlm>=0.7.11` para imagen. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Decodificación acelerada: pasar el mismo repositorio como `--draft-model` con `--draft-kind mtp` en mlx-vlm.
- Latencia y throughput: no disponible (las mediciones del autor se realizaron en un MacBook Pro M5 Max de 128 GB con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11, pero no se publican cifras de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B (esta build) | 27,8B | 256K | Apache 2.0 | MLX bf16, Apple Silicon | Visión, tool calling, MTP, modo thinking |
| Qwen3.8-27B (base) | no disponible | 256K | no disponible | no disponible | Referencia de los benchmarks; sin el entrenamiento RL de RadixArk |
| DaisyRose-27B 6-bit (mismo autor) | 27,8B | 256K | Apache 2.0 | MLX, 23,1 GB | 98,7 % de coincidencia con bf16; recomendada para 36 GB+ |
| DaisyRose-27B 4-bit (mismo autor) | 27,8B | 256K | Apache 2.0 | MLX, 16,3 GB | 95,8 % de coincidencia; para Macs de 32 GB+ |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado solo con RL sobre unas 1.200 tareas de agente: puede mostrar un rendimiento desigual fuera de ese dominio y no se documenta el comportamiento en conversación general.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad para esta versión.
- El modo thinking está activado por defecto y consume muchos tokens; en problemas difíciles hay que reservar espacio suficiente para el razonamiento, lo que incrementa la latencia y el coste.
- La build bf16 requiere 96 GB de RAM en Apple Silicon; en equipos menores hay que recurrir a las cuantizadas, con la consiguiente pérdida de fidelidad (92,1 % de coincidencia en 3 bits).
- La decodificación con MTP puede divergir ligeramente del texto de la decodificación normal en empates cercanos, incluso con greedy.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe equivalente al del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero los resultados de benchmarks citados son cifras del editor para los pesos BF16/FP8 originales, no mediciones de esta conversión MLX.
- El repositorio no registra descargas ni valoraciones en el momento de la consulta; se trata de una conversión reciente (19 de noviembre de 2026) sin validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/DaisyRose-27B-MLX-bf16
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Build 6-bit: https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/DaisyRose-27B-MLX-4bit
- Build 3-bit: https://huggingface.co/netprojects/DaisyRose-27B-MLX-3bit
