# roboalchemist/DeepSeek-V4.1-Flash-1017-MXFP4-Engram

## Resumen

Este repositorio no contiene un modelo completo, sino un reempaquetado de las dos tablas Engram de `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicado por el usuario `roboalchemist`. Las tablas originales están en FP8 E4M3 con escalas UE8M0 por bloque de 32 y cada una ocupa 91,55 GiB como tensor indivisible, por lo que ambas requieren unos 183 GiB de memoria de host al hacer offload. Este repo las convierte a MXFP4 (nibbles E2M1 y escalas UE8M0 por 32), reduciendo cada tabla a 48,64 GiB y el conjunto a 97,3 GiB de RAM pinned.

La relevancia es práctica: con este empaquetado, la búsqueda Engram puede ejecutarse en el kernel de GPU sobre UVA, sin gather de host por paso, y se pueden usar CUDA graphs estándar. El autor lo valida en 6 GPU CMP 170HX de 64 GiB (SM80) con vLLM 0.13.0 y un parche que porta el PR #61530, con contexto configurado de 1.048.576 tokens, tool calling y recuperación de una aguja de 21,3K tokens. La licencia del repo es MIT, pero el checkpoint base no se incluye y debe ensamblarse.

El coste principal es que la cuantización de Engram es lossy: el error RMS relativo frente a las tablas FP8 es del 12,1% con cuantización RTN ingenua. No hay benchmarks estándar publicados en la información disponible; las pruebas aportadas son criterios cualitativos de validación y medidas de throughput en el hardware citado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo base DeepSeek-V4.1-Flash-1017; este repo contiene las tablas Engram de las capas 1 y 14 reempaquetadas. Arquitectura completa no disponible. |
| Parámetros totales | No disponible para el modelo completo. |
| Parámetros activos | No disponible; no se confirma si el modelo base es MoE en la información proporcionada. |
| Longitud de contexto | 1.048.576 tokens en el ejemplo de servicio del autor (`--max-model-len 1048576`); no confirmado como máximo nativo del modelo base. |
| Tipos de cuantización | Engram: MXFP4 (E2M1 + escalas UE8M0 por bloque de 32). Tablas originales: FP8 E4M3 + UE8M0/32. Resto del checkpoint base: cuantización original no detallada. |
| Idiomas soportados | No disponible. |
| Licencia | MIT para este repositorio. Licencia del modelo base no disponible en la información proporcionada. |
| Formato de pesos | `safetensors`. Tablas empaquetadas: `uint8 [rows, 128]` + escalas `uint8 [rows, 8]`. Incluye `config.json` y `model.safetensors.index.json`. |
| Modelo base | `deepseek-ai/DeepSeek-V4.1-Flash-1017` |
| Entradas Engram | 196.613.849.600 en total: 384.006.168 x 256 en la capa 1 y 384.016.682 x 256 en la capa 14. |
| Tablas Engram empaquetadas | 2 tablas de 48,64 GiB cada una; 97,3 GiB de RAM pinned para ambas. |
| Tamaño del repo | 104,8 GB. |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: solo cuantiza y reempaqueta las tablas Engram del checkpoint base. La información disponible no documenta la arquitectura completa, los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO. El comando de servicio incluye `--enable-expert-parallel`, pero no se aporta el número de expertos ni de parámetros activos.

Las tablas Engram son dos embeddings de n-gramas situados en las capas 1 y 14, con 384.006.168 x 256 y 384.016.682 x 256 entradas. En el checkpoint original se almacenan como un único tensor FP8 E4M3 de 91,55 GiB cada uno, con escalas UE8M0 por bloque de 32; ese tamaño impide dividirlos y obliga a unos 183 GiB de host al hacer offload. El autor las reempaqueta a MXFP4 con E2M1 (nibble bajo para la columna par) y escalas UE8M0 por 32, y añade `quantization_config.engram_embed_quant: "mxfp4"` para que vLLM lo detecte. También mueve los tensores auxiliares `q_weight`, `k_weight`, `wkv.weight` y `wkv.scale` de los shards 47/48 a ficheros separados, de modo que esos shards del base puedan descartarse. El PR #61530 implementa la decodificación empaquetada en vLLM.

## Capacidades

- Generación de texto coherente: el autor valida `"The capital of France is"` → `"Paris."` en el checkpoint ensamblado.
- Chat y razonamiento: se reporta que pasan los criterios de validación de chat y razonamiento, sin métricas cuantitativas.
- Tool calling estilo OpenAI: validado con `finish_reason=tool_calls`.
- Recuperación en contexto largo: aguja de 21,3K tokens recordada en frío (3,9 s) y desde prefix cache (0,8 s).
- Ventana de 1.048.576 tokens configurada en vLLM; el límite real depende de la memoria y del modelo base.
- Decodificación especulativa DSpark con `k=5` en la configuración de servicio; no es una capacidad del repo, sino del despliegue validado.
- Multilingüe: no disponible.
- Visión y audio: no disponible.
- Agentes multi-paso: no validado explícitamente; solo se confirma tool calling y razonamiento.

## Casos de uso

- Despliegue del modelo base en clústeres SM80 con memoria de host limitada: ensamblar el checkpoint con los shards 1-46 del base y las tablas MXFP4 de este repo reduce el espacio pinned de Engram de ~183 GiB a 97,3 GiB, lo que permite ejecutar la búsqueda en GPU sobre UVA y mantener CUDA graphs en vLLM.
- Atención al cliente multi-turno con contexto largo: usar la ventana de 1.048.576 tokens para mantener historial, políticas y datos de CRM; el tool calling validado permite consultar APIs de pedidos o tickets dentro de la conversación.
- Análisis de documentos extensos y recuperación de hechos: la prueba de aguja de 21,3K tokens y la caché de prefijos (3,9 s en frío, 0,8 s restaurado) encajan en revisión de contratos, manuales técnicos o expedientes con preguntas repetidas.
- Orquestación de flujos con function calling: integrar el endpoint OpenAI de vLLM en un backend que llame a herramientas internas (búsqueda, bases de datos, calendario) y devuelva `tool_calls`; el autor confirma ese `finish_reason`.
- Servicio de chat y razonamiento en infraestructura legacy: la configuración validada usa 6 GPU CMP 170HX de 64 GiB y ofrece 133,8 tok/s de salida a concurrencia 4 y 142,6 tok/s a concurrencia 8, adecuado para cargas internas de baja concurrencia.
- Evaluación de cuantización de tablas Engram: usar el empaquetador y el error del 12,1% RMS como línea base para comparar RTN con AutoRound u otros esquemas antes de producción.
- Prototipos de asistentes con caché de prefijos: activar `--enable-prefix-caching` para reutilizar system prompts y bases de conocimiento; el autor mide una restauración de 0,8 s frente a 3,9 s en frío para la misma aguja.
- Investigación de despliegue de vLLM en SM80: probar el backport del PR #61530, DSpark `k=5` y `FULL_AND_PIECEWISE` con `VLLM_USE_BREAKABLE_CUDAGRAPH=1` en entornos sin torch-compile.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos aportados son pruebas de validación y rendimiento del autor, no benchmarks estándar:

| Prueba | Resultado |
|---|---|
| Error de cuantización RTN frente a tablas FP8 | 12,1% RMS relativo (E2M1 por bloque de 32) |
| Coherencia básica | `"The capital of France is"` → `"Paris."` |
| Chat y razonamiento | Superado, sin métrica numérica |
| Tool calling OpenAI | `finish_reason=tool_calls` |
| Aguja de 21,3K tokens, en frío | 3,9 s |
| Aguja de 21,3K tokens, desde prefix cache | 0,8 s |
| Throughput de salida, concurrencia 1 | 32–75 tok/s; mejor de 3: 74,7 tok/s |
| Throughput de salida, concurrencia 4 | 133,8 tok/s |
| Throughput de salida, concurrencia 8 | 142,6 tok/s |
| Prefill | ~3.017 tok/s a 8K; ~3.705 tok/s a 32K |
| Memoria de host | ~162 GiB usados, ~89 GiB disponibles; 97,3 GiB pinned |

## Requisitos de hardware

- VRAM: no disponible. El autor no publica la VRAM ocupada por GPU. La configuración validada usa 6 GPU CMP 170HX de 64 GiB (SM80), con TP1 x PP6.
- Memoria de host: 97,3 GiB pinned para las dos tablas Engram. En la ejecución del autor, ~162 GiB usados y ~89 GiB disponibles, lo que implica un host de ~251 GiB de RAM total en esa prueba.
- GPU recomendadas: CMP 170HX de 64 GiB (SM80) es la única validada. No hay datos para A100, H100, RTX 4090 u otras GPUs.
- GPU consumer: no se ha validado; el repo pesa 104,8 GB y el despliegue validado usa 6 GPU de 64 GiB, por lo que no se espera que quepa en una GPU consumer típica.
- Opciones de despliegue: vLLM 0.13.0 con el parche `engram_fp4_patch.py` o una compilación que incluya el PR #61530. Flags del ejemplo: `--attention-backend TRITON_
