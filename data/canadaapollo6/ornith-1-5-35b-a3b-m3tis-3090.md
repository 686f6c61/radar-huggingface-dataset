# CanadaApollo6/Ornith-1.5-35B-A3B-M3TiS-3090

## Resumen

Ornith-1.5-35B-A3B-M3TiS-3090 es una cuantización comunitaria del modelo MoE ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario CanadaApollo6. Se trata de un build de 34.660.610.688 parámetros totales (unos 34,66B) con aproximadamente 3B de parámetros activos por token, empaquetado en 16 GB de repositorio, junto con un servidor de inferencia nativo escrito en Zig (motor TensorFold) de 10 MB. Su objetivo es ejecutar el modelo completo con la ventana de contexto íntegra de 262.144 tokens en una única GPU consumer de 24 GB, la NVIDIA RTX 3090.

La innovación principal es la estrategia de cuantización asimétrica: los expertos enrutados de las 40 capas se comprimen a 3 bits mediante una búsqueda ponderada por importancia, mientras que las partes siempre activas (atención, atención lineal y experto compartido) se mantienen a 4 bits. Los enrutadores quedan a 8 bits y las normalizaciones y convoluciones a 16 bits, todo en formato afín de MLX con tamaño de grupo 64. El modelo incorpora además una cabeza de borrador MTP (multi-token prediction) propia que actúa como decodificación especulativa sin necesidad de descargar un segundo modelo.

Es relevante ahora porque demuestra que un MoE de 35B puede servirse a velocidades de 400-545 tokens/s con 262K de contexto en hardware de gama alta para consumidores, sin CUDA toolkit, Python ni PyTorch en el servidor. El modelo base destaca, según sus autores, en tareas de código y agentes, superando a pares del mismo tamaño como Qwen 3.6-35B. La licencia del build es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion, atencion lineal, experto compartido y cabeza borradora MTP; 40 capas |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | ~3B por token (no disponible el desglose exacto) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Expertos enrutados 3 bits; atencion, atencion lineal y experto compartido 4 bits; enrutadores 8 bits; normalizaciones y convoluciones 16 bits. Formato afin MLX, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors con formato afin de MLX; servidor de inferencia nativo en Zig (TensorFold) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es el miembro de tamano medio de la familia Ornith 1.5, una arquitectura de mezcla de expertos (MoE) que activa aproximadamente 3B de parametros por token sobre un total de 35B. Segun la documentacion del autor, el modelo combina atencion estandar, atencion lineal, un experto compartido siempre activo y una cabeza de prediccion multitoken (MTP) que sirve como borrador para decodificacion especulativa. El entrenamiento del base se enmarca en el marco de "self-scaffolding" de Ornith-1.0, extendido en Ornith-1.5 hacia un bucle de auto-mejora en el que el modelo propone tareas, genera andamiajes especificos y produce rollouts de solucion para aprendizaje por refuerzo. No se dispone de mas detalle sobre composicion del dataset, numero de tokens de entrenamiento ni fases concretas de RLHF/DPO.

La contribucion de este build concreto (denominado R1s por el autor) es la cuantizacion. Los expertos de las 40 capas se comprimen a 3 bits mediante una busqueda ponderada por importancia, y las partes siempre activas se redondean a 4 bits con el mismo metodo en lugar de redondeo plano. Las embeddings, el lm_head y la cabeza MTP se heredan sin cambios del build MLX 4-bit de Ornith; los enrutadores se toman a 8 bits y las normalizaciones y convoluciones a 16 bits. Segun el autor, la busqueda ponderada recupera la mayor parte de la brecha frente a un build todo a 4 bits sin el coste extra de 4 GB. La decodificacion especulativa usa la cabeza MTP integrada, y el autor afirma que cada token es verificado por el modelo de 35B, de modo que la salida no cambia respecto a la inferencia sin borrador.

## Capacidades

- Generacion de texto conversacional y respuestas de chat, con modo "thinking" desactivable mediante el flag `--no-thinking`.
- Generacion de codigo: el autor reporta tareas como escribir una funcion de Fibonacci con velocidades de hasta 545 tokens/s.
- Razonamiento agente y multiturno: el modelo base se posiciona como fuerte en tareas agenticas y de codigo.
- Tool calling / function calling: la documentacion menciona conversaciones con llamadas a herramientas usadas para medir la divergencia KL.
- Recuperacion en contexto largo: en pruebas propias, encontro un numero oculto en el centro de prompts de hasta 199K tokens.
- Decodificacion especulativa integrada mediante cabeza MTP, sin modelo borrador externo.
- Servidor con API compatible con OpenAI (`/chat/completions`, `/completions`, `/models`).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Servicio de chat local en una sola GPU: desplegando el servidor Zig incluido, se levanta una API compatible con OpenAI en `http://127.0.0.1:8080/v1` con la ventana completa de 262K tokens en una RTX 3090, apta para asistentes personales o internos sin coste de nube.
- Asistencia de codigo en el IDE: con velocidades de 545 tokens/s en codigo, el modelo puede alimentar autocompletado y generacion de funciones en tiempo casi interactivo dentro de flujos de desarrollo.
- Analisis de repositorios y documentos largos: gracias a la ventana de 262K y a la recuperacion verificada en prompts de 199K, permite resumir o consultar bases de codigo y expedientes extensos sin troceado agresivo.
- Agentes autonomos de terminal: el build fue evaluado en Terminal-Bench 2 bajo distintos harness (pi, prime_agent, Claude Code), por lo que es adecuado para agentes que ejecutan comandos y resuelven tareas de sistema.
- Pipelines de CI/CD con llamadas a herramientas: su soporte de tool calling y su API compatible con OpenAI permiten integrarlo en automatizaciones que invocan funciones, tests o scripts.
- Procesamiento por lotes en hardware unico: al requerir solo ~17-21 GiB de VRAM, se pueden encolar tareas batch de resumen, clasificacion o generacion sobre una unica RTX 3090 sin infraestructura adicional.
- Evaluacion e investigacion de cuantizacion: sirve como caso de estudio reproducible de cuantizacion asimetrica (3/4/8/16 bits) con metricas de divergencia KL publicadas.

## Benchmarks y rendimiento

Datos publicados por el autor para este build, medidos en una RTX 3090 con ventana de 262K, un solo usuario y respuestas de 256 tokens (mediana de 3 ejecuciones):

| Metrica | Valor |
|---|---|
| Codigo, greedy / sampled (T=1.0) | 545 / 480 tokens/s |
| Chat sin thinking, greedy / sampled | 403 / 367 tokens/s |
| Primer token en prompts cortos | 17-25 ms |
| Lectura de prompt de 21K tokens | 3,7 s (5.590 tokens/s) |
| Lectura de prompt de 52K tokens | 12,2 s (4.300 tokens/s) |
| Lectura de prompt de 199K tokens | 95 s (2.080 tokens/s) |
| Respuesta con prompt de 45K | 274 tokens/s con borrador, 186 sin borrador |
| Memoria maxima con ventana 262K | 17,2 GB (incluyendo ~1,3 GB del escritorio) |
| Divergencia KL frente a bf16 | 0,229 (ruido de base ~0,04; 4-bit plano 0,260) |
| Terminal-Bench 2 (19 tareas puntuables, harness pi) | 10,0 de media (Q8_0 oficial: 10,3; p = 1,0) |
| DeepSWE bajo Claude Code (10 tareas, 1 intento) | 2 resueltas (bf16: 1) |
| Terminal-Bench 2 completo (89 tareas) | 33 bajo Claude Code, 35 bajo prime_agent, 40 bajo pi |

Datos del modelo base recogidos en la busqueda web:

| Metrica | Valor |
|---|---|
| BenchAlign leaderboard | 35,55/100, posicion 157 de 220 |

El autor senala que el error de cuantizacion es el unico componente con perdida, que la decodificacion especulativa no altera las salidas y que las evaluaciones de agentes se ejecutaron con los mismos pesos en el motor Python de TensorFold.

## Requisitos de hardware

- GPU: NVIDIA RTX 3090 (sm_86, 24 GB). Otras tarjetas sm_86 con 24 GB deberian funcionar, pero no estan probadas.
- VRAM: pico medido de 17,2 GB con la ventana completa de 262K. El servidor solicita ~21,3 GiB libres a 262K (pesos, espacio de trabajo y 1 GiB de reserva) o ~18,8 GiB con `CONTEXT=131072`. Si otros programas ocupan la GPU, el servidor indica cuanto falta y sugiere una ventana menor.
- Sistema: Linux x86-64 con glibc 2.28 o superior y CPU con AVX2 (Intel 2013+, AMD 2015+).
- Controlador: NVIDIA con soporte de CUDA 13 (R580 o superior). Probado en 615.71.09.
- Dependencias: el servidor es autocontenido, con kernels compilados; no requiere CUDA toolkit, Python ni PyTorch.
- Cabe en GPU consumer: si, en RTX 3090 y presumiblemente otras sm_86 de 24 GB; no esta confirmado en tarjetas de 16 GB.
- Despliegue: servidor propio basado en el motor Zig de TensorFold con API compatible con OpenAI. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI en este build.
- Latencia y throughput: primer token de 17-25 ms en prompts cortos; hasta 545 tokens/s en codigo y 403 en chat; respuestas a 274 tokens/s con borrador en prompts de 45K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-M3TiS-3090 (este) | 34,66B totales, ~3B activos | 262K | Expertos 3 bits, resto 4 bits, formato MLX; servidor Zig | MIT | Optimizado para RTX 3090; ~15-16 GB de pesos |
| Ornith-1.5-35B-A3B (bf16, base) | 35B totales, ~3B activos | no disponible | bf16 | no disponible | Referencia de calidad del build; sin cuantizar |
| Ornith-1.5-35B-A3B-MLX-4bit | 35B totales, ~3B activos | no disponible | MLX afin, 4 bits en todo | no disponible | Mas pesado (+4 GB) que este build; KL ~0,22 en muestra menor |
| Qwen 3.6-35B | no disponible | no disponible | no disponible | no disponible | Citado por el autor como par de mismo tamano; el base lo supera en codigo y agentes |

## Limitaciones y advertencias

- La cuantizacion introduce perdida: la divergencia KL de 0,229 frente a bf16 es superior al ruido de base de ~0,04, aunque inferior al redondeo plano a 4 bits (0,260).
- Solo esta probado en RTX 3090 y otras sm_86 con 24 GB; el rendimiento en otras arquitecturas no esta verificado.
- Requiere Linux x86-64 con glibc 2.28+ y CPU AVX2; no se documenta soporte para Windows, macOS ni ARM.
- El motor Zig y el motor Python de TensorFold difieren en el orden de sumatorio: en pruebas del autor, las respuestas greedy divergen tras 13-63 tokens, aunque el efecto se mide en el ruido de base.
- En Terminal-Bench 2 el build resuelve 10,0 de 19 frente a 10,3 del Q8_0 oficial, con diferencia no significativa (p = 1,0) y consumo de 1,28x tokens (IC 95%: 0,92-1,86).
- Los idiomas soportados no estan documentados, por lo que no se puede garantizar cobertura multilingue ni calidad fuera del ingles.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan tasas de error especificas.
- No se documentan sesgos conocidos en la informacion disponible.
- Aunque la licencia es MIT, conviene verificar la licencia del modelo base ornith-ai/Ornith-1.5-35B-A3B antes de uso comercial, ya que este dato aparece como "no disponible".
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.
- La model card esta fechada en octubre de 2026 y hace referencia a modelos comparativos (Qwen 3.6, Gemma 4, Muse Glimmer) cuyos datos no se pueden verificar de forma independiente.

## Enlaces

- HuggingFace del build: https://huggingface.co/CanadaApollo6/Ornith-1.5-35B-A3B-M3TiS-3090
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build MLX 4-bit del base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit
- Build MLX 6-bit del base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit
- Motor TensorFold (GitHub): https://github.com/machinegenieorg/TensorFold
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Benchmarks de Ornith-1.5-35B-A3B: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Imagen Docker ai/ornith-1.5: https://hub.docker.com/r/ai/ornith-1.5
