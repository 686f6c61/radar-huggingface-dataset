# netprojects/Qwen3.8-27B-think-pi-adapted-MLX-8bit

## Resumen

Qwen3.8-27B-think-pi-adapted-MLX-8bit es una cuantizacion en 8 bits para Apple Silicon (formato MLX) del adaptador LoRA `harness-hub/Qwen3.8-27B-think-pi-adapted`, fusionado sobre el modelo base `Qwen/Qwen3.8-27B`. Lo publica el usuario `netprojects` como build listo para ejecutar en macOS con chip Apple Silicon, manteniendo el codificador de vision y la capa de prediccion multi-token (MTP) originales de Qwen. El resultado es un modelo multimodal (image-text-to-text) de 27.781.427.952 parametros (aproximadamente 27,8 mil millones) que ocupa 30,0 GB en disco.

El modelo resuelve un problema concreto: ejecutar localmente en un Mac un agente de programacion con razonamiento extendido ("thinking on") sin depender de APIs en la nube. El adaptador original fue entrenado por `harness-hub` con aprendizaje por refuerzo (AsyncGRPO en TRL) dentro del agente de programacion `pi`, con el modo de razonamiento activado, esfuerzo de razonamiento xhigh y un limite de salida de 32.768 tokens. La version 8 bits es la que mas se aproxima al modelo en bf16 en fidelidad de cuantizacion (99,1% de coincidencia en el siguiente token, KL de 0,0004).

Es relevante ahora porque demuestra que un adaptador entrenado con RL para tareas de ingenieria de software puede mantener la puntuacion de referencia reduciendo de forma notable los tokens de razonamiento generados (alrededor de un 42% menos en SWE-bench Pro y un 35% menos en Terminal-Bench 2.1 frente al adaptador con thinking). La licencia Apache 2.0 facilita su uso comercial, aunque las condiciones del modelo base deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP, convertido a MLX; arquitectura declarada en los tags: qwen3_5 |
| Parametros totales | 27.781.427.952 (aprox. 27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el limite de salida usado en entrenamiento es de 32.768 tokens) |
| Tipos de cuantizacion | 8 bits afines (affine), group size 64; existen builds 4-bit, 6-bit, bf16 y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B` (revision `3756181`), un transformer multimodal con codificador de vision y una capa de prediccion multi-token (MTP). Sobre el se fusiono el LoRA `harness-hub/Qwen3.8-27B-think-pi-adapted` (revision `c85fad6`), entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL dentro del agente de programacion `pi`, con thinking activado, esfuerzo de razonamiento xhigh y un tope de salida de 32.768 tokens. Se libero el checkpoint del paso 90, elegido entre los pasos 70, 90, 120 y 150. El adaptador no modifica la capa MTP, que permanece como la original de Qwen.

La conversion a MLX se hizo con mlx-vlm e incluye el codificador de vision y la capa MTP. En esta build las capas lineales se cuantizan a 8 bits (afines, grupo 64). La capa MTP se conserva cuantizada de forma coherente con el resto y puede usarse como modelo borrador integrado para decodificacion especulativa pasando el mismo repositorio como `--draft-model` con `--draft-kind mtp`. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, con el mismo vocabulario y formato de tool calls que Qwen3.8-27B.

## Capacidades

- Generacion de texto y razonamiento extendido con modo thinking activable (`enable_thinking`), pensado para cadenas de razonamiento largas.
- Capacidades de agente de programacion: resolucion de bugs, edicion de codigo y ejecucion de tareas multi-paso dentro de un agente como `pi`.
- Soporte de tool calling / function calling en el formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm devuelve como `tool_calls` de OpenAI.
- Capacidades multimodales de entrada imagen-texto: analisis de capturas, pantallazos de terminal y similares mediante mlx-vlm.
- Decodificacion especulativa con la capa MTP integrada como modelo borrador.
- Capacidades multilingues: no disponible (no se documentan idiomas soportados).

## Casos de uso

- Agente de programacion local en Mac: servir el modelo con `mlx_lm.server` y conectarlo a `pi` mediante la API compatible con OpenAI (Chat Completions), con `maxTokens` a 32.768 para no truncar el razonamiento. Adecuado porque el adaptador fue entrenado y evaluado exactamente en ese flujo.
- Depuracion de tests en un repositorio: lanzar tareas como "encuentra por que fallan los tests de tests/test_parser.py y corrige el bug" mediante `pi --print`. El modelo esta optimizado para ese tipo de tareas de SWE-bench Pro.
- Analisis de errores en capturas de terminal: usar `mlx_vlm.generate` con `--image screenshot.png` para interpretar el error mostrado en una captura y proponer una solucion.
- Automatizacion de tareas de terminal: el modelo rinde en Terminal-Bench 2.1, por lo que encaja en flujos donde el agente ejecuta comandos y verifica resultados.
- Prototipado de asistentes de codigo con tool calling: integrar el servidor local en herramientas que consuman la API de OpenAI y necesiten llamadas a funciones en formato Qwen convertidas a `tool_calls`.
- Inferencia con presupuesto de memoria ajustado: el build 8-bit requiere unos 29,7 GB de pico con prompts de 8K tokens y se sugiere un Mac con 48 GB o mas; para equipos con menos memoria existen builds de 6 bits (23,4 GB de pico, 36 GB+ sugeridos) y 4 bits (17,1 GB de pico, 32 GB+ sugeridos).
- Decodificacion acelerada con MTP: usar la capa MTP como borrador en `mlx_vlm.generate` para reducir latencia en generacion de codigo corto o medio.

## Benchmarks y rendimiento

Resultados publicados por harness-hub bajo `pi`, con thinking activado y un intento por tarea:

| Benchmark | Qwen3.8-27B, thinking | pi-adapted, thinking | think-pi |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 74,5% | 74,5% | 76,5% |
| Terminal-Bench 2.1 (87 tareas) | 60,9% | 59,8% | 57,5% |

harness-hub indica que las diferencias de puntuacion no son significativas y que think-pi alcanza resultados equivalentes con aproximadamente un 42% menos de tokens de salida (media) en SWE-bench Pro y un 35% menos (mediana) en Terminal-Bench 2.1 frente a pi-adapted con thinking.

Fidelidad de la cuantizacion y consumo de memoria (datos del autor del build):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico, prompt de 8K tokens | Memoria de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (recomendado) | 23,1 GB | 98,8% | 0,0014 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,1% | 0,0004 | 44/50 | 29,7 GB | 48 GB+ |
| MLX-4bit | 16,3 GB | 96,0% | 0,0187 | 46/50 | 17,1 GB | 32 GB+ |
| MLX-bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 29,7 GB de pico con prompts de 8K tokens en el build 8-bit; 30,0 GB de tamano en disco.
- Memoria de Mac sugerida: 48 GB o mas para el build 8-bit; 36 GB+ para el 6-bit; 32 GB+ para el 4-bit; 96 GB+ para bf16.
- GPU: exclusivamente Apple Silicon (MLX). No esta pensado para GPU NVIDIA ni CUDA.
- Cabe en equipos consumer Apple Silicon con memoria unificada suficiente (Mac con 48 GB o mas para esta build).
- Despliegue: `mlx-lm>=0.32.2` (servidor compatible con OpenAI, `mlx_lm.server`), `mlx-vlm>=0.7.11` para entrada de imagenes y MTP. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta build.
- Latencia y throughput: no disponibles de forma numerica; solo se documenta la reduccion de tokens de salida (42% en SWE-bench Pro, 35% en Terminal-Bench 2.1) y el uso de MTP como acelerador de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-think-pi-adapted-MLX-8bit | 27,8 B | no disponible | MLX safetensors, Apple Silicon | Apache 2.0 | Build 8-bit, 99,1% de coincidencia con bf16, 30,0 GB |
| netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit | 27,8 B | no disponible | MLX safetensors, Apple Silicon | Apache 2.0 | Build recomendado por el autor, 23,1 GB, 98,8% de coincidencia |
| netprojects/Qwen3.8-27B-think-pi-adapted-MLX-4bit | 27,8 B | no disponible | MLX safetensors, Apple Silicon | Apache 2.0 | 16,3 GB, 96,0% de coincidencia, para Macs con menos memoria |
| harness-hub/Qwen3.8-27B-think-pi-adapted | 27,8 B (base) | no disponible | Adaptador LoRA sobre Qwen3.8-27B | Apache 2.0 (segun model card) | Adaptador original entrenado con RL en `pi` |
| Qwen/Qwen3.8-27B | 27,8 B (base) | no disponible | Pesos originales | no disponible en la informacion proporcionada | Modelo base multimodal con MTP |

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking activado; usarlo con thinking desactivado puede degradar el comportamiento esperado.
- El limite de salida usado en entrenamiento es de 32.768 tokens; configurar `maxTokens` por debajo puede truncar cadenas de razonamiento largas.
- El adaptador se entreno y evaluo a traves de la API Chat Completions, no de la Responses API; usar `"api": "openai-completions"` en la configuracion de `pi`.
- Las diferencias de puntuacion frente al adaptador sin thinking no son significativas segun harness-hub; no debe interpretarse como una mejora de capacidad, sino de eficiencia en tokens.
- La cuantizacion 8-bit introduce una perdida minima pero no nula (KL 0,0004, 99,1% de coincidencia en el siguiente token); el build 4-bit baja al 96,0% de coincidencia.
- Requiere hardware Apple Silicon; no es desplegable en GPU NVIDIA ni en entornos CUDA con las herramientas documentadas.
- Idiomas soportados no documentados; no hay garantias explicitas de rendimiento multilingue.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion proporcionada; aplican los del modelo base Qwen3.8-27B.
- La licencia del repositorio es Apache 2.0, pero deben verificarse las condiciones del modelo base Qwen3.8-27B para uso comercial.
- El repositorio tiene un volumen de descargas muy bajo (14) y ninguna valoracion, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Hugging Face (este build): https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-8bit
- Build 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit
- Build 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-adapter
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Agente pi: https://github.com/earendil-works/pi
