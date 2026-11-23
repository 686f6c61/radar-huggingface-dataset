# JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2-A16

## Resumen

Qwen3.8-Flash-Next FLARE 1M (TP2, A16) es un paquete de despliegue preparado por JohannesBertens sobre el checkpoint `nvidia/Qwen3.8-Flash-Next-FP4-Local` (commit `b9ce18a6`), un modelo de la familia Qwen3.8-Flash-Next distribuido por NVIDIA en formato NVFP4. El paquete no contiene pesos nuevos: es un artefacto de runtime para el motor Flare (proyecto `NVIDIA/hyperflare-inference`) que empaqueta grafos CUDA capturados, plan de ejecución compilado y metadatos de serving, con el objetivo de servir el modelo con contexto extendido y decodificación especulativa optimizada.

La aportación principal es la extensión del contexto de serving desde los 262.144 tokens nativos hasta 1.048.576 tokens (1M) mediante interpolación rope de estilo YaRN con factor 4, aplicada solo en frecuencia (sin cambio de temperatura de atención), declarada de forma embebida en el paquete. Además, activa `--force-moe-decode-a16`: los expertos enrutados (MoE) en NVFP4 multiplican con activaciones de 16 bits durante decode y verificación especulativa (W4A16) en lugar de FP4 (W4A4), mientras que el prefill mantiene A4 calibrado en grafos separados.

Es relevante ahora porque demuestra que un ajuste aparentemente menor (A16 en decode) corrige un problema de latencia en la verificación especulativa que dejaba inactivo el drafting: las rondas de verificación pasan de 39-49 ms a 8-11 ms, y el decode medido sube de 136 a 224 tok/s en un solo stream y de 460 a ~1.056 tok/s con 16 peticiones concurrentes sobre dos RTX PRO 6000 Blackwell de 96 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con decodificación especulativa MTP (multi-token prediction); pesos NVFP4; rope con interpolación YaRN factor 4 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE; el paquete no declara el número de expertos ni activos) |
| Longitud de contexto | 1.048.576 tokens (1M) en serving; 262.144 nativos del checkpoint |
| Tipos de cuantizacion | NVFP4 con activaciones A16 en decode (W4A16) y A4 calibrado en prefill; pesos empaquetados ~110,1 GB |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (license: other) |
| Formato de pesos | Paquete de runtime Flare (execution ABI 6 / prepared model contract 2); payload en revisión `gb202`; checkpoint base en NVFP4 |
| Pipeline | image-text-to-text (multimodal imagen-texto) |
| Concurrencia preparada | 32 peticiones; prefill chunk 4096 |
| Especulación | MTP, 5 tokens draft por defecto, anchos 1-6, aceptación ~43-59 % |
| GPUs requeridas | 2 × misma arquitectura Blackwell (GB202 / SM120) |
| Huella medida | 39,5 GiB de plan de dispositivo por GPU; 108,1 GiB de caché KV; 7.495.680 tokens KV; 811 slots de snapshot compartidos |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia Qwen3.8-Flash-Next, publicado por NVIDIA en precisión NVFP4 y con pipeline multimodal imagen-texto. El paquete incorpora decodificación especulativa MTP con hasta 6 tokens draft y ancho por defecto de 5, gestionada por una política adaptativa del scheduler. La variante de serving `qwen3.8-flash-yarn4` aplica `RopeScaling(4.0, 262144)`, es decir, un factor 4 sobre la ventana nativa de 262.144 tokens para alcanzar 1.048.576, sin modificar la temperatura de atención.

La innovación técnica del paquete es el modo `force_moe_decode_a16`, registrado en el manifiesto de reconstrucción: los expertos enrutados en NVFP4 operan con activaciones de 16 bits en decode y verificación especulativa, mientras que el prefill conserva activaciones A4 calibradas en grafos separados. Captura por rango 112 grafos CUDA y 6.754 kernels en 6.729 módulos. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno vía API compatible con OpenAI (`/v1/chat/completions`).
- Procesamiento imagen-texto (pipeline `image-text-to-text`).
- Contexto largo de hasta 1.048.576 tokens con recuperación exacta verificada (needle retrieval exacto a 268.051 y 1.040.052 tokens).
- Decodificación especulativa MTP con drafting adaptativo (anchos 1-6, aceptación ~43-59 %).
- Serving concurrente hasta 32 peticiones con caché KV de 7.495.680 tokens y 811 slots de snapshot compartidos.
- Razonamiento multi-paso y tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto se puede ingerir un monorepo o una base de código extensa en una sola petición y hacer preguntas sobre ella, aprovechando la recuperación exacta verificada a más de un millón de tokens.
- Procesamiento de documentación legal o contractual: carga de expedientes completos (miles de páginas) para extracción de cláusulas y comparación entre documentos, sin fragmentación por chunking.
- Auditoría de logs y trazas largas: ingesta de volcados de logs de sistemas distribuidos en una única ventana para correlación de incidentes.
- Transcripción y análisis de reuniones o clases extensas: el pipeline imagen-texto permite además procesar capturas o diapositivas junto al texto.
- Serving de alto throughput en producción: con ~1.056 tok/s a 16 peticiones concurrentes y 32 de concurrencia preparada, es adecuado para backends de chat con múltiples usuarios sobre dos GPUs Blackwell.
- Investigación en contexto largo: banco de pruebas para evaluar atención sobre ventanas de 1M tokens con YaRN, midiendo degradación de recuperación y latencia (34,7 s para needle a 268k; 157,2 s a 1,04M).
- Generación asistida sobre imágenes: al ser image-text-to-text, sirve para descripción de imágenes, extracción de información de capturas o respuesta a preguntas visuales.

## Benchmarks y rendimiento

| Metrica | Este paquete (TP2, A16) | TP2 por defecto (A4) | TP1 A16 |
|---|---|---|---|
| GPUs requeridas | 2 × Blackwell | 2 | 1 |
| Peticiones concurrentes máx. | 32 | 32 | 8 |
| Caché KV en carga | 108,1 GiB · 7.495.680 tokens · 811 slots | 108,0 GiB · 7.471.104 tokens | 20,1 GiB · 1.445.888 tokens |
| Plan de dispositivo compilado | 39,5 GiB por rango (106/105 asignaciones) | 39,6 GiB por rango | 73,5 GiB |
| Decode, 1 stream / 16 concurrentes | 224 / 1.056 tok/s | 136 / 460 tok/s (especulación inactiva) | 166 / 583 tok/s (8 concurrentes) |
| Latencia de verificación especulativa | 8-11 ms | 39-49 ms | no disponible |
| Recuperación needle | exacta a 268.051 y 1.040.052 tokens | exacta | exacta |

Mediciones sobre 2 × RTX PRO 6000 Blackwell de 96 GB, motor `6b586398`, política de scheduler por defecto, sin `--memory-limit`, tablas de embedding en RAM de host, caché de prefijo de 256 GB, caché fría. Tiempos de needle: 34,7 s (268.051 tokens) y 157,2 s (1.040.052 tokens). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 2 GPUs de 96 GB cada una (RTX PRO 6000 Blackwell); plan de dispositivo de 39,5 GiB por GPU más 108,1 GiB de caché KV distribuida.
- GPU recomendadas: exclusivamente GB202 (RTX PRO 6000 Blackwell, SM120); la reproducción requiere esta arquitectura.
- No cabe en GPUs de consumo (RTX 4090, etc.): el paquete exige dos GPUs Blackwell de misma arquitectura y el replay está ligado a SM120.
- Despliegue: motor Flare compilado desde `NVIDIA/hyperflare-inference` en commit `6b586398` (2026-11-22) o posterior; imagen Docker `ghcr.io/local-inference-lab/flare:release-6f2bd11-main-20261119`; comando `flare run JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2-A16 --gpus 0,1`.
- Motores anteriores al loader de layout de ejecución del 2026-11-03 rechazan el paquete en `Prepare model` ("unsupported execution contract version").
- En hosts con SELinux añadir `--security-opt label=disable` y montar el core empaquetado y `publisher.json` para que UID 10001 pueda leerlos.
- Throughput medido: 224 tok/s en un stream, ~1.056 tok/s con 16 concurrentes; latencia de prefill para 1M tokens en torno a 157 s (medición needle).
- La primera carga muestra la divulgación del publicador; se acepta escribiendo el namespace `JohannesBertens` o con `--dangerously-approve-key` y `--dangerously-accept-publisher`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento decode | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Qwen3.8-Flash-Next FLARE 1M TP2 A16) | no disponible (MoE NVFP4) | 1.048.576 | 224 / 1.056 tok/s (1/16 concurrentes) | nvidia-open-model-agreement | Hugging Face, runtime Flare, 2 GPUs Blackwell |
| Qwen3.8-Flash-Next FLARE 1M TP2 (A4) | no disponible | 1.048.576 | 136 / 460 tok/s | nvidia-open-model-agreement | Hugging Face, runtime Flare, 2 GPUs Blackwell |
| Qwen3.8-Flash-Next FLARE 1M TP1 A16 | no disponible | 1.048.576 | 166 / 583 tok/s (8 concurrentes) | nvidia-open-model-agreement | Hugging Face, runtime Flare, 1 GPU Blackwell |
| Checkpoint base `nvidia/Qwen3.8-Flash-Next-FP4-Local` | no disponible | 262.144 | no disponible | nvidia-open-model-agreement | Hugging Face |

## Limitaciones y advertencias

- Dependencia dura del motor Flare en commit `6b586398` o posterior; versiones anteriores rechazan el paquete.
- Requiere hardware GB202 (RTX PRO 6000 Blackwell) y exactamente 2 GPUs; no es portable a otras arquitecturas ni a GPUs de consumo.
- El paquete es un artefacto de runtime, no un modelo entrenado: no añade capacidades nuevas, solo cambia el serving (contexto extendido y A16 en decode).
- La extensión de contexto a 1M mediante YaRN factor 4 puede degradar la calidad de atención en ventanas extremas; la validación publicada solo cubre recuperación needle, no razonamiento complejo a 1M.
- Latencia de prefill alta en contexto máximo: 157,2 s para un needle a 1.040.052 tokens, lo que limita su uso interactivo en ventanas de 1M.
- Licencia `nvidia-open-model-agreement`: revisar las condiciones de uso comercial antes de desplegar en producción.
- El paquete incluye un mecanismo de divulgación de publicador con verificación de `publisher.json` en cada carga online; la carga desatendida requiere aceptar explícitamente claves y namespace.
- Sin datos publicados de benchmarks de calidad (MMLU, HumanEval, GSM8K) ni de idiomas soportados; riesgo de alucinación y sesgos no caracterizados en la información disponible.
- El repositorio `main` solo contiene metadatos; el payload real vive en la revisión `gb202`, lo que puede confundir a herramientas que descarguen la rama principal.

## Enlaces

- Hugging Face (este paquete): https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2-A16
- Checkpoint base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Paquete TP2 por defecto (A4): https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2
- Paquete TP1 A16: https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-A16
- Repositorio del motor Flare: https://github.com/NVIDIA/hyperflare-inference
- Licencia: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
