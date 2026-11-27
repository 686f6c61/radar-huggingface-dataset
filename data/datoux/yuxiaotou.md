# DatouX/Yuxiaotou

## Resumen

Yuxiaotou es una compilación optimizada y adaptada al chino del modelo `thinkingmachines/Inkling-2-Mini`, publicada por el usuario DatouX en Hugging Face. Se distribuye como artefactos ejecutables del motor NInfer v3 (formato `.ninfer`), no como pesos estándar en safetensors o GGUF, y está pensada para desplegarse íntegramente en GPU de consumo con un contexto de 65.536 tokens y sin offload a CPU. El modelo base es un MoE multimodal nativo con torre de visión ViT, un drafter MTP de tres capas (DSpark) para decodificación especulativa y un bucle de tres pasadas que eleva los parámetros efectivos por token.

La propuesta diferencial es el empaquetado en tres niveles de VRAM (16, 12 y 8 GB) mediante poda guiada por enrutamiento de expertos MoE sin recuantización, de modo que la misma calidad de atención y visión se mantiene mientras se recortan expertos enrutados para ajustarse a GPUs más modestas. Incluye además integración con el agente de escritorio Inkstone (砚) y un conjunto de flags de lanzamiento calibrados por dispositivo.

Es relevante ahora porque demuestra una vía práctica para ejecutar un MoE multimodal de 26.400 millones de parámetros totales en tarjetas consumer (RTX 5070 Ti, RTX 2060, RTX 5060) con métricas de rendimiento medidas y verificadas, incluyendo recuperación exacta en contexto largo y caché de prefijo persistente entre reinicios del servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (ViT + transformer MoE con bucle de 3 pasadas) con drafter MTP DSpark de 3 capas |
| Parametros totales | 26.4B |
| Parametros activos | 3.4B activos / 5.4B efectivos (3-pass looped MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | Q8_0 en atención (120 tensores en 24 capas), torre de visión Q8_0, drafter Q8_0; KV cache en `rk8v4` o `rk4v4` |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefactos del motor NInfer v3), no safetensors ni GGUF estándar |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un MoE multimodal nativo que combina una torre de visión ViT con un transformer disperso de 26.400 millones de parámetros totales y 3.400 millones activos, ampliados a 5.400 millones efectivos mediante un bucle de tres pasadas. Incorpora un drafter MTP (multi-token prediction) denominado DSpark de tres capas que actúa como modelo de decodificación especulativa. Esta build de Yuxiaotou aplica un ajuste supervisado (Stage 3 SFT) orientado al chino sobre los pesos de atención, manteniendo intactos la torre de visión y el drafter en Q8_0.

La adaptación a distintos niveles de VRAM se realiza mediante poda de expertos MoE guiada por enrutamiento y sin recuantización (byte-exact), reduciendo de 128/128 expertos enrutados (16 GB) a 88/128 (12 GB) y 56/128 (8 GB). El paquete incluye un parche nativo para arquitecturas Blackwell SM120 con PDL y SFU (CUDA 13.5, `-DCMAKE_CUDA_ARCHITECTURES=120a`), cuatro parches CUDA propios y una calibración de dispositivo que, según el autor, aporta un 17,6 % de mejora en decodificación. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multimodal imagen-texto (pipeline `image-text-to-text`).
- Procesamiento de imágenes mediante torre ViT Q8_0 con residencia en GPU configurable (`overlay`).
- Decodificación especulativa con DSpark (hasta 7 tokens de borrador) y `--adaptive-mtp`.
- Modo de razonamiento con seis niveles (`none / minimal / low / medium / high / xhigh`) y preservación del bloque de pensamiento (`--preserve-thinking`).
- Soporte de agente multi-paso: el bucle medido incluye lectura, edición de código de 10,4K tokens, ejecución en bash y respuesta final en chino.
- Integración con el agente de escritorio Inkstone mediante `prompt_cache_key` para checkpoints de anclaje largo.
- Caché de prefijo persistente entre reinicios del servidor (`--prefix-cache-file` y `POST /shutdown`).
- Capacidades multilingües limitadas a chino e inglés.
- Tool calling y function calling: no se documenta explícitamente en la información disponible.

## Casos de uso

- Agente de escritorio para edición de código: el bucle Inkstone medido (lectura, edición de 10,4K tokens, bash y respuesta) se ejecuta en 5,86 s de pared en una RTX 5070 Ti, lo que lo hace viable para asistentes interactivos de programación en local.
- Automatización de tareas de shell y CI local: con tool calling implícito vía agente y contexto de 65.536 tokens, puede encadenar lecturas de repositorio, parches y verificación en pipelines de desarrollo sin salir de la máquina.
- Análisis de documentos e imágenes largos: la verificación de aguja en 41.505 tokens con 100 % de recuperación exacta lo habilita para extracción de información en contratos, informes o capturas de pantalla combinadas con texto.
- Asistente en chino para equipos hispanohablantes que operan en mercados asiáticos: el ajuste SFT en chino y la respuesta final en zh medida (194,1 t/s) lo orientan a atención y documentación bilingüe zh/en.
- Despliegue en estaciones de trabajo con GPU modesta: la variante de 8 GB (56/128 expertos, 5,33 GiB) permite ejecutar el modelo en una RTX 5060 con `--kv-dtype rk4v4` y `--prefill-chunk 512`.
- Servicio local con caché de prefijo: la reutilización del primer turno de 10.482 tokens en 120,6 ms (99,7 % de acierto) frente a 2.624 ms en frío reduce la latencia en sesiones repetidas de soporte o revisión de código.
- Prototipado de investigación multimodal: al ser Apache 2.0 y ejecutable en consumer, sirve para experimentar con MoE multimodal y decodificación especulativa sin clúster.

## Benchmarks y rendimiento

Mediciones del autor en RTX 5070 Ti 16 GB, contexto de 65.536 y visión activa, sobre un bucle de agente de 5 turnos:

| Configuracion | Pared 5 turnos | Prefill agregado | Decode agregado | Decode pico | Tok/ronda | Arranque en frio |
|---|---:|---:|---:|---:|---:|---:|
| Prebuilt antiguo (DSpark 3, high, temp=1.0) | 11,59 s | 3.347 t/s | 169,6 t/s | 168,4 t/s | 2,62 | no disponible |
| Prebuilt + calibrado + Inkstone Turbo | 5,84 s | 3.400 t/s | 206,1 t/s | 262,8 t/s | 3,52 | 4,63 s |
| SM120 nativo + PDL + SFU + 4 parches (high, temp=1.0) | 7,42 s | 3.560 t/s | 219,3 t/s | 267,8 t/s | 3,54 | 4,05 s |
| SM120 nativo + PDL + SFU + 4 parches + Inkstone Turbo | 5,86 s (659 tok) | 3.510 t/s (delta 8,7K: 3.976 t/s) | 226,9 t/s (+33,8 %) | 267,7 t/s | 3,81 | 4,05 s |

Otras mediciones:

| Prueba | Resultado |
|---|---|
| `ninfer_bench` sin especulación | pp2048 = 3.850,4 t/s; pp8192 = 4.139,2 t/s; tg128 = 133,98 t/s |
| Aguja en contexto largo (41.505 tokens) | 100 % de recuperación exacta; prefill 3.899 t/s; decode 158,2 t/s; pico VRAM 14.596/16.303 MiB (1,7 GiB libres) |
| Caché de prefijo persistente tras reinicio | 10.452/10.482 tokens (99,7 %) en 120,6 ms frente a 2.624 ms en frío (21,8×) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 9,58 GiB (16 GB), 7,22 GiB (12 GB) y 5,33 GiB (8 GB) para los tres artefactos; pico medido de 14.596 MiB en la variante de 16 GB con contexto largo.
- GPU recomendadas: RTX 5070 Ti 16 GB (SM120), RTX 2060 12 GB (SM75) y RTX 5060 8 GB (SM120); arquitecturas SM75, SM80, SM86, SM89 y SM120a soportadas por el binario multi-arquitectura.
- Cabe en GPU consumer: sí, en las tres tarjetas objetivo, con residencia 100 % en GPU y cero offload a CPU.
- Despliegue: motor NInfer v3 con binarios SM120+PDL o multi-arquitectura; scripts `start_inkling_ninfer.ps1` y `stop_inkling_ninfer.ps1`; calibración local con `ninfer-calibrate.exe`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Flags por nivel: 16 GB con `--kv-dtype rk8v4 --prefill-chunk 2048`; 12 GB con `rk8v4` y `--prefill-chunk 1024`; 8 GB con `rk4v4` y `--prefill-chunk 512`.
- Latencia y throughput: ver tabla de benchmarks; el autor advierte que usar `--prefill-chunk 4096` en 16 GB o `rk8v4` con chunk 2048 en 8 GB provoca spill a RAM compartida WDDM y reduce el throughput a la mitad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato de despliegue |
|---|---|---|---|---|---|
| Yuxiaotou (Inkling-2-Mini) | 26,4B totales / 3,4B activos | 65.536 | Sí (ViT) | Apache 2.0 | `.ninfer` (NInfer v3) |
| thinkingmachines/Inkling-2-Mini | 26,4B totales / 3,4B activos | no disponible | Sí (ViT) | no disponible | pesos del modelo base |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está ajustado para chino e inglés; el rendimiento en castellano no está documentado.
- Solo se publican dos idiomas (`zh`, `en`), lo que restringe su uso en producción multilingüe.
- La poda de expertos en las variantes de 12 y 8 GB reduce la capacidad del MoE (88/128 y 56/128 expertos) y puede degradar la calidad frente a la variante completa; no se aportan métricas de calidad por nivel.
- El formato `.ninfer` ata el despliegue al motor NInfer v3 y a sus binarios por arquitectura; no es portable a vLLM, llama.cpp u otros runtimes sin conversión.
- La variante de 8 GB exige `rk4v4` y chunk 512; configuraciones más agresivas provocan spill a RAM del sistema y pérdida de rendimiento.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `thinkingmachines/Inkling-2-Mini` no declara licencia en la información disponible, por lo que conviene verificar la cadena de licencias antes de explotación comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- El autor advierte de que la calibración por dispositivo es crítica (+17,6 % de decodificación) y de que las máquinas RTX 5060 y RTX 2060 deben calibrarse localmente.

## Enlaces

- Hugging Face: https://huggingface.co/DatouX/Yuxiaotou
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Parche SM120 + PDL: `patches/ninfer-sm120-pdl-4patches.diff` (incluido en el repositorio)
- Configuraciones Inkstone: `configs/inkstone-models.json.snippet` y `configs/inkstone-local-models.json.snippet`
- Perfil calibrado de referencia: `configs/device-profile-rtx5070ti-sm120.json`
- Scripts de lanzamiento: `scripts/start_inkling_ninfer.ps1` y `stop_inkling_ninfer.ps1`
- Paper, blog o demo adicionales: no disponible
