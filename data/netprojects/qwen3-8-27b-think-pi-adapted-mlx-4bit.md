# netprojects/Qwen3.8-27B-think-pi-adapted-MLX-4bit

## Resumen

Qwen3.8-27B-think-pi-adapted-MLX-4bit es una cuantizacion en 4 bits para Apple Silicon, mediante la libreria MLX, del adaptador LoRA `harness-hub/Qwen3.8-27B-think-pi-adapted` fusionado sobre el modelo base `Qwen/Qwen3.8-27B`. Lo publica el usuario `netprojects` y su proposito es ofrecer una build ligera (16,3 GB) de un modelo de 27.781 millones de parametros que quepa en Macs con 32 GB de memoria unificada o mas, manteniendo el modo de razonamiento (thinking) activado y las capacidades multimodales de imagen a texto.

El modelo base Qwen3.8-27B es un transformer denso de la familia Qwen3.5 con vision encoder y una capa de prediccion multi-token (MTP). El adaptador de `harness-hub` se entreno con aprendizaje por refuerzo (AsyncGRPO en TRL) dentro del agente de programacion pi, con thinking activado, esfuerzo de razonamiento xhigh y un limite de salida de 32.768 tokens, y se selecciono el checkpoint del paso 90. El resultado es un modelo orientado a tareas de agente de codigo que alcanza puntuaciones equivalentes a las del modelo base en SWE-bench Pro y Terminal-Bench 2.1 pero con entre un 35 % y un 42 % menos de tokens de salida.

La relevancia de esta build concreta es doble: por un lado, permite ejecutar localmente en hardware Apple un modelo de 27B con capacidades de agente y vision; por otro, conserva la capa MTP cuantizada, que mlx-vlm puede usar como modelo borrador para decodificacion especulativa. La fidelidad respecto a bf16 es alta en terminos de siguiente token (96,0 %) y la desviacion KL es de 0,0187, con un rendimiento en GSM8K de 46/50 frente a 45/50 del bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) con vision encoder y capa MTP; pesos convertidos a MLX |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso un limite de salida de 32.768 tokens) |
| Tipos de cuantizacion | 4 bits afina, grupo 64; existen builds 6-bit, 8-bit, bf16 y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |
| Tamano del repo | 16,3 GB |
| Libreria | mlx (mlx-lm, mlx-vlm) |
| Modelo base | harness-hub/Qwen3.8-27B-think-pi-adapted (revision c85fad6) sobre Qwen/Qwen3.8-27B (revision 3756181) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 con un encoder de vision integrado, lo que habilita el pipeline image-text-to-text. Incluye una capa de prediccion multi-token (MTP) propia de Qwen3.8-27B, que en esta build se conserva cuantizada en `model-mtp.safetensors` con el mismo esquema que el resto de pesos. El adaptador LoRA no modifica esa capa, por lo que la cabeza MTP es la original de Qwen. La conversion a MLX se realizo con mlx-vlm e incluye tanto el encoder de vision como la capa MTP; las capas lineales se cuantizaron a 4 bits con cuantizacion afina y tamano de grupo 64.

El adaptador se entreno con aprendizaje por refuerzo usando AsyncGRPO en la libreria TRL, dentro del agente de programacion pi, con thinking activado, esfuerzo de razonamiento xhigh y un tope de salida de 32.768 tokens. Se evaluaron los checkpoints de los pasos 70, 90, 120 y 150 y se publico el del paso 90. El tokenizador y la plantilla de chat son los de `harness-hub` sin modificar, de modo que el vocabulario y el formato de llamadas a herramientas coinciden con los de Qwen3.8-27B. La innovacion tecnica mas destacable de esta build es la conservacion de la capa MTP utilizable como modelo borrador para decodificacion especulativa en mlx-vlm mediante `--draft-kind mtp`.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable mediante `enable_thinking` en la plantilla de chat; la respuesta comienza con el razonamiento y se cierra con ``.
- Programacion y tareas de agente de codigo: el adaptador se entreno especificamente dentro de un agente de programacion (pi) para resolver tareas tipo SWE-bench y Terminal-Bench.
- Llamada a herramientas (tool calling) en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Razonamiento multi-paso y uso de agentes, con un limite de salida de 32.768 tokens coherente con el entrenamiento.
- Vision: entrada de imagen y texto (image-text-to-text), con ejemplos de uso sobre capturas de terminal y pantallas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Decodificacion especulativa mediante la capa MTP incluida, usando el mismo repositorio como `--draft-model`.

## Casos de uso

- Agente de codigo local en Mac: servir el modelo con `mlx_lm.server` y conectarlo a pi mediante la API compatible con OpenAI en modo `openai-completions`, con `maxTokens` a 32768 para no truncar el razonamiento. Es adecuado porque el adaptador se entreno y evaluo exactamente en ese entorno.
- Correccion de tests y depuracion de repositorios: el modelo puede recibir una instruccion del tipo "averigua por que fallan los tests de tests/test_parser.py y corrige el bug" y operar sobre el arbol de trabajo del agente; encaja por su entrenamiento en SWE-bench Pro.
- Automatizacion de tareas de terminal: uso en Terminal-Bench 2.1 con un consumo de tokens de salida entre un 35 % y un 42 % menor que la variante pi-adapted con thinking, lo que reduce coste y latencia en bucles de agente.
- Analisis de capturas de pantalla y salidas de terminal: con mlx-vlm se puede pasar una imagen (`--image screenshot.png`) y preguntar por el error mostrado, util para asistentes de soporte tecnico y diagnostico.
- Generacion de codigo asistida en local sin enviar datos a la nube: al ejecutarse en Apple Silicon con MLX, permite trabajar con codigo propietario en un portatil o equipo de sobremesa.
- Aceleracion de inferencia con decodificacion especulativa: usar la capa MTP como borrador (`--draft-kind mtp`) en tareas de generacion de codigo con temperatura 0 para reducir el numero de pasos de decodificacion.
- Prototipado de agentes con tool calling: el formato XML de Qwen convertido a `tool_calls` de OpenAI permite integrarlo en frameworks que ya consumen esa interfaz sin adaptadores adicionales.

## Benchmarks y rendimiento

Resultados publicados por harness-hub bajo pi, con thinking activado y un intento por tarea:

| Benchmark | Qwen3.8-27B, thinking | pi-adapted, thinking | think-pi (este adaptador) |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 74,5 % | 74,5 % | 76,5 % |
| Terminal-Bench 2.1 (87 tareas) | 60,9 % | 59,8 % | 57,5 % |

El autor del adaptador indica que las diferencias de puntuacion no son significativas y que las tres variantes estan al mismo nivel, con un ahorro de tokens de salida del 42 % (media) en SWE-bench Pro y del 35 % (mediana) en Terminal-Bench 2.1 respecto a pi-adapted con thinking.

Fidelidad de las distintas builds MLX respecto a bf16:

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico, prompt de 8K tokens | Memoria de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (recomendada) | 23,1 GB | 98,8 % | 0,0014 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,1 % | 0,0004 | 44/50 | 29,7 GB | 48 GB+ |
| MLX-4bit (esta build) | 16,3 GB | 96,0 % | 0,0187 | 46/50 | 17,1 GB | 32 GB+ |
| MLX-bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |
| MLX-adapter | 638 MB | solo LoRA, para mlx-lm | sobre cualquier build MLX de Qwen3.8-27B | | | |

## Requisitos de hardware

- Memoria unificada: 32 GB o mas para esta build de 4 bits; memoria pico de 17,1 GB con un prompt de 8192 tokens.
- Alternativas segun memoria: 6 bits (recomendada por el autor) requiere 36 GB+ y 23,4 GB de pico; 8 bits requiere 48 GB+ y 29,7 GB de pico; bf16 requiere 96 GB+ y 53,4 GB de pico.
- Hardware objetivo: Apple Silicon (serie M) con MLX; no esta pensado para GPU NVIDIA ni CUDA.
- Despliegue: `mlx_lm.server` (API compatible con OpenAI), `mlx-lm` para texto en Python y `mlx-vlm` para vision y decodificacion especulativa con MTP. Requiere `mlx-lm>=0.32.2` y `mlx-vlm>=0.7.11`.
- Integracion con agentes: pi (Node.js 22.19 o superior) mediante `npm install -g --ignore-scripts @earendil-works/pi-coding-agent`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-think-pi-adapted-MLX-4bit | 27,78 B | no disponible | 4 bits (MLX) | 16,3 GB | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit | 27,78 B | no disponible | 6 bits (MLX) | 23,1 GB | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-think-pi-adapted-MLX-8bit | 27,78 B | no disponible | 8 bits (MLX) | 30,0 GB | Apache 2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-think-pi-adapted | 27,78 B | no disponible | bf16 (original) | no disponible | Apache 2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,78 B | no disponible | bf16 (original) | no disponible | Apache 2.0 | Hugging Face |

Frente a la build de 6 bits, esta version ocupa 6,8 GB menos y pierde 2,8 puntos de coincidencia en el siguiente token (96,0 % frente a 98,8 %), con una KL mucho mayor (0,0187 frente a 0,0014); a cambio, mantiene 46/50 en GSM8K. Frente a la variante pi-adapted sin thinking, esta build iguala o supera ligeramente SWE-bench Pro (76,5 % frente a 74,5 %) y queda por debajo en Terminal-Bench 2.1 (57,5 % frente a 59,8 %), con menor consumo de tokens. No se dispone de datos de benchmarks de modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits reduce la fidelidad respecto a bf16: solo el 96,0 % de los siguientes tokens coinciden y la KL es de 0,0187, muy superior a la de las builds de 6 y 8 bits.
- El modelo esta disenado para funcionar con thinking activado; desactivarlo puede degradar el comportamiento para el que fue entrenado.
- El limite de salida de 32.768 tokens debe respetarse en la configuracion del cliente (`maxTokens: 32768`); un valor inferior puede truncar el razonamiento.
- La integracion con pi requiere `"api": "openai-completions"`; el adaptador se entreno y evaluo mediante Chat Completions, no mediante la API Responses.
- Solo es ejecutable en Apple Silicon con MLX; no hay soporte para CUDA, vLLM, llama.cpp ni Ollama en esta build.
- Las diferencias de rendimiento frente a las otras variantes no se consideran estadisticamente significativas segun el autor; Terminal-Bench 2.1 baja a 57,5 % frente al 60,9 % del modelo base.
- Idiomas soportados y longitud de contexto no estan documentados en la informacion disponible.
- Riesgo de alucinacion y sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0, que permite uso comercial; deben respetarse las condiciones de los modelos base y del adaptador de los que deriva.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-4bit
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- Variante sin thinking: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-adapter
- Repositorio del agente pi: https://github.com/earendil-works/pi
