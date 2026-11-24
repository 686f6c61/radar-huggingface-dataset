# netprojects/SenseNova-Loop-9B-Preview-MLX-8bit

## Resumen

SenseNova-Loop-9B-Preview es un modelo de lenguaje de aproximadamente 8.960 millones de parametros desarrollado por SenseNova (SenseTime) y publicado el 30 de octubre de 2026. Se trata de un transformer basado en Qwen3.5 al que se le anaden dos innovaciones arquitectonicas: ejecucion en bucle (looped execution) de las capas intermedias y un mecanismo de dos flujos residuales denominado mHC (multi-stream hidden channels). El resultado es una profundidad efectiva de 56 pasadas de capa por token a partir de solo 32 capas fisicas.

La ficha que nos ocupa documenta la conversion a formato MLX en cuantizacion 8-bit realizada por NetProjects (Internet Projects Ltd), pensada para ejecucion en Apple Silicon. Esta build reproduce fielmente el comportamiento del modelo original de SenseNova, con una concordancia del 97,6 % en el token mas probable y una divergencia KL de 0,0011 respecto a la implementacion de referencia en PyTorch bf16.

Su relevancia actual radica en que demuestra que es posible aumentar la profundidad efectiva de un modelo sin incrementar el numero de parametros, a costa de un mayor coste computacional por token (unas 56 pasadas de capa). La version Preview no incluye entrada de imagen ni decodificacion MTP; para esas capacidades el autor remite a la release final SenseNova-Loop-9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con ejecucion en bucle y mHC de dos flujos (sensenova_loop) |
| Parametros totales | 8.956.947.840 (8,96 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (esta build); existen 6-bit y 4-bit en el mismo repositorio de autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx, mlx-lm >= 0.32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5 y anade dos modificaciones estructurales. La primera es la ejecucion en bucle: las capas 0-3 se ejecutan una vez, las capas 4-27 se ejecutan dos veces compartiendo pesos y las capas 28-31 se ejecutan una vez, lo que da 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de cache (KV cache para atencion completa; estado convolucional y recurrente para Gated DeltaNet). La segunda es el mecanismo mHC de dos flujos en las capas 4-27: el estado oculto se divide en dos flujos residuales enrutados por pequenos routers en float32 (compuertas pre/post y una matriz de mezcla 2x2 de Sinkhorn con 20 iteraciones). Los 96 tensores de router permanecen en float32 y no se cuantizan.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente indica que el modelo soporta un modo de razonamiento (thinking mode) activable mediante `enable_thinking=True` en la plantilla de chat, lo que sugiere un entrenamiento orientado a razonamiento, aunque no se detalla el proceso. La implementacion MLX se distribuye como `sensenova_loop.py` y se carga con `trust_remote_code=True`.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Razonamiento con modo thinking opcional (activado por plantilla de chat).
- Razonamiento matematico basico, evidenciado por los resultados en GSM8K.
- Resolucion de preguntas de opcion multiple de nivel escolar y cientifico (ARC-Challenge).
- Soporte de conversaciones multi-turno mediante plantilla de chat.
- Servido como API local a traves de `mlx_lm.server`.
- No incluye entrada de imagen en esta build (la vision llega en la release final SenseNova-Loop-9B).
- No se documenta soporte explicito de tool calling, function calling ni capacidades de agente multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse integramente en un MacBook Pro con chip M5 Max y 128 GB de memoria unificada, sin conexion a la nube, gracias a los 9,6 GB de pesos en 8-bit y al soporte nativo de mlx-lm.
- Prototipado de razonamiento en Apple Silicon: util para investigadores que quieran experimentar con arquitecturas en bucle y mHC sin depender de GPU NVIDIA, usando el modo thinking para tareas que requieran cadenas de razonamiento.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece builds en 8, 6 y 4 bits con metricas de concordancia y divergencia KL frente a la referencia bf16, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantizacion en arquitecturas no convencionales.
- Servicio de generacion de texto en local mediante `mlx_lm.server`, adecuado para entornos de desarrollo o demos internas donde no se quiera enviar datos a terceros.
- Tareas de pregunta-respuesta de opcion multiple y razonamiento cientifico de nivel basico, dado el rendimiento observado en ARC-Challenge (48,7 % de exactitud).
- Educacion y divulgacion: al ser Apache 2.0 y ejecutable en hardware de consumo Apple, sirve para talleres y cursos sobre modelos de lenguaje sin requerir infraestructura de GPU dedicada.
- Investigacion sobre eficiencia arquitectonica: permite medir en hardware real el coste de duplicar pasadas de capa frente a aumentar parametros, con una velocidad de decodificacion de referencia de unos 18 tokens/s en M5 Max.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversion (NetProjects), medidos en MacBook Pro M5 Max de 128 GB el 7 de noviembre de 2026. La comparativa de benchmark publico usa las primeras 300 preguntas de test de ARC-Challenge (log-likelihood sobre 4 opciones) y las primeras 50 de GSM8K (plantilla de chat, thinking desactivado, greedy).

| Metrica | bf16 | 8-bit | 6-bit | 4-bit |
|---|---|---|---|---|
| ARC-Challenge acc | 48,7 | 48,7 | 47,7 | 45,7 |
| ARC-Challenge acc_norm | 51,0 | 50,3 | 49,0 | 45,0 |
| GSM8K (50 preguntas) | no disponible | 94,0 | 88,0 | 92,0 |
| Concordancia con referencia (top token) | referencia | 97,6 % | 97,2 % | 89,2 % |
| Divergencia KL en ultimo token | referencia | 0,0011 | 0,0037 | 0,064 |
| Tamano de pesos | no disponible | 9,6 GB | 7,3 GB | 5,1 GB |

Nota del autor: en GSM8K con 50 preguntas cada pregunta vale 2 puntos, por lo que las diferencias de 2-6 puntos entre builds no son estadisticamente concluyentes. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,6 GB de pesos en 8-bit, mas overhead de cache KV y estados recurrentes (no cuantificado en la informacion disponible); en la practica se recomienda al menos 16 GB de memoria unificada para 8-bit y 12 GB para 4-bit.
- Hardware objetivo: Apple Silicon exclusivamente (formato MLX). El autor reporta pruebas en MacBook Pro M5 Max con 128 GB.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por esta build, que depende de mlx-lm.
- Cabe en GPU de consumo Apple: si, en chips M-series con memoria unificada suficiente; no aplica a GPU discretas de consumo.
- Opciones de despliegue: mlx-lm >= 0.32 con Python >= 3.11, y servidor mediante `mlx_lm.server --model ... --trust-remote-code`. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: aproximadamente 18 tokens/s en decodificacion sobre M5 Max (ejecucion corta). El bucle duplica el trabajo de las 24 capas intermedias, por lo que es mas lento que un modelo denso de 9B convencional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/hardware | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview (esta build) | 8,96 B | no disponible | Apache 2.0 | MLX 8-bit, Apple Silicon | 56 pasadas de capa por token, ~18 tok/s en M5 Max |
| SenseNova-Loop-9B (release final) | no disponible | no disponible | Apache 2.0 | MLX 6/8/4-bit y bf16, Apple Silicon | Incluye vision y decodificacion MTP (~1,7x mas rapido) |
| Qwen3.5 (modelo base) | no disponible | no disponible | no disponible | no disponible | Arquitectura de partida sin bucle ni mHC |
| Modelo denso de ~9B convencional | ~9 B | no disponible | variable | variable | Referencia de velocidad: sin duplicacion de capas, mas rapido por token |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria mas alla de las builds del propio autor. La comparacion con Qwen3.5 y con modelos densos de ~9B es estructural, no de rendimiento.

## Limitaciones y advertencias

- Esta build es exclusiva de Apple Silicon (MLX); no puede desplegarse en GPU NVIDIA ni en entornos x86.
- No incluye entrada de imagen ni decodificacion MTP; para esas capacidades hay que usar la release final SenseNova-Loop-9B.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar cargas de contexto largo con garantias.
- Los idiomas soportados no estan documentados; no se puede asumir un rendimiento multilingue equivalente al de Qwen3.5 sin verificacion.
- La arquitectura en bucle implica un coste computacional notablemente superior al de un modelo denso de 9B: unas 56 pasadas de capa por token y ~18 tok/s en M5 Max.
- Los benchmarks publicados son muy reducidos (300 preguntas de ARC-Challenge y 50 de GSM8K), por lo que las diferencias entre cuantizaciones no son concluyentes.
- Riesgo de alusionacion no cuantificado: no se han publicado evaluaciones de veracidad ni de sesgos.
- La model card advierte de que NetProjects no esta afiliado a SenseTime/SenseNova; los pesos son una conversion de terceros, no una publicacion oficial.
- Licencia Apache 2.0 permite uso comercial, pero al ser una modificacion de pesos originales conviene conservar los avisos de licencia y atribucion incluidos en el repositorio.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar `sensenova_loop.py` antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-8bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Release final SenseNova-Loop-9B: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build 6-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-6bit
- Build 4-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-4bit
- Build final 6-bit (recomendada por el autor): https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build final 8-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build final 4-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Build final bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- SenseNova 6.8 Code2Video MLX: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-6bit
- Codigo, conversor y scripts de paridad: https://github.com/internet-projects/sensenova-loop-mlx
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
