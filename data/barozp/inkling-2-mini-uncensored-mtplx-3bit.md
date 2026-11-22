# barozp/Inkling-2-Mini-Uncensored-MTPLX-3bit

## Resumen

Inkling-2-Mini-Uncensored-MTPLX-3bit es un empaquetado cuantizado a 3 bits del modelo OpenUncensored/Inkling-2-Mini-Uncensored, una variante "abliterated" (sin comportamiento de rechazo) de Inkling 2 Mini. Lo publica el usuario barozp en Hugging Face y está pensado específicamente para decodificación especulativa en Apple Silicon mediante el runtime MTPLX 2.13 o superior. Incluye la cabeza borradora DSpark del propio modelo, que propone hasta siete tokens que el modelo completo verifica en una sola pasada, preservando la distribución original de salida.

El modelo base es un transformer con mezcla de expertos (MoE) y arquitectura "looped transformer", con 25.815.417.876 parámetros totales según los safetensors del repositorio. El pack ocupa 15,24 GB en disco, mantiene la atención en 8 bits y está dimensionado para Macs con 24 GB de memoria unificada. Soporta entrada image-text-to-text, lo que indica capacidades de visión además de texto.

La relevancia de esta ficha es doble: por un lado documenta un caso concreto de cuantización mixta GPTQ sobre MLX con cabeza de decodificación especulativa; por otro, advierte de que en Mac el hermano MLX-3bit sin cabeza borradora resulta más rápido en la práctica, por lo que este pack solo tiene sentido en infraestructuras ya construidas sobre MTPLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con looped transformer (según tags del autor) |
| Parametros totales | 25.815.417.876 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han probado prompts de 31.543 tokens con recuperación tipo needle 3/3) |
| Tipos de cuantizacion | 3 bits mixto (GPTQ), atención en 8 bits, proyecciones attention-sink y short-conv en BF16 |
| Idiomas soportados | no disponible (se han probado prompts en inglés y turco) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), incluye mtp.safetensors con la cabeza DSpark |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini emplea una arquitectura de mezcla de expertos con diseño de transformer "looped", según los tags del autor, e incorpora una cabeza de predicción multi-token (MTP) denominada DSpark. Esa cabeza se entrenó contra el modelo original y propone hasta siete tokens candidatos por paso, que el modelo completo verifica en una única pasada; el resultado mantiene la distribución del modelo, por lo que la decodificación especulativa no altera las salidas. El checkpoint base ha sido sometido a un proceso de "abliteration" para eliminar el comportamiento de rechazo, y esta versión cuantizada conserva los códigos GPTQ del release MLX-3bit bit a bit, sin paso intermedio de desquantización y recuantización.

La única diferencia respecto al release MLX-3bit es que las 32 proyecciones de pesos de attention-sink y short-conv, que allí van en 8 bits, aquí provienen directamente de la fuente en BF16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La fidelidad frente a la fuente, medida con teacher forcing en mlx-lm, es de divergencia KL 0,0130 en texto crudo y 0,0686 en conversaciones con plantilla de chat, con una concordancia top-1 del 96,19 % y 91,37 % respectivamente.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat soportada.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado en MMLU, ARC-Challenge, Winogrande y HellaSwag).
- Generación de código: se han probado prompts de funciones Python y listas de consejos JavaScript con resultados de velocidad publicados.
- Entrada image-text-to-text, lo que implica soporte de visión según el pipeline declarado.
- Decodificación especulativa mediante la cabeza DSpark integrada, con profundidad configurable (probada a profundidad 3).
- Capacidades multilingües parciales: se han realizado pruebas con preguntas en turco, aunque no se documenta la lista completa de idiomas.
- Sin filtrado de contenido adicional: el checkpoint es "uncensored" y cumple peticiones que el modelo original rechazaría.

## Casos de uso

- Inferencia local en Macs de 24 GB de memoria unificada: el pack está dimensionado para caber con un pico de 17,2 GB en los prompts probados y 18,1 GB con un prompt de 3.779 tokens, lo que permite ejecutar un modelo de 25,8 mil millones de parámetros en hardware de consumo Apple.
- Aceleración de generación de código en Apple Silicon: con DSpark a profundidad 3 se alcanzan 36,2 tok/s en prompts de funciones Python frente a 25,2 tok/s en modo autorregresivo, una mejora de 1,44x útil en asistentes de programación interactivos.
- Despliegue en pipelines ya basados en MTPLX: si la infraestructura existente usa el runtime MTPLX 2.13 o superior, este pack evita migrar a mlx-lm y aprovecha la cabeza borradora incluida.
- Experimentación con decodificación especulativa en CUDA: la ruta portable MLX de MTPLX permite medir la aceptación de borradores en GPUs como la A100, con 43,6 % de borradores aceptados y 2,32 tokens por ronda de verificación.
- Investigación sobre alineación y comportamiento de rechazo: al ser una variante abliterated, sirve para estudiar qué peticiones deja de rechazar el modelo original y cómo afecta la cuantización a ese comportamiento.
- Evaluación comparativa de cuantizaciones: al compartir códigos GPTQ con el release MLX-3bit, permite aislar el efecto de la cabeza especulativa frente a la cuantización en experimentos controlados.
- Procesamiento de documentos largos: la recuperación tipo needle se mantiene 3/3 a 7.931 y 31.543 tokens, lo que habilita tareas de extracción de información en contextos extensos dentro de las limitaciones de memoria.

## Benchmarks y rendimiento

Calidad, medida sobre el hermano MLX-3bit con los mismos códigos cuantizados, con lm-evaluation-harness 0.4.13, 0-shot, loglikelihood y plantilla de chat desactivada:

| Tarea | Métrica | Fuente (20 GB) | Este trunk | Delta | ± stderr |
|---|---|---:|---:|---:|---:|
| mmlu (2.847 preguntas) | acc | 0,7856 | 0,7891 | +0,0035 | 0,0073 |
| arc_challenge (1.172 preguntas) | acc_norm | 0,6911 | 0,6954 | +0,0043 | 0,0134 |
| winogrande (1.267 preguntas) | acc | 0,7127 | 0,7103 | -0,0024 | 0,0127 |
| hellaswag (1.000 preguntas) | acc_norm | 0,6480 | 0,6420 | -0,0060 | 0,0152 |
| media | | 0,7094 | 0,7092 | -0,0002 | |

Velocidad en Apple M5 Pro, 24 GB de memoria unificada, macOS 27.2.1, MTPLX 2.13.0, perfil serve por defecto, chunks de prefill de 512 tokens, decodificación greedy, DSpark profundidad 3:

| Prompt | AR tok/s | DSpark tok/s | vs AR | Tokens por ronda de verificación | Borradores aceptados |
|---|---:|---:|---:|---:|---:|
| Función Python (código) | 25,2 | 36,2 | 1,44x | 2,56 | 156/300 |
| Por qué el cielo es azul | 25,6 | 36,5 | 1,43x | 2,52 | 146/288 |
| Pregunta en turco | 25,7 | 29,1 | 1,13x | 2,01 | 128/380 |
| Consejos JavaScript (lista) | 25,7 | 31,2 | 1,21x | 2,21 | 140/345 |
| media | 25,5 | 33,3 | 1,30x | 2,32 | 570/1313 (43,4 %) |

Velocidad en CUDA (Google Colab A100 80 GB), ruta portable MLX de MTPLX 2.13, greedy, profundidad 3, 200 tokens nuevos por prompt:

| Prompt | AR tok/s | D3 tok/s | vs AR | Tokens por ronda de verificación | Borradores aceptados |
|---|---:|---:|---:|---:|---:|
| Función Python (código) | 3,81 | 5,59 | 1,47x | 2,63 | 124/227 |
| Por qué el cielo es azul | 3,78 | 5,67 | 1,50x | 2,44 | 118/244 |
| Pregunta en turco | 3,29 | 4,77 | 1,45x | 2,12 | 105/279 |
| Consejos JavaScript (lista) | 3,64 | 4,71 | 1,29x | 2,10 | 104/284 |
| media | 3,63 | 5,19 | 1,43x | 2,32 | 451/1034 (43,6 %) |

## Requisitos de hardware

- VRAM/memoria unificada: 15,24 GB en disco; pico de 17,2 GB en los prompts de prueba y 18,1 GB con un prompt de 3.779 tokens en un Mac de 24 GB.
- Macs de 24 GB de memoria unificada: viables con `--prefill-chunk-tokens 512` en el perfil serve. Sin ese perfil, un prompt de 3.779 tokens alcanzó 24,5 GB y provocó swap.
- GPU recomendadas: Apple M5 Pro (probado); en CUDA se validó en A100 80 GB mediante la ruta portable MLX, con rendimiento muy inferior al nativo.
- GPU de consumo: no hay datos publicados para RTX 4090 u otras GPUs de consumo; la ruta CUDA probada usa MLX portable, no kernels Metal ni CUDA nativos.
- Opciones de despliegue: MTPLX 2.13 o superior (runtime principal); el hermano MLX-3bit está pensado para mlx-lm.
- Latencia y throughput: 25,5 tok/s en autorregresivo y 33,3 tok/s con DSpark en M5 Pro; 3,63 y 5,19 tok/s respectivamente en A100 con la ruta portable. Prefill de 957 tok/s en el hermano MLX-3bit con mlx-lm. El pack carga en menos de un minuto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Este repo (MTPLX-3bit) | 25,8 mil millones | no disponible | safetensors MLX + DSpark | Apache 2.0 | 15,24 GB; 33,3 tok/s con DSpark en M5 Pro |
| barozp/Inkling-2-Mini-Uncensored-MLX-3bit | 25,8 mil millones | no disponible | safetensors MLX | Apache 2.0 | Mismos códigos GPTQ sin cabeza borradora; 38,3 tok/s en mlx-lm en el mismo Mac |
| barozp/Inkling-2-Mini-MTPLX-3bit | 25,8 mil millones | no disponible | safetensors MLX + DSpark | Apache 2.0 | Pack oficial con DSpark; acepta 2,48 tokens por ronda en CUDA y 2,52 en Mac, frente a 2,32 de este pack |
| OpenUncensored/Inkling-2-Mini-Uncensored | 25,8 mil millones | no disponible | safetensors | Apache 2.0 | Modelo fuente sin cuantizar, 20 GB; referencia de calidad (media 0,7094) |

## Limitaciones y advertencias

- Modelo "uncensored" y abliterated: cumple peticiones que el modelo original rechazaría. No se aplica filtrado de contenido adicional más allá del propio checkpoint; el uso debe respetar la legislación local y la licencia.
- En Mac, el hermano MLX-3bit es más rápido (38,3 tok/s frente a 25,5 tok/s en autorregresivo). Este pack solo compensa en entornos ya basados en MTPLX.
- La cabeza DSpark se entrenó contra el modelo original, no contra el tronco abliterated, por lo que acepta menos borradores que el pack oficial (2,32 frente a 2,48 tokens por ronda en CUDA).
- Riesgo de swap en Macs de 24 GB si se omite el perfil serve con chunks de prefill de 512 tokens.
- La ruta CUDA probada es portable MLX y no usa kernels nativos; los tok/s en A100 no son representativos de un despliegue optimizado.
- No se documentan los idiomas soportados ni el sesgo del modelo base; las pruebas multilingües se limitan a turco e inglés.
- La longitud de contexto oficial no está publicada; las pruebas de recuperación llegan a 31.543 tokens, pero no se garantiza ese límite en producción.
- La cuantización a 3 bits introduce una divergencia KL de 0,0686 en conversaciones con plantilla de chat y una concordancia top-1 del 91,37 %, lo que puede afectar a tareas sensibles a la fidelidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Hugging Face: https://huggingface.co/barozp/Inkling-2-Mini-Uncensored-MTPLX-3bit
- Modelo base: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Hermano MLX-3bit: https://huggingface.co/barozp/Inkling-2-Mini-Uncensored-MLX-3bit
- Pack oficial MTPLX-3bit: https://huggingface.co/barozp/Inkling-2-Mini-MTPLX-3bit
- Runtime MTPLX: https://github.com/youssofal/mtplx
