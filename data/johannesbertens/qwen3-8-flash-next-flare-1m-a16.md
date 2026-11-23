# JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-A16

## Resumen

Qwen3.8-Flash-Next-FLARE-1M-A16 es un paquete de runtime preparado para servir el modelo multimodal Qwen3.8-Flash-Next (publicado por NVIDIA como `nvidia/Qwen3.8-Flash-Next-FP4-Local`, checkpoint `b9ce18a6`) con una ventana de contexto extendida de 262.144 a 1.048.576 tokens (1M) mediante interpolación de RoPE tipo YaRN de factor 4, sin modificar la temperatura de atención. Lo publica el usuario JohannesBertens sobre el motor de inferencia Flare de NVIDIA (repositorio `NVIDIA/hyperflare-inference`), y no es un modelo entrenado desde cero sino un artefacto de despliegue: mismos pesos, misma interpolación y mismas capacidades que el paquete por defecto, con una única diferencia técnica.

Esa diferencia es la precisión de activaciones en los expertos enrutados durante la decodificación: el paquete fuerza `--force-moe-decode-a16`, de modo que los expertos NVFP4 multiplican activaciones de 16 bits (W4A16) en decodificación y verificación especulativa, en lugar de las activaciones FP4 por defecto (W4A4). El prefill mantiene activaciones A4 calibradas en grafos separados. El objetivo es eliminar el error de cuantización de activaciones FP4 de los expertos, a cambio de una pérdida de rendimiento de aproximadamente el 7 % en decodificación frente al paquete A4.

Es relevante ahora porque demuestra un patrón de despliegue de contexto ultralargo en una sola GPU Blackwell de 96 GB (RTX PRO 6000, SM120), con recuperación exacta de aguja a 1.040.052 tokens y una caché KV medida de 20,1 GiB que aloja 1.445.888 tokens KV. El paquete está pensado para entornos controlados: exige una versión concreta del motor Flare (ABI de ejecución 6, contrato de modelo preparado 2) y una GPU GB202.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con expertos MoE enrutados, pesos NVFP4; paquete de runtime Flare con RoPE YaRN factor 4 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el paquete indica decodificación A16 en expertos enrutados, pero no publica el recuento) |
| Longitud de contexto | 1.048.576 tokens (extendido desde 262.144 nativos; `RopeScaling(4.0, 262144)`) |
| Tipos de cuantizacion | NVFP4 en pesos (W4); activaciones A16 en decodificación/verificación especulativa y A4 calibradas en prefill; MXFP8 mencionado en tags; sin GGUF ni otras cuantizaciones publicadas |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | Paquete de runtime Flare propietario (revisión `gb202`, ~106,9 GB empaquetados); no safetensors ni GGUF estándar |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-Flash-Next en su variante FP4 local de NVIDIA, un transformer multimodal con mezcla de expertos cuyos expertos enrutados se almacenan en NVFP4. Este repositorio no aporta entrenamiento propio: es un paquete preparado por el toolchain de Flare que fija el checkpoint `b9ce18a6`, aplica interpolación de RoPE tipo YaRN declarada en el manifiesto (factor 4 sobre una base de 262.144, sin cambio de temperatura de atención) y compila un plan de ejecución de 73,5 GiB con 85 asignaciones, 84 grafos CUDA y 5.298 kernels distribuidos en 5.273 módulos.

La innovación técnica del paquete es doble. Por un lado, la decodificación especulativa MTP con 5 tokens borrador por defecto y anchos de verificación de 1 a 6, con una aceptación de borradores medida del 40-57 %. Por otro, el forzado de activaciones de 16 bits en los expertos enrutados durante la generación (`force_moe_decode_a16: true`, registrado en el manifiesto de reconstrucción), que separa los grafos de prefill (A4 calibrado) de los de decodificación (A16). El paquete declara capacidades preparadas de concurrencia 8 y chunk de prefill de 4096, con tablas de embedding en RAM de host y caché de prefijo de 256 GB en host.

## Capacidades

- Generación de texto y conversación multimodal image-text-to-text, según el pipeline declarado del checkpoint base.
- Razonamiento de contexto ultralargo: recuperación exacta de información (needle retrieval) verificada a 268.051 y 1.040.052 tokens con caché fría.
- Decodificación especulativa MTP integrada, con anchos de verificación de 1 a 6 y aceptación de borradores del 40-57 %.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`, `/v1/models`), con `max_model_len: 1048576`.
- Concurrencia preparada para 8 peticiones simultáneas y 157 slots de snapshot compartido.
- Soporte de tool calling, function calling y comportamiento de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios y bases de código completas: con 1.048.576 tokens de contexto, el modelo puede ingerir árboles de código extensos, historiales de commits y documentación en una sola ventana, útil para auditorías de seguridad o refactorizaciones que requieren coherencia global.
- Procesamiento de expedientes legales o regulatorios: contratos, anexos y correspondencia de cientos de miles de tokens se pueden consultar sin troceado, reduciendo la pérdida de contexto entre fragmentos que introduce el RAG clásico.
- Revisión de historiales clínicos o de investigación longitudinal: la recuperación exacta a más de un millón de tokens permite localizar un dato concreto dentro de un corpus documental masivo en una única pasada (medido en 143,7 s a 1.040.052 tokens con caché fría).
- Asistentes sobre documentación técnica extensa: manuales, especificaciones y RFC acumulados en una ventana de 1M tokens, servidos por API compatible con OpenAI para integrarse en aplicaciones existentes sin cambios de cliente.
- Evaluación de calidad de cuantización en producción: el paquete A16 sirve como referencia para medir la degradación introducida por activaciones FP4 en los expertos, comparándolo con el paquete A4 sobre el mismo checkpoint y hardware.
- Despliegue en una sola GPU para prototipado de contexto largo: con 73,5 GiB de plan de dispositivo y 20,1 GiB de caché KV en una RTX PRO 6000 Blackwell de 96 GB, permite validar cargas de trabajo de 1M tokens sin clúster multi-GPU.
- Investigación sobre decodificación especulativa: los anchos de verificación configurables y la tasa de aceptación medida lo hacen útil para estudiar el equilibrio entre velocidad y precisión en MTP.

## Benchmarks y rendimiento

Los datos disponibles son medidas de serving del propio autor, no benchmarks académicos (MMLU, HumanEval, GSM8K no publicados).

| Metrica | Este paquete (TP1, A16) | TP1 por defecto (A4) | TP2 A16 |
|---|---|---|---|
| GPUs requeridas | 1 | 1 | 2 × Blackwell misma arquitectura |
| Peticiones concurrentes maximas | 8 | 8 | 32 |
| Cache KV al cargar | 20,1 GiB · 1.445.888 tokens KV · 157 slots | 20,1 GiB · 1.445.888 tokens KV · 157 slots | 108,1 GiB · 7.495.680 tokens KV · 811 slots |
| Plan de dispositivo compilado | 73,5 GiB (85 asignaciones) | 73,4 GiB (87 asignaciones) | 39,5 GiB por rango |
| Decodificacion, 1 stream / 8 concurrentes | 166 / 583 tok/s | 179 / 633 tok/s | 224 / 1.056 tok/s (16 concurrentes) |
| Recuperacion de aguja | exacta a 268.051 y 1.040.052 tokens | exacta | exacta |

Medido en una RTX PRO 6000 Blackwell de 96 GB por GPU, motor `6b586398`, política de scheduler por defecto, sin `--memory-limit`, tablas de embedding en RAM de host, caché de prefijo de 256 GB en host y caché fría; decodificación calculada a partir de deltas de `/metrics` sobre generaciones de historias de 600 tokens. La recuperación de aguja tardó 30,8 s a 268.051 tokens y 143,7 s a 1.040.052 tokens.

## Requisitos de hardware

- VRAM: plan de dispositivo de 73,5 GiB más 20,1 GiB de caché KV, sobre una GPU de 96 GB. El paquete empaquetado ocupa ~106,9 GB en disco.
- GPU obligatoria: GB202 (RTX PRO 6000 Blackwell, SM120). La reproducción requiere esta arquitectura; no se documenta soporte para A100, H100 ni RTX 4090.
- No cabe en GPU de consumo convencional: el plan de ejecución de 73,5 GiB excede la VRAM de cualquier RTX 4090 (24 GB) o similar.
- Despliegue: exclusivamente mediante Flare (`NVIDIA/hyperflare-inference`), compilado en la confirmación `6b586398` (2026-11-22) o posterior, con ABI de ejecución 6 y contrato de modelo preparado 2. Motores anteriores al loader del 2026-11-03 rechazan el paquete en `Prepare model`. La imagen `ghcr.io/local-inference-lab/flare:release-6f2bd11-main-20261119` sirve esta familia de paquetes. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Comando de servicio: `flare run JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-A16 --gpus 0`, con selección de exactamente 1 dispositivo.
- Throughput medido: 166 tok/s en un stream y 583 tok/s con 8 concurrentes; penalización de ~7 % frente al paquete A4 (179 / 633 tok/s).
- En hosts con SELinux es necesario añadir `--security-opt label=disable` a `docker run` y montar el core empaquetado y `publisher.json` para que el UID 10001 pueda leerlos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decodificacion medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FLARE-1M-A16 (este) | no disponible | 1.048.576 | 166 / 583 tok/s (1 / 8 concurrentes) | NVIDIA Open Model License | 1 GPU Blackwell |
| Qwen3.8-Flash-Next-FLARE-1M (A4) | no disponible | 1.048.576 | 179 / 633 tok/s (1 / 8 concurrentes) | NVIDIA Open Model License | 1 GPU Blackwell |
| Qwen3.8-Flash-Next-FLARE-1M-TP2-A16 | no disponible | 1.048.576 | 224 / 1.056 tok/s (1 / 16 concurrentes) | NVIDIA Open Model License | 2 GPU Blackwell |
| nvidia/Qwen3.8-Flash-Next-FP4-Local (base) | no disponible | 262.144 nativos | no disponible | NVIDIA Open Model License | no disponible |

La comparación con modelos de otras familias y tamaños equivalentes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado: es un paquete de runtime con un checkpoint fijado. Cualquier evaluación de calidad debe remitirse al modelo base `nvidia/Qwen3.8-Flash-Next-FP4-Local`.
- Dependencia dura de una versión concreta del motor Flare (confirmación `6b586398` o posterior) y de hardware GB202; no hay portabilidad documentada a otras GPUs ni a otros motores de inferencia.
- La extensión de contexto a 1M se logra por interpolación YaRN de factor 4 declarada en el manifiesto; no se documenta una evaluación de calidad de razonamiento a longitudes extremas más allá de la recuperación de aguja, por lo que el rendimiento en tareas complejas a 1M tokens es desconocido.
- La decodificación A16 cuesta aproximadamente un 7 % de throughput frente al paquete A4; debe elegirse solo cuando la precisión de activaciones en expertos prime sobre la velocidad.
- El paquete incluye un mecanismo de divulgación del editor y verificación de identidad que descarga `publisher.json` en cada carga en línea; la aceptación desatendida requiere pasar `--dangerously-approve-key` y `--dangerously-accept-publisher`.
- La licencia NVIDIA Open Model License impone condiciones de uso comercial que deben revisarse en el enlace oficial antes de desplegar en producción.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base en la documentación proporcionada.
- El repositorio no registra descargas ni interacciones, y su fecha de creación (2026-11-23) es inmediatamente posterior a la validación del motor, lo que indica un artefacto muy reciente y sin validación independiente.
- Los resultados de búsqueda web disponibles no contienen información relevante sobre este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-A16
- Paquete hermano TP1 por defecto (A4): https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M
- Paquete hermano TP2 A16: https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2-A16
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Licencia del modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local/blob/main/LICENSE
- Motor de inferencia Flare (NVIDIA): https://github.com/NVIDIA/hyperflare-inference
- `publisher.json` del paquete: https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-A16/blob/main/publisher.json
