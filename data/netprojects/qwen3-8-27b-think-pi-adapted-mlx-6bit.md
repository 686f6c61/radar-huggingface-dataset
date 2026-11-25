# netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit

## Resumen

Qwen3.8-27B-think-pi-adapted-MLX-6bit es una cuantizacion en 6 bits para Apple Silicon (formato MLX) del adaptador LoRA `harness-hub/Qwen3.8-27B-think-pi-adapted`, fusionado sobre el modelo base `Qwen/Qwen3.8-27B`. Lo publica el usuario `netprojects` como build listo para ejecutar en Macs con memoria unificada, incluyendo el codificador de vision y la capa de prediccion multi-token (MTP) de Qwen. El resultado es un unico repositorio de 23,1 GB que se carga con `mlx-lm` o `mlx-vlm` sin necesidad de fusionar el adaptador manualmente.

El modelo base es un transformer multimodal de 27.781.427.952 parametros (27,8B) con capacidades de imagen-a-texto, razonamiento con modo thinking y tool calling en formato XML de Qwen. El adaptador se entreno con aprendizaje por refuerzo (AsyncGRPO en TRL) dentro del agente de programacion `pi`, con thinking activado, esfuerzo de razonamiento xhigh y un limite de salida de 32.768 tokens, partiendo del checkpoint del paso 90. Su proposito es reducir la verbosidad del razonamiento sin perder precision en tareas de ingenieria de software y terminal.

La relevancia practica esta en que ofrece el rendimiento de SWE-bench Pro del adaptador original (76,5%) con aproximadamente un 42% menos de tokens de salida en media, y todo ello en un formato cuantizado que mantiene el 98,8% de coincidencia en el siguiente token respecto a bf16 con una divergencia KL de solo 0,0014. Es, por tanto, una opcion para desarrolladores que quieran un agente de codigo local en hardware de consumo Apple sin renunciar al modo thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8) con capa MTP; adaptador LoRA fusionado; cuantizacion MLX affine de 6 bits, grupo 64 |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible (la model card solo indica un limite de salida de 32.768 tokens usado en entrenamiento) |
| Tipos de cuantizacion | 6 bits (esta build); el autor publica tambien 4 bits, 8 bits, bf16 y adaptador LoRA suelto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP; tamano del repo 23,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de Qwen3.8 con 27,8B parametros que incorpora un codificador de vision (pipeline `image-text-to-text`) y una capa de prediccion multi-token (MTP) propia de Qwen, conservada en esta build y cuantizada al mismo nivel que el resto. Sobre ese base se fusiono el LoRA `harness-hub/Qwen3.8-27B-think-pi-adapted` (revision `c85fad6`) sobre la revision `3756181` de `Qwen/Qwen3.8-27B`, y el conjunto se convirtio a MLX con `mlx-vlm`. La cuantizacion es affine de 6 bits con grupo 64 aplicada a las capas lineales.

El adaptador se entreno con aprendizaje por refuerzo mediante AsyncGRPO en TRL, dentro del agente de codigo `pi`, con thinking activado, esfuerzo de razonamiento xhigh y tope de salida de 32.768 tokens. Se selecciono el checkpoint del paso 90 entre los pasos 70, 90, 120 y 150. El tokenizador y la plantilla de chat son los originales de harness-hub, sin cambios, por lo que el vocabulario y el formato de tool calls coinciden con Qwen3.8-27B. La innovacion destacable es el uso de la capa MTP como modelo borrador integrado (decodificacion especulativa) cuando se pasa el mismo repositorio como `--draft-model` con `--draft-kind mtp`.

## Capacidades

- Generacion de texto y razonamiento con modo thinking explicito, cerrado con la etiqueta ``.
- Capacidades multimodales de imagen a texto: descripcion de capturas, lectura de errores en terminales, analisis de imagenes.
- Tool calling y function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de `mlx-lm` expone como `tool_calls` de OpenAI.
- Uso como agente de codigo multi-paso dentro de `pi`, con razonamiento encadenado y ejecucion de herramientas.
- Razonamiento matematico basico verificado en la model card (GSM8K: 46/50 en esta build de 6 bits).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Decodificacion especulativa mediante la capa MTP integrada.

## Casos de uso

- Agente de correccion de bugs en local: el modelo puede recibir un fallo de tests (`tests/test_parser.py`) y razonar hasta la correccion, tal como documenta el autor con `pi --print`. Es adecuado por su entrenamiento especifico en tareas de ingenieria de software con thinking.
- Automatizacion de terminal y operaciones: con un 57,5% en Terminal-Bench 2.1, sirve para tareas de shell, diagnostico de fallos y ejecucion de comandos encadenados en un agente.
- Analisis de capturas de pantalla y errores visuales: al ser image-text-to-text, puede interpretar una captura de terminal o de una interfaz y explicar el error mostrado, usando `mlx_vlm.generate --image`.
- Asistente de codigo integrado en el IDE o en un servidor local: se sirve con `mlx_lm.server` en el puerto 8000 con API compatible con OpenAI Chat Completions, lo que permite conectarlo a clientes existentes.
- Razonamiento con presupuesto de tokens ajustado: al reducir un 42% los tokens de salida en media en SWE-bench Pro frente al adaptador con thinking, es util en entornos donde el coste por token o la latencia importan.
- Prototipado de agentes en Mac sin GPU dedicada: con 23,4 GB de pico de memoria para un prompt de 8K tokens y 36 GB de RAM recomendados, permite ejecutar un agente de 27,8B en un Mac de gama alta.
- Evaluacion e investigacion de tecnicas de RL sobre agentes: el adaptador y sus variantes cuantizadas permiten reproducir el pipeline de AsyncGRPO y comparar fidelidad entre 4, 6 y 8 bits.

## Benchmarks y rendimiento

Resultados publicados por harness-hub bajo `pi`, con thinking activado y un intento por tarea:

| Benchmark | Qwen3.8-27B, thinking | pi-adapted, thinking | think-pi (este adaptador) |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 74,5% | 74,5% | 76,5% |
| Terminal-Bench 2.1 (87 tareas) | 60,9% | 59,8% | 57,5% |

El autor indica que las diferencias de puntuacion no son significativas y que el beneficio real esta en la eficiencia: aproximadamente un 42% menos de tokens de salida en media (35% en mediana) en Terminal-Bench 2.1 y un 42% menos en media en SWE-bench Pro respecto a pi-adapted con thinking.

Fidelidad de las cuantizaciones MLX publicadas por netprojects:

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Pico de memoria, prompt 8K | RAM de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (esta) | 23,1 GB | 98,8% | 0,0014 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,1% | 0,0004 | 44/50 | 29,7 GB | 48 GB+ |
| MLX-4bit | 16,3 GB | 96,0% | 0,0187 | 46/50 | 17,1 GB | 32 GB+ |
| MLX-bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

## Requisitos de hardware

- VRAM o memoria unificada: 23,4 GB de pico para un prompt de 8K tokens en la build de 6 bits; el autor recomienda 36 GB o mas de RAM en el Mac.
- Hardware objetivo: Apple Silicon con memoria unificada; no esta pensado para GPUs NVIDIA ni CUDA.
- Cabe en consumer hardware Apple: si, en equipos con 36 GB o mas (por ejemplo, configuraciones de MacBook Pro o Mac Studio con M3/M4 Max o superiores). La build de 4 bits baja a 17,1 GB de pico y 32 GB de RAM.
- Despliegue: `mlx-lm` (version 0.32.2 o superior) para texto y servidor compatible con OpenAI; `mlx-vlm` (0.7.11 o superior) para imagenes; integracion con el agente `pi` (Node.js 22.19 o superior). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa con la capa MTP puede acelerar la generacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit | 27,8B | no disponible | SWE-bench Pro 76,5%; Terminal-Bench 2.1 57,5% | Apache 2.0 | MLX, Apple Silicon |
| harness-hub/Qwen3.8-27B-pi-adapted (thinking) | 27,8B | no disponible | SWE-bench Pro 74,5%; Terminal-Bench 2.1 59,8% | Apache 2.0 | safetensors, adaptador |
| Qwen/Qwen3.8-27B (thinking) | 27,8B | no disponible | SWE-bench Pro 74,5%; Terminal-Bench 2.1 60,9% | Apache 2.0 | safetensors |
| netprojects/Qwen3.8-27B-think-pi-adapted-MLX-4bit | 27,8B | no disponible | GSM8K 46/50; fidelidad 96,0% | Apache 2.0 | MLX, Apple Silicon |

No se dispone de datos de benchmarks de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La build esta limitada a Apple Silicon y al ecosistema MLX; no es portable a CUDA ni a servidores x86 sin reconversion.
- El modelo se entreno y evaluo con thinking activado; desactivarlo puede degradar el rendimiento respecto a los numeros publicados.
- El formato de tool calls es el XML propietario de Qwen y requiere el servidor de `mlx-lm` para traducirlo a `tool_calls` de OpenAI; el autor advierte de usar la API Chat Completions y no la API Responses.
- El limite de salida de 32.768 tokens debe configurarse explicitamente (`maxTokens: 32768`) para no truncar el razonamiento largo.
- La cuantizacion de 6 bits introduce una divergencia KL de 0,0014 frente a bf16; la de 4 bits sube a 0,0187 y pierde un 4% de coincidencia en el siguiente token.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion proporcionada, pero son inherentes a un modelo de lenguaje de este tipo.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingue fuera del ingles.
- Longitud de contexto: no disponible; conviene verificar la ventana real del modelo base antes de usarlo en produccion con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.8-27B y del adaptador original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador hermano sin thinking: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-adapter
- Repositorio del agente pi: https://github.com/earendil-works/pi
