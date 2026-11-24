# pgmharikrishnan/Inkling-2-Mini-MLX-Serve-4bit

## Resumen

Inkling-2-Mini-MLX-Serve-4bit es una cuantizacion de 4 bits en formato MLX affine del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario pgmharikrishnan. El modelo base emplea la arquitectura propietaria `inkling2_loop`, un transformer con capas repetidas (looped transformer) y mezcla de expertos (MoE) con 128 expertos enrutados y activacion top-8. Esta version cuantizada esta pensada para ejecutarse en Apple Silicon mediante el servidor mlx-serve, con un peso total de 26.070.385.152 parametros (unos 26,07 mil millones) y un repositorio de 15,4 GB.

La relevancia de este paquete radica en que incluye la cabeza de borrador DSpark (`mtp.safetensors`) del checkpoint original, lo que habilita decodificacion especulativa nativa sobre el propio modelo. El autor reporta entre 1,78 y 3,44 borradores aceptados por ronda, con el valor maximo en prompts de codigo. La arquitectura `inkling2_loop` y la cabeza DSpark estan implementadas en una rama publica del servidor mlx-serve, lo que permite ejecutar el modelo de extremo a extremo en hardware Apple Silicon con 32 GB o mas de memoria unificada.

El modelo declara una longitud de contexto de 1.048.576 tokens en su `config.json`, aunque el contexto practico queda limitado por la memoria disponible. La licencia es Apache-2.0, heredada del modelo base. No se han publicado datos sobre idiomas soportados ni resultados de benchmarks estandar en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop`: transformer con capas repetidas (looped) y MoE; 24 capas fisicas con las capas 6..17 repetidas x3 (48 visitas de capa por token) |
| Parametros totales | 26.070.385.152 (26,07 mil millones) |
| Parametros activos | no disponible (MoE con 128 expertos enrutados y top-8, pero sin cifra de parametros activos publicada) |
| Longitud de contexto | 1.048.576 tokens segun `config.json`; contexto practico limitado por memoria |
| Tipos de cuantizacion | 4-bit MLX affine con `group_size=64` en expertos enrutados, proyecciones de atencion y `embed`/`unembed`; routers, controladores de bucle, residuales de atencion, pesos de convolucion corta (sconv) y normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards de pesos troncales + `mtp.safetensors` para la cabeza DSpark) |

## Arquitectura y entrenamiento

El tronco `inkling2_loop` consta de 24 capas fisicas, de las cuales las capas intermedias 6 a 17 se repiten tres veces, lo que da 48 visitas de capa por token. Incorpora BlockAttentionResidual cada 6 capas con valores residuales normalizados. La atencion no usa RoPE en la rama global: emplea un sesgo RelativeLogits (`d_rel = 16`, `rel_extent = 1024`) y cuatro convoluciones cortas por capa (`sconv_kernel_size = 4`); las capas de ventana deslizante usan una ventana de 1024 tokens. La capa MoE es un SwiGLU con softcap, 128 expertos enrutados, top-8, escala de ruta 8.0, softcap de puerta 4.0 y softcap de up 25.0, ademas de recorte L2 de QK y relative-logit y un softcap final de logits de 30.0.

El checkpoint incluye una cabeza de borrador DSpark de tipo `rnn_hidden` con `block_size = 8` y `markov_rank = 256`, que lee taps en las visitas de capa 5, 23, 41 y 48. La cabeza pliega `hidden_out` a traves del `unembed` del tronco como sesgo de logits, aplica softcap y toma argmax en cada fila de borrador. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto conversacional y completado de instrucciones, con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento con control de esfuerzo mediante `reasoning_effort` (rango 0.0-0.99); no existe flag `enable_thinking` y el valor 0.0 sigue emitiendo razonamiento breve.
- Generacion de codigo, con rendimiento de decodificacion especulativa especialmente alto en prompts de codigo (3,44 borradores aceptados por ronda).
- Decodificacion especulativa nativa mediante la cabeza DSpark, activable por peticion (`enable_mtp`) o a nivel de servidor (`--mtp`).
- Servicio compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/models`), incluyendo el reporte de capacidad `mtp_loaded`.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en local sobre Apple Silicon: el modelo puede generar funciones y completar tareas de programacion desde un Mac con 32 GB o mas de memoria unificada, aprovechando la decodificacion especulativa DSpark, que alcanza 3,44 borradores aceptados por ronda en prompts de codigo.
- Servicio de chat compatible con OpenAI en estaciones de trabajo Mac: mediante `mlx-serve serve --mtp` se expone un endpoint `/v1/chat/completions` que clientes existentes pueden consumir sin cambios en el codigo.
- Prototipado de aplicaciones conversacionales con contexto largo: la ventana declarada de 1.048.576 tokens permite procesar documentos extensos, aunque en la practica el limite lo marca la memoria (pico medido de 15,15 GB).
- Evaluacion de arquitecturas looped transformer y MoE: investigadores pueden reproducir el comportamiento de las 48 visitas de capa por token y estudiar el efecto de la repeticion de capas en calidad y latencia.
- Investigacion sobre decodificacion especulativa: la cabeza DSpark incluida permite medir tasas de aceptacion y comparar con otras estrategias de drafting sin entrenar una cabeza propia.
- Despliegue de bajo coste en hardware de consumo: al caber en 15,2 GB de memoria en cuantizacion de 4 bits, el modelo se ejecuta en Macs de gama alta sin GPU dedicada, con 39,1-39,3 tok/s de decodificacion.
- Control de esfuerzo de razonamiento en produccion: el parametro `reasoning_effort` permite ajustar el coste de inferencia por peticion segun la dificultad de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Si se han publicado metricas de rendimiento de inferencia medidas en Apple Silicon sin decodificacion especulativa:

| Metrica | Valor |
|---|---|
| Decodificacion | 39,1-39,3 tok/s |
| Prefill | 204,6-206,3 tok/s |
| Memoria pico | 15,15 GB |
| Borradores DSpark aceptados por ronda | 1,78-3,44 (3,44 en prompts de codigo) |
| Operaciones por forward | 10.809 (sin fusionar) |

## Requisitos de hardware

- VRAM/memoria unificada: pico medido de 15,15 GB; se recomienda Apple Silicon con 32 GB o mas de memoria unificada.
- GPU recomendadas: Apple Silicon (M-series) con 32 GB o mas de memoria unificada; no se documenta soporte para GPU NVIDIA o AMD en esta informacion.
- Cabe en GPU de consumo: si, en Macs Apple Silicon de gama alta; no se dispone de datos para GPUs de consumo NVIDIA.
- Opciones de despliegue: servidor `mlx-serve` compilado con Zig desde la rama `inkling2-loop-support`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 39,1-39,3 tok/s de decodificacion y 204,6-206,3 tok/s de prefill en Apple Silicon sin decodificacion especulativa; la decodificacion especulativa con DSpark mejora la aceptacion de borradores, pero no se publica el throughput resultante.
- Nota de rendimiento: el forward actual esta sin fusionar con 10.809 operaciones por paso; la fusion de `depthAttention`, `router` y `messageGate` es la siguiente optimizacion conocida.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La siguiente tabla recoge unicamente los datos disponibles del modelo frente al modelo base del que deriva:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-Serve-4bit | 26,07 mil millones | 1.048.576 tokens | 4-bit MLX affine | Apache-2.0 | safetensors (MLX) |
| thinkingmachines/Inkling-2-Mini | no disponible | 1.048.576 tokens (heredado) | no disponible (checkpoint original con expertos en NVFP4/MXFP8) | Apache-2.0 | safetensors |

No se dispone de informacion sobre alternativas de la misma categoria (mismo tamano o misma tarea) para establecer una comparativa adicional.

## Limitaciones y advertencias

- La cache de prefijo queda desactivada para `inkling2_loop`: las instantaneas de cache de prefijo se omiten porque el estado KV del bucle es propiedad del modulo por visita, y una restauracion no puede reconstruirlo.
- No existe flag `enable_thinking`; solo se expone `reasoning_effort` en el rango 0.0-0.99, y el valor 0.0 sigue emitiendo razonamiento breve, lo que impide desactivar por completo el razonamiento.
- El contexto practico esta limitado por la memoria disponible, muy por debajo de los 1.048.576 tokens declarados en `config.json`.
- El forward esta sin fusionar (10.809 operaciones por paso), lo que deja margen de mejora en latencia y throughput.
- La decodificacion especulativa DSpark es opcional y debe activarse por peticion (`enable_mtp`) o a nivel de servidor (`--mtp`); sin ella no se aprovecha la cabeza de borrador.
- Solo se documenta ejecucion en Apple Silicon mediante `mlx-serve`; no hay soporte documentado para otros backends ni GPUs.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion ni idiomas soportados del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero se heredan las condiciones del modelo base thinkingmachines/Inkling-2-Mini, que conviene revisar antes de desplegar en produccion.
- El modelo base fue cuantizado desde un checkpoint con expertos en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), dequantizados a bf16 y recuantizados; esta cadena de conversion puede introducir perdida adicional de precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pgmharikrishnan/Inkling-2-Mini-MLX-Serve-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Rama del servidor mlx-serve con soporte `inkling2_loop`: https://github.com/pgmharikrishnan/mlx-serve/tree/inkling2-loop-support
- Convertidor usado para generar el paquete: `tests/convert_inkling2_loop.py` en la rama `inkling2-loop-support`
- Papers, blogs y demos adicionales: no disponible
