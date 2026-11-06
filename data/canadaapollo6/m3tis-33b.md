# CanadaApollo6/M3TiS-33B

## Resumen

M3TiS-33B es una redistribución optimizada para inferencia local del modelo Nanbeige4.3-33B, publicada por el usuario CanadaApollo6. No se trata de un modelo entrenado desde cero, sino de una reconstrucción del pipeline de ejecución: pesos cuantizados en formato EXL3 a 3,5 bits por peso, una cabeza de decodificación especulativa (draft head) de 5 capas entrenada específicamente sobre respuestas del propio Nanbeige, y un servidor propio derivado del motor Zig TensorFold con kernels para EXL3, el draft head y un almacén de contexto de 4 bits.

El objetivo declarado es hacer viable un modelo de aproximadamente 33B de parámetros en una GPU de consumo de 24 GB (RTX 3090, A10) manteniendo una ventana de contexto de 81.920 tokens. Según las mediciones del autor en una NVIDIA A10, el sistema alcanza 73 tokens/s en generación de código con decodificación greedy, frente a 27 tokens/s de llama.cpp con un GGUF Q3_K_M en la misma tarjeta, lo que supone una mejora de aproximadamente 2,7×.

La relevancia actual reside en que combina tres técnicas poco habituales juntas en un mismo artefacto empaquetado: cuantización EXL3 calibrada sobre datos del modelo base, decodificación especulativa con draft head entrenado ad hoc, y un servidor con API compatible con OpenAI listo para desplegar. El repositorio ocupa 20,9 GB e incluye pesos, draft head y binario del servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Nanbeige4.3-33B); draft head de 5 capas para decodificación especulativa |
| Parámetros totales | 8.374.082.560 (según safetensors del repo); el nombre comercial indica 33B sobre el modelo base |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 81.920 tokens (4-bit context store); 16.384 tokens con `TF_LLAMA_KV_BITS=16` |
| Tipos de cuantización | EXL3 a 3,5 bits por peso (calibrada sobre texto del modelo base); contexto en 4 bits o 16 bits |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3); binario nativo `tensorfold-native` para servir |

## Arquitectura y entrenamiento

El modelo base es Nanbeige4.3-33B, un transformer decoder-only orientado a agentes y tool calling. M3TiS-33B no reentrena ese backbone: lo cuantiza con EXL3 a 3,5 bits por peso, calibrando la cuantización sobre las propias respuestas de chat y de agente del modelo original. El autor reporta una divergencia KL de 0,036 sobre respuestas de chat y 0,066 sobre turnos de agente respecto al original en bf16.

La innovación principal es el draft head: una red de 5 capas que predice los siguientes 8 tokens y que el modelo de 33B verifica en una sola pasada. Se entrenó sobre 36.000 respuestas generadas por el propio Nanbeige, y según el autor acierta aproximadamente 5 tokens por pasada en código. La decodificación especulativa es verificada por el modelo grande, por lo que no altera la distribución de salida: con almacén de contexto de 16 bits, la salida greedy coincide token a token con la greedy sin draft. El servidor es un port del motor Zig TensorFold con kernels específicos para EXL3, el draft head y el almacén de contexto de 4 bits.

## Capacidades

- Generación de texto conversacional multirretorno con modo de razonamiento (thinking) activado por defecto, separando `reasoning_content` de `content`.
- Razonamiento multi-paso y resolución de tareas de agente, heredado del modelo base Nanbeige4.3-33B.
- Tool calling / function calling, con soporte en el servidor y validado en tareas de Terminal-Bench 2 mediante el agente de código pi.
- Generación de código, con el mayor beneficio de la decodificación especulativa (73 tokens/s en el ejemplo de Fibonacci con thinking).
- Capacidades multilingües limitadas a inglés y chino.
- Ventana de contexto larga de hasta 81.920 tokens con almacén de 4 bits, útil para conversaciones y prompts extensos.
- API compatible con OpenAI (`/chat/completions`, `/completions`, `/models`) en `http://127.0.0.1:8080/v1`.
- Decodificación especulativa activa tanto en muestreo como en greedy (`temperature: 0`).
- No se mencionan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistencia de código en local: el modelo alcanza 73 tokens/s en generación de código con thinking en una A10, lo que permite usarlo como copiloto interactivo en una estación de trabajo con RTX 3090 sin depender de la nube.
- Agentes de terminal automatizados: validado sobre 19 tareas de Terminal-Bench 2 con el agente pi, resolviendo una media de 11,3 tareas por intento, comparable al modelo bf16 original (11,0), por lo que es adecuado para pipelines de agentes que ejecutan comandos y editan ficheros.
- Servicio de chat con contexto largo: con 81.920 tokens de ventana y decodificación a 12 tokens/s tras un prompt de 61K, sirve para resúmenes y análisis de documentos extensos en una sola tarjeta.
- Backend compatible con OpenAI para herramientas internas: al exponer `/v1/chat/completions`, se integra sin cambios en aplicaciones que ya usan el SDK de OpenAI, con control de puerto (`PORT`) y ventana (`CONTEXT`) por variables de entorno.
- Tool calling en asistentes de negocio: el soporte de function calling y el modo thinking permiten encadenar llamadas a APIs (por ejemplo, consultas meteorológicas en varias ciudades) con 66 tokens/s en greedy.
- Despliegue en hardware de consumo para investigación: cabe en 24 GB con un pico de 20,4 GB (15,1 GiB de pesos y draft head, 4,6 GiB de contexto), dejando 2 GiB libres para el escritorio, lo que facilita experimentación con modelos de ~33B en una sola GPU.
- Evaluación de técnicas de aceleración: al incluir draft head, cuantización EXL3 y servidor propio, sirve como banco de pruebas reproducible para estudiar decodificación especulativa y cuantización de contexto.

## Benchmarks y rendimiento

Rendimiento medido por el autor en una NVIDIA A10 (24 GB, sm_86) el 2026-10-30, un solo usuario, ventana de 81.920 tokens y almacén de contexto de 4 bits, mediana de 3 ejecuciones tras calentamiento. Comparación con llama.cpp (commit 792fcf4) sobre GGUF Q3_K_M de bartowski (14,8 GiB) con flash attention.

| Respuesta, tokens/s | M3TiS-33B greedy | M3TiS-33B muestreo Nanbeige | llama.cpp Q3_K_M |
|---|---|---|---|
| Código (Fibonacci, con thinking) | 73 | 61 | 27 |
| Chat (explicación de multiplicación de matrices) | 40 | 34 | 27 |
| Tool call (tiempo en dos ciudades, 89 tokens) | 66 | 61 | 27 |
| Tras prompt de 16K tokens | 22 | no disponible | 18 |
| Tras prompt de 61K tokens | 12 | no disponible | 9 |

| Lectura de prompt | M3TiS-33B | llama.cpp Q3_K_M |
|---|---|---|
| 16K tokens | 48 s | no medido |
| 61K tokens | 273 s | 138 s |
| Siguiente turno de la misma conversación | 8 s tras 16K, 14 s tras 61K | no disponible |

Sin el draft head, el servidor decodifica a 17 tokens/s, por debajo de llama.cpp. El primer token de un prompt corto llega en 0,17 s.

Calidad: en 19 tareas de Terminal-Bench 2, 3 intentos cada una, con el agente pi sobre exllamav3:

| Build | Tareas resueltas por intento (de 19), media de 3 |
|---|---|
| Nanbeige4.3-33B bf16 (vLLM) | 11,0 |
| Estos pesos (exllamav3) | 11,3 (10, 12, 12) |

La diferencia se reporta como ruido (p = 1,0). El build de 3,5 bits usó 1,21× los tokens por tarea resuelta. El servidor coincide token a token con exllamav3 en una respuesta greedy de 128 tokens, con KL de 0,00005 entre predicciones.

## Requisitos de hardware

- VRAM estimada: pico de 20,4 GB con ventana de 81.920 tokens (15,1 GiB de pesos y draft head, 4,6 GiB de contexto), reservando 2 GiB libres.
- Coste de contexto: aproximadamente 57 MB por cada 1K tokens con almacén de 4 bits y 200 MB con el de 16 bits.
- GPU recomendadas: NVIDIA A10 (24 GB, sm_86) es la plataforma medida; RTX 3090 (24 GB) es el objetivo declarado, con mediciones pendientes de publicar. Cabe en GPUs consumer de 24 GB; no se especifican requisitos para tarjetas de menor VRAM.
- Despliegue: servidor propio `tensorfold-native` incluido en el repo (`./m3tis-serve.sh`), con API compatible con OpenAI. La información no menciona soporte para vLLM, llama.cpp, Ollama ni TGI con estos pesos EXL3; los pesos bf16 del modelo base pueden servirse con vLLM según la comparación citada.
- Latencia y throughput: primer token en 0,17 s para prompt corto; 48 s para leer 16K tokens y 273 s para 61K; decodificación de 12 a 73 tokens/s según carga. La lectura de prompts es aproximadamente 2× más lenta que llama.cpp.
- Ajuste fino de memoria: `CONTEXT=…` reduce la ventana si otros programas ocupan la GPU; `TF_LLAMA_KV_BITS=16 CONTEXT=16384` activa contexto de 16 bits para conversaciones más cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M3TiS-33B | 8,37B en safetensors (base ~33B) | 81.920 tokens (4-bit) | 73 tokens/s en código en A10; 11,3/19 en Terminal-Bench 2 | apache-2.0 | Hugging Face, 52 descargas |
| Nanbeige4.3-33B (bf16) | ~33B | no disponible en la información | 11,0/19 en Terminal-Bench 2 con vLLM | no disponible en la información | Hugging Face (modelo base) |
| Nanbeige4.3-33B GGUF Q3_K_M (bartowski) | ~33B | no disponible en la información | 27 tokens/s en A10 con llama.cpp | no disponible en la información | Hugging Face |

La comparación directa con otras familias de modelos del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El almacén de contexto de 4 bits es con pérdida: frente al de 16 bits, en nueve conversaciones largas (20K, 60K y 100K tokens) desplaza las predicciones con KL medio de 0,013 a 0,16 en siete casos y de 0,9 y 1,6 en dos casos difíciles.
- La lectura de prompts es aproximadamente 2× más lenta que llama.cpp (273 s frente a 138 s para 61K tokens), lo que penaliza cargas con prompts largos y pocas respuestas.
- Solo soporta inglés y chino; no hay soporte declarado de castellano.
- El autor advierte que el modelo base está pensado para agentes y que el modo thinking está activado por defecto; `max_tokens` cuenta tanto el razonamiento como la respuesta, lo que puede truncar salidas si no se ajusta.
- Las mediciones publicadas son en A10, no en RTX 3090; el propio autor indica que las mediciones en 3090 están pendientes.
- El repositorio tiene 52 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día (2026-10-30), lo que implica poca validación externa.
- No se han publicado datos sobre sesgos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Nanbeige4.3-33B, cuya licencia no se detalla en la información proporcionada.
- El servidor es un port de TensorFold y requiere ejecutar un binario nativo (`bin/tensorfold-native`) con permisos de ejecución; no se documentan plataformas distintas de CUDA sm_86.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CanadaApollo6/M3TiS-33B
- Modelo base Nanbeige4.3-33B: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- GGUF Q3_K_M de bartowski: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Motor TensorFold: https://github.com/ashhart/TensorFold
- llama.cpp: https://github.com/ggml-org/llama.cpp
